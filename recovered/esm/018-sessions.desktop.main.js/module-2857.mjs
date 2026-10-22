// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpServerRequestHandler.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { JsonRpcError, JsonRpcProtocol } from "./module-2856.mjs";
import { MCP } from "./module-1205.mjs";
import { canLog, log } from "./module-0095.mjs";
import { autorun } from "./module-0052.mjs";
import { McpConnectionState, McpError, MpcResponseError } from "./module-1206.mjs";
import { equals } from "./module-0007.mjs";
import { DeferredPromise, IntervalTimer, disposableTimeout, isThenable } from "./module-0036.mjs";
import { IProductService } from "./module-0875.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { CancellationError } from "./module-0004.mjs";
import { assertNever, softAssertNever } from "./module-0009.mjs";
import { isTaskResult, translateMcpLogMessage } from "./module-2174.mjs";
import { Iterable } from "./module-0011.mjs";
import { observableValue } from "./module-0048.mjs";
import { transaction } from "./module-0045.mjs";
import { ObservablePromise } from "./module-0055.mjs";


// src/vs/workbench/contrib/mcp/common/mcpServerRequestHandler.ts
var McpServerRequestHandler = class _McpServerRequestHandler extends Disposable {
  constructor({
    launch,
    logger,
    createMessageRequestHandler,
    elicitationRequestHandler,
    requestLogLevel = 2 /* Debug */,
    requestTimeoutMs,
    taskManager
  }) {
    super();
    this._hasAnnouncedRoots = false;
    this._roots = [];
    // Event emitters for server notifications
    this._onDidReceiveCancelledNotification = this._register(new Emitter());
    this.onDidReceiveCancelledNotification = this._onDidReceiveCancelledNotification.event;
    this._onDidReceiveProgressNotification = this._register(new Emitter());
    this.onDidReceiveProgressNotification = this._onDidReceiveProgressNotification.event;
    this._onDidReceiveElicitationCompleteNotification = this._register(new Emitter());
    this.onDidReceiveElicitationCompleteNotification = this._onDidReceiveElicitationCompleteNotification.event;
    this._onDidChangeResourceList = this._register(new Emitter());
    this.onDidChangeResourceList = this._onDidChangeResourceList.event;
    this._onDidUpdateResource = this._register(new Emitter());
    this.onDidUpdateResource = this._onDidUpdateResource.event;
    this._onDidChangeToolList = this._register(new Emitter());
    this.onDidChangeToolList = this._onDidChangeToolList.event;
    this._onDidChangePromptList = this._register(new Emitter());
    this.onDidChangePromptList = this._onDidChangePromptList.event;
    this._launch = launch;
    this.logger = logger;
    this._requestLogLevel = requestLogLevel;
    this._requestTimeoutMs = requestTimeoutMs;
    this._createMessageRequestHandler = createMessageRequestHandler;
    this._elicitationRequestHandler = elicitationRequestHandler;
    this._taskManager = taskManager;
    this._rpc = this._register(new JsonRpcProtocol(
      (message) => this.send(message),
      {
        handleRequest: (request2, token) => this.handleServerRequest(request2, token),
        handleNotification: (notification) => this.handleServerNotification(notification)
      }
    ));
    this._taskManager.setHandler(this);
    this._register(this._taskManager.onDidUpdateTask((task) => {
      this.send({
        jsonrpc: MCP.JSONRPC_VERSION,
        method: "notifications/tasks/status",
        params: task
      });
    }));
    this._register(toDisposable(() => this._taskManager.setHandler(void 0)));
    this._register(launch.onDidReceiveMessage((message) => {
      if (canLog(this.logger.getLevel(), this._requestLogLevel)) {
        log(this.logger, this._requestLogLevel, `[server -> editor] ${JSON.stringify(message)}`);
      }
      void this._rpc.handleMessage(message);
    }));
    this._register(autorun((reader) => {
      const state = launch.state.read(reader).state;
      if (state === McpConnectionState.Kind.Error || state === McpConnectionState.Kind.Stopped) {
        this.cancelAllRequests();
      }
    }));
    this._register(logger.onDidChangeLogLevel((logLevel) => {
      this._sendLogLevelToServer(logLevel);
    }));
  }
  set roots(roots) {
    if (!equals(this._roots, roots)) {
      this._roots = roots;
      if (this._hasAnnouncedRoots) {
        this.sendNotification({ method: "notifications/roots/list_changed" });
        this._hasAnnouncedRoots = false;
      }
    }
  }
  get capabilities() {
    return this._serverInit.capabilities;
  }
  get serverInfo() {
    return this._serverInit.serverInfo;
  }
  get serverInstructions() {
    return this._serverInit.instructions;
  }
  /**
   * Connects to the MCP server and does the initialization handshake.
   * @throws MpcResponseError if the server fails to initialize.
   */
  static async create(instaService, opts, token) {
    const mcp = new _McpServerRequestHandler(opts);
    const store = new DisposableStore();
    try {
      const timer = store.add(new IntervalTimer());
      timer.cancelAndSet(() => {
        opts.logger.info("Waiting for server to respond to `initialize` request...");
      }, 5e3);
      await instaService.invokeFunction(async (accessor) => {
        const productService = accessor.get(IProductService);
        const initialized = await mcp.sendRequest({
          method: "initialize",
          params: {
            protocolVersion: MCP.LATEST_PROTOCOL_VERSION,
            capabilities: {
              roots: { listChanged: true },
              sampling: opts.createMessageRequestHandler ? {} : void 0,
              elicitation: opts.elicitationRequestHandler ? { form: {}, url: {} } : void 0,
              tasks: {
                list: {},
                cancel: {},
                requests: {
                  sampling: opts.createMessageRequestHandler ? { createMessage: {} } : void 0,
                  elicitation: opts.elicitationRequestHandler ? { create: {} } : void 0
                }
              },
              extensions: {
                "io.modelcontextprotocol/ui": {
                  mimeTypes: ["text/html;profile=mcp-app"]
                }
              }
            },
            clientInfo: {
              name: productService.nameLong,
              version: productService.version
            }
          }
        }, token);
        mcp._serverInit = initialized;
        mcp._sendLogLevelToServer(opts.logger.getLevel());
        mcp.sendNotification({
          method: "notifications/initialized"
        });
      });
      return mcp;
    } catch (e4) {
      mcp.dispose();
      throw e4;
    } finally {
      store.dispose();
    }
  }
  /**
   * Send a client request to the server and return the response.
   *
   * @param request The request to send
   * @param token Cancellation token
   * @param timeoutMs Optional timeout in milliseconds
   * @returns A promise that resolves with the response
   */
  async sendRequest(request2, token = CancellationToken.None) {
    if (this._store.isDisposed) {
      return Promise.reject(new CancellationError());
    }
    const deadline = this._requestTimeoutMs === void 0 ? void 0 : new CancellationTokenSource(token);
    let timedOut = false;
    const timer = deadline ? disposableTimeout(() => {
      timedOut = true;
      deadline.cancel();
    }, this._requestTimeoutMs) : void 0;
    try {
      return await this._rpc.sendRequest(
        request2,
        deadline?.token ?? token,
        (id2) => this.sendNotification({ method: "notifications/cancelled", params: { requestId: id2 } })
      ).catch((error) => {
        if (timedOut) {
          throw new Error("MCP request timed out.");
        }
        if (error instanceof JsonRpcError) {
          throw new MpcResponseError(error.message, error.code, error.data);
        }
        throw error;
      });
    } finally {
      timer?.dispose();
      deadline?.dispose();
    }
  }
  send(mcp) {
    if (canLog(this.logger.getLevel(), this._requestLogLevel)) {
      log(this.logger, this._requestLogLevel, `[editor -> server] ${JSON.stringify(mcp)}`);
    }
    this._launch.send(mcp);
  }
  /**
   * Handles paginated requests by making multiple requests until all items are retrieved.
   *
   * @param method The method name to call
   * @param getItems Function to extract the array of items from a result
   * @param initialParams Initial parameters
   * @param token Cancellation token
   * @returns Promise with all items combined
   */
  async *sendRequestPaginated(method, getItems, initialParams, token = CancellationToken.None) {
    let nextCursor = void 0;
    do {
      const params = {
        ...initialParams,
        cursor: nextCursor
      };
      const result = await this.sendRequest({ method, params }, token);
      yield getItems(result);
      nextCursor = result.nextCursor;
    } while (nextCursor !== void 0 && !token.isCancellationRequested);
  }
  sendNotification(notification) {
    this.send({ ...notification, jsonrpc: MCP.JSONRPC_VERSION });
  }
  /**
   * Handle incoming server requests
   */
  handleServerRequest(request2, token) {
    const mapError = (error) => {
      if (error instanceof McpError) {
        return new JsonRpcError(error.code, error.message, error.data);
      }
      this.logger.error(`Error handling request ${request2.method}:`, error);
      const mcpError = McpError.unknown(error instanceof Error ? error : new Error(String(error)));
      return new JsonRpcError(mcpError.code, mcpError.message, mcpError.data);
    };
    try {
      let result;
      if (request2.method === "ping") {
        result = this.handlePing(request2);
      } else if (request2.method === "roots/list") {
        result = this.handleRootsList(request2);
      } else if (request2.method === "sampling/createMessage" && this._createMessageRequestHandler) {
        if (request2.params.task) {
          const taskResult = this._taskManager.createTask(
            request2.params.task.ttl ?? null,
            (token2) => this._createMessageRequestHandler(request2.params, token2)
          );
          taskResult._meta ??= {};
          taskResult._meta["io.modelcontextprotocol/related-task"] = { taskId: taskResult.task.taskId };
          result = taskResult;
        } else {
          result = this._createMessageRequestHandler(request2.params, token);
        }
      } else if (request2.method === "elicitation/create" && this._elicitationRequestHandler) {
        if (request2.params.task) {
          const taskResult = this._taskManager.createTask(
            request2.params.task.ttl ?? null,
            (token2) => this._elicitationRequestHandler(request2.params, token2)
          );
          taskResult._meta ??= {};
          taskResult._meta["io.modelcontextprotocol/related-task"] = { taskId: taskResult.task.taskId };
          result = taskResult;
        } else {
          result = this._elicitationRequestHandler(request2.params, token);
        }
      } else if (request2.method === "tasks/get") {
        result = this._taskManager.getTask(request2.params.taskId);
      } else if (request2.method === "tasks/result") {
        result = this._taskManager.getTaskResult(request2.params.taskId);
      } else if (request2.method === "tasks/cancel") {
        result = this._taskManager.cancelTask(request2.params.taskId);
      } else if (request2.method === "tasks/list") {
        result = this._taskManager.listTasks();
      } else {
        throw McpError.methodNotFound(request2.method);
      }
      if (isThenable(result)) {
        return result.then(void 0, (error) => {
          throw mapError(error);
        });
      }
      return result;
    } catch (e4) {
      throw mapError(e4);
    }
  }
  /**
   * Handle incoming server notifications
   */
  handleServerNotification(request2) {
    try {
      switch (request2.method) {
        case "notifications/message":
          return this.handleLoggingNotification(request2);
        case "notifications/cancelled":
          this._onDidReceiveCancelledNotification.fire(request2);
          return this.handleCancelledNotification(request2);
        case "notifications/progress":
          this._onDidReceiveProgressNotification.fire(request2);
          return;
        case "notifications/resources/list_changed":
          this._onDidChangeResourceList.fire();
          return;
        case "notifications/resources/updated":
          this._onDidUpdateResource.fire(request2);
          return;
        case "notifications/tools/list_changed":
          this._onDidChangeToolList.fire();
          return;
        case "notifications/prompts/list_changed":
          this._onDidChangePromptList.fire();
          return;
        case "notifications/elicitation/complete":
          this._onDidReceiveElicitationCompleteNotification.fire(request2);
          return;
        case "notifications/tasks/status":
          this._taskManager.getClientTask(request2.params.taskId)?.onDidUpdateState(request2.params);
          return;
        default:
          softAssertNever(request2);
      }
    } catch (error) {
      this.logger.error(`Error handling notification ${request2.method}:`, error);
    }
  }
  handleCancelledNotification(request2) {
    if (request2.params.requestId) {
      this._rpc.cancelPendingRequest(request2.params.requestId);
    }
  }
  handleLoggingNotification(request2) {
    translateMcpLogMessage(this.logger, request2.params);
  }
  /**
   * Send a response to a ping request
   */
  handlePing(_request) {
    return {};
  }
  /**
   * Send a response to a roots/list request
   */
  handleRootsList(_request) {
    this._hasAnnouncedRoots = true;
    return { roots: this._roots };
  }
  cancelAllRequests() {
    this._rpc.cancelAllRequests();
  }
  dispose() {
    this.cancelAllRequests();
    super.dispose();
  }
  /**
   * Forwards log level changes to the MCP server if it supports logging
   */
  async _sendLogLevelToServer(logLevel) {
    try {
      if (!this.capabilities.logging) {
        return;
      }
      await this.setLevel({ level: mapLogLevelToMcp(logLevel) });
    } catch (error) {
      this.logger.error(`Failed to set MCP server log level: ${error}`);
    }
  }
  /**
   * Send an initialize request
   */
  initialize(params, token) {
    return this.sendRequest({ method: "initialize", params }, token);
  }
  /**
   * List available resources
   */
  listResources(params, token) {
    return Iterable.asyncToArrayFlat(this.listResourcesIterable(params, token));
  }
  /**
   * List available resources (iterable)
   */
  listResourcesIterable(params, token) {
    return this.sendRequestPaginated("resources/list", (result) => result.resources, params, token);
  }
  /**
   * Read a specific resource
   */
  readResource(params, token) {
    return this.sendRequest({ method: "resources/read", params }, token);
  }
  /**
   * List available resource templates
   */
  listResourceTemplates(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("resources/templates/list", (result) => result.resourceTemplates, params, token));
  }
  /**
   * Subscribe to resource updates
   */
  subscribe(params, token) {
    return this.sendRequest({ method: "resources/subscribe", params }, token);
  }
  /**
   * Unsubscribe from resource updates
   */
  unsubscribe(params, token) {
    return this.sendRequest({ method: "resources/unsubscribe", params }, token);
  }
  /**
   * List available prompts
   */
  listPrompts(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("prompts/list", (result) => result.prompts, params, token));
  }
  /**
   * Get a specific prompt
   */
  getPrompt(params, token) {
    return this.sendRequest({ method: "prompts/get", params }, token);
  }
  /**
   * List available tools
   */
  listTools(params, token) {
    return Iterable.asyncToArrayFlat(this.sendRequestPaginated("tools/list", (result) => result.tools, params, token));
  }
  /**
   * Call a specific tool. Supports tasks automatically if `task` is set on the request.
   */
  async callTool(params, token, onStatusMessage) {
    const response = await this.sendRequest({ method: "tools/call", params }, token);
    if (isTaskResult(response)) {
      const task = new McpTask(response.task, token, onStatusMessage);
      this._taskManager.adoptClientTask(task);
      task.setHandler(this);
      return task.result.finally(() => {
        this._taskManager.abandonClientTask(task.id);
      });
    }
    return response;
  }
  /**
   * Set the logging level
   */
  setLevel(params, token) {
    return this.sendRequest({ method: "logging/setLevel", params }, token);
  }
  /**
   * Find completions for an argument
   */
  complete(params, token) {
    return this.sendRequest({ method: "completion/complete", params }, token);
  }
  /**
   * Get task status
   */
  getTask(params, token) {
    return this.sendRequest({ method: "tasks/get", params }, token);
  }
  /**
   * Get task result
   */
  getTaskResult(params, token) {
    return this.sendRequest({ method: "tasks/result", params }, token);
  }
  /**
   * Cancel a task
   */
  cancelTask(params, token) {
    return this.sendRequest({ method: "tasks/cancel", params }, token);
  }
  /**
   * List all tasks
   */
  listTasks(params, token) {
    return Iterable.asyncToArrayFlat(
      this.sendRequestPaginated(
        "tasks/list",
        (result) => result.tasks,
        params,
        token
      )
    );
  }
};

