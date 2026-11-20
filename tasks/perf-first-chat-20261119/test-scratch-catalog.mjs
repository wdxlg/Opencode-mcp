// 增量目录与全量重扫结果一致；读目录不触发全量重扫。
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import * as pm from '../../recovered/shared/project-memory.mjs';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oc-scratch-'));
const mk = (kind, id, n) => { const b = pm.resolveScratchBucketDir(root, { scratchId: kind === 'topic' ? '' : id, topic: kind === 'topic' ? id : '' }); pm.ensureMemoryDir?.(b.dir); for (let i = 0; i < n; i++) pm.appendNote(b.dir, `note ${id} ${i}`, 'test'); return b; };
const bs = []; for (let i = 0; i < 40; i++) bs.push(mk('session', `sess-t${i}`, i % 3));
bs.push(mk('topic', 'alpha', 2));
const full1 = pm.syncScratchCatalog(root).buckets.map(b => b.id + ':' + b.entry_count);
// 写入一个原本为空的桶，增量更新
await new Promise(r => setTimeout(r, 20));
pm.appendNote(bs[0].dir, 'new note', 'test');
const inc = pm.syncScratchCatalog(root, { bucketId: bs[0].bucketId, title: bs[0].bucketId }).buckets.map(b => b.id + ':' + b.entry_count);
const read = pm.readScratchCatalog(root).buckets.map(b => b.id + ':' + b.entry_count);
const full2 = pm.syncScratchCatalog(root).buckets.map(b => b.id + ':' + b.entry_count);
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
let ok = same(inc, full2) && same(read, full2) && !same(full1, full2) && inc[0].startsWith(bs[0].bucketId);
const list = pm.listScratchBuckets(root, { limit: 5 }); ok = ok && list.buckets.length === 5 && !('dir' in list.buckets[0]);
console.log(JSON.stringify({ full1: full1.length, full2: full2.length, inc0: inc[0], ok }));
fs.rmSync(root, { recursive: true, force: true }); process.exit(ok ? 0 : 1);
