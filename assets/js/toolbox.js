/* My Toolbox: visitors pin the tools they use most; pinned tools show first on their homepage and on /tools/.
   Stored only in this browser (localStorage). No account, nothing sent anywhere. */
(function () {
  'use strict';
  var KEY = 'vr-toolbox';
  var STAR = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" focusable="false"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

  function norm(p) {
    try { p = new URL(p, location.origin).pathname; } catch (e) {}
    return p.replace(/index\.html$/, '').replace(/\/?$/, '/');
  }
  function toolPath(p) { p = norm(p); return /^\/(tools\/[^/]+|brand-studio)\/$/.test(p) ? p : ''; }
  function read() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return typeof x === 'string'; }) : []; } catch (e) { return []; }
  }
  function write(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function has(p) { return read().indexOf(p) > -1; }
  function toggle(p) {
    var a = read(), i = a.indexOf(p);
    if (i > -1) a.splice(i, 1); else a.push(p);
    write(a);
    return i === -1;
  }

  function pinEl(p, name) {
    var on = has(p), s = document.createElement('span');
    s.className = 'tb-pin' + (on ? ' is-on' : '');
    s.setAttribute('role', 'button'); s.tabIndex = 0; s.dataset.path = p;
    s.setAttribute('aria-pressed', on ? 'true' : 'false');
    s.setAttribute('aria-label', (on ? 'Remove ' : 'Pin ') + name + (on ? ' from' : ' to') + ' my toolbox');
    s.title = on ? 'Remove from my toolbox' : 'Pin to my toolbox';
    s.innerHTML = STAR;
    return s;
  }
  function cardName(a) { var h = a.querySelector('h3'); return h ? h.textContent.replace(/\s+(Flagship|New)$/, '').trim() : 'tool'; }

  function decorateCards(root) {
    (root || document).querySelectorAll('a.hub-card').forEach(function (a) {
      if (a.classList.contains('hub-cta') || a.querySelector('.tb-pin')) return;
      var p = toolPath(a.getAttribute('href') || '');
      if (!p) return;
      a.appendChild(pinEl(p, cardName(a)));
    });
  }

  var box = null, catalog = {};
  // The full list lives on /tools/. Fetch it so tools pinned from their own page still appear on the homepage.
  function loadCatalog() {
    if (!document.querySelector('.hub-grid') || norm(location.pathname) === '/tools/') return;
    fetch('/tools/').then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      if (!t) return;
      var d = new DOMParser().parseFromString(t, 'text/html');
      d.querySelectorAll('a.hub-card').forEach(function (a) {
        var k = toolPath(a.getAttribute('href') || '');
        if (k && !a.classList.contains('hub-cta')) catalog[k] = document.importNode(a, true);
      });
      refresh();
    }).catch(function () {});
  }
  function mountBox() {
    var grid = document.querySelector('.hub-grid');
    if (!grid) return;
    if (!box) {
      box = document.createElement('div'); box.className = 'tb-box'; box.id = 'my-toolbox';
      grid.parentNode.insertBefore(box, grid);
    }
    var pinned = read(), cards = {};
    Object.keys(catalog).forEach(function (k) { cards[k] = catalog[k]; });
    document.querySelectorAll('.hub-grid a.hub-card').forEach(function (a) { var k = toolPath(a.getAttribute('href') || ''); if (k && !a.closest('.tb-box')) cards[k] = a; });
    var items = pinned.filter(function (p) { return cards[p]; });
    box.innerHTML = '';
    var head = document.createElement('div'); head.className = 'tb-head';
    head.innerHTML = '<div><h3 class="tb-title">' + STAR + ' My Toolbox</h3><p class="tb-sub">' +
      (items.length ? 'Your pinned tools, ready on every visit.' : 'Tap the star on any tool below to keep it here. Pick one, or as many as you like.') +
      '</p></div>';
    if (items.length) {
      var clr = document.createElement('button'); clr.type = 'button'; clr.className = 'tb-clear'; clr.textContent = 'Clear all';
      clr.addEventListener('click', function () { write([]); refresh(); });
      head.appendChild(clr);
    }
    box.appendChild(head);
    var g = document.createElement('div'); g.className = 'tb-grid';
    if (!items.length) {
      g.innerHTML = '<div class="tb-empty">' + STAR + '<span>Nothing pinned yet</span></div>';
    } else {
      items.forEach(function (p) {
        var c = cards[p].cloneNode(true);
        c.classList.remove('reveal', 'is-feature'); c.classList.add('is-visible', 'visible', 'active');
        var old = c.querySelector('.tb-pin'); if (old) old.remove();
        c.appendChild(pinEl(p, cardName(c)));
        g.appendChild(c);
      });
    }
    box.appendChild(g);
  }

  function pageButton() {
    var p = toolPath(location.pathname), crumbs = document.querySelector('.tp-hero .tp-crumbs');
    if (!p || !crumbs || document.querySelector('.tb-page')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tb-page'; b.dataset.path = p;
    crumbs.parentNode.insertBefore(b, crumbs.nextSibling);
    paintPage();
  }
  function paintPage() {
    var b = document.querySelector('.tb-page'); if (!b) return;
    var on = has(b.dataset.path);
    b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.innerHTML = STAR + '<span>' + (on ? 'In my toolbox' : 'Pin to my homepage') + '</span>';
  }

  function repaintPins() {
    document.querySelectorAll('.tb-pin').forEach(function (s) {
      var on = has(s.dataset.path), a = s.closest('a'), n = a ? cardName(a) : 'tool';
      s.classList.toggle('is-on', on); s.setAttribute('aria-pressed', on ? 'true' : 'false');
      s.setAttribute('aria-label', (on ? 'Remove ' : 'Pin ') + n + (on ? ' from' : ' to') + ' my toolbox');
      s.title = on ? 'Remove from my toolbox' : 'Pin to my toolbox';
    });
    paintPage();
  }
  function refresh() { mountBox(); repaintPins(); }

  function act(el) {
    var p = el.dataset.path; if (!p) return;
    var on = toggle(p);
    refresh();
    try { if (navigator.vibrate) navigator.vibrate(on ? 12 : 6); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tb-pin, .tb-page');
    if (!t) return;
    e.preventDefault(); e.stopPropagation(); act(t);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('.tb-pin');
    if (t) { e.preventDefault(); act(t); }
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) refresh(); });

  function init() { decorateCards(); mountBox(); repaintPins(); pageButton(); loadCatalog(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
