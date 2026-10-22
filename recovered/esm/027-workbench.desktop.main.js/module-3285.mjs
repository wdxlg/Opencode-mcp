// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalProcessManager.ts
import { Disposable, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { TerminalCapabilityStore } from "./module-2353.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { createTerminalEnvironment, createVariableResolver, getCwd, getWorkspaceForTerminal, mergeEnvironments } from "./module-3266.mjs";
import { isString } from "./module-0010.mjs";
import { getRemoteAuthority } from "./module-0687.mjs";
import { MergedEnvironmentVariableCollection } from "./module-3284.mjs";
import { EnvironmentVariableInfoChangesActive, EnvironmentVariableInfoStale } from "./module-3283.mjs";
import { generateUuid } from "./module-0190.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { OS, isMacintosh, isWindows } from "./module-0014.mjs";
import { TerminalContribSettingId } from "./module-1172.mjs";
import { serializeEnvironmentVariableCollections } from "./module-1273.mjs";
import { NaiveCwdDetectionCapability } from "./module-3281.mjs";
import { getActiveWindow, runWhenWindowIdle } from "./module-0075.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { shouldUseEnvironmentVariableCollection } from "./module-3060.mjs";
import { Schemas } from "./module-0033.mjs";
import { formatMessageForTerminal } from "./module-3052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IProductService } from "./module-0873.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IPathService } from "./module-0938.mjs";
import { IEnvironmentVariableService } from "./module-1272.mjs";
import { ITerminalConfigurationService, ITerminalInstanceService, ITerminalService } from "./module-1149.mjs";
import { ITerminalProfileResolverService } from "./module-1173.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { mainWindow } from "./module-0002.mjs";
import { TerminalRecorder } from "./module-3282.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalProcessManager.ts
var TerminalProcessManager = class extends Disposable {
  constructor(_instanceId, cwd2, environmentVariableCollections, shellIntegrationNonce, _historyService, _instantiationService, _logService, _workspaceContextService, _configurationResolverService, _workbenchEnvironmentService, _productService, _remoteAgentService, _pathService, _environmentVariableService, _terminalConfigurationService, _terminalProfileResolverService, _configurationService, _terminalInstanceService, _telemetryService, _notificationService, _accessibilityService, _terminalService) {
    super();
    this._instanceId = _instanceId;
    this._historyService = _historyService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._workspaceContextService = _workspaceContextService;
    this._configurationResolverService = _configurationResolverService;
    this._workbenchEnvironmentService = _workbenchEnvironmentService;
    this._productService = _productService;
    this._remoteAgentService = _remoteAgentService;
    this._pathService = _pathService;
    this._environmentVariableService = _environmentVariableService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._configurationService = _configurationService;
    this._terminalInstanceService = _terminalInstanceService;
    this._telemetryService = _telemetryService;
    this._notificationService = _notificationService;
    this._accessibilityService = _accessibilityService;
    this._terminalService = _terminalService;
    this.processState = 1 /* Uninitialized */;
    this.capabilities = this._register(new TerminalCapabilityStore());
    this.processReadyTimestamp = 0;
    this._isDisposed = false;
    this._process = null;
    this._processType = 0 /* Process */;
    this._preLaunchInputQueue = [];
    this._environmentVariableCollectionListener = this._register(new MutableDisposable());
    this._hasWrittenData = false;
    this._hasChildProcesses = false;
    this._ptyListenersAttached = false;
    this._isDisconnected = false;
    this._dimensions = { cols: 0, rows: 0 };
    this._onPtyDisconnect = this._register(new Emitter());
    this.onPtyDisconnect = this._onPtyDisconnect.event;
    this._onPtyReconnect = this._register(new Emitter());
    this.onPtyReconnect = this._onPtyReconnect.event;
    this._onProcessReady = this._register(new Emitter());
    this.onProcessReady = this._onProcessReady.event;
    this._onProcessStateChange = this._register(new Emitter());
    this.onProcessStateChange = this._onProcessStateChange.event;
    this._onBeforeProcessData = this._register(new Emitter());
    this.onBeforeProcessData = this._onBeforeProcessData.event;
    this._onProcessData = this._register(new Emitter());
    this.onProcessData = this._onProcessData.event;
    this._onProcessReplayComplete = this._register(new Emitter());
    this.onProcessReplayComplete = this._onProcessReplayComplete.event;
    this._onDidChangeProperty = this._register(new Emitter());
    this.onDidChangeProperty = this._onDidChangeProperty.event;
    this._onEnvironmentVariableInfoChange = this._register(new Emitter());
    this.onEnvironmentVariableInfoChanged = this._onEnvironmentVariableInfoChange.event;
    this._onProcessExit = this._register(new Emitter());
    this.onProcessExit = this._onProcessExit.event;
    this._onRestoreCommands = this._register(new Emitter());
    this.onRestoreCommands = this._onRestoreCommands.event;
    this._cwdWorkspaceFolder = getWorkspaceForTerminal(cwd2, this._workspaceContextService, this._historyService);
    this.ptyProcessReady = this._createPtyProcessReadyPromise();
    this._ackDataBufferer = new AckDataBufferer((e) => this._process?.acknowledgeDataEvent(e));
    this._dataFilter = this._register(this._instantiationService.createInstance(SeamlessRelaunchDataFilter));
    this._register(this._dataFilter.onProcessData((ev) => {
      const data = isString(ev) ? ev : ev.data;
      const beforeProcessDataEvent = { data };
      this._onBeforeProcessData.fire(beforeProcessDataEvent);
      if (beforeProcessDataEvent.data && beforeProcessDataEvent.data.length > 0) {
        if (!isString(ev)) {
          ev.data = beforeProcessDataEvent.data;
        }
        this._onProcessData.fire(!isString(ev) ? ev : { data: beforeProcessDataEvent.data, trackCommit: false });
      }
    }));
    if (cwd2 && typeof cwd2 === "object") {
      this.remoteAuthority = getRemoteAuthority(cwd2);
    } else {
      this.remoteAuthority = this._workbenchEnvironmentService.remoteAuthority;
    }
    if (environmentVariableCollections) {
      this._extEnvironmentVariableCollection = new MergedEnvironmentVariableCollection(environmentVariableCollections);
      this._environmentVariableCollectionListener.value = this._environmentVariableService.onDidChangeCollections((newCollection) => this._onEnvironmentVariableCollectionChange(newCollection));
      this.environmentVariableInfo = this._instantiationService.createInstance(EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
      this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
    }
    this.shellIntegrationNonce = shellIntegrationNonce ?? generateUuid();
  }
  get persistentProcessId() {
    return this._process?.id;
  }
  get shouldPersist() {
    return !!this.reconnectionProperties || (this._process ? this._process.shouldPersist : false);
  }
  get hasWrittenData() {
    return this._hasWrittenData;
  }
  get hasChildProcesses() {
    return this._hasChildProcesses;
  }
  get reconnectionProperties() {
    return this._shellLaunchConfig?.attachPersistentProcess?.reconnectionProperties || this._shellLaunchConfig?.reconnectionProperties || void 0;
  }
  get extEnvironmentVariableCollection() {
    return this._extEnvironmentVariableCollection;
  }
  get processTraits() {
    return this._processTraits;
  }
  async freePortKillProcess(port) {
    try {
      if (this._process?.freePortKillProcess) {
        await this._process?.freePortKillProcess(port);
      }
    } catch (e) {
      this._notificationService.notify({ message: localize(20058, null, port, e), severity: severity_default.Warning });
    }
  }
  dispose(immediate = false) {
    this._isDisposed = true;
    if (this._process) {
      this._setProcessState(5 /* KilledByUser */);
      this._process.shutdown(immediate);
      this._process = null;
    }
    if (this._processListeners) {
      dispose(this._processListeners);
      this._processListeners = void 0;
    }
    super.dispose();
  }
  _createPtyProcessReadyPromise() {
    return new Promise((c) => {
      const listener = Event2.once(this.onProcessReady)(() => {
        this._logService.debug(`Terminal process ready (shellProcessId: ${this.shellProcessId})`);
        this._store.delete(listener);
        c(void 0);
      });
      this._store.add(listener);
    });
  }
  async detachFromProcess(forcePersist) {
    await this._process?.detach?.(forcePersist);
    this._process = null;
  }
  async createProcess(shellLaunchConfig, cols, rows, reset2 = true) {
    this._shellLaunchConfig = shellLaunchConfig;
    this._dimensions.cols = cols;
    this._dimensions.rows = rows;
    let newProcess;
    if (shellLaunchConfig.customPtyImplementation) {
      this._processType = 1 /* PsuedoTerminal */;
      newProcess = shellLaunchConfig.customPtyImplementation(this._instanceId, cols, rows);
    } else {
      const backend = await this._terminalInstanceService.getBackend(this.remoteAuthority);
      if (!backend) {
        throw new Error(`No terminal backend registered for remote authority '${this.remoteAuthority}'`);
      }
      this.backend = backend;
      const envForResolver = { ...await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority) };
      mergeEnvironments(envForResolver, await backend.getShellEnvironment());
      const variableResolver = createVariableResolver(this._cwdWorkspaceFolder, envForResolver, this._configurationResolverService);
      this.userHome = this._pathService.resolvedUserHome?.fsPath;
      this.os = OS;
      if (!!this.remoteAuthority) {
        const userHomeUri = await this._pathService.userHome();
        this.userHome = userHomeUri.path;
        const remoteEnv = await this._remoteAgentService.getEnvironment();
        if (!remoteEnv) {
          throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
        }
        this.userHome = remoteEnv.userHome.path;
        this.os = remoteEnv.os;
        const env2 = await this._resolveEnvironment(backend, variableResolver, shellLaunchConfig);
        const shouldPersist = (this._configurationService.getValue("task.reconnection" /* Reconnection */) && shellLaunchConfig.reconnectionProperties || !shellLaunchConfig.isFeatureTerminal) && this._terminalConfigurationService.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
        if (shellLaunchConfig.attachPersistentProcess) {
          const result2 = await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
          if (result2) {
            newProcess = result2;
          } else {
            this._logService.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
            shellLaunchConfig.attachPersistentProcess = void 0;
          }
        }
        if (!newProcess) {
          await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
            remoteAuthority: this.remoteAuthority,
            os: this.os
          });
          const options3 = {
            shellIntegration: {
              enabled: this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */),
              suggestEnabled: this._configurationService.getValue(TerminalContribSettingId.SuggestEnabled),
              nonce: this.shellIntegrationNonce
            },
            windowsUseConptyDll: this._terminalConfigurationService.config.windowsUseConptyDll ?? false,
            environmentVariableCollections: this._extEnvironmentVariableCollection?.collections ? serializeEnvironmentVariableCollections(this._extEnvironmentVariableCollection.collections) : void 0,
            workspaceFolder: this._cwdWorkspaceFolder,
            isScreenReaderOptimized: this._accessibilityService.isScreenReaderOptimized()
          };
          try {
            newProcess = await backend.createProcess(
              shellLaunchConfig,
              "",
              // TODO: Fix cwd
              cols,
              rows,
              this._terminalConfigurationService.config.unicodeVersion,
              env2,
              // TODO:
              options3,
              shouldPersist
            );
          } catch (e) {
            if (e?.message === "Could not fetch remote environment") {
              this._logService.trace(`Could not fetch remote environment, silently failing`);
              return void 0;
            }
            throw e;
          }
        }
        if (!this._isDisposed) {
          this._setupPtyHostListeners(backend);
        }
      } else {
        if (shellLaunchConfig.attachPersistentProcess) {
          const result2 = shellLaunchConfig.attachPersistentProcess.findRevivedId ? await backend.attachToRevivedProcess(shellLaunchConfig.attachPersistentProcess.id) : await backend.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
          if (result2) {
            newProcess = result2;
          } else {
            this._logService.warn(`Attach to process failed for terminal`, shellLaunchConfig.attachPersistentProcess);
            shellLaunchConfig.attachPersistentProcess = void 0;
          }
        }
        if (!newProcess) {
          newProcess = await this._launchLocalProcess(backend, shellLaunchConfig, cols, rows, this.userHome, variableResolver);
        }
        if (!this._isDisposed) {
          this._setupPtyHostListeners(backend);
        }
      }
    }
    if (this._isDisposed) {
      newProcess.shutdown(false);
      return void 0;
    }
    this._process = newProcess;
    this._setProcessState(2 /* Launching */);
    if (this.os === 3 /* Linux */ || this.os === 2 /* Macintosh */) {
      this.capabilities.add(1 /* NaiveCwdDetection */, new NaiveCwdDetectionCapability(this._process));
    }
    this._dataFilter.newProcess(this._process, reset2);
    if (this._processListeners) {
      dispose(this._processListeners);
    }
    this._processListeners = [
      newProcess.onProcessReady((e) => {
        this._logService.debug("onProcessReady", e);
        this._processTraits = e;
        this.shellProcessId = e.pid;
        this._initialCwd = e.cwd;
        this.processReadyTimestamp = Date.now();
        this._onDidChangeProperty.fire({ type: "initialCwd" /* InitialCwd */, value: this._initialCwd });
        this._onProcessReady.fire(e);
        if (this._preLaunchInputQueue.length > 0 && this._process) {
          this._logService.debug("sending prelaunch input queue", this._preLaunchInputQueue);
          newProcess.input(this._preLaunchInputQueue.join(""));
          this._preLaunchInputQueue.length = 0;
        }
      }),
      newProcess.onProcessExit((exitCode) => this._onExit(exitCode)),
      newProcess.onDidChangeProperty(({ type, value: value2 }) => {
        switch (type) {
          case "hasChildProcesses" /* HasChildProcesses */:
            this._hasChildProcesses = value2;
            break;
          case "failedShellIntegrationActivation" /* FailedShellIntegrationActivation */:
            this._telemetryService?.publicLog2("terminal/shellIntegrationActivationFailureCustomArgs");
            break;
        }
        this._onDidChangeProperty.fire({ type, value: value2 });
      })
    ];
    if (newProcess.onProcessReplayComplete) {
      this._processListeners.push(newProcess.onProcessReplayComplete(() => this._onProcessReplayComplete.fire()));
    }
    if (newProcess.onRestoreCommands) {
      this._processListeners.push(newProcess.onRestoreCommands((e) => this._onRestoreCommands.fire(e)));
    }
    setTimeout(() => {
      if (this.processState === 2 /* Launching */) {
        this._setProcessState(3 /* Running */);
      }
    }, 500 /* ErrorLaunchThresholdDuration */);
    const result = await newProcess.start();
    if (result) {
      return result;
    }
    runWhenWindowIdle(getActiveWindow(), () => {
      this.backend?.getLatency().then((measurements) => {
        this._logService.info(`Latency measurements for ${this.remoteAuthority ?? "local"} backend
${measurements.map((e) => `${e.label}: ${e.latency.toFixed(2)}ms`).join("\n")}`);
      });
    });
    return void 0;
  }
  async relaunch(shellLaunchConfig, cols, rows, reset2) {
    this.ptyProcessReady = this._createPtyProcessReadyPromise();
    this._logService.trace(`Relaunching terminal instance ${this._instanceId}`);
    if (this._isDisconnected) {
      this._isDisconnected = false;
      this._onPtyReconnect.fire();
    }
    this._hasWrittenData = false;
    return this.createProcess(shellLaunchConfig, cols, rows, reset2);
  }
  // Fetch any extension environment additions and apply them
  async _resolveEnvironment(backend, variableResolver, shellLaunchConfig) {
    const workspaceFolder = getWorkspaceForTerminal(shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
    const platformKey = isWindows ? "windows" : isMacintosh ? "osx" : "linux";
    const envFromConfigValue = this._configurationService.getValue(`terminal.integrated.env.${platformKey}`);
    this._logService.debug(`Resolving environment (useShellEnvironment=${shellLaunchConfig.useShellEnvironment}, platformKey=${platformKey}, envFromConfig=${envFromConfigValue ? Object.keys(envFromConfigValue).join(",") : "none"})`);
    let baseEnv;
    if (shellLaunchConfig.useShellEnvironment) {
      const shellEnv = await backend.getShellEnvironment();
      if (!shellEnv) {
        throw new BugIndicatingError("Cannot fetch shell environment to use");
      }
      this._logService.debug(`Shell environment resolved with ${Object.keys(shellEnv).length} variables: ${Object.keys(shellEnv).sort().join(", ")}`);
      baseEnv = shellEnv;
    } else {
      baseEnv = await this._terminalProfileResolverService.getEnvironment(this.remoteAuthority);
      this._logService.debug(`Profile environment resolved with ${Object.keys(baseEnv).length} variables`);
    }
    const env2 = await createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._terminalConfigurationService.config.detectLocale, baseEnv);
    this._logService.debug(`Terminal environment created with ${Object.keys(env2).length} variables: ${Object.keys(env2).sort().join(", ")}`);
    this._environmentVariableCollectionListener.clear();
    if (!this._isDisposed && shouldUseEnvironmentVariableCollection(shellLaunchConfig)) {
      this._extEnvironmentVariableCollection = this._environmentVariableService.mergedCollection;
      this._environmentVariableCollectionListener.value = this._environmentVariableService.onDidChangeCollections((newCollection) => this._onEnvironmentVariableCollectionChange(newCollection));
      await this._extEnvironmentVariableCollection.applyToProcessEnvironment(env2, { workspaceFolder }, variableResolver);
      if (this._extEnvironmentVariableCollection.getVariableMap({ workspaceFolder }).size) {
        this.environmentVariableInfo = this._instantiationService.createInstance(EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
        this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
      }
    }
    return env2;
  }
  async _launchLocalProcess(backend, shellLaunchConfig, cols, rows, userHome, variableResolver) {
    await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
      remoteAuthority: void 0,
      os: OS
    });
    const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(Schemas.file);
    const initialCwd = await getCwd(
      shellLaunchConfig,
      userHome,
      variableResolver,
      activeWorkspaceRootUri,
      this._terminalConfigurationService.config.cwd,
      this._logService
    );
    const env2 = await this._resolveEnvironment(backend, variableResolver, shellLaunchConfig);
    const options3 = {
      shellIntegration: {
        enabled: this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */),
        suggestEnabled: this._configurationService.getValue(TerminalContribSettingId.SuggestEnabled),
        nonce: this.shellIntegrationNonce
      },
      windowsUseConptyDll: this._terminalConfigurationService.config.windowsUseConptyDll ?? false,
      environmentVariableCollections: this._extEnvironmentVariableCollection ? serializeEnvironmentVariableCollections(this._extEnvironmentVariableCollection.collections) : void 0,
      workspaceFolder: this._cwdWorkspaceFolder,
      isScreenReaderOptimized: this._accessibilityService.isScreenReaderOptimized()
    };
    const shouldPersist = (this._configurationService.getValue("task.reconnection" /* Reconnection */) && shellLaunchConfig.reconnectionProperties || !shellLaunchConfig.isFeatureTerminal) && this._terminalConfigurationService.config.enablePersistentSessions && !shellLaunchConfig.isTransient;
    return await backend.createProcess(shellLaunchConfig, initialCwd, cols, rows, this._terminalConfigurationService.config.unicodeVersion, env2, options3, shouldPersist);
  }
  _setupPtyHostListeners(backend) {
    if (this._ptyListenersAttached) {
      return;
    }
    this._ptyListenersAttached = true;
    this._register(backend.onPtyHostUnresponsive(() => {
      this._isDisconnected = true;
      this._onPtyDisconnect.fire();
    }));
    this._ptyResponsiveListener = backend.onPtyHostResponsive(() => {
      this._isDisconnected = false;
      this._onPtyReconnect.fire();
    });
    this._register(toDisposable(() => this._ptyResponsiveListener?.dispose()));
    this._register(backend.onPtyHostRestart(async () => {
      if (!this._isDisconnected) {
        this._isDisconnected = true;
        this._onPtyDisconnect.fire();
      }
      this._ptyResponsiveListener?.dispose();
      this._ptyResponsiveListener = void 0;
      if (this._shellLaunchConfig) {
        if (this._shellLaunchConfig.isFeatureTerminal && !this.reconnectionProperties) {
          this._onExit(-1);
        } else {
          const message = localize(20059, null);
          let postRestartMessage = "";
          if (this.os === 1 /* Windows */ && this._dimensions.rows > 0) {
            postRestartMessage = "\r\n".repeat(this._dimensions.rows - 1) + `\x1B[H`;
          }
          this._onProcessData.fire({ data: formatMessageForTerminal(message, { loudFormatting: true }) + postRestartMessage, trackCommit: false });
          await this.relaunch(this._shellLaunchConfig, this._dimensions.cols, this._dimensions.rows, false);
        }
      }
    }));
    this._register(toDisposable(() => {
      this.ptyProcessReady = void 0;
    }));
  }
  async getBackendOS() {
    let os = OS;
    if (!!this.remoteAuthority) {
      const remoteEnv = await this._remoteAgentService.getEnvironment();
      if (!remoteEnv) {
        throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
      }
      os = remoteEnv.os;
    }
    return os;
  }
  setDimensions(cols, rows, sync, pixelWidth, pixelHeight) {
    if (sync) {
      this._resize(cols, rows, pixelWidth, pixelHeight);
      return;
    }
    if (this._store.isDisposed) {
      return Promise.resolve();
    }
    if (!this.ptyProcessReady) {
      throw new Error("TerminalProcessManager.setDimensions called before initialization");
    }
    return this.ptyProcessReady.then(() => this._resize(cols, rows, pixelWidth, pixelHeight));
  }
  async setUnicodeVersion(version2) {
    return this._process?.setUnicodeVersion(version2);
  }
  async setNextCommandId(commandLine, commandId) {
    await this.ptyProcessReady;
    const process3 = this._process;
    if (!process3?.id) {
      return;
    }
    await this._terminalService.setNextCommandId(process3.id, commandLine, commandId);
  }
  _resize(cols, rows, pixelWidth, pixelHeight) {
    if (!this._process) {
      return;
    }
    try {
      this._process.resize(cols, rows, pixelWidth, pixelHeight);
    } catch (error) {
      if (error.code !== "EPIPE" && error.code !== "ERR_IPC_CHANNEL_CLOSED") {
        throw error;
      }
    }
    this._dimensions.cols = cols;
    this._dimensions.rows = rows;
  }
  async write(data) {
    await this.ptyProcessReady;
    this._dataFilter.disableSeamlessRelaunch();
    this._hasWrittenData = true;
    if (this.shellProcessId || this._processType === 1 /* PsuedoTerminal */) {
      if (this._process) {
        this._process.input(data);
      }
    } else {
      this._logService.debug("queueing data in prelaunch input queue", data);
      this._preLaunchInputQueue.push(data);
    }
  }
  async sendSignal(signal) {
    await this.ptyProcessReady;
    if (this._process) {
      this._process.sendSignal(signal);
    }
  }
  async processBinary(data) {
    await this.ptyProcessReady;
    this._dataFilter.disableSeamlessRelaunch();
    this._hasWrittenData = true;
    this._process?.processBinary(data);
  }
  get initialCwd() {
    return this._initialCwd ?? "";
  }
  async refreshProperty(type) {
    if (!this._process) {
      throw new Error("Cannot refresh property when process is not set");
    }
    return this._process.refreshProperty(type);
  }
  async updateProperty(type, value2) {
    return this._process?.updateProperty(type, value2);
  }
  acknowledgeDataEvent(charCount) {
    this._ackDataBufferer.ack(charCount);
  }
  _onExit(exitCode) {
    this._process = null;
    if (this.processState === 2 /* Launching */) {
      this._setProcessState(4 /* KilledDuringLaunch */);
    }
    if (this.processState === 3 /* Running */) {
      this._setProcessState(6 /* KilledByProcess */);
    }
    this._onProcessExit.fire(exitCode);
  }
  _setProcessState(state) {
    this.processState = state;
    this._onProcessStateChange.fire();
  }
  _onEnvironmentVariableCollectionChange(newCollection) {
    const diff4 = this._extEnvironmentVariableCollection.diff(newCollection, { workspaceFolder: this._cwdWorkspaceFolder });
    if (diff4 === void 0) {
      if (this.environmentVariableInfo instanceof EnvironmentVariableInfoStale) {
        this.environmentVariableInfo = this._instantiationService.createInstance(EnvironmentVariableInfoChangesActive, this._extEnvironmentVariableCollection);
        this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
      }
      return;
    }
    this.environmentVariableInfo = this._instantiationService.createInstance(EnvironmentVariableInfoStale, diff4, this._instanceId, newCollection);
    this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
  }
  async clearBuffer() {
    this._process?.clearBuffer?.();
  }
};

