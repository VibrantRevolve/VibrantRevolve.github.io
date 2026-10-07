/* VibrantRevolve Studio Tools: registry + the "zip" tray.
   Loaded on every page. Adds a Tools button to the header; clicking it unzips a tray of tools. */
(function () {
  const ico = (p) => '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  const TOOLS = [
    { id: 'brand-studio', name: 'Brand Studio', url: '/brand-studio/', tag: 'Flagship', blurb: 'Colours, fonts, logo and voice. Export a ready-to-send PDF brand brief.', icon: ico('<circle cx="13.5" cy="6.5" r=".6"/><circle cx="17.5" cy="10.5" r=".6"/><circle cx="8.5" cy="7.5" r=".6"/><circle cx="6.5" cy="12.5" r=".6"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>') },
    { id: 'logo-maker', name: 'Logo Maker', url: '/tools/logo-maker/', tag: 'New', blurb: 'Eight logo directions for your name. Download PNG, SVG or a logo sheet.', icon: ico('<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 8l4 2.3v4.4L12 17l-4-2.3v-4.4z"/>') },
    { id: 'name-generator', name: 'Name Generator', url: '/tools/name-generator/', tag: 'New', blurb: 'Fresh business names with handle ideas. Shortlist and export.', icon: ico('<path d="M12 3l1.9 4.6 4.6 1.9-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>') },
    { id: 'copy-writer', name: 'Copy Writer', url: '/tools/copy-writer/', tag: 'New', blurb: 'Taglines, bios, pitches and captions written in your brand voice.', icon: ico('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>') },
    { id: 'palette-extractor', name: 'Palette Extractor', url: '/tools/palette-extractor/', tag: 'New', blurb: 'Pull a colour palette from any image or logo, with contrast checks.', icon: ico('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>') },
    { id: 'invoice', name: 'Invoice Maker', url: '/tools/invoice/', tag: 'New', blurb: 'Clean, branded invoices and quotes as PDF. ₦, $, £ or €.', icon: ico('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') },
    { id: 'qr-code', name: 'QR Code Maker', url: '/tools/qr-code/', tag: 'New', blurb: 'Branded QR codes for links, WhatsApp, Wi-Fi and contacts. Print-ready.', icon: ico('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>') },
    { id: 'image-compressor', name: 'Image Compressor', url: '/tools/image-compressor/', tag: 'New', blurb: "Shrink and resize photos for portals, email and WhatsApp. Set a target size in KB.", icon: ico('<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>') },
    { id: 'pdf-tools', name: 'PDF Tools', url: '/tools/pdf-tools/', tag: 'New', blurb: "Turn images into one PDF, or make a heavy PDF small enough to send.", icon: ico('<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6M9 15l3 3 3-3"/>') },
    { id: 'whatsapp-link', name: 'WhatsApp Link Maker', url: '/tools/whatsapp-link/', tag: 'New', blurb: "Click-to-chat link, website button, chat widget and QR code for your number.", icon: ico('<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/>') },
    { id: 'post-maker', name: 'Flyer & Post Maker', url: '/tools/post-maker/', tag: 'New', blurb: "Flyers and social posts in your colours, with trending topics and hashtags.", icon: ico('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 15l5-5 4 4 3-3 6 6"/><circle cx="16" cy="8" r="1.4"/>') },
    { id: 'cv-builder', name: 'CV Builder', url: '/tools/cv-builder/', tag: 'New', blurb: "A clean, ATS-friendly CV with live preview. Three templates, PDF download.", icon: ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6M22 15h-4"/>') }
  ];
  window.VR_TOOLS = TOOLS;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const here = location.pathname.replace(/index\.html$/, '');

  /* ----- zipper glyph for the button ----- */
  const ZIP = '<svg class="vt-zip" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="2" width="7" height="7.5" rx="2.2"/><circle cx="12" cy="5.6" r="1" fill="currentColor" stroke="none"/><path d="M12 11.5v10.5"/><path d="M8.6 13h2.2M13.2 14.8h2.2M8.6 16.6h2.2M13.2 18.4h2.2M8.6 20.2h2.2"/></svg>';

  let tray, sheet, content, cover, teeth, pull, btnOpen, progress = 0, anim = 0, isOpen = false, lastFocus = null;

  function build() {
    tray = el('div', 'vt-tray'); tray.id = 'vt-tray'; tray.hidden = true;
    tray.setAttribute('role', 'dialog'); tray.setAttribute('aria-label', 'Studio tools'); tray.setAttribute('aria-modal', 'false');
    const scrim = el('div', 'vt-scrim'); scrim.addEventListener('click', close);
    sheet = el('div', 'vt-sheet');
    cover = el('div', 'vt-cover'); cover.innerHTML = '<div class="vt-cover-seam"></div>';
    teeth = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); teeth.setAttribute('class', 'vt-teeth'); teeth.setAttribute('aria-hidden', 'true');
    teeth.innerHTML = '<polyline class="t1" points=""/><polyline class="t2" points=""/>';
    pull = el('div', 'vt-pull', '<svg viewBox="0 0 28 40" width="28" height="40" aria-hidden="true"><rect x="9" y="0" width="10" height="9" rx="2" fill="#c9a227"/><path d="M4 12h20v14a10 10 0 0 1-20 0z" fill="url(#vtg)"/><rect x="10" y="17" width="8" height="12" rx="4" fill="#0b0a09"/><defs><linearGradient id="vtg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc93"/><stop offset="1" stop-color="#a98412"/></linearGradient></defs></svg>');
    content = el('div', 'vt-content');
    const head = el('div', 'vt-head');
    head.innerHTML = '<div><p class="vt-eyebrow">VibrantRevolve Studio</p><h2 class="vt-title">Free tools for building a brand</h2><p class="vt-sub">Fast, private and made in your browser. Nothing you type is uploaded.</p></div>';
    const x = el('button', 'vt-close', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'); x.type = 'button'; x.setAttribute('aria-label', 'Close tools'); x.addEventListener('click', close);
    head.appendChild(x);
    const grid = el('div', 'vt-grid');
    TOOLS.forEach((t) => {
      const a = el('a', 'vt-card' + (here === t.url ? ' is-here' : ''), '<span class="vt-ico">' + t.icon + '</span><span class="vt-meta"><span class="vt-name">' + t.name + (t.tag ? ' <i class="vt-tag' + (t.tag === 'Flagship' ? ' is-gold' : '') + '">' + t.tag + '</i>' : '') + '</span><span class="vt-blurb">' + t.blurb + '</span></span>');
      a.href = t.url; if (here === t.url) a.setAttribute('aria-current', 'page'); grid.appendChild(a);
    });
    const cta = el('a', 'vt-card vt-cta', '<span class="vt-meta"><span class="vt-name">Want it done for you?</span><span class="vt-blurb">Our designers and developers will turn your brief into a real brand and website.</span><span class="vt-go">Book a call &rarr;</span></span>');
    cta.href = '/contact/'; grid.appendChild(cta);
    const foot = el('div', 'vt-foot', '<a href="/tools/">See all tools</a><span>Tip: press <kbd>Esc</kbd> to close</span>');
    content.append(head, grid, foot);
    sheet.append(cover, content, teeth, pull); tray.append(scrim, sheet); document.body.appendChild(tray);
    tray.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    addEventListener('resize', place);
  }

  function place() {
    if (!tray || !btnOpen) return;
    const r = btnOpen.getBoundingClientRect();
    tray.style.setProperty('--vt-top', Math.max(8, Math.round(r.bottom + 12)) + 'px');
  }

  function paint(p) {
    progress = p;
    const y = p * 140, a = Math.max(0, y - 40);
    sheet.style.setProperty('--y', y); sheet.style.setProperty('--a', a);
    const W = sheet.clientWidth, H = sheet.clientHeight, ypx = H * y / 100, apx = H * a / 100;
    teeth.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    teeth.firstChild.setAttribute('points', '0,' + apx + ' ' + W / 2 + ',' + ypx);
    teeth.lastChild.setAttribute('points', W + ',' + apx + ' ' + W / 2 + ',' + ypx);
    pull.style.transform = 'translate(' + (W / 2 - 14) + 'px,' + (ypx - 10) + 'px)';
    sheet.classList.toggle('is-done', p >= 1);
  }

  function run(to, ms, done) {
    cancelAnimationFrame(anim);
    const from = progress, t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms); paint(from + (to - from) * ease(t));
      if (t < 1) anim = requestAnimationFrame(step); else if (done) done();
    };
    anim = requestAnimationFrame(step);
  }

  function open() {
    if (isOpen) return; if (!tray) build();
    isOpen = true; lastFocus = document.activeElement; place();
    tray.hidden = false; btnOpen && btnOpen.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('vt-open');
    if (reduce) { paint(1); } else { paint(0); run(1, 900); }
    setTimeout(() => { const f = tray.querySelector('.vt-card'); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 520);
  }
  function close() {
    if (!isOpen) return; isOpen = false;
    btnOpen && btnOpen.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('vt-open');
    const fin = () => { tray.hidden = true; paint(0); };
    if (reduce) fin(); else run(0, 520, fin);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function toggle(e) { if (e) e.preventDefault(); btnOpen = e && e.currentTarget ? e.currentTarget : btnOpen; isOpen ? close() : open(); }

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) close(); });
  document.addEventListener('click', (e) => {
    if (!isOpen) return; if (tray.contains(e.target) || (btnOpen && btnOpen.contains(e.target))) return; close();
  });

  /* ----- inject the button + mobile link ----- */
  function makeBtn(cls) {
    const b = el('button', 'vt-btn ' + (cls || ''), ZIP + '<span class="vt-btn-label">Tools</span>');
    b.type = 'button'; b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'vt-tray');
    b.title = 'Free studio tools'; b.addEventListener('click', toggle); return b;
  }
  function inject() {
    let done = false;
    const actions = document.querySelector('.header-actions');
    if (actions && !actions.querySelector('.vt-btn')) { actions.insertBefore(makeBtn('vt-btn--header'), actions.firstChild); done = true; }
    const links = document.querySelector('.nav-links');
    if (links && !links.querySelector('.vt-btn')) { const cta = links.querySelector('.nav-cta'); links.insertBefore(makeBtn('vt-btn--nav'), cta || null); done = true; }
    const mob = document.getElementById('mobileNav');
    if (mob && !mob.querySelector('.vt-mobile-link')) { const a = el('a', 'vt-mobile-link', 'Tools'); a.href = '/tools/'; mob.insertBefore(a, mob.querySelector('.nav-cta')); }
    return done || !!document.querySelector('.vt-btn');
  }
  function start() {
    if (inject()) return;
    const mo = new MutationObserver(() => { if (inject()) mo.disconnect(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 8000);
  }
  if (location.pathname.indexOf('/payment') === 0) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.VRTools = { open, close, list: TOOLS };
})();
