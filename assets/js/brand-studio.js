// Brand Studio: deterministic, in-browser generator (palette, fonts, taglines, logo mark).
(function () {
  const $ = (id) => document.getElementById(id);
  const form = $('bs-form'); if (!form) return;
  const INDUSTRIES = { 'Food & restaurant': 'great food', 'Fashion & beauty': 'style', 'Tech & software': 'technology', 'Education & training': 'learning', 'Real estate': 'homes', 'Health & wellness': 'wellbeing', 'Retail & e-commerce': 'everyday shopping', 'Consulting & finance': 'clear advice', 'Creative & media': 'ideas', 'Something else': 'what you do best' };
  const MOODS = {
    Bold: { hues: [0, 12, 28, 48, 215, 265], s: [72, 92], l: [44, 54], fonts: [['Montserrat', 'Open Sans'], ['Archivo Black', 'Roboto'], ['Oswald', 'Lato']], line: (n) => `${cap(n)} that makes a statement.` },
    Elegant: { hues: [38, 42, 330, 350, 260], s: [26, 52], l: [28, 42], fonts: [['Playfair Display', 'Lato'], ['Cormorant Garamond', 'Inter'], ['Libre Baskerville', 'Source Sans 3']], line: (n) => `Refined ${n}, thoughtfully made.` },
    Friendly: { hues: [15, 35, 160, 190, 210], s: [60, 82], l: [48, 58], fonts: [['Poppins', 'Nunito'], ['Quicksand', 'Nunito Sans'], ['Baloo 2', 'Poppins']], line: (n) => `${cap(n)}, with a smile.` },
    Modern: { hues: [200, 220, 250, 170, 280], s: [55, 82], l: [42, 54], fonts: [['Space Grotesk', 'Inter'], ['Sora', 'DM Sans'], ['Manrope', 'Inter']], line: (n) => `Smarter ${n} for today.` },
    Earthy: { hues: [25, 40, 90, 110, 150], s: [30, 52], l: [32, 46], fonts: [['Lora', 'Source Sans 3'], ['Merriweather', 'Open Sans'], ['DM Serif Display', 'DM Sans']], line: (n) => `Honest ${n}, rooted in care.` },
    Playful: { hues: [320, 280, 50, 175, 15], s: [76, 95], l: [54, 64], fonts: [['Fredoka', 'Quicksand'], ['Baloo 2', 'Nunito'], ['Poppins', 'Quicksand']], line: (n) => `Fun, fresh ${n} for everyone.` }
  };
  const GENERIC = [(N, n) => `${N}: ${n}, done properly.`, (N, n) => `Where ${n} gets personal.`, (N, n) => `${cap(n)}, made to last.`, (N, n) => `Your partner for ${n}.`, (N, n) => `Better ${n}, every day.`, (N, n) => `${cap(n)} you can trust.`];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // seeded random
  function hash(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const between = (r, [a, b]) => a + r() * (b - a);

  function hsl(h, s, l) { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const x = (v) => Math.round(v * 255).toString(16).padStart(2, '0'); return ('#' + x(f(0)) + x(f(8)) + x(f(4))).toUpperCase(); }
  function lum(hex) { const c = [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  const textOn = (hex) => (lum(hex) > 0.4 ? '#14110d' : '#ffffff');

  function makePalette(r, m) {
    const base = pick(r, m.hues) + (r() * 16 - 8);
    const shift = pick(r, [30, -30, 150, 180, 210]);
    const s = between(r, m.s), l = between(r, m.l);
    return [
      { n: 'Primary', c: hsl(base, s, l) },
      { n: 'Accent', c: hsl(base + shift, Math.min(95, s + 6), Math.min(62, l + 8)) },
      { n: 'Deep', c: hsl(base, 32, 12) },
      { n: 'Soft', c: hsl(base, 42, 94) },
      { n: 'Neutral', c: hsl(base, 9, 52) }
    ];
  }

  function makeMark(r, p) {
    const [a, b, d] = [p[0].c, p[1].c, p[2].c];
    const kinds = [
      () => `<rect x="10" y="10" width="100" height="100" rx="26" fill="${a}"/><circle cx="${48 + r() * 14}" cy="${48 + r() * 14}" r="26" fill="${b}"/><path d="M60 110a50 50 0 0 0 50-50v50z" fill="${d}" opacity=".9"/>`,
      () => `<circle cx="60" cy="60" r="46" fill="none" stroke="${a}" stroke-width="14"/><rect x="40" y="40" width="40" height="40" rx="6" fill="${b}" transform="rotate(45 60 60)"/>`,
      () => `<rect x="10" y="10" width="100" height="100" rx="22" fill="${d}"/><rect x="26" y="${50 + r() * 14}" width="18" height="44" rx="6" fill="${a}"/><rect x="51" y="${28 + r() * 12}" width="18" height="66" rx="6" fill="${b}"/><rect x="76" y="${40 + r() * 14}" width="18" height="54" rx="6" fill="${a}"/>`,
      () => `<polygon points="60,8 106,34 106,86 60,112 14,86 14,34" fill="${a}"/><polygon points="60,32 86,84 34,84" fill="${b}"/>`,
      () => `<circle cx="46" cy="60" r="34" fill="${a}"/><circle cx="76" cy="60" r="34" fill="${b}" opacity=".85"/><circle cx="60" cy="60" r="10" fill="${d}"/>`
    ];
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Generated logo mark">${pick(r, kinds)()}</svg>`;
  }

  const loaded = new Set();
  function loadFont(name) { if (loaded.has(name)) return; loaded.add(name); const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + ':wght@400;600;700&display=swap'; document.head.appendChild(l); }

  let state = null, shuffle = 0;
  $('bs-industry').innerHTML = Object.keys(INDUSTRIES).map((k) => `<option>${k}</option>`).join('');
  $('bs-mood').innerHTML = Object.keys(MOODS).map((k) => `<option>${k}</option>`).join('');

  function generate() {
    const name = ($('bs-name').value.trim() || 'Your Brand').slice(0, 40);
    const ind = $('bs-industry').value, mood = $('bs-mood').value, m = MOODS[mood], noun = INDUSTRIES[ind];
    const r = rng(hash([name.toLowerCase(), ind, mood, shuffle].join('|')));
    const pal = makePalette(r, m);
    const fonts = pick(r, m.fonts);
    const pool = GENERIC.slice().sort(() => r() - 0.5).slice(0, 3).map((f) => f(name, noun));
    const taglines = [m.line(noun), ...pool];
    const mark = makeMark(r, pal);
    state = { name, ind, mood, pal, fonts, taglines, mark };
    fonts.forEach(loadFont);
    render();
  }

  function render() {
    const { name, pal, fonts, taglines, mark } = state;
    $('bs-out').hidden = false;
    $('bs-sw').innerHTML = pal.map((p) => `<button type="button" class="bs-sw pop" data-c="${p.c}" style="background:${p.c};color:${textOn(p.c)}" aria-label="${p.n} ${p.c}, copy">${p.n}<br>${p.c}</button>`).join('');
    $('bs-mark').innerHTML = mark;
    $('bs-fontnote').innerHTML = `Fonts: <strong></strong> for headings, <strong></strong> for text.`;
    const st = $('bs-fontnote').querySelectorAll('strong'); st[0].textContent = fonts[0]; st[1].textContent = fonts[1];
    $('bs-tags').innerHTML = taglines.map(() => '<div class="bs-tag"></div>').join('');
    $('bs-tags').querySelectorAll('.bs-tag').forEach((d, i) => { d.textContent = taglines[i]; });
    const [P, A, D, S] = pal.map((p) => p.c);
    const pv = $('bs-prev');
    pv.style.background = S; pv.style.color = D; pv.style.fontFamily = `'${fonts[1]}', sans-serif`;
    pv.innerHTML = `<span class="bs-chip" style="background:${A};color:${textOn(A)}">Welcome</span><h4 style="font-family:'${fonts[0]}',serif;color:${D}"></h4><p></p><span class="bs-btn" style="background:${P};color:${textOn(P)}">Get started</span>`;
    pv.querySelector('h4').textContent = name; pv.querySelector('p').textContent = taglines[0];
    const msg = `Hi VibrantRevolve, I tried Brand Studio.\nBusiness: ${name} (${state.ind}, ${state.mood})\nColours: ${pal.map((p) => p.c).join(', ')}\nFonts: ${fonts.join(' + ')}\nTagline: ${taglines[0]}\nI'd like help turning this into a real brand/website.`;
    $('bs-wa').href = 'https://wa.me/' + ((window.VR_CONFIG && window.VR_CONFIG.whatsapp) || '2349012739299') + '?text=' + encodeURIComponent(msg);
    $('bs-out').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function copy(text, btn, label) {
    const done = () => { if (!btn) return; const o = btn.dataset.o || btn.innerHTML; btn.dataset.o = o; btn.textContent = label || 'Copied'; setTimeout(() => { btn.innerHTML = o; }, 1200); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
    else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); shuffle = 0; generate(); });
  $('bs-shuffle').addEventListener('click', () => { if (!$('bs-name').value.trim()) { $('bs-name').focus(); return; } shuffle++; generate(); });
  $('bs-sw').addEventListener('click', (e) => { const b = e.target.closest('.bs-sw'); if (b) copy(b.dataset.c, b, 'Copied!'); });
  $('bs-copy').addEventListener('click', (e) => state && copy(state.pal.map((p) => p.n + ': ' + p.c).join('\n'), e.currentTarget, 'Copied!'));
  $('bs-dl').addEventListener('click', () => {
    if (!state) return;
    const blob = new Blob([state.mark], { type: 'image/svg+xml' }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = (state.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'brand') + '-mark.svg'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
  });
})();
