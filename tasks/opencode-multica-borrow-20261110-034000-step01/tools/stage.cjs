// Stage ONLY this task's changes into the real index without touching other dialogues' uncommitted work.
// Overlapping files (modules.json, scripts/sync-shared.cjs) are staged as "HEAD + our hunk" blobs via
// git hash-object + update-index; everything else is git add by explicit path. Usage: node stage.cjs <msg-file>
const cp = require('child_process'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../../..');
const git = (args, input) => cp.execFileSync('git', ['-c', 'core.pager=cat', ...args], { cwd: root, input, encoding: 'utf8', maxBuffer: 64 << 20 });
const stageBlob = (rel, content) => { const sha = git(['hash-object', '-w', '--stdin'], content).trim(); git(['update-index', '--cacheinfo', `100644,${sha},${rel}`]); };
// 1) modules.json: HEAD + multica/* entries (placed after the last see-now/multica entry, as sync-shared does).
{ const rel = 'recovered/esm/000-extension.js/modules.json';
  const headRaw = git(['show', `HEAD:${rel}`]), head = JSON.parse(headRaw), wt = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  for (const m of wt.modules.filter((x) => x.file.startsWith('multica/'))) {
    if (head.modules.some((x) => x.file === m.file)) continue;
    let at = -1; head.modules.forEach((x, i) => { if (/^(see-now|multica)\//.test(x.file)) at = i; });
    head.modules.splice(at < 0 ? head.modules.length : at + 1, 0, m);
  }
  stageBlob(rel, JSON.stringify(head, null, 2) + (headRaw.endsWith('\n') ? '\n' : '')); }
// 2) scripts/sync-shared.cjs: HEAD + our multica block (the two lines that mention recovered/shared/multica).
{ const rel = 'scripts/sync-shared.cjs';
  const head = git(['show', `HEAD:${rel}`]);
  if (!head.includes('recovered/shared/multica')) {
    const wtLines = fs.readFileSync(path.join(root, rel), 'utf8').split('\n');
    const i = wtLines.findIndex((l) => l.includes('// multica (')); const ours = wtLines.slice(i, i + 2);
    if (i < 0 || !ours[1].includes('recovered/shared/multica')) throw new Error('multica block not found in worktree sync-shared.cjs');
    const lines = head.split('\n'); const j = lines.findIndex((l) => l.includes("recovered/shared/see-now'"));
    lines.splice(j + 1, 0, ...ours); stageBlob(rel, lines.join('\n'));
  } }
// 3) our own paths.
const T = path.basename(path.resolve(__dirname, '..'));
const own = ['recovered/shared/multica', 'recovered/esm/000-extension.js/multica', 'recovered/esm/000-extension.js/module-0119.mjs',
  'scripts/test-multica-borrow.mjs', 'docs/multica-borrow.md', `tasks/${T}`, `.ai-workflow/logs/${T}.jsonl`, `.ai-workflow/index/${T}.json`].filter((p) => fs.existsSync(path.join(root, p)));
git(['add', '--', ...own]);
console.log(git(['diff', '--cached', '--stat']));
const extra = git(['diff', '--cached', '--name-only']).split('\n').filter(Boolean).filter((f) => !own.some((o) => f === o || f.startsWith(o + '/')) && !['recovered/esm/000-extension.js/modules.json', 'scripts/sync-shared.cjs'].includes(f));
if (extra.length) { console.log('UNEXPECTED STAGED:', extra.join(', ')); process.exit(3); }
// No global git identity on this host: reuse the author of the current HEAD commit (local commit only).
const ident = () => { try { git(['config', 'user.email']); return []; } catch { const [n, e] = git(['log', '-1', '--format=%an%x00%ae']).trim().split('\0'); return ['-c', `user.name=${n}`, '-c', `user.email=${e}`]; } };
if (process.argv[2]) { console.log(git([...ident(), 'commit', '-q', '-F', process.argv[2]])); console.log(git(['log', '--oneline', '-1'])); }
