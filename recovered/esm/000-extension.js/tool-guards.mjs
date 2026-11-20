// tool-guards.mjs — Bridge tool-call guards modelled on DeepSeek Harness plugins
// (tool-call-timeout-policy, spill-policy, repeat-tool-reminder, session-search).
// Self-implemented; no DSH code copied. Every export is pure or touches only its own files.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

// ---------------------------------------------------------------------------
// 1. Per-tool timeout
// ---------------------------------------------------------------------------
// Tools that wait on purpose, own their own deadline, or fan out to sub-calls that are guarded separately.
const TIMEOUT_EXEMPT = new Set([
  'bridge_batch', 'run_command', 'get_command_output', 'cancel_command', 'send_command_input', 'wait',
  'bridge_ask_user', 'bridge_wait_messages', 'bridge_wait_team', 'see_now'
]);
const TIMEOUT_DEFAULTS = { read: 60000, search: 90000, write: 60000, rea: 600000, external: 0, other: 120000 };

function envInt(name, env) {
  const raw = env?.[name];
  if (raw === undefined || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

/**
 * Deadline in ms for one tool call; 0 means no guard.
 * Overrides: OPENCODE_TOOL_TIMEOUT_MS_<TOOL_NAME_UPPER> > OPENCODE_TOOL_TIMEOUT_MS_<CATEGORY> > OPENCODE_TOOL_TIMEOUT_MS > defaults.
 * External MCP tools default to 0 because the MCP fallback layer already applies its own 120 s limit.
 */
export function toolTimeoutMs(toolName, category, env = process.env) {
  const name = String(toolName || '');
  if (TIMEOUT_EXEMPT.has(name)) return 0;
  const key = name.replace(/[^A-Za-z0-9]/g, '_').toUpperCase();
  const cat = String(category || 'other');
  const specific = envInt('OPENCODE_TOOL_TIMEOUT_MS_' + key, env);
  if (specific !== undefined) return specific;
  const byCategory = envInt('OPENCODE_TOOL_TIMEOUT_MS_' + cat.toUpperCase(), env);
  if (byCategory !== undefined) return byCategory;
  if (cat === 'external') return TIMEOUT_DEFAULTS.external;
  const global = envInt('OPENCODE_TOOL_TIMEOUT_MS', env);
  if (global !== undefined) return global;
  return TIMEOUT_DEFAULTS[cat] ?? TIMEOUT_DEFAULTS.other;
}

export function toolTimeoutResult(toolName, ms) {
  const message = `TOOL_TIMEOUT: ${toolName} 在 ${Math.round(ms / 1000)} 秒内没有返回，已停止等待并发出取消信号。` +
    `只读工具可缩小范围（更少文件、更具体的路径或模式）后重试；写入类工具请先用 read_files 核对目标文件是否已被改动，再决定是否重试，不要盲目重复。` +
    `可用环境变量 OPENCODE_TOOL_TIMEOUT_MS_${String(toolName).replace(/[^A-Za-z0-9]/g, '_').toUpperCase()} 调整（0 表示不限）。`;
  return { isError: true, content: [{ type: 'text', text: message }], structuredContent: { error: { code: 'TOOL_TIMEOUT', message, tool: toolName, timeout_ms: ms } } };
}

/**
 * Runs fn(signal) with a deadline. The combined signal aborts on the caller's signal or the deadline.
 * On the deadline a structured TOOL_TIMEOUT result is returned; work that ignores the signal may still finish in the background.
 */
export async function runWithToolTimeout(toolName, ms, callerSignal, fn) {
  if (!ms || ms <= 0) return fn(callerSignal);
  const controller = new AbortController();
  const signal = callerSignal ? AbortSignal.any([callerSignal, controller.signal]) : controller.signal;
  let timer;
  const deadline = new Promise((resolve) => { timer = setTimeout(() => { controller.abort(new Error('TOOL_TIMEOUT')); resolve(toolTimeoutResult(toolName, ms)); }, ms); });
  try {
    const work = Promise.resolve().then(() => fn(signal));
    work.catch(() => {});
    return await Promise.race([work, deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 2. Spill oversized tool text to disk
// ---------------------------------------------------------------------------
// Never spill results the model must read whole, that page themselves, or that are already images.
const SPILL_EXEMPT = new Set([
  'bridge_batch', 'read_files', 'read_file', 'read_image', 'see_now', 'get_command_output',
  'start', 'bridge_get_effective_rules', 'bridge_acknowledge_rules', 'set_todos', 'update_plan', 'report_progress',
  'bridge_ask_user', 'list_skills', 'bridge_memory_brief', 'bridge_memory_recall'
]);
const SPILL_RETENTION_MS = 3 * 24 * 3600 * 1000;
let lastSpillSweep = 0;

export function spillSettings(env = process.env) {
  const threshold = envInt('OPENCODE_SPILL_THRESHOLD_CHARS', env) ?? 30000;
  const head = Math.max(500, Math.min(envInt('OPENCODE_SPILL_HEAD_CHARS', env) ?? 6000, Math.floor(threshold / 2)));
  const tail = Math.max(500, Math.min(envInt('OPENCODE_SPILL_TAIL_CHARS', env) ?? 6000, Math.floor(threshold / 2)));
  return { threshold, head, tail };
}

export function spillRoot(env = process.env) {
  if (env.OPENCODE_SPILL_DIR) return env.OPENCODE_SPILL_DIR;
  const base = process.platform === 'win32' ? (env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')) : path.join(os.homedir(), '.local', 'share');
  return path.join(base, 'OpenCode', 'shared-automation', 'spill');
}

function sweepSpill(root, now) {
  if (now - lastSpillSweep < 3600 * 1000) return;
  lastSpillSweep = now;
  try {
    for (const day of fs.readdirSync(root)) {
      const dir = path.join(root, day);
      for (const owner of fs.readdirSync(dir)) {
        const ownerDir = path.join(dir, owner);
        for (const file of fs.readdirSync(ownerDir)) {
          const p = path.join(ownerDir, file);
          try { if (now - fs.statSync(p).mtimeMs > SPILL_RETENTION_MS) fs.unlinkSync(p); } catch {}
        }
        try { if (!fs.readdirSync(ownerDir).length) fs.rmdirSync(ownerDir); } catch {}
      }
      try { if (!fs.readdirSync(dir).length) fs.rmdirSync(dir); } catch {}
    }
  } catch {}
}

function writeSpill(root, owner, toolName, text, now) {
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, '');
  const ownerKey = crypto.createHash('sha256').update(String(owner || 'anonymous')).digest('hex').slice(0, 16);
  const dir = path.join(root, day, ownerKey);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${String(toolName).replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 60)}-${now}-${crypto.randomBytes(4).toString('hex')}.txt`;
  const file = path.join(dir, name);
  fs.writeFileSync(file, text, { encoding: 'utf8', mode: 0o600 });
  return file;
}

function clipped(text, file, settings) {
  const omitted = text.length - settings.head - settings.tail;
  const lines = text.split('\n').length;
  const display = file.replace(/\\/g, '/');
  return `${text.slice(0, settings.head)}\n\n[SPILLED: 输出共 ${text.length} 字符、约 ${lines} 行，中间 ${omitted} 字符已省略。完整内容已保存到 ${display}，` +
    `需要时用 read_files（按 start_line/end_line 分段）或 run_command 的 sed -n/grep 读取，不要为拿全文重复执行原调用。文件保留 3 天。]\n\n${text.slice(text.length - settings.tail)}`;
}

/**
 * Replaces oversized text in a tool result by head + tail and a spill-file locator. Never throws:
 * on any filesystem error the original result is returned unchanged.
 */
export function spillLargeResult(toolName, result, owner, { env = process.env, now = Date.now() } = {}) {
  try {
    if (!result || typeof result !== 'object' || SPILL_EXEMPT.has(String(toolName))) return result;
    const settings = spillSettings(env);
    if (!settings.threshold) return result;
    const content = Array.isArray(result.content) ? result.content : [];
    if (content.some((c) => c && c.type && c.type !== 'text')) return result; // images/resources: leave to their own budget
    const texts = content.filter((c) => c?.type === 'text' && typeof c.text === 'string');
    const total = texts.reduce((n, c) => n + c.text.length, 0);
    const structuredText = result.structuredContent ? JSON.stringify(result.structuredContent) : '';
    if (total <= settings.threshold && structuredText.length <= settings.threshold * 2) return result;
    const root = spillRoot(env);
    sweepSpill(root, now);
    let file = null;
    const fullText = texts.map((c) => c.text).join('\n');
    const fullBody = fullText.length >= structuredText.length ? fullText : structuredText;
    file = writeSpill(root, owner, toolName, fullBody, now);
    const nextContent = total > settings.threshold
      ? content.map((c) => (c?.type === 'text' && typeof c.text === 'string' && c.text.length > settings.head + settings.tail) ? { ...c, text: clipped(c.text, file, settings) } : c)
      : content;
    let structuredContent = result.structuredContent;
    if (structuredContent && typeof structuredContent === 'object' && structuredText.length > settings.threshold) {
      structuredContent = clipStructured(structuredContent, file, settings, 0);
      structuredContent = { ...structuredContent, spill: { path: file.replace(/\\/g, '/'), total_chars: fullBody.length } };
    }
    return { ...result, content: nextContent, ...(structuredContent !== undefined ? { structuredContent } : {}) };
  } catch {
    return result;
  }
}

function clipStructured(value, file, settings, depth) {
  if (typeof value === 'string') return value.length > settings.head + settings.tail ? clipped(value, file, settings) : value;
  if (depth > 4 || !value || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    const json = JSON.stringify(value);
    if (json.length <= settings.threshold) return value;
    const kept = [];
    let size = 2;
    for (const item of value) {
      const s = JSON.stringify(item)?.length ?? 0;
      if (size + s > settings.threshold) break;
      kept.push(item);
      size += s + 1;
    }
    return [...kept.map((v) => clipStructured(v, file, settings, depth + 1)), { _spilled: `其余 ${value.length - kept.length} 项见 ${file.replace(/\\/g, '/')}` }];
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = clipStructured(v, file, settings, depth + 1);
  return out;
}

// ---------------------------------------------------------------------------
// 3. Repeat-call reminder
// ---------------------------------------------------------------------------
const REPEAT_EXEMPT = new Set([
  'bridge_batch', 'get_command_output', 'wait', 'bridge_wait_messages', 'bridge_wait_team', 'set_todos', 'update_plan',
  'report_progress', 'bridge_ask_user', 'see_now', 'start', 'bridge_get_effective_rules', 'bridge_acknowledge_rules',
  // canvas-console: 群聊等待/读取本来就会反复调用
  'chat_wait', 'chat_read'
]);
const VOLATILE_ARG_KEYS = new Set(['reset_step_counter', 'host_step', 'execution_lease', 'expected_revision', 'expected_versions']);

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).filter((k) => !VOLATILE_ARG_KEYS.has(k)).sort().map((k) => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value) ?? 'undefined';
}

export class RepeatCallGuard {
  constructor({ threshold = 3, maxOwners = 500, env = process.env } = {}) {
    this.threshold = envInt('OPENCODE_REPEAT_TOOL_THRESHOLD', env) ?? threshold;
    this.maxOwners = maxOwners;
    this.byOwner = new Map();
  }
  /** Records one call and returns how many times in a row this owner made exactly this call (1 = first). */
  record(owner, toolName, args) {
    const name = String(toolName || '');
    if (!this.threshold || REPEAT_EXEMPT.has(name)) return 0;
    const key = name + '\u0000' + crypto.createHash('sha256').update(stable(args ?? {})).digest('hex');
    const id = String(owner || 'anonymous');
    const prev = this.byOwner.get(id);
    const count = prev && prev.key === key ? prev.count + 1 : 1;
    this.byOwner.delete(id);
    this.byOwner.set(id, { key, count });
    if (this.byOwner.size > this.maxOwners) this.byOwner.delete(this.byOwner.keys().next().value);
    return count;
  }
  /** Appends an advisory notice when the same call repeats `threshold` or more times in a row. */
  annotate(owner, toolName, args, result) {
    const count = this.record(owner, toolName, args);
    if (!count || count < this.threshold || !result || typeof result !== 'object') return result;
    const notice = `[REPEAT_TOOL_CALL] 这是本对话连续第 ${count} 次用完全相同的参数调用 ${toolName}，结果多半不会变。` +
      `请先看上一次结果里的错误或提示，换参数、缩小范围或改用其他工具；只有在等待外部状态变化时才继续重复。`;
    const content = Array.isArray(result.content) ? result.content : [];
    return { ...result, content: [...content, { type: 'text', text: notice }], repeat_call: { count } };
  }
}

// ---------------------------------------------------------------------------
// 10a. Session search over persisted Bridge task cards and their memory files
// ---------------------------------------------------------------------------
export const SESSION_SEARCH_TOOL = {
  name: 'bridge_search_sessions',
  title: '检索历史会话',
  description: '在当前工作区以前的 Bridge 对话里检索：任务卡标题、步骤、历史修订，以及各任务记忆目录中的交接单与工作日志（HANDOFF.md、*.md、*.jsonl）。' +
    '用于找回“上次做到哪、哪种方案失败过、某个文件或命令以前怎么处理”。只读；query 按空白拆成关键词，全部命中才算匹配（不区分大小写）。' +
    '返回 task_id、标题、状态、更新时间和命中片段；需要全文时用 read_files 读取返回的 file 路径。',
  inputSchema: {
    type: 'object',
    required: ['query'],
    properties: {
      query: { type: 'string', minLength: 1, maxLength: 500, description: '关键词，空格分隔，全部命中才算匹配。' },
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10, description: '最多返回多少个任务。' },
      include_memory: { type: 'boolean', default: true, description: '是否同时检索任务记忆目录中的文件。' },
      state: { type: 'string', enum: ['any', 'completed', 'blocked', 'cancelled', 'running', 'interrupted'], default: 'any', description: '只看某种状态的任务。' }
    },
    additionalProperties: false
  },
  annotations: { title: '检索历史会话', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
};

function snippetsFor(text, terms, max = 3, radius = 80) {
  const lower = text.toLowerCase();
  const out = [];
  let from = 0;
  while (out.length < max) {
    let best = -1;
    for (const t of terms) { const i = lower.indexOf(t, from); if (i >= 0 && (best < 0 || i < best)) best = i; }
    if (best < 0) break;
    const start = Math.max(0, best - radius), end = Math.min(text.length, best + radius);
    out.push((start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '…' : ''));
    from = end;
  }
  return out;
}

function memoryFiles(dir, limitFiles = 40, maxBytes = 512 * 1024) {
  const files = [];
  const walk = (d, depth) => {
    if (depth > 3 || files.length >= limitFiles) return;
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (files.length >= limitFiles) break;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/\.(?:md|jsonl|json|txt)$/i.test(e.name)) {
        try { if (fs.statSync(p).size <= maxBytes) files.push(p); } catch {}
      }
    }
  };
  walk(dir, 0);
  return files;
}

/** taskStore: BridgeTaskStore; returns a plain result object (never throws for a missing memory dir). */
export function searchSessions(taskStore, args) {
  const query = String(args?.query || '').trim();
  if (!query) throw new Error('query must be a non-empty string');
  const terms = [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))].slice(0, 12);
  const limit = Math.max(1, Math.min(50, Number(args?.limit) || 10));
  const includeMemory = args?.include_memory !== false;
  const wantState = args?.state && args.state !== 'any' ? args.state : null;
  const tasks = [...(taskStore?.tasks?.values?.() ?? [])];
  const hits = [];
  for (const task of tasks) {
    let pub;
    try { pub = taskStore.publicTask(task); } catch { continue; }
    if (wantState && pub.state !== wantState) continue;
    const cardText = [pub.title, ...(pub.todos || []).map((t) => `${t.title} (${t.status})`), ...(pub.history || []).flatMap((h) => (h.removed || []).map((t) => t.title))].join('\n');
    const sources = [];
    const lowerCard = cardText.toLowerCase();
    if (terms.every((t) => lowerCard.includes(t))) sources.push({ kind: 'task_card', snippets: snippetsFor(cardText, terms) });
    const dir = pub.memory?.memoryDir || pub.memory?.memoryRoot || null;
    if (includeMemory && dir) {
      for (const file of memoryFiles(dir)) {
        let text = '';
        try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
        const lower = text.toLowerCase();
        if (terms.every((t) => lower.includes(t))) sources.push({ kind: 'memory_file', file: file.replace(/\\/g, '/'), snippets: snippetsFor(text, terms) });
        if (sources.length >= 6) break;
      }
    }
    if (sources.length) hits.push({ task_id: pub.id, title: pub.title, state: pub.state, updated_at: pub.updatedAt ? new Date(pub.updatedAt).toISOString() : null, sources });
  }
  hits.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  const shown = hits.slice(0, limit);
  const lines = [`=== SESSION_SEARCH BEGIN ===`, `query: ${JSON.stringify(query)}`, `tasks_scanned: ${tasks.length}`, `matched: ${hits.length}`, `returned: ${shown.length}`];
  for (const h of shown) {
    lines.push(`--- TASK ${h.task_id} · ${h.state} · ${h.updated_at ?? '未知时间'} ---`, `title: ${h.title}`);
    for (const s of h.sources) {
      lines.push(s.kind === 'task_card' ? '[任务卡]' : `[记忆文件] ${s.file}`);
      for (const sn of s.snippets) lines.push('  ' + sn);
    }
  }
  if (!hits.length) lines.push('没有命中。换更少或更短的关键词再试；空结果不代表以前没做过（任务卡超过保留期会被清理）。');
  lines.push('=== SESSION_SEARCH END ===');
  return { content: [{ type: 'text', text: lines.join('\n') }], structuredContent: { query, tasks_scanned: tasks.length, matched: hits.length, results: shown } };
}
