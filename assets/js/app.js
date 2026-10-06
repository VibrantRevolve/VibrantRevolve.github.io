/* VibrantRevolve app layer. Progress bar, mobile tab bar, command palette (Ctrl/Cmd+K), install prompt, offline support. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const path = location.pathname.replace(/index\.html$/, '');
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone()) document.documentElement.classList.add('is-app');
  const ico = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
    svc: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    tools: '<path d="M12 3v18"/><path d="M8 5h4M12 8h4M8 11h4M12 14h4M8 17h4"/>',
    work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    dl: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'
  };

  /* 1. Scroll progress */
  const bar = document.createElement('div'); bar.className = 'vr-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
  document.body.appendChild(bar); const fill = bar.firstChild; let tick = false;
  const upd = () => { tick = false; const h = document.documentElement.scrollHeight - innerHeight; fill.style.transform = 'scaleX(' + (h > 4 ? Math.min(1, scrollY / h) : 0) + ')'; };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();

  /* 2. Mobile tab bar */
  const on = (p) => p === '/' ? path === '/' : path.indexOf(p) === 0;
  const tabs = [
    { l: 'Home', h: '/', i: I.home, a: path === '/' },
    { l: 'Services', h: '/services/', i: I.svc, a: on('/services/') },
    { l: 'Tools', h: '/tools/', i: I.tools, a: on('/tools/') || on('/brand-studio/'), main: true },
    { l: 'Work', h: '/portfolio/', i: I.work, a: on('/portfolio/') },
    { l: 'Contact', h: '/contact/', i: I.mail, a: on('/contact/') }
  ];
  const nav = document.createElement('nav'); nav.className = 'vr-tabbar'; nav.setAttribute('aria-label', 'App navigation');
  tabs.forEach((t) => {
    const el = document.createElement(t.main ? 'button' : 'a'); el.className = 'vr-tab' + (t.main ? ' vr-tab--main' : '');
    if (t.main) { el.type = 'button'; el.setAttribute('aria-haspopup', 'dialog'); el.innerHTML = `<span class="vr-orb">${ico(t.i)}</span><span class="l">${t.l}</span>`; el.onclick = (e) => { e.stopPropagation(); if (window.VRTools && window.VRTools.open) window.VRTools.open(); else location.href = t.h; }; }
    else { el.href = t.h; el.innerHTML = ico(t.i) + `<span>${t.l}</span>`; }
    if (t.a) el.setAttribute('aria-current', 'page');
    nav.appendChild(el);
  });
  document.body.appendChild(nav);
  // Lift the fixed floating theme button (homepage) above the bar
  const lift = () => { const tt = $('.theme-toggle'); if (tt && getComputedStyle(tt).position === 'fixed') tt.classList.add('vr-lift'); };
  addEventListener('load', lift); setTimeout(lift, 1200);

  /* 3. Install prompt */
  let deferred = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; document.querySelectorAll('.vr-install').forEach((b) => b.classList.add('show')); });
  addEventListener('appinstalled', () => { deferred = null; document.querySelectorAll('.vr-install').forEach((b) => b.classList.remove('show')); });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone();
  const install = async () => {
    if (deferred) { deferred.prompt(); try { await deferred.userChoice; } catch (e) {} deferred = null; document.querySelectorAll('.vr-install').forEach((b) => b.classList.remove('show')); }
    else if (ios) toast('On iPhone: tap Share, then "Add to Home Screen".');
  };
  function toast(m) { const t = document.createElement('div'); t.className = 'vt-toast'; t.textContent = m; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('show')); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3800); }
  const mountInstall = () => {
    const host = $('.footer-bottom') || $('.footer-bottom-inner') || $('footer'); if (!host || $('.vr-install')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'vr-install' + (deferred ? ' show' : ''); b.innerHTML = ico(I.dl).replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') + ' Install the app'; b.onclick = install; host.appendChild(b);
    if (ios) b.classList.add('show');
  };
  addEventListener('load', () => setTimeout(mountInstall, 600));

  /* 4. Command palette */
  const ITEMS = [
    ['Go to', 'Home', '/', I.home, 'start main'], ['Go to', 'About', '/about.html', I.page, 'who us team'], ['Go to', 'Services', '/services/', I.svc, 'what we do'],
    ['Go to', 'Web development', '/services/web-development.html', I.page, 'website design build'], ['Go to', 'Software development', '/services/software-development.html', I.page, 'app automation saas'],
    ['Go to', 'Graphic design', '/services/graphic-design.html', I.page, 'logo brand identity'], ['Go to', 'Content writing', '/services/content-writing.html', I.page, 'copy blog seo'],
    ['Go to', 'Digital marketing', '/services/digital-marketing.html', I.page, 'ads seo email'], ['Go to', 'CV creation', '/services/cv-creation.html', I.page, 'resume job'],
    ['Go to', 'Portfolio', '/portfolio/', I.work, 'work projects clients'], ['Go to', 'Pricing', '/pricing/', I.page, 'cost packages price'], ['Go to', 'Store', '/store/', I.page, 'templates buy products'],
    ['Go to', 'Blog', '/blog/', I.page, 'tech radar news'], ['Go to', 'Book a call', '/book/', I.page, 'schedule meeting'], ['Go to', 'Contact', '/contact/', I.mail, 'quote email message'],
    ['Studio tools', 'All tools', '/tools/', I.tools, 'hub'], ['Studio tools', 'Brand Studio', '/brand-studio/', I.tools, 'brand brief pdf logo palette'], ['Studio tools', 'Logo Maker', '/tools/logo-maker/', I.tools, 'logo mark'],
    ['Studio tools', 'Name Generator', '/tools/name-generator/', I.tools, 'business name ideas'], ['Studio tools', 'Copy Writer', '/tools/copy-writer/', I.tools, 'taglines bio captions'], ['Studio tools', 'Palette Extractor', '/tools/palette-extractor/', I.tools, 'colours from image'],
    ['Studio tools', 'Invoice Maker', '/tools/invoice/', I.tools, 'quote receipt'], ['Studio tools', 'QR Code Maker', '/tools/qr-code/', I.tools, 'qr whatsapp wifi']
  ].map((x) => ({ g: x[0], t: x[1], h: x[2], i: x[3], k: x[4] }));
  const cfg = () => window.VR_CONFIG || {};
  const ACTIONS = () => {
    const a = [
      { g: 'Actions', t: 'Chat on WhatsApp', i: I.wa, k: 'message whatsapp', run: () => window.open('https://wa.me/' + (cfg().whatsapp || '2349012739299'), '_blank', 'noopener') },
      { g: 'Actions', t: 'Email us', i: I.mail, k: 'email mail', run: () => { location.href = 'mailto:' + (cfg().supportEmail || 'vr@vibrantrevolve.com'); } },
      { g: 'Actions', t: 'Switch light / dark theme', i: I.moon, k: 'theme dark light mode', run: () => { const t = $('#theme-toggle'); if (t) t.click(); else { const r = document.documentElement; const n = r.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; r.setAttribute('data-theme', n); try { localStorage.setItem('theme', n); } catch (e) {} } } }
    ];
    if (deferred || ios) a.push({ g: 'Actions', t: 'Install the app', i: I.dl, k: 'install app home screen', run: install });
    return a;
  };
  let pal, inp, list, sel = 0, shown = [], lastFocus;
  function build() {
    pal = document.createElement('div'); pal.className = 'vr-pal'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-modal', 'true'); pal.setAttribute('aria-label', 'Search VibrantRevolve');
    pal.innerHTML = `<div class="vr-pal-box"><div class="vr-pal-in">${ico(I.search)}<input type="text" placeholder="Search pages, tools and actions" aria-label="Search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="vr-pal-list"><kbd>Esc</kbd></div><div class="vr-pal-list" id="vr-pal-list" role="listbox"></div></div>`;
    document.body.appendChild(pal); inp = $('input', pal); list = $('.vr-pal-list', pal);
    pal.addEventListener('mousedown', (e) => { if (e.target === pal) close(); });
    inp.addEventListener('input', () => { sel = 0; paint(); });
    pal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
  }
  function paint() {
    const q = inp.value.trim().toLowerCase().split(/\s+/).filter(Boolean), all = ITEMS.concat(ACTIONS());
    shown = all.filter((x) => q.every((w) => (x.t + ' ' + x.k + ' ' + x.g).toLowerCase().indexOf(w) > -1));
    const best = (x) => q.length && x.t.toLowerCase().indexOf(q[0]) === 0;
    shown = shown.filter(best).concat(shown.filter((x) => !best(x)));
    list.innerHTML = ''; let g = '';
    if (!shown.length) { list.innerHTML = '<div class="vr-pal-empty">Nothing found. Try "pricing", "logo" or "contact".</div>'; return; }
    shown.forEach((x, n) => {
      const gl = best(x) ? 'Best match' : x.g;
      if (gl !== g) { g = gl; const h = document.createElement('div'); h.className = 'vr-pal-h'; h.textContent = g; list.appendChild(h); }
      const b = document.createElement('button'); b.type = 'button'; b.className = 'vr-pal-i'; b.id = 'vr-pi-' + n; b.setAttribute('role', 'option'); b.innerHTML = ico(x.i); const s = document.createElement('span'); s.textContent = x.t; b.appendChild(s);
      if (x.h) { const sm = document.createElement('small'); sm.textContent = x.h.replace(/^\//, '').replace(/\/$/, '') || 'home'; b.appendChild(sm); }
      b.onmousemove = () => { if (sel !== n) { sel = n; mark(); } }; b.onclick = () => go(x); list.appendChild(b);
    });
    mark();
  }
  function mark() { list.querySelectorAll('.vr-pal-i').forEach((b, n) => { const on = n === sel; b.setAttribute('aria-selected', String(on)); if (on) { b.scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', b.id); } }); }
  function go(x) { if (!x) return; close(); if (x.run) setTimeout(x.run, 30); else location.href = x.h; }
  function open() { if (!pal) build(); lastFocus = document.activeElement; inp.value = ''; sel = 0; paint(); pal.classList.add('open'); document.documentElement.style.overflow = 'hidden'; setTimeout(() => inp.focus(), 20); }
  function close() { if (!pal) return; pal.classList.remove('open'); document.documentElement.style.overflow = ''; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
  window.VRSearch = { open, close };
  addEventListener('keydown', (e) => {
    const typing = /^(input|textarea|select)$/i.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal && pal.classList.contains('open') ? close() : open(); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); open(); }
  });
  // Header search chip (pages with the shared header)
  const chip = () => {
    const h = $('.header-actions'); if (!h || $('.vr-k')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'vr-k'; b.setAttribute('aria-label', 'Search the site'); b.innerHTML = ico(I.search) + '<span>Search</span><kbd>' + (/mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K') + '</kbd>'; b.onclick = open;
    h.insertBefore(b, h.firstChild);
  };
  addEventListener('load', () => { chip(); setTimeout(chip, 500); });

  /* 5. Offline support */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
})();
