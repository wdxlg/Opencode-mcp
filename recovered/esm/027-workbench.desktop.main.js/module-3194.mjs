// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugService.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { AdapterManager } from "./module-3187.mjs";
import { ConfigurationManager } from "./module-3188.mjs";
import { DebugStorage } from "./module-3180.mjs";
import { Breakpoint2, DataBreakpoint2, DebugModel, FunctionBreakpoint2, InstructionBreakpoint } from "./module-1064.mjs";
import { DebugTelemetry } from "./module-3181.mjs";
import { ViewModel3 } from "./module-3182.mjs";
import { DebugTaskRunner } from "./module-3193.mjs";
import { CALLSTACK_VIEW_ID, CONTEXT_BREAKPOINTS_EXIST, CONTEXT_DEBUG_STATE, CONTEXT_DEBUG_TYPE, CONTEXT_DEBUG_UX, CONTEXT_DISASSEMBLY_VIEW_FOCUS, CONTEXT_HAS_DEBUGGED, CONTEXT_IN_DEBUG_MODE, DEBUG_MEMORY_SCHEME, DEBUG_SCHEME, REPL_VIEW_ID, VIEWLET_ID3, debuggerDisabledMessage, getStateLabel } from "./module-1057.mjs";
import { IActivityService, NumberBadge } from "./module-1449.mjs";
import { localize } from "./module-0001.mjs";
import { DisassemblyViewInput } from "./module-1062.mjs";
import { DebugMemoryFileSystemProvider } from "./module-3189.mjs";
import { getExtensionHostDebugSession, saveAllBeforeDebugStart } from "./module-1059.mjs";
import { DebugCompoundRoot } from "./module-3179.mjs";
import { deepClone, equals4 } from "./module-0098.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { generateUuid } from "./module-0190.mjs";
import { toAction } from "./module-0082.mjs";
import { DebugSession } from "./module-3191.mjs";
import { canceledName, isCancellationError } from "./module-0004.mjs";
import { isErrorWithActions } from "./module-0094.mjs";
import { RunOnceScheduler, raceTimeout } from "./module-0036.mjs";
import { Source } from "./module-1061.mjs";
import { VIEWLET_ID5 } from "./module-1542.mjs";
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL } from "./module-2406.mjs";
import { severity_default } from "./module-0266.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { alert, status } from "./module-0076.mjs";
import { URI } from "./module-0032.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IFileService } from "./module-0269.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionHostDebugService } from "./module-2402.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ITestService } from "./module-1435.mjs";


