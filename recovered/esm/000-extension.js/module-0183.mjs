// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/runtime-client.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { CHAT_BRIDGE_CONTROL_TOOL_NAMES, OC_PERMISSION_CATEGORY_LABELS, ocChatToolCategory, ocDangerousToolCall, readOcChatPermissionSettings, resolveOcChatToolPermission, strictestOcPermission } from "./module-0140.mjs";
import { fetchWithExtensionHostPolicyOnce } from "./module-0106.mjs";
import { globalSkillsDirectory } from "./module-0025.mjs";

// OpenCode: allowed roots of a native-chat run when no folder is open: the dialogue's own roots
// (the selected directory, e.g. user home) plus the global Skill directory that list_skills points to.
function ocSameRoot(a, b) {
  return import_node_path32.default.resolve(a).toLowerCase() === import_node_path32.default.resolve(b).toLowerCase();
}
function ocWithSkillsRoot(roots) {
  const list = (roots ?? []).filter((root) => typeof root === "string" && root);
  let skills;
  try {
    skills = globalSkillsDirectory();
  } catch {
    skills = void 0;
  }
  if (skills && !list.some((root) => ocSameRoot(root, skills))) list.push(skills);
  return list;
}
function ocNoOpenFolder() {
  try {
    return !require("vscode").workspace.workspaceFolders?.length;
  } catch {
    return false;
  }
}


// extensions/opencode/src/runtime-client.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_child_process8 = require("node:child_process");

var import_node_readline = __toESM(require("node:readline"));

var import_node_path32 = __toESM(require("node:path"));

var vscode20 = __toESM(require("vscode"));

var RuntimeRpcError = class extends Error {
  constructor(code, message2, data) {
    super(`Runtime ${code}: ${message2}`);
    this.code = code;
    this.data = data;
    this.name = "RuntimeRpcError";
  }
  code;
  data;
};

