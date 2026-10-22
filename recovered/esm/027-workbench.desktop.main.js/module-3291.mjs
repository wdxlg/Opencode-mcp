// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalInstance.ts
import { Disposable, DisposableMap, DisposableStore, ImmortalReference, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { TerminalCapabilityStoreMultiplexer } from "./module-2353.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ITerminalLogService, remoteResolverTerminal } from "./module-1154.mjs";
import { TerminalWidgetManager } from "./module-2355.mjs";
import { getTerminalResourcesFromDragEvent, getTerminalUri } from "./module-2158.mjs";
import { hasKey, isNumber, isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { OS, isMacintosh, isWindows } from "./module-0014.mjs";
import { TerminalStatusList } from "./module-3270.mjs";
import { AutoOpenBarrier, Promises, disposableTimeout, timeout } from "./module-0036.mjs";
import { Dimension, DragAndDropObserver, addDisposableListener, disposableWindowInterval, getActiveWindow, getWindow, isAncestorOfActiveElement, isHTMLElement } from "./module-0075.mjs";
import { TerminalExtensionsRegistry } from "./module-2354.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { terminalStrings } from "./module-3261.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { XtermTerminal, getXtermScaledDimensions } from "./module-3066.mjs";
import { TerminalContribCommandId } from "./module-1172.mjs";
import { importAMDNodeModule } from "./module-0191.mjs";
import { localize } from "./module-0001.mjs";
import { TerminalResizeDebouncer } from "./module-3290.mjs";
import { LineDataEventAddon } from "./module-3286.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Codicon } from "./module-0085.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { ITerminalProfileResolverService, TERMINAL_VIEW_ID } from "./module-1173.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { getShellIntegrationTimeout, getUriLabelForShell, getWorkspaceForTerminal, preparePathForShell } from "./module-3266.mjs";
import { TabFocus } from "./module-0219.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { TerminalEditorInput } from "./module-1177.mjs";
import { deserializeEnvironmentVariableCollections } from "./module-1273.mjs";
import { TerminalProcessManager } from "./module-3285.mjs";
import { normalizeDriveLetter, template, tildify } from "./module-0711.mjs";
import { formatMessageForTerminal } from "./module-3052.mjs";
import { TerminalLaunchHelpAction } from "./module-3272.mjs";
import { basename, resolve, win32 } from "./module-0026.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { TerminalIconPicker } from "./module-3289.mjs";
import { createColorStyleElement, getColorClass, getStandardColors } from "./module-1175.mjs";
import { openContextMenu } from "./module-3268.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalConfigurationService } from "./module-1149.mjs";
import { IPathService } from "./module-0938.mjs";
import { IFileService } from "./module-0269.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IProductService } from "./module-0873.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { CodeDataTransfers, containsDragType, getPathForFile } from "./module-0273.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { IWorkbenchLayoutService, isHorizontal } from "./module-1118.mjs";
import { TERMINAL_BACKGROUND_COLOR } from "./module-1174.mjs";
import { editorBackground } from "./module-0229.mjs";
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from "./module-0912.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalInstance.ts
var xtermConstructor;

var shellIntegrationSupportedShellTypes = [
  "bash" /* Bash */,
  "zsh" /* Zsh */,
  "pwsh" /* PowerShell */,
  "python" /* Python */
];

var agentCliTitlePatterns = /* @__PURE__ */ new Map([
  ["claude" /* Claude */, /claude\s*code/i],
  // [GeneralShellType.Codex, /\bcodex\b/i], // codex does not report osc title.
  ["commandcode" /* CommandCode */, /command\s*code/i],
  ["copilot" /* Copilot */, /\bcopilot\b/i],
  ["gemini" /* Gemini */, /\bgemini\b/i]
]);

var TerminalInstance = class extends Disposable {
  constructor(_terminalShellTypeContextKey, _shellLaunchConfig, _contextKeyService, _contextMenuService, instantiationService, _terminalConfigurationService, _terminalProfileResolverService, _pathService, _fileService, _keybindingService, _notificationService, _preferencesService, _viewsService, _themeService, _configurationService, _logService, _storageService, _accessibilityService, _productService, _quickInputService, _workbenchEnvironmentService, _workspaceContextService, _editorService, _workspaceTrustRequestService, _historyService, _telemetryService, _openerService, _commandService, _accessibilitySignalService, _viewDescriptorService) {
    super();
    this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
    this._shellLaunchConfig = _shellLaunchConfig;
    this._contextKeyService = _contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._pathService = _pathService;
    this._fileService = _fileService;
    this._keybindingService = _keybindingService;
    this._notificationService = _notificationService;
    this._viewsService = _viewsService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._accessibilityService = _accessibilityService;
    this._quickInputService = _quickInputService;
    this._workbenchEnvironmentService = _workbenchEnvironmentService;
    this._workspaceContextService = _workspaceContextService;
    this._editorService = _editorService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._historyService = _historyService;
    this._telemetryService = _telemetryService;
    this._openerService = _openerService;
    this._commandService = _commandService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._viewDescriptorService = _viewDescriptorService;
    this._contributions = /* @__PURE__ */ new Map();
    this._latestXtermWriteData = 0;
    this._latestXtermParseData = 0;
    this._title = "";
    this._titleSource = 1 /* Process */;
    this._cols = 0;
    this._rows = 0;
    this._cwd = void 0;
    this._initialCwd = void 0;
    this._injectedArgs = void 0;
    this._layoutSettingsChanged = true;
    this._areLinksReady = false;
    this._initialDataEventsListener = this._register(new MutableDisposable());
    this._initialDataEvents = [];
    this._messageTitleDisposable = this._register(new MutableDisposable());
    this._dndObserver = this._register(new MutableDisposable());
    this._processName = "";
    this._usedShellIntegrationInjection = false;
    this.capabilities = this._register(new TerminalCapabilityStoreMultiplexer());
    this.disableLayout = false;
    this._targetRef = new ImmortalReference(void 0);
    // The onExit event is special in that it fires and is disposed after the terminal instance
    // itself is disposed
    this._onExit = new Emitter();
    this.onExit = this._onExit.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDisposed = this._register(new Emitter());
    this.onDisposed = this._onDisposed.event;
    this._onProcessIdReady = this._register(new Emitter());
    this.onProcessIdReady = this._onProcessIdReady.event;
    this._onProcessReplayComplete = this._register(new Emitter());
    this.onProcessReplayComplete = this._onProcessReplayComplete.event;
    this._onTitleChanged = this._register(new Emitter());
    this.onTitleChanged = this._onTitleChanged.event;
    this._onIconChanged = this._register(new Emitter());
    this.onIconChanged = this._onIconChanged.event;
    this._onWillData = this._register(new Emitter());
    this.onWillData = this._onWillData.event;
    this._onData = this._register(new Emitter());
    this.onData = this._onData.event;
    this._onBinary = this._register(new Emitter());
    this.onBinary = this._onBinary.event;
    this._onRequestExtHostProcess = this._register(new Emitter());
    this.onRequestExtHostProcess = this._onRequestExtHostProcess.event;
    this._onDimensionsChanged = this._register(new Emitter());
    this.onDimensionsChanged = this._onDimensionsChanged.event;
    this._onMaximumDimensionsChanged = this._register(new Emitter());
    this.onMaximumDimensionsChanged = this._onMaximumDimensionsChanged.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidRequestFocus = this._register(new Emitter());
    this.onDidRequestFocus = this._onDidRequestFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onDidInputData = this._register(new Emitter());
    this.onDidInputData = this._onDidInputData.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onRequestAddInstanceToGroup = this._register(new Emitter());
    this.onRequestAddInstanceToGroup = this._onRequestAddInstanceToGroup.event;
    this._onDidChangeHasChildProcesses = this._register(new Emitter());
    this.onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
    this._onDidExecuteText = this._register(new Emitter());
    this.onDidExecuteText = this._onDidExecuteText.event;
    this._onDidChangeTarget = this._register(new Emitter());
    this.onDidChangeTarget = this._onDidChangeTarget.event;
    this._onDidSendText = this._register(new Emitter());
    this.onDidSendText = this._onDidSendText.event;
    this._onDidChangeShellType = this._register(new Emitter());
    this.onDidChangeShellType = this._onDidChangeShellType.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onLineData = this._register(new Emitter({
      onDidAddFirstListener: async () => (this.xterm ?? await this._xtermReadyPromise)?.raw.loadAddon(this._lineDataEventAddon)
    }));
    this.onLineData = this._onLineData.event;
    this.sessionId = generateUuid();
    this._isRemoteResolverTerminal = this._shellLaunchConfig[remoteResolverTerminal] === true;
    delete this._shellLaunchConfig[remoteResolverTerminal];
    this._wrapperElement = document.createElement("div");
    this._wrapperElement.classList.add("terminal-wrapper");
    this._widgetManager = this._register(instantiationService.createInstance(TerminalWidgetManager));
    this._isExiting = false;
    this._isDisposing = false;
    this._hadFocusOnExit = false;
    this._isVisible = false;
    this._instanceId = TerminalInstance._instanceIdCounter++;
    this._fixedRows = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.rows;
    this._fixedCols = _shellLaunchConfig.attachPersistentProcess?.fixedDimensions?.cols;
    this._shellLaunchConfig.shellIntegrationEnvironmentReporting = this._configurationService.getValue("terminal.integrated.shellIntegration.environmentReporting" /* ShellIntegrationEnvironmentReporting */);
    this._resource = getTerminalUri(this._workspaceContextService.getWorkspace().id, this.instanceId, this.title);
    if (this._shellLaunchConfig.attachPersistentProcess?.hideFromUser) {
      this._shellLaunchConfig.hideFromUser = this._shellLaunchConfig.attachPersistentProcess.hideFromUser;
    }
    if (this._shellLaunchConfig.attachPersistentProcess?.isFeatureTerminal) {
      this._shellLaunchConfig.isFeatureTerminal = this._shellLaunchConfig.attachPersistentProcess.isFeatureTerminal;
    }
    if (this._shellLaunchConfig.attachPersistentProcess?.type) {
      this._shellLaunchConfig.type = this._shellLaunchConfig.attachPersistentProcess.type;
    }
    if (this._shellLaunchConfig.attachPersistentProcess?.tabActions) {
      this._shellLaunchConfig.tabActions = this._shellLaunchConfig.attachPersistentProcess.tabActions;
    }
    if (this.shellLaunchConfig.cwd) {
      const cwdUri = isString(this._shellLaunchConfig.cwd) ? URI.from({
        scheme: Schemas.file,
        path: this._shellLaunchConfig.cwd
      }) : this._shellLaunchConfig.cwd;
      if (cwdUri) {
        this._workspaceFolder = this._workspaceContextService.getWorkspaceFolder(cwdUri) ?? void 0;
      }
    }
    if (!this._workspaceFolder) {
      const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
      this._workspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    }
    const scopedContextKeyService = this._register(_contextKeyService.createScoped(this._wrapperElement));
    this._scopedContextKeyService = scopedContextKeyService;
    this._scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, scopedContextKeyService]
    )));
    this._terminalFocusContextKey = TerminalContextKeys.focus.bindTo(scopedContextKeyService);
    this._terminalHasFixedWidth = TerminalContextKeys.terminalHasFixedWidth.bindTo(scopedContextKeyService);
    this._terminalHasTextContextKey = TerminalContextKeys.textSelected.bindTo(this._contextKeyService);
    this._terminalAltBufferActiveContextKey = TerminalContextKeys.altBufferActive.bindTo(scopedContextKeyService);
    this._terminalShellIntegrationEnabledContextKey = TerminalContextKeys.terminalShellIntegrationEnabled.bindTo(scopedContextKeyService);
    this._logService.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this._shellLaunchConfig);
    this._register(this.capabilities.onDidAddCapability((e) => this._logService.debug("terminalInstance added capability", e.id)));
    this._register(this.capabilities.onDidRemoveCapability((e) => this._logService.debug("terminalInstance removed capability", e.id)));
    const capabilityListeners = this._register(new DisposableMap());
    this._register(this.capabilities.onDidAddCapability((e) => {
      capabilityListeners.get(e.id)?.dispose();
      const refreshInfo = () => {
        this._labelComputer?.refreshLabel(this);
        this._refreshShellIntegrationInfoStatus(this);
      };
      switch (e.id) {
        case 0 /* CwdDetection */: {
          capabilityListeners.set(e.id, e.capability.onDidChangeCwd((e2) => {
            this._cwd = e2;
            this._setTitle(this.title, 3 /* Config */);
          }));
          break;
        }
        case 2 /* CommandDetection */: {
          e.capability.promptInputModel.setShellType(this.shellType);
          const store = new DisposableStore();
          store.add(Event2.any(
            e.capability.promptInputModel.onDidStartInput,
            e.capability.promptInputModel.onDidChangeInput,
            e.capability.promptInputModel.onDidFinishInput
          )(refreshInfo));
          store.add(e.capability.onCommandExecuted(async (command4) => {
            if (!command4.id && command4.command) {
              const commandId = generateUuid();
              this.xterm?.shellIntegration.setNextCommandId(command4.command, commandId);
              await this._processManager.setNextCommandId(command4.command, commandId);
            }
          }));
          capabilityListeners.set(e.id, store);
          break;
        }
        case 6 /* PromptTypeDetection */: {
          capabilityListeners.set(e.id, e.capability.onPromptTypeChanged(refreshInfo));
          break;
        }
      }
    }));
    this._register(this.onDidChangeShellType(() => this._refreshShellIntegrationInfoStatus(this)));
    this._register(this.capabilities.onDidRemoveCapability((e) => {
      capabilityListeners.get(e.id)?.dispose();
    }));
    if (!this.shellLaunchConfig.executable && !this._workbenchEnvironmentService.remoteAuthority) {
      this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, OS);
    }
    this._icon = _shellLaunchConfig.attachPersistentProcess?.icon || _shellLaunchConfig.icon;
    if (this.shellLaunchConfig.customPtyImplementation && !this._shellLaunchConfig.titleTemplate) {
      this._setTitle(this._shellLaunchConfig.name, 0 /* Api */);
    }
    this.statusList = this._register(this._scopedInstantiationService.createInstance(TerminalStatusList));
    this._initDimensions();
    this._processManager = this._createProcessManager();
    this._containerReadyBarrier = new AutoOpenBarrier(100 /* WaitForContainerThreshold */);
    this._attachBarrier = new AutoOpenBarrier(1e3);
    this._xtermReadyPromise = this._createXterm();
    this._xtermReadyPromise.then(async () => {
      await this._containerReadyBarrier.wait();
      let os;
      if (!this.shellLaunchConfig.customPtyImplementation && this._terminalConfigurationService.config.shellIntegration?.enabled && !this.shellLaunchConfig.executable) {
        os = await this._processManager.getBackendOS();
        const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({ remoteAuthority: this.remoteAuthority, os });
        this.shellLaunchConfig.executable = defaultProfile.path;
        this.shellLaunchConfig.args = defaultProfile.args;
        this.shellLaunchConfig.icon ??= defaultProfile.icon;
        this.shellLaunchConfig.color ??= defaultProfile.color;
        this.shellLaunchConfig.env ??= defaultProfile.env;
      }
      if (os && this.shellLaunchConfig.executable) {
        this.setShellType(guessShellTypeFromExecutable(os, this.shellLaunchConfig.executable));
      }
      await this._createProcess();
      if (this.shellLaunchConfig.attachPersistentProcess) {
        this._cwd = this.shellLaunchConfig.attachPersistentProcess.cwd;
        this._setTitle(this.shellLaunchConfig.attachPersistentProcess.title, this.shellLaunchConfig.attachPersistentProcess.titleSource);
        this.setShellType(this.shellType);
      }
      if (this._fixedCols) {
        await this._addScrollbar();
      }
    }).catch((err) => {
      if (!this.isDisposed) {
        throw err;
      }
    });
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("accessibility.verbosity.terminal" /* Terminal */)) {
        this._setAriaLabel(this.xterm?.raw, this._instanceId, this.title);
      }
      if (e.affectsConfiguration("terminal.integrated")) {
        this.updateConfig();
        this.setVisible(this._isVisible);
      }
      const layoutSettings = [
        "terminal.integrated.fontSize" /* FontSize */,
        "terminal.integrated.fontFamily" /* FontFamily */,
        "terminal.integrated.fontWeight" /* FontWeight */,
        "terminal.integrated.fontWeightBold" /* FontWeightBold */,
        "terminal.integrated.letterSpacing" /* LetterSpacing */,
        "terminal.integrated.lineHeight" /* LineHeight */,
        "editor.fontFamily"
      ];
      if (layoutSettings.some((id2) => e.affectsConfiguration(id2))) {
        this._layoutSettingsChanged = true;
        await this._resize();
      }
      if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* UnicodeVersion */)) {
        this._updateUnicodeVersion();
      }
      if (e.affectsConfiguration("editor.accessibilitySupport")) {
        this.updateAccessibilitySupport();
      }
      if (e.affectsConfiguration("terminal.integrated.tabs.title" /* TerminalTitle */) || e.affectsConfiguration("terminal.integrated.tabs.separator" /* TerminalTitleSeparator */) || e.affectsConfiguration("terminal.integrated.tabs.description" /* TerminalDescription */)) {
        this._labelComputer?.refreshLabel(this);
      }
    }));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => this._labelComputer?.refreshLabel(this)));
    let initialDataEventsTimeout = getWindow(this._container).setTimeout(() => {
      initialDataEventsTimeout = void 0;
      this._initialDataEvents = void 0;
      this._initialDataEventsListener.clear();
    }, 1e4);
    this._register(toDisposable(() => {
      if (initialDataEventsTimeout) {
        getWindow(this._container).clearTimeout(initialDataEventsTimeout);
      }
    }));
    const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
    for (const desc of contributionDescs) {
      if (this._contributions.has(desc.id)) {
        onUnexpectedError(new Error(`Cannot have two terminal contributions with the same id ${desc.id}`));
        continue;
      }
      let contribution;
      try {
        contribution = this._register(this._scopedInstantiationService.createInstance(desc.ctor, {
          instance: this,
          processManager: this._processManager,
          widgetManager: this._widgetManager
        }));
        this._contributions.set(desc.id, contribution);
      } catch (err) {
        onUnexpectedError(err);
      }
      this._xtermReadyPromise.then((xterm) => {
        if (xterm) {
          contribution.xtermReady?.(xterm);
        }
      });
      this._register(this.onWillDispose(() => {
        contribution.dispose();
        this._contributions.delete(desc.id);
      }));
    }
  }
  static {
    this._instanceIdCounter = 1;
  }
  get xtermReadyPromise() {
    return this._xtermReadyPromise;
  }
  get domElement() {
    return this._wrapperElement;
  }
  get usedShellIntegrationInjection() {
    return this._usedShellIntegrationInjection;
  }
  get shellIntegrationInjectionFailureReason() {
    return this._shellIntegrationInjectionInfo;
  }
  get store() {
    return this._store;
  }
  get extEnvironmentVariableCollection() {
    return this._processManager.extEnvironmentVariableCollection;
  }
  get waitOnExit() {
    return this._shellLaunchConfig.attachPersistentProcess?.waitOnExit || this._shellLaunchConfig.waitOnExit;
  }
  set waitOnExit(value2) {
    this._shellLaunchConfig.waitOnExit = value2;
  }
  get isVisible() {
    return this._isVisible;
  }
  get targetRef() {
    return this._targetRef;
  }
  get target() {
    return this._targetRef.object;
  }
  set target(value2) {
    this._targetRef.object = value2;
    this._onDidChangeTarget.fire(value2);
  }
  get instanceId() {
    return this._instanceId;
  }
  get resource() {
    return this._resource;
  }
  get cols() {
    if (this._fixedCols !== void 0) {
      return this._fixedCols;
    }
    if (this._dimensionsOverride && this._dimensionsOverride.cols) {
      if (this._dimensionsOverride.forceExactSize) {
        return this._dimensionsOverride.cols;
      }
      return Math.min(Math.max(this._dimensionsOverride.cols, 2), this._cols);
    }
    return this._cols;
  }
  get rows() {
    if (this._fixedRows !== void 0) {
      return this._fixedRows;
    }
    if (this._dimensionsOverride && this._dimensionsOverride.rows) {
      if (this._dimensionsOverride.forceExactSize) {
        return this._dimensionsOverride.rows;
      }
      return Math.min(Math.max(this._dimensionsOverride.rows, 2), this._rows);
    }
    return this._rows;
  }
  get isDisposed() {
    return this._store.isDisposed;
  }
  get fixedCols() {
    return this._fixedCols;
  }
  get fixedRows() {
    return this._fixedRows;
  }
  get maxCols() {
    return this._cols;
  }
  get maxRows() {
    return this._rows;
  }
  // TODO: Ideally processId would be merged into processReady
  get processId() {
    return this._processManager.shellProcessId;
  }
  // TODO: How does this work with detached processes?
  // TODO: Should this be an event as it can fire twice?
  get processReady() {
    return this._processManager.ptyProcessReady;
  }
  get hasChildProcesses() {
    return this.shellLaunchConfig.attachPersistentProcess?.hasChildProcesses || this._processManager.hasChildProcesses;
  }
  get reconnectionProperties() {
    return this.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties || this.shellLaunchConfig.reconnectionProperties;
  }
  get areLinksReady() {
    return this._areLinksReady;
  }
  get initialDataEvents() {
    return this._initialDataEvents;
  }
  get exitCode() {
    return this._exitCode;
  }
  get exitReason() {
    return this._exitReason;
  }
  get hadFocusOnExit() {
    return this._hadFocusOnExit;
  }
  get isTitleSetByProcess() {
    return !!this._messageTitleDisposable.value;
  }
  get shellLaunchConfig() {
    return this._shellLaunchConfig;
  }
  get shellType() {
    return this._shellType;
  }
  get os() {
    return this._processManager.os;
  }
  get hasRemoteAuthority() {
    return this._processManager.remoteAuthority !== void 0;
  }
  get remoteAuthority() {
    return this._processManager.remoteAuthority;
  }
  get hasFocus() {
    return isAncestorOfActiveElement(this._wrapperElement);
  }
  get title() {
    return this._title;
  }
  get titleSource() {
    return this._titleSource;
  }
  get icon() {
    return this._getIcon();
  }
  get color() {
    return this._getColor();
  }
  get processName() {
    return this._processName;
  }
  get sequence() {
    return this._sequence;
  }
  get staticTitle() {
    return this._staticTitle;
  }
  get progressState() {
    return this.xterm?.progressState;
  }
  get workspaceFolder() {
    return this._workspaceFolder;
  }
  get cwd() {
    return this._cwd;
  }
  get initialCwd() {
    return this._initialCwd;
  }
  get description() {
    if (this._description) {
      return this._description;
    }
    const type = this.shellLaunchConfig.attachPersistentProcess?.type || this.shellLaunchConfig.type;
    switch (type) {
      case "Task":
        return terminalStrings.typeTask;
      case "Local":
        return terminalStrings.typeLocal;
      default:
        return void 0;
    }
  }
  get userHome() {
    return this._userHome;
  }
  get shellIntegrationNonce() {
    return this._processManager.shellIntegrationNonce;
  }
  get injectedArgs() {
    return this._injectedArgs;
  }
  getContribution(id2) {
    return this._contributions.get(id2);
  }
  async _handleOnData(data) {
    await this._processManager.write(data);
    this._onDidInputData.fire(data);
  }
  _getIcon() {
    if (!this._icon) {
      this._icon = this._processManager.processState >= 2 /* Launching */ ? getIconRegistry().getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon" /* TabsDefaultIcon */)) : void 0;
    }
    return this._icon;
  }
  _getColor() {
    if (this.shellLaunchConfig.color) {
      return this.shellLaunchConfig.color;
    }
    if (this.shellLaunchConfig?.attachPersistentProcess?.color) {
      return this.shellLaunchConfig.attachPersistentProcess.color;
    }
    if (this._processManager.processState >= 2 /* Launching */) {
      return void 0;
    }
    return void 0;
  }
  _initDimensions() {
    if (!this._container) {
      this._cols = 80 /* DefaultCols */;
      this._rows = 30 /* DefaultRows */;
      return;
    }
    const computedStyle = getWindow(this._container).getComputedStyle(this._container);
    const width2 = parseInt(computedStyle.width);
    const height = parseInt(computedStyle.height);
    this._evaluateColsAndRows(width2, height);
  }
  /**
   * Evaluates and sets the cols and rows of the terminal if possible.
   * @param width The width of the container.
   * @param height The height of the container.
   * @return The terminal's width if it requires a layout.
   */
  _evaluateColsAndRows(width2, height) {
    if (!width2 || !height) {
      this._setLastKnownColsAndRows();
      return null;
    }
    const dimension = this._getDimension(width2, height);
    if (!dimension) {
      this._setLastKnownColsAndRows();
      return null;
    }
    const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(getWindow(this.domElement));
    const newRC = getXtermScaledDimensions(getWindow(this.domElement), font, dimension.width, dimension.height);
    if (!newRC) {
      this._setLastKnownColsAndRows();
      return null;
    }
    if (this._cols !== newRC.cols || this._rows !== newRC.rows) {
      this._cols = newRC.cols;
      this._rows = newRC.rows;
      this._fireMaximumDimensionsChanged();
    }
    return dimension.width;
  }
  _setLastKnownColsAndRows() {
    if (TerminalInstance._lastKnownGridDimensions) {
      this._cols = TerminalInstance._lastKnownGridDimensions.cols;
      this._rows = TerminalInstance._lastKnownGridDimensions.rows;
    }
  }
  _fireMaximumDimensionsChanged() {
    this._onMaximumDimensionsChanged.fire();
  }
  _getDimension(width2, height) {
    const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(getWindow(this.domElement));
    if (!font || !font.charWidth || !font.charHeight) {
      return void 0;
    }
    if (!this.xterm?.raw.element) {
      return void 0;
    }
    const computedStyle = getWindow(this.xterm.raw.element).getComputedStyle(this.xterm.raw.element);
    const horizontalPadding = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight) + this.xterm.scrollbarWidth;
    const verticalPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
    TerminalInstance._lastKnownCanvasDimensions = new Dimension(
      Math.min(4096 /* MaxCanvasWidth */, width2 - horizontalPadding),
      height - verticalPadding + (this._hasScrollBar && this._horizontalScrollbar ? -5 : 0)
    );
    return TerminalInstance._lastKnownCanvasDimensions;
  }
  get persistentProcessId() {
    return this._processManager.persistentProcessId;
  }
  get shouldPersist() {
    return this._processManager.shouldPersist && !this.shellLaunchConfig.isTransient && (!this.reconnectionProperties || this._configurationService.getValue("task.reconnection") === true);
  }
  static getXtermConstructor(keybindingService, contextKeyService) {
    const keybinding = keybindingService.lookupKeybinding(TerminalContribCommandId.A11yFocusAccessibleBuffer, contextKeyService);
    if (xtermConstructor) {
      return xtermConstructor;
    }
    xtermConstructor = Promises.withAsyncBody(async (resolve3) => {
      const Terminal = (await importAMDNodeModule("@xterm/xterm", "lib/xterm.js")).Terminal;
      Terminal.strings.promptLabel = localize(20014, null);
      Terminal.strings.tooMuchOutput = keybinding ? localize(20015, null, keybinding.getLabel()) : localize(20016, null);
      resolve3(Terminal);
    });
    return xtermConstructor;
  }
  /**
   * Create xterm.js instance and attach data listeners.
   */
  async _createXterm() {
    const Terminal = await TerminalInstance.getXtermConstructor(this._keybindingService, this._contextKeyService);
    if (this.isDisposed) {
      return void 0;
    }
    const disableShellIntegrationReporting = this.shellLaunchConfig.executable === void 0 || this.shellType === void 0 || !shellIntegrationSupportedShellTypes.includes(this.shellType);
    const xterm = this._scopedInstantiationService.createInstance(XtermTerminal, this._resource, Terminal, {
      cols: this._cols,
      rows: this._rows,
      xtermColorProvider: this._scopedInstantiationService.createInstance(TerminalInstanceColorProvider, this._targetRef),
      capabilities: this.capabilities,
      shellIntegrationNonce: this._processManager.shellIntegrationNonce,
      disableShellIntegrationReporting
    }, this.onDidExecuteText);
    this.xterm = xterm;
    this._resizeDebouncer = this._register(new TerminalResizeDebouncer(
      () => this._isVisible,
      () => xterm,
      async (cols, rows) => {
        if (this.isDisposed) {
          return;
        }
        xterm.resize(cols, rows);
        await this._updatePtyDimensions(xterm.raw);
      },
      async (cols) => {
        if (this.isDisposed) {
          return;
        }
        xterm.resize(cols, xterm.raw.rows);
        await this._updatePtyDimensions(xterm.raw);
      },
      async (rows) => {
        if (this.isDisposed) {
          return;
        }
        xterm.resize(xterm.raw.cols, rows);
        await this._updatePtyDimensions(xterm.raw);
      }
    ));
    this._register(toDisposable(() => this._resizeDebouncer = void 0));
    this.updateAccessibilitySupport();
    this._register(this.xterm.onDidRequestRunCommand((e) => {
      this.sendText(e.command.command, e.noNewLine ? false : true);
    }));
    this._register(this.xterm.onDidRequestRefreshDimensions(() => {
      if (this._lastLayoutDimensions) {
        this.layout(this._lastLayoutDimensions);
      }
    }));
    const initialTextWrittenPromise = this._shellLaunchConfig.initialText ? new Promise((r2) => this._writeInitialText(xterm, r2)) : void 0;
    const lineDataEventAddon = this._register(new LineDataEventAddon(initialTextWrittenPromise));
    this._register(lineDataEventAddon.onLineData((e) => this._onLineData.fire(e)));
    this._lineDataEventAddon = lineDataEventAddon;
    disposableTimeout(() => {
      this._register(xterm.raw.onBell(() => {
        if (this._configurationService.getValue("terminal.integrated.enableBell" /* EnableBell */) || this._configurationService.getValue("terminal.integrated.enableVisualBell" /* EnableVisualBell */)) {
          this.statusList.add({
            id: "bell" /* Bell */,
            severity: Severity2.Warning,
            icon: Codicon.bell,
            tooltip: localize(19998, null)
          }, this._terminalConfigurationService.config.bellDuration);
        }
        this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalBell);
      }));
    }, 1e3, this._store);
    this._register(xterm.raw.onSelectionChange(() => this._onDidChangeSelection.fire(this)));
    this._register(xterm.raw.buffer.onBufferChange(() => this._refreshAltBufferContextKey()));
    this._register(this._processManager.onProcessData((e) => this._onProcessData(e)));
    this._register(xterm.raw.onData(async (data) => {
      await this._handleOnData(data);
    }));
    this._register(xterm.raw.onBinary((data) => this._processManager.processBinary(data)));
    this._register(this._processManager.onProcessReady(async (processTraits) => {
      if (processTraits?.windowsPty?.backend === "conpty") {
        this._register(xterm.raw.parser.registerCsiHandler({ final: "c" }, (params) => {
          if (params.length === 0 || params.length === 1 && params[0] === 0) {
            this._handleOnData("\x1B[?61;4c");
            return true;
          }
          return false;
        }));
      }
      if (this._processManager.os) {
        lineDataEventAddon.setOperatingSystem(this._processManager.os);
      }
      xterm.raw.options.windowsPty = processTraits.windowsPty;
      xterm.raw.options.reflowCursorLine = processTraits?.windowsPty?.backend === "conpty" && !!this._terminalConfigurationService.config.windowsUseConptyDll;
    }));
    this._register(this._processManager.onRestoreCommands((e) => this.xterm?.shellIntegration.deserialize(e)));
    this._register(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
      if (views.some((v2) => v2.id === TERMINAL_VIEW_ID)) {
        xterm.refresh();
      }
    }));
    this._register(xterm.onDidChangeProgress(() => this._labelComputer?.refreshLabel(this)));
    this._register(Event2.runAndSubscribe(xterm.shellIntegration.onDidChangeSeenSequences, () => {
      if (xterm.shellIntegration.seenSequences.size > 0) {
        this._refreshShellIntegrationInfoStatus(this);
      }
    }));
    if (!this.capabilities.has(0 /* CwdDetection */)) {
      let onKeyListener = xterm.raw.onKey((e) => {
        const event = new StandardKeyboardEvent(e.domEvent);
        if (event.equals(3 /* Enter */)) {
          this._updateProcessCwd();
        }
      });
      this._register(this.capabilities.onDidAddCwdDetectionCapability(() => {
        onKeyListener?.dispose();
        onKeyListener = void 0;
      }));
    }
    if (this.xterm?.shellIntegration) {
      this.capabilities.add(this.xterm.shellIntegration.capabilities);
    }
    this._pathService.userHome().then((userHome) => {
      this._userHome = userHome.fsPath;
    });
    if (this._isVisible) {
      this._open();
    }
    return xterm;
  }
  _refreshShellIntegrationInfoStatus(instance2) {
    if (!instance2.xterm) {
      return;
    }
    const cmdDetectionType = instance2.capabilities.get(2 /* CommandDetection */)?.hasRichCommandDetection ? localize(20013, null) : instance2.capabilities.has(2 /* CommandDetection */) ? localize(20008, null) : instance2.usedShellIntegrationInjection ? localize(20009, null) : localize(20011, null);
    const detailedAdditions = [];
    if (instance2.shellType) {
      detailedAdditions.push(`Shell type: \`${instance2.shellType}\``);
    }
    const cwd2 = instance2.cwd;
    if (cwd2) {
      detailedAdditions.push(`Current working directory: \`${cwd2}\``);
    }
    const seenSequences = Array.from(instance2.xterm.shellIntegration.seenSequences);
    if (seenSequences.length > 0) {
      detailedAdditions.push(`Seen sequences: ${seenSequences.map((e) => `\`${e}\``).join(", ")}`);
    }
    const promptType = instance2.capabilities.get(6 /* PromptTypeDetection */)?.promptType;
    if (promptType) {
      detailedAdditions.push(`Prompt type: \`${promptType}\``);
    }
    const combinedString = instance2.capabilities.get(2 /* CommandDetection */)?.promptInputModel.getCombinedString();
    if (combinedString !== void 0) {
      detailedAdditions.push(`Prompt input: \`\`\`${combinedString}\`\`\``);
    }
    const detailedAdditionsString = detailedAdditions.length > 0 ? "\n\n" + detailedAdditions.map((e) => `- ${e}`).join("\n") : "";
    instance2.statusList.add({
      id: "shell-integration-info" /* ShellIntegrationInfo */,
      severity: Severity2.Info,
      tooltip: `${localize(20007, null)}: ${cmdDetectionType}`,
      detailedTooltip: `${localize(20007, null)}: ${cmdDetectionType}${detailedAdditionsString}`
    });
  }
  async runCommand(commandLine, shouldExecute, commandId, forceBracketedPasteMode, commandLineForMetadata) {
    let commandDetection = this.capabilities.get(2 /* CommandDetection */);
    const siInjectionEnabled = this._configurationService.getValue("terminal.integrated.shellIntegration.enabled" /* ShellIntegrationEnabled */) === true;
    const timeoutMs = getShellIntegrationTimeout(
      this._configurationService,
      siInjectionEnabled,
      this.hasRemoteAuthority,
      this._processManager.processReadyTimestamp
    );
    if (!commandDetection || commandDetection.promptInputModel.state !== 1 /* Input */) {
      const store = new DisposableStore();
      await Promise.race([
        new Promise((r2) => {
          const waitForPromptInput = (capability) => {
            commandDetection = capability;
            if (capability.promptInputModel.state === 1 /* Input */) {
              r2();
            } else {
              store.add(capability.promptInputModel.onDidStartInput(() => {
                r2();
              }));
            }
          };
          if (commandDetection) {
            waitForPromptInput(commandDetection);
          } else {
            store.add(this.capabilities.onDidAddCommandDetectionCapability(waitForPromptInput));
          }
        }),
        timeout(timeoutMs)
      ]);
      store.dispose();
    }
    if (commandId && commandDetection) {
      const commandLineToReport = commandLineForMetadata ?? commandLine;
      this.xterm?.shellIntegration.setNextCommandId(commandLineToReport, commandId);
      await this._processManager.setNextCommandId(commandLineToReport, commandId);
    }
    if (shouldExecute && (!commandDetection || commandDetection.promptInputModel.value.length > 0)) {
      await this.sendText("", false);
      await timeout(100);
    }
    await this.sendText(commandLine, shouldExecute, !shouldExecute || forceBracketedPasteMode);
  }
  detachFromElement() {
    this._wrapperElement.remove();
    this._container = void 0;
  }
  attachToElement(container3) {
    if (this._container === container3) {
      return;
    }
    if (!this._attachBarrier.isOpen()) {
      this._attachBarrier.open();
    }
    this._container = container3;
    this._container.appendChild(this._wrapperElement);
    if (this.xterm?.raw.element) {
      this.xterm.raw.open(this.xterm.raw.element);
    }
    this.xterm?.refresh();
    setTimeout(() => {
      if (this._store.isDisposed) {
        return;
      }
      this._initDragAndDrop(container3);
    }, 0);
  }
  /**
   * Opens the terminal instance inside the parent DOM element previously set with
   * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
   * invoking this function as it performs some DOM calculations internally
   */
  _open() {
    if (!this.xterm || this.xterm.raw.element) {
      return;
    }
    if (!this._container || !this._container.isConnected) {
      throw new Error("A container element needs to be set with `attachToElement` and be part of the DOM before calling `_open`");
    }
    const xtermHost = document.createElement("div");
    xtermHost.classList.add("terminal-xterm-host");
    this._wrapperElement.appendChild(xtermHost);
    this._container.appendChild(this._wrapperElement);
    const xterm = this.xterm;
    this._wrapperElement.xterm = xterm.raw;
    const screenElement = xterm.attachToElement(xtermHost);
    for (const contribution of this._contributions.values()) {
      if (!this.xterm) {
        this._xtermReadyPromise.then((xterm2) => {
          if (xterm2) {
            contribution.xtermOpen?.(xterm2);
          }
        });
      } else {
        contribution.xtermOpen?.(this.xterm);
      }
    }
    this._register(xterm.shellIntegration.onDidChangeStatus(() => {
      if (this.hasFocus) {
        this._setShellIntegrationContextKey();
      } else {
        this._terminalShellIntegrationEnabledContextKey.reset();
      }
    }));
    if (!xterm.raw.element || !xterm.raw.textarea) {
      throw new Error("xterm elements not set after open");
    }
    this._setAriaLabel(xterm.raw, this._instanceId, this._title);
    xterm.raw.attachCustomKeyEventHandler((event) => {
      if (this._isExiting) {
        return false;
      }
      const standardKeyboardEvent = new StandardKeyboardEvent(event);
      const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
      const isValidChord = resolveResult.kind === 1 /* MoreChordsNeeded */ && this._terminalConfigurationService.config.allowChords && event.key !== "Escape";
      if (this._keybindingService.inChordMode || isValidChord) {
        event.preventDefault();
        return false;
      }
      if (!this._terminalConfigurationService.config.sendKeybindingsToShell && resolveResult.kind === 2 /* KbFound */ && resolveResult.commandId && (event.metaKey || this._terminalConfigurationService.shouldCommandSkipShell(resolveResult.commandId))) {
        event.preventDefault();
        return false;
      }
      if (this._terminalConfigurationService.config.allowMnemonics && !isMacintosh && event.altKey) {
        return false;
      }
      if (TabFocus.getTabFocusMode() && event.key === "Tab") {
        return false;
      }
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        return true;
      }
      if (isWindows && event.altKey && event.key === "F4" && !event.ctrlKey) {
        return false;
      }
      if (!BrowserFeatures.clipboard.readText && event.key === "v" && event.ctrlKey) {
        return false;
      }
      return true;
    });
    this._register(addDisposableListener(xterm.raw.element, "mousedown", () => {
      const listener = addDisposableListener(xterm.raw.element.ownerDocument, "mouseup", () => {
        setTimeout(() => this._refreshSelectionContextKey(), 0);
        listener.dispose();
      });
    }));
    this._register(addDisposableListener(xterm.raw.element, "touchstart", () => {
      xterm.raw.focus();
    }));
    this._register(addDisposableListener(xterm.raw.element, "keyup", () => {
      setTimeout(() => this._refreshSelectionContextKey(), 0);
    }));
    this._register(addDisposableListener(xterm.raw.textarea, "focus", () => this._setFocus(true)));
    this._register(addDisposableListener(xterm.raw.textarea, "blur", () => this._setFocus(false)));
    this._register(addDisposableListener(xterm.raw.textarea, "focusout", () => this._setFocus(false)));
    this._initDragAndDrop(this._container);
    this._widgetManager.attachToElement(screenElement);
    if (this._lastLayoutDimensions) {
      this.layout(this._lastLayoutDimensions);
    }
    this.updateConfig();
    if (xterm.raw.options.disableStdin) {
      this._attachPressAnyKeyToCloseListener(xterm.raw);
    }
  }
  _setFocus(focused) {
    if (focused) {
      this._terminalFocusContextKey.set(true);
      this._setShellIntegrationContextKey();
      this._onDidFocus.fire(this);
    } else {
      this.resetFocusContextKey();
      this._onDidBlur.fire(this);
      this._refreshSelectionContextKey();
    }
  }
  _setShellIntegrationContextKey() {
    if (this.xterm) {
      this._terminalShellIntegrationEnabledContextKey.set(this.xterm.shellIntegration.status === 2 /* VSCode */);
    }
  }
  resetFocusContextKey() {
    this._terminalFocusContextKey.reset();
    this._terminalShellIntegrationEnabledContextKey.reset();
  }
  _initDragAndDrop(container3) {
    const store = new DisposableStore();
    const dndController = store.add(this._scopedInstantiationService.createInstance(TerminalInstanceDragAndDropController, container3));
    store.add(dndController.onDropTerminal((e) => this._onRequestAddInstanceToGroup.fire(e)));
    store.add(dndController.onDropFile(async (path) => {
      this.focus();
      await this.sendPath(path, false);
    }));
    store.add(new DragAndDropObserver(container3, dndController));
    this._dndObserver.value = store;
  }
  hasSelection() {
    return this.xterm ? this.xterm.raw.hasSelection() : false;
  }
  get selection() {
    return this.xterm && this.hasSelection() ? this.xterm.raw.getSelection() : void 0;
  }
  clearSelection() {
    this.xterm?.raw.clearSelection();
  }
  _refreshAltBufferContextKey() {
    this._terminalAltBufferActiveContextKey.set(!!(this.xterm && this.xterm.raw.buffer.active === this.xterm.raw.buffer.alternate));
  }
  dispose(reason) {
    if (this.shellLaunchConfig.type === "Task" && reason === 2 /* Process */ && this._exitCode !== 0 && !this.shellLaunchConfig.waitOnExit) {
      return;
    }
    if (this.isDisposed) {
      return;
    }
    this._logService.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
    this._isDisposing = true;
    dispose(this._widgetManager);
    if (this.xterm?.raw.element) {
      this._hadFocusOnExit = this.hasFocus;
    }
    if (this._wrapperElement.xterm) {
      this._wrapperElement.xterm = void 0;
    }
    if (this._horizontalScrollbar) {
      this._horizontalScrollbar.dispose();
      this._horizontalScrollbar = void 0;
    }
    this._onWillDispose.fire(this);
    try {
      this.xterm?.dispose();
    } catch (err) {
      this._logService.error("Exception occurred during xterm disposal", err);
    }
    if (isFirefox2) {
      this.resetFocusContextKey();
      this._terminalHasTextContextKey.reset();
      this._onDidBlur.fire(this);
    }
    if (this._pressAnyKeyToCloseListener) {
      this._pressAnyKeyToCloseListener.dispose();
      this._pressAnyKeyToCloseListener = void 0;
    }
    if (this._exitReason === void 0) {
      this._exitReason = reason ?? 0 /* Unknown */;
    }
    this._resizeDebouncer?.dispose();
    this._resizeDebouncer = void 0;
    this._processManager.dispose();
    this._onProcessExit(void 0);
    this._onDisposed.fire(this);
    super.dispose();
  }
  async detachProcessAndDispose(reason) {
    await this._processManager.detachFromProcess(reason === 3 /* User */);
    this.dispose(reason);
  }
  focus(force) {
    this._refreshAltBufferContextKey();
    if (!this.xterm) {
      return;
    }
    if (force || !getActiveWindow().getSelection()?.toString()) {
      this.xterm.raw.focus();
      this._onDidRequestFocus.fire();
    }
  }
  async focusWhenReady(force) {
    await this._xtermReadyPromise;
    await this._attachBarrier.wait();
    this.focus(force);
  }
  async sendText(text2, shouldExecute, forceBracketedPasteMode) {
    if (forceBracketedPasteMode && this.xterm?.raw.modes.bracketedPasteMode) {
      text2 = `\x1B[200~${text2}\x1B[201~`;
    }
    text2 = text2.replace(/\r?\n/g, "\r");
    if (shouldExecute && !text2.endsWith("\r")) {
      text2 += "\r";
    }
    this._logService.debug("sending data (vscode)", text2);
    await this._processManager.write(text2);
    this._onDidInputData.fire(text2);
    this._onDidSendText.fire(text2);
    this.xterm?.scrollToBottom();
    if (shouldExecute) {
      this._onDidExecuteText.fire();
    }
  }
  async sendSignal(signal) {
    this._logService.debug("sending signal (vscode)", signal);
    await this._processManager.sendSignal(signal);
  }
  async sendPath(originalPath, shouldExecute) {
    return this.sendText(await this.preparePathForShell(originalPath), shouldExecute);
  }
  async preparePathForShell(originalPath) {
    await this.processReady;
    return preparePathForShell(originalPath, this.shellLaunchConfig.executable, this.title, this.shellType, this._processManager.backend, this._processManager.os);
  }
  async getUriLabelForShell(uri5) {
    await this.processReady;
    return getUriLabelForShell(uri5, this._processManager.backend, this.shellType, this.os);
  }
  setVisible(visible) {
    const didChange = this._isVisible !== visible;
    this._isVisible = visible;
    this._wrapperElement.classList.toggle("active", visible);
    if (visible && this.xterm) {
      this._open();
      this._resizeDebouncer?.flush();
      this._resize();
    }
    if (didChange) {
      this._onDidChangeVisibility.fire(visible);
    }
  }
  scrollDownLine() {
    this.xterm?.scrollDownLine();
  }
  scrollDownPage() {
    this.xterm?.scrollDownPage();
  }
  scrollToBottom() {
    this.xterm?.scrollToBottom();
  }
  scrollUpLine() {
    this.xterm?.scrollUpLine();
  }
  scrollUpPage() {
    this.xterm?.scrollUpPage();
  }
  scrollToTop() {
    this.xterm?.scrollToTop();
  }
  clearBuffer() {
    this._processManager.clearBuffer();
    this.xterm?.clearBuffer();
  }
  _refreshSelectionContextKey() {
    const isActive2 = !!this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    let isEditorActive = false;
    const editor = this._editorService.activeEditor;
    if (editor) {
      isEditorActive = editor instanceof TerminalEditorInput;
    }
    this._terminalHasTextContextKey.set((isActive2 || isEditorActive) && this.hasSelection());
  }
  _createProcessManager() {
    let deserializedCollections;
    if (this.shellLaunchConfig.attachPersistentProcess?.environmentVariableCollections) {
      deserializedCollections = deserializeEnvironmentVariableCollections(this.shellLaunchConfig.attachPersistentProcess.environmentVariableCollections);
    }
    const processManager = this._scopedInstantiationService.createInstance(
      TerminalProcessManager,
      this._instanceId,
      this.shellLaunchConfig?.cwd,
      deserializedCollections,
      this.shellLaunchConfig.shellIntegrationNonce ?? this.shellLaunchConfig.attachPersistentProcess?.shellIntegrationNonce
    );
    this.capabilities.add(processManager.capabilities);
    this._register(processManager.onProcessReady(async (e) => {
      this._onProcessIdReady.fire(this);
      this._initialCwd = await this.getInitialCwd();
      if (!this._labelComputer) {
        this._labelComputer = this._register(this._scopedInstantiationService.createInstance(TerminalLabelComputer));
        this._register(this._labelComputer.onDidChangeLabel((e2) => {
          const wasChanged = this._title !== e2.title || this._description !== e2.description;
          if (wasChanged) {
            this._title = e2.title;
            this._description = e2.description;
            this._onTitleChanged.fire(this);
          }
        }));
      }
      if (this._shellLaunchConfig.name && !this._shellLaunchConfig.titleTemplate) {
        this._setTitle(this._shellLaunchConfig.name, 0 /* Api */);
      } else {
        setTimeout(() => {
          this._xtermReadyPromise.then((xterm) => {
            if (xterm) {
              this._messageTitleDisposable.value = xterm.raw.onTitleChange((e2) => this._onTitleChange(e2));
            }
          });
        });
        if (this._shellLaunchConfig.titleTemplate && this._shellLaunchConfig.name) {
          this._setTitle(this._shellLaunchConfig.name, 1 /* Process */);
        } else {
          this._setTitle(this._shellLaunchConfig.executable, 1 /* Process */);
        }
      }
    }));
    this._register(processManager.onProcessExit((exitCode) => this._onProcessExit(exitCode)));
    this._register(processManager.onDidChangeProperty(({ type, value: value2 }) => {
      switch (type) {
        case "cwd" /* Cwd */:
          this._cwd = value2;
          this._labelComputer?.refreshLabel(this);
          break;
        case "initialCwd" /* InitialCwd */:
          this._initialCwd = value2;
          this._cwd = this._initialCwd;
          this._setTitle(this.title, 3 /* Config */);
          this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
          this._onIconChanged.fire({ instance: this, userInitiated: false });
          break;
        case "title" /* Title */:
          this._setTitle(value2 ?? "", 1 /* Process */);
          break;
        case "overrideDimensions" /* OverrideDimensions */:
          this.setOverrideDimensions(value2, true);
          break;
        case "resolvedShellLaunchConfig" /* ResolvedShellLaunchConfig */:
          this._setResolvedShellLaunchConfig(value2);
          break;
        case "shellType" /* ShellType */:
          this._handleShellTypeChange(value2);
          break;
        case "hasChildProcesses" /* HasChildProcesses */:
          this._onDidChangeHasChildProcesses.fire(value2);
          break;
        case "usedShellIntegrationInjection" /* UsedShellIntegrationInjection */:
          this._usedShellIntegrationInjection = true;
          break;
        case "shellIntegrationInjectionFailureReason" /* ShellIntegrationInjectionFailureReason */:
          this._shellIntegrationInjectionInfo = value2;
          break;
      }
    }));
    this._initialDataEventsListener.value = processManager.onProcessData((ev) => this._initialDataEvents?.push(ev.data));
    this._register(processManager.onProcessReplayComplete(() => this._onProcessReplayComplete.fire()));
    this._register(processManager.onEnvironmentVariableInfoChanged((e) => this._onEnvironmentVariableInfoChanged(e)));
    this._register(processManager.onPtyDisconnect(() => {
      if (this.xterm) {
        this.xterm.raw.options.disableStdin = true;
      }
      this.statusList.add({
        id: "disconnected" /* Disconnected */,
        severity: Severity2.Error,
        icon: Codicon.debugDisconnect,
        tooltip: localize(20000, null)
      });
    }));
    this._register(processManager.onPtyReconnect(() => {
      if (this.xterm) {
        this.xterm.raw.options.disableStdin = false;
      }
      this.statusList.remove("disconnected" /* Disconnected */);
    }));
    return processManager;
  }
  async _createProcess() {
    if (this.isDisposed) {
      return;
    }
    const trusted = this._isRemoteResolverTerminal || await this._trust();
    const isRemoteTerminal = !!this.remoteAuthority;
    if (!trusted && !(isRemoteTerminal && this._workbenchEnvironmentService.remoteAuthority)) {
      this._onProcessExit({ message: localize(20026, null) });
      return;
    } else if (this._workspaceContextService.getWorkspace().folders.length === 0 && this._cwd && this._userHome && normalizeDriveLetter(this._cwd) !== normalizeDriveLetter(this._userHome)) {
      this._onProcessExit({
        message: localize(20025, null, this._cwd, this._userHome)
      });
      return;
    }
    if (this._container && this._cols === 0 && this._rows === 0) {
      this._initDimensions();
      this.xterm?.resize(this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */);
    }
    const originalIcon = this.shellLaunchConfig.icon;
    await this._processManager.createProcess(this._shellLaunchConfig, this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */).then((result) => {
      if (result) {
        if (hasKey(result, { message: true })) {
          this._onProcessExit(result);
        } else if (hasKey(result, { injectedArgs: true })) {
          this._injectedArgs = result.injectedArgs;
        }
      }
    });
    if (this.isDisposed) {
      return;
    }
    if (originalIcon !== this.shellLaunchConfig.icon || this.shellLaunchConfig.color) {
      this._icon = this._shellLaunchConfig.attachPersistentProcess?.icon || this._shellLaunchConfig.icon;
      this._onIconChanged.fire({ instance: this, userInitiated: false });
    }
  }
  registerMarker(offset) {
    return this.xterm?.raw.registerMarker(offset);
  }
  addBufferMarker(properties) {
    this.capabilities.get(4 /* BufferMarkDetection */)?.addMark(properties);
  }
  scrollToMark(startMarkId, endMarkId, highlight) {
    this.xterm?.markTracker.scrollToClosestMarker(startMarkId, endMarkId, highlight);
  }
  async freePortKillProcess(port, command4) {
    await this._processManager?.freePortKillProcess(port);
    this.runCommand(command4, false);
  }
  _onProcessData(ev) {
    const leadingSegmentedData = [];
    const matches2 = ev.data.matchAll(/(?<seq>\x1b\][16]33;(?:C|D(?:;\d+)?)\x07)/g);
    let i2 = 0;
    for (const match2 of matches2) {
      if (match2.groups?.seq === void 0) {
        throw new BugIndicatingError("seq must be defined");
      }
      leadingSegmentedData.push(ev.data.substring(i2, match2.index));
      leadingSegmentedData.push(match2.groups?.seq ?? "");
      i2 = match2.index + match2[0].length;
    }
    const lastData = ev.data.substring(i2);
    for (let i3 = 0; i3 < leadingSegmentedData.length; i3++) {
      this._writeProcessData(leadingSegmentedData[i3]);
    }
    if (ev.trackCommit) {
      ev.writePromise = new Promise((r2) => this._writeProcessData(lastData, r2));
    } else {
      this._writeProcessData(lastData);
    }
  }
  _writeProcessData(data, cb) {
    this._onWillData.fire(data);
    const messageId = ++this._latestXtermWriteData;
    this.xterm?.raw.write(data, () => {
      this._latestXtermParseData = messageId;
      this._processManager.acknowledgeDataEvent(data.length);
      cb?.();
      this._onData.fire(data);
    });
  }
  /**
   * Called when either a process tied to a terminal has exited or when a terminal renderer
   * simulates a process exiting (e.g. custom execution task).
   * @param exitCode The exit code of the process, this is undefined when the terminal was exited
   * through user action.
   */
  async _onProcessExit(exitCodeOrError) {
    if (this._isExiting || this.isDisposed) {
      return;
    }
    const parsedExitResult = parseExitResult(exitCodeOrError, this.shellLaunchConfig, this._processManager.processState, this._initialCwd);
    if (this._usedShellIntegrationInjection && this._processManager.processState === 4 /* KilledDuringLaunch */ && parsedExitResult?.code !== 0) {
      this._relaunchWithShellIntegrationDisabled(parsedExitResult?.message);
      this._onExit.fire(exitCodeOrError);
      return;
    }
    this._isExiting = true;
    await this._flushXtermData();
    this._exitCode = parsedExitResult?.code;
    const exitMessage = parsedExitResult?.message;
    this._logService.debug("Terminal process exit", "instanceId", this.instanceId, "code", this._exitCode, "processState", this._processManager.processState);
    this._onExit.fire(exitCodeOrError);
    if (this.isDisposed) {
      return;
    }
    const waitOnExit = this.waitOnExit;
    if (waitOnExit && this._processManager.processState !== 5 /* KilledByUser */) {
      this._xtermReadyPromise.then((xterm) => {
        if (!xterm) {
          return;
        }
        if (exitMessage) {
          xterm.raw.write(formatMessageForTerminal(exitMessage));
        }
        switch (typeof waitOnExit) {
          case "string":
            xterm.raw.write(formatMessageForTerminal(waitOnExit, { excludeLeadingNewLine: true }));
            break;
          case "function":
            if (this.exitCode !== void 0) {
              xterm.raw.write(formatMessageForTerminal(waitOnExit(this.exitCode), { excludeLeadingNewLine: true }));
            }
            break;
        }
        xterm.raw.options.disableStdin = true;
        if (xterm.raw.textarea) {
          this._attachPressAnyKeyToCloseListener(xterm.raw);
        }
      });
    } else {
      if (exitMessage) {
        if (shouldShowTerminalExitNotification(
          this.shellLaunchConfig,
          this._processManager.processState,
          this._terminalConfigurationService.config.showExitAlert,
          this.xterm?.lastInputEvent
        )) {
          this._notificationService.notify({
            message: exitMessage,
            severity: Severity2.Error,
            actions: { primary: [this._scopedInstantiationService.createInstance(TerminalLaunchHelpAction)] }
          });
        } else {
          this._logService.warn(exitMessage);
        }
      }
      this.dispose(2 /* Process */);
    }
    if (this.isDisposed) {
      this._onExit.dispose();
    }
  }
  _relaunchWithShellIntegrationDisabled(exitMessage) {
    this._shellLaunchConfig.ignoreShellIntegration = true;
    this.relaunch();
    this.statusList.add({
      id: "shell-integration-attention-needed" /* ShellIntegrationAttentionNeeded */,
      severity: Severity2.Warning,
      icon: Codicon.warning,
      tooltip: `${exitMessage} ` + localize(20004, null),
      hoverActions: [{
        commandId: "workbench.action.terminal.learnMore" /* ShellIntegrationLearnMore */,
        label: localize(20010, null),
        run: () => {
          this._openerService.open("https://code.visualstudio.com/docs/terminal/shell-integration?referrer=in-product");
        }
      }, {
        commandId: "workbench.action.openSettings",
        label: localize(20012, null),
        run: () => {
          this._commandService.executeCommand("workbench.action.openSettings", "terminal.integrated.shellIntegration.enabled");
        }
      }]
    });
    this._telemetryService.publicLog2("terminal/shellIntegrationFailureProcessExit");
  }
  /**
   * Ensure write calls to xterm.js have finished before resolving.
   */
  _flushXtermData() {
    if (this._latestXtermWriteData === this._latestXtermParseData) {
      return Promise.resolve();
    }
    let retries = 0;
    return new Promise((r2) => {
      const interval = disposableWindowInterval(getActiveWindow().window, () => {
        if (this._latestXtermWriteData === this._latestXtermParseData || ++retries === 5) {
          interval.dispose();
          r2();
        }
      }, 20);
    });
  }
  _attachPressAnyKeyToCloseListener(xterm) {
    if (xterm.textarea && !this._pressAnyKeyToCloseListener) {
      this._pressAnyKeyToCloseListener = addDisposableListener(xterm.textarea, "keypress", (event) => {
        if (this._pressAnyKeyToCloseListener) {
          this._pressAnyKeyToCloseListener.dispose();
          this._pressAnyKeyToCloseListener = void 0;
          this.dispose(2 /* Process */);
          event.preventDefault();
        }
      });
    }
  }
  _writeInitialText(xterm, callback) {
    if (!this._shellLaunchConfig.initialText) {
      callback?.();
      return;
    }
    const text2 = isString(this._shellLaunchConfig.initialText) ? this._shellLaunchConfig.initialText : this._shellLaunchConfig.initialText?.text;
    if (isString(this._shellLaunchConfig.initialText)) {
      xterm.raw.writeln(text2, callback);
    } else {
      if (this._shellLaunchConfig.initialText.trailingNewLine) {
        xterm.raw.writeln(text2, callback);
      } else {
        xterm.raw.write(text2, callback);
      }
    }
  }
  async reuseTerminal(shell, reset2 = false) {
    this._pressAnyKeyToCloseListener?.dispose();
    this._pressAnyKeyToCloseListener = void 0;
    const xterm = this.xterm;
    if (xterm) {
      if (!reset2) {
        await new Promise((r2) => xterm.raw.write("\n\x1B[G", r2));
      }
      if (shell.initialText) {
        this._shellLaunchConfig.initialText = shell.initialText;
        await new Promise((r2) => this._writeInitialText(xterm, r2));
      }
      if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
        xterm.raw.options.disableStdin = false;
        this._isExiting = false;
      }
      if (reset2) {
        xterm.clearDecorations();
      }
    }
    this.statusList.remove("relaunch-needed" /* RelaunchNeeded */);
    if (!reset2) {
      shell.initialText = " ";
    }
    this._shellLaunchConfig = shell;
    this._agentShellTypeFromSequence = void 0;
    await this._processManager.relaunch(this._shellLaunchConfig, this._cols || 80 /* DefaultCols */, this._rows || 30 /* DefaultRows */, reset2).then((result) => {
      if (result) {
        if (hasKey(result, { message: true })) {
          this._onProcessExit(result);
        } else if (hasKey(result, { injectedArgs: true })) {
          this._injectedArgs = result.injectedArgs;
        }
      }
    });
  }
  relaunch() {
    const shellLaunchConfig = { ...this._shellLaunchConfig };
    delete shellLaunchConfig.attachPersistentProcess;
    this.reuseTerminal(shellLaunchConfig, true);
  }
  _onTitleChange(title) {
    if (this.isTitleSetByProcess) {
      this._setTitle(title, 2 /* Sequence */);
    }
    for (const [shellType, pattern] of agentCliTitlePatterns) {
      if (pattern.test(title)) {
        this._agentShellTypeFromSequence = shellType;
        this.setShellType(shellType);
        break;
      }
    }
  }
  _handleShellTypeChange(shellType) {
    if (this._agentShellTypeFromSequence) {
      if (shellType === "node" /* Node */ || shellType === void 0) {
        return;
      }
      this._agentShellTypeFromSequence = void 0;
    }
    this.setShellType(shellType);
  }
  async _trust() {
    if (this._configurationService.getValue("terminal.integrated.allowInUntrustedWorkspace" /* AllowInUntrustedWorkspace */)) {
      this._logService.info(`Workspace trust check bypassed due to ${"terminal.integrated.allowInUntrustedWorkspace" /* AllowInUntrustedWorkspace */}`);
      return true;
    }
    const trustRequest = await this._workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(20017, null)
    });
    return trustRequest === true;
  }
  async _updateProcessCwd() {
    if (this.isDisposed || this.shellLaunchConfig.customPtyImplementation) {
      return;
    }
    try {
      const cwd2 = await this._refreshProperty("cwd" /* Cwd */);
      if (!isString(cwd2)) {
        throw new Error(`cwd is not a string ${cwd2}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message === "Cannot refresh property when process is not set") {
        return;
      }
      throw e;
    }
  }
  updateConfig() {
    this._refreshEnvironmentVariableInfoWidgetState(this._processManager.environmentVariableInfo);
  }
  async _updateUnicodeVersion() {
    this._processManager.setUnicodeVersion(this._terminalConfigurationService.config.unicodeVersion);
  }
  updateAccessibilitySupport() {
    this.xterm.raw.options.screenReaderMode = this._accessibilityService.isScreenReaderOptimized();
  }
  layout(dimension) {
    this._lastLayoutDimensions = dimension;
    if (this.disableLayout) {
      return;
    }
    if (dimension.width <= 0 || dimension.height <= 0) {
      return;
    }
    const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
    if (!terminalWidth) {
      return;
    }
    this._resize();
    if (!this._containerReadyBarrier.isOpen()) {
      this._containerReadyBarrier.open();
    }
    for (const contribution of this._contributions.values()) {
      if (!this.xterm) {
        this._xtermReadyPromise.then((xterm) => {
          if (xterm) {
            contribution.layout?.(xterm, dimension);
          }
        });
      } else {
        contribution.layout?.(this.xterm, dimension);
      }
    }
  }
  async _resize(immediate) {
    if (!this.xterm || !this._resizeDebouncer || this.isDisposed || this._isDisposing) {
      return;
    }
    let cols = this.cols;
    let rows = this.rows;
    if (this._isVisible && this._layoutSettingsChanged) {
      const font = this.xterm.getFont();
      const config = this._terminalConfigurationService.config;
      this.xterm.raw.options.letterSpacing = font.letterSpacing;
      this.xterm.raw.options.lineHeight = font.lineHeight;
      this.xterm.raw.options.fontSize = font.fontSize;
      this.xterm.raw.options.fontFamily = font.fontFamily;
      this.xterm.raw.options.fontWeight = config.fontWeight;
      this.xterm.raw.options.fontWeightBold = config.fontWeightBold;
      this._initDimensions();
      cols = this.cols;
      rows = this.rows;
      this._layoutSettingsChanged = false;
    }
    if (isNaN(cols) || isNaN(rows)) {
      return;
    }
    if (cols !== this.xterm.raw.cols || rows !== this.xterm.raw.rows) {
      if (this._fixedRows || this._fixedCols) {
        await this._updateProperty("fixedDimensions" /* FixedDimensions */, { cols: this._fixedCols, rows: this._fixedRows });
      }
      this._onDimensionsChanged.fire();
    }
    TerminalInstance._lastKnownGridDimensions = { cols, rows };
    this._resizeDebouncer?.resize(cols, rows, immediate ?? false);
  }
  async _updatePtyDimensions(rawXterm) {
    if (this.isDisposed) {
      return;
    }
    const pixelWidth = rawXterm.dimensions?.css.canvas.width;
    const pixelHeight = rawXterm.dimensions?.css.canvas.height;
    const roundedPixelWidth = pixelWidth ? Math.round(pixelWidth) : void 0;
    const roundedPixelHeight = pixelHeight ? Math.round(pixelHeight) : void 0;
    await this._processManager.setDimensions(rawXterm.cols, rawXterm.rows, void 0, roundedPixelWidth, roundedPixelHeight);
  }
  setShellType(shellType) {
    if (this._shellType === shellType) {
      return;
    }
    this._shellType = shellType;
    if (shellType === void 0) {
      this._terminalShellTypeContextKey.reset();
    } else {
      this._terminalShellTypeContextKey.set(shellType?.toString());
    }
    this._onDidChangeShellType.fire(shellType);
    this._labelComputer?.refreshLabel(this);
  }
  _setAriaLabel(xterm, terminalId, title) {
    const labelParts = [];
    if (xterm && xterm.textarea) {
      if (title && title.length > 0) {
        labelParts.push(localize(20022, null, terminalId, title));
      } else {
        labelParts.push(localize(20021, null, terminalId));
      }
      const screenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
      if (!screenReaderOptimized) {
        labelParts.push(localize(20019, null));
      }
      const accessibilityHelpKeybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
      if (this._configurationService.getValue("accessibility.verbosity.terminal" /* Terminal */) && accessibilityHelpKeybinding) {
        labelParts.push(localize(20018, null, accessibilityHelpKeybinding));
      }
      xterm.textarea.setAttribute("aria-label", labelParts.join("\n"));
    }
  }
  _updateTitleProperties(title, eventSource) {
    if (title === void 0) {
      return this._processName;
    }
    switch (eventSource) {
      case 1 /* Process */:
        if (this._processManager.os === 1 /* Windows */) {
          title = win32.parse(title).name;
        } else {
          const firstSpaceIndex = title.indexOf(" ");
          if (title.startsWith("/")) {
            title = basename(title);
          } else if (firstSpaceIndex > -1) {
            title = title.substring(0, firstSpaceIndex);
          }
        }
        this._processName = title;
        break;
      case 0 /* Api */:
        this._staticTitle = title;
        this._messageTitleDisposable.value = void 0;
        break;
      case 2 /* Sequence */:
        this._sequence = title;
        if (this._processManager.os === 1 /* Windows */ && title.match(/^[a-zA-Z]:\\.+\.[a-zA-Z]{1,3}/)) {
          this._sequence = win32.parse(title).name;
        }
        break;
    }
    this._titleSource = eventSource;
    return title;
  }
  setOverrideDimensions(dimensions, immediate = false) {
    if (this._dimensionsOverride && this._dimensionsOverride.forceExactSize && !dimensions && this._rows === 0 && this._cols === 0) {
      this._cols = this._dimensionsOverride.cols;
      this._rows = this._dimensionsOverride.rows;
    }
    this._dimensionsOverride = dimensions;
    if (immediate) {
      this._resize(true);
    } else {
      this._resize();
    }
  }
  async setFixedDimensions() {
    const cols = await this._quickInputService.input({
      title: localize(20005, null),
      placeHolder: "Enter a number of columns or leave empty for automatic width",
      validateInput: async (text2) => text2.length > 0 && !text2.match(/^\d+$/) ? { content: "Enter a number or leave empty size automatically", severity: Severity2.Error } : void 0
    });
    if (cols === void 0) {
      return;
    }
    this._fixedCols = this._parseFixedDimension(cols);
    this._labelComputer?.refreshLabel(this);
    this._terminalHasFixedWidth.set(!!this._fixedCols);
    const rows = await this._quickInputService.input({
      title: localize(20006, null),
      placeHolder: "Enter a number of rows or leave empty for automatic height",
      validateInput: async (text2) => text2.length > 0 && !text2.match(/^\d+$/) ? { content: "Enter a number or leave empty size automatically", severity: Severity2.Error } : void 0
    });
    if (rows === void 0) {
      return;
    }
    this._fixedRows = this._parseFixedDimension(rows);
    this._labelComputer?.refreshLabel(this);
    await this._refreshScrollbar();
    this._resize();
    this.focus();
  }
  _parseFixedDimension(value2) {
    if (value2 === "") {
      return void 0;
    }
    const parsed = parseInt(value2);
    if (parsed <= 0) {
      throw new Error(`Could not parse dimension "${value2}"`);
    }
    return parsed;
  }
  async toggleSizeToContentWidth() {
    if (!this.xterm?.raw.buffer.active) {
      return;
    }
    if (this._hasScrollBar) {
      this._terminalHasFixedWidth.set(false);
      this._fixedCols = void 0;
      this._fixedRows = void 0;
      this._hasScrollBar = false;
      this._initDimensions();
      await this._resize();
    } else {
      const font = this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(getWindow(this.domElement));
      const maxColsForTexture = Math.floor(4096 /* MaxCanvasWidth */ / (font.charWidth ?? 20));
      const proposedCols = Math.max(this.maxCols, Math.min(this.xterm.getLongestViewportWrappedLineLength(), maxColsForTexture));
      if (proposedCols > this.xterm.raw.cols) {
        this._fixedCols = proposedCols;
      }
    }
    await this._refreshScrollbar();
    this._labelComputer?.refreshLabel(this);
    this.focus();
  }
  _refreshScrollbar() {
    if (this._fixedCols || this._fixedRows) {
      return this._addScrollbar();
    }
    return this._removeScrollbar();
  }
  async _addScrollbar() {
    const charWidth = (this.xterm ? this.xterm.getFont() : this._terminalConfigurationService.getFont(getWindow(this.domElement))).charWidth;
    if (!this.xterm?.raw.element || !this._container || !charWidth || !this._fixedCols) {
      return;
    }
    this._wrapperElement.classList.add("fixed-dims");
    this._hasScrollBar = true;
    this._initDimensions();
    await this._resize();
    this._terminalHasFixedWidth.set(true);
    if (!this._horizontalScrollbar) {
      this._horizontalScrollbar = this._register(new DomScrollableElement(this._wrapperElement, {
        vertical: 2 /* Hidden */,
        horizontal: 1 /* Auto */,
        useShadows: false,
        scrollYToX: false,
        consumeMouseWheelIfScrollbarIsNeeded: false
      }));
      this._container.appendChild(this._horizontalScrollbar.getDomNode());
    }
    this._horizontalScrollbar.setScrollDimensions({
      width: this.xterm.raw.element.clientWidth,
      scrollWidth: this._fixedCols * charWidth + 40
      // Padding + scroll bar
    });
    this._horizontalScrollbar.getDomNode().style.paddingBottom = "16px";
    if (isWindows) {
      for (let i2 = this.xterm.raw.buffer.active.viewportY; i2 < this.xterm.raw.buffer.active.length; i2++) {
        const line = this.xterm.raw.buffer.active.getLine(i2);
        line._line.isWrapped = false;
      }
    }
  }
  async _removeScrollbar() {
    if (!this._container || !this._horizontalScrollbar) {
      return;
    }
    this._horizontalScrollbar.getDomNode().remove();
    this._horizontalScrollbar.dispose();
    this._horizontalScrollbar = void 0;
    this._wrapperElement.remove();
    this._wrapperElement.classList.remove("fixed-dims");
    this._container.appendChild(this._wrapperElement);
  }
  _setResolvedShellLaunchConfig(shellLaunchConfig) {
    this._shellLaunchConfig.args = shellLaunchConfig.args;
    this._shellLaunchConfig.cwd = shellLaunchConfig.cwd;
    this._shellLaunchConfig.executable = shellLaunchConfig.executable;
    this._shellLaunchConfig.env = shellLaunchConfig.env;
  }
  _onEnvironmentVariableInfoChanged(info) {
    if (info.requiresAction) {
      this.xterm?.raw.textarea?.setAttribute("aria-label", localize(20020, null, this._instanceId));
    }
    this._refreshEnvironmentVariableInfoWidgetState(info);
  }
  async _refreshEnvironmentVariableInfoWidgetState(info) {
    if (!info) {
      this.statusList.remove("relaunch-needed" /* RelaunchNeeded */);
      this.statusList.remove("env-var-info-changes-active" /* EnvironmentVariableInfoChangesActive */);
      return;
    }
    if (
      // The change requires a relaunch
      info.requiresAction && // The feature is enabled
      this._terminalConfigurationService.config.environmentChangesRelaunch && // Has not been interacted with
      !this._processManager.hasWrittenData && // Not a feature terminal or is a reconnecting task terminal (TODO: Need to explain the latter case)
      (!this._shellLaunchConfig.isFeatureTerminal || this.reconnectionProperties && this._configurationService.getValue("task.reconnection") === true) && // Not a custom pty
      !this._shellLaunchConfig.customPtyImplementation && // Not an extension owned terminal
      !this._shellLaunchConfig.isExtensionOwnedTerminal && // Not a reconnected or revived terminal
      !this._shellLaunchConfig.attachPersistentProcess && // Not a Windows remote using ConPTY which cannot relaunch (#187084). ConPTY is used on
      // Windows builds 18309+.
      !(this._processManager.remoteAuthority && await this._processManager.getBackendOS() === 1 /* Windows */ && this._processManager.processTraits?.windowsPty?.buildNumber && this._processManager.processTraits.windowsPty.buildNumber >= 18309)
    ) {
      this.relaunch();
      return;
    }
    const workspaceFolder = getWorkspaceForTerminal(this.shellLaunchConfig.cwd, this._workspaceContextService, this._historyService);
    this.statusList.add(info.getStatus({ workspaceFolder }));
  }
  async getInitialCwd() {
    if (!this._initialCwd) {
      this._initialCwd = this._processManager.initialCwd;
    }
    return this._initialCwd;
  }
  async getSpeculativeCwd() {
    if (this.capabilities.has(0 /* CwdDetection */)) {
      return this.capabilities.get(0 /* CwdDetection */).getCwd();
    } else if (this.capabilities.has(1 /* NaiveCwdDetection */)) {
      return this.capabilities.get(1 /* NaiveCwdDetection */).getCwd();
    }
    return this._processManager.initialCwd;
  }
  async getCwdResource() {
    const cwd2 = this.capabilities.get(0 /* CwdDetection */)?.getCwd();
    if (!cwd2) {
      return void 0;
    }
    let resource;
    if (this.remoteAuthority) {
      resource = await this._pathService.fileURI(cwd2);
    } else {
      resource = URI.file(cwd2);
    }
    if (!await this._fileService.canHandleResource(resource)) {
      return void 0;
    }
    if (await this._fileService.exists(resource)) {
      return resource;
    }
    return void 0;
  }
  async _refreshProperty(type) {
    await this.processReady;
    return this._processManager.refreshProperty(type);
  }
  async _updateProperty(type, value2) {
    return this._processManager.updateProperty(type, value2);
  }
  async rename(title, source) {
    if (title !== void 0 && !title) {
      title = void 0;
    }
    this._setTitle(title, source ?? 0 /* Api */);
  }
  _setTitle(title, eventSource) {
    if ((this._shellLaunchConfig?.type === "Task" || this._titleSource === 0 /* Api */) && eventSource === 1 /* Process */) {
      return;
    }
    const reset2 = !title;
    title = this._updateTitleProperties(title, eventSource);
    const titleChanged = title !== this._title;
    this._title = title;
    this._labelComputer?.refreshLabel(this, reset2);
    this._setAriaLabel(this.xterm?.raw, this._instanceId, this._title);
    if (titleChanged) {
      this._onTitleChanged.fire(this);
    }
  }
  async changeIcon(icon2) {
    if (icon2) {
      this._icon = icon2;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return icon2;
    }
    const iconPicker = this._scopedInstantiationService.createInstance(TerminalIconPicker);
    const pickedIcon = await iconPicker.pickIcons();
    iconPicker.dispose();
    if (!pickedIcon) {
      return void 0;
    }
    this._icon = pickedIcon;
    this._onIconChanged.fire({ instance: this, userInitiated: true });
    return pickedIcon;
  }
  async changeColor(color2, skipQuickPick) {
    if (color2) {
      this.shellLaunchConfig.color = color2;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return color2;
    } else if (skipQuickPick) {
      this.shellLaunchConfig.color = "";
      this._onIconChanged.fire({ instance: this, userInitiated: true });
      return;
    }
    const icon2 = this._getIcon();
    if (!icon2) {
      return;
    }
    const colorTheme = this._themeService.getColorTheme();
    const standardColors = getStandardColors(colorTheme);
    const colorStyleDisposable = createColorStyleElement(colorTheme);
    const items = [];
    for (const colorKey of standardColors) {
      const colorClass = getColorClass(colorKey);
      items.push({
        label: `$(${Codicon.circleFilled.id}) ${colorKey.replace("terminal.ansi", "")}`,
        id: colorKey,
        description: colorKey,
        iconClasses: [colorClass]
      });
    }
    items.push({ type: "separator" });
    const showAllColorsItem = { label: "Reset to default" };
    items.push(showAllColorsItem);
    const disposables = [];
    const quickPick = this._quickInputService.createQuickPick({ useSeparators: true });
    disposables.push(quickPick);
    quickPick.items = items;
    quickPick.matchOnDescription = true;
    quickPick.placeholder = localize(19999, null);
    quickPick.show();
    const result = await new Promise((r2) => {
      disposables.push(quickPick.onDidHide(() => r2(void 0)));
      disposables.push(quickPick.onDidAccept(() => r2(quickPick.selectedItems[0])));
    });
    dispose(disposables);
    if (result) {
      this.shellLaunchConfig.color = result.id;
      this._onIconChanged.fire({ instance: this, userInitiated: true });
    }
    quickPick.hide();
    colorStyleDisposable.dispose();
    return result?.id;
  }
  forceScrollbarVisibility() {
    this._wrapperElement.classList.add("force-scrollbar");
  }
  resetScrollbarVisibility() {
    this._wrapperElement.classList.remove("force-scrollbar");
  }
  setParentContextKeyService(parentContextKeyService) {
    this._scopedContextKeyService.updateParent(parentContextKeyService);
  }
  async handleMouseEvent(event, contextMenu) {
    if (isHTMLElement(event.target) && (event.target.classList.contains("scrollbar") || event.target.classList.contains("slider"))) {
      return { cancelContextMenu: true };
    }
    for (const contrib of this._contributions.values()) {
      const result = await contrib.handleMouseEvent?.(event);
      if (result?.handled) {
        return { cancelContextMenu: true };
      }
    }
    if (event.which === 2) {
      switch (this._terminalConfigurationService.config.middleClickBehavior) {
        case "default":
        default:
          this.focus();
          break;
      }
      return;
    }
    if (event.which === 3) {
      if (event.shiftKey) {
        openContextMenu(getActiveWindow(), event, this, contextMenu, this._contextMenuService);
        return;
      }
      const rightClickBehavior = this._terminalConfigurationService.config.rightClickBehavior;
      if (rightClickBehavior === "nothing") {
        if (!event.shiftKey) {
          return { cancelContextMenu: true };
        }
        return;
      }
    }
  }
};

__decorateClass([
  debounce(50)
], TerminalInstance.prototype, "_fireMaximumDimensionsChanged", 1);

__decorateClass([
  debounce(500)
], TerminalInstance.prototype, "_refreshShellIntegrationInfoStatus", 1);

__decorateClass([
  debounce(1e3)
], TerminalInstance.prototype, "relaunch", 1);

__decorateClass([
  debounce(2e3)
], TerminalInstance.prototype, "_updateProcessCwd", 1);

TerminalInstance = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITerminalConfigurationService),
  __decorateParam(6, ITerminalProfileResolverService),
  __decorateParam(7, IPathService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IPreferencesService),
  __decorateParam(12, IViewsService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, ITerminalLogService),
  __decorateParam(16, IStorageService),
  __decorateParam(17, IAccessibilityService),
  __decorateParam(18, IProductService),
  __decorateParam(19, IQuickInputService),
  __decorateParam(20, IWorkbenchEnvironmentService),
  __decorateParam(21, IWorkspaceContextService),
  __decorateParam(22, IEditorService),
  __decorateParam(23, IWorkspaceTrustRequestService),
  __decorateParam(24, IHistoryService),
  __decorateParam(25, ITelemetryService),
  __decorateParam(26, IOpenerService),
  __decorateParam(27, ICommandService),
  __decorateParam(28, IAccessibilitySignalService),
  __decorateParam(29, IViewDescriptorService)
], TerminalInstance);

var TerminalInstanceDragAndDropController = class extends Disposable {
  constructor(_container, _layoutService, _viewDescriptorService) {
    super();
    this._container = _container;
    this._layoutService = _layoutService;
    this._viewDescriptorService = _viewDescriptorService;
    this._onDropFile = this._register(new Emitter());
    this._onDropTerminal = this._register(new Emitter());
    this._register(toDisposable(() => this._clearDropOverlay()));
  }
  get onDropFile() {
    return this._onDropFile.event;
  }
  get onDropTerminal() {
    return this._onDropTerminal.event;
  }
  _clearDropOverlay() {
    this._dropOverlay?.remove();
    this._dropOverlay = void 0;
  }
  onDragEnter(e) {
    if (!containsDragType(e, DataTransfers.FILES, DataTransfers.RESOURCES, "Terminals" /* Terminals */, CodeDataTransfers.FILES)) {
      return;
    }
    if (!this._dropOverlay) {
      this._dropOverlay = document.createElement("div");
      this._dropOverlay.classList.add("terminal-drop-overlay");
    }
    if (containsDragType(e, "Terminals" /* Terminals */)) {
      const side = this._getDropSide(e);
      this._dropOverlay.classList.toggle("drop-before", side === "before");
      this._dropOverlay.classList.toggle("drop-after", side === "after");
    }
    if (!this._dropOverlay.parentElement) {
      this._container.appendChild(this._dropOverlay);
    }
  }
  onDragLeave(e) {
    this._clearDropOverlay();
  }
  onDragEnd(e) {
    this._clearDropOverlay();
  }
  onDragOver(e) {
    if (!e.dataTransfer || !this._dropOverlay) {
      return;
    }
    if (containsDragType(e, "Terminals" /* Terminals */)) {
      const side = this._getDropSide(e);
      this._dropOverlay.classList.toggle("drop-before", side === "before");
      this._dropOverlay.classList.toggle("drop-after", side === "after");
    }
    this._dropOverlay.style.opacity = "1";
  }
  async onDrop(e) {
    this._clearDropOverlay();
    if (!e.dataTransfer) {
      return;
    }
    const terminalResources = getTerminalResourcesFromDragEvent(e);
    if (terminalResources) {
      for (const uri5 of terminalResources) {
        const side = this._getDropSide(e);
        this._onDropTerminal.fire({ uri: uri5, side });
      }
      return;
    }
    let path;
    const rawResources = e.dataTransfer.getData(DataTransfers.RESOURCES);
    if (rawResources) {
      path = URI.parse(JSON.parse(rawResources)[0]);
    }
    const rawCodeFiles = e.dataTransfer.getData(CodeDataTransfers.FILES);
    if (!path && rawCodeFiles) {
      path = URI.file(JSON.parse(rawCodeFiles)[0]);
    }
    if (!path && e.dataTransfer.files.length > 0 && getPathForFile(e.dataTransfer.files[0])) {
      path = URI.file(getPathForFile(e.dataTransfer.files[0]));
    }
    if (!path) {
      return;
    }
    this._onDropFile.fire(path);
  }
  _getDropSide(e) {
    const target = this._container;
    if (!target) {
      return "after";
    }
    const rect = target.getBoundingClientRect();
    return this._getViewOrientation() === 1 /* HORIZONTAL */ ? e.clientX - rect.left < rect.width / 2 ? "before" : "after" : e.clientY - rect.top < rect.height / 2 ? "before" : "after";
  }
  _getViewOrientation() {
    const panelPosition = this._layoutService.getPanelPosition();
    const terminalLocation = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
    return terminalLocation === 1 /* Panel */ && isHorizontal(panelPosition) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
  }
};

TerminalInstanceDragAndDropController = __decorateClass([
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IViewDescriptorService)
], TerminalInstanceDragAndDropController);

var TerminalLabelComputer = class extends Disposable {
  constructor(_fileService, _terminalConfigurationService, _workspaceContextService) {
    super();
    this._fileService = _fileService;
    this._terminalConfigurationService = _terminalConfigurationService;
    this._workspaceContextService = _workspaceContextService;
    this._title = "";
    this._description = "";
    this._onDidChangeLabel = this._register(new Emitter());
    this.onDidChangeLabel = this._onDidChangeLabel.event;
  }
  get title() {
    return this._title;
  }
  get description() {
    return this._description;
  }
  static {
    /**
     * Agent CLIs whose tab title should come from their own escape sequences rather
     * than the configured template or a static profile name.
     */
    this.agentCliShellTypes = /* @__PURE__ */ new Set([
      "claude" /* Claude */,
      "codex" /* Codex */,
      "commandcode" /* CommandCode */,
      "copilot" /* Copilot */,
      "gemini" /* Gemini */
    ]);
  }
  refreshLabel(instance2, reset2) {
    const tabs = this._terminalConfigurationService.config.tabs;
    const useAgentCliTitle = tabs.allowAgentCliTitle && TerminalLabelComputer.agentCliShellTypes.has(instance2.shellType);
    const titleTemplate = instance2.shellLaunchConfig.titleTemplate ?? (useAgentCliTitle ? "${sequence}" : tabs.title);
    this._title = this.computeLabel(instance2, titleTemplate, "title" /* Title */, reset2);
    this._description = this.computeLabel(instance2, tabs.description, "description" /* Description */);
    if (this._title !== instance2.title || this._description !== instance2.description || reset2) {
      this._onDidChangeLabel.fire({ title: this._title, description: this._description });
    }
  }
  computeLabel(instance2, labelTemplate, labelType, reset2) {
    const type = instance2.shellLaunchConfig.attachPersistentProcess?.type || instance2.shellLaunchConfig.type;
    const commandDetection = instance2.capabilities.get(2 /* CommandDetection */);
    const promptInputModel = commandDetection?.promptInputModel;
    const nonTaskSpinner = type === "Task" ? "" : " $(loading~spin)";
    let cwd2 = instance2.cwd || instance2.initialCwd || "";
    const os = instance2.os ?? OS;
    cwd2 = tildify(cwd2, instance2.userHome || "", os);
    if (os !== 1 /* Windows */ && cwd2 && instance2.userHome && cwd2 === instance2.userHome) {
      cwd2 = "~";
    }
    const templateProperties = {
      cwd: cwd2,
      cwdFolder: "",
      workspaceFolderName: instance2.workspaceFolder?.name,
      workspaceFolder: instance2.workspaceFolder ? basename(instance2.workspaceFolder.uri.fsPath) : void 0,
      local: type === "Local" ? terminalStrings.typeLocal : void 0,
      process: instance2.processName,
      sequence: instance2.sequence,
      task: type === "Task" ? terminalStrings.typeTask : void 0,
      fixedDimensions: instance2.fixedCols ? instance2.fixedRows ? `\u2194${instance2.fixedCols} \u2195${instance2.fixedRows}` : `\u2194${instance2.fixedCols}` : instance2.fixedRows ? `\u2195${instance2.fixedRows}` : "",
      separator: { label: this._terminalConfigurationService.config.tabs.separator },
      shellType: instance2.shellType,
      // Shell command requires high confidence
      shellCommand: commandDetection?.executingCommand && commandDetection.executingCommandConfidence === "high" && promptInputModel ? promptInputModel.value + nonTaskSpinner : void 0,
      // Shell prompt input does not require high confidence as it's largely for VS Code developers
      shellPromptInput: commandDetection?.executingCommand && promptInputModel ? promptInputModel.getCombinedString(true) + nonTaskSpinner : promptInputModel?.getCombinedString(true),
      progress: this._getProgressStateString(instance2.progressState)
    };
    templateProperties.workspaceFolderName = instance2.workspaceFolder?.name ?? templateProperties.workspaceFolder;
    labelTemplate = labelTemplate.trim();
    if (!labelTemplate) {
      return labelType === "title" /* Title */ ? instance2.processName || "" : "";
    }
    if (!reset2 && instance2.staticTitle && labelType === "title" /* Title */) {
      return instance2.staticTitle.replace(/[\n\r\t]/g, "") || templateProperties.process?.replace(/[\n\r\t]/g, "") || "";
    }
    const detection = instance2.capabilities.has(0 /* CwdDetection */) || instance2.capabilities.has(1 /* NaiveCwdDetection */);
    const folders = this._workspaceContextService.getWorkspace().folders;
    const multiRootWorkspace = folders.length > 1;
    if (templateProperties.cwd && detection && (!instance2.shellLaunchConfig.isFeatureTerminal || labelType === "title" /* Title */)) {
      const cwdUri = URI.from({
        scheme: instance2.workspaceFolder?.uri.scheme || Schemas.file,
        path: instance2.cwd ? resolve(instance2.cwd) : void 0
      });
      let showCwd = false;
      if (multiRootWorkspace) {
        showCwd = true;
      } else if (instance2.workspaceFolder?.uri) {
        const caseSensitive = this._fileService.hasCapability(instance2.workspaceFolder.uri, 1024 /* PathCaseSensitive */);
        showCwd = cwdUri.fsPath.localeCompare(instance2.workspaceFolder.uri.fsPath, void 0, { sensitivity: caseSensitive ? "case" : "base" }) !== 0;
      }
      if (showCwd) {
        templateProperties.cwdFolder = basename(templateProperties.cwd);
      }
    }
    const label3 = template(labelTemplate, templateProperties).replace(/[\n\r\t]/g, "").trim();
    return label3 === "" && labelType === "title" /* Title */ ? instance2.processName || "" : label3;
  }
  _getProgressStateString(progressState) {
    if (!progressState) {
      return "";
    }
    switch (progressState.state) {
      case 0:
        return "";
      case 1:
        return `${Math.round(progressState.value)}%`;
      case 2:
        return "$(error)";
      case 3:
        return "$(loading~spin)";
      case 4:
        return "$(alert)";
    }
  }
};

TerminalLabelComputer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITerminalConfigurationService),
  __decorateParam(2, IWorkspaceContextService)
], TerminalLabelComputer);

function parseExitResult(exitCodeOrError, shellLaunchConfig, processState, initialCwd) {
  if (exitCodeOrError === void 0 || exitCodeOrError === 0) {
    return { code: exitCodeOrError, message: void 0 };
  }
  const code = isNumber(exitCodeOrError) ? exitCodeOrError : exitCodeOrError.code;
  let message = void 0;
  switch (typeof exitCodeOrError) {
    case "number": {
      let commandLine = void 0;
      if (shellLaunchConfig.executable) {
        commandLine = shellLaunchConfig.executable;
        if (isString(shellLaunchConfig.args)) {
          commandLine += ` ${shellLaunchConfig.args}`;
        } else if (shellLaunchConfig.args && shellLaunchConfig.args.length) {
          commandLine += shellLaunchConfig.args.map((a) => ` '${a}'`).join();
        }
      }
      if (processState === 4 /* KilledDuringLaunch */) {
        if (commandLine) {
          message = localize(20002, null, commandLine, code);
        } else {
          message = localize(20003, null, code);
        }
      } else {
        if (commandLine) {
          message = localize(20023, null, commandLine, code);
        } else {
          message = localize(20024, null, code);
        }
      }
      break;
    }
    case "object": {
      if (exitCodeOrError.message.toString().includes("Could not find pty with id")) {
        break;
      }
      let innerMessage = exitCodeOrError.message;
      const conptyError = exitCodeOrError.message.match(/.*error code:\s*(\d+).*$/);
      if (conptyError) {
        const errorCode = conptyError.length > 1 ? parseInt(conptyError[1]) : void 0;
        switch (errorCode) {
          case 5:
            innerMessage = `Access was denied to the path containing your executable "${shellLaunchConfig.executable}". Manage and change your permissions to get this to work`;
            break;
          case 267:
            innerMessage = `Invalid starting directory "${initialCwd}", review your terminal.integrated.cwd setting`;
            break;
          case 1260:
            innerMessage = `Windows cannot open this program because it has been prevented by a software restriction policy. For more information, open Event Viewer or contact your system Administrator`;
            break;
        }
      }
      message = localize(20001, null, innerMessage);
      break;
    }
  }
  return { code, message };
}

function shouldShowTerminalExitNotification(shellLaunchConfig, processState, showExitAlert, lastInputEvent) {
  const failedDuringLaunch = processState === 4 /* KilledDuringLaunch */;
  if (!!shellLaunchConfig.customPtyImplementation && !!shellLaunchConfig.isTransient) {
    return false;
  }
  if (failedDuringLaunch && shellLaunchConfig.isExtensionOwnedTerminal) {
    return false;
  }
  return failedDuringLaunch || showExitAlert && lastInputEvent !== /*Ctrl+D*/
  "";
}

var TerminalInstanceColorProvider = class {
  constructor(_target, _viewDescriptorService) {
    this._target = _target;
    this._viewDescriptorService = _viewDescriptorService;
  }
  getBackgroundColor(theme) {
    const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR);
    if (terminalBackground) {
      return terminalBackground;
    }
    if (this._target.object === 2 /* Editor */) {
      return theme.getColor(editorBackground);
    }
    const location2 = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
    if (location2 === 1 /* Panel */) {
      return theme.getColor(PANEL_BACKGROUND);
    }
    return theme.getColor(SIDE_BAR_BACKGROUND);
  }
};

TerminalInstanceColorProvider = __decorateClass([
  __decorateParam(1, IViewDescriptorService)
], TerminalInstanceColorProvider);

function guessShellTypeFromExecutable(os, executable) {
  const exeBasename = basename(executable);
  const generalShellTypeMap = /* @__PURE__ */ new Map([
    ["julia" /* Julia */, /^julia$/],
    ["node" /* Node */, /^node$/],
    ["nu" /* NuShell */, /^nu$/],
    ["pwsh" /* PowerShell */, /^pwsh(-preview)?|powershell$/],
    ["python" /* Python */, /^py(?:thon)?$/],
    ["xonsh" /* Xonsh */, /^xonsh/]
  ]);
  for (const [shellType, pattern] of generalShellTypeMap) {
    if (exeBasename.match(pattern)) {
      return shellType;
    }
  }
  if (os === 1 /* Windows */) {
    const windowsShellTypeMap = /* @__PURE__ */ new Map([
      ["cmd" /* CommandPrompt */, /^cmd$/],
      ["gitbash" /* GitBash */, /^bash$/],
      ["wsl" /* Wsl */, /^wsl$/]
    ]);
    for (const [shellType, pattern] of windowsShellTypeMap) {
      if (exeBasename.match(pattern)) {
        return shellType;
      }
    }
  } else {
    const posixShellTypes = [
      "bash" /* Bash */,
      "csh" /* Csh */,
      "fish" /* Fish */,
      "ksh" /* Ksh */,
      "sh" /* Sh */,
      "zsh" /* Zsh */
    ];
    for (const type of posixShellTypes) {
      if (exeBasename === type) {
        return type;
      }
    }
  }
  return void 0;
}
export { parseExitResult, shouldShowTerminalExitNotification, guessShellTypeFromExecutable, xtermConstructor, shellIntegrationSupportedShellTypes, agentCliTitlePatterns, TerminalInstance, TerminalInstanceDragAndDropController, TerminalLabelComputer, TerminalInstanceColorProvider };