// src/vs/workbench/contrib/debug/browser/debugService.ts
var DebugService = class {
  constructor(editorService, paneCompositeService, viewsService, viewDescriptorService, notificationService, dialogService, layoutService, contextService, contextKeyService, lifecycleService, instantiationService, extensionService, fileService, configurationService, extensionHostDebugService, activityService, commandService, quickInputService, workspaceTrustRequestService, uriIdentityService, testService) {
    this.editorService = editorService;
    this.paneCompositeService = paneCompositeService;
    this.viewsService = viewsService;
    this.viewDescriptorService = viewDescriptorService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.layoutService = layoutService;
    this.contextService = contextService;
    this.contextKeyService = contextKeyService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.extensionHostDebugService = extensionHostDebugService;
    this.activityService = activityService;
    this.commandService = commandService;
    this.quickInputService = quickInputService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.uriIdentityService = uriIdentityService;
    this.testService = testService;
    this.restartingSessions = /* @__PURE__ */ new Set();
    this.disposables = new DisposableStore();
    this.initializing = false;
    this.sessionCancellationTokens = /* @__PURE__ */ new Map();
    this.haveDoneLazySetup = false;
    this.breakpointsToSendOnResourceSaved = /* @__PURE__ */ new Set();
    this._onDidChangeState = this.disposables.add(new Emitter());
    this._onDidNewSession = this.disposables.add(new Emitter());
    this._onWillNewSession = this.disposables.add(new Emitter());
    this._onDidEndSession = this.disposables.add(new Emitter());
    this.adapterManager = this.instantiationService.createInstance(AdapterManager, {
      onDidNewSession: this.onDidNewSession,
      configurationManager: () => this.configurationManager
    });
    this.disposables.add(this.adapterManager);
    this.configurationManager = this.instantiationService.createInstance(ConfigurationManager, this.adapterManager);
    this.disposables.add(this.configurationManager);
    this.debugStorage = this.disposables.add(this.instantiationService.createInstance(DebugStorage));
    this.chosenEnvironments = this.debugStorage.loadChosenEnvironments();
    this.model = this.instantiationService.createInstance(DebugModel, this.debugStorage);
    this.telemetry = this.instantiationService.createInstance(DebugTelemetry, this.model);
    this.viewModel = this.disposables.add(new ViewModel3(contextKeyService));
    this.taskRunner = this.instantiationService.createInstance(DebugTaskRunner);
    this.disposables.add(this.fileService.onDidFilesChange((e) => this.onFileChanges(e)));
    this.disposables.add(this.lifecycleService.onWillShutdown(this.dispose, this));
    this.disposables.add(this.extensionHostDebugService.onAttachSession((event) => {
      const session = this.model.getSession(event.sessionId, true);
      if (session) {
        session.configuration.request = "attach";
        session.configuration.port = event.port;
        session.setSubId(event.subId);
        this.launchOrAttachToSession(session);
      }
    }));
    this.disposables.add(this.extensionHostDebugService.onTerminateSession((event) => {
      const session = this.model.getSession(event.sessionId);
      if (session && session.subId === event.subId) {
        session.disconnect();
      }
    }));
    this.disposables.add(this.viewModel.onDidFocusStackFrame(() => {
      this.onStateChange();
    }));
    this.disposables.add(this.viewModel.onDidFocusSession((session) => {
      this.onStateChange();
      if (session) {
        this.setExceptionBreakpointFallbackSession(session.getId());
      }
    }));
    this.disposables.add(Event2.any(this.adapterManager.onDidRegisterDebugger, this.configurationManager.onDidSelectConfiguration)(() => {
      const debugUxValue = this.state !== 0 /* Inactive */ || this.configurationManager.getAllConfigurations().length > 0 && this.adapterManager.hasEnabledDebuggers() ? "default" : "simple";
      this.debugUx.set(debugUxValue);
      this.debugStorage.storeDebugUxState(debugUxValue);
    }));
    this.disposables.add(this.model.onDidChangeCallStack(() => {
      const numberOfSessions = this.model.getSessions().filter((s) => !s.parentSession).length;
      this.activity?.dispose();
      if (numberOfSessions > 0) {
        const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(CALLSTACK_VIEW_ID);
        if (viewContainer5) {
          this.activity = this.activityService.showViewContainerActivity(viewContainer5.id, { badge: new NumberBadge(numberOfSessions, (n2) => n2 === 1 ? localize(14536, null) : localize(14553, null, n2)) });
        }
      }
    }));
    this.disposables.add(editorService.onDidActiveEditorChange(() => {
      this.contextKeyService.bufferChangeEvents(() => {
        if (editorService.activeEditor === DisassemblyViewInput.instance) {
          this.disassemblyViewFocus.set(true);
        } else {
          this.disassemblyViewFocus?.reset();
        }
      });
    }));
    this.disposables.add(this.lifecycleService.onBeforeShutdown(() => {
      for (const editor of editorService.editors) {
        if (editor.resource?.scheme === DEBUG_MEMORY_SCHEME) {
          editor.dispose();
        }
      }
    }));
    this.disposables.add(extensionService.onWillStop((evt) => {
      evt.veto(
        this.model.getSessions().length > 0,
        localize(14537, null)
      );
    }));
    this.initContextKeys(contextKeyService);
  }
  initContextKeys(contextKeyService) {
    queueMicrotask(() => {
      contextKeyService.bufferChangeEvents(() => {
        this.debugType = CONTEXT_DEBUG_TYPE.bindTo(contextKeyService);
        this.debugState = CONTEXT_DEBUG_STATE.bindTo(contextKeyService);
        this.hasDebugged = CONTEXT_HAS_DEBUGGED.bindTo(contextKeyService);
        this.inDebugMode = CONTEXT_IN_DEBUG_MODE.bindTo(contextKeyService);
        this.debugUx = CONTEXT_DEBUG_UX.bindTo(contextKeyService);
        this.debugUx.set(this.debugStorage.loadDebugUxState());
        this.breakpointsExist = CONTEXT_BREAKPOINTS_EXIST.bindTo(contextKeyService);
        this.disassemblyViewFocus = CONTEXT_DISASSEMBLY_VIEW_FOCUS.bindTo(contextKeyService);
      });
      const setBreakpointsExistContext = () => this.breakpointsExist.set(!!(this.model.getBreakpoints().length || this.model.getDataBreakpoints().length || this.model.getFunctionBreakpoints().length));
      setBreakpointsExistContext();
      this.disposables.add(this.model.onDidChangeBreakpoints(() => setBreakpointsExistContext()));
    });
  }
  getModel() {
    return this.model;
  }
  getViewModel() {
    return this.viewModel;
  }
  getConfigurationManager() {
    return this.configurationManager;
  }
  getAdapterManager() {
    return this.adapterManager;
  }
  sourceIsNotAvailable(uri5) {
    this.model.sourceIsNotAvailable(uri5);
  }
  dispose() {
    this.disposables.dispose();
  }
  //---- state management
  get state() {
    const focusedSession = this.viewModel.focusedSession;
    if (focusedSession) {
      return focusedSession.state;
    }
    return this.initializing ? 1 /* Initializing */ : 0 /* Inactive */;
  }
  get initializingOptions() {
    return this._initializingOptions;
  }
  startInitializingState(options3) {
    if (!this.initializing) {
      this.initializing = true;
      this._initializingOptions = options3;
      this.onStateChange();
    }
  }
  endInitializingState() {
    if (this.initializing) {
      this.initializing = false;
      this._initializingOptions = void 0;
      this.onStateChange();
    }
  }
  cancelTokens(id2) {
    if (id2) {
      const token = this.sessionCancellationTokens.get(id2);
      if (token) {
        token.cancel();
        this.sessionCancellationTokens.delete(id2);
      }
    } else {
      this.sessionCancellationTokens.forEach((t2) => t2.cancel());
      this.sessionCancellationTokens.clear();
    }
  }
  onStateChange() {
    const state = this.state;
    if (this.previousState !== state) {
      this.contextKeyService.bufferChangeEvents(() => {
        this.debugState.set(getStateLabel(state));
        this.inDebugMode.set(state !== 0 /* Inactive */);
        const debugUxValue = state !== 0 /* Inactive */ && state !== 1 /* Initializing */ || this.adapterManager.hasEnabledDebuggers() && this.configurationManager.selectedConfiguration.name ? "default" : "simple";
        this.debugUx.set(debugUxValue);
        this.debugStorage.storeDebugUxState(debugUxValue);
      });
      this.previousState = state;
      this._onDidChangeState.fire(state);
    }
  }
  get onDidChangeState() {
    return this._onDidChangeState.event;
  }
  get onDidNewSession() {
    return this._onDidNewSession.event;
  }
  get onWillNewSession() {
    return this._onWillNewSession.event;
  }
  get onDidEndSession() {
    return this._onDidEndSession.event;
  }
  lazySetup() {
    if (!this.haveDoneLazySetup) {
      this.disposables.add(this.fileService.registerProvider(DEBUG_MEMORY_SCHEME, this.disposables.add(new DebugMemoryFileSystemProvider(this))));
      this.haveDoneLazySetup = true;
    }
  }
  //---- life cycle management
  /**
   * main entry point
   * properly manages compounds, checks for errors and handles the initializing state.
   */
  async startDebugging(launch, configOrName, options3, saveBeforeStart = !options3?.parentSession) {
    const message = options3 && options3.noDebug ? localize(14557, null) : localize(14546, null);
    const trust = await this.workspaceTrustRequestService.requestWorkspaceTrust({ message });
    if (!trust) {
      return false;
    }
    this.lazySetup();
    this.startInitializingState(options3);
    this.hasDebugged.set(true);
    try {
      await this.extensionService.activateByEvent("onDebug");
      if (saveBeforeStart) {
        await saveAllBeforeDebugStart(this.configurationService, this.editorService);
      }
      await this.extensionService.whenInstalledExtensionsRegistered();
      let config;
      let compound;
      if (!configOrName) {
        configOrName = this.configurationManager.selectedConfiguration.name;
      }
      if (typeof configOrName === "string" && launch) {
        config = launch.getConfiguration(configOrName);
        compound = launch.getCompound(configOrName);
      } else if (typeof configOrName !== "string") {
        config = configOrName;
      }
      if (compound) {
        if (!compound.configurations) {
          throw new Error(localize(
            14540,
            null
          ));
        }
        if (compound.preLaunchTask) {
          const taskResult = await this.taskRunner.runTaskAndCheckErrors(launch?.workspace || this.contextService.getWorkspace(), compound.preLaunchTask);
          if (taskResult === 0 /* Failure */) {
            this.endInitializingState();
            return false;
          }
        }
        if (compound.stopAll) {
          options3 = { ...options3, compoundRoot: new DebugCompoundRoot() };
        }
        const values = await Promise.all(compound.configurations.map((configData) => {
          const name = typeof configData === "string" ? configData : configData.name;
          if (name === compound.name) {
            return Promise.resolve(false);
          }
          let launchForName;
          if (typeof configData === "string") {
            const launchesContainingName = this.configurationManager.getLaunches().filter((l) => !!l.getConfiguration(name));
            if (launchesContainingName.length === 1) {
              launchForName = launchesContainingName[0];
            } else if (launch && launchesContainingName.length > 1 && launchesContainingName.indexOf(launch) >= 0) {
              launchForName = launch;
            } else {
              throw new Error(launchesContainingName.length === 0 ? localize(14554, null, name) : localize(14551, null, name));
            }
          } else if (configData.folder) {
            const launchesMatchingConfigData = this.configurationManager.getLaunches().filter((l) => l.workspace && l.workspace.name === configData.folder && !!l.getConfiguration(configData.name));
            if (launchesMatchingConfigData.length === 1) {
              launchForName = launchesMatchingConfigData[0];
            } else {
              throw new Error(localize(14555, null, configData.folder, configData.name, compound.name));
            }
          }
          return this.createSession(launchForName, launchForName.getConfiguration(name), options3);
        }));
        const result2 = values.every((success) => !!success);
        this.endInitializingState();
        return result2;
      }
      if (configOrName && !config) {
        const message2 = !!launch ? localize(14541, null, typeof configOrName === "string" ? configOrName : configOrName.name) : localize(14550, null);
        throw new Error(message2);
      }
      const result = await this.createSession(launch, config, options3);
      this.endInitializingState();
      return result;
    } catch (err) {
      this.notificationService.error(err);
      this.endInitializingState();
      return Promise.reject(err);
    }
  }
  /**
   * gets the debugger for the type, resolves configurations by providers, substitutes variables and runs prelaunch tasks
   */
  async createSession(launch, config, options3) {
    let type;
    if (config) {
      type = config.type;
    } else {
      config = /* @__PURE__ */ Object.create(null);
    }
    if (options3 && options3.noDebug) {
      config.noDebug = true;
    } else if (options3 && typeof options3.noDebug === "undefined" && options3.parentSession && options3.parentSession.configuration.noDebug) {
      config.noDebug = true;
    }
    const unresolvedConfig = deepClone(config);
    let guess;
    let activeEditor;
    if (!type) {
      activeEditor = this.editorService.activeEditor;
      if (activeEditor && activeEditor.resource) {
        const chosen = this.chosenEnvironments[activeEditor.resource.toString()];
        if (chosen) {
          type = chosen.type;
          if (chosen.dynamicLabel) {
            const dyn = await this.configurationManager.getDynamicConfigurationsByType(chosen.type);
            const found = dyn.find((d) => d.label === chosen.dynamicLabel);
            if (found) {
              launch = found.launch;
              Object.assign(config, found.config);
            }
          }
        }
      }
      if (!type) {
        guess = await this.adapterManager.guessDebugger(false);
        if (guess) {
          type = guess.debugger.type;
          if (guess.withConfig) {
            launch = guess.withConfig.launch;
            Object.assign(config, guess.withConfig.config);
          }
        }
      }
    }
    const initCancellationToken = new CancellationTokenSource();
    const sessionId = generateUuid();
    this.sessionCancellationTokens.set(sessionId, initCancellationToken);
    const configByProviders = await this.configurationManager.resolveConfigurationByProviders(launch && launch.workspace ? launch.workspace.uri : void 0, type, config, initCancellationToken.token);
    if (configByProviders && configByProviders.type) {
      try {
        let resolvedConfig = await this.substituteVariables(launch, configByProviders);
        if (!resolvedConfig) {
          return false;
        }
        if (initCancellationToken.token.isCancellationRequested) {
          return false;
        }
        let userConfirmedConcurrentSession = false;
        if (options3?.startedByUser && resolvedConfig && resolvedConfig.suppressMultipleSessionWarning !== true) {
          const existingSessions = this.model.getSessions();
          const workspace2 = launch?.workspace;
          const existingSession = existingSessions.find(
            (s) => s.configuration.name === resolvedConfig.name && s.configuration.type === resolvedConfig.type && s.configuration.request === resolvedConfig.request && s.root === workspace2
          );
          if (existingSession) {
            const confirmed = await this.confirmConcurrentSession(existingSession.getLabel());
            if (!confirmed) {
              return false;
            }
            userConfirmedConcurrentSession = true;
          }
        }
        const workspace = launch?.workspace || this.contextService.getWorkspace();
        const taskResult = await this.taskRunner.runTaskAndCheckErrors(workspace, resolvedConfig.preLaunchTask);
        if (taskResult === 0 /* Failure */) {
          return false;
        }
        const cfg = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : void 0, resolvedConfig.type, resolvedConfig, initCancellationToken.token);
        if (!cfg) {
          if (launch && type && cfg === null && !initCancellationToken.token.isCancellationRequested) {
            await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
          }
          return false;
        }
        resolvedConfig = cfg;
        const dbg = this.adapterManager.getDebugger(resolvedConfig.type);
        if (!dbg || configByProviders.request !== "attach" && configByProviders.request !== "launch") {
          let message;
          if (configByProviders.request !== "attach" && configByProviders.request !== "launch") {
            message = configByProviders.request ? localize(14545, null, "request", configByProviders.request) : localize(14544, null, "request");
          } else {
            message = resolvedConfig.type ? localize(14548, null, resolvedConfig.type) : localize(14547, null);
          }
          const actionList = [];
          actionList.push(toAction({
            id: "installAdditionalDebuggers",
            label: localize(14549, null, resolvedConfig.type),
            enabled: true,
            run: async () => this.commandService.executeCommand("debug.installAdditionalDebuggers", resolvedConfig?.type)
          }));
          await this.showError(message, actionList);
          return false;
        }
        if (!dbg.enabled) {
          await this.showError(debuggerDisabledMessage(dbg.type), []);
          return false;
        }
        const result = await this.doCreateSession(sessionId, launch?.workspace, { resolved: resolvedConfig, unresolved: unresolvedConfig }, options3, userConfirmedConcurrentSession);
        if (result && guess && activeEditor && activeEditor.resource) {
          this.chosenEnvironments[activeEditor.resource.toString()] = { type: guess.debugger.type, dynamicLabel: guess.withConfig?.label };
          this.debugStorage.storeChosenEnvironments(this.chosenEnvironments);
        }
        return result;
      } catch (err) {
        if (err && err.message) {
          await this.showError(err.message);
        } else if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
          await this.showError(localize(14556, null));
        }
        if (launch && !initCancellationToken.token.isCancellationRequested) {
          await launch.openConfigFile({ preserveFocus: true }, initCancellationToken.token);
        }
        return false;
      }
    }
    if (launch && type && configByProviders === null && !initCancellationToken.token.isCancellationRequested) {
      await launch.openConfigFile({ preserveFocus: true, type }, initCancellationToken.token);
    }
    return false;
  }
  /**
   * instantiates the new session, initializes the session, registers session listeners and reports telemetry
   */
  async doCreateSession(sessionId, root, configuration2, options3, userConfirmedConcurrentSession = false) {
    const session = this.instantiationService.createInstance(DebugSession, sessionId, configuration2, root, this.model, options3);
    if (!userConfirmedConcurrentSession && options3?.startedByUser && this.model.getSessions().some(
      (s) => s.configuration.name === configuration2.resolved.name && s.configuration.type === configuration2.resolved.type && s.configuration.request === configuration2.resolved.request && s.root === root
    ) && configuration2.resolved.suppressMultipleSessionWarning !== true) {
      const confirmed = await this.confirmConcurrentSession(session.getLabel());
      if (!confirmed) {
        return false;
      }
    }
    this.model.addSession(session);
    this._onWillNewSession.fire(session);
    const openDebug = this.configurationService.getValue("debug").openDebug;
    if (!configuration2.resolved.noDebug && (openDebug === "openOnSessionStart" || openDebug === "openOnFirstSessionStart" && this.viewModel.firstSessionStart) && !session.suppressDebugView) {
      await this.paneCompositeService.openPaneComposite(VIEWLET_ID3, 0 /* Sidebar */);
    }
    try {
      await this.launchOrAttachToSession(session);
      const internalConsoleOptions = session.configuration.internalConsoleOptions || this.configurationService.getValue("debug").internalConsoleOptions;
      if (internalConsoleOptions === "openOnSessionStart" || this.viewModel.firstSessionStart && internalConsoleOptions === "openOnFirstSessionStart") {
        this.viewsService.openView(REPL_VIEW_ID, false);
      }
      this.viewModel.firstSessionStart = false;
      const showSubSessions = this.configurationService.getValue("debug").showSubSessionsInToolBar;
      const sessions = this.model.getSessions();
      const shownSessions = showSubSessions ? sessions : sessions.filter((s) => !s.parentSession);
      if (shownSessions.length > 1) {
        this.viewModel.setMultiSessionView(true);
      }
      this._onDidNewSession.fire(session);
      return true;
    } catch (error) {
      if (isCancellationError(error)) {
        return false;
      }
      if (session && session.getReplElements().length > 0) {
        this.viewsService.openView(REPL_VIEW_ID, false);
      }
      if (session.configuration && session.configuration.request === "attach" && session.configuration.__autoAttach) {
        return false;
      }
      const errorMessage = error instanceof Error ? error.message : error;
      if (error.showUser !== false) {
        await this.showError(errorMessage, isErrorWithActions(error) ? error.actions : []);
      }
      return false;
    }
  }
  async confirmConcurrentSession(sessionLabel) {
    const result = await this.dialogService.confirm({
      message: localize(14552, null, sessionLabel)
    });
    return result.confirmed;
  }
  async launchOrAttachToSession(session, forceFocus = false) {
    this.registerSessionListeners(session);
    const dbgr = this.adapterManager.getDebugger(session.configuration.type);
    try {
      await session.initialize(dbgr);
      await session.launchOrAttach(session.configuration);
      const launchJsonExists = !!session.root && !!this.configurationService.getValue("launch", { resource: session.root.uri });
      await this.telemetry.logDebugSessionStart(dbgr, launchJsonExists);
      if (forceFocus || !this.viewModel.focusedSession || session.parentSession === this.viewModel.focusedSession && session.compact) {
        await this.focusStackFrame(void 0, void 0, session);
      }
    } catch (err) {
      if (this.viewModel.focusedSession === session) {
        await this.focusStackFrame(void 0);
      }
      return Promise.reject(err);
    }
  }
  registerSessionListeners(session) {
    const listenerDisposables = new DisposableStore();
    this.disposables.add(listenerDisposables);
    const sessionRunningScheduler = listenerDisposables.add(new RunOnceScheduler(() => {
      if (session.state === 3 /* Running */ && this.viewModel.focusedSession === session) {
        this.viewModel.setFocus(void 0, this.viewModel.focusedThread, session, false);
      }
    }, 200));
    listenerDisposables.add(session.onDidChangeState(() => {
      if (session.state === 3 /* Running */ && this.viewModel.focusedSession === session) {
        sessionRunningScheduler.schedule();
      }
      if (session === this.viewModel.focusedSession) {
        this.onStateChange();
      }
    }));
    listenerDisposables.add(this.onDidEndSession((e) => {
      if (e.session === session) {
        this.disposables.delete(listenerDisposables);
      }
    }));
    listenerDisposables.add(session.onDidEndAdapter(async (adapterExitEvent) => {
      if (adapterExitEvent) {
        if (adapterExitEvent.error) {
          this.notificationService.error(localize(14542, null, adapterExitEvent.error.message || adapterExitEvent.error.toString()));
        }
        this.telemetry.logDebugSessionStop(session, adapterExitEvent);
      }
      const extensionDebugSession = getExtensionHostDebugSession(session);
      if (extensionDebugSession && extensionDebugSession.state === 3 /* Running */ && extensionDebugSession.configuration.noDebug) {
        this.extensionHostDebugService.close(extensionDebugSession.getId());
      }
      if (session.configuration.postDebugTask) {
        const root = session.root ?? this.contextService.getWorkspace();
        try {
          await this.taskRunner.runTask(root, session.configuration.postDebugTask);
        } catch (err) {
          this.notificationService.error(err);
        }
      }
      this.endInitializingState();
      this.cancelTokens(session.getId());
      if (this.configurationService.getValue("debug").closeReadonlyTabsOnEnd) {
        const editorsToClose = this.editorService.getEditors(1 /* SEQUENTIAL */).filter(({ editor }) => {
          return editor.resource?.scheme === DEBUG_SCHEME && session.getId() === Source.getEncodedDebugData(editor.resource).sessionId;
        });
        this.editorService.closeEditors(editorsToClose);
      }
      this._onDidEndSession.fire({ session, restart: this.restartingSessions.has(session) });
      const focusedSession = this.viewModel.focusedSession;
      if (focusedSession && focusedSession.getId() === session.getId()) {
        const { session: session2, thread, stackFrame } = getStackFrameThreadAndSessionToFocus(this.model, void 0, void 0, void 0, focusedSession);
        this.viewModel.setFocus(stackFrame, thread, session2, false);
      }
      if (this.model.getSessions().length === 0) {
        this.viewModel.setMultiSessionView(false);
        if (this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) && this.configurationService.getValue("debug").openExplorerOnEnd) {
          this.paneCompositeService.openPaneComposite(VIEWLET_ID5, 0 /* Sidebar */);
        }
        const dataBreakpoints = this.model.getDataBreakpoints().filter((dbp) => !dbp.canPersist);
        dataBreakpoints.forEach((dbp) => this.model.removeDataBreakpoints(dbp.getId()));
        if (this.configurationService.getValue("debug").console.closeOnEnd) {
          const debugConsoleContainer = this.viewDescriptorService.getViewContainerByViewId(REPL_VIEW_ID);
          if (debugConsoleContainer && this.viewsService.isViewContainerVisible(debugConsoleContainer.id)) {
            this.viewsService.closeViewContainer(debugConsoleContainer.id);
          }
        }
      }
      this.model.removeExceptionBreakpointsForSession(session.getId());
    }));
  }
  async restartSession(session, restartData) {
    if (session.saveBeforeRestart) {
      await saveAllBeforeDebugStart(this.configurationService, this.editorService);
    }
    const isAutoRestart = !!restartData;
    const runTasks = async () => {
      if (isAutoRestart) {
        return Promise.resolve(1 /* Success */);
      }
      const root = session.root || this.contextService.getWorkspace();
      await this.taskRunner.runTask(root, session.configuration.preRestartTask);
      await this.taskRunner.runTask(root, session.configuration.postDebugTask);
      const taskResult1 = await this.taskRunner.runTaskAndCheckErrors(root, session.configuration.preLaunchTask);
      if (taskResult1 !== 1 /* Success */) {
        return taskResult1;
      }
      return this.taskRunner.runTaskAndCheckErrors(root, session.configuration.postRestartTask);
    };
    const extensionDebugSession = getExtensionHostDebugSession(session);
    if (extensionDebugSession) {
      const taskResult = await runTasks();
      if (taskResult === 1 /* Success */) {
        this.extensionHostDebugService.reload(extensionDebugSession.getId());
      }
      return;
    }
    let needsToSubstitute = false;
    let unresolved;
    const launch = session.root ? this.configurationManager.getLaunch(session.root.uri) : void 0;
    if (launch) {
      unresolved = launch.getConfiguration(session.configuration.name);
      if (unresolved && !equals4(unresolved, session.unresolvedConfiguration)) {
        unresolved.noDebug = session.configuration.noDebug;
        needsToSubstitute = true;
      }
    }
    let resolved = session.configuration;
    if (launch && needsToSubstitute && unresolved) {
      const initCancellationToken = new CancellationTokenSource();
      this.sessionCancellationTokens.set(session.getId(), initCancellationToken);
      const resolvedByProviders = await this.configurationManager.resolveConfigurationByProviders(launch.workspace ? launch.workspace.uri : void 0, unresolved.type, unresolved, initCancellationToken.token);
      if (resolvedByProviders) {
        resolved = await this.substituteVariables(launch, resolvedByProviders);
        if (resolved && !initCancellationToken.token.isCancellationRequested) {
          resolved = await this.configurationManager.resolveDebugConfigurationWithSubstitutedVariables(launch && launch.workspace ? launch.workspace.uri : void 0, resolved.type, resolved, initCancellationToken.token);
        }
      } else {
        resolved = resolvedByProviders;
      }
    }
    if (resolved) {
      session.setConfiguration({ resolved, unresolved });
    }
    session.configuration.__restart = restartData;
    const doRestart = async (fn) => {
      this.restartingSessions.add(session);
      let didRestart = false;
      try {
        didRestart = await fn() !== false;
      } catch (e) {
        didRestart = false;
        throw e;
      } finally {
        this.restartingSessions.delete(session);
        if (!didRestart) {
          this._onDidEndSession.fire({ session, restart: false });
        }
      }
    };
    for (const breakpoint2 of this.model.getBreakpoints({ triggeredOnly: true })) {
      breakpoint2.setSessionDidTrigger(session.getId(), false);
    }
    if (session.correlatedTestRun) {
      if (!session.correlatedTestRun.completedAt) {
        session.cancelCorrelatedTestRun();
        await Event2.toPromise(session.correlatedTestRun.onComplete);
      }
      this.testService.runResolvedTests(session.correlatedTestRun.request);
      return;
    }
    if (session.capabilities.supportsRestartRequest) {
      const taskResult = await runTasks();
      if (taskResult === 1 /* Success */) {
        await doRestart(async () => {
          await session.restart();
          return true;
        });
      }
      return;
    }
    const shouldFocus = !!this.viewModel.focusedSession && session.getId() === this.viewModel.focusedSession.getId();
    return doRestart(async () => {
      if (isAutoRestart) {
        await session.disconnect(true);
      } else {
        await session.terminate(true);
      }
      return new Promise((c, e) => {
        setTimeout(async () => {
          const taskResult = await runTasks();
          if (taskResult !== 1 /* Success */) {
            return c(false);
          }
          if (!resolved) {
            return c(false);
          }
          try {
            await this.launchOrAttachToSession(session, shouldFocus);
            this._onDidNewSession.fire(session);
            c(true);
          } catch (error) {
            e(error);
          }
        }, 300);
      });
    });
  }
  async stopSession(session, disconnect = false, suspend = false) {
    if (session) {
      return disconnect ? session.disconnect(void 0, suspend) : session.terminate();
    }
    const sessions = this.model.getSessions();
    if (sessions.length === 0) {
      this.taskRunner.cancel();
      await this.quickInputService.cancel();
      this.endInitializingState();
      this.cancelTokens(void 0);
    }
    return Promise.all(sessions.map((s) => disconnect ? s.disconnect(void 0, suspend) : s.terminate()));
  }
  async substituteVariables(launch, config) {
    const dbg = this.adapterManager.getDebugger(config.type);
    if (dbg) {
      let folder = void 0;
      if (launch && launch.workspace) {
        folder = launch.workspace;
      } else {
        const folders = this.contextService.getWorkspace().folders;
        if (folders.length === 1) {
          folder = folders[0];
        }
      }
      try {
        return await dbg.substituteVariables(folder, config);
      } catch (err) {
        if (err.message !== canceledName) {
          this.showError(err.message, void 0, !!launch?.getConfiguration(config.name));
        }
        return void 0;
      }
    }
    return Promise.resolve(config);
  }
  async showError(message, errorActions = [], promptLaunchJson = true) {
    const configureAction = toAction({ id: DEBUG_CONFIGURE_COMMAND_ID, label: DEBUG_CONFIGURE_LABEL, enabled: true, run: () => this.commandService.executeCommand(DEBUG_CONFIGURE_COMMAND_ID) });
    const actions = errorActions.filter((action) => action.id.endsWith(".command")).length > 0 ? errorActions : [...errorActions, ...promptLaunchJson ? [configureAction] : []];
    await this.dialogService.prompt({
      type: severity_default.Error,
      message,
      buttons: actions.map((action) => ({
        label: action.label,
        run: () => action.run()
      })),
      cancelButton: true
    });
  }
  //---- focus management
  async focusStackFrame(_stackFrame, _thread, _session, options3) {
    const { stackFrame, thread, session } = getStackFrameThreadAndSessionToFocus(this.model, _stackFrame, _thread, _session);
    if (stackFrame) {
      const editor = await stackFrame.openInEditor(this.editorService, options3?.preserveFocus ?? true, options3?.sideBySide, options3?.pinned);
      if (editor) {
        if (editor.input === DisassemblyViewInput.instance) {
        } else {
          const control = editor.getControl();
          if (stackFrame && isCodeEditor(control) && control.hasModel()) {
            const model = control.getModel();
            const lineNumber = stackFrame.range.startLineNumber;
            if (lineNumber >= 1 && lineNumber <= model.getLineCount()) {
              const lineContent = control.getModel().getLineContent(lineNumber);
              alert(localize(
                14543,
                null,
                lineContent,
                thread && thread.stoppedDetails ? `, reason ${thread.stoppedDetails.reason}` : "",
                stackFrame.source ? stackFrame.source.name : "",
                stackFrame.range.startLineNumber
              ));
            }
          }
        }
      }
    }
    if (session) {
      this.debugType.set(session.configuration.type);
    } else {
      this.debugType.reset();
    }
    this.viewModel.setFocus(stackFrame, thread, session, !!options3?.explicit);
  }
  //---- watches
  addWatchExpression(name) {
    const we = this.model.addWatchExpression(name);
    if (!name) {
      this.viewModel.setSelectedExpression(we, false);
    }
    this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
  }
  renameWatchExpression(id2, newName) {
    this.model.renameWatchExpression(id2, newName);
    this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
  }
  moveWatchExpression(id2, position2) {
    this.model.moveWatchExpression(id2, position2);
    this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
  }
  removeWatchExpressions(id2) {
    this.model.removeWatchExpressions(id2);
    this.debugStorage.storeWatchExpressions(this.model.getWatchExpressions());
  }
  //---- breakpoints
  canSetBreakpointsIn(model) {
    return this.adapterManager.canSetBreakpointsIn(model);
  }
  async enableOrDisableBreakpoints(enable, breakpoint2) {
    if (breakpoint2) {
      this.model.setEnablement(breakpoint2, enable);
      this.debugStorage.storeBreakpoints(this.model);
      if (breakpoint2 instanceof Breakpoint2) {
        await this.makeTriggeredBreakpointsMatchEnablement(enable, breakpoint2);
        await this.sendBreakpoints(breakpoint2.originalUri);
      } else if (breakpoint2 instanceof FunctionBreakpoint2) {
        await this.sendFunctionBreakpoints();
      } else if (breakpoint2 instanceof DataBreakpoint2) {
        await this.sendDataBreakpoints();
      } else if (breakpoint2 instanceof InstructionBreakpoint) {
        await this.sendInstructionBreakpoints();
      } else {
        await this.sendExceptionBreakpoints();
      }
    } else {
      this.model.enableOrDisableAllBreakpoints(enable);
      this.debugStorage.storeBreakpoints(this.model);
      await this.sendAllBreakpoints();
    }
    this.debugStorage.storeBreakpoints(this.model);
  }
  async addBreakpoints(uri5, rawBreakpoints, ariaAnnounce = true) {
    const breakpoints = this.model.addBreakpoints(uri5, rawBreakpoints);
    if (ariaAnnounce) {
      breakpoints.forEach((bp) => status(localize(14538, null, bp.lineNumber, uri5.fsPath)));
    }
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendBreakpoints(uri5);
    this.debugStorage.storeBreakpoints(this.model);
    return breakpoints;
  }
  async updateBreakpoints(uri5, data, sendOnResourceSaved) {
    this.model.updateBreakpoints(data);
    this.debugStorage.storeBreakpoints(this.model);
    if (sendOnResourceSaved) {
      this.breakpointsToSendOnResourceSaved.add(uri5);
    } else {
      await this.sendBreakpoints(uri5);
      this.debugStorage.storeBreakpoints(this.model);
    }
  }
  async removeBreakpoints(id2) {
    const breakpoints = this.model.getBreakpoints();
    const toRemove = id2 === void 0 ? breakpoints : id2 instanceof Array ? breakpoints.filter((bp) => id2.includes(bp.getId())) : breakpoints.filter((bp) => bp.getId() === id2);
    toRemove.forEach((bp) => status(localize(14539, null, bp.lineNumber, bp.uri.fsPath)));
    const urisToClear = new Set(toRemove.map((bp) => bp.originalUri.toString()));
    this.model.removeBreakpoints(toRemove);
    this.unlinkTriggeredBreakpoints(breakpoints, toRemove).forEach((uri5) => urisToClear.add(uri5.toString()));
    this.debugStorage.storeBreakpoints(this.model);
    await Promise.all([...urisToClear].map((uri5) => this.sendBreakpoints(URI.parse(uri5))));
  }
  setBreakpointsActivated(activated) {
    this.model.setBreakpointsActivated(activated);
    return this.sendAllBreakpoints();
  }
  async addFunctionBreakpoint(opts, id2) {
    this.model.addFunctionBreakpoint(opts ?? { name: "" }, id2);
    if (opts) {
      this.debugStorage.storeBreakpoints(this.model);
      await this.sendFunctionBreakpoints();
      this.debugStorage.storeBreakpoints(this.model);
    }
  }
  async updateFunctionBreakpoint(id2, update) {
    this.model.updateFunctionBreakpoint(id2, update);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendFunctionBreakpoints();
  }
  async removeFunctionBreakpoints(id2) {
    this.model.removeFunctionBreakpoints(id2);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendFunctionBreakpoints();
  }
  async addDataBreakpoint(opts) {
    this.model.addDataBreakpoint(opts);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendDataBreakpoints();
    this.debugStorage.storeBreakpoints(this.model);
  }
  async updateDataBreakpoint(id2, update) {
    this.model.updateDataBreakpoint(id2, update);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendDataBreakpoints();
  }
  async removeDataBreakpoints(id2) {
    this.model.removeDataBreakpoints(id2);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendDataBreakpoints();
  }
  async addInstructionBreakpoint(opts) {
    this.model.addInstructionBreakpoint(opts);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendInstructionBreakpoints();
    this.debugStorage.storeBreakpoints(this.model);
  }
  async removeInstructionBreakpoints(instructionReference, offset, address) {
    this.model.removeInstructionBreakpoints(instructionReference, offset, address);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendInstructionBreakpoints();
  }
  setExceptionBreakpointFallbackSession(sessionId) {
    this.model.setExceptionBreakpointFallbackSession(sessionId);
    this.debugStorage.storeBreakpoints(this.model);
  }
  setExceptionBreakpointsForSession(session, filters2) {
    this.model.setExceptionBreakpointsForSession(session.getId(), filters2);
    this.debugStorage.storeBreakpoints(this.model);
  }
  async setExceptionBreakpointCondition(exceptionBreakpoint, condition) {
    this.model.setExceptionBreakpointCondition(exceptionBreakpoint, condition);
    this.debugStorage.storeBreakpoints(this.model);
    await this.sendExceptionBreakpoints();
  }
  async sendAllBreakpoints(session) {
    const setBreakpointsPromises = distinct(this.model.getBreakpoints(), (bp) => bp.originalUri.toString()).map((bp) => this.sendBreakpoints(bp.originalUri, false, session));
    if (session?.capabilities.supportsConfigurationDoneRequest) {
      await Promise.all([
        ...setBreakpointsPromises,
        this.sendFunctionBreakpoints(session),
        this.sendDataBreakpoints(session),
        this.sendInstructionBreakpoints(session),
        this.sendExceptionBreakpoints(session)
      ]);
    } else {
      await Promise.all(setBreakpointsPromises);
      await this.sendFunctionBreakpoints(session);
      await this.sendDataBreakpoints(session);
      await this.sendInstructionBreakpoints(session);
      await this.sendExceptionBreakpoints(session);
    }
  }
  /**
   * Removes the condition of triggered breakpoints that depended on
   * breakpoints in `removedBreakpoints`. Returns the URIs of resources that
   * had their breakpoints changed in this way.
   */
  unlinkTriggeredBreakpoints(allBreakpoints2, removedBreakpoints) {
    const affectedUris = [];
    for (const removed of removedBreakpoints) {
      for (const existing of allBreakpoints2) {
        if (!removedBreakpoints.includes(existing) && existing.triggeredBy === removed.getId()) {
          this.model.updateBreakpoints(/* @__PURE__ */ new Map([[existing.getId(), { triggeredBy: void 0 }]]));
          affectedUris.push(existing.originalUri);
        }
      }
    }
    return affectedUris;
  }
  async makeTriggeredBreakpointsMatchEnablement(enable, breakpoint2) {
    if (enable) {
      if (breakpoint2.triggeredBy) {
        const trigger = this.model.getBreakpoints().find((bp) => breakpoint2.triggeredBy === bp.getId());
        if (trigger && !trigger.enabled) {
          await this.enableOrDisableBreakpoints(enable, trigger);
        }
      }
    }
    await Promise.all(
      this.model.getBreakpoints().filter((bp) => bp.triggeredBy === breakpoint2.getId() && bp.enabled !== enable).map((bp) => this.enableOrDisableBreakpoints(enable, bp))
    );
  }
  async sendBreakpoints(modelUri, sourceModified = false, session) {
    const breakpointsToSend = this.model.getBreakpoints({ originalUri: modelUri, enabledOnly: true });
    await sendToOneOrAllSessions(this.model, session, async (s) => {
      if (!s.configuration.noDebug) {
        const sessionBps = breakpointsToSend.filter((bp) => !bp.triggeredBy || bp.getSessionDidTrigger(s.getId()));
        await s.sendBreakpoints(modelUri, sessionBps, sourceModified);
      }
    });
  }
  async sendFunctionBreakpoints(session) {
    const breakpointsToSend = this.model.getFunctionBreakpoints().filter((fbp) => fbp.enabled && this.model.areBreakpointsActivated());
    await sendToOneOrAllSessions(this.model, session, async (s) => {
      if (s.capabilities.supportsFunctionBreakpoints && !s.configuration.noDebug) {
        await s.sendFunctionBreakpoints(breakpointsToSend);
      }
    });
  }
  async sendDataBreakpoints(session) {
    const breakpointsToSend = this.model.getDataBreakpoints().filter((fbp) => fbp.enabled && this.model.areBreakpointsActivated());
    await sendToOneOrAllSessions(this.model, session, async (s) => {
      if (s.capabilities.supportsDataBreakpoints && !s.configuration.noDebug) {
        await s.sendDataBreakpoints(breakpointsToSend);
      }
    });
  }
  async sendInstructionBreakpoints(session) {
    const breakpointsToSend = this.model.getInstructionBreakpoints().filter((fbp) => fbp.enabled && this.model.areBreakpointsActivated());
    await sendToOneOrAllSessions(this.model, session, async (s) => {
      if (s.capabilities.supportsInstructionBreakpoints && !s.configuration.noDebug) {
        await s.sendInstructionBreakpoints(breakpointsToSend);
      }
    });
  }
  sendExceptionBreakpoints(session) {
    return sendToOneOrAllSessions(this.model, session, async (s) => {
      const enabledExceptionBps = this.model.getExceptionBreakpointsForSession(s.getId()).filter((exb) => exb.enabled);
      if (s.capabilities.supportsConfigurationDoneRequest && (!s.capabilities.exceptionBreakpointFilters || s.capabilities.exceptionBreakpointFilters.length === 0)) {
        return;
      }
      if (!s.configuration.noDebug) {
        await s.sendExceptionBreakpoints(enabledExceptionBps);
      }
    });
  }
  onFileChanges(fileChangesEvent) {
    const toRemove = this.model.getBreakpoints().filter((bp) => fileChangesEvent.contains(bp.originalUri, 2 /* DELETED */));
    if (toRemove.length) {
      this.model.removeBreakpoints(toRemove);
    }
    const toSend = [];
    for (const uri5 of this.breakpointsToSendOnResourceSaved) {
      if (fileChangesEvent.contains(uri5, 0 /* UPDATED */)) {
        toSend.push(uri5);
      }
    }
    for (const uri5 of toSend) {
      this.breakpointsToSendOnResourceSaved.delete(uri5);
      this.sendBreakpoints(uri5, true);
    }
  }
  async runTo(uri5, lineNumber, column) {
    let breakpointToRemove;
    let threadToContinue = this.getViewModel().focusedThread;
    const addTempBreakPoint = async () => {
      const bpExists = !!this.getModel().getBreakpoints({ column, lineNumber, uri: uri5 }).length;
      if (!bpExists) {
        const addResult = await this.addAndValidateBreakpoints(uri5, lineNumber, column);
        if (addResult.thread) {
          threadToContinue = addResult.thread;
        }
        if (addResult.breakpoint) {
          breakpointToRemove = addResult.breakpoint;
        }
      }
      return { threadToContinue, breakpointToRemove };
    };
    const removeTempBreakPoint = (state) => {
      if (state === 2 /* Stopped */ || state === 0 /* Inactive */) {
        if (breakpointToRemove) {
          this.removeBreakpoints(breakpointToRemove.getId());
        }
        return true;
      }
      return false;
    };
    await addTempBreakPoint();
    if (this.state === 0 /* Inactive */) {
      const { launch, name, getConfig } = this.getConfigurationManager().selectedConfiguration;
      const config = await getConfig();
      const configOrName = config ? Object.assign(deepClone(config), {}) : name;
      const listener = this.onDidChangeState((state) => {
        if (removeTempBreakPoint(state)) {
          listener.dispose();
        }
      });
      await this.startDebugging(launch, configOrName, void 0, true);
    }
    if (this.state === 2 /* Stopped */) {
      const focusedSession = this.getViewModel().focusedSession;
      if (!focusedSession || !threadToContinue) {
        return;
      }
      const listener = threadToContinue.session.onDidChangeState(() => {
        if (removeTempBreakPoint(focusedSession.state)) {
          listener.dispose();
        }
      });
      await threadToContinue.continue();
    }
  }
  async addAndValidateBreakpoints(uri5, lineNumber, column) {
    const debugModel = this.getModel();
    const viewModel = this.getViewModel();
    const breakpoints = await this.addBreakpoints(uri5, [{ lineNumber, column }], false);
    const breakpoint2 = breakpoints?.[0];
    if (!breakpoint2) {
      return { breakpoint: void 0, thread: viewModel.focusedThread };
    }
    if (!breakpoint2.verified) {
      let listener;
      await raceTimeout(new Promise((resolve3) => {
        listener = debugModel.onDidChangeBreakpoints(() => {
          if (breakpoint2.verified) {
            resolve3();
          }
        });
      }), 2e3);
      listener.dispose();
    }
    let Score;
    ((Score2) => {
      Score2[Score2["Focused"] = 0] = "Focused";
      Score2[Score2["Verified"] = 1] = "Verified";
      Score2[Score2["VerifiedAndPausedInFile"] = 2] = "VerifiedAndPausedInFile";
      Score2[Score2["VerifiedAndFocused"] = 3] = "VerifiedAndFocused";
    })(Score || (Score = {}));
    let bestThread = viewModel.focusedThread;
    let bestScore = 0 /* Focused */;
    for (const sessionId of breakpoint2.sessionsThatVerified) {
      const session = debugModel.getSession(sessionId);
      if (!session) {
        continue;
      }
      const threads = session.getAllThreads().filter((t2) => t2.stopped);
      if (bestScore < 3 /* VerifiedAndFocused */) {
        if (viewModel.focusedThread && threads.includes(viewModel.focusedThread)) {
          bestThread = viewModel.focusedThread;
          bestScore = 3 /* VerifiedAndFocused */;
        }
      }
      if (bestScore < 2 /* VerifiedAndPausedInFile */) {
        const pausedInThisFile = threads.find((t2) => {
          const top2 = t2.getTopStackFrame();
          return top2 && this.uriIdentityService.extUri.isEqual(top2.source.uri, uri5);
        });
        if (pausedInThisFile) {
          bestThread = pausedInThisFile;
          bestScore = 2 /* VerifiedAndPausedInFile */;
        }
      }
      if (bestScore < 1 /* Verified */) {
        bestThread = threads[0];
        bestScore = 2 /* VerifiedAndPausedInFile */;
      }
    }
    return { thread: bestThread, breakpoint: breakpoint2 };
  }
};

