// Worktrees isolate cooperative file changes, not shells, ports, databases or OS users.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { fail } from './collaboration-contracts.mjs';

export function canonicalPath(value) {
  let file = path.resolve(value), tail = [];
  for (;;) {
    try { file = fs.realpathSync(file); break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; const parent = path.dirname(file); if (parent === file) break; tail.unshift(path.basename(file)); file = parent; }
  }
  file = path.join(file, ...tail).replaceAll('\\', '/');
  return process.platform === 'win32' ? file.toLowerCase() : file;
}
export function withinRoot(file, root) {
  const target = canonicalPath(file), base = canonicalPath(root);
  return target === base || target.startsWith(base.endsWith('/') ? base : base + '/');
}
function executeGit(root, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(options.executable || 'git', ['--no-pager', '-c', 'core.fsmonitor=false', '-c', 'submodule.recurse=false', '-C', root, ...args], { windowsHide: true, encoding: options.encoding || 'utf8', timeout: options.timeout || 30000, maxBuffer: options.maxBuffer || 2 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_LFS_SKIP_SMUDGE: '1', GIT_NO_LAZY_FETCH: '1' } }, (error, stdout, stderr) => {
      if (error) { error.gitMessage = String(stderr || error.message).slice(0, 2000); reject(error); }
      else resolve(stdout);
    });
  });
}
export async function git(root, args, options = {}) {
  // Inspect configuration without running it. Disable repository hooks and every configured
  // clean/smudge/process filter before commands that could invoke user-provided programs.
  let names = '';
  try { names = await executeGit(root, ['config', '--name-only', '--get-regexp', '^filter\\..*\\.(clean|smudge|process|required)$'], { ...options, encoding: 'utf8' }); }
  catch (error) { if (error.code !== 1) throw error; }
  const drivers = [...new Set(names.split(/\r?\n/).map(name => /^filter\.(.+)\.(?:clean|smudge|process|required)$/.exec(name)?.[1]).filter(Boolean))];
  const config = options.hooksPath ? ['-c', 'core.hooksPath=' + options.hooksPath] : [];
  for (const driver of drivers) for (const field of ['clean', 'smudge', 'process', 'required']) config.push('-c', 'filter.' + driver + '.' + field + '=' + (field === 'required' ? 'false' : ''));
  return executeGit(root, [...config, ...args], options);
}
export async function planWorkspace(root, isolation, readOnly, worktreeHome, taskId, attemptId, executable, allowGit, protectedHome) {
  if (!root) fail('TASK_WORKSPACE_REQUIRED', '执行任务需要实际工作区，不能在通用规则目录写入。');
  if (!fs.statSync(root).isDirectory()) fail('TASK_WORKSPACE_INVALID', '工作区不是目录。');
  if (readOnly) return { mode: 'read-only', root, sourceRoot: root, baseRef: null, reason: '职位或规则为只读。' };
  if (!allowGit) return { mode: 'single-writer', root, sourceRoot: root, baseRef: null, reason: '规则不允许命令，使用协作单写者，不调用 Git 或生成 Git diff。' };
  const hooksPath = path.join(protectedHome, attemptId, 'disabled-hooks'), options = { executable, hooksPath };
  let repository, baseRef, dirty;
  try {
    repository = (await git(root, ['rev-parse', '--show-toplevel'], options)).trim();
    baseRef = (await git(root, ['rev-parse', '--verify', 'HEAD'], options)).trim();
    dirty = (await git(root, ['status', '--porcelain=v1', '--untracked-files=normal', '--', '.'], options)).trim();
  } catch (error) {
    if (isolation === 'worktree') fail('TASK_WORKTREE_UNAVAILABLE', '无法确认 Git/HEAD；未安装依赖，也未静默降低隔离。' + (error.gitMessage || error.message));
    return { mode: 'single-writer', root, sourceRoot: root, baseRef: null, reason: 'Git/HEAD 不可用，auto 使用协作单写者；不提供 OS 沙箱。' };
  }
  if (isolation === 'single-writer') return { mode: 'single-writer', root, sourceRoot: root, baseRef, hooksPath, reason: '本地明确选择协作单写者；开始时的已有差异单独保留。Git hooks/filters 不执行。' };
  if (dirty) {
    if (isolation === 'worktree') fail('TASK_WORKTREE_DIRTY', '源工作区有未提交内容；拒绝从旧 HEAD 静默创建副本。先整理源工作区，或明确选择 single-writer。');
    return { mode: 'single-writer', root, sourceRoot: root, baseRef, hooksPath, reason: '源工作区有未提交内容；auto 使用协作单写者，不复制用户未提交或私密文件。' };
  }
  if (canonicalPath(repository) !== canonicalPath(root)) {
    if (isolation === 'worktree') fail('TASK_WORKTREE_ROOT_REQUIRED', '请把 Git 仓库根目录登记为任务工作区。');
    return { mode: 'single-writer', root, sourceRoot: root, baseRef, hooksPath, reason: '当前工作区不是 Git 仓库根目录，auto 使用协作单写者。' };
  }
  const suffix = attemptId.replace(/[^a-zA-Z0-9_-]/g, '');
  return { mode: 'worktree', sourceRoot: root, root: path.join(worktreeHome, suffix), baseRef, hooksPath, branch: 'opencode/' + taskId.replace(/[^a-zA-Z0-9_-]/g, '') + '/' + suffix, reason: '干净 Git 仓库；使用独立任务分支与工作副本。' };
}
export async function prepareWorkspace(plan, executable) {
  if (plan.mode !== 'worktree') return plan;
  // The plan/intent must be durable before this function is called. Never retry an unknown add.
  if (fs.existsSync(plan.root)) fail('TASK_WORKTREE_ALREADY_EXISTS', '目标工作副本已存在；请核对原执行，不自动覆盖或重建。');
  await fsp.mkdir(path.dirname(plan.root), { recursive: true });
  await fsp.mkdir(plan.hooksPath, { recursive: true, mode: 0o700 });
  await git(plan.sourceRoot, ['worktree', 'add', '-b', plan.branch, '--', plan.root, plan.baseRef], { executable, hooksPath: plan.hooksPath });
  return verifyWorkspace(plan, executable);
}
export async function verifyWorkspace(plan, executable) {
  if (!fs.existsSync(plan.root)) fail('TASK_EXECUTION_FILES_MISSING', '执行工作副本已缺失；不会把源目录冒充旧工作副本。');
  if (plan.mode === 'worktree') {
    const options = { executable, hooksPath: plan.hooksPath };
    const root = (await git(plan.root, ['rev-parse', '--show-toplevel'], options)).trim();
    const branch = (await git(plan.root, ['symbolic-ref', '--short', 'HEAD'], options)).trim();
    const common = (await git(plan.root, ['rev-parse', '--git-common-dir'], options)).trim();
    const sourceCommon = (await git(plan.sourceRoot, ['rev-parse', '--git-common-dir'], options)).trim();
    if (canonicalPath(root) !== canonicalPath(plan.root) || branch !== plan.branch || canonicalPath(path.resolve(plan.root, common)) !== canonicalPath(path.resolve(plan.sourceRoot, sourceCommon))) fail('TASK_WORKTREE_CHANGED', '工作副本、任务分支或共享 Git 目录已变化；拒绝自动续跑。');
  }
  return plan;
}
export function scopedArguments(name, input, root) {
  const args = structuredClone(input || {});
  if (!root) return args;
  const absolute = value => typeof value === 'string' && !path.isAbsolute(value) ? path.resolve(root, value) : value;
  if (name === 'read_files' && Array.isArray(args.files)) args.files = args.files.map(file => ({ ...file, path: absolute(file.path) }));
  if (['find_files', 'search_files', 'list_directory'].includes(name)) args.path = absolute(args.path || root);
  if (name === 'run_command') args.cwd = absolute(args.cwd || root);
  if (name === 'apply_patch' && typeof args.patch === 'string') args.patch = args.patch.replace(/^(\*\*\* (?:Add File|Update File|Delete File|Move to): )(.+)$/gm, (_, prefix, value) => prefix + absolute(value));
  if (typeof args.path === 'string') args.path = absolute(args.path);
  if (args.expected_versions && typeof args.expected_versions === 'object') args.expected_versions = Object.fromEntries(Object.entries(args.expected_versions).map(([file, version]) => [absolute(file), version]));
  return args;
}
export function assertWritePaths(name, args, root) {
  const paths = name === 'run_command' ? [args.cwd || root] : name === 'apply_patch' ? [...String(args.patch || '').matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map(match => match[1]) : typeof args.path === 'string' ? [args.path] : [];
  for (const file of paths) if (!withinRoot(path.isAbsolute(file) ? file : path.resolve(root, file), root)) fail('TASK_WRITE_OUTSIDE_EXECUTION', '写入路径或命令 cwd 不在本任务工作副本内。Shell 内容仍不是 OS 沙箱，不能据此声称任意后代进程受限。');
}
export async function artifactManifest(root, files) {
  const output = [];
  for (const input of [...new Set(files)]) {
    const file = path.isAbsolute(input) ? input : path.resolve(root, input);
    if (!withinRoot(file, root)) fail('TASK_ARTIFACT_OUTSIDE_EXECUTION', '产物必须属于本次工作副本。');
    let stat;
    try { stat = await fsp.stat(file); } catch (error) { if (error.code === 'ENOENT') fail('TASK_ARTIFACT_MISSING', '产物不存在：' + input); throw error; }
    if (!stat.isFile() || stat.size > 128 * 1024 * 1024) fail('TASK_ARTIFACT_INVALID', '产物必须是 128 MiB 以内的实际文件：' + input);
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
    output.push({ path: file, relativePath: path.relative(root, file).replaceAll('\\', '/'), bytes: stat.size, sha256: hash.digest('hex') });
  }
  return output;
}
export async function workspaceDiff(plan, executable) {
  if (!plan.baseRef) return { text: '', untracked: [], available: false, reason: '无 Git 基线；产物按文件哈希记录，不能声称 Git diff 已审查。' };
  try {
    return { text: await git(plan.root, ['diff', '--relative', '--no-ext-diff', '--no-textconv', '--binary', plan.baseRef, '--', '.'], { executable, hooksPath: plan.hooksPath }), untracked: (await git(plan.root, ['ls-files', '--others', '--exclude-standard', '--', '.'], { executable, hooksPath: plan.hooksPath })).split(/\r?\n/).filter(Boolean), available: true, includesUntrackedContents: false };
  } catch (error) { return { text: '', untracked: [], available: false, reason: 'diff 未生成：' + (error.gitMessage || error.message) }; }
}
