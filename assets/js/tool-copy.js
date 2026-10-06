/* Copy Writer: taglines, bios, pitches and captions in a chosen brand voice. Template-driven, runs in the browser. */
(function () {
  const K = window.VRKit, E = window.VRBrand, $ = K.$;
  const form = $('#cw-form'); if (!form) return;
  const MOODS = Object.keys(E.MOODS);
  $('#cw-industry').innerHTML = Object.keys(E.INDUSTRIES).map((k) => `<option>${k}</option>`).join('');
  $('#cw-mood').innerHTML = MOODS.map((m, i) => `<label class="chip"><input type="radio" name="cw-mood" value="${m}" ${m === 'Friendly' ? 'checked' : ''}><span>${m}</span></label>`).join('');
  const mood = () => (form.querySelector('input[name="cw-mood"]:checked') || {}).value;
  let shuffle = 0, sections = [], lastAI = false, aiNote = false;

  const EMOJI = { Friendly: ['😊', '✨', '💛', '🙌'], Playful: ['🎉', '🚀', '😄', '🌈'], Bold: ['🔥', '💪'], Modern: ['✔️', '→'], Elegant: [''], Earthy: ['🌿', '🤍'] };

  function build() {
    const name = $('#cw-name').value.trim() || 'Your Brand', ind = $('#cw-industry').value, md = mood(), M = E.MOODS[md], I = E.INDUSTRIES[ind];
    const offer = $('#cw-offer').value.trim() || I.noun, aud = $('#cw-aud').value.trim() || 'people like you', city = $('#cw-city').value.trim(), cta = $('#cw-cta').value.trim() || 'Message us today';
    const r = K.rng(K.hash([name, ind, md, offer, aud, city, shuffle].join('|'))), pick = (a) => K.pick(r, a);
    const em = () => { const e = EMOJI[md] || ['']; return pick(e); };
    const place = city ? ` in ${city}` : '', from = city ? ` from ${city}` : '', t = M.traits.map((x) => x.toLowerCase());
    const sp = (s) => s.replace(/\s+([.,!?])/g, '$1').replace(/\s{2,}/g, ' ').trim();
    const many = (arr, n) => K.shuffled(r, arr).slice(0, n).map(sp);

    const taglines = many([
      M.line(I.noun), `${name}: ${offer}, done properly.`, `${K.cap(offer)} for ${aud}.`, `${K.cap(I.ben)}.`, `Where ${offer} meets ${t[0]} service.`,
      `${K.cap(offer)}, made ${t[1] || 'well'}.`, `${name}. ${K.cap(I.ben)}.`, `Better ${offer}, every day.`, `${K.cap(offer)} you can trust${place}.`, `Made for ${aud}.`
    ], 6);

    const bios = many([
      `${K.cap(offer)}${place}. ${K.cap(I.ben)}. ${cta}.`, `${name} | ${offer}${place} ${em()} ${cta}.`, `${K.cap(t[0])}, ${t[1]} and ${t[2]}. ${K.cap(offer)} for ${aud}.`,
      `${K.cap(offer)} for ${aud}. ${cta} 👇`.replace(' 👇', md === 'Elegant' || md === 'Modern' ? '.' : ' 👇'), `Your go-to for ${offer}${place}. DM to order or book.`, `${name}${from}. ${K.cap(I.ben)}.`
    ], 4);
    const wa = many([
      `Welcome to ${name}! We offer ${offer}${place}. ${K.cap(I.ben)}. Send a message to get started. We reply quickly.`,
      `${name}: ${offer}${place}. Chat with us here for prices, orders and bookings. We are ${t[0]}, ${t[1]} and easy to work with.`,
      `${K.cap(offer)} for ${aud}${place}. Tell us what you need and we will send a clear quote.`
    ], 2).map((s) => s.slice(0, 256));
    const pitch = many([
      `We are ${name}${from}. We help ${aud} with ${offer}, so they get ${I.ben}. Our approach is ${t[0]}, ${t[1]} and ${t[2]}. ${cta}.`,
      `${aud.charAt(0).toUpperCase() + aud.slice(1)} come to ${name} for ${offer}. We keep it ${t[0]} and ${t[1]}, and we deliver ${I.ben}. Want to see how it works? ${cta}.`
    ], 2);
    const about = [sp(`${name} started with a simple idea: ${I.ben}. Today we offer ${offer}${place}, and we work closely with ${aud} to get it right. We are ${t[0]}, ${t[1]} and ${t[2]}, and that shows in everything we do. Whether it is your first order or your fiftieth, you will find us easy to talk to and serious about quality. ${cta}.`)];
    const tags = (() => { const base = [name, ind.split(/[ &]+/)[0], city, ...offer.split(/[ ,]+/).slice(0, 2)].filter(Boolean).map((w) => '#' + w.replace(/[^a-z0-9]/gi, '')).filter((w) => w.length > 2); return [...new Set(base)].slice(0, 5).join(' '); })();
    const captions = many([
      `New week, new energy ${em()}\n${K.cap(offer)}${place}: ${I.ben}.\n${cta}.\n${tags}`,
      `Why ${name}? Because ${aud} deserve ${I.ben}.\n${cta}.\n${tags}`,
      `${K.cap(offer)} that feels ${t[0]} and ${t[1]}. ${em()}\nDM us or tap the link in bio.\n${tags}`,
      `Behind the scenes at ${name}: ${t[2]} work, every day.\n${cta}.\n${tags}`
    ], 3);
    const heads = many([
      [`${K.cap(offer)} for ${aud}`, `${name} delivers ${I.ben}. ${cta}.`], [`${K.cap(I.ben)}`, `${K.cap(offer)}${place}, made by a ${t[0]} and ${t[1]} team.`],
      [`${name}: ${offer}, done properly`, `Clear pricing, quick replies and results you can see.`], [`Meet ${name}`, `${K.cap(offer)} for ${aud}${place}. ${cta}.`]
    ].map((x) => x.join('\n')), 3);
    const ctas = [cta, 'Get a quote', 'Book a call', 'See pricing', 'Chat on WhatsApp', 'Start today'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6);

    return [
      { id: 'tag', title: 'Taglines', items: taglines }, { id: 'bio', title: 'Short bios (Instagram, X, LinkedIn)', items: bios }, { id: 'wa', title: 'WhatsApp Business description', items: wa },
      { id: 'pitch', title: '30-second pitch', items: pitch }, { id: 'about', title: 'About us paragraph', items: about }, { id: 'cap', title: 'Social captions', items: captions },
      { id: 'head', title: 'Website headline + subheadline', items: heads }, { id: 'cta', title: 'Button and call-to-action labels', items: ctas }
    ];
  }
  const IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  function paint() {
    const box = $('#cw-out'); box.innerHTML = '';
    sections.forEach((s) => {
      const sec = K.el('div'); sec.append(K.el('h3', '', s.title)); const list = K.el('div', 'copy-list');
      s.items.forEach((t) => { const row = K.el('div', 'copy-item'); row.append(K.el('p', '', t)); const b = K.elh('button', 'ib', IC); b.type = 'button'; b.title = 'Copy'; b.setAttribute('aria-label', 'Copy: ' + t.slice(0, 40)); b.onclick = () => K.copy(t, b, 'Copied'); row.appendChild(b); list.appendChild(row); });
      sec.appendChild(list); box.appendChild(sec);
    });
    if (aiNote) { const n = K.el('p', 'tp-note ai-note', 'Written with AI. Read it through and adjust anything that does not sound like you before you publish.'); box.prepend(n); }
    $('#cw-empty').hidden = true; box.hidden = false; $('#cw-tools').hidden = false;
  }
  const allText = () => sections.map((s) => s.title.toUpperCase() + '\n' + s.items.map((i) => '- ' + i.replace(/\n/g, '\n  ')).join('\n')).join('\n\n');
  async function pdf() {
    await K.fonts([['Inter', '400;500;600;700'], ['Cormorant Garamond', '600;700']]);
    const pages = []; let cur = null, y = 0; const M = 90, W = 1240, H = 1754;
    const newPage = (first) => { const p = K.page('#ffffff'); pages.push(p.c); cur = p.x; y = 120;
      if (first) { cur.fillStyle = '#14110d'; cur.fillRect(0, 0, W, 200); cur.fillStyle = '#c9a227'; cur.fillRect(0, 196, W, 8); cur.fillStyle = '#e8cd7a'; cur.font = '700 20px Inter'; if ('letterSpacing' in cur) cur.letterSpacing = '5px'; cur.fillText('BRAND COPY', M, 90); if ('letterSpacing' in cur) cur.letterSpacing = '0px'; cur.fillStyle = '#fff'; cur.font = '700 56px "Cormorant Garamond", Georgia, serif'; cur.fillText($('#cw-name').value.trim() || 'Your Brand', M, 156); y = 270; } };
    newPage(true);
    for (const s of sections) {
      if (y > H - 300) newPage(false);
      cur.fillStyle = '#8f6f0c'; cur.font = '700 17px Inter'; if ('letterSpacing' in cur) cur.letterSpacing = '3px'; cur.fillText(s.title.toUpperCase(), M, y); if ('letterSpacing' in cur) cur.letterSpacing = '0px'; cur.strokeStyle = '#e5e0d6'; cur.lineWidth = 2; cur.beginPath(); cur.moveTo(M, y + 14); cur.lineTo(W - M, y + 14); cur.stroke(); y += 56;
      for (const it of s.items) {
        cur.font = '400 25px Inter'; const lines = it.split('\n').reduce((n, l) => n + Math.max(1, Math.ceil(cur.measureText(l).width / (W - M * 2 - 30))), 0), h = lines * 36 + 18;
        if (y + h > H - 90) newPage(false);
        cur.fillStyle = '#c9a227'; cur.fillRect(M, y - 22, 4, h - 12); cur.fillStyle = '#1b1813'; cur.font = '400 25px Inter';
        it.split('\n').forEach((l) => { const n = K.wrap(cur, l || ' ', M + 24, y, W - M * 2 - 30, 36); y += Math.max(1, n) * 36; }); y += 20;
      }
      y += 24;
    }
    pages.forEach((c, i) => { const x = c.getContext('2d'); x.fillStyle = '#9a9384'; x.font = '500 15px Inter'; x.fillText(`Made with VibrantRevolve Studio  ·  vibrantrevolve.com/tools/copy-writer   ·   ${i + 1}/${pages.length}`, M, H - 40); });
    return pages;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); if (!$('#cw-name').value.trim()) { $('#cw-name').focus(); return K.toast('Add your business name'); } shuffle = 0; lastAI = false; aiNote = false; sections = build(); paint(); });
  $('#cw-more').onclick = () => { if (!$('#cw-name').value.trim()) { $('#cw-name').focus(); return K.toast('Add your business name first'); } if (lastAI) return runAI(); shuffle++; sections = build(); paint(); };

  // Optional AI mode: replaces each template section with AI copy when the Worker returns it.
  async function runAI() {
    const name = $('#cw-name').value.trim(); if (!name) { $('#cw-name').focus(); return K.toast('Add your business name first'); }
    const res = await K.ai('copy', { name, industry: $('#cw-industry').value, mood: mood(), offer: $('#cw-offer').value.trim() || E.INDUSTRIES[$('#cw-industry').value].noun, audience: $('#cw-aud').value.trim() || 'people like you', city: $('#cw-city').value.trim(), cta: $('#cw-cta').value.trim() || 'Message us today' });
    shuffle++; sections = build(); lastAI = false; aiNote = false;
    if (res) {
      const map = { tag: res.taglines, bio: res.bios, wa: res.whatsapp, pitch: res.pitch, about: res.about, cap: res.captions, head: res.headlines, cta: res.ctas };
      sections.forEach((s) => { const v = map[s.id]; if (v && v.length) s.items = v; });
      lastAI = true; aiNote = true;
    } else K.toast('AI is busy right now. Showing the standard version instead.', 'err');
    paint();
  }
  K.whenAI(() => {
    const bar = form.querySelector('.tp-actions'); if (!bar) return;
    const b = K.elh('button', 'tb tb--ai', K.AI_ICON + ' Write with AI'); b.type = 'button';
    b.onclick = () => K.busy(b, runAI); bar.insertBefore(b, bar.children[1] || null);
  });
  $('#cw-copyall').onclick = () => K.copy(allText(), null, 'All copy copied');
  $('#cw-txt').onclick = () => K.download(new Blob([allText()], { type: 'text/plain;charset=utf-8' }), K.slug($('#cw-name').value) + '-copy.txt');
  $('#cw-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { K.download(K.pdfFromCanvases(await pdf(), { title: 'Brand copy' }), K.slug($('#cw-name').value) + '-brand-copy.pdf'); K.toast('PDF downloaded'); });
})();
