// Rotating promo banner. Content lives in /assets/data/banners.json.
// Pauses on hover/focus, respects reduced motion, dismissible for the session.
(function () {
  const KEY = 'vr_banner_closed';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '/assets/css/banner.css';
  document.head.appendChild(css);

  // Banner promos come from banners.json; the newest fetched grant and news item are added automatically.
  const get = (u) => fetch(u).then((r) => (r.ok ? r.json() : Promise.reject()));
  Promise.all([get('/assets/data/banners.json'), get('/blog/posts.json').catch(() => [])])
    .then(([data, posts]) => init(data, posts))
    .catch(() => {});

  function fresh(posts, now) {
    const clip = (t) => (t.length > 78 ? t.slice(0, 75).replace(/\s+\S*$/, '') + '…' : t);
    const recent = (Array.isArray(posts) ? posts : []).filter((p) => p && /^[a-z0-9-]+$/i.test(p.id || '') && p.title && now - new Date(p.date).getTime() < 14 * 864e5)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const out = [];
    const g = recent.find((p) => p.kind === 'grants'), n = recent.find((p) => p.kind === 'news');
    if (n) out.push({ badge: 'Tech news', text: clip(n.title), cta: 'Read', href: '/blog/p/' + n.id + '.html' });
    if (g) out.push({ badge: 'Grant', text: clip(g.title), cta: 'Details', href: '/blog/p/' + g.id + '.html' });
    return out;
  }

  function init(data, posts) {
    const now = Date.now();
    const items = (data.items || []).filter((i) => i.text && (!i.until || new Date(i.until).getTime() > now));
    items.splice(1, 0, ...fresh(posts, now));
    if (!items.length) return;

    const bar = document.createElement('aside');
    bar.className = 'promo-banner';
    bar.setAttribute('aria-label', 'Announcements');
    const inner = document.createElement('div');
    inner.className = 'promo-inner';
    const mk = (cls, label, txt) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'promo-btn ' + cls; b.setAttribute('aria-label', label); b.textContent = txt;
      return b;
    };
    const prev = mk('promo-prev', 'Previous announcement', '‹');
    const next = mk('promo-next', 'Next announcement', '›');
    const close = mk('promo-close', 'Dismiss announcements', '✕');
    const stage = document.createElement('div');
    stage.className = 'promo-stage';

    const slides = items.map((it) => {
      const d = document.createElement('div');
      d.className = 'promo-slide';
      if (it.badge) { const g = document.createElement('span'); g.className = 'promo-badge'; g.textContent = it.badge; d.appendChild(g); }
      const t = document.createElement('span');
      t.className = 'promo-text';
      t.textContent = it.text;
      d.appendChild(t);
      if (it.href && it.cta && /^(\/|https?:\/\/)/.test(it.href)) {
        const a = document.createElement('a');
        a.href = it.href; a.textContent = it.cta;
        d.appendChild(a);
      }
      stage.appendChild(d);
      return d;
    });

    inner.append(prev, stage, next);
    bar.append(inner, close);

    // Placement: after the site header component, or after the hero on the homepage.
    const header = document.getElementById('site-header');
    const hero = document.querySelector('section.hero');
    const nav = document.getElementById('nav'); // homepage: fixed menu, so the banner goes above it
    let syncNav = null;
    if (header) header.insertAdjacentElement('afterend', bar);
    else if (nav && hero) {
      document.body.insertAdjacentElement('afterbegin', bar);
      nav.style.transition = 'padding .3s ease, background .3s ease';
      syncNav = () => { nav.style.top = Math.max(0, bar.offsetHeight - window.scrollY) + 'px'; };
      syncNav(); addEventListener('scroll', syncNav, { passive: true }); addEventListener('resize', syncNav);
      if ('ResizeObserver' in window) new ResizeObserver(syncNav).observe(bar);
    }
    else if (hero) hero.insertAdjacentElement('afterend', bar);
    else document.body.insertAdjacentElement('afterbegin', bar);

    let i = 0, timer = null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function show(n) {
      const old = slides[i];
      i = (n + slides.length) % slides.length;
      if (old !== slides[i]) { old.classList.remove('is-active'); old.classList.add('is-out'); setTimeout(() => old.classList.remove('is-out'), 560); }
      slides[i].classList.add('is-active');
    }
    const start = () => { if (!reduce && slides.length > 1 && !timer) timer = setInterval(() => show(i + 1), data.interval || 6000); };
    const stop = () => { clearInterval(timer); timer = null; };
    show(0);
    start();
    prev.addEventListener('click', () => show(i - 1));
    next.addEventListener('click', () => show(i + 1));
    bar.addEventListener('mouseenter', stop); bar.addEventListener('mouseleave', start);
    bar.addEventListener('focusin', stop); bar.addEventListener('focusout', start);
    close.addEventListener('click', () => { stop(); bar.remove(); if (syncNav) { removeEventListener('scroll', syncNav); removeEventListener('resize', syncNav); nav.style.top = ''; } try { sessionStorage.setItem(KEY, '1'); } catch (e) {} });
  }
})();
