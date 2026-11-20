// collab-ports.mjs — 团队协作画布的「接口节点」与协作事件。
// 成员节点平时不显示这些接口；把一个提供节点（人设 / 模型 / 权限 / 工具包 / 共享工作区 / 文档 / 规范 / 共享看板）
// 或另一位成员的「产物 / 结论」输出连到成员上，成员身上才出现对应的接口，接上就覆盖（或并入）该成员的那一项设置。
// 数据都在团队文件里：team.providers（节点）、team.feeds（接线）、team.board（看板条目）、team.events（协作事件）。
// 纯函数，不依赖 vscode；扩展在 teamAsk / 原生任务 / 画布快照里调用 effectiveMember 与 teamEvent。
import path from 'node:path';
import { memberCustomInput, normalizeScope, patchTargets } from './member-custom.mjs';
import { fail, modelReference } from './collaboration-contracts.mjs';

/** 成员的输入口。single = 只能接一根线；list = 可接多根，按线上的 mode 覆盖或合并。 */
export const PORTS = {
  persona:   { label: '人设',   kind: 'single', hint: '覆盖目标与背景' },
  model:     { label: '模型',   kind: 'single', hint: '覆盖模型、备用模型和模型参数' },
  perm:      { label: '权限',   kind: 'single', hint: '覆盖写入范围和需要批准的操作' },
  tools:     { label: '工具',   kind: 'list',   hint: '覆盖或并入可用工具类别 / MCP' },
  workspace: { label: '工作区', kind: 'single', hint: '指定工作目录，和接同一个工作区的成员共用并互相避让文件' },
  knowledge: { label: '知识',   kind: 'list',   hint: '常驻参考资料：文档，或别的成员的产物 / 结论' },
  rules:     { label: '规范',   kind: 'list',   hint: '必须遵守的约定与交付格式' },
  board:     { label: '看板',   kind: 'single', hint: '和接同一块看板的成员共享决定与进度' }
};
export const PORT_ORDER = Object.keys(PORTS);
/** 提供节点类型 → 它的输出接到哪个口。 */
export const PROVIDER_TYPES = {
  persona:   { label: '人设',     port: 'persona' },
  model:     { label: '模型',     port: 'model' },
  perm:      { label: '权限策略', port: 'perm' },
  tools:     { label: '工具包',   port: 'tools' },
  workspace: { label: '共享工作区', port: 'workspace' },
  doc:       { label: '文档',     port: 'knowledge' },
  rules:     { label: '规范',     port: 'rules' },
  board:     { label: '共享看板', port: 'board' }
};
/** 成员自己的输出口，只能接到别人的「知识」口。 */
export const MEMBER_OUTPUTS = { artifact: { label: '产物', port: 'knowledge' }, conclusion: { label: '结论', port: 'knowledge' } };
export const EVENT_KINDS = ['dispatch', 'deliver', 'review', 'approve', 'reject', 'escalate', 'message', 'adhoc', 'board', 'conflict'];
const DEFAULT_TOOLS = ['read', 'write', 'command', 'browser'];
const MAX_EVENTS = 400, MAX_BOARD = 200, LOCK_MS = 10 * 60 * 1000;

const obj = x => x && typeof x === 'object' && !Array.isArray(x) ? x : {};
const text = (v, max) => { if (v == null) return ''; return String(v).replace(/\r\n/g, '\n').trim().slice(0, max); };
const baseId = k => String(k).split('~')[0];
export const isProviderId = k => typeof k === 'string' && /^p_[A-Za-z0-9_-]{4,40}$/.test(k);

// ---------------------------------------------------------------- 持久化形状
/** 接口线上的中继点（ComfyUI 的 Reroute）：只影响画法。 */
export function cleanVia(via) { return (Array.isArray(via) ? via : []).filter(q => q && Number.isFinite(Number(q.x)) && Number.isFinite(Number(q.y))).slice(0, 12).map(q => ({ x: Math.round(Number(q.x)), y: Math.round(Number(q.y)) })); }
export function loadPortsState(v = {}) {
  const providers = {};
  for (const [id, p] of Object.entries(obj(v.providers))) {
    if (!isProviderId(id) || !PROVIDER_TYPES[p?.type]) continue;
    providers[id] = { type: p.type, name: text(p.name, 40) || PROVIDER_TYPES[p.type].label, x: Number.isFinite(p.x) ? p.x : 0, y: Number.isFinite(p.y) ? p.y : 0, config: obj(p.config), ...(p.bypass ? { bypass: true } : {}) };
  }
  const feeds = (Array.isArray(v.feeds) ? v.feeds : []).filter(f => f && typeof f.id === 'string' && PORTS[f.port] && typeof f.from === 'string' && typeof f.to === 'string')
    .map(f => ({ id: f.id, from: f.from, to: f.to, port: f.port, ...(MEMBER_OUTPUTS[f.out] ? { out: f.out } : {}), ...(PORTS[f.port].kind === 'list' ? { mode: f.mode === 'override' ? 'override' : 'merge' } : {}), ...(cleanVia(f.via).length ? { via: cleanVia(f.via) } : {}), at: f.at || '' }));
  const board = {};
  for (const [id, list] of Object.entries(obj(v.board))) if (isProviderId(id) && Array.isArray(list)) board[id] = list.filter(e => e && e.text).slice(-MAX_BOARD);
  const events = (Array.isArray(v.events) ? v.events : []).filter(e => e && EVENT_KINDS.includes(e.kind)).slice(-MAX_EVENTS);
  const reviews = obj(v.reviews);
  return { providers, feeds, board, events, reviews };
}

