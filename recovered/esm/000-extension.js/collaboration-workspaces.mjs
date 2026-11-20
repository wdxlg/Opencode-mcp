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
    const env = { ...process.env };
    // The manual merge path must not inherit a redirected repository or index.
    if (options.safeEnv) for (const key of Object.keys(env)) if (key.startsWith('GIT_')) delete env[key];
    Object.assign(env, options.env || {}, { GIT_TERMINAL_PROMPT: '0', GIT_OPTIONAL_LOCKS: '0', GIT_LFS_SKIP_SMUDGE: '1', GIT_NO_LAZY_FETCH: '1' });
    if (options.safeEnv) env.GIT_NO_REPLACE_OBJECTS = '1';
    execFile(options.executable || 'git', ['--no-pager', '-c', 'core.fsmonitor=false', '-c', 'submodule.recurse=false', '-C', root, ...args], { windowsHide: true, encoding: options.encoding || 'utf8', timeout: options.timeout || 30000, maxBuffer: options.maxBuffer || 2 * 1024 * 1024, env }, (error, stdout, stderr) => {
      if (error) { error.gitMessage = String(stderr || error.message).slice(0, 2000); error.gitOutput = String(stdout || '').slice(0, 12000); reject(error); }
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
  // 有未提交改动时也照样开独立 worktree（从当前 HEAD 开始），不再退回「一次只让一个人写」；未提交改动不带进副本。
  const dirtyNote = dirty ? '源工作区有未提交改动，这些改动不在任务副本里；副本从当前 HEAD 开始。' : '';
  if (canonicalPath(repository) !== canonicalPath(root)) {
    if (isolation === 'worktree') fail('TASK_WORKTREE_ROOT_REQUIRED', '请把 Git 仓库根目录登记为任务工作区。');
    return { mode: 'single-writer', root, sourceRoot: root, baseRef, hooksPath, reason: '当前工作区不是 Git 仓库根目录，auto 使用协作单写者。' };
  }
  const suffix = attemptId.replace(/[^a-zA-Z0-9_-]/g, '');
  return { mode: 'worktree', sourceRoot: root, root: path.join(worktreeHome, suffix), baseRef, hooksPath, branch: 'opencode/' + taskId.replace(/[^a-zA-Z0-9_-]/g, '') + '/' + suffix, reason: (dirtyNote || '干净 Git 仓库；') + '使用独立任务分支与工作副本。' };
}
// 与 Claude Code / Conductor / Cursor 相同：worktree 只含已提交文件；被 .gitignore 忽略的文件按 .worktreeinclude 清单复制，
// 依赖等由 .opencode/worktrees.json（兼容 .cursor/worktrees.json）里的准备命令在新副本里安装。
async function copyWorktreeInclude(plan, executable) {
  const list = path.join(plan.sourceRoot, '.worktreeinclude');
  if (!fs.existsSync(list)) return '';
  const options = { executable, hooksPath: plan.hooksPath, timeout: 120000, maxBuffer: 16 * 1024 * 1024 };
  const candidates = (await git(plan.sourceRoot, ['ls-files', '-z', '--others', '--ignored', '--exclude-from=' + list, '--', '.'], options)).split('\0').filter(Boolean).slice(0, 5000);
  const ignored = [];
  for (let i = 0; i < candidates.length; i += 100) {
    const chunk = candidates.slice(i, i + 100);
    try { ignored.push(...(await git(plan.sourceRoot, ['-c', 'core.quotePath=false', 'check-ignore', '--', ...chunk], options)).split(/\r?\n/).filter(Boolean)); }
    catch (error) { if (error.code !== 1) throw error; }
  }
  let copied = 0, skipped = 0;
  for (const rel of ignored) {
    const source = path.resolve(plan.sourceRoot, rel), target = path.resolve(plan.root, rel);
    if (!withinRoot(source, plan.sourceRoot) || !withinRoot(target, plan.root)) { skipped++; continue; }
    let stat; try { stat = await fsp.lstat(source); } catch { skipped++; continue; }
    if (!stat.isFile() || stat.size > 64 * 1024 * 1024) { skipped++; continue; }
    await fsp.mkdir(path.dirname(target), { recursive: true });
    try { await fsp.copyFile(source, target, fs.constants.COPYFILE_EXCL); copied++; } catch (error) { if (error.code === 'EEXIST') skipped++; else throw error; }
  }
  return '按 .worktreeinclude 复制 ' + copied + ' 个被忽略的文件' + (skipped ? '（跳过 ' + skipped + ' 个）' : '') + '。';
}
function worktreeSetupConfig(plan) {
  for (const base of [plan.root, plan.sourceRoot]) for (const dir of ['.opencode', '.cursor']) {
    const file = path.join(base, dir, 'worktrees.json');
    if (!fs.existsSync(file)) continue;
    let value; try { value = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail('TASK_WORKTREE_SETUP_INVALID', file + ' 不是有效 JSON：' + error.message); }
    const steps = value?.[process.platform === 'win32' ? 'setup-worktree-windows' : 'setup-worktree-unix'] ?? value?.['setup-worktree'];
    if (steps === undefined || steps === null) return null;
    if (typeof steps !== 'string' && !(Array.isArray(steps) && steps.every(item => typeof item === 'string'))) fail('TASK_WORKTREE_SETUP_INVALID', file + ' 的 setup-worktree 必须是命令数组或脚本路径。');
    return { file, dir: path.dirname(file), steps };
  }
  return null;
}
function runSetupStep(command, plan, script) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, ROOT_WORKTREE_PATH: plan.sourceRoot, OPENCODE_ROOT_WORKTREE_PATH: plan.sourceRoot, OPENCODE_WORKTREE_PATH: plan.root };
    let file, args;
    if (script) {
      const ext = path.extname(script).toLowerCase();
      if (ext === '.ps1') { file = 'powershell.exe'; args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script]; }
      else if (ext === '.cmd' || ext === '.bat') { file = process.env.ComSpec || 'cmd.exe'; args = ['/d', '/s', '/c', script]; }
      else if (ext === '.sh') { file = 'bash'; args = [script]; }
      else if (ext === '.js' || ext === '.mjs' || ext === '.cjs') { file = process.execPath; args = [script]; env.ELECTRON_RUN_AS_NODE = '1'; }
      else { file = script; args = []; }
    } else if (process.platform === 'win32') { file = process.env.ComSpec || 'cmd.exe'; args = ['/d', '/s', '/c', '"' + command + '"']; }
    else { file = '/bin/sh'; args = ['-c', command]; }
    execFile(file, args, { cwd: plan.root, env, windowsHide: true, windowsVerbatimArguments: process.platform === 'win32' && !script, timeout: 15 * 60 * 1000, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8' }, (error, stdout, stderr) => {
      if (error) reject(Object.assign(error, { output: String(stderr || stdout || error.message).slice(-1500) })); else resolve();
    });
  });
}
async function runWorktreeSetup(plan) {
  const config = worktreeSetupConfig(plan);
  if (!config) return '';
  const steps = typeof config.steps === 'string' ? [{ script: path.resolve(config.dir, config.steps) }] : config.steps.map(command => ({ command }));
  for (const step of steps) {
    if (step.script && !fs.existsSync(step.script)) fail('TASK_WORKTREE_SETUP_FAILED', '准备脚本不存在：' + step.script);
    try { await runSetupStep(step.command, plan, step.script); }
    catch (error) { fail('TASK_WORKTREE_SETUP_FAILED', '任务副本的准备命令失败（' + (step.script || step.command) + '）：' + (error.killed ? '超过 15 分钟被停止' : error.output || error.message) + '\n副本保留在 ' + plan.root + '，可以手动处理后重新开始任务。'); }
  }
  return '已按 ' + path.relative(path.dirname(config.dir), config.file).replaceAll('\\', '/') + ' 执行 ' + steps.length + ' 条准备命令。';
}
export async function prepareWorkspace(plan, executable) {
  if (plan.mode !== 'worktree') return plan;
  // The plan/intent must be durable before this function is called. Never retry an unknown add.
  if (fs.existsSync(plan.root)) fail('TASK_WORKTREE_ALREADY_EXISTS', '目标工作副本已存在；请核对原执行，不自动覆盖或重建。');
  await fsp.mkdir(path.dirname(plan.root), { recursive: true });
  await fsp.mkdir(plan.hooksPath, { recursive: true, mode: 0o700 });
  await git(plan.sourceRoot, ['worktree', 'add', '-b', plan.branch, '--', plan.root, plan.baseRef], { executable, hooksPath: plan.hooksPath });
  await verifyWorkspace(plan, executable);
  const notes = [await copyWorktreeInclude(plan, executable), await runWorktreeSetup(plan)].filter(Boolean);
  if (notes.length) plan.reason = [plan.reason, ...notes].filter(Boolean).join(' ');
  return plan;
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