DebugService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IPaneCompositePartService),
  __decorateParam(2, IViewsService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, ILifecycleService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IFileService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IExtensionHostDebugService),
  __decorateParam(15, IActivityService),
  __decorateParam(16, ICommandService),
  __decorateParam(17, IQuickInputService),
  __decorateParam(18, IWorkspaceTrustRequestService),
  __decorateParam(19, IUriIdentityService),
  __decorateParam(20, ITestService)
], DebugService);

function getStackFrameThreadAndSessionToFocus(model, stackFrame, thread, session, avoidSession) {
  if (!session) {
    if (stackFrame || thread) {
      session = stackFrame ? stackFrame.thread.session : thread.session;
    } else {
      const sessions = model.getSessions();
      const stoppedSession = sessions.find((s) => s.state === 2 /* Stopped */);
      session = stoppedSession || sessions.find((s) => s !== avoidSession && s !== avoidSession?.parentSession) || (sessions.length ? sessions[0] : void 0);
    }
  }
  if (!thread) {
    if (stackFrame) {
      thread = stackFrame.thread;
    } else {
      const threads = session ? session.getAllThreads() : void 0;
      const stoppedThread = threads && threads.find((t2) => t2.stopped);
      thread = stoppedThread || (threads && threads.length ? threads[0] : void 0);
    }
  }
  if (!stackFrame && thread) {
    stackFrame = thread.getTopStackFrame();
  }
  return { session, thread, stackFrame };
}

async function sendToOneOrAllSessions(model, session, send) {
  if (session) {
    await send(session);
  } else {
    await Promise.all(model.getSessions().map((s) => send(s)));
  }
}
export { getStackFrameThreadAndSessionToFocus, sendToOneOrAllSessions, DebugService };
