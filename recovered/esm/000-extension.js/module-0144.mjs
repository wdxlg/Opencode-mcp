import { copyTaskMemoryDir } from "./task-memory-fork.mjs";
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-task-store.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { parseBridgeTodos } from "./module-0145.mjs";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";


// src/bridge-task-store.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto20 = require("node:crypto");

// src/bridge-task-store.ts
var BRIDGE_TASK_AWAITING_SYNC_MS = 20 * 6e4;
var BRIDGE_TASK_CLEANUP_BATCH_LIMIT = 1e4;
// task-system-truth: a card counts as stalled only after this long with no card write and no attributable tool activity.
var BRIDGE_TASK_STALE_MS = BRIDGE_TASK_AWAITING_SYNC_MS;
// Unbound tool activity of a stateless client is attributed to its only open card of the same client label within this window.
var BRIDGE_TASK_ATTRIBUTION_WINDOW_MS = 2 * 60 * 6e4;
// Untracked (no-card) external activity stays listed this long; it is "running" only while busy or seen within LIVE_ACTIVE_MS.
var BRIDGE_LIVE_RETENTION_MS = 6 * 60 * 6e4;
var BRIDGE_LIVE_ACTIVE_MS = 3 * 6e4;
// A pending MCP call stays open; this interval checks for a complete answer
// without returning a premature `pending` result to the target AI.
var BRIDGE_QUESTION_POLL_MS = 3e3;
var copyTodos = (todos) => todos.map((t) => ({ ...t }));
var record2 = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
var isTerminal = (state) => state === "completed" || state === "cancelled" || state === "cleared";
var isActive = (state) => state === "running" || state === "waiting_plan";
// Unbound external MCP dialogue owners are bridge:<MCP session uuid>. Stateless clients (Bash/curl/mcpcall)
// open a new MCP session on (almost) every call, so the same dialogue arrives under a fresh owner each time.
var STATELESS_BRIDGE_OWNER = /^bridge:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// A successor dialogue that takes over a task by task_id interrupts the previous owner of that card.
var TASK_RESTORED_TAKEOVER_MESSAGE = "TASK_RESTORED_TAKEOVER_REQUIRED: this task was restored after an OpenCode restart (execution unverified) and belongs to another dialogue/source link. To take it over (\u63A5\u73ED), call set_todos again with its task_id, expected_revision and handoff=true; otherwise start a new task with new_task=true.";
var TASK_HANDED_OFF_MESSAGE = "TASK_HANDED_OFF: \u6B64\u4EFB\u52A1\u5DF2\u88AB\u65B0\u5BF9\u8BDD\u63A5\u73ED\uFF0C\u672C\u5BF9\u8BDD\u5BF9\u8BE5\u4EFB\u52A1\u7684\u6267\u884C\u5DF2\u4E2D\u65AD\u3002\u8BF7\u7ACB\u5373\u505C\u6B62\u5BF9\u8BE5\u4EFB\u52A1\u7684\u5199\u5165\u3001\u547D\u4EE4\u4E0E\u63D0\u95EE\uFF0C\u5411\u7528\u6237\u8BF4\u660E\u4EFB\u52A1\u5DF2\u7531\u5176\u4ED6\u5BF9\u8BDD\u63A5\u66FF\uFF1B\u5982\u7528\u6237\u7ED9\u51FA\u65B0\u5DE5\u4F5C\uFF0C\u7528 new_task=true\u3002";
function summarizeTaskTitle(rawTitle, previousTitle, todos) {
  const clean = (v) => typeof v === "string" ? v.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim() : "";
  const explicit = clean(rawTitle);
  if (explicit && explicit !== "当前任务" && explicit !== "任务进度") return explicit.slice(0, 80);
  const prev = clean(previousTitle);
  if (prev && prev !== "当前任务" && prev !== "任务进度") return prev.slice(0, 80);
  const step = clean(todos?.find((t) => t.status === "in_progress")?.title ?? todos?.[0]?.title);
  if (step && step !== "处理当前 Chat 请求") {
    const shortClause = step.split(/[；;。！？\n]/)[0].trim();
    return (shortClause || step).slice(0, 48);
  }
  return explicit || prev || step || "当前任务";
}
var hasPendingUserQuestion = (task) => (task.questions ?? []).some((question) => question.status === "pending");
var isAwaitingUser = (task) => (task.questions ?? []).some((question) => question.status === "pending" || question.requiresMcpAck === true && !question.deliveredAt);
/**
 * task-card-multi-conv: stateless MCP clients (mcpcall/curl/Bash, Hark) open a new MCP session per call and send identical
 * clientInfo, so neither the session nor the client name tells concurrent conversations apart. The only reliable identity is
 * the card reference the AI itself sends. Every Bridge tool call may carry task_id / overview_session_id; keys the target tool
 * does not declare are removed from its arguments (so schema validation does not reject them) and returned as `ref`.
 */
