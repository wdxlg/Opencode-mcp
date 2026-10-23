import { EXECUTION_SCOPED_TOOLS } from './collaboration-contracts.mjs';
import { FairSemaphore, systemPressure } from './concurrency-runtime.mjs';
// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-tool-dispatcher.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { BRIDGE_TOOL_DEFINITIONS, CONFIGURE_MCP_TOOL, DEFAULT_BRIDGE_TOOL_CONCURRENCY, MAX_ACTIVITY, MAX_BRIDGE_TOOL_CONCURRENCY, MAX_TODOS, REPORT_PROGRESS_TOOL, SET_TODOS_TOOL, UPDATE_PLAN_TOOL } from "./module-0140.mjs";
import { Semaphore } from "./module-0149.mjs";
import { AdaptiveConcurrencyController } from "./module-0150.mjs";
import { BridgeActivityTracker } from "./module-0147.mjs";
import { BridgeTaskStore } from "./module-0144.mjs";
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


// extensions/opencode/src/bridge-tool-dispatcher.ts
init_define_OPENCODE_BUILD_INFO();


// extensions/opencode/src/bridge-tool-dispatcher.ts
var CONCURRENCY_EXEMPT_TOOLS = /* @__PURE__ */ new Set([
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

var BridgeToolDispatcher = class {
  constructor(deps, concurrency = DEFAULT_BRIDGE_TOOL_CONCURRENCY) {
    this.deps = deps;
    this.taskStore.sourceIdentityReader=owner=>deps.automation?.sourceIdentityFor(owner)||null;
    this.toolGate = new FairSemaphore(concurrency);
    this.classGates = new Map(); this.serverGates = new Map(); this.lastTiming = {};
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
  /** task owner -> command owner seen with it, so a vanished MCP session can still interrupt its job. */
  taskCommandOwners = /* @__PURE__ */ new Map();
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
  ensureNativeChatTask(owner, model) {
    const before = this.taskStore.snapshot().taskId;
    const task = this.taskStore.ensureNativeChat(owner, model);
    if (before !== task.id) this.revision_++;
    return task;
  }
  finishNativeChatTask(owner, taskId, revision, succeeded) {
    if (this.taskStore.finishNativeChat(owner, taskId, revision, succeeded)) this.revision_++;
  }
  /** Local UI only; the MCP dispatcher never exposes this as a tool. */
  clearTasks(requests, allowAttention = false) {
    const removed = this.taskStore.clearTasks(requests, allowAttention);
    if (removed) this.revision_++;
    return removed;
  }
  /** Only the local task board can submit an answer. */
  answerTaskQuestion(taskId, questionId, optionId, customText) {
    const answer = this.taskStore.answerQuestion(taskId, questionId, optionId, customText);
    this.revision_++;
    return answer;
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
  async dispatch(rawToolName, args, extra) {
    const commandOwnerId = extra.commandOwnerId ?? NATIVE_MANAGED_COMMAND_OWNER_ID;
    const run = () => this.handleExecutionToolCall(rawToolName, args, { signal: extra.signal, commandOwnerId, taskOwnerId: extra.taskOwnerId, executionLease:extra.executionLease, workerCallId:extra.workerCallId });
    const schedulingName = resolveBridgeToolName(rawToolName, name => CONCURRENCY_EXEMPT_TOOLS.has(name));
    if (CONCURRENCY_EXEMPT_TOOLS.has(schedulingName)) return run();
    const externalName = resolveBridgeToolName(rawToolName, (name) => this.deps.externalMcp?.hasBinding(name) === true);
    const external=this.deps.externalMcp?.hasBinding(externalName) && !this.findCustomToolSafe(externalName);
    const category=external?'external':/^(?:apply_patch|write_file|edit_file)$/.test(rawToolName)?'write':/search|find_files/.test(rawToolName)?'search':'read';
    const group=external?(externalName.split('__')[1]||externalName):category;
    const map=external?this.serverGates:this.classGates;
    if(!map.has(group))map.set(group,new FairSemaphore(external?2:category==='search'?2:category==='write'?4:8));
    const gate=map.get(group),globalGate=external?this.externalToolGate:this.toolGate;
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
    const automation=this.deps.automation?.forCaller(extra.commandOwnerId,input)||this.deps.automation;
    extra={...extra,automationContext:automation};
    const runtime=automation?.collaboration;
    if(!runtime)return this.handleToolCall(rawToolName,input,extra);
    let record;
    try{
      const resolved=resolveBridgeToolName(rawToolName,name=>BRIDGE_TOOL_DEFINITIONS.some(tool=>tool.name===name)||isFileToolName(name)||isFileToolCompatibilityAlias(name)||getIdeToolDefinition(name)!==undefined||this.findCustomToolSafe(name)!==undefined||this.deps.externalMcp?.hasBinding(name)===true);
      const name=rawToolName.startsWith('ext__')&&!this.findCustomToolSafe(rawToolName)&&!this.deps.externalMcp?.hasBinding(rawToolName)?rawToolName:normalizeFileToolName(resolved);
      let canonical=input;
      if(EXECUTION_SCOPED_TOOLS.has(name)&&input&&Object.prototype.hasOwnProperty.call(input,'execution_lease')){const {execution_lease,...body}=input;if(extra.executionLease&&execution_lease!==extra.executionLease)throw Object.assign(Error('TASK_NOT_OWNED: 执行令牌与真实执行器不一致。'),{code:'TASK_NOT_OWNED'});extra={...extra,executionLease:execution_lease};canonical=body;}
      if(isFileToolName(name))canonical=normalizeFileToolInput(name,canonical);
      const args=runtime.executionArguments(name,canonical,extra.commandOwnerId,extra.executionLease);
      const definition=BRIDGE_TOOL_DEFINITIONS.find(tool=>tool.name===name);
      if(definition)validateToolInput(name,definition.inputSchema,args);
      record=await runtime.beginTool(name,args,extra.commandOwnerId,extra);
      const result=await this.handleToolCall(rawToolName,args,extra);
      return await runtime.finishTool(record,result);
    }catch(error){
      await runtime.toolOutcomeUnknown(record,error.message||String(error));
      return {isError:true,content:[{type:'text',text:error.message||String(error)}],structuredContent:{error:{code:error.code||'EXECUTION_DISPATCH_FAILED',message:error.message||String(error)}}};
    }
  }
  async handleToolCall(rawToolName, args, extra) {
    const resolvedToolName = resolveBridgeToolName(rawToolName, (name) => BRIDGE_TOOL_DEFINITIONS.some(tool => tool.name === name) || name === SET_TODOS_TOOL.name || name === UPDATE_PLAN_TOOL.name || name === REPORT_PROGRESS_TOOL.name || isFileToolName(name) || isFileToolCompatibilityAlias(name) || !BRIDGE_EXCLUDED_TOOL_NAMES.has(name) && getIdeToolDefinition(name) !== void 0 || name === CONFIGURE_MCP_TOOL.name || this.findCustomToolSafe(name) !== void 0 || this.deps.externalMcp?.hasBinding(name) === true);
    const toolName = rawToolName.startsWith("ext__") && !this.findCustomToolSafe(rawToolName) && !this.deps.externalMcp?.hasBinding(rawToolName) ? rawToolName : normalizeFileToolName(resolvedToolName);
    const taskOwnerId = extra.taskOwnerId ?? extra.commandOwnerId;
    const waiting = this.taskStore.outstandingForOwner(taskOwnerId);
    // Owner-scoped, server-side fail-closed gate. Only checking user answers,
    // communicating wait status, reading rules and cancelling unsafe commands remain available.
    const waitingExceptions = new Set(["bridge_ask_user", "report_progress",
      "bridge_get_effective_rules", "bridge_acknowledge_rules", "cancel_command"]);
    if (waiting && !waitingExceptions.has(toolName)) {
      const message = `WAITING_FOR_USER_ANSWERS: 本任务有 ${waiting.pending} 道未回答、${waiting.undelivered} 道尚未经 MCP 回传的决策。全部回答并通过 bridge_ask_user(mode=check, task_id=${waiting.taskId}, ${waiting.batchId ? `batch_id=${waiting.batchId}` : `question_id=${waiting.questionId}`}) 取得 status=answered 后才允许继续；当前工具 ${toolName} 已拒绝执行。`;
      return { isError: true, content: [{ type: "text", text: message }],
        structuredContent: { error: { code: "WAITING_FOR_USER_ANSWERS", message }, task_id: waiting.taskId,
          pending: waiting.pending, undelivered: waiting.undelivered } };
    }
    const publicDefinition = BRIDGE_TOOL_DEFINITIONS.find((tool) => tool.name === toolName);
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
          const input = args ?? {};
          const existing = input.mode === "check";
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
            const result = input.wait_seconds === 0 ? this.taskStore.batchStatus(submitted.task.id, submitted.batchId)
              : await this.taskStore.waitForBatch(submitted.task.id, submitted.batchId, {
                  signal: extra.signal,
                  ...input.wait_seconds !== void 0 ? { timeoutMs: input.wait_seconds * 1e3 } : {}
                });
            if (result.status === "answered") this.taskStore.markAnswersDelivered(taskOwnerId, submitted.task.id, result.questions.map((q) => q.question_id));
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
          const result = question.status === "answered" ? { status: "answered", answer: question.answer }
            : input.wait_seconds === 0 ? { status: "pending", question_id: question.id }
            : await this.taskStore.waitForQuestion(task.id, question.id, {
                signal: extra.signal,
                ...input.wait_seconds !== void 0 ? { timeoutMs: input.wait_seconds * 1e3 } : {}
              });
          if (result.status === "answered") this.taskStore.markAnswersDelivered(taskOwnerId, task.id, [question.id]);
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
    const activityArgs = externalBinding||sensitiveStaff ? {} : toolName === CONFIGURE_MCP_TOOL.name ? configureMcpActivityArgs(args) : args;
    const activityId = this.pushActivity({
      tool: toolName,
      status: "running",
      // Upstream input may include credentials or user data. Do not retain it in activity history.
      presentation: bridgePresentation(toolName, externalBinding||sensitiveStaff ? {} : args)
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
        const result = await automation.handleTool(toolName, args, extra.commandOwnerId);
        this.finishActivity(activityId, result.isError ? 'error' : 'completed', Date.now() - startedAt, void 0,
          bridgePresentation(toolName, sensitiveStaff?{}:args, '规则或协作请求已处理', void 0, result.isError));
        return result;
      }
      try {
        await automation?.guard(toolName, args, extra.commandOwnerId);
      } catch (error) {
        localRulesGuardFailed = true;
        throw error;
      }
      if (isFileToolName(toolName)) {
        const result = await invokeFileTool(toolName, args, {
          // Lazy on purpose: resolving it here would throw before the registry could envelope it.
          workspaceRoots: () => { const roots = this.deps.fileToolRoots ? this.deps.fileToolRoots() : this.deps.workspaceRoots(); return automation?.collaboration?.fileToolRoots(extra.commandOwnerId, roots) || roots; },
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
    this.revision_ += 1;
    const taskContract = {
      task_protocol: "task-lifecycle-v1",
      ...task?.assistantSource?{source_identity:task.assistantSource}:{},
      ...this.deps.automation ? { rules_required: true, rules_read_tool: 'bridge_get_effective_rules', rules_ack_tool: 'bridge_acknowledge_rules', rules_workspace_id: this.deps.automation.currentWorkspaceId() } : {},
      ...task ? { task_id: task.id, task_revision: task.revision, lifecycle: task.state, history: task.history } : {},
      ...task?.overview ? { overview: task.overview } : {}
    };
    const todos = task?.todos ?? [];
    const completed = todos.filter((todo) => todo.status === "completed").length;
    const current = todos.find((todo) => todo.status === "in_progress");
    this.deps.log(`[bridge-todos] ${completed}/${todos.length} completed via ${sourceTool} \xB7 state: ${task?.state ?? "cleared"}`);
    return {
      structuredContent: sourceTool === UPDATE_PLAN_TOOL.name ? { plan: todos.map(({ title, status }) => ({ step: title, status })), ...taskContract } : { todos: todos.map((todo) => ({ ...todo })), ...taskContract },
      content: [{ type: "text", text: task ? `\u5DF2\u901A\u8FC7 ${sourceTool} \u66F4\u65B0 OpenCode \u4EFB\u52A1\u5361\uFF1A\u5DF2\u5B8C\u6210 ${completed}/${todos.length} \u6B65${current ? `\uFF1B\u5F53\u524D\u6B65\u9AA4 ${current.id}\uFF1A${current.title}` : ""}\u3002\u4EFB\u52A1\u7F16\u53F7\uFF1A${task.id}\uFF1B\u4FEE\u8BA2\u53F7\uFF1A${task.revision}\u3002\u4E0B\u6B21\u66F4\u65B0\u8BF7\u5E26 task_id \u4E0E expected_revision\uFF1B\u65B0\u4EFB\u52A1\u4F7F\u7528 new_task=true\u3002\u6700\u7EC8\u56DE\u590D\u524D\u987B\u63D0\u4EA4\u5E76\u786E\u8BA4\u7EC8\u6001\u4EFB\u52A1\u5361\uFF1B\u7A7A\u95F2\u4E0D\u7B49\u4E8E\u5B8C\u6210\u3002` : "\u5DF2\u6E05\u7A7A OpenCode \u4EFB\u52A1\u5361\u3002" }]
    };
  }
  pushActivity(input) {
    const id = this.activityTracker.push(input);
    this.revision_ += 1;
    return id;
  }
  finishActivity(id, status, durationMs, message2, presentation) {
    if (this.activityTracker.finish(id, status, durationMs, message2, presentation)) {
      this.revision_ += 1;
    }
  }
};
export { configureMcpActivityArgs, CONCURRENCY_EXEMPT_TOOLS, BridgeToolDispatcher };
