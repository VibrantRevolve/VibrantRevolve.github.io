/* CV Builder: live A4 preview, three templates, multi-page PDF. Everything stays on the device. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#cv-form')) return;
  const W = 1240, H = 1754, KEY = 'vr-cv';
  const SAMPLE = { name: 'Amara Okafor', title: 'Digital Marketing Executive', email: 'amara@example.com', phone: '+234 801 234 5678', loc: 'Lagos, Nigeria', link: 'linkedin.com/in/amaraokafor', summary: 'Results-driven marketer with 4 years of experience growing brands on social media and email. I turn small budgets into steady leads and love clear reporting.', skills: 'Social media strategy, Content planning, Email marketing, Canva, Google Analytics, Copywriting', extra: 'English (fluent), Igbo (native)\nGoogle Digital Marketing Certificate, 2023',
    exp: [{ role: 'Marketing Executive', org: 'BrightPath Ltd, Lagos', dates: '2022 - Present', pts: 'Grew Instagram following from 2,000 to 18,000 in 12 months\nRan email campaigns with a 34% average open rate\nReduced cost per lead by 28% through better ad targeting' }, { role: 'Social Media Assistant', org: 'Zest Foods, Ikeja', dates: '2020 - 2022', pts: 'Planned and posted daily content across three channels\nResponded to customer enquiries within one hour' }],
    edu: [{ role: 'B.Sc. Mass Communication', org: 'University of Lagos', dates: '2016 - 2020', pts: '' }] };
  let data; try { data = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {} if (!data || !data.name && !data.exp) data = JSON.parse(JSON.stringify(SAMPLE));
  data.exp = data.exp || []; data.edu = data.edu || [];
  let photo = null, accent = data.accent || '#1f6f5c', tpl = data.tpl || 'modern', t = 0;
  const val = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const TPLS = [['modern', 'Modern'], ['classic', 'Classic'], ['compact', 'Compact']];
  $('#cv-tpls').innerHTML = TPLS.map((x) => `<label class="chip"><input type="radio" name="cv-tpl" value="${x[0]}" ${x[0] === tpl ? 'checked' : ''}><span>${x[1]}</span></label>`).join('');
  $('#cv-accent').value = accent;
  const FLD = ['name', 'title', 'email', 'phone', 'loc', 'link', 'summary', 'skills', 'extra']; FLD.forEach((f) => ($('#cv-' + f).value = data[f] || ''));

  function entryHtml(kind, e, i) {
    return `<fieldset class="cv-entry" data-kind="${kind}" data-i="${i}"><legend>${kind === 'exp' ? 'Job' : 'Education'} ${i + 1}</legend>
      <label class="f"><span>${kind === 'exp' ? 'Job title' : 'Qualification'}</span><input data-k="role" type="text" value="${K.esc(e.role || '')}"></label>
      <div class="f-2"><label class="f"><span>${kind === 'exp' ? 'Company, city' : 'School'}</span><input data-k="org" type="text" value="${K.esc(e.org || '')}"></label><label class="f"><span>Dates</span><input data-k="dates" type="text" value="${K.esc(e.dates || '')}" placeholder="2021 - Present"></label></div>
      <label class="f"><span>${kind === 'exp' ? 'Achievements (one per line)' : 'Details (optional)'}</span><textarea data-k="pts" rows="3">${K.esc(e.pts || '')}</textarea></label>
      ${K.aiOn() && kind === 'exp' ? '<div class="cv-ai"><button type="button" class="tb tb--sm" data-ai="pts">' + K.AI_ICON + ' Improve with AI</button></div>' : ''}
      <div class="cv-eact"><button type="button" class="tb tb--sm" data-act="up" aria-label="Move up">&uarr;</button><button type="button" class="tb tb--sm" data-act="down" aria-label="Move down">&darr;</button><button type="button" class="tb tb--sm" data-act="del">Remove</button></div></fieldset>`;
  }
  function paintEntries() { ['exp', 'edu'].forEach((k) => { $('#cv-' + k).innerHTML = data[k].map((e, i) => entryHtml(k, e, i)).join(''); }); }
  function sync() {
    FLD.forEach((f) => (data[f] = $('#cv-' + f).value));
    ['exp', 'edu'].forEach((k) => { data[k] = K.$$('#cv-' + k + ' .cv-entry').map((fs) => { const o = {}; K.$$('[data-k]', fs).forEach((i) => (o[i.dataset.k] = i.value)); return o; }); });
    data.accent = $('#cv-accent').value; data.tpl = val('cv-tpl'); accent = data.accent; tpl = data.tpl;
  }
  function schedule() { clearTimeout(t); t = setTimeout(() => { sync(); try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} render(); }, 160); }
  /* ---- optional AI (needs the Cloudflare Worker) ---- */
  const aiNote = (btn, msg) => { const o = btn.dataset.o || btn.innerHTML; btn.dataset.o = o; btn.disabled = true; btn.textContent = msg; return () => { btn.disabled = false; btn.innerHTML = o; }; };
  $('#cv-form').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-ai]'); if (!b) return; const done = aiNote(b, 'Working…');
    try {
      if (b.dataset.ai === 'pts') { const fs = b.closest('.cv-entry'), ta = fs.querySelector('[data-k="pts"]'), role = fs.querySelector('[data-k="role"]').value; if (ta.value.trim().length < 6) return K.toast('Write a few notes first.', 'err'); const r = await K.rewrite('bullets', ta.value, { context: role }); if (!r) return K.toast('The AI service did not answer. Try again.', 'err'); ta.value = r.join('\n'); schedule(); K.toast('Rewritten. Read it and fix any detail that is wrong.'); }
      if (b.dataset.ai === 'summary') { const ta = $('#cv-summary'); if (ta.value.trim().length < 6) return K.toast('Write a short profile first.', 'err'); const r = await K.rewrite('summary', ta.value, { context: $('#cv-title').value }); if (!r) return K.toast('The AI service did not answer. Try again.', 'err'); ta.value = r[0].slice(0, 500); schedule(); K.toast('Rewritten. Read it before you download.'); }
      if (b.dataset.ai === 'translate') { sync(); const lang = $('#cv-lang').value, out = { summary: data.summary, exp: data.exp.map((x) => Object.assign({}, x)) }; const s = data.summary.trim() && await K.rewrite('translate', data.summary, { lang }); if (s) $('#cv-summary').value = s[0].slice(0, 500); const boxes = K.$$('#cv-exp [data-k="pts"]'); for (const ta of boxes) { if (!ta.value.trim()) continue; const r = await K.rewrite('translate', ta.value, { lang }); if (r) ta.value = r[0]; } schedule(); K.toast('Translated to ' + lang + '. Please proofread.'); }
    } finally { done(); }
  });
  K.whenAI(() => {
    const lab = $('#cv-summary').closest('label'); if (lab && !$('#cv-ai-sum')) { const d = K.el('div', 'cv-ai'); d.id = 'cv-ai-sum'; d.innerHTML = '<button type="button" class="tb tb--sm" data-ai="summary">' + K.AI_ICON + ' Improve with AI</button> <select id="cv-lang" class="tb tb--sm" aria-label="Translate to"><option>French</option><option>Spanish</option><option>Portuguese</option><option>German</option><option>Arabic</option><option>English</option></select> <button type="button" class="tb tb--sm" data-ai="translate">Translate CV</button>'; lab.after(d); }
    paintEntries(); });
  $('#cv-form').addEventListener('input', schedule); $('#cv-form').addEventListener('change', schedule);
  $('#cv-form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return; sync(); const fs = b.closest('.cv-entry'), k = fs.dataset.kind, i = +fs.dataset.i, a = data[k];
    if (b.dataset.act === 'del') a.splice(i, 1); else if (b.dataset.act === 'up' && i > 0) [a[i - 1], a[i]] = [a[i], a[i - 1]]; else if (b.dataset.act === 'down' && i < a.length - 1) [a[i + 1], a[i]] = [a[i], a[i + 1]];
    paintEntries(); schedule();
  });
  $('#cv-add-exp').onclick = () => { sync(); data.exp.push({}); paintEntries(); schedule(); };
  $('#cv-add-edu').onclick = () => { sync(); data.edu.push({}); paintEntries(); schedule(); };
  $('#cv-photo').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; try { photo = (await K.fileImage(f)).img; $('#cv-photo-name').textContent = f.name; render(); } catch (x) { K.toast('Could not read that image.', 'err'); } });
  $('#cv-photo-clear').onclick = () => { photo = null; $('#cv-photo-name').textContent = 'No photo'; render(); };
  $('#cv-sample').onclick = () => { data = JSON.parse(JSON.stringify(SAMPLE)); FLD.forEach((f) => ($('#cv-' + f).value = data[f] || '')); paintEntries(); schedule(); };
  $('#cv-reset').onclick = () => { data = { exp: [{}], edu: [{}] }; FLD.forEach((f) => ($('#cv-' + f).value = '')); paintEntries(); schedule(); };

  /* ---- layout engine with automatic pagination ---- */
  const SANS = 'Inter, system-ui, sans-serif', SERIF = '"Cormorant Garamond", Georgia, serif';
  function Doc(style) {
    const pages = []; let cur, x, y;
    const d = { pages, st: style, left: 0, right: W, top: 0, bottom: H };
    d.newPage = () => { const c = K.canvas(W, H); cur = c.getContext('2d'); cur.textBaseline = 'alphabetic'; pages.push(c); style.page(cur, pages.length - 1); y = d.top; d.ctx = cur; return cur; };
    d.y = (v) => (v == null ? y : (y = v)); d.cx = () => cur;
    d.room = (h) => { if (y + h > d.bottom) d.newPage(); };
    d.text = (s, font, color, x0, w, lh, opts) => { opts = opts || {}; if (!s) return; cur.font = font; const words = String(s).split(/\s+/); let line = ''; const out = []; for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (cur.measureText(tt).width > w && line) { out.push(line); line = wd; } else line = tt; } if (line) out.push(line);
      if (opts.keep) d.room(lh * Math.min(out.length, opts.keep)); out.forEach((ln) => { if (y + lh > d.bottom) { d.newPage(); } cur.font = font; cur.fillStyle = color; cur.textAlign = opts.align || 'left'; cur.fillText(ln, opts.align === 'right' ? x0 + w : opts.align === 'center' ? x0 + w / 2 : x0, y + lh * 0.78); y += lh; }); };
    d.gap = (g) => { y += g; };
    return d;
  }
  const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const csv = (s) => String(s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
  const initials = (n) => (n || '').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('');

  function contacts() { return [data.email, data.phone, data.loc, data.link].filter(Boolean); }
  function bulletList(d, pts, x0, w, font, col, lh, bulletCol) { lines(pts).forEach((p) => { d.room(lh); const c = d.cx(), y0 = d.y(); c.fillStyle = bulletCol; c.beginPath(); c.arc(x0 + 6, y0 + lh * 0.52, 4, 0, 7); c.fill(); d.text(p, font, col, x0 + 26, w - 26, lh); }); }

  function modern() {
    const SB = 410, M = 52, d = Doc({ page(c, i) { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.fillStyle = accent; c.fillRect(0, 0, SB, H); } }); d.newPage();
    const c = d.cx(); let sy = 70;
    const ink = K.textOn(accent), soft = ink === '#ffffff' ? 'rgba(255,255,255,.82)' : 'rgba(20,17,13,.78)';
    if (photo) { const r = 130; c.save(); c.beginPath(); c.arc(SB / 2, sy + r, r, 0, 7); c.clip(); K.cover(c, photo, SB / 2 - r, sy, r * 2, r * 2); c.restore(); c.strokeStyle = ink; c.lineWidth = 5; c.beginPath(); c.arc(SB / 2, sy + r, r, 0, 7); c.stroke(); sy += r * 2 + 50; }
    else { c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.arc(SB / 2, sy + 90, 90, 0, 7); c.fill(); c.fillStyle = ink; c.font = `700 74px ${SERIF}`; c.textAlign = 'center'; c.fillText(initials(data.name), SB / 2, sy + 116); c.textAlign = 'left'; sy += 230; }
    const side = (h, items, mode) => { if (!items.length) return; c.fillStyle = ink; c.font = `800 22px ${SANS}`; if ('letterSpacing' in c) c.letterSpacing = '4px'; c.textAlign = 'left'; c.fillText(h.toUpperCase(), M, sy); if ('letterSpacing' in c) c.letterSpacing = '0px'; c.fillStyle = soft; c.fillRect(M, sy + 14, 50, 3); sy += 56;
      items.forEach((it) => { c.font = `500 25px ${SANS}`; c.fillStyle = soft; const ws = String(it).split(/\s+/); let ln = ''; const out = []; ws.forEach((w) => { const tt = ln ? ln + ' ' + w : w; if (c.measureText(tt).width > SB - 2 * M && ln) { out.push(ln); ln = w; } else ln = tt; }); if (ln) out.push(ln); out.forEach((l) => { c.fillText(l, M, sy); sy += 36; }); sy += 8; }); sy += 28; };
    side('Contact', contacts()); side('Skills', csv(data.skills)); side('Extra', lines(data.extra));
    d.left = SB + 64; d.right = W - 64; d.top = 78; d.bottom = H - 70; const cw = d.right - d.left; d.y(d.top);
    d.text(data.name || 'Your Name', `800 70px ${SANS}`, '#14110d', d.left, cw, 78); if (data.title) d.text(data.title, `600 32px ${SANS}`, accent, d.left, cw, 44); d.gap(26);
    const head = (s) => { d.room(120); d.text(s.toUpperCase(), `800 24px ${SANS}`, accent, d.left, cw, 30); const c2 = d.cx(); c2.fillStyle = accent; c2.fillRect(d.left, d.y() + 2, cw, 2); d.gap(22); };
    if (data.summary) { head('Profile'); d.text(data.summary, `500 27px ${SANS}`, '#3b362d', d.left, cw, 40); d.gap(30); }
    const items = (list, label) => { const L = list.filter((e) => e.role || e.org); if (!L.length) return; head(label); L.forEach((e) => { d.room(130); d.text(e.role, `700 30px ${SANS}`, '#14110d', d.left, cw - 220, 40, { keep: 1 }); const yb = d.y(); const c3 = d.cx(); if (e.dates) { c3.font = `600 24px ${SANS}`; c3.fillStyle = '#6c665a'; c3.textAlign = 'right'; c3.fillText(e.dates, d.right, yb - 12); c3.textAlign = 'left'; } d.text(e.org, `600 26px ${SANS}`, accent, d.left, cw, 36); d.gap(6); bulletList(d, e.pts, d.left, cw, `500 26px ${SANS}`, '#3b362d', 38, accent); d.gap(22); }); };
    items(data.exp, 'Experience'); items(data.edu, 'Education'); return d.pages;
  }
  function classic() {
    const M = 96, d = Doc({ page(c) { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); } }); d.newPage(); d.left = M; d.right = W - M; d.top = 90; d.bottom = H - 90; const cw = d.right - d.left; d.y(d.top);
    const c = d.cx(); const nm = (data.name || 'Your Name'); c.textAlign = 'center'; c.font = `700 84px ${SERIF}`; c.fillStyle = '#14110d'; c.fillText(nm, W / 2, d.y() + 68); d.y(d.y() + 100);
    if (data.title) { c.font = `600 30px ${SANS}`; c.fillStyle = accent; if ('letterSpacing' in c) c.letterSpacing = '5px'; c.fillText(data.title.toUpperCase(), W / 2, d.y() + 24); if ('letterSpacing' in c) c.letterSpacing = '0px'; d.y(d.y() + 54); }
    c.font = `500 24px ${SANS}`; c.fillStyle = '#4a443a'; d.text(contacts().join('   |   '), `500 24px ${SANS}`, '#4a443a', d.left, cw, 34, { align: 'center' }); d.gap(10); c.fillStyle = accent; c.fillRect(d.left, d.y(), cw, 3); d.gap(34);
    if (photo) { /* classic keeps a clean, photo-free layout */ }
    const head = (s) => { d.room(100); d.text(s, `700 40px ${SERIF}`, accent, d.left, cw, 46); const c2 = d.cx(); c2.fillStyle = '#d9d3c5'; c2.fillRect(d.left, d.y(), cw, 2); d.gap(18); };
    if (data.summary) { head('Profile'); d.text(data.summary, `500 27px ${SANS}`, '#3b362d', d.left, cw, 40); d.gap(26); }
    const items = (list, label) => { const L = list.filter((e) => e.role || e.org); if (!L.length) return; head(label); L.forEach((e) => { d.room(120); const yb = d.y(); d.text(e.role, `700 30px ${SANS}`, '#14110d', d.left, cw - 240, 40, { keep: 1 }); const c3 = d.cx(); if (e.dates) { c3.font = `600 24px ${SANS}`; c3.fillStyle = '#6c665a'; c3.textAlign = 'right'; c3.fillText(e.dates, d.right, yb + 30); c3.textAlign = 'left'; } d.text(e.org, `italic 600 26px ${SANS}`, '#6c665a', d.left, cw, 36); d.gap(6); bulletList(d, e.pts, d.left, cw, `500 26px ${SANS}`, '#3b362d', 38, accent); d.gap(20); }); };
    items(data.exp, 'Experience'); items(data.edu, 'Education');
    if (csv(data.skills).length) { head('Skills'); d.text(csv(data.skills).join('  •  '), `500 26px ${SANS}`, '#3b362d', d.left, cw, 40); d.gap(24); }
    if (lines(data.extra).length) { head('Additional'); lines(data.extra).forEach((l) => d.text(l, `500 26px ${SANS}`, '#3b362d', d.left, cw, 38)); } return d.pages;
  }
  function compact() {
    const M = 80, d = Doc({ page(c, i) { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); if (i === 0) { c.fillStyle = accent; c.fillRect(0, 0, W, 210); } } }); d.newPage(); const c = d.cx(); const ink = K.textOn(accent);
    let tx = M; if (photo) { c.save(); c.beginPath(); c.arc(M + 70, 105, 70, 0, 7); c.clip(); K.cover(c, photo, M, 35, 140, 140); c.restore(); tx = M + 180; }
    c.fillStyle = ink; c.textAlign = 'left'; c.font = `800 64px ${SANS}`; c.fillText(data.name || 'Your Name', tx, 98); c.font = `600 30px ${SANS}`; c.globalAlpha = 0.9; c.fillText(data.title || '', tx, 146); c.globalAlpha = 1; c.font = `500 22px ${SANS}`; c.fillText(contacts().join('   •   '), tx, 184);
    d.left = M; d.right = W - M; d.top = 262; d.bottom = H - 80; d.y(d.top); const cw = d.right - d.left; const colL = 330;
    const head = (s) => { d.room(90); d.text(s.toUpperCase(), `800 23px ${SANS}`, accent, d.left, cw, 30); d.gap(6); };
    if (data.summary) { head('Profile'); d.text(data.summary, `500 26px ${SANS}`, '#3b362d', d.left, cw, 38); d.gap(24); }
    const items = (list, label) => { const L = list.filter((e) => e.role || e.org); if (!L.length) return; head(label); L.forEach((e) => { d.room(110); const y0 = d.y(), c3 = d.cx(); c3.font = `700 24px ${SANS}`; c3.fillStyle = '#6c665a'; c3.textAlign = 'left'; c3.fillText(e.dates || '', d.left, y0 + 30); d.left += colL; d.text(e.role, `700 29px ${SANS}`, '#14110d', d.left, cw - colL, 38, { keep: 1 }); d.text(e.org, `600 25px ${SANS}`, accent, d.left, cw - colL, 34); bulletList(d, e.pts, d.left, cw - colL, `500 25px ${SANS}`, '#3b362d', 36, accent); d.left -= colL; d.gap(18); }); };
    items(data.exp, 'Experience'); items(data.edu, 'Education');
    if (csv(data.skills).length) { head('Skills'); const c4 = d.cx(); let x0 = d.left, y0 = d.y(); c4.font = `600 24px ${SANS}`; csv(data.skills).forEach((s) => { const w = c4.measureText(s).width + 36; if (x0 + w > d.right) { x0 = d.left; y0 += 56; } if (y0 + 56 > d.bottom) { return; } c4.fillStyle = K.mix(accent, '#ffffff', 0.86); K.rr(c4, x0, y0, w, 44, 22); c4.fill(); c4.fillStyle = '#14110d'; c4.fillText(s, x0 + 18, y0 + 30); x0 += w + 12; }); d.y(y0 + 70); }
    if (lines(data.extra).length) { head('Additional'); lines(data.extra).forEach((l) => d.text(l, `500 25px ${SANS}`, '#3b362d', d.left, cw, 36)); } return d.pages;
  }
  const BUILD = { modern, classic, compact };
  let pagesNow = [];
  function render() {
    sync(); pagesNow = BUILD[tpl](); const box = $('#cv-pages'); box.innerHTML = '';
    pagesNow.forEach((c, i) => { const w = K.el('div', 'cv-sheet'); const cc = K.canvas(c.width, c.height); cc.getContext('2d').drawImage(c, 0, 0); cc.setAttribute('role', 'img'); cc.setAttribute('aria-label', 'CV page ' + (i + 1)); w.appendChild(cc); box.appendChild(w); });
    $('#cv-count').textContent = pagesNow.length + (pagesNow.length === 1 ? ' page' : ' pages'); $('#cv-warn').textContent = pagesNow.length > 2 ? 'Tip: most employers prefer a CV of one or two pages.' : '';
  }
  const base = () => 'CV-' + K.slug(data.name || 'my-cv');
  const ready = () => K.fonts([['Inter', '500;600;700;800'], ['Cormorant Garamond', '600;700']]);
  $('#cv-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await ready(); render(); K.download(await K.pdfPages(pagesNow.map((c) => ({ canvas: c, w: 595.28, h: 841.89 })), { quality: 0.93, title: (data.name || 'CV') + ' CV' }), base() + '.pdf'); K.toast('CV downloaded'); });
  $('#cv-png').onclick = (e) => K.busy(e.currentTarget, async () => { await ready(); render(); for (let i = 0; i < pagesNow.length; i++) K.download(await K.canvasBlob(pagesNow[i], 'image/png'), base() + '-p' + (i + 1) + '.png'); });
  paintEntries(); render(); ready().then(render);

  /* ---- Optional AI help (needs the Cloudflare Worker) ---- */
  K.whenAI(() => {
    const mk = (label, fn) => { const b = K.el('button', 'tb tb--sm cv-ai', ''); b.type = 'button'; b.innerHTML = K.AI_ICON + ' ' + label; b.addEventListener('click', () => K.busy(b, fn)); return b; };
    const put = (ta, v) => { ta.value = v; ta.dispatchEvent(new Event('input', { bubbles: true })); };
    const sum = $('#cv-summary'); const row = K.el('div', 'cv-airow');
    row.append(mk('Improve profile', async () => { sync(); if (sum.value.trim().length < 15) return K.toast('Write a line or two first.', 'err'); const r = await K.rewrite('summary', sum.value, { context: data.title }); r ? put(sum, r[0].slice(0, 500)) : K.toast('AI did not answer. Try again.', 'err'); }));
    const sel = K.el('select', 'cv-ailang'); sel.setAttribute('aria-label', 'Translate profile to'); sel.innerHTML = '<option value="">Translate profile\u2026</option>' + ['French', 'Spanish', 'Portuguese', 'Arabic', 'German'].map((l) => `<option>${l}</option>`).join('');
    sel.addEventListener('change', () => { const l = sel.value; sel.value = ''; if (!l || !sum.value.trim()) return; K.toast('Translating\u2026'); K.rewrite('translate', sum.value, { lang: l }).then((r) => (r ? put(sum, r[0].slice(0, 500)) : K.toast('AI did not answer. Try again.', 'err'))); });
    row.append(sel); sum.closest('label').after(row);
    // one button per job: turn rough notes into strong bullets
    const addBtns = () => K.$$('#cv-exp .cv-entry').forEach((fs) => { if (fs.querySelector('.cv-ai')) return; const ta = fs.querySelector('[data-k="pts"]'); const b = mk('Improve bullets', async () => { sync(); if (ta.value.trim().length < 8) return K.toast('Add a few notes first.', 'err'); const r = await K.rewrite('bullets', ta.value, { context: (fs.querySelector('[data-k="role"]') || {}).value }); r ? put(ta, r.join('\n')) : K.toast('AI did not answer. Try again.', 'err'); }); ta.closest('label').after(b); });
    addBtns(); new MutationObserver(addBtns).observe($('#cv-exp'), { childList: true });
  });
})();
