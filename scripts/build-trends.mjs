// Builds assets/data/trends.json: what Nigerian/African tech & business news is talking about right now.
// Source: headlines already collected in blog/posts.json (public RSS feeds). No scraping of search engines.
import fs from 'node:fs';
const posts = JSON.parse(fs.readFileSync('blog/posts.json', 'utf8'));
const DAY = 864e5, now = Date.now();
const recent = posts.filter((p) => p.kind !== 'guide' && now - Date.parse(p.date) < 10 * DAY);
const use = recent.length >= 8 ? recent : posts.filter((p) => p.kind !== 'guide').slice(0, 30);
const STOP = new Set('a an and are as at be by for from has have how in into is it its of on or that the this to was will with what why who when your you our new says say could more most than after over about their they can not but all one out up why how now week weekly daily report reports first year years top best get gets set launch launches launched announces announced raises raised plans plan bank africa african nigeria nigerian startup startups company companies business digital tech'.split(' '));
const words = (t) => t.replace(/[’']s\b/g, '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
const score = new Map(), eg = new Map(), docs = new Map();
const bump = (k, p, w) => { (docs.get(k) || docs.set(k, new Set()).get(k)).add(p.id); score.set(k, (score.get(k) || 0) + w); if (!eg.has(k)) eg.set(k, p); };
for (const p of use) {
  const age = Math.max(0, (now - Date.parse(p.date)) / DAY), w = 1 / (1 + age / 4), ws = words(p.title);
  new Set(ws).forEach((x) => bump(x, p, w));
  for (const m of p.title.matchAll(/\b([A-Z][A-Za-z0-9]{2,}(?:\s[A-Z][A-Za-z0-9]{2,}){0,2})\b/g)) { const e = m[1].toLowerCase(); if (!STOP.has(e) && !e.split(' ').every((x) => STOP.has(x))) bump(e, p, w * 1.8); }
  if (p.tag) bump(p.tag.toLowerCase(), p, w * 0.8);
}
const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const rows = [...score.entries()].filter(([k, v]) => v >= 1.2 && (docs.get(k).size >= 2 || k.includes(' '))).sort((a, b) => b[1] - a[1]);
const topics = []; const seen = new Set();
for (const [k, v] of rows) {
  if (k.split(' ').some((x) => seen.has(x)) && !k.includes(' ')) continue;
  k.split(' ').forEach((x) => seen.add(x));
  const p = eg.get(k); topics.push({ topic: cap(k), hashtag: '#' + cap(k).replace(/[^A-Za-z0-9]/g, ''), score: +v.toFixed(2), headline: p.title, source: p.source, url: p.url });
  if (topics.length >= 14) break;
}
const tags = [...new Set(use.map((p) => p.tag).filter(Boolean))].slice(0, 8);
fs.mkdirSync('assets/data', { recursive: true });
fs.writeFileSync('assets/data/trends.json', JSON.stringify({ updated: new Date().toISOString(), basedOn: use.length, topics, tags }, null, 1));
console.log('trends:', topics.length, 'topics from', use.length, 'headlines');
