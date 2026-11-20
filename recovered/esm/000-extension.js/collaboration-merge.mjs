// Local, explicit Git integration. No model, network, test, install, reset, or push.
// Merge conflicts are detected in Git's object database before touching the target worktree.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { digest, fail } from './collaboration-contracts.mjs';
import { canonicalPath, withinRoot, git } from './collaboration-workspaces.mjs';

const MAX_FILES = 1000, MAX_FILE = 128 * 1024 * 1024, MAX_TOTAL = 512 * 1024 * 1024;
const OID = /^[a-f0-9]{40,64}$/;
const parts = text => text.split('\0').filter(Boolean);
const unique = values => [...new Set(values)].sort();
const samePath = (a, b) => canonicalPath(a) === canonicalPath(b);
function opts(service, extra = {}) {
  return { executable: service.options.gitExecutable, hooksPath: '/dev/null', safeEnv: true, maxBuffer: 16 * 1024 * 1024, ...extra };
}
async function run(service, root, args, extra = {}) {
  return git(root, ['-c', 'merge.renormalize=false', '-c', 'commit.gpgsign=false', ...args], opts(service, extra));
}
async function noCustomMergeDrivers(service, root) {
  try {
    const names = await run(service, root, ['config', '--name-only', '--get-regexp', '^merge\\..*\\.driver$']);
    if (names.trim()) fail('MERGE_CUSTOM_DRIVER', '检测到外部 Git merge driver 配置。为避免执行用户程序，本入口拒绝合并；请人工处理。');
  } catch (error) { if (error.code !== 1) throw error; }
}
async function requireNormalIndex(service, root) {
  const flags = parts(await run(service, root, ['ls-files', '-v', '-z']));
  if (flags.some(entry => entry[0] === 'S' || /^[a-z]/.test(entry))) fail('MERGE_INDEX_FLAGS', 'Git 索引含 skip-worktree 或 assume-unchanged 标记，不能可靠判断工作区是否干净；请人工核对。');
}
async function requireNoGitOperation(service, root) {
  for (const name of ['MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','REBASE_HEAD','rebase-merge','rebase-apply','sequencer']) {
    const location = (await run(service, root, ['rev-parse', '--git-path', name])).trim();
    if (location && fs.existsSync(path.resolve(root, location))) fail('MERGE_OPERATION_ACTIVE', '仓库已有合并、变基或其他进行中的 Git 操作；不会继续。');
  }
}
async function headInfo(service, root) {
  const top = (await run(service, root, ['rev-parse', '--show-toplevel'])).trim();
  if (!samePath(top, root)) fail('MERGE_ROOT_REQUIRED', '所选工作区必须是 Git 仓库根目录。');
  const head = (await run(service, root, ['rev-parse', '--verify', 'HEAD^{commit}'])).trim();
  if (!OID.test(head)) fail('MERGE_HEAD_INVALID', '无法确认当前 Git 提交。');
  let branch;
  try { branch = (await run(service, root, ['symbolic-ref', '--quiet', '--short', 'HEAD'])).trim(); }
  catch { fail('MERGE_DETACHED', '目标必须检出本地分支；不在 detached HEAD 上自动更新。'); }
  await requireNormalIndex(service, root);
  const status = await run(service, root, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none', '--', '.']);
  if (status) fail('MERGE_TARGET_DIRTY', '目标有暂存、未暂存、未跟踪或子模块改动；请先由用户处理，合并不会覆盖或清理。');
  await requireNoGitOperation(service, root);
  await noCustomMergeDrivers(service, root);
  return { root, branch, head };
}
export async function listLocalBranches(service, root) {
  const target = await headInfo(service, root);
  const raw = await run(service, root, ['for-each-ref', '--format=%(refname)%00%(objectname)%00', 'refs/heads/']);
  const tokens = raw.split('\0'), result = [];
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    const ref = tokens[i].replace(/^[\r\n]+/, ''), head = tokens[i + 1].trim();
    if (ref.startsWith('refs/heads/') && OID.test(head)) result.push({ ref, name: ref.slice('refs/heads/'.length), head });
  }
  if (result.length > MAX_FILES) fail('MERGE_BRANCH_LIMIT', '本地分支超过 1000 个；请先缩小范围。');
  return { target, branches: result };
}
function statusPaths(raw) {
  const values = raw.split('\0'), output = [];
  for (let i = 0; i < values.length && values[i]; i++) {
    const record = values[i];
    if (record.length < 4 || record[2] !== ' ') fail('MERGE_STATUS_INVALID', 'Git 状态格式无法确认。');
    const xy = record.slice(0, 2);
    if (xy.includes('U') || ['AA', 'DD'].includes(xy)) fail('MERGE_SOURCE_CONFLICT', '来源副本含未解决冲突，不能制作合并快照。');
    output.push({ status: xy, path: record.slice(3), untracked: xy === '??' });
    if (xy.includes('R') || xy.includes('C')) {
      if (!values[i + 1]) fail('MERGE_STATUS_INVALID', '重命名来源路径不完整。');
      output.push({ status: xy, path: values[++i], untracked: false });
    }
  }
  if (output.length > MAX_FILES) fail('MERGE_FILE_LIMIT', '来源变更超过 1000 个路径；请拆分后处理。');
  return output;
}
function validateRelative(root, rel) {
  if (typeof rel !== 'string' || !rel || rel.includes('\0') || path.isAbsolute(rel) || rel.split(/[\\/]/).some(part => !part || part === '..' || part.toLowerCase() === '.git')) fail('MERGE_PATH_INVALID', '变更包含不安全的相对路径。');
  const full = path.resolve(root, rel);
  if (!withinRoot(path.dirname(full), root)) fail('MERGE_PATH_OUTSIDE', '变更路径的父目录越出工作副本。');
  return full;
}
async function hashWorkingFiles(root, entries) {
  let total = 0; const output = [];
  for (const rel of unique(entries.map(item => item.path))) {
    const full = validateRelative(root, rel); let st;
    try { st = await fsp.lstat(full); } catch (error) { if (error.code === 'ENOENT') { output.push({ path: rel, missing: true }); continue; } throw error; }
    if (st.isSymbolicLink()) fail('MERGE_SYMLINK_UNSUPPORTED', '来源含符号链接，无法在此入口安全预览；请人工处理：' + rel);
    if (!st.isFile()) fail('MERGE_FILE_UNSUPPORTED', '来源包含目录、嵌套仓库或特殊文件；请人工处理：' + rel);
    if (st.size > MAX_FILE || (total += st.size) > MAX_TOTAL) fail('MERGE_SIZE_LIMIT', '未提交文件超过每个 128 MiB／合计 512 MiB 的本地预览上限。');
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(full)) hash.update(chunk);
    output.push({ path: rel, bytes: st.size, sha256: hash.digest('hex') });
  }
  return output;
}
async function verifyTaskWorktree(service, source, target) {
  const plan = source.plan;
  if (plan?.mode !== 'worktree' || !plan.root || !plan.sourceRoot || !OID.test(plan.baseRef || '') || !plan.branch) fail('MERGE_TASK_WORKTREE_REQUIRED', '只有已建立独立 Git 工作副本和有效基线的执行尝试可以使用任务合并。');
  if (!withinRoot(plan.root, source.worktreeHome) || samePath(plan.root, source.worktreeHome) || !samePath(plan.sourceRoot, target.root) || samePath(plan.root, target.root)) fail('MERGE_TASK_SCOPE', '工作副本不属于本任务的受控目录或所选项目。');
  const top = (await run(service, plan.root, ['rev-parse', '--show-toplevel'])).trim();
  const branch = (await run(service, plan.root, ['symbolic-ref', '--short', 'HEAD'])).trim();
  const common = (await run(service, plan.root, ['rev-parse', '--git-common-dir'])).trim();
  const targetCommon = (await run(service, target.root, ['rev-parse', '--git-common-dir'])).trim();
  if (!samePath(top, plan.root) || branch !== plan.branch || !samePath(path.resolve(plan.root, common), path.resolve(target.root, targetCommon))) fail('MERGE_TASK_WORKTREE_CHANGED', '任务工作副本、分支或 Git 目录已变化，拒绝合并。');
  await noCustomMergeDrivers(service, plan.root);
  await requireNormalIndex(service, plan.root);
  await requireNoGitOperation(service, plan.root);
  const head = (await run(service, plan.root, ['rev-parse', '--verify', 'HEAD^{commit}'])).trim();
  if (!OID.test(head)) fail('MERGE_HEAD_INVALID', '无法确认任务分支提交。');
  const raw = await run(service, plan.root, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none', '--', '.']);
  const entries = statusPaths(raw), artifacts = source.artifacts || [];
  if (!Array.isArray(artifacts) || artifacts.length > MAX_FILES) fail('MERGE_ARTIFACT_INVALID', '交付产物记录不可用或数量过多。');
  const tracked = new Set(parts(await run(service, plan.root, ['ls-files', '-z', '--', '.']))), untracked = new Set(entries.filter(item => item.untracked).map(item => item.path));
  for (const artifact of artifacts) {
    if (!artifact || typeof artifact.relativePath !== 'string' || !/^[a-f0-9]{64}$/.test(artifact.sha256 || '')) fail('MERGE_ARTIFACT_INVALID', '产物路径或提交时哈希无效。');
    validateRelative(plan.root, artifact.relativePath);
    if (!tracked.has(artifact.relativePath) && !untracked.has(artifact.relativePath)) fail('MERGE_ARTIFACT_IGNORED', '交付产物未被 Git 跟踪且不在可纳入的未跟踪文件中（可能被忽略）；不会声称已合并：' + artifact.relativePath);
  }
  const hashes = await hashWorkingFiles(plan.root, [...entries, ...artifacts.map(item => ({path:item.relativePath}))]);
  for (const artifact of artifacts) {
    const actual = hashes.find(item => item.path === artifact.relativePath);
    if (!actual || actual.missing || actual.sha256 !== artifact.sha256 || actual.bytes !== artifact.bytes) fail('MERGE_ARTIFACT_CHANGED', '工作副本中的交付产物与提交时哈希或大小不一致：' + artifact.relativePath);
  }
  // Completion-time Git diff is a preserved snapshot, not the current worktree.
  const stored = source.savedDiff;
  if (!stored?.available || stored.partial || stored.scope === 'recorded-patches') fail('MERGE_SNAPSHOT_UNAVAILABLE', '没有完整的提交时 Git 差异，不能以它证明当前工作副本。');
  const currentText = await run(service, plan.root, ['diff', '--relative', '--no-ext-diff', '--no-textconv', '--binary', plan.baseRef, '--', '.']);
  const currentUntracked = (await run(service, plan.root, ['ls-files', '--others', '--exclude-standard', '--', '.'])).split(/\r?\n/).filter(Boolean);
  if (currentText !== stored.text || JSON.stringify(currentUntracked) !== JSON.stringify(stored.untracked || [])) fail('MERGE_DELIVERY_CHANGED', '工作副本与提交时保存的差异不一致；请重新核对和交付。');
  const artifactHashes = new Map(artifacts.map(item => [item.relativePath, item.sha256]));
  for (const entry of entries.filter(item => item.untracked)) {
    const actual = hashes.find(item => item.path === entry.path);
    if (!artifactHashes.has(entry.path) || !actual || actual.sha256 !== artifactHashes.get(entry.path)) fail('MERGE_UNTRACKED_UNRECORDED', '未跟踪文件没有匹配提交时产物哈希，不能静默纳入：' + entry.path);
  }
  return { root: plan.root, branch: plan.branch, head, entries, hashes, raw };
}
async function changedNames(service, root, a, b) {
  const text = await run(service, root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--name-only', '-z', a, b, '--']);
  const names = unique(parts(text));
  if (names.length > MAX_FILES) fail('MERGE_FILE_LIMIT', '分支变更超过 1000 个路径；请拆分后处理。');
  return names;
}
async function checkPaths(service, target, sourceRoot, names, a, b) {
  if (names.some(name => name.split('/').at(-1).toLowerCase() === '.gitattributes')) fail('MERGE_ATTRIBUTES_CHANGED', '变更包含 .gitattributes；无法安全确定过滤器和合并驱动，请人工处理。');
  for (const name of names) validateRelative(target, name);
  if (a && b) {
    const raw = await run(service, target, ['diff', '--raw', '--no-ext-diff', '--no-renames', '-z', a, b, '--']);
    if (/(?:^|\0):(?:120000|160000) |(?:^|\0):\d+ (?:120000|160000) /.test(raw)) fail('MERGE_SPECIAL_ENTRY', '分支包含符号链接或子模块 Git 条目；请人工处理。');
  }
  for (const root of unique([target, sourceRoot].filter(Boolean))) {
    for (let offset = 0; offset < names.length; offset += 100) {
      const raw = await run(service, root, ['check-attr', '-z', 'filter', '--', ...names.slice(offset, offset + 100)]);
      const tokens = raw.split('\0');
      for (let i = 0; i + 2 < tokens.length; i += 3) if (!['unspecified', 'unset'].includes(tokens[i + 2])) fail('MERGE_FILTER_UNSUPPORTED', '变更文件使用 Git filter（如 LFS），本入口不会在禁用过滤器时写入错误内容：' + tokens[i]);
    }
  }
}
export async function inspectMerge(service, root, source) {
  const target = await headInfo(service, root);
  let sourceInfo;
  if (source.kind === 'task') sourceInfo = await verifyTaskWorktree(service, source, target);
  else if (source.kind === 'branch') {
    const list = await listLocalBranches(service, root), branch = list.branches.find(item => item.ref === source.ref);
    if (!branch || branch.ref.startsWith('refs/heads/opencode/')) fail('MERGE_BRANCH_UNKNOWN', '请选择实际存在的普通本地分支；协作任务分支请从任务入口合并。');
    sourceInfo = { branch: branch.name, head: branch.head, entries: [], hashes: [], raw: '' };
  } else fail('MERGE_SOURCE_INVALID', '合并来源无效。');
  if (sourceInfo.branch === target.branch) fail('MERGE_SAME_BRANCH', '来源与目标是同一分支。');
  let base;
  try { base = (await run(service, root, ['merge-base', target.head, sourceInfo.head])).trim(); }
  catch { fail('MERGE_NO_BASE', '两个分支没有可确认的共同祖先；本入口不合并无关历史。'); }
  if (!OID.test(base)) fail('MERGE_NO_BASE', '无法确认分支共同祖先。');
  const committed = await changedNames(service, root, base, sourceInfo.head);
  const paths = unique([...committed, ...sourceInfo.entries.map(item => item.path)]);
  if (paths.length > MAX_FILES) fail('MERGE_FILE_LIMIT', '总变更超过 1000 个路径。');
  await checkPaths(service, target.root, sourceInfo.root, paths, base, sourceInfo.head);
  const fingerprint = digest({ target: { root: canonicalPath(target.root), branch: target.branch, head: target.head }, source: { kind: source.kind, root: sourceInfo.root ? canonicalPath(sourceInfo.root) : null, branch: sourceInfo.branch, head: sourceInfo.head, raw: sourceInfo.raw, hashes: sourceInfo.hashes }, base, paths });
  return { target, source: { kind: source.kind, root: sourceInfo.root || null, branch: sourceInfo.branch, head: sourceInfo.head, uncommittedCount: sourceInfo.entries.length }, base, paths, fingerprint, note: source.kind === 'task' ? '将按当前磁盘内容制作临时 Git 快照；原任务分支和暂存区不改变。忽略文件不包含。' : '仅合并该本地分支的已提交内容，不包含其他工作副本未提交的文件。' };
}
export async function executeMerge(service, root, source, preview, guard = {}) {
  const locks = [...(source.kind === 'task' ? [root, source.plan.root] : [root]), ...(guard.lockPaths || [])];
  return withResourceLocks(locks, async () => {
    let current = await inspectMerge(service, root, source);
    if (current.fingerprint !== preview.fingerprint) fail('MERGE_PREVIEW_STALE', '确认期间目标、来源或文件已变化；未执行合并，请重新预览。');
    let sourceCommit = current.source.head, tempDir;
    try {
      if (source.kind === 'task' && current.source.uncommittedCount) {
        tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'opencode-git-merge-'));
        const env = { GIT_INDEX_FILE: path.join(tempDir, 'index') };
        await run(service, source.plan.root, ['read-tree', sourceCommit], { env });
        await run(service, source.plan.root, ['add', '-A', '--', '.'], { env, timeout: 120000 });
        const tree = (await run(service, source.plan.root, ['write-tree'], { env })).trim();
        const headTree = (await run(service, source.plan.root, ['rev-parse', sourceCommit + '^{tree}'])).trim();
        if (!OID.test(tree) || !OID.test(headTree)) fail('MERGE_TREE_INVALID', '无法建立受控 Git 树。');
        if (tree !== headTree) sourceCommit = (await run(service, source.plan.root, ['commit-tree', tree, '-p', sourceCommit, '-m', 'OpenCode: snapshot confirmed task worktree'], { env: { ...env, GIT_AUTHOR_NAME: 'OpenCode Local Review', GIT_AUTHOR_EMAIL: 'opencode@localhost', GIT_COMMITTER_NAME: 'OpenCode Local Review', GIT_COMMITTER_EMAIL: 'opencode@localhost' } })).trim();
        if (!OID.test(sourceCommit)) fail('MERGE_COMMIT_INVALID', '无法建立任务工作副本的本地快照提交。');
        // Re-read actual files after staging; the private index never changes the user's index.
        current = await inspectMerge(service, root, source);
        if (current.fingerprint !== preview.fingerprint) fail('MERGE_PREVIEW_STALE', '制作快照期间文件已变化；未更新目标，请重新预览。');
        const actual = await changedNames(service, root, current.base, sourceCommit);
        if (actual.some(name => !preview.paths.includes(name))) fail('MERGE_UNPREVIEWED_PATH', 'Git 快照包含未展示的路径；未更新目标。');
        await checkPaths(service, root, source.plan.root, actual, current.base, sourceCommit);
      }
      let tree;
      try {
        const output = await run(service, root, ['merge-tree', '--write-tree', current.target.head, sourceCommit], { timeout: 120000 });
        tree = output.split(/\r?\n/)[0].trim();
      } catch (error) {
        if (error.code === 1 && OID.test((error.gitOutput || '').split(/\r?\n/)[0].trim())) fail('MERGE_CONFLICT', '预合并发现冲突；目标工作区未改动。请人工解决后重新预览。\n' + (error.gitOutput || error.gitMessage || '').slice(0, 4000));
        fail('MERGE_PREFLIGHT_FAILED', 'Git 不支持安全预合并或预合并失败；目标未更新。' + (error.gitMessage || error.message));
      }
      if (!OID.test(tree)) fail('MERGE_TREE_INVALID', '预合并未产生有效 Git 树；目标未更新。');
      const targetTree = (await run(service, root, ['rev-parse', current.target.head + '^{tree}'])).trim();
      if (tree === targetTree) return { merged: false, reason: '合并结果与目标内容相同；没有更新分支或工作区。' };
      const commit = (await run(service, root, ['commit-tree', tree, '-p', current.target.head, '-p', sourceCommit, '-m', 'OpenCode: merge reviewed local changes'], { env: { GIT_AUTHOR_NAME: 'OpenCode Local Review', GIT_AUTHOR_EMAIL: 'opencode@localhost', GIT_COMMITTER_NAME: 'OpenCode Local Review', GIT_COMMITTER_EMAIL: 'opencode@localhost' } })).trim();
      if (!OID.test(commit)) fail('MERGE_COMMIT_INVALID', '无法建立合并提交；目标未更新。');
      const final = await inspectMerge(service, root, source);
      if (final.fingerprint !== preview.fingerprint) fail('MERGE_PREVIEW_STALE', '更新目标前状态发生变化；未执行合并。');
      if (guard.beforeUpdate) await guard.beforeUpdate();
      try { await run(service, root, ['merge', '--ff-only', '--no-overwrite-ignore', commit], { timeout: 120000 }); }
      catch (error) { fail('MERGE_OUTCOME_CHECK_REQUIRED', '更新目标失败或结果未知；不要自动重试，请先核对 Git 状态与实际文件。' + (error.gitMessage || error.message)); }
      return { merged: true, commit, sourceCommit, targetBranch: current.target.branch, testsRun: false, pushed: false };
    } finally {
      if (tempDir) await fsp.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });
}