// ---------------------------------------------------------------- 提供节点配置
export function normalizeProviderConfig(type, input = {}) {
  input = obj(input);
  switch (type) {
    case 'persona': { const c = memberCustomInput({ goal: input.goal ?? null, backstory: input.backstory ?? null }); return { goal: c.goal, backstory: c.backstory }; }
    case 'model': {
      const out = { model: input.model ? modelReference(input.model) : null };
      Object.assign(out, memberCustomInput(Object.fromEntries(['fallbackModel', 'reasoningEffort', 'temperature', 'maxOutputTokens'].filter(k => input[k] !== undefined).map(k => [k, input[k]]))));
      return out;
    }
    case 'perm': { const c = memberCustomInput({ writeScope: input.writeScope ?? null, confirm: input.confirm ?? null }); return { writeScope: c.writeScope, confirm: c.confirm }; }
    case 'tools': { const c = memberCustomInput({ tools: Array.isArray(input.tools) ? input.tools : [] }); return { tools: c.tools || [] }; }
    case 'workspace': { const dir = input.dir ? normalizeScope([input.dir]) : null; if (dir && /[*?]/.test(dir[0])) fail('PORT_CONFIG_INVALID', '工作区要写一个目录，不能用通配符。'); return { dir: dir ? dir[0] : '.' }; }
    case 'doc': { const paths = input.paths ? normalizeScope(input.paths) || [] : []; if (paths.length > 20) fail('PORT_CONFIG_INVALID', '文档最多 20 个路径。'); return { text: text(input.text, 8000), paths }; }
    case 'rules': return { text: text(input.text, 4000) };
    case 'board': return { topic: text(input.topic, 200) };
    default: fail('PORT_TYPE_INVALID', '未知的节点类型：' + type);
  }
}

// ---------------------------------------------------------------- 接线校验
/** 返回 {ok:true, replace:[被替换的旧线 id]} 或 {ok:false, reason}。memberIds = 当前成员 ID 集合。 */
export function checkFeed(state, memberIds, feed, { replace = true } = {}) {
  const port = PORTS[feed.port];
  if (!port) return { ok: false, reason: '没有这个接口。' };
  const toId = baseId(feed.to);
  if (!memberIds.has(toId)) return { ok: false, reason: '只能接到成员节点上。' };
  if (isProviderId(feed.from)) {
    const p = state.providers[feed.from]; if (!p) return { ok: false, reason: '提供节点不存在。' };
    if (PROVIDER_TYPES[p.type].port !== feed.port) return { ok: false, reason: `「${PROVIDER_TYPES[p.type].label}」只能接到成员的「${PORTS[PROVIDER_TYPES[p.type].port].label}」口。` };
  } else {
    const fromId = baseId(feed.from);
    if (!memberIds.has(fromId)) return { ok: false, reason: '来源成员不存在。' };
    if (!MEMBER_OUTPUTS[feed.out]) return { ok: false, reason: '成员只有「产物」和「结论」两个输出口。' };
    if (feed.port !== 'knowledge') return { ok: false, reason: '成员的产物 / 结论只能接到别人的「知识」口。' };
    if (fromId === toId) return { ok: false, reason: '不能把成员的输出接回它自己。' };
  }
  const same = state.feeds.filter(f => baseId(f.to) === toId && f.port === feed.port);
  if (same.some(f => f.from === feed.from && (f.out || '') === (feed.out || ''))) return { ok: false, reason: '这根线已经接过了。' };
  if (port.kind === 'single' && same.length) {
    if (!replace) return { ok: false, reason: `该成员的「${port.label}」口已经接了别的节点。` };
    return { ok: true, replace: same.map(f => f.id) };
  }
  return { ok: true, replace: [] };
}

