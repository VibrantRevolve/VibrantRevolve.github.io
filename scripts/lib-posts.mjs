// Reads blog/posts.json even if a git merge left conflict markers in it or the file was cut off.
// It keeps every complete post from both sides of a conflict and drops duplicates (same id or url).
export function parsePosts(text) {
  let t = String(text || '').replace(/^(<<<<<<<|=======|>>>>>>>).*$/gm, '').trim();
  const joined = t.replace(/\]\s*\[/g, ',');
  let arr = null;
  for (const s of [t, joined]) { try { const v = JSON.parse(s); if (Array.isArray(v)) { arr = v; break; } } catch {} }
  if (!arr) {            // file cut off in the middle: keep every complete post before the break
    let i = joined.length, n = 0;
    while (!arr && (i = joined.lastIndexOf('\n  }', i - 1)) > 0 && n++ < 600) { try { const v = JSON.parse(joined.slice(0, i + 4) + ']'); if (Array.isArray(v)) arr = v; } catch {} }
  }
  const seen = new Set(), out = [];
  for (const p of arr || []) { if (!p || typeof p !== 'object') continue; const k = p.id || p.url; if (!k || seen.has(k)) continue; seen.add(k); out.push(p); }
  return out;
}
