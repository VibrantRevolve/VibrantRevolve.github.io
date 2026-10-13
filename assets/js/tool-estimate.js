/* Project Estimator: pick what you need, get an honest price range and timeline, send the brief on WhatsApp.
   Base prices come from assets/js/pricing-data.js so they always match the Pricing page. */
(function () {
  const K = window.VRKit, $ = K.$, root = $('#es-root'); if (!root) return;
  const NGN = 1560;   // approximate USD to NGN. Edit when the rate moves a lot.
  const P = (k, i, d) => { try { return PRICING_DATA[k].tiers[i].usd; } catch (e) { return d; } };
  const web = [P('web-development', 0, 50), P('web-development', 1, 150), P('web-development', 2, 300)];
  const TYPES = {
    web: { label: 'Business website', sub: 'Show your work and get enquiries', sizes: [['1 page', web[0], 1], ['Up to 5 pages', web[1], 2], ['Up to 10 pages', web[2], 3], ['10+ pages', 450, 5]],
      extras: [['blog', 'Blog', 40], ['forms', 'Booking or enquiry forms', 30], ['pay', 'Online payments', 60], ['wa', 'WhatsApp chat and catalogue', 25], ['seo', 'SEO pack', 35], ['copy', 'Copywriting for the pages', 50], ['logo', 'Logo design', P('graphic-design', 0, 40)], ['lang', 'A second language', 40]] },
    store: { label: 'Online store', sub: 'Sell products with Paystack or PayPal', sizes: [['Up to 20 products', web[2] + 100, 4], ['Up to 100 products', web[2] + 250, 5], ['100+ products', web[2] + 450, 7]],
      extras: [['wa', 'WhatsApp ordering', 25], ['seo', 'SEO pack', 35], ['copy', 'Product descriptions', 60], ['logo', 'Logo design', P('graphic-design', 0, 40)], ['delivery', 'Delivery fee rules', 30], ['lang', 'A second language', 40]] },
    soft: { label: 'Software or automation', sub: 'Tools, scripts, dashboards, SaaS', sizes: [['A script or tool', P('software-development', 0, 250), 2], ['A desktop app', P('software-development', 1, 450), 4], ['A full SaaS tool', P('software-development', 2, 700), 8]],
      extras: [['admin', 'Admin dashboard', 80], ['login', 'User accounts and login', 90], ['api', 'Connect to another service (API)', 60], ['docs', 'Written guide and handover', 40], ['support', '30 days of support', 50]] },
    brand: { label: 'Brand identity', sub: 'Look and feel that people remember', sizes: [['Logo only', P('graphic-design', 0, 40), 1], ['Logo and social kit', P('graphic-design', 1, 70), 2], ['Full brand identity', P('graphic-design', 2, 150), 3]],
      extras: [['guide', 'Brand guidelines PDF', 30], ['card', 'Business card design', 20], ['paper', 'Letterhead and invoice', 25], ['social', 'Extra social templates', 30]] }
  };
  const st = { type: 'web', size: 1, extras: {}, rush: false, cur: 'USD' };
  const nf = (n) => new Intl.NumberFormat('en').format(Math.round(n));
  const money = (usd) => (st.cur === 'NGN' ? '₦' + nf(Math.round(usd * NGN / 1000) * 1000) : '$' + nf(usd));
  const r5 = (n) => Math.max(5, Math.round(n / 5) * 5);
  const wa = () => String((window.VR_CONFIG || {}).whatsapp || '2349012739299');

  function calc() {
    const T = TYPES[st.type], sz = T.sizes[Math.min(st.size, T.sizes.length - 1)], ex = T.extras.filter((e) => st.extras[e[0]]);
    let base = sz[1], add = ex.reduce((a, e) => a + e[2], 0), total = base + add, weeks = sz[2] + Math.round(ex.length * 0.4);
    let rush = 0; if (st.rush) { rush = Math.round(total * 0.25); total += rush; weeks = Math.max(1, Math.round(weeks * 0.6)); }
    return { T, sz, ex, base, add, rush, total, low: r5(total * 0.9), high: r5(total * 1.2), weeks };
  }
  function brief(c) {
    return ['Hi VibrantRevolve, I used your estimator.', '', 'Project: ' + c.T.label + ' (' + c.sz[0] + ')',
      'Extras: ' + (c.ex.length ? c.ex.map((e) => e[1]).join(', ') : 'none'), 'Timeline: ' + (st.rush ? 'rush' : 'standard') + ' (about ' + c.weeks + (c.weeks === 1 ? ' week' : ' weeks') + ')',
      'Estimate: ' + money(c.low) + ' to ' + money(c.high), '', 'Can we talk about it?'].join('\n');
  }
  function opt(name, val, label, sub, on) { return '<label class="es-opt"><input type="radio" name="' + name + '" value="' + val + '"' + (on ? ' checked' : '') + '><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span></label>'; }

  function draw() {
    const T = TYPES[st.type], c = calc();
    $('#es-type').innerHTML = Object.keys(TYPES).map((k) => opt('type', k, TYPES[k].label, TYPES[k].sub, k === st.type)).join('');
    $('#es-size').innerHTML = T.sizes.map((s, i) => opt('size', i, s[0], '', i === st.size)).join('');
    $('#es-extras').innerHTML = T.extras.map((e) => '<label class="es-chip"><input type="checkbox" value="' + e[0] + '"' + (st.extras[e[0]] ? ' checked' : '') + '><span>' + e[1] + '</span></label>').join('');
    $('#es-time').innerHTML = opt('time', 'std', 'Standard', 'Best value', !st.rush) + opt('time', 'rush', 'Rush', 'About 25% more, faster delivery', st.rush);
    $('#es-cur').innerHTML = ['USD', 'NGN'].map((x) => '<label><input type="radio" name="cur" value="' + x + '"' + (st.cur === x ? ' checked' : '') + '><span>' + x + '</span></label>').join('');
    out();
  }
  function out() {
    const c = calc(), rows = [[c.T.label + ', ' + c.sz[0], c.base]].concat(c.ex.map((e) => [e[1], e[2]]));
    if (c.rush) rows.push(['Rush delivery', c.rush]);
    $('#es-range').textContent = money(c.low) + ' to ' + money(c.high);
    $('#es-weeks').textContent = 'About ' + c.weeks + (c.weeks === 1 ? ' week' : ' weeks') + ' once we agree the brief';
    $('#es-break').innerHTML = rows.map((r) => '<li><span>' + K.esc(r[0]) + '</span><b>' + money(r[1]) + '</b></li>').join('');
    $('#es-wa').href = 'https://wa.me/' + wa() + '?text=' + encodeURIComponent(brief(c));
    root.dataset.total = c.total;
  }
  root.addEventListener('change', (e) => {
    const t = e.target, n = t.name;
    if (n === 'type') { st.type = t.value; st.size = Math.min(1, TYPES[t.value].sizes.length - 1); st.extras = {}; draw(); }
    else if (n === 'size') { st.size = +t.value; draw(); }
    else if (n === 'time') { st.rush = t.value === 'rush'; draw(); }
    else if (n === 'cur') { st.cur = t.value; draw(); }
    else if (t.type === 'checkbox') { st.extras[t.value] = t.checked; out(); }
  });
  $('#es-copy').addEventListener('click', () => K.copy(brief(calc())));
  draw();
})();
