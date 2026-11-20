// member-custom.mjs — per-member (员工/API 成员) customization for 团队协作.
// All fields are optional; a member without them behaves exactly as before.
//   goal / backstory        personal prompt, layered ON TOP of the shared role instructions
//   tools                   allow-list over tool categories (null = unchanged)
//   writeScope              project-relative write paths/globs (null = unchanged)
//   confirm                 actions that need the user's approval before they run
//   reasoningEffort / temperature / maxOutputTokens   passed as the request `configuration`
//                           (the existing VS Code LM -> OpenCode provider path: options.configuration
//                           is merged over the per-model settings and read as modelConfiguration)
//   fallbackModel           {vendor,id}; on a provider error / rate limit before any output, retry once with it
// Pure helpers only (node:path); the extension wires them into the chat turns and the native worker loop.
import path from 'node:path';
import { fail, modelReference } from './collaboration-contracts.mjs';

export const MEMBER_CUSTOM_KEYS = ['goal', 'backstory', 'tools', 'writeScope', 'confirm', 'reasoningEffort', 'temperature', 'maxOutputTokens', 'fallbackModel'];
export const MEMBER_TOOL_CATEGORIES = [
  { id: 'read', label: '读取文件', hint: 'read_files、search_files、find_files、list_directory、lsp、诊断' },
  { id: 'write', label: '写入文件', hint: 'apply_patch（新增 / 修改 / 删除 / 移动文件）' },
  { id: 'command', label: '运行命令', hint: 'run_command、send_command_input 及其输出 / 取消' },
  { id: 'browser', label: '浏览器 / 屏幕查看', hint: 'see_now 和名字含 browser 的内置工具' }
];
export const MEMBER_CONFIRM_KINDS = [
  { id: 'command', label: '运行命令' },
  { id: 'delete', label: '删除文件' },
  { id: 'write', label: '任何文件写入' },
  { id: 'mcp', label: '调用 MCP 工具' }
];
export const MEMBER_REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'disabled'];
const READ = new Set(['read_files', 'read_image', 'find_files', 'search_files', 'list_directory', 'get_diagnostics', 'lsp', 'codebase_search', 'bridge_search_sessions', 'search_sessions']);
const WRITE = new Set(['apply_patch']);
const COMMAND = new Set(['run_command', 'send_command_input', 'get_command_output', 'cancel_command']);
const COMMAND_RUN = new Set(['run_command', 'send_command_input']);

const text = (value, max) => { if (value == null) return null; const s = String(value).replace(/\r\n/g, '\n').trim().slice(0, max); return s || null; };
const has = (input, key) => input && Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined;

export function mcpServerOf(name) { const m = /^ext__([a-z0-9_-]+?)__/i.exec(String(name || '')); return m ? m[1] : null; }
/** read | write | command | browser | mcp:<server> | control (always allowed: task/bridge/plan tools). */
export function toolCategory(name) {
  const n = String(name || '');
  const server = mcpServerOf(n); if (server) return 'mcp:' + server;
  if (WRITE.has(n)) return 'write';
  if (COMMAND.has(n)) return 'command';
  if (n === 'see_now' || /browser/i.test(n)) return 'browser';
  if (READ.has(n)) return 'read';
  return 'control';
}

export function normalizeScope(value) {
  if (value == null || value === '') return null;
  const source = Array.isArray(value) ? value : String(value).split(/\r?\n/);
  const out = [];
  for (const raw of source) {
    let item = String(raw ?? '').trim().replaceAll('\\', '/'); if (!item) continue;
    while (item.startsWith('./')) item = item.slice(2);
    item = item.replace(/\/+$/, '') || '.';
    if (item.startsWith('/') || /^[a-z]:/i.test(item) || item.split('/').some(part => part === '..' || part === '.git')) fail('MEMBER_SCOPE_INVALID', '写入范围必须是项目内的相对路径或通配符，不接受绝对路径、.. 或 .git：' + item);
    if (item.length > 512) fail('MEMBER_SCOPE_INVALID', '写入范围单项过长。');
    if (!out.includes(item)) out.push(item);
  }
  if (out.length > 30) fail('MEMBER_SCOPE_INVALID', '写入范围最多 30 项。');
  return out.length ? out : null;
}

