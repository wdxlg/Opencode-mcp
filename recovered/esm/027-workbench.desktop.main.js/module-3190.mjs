// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/rawDebugSession.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { formatPII, isUriString } from "./module-1059.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationError, ErrorNoTelemetry } from "./module-0004.mjs";
import { Schemas } from "./module-0033.mjs";
import { createErrorWithActions } from "./module-0094.mjs";
import { toAction } from "./module-0082.mjs";
import { mixin } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionHostDebugService } from "./module-2402.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/debug/browser/rawDebugSession.ts
var RawDebugSession = class {
  constructor(debugAdapter, dbgr, sessionId, name, extensionHostDebugService, openerService, notificationService, dialogSerivce) {
    this.dbgr = dbgr;
    this.sessionId = sessionId;
    this.name = name;
    this.extensionHostDebugService = extensionHostDebugService;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this.dialogSerivce = dialogSerivce;
    this.allThreadsContinued = true;
    this._readyForBreakpoints = false;
    // shutdown
    this.debugAdapterStopped = false;
    this.inShutdown = false;
    this.terminated = false;
    this.firedAdapterExitEvent = false;
    // telemetry
    this.startTime = 0;
    this.didReceiveStoppedEvent = false;
    this.toDispose = new DisposableStore();
    // DAP events
    this._onDidInitialize = this.toDispose.add(new Emitter());
    this._onDidStop = this.toDispose.add(new Emitter());
    this._onDidContinued = this.toDispose.add(new Emitter());
    this._onDidTerminateDebugee = this.toDispose.add(new Emitter());
    this._onDidExitDebugee = this.toDispose.add(new Emitter());
    this._onDidThread = this.toDispose.add(new Emitter());
    this._onDidOutput = this.toDispose.add(new Emitter());
    this._onDidBreakpoint = this.toDispose.add(new Emitter());
    this._onDidLoadedSource = this.toDispose.add(new Emitter());
    this._onDidProgressStart = this.toDispose.add(new Emitter());
    this._onDidProgressUpdate = this.toDispose.add(new Emitter());
    this._onDidProgressEnd = this.toDispose.add(new Emitter());
    this._onDidInvalidated = this.toDispose.add(new Emitter());
    this._onDidInvalidateMemory = this.toDispose.add(new Emitter());
    this._onDidCustomEvent = this.toDispose.add(new Emitter());
    this._onDidEvent = this.toDispose.add(new Emitter());
    // DA events
    this._onDidExitAdapter = this.toDispose.add(new Emitter());
    this.stoppedSinceLastStep = false;
    this.debugAdapter = debugAdapter;
    this._capabilities = /* @__PURE__ */ Object.create(null);
    this.toDispose.add(this.debugAdapter.onError((err) => {
      this.shutdown(err);
    }));
    this.toDispose.add(this.debugAdapter.onExit((code) => {
      if (code !== 0) {
        this.shutdown(new Error(`exit code: ${code}`));
      } else {
        this.shutdown();
      }
    }));
    this.debugAdapter.onEvent((event) => {
      switch (event.event) {
        case "initialized":
          this._readyForBreakpoints = true;
          this._onDidInitialize.fire(event);
          break;
        case "loadedSource":
          this._onDidLoadedSource.fire(event);
          break;
        case "capabilities":
          if (event.body) {
            const capabilities = event.body.capabilities;
            this.mergeCapabilities(capabilities);
          }
          break;
        case "stopped":
          this.didReceiveStoppedEvent = true;
          this.stoppedSinceLastStep = true;
          this._onDidStop.fire(event);
          break;
        case "continued":
          this.allThreadsContinued = event.body.allThreadsContinued === false ? false : true;
          this._onDidContinued.fire(event);
          break;
        case "thread":
          this._onDidThread.fire(event);
          break;
        case "output":
          this._onDidOutput.fire(event);
          break;
        case "breakpoint":
          this._onDidBreakpoint.fire(event);
          break;
        case "terminated":
          this._onDidTerminateDebugee.fire(event);
          break;
        case "exited":
          this._onDidExitDebugee.fire(event);
          break;
        case "progressStart":
          this._onDidProgressStart.fire(event);
          break;
        case "progressUpdate":
          this._onDidProgressUpdate.fire(event);
          break;
        case "progressEnd":
          this._onDidProgressEnd.fire(event);
          break;
        case "invalidated":
          this._onDidInvalidated.fire(event);
          break;
        case "memory":
          this._onDidInvalidateMemory.fire(event);
          break;
        case "process":
          break;
        case "module":
          break;
        default:
          this._onDidCustomEvent.fire(event);
          break;
      }
      this._onDidEvent.fire(event);
    });
    this.debugAdapter.onRequest((request2) => this.dispatchRequest(request2));
  }
  get isInShutdown() {
    return this.inShutdown;
  }
  get onDidExitAdapter() {
    return this._onDidExitAdapter.event;
  }
  get capabilities() {
    return this._capabilities;
  }
  /**
   * DA is ready to accepts setBreakpoint requests.
   * Becomes true after "initialized" events has been received.
   */
  get readyForBreakpoints() {
    return this._readyForBreakpoints;
  }
  //---- DAP events
  get onDidInitialize() {
    return this._onDidInitialize.event;
  }
  get onDidStop() {
    return this._onDidStop.event;
  }
  get onDidContinued() {
    return this._onDidContinued.event;
  }
  get onDidTerminateDebugee() {
    return this._onDidTerminateDebugee.event;
  }
  get onDidExitDebugee() {
    return this._onDidExitDebugee.event;
  }
  get onDidThread() {
    return this._onDidThread.event;
  }
  get onDidOutput() {
    return this._onDidOutput.event;
  }
  get onDidBreakpoint() {
    return this._onDidBreakpoint.event;
  }
  get onDidLoadedSource() {
    return this._onDidLoadedSource.event;
  }
  get onDidCustomEvent() {
    return this._onDidCustomEvent.event;
  }
  get onDidProgressStart() {
    return this._onDidProgressStart.event;
  }
  get onDidProgressUpdate() {
    return this._onDidProgressUpdate.event;
  }
  get onDidProgressEnd() {
    return this._onDidProgressEnd.event;
  }
  get onDidInvalidated() {
    return this._onDidInvalidated.event;
  }
  get onDidInvalidateMemory() {
    return this._onDidInvalidateMemory.event;
  }
  get onDidEvent() {
    return this._onDidEvent.event;
  }
  //---- DebugAdapter lifecycle
  /**
   * Starts the underlying debug adapter and tracks the session time for telemetry.
   */
  async start() {
    if (!this.debugAdapter) {
      return Promise.reject(new Error(localize(14624, null)));
    }
    await this.debugAdapter.startSession();
    this.startTime = (/* @__PURE__ */ new Date()).getTime();
  }
  /**
   * Send client capabilities to the debug adapter and receive DA capabilities in return.
   */
  async initialize(args2) {
    const response = await this.send("initialize", args2, void 0, void 0, false);
    if (response) {
      this.mergeCapabilities(response.body);
    }
    return response;
  }
  /**
   * Terminate the debuggee and shutdown the adapter
   */
  disconnect(args2) {
    const terminateDebuggee = this.capabilities.supportTerminateDebuggee ? args2.terminateDebuggee : void 0;
    const suspendDebuggee = this.capabilities.supportTerminateDebuggee && this.capabilities.supportSuspendDebuggee ? args2.suspendDebuggee : void 0;
    return this.shutdown(void 0, args2.restart, terminateDebuggee, suspendDebuggee);
  }
  //---- DAP requests
  async launchOrAttach(config) {
    const response = await this.send(config.request, config, void 0, void 0, false);
    if (response) {
      this.mergeCapabilities(response.body);
    }
    return response;
  }
  /**
   * Try killing the debuggee softly...
   */
  terminate(restart = false) {
    if (this.capabilities.supportsTerminateRequest) {
      if (!this.terminated) {
        this.terminated = true;
        return this.send("terminate", { restart }, void 0);
      }
      return this.disconnect({ terminateDebuggee: true, restart });
    }
    return Promise.reject(new Error("terminated not supported"));
  }
  restart(args2) {
    if (this.capabilities.supportsRestartRequest) {
      return this.send("restart", args2);
    }
    return Promise.reject(new Error("restart not supported"));
  }
  async next(args2) {
    this.stoppedSinceLastStep = false;
    const response = await this.send("next", args2);
    if (!this.stoppedSinceLastStep) {
      this.fireSimulatedContinuedEvent(args2.threadId);
    }
    return response;
  }
  async stepIn(args2) {
    this.stoppedSinceLastStep = false;
    const response = await this.send("stepIn", args2);
    if (!this.stoppedSinceLastStep) {
      this.fireSimulatedContinuedEvent(args2.threadId);
    }
    return response;
  }
  async stepOut(args2) {
    this.stoppedSinceLastStep = false;
    const response = await this.send("stepOut", args2);
    if (!this.stoppedSinceLastStep) {
      this.fireSimulatedContinuedEvent(args2.threadId);
    }
    return response;
  }
  async continue(args2) {
    this.stoppedSinceLastStep = false;
    const response = await this.send("continue", args2);
    if (response && response.body && response.body.allThreadsContinued !== void 0) {
      this.allThreadsContinued = response.body.allThreadsContinued;
    }
    if (!this.stoppedSinceLastStep) {
      this.fireSimulatedContinuedEvent(args2.threadId, this.allThreadsContinued);
    }
    return response;
  }
  pause(args2) {
    return this.send("pause", args2);
  }
  terminateThreads(args2) {
    if (this.capabilities.supportsTerminateThreadsRequest) {
      return this.send("terminateThreads", args2);
    }
    return Promise.reject(new Error("terminateThreads not supported"));
  }
  setVariable(args2) {
    if (this.capabilities.supportsSetVariable) {
      return this.send("setVariable", args2);
    }
    return Promise.reject(new Error("setVariable not supported"));
  }
  setExpression(args2) {
    if (this.capabilities.supportsSetExpression) {
      return this.send("setExpression", args2);
    }
    return Promise.reject(new Error("setExpression not supported"));
  }
  async restartFrame(args2, threadId) {
    if (this.capabilities.supportsRestartFrame) {
      this.stoppedSinceLastStep = false;
      const response = await this.send("restartFrame", args2);
      if (!this.stoppedSinceLastStep) {
        this.fireSimulatedContinuedEvent(threadId);
      }
      return response;
    }
    return Promise.reject(new Error("restartFrame not supported"));
  }
  stepInTargets(args2) {
    if (this.capabilities.supportsStepInTargetsRequest) {
      return this.send("stepInTargets", args2);
    }
    return Promise.reject(new Error("stepInTargets not supported"));
  }
  completions(args2, token) {
    if (this.capabilities.supportsCompletionsRequest) {
      return this.send("completions", args2, token);
    }
    return Promise.reject(new Error("completions not supported"));
  }
  setBreakpoints(args2) {
    return this.send("setBreakpoints", args2);
  }
  setFunctionBreakpoints(args2) {
    if (this.capabilities.supportsFunctionBreakpoints) {
      return this.send("setFunctionBreakpoints", args2);
    }
    return Promise.reject(new Error("setFunctionBreakpoints not supported"));
  }
  dataBreakpointInfo(args2) {
    if (this.capabilities.supportsDataBreakpoints) {
      return this.send("dataBreakpointInfo", args2);
    }
    return Promise.reject(new Error("dataBreakpointInfo not supported"));
  }
  setDataBreakpoints(args2) {
    if (this.capabilities.supportsDataBreakpoints) {
      return this.send("setDataBreakpoints", args2);
    }
    return Promise.reject(new Error("setDataBreakpoints not supported"));
  }
  setExceptionBreakpoints(args2) {
    return this.send("setExceptionBreakpoints", args2);
  }
  breakpointLocations(args2) {
    if (this.capabilities.supportsBreakpointLocationsRequest) {
      return this.send("breakpointLocations", args2);
    }
    return Promise.reject(new Error("breakpointLocations is not supported"));
  }
  configurationDone() {
    if (this.capabilities.supportsConfigurationDoneRequest) {
      return this.send("configurationDone", null);
    }
    return Promise.reject(new Error("configurationDone not supported"));
  }
  stackTrace(args2, token) {
    return this.send("stackTrace", args2, token);
  }
  exceptionInfo(args2) {
    if (this.capabilities.supportsExceptionInfoRequest) {
      return this.send("exceptionInfo", args2);
    }
    return Promise.reject(new Error("exceptionInfo not supported"));
  }
  scopes(args2, token) {
    return this.send("scopes", args2, token);
  }
  variables(args2, token) {
    return this.send("variables", args2, token);
  }
  source(args2) {
    return this.send("source", args2);
  }
  locations(args2) {
    return this.send("locations", args2);
  }
  loadedSources(args2) {
    if (this.capabilities.supportsLoadedSourcesRequest) {
      return this.send("loadedSources", args2);
    }
    return Promise.reject(new Error("loadedSources not supported"));
  }
  threads() {
    return this.send("threads", null);
  }
  evaluate(args2) {
    return this.send("evaluate", args2);
  }
  async stepBack(args2) {
    if (this.capabilities.supportsStepBack) {
      this.stoppedSinceLastStep = false;
      const response = await this.send("stepBack", args2);
      if (!this.stoppedSinceLastStep) {
        this.fireSimulatedContinuedEvent(args2.threadId);
      }
      return response;
    }
    return Promise.reject(new Error("stepBack not supported"));
  }
  async reverseContinue(args2) {
    if (this.capabilities.supportsStepBack) {
      this.stoppedSinceLastStep = false;
      const response = await this.send("reverseContinue", args2);
      if (!this.stoppedSinceLastStep) {
        this.fireSimulatedContinuedEvent(args2.threadId);
      }
      return response;
    }
    return Promise.reject(new Error("reverseContinue not supported"));
  }
  gotoTargets(args2) {
    if (this.capabilities.supportsGotoTargetsRequest) {
      return this.send("gotoTargets", args2);
    }
    return Promise.reject(new Error("gotoTargets is not supported"));
  }
  async goto(args2) {
    if (this.capabilities.supportsGotoTargetsRequest) {
      this.stoppedSinceLastStep = false;
      const response = await this.send("goto", args2);
      if (!this.stoppedSinceLastStep) {
        this.fireSimulatedContinuedEvent(args2.threadId);
      }
      return response;
    }
    return Promise.reject(new Error("goto is not supported"));
  }
  async setInstructionBreakpoints(args2) {
    if (this.capabilities.supportsInstructionBreakpoints) {
      return await this.send("setInstructionBreakpoints", args2);
    }
    return Promise.reject(new Error("setInstructionBreakpoints is not supported"));
  }
  async disassemble(args2) {
    if (this.capabilities.supportsDisassembleRequest) {
      return await this.send("disassemble", args2);
    }
    return Promise.reject(new Error("disassemble is not supported"));
  }
  async readMemory(args2) {
    if (this.capabilities.supportsReadMemoryRequest) {
      return await this.send("readMemory", args2);
    }
    return Promise.reject(new Error("readMemory is not supported"));
  }
  async writeMemory(args2) {
    if (this.capabilities.supportsWriteMemoryRequest) {
      return await this.send("writeMemory", args2);
    }
    return Promise.reject(new Error("writeMemory is not supported"));
  }
  cancel(args2) {
    return this.send("cancel", args2);
  }
  custom(request2, args2) {
    return this.send(request2, args2);
  }
  //---- private
  async shutdown(error, restart = false, terminateDebuggee = void 0, suspendDebuggee = void 0) {
    if (!this.inShutdown) {
      this.inShutdown = true;
      if (this.debugAdapter) {
        try {
          const args2 = { restart };
          if (typeof terminateDebuggee === "boolean") {
            args2.terminateDebuggee = terminateDebuggee;
          }
          if (typeof suspendDebuggee === "boolean") {
            args2.suspendDebuggee = suspendDebuggee;
          }
          await this.send("disconnect", args2, void 0, error ? 200 : 2e3);
        } catch (e) {
        } finally {
          await this.stopAdapter(error);
        }
      } else {
        return this.stopAdapter(error);
      }
    }
  }
  async stopAdapter(error) {
    try {
      if (this.debugAdapter) {
        const da = this.debugAdapter;
        this.debugAdapter = null;
        await da.stopSession();
        this.debugAdapterStopped = true;
      }
    } finally {
      this.fireAdapterExitEvent(error);
    }
  }
  fireAdapterExitEvent(error) {
    if (!this.firedAdapterExitEvent) {
      this.firedAdapterExitEvent = true;
      const e = {
        emittedStopped: this.didReceiveStoppedEvent,
        sessionLengthInSeconds: ((/* @__PURE__ */ new Date()).getTime() - this.startTime) / 1e3
      };
      if (error && !this.debugAdapterStopped) {
        e.error = error;
      }
      this._onDidExitAdapter.fire(e);
    }
  }
  async dispatchRequest(request2) {
    const response = {
      type: "response",
      seq: 0,
      command: request2.command,
      request_seq: request2.seq,
      success: true
    };
    const safeSendResponse = (response2) => this.debugAdapter && this.debugAdapter.sendResponse(response2);
    if (request2.command === "launchVSCode") {
      try {
        let result = await this.launchVsCode(request2.arguments);
        if (!result.success) {
          const { confirmed } = await this.dialogSerivce.confirm({
            type: Severity2.Warning,
            message: localize(14620, null),
            primaryButton: localize(14621, null)
          });
          if (confirmed) {
            result = await this.launchVsCode(request2.arguments);
          } else {
            response.success = false;
            safeSendResponse(response);
            await this.shutdown();
          }
        }
        response.body = {
          rendererDebugAddr: result.rendererDebugAddr
        };
        safeSendResponse(response);
      } catch (err) {
        response.success = false;
        response.message = err.message;
        safeSendResponse(response);
      }
    } else if (request2.command === "runInTerminal") {
      try {
        const shellProcessId = await this.dbgr.runInTerminal(request2.arguments, this.sessionId);
        const resp = response;
        resp.body = {};
        if (typeof shellProcessId === "number") {
          resp.body.shellProcessId = shellProcessId;
        }
        safeSendResponse(resp);
      } catch (err) {
        response.success = false;
        response.message = err.message;
        safeSendResponse(response);
      }
    } else if (request2.command === "startDebugging") {
      try {
        const args2 = request2.arguments;
        const config = {
          ...args2.configuration,
          ...{
            request: args2.request,
            type: this.dbgr.type,
            name: args2.configuration.name || this.name
          }
        };
        const success = await this.dbgr.startDebugging(config, this.sessionId);
        if (success) {
          safeSendResponse(response);
        } else {
          response.success = false;
          response.message = "Failed to start debugging";
          safeSendResponse(response);
        }
      } catch (err) {
        response.success = false;
        response.message = err.message;
        safeSendResponse(response);
      }
    } else {
      response.success = false;
      response.message = `unknown request '${request2.command}'`;
      safeSendResponse(response);
    }
  }
  launchVsCode(vscodeArgs) {
    const args2 = [];
    for (const arg of vscodeArgs.args) {
      const a2 = (arg.prefix || "") + (arg.path || "");
      const match2 = /^--(.+)=(.+)$/.exec(a2);
      if (match2 && match2.length === 3) {
        const key3 = match2[1];
        let value2 = match2[2];
        if ((key3 === "file-uri" || key3 === "folder-uri") && !isUriString(arg.path)) {
          value2 = isUriString(value2) ? value2 : URI.file(value2).toString();
        }
        args2.push(`--${key3}=${value2}`);
      } else {
        args2.push(a2);
      }
    }
    if (vscodeArgs.env) {
      args2.push(`--extensionEnvironment=${JSON.stringify(vscodeArgs.env)}`);
    }
    return this.extensionHostDebugService.openExtensionDevelopmentHostWindow(args2, !!vscodeArgs.debugRenderer);
  }
  send(command4, args2, token, timeout2, showErrors = true) {
    return new Promise((completeDispatch, errorDispatch) => {
      if (!this.debugAdapter) {
        if (this.inShutdown) {
          completeDispatch(void 0);
        } else {
          errorDispatch(new Error(localize(14623, null, command4)));
        }
        return;
      }
      let cancelationListener;
      const requestId = this.debugAdapter.sendRequest(command4, args2, (response) => {
        cancelationListener?.dispose();
        if (response.success) {
          completeDispatch(response);
        } else {
          errorDispatch(response);
        }
      }, timeout2);
      if (token) {
        cancelationListener = token.onCancellationRequested(() => {
          cancelationListener.dispose();
          if (this.capabilities.supportsCancelRequest) {
            this.cancel({ requestId });
          }
        });
      }
    }).then(void 0, (err) => Promise.reject(this.handleErrorResponse(err, showErrors)));
  }
  handleErrorResponse(errorResponse, showErrors) {
    if (errorResponse.command === "canceled" && errorResponse.message === "canceled") {
      return new CancellationError();
    }
    const error = errorResponse?.body?.error;
    const errorMessage = errorResponse?.message || "";
    const userMessage = error ? formatPII(error.format, false, error.variables) : errorMessage;
    const url = error?.url;
    if (error && url) {
      const label3 = error.urlLabel ? error.urlLabel : localize(14622, null);
      const uri5 = URI.parse(url);
      const actionId = uri5.scheme === Schemas.command ? "debug.moreInfo.command" : "debug.moreInfo";
      return createErrorWithActions(userMessage, [toAction({ id: actionId, label: label3, run: () => this.openerService.open(uri5, { allowCommands: true }) })]);
    }
    if (showErrors && error && error.format && error.showUser) {
      this.notificationService.error(userMessage);
    }
    const result = new ErrorNoTelemetry(userMessage);
    result.showUser = error?.showUser;
    return result;
  }
  mergeCapabilities(capabilities) {
    if (capabilities) {
      this._capabilities = mixin(this._capabilities, capabilities);
    }
  }
  fireSimulatedContinuedEvent(threadId, allThreadsContinued = false) {
    this._onDidContinued.fire({
      type: "event",
      event: "continued",
      body: {
        threadId,
        allThreadsContinued
      },
      seq: void 0
    });
  }
  dispose() {
    this.toDispose.dispose();
  }
};

RawDebugSession = __decorateClass([
  __decorateParam(4, IExtensionHostDebugService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, IDialogService)
], RawDebugSession);
export { RawDebugSession };
