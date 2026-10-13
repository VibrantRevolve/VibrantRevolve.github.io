/* Studio Status: a live "are they taking work?" line in the footer and the home hero.
   Edit assets/data/status.json to change it. state: open (green), limited (amber), full (red). */
(function () {
  'use strict';
  var COLORS = { open: 'open', limited: 'limited', full: 'full' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function strip(d) {
    var el = document.createElement('div');
    el.className = 'vr-status'; el.setAttribute('data-state', COLORS[d.state] || 'open'); el.setAttribute('role', 'status');
    el.innerHTML = '<span class="vr-status-dot" aria-hidden="true"></span><b>' + esc(d.headline) + '</b>' +
      (d.slots ? '<span class="vr-status-sep">' + esc(d.slots) + '</span>' : '') +
      (d.reply ? '<span class="vr-status-sep">' + esc(d.reply) + '</span>' : '') +
      '<a href="/tools/estimator/">Get an estimate</a>';
    return el;
  }
  function mountFooter(d, tries) {
    var f = document.querySelector('.site-footer, footer.footer');
    if (f) { if (!f.querySelector('.vr-status')) f.insertBefore(strip(d), f.firstChild); return; }
    if ((tries || 0) < 40) setTimeout(function () { mountFooter(d, (tries || 0) + 1); }, 250);
  }
  function hero(d) {
    var b = document.querySelector('.hero-badge'); if (!b) return;
    var dot = b.querySelector('.dot'); b.setAttribute('data-state', COLORS[d.state] || 'open');
    b.textContent = ' ' + d.headline + (d.slots ? ' · ' + d.slots : '');
    if (dot) b.insertBefore(dot, b.firstChild);
  }
  function go() {
    fetch('/assets/data/status.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.headline) return; hero(d); mountFooter(d, 0);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
