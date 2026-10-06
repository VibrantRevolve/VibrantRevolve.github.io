/* Palette Extractor: k-means colour extraction from an image, eyedropper, contrast checks, palette card export. */
(function () {
  const K = window.VRKit, $ = K.$;
  const drop = $('#pe-drop'); if (!drop) return;
  let colors = [], imgCanvas = null, nameHint = 'palette';

  function kmeans(px, k) {
    const r = K.rng(7), cent = [px[Math.floor(r() * px.length)].slice()];
    while (cent.length < k) { // k-means++ seeding
      const d = px.map((p) => Math.min(...cent.map((c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2))), sum = d.reduce((a, b) => a + b, 0); if (!sum) break;
      let t = r() * sum, i = 0; for (; i < d.length - 1; i++) { t -= d[i]; if (t <= 0) break; } cent.push(px[i].slice());
    }
    let assign = new Array(px.length).fill(0);
    for (let it = 0; it < 14; it++) {
      const sums = cent.map(() => [0, 0, 0, 0]);
      px.forEach((p, i) => { let b = 0, bd = 1e12; for (let c = 0; c < cent.length; c++) { const d = (p[0] - cent[c][0]) ** 2 + (p[1] - cent[c][1]) ** 2 + (p[2] - cent[c][2]) ** 2; if (d < bd) { bd = d; b = c; } } assign[i] = b; const s = sums[b]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; });
      cent.forEach((c, i) => { const s = sums[i]; if (s[3]) { c[0] = s[0] / s[3]; c[1] = s[1] / s[3]; c[2] = s[2] / s[3]; } });
    }
    const counts = cent.map(() => 0); assign.forEach((a) => counts[a]++);
    return cent.map((c, i) => ({ c: K.hex(c[0], c[1], c[2]), n: counts[i] })).filter((x) => x.n).sort((a, b) => b.n - a.n);
  }
  function extract() {
    if (!imgCanvas) return;
    const k = +$('#pe-k').value, skip = $('#pe-skip').checked, w = 140, h = Math.max(1, Math.round(imgCanvas.height * w / imgCanvas.width));
    const c = K.canvas(w, h), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(imgCanvas, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, px = [];
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B); if (skip && (mn > 238 || mx < 14)) continue; px.push([R, G, B]); }
    if (px.length < 10) { colors = []; K.toast('No usable colours found. Untick "ignore white/black".'); return paint(); }
    let res = kmeans(px, Math.min(k + 2, 10)), out = [];
    res.forEach((r) => { if (!out.some((o) => { const a = K.rgb(o.c), b = K.rgb(r.c); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 28; })) out.push(r); });
    colors = out.slice(0, k).map((o) => o.c); paint();
  }
  function paint() {
    $('#pe-empty').hidden = !!colors.length; $('#pe-result').hidden = !colors.length; if (!colors.length) return;
    const row = $('#pe-row'); row.innerHTML = '';
    colors.forEach((c, i) => { const b = K.el('button', 'bs-sw'); b.type = 'button'; b.style.background = c; b.style.color = K.textOn(c); b.style.minHeight = '120px'; b.setAttribute('aria-label', `${c}, click to copy`); b.innerHTML = `<b>${c}</b><span>${K.rgb(c).join(', ')}</span>`; b.onclick = () => K.copy(c, null, c + ' copied'); row.appendChild(b); });
    const tb = $('#pe-table tbody'); tb.innerHTML = '';
    colors.forEach((c) => { const w = K.contrast(c, '#ffffff'), k = K.contrast(c, '#14110d'), cell = (bg, fg, ratio) => `<span class="cc-pair" style="background:${bg};color:${fg}">Aa</span> <span class="badge ${ratio >= 4.5 ? 'ok' : ratio >= 3 ? 'mid' : 'bad'}">${ratio.toFixed(1)} · ${K.wcag(ratio)}</span>`; const tr = document.createElement('tr'); tr.innerHTML = `<td><span class="cc-pair" style="background:${c};width:34px;height:24px"></span> <strong>${c}</strong></td><td>${cell(c, '#ffffff', w)}</td><td>${cell(c, '#14110d', k)}</td>`; tb.appendChild(tr); });
    const [h, s, l] = K.toHsl(colors[0]), harm = [['Complement', K.hsl(h + 180, s, l)], ['Analogous', K.hsl(h + 30, s, l)], ['Analogous', K.hsl(h - 30, s, l)], ['Triad', K.hsl(h + 120, s, l)], ['Tint', K.mix(colors[0], '#ffffff', .75)], ['Shade', K.mix(colors[0], '#000000', .55)]];
    $('#pe-harm').innerHTML = harm.map((x) => `<button type="button" class="bs-sw" style="background:${x[1]};color:${K.textOn(x[1])};min-height:78px" data-c="${x[1]}" aria-label="${x[0]} ${x[1]}, click to copy"><b>${x[0]}</b><span>${x[1]}</span></button>`).join('');
    K.$$('#pe-harm button').forEach((b) => b.onclick = () => K.copy(b.dataset.c, null, b.dataset.c + ' copied'));
  }
  async function load(file) {
    if (!file || !/^image\//.test(file.type)) return K.toast('Please choose an image file');
    try { const { img, url } = await K.fileImage(file); useImage(img); URL.revokeObjectURL(url); nameHint = K.slug(file.name.replace(/\.[^.]+$/, '')); } catch (e) { K.toast('Could not read that image', 'err'); }
  }
  function useImage(img) {
    const max = 1000, s = Math.min(1, max / Math.max(img.width, img.height)); imgCanvas = K.canvas(Math.round(img.width * s), Math.round(img.height * s)); imgCanvas.getContext('2d').drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
    const view = K.canvas(imgCanvas.width, imgCanvas.height); view.getContext('2d').drawImage(imgCanvas, 0, 0); view.setAttribute('role', 'img'); view.setAttribute('aria-label', 'Uploaded image. Click to pick a colour.'); view.style.cursor = 'crosshair';
    view.onclick = (e) => { const r = view.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) * view.width / r.width), y = Math.floor((e.clientY - r.top) * view.height / r.height), d = view.getContext('2d').getImageData(x, y, 1, 1).data; if (d[3] < 128) return; const hex = K.hex(d[0], d[1], d[2]); if (!colors.includes(hex)) { colors.push(hex); if (colors.length > 10) colors.shift(); paint(); } K.toast(hex + ' added'); };
    const box = $('#pe-img'); box.innerHTML = ''; box.appendChild(view); $('#pe-view').hidden = false; extract();
  }
  /* ---- card export ---- */
  async function card() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const c = K.canvas(1600, 900), x = c.getContext('2d'); x.fillStyle = '#faf7f0'; x.fillRect(0, 0, 1600, 900);
    x.fillStyle = '#14110d'; x.font = '700 64px "Cormorant Garamond", Georgia, serif'; x.fillText('Colour palette', 80, 130); x.fillStyle = '#6c665a'; x.font = '500 22px Inter'; x.fillText(`${colors.length} colours  ·  ${K.today()}`, 80, 172);
    const n = colors.length, gap = 14, w = (1440 - gap * (n - 1)) / n; colors.forEach((col, i) => { const X = 80 + i * (w + gap); x.fillStyle = col; K.rr(x, X, 220, w, 470, 22); x.fill(); x.fillStyle = K.textOn(col); x.font = '700 26px Inter'; x.fillText(col, X + 22, 640); x.font = '500 19px Inter'; x.globalAlpha = .85; x.fillText(K.rgb(col).join(', '), X + 22, 672); x.globalAlpha = 1; });
    x.fillStyle = '#9a9384'; x.font = '500 18px Inter'; x.fillText('Made with VibrantRevolve Studio  ·  vibrantrevolve.com/tools/palette-extractor', 80, 840); return c;
  }
  async function pdfPage() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const { c, x } = K.page('#ffffff'), W = c.width, M = 90; x.fillStyle = '#14110d'; x.fillRect(0, 0, W, 200); x.fillStyle = '#c9a227'; x.fillRect(0, 196, W, 8);
    x.fillStyle = '#e8cd7a'; x.font = '700 20px Inter'; if ('letterSpacing' in x) x.letterSpacing = '5px'; x.fillText('COLOUR SPECIFICATION', M, 90); if ('letterSpacing' in x) x.letterSpacing = '0px'; x.fillStyle = '#fff'; x.font = '700 56px "Cormorant Garamond", Georgia, serif'; x.fillText('Extracted palette', M, 156);
    colors.slice(0, 8).forEach((col, i) => { const y = 270 + i * 168; x.fillStyle = col; K.rr(x, M, y, 220, 130, 18); x.fill(); x.strokeStyle = 'rgba(0,0,0,.1)'; x.lineWidth = 1; K.rr(x, M + .5, y + .5, 219, 129, 18); x.stroke();
      x.fillStyle = '#14110d'; x.font = '700 38px Inter'; x.fillText(col, M + 260, y + 48); x.font = '500 22px Inter'; x.fillStyle = '#3b362d'; x.fillText(`RGB ${K.rgb(col).join(', ')}    CMYK ${K.cmyk(col).join(', ')}`, M + 260, y + 88);
      const w = K.contrast(col, '#ffffff'), k = K.contrast(col, '#14110d'); x.fillStyle = '#6c665a'; x.font = '500 19px Inter'; x.fillText(`White text ${w.toFixed(1)}:1 (${K.wcag(w)})    Dark text ${k.toFixed(1)}:1 (${K.wcag(k)})`, M + 260, y + 120); });
    x.fillStyle = '#9a9384'; x.font = '500 16px Inter'; x.fillText('vibrantrevolve.com/tools/palette-extractor', M, c.height - 40); return c;
  }
  $('#pe-png').onclick = (e) => colors.length && K.busy(e.currentTarget, async () => { K.download(await K.canvasBlob(await card()), nameHint + '-palette.png'); K.toast('Palette image downloaded'); });
  $('#pe-pdf').onclick = (e) => colors.length && K.busy(e.currentTarget, async () => { K.download(K.pdfFromCanvases([await pdfPage()], { title: 'Colour palette' }), nameHint + '-palette.pdf'); K.toast('PDF downloaded'); });
  $('#pe-copy').onclick = () => colors.length && K.copy(colors.join(', '), null, 'Colour codes copied');
  /* ---- input wiring ---- */
  const file = $('#pe-file'); drop.onclick = () => file.click(); drop.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } };
  file.onchange = () => load(file.files[0]);
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => load(e.dataTransfer.files[0]));
  addEventListener('paste', (e) => { const f = [...(e.clipboardData && e.clipboardData.files || [])][0]; if (f) load(f); });
  $('#pe-k').addEventListener('input', () => { $('#pe-kv').textContent = $('#pe-k').value; extract(); }); $('#pe-skip').addEventListener('change', extract);
  $('#pe-sample').onclick = () => { const i = new Image(); i.onload = () => { nameHint = 'vibrantrevolve-logo'; useImage(i); }; i.src = '/assets/images/favicon/icon-512.png'; };
})();
