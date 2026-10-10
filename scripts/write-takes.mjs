// Fills the empty "VR take" on new stories using your Cloudflare Worker (task "rewrite", mode "take").
// Needs two GitHub Actions values: secret VR_NEWS_KEY (same as the Worker's NEWS_KEY secret) and variable or secret VR_WORKER_URL.
// With either missing it does nothing, so the news run still works. Takes are flagged takeAI so the site can label them.
import { readFile, writeFile } from 'node:fs/promises';
import { parsePosts } from './lib-posts.mjs';
const URL_ = process.env.VR_WORKER_URL, KEY = process.env.VR_NEWS_KEY, MAX = 20;
if (!URL_ || !KEY) { console.log('write-takes: VR_WORKER_URL or VR_NEWS_KEY not set, skipping.'); process.exit(0); }
const POSTS = 'blog/posts.json';
const posts = parsePosts(await readFile(POSTS, 'utf8'));
let n = 0;
for (const p of posts) {
  if (n >= MAX) break;
  if (p.take || (Array.isArray(p.body) && p.body.length) || !['news', 'business', 'startups'].includes(p.kind || 'news')) continue;
  if (!p.excerpt || p.excerpt.length < 40) continue;
  try {
    const res = await fetch(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-VR-Key': KEY }, body: JSON.stringify({ task: 'rewrite', mode: 'take', title: p.title, text: p.excerpt, context: p.source }), signal: AbortSignal.timeout(30000) });
    const j = await res.json();
    const t = j && j.ok && j.data && j.data.result && j.data.result[0];
    if (t && t.length > 30 && t.length < 600) { p.take = t.trim(); p.takeAI = true; n++; }
  } catch (e) { console.warn('write-takes: skipped one story:', e.message); }
}
if (n) await writeFile(POSTS, JSON.stringify(posts, null, 2) + '\n');
console.log(`write-takes: added ${n} takes`);
