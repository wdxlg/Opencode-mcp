import { EXECUTION_SCOPED_TOOLS } from './collaboration-contracts.mjs';
import { FairSemaphore, systemPressure } from './concurrency-runtime.mjs';
import { WorkspaceActivityLedger, editedPathsFromResult, gitUncommittedFiles, looksLikePackagingCommand, patchTargetPaths, readTargetPaths } from './workspace-activity.mjs';
import { SHADOW_CHECKPOINT_TOOL, ShadowCheckpointStore, isCheckpointedTool } from './shadow-checkpoints.mjs';
import { AiEditReview, isReviewedWriteTool, reviewTargetPaths } from './ai-review.mjs';
import { CODEBASE_SEARCH_TOOL, CodebaseIndex, formatCodebaseSearch } from './codebase-index.mjs';
import { activateInlineAi } from './inline-ai.mjs';
import { activateAiCodeReview } from './ai-code-review.mjs';
import { registerUsageCommand } from './usage-ledger.mjs';
import { activateCrashReporting } from './crash-report.mjs';
import { activateAutoUpdate } from './auto-update.mjs';
import { activateCloudAgent } from './cloud-agent.mjs';
import osAiReview from 'node:os';
import cryptoAiReview from 'node:crypto';
import pathAiReview from 'node:path';
import { SPEC_MODE_TOOL, SPEC_STAGES, SPEC_STAGE_LABELS, SpecModeStore, isSpecGatedTool } from './spec-mode.mjs';
import { toolTimeoutMs, runWithToolTimeout, spillLargeResult, RepeatCallGuard, SESSION_SEARCH_TOOL, searchSessions } from './tool-guards.mjs';
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-tool-dispatcher.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { BRIDGE_BATCH_TOOL, BRIDGE_TOOL_DEFINITIONS, CONFIGURE_MCP_TOOL, DEFAULT_BRIDGE_TOOL_CONCURRENCY, MAX_ACTIVITY, MAX_BRIDGE_TOOL_CONCURRENCY, MAX_TODOS, REPORT_PROGRESS_TOOL, SET_TODOS_TOOL, UPDATE_PLAN_TOOL } from "./module-0140.mjs";
// codebase-index-step01: 代码库检索工具加入 Bridge 工具表（module-0140 不动，运行时追加）。
if (!BRIDGE_TOOL_DEFINITIONS.some((tool) => tool.name === CODEBASE_SEARCH_TOOL.name)) BRIDGE_TOOL_DEFINITIONS.push(CODEBASE_SEARCH_TOOL);
// canvas-console: 画布控制台的 AI 群聊工具（chat_join/chat_send/chat_read/chat_wait），运行时追加到 Bridge 工具表。
import { canvasConsole, CANVAS_CHAT_TOOL_DEFINITIONS, CANVAS_CHAT_TOOL_NAMES } from './canvas-console.mjs';
for (const def of CANVAS_CHAT_TOOL_DEFINITIONS) if (!BRIDGE_TOOL_DEFINITIONS.some((tool) => tool.name === def.name)) BRIDGE_TOOL_DEFINITIONS.push(def);
import { Semaphore } from "./module-0149.mjs";
import { AdaptiveConcurrencyController } from "./module-0150.mjs";
import { BridgeActivityTracker } from "./module-0147.mjs";
import { BridgeTaskStore, splitCardRef, cardAckPrefix } from "./module-0144.mjs";
import { NATIVE_MANAGED_COMMAND_OWNER_ID } from "./module-0138.mjs";
import { resolveBridgeToolName } from "./module-0148.mjs";
import { findCustomTool } from "./module-0053.mjs";
import { invokeFileTool, isFileToolName } from "./module-0030.mjs";
import { isFileToolCompatibilityAlias, normalizeFileToolInput, normalizeFileToolName } from "./module-0035.mjs";
import { BRIDGE_EXCLUDED_TOOL_NAMES, getIdeToolDefinition } from "./module-0042.mjs";
import { validateToolInput } from "./module-0041.mjs";
import { asRecord3, bridgePresentation } from "./module-0153.mjs";
import { LIST_SKILLS_TOOL, formatSkillListing } from "./module-0142.mjs";
import { runConfigureMcp } from "./module-0151.mjs";
import { executeCustomTool } from "./module-0056.mjs";
import { ideToolStructuredContent } from "./module-0146.mjs";
import { parseBridgePlan, parseBridgeProgress, parseBridgeTodos } from "./module-0145.mjs";
import { AsyncLocalStorage as OcActorStorage } from "node:async_hooks";
// Bridge 侧栏「发起方」：每次工具调用记录是谁发起的（本机 OpenCode 智能体 / 外部 MCP 客户端）。
const OC_ACTOR_STORE = new OcActorStorage();
const OC_CLIENT_NAMES = [[/^openai|chatgpt/i, "ChatGPT"], [/claude/i, "Claude"], [/cursor/i, "Cursor"], [/^hark/i, "Hark"], [/codex/i, "Codex"], [/gemini/i, "Gemini"], [/copilot|vscode/i, "VS Code Copilot"], [/windsurf|codeium/i, "Windsurf"], [/cline/i, "Cline"], [/inspector/i, "MCP Inspector"]];
// native-subagent: Bridge calls from an OpenCode native subagent carry extra.ocSession = { sessionId, parentID }.
// Calls whose extra is rebuilt further down (handleExecutionToolCall, batch sub-calls) inherit it from OC_ACTOR_STORE.
function ocNativeSessionOf(extra) {
  const ok = (v) => typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : "";
  const s = extra?.ocSession;
  if (s && ok(s.sessionId)) return { sessionId: ok(s.sessionId), parentID: ok(s.parentID) || null };
  const stored = OC_ACTOR_STORE.getStore();
  return stored?.kind === "local" && ok(stored.sessionId) ? { sessionId: stored.sessionId, parentID: stored.parentID || null } : null;
}
function ocActorFromExtra(extra) {
  const owner = String(extra?.commandOwnerId ?? NATIVE_MANAGED_COMMAND_OWNER_ID);
  if (owner === NATIVE_MANAGED_COMMAND_OWNER_ID || owner.startsWith(NATIVE_MANAGED_COMMAND_OWNER_ID + ":")) {
    const session = ocNativeSessionOf(extra);
    return { kind: "local", id: "local", label: "OpenCode 智能体", ...(session ? { sessionId: session.sessionId, parentID: session.parentID } : {}) };
  }
  const client = typeof extra?.clientName === "string" ? extra.clientName.trim().slice(0, 60) : "";
  const known = client ? OC_CLIENT_NAMES.find(([re]) => re.test(client)) : void 0;
  const label = known ? known[1] : client || "外部 MCP 客户端";
  return { kind: "remote", id: "remote:" + label.toLowerCase(), label, client: client || void 0 };
}


// extensions/opencode/src/bridge-tool-dispatcher.ts
init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/bridge-tool-dispatcher.ts
var CONCURRENCY_EXEMPT_TOOLS = /* @__PURE__ */ new Set([
  "bridge_batch",
  "bridge_wait_messages",
  "bridge_wait_team",
  "chat_wait",
  "run_command",
  "cancel_command",
  "get_command_output",
  "send_command_input"
]);

function configureMcpActivityArgs(args) {
  const safe = {};
  if (typeof args.action === "string") safe.action = args.action;
  if (typeof args.target === "string") safe.target = args.target;
  if (typeof args.id === "string") safe.id = args.id;
  return safe;
}


