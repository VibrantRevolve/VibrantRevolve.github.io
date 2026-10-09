/* Business Card Maker: 90 x 55 mm cards, front and back, PNG at 300 dpi and an A4 print sheet. Nothing is uploaded. */
(function () {
  const K = window.VRKit, $ = K.$; const form = $('#bk-form'); if (!form) return;
  const W = 1063, H = 650; // 90 x 55 mm at 300 dpi
  const TPL = [['classic', 'Classic'], ['bold', 'Bold'], ['split', 'Split'], ['minimal', 'Minimal'], ['dark', 'Dark & gold'], ['band', 'Top band']];
  const F = { name: '#bk-name', title: '#bk-title', co: '#bk-co', phone: '#bk-phone', email: '#bk-email', web: '#bk-web', addr: '#bk-addr', tag: '#bk-tag', c1: '#bk-c1', c2: '#bk-c2' };
  const saved = K.store.get('bk', {}); Object.keys(F).forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  let tpl = saved.tpl || 'classic', side = 'front', logo = null, token = 0, front = null, back = null;
  const tp = $('#bk-tpl'); TPL.forEach(([id, l]) => { const b = K.el('button', 'chip', l); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(id === tpl)); b.onclick = () => { tpl = id; K.$$('#bk-tpl .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === id))); persist(); soft(); }; tp.appendChild(b); });
  const v = (k) => $(F[k]).value.trim();
  function qr(text) { try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(), m = []; for (let r = 0; r < n; r++) { m[r] = []; for (let c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; } catch (e) { return null; } }
  const url = () => { const w = v('web'); return w ? (/^https?:\/\//i.test(w) ? w : 'https://' + w) : ''; };
  function theme() {
    const c1 = $(F.c1).value || '#1f3a5f', c2 = $(F.c2).value || '#c9a24b';
    return { c1, c2, ink: '#1b1813', mute: '#5f594d', paper: '#ffffff' };
  }
  function contacts() { return [['T', v('phone')], ['E', v('email')], ['W', v('web').replace(/^https?:\/\//i, '')], ['A', v('addr')]].filter((r) => r[1]); }
  const ICONS = { T: 'M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z', E: 'M3 5h18v14H3zM3 7l9 6 9-6', W: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', A: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' };
  function icon(x, k, X, Y, s, col) { x.save(); x.translate(X, Y); x.scale(s / 24, s / 24); x.strokeStyle = col; x.fillStyle = 'none'; x.lineWidth = 2; x.lineJoin = 'round'; x.lineCap = 'round'; x.stroke(new Path2D(ICONS[k])); x.restore(); }
  function contactBlock(x, X, Y, maxW, col, ink, gap, px) {
    x.textBaseline = 'alphabetic'; x.font = `500 ${px}px Inter`; let y = Y;
    contacts().forEach(([k, t]) => { icon(x, k, X, y - px + 4, px + 2, col); x.fillStyle = ink; const n = K.wrap(x, t, X + px + 22, y, maxW - px - 22, px + 6, 2); y += gap + (n - 1) * (px + 6); }); return y;
  }
  function logoAt(x, X, Y, bw, bh, align) { if (!logo) return 0; const s = Math.min(bw / logo.width, bh / logo.height), w = logo.width * s, h = logo.height * s, px = align === 'center' ? X - w / 2 : X; x.drawImage(logo, px, Y, w, h); return h; }
  async function drawFront() {
    const t = theme(), c = K.canvas(W, H), x = c.getContext('2d'); const name = v('name') || 'Your Name', title = v('title') || 'Job Title', co = v('co') || 'Company';
    x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    const nameFont = (px, col, X, Y, mw) => { x.fillStyle = col; let p = px; do { x.font = `700 ${p}px "Cormorant Garamond", Georgia, serif`; p -= 2; } while (x.measureText(name).width > mw && p > 30); x.fillText(name, X, Y); };
    const sub = (txt, col, X, Y, px) => { x.fillStyle = col; x.font = `600 ${px || 24}px Inter`; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText(txt.toUpperCase(), X, Y); if ('letterSpacing' in x) x.letterSpacing = '0px'; };
    if (tpl === 'classic') {
      x.fillStyle = t.paper; x.fillRect(0, 0, W, H); x.fillStyle = t.c1; x.fillRect(0, 0, 26, H); x.fillStyle = t.c2; x.fillRect(26, 0, 6, H);
      nameFont(70, t.c1, 90, 170, 560); sub(title, t.c2, 90, 218); x.fillStyle = t.mute; x.font = '600 26px Inter'; x.fillText(co, 90, 262);
      contactBlock(x, 90, 380, 520, t.c1, t.ink, 56, 24); logoAt(x, W - 80 - 200, 70, 200, 130, 'left');
    } else if (tpl === 'bold') {
      x.fillStyle = t.c1; x.fillRect(0, 0, W, H); x.fillStyle = t.c2; x.fillRect(0, H - 14, W, 14);
      nameFont(78, '#fff', 80, 190, 640); sub(title, t.c2, 80, 244, 25); x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '600 27px Inter'; x.fillText(co, 80, 290);
      contactBlock(x, 80, 400, 560, t.c2, '#fff', 54, 24); logoAt(x, W - 80 - 190, 70, 190, 120, 'left');
    } else if (tpl === 'split') {
      x.fillStyle = t.paper; x.fillRect(0, 0, W, H); x.fillStyle = t.c1; x.beginPath(); x.moveTo(0, 0); x.lineTo(430, 0); x.lineTo(330, H); x.lineTo(0, H); x.closePath(); x.fill(); x.fillStyle = t.c2; x.beginPath(); x.moveTo(430, 0); x.lineTo(452, 0); x.lineTo(352, H); x.lineTo(330, H); x.closePath(); x.fill();
      if (logo) logoAt(x, 150, 90, 180, 120, 'center'); else { x.fillStyle = '#fff'; x.font = '700 120px "Cormorant Garamond", serif'; x.textAlign = 'center'; x.fillText((co[0] || 'V').toUpperCase(), 150, 200); x.textAlign = 'left'; }
      x.fillStyle = '#fff'; x.font = '600 24px Inter'; x.textAlign = 'center'; K.wrap(x, co, 150, 470, 250, 30, 2); x.textAlign = 'left';
      nameFont(60, t.c1, 500, 190, 500); sub(title, t.c2, 500, 236, 22); contactBlock(x, 500, 340, 500, t.c1, t.ink, 56, 23);
    } else if (tpl === 'minimal') {
      x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, W, H); x.textAlign = 'center'; let top = 120; if (logo) { top += logoAt(x, W / 2, 70, 150, 90, 'center') + 20; }
      x.fillStyle = t.ink; let p = 74; do { x.font = `700 ${p}px "Cormorant Garamond", Georgia, serif`; p -= 2; } while (x.measureText(name).width > W - 160 && p > 30); x.fillText(name, W / 2, top + 70); sub(title, t.c1, W / 2 + 2, top + 118, 23);
      x.fillStyle = t.c2; x.fillRect(W / 2 - 40, top + 150, 80, 4); x.fillStyle = t.mute; x.font = '500 25px Inter'; const parts = contacts().map((r) => r[1]); let yy = top + 205; for (let i = 0; i < parts.length && yy < H - 30; i += 2) { x.fillText(parts.slice(i, i + 2).join('   ·   '), W / 2, yy); yy += 40; } x.textAlign = 'left';
    } else if (tpl === 'dark') {
      x.fillStyle = '#14120e'; x.fillRect(0, 0, W, H); x.strokeStyle = t.c2; x.lineWidth = 3; x.strokeRect(28, 28, W - 56, H - 56);
      nameFont(72, '#f4efe2', 90, 190, 600); sub(title, t.c2, 90, 240, 24); x.fillStyle = '#b9b3a4'; x.font = '600 26px Inter'; x.fillText(co, 90, 288); contactBlock(x, 90, 395, 560, t.c2, '#e8e2d2', 54, 24); logoAt(x, W - 90 - 190, 80, 190, 120, 'left');
    } else {
      x.fillStyle = t.paper; x.fillRect(0, 0, W, H); x.fillStyle = t.c1; x.fillRect(0, 0, W, 190); x.fillStyle = t.c2; x.fillRect(0, 190, W, 8);
      nameFont(66, '#fff', 70, 95, W - 340); x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '600 24px Inter'; if ('letterSpacing' in x) x.letterSpacing = '3px'; x.fillText(title.toUpperCase(), 70, 148); if ('letterSpacing' in x) x.letterSpacing = '0px';
      if (logo) { x.fillStyle = '#fff'; K.rr(x, W - 270, 30, 200, 130, 14); x.fill(); logoAt(x, W - 260, 38, 180, 114, 'left'); }
      x.fillStyle = t.mute; x.font = '600 26px Inter'; x.fillText(co, 70, 270); contactBlock(x, 70, 340, 600, t.c1, t.ink, 52, 24);
    }
    return c;
  }
  async function drawBack() {
    const t = theme(), c = K.canvas(W, H), x = c.getContext('2d'); const dark = tpl === 'dark', light = tpl === 'minimal' || tpl === 'classic' || tpl === 'split' || tpl === 'band';
    const bg = dark ? '#14120e' : light && tpl !== 'band' ? '#fbfaf6' : t.c1; x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const fg = bg === '#fbfaf6' ? t.c1 : '#fff', accent = bg === '#fbfaf6' ? t.c2 : (dark ? t.c2 : t.c2);
    x.fillStyle = accent; x.fillRect(0, H - 14, W, 14); x.textAlign = 'center';
    const withQR = $('#bk-qr').checked && url(); const cx = withQR ? 380 : W / 2; let y = 200;
    if (logo) { const s = Math.min(300 / logo.width, 170 / logo.height), w = logo.width * s, h = logo.height * s; const plate = bg !== '#fbfaf6'; if (plate) { x.fillStyle = '#fff'; K.rr(x, cx - w / 2 - 24, y - 24, w + 48, h + 48, 18); x.fill(); } x.drawImage(logo, cx - w / 2, y, w, h); y += h + 70; } else { y = 270; }
    x.fillStyle = fg; let p = 64; const co = v('co') || 'Your Company'; do { x.font = `700 ${p}px "Cormorant Garamond", Georgia, serif`; p -= 2; } while (x.measureText(co).width > (withQR ? 600 : W - 160) && p > 28); x.fillText(co, cx, y);
    if (v('tag')) { x.fillStyle = accent; x.font = '600 24px Inter'; if ('letterSpacing' in x) x.letterSpacing = '2px'; K.wrap(x, v('tag').toUpperCase(), cx, y + 54, withQR ? 560 : 800, 34, 2); if ('letterSpacing' in x) x.letterSpacing = '0px'; }
    if (withQR) { const m = qr(url()); if (m) { const n = m.length, S = 250, cell = Math.floor(S / (n + 4)), size = cell * (n + 4), ox = W - 120 - size, oy = (H - size) / 2; x.fillStyle = '#fff'; K.rr(x, ox, oy, size, size, 16); x.fill(); x.fillStyle = '#111'; for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) if (m[r][q]) x.fillRect(ox + (q + 2) * cell, oy + (r + 2) * cell, cell, cell); x.fillStyle = fg; x.font = '600 20px Inter'; x.fillText('Scan to visit', ox + size / 2, oy + size + 36); } }
    x.textAlign = 'left'; return c;
  }
  async function draw() {
    const my = ++token; await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]); const f = await drawFront(), b = await drawBack(); if (my !== token) return; front = f; back = b; show();
  }
  function show() { const d = $('#bk-doc'); d.innerHTML = ''; const c = side === 'front' ? front : back; if (!c) return; c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Business card ' + side); d.appendChild(c); K.$$('#bk-side button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.s === side))); }
  K.$$('#bk-side button').forEach((b) => (b.onclick = () => { side = b.dataset.s; show(); }));
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 160); };
  const persist = () => { const o = { tpl }; Object.keys(F).forEach((k) => (o[k] = $(F[k]).value)); K.store.set('bk', o); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { persist(); soft(); })); $('#bk-qr').addEventListener('change', soft);
  $('#bk-logo').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const { img, url: u } = await K.fileImage(f); const c = K.canvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); logo = c; URL.revokeObjectURL(u); $('#bk-logo-name').textContent = f.name; draw(); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#bk-logo-clear').onclick = () => { logo = null; $('#bk-logo').value = ''; $('#bk-logo-name').textContent = 'No logo'; draw(); };
  const base = () => K.slug(v('name') || 'business-card');
  $('#bk-png').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(await K.canvasBlob(side === 'front' ? front : back), base() + '-' + side + '.png'); K.toast('Card downloaded (300 dpi)'); });
  $('#bk-zip').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); const files = [{ name: base() + '-front.png', blob: await K.canvasBlob(front) }, { name: base() + '-back.png', blob: await K.canvasBlob(back) }]; K.download(await K.zip(files), base() + '-cards.zip'); K.toast('Both sides downloaded'); });
  function sheet(card) {
    const p = K.page('#ffffff'), x = p.x, cw = 531, ch = 325, ox = (K.A4.w - cw * 2) / 2, oy = (K.A4.h - ch * 5) / 2;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) x.drawImage(card, ox + c * cw, oy + r * ch, cw, ch);
    x.strokeStyle = '#000'; x.lineWidth = 1.5; const m = 18; [0, 1, 2].forEach((c) => { const X = ox + c * cw; [[oy - m, oy - 4], [oy + ch * 5 + 4, oy + ch * 5 + m]].forEach(([a, b]) => { x.beginPath(); x.moveTo(X, a); x.lineTo(X, b); x.stroke(); }); });
    for (let r = 0; r <= 5; r++) { const Y = oy + r * ch;[[ox - m, ox - 4], [ox + cw * 2 + 4, ox + cw * 2 + m]].forEach(([a, b]) => { x.beginPath(); x.moveTo(a, Y); x.lineTo(b, Y); x.stroke(); }); }
    return p.c;
  }
  $('#bk-sheet').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(K.pdfFromCanvases([sheet(front), sheet(back)], { title: 'Business cards ' + (v('name') || '') }), base() + '-print-sheet.pdf'); K.toast('Print sheet downloaded: page 1 fronts, page 2 backs'); });
  draw();
})();
