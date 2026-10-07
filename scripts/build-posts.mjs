// Builds one static page per post: blog/p/<id>.html (shareable, with its own title and preview tags).
// Also refreshes the post URLs inside sitemap.xml. Related posts are added in the browser by post.js.
import { readFile, writeFile, readdir, unlink, mkdir } from 'node:fs/promises';

const SITE = 'https://vibrantrevolve.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^(https?:\/\/|\/)/.test(u || '') ? u : '#');
const posts = JSON.parse(await readFile('blog/posts.json', 'utf8')).filter((p) => /^[a-z0-9-]+$/i.test(p.id || ''));
await mkdir('blog/p', { recursive: true });


// ---- On-brand cover art for every story: original, generated, no third-party images involved. ----
const TONES = {
  Web: ['#0d1822', '#6cb4ee'], Payments: ['#0c1e16', '#5fd3a0'], 'AI & Automation': ['#171025', '#b79cff'], Security: ['#241014', '#ff8f8f'],
  'Design & Social': ['#240f1b', '#ff8fc0'], 'Grants & Funding': ['#221a08', '#e8cd7a'], 'Tech News': ['#14120e', '#e8cd7a'],
  Business: ['#0b1c20', '#4fd1c5'], 'Naija Startups': ['#10190b', '#8bd450'], Jobs: ['#1d1510', '#ff9f5a']
};
const GLYPH = {
  Web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6.5 6.5h.01M9.5 6.5h.01"/>',
  Payments: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  'AI & Automation': '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  Security: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  'Design & Social': '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  'Grants & Funding': '<circle cx="12" cy="12" r="9"/><path d="M12 6v12M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.6-3-1.6"/>'
};
GLYPH.Business = '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
GLYPH['Naija Startups'] = '<path d="M12 3c4 2 6 6 5 11l-5 5-5-5c-1-5 1-9 5-11z"/><circle cx="12" cy="10" r="1.8"/><path d="M7 17l-3 3M17 17l3 3"/>';
GLYPH.Jobs = '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>';
const DEFAULT_GLYPH = '<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.2"/>';
function coverSvg(p) {
  const tag = p.tag || 'Tech News', [bg, ac] = TONES[tag] || TONES['Tech News'];
  let h = 2166136261; for (const c of String(p.id)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  const cx = 780 + Math.round(rnd() * 320), cy = 330 + Math.round(rnd() * 220);
  const arcs = [140, 230, 320, 410, 500].map((r, i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ac}" stroke-opacity="${(0.34 - i * 0.055).toFixed(2)}" stroke-width="${i % 2 ? 1.5 : 2.5}"${i === 2 ? ' stroke-dasharray="3 12" stroke-linecap="round"' : ''}/>`).join('');
  let dots = ''; for (let y = 0; y < 5; y++) for (let x = 0; x < 9; x++) if (rnd() > 0.35) dots += `<circle cx="${70 + x * 30}" cy="${70 + y * 30}" r="${(1.5 + rnd() * 2).toFixed(1)}" fill="${ac}" fill-opacity="${(0.18 + rnd() * 0.3).toFixed(2)}"/>`;
  const label = esc(tag.toUpperCase());
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${esc(tag)} story">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#0b0a09"/></linearGradient><radialGradient id="r" cx="${(cx / 1200).toFixed(2)}" cy="${(cy / 630).toFixed(2)}" r=".6"><stop offset="0" stop-color="${ac}" stop-opacity=".28"/><stop offset="1" stop-color="${ac}" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#r)"/>${arcs}${dots}
<g transform="translate(${cx - 120} ${cy - 120}) scale(10)" fill="none" stroke="${ac}" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round">${GLYPH[tag] || DEFAULT_GLYPH}</g>
<rect x="60" y="500" height="46" width="${40 + label.length * 15}" rx="23" fill="none" stroke="${ac}" stroke-opacity=".7" stroke-width="2"/>
<text x="82" y="531" fill="${ac}" font-family="Inter,Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="3">${label}</text>
<text x="60" y="580" fill="#f5f0e6" fill-opacity=".55" font-family="Georgia,serif" font-size="22">VibrantRevolve Tech Radar</text></svg>
`;
}
await mkdir('blog/cover', { recursive: true });

const hero = (p) => {
  const own = p.image && /^(https:\/\/|\/)/.test(p.image);   // your own or properly licensed picture, with credit
  const src = own ? p.image : `/blog/cover/${p.id}.svg`;
  const cap = own && p.imageCredit ? `<figcaption>Image: ${p.imageCreditUrl ? `<a href="${esc(safe(p.imageCreditUrl))}" target="_blank" rel="noopener noreferrer">${esc(p.imageCredit)}</a>` : esc(p.imageCredit)}</figcaption>` : '';
  return `        <figure class="post-hero"><img src="${esc(src)}" alt="${esc(own ? (p.imageAlt || '') : '')}" width="1200" height="630" decoding="async">${cap}</figure>`;
};
function page(p) {
  const url = `${SITE}/blog/p/${p.id}.html`;
  const grant = p.tag === 'Grants & Funding', job = p.tag === 'Jobs', biz = p.tag === 'Business';
  const care = grant ? 'Confirm deadlines and eligibility on the official page before you apply.' : job ? 'Check the details with the employer. Never pay money to get a job or an interview.' : biz ? 'General information only, not financial advice.' : '';
  const body = Array.isArray(p.body) && p.body.length ? p.body : [p.excerpt || ''];
  const mins = Math.max(1, Math.round(body.join(' ').split(/\s+/).length / 210));
  const lic = p.license && p.license.name && p.url ? p.license : null; // full text republished under an open licence
  const indexable = !lic && ((Array.isArray(p.body) && p.body.length) || p.take); // thin summaries stay out of search results
  const ext = p.url ? `<a class="btn btn-primary" href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">${grant ? 'View opportunity &amp; apply' : job ? 'View the job at ' + esc(p.source) : 'Continue reading at ' + esc(p.source)}</a>` : '';
  const cta = p.cta && p.cta.href ? `<a class="btn btn-secondary" href="${esc(safe(p.cta.href))}">${esc(grant ? 'Need a website for your application?' : p.cta.label || 'Learn more')}</a>` : '';
  const ld = indexable ? `\n  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, dateModified: p.date, mainEntityOfPage: url, image: SITE + '/assets/images/og-share.png', author: { '@type': 'Organization', name: 'VibrantRevolve' }, publisher: { '@type': 'Organization', name: 'VibrantRevolve', url: SITE }, ...(p.url ? { isBasedOn: p.url } : {}) }).replace(/</g, '\\u003c')}</script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.title)} | Tech Radar | VibrantRevolve</title>
  <meta name="description" content="${esc((p.excerpt || '').slice(0, 160))}">
  <meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}">
  <link rel="canonical" href="${lic ? esc(safe(p.url)) : url}">
  <link rel="alternate" type="application/rss+xml" title="VibrantRevolve Tech Radar" href="/blog/feed.xml">${ld}
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc((p.excerpt || '').slice(0, 200))}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/assets/images/og-share.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="VibrantRevolve">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.title)}">
  <meta name="twitter:image" content="${SITE}/assets/images/og-share.png">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@600;700&display=swap">
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/enhance.css">
  <link rel="stylesheet" href="/assets/css/tools.css">
  <link rel="stylesheet" href="/assets/css/app.css">
  <!-- vr-favicons -->
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0b0a09">
  <!-- /vr-favicons -->
  <style>.post{max-width:760px;margin:0 auto}.post h1{font-size:clamp(2rem,5vw,3rem);margin:.6rem 0}.post p{font-size:1.08rem;line-height:1.8}.post-meta{color:var(--text-muted);font-size:.9rem}.post-note{font-size:.9rem;color:var(--text-muted);border-left:3px solid var(--accent);padding-left:1rem}.post-actions{display:flex;gap:.7rem;flex-wrap:wrap;margin:1.6rem 0}.more{max-width:1000px;margin:3.5rem auto 0}.more-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}.more-grid a.card{padding:1.1rem;display:block;text-decoration:none}.more-grid h3{font-size:1.1rem;margin:.4rem 0}.more small{color:var(--text-muted)}.more h2{margin-bottom:1.2rem}.post .post-meta{margin-bottom:1.2rem}.post p{margin:.9rem 0}.src-badge{display:inline-block;padding:.15rem .7rem;border-radius:999px;border:1px solid var(--accent);color:var(--accent-light,var(--accent));font-weight:600;font-size:.8rem}.post-credit{font-size:.92rem;padding:.8rem 1rem;border-radius:12px;background:rgba(var(--accent-rgb,201,162,39),.08);border:1px solid rgba(var(--accent-rgb,201,162,39),.3)}.post-note{margin:1.2rem 0}.post-share{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center;font-size:.9rem;color:var(--text-muted)}.post-share a{padding:.3rem .8rem;border-radius:999px;border:1px solid var(--border-color,rgba(201,162,39,.35));text-decoration:none}.post-hero{margin:1.2rem 0}.post-hero img{width:100%;height:auto;border-radius:16px;border:1px solid rgba(201,162,39,.3);display:block}.post-hero figcaption{font-size:.78rem;color:var(--text-muted);margin-top:.4rem}.post-legal{font-size:.82rem!important;color:var(--text-muted);margin-top:1.4rem!important}</style>
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
        <p class="post-meta"><span class="src-badge">${p.url ? 'Source: ' : 'By '}${esc(p.source)}</span>${p.author ? ' &middot; ' + esc(p.author) : ''} &middot; ${esc(String(p.date || '').slice(0, 10))} &middot; ${mins} min read</p>
${hero(p)}
${lic ? `        <p class="post-credit">This story${p.author ? ' by ' + esc(p.author) : ''} originally appeared on <a href="${esc(safe(p.url))}" target="_blank" rel="noopener noreferrer">${esc(p.source)}</a> on ${esc(String(p.date || '').slice(0, 10))}. Republished under <a href="${esc(safe(lic.url))}" target="_blank" rel="noopener noreferrer">${esc(lic.name)}</a>. Text only, shown without changes.</p>` : ''}
${body.map((t) => `        <p>${esc(t)}</p>`).join('\n')}
${p.url && !(p.body && p.body.length) ? `        <aside class="post-note"><strong>Summary only.</strong> This is VibrantRevolve's short summary of a story by ${esc(p.source)}. We do not republish other publishers' articles, so the full report, photos and quotes stay with the people who made them. ${care || 'Read the whole story on ' + esc(p.source) + ' below.'}</aside>` : ''}
${p.take ? `        <p><strong>Our take:</strong> ${esc(p.take)}</p>` : ''}
        <div class="post-actions">${ext}${cta}<button type="button" class="btn btn-secondary" id="save-story" aria-pressed="false">&#9734; Save for later</button></div>
        <div class="post-share" aria-label="Share this story"><span>Share</span>
          <a href="https://wa.me/?text=${encodeURIComponent(p.title + ' ' + url)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(p.title)}&amp;url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer">X</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
${p.url ? `        <p class="post-legal">${lic ? 'Credit to ' + esc(p.source) + (p.author ? ' and ' + esc(p.author) : '') + ', used under ' + esc(lic.name) + '. ' : 'All rights in the original story belong to ' + esc(p.source) + (p.author ? ' and ' + esc(p.author) : '') + '. '}Spotted a problem or want something changed or removed? <a href="mailto:vr@vibrantrevolve.com?subject=${encodeURIComponent('Tech Radar: ' + p.title)}">Tell us</a> and we will act promptly.</p>` : ''}
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
  <script defer src="/assets/js/tools.js"></script>
  <script defer src="/assets/js/app.js"></script>
</body>
</html>
`;
}

const ids = new Set(posts.map((p) => p.id));
for (const p of posts) { await writeFile(`blog/p/${p.id}.html`, page(p)); await writeFile(`blog/cover/${p.id}.svg`, coverSvg(p)); }
for (const f of await readdir('blog/cover')) if (f.endsWith('.svg') && !ids.has(f.slice(0, -4))) await unlink(`blog/cover/${f}`);
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
