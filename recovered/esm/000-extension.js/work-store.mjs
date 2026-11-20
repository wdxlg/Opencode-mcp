// 工作（Work board）：项目 + 工作项 + 评论/活动记录。
// 设计借鉴 Multica 的 issue 语义（只借概念，代码为 OpenCode 自行实现）：
//   - 代理开工前置 in_progress，交付进 in_review 并附摘要（可附 Git diff 统计）；
//   - done 只由用户在界面上设置；纯问答不改状态；blocked 必须写原因；
//   - 每个工作项带 revision，所有修改按 expected_revision 做乐观并发校验。
// 数据存放在共享存储根（与 automation-store / project-memory 相同的 shared-automation 目录）下的
// work/work-board.v1.json，原子写入（临时文件 + rename），跨进程互斥（锁目录 + 过期回收）。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const WORK_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled'];
export const WORK_STATUS_LABELS = { backlog: '待规划', todo: '待办', in_progress: '进行中', in_review: '待验收', done: '已完成', blocked: '受阻', cancelled: '已取消' };
export const WORK_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'];
const ASSIGNEE_KINDS = new Set(['user', 'session', 'agent', 'automation']);
const MAX_COMMENTS = 400, MAX_ACTIVITY = 400, MAX_ITEMS = 5000;

export class WorkError extends Error {
  constructor(code, message, details) { super(`${code}: ${message}`); this.code = code; this.reason = message; if (details) this.details = details; }
}
const fail = (code, message, details) => { throw new WorkError(code, message, details); };

/** Same root rule as AutomationService: OPENCODE_AUTOMATION_HOME, else %LOCALAPPDATA%/OpenCode/shared-automation. */
export function sharedAutomationRoot(env = process.env) {
  const custom = env.OPENCODE_AUTOMATION_HOME?.trim();
  if (custom) return path.resolve(custom);
  const userRoot = process.platform === 'win32' ? (env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')) : (env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'));
  return path.join(userRoot, 'OpenCode', 'shared-automation');
}