var RuntimeClient = class {
  constructor(context, output2, ideToolBroker, dispatchChatTool, automation) {
    this.context = context;
    this.output = output2;
    this.ideToolBroker = ideToolBroker;
    this.dispatchChatTool = dispatchChatTool;
    this.automation = automation;
  }
  context;
  output;
  ideToolBroker;
  dispatchChatTool;
  process;
  pending = /* @__PURE__ */ new Map();
  traceListeners = /* @__PURE__ */ new Map();
  checkpointListeners = /* @__PURE__ */ new Map();
  runContexts = /* @__PURE__ */ new Map();
  networkFetchControllers = /* @__PURE__ */ new Map();
  nextId = 1;
  nextRunId = 1;
  starting;
  async start() {
    if (this.process && !this.process.killed) {
      return this.request("runtime/hello", {}, 1e4);
    }
    if (this.starting) return this.starting;
    this.starting = this.startProcess();
    try {
      return await this.starting;
    } finally {
      this.starting = void 0;
    }
  }
  async restart() {
    this.stop();
    return this.start();
  }
  async runAgent(params, onTrace, onCheckpoint, invocationContext) {
    await this.start();
    // Skill instructions live outside the dialogue's folder; the agent host's read_files only sees
    // params.workspaceRoots, so add the global Skill directory (same boundary as Bridge fileToolRoots).
    if (Array.isArray(params?.workspaceRoots) && params.workspaceRoots.length) {
      params = { ...params, workspaceRoots: ocWithSkillsRoot(params.workspaceRoots) };
    }
    const runId = `run-${Date.now()}-${this.nextRunId++}`;
    if (onTrace) this.traceListeners.set(runId, onTrace);
    if (onCheckpoint) this.checkpointListeners.set(runId, onCheckpoint);
    if (invocationContext) {
      this.runContexts.set(runId, {
        ...invocationContext,
        defaultWorkspaceRoot: params.workspaceRoot,
        defaultWorkspaceRoots: params.workspaceRoots,
        registeredToolNames: new Set((params.externalTools ?? []).map((tool) => tool.name))
      });
    }
    const runPromise = this.request("agent/run", { ...params, runId });
    const cancellation = invocationContext?.cancellationToken.onCancellationRequested(() => {
      void this.request("agent/cancel", { runId }, 1e4).catch((error2) => {
        this.output.appendLine(`[runtime] failed to cancel ${runId}: ${error2 instanceof Error ? error2.message : String(error2)}`);
      });
    });
    if (invocationContext?.cancellationToken.isCancellationRequested) {
      void this.request("agent/cancel", { runId }, 1e4).catch(() => void 0);
    }
    // steer-step01: 工作台「插话」会把 chatContext.yieldRequested 置为 true；转成 agent/yield 软停止
    let yieldSent = false;
    const yieldTimer = typeof invocationContext?.isYieldRequested === "function" ? setInterval(() => {
      if (yieldSent || !invocationContext.isYieldRequested()) return;
      yieldSent = true;
      this.output.appendLine(`[runtime] ${runId} yield requested (steering message)`);
      void this.request("agent/yield", { runId }, 1e4).catch(() => void 0);
    }, 400) : void 0;
    try {
      return await runPromise;
    } finally {
      if (yieldTimer) clearInterval(yieldTimer);
      cancellation?.dispose();
      this.traceListeners.delete(runId);
      this.checkpointListeners.delete(runId);
      this.runContexts.delete(runId);
    }
  }
  async hello() {
    await this.start();
    return this.request("runtime/hello", {}, 1e4);
  }
  dispose() {
    this.stop();
  }
  resolveEntryPoint() {
    const configured = vscode20.workspace.getConfiguration("opencode").get("runtime.entryPoint")?.trim();
    const candidates = [
      configured,
      process.env.OPENCODE_AGENT_HOST_ENTRY,
      this.context.asAbsolutePath(import_node_path32.default.join("runtime", "agent-host.js")),
      ...(vscode20.workspace.workspaceFolders ?? []).map((folder) => import_node_path32.default.join(folder.uri.fsPath, "dist", "src", "agent-host.js"))
    ].filter((value) => Boolean(value));
    const fs4 = require("node:fs");
    const found = candidates.find((candidate) => fs4.existsSync(candidate));
    if (found) return import_node_path32.default.resolve(found);
    throw new Error(
      "OpenCode Agent Runtime was not found. Run the carrier through scripts/opencode-dev.bat or set opencode.runtime.entryPoint to dist/src/agent-host.js."
    );
  }
  async startProcess() {
    const entryPoint = this.resolveEntryPoint();
    this.output.appendLine(`[runtime] starting ${entryPoint}`);
    const child = (0, import_node_child_process8.spawn)(process.execPath, [entryPoint], {
      cwd: vscode20.workspace.workspaceFolders?.[0]?.uri.fsPath ?? this.context.extensionPath,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1"
      },
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    this.process = child;
    __ocChildTree.add(child.pid);
    child.once("exit", () => __ocChildTree.delete(child.pid));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => this.output.append(String(chunk)));
    child.on("exit", (code, signal) => {
      this.output.appendLine(`[runtime] exited code=${String(code)} signal=${String(signal)}`);
      if (this.process === child) this.process = void 0;
      this.rejectPending(new Error(`OpenCode Agent Runtime exited (code=${String(code)}, signal=${String(signal)}).`));
    });
    child.on("error", (error2) => {
      this.output.appendLine(`[runtime] process error: ${error2.message}`);
      this.rejectPending(error2);
    });
    const lines = import_node_readline.default.createInterface({ input: child.stdout, crlfDelay: Infinity });
    lines.on("line", (line) => this.handleLine(line));
    return this.request("runtime/hello", {}, 15e3);
  }
  request(method, params, timeoutMs) {
    const child = this.process;
    if (!child || child.killed) return Promise.reject(new Error("OpenCode Agent Runtime is not running."));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = timeoutMs === void 0 ? void 0 : setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Runtime request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (value) => resolve(value),
        reject,
        timer
      });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}
