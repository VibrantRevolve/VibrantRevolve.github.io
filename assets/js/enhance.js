// Small behaviours for the visual layer. Everything degrades gracefully.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js-ready');

  // Header tightens once you scroll
  const onScroll = () => { const h = document.querySelector('.site-header'); if (h) h.classList.toggle('is-scrolled', scrollY > 24); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Cursor spotlight on cards
  const CARD = '.card,.service-card,.pricing-card,.portfolio-item,.testimonial-card';
  if (!reduce) document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest(CARD);
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // Staggered reveal for cards, including ones rendered later from JSON
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.08 }) : null;
  const seen = new WeakSet();
  const scan = () => {
    document.querySelectorAll('main ' + CARD.split(',').join(', main ')).forEach((el, i) => {
      if (seen.has(el) || el.closest('.modal')) return;
      seen.add(el);
      if (!io) return;
      el.classList.add('reveal-item');
      el.style.transitionDelay = Math.min((i % 6) * 60, 300) + 'ms';
      io.observe(el);
    });
  };
  scan();
  new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  // Safety net: never leave content hidden
  setTimeout(() => document.querySelectorAll('.reveal-item:not(.in)').forEach((el) => el.classList.add('in')), 4000);
})();
