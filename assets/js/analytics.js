/* Cloudflare Web Analytics loader. Does nothing until cfAnalyticsToken is set in site-config.js.
   Cookieless; respects Do Not Track. Per-tool usage = page views of /tools/<name>/ in the Cloudflare dashboard. */
(function () {
  var c = window.VR_CONFIG || {};
  if (!c.cfAnalyticsToken || navigator.doNotTrack === '1') return;
  var s = document.createElement('script');
  s.type = 'module'; // matches Cloudflare's current snippet
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: c.cfAnalyticsToken }));
  document.head.appendChild(s);
})();
