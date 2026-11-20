// Maintained shared source: multi-agent canvas console (团队协作 · 画布控制台).
// One registry, shared by the Bridge tool dispatcher (records every real tool call) and the team-collaboration
// page (reads it). Everything shown comes from recorded evidence: Bridge tool calls, task cards, team chat and
// collaboration workers. Nothing is invented; an AI that never called a tool is not listed.
//
// - AI identities: an external AI names itself with chat_join/chat_send/chat_read/chat_wait (name + project).
//   Later calls are credited to that name through the card reference it sends (task_id / overview_session_id)
//   or its persistent MCP session. Calls that cannot be credited fall back to "<client> · <card tag>".
// - Status: 工作中 (non-wait call running or finished within 3 min) / 等消息 (in or just out of a wait call) /
//   空闲 (seen within 15 min) / 离线. 可能卡住 reuses the task-card stalled rule (20 min without card write or
//   credited activity) and excludes AIs that are in a waiting loop.
// - 等你: items that need the human (chat messages addressed to the user, pending bridge_ask_user questions,
//   blocked cards). Cleared when the user marks them seen.
// - Stop-all: wakes every chat_wait at once with a stop notice, posts it to every project chat, and the next
//   tool result of every external AI carries the stop notice once.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const CANVAS_WAIT_TOOLS = new Set(["chat_wait", "bridge_wait_messages", "bridge_wait_team"]);
export const CANVAS_CHAT_TOOL_NAMES = new Set(["chat_join", "chat_send", "chat_read", "chat_wait", "browser_open", "browser_list", "browser_close"]);
const ACTIVE_MS = 3 * 60e3;
const ONLINE_MS = 15 * 60e3;
const WAIT_RECENT_MS = 2 * 60e3;
const STUCK_MS = 20 * 60e3;
const STOP_NOTICE_MS = 30 * 60e3;
const MAX_LOG = 3000;
const PERSIST_LOG = 1500;
const MAX_NEEDS = 400;
const WAIT_MAX_MS = 55000;
const WAIT_DEFAULT_MS = 25000;
const NAME_RE = /^[\p{L}\p{N}_.\-·]{1,40}$/u;

const nameProp = { type: "string", minLength: 1, maxLength: 40, description: "你在画布上的名字（自己起，之后每次都用同一个，例如 maya001-opus5.5）。只允许字母、数字、中文、_ . - ·。" };
const projectProp = { type: "string", maxLength: 400, description: "项目：工作区 id、项目名或项目文件夹路径。省略时沿用上次加入的项目；从没加入过时用 OpenCode 当前项目。" };
// collab-subagent: optional subagent mark. A subagent stays off the AI canvas and the chat list; omit both for a normal AI.
export const SUBAGENT_MARK_PROPS = {
  parent_task_id: { type: "string", minLength: 1, maxLength: 80, description: "可选：你是另一个 AI 派出的子代理时，填父 AI 的任务卡 task_id。带上后你只算父 AI 的子代理，不单独出现在画布 AI 列表和对话列表里。" },
  subagent: { type: "boolean", description: "可选：true 表示你是子代理（不知道父任务卡时也可以只填这个）。" }
};
export const CANVAS_CHAT_TOOL_DEFINITIONS = [
  {
    name: "chat_join",
    description: "加入某个项目的 AI 群聊并在 OpenCode「团队协作 · 画布」上登记你的身份（名字 + 项目）。同一个对话之后都用同一个名字；建议所有工具调用都带 task_id，画布才能把你的工具调用记到你名下。返回群里的成员、最新消息游标和用法。",
    inputSchema: { type: "object", additionalProperties: false, required: ["name"], properties: { name: nameProp, project: projectProp, ...SUBAGENT_MARK_PROPS } }
  },
  {
    name: "chat_send",
    description: "以你的名字往项目群聊发一条消息（用户和其他 AI 都能看到）。需要用户回答或拍板时设 need_user=true（或在正文里写 @用户），消息会进入用户的「等你」队列。发送不代表对方已处理。",
    inputSchema: { type: "object", additionalProperties: false, required: ["name", "text"], properties: { name: nameProp, project: projectProp, text: { type: "string", minLength: 1, maxLength: 20000 }, need_user: { type: "boolean", description: "这条消息需要用户处理（提问、受阻、需要拍板）。" } } }
  },
  {
    name: "chat_read",
    description: "读取项目群聊里 after 游标之后的消息（不阻塞）。省略 after 时从你上次读到的位置继续；第一次读返回最近 limit 条。",
    inputSchema: { type: "object", additionalProperties: false, required: ["name"], properties: { name: nameProp, project: projectProp, after: { type: "string", maxLength: 200, description: "上次返回的 cursor。" }, limit: { type: "integer", minimum: 1, maximum: 100 } } }
  },
  {
    name: "chat_wait",
    description: "长轮询：最多阻塞 timeout_ms（默认 25000，最大 55000）直到项目群聊出现别人发的新消息，或用户按了「全部停下」。没有新消息时返回空列表，可以再次调用；画布会把连续的等待合并成一行显示。",
    inputSchema: { type: "object", additionalProperties: false, required: ["name"], properties: { name: nameProp, project: projectProp, after: { type: "string", maxLength: 200 }, timeout_ms: { type: "integer", minimum: 1000, maximum: WAIT_MAX_MS } } }
  }
  ,{
    name: "browser_open",
    description: "在 OpenCode 内置浏览器里打开一个网页标签（用户能在编辑器和「团队协作 · 画布」上看到实时预览）。只打开 http/https 页面；不会替你登录或提交表单。",
    inputSchema: { type: "object", additionalProperties: false, required: ["url"], properties: { name: { ...nameProp, description: "你在画布上的名字（可选；带上后标签会挂在你的卡片旁边）。" }, url: { type: "string", minLength: 1, maxLength: 4000 } } }
  },
  {
    name: "browser_list",
    description: "列出 OpenCode 内置浏览器当前打开的标签（id、标题、网址、是谁打开的）。",
    inputSchema: { type: "object", additionalProperties: false, properties: { name: { ...nameProp, description: "你在画布上的名字（可选）。" } } }
  },
  {
    name: "browser_close",
    description: "关闭 OpenCode 内置浏览器里的一个标签（用 browser_list 返回的 id）。",
    inputSchema: { type: "object", additionalProperties: false, required: ["tab_id"], properties: { name: { ...nameProp, description: "你在画布上的名字（可选）。" }, tab_id: { type: "string", minLength: 1, maxLength: 200 } } }
  }
];