// ---------------------------------------------------------------- 生效设置
function sourceName(state, members, f) {
  if (isProviderId(f.from)) return state.providers[f.from]?.name || '节点';
  const m = members.find(x => x.id === baseId(f.from)); return (m?.name || '成员') + '的' + MEMBER_OUTPUTS[f.out]?.label;
}
/**
 * member 叠加接线后的生效设置。ctx = {members, tasks, chat}（用于读别的成员的产物 / 结论）。
 * 返回新对象：覆盖了对应字段，ports = {口: [{from,name,mode}]}，portLayer = 追加到提示词里的协作上下文。
 * 没有任何接线时原样返回（不复制）。
 */
export function effectiveMember(member, state, ctx = {}) {
  if (!member || !state) return member;
  /* 跳过（Bypass）的接口节点不生效，线留着 */
  const feeds = state.feeds.filter(f => baseId(f.to) === member.id && !state.providers?.[f.from]?.bypass);
  if (!feeds.length) return member;
  const members = ctx.members || [], out = { ...member }, ports = {}, layer = [];
  const byPort = p => feeds.filter(f => f.port === p);
  const cfg = f => state.providers[f.from]?.config || {};
  for (const f of feeds) (ports[f.port] ||= []).push({ from: f.from, out: f.out || null, name: sourceName(state, members, f), mode: f.mode || null });
  const one = byPort('persona')[0]; if (one) { const c = cfg(one); if (c.goal) out.goal = c.goal; if (c.backstory) out.backstory = c.backstory; }
  const mod = byPort('model')[0]; if (mod) { const c = cfg(mod); if (c.model) out.model = c.model; for (const k of ['fallbackModel', 'reasoningEffort', 'temperature', 'maxOutputTokens']) if (c[k] != null) out[k] = c[k]; }
  const perm = byPort('perm')[0]; if (perm) { const c = cfg(perm); out.writeScope = c.writeScope || null; out.confirm = c.confirm || null; }
  const tools = byPort('tools'); if (tools.length) {
    const provided = [...new Set(tools.flatMap(f => cfg(f).tools || []))];
    out.tools = tools.some(f => f.mode === 'override') ? provided : [...new Set([...(Array.isArray(member.tools) ? member.tools : DEFAULT_TOOLS), ...provided])];
  }
  const ws = byPort('workspace')[0]; if (ws && state.providers[ws.from]) {
    const dir = cfg(ws).dir || '.', mates = state.feeds.filter(f => f.from === ws.from && f.port === 'workspace' && baseId(f.to) !== member.id).map(f => members.find(m => m.id === baseId(f.to))?.name).filter(Boolean);
    out.workDir = dir; out.sharedWorkspace = { id: ws.from, name: state.providers[ws.from].name, dir, mates };
    if (!perm && dir !== '.') out.writeScope = [dir];
    layer.push(`工作区「${state.providers[ws.from].name}」：只在 ${dir === '.' ? '项目根目录' : dir} 里工作${mates.length ? `，和 ${[...new Set(mates)].join('、')} 共用。别人正在改的文件会被锁住，写入会被拒绝，换一个文件做，或者在群里 @ 对方协调` : ''}。`);
  }
  const rules = byPort('rules').map(f => cfg(f).text).filter(Boolean); if (rules.length) layer.push('必须遵守的规范：\n' + rules.join('\n---\n'));
  const know = [];
  for (const f of byPort('knowledge')) {
    if (isProviderId(f.from)) { const c = cfg(f), name = state.providers[f.from]?.name || '文档'; if (c.text) know.push(`【${name}】\n${c.text}`); if (c.paths?.length) know.push(`【${name}】需要时先读这些文件：${c.paths.join('、')}`); continue; }
    const src = members.find(m => m.id === baseId(f.from)); if (!src) continue;
    if (f.out === 'conclusion') { const last = [...(ctx.chat || [])].reverse().find(m => m.from === src.id && m.kind === 'chat' && !m.fold && m.text); know.push(`【${src.name}的最新结论】\n${last ? text(last.text, 3000) : '（还没有）'}`); }
    else { const done = (ctx.tasks || []).filter(t => t.assigneeMemberId === src.id && ['completed', 'review'].includes(t.status) && t.output).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0]; know.push(`【${src.name}的最新产物】\n${done ? `任务「${done.title}」：${text(done.output, 3000)}` : '（还没有交付过）'}`); }
  }
  if (know.length) { if (feeds.some(f => f.port === 'knowledge' && f.mode === 'override')) out.knowledgeOnly = true; layer.push('参考资料（画布上接给你的）：\n' + know.join('\n\n')); }
  const board = byPort('board')[0]; if (board && state.providers[board.from]) {
    const b = state.providers[board.from], entries = (state.board[board.from] || []).slice(-30), who = id => members.find(m => m.id === id)?.name || id;
    out.board = { id: board.from, name: b.name };
    layer.push(`共享看板「${b.name}」${cfg(board).topic ? '（' + cfg(board).topic + '）' : ''}：接了这块看板的成员都能看到。要记下决定、进度或交接，单独写一行：#看板 内容\n${entries.length ? entries.map(e => `- [${who(e.by)}] ${e.text}`).join('\n') : '（还是空的）'}`);
  }
  out.ports = ports;
  out.portLayer = layer.length ? `\n\n## 画布接给你的协作上下文\n${layer.join('\n\n')}` : '';
  return out;
}

