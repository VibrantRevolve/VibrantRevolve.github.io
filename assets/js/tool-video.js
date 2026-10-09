/* Video Studio: script + images -> captioned video with transitions, music and optional AI voice-over/images. Rendered in the browser. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#vv-root')) return;
  const val = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const SIZES = { '9:16': [720, 1280, 'Reels, TikTok, Status'], '1:1': [720, 720, 'Instagram, Facebook'], '16:9': [1280, 720, 'YouTube, websites'] };
  $('#vv-sizes').innerHTML = Object.keys(SIZES).map((k, i) => `<label class="chip"><input type="radio" name="vv-size" value="${k}" ${i === 0 ? 'checked' : ''}><span>${k} <small>${SIZES[k][2]}</small></span></label>`).join('');
  const MAX_SCENES = 24, MAX_SEC = 180, TR = 0.6;
  let scenes = [], vo = new Map(), musicBuf = null, musicName = '', playing = null, dctx = null;
  const words = (t) => (String(t).match(/\S+/g) || []).length;
  const autoDur = (s) => (s.vid && s.vid.duration && isFinite(s.vid.duration) ? Math.min(20, Math.max(2, s.vid.duration)) : Math.min(9, Math.max(2.5, words(s.text) / 2.6 + 0.8)));
  const sceneDur = (s) => { const v = vo.get(s.text); const base = s.dur > 0 ? s.dur : autoDur(s); return v ? Math.max(base, v.duration + 0.5) : base; };
  const cards = () => ({ title: $('#vv-title').value.trim(), outro: $('#vv-outro').value.trim() });
  function timeline() {
    const c = cards(), list = []; let t = 0;
    const add = (o) => { o.start = t; t += o.dur; list.push(o); };
    if (c.title) add({ kind: 'card', text: c.title, sub: $('#vv-brand').value.trim(), dur: 2.6 });
    scenes.forEach((s) => add({ kind: 'scene', s, text: s.text, dur: sceneDur(s) }));
    if (c.outro) add({ kind: 'card', text: c.outro, sub: $('#vv-brand').value.trim(), dur: 3, end: true });
    return { list, total: t };
  }
  const dims = () => SIZES[val('vv-size')];
  const cv = $('#vv-canvas'), ctx = cv.getContext('2d');
  const fit = () => { const [w, h] = dims(); cv.width = w; cv.height = h; draw(0); };

  /* ---- drawing ---- */
  const C = () => ({ bg: $('#vv-c1').value, ac: $('#vv-c2').value });
  function seg(seg, lt, alpha, dx, zoom) {
    const [W, H] = dims(), col = C(); ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, alpha)); ctx.translate(dx, 0);
    if (zoom && zoom !== 1) { ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -H / 2); }
    ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H);
    const k = W / 720;
    if (seg.kind === 'card') {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, col.bg); g.addColorStop(1, K.mix ? K.mix(col.bg, col.ac, 0.45) : col.ac); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const fg = K.textOn ? K.textOn(col.bg) : '#fff'; ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const e = Math.min(1, lt / 0.5), px = Math.round((seg.text.length > 40 ? 52 : 68) * k); ctx.font = `800 ${px}px Inter, sans-serif`; ctx.globalAlpha *= e;
      const lines = []; { const ws = seg.text.split(/\s+/); let l = ''; ws.forEach((w) => { const t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > W * 0.82 && l) { lines.push(l); l = w; } else l = t; }); if (l) lines.push(l); }
      const lh = px * 1.2, y0 = H / 2 - ((lines.length - 1) * lh) / 2 - (seg.sub ? 24 * k : 0); lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh));
      if (seg.sub) { ctx.font = `600 ${Math.round(28 * k)}px Inter, sans-serif`; ctx.fillStyle = col.ac === fg ? fg : col.ac; ctx.fillText(seg.sub, W / 2, y0 + lines.length * lh + 20 * k); }
      ctx.restore(); return;
    }
    const s = seg.s;
    if (s.vid) {
      const v = s.vid; if (!playing) syncClip(v, lt);
      if (v.readyState >= 2 && v.videoWidth) { const sc = Math.max(W / v.videoWidth, H / v.videoHeight), dw = v.videoWidth * sc, dh = v.videoHeight * sc; ctx.drawImage(v, (W - dw) / 2, (H - dh) / 2, dw, dh); }
      else { ctx.fillStyle = col.bg; ctx.fillRect(0, 0, W, H); }
    } else if (s.img) {
      const p = Math.min(1, lt / seg.dur), z = $('#vv-motion').checked ? 1 + 0.1 * p : 1, iw = s.img.width, ih = s.img.height, sc = Math.max(W / iw, H / ih) * z, dw = iw * sc, dh = ih * sc;
      const ox = $('#vv-motion').checked ? (p - 0.5) * (dw - W) * 0.5 : 0; ctx.drawImage(s.img, (W - dw) / 2 + ox, (H - dh) / 2, dw, dh);
    } else { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col.bg); g.addColorStop(1, col.ac); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    const pos = $('#vv-capos').value;
    if (pos !== 'none' && seg.text) {
      const px = Math.round(40 * k), lh = px * 1.28, maxW = W * 0.84; ctx.font = `700 ${px}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const lines = []; { const ws = seg.text.split(/\s+/); let l = ''; ws.forEach((w) => { const t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > maxW && l) { lines.push(l); l = w; } else l = t; }); if (l) lines.push(l); }
      const shown = lines.slice(0, 6), bh = shown.length * lh + 36 * k, by = pos === 'top' ? 70 * k : pos === 'center' ? (H - bh) / 2 : H - bh - 80 * k;
      const e = Math.min(1, lt / 0.45); ctx.globalAlpha *= e; ctx.fillStyle = 'rgba(8,7,5,.62)'; K.rr(ctx, (W - maxW) / 2 - 18 * k, by, maxW + 36 * k, bh, 22 * k); ctx.fill();
      ctx.fillStyle = '#fff'; shown.forEach((l, i) => ctx.fillText(l, W / 2, by + 18 * k + i * lh + (1 - e) * 10 * k));
    }
    ctx.restore();
  }
  function draw(t) {
    const [W, H] = dims(), T = timeline(); ctx.fillStyle = C().bg; ctx.fillRect(0, 0, W, H);
    if (!T.list.length) { ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(30 * W / 720)}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Add a script or images to begin', W / 2, H / 2); return T; }
    t = Math.max(0, Math.min(T.total - 0.001, t)); let i = T.list.findIndex((x) => t >= x.start && t < x.start + x.dur); if (i < 0) i = T.list.length - 1;
    const a = T.list[i], lt = t - a.start, left = a.dur - lt, nx = T.list[i + 1], tr = Math.min(TR, a.dur / 2), mode = $('#vv-trans').value;
    if (nx && left < tr) {
      const q = 1 - left / tr, e = q * q * (3 - 2 * q), [Wd] = [W];
      if (mode === 'slide') { seg(a, lt, 1, -e * Wd, 1); seg(nx, 0, 1, (1 - e) * Wd, 1); }
      else if (mode === 'zoom') { seg(a, lt, 1 - e, 0, 1 + e * 0.18); seg(nx, 0, e, 0, 1.18 - e * 0.18); }
      else if (mode === 'none') seg(a, lt, 1, 0, 1);
      else { seg(a, lt, 1, 0, 1); seg(nx, 0, e, 0, 1); }
    } else seg(a, lt, 1, 0, 1);
    return T;
  }

  /* ---- video clips as scenes ---- */
  function syncClip(v, lt) { try { if (!v.duration || !isFinite(v.duration)) return; const t = Math.min(lt % v.duration, v.duration - 0.05); if (Math.abs(v.currentTime - t) > 0.15) v.currentTime = t; } catch (e) { /* not ready yet */ } }
  function clipWindow(T, t) { // play only the clips that are on screen (plus the transition lead-in)
    T.list.forEach((x) => { if (x.kind !== 'scene' || !x.s.vid) return; const v = x.s.vid, on = t >= x.start - TR && t < x.start + x.dur; if (on && v.paused) { if (t < x.start) v.currentTime = 0; v.play().catch(() => {}); } else if (!on && !v.paused) v.pause(); });
  }
  function stopClips() { scenes.forEach((s) => { if (s.vid && !s.vid.paused) s.vid.pause(); }); }
  async function toClip(file) {
    if (file.size > 60 * 1048576) throw new Error('A clip is over 60 MB. Please shorten it first.');
    const url = URL.createObjectURL(file), v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.addEventListener('seeked', () => { if (!playing) draw(cur); }); v.src = url;
    await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('This browser could not read that video. Try an MP4.')); setTimeout(() => rej(new Error('That video took too long to load.')), 20000); });
    const c = K.canvas(120, Math.round(120 * (v.videoHeight || 9) / (v.videoWidth || 16))); try { c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); } catch (e) {}
    let buf = null; if ($('#vv-clipsound').checked && file.size <= 40 * 1048576) { try { buf = await decode(await file.arrayBuffer()); } catch (e) { buf = null; } }
    return { vid: v, url, thumb: c.toDataURL('image/jpeg', 0.7), vbuf: buf };
  }
  const isVid = (f) => /^video\//.test(f.type) || /\.(mp4|mov|webm|m4v)$/i.test(f.name);

  /* ---- scenes list ---- */
  const esc = K.esc;
  function paint() {
    const box = $('#vv-scenes'); box.innerHTML = '';
    scenes.forEach((s, i) => {
      const d = K.el('div', 'vv-scene'); d.dataset.i = i;
      d.innerHTML = `<div class="vv-th">${s.thumb ? `<img alt="" src="${s.thumb}">` : '<span class="vv-noimg">No image</span>'}</div>
        <div class="vv-body"><label class="f"><span>Scene ${i + 1} caption</span><textarea data-f="text" rows="2" maxlength="220">${esc(s.text)}</textarea></label>
        <div class="vv-row"><label class="f vv-dur"><span>Seconds</span><input data-f="dur" type="number" min="0" max="20" step="0.5" value="${s.dur || ''}" placeholder="auto"></label>
        <div class="tp-actions" style="margin:0"><label class="tb tb--sm" style="cursor:pointer">Image or clip<input data-f="file" type="file" accept="image/*,video/*" hidden></label>
        <button class="tb tb--sm vv-aiimg" type="button" data-a="ai" ${K.aiOn() ? '' : 'hidden'}>${K.AI_ICON} AI image</button>
        <button class="tb tb--sm" type="button" data-a="up" aria-label="Move up">&uarr;</button><button class="tb tb--sm" type="button" data-a="down" aria-label="Move down">&darr;</button><button class="tb tb--sm" type="button" data-a="del">Remove</button></div></div></div>`;
      box.appendChild(d);
    });
    if (!scenes.length) box.appendChild(K.el('p', 'tp-note', 'No scenes yet. Paste a script and press "Make scenes", or upload images.'));
    stats(); draw(cur);
  }
  function stats() { const T = timeline(); $('#vv-total').textContent = scenes.length + (scenes.length === 1 ? ' scene' : ' scenes') + ' · ' + Math.round(T.total) + ' s'; $('#vv-warn').hidden = T.total <= MAX_SEC; }
  async function toScene(file) {
    const { img, url } = await K.fileImage(file); const m = Math.max(img.width, img.height), s = m > 1600 ? 1600 / m : 1, c = K.canvas(Math.round(img.width * s), Math.round(img.height * s)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); return c;
  }
  const small = (c) => { const t = K.canvas(120, Math.round(120 * c.height / c.width)); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); return t.toDataURL('image/jpeg', 0.7); };
  const setImg = (s, c) => { s.img = c; s.thumb = small(c); };
  const fromB64 = (b) => new Promise((res, rej) => { const im = new Image(); im.onload = () => { const c = K.canvas(im.width, im.height); c.getContext('2d').drawImage(im, 0, 0); res(c); }; im.onerror = rej; im.src = 'data:image/jpeg;base64,' + b; });
  let cur = 0;
  $('#vv-scenes').addEventListener('input', (e) => { const d = e.target.closest('.vv-scene'); if (!d) return; const s = scenes[+d.dataset.i], f = e.target.dataset.f; if (f === 'text') s.text = e.target.value; else if (f === 'dur') s.dur = +e.target.value || 0; stats(); draw(cur); });
  $('#vv-scenes').addEventListener('change', async (e) => { if (e.target.dataset.f !== 'file') return; const d = e.target.closest('.vv-scene'), s = scenes[+d.dataset.i], f = e.target.files[0]; if (!f) return; try { if (isVid(f)) { K.toast('Reading clip\u2026'); Object.assign(s, { img: null }, await toClip(f)); } else { s.vid = null; s.vbuf = null; setImg(s, await toScene(f)); } paint(); } catch (x) { K.toast(x.message || 'Could not read that file.', 'err'); } });
  $('#vv-scenes').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return; const i = +b.closest('.vv-scene').dataset.i, a = b.dataset.a;
    if (a === 'del') scenes.splice(i, 1); else if (a === 'up' && i > 0) [scenes[i - 1], scenes[i]] = [scenes[i], scenes[i - 1]]; else if (a === 'down' && i < scenes.length - 1) [scenes[i + 1], scenes[i]] = [scenes[i], scenes[i + 1]];
    else if (a === 'ai') return K.busy(b, async () => { const ok = await aiImage(scenes[i]); if (ok) paint(); });
    paint();
  });
  async function aiImage(s) { const q = (s.text || '').trim() || 'abstract soft background'; const d = await K.ai('image', { prompt: ($('#vv-style').value ? $('#vv-style').value + '. ' : '') + q }, 60000); if (!d || !d.image) { K.toast('The image service did not answer. Try again.', 'err'); return false; } try { setImg(s, await fromB64(d.image)); return true; } catch (e) { K.toast('Could not read the AI image.', 'err'); return false; } }
  $('#vv-addtext').onclick = () => { if (scenes.length >= MAX_SCENES) return K.toast('Up to ' + MAX_SCENES + ' scenes.', 'err'); scenes.push({ text: '', dur: 0, img: null }); paint(); };
  $('#vv-imgs').addEventListener('change', async (e) => {
    const files = [...e.target.files]; e.target.value = ''; let n = 0;
    for (const f of files) { if (scenes.length >= MAX_SCENES && !scenes.some((s) => !s.img && !s.vid)) break; try { if (isVid(f)) { const o = await toClip(f), em = scenes.find((s) => !s.img && !s.vid); if (em) Object.assign(em, o); else scenes.push(Object.assign({ text: '', dur: 0, img: null }, o)); n++; continue; } const c = await toScene(f), empty = scenes.find((s) => !s.img && !s.vid); if (empty) setImg(empty, c); else { const s = { text: '', dur: 0, img: null }; setImg(s, c); scenes.push(s); } n++; } catch (x) { K.toast(x.message || 'Skipped a file that could not be read.', 'err'); } }
    if (n) { K.toast(n + ' image' + (n === 1 ? '' : 's') + ' added'); paint(); }
  });
  $('#vv-split').onclick = () => {
    const t = $('#vv-script').value.replace(/\s+/g, ' ').trim(); if (t.length < 8) return K.toast('Paste or write a script first.', 'err');
    const sents = t.match(/[^.!?…]+[.!?…]*/g) || [t], out = []; let cur2 = '';
    sents.forEach((s) => { s = s.trim(); if (!s) return; if (cur2 && words(cur2 + ' ' + s) > 22) { out.push(cur2); cur2 = s; } else cur2 = cur2 ? cur2 + ' ' + s : s; }); if (cur2) out.push(cur2);
    const keep = scenes.filter((s) => s.img); const made = out.slice(0, MAX_SCENES).map((x, i) => (keep[i] ? Object.assign(keep[i], { text: x }) : { text: x, dur: 0, img: null }));
    scenes = made.concat(keep.slice(made.length)); vo.clear(); paint(); K.toast(made.length + ' scenes made');
  };
  $('#vv-clear').onclick = () => { stopClips(); scenes.forEach((s) => s.url && URL.revokeObjectURL(s.url)); scenes = []; vo.clear(); paint(); };

  /* ---- sound ---- */
  async function decode(arr) { dctx = dctx || new (window.AudioContext || window.webkitAudioContext)(); return await dctx.decodeAudioData(arr); }
  $('#vv-audio').addEventListener('change', async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { musicBuf = await decode(await f.arrayBuffer()); musicName = f.name; $('#vv-audio-name').textContent = f.name + ' · ' + Math.round(musicBuf.duration) + ' s'; } catch (x) { K.toast('This browser could not read that audio. Try MP3 or WAV.', 'err'); } });
  $('#vv-audio-clear').onclick = () => { musicBuf = null; $('#vv-audio-name').textContent = 'No audio'; };
  K.whenAI(() => { $('#vv-vo-wrap').hidden = false; $('#vv-aiall').hidden = false; K.$$('.vv-aiimg').forEach((b) => (b.hidden = false)); $('#vv-ai-off').hidden = true; });
  $('#vv-aiall').onclick = (e) => K.busy(e.currentTarget, async () => { let n = 0; for (const s of scenes) { if (s.img || s.vid || !s.text.trim()) continue; $('#vv-msg').textContent = 'Making image ' + (n + 1) + '…'; if (await aiImage(s)) n++; else break; } $('#vv-msg').textContent = n ? n + ' image' + (n === 1 ? '' : 's') + ' made.' : ''; paint(); });
  const b2u8 = (b) => { const bin = atob(String(b).replace(/^data:[^,]*,/, '')), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
  async function makeVoiceovers() {
    let i = 0; for (const s of scenes) { i++; const t = s.text.trim(); if (!t || vo.has(s.text)) continue; $('#vv-msg').textContent = 'Recording voice-over ' + i + ' of ' + scenes.length + '…'; const d = await K.ai('speak', { text: t.slice(0, 1200), lang: 'en' }, 60000); if (!d || !d.audio) throw new Error('The voice service did not answer. Untick voice-over or try again.'); try { vo.set(s.text, await decode(b2u8(d.audio).buffer)); } catch (e) { throw new Error('Could not read the voice-over audio.'); } }
    $('#vv-msg').textContent = '';
  }

  /* ---- play / record ---- */
  const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function audioGraph(T, record) {
    const useVO = $('#vv-vo').checked && K.aiOn(), useClip = $('#vv-clipsound').checked && T.list.some((x) => x.kind === 'scene' && x.s.vbuf); if (!musicBuf && !(useVO && vo.size) && !useClip) return null;
    const ac = new (window.AudioContext || window.webkitAudioContext)(), dest = record ? ac.createMediaStreamDestination() : null, out = dest || ac.destination, t0 = ac.currentTime + 0.15;
    if (musicBuf) { const g = ac.createGain(); g.gain.value = +$('#vv-vol').value * ((useVO && vo.size) || useClip ? 0.45 : 1); g.connect(out); for (let at = 0; at < T.total; at += musicBuf.duration) { const src = ac.createBufferSource(); src.buffer = musicBuf; src.connect(g); src.start(t0 + at, 0, Math.min(musicBuf.duration, T.total - at)); } }
    if (useVO) T.list.forEach((x) => { if (x.kind !== 'scene') return; const b = vo.get(x.text); if (!b) return; const src = ac.createBufferSource(); src.buffer = b; src.connect(out); src.start(t0 + x.start + 0.15); });
    if (useClip) T.list.forEach((x) => { if (x.kind !== 'scene' || !x.s.vbuf) return; const src = ac.createBufferSource(); src.buffer = x.s.vbuf; src.connect(out); src.start(t0 + x.start, 0, Math.min(x.s.vbuf.duration, x.dur)); });
    return { ac, dest, t0 };
  }
  function closeAC(ac) { try { if (ac && ac.state !== 'closed') ac.close().catch(() => {}); } catch (e) { /* already closed */ } }
  function stop() { stopClips(); if (!playing) return; playing.cancel = true; closeAC(playing.g && playing.g.ac); playing = null; $('#vv-play').querySelector('span').textContent = 'Play preview'; }
  async function run(record) {
    stop(); const T = timeline(); if (!T.list.length) return K.toast('Add a script or images first.', 'err'); if (T.total > MAX_SEC) return K.toast('Videos are limited to 3 minutes. Remove a few scenes.', 'err');
    if ($('#vv-vo').checked && K.aiOn()) { try { await makeVoiceovers(); } catch (e) { return K.toast(e.message, 'err'); } }
    const T2 = timeline(), g = audioGraph(T2, record), st = { cancel: false, g }; playing = st; $('#vv-play').querySelector('span').textContent = 'Stop';
    let rec = null, chunks = [], mime = '';
    if (record) {
      if (!window.MediaRecorder || !cv.captureStream) { stop(); return K.toast('This browser cannot record video. Use Chrome, Edge, Firefox or Safari 14.5 or newer.', 'err'); }
      const stream = cv.captureStream(30); if (g && g.dest) g.dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      mime = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
      rec = new MediaRecorder(stream, Object.assign({ videoBitsPerSecond: 4000000 }, mime ? { mimeType: mime } : {})); rec.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data); rec.start(500);
      $('#vv-msg').textContent = 'Recording… keep this tab open and in front. It takes as long as the video.';
    }
    const t0 = performance.now() + 150;
    await new Promise((res) => { const tick = () => { if (st.cancel) return res(); const t = Math.max(0, (performance.now() - t0) / 1000); clipWindow(T2, t); draw(t); $('#vv-seek').value = Math.min(1000, Math.round((t / T2.total) * 1000)); $('#vv-time').textContent = fmt(Math.min(t, T2.total)) + ' / ' + fmt(T2.total); if (t >= T2.total) return res(); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    const done = !st.cancel; stopClips(); closeAC(g && g.ac); if (playing === st) { playing = null; $('#vv-play').querySelector('span').textContent = 'Play preview'; }
    if (record && rec) { await new Promise((res) => { rec.onstop = res; try { rec.stop(); } catch (e) { res(); } }); if (done && chunks.length) { const type = (mime || 'video/webm').split(';')[0], blob = new Blob(chunks, { type }); const url = URL.createObjectURL(blob), v = $('#vv-out'); if (v.dataset.u) URL.revokeObjectURL(v.dataset.u); v.dataset.u = url; v.src = url; $('#vv-result').hidden = false; const ext = type.indexOf('mp4') > -1 ? 'mp4' : 'webm', name = 'video-' + K.slug(($('#vv-title').value || (scenes[0] && scenes[0].text) || 'vibrantrevolve').slice(0, 30)) + '.' + ext; $('#vv-dl').onclick = () => K.download(blob, name); $('#vv-info').textContent = ext.toUpperCase() + ' · ' + K.fmtBytes(blob.size) + ' · ' + fmt(T2.total); $('#vv-msg').textContent = 'Your video is ready.'; K.toast('Video ready'); v.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } else $('#vv-msg').textContent = 'Stopped.'; }
    draw(0); $('#vv-seek').value = 0;
  }
  $('#vv-play').onclick = () => (playing ? stop() : run(false));
  $('#vv-make').onclick = (e) => K.busy(e.currentTarget, () => run(true));
  $('#vv-seek').addEventListener('input', (e) => { if (playing) return; const T = timeline(); cur = (+e.target.value / 1000) * T.total; draw(cur); $('#vv-time').textContent = fmt(cur) + ' / ' + fmt(T.total); });
  ['vv-title', 'vv-outro', 'vv-brand', 'vv-c1', 'vv-c2', 'vv-trans', 'vv-capos', 'vv-motion'].forEach((id) => $('#' + id).addEventListener('input', () => { stats(); draw(cur); }));
  K.$$('input[name="vv-size"]').forEach((r) => r.addEventListener('change', fit));
  window.addEventListener('beforeunload', stop);
  (async () => { try { await K.fonts([['Inter', '500;600;700;800']]); } catch (e) {} fit(); paint(); })();
})();
