// Pre-renders the product cards into store/index.html so the store is visible even if
// the browser script or JSON fails to load (and so search engines can read it).
// Also validates assets/data/products.json and fails with a clear message if it is broken.
import { readFile, writeFile } from 'node:fs/promises';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let data;
try { data = JSON.parse(await readFile('assets/data/products.json', 'utf8')); }
catch (e) { console.error(`products.json is not valid JSON: ${e.message}\nCheck for a missing comma, a missing quote, or a stray character near your last edit.`); process.exit(1); }
const products = data.products;
if (!Array.isArray(products) || !products.length) { console.error('products.json must contain a non-empty "products" list.'); process.exit(1); }
const seen = new Set();
for (const p of products) {
  for (const k of ['id', 'name', 'category', 'price']) if (p[k] === undefined || p[k] === '') { console.error(`A product is missing "${k}": ${JSON.stringify(p).slice(0, 80)}`); process.exit(1); }
  if (seen.has(p.id)) { console.error(`Duplicate product id: ${p.id}`); process.exit(1); }
  seen.add(p.id);
}

const w = {}; new Function('window', await readFile('assets/js/icons.js', 'utf8'))(w);
let wa = '2349012739299';
try { wa = (await readFile('assets/js/site-config.js', 'utf8')).match(/whatsapp:\s*"(\d+)"/)?.[1] || wa; } catch {}

const card = (p) => {
  const orig = p.originalPrice > p.price ? `<span class="original">$${esc(p.originalPrice)}</span>` : '';
  const tag = p.tag ? `<span class="product-tag ${esc(p.tagStyle)}">${esc(p.tag)}</span>` : '';
  const feats = (p.features || []).map((f) => `<li><i class="fas fa-check" style="color:var(--accent);margin-right:.3rem" aria-hidden="true"></i> ${esc(f)}</li>`).join('');
  const msg = encodeURIComponent(`Hi, I want to buy "${p.name}" ($${p.price}). Please send payment details.`);
  return `        <article class="card product-card" data-category="${esc(p.category)}">
          <div class="product-image" style="color:var(--accent-light,#e8cd7a)">${w.VRIcons.svg(p.icon || 'globe', '3.4rem')}</div>
          <div class="product-body">
            ${tag}<h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
            <div class="product-price">$${esc(p.price)} ${orig}</div>
            <ul style="list-style:none;font-size:.85rem;color:var(--text-muted);margin-bottom:1rem">${feats}</ul>
            <div class="product-actions"><a class="btn btn-primary buy-now-btn" data-id="${esc(p.id)}" href="https://wa.me/${wa}?text=${msg}" target="_blank" rel="noopener">Buy Now — $${esc(p.price)}</a></div>
          </div></article>`;
};

const html = await readFile('store/index.html', 'utf8');
const block = `<!-- products:start -->\n${products.map(card).join('\n')}\n        <!-- products:end -->`;
let out;
if (html.includes('<!-- products:start -->')) out = html.replace(/<!-- products:start -->[\s\S]*?<!-- products:end -->/, () => block);
else out = html.replace(/(<div class="card-grid" id="products-grid"[^>]*>)[\s\S]*?(<\/div>\s*\n\s*<!-- Guarantee Banner -->)/, (m, a, b) => `${a}\n        ${block}\n      ${b}`);
if (out === html && !html.includes('<!-- products:start -->')) { console.error('Could not find the product grid in store/index.html.'); process.exit(1); }
await writeFile('store/index.html', out);
console.log(`Store pre-rendered with ${products.length} product(s).`);
