(function () {
  const sections = [
    'resumen', 'contexto', 'alcance', 'arquitectura', 'fases',
    'requerimientos', 'fallback', 'proximos-pasos', 'equipo', 'diseno-mesa'
  ];

  const links = document.querySelectorAll('.sidebar-link');
  const progressLabel = document.getElementById('progress-label');
  const total = sections.length;

  if (!links.length) return;

  const sectionEls = sections
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActive(id) {
    const index = sections.indexOf(id);
    if (index === -1) return;

    links.forEach((link, i) => {
      link.classList.toggle('active', i === index);
      link.classList.toggle('passed', i < index);
    });

    if (progressLabel) {
      progressLabel.textContent = `${index + 1} / ${total}`;
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] }
  );

  sectionEls.forEach((el) => observer.observe(el));

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

  if (location.hash) {
    const id = location.hash.slice(1);
    if (sections.includes(id)) setActive(id);
  } else {
    setActive(sections[0]);
  }
})();