// ---------------------------------------------------------------- 看板
export const BOARD_LINE = /^\s*#看板\s*(.+)$/;
export function boardWrites(reply) { return String(reply || '').split(/\r?\n/).map(l => l.match(BOARD_LINE)).filter(Boolean).map(m => text(m[1], 600)).filter(Boolean); }
export function boardAppend(state, boardId, by, entries, now = new Date().toISOString()) {
  if (!state.providers[boardId]) return 0;
  const list = state.board[boardId] ||= [];
  for (const t of entries) list.push({ at: now, by, text: t });
  if (list.length > MAX_BOARD) state.board[boardId] = list.slice(-MAX_BOARD);
  return entries.length;
}

// ---------------------------------------------------------------- 协作事件
export function pushEvent(state, ev, now = new Date().toISOString(), id = Math.random().toString(36).slice(2, 10)) {
  if (!EVENT_KINDS.includes(ev?.kind)) return null;
  const e = { id, at: now, kind: ev.kind, from: ev.from || null, to: ev.to || null, ...(ev.taskId ? { taskId: ev.taskId } : {}), text: text(ev.text, 300) };
  state.events.push(e); if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  return e;
}
/** 两位成员之间有没有画好的连线（管理 / 协作，任一方向）。没有就是 AI 临时拉的协作。 */
export function linked(edges, a, b) { return (edges || []).some(e => (e.from === a && e.to === b) || (e.from === b && e.to === a)); }

// ---------------------------------------------------------------- 共享工作区文件锁（内存，按工作区节点）
const locks = new Map(); // `${wsId}|${rel}` -> {memberId, name, at}
/** 成员要写这些文件：被同一工作区里别的成员在 10 分钟内写过的，返回冲突；否则记下锁。 */
export function claimFiles(member, args, root, now = Date.now()) {
  const ws = member?.sharedWorkspace; if (!ws || !ws.mates?.length) return null;
  const busy = [];
  const targets = patchTargets(args?.patch).map(t => path.relative(path.resolve(root || '.'), path.resolve(root || '.', t.path)).replaceAll('\\', '/').toLowerCase());
  for (const rel of targets) { const k = ws.id + '|' + rel, l = locks.get(k); if (l && l.memberId !== member.id && now - l.at < LOCK_MS) busy.push({ path: rel, by: l.name, memberId: l.memberId }); }
  if (busy.length) return busy;
  for (const rel of targets) locks.set(ws.id + '|' + rel, { memberId: member.id, name: member.name || member.id, at: now });
  return null;
}
export function releaseFiles(memberId) { for (const [k, l] of locks) if (l.memberId === memberId) locks.delete(k); }
export function _resetLocks() { locks.clear(); }

// ---------------------------------------------------------------- AI 审查
export const REVIEW_PASS = /^\s*#通过\s*(.+?)\s*$/, REVIEW_REJECT = /^\s*#打回\s*(.+?)\s*[：:](.+)$/;
export const MAX_REWORK = 2;
export function reviewVerdicts(reply) {
  const out = [];
  for (const line of String(reply || '').split(/\r?\n/)) { const r = line.match(REVIEW_REJECT); if (r) { out.push({ verdict: 'reject', title: r[1].trim(), note: r[2].trim().slice(0, 2000) }); continue; } const p = line.match(REVIEW_PASS); if (p) out.push({ verdict: 'pass', title: p[1].trim() }); }
  return out;
}
/** 画布快照里给前端的形状。 */
export function portsSnapshot(state, members, chat, tasks) {
  const view = {};
  for (const m of members) { const e = effectiveMember(m, state, { members, chat, tasks }); if (e !== m) view[m.id] = e.ports; }
  return { providers: state.providers, feeds: state.feeds, board: state.board, events: state.events.slice(-200), ports: view, catalog: { ports: PORTS, order: PORT_ORDER, providers: PROVIDER_TYPES, outputs: MEMBER_OUTPUTS } };
}
