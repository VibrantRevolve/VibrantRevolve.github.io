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

  /* 3. Install the app. The button is always available unless the app is already installed. */
  let deferred = window.__vrBIP || null;
  const FLAG = 'vr_installed', SNOOZE = 'vr_install_snooze';
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const installed = () => isStandalone() || lsGet(FLAG) === '1';
  const ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1), android = /android/i.test(ua);
  const br = /edg\//i.test(ua) ? 'edge' : /samsungbrowser/i.test(ua) ? 'samsung' : /firefox|fxios/i.test(ua) ? 'firefox' : /opr\/|opera/i.test(ua) ? 'opera' : /chrome|crios/i.test(ua) ? 'chrome' : /safari/i.test(ua) ? 'safari' : 'other';
  const toast = (m) => { const t = document.createElement('div'); t.className = 'vr-toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('show')); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3800); };
  const steps = () => {
    if (ios) return ['Tap the Share button (the square with an arrow) in your browser.', 'Scroll down and tap "Add to Home Screen".', 'Tap "Add". The VibrantRevolve icon appears on your home screen.'];
    if (android) return br === 'firefox' ? ['Tap the menu (three dots).', 'Tap "Install".', 'Confirm. The app appears on your home screen.'] : br === 'samsung' ? ['Tap the menu (three lines).', 'Tap "Add page to" then "Home screen".', 'Confirm to finish.'] : ['Tap the menu (three dots) at the top right.', 'Tap "Install app" or "Add to Home screen".', 'Confirm. The app appears on your home screen.'];
    if (br === 'chrome' || br === 'edge') return ['Look for the install icon at the right end of the address bar, or open the browser menu.', 'Choose "Install VibrantRevolve" (Chrome) or "Apps, then Install this site as an app" (Edge).', 'Confirm. It opens in its own window and shows in your apps.'];
    if (br === 'safari') return ['In the menu bar choose File, then "Add to Dock".', 'Confirm. It opens like a normal app from your Dock.'];
    return ['Open this site in Chrome, Edge or Safari.', 'Use the browser menu and choose "Install app" or "Add to Home Screen".'];
  };
  let sheet = null, sheetFocus = null;
  function closeSheet() { if (!sheet) return; sheet.remove(); sheet = null; document.removeEventListener('keydown', escSheet); if (sheetFocus && sheetFocus.focus) sheetFocus.focus(); }
  function escSheet(e) { if (e.key === 'Escape') closeSheet(); }
  function openSheet() {
    if (sheet) return; sheetFocus = document.activeElement;
    sheet = document.createElement('div'); sheet.className = 'vr-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Install the VibrantRevolve app');
    const can = !!deferred;
    sheet.innerHTML = `<div class="vr-sheet-box"><button type="button" class="vr-sheet-x" aria-label="Close">&times;</button>
      <img src="/assets/images/favicon/icon-192.png" alt="" width="64" height="64"><h2>Get the VibrantRevolve app</h2>
      <ul class="vr-perks"><li>Opens full screen like a real app</li><li>Free tools keep working offline</li><li>Faster on slow networks</li><li>No app store, no download size</li></ul>
      ${can ? '<button type="button" class="vr-go">Install now</button>' : '<ol class="vr-steps">' + steps().map((x) => '<li>' + x + '</li>').join('') + '</ol>'}
      <button type="button" class="vr-later">Maybe later</button></div>`;
    document.body.appendChild(sheet);
    sheet.addEventListener('mousedown', (e) => { if (e.target === sheet) closeSheet(); });
    sheet.querySelector('.vr-sheet-x').onclick = closeSheet; sheet.querySelector('.vr-later').onclick = closeSheet;
    const go = sheet.querySelector('.vr-go'); if (go) go.onclick = () => { closeSheet(); install(); };
    document.addEventListener('keydown', escSheet); (go || sheet.querySelector('.vr-sheet-x')).focus();
  }
  async function install() {
    if (deferred) { const d = deferred; deferred = null; try { d.prompt(); const c = await d.userChoice; if (c && c.outcome === 'accepted') { lsSet(FLAG, '1'); toast('Installing VibrantRevolve…'); } } catch (e) {} refresh(); }
    else openSheet();
  }
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; window.__vrBIP = e; refresh(); });
  addEventListener('appinstalled', () => { lsSet(FLAG, '1'); deferred = null; closeSheet(); refresh(); toast('VibrantRevolve is installed. Open it from your home screen.'); });
  function refresh() {
    const hide = installed();
    document.querySelectorAll('.vr-install,.vr-appbtn').forEach((b) => b.classList.toggle('show', !hide));
    if (hide) { const bn = $('.vr-installbar'); if (bn) bn.remove(); }
  }
  const mountInstall = () => {
    if (installed()) return;
    const host = $('.footer-bottom') || $('.footer-bottom-inner') || $('footer');
    if (host && !$('.vr-install')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'vr-install show'; b.innerHTML = ico(I.dl).replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') + ' Install the app'; b.onclick = install; host.appendChild(b); }
    const h = $('.header-actions'), nl = $('.nav-links');
    if ((h || nl) && !$('.vr-appbtn')) { const b = document.createElement('button'); b.type = 'button'; b.className = 'vr-appbtn show'; b.setAttribute('aria-label', 'Install the VibrantRevolve app'); b.title = 'Install the app'; b.innerHTML = ico(I.dl) + '<span>App</span>'; b.onclick = install; if (h) h.insertBefore(b, h.firstChild); else nl.insertBefore(b, $('.nav-cta', nl) || null); }
  };
  // Friendly install bar: after a little engagement, never in the app, snoozed for 14 days after "x"
  function maybeBar() {
    if (installed() || $('.vr-installbar') || /^\/(admin|payment|offline)/.test(path)) return;
    const snoozed = +lsGet(SNOOZE) || 0; if (Date.now() < snoozed) return;
    const views = (+lsGet('vr_views') || 0) + 1; lsSet('vr_views', String(views)); if (views < 2) return;
    setTimeout(() => {
      if (installed() || $('.vr-installbar') || sheet) return;
      const bar = document.createElement('div'); bar.className = 'vr-installbar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Install the app');
      bar.innerHTML = `<img src="/assets/images/favicon/icon-192.png" alt="" width="40" height="40"><div><b>Install the VibrantRevolve app</b><span>Free tools, offline, one tap from your home screen.</span></div><button type="button" class="vr-ib-go">Install</button><button type="button" class="vr-ib-x" aria-label="Not now">&times;</button>`;
      document.body.appendChild(bar); requestAnimationFrame(() => bar.classList.add('show'));
      bar.querySelector('.vr-ib-go').onclick = () => { bar.remove(); install(); };
      bar.querySelector('.vr-ib-x').onclick = () => { lsSet(SNOOZE, String(Date.now() + 14 * 864e5)); bar.classList.remove('show'); setTimeout(() => bar.remove(), 300); };
    }, 9000);
  }
  addEventListener('load', () => { setTimeout(() => { mountInstall(); refresh(); }, 600); maybeBar(); });
  // Online / offline awareness (the tools keep working offline)
  addEventListener('offline', () => toast('You are offline. The free tools still work.'));
  addEventListener('online', () => toast('Back online.'));

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
    ['Studio tools', 'Invoice Maker', '/tools/invoice/', I.tools, 'quote receipt'], ['Studio tools', 'QR Code Maker', '/tools/qr-code/', I.tools, 'qr whatsapp wifi'],
    ['Studio tools', 'Image Compressor', '/tools/image-compressor/', I.tools, 'compress resize reduce photo size kb jpg passport'], ['Studio tools', 'PDF Tools', '/tools/pdf-tools/', I.tools, 'pdf images to pdf shrink compress merge'], ['Studio tools', 'WhatsApp Link Maker', '/tools/whatsapp-link/', I.tools, 'whatsapp wa.me link button chat widget qr'],
    ['Studio tools', 'Flyer & Post Maker', '/tools/post-maker/', I.tools, 'flyer poster instagram social post hashtags caption trending design'], ['Studio tools', 'CV Builder', '/tools/cv-builder/', I.tools, 'cv resume curriculum vitae job pdf'],
    ['Studio tools', 'Voice Studio', '/tools/voice-studio/', I.tools, 'voice speech to text dictation captions srt text to speech audio transcribe youtube podcast'],
    ['Studio tools', 'Video Studio', '/tools/video-studio/', I.tools, 'video maker slideshow reels tiktok status youtube captions images script'],
    ['Studio tools', 'Business Calculators', '/tools/calculators/', I.tools, 'margin vat tax loan break-even discount currency calculator profit markup'],
    ['Studio tools', 'Receipt Maker', '/tools/receipt-maker/', I.tools, 'receipt payment proof paid amount in words'],
    ['Studio tools', 'Business Card Maker', '/tools/business-card/', I.tools, 'business card visiting card qr print'],
    ['Studio tools', 'Price List Maker', '/tools/price-list/', I.tools, 'price list catalogue menu products whatsapp'],
    ['Studio tools', 'Cover Letter Writer', '/tools/cover-letter/', I.tools, 'cover letter job application ai write'],
    ['Studio tools', 'Link-in-Bio Maker', '/tools/link-in-bio/', I.tools, 'link in bio linktree instagram tiktok page']
  ].map((x) => ({ g: x[0], t: x[1], h: x[2], i: x[3], k: x[4] }));
  const cfg = () => window.VR_CONFIG || {};
  const ACTIONS = () => {
    const a = [
      { g: 'Actions', t: 'Chat on WhatsApp', i: I.wa, k: 'message whatsapp', run: () => window.open('https://wa.me/' + (cfg().whatsapp || '2349012739299'), '_blank', 'noopener') },
      { g: 'Actions', t: 'Email us', i: I.mail, k: 'email mail', run: () => { location.href = 'mailto:' + (cfg().supportEmail || 'vr@vibrantrevolve.com'); } },
      { g: 'Actions', t: 'Switch light / dark theme', i: I.moon, k: 'theme dark light mode', run: () => { const t = $('#theme-toggle'); if (t) t.click(); else { const r = document.documentElement; const n = r.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; r.setAttribute('data-theme', n); try { localStorage.setItem('vr_theme', n); } catch (e) {} } } }
    ];
    if (!installed()) a.push({ g: 'Actions', t: 'Install the app', i: I.dl, k: 'install app home screen download phone', run: install });
    if (navigator.share) a.push({ g: 'Actions', t: 'Share VibrantRevolve', i: I.mail, k: 'share send friend link', run: () => navigator.share({ title: 'VibrantRevolve', text: 'Websites, brand design and free business tools.', url: location.origin }).catch(() => {}) });
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
    const had = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; toast('Updated to the latest version.'); } });
  }

  /* 5b. Cloudflare Web Analytics (cookie-free), only when a token is set in site-config.js */
  (function () {
    const go = () => { const t = (window.VR_CONFIG || {}).cfAnalyticsToken; if (!t || document.querySelector('script[data-cf-beacon]')) return;
      const s = document.createElement('script'); s.defer = true; s.src = 'https://static.cloudflareinsights.com/beacon.min.js'; s.setAttribute('data-cf-beacon', JSON.stringify({ token: t })); document.head.appendChild(s); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  })();

  /* 6. Floating blog button: journal and pen, with a "new post" signal */
  (function () {
    if (/^\/(blog|payment|admin|offline)/.test(path) || document.querySelector('.vr-blogfab')) return;
    const a = document.createElement('a'); a.className = 'vr-blogfab'; a.href = '/blog/'; a.setAttribute('aria-label', 'Read the VibrantRevolve blog');
    a.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path class="bk" d="M6 6.5A2.5 2.5 0 0 1 8.5 4H22v21H8.5A2.5 2.5 0 0 0 6 27.5z"/><path class="bk" d="M6 27.5A2.5 2.5 0 0 0 8.5 30H22v-5"/><path class="ln" d="M11 10h7M11 14h7M11 18h4"/><g class="pen"><path d="M17.5 24.5l1-3.6L27 12.4a1.9 1.9 0 0 1 2.7 2.7l-8.5 8.5z"/><path d="M26 13.4l2.7 2.7"/></g></svg><b>Blog</b><i class="dot" hidden></i>';
    document.body.appendChild(a);
    let latest = 0; const KEY = 'vr_blog_seen';
    const seen = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
    fetch('/blog/posts.json', { cache: 'no-cache' }).then((r) => r.json()).then((l) => {
      latest = Math.max.apply(null, (l || []).map((p) => Date.parse(p.date) || 0));
      if (latest > seen() && navigator.setAppBadge) { try { navigator.setAppBadge(1); } catch (e) {} }
      if (latest > seen()) { a.querySelector('.dot').hidden = false; a.classList.add('is-new'); a.setAttribute('aria-label', 'Read the VibrantRevolve blog, new posts'); }
    }).catch(() => {});
    a.addEventListener('click', () => { try { localStorage.setItem(KEY, String(latest || Date.now())); } catch (e) {} if (navigator.clearAppBadge) { try { navigator.clearAppBadge(); } catch (e) {} } });
  })();
})();