/** Only the keys present in `input` are returned, so a partial save keeps the stored values. */
export function memberCustomInput(input = {}) {
  const out = {};
  if (has(input, 'goal')) out.goal = text(input.goal, 4000);
  if (has(input, 'backstory')) out.backstory = text(input.backstory, 4000);
  if (has(input, 'tools')) {
    if (input.tools === null) out.tools = null;
    else if (!Array.isArray(input.tools)) fail('MEMBER_TOOLS_INVALID', '工具清单必须是数组或 null。');
    else { const list = [...new Set(input.tools.map(String))]; const bad = list.filter(t => !/^(read|write|command|browser|mcp:[a-z0-9_-]{1,64})$/i.test(t)); if (bad.length) fail('MEMBER_TOOLS_INVALID', '未知的工具类别：' + bad.join('、')); if (list.length > 40) fail('MEMBER_TOOLS_INVALID', '工具类别过多。'); out.tools = list; }
  }
  if (has(input, 'writeScope')) out.writeScope = normalizeScope(input.writeScope);
  if (has(input, 'confirm')) {
    if (input.confirm === null) out.confirm = null;
    else { if (!Array.isArray(input.confirm)) fail('MEMBER_CONFIRM_INVALID', '确认项必须是数组。'); const ids = MEMBER_CONFIRM_KINDS.map(k => k.id), list = [...new Set(input.confirm.map(String))]; const bad = list.filter(k => !ids.includes(k)); if (bad.length) fail('MEMBER_CONFIRM_INVALID', '未知的确认项：' + bad.join('、')); out.confirm = list.length ? list : null; }
  }
  if (has(input, 'reasoningEffort')) { const v = input.reasoningEffort === null || input.reasoningEffort === '' ? null : String(input.reasoningEffort); if (v !== null && !MEMBER_REASONING_EFFORTS.includes(v)) fail('MEMBER_PARAM_INVALID', '推理强度只能是 ' + MEMBER_REASONING_EFFORTS.join('/') + '。'); out.reasoningEffort = v; }
  if (has(input, 'temperature')) { const v = input.temperature === null || input.temperature === '' ? null : Number(input.temperature); if (v !== null && !(Number.isFinite(v) && v >= 0 && v <= 2)) fail('MEMBER_PARAM_INVALID', '温度必须在 0–2 之间。'); out.temperature = v; }
  if (has(input, 'maxOutputTokens')) { const v = input.maxOutputTokens === null || input.maxOutputTokens === '' ? null : Number(input.maxOutputTokens); if (v !== null && !(Number.isSafeInteger(v) && v >= 1 && v <= 1e6)) fail('MEMBER_PARAM_INVALID', '最大输出 token 必须是 1–1000000 的整数。'); out.maxOutputTokens = v; }
  if (has(input, 'fallbackModel')) out.fallbackModel = input.fallbackModel ? modelReference(input.fallbackModel) : null;
  return out;
}
export function publicMemberCustom(value = {}) { const out = {}; for (const key of MEMBER_CUSTOM_KEYS) out[key] = value[key] ?? null; return out; }

// ---------------------------------------------------------------- prompt
/** Text appended after the role instructions. Empty when the member has no personal prompt and no limits. */
export function memberPromptLayer(member) {
  if (!member) return '';
  const lines = [];
  if (member.goal) lines.push('目标（交付物与验收标准）：\n' + member.goal);
  if (member.backstory) lines.push('背景 / 专长（技术栈、风格、禁忌）：\n' + member.backstory);
  const limits = [];
  if (Array.isArray(member.tools)) limits.push('可用工具类别：' + (member.tools.length ? member.tools.map(t => MEMBER_TOOL_CATEGORIES.find(c => c.id === t)?.label || (t.startsWith('mcp:') ? 'MCP ' + t.slice(4) : t)).join('、') : '仅协作/计划类工具'));
  if (member.writeScope?.length) limits.push('只允许写入：' + member.writeScope.join('、') + '（范围外的写入会被工具直接拒绝）');
  if (member.confirm?.length) limits.push('以下操作需要用户批准后才执行：' + member.confirm.map(k => MEMBER_CONFIRM_KINDS.find(c => c.id === k)?.label || k).join('、'));
  if (limits.length) lines.push('本成员的权限设置：\n- ' + limits.join('\n- '));
  if (!lines.length) return member.portLayer || '';
  return (member.portLayer || '') + `\n\n## 成员「${member.name || ''}」的个人设定（叠加在上面的岗位职责与共享规则之上，不替代它们；冲突时以岗位职责、规则和授权为准）\n` + lines.join('\n\n');
}

// ---------------------------------------------------------------- tools
/** Is this tool offered to the member? null tools = unchanged behaviour. */
export function memberAllowsTool(member, name) {
  const category = toolCategory(name);
  if (category === 'control') return true;
  if (!Array.isArray(member?.tools)) return !category.startsWith('mcp:'); // default: MCP tools stay out of native runs, as before
  return member.tools.includes(category);
}
export function memberWantsMcp(member, name) { const s = mcpServerOf(name); return !!s && Array.isArray(member?.tools) && member.tools.includes('mcp:' + s); }