const STOP_TEXT = "【OpenCode · 全部停下】用户刚刚按了「全部停下」：请立即停止当前工作，不要再发起新的修改、命令或网页操作；把已做到哪里如实写进任务卡（set_todos 用 blocked 或 cancelled 收尾），然后等待用户的新指示。";

const str = (v, n = 200) => typeof v === "string" ? v.replace(/[\x00-\x08\x0b-\x1f\x7f]+/g, " ").slice(0, n) : "";
const oneLine = (v, n = 160) => str(String(v ?? ""), 4000).replace(/\s+/g, " ").trim().slice(0, n);
const normPath = (p) => String(p || "").replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
const isAbs = (p) => /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith("/") || p.startsWith("\\\\");
const shortTag = (s) => String(s || "").replace(/[^0-9a-zA-Z]/g, "").slice(0, 4).toUpperCase();

/**
 * collab-subagent: the subagent mark carried by a call's arguments or a session record.
 * Tool arguments (chat_join / set_todos / any Bridge call): parent_task_id and subagent=true only.
 * Session records ({ session: true }): also parentID / parentId / parentSessionId / parent_session_id, the
 * OpenCode-style parent session link. Returns null for a normal (top-level) AI.
 */
export function subagentMark(value, { session = false } = {}) {
  const a = value && typeof value === "object" ? value : {};
  const id = (v) => typeof v === "string" && v.trim() ? str(v.trim(), 120) : "";
  const parentTaskId = id(a.parent_task_id) || (session ? id(a.parentTaskId) : "");
  const parentSession = session ? id(a.parentID) || id(a.parentId) || id(a.parentSessionId) || id(a.parent_session_id) : "";
  if (!parentTaskId && !parentSession && a.subagent !== true && !(session && a.isSubagent === true)) return null;
  return { parentTaskId: parentTaskId || null, parentSession: parentSession || null };
}

/**
 * native-subagent: OpenCode's own subagents (agent-host spawn_subagent) call Bridge tools through the shared
 * native-chat owner, so the actor is "local". The extension stamps those calls with { sessionId, parentID }
 * (actor.sessionId / actor.parentID). A local actor with both is a subagent session; a top-level native session
 * (no parentID) keeps the shared "local" identity. Returns null for everything else.
 */
export function localSubagentOf(actor) {
  if (!actor || actor.kind !== "local") return null;
  const id = (v) => typeof v === "string" && v.trim() ? str(v.trim(), 120) : "";
  const sessionId = id(actor.sessionId), parentID = id(actor.parentID);
  return sessionId && parentID && sessionId !== parentID ? { sessionId, parentID } : null;
}
const LOCAL_SUB_PREFIX = "local:sub:";
const isLocalKey = (key) => key === "local" || String(key || "").startsWith(LOCAL_SUB_PREFIX);

export function patchPaths(patch) {
  const out = [];
  for (const m of String(patch || "").matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) out.push(m[1].trim());
  for (const m of String(patch || "").matchAll(/^\*\*\* Move to: (.+)$/gm)) out.push(m[1].trim());
  return [...new Set(out)];
}

/** Paths a call touches, read from its arguments only (never from the result). */
export function argPaths(tool, args) {
  const a = args && typeof args === "object" ? args : {};
  const out = [];
  const push = (v) => { if (typeof v === "string" && v.trim()) out.push(v.trim()); };
  push(a.path); push(a.file); push(a.file_path); push(a.target_file); push(a.cwd);
  if (Array.isArray(a.files)) for (const f of a.files) push(typeof f === "string" ? f : f?.path);
  if (Array.isArray(a.paths)) for (const f of a.paths) push(f);
  if (typeof a.patch === "string") out.push(...patchPaths(a.patch));
  if (a.target_arguments && typeof a.target_arguments === "object") { push(a.target_arguments.cwd); push(a.target_arguments.path); }
  return [...new Set(out)].slice(0, 40);
}

const WRITE_TOOLS = /^(apply_patch|write_file|edit_file|create_file|delete_file|move_file)$/;
const CHAT_KIND_TOOLS = /^(chat_(join|send|read|wait)|bridge_(send_message|list_messages|wait_messages|ack_message|delegate_task|wait_team|create_task|claim_task|update_task|review_task|read_task_result|join_collaboration|get_collaboration))$/;
const BROWSER_TOOLS = /^(browser_[a-z_]+)$/;

export function toolKind(tool) {
  const t = String(tool || "").split("__").pop();
  if (WRITE_TOOLS.test(t)) return "file";
  if (CANVAS_WAIT_TOOLS.has(t)) return "wait";
  if (CHAT_KIND_TOOLS.test(t)) return "chat";
  if (BROWSER_TOOLS.test(t)) return "browser";
  return "other";
}

/** One-line description of a call, from its arguments. */
export function describeCall(tool, args) {
  const a = args && typeof args === "object" ? args : {};
  const t = String(tool || "").split("__").pop();
  const paths = argPaths(t, a);
  switch (t) {
    case "apply_patch": { const p = patchPaths(a.patch); return p.length ? `改 ${p.length} 个文件：${p.slice(0, 3).join("、")}${p.length > 3 ? " …" : ""}` : "改文件"; }
    case "read_files": return `读 ${paths.length} 个文件：${paths.slice(0, 3).join("、")}${paths.length > 3 ? " …" : ""}`;
    case "run_command": return "命令：" + oneLine(a.command, 140);
    case "search_files": case "codebase_search": return "搜索：" + oneLine(a.query ?? a.pattern ?? a.text, 120);
    case "find_files": return "找文件：" + oneLine(Array.isArray(a.patterns) ? a.patterns.join(" ") : a.pattern ?? a.glob, 120);
    case "list_directory": return "列目录：" + oneLine(a.path || ".", 120);
    case "set_todos": case "update_plan": { const doing = Array.isArray(a.todos) ? a.todos.find((x) => x?.status === "in_progress")?.title : ""; return oneLine(a.task_title || doing || (a.lifecycle ? "任务卡 → " + a.lifecycle : "更新任务卡"), 140); }
    case "chat_send": return oneLine(a.text, 160);
    case "chat_join": return "加入项目群聊" + (a.project ? "：" + oneLine(a.project, 80) : "");
    case "bridge_send_message": return oneLine(a.text ?? a.body ?? a.message, 160);
    case "bridge_ask_user": return a.mode === "check" ? "查询提问答复" : "向用户提问：" + oneLine(a.question ?? (Array.isArray(a.questions) ? a.questions.map((q) => q?.question).join("；") : ""), 120);
    case "bridge_batch": { const calls = Array.isArray(a.calls) ? a.calls : []; return `批量 ${calls.length} 项：${calls.slice(0, 5).map((c) => String(c?.tool || "?").split("__").pop()).join("、")}${calls.length > 5 ? " …" : ""}`; }
    case "browser_open": return "打开 " + oneLine(a.url, 140);
    case "browser_close": return "关闭标签 " + oneLine(a.tab_id ?? a.id, 60);
    case "browser_list": return "查看内置浏览器标签";
    case "report_progress": return oneLine(a.message ?? a.text ?? a.progress, 140);
    default: {
      if (paths.length) return paths.slice(0, 3).join("、");
      for (const v of Object.values(a)) if (typeof v === "string" && v.trim()) return oneLine(v, 120);
      return "";
    }
  }
}

