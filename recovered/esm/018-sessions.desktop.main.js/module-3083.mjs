// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { DeferredPromise, timeout } from "./module-0036.mjs";
import { DynamicListEventMultiplexer, Emitter, Event2 } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { isMacintosh, isWeb } from "./module-0014.mjs";
import { isAuxiliaryWindow, mainWindow } from "./module-0002.mjs";
import { TerminalProfileQuickpick } from "./module-3081.mjs";
import { hasKey, isString } from "./module-0010.mjs";
import { mark } from "./module-0506.mjs";
import { getInstanceFromResource, getTerminalUri, parseTerminalUri } from "./module-2131.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { TerminalInstance } from "./module-3076.mjs";
import { TerminalCapabilityStore } from "./module-2328.mjs";
import { XtermTerminal } from "./module-3071.mjs";
import { DetachedTerminal } from "./module-2331.mjs";
import { getCwdForSplit } from "./module-3043.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { columnToEditorGroup } from "./module-1079.mjs";
import { VirtualWorkspaceContext } from "./module-0950.mjs";
import { formatMessageForTerminal } from "./module-3052.mjs";
import { createInstanceCapabilityEventMultiplexer } from "./module-3082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce, memoize } from "./module-0250.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from "./module-1150.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ITerminalProfileService } from "./module-1174.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITimerService } from "./module-1183.mjs";
import { IThemeService, Themable } from "./module-0287.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { isDark } from "./module-0247.mjs";
import { getColorStyleContent, getUriClasses } from "./module-1175.mjs";
import { asCSSUrl, className, inline, stringValue } from "./module-0449.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { iconForeground } from "./module-0227.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalService.ts
var TerminalService = class extends Disposable {
  constructor(_contextKeyService, _lifecycleService, _logService, _dialogService, _instantiationService, _remoteAgentService, _configurationService, _environmentService, _terminalConfigurationService, _terminalEditorService, _terminalGroupService, _terminalInstanceService, _editorGroupsService, _terminalProfileService, _extensionService, _notificationService, _workspaceContextService, _commandService, _keybindingService, _timerService, _themeService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._lifecycleService = _lifecycleService;
    this._logService = _logService;
    this._dialogService = _dialogService;
    this._instantiationService = _instantiationService;
    this._remoteAgentService = _remoteAgentService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalEditorService = _terminalEditorService;
    this._terminalGroupService = _terminalGroupService;
    this._terminalInstanceService = _terminalInstanceService;
    this._editorGroupsService = _editorGroupsService;
    this._terminalProfileService = _terminalProfileService;
    this._extensionService = _extensionService;
    this._notificationService = _notificationService;
    this._workspaceContextService = _workspaceContextService;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._timerService = _timerService;
    this._themeService = _themeService;
    this._hostActiveTerminals = /* @__PURE__ */ new Map();
    this._detachedXterms = /* @__PURE__ */ new Set();
    this._detachedListenersRegistered = false;
    this._isShuttingDown = false;
    this._backgroundedTerminalInstances = [];
    this._backgroundedTerminalDisposables = this._register(new DisposableMap());
    this._connectionState = 0 /* Connecting */;
    this._whenConnected = new DeferredPromise();
    this._restoredGroupCount = 0;
    this._reconnectedTerminals = /* @__PURE__ */ new Map();
    this._onDidCreateInstance = this._register(new Emitter());
    this._onDidChangeInstanceDimensions = this._register(new Emitter());
    this._onDidRegisterProcessSupport = this._register(new Emitter());
    this._onDidChangeConnectionState = this._register(new Emitter());
    this._onDidRequestStartExtensionTerminal = this._register(new Emitter());
    // ITerminalInstanceHost events
    this._onDidDisposeInstance = this._register(new Emitter());
    this._onDidFocusInstance = this._register(new Emitter());
    this._onDidChangeActiveInstance = this._register(new Emitter());
    this._onDidChangeInstances = this._register(new Emitter());
    this._onDidChangeInstanceCapability = this._register(new Emitter());
    // Terminal view events
    this._onDidChangeActiveGroup = this._register(new Emitter());
    this._register(this.onDidCreateInstance(() => this._terminalProfileService.refreshAvailableProfiles()));
    this._forwardInstanceHostEvents(this._terminalGroupService);
    this._forwardInstanceHostEvents(this._terminalEditorService);
    this._register(this._terminalGroupService.onDidChangeActiveGroup(this._onDidChangeActiveGroup.fire, this._onDidChangeActiveGroup));
    this._register(this._terminalInstanceService.onDidCreateInstance((instance2) => {
      this._initInstanceListeners(instance2);
      this._onDidCreateInstance.fire(instance2);
    }));
    this._register(this._terminalGroupService.onDidChangeActiveInstance((instance2) => {
      if (!instance2 && !this._isShuttingDown && this._terminalConfigurationService.config.hideOnLastClosed) {
        this._terminalGroupService.hidePanel();
      }
      if (instance2?.shellType) {
        this._terminalShellTypeContextKey.set(instance2.shellType.toString());
      } else if (!instance2 || !instance2.shellType) {
        this._terminalShellTypeContextKey.reset();
      }
    }));
    this._handleInstanceContextKeys();
    this._terminalShellTypeContextKey = TerminalContextKeys.shellType.bindTo(this._contextKeyService);
    this._processSupportContextKey = TerminalContextKeys.processSupported.bindTo(this._contextKeyService);
    this._processSupportContextKey.set(!isWeb || this._remoteAgentService.getConnection() !== null);
    this._terminalHasBeenCreated = TerminalContextKeys.terminalHasBeenCreated.bindTo(this._contextKeyService);
    this._terminalCountContextKey = TerminalContextKeys.count.bindTo(this._contextKeyService);
    this._register(_lifecycleService.onBeforeShutdown(async (e4) => e4.veto(this._onBeforeShutdown(e4.reason), "veto.terminal")));
    this._register(_lifecycleService.onWillShutdown((e4) => this._onWillShutdown(e4)));
    this._initializePrimaryBackend();
    timeout(0).then(() => this._register(this._instantiationService.createInstance(TerminalEditorStyle, mainWindow.document.head)));
  }
  get isProcessSupportRegistered() {
    return !!this._processSupportContextKey.get();
  }
  get connectionState() {
    return this._connectionState;
  }
  get whenConnected() {
    return this._whenConnected.p;
  }
  get restoredGroupCount() {
    return this._restoredGroupCount;
  }
  get instances() {
    return this._terminalGroupService.instances.concat(this._terminalEditorService.instances).concat(this._backgroundedTerminalInstances.map((bg) => bg.instance));
  }
  /** Gets all non-background terminals. */
  get foregroundInstances() {
    return this._terminalGroupService.instances.concat(this._terminalEditorService.instances);
  }
  get detachedInstances() {
    return this._detachedXterms;
  }
  getReconnectedTerminals(reconnectionOwner) {
    return this._reconnectedTerminals.get(reconnectionOwner);
  }
  get activeInstance() {
    for (const activeHostTerminal of this._hostActiveTerminals.values()) {
      if (activeHostTerminal?.hasFocus) {
        return activeHostTerminal;
      }
    }
    return this._activeInstance;
  }
  get onDidCreateInstance() {
    return this._onDidCreateInstance.event;
  }
  get onDidChangeInstanceDimensions() {
    return this._onDidChangeInstanceDimensions.event;
  }
  get onDidRegisterProcessSupport() {
    return this._onDidRegisterProcessSupport.event;
  }
  get onDidChangeConnectionState() {
    return this._onDidChangeConnectionState.event;
  }
  get onDidRequestStartExtensionTerminal() {
    return this._onDidRequestStartExtensionTerminal.event;
  }
  get onDidDisposeInstance() {
    return this._onDidDisposeInstance.event;
  }
  get onDidFocusInstance() {
    return this._onDidFocusInstance.event;
  }
  get onDidChangeActiveInstance() {
    return this._onDidChangeActiveInstance.event;
  }
  get onDidChangeInstances() {
    return this._onDidChangeInstances.event;
  }
  get onDidChangeInstanceCapability() {
    return this._onDidChangeInstanceCapability.event;
  }
  get onDidChangeActiveGroup() {
    return this._onDidChangeActiveGroup.event;
  }
  get onAnyInstanceData() {
    return this._register(this.createOnInstanceEvent((instance2) => Event2.map(instance2.onData, (data) => ({ instance: instance2, data })))).event;
  }
  get onAnyInstanceDataInput() {
    return this._register(this.createOnInstanceEvent((e4) => Event2.map(e4.onDidInputData, () => e4, e4.store))).event;
  }
  get onAnyInstanceIconChange() {
    return this._register(this.createOnInstanceEvent((e4) => e4.onIconChanged)).event;
  }
  get onAnyInstanceMaximumDimensionsChange() {
    return this._register(this.createOnInstanceEvent((e4) => Event2.map(e4.onMaximumDimensionsChanged, () => e4, e4.store))).event;
  }
  get onAnyInstancePrimaryStatusChange() {
    return this._register(this.createOnInstanceEvent((e4) => Event2.map(e4.statusList.onDidChangePrimaryStatus, () => e4, e4.store))).event;
  }
  get onAnyInstanceProcessIdReady() {
    return this._register(this.createOnInstanceEvent((e4) => e4.onProcessIdReady)).event;
  }
  get onAnyInstanceSelectionChange() {
    return this._register(this.createOnInstanceEvent((e4) => e4.onDidChangeSelection)).event;
  }
  get onAnyInstanceTitleChange() {
    return this._register(this.createOnInstanceEvent((e4) => e4.onTitleChanged)).event;
  }
  get onAnyInstanceShellTypeChanged() {
    return this._register(this.createOnInstanceEvent((e4) => Event2.map(e4.onDidChangeShellType, () => e4))).event;
  }
  get onAnyInstanceAddedCapabilityType() {
    return this._register(this.createOnInstanceEvent((e4) => Event2.map(e4.capabilities.onDidAddCapability, (e5) => e5.id))).event;
  }
  async showProfileQuickPick(type, cwd2) {
    const quickPick = this._instantiationService.createInstance(TerminalProfileQuickpick);
    const result = await quickPick.showAndGetResult(type);
    if (!result) {
      return;
    }
    if (isString(result)) {
      return;
    }
    const keyMods = result.keyMods;
    if (type === "createInstance") {
      const activeInstance = this.getDefaultInstanceHost().activeInstance;
      const defaultLocation = this._terminalConfigurationService.defaultLocation;
      let instance2;
      if (result.config && hasKey(result.config, { id: true })) {
        await this.createContributedTerminalProfile(result.config.extensionIdentifier, result.config.id, {
          icon: result.config.options?.icon,
          color: result.config.options?.color,
          location: !!(keyMods?.alt && activeInstance) ? { splitActiveTerminal: true } : defaultLocation,
          titleTemplate: result.config.titleTemplate
        });
        return;
      } else if (result.config && hasKey(result.config, { profileName: true })) {
        if (keyMods?.alt && activeInstance) {
          instance2 = await this.createTerminal({ location: { parentTerminal: activeInstance }, config: result.config, cwd: cwd2 });
        } else {
          instance2 = await this.createTerminal({ location: defaultLocation, config: result.config, cwd: cwd2 });
        }
      }
      if (instance2 && defaultLocation !== 2 /* Editor */) {
        this._terminalGroupService.showPanel(true);
        this.setActiveInstance(instance2);
        return instance2;
      }
    }
    return void 0;
  }
  async _initializePrimaryBackend() {
    mark("code/terminal/willGetTerminalBackend");
    this._primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
    mark("code/terminal/didGetTerminalBackend");
    const enableTerminalReconnection = this._terminalConfigurationService.config.enablePersistentSessions;
    this._connectionState = 0 /* Connecting */;
    const isPersistentRemote = !!this._environmentService.remoteAuthority && enableTerminalReconnection;
    if (this._primaryBackend) {
      this._register(this._primaryBackend.onDidRequestDetach(async (e4) => {
        const instanceToDetach = this.getInstanceFromResource(getTerminalUri(e4.workspaceId, e4.instanceId));
        if (instanceToDetach) {
          const persistentProcessId = instanceToDetach?.persistentProcessId;
          if (persistentProcessId && !instanceToDetach.shellLaunchConfig.isFeatureTerminal && !instanceToDetach.shellLaunchConfig.customPtyImplementation) {
            if (instanceToDetach.target === 2 /* Editor */) {
              this._terminalEditorService.detachInstance(instanceToDetach);
            } else {
              this._terminalGroupService.getGroupForInstance(instanceToDetach)?.removeInstance(instanceToDetach);
            }
            await instanceToDetach.detachProcessAndDispose(3 /* User */);
            await this._primaryBackend?.acceptDetachInstanceReply(e4.requestId, persistentProcessId);
          } else {
            await this._primaryBackend?.acceptDetachInstanceReply(e4.requestId, void 0);
          }
        }
      }));
    }
    mark("code/terminal/willReconnect");
    let reconnectedPromise;
    if (isPersistentRemote) {
      reconnectedPromise = this._reconnectToRemoteTerminals();
    } else if (enableTerminalReconnection) {
      reconnectedPromise = this._reconnectToLocalTerminals();
    } else {
      reconnectedPromise = Promise.resolve();
    }
    reconnectedPromise.then(async () => {
      this._setConnected();
      mark("code/terminal/didReconnect");
      mark("code/terminal/willReplay");
      const instances = await this._reconnectedTerminalGroups?.then((groups) => groups.map((e4) => e4.terminalInstances).flat()) ?? [];
      await Promise.all(instances.map((e4) => new Promise((r2) => Event2.once(e4.onProcessReplayComplete)(r2))));
      mark("code/terminal/didReplay");
      mark("code/terminal/willGetPerformanceMarks");
      await Promise.all(Array.from(this._terminalInstanceService.getRegisteredBackends()).map(async (backend) => {
        this._timerService.setPerformanceMarks(backend.remoteAuthority === void 0 ? "localPtyHost" : "remotePtyHost", await backend.getPerformanceMarks());
        backend.setReady();
      }));
      mark("code/terminal/didGetPerformanceMarks");
      this._whenConnected.complete();
    });
  }
  getPrimaryBackend() {
    return this._primaryBackend;
  }
  async setNextCommandId(id2, commandLine, commandId) {
    if (!this._primaryBackend || id2 <= 0) {
      return;
    }
    await this._primaryBackend.setNextCommandId(id2, commandLine, commandId);
  }
  _forwardInstanceHostEvents(host) {
    this._register(host.onDidChangeInstances(this._onDidChangeInstances.fire, this._onDidChangeInstances));
    this._register(host.onDidDisposeInstance(this._onDidDisposeInstance.fire, this._onDidDisposeInstance));
    this._register(host.onDidChangeActiveInstance((instance2) => this._evaluateActiveInstance(host, instance2)));
    this._register(host.onDidFocusInstance((instance2) => {
      this._onDidFocusInstance.fire(instance2);
      this._evaluateActiveInstance(host, instance2);
    }));
    this._register(host.onDidChangeInstanceCapability((instance2) => {
      this._onDidChangeInstanceCapability.fire(instance2);
    }));
    this._hostActiveTerminals.set(host, void 0);
  }
  _evaluateActiveInstance(host, instance2) {
    this._hostActiveTerminals.set(host, instance2);
    if (instance2 === void 0) {
      for (const active of this._hostActiveTerminals.values()) {
        if (active) {
          instance2 = active;
        }
      }
    }
    this._activeInstance = instance2;
    this._onDidChangeActiveInstance.fire(instance2);
  }
  setActiveInstance(value2) {
    if (!value2) {
      return;
    }
    if (value2.shellLaunchConfig.hideFromUser) {
      this.showBackgroundTerminal(value2);
    }
    if (value2.target === 2 /* Editor */) {
      this._terminalEditorService.setActiveInstance(value2);
    } else {
      this._terminalGroupService.setActiveInstance(value2);
    }
  }
  async focusInstance(instance2) {
    if (this._activeInstance !== instance2) {
      this.setActiveInstance(instance2);
    }
    if (instance2.target === 2 /* Editor */) {
      await this._terminalEditorService.focusInstance(instance2);
      return;
    }
    await this._terminalGroupService.focusInstance(instance2);
  }
  async focusActiveInstance() {
    if (!this._activeInstance) {
      return;
    }
    return this.focusInstance(this._activeInstance);
  }
  async createContributedTerminalProfile(extensionIdentifier, id2, options3) {
    await this._extensionService.activateByEvent(`onTerminalProfile:${id2}`);
    const profileProvider = this._terminalProfileService.getContributedProfileProvider(extensionIdentifier, id2);
    if (!profileProvider) {
      this._notificationService.error(`No terminal profile provider registered for id "${id2}"`);
      return;
    }
    try {
      await profileProvider.createContributedTerminalProfile(options3);
      this._terminalGroupService.setActiveInstanceByIndex(this._terminalGroupService.instances.length - 1);
      await this._terminalGroupService.activeInstance?.focusWhenReady();
    } catch (e4) {
      this._notificationService.error(e4.message);
    }
  }
  async safeDisposeTerminal(instance2) {
    if (instance2.target !== 2 /* Editor */ && instance2.hasChildProcesses && (this._terminalConfigurationService.config.confirmOnKill === "panel" || this._terminalConfigurationService.config.confirmOnKill === "always")) {
      const veto = await this._showTerminalCloseConfirmation(true);
      if (veto) {
        return;
      }
    }
    return new Promise((r2) => {
      Event2.once(instance2.onExit)(() => r2());
      instance2.dispose(3 /* User */);
    });
  }
  _setConnected() {
    this._connectionState = 1 /* Connected */;
    this._onDidChangeConnectionState.fire();
    this._logService.trace("Pty host ready");
  }
  async _reconnectToRemoteTerminals() {
    const remoteAuthority = this._environmentService.remoteAuthority;
    if (!remoteAuthority) {
      return;
    }
    const backend = await this._terminalInstanceService.getBackend(remoteAuthority);
    if (!backend) {
      return;
    }
    mark("code/terminal/willGetTerminalLayoutInfo");
    const layoutInfo = await backend.getTerminalLayoutInfo();
    mark("code/terminal/didGetTerminalLayoutInfo");
    backend.reduceConnectionGraceTime();
    mark("code/terminal/willRecreateTerminalGroups");
    await this._recreateTerminalGroups(layoutInfo);
    mark("code/terminal/didRecreateTerminalGroups");
    this._attachProcessLayoutListeners();
    this._logService.trace("Reconnected to remote terminals");
  }
  async _reconnectToLocalTerminals() {
    const localBackend = await this._terminalInstanceService.getBackend();
    if (!localBackend) {
      return;
    }
    mark("code/terminal/willGetTerminalLayoutInfo");
    const layoutInfo = await localBackend.getTerminalLayoutInfo();
    mark("code/terminal/didGetTerminalLayoutInfo");
    if (layoutInfo && (layoutInfo.tabs.length > 0 || layoutInfo?.background?.length)) {
      mark("code/terminal/willRecreateTerminalGroups");
      this._reconnectedTerminalGroups = this._recreateTerminalGroups(layoutInfo);
      const revivedInstances = await this._reviveBackgroundTerminalInstances(layoutInfo.background || []);
      this._backgroundedTerminalInstances = revivedInstances.map((instance2) => ({ instance: instance2 }));
      mark("code/terminal/didRecreateTerminalGroups");
    }
    this._attachProcessLayoutListeners();
    this._logService.trace("Reconnected to local terminals");
  }
  _recreateTerminalGroups(layoutInfo) {
    const groupPromises = [];
    let activeGroup;
    if (layoutInfo) {
      for (const tabLayout of layoutInfo.tabs) {
        const terminalLayouts = tabLayout.terminals.filter((t2) => t2.terminal && t2.terminal.isOrphan);
        if (terminalLayouts.length) {
          this._restoredGroupCount += terminalLayouts.length;
          const promise = this._recreateTerminalGroup(tabLayout, terminalLayouts);
          groupPromises.push(promise);
          if (tabLayout.isActive) {
            activeGroup = promise;
          }
          const activeInstance = this.instances.find((t2) => t2.shellLaunchConfig.attachPersistentProcess?.id === tabLayout.activePersistentProcessId);
          if (activeInstance) {
            this.setActiveInstance(activeInstance);
          }
        }
      }
      if (layoutInfo.tabs.length) {
        activeGroup?.then((group2) => this._terminalGroupService.activeGroup = group2);
      }
    }
    return Promise.all(groupPromises).then((result) => result.filter((e4) => !!e4));
  }
  async _reviveBackgroundTerminalInstances(bgTerminals) {
    const instances = [];
    for (const bg of bgTerminals) {
      const attachPersistentProcess = bg;
      if (!attachPersistentProcess) {
        continue;
      }
      const instance2 = await this.createTerminal({ config: { attachPersistentProcess, hideFromUser: true, forcePersist: true }, location: 1 /* Panel */ });
      instances.push(instance2);
    }
    return instances;
  }
  async _recreateTerminalGroup(tabLayout, terminalLayouts) {
    let lastInstance;
    for (const terminalLayout of terminalLayouts) {
      const attachPersistentProcess = terminalLayout.terminal;
      if (this._lifecycleService.startupKind !== 3 /* ReloadedWindow */ && attachPersistentProcess.type === "Task") {
        continue;
      }
      mark(`code/terminal/willRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`);
      lastInstance = this.createTerminal({
        config: { attachPersistentProcess },
        location: lastInstance ? { parentTerminal: lastInstance } : 1 /* Panel */
      });
      lastInstance.then(() => mark(`code/terminal/didRecreateTerminal/${attachPersistentProcess.id}-${attachPersistentProcess.pid}`));
    }
    const group2 = lastInstance?.then((instance2) => {
      const g = this._terminalGroupService.getGroupForInstance(instance2);
      g?.resizePanes(tabLayout.terminals.map((terminal2) => terminal2.relativeSize));
      return g;
    });
    return group2;
  }
  _attachProcessLayoutListeners() {
    this._register(this.onDidChangeActiveGroup(() => this._saveState()));
    this._register(this.onDidChangeActiveInstance(() => this._saveState()));
    this._register(this.onDidChangeInstances(() => this._saveState()));
    this._register(this.onAnyInstanceProcessIdReady(() => this._saveState()));
    this._register(this.onAnyInstanceTitleChange((instance2) => this._updateTitle(instance2)));
    this._register(this.onAnyInstanceIconChange((e4) => this._updateIcon(e4.instance, e4.userInitiated)));
  }
  _handleInstanceContextKeys() {
    const terminalIsOpenContext = TerminalContextKeys.isOpen.bindTo(this._contextKeyService);
    const updateTerminalContextKeys = () => {
      terminalIsOpenContext.set(this.instances.length > 0);
      this._terminalCountContextKey.set(this.instances.length);
    };
    this._register(this.onDidChangeInstances(() => updateTerminalContextKeys()));
  }
  async getActiveOrCreateInstance(options3) {
    const activeInstance = this.activeInstance;
    if (!activeInstance) {
      return this.createTerminal();
    }
    if (!options3?.acceptsInput || activeInstance.xterm?.isStdinDisabled !== true) {
      return activeInstance;
    }
    const instance2 = await this.createTerminal();
    this.setActiveInstance(instance2);
    await this.revealActiveTerminal();
    return instance2;
  }
  async revealTerminal(source, preserveFocus) {
    if (source.target === 2 /* Editor */) {
      await this._terminalEditorService.revealActiveEditor(preserveFocus);
    } else {
      await this._terminalGroupService.showPanel();
    }
  }
  async revealActiveTerminal(preserveFocus) {
    const instance2 = this.activeInstance;
    if (!instance2) {
      return;
    }
    await this.revealTerminal(instance2, preserveFocus);
  }
  requestStartExtensionTerminal(proxy, cols, rows) {
    return new Promise((callback) => {
      this._onDidRequestStartExtensionTerminal.fire({ proxy, cols, rows, callback });
    });
  }
  _onBeforeShutdown(reason) {
    if (isWeb) {
      this._isShuttingDown = true;
      return false;
    }
    return this._onBeforeShutdownAsync(reason);
  }
  async _onBeforeShutdownAsync(reason) {
    if (this.instances.length === 0) {
      return false;
    }
    try {
      this._shutdownWindowCount = await this._nativeDelegate?.getWindowCount();
      const shouldReviveProcesses = this._shouldReviveProcesses(reason);
      if (shouldReviveProcesses) {
        await Promise.race([
          this._primaryBackend?.persistTerminalState(),
          timeout(2e3)
        ]);
      }
      const shouldPersistProcesses = this._terminalConfigurationService.config.enablePersistentSessions && reason === 3 /* RELOAD */;
      if (!shouldPersistProcesses) {
        const hasDirtyInstances = this._terminalConfigurationService.config.confirmOnExit === "always" && this.foregroundInstances.length > 0 || this._terminalConfigurationService.config.confirmOnExit === "hasChildProcesses" && this.foregroundInstances.some((e4) => e4.hasChildProcesses);
        if (hasDirtyInstances) {
          return this._onBeforeShutdownConfirmation(reason);
        }
      }
    } catch (err) {
      this._logService.warn("Exception occurred during terminal shutdown", err);
    }
    this._isShuttingDown = true;
    return false;
  }
  setNativeDelegate(nativeDelegate) {
    this._nativeDelegate = nativeDelegate;
  }
  _shouldReviveProcesses(reason) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions) {
      return false;
    }
    switch (this._terminalConfigurationService.config.persistentSessionReviveProcess) {
      case "onExit": {
        if (reason === 1 /* CLOSE */ && (this._shutdownWindowCount === 1 && !isMacintosh)) {
          return true;
        }
        return reason === 4 /* LOAD */ || reason === 2 /* QUIT */;
      }
      case "onExitAndWindowClose":
        return reason !== 3 /* RELOAD */;
      default:
        return false;
    }
  }
  async _onBeforeShutdownConfirmation(reason) {
    const veto = await this._showTerminalCloseConfirmation();
    if (!veto) {
      this._isShuttingDown = true;
    }
    return veto;
  }
  _onWillShutdown(e4) {
    const shouldPersistTerminals = this._terminalConfigurationService.config.enablePersistentSessions && e4.reason === 3 /* RELOAD */;
    for (const instance2 of [...this._terminalGroupService.instances, ...this._backgroundedTerminalInstances.map((bg) => bg.instance)]) {
      if (shouldPersistTerminals && instance2.shouldPersist) {
        instance2.detachProcessAndDispose(1 /* Shutdown */);
      } else {
        instance2.dispose(1 /* Shutdown */);
      }
    }
    if (!shouldPersistTerminals && !this._shouldReviveProcesses(e4.reason)) {
      this._primaryBackend?.setTerminalLayoutInfo(void 0);
    }
  }
  _saveState() {
    if (this._isShuttingDown) {
      return;
    }
    if (!this._terminalConfigurationService.config.enablePersistentSessions) {
      return;
    }
    const tabs = this._terminalGroupService.groups.map((g) => g.getLayoutInfo(g === this._terminalGroupService.activeGroup));
    const state = { tabs, background: this._backgroundedTerminalInstances.map((bg) => bg.instance).filter((i2) => i2.shellLaunchConfig.forcePersist).map((i2) => i2.persistentProcessId).filter((e4) => e4 !== void 0) };
    this._primaryBackend?.setTerminalLayoutInfo(state);
  }
  _updateTitle(instance2) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions || !instance2 || instance2.shellLaunchConfig.customPtyImplementation || !instance2.persistentProcessId || !instance2.title || instance2.isDisposed) {
      return;
    }
    if (instance2.staticTitle) {
      this._primaryBackend?.updateTitle(instance2.persistentProcessId, instance2.staticTitle, 0 /* Api */);
    } else {
      this._primaryBackend?.updateTitle(instance2.persistentProcessId, instance2.title, instance2.titleSource);
    }
  }
  _updateIcon(instance2, userInitiated) {
    if (!this._terminalConfigurationService.config.enablePersistentSessions || !instance2 || instance2.shellLaunchConfig.customPtyImplementation || !instance2.persistentProcessId || !instance2.icon || instance2.isDisposed) {
      return;
    }
    this._primaryBackend?.updateIcon(instance2.persistentProcessId, userInitiated, instance2.icon, instance2.color);
  }
  refreshActiveGroup() {
    this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
  }
  getInstanceFromId(terminalId) {
    let bgIndex = -1;
    this._backgroundedTerminalInstances.forEach((bg, i2) => {
      if (bg.instance.instanceId === terminalId) {
        bgIndex = i2;
      }
    });
    if (bgIndex !== -1) {
      return this._backgroundedTerminalInstances[bgIndex].instance;
    }
    try {
      return this.instances[this._getIndexFromId(terminalId)];
    } catch {
      return void 0;
    }
  }
  getInstanceFromResource(resource) {
    return getInstanceFromResource(this.instances, resource);
  }
  openResource(resource) {
    const instance2 = this.getInstanceFromResource(resource);
    if (instance2) {
      this.setActiveInstance(instance2);
      this.revealTerminal(instance2);
      const commands = instance2.capabilities.get(2 /* CommandDetection */)?.commands;
      const params = new URLSearchParams(resource.query);
      const relevantCommand = commands?.find((c) => c.id === params.get("command"));
      if (relevantCommand) {
        instance2.xterm?.markTracker.revealCommand(relevantCommand);
      }
    }
  }
  isAttachedToTerminal(remoteTerm) {
    return this.instances.some((term) => term.processId === remoteTerm.pid);
  }
  moveToEditor(source, group2) {
    if (source.target === 2 /* Editor */) {
      return;
    }
    const sourceGroup = this._terminalGroupService.getGroupForInstance(source);
    if (!sourceGroup) {
      return;
    }
    sourceGroup.removeInstance(source);
    this._terminalEditorService.openEditor(source, group2 ? { viewColumn: group2 } : void 0);
  }
  moveIntoNewEditor(source) {
    this.moveToEditor(source, AUX_WINDOW_GROUP);
  }
  async moveToTerminalView(source, target, side) {
    if (URI.isUri(source)) {
      source = this.getInstanceFromResource(source);
    }
    if (!source) {
      return;
    }
    this._terminalEditorService.detachInstance(source);
    if (source.target !== 2 /* Editor */) {
      await this._terminalGroupService.showPanel(true);
      return;
    }
    source.target = 1 /* Panel */;
    let group2;
    if (target) {
      group2 = this._terminalGroupService.getGroupForInstance(target);
    }
    if (!group2) {
      group2 = this._terminalGroupService.createGroup();
    }
    group2.addInstance(source);
    this.setActiveInstance(source);
    await this._terminalGroupService.showPanel(true);
    if (target && side) {
      const index2 = group2.terminalInstances.indexOf(target) + (side === "after" ? 1 : 0);
      group2.moveInstance(source, index2, side);
    }
    this._onDidChangeInstances.fire();
    this._onDidChangeActiveGroup.fire(this._terminalGroupService.activeGroup);
  }
  _initInstanceListeners(instance2) {
    const instanceDisposables = new DisposableStore();
    instanceDisposables.add(instance2.onDimensionsChanged(() => {
      this._onDidChangeInstanceDimensions.fire(instance2);
      if (this._terminalConfigurationService.config.enablePersistentSessions && this.isProcessSupportRegistered) {
        this._saveState();
      }
    }));
    instanceDisposables.add(instance2.onDidFocus(this._onDidChangeActiveInstance.fire, this._onDidChangeActiveInstance));
    instanceDisposables.add(instance2.onRequestAddInstanceToGroup(async (e4) => await this._addInstanceToGroup(instance2, e4)));
    instanceDisposables.add(instance2.onDidChangeShellType(() => this._extensionService.activateByEvent(`onTerminal:${instance2.shellType}`)));
    instanceDisposables.add(Event2.runAndSubscribe(instance2.capabilities.onDidAddCapability, (() => {
      if (instance2.capabilities.has(2 /* CommandDetection */)) {
        this._extensionService.activateByEvent(`onTerminalShellIntegration:${instance2.shellType}`);
      }
    })));
    const disposeListener = this._register(instance2.onDisposed(() => {
      instanceDisposables.dispose();
      this._store.delete(disposeListener);
    }));
  }
  async _addInstanceToGroup(instance2, e4) {
    const terminalIdentifier = parseTerminalUri(e4.uri);
    if (terminalIdentifier.instanceId === void 0) {
      return;
    }
    let sourceInstance = this.getInstanceFromResource(e4.uri);
    if (!sourceInstance) {
      const attachPersistentProcess = await this._primaryBackend?.requestDetachInstance(terminalIdentifier.workspaceId, terminalIdentifier.instanceId);
      if (attachPersistentProcess) {
        sourceInstance = await this.createTerminal({ config: { attachPersistentProcess }, resource: e4.uri });
        this._terminalGroupService.moveInstance(sourceInstance, instance2, e4.side);
        return;
      }
    }
    sourceInstance = this._terminalGroupService.getInstanceFromResource(e4.uri);
    if (sourceInstance) {
      this._terminalGroupService.moveInstance(sourceInstance, instance2, e4.side);
      return;
    }
    sourceInstance = this._terminalEditorService.getInstanceFromResource(e4.uri);
    if (sourceInstance) {
      this.moveToTerminalView(sourceInstance, instance2, e4.side);
      return;
    }
    return;
  }
  registerProcessSupport(isSupported) {
    if (!isSupported) {
      return;
    }
    this._processSupportContextKey.set(isSupported);
    this._onDidRegisterProcessSupport.fire();
  }
  // TODO: Remove this, it should live in group/editor servioce
  _getIndexFromId(terminalId) {
    let terminalIndex = -1;
    this.instances.forEach((terminalInstance, i2) => {
      if (terminalInstance.instanceId === terminalId) {
        terminalIndex = i2;
      }
    });
    if (terminalIndex === -1) {
      throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
    }
    return terminalIndex;
  }
  async _showTerminalCloseConfirmation(singleTerminal) {
    let message;
    const foregroundInstances = this.foregroundInstances;
    if (foregroundInstances.length === 1 || singleTerminal) {
      message = localize(20074, null);
    } else {
      message = localize(20073, null, foregroundInstances.length);
    }
    const { confirmed } = await this._dialogService.confirm({
      type: "warning",
      message,
      primaryButton: localize(20075, null)
    });
    return !confirmed;
  }
  getDefaultInstanceHost() {
    if (this._terminalConfigurationService.defaultLocation === 2 /* Editor */) {
      return this._terminalEditorService;
    }
    return this._terminalGroupService;
  }
  async getInstanceHost(location2) {
    if (location2) {
      if (location2 === 2 /* Editor */) {
        return this._terminalEditorService;
      } else if (typeof location2 === "object") {
        if (hasKey(location2, { viewColumn: true })) {
          return this._terminalEditorService;
        } else if (hasKey(location2, { parentTerminal: true })) {
          return (await location2.parentTerminal).target === 2 /* Editor */ ? this._terminalEditorService : this._terminalGroupService;
        }
      } else {
        return this._terminalGroupService;
      }
    }
    return this;
  }
  async createTerminal(options3) {
    const isLocalInRemoteTerminal = this._remoteAgentService.getConnection() && URI.isUri(options3?.cwd) && options3?.cwd.scheme === Schemas.file;
    if (this._terminalProfileService.availableProfiles.length === 0) {
      const isPtyTerminal = options3?.config && hasKey(options3.config, { customPtyImplementation: true });
      if (!isPtyTerminal && !isLocalInRemoteTerminal) {
        if (this._connectionState === 0 /* Connecting */) {
          mark(`code/terminal/willGetProfiles`);
        }
        await this._terminalProfileService.profilesReady;
        if (this._connectionState === 0 /* Connecting */) {
          mark(`code/terminal/didGetProfiles`);
        }
      }
    }
    let config = options3?.config;
    if (!config && isLocalInRemoteTerminal) {
      const backend = await this._terminalInstanceService.getBackend(void 0);
      const executable = await backend?.getDefaultSystemShell();
      if (executable) {
        config = { executable };
      }
    }
    if (!config) {
      config = this._terminalProfileService.getDefaultProfile();
    }
    const shellLaunchConfig = config && hasKey(config, { extensionIdentifier: true }) ? {} : this._terminalInstanceService.convertProfileToShellLaunchConfig(config || {});
    const contributedProfile = options3?.skipContributedProfileCheck ? void 0 : await this._getContributedProfile(shellLaunchConfig, options3);
    const splitActiveTerminal = typeof options3?.location === "object" && hasKey(options3.location, { splitActiveTerminal: true }) ? options3.location.splitActiveTerminal : typeof options3?.location === "object" ? hasKey(options3.location, { parentTerminal: true }) : false;
    await this._resolveCwd(shellLaunchConfig, splitActiveTerminal, options3);
    if (!shellLaunchConfig.customPtyImplementation && contributedProfile) {
      const resolvedLocation = await this.resolveLocation(options3?.location);
      let location3;
      if (splitActiveTerminal) {
        location3 = resolvedLocation === 2 /* Editor */ ? { viewColumn: SIDE_GROUP } : { splitActiveTerminal: true };
      } else {
        location3 = typeof options3?.location === "object" && hasKey(options3.location, { viewColumn: true }) ? options3.location : resolvedLocation;
      }
      await this.createContributedTerminalProfile(contributedProfile.extensionIdentifier, contributedProfile.id, {
        icon: contributedProfile.icon,
        color: contributedProfile.color,
        location: location3,
        cwd: shellLaunchConfig.cwd,
        titleTemplate: contributedProfile.titleTemplate
      });
      const instanceHost = resolvedLocation === 2 /* Editor */ ? this._terminalEditorService : this._terminalGroupService;
      const instance3 = instanceHost.instances[instanceHost.instances.length - 1];
      await instance3?.focusWhenReady();
      this._terminalHasBeenCreated.set(true);
      return instance3;
    }
    if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
      const resolvedLocation = await this.resolveLocation(options3?.location);
      let location3;
      if (splitActiveTerminal) {
        location3 = resolvedLocation === 2 /* Editor */ ? { viewColumn: SIDE_GROUP } : { splitActiveTerminal: true };
      } else {
        location3 = typeof options3?.location === "object" && hasKey(options3.location, { viewColumn: true }) ? options3.location : resolvedLocation;
      }
      const instanceHost = resolvedLocation === 2 /* Editor */ ? this._terminalEditorService : this._terminalGroupService;
      for (const fallbackProfile of this._terminalProfileService.contributedProfiles) {
        const instanceCount = instanceHost.instances.length;
        await this.createContributedTerminalProfile(fallbackProfile.extensionIdentifier, fallbackProfile.id, {
          icon: fallbackProfile.icon,
          color: fallbackProfile.color,
          location: location3,
          cwd: shellLaunchConfig.cwd,
          titleTemplate: fallbackProfile.titleTemplate
        });
        const instance3 = instanceHost.instances[instanceCount];
        if (!instance3) {
          continue;
        }
        await instance3.focusWhenReady();
        this._terminalHasBeenCreated.set(true);
        return instance3;
      }
      throw new Error("Could not create terminal when process support is not registered");
    }
    this._evaluateLocalCwd(shellLaunchConfig);
    const location2 = await this.resolveLocation(options3?.location) || this._terminalConfigurationService.defaultLocation;
    if (shellLaunchConfig.hideFromUser) {
      const instance3 = this._terminalInstanceService.createInstance(shellLaunchConfig, location2);
      this._backgroundedTerminalInstances.push({ instance: instance3, terminalLocationOptions: options3?.location });
      this._backgroundedTerminalDisposables.set(instance3.instanceId, instance3.onDisposed((instance4) => this._onBackgroundTerminalDisposed(instance4)));
      this._onDidChangeInstances.fire();
      return instance3;
    }
    const parent = await this._getSplitParent(options3?.location);
    this._terminalHasBeenCreated.set(true);
    this._extensionService.activateByEvent("onTerminal:*");
    let instance2;
    if (parent) {
      instance2 = await this._splitTerminal(shellLaunchConfig, location2, parent);
    } else {
      instance2 = this._createTerminal(shellLaunchConfig, location2, options3);
    }
    if (instance2.shellType) {
      this._extensionService.activateByEvent(`onTerminal:${instance2.shellType}`);
    }
    return instance2;
  }
  async createAndFocusTerminal(options3) {
    const instance2 = await this.createTerminal(options3);
    this.setActiveInstance(instance2);
    await instance2.focusWhenReady();
    return instance2;
  }
  async _getContributedProfile(shellLaunchConfig, options3) {
    if (options3?.config && hasKey(options3.config, { extensionIdentifier: true })) {
      return options3.config;
    }
    return this._terminalProfileService.getContributedDefaultProfile(shellLaunchConfig);
  }
  async createDetachedTerminal(options3) {
    const ctor = await TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
    const capabilities = options3.capabilities ?? new TerminalCapabilityStore();
    const xterm = this._instantiationService.createInstance(XtermTerminal, void 0, ctor, {
      cols: options3.cols,
      rows: options3.rows,
      xtermColorProvider: options3.colorProvider,
      capabilities,
      disableOverviewRuler: options3.disableOverviewRuler,
      detached: true
    }, void 0);
    if (options3.readonly) {
      xterm.raw.attachCustomKeyEventHandler(() => false);
    }
    const instance2 = new DetachedTerminal(xterm, { ...options3, capabilities }, this._instantiationService);
    this._detachedXterms.add(instance2);
    this._ensureDetachedTerminalListeners();
    const l = xterm.onDidDispose(() => {
      this._detachedXterms.delete(instance2);
      l.dispose();
    });
    return instance2;
  }
  /**
   * Registers a single set of global service listeners (theme/config/log-level
   * changes) that forward updates to all detached xterm instances. This avoids
   * each detached terminal registering its own listener on global singletons.
   */
  _ensureDetachedTerminalListeners() {
    if (this._detachedListenersRegistered) {
      return;
    }
    this._detachedListenersRegistered = true;
    this._register(this._themeService.onDidColorThemeChange(() => {
      for (const instance2 of this._detachedXterms) {
        instance2.xterm.updateTheme();
      }
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      const shouldUpdateConfig = e4.affectsConfiguration("terminal.integrated") || e4.affectsConfiguration("editor.fastScrollSensitivity") || e4.affectsConfiguration("editor.mouseWheelScrollSensitivity") || e4.affectsConfiguration("editor.multiCursorModifier");
      const shouldUpdateTheme = e4.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled" /* ShellIntegrationDecorationsEnabled */);
      if (shouldUpdateConfig || shouldUpdateTheme) {
        for (const instance2 of this._detachedXterms) {
          if (shouldUpdateConfig) {
            instance2.xterm.updateConfig();
          }
          if (shouldUpdateTheme) {
            instance2.xterm.updateTheme();
          }
        }
      }
    }));
    this._register(this._logService.onDidChangeLogLevel(() => {
      for (const instance2 of this._detachedXterms) {
        instance2.xterm.updateLogLevel();
      }
    }));
  }
  async _resolveCwd(shellLaunchConfig, splitActiveTerminal, options3) {
    const cwd2 = shellLaunchConfig.cwd;
    if (!cwd2) {
      if (options3?.cwd) {
        shellLaunchConfig.cwd = options3.cwd;
      } else if (splitActiveTerminal && options3?.location) {
        let parent = this.activeInstance;
        if (typeof options3.location === "object" && hasKey(options3.location, { parentTerminal: true })) {
          parent = await options3.location.parentTerminal;
        }
        if (!parent) {
          throw new Error("Cannot split without an active instance");
        }
        shellLaunchConfig.cwd = await getCwdForSplit(parent, this._workspaceContextService.getWorkspace().folders, this._commandService, this._terminalConfigurationService);
      }
    }
  }
  async _splitTerminal(shellLaunchConfig, location2, parent) {
    let instance2;
    if (typeof shellLaunchConfig.cwd !== "object" && typeof parent.shellLaunchConfig.cwd === "object") {
      let path = shellLaunchConfig.cwd || parent.shellLaunchConfig.cwd.path;
      if (parent.shellLaunchConfig.cwd.authority && path && path[0] !== "/") {
        path = "/" + path;
      }
      shellLaunchConfig.cwd = URI.from({
        scheme: parent.shellLaunchConfig.cwd.scheme,
        authority: parent.shellLaunchConfig.cwd.authority,
        path
      });
    }
    if (location2 === 2 /* Editor */ || parent.target === 2 /* Editor */) {
      instance2 = await this._terminalEditorService.splitInstance(parent, shellLaunchConfig);
    } else {
      const group2 = this._terminalGroupService.getGroupForInstance(parent);
      if (!group2) {
        throw new Error(`Cannot split a terminal without a group (instanceId: ${parent.instanceId}, title: ${parent.title})`);
      }
      shellLaunchConfig.parentTerminalId = parent.instanceId;
      instance2 = group2.split(shellLaunchConfig);
    }
    return instance2;
  }
  _createTerminal(shellLaunchConfig, location2, options3) {
    let instance2;
    if (location2 === 2 /* Editor */) {
      instance2 = this._terminalInstanceService.createInstance(shellLaunchConfig, 2 /* Editor */);
      if (!shellLaunchConfig.hideFromUser) {
        const editorOptions = this._getEditorOptions(options3?.location);
        this._terminalEditorService.openEditor(instance2, editorOptions);
      }
    } else {
      const group2 = this._terminalGroupService.createGroup(shellLaunchConfig);
      instance2 = group2.terminalInstances[0];
    }
    return instance2;
  }
  async resolveLocation(location2) {
    if (location2 && typeof location2 === "object") {
      if (hasKey(location2, { parentTerminal: true })) {
        const parentTerminal = await location2.parentTerminal;
        return !parentTerminal.target ? 1 /* Panel */ : parentTerminal.target;
      } else if (hasKey(location2, { viewColumn: true })) {
        return 2 /* Editor */;
      } else if (hasKey(location2, { splitActiveTerminal: true })) {
        return !this._activeInstance?.target ? 1 /* Panel */ : this._activeInstance?.target;
      }
    }
    return location2;
  }
  async _getSplitParent(location2) {
    if (location2 && typeof location2 === "object" && hasKey(location2, { parentTerminal: true })) {
      return location2.parentTerminal;
    } else if (location2 && typeof location2 === "object" && hasKey(location2, { splitActiveTerminal: true })) {
      return this.activeInstance;
    }
    return void 0;
  }
  _getEditorOptions(location2) {
    if (location2 && typeof location2 === "object" && hasKey(location2, { viewColumn: true })) {
      if (location2.viewColumn === ACTIVE_GROUP && isAuxiliaryWindow(getActiveWindow())) {
        location2.viewColumn = this._editorGroupsService.activeGroup.id;
        return location2;
      }
      location2.viewColumn = columnToEditorGroup(this._editorGroupsService, this._configurationService, location2.viewColumn);
      return location2;
    }
    return void 0;
  }
  _evaluateLocalCwd(shellLaunchConfig) {
    if (this._environmentService.isSessionsWindow) {
      return;
    }
    if (!isString(shellLaunchConfig.cwd) && shellLaunchConfig.cwd?.scheme === Schemas.file) {
      if (VirtualWorkspaceContext.getValue(this._contextKeyService)) {
        shellLaunchConfig.initialText = formatMessageForTerminal(localize(20072, null, "\x1B[3m", "\x1B[23m"), { excludeLeadingNewLine: true, loudFormatting: true });
        shellLaunchConfig.type = "Local";
      } else if (this._remoteAgentService.getConnection()) {
        shellLaunchConfig.initialText = formatMessageForTerminal(localize(20071, null, "\x1B[3m", "\x1B[23m"), { excludeLeadingNewLine: true, loudFormatting: true });
        shellLaunchConfig.type = "Local";
      }
    }
  }
  moveToBackground(instance2) {
    if (this._backgroundedTerminalInstances.some((bg) => bg.instance === instance2)) {
      return;
    }
    if (instance2.target === 2 /* Editor */) {
      this._terminalEditorService.detachInstance(instance2);
    } else {
      const group2 = this._terminalGroupService.getGroupForInstance(instance2);
      if (!group2) {
        return;
      }
      group2.removeInstance(instance2);
    }
    instance2.detachFromElement();
    this._backgroundedTerminalInstances.push({ instance: instance2, terminalLocationOptions: instance2.target === 2 /* Editor */ ? { viewColumn: ACTIVE_GROUP } : void 0 });
    this._backgroundedTerminalDisposables.set(instance2.instanceId, instance2.onDisposed((instance3) => this._onBackgroundTerminalDisposed(instance3)));
    this._onDidChangeInstances.fire();
  }
  _onBackgroundTerminalDisposed(instance2) {
    const index2 = this._backgroundedTerminalInstances.findIndex((backgrounded) => backgrounded.instance === instance2);
    if (index2 !== -1) {
      this._backgroundedTerminalInstances.splice(index2, 1);
    }
    this._backgroundedTerminalDisposables.deleteAndDispose(instance2.instanceId);
    this._onDidDisposeInstance.fire(instance2);
  }
  async showBackgroundTerminal(instance2, suppressSetActive) {
    const index2 = this._backgroundedTerminalInstances.findIndex((bg) => bg.instance === instance2);
    if (index2 === -1) {
      return;
    }
    const backgroundTerminal = this._backgroundedTerminalInstances[index2];
    this._backgroundedTerminalInstances.splice(index2, 1);
    this._backgroundedTerminalDisposables.deleteAndDispose(instance2.instanceId);
    if (instance2.target === 1 /* Panel */) {
      this._terminalGroupService.createGroup(instance2);
      if (this.instances.length === 1 && !suppressSetActive) {
        this._terminalGroupService.setActiveInstanceByIndex(0);
      }
    } else {
      const editorOptions = backgroundTerminal.terminalLocationOptions ? this._getEditorOptions(backgroundTerminal.terminalLocationOptions) : this._getEditorOptions(instance2.target);
      this._terminalEditorService.openEditor(instance2, editorOptions);
    }
    this._onDidChangeInstances.fire();
  }
  async setContainers(panelContainer, terminalContainer) {
    this._terminalConfigurationService.setPanelContainer(panelContainer);
    this._terminalGroupService.setContainer(terminalContainer);
  }
  createOnInstanceEvent(getEvent) {
    return new DynamicListEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, getEvent);
  }
  createOnInstanceCapabilityEvent(capabilityId, getEvent) {
    return createInstanceCapabilityEventMultiplexer(this.instances, this.onDidCreateInstance, this.onDidDisposeInstance, capabilityId, getEvent);
  }
};

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceData", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceDataInput", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceIconChange", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceMaximumDimensionsChange", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstancePrimaryStatusChange", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceProcessIdReady", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceSelectionChange", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceTitleChange", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceShellTypeChanged", 1);