`, (error2) => {
        if (!error2) return;
        if (timer) clearTimeout(timer);
        this.pending.delete(id);
        reject(error2);
      });
    });
  }
  handleLine(line) {
    let response;
    try {
      response = JSON.parse(line);
    } catch {
      this.output.appendLine(`[runtime] non-JSON stdout: ${line}`);
      return;
    }
    if (response.method === "ide/tool/invoke" && response.id !== void 0) {
      void this.handleIdeToolRequest(response);
      return;
    }
    // checkpoint-step01: agent-host 在 apply_patch 前后请求扩展用 externalEdit 记录修改
    if ((response.method === "ide/edit/begin" || response.method === "ide/edit/end" || response.method === "ide/hook") && response.id !== void 0) {
      void this.handleEditNotice(response);
      return;
    }
    if (response.method === "ide/tool/approve" && response.id !== void 0) {
      void this.handleToolApprovalRequest(response);
      return;
    }
    if (response.method === "network/fetch" && response.id !== void 0) {
      void this.handleNetworkFetchRequest(response);
      return;
    }
    if (response.method === "network/fetch/cancel") {
      const params = response.params && typeof response.params === "object" ? response.params : {};
      const streamId = typeof params.streamId === "string" ? params.streamId : "";
      this.networkFetchControllers.get(streamId)?.abort(new Error("Runtime canceled the network request."));
      return;
    }
    if (response.method === "agent/trace") {
      const params = response.params;
      const runId = typeof params?.runId === "string" ? params.runId : void 0;
      if (runId) {
        const listener = this.traceListeners.get(runId);
        if (listener && params?.item && typeof params.item === "object") {
          listener(params.item);
        }
      }
      return;
    }
    if (response.method === "agent/checkpoint") {
      const params = response.params;
      const runId = typeof params?.runId === "string" ? params.runId : void 0;
      if (runId && params?.checkpoint && typeof params.checkpoint === "object" && !Array.isArray(params.checkpoint)) {
        this.checkpointListeners.get(runId)?.(params.checkpoint);
      }
      return;
    }
    if (response.id === void 0) {
      this.output.appendLine(`[runtime] unexpected notification: ${line}`);
      return;
    }
    const id = Number(response.id);
    const pending = this.pending.get(id);
    if (!pending) {
      this.output.appendLine(`[runtime] unexpected response id=${String(response.id)}`);
      return;
    }
    if (pending.timer) clearTimeout(pending.timer);
    this.pending.delete(id);
    if (response.error) {
      pending.reject(new RuntimeRpcError(response.error.code, response.error.message, response.error.data));
    } else {
      pending.resolve(response.result);
    }
  }
  /**
   * OpenCode: 「权限」中需询问的工具在执行前请求用户确认（agent-host 内的 apply_patch/读取/搜索/屏幕查看，
   * 以及 runtime-client 执行的任务/记忆/协作/批量调用和后台分支的 IDE 工具）。
   * 逐个串行弹出模态确认；未明确允许（关闭/取消/出错/对话已取消）一律按拒绝返回。
   */
  ocQueueApproval(context, message2, detail) {
    const ask = async () => {
      if (!context) return { allowed: false, reason: "unknown or inactive run" };
      if (context.cancellationToken?.isCancellationRequested) return { allowed: false, reason: "request canceled" };
      { const inChat = await globalThis.__ocInChatConfirm?.(context.toolInvocationToken, message2, detail, context.cancellationToken); if (inChat !== void 0) return inChat ? { allowed: true, reason: "user allowed" } : { allowed: false, reason: "user denied" }; }
      const allow = "\u5141\u8bb8";
      const choice = await vscode20.window.showWarningMessage(message2, { modal: true, detail: `${detail}\n\n\u53ef\u5728\u5bf9\u8bdd\u9762\u677f\u6807\u9898\u884c\u300c\u6743\u9650\u300d\u203a\u300c\u66f4\u591a\u300d\u4e2d\u6309\u7c7b\u522b\u6216\u5355\u4e2a\u5de5\u5177\u6539\u4e3a\u5141\u8bb8/\u7981\u6b62` }, allow);
      if (context.cancellationToken?.isCancellationRequested) return { allowed: false, reason: "request canceled" };
      return choice === allow ? { allowed: true, reason: "user allowed" } : { allowed: false, reason: "user denied" };
    };
    const previous = this.ocApprovalChain ?? Promise.resolve();
    const current = previous.catch(() => void 0).then(ask);
    this.ocApprovalChain = current.catch(() => void 0);
    return current.catch((error2) => ({ allowed: false, reason: error2 instanceof Error ? error2.message : String(error2) }));
  }
  // OpenCode p28: 高风险判断——工具单独设为「允许」的跳过；bridge_batch 逐项检查
  ocDangerReason(context, settings, options, name, args) {
    const roots = context?.isolatedRoot ? [context.isolatedRoot] : [...Array.isArray(context?.defaultWorkspaceRoots) ? context.defaultWorkspaceRoots : [], ...context?.defaultWorkspaceRoot ? [context.defaultWorkspaceRoot] : []].filter((root) => typeof root === "string" && root);
    const calls = name === "bridge_batch" ? (Array.isArray(args?.calls) ? args.calls : []).map((call) => [typeof call?.tool === "string" ? call.tool : "", call?.arguments ?? call?.args ?? {}]) : [[name, args]];
    for (const [tool, toolArgs] of calls) {
      const verdict = resolveOcChatToolPermission(settings, tool, options);
      if (verdict.decision === "allow" && verdict.source === "tool") continue;
      const reason = ocDangerousToolCall(tool, toolArgs, roots, { isolated: Boolean(context?.isolatedRoot) });
      if (reason) return calls.length > 1 || tool !== name ? `${tool}: ${reason}` : reason;
    }
    return void 0;
  }
  ocApprovalGate(context, name, args) {
    if (!context) return {};
    try {
      const config = vscode20.workspace.getConfiguration("opencode");
      const settings = readOcChatPermissionSettings((key, fallback) => config.get(key, fallback));
      const options = { background: Boolean(context.background), isolated: Boolean(context.isolatedRoot) };
      const verdict = resolveOcChatToolPermission(settings, name, options);
      const decision = verdict.decision === "own" ? "allow" : verdict.decision;
      if (decision === "deny") return { result: { allowed: false, reason: "denied by chat permission settings" } };
      const reason = this.ocDangerReason(context, settings, options, name, args);
      if (decision === "allow" && !reason) return { result: { allowed: true, reason: "allowed by chat permission settings" } };
      return { reason };
    } catch {
      return {};
    }
  }
  ocApprovalText(name, args) {
    if (name === "apply_patch") {
      const patch = typeof args.patch === "string" ? args.patch : "";
      const files = [];
      let added = 0;
      let removed = 0;
      for (const line of patch.split(/\r?\n/)) {
        const directive = /^\*\*\* (Add File|Update File|Delete File|Move to): (.+)$/.exec(line);
        if (directive) files.push(`${directive[1] === "Add File" ? "\u65b0\u589e" : directive[1] === "Delete File" ? "\u5220\u9664" : directive[1] === "Move to" ? "\u79fb\u52a8\u5230" : "\u4fee\u6539"}  ${directive[2].trim()}`);
        else if (line.startsWith("+") && !line.startsWith("+++")) added += 1;
        else if (line.startsWith("-") && !line.startsWith("---")) removed += 1;
      }
      const shown = files.slice(0, 20).join("\n") + (files.length > 20 ? `\n\u2026\u53e6\u6709 ${files.length - 20} \u9879` : "");
      return { message: "\u5141\u8bb8 AI \u4fee\u6539\u4ee5\u4e0b\u6587\u4ef6\uff1f", detail: `${shown || name}${patch ? `\n\n+${added} / -${removed} \u884c` : ""}` };
    }
    let text2 = "";
    try {
      text2 = JSON.stringify(args, null, 2) ?? "";
    } catch {
    }
    if (text2.length > 1500) text2 = `${text2.slice(0, 1500)}\u2026`;
    const category = ocChatToolCategory(name);
    return { message: `\u5141\u8bb8 AI \u8c03\u7528 ${name}\uff1f`, detail: `\u7c7b\u522b\uff1a${OC_PERMISSION_CATEGORY_LABELS[category] ?? category}${text2 && text2 !== "{}" ? `\n\n\u53c2\u6570\uff1a${text2}` : ""}` };
  }
  async handleToolApprovalRequest(request) {
    const child = this.process;
    if (!child || child.killed || request.id === void 0) return;
    const params = request.params && typeof request.params === "object" ? request.params : {};
    const runId = typeof params.runId === "string" ? params.runId : "";
    const name = typeof params.name === "string" ? params.name : "";
    const args = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
    const context = this.runContexts.get(runId);
    // OpenCode p28: agent-host 的确认请求按最新权限设置决定：单独允许 / 无风险的直接放行，高风险的在对话内确认并写明原因
    const ocGate = this.ocApprovalGate(context, name, args);
    if (ocGate.result) {
      if (!child.killed) child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, result: ocGate.result })}\n`);
      return;
    }
    const { message: message2, detail } = this.ocApprovalText(name, args);
    const result = await this.ocQueueApproval(context, ocGate.reason ? `${message2}\uff08\u9ad8\u98ce\u9669\uff1a${ocGate.reason}\uff09` : message2, detail);
    if (!child.killed) child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, result })}
