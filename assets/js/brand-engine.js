/* VibrantRevolve Brand Engine: deterministic brand generation (palette, type, voice, logo directions)
   plus canvas renderers for logos and the PDF/PNG brand brief. Runs entirely in the browser. */
(function () {
  const K = window.VRKit;
  const E = (window.VRBrand = {});

  /* ---------- data ---------- */
  E.INDUSTRIES = {
    'Food & restaurant': { noun: 'great food', ben: 'flavour worth coming back for', pref: [3, 5, 0] },
    'Fashion & beauty': { noun: 'style', ben: 'confidence you can wear', pref: [5, 0, 7] },
    'Tech & software': { noun: 'technology', ben: 'tools that just work', pref: [1, 2, 7] },
    'Education & training': { noun: 'learning', ben: 'skills that open doors', pref: [4, 6, 2] },
    'Real estate': { noun: 'homes', ben: 'places you are proud to belong to', pref: [6, 4, 1] },
    'Health & wellness': { noun: 'wellbeing', ben: 'care that feels personal', pref: [3, 8, 0] },
    'Retail & e-commerce': { noun: 'everyday shopping', ben: 'quality delivered with care', pref: [0, 2, 5] },
    'Consulting & finance': { noun: 'clear advice', ben: 'decisions you can stand behind', pref: [6, 2, 4] },
    'Creative & media': { noun: 'ideas', ben: 'stories people remember', pref: [5, 0, 8] },
    'Something else': { noun: 'what you do best', ben: 'work you can rely on', pref: [0, 1, 2] }
  };
  E.MOODS = {
    Bold: { hues: [0, 12, 28, 48, 215, 265], s: [72, 92], l: [44, 54], fonts: [['Montserrat', 'Open Sans'], ['Archivo Black', 'Roboto'], ['Oswald', 'Lato']], traits: ['Confident', 'Direct', 'Energetic'], dos: ['Lead with the point', 'Short, strong sentences'], donts: ['Hedge or over-explain', 'Use timid language'], line: (n) => `${K.cap(n)} that makes a statement.` },
    Elegant: { hues: [38, 42, 330, 350, 260], s: [26, 52], l: [28, 42], fonts: [['Playfair Display', 'Lato'], ['Cormorant Garamond', 'Inter'], ['Libre Baskerville', 'Source Sans 3']], traits: ['Refined', 'Calm', 'Considered'], dos: ['Choose words with care', 'Leave breathing room'], donts: ['Shout or use slang', 'Crowd the layout'], line: (n) => `Refined ${n}, thoughtfully made.` },
    Friendly: { hues: [15, 35, 160, 190, 210], s: [60, 82], l: [48, 58], fonts: [['Poppins', 'Nunito'], ['Quicksand', 'Nunito Sans'], ['Baloo 2', 'Poppins']], traits: ['Warm', 'Approachable', 'Upbeat'], dos: ['Talk like a helpful neighbour', 'Say "you" often'], donts: ['Sound corporate', 'Use heavy jargon'], line: (n) => `${K.cap(n)}, with a smile.` },
    Modern: { hues: [200, 220, 250, 170, 280], s: [55, 82], l: [42, 54], fonts: [['Space Grotesk', 'Inter'], ['Sora', 'DM Sans'], ['Manrope', 'Inter']], traits: ['Clear', 'Smart', 'Forward-looking'], dos: ['Be plain and precise', 'Show, then tell'], donts: ['Use buzzwords', 'Bury the benefit'], line: (n) => `Smarter ${n} for today.` },
    Earthy: { hues: [25, 40, 90, 110, 150], s: [30, 52], l: [32, 46], fonts: [['Lora', 'Source Sans 3'], ['Merriweather', 'Open Sans'], ['DM Serif Display', 'DM Sans']], traits: ['Honest', 'Grounded', 'Caring'], dos: ['Be transparent', 'Use natural, simple words'], donts: ['Exaggerate', 'Sound slick'], line: (n) => `Honest ${n}, rooted in care.` },
    Playful: { hues: [320, 280, 50, 175, 15], s: [76, 95], l: [54, 64], fonts: [['Fredoka', 'Quicksand'], ['Baloo 2', 'Nunito'], ['Poppins', 'Quicksand']], traits: ['Fun', 'Curious', 'Cheeky'], dos: ['Add a little surprise', 'Keep it light'], donts: ['Be stiff', 'Take every line too seriously'], line: (n) => `Fun, fresh ${n} for everyone.` }
  };
  const SINGLE_WEIGHT = { 'Archivo Black': '400', 'DM Serif Display': '400' };
  E.fontSpec = (name) => [name, SINGLE_WEIGHT[name] || '400;700'];
  E.loadFonts = (names) => K.fonts(names.map(E.fontSpec));
  E.SERVICES = ['Logo design', 'Full brand identity', 'Website', 'Online store', 'Social media kit', 'Business cards & print', 'Packaging', 'Copywriting'];

  /* ---------- palette ---------- */
  function makePalette(r, m) {
    const base = K.pick(r, m.hues) + (r() * 16 - 8), shift = K.pick(r, [30, -30, 150, 180, 210]);
    const s = K.between(r, m.s[0], m.s[1]), l = K.between(r, m.l[0], m.l[1]);
    return [
      { n: 'Primary', c: K.hsl(base, s, l), use: 'Logo, buttons, key moments' },
      { n: 'Accent', c: K.hsl(base + shift, Math.min(95, s + 6), Math.min(62, l + 8)), use: 'Highlights, icons, links' },
      { n: 'Deep', c: K.hsl(base, 32, 12), use: 'Headlines, dark backgrounds' },
      { n: 'Soft', c: K.hsl(base, 42, 94), use: 'Backgrounds, cards' },
      { n: 'Neutral', c: K.hsl(base, 9, 52), use: 'Body text, borders' }
    ];
  }

  /* ---------- taglines ---------- */
  function taglines(r, name, ind, mood) {
    const I = E.INDUSTRIES[ind], n = I.noun, b = I.ben, m = E.MOODS[mood];
    const pool = [
      `${name}: ${n}, done properly.`, `Where ${n} gets personal.`, `${K.cap(n)}, made to last.`, `Your partner for ${n}.`,
      `Better ${n}, every day.`, `${K.cap(n)} you can trust.`, `${K.cap(b)}.`, `${name}. ${K.cap(b)}.`,
      `Made for people who care about ${n}.`, `Small details. Big difference.`, `Start with ${name}.`, `${K.cap(n)}, without the fuss.`
    ];
    return [m.line(n), ...K.shuffled(r, pool).slice(0, 4)];
  }

  /* ---------- logo symbols (shape only, viewBox 0 0 120 120) ---------- */
  const SYM = [
    (a, b, d) => `<circle cx="46" cy="60" r="34" fill="${a}"/><circle cx="76" cy="60" r="34" fill="${b}" fill-opacity=".88"/><circle cx="61" cy="60" r="9" fill="${d}"/>`,
    (a, b, d) => `<polygon points="60,8 106,34 106,86 60,112 14,86 14,34" fill="${a}"/><polygon points="60,32 86,84 34,84" fill="${b}"/><circle cx="60" cy="66" r="6" fill="${d}"/>`,
    (a, b, d) => `<rect x="8" y="8" width="104" height="104" rx="26" fill="${d}"/><rect x="26" y="58" width="18" height="38" rx="6" fill="${a}"/><rect x="51" y="36" width="18" height="60" rx="6" fill="${b}"/><rect x="76" y="48" width="18" height="48" rx="6" fill="${a}"/>`,
    (a, b, d) => `<path d="M60 8C98 24 108 68 60 112 12 68 22 24 60 8z" fill="${a}"/><path d="M60 34v68M60 56L44 44M60 74L40 60M60 56l16-12M60 74l20-14" stroke="${d}" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="60" cy="22" r="6" fill="${b}"/>`,
    (a, b, d) => `<circle cx="84" cy="34" r="12" fill="${b}"/><path d="M6 100L48 30l30 48 14-20 22 42z" fill="${a}"/><path d="M48 30l17 27-10 6-12-9-10 8z" fill="${d}" fill-opacity=".35"/>`,
    (a, b, d) => `<path d="M60 6C64 40 80 56 114 60 80 64 64 80 60 114 56 80 40 64 6 60 40 56 56 40 60 6z" fill="${a}"/><circle cx="60" cy="60" r="12" fill="${b}"/>`,
    (a, b, d) => `<path d="M60 6l46 17v33c0 30-19 49-46 58C33 105 14 86 14 56V23z" fill="${a}"/><path d="M38 60l16 16 30-34" stroke="${b}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    (a, b, d) => `<circle cx="60" cy="60" r="44" fill="none" stroke="${a}" stroke-width="14" stroke-dasharray="230 50" stroke-linecap="round" transform="rotate(-70 60 60)"/><circle cx="60" cy="60" r="16" fill="${b}"/><circle cx="96" cy="34" r="7" fill="${d}"/>`,
    (a, b, d) => `<rect x="6" y="6" width="108" height="108" rx="30" fill="${a}"/><rect x="6" y="6" width="108" height="108" rx="30" fill="none" stroke="${b}" stroke-width="6" stroke-opacity=".9" transform="scale(.84) translate(11.4 11.4)"/>`,
    (a, b, d) => `<circle cx="60" cy="60" r="52" fill="${d}"/><path d="M14 74q23-26 46 0t46 0" stroke="${a}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M14 54q23-26 46 0t46 0" stroke="${b}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M14 94q23-26 46 0t46 0" stroke="${a}" stroke-opacity=".6" stroke-width="11" fill="none" stroke-linecap="round"/>`
  ];
  E.SYMBOL_COUNT = SYM.length; const MONO_IDX = 8;

  E.symbolSvg = (idx, cols, o) => {
    o = o || {}; const size = o.size || 120; const inner = SYM[idx](cols.a, cols.b, cols.d);
    const txt = idx === MONO_IDX && o.withText ? `<text x="60" y="76" font-family="${o.font || 'Georgia'},serif" font-weight="700" font-size="52" fill="${cols.t}" text-anchor="middle">${K.esc(o.initials || 'V')}</text>` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Logo mark">${inner}${txt}</svg>`;
  };

  /* ---------- build a brand ---------- */
  E.initials = (name) => { const w = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean); return ((w.length > 1 ? w[0][0] + w[1][0] : w[0] ? w[0].slice(0, 2) : 'V')).toUpperCase(); };
  E.build = (o) => {
    const name = (o.name || 'Your Brand').trim().slice(0, 40) || 'Your Brand', ind = E.INDUSTRIES[o.industry] ? o.industry : 'Something else', mood = E.MOODS[o.mood] ? o.mood : 'Modern', shuffle = o.shuffle || 0;
    const r = K.rng(K.hash([name.toLowerCase(), ind, mood, shuffle].join('|')));
    const m = E.MOODS[mood], pal = makePalette(r, m), fonts = K.pick(r, m.fonts);
    const pref = E.INDUSTRIES[ind].pref, order = K.shuffled(r, [...Array(E.SYMBOL_COUNT).keys()]);
    const ranked = [...pref, ...order.filter((i) => pref.indexOf(i) < 0)];
    return { name, ind, mood, pal, fonts, taglines: taglines(r, name, ind, mood), initials: E.initials(name), symbols: ranked, symbol: ranked[0], layout: 'h', seed: shuffle };
  };
  E.colsFor = (brand, mode, bg) => {
    const [P, A, D, S] = brand.pal.map((p) => p.c);
    if (mode === 'light') return { a: '#ffffff', b: K.mix('#ffffff', P, .35), d: K.mix('#ffffff', P, .6), t: P, word: '#ffffff', tag: 'rgba(255,255,255,.7)' };
    if (mode === 'mono') { const ink = '#14110d'; return { a: ink, b: K.mix(ink, '#ffffff', .5), d: ink, t: '#ffffff', word: ink, tag: '#555' }; }
    return { a: P, b: A, d: D, t: K.textOn(P), word: D, tag: brand.pal[4].c };
  };

  /* ---------- logo drawing ---------- */
  const imgCache = new Map();
  const symImage = (svg) => { if (!imgCache.has(svg)) imgCache.set(svg, K.svgImage(svg)); return imgCache.get(svg); };
  const setLS = (ctx, px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; };

  /* Draw a logo lock-up into box {x,y,w,h}. spec: {symbol, layout:'h'|'s'|'m'|'w', mode:'color'|'light'|'mono', tagline?} */
  E.drawLogo = async (ctx, brand, spec, box) => {
    const mode = spec.mode || 'color', cols = E.colsFor(brand, mode), idx = spec.symbol == null ? brand.symbol : spec.symbol;
    const layout = spec.layout || 'h', head = brand.fonts[0], body = brand.fonts[1], name = brand.name;
    const elegant = brand.mood === 'Elegant';
    const needSym = layout !== 'w';
    const img = needSym ? await symImage(E.symbolSvg(idx, cols, { size: 360 })) : null;
    const drawMono = (cx, cy, s) => { if (idx !== MONO_IDX) return; ctx.save(); ctx.fillStyle = cols.t; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = `700 ${s * 0.44}px "${head}", Georgia, serif`; setLS(ctx, 0); ctx.fillText(brand.initials, cx, cy + s * 0.15); ctx.restore(); };
    ctx.save(); ctx.fillStyle = cols.word; ctx.textBaseline = 'alphabetic';
    const wordText = elegant ? name.toUpperCase() : name;
    const wfont = (px) => `700 ${px}px "${head}", Georgia, serif`;
    if (layout === 'm') {
      const s = Math.min(box.w, box.h); const x = box.x + (box.w - s) / 2, y = box.y + (box.h - s) / 2; ctx.drawImage(img, x, y, s, s); drawMono(x + s / 2, y + s / 2, s);
    } else if (layout === 's') {
      const gap = box.h * 0.07; let sSym = box.h * 0.56, wpx = K.fit(ctx, wordText, wfont('{px}'), box.w * 0.98, box.h * 0.26, 14);
      ctx.font = wfont(wpx); setLS(ctx, elegant ? wpx * 0.12 : 0);
      const tagPx = Math.max(12, wpx * 0.3), hasTag = !!spec.tagline, total = sSym + gap + wpx * 0.78 + (hasTag ? tagPx * 1.8 : 0);
      const top = box.y + (box.h - total) / 2, sx = box.x + (box.w - sSym) / 2;
      ctx.drawImage(img, sx, top, sSym, sSym); drawMono(sx + sSym / 2, top + sSym / 2, sSym);
      ctx.textAlign = 'center'; ctx.fillText(wordText, box.x + box.w / 2 + (elegant ? wpx * 0.06 : 0), top + sSym + gap + wpx * 0.78);
      if (hasTag) { ctx.font = `500 ${tagPx}px "${body}", sans-serif`; ctx.fillStyle = cols.tag; setLS(ctx, tagPx * 0.08); ctx.fillText(spec.tagline, box.x + box.w / 2, top + sSym + gap + wpx * 0.78 + tagPx * 1.7); }
    } else if (layout === 'w') {
      const wpx = K.fit(ctx, wordText, wfont('{px}'), box.w, box.h * 0.6, 14); ctx.font = wfont(wpx); setLS(ctx, elegant ? wpx * 0.12 : 0); ctx.textAlign = 'center';
      ctx.fillText(wordText, box.x + box.w / 2, box.y + box.h / 2 + wpx * 0.3);
    } else { // horizontal
      const sSym = Math.min(box.h * 0.9, box.w * 0.34), gap = sSym * 0.26, avail = box.w - sSym - gap;
      const wpx = K.fit(ctx, wordText, wfont('{px}'), avail, sSym * 0.5, 14);
      ctx.font = wfont(wpx); setLS(ctx, elegant ? wpx * 0.1 : 0);
      const tw = ctx.measureText(wordText).width, total = sSym + gap + tw, x0 = box.x + (box.w - total) / 2, y0 = box.y + (box.h - sSym) / 2;
      ctx.drawImage(img, x0, y0, sSym, sSym); drawMono(x0 + sSym / 2, y0 + sSym / 2, sSym);
      const hasTag = !!spec.tagline, tagPx = Math.max(11, wpx * 0.3);
      const baseY = y0 + sSym / 2 + wpx * 0.3 - (hasTag ? tagPx * 0.9 : 0);
      ctx.textAlign = 'left'; ctx.fillText(wordText, x0 + sSym + gap, baseY);
      if (hasTag) { ctx.font = `500 ${tagPx}px "${body}", sans-serif`; ctx.fillStyle = cols.tag; setLS(ctx, tagPx * 0.06); ctx.fillText(spec.tagline, x0 + sSym + gap, baseY + tagPx * 1.9); }
    }
    setLS(ctx, 0); ctx.restore();
  };

  /* Render a logo to its own canvas. bg: 'transparent' or a colour. */
  E.logoCanvas = async (brand, spec, w, h, bg) => {
    const c = K.canvas(w, h), x = c.getContext('2d');
    if (bg && bg !== 'transparent') { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
    const pad = Math.round(Math.min(w, h) * 0.1);
    await E.drawLogo(x, brand, spec, { x: pad, y: pad, w: w - pad * 2, h: h - pad * 2 }); return c;
  };

  /* ---------- brand brief pages (A4 @150dpi) ---------- */
  const lab = (x, t, px, cx, y, color, w, ls) => { x.save(); x.fillStyle = color; x.font = `${w || 700} ${px}px Inter, system-ui, sans-serif`; setLS(x, ls || 0); x.fillText(t, cx, y); x.restore(); };
  const sectionTitle = (x, num, text, X, Y, color, line) => {
    lab(x, num, 19, X, Y, color, 700, 3); const w = x.measureText(num).width; x.save(); x.font = '700 19px Inter'; setLS(x, 3); const nw = x.measureText(num).width; x.restore();
    lab(x, text.toUpperCase(), 19, X + nw + 18, Y, color, 700, 3);
    x.save(); x.strokeStyle = line; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Y + 18); x.lineTo(1240 - X, Y + 18); x.stroke(); x.restore();
  };

  E.page1 = async (brand, req) => {
    const { c, x } = K.page(); const W = c.width, H = c.height, M = 80;
    const [P, A, D, S, N] = brand.pal.map((p) => p.c), head = brand.fonts[0], body = brand.fonts[1];
    const dim = K.mix(D, S, .72), rule = K.mix(D, S, .22);
    x.fillStyle = D; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, 900); g.addColorStop(0, K.mix(D, P, .38)); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, 900);
    lab(x, 'BRAND BRIEF', 20, M, 92, S, 700, 5); x.textAlign = 'right'; lab(x, `${req.ref}   ·   ${req.date}`, 19, W - M, 92, K.mix(D, S, .6), 500, 1); x.textAlign = 'left';
    // logo panel
    x.fillStyle = S; K.rr(x, M, 130, W - M * 2, 500, 38); x.fill();
    await E.drawLogo(x, brand, { layout: 's', symbol: brand.symbol, mode: 'color' }, { x: M + 120, y: 150, w: W - M * 2 - 240, h: 380 });
    x.fillStyle = K.mix(N, D, .4); x.font = `italic 500 30px "${body}", Georgia, serif`; x.textAlign = 'center'; K.wrap(x, `“${brand.taglines[0]}”`, W / 2, 590, 900, 38, 1); x.textAlign = 'left';
    // 01 colour
    sectionTitle(x, '01', 'Colour', M, 700, dim, rule);
    const widths = [0.3, 0.22, 0.18, 0.18, 0.12], tot = W - M * 2; let px0 = M;
    brand.pal.forEach((p, i) => { const w = Math.round(tot * widths[i]); x.fillStyle = p.c;
      if (i === 0) { K.rr(x, px0, 740, w + 30, 240, 26); x.fill(); } else if (i === 4) { K.rr(x, px0 - 30, 740, w + 30, 240, 26); x.fill(); } else { x.fillRect(px0, 740, w, 240); } px0 += w; });
    x.save(); x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 2; K.rr(x, M + 1, 741, tot - 2, 238, 26); x.stroke(); x.restore();
    px0 = M; brand.pal.forEach((p, i) => { const w = Math.round(tot * widths[i]); x.fillStyle = K.textOn(p.c); x.font = `700 ${i < 2 ? 30 : 24}px Inter`; x.fillText(p.n, px0 + 26, 925); x.font = `500 ${i < 2 ? 22 : 18}px Inter`; x.globalAlpha = .85; x.fillText(p.c, px0 + 26, 955); x.globalAlpha = 1; px0 += w; });
    // 02 typography
    sectionTitle(x, '02', 'Typography', M, 1040, dim, rule);
    const colW = (W - M * 2 - 40) / 2;
    [[head, 'Headings', 700, 'Strong and memorable for titles and headlines.'], [body, 'Body text', 400, 'Clear, friendly and easy to read at any size.']].forEach((f, i) => {
      const X = M + i * (colW + 40); x.fillStyle = K.mix(D, S, .07); K.rr(x, X, 1080, colW, 230, 26); x.fill();
      let px = 170; x.font = `${f[2]} ${px}px "${f[0]}", sans-serif`; const aw = x.measureText('Aa').width, maxA = colW * 0.44; if (aw > maxA) { px = Math.floor(px * maxA / aw); x.font = `${f[2]} ${px}px "${f[0]}", sans-serif`; }
      x.fillStyle = S; x.fillText('Aa', X + 30, 1240);
      const tx = X + colW * 0.52; x.fillStyle = A; x.font = '700 21px Inter'; x.fillText(f[1].toUpperCase(), tx, 1150); x.fillStyle = S; x.font = `700 32px "${f[0]}", sans-serif`; x.fillText(f[0], tx, 1194);
      x.fillStyle = K.mix(D, S, .7); x.font = `400 21px "${f[0]}", sans-serif`; K.wrap(x, f[3], tx, 1234, colW * 0.42, 28, 3);
    });
    // 03 in use
    sectionTitle(x, '03', 'In use', M, 1370, dim, rule);
    const cw = 480, ch = 192, cx0 = M, cy0 = 1410; x.save(); x.shadowColor = 'rgba(0,0,0,.45)'; x.shadowBlur = 30; x.shadowOffsetY = 14; x.fillStyle = S; K.rr(x, cx0, cy0, cw, ch, 14); x.fill(); x.restore();
    await E.drawLogo(x, brand, { layout: 'h', symbol: brand.symbol, mode: 'color' }, { x: cx0 + 26, y: cy0 + 16, w: cw - 52, h: 96 });
    x.fillStyle = K.mix(N, D, .4); x.font = '600 17px Inter'; const who = req.contact || req.business || ''; if (who) x.fillText(who, cx0 + 36, cy0 + 144); x.font = '500 15px Inter'; x.fillText(req.email || req.whatsapp || 'hello@yourbrand.com', cx0 + 36, cy0 + 168);
    x.fillStyle = P; x.fillRect(cx0 + cw - 90, cy0 + ch - 14, 90, 14);
    const av = 192, ax = cx0 + cw + 70, ay = cy0; x.fillStyle = P; x.beginPath(); x.arc(ax + av / 2, ay + av / 2, av / 2, 0, Math.PI * 2); x.fill();
    await E.drawLogo(x, brand, { layout: 'm', symbol: brand.symbol, mode: 'light' }, { x: ax + 36, y: ay + 36, w: av - 72, h: av - 72 });
    const sx = ax + av + 60, sw = W - M - sx; x.fillStyle = A; K.rr(x, sx, cy0, sw, ch, 20); x.fill(); x.fillStyle = K.textOn(A); x.font = `700 34px "${head}", Georgia, serif`; K.wrap(x, brand.taglines[1], sx + 26, cy0 + 56, sw - 52, 40, 3);
    x.font = '600 17px Inter'; x.fillText('@' + K.slug(brand.name).replace(/-/g, ''), sx + 26, cy0 + ch - 20);
    lab(x, 'Prepared with VibrantRevolve Studio  ·  vibrantrevolve.com', 17, M, H - 60, K.mix(D, S, .5), 500, 1);
    return c;
  };

  E.page2 = async (brand, req) => {
    const { c, x } = K.page('#ffffff'); const W = c.width, H = c.height, M = 80;
    const [P, A, D, S, N] = brand.pal.map((p) => p.c), head = brand.fonts[0], body = brand.fonts[1], line = '#e5e0d6', ink = '#1b1813', mute = '#6c665a';
    x.fillStyle = D; x.fillRect(0, 0, W, 190); x.fillStyle = P; x.fillRect(0, 186, W, 8);
    lab(x, 'PROJECT REQUEST', 20, M, 76, S, 700, 5);
    const npx = K.fit(x, brand.name, `700 {px}px "${head}", Georgia, serif`, 760, 56, 28); x.fillStyle = '#fff'; x.font = `700 ${npx}px "${head}", Georgia, serif`; x.fillText(brand.name, M, 142);
    x.textAlign = 'right'; lab(x, req.ref, 26, W - M, 90, '#fff', 700, 2); lab(x, req.date, 19, W - M, 122, K.mix(D, '#ffffff', .65), 500, 1); lab(x, `${brand.ind}  ·  ${brand.mood}`, 19, W - M, 150, K.mix(D, '#ffffff', .65), 500, 1); x.textAlign = 'left';
    const field = (label, val, X, Y, w) => { lab(x, label.toUpperCase(), 15, X, Y, mute, 700, 2); x.fillStyle = ink; x.font = '600 25px Inter'; const t = val || '—'; let s = t; while (x.measureText(s).width > w && s.length > 3) s = s.slice(0, -2); x.fillText(s === t ? t : s + '…', X, Y + 34); x.strokeStyle = line; x.lineWidth = 2; x.beginPath(); x.moveTo(X, Y + 50); x.lineTo(X + w, Y + 50); x.stroke(); };
    const hw = (W - M * 2 - 50) / 2;
    sectionTitle(x, '01', 'Client', M, 250, mute, line);
    field('Contact name', req.contact, M, 290, hw); field('Business', req.business || brand.name, M + hw + 50, 290, hw);
    field('Email', req.email, M, 366, hw); field('WhatsApp / phone', req.whatsapp, M + hw + 50, 366, hw);
    sectionTitle(x, '02', 'What is needed', M, 466, mute, line);
    let cx = M, cy = 502; x.font = '600 22px Inter';
    E.SERVICES.forEach((sv) => { const on = req.services.indexOf(sv) > -1, w = x.measureText(sv).width + (on ? 76 : 48); if (cx + w > W - M) { cx = M; cy += 58; }
      if (on) { x.fillStyle = P; K.rr(x, cx, cy, w, 46, 23); x.fill(); x.fillStyle = K.textOn(P); x.fillText('✓', cx + 20, cy + 31); x.fillText(sv, cx + 52, cy + 31); }
      else { x.strokeStyle = '#cfc9bc'; x.lineWidth = 2; K.rr(x, cx + 1, cy + 1, w - 2, 44, 22); x.stroke(); x.fillStyle = mute; x.fillText(sv, cx + 24, cy + 31); }
      cx += w + 12; });
    const ny = cy + 82; field('Timeline', req.timeline, M, ny, hw); field('Budget range', req.budget, M + hw + 50, ny, hw);
    lab(x, 'NOTES', 15, M, ny + 92, mute, 700, 2); x.fillStyle = S; K.rr(x, M, ny + 106, W - M * 2, 104, 16); x.fill();
    x.fillStyle = ink; x.font = `400 22px "${body}", sans-serif`; K.wrap(x, req.notes || 'No extra notes added.', M + 26, ny + 146, W - M * 2 - 52, 30, 2);
    const ty = ny + 262; sectionTitle(x, '03', 'Colour specification', M, ty, mute, line);
    const cols = [M, M + 250, M + 450, M + 640, M + 810]; ['Role', 'HEX', 'RGB', 'CMYK', 'Use'].forEach((h, i) => lab(x, h.toUpperCase(), 14, cols[i], ty + 56, mute, 700, 2));
    brand.pal.forEach((p, i) => { const y = ty + 74 + i * 50; x.fillStyle = p.c; K.rr(x, M, y, 38, 38, 10); x.fill(); x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1; K.rr(x, M + .5, y + .5, 37, 37, 10); x.stroke();
      x.fillStyle = ink; x.font = '700 21px Inter'; x.fillText(p.n, M + 56, y + 27); x.font = '600 20px Inter'; x.fillText(p.c, cols[1], y + 27); x.font = '500 18px Inter'; x.fillStyle = '#3b362d'; x.fillText(K.rgb(p.c).join(', '), cols[2], y + 27); x.fillText(K.cmyk(p.c).join(', '), cols[3], y + 27);
      x.fillStyle = mute; x.font = '500 16px Inter'; let u = p.use; while (x.measureText(u).width > W - M - cols[4] && u.length > 4) u = u.slice(0, -2); x.fillText(u === p.use ? u : u + '…', cols[4], y + 27); });
    const ly = ty + 74 + 5 * 50 + 38; sectionTitle(x, '04', 'Logo & voice', M, ly, mute, line);
    const lw = (W - M * 2 - 2 * 24) / 3, lh = 140, variants = [['On light', S, 'color', '#e3ddcf'], ['On deep', D, 'light', D], ['One colour', '#ffffff', 'mono', '#e3ddcf']];
    for (let i = 0; i < 3; i++) { const X = M + i * (lw + 24), v = variants[i]; x.fillStyle = v[1]; K.rr(x, X, ly + 38, lw, lh, 18); x.fill(); x.strokeStyle = v[3]; x.lineWidth = 2; K.rr(x, X + 1, ly + 39, lw - 2, lh - 2, 18); x.stroke();
      await E.drawLogo(x, brand, { layout: 'h', symbol: brand.symbol, mode: v[2] }, { x: X + 16, y: ly + 46, w: lw - 32, h: lh - 40 }); lab(x, v[0].toUpperCase(), 12, X + 16, ly + 38 + lh - 12, i === 1 ? K.mix(D, '#ffffff', .6) : mute, 700, 2); }
    const vy = ly + 38 + lh + 36, mo = E.MOODS[brand.mood]; lab(x, 'VOICE', 14, M, vy + 28, mute, 700, 2);
    let tx = M + 90; mo.traits.forEach((t) => { x.font = '700 20px Inter'; const w = x.measureText(t).width + 36; x.fillStyle = S; K.rr(x, tx, vy + 4, w, 38, 19); x.fill(); x.fillStyle = D; x.fillText(t, tx + 18, vy + 30); tx += w + 10; });
    x.fillStyle = '#2f7d4a'; x.font = '700 18px Inter'; x.fillText('DO', M, vy + 80); x.fillStyle = ink; x.font = `400 20px "${body}", sans-serif`; x.fillText(mo.dos.join('  ·  '), M + 56, vy + 80);
    x.fillStyle = '#b02a2a'; x.font = '700 18px Inter'; x.fillText('AVOID', M, vy + 114); x.fillStyle = ink; x.font = `400 20px "${body}", sans-serif`; x.fillText(mo.donts.join('  ·  '), M + 90, vy + 114);
    const fy = H - 130; x.fillStyle = D; x.fillRect(0, fy, W, 130);
    x.fillStyle = '#fff'; x.font = `700 30px "${head}", Georgia, serif`; x.fillText('Send this brief to VibrantRevolve', M, fy + 48);
    x.fillStyle = K.mix(D, '#ffffff', .75); x.font = '500 20px Inter'; x.fillText(`${K.email()}   ·   WhatsApp +${K.whatsapp().replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')}`, M, fy + 84);
    x.fillStyle = K.mix(D, '#ffffff', .5); x.font = '500 16px Inter'; x.fillText(`Reference ${req.ref}  ·  vibrantrevolve.com/brand-studio`, M, fy + 112);
    if (window.qrcode) { try { const q = window.qrcode(0, 'M'); q.addData(K.waLink(`Hi VibrantRevolve, here is my brand brief ${req.ref} for ${brand.name}.`)); q.make(); const n = q.getModuleCount(), sz = 96, qx = W - M - sz - 12, qy = fy + 17; x.fillStyle = '#fff'; K.rr(x, qx - 9, qy - 9, sz + 18, sz + 18, 10); x.fill(); x.fillStyle = D; const cs = sz / n; for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) x.fillRect(qx + k * cs, qy + r * cs, Math.ceil(cs), Math.ceil(cs)); } catch (e) {} }
    return c;
  };

  E.pages = async (brand, req) => { await E.loadFonts([brand.fonts[0], brand.fonts[1]]); await K.fonts([['Inter', '400;500;600;700']]); return [await E.page1(brand, req), await E.page2(brand, req)]; };
})();
