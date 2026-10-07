/* Image Compressor & Resizer. Runs in the browser: images are never uploaded. */
(function () {
  const K = window.VRKit, $ = K.$;
  const drop = $('#ic-drop'); if (!drop) return;
  const MAX_FILES = 30, MAX_BYTES = 40 * 1048576, MAX_SIDE = 8192;
  const PRESETS = {
    smaller: { label: 'Just make it smaller', fmt: 'keep', q: 76, max: '0', crop: false, target: '' },
    portal: { label: 'Job or school portal (under 200 KB)', fmt: 'jpeg', q: 88, max: '1600', crop: false, target: '200' },
    passport: { label: 'Passport photo (600 × 600, under 100 KB)', fmt: 'jpeg', q: 90, max: '600', crop: true, target: '100' },
    social: { label: 'WhatsApp or Instagram (1080 px)', fmt: 'jpeg', q: 82, max: '1080', crop: false, target: '500' },
    email: { label: 'Email attachment (under 300 KB)', fmt: 'jpeg', q: 82, max: '1600', crop: false, target: '300' },
    custom: { label: 'Custom' }
  };
  const MAXES = [['0', 'Original size'], ['3000', '3000 px'], ['2048', '2048 px'], ['1600', '1600 px'], ['1280', '1280 px'], ['1080', '1080 px'], ['800', '800 px'], ['600', '600 px'], ['custom', 'Custom']];
  $('#ic-presets').innerHTML = Object.keys(PRESETS).map((k) => `<label class="chip"><input type="radio" name="ic-preset" value="${k}" ${k === 'smaller' ? 'checked' : ''}><span>${PRESETS[k].label}</span></label>`).join('');
  $('#ic-max').innerHTML = MAXES.map((m) => `<option value="${m[0]}">${m[1]}</option>`).join('');

  const items = []; let seq = 0, timer = 0, run = 0;
  const val = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const opts = () => {
    const custom = $('#ic-max').value === 'custom';
    return { fmt: val('ic-fmt') || 'keep', q: +$('#ic-q').value / 100, max: custom ? Math.max(0, Math.min(MAX_SIDE, +$('#ic-custom').value || 0)) : +$('#ic-max').value, crop: $('#ic-crop').checked, target: Math.max(0, +$('#ic-target').value || 0) * 1024 };
  };
  const setPreset = (k) => {
    const p = PRESETS[k]; if (!p || k === 'custom') return;
    const r = document.querySelector(`input[name="ic-fmt"][value="${p.fmt}"]`); if (r) r.checked = true;
    $('#ic-q').value = Math.round(p.q); $('#ic-qv').textContent = Math.round(p.q); $('#ic-max').value = p.max; $('#ic-custom-wrap').hidden = true; $('#ic-crop').checked = p.crop; $('#ic-target').value = p.target;
  };
  const toCustom = () => { const r = document.querySelector('input[name="ic-preset"][value="custom"]'); if (r) r.checked = true; };
  const changed = (fromUser) => { if (fromUser) toCustom(); $('#ic-custom-wrap').hidden = $('#ic-max').value !== 'custom'; $('#ic-qv').textContent = $('#ic-q').value; schedule(); };
  K.$$('input[name="ic-preset"]').forEach((r) => r.addEventListener('change', () => { setPreset(r.value); changed(false); }));
  ['ic-fmt'].forEach((n) => K.$$(`input[name="${n}"]`).forEach((r) => r.addEventListener('change', () => changed(true))));
  ['ic-q', 'ic-max', 'ic-custom', 'ic-crop', 'ic-target'].forEach((id) => $('#' + id).addEventListener(id === 'ic-q' || id === 'ic-custom' || id === 'ic-target' ? 'input' : 'change', () => changed(true)));

  const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  async function decode(file) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {}
    const url = URL.createObjectURL(file);
    try { return await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); } finally { setTimeout(() => URL.revokeObjectURL(url), 4000); }
  }
  async function add(list) {
    const files = Array.from(list || []).filter((f) => f && (/^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif)$/i.test(f.name)));
    if (!files.length) return K.toast('Please choose image files (JPG, PNG, WebP).', 'err');
    for (const file of files) {
      if (items.length >= MAX_FILES) { K.toast('You can add up to ' + MAX_FILES + ' images at a time.', 'err'); break; }
      if (file.size > MAX_BYTES) { items.push({ id: ++seq, file, name: file.name, size: file.size, error: 'Too large (over ' + K.fmtBytes(MAX_BYTES) + ')' }); continue; }
      try { const img = await decode(file); items.push({ id: ++seq, file, name: file.name, size: file.size, img, w: img.width, h: img.height }); }
      catch (e) { items.push({ id: ++seq, file, name: file.name, size: file.size, error: 'This browser could not read this file' }); }
    }
    schedule(0);
  }
  const schedule = (ms) => { clearTimeout(timer); timer = setTimeout(processAll, ms == null ? 350 : ms); };

  function render(it, o, scale) {
    let sx = 0, sy = 0, sw = it.w, sh = it.h;
    if (o.crop) { const s = Math.min(it.w, it.h); sx = (it.w - s) / 2; sy = (it.h - s) / 2; sw = sh = s; }
    let k = o.max ? Math.min(1, o.max / Math.max(sw, sh)) : 1; k = Math.min(k, MAX_SIDE / Math.max(sw, sh)) * scale;
    const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k)), c = K.canvas(w, h), x = c.getContext('2d');
    x.imageSmoothingQuality = 'high'; return { c, x, w, h, sx, sy, sw, sh };
  }
  function outType(it, o) {
    let t = o.fmt === 'jpeg' ? 'image/jpeg' : o.fmt === 'webp' ? 'image/webp' : o.fmt === 'png' ? 'image/png' : (/^image\/(jpeg|png|webp)$/.test(it.file.type) ? it.file.type : (it.file.type === 'image/gif' || it.file.type === 'image/svg+xml' ? 'image/png' : 'image/jpeg'));
    let note = '';
    if (o.target && t === 'image/png') { t = 'image/jpeg'; note = 'Converted to JPG so it can reach your target size. '; }
    return { t, note };
  }
  async function encode(it, o, scale, type, q) {
    const r = render(it, o, scale); if (type === 'image/jpeg') { r.x.fillStyle = '#ffffff'; r.x.fillRect(0, 0, r.w, r.h); }
    r.x.drawImage(it.img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.w, r.h);
    const blob = await K.canvasBlob(r.c, type, q); return { blob, w: r.w, h: r.h };
  }
  async function compress(it, o) {
    const { t, note } = outType(it, o), base = it.name.replace(/\.[^.]+$/, '');
    let best = null, msg = note;
    if (o.target) {
      const scales = o.max || o.crop ? [1, 0.85, 0.7, 0.55, 0.4] : [1, 0.85, 0.7, 0.55, 0.4];
      outer: for (const s of scales) {
        let lo = 0.25, hi = Math.max(0.5, o.q), cand = null;
        const top = await encode(it, o, s, t, hi);
        if (top.blob.size <= o.target) { best = top; break; }
        for (let n = 0; n < 7; n++) { const mid = (lo + hi) / 2, r = await encode(it, o, s, t, mid); if (r.blob.size <= o.target) { cand = r; lo = mid; } else hi = mid; }
        if (cand) { best = cand; break outer; }
        const floor = await encode(it, o, s, t, 0.25); if (!best || floor.blob.size < best.blob.size) best = floor;
        if (s === scales[scales.length - 1] && best.blob.size > o.target) msg += 'Closest possible to your target. ';
      }
    } else best = await encode(it, o, 1, t, o.q);
    const resized = best.w !== it.w || best.h !== it.h, sameType = t === it.file.type;
    if (!o.target && !resized && sameType && best.blob.size >= it.size) return { blob: it.file, w: it.w, h: it.h, name: it.name, note: 'Already well optimised, original kept.', kept: true };
    return { blob: best.blob, w: best.w, h: best.h, name: base + '-compressed.' + EXT[t], note: msg.trim() };
  }
  async function processAll() {
    const my = ++run, o = opts(), todo = items.filter((i) => !i.error);
    if (!todo.length) { paint(); return; }
    $('#ic-list').classList.add('is-working');
    for (const it of todo) {
      if (my !== run) return;
      it.busy = true; paint();
      try { it.res = await compress(it, o); it.fail = ''; } catch (e) { console.error(e); it.fail = 'Could not process this image'; }
      it.busy = false;
    }
    if (my === run) { $('#ic-list').classList.remove('is-working'); paint(); }
  }

  const urls = [];
  function paint() {
    urls.splice(0).forEach((u) => URL.revokeObjectURL(u));
    const box = $('#ic-list'); box.innerHTML = ''; const has = items.length > 0;
    $('#ic-empty').hidden = has; box.hidden = !has; $('#ic-tools').hidden = !has;
    let before = 0, after = 0, done = 0;
    items.forEach((it) => {
      const row = K.el('div', 'ic-row' + (it.error || it.fail ? ' is-err' : '')), th = K.el('div', 'ic-th');
      if (it.res) { const u = URL.createObjectURL(it.res.blob); urls.push(u); const im = new Image(); im.src = u; im.alt = ''; th.appendChild(im); }
      row.appendChild(th);
      const meta = K.el('div', 'ic-meta'); meta.appendChild(K.el('strong', 'ic-name', it.res ? it.res.name : it.name));
      if (it.error || it.fail) meta.appendChild(K.el('small', 'ic-bad', it.error || it.fail));
      else if (it.busy || !it.res) meta.appendChild(K.el('small', '', 'Working…'));
      else {
        const pct = Math.round((1 - it.res.blob.size / it.size) * 100); before += it.size; after += it.res.blob.size; done++;
        const line = K.el('small', ''); line.append(K.fmtBytes(it.size) + ' → '); line.appendChild(K.el('b', '', K.fmtBytes(it.res.blob.size))); line.append(pct > 0 ? '  (−' + pct + '%)' : pct < 0 ? '  (+' + Math.abs(pct) + '%)' : ''); meta.appendChild(line);
        meta.appendChild(K.el('small', '', it.w + ' × ' + it.h + ' → ' + it.res.w + ' × ' + it.res.h + ' px'));
        if (it.res.note) meta.appendChild(K.el('small', 'ic-note', it.res.note));
      }
      row.appendChild(meta);
      const act = K.el('div', 'ic-act');
      if (it.res) {
        const dl = K.elh('button', 'tb tb--sm tb--gold', 'Download'); dl.type = 'button'; dl.onclick = () => K.download(it.res.blob, it.res.name); act.appendChild(dl);
        const pv = K.el('button', 'tb tb--sm', 'View'); pv.type = 'button'; pv.onclick = () => { const u = URL.createObjectURL(it.res.blob); window.open(u, '_blank', 'noopener'); setTimeout(() => URL.revokeObjectURL(u), 60000); }; act.appendChild(pv);
      }
      const rm = K.el('button', 'tb tb--sm', 'Remove'); rm.type = 'button'; rm.setAttribute('aria-label', 'Remove ' + it.name); rm.onclick = () => { const i = items.indexOf(it); if (i > -1) items.splice(i, 1); paint(); }; act.appendChild(rm);
      row.appendChild(act); box.appendChild(row);
    });
    const sum = $('#ic-sum');
    sum.textContent = done ? done + (done === 1 ? ' image' : ' images') + ': ' + K.fmtBytes(before) + ' → ' + K.fmtBytes(after) + (before > after ? '  (saved ' + Math.round((1 - after / before) * 100) + '%)' : '') : (has ? 'Working…' : '');
    $('#ic-zip').hidden = done < 2;
  }

  drop.addEventListener('click', () => $('#ic-file').click());
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#ic-file').click(); } });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
  drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
  $('#ic-file').addEventListener('change', (e) => { add(e.target.files); e.target.value = ''; });
  document.addEventListener('paste', (e) => { const f = Array.from((e.clipboardData || {}).files || []).filter((x) => /^image\//.test(x.type)); if (f.length) add(f); });
  $('#ic-clear').onclick = () => { run++; items.splice(0); paint(); };
  $('#ic-zip').onclick = (e) => K.busy(e.currentTarget, async () => { const ok = items.filter((i) => i.res); K.download(await K.zip(ok.map((i) => ({ name: i.res.name, blob: i.res.blob }))), 'compressed-images.zip'); K.toast('ZIP downloaded'); });
  setPreset('smaller'); paint();
})();
