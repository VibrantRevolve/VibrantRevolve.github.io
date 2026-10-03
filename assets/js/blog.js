(function () {
  const list = document.getElementById('blog-list');
  if (!list) return;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const okUrl = (u) => (/^(https?:\/\/|\/)/.test(u || '') ? u : '#');
  fetch('/blog/posts.json')
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((posts) => {
      posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const filters = document.getElementById('blog-filters');
      if (filters && posts.length) {
        const tags = ['All', ...new Set(posts.map((p) => p.tag || 'Tech'))];
        filters.innerHTML = tags.map((t, i) => `<button type="button" class="filter-btn${i ? '' : ' active'}" data-tag="${esc(t)}">${esc(t)}</button>`).join('');
        filters.addEventListener('click', (e) => {
          const b = e.target.closest('button'); if (!b) return;
          filters.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === b));
          list.querySelectorAll('article').forEach((a) => { a.style.display = b.dataset.tag === 'All' || a.dataset.tag === b.dataset.tag ? '' : 'none'; });
        });
      }
      if (!posts.length) { list.innerHTML = '<p>The first Tech Radar posts will appear here soon.</p>'; return; }
      list.innerHTML = posts.map((p) => `
        <article class="card" data-tag="${esc(p.tag || 'Tech')}" style="padding:1.5rem">
          <span class="product-tag">${esc(p.tag || 'Tech')}</span>
          <h3 style="margin:.5rem 0">${p.url ? `<a href="${esc(okUrl(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>` : esc(p.title)}</h3>
          <p style="font-size:.8rem;color:var(--text-muted)">${esc(p.source)} · ${esc(String(p.date || '').slice(0, 10))}</p>
          <p>${esc(p.excerpt)}</p>
          ${Array.isArray(p.body) && p.body.length ? `<details style="margin:.75rem 0"><summary style="cursor:pointer;color:var(--accent-light);font-weight:600">Read the full guide</summary>${p.body.map((t) => `<p style="margin-top:.75rem">${esc(t)}</p>`).join('')}</details>` : ''}
          ${p.tag === 'Grants & Funding' ? '<p style="font-size:.85rem;color:var(--text-muted)">Always confirm deadlines and eligibility on the official page before applying.</p>' : ''}
          ${p.take ? `<p><strong>Our take:</strong> ${esc(p.take)}</p>` : ''}
          <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem">
            ${p.url ? `<a class="btn btn-primary btn-sm" href="${esc(okUrl(p.url))}" target="_blank" rel="noopener noreferrer">${p.tag === 'Grants & Funding' ? 'View opportunity &amp; apply' : 'Read the full story'}</a>` : ''}
            ${p.cta && p.cta.href ? `<a class="btn btn-secondary btn-sm" href="${esc(okUrl(p.cta.href))}">${esc(p.tag === 'Grants & Funding' ? 'Need a website for your application?' : (p.cta.label || 'Learn more'))}</a>` : ''}
          </div>
        </article>`).join('');
    })
    .catch(() => { list.innerHTML = '<p>Posts could not be loaded right now.</p>'; });
})();