function resultText(result) {
  if (!result) return "";
  if (typeof result.text === "string") return result.text;
  if (Array.isArray(result.content)) return result.content.filter((c) => c && c.type === "text" && typeof c.text === "string").map((c) => c.text).join("\n");
  return "";
}

export class CanvasConsole {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.log = [];
    this.nextId = Date.now(); // ids from an earlier process (persisted) are always smaller
    this.inflight = new Map();      // entry id -> entry (running)
    this.ids = new Map();           // identity key -> identity
    this.byTask = new Map();        // task_id -> identity key (explicit names only)
    this.bySession = new Map();     // overview_session_id -> identity key
    this.byOwner = new Map();       // MCP owner -> identity key
    this.byNativeSession = new Map(); // native subagent session id -> named identity key (chat_* name)
    this.needs = [];                // {id, at, ai, project, text, source}
    this.seen = new Set();
    this.cursors = new Map();       // identity key + project -> cursor
    this.stopAt = 0;
    this.stopDelivered = new Set();
    this.waiters = new Set();
    this.backend = null;
    this.storeFile = null;
    this.saveTimer = null;
    this.revision = 0;
  }

  // ---------- persistence ----------
  configure({ storeDir, backend } = {}) {
    if (backend) this.backend = backend;
    if (storeDir && !this.storeFile) {
      this.storeFile = path.join(storeDir, "canvas-console.json");
      try {
        const v = JSON.parse(fs.readFileSync(this.storeFile, "utf8"));
        const seenIds = new Set(this.log.map((e) => e.id));
        const old = Array.isArray(v.log) ? v.log.filter((e) => e && typeof e.id === "number" && !seenIds.has(e.id)) : [];
        // Entries left "running" by a previous OpenCode process never finished here; mark them honestly.
        for (const e of old) if (e.status === "running") { e.status = "unknown"; e.error = "OpenCode 重启前未结束，结果未知"; }
        this.log = [...old, ...this.log].slice(-MAX_LOG);
        for (const i of Array.isArray(v.identities) ? v.identities : []) if (i?.key && !this.ids.has(i.key)) this.ids.set(i.key, { ...i, owners: undefined });
        for (const [k, val] of Object.entries(v.byTask || {})) if (!this.byTask.has(k)) this.byTask.set(k, val);
        for (const [k, val] of Object.entries(v.bySession || {})) if (!this.bySession.has(k)) this.bySession.set(k, val);
        this.needs = [...(Array.isArray(v.needs) ? v.needs : []), ...this.needs].slice(-MAX_NEEDS);
        for (const s of Array.isArray(v.seen) ? v.seen : []) this.seen.add(s);
        for (const [k, val] of Object.entries(v.cursors || {})) if (!this.cursors.has(k)) this.cursors.set(k, val);
      } catch {}
    }
  }
  touch() {
    this.revision += 1;
    if (!this.storeFile || this.saveTimer) return;
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.persist(); }, 1500);
    this.saveTimer.unref?.();
  }
  persist() {
    if (!this.storeFile) return;
    try {
      fs.mkdirSync(path.dirname(this.storeFile), { recursive: true });
      const payload = {
        version: 1,
        log: this.log.slice(-PERSIST_LOG),
        identities: [...this.ids.values()].map((i) => ({ ...i, owners: undefined })),
        byTask: Object.fromEntries([...this.byTask].slice(-500)),
        bySession: Object.fromEntries([...this.bySession].slice(-500)),
        needs: this.needs.slice(-MAX_NEEDS),
        seen: [...this.seen].slice(-2000),
        cursors: Object.fromEntries([...this.cursors].slice(-500))
      };
      const tmp = this.storeFile + "." + process.pid + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(payload));
      fs.renameSync(tmp, this.storeFile);
    } catch {}
  }

  // ---------- identities ----------
  projects() { try { return this.backend?.projects?.() || []; } catch { return []; } }
  resolveProject(value) {
    const list = this.projects();
    const v = String(value || "").trim();
    if (!v) return null;
    const n = normPath(v);
    return list.find((p) => p.id === v) || list.find((p) => normPath(p.root) === n) || list.find((p) => String(p.name).toLowerCase() === v.toLowerCase()) || list.find((p) => p.root && n.startsWith(normPath(p.root) + "/")) || null;
  }
  inferProject(paths) {
    const list = this.projects().filter((p) => p.root);
    for (const raw of paths) {
      if (!isAbs(raw)) continue;
      const n = normPath(raw);
      const hit = list.filter((p) => n === normPath(p.root) || n.startsWith(normPath(p.root) + "/")).sort((a, b) => b.root.length - a.root.length)[0];
      if (hit) return hit.id;
    }
    return null;
  }
  identity(key, init) {
    let i = this.ids.get(key);
    if (!i) { i = { key, name: init.name, explicit: !!init.explicit, client: init.client || "", firstAt: this.now(), lastAt: 0, lastTool: "", lastWorkAt: 0, lastWaitAt: 0, project: null, projectSource: null, taskIds: [], calls: 0 }; this.ids.set(key, i); }
    if (init.client && !i.client) i.client = init.client;
    return i;
  }
  /** Who made this call. Explicit names (chat_*) win; then the card reference; then the persistent session. */
  resolveIdentity(owner, actor, tool, args, ref) {
    const r = { ...(ref && typeof ref === "object" ? ref : {}) };
    const a = args && typeof args === "object" ? args : {};
    if (typeof a.task_id === "string" && !r.task_id) r.task_id = a.task_id;
    if (typeof a.overview_session_id === "string" && !r.overview_session_id) r.overview_session_id = a.overview_session_id;
    const t = String(tool || "").split("__").pop();
    const label = actor?.kind === "local" ? "OpenCode 智能体" : str(actor?.label || "外部 MCP 客户端", 40);
    const localSub = localSubagentOf(actor);
    let localSubName = true;
    let key = null;
    if (CANVAS_CHAT_TOOL_NAMES.has(t) && typeof a.name === "string" && NAME_RE.test(a.name.trim())) {
      const name = a.name.trim();
      key = "ai:" + name.toLowerCase();
      // native-subagent: a subagent that names itself takes the mark only on a fresh (or already subagent) name,
      // so reusing its parent's chat name never hides the parent.
      if (localSub && this.ids.has(key) && !this.ids.get(key).subagent) localSubName = false;
      const idn = this.identity(key, { name, explicit: true, client: label });
      idn.name = name; idn.explicit = true;
    }
    // native-subagent: a native subagent session is its own identity; it never resolves to its parent's card,
    // session or owner links (they all point at the parent conversation).
    if (!key && localSub) key = this.byNativeSession.get(localSub.sessionId) || null;
    if (!key && localSub) {
      key = LOCAL_SUB_PREFIX + localSub.sessionId.toLowerCase();
      this.identity(key, { name: "OpenCode 子代理·" + shortTag(localSub.sessionId.replace(/^sub[_-]?/i, "")), client: label });
    }
    if (!key && r.task_id) key = this.byTask.get(r.task_id) || this.byTask.get(String(r.task_id).toLowerCase()) || null;
    if (!key && r.overview_session_id) key = this.bySession.get(r.overview_session_id) || null;
    // A card reference that is not linked to a name is its own conversation; the session link only applies without one.
    if (!key && owner && !r.task_id && !r.overview_session_id) key = this.byOwner.get(owner) || null;
    if (!key) {
      if (actor?.kind === "local") key = "local";
      else if (r.task_id) key = "card:" + String(r.task_id).toLowerCase();
      else if (r.overview_session_id) key = "sess:" + String(r.overview_session_id).toLowerCase();
      else key = "client:" + label.toLowerCase();
      const tag = r.task_id ? shortTag(r.task_id) : r.overview_session_id ? shortTag(r.overview_session_id) : "";
      this.identity(key, { name: actor?.kind === "local" ? "OpenCode 智能体" : tag ? `${label}·${tag}` : label, client: label });
    }
    // Link this conversation's references to the identity for later calls (only explicit names claim links).
    const idn = this.ids.get(key);
    if (idn?.explicit && !localSub) {
      for (const ghost of [r.task_id && "card:" + String(r.task_id).toLowerCase(), r.overview_session_id && "sess:" + String(r.overview_session_id).toLowerCase()]) if (ghost) this.mergeInto(ghost, key);
      if (r.task_id) { this.byTask.set(String(r.task_id).toLowerCase(), key); this.byTask.set(r.task_id, key); }
      if (r.overview_session_id) this.bySession.set(r.overview_session_id, key);
      if (owner && !/^bridge:[0-9a-f-]{36}$/i.test(String(owner))) this.byOwner.set(owner, key);
      while (this.byOwner.size > 1000) this.byOwner.delete(this.byOwner.keys().next().value);
    }
    if (r.task_id && idn && !localSub && !idn.taskIds.includes(String(r.task_id).toLowerCase())) idn.taskIds = [...idn.taskIds, String(r.task_id).toLowerCase()].slice(-20);
    // Only a per-conversation identity takes the mark: the shared client:<label> / local fallbacks never do.
    if (idn && key !== "local" && !key.startsWith("client:")) this.markSubagent(idn, subagentMark(a));
    if (idn && localSub && localSubName && key !== "local" && !key.startsWith("client:")) {
      this.markLocalSubagent(idn, localSub);
      if (key.startsWith("ai:")) { this.byNativeSession.set(localSub.sessionId, key); while (this.byNativeSession.size > 500) this.byNativeSession.delete(this.byNativeSession.keys().next().value); }
    }
    return key;
  }

  /** collab-subagent: remember that an identity is a subagent (never cleared by later unmarked calls). */
  markSubagent(idn, mark) {
    if (!idn || !mark) return;
    idn.subagent = true;
    if (mark.parentTaskId) idn.parentTaskId = mark.parentTaskId;
    if (mark.parentSession) idn.parentSession = mark.parentSession;
  }
  /** native-subagent: mark an identity as a native subagent session; its parent is the parent session's canvas entry. */
  markLocalSubagent(idn, sub) {
    if (!idn || !sub) return;
    this.markSubagent(idn, { parentTaskId: null, parentSession: sub.parentID });
    idn.nativeSession = sub.sessionId;
    idn.parentKey = this.localParentKey(sub.parentID);
  }
  /** Parent of a native subagent: another native subagent session we know, else the top-level "local" entry. */
  localParentKey(parentID) {
    const k = LOCAL_SUB_PREFIX + String(parentID || "").toLowerCase();
    return parentID && this.ids.has(k) ? k : "local";
  }
  /** The canvas key of a subagent's parent: the AI that owns its parent task card, else the card / session itself. */
  parentKeyOf(idn) {
    if (!idn?.subagent) return null;
    if (idn.parentKey) return idn.parentKey;
    if (idn.parentTaskId) {
      const t = String(idn.parentTaskId);
      const owner = this.byTask.get(t) || this.byTask.get(t.toLowerCase());
      if (owner && owner !== idn.key) return owner;
      return "card:" + t.toLowerCase();
    }
    if (idn.parentSession) {
      const owner = this.bySession.get(idn.parentSession);
      if (owner && owner !== idn.key) return owner;
      return "sess:" + String(idn.parentSession).toLowerCase();
    }
    return "unknown";
  }
  /** Subagent mark of the conversation behind an MCP owner (for the workbench member / chat lists). */
  subagentOfOwner(owner) {
    const idn = owner ? this.ids.get(this.byOwner.get(owner)) : null;
    return idn?.subagent ? { parentId: this.parentKeyOf(idn), subagent: true } : null;
  }

  /** A conversation first seen without a name (card / session fallback) later named itself: one identity. */
  mergeInto(fromKey, toKey) {
    const from = this.ids.get(fromKey), to = this.ids.get(toKey);
    if (!from || !to || fromKey === toKey) return;
    to.firstAt = Math.min(to.firstAt || Infinity, from.firstAt || Infinity);
    to.calls += from.calls || 0;
    for (const k of ["lastAt", "lastWorkAt", "lastWaitAt"]) to[k] = Math.max(to[k] || 0, from[k] || 0);
    to.taskIds = [...new Set([...(to.taskIds || []), ...(from.taskIds || [])])].slice(-20);
    if (!to.project && from.project) { to.project = from.project; to.projectSource = from.projectSource; }
    if (from.subagent) this.markSubagent(to, { parentTaskId: to.parentTaskId || from.parentTaskId || null, parentSession: to.parentSession || from.parentSession || null });
    if (from.parentKey && !to.parentKey) to.parentKey = from.parentKey;
    for (const e of this.log) if (e.ai === fromKey) e.ai = toKey;
    for (const n of this.needs) if (n.ai === fromKey) n.ai = toKey;
    this.ids.delete(fromKey);
  }

  // ---------- tool-call recording ----------
  begin(owner, actor, tool, args, ref) {
    try {
      const t = String(tool || "").split("__").pop();
      const key = this.resolveIdentity(owner, actor, t, args, ref);
      const idn = this.ids.get(key);
      const paths = argPaths(t, args);
      const project = this.inferProject(paths);
      if (project && idn && idn.projectSource !== "join") { idn.project = project; idn.projectSource = "inferred"; }
      const at = this.now();
      const kind = toolKind(t);
      const entry = { id: this.nextId++, at, ai: key, tool: t, kind, status: "running", detail: describeCall(t, args), project: idn?.project || project || null };
      if (kind === "file") entry.paths = (t === "apply_patch" ? patchPaths(args?.patch) : paths.filter((p) => p !== args?.cwd)).slice(0, 30);
      if (idn) { idn.lastAt = at; idn.lastTool = t; idn.calls += 1; if (kind === "wait") idn.lastWaitAt = at; else idn.lastWorkAt = at; }
      this.log.push(entry);
      this.inflight.set(entry.id, entry);
      if (this.log.length > MAX_LOG) this.log.splice(0, this.log.length - MAX_LOG);
      this.touch();
      return entry.id;
    } catch { return 0; }
  }
  end(id, result, error) {
    const entry = this.inflight.get(id);
    if (!entry) return;
    this.inflight.delete(id);
    const at = this.now();
    entry.durationMs = at - entry.at;
    const failed = !!error || result?.isError === true;
    if (!entry.project) { const sp = result?.structuredContent?.project; entry.project = (typeof sp === "string" ? sp : sp?.id) || this.ids.get(entry.ai)?.project || null; }
    entry.status = failed ? "error" : "ok";
    if (failed) entry.error = oneLine(error ? (error.message || String(error)) : resultText(result), 300);
    if (entry.kind === "wait" && !failed) { const sc = result?.structuredContent; const n = Array.isArray(sc?.messages) ? sc.messages.length : typeof sc?.count === "number" ? sc.count : undefined; if (typeof n === "number") entry.got = n; }
    if (entry.tool === "chat_read") { const n = result?.structuredContent?.messages?.length; if (typeof n === "number") entry.detail = `读群聊${entry.projectName ? "「" + entry.projectName + "」" : ""} ${n} 条`; }
    const idn = this.ids.get(entry.ai);
    if (idn) { idn.lastAt = Math.max(idn.lastAt, at); if (entry.kind === "wait") idn.lastWaitAt = at; else idn.lastWorkAt = at; }
    this.touch();
  }
  /** Once per identity after a stop-all: the text to append to that AI's next tool result. */
  stopNoticeFor(owner, actor, ref) {
    if (!this.stopAt || this.now() - this.stopAt > STOP_NOTICE_MS || actor?.kind === "local") return null;
    let key = null;
    try { key = (ref?.task_id && this.byTask.get(String(ref.task_id).toLowerCase())) || (ref?.overview_session_id && this.bySession.get(ref.overview_session_id)) || this.byOwner.get(owner) || (ref?.task_id ? "card:" + String(ref.task_id).toLowerCase() : "client:" + String(actor?.label || "").toLowerCase()); } catch {}
    if (!key || this.stopDelivered.has(key)) return null;
    this.stopDelivered.add(key);
    return STOP_TEXT;
  }

  // ---------- 等你 ----------
  addNeed(item) {
    const id = item.id || "n_" + crypto.randomUUID();
    if (this.needs.some((n) => n.id === id)) return id;
    this.needs.push({ id, at: this.now(), ...item });
    if (this.needs.length > MAX_NEEDS) this.needs.splice(0, this.needs.length - MAX_NEEDS);
    this.touch();
    return id;
  }
  markSeen(ids) { for (const id of [].concat(ids || [])) if (typeof id === "string") this.seen.add(id); this.touch(); }

  // ---------- stop all ----------
  stopAll() {
    this.stopAt = this.now();
    this.stopDelivered.clear();
    for (const w of [...this.waiters]) { try { w.wake("stop"); } catch {} }
    for (const p of this.projects()) { try { this.backend?.post?.(p.id, { from: "system", kind: "system", text: "用户按了「全部停下」：所有 AI 立即停止当前工作，等待新的指示。" }); } catch {} }
    this.touch();
    return { stopAt: this.stopAt };
  }
  notifyChat(projectId) { for (const w of [...this.waiters]) if (!projectId || w.project === projectId) { try { w.wake("message"); } catch {} } }

  // ---------- chat tools (external AIs) ----------
  async handleChatTool(tool, args, ctx = {}) {
    const a = args && typeof args === "object" ? args : {};
    const name = String(a.name || "").trim();
    const fail = (text) => ({ isError: true, content: [{ type: "text", text }] });
    if (tool.startsWith("browser_")) return this.handleBrowserTool(tool, a, ctx, fail);
    if (!NAME_RE.test(name)) return fail("NAME_INVALID: name 需要 1-40 个字符，只允许字母、数字、中文、_ . - ·。");
    if (!this.backend) return fail("CHAT_UNAVAILABLE: 团队协作页还没有初始化，稍后再试。");
    const key = "ai:" + name.toLowerCase();
    const idn = this.identity(key, { name, explicit: true, client: str(ctx.actor?.label || "", 40) });
    this.markSubagent(idn, subagentMark(a));
    let project = a.project ? this.resolveProject(a.project) : null;
    if (a.project && !project) return fail(`PROJECT_UNKNOWN: 找不到项目「${oneLine(a.project, 80)}」。可用项目：${this.projects().map((p) => `${p.name}（${p.root || p.id}）`).join("；") || "无"}。`);
    if (!project && idn.project) project = this.projects().find((p) => p.id === idn.project) || null;
    if (!project) project = this.projects().find((p) => p.id === this.backend.currentProjectId?.()) || null;
    if (!project) return fail("PROJECT_REQUIRED: 请用 project 指定项目（工作区 id、名称或文件夹路径）。");
    if (tool === "chat_join" || a.project) { idn.project = project.id; idn.projectSource = "join"; }
    else if (!idn.project) { idn.project = project.id; idn.projectSource = "default"; }
    this.touch();
    const curKey = key + "\0" + project.id;
    const fmt = (m) => ({ cursor: m.cursor, time: m.time, from: m.fromName, text: m.text });
    const stopNote = () => this.stopAt && this.now() - this.stopAt < STOP_NOTICE_MS && !this.stopDelivered.has(key) ? (this.stopDelivered.add(key), STOP_TEXT) : "";
    if (tool === "chat_join") {
      const msgs = this.backend.read(project.id) || [];
      const last = msgs.at(-1)?.cursor || "";
      if (!this.cursors.has(curKey)) this.cursors.set(curKey, last);
      const peers = [...this.ids.values()].filter((i) => i.explicit && i.project === project.id && i.key !== key).map((i) => i.name);
      const text = `已加入「${project.name}」群聊，名字：${name}。群里其他 AI：${peers.join("、") || "暂无"}。` +
        `用 chat_send 发言（需要用户处理时 need_user=true），chat_read 读消息，chat_wait 等新消息（可反复调用）。` +
        `其他工具调用请带 task_id，画布才能把它们记到你名下。当前消息游标：${last || "（空）"}。` + (stopNote() ? "\n" + STOP_TEXT : "");
      return { content: [{ type: "text", text }], structuredContent: { project: { id: project.id, name: project.name, root: project.root || null }, name, peers, cursor: last } };
    }
    if (tool === "chat_send") {
      const text = String(a.text || "").trim();
      if (!text) return fail("TEXT_REQUIRED");
      const needUser = a.need_user === true || /@(用户|我|user)(?![\p{L}\p{N}])/iu.test(text);
      const msg = this.backend.post(project.id, { from: "ai:" + name, kind: "ai", text, aiName: name, needUser });
      if (needUser) this.addNeed({ id: "chat:" + (msg?.id || crypto.randomUUID()), ai: key, project: project.id, text: oneLine(text, 300), source: "chat" });
      if (msg?.cursor) this.cursors.set(curKey, msg.cursor);
      const note = stopNote();
      return { content: [{ type: "text", text: `已发到「${project.name}」群聊${needUser ? "，并放进用户的「等你」队列" : ""}。发送不代表对方已处理。` + (note ? "\n" + note : "") }], structuredContent: { project: project.id, cursor: msg?.cursor || null, need_user: needUser } };
    }
    const limit = Math.max(1, Math.min(100, Number(a.limit) || 50));
    const after = typeof a.after === "string" && a.after ? a.after : this.cursors.get(curKey);
    const since = (list) => {
      if (after === undefined || after === null) return list.slice(-limit);
      if (after === "") return list.slice(0, limit);
      const i = list.findIndex((m) => m.cursor === after);
      if (i >= 0) return list.slice(i + 1, i + 1 + limit);
      const t = Date.parse(String(after).split("|")[0]);
      return Number.isFinite(t) ? list.filter((m) => Date.parse(m.time) > t).slice(0, limit) : list.slice(-limit);
    };
    if (tool === "chat_read") {
      const list = since(this.backend.read(project.id) || []);
      const cursor = list.at(-1)?.cursor || after || "";
      if (cursor) this.cursors.set(curKey, cursor);
      const note = stopNote();
      return { content: [{ type: "text", text: (list.length ? list.map((m) => `[${m.time}] ${m.fromName}：${m.text}`).join("\n") : "（没有新消息）") + `\ncursor=${cursor}` + (note ? "\n" + note : "") }], structuredContent: { project: project.id, messages: list.map(fmt), cursor } };
    }
    // chat_wait
    const timeout = Math.max(1000, Math.min(WAIT_MAX_MS, Number(a.timeout_ms) || WAIT_DEFAULT_MS));
    const others = () => since(this.backend.read(project.id) || []).filter((m) => m.from !== "ai:" + name);
    const early = stopNote();
    if (early) return { content: [{ type: "text", text: early }], structuredContent: { project: project.id, messages: [], cursor: after || "", stopped: true } };
    let found = others();
    let reason = found.length ? "message" : "";
    if (!found.length) {
      reason = await new Promise((resolve) => {
        const w = { project: project.id, wake: (why) => { if (why === "stop" || others().length) done(why); } };
        const timer = setTimeout(() => done("timeout"), timeout);
        const onAbort = () => done("aborted");
        const done = (why) => { clearTimeout(timer); this.waiters.delete(w); try { ctx.signal?.removeEventListener?.("abort", onAbort); } catch {} resolve(why); };
        this.waiters.add(w);
        try { ctx.signal?.addEventListener?.("abort", onAbort, { once: true }); } catch {}
      });
      found = reason === "stop" ? [] : others();
    }
    const all = since(this.backend.read(project.id) || []);
    const cursor = (found.length ? all.at(-1)?.cursor : null) || after || this.backend.read(project.id)?.at(-1)?.cursor || "";
    if (found.length && cursor) this.cursors.set(curKey, cursor);
    const note = reason === "stop" ? stopNote() || STOP_TEXT : stopNote();
    const text = found.length ? found.map((m) => `[${m.time}] ${m.fromName}：${m.text}`).join("\n") + `\ncursor=${cursor}` : reason === "stop" ? "" : `（${Math.round(timeout / 1000)} 秒内没有新消息，可以再次 chat_wait）cursor=${cursor}`;
    return { content: [{ type: "text", text: [text, note].filter(Boolean).join("\n") }], structuredContent: { project: project.id, messages: found.map(fmt), cursor, count: found.length, ...(reason === "stop" ? { stopped: true } : {}) } };
  }

  // ---------- built-in browser (tabs opened by AIs; previews come from the workbench) ----------
  async handleBrowserTool(tool, a, ctx, fail) {
    const br = this.backend?.browser;
    if (!br || !br.available?.()) return fail("BROWSER_UNAVAILABLE: OpenCode 内置浏览器不可用（" + (br?.reason?.() || "当前版本没有开放 browser API") + "）。");
    const name = String(a.name || "").trim();
    const who = name && NAME_RE.test(name) ? "ai:" + name.toLowerCase() : this.resolveIdentity(ctx.owner, ctx.actor, tool, a, ctx.ref);
    this.tabOwners ??= new Map();
    if (tool === "browser_open") {
      let url;
      try { url = new URL(String(a.url)); } catch { return fail("URL_INVALID"); }
      if (!/^https?:$/.test(url.protocol)) return fail("URL_PROTOCOL: 只允许 http/https。");
      const tab = await br.open(url.toString());
      if (tab?.id) { this.tabOwners.set(tab.id, who); this.touch(); }
      return { content: [{ type: "text", text: `已打开标签 ${tab?.id || ""}：${tab?.title || url}` }], structuredContent: { tab_id: tab?.id || null, url: tab?.url || url.toString(), title: tab?.title || "" } };
    }
    if (tool === "browser_list") {
      const tabs = (br.list() || []).map((t) => ({ tab_id: t.id, title: t.title, url: t.url, opened_by: this.ids.get(this.tabOwners.get(t.id))?.name || null }));
      return { content: [{ type: "text", text: tabs.length ? `内置浏览器：${tabs.length} 个标签\n` + tabs.map((t) => `- ${t.tab_id} ${t.title || ""} ${t.url}`).join("\n") : "内置浏览器没有打开的标签。" }], structuredContent: { tabs } };
    }
    const id = String(a.tab_id || "");
    if (!(br.list() || []).some((t) => t.id === id)) return fail("TAB_UNKNOWN: 没有这个标签，先用 browser_list 查看。");
    await br.close(id);
    this.tabOwners.delete(id); this.touch();
    return { content: [{ type: "text", text: "已关闭标签 " + id }], structuredContent: { tab_id: id, closed: true } };
  }
  tabOwner(id) { return this.tabOwners?.get(id) || null; }

  /** Message / dispatch flow between AIs, from recorded calls only. */
  links(extra = []) {
    const now = this.now(), WINDOW = 60 * 60e3, out = new Map();
    const recent = this.log.filter((e) => now - e.at < WINDOW);
    const sends = recent.filter((e) => e.tool === "chat_send" && e.status === "ok" && e.project);
    const receives = recent.filter((e) => (e.tool === "chat_read" || e.tool === "chat_wait") && e.status === "ok" && e.project && ((e.got || 0) > 0 || /读群聊 [1-9]/.test(e.detail || "")));
    for (const s of sends) for (const r of receives) {
      if (r.ai === s.ai || r.project !== s.project || r.at < s.at || r.at - s.at > 15 * 60e3) continue;
      const k = s.ai + ">" + r.ai + ":chat"; const cur = out.get(k) || { from: s.ai, to: r.ai, kind: "chat", count: 0, at: 0 };
      cur.count += 1; cur.at = Math.max(cur.at, r.at); out.set(k, cur);
    }
    for (const l of extra) { const k = l.from + ">" + l.to + ":" + l.kind; const cur = out.get(k) || { ...l, count: 0, at: 0 }; cur.count += l.count || 1; cur.at = Math.max(cur.at, l.at || 0); out.set(k, cur); }
    return [...out.values()].map((l) => ({ ...l, label: l.kind === "chat" ? `群聊消息 ${l.count} 次` : l.kind === "dispatch" ? `派任务 ${l.count} 次` : "上下级" }));
  }

  // ---------- derived view ----------
  /**
   * @param {object} input  { tasks: public task cards, members: internal API members [{id,name,project,status,detail}],
   *                          chat: [{project, msgs}] for collaboration entries, browserTabs, focusProject }
   */
  view(input = {}) {
    const now = this.now();
    const projects = this.projects();
    const tasks = Array.isArray(input.tasks) ? input.tasks : [];
    const taskById = new Map(tasks.map((t) => [String(t.id).toLowerCase(), t]));
    const inflightBy = new Map();
    for (const e of this.inflight.values()) { const l = inflightBy.get(e.ai) || []; l.push(e); inflightBy.set(e.ai, l); }
    const ais = [];
    for (const i of this.ids.values()) {
      if (isLocalKey(i.key) && !inflightBy.has(i.key) && now - i.lastAt > ONLINE_MS) continue;
      const running = inflightBy.get(i.key) || [];
      const work = running.filter((e) => e.kind !== "wait");
      const wait = running.filter((e) => e.kind === "wait");
      let status = "offline";
      if (work.length) status = "working";
      else if (wait.length) status = "waiting";
      else if (now - i.lastWorkAt < ACTIVE_MS && i.lastWorkAt >= i.lastWaitAt) status = "working";
      else if (i.lastWaitAt && i.lastWaitAt >= i.lastWorkAt && now - i.lastWaitAt < WAIT_RECENT_MS) status = "waiting";
      else if (now - i.lastAt < ONLINE_MS) status = "idle";
      const cards = i.taskIds.map((id) => taskById.get(id)).filter(Boolean);
      const waitingLoop = status === "waiting" || CANVAS_WAIT_TOOLS.has(i.lastTool);
      const stuckCard = cards.find((c) => c.stalled && c.state === "awaiting_sync" && !c.live);
      const longCall = work.find((e) => now - e.at > STUCK_MS);
      const stuck = !waitingLoop && (!!stuckCard || !!longCall);
      const stuckReason = !stuck ? "" : longCall ? `${longCall.tool} 已运行 ${Math.round((now - longCall.at) / 60e3)} 分钟` : `任务卡「${oneLine(stuckCard.title, 40)}」${Math.round((stuckCard.stalledForMs || 0) / 60e3)} 分钟没有写卡或可记入的活动`;
      const current = cards.find((c) => c.state === "running" || c.state === "awaiting_user" || c.state === "awaiting_sync") || cards.at(-1) || null;
      const parentKey = this.parentKeyOf(i);
      ais.push({
        ...(parentKey ? { parentId: parentKey, subagent: true, ...(i.parentTaskId ? { parentTaskId: i.parentTaskId } : {}) } : {}),
        key: i.key, name: i.name, explicit: i.explicit, client: i.client, kind: isLocalKey(i.key) ? "local" : "mcp",
        project: i.project && projects.some((p) => p.id === i.project) ? i.project : null, projectSource: i.projectSource,
        status, stuck, stuckReason, lastAt: i.lastAt, lastTool: i.lastTool, calls: i.calls,
        running: running.map((e) => ({ tool: e.tool, at: e.at })),
        card: current ? { id: current.id, title: current.title, state: current.state, done: (current.todos || []).filter((t) => t.status === "completed").length, total: (current.todos || []).length } : null,
        questions: cards.flatMap((c) => (c.questions || []).filter((q) => q.status === "pending").map((q) => ({ id: "q:" + c.id + ":" + q.id, at: Date.parse(q.createdAt || "") || c.updatedAt || now, text: oneLine(q.question || q.text || "提问", 300), card: c.id }))),
        blocked: cards.filter((c) => c.state === "blocked").map((c) => ({ id: "b:" + c.id + ":" + c.revision, at: c.updatedAt || now, text: "任务卡受阻：" + oneLine(c.title, 200), card: c.id }))
      });
    }
    for (const m of Array.isArray(input.members) ? input.members : []) {
      const mark = subagentMark(m, { session: true });
      const parentKey = !mark ? null : mark.parentTaskId ? (this.byTask.get(mark.parentTaskId) || "card:" + mark.parentTaskId.toLowerCase()) : mark.parentSession ? (/^(member|ai|card|sess):/.test(mark.parentSession) ? mark.parentSession : "member:" + mark.parentSession) : "unknown";
      ais.push({ ...(parentKey ? { parentId: parentKey, subagent: true } : {}), key: "member:" + m.id, name: m.name, explicit: true, client: m.model || "API 模型", kind: "api", project: m.project || null, projectSource: "canvas", status: m.status, stuck: !!m.stuck, stuckReason: m.stuckReason || "", lastAt: m.lastAt || 0, lastTool: "", calls: 0, running: [], card: null, questions: [], blocked: [], detail: m.detail || "" });
    }
    // 等你 queue
    const needs = [];
    for (const n of this.needs) if (!this.seen.has(n.id)) needs.push(n);
    for (const a of ais) for (const q of [...a.questions, ...a.blocked]) if (!this.seen.has(q.id)) needs.push({ id: q.id, at: q.at, ai: a.key, project: a.project, text: q.text, source: q.id.startsWith("q:") ? "question" : "blocked", card: q.card });
    for (const a of ais) a.needs = needs.filter((n) => n.ai === a.key).length;
    // activity: newest first, consecutive waits of one AI with no new messages collapsed
    const entries = [];
    const nameOf = new Map(ais.map((a) => [a.key, a.name]));
    for (const e of this.log) {
      // Consecutive waits of one AI that returned nothing (or are still running) fold into one line.
      if (e.kind === "wait" && (e.got === 0 || e.status === "running")) {
        let j = entries.length - 1;
        while (j >= 0 && entries[j].ai !== e.ai) j--;
        const last = j >= 0 ? entries[j] : null;
        if (last && last.collapsed && e.at - (last.lastAt || last.at) < 5 * 60e3) {
          last.count += 1; last.lastAt = e.at; last.status = e.status; last.durationMs = e.durationMs;
          continue;
        }
        entries.push({ ...e, collapsed: true, count: 1, firstAt: e.at, lastAt: e.at });
        continue;
      }
      entries.push({ ...e });
    }
    for (const x of entries) {
      x.name = nameOf.get(x.ai) || x.ai;
      if (x.collapsed) {
        const ongoing = x.status === "running";
        const mins = Math.max(0, Math.round(((ongoing ? now : x.lastAt + (x.durationMs || 0)) - x.firstAt) / 60e3));
        const hhmm = new Date(x.firstAt).toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" });
        x.detail = x.count > 1 || ongoing ? `在等消息：${hhmm} 起，已${mins < 1 ? "不到 1" : " " + mins} 分钟（${x.count} 次，中间没有新消息）` : `等了 ${Math.round((x.durationMs || 0) / 1000)} 秒，没有新消息`;
        x.ongoing = ongoing;
      } else if (x.kind === "wait") x.detail = x.got > 0 ? `等到 ${x.got} 条新消息` : x.status === "error" ? "等待失败" : "等待结束";
    }
    // chat messages of internal members, as collaboration entries
    for (const c of Array.isArray(input.chat) ? input.chat : []) entries.push(c);
    entries.sort((a, b) => (b.lastAt || b.at) - (a.lastAt || a.at));
    // changed files: newest write per path
    const changes = new Map();
    for (const e of this.log) if (e.kind === "file" && e.status !== "error") for (const p of e.paths || []) {
      const k = normPath(p);
      const cur = changes.get(k) || { path: p, ais: [], count: 0, at: 0, tool: e.tool, project: e.project };
      cur.count += 1; cur.at = Math.max(cur.at, e.at); if (!cur.ais.includes(e.ai)) cur.ais.push(e.ai); cur.tool = e.tool; cur.project = e.project || cur.project; cur.lastStatus = e.status;
      changes.set(k, cur);
    }
    return {
      now, revision: this.revision, stopAt: this.stopAt || null,
      projects: projects.map((p) => ({ id: p.id, name: p.name, root: p.root || null })),
      ais, needs: needs.sort((a, b) => b.at - a.at),
      activity: entries.slice(0, 400),
      changes: [...changes.values()].sort((a, b) => b.at - a.at).slice(0, 300),
      failed: this.log.filter((e) => e.status === "error").length,
      links: this.links(Array.isArray(input.links) ? input.links : [])
    };
  }
}

/** One registry per extension host, shared by the Bridge dispatcher and the collaboration page. */
export const canvasConsole = globalThis.__ocCanvasConsole || (globalThis.__ocCanvasConsole = new CanvasConsole());
