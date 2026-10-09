/* Receipt Maker: payment receipts as PNG or PDF, with the amount in words. Nothing is uploaded. */
(function () {
  const K = window.VRKit, $ = K.$; const form = $('#rc-form'); if (!form) return;
  const CUR = { NGN: ['₦', 'Naira', 'Kobo'], USD: ['$', 'Dollars', 'Cents'], GBP: ['£', 'Pounds', 'Pence'], EUR: ['€', 'Euros', 'Cents'], GHS: ['₵', 'Cedis', 'Pesewas'], KES: ['KSh ', 'Shillings', 'Cents'], ZAR: ['R ', 'Rand', 'Cents'] };
  $('#rc-cur').innerHTML = Object.keys(CUR).map((c) => `<option value="${c}">${c} ${CUR[c][0].trim()}</option>`).join('');
  const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'], TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], BIG = ['', ' thousand', ' million', ' billion', ' trillion'];
  const below1000 = (n) => { let s = ''; if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) s += ' and '; } if (n >= 20) { s += TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''); } else if (n) s += ONES[n]; return s; };
  const words = (n) => { if (n === 0) return 'zero'; const parts = []; let last = 0; for (let i = 0; n > 0 && i < BIG.length; i++, n = Math.floor(n / 1000)) { const c = n % 1000; if (i === 0) last = c; if (c) parts.unshift(below1000(c) + BIG[i]); } return parts.length < 2 ? parts[0] : parts.slice(0, -1).join(', ') + (last && last < 100 ? ' and ' : ', ') + parts[parts.length - 1]; };
  K.numberWords = (amount, cur) => { const c = CUR[cur] || CUR.NGN, total = Math.round(Math.abs(amount) * 100), major = Math.floor(total / 100), minor = total % 100; let s = words(major) + ' ' + c[1]; if (minor) s += ' and ' + words(minor) + ' ' + c[2]; return (s.charAt(0).toUpperCase() + s.slice(1)) + ' only'; };
  const saved = K.store.get('rc', {}); let logo = null, canvas = null, token = 0;
  const F = { biz: '#rc-biz', contact: '#rc-contact', addr: '#rc-addr', color: '#rc-color', cur: '#rc-cur', num: '#rc-num', date: '#rc-date', who: '#rc-who', tax: '#rc-tax', disc: '#rc-disc', method: '#rc-method', note: '#rc-note' };
  const KEEP = ['biz', 'contact', 'addr', 'color', 'cur', 'note'];
  KEEP.forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  $(F.date).value = new Date().toISOString().slice(0, 10); $(F.num).value = 'REC-' + String(saved.n || 1).padStart(3, '0');
  if (!$(F.note).value) $(F.note).value = 'Thank you for your payment.';
  const items = [{ d: 'Website design (part payment)', q: 1, p: 75000 }];
  const num = (n) => new Intl.NumberFormat('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const money = (n) => (CUR[$(F.cur).value] || CUR.NGN)[0] + num(n);
  const totals = () => { const sub = items.reduce((a, i) => a + i.q * i.p, 0), d = Math.min(sub, sub * (parseFloat($(F.disc).value) || 0) / 100), net = sub - d, tax = net * (parseFloat($(F.tax).value) || 0) / 100; return { sub, d, tax, total: net + tax }; };
  function rows() {
    const box = $('#rc-items'); box.innerHTML = '';
    items.forEach((it, i) => { const r = K.el('div', 'li'); r.innerHTML = `<input aria-label="Description" value="${K.esc(it.d)}" placeholder="Description"><input aria-label="Quantity" type="number" min="0" step="any" value="${it.q}"><input aria-label="Price" type="number" min="0" step="any" value="${it.p}">`;
      const del = K.elh('button', 'ib', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>'); del.type = 'button'; del.setAttribute('aria-label', 'Remove line ' + (i + 1)); del.onclick = () => { items.splice(i, 1); if (!items.length) items.push({ d: '', q: 1, p: 0 }); rows(); soft(); };
      const [a, b, c] = r.querySelectorAll('input'); a.oninput = () => { it.d = a.value; soft(); }; b.oninput = () => { it.q = parseFloat(b.value) || 0; soft(); }; c.oninput = () => { it.p = parseFloat(c.value) || 0; soft(); }; r.appendChild(del); box.appendChild(r); });
  }
  async function render() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const W = 800, M = 56, col = $(F.color).value || '#1f3a5f', ink = '#1b1813', mute = '#6c665a', T = totals();
    const big = K.canvas(W, 3600), x = big.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, 3600); x.fillStyle = col; x.fillRect(0, 0, W, 14);
    let y = 70; const cx = W / 2; x.textAlign = 'center';
    if (logo) { const s = Math.min(1, 90 / logo.height, 280 / logo.width), w = logo.width * s, h = logo.height * s; x.drawImage(logo, cx - w / 2, y, w, h); y += h + 34; }
    x.fillStyle = ink; x.font = '700 40px "Cormorant Garamond", Georgia, serif'; y += 30; x.fillText($(F.biz).value.trim() || 'Your Business', cx, y); y += 14;
    x.fillStyle = mute; x.font = '500 20px Inter'; [$(F.contact).value.trim(), ...$(F.addr).value.split('\n')].filter(Boolean).slice(0, 4).forEach((l) => { y += 28; x.fillText(l, cx, y); });
    y += 44; x.fillStyle = col; x.font = '700 22px Inter'; if ('letterSpacing' in x) x.letterSpacing = '6px'; x.fillText('PAYMENT RECEIPT', cx, y); if ('letterSpacing' in x) x.letterSpacing = '0px';
    const dash = () => { x.strokeStyle = '#cfc8b8'; x.setLineDash([8, 7]); x.lineWidth = 2; x.beginPath(); x.moveTo(M, y); x.lineTo(W - M, y); x.stroke(); x.setLineDash([]); };
    y += 32; dash(); x.textAlign = 'left';
    const kv = (a, b) => { y += 38; x.fillStyle = mute; x.font = '500 20px Inter'; x.textAlign = 'left'; x.fillText(a, M, y); x.fillStyle = ink; x.font = '600 20px Inter'; x.textAlign = 'right'; x.fillText(b, W - M, y); x.textAlign = 'left'; };
    const d = new Date($(F.date).value + 'T00:00'); kv('Receipt no.', $(F.num).value || '—'); kv('Date', isNaN(d) ? $(F.date).value : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })); if ($(F.who).value.trim()) kv('Received from', $(F.who).value.trim().slice(0, 34)); kv('Paid by', $(F.method).value);
    y += 30; dash(); y += 14;
    items.forEach((it) => { y += 34; x.font = '600 21px Inter'; x.fillStyle = ink; const n = K.wrap(x, it.d || 'Item', M, y, 440, 28, 3); x.textAlign = 'right'; x.fillText(money(it.q * it.p), W - M, y); x.textAlign = 'left'; y += (n - 1) * 28; if (it.q !== 1) { y += 26; x.font = '500 17px Inter'; x.fillStyle = mute; x.fillText(`${it.q} × ${money(it.p)}`, M, y); } });
    y += 30; dash(); const ln = (a, b) => { y += 36; x.fillStyle = mute; x.font = '500 20px Inter'; x.fillText(a, M, y); x.fillStyle = ink; x.textAlign = 'right'; x.fillText(b, W - M, y); x.textAlign = 'left'; };
    if (T.d || T.tax) ln('Subtotal', money(T.sub)); if (T.d) ln('Discount', '−' + money(T.d)); if (T.tax) ln('Tax (' + ($(F.tax).value || 0) + '%)', money(T.tax));
    y += 22; x.fillStyle = col; K.rr(x, M, y, W - M * 2, 84, 16); x.fill(); x.fillStyle = '#fff'; x.font = '700 22px Inter'; x.fillText('AMOUNT PAID', M + 26, y + 50); x.textAlign = 'right'; x.font = '700 38px Inter'; x.fillText(money(T.total), W - M - 26, y + 55); x.textAlign = 'left'; y += 84;
    y += 40; x.fillStyle = mute; x.font = '600 15px Inter'; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText('AMOUNT IN WORDS', M, y); if ('letterSpacing' in x) x.letterSpacing = '0px'; x.fillStyle = ink; x.font = 'italic 600 22px "Cormorant Garamond", Georgia, serif'; y += 12; y += K.wrap(x, K.numberWords(T.total, $(F.cur).value), M, y + 22, W - M * 2, 30, 4) * 30 - 6;
    const note = $(F.note).value.trim(); if (note) { y += 40; x.fillStyle = mute; x.font = '500 19px Inter'; y += K.wrap(x, note, M, y, W - M * 2, 28, 4) * 28 - 8; }
    // PAID stamp
    x.save(); x.translate(W - 190, 250); x.rotate(-0.22); x.strokeStyle = 'rgba(30,140,80,.55)'; x.fillStyle = 'rgba(30,140,80,.55)'; x.lineWidth = 6; K.rr(x, -80, -34, 160, 68, 12); x.stroke(); x.font = '800 40px Inter'; x.textAlign = 'center'; x.fillText('PAID', 0, 14); x.restore();
    y += 56; x.textAlign = 'center'; x.fillStyle = '#b5ae9d'; x.font = '500 14px Inter'; x.fillText('Made with VibrantRevolve Receipt Maker', cx, y); y += 34;
    const out = K.canvas(W, Math.ceil(y)); out.getContext('2d').drawImage(big, 0, 0); return out;
  }
  async function draw() { const my = ++token, c = await render(); if (my !== token) return; canvas = c; const d = $('#rc-doc'); d.innerHTML = ''; c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Receipt preview'); d.appendChild(c); $('#rc-total').textContent = money(totals().total); }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 200); }; const persist = () => { const o = { n: saved.n }; KEEP.forEach((k) => (o[k] = $(F[k]).value)); K.store.set('rc', Object.assign(saved, o)); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { if (KEEP.includes(k)) persist(); soft(); }));
  $('#rc-add').onclick = () => { items.push({ d: '', q: 1, p: 0 }); rows(); const l = K.$$('#rc-items .li'); l[l.length - 1].querySelector('input').focus(); soft(); };
  $('#rc-logo').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); const c = K.canvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); logo = c; URL.revokeObjectURL(url); $('#rc-logo-name').textContent = f.name; draw(); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#rc-logo-clear').onclick = () => { logo = null; $('#rc-logo').value = ''; $('#rc-logo-name').textContent = 'No logo'; draw(); };
  const base = () => K.slug(($(F.num).value || 'receipt') + '-' + ($(F.who).value || 'customer'));
  $('#rc-png').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(await K.canvasBlob(canvas), base() + '.png'); K.toast('Image downloaded'); });
  $('#rc-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); const w = 360, h = canvas.height * w / canvas.width; K.download(K.pdfPages([{ canvas, w, h }], { title: 'Receipt ' + $(F.num).value }), base() + '.pdf'); K.toast('PDF downloaded'); });
  $('#rc-share').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); const blob = await K.canvasBlob(canvas), f = new File([blob], base() + '.png', { type: 'image/png' }); if (await K.share([f], `Receipt ${$(F.num).value} from ${$(F.biz).value || 'us'}. Amount paid: ${money(totals().total)}.`, 'Receipt')) return; K.download(blob, f.name); K.toast('Image saved. Attach it to your message.'); });
  $('#rc-next').onclick = () => { const n = (parseInt(($(F.num).value.match(/(\d+)$/) || [0, 0])[1], 10) || 0) + 1; saved.n = n; persist(); $(F.num).value = 'REC-' + String(n).padStart(3, '0'); $(F.date).value = new Date().toISOString().slice(0, 10); draw(); K.toast('Number advanced'); };
  rows(); draw();
})();
