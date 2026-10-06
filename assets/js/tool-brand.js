/* Brand Studio page controller. Builds a brand, previews the exact PDF pages, exports PDF/PNG, sends to the studio. */
(function () {
  const K = window.VRKit, E = window.VRBrand, $ = K.$;
  const form = $('#bs-form'); if (!form) return;
  const MOODS = Object.keys(E.MOODS);
  const DEMO = { name: 'Northwind Coffee', industry: 'Food & restaurant', mood: 'Earthy' };
  const TIMELINES = ['As soon as possible', 'Within 2 weeks', 'Within a month', 'Flexible'];
  const BUDGETS = ['Under ₦150k / $100', '₦150k–₦500k / $100–$350', '₦500k–₦1.5M / $350–$1k', '₦1.5M+ / $1k+', 'Not sure yet'];

  let brand = null, shuffle = 0, fontIdx = 0, page = 0, pages = [], isDemo = true, token = 0, ref = K.refId('bs');
  const req = { ref, date: K.today(), contact: '', business: '', email: '', whatsapp: '', services: ['Logo design'], timeline: TIMELINES[1], budget: BUDGETS[4], notes: '' };

  /* ---- build the form controls ---- */
  $('#bs-industry').innerHTML = Object.keys(E.INDUSTRIES).map((k) => `<option>${k}</option>`).join('');
  $('#bs-mood').innerHTML = MOODS.map((m, i) => `<label class="chip"><input type="radio" name="bs-mood" value="${m}" ${m === DEMO.mood ? 'checked' : ''}><span>${m}</span></label>`).join('');
  $('#bs-services').innerHTML = E.SERVICES.map((s) => `<label class="chip"><input type="checkbox" value="${s}" ${req.services.includes(s) ? 'checked' : ''}><span>${s}</span></label>`).join('');
  $('#bs-timeline').innerHTML = TIMELINES.map((t) => `<option ${t === req.timeline ? 'selected' : ''}>${t}</option>`).join('');
  $('#bs-budget').innerHTML = BUDGETS.map((t) => `<option ${t === req.budget ? 'selected' : ''}>${t}</option>`).join('');
  $('#bs-industry').value = DEMO.industry;

  const mood = () => (form.querySelector('input[name="bs-mood"]:checked') || {}).value || 'Modern';
  function readReq() {
    req.contact = $('#bs-contact').value.trim(); req.business = $('#bs-business').value.trim(); req.email = $('#bs-email').value.trim(); req.whatsapp = $('#bs-wa').value.trim();
    req.services = K.$$('#bs-services input:checked').map((i) => i.value); req.timeline = $('#bs-timeline').value; req.budget = $('#bs-budget').value; req.notes = $('#bs-notes').value.trim();
  }

  /* ---- generate + render ---- */
  function generate(keepShuffle) {
    const name = $('#bs-name').value.trim();
    isDemo = !name;
    brand = E.build({ name: name || DEMO.name, industry: isDemo ? DEMO.industry : $('#bs-industry').value, mood: isDemo ? DEMO.mood : mood(), shuffle: keepShuffle ? shuffle : shuffle });
    const set = E.MOODS[brand.mood].fonts; brand.fonts = set[(fontIdx) % set.length]; brand.fontSet = set;
    render();
  }
  async function render(onlyPages) {
    const my = ++token; readReq(); $('#bs-stage').classList.add('is-loading');
    try {
      pages = await E.pages(brand, req); if (my !== token) return;
      showPage(); if (!onlyPages) { paintPalette(); paintTags(); paintFonts(); await paintLogos(my); }
    } finally { if (my === token) $('#bs-stage').classList.remove('is-loading'); }
    $('#bs-demo').hidden = !isDemo;
  }
  function showPage() {
    const doc = $('#bs-doc'); doc.innerHTML = ''; pages[page].setAttribute('role', 'img'); pages[page].setAttribute('aria-label', (page ? 'Project request' : 'Brand board') + ' preview for ' + brand.name); doc.appendChild(pages[page]);
    K.$$('#bs-tabs button').forEach((b, i) => b.setAttribute('aria-selected', String(i === page)));
  }
  function paintPalette() {
    $('#bs-sw').innerHTML = '';
    brand.pal.forEach((p) => { const b = K.el('button', 'bs-sw'); b.type = 'button'; b.style.background = p.c; b.style.color = K.textOn(p.c); b.setAttribute('aria-label', `${p.n} ${p.c}. Click to copy`); b.innerHTML = `<b>${p.n}</b><span>${p.c}</span>`; b.onclick = () => K.copy(p.c, null, `${p.n} ${p.c} copied`); $('#bs-sw').appendChild(b); });
  }
  function paintTags() {
    const box = $('#bs-tags'); box.innerHTML = '';
    brand.taglines.forEach((t, i) => { const row = K.el('div', 'copy-item'); const p = K.el('p', '', t); const use = K.el('button', 'tb tb--sm', i === 0 ? 'In use' : 'Use this'); use.type = 'button'; if (i === 0) { use.classList.add('is-done'); use.disabled = true; }
      use.onclick = () => { brand.taglines.splice(0, 0, brand.taglines.splice(i, 1)[0]); render(); }; row.append(p, use); box.appendChild(row); });
  }
  function paintFonts() {
    $('#bs-fontline').innerHTML = `<strong style="font-family:'${brand.fonts[0]}',serif">${K.esc(brand.fonts[0])}</strong> for headings &nbsp;·&nbsp; <strong style="font-family:'${brand.fonts[1]}',sans-serif">${K.esc(brand.fonts[1])}</strong> for text`;
  }
  async function paintLogos(my) {
    const box = $('#bs-logos'); const cols = brand.pal; const frag = document.createDocumentFragment();
    const list = brand.symbols.slice(0, 8);
    for (const idx of list) {
      const c = await E.logoCanvas(brand, { layout: 's', symbol: idx, mode: 'color' }, 480, 360, brand.pal[3].c); if (my !== token) return;
      const b = K.el('button', 'logo-opt'); b.type = 'button'; b.setAttribute('aria-pressed', String(idx === brand.symbol)); b.setAttribute('aria-label', 'Logo direction ' + (list.indexOf(idx) + 1)); b.appendChild(c); b.insertAdjacentHTML('beforeend', '<i>✓</i>');
      b.onclick = () => { brand.symbol = idx; render(); }; frag.appendChild(b);
    }
    box.innerHTML = ''; box.appendChild(frag);
  }

  /* ---- export / send ---- */
  const ensureReady = () => { if (isDemo) { $('#bs-name').focus(); K.toast('Add your business name first, then generate.'); return false; } return true; };
  const fileBase = () => K.slug(brand.name) + '-brand-brief';
  async function makePdf() { await render(true); return K.pdfFromCanvases(pages, { title: brand.name + ' Brand Brief (' + req.ref + ')' }); }
  $('#bs-pdf').onclick = (e) => { if (ensureReady()) K.busy(e.currentTarget, async () => { K.download(await makePdf(), fileBase() + '.pdf'); K.toast('PDF downloaded'); }); };
  $('#bs-png').onclick = (e) => { if (ensureReady()) K.busy(e.currentTarget, async () => { K.download(await K.canvasBlob(pages[page]), fileBase() + (page ? '-request' : '-board') + '.png'); K.toast('Image downloaded'); }); };
  const message = () => `Hi VibrantRevolve, I just made a brand brief on your site.\nBrand: ${brand.name} (${brand.ind}, ${brand.mood})\nReference: ${req.ref}\nI'm sending the PDF now. Please let me know the next steps.`;
  async function send(via) {
    if (!ensureReady()) return;
    const blob = await makePdf(), name = fileBase() + '.pdf', file = new File([blob], name, { type: 'application/pdf' });
    if (await K.share([file], message(), brand.name + ' brand brief')) { K.toast('Shared'); return; }
    K.download(blob, name);
    K.toast('PDF saved. Attach it in the chat that opens.');
    setTimeout(() => { window.open(via === 'mail' ? K.mailLink('Brand brief ' + req.ref + ': ' + brand.name, message() + '\n\n(Attach the downloaded PDF: ' + name + ')') : K.waLink(message() + '\n(Attaching the PDF: ' + name + ')'), via === 'mail' ? '_self' : '_blank', 'noopener'); }, 700);
  }
  $('#bs-send-wa').onclick = (e) => K.busy(e.currentTarget, () => send('wa'));
  $('#bs-send-mail').onclick = (e) => K.busy(e.currentTarget, () => send('mail'));
  $('#bs-svg').onclick = () => { if (!ensureReady()) return; const cols = E.colsFor(brand, 'color'); K.download(new Blob([E.symbolSvg(brand.symbol, cols, { size: 512, withText: true, initials: brand.initials, font: brand.fonts[0] })], { type: 'image/svg+xml' }), K.slug(brand.name) + '-mark.svg'); };
  $('#bs-copy').onclick = () => K.copy(brand.pal.map((p) => p.n + ': ' + p.c).join('\n'), null, 'Palette copied');

  /* ---- events ---- */
  form.addEventListener('submit', (e) => { e.preventDefault(); if (!$('#bs-name').value.trim()) { $('#bs-name').focus(); K.toast('Type your business name'); return; } shuffle = 0; fontIdx = 0; page = 0; generate(); });
  $('#bs-shuffle').onclick = () => { if (!$('#bs-name').value.trim()) { $('#bs-name').focus(); K.toast('Type your business name first'); return; } shuffle++; fontIdx = 0; generate(); };

  K.whenAI(() => {
    const sh = $('#bs-shuffle'); if (!sh) return;
    const b = K.elh('button', 'tb tb--ai', K.AI_ICON + ' Taglines from AI'); b.type = 'button';
    b.onclick = () => { if (!ensureReady()) return; K.busy(b, async () => {
      const res = await K.ai('taglines', { name: $('#bs-name').value.trim(), industry: $('#bs-industry').value, mood: mood(), offer: E.INDUSTRIES[$('#bs-industry').value].noun });
      if (res && res.taglines && res.taglines.length) { brand.taglines = res.taglines.concat(brand.taglines.filter((x) => res.taglines.indexOf(x) < 0)).slice(0, 8); render(); K.toast('AI taglines added. Pick one under Taglines.'); }
      else K.toast('AI is busy right now. Try again in a moment.', 'err');
    }); };
    sh.after(b);
  });
  $('#bs-swapfonts').onclick = () => { fontIdx++; const set = brand.fontSet; brand.fonts = set[fontIdx % set.length]; render(); };
  K.$$('#bs-tabs button').forEach((b, i) => b.onclick = () => { page = i; showPage(); });
  let t; const soft = () => { clearTimeout(t); t = setTimeout(() => { readReq(); render(true); }, 350); };
  ['#bs-contact', '#bs-business', '#bs-email', '#bs-wa', '#bs-notes', '#bs-timeline', '#bs-budget'].forEach((s) => $(s).addEventListener('input', soft));
  $('#bs-services').addEventListener('change', soft);
  [$('#bs-industry'), $('#bs-mood')].forEach((c) => c.addEventListener('change', () => { if ($('#bs-name').value.trim()) { shuffle = 0; fontIdx = 0; generate(); } }));

  generate();
})();
