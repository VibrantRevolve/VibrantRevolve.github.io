// "More from Tech Radar" under each article: same topic first, then newest.
(function () {
  const box = document.getElementById('more'), art = document.querySelector('.post');
  if (!box || !art) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  fetch('/blog/posts.json').then((r) => r.json()).then((all) => {
    const id = art.dataset.id, tag = art.dataset.tag;
    const rest = all.filter((p) => p.id !== id && /^[a-z0-9-]+$/i.test(p.id || '')).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const list = [...rest.filter((p) => p.tag === tag), ...rest.filter((p) => p.tag !== tag)].slice(0, 6);
    box.innerHTML = list.length ? list.map((p) => `<a class="card" href="/blog/p/${esc(p.id)}.html"><img src="/blog/cover/${esc(p.id)}.svg" alt="" width="1200" height="630" loading="lazy" style="width:100%;height:auto;border-radius:10px;display:block;margin-bottom:.7rem"><span class="product-tag">${esc(p.tag || 'Tech')}</span><h3>${esc(p.title)}</h3><small>${esc(p.source)} · ${esc(String(p.date || '').slice(0, 10))}</small></a>`).join('') : '<p>More posts are coming soon.</p>';
  }).catch(() => { box.innerHTML = '<p><a href="/blog/">Browse all Tech Radar posts</a></p>'; });
})();

// Save for later (kept on this device only)
(function () {
  const btn = document.getElementById('save-story'), art = document.querySelector('.post'); if (!btn || !art) return;
  const KEY = 'vr_saved', id = art.dataset.id;
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const set = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  const paint = () => { const on = get().indexOf(id) > -1; btn.setAttribute('aria-pressed', String(on)); btn.innerHTML = on ? '&#9733; Saved' : '&#9734; Save for later'; };
  btn.onclick = () => { const a = get(), i = a.indexOf(id); if (i > -1) a.splice(i, 1); else a.push(id); set(a); paint(); };
  paint();
})();