`);
  }
  /**
   * OpenCode: 「权限」›「更多」在 runtime-client 执行的工具上的强制检查（调用时读取最新设置）：
   * 禁止 → 抛出 PERMISSION_DENIED；询问 → 模态确认。前台 IDE/MCP 工具的询问交给工作台工具审批；
   * 后台分支 run_command/send_command_input 交给 approveBackgroundCommand。bridge_batch 按其中各项取最严格者，避免绕过。
   * 只用于原生 Chat 的运行上下文，Bridge 远程调用不经过这里。
   */
  async ocEnforceChatPermission(context, name, args, ideTool) {
    if (name.startsWith("mcp_")) return;
    const config = vscode20.workspace.getConfiguration("opencode");
    const settings = readOcChatPermissionSettings((key, fallback) => config.get(key, fallback));
    const options = { background: Boolean(context.background), isolated: Boolean(context.isolatedRoot) };
    let decision;
    let message2;
    let detail;
    let blocked = name;
    if (name === "bridge_batch") {
      const calls = Array.isArray(args?.calls) ? args.calls : [];
      const rows = calls.map((call) => {
        const tool = typeof call?.tool === "string" ? call.tool : "";
        const verdict = resolveOcChatToolPermission(settings, tool, options);
        return { tool, decision: verdict.decision === "own" ? "allow" : verdict.decision, category: verdict.category };
      });
      decision = strictestOcPermission(rows.map((row) => row.decision));
      blocked = rows.filter((row) => row.decision === decision).map((row) => row.tool).join(", ") || name;
      message2 = `\u5141\u8bb8 AI \u6279\u91cf\u6267\u884c ${rows.length} \u9879\u5de5\u5177\u8c03\u7528\uff1f`;
      detail = rows.slice(0, 20).map((row, index) => `${index + 1}. ${row.tool}\uff08${OC_PERMISSION_CATEGORY_LABELS[row.category] ?? row.category}${row.decision === "ask" ? "\uff0c\u9700\u786e\u8ba4" : ""}\uff09`).join("\n") + (rows.length > 20 ? `\n\u2026\u53e6\u6709 ${rows.length - 20} \u9879` : "");
    } else {
      const verdict = resolveOcChatToolPermission(settings, name, options);
      decision = verdict.decision === "own" ? "allow" : verdict.decision;
      ({ message: message2, detail } = this.ocApprovalText(name, args));
    }
    if (decision === "deny") {
      throw new Error(`PERMISSION_DENIED: the user's chat permission settings do not allow ${blocked}. Nothing was run. Do not retry it or work around it with another tool; explain what you intended to do instead.`);
    }
    // OpenCode p28: 允许（模式 / 类别 / 服务器）下的高风险调用仍要确认；前台 IDE 工具由工作台 p27 检查，后台终端命令由 ocBackgroundCommandPermission 检查
    if (decision === "allow" && !(ideTool && !context.background) && !(context.background && (name === "run_command" || name === "send_command_input"))) {
      const ocDanger = this.ocDangerReason(context, settings, options, name, args);
      if (ocDanger) {
        decision = "ask";
        message2 = `${message2}\uff08\u9ad8\u98ce\u9669\uff1a${ocDanger}\uff09`;
      }
    }
    if (decision !== "ask") return;
    if (ideTool && !context.background) return;
    if (context.background && (name === "run_command" || name === "send_command_input")) return;
    const verdict = await this.ocQueueApproval(context, message2, detail);
    if (verdict?.allowed !== true) {
      throw new Error(`PERMISSION_DENIED: the user did not approve this ${name} call (${verdict?.reason || "denied"}). Nothing was run. Do not retry the same call as-is; explain what you intended to do or ask the user how to proceed.`);
    }
  }
  async handleEditNotice(request) {
    const child = this.process;
    if (!child || child.killed) return;
    const params = request.params && typeof request.params === "object" ? request.params : {};
    const context = this.runContexts.get(typeof params.runId === "string" ? params.runId : "");
    let result = { ticket: null };
    try {
      if (request.method === "ide/edit/begin" && typeof context?.onEditBegin === "function") {
        const ticket = await context.onEditBegin(Array.isArray(params.paths) ? params.paths.filter((p) => typeof p === "string") : []);
        result = { ticket: typeof ticket === "string" ? ticket : null };
      } else if (request.method === "ide/hook") {
        result = typeof context?.onHook === "function" ? await context.onHook(String(params.event ?? ""), params.payload && typeof params.payload === "object" ? params.payload : {}) ?? {} : {};
      } else if (request.method === "ide/edit/end" && typeof context?.onEditEnd === "function") {
        await context.onEditEnd(typeof params.ticket === "string" ? params.ticket : "");
        result = { ok: true };
      }
    } catch (error2) {
      this.output.appendLine(`[runtime] ${request.method} failed: ${error2 instanceof Error ? error2.message : String(error2)}`);
    }
    if (!child.killed) child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, result })}\n`);
  }
  async handleIdeToolRequest(request) {
    // native-subagent: agent-host spawn_subagent calls carry params.session = { id, parentID }; a null parentID is the dialogue itself.
    const ocNativeSubagentSession = (session, ownerId) => {
      const s = session && typeof session === "object" ? session : null;
      const sid = typeof s?.id === "string" && s.id.trim() ? s.id.trim().slice(0, 120) : "";
      if (!sid) return void 0;
      const pid = typeof s.parentID === "string" && s.parentID.trim() ? s.parentID.trim().slice(0, 120) : String(ownerId || "").replace(/^native-chat:/, "") || "native-chat";
      return { sessionId: sid, parentID: pid };
    };
    const child = this.process;
    if (!child || child.killed || request.id === void 0) return;
    const params = request.params && typeof request.params === "object" ? request.params : {};
    const runId = typeof params.runId === "string" ? params.runId : "";
    const name = typeof params.name === "string" ? params.name : "";
    const args = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
    const context = this.runContexts.get(runId);
    try {
      if (!context) throw new Error(`Unknown or inactive runId: ${runId}`);
      if (!name) throw new Error("IDE tool request is missing a tool name.");
      let result;
      // OpenCode: 自定义工具（.opencode/tools/*.json）在扩展进程里执行
      if (context.customToolExecutors?.has(name)) {
        result = await context.customToolExecutors.get(name)(args, context.cancellationToken);
      } else if (CHAT_BRIDGE_CONTROL_TOOL_NAMES.has(name)) {
        if (!context.registeredToolNames.has(name) || !context.chatTaskOwnerId || !this.dispatchChatTool) {
          throw new Error(`Chat control tool is not available for this request: ${name}`);
        }
        // OpenCode: 「权限」›「更多」——任务卡/记忆/协作/MCP 配置/批量调用在执行前按设置检查
        await this.ocEnforceChatPermission(context, name, args, false);
        const controller = new AbortController();
        const cancellation = context.cancellationToken.onCancellationRequested(() => controller.abort());
        try {
          if (context.cancellationToken.isCancellationRequested) controller.abort();
          const taskArgs = name === "set_todos" || name === "update_plan" ? {
            ...args,
            ...context.chatOverviewModel ? { overview_model: context.chatOverviewModel } : {},
            overview_session_id: context.chatTaskOwnerId.slice("native-chat:".length)
          } : args;
          // OpenCode: 前台对话把 toolInvocationToken 传下去，bridge_ask_user 才能在对话内直接弹出问题卡片
          result = await this.dispatchChatTool(name, taskArgs, context.chatTaskOwnerId, controller.signal, context.background ? void 0 : context.toolInvocationToken, ocNativeSubagentSession(params.session, context.chatTaskOwnerId));
        } finally {
          cancellation.dispose();
        }
      } else {
        // OpenCode: 「权限」›「更多」——IDE 工具：禁止的直接拒绝；后台分支中需询问的在这里确认（前台由工作台确认）
        await this.ocEnforceChatPermission(context, name, args, true);
        if (context.isolatedRoot) {
          const isolatedRoot = import_node_path32.default.resolve(context.isolatedRoot);
          if (name === "get_diagnostics" || name === "lsp") {
            throw new Error("ISOLATED_BRANCH: diagnostics and LSP are unavailable in an isolated multi-model branch; use run_command to build or test inside the worktree.");
          }
          let isolatedArgs = args;
          if (name === "run_command" || name === "list_directory") {
            const key = name === "run_command" ? "cwd" : "path";
            const raw = typeof args[key] === "string" && args[key].trim() ? args[key].trim() : ".";
            const absolute = import_node_path32.default.isAbsolute(raw) ? import_node_path32.default.resolve(raw) : import_node_path32.default.resolve(isolatedRoot, raw);
            const relative = import_node_path32.default.relative(isolatedRoot, absolute);
            if (relative.startsWith("..") || import_node_path32.default.isAbsolute(relative)) {
              throw new Error(`ISOLATED_BRANCH: ${key} must stay inside the branch worktree ${isolatedRoot}.`);
            }
            isolatedArgs = { ...args, [key]: absolute };
          }
          if (context.chatTaskOwnerId) {
            let guardArgs = isolatedArgs;
            if (context.isolatedMainRoot && (name === "run_command" || name === "list_directory")) {
              const key = name === "run_command" ? "cwd" : "path";
              guardArgs = { ...isolatedArgs, [key]: import_node_path32.default.join(context.isolatedMainRoot, import_node_path32.default.relative(isolatedRoot, isolatedArgs[key])) };
            }
            await this.automation?.guard(name, guardArgs, context.chatTaskOwnerId);
          } else this.automation?.checkToolGates?.(name, isolatedArgs, "native-chat:unbound", { askAvailable: false });
          if (context.background) await this.approveBackgroundCommand(context, name, isolatedArgs, isolatedRoot);
          result = name === "list_directory" ? await this.ideToolBroker.invokeDirect(name, isolatedArgs, context.cancellationToken, void 0, [isolatedRoot]) : context.background ? await this.ideToolBroker.invokeDirect(name, isolatedArgs, context.cancellationToken) : await this.ideToolBroker.invoke(name, isolatedArgs, context, context.registeredToolNames.has(name));
        } else {
        if (name === "run_command" && context.requireExplicitCwd && (typeof args.cwd !== "string" || !import_node_path32.default.isAbsolute(args.cwd.trim()))) {
          throw new Error("USER_NAMED_FOLDER_NOT_OPEN: Supply an explicit absolute run_command.cwd for this terminal call, or add the folder to the workspace for file tools.");
        }
        const scopedArgs = name === "run_command" && !args.cwd ? { ...args, cwd: context.defaultWorkspaceRoot } : args;
        if (context.chatTaskOwnerId) await this.automation?.guard(name, scopedArgs, context.chatTaskOwnerId);
        // recovered.33: the hard tool gate also applies when no task owner is bound (ask → deny here).
        else this.automation?.checkToolGates?.(name, scopedArgs, "native-chat:unbound", { askAvailable: false });
        if (context.background) await this.approveBackgroundCommand(context, name, scopedArgs, context.defaultWorkspaceRoot ?? scopedArgs.cwd);
        // A parallel background branch has no chat request of its own: run IDE tools directly so their
        // progress is not attached to whichever request is last in the session.
        if (name === "list_directory" && ocNoOpenFolder()) {
          // No opened folder: list inside the dialogue's own roots instead of failing "No workspace root is configured."
          result = await this.ideToolBroker.invokeDirect(name, scopedArgs, context.cancellationToken, void 0, ocWithSkillsRoot(context.defaultWorkspaceRoots ?? [context.defaultWorkspaceRoot]));
        } else
        result = context.background ? await this.ideToolBroker.invokeDirect(name, scopedArgs, context.cancellationToken) : await this.ideToolBroker.invoke(name, scopedArgs, context, context.registeredToolNames.has(name));
        }
      }
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, result })}
`);
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32010, message: message2 } })}
`);
    }
  }
  /**
   * Background multi-model branches have no native chat confirmation: terminal commands that are not
   * clearly read-only wait here for the user's explicit approval (fails closed without an approver).
   */
  async approveBackgroundCommand(context, name, args, root) {
    if (name !== "run_command" && name !== "send_command_input") return;
    if (typeof context.approveCommand !== "function") {
      throw new Error("BACKGROUND_COMMAND_DENIED: this background branch has no approval channel for terminal commands; continue without running it.");
    }
    const verdict = await context.approveCommand(name, args, root);
    if (verdict?.allowed !== true) {
      throw new Error(`BACKGROUND_COMMAND_DENIED: the user did not approve this terminal command (${verdict?.reason || "denied"}). Do not retry the same command; continue without it or explain what you would have run.`);
    }
  }
  errorChain(error2) {
    const messages2 = [];
    let current = error2;
    for (let depth = 0; depth < 6 && current; depth += 1) {
      const message2 = current instanceof Error ? current.message : String(current);
      if (message2 && !messages2.includes(message2)) messages2.push(message2);
      current = current instanceof Error ? current.cause : void 0;
    }
    return messages2.join(": ") || "Unknown network error";
  }
  async handleNetworkFetchRequest(request) {
    const child = this.process;
    if (!child || child.killed || request.id === void 0) return;
    const streamId = String(request.id);
    const params = request.params && typeof request.params === "object" && !Array.isArray(request.params) ? request.params : {};
    const controller = new AbortController();
    this.networkFetchControllers.set(streamId, controller);
    let responseStarted = false;
    const send = (payload) => {
      if (!child.killed) child.stdin.write(`${JSON.stringify(payload)}
