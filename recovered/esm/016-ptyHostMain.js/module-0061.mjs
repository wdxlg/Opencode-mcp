// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/ptyService.ts
import { sanitizeEnvForLogging } from "./module-0067.mjs";
import { hasKey, isFunction, isNumber, isString } from "./module-0009.mjs";
import { AutoOpenBarrier, ProcessTimeRunOnceScheduler, Promises, Queue, timeout } from "./module-0028.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";
import { RequestStore } from "./module-0064.mjs";
import { AutoRepliesPtyServiceContribution } from "./module-0089.mjs";
import { ignoreProcessNames } from "./module-0074.mjs";
import { OS, isWindows } from "./module-0014.mjs";
import { localize } from "./module-0013.mjs";
import { formatMessageForTerminal } from "./module-0086.mjs";
import { TerminalProcess } from "./module-0071.mjs";
import { getMarks, mark } from "./module-0087.mjs";
import { getSystemShell } from "./module-0062.mjs";
import { getWindowsBuildNumberAsync } from "./module-0070.mjs";
import { escapeNonWindowsPath } from "./module-0066.mjs";
import { join } from "./module-0016.mjs";
import { ErrorNoTelemetry } from "./module-0002.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0029.mjs";
import { TerminalDataBufferer } from "./module-0065.mjs";
import { ShellIntegrationAddon } from "./module-0085.mjs";


// src/vs/platform/terminal/node/ptyService.ts
import { execFile, exec as exec3 } from "child_process";


// src/vs/platform/terminal/node/ptyService.ts
import pkg from "@xterm/headless";


// src/vs/platform/terminal/node/ptyService.ts
var { Terminal: XtermTerminal } = pkg;

function sanitizeArgsForLogging(fnName, args) {
  if (fnName === "createProcess" && args.length > 5) {
    const sanitizedArgs = [...args];
    if (args[5] && typeof args[5] === "object") {
      sanitizedArgs[5] = sanitizeEnvForLogging(args[5]);
    }
    if (args[6] && typeof args[6] === "object") {
      sanitizedArgs[6] = sanitizeEnvForLogging(args[6]);
    }
    return sanitizedArgs;
  }
  return args;
}

function traceRpc(_target, key, descriptor) {
  if (!isFunction(descriptor.value)) {
    throw new Error("not supported");
  }
  const fnKey = "value";
  const fn = descriptor.value;
  descriptor[fnKey] = async function(...args) {
    if (this.traceRpcArgs.logService.getLevel() === 1 /* Trace */) {
      const sanitizedArgs = sanitizeArgsForLogging(fn.name, args);
      this.traceRpcArgs.logService.trace(`[RPC Request] PtyService#${fn.name}(${sanitizedArgs.map((e) => JSON.stringify(e)).join(", ")})`);
    }
    if (this.traceRpcArgs.simulatedLatency) {
      await timeout(this.traceRpcArgs.simulatedLatency);
    }
    let result;
    try {
      result = await fn.apply(this, args);
    } catch (e) {
      this.traceRpcArgs.logService.error(`[RPC Response] PtyService#${fn.name}`, e);
      throw e;
    }
    if (this.traceRpcArgs.logService.getLevel() === 1 /* Trace */) {
      this.traceRpcArgs.logService.trace(`[RPC Response] PtyService#${fn.name}`, result);
    }
    return result;
  };
}

var SerializeAddon;

var Unicode11Addon;

