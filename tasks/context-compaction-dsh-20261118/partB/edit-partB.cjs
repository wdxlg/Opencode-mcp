// context-compaction-dsh PART B (compaction): all-or-nothing edits with exact-match asserts (\r?\n tolerant), originals backed up first.
// Usage: node edit-partB.cjs <root> <backupDir> <partB-edits.json> [--dry]
const fs = require('fs'), path = require('path');
const [root, bak, specFile, dry] = process.argv.slice(2);
const edits = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const files = [...new Set(edits.map((e) => e.file))];
const orig = {}, next = {};
for (const f of files) orig[f] = next[f] = fs.readFileSync(path.join(root, f), 'utf8');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const [i, e] of edits.entries()) {
  const s = next[e.file];
  const re = new RegExp(e.old.split('\n').map(esc).join('\\r?\\n'), 'g');
  const m = [...s.matchAll(re)];
  if (m.length !== 1) throw Error(`edit #${i} ${e.file}: expected 1 match, found ${m.length}: ${e.old.slice(0, 120)}`);
  const at = m[0].index, txt = m[0][0];
  let eol = txt.includes('\r\n') ? '\r\n' : txt.includes('\n') ? '\n' : (s.slice(at + txt.length, at + txt.length + 2) === '\r\n' ? '\r\n' : '\n');
  next[e.file] = s.slice(0, at) + e.new.split('\n').join(eol) + s.slice(at + txt.length);
}
for (const f of files) if (f.endsWith('.json')) JSON.parse(next[f]);
if (dry === '--dry') { console.log('dry-run OK', edits.length, 'edits on', files.length, 'files'); process.exit(0); }
for (const f of files) {
  const b = path.join(bak, f);
  if (!fs.existsSync(b)) { fs.mkdirSync(path.dirname(b), { recursive: true }); fs.writeFileSync(b, orig[f]); console.log('backup', b); }
  else console.log('backup exists (kept)', b);
}
for (const f of files) { fs.writeFileSync(path.join(root, f), next[f]); console.log('wrote', f, orig[f].length, '->', next[f].length); }
