// Builds one static page per post: blog/p/<id>.html (shareable, with its own title and preview tags).
// Also refreshes the post URLs inside sitemap.xml. Related posts are added in the browser by post.js.
import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';

const SITE = 'https://vibrantrevolve.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^(https?:\/\/|\/)/.test(u || '') ? u : '#');
const posts = JSON.parse(await readFile('blog/posts.json', 'utf8')).filter((p) => /^[a-z0-9-]+$/i.test(p.id || ''));
await mkdir('blog/p', { recursive: true });

function page(p) {
  const url = `${SITE}/blog/p/${p.id}.html`;
  const grant = p.tag === 'Grants & Funding';
  const body = Array.isArray(p.body) && p.body.length ? p.body : [p.excerpt || ''];
  const indexable = (Array.isArray(p.body) && p.body.length) || p.take; // thin summaries stay out of search results
  const ext = p.url ? `<a class="btn btn-primary" href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">${grant ? 'View opportunity &amp; apply' : 'Continue reading at ' + esc(p.source)}</a>` : '';
  const cta = p.cta && p.cta.href ? `<a class="btn btn-secondary" href="${esc(safe(p.cta.href))}">${esc(grant ? 'Need a website for your application?' : p.cta.label || 'Learn more')}</a>` : '';
  const ld = indexable ? `\n  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, dateModified: p.date, mainEntityOfPage: url, image: SITE + '/assets/images/og-image.png', author: { '@type': 'Organization', name: 'VibrantRevolve' }, publisher: { '@type': 'Organization', name: 'VibrantRevolve', url: SITE }, ...(p.url ? { isBasedOn: p.url } : {}) }).replace(/</g, '\\u003c')}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.title)} | Tech Radar | VibrantRevolve</title>
  <meta name="description" content="${esc((p.excerpt || '').slice(0, 160))}">
  <meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" type="application/rss+xml" title="VibrantRevolve Tech Radar" href="/blog/feed.xml">${ld}
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc((p.excerpt || '').slice(0, 200))}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/assets/images/og-image.png">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@600;700&display=swap">
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/enhance.css">
  <style>.post{max-width:760px;margin:0 auto}.post h1{font-size:clamp(2rem,5vw,3rem);margin:.6rem 0}.post p{font-size:1.08rem;line-height:1.8}.post-meta{color:var(--text-muted);font-size:.9rem}.post-note{font-size:.9rem;color:var(--text-muted);border-left:3px solid var(--accent);padding-left:1rem}.post-actions{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.6rem 0}.more{max-width:1000px;margin:3.5rem auto 0}.more-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}.more-grid a.card{padding:1.1rem;display:block;text-decoration:none}.more-grid h3{font-size:1.1rem;margin:.4rem 0}.more small{color:var(--text-muted)}.more h2{margin-bottom:1.2rem}.post .post-meta{margin-bottom:1.2rem}.post p{margin:.9rem 0}</style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div id="site-header"></div>
  <main id="main">
    <section class="container" style="padding:3rem 1.5rem 5rem">
      <article class="post" data-id="${esc(p.id)}" data-tag="${esc(p.tag || '')}">
        <p><a href="/blog/">&larr; Back to Tech Radar</a></p>
        <span class="product-tag">${esc(p.tag || 'Tech')}</span>
        <h1>${esc(p.title)}</h1>
        <p class="post-meta">${esc(p.source)} &middot; ${esc(String(p.date || '').slice(0, 10))}</p>
${body.map((t) => `        <p>${esc(t)}</p>`).join('\n')}
${p.url && !(p.body && p.body.length) ? `        <p class="post-note">This is a short summary. ${grant ? 'Confirm deadlines and eligibility on the official page before you apply.' : 'The full story is on ' + esc(p.source) + '.'}</p>` : ''}
${p.take ? `        <p><strong>Our take:</strong> ${esc(p.take)}</p>` : ''}
        <div class="post-actions">${ext}${cta}</div>
      </article>
      <div class="more"><h2>More from Tech Radar</h2><div class="more-grid" id="more"></div></div>
    </section>
  </main>
  <div id="site-footer"></div>
  <script defer src="/assets/js/main.js"></script>
  <script defer src="/assets/js/post.js"></script>
  <script defer src="/assets/js/site-config.js"></script>
  <script defer src="/assets/js/banner.js"></script>
  <script defer src="/assets/js/assistant.js"></script>
  <script defer src="/assets/js/enhance.js"></script>
</body>
</html>
`;
}

const ids = new Set(posts.map((p) => p.id));
for (const p of posts) await writeFile(`blog/p/${p.id}.html`, page(p));
for (const f of await readdir('blog/p')) if (f.endsWith('.html') && !ids.has(f.slice(0, -5))) await unlink(`blog/p/${f}`);

try {
  let sm = await readFile('sitemap.xml', 'utf8');
  const block = posts.filter((p) => (Array.isArray(p.body) && p.body.length) || p.take).map((p) => `  <url><loc>${SITE}/blog/p/${p.id}.html</loc><priority>0.5</priority></url>`).join('\n');
  sm = sm.replace(/<!-- posts:start -->[\s\S]*?<!-- posts:end -->/, `<!-- posts:start -->\n${block}\n  <!-- posts:end -->`);
  await writeFile('sitemap.xml', sm);
} catch {}
const xe = (t) => String(t ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const items = posts.filter((p) => (Array.isArray(p.body) && p.body.length) || p.take).slice(0, 30).map((p) => `    <item><title>${xe(p.title)}</title><link>${SITE}/blog/p/${p.id}.html</link><guid isPermaLink="true">${SITE}/blog/p/${p.id}.html</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${xe(p.excerpt)}</description></item>`).join('\n');
await writeFile('blog/feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>VibrantRevolve Tech Radar</title><link>${SITE}/blog/</link><description>Tech news, guides and funding opportunities for African businesses.</description>\n${items}\n</channel></rss>\n`);
console.log(`Built ${posts.length} post page(s).`);