function splitCardRef(args, declares) {
  if (!args || typeof args !== "object" || Array.isArray(args)) return { args, ref: void 0 };
  const ref = {};
  let rest = args;
  for (const key of ["task_id", "overview_session_id"]) {
    if (!Object.prototype.hasOwnProperty.call(args, key)) continue;
    const value = args[key];
    if (typeof value === "string" && value.trim() && value.length <= 80) ref[key] = value.trim();
    let declared = false;
    try { declared = declares?.(key) === true; } catch { declared = false; }
    if (!declared) { if (rest === args) rest = { ...args }; delete rest[key]; }
  }
  return { args: rest, ref: Object.keys(ref).length ? ref : void 0 };
}
/** task-card-multi-conv: first line of every set_todos/update_plan acknowledgement, so the AI keeps and resends the task_id. */
function cardAckPrefix(taskId) {
  return `\u3010\u672C\u5BF9\u8BDD\u4EFB\u52A1\u5361 task_id=${taskId}\u3011\u4E4B\u540E\u672C\u5BF9\u8BDD\u7684\u6BCF\u4E2A Bridge \u5DE5\u5177\u8C03\u7528\uFF08run_command\u3001read_files\u3001apply_patch \u7B49\uFF09\u90FD\u8BF7\u9644\u52A0\u53C2\u6570 task_id=${taskId}\uFF0C\u66F4\u65B0\u6216\u5B8C\u6210\u672C\u5361\u7684 set_todos \u4E5F\u5FC5\u987B\u5E26\u5B83\uFF1B\u591A\u4E2A\u5BF9\u8BDD\u540C\u65F6\u8FDE\u63A5\u65F6\uFF0C\u4E0D\u5E26 task_id \u7684\u8C03\u7528\u65E0\u6CD5\u5F52\u5230\u672C\u5361\u3002`;
}
var TASK_TARGET_REQUIRED_MESSAGE = "TASK_TARGET_REQUIRED: \u672C\u6B21 set_todos \u6CA1\u6709\u5E26 task_id\uFF08\u6216\u672C\u5BF9\u8BDD\u7684 overview_session_id\uFF09\uFF0C\u4E5F\u6CA1\u6709 new_task=true\uFF0C\u670D\u52A1\u7AEF\u65E0\u6CD5\u5224\u65AD\u8981\u66F4\u65B0\u54EA\u5F20\u4EFB\u52A1\u5361\uFF08\u65E0\u72B6\u6001\u5BA2\u6237\u7AEF\u6BCF\u6B21\u8C03\u7528\u90FD\u662F\u65B0\u8FDE\u63A5\uFF0C\u591A\u4E2A\u5BF9\u8BDD\u53EF\u80FD\u540C\u65F6\u5728\u7EBF\uFF09\u3002\u672A\u5199\u5165\u4EFB\u4F55\u5361\u7247\u3002\u66F4\u65B0\u6216\u5B8C\u6210\u5DF2\u6709\u4EFB\u52A1\uFF1A\u5E26\u4E0A\u4F60\u81EA\u5DF1 set_todos \u56DE\u6267\u91CC\u7684 task_id \u91CD\u65B0\u63D0\u4EA4\uFF1B\u65B0\u5DE5\u4F5C\uFF1A\u4F20 new_task=true\u3002\u4E0D\u8981\u731C\u6D4B\u6216\u4F7F\u7528\u5176\u4ED6\u5BF9\u8BDD\u7684 task_id\u3002";
var BridgeTaskStore = class {
  constructor(maxTodos, now = Date.now, _legacyMaxActiveTasks, maxHistory = 8) {
    this.maxTodos = maxTodos;
    this.now = now;
    this.maxHistory = maxHistory;
  }
  maxTodos;
  now;
  maxHistory;
  lastCreationSequence = 0;
  tasks = /* @__PURE__ */ new Map();
  currentByOwner = /* @__PURE__ */ new Map();
  /** Session hints are untrusted; namespace them by the authenticated task owner. */
  overviewBySession = /* @__PURE__ */ new Map();
  selectedId;
  persistenceFile;
  workspaceKey;
  questionWaiters = new Map();
  batchWaiters = new Map();
  activeCallsByOwner = /* @__PURE__ */ new Map();
  /** task-system-truth: in-memory tool activity attributed to a card (never persisted, never bumps the card revision). */
  activityByTask = /* @__PURE__ */ new Map();
  /** task-system-truth: stateless MCP owner -> card id its tool calls were attributed to. */
  ownerAttribution = /* @__PURE__ */ new Map();
  /** task-system-truth: owner -> time its MCP session ended (display only; a dropped session is not an interrupted job). */
  ownerDisconnectedAt = /* @__PURE__ */ new Map();
  /** Durable per-task records. Never delete another workspace or a task memory on startup. */
  configurePersistence(dataDirectory, workspaceRoot) {
    this.tasks.clear();
    this.currentByOwner.clear();
    this.overviewBySession.clear();
    this.activeCallsByOwner.clear();
    this.activityByTask.clear();
    this.ownerAttribution.clear();
    this.ownerDisconnectedAt.clear();
    this.selectedId = void 0;
    this.persistenceDirectory = void 0;
    this.checkpointFingerprints = new Map();
    this.lastCreationSequence = 0;
    if (!dataDirectory || !workspaceRoot) return;
    this.workspaceKey = crypto.createHash("sha256").update(path.resolve(workspaceRoot).replaceAll("\\", "/").toLowerCase()).digest("hex");
    this.persistenceDirectory = path.join(dataDirectory, "bridge-task-history", this.workspaceKey);
    fs.mkdirSync(this.persistenceDirectory, { recursive: true });
    for (const name of fs.readdirSync(this.persistenceDirectory)) {
      if (!/^[0-9a-f-]{36}\.json$/i.test(name)) continue;
      const saved = JSON.parse(fs.readFileSync(path.join(this.persistenceDirectory, name), "utf8"));
      const task = saved.task;
      if (saved.format !== "opencode-bridge-task-v2" || !task || task.id + ".json" !== name || typeof task.owner !== "string" || !Array.isArray(task.todos) || !Array.isArray(task.history)) throw new Error("Invalid durable task record: " + name);
      task.executionUnverified = isActive(task.state);
      // task-system-truth: say why a restored card is not shown as running.
      if (task.executionUnverified) task.interruptReason ??= "opencode_restart";
      this.tasks.set(task.id, task);
    }
    for (const task of [...this.tasks.values()].sort((a,b) => a.createdAt-b.createdAt || a.updatedAt-b.updatedAt)) {
      task.creationSequence ??= ++this.lastCreationSequence;
      this.lastCreationSequence = Math.max(this.lastCreationSequence, task.creationSequence);
      if (!task.displayDeleted) {
        this.currentByOwner.set(task.owner, task.id);
        this.selectedId = task.id;
        if (task.memory) this.onTaskMemory?.(task.owner, task.memory);
      }
      // Loading history is read-only: a new writer must not rewrite a source model record.
      this.checkpointFingerprints.set(task.id, JSON.stringify(task));
    }
  }
  memoryFor(owner, taskId) {
    const target = this.memoryTargetReader?.(owner);
    const memoryRoot = target?.memoryDir || (this.persistenceDirectory ? path.join(this.persistenceDirectory, "memory") : null);
    if (!memoryRoot) return null;
    const actorId = crypto.createHash("sha256").update(owner).digest("hex");
    const memoryDir = path.join(memoryRoot, "actors", actorId, "tasks", taskId);
    return { scopeId: target?.scopeId || "local", bucketId: target?.bucketId || null, memoryRoot, actorId, memoryDir,
      checkpointPath: path.join(memoryDir, "task-checkpoint.json"), journalPath: path.join(memoryDir, "task-events.jsonl") };
  }

  beginOwnerActivity(owner) {
    if (!owner) return;
    this.activeCallsByOwner.set(owner, (this.activeCallsByOwner.get(owner) ?? 0) + 1);
    this.touchOwner(owner);
  }
  endOwnerActivity(owner) {
    if (!owner) return;
    const next = (this.activeCallsByOwner.get(owner) ?? 0) - 1;
    if (next > 0) this.activeCallsByOwner.set(owner, next);
    else this.activeCallsByOwner.delete(owner);
    this.touchOwner(owner);
    const attributed = this.ownerAttribution.get(owner);
    const seen = attributed ? this.activityByTask.get(attributed) : void 0;
    if (seen) seen.at = this.now();
  }
  /** task-system-truth: newest evidence that a card's dialogue is still working (card write or attributed tool call). */
  lastActivityAt(task) {
    return Math.max(task?.updatedAt ?? 0, this.activityByTask.get(task?.id)?.at ?? 0);
  }
  attributedBusy(taskId) {
    for (const [owner, id] of this.ownerAttribution) if (id === taskId && this.isOwnerBusy(owner)) return true;
    return false;
  }
  /**
   * task-system-truth: stateless MCP clients (mcpcall/curl/Bash) open a new session on every call, so their tool calls
   * arrive under owners that never wrote the card. Attribute such a call to an open card only on real evidence:
   * the owner's own card, an explicit task_id / overview_session_id argument, or the single open card created by the
   * same client label within the attribution window. Ambiguous calls are not attributed (they show as untracked activity).
   */
  attributeActivity(owner, info) {
    if (!owner || String(owner).startsWith("native-chat:")) return void 0;
    const tool = String(info?.tool || "").split("__").pop();
    if (/^(set_todos|update_plan)$/.test(tool)) return void 0;
    const at = this.now();
    // task-card-multi-conv: the explicit card reference (stripped from the tool arguments by the dispatcher) comes first.
    const rawArgs = info?.args && typeof info.args === "object" && !Array.isArray(info.args) ? info.args : {};
    const args = { ...info?.ref && typeof info.ref === "object" ? info.ref : {}, ...rawArgs };
    const open = (t) => !!t && !t.displayDeleted && !isTerminal(t.state) && !t.supersededAt;
    let task;
    if (typeof args.task_id === "string" && args.task_id) {
      let t = this.tasks.get(args.task_id);
      if (!t && args.task_id.length >= 8) { const hits = [...this.tasks.values()].filter((c) => c.id.startsWith(args.task_id.toLowerCase())); if (hits.length === 1) t = hits[0]; }
      if (open(t)) task = t;
      else if (t) {
        // An explicit reference to a finished card is still this dialogue's activity: not "untracked", but it never reopens the card.
        this.ownerAttribution.delete(owner);
        this.ownerAttribution.set(owner, t.id);
        return void 0;
      }
    }
    if (!task) { const own = this.tasks.get(this.currentByOwner.get(owner) ?? ""); if (open(own) && own.owner === owner) task = own; }
    if (!task && typeof args.overview_session_id === "string") { try { task = this.statelessCardForSession(owner, args.overview_session_id); } catch { task = void 0; } }
    // task-card-multi-conv: the same-client guess is only for one-shot (stateless) connections. A connection that keeps its
    // session (more than 2 calls) is a conversation of its own; crediting its calls to another dialogue's only open card made
    // that card look busy and hid the untracked conversation. Drop such an earlier guess too.
    const persistentSession = (this.liveDialogues.get(owner)?.calls ?? 0) > 2;
    if (persistentSession && this.ownerGuessed?.has(owner)) { this.ownerGuessed.delete(owner); this.ownerAttribution.delete(owner); }
    let guessed = false;
    if (!task && !persistentSession && STATELESS_BRIDGE_OWNER.test(String(owner)) && info?.label) {
      const label = String(info.label);
      const candidates = [...this.tasks.values()].filter((t) => open(t) && t.clientLabel === label && !String(t.owner).startsWith("native-chat:") && at - this.lastActivityAt(t) < BRIDGE_TASK_ATTRIBUTION_WINDOW_MS);
      if (candidates.length === 1) { task = candidates[0]; guessed = true; }
    }
    if (!task) return void 0;
    this.activityByTask.set(task.id, { at, tool: tool.slice(0, 60) });
    this.ownerAttribution.delete(owner);
    this.ownerAttribution.set(owner, task.id);
    this.ownerGuessed ??= /* @__PURE__ */ new Set();
    if (guessed) this.ownerGuessed.add(owner); else this.ownerGuessed.delete(owner);
    while (this.ownerGuessed.size > 1024) this.ownerGuessed.delete(this.ownerGuessed.values().next().value);
    while (this.ownerAttribution.size > 1024) this.ownerAttribution.delete(this.ownerAttribution.keys().next().value);
    return task.id;
  }
  isOwnerBusy(owner) {
    return (this.activeCallsByOwner.get(owner) ?? 0) > 0;
  }
  /**
   * The dialogue's fixed identity plus every identity it took over by handoff (persisted as retiredOwners
   * on the cards it now owns), followed transitively. A successor that took over a card is the same
   * dialogue for display purposes: its next task supersedes the predecessor's cards too.
   */
  /** Full overview_session_id for the owner's own set_todos acknowledgement (publicTask only exposes a short tag).
   * External (non native-chat) owners always get one: a card that has none is given the owner's existing dialogue
   * id or a freshly minted UUID v4, persisted, exactly like update() mints it for new cards. */
  overviewSessionIdFor(taskId, owner) {
    const task = typeof taskId === "string" ? this.tasks.get(taskId) : void 0;
    if (!task || typeof owner !== "string" || owner.startsWith("native-chat:") || task.owner !== owner) return void 0;
    if (!task.overviewSessionId) {
      task.overviewSessionId = this.dialogueIdFor(owner) ?? (0, import_node_crypto20.randomUUID)();
      this.persist();
    }
    return task.overviewSessionId;
  }
  /** The fixed dialogue identity (overview_session_id) this owner last used on one of its cards. */
  dialogueIdFor(owner) {
    let best;
    for (const t of this.tasks.values()) if (t.owner === owner && t.overviewSessionId && (!best || t.creationSequence > best.creationSequence)) best = t;
    return best?.overviewSessionId;
  }
  /** A successor's own id that was replaced by its predecessor's id on handoff keeps resolving to the predecessor's id. */
  resolveOverviewAlias(id) {
    for (const t of this.tasks.values()) if (Array.isArray(t.overviewAliases) && t.overviewAliases.includes(id) && t.overviewSessionId) return t.overviewSessionId;
    return id;
  }
  identityLineage(owner) {
    const lineage = /* @__PURE__ */ new Set([owner]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const t of this.tasks.values()) {
        if (!lineage.has(t.owner)) continue;
        for (const retired of t.retiredOwners ?? []) if (retired && !lineage.has(retired)) { lineage.add(retired); grew = true; }
      }
    }
    return lineage;
  }
  touchOwner(owner) {
    if (!owner) return;
    const at = this.now();
    for (const task of this.tasks.values()) {
      if (task.owner === owner && isActive(task.state)) task.updatedAt = at;
    }
  }
  persist() {
    this.checkpointFingerprints ??= new Map();
    for (const task of this.tasks.values()) {
      const serialized = JSON.stringify(task);
      if (this.checkpointFingerprints.get(task.id) === serialized) continue;
      if (task.memory) {
        const checkpoint = { format: "opencode-task-checkpoint-v1", savedAt: this.now(), task: this.publicTask(task),
          execution: { restored: task.executionUnverified === true, processOwnershipTransferred: false,
            note: "Only submitted facts are saved. A tool response does not prove a process exited. Unsaved reasoning and in-flight results remain unknown." } };
        fs.mkdirSync(task.memory.memoryDir, { recursive: true });
        this.atomicWrite(task.memory.checkpointPath, JSON.stringify(checkpoint, null, 2));
        fs.appendFileSync(task.memory.journalPath, JSON.stringify(checkpoint) + "\n", { encoding: "utf8", mode: 0o600 });
      }
      if (this.persistenceDirectory) this.atomicWrite(path.join(this.persistenceDirectory, task.id + ".json"), JSON.stringify({ format: "opencode-bridge-task-v2", task }));
      this.checkpointFingerprints.set(task.id, serialized);
    }
  }
  atomicWrite(file, text) {
    const temporary = file + "." + process.pid + "." + crypto.randomUUID() + ".tmp";
    try { fs.writeFileSync(temporary, text, { encoding: "utf8", mode: 0o600 }); fs.renameSync(temporary, file); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  recordToolEvent(taskId, event) {
    const task = this.tasks.get(taskId);
    if (!task || task.displayDeleted) return;
    task.toolEvents = [...(task.toolEvents || []).filter(e => e.id !== event.id), event].slice(-24);
    this.persist();
  }
  /** Retention is explicit; elapsed time never deletes completed or unfinished work. */
  pruneTerminal() { return 0; }
  /** Called only behind a local confirmation prompt, never through an MCP tool.
   * Validate the whole batch before removing any record; stale or revived tasks abort.
   */
  clearTasks(requests, allowAttention = false) {
    // task-system-truth: untracked activity rows (live:*) are display-only; clearing them just dismisses them.
    if (Array.isArray(requests) && requests.some((item) => typeof item?.id === "string" && item.id.startsWith("live:"))) {
      let dismissed = 0;
      for (const item of requests) if (typeof item?.id === "string" && item.id.startsWith("live:") && this.deleteTaskDisplay(item.id)) dismissed++;
      const rest = requests.filter((item) => !(typeof item?.id === "string" && item.id.startsWith("live:")));
      return dismissed + (rest.length ? this.clearTasks(rest, allowAttention) : 0);
    }
    if (!Array.isArray(requests) || !requests.length || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT) throw new Error("Select a bounded non-empty batch of Bridge tasks to clear.");
    const seen = /* @__PURE__ */ new Set();
    for (const item of requests) {
      if (!item || typeof item.id !== "string" || !item.id || seen.has(item.id) || !Number.isSafeInteger(item.revision)) throw new Error("Invalid or duplicate task clear request.");
      seen.add(item.id);
      const task = this.tasks.get(item.id);
      if (!task || task.revision !== item.revision) throw new Error("Task changed or expired; refresh the list and confirm again.");
      const effectiveState = this.publicTask(task).state;
      if (!isTerminal(effectiveState) && !(allowAttention && ["blocked", "interrupted", "awaiting_sync", "waiting_plan"].includes(effectiveState))) {
        throw new Error("Running, planning and awaiting-sync tasks cannot be cleared here. Blocked or interrupted tasks require explicit warning.");
      }
    }
    for (const { id } of requests) {
      const task = this.tasks.get(id);
      task.displayDeleted = true;
      task.displayDeletedAt = this.now();
      if (this.currentByOwner.get(task.owner) === id) this.currentByOwner.delete(task.owner);
      if (this.selectedId === id) this.selectedId = void 0;
    }
    if (!this.selectedId) this.selectedId = [...this.tasks.values()].filter((t) => !t.displayDeleted).at(-1)?.id;
    this.persist();
    return requests.length;
  }
  deleteTaskDisplay(taskId) {
    if (typeof taskId !== "string" || !taskId) throw new Error("Invalid task display deletion request.");
    if (taskId.startsWith("live:")) {
      const owners = this.liveClusterOwners.get(taskId) ?? [];
      for (const owner of owners) this.liveDismissed.set(owner, this.liveDialogues.get(owner)?.lastAt ?? this.now());
      return owners.length > 0;
    }
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.displayDeleted = true;
    task.displayDeletedAt = this.now();
    if (this.currentByOwner.get(task.owner) === taskId && !isActive(this.publicTask(task).state)) {
      this.currentByOwner.delete(task.owner);
    }
    if (this.selectedId === taskId) {
      this.selectedId = [...this.tasks.values()].filter((t) => !t.displayDeleted).at(-1)?.id;
    }
    this.persist();
    return true;
  }
  /** Local UI only (「复制记忆后接班」): clone a card with its progress and a full copy of its memory folder.
   * The clone waits under a placeholder owner until a new dialogue takes it over with set_todos(task_id, mode=patch). */
  forkTask(taskId) {
    const source = typeof taskId === "string" ? this.tasks.get(taskId) : void 0;
    if (!source) throw new Error("任务显示已变化，请刷新后重试。");
    if (!source.memory?.memoryDir) throw new Error("此任务没有已保存的记忆文件夹，无法复制记忆后接班。");
    // Finished cards can be copied too; the copy is reopened when a new dialogue takes it over with handoff=true.
    this.persist();
    const newId = crypto.randomUUID();
    const at = this.now();
    const sourceDir = source.memory.memoryDir;
    const targetDir = path.join(path.dirname(sourceDir), newId);
    const forkedFrom = { taskId: source.id, revision: source.revision, title: source.title, at };
    const rewrittenFiles = copyTaskMemoryDir(sourceDir, targetDir, { sourceTaskId: source.id, targetTaskId: newId, origin: forkedFrom });
    const memory = { ...source.memory, memoryDir: targetDir,
      checkpointPath: path.join(targetDir, path.basename(source.memory.checkpointPath || "task-checkpoint.json")),
      journalPath: path.join(targetDir, path.basename(source.memory.journalPath || "task-events.jsonl")) };
    const task = JSON.parse(JSON.stringify(source));
    for (const key of ["displayDeleted", "displayDeletedAt", "displayDeletedReason", "overviewSessionId", "overviewAliases", "overview", "toolEvents"]) delete task[key];
    Object.assign(task, {
      id: newId, creationSequence: ++this.lastCreationSequence, memory, owner: "handoff-pending:" + newId,
      createdAt: at, updatedAt: at, retiredOwners: [], handoffs: [], forkedFrom: { ...forkedFrom, rewrittenFiles },
      title: (source.title || "任务") + "（副本）",
      questions: (source.questions ?? []).map((q) => q.status === "pending" ? { ...q, status: "cancelled" } : q)
    });
    this.tasks.set(newId, task);
    this.currentByOwner.set(task.owner, newId);
    this.selectedId = newId;
    this.persist();
    return this.publicTask(task);
  }
  /** Local UI only: mark confirmed, genuinely stale work interrupted without deleting its task card. */
  interruptStaleTasks(requests) {
    if (Array.isArray(requests) && requests.some((item) => typeof item?.id === "string" && item.id.startsWith("live:"))) {
      let dismissed = 0;
      for (const item of requests) if (typeof item?.id === "string" && item.id.startsWith("live:") && this.deleteTaskDisplay(item.id)) dismissed++;
      const rest = requests.filter((item) => !(typeof item?.id === "string" && item.id.startsWith("live:")));
      return dismissed + (rest.length ? this.interruptStaleTasks(rest) : 0);
    }
    if (!Array.isArray(requests) || !requests.length || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT) throw new Error("Select a bounded non-empty batch of stale Bridge tasks to interrupt.");
    const seen = /* @__PURE__ */ new Set();
    const at = this.now();
    const tasks = [];
    for (const item of requests) {
      if (!item || typeof item.id !== "string" || !item.id || seen.has(item.id) || !Number.isSafeInteger(item.revision)) throw new Error("Invalid or duplicate stale-task interruption request.");
      seen.add(item.id);
      const task = this.tasks.get(item.id);
      if (!task || task.revision !== item.revision) throw new Error("Task changed or expired; refresh the list and confirm again.");
      if (!isActive(task.state) || at - this.lastActivityAt(task) < BRIDGE_TASK_AWAITING_SYNC_MS) throw new Error("Only tasks waiting for sync for at least 20 minutes can be marked interrupted.");
      tasks.push(task);
    }
    for (const task of tasks) {
      task.state = "interrupted";
      task.interruptReason = "marked_by_user";
      task.progress = null;
      task.revision++;
      task.updatedAt = at;
      task.history = [...task.history, { revision: task.revision, at, state: task.state, completed: task.todos.filter((t) => t.status === "completed").length, total: task.todos.length, removed: [] }].slice(-this.maxHistory);
    }
    this.persist();
    return tasks.length;
  }
  /** A stateless reconnect of the same unbound external dialogue: both owners are unbound bridge sessions,
   * the card is unfinished, the previous session is idle and this owner was not retired by a handoff. */
  isStatelessReconnect(task, owner) {
    return !!task && typeof owner === "string" && task.owner !== owner && STATELESS_BRIDGE_OWNER.test(owner) && STATELESS_BRIDGE_OWNER.test(task.owner)
      && !isTerminal(task.state) && !this.isOwnerBusy(task.owner) && !(Array.isArray(task.retiredOwners) && task.retiredOwners.includes(owner));
  }
  /** Move the card to the reconnected session without a handoff: steps, questions, memory and identity are kept. */
  rebindStatelessOwner(task, owner) {
    const old = task.owner;
    task.owner = owner;
    task.executionUnverified = false;
    task.statelessReconnects = (task.statelessReconnects ?? 0) + 1;
    if (this.currentByOwner.get(old) === task.id) this.currentByOwner.delete(old);
    this.currentByOwner.set(owner, task.id);
    const seen = this.lastSeen.get(old + "\0" + task.id);
    if (seen) { this.lastSeen.delete(old + "\0" + task.id); this.lastSeen.set(owner + "\0" + task.id, seen); }
    const count = this.activeCallsByOwner.get(old);
    if (count === void 0) this.activeCallsByOwner.delete(old);
    return task;
  }
  /** Card of this dialogue identified by its overview_session_id, for a stateless reconnect that omitted task_id. */
  statelessCardForSession(owner, sessionId) {
    if (!STATELESS_BRIDGE_OWNER.test(owner ?? "") || typeof sessionId !== "string" || !sessionId) return void 0;
    const id = this.resolveOverviewAlias(sessionId);
    let best;
    for (const t of this.tasks.values()) {
      if (t.displayDeleted || !(t.overviewSessionId === id || (t.overviewAliases ?? []).includes(id))) continue;
      if (t.owner !== owner && !this.isStatelessReconnect(t, owner)) continue;
      if (isTerminal(t.state)) continue;
      if (!best || t.creationSequence > best.creationSequence) best = t;
    }
    return best;
  }
  resolve(owner, value, opts = {}) {
    const input = record2(value);
    if (input.task_id !== void 0 && (typeof input.task_id !== "string" || !input.task_id || input.task_id.length > 80)) throw new Error("task_id must be a non-empty task handle returned by Bridge.");
    const id = input.task_id;
    let task = this.tasks.get(id ?? this.currentByOwner.get(owner) ?? "");
    if (id && !task) {
      // task-system-truth: a truncated/mistyped task_id (seen in practice: last character dropped) must not lose a completion write.
      task = this.recoverTaskId(owner, input);
      if (task) { this.addNote(owner, `task_id "${id}" 不完整，已按${task.__recoveredBy}对应到任务 ${task.id}`); delete task.__recoveredBy; input.task_id = task.id; }
    }
    if (id && !task) throw new Error("Unknown or expired task_id. Start a new task; do not replay an obsolete snapshot.");
    // Stateless reconnect: the unguessable task_id (or this dialogue's overview_session_id) proves continuity.
    if (!task && !id && typeof input.overview_session_id === "string") task = this.statelessCardForSession(owner, input.overview_session_id);
    if (task && task.owner !== owner && opts.takeover !== true && this.isStatelessReconnect(task, owner)) this.rebindStatelessOwner(task, owner);
    if (task && id && task.owner !== owner && Array.isArray(task.retiredOwners) && task.retiredOwners.includes(owner)) throw new Error(TASK_HANDED_OFF_MESSAGE);
    let sameSource = false;
    // Explicit handoff=true may take over any card, including a finished (completed/cancelled/cleared) one:
    // the successor continues the same card, progress and memory folder (full takeover).
    if (task && id && task.owner !== owner && opts.takeover === true) sameSource = true;
    else if (task && id && task.owner !== owner && !isTerminal(task.state)) { try { const a = this.sourceIdentityReader?.(task.owner)?.bindingId, b = this.sourceIdentityReader?.(owner)?.bindingId; sameSource = !!a && a === b; } catch {}
      // Restart-restored (execution unverified) task: only the same source binding or an explicit handoff=true may write.
      if (!sameSource && task.executionUnverified === true) throw new Error(TASK_RESTORED_TAKEOVER_MESSAGE); }
    // A reconnected dialogue of the same source link may resume its own task by explicit task_id.
    if (task && task.owner !== owner && !sameSource) throw new Error("task_id belongs to a different client session; to take it over pass handoff=true with its task_id and expected_revision.");
    return task;
  }
  /** Unique card for an unknown task_id: a unique id prefix (>= 8 chars) or, failing that, this dialogue's open card whose id shares the first 8 chars. */
  recoverTaskId(owner, input) {
    const id = String(input?.task_id ?? "").trim().toLowerCase();
    if (id.length < 8) return void 0;
    const byPrefix = [...this.tasks.values()].filter((t) => t.id.startsWith(id));
    if (byPrefix.length === 1) { byPrefix[0].__recoveredBy = "唯一前缀"; return byPrefix[0]; }
    if (typeof input.overview_session_id === "string") {
      let t;
      try { t = this.statelessCardForSession(owner, this.resolveOverviewAlias(input.overview_session_id)); } catch { t = void 0; }
      if (!t) for (const c of this.tasks.values()) if (c.owner === owner && !isTerminal(c.state) && (c.overviewSessionId === input.overview_session_id) && (!t || c.creationSequence > t.creationSequence)) t = c;
      if (t && t.id.slice(0, 8) === id.slice(0, 8)) { t.__recoveredBy = "对话标识 overview_session_id"; return t; }
    }
    return void 0;
  }
  addNote(owner, text) {
    const prev = this.autoRevisionNotes.get(owner);
    this.autoRevisionNotes.set(owner, prev ? prev + "；" + text : text);
  }
  /** True when another dialogue took over this owner's unfinished task and this owner has not started a new one. */
  isOwnerHandedOff(owner) {
    if (!owner || this.currentByOwner.get(owner)) return false;
    for (const task of this.tasks.values()) if (!isTerminal(task.state) && task.owner !== owner && Array.isArray(task.retiredOwners) && task.retiredOwners.includes(owner)) return true;
    return false;
  }
  /** Waiting is owned by the real task owner, not by a replaceable task card ID. */
  outstandingForOwner(owner) {
    for (const task of this.tasks.values()) {
      if (task.owner !== owner) continue;
      const questions = task.questions ?? [];
      const outstanding = questions.filter((q) => q.status !== "answered" || (q.requiresMcpAck === true && !q.deliveredAt));
      if (outstanding.length) return { taskId: task.id, pending: outstanding.filter((q) => q.status === "pending").length,
        undelivered: outstanding.filter((q) => q.status === "answered").length,
        batchId: outstanding[0].batchId ?? null, questionId: outstanding[0].id };
    }
    return null;
  }
  /** Only call after a complete `status=answered` result is ready for MCP delivery. */
  markAnswersDelivered(owner, taskId, ids) {
    const task = this.resolve(owner, { task_id: taskId });
    if (!task || !Array.isArray(ids) || !ids.length) throw new Error("没有可确认回传的回答。");
    const questions = ids.map((id) => task.questions?.find((q) => q.id === id));
    if (questions.some((q) => !q || q.status !== "answered" || !q.answer)) {
      throw new Error("仍有问题未回答，不能解除等待门禁。");
    }
    const before = questions.map((q) => q.deliveredAt);
    const at = this.now();
    for (const q of questions) q.deliveredAt = at;
    try { this.persist(); }
    catch (error) { questions.forEach((q, i) => { if (before[i] === void 0) delete q.deliveredAt; else q.deliveredAt = before[i]; }); throw error; }
  }
  // recovered.33: per-caller last-read snapshot so an owner may omit expected_revision safely.
  lastSeen = /* @__PURE__ */ new Map();
  autoRevisionNotes = /* @__PURE__ */ new Map();
  noteSeen(owner, task) {
    if (!owner || !task?.id) return;
    const key = owner + "\0" + task.id;
    this.lastSeen.delete(key);
    this.lastSeen.set(key, { revision: task.revision, state: task.state, todos: Object.fromEntries((task.todos || []).map((todo) => [todo.id, { title: todo.title, status: todo.status }])) });
    while (this.lastSeen.size > 512) this.lastSeen.delete(this.lastSeen.keys().next().value);
  }
  takeAutoRevisionNote(owner) { const note = this.autoRevisionNotes.get(owner); this.autoRevisionNotes.delete(owner); return note; }
  /** Server-side merge: the owner's own card, unchanged since its last read, or a patch touching no step changed since. */
  autoRevision(owner, previous, input, todos) {
    if (!previous || previous.owner !== owner || input.handoff === true) return null;
    const seen = this.lastSeen.get(owner + "\0" + previous.id);
    if (!seen || seen.revision === previous.revision) return previous.revision;
    if (input.mode !== "patch" || seen.state !== previous.state) return null;
    const changed = new Set(previous.todos.filter((todo) => { const old = seen.todos[todo.id]; return !old || old.title !== todo.title || old.status !== todo.status; }).map((todo) => todo.id));
    for (const id of Object.keys(seen.todos)) if (!previous.todos.some((todo) => todo.id === id)) changed.add(id);
    return todos.some((todo) => changed.has(todo.id)) ? null : previous.revision;
  }
  isOwnStaleRevision(owner, previous, input) {
    if (!previous || previous.owner !== owner || isTerminal(previous.state) || input.handoff === true) return false;
    if (typeof input.overview_session_id !== "string" || !previous.overviewSessionId || this.resolveOverviewAlias(input.overview_session_id) !== previous.overviewSessionId) return false;
    if (!(input.expected_revision >= 1 && input.expected_revision < previous.revision)) return false;
    if ((previous.history ?? []).some((h) => h.revision > input.expected_revision && h.handoff)) return false;
    if ((previous.handoffs ?? []).some((h) => h.fromRevision >= input.expected_revision)) return false;
    return true;
  }
  update(owner, todos, value) {
    const input = record2(value);
    if (input.new_task !== void 0 && typeof input.new_task !== "boolean") throw new Error("new_task must be boolean.");
    if (input.new_task && (input.task_id !== void 0 || input.expected_revision !== void 0)) throw new Error("new_task cannot resume or revise an existing task.");
    if (input.new_task && this.outstandingForOwner(owner)) throw new Error("WAITING_FOR_USER_ANSWERS: 当前会话仍有未完整回传的用户决策，不能创建新任务绕过等待。");
    if (input.mode !== void 0 && input.mode !== "replace" && input.mode !== "patch") throw new Error("mode must be replace or patch.");
    if (input.handoff !== void 0 && typeof input.handoff !== "boolean") throw new Error("handoff must be boolean.");
    if (input.handoff === true && (input.new_task || input.task_id === void 0 || input.expected_revision === void 0)) throw new Error("handoff=true requires the source task_id and its expected_revision, and cannot be combined with new_task.");
    if (!input.new_task && input.task_id === void 0 && this.isOwnerHandedOff(owner)) throw new Error(TASK_HANDED_OFF_MESSAGE);
    if (input.lifecycle !== void 0 && !["running", "completed", "blocked", "cancelled"].includes(String(input.lifecycle))) throw new Error("Invalid task lifecycle.");
    if (input.source_label !== void 0 && (typeof input.source_label !== "string" || input.source_label.length > 80)) throw new Error("source_label must be at most 80 characters.");
    if (input.task_title !== void 0 && (typeof input.task_title !== "string" || !input.task_title.trim() || input.task_title.length > 160)) throw new Error("task_title must contain 1-160 characters.");
    for (const key of ["overview_model", "overview_provider"]) {
      if (input[key] !== void 0 && (typeof input[key] !== "string" || input[key].length > 80)) throw new Error(`${key} must be at most 80 characters.`);
    }
    if (input.overview_session_id !== void 0 && (typeof input.overview_session_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.overview_session_id))) {
      throw new Error("overview_session_id must be a random UUID v4, not a client or task identity.");
    }
    this.pruneTerminal();
    let previous = input.new_task ? void 0 : this.resolve(owner, input, { takeover: input.handoff === true });
    if (input.new_task && owner.startsWith("native-chat:")) {
      const reserved = this.tasks.get(this.currentByOwner.get(owner) ?? "");
      if (reserved?.state === "waiting_plan" && reserved.revision === 1 && !reserved.todos.length) previous = reserved;
    }
    // task-card-multi-conv: an external write that names no card (no task_id, no resolvable overview_session_id, no card of
    // this connection) and is not new_task used to mint a fresh card silently. For stateless clients that meant a completion
    // landed on a NEW card while the real one stayed "running" forever. Refuse it instead of guessing; nothing is written.
    if (!input.new_task && !previous && todos.length && !owner.startsWith("native-chat:") && !owner.startsWith("handoff-pending:")) {
      throw new Error(TASK_TARGET_REQUIRED_MESSAGE);
    }
    // Fixed dialogue identity: a successor that takes over a card adopts the predecessor's overview_session_id;
    // its own id is kept as an alias so later calls with it resolve to the inherited identity.
    let adoptedAlias;
    if (input.overview_session_id) input.overview_session_id = this.resolveOverviewAlias(input.overview_session_id);
    if (previous && previous.owner !== owner && previous.overviewSessionId && input.overview_session_id && previous.overviewSessionId !== input.overview_session_id) {
      adoptedAlias = input.overview_session_id;
      input.overview_session_id = previous.overviewSessionId;
    }
    if (previous?.overviewSessionId && input.overview_session_id && previous.overviewSessionId !== input.overview_session_id) {
      throw new Error("Cannot move an existing task to a different overview session.");
    }
    const explicit = input.task_id !== void 0;
    if ((explicit || input.mode === "patch") && input.expected_revision === void 0) {
      const auto = this.autoRevision(owner, previous, input, todos);
      if (auto === null) throw new Error(`Provide expected_revision from the last acknowledgement for task_id or patch updates; this card is not yours or changed in conflicting fields since your last read (current revision ${previous?.revision ?? "missing"}). No changes applied.`);
      const merged = this.lastSeen.get(owner + "\0" + previous.id)?.revision !== auto && this.lastSeen.has(owner + "\0" + previous.id);
      input.expected_revision = auto;
      this.addNote(owner, `expected_revision 省略：服务端按最新修订 ${auto} ${merged ? "合并（自上次读取后的变化不涉及本次修改的步骤）" : "应用"}。`);
    }
    if (input.expected_revision !== void 0 && previous && Number.isSafeInteger(input.expected_revision) && input.expected_revision !== previous.revision && this.isOwnStaleRevision(owner, previous, input)) {
      // task-system-truth: the same dialogue (same owner after reconnect + same overview_session_id, no handoff since) re-sending
      // an older revision is its own latest intent; rejecting it silently lost completion writes.
      this.addNote(owner, `expected_revision ${input.expected_revision} 已过期，但自那以后只有本对话自己写过此卡，已按最新修订 ${previous.revision} 应用`);
      input.expected_revision = previous.revision;
    }
    if (input.expected_revision !== void 0) {
      if (!Number.isSafeInteger(input.expected_revision) || input.expected_revision !== previous?.revision) throw new Error(`Task revision conflict; current revision is ${previous?.revision ?? "missing"}. No changes applied.`);
    }
    const handingOff = !!previous && previous.owner !== owner;
    // Handing off a finished card reopens it for the successor (same card, same todos, same memory folder).
    const reopening = handingOff && isTerminal(previous.state);
    if (handingOff && !todos.length && input.mode !== "patch") throw new Error("\u63A5\u73ED\u4E0D\u80FD\u7528\u7A7A replace \u6E05\u7A7A\u6E90\u4EFB\u52A1\uFF1B\u8BF7\u7528 mode=patch\uFF08\u53EF\u4E3A\u7A7A todos \u539F\u6837\u63A5\u7BA1\uFF09\u6216\u63D0\u4EA4\u5B8C\u6574\u8BA1\u5212\u3002");
    if (input.mode === "patch") {
      if (!previous) throw new Error("A patch requires an existing task.");
      const patch = new Map(todos.map((t) => [t.id, t]));
      todos = [...previous.todos.map((t) => patch.get(t.id) ?? t), ...todos.filter((t) => !previous.todos.some((old) => old.id === t.id))];
    }
    todos = parseBridgeTodos({ todos }, this.maxTodos);
    const complete = todos.length > 0 && todos.every((t) => t.status === "completed");
    if (this.outstandingForOwner(owner) && (complete || input.lifecycle === "completed")) {
      throw new Error("WAITING_FOR_USER_ANSWERS: 必须收到全部用户回答的 MCP 结果才能标记任务完成。");
    }
    if (input.lifecycle === "completed" && !complete) throw new Error("Completion requires a non-empty, fully completed snapshot.");
    if (previous && isTerminal(previous.state) && !reopening) {
      const unchanged = todos.length === previous.todos.length && todos.every((todo, index) => todo.id === previous.todos[index].id && todo.title === previous.todos[index].title && todo.status === previous.todos[index].status);
      if (todos.length && unchanged) return this.publicTask(previous);
      if (explicit || input.mode === "patch" || input.expected_revision !== void 0) throw new Error("\u5DF2\u7ED3\u675F\u4EFB\u52A1\u5361\u4E0D\u80FD\u7EED\u5199\u6216\u91CD\u65B0\u6253\u5F00\uFF1B\u8BF7\u7528 new_task=true \u65B0\u5EFA\u4EFB\u52A1\u5361\uFF0C\u539F\u4EFB\u52A1\u4FDD\u6301\u539F\u6837\u3002");
      if (todos.length) previous = void 0;
    } else if (previous && !explicit && input.expected_revision === void 0 && (previous.state === "blocked" || previous.state === "interrupted") && todos.some((todo) => !previous.todos.some((old) => old.id === todo.id))) {
      // Implicit writes with new step IDs start a fresh card; explicit resume/handoff may grow the plan (4/7 -> 5/9).
      if (false && explicit || input.mode === "patch" || input.expected_revision !== void 0) throw new Error("\u5DF2\u963B\u585E\u6216\u4E2D\u65AD\u7684\u4EFB\u52A1\u5361\u4E0D\u80FD\u8FFD\u52A0\u65B0\u6B65\u9AA4\uFF1B\u8BF7\u7528 new_task=true \u65B0\u5EFA\u4EFB\u52A1\u5361\u3002\u539F\u6B65\u9AA4\u4ECD\u53EF\u7EE7\u7EED\u66F4\u65B0\u3002");
      previous = void 0;
    }
    if (!todos.length && !explicit && !input.new_task) {
      if (previous && !isTerminal(previous.state)) {
        const at2 = this.now();
        const revision2 = previous.revision + 1;
        const removed2 = copyTodos(previous.todos);
        previous.revision = revision2;
        previous.updatedAt = at2;
        previous.state = "cleared";
        previous.todos = [];
        previous.progress = null;
        previous.history = [...previous.history, { revision: revision2, at: at2, state: "cleared", completed: 0, total: 0, removed: removed2 }].slice(-this.maxHistory);
        if (this.currentByOwner.get(owner) === previous.id) this.currentByOwner.delete(owner);
        if (this.selectedId === previous.id) this.selectedId = void 0;
        this.persist();
      }
      return void 0;
    }
    if (!previous && !todos.length && !input.new_task) return void 0;
    // A reopened handoff stays running until the successor itself reports completion.
    const state = reopening ? (complete && input.lifecycle === "completed" ? "completed" : input.lifecycle && input.lifecycle !== "completed" ? input.lifecycle : "running")
      : complete ? "completed" : !todos.length ? input.new_task ? "waiting_plan" : "cleared" : input.lifecycle ?? "running";
    const at = this.now();
    const removed = previous?.todos.filter((t) => !todos.some((next) => next.id === t.id)) ?? [];
    const revision = (previous?.revision ?? 0) + 1;
    const label = input.source_label === void 0 ? previous?.source?.label : input.source_label.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    // Every Bridge dialogue gets a fixed identity: the id it sent, else the one its card or owner already has,
    // else a freshly minted UUID v4 that the acknowledgement returns for reuse after reconnects.
    const sessionId = input.overview_session_id ?? previous?.overviewSessionId ?? this.dialogueIdFor(owner) ?? (owner.startsWith("native-chat:") ? void 0 : (0, import_node_crypto20.randomUUID)());
    const overviewAliases = [...previous?.overviewAliases ?? [], ...adoptedAlias ? [adoptedAlias] : []].filter((id, i, a) => id !== sessionId && a.indexOf(id) === i).slice(-16);
    const sessionKey = sessionId ? `${owner}\0${sessionId}` : void 0;
    const model = input.overview_model?.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    const provider = input.overview_provider?.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    const overview = (sessionKey ? this.overviewBySession.get(sessionKey) : void 0) ?? previous?.overview ?? (model ? { label: model, kind: "model", verified: false } : provider ? { label: provider, kind: "provider", verified: false } : void 0);
    const taskId = previous?.id ?? (0, import_node_crypto20.randomUUID)();
    const memory = previous?.memory ?? this.memoryFor(owner, taskId);
    // Long-term project memory: every handoff and every finish leaves one line in the memory root's WORKLOG.md,
    // so the next dialogue (any task, any actor) still sees it after the per-task folder is no longer in view.
    if (memory?.memoryRoot && (handingOff || (state !== previous?.state && isTerminal(state)))) {
      try {
        if (fs.existsSync(memory.memoryRoot)) {
          const doneCount = todos.filter((t) => t.status === "completed").length;
          const stamp = new Date(at).toISOString().slice(0, 16).replace("T", " ");
          const what = handingOff ? (reopening ? "\u63A5\u73ED\uFF08\u91CD\u65B0\u6253\u5F00\u5DF2\u7ED3\u675F\u7684\u4EFB\u52A1\uFF09" : "\u63A5\u73ED") : "\u4EFB\u52A1\u7ED3\u675F(" + state + ")";
          const line = `- [${stamp}] (@bridge-task) ${what}\uFF1A${summarizeTaskTitle(input.task_title, previous?.title, todos)} | task_id=${taskId} | \u6B65\u9AA4 ${doneCount}/${todos.length}: ${todos.map((t) => (t.status === "completed" ? "\u2713" : t.status === "in_progress" ? "\u25B6" : "\u25CB") + t.title).join("\uFF1B").slice(0, 600)} | memory_dir=${memory.memoryDir}\n`;
          fs.appendFileSync(path.join(memory.memoryRoot, "WORKLOG.md"), line, "utf8");
        }
      } catch {}
    }
    const task = {
      id: taskId,
      creationSequence: previous?.creationSequence ?? ++this.lastCreationSequence,
      memory,
      executionUnverified: false,
      retiredOwners: [...previous?.retiredOwners ?? [], ...handingOff ? [previous.owner] : []].filter((o, i, a) => o !== owner && a.indexOf(o) === i).slice(-16),
      handoffs: [...previous?.handoffs ?? [], ...handingOff ? [{ at, fromActor: crypto.createHash("sha256").update(previous.owner).digest("hex").slice(0, 16), fromRevision: previous.revision, fromState: this.publicTask(previous).state }] : []].slice(-16),
      // A card hidden because a newer task superseded it reappears when it is written again by task_id;
      // a card the local user deleted from the display stays hidden.
      displayDeleted: previous?.displayDeleted === true && previous?.displayDeletedReason !== "superseded",
      displayDeletedAt: previous?.displayDeletedReason === "superseded" ? void 0 : previous?.displayDeletedAt,
      owner,
      revision,
      updatedAt: at,
      createdAt: previous ? previous.createdAt : at,
      overviewSessionId: sessionId,
      ...overviewAliases.length ? { overviewAliases } : {},
      ...overview ? { overview } : {},
      ...label ? { source: { label, verified: false } } : {},
      title: summarizeTaskTitle(input.task_title, previous?.title, todos),
      ...(this.liveDialogues?.get(owner)?.label ?? previous?.clientLabel) ? { clientLabel: this.liveDialogues?.get(owner)?.label ?? previous?.clientLabel } : {},
      questions: handingOff ? (previous.questions ?? []).map((q) => q.status === "pending" ? { ...q, status: "cancelled" } : q.requiresMcpAck === true && !q.deliveredAt ? { ...q, deliveredAt: at } : q) : previous?.questions ?? [],
      state,
      todos: copyTodos(todos),
      history: [...previous?.history ?? [], { revision, at, state, completed: todos.filter((t) => t.status === "completed").length, total: todos.length, removed: copyTodos(removed), ...handingOff ? { handoff: true } : {} }].slice(-this.maxHistory)
    };
    const isStartingTask = !previous || (previous.state === "waiting_plan" && !previous.todos.length && todos.length > 0);
    if (isStartingTask) {
      // A dialogue shows one card: its newest task hides the display of every earlier card of the same
      // identity lineage (own owner + identities taken over by handoff), whatever their state. Memory and
      // files are kept; an explicit task_id write by the owner shows a superseded card again.
      // Cards still waiting on a user answer stay visible. Parallel dialogues sharing one source link
      // have different owners and keep their own cards.
      const lineage = this.identityLineage(owner);
      for (const t of this.tasks.values()) {
        const sameDialogue = lineage.has(t.owner) || !!sessionId && (t.overviewSessionId === sessionId || (t.overviewAliases ?? []).includes(sessionId));
        if (t.id === taskId || t.displayDeleted || !sameDialogue || isAwaitingUser(t)) continue;
        // task-system-truth: an unfinished card is not hidden when its dialogue starts a new task; it stays visible
        // as interrupted ("superseded") so unfinished work never silently disappears from the panel.
        if (!isTerminal(t.state)) { if (!t.supersededAt) { t.supersededAt = at; t.supersededBy = taskId; } continue; }
        t.displayDeleted = true;
        t.displayDeletedAt = at;
        t.displayDeletedReason = "superseded";
        if (this.currentByOwner.get(t.owner) === t.id && t.owner !== owner) this.currentByOwner.delete(t.owner);
      }
    }
    if (previous && previous.owner !== owner && this.currentByOwner.get(previous.owner) === task.id) this.currentByOwner.delete(previous.owner);
    this.tasks.delete(task.id);
    this.tasks.set(task.id, task);
    if (memory) this.onTaskMemory?.(owner, memory);
    this.currentByOwner.set(owner, task.id);
    this.ownerDisconnectedAt.delete(owner);
    if (overview && sessionKey && !this.overviewBySession.has(sessionKey)) {
      if (this.overviewBySession.size >= 64) this.overviewBySession.delete(this.overviewBySession.keys().next().value);
      this.overviewBySession.set(sessionKey, overview);
    }
    this.selectedId = task.id;
    this.persist();
    return this.publicTask(task);
  }
  /** Transient progress may link by capability, but cannot claim completion or steal selection. */
  forProgress(owner, value) {
    const task = this.resolve(owner, value);
    return task ? this.publicTask(task) : void 0;
  }
  touch(id) {
    const task = this.tasks.get(id);
    if (task && isActive(task.state)) task.updatedAt = this.now();
  }
  /** Store only one fresh, owner-checked, in-progress step report per task. */
  recordProgress(owner, taskId, todoId, value) {
    const task = this.tasks.get(taskId);
    if (!task || task.owner !== owner || task.state !== "running") return;
    if (todoId && !task.todos.some((todo) => todo.id === todoId && todo.status === "in_progress")) return;
    task.progress = {
      ...todoId ? { todoId } : {},
      taskRevision: task.revision,
      at: this.now(),
      ...value.percent !== void 0 ? { percent: value.percent } : {},
      ...value.phase !== void 0 ? { phase: value.phase } : {},
      ...value.message !== void 0 ? { message: value.message } : {}
    };
    this.persist();
  }
  clearProgress() {
    let cleared = 0;
    for (const task of this.tasks.values()) if (task.progress) {
      task.progress = null;
      cleared++;
    }
    return cleared;
  }
  /** Remove a task only after the local UI has explicitly confirmed permanent cleanup. */
  forget(id) {
    this.tasks.delete(id);
    for (const [owner, taskId] of this.currentByOwner) if (taskId === id) this.currentByOwner.delete(owner);
    if (this.selectedId === id) this.selectedId = void 0;
  }
  disconnect(owner) {
    if (!owner) return false;
    this.currentByOwner.delete(owner);
    this.activeCallsByOwner.delete(owner);
    let changed = false;
    const at = this.now();
    for (const task of this.tasks.values()) {
      if (task.owner !== owner || isTerminal(task.state)) continue;
      for (const question of task.questions ?? []) {
        if (question.status === "pending") question.status = "cancelled";
        if (question.requiresMcpAck === true && !question.deliveredAt) question.deliveredAt = at;
      }
      // task-system-truth: a dropped MCP session is neither a finished nor an interrupted job. Stateless clients
      // (mcpcall/curl) end their session after EVERY call, so marking the card interrupted here made every such card
      // show "已中断" while the AI was still working. Only remember the disconnect time; the card turns "stalled"
      // when no card write and no attributable activity arrives for BRIDGE_TASK_STALE_MS.
      if (!this.ownerDisconnectedAt.has(owner)) { this.ownerDisconnectedAt.set(owner, at); changed = true; }
      while (this.ownerDisconnectedAt.size > 1024) this.ownerDisconnectedAt.delete(this.ownerDisconnectedAt.keys().next().value);
      if (task.progress) { task.progress = null; changed = true; }
    }
    if (changed && !this.selectedId) {
      this.selectedId = [...this.tasks.values()].filter((t) => isActive(t.state) || t.state === "completed").at(-1)?.id;
    }
    if (changed) this.persist();
    return changed;
  }
  buildQuestion(input, batchId) {
    const text = typeof input.question === "string" ? input.question.trim() : "";
    if (!text || text.length > 1000) throw new Error("问题正文需要 1-1000 个字符。");
    const options = input.options;
    if (!Array.isArray(options) || options.length < 2 || options.length > 8 ||
        options.some((option) => !option || typeof option.id !== "string" || !/^[a-z0-9_-]{1,40}$/i.test(option.id) ||
          typeof option.label !== "string" || !option.label.trim() || option.label.length > 180 ||
          (option.description !== void 0 && (typeof option.description !== "string" || option.description.length > 400))) ||
        new Set(options.map((option) => option.id)).size !== options.length) throw new Error("需要 2-8 个不同的有效选项。");
    const recommendation = input.recommendation;
    if (recommendation !== void 0 && (typeof recommendation !== "string" || recommendation.length > 600)) throw new Error("推荐说明最多 600 字符。");
    if (input.recommended_option_id !== void 0 && !options.some((option) => option.id === input.recommended_option_id)) {
      throw new Error("推荐选项必须是当前问题的已有选项。");
    }
    if (input.allow_custom !== void 0 && typeof input.allow_custom !== "boolean") throw new Error("allow_custom 必须是布尔值。");
    return { id: crypto.randomUUID(), text,
      options: options.map((option) => ({ id: option.id, label: option.label.trim(), description: option.description ?? "" })),
      ...batchId ? { batchId } : {},
      ...recommendation ? { recommendation } : {},
      ...input.recommended_option_id ? { recommendedOptionId: input.recommended_option_id } : {},
      allowCustom: input.allow_custom !== false, status: "pending", requiresMcpAck: true, createdAt: this.now() };
  }
  askQuestion(owner, input) {
    const task = this.resolve(owner, input);
    if (!task || isTerminal(task.state)) throw new Error("请先创建正在进行的任务卡，再在任务中提问。");
    if (this.outstandingForOwner(owner)?.undelivered) throw new Error("请先通过 MCP 接收此前全部回答，再提出新问题。");
    const question = this.buildQuestion(input);
    const previous = task.questions?.at(-1);
    if (previous?.status === "pending") {
      if (previous.text === question.text && !previous.batchId) return { task, question: previous };
      throw new Error("前一个问题尚未得到用户回答；必须先处理，不能覆盖。");
    }
    task.questions = [...task.questions ?? [], question];
    task.updatedAt = this.now();
    this.persist();
    return { task, question };
  }
  askQuestions(owner, input) {
    const task = this.resolve(owner, input);
    if (!task || isTerminal(task.state)) throw new Error("请先创建正在进行的任务卡，再在任务中提问。");
    if (this.outstandingForOwner(owner)?.undelivered) throw new Error("请先通过 MCP 接收此前全部回答，再发起新批次。");
    if (!Array.isArray(input.questions) || input.questions.length < 2 || input.questions.length > 8) throw new Error("一次可提交 2-8 道问题。");
    if (task.questions?.some((question) => question.status === "pending")) throw new Error("当前任务仍有未回答的疑问，请先完成或通过 check 查询之前的批次。");
    const batchId = crypto.randomUUID();
    // Validate the entire batch before changing task state or writing to disk.
    const questions = input.questions.map((question) => this.buildQuestion(question, batchId));
    task.questions = [...task.questions ?? [], ...questions];
    task.updatedAt = this.now();
    this.persist();
    return { task, batchId, questions };
  }
  batchStatus(taskId, batchId) {
    const task = this.tasks.get(taskId);
    const questions = task?.questions?.filter((question) => question.batchId === batchId) ?? [];
    if (!questions.length) throw new Error("找不到对应的提问批次，请核对 batch_id。");
    return { status: questions.every((question) => question.status === "answered") ? "answered" : "pending",
      batch_id: batchId, total: questions.length,
      answered: questions.filter((question) => question.status === "answered").length,
      questions: questions.map((question) => ({ question_id: question.id, question: question.text, status: question.status,
        ...question.answer ? { answer: { ...question.answer } } : {} })) };
  }
  answerQuestion(taskId, questionId, optionId, customText) {
    const task = this.tasks.get(taskId);
    const question = task?.questions?.find((item) => item.id === questionId);
    if (!question || question.status !== "pending") throw new Error("该提问已结束或不属于当前任务，请刷新任务板块。");
    const selection = question.options.find((option) => option.id === optionId);
    const custom = typeof customText === "string" ? customText.trim() : "";
    if (!selection && !(question.allowCustom && custom)) throw new Error("请选择一个选项或填写自定义回答。");
    if (custom.length > 2000) throw new Error("自定义回答不能超过 2000 个字符。");
    question.status = "answered";
    question.answer = { optionId: selection?.id ?? null, label: selection?.label ?? "自定义回答", text: custom || selection?.label, at: this.now() };
    task.updatedAt = this.now();
    this.persist();
    const key = taskId + ":" + questionId;
    for (const resolve of this.questionWaiters.get(key) ?? []) resolve(question.answer);
    this.questionWaiters.delete(key);
    if (question.batchId) {
      const batch = this.batchStatus(taskId, question.batchId);
      if (batch.status === "answered") {
        const batchKey = taskId + ":batch:" + question.batchId;
        for (const resolve of this.batchWaiters.get(batchKey) ?? []) resolve(batch);
        this.batchWaiters.delete(batchKey);
      }
    }
    return question.answer;
  }
  /** Hold the original MCP request open; check every three seconds and wake
   * immediately on the answer event. An explicit timeout remains optional for
   * older clients. Caller cancellation always releases timers and listeners. */
  waitForAnswerStatus(key, waiters, read, options = {}) {
    const current = read();
    if (current.status === "answered") return Promise.resolve(current);
    const { signal, timeoutMs } = options;
    if (signal?.aborted) return Promise.reject(Object.assign(new Error("Bridge 提问等待已由 MCP 客户端取消；答案仍保留，可重新查询。"), { name: "AbortError" }));
    return new Promise((resolve, reject) => {
      const listeners = waiters.get(key) ?? new Set();
      let interval;
      let timer;
      let settled = false;
      const cleanup = () => {
        clearInterval(interval);
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        listeners.delete(check);
        if (!listeners.size && waiters.get(key) === listeners) waiters.delete(key);
      };
      const settle = (error, result) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) reject(error);
        else resolve(result);
      };
      const check = () => {
        try {
          const result = read();
          if (result.status === "answered") settle(null, result);
        } catch (error) { settle(error); }
      };
      const onAbort = () => settle(Object.assign(new Error("MCP 客户端已取消提问等待；回答仍保留。"), { name: "AbortError" }));
      listeners.add(check);
      waiters.set(key, listeners);
      interval = setInterval(check, BRIDGE_QUESTION_POLL_MS);
      interval.unref?.();
      if (Number.isFinite(timeoutMs)) {
        timer = setTimeout(() => {
          try { settle(null, read()); } catch (error) { settle(error); }
        }, Math.max(1e3, timeoutMs));
      }
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
      else check(); // Closes the race between the first read and subscribing.
    });
  }
  waitForBatch(taskId, batchId, options = {}) {
    return this.waitForAnswerStatus(taskId + ":batch:" + batchId, this.batchWaiters,
      () => this.batchStatus(taskId, batchId), options);
  }
  waitForQuestion(taskId, questionId, options = {}) {
    const read = () => {
      const question = this.tasks.get(taskId)?.questions?.find((item) => item.id === questionId);
      if (!question) throw new Error("问题不存在或已失效。");
      return question.status === "answered" ? { status: "answered", answer: question.answer }
        : { status: "pending", question_id: questionId };
    };
    return this.waitForAnswerStatus(taskId + ":" + questionId, this.questionWaiters, read, options);
  }
  publicTask(task) {
    let assistantSource=null;try{assistantSource=this.sourceIdentityReader?.(task.owner)||null;}catch{}
    // task-system-truth: one derivation from the durable card plus real activity evidence.
    const lastActivityAt = this.lastActivityAt(task);
    const busy = isActive(task.state) && (this.isOwnerBusy(task.owner) || this.attributedBusy(task.id));
    const effectiveUpdatedAt = busy ? this.now() : lastActivityAt;
    const interruptReason = !isActive(task.state) ? (task.state === "interrupted" ? task.interruptReason ?? "unknown" : void 0)
      : task.executionUnverified ? task.interruptReason ?? "opencode_restart" : task.supersededAt ? "superseded" : void 0;
    const state = isAwaitingUser(task) ? "awaiting_user"
      : interruptReason && isActive(task.state) ? "interrupted"
      : isActive(task.state) && this.now() - effectiveUpdatedAt >= BRIDGE_TASK_STALE_MS ? "awaiting_sync" : task.state;
    const disconnectedAt = isActive(task.state) && !busy ? this.ownerDisconnectedAt.get(task.owner) : void 0;
    const progress = state === "running" && task.progress && task.progress.taskRevision === task.revision && this.now() - task.progress.at < 5 * 6e4 && (!task.progress.todoId || task.todos.some((todo) => todo.id === task.progress?.todoId && todo.status === "in_progress")) ? { ...task.progress } : null;
    return {
      id: task.id,
      title: summarizeTaskTitle(void 0, task.title, task.todos),
      memory: task.memory ? { ...task.memory } : null,
      executionUnverified: task.executionUnverified === true,
      handoffs: (task.handoffs ?? []).map((h) => ({ ...h })),
      ...task.forkedFrom ? { forkedFrom: { ...task.forkedFrom } } : {},
      toolEvents: (task.toolEvents || []).map(e => ({ ...e })),
      questions: (task.questions ?? []).map((question) => ({ ...question, options: question.options.map((option) => ({ ...option })) })),
      revision: task.revision,
      updatedAt: task.updatedAt,
      lastActivityAt,
      ...this.activityByTask.get(task.id)?.tool ? { lastActivityTool: this.activityByTask.get(task.id).tool } : {},
      ...state === "awaiting_sync" ? { stalledForMs: Math.max(0, this.now() - effectiveUpdatedAt), stalled: true } : {},
      ...interruptReason ? { interruptReason } : {},
      ...task.supersededBy ? { supersededBy: task.supersededBy } : {},
      ...disconnectedAt ? { disconnectedAt } : {},
      originKind: task.owner.startsWith("native-chat:") ? "chat" : "bridge",
      ...this.chatRequestIdsFor(task) ? { chatRequestIds: this.chatRequestIdsFor(task) } : {},
      ...task.overview ? { overview: { ...task.overview } } : {},
      ...task.overviewSessionId ? { overviewSessionTag: task.overviewSessionId.slice(0, 8).toUpperCase() } : {},
      ...task.createdAt !== void 0 ? { createdAt: task.createdAt } : {},
      ...assistantSource?{assistantSource,source:{...(task.source||{}),label:assistantSource.displayName,assistantBound:true,verified:false}}:task.source?{source:{...task.source,verified:false}}:{},
      attribution: { ownerBound: true, clientVerified: false, sessionVerified: false },
      progress,
      state,
      todos: copyTodos(task.todos),
      history: task.history.map((h) => ({ ...h, removed: copyTodos(h.removed) }))
    };
  }
  snapshot() {
    this.pruneTerminal();
    // task-system-truth: external MCP activity without any card is listed too (display-only live:* rows), so work done
    // without set_todos never leaves the panel empty. liveDialogueEntries() was defined but never wired in before.
    let live = [];
    try { live = this.liveDialogueEntries(); } catch { live = []; }
    return { taskId: this.selectedId, tasks: [...live, ...[...this.tasks.values()].filter(t => !t.displayDeleted).reverse().map((t) => this.publicTask(t))] };
  }
  /**
   * OpenCode「任务」：正在调用工具、却还没用 set_todos 建卡（或只剩已完成旧卡）的外部 MCP 对话，
   * 也要在任务列表里显示为「进行中」。这是只读的展示条目（id 以 live: 开头），不落盘、不占修订号；
   * 该对话一旦建卡就自动让位给真正的任务卡。
   */
  liveDialogues = /* @__PURE__ */ new Map();
  liveDismissed = /* @__PURE__ */ new Map();
  liveClusterOwners = /* @__PURE__ */ new Map();
  noteLiveDialogue(owner, info) {
    if (!owner || info?.kind !== "remote" || String(owner).startsWith("native-chat:")) return false;
    const at = this.now();
    const prev = this.liveDialogues.get(owner);
    const entry = prev || { owner, label: "外部 MCP 客户端", firstAt: at, calls: 0 };
    entry.lastAt = at;
    entry.calls += 1;
    entry.lastTool = String(info.tool || "").slice(0, 60);
    if (info.label) entry.label = String(info.label).slice(0, 60);
    this.liveDialogues.delete(owner);
    this.liveDialogues.set(owner, entry);
    while (this.liveDialogues.size > 1024) this.liveDialogues.delete(this.liveDialogues.keys().next().value);
    return true;
  }
  /**
   * OpenCode「任务」：外部 MCP 对话还没有任务卡就开始调用工具时，在工具结果末尾提示它先 set_todos(new_task=true)。
   * 无状态客户端（Bash/curl）几乎每次调用都换会话，无法确认属于哪张卡：只要还有近 10 分钟内活动的外部未完成卡，
   * 同一客户端的提示就按 3 分钟节流，避免已建卡的对话被反复打扰。
   */
  taskCardHints = /* @__PURE__ */ new Map();
  taskCardHint(owner, info) {
    if (!owner || info?.kind !== "remote" || String(owner).startsWith("native-chat:")) return void 0;
    const tool = String(info.tool || "").toLowerCase();
    if (/(^|[._:/])(set_todos|update_plan|report_progress|start|bridge_[a-z_]+)$/.test(tool)) return void 0;
    const args = info.args && typeof info.args === "object" ? info.args : {};
    if (typeof args.task_id === "string" || typeof args.overview_session_id === "string") return void 0;
    if (info.ref && (typeof info.ref.task_id === "string" || typeof info.ref.overview_session_id === "string")) return void 0;
    if (Array.isArray(args.calls) && args.calls.some((c) => c && /set_todos|update_plan/.test(String(c.tool || "")))) return void 0;
    if (this.ownerHasOpenCard(owner)) return void 0;
    const at = this.now();
    const label = String(info.label || "外部 MCP 客户端");
    const stateless = STATELESS_BRIDGE_OWNER.test(String(owner));
    // hint-dedupe: many MCP clients open a fresh connection (= fresh owner) per call, so an owner-keyed
    // throttle never fires and the hint lands on nearly every tool result. Key by client label for every
    // owner, stay silent while that client (or any recent external dialogue) has an open card, and
    // otherwise repeat at most every OPENCODE_TASK_HINT_INTERVAL_MS (default 10 min; 0 = never repeat).
    // task-card-multi-conv: several open cards of the same client and no card reference on this stateless call -> the call cannot
    // be credited to any card. Tell the caller to attach task_id (throttled like the hint below).
    if (stateless) {
      const openSameClient = [...this.tasks.values()].filter((t) => !t.displayDeleted && !isTerminal(t.state) && !String(t.owner).startsWith("native-chat:") && t.clientLabel === label).length;
      if (openSameClient >= 2) {
        const refKey = "ref:" + label;
        const lastRef = this.taskCardHints.get(refKey);
        if (lastRef && at - lastRef < 3 * 6e4) return void 0;
        this.taskCardHints.set(refKey, at);
        return "\u3010OpenCode \u4EFB\u52A1\u5361\u3011\u5F53\u524D\u6709 " + openSameClient + " \u4E2A\u540C\u7C7B\u5BA2\u6237\u7AEF\u7684\u5BF9\u8BDD\u540C\u65F6\u5728\u7EBF\uFF0C\u672C\u6B21\u8C03\u7528\u6CA1\u6709\u5E26 task_id\uFF0C\u65E0\u6CD5\u8BB0\u5230\u4F60\u7684\u4EFB\u52A1\u5361\uFF08\u5361\u7247\u53EF\u80FD\u88AB\u663E\u793A\u4E3A\u5DF2\u505C\u6EDE\uFF09\u3002\u4E4B\u540E\u6BCF\u4E2A\u5DE5\u5177\u8C03\u7528\u90FD\u9644\u52A0\u53C2\u6570 task_id=<\u4F60\u7684 set_todos \u56DE\u6267\u91CC\u7684\u4EFB\u52A1\u7F16\u53F7>\uFF1B\u8FD8\u6CA1\u6709\u4EFB\u52A1\u5361\u5219\u5148 set_todos(new_task=true)\u3002";
      }
    }
    const key = "label:" + label;
    const last = this.taskCardHints.get(key);
    const recentOpen = [...this.tasks.values()].some((t) => !t.displayDeleted && !isTerminal(t.state) && !String(t.owner).startsWith("native-chat:") && (t.clientLabel === label || stateless) && at - (t.updatedAt ?? 0) < 30 * 6e4);
    if (recentOpen) return void 0;
    const intervalEnv = globalThis.process?.env?.OPENCODE_TASK_HINT_INTERVAL_MS;
    const intervalRaw = intervalEnv === void 0 || String(intervalEnv).trim() === "" ? NaN : Number(intervalEnv);
    const interval = Number.isFinite(intervalRaw) && intervalRaw >= 0 ? intervalRaw : 10 * 6e4;
    if (last && (interval === 0 || at - last < interval)) return void 0;
    this.taskCardHints.set(key, at);
    while (this.taskCardHints.size > 256) this.taskCardHints.delete(this.taskCardHints.keys().next().value);
    return "【OpenCode 任务卡】本对话还没有任务卡，用户在「任务」里看不到你的进度。请立即调用 set_todos(new_task=true, todos=[...]) 建立任务卡（标题和步骤用简体中文），记下返回的 overview_session_id 与 task_id，之后每次 set_todos 都带上它们。如本对话已有任务卡（断线重连后），用 set_todos 带上原 task_id/overview_session_id 继续即可，无需新建。";
  }
  ownerHasOpenCard(owner) {
    let lineage;
    try { lineage = this.identityLineage(owner); } catch { lineage = new Set([owner]); }
    for (const t of this.tasks.values()) if (!t.displayDeleted && lineage.has(t.owner) && !isTerminal(t.state)) return true;
    const attributed = this.tasks.get(this.ownerAttribution.get(owner) ?? "");
    if (attributed && !attributed.displayDeleted && !isTerminal(attributed.state)) return true;
    return false;
  }
  coveredByCard(entry) {
    for (const t of this.tasks.values()) {
      if (t.displayDeleted || !t.clientLabel || t.clientLabel !== entry.label || String(t.owner).startsWith("native-chat:")) continue;
      const created = t.createdAt ?? 0;
      const end = isTerminal(t.state) || t.state === "blocked" ? t.updatedAt ?? 0 : this.now();
      if (entry.lastAt >= created - 30 * 6e4 && entry.lastAt <= end + 6e4) return true;
    }
    return false;
  }
  liveDialogueEntries() {
    const at = this.now();
    const windowMs = BRIDGE_LIVE_RETENTION_MS;
    const clusters = [];
    for (const e of [...this.liveDialogues.values()].sort((a, b) => a.firstAt - b.firstAt)) {
      const busy = this.isOwnerBusy(e.owner);
      if (!busy && at - e.lastAt > windowMs) continue;
      if (this.ownerHasOpenCard(e.owner)) continue;
      // task-card-multi-conv: a call that named a (finished) card by task_id belongs to that card's dialogue, not to "untracked" work.
      if (this.ownerAttribution.has(e.owner)) continue;
      // task-system-truth: stateless calls made while a card of the same client was open (or just before it was created)
      // belong to that card's dialogue in all likelihood; do not list them a second time as untracked work.
      // task-card-multi-conv: only one-shot connections (<= 2 calls) can be such stateless calls. A connection that keeps its
      // session and made more calls is its own conversation; another dialogue's card must not hide it.
      if (STATELESS_BRIDGE_OWNER.test(String(e.owner)) && e.calls <= 2 && this.coveredByCard(e)) continue;
      const dismissedAt = this.liveDismissed.get(e.owner);
      if (dismissedAt && e.lastAt <= dismissedAt) continue;
      // 无状态客户端（Bash/curl）几乎每次调用都换一个 MCP 会话：同一客户端的一两次调用的短会话合并成一条。
      const oneShot = e.calls <= 2 && STATELESS_BRIDGE_OWNER.test(e.owner);
      let c = oneShot ? clusters.filter((x) => x.oneShot && x.label === e.label).at(-1) : void 0;
      if (!c) { c = { label: e.label, owners: [], firstAt: e.firstAt, lastAt: 0, calls: 0, oneShot, busy: false, lastTool: "" }; clusters.push(c); }
      c.owners.push(e.owner);
      c.calls += e.calls;
      c.busy = c.busy || busy;
      if (e.lastAt >= c.lastAt) { c.lastAt = e.lastAt; c.lastTool = e.lastTool; }
    }
    this.liveClusterOwners.clear();
    return clusters.sort((a, b) => b.lastAt - a.lastAt).map((c) => {
      const id = "live:" + crypto.createHash("sha256").update(c.owners[0]).digest("hex").slice(0, 16);
      this.liveClusterOwners.set(id, c.owners.slice());
      const active = c.busy || at - c.lastAt < BRIDGE_LIVE_ACTIVE_MS;
      let hhmm = "";
      try { hhmm = new Date(c.lastAt).toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" }); } catch {}
      const step = (c.busy ? "正在调用 " : "最近调用 ") + (c.lastTool || "工具") + (hhmm ? "（" + hhmm + "）" : "") + " · 共 " + c.calls + " 次调用；该对话没有用 set_todos 建任务卡，无法判断是否完成";
      return {
        id,
        title: "未建卡的活动：" + c.label,
        live: true,
        untracked: true,
        lastActivityAt: c.lastAt,
        ...active ? {} : { stalled: true, stalledForMs: at - c.lastAt },
        memory: null,
        executionUnverified: false,
        handoffs: [],
        toolEvents: [],
        questions: [],
        revision: 0,
        updatedAt: c.lastAt,
        createdAt: c.firstAt,
        originKind: "bridge",
        source: { label: c.label, verified: false },
        attribution: { ownerBound: false, clientVerified: false, sessionVerified: false },
        liveDialogue: { calls: c.calls, sessions: c.owners.length, busy: c.busy, lastTool: c.lastTool },
        progress: null,
        state: active ? "running" : "awaiting_sync",
        todos: [{ id: "live-activity", title: step, status: "in_progress" }],
        history: []
      };
    });
  }
  selectedTodos() {
    return copyTodos(this.tasks.get(this.selectedId ?? "")?.todos ?? []);
  }
  /** Local Chat Code only: expose a truthful planning card before the model calls a tool. */
  ensureNativeChat(owner, model, title) {
    const nativeOwner = /^native-chat:(?:automation:)?([0-9a-f-]{36})$/i.exec(owner);
    if (!nativeOwner) throw new Error("Invalid native Chat task owner.");
    const existing = this.tasks.get(this.currentByOwner.get(owner) ?? "");
    if (existing && !isTerminal(existing.state)) {
      this.selectedId = existing.id;
      return this.publicTask(existing);
    }
    const cleanTitle = typeof title === "string" ? title.replace(/[\x00-\x1f\x7f]+/g, " ").replace(/\s+/g, " ").trim().split(/[；;。！？\n]/)[0].trim().slice(0, 48) : "";
    return this.update(owner, [], { new_task: true, overview_model: model, overview_session_id: nativeOwner[1], ...(cleanTitle ? { task_title: cleanTitle } : {}) });
  }
  /**
   * Remember which native Chat requests (VS Code request ids) belong to a native Chat owner, so the task
   * shelf shows that conversation's questions only inside the same conversation. Display data only: it
   * neither bumps a task revision nor changes any tool result. Automation owners have no chat view.
   */
  noteChatRequest(owner, requestId) {
    if (typeof requestId !== "string" || !requestId || requestId.length > 200 || !/^native-chat:[0-9a-f-]{36}$/i.test(owner ?? "")) return false;
    this.ownerChatRequests ??= new Map();
    const known = this.ownerChatRequests.get(owner) ?? [];
    if (!known.includes(requestId)) this.ownerChatRequests.set(owner, [...known, requestId].slice(-64));
    const task = this.tasks.get(this.currentByOwner.get(owner) ?? "");
    if (!task || task.owner !== owner) return true;
    const ids = Array.isArray(task.chatRequestIds) ? task.chatRequestIds : [];
    if (!ids.includes(requestId)) {
      task.chatRequestIds = [...ids, requestId].slice(-64);
      this.persist();
    }
    return true;
  }
  chatRequestIdsFor(task) {
    if (!task.owner.startsWith("native-chat:")) return void 0;
    const ids = [...Array.isArray(task.chatRequestIds) ? task.chatRequestIds : [], ...this.ownerChatRequests?.get(task.owner) ?? []];
    return ids.length ? [...new Set(ids)].slice(-128) : void 0;
  }
  /** Only settle the untouched placeholder; never overwrite an agent-authored plan. */
  finishNativeChat(owner, taskId, revision, succeeded) {
    const task = this.tasks.get(taskId);
    if (!task || task.owner !== owner || task.revision !== revision || task.state !== "waiting_plan" || task.todos.length) return false;
    this.update(
      owner,
      [{ id: "chat-response", title: "\u5904\u7406\u5F53\u524D Chat \u8BF7\u6C42", status: succeeded ? "completed" : "in_progress" }],
      { task_id: taskId, expected_revision: revision, lifecycle: succeeded ? "completed" : "blocked" }
    );
    return true;
  }
};
export { splitCardRef, cardAckPrefix, TASK_TARGET_REQUIRED_MESSAGE, import_node_crypto20, BRIDGE_TASK_STALE_MS, BRIDGE_TASK_AWAITING_SYNC_MS, BRIDGE_TASK_CLEANUP_BATCH_LIMIT, copyTodos, record2, isTerminal, isActive, BridgeTaskStore };
