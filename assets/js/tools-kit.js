/* VibrantRevolve Studio Tools: shared kit (colour maths, canvas helpers, PDF/PNG export, sharing).
   No dependencies. Everything runs in the visitor's browser. */
(function () {
  const K = (window.VRKit = {});

  /* ---------- DOM ---------- */
  K.$ = (s, r) => (r || document).querySelector(s);
  K.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  K.el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  K.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  K.elh = (tag, cls, html) => { const e = K.el(tag, cls); e.innerHTML = html; return e; };
  K.cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  K.slug = (s) => (String(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'untitled');
  K.cfg = () => window.VR_CONFIG || {};
  K.whatsapp = () => K.cfg().whatsapp || '2349012739299';
  K.email = () => K.cfg().supportEmail || 'vr@vibrantrevolve.com';

  /* ---------- storage (per-visitor convenience only) ---------- */
  K.store = {
    get(k, d) { try { const v = localStorage.getItem('vr_tool_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('vr_tool_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- seeded random ---------- */
  K.hash = (str) => { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; };
  K.rng = (seed) => function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  K.pick = (r, a) => a[Math.floor(r() * a.length)];
  K.between = (r, a, b) => a + r() * (b - a);
  K.shuffled = (r, a) => { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };

  /* ---------- colour ---------- */
  K.hsl = (h, s, l) => { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); const x = (v) => Math.round(v * 255).toString(16).padStart(2, '0'); return ('#' + x(f(0)) + x(f(8)) + x(f(4))).toUpperCase(); };
  K.rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16));
  K.hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  K.toHsl = (hex) => { let [r, g, b] = K.rgb(hex).map((v) => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; };
  K.lum = (hex) => { const c = K.rgb(hex).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  K.contrast = (a, b) => { const x = K.lum(a), y = K.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  K.textOn = (hex) => (K.contrast(hex, '#ffffff') >= K.contrast(hex, '#14110d') ? '#ffffff' : '#14110d');
  K.cmyk = (hex) => { const [r, g, b] = K.rgb(hex).map((v) => v / 255); const k = 1 - Math.max(r, g, b); if (k === 1) return [0, 0, 0, 100]; return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((v) => Math.round(v * 100)); };
  K.mix = (a, b, t) => { const x = K.rgb(a), y = K.rgb(b); return K.hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t); };
  K.wcag = (ratio) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail');

  /* ---------- UI helpers ---------- */
  let toastTimer;
  K.toast = (msg, kind) => {
    let t = K.$('.vt-toast');
    if (!t) { t = K.el('div', 'vt-toast'); t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.textContent = msg; t.dataset.kind = kind || ''; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
  };
  K.copy = (text, btn, label) => {
    const done = () => { K.toast(label || 'Copied to clipboard'); if (btn) { const o = btn.dataset.o || btn.innerHTML; btn.dataset.o = o; btn.classList.add('is-done'); setTimeout(() => { btn.classList.remove('is-done'); }, 1100); } };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
    else { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
  };
  // Optional AI writing through the Cloudflare Worker in workers/studio-ai (VR_CONFIG.studioAiUrl). Returns data or null, never throws.
  K.aiOn = () => !!((window.VR_CONFIG || {}).studioAiUrl);
  K.ai = async (task, data, ms) => {
    if (!K.aiOn()) return null;
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms || 30000);
    try {
      const r = await fetch(window.VR_CONFIG.studioAiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ task }, data)), signal: ctl.signal });
      if (!r.ok) return null; const d = await r.json(); return d && d.ok ? d.data : null;
    } catch (e) { return null; } finally { clearTimeout(timer); }
  };
  K.AI_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>';
  // Runs fn once the page has finished loading (so site-config.js has run) and only if AI is configured.
  K.whenAI = (fn) => { const go = () => { if (K.aiOn()) fn(); }; if (document.readyState === 'complete') go(); else window.addEventListener('load', go); };
  K.busy = async (btn, fn) => {
    if (btn.disabled) return; const o = btn.innerHTML; btn.disabled = true; btn.classList.add('is-busy');
    try { return await fn(); } catch (e) { console.error(e); K.toast('Something went wrong. Please try again.', 'err'); } finally { btn.disabled = false; btn.classList.remove('is-busy'); btn.innerHTML = o; }
  };

  /* ---------- files ---------- */
  K.download = (blob, name) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  };
  K.canvasBlob = (cv, type, q) => new Promise((res) => cv.toBlob(res, type || 'image/png', q));
  K.share = async (files, text, title) => {
    try {
      if (navigator.canShare && navigator.canShare({ files })) { await navigator.share({ files, text, title }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return true; }
    return false;
  };
  K.waLink = (text) => 'https://wa.me/' + K.whatsapp() + '?text=' + encodeURIComponent(text);
  K.mailLink = (subject, body) => 'mailto:' + K.email() + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

  /* ---------- fonts (Google Fonts, used by canvas too) ---------- */
  const fontLinks = new Set();
  K.fonts = async (specs) => {
    // specs: [['Playfair Display', '400;700'], ...]
    const fams = specs.filter((s) => !fontLinks.has(s[0]));
    // one stylesheet per family so a single bad weight list can never break the others
    await Promise.all(fams.map((s) => new Promise((r) => {
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(s[0]).replace(/%20/g, '+') + ':wght@' + (s[1] || '400;700') + '&display=swap';
      document.head.appendChild(l); fontLinks.add(s[0]);
      l.onload = r; l.onerror = r; setTimeout(r, 3500);
    })));
    if (!document.fonts || !document.fonts.load) return;
    const jobs = [];
    specs.forEach((s) => String(s[1] || '400;700').split(';').forEach((w) => jobs.push(document.fonts.load(w + ' 32px "' + s[0] + '"').catch(() => {}))));
    await Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, 3500))]);
  };

  /* ---------- canvas helpers ---------- */
  K.canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  K.rr = (ctx, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  K.wrap = (ctx, text, x, y, maxW, lh, maxLines) => {
    const words = String(text).split(/\s+/); let line = '', n = 0;
    for (let i = 0; i < words.length; i++) {
      const t = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y + n * lh); n++; line = words[i]; if (maxLines && n >= maxLines) { return n; } }
      else line = t;
    }
    if (line) { ctx.fillText(line, x, y + n * lh); n++; }
    return n;
  };
  K.fit = (ctx, text, font, maxW, startPx, minPx) => { // returns px that fits maxW
    let px = startPx; while (px > minPx) { ctx.font = font.replace('{px}', px); if (ctx.measureText(text).width <= maxW) break; px -= 2; } return px;
  };
  K.svgImage = (svg) => new Promise((res, rej) => {
    const img = new Image(); img.onload = () => res(img); img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  K.fileImage = (file) => new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => res({ img, url }); img.onerror = rej; img.src = url;
  });
  K.cover = (ctx, img, x, y, w, h) => { // draw image like object-fit: cover
    const s = Math.max(w / img.width, h / img.height), iw = w / s, ih = h / s;
    ctx.drawImage(img, (img.width - iw) / 2, (img.height - ih) / 2, iw, ih, x, y, w, h);
  };
  K.contain = (ctx, img, x, y, w, h) => {
    const s = Math.min(w / img.width, h / img.height), dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  };

  /* ---------- PDF (JPEG pages, no library) ---------- */
  const enc = new TextEncoder();
  K.pdfFromCanvases = (canvases, opts) => {
    opts = opts || {}; const pw = opts.width || 595.28, ph = opts.height || 841.89, title = opts.title || 'VibrantRevolve';
    const chunks = [], offsets = []; let len = 0;
    const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; };
    const obj = (n, body) => { offsets[n] = len; push(n + ' 0 obj\n'); push(body); push('\nendobj\n'); };
    const n = canvases.length, infoId = 3 + n * 3;
    push('%PDF-1.4\n%âãÏÓ\n');
    obj(1, '<</Type/Catalog/Pages 2 0 R>>');
    obj(2, '<</Type/Pages/Kids [' + canvases.map((_, i) => (3 + i * 3) + ' 0 R').join(' ') + ']/Count ' + n + '>>');
    canvases.forEach((cv, i) => {
      const pid = 3 + i * 3, cid = pid + 1, iid = pid + 2;
      const b64 = cv.toDataURL('image/jpeg', 0.93).split(',')[1], bin = atob(b64), bytes = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      obj(pid, '<</Type/Page/Parent 2 0 R/MediaBox [0 0 ' + pw + ' ' + ph + ']/Resources<</XObject<</Im0 ' + iid + ' 0 R>>>>/Contents ' + cid + ' 0 R>>');
      const content = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im0 Do Q';
      obj(cid, '<</Length ' + content.length + '>>\nstream\n' + content + '\nendstream');
      offsets[iid] = len; push(iid + ' 0 obj\n<</Type/XObject/Subtype/Image/Width ' + cv.width + '/Height ' + cv.height + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ' + bytes.length + '>>\nstream\n');
      push(bytes); push('\nendstream\nendobj\n');
    });
    obj(infoId, '<</Title (' + title.replace(/[()\\]/g, '') + ')/Producer (VibrantRevolve Studio Tools)/Creator (vibrantrevolve.com)>>');
    const xref = len; push('xref\n0 ' + (infoId + 1) + '\n0000000000 65535 f \n');
    for (let i = 1; i <= infoId; i++) push(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    push('trailer\n<</Size ' + (infoId + 1) + '/Root 1 0 R/Info ' + infoId + ' 0 R>>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(chunks, { type: 'application/pdf' });
  };


  /* Human-readable file size */
  K.fmtBytes = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(n < 10240 ? 1 : 0) + ' KB' : (n / 1048576).toFixed(2) + ' MB';

  /* ZIP (stored, no compression) from [{name, blob}]. Good for already-compressed files such as JPG, WebP and PDF. */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u8) => { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  K.zip = async (files) => {
    const parts = [], central = []; let offset = 0; const used = new Set();
    const now = new Date(), dt = ((now.getFullYear() - 1980) << 9 | (now.getMonth() + 1) << 5 | now.getDate()) & 0xFFFF, tm = (now.getHours() << 11 | now.getMinutes() << 5 | (now.getSeconds() >> 1)) & 0xFFFF;
    for (const f of files) {
      let name = String(f.name).replace(/[\\/:*?"<>|]+/g, '-'), base = name, i = 2; while (used.has(name)) { const d = base.lastIndexOf('.'); name = d > 0 ? base.slice(0, d) + '-' + i + base.slice(d) : base + '-' + i; i++; } used.add(name);
      const data = new Uint8Array(await f.blob.arrayBuffer()), nm = enc.encode(name), crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, tm, true); lh.setUint16(12, dt, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true); lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
      parts.push(lh.buffer, nm, data);
      const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, tm, true); ch.setUint16(14, dt, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, offset, true);
      central.push(ch.buffer, nm); offset += 30 + nm.length + data.length;
    }
    let csize = 0; central.forEach((c) => { csize += c.byteLength !== undefined ? c.byteLength : c.length; });
    const end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
  };

  /* PDF with a custom size per page: pages = [{ canvas, w, h }] in PDF points. quality is the JPEG quality, 0 to 1. */
  K.pdfPages = (pages, opts) => {
    opts = opts || {}; const q = opts.quality || 0.85, title = (opts.title || 'VibrantRevolve').replace(/[()\\]/g, '');
    const chunks = [], offsets = []; let len = 0;
    const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; chunks.push(b); len += b.length; };
    const obj = (n, body) => { offsets[n] = len; push(n + ' 0 obj\n'); push(body); push('\nendobj\n'); };
    const n = pages.length, infoId = 3 + n * 3;
    push('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n');
    obj(1, '<</Type/Catalog/Pages 2 0 R>>');
    obj(2, '<</Type/Pages/Kids [' + pages.map((_, i) => (3 + i * 3) + ' 0 R').join(' ') + ']/Count ' + n + '>>');
    pages.forEach((pg, i) => {
      const pid = 3 + i * 3, cid = pid + 1, iid = pid + 2, cv = pg.canvas, w = +pg.w.toFixed(2), h = +pg.h.toFixed(2);
      const bin = atob(cv.toDataURL('image/jpeg', q).split(',')[1]), bytes = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      obj(pid, '<</Type/Page/Parent 2 0 R/MediaBox [0 0 ' + w + ' ' + h + ']/Resources<</XObject<</Im0 ' + iid + ' 0 R>>>>/Contents ' + cid + ' 0 R>>');
      const content = 'q ' + w + ' 0 0 ' + h + ' 0 0 cm /Im0 Do Q';
      obj(cid, '<</Length ' + content.length + '>>\nstream\n' + content + '\nendstream');
      offsets[iid] = len; push(iid + ' 0 obj\n<</Type/XObject/Subtype/Image/Width ' + cv.width + '/Height ' + cv.height + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ' + bytes.length + '>>\nstream\n');
      push(bytes); push('\nendstream\nendobj\n');
    });
    obj(infoId, '<</Title (' + title + ')/Producer (VibrantRevolve Studio Tools)/Creator (vibrantrevolve.com)>>');
    const xref = len; push('xref\n0 ' + (infoId + 1) + '\n0000000000 65535 f \n');
    for (let i = 1; i <= infoId; i++) push(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
    push('trailer\n<</Size ' + (infoId + 1) + '/Root 1 0 R/Info ' + infoId + ' 0 R>>\nstartxref\n' + xref + '\n%%EOF');
    return new Blob(chunks, { type: 'application/pdf' });
  };

  /* ---------- hex code boxes next to every colour picker ---------- */
  K.hexify = (root) => {
    K.$$('input[type="color"]', root).forEach((c) => {
      if (c.dataset.hexed) return; c.dataset.hexed = '1';
      const lab = c.closest('label'), t = document.createElement('input'); t.type = 'text'; t.className = 'hex-in'; t.maxLength = 7; t.value = c.value.toUpperCase(); t.placeholder = '#RRGGBB'; t.spellcheck = false; t.autocapitalize = 'characters'; t.setAttribute('aria-label', (lab ? lab.textContent.trim().split('\n')[0] : 'Colour') + ' hex code');
      const wrap = document.createElement('div'); wrap.className = 'hexrow'; c.parentNode.insertBefore(wrap, c); wrap.appendChild(c); wrap.appendChild(t);
      const norm = (v) => { v = v.trim().replace(/^#?/, '#'); if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + v.slice(1).split('').map((x) => x + x).join(''); return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : null; };
      t.addEventListener('input', () => { const v = norm(t.value); t.classList.toggle('is-bad', !!t.value && !v); if (v && v !== c.value) { c.value = v; c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); } });
      t.addEventListener('blur', () => { t.value = c.value.toUpperCase(); t.classList.remove('is-bad'); });
      const back = () => { if (document.activeElement !== t) t.value = c.value.toUpperCase(); };
      c.addEventListener('input', back); c.addEventListener('change', back);
    });
  };
  const hexInit = () => K.hexify(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hexInit); else hexInit();
  window.addEventListener('load', hexInit);

  /* A4 canvas at 150 dpi (1240 x 1754) */
  K.A4 = { w: 1240, h: 1754 };
  K.page = (bg) => { const c = K.canvas(K.A4.w, K.A4.h), x = c.getContext('2d'); x.fillStyle = bg || '#ffffff'; x.fillRect(0, 0, c.width, c.height); return { c, x }; };

  /* Reference ID for a document so the studio can match a brief to a message */
  K.refId = (seed) => 'VR-' + K.hash(seed + Date.now().toString(36).slice(0, 6)).toString(36).toUpperCase().slice(0, 6);
  K.today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  /* Tools list is defined once in tools.js; this is a convenience for pages */
  K.otherTools = (currentId) => (window.VR_TOOLS || []).filter((t) => t.id !== currentId);
})();