const nowIso = (ms = Date.now()) => new Date(ms).toISOString();
const newId = prefix => `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
const text = (value, max) => { if (value === undefined || value === null) return ''; const s = String(value).replace(/\r\n/g, '\n').trim(); return s.length > max ? s.slice(0, max) : s; };
const sleepSync = ms => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch {} };

/** Atomic JSON write: temp file in the same directory, then rename over the target. */
export function writeJsonAtomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 1) + '\n');
  for (let i = 0; ; i++) {
    try { fs.renameSync(tmp, file); return; }
    catch (error) { if (i >= 20 || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) { try { fs.rmSync(tmp, { force: true }); } catch {} throw error; } sleepSync(25); }
  }
}
const corruptBackedUp = new Set();
// migration-step01: 文件存在但解析失败（写到一半、编码损坏、更新版本的格式）时先把原文留底为 *.corrupt-<时间>.bak，
// 再返回默认值；否则调用方随后写回默认值会把用户原数据整份覆盖。同一份损坏内容只留底一次。
export function readJson(file, fallback) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return fallback; }
  try { return JSON.parse(text.replace(/^\uFEFF/, '')); } catch {
    const key = file + ':' + text.length + ':' + text.slice(0, 64);
    if (text.trim() && !corruptBackedUp.has(key)) {
      corruptBackedUp.add(key);
      try { fs.writeFileSync(file + '.corrupt-' + Date.now() + '.bak', text, { flag: 'wx' }); } catch {}
    }
    return fallback;
  }
}

/** Cross-process mutex: mkdir is atomic on every platform. A lock older than staleMs is reclaimed. */
export function withFileLock(lockDir, fn, { timeoutMs = 8000, staleMs = 15000 } = {}) {
  fs.mkdirSync(path.dirname(lockDir), { recursive: true });
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try { fs.mkdirSync(lockDir); break; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try { const age = Date.now() - fs.statSync(lockDir).mtimeMs; if (age > staleMs) { fs.rmSync(lockDir, { recursive: true, force: true }); continue; } } catch { continue; }
      if (Date.now() > deadline) fail('WORK_LOCK_TIMEOUT', '数据文件正被另一个进程写入，稍后重试。');
      sleepSync(30);
    }
  }
  try { try { fs.writeFileSync(path.join(lockDir, 'owner'), String(process.pid)); } catch {} return fn(); }
  finally { try { fs.rmSync(lockDir, { recursive: true, force: true }); } catch {} }
}

function emptyBoard() { return { version: 1, revision: 0, projects: [], items: [] }; }

// ---- Git helpers (baseline at in_progress, diff stat at in_review). Bounded and optional. ----
function git(root, args) { return execFileSync('git', ['-c', 'core.quotepath=false', '-C', root, ...args], { encoding: 'utf8', timeout: 4000, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
export function gitHead(root) { if (!root) return null; try { return fs.existsSync(root) ? git(root, ['rev-parse', 'HEAD']) || null : null; } catch { return null; } }
export function gitDiffStat(root, base) {
  if (!root || !base) return null;
  try { const stat = git(root, ['diff', '--shortstat', base]); return stat || '与基线相比已跟踪文件无变化（未统计未跟踪文件）'; } catch { return null; }
}

export class WorkStore {
  constructor({ directory = sharedAutomationRoot(), now = () => Date.now() } = {}) {
    this.directory = path.join(directory, 'work');
    this.file = path.join(this.directory, 'work-board.v1.json');
    this.lockDir = path.join(this.directory, '.work-board.lock');
    this.now = now;
    this.listeners = new Set();
    this.cache = { mtimeMs: -1, value: null };
  }
  onDidChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of [...this.listeners]) { try { fn(); } catch {} } }
  read() {
    let mtimeMs = 0; try { mtimeMs = fs.statSync(this.file).mtimeMs; } catch {}
    if (this.cache.value && this.cache.mtimeMs === mtimeMs) return this.cache.value;
    const raw = mtimeMs ? readJson(this.file, null) : null;
    if (mtimeMs && !raw) fail('WORK_DATA_UNREADABLE', `工作看板数据无法解析：${this.file}。原文件不会被覆盖，请先修复或移走它。`);
    const value = raw && Array.isArray(raw.items) ? { ...emptyBoard(), ...raw } : emptyBoard();
    this.cache = { mtimeMs, value };
    return value;
  }
  mutate(fn) {
    const result = withFileLock(this.lockDir, () => {
      this.cache.mtimeMs = -1;
      const state = structuredClone(this.read());
      const out = fn(state);
      state.revision = (state.revision || 0) + 1;
      if (state.items.length > MAX_ITEMS) {
        const removable = state.items.filter(i => i.status === 'done' || i.status === 'cancelled').sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        const drop = new Set(removable.slice(0, state.items.length - MAX_ITEMS).map(i => i.id));
        state.items = state.items.filter(i => !drop.has(i.id));
      }
      writeJsonAtomic(this.file, state);
      this.cache = { mtimeMs: -1, value: null };
      return out;
    });
    this.emit();
    return result;
  }

  // ---------- projects ----------
  projects() { return this.read().projects; }
  findProject(state, ref) {
    if (!ref) return null;
    const key = String(ref).trim();
    return state.projects.find(p => p.id === key) || state.projects.find(p => p.name === key) || null;
  }
  saveProject(input = {}) {
    return this.mutate(state => {
      const name = text(input.name, 120); if (!name) fail('WORK_PROJECT_NAME_REQUIRED', '项目名称不能为空。');
      const folder = text(input.folder, 1000);
      if (folder && !path.isAbsolute(folder)) fail('WORK_PROJECT_FOLDER_INVALID', '项目文件夹必须是绝对路径。');
      let project = input.id ? state.projects.find(p => p.id === input.id) : null;
      if (input.id && !project) fail('WORK_PROJECT_UNKNOWN', '项目不存在。');
      if (state.projects.some(p => p.name === name && p.id !== project?.id)) fail('WORK_PROJECT_DUPLICATE', `已有同名项目「${name}」。`);
      const at = nowIso(this.now());
      if (!project) { project = { id: newId('proj'), name, folder, description: text(input.description, 4000), createdAt: at, updatedAt: at }; state.projects.push(project); }
      else Object.assign(project, { name, folder, description: text(input.description ?? project.description, 4000), updatedAt: at });
      return structuredClone(project);
    });
  }
  deleteProject(id) {
    return this.mutate(state => {
      const project = state.projects.find(p => p.id === id); if (!project) fail('WORK_PROJECT_UNKNOWN', '项目不存在。');
      const used = state.items.filter(i => i.projectId === id && !['done', 'cancelled'].includes(i.status)).length;
      if (used) fail('WORK_PROJECT_IN_USE', `项目仍有 ${used} 个未结束的工作项，不能删除。`);
      state.projects = state.projects.filter(p => p.id !== id);
      for (const item of state.items) if (item.projectId === id) item.projectId = null;
      return { deleted: true, id };
    });
  }
  ensureProjectByName(state, name, folder = '') {
    let project = this.findProject(state, name);
    if (!project) { const at = nowIso(this.now()); project = { id: newId('proj'), name: text(name, 120), folder: text(folder, 1000), description: '', createdAt: at, updatedAt: at }; state.projects.push(project); }
    return project;
  }

  // ---------- items ----------
  item(state, id) { const item = state.items.find(i => i.id === id); if (!item) fail('WORK_ITEM_UNKNOWN', `工作项 ${id} 不存在；先用 work_list 获取真实 ID。`); return item; }
  get(id) { return structuredClone(this.item(this.read(), id)); }
  list({ projectId, status, assigneeId, includeClosed = true, limit = 500 } = {}) {
    const state = this.read();
    let items = state.items;
    if (projectId) items = items.filter(i => i.projectId === projectId);
    if (status) { const set = new Set([].concat(status)); items = items.filter(i => set.has(i.status)); }
    else if (!includeClosed) items = items.filter(i => !['done', 'cancelled'].includes(i.status));
    if (assigneeId) items = items.filter(i => i.assignee?.id === assigneeId);
    return items.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit).map(i => structuredClone(i));
  }
  normalizeAssignee(value) {
    if (value === null || value === undefined || value === '' || value === 'none') return null;
    if (typeof value !== 'object') fail('WORK_ASSIGNEE_INVALID', '负责人格式无效。');
    const kind = String(value.kind || ''); if (!ASSIGNEE_KINDS.has(kind)) fail('WORK_ASSIGNEE_INVALID', '负责人类型必须是 user / session / agent / automation。');
    const id = kind === 'user' ? 'user' : text(value.id, 300); if (!id) fail('WORK_ASSIGNEE_INVALID', '负责人缺少 ID。');
    return { kind, id, name: text(value.name || (kind === 'user' ? '我' : id), 120) };
  }
  pushActivity(item, actor, action, detail) {
    item.activity.push({ id: newId('act'), at: nowIso(this.now()), actor: actor?.name || actor?.id || 'system', actorKind: actor?.kind || 'system', action, ...(detail ? { detail: text(detail, 2000) } : {}) });
    if (item.activity.length > MAX_ACTIVITY) item.activity.splice(0, item.activity.length - MAX_ACTIVITY);
  }
  pushComment(item, actor, body, kind = 'comment') {
    const value = text(body, 16000); if (!value) return null;
    const comment = { id: newId('cmt'), at: nowIso(this.now()), author: actor?.name || actor?.id || 'system', authorKind: actor?.kind || 'system', authorId: actor?.id || null, kind, body: value };
    item.comments.push(comment);
    if (item.comments.length > MAX_COMMENTS) item.comments.splice(0, item.comments.length - MAX_COMMENTS);
    return comment;
  }
  create(input = {}, actor = { kind: 'user', id: 'user', name: '我' }) {
    return this.mutate(state => {
      const title = text(input.title, 300); if (!title) fail('WORK_TITLE_REQUIRED', '工作项标题不能为空。');
      const status = input.status || 'todo';
      if (!WORK_STATUSES.includes(status)) fail('WORK_STATUS_INVALID', `状态必须是 ${WORK_STATUSES.join(' / ')}。`);
      if (status === 'done' && actor.kind !== 'user') fail('WORK_DONE_USER_ONLY', 'done 只能由用户在「工作」页面设置；代理交付请用 in_review。');
      if (status === 'blocked' && !text(input.blockedReason, 2000)) fail('WORK_BLOCKED_REASON_REQUIRED', 'blocked 必须写明受阻原因（blocked_reason）。');
      const priority = input.priority || 'none'; if (!WORK_PRIORITIES.includes(priority)) fail('WORK_PRIORITY_INVALID', `优先级必须是 ${WORK_PRIORITIES.join(' / ')}。`);
      let project = null;
      if (input.projectId) { project = state.projects.find(p => p.id === input.projectId); if (!project) fail('WORK_PROJECT_UNKNOWN', '项目不存在。'); }
      else if (input.projectName) project = this.ensureProjectByName(state, input.projectName, input.projectFolder);
      const at = nowIso(this.now());
      const item = {
        id: newId('work'), number: (state.items.reduce((m, i) => Math.max(m, i.number || 0), 0) + 1), title, description: text(input.description, 32000),
        projectId: project?.id || null, status, blockedReason: status === 'blocked' ? text(input.blockedReason, 2000) : '', priority,
        assignee: this.normalizeAssignee(input.assignee), createdBy: { kind: actor.kind, id: actor.id, name: actor.name },
        taskId: text(input.taskId, 200) || null, automationId: text(input.automationId, 200) || null, runId: text(input.runId, 200) || null,
        folder: text(input.folder || project?.folder, 1000) || null, git: null, delivery: null,
        comments: [], activity: [], revision: 1, createdAt: at, updatedAt: at, startedAt: status === 'in_progress' ? at : null, completedAt: null
      };
      this.pushActivity(item, actor, 'created', `状态 ${WORK_STATUS_LABELS[status]}`);
      if (status === 'in_progress') this.captureBaseline(item);
      state.items.push(item);
      return structuredClone(item);
    });
  }
  captureBaseline(item, baselineHint) {
    const head = baselineHint || gitHead(item.folder);
    if (head) item.git = { root: item.folder, baseline: head, capturedAt: nowIso(this.now()), diffStat: item.git?.diffStat || null };
  }
  /**
   * The single mutation path for items. `actor.kind==='user'` is the local UI; everything else is an agent/session/automation.
   * input: { expected_revision, status, blockedReason, comment, summary, assignee, title, description, priority, projectId, taskId }
   */
  update(id, input = {}, actor = { kind: 'user', id: 'user', name: '我' }, hooks = {}) {
    return this.mutate(state => {
      const item = this.item(state, id);
      if (!Number.isSafeInteger(input.expected_revision)) fail('WORK_REVISION_REQUIRED', '修改工作项必须带 expected_revision（先 work_get 读取当前 revision）。', { id, revision: item.revision });
      if (input.expected_revision !== item.revision) fail('WORK_REVISION_CONFLICT', `工作项已被修改（当前 revision=${item.revision}）。重新读取后再改。`, { id, revision: item.revision, status: item.status });
      const isUser = actor.kind === 'user';
      let changed = false;
      for (const [key, max] of [['title', 300], ['description', 32000]]) {
        if (input[key] !== undefined) { const v = text(input[key], max); if (key === 'title' && !v) fail('WORK_TITLE_REQUIRED', '标题不能为空。'); if (v !== item[key]) { item[key] = v; changed = true; this.pushActivity(item, actor, key === 'title' ? 'renamed' : 'edited_description'); } }
      }
      if (input.priority !== undefined && input.priority !== item.priority) { if (!WORK_PRIORITIES.includes(input.priority)) fail('WORK_PRIORITY_INVALID', '优先级无效。'); this.pushActivity(item, actor, 'priority', `${item.priority} → ${input.priority}`); item.priority = input.priority; changed = true; }
      if (input.projectId !== undefined && input.projectId !== item.projectId) {
        if (input.projectId && !state.projects.some(p => p.id === input.projectId)) fail('WORK_PROJECT_UNKNOWN', '项目不存在。');
        item.projectId = input.projectId || null; const p = state.projects.find(x => x.id === item.projectId); if (p?.folder && !item.folder) item.folder = p.folder;
        this.pushActivity(item, actor, 'moved_project', p?.name || '无项目'); changed = true;
      }
      if (input.folder !== undefined) { const f = text(input.folder, 1000); if (f && !path.isAbsolute(f)) fail('WORK_FOLDER_INVALID', '文件夹必须是绝对路径。'); if ((f || null) !== item.folder) { item.folder = f || null; changed = true; } }
      if (input.taskId !== undefined && (text(input.taskId, 200) || null) !== item.taskId) { item.taskId = text(input.taskId, 200) || null; this.pushActivity(item, actor, 'linked_task', item.taskId || '解除关联'); changed = true; }
      if (input.assignee !== undefined) {
        const next = this.normalizeAssignee(input.assignee);
        if (JSON.stringify(next) !== JSON.stringify(item.assignee)) { this.pushActivity(item, actor, 'assigned', next ? `${next.name}（${next.kind}）` : '取消指派'); item.assignee = next; changed = true; }
      }
      if (input.status !== undefined && input.status !== item.status) {
        const next = input.status;
        if (!WORK_STATUSES.includes(next)) fail('WORK_STATUS_INVALID', `状态必须是 ${WORK_STATUSES.join(' / ')}。`);
        if (next === 'done' && !isUser) fail('WORK_DONE_USER_ONLY', 'done 只能由用户在「工作」页面设置；交付请改为 in_review 并附 summary。');
        const reason = text(input.blockedReason, 2000);
        if (next === 'blocked' && !reason) fail('WORK_BLOCKED_REASON_REQUIRED', '改为 blocked 必须写明受阻原因（blocked_reason）。');
        const summary = text(input.summary ?? (next === 'in_review' && !isUser ? input.comment : ''), 16000);
        if (next === 'in_review' && !isUser && !summary) fail('WORK_SUMMARY_REQUIRED', '交付到 in_review 必须附 summary（做了什么、如何验证、未完成项）。');
        const from = item.status; item.status = next; changed = true;
        item.blockedReason = next === 'blocked' ? reason : '';
        const at = nowIso(this.now());
        if (next === 'in_progress') { item.startedAt ||= at; if (!item.git?.baseline) this.captureBaseline(item, hooks.baselineFor?.(item)); }
        if (next === 'done' || next === 'cancelled') item.completedAt = at; else item.completedAt = null;
        if (next === 'in_review') {
          const diffStat = item.git?.baseline ? gitDiffStat(item.git.root || item.folder, item.git.baseline) : null;
          if (item.git && diffStat) item.git.diffStat = diffStat;
          item.delivery = { at, by: actor.name || actor.id, summary: summary || text(input.comment, 16000), diffStat };
          if (summary) this.pushComment(item, actor, summary + (diffStat ? `\n\n— 改动统计（相对开工基线 ${item.git.baseline.slice(0, 10)}）：${diffStat}` : ''), 'delivery');
        }
        this.pushActivity(item, actor, 'status', `${WORK_STATUS_LABELS[from]} → ${WORK_STATUS_LABELS[next]}${next === 'blocked' ? '：' + reason : ''}`);
      } else if (input.blockedReason !== undefined && item.status === 'blocked') {
        const reason = text(input.blockedReason, 2000); if (!reason) fail('WORK_BLOCKED_REASON_REQUIRED', 'blocked 必须保留受阻原因。');
        if (reason !== item.blockedReason) { item.blockedReason = reason; this.pushActivity(item, actor, 'blocked_reason', reason); changed = true; }
      }
      // in_review by an agent without summary used the comment as the summary above; do not post it twice.
      const commentUsedAsSummary = input.status === 'in_review' && input.status !== undefined && !isUser && !text(input.summary, 16000) && item.status === 'in_review' && item.delivery?.summary === text(input.comment, 16000);
      if (input.comment !== undefined && text(input.comment, 16000) && !commentUsedAsSummary) { this.pushComment(item, actor, input.comment); changed = true; }
      if (!changed) return { ...structuredClone(item), unchanged: true };
      item.revision += 1; item.updatedAt = nowIso(this.now());
      return structuredClone(item);
    });
  }
  /** Agent claims an item: becomes assignee, status in_progress, task card linked, git baseline captured. */
  claim(id, actor, { expectedRevision, taskId, baselineFor } = {}) {
    if (!actor || actor.kind === 'user') fail('WORK_CLAIM_AGENT_ONLY', 'work_claim 供代理/会话使用。');
    const current = this.get(id);
    if (['done', 'cancelled'].includes(current.status)) fail('WORK_ITEM_CLOSED', `工作项已${WORK_STATUS_LABELS[current.status]}，不能领取。`);
    if (current.assignee && current.assignee.kind !== 'user' && current.assignee.id !== actor.id && current.status === 'in_progress') fail('WORK_ITEM_TAKEN', `工作项正由 ${current.assignee.name} 处理中。`, { assignee: current.assignee, revision: current.revision });
    return this.update(id, { expected_revision: expectedRevision ?? current.revision, assignee: { kind: actor.kind, id: actor.id, name: actor.name }, status: 'in_progress', ...(taskId && !current.taskId ? { taskId } : {}) }, actor, { baselineFor });
  }
  remove(id) { return this.mutate(state => { this.item(state, id); state.items = state.items.filter(i => i.id !== id); return { deleted: true, id }; }); }
  snapshot({ projectId } = {}) {
    const state = this.read();
    const items = (projectId ? state.items.filter(i => i.projectId === projectId) : state.items).map(i => ({ ...i, comments: i.comments.slice(-80), activity: i.activity.slice(-80) }));
    return { revision: state.revision, projects: state.projects, items, statuses: WORK_STATUSES.map(id => ({ id, name: WORK_STATUS_LABELS[id] })), priorities: WORK_PRIORITIES, file: this.file };
  }
}

// ---------------- Bridge MCP tools (compact) ----------------
const str = d => ({ type: 'string', description: d });
const def = (name, title, description, properties, required = [], readOnly = false) => ({
  name, title, description,
  inputSchema: { type: 'object', properties, ...(required.length ? { required } : {}), additionalProperties: false },
  outputSchema: { type: 'object', additionalProperties: true },
  annotations: { title, readOnlyHint: readOnly, destructiveHint: false, idempotentHint: readOnly, openWorldHint: false }
});
const statusEnum = { type: 'string', enum: WORK_STATUSES };
export const WORK_TOOL_DEFINITIONS = [
  def('work_list', '列出工作项', '「工作」看板：按项目/状态/负责人列出工作项（不含评论）。mine=true 只看指派给本对话的。', { project: str('项目 ID 或名称。'), status: { type: 'array', items: statusEnum, description: '状态过滤。' }, mine: { type: 'boolean' }, include_closed: { type: 'boolean', description: '包含 done/cancelled（默认否）。' }, limit: { type: 'integer', minimum: 1, maximum: 200 } }, [], true),
  def('work_get', '读取工作项', '读取一个工作项的完整描述、评论、活动记录与当前 revision。', { id: str('work_list 返回的 ID。') }, ['id'], true),
  def('work_create', '创建工作项', '新建工作项（默认 todo；backlog=停车场）。不能直接建为 done。', { title: str('标题。'), description: str('目标与验收标准。'), project: str('项目 ID 或名称；名称不存在时新建。'), status: { type: 'string', enum: ['backlog', 'todo', 'in_progress'] }, priority: { type: 'string', enum: WORK_PRIORITIES }, assign_to_me: { type: 'boolean' } }, ['title']),
  def('work_update', '更新工作项', '按 expected_revision 修改：status（开工 in_progress；交付 in_review 必带 summary；blocked 必带 blocked_reason；done 只能由用户设）、comment、assignee（me/user/none）、标题/描述/优先级。纯问答不要改状态。', { id: str('工作项 ID。'), expected_revision: { type: 'integer', minimum: 1 }, status: statusEnum, summary: str('交付摘要：做了什么、如何验证、遗留项。'), blocked_reason: str('受阻原因。'), comment: str('评论。'), assignee: { type: 'string', enum: ['me', 'user', 'none'] }, title: str('新标题。'), description: str('新描述。'), priority: { type: 'string', enum: WORK_PRIORITIES } }, ['id', 'expected_revision']),
  def('work_claim', '领取工作项', '把工作项指派给本对话并置 in_progress，关联当前任务卡、记录 Git 基线。开始动手前调用。', { id: str('工作项 ID。'), expected_revision: { type: 'integer', minimum: 1 } }, ['id'])
];
export const WORK_TOOL_NAMES = new Set(WORK_TOOL_DEFINITIONS.map(t => t.name));
export const READ_ONLY_WORK_TOOL_NAMES = new Set(['work_list', 'work_get']);
export const WORK_BRIDGE_RULE = '「工作」看板：work_list/work_get/work_create/work_update/work_claim。动手前 work_claim 或置 in_progress；交付置 in_review 并附 summary；done 只由用户设；纯问答不改状态；blocked 必写原因；修改带 expected_revision。';

function compactItem(item, projects) {
  const p = projects.find(x => x.id === item.projectId);
  return { id: item.id, number: item.number, title: item.title, status: item.status, priority: item.priority, project: p?.name || null, assignee: item.assignee ? `${item.assignee.name}（${item.assignee.kind}）` : null, revision: item.revision, updated_at: item.updatedAt, ...(item.blockedReason ? { blocked_reason: item.blockedReason } : {}), ...(item.taskId ? { task_id: item.taskId } : {}) };
}

/**
 * Execute one work_* tool. ctx: { actor:{kind,id,name}, taskIdFor(owner)?, baselineFor(item)? }
 * Returns a plain object; callers wrap it as an MCP result.
 */
export function handleWorkTool(store, name, args = {}, ctx = {}) {
  const actor = ctx.actor; if (!actor?.id) fail('CALLER_IDENTITY_REQUIRED', '调用者身份不可用。');
  const state = store.read();
  if (name === 'work_list') {
    const project = args.project ? store.findProject(state, args.project) : null;
    if (args.project && !project) fail('WORK_PROJECT_UNKNOWN', `项目「${args.project}」不存在。`, { projects: state.projects.map(p => p.name) });
    const items = store.list({ projectId: project?.id, status: Array.isArray(args.status) && args.status.length ? args.status : undefined, assigneeId: args.mine ? actor.id : undefined, includeClosed: args.include_closed === true, limit: Math.min(200, args.limit || 50) });
    return { items: items.map(i => compactItem(i, state.projects)), projects: state.projects.map(p => ({ id: p.id, name: p.name })), rule: WORK_BRIDGE_RULE };
  }
  if (name === 'work_get') {
    const item = store.get(args.id);
    return { ...compactItem(item, state.projects), description: item.description, folder: item.folder, git: item.git, delivery: item.delivery, comments: item.comments.slice(-30), activity: item.activity.slice(-30), created_by: item.createdBy };
  }
  if (name === 'work_create') {
    const project = args.project ? store.findProject(state, args.project) : null;
    const item = store.create({ title: args.title, description: args.description, projectId: project?.id, projectName: project ? undefined : args.project, status: args.status || 'todo', priority: args.priority, assignee: args.assign_to_me || args.status === 'in_progress' ? actor : null, taskId: args.status === 'in_progress' ? ctx.taskIdFor?.() : undefined }, actor);
    return { created: true, item: compactItem(item, store.read().projects) };
  }
  if (name === 'work_update') {
    const input = { expected_revision: args.expected_revision };
    for (const key of ['status', 'summary', 'comment', 'title', 'description', 'priority']) if (args[key] !== undefined) input[key] = args[key];
    if (args.blocked_reason !== undefined) input.blockedReason = args.blocked_reason;
    if (args.assignee !== undefined) input.assignee = args.assignee === 'me' ? actor : args.assignee === 'user' ? { kind: 'user', id: 'user', name: '我' } : null;
    if (args.status === 'in_progress') { const t = ctx.taskIdFor?.(); const cur = store.get(args.id); if (t && !cur.taskId) input.taskId = t; }
    const item = store.update(args.id, input, actor, { baselineFor: ctx.baselineFor });
    return { updated: !item.unchanged, item: compactItem(item, store.read().projects), ...(item.delivery && args.status === 'in_review' ? { delivery: item.delivery } : {}) };
  }
  if (name === 'work_claim') {
    const item = store.claim(args.id, actor, { expectedRevision: args.expected_revision, taskId: ctx.taskIdFor?.(), baselineFor: ctx.baselineFor });
    return { claimed: true, item: compactItem(item, store.read().projects), git_baseline: item.git?.baseline || null, next: '完成后 work_update(status="in_review", summary=...)；受阻 status="blocked" + blocked_reason。' };
  }
  fail('TOOL_UNKNOWN', `未知工作工具：${name}`);
}

/** MCP caller identity → assignee. native-chat owners are OpenCode chat sessions; everything else is a Bridge agent. */
export function actorForOwner(owner, displayName) {
  const id = String(owner || '');
  if (id.startsWith('native-chat:autopilot:')) return { kind: 'automation', id, name: displayName || '自动化运行' };
  if (id.startsWith('native-chat:')) return { kind: 'session', id, name: displayName || 'OpenCode 对话 ' + id.slice(-6) };
  return { kind: 'agent', id, name: displayName || 'Bridge 代理 ' + crypto.createHash('sha256').update(id).digest('hex').slice(0, 6) };
}
