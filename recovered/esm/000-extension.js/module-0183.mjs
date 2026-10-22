// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/runtime-client.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { CHAT_BRIDGE_CONTROL_TOOL_NAMES } from "./module-0140.mjs";
import { fetchWithExtensionHostPolicyOnce } from "./module-0106.mjs";


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
    const runId = `run-${Date.now()}-${this.nextRunId++}`;
    if (onTrace) this.traceListeners.set(runId, onTrace);
    if (onCheckpoint) this.checkpointListeners.set(runId, onCheckpoint);
    if (invocationContext) {
      this.runContexts.set(runId, {
        ...invocationContext,
        defaultWorkspaceRoot: params.workspaceRoot,
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
    try {
      return await runPromise;
    } finally {
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
  async handleIdeToolRequest(request) {
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
      if (CHAT_BRIDGE_CONTROL_TOOL_NAMES.has(name)) {
        if (!context.registeredToolNames.has(name) || !context.chatTaskOwnerId || !this.dispatchChatTool) {
          throw new Error(`Chat control tool is not available for this request: ${name}`);
        }
        const controller = new AbortController();
        const cancellation = context.cancellationToken.onCancellationRequested(() => controller.abort());
        try {
          if (context.cancellationToken.isCancellationRequested) controller.abort();
          const taskArgs = name === "set_todos" || name === "update_plan" ? {
            ...args,
            ...context.chatOverviewModel ? { overview_model: context.chatOverviewModel } : {},
            overview_session_id: context.chatTaskOwnerId.slice("native-chat:".length)
          } : args;
          result = await this.dispatchChatTool(name, taskArgs, context.chatTaskOwnerId, controller.signal);
        } finally {
          cancellation.dispose();
        }
      } else {
        if (name === "run_command" && context.requireExplicitCwd && (typeof args.cwd !== "string" || !import_node_path32.default.isAbsolute(args.cwd.trim()))) {
          throw new Error("USER_NAMED_FOLDER_NOT_OPEN: Supply an explicit absolute run_command.cwd for this terminal call, or add the folder to the workspace for file tools.");
        }
        const scopedArgs = name === "run_command" && !args.cwd ? { ...args, cwd: context.defaultWorkspaceRoot } : args;
        if (context.chatTaskOwnerId) await this.automation?.guard(name, scopedArgs, context.chatTaskOwnerId);
        result = await this.ideToolBroker.invoke(name, scopedArgs, context, context.registeredToolNames.has(name));
      }
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, result })}
`);
    } catch (error2) {
      const message2 = error2 instanceof Error ? error2.message : String(error2);
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32010, message: message2 } })}
`);
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
export { import_node_child_process8, import_node_readline, import_node_path32, vscode20, RuntimeRpcError, RuntimeClient };