// recovered.33: accept common field aliases for task-card / collaboration tools and report them back.
var TODO_STATUS_ALIASES = { done: "completed", complete: "completed", finished: "completed", success: "completed", "in-progress": "in_progress", inprogress: "in_progress", active: "in_progress", doing: "in_progress", running: "in_progress", started: "in_progress", todo: "pending", "not_started": "pending", "not-started": "pending", open: "pending", queued: "pending", waiting: "pending" };
function normalizeTodoStatus(value, where, notes) {
  if (typeof value !== "string") return value;
  const key = value.trim().toLowerCase();
  if (["pending", "in_progress", "completed"].includes(key)) { if (key !== value) notes.push(`${where}.status "${value}" → "${key}"`); return key; }
  const mapped = TODO_STATUS_ALIASES[key];
  if (mapped) { notes.push(`${where}.status "${value}" → "${mapped}"`); return mapped; }
  return value;
}
function normalizeBridgeAliases(rawToolName, input) {
  const tool = String(rawToolName || "").split("__").pop();
  const notes = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return { args: input, notes };
  if (tool !== "set_todos" && tool !== "update_plan" && tool !== "bridge_update_task" && tool !== "bridge_claim_task" && tool !== "bridge_checkpoint_task" && tool !== "bridge_resume_task") return { args: input, notes };
  const args = { ...input };
  const move = (from, to) => { if (args[from] !== void 0 && args[to] === void 0) { args[to] = args[from]; delete args[from]; notes.push(`${from} → ${to}`); } };
  if (tool === "bridge_update_task") { move("state", "status"); move("revision", "expected_revision"); move("task_revision", "expected_revision"); move("execution_lease", "lease"); return { args, notes }; }
  if (tool !== "set_todos" && tool !== "update_plan") { move("revision", "expected_revision"); move("task_revision", "expected_revision"); move("execution_lease", "lease"); return { args, notes }; }
  move("revision", "expected_revision"); move("task_revision", "expected_revision");
  if (typeof args.state === "string" && args.lifecycle === void 0 && ["running", "completed", "blocked", "cancelled"].includes(args.state)) move("state", "lifecycle");
  // task-system-truth: a top-level "status" is the card lifecycle (seen in practice: {status:"completed"} was rejected and the completion was lost).
  if (typeof args.status === "string" && args.lifecycle === void 0) {
    const LIFECYCLE_ALIASES = { running: "running", in_progress: "running", active: "running", completed: "completed", complete: "completed", done: "completed", finished: "completed", success: "completed", blocked: "blocked", failed: "blocked", error: "blocked", cancelled: "cancelled", canceled: "cancelled" };
    const mapped = LIFECYCLE_ALIASES[args.status.trim().toLowerCase()];
    if (mapped) { notes.push(`status "${args.status}" → lifecycle "${mapped}"`); args.lifecycle = mapped; delete args.status; }
  }
  if (tool === "set_todos") { move("items", "todos"); move("plan", "todos"); move("tasks", "todos"); }
  else { move("todos", "plan"); move("items", "plan"); move("steps", "plan"); }
  const listKey = tool === "set_todos" ? "todos" : "plan";
  if (Array.isArray(args[listKey])) {
    const replace = args.mode !== "patch";
    args[listKey] = args[listKey].map((raw, index) => {
      if (typeof raw === "string") { notes.push(`${listKey}[${index}] 字符串 → 对象`); raw = tool === "set_todos" ? { title: raw, status: "pending" } : { step: raw, status: "pending" }; }
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
      const item = { ...raw }, where = `${listKey}[${index}]`;
      const titleKey = tool === "set_todos" ? "title" : "step";
      for (const alias of tool === "set_todos" ? ["content", "text", "name", "step", "description", "task"] : ["title", "content", "text", "name", "description", "task"]) if (item[alias] !== void 0 && item[titleKey] === void 0 && typeof item[alias] === "string") { item[titleKey] = item[alias]; delete item[alias]; notes.push(`${where}.${alias} → ${titleKey}`); }
      if (item.state !== void 0 && item.status === void 0) { item.status = item.state; delete item.state; notes.push(`${where}.state → status`); }
      if (item.status === void 0 && typeof item.completed === "boolean") { item.status = item.completed ? "completed" : "pending"; delete item.completed; notes.push(`${where}.completed → status`); }
      item.status = normalizeTodoStatus(item.status, where, notes);
      if (tool === "set_todos" && item.id === void 0 && replace) { item.id = `step-${index + 1}`; notes.push(`${where}.id 缺失 → "step-${index + 1}"`); }
      if (tool === "set_todos" && typeof item.id === "number") { item.id = String(item.id); notes.push(`${where}.id 数字 → 字符串`); }
      const allowed = tool === "set_todos" ? ["id", "title", "status"] : ["step", "status"];
      for (const key of Object.keys(item)) if (!allowed.includes(key)) { delete item[key]; notes.push(`${where}.${key} 已忽略（不受支持的字段）`); }
      return item;
    });
  }
  return { args, notes };
}
function attachNormalized(result, notes) {
  if (!notes?.length || !result || typeof result !== "object") return result;
  const structured = result.structuredContent && typeof result.structuredContent === "object" && !Array.isArray(result.structuredContent) ? result.structuredContent : {};
  const prior = Array.isArray(structured.normalized) ? structured.normalized : [];
  const merged = [...prior, ...notes.filter((note) => !prior.includes(note))];
  const content = Array.isArray(result.content) ? result.content : [];
  const warning = `[normalized] 已按别名/服务端状态补全：${merged.join("；")}。下次请直接使用规范字段。`;
  return { ...result, structuredContent: { ...structured, normalized: merged }, content: content.length && content[0]?.type === "text" ? [{ ...content[0], text: `${content[0].text}\n${warning}` }, ...content.slice(1)] : [...content, { type: "text", text: warning }] };
}
var BridgeToolDispatcher = class {
  constructor(deps, concurrency = DEFAULT_BRIDGE_TOOL_CONCURRENCY) {
    this.deps = deps;
    // ai-review-step01: 「源代码管理 › AI 改动」。基线存在 ~/.opencode/ai-review/<工作区哈希>，不写进项目目录。
    try {
      let root = "";
      try { const r = deps?.workspaceRoots?.() || []; root = (Array.isArray(r) ? r[0] : r) || ""; } catch {}
      const storeDir = pathAiReview.join(osAiReview.homedir(), ".opencode", "ai-review", cryptoAiReview.createHash("sha256").update(String(root).toLowerCase()).digest("hex").slice(0, 16));
      this.aiReview_ = new AiEditReview({ subscriptions: [] }, { roots: () => deps?.workspaceRoots?.() || [], log: (m) => deps?.log?.(m), storeDir });
      if (!deps.aiReview) deps.aiReview = () => this.aiReview_;
    } catch (error) {
      try { deps?.log?.(`[ai-review] 初始化失败：${error?.message ?? error}`); } catch {}
    }
    // inline-ai-step01: 编辑器内 Tab 补全与 Ctrl+I 行内修改（只启动一次）。
    try { activateInlineAi({ log: (m) => deps?.log?.(m) }); } catch (error) { try { deps?.log?.(`[inline-ai] 初始化失败：${error?.message ?? error}`); } catch {} }
    // crash-report-step05: 本地崩溃记录（~/.opencode/crash）+ 命令 opencode.diagnostics.export。
    try { activateCrashReporting({ log: (m) => deps?.log?.(m) }); } catch (error) { try { deps?.log?.(`[crash-report] 初始化失败：${error?.message ?? error}`); } catch {} }
    // auto-update-step06: 检查更新（opencode.update.source，默认关闭）+ 命令 opencode.update.check。
    try { activateAutoUpdate({ log: (m) => deps?.log?.(m) }); } catch (error) { try { deps?.log?.(`[auto-update] 初始化失败：${error?.message ?? error}`); } catch {} }
    // ai-code-review-step01 / usage-ledger-step01
    try { activateAiCodeReview({ log: (m) => deps?.log?.(m) }); registerUsageCommand(); } catch (error) { try { deps?.log?.(`[ai-code-review] 初始化失败：${error?.message ?? error}`); } catch {} }
    // cloud-agent-step01: 「发到云端运行」/「安装云端工作流」（GitHub Actions，结果为 draft PR）。
    try { activateCloudAgent({ log: (m) => deps?.log?.(m) }); } catch (error) { try { deps?.log?.(`[cloud-agent] 初始化失败：${error?.message ?? error}`); } catch {} }
    this.taskStore.memoryTargetReader = owner => deps.automation?.resolveMemoryRootTarget(undefined, owner);
    this.taskStore.onTaskMemory = (owner, memory) => deps.automation?.bindTaskMemory(owner, memory);
    this.taskActivityById = new Map();
    this.taskStore.sourceIdentityReader=owner=>deps.automation?.sourceIdentityFor(owner)||null;
    this.toolGate = new FairSemaphore(concurrency);
    this.classGates = new Map(); this.serverGates = new Map(); this.lastTiming = {};
    this.backendToolGate = new FairSemaphore(2);
    this.externalToolGate = new FairSemaphore(Math.max(4,Math.min(16,concurrency)));
    this.adaptive = new AdaptiveConcurrencyController({
      min: Math.min(2,concurrency),
      max: concurrency,
      initial: concurrency
    });
  }
  deps;
  activityTracker = new BridgeActivityTracker(MAX_ACTIVITY);
  taskStore = new BridgeTaskStore(MAX_TODOS);
  /** Same-workspace multi-dialogue edits, so build/package results can describe other dialogues' changes. */
  workspaceActivity = new WorkspaceActivityLedger({ rootsReader: () => this.deps?.workspaceRoots?.() || [] });
  // 建议7：影子 git 检查点（默认关闭，opencode.bridge.checkpoints）。
  // 建议12：Spec 模式（默认关闭，opencode.bridge.specMode）。
  specMode = new SpecModeStore({ enabled: () => this.deps?.specModeEnabled?.() === true, log: (message) => this.deps?.log?.(message) });
  shadowCheckpoints = new ShadowCheckpointStore({ enabled: () => this.deps?.checkpointsEnabled?.() === true, log: (message) => this.deps?.log?.(message) });
  /** task owner -> command owner seen with it, so a vanished MCP session can still interrupt its job. */
  taskCommandOwners = /* @__PURE__ */ new Map();
  stepBudgetByOwner = /* @__PURE__ */ new Map();
  /** dsh-gap-fixes: advisory reminder when one dialogue repeats an identical tool call. */
  repeatGuard = new RepeatCallGuard();
  revision_ = 0;
  /**
   * Caps tool calls executed at once across BOTH protocol eras.
   *
   * The modern (2026) path is stateless — every request builds its own server
   * and nothing serialises them — so without this a client can hold an
   * unbounded number of managed terminals open at the same time. Callers over
   * the limit queue instead of failing, so a burst stays correct and merely
   * takes longer.
   */
  toolGate;
  /** External requests never occupy all permits needed for built-in file and IDE tools. */
  externalToolGate;
  /**
   * Tunes `toolGate` from observed load. Bandwidth is not a usable signal here
   * (see adaptive-concurrency.ts); queueing, latency and failures are.
   */
  adaptive;
  /** Tool-side revision counter; the facade adds this to its own for getStatus(). */
  get revision() {
    return this.revision_;
  }
  /** Copy of the current todos for BridgeStatus. */
  snapshotTodos() {
    return this.taskStore.selectedTodos();
  }
  snapshotTaskState() {
    if (this.taskStore.pruneTerminal()) this.revision_++;
    return this.taskStore.snapshot();
  }
  /** Local native Chat task lifecycle; not exposed as an MCP tool. */
  ensureNativeChatTask(owner, model, title) {
    const before = this.taskStore.snapshot().taskId;
    const task = this.taskStore.ensureNativeChat(owner, model, title);
    if (before !== task.id) this.revision_++;
    return task;
  }
  finishNativeChatTask(owner, taskId, revision, succeeded) {
    const settled = this.taskStore.finishNativeChat(owner, taskId, revision, succeeded);
    if (settled) this.revision_++;
    const targetTask = this.taskStore.snapshot().tasks.find((t) => t.id === taskId || t.owner === owner);
    if (targetTask) this.deps.automation?.recordAutoHandoff?.({ owner, task: targetTask, succeeded, source: "native-chat" });
  }
  /** Local UI only; the MCP dispatcher never exposes this as a tool. */
  clearTasks(requests, allowAttention = false) {
    const removed = this.taskStore.clearTasks(requests, allowAttention);
    if (removed) this.revision_++;
    return removed;
  }
  deleteTaskDisplay(taskId) {
    const deleted = this.taskStore.deleteTaskDisplay(taskId);
    if (deleted) this.revision_++;
    return deleted;
  }
  forkTask(taskId) {
    const task = this.taskStore.forkTask(taskId);
    this.revision_++;
    return task;
  }
  /** Only the local task board can submit an answer. */
  answerTaskQuestion(taskId, questionId, optionId, customText) {
    const answer = this.taskStore.answerQuestion(taskId, questionId, optionId, customText);
    this.revision_++;
    return answer;
  }
  /**
   * 建议11：bridge_ask_user → MCP elicitation/create（可选、默认关闭）。
   * 任务板提问照常创建、照常等待；若本次调用带有 extra.elicit（客户端支持表单 elicitation 且本地开启），
   * 同时把等价表单推给客户端。哪边先答用哪边：表单回答经 taskStore.answerQuestion 写回任务板并标记
   * source=mcp-elicitation；任务板先答则取消表单。拒绝、取消、失败、超时一律只回退到任务板，不放宽任何门禁。
   * 返回停止函数；无通道时返回 null。
   */
  startElicitation(extra, task, questions) {
    if (typeof extra?.elicit !== "function" || !task || !Array.isArray(questions) || !questions.length) return null;
    const controller = new AbortController();
    const signal = extra.signal ? AbortSignal.any([extra.signal, controller.signal]) : controller.signal;
    const properties = {};
    const required = [];
    questions.forEach((question, index) => {
      const key = "q" + (index + 1);
      properties[key] = {
        type: "string",
        title: (questions.length > 1 ? `${index + 1}. ` : "") + String(question.text).slice(0, 200),
        ...question.recommendation ? { description: "推荐：" + String(question.recommendation).slice(0, 300) } : {},
        enum: question.options.map((option) => option.id),
        enumNames: question.options.map((option) => option.label),
        ...question.recommendedOptionId ? { default: question.recommendedOptionId } : {}
      };
      if (question.allowCustom) properties[key + "_custom"] = { type: "string", title: "自定义回答（可选）", maxLength: 2000 };
      else required.push(key);
    });
    const message = questions.length === 1
      ? String(questions[0].text) + "\n（也可在 OpenCode 任务板作答。）"
      : `请回答以下 ${questions.length} 个问题（也可在 OpenCode 任务板作答）。`;
    let stopped = false;
    Promise.resolve()
      .then(() => extra.elicit({ message, requestedSchema: { type: "object", properties, ...required.length ? { required } : {} } }, signal))
      .then((result) => {
        if (stopped || result?.action !== "accept" || !result.content || typeof result.content !== "object") return;
        let changed = false;
        questions.forEach((question, index) => {
          const key = "q" + (index + 1);
          const current = this.taskStore.tasks?.get?.(task.id)?.questions?.find((item) => item.id === question.id);
          if (!current || current.status !== "pending") return;
          const optionId = typeof result.content[key] === "string" ? result.content[key] : null;
          const custom = question.allowCustom && typeof result.content[key + "_custom"] === "string" ? result.content[key + "_custom"].trim() : "";
          if (!optionId && !custom) return;
          try {
            this.taskStore.answerQuestion(task.id, question.id, optionId, custom || void 0);
            if (current.answer) current.answer.source = "mcp-elicitation";
            changed = true;
          } catch (error) {
            this.deps.log?.(`[bridge] elicitation 回答未写入任务板：${error?.message ?? error}`);
          }
        });
        if (changed) { this.taskStore.persist?.(); this.revision_++; }
      })
      .catch((error) => { if (!stopped) this.deps.log?.(`[bridge] elicitation 未完成，回退到任务板提问：${error?.message ?? error}`); });
    return () => { stopped = true; controller.abort(); };
  }
  /** Local UI only; never exposed as an MCP cancellation tool. */
  interruptStaleTasks(requests) {
    const interrupted = this.taskStore.interruptStaleTasks(requests);
    if (interrupted) this.revision_++;
    return interrupted;
  }
  /** Activity + stats snapshot for BridgeStatus. */
  snapshotActivity() {
    return this.activityTracker.snapshot();
  }
  /** Clears finished tool calls (keeping running ones) and bumps the revision. */
  clearActivity() {
    const removed = this.activityTracker.clear();
    const progressCleared = this.taskStore.clearProgress();
    if (removed > 0 || progressCleared > 0) {
      this.revision_ += 1;
    }
    return removed;
  }
  beginRemoteConversation(_commandOwnerId) {
  }
  endRemoteConversation(commandOwnerId) {
    this.stepBudgetByOwner.delete(commandOwnerId);
    this.deps.automation?.disconnect(commandOwnerId);
    let changed = this.taskStore.disconnect(commandOwnerId);
    for (const [taskOwnerId, seenCommandOwnerId] of this.taskCommandOwners) {
      if (seenCommandOwnerId === commandOwnerId) changed = this.taskStore.disconnect(taskOwnerId) || changed;
    }
    if (changed) this.revision_ += 1;
  }
  rememberTaskCommandOwner(taskOwnerId, commandOwnerId) {
    this.taskCommandOwners.delete(taskOwnerId);
    this.taskCommandOwners.set(taskOwnerId, commandOwnerId);
    while (this.taskCommandOwners.size > 32) this.taskCommandOwners.delete(this.taskCommandOwners.keys().next().value);
  }
  // ---- Dispatch ------------------------------------------------------------
  /**
   * Route the call to its handler. Tool-call counts are no longer collected
   * for upload to the license server; the activity tracker keeps the local
   * statistics shown in the Bridge panel.
   */
  beginStepBudgetTracking(commandOwnerId, args) {
    if (!commandOwnerId || commandOwnerId === NATIVE_MANAGED_COMMAND_OWNER_ID) return null;
    const now = Date.now();
    let entry = this.stepBudgetByOwner.get(commandOwnerId);
    if (!entry) {
      entry = { segmentTopCalls: 0, estimatedHostSteps: 0, inFlight: 0, lastCompletedAt: 0, resets: 0 };
    } else {
      this.stepBudgetByOwner.delete(commandOwnerId);
    }
    this.stepBudgetByOwner.set(commandOwnerId, entry);
    while (this.stepBudgetByOwner.size > 128) {
      this.stepBudgetByOwner.delete(this.stepBudgetByOwner.keys().next().value);
    }
    const rawArgs = args && typeof args === "object" ? args : {};
    const hasNewTaskSubCall = Array.isArray(rawArgs.calls) && rawArgs.calls.some((c) => c && (c.tool === "set_todos" || c.tool === "update_plan") && c.arguments && c.arguments.new_task === true);
    if (rawArgs.reset_step_counter === true || rawArgs.new_task === true || hasNewTaskSubCall) {
      entry.segmentTopCalls = 0;
      entry.estimatedHostSteps = 0;
      entry.lastCompletedAt = 0;
      entry.resets += 1;
    }
    entry.segmentTopCalls += 1;
    if (Number.isInteger(rawArgs.host_step) && rawArgs.host_step >= 1) {
      entry.estimatedHostSteps = rawArgs.host_step;
    } else if (entry.estimatedHostSteps === 0 || (entry.inFlight === 0 && now - entry.lastCompletedAt > 350)) {
      entry.estimatedHostSteps += 1;
    }
    entry.inFlight += 1;
    return this.snapshotStepBudget(commandOwnerId);
  }
  resetStepBudget(commandOwnerId) {
    const entry = commandOwnerId ? this.stepBudgetByOwner.get(commandOwnerId) : null;
    if (!entry) return;
    entry.segmentTopCalls = 0;
    entry.estimatedHostSteps = 0;
    entry.lastCompletedAt = 0;
    entry.resets += 1;
  }
  endStepBudgetTracking(commandOwnerId) {
    const entry = commandOwnerId ? this.stepBudgetByOwner.get(commandOwnerId) : null;
    if (!entry) return;
    entry.inFlight = Math.max(0, entry.inFlight - 1);
    entry.lastCompletedAt = entry.segmentTopCalls === 0 ? 0 : Date.now();
  }
  snapshotStepBudget(commandOwnerId) {
    const entry = commandOwnerId ? this.stepBudgetByOwner.get(commandOwnerId) : null;
    if (!entry) return null;
    const step = entry.estimatedHostSteps;
    const status = step >= 90 ? "trigger_checkpoint_now" : step >= 80 ? "approaching_checkpoint" : "ok";
    let warning = null;
    if (step >= 90) {
      warning = `[⚠️ AUTO_STEP_RESET 90-99步防截断告警 · 估算宿主步 #${step}/100 (MCP顶层调用 #${entry.segmentTopCalls})] 当前段（自本轮对话开始或上次 ask 重置起算）宿主工具步数已达第 ${step} 步（90-99 步安全窗口）！若本轮仍有未完工作，必须立即调用宿主原生 ask_user（严禁调 bridge_ask_user）：id="opencode_step_reset_checkpoint"，question 以 "[AUTO_STEP_RESET]" 开头简述进度与剩余步骤，allowCustomResponse=false，options=[{id:"continue",label:"继续",description:"立即重置 100 步计数器并无缝继续剩余任务"},{id:"pause",label:"暂停",description:"暂停自动续接并先汇报当前阶段进展"}]；严禁拖到第 100 步硬截断！每次 ask（含普通业务 ask 与 90 步续接 ask）恢复后首次调用请传 reset_step_counter=true 重置步数为 0。`;
    } else if (step >= 80) {
      warning = `[段步数预算提醒 · 估算宿主步 #${step}/100 (MCP顶层调用 #${entry.segmentTopCalls})] 当前段（自本轮对话开始或上次 ask 重置起算）距离第 90 步 [AUTO_STEP_RESET] 检查点触发线仅剩 ${Math.max(0, 90 - step)} 步，请优先用 bridge_batch 合并剩余操作；注意严禁未满 90 步提前触发续接 ask，仅当达到第 90-99 步且仍有未完工作时才触发宿主原生 ask_user 刷新步数。`;
    }
    return {
      segment_mcp_calls: entry.segmentTopCalls,
      estimated_host_steps: step,
      resets: entry.resets,
      checkpoint_window: "90-99",
      status,
      ...(warning ? { warning } : {})
    };
  }
  async dispatch(rawToolName, args, extra) {
    if (!OC_ACTOR_STORE.getStore()) return OC_ACTOR_STORE.run(ocActorFromExtra(extra), () => this.dispatch(rawToolName, args, extra));
    const commandOwnerId = extra.commandOwnerId ?? NATIVE_MANAGED_COMMAND_OWNER_ID;
    const isTopLevelRemote = !extra._batchSubCall && commandOwnerId !== NATIVE_MANAGED_COMMAND_OWNER_ID;
    const run = async () => {
      const stepBudget = isTopLevelRemote ? this.beginStepBudgetTracking(commandOwnerId, args) : null;
      let cleanArgs = args;
      if (isTopLevelRemote && args && typeof args === "object" && rawToolName !== BRIDGE_BATCH_TOOL.name && ("reset_step_counter" in args || "host_step" in args)) {
        const { reset_step_counter: _r, host_step: _h, ...rest } = args;
        cleanArgs = rest;
      }
      // task-card-multi-conv: any remote Bridge call may name its card (task_id / overview_session_id). Tools that do not declare
      // those keys get them removed before schema validation; the reference rides along in extra.cardRef for attribution.
      let cardRef = extra.cardRef;
      if (commandOwnerId !== NATIVE_MANAGED_COMMAND_OWNER_ID && !String(commandOwnerId).startsWith(NATIVE_MANAGED_COMMAND_OWNER_ID + ":")) {
        const split = splitCardRef(cleanArgs, (key) => this.toolDeclaresArgument(rawToolName, key));
        cleanArgs = split.args;
        if (split.ref) cardRef = split.ref;
      }
      try {
        // dsh-gap-fixes: per-tool deadline, oversized-output spill and repeat-call reminder wrap every call (batch sub-calls included).
        const guardName = this.guardToolName(rawToolName);
        let res = await runWithToolTimeout(guardName, toolTimeoutMs(guardName, this.guardCategory(rawToolName, guardName)), extra.signal, (signal) => this.handleExecutionToolCall(rawToolName, cleanArgs, { signal, commandOwnerId, taskOwnerId: extra.taskOwnerId, executionLease: extra.executionLease, workerCallId: extra.workerCallId, _stepBudget: stepBudget, elicit: extra.elicit, cardRef }));
        res = spillLargeResult(guardName, res, extra.taskOwnerId ?? commandOwnerId);
        res = this.repeatGuard.annotate(extra.taskOwnerId ?? commandOwnerId, guardName, cleanArgs, res);
        if (stepBudget?.warning && res && !res._stepBudgetEmbedded) {
          return { ...res, _stepBudgetWarning: stepBudget.warning };
        }
        return res;
      } finally {
        if (isTopLevelRemote) this.endStepBudgetTracking(commandOwnerId);
      }
    };
    const schedulingName = resolveBridgeToolName(rawToolName, name => CONCURRENCY_EXEMPT_TOOLS.has(name));
    if (CONCURRENCY_EXEMPT_TOOLS.has(schedulingName)) return run();
    const externalName = resolveBridgeToolName(rawToolName, (name) => this.deps.externalMcp?.hasBinding(name) === true || this.deps.nativeRea?.hasBinding(name) === true);
    const external=this.deps.externalMcp?.hasBinding(externalName) && !this.findCustomToolSafe(externalName);
    const nativeName=resolveBridgeToolName(rawToolName,name=>this.deps.nativeRea?.hasBinding(name)===true);
    const native=this.deps.nativeRea?.hasBinding(nativeName)===true;
    const category=native?'rea':external?'external':/^(?:apply_patch|write_file|edit_file)$/.test(rawToolName)?'write':/search|find_files/.test(rawToolName)?'search':'read';
    const group=external?(externalName.split('__')[1]||externalName):category;
    const map=external?this.serverGates:this.classGates;
    if(!map.has(group))map.set(group,new FairSemaphore(external?2:category==='search'?2:category==='write'?4:8));
    const gate=map.get(group),globalGate=external?this.externalToolGate:native?this.backendToolGate:this.toolGate;
    const queued=gate.waiting+globalGate.waiting,queuedAt=Date.now();
    const queueSignal=AbortSignal.any([...(extra.signal?[extra.signal]:[]),AbortSignal.timeout(120000)]);
    let releaseClass,releaseGlobal,executionAt,failed=false;
    try {
      releaseClass=await gate.acquire(queueSignal,commandOwnerId);
      releaseGlobal=await globalGate.acquire(queueSignal,commandOwnerId);
      executionAt=Date.now();
      const result=await run();
      failed=result.isError===true && /timeout|overload|429|503|ECONNRESET/i.test(JSON.stringify(result));
      return result;
    } catch(error2) {failed=/timeout|overload|429|503|ECONNRESET/i.test(String(error2));throw error2;}
    finally {
      releaseGlobal?.();releaseClass?.();
      const end=Date.now();this.lastTiming={category,queueWaitMs:(executionAt||end)-queuedAt,executionMs:executionAt?end-executionAt:0};
      if(executionAt&&!external)this.applyAdaptiveDecision({durationMs:end-executionAt,failed,queued,queueWaitMs:executionAt-queuedAt,slowCallMs:category==='process'?125000:30000,pressure:systemPressure()});
    }
  }
  /** task-card-multi-conv: true when the tool's own input schema declares `key` (then the argument is kept for the tool).
   * Unknown tools keep their arguments unchanged; external (ext__) tools never take Bridge card references. Never throws. */
  toolDeclaresArgument(rawToolName, key) {
    try {
      const raw = String(rawToolName || "");
      if (raw.startsWith("ext__") && !this.findCustomToolSafe(raw)) return false;
      const own = [SET_TODOS_TOOL, UPDATE_PLAN_TOOL, REPORT_PROGRESS_TOOL, BRIDGE_BATCH_TOOL, CONFIGURE_MCP_TOOL, SHADOW_CHECKPOINT_TOOL, SPEC_MODE_TOOL];
      let found = false;
      for (const name of new Set([raw, this.guardToolName(raw)])) {
        const def = own.find((tool) => tool?.name === name) ?? BRIDGE_TOOL_DEFINITIONS.find((tool) => tool.name === name) ?? getIdeToolDefinition(name) ?? this.findCustomToolSafe(name) ?? this.deps.nativeRea?.definition?.(name);
        const props = def?.inputSchema?.properties;
        if (!props) continue;
        found = true;
        if (Object.prototype.hasOwnProperty.call(props, key)) return true;
      }
      return !found;
    } catch { return true; }
  }
  /** Canonical tool name for the guards; never throws. */
  guardToolName(rawToolName) {
    try { return normalizeFileToolName(resolveBridgeToolName(String(rawToolName || ""), (name) => BRIDGE_TOOL_DEFINITIONS.some((tool) => tool.name === name) || isFileToolName(name) || name === SET_TODOS_TOOL.name || name === UPDATE_PLAN_TOOL.name || name === REPORT_PROGRESS_TOOL.name)); } catch { return String(rawToolName || ""); }
  }
  /** Timeout class for one call: write / search / read / rea / external / other. */
  guardCategory(rawToolName, name) {
    try {
      if (this.deps.nativeRea?.hasBinding(resolveBridgeToolName(rawToolName, (n) => this.deps.nativeRea?.hasBinding(n) === true)) === true) return "rea";
      if (String(rawToolName).startsWith("ext__") || this.deps.externalMcp?.hasBinding(resolveBridgeToolName(rawToolName, (n) => this.deps.externalMcp?.hasBinding(n) === true)) === true) return "external";
    } catch {}
    if (/^(?:apply_patch|write_file|edit_file|create_file)$/.test(name)) return "write";
    if (/^(?:search_files|find_files|lsp|get_diagnostics)$/.test(name)) return "search";
    if (/^(?:read_files|read_file|read_image|list_directory)$/.test(name)) return "read";
    return "other";
  }
  /** Feed one completion to the controller and resize the gate if it decides to. */
  applyAdaptiveDecision(sample) {
    const decision = this.adaptive.record(sample);
    if (!decision.changed) return;
    this.toolGate.setLimit(decision.limit);
    this.deps.log(
      `[bridge] tool concurrency ${decision.reason} -> ${decision.limit} (active=${this.toolGate.active}, waiting=${this.toolGate.waiting})`
    );
  }
  /** In-flight and queued tool calls plus the current adaptive ceiling. */
  concurrencySnapshot() {
    return { ...this.toolGate.snapshot(), external:this.externalToolGate.snapshot(), lastTiming:this.lastTiming, classes:Object.fromEntries([...this.classGates].map(([k,g])=>[k,g.snapshot()])), upstreams:Object.fromEntries([...this.serverGates].map(([k,g])=>[k,g.snapshot()])) };
  }
  /** Never throws: a malformed manifest must not break built-in tool dispatch. */
  findCustomToolSafe(toolName) {
    try {
      return findCustomTool(this.deps.workspaceRoots(), toolName, (message2) => this.deps.log(message2), { skillsEnabled: this.deps.skillsEnabled?.() ?? true });
    } catch {
      return void 0;
    }
  }
  async handleExecutionToolCall(rawToolName, input, extra) {
    const aliased=normalizeBridgeAliases(rawToolName,input);input=aliased.args;const aliasNotes=aliased.notes;
    const automation=this.deps.automation?.forCaller(extra.commandOwnerId,input)||this.deps.automation;
    extra={...extra,automationContext:automation};
    const runtime=automation?.collaboration;
    if(!runtime)return attachNormalized(await this.handleToolCall(rawToolName,input,extra),aliasNotes);
    let record;
    try{
      const resolved=resolveBridgeToolName(rawToolName,name=>BRIDGE_TOOL_DEFINITIONS.some(tool=>tool.name===name)||isFileToolName(name)||isFileToolCompatibilityAlias(name)||getIdeToolDefinition(name)!==undefined||this.findCustomToolSafe(name)!==undefined||this.deps.externalMcp?.hasBinding(name)===true||this.deps.nativeRea?.hasBinding(name)===true);
      const name=rawToolName.startsWith('ext__')&&!this.findCustomToolSafe(rawToolName)&&!this.deps.externalMcp?.hasBinding(rawToolName)?rawToolName:normalizeFileToolName(resolved);
      let canonical=input;
      if(EXECUTION_SCOPED_TOOLS.has(name)&&input&&Object.prototype.hasOwnProperty.call(input,'execution_lease')){const {execution_lease,...body}=input;if(extra.executionLease&&execution_lease!==extra.executionLease)throw Object.assign(Error('TASK_NOT_OWNED: 执行令牌与真实执行器不一致。'),{code:'TASK_NOT_OWNED'});extra={...extra,executionLease:execution_lease};canonical=body;}
      if(isFileToolName(name))canonical=normalizeFileToolInput(name,canonical);
      const args=runtime.executionArguments(name,canonical,extra.commandOwnerId,extra.executionLease);
      const definition=BRIDGE_TOOL_DEFINITIONS.find(tool=>tool.name===name)??this.deps.nativeRea?.definition(name);
      if(definition)validateToolInput(name,definition.inputSchema,args);
      try{record=await runtime.beginTool(name,args,extra.commandOwnerId,extra);}
      catch(error){if(error?.code!=='POLICY_ASK_REQUIRED')throw error;await this.askPolicyApproval(automation,error,name,extra,extra.taskOwnerId??extra.commandOwnerId);record=await runtime.beginTool(name,args,extra.commandOwnerId,extra);}
      const result=await this.handleToolCall(rawToolName,args,extra);
      return attachNormalized(await runtime.finishTool(record,result),[...aliasNotes,...(runtime.takeNormalization?.(extra.commandOwnerId)||[])]);
    }catch(error){
      await runtime.toolOutcomeUnknown(record,error.message||String(error));
      this.notePolicyDenied(error,rawToolName,extra.taskOwnerId??extra.commandOwnerId);
      runtime.takeNormalization?.(extra.commandOwnerId);
      return {isError:true,content:[{type:'text',text:error.message||String(error)}],structuredContent:{error:{code:error.code||'EXECUTION_DISPATCH_FAILED',message:error.message||String(error)},...(error.details&&typeof error.details==='object'?error.details:{})}};
    }
  }
  /** POLICY_ASK_REQUIRED → one task-card question; an explicit "allow once" approves this exact call for 60 s. */
  async askPolicyApproval(automation, error, toolName, extra, taskOwnerId) {
    const d = error?.details || {};
    const deny = (reason, more = {}) => { automation?.policy?.record?.({ owner: extra.commandOwnerId, tool: toolName, effect: 'deny', rule: d.rule, reason: d.reason + ' / ' + reason }); throw Object.assign(new Error(`POLICY_DENIED: 工具 ${toolName} 需要用户批准（规则 ${d.rule}：${d.reason}），${reason}`), { code: 'POLICY_DENIED', details: { code: 'POLICY_DENIED', rule: d.rule, reason: d.reason, tool: toolName, approval: reason, ...more } }); };
    if (!d.fingerprint || !automation?.approveToolGate) deny('没有可用的审批通道，按拒绝处理。');
    let asked;
    try { asked = this.taskStore.askQuestion(taskOwnerId, { question: `[工具门禁] 是否允许本次调用 ${toolName}？规则 ${d.rule}：${d.reason}`.slice(0, 1000), options: [{ id: 'allow_once', label: '允许本次调用', description: '只批准这一次完全相同的调用（60 秒内有效），不改变策略。' }, { id: 'deny', label: '拒绝' }], recommended_option_id: 'deny', allow_custom: false }); }
    catch (askError) { deny('当前会话无法在任务卡上提问（' + (askError?.message || askError) + '），按拒绝处理。'); }
    this.revision_ += 1;
    const answer = await this.taskStore.waitForQuestion(asked.task.id, asked.question.id, { signal: extra.signal, timeoutMs: 5 * 60 * 1e3 });
    if (answer.status !== 'answered') deny('用户尚未回答（已在任务卡提问，question_id=' + asked.question.id + '）。请用 bridge_ask_user(mode=check, task_id=' + asked.task.id + ', question_id=' + asked.question.id + ') 查询后再重试原调用。', { task_id: asked.task.id, question_id: asked.question.id });
    this.taskStore.markAnswersDelivered(taskOwnerId, asked.task.id, [asked.question.id]);
    if (answer.answer?.optionId !== 'allow_once') deny('用户选择了拒绝。');
    automation.approveToolGate(extra.commandOwnerId, d.fingerprint);
    automation?.policy?.record?.({ owner: extra.commandOwnerId, tool: toolName, effect: 'ask-approved-by-user', rule: d.rule, reason: d.reason });
  }
  async guardWithPolicyAsk(automation, toolName, args, extra, taskOwnerId) {
    try { return await automation?.guard(toolName, args, extra.commandOwnerId); }
    catch (error) { if (error?.code !== 'POLICY_ASK_REQUIRED') throw error; await this.askPolicyApproval(automation, error, toolName, extra, taskOwnerId); return await automation?.guard(toolName, args, extra.commandOwnerId); }
  }
  /** Every gate deny is also written into the caller's task-card tool events. Never throws. */
  notePolicyDenied(error, toolName, taskOwnerId) {
    try {
      if (error?.code !== 'POLICY_DENIED' || !taskOwnerId) return;
      const task = this.taskStore.forProgress(taskOwnerId, {});
      if (!task) return;
      this.taskStore.recordToolEvent(task.id, { id: 'policy-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8), tool: String(toolName), status: 'policy_denied', at: Date.now(), outcome: 'policy_denied_not_executed', rule: error.details?.rule, reason: String(error.details?.reason || '').slice(0, 300) });
      this.revision_ += 1;
    } catch {}
  }
  async handleToolCall(rawToolName, args, extra) {
    const activeOwnerId = extra?.taskOwnerId ?? extra?.commandOwnerId;
    const stale = this.staleByOtherDialogue(rawToolName, args, activeOwnerId, extra);
    if (stale) return stale;
    this.taskStore.beginOwnerActivity(activeOwnerId);
    try {
      const actor = ocActorFromExtra(extra);
      if (this.taskStore.noteLiveDialogue?.(activeOwnerId, { kind: actor.kind, label: actor.label, tool: String(rawToolName || ""), ref: extra?.cardRef })) this.revision_ += 1;
      // task-system-truth: stateless MCP calls carry a fresh owner each time; attribute them to their open card on real evidence.
      if (actor.kind === "remote" && this.taskStore.attributeActivity?.(activeOwnerId, { label: actor.label, tool: String(rawToolName || ""), args, ref: extra?.cardRef })) this.revision_ += 1;
    } catch {
    }
    // ai-review-step01: 写类工具执行前记下目标文件的审查基线，执行后刷新「AI 改动」。
    let reviewPaths = [];
    try {
      const review = this.deps?.aiReview?.();
      if (review) {
        const calls = Array.isArray(args?.calls) ? args.calls : [{ tool: rawToolName, arguments: args }];
        for (const c of calls) {
          const n = this.workspaceToolName(c?.tool ?? c?.name ?? "");
          if (isReviewedWriteTool(n) && !this.isIsolatedFileCall(n, extra)) reviewPaths.push(...reviewTargetPaths(n, c?.arguments ?? c?.args ?? {}));
        }
        if (reviewPaths.length) review.captureBefore(reviewPaths, { label: `${ocActorFromExtra(extra).label} · ${new Date().toLocaleTimeString("zh-CN", { hour12: false })}` });
      }
    } catch {
      reviewPaths = [];
    }
    // canvas-console: 每次真实工具调用记一条（谁、什么工具、参数摘要、结果/错误），画布控制台据此推导状态。
    let canvasEntry = 0, canvasActor = null;
    try { canvasActor = ocActorFromExtra(extra); canvasEntry = canvasConsole.begin(activeOwnerId, canvasActor, String(rawToolName || ""), args, extra?.cardRef); } catch {}
    let canvasResult, canvasError;
    try {
      const result = await this.handleToolCallTracked(rawToolName, args, extra);
      canvasResult = result;
      const checkpointed = await this.recordShadowCheckpoint(rawToolName, args, result, activeOwnerId, extra);
      const annotated = await this.annotateWorkspaceActivity(rawToolName, args, checkpointed, activeOwnerId, extra);
      try {
        const actor = ocActorFromExtra(extra);
        const hint = this.taskStore.taskCardHint?.(activeOwnerId, { kind: actor.kind, label: actor.label, tool: String(rawToolName || ""), args, ref: extra?.cardRef });
        if (hint && annotated && Array.isArray(annotated.content)) return { ...annotated, content: [...annotated.content, { type: "text", text: hint }] };
      } catch {
      }
      // canvas-console: 用户按了「全部停下」后，每个外部 AI 的下一次工具结果带一次停止通知。
      try {
        const stopText = canvasConsole.stopNoticeFor(activeOwnerId, canvasActor, extra?.cardRef);
        if (stopText && annotated && Array.isArray(annotated.content)) return { ...annotated, content: [...annotated.content, { type: "text", text: stopText }] };
      } catch {
      }
      return annotated;
    } catch (error) {
      canvasError = error;
      throw error;
    } finally {
      try { if (canvasEntry) canvasConsole.end(canvasEntry, canvasResult, canvasError); } catch {}
      if (reviewPaths.length) { try { void this.deps?.aiReview?.()?.afterEdit(reviewPaths); } catch {} }
      this.taskStore.endOwnerActivity(activeOwnerId);
    }
  }
  workspaceToolName(rawToolName) {
    return normalizeFileToolName(resolveBridgeToolName(String(rawToolName || ""), (n) => n === "run_command" || isFileToolName(n) || isFileToolCompatibilityAlias(n)));
  }
  /** True when this call's file tools resolve inside an isolated worktree (multi-model branch or collaboration task), not the shared workspace. */
  isIsolatedFileCall(name, extra) {
    try {
      const main = this.deps?.workspaceRoots?.() || [];
      const norm = (r) => String(r || "").replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
      const baseRoots = this.deps?.fileToolRoots ? this.deps.fileToolRoots(name) : main;
      const roots = extra?.automationContext?.collaboration?.fileToolRoots?.(extra?.commandOwnerId, baseRoots) || baseRoots;
      const base = new Set((Array.isArray(baseRoots) ? baseRoots : [baseRoots]).map(norm));
      const list = (Array.isArray(roots) ? roots : [roots]).map(norm);
      if (list.some((r) => r.includes("multimodel-worktrees"))) return true;
      // A collaboration task bound to a worktree keeps the shared roots and appends its worktree;
      // its file arguments are scoped into that worktree, so its edits are not shared-workspace edits.
      if (list.some((r) => r && !base.has(r))) return true;
      const first = norm(Array.isArray(main) ? main[0] : main);
      return !!list[0] && !!first && list[0] !== first;
    } catch {
      return false;
    }
  }
  /** Refuse a patch built on a stale read when another dialogue changed the file since; expected_versions bypasses this. */
  staleByOtherDialogue(rawToolName, args, owner, extra) {
    try {
      if (!owner || this.workspaceToolName(rawToolName) !== "apply_patch") return null;
      if (args?.expected_versions && Object.keys(args.expected_versions).length) return null;
      if (this.isIsolatedFileCall("apply_patch", extra)) return null;
      const conflicts = this.workspaceActivity.staleConflicts(owner, patchTargetPaths(args));
      if (!conflicts.length) return null;
      const now = Date.now();
      const list = conflicts.map((c) => `${c.path}（对话「${c.title || "未命名"}」${Math.max(0, Math.round((now - c.at) / 60000))} 分钟前改过）`).join("；");
      const message = `STALE_BY_OTHER_DIALOGUE: 以下文件在本对话上次读取之后被同一工作区的其他对话改过：${list}。补丁未执行。请先用 read_files 重读这些文件，基于最新内容重写补丁，保留对方的改动，并传入 read_files 返回的 expected_versions 后重试；不要为此询问用户。`;
      return { isError: true, content: [{ type: "text", text: message }], structuredContent: { error: { code: "STALE_BY_OTHER_DIALOGUE", message }, files: conflicts.map((c) => c.path) } };
    } catch {
      return null;
    }
  }
  /** Never throws: records file edits per dialogue and adds the multi-dialogue notice to build/package commands. */
  annotateWorkspaceActivity(rawToolName, args, result, owner, extra) {
    try {
      if (!result || !owner) return result;
      const name = this.workspaceToolName(rawToolName);
      if (name === "read_files" || name === "read_file") {
        if (!result.isError && !this.isIsolatedFileCall(name, extra)) this.workspaceActivity.recordRead(owner, readTargetPaths(args));
        return result;
      }
      if (name === "apply_patch" || /^(?:write_file|edit_file|create_file)$/.test(name)) {
        if (result.isError || this.isIsolatedFileCall(name, extra)) return result;
        const paths = editedPathsFromResult(args, result);
        if (!paths.length && typeof args?.path === "string") paths.push(args.path);
        this.workspaceActivity.recordEdits(owner, paths, this.describeTaskOwner(owner));
        return result;
      }
      if (name !== "run_command" || !looksLikePackagingCommand(args?.command)) return result;
      let uncommitted = null;
      try {
        const roots = this.deps?.workspaceRoots?.() || [];
        const root = Array.isArray(roots) ? roots[0] : roots;
        if (root) {
          const cwd = typeof args?.cwd === "string" && args.cwd.trim() ? (/^(?:[a-zA-Z]:|[\\/])/.test(args.cwd) ? args.cwd.replace(/^\/([a-zA-Z])\//, "$1:/") : `${root}/${args.cwd}`) : root;
          uncommitted = gitUncommittedFiles(cwd, root);
        }
      } catch {}
      const notice = this.workspaceActivity.packagingNotice(owner, (o) => this.describeTaskOwner(o), uncommitted);
      const content = Array.isArray(result.content) ? result.content : [];
      if (content[0]?.type === "text") {
        return { ...result, content: [{ ...content[0], text: `${content[0].text}\n\n${notice}` }, ...content.slice(1)] };
      }
      return { ...result, content: [...content, { type: "text", text: notice }] };
    } catch {
      return result;
    }
  }
  shadowCheckpointRoot() {
    const roots = this.deps?.workspaceRoots?.() || [];
    const root = Array.isArray(roots) ? roots[0] : roots;
    return typeof root === "string" && root ? root : null;
  }
  /** 建议7：写类工具成功后保存一次工作区检查点。从不抛错、从不改变工具成败；失败只记日志。 */
  async recordShadowCheckpoint(rawToolName, args, result, owner, extra) {
    try {
      if (!result || result.isError || !this.shadowCheckpoints.enabled()) return result;
      const name = this.workspaceToolName(rawToolName);
      if (!isCheckpointedTool(name) || this.isIsolatedFileCall(name, extra)) return result;
      const root = this.shadowCheckpointRoot();
      if (!root) return result;
      const taskId = this.taskStore.currentByOwner?.get(owner) ?? null;
      const detail = name === "run_command" ? String(args?.command ?? "").replace(/\s+/g, " ").slice(0, 120) : editedPathsFromResult(args, result).slice(0, 5).join(", ");
      const saved = await this.shadowCheckpoints.snapshot(root, { tool: name, owner, taskId, label: `${name}${detail ? ": " + detail : ""}` });
      if (!saved?.changed || !saved.checkpoint) return result;
      const task = taskId ? this.taskStore.tasks?.get(taskId) : null;
      if (task) { task.lastCheckpoint = { checkpoint: saved.checkpoint, tool: name, at: Date.now() }; this.taskStore.persist?.(); this.revision_ += 1; }
      const note = `[检查点 ${saved.checkpoint.slice(0, 12)}] 已保存工作区快照；可用 bridge_checkpoints(mode=restore) 回滚或 mode=fork 分叉。`;
      const content = Array.isArray(result.content) ? result.content : [];
      return { ...result, content: content[0]?.type === "text" ? [{ ...content[0], text: `${content[0].text}\n\n${note}` }, ...content.slice(1)] : [...content, { type: "text", text: note }],
        ...result.structuredContent && typeof result.structuredContent === "object" && !Array.isArray(result.structuredContent) ? { structuredContent: { ...result.structuredContent, checkpoint: saved.checkpoint } } : {} };
    } catch (error) {
      this.deps?.log?.(`[checkpoint] 快照失败（不影响工具结果）：${error?.message ?? error}`);
      return result;
    }
  }
  /** 建议12：Spec 模式门禁。只约束开关开启后新建的任务卡；三段未全部通过时拒绝写文件 / 执行命令类工具。出错时放行并记日志。 */
  async specModeGate(toolName, owner) {
    try {
      if (!this.specMode.enabled() || !isSpecGatedTool(toolName)) return null;
      const root = this.shadowCheckpointRoot();
      if (!root) return null;
      const taskId = this.taskStore.currentByOwner?.get(owner) ?? null;
      const task = taskId ? this.taskStore.tasks?.get(taskId) : null;
      if (!task || !(await this.specMode.applies(root, task))) return null;
      const state = await this.syncSpecReview(root, task, await this.specMode.readState(root, task.id));
      const stage = this.specMode.pendingStage(state);
      if (!stage) return null;
      const label = SPEC_STAGE_LABELS[stage];
      const status = state.stages[stage]?.status ?? "missing";
      const message = `SPEC_APPROVAL_REQUIRED: Spec 模式已开启，本任务的「${label}」(${stage}) 段尚未评审通过（当前：${status}），${toolName} 已拒绝。`
        + `请先用 bridge_spec(mode=submit, stage=${stage}, content=...) 提交并等用户在任务卡上通过；三段（需求→设计→任务）全部通过后才能改代码或执行命令。`;
      return { isError: true, content: [{ type: "text", text: message }],
        structuredContent: { error: { code: "SPEC_APPROVAL_REQUIRED", message }, task_id: task.id, pending_stage: stage, stage_status: status, spec_dir: this.specMode.taskDir(root, task.id) } };
    } catch (error) {
      this.deps?.log?.(`[spec] 门禁检查失败（已放行）：${error?.message ?? error}`);
      return null;
    }
  }
  /** 评审问题若在 bridge_spec 返回后才被回答（如等待超时后用户才答），在这里补记结果。 */
  async syncSpecReview(root, task, state) {
    let changed = state;
    for (const stage of SPEC_STAGES) {
      const entry = changed.stages[stage];
      if (entry?.status !== "in_review" || !entry.question_id) continue;
      const question = task.questions?.find((item) => item.id === entry.question_id);
      if (question?.status !== "answered") continue;
      const optionId = question.answer?.optionId ?? null;
      const decision = optionId === "approve" ? "approve" : optionId === "skip" && stage === "requirements" ? "skip" : "revise";
      changed = await this.specMode.setReview(root, task.id, stage, decision, decision === "revise" ? String(question.answer?.text ?? "").slice(0, 2000) : undefined);
    }
    return changed;
  }
  specStatusText(root, state) {
    const lines = SPEC_STAGES.map((s) => {
      const e = state.stages[s] ?? {};
      return `- ${SPEC_STAGE_LABELS[s]}（${s}）：${e.status ?? "missing"}${e.revision ? `，第 ${e.revision} 版` : ""}${e.path ? `，${e.path}` : ""}${e.feedback ? `\n  修改意见：${e.feedback}` : ""}`;
    });
    const next = this.specMode.pendingStage(state);
    return `${state.skipped ? "本任务已由用户选择跳过 Spec。\n" : ""}${lines.join("\n")}\n${next ? `下一步：提交或修订「${SPEC_STAGE_LABELS[next]}」(${next})。` : "三段已全部通过，可以按 tasks 段开始实施。"}`;
  }
  /** 建议12：bridge_spec 工具。submit 写入规格文件并在任务卡上请用户评审，等到回答才返回。 */
  async handleSpecModeTool(args, extra) {
    const fail = (code, message, more = {}) => ({ isError: true, content: [{ type: "text", text: message }], structuredContent: { error: { code, message }, ...more } });
    const ok = (data, text) => ({ content: [{ type: "text", text }], structuredContent: data });
    if (!this.specMode.enabled()) return fail("SPEC_MODE_DISABLED", "Spec 模式未开启，需本地用户在设置中开启 opencode.bridge.specMode。");
    try { validateToolInput(SPEC_MODE_TOOL.name, SPEC_MODE_TOOL.inputSchema, args ?? {}); }
    catch (error) { return fail("INVALID_ARGUMENTS", error instanceof Error ? error.message : String(error)); }
    const root = this.shadowCheckpointRoot();
    if (!root) return fail("NO_WORKSPACE", "没有可用的工作区根目录。");
    const owner = extra.taskOwnerId ?? extra.commandOwnerId;
    const taskId = this.taskStore.currentByOwner?.get(owner) ?? null;
    const task = taskId ? this.taskStore.tasks?.get(taskId) : null;
    if (!task) return fail("NO_TASK", "请先用 set_todos(new_task=true) 建立任务卡，再写 Spec。");
    try {
      const applies = await this.specMode.applies(root, task);
      let state = await this.syncSpecReview(root, task, await this.specMode.readState(root, task.id));
      if (args.mode === "status") {
        return ok({ task_id: task.id, applies, spec_dir: this.specMode.taskDir(root, task.id), pending_stage: this.specMode.pendingStage(state), ...state },
          `${applies ? "" : "本任务卡创建于 Spec 模式开启之前，不受门禁约束（仍可自愿提交）。\n"}${this.specStatusText(root, state)}`);
      }
      if (!args.stage || !args.content) return fail("SPEC_STAGE_REQUIRED", "submit 需要 stage 与 content。");
      const label = SPEC_STAGE_LABELS[args.stage];
      const written = await this.specMode.writeStage(root, task.id, args.stage, args.content, args.summary);
      const options = [
        { id: "approve", label: `通过${label}`, description: args.stage === "tasks" ? "三段全部通过后即可开始改代码。" : "进入下一段。" },
        { id: "revise", label: "需要修改", description: "请在自定义回答里写修改意见；AI 会修订后重新提交。" }
      ];
      if (args.stage === "requirements") options.push({ id: "skip", label: "本任务跳过 Spec", description: "小改动不需要三段评审时选这个，直接放开改代码。" });
      let asked;
      try {
        asked = this.taskStore.askQuestion(owner, { question: `[Spec · ${label}] 请评审第 ${written.revision} 版${label}：${written.file}${args.summary ? `\n摘要：${args.summary}` : ""}`.slice(0, 1000),
          options, recommended_option_id: "approve", allow_custom: true });
      } catch (error) { return fail("SPEC_REVIEW_UNAVAILABLE", `规格已写入 ${written.file}，但无法在任务卡上请求评审（${error?.message ?? error}）。`); }
      this.revision_ += 1;
      const fresh = await this.specMode.readState(root, task.id);
      fresh.stages[args.stage] = { ...fresh.stages[args.stage], question_id: asked.question.id };
      await this.specMode.writeState(root, task.id, fresh);
      const stopElicit = this.startElicitation?.(extra, asked.task, [asked.question]);
      let answer;
      try { answer = await this.taskStore.waitForQuestion(asked.task.id, asked.question.id, { signal: extra.signal, timeoutMs: 30 * 60 * 1e3 }); }
      finally { stopElicit?.(); }
      if (answer.status !== "answered") return fail("SPEC_REVIEW_PENDING", `「${label}」已写入 ${written.file} 并在任务卡上等待评审（question_id=${asked.question.id}）。用 bridge_ask_user(mode=check, task_id=${asked.task.id}, question_id=${asked.question.id}) 取得回答后，再调用 bridge_spec(mode=status) 查看结果。`, { task_id: asked.task.id, question_id: asked.question.id, stage: args.stage });
      this.taskStore.markAnswersDelivered(owner, asked.task.id, [asked.question.id]);
      this.revision_ += 1;
      state = await this.syncSpecReview(root, task, await this.specMode.readState(root, task.id));
      const entry = state.stages[args.stage];
      const verdict = state.skipped ? "用户选择本任务跳过 Spec，门禁已放开。" : entry.status === "approved" ? `「${label}」已通过。` : `用户要求修改「${label}」：${entry.feedback || "（未写具体意见，请向用户确认）"}`;
      return ok({ task_id: task.id, stage: args.stage, decision: state.skipped ? "skip" : entry.status, feedback: entry.feedback ?? null, pending_stage: this.specMode.pendingStage(state), ...state }, `${verdict}\n${this.specStatusText(root, state)}`);
    } catch (error) {
      return fail(error?.code || "SPEC_FAILED", error?.message || String(error));
    }
  }

  /** 建议7：bridge_checkpoints 工具。restore 必须经本地任务卡（或已开启的 elicitation 表单）由用户确认。 */
  async handleShadowCheckpointTool(args, extra) {
    const fail = (code, message) => ({ isError: true, content: [{ type: "text", text: message }], structuredContent: { error: { code, message } } });
    const ok = (data, text) => ({ content: [{ type: "text", text }], structuredContent: data });
    if (!this.shadowCheckpoints.enabled()) return fail("CHECKPOINTS_DISABLED", "工作区检查点未开启，需本地用户在设置中开启 opencode.bridge.checkpoints。");
    try { validateToolInput(SHADOW_CHECKPOINT_TOOL.name, SHADOW_CHECKPOINT_TOOL.inputSchema, args ?? {}); }
    catch (error) { return fail("INVALID_ARGUMENTS", error instanceof Error ? error.message : String(error)); }
    const root = this.shadowCheckpointRoot();
    if (!root) return fail("NO_WORKSPACE", "没有可用的工作区根目录。");
    const owner = extra.taskOwnerId ?? extra.commandOwnerId;
    const taskId = this.taskStore.currentByOwner?.get(owner) ?? null;
    try {
      if (args.mode === "list") {
        const items = await this.shadowCheckpoints.list(root, { taskId: args.task_id, limit: args.limit ?? 50 });
        return ok({ workspace: root, checkpoints: items }, items.length
          ? items.map((e) => `${String(e.checkpoint).slice(0, 12)}  ${e.at}  ${e.task_id ? "task " + String(e.task_id).slice(0, 8) + "  " : ""}${e.label}`).join("\n")
          : "还没有检查点。");
      }
      if (!args.checkpoint) return fail("CHECKPOINT_REQUIRED", "restore / fork 需要 checkpoint。");
      if (args.mode === "fork") {
        const forked = await this.shadowCheckpoints.fork(root, args.checkpoint, args.name);
        return ok(forked, `已把检查点 ${forked.checkpoint.slice(0, 12)} 检出到 ${forked.path}（分支 ${forked.branch}），工作区未改动。`);
      }
      let asked;
      try {
        asked = this.taskStore.askQuestion(owner, { question: `[检查点回滚] 是否把工作区 ${root} 回滚到检查点 ${args.checkpoint}？回滚前会自动保存当前状态（可再回滚）；命令对工作区外造成的副作用不会恢复。`.slice(0, 1000),
          options: [{ id: "restore", label: "回滚" }, { id: "keep", label: "不回滚" }], recommended_option_id: "keep", allow_custom: false });
      } catch (error) { return fail("CHECKPOINT_APPROVAL_UNAVAILABLE", `无法在任务卡上请求确认（${error?.message ?? error}），未回滚。`); }
      this.revision_ += 1;
      const stopElicit = this.startElicitation(extra, asked.task, [asked.question]);
      let answer;
      try { answer = await this.taskStore.waitForQuestion(asked.task.id, asked.question.id, { signal: extra.signal, timeoutMs: 10 * 60 * 1e3 }); }
      finally { stopElicit?.(); }
      if (answer.status !== "answered") return fail("CHECKPOINT_APPROVAL_PENDING", `用户尚未确认（question_id=${asked.question.id}），未回滚。用 bridge_ask_user(mode=check) 查询后再重试。`);
      this.taskStore.markAnswersDelivered(owner, asked.task.id, [asked.question.id]);
      if (answer.answer?.optionId !== "restore") return fail("CHECKPOINT_RESTORE_DECLINED", "用户选择不回滚。");
      const restored = await this.shadowCheckpoints.restore(root, args.checkpoint, { taskId, owner });
      this.revision_ += 1;
      return ok(restored, `已回滚到 ${restored.restored_to.slice(0, 12)}，涉及 ${restored.files_changed} 个文件；回滚前状态已存为 ${String(restored.saved_before_restore).slice(0, 12)}。`);
    } catch (error) {
      return fail(error?.code || "CHECKPOINT_FAILED", error?.message || String(error));
    }
  }
  describeTaskOwner(owner) {
    const task = this.taskStore.tasks?.get(this.taskStore.currentByOwner?.get(owner) ?? "");
    if (!task) return null;
    const pub = this.taskStore.publicTask(task);
    return { title: pub.title, state: pub.state };
  }
  async handleToolCallTracked(rawToolName, args, extra) {
    const resolvedToolName = resolveBridgeToolName(rawToolName, (name) => BRIDGE_TOOL_DEFINITIONS.some(tool => tool.name === name) || name === SET_TODOS_TOOL.name || name === UPDATE_PLAN_TOOL.name || name === REPORT_PROGRESS_TOOL.name || isFileToolName(name) || isFileToolCompatibilityAlias(name) || !BRIDGE_EXCLUDED_TOOL_NAMES.has(name) && getIdeToolDefinition(name) !== void 0 || name === CONFIGURE_MCP_TOOL.name || name === SHADOW_CHECKPOINT_TOOL.name || name === SPEC_MODE_TOOL.name || this.findCustomToolSafe(name) !== void 0 || this.deps.externalMcp?.hasBinding(name) === true || this.deps.nativeRea?.hasBinding(name) === true);
    const toolName = rawToolName.startsWith("ext__") && !this.findCustomToolSafe(rawToolName) && !this.deps.externalMcp?.hasBinding(rawToolName) ? rawToolName : normalizeFileToolName(resolvedToolName);
    const taskOwnerId = extra.taskOwnerId ?? extra.commandOwnerId;
    if (this.taskStore.isOwnerHandedOff?.(taskOwnerId) && !new Set([SET_TODOS_TOOL.name, UPDATE_PLAN_TOOL.name, REPORT_PROGRESS_TOOL.name, "start", "bridge_get_effective_rules", "bridge_acknowledge_rules", "cancel_command"]).has(toolName)) {
      return { isError: true, content: [{ type: "text", text: "TASK_HANDED_OFF: 此对话的任务已被新对话接班，本对话的执行已中断。请停止继续操作并向用户说明；新工作用 set_todos new_task=true 开始。" }], structuredContent: { error: { code: "TASK_HANDED_OFF", message: "TASK_HANDED_OFF: 此对话的任务已被新对话接班，本对话的执行已中断。请停止继续操作并向用户说明；新工作用 set_todos new_task=true 开始。" } } };
    }
    const waiting = this.taskStore.outstandingForOwner(taskOwnerId);
    // Owner-scoped, server-side fail-closed gate. Only checking user answers,
    // communicating wait status, reading rules and cancelling unsafe commands remain available.
    const waitingExceptions = new Set(["bridge_ask_user", "report_progress",
      "start", "bridge_get_effective_rules", "bridge_acknowledge_rules", "cancel_command"]);
    if (waiting && !waitingExceptions.has(toolName)) {
      const message = `WAITING_FOR_USER_ANSWERS: 本任务有 ${waiting.pending} 道未回答、${waiting.undelivered} 道尚未经 MCP 回传的决策。全部回答并通过 bridge_ask_user(mode=check, task_id=${waiting.taskId}, ${waiting.batchId ? `batch_id=${waiting.batchId}` : `question_id=${waiting.questionId}`}) 取得 status=answered 后才允许继续；当前工具 ${toolName} 已拒绝执行。`;
      return { isError: true, content: [{ type: "text", text: message }],
        structuredContent: { error: { code: "WAITING_FOR_USER_ANSWERS", message }, task_id: waiting.taskId,
          pending: waiting.pending, undelivered: waiting.undelivered } };
    }
    const publicDefinition = BRIDGE_TOOL_DEFINITIONS.find((tool) => tool.name === toolName) ?? this.deps.nativeRea?.definition(toolName);
    if (toolName === BRIDGE_BATCH_TOOL.name) {
      return this.handleBatchToolCall(args, extra);
    }
    if (toolName === SHADOW_CHECKPOINT_TOOL.name) {
      return this.handleShadowCheckpointTool(args, extra);
    }
    if (toolName === SPEC_MODE_TOOL.name) {
      return this.handleSpecModeTool(args, extra);
    }
    {
      const specBlocked = await this.specModeGate(toolName, taskOwnerId);
      if (specBlocked) return specBlocked;
    }
    if (toolName === SET_TODOS_TOOL.name || toolName === UPDATE_PLAN_TOOL.name || toolName === REPORT_PROGRESS_TOOL.name || toolName === "bridge_ask_user") {
      if (publicDefinition) {
        try {
          validateToolInput(publicDefinition.name, publicDefinition.inputSchema, args);
        } catch (error2) {
          return {
            isError: true,
            content: [{ type: "text", text: error2 instanceof Error ? error2.message : String(error2) }]
          };
        }
      }
      try {
        const taskOwnerId = extra.taskOwnerId ?? extra.commandOwnerId;
        if (taskOwnerId !== extra.commandOwnerId) this.rememberTaskCommandOwner(taskOwnerId, extra.commandOwnerId);
        if (toolName === SET_TODOS_TOOL.name) {
          return this.handleSetTodos(args, taskOwnerId);
        }
        if (toolName === "bridge_ask_user") {
          const input = { ...args ?? {} };
          const existing = input.mode === "check";
          if (existing && !input.batch_id && !input.question_id) {
            // A check without an id resolves to this owner's outstanding question or batch.
            const waitingAsk = this.taskStore.outstandingForOwner(taskOwnerId);
            if (waitingAsk) {
              if (!input.task_id) input.task_id = waitingAsk.taskId;
              if (waitingAsk.batchId) input.batch_id = waitingAsk.batchId;
              else input.question_id = waitingAsk.questionId;
            }
          }
          if (!existing && (input.questions !== void 0 || input.question !== void 0)) {
            // Ask mode never targets an existing id; ignore a stray question_id/batch_id instead of failing.
            delete input.question_id;
            delete input.batch_id;
          }
          if (existing && (input.questions !== void 0 || input.question !== void 0 || input.options !== void 0)) {
            throw new Error("check 模式只能传入 task_id + batch_id 或 question_id，不能再次提交问题。");
          }
          if (existing && Boolean(input.batch_id) === Boolean(input.question_id)) {
            throw new Error("check 模式须且仅须指定 batch_id 或 question_id。");
          }
          if (!existing && (input.batch_id !== void 0 || input.question_id !== void 0 ||
              (input.questions !== void 0 && (input.question !== void 0 || input.options !== void 0)))) {
            throw new Error("ask 模式请提交 questions 数组或单题 question/options，不能混合两种形式或指定现有问题编号。");
          }
          if (input.questions !== void 0 || input.batch_id !== void 0) {
            const submitted = existing ? { task: this.taskStore.resolve(taskOwnerId, input), batchId: input.batch_id }
              : this.taskStore.askQuestions(taskOwnerId, input);
            if (!submitted.task || !submitted.batchId) throw new Error("找不到当前会话的批量提问。");
            if (!existing) this.revision_++;
            // Keep the original MCP request open and poll the saved answers every
            // 3 seconds. Do not return a premature pending result after 90 seconds:
            // many assistants finish their turn and will never call check again.
            const stopBatchElicit = input.wait_seconds === 0 ? null : this.startElicitation(extra, submitted.task,
              (submitted.task.questions ?? []).filter((q) => q.batchId === submitted.batchId && q.status === "pending"));
            let result;
            try {
              result = input.wait_seconds === 0 ? this.taskStore.batchStatus(submitted.task.id, submitted.batchId)
                : await this.taskStore.waitForBatch(submitted.task.id, submitted.batchId, {
                    signal: extra.signal,
                    ...input.wait_seconds !== void 0 ? { timeoutMs: input.wait_seconds * 1e3 } : {}
                  });
            } finally { stopBatchElicit?.(); }
            if (result.status === "answered") { this.taskStore.markAnswersDelivered(taskOwnerId, submitted.task.id, result.questions.map((q) => q.question_id)); this.resetStepBudget(extra.commandOwnerId); }
            return { structuredContent: { task_id: submitted.task.id, ...result }, content: [{ type: "text",
              text: result.status === "answered"
                ? `用户已经确认全部 ${result.total} 项需求：${result.questions.map((q, i) => `${i + 1}. ${q.question} → ${q.answer.text}`).join("；")}。请按照实际回答推进，勿将建议视为授权。`
                : `批量提问 ${result.answered}/${result.total} 项已回答，尚未全部确定。batch_id=${result.batch_id}。使用 bridge_ask_user 的 check 模式查询，不能擅自代答或先实施依赖未决项的修改。` }] };
          }
          const { task, question } = existing
            ? { task: this.taskStore.resolve(taskOwnerId, input), question: this.taskStore.resolve(taskOwnerId, input)?.questions?.find((item) => item.id === input.question_id) }
            : this.taskStore.askQuestion(taskOwnerId, input);
          if (!task || !question) throw new Error("找不到当前会话的提问，请使用有效的 task_id / question_id。");
          if (!existing) this.revision_++;
          const stopElicit = question.status !== "pending" || input.wait_seconds === 0 ? null : this.startElicitation(extra, task, [question]);
          let result;
          try {
            result = question.status === "answered" ? { status: "answered", answer: question.answer }
              : input.wait_seconds === 0 ? { status: "pending", question_id: question.id }
              : await this.taskStore.waitForQuestion(task.id, question.id, {
                  signal: extra.signal,
                  ...input.wait_seconds !== void 0 ? { timeoutMs: input.wait_seconds * 1e3 } : {}
                });
          } finally { stopElicit?.(); }
          if (result.status === "answered") { this.taskStore.markAnswersDelivered(taskOwnerId, task.id, [question.id]); this.resetStepBudget(extra.commandOwnerId); }
          return { structuredContent: { task_id: task.id, question_id: question.id, ...result },
            content: [{ type: "text", text: result.status === "answered"
              ? `用户已在任务板回答：${result.answer.text}。请继续按回答收敛需求；该回答不等于额外操作授权。`
              : `问题已在当前任务板显示，等待用户回答。下次使用 bridge_ask_user 的 check 模式查询，禁止猜测。question_id=${question.id}` }] };
        }
        if (toolName === UPDATE_PLAN_TOOL.name) {
          return this.handleUpdatePlan(args, taskOwnerId);
        }
        return this.handleReportProgress(args, taskOwnerId);
      } catch (error2) {
        return {
          isError: true,
          content: [{ type: "text", text: error2 instanceof Error ? error2.message : String(error2) }]
        };
      }
    }
    const automation=extra.automationContext||this.deps.automation;
    const sensitiveStaff=toolName==='bridge_join_employee';
    const externalBinding = this.deps.externalMcp?.hasBinding(toolName) === true && !this.findCustomToolSafe(toolName);
    const nativeBinding = this.deps.nativeRea?.hasBinding(toolName) === true;
    const activityArgs = externalBinding||nativeBinding||sensitiveStaff ? {} : toolName === CONFIGURE_MCP_TOOL.name ? configureMcpActivityArgs(args) : args;
    const activityId = this.pushActivity({
      taskId: this.taskStore.forProgress(taskOwnerId, {})?.id,
      tool: toolName,
      status: "running",
      // Upstream input may include credentials or user data. Do not retain it in activity history.
      presentation: bridgePresentation(toolName, externalBinding||nativeBinding||sensitiveStaff ? {} : args)
    });
    const startedAt = Date.now();
    let localRulesGuardFailed = false;
    try {
      let presentationArgs = sensitiveStaff?{}:args;
      if (isFileToolName(toolName)) {
        try {
          presentationArgs = normalizeFileToolInput(toolName, args);
        } catch {
          presentationArgs = args;
        }
      } else if (publicDefinition) {
        validateToolInput(publicDefinition.name, publicDefinition.inputSchema, args);
      }
      if (automation?.hasTool(toolName)) {
        const result = await automation.handleTool(toolName, args, extra.commandOwnerId, { signal: extra.signal });
        this.finishActivity(activityId, result.isError ? 'error' : 'completed', Date.now() - startedAt, void 0,
          bridgePresentation(toolName, sensitiveStaff?{}:args, '规则或协作请求已处理', void 0, result.isError));
        return result;
      }
      try {
        await this.guardWithPolicyAsk(automation, toolName, args, extra, taskOwnerId);
      } catch (error) {
        localRulesGuardFailed = true;
        this.notePolicyDenied(error, toolName, taskOwnerId);
        throw error;
      }
      if (nativeBinding) {
        if (extra.commandOwnerId === NATIVE_MANAGED_COMMAND_OWNER_ID) throw new Error('REA_OWNER_REQUIRED: a dialogue-scoped caller identity is required; no shared fallback session was used.');
        const result = await this.deps.nativeRea.call(toolName, args, extra.signal, extra.commandOwnerId, message => this.deps.log('[rea-native] ' + String(message).slice(0, 500)));
        this.finishActivity(activityId, result.isError ? 'error' : 'completed', Date.now() - startedAt, void 0,
          bridgePresentation(toolName, {}, result.isError ? 'REA后端返回错误。' : 'REA后端调用完成。', void 0, result.isError));
        return result;
      }
      if (isFileToolName(toolName)) {
        const result = await invokeFileTool(toolName, args, {
          // Lazy on purpose: resolving it here would throw before the registry could envelope it.
          workspaceRoots: () => { const roots = this.deps.fileToolRoots ? this.deps.fileToolRoots(toolName) : this.deps.workspaceRoots(); return automation?.collaboration?.fileToolRoots(extra.commandOwnerId, roots) || roots; },
          signal: extra.signal
        });
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? result.text : void 0,
          bridgePresentation(
            toolName,
            presentationArgs,
            result.text,
            result.structuredContent,
            result.isError
          )
        );
        return {
          isError: result.isError || void 0,
          content: result.content ?? [{ type: "text", text: result.text }],
          structuredContent: result.structuredContent
        };
      }
      if (toolName === CODEBASE_SEARCH_TOOL.name) {
        const root = this.shadowCheckpointRoot();
        let result;
        if (!root) result = { isError: true, content: [{ type: "text", text: "代码库检索需要先打开工作区文件夹。" }] };
        else {
          globalThis.__ocCodebaseIndex ??= new CodebaseIndex();
          const out = await globalThis.__ocCodebaseIndex.search(root, args ?? {});
          result = { content: [{ type: "text", text: formatCodebaseSearch(out, root) }], structuredContent: { root, files: out.files, terms: out.terms, results: out.results.map((r) => ({ path: r.rel, start_line: r.start, end_line: r.end, score: r.score })) } };
        }
        this.finishActivity(activityId, result.isError ? "error" : "completed", Date.now() - startedAt, result.isError ? result.content[0].text : void 0, bridgePresentation(toolName, args, result.content[0].text, result.structuredContent, !!result.isError));
        return result;
      }
      if (CANVAS_CHAT_TOOL_NAMES.has(toolName)) {
        let result;
        try { result = await canvasConsole.handleChatTool(toolName, args ?? {}, { owner: taskOwnerId, actor: ocActorFromExtra(extra), ref: extra?.cardRef, signal: extra.signal }); }
        catch (error) { result = { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }] }; }
        this.finishActivity(activityId, result.isError ? "error" : "completed", Date.now() - startedAt, result.isError ? result.content?.[0]?.text : void 0, bridgePresentation(toolName, args, result.content?.[0]?.text || "", result.structuredContent, !!result.isError));
        return result;
      }
      if (toolName === SESSION_SEARCH_TOOL.name) {
        const result = searchSessions(this.taskStore, args);
        this.finishActivity(activityId, "completed", Date.now() - startedAt, void 0, bridgePresentation(toolName, args, result.content[0].text, result.structuredContent, false));
        return result;
      }
      if (toolName === LIST_SKILLS_TOOL.name) {
        const { result, text: text2 } = this.handleListSkills();
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? text2 : void 0,
          bridgePresentation(LIST_SKILLS_TOOL.name, args, text2, result.structuredContent, result.isError)
        );
        return result;
      }
      if (toolName === CONFIGURE_MCP_TOOL.name) {
        if (!this.deps.configureMcp) throw new Error("MCP configuration is unavailable in this session.");
        if (this.deps.isWorkspaceTrusted?.() === false) throw new Error("\u53D7\u9650\u6A21\u5F0F\u4E0B\u4E0D\u80FD\u914D\u7F6E MCP\uFF0C\u8BF7\u5148\u4FE1\u4EFB\u5DE5\u4F5C\u533A\u3002");
        const action = typeof args.action === "string" ? args.action : "";
        const result = await runConfigureMcp(action, args, this.deps.configureMcp);
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? result.text : void 0,
          bridgePresentation(toolName, activityArgs, result.text, result.structuredContent, result.isError)
        );
        return {
          isError: result.isError || void 0,
          content: [{ type: "text", text: result.text }],
          structuredContent: result.structuredContent
        };
      }
      const customTool = this.findCustomToolSafe(toolName);
      if (customTool) {
        if (this.deps.isWorkspaceTrusted?.() === false) throw new Error("\u53D7\u9650\u6A21\u5F0F\u4E0B\u4E0D\u80FD\u6267\u884C Skill / \u81EA\u5B9A\u4E49\u5DE5\u5177\uFF0C\u8BF7\u5148\u4FE1\u4EFB\u5DE5\u4F5C\u533A\u3002");
        validateToolInput(customTool.name, customTool.inputSchema, args);
        const result = await executeCustomTool(this.deps.workspaceRoots(), customTool, args, {
          signal: extra.signal,
          log: (message2) => this.deps.log(message2)
        });
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? result.text : void 0,
          bridgePresentation(toolName, args, result.text, result.structuredContent, result.isError)
        );
        return {
          isError: result.isError || void 0,
          content: [{ type: "text", text: result.text }],
          structuredContent: result.structuredContent
        };
      }
      if (externalBinding) {
        if (this.deps.isWorkspaceTrusted?.() === false) throw new Error("\u53D7\u9650\u6A21\u5F0F\u4E0B\u4E0D\u80FD\u8C03\u7528\u5916\u90E8 MCP\u3002");
        const result = await this.deps.externalMcp.call(toolName, args, extra.signal, extra.commandOwnerId);
        if (!result) throw new Error(`Unknown external MCP tool: ${toolName}`);
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? "\u4E0A\u6E38\u5DE5\u5177\u8FD4\u56DE\u9519\u8BEF\u3002" : void 0,
          bridgePresentation(toolName, {}, result.isError ? "\u4E0A\u6E38\u5DE5\u5177\u8FD4\u56DE\u9519\u8BEF\u3002" : "\u8C03\u7528\u5DF2\u5B8C\u6210\u3002", void 0, result.isError)
        );
        return { content: result.content, isError: result.isError, structuredContent: result.structuredContent, ...(result._meta?{_meta:result._meta}:{}) };
      }
      if (BRIDGE_EXCLUDED_TOOL_NAMES.has(toolName)) {
        throw new Error(`The ${toolName} tool is not available in Bridge mode.`);
      }
      const definition = getIdeToolDefinition(toolName);
      if (definition) {
        const result = await this.deps.invokeIdeTool(
          toolName,
          asRecord3(args),
          extra.signal,
          extra.commandOwnerId
        );
        const structuredContent = result.structuredContent ?? (result.isError ? { error: result.text } : ideToolStructuredContent(toolName, result.text));
        this.finishActivity(
          activityId,
          result.isError ? "error" : "completed",
          Date.now() - startedAt,
          result.isError ? result.text : void 0,
          bridgePresentation(toolName, args, result.text, structuredContent, result.isError)
        );
        return {
          isError: result.isError || void 0,
          content: [{ type: "text", text: result.text }],
          structuredContent
        };
      }
      throw new Error(toolName === rawToolName ? `Unknown Bridge tool: ${toolName}` : `Unknown Bridge tool: ${rawToolName} (after stripping MCP server prefix: ${toolName})`);
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      // Only a local pre-dispatch rules error may bypass upstream error redaction.
      const redactExternal = externalBinding && !(localRulesGuardFailed && ['RULES_ACK_REQUIRED','RULES_STALE'].includes(error2?.code));
      const safeMessage = redactExternal ? "\u5916\u90E8 MCP \u8C03\u7528\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u72B6\u6001\u5E76\u91CD\u8BD5\u3002" : message2;
      this.finishActivity(
        activityId,
        "error",
        Date.now() - startedAt,
        safeMessage,
        bridgePresentation(toolName, externalBinding ? {} : args, safeMessage, void 0, true)
      );
      return {
        isError: true,
        content: [{ type: "text", text: safeMessage }],
        ...!redactExternal && error2?.details ? { structuredContent: { error: { code: error2.code, message: safeMessage }, ...error2.details } } : {}
      };
    }
  }
  async handleBatchToolCall(value, extra) {
    const startedAt = Date.now();
    try {
      validateToolInput(BRIDGE_BATCH_TOOL.name, BRIDGE_BATCH_TOOL.inputSchema, value);
    } catch (error2) {
      const msg = error2 instanceof Error ? error2.message : String(error2);
      return { isError: true, content: [{ type: "text", text: msg }] };
    }
    const calls = Array.isArray(value?.calls) ? value.calls : [];
    const continueOnError = value?.continue_on_error === true;
    const parallelReadonly = value?.parallel_readonly === true;
    const readonlyBatchable = new Set(["read_files", "read_file", "read_image", "find_files", "search_files", "list_directory", "get_diagnostics", "list_skills", "bridge_get_effective_rules"]);
    for (let i = 0; i < calls.length; i++) {
      const item = calls[i];
      const rawSub = typeof item?.tool === "string" ? item.tool.trim() : "";
      const normSub = normalizeFileToolName(resolveBridgeToolName(rawSub, (n) => n === BRIDGE_BATCH_TOOL.name || n === "bridge_ask_user" || BRIDGE_TOOL_DEFINITIONS.some((t) => t.name === n)));
      if (normSub === BRIDGE_BATCH_TOOL.name) {
        return { isError: true, content: [{ type: "text", text: `bridge_batch 第 ${i + 1} 项禁止递归调用 bridge_batch。` }] };
      }
      if (normSub === "bridge_ask_user" && item?.arguments?.mode !== "check") {
        return { isError: true, content: [{ type: "text", text: `bridge_batch 第 ${i + 1} 项禁止内嵌阻塞式 bridge_ask_user(mode=ask)；请单独调用提问工具。` }] };
      }
    }
    const activityId = this.pushActivity({
      tool: BRIDGE_BATCH_TOOL.name,
      status: "running",
      presentation: bridgePresentation(BRIDGE_BATCH_TOOL.name, { count: calls.length, continue_on_error: continueOnError, parallel_readonly: parallelReadonly })
    });
    const results = [];
    let stoppedEarly = false;
    let stoppedAtIndex = null;
    const packItem = (idx, item, res) => {
      const textParts = Array.isArray(res?.content) ? res.content.filter((c) => c && c.type === "text" && typeof c.text === "string").map((c) => c.text) : [];
      const textOut = textParts.join("\n");
      return {
        index: idx,
        ...(item?.id ? { id: item.id } : {}),
        tool: item.tool,
        isError: Boolean(res?.isError),
        ...(res?.structuredContent !== void 0 ? { structuredContent: res.structuredContent } : {}),
        text: textOut
      };
    };
    try {
      let idx = 0;
      while (idx < calls.length) {
        if (extra.signal?.aborted) throw new Error("bridge_batch 调用已取消。");
        const cur = calls[idx];
        const curNorm = normalizeFileToolName(resolveBridgeToolName(cur.tool, (n) => readonlyBatchable.has(n)));
        if (parallelReadonly && readonlyBatchable.has(curNorm)) {
          const group = [];
          while (idx < calls.length) {
            const cand = calls[idx];
            const candNorm = normalizeFileToolName(resolveBridgeToolName(cand.tool, (n) => readonlyBatchable.has(n)));
            if (!readonlyBatchable.has(candNorm)) break;
            group.push({ idx, item: cand });
            idx++;
          }
          const groupOut = await Promise.all(group.map(({ idx: gIdx, item: gItem }) =>
            this.dispatch(gItem.tool, gItem.arguments ?? {}, { ...extra, _batchSubCall: true }).then((res) => packItem(gIdx, gItem, res))
          ));
          let groupFailed = false;
          for (const entry of groupOut) {
            results.push(entry);
            if (entry.isError && !continueOnError) {
              stoppedEarly = true;
              stoppedAtIndex = entry.index;
              groupFailed = true;
              break;
            }
          }
          if (groupFailed) break;
          continue;
        }
        const res = await this.dispatch(cur.tool, cur.arguments ?? {}, { ...extra, _batchSubCall: true });
        const packed = packItem(idx, cur, res);
        results.push(packed);
        if (packed.isError && !continueOnError) {
          stoppedEarly = true;
          stoppedAtIndex = idx;
          break;
        }
        idx++;
      }
      const failed = results.filter((r) => r.isError).length;
      const succeeded = results.length - failed;
      const stepInfo = extra?._stepBudget ?? this.snapshotStepBudget(extra?.commandOwnerId);
      const stepTag = stepInfo ? ` [段步数预算: 估算宿主步 #${stepInfo.estimated_host_steps}/100 · MCP顶层调用 #${stepInfo.segment_mcp_calls}]` : "";
      const summaryText = `bridge_batch 已完成 ${results.length}/${calls.length} 项（成功 ${succeeded}，失败 ${failed}${stoppedEarly ? `，在第 ${stoppedAtIndex + 1} 项停止` : ""}）。${stepTag}`;
      const structuredContent = {
        total_requested: calls.length,
        executed: results.length,
        succeeded,
        failed,
        stopped_early: stoppedEarly,
        ...(stoppedAtIndex !== null ? { stopped_at_index: stoppedAtIndex } : {}),
        ...(stepInfo ? { step_budget: stepInfo } : {}),
        results
      };
      const detailBlocks = results.map((r) => `=== [${r.index + 1}/${calls.length}] ${r.tool}${r.id ? ` (${r.id})` : ""} [${r.isError ? "ERROR" : "OK"}] ===\n${r.text}`);
      const headerBlocks = stepInfo?.warning ? [stepInfo.warning, summaryText] : [summaryText];
      const fullText = [...headerBlocks, ...detailBlocks].join("\n\n");
      this.finishActivity(activityId, failed > 0 && stoppedEarly ? "error" : "completed", Date.now() - startedAt, failed > 0 ? summaryText : void 0,
        bridgePresentation(BRIDGE_BATCH_TOOL.name, { count: calls.length }, summaryText, structuredContent, failed > 0 && stoppedEarly));
      return {
        isError: failed > 0 && stoppedEarly ? true : void 0,
        _stepBudgetEmbedded: true,
        content: [{ type: "text", text: fullText }],
        structuredContent
      };
    } catch (error2) {
      const msg = error2 instanceof Error ? error2.message : String(error2);
      this.finishActivity(activityId, "error", Date.now() - startedAt, msg, bridgePresentation(BRIDGE_BATCH_TOOL.name, { count: calls.length }, msg, void 0, true));
      return { isError: true, content: [{ type: "text", text: msg }] };
    }
  }
  /** list_skills: read-only, no arguments, no side effects; returns the AI-facing listing. */
  handleListSkills() {
    let listing;
    try {
      if (!this.deps.listSkills) throw new Error("Skill discovery is unavailable; catalog provider is not initialized.");
      listing = this.deps.listSkills();
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      return { text: message2, result: { isError: true, content: [{ type: "text", text: message2 }] } };
    }
    const text2 = formatSkillListing(listing);
    return {
      text: text2,
      result: {
        content: [{ type: "text", text: text2 }],
        structuredContent: { directory: listing.directory, enabled: listing.enabled, skills: listing.skills }
      }
    };
  }
  handleReportProgress(value, commandOwnerId) {
    const task = this.taskStore.forProgress(commandOwnerId, value);
    const linkableTodos = task?.todos ?? [];
    const { message: message2, phase, percent, linkedTodo } = parseBridgeProgress(value, linkableTodos);
    if (task) this.taskStore.touch(task.id);
    if (task) this.taskStore.recordProgress(commandOwnerId, task.id, linkedTodo?.id, { message: message2, phase, percent });
    if (task && message2) this.deps.automation?.recordProgressNote?.({ owner: commandOwnerId, task, todoTitle: linkedTodo?.title, phase, message: message2 });
    this.pushActivity({
      taskId: task?.id,
      tool: REPORT_PROGRESS_TOOL.name,
      status: "progress",
      message: message2,
      phase,
      percent,
      todoId: linkedTodo?.id,
      todoTitle: linkedTodo?.title
    });
    this.deps.log(`[bridge-progress]${linkedTodo ? ` [${linkedTodo.id}]` : ""}${phase ? ` ${phase}:` : ""} ${message2}${percent !== void 0 ? ` (${percent}%)` : ""}`);
    return { structuredContent: { message: message2, ...phase !== void 0 ? { phase } : {}, ...percent !== void 0 ? { percent } : {}, ...linkedTodo ? { todo_id: linkedTodo.id } : {} }, content: [{ type: "text", text: linkedTodo ? `\u5DF2\u5411 OpenCode \u4E0A\u62A5\u6B65\u9AA4 ${linkedTodo.id} \u7684\u8FDB\u5EA6\u3002` : "\u5DF2\u5411 OpenCode \u4E0A\u62A5\u8FDB\u5EA6\u3002" }] };
  }
  handleSetTodos(value, taskOwnerId) {
    return this.storeTodos(parseBridgeTodos(value, MAX_TODOS), taskOwnerId, SET_TODOS_TOOL.name, value);
  }
  handleUpdatePlan(value, taskOwnerId) {
    return this.storeTodos(parseBridgePlan(value, MAX_TODOS), taskOwnerId, UPDATE_PLAN_TOOL.name, value);
  }
  storeTodos(nextTodos, taskOwnerId, sourceTool, value) {
    if (sourceTool === UPDATE_PLAN_TOOL.name && asRecord3(value).mode === "patch") throw new Error("update_plan uses positional IDs and only supports replace; use set_todos with stable IDs for patches.");
    const task = this.taskStore.update(taskOwnerId, nextTodos, value);
    const autoRevisionNote = this.taskStore.takeAutoRevisionNote?.(taskOwnerId);
    if (task) this.taskStore.noteSeen?.(taskOwnerId, task);
    // publicTask carries only a short tag; external owners always get their full dialogue identity back.
    const overviewSessionIdAck = task && !String(taskOwnerId).startsWith("native-chat:") ? this.taskStore.overviewSessionIdFor?.(task.id, taskOwnerId) : void 0;
    this.revision_ += 1;
    // Rules ACK is only required again when the rules_hash changed since this caller last acknowledged it.
    const ackState = this.deps.automation?.rulesAckState?.(this.taskCommandOwners.get(taskOwnerId) ?? taskOwnerId);
    if (task) {
      this.deps.automation?.recordAutoHandoff?.({ owner: taskOwnerId, task, source: sourceTool });
    }
    const taskContract = {
      task_protocol: "task-lifecycle-v1",
      ...task?.assistantSource?{source_identity:task.assistantSource}:{},
      ...this.deps.automation ? { rules_required: ackState ? !ackState.acknowledged : true, rules_ack_current: ackState?.acknowledged === true, ...ackState?.rules_hash ? { rules_hash: ackState.rules_hash } : {}, rules_read_tool: 'bridge_get_effective_rules', rules_ack_tool: 'bridge_acknowledge_rules', rules_workspace_id: this.deps.automation.currentWorkspaceId(), ...ackState?.acknowledged ? { rules_note: '规则哈希自上次确认后未变化，无需重新读取/确认。' } : {} } : {},
      ...autoRevisionNote ? { normalized: [autoRevisionNote] } : {},
      ...task ? { task_id: task.id, task_revision: task.revision, lifecycle: task.state, history: task.history, memory: task.memory, checkpoint_saved: !!task.memory, automatic_summary: "asynchronous_unverified" } : {},
      ...task?.overview ? { overview: task.overview } : {},
      ...overviewSessionIdAck ? { overview_session_id: overviewSessionIdAck } : {}
    };
    const todos = task?.todos ?? [];
    const completed = todos.filter((todo) => todo.status === "completed").length;
    const current = todos.find((todo) => todo.status === "in_progress");
    this.deps.log(`[bridge-todos] ${completed}/${todos.length} completed via ${sourceTool} \xB7 state: ${task?.state ?? "cleared"}`);
    const result = {
      structuredContent: sourceTool === UPDATE_PLAN_TOOL.name ? { plan: todos.map(({ title, status }) => ({ step: title, status })), ...taskContract } : { todos: todos.map((todo) => ({ ...todo })), ...taskContract },
      content: [{ type: "text", text: task ? `\u5DF2\u901A\u8FC7 ${sourceTool} \u66F4\u65B0 OpenCode \u4EFB\u52A1\u5361\uFF1A\u5DF2\u5B8C\u6210 ${completed}/${todos.length} \u6B65${current ? `\uFF1B\u5F53\u524D\u6B65\u9AA4 ${current.id}\uFF1A${current.title}` : ""}\u3002\u4EFB\u52A1\u7F16\u53F7\uFF1A${task.id}\uFF1B\u4FEE\u8BA2\u53F7\uFF1A${task.revision}\u3002\u4E0B\u6B21\u66F4\u65B0\u8BF7\u5E26 task_id \u4E0E expected_revision\uFF1B\u65B0\u4EFB\u52A1\u4F7F\u7528 new_task=true\u3002\u6700\u7EC8\u56DE\u590D\u524D\u987B\u63D0\u4EA4\u5E76\u786E\u8BA4\u7EC8\u6001\u4EFB\u52A1\u5361\uFF1B\u7A7A\u95F2\u4E0D\u7B49\u4E8E\u5B8C\u6210\u3002` : "\u5DF2\u6E05\u7A7A OpenCode \u4EFB\u52A1\u5361\u3002" }]
    };
    // task-card-multi-conv: lead with the task_id so stateless AIs keep it and attach it to every later call and to completion.
    if (task && !String(taskOwnerId).startsWith("native-chat:")) result.content[0].text = cardAckPrefix(task.id) + result.content[0].text;
    // Hand the fixed dialogue identity back so a reconnected or successor dialogue can keep using it.
    if (overviewSessionIdAck) result.content[0].text += `对话标识 overview_session_id：${overviewSessionIdAck}。之后每次 set_todos（含断线重连、重新接入、接班后）都带上这个值；同一对话的新任务会自动替换旧任务卡的显示。`;
    return result;
  }
  pushActivity(input) {
    if (!input.actor) { const actor = OC_ACTOR_STORE.getStore(); if (actor) input = { ...input, actor }; }
    const id = this.activityTracker.push(input);
    if (input.taskId) {
      this.taskActivityById.set(id, { taskId: input.taskId, tool: input.tool });
      this.taskStore.recordToolEvent(input.taskId, { id, tool: input.tool, status: input.status || "running", at: Date.now(), outcome: input.status === "progress" ? "reported_progress_only" : "unknown_until_receipt" });
    }
    this.revision_ += 1;
    return id;
  }
  finishActivity(id, status, durationMs, message2, presentation) {
    if (this.activityTracker.finish(id, status, durationMs, message2, presentation)) {
      const event = this.taskActivityById.get(id);
      if (event) {
        this.taskStore.recordToolEvent(event.taskId, { id, tool: event.tool, status, durationMs, at: Date.now(), outcome: "tool_receipt_only_process_state_not_inferred" });
        this.taskActivityById.delete(id);
      }
      this.revision_ += 1;
    }
  }
};
export { configureMcpActivityArgs, CONCURRENCY_EXEMPT_TOOLS, BridgeToolDispatcher };