function isTaskInTerminalState(task) {
  return task.status === "completed" || task.status === "failed" || task.status === "cancelled";
}

var McpTask = class extends Disposable {
  constructor(_task, _token = CancellationToken.None, _onStatusMessage) {
    super();
    this._task = _task;
    this._onStatusMessage = _onStatusMessage;
    this.promise = new DeferredPromise();
    this._handler = observableValue("mcpTaskHandler", void 0);
    const expiresAt = _task.ttl ? Date.now() + _task.ttl : void 0;
    this._lastTaskState = observableValue("lastTaskState", this._task);
    const store = this._register(new DisposableStore());
    if (_token.isCancellationRequested) {
      this._lastTaskState.set({ ...this._task, status: "cancelled" }, void 0);
    } else {
      store.add(_token.onCancellationRequested(() => {
        const current = this._lastTaskState.get();
        if (!isTaskInTerminalState(current)) {
          this._lastTaskState.set({ ...current, status: "cancelled" }, void 0);
        }
      }));
    }
    if (expiresAt) {
      const ttlTimeout = expiresAt - Date.now();
      if (ttlTimeout <= 0) {
        this._lastTaskState.set({ ...this._task, status: "cancelled", statusMessage: "Task timed out." }, void 0);
      } else {
        store.add(disposableTimeout(() => {
          const current = this._lastTaskState.get();
          if (!isTaskInTerminalState(current)) {
            this._lastTaskState.set({ ...current, status: "cancelled", statusMessage: "Task timed out." }, void 0);
          }
        }, ttlTimeout));
      }
    }
    const inputRequiredLookup = observableValue("activeResultLookup", void 0);
    store.add(autorun((reader) => {
      const current = this._lastTaskState.read(reader);
      if (isTaskInTerminalState(current)) {
        return;
      }
      const lookup = inputRequiredLookup.read(reader);
      if (lookup) {
        const result = lookup.promiseResult.read(reader);
        return transaction((tx) => {
          if (!result) {
          } else if (result.data) {
            inputRequiredLookup.set(void 0, tx);
            this._lastTaskState.set(result.data, tx);
          } else {
            inputRequiredLookup.set(void 0, tx);
            if (result.error instanceof McpError && result.error.code === MCP.INVALID_PARAMS) {
              this._lastTaskState.set({ ...current, status: "cancelled" }, void 0);
            } else {
              this._lastTaskState.set({ ...current, status: "working" }, void 0);
            }
          }
        });
      }
      const handler = this._handler.read(reader);
      if (!handler) {
        return;
      }
      const pollInterval = _task.pollInterval ?? 2e3;
      const cts = new CancellationTokenSource(_token);
      reader.store.add(toDisposable(() => cts.dispose(true)));
      reader.store.add(disposableTimeout(() => {
        handler.getTask({ taskId: current.taskId }, cts.token).catch((e4) => {
          if (e4 instanceof McpError && e4.code === MCP.INVALID_PARAMS) {
            return { ...current, status: "cancelled" };
          } else {
            return { ...current };
          }
        }).then((r2) => {
          if (r2 && !cts.token.isCancellationRequested) {
            this._lastTaskState.set(r2, void 0);
          }
        });
      }, pollInterval));
    }));
    const lastStatus = this._lastTaskState.map((task) => task.status);
    store.add(autorun((reader) => {
      const status2 = lastStatus.read(reader);
      if (status2 === "failed") {
        const current = this._lastTaskState.read(void 0);
        this.promise.error(new Error(`Task ${current.taskId} failed: ${current.statusMessage ?? "unknown error"}`));
        store.dispose();
      } else if (status2 === "cancelled") {
        this.promise.cancel();
        store.dispose();
      } else if (status2 === "input_required") {
        const handler = this._handler.read(reader);
        if (handler) {
          const current = this._lastTaskState.read(void 0);
          const cts = new CancellationTokenSource(_token);
          reader.store.add(toDisposable(() => cts.dispose(true)));
          inputRequiredLookup.set(new ObservablePromise(handler.getTask({ taskId: current.taskId }, cts.token)), void 0);
        }
      } else if (status2 === "completed") {
        const handler = this._handler.read(reader);
        if (handler) {
          this.promise.settleWith(handler.getTaskResult({ taskId: _task.taskId }, _token));
          store.dispose();
        }
      } else if (status2 === "working") {
      } else {
        softAssertNever(status2);
      }
    }));
  }
  get result() {
    return this.promise.p;
  }
  get id() {
    return this._task.taskId;
  }
  onDidUpdateState(task) {
    this._lastTaskState.set(task, void 0);
    if (task.statusMessage && this._onStatusMessage) {
      this._onStatusMessage(task.statusMessage);
    }
  }
  setHandler(handler) {
    this._handler.set(handler, void 0);
  }
};

function mapLogLevelToMcp(logLevel) {
  switch (logLevel) {
    case 1 /* Trace */:
      return "debug";
    // MCP doesn't have trace, use debug
    case 2 /* Debug */:
      return "debug";
    case 3 /* Info */:
      return "info";
    case 4 /* Warning */:
      return "warning";
    case 5 /* Error */:
      return "error";
    case 0 /* Off */:
      return "emergency";
    // MCP doesn't have off, use emergency
    default:
      return assertNever(logLevel);
  }
}
export { isTaskInTerminalState, mapLogLevelToMcp, McpServerRequestHandler, McpTask };
