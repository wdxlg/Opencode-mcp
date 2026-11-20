// Maintained source (recovered.33): tool-layer policy gates, configurable collaboration limits,
// persisted per-caller rule acknowledgements, cached JSON reads and change waiting.
// Gates are evaluated by the host before a tool runs; they are not an OS sandbox and do not
// cover processes a shell detaches on its own. Model tools can READ the policy only; the
// global policy file and the limit extensions are changed by the local user / local UI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { fail, now } from './collaboration-contracts.mjs';

export const TOOL_GATES_FILE = 'tool-gates.v1.json';
export const WORKSPACE_TOOL_GATES_FILE = '.opencode-project/tool-gates.json';
export const LIMITS_FILE = 'collaboration-limits.v1.json';
export const LIMIT_EXTENSIONS_FILE = 'collaboration-limit-extensions.v1.json';
export const CALLER_ACKS_FILE = 'caller-rule-acks.v1.json';
export const GATE_EVENTS_FILE = 'tool-gate-events.v1.jsonl';
const MAX_POLICY_BYTES = 512 * 1024;
const MAX_EVENTS_BYTES = 1024 * 1024;
const APPROVAL_TTL_MS = 60 * 1000;

// ---------------------------------------------------------------- cached JSON
const jsonCache = new Map();
/** Parse a JSON file once per (mtime,size,ino). Returns {exists,value,key}. Callers must not mutate value. */
export function cachedJson(file, maxBytes = 16 * 1024 * 1024) {
  let stat;
  try { stat = fs.statSync(file); } catch (error) { if (error.code === 'ENOENT') { jsonCache.delete(file); return { exists: false, value: null, key: 'missing' }; } throw error; }
  const key = stat.mtimeMs + ':' + stat.size + ':' + stat.ino;
  const hit = jsonCache.get(file);
  if (hit && hit.key === key) return hit;
  if (stat.size > maxBytes) fail('POLICY_FILE_TOO_LARGE', '配置文件超过大小上限：' + file);
  let value;
  try { value = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { fail('POLICY_FILE_INVALID', 'JSON 无法解析，未使用该文件：' + file + '（' + error.message + '）'); }
  const entry = { exists: true, value, key };
  jsonCache.set(file, entry);
  if (jsonCache.size > 64) jsonCache.delete(jsonCache.keys().next().value);
  return entry;
}
export function fileStamp(file) { try { const s = fs.statSync(file); return s.mtimeMs + ':' + s.size + ':' + s.ino; } catch { return 'missing'; } }

/**
 * Event-driven wait: resolves on the first in-process change event, a filesystem change of one of
 * `files` (other windows write the same shared store), the fallback timer, timeout or abort.
 * Never busy-polls. Resolves to 'change' | 'fs' | 'fallback' | 'timeout' | 'aborted'.
 */
export function waitForChange({ subscribe, files = [], timeoutMs = 25000, fallbackMs = 5000, signal } = {}) {
  return new Promise(resolve => {
    let settled = false; const cleanups = [];
    const finish = reason => { if (settled) return; settled = true; for (const cleanup of cleanups) { try { cleanup(); } catch {} } resolve(reason); };
    if (signal?.aborted) return finish('aborted');
    const deadline = setTimeout(() => finish('timeout'), Math.max(0, timeoutMs)); cleanups.push(() => clearTimeout(deadline));
    if (fallbackMs > 0 && fallbackMs < timeoutMs) { const timer = setTimeout(() => finish('fallback'), fallbackMs); cleanups.push(() => clearTimeout(timer)); }
    if (typeof subscribe === 'function') { try { const off = subscribe(() => finish('change')); if (typeof off === 'function') cleanups.push(off); } catch {} }
    const dirs = new Map();
    for (const file of files) { if (!file) continue; const dir = path.dirname(file); if (!dirs.has(dir)) dirs.set(dir, new Set()); dirs.get(dir).add(path.basename(file)); }
    for (const [dir, names] of dirs) {
      try {
        const watcher = fs.watch(dir, { persistent: false }, (_event, name) => { if (!name || names.has(String(name)) || String(name).endsWith('.tmp')) finish('fs'); });
        watcher.on('error', () => {}); cleanups.push(() => watcher.close());
      } catch {}
    }
    if (signal) { const abort = () => finish('aborted'); signal.addEventListener('abort', abort, { once: true }); cleanups.push(() => signal.removeEventListener('abort', abort)); }
  });
}

// ---------------------------------------------------------------- limits
export const LIMIT_DEFAULTS = Object.freeze({ modelRequestsPerAttempt: 12, nativeExecutorSlots: 2, managerSlots: 1, integrationMaxFiles: 30, integrationMaxFileKiB: 256, integrationMaxTotalKiB: 512 });
export const LIMIT_MAXIMA = Object.freeze({ modelRequestsPerAttempt: 200, nativeExecutorSlots: 8, managerSlots: 4, integrationMaxFiles: 300, integrationMaxFileKiB: 4096, integrationMaxTotalKiB: 16384 });
export const LIMIT_ENV = Object.freeze({ modelRequestsPerAttempt: 'OPENCODE_COLLAB_MAX_MODEL_REQUESTS', nativeExecutorSlots: 'OPENCODE_COLLAB_NATIVE_SLOTS', managerSlots: 'OPENCODE_COLLAB_MANAGER_SLOTS', integrationMaxFiles: 'OPENCODE_COLLAB_INTEGRATION_MAX_FILES', integrationMaxFileKiB: 'OPENCODE_COLLAB_INTEGRATION_MAX_FILE_KIB', integrationMaxTotalKiB: 'OPENCODE_COLLAB_INTEGRATION_MAX_TOTAL_KIB' });
const clampLimit = (key, value) => { const n = typeof value === 'string' && value.trim() ? Number(value) : value; return Number.isSafeInteger(n) && n >= 1 ? Math.min(n, LIMIT_MAXIMA[key]) : undefined; };
let activeLimitSource = null;
/** Current effective limits for code paths that have no service handle (integration helpers, worker slots). */
export function collaborationLimits() { try { return activeLimitSource ? activeLimitSource() : resolveLimits(); } catch { return { ...LIMIT_DEFAULTS }; } }
export function resolveLimits(directory, settings) {
  const result = { ...LIMIT_DEFAULTS }, sources = {};
  for (const key of Object.keys(result)) sources[key] = 'default';
  if (directory) {
    try { const file = cachedJson(path.join(directory, LIMITS_FILE), 64 * 1024); if (file.exists && file.value && typeof file.value === 'object') for (const key of Object.keys(result)) { const v = clampLimit(key, file.value[key]); if (v !== undefined) { result[key] = v; sources[key] = 'file'; } } } catch {}
  }
  if (settings && typeof settings === 'object') for (const key of Object.keys(result)) { const v = clampLimit(key, settings[key]); if (v !== undefined) { result[key] = v; sources[key] = 'settings'; } }
  for (const [key, env] of Object.entries(LIMIT_ENV)) { const v = clampLimit(key, process.env[env]); if (v !== undefined) { result[key] = v; sources[key] = 'env'; } }
  Object.defineProperty(result, 'sources', { value: sources, enumerable: false });
  return result;
}

// ---------------------------------------------------------------- default policy
const COMMAND_TOOLS = ['run_command', 'send_command_input', 'ext__*__powershell', 'ext__*__shell', 'ext__*__cmd', 'ext__*__terminal'];
const WRITE_TOOLS = ['apply_patch', 'write_file', 'edit_file', 'create_file', 'delete_file', 'move_file', 'ext__*__filesystem', 'ext__*__write_file', 'ext__*__edit_file'];
const PROCESS_TOOLS = ['ext__*__process', 'ext__*__app'];
const WINDOW_TOOLS = ['ext__*__app', 'ext__*__click', 'ext__*__type', 'ext__*__shortcut', 'ext__*__move', 'ext__*__scroll', 'ext__*__multiselect', 'ext__*__multiedit'];
export const DEFAULT_TOOL_GATES = Object.freeze({
  format: 'opencode.tool-gates', version: 1,
  protected: { paths: ['E:/OpenCode'], process_names: ['OpenCode', 'OpenCode.exe'], pids: [], window_titles: [] },
  rules: [
    { id: 'default.deny-stop-opencode', effect: 'deny', tools: COMMAND_TOOLS, command_regex: '\\b(?:taskkill|tskill|Stop-Process|spps|kill|killall|pkill|wmic)\\b[^\\n]*\\b(?:opencode|electron)\\b', command_flags: 'i', reason: '默认策略禁止终止或停止 OpenCode 实例（含本工程以外的正式安装）。需要结束时请交给用户处理。' },
    { id: 'default.deny-kill-protected-process', effect: 'deny', tools: [...COMMAND_TOOLS, ...PROCESS_TOOLS], kill_protected: true, reason: '目标进程受保护（当前宿主进程、OpenCode 进程或策略列出的 PID/进程名），不能终止。' },
    { id: 'default.deny-official-install-write', effect: 'deny', tools: WRITE_TOOLS, use_protected_paths: true, reason: '默认策略禁止写入正式安装目录（E:/OpenCode 等受保护路径）。' },
    { id: 'default.deny-official-install-command-write', effect: 'deny', tools: COMMAND_TOOLS, command_writes_protected_path: true, reason: '命令会修改、删除或移动受保护路径（正式安装目录）。' },
    { id: 'default.deny-policy-file-edit', effect: 'deny', tools: WRITE_TOOLS, path_suffixes: ['/' + TOOL_GATES_FILE, '/' + WORKSPACE_TOOL_GATES_FILE, '/' + LIMITS_FILE, '/' + LIMIT_EXTENSIONS_FILE], reason: '工具门禁、协作限额文件只能由本地用户编辑，不能通过模型工具修改。' },
    { id: 'default.deny-policy-file-command', effect: 'deny', tools: COMMAND_TOOLS, command_regex: '(?:tool-gates(?:\\.v1)?\\.json|collaboration-limit(?:s|-extensions)\\.v1\\.json)', command_flags: 'i', reason: '工具门禁、协作限额文件只能由本地用户编辑，命令不能读写替换它们。' },
    { id: 'default.deny-protected-window', effect: 'deny', tools: WINDOW_TOOLS, window_protected: true, reason: '目标窗口在受保护窗口标题列表中。' }
  ],
  completion_gate: { require_executed_check_kinds: [] }
});

// ---------------------------------------------------------------- helpers
const globToRegExp = glob => new RegExp('^' + String(glob).toLowerCase().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
export function normalizeGatePath(value) {
  let p = String(value || '').trim().replace(/^["']|["']$/g, '').replace(/\\/g, '/');
  const drive = /^\/([a-zA-Z])(?:\/|$)/.exec(p); if (drive) p = drive[1] + ':/' + p.slice(3);
  p = p.replace(/\/+/g, '/');
  if (/^[a-zA-Z]:$/.test(p)) p += '/';
  if (p.length > 3 && p.endsWith('/')) p = p.slice(0, -1);
  return /^[a-zA-Z]:/.test(p) || process.platform === 'win32' ? p.toLowerCase() : p;
}
const underPrefix = (target, prefix) => { const t = normalizeGatePath(target), p = normalizeGatePath(prefix); return !!p && (t === p || t.startsWith(p.endsWith('/') ? p : p + '/')); };
const asList = value => Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value];
const stringArgs = (args, keys) => keys.flatMap(key => asList(args?.[key])).filter(value => typeof value === 'string' && value.trim());
function targetPaths(name, args, base) {
  const raw = [...stringArgs(args, ['path', 'file', 'file_path', 'filePath', 'destination', 'destination_path', 'source', 'target', 'directory', 'dest', 'to', 'from']), ...(Array.isArray(args?.files) ? args.files.map(item => typeof item === 'string' ? item : item?.path).filter(v => typeof v === 'string') : [])];
  if (typeof args?.patch === 'string') for (const match of args.patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)) raw.push(match[1].trim());
  return raw.map(value => { const v = value.replace(/\\/g, '/'); return /^(?:[a-zA-Z]:|\/)/.test(v) || !base ? v : path.resolve(base, value); });
}
function commandText(args) { return stringArgs(args, ['command', 'input', 'script', 'code', 'cmd', 'commandline']).join('\n'); }
const KILL_RE = /\b(?:taskkill|tskill|Stop-Process|spps|kill|killall|pkill|wmic\b[^\n]*\bdelete)\b/i;
function killTargets(name, args, text) {
  const pids = new Set(), names = new Set(); let kill = false;
  const lower = String(name).toLowerCase();
  if (/__process$/.test(lower)) { const mode = String(args?.mode ?? args?.action ?? args?.operation ?? '').toLowerCase(); if (/kill|terminate|stop|end|close/.test(mode)) kill = true; }
  if (/__app$/.test(lower)) { const mode = String(args?.mode ?? args?.action ?? '').toLowerCase(); if (/kill|terminate|close|quit|exit/.test(mode)) kill = true; }
  if (kill) {
    for (const v of [...asList(args?.pid), ...asList(args?.pids), ...asList(args?.process_id), ...asList(args?.processId)]) { const n = Number(v); if (Number.isSafeInteger(n)) pids.add(n); }
    for (const v of stringArgs(args, ['name', 'process', 'process_name', 'processName', 'app', 'app_name', 'image'])) names.add(v.toLowerCase().replace(/\.exe$/, ''));
  }
  if (text && KILL_RE.test(text)) {
    kill = true;
    for (const m of text.matchAll(/\/PID\s+(\d+)/gi)) pids.add(Number(m[1]));
    for (const m of text.matchAll(/-(?:Id|PID)\s+([\d,\s]+)/gi)) for (const n of m[1].split(/[,\s]+/)) if (/^\d+$/.test(n)) pids.add(Number(n));
    for (const m of text.matchAll(/\b(?:kill|tskill)\b(?:\s+-\w+)*\s+((?:\d+\s*)+)/gi)) for (const n of m[1].trim().split(/\s+/)) if (/^\d+$/.test(n)) pids.add(Number(n));
    for (const m of text.matchAll(/\/IM\s+"?([^"\s]+)"?/gi)) names.add(m[1].toLowerCase().replace(/\.exe$/, ''));
    for (const m of text.matchAll(/-(?:Name|ProcessName)\s+"?([^"\s,]+)"?/gi)) names.add(m[1].toLowerCase().replace(/\.exe$/, ''));
    for (const m of text.matchAll(/\b(?:pkill|killall)\b(?:\s+-\w+)*\s+"?([^"\s;|&]+)"?/gi)) names.add(m[1].toLowerCase().replace(/\.exe$/, ''));
  }
  return { kill, pids: [...pids], names: [...names] };
}
function windowTargets(args) { return stringArgs(args, ['name', 'window', 'window_name', 'windowName', 'title', 'window_title', 'app', 'target']); }
const WRITE_VERB_RE = /(?:\b(?:rm|del|erase|rmdir|rd|mv|move|cp|copy|xcopy|robocopy|ren|rename|Remove-Item|ri|Move-Item|mi|Copy-Item|cpi|Set-Content|sc|Add-Content|ac|Out-File|New-Item|ni|Rename-Item|rni|Clear-Content|tee|truncate|mkdir|md|touch|unzip|Expand-Archive|chmod|icacls|attrib|git\s+(?:clone|init|checkout|reset|clean|apply))\b|\bsed\s+-i|(?<![0-9&>])>{1,2}(?![&>]))/i;
function pathMentionRegex(protectedPath) {
  const p = normalizeGatePath(protectedPath); if (!p) return null;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const drive = /^([a-z]):\/(.*)$/.exec(p);
  const tail = '(?=$|[\\\\/\\s"\'`;|&)>])';
  if (drive) { const rest = drive[2].split('/').map(esc).join('[\\\\/]+'); return new RegExp('(?:\\b' + drive[1] + ':[\\\\/]+|/' + drive[1] + '/)' + rest + tail, 'i'); }
  return new RegExp(p.split('/').map(esc).join('[\\\\/]+') + tail, 'i');
}

function validRule(rule, source) {
  if (!rule || typeof rule !== 'object' || typeof rule.id !== 'string' || !rule.id.trim() || rule.id.length > 120) return null;
  if (!['deny', 'ask'].includes(rule.effect)) return null;
  if (rule.enabled === false) return null;
  const tools = asList(rule.tools).filter(v => typeof v === 'string' && v.length <= 200);
  if (!tools.length) return null;
  let regex = null;
  if (rule.command_regex !== undefined) { try { regex = new RegExp(String(rule.command_regex).slice(0, 2000), String(rule.command_flags || '').replace(/[^imsu]/g, '')); } catch { return null; } }
  let windowRegexes = [];
  try { windowRegexes = asList(rule.window_titles).filter(v => typeof v === 'string').map(v => new RegExp(v.slice(0, 500), 'i')); } catch { return null; }
  return { ...rule, source, tools, toolRegexes: tools.map(globToRegExp), commandRegex: regex, windowRegexes };
}

// ---------------------------------------------------------------- policy service
export class CollaborationPolicy {
  constructor(service) {
    this.service = service;
    this.approvals = new Map();
    activeLimitSource = () => this.limits();
  }
  get directory() { return this.service.directory; }
  file(name) { return path.join(this.directory, name); }
  limits() { return resolveLimits(this.directory, this.service.options?.collaborationLimits?.()); }

  // ---- tool gates
  /** Effective policy for a workspace root: shipped defaults + global user file + add-only workspace file. */
  effectivePolicy(workspaceRoot) {
    const warnings = [], sources = [{ kind: 'default', file: null }];
    let globalFile = { exists: false, value: null };
    try { globalFile = cachedJson(this.file(TOOL_GATES_FILE), MAX_POLICY_BYTES); } catch (error) { warnings.push(error.message); }
    const global = globalFile.exists && globalFile.value && typeof globalFile.value === 'object' ? globalFile.value : {};
    if (globalFile.exists) sources.push({ kind: 'global', file: this.file(TOOL_GATES_FILE) });
    const disabled = new Set(asList(global.disabled_default_rules).filter(v => typeof v === 'string'));
    const protectedSet = { paths: [], process_names: [], pids: [], window_titles: [] };
    const addProtected = (value, replace) => { if (!value || typeof value !== 'object') return; for (const key of Object.keys(protectedSet)) { const list = asList(value[key]).filter(v => key === 'pids' ? Number.isSafeInteger(Number(v)) : typeof v === 'string' && v.trim()); if (replace && value[key] !== undefined) protectedSet[key] = []; protectedSet[key].push(...list.map(v => key === 'pids' ? Number(v) : v)); } };
    addProtected(DEFAULT_TOOL_GATES.protected, false);
    addProtected(global.protected, global.replace_default_protected === true);
    const rules = [];
    for (const rule of DEFAULT_TOOL_GATES.rules) if (!disabled.has(rule.id)) rules.push(validRule(rule, 'default'));
    for (const rule of asList(global.rules)) { const valid = validRule(rule, 'global'); if (valid) rules.push(valid); else warnings.push('忽略无效全局规则：' + JSON.stringify(rule?.id ?? rule).slice(0, 120)); }
    let workspaceFile = null;
    if (workspaceRoot) {
      const file = path.join(workspaceRoot, WORKSPACE_TOOL_GATES_FILE);
      try {
        const entry = cachedJson(file, MAX_POLICY_BYTES);
        if (entry.exists && entry.value && typeof entry.value === 'object') {
          workspaceFile = file; sources.push({ kind: 'workspace', file, add_only: true });
          // A workspace file is writable by project tools, so it can only add restrictions.
          addProtected(entry.value.protected, false);
          for (const rule of asList(entry.value.rules)) { const valid = validRule({ ...rule, id: 'workspace:' + String(rule?.id || '') }, 'workspace'); if (valid) rules.push(valid); else warnings.push('忽略无效工作区规则：' + JSON.stringify(rule?.id ?? rule).slice(0, 120)); }
        }
      } catch (error) { warnings.push(error.message); }
    }
    const completion = { require_executed_check_kinds: [...new Set([...asList(global.completion_gate?.require_executed_check_kinds)].filter(v => ['inspection', 'build', 'test'].includes(v)))] };
    return { rules: rules.filter(Boolean), protected: protectedSet, completion_gate: completion, sources, warnings, global_file: this.file(TOOL_GATES_FILE), workspace_file: workspaceFile || (workspaceRoot ? path.join(workspaceRoot, WORKSPACE_TOOL_GATES_FILE) : null) };
  }
  publicPolicy(workspaceRoot) {
    const policy = this.effectivePolicy(workspaceRoot);
    return { format: 'opencode.tool-gates.effective', version: 1, rules: policy.rules.map(({ toolRegexes, commandRegex, windowRegexes, ...rule }) => rule), protected: policy.protected, host_protected_pids: this.hostPids(), completion_gate: policy.completion_gate, sources: policy.sources, warnings: policy.warnings, global_file: policy.global_file, workspace_file: policy.workspace_file, editable_by_model: false, note: '只读。全局策略文件与工作区附加文件由本地用户编辑；工作区文件只能追加 deny/ask 规则或受保护对象，不能放宽。门禁不是操作系统沙箱，不覆盖 Shell 自行脱离的后代进程。' };
  }
  hostPids() { return [...new Set([process.pid, process.ppid].filter(n => Number.isSafeInteger(n) && n > 0))]; }

  /** Pure evaluation. Returns null when allowed, else {effect, rule, reason, source}. */
  evaluate(name, args, { workspaceRoot, cwdBase } = {}) {
    const tool = String(name || '').toLowerCase();
    const policy = this.effectivePolicy(workspaceRoot);
    const applicable = policy.rules.filter(rule => rule.toolRegexes.some(re => re.test(tool)));
    if (!applicable.length) return null;
    const base = typeof args?.cwd === 'string' && args.cwd.trim() && /^(?:[a-zA-Z]:|[\\/])/.test(args.cwd.trim()) ? args.cwd.trim() : cwdBase;
    let paths, text, kill, windows;
    const lazyPaths = () => paths ??= targetPaths(tool, args, base);
    const lazyText = () => text ??= commandText(args);
    const lazyKill = () => kill ??= killTargets(tool, args, lazyText());
    const lazyWindows = () => windows ??= windowTargets(args);
    const protectedPids = new Set([...policy.protected.pids, ...this.hostPids()]);
    const protectedNames = new Set(policy.protected.process_names.map(v => v.toLowerCase().replace(/\.exe$/, '')));
    const decisions = [];
    for (const rule of applicable) {
      const conditions = [];
      if (rule.path_prefixes !== undefined || rule.use_protected_paths) { const prefixes = [...asList(rule.path_prefixes), ...(rule.use_protected_paths ? policy.protected.paths : [])]; conditions.push(() => lazyPaths().some(target => prefixes.some(prefix => underPrefix(target, prefix)))); }
      if (rule.path_suffixes !== undefined) { const suffixes = asList(rule.path_suffixes).map(v => normalizeGatePath(v)); conditions.push(() => lazyPaths().some(target => { const t = normalizeGatePath(target); return suffixes.some(s => t.endsWith(s)); })); }
      if (rule.commandRegex) conditions.push(() => { const t = lazyText(); return !!t && rule.commandRegex.test(t); });
      if (rule.command_writes_protected_path) conditions.push(() => { const t = lazyText(); if (!t || !WRITE_VERB_RE.test(t)) return false; return policy.protected.paths.some(p => pathMentionRegex(p)?.test(t)) || (typeof args?.cwd === 'string' && policy.protected.paths.some(p => underPrefix(args.cwd, p))); });
      if (rule.arg_equals && typeof rule.arg_equals === 'object') conditions.push(() => Object.entries(rule.arg_equals).every(([key, value]) => String(args?.[key] ?? '').toLowerCase() === String(value).toLowerCase()));
      if (rule.kill_protected || rule.pids !== undefined || rule.process_names !== undefined) {
        const pids = new Set([...(rule.kill_protected ? protectedPids : []), ...asList(rule.pids).map(Number)]);
        const names = new Set([...(rule.kill_protected ? protectedNames : []), ...asList(rule.process_names).map(v => String(v).toLowerCase().replace(/\.exe$/, ''))]);
        conditions.push(() => { const k = lazyKill(); return k.kill && (k.pids.some(pid => pids.has(pid)) || k.names.some(n => names.has(n) || [...names].some(p => p && n.includes(p)))); });
      }
      if (rule.window_protected || rule.windowRegexes.length) {
        const regexes = [...rule.windowRegexes]; if (rule.window_protected) for (const title of policy.protected.window_titles) { try { regexes.push(new RegExp(title, 'i')); } catch {} }
        conditions.push(() => regexes.length > 0 && lazyWindows().some(title => regexes.some(re => re.test(title))));
      }
      let matched = false;
      try { matched = conditions.length ? conditions.every(check => check()) : true; } catch { matched = rule.effect === 'deny'; }
      if (matched) decisions.push({ effect: rule.effect, rule: rule.id, reason: String(rule.reason || '工具门禁策略拒绝此调用。').slice(0, 600), source: rule.source });
    }
    return decisions.find(item => item.effect === 'deny') || decisions.find(item => item.effect === 'ask') || null;
  }
  fingerprint(owner, name, args) { return crypto.createHash('sha256').update(JSON.stringify([String(owner || ''), String(name), args ?? null])).digest('hex').slice(0, 32); }
  approve(owner, fingerprint, ttlMs = APPROVAL_TTL_MS) { this.approvals.set(String(owner) + '\0' + fingerprint, Date.now() + ttlMs); if (this.approvals.size > 256) this.approvals.delete(this.approvals.keys().next().value); }
  approved(owner, fingerprint) { const key = String(owner) + '\0' + fingerprint, until = this.approvals.get(key); if (!until) return false; if (until < Date.now()) { this.approvals.delete(key); return false; } return true; }
  /** Throws POLICY_DENIED / POLICY_ASK_REQUIRED. Every deny is appended to the gate event log. */
  check(name, args, owner, context = {}) {
    let decision;
    try { decision = this.evaluate(name, args, context); }
    catch (error) { decision = { effect: 'deny', rule: 'policy.evaluation-error', reason: '门禁策略评估失败，按拒绝处理：' + error.message, source: 'host' }; }
    if (!decision) return null;
    const fingerprint = this.fingerprint(owner, name, args);
    if (decision.effect === 'ask') {
      if (this.approved(owner, fingerprint)) { this.record({ owner, tool: name, effect: 'ask-approved', rule: decision.rule, reason: decision.reason }); return { ...decision, approved: true }; }
      if (context.askAvailable === false) decision = { ...decision, effect: 'deny', reason: decision.reason + '（此调用路径没有可用的用户审批通道，按拒绝处理）' };
      else fail('POLICY_ASK_REQUIRED', `工具 ${name} 需要用户批准（规则 ${decision.rule}）：${decision.reason}`, { code: 'POLICY_ASK_REQUIRED', rule: decision.rule, reason: decision.reason, tool: name, fingerprint, source: decision.source });
    }
    this.record({ owner, tool: name, effect: 'deny', rule: decision.rule, reason: decision.reason });
    this.service.emit?.('tool-gate');
    fail('POLICY_DENIED', `工具 ${name} 被门禁策略拒绝（规则 ${decision.rule}）：${decision.reason} 不要改用其他工具或命令绕过；如确有需要请告知用户。`, { code: 'POLICY_DENIED', rule: decision.rule, reason: decision.reason, tool: name, source: decision.source });
  }
  record(event) {
    try {
      const file = this.file(GATE_EVENTS_FILE);
      fs.mkdirSync(this.directory, { recursive: true });
      try { if (fs.statSync(file).size > MAX_EVENTS_BYTES) fs.renameSync(file, file + '.1'); } catch {}
      const owner = event.owner ? crypto.createHash('sha256').update(String(event.owner)).digest('hex').slice(0, 16) : null;
      fs.appendFileSync(file, JSON.stringify({ at: now(), pid: process.pid, owner, tool: event.tool, effect: event.effect, rule: event.rule, reason: event.reason }) + '\n', 'utf8');
    } catch {}
  }
  recentEvents(limit = 50) {
    try { const lines = fs.readFileSync(this.file(GATE_EVENTS_FILE), 'utf8').trim().split('\n'); return lines.slice(-Math.min(Math.max(1, limit), 200)).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean); } catch { return []; }
  }
  completionGate(workspaceRoot, report) {
    const kinds = this.effectivePolicy(workspaceRoot).completion_gate.require_executed_check_kinds;
    const missing = kinds.filter(kind => !report.checks.some(check => check.kind === kind && check.status !== 'not_run'));
    if (missing.length) fail('POLICY_COMPLETION_GATE', '门禁策略要求完成前实际执行以下类型的检查（仍须引用对应真实终态命令回执）：' + missing.join(', ') + '。如未执行请提交 blocked 或 review，不要虚报。', { code: 'POLICY_COMPLETION_GATE', missing_check_kinds: missing });
  }

  // ---- persisted per-caller rule acknowledgements (separate file; schema 4 untouched)
  ackKey(identity) { return crypto.createHash('sha256').update(String(identity)).digest('hex').slice(0, 40); }
  persistedAck(identity, workspaceId) {
    if (!identity) return null;
    try { const entry = cachedJson(this.file(CALLER_ACKS_FILE), 4 * 1024 * 1024); return entry.exists ? entry.value?.acks?.[this.ackKey(identity)]?.[workspaceId]?.hash || null : null; } catch { return null; }
  }
  persistAck(identity, workspaceId, hash) {
    if (!identity || this.persistedAck(identity, workspaceId) === hash) return;
    const file = this.file(CALLER_ACKS_FILE);
    void withResourceLocks([file], async () => {
      let data; try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { data = null; }
      if (!data || data.format !== 'opencode.caller-rule-acks' || typeof data.acks !== 'object') data = { format: 'opencode.caller-rule-acks', version: 1, acks: {} };
      const key = this.ackKey(identity), item = data.acks[key] || {};
      item[workspaceId] = { hash, at: now() }; delete data.acks[key]; data.acks[key] = item;
      const keys = Object.keys(data.acks); for (const old of keys.slice(0, Math.max(0, keys.length - 512))) delete data.acks[old];
      await this.service.atomic(file, data);
    }).catch(error => this.service.options?.log?.('规则确认记录未保存：' + error.message));
  }

  // ---- limit extensions (local user only; separate file)
  extensions() { try { const entry = cachedJson(this.file(LIMIT_EXTENSIONS_FILE), 4 * 1024 * 1024); return entry.exists && entry.value && typeof entry.value === 'object' ? entry.value : {}; } catch { return {}; } }
  extraRequests(kind, id) { const value = this.extensions()?.[kind]?.[id]?.by; return Number.isSafeInteger(value) && value > 0 ? value : 0; }
  integrationExtra(runId) { const item = this.extensions()?.integration?.[runId] || {}; const n = v => Number.isSafeInteger(v) && v > 0 ? v : 0; return { files: n(item.files), fileKiB: n(item.file_kib), totalKiB: n(item.total_kib) }; }
  async extend(input = {}, actor = 'local-user') {
    if (actor !== 'local-user') fail('LIMIT_EXTEND_LOCAL_ONLY', '限额扩展只能由本地用户在本机界面确认，不能由模型工具发起。');
    const kind = input.kind, by = input.by === undefined ? undefined : Number(input.by);
    const bounded = (v, max, label) => { if (v === undefined || v === 0) return 0; if (!Number.isSafeInteger(v) || v < 1 || v > max) fail('LIMIT_EXTEND_INVALID', label + ' 必须是 1–' + max + ' 的整数。'); return v; };
    let bucket, id, patch;
    if (kind === 'attempt-model-requests') { bucket = 'attempts'; id = String(input.attempt_id || ''); if (!/^attempt_[a-f0-9-]{36}$/.test(id)) fail('LIMIT_EXTEND_INVALID', 'attempt_id 必须来自阻塞原因。'); patch = { by: bounded(by, 500, 'by') }; if (!patch.by) fail('LIMIT_EXTEND_INVALID', '请给出扩展的请求数 by。'); }
    else if (kind === 'team-model-requests') { bucket = 'runs'; id = String(input.run_id || ''); if (!/^team_[a-f0-9-]{36}$/.test(id)) fail('LIMIT_EXTEND_INVALID', 'run_id 必须来自阻塞原因。'); patch = { by: bounded(by, 2000, 'by') }; if (!patch.by) fail('LIMIT_EXTEND_INVALID', '请给出扩展的请求数 by。'); }
    else if (kind === 'integration') { bucket = 'integration'; id = String(input.run_id || ''); if (!/^team_[a-f0-9-]{36}$/.test(id)) fail('LIMIT_EXTEND_INVALID', 'run_id 必须来自阻塞原因。'); patch = { files: bounded(input.files === undefined ? by : Number(input.files), 300, 'files'), file_kib: bounded(input.file_kib === undefined ? undefined : Number(input.file_kib), 4096, 'file_kib'), total_kib: bounded(input.total_kib === undefined ? undefined : Number(input.total_kib), 16384, 'total_kib') }; if (!patch.files && !patch.file_kib && !patch.total_kib) fail('LIMIT_EXTEND_INVALID', '请至少给出 files / file_kib / total_kib 之一。'); }
    else fail('LIMIT_EXTEND_INVALID', 'kind 只能是 attempt-model-requests、team-model-requests 或 integration。');
    const file = this.file(LIMIT_EXTENSIONS_FILE);
    const value = await withResourceLocks([file], async () => {
      let data; try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') fail('LIMIT_EXTENSIONS_INVALID', '限额扩展文件无法解析，未改动：' + error.message); data = null; }
      if (!data || data.format !== 'opencode.collaboration-limit-extensions') data = { format: 'opencode.collaboration-limit-extensions', version: 1, attempts: {}, runs: {}, integration: {} };
      data[bucket] ||= {};
      const item = data[bucket][id] || {};
      for (const [key, add] of Object.entries(patch)) if (add) item[key] = Math.min((item[key] || 0) + add, key === 'by' ? 10000 : key === 'files' ? 1000 : 65536);
      item.updatedAt = now(); item.history = [...(item.history || []), { at: now(), by: actor, patch }].slice(-20);
      data[bucket][id] = item;
      await this.service.atomic(file, data);
      return { kind, id, totals: Object.fromEntries(Object.entries(item).filter(([key]) => !['history', 'updatedAt'].includes(key))) };
    });
    this.service.emit?.(kind === 'attempt-model-requests' ? 'executions' : 'staff-limit-extended');
    return value;
  }
  /** Structured block reason a local UI can turn into one "extend by N" action. */
  blockReason(kind, details) {
    const suggested = kind === 'attempt-model-requests' ? 6 : kind === 'team-model-requests' ? 20 : 10;
    return { code: 'LIMIT_REACHED', limit: kind, ...details, extend: { local_api: 'AutomationService.extendCollaborationLimit', workbench_action: 'extendLimit', kind, suggested_by: suggested, model_tool: false, note: '只能由本地用户确认扩展；扩展只追加额度，不重置已用量、不重放未知副作用。' } };
  }
}