var PtyService = class extends Disposable {
  constructor(_logService, _productService, _reconnectConstants, _simulatedLatency) {
    super();
    this._logService = _logService;
    this._productService = _productService;
    this._reconnectConstants = _reconnectConstants;
    this._simulatedLatency = _simulatedLatency;
    this._ptys = /* @__PURE__ */ new Map();
    this._workspaceLayoutInfos = /* @__PURE__ */ new Map();
    this._revivedPtyIdMap = /* @__PURE__ */ new Map();
    this._lastPtyId = 0;
    this._onHeartbeat = this._register(new Emitter());
    this.onHeartbeat = this._traceEvent("_onHeartbeat", this._onHeartbeat.event);
    this._onProcessData = this._register(new Emitter());
    this.onProcessData = this._traceEvent("_onProcessData", this._onProcessData.event);
    this._onProcessReplay = this._register(new Emitter());
    this.onProcessReplay = this._traceEvent("_onProcessReplay", this._onProcessReplay.event);
    this._onProcessReady = this._register(new Emitter());
    this.onProcessReady = this._traceEvent("_onProcessReady", this._onProcessReady.event);
    this._onProcessExit = this._register(new Emitter());
    this.onProcessExit = this._traceEvent("_onProcessExit", this._onProcessExit.event);
    this._onProcessOrphanQuestion = this._register(new Emitter());
    this.onProcessOrphanQuestion = this._traceEvent("_onProcessOrphanQuestion", this._onProcessOrphanQuestion.event);
    this._onDidRequestDetach = this._register(new Emitter());
    this.onDidRequestDetach = this._traceEvent("_onDidRequestDetach", this._onDidRequestDetach.event);
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._traceEvent("_onDidChangeProperty", this._onDidChangeProperty.event);
    this._register(toDisposable(() => {
      for (const pty of this._ptys.values()) {
        pty.shutdown(true);
      }
      this._ptys.clear();
    }));
    this._detachInstanceRequestStore = this._register(new RequestStore(void 0, this._logService));
    this._register(this._detachInstanceRequestStore.onCreateRequest(this._onDidRequestDetach.fire, this._onDidRequestDetach));
    this._autoRepliesContribution = new AutoRepliesPtyServiceContribution(this._logService);
    this._contributions = [this._autoRepliesContribution];
  }
  async installAutoReply(match, reply) {
    await this._autoRepliesContribution.installAutoReply(match, reply);
  }
  async uninstallAllAutoReplies() {
    await this._autoRepliesContribution.uninstallAllAutoReplies();
  }
  _traceEvent(name, event) {
    event((e) => {
      if (this._logService.getLevel() === 1 /* Trace */) {
        this._logService.trace(`[RPC Event] PtyService#${name}.fire(${JSON.stringify(e)})`);
      }
    });
    return event;
  }
  get traceRpcArgs() {
    return {
      logService: this._logService,
      simulatedLatency: this._simulatedLatency
    };
  }
  async refreshIgnoreProcessNames(names) {
    ignoreProcessNames.length = 0;
    ignoreProcessNames.push(...names);
  }
  async requestDetachInstance(workspaceId, instanceId) {
    return this._detachInstanceRequestStore.createRequest({ workspaceId, instanceId });
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    let processDetails = void 0;
    const pty = this._ptys.get(persistentProcessId);
    if (pty) {
      processDetails = await this._buildProcessDetails(persistentProcessId, pty);
    }
    this._detachInstanceRequestStore.acceptReply(requestId, processDetails);
  }
  async freePortKillProcess(port) {
    const stdout = await new Promise((resolve3, reject) => {
      exec3(isWindows ? `netstat -ano | findstr "${port}"` : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`, {}, (err, stdout2) => {
        if (err) {
          return reject("Problem occurred when listing active processes");
        }
        resolve3(stdout2);
      });
    });
    const processesForPort = stdout.split(/\r?\n/).filter((s) => !!s.trim());
    if (processesForPort.length >= 1) {
      const capturePid = /\s+(\d+)(?:\s+|$)/;
      const processId = processesForPort[0].match(capturePid)?.[1];
      if (processId) {
        try {
          process.kill(Number.parseInt(processId));
        } catch {
        }
      } else {
        throw new Error(`Processes for port ${port} were not found`);
      }
      return { port, processId };
    }
    throw new Error(`Could not kill process with port ${port}`);
  }
  async serializeTerminalState(ids) {
    const promises4 = [];
    for (const [persistentProcessId, persistentProcess] of this._ptys.entries()) {
      if (persistentProcess.hasWrittenData && ids.indexOf(persistentProcessId) !== -1) {
        promises4.push(Promises.withAsyncBody(async (r) => {
          r({
            id: persistentProcessId,
            shellLaunchConfig: persistentProcess.shellLaunchConfig,
            processDetails: await this._buildProcessDetails(persistentProcessId, persistentProcess),
            processLaunchConfig: persistentProcess.processLaunchOptions,
            unicodeVersion: persistentProcess.unicodeVersion,
            replayEvent: await persistentProcess.serializeNormalBuffer(),
            timestamp: Date.now()
          });
        }));
      }
    }
    const serialized = {
      version: 1,
      state: await Promise.all(promises4)
    };
    return JSON.stringify(serialized);
  }
  async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocale) {
    const promises4 = [];
    for (const terminal of state) {
      promises4.push(this._reviveTerminalProcess(workspaceId, terminal));
    }
    await Promise.all(promises4);
  }
  async _reviveTerminalProcess(workspaceId, terminal) {
    const restoreMessage = localize(3300, null);
    let postRestoreMessage = "";
    if (isWindows) {
      const lastReplayEvent = terminal.replayEvent.events.length > 0 ? terminal.replayEvent.events.at(-1) : void 0;
      if (lastReplayEvent) {
        postRestoreMessage += "\r\n".repeat(lastReplayEvent.rows - 1) + `\x1B[H`;
      }
    }
    const newId = await this.createProcess(
      {
        ...terminal.shellLaunchConfig,
        cwd: terminal.processDetails.cwd,
        color: terminal.processDetails.color,
        icon: terminal.processDetails.icon,
        name: terminal.processDetails.titleSource === 0 /* Api */ ? terminal.processDetails.title : void 0,
        initialText: terminal.replayEvent.events[0].data + formatMessageForTerminal(restoreMessage, { loudFormatting: true }) + postRestoreMessage
      },
      terminal.processDetails.cwd,
      terminal.replayEvent.events[0].cols,
      terminal.replayEvent.events[0].rows,
      terminal.unicodeVersion,
      terminal.processLaunchConfig.env,
      terminal.processLaunchConfig.executableEnv,
      terminal.processLaunchConfig.options,
      true,
      terminal.processDetails.workspaceId,
      terminal.processDetails.workspaceName,
      true,
      terminal.replayEvent.events[0].data
    );
    const oldId = this._getRevivingProcessId(workspaceId, terminal.id);
    this._revivedPtyIdMap.set(oldId, { newId, state: terminal });
    this._logService.info(`Revived process, old id ${oldId} -> new id ${newId}`);
  }
  async shutdownAll() {
    this.dispose();
  }
  async createProcess(shellLaunchConfig, cwd3, cols, rows, unicodeVersion, env2, executableEnv, options, shouldPersist, workspaceId, workspaceName, isReviving, rawReviveBuffer) {
    if (shellLaunchConfig.attachPersistentProcess) {
      throw new Error("Attempt to create a process when attach object was provided");
    }
    const id2 = ++this._lastPtyId;
    const process2 = new TerminalProcess(shellLaunchConfig, cwd3, cols, rows, env2, executableEnv, options, this._logService, this._productService);
    const processLaunchOptions = {
      env: env2,
      executableEnv,
      options
    };
    const persistentProcess = new PersistentTerminalProcess(id2, process2, workspaceId, workspaceName, shouldPersist, cols, rows, processLaunchOptions, unicodeVersion, this._reconnectConstants, this._logService, isReviving && isString(shellLaunchConfig.initialText) ? shellLaunchConfig.initialText : void 0, rawReviveBuffer, shellLaunchConfig.icon, shellLaunchConfig.color, shellLaunchConfig.name, shellLaunchConfig.fixedDimensions);
    process2.onProcessExit((event) => {
      for (const contrib of this._contributions) {
        contrib.handleProcessDispose(id2);
      }
      persistentProcess.dispose();
      this._ptys.delete(id2);
      this._onProcessExit.fire({ id: id2, event });
    });
    persistentProcess.onProcessData((event) => this._onProcessData.fire({ id: id2, event }));
    persistentProcess.onProcessReplay((event) => this._onProcessReplay.fire({ id: id2, event }));
    persistentProcess.onProcessReady((event) => this._onProcessReady.fire({ id: id2, event }));
    persistentProcess.onProcessOrphanQuestion(() => this._onProcessOrphanQuestion.fire({ id: id2 }));
    persistentProcess.onDidChangeProperty((property) => this._onDidChangeProperty.fire({ id: id2, property }));
    persistentProcess.onPersistentProcessReady(() => {
      for (const contrib of this._contributions) {
        contrib.handleProcessReady(id2, process2);
      }
    });
    this._ptys.set(id2, persistentProcess);
    return id2;
  }
  async attachToProcess(id2) {
    try {
      await this._throwIfNoPty(id2).attach();
      this._logService.info(`Persistent process reconnection "${id2}"`);
    } catch (e) {
      this._logService.warn(`Persistent process reconnection "${id2}" failed`, e.message);
      throw e;
    }
  }
  async updateTitle(id2, title, titleSource) {
    this._throwIfNoPty(id2).setTitle(title, titleSource);
  }
  async updateIcon(id2, userInitiated, icon, color) {
    this._throwIfNoPty(id2).setIcon(userInitiated, icon, color);
  }
  async clearBuffer(id2) {
    this._throwIfNoPty(id2).clearBuffer();
  }
  async refreshProperty(id2, type) {
    return this._throwIfNoPty(id2).refreshProperty(type);
  }
  async updateProperty(id2, type, value) {
    return this._throwIfNoPty(id2).updateProperty(type, value);
  }
  async detachFromProcess(id2, forcePersist) {
    return this._throwIfNoPty(id2).detach(forcePersist);
  }
  async reduceConnectionGraceTime() {
    for (const pty of this._ptys.values()) {
      pty.reduceGraceTime();
    }
  }
  async listProcesses() {
    const persistentProcesses = Array.from(this._ptys.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
    this._logService.info(`Listing ${persistentProcesses.length} persistent terminals, ${this._ptys.size} total terminals`);
    const promises4 = persistentProcesses.map(async ([id2, terminalProcessData]) => this._buildProcessDetails(id2, terminalProcessData));
    const allTerminals = await Promise.all(promises4);
    return allTerminals.filter((entry) => entry.isOrphan);
  }
  async getPerformanceMarks() {
    return getMarks();
  }
  async start(id2) {
    const pty = this._ptys.get(id2);
    return pty ? pty.start() : { message: `Could not find pty with id "${id2}"` };
  }
  async shutdown(id2, immediate) {
    return this._ptys.get(id2)?.shutdown(immediate);
  }
  async input(id2, data) {
    const pty = this._throwIfNoPty(id2);
    if (pty) {
      for (const contrib of this._contributions) {
        contrib.handleProcessInput(id2, data);
      }
      pty.input(data);
    }
  }
  async sendSignal(id2, signal) {
    return this._throwIfNoPty(id2).sendSignal(signal);
  }
  async processBinary(id2, data) {
    return this._throwIfNoPty(id2).writeBinary(data);
  }
  async resize(id2, cols, rows, pixelWidth, pixelHeight) {
    const pty = this._throwIfNoPty(id2);
    if (pty) {
      for (const contrib of this._contributions) {
        contrib.handleProcessResize(id2, cols, rows, pixelWidth, pixelHeight);
      }
      pty.resize(cols, rows, pixelWidth, pixelHeight);
    }
  }
  async getInitialCwd(id2) {
    return this._throwIfNoPty(id2).getInitialCwd();
  }
  async getCwd(id2) {
    return this._throwIfNoPty(id2).getCwd();
  }
  async acknowledgeDataEvent(id2, charCount) {
    return this._throwIfNoPty(id2).acknowledgeDataEvent(charCount);
  }
  async setUnicodeVersion(id2, version) {
    return this._throwIfNoPty(id2).setUnicodeVersion(version);
  }
  async setNextCommandId(id2, commandLine, commandId) {
    return this._throwIfNoPty(id2).setNextCommandId(commandLine, commandId);
  }
  async getLatency() {
    return [];
  }
  async orphanQuestionReply(id2) {
    return this._throwIfNoPty(id2).orphanQuestionReply();
  }
  async getDefaultSystemShell(osOverride = OS) {
    return getSystemShell(osOverride, process.env);
  }
  async getEnvironment() {
    return { ...process.env };
  }
  async getWslPath(original, direction) {
    if (direction === "win-to-unix") {
      if (!isWindows) {
        return original;
      }
      if (await getWindowsBuildNumberAsync() < 17063) {
        return original.replace(/\\/g, "/");
      }
      const wslExecutable = await this._getWSLExecutablePath();
      if (!wslExecutable) {
        return original;
      }
      return new Promise((c) => {
        const proc = execFile(wslExecutable, ["-e", "wslpath", original], {}, (error, stdout, stderr) => {
          c(error ? original : escapeNonWindowsPath(stdout.trim(), "bash" /* Bash */));
        });
        proc.stdin.end();
      });
    }
    if (direction === "unix-to-win") {
      if (isWindows) {
        if (await getWindowsBuildNumberAsync() < 17063) {
          return original;
        }
        const wslExecutable = await this._getWSLExecutablePath();
        if (!wslExecutable) {
          return original;
        }
        return new Promise((c) => {
          const proc = execFile(wslExecutable, ["-e", "wslpath", "-w", original], {}, (error, stdout, stderr) => {
            c(error ? original : stdout.trim());
          });
          proc.stdin.end();
        });
      }
    }
    return original;
  }
  async _getWSLExecutablePath() {
    const useWSLexe = await getWindowsBuildNumberAsync() >= 16299;
    const is32ProcessOn64Windows = process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
    const systemRoot = process.env["SystemRoot"];
    if (systemRoot) {
      return join(systemRoot, is32ProcessOn64Windows ? "Sysnative" : "System32", useWSLexe ? "wsl.exe" : "bash.exe");
    }
    return void 0;
  }
  async getRevivedPtyNewId(workspaceId, id2) {
    try {
      return this._revivedPtyIdMap.get(this._getRevivingProcessId(workspaceId, id2))?.newId;
    } catch (e) {
      this._logService.warn(`Couldn't find terminal ID ${workspaceId}-${id2}`, e.message);
    }
    return void 0;
  }
  async setTerminalLayoutInfo(args) {
    this._workspaceLayoutInfos.set(args.workspaceId, args);
  }
  async getTerminalLayoutInfo(args) {
    mark("code/willGetTerminalLayoutInfo");
    const layout = this._workspaceLayoutInfos.get(args.workspaceId);
    if (layout) {
      const doneSet = /* @__PURE__ */ new Set();
      const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this._expandTerminalTab(args.workspaceId, tab, doneSet)));
      const tabs = expandedTabs.filter((t) => t.terminals.length > 0);
      const expandedBackground = (await Promise.all(layout.background?.map((b) => this._expandTerminalInstance(args.workspaceId, b, doneSet)) ?? [])).filter((b) => b.terminal !== null).map((b) => b.terminal);
      mark("code/didGetTerminalLayoutInfo");
      return { tabs, background: expandedBackground };
    }
    mark("code/didGetTerminalLayoutInfo");
    return void 0;
  }
  async _expandTerminalTab(workspaceId, tab, doneSet) {
    const expandedTerminals = await Promise.all(tab.terminals.map((t) => this._expandTerminalInstance(workspaceId, t, doneSet)));
    const filtered = expandedTerminals.filter((term) => term.terminal !== null);
    return {
      isActive: tab.isActive,
      activePersistentProcessId: tab.activePersistentProcessId,
      terminals: filtered
    };
  }
  async _expandTerminalInstance(workspaceId, t, doneSet) {
    const hasLayout = !isNumber(t);
    const ptyId = hasLayout ? t.terminal : t;
    try {
      const oldId = this._getRevivingProcessId(workspaceId, ptyId);
      const revivedPtyId = this._revivedPtyIdMap.get(oldId)?.newId;
      this._logService.info(`Expanding terminal instance, old id ${oldId} -> new id ${revivedPtyId}`);
      this._revivedPtyIdMap.delete(oldId);
      const persistentProcessId = revivedPtyId ?? ptyId;
      if (doneSet.has(persistentProcessId)) {
        throw new Error(`Terminal ${persistentProcessId} has already been expanded`);
      }
      doneSet.add(persistentProcessId);
      const persistentProcess = this._throwIfNoPty(persistentProcessId);
      const processDetails = persistentProcess && await this._buildProcessDetails(ptyId, persistentProcess, revivedPtyId !== void 0);
      return {
        terminal: { ...processDetails, id: persistentProcessId },
        relativeSize: hasLayout ? t.relativeSize : 0
      };
    } catch (e) {
      this._logService.warn(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
      this._logService.debug("Reattach to wrong terminal debug info - layout info by id", t);
      this._logService.debug("Reattach to wrong terminal debug info - _revivePtyIdMap", Array.from(this._revivedPtyIdMap.values()));
      this._logService.debug("Reattach to wrong terminal debug info - _ptys ids", Array.from(this._ptys.keys()));
      return {
        terminal: null,
        relativeSize: hasLayout ? t.relativeSize : 0
      };
    }
  }
  _getRevivingProcessId(workspaceId, ptyId) {
    return `${workspaceId}-${ptyId}`;
  }
  async _buildProcessDetails(id2, persistentProcess, wasRevived = false) {
    mark(`code/willBuildProcessDetails/${id2}`);
    const [cwd3, isOrphan] = await Promise.all([persistentProcess.getCwd(), wasRevived ? true : persistentProcess.isOrphaned()]);
    const result = {
      id: id2,
      title: persistentProcess.title,
      titleSource: persistentProcess.titleSource,
      pid: persistentProcess.pid,
      workspaceId: persistentProcess.workspaceId,
      workspaceName: persistentProcess.workspaceName,
      cwd: cwd3,
      isOrphan,
      icon: persistentProcess.icon,
      color: persistentProcess.color,
      fixedDimensions: persistentProcess.fixedDimensions,
      environmentVariableCollections: persistentProcess.processLaunchOptions.options.environmentVariableCollections,
      reconnectionProperties: persistentProcess.shellLaunchConfig.reconnectionProperties,
      waitOnExit: persistentProcess.shellLaunchConfig.waitOnExit,
      hideFromUser: persistentProcess.shellLaunchConfig.hideFromUser,
      isFeatureTerminal: persistentProcess.shellLaunchConfig.isFeatureTerminal,
      type: persistentProcess.shellLaunchConfig.type,
      hasChildProcesses: persistentProcess.hasChildProcesses,
      shellIntegrationNonce: persistentProcess.processLaunchOptions.options.shellIntegration.nonce,
      tabActions: persistentProcess.shellLaunchConfig.tabActions
    };
    mark(`code/didBuildProcessDetails/${id2}`);
    return result;
  }
  _throwIfNoPty(id2) {
    const pty = this._ptys.get(id2);
    if (!pty) {
      throw new ErrorNoTelemetry(`Could not find pty ${id2} on pty host`);
    }
    return pty;
  }
};

__decorateClass([
  traceRpc
], PtyService.prototype, "installAutoReply", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "uninstallAllAutoReplies", 1);

__decorateClass([
  memoize
], PtyService.prototype, "traceRpcArgs", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "refreshIgnoreProcessNames", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "requestDetachInstance", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "acceptDetachInstanceReply", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "freePortKillProcess", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "serializeTerminalState", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "reviveTerminalProcesses", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "shutdownAll", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "createProcess", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "attachToProcess", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "updateTitle", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "updateIcon", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "clearBuffer", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "refreshProperty", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "updateProperty", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "detachFromProcess", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "reduceConnectionGraceTime", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "listProcesses", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getPerformanceMarks", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "start", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "shutdown", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "input", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "sendSignal", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "processBinary", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "resize", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getInitialCwd", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getCwd", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "acknowledgeDataEvent", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "setUnicodeVersion", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "setNextCommandId", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getLatency", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "orphanQuestionReply", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getDefaultSystemShell", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getEnvironment", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getWslPath", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getRevivedPtyNewId", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "setTerminalLayoutInfo", 1);

__decorateClass([
  traceRpc
], PtyService.prototype, "getTerminalLayoutInfo", 1);

var PersistentTerminalProcess = class extends Disposable {
  constructor(_persistentProcessId, _terminalProcess, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, processLaunchOptions, unicodeVersion, reconnectConstants, _logService, reviveBuffer, rawReviveBuffer, _icon, _color, name, fixedDimensions) {
    super();
    this._persistentProcessId = _persistentProcessId;
    this._terminalProcess = _terminalProcess;
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;
    this.shouldPersistTerminal = shouldPersistTerminal;
    this.processLaunchOptions = processLaunchOptions;
    this.unicodeVersion = unicodeVersion;
    this._logService = _logService;
    this._icon = _icon;
    this._color = _color;
    this._pendingCommands = /* @__PURE__ */ new Map();
    this._isStarted = false;
    this._orphanRequestQueue = new Queue();
    this._onProcessReplay = this._register(new Emitter());
    this.onProcessReplay = this._onProcessReplay.event;
    this._onProcessReady = this._register(new Emitter());
    this.onProcessReady = this._onProcessReady.event;
    this._onPersistentProcessReady = this._register(new Emitter());
    /** Fired when the persistent process has a ready process and has finished its replay. */
    this.onPersistentProcessReady = this._onPersistentProcessReady.event;
    this._onProcessData = this._register(new Emitter());
    this.onProcessData = this._onProcessData.event;
    this._onProcessOrphanQuestion = this._register(new Emitter());
    this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._onDidChangeProperty.event;
    this._inReplay = false;
    this._pid = -1;
    this._cwd = "";
    this._titleSource = 1 /* Process */;
    this._interactionState = new MutationLogger(`Persistent process "${this._persistentProcessId}" interaction state`, "None" /* None */, this._logService);
    this._wasRevived = reviveBuffer !== void 0;
    this._serializer = new XtermSerializer(
      cols,
      rows,
      reconnectConstants.scrollback,
      unicodeVersion,
      reviveBuffer,
      processLaunchOptions.options.shellIntegration.nonce,
      shouldPersistTerminal ? rawReviveBuffer : void 0,
      this._logService
    );
    if (name) {
      this.setTitle(name, 0 /* Api */);
    }
    this._fixedDimensions = fixedDimensions;
    this._orphanQuestionBarrier = null;
    this._orphanQuestionReplyTime = 0;
    this._disconnectRunner1 = this._register(new ProcessTimeRunOnceScheduler(() => {
      this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${printTime(reconnectConstants.graceTime)} has expired, shutting down pid "${this._pid}"`);
      this.shutdown(true);
    }, reconnectConstants.graceTime));
    this._disconnectRunner2 = this._register(new ProcessTimeRunOnceScheduler(() => {
      this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${printTime(reconnectConstants.shortGraceTime)} has expired, shutting down pid ${this._pid}`);
      this.shutdown(true);
    }, reconnectConstants.shortGraceTime));
    this._register(this._terminalProcess.onProcessExit(() => this._bufferer.stopBuffering(this._persistentProcessId)));
    this._register(this._terminalProcess.onProcessReady((e) => {
      this._pid = e.pid;
      this._cwd = e.cwd;
      this._onProcessReady.fire(e);
    }));
    this._register(this._terminalProcess.onDidChangeProperty((e) => {
      this._onDidChangeProperty.fire(e);
    }));
    this._bufferer = new TerminalDataBufferer((_, data) => this._onProcessData.fire(data));
    this._register(this._bufferer.startBuffering(this._persistentProcessId, this._terminalProcess.onProcessData));
    this._register(this.onProcessData((e) => this._serializer.handleData(e)));
  }
  get pid() {
    return this._pid;
  }
  get shellLaunchConfig() {
    return this._terminalProcess.shellLaunchConfig;
  }
  get hasWrittenData() {
    return this._interactionState.value !== "None" /* None */;
  }
  get title() {
    return this._title || this._terminalProcess.currentTitle;
  }
  get titleSource() {
    return this._titleSource;
  }
  get icon() {
    return this._icon;
  }
  get color() {
    return this._color;
  }
  get fixedDimensions() {
    return this._fixedDimensions;
  }
  get hasChildProcesses() {
    return this._terminalProcess.hasChildProcesses;
  }
  setTitle(title, titleSource) {
    if (titleSource === 0 /* Api */) {
      this._interactionState.setValue("Session" /* Session */, "setTitle");
      this._serializer.freeRawReviveBuffer();
    }
    this._title = title;
    this._titleSource = titleSource;
  }
  setIcon(userInitiated, icon, color) {
    if (!this._icon || hasKey(icon, { id: true }) && hasKey(this._icon, { id: true }) && icon.id !== this._icon.id || !this.color || color !== this._color) {
      this._serializer.freeRawReviveBuffer();
      if (userInitiated) {
        this._interactionState.setValue("Session" /* Session */, "setIcon");
      }
    }
    this._icon = icon;
    this._color = color;
  }
  _setFixedDimensions(fixedDimensions) {
    this._fixedDimensions = fixedDimensions;
  }
  async attach() {
    if (!this._disconnectRunner1.isScheduled() && !this._disconnectRunner2.isScheduled()) {
      this._logService.warn(`Persistent process "${this._persistentProcessId}": Process had no disconnect runners but was an orphan`);
    }
    this._disconnectRunner1.cancel();
    this._disconnectRunner2.cancel();
  }
  async detach(forcePersist) {
    if (this.shouldPersistTerminal && (this._interactionState.value !== "None" /* None */ || forcePersist)) {
      this._disconnectRunner1.schedule();
    } else {
      this.shutdown(true);
    }
  }
  serializeNormalBuffer() {
    return this._serializer.generateReplayEvent(true, this._interactionState.value !== "Session" /* Session */);
  }
  async refreshProperty(type) {
    return this._terminalProcess.refreshProperty(type);
  }
  async updateProperty(type, value) {
    if (type === "fixedDimensions" /* FixedDimensions */) {
      return this._setFixedDimensions(value);
    }
  }
  async start() {
    if (!this._isStarted) {
      const result = await this._terminalProcess.start();
      if (result && hasKey(result, { message: true })) {
        return result;
      }
      this._isStarted = true;
      if (this._wasRevived) {
        this.triggerReplay();
      } else {
        this._onPersistentProcessReady.fire();
      }
      return result;
    }
    this._onProcessReady.fire({ pid: this._pid, cwd: this._cwd, windowsPty: this._terminalProcess.getWindowsPty() });
    this._onDidChangeProperty.fire({ type: "title" /* Title */, value: this._terminalProcess.currentTitle });
    this._onDidChangeProperty.fire({ type: "shellType" /* ShellType */, value: this._terminalProcess.shellType });
    this.triggerReplay();
    return void 0;
  }
  shutdown(immediate) {
    return this._terminalProcess.shutdown(immediate);
  }
  input(data) {
    this._interactionState.setValue("Session" /* Session */, "input");
    this._serializer.freeRawReviveBuffer();
    if (this._inReplay) {
      return;
    }
    return this._terminalProcess.input(data);
  }
  sendSignal(signal) {
    if (this._inReplay) {
      return;
    }
    return this._terminalProcess.sendSignal(signal);
  }
  writeBinary(data) {
    return this._terminalProcess.processBinary(data);
  }
  resize(cols, rows, pixelWidth, pixelHeight) {
    if (this._inReplay) {
      return;
    }
    this._serializer.handleResize(cols, rows);
    this._bufferer.flushBuffer(this._persistentProcessId);
    return this._terminalProcess.resize(cols, rows, pixelWidth, pixelHeight);
  }
  async clearBuffer() {
    this._serializer.clearBuffer();
    this._terminalProcess.clearBuffer();
  }
  setUnicodeVersion(version) {
    this.unicodeVersion = version;
    this._serializer.setUnicodeVersion?.(version);
  }
  async setNextCommandId(commandLine, commandId) {
    this._serializer.setNextCommandId?.(commandLine, commandId);
  }
  acknowledgeDataEvent(charCount) {
    if (this._inReplay) {
      return;
    }
    return this._terminalProcess.acknowledgeDataEvent(charCount);
  }
  getInitialCwd() {
    return this._terminalProcess.getInitialCwd();
  }
  getCwd() {
    return this._terminalProcess.getCwd();
  }
  async triggerReplay() {
    if (this._interactionState.value === "None" /* None */) {
      this._interactionState.setValue("ReplayOnly" /* ReplayOnly */, "triggerReplay");
    }
    const ev = await this._serializer.generateReplayEvent();
    let dataLength = 0;
    for (const e of ev.events) {
      dataLength += e.data.length;
    }
    this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
    this._onProcessReplay.fire(ev);
    this._terminalProcess.clearUnacknowledgedChars();
    this._onPersistentProcessReady.fire();
  }
  sendCommandResult(reqId, isError, serializedPayload) {
    const data = this._pendingCommands.get(reqId);
    if (!data) {
      return;
    }
    this._pendingCommands.delete(reqId);
  }
  orphanQuestionReply() {
    this._orphanQuestionReplyTime = Date.now();
    if (this._orphanQuestionBarrier) {
      const barrier = this._orphanQuestionBarrier;
      this._orphanQuestionBarrier = null;
      barrier.open();
    }
  }
  reduceGraceTime() {
    if (this._disconnectRunner2.isScheduled()) {
      return;
    }
    if (this._disconnectRunner1.isScheduled()) {
      this._disconnectRunner2.schedule();
    }
  }
  async isOrphaned() {
    return await this._orphanRequestQueue.queue(async () => this._isOrphaned());
  }
  async _isOrphaned() {
    if (this._disconnectRunner1.isScheduled() || this._disconnectRunner2.isScheduled()) {
      return true;
    }
    if (!this._orphanQuestionBarrier) {
      this._orphanQuestionBarrier = new AutoOpenBarrier(4e3);
      this._orphanQuestionReplyTime = 0;
      this._onProcessOrphanQuestion.fire();
    }
    await this._orphanQuestionBarrier.wait();
    return Date.now() - this._orphanQuestionReplyTime > 500;
  }
};

var MutationLogger = class {
  constructor(_name, _value, _logService) {
    this._name = _name;
    this._value = _value;
    this._logService = _logService;
    this._log("initialized");
  }
  get value() {
    return this._value;
  }
  setValue(value, reason) {
    if (this._value !== value) {
      this._value = value;
      this._log(reason);
    }
  }
  _log(reason) {
    this._logService.debug(`MutationLogger "${this._name}" set to "${this._value}", reason: ${reason}`);
  }
};

var XtermSerializer = class {
  constructor(cols, rows, scrollback, unicodeVersion, reviveBufferWithRestoreMessage, shellIntegrationNonce, _rawReviveBuffer, logService) {
    this._rawReviveBuffer = _rawReviveBuffer;
    this._xterm = new XtermTerminal({
      cols,
      rows,
      scrollback,
      allowProposedApi: true
    });
    if (reviveBufferWithRestoreMessage) {
      this._xterm.writeln(reviveBufferWithRestoreMessage);
    }
    this.setUnicodeVersion(unicodeVersion);
    this._shellIntegrationAddon = new ShellIntegrationAddon(shellIntegrationNonce, true, void 0, void 0, logService);
    this._xterm.loadAddon(this._shellIntegrationAddon);
  }
  freeRawReviveBuffer() {
    this._rawReviveBuffer = void 0;
  }
  handleData(data) {
    this._xterm.write(data);
  }
  handleResize(cols, rows) {
    this._xterm.resize(cols, rows);
  }
  clearBuffer() {
    this._xterm.clear();
  }
  setNextCommandId(commandLine, commandId) {
    this._shellIntegrationAddon.setNextCommandId(commandLine, commandId);
  }
  async generateReplayEvent(normalBufferOnly, restoreToLastReviveBuffer) {
    const serialize2 = new (await this._getSerializeConstructor())();
    this._xterm.loadAddon(serialize2);
    const options = {
      scrollback: this._xterm.options.scrollback
    };
    if (normalBufferOnly) {
      options.excludeAltBuffer = true;
      options.excludeModes = true;
    }
    let serialized;
    if (restoreToLastReviveBuffer && this._rawReviveBuffer) {
      serialized = this._rawReviveBuffer;
    } else {
      serialized = serialize2.serialize(options);
    }
    return {
      events: [
        {
          cols: this._xterm.cols,
          rows: this._xterm.rows,
          data: serialized
        }
      ],
      commands: this._shellIntegrationAddon.serialize()
    };
  }
  async setUnicodeVersion(version) {
    if (this._xterm.unicode.activeVersion === version) {
      return;
    }
    if (version === "11") {
      this._unicodeAddon = new (await this._getUnicode11Constructor())();
      this._xterm.loadAddon(this._unicodeAddon);
    } else {
      this._unicodeAddon?.dispose();
      this._unicodeAddon = void 0;
    }
    this._xterm.unicode.activeVersion = version;
  }
  async _getUnicode11Constructor() {
    if (!Unicode11Addon) {
      Unicode11Addon = (await import("@xterm/addon-unicode11")).Unicode11Addon;
    }
    return Unicode11Addon;
  }
  async _getSerializeConstructor() {
    if (!SerializeAddon) {
      SerializeAddon = (await import("@xterm/addon-serialize")).SerializeAddon;
    }
    return SerializeAddon;
  }
};

function printTime(ms) {
  let h = 0;
  let m = 0;
  let s = 0;
  if (ms >= 1e3) {
    s = Math.floor(ms / 1e3);
    ms -= s * 1e3;
  }
  if (s >= 60) {
    m = Math.floor(s / 60);
    s -= m * 60;
  }
  if (m >= 60) {
    h = Math.floor(m / 60);
    m -= h * 60;
  }
  const _h = h ? `${h}h` : ``;
  const _m = m ? `${m}m` : ``;
  const _s = s ? `${s}s` : ``;
  const _ms = ms ? `${ms}ms` : ``;
  return `${_h}${_m}${_s}${_ms}`;
}
export { sanitizeArgsForLogging, traceRpc, printTime, execFile, exec3, pkg, XtermTerminal, SerializeAddon, Unicode11Addon, PtyService, PersistentTerminalProcess, MutationLogger, XtermSerializer };
