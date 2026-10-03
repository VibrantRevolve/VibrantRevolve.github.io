// Collects fresh items from RSS/Atom feeds and prepends them to blog/posts.json.
// Only a short excerpt and a link back to the source are stored (no full articles).
// Run by .github/workflows/news.yml, which opens a pull request for review.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const cfg = JSON.parse(await readFile('scripts/feeds.json', 'utf8'));
const POSTS = 'blog/posts.json';
let posts = [];
try { posts = JSON.parse(await readFile(POSTS, 'utf8')); } catch {}
const seen = new Set(posts.map((p) => p.url));

const clean = (s = '') => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, "'").replace(/&#8220;|&#8221;|&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

const field = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
};

export function parseFeed(xml) {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.map((b) => {
    const href = (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1];
    const url = clean(field(b, 'link')) || href || '';
    return {
      title: clean(field(b, 'title')),
      url,
      date: clean(field(b, 'pubDate') || field(b, 'published') || field(b, 'updated')),
      text: clean(field(b, 'description') || field(b, 'summary') || field(b, 'content'))
    };
  }).filter((i) => i.title && /^https?:\/\//.test(i.url));
}

const short = (t, n = 220) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + '…');
const found = [];
const day = 86400000;

for (const feed of cfg.feeds) {
  const kind = feed.kind || 'news';
  try {
    const res = await fetch(feed.url, { headers: { 'user-agent': 'VibrantRevolve-news-bot' }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(res.status);
    for (const it of parseFeed(await res.text()).slice(0, 10)) {
      if (seen.has(it.url)) continue;
      const d = new Date(it.date);
      const when = isNaN(d) ? new Date() : d;
      if (Date.now() - when.getTime() > (cfg.maxAgeDays?.[kind] ?? 10) * day) continue; // too old
      const hay = ` ${it.title} ${it.text} `.toLowerCase();
      let tag, cta;
      if (kind === 'grants') {
        if (!cfg.grantKeywords.some((k) => hay.includes(k))) continue;
        tag = 'Grants & Funding'; cta = cfg.grantCta;
      } else {
        const rule = cfg.rules.find((r) => r.keywords.some((k) => hay.includes(k)));
        if (!rule && !feed.acceptAll) continue; // keep only relevant items from general feeds
        tag = rule ? rule.tag : 'Tech News'; cta = rule ? rule.cta : cfg.defaultNewsCta;
      }
      found.push({
        id: createHash('sha1').update(it.url).digest('hex').slice(0, 10),
        title: it.title, url: it.url, source: feed.name, kind,
        date: when.toISOString(), excerpt: short(it.text), tag, cta, take: ''
      });
      seen.add(it.url);
    }
  } catch (e) {
    console.warn(`Skipped ${feed.name}: ${e.message}`);
  }
}

found.sort((a, b) => b.date.localeCompare(a.date));
const fresh = [];
for (const kind of ['news', 'grants']) {
  fresh.push(...found.filter((f) => f.kind === kind).slice(0, cfg.maxNewPerRun?.[kind] ?? 3));
}
if (fresh.length) {
  const merged = [...fresh, ...posts].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 200);
  await writeFile(POSTS, JSON.stringify(merged, null, 2) + '\n');
}
console.log(`Added ${fresh.length} post(s): ${fresh.filter((f) => f.kind === 'grants').length} grants, ${fresh.filter((f) => f.kind === 'news').length} news.`);