__decorateClass([
  memoize
], TerminalService.prototype, "onAnyInstanceAddedCapabilityType", 1);

__decorateClass([
  debounce(500)
], TerminalService.prototype, "_saveState", 1);

__decorateClass([
  debounce(500)
], TerminalService.prototype, "_updateTitle", 1);

__decorateClass([
  debounce(500)
], TerminalService.prototype, "_updateIcon", 1);

TerminalService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILifecycleService),
  __decorateParam(2, ITerminalLogService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IRemoteAgentService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IWorkbenchEnvironmentService),
  __decorateParam(8, ITerminalConfigurationService),
  __decorateParam(9, ITerminalEditorService),
  __decorateParam(10, ITerminalGroupService),
  __decorateParam(11, ITerminalInstanceService),
  __decorateParam(12, IEditorGroupsService),
  __decorateParam(13, ITerminalProfileService),
  __decorateParam(14, IExtensionService),
  __decorateParam(15, INotificationService),
  __decorateParam(16, IWorkspaceContextService),
  __decorateParam(17, ICommandService),
  __decorateParam(18, IKeybindingService),
  __decorateParam(19, ITimerService),
  __decorateParam(20, IThemeService)
], TerminalService);

var TerminalEditorStyle = class extends Themable {
  constructor(container2, _terminalService, _themeService, _terminalProfileService, _editorService) {
    super(_themeService);
    this._terminalService = _terminalService;
    this._themeService = _themeService;
    this._terminalProfileService = _terminalProfileService;
    this._editorService = _editorService;
    this._registerListeners();
    this._styleElement = createStyleSheet(container2);
    this._register(toDisposable(() => this._styleElement.remove()));
    this.updateStyles();
  }
  _registerListeners() {
    this._register(this._terminalService.onAnyInstanceIconChange(() => this.updateStyles()));
    this._register(this._terminalService.onDidCreateInstance(() => this.updateStyles()));
    this._register(this._editorService.onDidActiveEditorChange(() => {
      if (this._editorService.activeEditor instanceof TerminalEditorInput) {
        this.updateStyles();
      }
    }));
    this._register(this._editorService.onDidCloseEditor(() => {
      if (this._editorService.activeEditor instanceof TerminalEditorInput) {
        this.updateStyles();
      }
    }));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this.updateStyles()));
  }
  updateStyles() {
    super.updateStyles();
    const colorTheme = this._themeService.getColorTheme();
    let css = "";
    const productIconTheme = this._themeService.getProductIconTheme();
    for (const instance2 of this._terminalService.instances) {
      const icon2 = instance2.icon;
      if (!icon2) {
        continue;
      }
      let uri4 = void 0;
      if (icon2 instanceof URI) {
        uri4 = icon2;
      } else if (icon2 instanceof Object && hasKey(icon2, { light: true, dark: true })) {
        uri4 = isDark(colorTheme.type) ? icon2.dark : icon2.light;
      }
      const iconClasses = getUriClasses(instance2, colorTheme.type);
      if (uri4 instanceof URI && iconClasses && iconClasses.length > 1) {
        css += inline`.monaco-workbench .terminal-tab.${className(iconClasses[0])}::before
					{content: ''; background-image: ${asCSSUrl(uri4)};}`;
      }
      if (ThemeIcon.isThemeIcon(icon2)) {
        const iconRegistry4 = getIconRegistry();
        const iconContribution = iconRegistry4.getIcon(icon2.id);
        if (iconContribution) {
          const def2 = productIconTheme.getIcon(iconContribution);
          if (def2) {
            css += inline`.monaco-workbench .terminal-tab.codicon-${className(icon2.id)}::before
							{content: ${stringValue(def2.fontCharacter)} !important; font-family: ${stringValue(def2.font?.id ?? "codicon")} !important;}`;
          }
        }
      }
    }
    const iconForegroundColor = colorTheme.getColor(iconForeground);
    if (iconForegroundColor) {
      css += inline`.monaco-workbench .show-file-icons .file-icon.terminal-tab::before { color: ${iconForegroundColor}; }`;
    }
    css += getColorStyleContent(colorTheme, true);
    this._styleElement.textContent = css;
  }
};

TerminalEditorStyle = __decorateClass([
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ITerminalProfileService),
  __decorateParam(4, IEditorService)
], TerminalEditorStyle);
export { TerminalService, TerminalEditorStyle };
