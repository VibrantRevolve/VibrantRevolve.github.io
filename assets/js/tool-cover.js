/* Cover Letter Writer: AI draft (when the Worker is on) or a clean template, then edit and export. */
(function () {
  const K = window.VRKit, $ = K.$; const form = $('#cl-form'); if (!form) return;
  const F = { name: '#cl-name', contact: '#cl-contact', addr: '#cl-addr', job: '#cl-job', co: '#cl-co', mgr: '#cl-mgr', bg: '#cl-bg', why: '#cl-why', color: '#cl-color', text: '#cl-text' };
  const KEEP = ['name', 'contact', 'addr', 'color']; const saved = K.store.get('cl', {}); KEEP.forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  let pages = [], page = 0, token = 0; const v = (k) => $(F[k]).value.trim();
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const salute = () => 'Dear ' + (v('mgr') || 'Hiring Manager') + ',';
  function template() {
    const job = v('job') || 'the open position', co = v('co') || 'your company', bg = v('bg'), why = v('why'), name = v('name') || 'Your Name';
    const strengths = bg ? bg.split(/\n|\. /).map((s) => s.trim().replace(/\.$/, '')).filter(Boolean).slice(0, 3) : [];
    const p1 = `I am writing to apply for the ${job} role at ${co}. I would welcome the chance to bring my skills and commitment to your team.`;
    const p2 = strengths.length ? `Here is what I can offer: ${strengths.map((s) => s.charAt(0).toLowerCase() + s.slice(1)).join('; ')}. I take pride in doing careful, reliable work and learning quickly.` : 'I take pride in doing careful, reliable work, communicating clearly and learning quickly.';
    const p3 = why ? `${why.replace(/\.$/, '')}. That is why ${co} stands out to me.` : `${co} stands out to me, and I would be glad to contribute to its work.`;
    return [salute(), '', p1, '', p2, '', p3, '', 'Thank you for your time. I would be glad to discuss how I can help, and I am available for an interview at your convenience.', '', 'Yours sincerely,', name].join('\n');
  }
  const fill = (txt) => { $(F.text).value = txt; draw(); };
  async function render() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const W = 1240, H = 1754, M = 120, col = $(F.color).value || '#1f3a5f', ink = '#1b1813', mute = '#6c665a', out = [];
    const mk = () => { const p = K.page('#fff'); out.push(p.c); p.x.fillStyle = col; p.x.fillRect(0, 0, W, 14); return p.x; };
    let x = mk(), y = 150; x.fillStyle = ink; x.font = '700 54px "Cormorant Garamond", Georgia, serif'; x.fillText(v('name') || 'Your Name', M, y);
    x.fillStyle = mute; x.font = '500 22px Inter'; [v('contact'), ...$(F.addr).value.split('\n')].map((s) => s.trim()).filter(Boolean).slice(0, 4).forEach((l) => { y += 34; x.fillText(l, M, y); });
    y += 28; x.fillStyle = col; x.fillRect(M, y, W - M * 2, 3); y += 70;
    x.fillStyle = mute; x.font = '500 22px Inter'; x.fillText(today(), M, y); y += 44;
    const rec = [v('mgr'), v('co')].filter(Boolean); if (rec.length) { x.fillStyle = ink; x.font = '600 22px Inter'; rec.forEach((l) => { x.fillText(l, M, y); y += 32; }); } y += 24;
    if (v('job')) { x.fillStyle = ink; x.font = '700 23px Inter'; x.fillText('Application for ' + v('job'), M, y); y += 50; }
    x.fillStyle = ink; x.font = '500 25px Inter'; const LH = 40, MAXW = W - M * 2, BOTTOM = H - 140;
    const paras = $(F.text).value.replace(/\r/g, '').split('\n');
    for (const p of paras) {
      if (!p.trim()) { y += 22; continue; }
      const lines = []; let cur = ''; for (const w of p.split(/\s+/)) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > MAXW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur);
      for (const l of lines) { if (y > BOTTOM) { x = mk(); y = 130; x.fillStyle = ink; x.font = '500 25px Inter'; } x.fillText(l, M, y); y += LH; }
    }
    out.forEach((c, i) => { if (out.length > 1) { const g = c.getContext('2d'); g.fillStyle = '#b5ae9d'; g.font = '500 15px Inter'; g.textAlign = 'right'; g.fillText(`${v('name') || 'Cover letter'}  ·  Page ${i + 1} of ${out.length}`, W - M, H - 50); g.textAlign = 'left'; } });
    return out;
  }
  async function draw() { const my = ++token, p = await render(); if (my !== token) return; pages = p; page = Math.min(page, p.length - 1); show(); const tabs = $('#cl-tabs'); tabs.innerHTML = ''; tabs.hidden = p.length < 2; p.forEach((_, i) => { const b = K.el('button', '', 'Page ' + (i + 1)); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === page)); b.onclick = () => { page = i; show(); K.$$('#cl-tabs button').forEach((x, j) => x.setAttribute('aria-selected', String(j === i))); }; tabs.appendChild(b); }); }
  function show() { const d = $('#cl-doc'); d.innerHTML = ''; pages[page].setAttribute('role', 'img'); pages[page].setAttribute('aria-label', 'Cover letter page ' + (page + 1)); d.appendChild(pages[page]); }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 220); }; const persist = () => { const o = {}; KEEP.forEach((k) => (o[k] = $(F[k]).value)); K.store.set('cl', o); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { if (KEEP.includes(k)) persist(); soft(); }));
  $('#cl-tpl').onclick = () => { if (v('text') && !confirm('Replace the letter below with a fresh template draft?')) return; fill(template()); K.toast('Template draft ready. Edit it freely.'); };
  K.whenAI(() => { const b = K.el('button', 'tb tb--gold tb--sm', ''); b.type = 'button'; b.innerHTML = K.AI_ICON + ' Write with AI'; $('#cl-aislot').appendChild(b); b.onclick = () => K.busy(b, async () => {
    if (!v('job') && !v('bg')) { K.toast('Add the job and a little background first', 'err'); return; }
    const txt = `Applicant: ${v('name') || 'the applicant'}\nRole: ${v('job') || 'not given'}\nCompany: ${v('co') || 'not given'}\nAddressed to: ${v('mgr') || 'Hiring Manager'}\nBackground and strengths: ${v('bg') || 'not given'}\nWhy this company: ${v('why') || 'not given'}`;
    const res = await K.rewrite('cover', txt, { context: v('name') }); if (!res) { K.toast('AI is busy. Used the template instead.', 'err'); fill(template()); return; }
    let body = String(res[0]).trim(); if (!/^dear\b/i.test(body)) body = salute() + '\n\n' + body; if (!/sincerely|regards/i.test(body.slice(-120))) body += '\n\nYours sincerely,\n' + (v('name') || ''); fill(body); K.toast('Draft written. Check every detail is true.'); }); });
  $('#cl-copy').onclick = (e) => K.copy($(F.text).value, e.currentTarget, 'Copied');
  const base = () => K.slug((v('name') || 'cover-letter') + '-cover-letter');
  $('#cl-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(K.pdfFromCanvases(pages, { title: 'Cover letter ' + v('name') }), base() + '.pdf'); K.toast('PDF downloaded'); });
  $('#cl-png').onclick = (e) => K.busy(e.currentTarget, async () => { await draw(); K.download(await K.canvasBlob(pages[page]), base() + '-p' + (page + 1) + '.png'); K.toast('Image downloaded'); });
  fill(template());
})();
