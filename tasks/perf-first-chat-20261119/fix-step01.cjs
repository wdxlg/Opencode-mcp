// perf-first-chat step01: 临时桶目录不再在每轮对话 / 每次写入时全量重扫（3500 个桶约 25 秒同步 IO，卡住扩展宿主）。
// 读：用 CATALOG.json；写：只重算被写的那个桶；全量重扫只在目录缺失、删除、清理空桶时做。
const fs=require('fs');const P='recovered/shared/project-memory.mjs',A='recovered/shared/automation-store.mjs';
let s=fs.readFileSync(P,'utf8'),a=fs.readFileSync(A,'utf8');
const rep=(src,from,to,n=1)=>{const c=src.split(from).length-1;if(c!==n)throw Error(`anchor x${c} (want ${n}): ${from.slice(0,80)}`);return src.split(from).join(to);};
// 1. syncScratchCatalog：带 bucketId 且已有目录时增量更新
s=rep(s,`export function syncScratchCatalog(scratchRoot, updatedInfo = null) {
  const rootResolved = validateTargetPath(scratchRoot);`,`function scratchCatalogItemDir(rootResolved, item) {
  if (!item?.id) return '';
  if (item.kind === 'legacy') return rootResolved;
  return path.join(rootResolved, item.kind === 'topic' ? 'topics' : 'sessions', item.id);
}

function loadScratchCatalogFile(rootResolved) {
  try {
    const cat = JSON.parse(fs.readFileSync(path.join(rootResolved, 'CATALOG.json'), 'utf8'));
    if (cat?.schema !== 1 || !Array.isArray(cat.buckets)) return null;
    return cat.buckets.filter(item => item?.id).map(item => ({ ...item, dir: scratchCatalogItemDir(rootResolved, item) }));
  } catch {
    return null;
  }
}

// perf-first-chat step01: 只读目录。CATALOG.json 由每次写入增量维护；缺失或损坏时才全量重扫。
export function readScratchCatalog(scratchRoot) {
  const rootResolved = validateTargetPath(scratchRoot);
  const buckets = loadScratchCatalogFile(rootResolved);
  if (buckets) return { scratch_root: rootResolved, buckets };
  return syncScratchCatalog(scratchRoot);
}

function scratchBucketDirs(item) {
  if (Array.isArray(item?.dirs) && item.dirs.length) return item.dirs;
  if (!item?.dir) return [];
  try {
    return [item.dir, ...listActorTaskDirs(item.dir, 50).map(t => t.dir)];
  } catch {
    return [item.dir];
  }
}

export function syncScratchCatalog(scratchRoot, updatedInfo = null) {
  const rootResolved = validateTargetPath(scratchRoot);
  // perf-first-chat step01: 写入某个桶后只重算这个桶，合并进现有目录。
  if (updatedInfo?.bucketId) {
    const existing = loadScratchCatalogFile(rootResolved);
    if (existing) return updateScratchCatalogBucket(rootResolved, existing, updatedInfo);
  }`);
s=rep(s,`export function listScratchBuckets(scratchRoot, { excludeBucketId = '', limit = 20 } = {}) {
  const { scratch_root, buckets } = syncScratchCatalog(scratchRoot);`,`function updateScratchCatalogBucket(rootResolved, existing, updatedInfo) {
  const id = String(updatedInfo.bucketId);
  const old = existing.find(item => item.id === id);
  const kind = old?.kind || (fs.existsSync(path.join(rootResolved, 'topics', id)) ? 'topic' : 'session');
  const dir = kind === 'legacy' ? rootResolved : path.join(rootResolved, kind === 'topic' ? 'topics' : 'sessions', id);
  let info = null;
  try {
    if (fs.existsSync(dir)) info = inspectScratchBucket(dir, { bucketId: id, kind, title: updatedInfo.title || old?.title || id });
  } catch {}
  const buckets = existing.filter(item => item.id !== id);
  if (info) buckets.push(info);
  buckets.sort((a, b) => (b.updated_ms - a.updated_ms) || (b.revision - a.revision));
  const trimmed = buckets.slice(0, 100).map(({ dir: _dir, dirs: _dirs, ...publicItem }) => publicItem);
  writeAtomic(path.join(rootResolved, 'CATALOG.json'), JSON.stringify({ schema: 1, engine: MEMORY_ENGINE_VERSION, updatedAt: nowIso(), buckets: trimmed }, null, 2) + '\\n');
  return { scratch_root: rootResolved, buckets: buckets.slice(0, 100) };
}

export function listScratchBuckets(scratchRoot, { excludeBucketId = '', limit = 20 } = {}) {
  const { scratch_root, buckets } = readScratchCatalog(scratchRoot);`);
// 2. 检索与工作区视图：读目录，需要时再展开桶内执行者目录
s=rep(s,`  const { buckets } = syncScratchCatalog(scratchRoot);
  const targets = (excludeBucketId ? buckets.filter(b => b.id !== excludeBucketId) : buckets).slice(0, 30);`,`  const { buckets } = readScratchCatalog(scratchRoot);
  const targets = (excludeBucketId ? buckets.filter(b => b.id !== excludeBucketId) : buckets).slice(0, 30).map(b => ({ ...b, dirs: scratchBucketDirs(b) }));`);
s=rep(s,`        for (const b of syncScratchCatalog(scratchRoot).buckets.slice(0, 30)) {
          for (const d of (b.dirs?.length ? b.dirs : [b.dir])) add(d, \`scratch:\${b.id}\`, 0.7, 'scratch');`,`        for (const b of readScratchCatalog(scratchRoot).buckets.slice(0, 30)) {
          for (const d of scratchBucketDirs(b)) add(d, \`scratch:\${b.id}\`, 0.7, 'scratch');`);
// 3. automation-store 的三处写入：只更新被写的桶
a=rep(a,`if(target.isScratch)syncScratchCatalog(target.scratchRoot);`,`if(target.isScratch)syncScratchCatalog(target.scratchRoot,{bucketId:target.bucketId,title:target.bucketTitle||target.bucketId});`,3);
fs.writeFileSync(P,s);fs.writeFileSync(A,a);console.log('patched');
