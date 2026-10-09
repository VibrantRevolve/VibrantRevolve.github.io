/* Price List & Catalogue Maker: paginated A4 PDF/PNG with optional photos. Nothing is uploaded unless you use the AI helper. */
(function () {
  const K = window.VRKit, $ = K.$; const form = $('#pl-form'); if (!form) return;
  const CUR = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: '₵', KES: 'KSh ', ZAR: 'R ' };
  $('#pl-cur').innerHTML = Object.keys(CUR).map((c) => `<option value="${c}">${c} ${CUR[c].trim()}</option>`).join('');
  const F = { biz: '#pl-biz', title: '#pl-title', sub: '#pl-sub', contact: '#pl-contact', order: '#pl-order', color: '#pl-color', cur: '#pl-cur' };
  const KEEP = ['biz', 'title', 'sub', 'contact', 'order', 'color', 'cur']; const saved = K.store.get('pl', {}); KEEP.forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  let logo = null, pages = [], page = 0, token = 0; const layout = () => (form.querySelector('input[name="pl-layout"]:checked') || {}).value || 'list';
  const items = [{ n: '# Hair & beauty', d: '', p: '' }, { n: 'Braids (medium)', d: 'Knotless, includes hair', p: '25000' }, { n: 'Wash & blow-dry', d: 'Includes deep conditioning', p: '8000' }, { n: 'Home service', d: 'Within the island', p: 'From 5000' }];
  const price = (p) => { p = String(p || '').trim(); if (!p) return ''; if (/^[\d.,\s]+$/.test(p)) { const n = parseFloat(p.replace(/,/g, '')); return isNaN(n) ? p : CUR[$(F.cur).value] + new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(n); } return p.replace(/(\d[\d,]*(\.\d+)?)/, (m) => CUR[$(F.cur).value] + new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(parseFloat(m.replace(/,/g, '')))); };
  function rows() {
    const box = $('#pl-items'); box.innerHTML = '';
    items.forEach((it, i) => {
      const r = K.el('div', 'pl-item');
      r.innerHTML = `<div class="pl-r1"><input aria-label="Product name" value="${K.esc(it.n)}" placeholder="Product (start with # for a heading)"><input aria-label="Price" value="${K.esc(it.p)}" placeholder="Price" inputmode="decimal"><button type="button" class="ib" aria-label="Remove item ${i + 1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div><div class="pl-r2"><input aria-label="Description" value="${K.esc(it.d)}" placeholder="Short description (optional)"><label class="tb tb--sm pl-img" style="cursor:pointer">${it.img ? 'Photo ✓' : 'Photo'}<input type="file" accept="image/*" hidden></label></div>`;
      const [n, p] = r.querySelectorAll('.pl-r1 input'), d = r.querySelector('.pl-r2 input'), file = r.querySelector('input[type=file]'), del = r.querySelector('.ib');
      n.oninput = () => { it.n = n.value; soft(); }; p.oninput = () => { it.p = p.value; soft(); }; d.oninput = () => { it.d = d.value; soft(); };
      del.onclick = () => { items.splice(i, 1); rows(); soft(); };
      file.onchange = async () => { const f = file.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); const c = K.canvas(480, 480); K.cover(c.getContext('2d'), img, 0, 0, 480, 480); it.img = c; URL.revokeObjectURL(url); r.querySelector('.pl-img').firstChild.nodeValue = 'Photo ✓'; soft(); } catch (e) { K.toast('Could not read that image', 'err'); } };
      box.appendChild(r);
    });
  }
  async function render() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const W = 1240, H = 1754, M = 90, col = $(F.color).value || '#1f3a5f', ink = '#1b1813', mute = '#6c665a', line = '#e5e0d6', out = [], grid = layout() === 'grid';
    const mk = (first) => { const p = K.page('#ffffff'); out.push(p.c); const x = p.x; x.fillStyle = col; x.fillRect(0, 0, W, 16); return x; };
    let x = mk(true), y = 0;
    // header
    let ty = 120; if (logo) { const s = Math.min(1, 110 / logo.height, 280 / logo.width); x.drawImage(logo, M, 70, logo.width * s, logo.height * s); } else { x.fillStyle = ink; x.font = '700 40px "Cormorant Garamond", Georgia, serif'; x.fillText($(F.biz).value.trim() || 'Your Business', M, 112); }
    x.textAlign = 'right'; x.fillStyle = col; x.font = '700 70px "Cormorant Garamond", Georgia, serif'; x.fillText(($(F.title).value.trim() || 'Price List'), W - M, 128); x.fillStyle = mute; x.font = '500 22px Inter'; x.fillText($(F.sub).value.trim() || '', W - M, 168); x.textAlign = 'left';
    if (logo && $(F.biz).value.trim()) { x.fillStyle = mute; x.font = '600 22px Inter'; x.fillText($(F.biz).value.trim(), M, 70 + Math.min(110, logo.height * Math.min(1, 110 / logo.height, 280 / logo.width)) + 36); }
    y = 250; x.strokeStyle = line; x.lineWidth = 2; x.beginPath(); x.moveTo(M, y - 30); x.lineTo(W - M, y - 30); x.stroke();
    const BOTTOM = H - 170, newPage = () => { x = mk(false); y = 110; };
    const head = (t) => { if (y + 120 > BOTTOM) newPage(); y += 20; x.fillStyle = col; x.font = '700 20px Inter'; if ('letterSpacing' in x) x.letterSpacing = '4px'; x.fillText(t.toUpperCase(), M, y + 24); if ('letterSpacing' in x) x.letterSpacing = '0px'; x.fillStyle = col; x.fillRect(M, y + 40, 60, 4); y += 78; };
    const data = items.filter((i) => (i.n || '').trim());
    if (!grid) {
      for (const it of data) {
        if (it.n.trim().startsWith('#')) { head(it.n.trim().replace(/^#+\s*/, '')); continue; }
        x.font = '700 27px Inter'; const th = it.img ? 120 : 0, tw = it.img ? 150 : 0, nw = W - M * 2 - tw - 230; const dl = it.d ? Math.min(3, Math.ceil(x.measureText(it.d).width * 0.86 / nw) || 1) : 0, rh = Math.max(th, 44 + dl * 28) + 34;
        if (y + rh > BOTTOM) newPage();
        if (it.img) { x.save(); K.rr(x, M, y, 120, 120, 14); x.clip(); x.drawImage(it.img, M, y, 120, 120); x.restore(); }
        x.fillStyle = ink; x.font = '700 27px Inter'; x.fillText(it.n.trim(), M + tw, y + 34); x.fillStyle = mute; x.font = '500 21px Inter'; if (it.d) K.wrap(x, it.d, M + tw, y + 68, nw, 28, 3);
        x.textAlign = 'right'; x.fillStyle = col; x.font = '700 30px Inter'; x.fillText(price(it.p), W - M, y + 36); x.textAlign = 'left'; y += rh - 12; x.strokeStyle = line; x.lineWidth = 1.5; x.setLineDash([2, 6]); x.beginPath(); x.moveTo(M, y); x.lineTo(W - M, y); x.stroke(); x.setLineDash([]); y += 24;
      }
    } else {
      const cw = (W - M * 2 - 40) / 2; let col0 = 0, rowH = 0, rowItems = [];
      const cardH = (it) => { x.font = '500 21px Inter'; const dl = it.d ? Math.min(3, Math.ceil(x.measureText(it.d).width / (cw - 50)) || 1) : 0; return (it.img ? cw * 0.62 : 0) + 100 + dl * 28; };
      const flush = () => { if (!rowItems.length) return; const h = Math.max(...rowItems.map(cardH)); if (y + h > BOTTOM) newPage();
        rowItems.forEach((it, c) => { const X = M + c * (cw + 40); x.fillStyle = '#faf8f2'; K.rr(x, X, y, cw, h, 18); x.fill(); x.strokeStyle = line; x.lineWidth = 1.5; x.stroke(); let yy = y; const ih = cw * 0.62; if (it.img) { x.save(); K.rr(x, X, y, cw, ih, 18); x.clip(); K.cover(x, it.img, X, y, cw, ih); x.restore(); yy += ih; }
          x.fillStyle = ink; x.font = '700 25px Inter'; K.wrap(x, it.n.trim(), X + 25, yy + 42, cw - 50, 30, 1); x.fillStyle = mute; x.font = '500 20px Inter'; if (it.d) K.wrap(x, it.d, X + 25, yy + 74, cw - 50, 28, 3); x.fillStyle = col; x.font = '700 28px Inter'; x.fillText(price(it.p), X + 25, y + h - 24); }); y += h + 30; rowItems = []; };
      for (const it of data) { if (it.n.trim().startsWith('#')) { flush(); head(it.n.trim().replace(/^#+\s*/, '')); continue; } rowItems.push(it); if (rowItems.length === 2) flush(); } flush();
    }
    // footer on each page
    out.forEach((c, i) => { const g = c.getContext('2d'); g.fillStyle = col; g.fillRect(M, H - 140, W - M * 2, 2); g.fillStyle = ink; g.font = '600 22px Inter'; g.fillText($(F.order).value.trim().slice(0, 70), M, H - 90); g.fillStyle = mute; g.font = '500 20px Inter'; g.fillText($(F.contact).value.trim().slice(0, 80), M, H - 56); g.textAlign = 'right'; g.fillStyle = '#b5ae9d'; g.font = '500 15px Inter'; g.fillText(`Page ${i + 1} of ${out.length}`, W - M, H - 56); g.textAlign = 'left'; });
    return out;
  }
  async function draw() { const my = ++token, p = await render(); if (my !== token) return; pages = p; page = Math.min(page, p.length - 1); show(); const tabs = $('#pl-tabs'); tabs.innerHTML = ''; tabs.hidden = p.length < 2; p.forEach((_, i) => { const b = K.el('button', '', 'Page ' + (i + 1)); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === page)); b.onclick = () => { page = i; show(); K.$$('#pl-tabs button').forEach((x, j) => x.setAttribute('aria-selected', String(j === i))); }; tabs.appendChild(b); }); }
  function show() { const d = $('#pl-doc'); d.innerHTML = ''; pages[page].setAttribute('role', 'img'); pages[page].setAttribute('aria-label', 'Price list page ' + (page + 1)); d.appendChild(pages[page]); }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 220); }; const persist = () => { const o = {}; KEEP.forEach((k) => (o[k] = $(F[k]).value)); K.store.set('pl', o); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { persist(); soft(); })); K.$$('input[name="pl-layout"]').forEach((r) => r.addEventListener('change', soft));
  $('#pl-add').onclick = () => { items.push({ n: '', d: '', p: '' }); rows(); const l = K.$$('#pl-items .pl-item'); l[l.length - 1].querySelector('input').focus(); };
  $('#pl-addh').onclick = () => { items.push({ n: '# New section', d: '', p: '' }); rows(); soft(); };
  $('#pl-logo').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); const c = K.canvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); logo = c; URL.revokeObjectURL(url); $('#pl-logo-name').textContent = f.name; draw(); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#pl-logo-clear').onclick = () => { logo = null; $('#pl-logo').value = ''; $('#pl-logo-name').textContent = 'No logo'; draw(); };
  const base = () => K.slug($(F.biz).value || 'price-list') + '-price-list';
  $('#pl-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(K.pdfFromCanvases(pages, { title: ($(F.title).value || 'Price list') + ' ' + $(F.biz).value }), base() + '.pdf'); K.toast('PDF downloaded'); });
  $('#pl-png').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); if (pages.length === 1) K.download(await K.canvasBlob(pages[0]), base() + '.png'); else K.download(await K.zip(await Promise.all(pages.map(async (c, i) => ({ name: base() + '-p' + (i + 1) + '.png', blob: await K.canvasBlob(c) })))), base() + '-images.zip'); K.toast('Images downloaded'); });
  $('#pl-share').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); const blob = K.pdfFromCanvases(pages, { title: 'Price list' }), f = new File([blob], base() + '.pdf', { type: 'application/pdf' }); if (await K.share([f], 'Our price list' + ($(F.biz).value ? ' from ' + $(F.biz).value : '') + '.', 'Price list')) return; K.download(blob, f.name); K.toast('PDF saved. Attach it to your message.'); });
  K.whenAI(() => { const b = K.el('button', 'tb tb--sm', ''); b.type = 'button'; b.innerHTML = K.AI_ICON + ' Write short descriptions'; b.title = 'AI writes a line for each product that has no description'; $('#pl-ai').appendChild(b); $('#pl-ai').hidden = false;
    b.onclick = () => K.busy(b, async () => { const todo = items.filter((i) => i.n.trim() && !i.n.trim().startsWith('#') && !i.d.trim()).slice(0, 30); if (!todo.length) { K.toast('Every product already has a description'); return; } const res = await K.rewrite('describe', todo.map((i) => i.n.trim()).join('\n'), { context: $(F.biz).value.trim() }); if (!res) { K.toast('AI is busy. Try again in a moment.', 'err'); return; } todo.forEach((it, i) => { if (res[i]) it.d = String(res[i]).slice(0, 110); }); rows(); draw(); K.toast('Descriptions added. Edit anything you like.'); }); });
  rows(); draw();
})();