`);
    };
    try {
      const url2 = typeof params.url === "string" ? params.url : "";
      const parsedUrl = new URL(url2);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("Only HTTP and HTTPS URLs are supported.");
      const headers = new Headers();
      if (params.headers && typeof params.headers === "object" && !Array.isArray(params.headers)) {
        for (const [key, value] of Object.entries(params.headers)) {
          if (typeof value === "string") headers.set(key, value);
        }
      }
      const method = typeof params.method === "string" ? params.method : "GET";
      const httpConfiguration = vscode20.workspace.getConfiguration("http");
      const configuredProxy = httpConfiguration.get("proxy")?.trim();
      const proxySupport = httpConfiguration.get("proxySupport");
      const response = await fetchWithExtensionHostPolicyOnce(parsedUrl, {
        method,
        headers,
        body: typeof params.body === "string" ? params.body : void 0,
        signal: controller.signal,
        configuredProxy,
        proxySupport: proxySupport === "off" ? "off" : void 0,
        rejectUnauthorized: httpConfiguration.get("proxyStrictSSL", true)
      });
      responseStarted = true;
      send({
        jsonrpc: "2.0",
        id: request.id,
        result: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
      if (response.body) {
        const reader = response.body.getReader();
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            for (let offset = 0; offset < chunk.value.byteLength; offset += 64 * 1024) {
              const slice = chunk.value.subarray(offset, Math.min(chunk.value.byteLength, offset + 64 * 1024));
              send({ jsonrpc: "2.0", method: "network/fetch/chunk", params: { streamId, data: Buffer.from(slice).toString("base64") } });
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
      send({ jsonrpc: "2.0", method: "network/fetch/end", params: { streamId } });
    } catch (error2) {
      const message2 = this.errorChain(error2);
      if (responseStarted) {
        send({ jsonrpc: "2.0", method: "network/fetch/error", params: { streamId, message: message2 } });
      } else {
        send({ jsonrpc: "2.0", id: request.id, error: { code: -32020, message: `Extension-host fetch failed: ${message2}` } });
      }
    } finally {
      this.networkFetchControllers.delete(streamId);
    }
  }
  stop() {
    const child = this.process;
    this.process = void 0;
    if (child && !child.killed) child.kill();
    this.traceListeners.clear();
    this.runContexts.clear();
    for (const controller of this.networkFetchControllers.values()) controller.abort(new Error("OpenCode Agent Runtime stopped."));
    this.networkFetchControllers.clear();
    this.rejectPending(new Error("OpenCode Agent Runtime stopped."));
  }
  rejectPending(error2) {
    for (const pending of this.pending.values()) {
      if (pending.timer) clearTimeout(pending.timer);
      pending.reject(error2);
    }
    this.pending.clear();
  }
};
// Windows does not end child processes with their parent: track spawned helper trees and end them when the extension host exits,
// so nothing keeps files under the portable install (e.g. data\tmp) open after OpenCode closes.
var __ocChildTree = globalThis.__opencodeChildTree ??= (() => { const pids = new Set(); const killTree = (pid) => { if (!pid) return false; try { if (process.platform === "win32") { const r = require("node:child_process").spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true, timeout: 5e3, stdio: "ignore" }); return r.status === 0; } process.kill(pid, "SIGKILL"); return true; } catch { return false; } }; process.once("exit", () => { for (const pid of pids) killTree(pid); pids.clear(); }); return { add: (pid) => { if (pid) pids.add(pid); }, delete: (pid) => { pids.delete(pid); }, killTree }; })();
export { import_node_child_process8, import_node_readline, import_node_path32, vscode20, RuntimeRpcError, RuntimeClient };
