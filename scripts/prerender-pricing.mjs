// Bakes the pricing cards into pricing/index.html so they show without JavaScript (SEO, slow phones, link previews).
// Run after editing assets/js/pricing-data.js:  node scripts/prerender-pricing.mjs
import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const src = await readFile('assets/js/pricing-data.js', 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + '\nthis.__D = PRICING_DATA;', ctx);
const DATA = ctx.__D;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WA = '2349012739299';

const html = Object.entries(DATA).map(([key, svc]) => `
      <div class="service-category" style="margin-bottom:4rem">
        <div class="section-header">
          <h2><span class="card-icon" data-icon="${esc(svc.icon)}"></span> ${esc(svc.title)}</h2>
          <p>${esc(svc.description)}</p>
        </div>
        <div class="card-grid pricing-grid" id="grid-${esc(key)}">${svc.tiers.map((t) => {
          const wa = encodeURIComponent(`Hi, I'm interested in your ${t.name} ${svc.title} package ($${t.usd}). Can we discuss?`);
          const tg = encodeURIComponent(`${t.name} ${svc.title}`);
          return `
          <div class="card pricing-card${t.popular ? ' featured' : ''}">
            <h3>${esc(t.name)}</h3>
            <p>${esc(t.description)}</p>
            <div class="price" data-usd="${t.usd}">$${t.usd}</div>
            <ul class="features-list">${t.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
            <div style="display:flex;flex-direction:column;gap:.75rem;margin-top:auto">
              <a class="btn btn-secondary btn-sm" href="https://wa.me/${WA}?text=${wa}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp" aria-hidden="true"></i> Chat on WhatsApp</a>
              <a class="btn btn-secondary btn-sm" href="https://t.me/vibrantrevolve?start=${tg}" target="_blank" rel="noopener noreferrer"><i class="fab fa-telegram" aria-hidden="true"></i> Chat on Telegram</a>
              <a class="btn btn-primary btn-sm" href="/payment/?service=${encodeURIComponent(t.name + ' ' + svc.title)}&amp;amount=${t.usd}&amp;currency=usd" onclick="return preparePayment('${esc((t.name + ' ' + svc.title).replace(/'/g, "\\'"))}', ${t.usd})"><i class="fas fa-credit-card" aria-hidden="true"></i> Pay Now</a>
            </div>
          </div>`;
        }).join('')}
        </div>
      </div>`).join('\n');

const page = await readFile('pricing/index.html', 'utf8');
const start = '<!-- prerender:start -->', end = '<!-- prerender:end -->';
let out;
if (page.includes(start)) out = page.replace(new RegExp(start + '[\\s\\S]*?' + end), start + html + '\n      ' + end);
else out = page.replace(/(<section id="pricing-container"[^>]*>)[\s\S]*?(<\/section>)/, `$1\n      ${start}${html}\n      ${end}\n    $2`);
await writeFile('pricing/index.html', out);
console.log('Pricing prerendered:', Object.keys(DATA).length, 'categories');
