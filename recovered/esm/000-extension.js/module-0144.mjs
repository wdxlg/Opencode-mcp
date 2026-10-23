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
// A pending MCP call stays open; this interval checks for a complete answer
// without returning a premature `pending` result to the target AI.
var BRIDGE_QUESTION_POLL_MS = 3e3;
var copyTodos = (todos) => todos.map((t) => ({ ...t }));
var record2 = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
var isTerminal = (state) => state === "completed" || state === "cancelled" || state === "cleared";
var isActive = (state) => state === "running" || state === "waiting_plan";
var BridgeTaskStore = class {
  constructor(maxTodos, now = Date.now, _legacyMaxActiveTasks, maxHistory = 8) {
    this.maxTodos = maxTodos;
    this.now = now;
    this.maxHistory = maxHistory;
  }
  maxTodos;
  now;
  maxHistory;
  tasks = /* @__PURE__ */ new Map();
  currentByOwner = /* @__PURE__ */ new Map();
  /** Session hints are untrusted; namespace them by the authenticated task owner. */
  overviewBySession = /* @__PURE__ */ new Map();
  selectedId;
  persistenceFile;
  workspaceKey;
  questionWaiters = new Map();
  batchWaiters = new Map();
  /** Persist every task card in the extension's user-data directory, not in the Git workspace. */
  configurePersistence(dataDirectory, workspaceRoot) {
    if (!dataDirectory || !workspaceRoot) return;
    const key = crypto.createHash("sha256").update(path.resolve(workspaceRoot).replaceAll("\\", "/").toLowerCase()).digest("hex");
    const directory = path.join(dataDirectory, "bridge-task-history");
    fs.mkdirSync(directory, { recursive: true });
    const file = path.join(directory, key + ".json");
    if (!fs.existsSync(file)) {
      this.workspaceKey = key;this.persistenceFile = file;return;
    }
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    if (saved.format !== "opencode-bridge-tasks-v1" || saved.workspaceKey !== key || !Array.isArray(saved.tasks)) {
      throw new Error("Bridge task history format or workspace identity is invalid; file retained unchanged.");
    }
    for (const task of saved.tasks) {
      if (!task || typeof task.id !== "string" || typeof task.owner !== "string" ||
          !Number.isSafeInteger(task.revision) || !Array.isArray(task.todos) || !Array.isArray(task.history) ||
          !["running", "waiting_plan", "blocked", "interrupted", "completed", "cancelled", "cleared"].includes(task.state)) {
        throw new Error("Bridge task history has an invalid record; file retained unchanged.");
      }
    }
    let upgradedPending = false;
    for (const task of saved.tasks) {
      for (const question of task.questions ?? []) {
        // Previously persisted unanswered questions require the same MCP receipt gate.
        // Historical answered questions are already considered delivered by v2.
        if (question.status === "pending" && question.requiresMcpAck !== true) {
          question.requiresMcpAck = true;
          upgradedPending = true;
        }
      }
      this.tasks.set(task.id, task);
    }
    this.selectedId = this.tasks.has(saved.selectedId) ? saved.selectedId : [...this.tasks.keys()].at(-1);
    this.workspaceKey = key;this.persistenceFile = file;
    // Remote owner handles are never reclaimed automatically on a new process.
    this.currentByOwner.clear();
    if (upgradedPending) this.persist();
  }
  persist() {
    if (!this.persistenceFile) return;
    const content = JSON.stringify({ format: "opencode-bridge-tasks-v1", workspaceKey: this.workspaceKey,
      selectedId: this.selectedId, tasks: [...this.tasks.values()] });
    const temporary = this.persistenceFile + "." + process.pid + ".tmp";
    fs.writeFileSync(temporary, content, { encoding: "utf8", mode: 0o600 });
    try { fs.renameSync(temporary, this.persistenceFile); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  /** Kept as a compatibility hook; task history is never implicitly pruned. */
  pruneTerminal() {
    return 0;
  }
  /** Called only behind a local confirmation prompt, never through an MCP tool.
   * Validate the whole batch before removing any record; stale or revived tasks abort.
   */
  clearTasks(requests, allowAttention = false) {
    if (!Array.isArray(requests) || !requests.length || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT) throw new Error("Select a bounded non-empty batch of Bridge tasks to clear.");
    const seen = /* @__PURE__ */ new Set();
    for (const item of requests) {
      if (!item || typeof item.id !== "string" || !item.id || seen.has(item.id) || !Number.isSafeInteger(item.revision)) throw new Error("Invalid or duplicate task clear request.");
      seen.add(item.id);
      const task = this.tasks.get(item.id);
      if (!task || task.revision !== item.revision) throw new Error("Task changed or expired; refresh the list and confirm again.");
      if (!isTerminal(task.state) && !(allowAttention && (task.state === "blocked" || task.state === "interrupted"))) {
        throw new Error("Running, planning and awaiting-sync tasks cannot be cleared here. Blocked or interrupted tasks require explicit warning.");
      }
    }
    for (const { id } of requests) this.forget(id);
    if (!this.selectedId) this.selectedId = [...this.tasks.keys()].at(-1);
    this.persist();
    return requests.length;
  }
  /** Local UI only: mark confirmed, genuinely stale work interrupted without deleting its task card. */
  interruptStaleTasks(requests) {
    if (!Array.isArray(requests) || !requests.length || requests.length > BRIDGE_TASK_CLEANUP_BATCH_LIMIT) throw new Error("Select a bounded non-empty batch of stale Bridge tasks to interrupt.");
    const seen = /* @__PURE__ */ new Set();
    const at = this.now();
    const tasks = [];
    for (const item of requests) {
      if (!item || typeof item.id !== "string" || !item.id || seen.has(item.id) || !Number.isSafeInteger(item.revision)) throw new Error("Invalid or duplicate stale-task interruption request.");
      seen.add(item.id);
      const task = this.tasks.get(item.id);
      if (!task || task.revision !== item.revision) throw new Error("Task changed or expired; refresh the list and confirm again.");
      if (!isActive(task.state) || at - task.updatedAt < BRIDGE_TASK_AWAITING_SYNC_MS) throw new Error("Only tasks waiting for sync for at least 20 minutes can be marked interrupted.");
      tasks.push(task);
    }
    for (const task of tasks) {
      task.state = "interrupted";
      task.progress = null;
      task.revision++;
      task.updatedAt = at;
      task.history = [...task.history, { revision: task.revision, at, state: task.state, completed: task.todos.filter((t) => t.status === "completed").length, total: task.todos.length, removed: [] }].slice(-this.maxHistory);
    }
    this.persist();
    return tasks.length;
  }
  resolve(owner, value) {
    const input = record2(value);
    if (input.task_id !== void 0 && (typeof input.task_id !== "string" || !input.task_id || input.task_id.length > 80)) throw new Error("task_id must be a non-empty task handle returned by Bridge.");
    const id = input.task_id;
    const task = this.tasks.get(id ?? this.currentByOwner.get(owner) ?? "");
    if (id && !task) throw new Error("Unknown or expired task_id. Start a new task; do not replay an obsolete snapshot.");
    if (task && task.owner !== owner) throw new Error("task_id belongs to a different client session; start a new task instead of adopting it.");
    return task;
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
  update(owner, todos, value) {
    const input = record2(value);
    if (input.new_task !== void 0 && typeof input.new_task !== "boolean") throw new Error("new_task must be boolean.");
    if (input.new_task && (input.task_id !== void 0 || input.expected_revision !== void 0)) throw new Error("new_task cannot resume or revise an existing task.");
    if (input.new_task && this.outstandingForOwner(owner)) throw new Error("WAITING_FOR_USER_ANSWERS: 当前会话仍有未完整回传的用户决策，不能创建新任务绕过等待。");
    if (input.mode !== void 0 && input.mode !== "replace" && input.mode !== "patch") throw new Error("mode must be replace or patch.");
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
    let previous = input.new_task ? void 0 : this.resolve(owner, input);
    if (input.new_task && owner.startsWith("native-chat:")) {
      const reserved = this.tasks.get(this.currentByOwner.get(owner) ?? "");
      if (reserved?.state === "waiting_plan" && reserved.revision === 1 && !reserved.todos.length) previous = reserved;
    }
    if (previous?.overviewSessionId && input.overview_session_id && previous.overviewSessionId !== input.overview_session_id) {
      throw new Error("Cannot move an existing task to a different overview session.");
    }
    const explicit = input.task_id !== void 0;
    if ((explicit || input.mode === "patch") && input.expected_revision === void 0) throw new Error("Provide expected_revision from the last acknowledgement for task_id or patch updates.");
    if (input.expected_revision !== void 0) {
      if (!Number.isSafeInteger(input.expected_revision) || input.expected_revision !== previous?.revision) throw new Error(`Task revision conflict; current revision is ${previous?.revision ?? "missing"}. No changes applied.`);
    }
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
    if (previous && isTerminal(previous.state)) {
      const unchanged = todos.length === previous.todos.length && todos.every((todo, index) => todo.id === previous.todos[index].id && todo.title === previous.todos[index].title && todo.status === previous.todos[index].status);
      if (todos.length && unchanged) return this.publicTask(previous);
      if (explicit || input.mode === "patch" || input.expected_revision !== void 0) throw new Error("\u5DF2\u7ED3\u675F\u4EFB\u52A1\u5361\u4E0D\u80FD\u7EED\u5199\u6216\u91CD\u65B0\u6253\u5F00\uFF1B\u8BF7\u7528 new_task=true \u65B0\u5EFA\u4EFB\u52A1\u5361\uFF0C\u539F\u4EFB\u52A1\u4FDD\u6301\u539F\u6837\u3002");
      if (todos.length) previous = void 0;
    } else if (previous && (previous.state === "blocked" || previous.state === "interrupted") && todos.some((todo) => !previous.todos.some((old) => old.id === todo.id))) {
      if (explicit || input.mode === "patch" || input.expected_revision !== void 0) throw new Error("\u5DF2\u963B\u585E\u6216\u4E2D\u65AD\u7684\u4EFB\u52A1\u5361\u4E0D\u80FD\u8FFD\u52A0\u65B0\u6B65\u9AA4\uFF1B\u8BF7\u7528 new_task=true \u65B0\u5EFA\u4EFB\u52A1\u5361\u3002\u539F\u6B65\u9AA4\u4ECD\u53EF\u7EE7\u7EED\u66F4\u65B0\u3002");
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
    const state = complete ? "completed" : !todos.length ? input.new_task ? "waiting_plan" : "cleared" : input.lifecycle ?? "running";
    const at = this.now();
    const removed = previous?.todos.filter((t) => !todos.some((next) => next.id === t.id)) ?? [];
    const revision = (previous?.revision ?? 0) + 1;
    const label = input.source_label === void 0 ? previous?.source?.label : input.source_label.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    const sessionId = input.overview_session_id ?? previous?.overviewSessionId;
    const sessionKey = sessionId ? `${owner}\0${sessionId}` : void 0;
    const model = input.overview_model?.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    const provider = input.overview_provider?.replace(/[\x00-\x1f\x7f]/g, " ").trim();
    const overview = (sessionKey ? this.overviewBySession.get(sessionKey) : void 0) ?? previous?.overview ?? (model ? { label: model, kind: "model", verified: false } : provider ? { label: provider, kind: "provider", verified: false } : void 0);
    const task = {
      id: previous?.id ?? (0, import_node_crypto20.randomUUID)(),
      owner,
      revision,
      updatedAt: at,
      createdAt: previous ? previous.createdAt : at,
      overviewSessionId: sessionId,
      ...overview ? { overview } : {},
      ...label ? { source: { label, verified: false } } : {},
      title: input.task_title?.trim() ?? previous?.title ?? todos[0]?.title ?? "当前任务",
      questions: previous?.questions ?? [],
      state,
      todos: copyTodos(todos),
      history: [...previous?.history ?? [], { revision, at, state, completed: todos.filter((t) => t.status === "completed").length, total: todos.length, removed: copyTodos(removed) }].slice(-this.maxHistory)
    };
    if (previous && previous.owner !== owner && this.currentByOwner.get(previous.owner) === task.id) this.currentByOwner.delete(previous.owner);
    this.tasks.delete(task.id);
    this.tasks.set(task.id, task);
    this.currentByOwner.set(owner, task.id);
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
  disconnect(_owner) {
    return false;
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
    const state = task.questions?.some((question) => question.status === "pending" || (question.requiresMcpAck === true && !question.deliveredAt)) ? "awaiting_user"
      : isActive(task.state) && this.now() - task.updatedAt >= BRIDGE_TASK_AWAITING_SYNC_MS ? "awaiting_sync" : task.state;
    const progress = state === "running" && task.progress && task.progress.taskRevision === task.revision && this.now() - task.progress.at < 5 * 6e4 && (!task.progress.todoId || task.todos.some((todo) => todo.id === task.progress?.todoId && todo.status === "in_progress")) ? { ...task.progress } : null;
    return {
      id: task.id,
      title: task.title ?? task.todos[0]?.title ?? "当前任务",
      questions: (task.questions ?? []).map((question) => ({ ...question, options: question.options.map((option) => ({ ...option })) })),
      revision: task.revision,
      updatedAt: task.updatedAt,
      originKind: task.owner.startsWith("native-chat:") ? "chat" : "bridge",
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
    return { taskId: this.selectedId, tasks: [...this.tasks.values()].reverse().map((t) => this.publicTask(t)) };
  }
  selectedTodos() {
    return copyTodos(this.tasks.get(this.selectedId ?? "")?.todos ?? []);
  }
  /** Local Chat Code only: expose a truthful planning card before the model calls a tool. */
  ensureNativeChat(owner, model) {
    const nativeOwner = /^native-chat:(?:automation:)?([0-9a-f-]{36})$/i.exec(owner);
    if (!nativeOwner) throw new Error("Invalid native Chat task owner.");
    const existing = this.tasks.get(this.currentByOwner.get(owner) ?? "");
    if (existing && !isTerminal(existing.state)) {
      this.selectedId = existing.id;
      return this.publicTask(existing);
    }
    return this.update(owner, [], { new_task: true, overview_model: model, overview_session_id: nativeOwner[1] });
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
export { import_node_crypto20, BRIDGE_TASK_AWAITING_SYNC_MS, BRIDGE_TASK_CLEANUP_BATCH_LIMIT, copyTodos, record2, isTerminal, isActive, BridgeTaskStore };
