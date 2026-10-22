// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/workbench.ts
import { IInstantiationService, refineServiceDecorator } from "./module-0077.mjs";
import { IWorkbenchLayoutService, positionToString } from "./module-1119.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2, setGlobalLeakWarningThreshold } from "./module-0017.mjs";
import { SessionsLayoutPolicy } from "./module-3464.mjs";
import { MobileNavigationStack } from "./module-3466.mjs";
import { DeferredPromise, RunOnceScheduler } from "./module-0036.mjs";
import { mainWindow } from "./module-0002.mjs";
import { mark } from "./module-0506.mjs";
import { Dimension, EventType, addDisposableGenericMouseDownListener, addDisposableListener, getActiveDocument, getActiveElement, getClientArea, getWindow, getWindowId, getWindows, isAncestorUsingFlowTo, runWhenWindowIdle, size } from "./module-0075.mjs";
import { isChrome2, isFirefox2, isFullscreen, isSafari2, onDidChangeFullscreen } from "./module-0018.mjs";
import { onUnexpectedError, setUnexpectedErrorHandler } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1118.mjs";
import { IHoverService, WorkbenchHoverDelegate } from "./module-0520.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { isIOS, isLinux, isMacintosh, isNative, isWeb, isWindows } from "./module-0014.mjs";
import { EditorMarkdownCodeBlockRenderer } from "./module-3461.mjs";
import { setHoverDelegateFactory } from "./module-0448.mjs";
import { setBaseLayerHoverDelegate } from "./module-0472.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { WorkbenchContextKeysHandler } from "./module-3450.mjs";
import { CustomViewVisibleContext, EditorMaximizedContext, IsPhoneLayoutContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { autorun } from "./module-0052.mjs";
import { IMobileVisualViewport, getMobileViewportDimension } from "./module-3472.mjs";
import { ITitleService } from "./module-2558.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { TitleService } from "./module-3462.mjs";
import { getSingletonServiceDescriptors } from "./module-0135.mjs";
import { InstantiationService } from "./module-1839.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { EDITOR_PART_DEFAULT_WIDTH, EDITOR_PART_MINIMUM_WIDTH } from "./module-3463.mjs";
import { alert, setARIAContainer } from "./module-0076.mjs";
import { setProgressAccessibilitySignalScheduler } from "./module-1329.mjs";
import { AccessibilityProgressSignalScheduler } from "./module-2613.mjs";
import { coalesce } from "./module-0007.mjs";
import { MobileTitlebarPart } from "./module-3471.mjs";
import { NotificationsCenter } from "./module-3456.mjs";
import { NotificationsToasts } from "./module-3460.mjs";
import { NotificationsAlerts } from "./module-3457.mjs";
import { NotificationsStatus } from "./module-3458.mjs";
import { registerNotificationCommands } from "./module-3451.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { NotificationAccessibleView } from "./module-3452.mjs";
import { COMPACT_NOTIFICATION_ROW_HEIGHT, DEFAULT_NOTIFICATION_ROW_HEIGHT, setNotificationRowHeight } from "./module-3454.mjs";
import { AGENTS_PART_CARD_CLASS } from "./module-3465.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ICustomViewService } from "./module-1776.mjs";
import { ICustomViewGridPartService } from "./module-3473.mjs";
import { SerializableGrid } from "./module-1508.mjs";
import { ISessionsSetUpService } from "./module-1802.mjs";
import { AGENTS_FLOATING_PANEL_GAP } from "./module-1498.mjs";
import { Part } from "./module-1563.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/browser/workbench.ts
var PHONE_NOTIFICATION_ROW_HEIGHT = 44;

var IAgentWorkbenchLayoutService = refineServiceDecorator(IWorkbenchLayoutService);

var CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID = "sessions.closeMobileSidebarDrawer";

var Workbench = class _Workbench extends Disposable {
  //#endregion
  constructor(parent, options3, serviceCollection, logService) {
    super();
    this.parent = parent;
    this.options = options3;
    this.serviceCollection = serviceCollection;
    this.logService = logService;
    //#region Lifecycle Events
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onDidShutdown = this._register(new Emitter());
    this.onDidShutdown = this._onDidShutdown.event;
    //#endregion
    //#region Events
    this._onDidChangeZenMode = this._register(new Emitter());
    this.onDidChangeZenMode = this._onDidChangeZenMode.event;
    this._onDidChangeMainEditorCenteredLayout = this._register(new Emitter());
    this.onDidChangeMainEditorCenteredLayout = this._onDidChangeMainEditorCenteredLayout.event;
    this._onDidChangePanelAlignment = this._register(new Emitter());
    this.onDidChangePanelAlignment = this._onDidChangePanelAlignment.event;
    this._onDidChangeWindowMaximized = this._register(new Emitter());
    this.onDidChangeWindowMaximized = this._onDidChangeWindowMaximized.event;
    this._onDidChangePanelPosition = this._register(new Emitter());
    this.onDidChangePanelPosition = this._onDidChangePanelPosition.event;
    this._onDidChangePartVisibility = this._register(new Emitter());
    this.onDidChangePartVisibility = this._onDidChangePartVisibility.event;
    this._onWillToggleSidePane = this._register(new Emitter());
    this.onWillToggleSidePane = this._onWillToggleSidePane.event;
    this._onDidToggleSidePane = this._register(new Emitter());
    this.onDidToggleSidePane = this._onDidToggleSidePane.event;
    this._onDidRevealSidePane = this._register(new Emitter());
    this.onDidRevealSidePane = this._onDidRevealSidePane.event;
    this._onDidChangeNotificationsVisibility = this._register(new Emitter());
    this.onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
    this._onDidChangeAuxiliaryBarMaximized = this._register(new Emitter());
    this.onDidChangeAuxiliaryBarMaximized = this._onDidChangeAuxiliaryBarMaximized.event;
    this._onDidChangeEditorMaximized = this._register(new Emitter());
    this.onDidChangeEditorMaximized = this._onDidChangeEditorMaximized.event;
    this._onDidLayoutMainContainer = this._register(new Emitter());
    this.onDidLayoutMainContainer = this._onDidLayoutMainContainer.event;
    this._onDidLayoutActiveContainer = this._register(new Emitter());
    this.onDidLayoutActiveContainer = this._onDidLayoutActiveContainer.event;
    this._onDidLayoutContainer = this._register(new Emitter());
    this.onDidLayoutContainer = this._onDidLayoutContainer.event;
    this._onDidAddContainer = this._register(new Emitter());
    this.onDidAddContainer = this._onDidAddContainer.event;
    this._onDidChangeActiveContainer = this._register(new Emitter());
    this.onDidChangeActiveContainer = this._onDidChangeActiveContainer.event;
    //#endregion
    //#region Properties
    this.mainContainer = document.createElement("div");
    //#endregion
    //#region State
    this.parts = /* @__PURE__ */ new Map();
    /** `true` while the editor's current visible state was produced by an explicit user reveal. */
    this._editorRevealedExplicitly = false;
    this.partVisibility = {
      sidebar: true,
      auxiliaryBar: true,
      editor: false,
      panel: false,
      sessions: true,
      customViewGrid: false
    };
    this.mainWindowFullscreen = false;
    this.maximized = /* @__PURE__ */ new Set();
    this.layoutPolicy = this._register(new SessionsLayoutPolicy());
    this.mobileNavStack = this._register(new MobileNavigationStack());
    this.mobileTopBarDisposables = this._register(new DisposableStore());
    this._editorMaximized = false;
    /** Guards the grid updates that show/hide the custom view from feeding back into the desired part visibility. */
    this._applyingCustomViewGridVisibility = false;
    this._restoreAttachedEditorMaximizedOnShow = false;
    this._editorPartAutoVisibilitySuppressionCount = 0;
    this._hasAppliedInitialEditorSplit = false;
    this._restoreSidePaneEditorMaximizedOnShow = false;
    this._defaultSidePaneState = { editor: true, auxiliaryBar: true };
    this.restoredPromise = new DeferredPromise();
    this.whenRestored = this.restoredPromise.p;
    this.restored = false;
    this.openedDefaultEditors = false;
    this._savedPartSizes = {};
    this.previousUnexpectedError = { message: void 0, time: 0 };
    const metaElements = mainWindow.document.head.getElementsByTagName("meta");
    let viewportMeta;
    for (let i2 = 0; i2 < metaElements.length; i2++) {
      if (metaElements[i2].name === "viewport") {
        viewportMeta = metaElements[i2];
        break;
      }
    }
    if (viewportMeta && !viewportMeta.content.includes("viewport-fit=")) {
      viewportMeta.content = `${viewportMeta.content}, viewport-fit=cover`;
    }
    mark("code/willStartWorkbench");
    this.registerErrorHandler(logService);
  }
  get activeContainer() {
    return this.getContainerFromDocument(getActiveDocument());
  }
  get containers() {
    const containers = [];
    for (const { window: window2 } of getWindows()) {
      containers.push(this.getContainerFromDocument(window2.document));
    }
    return containers;
  }
  getContainerFromDocument(targetDocument) {
    if (targetDocument === this.mainContainer.ownerDocument) {
      return this.mainContainer;
    } else {
      return targetDocument.body.getElementsByClassName("monaco-workbench")[0];
    }
  }
  get mainContainerDimension() {
    return this._mainContainerDimension;
  }
  get activeContainerDimension() {
    return this.getContainerDimension(this.activeContainer);
  }
  getContainerDimension(container2) {
    if (container2 === this.mainContainer) {
      return this.mainContainerDimension;
    } else {
      return getClientArea(container2);
    }
  }
  get mainContainerOffset() {
    return this.computeContainerOffset();
  }
  get activeContainerOffset() {
    return this.computeContainerOffset();
  }
  computeContainerOffset() {
    let top2 = 0;
    let quickPickTop = 0;
    if (this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
      top2 = this.getPart("workbench.parts.titlebar" /* TITLEBAR_PART */).maximumHeight;
      quickPickTop = top2;
    } else if (this.mobileTopBarElement) {
      top2 = this.mobileTopBarElement.offsetHeight;
      quickPickTop = top2;
    }
    return { top: top2, quickPickTop };
  }
  /** `false` for the classic/mobile layout; {@link SinglePaneWorkbench} overrides to `true`. */
  get isSinglePaneLayoutEnabled() {
    return false;
  }
  static {
    //#endregion
    this._PART_VISIBILITY_KEY = "workbench.sessions.partVisibility";
  }
  static {
    this._PART_SIZES_KEY = "workbench.sessions.partSizes";
  }
  //#region Error Handling
  registerErrorHandler(logService) {
    if (!isFirefox2) {
      Error.stackTraceLimit = 100;
    }
    mainWindow.addEventListener("unhandledrejection", (event) => {
      onUnexpectedError(event.reason);
      event.preventDefault();
    });
    setUnexpectedErrorHandler((error) => this.handleUnexpectedError(error, logService));
  }
  handleUnexpectedError(error, logService) {
    const message = toErrorMessage(error, true);
    if (!message) {
      return;
    }
    const now = Date.now();
    if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1e3) {
      return;
    }
    this.previousUnexpectedError.time = now;
    this.previousUnexpectedError.message = message;
    logService.error(message);
  }
  //#endregion
  //#region Startup
  startup() {
    try {
      this._register(setGlobalLeakWarningThreshold(175));
      const instantiationService = this.initServices(this.serviceCollection);
      instantiationService.invokeFunction((accessor) => {
        const lifecycleService = accessor.get(ILifecycleService);
        const storageService = accessor.get(IStorageService);
        const configurationService = accessor.get(IConfigurationService);
        const hostService = accessor.get(IHostService);
        const hoverService = accessor.get(IHoverService);
        const dialogService = accessor.get(IDialogService);
        const notificationService = accessor.get(INotificationService);
        const markdownRendererService = accessor.get(IMarkdownRendererService);
        if (isWeb && typeof configurationService.acquireInstantiationService === "function") {
          configurationService.acquireInstantiationService(instantiationService);
        }
        markdownRendererService.setDefaultCodeBlockRenderer(instantiationService.createInstance(EditorMarkdownCodeBlockRenderer));
        setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, { instantHover: enableInstantHover }, {}));
        setBaseLayerHoverDelegate(hoverService);
        this.initLayout(accessor);
        Registry.as(Extensions10.Workbench).start(accessor);
        Registry.as(EditorExtensions.EditorFactory).start(accessor);
        this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));
        const editorMaximizedContext = EditorMaximizedContext.bindTo(accessor.get(IContextKeyService));
        this._register(this.onDidChangeEditorMaximized(() => {
          editorMaximizedContext.set(this.isEditorMaximized());
        }));
        const contextKeyService = accessor.get(IContextKeyService);
        const isPhoneLayoutCtx = IsPhoneLayoutContext.bindTo(contextKeyService);
        this._register(autorun((reader) => {
          isPhoneLayoutCtx.set(this.layoutPolicy.viewportClass.read(reader) === "phone");
        }));
        SinglePaneLayoutEnabledContext.bindTo(contextKeyService).set(this.isSinglePaneLayoutEnabled);
        accessor.get(IMobileVisualViewport);
        this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
        this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
        this.createWorkbenchLayout();
        if (this.layoutPolicy.viewportClass.get() === "phone") {
          this.createMobileTitlebar();
        }
        this.createWorkbenchManagement(instantiationService);
        this.layout();
        this.restore(lifecycleService);
      });
      return instantiationService;
    } catch (error) {
      onUnexpectedError(error);
      throw error;
    }
  }
  initServices(serviceCollection) {
    serviceCollection.set(IAgentWorkbenchLayoutService, this);
    serviceCollection.set(ITitleService, new SyncDescriptor(TitleService, []));
    const contributedServices = getSingletonServiceDescriptors();
    for (const [id2, descriptor] of contributedServices) {
      serviceCollection.set(id2, descriptor);
    }
    const instantiationService = new InstantiationService(serviceCollection, true);
    instantiationService.invokeFunction((accessor) => {
      const lifecycleService = accessor.get(ILifecycleService);
      lifecycleService.phase = 2 /* Ready */;
    });
    return instantiationService;
  }
  registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
    this._register(CommandsRegistry.registerCommand(CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID, () => {
      if (this.layoutPolicy.viewportClass.get() === "phone") {
        this.closeMobileSidebarDrawer();
      }
    }));
    this._register(configurationService.onDidChangeConfiguration((e4) => this.updateFontAliasing(e4, configurationService)));
    if (isNative) {
      this._register(storageService.onWillSaveState((e4) => {
        if (e4.reason === 1 /* SHUTDOWN */) {
          this.storeFontInfo(storageService);
        }
      }));
    } else {
      this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
    }
    this._register(storageService.onWillSaveState(() => this._savePartSizes()));
    this._register(lifecycleService.onWillShutdown((event) => this._onWillShutdown.fire(event)));
    this._register(lifecycleService.onDidShutdown(() => {
      this._onDidShutdown.fire();
      this.dispose();
    }));
    this._register(hostService.onDidChangeFocus((focus) => {
      if (!focus) {
        storageService.flush();
      }
    }));
    this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add("modal-dialog-visible")));
    this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove("modal-dialog-visible")));
  }
  updateFontAliasing(e4, configurationService) {
    if (!isMacintosh) {
      return;
    }
    if (e4 && !e4.affectsConfiguration("workbench.fontAliasing")) {
      return;
    }
    const aliasing = configurationService.getValue("workbench.fontAliasing");
    if (this.fontAliasing === aliasing) {
      return;
    }
    this.fontAliasing = aliasing;
    const fontAliasingValues = ["antialiased", "none", "auto"];
    this.mainContainer.classList.remove(...fontAliasingValues.map((value2) => `monaco-font-aliasing-${value2}`));
    if (fontAliasingValues.some((option2) => option2 === aliasing)) {
      this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
    }
  }
  restoreFontInfo(storageService, configurationService) {
    const storedFontInfoRaw = storageService.get("editorFontInfo", -1 /* APPLICATION */);
    if (storedFontInfoRaw) {
      try {
        const storedFontInfo = JSON.parse(storedFontInfoRaw);
        if (Array.isArray(storedFontInfo)) {
          FontMeasurements.restoreFontInfo(mainWindow, storedFontInfo);
        }
      } catch (err) {
      }
    }
    FontMeasurements.readFontInfo(mainWindow, createBareFontInfoFromRawSettings(configurationService.getValue("editor"), PixelRatio.getInstance(mainWindow).value));
  }
  storeFontInfo(storageService) {
    const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
    if (serializedFontInfo) {
      storageService.store("editorFontInfo", JSON.stringify(serializedFontInfo), -1 /* APPLICATION */, 1 /* MACHINE */);
    }
  }
  _loadPartVisibility(storageService) {
    if (this.layoutPolicy.viewportClass.get() === "phone") {
      return {};
    }
    const raw = storageService.get(_Workbench._PART_VISIBILITY_KEY, 1 /* WORKSPACE */);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        storageService.remove(_Workbench._PART_VISIBILITY_KEY, 1 /* WORKSPACE */);
      }
    }
    return {};
  }
  /**
   * Overlays the persisted part visibility on top of the current
   * (layout-policy default) `partVisibility` state. Must run before the
   * `WorkbenchContextKeysHandler` reads the initial visibility so that
   * context keys like `auxiliaryBarVisible` reflect the restored state on
   * reload rather than the hardcoded defaults.
   */
  _applyPersistedPartVisibility() {
    const savedPartVisibility = this._loadPartVisibility(this.storageService);
    this.partVisibility.editor = savedPartVisibility.editor ?? this.partVisibility.editor;
    this.partVisibility.auxiliaryBar = savedPartVisibility.auxiliaryBar ?? this.partVisibility.auxiliaryBar;
    this.partVisibility.sidebar = savedPartVisibility.sidebar ?? this.partVisibility.sidebar;
    if (this.isSinglePaneLayoutEnabled) {
      this.partVisibility.panel = savedPartVisibility.panel ?? this.partVisibility.panel;
    }
  }
  _savePartVisibility() {
    if (this.layoutPolicy.viewportClass.get() === "phone") {
      return;
    }
    this.storageService.store(_Workbench._PART_VISIBILITY_KEY, JSON.stringify({
      editor: this.partVisibility.editor,
      auxiliaryBar: this.partVisibility.auxiliaryBar,
      sidebar: this.partVisibility.sidebar,
      // Only the single-pane layout persists panel visibility at the workbench
      // level; the classic layout tracks it per session instead.
      panel: this.isSinglePaneLayoutEnabled ? this.partVisibility.panel : void 0
    }), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  _loadPartSizes(storageService) {
    const raw = storageService.get(_Workbench._PART_SIZES_KEY, 1 /* WORKSPACE */);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        storageService.remove(_Workbench._PART_SIZES_KEY, 1 /* WORKSPACE */);
      }
    }
    return {};
  }
  _savePartSizes() {
    if (!this.workbenchGrid) {
      return;
    }
    const editorNodeVisible = this._editorNodeShouldBeVisible();
    const editorGridWidth = this._persistedGridViewSize(this.editorPartView, "width", editorNodeVisible);
    let editorWidth = this._persistedEditorWidth(editorGridWidth);
    const savedEditorWidth = this._savedPartSizes.editor !== void 0 && this._savedPartSizes.editor >= EDITOR_PART_MINIMUM_WIDTH ? this._savedPartSizes.editor : void 0;
    if (this.isSinglePaneLayoutEnabled && !this.partVisibility.editor || editorWidth === void 0 || editorWidth < EDITOR_PART_MINIMUM_WIDTH) {
      editorWidth = savedEditorWidth;
    } else {
      this._savedPartSizes = { ...this._savedPartSizes, editor: editorWidth };
    }
    const sizes = {
      sidebar: this._persistedGridViewSize(this.sideBarPartView, "width", this.partVisibility.sidebar),
      auxiliaryBar: this._persistedGridViewSize(this.auxiliaryBarPartView, "width", this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)),
      sessions: this._persistedGridViewSize(this.sessionsPartView, "width", this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */)),
      editor: editorWidth,
      panel: this._persistedGridViewSize(this.panelPartView, "height", this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */))
    };
    this.storageService.store(_Workbench._PART_SIZES_KEY, JSON.stringify(sizes), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  //#endregion
  renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
    setARIAContainer(this.mainContainer);
    setProgressAccessibilitySignalScheduler((msDelayTime, msLoopTime) => instantiationService.createInstance(AccessibilityProgressSignalScheduler, msDelayTime, msLoopTime));
    const initialDimension = getClientArea(this.parent);
    this.layoutPolicy.update(initialDimension.width, initialDimension.height);
    const visibilityDefaults = this.layoutPolicy.getPartVisibilityDefaults();
    this.partVisibility.sidebar = visibilityDefaults.sidebar;
    this.partVisibility.auxiliaryBar = visibilityDefaults.auxiliaryBar;
    this.partVisibility.panel = visibilityDefaults.panel;
    this.partVisibility.sessions = visibilityDefaults.sessions;
    this.partVisibility.editor = visibilityDefaults.editor;
    this._applyPersistedPartVisibility();
    this._savedPartSizes = this._loadPartSizes(storageService);
    if (this._savedPartSizes.auxiliaryBar !== void 0) {
      this._restoreAuxiliaryBarWidth(this._savedPartSizes.auxiliaryBar);
    }
    const platformClass = isWindows ? "windows" : isLinux ? "linux" : "mac";
    const workbenchClasses = coalesce([
      "monaco-workbench",
      "agent-sessions-workbench",
      "modern-ui-tabs" /* MODERN_UI_TABS */,
      "modern-ui-notifications-dialogs" /* MODERN_UI_NOTIFICATIONS_DIALOGS */,
      // LayoutClasses.SHELL_GRADIENT_BACKGROUND,
      platformClass,
      isWeb ? "web" : void 0,
      isChrome2 ? "chromium" : isFirefox2 ? "firefox" : isSafari2 ? "safari" : void 0,
      ...this.getLayoutClasses(),
      ...this.options?.extraClasses ? this.options.extraClasses : []
    ]);
    this.mainContainer.classList.add(...workbenchClasses);
    this.updateFontAliasing(void 0, configurationService);
    this.restoreFontInfo(storageService, configurationService);
    for (const { id: id2, role, classes: classes2 } of [
      { id: "workbench.parts.titlebar" /* TITLEBAR_PART */, role: "none", classes: ["titlebar"] },
      { id: "workbench.parts.sidebar" /* SIDEBAR_PART */, role: "none", classes: ["sidebar", "left"] },
      { id: "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, role: "none", classes: ["auxiliarybar", "basepanel", "right"] },
      { id: "workbench.parts.panel" /* PANEL_PART */, role: "none", classes: ["panel", "basepanel", positionToString(this.getPanelPosition())] }
    ]) {
      const partContainer = this.createPartContainer(id2, role, classes2);
      mark(`code/willCreatePart/${id2}`);
      this.getPart(id2).create(partContainer);
      mark(`code/didCreatePart/${id2}`);
    }
    this.createEditorPart();
    this.createSessionsPart();
    this.createCustomViewGridPart();
    this.createNotificationsHandlers(instantiationService, notificationService);
    this.parent.appendChild(this.mainContainer);
  }
  createMobileTitlebar() {
    this.mobileTopBarDisposables.clear();
    const mobileTitlebar = this.mobileTopBarDisposables.add(this.instantiationService.createInstance(MobileTitlebarPart, this.mainContainer));
    this.mobileTopBarElement = mobileTitlebar.element;
    this.mobileTopBarDisposables.add(mobileTitlebar.onDidClickHamburger(() => {
      this.toggleMobileSidebarDrawer();
    }));
    this.mobileTopBarDisposables.add(mobileTitlebar.onDidClickNewSession(() => {
      this.sessionsService.openNewSession();
      this.closeMobileSidebarDrawer();
      this.sessionsPartService.focusSession(this.sessionsService.activeSession.get());
    }));
  }
  toggleMobileSidebarDrawer() {
    const isOpen = this.partVisibility.sidebar;
    if (isOpen) {
      this.closeMobileSidebarDrawer();
    } else {
      this.openMobileSidebarDrawer();
    }
  }
  openMobileSidebarDrawer() {
    if (!this.mobileNavStack.has("sidebar")) {
      this.mobileNavStack.push("sidebar");
    }
    this.setSideBarHidden(false);
  }
  closeMobileSidebarDrawer() {
    this.setSideBarHidden(true);
    if (this.mobileNavStack.has("sidebar")) {
      this.mobileNavStack.popSilently("sidebar");
    }
  }
  createNotificationsHandlers(instantiationService, notificationService) {
    this.registerNotificationRowHeight();
    const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.mainContainer, notificationService.model));
    const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.mainContainer, notificationService.model));
    this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
    const notificationsStatus = this._register(instantiationService.createInstance(NotificationsStatus, notificationService.model));
    this._register(notificationsCenter.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
      notificationsToasts.update(notificationsCenter.isVisible);
    }));
    this._register(notificationsToasts.onDidChangeVisibility(() => {
      notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
    }));
    registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);
    AccessibleViewRegistry.register(new NotificationAccessibleView());
    this.registerNotifications({
      onDidChangeNotificationsVisibility: Event2.map(
        Event2.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility),
        () => notificationsToasts.isVisible || notificationsCenter.isVisible
      )
    });
  }
  registerNotificationRowHeight() {
    this._register(autorun((reader) => {
      setNotificationRowHeight(this.layoutPolicy.isPhoneLayout.read(reader) ? PHONE_NOTIFICATION_ROW_HEIGHT : COMPACT_NOTIFICATION_ROW_HEIGHT);
    }));
    this._register(toDisposable(() => setNotificationRowHeight(DEFAULT_NOTIFICATION_ROW_HEIGHT)));
  }
  createPartContainer(id2, role, classes2) {
    const part = document.createElement("div");
    part.classList.add("part", ...classes2);
    part.id = id2;
    part.setAttribute("role", role);
    return part;
  }
  createEditorPart() {
    const editorPartContainer = document.createElement("div");
    editorPartContainer.classList.add("part", "editor");
    editorPartContainer.id = "workbench.parts.editor" /* EDITOR_PART */;
    editorPartContainer.setAttribute("role", "main");
    this._register(addDisposableListener(editorPartContainer, EventType.FOCUS_IN, () => this._restoreEditorPartOnActivation()));
    this._register(addDisposableGenericMouseDownListener(editorPartContainer, () => this._restoreEditorPartOnActivation()));
    this._editorPartContainer = editorPartContainer;
    mark("code/willCreatePart/workbench.parts.editor");
    this.getPart("workbench.parts.editor" /* EDITOR_PART */).create(editorPartContainer, { restorePreviousState: false });
    mark("code/didCreatePart/workbench.parts.editor");
    this.mainContainer.appendChild(editorPartContainer);
  }
  createSessionsPart() {
    const sessionsPartContainer = document.createElement("div");
    sessionsPartContainer.classList.add("part", "sessionspart", "basepanel", "right", AGENTS_PART_CARD_CLASS);
    sessionsPartContainer.id = "workbench.parts.sessions" /* SESSIONS_PART */;
    sessionsPartContainer.setAttribute("role", "main");
    this._register(addDisposableListener(sessionsPartContainer, EventType.FOCUS_IN, () => this._restoreSessionsPartOnActivation()));
    this._register(addDisposableGenericMouseDownListener(sessionsPartContainer, () => this._restoreSessionsPartOnActivation()));
    mark(`code/willCreatePart/${"workbench.parts.sessions" /* SESSIONS_PART */}`);
    this.getPart("workbench.parts.sessions" /* SESSIONS_PART */).create(sessionsPartContainer);
    mark(`code/didCreatePart/${"workbench.parts.sessions" /* SESSIONS_PART */}`);
    this.mainContainer.appendChild(sessionsPartContainer);
  }
  _restoreSessionsPartOnActivation() {
    if (!this.workbenchGrid || !this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow)) {
      return;
    }
    this._restoreMinimizedPartOnActivation(this.sessionsPartView, this.editorPartView);
  }
  _restoreEditorPartOnActivation() {
    if (!this.workbenchGrid || !this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) || !this.isVisible("workbench.parts.sessions" /* SESSIONS_PART */)) {
      return;
    }
    this._restoreMinimizedPartOnActivation(this.editorPartView, this.sessionsPartView);
  }
  _restoreMinimizedPartOnActivation(target, sibling) {
    const targetSize = this.workbenchGrid.getViewSize(target);
    if (targetSize.width !== this._minimumPartWidthForActivation(target)) {
      return;
    }
    const siblingSize = this.workbenchGrid.getViewSize(sibling);
    const siblingMinimumWidth = this._minimumPartWidthForActivation(sibling);
    if (siblingSize.width > siblingMinimumWidth) {
      this.workbenchGrid.resizeView(sibling, { width: siblingMinimumWidth, height: siblingSize.height });
    }
  }
  _minimumPartWidthForActivation(view) {
    return view.minimumWidth;
  }
  createCustomViewGridPart() {
    const customViewGridPartContainer = document.createElement("div");
    customViewGridPartContainer.classList.add("part", "customviewgridpart", "basepanel", "right", AGENTS_PART_CARD_CLASS);
    customViewGridPartContainer.id = "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */;
    customViewGridPartContainer.setAttribute("role", "main");
    mark(`code/willCreatePart/${"workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */}`);
    this.getPart("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */).create(customViewGridPartContainer);
    mark(`code/didCreatePart/${"workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */}`);
    this.mainContainer.appendChild(customViewGridPartContainer);
  }
  restore(lifecycleService) {
    mark("code/didStartWorkbench");
    performance.measure("perf: workbench create & restore", "code/didLoadWorkbenchMain", "code/didStartWorkbench");
    this.restoreParts();
    void this.sessionsService.restoreVisibleSessions().catch((e4) => {
      this.logService.error("[Workbench] restoreVisibleSessions failed", e4);
    });
    lifecycleService.phase = 3 /* Restored */;
    this.setRestored();
    const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
      this._register(runWhenWindowIdle(mainWindow, () => lifecycleService.phase = 4 /* Eventually */, 2500));
    }, 2500));
    eventuallyPhaseScheduler.schedule();
  }
  restoreParts() {
    const partsToRestore = [
      { location: 0 /* Sidebar */, visible: this.partVisibility.sidebar },
      { location: 1 /* Panel */, visible: this.partVisibility.panel },
      { location: 2 /* AuxiliaryBar */, visible: this.partVisibility.auxiliaryBar }
    ];
    for (const { location: location2, visible } of partsToRestore) {
      if (visible) {
        const defaultViewContainer = this.viewDescriptorService.getDefaultViewContainer(location2);
        if (defaultViewContainer) {
          this.paneCompositeService.openPaneComposite(defaultViewContainer.id, location2);
        }
      }
    }
  }
  //#endregion
  //#region Initialization
  initLayout(accessor) {
    this.editorGroupService = accessor.get(IEditorGroupsService);
    this.editorService = accessor.get(IEditorService);
    this.paneCompositeService = accessor.get(IPaneCompositePartService);
    this.viewDescriptorService = accessor.get(IViewDescriptorService);
    this.sessionsService = accessor.get(ISessionsService);
    this.sessionsPartService = accessor.get(ISessionsPartService);
    this.customViewService = accessor.get(ICustomViewService);
    this.customViewGridPartService = accessor.get(ICustomViewGridPartService);
    this.instantiationService = accessor.get(IInstantiationService);
    this.storageService = accessor.get(IStorageService);
    accessor.get(ITitleService);
    this.layoutPolicy.setSinglePane(this.isSinglePaneLayoutEnabled);
    this.registerLayoutListeners();
    this._customViewVisibleKey = CustomViewVisibleContext.bindTo(accessor.get(IContextKeyService));
    this._register(autorun((reader) => {
      this._applyCustomViewGridVisibility(this.customViewService.activeCustomView.read(reader));
    }));
    this._register(this.editorService.onWillOpenEditor((e4) => this.revealEditorOnOpen(e4)));
    this._register(this.editorService.onDidCloseEditor(() => this.handleDidCloseEditor()));
    this._mainContainerDimension = getClientArea(this.parent, new Dimension(800, 600));
    this.layoutPolicy.update(this._mainContainerDimension.width, this._mainContainerDimension.height);
    const visDefaults = this.layoutPolicy.getPartVisibilityDefaults();
    this.partVisibility.sidebar = visDefaults.sidebar;
    this.partVisibility.auxiliaryBar = visDefaults.auxiliaryBar;
    this.partVisibility.panel = visDefaults.panel;
    this.partVisibility.sessions = visDefaults.sessions;
    this.partVisibility.editor = visDefaults.editor;
    this._applyPersistedPartVisibility();
  }
  areAllGroupsInMainPartEmpty() {
    for (const group2 of this.editorGroupService.mainPart.groups) {
      if (!group2.isEmpty) {
        return false;
      }
    }
    return true;
  }
  revealEditorOnOpen(e4) {
    if (this._editorPartAutoVisibilitySuppressionCount > 0) {
      return;
    }
    const group2 = this.editorGroupService.mainPart.groups.find((g) => g.id === e4.groupId);
    if (!group2) {
      return;
    }
    if (!this.partVisibility.editor) {
      this.setEditorHidden(
        false,
        /* explicit */
        true
      );
      this.restoreAttachedEditorMaximizedState();
    }
  }
  handleDidCloseEditor() {
    if (this._editorPartAutoVisibilitySuppressionCount > 0 || !this.areAllGroupsInMainPartEmpty()) {
      return;
    }
    this._handleAllEditorsClosed();
  }
  suppressEditorPartAutoVisibility() {
    this._editorPartAutoVisibilitySuppressionCount++;
    let disposed = false;
    return toDisposable(() => {
      if (disposed) {
        return;
      }
      disposed = true;
      this._editorPartAutoVisibilitySuppressionCount--;
    });
  }
  rememberAttachedEditorMaximizedState() {
    this._restoreAttachedEditorMaximizedOnShow = this._editorMaximized && this.partVisibility.auxiliaryBar;
  }
  restoreAttachedEditorMaximizedState() {
    const shouldRestore = this._restoreAttachedEditorMaximizedOnShow && this.partVisibility.auxiliaryBar;
    this._restoreAttachedEditorMaximizedOnShow = false;
    if (shouldRestore) {
      this.setEditorMaximized(true);
    }
  }
  //#region Side-pane layout hooks (classic grid defaults; overridden by SinglePaneWorkbench)
  _fireDidChangePartVisibility(partId, visible, source) {
    this._onDidChangePartVisibility.fire({ partId, visible, source });
  }
  _notifyContainerDidLayout() {
    this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
  }
  _setMainEditorAreaHidden(hidden) {
    this.mainContainer.classList.toggle("nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */, hidden);
  }
  /**
   * Handles a change in the editor-part grid view's visibility. In the classic
   * layout the editor part is a standalone grid view, so its view visibility *is*
   * the editor visibility — map it to `setEditorHidden` and raise the part event.
   * Single-pane overrides this: its editor-part grid view also hosts the docked
   * auxiliary bar, so the view can become visible purely to show the detail while
   * the editor content stays hidden; it fires its own editor-part events instead.
   */
  _onEditorPartGridVisibilityChange(visible) {
    this.setEditorHidden(!visible);
    this._onDidChangePartVisibility.fire({ partId: "workbench.parts.editor" /* EDITOR_PART */, visible });
  }
  isEditorPartAutoVisibilitySuppressed() {
    return this._isEditorPartAutoVisibilitySuppressed;
  }
  get _isEditorPartAutoVisibilitySuppressed() {
    return this._editorPartAutoVisibilitySuppressionCount > 0;
  }
  /** Toggles the container marker class for the side-pane layout. */
  _applyLayoutContainerClass() {
    this.mainContainer.classList.toggle("dock-detail-panel", false);
  }
  /** Width the auxiliary bar occupies when visible (for max-editor-dimension math). */
  _auxiliaryBarLayoutWidth() {
    return this.workbenchGrid ? this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width : 0;
  }
  _auxiliaryBarViewSize() {
    if (!this.workbenchGrid || !this.auxiliaryBarPartView) {
      return { width: 0, height: 0 };
    }
    return this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
  }
  _setAuxiliaryBarViewSize(size3) {
    if (this.auxiliaryBarPartView) {
      this.workbenchGrid.resizeView(this.auxiliaryBarPartView, size3);
    }
  }
  _resizeAuxiliaryBarBy(deltaWidth, deltaHeight) {
    if (!this.auxiliaryBarPartView) {
      return;
    }
    const currentSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
    this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
      width: currentSize.width + deltaWidth,
      height: currentSize.height + deltaHeight
    });
  }
  _restoreAuxiliaryBarWidth(_width) {
  }
  /**
   * Reads a part's size from the workbench grid for persistence. For visible
   * parts, the current view size; for hidden parts, the grid's cached visible
   * size (the size it had the last time it was shown) so toggling visibility
   * later restores the same dimensions. Overridden by the single-pane layout for
   * its docked auxiliary bar, which is not a grid view.
   */
  _persistedGridViewSize(view, dimension, visible) {
    if (visible) {
      return this.workbenchGrid.getViewSize(view)[dimension];
    }
    return this.workbenchGrid.getViewCachedVisibleSize(view);
  }
  _persistedEditorWidth(editorGridWidth) {
    return editorGridWidth;
  }
  _defaultSideBarSize(policySideBarSize) {
    return policySideBarSize;
  }
  _editorNodeSize(effectiveEditorWidth, _effectiveAuxBarWidth) {
    return effectiveEditorWidth;
  }
  _editorNodeVisible(editorVisible, _auxBarVisible) {
    return editorVisible;
  }
  _topRightSectionChildren(sessionsNode, editorNode, auxiliaryBarNode, customViewGridNode) {
    return [sessionsNode, editorNode, auxiliaryBarNode, customViewGridNode];
  }
  /** Attach any per-layout controllers once the editor part container exists. */
  _attachSidePane() {
  }
  /** Lay out any docked overlay. */
  _layoutSidePane() {
  }
  /** React to a whole-grid change (e.g. a sash drag) after the grid rebuilds. */
  _onGridDidChange() {
  }
  /** React to the editor grid node being resized to `nodeWidth`. */
  _onEditorNodeResized(_nodeWidth) {
  }
  /** Run editor-node work with the reveal-sync suspended (no-op for the grid layout). */
  _runWithEditorResizeSyncSuspended(fn) {
    fn();
  }
  _applyEditorVisibility(hidden) {
    const shouldApplyEvenSplit = !hidden && !this._hasAppliedInitialEditorSplit;
    const mainAreaWidth = this.workbenchGrid.getViewSize(this.sessionsPartView).width;
    this.workbenchGrid.setViewVisible(this.editorPartView, this._editorNodeShouldBeVisible());
    if (shouldApplyEvenSplit) {
      this._hasAppliedInitialEditorSplit = true;
      this._applyEditorSplitSize(mainAreaWidth);
    }
  }
  _onWillHideAuxiliaryBar(_hidden) {
  }
  _applyAuxiliaryBarVisibility(hidden, _source) {
    if (this.workbenchGrid) {
      this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
    }
  }
  _shouldOpenAuxiliaryPaneComposite(_containerId) {
    return true;
  }
  _handleAllEditorsClosed() {
    if (this.partVisibility.editor) {
      this.rememberAttachedEditorMaximizedState();
      this.setEditorHidden(true);
    }
  }
  _prepareSideBarResize(_hidden) {
    return {};
  }
  _applySideBarResize(_hidden, _context) {
  }
  //#endregion
  registerLayoutListeners() {
    this._register(onDidChangeFullscreen((windowId) => {
      if (windowId === getWindowId(mainWindow)) {
        this.mainWindowFullscreen = isFullscreen(mainWindow);
        this.updateFullscreenClass();
        this.layout();
      }
    }));
    const onWindowResize = () => this.layout();
    this._register(addDisposableListener(mainWindow, "resize", onWindowResize));
    const visualViewport = getWindow(this.parent).visualViewport;
    if (visualViewport && !isIOS) {
      this._register(addDisposableListener(visualViewport, "resize", () => {
        if (this.layoutPolicy.viewportClass.get() === "phone") {
          this.layout();
        }
      }));
    }
  }
  updateFullscreenClass() {
    if (this.mainWindowFullscreen) {
      this.mainContainer.classList.add("fullscreen" /* FULLSCREEN */);
    } else {
      this.mainContainer.classList.remove("fullscreen" /* FULLSCREEN */);
    }
  }
  //#endregion
  //#region Workbench Layout Creation
  createWorkbenchLayout() {
    this._applyLayoutContainerClass();
    const titleBar = this.getPart("workbench.parts.titlebar" /* TITLEBAR_PART */);
    const editorPart = this.getPart("workbench.parts.editor" /* EDITOR_PART */);
    const panelPart = this.getPart("workbench.parts.panel" /* PANEL_PART */);
    const auxiliaryBarPart = this.getPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    const sideBar = this.getPart("workbench.parts.sidebar" /* SIDEBAR_PART */);
    const sessionsPart = this.getPart("workbench.parts.sessions" /* SESSIONS_PART */);
    const customViewGridPart = this.getPart("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */);
    this.titleBarPartView = titleBar;
    this.sideBarPartView = sideBar;
    this.panelPartView = panelPart;
    this.auxiliaryBarPartView = auxiliaryBarPart;
    this.sessionsPartView = sessionsPart;
    this.customViewGridPartView = customViewGridPart;
    this.editorPartView = editorPart;
    const viewMap = {
      ["workbench.parts.titlebar" /* TITLEBAR_PART */]: this.titleBarPartView,
      ["workbench.parts.panel" /* PANEL_PART */]: this.panelPartView,
      ["workbench.parts.sidebar" /* SIDEBAR_PART */]: this.sideBarPartView,
      ["workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */]: this.auxiliaryBarPartView,
      ["workbench.parts.sessions" /* SESSIONS_PART */]: this.sessionsPartView,
      ["workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */]: this.customViewGridPartView,
      ["workbench.parts.editor" /* EDITOR_PART */]: this.editorPartView
    };
    const fromJSON = ({ type }) => viewMap[type];
    const workbenchGrid = SerializableGrid.deserialize(
      this.createGridDescriptor(),
      { fromJSON },
      { proportionalLayout: false }
    );
    this.mainContainer.prepend(workbenchGrid.element);
    this.mainContainer.setAttribute("role", "application");
    this.workbenchGrid = workbenchGrid;
    this.workbenchGrid.edgeSnapping = this.mainWindowFullscreen;
    this._register(this.workbenchGrid.onDidChange(() => {
      this._onGridDidChange();
    }));
    this._hasAppliedInitialEditorSplit = this.partVisibility.editor;
    for (const part of [titleBar, panelPart, sideBar, auxiliaryBarPart, sessionsPart, editorPart]) {
      this._register(part.onDidVisibilityChange((visible) => {
        if (this._applyingCustomViewGridVisibility) {
          return;
        }
        if (part === editorPart) {
          this._onEditorPartGridVisibilityChange(visible);
          this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
          return;
        }
        if (part === sideBar) {
          this.setSideBarHidden(!visible);
        } else if (part === panelPart) {
          this.setPanelHidden(!visible);
        } else if (part === auxiliaryBarPart) {
          this.setAuxiliaryBarHidden(!visible);
        } else if (part === sessionsPart) {
          this.setSessionsHidden(!visible);
        }
        this._onDidChangePartVisibility.fire({ partId: part.getId(), visible });
        this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
      }));
    }
    this._register(this.mobileNavStack.onDidPop((layer) => {
      switch (layer) {
        case "sidebar":
          this.closeMobileSidebarDrawer();
          break;
        case "panel":
          this.setPanelHidden(true);
          break;
        case "auxbar":
          this.setAuxiliaryBarHidden(true);
          break;
        case "customView":
          this.customViewService.hideCustomView();
          break;
        case "editor":
          break;
      }
    }));
  }
  createWorkbenchManagement(instantiationService) {
    instantiationService.invokeFunction((accessor) => accessor.get(ISessionsSetUpService));
  }
  /**
   * Creates the grid descriptor for the Agent Sessions layout.
   *
   * Structure (horizontal orientation):
   * - Sidebar (left, spans full height from top to bottom)
   * - Right section (vertical):
   *   - Titlebar (top of right section)
   *   - Top right (horizontal): Chat Bar | Editor | Auxiliary Bar
   *   - Panel (below chat, editor, and auxiliary bar)
   */
  createGridDescriptor() {
    const { width: width2, height } = this._mainContainerDimension;
    return this.createDesktopGridDescriptor(width2, height);
  }
  /**
   * Standard multi-part layout for all viewport classes.
   * On phone, the titlebar is hidden via CSS and a MobileTitlebarPart
   * is prepended before the grid. Sidebar/panel/auxbar are hidden
   * in the grid via partVisibility defaults.
   */
  createDesktopGridDescriptor(width2, height) {
    const sizes = this.layoutPolicy.getPartSizes(width2, height);
    const defaultSideBarSize = this._defaultSideBarSize(sizes.sideBarSize);
    const sideBarSize = this._savedPartSizes.sidebar ?? (this.partVisibility.sidebar ? defaultSideBarSize : Math.max(defaultSideBarSize, 250));
    const defaultAuxiliaryBarSize = this.isSinglePaneLayoutEnabled ? this.getDockedAuxiliaryBarWidth() : sizes.auxiliaryBarSize;
    const auxiliaryBarSize = this._savedPartSizes.auxiliaryBar ?? (this.partVisibility.auxiliaryBar ? defaultAuxiliaryBarSize : Math.max(defaultAuxiliaryBarSize, 300));
    const panelSize = this._savedPartSizes.panel ?? (this.partVisibility.panel ? sizes.panelSize : Math.max(sizes.panelSize, 250));
    const savedEditorWidth = this._savedPartSizes.editor;
    const editorSize = savedEditorWidth !== void 0 && savedEditorWidth >= EDITOR_PART_MINIMUM_WIDTH ? savedEditorWidth : EDITOR_PART_DEFAULT_WIDTH;
    const titleBarHeight = this.titleBarPartView?.minimumHeight ?? 30;
    const effectiveSideBarWidth = this.partVisibility.sidebar ? sideBarSize : 0;
    const rightSectionWidth = Math.max(0, width2 - effectiveSideBarWidth);
    const effectiveAuxBarWidth = this.partVisibility.auxiliaryBar ? auxiliaryBarSize : 0;
    const effectiveEditorWidth = this.partVisibility.editor ? editorSize : 0;
    const sessionsWidth = this._savedPartSizes.sessions ?? Math.max(0, rightSectionWidth - effectiveAuxBarWidth - effectiveEditorWidth);
    const contentHeight = Math.max(0, height - titleBarHeight);
    const topRightHeight = Math.max(0, contentHeight - panelSize);
    const isPhone = this.layoutPolicy.viewportClass.get() === "phone";
    const titleBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.titlebar" /* TITLEBAR_PART */ },
      size: titleBarHeight,
      visible: !isPhone
    };
    const sideBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.sidebar" /* SIDEBAR_PART */ },
      size: sideBarSize,
      visible: this.partVisibility.sidebar
    };
    const sessionsNode = {
      type: "leaf",
      data: { type: "workbench.parts.sessions" /* SESSIONS_PART */ },
      size: sessionsWidth,
      visible: this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */)
    };
    const customViewGridNode = {
      type: "leaf",
      data: { type: "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */ },
      size: rightSectionWidth,
      visible: this.partVisibility.customViewGrid
    };
    const editorNode = {
      type: "leaf",
      data: { type: "workbench.parts.editor" /* EDITOR_PART */ },
      size: this._editorNodeSize(effectiveEditorWidth, effectiveAuxBarWidth),
      visible: this._editorNodeShouldBeVisible()
    };
    const auxiliaryBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ },
      size: auxiliaryBarSize,
      visible: this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)
    };
    const panelNode = {
      type: "leaf",
      data: { type: "workbench.parts.panel" /* PANEL_PART */ },
      size: panelSize,
      visible: this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */)
    };
    const topRightSection = {
      type: "branch",
      data: this._topRightSectionChildren(sessionsNode, editorNode, auxiliaryBarNode, customViewGridNode),
      size: topRightHeight
    };
    const rightSection = {
      type: "branch",
      data: [topRightSection, panelNode],
      size: rightSectionWidth
    };
    const contentSection = {
      type: "branch",
      data: [sideBarNode, rightSection],
      size: contentHeight
    };
    const result = {
      root: {
        type: "branch",
        size: width2,
        data: [
          titleBarNode,
          contentSection
        ]
      },
      orientation: 0 /* VERTICAL */,
      width: width2,
      height
    };
    return result;
  }
  layout() {
    const layoutViewportDimension = getClientArea(
      this.mainWindowFullscreen ? mainWindow.document.body : this.parent
    );
    const previousClass = this._previousViewportClass;
    this.layoutPolicy.update(layoutViewportDimension.width, layoutViewportDimension.height);
    const currentClass = this.layoutPolicy.viewportClass.get();
    this._mainContainerDimension = currentClass === "phone" ? getMobileViewportDimension(layoutViewportDimension, getWindow(this.parent).visualViewport) : layoutViewportDimension;
    this.mainContainer.classList.toggle("phone-layout" /* PHONE_LAYOUT */, currentClass === "phone");
    if (previousClass !== void 0 && previousClass !== currentClass) {
      if (currentClass === "phone" && !this.mobileTopBarElement) {
        this.createMobileTitlebar();
        this.workbenchGrid.setViewVisible(this.titleBarPartView, false);
        const defaults = this.layoutPolicy.getPartVisibilityDefaults();
        if (this.partVisibility.sidebar !== defaults.sidebar) {
          this.setSideBarHidden(!defaults.sidebar);
        }
        if (this.partVisibility.auxiliaryBar !== defaults.auxiliaryBar) {
          this.setAuxiliaryBarHidden(!defaults.auxiliaryBar);
        }
        if (this.partVisibility.panel !== defaults.panel) {
          this.setPanelHidden(!defaults.panel);
        }
      } else if (currentClass !== "phone" && this.mobileTopBarElement) {
        this.mobileTopBarDisposables.clear();
        this.mobileTopBarElement = void 0;
        this.workbenchGrid.setViewVisible(this.titleBarPartView, true);
        const defaults = this.layoutPolicy.getPartVisibilityDefaults();
        if (this.partVisibility.sidebar !== defaults.sidebar) {
          this.setSideBarHidden(!defaults.sidebar);
        }
        if (this.partVisibility.sessions !== defaults.sessions) {
          this.setSessionsHidden(!defaults.sessions);
        }
        if (this.partVisibility.auxiliaryBar !== defaults.auxiliaryBar) {
          this.setAuxiliaryBarHidden(!defaults.auxiliaryBar);
        }
        if (this.partVisibility.panel !== defaults.panel) {
          this.setPanelHidden(!defaults.panel);
        }
      }
      for (const partId of ["workbench.parts.sessions" /* SESSIONS_PART */, "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */, "workbench.parts.sidebar" /* SIDEBAR_PART */, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, "workbench.parts.panel" /* PANEL_PART */]) {
        this.parts.get(partId)?.updateStyles();
      }
      this._updateMobileCustomViewNavigation();
    }
    this._previousViewportClass = currentClass;
    this.logService.trace(`Workbench#layout, height: ${this._mainContainerDimension.height}, width: ${this._mainContainerDimension.width}`);
    size(this.mainContainer, this._mainContainerDimension.width, this._mainContainerDimension.height);
    this._layoutGrid();
    this._attachSidePane();
    this._layoutSidePane();
    this.layoutMobileSidebar();
    this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
  }
  _layoutGrid() {
    const mobileTopBarHeight = this.mobileTopBarElement?.offsetHeight ?? 0;
    const isPhone = this.layoutPolicy.viewportClass.get() === "phone";
    const gridGutterW = isPhone ? 0 : AGENTS_FLOATING_PANEL_GAP + (this.partVisibility.sidebar ? 0 : AGENTS_FLOATING_PANEL_GAP);
    const gridGutterH = isPhone ? 0 : AGENTS_FLOATING_PANEL_GAP;
    this.workbenchGrid.layout(
      this._mainContainerDimension.width - gridGutterW,
      this._mainContainerDimension.height - mobileTopBarHeight - gridGutterH
    );
  }
  handleDockedEditorPartLayout(nodeWidth) {
    this._onEditorNodeResized(nodeWidth);
  }
  isEditorRevealedExplicitly() {
    return this._editorRevealedExplicitly;
  }
  revealEditorPartExplicitly() {
    this._editorRevealedExplicitly = true;
    this.setEditorHidden(
      false,
      /* explicit */
      true
    );
  }
  getDockedAuxiliaryBarWidth() {
    return 0;
  }
  setDockedAuxiliaryBarWidth(_width) {
  }
  getPreferredEditorPartWidth() {
    return void 0;
  }
  layoutMobileSidebar() {
    const sidebarContainer = this.getContainer(mainWindow, "workbench.parts.sidebar" /* SIDEBAR_PART */);
    const sidebarPart = this.getPart("workbench.parts.sidebar" /* SIDEBAR_PART */);
    if (!sidebarContainer) {
      return;
    }
    const isPhone = this.layoutPolicy.viewportClass.get() === "phone";
    if (!isPhone || !this.partVisibility.sidebar) {
      sidebarContainer.classList.remove("mobile-overlay-sidebar");
      return;
    }
    sidebarContainer.classList.add("mobile-overlay-sidebar");
    const topBarHeight = this.mobileTopBarElement?.offsetHeight ?? 48;
    const drawerWidth = this._mainContainerDimension.width;
    const drawerHeight = Math.max(0, this._mainContainerDimension.height - topBarHeight);
    sidebarPart.layout(drawerWidth, drawerHeight, topBarHeight, 0);
  }
  handleContainerDidLayout(container2, dimension) {
    this._onDidLayoutContainer.fire({ container: container2, dimension });
    if (container2 === this.mainContainer) {
      this._onDidLayoutMainContainer.fire(dimension);
    }
    if (container2 === this.activeContainer) {
      this._onDidLayoutActiveContainer.fire(dimension);
    }
  }
  isFloatingPanelsEnabled() {
    return false;
  }
  isModernUICompact() {
    return false;
  }
  getLayoutClasses() {
    return coalesce([
      !this.partVisibility.sidebar ? "nosidebar" /* SIDEBAR_HIDDEN */ : void 0,
      !this._effectiveVisible("workbench.parts.editor" /* EDITOR_PART */) ? "nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */ : void 0,
      !this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */) ? "nopanel" /* PANEL_HIDDEN */ : void 0,
      !this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? "noauxiliarybar" /* AUXILIARYBAR_HIDDEN */ : void 0,
      !this.isEditorPaneVisible() ? "noeditorpane" /* EDITOR_PANE_HIDDEN */ : void 0,
      !this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */) ? "nosessionspart" /* SESSIONS_HIDDEN */ : void 0,
      !this.partVisibility.customViewGrid ? "nocustomviewgrid" /* CUSTOM_VIEW_GRID_HIDDEN */ : void 0,
      "nostatusbar" /* STATUSBAR_HIDDEN */,
      // agents window never has a status bar
      this.mainWindowFullscreen ? "fullscreen" /* FULLSCREEN */ : void 0,
      this.layoutPolicy.viewportClass.get() === "phone" ? "phone-layout" /* PHONE_LAYOUT */ : void 0
    ]);
  }
  isEditorPaneVisible() {
    return this._effectiveVisible("workbench.parts.editor" /* EDITOR_PART */) || this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
  }
  _updateEditorPaneVisibilityClass() {
    this.mainContainer.classList.toggle("noeditorpane" /* EDITOR_PANE_HIDDEN */, !this.isEditorPaneVisible());
  }
  //#endregion
  //#region Part Management
  registerPart(part) {
    const id2 = part.getId();
    this.parts.set(id2, part);
    return toDisposable(() => this.parts.delete(id2));
  }
  getPart(key3) {
    const part = this.parts.get(key3);
    if (!part) {
      throw new Error(`Unknown part ${key3}`);
    }
    return part;
  }
  hasFocus(part) {
    const container2 = this.getContainer(mainWindow, part);
    if (!container2) {
      return false;
    }
    const activeElement = getActiveElement();
    if (!activeElement) {
      return false;
    }
    return isAncestorUsingFlowTo(activeElement, container2);
  }
  focusPart(part, targetWindow = mainWindow) {
    switch (part) {
      case "workbench.parts.editor" /* EDITOR_PART */:
        this.editorGroupService.activeGroup.focus();
        break;
      case "workbench.parts.panel" /* PANEL_PART */:
        this.paneCompositeService.getActivePaneComposite(1 /* Panel */)?.focus();
        break;
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)?.focus();
        break;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)?.focus();
        break;
      case "workbench.parts.sessions" /* SESSIONS_PART */:
        this.getPart("workbench.parts.sessions" /* SESSIONS_PART */).getContainer()?.focus();
        break;
      case "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */:
        this.customViewGridPartService.focusActiveView();
        break;
      default: {
        const container2 = this.getContainer(targetWindow, part);
        container2?.focus();
      }
    }
  }
  focus() {
    this.focusPart("workbench.parts.sessions" /* SESSIONS_PART */);
  }
  getContainer(targetWindow, part) {
    if (typeof part === "undefined") {
      return this.getContainerFromDocument(targetWindow.document);
    }
    if (targetWindow === mainWindow) {
      return this.parts.get(part)?.getContainer();
    }
    if (part === "workbench.parts.editor" /* EDITOR_PART */) {
      const container2 = this.getContainerFromDocument(targetWindow.document);
      const partCandidate = this.editorGroupService.getPart(container2);
      if (partCandidate instanceof Part) {
        return partCandidate.getContainer();
      }
    }
    return void 0;
  }
  whenContainerStylesLoaded(_window) {
    return void 0;
  }
  //#endregion
  //#region Part Visibility
  isActivityBarHidden() {
    return true;
  }
  static {
    /**
     * Parts a visible custom view replaces. While the custom view grid is shown
     * these keep their desired (per-session) visibility state but are not
     * rendered, so hiding the custom view restores whatever the layout
     * controller last asked for — including changes made while it was shown.
     */
    this._CUSTOM_VIEW_EXCLUSIVE_PARTS = [
      "workbench.parts.sessions" /* SESSIONS_PART */,
      "workbench.parts.editor" /* EDITOR_PART */,
      "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */,
      "workbench.parts.panel" /* PANEL_PART */
    ];
  }
  /** The desired visibility of a part, ignoring any custom view showing over it. */
  _desiredVisible(part) {
    switch (part) {
      case "workbench.parts.sessions" /* SESSIONS_PART */:
        return this.partVisibility.sessions;
      case "workbench.parts.editor" /* EDITOR_PART */:
        return this.partVisibility.editor;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        return this.partVisibility.auxiliaryBar;
      case "workbench.parts.panel" /* PANEL_PART */:
        return this.partVisibility.panel;
      default:
        return false;
    }
  }
  /** Whether a part is actually rendered right now. */
  _effectiveVisible(part) {
    return this._desiredVisible(part) && !this.partVisibility.customViewGrid;
  }
  /**
   * Whether the editor grid node should be shown. In the single-pane layout the
   * node also hosts the docked auxiliary bar, so it follows both parts.
   */
  _editorNodeShouldBeVisible() {
    return this._editorNodeVisible(this._effectiveVisible("workbench.parts.editor" /* EDITOR_PART */), this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
  }
  isVisible(part, targetWindow) {
    switch (part) {
      case "workbench.parts.titlebar" /* TITLEBAR_PART */:
        return this.layoutPolicy.viewportClass.get() !== "phone";
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        return this.partVisibility.sidebar;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
      case "workbench.parts.editor" /* EDITOR_PART */:
      case "workbench.parts.panel" /* PANEL_PART */:
      case "workbench.parts.sessions" /* SESSIONS_PART */:
        return this._effectiveVisible(part);
      case "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */:
        return this.partVisibility.customViewGrid;
      case "workbench.parts.activitybar" /* ACTIVITYBAR_PART */:
      case "workbench.parts.statusbar" /* STATUSBAR_PART */:
      case "workbench.parts.banner" /* BANNER_PART */:
      default:
        return false;
    }
  }
  setPartHidden(hidden, part) {
    switch (part) {
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        this.setSideBarHidden(hidden);
        break;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        this.setAuxiliaryBarHidden(hidden);
        break;
      case "workbench.parts.editor" /* EDITOR_PART */:
        this.setEditorHidden(hidden);
        break;
      case "workbench.parts.panel" /* PANEL_PART */:
        this.setPanelHidden(hidden);
        break;
      case "workbench.parts.sessions" /* SESSIONS_PART */:
        this.setSessionsHidden(hidden);
        break;
    }
  }
  toggleSecondarySideBar() {
    if (this.partVisibility.customViewGrid) {
      return;
    }
    const visible = !this.isSecondarySideBarVisible();
    this.setAuxiliaryBarHidden(!visible);
    alert(visible ? localize(3868, null) : localize(3867, null));
  }
  isSecondarySideBarVisible() {
    return this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
  }
  isSidePaneVisible() {
    const { editor, auxiliaryBar } = this._getSidePaneState();
    return editor || auxiliaryBar;
  }
  toggleSidePane() {
    const sidePaneHadFocus = this.hasFocus("workbench.parts.editor" /* EDITOR_PART */) || this.hasFocus("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    const stateBeforeToggle = this._getSidePaneState();
    const editorWasMaximized = this.isEditorMaximized();
    this._onWillToggleSidePane.fire();
    try {
      if (editorWasMaximized) {
        this.setEditorMaximized(false);
      }
      const visible2 = !this.isSidePaneVisible();
      if (!visible2) {
        this._restoreSidePaneEditorMaximizedOnShow = editorWasMaximized;
      }
      const suppressEditorPartAutoVisibility = this.suppressEditorPartAutoVisibility();
      try {
        if (visible2) {
          const restore2 = this._sidePaneStateBeforeHide ?? this._defaultSidePaneState;
          this.setEditorHidden(!restore2.editor, false, true);
          this._setAuxiliaryBarHidden(!restore2.auxiliaryBar, void 0, true);
        } else {
          this._sidePaneStateBeforeHide = this._getSidePaneState();
          this.setEditorHidden(true);
          this._setAuxiliaryBarHidden(true, void 0, true);
        }
      } finally {
        suppressEditorPartAutoVisibility.dispose();
      }
      if (!stateBeforeToggle.editor && !stateBeforeToggle.auxiliaryBar && this.isSidePaneVisible()) {
        this._onSidePaneRevealed();
      }
      if (visible2) {
        const restoreEditorMaximized = this._restoreSidePaneEditorMaximizedOnShow;
        this._restoreSidePaneEditorMaximizedOnShow = false;
        if (restoreEditorMaximized) {
          this.setEditorMaximized(true);
        }
      }
    } finally {
      this._onDidToggleSidePane.fire({ before: stateBeforeToggle, after: this._getSidePaneState() });
    }
    const visible = this.isSidePaneVisible();
    if (!visible && sidePaneHadFocus) {
      this.focusPart("workbench.parts.sessions" /* SESSIONS_PART */);
    }
    return visible;
  }
  hideSidePane() {
    if (this.isSidePaneVisible()) {
      this.toggleSidePane();
    }
  }
  _getSidePaneState() {
    const editor = this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
    const auxiliaryBar = this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    return { editor, auxiliaryBar };
  }
  setSideBarHidden(hidden) {
    if (this.partVisibility.sidebar === !hidden) {
      return;
    }
    const resizeContext = this._prepareSideBarResize(hidden);
    this.partVisibility.sidebar = !hidden;
    this.mainContainer.classList.toggle("nosidebar" /* SIDEBAR_HIDDEN */, hidden);
    this.workbenchGrid.setViewVisible(
      this.sideBarPartView,
      !hidden
    );
    this._applySideBarResize(hidden, resizeContext);
    if (hidden && this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)) {
      this.paneCompositeService.hideActivePaneComposite(0 /* Sidebar */);
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)) {
      const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(0 /* Sidebar */) ?? this.viewDescriptorService.getDefaultViewContainer(0 /* Sidebar */)?.id;
      if (viewletToOpen) {
        this.paneCompositeService.openPaneComposite(viewletToOpen, 0 /* Sidebar */);
      }
    }
    this.layoutMobileSidebar();
    this._savePartVisibility();
    this._layoutGrid();
  }
  setAuxiliaryBarHidden(hidden) {
    this._setAuxiliaryBarHidden(hidden);
  }
  setAuxiliaryBarHiddenForResize(hidden) {
    this._setAuxiliaryBarHidden(hidden, "resize");
  }
  _setAuxiliaryBarHidden(hidden, source, skipSidePaneReveal = false) {
    if (this.partVisibility.auxiliaryBar === !hidden) {
      return;
    }
    const sidePaneWasClosed = !this.partVisibility.editor && !this.partVisibility.auxiliaryBar;
    if (hidden) {
      this._restoreAttachedEditorMaximizedOnShow = false;
    }
    this._onWillHideAuxiliaryBar(hidden);
    this.partVisibility.auxiliaryBar = !hidden;
    this.mainContainer.classList.toggle("noauxiliarybar" /* AUXILIARYBAR_HIDDEN */, !this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
    this._applyAuxiliaryBarVisibility(hidden, source);
    this._updateEditorPaneVisibilityClass();
    if (hidden && this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)) {
      this.paneCompositeService.hideActivePaneComposite(2 /* AuxiliaryBar */);
    }
    if (!hidden && !this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)) {
      const paneCompositeToOpen = this.paneCompositeService.getLastActivePaneCompositeId(2 /* AuxiliaryBar */) ?? this.viewDescriptorService.getDefaultViewContainer(2 /* AuxiliaryBar */)?.id;
      if (paneCompositeToOpen && this._shouldOpenAuxiliaryPaneComposite(paneCompositeToOpen)) {
        this.paneCompositeService.openPaneComposite(paneCompositeToOpen, 2 /* AuxiliaryBar */);
      }
    }
    if (!source) {
      this._savePartVisibility();
    }
    if (!hidden && sidePaneWasClosed && !skipSidePaneReveal) {
      this._onSidePaneRevealed();
    }
  }
  /**
   * Whether the given auxiliary-bar view container currently has content to show
   * (mirrors `IViewsService.isViewContainerActive`: a `hideIfEmpty` container is
   * only active once it has at least one active view descriptor). Used to avoid
   * presenting an empty docked detail panel.
   */
  _isAuxViewContainerActive(containerId) {
    const viewContainer = this.viewDescriptorService.getViewContainerById(containerId);
    if (!viewContainer) {
      return false;
    }
    if (!viewContainer.hideIfEmpty) {
      return true;
    }
    return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
  }
  setEditorHidden(hidden, explicit = false, skipSidePaneReveal = false) {
    if (this.partVisibility.editor === !hidden) {
      return;
    }
    const sidePaneWasClosed = !this.partVisibility.editor && !this.partVisibility.auxiliaryBar;
    const panelSizeBeforeEditorReveal = !hidden && this.isSinglePaneLayoutEnabled && this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */) ? this.workbenchGrid.getViewSize(this.panelPartView) : void 0;
    this._editorRevealedExplicitly = !hidden && explicit;
    this._runWithEditorResizeSyncSuspended(() => {
      if (hidden && this._editorMaximized) {
        this.setEditorMaximized(false);
      }
      this.partVisibility.editor = !hidden;
      this.mainContainer.classList.toggle("nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */, !this._effectiveVisible("workbench.parts.editor" /* EDITOR_PART */));
      if (this.editorPartView) {
        this._applyEditorVisibility(hidden);
      }
      this._updateEditorPaneVisibilityClass();
      this._savePartVisibility();
    });
    if (panelSizeBeforeEditorReveal) {
      this.workbenchGrid.resizeView(this.panelPartView, panelSizeBeforeEditorReveal);
    }
    if (!hidden && sidePaneWasClosed && !skipSidePaneReveal) {
      this._onSidePaneRevealed();
    }
  }
  /**
   * Fires when the side pane (editor part and/or auxiliary bar) transitions from
   * fully hidden to visible.
   */
  _onSidePaneRevealed() {
    this._onDidRevealSidePane.fire();
  }
  /**
   * Sizes the editor part when it is first revealed from a hidden state, so it
   * opens as a comfortable split with the sessions part rather than at its
   * minimum/restored width. The default grid layout splits the main area evenly;
   * layouts with different sizing (e.g. the single-pane side pane) override this.
   */
  _applyEditorSplitSize(mainAreaWidth) {
    const targetEditorWidth = Math.max(EDITOR_PART_MINIMUM_WIDTH, Math.floor(mainAreaWidth / 2));
    const currentEditorSize = this.workbenchGrid.getViewSize(this.editorPartView);
    this.workbenchGrid.resizeView(this.editorPartView, {
      width: targetEditorWidth,
      height: currentEditorSize.height
    });
  }
  setPanelHidden(hidden) {
    if (this.partVisibility.panel === !hidden) {
      return;
    }
    if (hidden && this.workbenchGrid.hasMaximizedView()) {
      this.workbenchGrid.exitMaximizedView();
    }
    const panelHadFocus = !hidden || this.hasFocus("workbench.parts.panel" /* PANEL_PART */);
    this.partVisibility.panel = !hidden;
    this.mainContainer.classList.toggle("nopanel" /* PANEL_HIDDEN */, !this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */));
    this.workbenchGrid.setViewVisible(
      this.panelPartView,
      this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */)
    );
    if (hidden && this.paneCompositeService.getActivePaneComposite(1 /* Panel */)) {
      this.paneCompositeService.hideActivePaneComposite(1 /* Panel */);
      if (panelHadFocus) {
        this.focusPart("workbench.parts.sessions" /* SESSIONS_PART */);
      }
    }
    if (!hidden) {
      if (!this.paneCompositeService.getActivePaneComposite(1 /* Panel */)) {
        const panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(1 /* Panel */) ?? this.viewDescriptorService.getDefaultViewContainer(1 /* Panel */)?.id;
        if (panelToOpen) {
          this.paneCompositeService.openPaneComposite(panelToOpen, 1 /* Panel */);
        }
      }
      if (this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */)) {
        this.focusPart("workbench.parts.panel" /* PANEL_PART */);
      }
    }
    if (this.isSinglePaneLayoutEnabled) {
      this._savePartVisibility();
    }
  }
  setSessionsHidden(hidden) {
    if (this.partVisibility.sessions === !hidden) {
      return;
    }
    this.partVisibility.sessions = !hidden;
    this.mainContainer.classList.toggle("nosessionspart" /* SESSIONS_HIDDEN */, !this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */));
    this.workbenchGrid.setViewVisible(this.sessionsPartView, this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */));
  }
  /**
   * Shows or hides the custom view grid. The custom view grid and the sessions
   * grid are mutually exclusive and exactly one of them owns the row, so hiding
   * the custom view always brings the sessions grid back (together with the side
   * panel and panel state the layout wants for the active session). The parts it
   * covers keep their desired visibility while it is shown, so the restore
   * reflects whatever the layout controller last asked for.
   */
  _applyCustomViewGridVisibility(descriptor) {
    const visible = !!descriptor;
    if (this.partVisibility.customViewGrid === visible) {
      this.customViewGridPartService.setView(descriptor);
      return;
    }
    const wasVisible = _Workbench._CUSTOM_VIEW_EXCLUSIVE_PARTS.map((part) => this._effectiveVisible(part));
    if (visible && this._editorMaximized) {
      this.setEditorMaximized(false);
    }
    if (visible && this.workbenchGrid) {
      this._customViewCoveredPartWidths = {
        editor: this._editorNodeShouldBeVisible() ? this.workbenchGrid.getViewSize(this.editorPartView).width : void 0,
        auxiliaryBar: this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? this._auxiliaryBarViewSize().width : void 0
      };
    }
    this.customViewGridPartService.setView(descriptor);
    this.partVisibility.customViewGrid = visible;
    this._customViewVisibleKey.set(visible);
    if (!this.workbenchGrid) {
      return;
    }
    this._applyingCustomViewGridVisibility = true;
    try {
      this._runWithEditorResizeSyncSuspended(() => {
        if (visible) {
          this.workbenchGrid.setViewVisible(this.customViewGridPartView, true);
          this._applyExclusivePartVisibility();
        } else {
          this._applyExclusivePartVisibility();
          this.workbenchGrid.setViewVisible(this.customViewGridPartView, false);
          this._restoreCustomViewCoveredPartWidths();
        }
      });
    } finally {
      this._applyingCustomViewGridVisibility = false;
    }
    this._updateExclusiveLayoutClasses();
    this.mainContainer.classList.toggle("nocustomviewgrid" /* CUSTOM_VIEW_GRID_HIDDEN */, !visible);
    this._updateMobileCustomViewNavigation();
    if (visible) {
      this._fireDidChangePartVisibility("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */, true);
    }
    _Workbench._CUSTOM_VIEW_EXCLUSIVE_PARTS.forEach((part, index2) => {
      const nowVisible = this._effectiveVisible(part);
      if (nowVisible !== wasVisible[index2]) {
        this._fireDidChangePartVisibility(part, nowVisible);
      }
    });
    if (!visible) {
      this._fireDidChangePartVisibility("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */, false);
    }
    this.layout();
    if (visible) {
      this.focusPart("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */);
    } else {
      this.sessionsPartService.focusSession(this.sessionsService.activeSession.get());
    }
  }
  _restoreCustomViewCoveredPartWidths() {
    const widths = this._customViewCoveredPartWidths;
    this._customViewCoveredPartWidths = void 0;
    if (widths?.auxiliaryBar && this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      this._setAuxiliaryBarViewSize({ ...this._auxiliaryBarViewSize(), width: widths.auxiliaryBar });
    }
    if (widths?.editor && this._editorNodeShouldBeVisible()) {
      this.workbenchGrid.resizeView(this.editorPartView, { ...this.workbenchGrid.getViewSize(this.editorPartView), width: widths.editor });
    }
  }
  _applyExclusivePartVisibility() {
    this.workbenchGrid.setViewVisible(this.sessionsPartView, this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */));
    this.workbenchGrid.setViewVisible(this.panelPartView, this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */));
    this._applyEditorAreaVisibility();
  }
  /** Pushes the editor and auxiliary bar node visibility into the grid. */
  _applyEditorAreaVisibility() {
    this.workbenchGrid.setViewVisible(this.editorPartView, this._editorNodeShouldBeVisible());
    this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
  }
  _updateExclusiveLayoutClasses() {
    this.mainContainer.classList.toggle("nosessionspart" /* SESSIONS_HIDDEN */, !this._effectiveVisible("workbench.parts.sessions" /* SESSIONS_PART */));
    this.mainContainer.classList.toggle("nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */, !this._effectiveVisible("workbench.parts.editor" /* EDITOR_PART */));
    this.mainContainer.classList.toggle("noauxiliarybar" /* AUXILIARYBAR_HIDDEN */, !this._effectiveVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */));
    this.mainContainer.classList.toggle("nopanel" /* PANEL_HIDDEN */, !this._effectiveVisible("workbench.parts.panel" /* PANEL_PART */));
    this._updateEditorPaneVisibilityClass();
  }
  /** Keeps the Android back button in sync with a shown custom view. */
  _updateMobileCustomViewNavigation() {
    const tracked = this.layoutPolicy.viewportClass.get() === "phone" && this.partVisibility.customViewGrid;
    if (tracked === this.mobileNavStack.has("customView")) {
      return;
    }
    if (tracked) {
      this.mobileNavStack.push("customView");
    } else {
      this.mobileNavStack.popSilently("customView");
    }
  }
  //#endregion
  //#region Position Methods (Fixed - Not Configurable)
  getSideBarPosition() {
    return 0 /* LEFT */;
  }
  getPanelPosition() {
    return 2 /* BOTTOM */;
  }
  setPanelPosition(_position) {
  }
  getPanelAlignment() {
    return "justify";
  }
  setPanelAlignment(_alignment) {
  }
  //#endregion
  //#region Size Methods
  getSize(part) {
    if (part === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
      return this._auxiliaryBarViewSize();
    }
    const view = this.getPartView(part);
    if (!view) {
      return { width: 0, height: 0 };
    }
    return this.workbenchGrid.getViewSize(view);
  }
  setSize(part, size3) {
    if (part === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
      this._setAuxiliaryBarViewSize(size3);
      return;
    }
    const view = this.getPartView(part);
    if (view) {
      this.workbenchGrid.resizeView(view, size3);
    }
  }
  resizePart(part, sizeChangeWidth, sizeChangeHeight) {
    if (part === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) {
      this._resizeAuxiliaryBarBy(sizeChangeWidth, sizeChangeHeight);
      return;
    }
    const view = this.getPartView(part);
    if (!view) {
      return;
    }
    const currentSize = this.workbenchGrid.getViewSize(view);
    this.workbenchGrid.resizeView(view, {
      width: currentSize.width + sizeChangeWidth,
      height: currentSize.height + sizeChangeHeight
    });
  }
  getPartView(part) {
    switch (part) {
      case "workbench.parts.titlebar" /* TITLEBAR_PART */:
        return this.titleBarPartView;
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        return this.sideBarPartView;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        return this.auxiliaryBarPartView;
      case "workbench.parts.editor" /* EDITOR_PART */:
        return this.editorPartView;
      case "workbench.parts.panel" /* PANEL_PART */:
        return this.panelPartView;
      case "workbench.parts.sessions" /* SESSIONS_PART */:
        return this.sessionsPartView;
      case "workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */:
        return this.customViewGridPartView;
      default:
        return void 0;
    }
  }
  getMaximumEditorDimensions(_container) {
    const sidebarWidth = this.partVisibility.sidebar ? this.workbenchGrid.getViewSize(this.sideBarPartView).width : 0;
    const auxiliaryBarWidth = this.partVisibility.auxiliaryBar ? this._auxiliaryBarLayoutWidth() : 0;
    const panelHeight = this.partVisibility.panel ? this.workbenchGrid.getViewSize(this.panelPartView).height : 0;
    const titleBarHeight = this.workbenchGrid.getViewSize(this.titleBarPartView).height;
    return new Dimension(
      this._mainContainerDimension.width - sidebarWidth - auxiliaryBarWidth,
      this._mainContainerDimension.height - titleBarHeight - panelHeight
    );
  }
  //#endregion
  //#region Unsupported Features (No-ops)
  toggleMaximizedPanel() {
    if (!this.workbenchGrid) {
      return;
    }
    if (this.isPanelMaximized()) {
      this.workbenchGrid.exitMaximizedView();
    } else {
      this.workbenchGrid.maximizeView(this.panelPartView, [this.titleBarPartView, this.sideBarPartView]);
    }
  }
  isPanelMaximized() {
    if (!this.workbenchGrid) {
      return false;
    }
    return this.workbenchGrid.isViewMaximized(this.panelPartView);
  }
  toggleMaximizedAuxiliaryBar() {
  }
  setAuxiliaryBarMaximized(_maximized) {
    return false;
  }
  isAuxiliaryBarMaximized() {
    return false;
  }
  isEditorMaximized() {
    return this._editorMaximized;
  }
  setEditorMaximized(maximized) {
    if (maximized === this._editorMaximized) {
      return;
    }
    if (maximized) {
      this._editorLastNonMaximizedVisibility = {
        sidebar: this.partVisibility.sidebar,
        auxiliaryBar: this.partVisibility.auxiliaryBar,
        editor: this.partVisibility.editor,
        panel: this.partVisibility.panel,
        sessions: this.partVisibility.sessions,
        customViewGrid: this.partVisibility.customViewGrid
      };
      this._editorLastNonMaximizedSize = this.editorPartView ? this.workbenchGrid.getViewSize(this.editorPartView) : void 0;
      if (!this.partVisibility.editor) {
        this.setEditorHidden(false);
      }
      if (this.partVisibility.sidebar) {
        this.setSideBarHidden(true);
      }
      if (this.partVisibility.sessions) {
        this.setSessionsHidden(true);
      }
      this._editorMaximized = true;
    } else {
      const state = this._editorLastNonMaximizedVisibility;
      const size3 = this._editorLastNonMaximizedSize;
      this._editorLastNonMaximizedSize = void 0;
      this.setSideBarHidden(!state?.sidebar);
      this.setSessionsHidden(!state?.sessions);
      this.setAuxiliaryBarHidden(!state?.auxiliaryBar);
      this._editorMaximized = false;
      if (this.editorPartView && size3) {
        this.workbenchGrid.resizeView(this.editorPartView, size3);
      }
      this._layoutSidePane();
    }
    this._onDidChangeEditorMaximized.fire();
  }
  toggleZenMode() {
  }
  toggleMenuBar() {
  }
  isMainEditorLayoutCentered() {
    return false;
  }
  centerMainEditorLayout(_active2) {
  }
  hasMainWindowBorder() {
    return false;
  }
  getMainWindowBorderRadius() {
    return void 0;
  }
  //#endregion
  //#region Window Maximized State
  isWindowMaximized(targetWindow) {
    return this.maximized.has(getWindowId(targetWindow));
  }
  updateWindowMaximizedState(targetWindow, maximized) {
    const windowId = getWindowId(targetWindow);
    if (maximized) {
      this.maximized.add(windowId);
      if (targetWindow === mainWindow) {
        this.mainContainer.classList.add("maximized" /* MAXIMIZED */);
      }
    } else {
      this.maximized.delete(windowId);
      if (targetWindow === mainWindow) {
        this.mainContainer.classList.remove("maximized" /* MAXIMIZED */);
      }
    }
    this._onDidChangeWindowMaximized.fire({ windowId, maximized });
  }
  //#endregion
  //#region Neighbor Parts
  getVisibleNeighborPart(part, direction) {
    if (!this.workbenchGrid) {
      return void 0;
    }
    const view = this.getPartView(part);
    if (!view) {
      return void 0;
    }
    const neighbor = this.workbenchGrid.getNeighborViews(view, direction, false);
    if (neighbor.length === 0) {
      return void 0;
    }
    const neighborView = neighbor[0];
    if (neighborView === this.titleBarPartView) {
      return "workbench.parts.titlebar" /* TITLEBAR_PART */;
    }
    if (neighborView === this.sideBarPartView) {
      return "workbench.parts.sidebar" /* SIDEBAR_PART */;
    }
    if (neighborView === this.auxiliaryBarPartView) {
      return "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
    }
    if (neighborView === this.editorPartView) {
      return "workbench.parts.editor" /* EDITOR_PART */;
    }
    if (neighborView === this.panelPartView) {
      return "workbench.parts.panel" /* PANEL_PART */;
    }
    if (neighborView === this.sessionsPartView) {
      return "workbench.parts.sessions" /* SESSIONS_PART */;
    }
    return void 0;
  }
  //#endregion
  //#region Restore
  isRestored() {
    return this.restored;
  }
  setRestored() {
    this.restored = true;
    this.restoredPromise.complete();
  }
  //#endregion
  //#region Notifications Registration
  registerNotifications(delegate) {
    this._register(delegate.onDidChangeNotificationsVisibility((visible) => this._onDidChangeNotificationsVisibility.fire(visible)));
  }
  //#endregion
};
export { PHONE_NOTIFICATION_ROW_HEIGHT, IAgentWorkbenchLayoutService, CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID, Workbench };
