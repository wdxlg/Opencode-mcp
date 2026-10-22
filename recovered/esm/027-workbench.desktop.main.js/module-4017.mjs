// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/localTerminalBackend.ts
import { Registry } from "./module-0090.mjs";
import { ILocalPtyService, ITerminalLogService, TerminalExtensions } from "./module-1154.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";
import { BaseTerminalBackend } from "./module-3262.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { ProxyChannel, getDelayedChannel } from "./module-1230.mjs";
import { mark } from "./module-0506.mjs";
import { acquirePort } from "./module-3731.mjs";
import { Client2 } from "./module-3730.mjs";
import { LocalPty } from "./module-4016.mjs";
import { StopWatch } from "./module-0016.mjs";
import { createTerminalEnvironment, createVariableResolver, getWorkspaceForTerminal, mergeEnvironments } from "./module-3266.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { shouldUseEnvironmentVariableCollection } from "./module-3060.mjs";
import { memoize } from "./module-0250.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IShellEnvironmentService } from "./module-3825.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { ITerminalProfileResolverService } from "./module-1173.mjs";
import { IEnvironmentVariableService } from "./module-1272.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/localTerminalBackend.ts
var LocalTerminalBackendContribution = class {
  static {
    this.ID = "workbench.contrib.localTerminalBackend";
  }
  constructor(instantiationService, terminalInstanceService) {
    const backend = instantiationService.createInstance(LocalTerminalBackend);
    Registry.as(TerminalExtensions.Backend).registerTerminalBackend(backend);
    terminalInstanceService.didRegisterBackend(backend);
  }
};

LocalTerminalBackendContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITerminalInstanceService)
], LocalTerminalBackendContribution);