export function patchTargets(patch) {
  const out = [];
  for (const line of String(patch || '').split(/\r?\n/)) {
    const m = /^\*\*\*\s+(Add|Update|Delete) File:\s*(.+?)\s*$/.exec(line); if (m) { out.push({ action: m[1].toLowerCase(), path: m[2] }); continue; }
    const mv = /^\*\*\*\s+Move to:\s*(.+?)\s*$/.exec(line); if (mv) out.push({ action: 'move', path: mv[1] });
  }
  return out;
}
function globRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') { if (glob[i + 1] === '*') { i++; if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*'; } else re += '[^/]*'; }
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$', process.platform === 'win32' ? 'i' : '');
}
export function scopeAllows(scope, relative) {
  if (!Array.isArray(scope) || !scope.length) return true;
  const rel = relative.replaceAll('\\', '/');
  return scope.some(item => {
    if (item === '.' || item === '**') return true;
    if (/[*?]/.test(item)) return globRegex(item).test(rel);
    const a = process.platform === 'win32' ? rel.toLowerCase() : rel, b = process.platform === 'win32' ? item.toLowerCase() : item;
    return a === b || a.startsWith(b + '/');
  });
}
/** Returns {code,message} when a write falls outside the member's writeScope, else null. */
export function memberWriteViolation(member, name, args, root) {
  if (!member?.writeScope?.length || name !== 'apply_patch') return null;
  const bad = [];
  for (const target of patchTargets(args?.patch)) {
    const abs = path.resolve(root || '.', target.path), rel = path.relative(path.resolve(root || '.'), abs).replaceAll('\\', '/');
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel) || !scopeAllows(member.writeScope, rel)) bad.push(target.path);
  }
  if (!bad.length) return null;
  return { code: 'MEMBER_WRITE_SCOPE', message: `MEMBER_WRITE_SCOPE: 成员「${member.name || ''}」的写入范围是 ${member.writeScope.join('、')}；以下路径不在范围内，补丁未执行：${bad.join('、')}。只修改范围内的文件，或请用户调整成员的写入范围。` };
}
/** Which confirm kind (if any) this call needs. */
export function memberConfirmKind(member, name, args) {
  const list = member?.confirm; if (!list?.length) return null;
  const targets = name === 'apply_patch' ? patchTargets(args?.patch) : [];
  if (list.includes('delete') && (targets.some(t => t.action === 'delete') || COMMAND_RUN.has(name) && /(^|[\s;&|(])(rm|rmdir|del|erase|rd|Remove-Item|ri)(\s|$)/i.test(String(args?.command ?? args?.input ?? '')))) return 'delete';
  if (list.includes('command') && COMMAND_RUN.has(name)) return 'command';
  if (list.includes('write') && name === 'apply_patch') return 'write';
  if (list.includes('mcp') && mcpServerOf(name)) return 'mcp';
  return null;
}
export function toolError(code, message) { return { isError: true, content: [{ type: 'text', text: message }], structuredContent: { error: { code, message } }, memberGuard: code }; }

// ---------------------------------------------------------------- model
/** Extra options for model.sendRequest: the per-request `configuration` the provider merges over its own model settings. */
export function memberRequestOptions(member) {
  const configuration = {};
  if (member?.reasoningEffort) configuration.reasoningEffort = member.reasoningEffort;
  if (member?.temperature != null) configuration.temperature = member.temperature;
  if (member?.maxOutputTokens != null) configuration.maxOutputTokens = member.maxOutputTokens;
  return Object.keys(configuration).length ? { configuration } : {};
}
const cancelled = error => /cancel|取消|abort/i.test(String(error?.name || '') + ' ' + String(error?.message || error || ''));
/**
 * run(model, markOutput) with one retry on `fallbackModel`: only when the primary failed before any output
 * was produced (so nothing is duplicated) and the failure is not a cancellation.
 * resolve(ref) -> model | null. retryable(error) can veto host-side errors. onSwitch(fallback, error) is told before the retry.
 */
export async function withFallbackModel(primary, member, run, { resolve, isCancelled, onSwitch, retryable } = {}) {
  let emitted = false;
  try { return await run(primary, () => { emitted = true; }); }
  catch (error) {
    const ref = member?.fallbackModel;
    if (!ref || emitted || isCancelled?.() || cancelled(error) || retryable && !retryable(error)) throw error;
    if (primary && ref.vendor === primary.vendor && ref.id === primary.id) throw error;
    const fallback = await resolve?.(ref);
    if (!fallback) throw error;
    onSwitch?.(fallback, error);
    return run(fallback, () => {});
  }
}
