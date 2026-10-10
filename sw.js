/* VibrantRevolve service worker.
   - Pages, scripts, styles and data: network first (updates always show), but if the network is slow or down the saved copy answers.
   - Images and fonts: saved copy first, refreshed in the background.
   - The free tools are saved on first visit so they keep working offline. */
const VERSION = 'vr-v3';
const PRECACHE = ["/offline.html", "/", "/tools/", "/brand-studio/", "/store/", "/contact/", "/components/header.html", "/components/footer.html", "/assets/images/favicon/icon-192.png", "/assets/images/favicon/logo-mark.png", "/tools/business-card/", "/tools/calculators/", "/tools/copy-writer/", "/tools/cover-letter/", "/tools/cv-builder/", "/tools/image-compressor/", "/tools/invoice/", "/tools/link-in-bio/", "/tools/logo-maker/", "/tools/name-generator/", "/tools/palette-extractor/", "/tools/pdf-tools/", "/tools/post-maker/", "/tools/price-list/", "/tools/qr-code/", "/tools/receipt-maker/", "/tools/video-studio/", "/tools/voice-studio/", "/tools/whatsapp-link/", "/assets/css/app.css", "/assets/css/assistant.css", "/assets/css/banner.css", "/assets/css/enhance.css", "/assets/css/main.css", "/assets/css/tech.css", "/assets/css/tools.css", "/assets/js/app.js", "/assets/js/assistant.js", "/assets/js/aurora.js", "/assets/js/banner.js", "/assets/js/blog.js", "/assets/js/brand-engine.js", "/assets/js/contact.js", "/assets/js/enhance.js", "/assets/js/icons.js", "/assets/js/main.js", "/assets/js/payment.js", "/assets/js/post.js", "/assets/js/pricing-data.js", "/assets/js/pricing.js", "/assets/js/site-config.js", "/assets/js/store.js", "/assets/js/tech.js", "/assets/js/tool-brand.js", "/assets/js/tool-calc.js", "/assets/js/tool-card.js", "/assets/js/tool-copy.js", "/assets/js/tool-cover.js", "/assets/js/tool-cv.js", "/assets/js/tool-imgsize.js", "/assets/js/tool-invoice.js", "/assets/js/tool-linkbio.js", "/assets/js/tool-logo.js", "/assets/js/tool-names.js", "/assets/js/tool-palette.js", "/assets/js/tool-pdf.js", "/assets/js/tool-post.js", "/assets/js/tool-pricelist.js", "/assets/js/tool-qr.js", "/assets/js/tool-receipt.js", "/assets/js/tool-video.js", "/assets/js/tool-voice.js", "/assets/js/tool-wa.js", "/assets/js/tools-kit.js", "/assets/js/tools.js", "/assets/js/vendor/qrcode.js"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.registration.navigationPreload && self.registration.navigationPreload.enable().catch(() => {})).then(() => self.clients.claim()));
});
self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });
const put = (req, res) => { if (res && res.ok && (res.type === 'basic' || res.type === 'cors')) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; };
const timeout = (p, ms) => new Promise((ok, no) => { const t = setTimeout(() => no(new Error('slow')), ms); p.then((v) => { clearTimeout(t); ok(v); }, (e) => { clearTimeout(t); no(e); }); });
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  const same = url.origin === location.origin;
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !font) return;
  if (same && (/^\/(admin|payment)\//.test(url.pathname) || url.pathname === '/sw.js')) return;
  const fresh = same && (req.mode === 'navigate' || /\.(?:js|css|json|html|xml)$/.test(url.pathname) || url.pathname.endsWith('/'));
  if (fresh) {
    e.respondWith((async () => {
      try {
        const pre = req.mode === 'navigate' && e.preloadResponse ? await e.preloadResponse : null;
        const res = pre || await timeout(fetch(req), 5000);
        return put(req, res);
      } catch (err) {
        const m = await caches.match(req, { ignoreSearch: true });
        if (m) return m;
        if (req.mode === 'navigate') return (await caches.match('/offline.html')) || Response.error();
        return Response.error();
      }
    })());
  } else {
    e.respondWith(caches.match(req).then((m) => { const net = fetch(req).then((r) => put(req, r)).catch(() => m); return m || net; }));
  }
});
