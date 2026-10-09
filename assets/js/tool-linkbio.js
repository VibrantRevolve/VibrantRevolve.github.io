/* Link-in-Bio Page Maker: builds one self-contained HTML page you can host anywhere. */
(function () {
  const K = window.VRKit, $ = K.$; const form = $('#lb-form'); if (!form) return;
  const THEMES = { light: ['#faf8f3', '#1b1813', '#ffffff', '#6c665a'], dark: ['#14120e', '#f4efe2', '#211e18', '#b9b3a4'], gold: ['#1a1408', '#fff4d6', '#2a2010', '#d9c48a'], ocean: ['#0b2239', '#eaf4ff', '#12355a', '#9cc4e8'], blush: ['#fdf0f1', '#3b1d24', '#ffffff', '#8d5a64'], forest: ['#0f2a1d', '#eaf6ee', '#173a29', '#9bc9ad'] };
  const SOC = [['instagram', 'Instagram', (h) => 'https://instagram.com/' + h.replace(/^@/, '')], ['tiktok', 'TikTok', (h) => 'https://tiktok.com/@' + h.replace(/^@/, '')], ['x', 'X / Twitter', (h) => 'https://x.com/' + h.replace(/^@/, '')], ['facebook', 'Facebook', (h) => 'https://facebook.com/' + h.replace(/^@/, '')], ['youtube', 'YouTube', (h) => (/^https?:/i.test(h) ? h : 'https://youtube.com/@' + h.replace(/^@/, ''))], ['linkedin', 'LinkedIn', (h) => (/^https?:/i.test(h) ? h : 'https://linkedin.com/in/' + h)], ['whatsapp', 'WhatsApp', (h) => 'https://wa.me/' + h.replace(/\D/g, '')], ['email', 'Email', (h) => 'mailto:' + h], ['phone', 'Phone', (h) => 'tel:' + h.replace(/[^\d+]/g, '')]];
  const F = { name: '#lb-name', tag: '#lb-tag', bio: '#lb-bio', accent: '#lb-accent' };
  const saved = K.store.get('lb', {}); ['name', 'tag', 'bio', 'accent'].forEach((k) => { if (saved[k] != null) $(F[k]).value = saved[k]; });
  let theme = saved.theme || 'dark', avatar = '', links = saved.links || [{ l: 'Book a call', u: 'wa.me/2340000000000' }, { l: 'See my work', u: 'example.com/work' }];
  const th = $('#lb-theme'); Object.keys(THEMES).forEach((id) => { const b = K.el('button', 'chip', id[0].toUpperCase() + id.slice(1)); b.type = 'button'; b.dataset.id = id; b.setAttribute('aria-pressed', String(id === theme)); b.onclick = () => { theme = id; K.$$('#lb-theme .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === id))); persist(); draw(); }; th.appendChild(b); });
  const soc = $('#lb-soc'); SOC.forEach(([id, label]) => { const lab = K.el('label', 'f'); lab.innerHTML = `<span>${label}</span><input id="lb-s-${id}" type="text" maxlength="90" placeholder="${id === 'whatsapp' || id === 'phone' ? '+234…' : id === 'email' ? 'you@email.com' : '@handle'}" value="${K.esc((saved.soc || {})[id] || '')}">`; soc.appendChild(lab); lab.querySelector('input').addEventListener('input', () => { persist(); soft(); }); });
  /* Only these schemes are ever written into the page. Anything else (javascript:, data:…) is dropped. */
  function safeUrl(u) {
    u = String(u || '').trim(); if (!u) return ''; if (/^(mailto:|tel:)/i.test(u)) return /^mailto:[^\s<>"']+@[^\s<>"']+$/i.test(u) || /^tel:[+\d\s()-]+$/i.test(u) ? u.replace(/\s/g, '') : '';
    if (/^https?:\/\//i.test(u)) { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; } }
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ''; if (/^[^\s/]+\.[^\s/]{2,}/.test(u) || /^wa\.me\//i.test(u)) { try { return new URL('https://' + u).href; } catch (e) { return ''; } } return '';
  }
  function rows() {
    const box = $('#lb-links'); box.innerHTML = '';
    links.forEach((it, i) => { const r = K.el('div', 'lb-row'); r.innerHTML = `<input aria-label="Button text" value="${K.esc(it.l)}" placeholder="Button text" maxlength="40"><input aria-label="Link" value="${K.esc(it.u)}" placeholder="Link (https://…, wa.me/…, mailto:…)" maxlength="300"><button type="button" class="ib" aria-label="Remove link ${i + 1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
      const [a, b] = r.querySelectorAll('input'); a.oninput = () => { it.l = a.value; persist(); soft(); }; b.oninput = () => { it.u = b.value; persist(); soft(); }; r.querySelector('.ib').onclick = () => { links.splice(i, 1); rows(); persist(); soft(); }; box.appendChild(r); });
  }
  const e = K.esc;
  function build() {
    const [bg, fg, card, mute] = THEMES[theme], acc = $(F.accent).value || '#c9a24b', name = $(F.name).value.trim() || 'Your Name', tag = $(F.tag).value.trim(), bio = $(F.bio).value.trim();
    const btns = links.map((x) => ({ l: x.l.trim(), u: safeUrl(x.u) })).filter((x) => x.l && x.u);
    const socs = SOC.map(([id, label, f]) => { const val = ($('#lb-s-' + id) || {}).value; if (!val || !val.trim()) return null; const u = safeUrl(f(val.trim())); return u ? { label, u } : null; }).filter(Boolean);
    const init = (name.match(/\b\w/g) || ['V']).slice(0, 2).join('').toUpperCase();
    const text = (s) => e(s).replace(/\n/g, '<br>');
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(name)}${tag ? ' | ' + e(tag) : ''}</title><meta name="description" content="${e(bio.slice(0, 150))}"><meta property="og:title" content="${e(name)}"><meta property="og:description" content="${e(bio.slice(0, 150))}">
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:${bg};color:${fg};font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:flex;justify-content:center;padding:40px 18px}main{width:100%;max-width:460px;text-align:center}.av{width:104px;height:104px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;background:${acc};color:#14120e;font:700 36px Georgia,serif;overflow:hidden;box-shadow:0 0 0 4px ${card}}.av img{width:100%;height:100%;object-fit:cover}h1{margin:0;font:700 26px Georgia,serif}.tag{margin:4px 0 0;color:${acc};font-weight:600;font-size:14px;letter-spacing:.04em}.bio{margin:12px auto 22px;color:${mute};max-width:360px}a.b{display:block;margin:0 0 12px;padding:15px 18px;border-radius:14px;background:${card};color:${fg};text-decoration:none;font-weight:600;border:1px solid ${acc}55;transition:transform .15s,background .15s}a.b:hover,a.b:focus-visible{transform:translateY(-2px);background:${acc};color:#14120e;outline:none}.s{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px}.s a{padding:7px 13px;border-radius:99px;border:1px solid ${acc}66;color:${mute};text-decoration:none;font-size:13px;font-weight:600}.s a:hover{color:${acc}}footer{margin-top:30px;font-size:12px;color:${mute};opacity:.8}footer a{color:inherit}</style></head><body><main>
<div class="av">${avatar ? `<img src="${avatar}" alt="${e(name)}">` : e(init)}</div><h1>${e(name)}</h1>${tag ? `<p class="tag">${e(tag.toUpperCase())}</p>` : ''}${bio ? `<p class="bio">${text(bio)}</p>` : ''}
${btns.map((b) => `<a class="b" href="${e(b.u)}" target="_blank" rel="noopener noreferrer">${e(b.l)}</a>`).join('\n')}
${socs.length ? `<div class="s">${socs.map((s) => `<a href="${e(s.u)}" target="_blank" rel="noopener noreferrer">${e(s.label)}</a>`).join('')}</div>` : ''}
<footer>Made with <a href="https://vibrantrevolve.com/tools/link-in-bio/" target="_blank" rel="noopener">VibrantRevolve</a></footer></main></body></html>`;
  }
  const frame = $('#lb-frame'); function draw() { frame.srcdoc = build(); }
  let t; const soft = () => { clearTimeout(t); t = setTimeout(draw, 200); };
  const persist = () => { const o = { theme, links, soc: {} }; Object.keys(F).forEach((k) => (o[k] = $(F[k]).value)); SOC.forEach(([id]) => (o.soc[id] = $('#lb-s-' + id).value)); K.store.set('lb', o); };
  Object.keys(F).forEach((k) => $(F[k]).addEventListener('input', () => { persist(); soft(); }));
  $('#lb-add').onclick = () => { if (links.length >= 12) { K.toast('Twelve buttons is plenty', 'err'); return; } links.push({ l: '', u: '' }); rows(); const l = K.$$('#lb-links .lb-row'); l[l.length - 1].querySelector('input').focus(); };
  $('#lb-avatar').onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { const { img, url } = await K.fileImage(f); const c = K.canvas(240, 240); K.cover(c.getContext('2d'), img, 0, 0, 240, 240); avatar = c.toDataURL('image/jpeg', 0.82); URL.revokeObjectURL(url); $('#lb-avatar-name').textContent = f.name; draw(); } catch (er) { K.toast('Could not read that image', 'err'); } };
  $('#lb-avatar-clear').onclick = () => { avatar = ''; $('#lb-avatar').value = ''; $('#lb-avatar-name').textContent = 'No photo'; draw(); };
  $('#lb-dl').onclick = () => { K.download(new Blob([build()], { type: 'text/html' }), K.slug($(F.name).value || 'link-in-bio') + '.html'); K.toast('Page downloaded. Upload it as index.html to any host.'); };
  $('#lb-copy').onclick = (ev) => K.copy(build(), ev.currentTarget, 'Copied');
  K.whenAI(() => { const b = K.el('button', 'tb tb--sm', ''); b.type = 'button'; b.innerHTML = K.AI_ICON + ' Suggest bios'; $('#lb-aislot').appendChild(b); b.onclick = () => K.busy(b, async () => { const res = await K.rewrite('bio', `Name: ${$(F.name).value}\nWhat they do: ${$(F.tag).value}\nNotes: ${$(F.bio).value}`); const box = $('#lb-bios'); box.innerHTML = ''; if (!res) { K.toast('AI is busy. Try again in a moment.', 'err'); return; } res.slice(0, 4).forEach((r) => { const c = K.el('button', 'chip', String(r).slice(0, 150)); c.type = 'button'; c.onclick = () => { $(F.bio).value = String(r).slice(0, 150); persist(); draw(); }; box.appendChild(c); }); }); });
  rows(); draw();
})();
