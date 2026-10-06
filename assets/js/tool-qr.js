/* QR Code Maker: URL, WhatsApp, Wi-Fi, email, phone, text, contact card. Styled modules, logo, PNG/SVG/PDF export. */
(function () {
  const K = window.VRKit, $ = K.$;
  const form = $('#qr-form'); if (!form || !window.qrcode) return;
  const TYPES = {
    url: { label: 'Website', fields: [['u', 'Web address', 'https://yourbrand.com', 'url']], build: (v) => /^https?:\/\//i.test(v.u) ? v.u : (v.u ? 'https://' + v.u : '') },
    wa: { label: 'WhatsApp', fields: [['n', 'Phone with country code', '2349012739299', 'tel'], ['m', 'Pre-filled message (optional)', 'Hi, I would like to order…', 'text']], build: (v) => v.n ? 'https://wa.me/' + v.n.replace(/\D/g, '') + (v.m ? '?text=' + encodeURIComponent(v.m) : '') : '' },
    wifi: { label: 'Wi-Fi', fields: [['s', 'Network name', 'MyWiFi', 'text'], ['p', 'Password', '', 'text'], ['t', 'Security', 'WPA', 'select:WPA,WEP,nopass']], build: (v) => v.s ? `WIFI:T:${v.t || 'WPA'};S:${v.s.replace(/([\\;,:"])/g, '\\$1')};P:${(v.p || '').replace(/([\\;,:"])/g, '\\$1')};;` : '' },
    mail: { label: 'Email', fields: [['e', 'Email address', 'hello@yourbrand.com', 'email'], ['s', 'Subject (optional)', '', 'text']], build: (v) => v.e ? 'mailto:' + v.e + (v.s ? '?subject=' + encodeURIComponent(v.s) : '') : '' },
    tel: { label: 'Phone', fields: [['n', 'Phone number', '+234…', 'tel']], build: (v) => v.n ? 'tel:' + v.n.replace(/[^\d+]/g, '') : '' },
    text: { label: 'Text', fields: [['t', 'Your text', '', 'textarea']], build: (v) => v.t || '' },
    card: { label: 'Contact card', fields: [['n', 'Full name', '', 'text'], ['o', 'Company', '', 'text'], ['p', 'Phone', '', 'tel'], ['e', 'Email', '', 'email'], ['w', 'Website', '', 'url']], build: (v) => v.n ? ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + v.n, v.o && 'ORG:' + v.o, v.p && 'TEL:' + v.p, v.e && 'EMAIL:' + v.e, v.w && 'URL:' + v.w, 'END:VCARD'].filter(Boolean).join('\n') : '' }
  };
  let type = 'url', logo = null, token = 0, matrix = null;
  $('#qr-types').innerHTML = Object.keys(TYPES).map((k, i) => `<label class="chip"><input type="radio" name="qr-type" value="${k}" ${i === 0 ? 'checked' : ''}><span>${TYPES[k].label}</span></label>`).join('');
  function fields() {
    const box = $('#qr-fields'); box.innerHTML = '';
    TYPES[type].fields.forEach(([id, label, ph, kind]) => {
      const l = K.el('label', 'f'); l.innerHTML = `<span>${label}</span>`; let inp;
      if (kind.startsWith('select:')) { inp = document.createElement('select'); inp.innerHTML = kind.slice(7).split(',').map((o) => `<option>${o}</option>`).join(''); }
      else if (kind === 'textarea') { inp = document.createElement('textarea'); inp.rows = 3; } else { inp = document.createElement('input'); inp.type = kind; }
      inp.dataset.k = id; inp.placeholder = ph; if (type === 'url' && id === 'u') inp.value = 'https://vibrantrevolve.com'; inp.autocomplete = 'off'; inp.maxLength = 400; inp.addEventListener('input', soft); inp.addEventListener('change', soft); l.appendChild(inp); box.appendChild(l);
    });
  }
  const vals = () => { const v = {}; K.$$('#qr-fields [data-k]').forEach((i) => (v[i.dataset.k] = i.value.trim())); return v; };
  const utf8 = (s) => unescape(encodeURIComponent(s));
  const fg = () => $('#qr-fg').value, bg = () => $('#qr-bg').value, style = () => (form.querySelector('input[name="qr-style"]:checked') || {}).value || 'square';

  function makeMatrix(text) {
    try { const q = window.qrcode(0, logo ? 'H' : 'M'); q.addData(utf8(text)); q.make(); const n = q.getModuleCount(); const m = []; for (let r = 0; r < n; r++) { m[r] = []; for (let c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; } catch (e) { return null; }
  }
  const inEye = (n, r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const reserve = (n, r, c) => { if (!logo) return false; const s = Math.round(n * 0.22), a = Math.floor((n - s) / 2); return r >= a && r < a + s && c >= a && c < a + s; };

  /* shared geometry used for both canvas and SVG */
  function shapes(m, size, margin) {
    const n = m.length, cell = size / (n + margin * 2), o = margin * cell, st = style(), out = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (!m[r][c] || inEye(n, r, c) || reserve(n, r, c)) continue; const x = o + c * cell, y = o + r * cell;
      if (st === 'dots') out.push({ t: 'c', x: x + cell / 2, y: y + cell / 2, r: cell * 0.42 }); else if (st === 'round') out.push({ t: 'r', x: x + cell * 0.04, y: y + cell * 0.04, w: cell * 0.92, h: cell * 0.92, rx: cell * 0.32 }); else out.push({ t: 'r', x, y, w: cell + 0.4, h: cell + 0.4, rx: 0 });
    }
    [[0, 0], [0, n - 7], [n - 7, 0]].forEach(([r, c]) => { const x = o + c * cell, y = o + r * cell, rad = st === 'square' ? 0 : cell * 1.6; out.push({ t: 'ring', x, y, w: cell * 7, rx: rad, th: cell }); out.push({ t: 'r', x: x + cell * 2, y: y + cell * 2, w: cell * 3, h: cell * 3, rx: st === 'square' ? 0 : cell * 0.9 }); });
    return { out, cell, o, n };
  }
  const sub = (c, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  function draw(ctx, size, margin, text) {
    ctx.fillStyle = bg(); ctx.fillRect(0, 0, size, size); ctx.fillStyle = fg(); const g = shapes(matrix, size, margin);
    g.out.forEach((s) => { ctx.beginPath(); if (s.t === 'c') ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); else if (s.t === 'r') K.rr(ctx, s.x, s.y, s.w, s.h, s.rx); else if (s.t === 'ring') { const i = s.th; sub(ctx, s.x, s.y, s.w, s.w, s.rx); sub(ctx, s.x + i, s.y + i, s.w - i * 2, s.w - i * 2, Math.max(0, s.rx - i)); } ctx.fill(s.t === 'ring' ? 'evenodd' : 'nonzero'); });
    if (logo) { const L = Math.round(matrix.length * 0.22) * g.cell, X = (size - L) / 2; ctx.fillStyle = bg(); K.rr(ctx, X - g.cell * 0.4, X - g.cell * 0.4, L + g.cell * 0.8, L + g.cell * 0.8, g.cell * 1.2); ctx.fill(); K.contain(ctx, logo, X, X, L, L); }
  }
  function svg(size, margin) {
    const g = shapes(matrix, size, margin); let d = '';
    g.out.forEach((s) => { if (s.t === 'c') d += `<circle cx="${s.x.toFixed(2)}" cy="${s.y.toFixed(2)}" r="${s.r.toFixed(2)}"/>`; else if (s.t === 'r') d += `<rect x="${s.x.toFixed(2)}" y="${s.y.toFixed(2)}" width="${s.w.toFixed(2)}" height="${s.h.toFixed(2)}" rx="${s.rx.toFixed(2)}"/>`; else { const i = s.th; d += `<path fill-rule="evenodd" d="M${s.x + s.rx} ${s.y}h${s.w - 2 * s.rx}a${s.rx} ${s.rx} 0 0 1 ${s.rx} ${s.rx}v${s.w - 2 * s.rx}a${s.rx} ${s.rx} 0 0 1 -${s.rx} ${s.rx}h-${s.w - 2 * s.rx}a${s.rx} ${s.rx} 0 0 1 -${s.rx} -${s.rx}v-${s.w - 2 * s.rx}a${s.rx} ${s.rx} 0 0 1 ${s.rx} -${s.rx}zM${s.x + i + Math.max(0, s.rx - i)} ${s.y + i}h${s.w - 2 * i - 2 * Math.max(0, s.rx - i)}a${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)} 0 0 1 ${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)}v${s.w - 2 * i - 2 * Math.max(0, s.rx - i)}a${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)} 0 0 1 -${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)}h-${s.w - 2 * i - 2 * Math.max(0, s.rx - i)}a${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)} 0 0 1 -${Math.max(0, s.rx - i)} -${Math.max(0, s.rx - i)}v-${s.w - 2 * i - 2 * Math.max(0, s.rx - i)}a${Math.max(0, s.rx - i)} ${Math.max(0, s.rx - i)} 0 0 1 ${Math.max(0, s.rx - i)} -${Math.max(0, s.rx - i)}z"/>`; } });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bg()}"/><g fill="${fg()}">${d}</g></svg>`;
  }

  let content = '';
  function update() {
    content = TYPES[type].build(vals()); const stage = $('#qr-canvas'), warn = $('#qr-warn');
    if (!content) { $('#qr-empty').hidden = false; stage.hidden = true; matrix = null; warn.textContent = ''; return; }
    matrix = makeMatrix(content); if (!matrix) { warn.textContent = 'That is too much data for one QR code. Shorten it.'; return; }
    const c = stage, size = 720; c.width = size; c.height = size; draw(c.getContext('2d'), size, 3); c.hidden = false; $('#qr-empty').hidden = true;
    const ratio = K.contrast(fg(), bg()); warn.textContent = ratio < 3.5 || K.lum(fg()) > K.lum(bg()) ? 'Tip: use a dark code on a light background so phones can scan it reliably.' : (content.length > 220 ? 'Long content makes a dense code. Keep it short for easy scanning.' : '');
  }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(update, 120); };
  const ready = () => { if (!matrix) { K.toast('Fill in the details first'); return false; } return true; };
  const base = () => 'qr-' + K.slug(TYPES[type].label);
  $('#qr-png').onclick = (e) => ready() && K.busy(e.currentTarget, async () => { const c = K.canvas(1400, 1400); draw(c.getContext('2d'), 1400, 3); K.download(await K.canvasBlob(c), base() + '.png'); K.toast('PNG downloaded'); });
  $('#qr-svg').onclick = () => ready() && !logo ? (K.download(new Blob([svg(1000, 3)], { type: 'image/svg+xml' }), base() + '.svg'), K.toast('SVG downloaded')) : (logo && K.toast('SVG is only available without a centre logo. Use PNG or PDF.'));
  $('#qr-pdf').onclick = (e) => ready() && K.busy(e.currentTarget, async () => {
    await K.fonts([['Inter', '400;600;700'], ['Cormorant Garamond', '600;700']]); const { c, x } = K.page('#ffffff'), W = c.width, qs = 900, qx = (W - qs) / 2, cap = $('#qr-caption').value.trim() || 'Scan me', own = $('#qr-brand').value.trim();
    x.fillStyle = '#14110d'; x.fillRect(0, 0, W, 16); x.textAlign = 'center'; x.fillStyle = '#14110d'; x.font = '700 92px "Cormorant Garamond", Georgia, serif'; x.fillText(cap, W / 2, 330);
    x.save(); x.shadowColor = 'rgba(0,0,0,.18)'; x.shadowBlur = 40; x.shadowOffsetY = 16; x.fillStyle = bg(); K.rr(x, qx - 40, 420 - 40, qs + 80, qs + 80, 36); x.fill(); x.restore(); const q = K.canvas(qs, qs); draw(q.getContext('2d'), qs, 3); x.drawImage(q, qx, 420);
    x.fillStyle = '#6c665a'; x.font = '500 28px Inter'; x.fillText('Point your phone camera at the code', W / 2, 1450); if (own) { x.fillStyle = '#14110d'; x.font = '700 34px Inter'; x.fillText(own, W / 2, 1520); }
    x.fillStyle = '#9a9384'; x.font = '500 16px Inter'; x.fillText('Made with VibrantRevolve Studio  ·  vibrantrevolve.com/tools/qr-code', W / 2, c.height - 40);
    K.download(K.pdfFromCanvases([c], { title: cap }), base() + '-poster.pdf'); K.toast('Print poster downloaded');
  });
  $('#qr-copy').onclick = () => content && K.copy(content, null, 'QR content copied');
  K.$$('input[name="qr-type"]').forEach((r) => r.addEventListener('change', () => { type = r.value; fields(); update(); }));
  K.$$('input[name="qr-style"], #qr-fg, #qr-bg').forEach((i) => i.addEventListener('input', soft));
  $('#qr-logo').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); logo = img; $('#qr-logo-name').textContent = f.name; update(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#qr-logo-clear').onclick = () => { logo = null; $('#qr-logo').value = ''; $('#qr-logo-name').textContent = 'No logo'; update(); };
  fields(); update();
})();
