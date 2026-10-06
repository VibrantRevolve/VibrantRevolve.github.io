/* Logo Maker: eight directions for a name, lock-up variants, PNG / SVG / logo-sheet PDF export. */
(function () {
  const K = window.VRKit, E = window.VRBrand, $ = K.$;
  const root = $('#lm-form'); if (!root) return;
  const MOODS = Object.keys(E.MOODS);
  let brand, shuffle = 0, fontIdx = 0, token = 0, custom = { p: null, a: null }, isDemo = true;
  const DEMO = { name: 'Lumen & Co', industry: 'Creative & media', mood: 'Modern' };

  $('#lm-industry').innerHTML = Object.keys(E.INDUSTRIES).map((k) => `<option>${k}</option>`).join(''); $('#lm-industry').value = DEMO.industry;
  $('#lm-mood').innerHTML = MOODS.map((m) => `<label class="chip"><input type="radio" name="lm-mood" value="${m}" ${m === DEMO.mood ? 'checked' : ''}><span>${m}</span></label>`).join('');
  const mood = () => (root.querySelector('input[name="lm-mood"]:checked') || {}).value;
  const layout = () => (root.querySelector('input[name="lm-layout"]:checked') || {}).value || 'h';
  const spec = (over) => Object.assign({ layout: layout(), symbol: brand.symbol, mode: 'color', tagline: $('#lm-tag').value.trim() || '' }, over || {});

  function applyCustom() {
    if (!custom.p && !custom.a) return;
    if (custom.p) { brand.pal[0].c = custom.p; const [h] = K.toHsl(custom.p); brand.pal[2].c = K.hsl(h, 32, 12); brand.pal[3].c = K.hsl(h, 42, 94); brand.pal[4].c = K.hsl(h, 9, 52); }
    if (custom.a) brand.pal[1].c = custom.a;
  }
  function generate() {
    const name = $('#lm-name').value.trim(); isDemo = !name;
    brand = E.build({ name: name || DEMO.name, industry: isDemo ? DEMO.industry : $('#lm-industry').value, mood: isDemo ? DEMO.mood : mood(), shuffle });
    const set = E.MOODS[brand.mood].fonts; brand.fontSet = set; brand.fonts = set[fontIdx % set.length]; applyCustom();
    $('#lm-primary').value = brand.pal[0].c.toLowerCase(); $('#lm-accent').value = brand.pal[1].c.toLowerCase();
    render();
  }
  const sizeFor = () => ({ h: [2400, 1000], s: [1600, 1600], m: [1200, 1200] }[layout()]);

  async function render() {
    const my = ++token; $('#lm-stage').classList.add('is-loading');
    await E.loadFonts(brand.fonts); await K.fonts([['Inter', '400;600;700']]); if (my !== token) return;
    const S = brand.pal[3].c, D = brand.pal[2].c, P = brand.pal[0].c;
    // hero
    const hero = K.canvas(1200, 640), hx = hero.getContext('2d'); hx.fillStyle = S; hx.fillRect(0, 0, 1200, 640);
    await E.drawLogo(hx, brand, spec(), { x: 120, y: 90, w: 960, h: 460 }); hero.setAttribute('role', 'img'); hero.setAttribute('aria-label', 'Logo preview for ' + brand.name);
    $('#lm-main').innerHTML = ''; $('#lm-main').appendChild(hero);
    // variants
    const V = [['On white', '#ffffff', 'color'], ['On deep', D, 'light'], ['On primary', P, 'light'], ['One colour', '#ffffff', 'mono'], ['Mono on dark', '#14110d', 'light']];
    const vbox = $('#lm-variants'); vbox.innerHTML = '';
    for (const v of V) { const c = await E.logoCanvas(brand, spec({ mode: v[2], layout: layout() === 'm' ? 'm' : 'h' }), 520, 300, v[1]); if (my !== token) return; const f = K.el('figure'); f.style.margin = 0; f.appendChild(c); f.insertAdjacentHTML('beforeend', `<figcaption class="tp-note" style="margin:.4rem 0 0">${v[0]}</figcaption>`); vbox.appendChild(f); }
    // gallery
    const g = $('#lm-gallery'), frag = document.createDocumentFragment();
    for (const idx of brand.symbols.slice(0, 8)) {
      const c = await E.logoCanvas(brand, spec({ symbol: idx, layout: layout() === 'm' ? 's' : layout() }), 480, 340, S); if (my !== token) return;
      const b = K.el('button', 'logo-opt'); b.type = 'button'; b.setAttribute('aria-pressed', String(idx === brand.symbol)); b.setAttribute('aria-label', 'Symbol option ' + (brand.symbols.indexOf(idx) + 1)); b.appendChild(c); b.insertAdjacentHTML('beforeend', '<i>✓</i>'); b.onclick = () => { brand.symbol = idx; render(); }; frag.appendChild(b);
    }
    g.innerHTML = ''; g.appendChild(frag);
    $('#lm-fontline').innerHTML = `<strong style="font-family:'${brand.fonts[0]}',serif">${K.esc(brand.fonts[0])}</strong> + <strong style="font-family:'${brand.fonts[1]}',sans-serif">${K.esc(brand.fonts[1])}</strong>`;
    $('#lm-demo').hidden = !isDemo; $('#lm-stage').classList.remove('is-loading');
  }

  /* ---- exports ---- */
  const ready = () => { if (isDemo) { $('#lm-name').focus(); K.toast('Type your business name first'); return false; } return true; };
  const base = () => K.slug(brand.name);
  async function dl(mode, bg, suffix) { const [w, h] = sizeFor(); const c = await E.logoCanvas(brand, spec({ mode }), w, h, bg); K.download(await K.canvasBlob(c), `${base()}-logo-${suffix}.png`); K.toast('Logo downloaded'); }
  $('#lm-png').onclick = (e) => ready() && K.busy(e.currentTarget, () => dl('color', 'transparent', 'transparent'));
  $('#lm-png-dark').onclick = (e) => ready() && K.busy(e.currentTarget, () => dl('light', brand.pal[2].c, 'on-dark'));
  $('#lm-png-mono').onclick = (e) => ready() && K.busy(e.currentTarget, () => dl('mono', '#ffffff', 'one-colour'));
  $('#lm-svg').onclick = () => { if (!ready()) return; K.download(new Blob([E.symbolSvg(brand.symbol, E.colsFor(brand, 'color'), { size: 512, withText: true, initials: brand.initials, font: brand.fonts[0] })], { type: 'image/svg+xml' }), base() + '-symbol.svg'); };

  async function sheet() {
    await E.loadFonts(brand.fonts); await K.fonts([['Inter', '400;500;600;700']]);
    const { c, x } = K.page('#ffffff'), W = c.width, H = c.height, M = 80, [P, A, D, S, N] = brand.pal.map((p) => p.c);
    x.fillStyle = D; x.fillRect(0, 0, W, 190); x.fillStyle = P; x.fillRect(0, 186, W, 8);
    x.fillStyle = S; x.font = '700 20px Inter'; if ('letterSpacing' in x) x.letterSpacing = '5px'; x.fillText('LOGO SHEET', M, 86); if ('letterSpacing' in x) x.letterSpacing = '0px';
    x.fillStyle = '#fff'; x.font = `700 54px "${brand.fonts[0]}", Georgia, serif`; x.fillText(brand.name, M, 150);
    x.textAlign = 'right'; x.fillStyle = K.mix(D, '#fff', .65); x.font = '500 19px Inter'; x.fillText(K.today(), W - M, 150); x.textAlign = 'left';
    x.fillStyle = S; K.rr(x, M, 240, W - M * 2, 440, 30); x.fill(); await E.drawLogo(x, brand, spec({ layout: layout() === 'm' ? 's' : layout() }), { x: M + 80, y: 270, w: W - M * 2 - 160, h: 380 });
    const cw = (W - M * 2 - 24) / 2, ch = 230, V = [['On white', '#ffffff', 'color'], ['On deep', D, 'light'], ['On primary', P, 'light'], ['One colour', '#ffffff', 'mono']];
    for (let i = 0; i < 4; i++) { const X = M + (i % 2) * (cw + 24), Y = 720 + Math.floor(i / 2) * (ch + 24), v = V[i]; x.fillStyle = v[1]; K.rr(x, X, Y, cw, ch, 20); x.fill(); x.strokeStyle = '#e3ddcf'; x.lineWidth = 2; K.rr(x, X + 1, Y + 1, cw - 2, ch - 2, 20); x.stroke(); await E.drawLogo(x, brand, spec({ mode: v[2], layout: layout() === 'm' ? 'm' : 'h' }), { x: X + 30, y: Y + 30, w: cw - 60, h: ch - 80 }); x.fillStyle = v[1] === '#ffffff' ? '#6c665a' : K.mix(v[1], '#ffffff', .65); x.font = '700 13px Inter'; if ('letterSpacing' in x) x.letterSpacing = '2px'; x.fillText(v[0].toUpperCase(), X + 22, Y + ch - 18); if ('letterSpacing' in x) x.letterSpacing = '0px'; }
    const sy = 720 + 2 * (ch + 24) + 20; x.fillStyle = '#6c665a'; x.font = '700 14px Inter'; if ('letterSpacing' in x) x.letterSpacing = '2px'; x.fillText('SYMBOL, MINIMUM SIZES', M, sy + 10); if ('letterSpacing' in x) x.letterSpacing = '0px';
    let sx = M; for (const s of [150, 96, 56, 32]) { await E.drawLogo(x, brand, spec({ layout: 'm' }), { x: sx, y: sy + 34 + (150 - s) / 2, w: s, h: s }); sx += s + 36; }
    const pw = (W - M * 2) / 5, py = H - 270; brand.pal.forEach((p, i) => { x.fillStyle = p.c; x.fillRect(M + i * pw, py, pw, 96); x.fillStyle = '#1b1813'; x.font = '700 18px Inter'; x.fillText(p.n, M + i * pw, py + 126); x.fillStyle = '#6c665a'; x.font = '500 16px Inter'; x.fillText(p.c, M + i * pw, py + 150); });
    x.fillStyle = '#1b1813'; x.font = `700 28px "${brand.fonts[0]}", Georgia, serif`; x.fillText(brand.fonts[0], M, H - 62); x.font = `400 24px "${brand.fonts[1]}", sans-serif`; x.fillText(brand.fonts[1], M + 420, H - 62);
    x.fillStyle = '#9a9384'; x.font = '500 15px Inter'; x.fillText('Made with VibrantRevolve Studio  ·  vibrantrevolve.com/tools/logo-maker', M, H - 24);
    return c;
  }
  $('#lm-pdf').onclick = (e) => ready() && K.busy(e.currentTarget, async () => { const c = await sheet(); K.download(K.pdfFromCanvases([c], { title: brand.name + ' Logo Sheet' }), base() + '-logo-sheet.pdf'); K.toast('Logo sheet downloaded'); });
  $('#lm-share').onclick = (e) => ready() && K.busy(e.currentTarget, async () => {
    const c = await sheet(), blob = K.pdfFromCanvases([c], { title: brand.name + ' Logo Sheet' }), f = new File([blob], base() + '-logo-sheet.pdf', { type: 'application/pdf' }), msg = `Hi VibrantRevolve, here is my logo direction for ${brand.name}. I'd like to refine it into a full brand.`;
    if (await K.share([f], msg, brand.name + ' logo sheet')) return; K.download(blob, f.name); K.toast('PDF saved. Attach it in the chat that opens.'); setTimeout(() => window.open(K.waLink(msg + ' (Attaching ' + f.name + ')'), '_blank', 'noopener'), 700);
  });

  /* ---- events ---- */
  root.addEventListener('submit', (e) => { e.preventDefault(); if (!$('#lm-name').value.trim()) { $('#lm-name').focus(); return K.toast('Type your business name'); } shuffle = 0; fontIdx = 0; custom = { p: null, a: null }; generate(); });
  $('#lm-shuffle').onclick = () => { if (!$('#lm-name').value.trim()) { $('#lm-name').focus(); return K.toast('Type your business name first'); } shuffle++; fontIdx = 0; custom = { p: null, a: null }; generate(); };
  $('#lm-swap').onclick = () => { fontIdx++; brand.fonts = brand.fontSet[fontIdx % brand.fontSet.length]; render(); };
  $('#lm-reset').onclick = () => { custom = { p: null, a: null }; generate(); };
  let t; const later = (fn) => { clearTimeout(t); t = setTimeout(fn, 250); };
  $('#lm-primary').addEventListener('input', (e) => { custom.p = e.target.value.toUpperCase(); brand.pal[0].c = custom.p; applyCustom(); later(render); });
  $('#lm-accent').addEventListener('input', (e) => { custom.a = e.target.value.toUpperCase(); applyCustom(); later(render); });
  K.$$('input[name="lm-layout"]').forEach((i) => i.addEventListener('change', render));
  $('#lm-tag').addEventListener('input', () => later(render));
  [$('#lm-industry'), $('#lm-mood')].forEach((c) => c.addEventListener('change', () => { if ($('#lm-name').value.trim()) { shuffle = 0; fontIdx = 0; custom = { p: null, a: null }; generate(); } }));
  generate();
})();
