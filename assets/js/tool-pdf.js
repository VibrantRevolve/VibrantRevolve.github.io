/* Images to PDF + PDF shrinker. Runs in the browser; files are never uploaded. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#pf-root')) return;
  const val = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const MAX_IMG = 60, MAX_MB = 60, MAX_PAGES = 120;
  const SIZES = { a4: [595.28, 841.89], letter: [612, 792], a5: [419.53, 595.28] };

  /* tabs */
  const modes = { img: $('#pf-img'), shrink: $('#pf-shrink') };
  K.$$('input[name="pf-mode"]').forEach((r) => r.addEventListener('change', () => { Object.keys(modes).forEach((k) => (modes[k].hidden = k !== r.value)); }));

  /* ---------- Images to PDF ---------- */
  const imgs = []; let seq = 0;
  async function decode(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {}
    const url = URL.createObjectURL(file);
    try { return await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); } finally { setTimeout(() => URL.revokeObjectURL(url), 4000); }
  }
  function thumb(img) { const k = Math.min(1, 160 / Math.max(img.width, img.height)), c = K.canvas(Math.round(img.width * k) || 1, Math.round(img.height * k) || 1); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.7); }
  async function addImgs(list) {
    const files = Array.from(list || []).filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name));
    if (!files.length) return K.toast('Please choose image files.', 'err');
    for (const f of files) {
      if (imgs.length >= MAX_IMG) { K.toast('Up to ' + MAX_IMG + ' images at a time.', 'err'); break; }
      try { const img = await decode(f); imgs.push({ id: ++seq, name: f.name, img, w: img.width, h: img.height, th: thumb(img) }); } catch (e) { K.toast('Could not read ' + f.name, 'err'); }
    }
    paintImgs();
  }
  function paintImgs() {
    const box = $('#pf-thumbs'); box.innerHTML = '';
    $('#pf-img-empty').hidden = imgs.length > 0; $('#pf-img-tools').hidden = !imgs.length;
    imgs.forEach((it, i) => {
      const card = K.el('div', 'pf-th'); const im = new Image(); im.src = it.th; im.alt = 'Page ' + (i + 1) + ': ' + it.name; card.appendChild(im);
      card.appendChild(K.el('span', 'pf-n', String(i + 1)));
      const act = K.el('div', 'pf-ta');
      const mk = (txt, label, fn, dis) => { const b = K.el('button', '', txt); b.type = 'button'; b.setAttribute('aria-label', label + ' (page ' + (i + 1) + ')'); b.disabled = !!dis; b.onclick = fn; act.appendChild(b); };
      mk('←', 'Move earlier', () => { [imgs[i - 1], imgs[i]] = [imgs[i], imgs[i - 1]]; paintImgs(); }, i === 0);
      mk('→', 'Move later', () => { [imgs[i + 1], imgs[i]] = [imgs[i], imgs[i + 1]]; paintImgs(); }, i === imgs.length - 1);
      mk('×', 'Remove', () => { imgs.splice(i, 1); paintImgs(); });
      card.appendChild(act); box.appendChild(card);
    });
    $('#pf-img-count').textContent = imgs.length + (imgs.length === 1 ? ' page' : ' pages');
  }
  function layout(it) {
    const size = val('pf-size'), orient = val('pf-orient'), m = +val('pf-margin');
    let pw, ph;
    if (size === 'fit') { const k = Math.min(1, 842 / Math.max(it.w, it.h)); pw = Math.max(72, Math.round(it.w * k)); ph = Math.max(72, Math.round(it.h * k)); return { pw, ph, x: 0, y: 0, w: pw, h: ph, m: 0 }; }
    [pw, ph] = SIZES[size];
    const land = orient === 'landscape' || (orient === 'auto' && it.w > it.h); if (land) [pw, ph] = [ph, pw];
    const aw = pw - 2 * m, ah = ph - 2 * m, k = Math.min(aw / it.w, ah / it.h), w = it.w * k, h = it.h * k;
    return { pw, ph, x: (pw - w) / 2, y: (ph - h) / 2, w, h, m };
  }
  async function buildImgPdf(btn) {
    const q = +$('#pf-iq').value / 100, DPI = 150, pages = [];
    for (const it of imgs) {
      const L = layout(it), sc = DPI / 72, c = K.canvas(Math.round(L.pw * sc), Math.round(L.ph * sc)), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingQuality = 'high';
      x.drawImage(it.img, L.x * sc, L.y * sc, L.w * sc, L.h * sc); pages.push({ canvas: c, w: L.pw, h: L.ph });
    }
    return K.pdfPages(pages, { quality: q, title: ($('#pf-title').value || 'Document').trim() });
  }
  $('#pf-iq').addEventListener('input', () => ($('#pf-iqv').textContent = $('#pf-iq').value));
  $('#pf-make').onclick = (e) => K.busy(e.currentTarget, async () => {
    if (!imgs.length) return K.toast('Add some images first.', 'err');
    const blob = await buildImgPdf(); K.download(blob, K.slug($('#pf-title').value || 'images') + '.pdf'); K.toast('PDF ready · ' + K.fmtBytes(blob.size));
  });
  $('#pf-img-clear').onclick = () => { imgs.splice(0); paintImgs(); };
  const d1 = $('#pf-drop'), f1 = $('#pf-file');
  wireDrop(d1, f1, addImgs); document.addEventListener('paste', (e) => { if (modes.img.hidden) return; const f = Array.from((e.clipboardData || {}).files || []).filter((x) => /^image\//.test(x.type)); if (f.length) addImgs(f); });

  /* ---------- PDF shrinker ---------- */
  let src = null; // {file, doc, pages}
  const LEVELS = { light: { dpi: 130, q: 0.78, label: 'Light' }, balanced: { dpi: 100, q: 0.65, label: 'Balanced' }, strong: { dpi: 72, q: 0.5, label: 'Strong' } };
  let libPromise = null;
  function loadLib() {
    if (window.pdfjsLib) return Promise.resolve();
    return (libPromise = libPromise || new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/assets/js/vendor/pdfjs/pdf.min.js'; s.onload = res; s.onerror = () => { libPromise = null; rej(new Error('Could not load the PDF engine')); }; document.head.appendChild(s); }))
      .then(() => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/js/vendor/pdfjs/pdf.worker.min.js'; });
  }
  async function openPdf(file) {
    if (!file) return;
    if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) return K.toast('Please choose a PDF file.', 'err');
    if (file.size > MAX_MB * 1048576) return K.toast('That PDF is over ' + MAX_MB + ' MB.', 'err');
    const st = $('#pf-sh-status'); st.textContent = 'Reading PDF…';
    try {
      await loadLib(); const data = new Uint8Array(await file.arrayBuffer());
      const doc = await window.pdfjsLib.getDocument({ data }).promise;
      if (doc.numPages > MAX_PAGES) { st.textContent = ''; return K.toast('This PDF has ' + doc.numPages + ' pages. The limit is ' + MAX_PAGES + '.', 'err'); }
      src = { file, doc, pages: doc.numPages }; st.textContent = '';
      $('#pf-sh-name').textContent = file.name; $('#pf-sh-meta').textContent = src.pages + (src.pages === 1 ? ' page' : ' pages') + ' · ' + K.fmtBytes(file.size);
      $('#pf-sh-empty').hidden = true; $('#pf-sh-tools').hidden = false; $('#pf-sh-res').hidden = true;
    } catch (e) {
      console.error(e); src = null; st.textContent = '';
      K.toast(e && e.name === 'PasswordException' ? 'This PDF is password protected.' : 'Could not read this PDF.', 'err');
    }
  }
  async function shrink() {
    const lv = LEVELS[val('pf-level')], st = $('#pf-sh-status'), pages = [];
    for (let n = 1; n <= src.pages; n++) {
      st.textContent = 'Compressing page ' + n + ' of ' + src.pages + '…';
      const pg = await src.doc.getPage(n), base = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: lv.dpi / 72 });
      const c = K.canvas(Math.max(1, Math.round(vp.width)), Math.max(1, Math.round(vp.height))), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: x, viewport: vp }).promise; pages.push({ canvas: c, w: base.width, h: base.height }); pg.cleanup();
      await new Promise((r) => setTimeout(r, 0));
    }
    st.textContent = 'Building PDF…';
    const blob = await K.pdfPages(pages, { quality: lv.q, title: src.file.name.replace(/\.pdf$/i, '') }); st.textContent = ''; return blob;
  }
  $('#pf-shrink-go').onclick = (e) => K.busy(e.currentTarget, async () => {
    if (!src) return;
    try {
      const blob = await shrink(), box = $('#pf-sh-res'), out = src.file.name.replace(/\.pdf$/i, '') + '-smaller.pdf';
      box.hidden = false; box.innerHTML = '';
      if (blob.size >= src.file.size) { box.appendChild(K.el('p', 'pf-big', 'This PDF is already compact (' + K.fmtBytes(src.file.size) + '). Re-compressing would not make it smaller, so try the Strong level or keep your original.')); K.toast('Already compact', 'err'); return; }
      const pct = Math.round((1 - blob.size / src.file.size) * 100);
      box.appendChild(K.elh('p', 'pf-big', '<b></b>')); box.firstChild.firstChild.textContent = K.fmtBytes(src.file.size) + ' → ' + K.fmtBytes(blob.size) + ' (−' + pct + '%)';
      box.appendChild(K.el('p', 'tp-note', 'Pages are flattened to images to shrink them, so text in the new file cannot be selected or searched. Keep your original for editing.'));
      const b = K.elh('button', 'tb tb--gold', 'Download smaller PDF'); b.type = 'button'; b.onclick = () => K.download(blob, out); box.appendChild(b); K.toast('Smaller PDF ready');
    } catch (err) { console.error(err); $('#pf-sh-status').textContent = ''; K.toast('Could not compress this PDF.', 'err'); }
  });
  $('#pf-sh-clear').onclick = () => { src = null; $('#pf-sh-empty').hidden = false; $('#pf-sh-tools').hidden = true; $('#pf-sh-res').hidden = true; };
  wireDrop($('#pf-sdrop'), $('#pf-sfile'), (l) => openPdf(l[0]));

  function wireDrop(drop, input, fn) {
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
    drop.addEventListener('drop', (e) => fn(e.dataTransfer.files));
    input.addEventListener('change', (e) => { fn(e.target.files); e.target.value = ''; });
  }
  paintImgs();
})();
