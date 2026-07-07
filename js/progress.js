(function () {
  const sections = [
    'resumen', 'contexto', 'alcance', 'arquitectura', 'fases',
    'requerimientos', 'fallback', 'proximos-pasos', 'equipo', 'diseno-mesa'
  ];

  const links = Array.from(document.querySelectorAll('.sidebar-link'));
  const progressLabel = document.getElementById('progress-label');
  const fillEl = document.getElementById('sidebar-fill');
  const indicatorEl = document.getElementById('sidebar-indicator');
  const trackEl = document.getElementById('sidebar-nav');
  const total = sections.length;

  if (!links.length || !trackEl) return;

  const sectionEls = sections
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let dotCenters = [];
  let lineHeight = 0;
  let ticking = false;

  function measure() {
    const trackRect = trackEl.getBoundingClientRect();
    dotCenters = links.map((link) => {
      const dot = link.querySelector('.sidebar-dot');
      const r = dot.getBoundingClientRect();
      return r.top - trackRect.top + r.height / 2;
    });

    const line = trackEl.querySelector('.sidebar-line');
    if (line) {
      const lr = line.getBoundingClientRect();
      lineHeight = lr.height;
    } else if (dotCenters.length > 1) {
      lineHeight = dotCenters[dotCenters.length - 1] - dotCenters[0];
    }
  }

  function getScrollState() {
    const anchor = window.scrollY + window.innerHeight * 0.32;
    let index = 0;
    let fraction = 0;

    for (let i = 0; i < sectionEls.length; i++) {
      const start = sectionEls[i].offsetTop;
      const end = i < sectionEls.length - 1
        ? sectionEls[i + 1].offsetTop
        : document.documentElement.scrollHeight - window.innerHeight * 0.5;

      if (anchor < start && i === 0) break;

      if (anchor >= start) {
        index = i;
        const span = Math.max(end - start, 1);
        fraction = Math.min(1, Math.max(0, (anchor - start) / span));
      }
    }

    const overall = sectionEls.length > 1
      ? (index + fraction) / (sectionEls.length - 1)
      : 0;

    return { index, fraction, overall };
  }

  function lerpY(overall) {
    if (dotCenters.length < 2) return dotCenters[0] || 0;

    const scaled = overall * (dotCenters.length - 1);
    const i = Math.min(Math.floor(scaled), dotCenters.length - 2);
    const t = scaled - i;
    return dotCenters[i] + (dotCenters[i + 1] - dotCenters[i]) * t;
  }

  function update() {
    measure();

    const { index, fraction, overall } = getScrollState();

    links.forEach((link, i) => {
      const isActive = i === index;
      const isPassed = i < index || (i === index && fraction > 0.15);

      link.classList.toggle('active', isActive);
      link.classList.toggle('passed', isPassed && !isActive);
    });

    if (fillEl && dotCenters.length > 1) {
      const fillTop = dotCenters[0];
      const y = lerpY(overall);
      const fillPx = Math.max(0, y - fillTop);
      fillEl.style.height = `${fillPx}px`;
    }

    if (indicatorEl && dotCenters.length) {
      const y = lerpY(overall);
      indicatorEl.style.transform = `translateY(${y - 9.5}px)`;
    }

    if (progressLabel) {
      const display = Math.min(total, Math.max(1, Math.round(index + fraction + 0.15)));
      const pct = Math.round(overall * 100);
      progressLabel.textContent = `${display} / ${total} · ${pct}%`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    update();
  });

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  });

  if (location.hash && sections.includes(location.hash.slice(1))) {
    setTimeout(() => {
      const target = document.querySelector(location.hash);
      if (target) target.scrollIntoView({ block: 'start' });
      update();
    }, 100);
  } else {
    update();
  }
})();
