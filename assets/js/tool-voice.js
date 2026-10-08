/* Voice Studio: live dictation, file transcription (Cloudflare Worker) and read-aloud. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#vo-root')) return;
  const pad = (n, l) => String(n).padStart(l || 2, '0');
  const ts = (sec, sep) => { sec = Math.max(0, sec); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60), ms = Math.round((sec - Math.floor(sec)) * 1000); return pad(h) + ':' + pad(m) + ':' + pad(s) + (sep || ',') + pad(ms, 3); };
  const srt = (g) => g.map((s, i) => (i + 1) + '\n' + ts(s.start) + ' --> ' + ts(s.end) + '\n' + s.text.trim() + '\n').join('\n');
  const vtt = (g) => 'WEBVTT\n\n' + g.map((s) => ts(s.start, '.') + ' --> ' + ts(s.end, '.') + '\n' + s.text.trim() + '\n').join('\n');
  const tb = (t, type) => new Blob([t], { type: type || 'text/plain;charset=utf-8' });
  const LANGS = [['en-NG', 'English (Nigeria)'], ['en-GB', 'English (UK)'], ['en-US', 'English (US)'], ['en-GH', 'English (Ghana)'], ['en-KE', 'English (Kenya)'], ['en-ZA', 'English (South Africa)'], ['fr-FR', 'French'], ['es-ES', 'Spanish'], ['pt-BR', 'Portuguese (Brazil)'], ['ar-SA', 'Arabic'], ['sw-KE', 'Swahili']];
  const langSel = $('#vo-lang'); langSel.innerHTML = LANGS.map((l) => `<option value="${l[0]}">${l[1]}</option>`).join('');
  try { const sv = localStorage.getItem('vr-vo-lang'); if (sv) langSel.value = sv; } catch (e) {}
  if (!langSel.value) langSel.value = 'en-NG';

  const modes = { stt: $('#vo-stt'), tts: $('#vo-tts') };
  K.$$('input[name="vo-mode"]').forEach((r) => r.addEventListener('change', () => { Object.keys(modes).forEach((k) => (modes[k].hidden = k !== r.value)); if (r.value !== 'stt') stopDict(); if (r.value !== 'tts') stopSay(); }));

  /* ---- Live dictation ---- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const box = $('#vo-text'), btn = $('#vo-start'), status = $('#vo-status'), interim = $('#vo-interim');
  let rec = null, want = false, t0 = 0, segs = [], lastEnd = 0;
  const say = (m, bad) => { status.textContent = m || ''; status.classList.toggle('is-bad', !!bad); };
  const count = () => { const w = (box.value.match(/\S+/g) || []).length; $('#vo-count').textContent = w + (w === 1 ? ' word' : ' words'); $('#vo-out').hidden = !box.value.trim(); };
  box.addEventListener('input', count);
  const cap = (prev, add) => { add = add.trim(); if (!add) return ''; if (!prev.trim() || /[.!?]\s*$/.test(prev) || /\n\s*$/.test(prev)) add = add.charAt(0).toUpperCase() + add.slice(1); return (prev && !/\s$/.test(prev) ? ' ' : '') + add; };
  function ui(on) { btn.classList.toggle('is-rec', on); btn.setAttribute('aria-pressed', on); btn.querySelector('span').textContent = on ? 'Stop dictating' : (box.value.trim() ? 'Resume dictating' : 'Start dictating'); }
  function startDict() {
    rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = langSel.value;
    rec.onresult = (e) => {
      let tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i], tx = r[0].transcript;
        if (r.isFinal) { const add = cap(box.value, tx); if (add) { box.value += add; const now = (Date.now() - t0) / 1000; segs.push({ start: lastEnd, end: now, text: add.trim() }); lastEnd = now; count(); box.scrollTop = box.scrollHeight; } } else tmp += tx;
      }
      interim.textContent = tmp;
    };
    rec.onerror = (e) => {
      const m = { 'not-allowed': 'Microphone access is blocked. Allow it in your browser settings and try again.', 'service-not-allowed': 'Microphone access is blocked. Allow it in your browser settings and try again.', 'audio-capture': 'No microphone was found.', network: 'Speech recognition needs an internet connection.', 'language-not-supported': 'This browser does not support that language.' }[e.error];
      if (m) { want = false; say(m, true); ui(false); }
    };
    rec.onend = () => { if (want) { try { rec.start(); } catch (e) { want = false; ui(false); } } else ui(false); };
    try { t0 = Date.now() - lastEnd * 1000; rec.start(); want = true; say('Listening… speak now.'); ui(true); } catch (e) { say('Could not start the microphone.', true); }
  }
  function stopDict() { want = false; if (rec) { try { rec.stop(); } catch (e) {} } interim.textContent = ''; if (status.textContent.indexOf('Listening') === 0) say(''); ui(false); }
  if (!SR) { $('#vo-live-unsupported').hidden = false; btn.disabled = true; }
  btn.onclick = () => (want ? stopDict() : startDict());
  langSel.addEventListener('change', () => { try { localStorage.setItem('vr-vo-lang', langSel.value); } catch (e) {} loadVoices(); if (want) { stopDict(); setTimeout(startDict, 250); } });
  $('#vo-clear').onclick = () => { stopDict(); box.value = ''; segs = []; lastEnd = 0; say(''); count(); ui(false); };
  $('#vo-tidy').onclick = () => { box.value = box.value.replace(/[ \t]+/g, ' ').replace(/ ([,.!?;:])/g, '$1').replace(/([.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bi\b/g, 'I').trim(); if (box.value && !/[.!?]$/.test(box.value)) box.value += '.'; count(); };
  $('#vo-copy').onclick = (e) => K.copy(box.value, e.currentTarget, 'Copied');
  $('#vo-txt').onclick = () => K.download(tb(box.value), 'transcript.txt');
  const needSegs = () => { if (segs.length) return segs; const t = box.value.trim(); return t ? t.split(/(?<=[.!?])\s+/).map((x, i, a) => ({ start: i * 4, end: i * 4 + 4, text: x })) : []; };
  $('#vo-srt').onclick = () => { const g = needSegs(); if (g.length) K.download(tb(srt(g), 'application/x-subrip'), 'captions.srt'); };
  $('#vo-vtt').onclick = () => { const g = needSegs(); if (g.length) K.download(tb(vtt(g), 'text/vtt'), 'captions.vtt'); };

  /* ---- Transcribe a file (Worker) ---- */
  K.whenAI(() => { $('#vo-file-box').hidden = false; $('#vo-file-off').hidden = true; $('#vo-mp3-box').hidden = false; $('#vo-mp3-off').hidden = true; });
  const RATE = 16000, CHUNK = 60, MAX_MIN = 30, MAX_MB = 60;
  let working = false;
  function wav(x) { const n = x.length, b = new ArrayBuffer(44 + n * 2), v = new DataView(b), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }; w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, RATE, true); v.setUint32(28, RATE * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true); for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, x[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); } return new Uint8Array(b); }
  const b64 = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  async function mono16(file) { const AC = window.AudioContext || window.webkitAudioContext, c = new AC(); let buf; try { buf = await c.decodeAudioData(await file.arrayBuffer()); } finally { try { c.close(); } catch (e) {} } const off = new OfflineAudioContext(1, Math.ceil(buf.duration * RATE), RATE), src = off.createBufferSource(); src.buffer = buf; src.connect(off.destination); src.start(); return (await off.startRendering()).getChannelData(0); }
  function cues(text, off) { const out = [], re = /(\d+):(\d\d):(\d\d)[.,](\d{3})\s*-->\s*(\d+):(\d\d):(\d\d)[.,](\d{3})[^\n]*\n([\s\S]*?)(?=\n\n|\n*$)/g; let m; while ((m = re.exec(text))) { const t = m[9].replace(/\n/g, ' ').trim(); if (t) out.push({ start: off + +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1e3, end: off + +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1e3, text: t }); } return out; }
  async function transcribe(file) {
    if (working) return; working = true; segs = []; lastEnd = 0; box.value = ''; count();
    try {
      if (file.size > MAX_MB * 1048576) throw new Error('That file is over ' + MAX_MB + ' MB.');
      say('Reading audio…'); let pcm; try { pcm = await mono16(file); } catch (e) { throw new Error('This browser could not read that file. Try MP3, M4A or WAV.'); }
      if (pcm.length / RATE > MAX_MIN * 60) throw new Error('That recording is longer than ' + MAX_MIN + ' minutes. Please trim it first.');
      const per = CHUNK * RATE, total = Math.ceil(pcm.length / per), lang = langSel.value.split('-')[0];
      for (let i = 0; i < total; i++) {
        say('Transcribing part ' + (i + 1) + ' of ' + total + '…'); const sl = pcm.subarray(i * per, Math.min(pcm.length, (i + 1) * per)); if (sl.length < RATE * 0.4) continue;
        let d = null; for (let a = 0; a < 2 && !d; a++) d = await K.ai('transcribe', { audio: b64(wav(sl)), lang }, 90000);
        if (!d) throw new Error('The transcription service did not answer. Check your connection and try again.');
        const off = i * CHUNK; let c = d.vtt ? cues(d.vtt, off) : []; if (!c.length) c = [{ start: off, end: off + sl.length / RATE, text: d.text || '' }]; segs.push(...c.filter((x) => x.text));
        box.value += (box.value ? ' ' : '') + (d.text || '').trim(); count();
      }
      lastEnd = segs.length ? segs[segs.length - 1].end : 0; say('Transcript ready. Read it through before you publish.'); ui(false);
    } catch (e) { say(e.message || 'Could not transcribe that file.', true); } finally { working = false; }
  }
  $('#vo-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) transcribe(f); });

  /* ---- Read aloud ---- */
  const synth = window.speechSynthesis, script = $('#vo-script'); let voices = [], speaking = false, qi = 0, queue = [], done = 0, totalW = 0;
  function loadVoices() { if (!synth) return; voices = synth.getVoices(); const sel = $('#vo-voice'), cur = sel.value, lg = langSel.value.split('-')[0]; const sorted = voices.slice().sort((a, b) => (b.lang.startsWith(lg) - a.lang.startsWith(lg)) || a.name.localeCompare(b.name)); sel.innerHTML = sorted.map((v) => `<option value="${K.esc(v.voiceURI)}">${K.esc(v.name)} (${K.esc(v.lang)})</option>`).join('') || '<option value="">Default voice</option>'; if (cur && sorted.some((v) => v.voiceURI === cur)) sel.value = cur; }
  const stats = () => { const w = (script.value.match(/\S+/g) || []).length, r = +$('#vo-rate').value, sec = Math.round((w / (150 * r)) * 60); $('#vo-stats').textContent = w + ' words · about ' + (sec >= 60 ? Math.floor(sec / 60) + ' min ' + (sec % 60) + ' s' : sec + ' s') + ' read aloud'; };
  if (!synth) { $('#vo-tts-unsupported').hidden = false; ['vo-play', 'vo-preview', 'vo-voice', 'vo-rate', 'vo-pitch'].forEach((i) => ($('#' + i).disabled = true)); } else { loadVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices); }
  const pieces = (t) => (t.replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]*\s*/g) || [t]).reduce((a, s) => { const l = a[a.length - 1]; if (l && (l + s).length < 180) a[a.length - 1] = l + s; else a.push(s); return a; }, []).map((s) => s.trim()).filter(Boolean);
  const wc = (s) => (s.match(/\S+/g) || []).length;
  function buttons(state) { $('#vo-play').querySelector('span').textContent = state === 'play' ? 'Playing…' : state === 'pause' ? 'Resume' : 'Play'; $('#vo-pause').disabled = state !== 'play'; $('#vo-stop').disabled = state === 'idle'; }
  function next() { if (!speaking || qi >= queue.length) { speaking = false; buttons('idle'); $('#vo-prog').value = qi >= queue.length && queue.length ? 100 : 0; $('#vo-now').textContent = queue.length && qi >= queue.length ? 'Finished' : ''; return; } const u = new SpeechSynthesisUtterance(queue[qi]); const v = voices.find((x) => x.voiceURI === $('#vo-voice').value); if (v) { u.voice = v; u.lang = v.lang; } u.rate = +$('#vo-rate').value; u.pitch = +$('#vo-pitch').value; u.onend = () => { done += wc(queue[qi]); qi++; $('#vo-prog').value = totalW ? Math.round((done / totalW) * 100) : 0; next(); }; u.onerror = () => { speaking = false; buttons('idle'); }; $('#vo-now').textContent = 'Part ' + (qi + 1) + ' of ' + queue.length; synth.speak(u); }
  function play(text) { if (!synth) return; synth.cancel(); queue = pieces(text); qi = 0; done = 0; totalW = wc(text); speaking = true; buttons('play'); next(); }
  function stopSay() { speaking = false; if (synth) synth.cancel(); queue = []; $('#vo-prog').value = 0; $('#vo-now').textContent = ''; buttons('idle'); }
  $('#vo-play').onclick = () => { if (synth && synth.paused) { synth.resume(); buttons('play'); return; } const t = script.value.trim(); if (!t) return K.toast('Type or paste a script first.', 'err'); play(t); };
  $('#vo-pause').onclick = () => { if (synth) { synth.pause(); buttons('pause'); } };
  $('#vo-stop').onclick = stopSay;
  $('#vo-preview').onclick = () => play('Hello, this is a sample of the voice you picked. Change the speed and pitch to suit your video.');
  $('#vo-rate').addEventListener('input', () => { $('#vo-ratev').textContent = (+$('#vo-rate').value).toFixed(1) + '×'; stats(); });
  $('#vo-pitch').addEventListener('input', () => { $('#vo-pitchv').textContent = (+$('#vo-pitch').value).toFixed(1); });
  script.addEventListener('input', stats); stats(); window.addEventListener('beforeunload', stopSay);

  /* MP3 via Worker (MeloTTS) */
  const parts = (t) => { const o = []; let c = ''; pieces(t).forEach((s) => { if ((c + ' ' + s).length > 800 && c) { o.push(c); c = s; } else c = c ? c + ' ' + s : s; }); if (c) o.push(c); return o; };
  $('#vo-mp3').onclick = (e) => K.busy(e.currentTarget, async () => {
    const t = script.value.trim(), st = $('#vo-mp3-status'); if (!t) return K.toast('Type or paste a script first.', 'err'); if (t.length > 6000) return K.toast('Keep it under 6,000 characters.', 'err');
    const ps = parts(t), bufs = [];
    for (let i = 0; i < ps.length; i++) { st.textContent = 'Creating audio ' + (i + 1) + ' of ' + ps.length + '…'; const d = await K.ai('speak', { text: ps[i], lang: langSel.value.split('-')[0] }, 60000); if (!d || !d.audio) { st.textContent = ''; return K.toast('The voice service did not answer. Try again, or use Play.', 'err'); } const bin = atob(String(d.audio).replace(/^data:[^,]*,/, '')), u = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k); bufs.push(u); }
    const blob = new Blob(bufs, { type: 'audio/mpeg' }); st.textContent = ''; K.download(blob, 'voiceover.mp3'); K.toast('Audio ready · ' + K.fmtBytes(blob.size));
  });
  count(); ui(false); buttons('idle');
})();