TerminalProcessManager = __decorateClass([
  __decorateParam(4, IHistoryService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ITerminalLogService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IConfigurationResolverService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IProductService),
  __decorateParam(11, IRemoteAgentService),
  __decorateParam(12, IPathService),
  __decorateParam(13, IEnvironmentVariableService),
  __decorateParam(14, ITerminalConfigurationService),
  __decorateParam(15, ITerminalProfileResolverService),
  __decorateParam(16, IConfigurationService),
  __decorateParam(17, ITerminalInstanceService),
  __decorateParam(18, ITelemetryService),
  __decorateParam(19, INotificationService),
  __decorateParam(20, IAccessibilityService),
  __decorateParam(21, ITerminalService)
], TerminalProcessManager);

var AckDataBufferer = class {
  constructor(_callback) {
    this._callback = _callback;
    this._unsentCharCount = 0;
  }
  ack(charCount) {
    this._unsentCharCount += charCount;
    while (this._unsentCharCount > 5e3 /* CharCountAckSize */) {
      this._unsentCharCount -= 5e3 /* CharCountAckSize */;
      this._callback(5e3 /* CharCountAckSize */);
    }
  }
};

var SeamlessRelaunchDataFilter = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._firstDisposable = this._register(new MutableDisposable());
    this._secondDisposable = this._register(new MutableDisposable());
    this._dataListener = this._register(new MutableDisposable());
    this._disableSeamlessRelaunch = false;
    this._onProcessData = this._register(new Emitter());
  }
  get onProcessData() {
    return this._onProcessData.event;
  }
  newProcess(process3, reset2) {
    this._dataListener.clear();
    this._activeProcess?.shutdown(false);
    this._activeProcess = process3;
    if (!this._firstRecorder || !reset2 || this._disableSeamlessRelaunch) {
      [this._firstRecorder, this._firstDisposable.value] = this._createRecorder(process3);
      if (this._disableSeamlessRelaunch && reset2) {
        this._onProcessData.fire("\x1Bc");
      }
      this._dataListener.value = process3.onProcessData((e) => this._onProcessData.fire(e));
      this._disableSeamlessRelaunch = false;
      return;
    }
    if (this._secondRecorder) {
      this.triggerSwap();
    }
    this._swapTimeout = mainWindow.setTimeout(() => this.triggerSwap(), 3e3 /* SwapWaitMaximumDuration */);
    this._dataListener.clear();
    this._firstDisposable.clear();
    const recorder = this._createRecorder(process3);
    [this._secondRecorder, this._secondDisposable.value] = recorder;
  }
  /**
   * Disables seamless relaunch for the active process
   */
  disableSeamlessRelaunch() {
    this._disableSeamlessRelaunch = true;
    this._stopRecording();
    this.triggerSwap();
  }
  /**
   * Trigger the swap of the processes if needed (eg. timeout, input)
   */
  triggerSwap() {
    if (this._swapTimeout) {
      mainWindow.clearTimeout(this._swapTimeout);
      this._swapTimeout = void 0;
    }
    if (!this._firstRecorder) {
      return;
    }
    if (!this._secondRecorder) {
      this._firstRecorder = void 0;
      this._firstDisposable.clear();
      return;
    }
    const firstData = this._getDataFromRecorder(this._firstRecorder);
    const secondData = this._getDataFromRecorder(this._secondRecorder);
    if (firstData === secondData) {
      this._logService.trace(`Seamless terminal relaunch - identical content`);
    } else {
      this._logService.trace(`Seamless terminal relaunch - resetting content`);
      this._onProcessData.fire({ data: `\x1Bc${secondData}`, trackCommit: false });
    }
    this._dataListener.value = this._activeProcess.onProcessData((e) => this._onProcessData.fire(e));
    this._firstRecorder = this._secondRecorder;
    this._firstDisposable.value = this._secondDisposable.value;
    this._secondRecorder = void 0;
  }
  _stopRecording() {
    if (this._swapTimeout) {
      return;
    }
    this._firstRecorder = void 0;
    this._firstDisposable.clear();
    this._secondRecorder = void 0;
    this._secondDisposable.clear();
  }
  _createRecorder(process3) {
    const recorder = new TerminalRecorder(0, 0);
    const disposable = process3.onProcessData((e) => recorder.handleData(isString(e) ? e : e.data));
    return [recorder, disposable];
  }
  _getDataFromRecorder(recorder) {
    return recorder.generateReplayEventSync().events.filter((e) => !!e.data).map((e) => e.data).join("");
  }
};

SeamlessRelaunchDataFilter = __decorateClass([
  __decorateParam(0, ITerminalLogService)
], SeamlessRelaunchDataFilter);
export { TerminalProcessManager, AckDataBufferer, SeamlessRelaunchDataFilter };
