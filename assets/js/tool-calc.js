/* Business Calculators: margin, VAT, loan, break-even, discount, currency. Runs in the browser. */
(function () {
  const K = window.VRKit, $ = K.$; const root = $('#bc-root'); if (!root) return;
  const nf = (n, d) => (isFinite(n) ? new Intl.NumberFormat('en', { minimumFractionDigits: d == null ? 2 : d, maximumFractionDigits: d == null ? 2 : d }).format(n) : '—');
  const pc = (n) => (isFinite(n) ? nf(n, 2) + '%' : '—');
  const CALCS = [
    { id: 'margin', label: 'Profit & margin', note: 'Margin is profit as a share of the selling price. Markup is profit as a share of cost.',
      f: [{ k: 'cost', l: 'Cost price', v: 6000 }, { k: 'price', l: 'Selling price', v: 9000 }, { k: 'target', l: 'Target margin %', v: 40 }],
      run: (v) => { const p = v.price - v.cost; return [['Profit per item', nf(p), 1], ['Profit margin', pc(v.price ? p / v.price * 100 : NaN), 1], ['Markup on cost', pc(v.cost ? p / v.cost * 100 : NaN)], ['Price needed for ' + nf(v.target, 0) + '% margin', v.target < 100 ? nf(v.cost / (1 - v.target / 100)) : '—']]; } },
    { id: 'vat', label: 'VAT / tax', note: 'Nigeria VAT is 7.5%. Change the rate for any other tax.',
      f: [{ k: 'amount', l: 'Amount', v: 100000 }, { k: 'rate', l: 'Tax rate %', v: 7.5 }, { k: 'mode', l: 'The amount', t: 'select', o: [['add', 'excludes tax (add tax)'], ['remove', 'includes tax (take tax out)']], v: 'add' }],
      run: (v) => { const r = v.rate / 100; const net = v.mode === 'add' ? v.amount : v.amount / (1 + r), tax = net * r; return [['Price before tax', nf(net)], ['Tax', nf(tax)], ['Total with tax', nf(net + tax), 1]]; } },
    { id: 'loan', label: 'Loan payment', note: 'A fixed monthly repayment (reducing balance). Your lender’s own figure may differ with fees.',
      f: [{ k: 'p', l: 'Loan amount', v: 1000000 }, { k: 'rate', l: 'Interest per year %', v: 24 }, { k: 'n', l: 'Months', v: 12 }],
      run: (v) => { const r = v.rate / 1200, n = Math.round(v.n); if (n < 1) return []; const pay = r ? v.p * r / (1 - Math.pow(1 + r, -n)) : v.p / n; return [['Monthly payment', nf(pay), 1], ['Total to repay', nf(pay * n)], ['Total interest', nf(pay * n - v.p)]]; } },
    { id: 'be', label: 'Break-even', note: 'How many sales you need before you start making a profit.',
      f: [{ k: 'fixed', l: 'Fixed costs (rent, salaries…)', v: 300000 }, { k: 'price', l: 'Price per unit', v: 5000 }, { k: 'var', l: 'Cost to make or buy one unit', v: 3000 }],
      run: (v) => { const m = v.price - v.var; if (m <= 0) return [['Break-even', 'Price must be higher than unit cost', 1]]; const u = Math.ceil(v.fixed / m); return [['Units to break even', nf(u, 0), 1], ['Sales needed', nf(u * v.price)], ['Profit per unit', nf(m)]]; } },
    { id: 'disc', label: 'Discount', note: 'Work out a sale price, or find what percentage off a deal really is.',
      f: [{ k: 'price', l: 'Original price', v: 25000 }, { k: 'pct', l: 'Discount %', v: 15 }, { k: 'sale', l: 'Or sale price (to find % off)', v: 20000 }],
      run: (v) => [['You save', nf(v.price * v.pct / 100)], ['Price after discount', nf(v.price * (1 - v.pct / 100)), 1], ['Sale price ' + nf(v.sale) + ' is', v.price ? pc((v.price - v.sale) / v.price * 100) + ' off' : '—']] },
    { id: 'fx', label: 'Currency', note: 'Type today’s rate yourself (check your bank or a trusted source). Nothing is fetched online.',
      f: [{ k: 'amount', l: 'Amount', v: 100 }, { k: 'from', l: 'From (e.g. USD)', v: 'USD', t: 'text' }, { k: 'to', l: 'To (e.g. NGN)', v: 'NGN', t: 'text' }, { k: 'rate', l: 'Rate: 1 From = ? To', v: 1500 }],
      run: (v) => [[nf(v.amount) + ' ' + String(v.from).toUpperCase() + ' =', nf(v.amount * v.rate) + ' ' + String(v.to).toUpperCase(), 1], ['Reverse: 1 ' + String(v.to).toUpperCase() + ' =', nf(v.rate ? 1 / v.rate : NaN, 6) + ' ' + String(v.from).toUpperCase()]] },
  ];
  const tabs = $('#bc-tabs'), panel = $('#bc-panel'); let cur = K.store.get('bc-tab', 'margin'); if (!CALCS.some((c) => c.id === cur)) cur = 'margin';
  const mem = K.store.get('bc-vals', {});
  function show(id) {
    cur = id; K.store.set('bc-tab', id); const c = CALCS.find((x) => x.id === id);
    tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === id)));
    panel.innerHTML = `<div class="bc-grid"><div class="bc-in" id="bc-in"></div><div class="bc-out" id="bc-out" aria-live="polite"></div></div><p class="tp-note">${c.note}</p>`;
    const box = $('#bc-in'); const vals = {};
    c.f.forEach((f) => { const saved = (mem[id] || {})[f.k]; vals[f.k] = saved != null ? saved : f.v; const lab = K.el('label', 'f'); lab.innerHTML = `<span>${f.l}</span>`; let inp;
      if (f.t === 'select') { inp = K.el('select'); f.o.forEach(([v, t]) => { const o = K.el('option', '', t); o.value = v; inp.appendChild(o); }); inp.value = vals[f.k]; }
      else if (f.t === 'text') { inp = K.el('input'); inp.type = 'text'; inp.maxLength = 8; inp.value = vals[f.k]; }
      else { inp = K.el('input'); inp.type = 'number'; inp.step = 'any'; inp.inputMode = 'decimal'; inp.value = vals[f.k]; }
      inp.setAttribute('aria-label', f.l); inp.addEventListener('input', () => { vals[f.k] = f.t === 'select' || f.t === 'text' ? inp.value : (parseFloat(inp.value) || 0); mem[id] = Object.assign({}, vals); K.store.set('bc-vals', mem); out(); }); lab.appendChild(inp); box.appendChild(lab); });
    function out() { const rows = c.run(vals), o = $('#bc-out'); o.innerHTML = ''; rows.forEach(([l, v, big]) => { const r = K.el('div', 'bc-row' + (big ? ' is-big' : '')); r.innerHTML = `<span>${K.esc(l)}</span><strong>${K.esc(v)}</strong>`; o.appendChild(r); });
      const b = K.el('button', 'tb tb--sm', 'Copy result'); b.type = 'button'; b.onclick = () => K.copy(c.label + '\n' + rows.map((r) => r[0] + ': ' + r[1]).join('\n')); o.appendChild(b); }
    out();
  }
  CALCS.forEach((c) => { const b = K.el('button', '', c.label); b.type = 'button'; b.dataset.id = c.id; b.setAttribute('role', 'tab'); b.onclick = () => show(c.id); tabs.appendChild(b); });
  show(cur);
})();
