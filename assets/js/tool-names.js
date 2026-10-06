/* Name Generator: blends your keywords with evocative word banks, prefixes and invented syllables. */
(function () {
  const K = window.VRKit, E = window.VRBrand, $ = K.$;
  const form = $('#ng-form'); if (!form) return;
  const BANK = {
    'Food & restaurant': ['spice', 'harvest', 'ember', 'savor', 'table', 'basil', 'pepper', 'honey', 'smoke', 'golden', 'plate', 'feast', 'bake', 'hearth', 'zest', 'palm', 'grain'],
    'Fashion & beauty': ['velvet', 'muse', 'thread', 'silk', 'bloom', 'glow', 'aura', 'tailor', 'noir', 'pearl', 'drape', 'luxe', 'atelier', 'dazzle', 'ivory', 'rose'],
    'Tech & software': ['pixel', 'stack', 'node', 'cloud', 'logic', 'byte', 'signal', 'orbit', 'vector', 'spark', 'flow', 'forge', 'grid', 'pulse', 'loop', 'quantum'],
    'Education & training': ['scholar', 'bright', 'path', 'lantern', 'mentor', 'sage', 'ascend', 'compass', 'bridge', 'insight', 'learn', 'rise', 'campus', 'tutor', 'spark', 'summit'],
    'Real estate': ['haven', 'hearth', 'landmark', 'keystone', 'oak', 'estate', 'abode', 'horizon', 'cornerstone', 'nest', 'terrace', 'plot', 'crest', 'meridian', 'residence'],
    'Health & wellness': ['vital', 'serene', 'balance', 'thrive', 'bloom', 'pure', 'calm', 'renew', 'root', 'glow', 'harmony', 'revive', 'spring', 'breathe', 'aloe'],
    'Retail & e-commerce': ['market', 'cart', 'basket', 'bazaar', 'parcel', 'trade', 'corner', 'goods', 'haul', 'stock', 'shelf', 'supply', 'pick', 'bundle', 'depot'],
    'Consulting & finance': ['ledger', 'anchor', 'summit', 'clarity', 'capital', 'prudent', 'meridian', 'compass', 'steward', 'sterling', 'north', 'vantage', 'equity', 'axis', 'trust'],
    'Creative & media': ['canvas', 'echo', 'frame', 'muse', 'ink', 'studio', 'reel', 'palette', 'story', 'lumen', 'sketch', 'chroma', 'motion', 'verse', 'atlas'],
    'Something else': ['north', 'bright', 'summit', 'anchor', 'spark', 'bloom', 'atlas', 'pioneer', 'ember', 'harbor', 'vertex', 'nova', 'crest', 'beacon', 'stride']
  };
  const STYLE = {
    Modern: { suf: ['ly', 'ify', 'io', 'ora', 'ix', 'va', 'hub', 'lab', 'works', 'base', 'wise', 'ful'], pre: ['neo', 'nu', 'uni', 'zen', 'omni', 'vivo'], mid: ['', ' Labs', ' Studio', ' Digital'] },
    Classic: { suf: ['house', 'field', 'wood', 'stone', 'gate', 'well', 'ton'], pre: ['grand', 'royal', 'old', 'true', 'first'], mid: [' & Co.', ' & Sons', ' Collective', ' Partners', ' Group', ' Atelier'] },
    Playful: { suf: ['pop', 'doodle', 'buzz', 'zest', 'joy', 'nest', 'ville', 'bean', 'bee'], pre: ['happy', 'little', 'wild', 'zippy', 'snappy', 'sunny'], mid: [' Fun', ' Club', ' Corner', ' Co.'] },
    Premium: { suf: ['ora', 'ique', 'elle', 'ium', 'ara', 'on'], pre: ['maison', 'aurum', 'royale', 'noble', 'prime', 'elite', 'lux'], mid: [' Maison', ' Atelier', ' House', ' Signature', ' Collection'] },
    'Short & punchy': { suf: ['o', 'a', 'ix', 'ex', 'ly'], pre: ['go', 'be', 'up', 'on'], mid: [''] }
  };
  const C = 'bcdfghjklmnprstvz', V = 'aeiou', END = ['a', 'o', 'ia', 'io', 'ly', 'ix', 'ora', 'ova', 'eo', 'is', 'um'];
  const invent = (r, n) => { let s = ''; for (let i = 0; i < n; i++) s += C[Math.floor(r() * C.length)] + V[Math.floor(r() * V.length)]; return s + K.pick(r, END); };
  const cap = (s) => s.replace(/(^|[\s&-])([a-z])/g, (m, a, b) => a + b.toUpperCase());

  $('#ng-industry').innerHTML = Object.keys(BANK).map((k) => `<option>${k}</option>`).join('');
  $('#ng-style').innerHTML = Object.keys(STYLE).map((s, i) => `<label class="chip"><input type="radio" name="ng-style" value="${s}" ${i === 0 ? 'checked' : ''}><span>${s}</span></label>`).join('');

  let shuffle = 0, names = [], fav = K.store.get('ng_fav', []);
  const style = () => (form.querySelector('input[name="ng-style"]:checked') || {}).value;

  function generate(aiList) {
    const kw = $('#ng-kw').value.split(/[,\n]/).map((s) => s.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '')).filter(Boolean).slice(0, 4);
    const ind = $('#ng-industry').value, st = style(), S = STYLE[st], starts = $('#ng-start').value.trim().toLowerCase().slice(0, 1);
    const r = K.rng(K.hash([kw.join(','), ind, st, starts, shuffle].join('|')));
    const bank = BANK[ind], words = kw.length ? kw : [], pool = [], out = new Map();
    const add = (n, why) => { n = n.replace(/\s+/g, ' ').trim(); if (n.length < 3 || n.length > 22) return; const k = n.toLowerCase(); if (!out.has(k)) pool.push(out.set(k, { name: n, why }) && { name: n, why }); };
    for (let i = 0; i < 160; i++) {
      const w = words.length ? K.pick(r, words) : K.pick(r, bank), b = K.pick(r, bank), t = r();
      if (t < 0.18) add(cap(w + K.pick(r, S.suf)), 'Keyword + suffix');
      else if (t < 0.34) add(cap(K.pick(r, S.pre) + w), 'Prefix + keyword');
      else if (t < 0.5) add(cap(w.slice(0, Math.max(2, Math.ceil(w.length / 2))) + b.slice(Math.floor(b.length / 2))), 'Blended words');
      else if (t < 0.64) add(cap(w) + K.pick(r, S.mid), 'Keyword + descriptor');
      else if (t < 0.76) add(cap(b + w), 'Compound');
      else if (t < 0.88) add(cap(invent(r, 2 + Math.floor(r() * 1.4))), 'Invented, brandable');
      else add(cap(w.slice(0, Math.max(3, w.length - 1)) + K.pick(r, END)), 'Soft ending');
    }
    let list = pool.slice(); if (starts) { const m = list.filter((n) => n.name[0].toLowerCase() === starts); list = m.length >= 8 ? m : m.concat(list.filter((n) => n.name[0].toLowerCase() !== starts)); }
    if (st === 'Short & punchy') list.sort((a, b) => a.name.length - b.name.length);
    names = K.shuffled(r, list.slice(0, 60)).slice(0, 24); if (st === 'Short & punchy') names.sort((a, b) => a.name.length - b.name.length);
    if (aiList && aiList.length) { const seen = new Set(aiList.map((x) => x.name.toLowerCase())); names = aiList.map((x) => ({ name: x.name, why: x.why ? 'AI: ' + x.why : 'AI idea' })).concat(names.filter((x) => !seen.has(x.name.toLowerCase())).slice(0, 8)); }
    paint();
  }
  const handle = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isFav = (n) => fav.indexOf(n) > -1;
  const IC = { star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z"/></svg>', copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>', at: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>' };

  function paint() {
    const box = $('#ng-res'); box.innerHTML = '';
    names.forEach((n) => {
      const h = handle(n.name), c = K.el('article', 'res');
      c.innerHTML = `<h3>${K.esc(n.name)}</h3><small>${K.esc(n.why)} · @${h} · ${h}.com</small>`;
      const fv = K.elh('button', 'ib fav' + (isFav(n.name) ? ' is-on' : ''), IC.star); fv.type = 'button'; fv.setAttribute('aria-label', 'Shortlist ' + n.name); fv.setAttribute('aria-pressed', String(isFav(n.name)));
      fv.onclick = () => { const i = fav.indexOf(n.name); if (i > -1) fav.splice(i, 1); else fav.push(n.name); K.store.set('ng_fav', fav); fv.classList.toggle('is-on', isFav(n.name)); fv.setAttribute('aria-pressed', String(isFav(n.name))); paintFav(); };
      const row = K.el('div', 'res-row');
      const cp = K.elh('button', 'ib', IC.copy); cp.type = 'button'; cp.title = 'Copy name'; cp.setAttribute('aria-label', 'Copy ' + n.name); cp.onclick = () => K.copy(n.name, cp, n.name + ' copied');
      const dm = K.elh('a', 'ib', IC.globe); dm.href = 'https://www.namecheap.com/domains/registration/results/?domain=' + h; dm.target = '_blank'; dm.rel = 'noopener'; dm.title = 'Check the domain'; dm.setAttribute('aria-label', 'Check domain for ' + n.name);
      const ig = K.elh('a', 'ib', IC.at); ig.href = 'https://www.instagram.com/' + h + '/'; ig.target = '_blank'; ig.rel = 'noopener'; ig.title = 'Check the Instagram handle'; ig.setAttribute('aria-label', 'Check Instagram handle for ' + n.name);
      row.append(cp, dm, ig); c.append(fv, row); box.appendChild(c);
    });
    $('#ng-empty').hidden = true; $('#ng-res').hidden = false; paintFav();
  }
  function paintFav() {
    const box = $('#ng-fav'); box.innerHTML = fav.length ? '' : '<p class="tp-note" style="margin:0">Star the names you like. Your shortlist is kept on this device only.</p>';
    fav.forEach((n) => { const s = K.el('span', 'badge mid', n); s.style.fontSize = '.82rem'; s.style.padding = '.35rem .7rem'; box.appendChild(s); });
    $('#ng-fav-actions').hidden = !fav.length;
  }
  async function pdf() {
    await K.fonts([['Inter', '400;600;700'], ['Cormorant Garamond', '600;700']]);
    const { c, x } = K.page('#ffffff'), W = c.width, M = 90; x.fillStyle = '#14110d'; x.fillRect(0, 0, W, 200); x.fillStyle = '#c9a227'; x.fillRect(0, 196, W, 8);
    x.fillStyle = '#e8cd7a'; x.font = '700 20px Inter'; if ('letterSpacing' in x) x.letterSpacing = '5px'; x.fillText('NAME SHORTLIST', M, 90); if ('letterSpacing' in x) x.letterSpacing = '0px';
    x.fillStyle = '#fff'; x.font = '700 56px "Cormorant Garamond", Georgia, serif'; x.fillText('Business name ideas', M, 156); x.textAlign = 'right'; x.fillStyle = '#b3ab99'; x.font = '500 19px Inter'; x.fillText(K.today(), W - M, 156); x.textAlign = 'left';
    let y = 290; fav.slice(0, 12).forEach((n, i) => { x.fillStyle = i % 2 ? '#fbf8f0' : '#ffffff'; x.fillRect(M - 20, y - 56, W - M * 2 + 40, 112); x.fillStyle = '#14110d'; x.font = '700 50px "Cormorant Garamond", Georgia, serif'; x.fillText(n, M, y + 8); x.fillStyle = '#6c665a'; x.font = '500 21px Inter'; x.fillText(`@${handle(n)}   ·   ${handle(n)}.com`, M, y + 44); y += 124; });
    x.fillStyle = '#9a9384'; x.font = '500 16px Inter'; x.fillText('Check domain and handle availability before you commit. vibrantrevolve.com/tools/name-generator', M, c.height - 40);
    return c;
  }
  $('#ng-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { K.download(K.pdfFromCanvases([await pdf()], { title: 'Name shortlist' }), 'business-name-shortlist.pdf'); K.toast('Shortlist downloaded'); });
  $('#ng-copyall').onclick = () => K.copy(fav.join('\n'), null, 'Shortlist copied');
  $('#ng-clear').onclick = () => { fav = []; K.store.set('ng_fav', fav); paint(); };
  $('#ng-ask').onclick = () => window.open(K.waLink('Hi VibrantRevolve, I shortlisted these business names: ' + fav.join(', ') + '. Can you help me pick one and build the brand?'), '_blank', 'noopener');
  form.addEventListener('submit', (e) => { e.preventDefault(); shuffle = 0; generate(); });

  K.whenAI(() => {
    const bar = form.querySelector('.tp-actions'); if (!bar) return;
    const b = K.elh('button', 'tb tb--ai', K.AI_ICON + ' Ideas from AI'); b.type = 'button';
    b.onclick = () => K.busy(b, async () => {
      const res = await K.ai('names', { industry: $('#ng-industry').value, keywords: $('#ng-kw').value, style: style(), start: $('#ng-start').value.trim().slice(0, 1) });
      shuffle++; generate(res && res.names);
      if (!res) K.toast('AI is busy right now. Showing standard ideas instead.', 'err');
    });
    bar.insertBefore(b, bar.children[1] || null);
  });
  $('#ng-more').onclick = () => { shuffle++; generate(); };
  K.$$('#ng-style input, #ng-industry').forEach((i) => i.addEventListener('change', () => { if (names.length) { shuffle = 0; generate(); } }));
  paintFav(); generate();
})();