var LocalTerminalBackend = class extends BaseTerminalBackend {
  constructor(workspaceContextService, _lifecycleService, logService, _localPtyService, _labelService, _shellEnvironmentService, _storageService, _configurationResolverService, _configurationService, _productService, _historyService, _terminalProfileResolverService, _environmentVariableService, historyService, _nativeHostService, statusBarService, _remoteAgentService, _environmentService) {
    super(_localPtyService, logService, historyService, _configurationResolverService, statusBarService, workspaceContextService);
    this._lifecycleService = _lifecycleService;
    this._localPtyService = _localPtyService;
    this._labelService = _labelService;
    this._shellEnvironmentService = _shellEnvironmentService;
    this._storageService = _storageService;
    this._configurationResolverService = _configurationResolverService;
    this._configurationService = _configurationService;
    this._productService = _productService;
    this._historyService = _historyService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._environmentVariableService = _environmentVariableService;
    this._nativeHostService = _nativeHostService;
    this._remoteAgentService = _remoteAgentService;
    this._environmentService = _environmentService;
    this.remoteAuthority = void 0;
    this._ptys = /* @__PURE__ */ new Map();
    this._directProxyDisposables = this._register(new MutableDisposable());
    this._whenReady = new DeferredPromise();
    this._onDidRequestDetach = this._register(new Emitter());
    this.onDidRequestDetach = this._onDidRequestDetach.event;
    this._register(this.onPtyHostRestart(() => {
      this._directProxy = void 0;
      this._directProxyClientEventually = void 0;
      this._connectToDirectProxy();
    }));
  }
  /**
   * Communicate to the direct proxy (renderer<->ptyhost) if it's available, otherwise use the
   * indirect proxy (renderer<->main<->ptyhost). The latter may not need to actually launch the
   * pty host, for example when detecting profiles.
   */
  get _proxy() {
    return this._directProxy || this._localPtyService;
  }
  get whenReady() {
    return this._whenReady.p;
  }
  setReady() {
    this._whenReady.complete();
  }
  /**
   * Request a direct connection to the pty host, this will launch the pty host process if necessary.
   */
  async _connectToDirectProxy() {
    if (this._directProxyClientEventually) {
      await this._directProxyClientEventually.p;
      return;
    }
    this._logService.debug("Starting pty host");
    const directProxyClientEventually = new DeferredPromise();
    this._directProxyClientEventually = directProxyClientEventually;
    const directProxy = ProxyChannel.toService(getDelayedChannel(this._directProxyClientEventually.p.then((client) => client.getChannel("ptyHostWindow" /* PtyHostWindow */))));
    this._directProxy = directProxy;
    this._directProxyDisposables.clear();
    if (!this._remoteAgentService.getConnection()?.remoteAuthority) {
      await this._lifecycleService.when(3 /* Restored */);
    }
    mark("code/terminal/willConnectPtyHost");
    this._logService.trace("Renderer->PtyHost#connect: before acquirePort");
    acquirePort("vscode:createPtyHostMessageChannel", "vscode:createPtyHostMessageChannelResult").then((port) => {
      mark("code/terminal/didConnectPtyHost");
      this._logService.trace("Renderer->PtyHost#connect: connection established");
      const store = new DisposableStore();
      this._directProxyDisposables.value = store;
      const client = store.add(new Client2(port, `window:${this._nativeHostService.windowId}`));
      directProxyClientEventually.complete(client);
      this._onPtyHostConnected.fire();
      store.add(directProxy.onProcessData((e) => this._ptys.get(e.id)?.handleData(e.event)));
      store.add(directProxy.onDidChangeProperty((e) => this._ptys.get(e.id)?.handleDidChangeProperty(e.property)));
      store.add(directProxy.onProcessExit((e) => {
        const pty = this._ptys.get(e.id);
        if (pty) {
          pty.handleExit(e.event);
          pty.dispose();
          this._ptys.delete(e.id);
        }
      }));
      store.add(directProxy.onProcessReady((e) => this._ptys.get(e.id)?.handleReady(e.event)));
      store.add(directProxy.onProcessReplay((e) => this._ptys.get(e.id)?.handleReplay(e.event)));
      store.add(directProxy.onProcessOrphanQuestion((e) => this._ptys.get(e.id)?.handleOrphanQuestion()));
      store.add(directProxy.onDidRequestDetach((e) => this._onDidRequestDetach.fire(e)));
      this.getEnvironment();
    });
  }
  async requestDetachInstance(workspaceId, instanceId) {
    return this._proxy.requestDetachInstance(workspaceId, instanceId);
  }
  async acceptDetachInstanceReply(requestId, persistentProcessId) {
    if (!persistentProcessId) {
      this._logService.warn("Cannot attach to feature terminals, custom pty terminals, or those without a persistentProcessId");
      return;
    }
    return this._proxy.acceptDetachInstanceReply(requestId, persistentProcessId);
  }
  async persistTerminalState() {
    const ids = Array.from(this._ptys.keys());
    const serialized = await this._proxy.serializeTerminalState(ids);
    this._storageService.store("terminal.integrated.bufferState" /* TerminalBufferState */, serialized, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async updateTitle(id2, title, titleSource) {
    await this._proxy.updateTitle(id2, title, titleSource);
  }
  async updateIcon(id2, userInitiated, icon2, color2) {
    await this._proxy.updateIcon(id2, userInitiated, icon2, color2);
  }
  async setNextCommandId(id2, commandLine, commandId) {
    await this._proxy.setNextCommandId(id2, commandLine, commandId);
  }
  async updateProperty(id2, property, value2) {
    return this._proxy.updateProperty(id2, property, value2);
  }
  async createProcess(shellLaunchConfig, cwd2, cols, rows, unicodeVersion, env2, options3, shouldPersist) {
    await this._connectToDirectProxy();
    const executableEnv = await this._shellEnvironmentService.getShellEnv();
    const id2 = await this._proxy.createProcess(shellLaunchConfig, cwd2, cols, rows, unicodeVersion, env2, executableEnv, options3, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
    const pty = new LocalPty(id2, shouldPersist, this._proxy);
    this._ptys.set(id2, pty);
    return pty;
  }
  async attachToProcess(id2) {
    await this._connectToDirectProxy();
    try {
      await this._proxy.attachToProcess(id2);
      const pty = new LocalPty(id2, true, this._proxy);
      this._ptys.set(id2, pty);
      return pty;
    } catch (e) {
      this._logService.warn(`Couldn't attach to process ${e.message}`);
    }
    return void 0;
  }
  async attachToRevivedProcess(id2) {
    await this._connectToDirectProxy();
    try {
      const newId = await this._proxy.getRevivedPtyNewId(this._getWorkspaceId(), id2) ?? id2;
      return await this.attachToProcess(newId);
    } catch (e) {
      this._logService.warn(`Couldn't attach to process ${e.message}`);
    }
    return void 0;
  }
  async listProcesses() {
    await this._connectToDirectProxy();
    return this._proxy.listProcesses();
  }
  async getLatency() {
    const measurements = [];
    const sw = new StopWatch();
    if (this._directProxy) {
      await this._directProxy.getLatency();
      sw.stop();
      measurements.push({
        label: "window<->ptyhost (message port)",
        latency: sw.elapsed()
      });
      sw.reset();
    }
    const results = await this._localPtyService.getLatency();
    sw.stop();
    measurements.push({
      label: "window<->ptyhostservice<->ptyhost",
      latency: sw.elapsed()
    });
    return [
      ...measurements,
      ...results
    ];
  }
  async getPerformanceMarks() {
    return this._proxy.getPerformanceMarks();
  }
  async reduceConnectionGraceTime() {
    this._proxy.reduceConnectionGraceTime();
  }
  async getDefaultSystemShell(osOverride) {
    return this._proxy.getDefaultSystemShell(osOverride);
  }
  async getProfiles(profiles2, defaultProfile, includeDetectedProfiles) {
    return this._localPtyService.getProfiles(this._workspaceContextService.getWorkspace().id, profiles2, defaultProfile, includeDetectedProfiles) || [];
  }
  async getEnvironment() {
    return this._proxy.getEnvironment();
  }
  async getShellEnvironment() {
    const env2 = { ...await this._shellEnvironmentService.getShellEnv() };
    if (this._environmentService.debugExtensionHost.env) {
      mergeEnvironments(env2, this._environmentService.debugExtensionHost.env);
    }
    return env2;
  }
  async getWslPath(original, direction) {
    return this._proxy.getWslPath(original, direction);
  }
  async setTerminalLayoutInfo(layoutInfo) {
    const args2 = {
      workspaceId: this._getWorkspaceId(),
      tabs: layoutInfo ? layoutInfo.tabs.filter((tab) => tab.terminals.length > 0) : [],
      background: layoutInfo ? layoutInfo.background : null
    };
    await this._proxy.setTerminalLayoutInfo(args2);
    this._storageService.store("terminal.integrated.layoutInfo" /* TerminalLayoutInfo */, JSON.stringify(args2), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async getTerminalLayoutInfo() {
    const workspaceId = this._getWorkspaceId();
    const layoutArgs = { workspaceId };
    const serializedState = this._storageService.get("terminal.integrated.bufferState" /* TerminalBufferState */, 1 /* WORKSPACE */);
    const reviveBufferState = this._deserializeTerminalState(serializedState);
    if (reviveBufferState && reviveBufferState.length > 0) {
      try {
        const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
        const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
        const variableResolver = createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority), this._configurationResolverService);
        mark("code/terminal/willGetReviveEnvironments");
        await Promise.all(reviveBufferState.map((state) => new Promise((r2) => {
          this._resolveEnvironmentForRevive(variableResolver, state.shellLaunchConfig).then((freshEnv) => {
            state.processLaunchConfig.env = freshEnv;
            r2();
          });
        })));
        mark("code/terminal/didGetReviveEnvironments");
        mark("code/terminal/willReviveTerminalProcesses");
        await this._proxy.reviveTerminalProcesses(workspaceId, reviveBufferState, Intl.DateTimeFormat().resolvedOptions().locale);
        mark("code/terminal/didReviveTerminalProcesses");
        this._storageService.remove("terminal.integrated.bufferState" /* TerminalBufferState */, 1 /* WORKSPACE */);
        const layoutInfo = this._storageService.get("terminal.integrated.layoutInfo" /* TerminalLayoutInfo */, 1 /* WORKSPACE */);
        if (layoutInfo) {
          mark("code/terminal/willSetTerminalLayoutInfo");
          await this._proxy.setTerminalLayoutInfo(JSON.parse(layoutInfo));
          mark("code/terminal/didSetTerminalLayoutInfo");
          this._storageService.remove("terminal.integrated.layoutInfo" /* TerminalLayoutInfo */, 1 /* WORKSPACE */);
        }
      } catch (e) {
        this._logService.warn("LocalTerminalBackend#getTerminalLayoutInfo Error", e.message ?? e);
      }
    }
    return this._proxy.getTerminalLayoutInfo(layoutArgs);
  }
  async _resolveEnvironmentForRevive(variableResolver, shellLaunchConfig) {
    const platformKey = isWindows ? "windows" : isMacintosh ? "osx" : "linux";
    const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
    const baseEnv = await (shellLaunchConfig.useShellEnvironment ? this.getShellEnvironment() : this.getEnvironment());
    const env2 = await createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configurationService.getValue("terminal.integrated.detectLocale" /* DetectLocale */), baseEnv);
    if (shouldUseEnvironmentVariableCollection(shellLaunchConfig)) {
      const workspaceFolder = getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
      await this._environmentVariableService.mergedCollection.applyToProcessEnvironment(env2, { workspaceFolder }, variableResolver);
    }
    return env2;
  }
  _getWorkspaceName() {
    return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
  }
  // #region Pty service contribution RPC calls
  installAutoReply(match2, reply) {
    return this._proxy.installAutoReply(match2, reply);
  }
  uninstallAllAutoReplies() {
    return this._proxy.uninstallAllAutoReplies();
  }
  // #endregion
};

__decorateClass([
  memoize
], LocalTerminalBackend.prototype, "getEnvironment", 1);

__decorateClass([
  memoize
], LocalTerminalBackend.prototype, "getShellEnvironment", 1);

LocalTerminalBackend = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, ITerminalLogService),
  __decorateParam(3, ILocalPtyService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IShellEnvironmentService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IConfigurationResolverService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IHistoryService),
  __decorateParam(11, ITerminalProfileResolverService),
  __decorateParam(12, IEnvironmentVariableService),
  __decorateParam(13, IHistoryService),
  __decorateParam(14, INativeHostService),
  __decorateParam(15, IStatusbarService),
  __decorateParam(16, IRemoteAgentService),
  __decorateParam(17, INativeWorkbenchEnvironmentService)
], LocalTerminalBackend);
export { LocalTerminalBackendContribution, LocalTerminalBackend };
