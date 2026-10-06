/* Invoice & Quote Maker: live A4 preview, multi-page, PDF/PNG export. Nothing is uploaded. */
(function () {
  const K = window.VRKit, $ = K.$;
  const form = $('#iv-form'); if (!form) return;
  const CUR = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: '₵', KES: 'KSh ', ZAR: 'R ' };
  $('#iv-cur').innerHTML = Object.keys(CUR).map((c) => `<option value="${c}">${c} ${CUR[c].trim()}</option>`).join('');
  const saved = K.store.get('iv', {}); let logo = null, pages = [], page = 0, token = 0;
  const today = new Date(), iso = (d) => d.toISOString().slice(0, 10), plus = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
  const F = { biz: '#iv-biz', bemail: '#iv-bemail', baddr: '#iv-baddr', color: '#iv-color', cur: '#iv-cur', bank: '#iv-bank', client: '#iv-client', cemail: '#iv-cemail', caddr: '#iv-caddr', num: '#iv-num', date: '#iv-date', due: '#iv-due', tax: '#iv-tax', disc: '#iv-disc', notes: '#iv-notes' };
  const KEEP = ['biz', 'bemail', 'baddr', 'color', 'cur', 'bank'];
  KEEP.forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  $(F.date).value = iso(today); $(F.due).value = plus(14); $(F.num).value = saved.n ? 'INV-' + String(saved.n).padStart(3, '0') : 'INV-001';
  if (!$(F.notes).value) $(F.notes).value = 'Thank you for your business. Payment is due by the date shown above.';

  const items = [{ d: 'Website design', q: 1, p: 150000 }, { d: 'Logo and brand kit', q: 1, p: 60000 }];
  const kind = () => (form.querySelector('input[name="iv-kind"]:checked') || {}).value || 'Invoice';
  function rows() {
    const box = $('#iv-items'); box.innerHTML = '';
    items.forEach((it, i) => {
      const r = K.el('div', 'li');
      r.innerHTML = `<input aria-label="Description" value="${K.esc(it.d)}" placeholder="Description"><input aria-label="Quantity" type="number" min="0" step="any" value="${it.q}"><input aria-label="Unit price" type="number" min="0" step="any" value="${it.p}">`;
      const del = K.elh('button', 'ib', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'); del.type = 'button'; del.setAttribute('aria-label', 'Remove line ' + (i + 1)); del.onclick = () => { items.splice(i, 1); if (!items.length) items.push({ d: '', q: 1, p: 0 }); rows(); draw(); };
      const [a, b, c] = r.querySelectorAll('input'); a.oninput = () => { it.d = a.value; soft(); }; b.oninput = () => { it.q = parseFloat(b.value) || 0; soft(); }; c.oninput = () => { it.p = parseFloat(c.value) || 0; soft(); };
      r.appendChild(del); box.appendChild(r);
    });
  }
  const num = (n) => new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const money = (n) => (CUR[$(F.cur).value] || '') + num(n);
  const fdate = (s) => { const d = new Date(s + 'T00:00'); return isNaN(d) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
  const totals = () => { const sub = items.reduce((a, i) => a + i.q * i.p, 0), disc = Math.min(sub, sub * (parseFloat($(F.disc).value) || 0) / 100), net = sub - disc, tax = net * (parseFloat($(F.tax).value) || 0) / 100; return { sub, disc, tax, total: net + tax }; };

  async function render() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const col = $(F.color).value || '#1f3a5f', ink = '#1b1813', mute = '#6c665a', line = '#e5e0d6', T = totals(), W = 1240, H = 1754, M = 90, out = [];
    const mk = () => { const p = K.page('#ffffff'); out.push(p.c); p.x.fillStyle = col; p.x.fillRect(0, 0, W, 16); return p.x; };
    const lab = (x, t, X, Y, c, w, px) => { x.fillStyle = c; x.font = `${w || 600} ${px || 22}px Inter`; x.fillText(t, X, Y); };
    let x = mk();
    // header
    let ty = 120;
    if (logo) { const s = Math.min(1, 90 / logo.height, 260 / logo.width); x.drawImage(logo, M, 72, logo.width * s, logo.height * s); ty = 72 + logo.height * s + 40; }
    else { x.fillStyle = ink; x.font = '700 46px "Cormorant Garamond", Georgia, serif'; x.fillText($(F.biz).value.trim() || 'Your Business', M, 120); ty = 150; }
    x.fillStyle = mute; x.font = '500 21px Inter'; let by = Math.max(ty, logo ? ty : 160); [$(F.bemail).value.trim(), ...$(F.baddr).value.split('\n')].filter(Boolean).slice(0, 4).forEach((l) => { x.fillText(l, M, by); by += 30; });
    x.textAlign = 'right'; x.fillStyle = col; x.font = '700 64px "Cormorant Garamond", Georgia, serif'; x.fillText(kind().toUpperCase(), W - M, 120);
    x.fillStyle = ink; x.font = '700 24px Inter'; x.fillText($(F.num).value || '', W - M, 166); x.fillStyle = mute; x.font = '500 20px Inter';
    x.fillText('Issued ' + fdate($(F.date).value), W - M, 200); x.fillText((kind() === 'Quote' ? 'Valid until ' : 'Due ') + fdate($(F.due).value), W - M, 230); x.textAlign = 'left';
    // bill to
    const y0 = Math.max(by, 250) + 40; x.fillStyle = col; x.font = '700 15px Inter'; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText(kind() === 'Quote' ? 'PREPARED FOR' : 'BILL TO', M, y0); if ('letterSpacing' in x) x.letterSpacing = '0px';
    x.fillStyle = ink; x.font = '700 30px Inter'; x.fillText($(F.client).value.trim() || 'Client name', M, y0 + 44); x.fillStyle = mute; x.font = '500 21px Inter'; let cy = y0 + 78; [$(F.cemail).value.trim(), ...$(F.caddr).value.split('\n')].filter(Boolean).slice(0, 3).forEach((l) => { x.fillText(l, M, cy); cy += 30; });
    // table
    const cols = { d: M + 20, q: 700, p: 850, t: W - M - 20 };
    const head = (yy) => { x.fillStyle = col; K.rr(x, M, yy, W - M * 2, 56, 10); x.fill(); x.fillStyle = '#fff'; x.font = '700 17px Inter'; if ('letterSpacing' in x) x.letterSpacing = '2px'; x.fillText('DESCRIPTION', cols.d, yy + 36); x.textAlign = 'right'; x.fillText('QTY', cols.q + 60, yy + 36); x.fillText('RATE', cols.p + 120, yy + 36); x.fillText('AMOUNT', cols.t, yy + 36); x.textAlign = 'left'; if ('letterSpacing' in x) x.letterSpacing = '0px'; return yy + 56; };
    let y = head(Math.max(cy, y0 + 90) + 40), n = 0;
    for (const it of items) {
      x.font = '500 23px Inter'; const dl = Math.min(3, Math.max(1, Math.ceil(x.measureText(it.d || ' ').width / (cols.q - cols.d - 40)))), rh = 30 + dl * 30;
      if (y + rh > H - 150) { x = mk(); y = head(100); }
      if (n % 2) { x.fillStyle = '#faf8f2'; x.fillRect(M, y, W - M * 2, rh); } x.fillStyle = ink; x.font = '500 23px Inter'; K.wrap(x, it.d || '', cols.d, y + 40, cols.q - cols.d - 40, 30, 3);
      x.textAlign = 'right'; x.fillText(String(it.q), cols.q + 60, y + 40); x.fillText(money(it.p), cols.p + 120, y + 40); x.font = '700 23px Inter'; x.fillText(money(it.q * it.p), cols.t, y + 40); x.textAlign = 'left';
      x.strokeStyle = line; x.lineWidth = 1; x.beginPath(); x.moveTo(M, y + rh); x.lineTo(W - M, y + rh); x.stroke(); y += rh; n++;
    }
    // totals
    if (y + 300 > H - 150) { x = mk(); y = 100; }
    y += 36; const notesTop = y; const tx = 760, line2 = (l, v, b) => { x.fillStyle = b ? ink : mute; x.font = (b ? '700 ' : '500 ') + '22px Inter'; x.fillText(l, tx, y); x.textAlign = 'right'; x.fillStyle = ink; x.fillText(v, W - M - 20, y); x.textAlign = 'left'; y += 42; };
    line2('Subtotal', money(T.sub)); if (T.disc) line2('Discount (' + ($(F.disc).value || 0) + '%)', '−' + money(T.disc)); if (T.tax) line2('Tax (' + ($(F.tax).value || 0) + '%)', money(T.tax));
    x.fillStyle = col; K.rr(x, tx - 24, y - 20, W - M - tx + 24, 78, 14); x.fill(); x.fillStyle = '#fff'; x.font = '700 22px Inter'; x.fillText(kind() === 'Quote' ? 'Total quote' : 'Total due', tx, y + 28); x.textAlign = 'right'; x.font = '700 34px Inter'; x.fillText(money(T.total), W - M - 20, y + 32); x.textAlign = 'left';
    // notes + bank (left of totals area)
    let ny = notesTop; const blocks = [['NOTES', $(F.notes).value.trim()], ['PAYMENT DETAILS', $(F.bank).value.trim()]].filter((b) => b[1]);
    blocks.forEach((b) => { x.fillStyle = col; x.font = '700 14px Inter'; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText(b[0], M, ny); if ('letterSpacing' in x) x.letterSpacing = '0px'; x.fillStyle = mute; x.font = '500 20px Inter'; ny += 12; b[1].split('\n').slice(0, 6).forEach((l) => { ny += K.wrap(x, l, M, ny + 24, 600, 28, 3) * 28; }); ny += 40; });
    out.forEach((c, i) => { const g = c.getContext('2d'); g.fillStyle = '#b5ae9d'; g.font = '500 15px Inter'; g.fillText(`${$(F.biz).value.trim() || 'Your Business'}  ·  ${$(F.num).value}  ·  Page ${i + 1} of ${out.length}`, M, H - 40); g.textAlign = 'right'; g.fillText('Made with VibrantRevolve Invoice Maker', W - M, H - 40); g.textAlign = 'left'; });
    return out;
  }
  async function draw() {
    const my = ++token; const p = await render(); if (my !== token) return; pages = p; page = Math.min(page, p.length - 1); show();
    const T = totals(); $('#iv-total').textContent = money(T.total);
    const tabs = $('#iv-tabs'); tabs.innerHTML = ''; tabs.hidden = p.length < 2; p.forEach((_, i) => { const b = K.el('button', '', 'Page ' + (i + 1)); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === page)); b.onclick = () => { page = i; show(); K.$$('#iv-tabs button').forEach((x, j) => x.setAttribute('aria-selected', String(j === i))); }; tabs.appendChild(b); });
  }
  function show() { const d = $('#iv-doc'); d.innerHTML = ''; pages[page].setAttribute('role', 'img'); pages[page].setAttribute('aria-label', kind() + ' preview page ' + (page + 1)); d.appendChild(pages[page]); }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 200); }; const persist = () => { const o = { n: saved.n }; KEEP.forEach((k) => (o[k] = $(F[k]).value)); K.store.set('iv', Object.assign(saved, o)); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { if (KEEP.includes(k)) persist(); soft(); }));
  K.$$('input[name="iv-kind"]').forEach((r) => r.addEventListener('change', () => { $('#iv-duelabel').textContent = kind() === 'Quote' ? 'Valid until' : 'Due date'; if (/^(INV|QUO)-/.test($(F.num).value)) $(F.num).value = $(F.num).value.replace(/^(INV|QUO)/, kind() === 'Quote' ? 'QUO' : 'INV'); draw(); }));
  $('#iv-add').onclick = () => { items.push({ d: '', q: 1, p: 0 }); rows(); const l = K.$$('#iv-items .li'); l[l.length - 1].querySelector('input').focus(); draw(); };
  $('#iv-logo').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); const c = K.canvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); logo = c; URL.revokeObjectURL(url); $('#iv-logo-name').textContent = f.name; draw(); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#iv-logo-clear').onclick = () => { logo = null; $('#iv-logo').value = ''; $('#iv-logo-name').textContent = 'No logo'; draw(); };
  const base = () => K.slug(($(F.num).value || 'invoice') + '-' + ($(F.client).value || 'client'));
  const bump = () => { saved.n = (parseInt(($(F.num).value.match(/(\d+)$/) || [0, 0])[1], 10) || 0) + 1; persist(); };
  $('#iv-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(K.pdfFromCanvases(pages, { title: kind() + ' ' + $(F.num).value }), base() + '.pdf'); K.toast('PDF downloaded'); });
  $('#iv-png').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(await K.canvasBlob(pages[page]), base() + '-p' + (page + 1) + '.png'); K.toast('Image downloaded'); });
  $('#iv-share').onclick = (e) => K.busy(e.currentTarget, async () => {
    await draw(); const blob = K.pdfFromCanvases(pages, { title: kind() + ' ' + $(F.num).value }), f = new File([blob], base() + '.pdf', { type: 'application/pdf' }), msg = `${kind()} ${$(F.num).value} from ${$(F.biz).value || 'us'}. Total: ${money(totals().total)}.`;
    if (await K.share([f], msg, kind() + ' ' + $(F.num).value)) return; K.download(blob, f.name); const em = $(F.cemail).value.trim(); K.toast('PDF saved. Attach it to your message.'); if (em) setTimeout(() => { location.href = 'mailto:' + encodeURIComponent(em) + '?subject=' + encodeURIComponent(kind() + ' ' + $(F.num).value) + '&body=' + encodeURIComponent(msg + '\n\n(Attach the downloaded PDF.)'); }, 700);
  });
  $('#iv-next').onclick = () => { bump(); const n = saved.n; $(F.num).value = (kind() === 'Quote' ? 'QUO-' : 'INV-') + String(n).padStart(3, '0'); $(F.date).value = iso(new Date()); draw(); K.toast('Number advanced'); };
  rows(); draw();
})();
