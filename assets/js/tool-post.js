/* Flyer & Social Post Maker: templates drawn on canvas, plus caption and trending-hashtag ideas. Runs in the browser. */
(function () {
  const K = window.VRKit, $ = K.$;
  if (!$('#sp-form')) return;
  const SIZES = { square: ['Instagram square', 1080, 1080], portrait: ['Portrait 4:5', 1080, 1350], story: ['Story / Status', 1080, 1920], flyer: ['A4 flyer', 1240, 1754] };
  const TPL = [['bold', 'Bold block'], ['split', 'Split'], ['spot', 'Spotlight'], ['frame', 'Framed'], ['offer', 'Offer badge'], ['quote', 'Quote']];
  const PACKS = {
    General: ['SmallBusiness', 'SupportLocal', 'NigeriaBusiness', 'MadeInNigeria', 'Entrepreneur', 'LagosBusiness'],
    Food: ['LagosFoodie', 'NigerianFood', 'FoodieNG', 'OrderNow', 'HomeCooked', 'LagosEats'],
    Fashion: ['NaijaFashion', 'AnkaraStyle', 'LagosFashion', 'OOTD', 'StyleNG', 'FashionDesigner'],
    Beauty: ['LagosMakeup', 'BeautyNG', 'SkincareNG', 'HairStylist', 'GlowUp', 'BookNow'],
    Tech: ['TechNG', 'NaijaTech', 'StartupNG', 'BuildInPublic', 'AfricaTech', 'WebDesign'],
    Education: ['StudyNG', 'LearnOnline', 'LagosTutor', 'Scholarship', 'CareerTips', 'Upskill'],
    'Real estate': ['LagosRealEstate', 'PropertyNG', 'HouseForRent', 'LandForSale', 'Lekki', 'NewListing'],
    Events: ['LagosEvents', 'NaijaEvents', 'BookNow', 'PartyPlanner', 'SaveTheDate', 'WeddingNG']
  };
  const HOOKS = ['Quick one for you:', 'Here is something worth knowing:', 'Say this out loud:', 'Save this for later:', 'Do not scroll past this:'];
  $('#sp-sizes').innerHTML = Object.keys(SIZES).map((k) => `<label class="chip"><input type="radio" name="sp-size" value="${k}" ${k === 'square' ? 'checked' : ''}><span>${SIZES[k][0]}</span></label>`).join('');
  $('#sp-tpls').innerHTML = TPL.map((t, i) => `<label class="chip"><input type="radio" name="sp-tpl" value="${t[0]}" ${i === 0 ? 'checked' : ''}><span>${t[1]}</span></label>`).join('');
  $('#sp-cat').innerHTML = Object.keys(PACKS).map((k) => `<option>${k}</option>`).join('');
  const val = (n) => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
  const F = ['kicker', 'head', 'body', 'badge', 'cta', 'biz', 'contact', 'c1', 'c2'];
  const DEF = { kicker: 'New this week', head: 'Fresh ideas, delivered', body: 'Tell people what you offer in one clear sentence.', badge: '20% OFF', cta: 'Order today', biz: '', contact: '', c1: '#14110d', c2: '#c9a227' };
  let saved = {}; try { saved = JSON.parse(localStorage.getItem('vr-sp') || '{}'); } catch (e) {}
  F.forEach((f) => { $('#sp-' + f).value = saved[f] != null ? saved[f] : DEF[f]; });
  let logo = null, photo = null, trendTopics = [], picked = new Set(), tok = 0;
  const cv = $('#sp-canvas');

  function read() { const o = {}; F.forEach((f) => (o[f] = $('#sp-' + f).value.trim())); o.size = val('sp-size'); o.tpl = val('sp-tpl'); return o; }
  const hexOk = (v, d) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
  let BOOST = 1;
  const FONT_H = '800 {px}px Inter, system-ui, sans-serif', SERIF = '700 {px}px "Cormorant Garamond", Georgia, serif';

  function text(x, s, font, color, px, xx, yy, maxW, lh, maxLines, align) {
    x.font = font.replace('{px}', px); x.fillStyle = color; x.textAlign = align || 'left'; x.textBaseline = 'alphabetic';
    return K.wrap(x, s, xx, yy, maxW, lh, maxLines);
  }
  function headBlock(x, s, color, px0, xx, yy, maxW, align, maxLines, serif) {
    const font = serif ? SERIF : FONT_H; let px = px0 * BOOST, lines;
    for (; px > 36; px -= 4) { x.font = font.replace('{px}', px); const words = s.split(/\s+/); let line = '', n = 0; for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { n++; line = w; } else line = t; } if (line) n++; if (n <= (maxLines || 4)) { lines = n; break; } }
    const n = text(x, s, font, color, px, xx, yy, maxW, px * 1.08, maxLines || 4, align); return { px, bottom: yy + (n - 1) * px * 1.08 };
  }
  function pill(x, s, xx, yy, bg, fg, px, align) {
    x.font = `700 ${px}px Inter, system-ui, sans-serif`; const w = x.measureText(s).width + px * 1.8, h = px * 2.1, X = align === 'center' ? xx - w / 2 : align === 'right' ? xx - w : xx;
    x.fillStyle = bg; K.rr(x, X, yy, w, h, h / 2); x.fill(); x.fillStyle = fg; x.textAlign = 'left'; x.fillText(s, X + px * 0.9, yy + h / 2 + px * 0.35); return { w, h, X };
  }
  function logoMark(x, o, xx, yy, h, onDark) {
    if (logo) { const s = h / logo.height, w = logo.width * s; K.contain(x, logo, xx, yy, Math.min(w, h * 3), h); return Math.min(w, h * 3); }
    return 0;
  }
  function footer(x, o, W, H, M, fg, align) {
    const u = W / 1080, parts = [o.biz, o.contact].filter(Boolean); if (!parts.length) return;
    x.fillStyle = fg; x.textBaseline = 'alphabetic';
    if (o.biz) { x.font = `800 ${34 * u}px Inter, system-ui, sans-serif`; x.textAlign = align; x.fillText(o.biz, align === 'center' ? W / 2 : M, H - M - (o.contact ? 46 * u : 0)); }
    if (o.contact) { x.globalAlpha = 0.85; x.font = `600 ${28 * u}px Inter, system-ui, sans-serif`; x.textAlign = align; x.fillText(o.contact, align === 'center' ? W / 2 : M, H - M); x.globalAlpha = 1; }
  }
  function bg(x, o, W, H, base, overlay) {
    x.fillStyle = base; x.fillRect(0, 0, W, H);
    if (photo) { K.cover(x, photo, 0, 0, W, H); if (overlay) { x.fillStyle = overlay; x.fillRect(0, 0, W, H); } }
  }
  function blobs(x, W, H, col) { x.save(); x.globalAlpha = 0.18; x.fillStyle = col; x.beginPath(); x.arc(W * 0.92, H * 0.08, W * 0.32, 0, 7); x.fill(); x.beginPath(); x.arc(W * 0.04, H * 0.96, W * 0.26, 0, 7); x.fill(); x.restore(); }

  const T = {
    bold(x, o, W, H) {
      const u = W / 1080, M = 84 * u, fg = K.textOn(o.c1); bg(x, o, W, H, o.c1, 'rgba(0,0,0,.45)'); if (!photo) blobs(x, W, H, o.c2);
      const fgc = photo ? '#fff' : fg; let y = M + 10 * u; const lw = logoMark(x, o, M, M - 10 * u, 74 * u); if (lw) y = M + 120 * u;
      if (o.kicker) { const p = pill(x, o.kicker.toUpperCase(), M, y + 40 * u, o.c2, K.textOn(o.c2), 26 * u); y += p.h + 70 * u; } else y += 60 * u;
      const hb = headBlock(x, o.head, fgc, 150 * u, M, y + 110 * u, W - 2 * M, 'left', 4);
      let yy = hb.bottom + 80 * u; if (o.body) { const n = text(x, o.body, '500 {px}px Inter, system-ui, sans-serif', fgc, 40 * u, M, yy, W - 2 * M - 80 * u, 58 * u, 4); yy += n * 58 * u + 30 * u; }
      if (o.cta) pill(x, o.cta, M, yy, '#fff', '#14110d', 38 * u);
      footer(x, o, W, H, M, fgc, 'left');
    },
    split(x, o, W, H) {
      const u = W / 1080, M = 76 * u, tall = H > W * 1.15, ph = tall ? H * 0.46 : H * 0.5; x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, W, H);
      if (photo) K.cover(x, photo, 0, 0, W, ph); else { const g = x.createLinearGradient(0, 0, W, ph); g.addColorStop(0, o.c1); g.addColorStop(1, K.mix(o.c1, o.c2, 0.6)); x.fillStyle = g; x.fillRect(0, 0, W, ph); x.save(); x.globalAlpha = 0.2; x.fillStyle = o.c2; x.beginPath(); x.arc(W * 0.8, ph * 0.3, ph * 0.5, 0, 7); x.fill(); x.restore(); }
      logoMark(x, o, M, M - 10 * u, 70 * u);
      x.fillStyle = o.c2; x.fillRect(0, ph, W, 14 * u);
      let y = ph + 110 * u; if (o.kicker) { text(x, o.kicker.toUpperCase(), '800 {px}px Inter, system-ui, sans-serif', o.c2, 26 * u, M, y, W - 2 * M, 30 * u, 1); y += 40 * u; }
      const hb = headBlock(x, o.head, '#14110d', 100 * u, M, y + 60 * u, W - 2 * M, 'left', 3); y = hb.bottom + 56 * u;
      if (o.body) text(x, o.body, '500 {px}px Inter, system-ui, sans-serif', '#4a443a', 34 * u, M, y, W - 2 * M, 48 * u, 3);
      if (o.cta) pill(x, o.cta, W - M, H - M - 70 * u, o.c1, K.textOn(o.c1), 32 * u, 'right');
      footer(x, o, W, H, M, '#14110d', 'left');
    },
    spot(x, o, W, H) {
      const u = W / 1080, M = 84 * u; bg(x, o, W, H, o.c1, 'rgba(0,0,0,.5)');
      if (!photo) { const g = x.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, W * 0.8); g.addColorStop(0, K.mix(o.c1, o.c2, 0.45)); g.addColorStop(1, o.c1); x.fillStyle = g; x.fillRect(0, 0, W, H); }
      const fg = photo ? '#fff' : K.textOn(o.c1); const lw = logoMark(x, o, (W - 200 * u) / 2, M - 10 * u, 74 * u);
      let y = H * (H > W * 1.15 ? 0.3 : 0.2); if (o.kicker) { text(x, o.kicker.toUpperCase(), '800 {px}px Inter, system-ui, sans-serif', o.c2, 28 * u, W / 2, y, W - 2 * M, 30 * u, 1, 'center'); y += 50 * u; }
      const hb = headBlock(x, o.head, fg, 140 * u, W / 2, y + 90 * u, W - 2 * M, 'center', 4, true); y = hb.bottom + 70 * u;
      x.fillStyle = o.c2; x.fillRect(W / 2 - 50 * u, y - 30 * u, 100 * u, 6 * u); y += 50 * u;
      if (o.body) { const n = text(x, o.body, '500 {px}px Inter, system-ui, sans-serif', fg, 38 * u, W / 2, y, W - 2 * M - 60 * u, 56 * u, 4, 'center'); y += n * 56 * u + 20 * u; }
      if (o.cta) pill(x, o.cta, W / 2, y + 20 * u, o.c2, K.textOn(o.c2), 36 * u, 'center');
      footer(x, o, W, H, M, fg, 'center');
    },
    frame(x, o, W, H) {
      const u = W / 1080, M = 84 * u; x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, W, H); if (photo) { x.save(); x.globalAlpha = 0.18; K.cover(x, photo, 0, 0, W, H); x.restore(); }
      x.strokeStyle = o.c1; x.lineWidth = 10 * u; x.strokeRect(40 * u, 40 * u, W - 80 * u, H - 80 * u); x.strokeStyle = o.c2; x.lineWidth = 3 * u; x.strokeRect(60 * u, 60 * u, W - 120 * u, H - 120 * u);
      logoMark(x, o, (W - 180 * u) / 2, 110 * u, 70 * u);
      let y = H * (H > W * 1.15 ? 0.3 : 0.22); if (o.kicker) { text(x, o.kicker.toUpperCase(), '800 {px}px Inter, system-ui, sans-serif', o.c2, 26 * u, W / 2, y, W - 2 * M, 30 * u, 1, 'center'); y += 40 * u; }
      const hb = headBlock(x, o.head, o.c1, 126 * u, W / 2, y + 80 * u, W - 2 * M - 40 * u, 'center', 4, true); y = hb.bottom + 70 * u;
      if (o.body) { const n = text(x, o.body, '500 {px}px Inter, system-ui, sans-serif', '#4a443a', 36 * u, W / 2, y, W - 2 * M - 80 * u, 54 * u, 4, 'center'); y += n * 54 * u + 20 * u; }
      if (o.cta) pill(x, o.cta, W / 2, y + 20 * u, o.c1, K.textOn(o.c1), 34 * u, 'center');
      footer(x, o, W, H, M + 20 * u, o.c1, 'center');
    },
    offer(x, o, W, H) {
      const u = W / 1080, M = 84 * u; bg(x, o, W, H, o.c2, 'rgba(0,0,0,.35)'); const fg = photo ? '#fff' : K.textOn(o.c2);
      if (!photo) blobs(x, W, H, o.c1); logoMark(x, o, M, M - 10 * u, 74 * u);
      const r = Math.min(W * 0.17, 190 * u), cx = W - M - r + 10 * u, cy = M + r + 20 * u; x.fillStyle = o.c1; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 5 * u; x.setLineDash([2, 12 * u]); x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy, r - 14 * u, 0, 7); x.stroke(); x.setLineDash([]);
      headBlock(x, o.badge || 'SALE', K.textOn(o.c1), 76 * u, cx, cy + 14 * u, r * 1.45, 'center', 2);
      let y = H * (H > W * 1.3 ? 0.42 : 0.4); if (o.kicker) { text(x, o.kicker.toUpperCase(), '800 {px}px Inter, system-ui, sans-serif', fg, 28 * u, M, y, W - 2 * M, 30 * u, 1); y += 20 * u; }
      const hb = headBlock(x, o.head, fg, 112 * u, M, y + 90 * u, W - 2 * M, 'left', 3); y = hb.bottom + 70 * u;
      if (o.body) { const n = text(x, o.body, '600 {px}px Inter, system-ui, sans-serif', fg, 38 * u, M, y, W - 2 * M - 100 * u, 54 * u, 3); y += n * 54 * u; }
      if (o.cta) pill(x, o.cta, M, y + 40 * u, '#14110d', '#fff', 36 * u);
      footer(x, o, W, H, M, fg, 'left');
    },
    quote(x, o, W, H) {
      const u = W / 1080, M = 100 * u; bg(x, o, W, H, o.c1, 'rgba(0,0,0,.5)'); const fg = photo ? '#fff' : K.textOn(o.c1); if (!photo) blobs(x, W, H, o.c2);
      x.fillStyle = o.c2; x.font = `700 ${380 * u}px "Cormorant Garamond", Georgia, serif`; x.textAlign = 'left'; x.fillText('“', M - 10 * u, H * 0.3);
      const hb = headBlock(x, o.head, fg, 112 * u, M, H * 0.36, W - 2 * M, 'left', 6, true); let y = hb.bottom + 70 * u;
      x.fillStyle = o.c2; x.fillRect(M, y - 30 * u, 90 * u, 6 * u); y += 40 * u;
      if (o.body) text(x, o.body, '600 {px}px Inter, system-ui, sans-serif', fg, 36 * u, M, y, W - 2 * M, 52 * u, 2);
      if (o.cta) pill(x, o.cta, M, H - M - 190 * u, o.c2, K.textOn(o.c2), 32 * u);
      footer(x, o, W, H, M, fg, 'left');
    }
  };

  async function draw(target, scale) {
    const o = read(); o.c1 = hexOk(o.c1, '#14110d'); o.c2 = hexOk(o.c2, '#c9a227'); const S = SIZES[o.size], W = S[1], H = S[2], c = target || cv; BOOST = H > W * 1.5 ? 1.2 : H > W * 1.3 ? 1.12 : 1;
    c.width = W * (scale || 1); c.height = H * (scale || 1); const x = c.getContext('2d'); x.setTransform(scale || 1, 0, 0, scale || 1, 0, 0); x.imageSmoothingQuality = 'high'; T[o.tpl](x, o, W, H); return { W, H };
  }
  let t = 0; const redraw = () => { clearTimeout(t); t = setTimeout(async () => { await draw(); persist(); }, 120); };
  function persist() { const o = {}; F.forEach((f) => (o[f] = $('#sp-' + f).value)); try { localStorage.setItem('vr-sp', JSON.stringify(o)); } catch (e) {} }
  F.forEach((f) => $('#sp-' + f).addEventListener('input', () => { redraw(); caption(); }));
  K.$$('input[name="sp-size"],input[name="sp-tpl"]').forEach((r) => r.addEventListener('change', redraw));
  async function loadImg(file) { try { return (await K.fileImage(file)).img; } catch (e) { K.toast('Could not read that image.', 'err'); return null; } }
  $('#sp-logo').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; logo = await loadImg(f); $('#sp-logo-name').textContent = logo ? f.name : 'No logo'; redraw(); });
  $('#sp-photo').addEventListener('change', async (e) => { const f = e.target.files[0]; if (!f) return; photo = await loadImg(f); $('#sp-photo-name').textContent = photo ? f.name : 'No photo'; redraw(); });
  $('#sp-logo-clear').onclick = () => { logo = null; $('#sp-logo-name').textContent = 'No logo'; redraw(); };
  $('#sp-photo-clear').onclick = () => { photo = null; $('#sp-photo-name').textContent = 'No photo'; redraw(); };
  const base = () => 'post-' + K.slug($('#sp-head').value || 'design').slice(0, 30);
  $('#sp-png').onclick = (e) => K.busy(e.currentTarget, async () => { await K.fonts([['Inter', '500;600;700;800'], ['Cormorant Garamond', '700']]); const c = K.canvas(10, 10); await draw(c, 1); K.download(await K.canvasBlob(c, 'image/png'), base() + '.png'); K.toast('Image downloaded'); });
  $('#sp-pdf').onclick = (e) => K.busy(e.currentTarget, async () => { await K.fonts([['Inter', '500;600;700;800'], ['Cormorant Garamond', '700']]); const c = K.canvas(10, 10), d = await draw(c, 1); const pw = 595.28, ph = pw * d.H / d.W; K.download(await K.pdfPages([{ canvas: c, w: pw, h: ph }], { quality: 0.92, title: $('#sp-head').value || 'Design' }), base() + '.pdf'); });
  $('#sp-share').onclick = (e) => K.busy(e.currentTarget, async () => { await K.fonts([['Inter', '500;600;700;800'], ['Cormorant Garamond', '700']]); const c = K.canvas(10, 10); await draw(c, 1); const blob = await K.canvasBlob(c, 'image/png'); await K.share([new File([blob], base() + '.png', { type: 'image/png' })], $('#sp-cap').value, $('#sp-head').value); });

  /* ---- caption + hashtags + trends ---- */
  function tagsFor() { const pack = PACKS[$('#sp-cat').value] || PACKS.General; const trend = trendTopics.filter((x) => picked.has(x.topic)).map((x) => x.hashtag.replace('#', '')); const city = ($('#sp-city').value || '').replace(/[^A-Za-z0-9]/g, ''); return [...new Set([...trend, ...(city ? [city] : []), ...pack])].slice(0, 12).map((x) => '#' + x); }
  function caption() {
    const o = read(), r = K.rng(K.hash([o.head, o.body, [...picked].join(), $('#sp-cat').value, bump].join('|')));
    const topic = trendTopics.find((x) => picked.has(x.topic)); const lines = [];
    lines.push(topic ? `${K.pick(r, HOOKS)} everyone is talking about ${topic.topic} right now.` : (o.kicker ? o.kicker + '.' : K.pick(r, HOOKS)));
    lines.push(o.head + (/[.!?]$/.test(o.head) ? '' : '.')); if (o.body) lines.push(o.body);
    if (o.badge && o.tpl === 'offer') lines.push('Offer: ' + o.badge + '.');
    lines.push((o.cta ? o.cta + '. ' : '') + (o.contact ? 'Contact: ' + o.contact : 'Send us a message.'));
    $('#sp-cap').value = lines.join('\n\n') + '\n\n' + tagsFor().join(' ');
  }
  let bump = 0;
  function chips() {
    const box = $('#sp-trends'); box.innerHTML = '';
    if (!trendTopics.length) { box.appendChild(K.el('small', 'sp-muted', 'Trending topics appear here after the next news update.')); return; }
    trendTopics.forEach((tp) => { const b = K.el('button', 'sp-chip' + (picked.has(tp.topic) ? ' is-on' : ''), tp.topic); b.type = 'button'; b.setAttribute('aria-pressed', picked.has(tp.topic)); b.title = tp.headline + ' (' + tp.source + ')'; b.onclick = () => { picked.has(tp.topic) ? picked.delete(tp.topic) : picked.add(tp.topic); chips(); caption(); }; box.appendChild(b); });
  }
  ['sp-cat', 'sp-city'].forEach((id) => $('#' + id).addEventListener('input', caption));
  $('#sp-recap').onclick = () => { bump++; caption(); };
  $('#sp-capcopy').onclick = (e) => K.copy($('#sp-cap').value, e.currentTarget, 'Copied');
  fetch('/assets/data/trends.json').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.topics) { trendTopics = d.topics.slice(0, 10); const u = new Date(d.updated); $('#sp-trend-date').textContent = isNaN(u) ? '' : 'Updated ' + u.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } chips(); caption(); }).catch(() => { chips(); caption(); });
  /* ---- optional AI (needs the Cloudflare Worker) ---- */
  K.whenAI(() => {
    const details = () => [$('#sp-head').value, $('#sp-body').value, $('#sp-cat').value, $('#sp-city').value].filter(Boolean).join('. ');
    const cyc = { cap: [], capI: 0, head: [], headI: 0 };
    const mk = (after, label, fn, id) => { const b = K.el('button', 'tb tb--sm'); b.type = 'button'; b.id = id; b.innerHTML = K.AI_ICON + ' ' + label; b.onclick = () => K.busy(b, fn); after.after(b); return b; };
    mk($('#sp-recap'), 'AI captions', async () => { if (!cyc.cap.length || cyc.stale) { const r = await K.rewrite('caption', details(), { context: [...picked].join(', ') }); if (!r) return K.toast('The AI service did not answer. Try again.', 'err'); cyc.cap = r; cyc.capI = 0; cyc.stale = false; } $('#sp-cap').value = cyc.cap[cyc.capI++ % cyc.cap.length]; K.toast('Caption written. Tap again for another.'); }, 'sp-aicap');
    ['sp-head', 'sp-body', 'sp-cat'].forEach((id) => $('#' + id).addEventListener('input', () => (cyc.stale = true)));
    const hl = K.el('button', 'tb tb--sm'); hl.type = 'button'; hl.innerHTML = K.AI_ICON + ' AI headline'; hl.style.marginTop = '.4rem';
    hl.onclick = () => K.busy(hl, async () => { if (!cyc.head.length || cyc.hstale) { const r = await K.rewrite('headline', details() || 'a business flyer'); if (!r) return K.toast('The AI service did not answer. Try again.', 'err'); cyc.head = r; cyc.headI = 0; cyc.hstale = false; } $('#sp-head').value = cyc.head[cyc.headI++ % cyc.head.length].replace(/^["\s]+|["\s]+$/g, '').slice(0, 70); $('#sp-head').dispatchEvent(new Event('input')); });
    $('#sp-head').closest('label').after(hl);
    const ph = $('#sp-photo').closest('.f'); if (ph) { const row = ph.querySelector('.tp-actions'); const b = K.el('button', 'tb tb--sm'); b.type = 'button'; b.innerHTML = K.AI_ICON + ' AI image'; b.title = 'Make a background picture from your headline'; row.appendChild(b);
      b.onclick = () => K.busy(b, async () => { const d = await K.ai('image', { prompt: (details() || 'abstract gold and dark gradient') + '. Soft lighting, space for text.' }, 90000); if (!d || !d.image) return K.toast('The image service did not answer. Try again.', 'err'); const im = new Image(); im.onload = () => { photo = im; $('#sp-photo-name').textContent = 'AI image'; redraw(); K.toast('Image added as the background'); }; im.src = 'data:image/jpeg;base64,' + d.image.replace(/^data:[^,]*,/, ''); }); }
  });
  (async () => { await K.fonts([['Inter', '500;600;700;800'], ['Cormorant Garamond', '700']]); redraw(); })(); chips(); caption(); draw();

  /* ---- Optional AI help (needs the Cloudflare Worker) ---- */
  K.whenAI(() => {
    const mk = (label, fn) => { const b = K.el('button', 'tb tb--sm', ''); b.type = 'button'; b.innerHTML = K.AI_ICON + ' ' + label; b.addEventListener('click', () => K.busy(b, fn)); return b; };
    const details = () => { const o = read(); return [o.head, o.body, o.cta, o.city].filter(Boolean).join('. '); };
    let ai = [], ni = 0;
    const capBtn = mk('AI captions', async () => { const t = details(); if (t.length < 6) return K.toast('Add a headline first.', 'err'); if (!ai.length || capBtn.dataset.t !== t) { const r = await K.rewrite('caption', t, { context: $('#sp-cat').value }); if (!r) return K.toast('AI did not answer. Try again.', 'err'); ai = r; ni = 0; capBtn.dataset.t = t; } $('#sp-cap').value = ai[ni % ai.length] + '\n\n' + tagsFor().join(' '); ni++; });
    $('#sp-recap').after(capBtn);
    const hdBtn = mk('AI headlines', async () => { const t = details(); if (t.length < 4) return K.toast('Describe your post first.', 'err'); const r = await K.rewrite('headline', t); if (!r) return K.toast('AI did not answer. Try again.', 'err'); const box = $('#sp-aihead') || K.el('div', 'sp-aihead'); box.id = 'sp-aihead'; box.innerHTML = ''; r.slice(0, 6).forEach((h) => { const c = K.el('button', 'sp-chip', h); c.type = 'button'; c.onclick = () => { $('#sp-head').value = h; $('#sp-head').dispatchEvent(new Event('input', { bubbles: true })); }; box.appendChild(c); }); $('#sp-head').closest('label').after(box); box.before(hdBtn); });
    $('#sp-head').closest('label').after(hdBtn);
    const imgBtn = mk('AI background', async () => { const q = ($('#sp-head').value + ' ' + $('#sp-cat').value).trim(); const d = await K.ai('image', { prompt: (window.prompt('Describe the background (for example: gold and black abstract waves)', 'abstract soft gradient shapes, ' + q) || '').trim() }, 60000); if (!d || !d.image) return K.toast('Image service did not answer. Try again.', 'err'); const im = new Image(); im.onload = () => { photo = im; $('#sp-photo-name').textContent = 'AI image'; redraw(); K.toast('Background added'); }; im.src = 'data:image/jpeg;base64,' + d.image; });
    $('#sp-photo-clear').after(imgBtn);
  });
})();
