/* VibrantRevolve service worker: fast repeat visits and a friendly offline page. Pages, scripts and styles are network-first, so updates always show. */
const VERSION = 'vr-v2';
const PRECACHE = ['/offline.html', '/assets/images/favicon/icon-192.png', '/assets/images/favicon/logo-mark.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const put = (req, res) => { if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; };
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (/^\/(admin|payment)\//.test(url.pathname) || url.pathname === '/sw.js') return;
  const fresh = req.mode === 'navigate' || /\.(?:js|css|json|html)$/.test(url.pathname);
  if (fresh) {
    e.respondWith(fetch(req).then((r) => put(req, r)).catch(() => caches.match(req).then((m) => m || (req.mode === 'navigate' ? caches.match('/offline.html') : Response.error()))));
  } else {
    e.respondWith(caches.match(req).then((m) => { const net = fetch(req).then((r) => put(req, r)).catch(() => m); return m || net; }));
  }
});
