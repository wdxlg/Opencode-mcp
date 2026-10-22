// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/node/ptyHostService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { OS, init_platform, isWindows2 } from "./module-0006.mjs";
import { ProxyChannel, init_ipc } from "./module-0054.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { ILogService, ILoggerService, init_log } from "./module-0075.mjs";
import { RemoteLoggerChannelClient, init_logIpc2 } from "./module-0274.mjs";
import { getResolvedShellEnv, init_shellEnv } from "./module-0168.mjs";
import { RequestStore, init_requestStore } from "./module-0275.mjs";
import { init_terminal } from "./module-0272.mjs";
import { init_terminalPlatformConfiguration, registerTerminalPlatformConfiguration } from "./module-0277.mjs";
import { detectAvailableProfiles, init_terminalProfiles2 } from "./module-0278.mjs";
import { getSystemShell, init_shell } from "./module-0166.mjs";
import { StopWatch, init_stopwatch } from "./module-0020.mjs";


// src/vs/platform/terminal/node/ptyHostService.ts
var PtyHostService;

var init_ptyHostService = __esm({
  "src/vs/platform/terminal/node/ptyHostService.ts"() {
    init_event();
    init_lifecycle();
    init_platform();
    init_ipc();
    init_configuration();
    init_log();
    init_logIpc2();
    init_shellEnv();
    init_requestStore();
    init_terminal();
    init_terminalPlatformConfiguration();
    init_terminalProfiles2();
    init_shell();
    init_stopwatch();
    PtyHostService = class extends Disposable {
      constructor(_ptyHostStarter, _configurationService, _logService, _loggerService) {
        super();
        this._ptyHostStarter = _ptyHostStarter;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._wasQuitRequested = false;
        this._restartCount = 0;
        this._isResponsive = true;
        this._onPtyHostExit = this._register(new Emitter());
        this.onPtyHostExit = this._onPtyHostExit.event;
        this._onPtyHostStart = this._register(new Emitter());
        this.onPtyHostStart = this._onPtyHostStart.event;
        this._onPtyHostUnresponsive = this._register(new Emitter());
        this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
        this._onPtyHostResponsive = this._register(new Emitter());
        this.onPtyHostResponsive = this._onPtyHostResponsive.event;
        this._onPtyHostRequestResolveVariables = this._register(new Emitter());
        this.onPtyHostRequestResolveVariables = this._onPtyHostRequestResolveVariables.event;
        this._onProcessData = this._register(new Emitter());
        this.onProcessData = this._onProcessData.event;
        this._onProcessReady = this._register(new Emitter());
        this.onProcessReady = this._onProcessReady.event;
        this._onProcessReplay = this._register(new Emitter());
        this.onProcessReplay = this._onProcessReplay.event;
        this._onProcessOrphanQuestion = this._register(new Emitter());
        this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
        this._onDidRequestDetach = this._register(new Emitter());
        this.onDidRequestDetach = this._onDidRequestDetach.event;
        this._onDidChangeProperty = this._register(new Emitter());
        this.onDidChangeProperty = this._onDidChangeProperty.event;
        this._onProcessExit = this._register(new Emitter());
        this.onProcessExit = this._onProcessExit.event;
        this._ptyHostStore = this._register(new DisposableStore());
        registerTerminalPlatformConfiguration();
        this._register(this._ptyHostStarter);
        this._register(toDisposable(() => this._disposePtyHost()));
        this._resolveVariablesRequestStore = this._register(new RequestStore(void 0, this._logService));
        this._register(this._resolveVariablesRequestStore.onCreateRequest(this._onPtyHostRequestResolveVariables.fire, this._onPtyHostRequestResolveVariables));
        if (this._ptyHostStarter.onRequestConnection) {
          this._register(Event.once(this._ptyHostStarter.onRequestConnection)(() => this._ensurePtyHost()));
        }
        if (this._ptyHostStarter.onWillShutdown) {
          this._register(this._ptyHostStarter.onWillShutdown(() => this._wasQuitRequested = true));
        }
      }
      get _proxy() {
        this._ensurePtyHost();
        return this.__proxy;
      }
      /**
       * Get the proxy if it exists, otherwise undefined. This is used when calls are not needed to be
       * passed through to the pty host if it has not yet been spawned.
       */
      get _optionalProxy() {
        return this.__proxy;
      }
      _ensurePtyHost() {
        if (!this.__connection) {
          this._startPtyHost();
        }
      }
      get _ignoreProcessNames() {
        return this._configurationService.getValue("terminal.integrated.ignoreProcessNames" /* IgnoreProcessNames */);
      }
      async _refreshIgnoreProcessNames() {
        return this._optionalProxy?.refreshIgnoreProcessNames?.(this._ignoreProcessNames);
      }
      async _resolveShellEnv() {
        if (isWindows2) {
          return process.env;
        }
        try {
          return await getResolvedShellEnv(this._configurationService, this._logService, { _: [] }, process.env);
        } catch (error) {
          this._logService.error("ptyHost was unable to resolve shell environment", error);
          return {};
        }
      }
      _startPtyHost() {
        const connection = this._ptyHostStarter.start();
        const client = connection.client;
        const store = this._ptyHostStore;
        store.add(connection.store);
        if (this._logService.getLevel() === 1 /* Trace */) {
          this._logService.trace("PtyHostService#_startPtyHost", new Error().stack?.replace(/^Error/, ""));
        }
        const heartbeatService = ProxyChannel.toService(client.getChannel("heartbeat" /* Heartbeat */));
        store.add(heartbeatService.onBeat(() => this._handleHeartbeat()));
        this._handleHeartbeat(true);
        store.add(connection.onDidProcessExit((e) => {
          this._onPtyHostExit.fire(e.code);
          if (!this._wasQuitRequested && !this._store.isDisposed) {
            if (this._restartCount <= 5 /* MaxRestarts */) {
              this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
              this._restartCount++;
              this.restartPtyHost();
            } else {
              this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
            }
          }
        }));
        const proxy = ProxyChannel.toService(client.getChannel("ptyHost" /* PtyHost */));
        store.add(proxy.onProcessData((e) => this._onProcessData.fire(e)));
        store.add(proxy.onProcessReady((e) => this._onProcessReady.fire(e)));
        store.add(proxy.onProcessExit((e) => this._onProcessExit.fire(e)));
        store.add(proxy.onDidChangeProperty((e) => this._onDidChangeProperty.fire(e)));
        store.add(proxy.onProcessReplay((e) => this._onProcessReplay.fire(e)));
        store.add(proxy.onProcessOrphanQuestion((e) => this._onProcessOrphanQuestion.fire(e)));
        store.add(proxy.onDidRequestDetach((e) => this._onDidRequestDetach.fire(e)));
        store.add(new RemoteLoggerChannelClient(this._loggerService, client.getChannel("logger" /* Logger */)));
        this.__connection = connection;
        this.__proxy = proxy;
        this._onPtyHostStart.fire();
        store.add(this._configurationService.onDidChangeConfiguration(async (e) => {
          if (e.affectsConfiguration("terminal.integrated.ignoreProcessNames" /* IgnoreProcessNames */)) {
            await this._refreshIgnoreProcessNames();
          }
        }));
        this._refreshIgnoreProcessNames();
      }
      async createProcess(shellLaunchConfig, cwd3, cols, rows, unicodeVersion, env2, executableEnv, options, shouldPersist, workspaceId, workspaceName) {
        const timeout2 = setTimeout(() => this._handleUnresponsiveCreateProcess(), 5e3 /* CreateProcessTimeout */);
        const id2 = await this._proxy.createProcess(shellLaunchConfig, cwd3, cols, rows, unicodeVersion, env2, executableEnv, options, shouldPersist, workspaceId, workspaceName);
        clearTimeout(timeout2);
        return id2;
      }
      updateTitle(id2, title, titleSource) {
        return this._proxy.updateTitle(id2, title, titleSource);
      }
      updateIcon(id2, userInitiated, icon, color2) {
        return this._proxy.updateIcon(id2, userInitiated, icon, color2);
      }
      attachToProcess(id2) {
        return this._proxy.attachToProcess(id2);
      }
      detachFromProcess(id2, forcePersist) {
        return this._proxy.detachFromProcess(id2, forcePersist);
      }
      shutdownAll() {
        return this._proxy.shutdownAll();
      }
      listProcesses() {
        return this._proxy.listProcesses();
      }
      async getPerformanceMarks() {
        return this._optionalProxy?.getPerformanceMarks() ?? [];
      }
      async reduceConnectionGraceTime() {
        return this._optionalProxy?.reduceConnectionGraceTime();
      }
      start(id2) {
        return this._proxy.start(id2);
      }
      shutdown(id2, immediate) {
        return this._proxy.shutdown(id2, immediate);
      }
      input(id2, data) {
        return this._proxy.input(id2, data);
      }
      sendSignal(id2, signal) {
        return this._proxy.sendSignal(id2, signal);
      }
      processBinary(id2, data) {
        return this._proxy.processBinary(id2, data);
      }
      resize(id2, cols, rows, pixelWidth, pixelHeight) {
        return this._proxy.resize(id2, cols, rows, pixelWidth, pixelHeight);
      }
      clearBuffer(id2) {
        return this._proxy.clearBuffer(id2);
      }
      acknowledgeDataEvent(id2, charCount) {
        return this._proxy.acknowledgeDataEvent(id2, charCount);
      }
      setUnicodeVersion(id2, version) {
        return this._proxy.setUnicodeVersion(id2, version);
      }
      setNextCommandId(id2, commandLine, commandId) {
        return this._proxy.setNextCommandId(id2, commandLine, commandId);
      }
      getInitialCwd(id2) {
        return this._proxy.getInitialCwd(id2);
      }
      getCwd(id2) {
        return this._proxy.getCwd(id2);
      }
      async getLatency() {
        const sw = new StopWatch();
        const results = await this._proxy.getLatency();
        sw.stop();
        return [
          {
            label: "ptyhostservice<->ptyhost",
            latency: sw.elapsed()
          },
          ...results
        ];
      }
      orphanQuestionReply(id2) {
        return this._proxy.orphanQuestionReply(id2);
      }
      installAutoReply(match, reply) {
        return this._proxy.installAutoReply(match, reply);
      }
      uninstallAllAutoReplies() {
        return this._proxy.uninstallAllAutoReplies();
      }
      getDefaultSystemShell(osOverride) {
        return this._optionalProxy?.getDefaultSystemShell(osOverride) ?? getSystemShell(osOverride ?? OS, process.env);
      }
      async getProfiles(workspaceId, profiles, defaultProfile, includeDetectedProfiles = false) {
        const shellEnv = await this._resolveShellEnv();
        return detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, this._configurationService, shellEnv, void 0, this._logService, this._resolveVariables.bind(this, workspaceId));
      }
      async getEnvironment() {
        if (!this.__proxy) {
          return { ...process.env };
        }
        return this._proxy.getEnvironment();
      }
      getWslPath(original, direction) {
        return this._proxy.getWslPath(original, direction);
      }
      getRevivedPtyNewId(workspaceId, id2) {
        return this._proxy.getRevivedPtyNewId(workspaceId, id2);
      }
      setTerminalLayoutInfo(args2) {
        return this._proxy.setTerminalLayoutInfo(args2);
      }
      async getTerminalLayoutInfo(args2) {
        return this._optionalProxy?.getTerminalLayoutInfo(args2);
      }
      async requestDetachInstance(workspaceId, instanceId) {
        return this._proxy.requestDetachInstance(workspaceId, instanceId);
      }
      async acceptDetachInstanceReply(requestId, persistentProcessId) {
        return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
      }
      async freePortKillProcess(port) {
        if (!this._proxy.freePortKillProcess) {
          throw new Error("freePortKillProcess does not exist on the pty proxy");
        }
        return this._proxy.freePortKillProcess(port);
      }
      async serializeTerminalState(ids) {
        return this._proxy.serializeTerminalState(ids);
      }
      async reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate) {
        return this._proxy.reviveTerminalProcesses(workspaceId, state, dateTimeFormatLocate);
      }
      async refreshProperty(id2, property) {
        return this._proxy.refreshProperty(id2, property);
      }
      async updateProperty(id2, property, value) {
        return this._proxy.updateProperty(id2, property, value);
      }
      async restartPtyHost() {
        this._disposePtyHost();
        this._isResponsive = true;
        this._startPtyHost();
      }
      _disposePtyHost() {
        this._clearHeartbeatTimeouts();
        this._optionalProxy?.shutdownAll().catch(() => {
        });
        this.__connection = void 0;
        this.__proxy = void 0;
        this._ptyHostStore.clear();
      }
      _handleHeartbeat(isConnecting) {
        this._clearHeartbeatTimeouts();
        this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), isConnecting ? 2e4 /* ConnectingBeatInterval */ : 5e3 /* BeatInterval */ * 1.2 /* FirstWaitMultiplier */);
        if (!this._isResponsive) {
          this._isResponsive = true;
          this._onPtyHostResponsive.fire();
        }
      }
      _handleHeartbeatFirstTimeout() {
        this._logService.warn(`No ptyHost heartbeat after ${5e3 /* BeatInterval */ * 1.2 /* FirstWaitMultiplier */ / 1e3} seconds`);
        this._heartbeatFirstTimeout = void 0;
        this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), 5e3 /* BeatInterval */ * 1 /* SecondWaitMultiplier */);
      }
      _handleHeartbeatSecondTimeout() {
        this._logService.error(`No ptyHost heartbeat after ${(5e3 /* BeatInterval */ * 1.2 /* FirstWaitMultiplier */ + 5e3 /* BeatInterval */ * 1.2 /* FirstWaitMultiplier */) / 1e3} seconds`);
        this._heartbeatSecondTimeout = void 0;
        if (this._isResponsive) {
          this._isResponsive = false;
          this._onPtyHostUnresponsive.fire();
        }
      }
      _handleUnresponsiveCreateProcess() {
        this._clearHeartbeatTimeouts();
        this._logService.error(`No ptyHost response to createProcess after ${5e3 /* CreateProcessTimeout */ / 1e3} seconds`);
        if (this._isResponsive) {
          this._isResponsive = false;
          this._onPtyHostUnresponsive.fire();
        }
      }
      _clearHeartbeatTimeouts() {
        if (this._heartbeatFirstTimeout) {
          clearTimeout(this._heartbeatFirstTimeout);
          this._heartbeatFirstTimeout = void 0;
        }
        if (this._heartbeatSecondTimeout) {
          clearTimeout(this._heartbeatSecondTimeout);
          this._heartbeatSecondTimeout = void 0;
        }
      }
      _resolveVariables(workspaceId, text) {
        return this._resolveVariablesRequestStore.createRequest({ workspaceId, originalText: text });
      }
      async acceptPtyHostResolvedVariables(requestId, resolved) {
        this._resolveVariablesRequestStore.acceptReply(requestId, resolved);
      }
    };
    PtyHostService = __decorateClass([
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, ILogService),
      __decorateParam(3, ILoggerService)
    ], PtyHostService);
  }
});
export { PtyHostService, init_ptyHostService };
