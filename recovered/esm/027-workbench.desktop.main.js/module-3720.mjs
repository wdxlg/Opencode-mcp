// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/layout.ts
import { Dimension, EventType, addDisposableListener, computeScreenAwareSize, getActiveDocument, getActiveElement, getActiveWindow, getClientArea, getWindow, getWindowId, getWindows, isActiveDocument, isAncestorUsingFlowTo, size } from "./module-0075.mjs";
import { DEFAULT_EMPTY_WINDOW_SIZE, DEFAULT_WORKSPACE_WINDOW_SIZE, getMenuBarVisibility, hasCustomTitlebar, hasNativeMenu, hasNativeTitlebar, useWindowControlsOverlay } from "./module-0515.mjs";
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DeferredPromise, Promises } from "./module-0036.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";
import { IConfigurationService, isConfigured } from "./module-0132.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkspaceContextService, isTemporaryWorkspace } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IAuxiliaryWindowService } from "./module-1594.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { ITitleService } from "./module-1595.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IBannerService } from "./module-1622.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IFileService } from "./module-0269.mjs";
import { isFullscreen, isWCOEnabled, onDidChangeFullscreen } from "./module-0018.mjs";
import { isIOS, isLinux, isMacintosh, isWeb, isWindows } from "./module-0014.mjs";
import { isFloatingTopEdgeExposed, isHorizontal, isMultiWindowPart, partOpensMaximizedFromString, positionFromString, positionToString, shouldShowCustomTitleBar } from "./module-1118.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { WINDOW_ACTIVE_BORDER, WINDOW_INACTIVE_BORDER } from "./module-0912.mjs";
import { SidebarPart } from "./module-1620.mjs";
import { PanelPart } from "./module-1605.mjs";
import { AuxiliaryBarPart } from "./module-1604.mjs";
import { coalesce } from "./module-0007.mjs";
import { isResourceEditorInput, pathsToEditors } from "./module-0925.mjs";
import { URI } from "./module-0032.mjs";
import { mark } from "./module-0506.mjs";
import { Part } from "./module-1566.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { SerializableGrid, Sizing2 } from "./module-1516.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { alert } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { ChatAIDisabledSettingId } from "./module-0950.mjs";


// src/vs/workbench/browser/layout.ts
var COMMAND_CENTER_SETTINGS = [
  "chat.agentsControl.enabled",
  "chat.unifiedAgentsBar.enabled",
  "workbench.navigationControl.enabled",
  "workbench.experimental.share.enabled"
];

var TITLE_BAR_SETTINGS = [
  "workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */,
  "window.commandCenter" /* COMMAND_CENTER */,
  ...COMMAND_CENTER_SETTINGS,
  "workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */,
  "workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */,
  "window.menuBarVisibility" /* MenuBarVisibility */,
  "window.titleBarStyle" /* TITLE_BAR_STYLE */,
  "window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */
];

var DEFAULT_EMPTY_WINDOW_DIMENSIONS = new Dimension(DEFAULT_EMPTY_WINDOW_SIZE.width, DEFAULT_EMPTY_WINDOW_SIZE.height);

var DEFAULT_WORKSPACE_WINDOW_DIMENSIONS = new Dimension(DEFAULT_WORKSPACE_WINDOW_SIZE.width, DEFAULT_WORKSPACE_WINDOW_SIZE.height);

var Layout = class extends Disposable {
  constructor(parent, layoutOptions) {
    super();
    this.parent = parent;
    this.layoutOptions = layoutOptions;
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
    this._onDidChangeNotificationsVisibility = this._register(new Emitter());
    this.onDidChangeNotificationsVisibility = this._onDidChangeNotificationsVisibility.event;
    this._onDidChangeAuxiliaryBarMaximized = this._register(new Emitter());
    this.onDidChangeAuxiliaryBarMaximized = this._onDidChangeAuxiliaryBarMaximized.event;
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
    this.containerStylesLoaded = /* @__PURE__ */ new Map();
    //#endregion
    this.parts = /* @__PURE__ */ new Map();
    this.initialized = false;
    this.disposed = false;
    this._openedDefaultEditors = false;
    this.whenReadyPromise = new DeferredPromise();
    this.whenReady = this.whenReadyPromise.p;
    this.whenRestoredPromise = new DeferredPromise();
    this.whenRestored = this.whenRestoredPromise.p;
    this.restored = false;
    this.inMaximizedAuxiliaryBarTransition = false;
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
  whenContainerStylesLoaded(window2) {
    return this.containerStylesLoaded.get(window2.vscodeWindowId);
  }
  get mainContainerDimension() {
    return this._mainContainerDimension;
  }
  get activeContainerDimension() {
    return this.getContainerDimension(this.activeContainer);
  }
  getContainerDimension(container3) {
    if (container3 === this.mainContainer) {
      return this.mainContainerDimension;
    } else {
      return getClientArea(container3);
    }
  }
  get mainContainerOffset() {
    return this.computeContainerOffset(mainWindow);
  }
  get activeContainerOffset() {
    return this.computeContainerOffset(getWindow(this.activeContainer));
  }
  computeContainerOffset(targetWindow) {
    let top2 = 0;
    let quickPickTop = 0;
    if (this.isVisible("workbench.parts.banner" /* BANNER_PART */)) {
      top2 = this.getPart("workbench.parts.banner" /* BANNER_PART */).maximumHeight;
      quickPickTop = top2;
    }
    const titlebarVisible = this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, targetWindow);
    if (titlebarVisible) {
      top2 += this.getPart("workbench.parts.titlebar" /* TITLEBAR_PART */).maximumHeight;
      quickPickTop = top2;
    }
    const isCommandCenterVisible = titlebarVisible && this.configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */) !== false;
    if (isCommandCenterVisible) {
      quickPickTop = 6;
    }
    return { top: top2, quickPickTop };
  }
  initLayout(accessor) {
    this.environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
    this.configurationService = accessor.get(IConfigurationService);
    this.hostService = accessor.get(IHostService);
    this.contextService = accessor.get(IWorkspaceContextService);
    this.storageService = accessor.get(IStorageService);
    this.themeService = accessor.get(IThemeService);
    this.extensionService = accessor.get(IExtensionService);
    this.logService = accessor.get(ILogService);
    this.telemetryService = accessor.get(ITelemetryService);
    this.auxiliaryWindowService = accessor.get(IAuxiliaryWindowService);
    this.editorService = accessor.get(IEditorService);
    this.editorGroupService = accessor.get(IEditorGroupsService);
    this.mainPartEditorService = this.editorService.createScoped(this.editorGroupService.mainPart, this._store);
    this.paneCompositeService = accessor.get(IPaneCompositePartService);
    this.viewDescriptorService = accessor.get(IViewDescriptorService);
    this.titleService = accessor.get(ITitleService);
    this.notificationService = accessor.get(INotificationService);
    this.statusBarService = accessor.get(IStatusbarService);
    accessor.get(IBannerService);
    this.registerLayoutListeners();
    this.initLayoutState(accessor.get(ILifecycleService), accessor.get(IFileService));
  }
  registerLayoutListeners() {
    const showEditorIfHidden = (explicitUserAction) => {
      if (this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) || // already visible
      this.mainPartEditorService.visibleEditors.length === 0) {
        return;
      }
      if (this.isAuxiliaryBarMaximized()) {
        if (explicitUserAction !== false) {
          this.toggleMaximizedAuxiliaryBar();
        }
      } else {
        this.toggleMaximizedPanel();
      }
    };
    const maybeMaximizeAuxiliaryBar = () => {
      if (this.mainPartEditorService.visibleEditors.length === 0 && this.configurationService.getValue("workbench.secondarySideBar.forceMaximized" /* AUXILIARYBAR_FORCE_MAXIMIZED */) === true) {
        this.setAuxiliaryBarMaximized(true);
        return true;
      }
      return false;
    };
    this.editorGroupService.whenRestored.then(() => {
      this._register(this.mainPartEditorService.onDidVisibleEditorsChange((e) => {
        const handled = maybeMaximizeAuxiliaryBar();
        if (!handled) {
          showEditorIfHidden(e.isExplicit);
        }
      }));
      this._register(this.editorGroupService.mainPart.onDidActivateGroup((e) => {
        if (e.reason !== 1 /* PART_CLOSE */) {
          showEditorIfHidden();
        }
      }));
      this._register(this.mainPartEditorService.onDidActiveEditorChange(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED))));
    });
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if ([
        ...TITLE_BAR_SETTINGS,
        "workbench.sideBar.location" /* SIDEBAR_POSITION */,
        "workbench.statusBar.visible" /* STATUSBAR_VISIBLE */
      ].some((setting) => e.affectsConfiguration(setting))) {
        const enabledCommandCenterAction = COMMAND_CENTER_SETTINGS.some((setting) => e.affectsConfiguration(setting) && this.configurationService.getValue(setting) === true);
        if (enabledCommandCenterAction) {
          if (this.configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */) === false) {
            this.configurationService.updateValue("window.commandCenter" /* COMMAND_CENTER */, true);
            return;
          }
        }
        const editorActionsMovedToTitlebar = e.affectsConfiguration("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */) && this.configurationService.getValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */) === "titleBar" /* TITLEBAR */;
        const commandCenterEnabled = e.affectsConfiguration("window.commandCenter" /* COMMAND_CENTER */) && this.configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */);
        const layoutControlsEnabled = e.affectsConfiguration("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */) && this.configurationService.getValue("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */);
        const activityBarMovedToTopOrBottom = e.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) && ["top" /* TOP */, "bottom" /* BOTTOM */].includes(this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */));
        if (activityBarMovedToTopOrBottom || editorActionsMovedToTitlebar || commandCenterEnabled || layoutControlsEnabled) {
          if (this.configurationService.getValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */) === "never" /* NEVER */) {
            this.configurationService.updateValue("window.customTitleBarVisibility" /* CUSTOM_TITLE_BAR_VISIBILITY */, "auto" /* AUTO */);
            return;
          }
        }
        this.doUpdateLayoutConfiguration();
      }
      if (e.affectsConfiguration("workbench.shadows" /* SHADOWS */)) {
        this.updateShadows();
      }
      if (e.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */) || e.affectsConfiguration("window.density.layout" /* MODERN_UI_DENSITY */)) {
        this.updateFloatingPanels();
      }
      if (e.affectsConfiguration("workbench.secondarySideBar.forceMaximized" /* AUXILIARYBAR_FORCE_MAXIMIZED */)) {
        const forceMaximized = this.configurationService.getValue("workbench.secondarySideBar.forceMaximized" /* AUXILIARYBAR_FORCE_MAXIMIZED */);
        if (forceMaximized === true && this.mainPartEditorService.visibleEditors.length === 0) {
          this.setAuxiliaryBarMaximized(true);
        } else if (forceMaximized === false && this.isAuxiliaryBarMaximized()) {
          this.setAuxiliaryBarMaximized(false);
        }
      }
    }));
    this._register(onDidChangeFullscreen((windowId) => this.onFullscreenChanged(windowId)));
    this._register(this.editorGroupService.mainPart.onDidAddGroup(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED))));
    this._register(this.editorGroupService.mainPart.onDidRemoveGroup(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED))));
    this._register(this.editorGroupService.mainPart.onDidChangeGroupMaximized(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED))));
    this._register(addDisposableListener(this.mainContainer, EventType.SCROLL, () => this.mainContainer.scrollTop = 0));
    const showingCustomMenu = (isWindows || isLinux || isWeb) && !hasNativeTitlebar(this.configurationService);
    if (showingCustomMenu) {
      this._register(this.titleService.onMenubarVisibilityChange((visible) => this.onMenubarToggled(visible)));
    }
    this._register(this.themeService.onDidColorThemeChange(() => this.updateWindowBorder()));
    this._register(this.hostService.onDidChangeFocus((focused) => this.onWindowFocusChanged(focused)));
    this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChanged()));
    if (isWeb && typeof navigator.windowControlsOverlay === "object") {
      this._register(addDisposableListener(navigator.windowControlsOverlay, "geometrychange", () => this.onDidChangeWCO()));
    }
    this._register(this.auxiliaryWindowService.onDidOpenAuxiliaryWindow(({ window: window2, disposables }) => {
      const windowId = window2.window.vscodeWindowId;
      this.containerStylesLoaded.set(windowId, window2.whenStylesHaveLoaded);
      window2.whenStylesHaveLoaded.then(() => this.containerStylesLoaded.delete(windowId));
      disposables.add(toDisposable(() => this.containerStylesLoaded.delete(windowId)));
      const eventDisposables = disposables.add(new DisposableStore());
      this._onDidAddContainer.fire({ container: window2.container, disposables: eventDisposables });
      disposables.add(window2.onDidLayout((dimension) => this.handleContainerDidLayout(window2.container, dimension)));
    }));
  }
  onMenubarToggled(visible) {
    if (visible !== this.state.runtime.menuBar.toggled) {
      this.state.runtime.menuBar.toggled = visible;
      const menuBarVisibility = getMenuBarVisibility(this.configurationService);
      if (isWeb && menuBarVisibility === "toggle") {
        this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled));
      } else if (this.state.runtime.mainWindowFullscreen && (menuBarVisibility === "toggle" || menuBarVisibility === "classic")) {
        this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled));
      }
      this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
    }
  }
  handleContainerDidLayout(container3, dimension) {
    if (container3 === this.mainContainer) {
      this._onDidLayoutMainContainer.fire(dimension);
    }
    if (isActiveDocument(container3)) {
      this._onDidLayoutActiveContainer.fire(dimension);
    }
    this._onDidLayoutContainer.fire({ container: container3, dimension });
  }
  onFullscreenChanged(windowId) {
    if (windowId !== mainWindow.vscodeWindowId) {
      return;
    }
    this.state.runtime.mainWindowFullscreen = isFullscreen(mainWindow);
    if (this.state.runtime.mainWindowFullscreen) {
      this.mainContainer.classList.add("fullscreen" /* FULLSCREEN */);
    } else {
      this.mainContainer.classList.remove("fullscreen" /* FULLSCREEN */);
      const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
      if (zenModeExitInfo.transitionedToFullScreen && this.isZenModeActive()) {
        this.toggleZenMode();
      }
    }
    this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
    if (hasCustomTitlebar(this.configurationService)) {
      this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled));
      this.updateWindowBorder(true);
    }
  }
  onActiveWindowChanged() {
    const activeContainerId = this.getActiveContainerId();
    if (this.state.runtime.activeContainerId !== activeContainerId) {
      this.state.runtime.activeContainerId = activeContainerId;
      this.updateWindowBorder();
      this._onDidChangeActiveContainer.fire();
    }
  }
  onWindowFocusChanged(hasFocus) {
    if (this.state.runtime.hasFocus !== hasFocus) {
      this.state.runtime.hasFocus = hasFocus;
      this.updateWindowBorder();
    }
  }
  getActiveContainerId() {
    const activeContainer = this.activeContainer;
    return getWindow(activeContainer).vscodeWindowId;
  }
  doUpdateLayoutConfiguration(skipLayout) {
    this.updateCustomTitleBarVisibility();
    this.updateMenubarVisibility(!!skipLayout);
    this.editorGroupService.whenRestored.then(() => this.centerMainEditorLayout(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED), skipLayout));
  }
  isShadowsDisabled() {
    return this.configurationService.getValue("workbench.shadows" /* SHADOWS */) === false;
  }
  updateShadows() {
    const noShadows = this.isShadowsDisabled();
    for (const container3 of Array.from(this.containers)) {
      container3.classList.toggle("no-shadows" /* NO_SHADOWS */, noShadows);
    }
  }
  isFloatingPanelsEnabled() {
    return this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true;
  }
  isModernUICompact() {
    return this.isFloatingPanelsEnabled() && this.configurationService.getValue("window.density.layout" /* MODERN_UI_DENSITY */) === "compact" /* Compact */;
  }
  updateFloatingPanels() {
    this.mainContainer.classList.toggle("floating-panels" /* FLOATING_PANELS */, this.isFloatingPanelsEnabled());
    this.mainContainer.classList.toggle("modern-ui-compact" /* MODERN_UI_COMPACT */, this.isModernUICompact());
    this.updateWindowBorder();
  }
  setSideBarPosition(position2) {
    const activityBar = this.getPart("workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
    const sideBar = this.getPart("workbench.parts.sidebar" /* SIDEBAR_PART */);
    const auxiliaryBar = this.getPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    const newPositionValue = position2 === 0 /* LEFT */ ? "left" : "right";
    const oldPositionValue = position2 === 1 /* RIGHT */ ? "left" : "right";
    const panelAlignment = this.getPanelAlignment();
    const panelPosition = this.getPanelPosition();
    this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON, position2);
    const activityBarContainer = assertReturnsDefined(activityBar.getContainer());
    const sideBarContainer = assertReturnsDefined(sideBar.getContainer());
    const auxiliaryBarContainer = assertReturnsDefined(auxiliaryBar.getContainer());
    activityBarContainer.classList.remove(oldPositionValue);
    sideBarContainer.classList.remove(oldPositionValue);
    activityBarContainer.classList.add(newPositionValue);
    sideBarContainer.classList.add(newPositionValue);
    auxiliaryBarContainer.classList.remove(newPositionValue);
    auxiliaryBarContainer.classList.add(oldPositionValue);
    activityBar.updateStyles();
    sideBar.updateStyles();
    auxiliaryBar.updateStyles();
    this.adjustPartPositions(position2, panelAlignment, panelPosition);
  }
  updateWindowBorder(skipLayout = false) {
    const theme = this.themeService.getColorTheme();
    const didHaveMainWindowBorder = this.hasMainWindowBorder();
    const suppressMainWindowBorder = this.isFloatingPanelsEnabled() && !isHighContrast(theme.type);
    if (isWeb || isWindows || // not working well with zooming (border often not visible)
    (isWindows || isLinux) && useWindowControlsOverlay(this.configurationService) || hasNativeTitlebar(this.configurationService)) {
      return;
    }
    const activeBorder = theme.getColor(WINDOW_ACTIVE_BORDER);
    const inactiveBorder = theme.getColor(WINDOW_INACTIVE_BORDER);
    for (const container3 of this.containers) {
      const isMainContainer = container3 === this.mainContainer;
      const isActiveContainer = this.activeContainer === container3;
      let windowBorder = false;
      if (!(isMainContainer && suppressMainWindowBorder) && !this.state.runtime.mainWindowFullscreen && (activeBorder || inactiveBorder)) {
        windowBorder = true;
        const borderColor = isActiveContainer && this.state.runtime.hasFocus ? activeBorder : inactiveBorder ?? activeBorder;
        container3.style.setProperty("--window-border-color", borderColor?.toString() ?? "transparent");
      } else {
        container3.style.removeProperty("--window-border-color");
      }
      if (isMainContainer) {
        this.state.runtime.mainWindowBorder = windowBorder;
      }
      container3.classList.toggle("border" /* WINDOW_BORDER */, windowBorder);
    }
    if (!skipLayout && didHaveMainWindowBorder !== this.hasMainWindowBorder()) {
      this.layout();
    }
  }
  initLayoutState(lifecycleService, fileService) {
    this._mainContainerDimension = getClientArea(this.parent, this.contextService.getWorkbenchState() === 1 /* EMPTY */ ? DEFAULT_EMPTY_WINDOW_DIMENSIONS : DEFAULT_WORKSPACE_WINDOW_DIMENSIONS);
    this.stateModel = new LayoutStateModel(this.storageService, this.configurationService, this.contextService, this.environmentService);
    this.stateModel.load({
      mainContainerDimension: this._mainContainerDimension,
      resetLayout: Boolean(this.layoutOptions?.resetLayout)
    });
    this._register(this.stateModel.onDidChangeState((change) => {
      if (change.key === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
        this.setActivityBarHidden(change.value);
      }
      if (change.key === LayoutStateKeys.STATUSBAR_HIDDEN) {
        this.setStatusBarHidden(change.value);
      }
      if (change.key === LayoutStateKeys.SIDEBAR_POSITON) {
        this.setSideBarPosition(change.value);
      }
      if (change.key === LayoutStateKeys.PANEL_POSITION) {
        this.setPanelPosition(change.value);
      }
      if (change.key === LayoutStateKeys.PANEL_ALIGNMENT) {
        this.setPanelAlignment(change.value);
      }
      this.doUpdateLayoutConfiguration();
    }));
    const initialEditorsState = this.getInitialEditorsState();
    if (initialEditorsState) {
      this.logService.trace("Initial editor state", initialEditorsState);
    }
    const initialLayoutState = {
      layout: {
        editors: initialEditorsState?.layout
      },
      editor: {
        restoreEditors: this.shouldRestoreEditors(this.contextService, initialEditorsState),
        editorsToOpen: this.resolveEditorsToOpen(fileService, initialEditorsState)
      },
      views: {
        defaults: this.getDefaultLayoutViews(this.environmentService, this.storageService),
        containerToRestore: {}
      }
    };
    const layoutRuntimeState = {
      activeContainerId: this.getActiveContainerId(),
      mainWindowFullscreen: isFullscreen(mainWindow),
      hasFocus: this.hostService.hasFocus,
      maximized: /* @__PURE__ */ new Set(),
      mainWindowBorder: false,
      menuBar: {
        toggled: false
      },
      zenMode: {
        transitionDisposables: new DisposableMap()
      }
    };
    this.state = {
      initialization: initialLayoutState,
      runtime: layoutRuntimeState
    };
    if (this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      let viewContainerToRestore = this.storageService.get(SidebarPart.activeViewletSettingsKey, 1 /* WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(0 /* Sidebar */)?.id);
      if (!this.environmentService.isBuilt || lifecycleService.startupKind === 3 /* ReloadedWindow */ || this.environmentService.isExtensionDevelopment && !this.environmentService.extensionTestsLocationURI) {
      } else if (viewContainerToRestore !== this.viewDescriptorService.getDefaultViewContainer(0 /* Sidebar */)?.id && viewContainerToRestore !== this.viewDescriptorService.getDefaultViewContainer(2 /* AuxiliaryBar */)?.id) {
        viewContainerToRestore = this.viewDescriptorService.getDefaultViewContainer(0 /* Sidebar */)?.id;
      }
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.sideBar = viewContainerToRestore;
      } else {
        this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, true);
      }
    }
    if (this.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      const viewContainerToRestore = this.storageService.get(PanelPart.activePanelSettingsKey, 1 /* WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(1 /* Panel */)?.id);
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.panel = viewContainerToRestore;
      } else {
        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, true);
      }
    }
    if (this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      const viewContainerToRestore = this.storageService.get(AuxiliaryBarPart.activeViewSettingsKey, 1 /* WORKSPACE */, this.viewDescriptorService.getDefaultViewContainer(2 /* AuxiliaryBar */)?.id);
      if (viewContainerToRestore) {
        this.state.initialization.views.containerToRestore.auxiliaryBar = viewContainerToRestore;
      } else {
        this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, true);
      }
    }
    this.updateWindowBorder(true);
  }
  getDefaultLayoutViews(environmentService, storageService) {
    const defaultLayout = environmentService.options?.defaultLayout;
    if (!defaultLayout) {
      return void 0;
    }
    if (!defaultLayout.force && !storageService.isNew(1 /* WORKSPACE */)) {
      return void 0;
    }
    const { views } = defaultLayout;
    if (views?.length) {
      return views.map((view) => view.id);
    }
    return void 0;
  }
  shouldRestoreEditors(contextService, initialEditorsState) {
    if (isTemporaryWorkspace(contextService.getWorkspace())) {
      return false;
    }
    if (this.configurationService.getValue("workbench.editor.restoreEditors" /* EDITOR_RESTORE_EDITORS */) === false) {
      return false;
    }
    const forceRestoreEditors = this.configurationService.getValue("window.restoreWindows") === "preserve";
    return !!forceRestoreEditors || initialEditorsState === void 0;
  }
  willRestoreEditors() {
    return this.state.initialization.editor.restoreEditors;
  }
  async resolveEditorsToOpen(fileService, initialEditorsState) {
    if (initialEditorsState) {
      const filesToMerge = coalesce(await pathsToEditors(initialEditorsState.filesToMerge, fileService, this.logService));
      if (filesToMerge.length === 4 && isResourceEditorInput(filesToMerge[0]) && isResourceEditorInput(filesToMerge[1]) && isResourceEditorInput(filesToMerge[2]) && isResourceEditorInput(filesToMerge[3])) {
        return [{
          editor: {
            input1: { resource: filesToMerge[0].resource },
            input2: { resource: filesToMerge[1].resource },
            base: { resource: filesToMerge[2].resource },
            result: { resource: filesToMerge[3].resource },
            options: { pinned: true }
          }
        }];
      }
      const filesToDiff = coalesce(await pathsToEditors(initialEditorsState.filesToDiff, fileService, this.logService));
      if (filesToDiff.length === 2) {
        return [{
          editor: {
            original: { resource: filesToDiff[0].resource },
            modified: { resource: filesToDiff[1].resource },
            options: { pinned: true }
          }
        }];
      }
      const filesToOpenOrCreate = [];
      const resolvedFilesToOpenOrCreate = await pathsToEditors(initialEditorsState.filesToOpenOrCreate, fileService, this.logService);
      for (let i2 = 0; i2 < resolvedFilesToOpenOrCreate.length; i2++) {
        const resolvedFileToOpenOrCreate = resolvedFilesToOpenOrCreate[i2];
        if (resolvedFileToOpenOrCreate) {
          filesToOpenOrCreate.push({
            editor: resolvedFileToOpenOrCreate,
            viewColumn: initialEditorsState.filesToOpenOrCreate?.[i2].viewColumn
            // take over `viewColumn` from initial state
          });
        }
      }
      return filesToOpenOrCreate;
    } else if (this.contextService.getWorkbenchState() === 1 /* EMPTY */ && this.configurationService.getValue("workbench.startupEditor") === "newUntitledFile") {
      if (this.editorGroupService.hasRestorableState) {
        return [];
      }
      return [{
        editor: { resource: void 0 }
        // open empty untitled file
      }];
    }
    return [];
  }
  get openedDefaultEditors() {
    return this._openedDefaultEditors;
  }
  getInitialEditorsState() {
    const defaultLayout = this.environmentService.options?.defaultLayout;
    if ((defaultLayout?.editors?.length || defaultLayout?.layout?.editors) && (defaultLayout.force || this.storageService.isNew(1 /* WORKSPACE */))) {
      this._openedDefaultEditors = true;
      return {
        layout: defaultLayout.layout?.editors,
        filesToOpenOrCreate: defaultLayout?.editors?.map((editor) => {
          return {
            viewColumn: editor.viewColumn,
            fileUri: URI.revive(editor.uri),
            openOnlyIfExists: editor.openOnlyIfExists,
            options: editor.options
          };
        })
      };
    }
    const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
    if (filesToOpenOrCreate || filesToDiff || filesToMerge) {
      return { filesToOpenOrCreate, filesToDiff, filesToMerge };
    }
    return void 0;
  }
  isRestored() {
    return this.restored;
  }
  restoreParts() {
    const layoutReadyPromises = [];
    const layoutRestoredPromises = [];
    layoutReadyPromises.push((async () => {
      mark("code/willRestoreEditors");
      await this.editorGroupService.whenReady;
      mark("code/restoreEditors/editorGroupsReady");
      if (this.state.initialization.layout?.editors) {
        this.editorGroupService.mainPart.applyLayout(this.state.initialization.layout.editors);
      }
      const editors = await this.state.initialization.editor.editorsToOpen;
      mark("code/restoreEditors/editorsToOpenResolved");
      let openEditorsPromise = void 0;
      if (editors.length) {
        const editorGroupsInVisualOrder = this.editorGroupService.mainPart.getGroups(2 /* GRID_APPEARANCE */);
        const mapEditorsToGroup = /* @__PURE__ */ new Map();
        for (const editor of editors) {
          const group2 = editorGroupsInVisualOrder[(editor.viewColumn ?? 1) - 1];
          let editorsByGroup = mapEditorsToGroup.get(group2.id);
          if (!editorsByGroup) {
            editorsByGroup = /* @__PURE__ */ new Set();
            mapEditorsToGroup.set(group2.id, editorsByGroup);
          }
          editorsByGroup.add(editor.editor);
        }
        openEditorsPromise = Promise.all(Array.from(mapEditorsToGroup).map(async ([groupId, editors2]) => {
          try {
            await this.editorService.openEditors(Array.from(editors2), groupId, { validateTrust: true });
          } catch (error) {
            this.logService.error(error);
          }
        }));
      }
      layoutRestoredPromises.push(
        Promise.all([
          openEditorsPromise?.finally(() => mark("code/restoreEditors/editorsOpened")),
          this.editorGroupService.whenRestored.finally(() => mark("code/restoreEditors/editorGroupsRestored"))
        ]).finally(() => {
          mark("code/didRestoreEditors");
        })
      );
    })());
    const restoreDefaultViewsPromise = (async () => {
      if (this.state.initialization.views.defaults?.length) {
        mark("code/willOpenDefaultViews");
        const locationsRestored = [];
        const tryOpenView = (view) => {
          const location2 = this.viewDescriptorService.getViewLocationById(view.id);
          if (location2 !== null) {
            const container3 = this.viewDescriptorService.getViewContainerByViewId(view.id);
            if (container3) {
              if (view.order >= (locationsRestored?.[location2]?.order ?? 0)) {
                locationsRestored[location2] = { id: container3.id, order: view.order };
              }
              const containerModel = this.viewDescriptorService.getViewContainerModel(container3);
              containerModel.setCollapsed(view.id, false);
              containerModel.setVisible(view.id, true);
              return true;
            }
          }
          return false;
        };
        const defaultViews = [...this.state.initialization.views.defaults].reverse().map((v2, index2) => ({ id: v2, order: index2 }));
        let i2 = defaultViews.length;
        while (i2) {
          i2--;
          if (tryOpenView(defaultViews[i2])) {
            defaultViews.splice(i2, 1);
          }
        }
        if (defaultViews.length) {
          await this.extensionService.whenInstalledExtensionsRegistered();
          let i3 = defaultViews.length;
          while (i3) {
            i3--;
            if (tryOpenView(defaultViews[i3])) {
              defaultViews.splice(i3, 1);
            }
          }
        }
        if (locationsRestored[0 /* Sidebar */]) {
          this.state.initialization.views.containerToRestore.sideBar = locationsRestored[0 /* Sidebar */].id;
        }
        if (locationsRestored[1 /* Panel */]) {
          this.state.initialization.views.containerToRestore.panel = locationsRestored[1 /* Panel */].id;
        }
        if (locationsRestored[2 /* AuxiliaryBar */]) {
          this.state.initialization.views.containerToRestore.auxiliaryBar = locationsRestored[2 /* AuxiliaryBar */].id;
        }
        mark("code/didOpenDefaultViews");
      }
    })();
    layoutReadyPromises.push(restoreDefaultViewsPromise);
    layoutReadyPromises.push((async () => {
      await restoreDefaultViewsPromise;
      if (!this.state.initialization.views.containerToRestore.sideBar) {
        return;
      }
      mark("code/willRestoreViewlet");
      await this.openViewContainer(0 /* Sidebar */, this.state.initialization.views.containerToRestore.sideBar);
      mark("code/didRestoreViewlet");
    })());
    layoutReadyPromises.push((async () => {
      await restoreDefaultViewsPromise;
      if (!this.state.initialization.views.containerToRestore.panel) {
        return;
      }
      mark("code/willRestorePanel");
      await this.openViewContainer(1 /* Panel */, this.state.initialization.views.containerToRestore.panel);
      mark("code/didRestorePanel");
    })());
    layoutReadyPromises.push((async () => {
      await restoreDefaultViewsPromise;
      if (!this.state.initialization.views.containerToRestore.auxiliaryBar) {
        return;
      }
      mark("code/willRestoreAuxiliaryBar");
      await this.openViewContainer(2 /* AuxiliaryBar */, this.state.initialization.views.containerToRestore.auxiliaryBar);
      mark("code/didRestoreAuxiliaryBar");
    })());
    const zenModeWasActive = this.isZenModeActive();
    const restoreZenMode = getZenModeConfiguration(this.configurationService).restore;
    if (zenModeWasActive) {
      this.setZenModeActive(!restoreZenMode);
      this.toggleZenMode(false, true);
    }
    if (this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED)) {
      this.centerMainEditorLayout(true, true);
    }
    Promises.settled(layoutReadyPromises).finally(() => {
      if (getActiveElement() === mainWindow.document.body && (this.isPanelMaximized() || this.isAuxiliaryBarMaximized())) {
        this.focus();
      }
      this.whenReadyPromise.complete();
      Promises.settled(layoutRestoredPromises).finally(() => {
        if (this.editorService.editors.length === 0 && // no editors opened or restored
        this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) && // auxiliary bar is visible
        !this.hasFocus("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) && // auxiliary bar does not have focus yet
        !this.environmentService.enableSmokeTestDriver) {
          this.focusPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
        }
        this.restored = true;
        this.whenRestoredPromise.complete();
      });
    });
  }
  async openViewContainer(location2, id2, focus) {
    let viewContainer5 = await this.paneCompositeService.openPaneComposite(id2, location2, focus);
    if (viewContainer5) {
      return;
    }
    viewContainer5 = await this.paneCompositeService.openPaneComposite(this.viewDescriptorService.getDefaultViewContainer(location2)?.id, location2, focus);
    if (viewContainer5) {
      return;
    }
    await this.paneCompositeService.openPaneComposite(this.paneCompositeService.getVisiblePaneCompositeIds(location2).at(0), location2, focus);
  }
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
  registerNotifications(delegate) {
    this._register(delegate.onDidChangeNotificationsVisibility((visible) => this._onDidChangeNotificationsVisibility.fire(visible)));
  }
  hasFocus(part) {
    const container3 = this.getContainer(getActiveWindow(), part);
    if (!container3) {
      return false;
    }
    const activeElement = getActiveElement();
    if (!activeElement) {
      return false;
    }
    return isAncestorUsingFlowTo(activeElement, container3);
  }
  _getFocusedPart() {
    for (const part of this.parts.keys()) {
      if (this.hasFocus(part)) {
        return part;
      }
    }
    return void 0;
  }
  focusPart(part, targetWindow = mainWindow) {
    const container3 = this.getContainer(targetWindow, part) ?? this.mainContainer;
    switch (part) {
      case "workbench.parts.editor" /* EDITOR_PART */:
        this.editorGroupService.getPart(container3).activeGroup.focus();
        break;
      case "workbench.parts.panel" /* PANEL_PART */: {
        this.paneCompositeService.getActivePaneComposite(1 /* Panel */)?.focus();
        break;
      }
      case "workbench.parts.sidebar" /* SIDEBAR_PART */: {
        this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)?.focus();
        break;
      }
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */: {
        this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)?.focus();
        break;
      }
      case "workbench.parts.activitybar" /* ACTIVITYBAR_PART */:
        this.getPart("workbench.parts.sidebar" /* SIDEBAR_PART */).focusActivityBar();
        break;
      case "workbench.parts.statusbar" /* STATUSBAR_PART */:
        this.statusBarService.getPart(container3).focus();
        break;
      default: {
        container3?.focus();
      }
    }
  }
  getContainer(targetWindow, part) {
    if (typeof part === "undefined") {
      return this.getContainerFromDocument(targetWindow.document);
    }
    if (targetWindow === mainWindow) {
      return this.getPart(part).getContainer();
    }
    let partCandidate;
    if (part === "workbench.parts.editor" /* EDITOR_PART */) {
      partCandidate = this.editorGroupService.getPart(this.getContainerFromDocument(targetWindow.document));
    } else if (part === "workbench.parts.statusbar" /* STATUSBAR_PART */) {
      partCandidate = this.statusBarService.getPart(this.getContainerFromDocument(targetWindow.document));
    } else if (part === "workbench.parts.titlebar" /* TITLEBAR_PART */) {
      partCandidate = this.titleService.getPart(this.getContainerFromDocument(targetWindow.document));
    }
    if (partCandidate instanceof Part) {
      return partCandidate.getContainer();
    }
    return void 0;
  }
  isVisible(part, targetWindow = mainWindow) {
    if (targetWindow !== mainWindow && part === "workbench.parts.editor" /* EDITOR_PART */) {
      return true;
    }
    switch (part) {
      case "workbench.parts.titlebar" /* TITLEBAR_PART */:
        return this.initialized ? this.workbenchGrid.isViewVisible(this.titleBarPartView) : shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled);
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN);
      case "workbench.parts.panel" /* PANEL_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN);
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN);
      case "workbench.parts.statusbar" /* STATUSBAR_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN);
      case "workbench.parts.activitybar" /* ACTIVITYBAR_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN);
      case "workbench.parts.editor" /* EDITOR_PART */:
        return !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN);
      case "workbench.parts.banner" /* BANNER_PART */:
        return this.initialized ? this.workbenchGrid.isViewVisible(this.bannerPartView) : false;
      default:
        return false;
    }
  }
  shouldShowBannerFirst() {
    return isWeb && !isWCOEnabled();
  }
  focus() {
    if (this.isPanelMaximized() && this.mainContainer === this.activeContainer) {
      this.focusPart("workbench.parts.panel" /* PANEL_PART */);
    } else if (this.isAuxiliaryBarMaximized() && this.mainContainer === this.activeContainer) {
      this.focusPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    } else {
      this.focusPart("workbench.parts.editor" /* EDITOR_PART */, getWindow(this.activeContainer));
    }
  }
  focusPanelOrEditor() {
    const activePanel = this.paneCompositeService.getActivePaneComposite(1 /* Panel */);
    if ((this.hasFocus("workbench.parts.panel" /* PANEL_PART */) || !this.isVisible("workbench.parts.editor" /* EDITOR_PART */)) && activePanel) {
      activePanel.focus();
    } else {
      this.focus();
    }
  }
  getMaximumEditorDimensions(container3) {
    const targetWindow = getWindow(container3);
    const containerDimension = this.getContainerDimension(container3);
    if (container3 === this.mainContainer) {
      const isPanelHorizontal = isHorizontal(this.getPanelPosition());
      const takenWidth = (this.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */) ? this.activityBarPartView.minimumWidth : 0) + (this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) ? this.sideBarPartView.minimumWidth : 0) + (this.isVisible("workbench.parts.panel" /* PANEL_PART */) && !isPanelHorizontal ? this.panelPartView.minimumWidth : 0) + (this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? this.auxiliaryBarPartView.minimumWidth : 0);
      const takenHeight = (this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, targetWindow) ? this.titleBarPartView.minimumHeight : 0) + (this.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, targetWindow) ? this.statusBarPartView.minimumHeight : 0) + (this.isVisible("workbench.parts.panel" /* PANEL_PART */) && isPanelHorizontal ? this.panelPartView.minimumHeight : 0);
      const availableWidth = containerDimension.width - takenWidth;
      const availableHeight = containerDimension.height - takenHeight;
      return { width: availableWidth, height: availableHeight };
    } else {
      const takenHeight = (this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, targetWindow) ? this.titleBarPartView.minimumHeight : 0) + (this.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, targetWindow) ? this.statusBarPartView.minimumHeight : 0);
      return { width: containerDimension.width, height: containerDimension.height - takenHeight };
    }
  }
  isZenModeActive() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
  }
  setZenModeActive(active) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE, active);
  }
  toggleZenMode(skipLayout, restoring = false) {
    const focusedPartPreTransition = this._getFocusedPart();
    this.setZenModeActive(!this.isZenModeActive());
    this.state.runtime.zenMode.transitionDisposables.clearAndDisposeAll();
    const setLineNumbers = (lineNumbers) => {
      for (const editor of this.mainPartEditorService.visibleTextEditorControls) {
        if (!lineNumbers && isCodeEditor(editor) && editor.hasModel()) {
          const model = editor.getModel();
          lineNumbers = this.configurationService.getValue("editor.lineNumbers", { resource: model.uri, overrideIdentifier: model.getLanguageId() });
        }
        if (!lineNumbers) {
          lineNumbers = this.configurationService.getValue("editor.lineNumbers");
        }
        editor.updateOptions({ lineNumbers });
      }
    };
    let toggleMainWindowFullScreen = false;
    const config = getZenModeConfiguration(this.configurationService);
    const zenModeExitInfo = this.stateModel.getRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO);
    if (this.isZenModeActive()) {
      toggleMainWindowFullScreen = !this.state.runtime.mainWindowFullscreen && config.fullScreen && !isIOS;
      if (!restoring) {
        zenModeExitInfo.transitionedToFullScreen = toggleMainWindowFullScreen;
        zenModeExitInfo.transitionedToCenteredEditorLayout = !this.isMainEditorLayoutCentered() && config.centerLayout;
        zenModeExitInfo.handleNotificationsDoNotDisturbMode = this.notificationService.getFilter() === 0 /* OFF */;
        zenModeExitInfo.wasVisible.sideBar = this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
        zenModeExitInfo.wasVisible.panel = this.isVisible("workbench.parts.panel" /* PANEL_PART */);
        zenModeExitInfo.wasVisible.auxiliaryBar = this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
        this.stateModel.setRuntimeValue(LayoutStateKeys.ZEN_MODE_EXIT_INFO, zenModeExitInfo);
      }
      this.setPanelHidden(true, true);
      this.setAuxiliaryBarHidden(true, true);
      this.setSideBarHidden(true);
      if (config.hideActivityBar) {
        this.setActivityBarHidden(true);
      }
      if (config.hideStatusBar) {
        this.setStatusBarHidden(true);
      }
      if (config.hideLineNumbers) {
        setLineNumbers("off");
        this.state.runtime.zenMode.transitionDisposables.set("zenMode.hideLineNumbers" /* HIDE_LINENUMBERS */, this.mainPartEditorService.onDidVisibleEditorsChange(() => setLineNumbers("off")));
      }
      if (config.showTabs !== this.editorGroupService.partOptions.showTabs) {
        this.state.runtime.zenMode.transitionDisposables.set("zenMode.showTabs" /* SHOW_TABS */, this.editorGroupService.mainPart.enforcePartOptions({ showTabs: config.showTabs }));
      }
      if (config.silentNotifications && zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
        this.notificationService.setFilter(1 /* ERROR */);
      }
      if (config.centerLayout) {
        this.centerMainEditorLayout(true, true);
      }
      this.state.runtime.zenMode.transitionDisposables.set("configurationChange", this.configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("zenMode.hideActivityBar" /* HIDE_ACTIVITYBAR */) || e.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */)) {
          const zenModeHideActivityBar = this.configurationService.getValue("zenMode.hideActivityBar" /* HIDE_ACTIVITYBAR */);
          const activityBarLocation = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
          this.setActivityBarHidden(zenModeHideActivityBar ? true : activityBarLocation === "top" /* TOP */ || activityBarLocation === "bottom" /* BOTTOM */);
        }
        if (e.affectsConfiguration("zenMode.hideStatusBar" /* HIDE_STATUSBAR */)) {
          const zenModeHideStatusBar = this.configurationService.getValue("zenMode.hideStatusBar" /* HIDE_STATUSBAR */);
          this.setStatusBarHidden(zenModeHideStatusBar);
        }
        if (e.affectsConfiguration("zenMode.centerLayout" /* CENTER_LAYOUT */)) {
          const zenModeCenterLayout = this.configurationService.getValue("zenMode.centerLayout" /* CENTER_LAYOUT */);
          this.centerMainEditorLayout(zenModeCenterLayout, true);
        }
        if (e.affectsConfiguration("zenMode.showTabs" /* SHOW_TABS */)) {
          const zenModeShowTabs = this.configurationService.getValue("zenMode.showTabs" /* SHOW_TABS */) ?? "multiple";
          this.state.runtime.zenMode.transitionDisposables.set("zenMode.showTabs" /* SHOW_TABS */, this.editorGroupService.mainPart.enforcePartOptions({ showTabs: zenModeShowTabs }));
        }
        if (e.affectsConfiguration("zenMode.silentNotifications" /* SILENT_NOTIFICATIONS */)) {
          const zenModeSilentNotifications = !!this.configurationService.getValue("zenMode.silentNotifications" /* SILENT_NOTIFICATIONS */);
          if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
            this.notificationService.setFilter(zenModeSilentNotifications ? 1 /* ERROR */ : 0 /* OFF */);
          }
        }
        if (e.affectsConfiguration("zenMode.hideLineNumbers" /* HIDE_LINENUMBERS */)) {
          const lineNumbersType = this.configurationService.getValue("zenMode.hideLineNumbers" /* HIDE_LINENUMBERS */) ? "off" : void 0;
          setLineNumbers(lineNumbersType);
          this.state.runtime.zenMode.transitionDisposables.set("zenMode.hideLineNumbers" /* HIDE_LINENUMBERS */, this.mainPartEditorService.onDidVisibleEditorsChange(() => setLineNumbers(lineNumbersType)));
        }
      }));
    } else {
      if (zenModeExitInfo.wasVisible.panel) {
        this.setPanelHidden(false, true);
      }
      if (zenModeExitInfo.wasVisible.auxiliaryBar) {
        this.setAuxiliaryBarHidden(false, true);
      }
      if (zenModeExitInfo.wasVisible.sideBar) {
        this.setSideBarHidden(false);
      }
      if (!this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, true)) {
        this.setActivityBarHidden(false);
      }
      if (!this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, true)) {
        this.setStatusBarHidden(false);
      }
      if (zenModeExitInfo.transitionedToCenteredEditorLayout) {
        this.centerMainEditorLayout(false, true);
      }
      if (zenModeExitInfo.handleNotificationsDoNotDisturbMode) {
        this.notificationService.setFilter(0 /* OFF */);
      }
      setLineNumbers();
      toggleMainWindowFullScreen = zenModeExitInfo.transitionedToFullScreen && this.state.runtime.mainWindowFullscreen;
    }
    if (!skipLayout) {
      this.layout();
    }
    if (toggleMainWindowFullScreen) {
      this.hostService.toggleFullScreen(mainWindow);
    }
    if (focusedPartPreTransition && this.isVisible(focusedPartPreTransition, getWindow(this.activeContainer))) {
      if (isMultiWindowPart(focusedPartPreTransition)) {
        this.focusPart(focusedPartPreTransition, getWindow(this.activeContainer));
      } else {
        this.focusPart(focusedPartPreTransition);
      }
    } else {
      this.focus();
    }
    this._onDidChangeZenMode.fire(this.isZenModeActive());
  }
  setStatusBarHidden(hidden) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add("nostatusbar" /* STATUSBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nostatusbar" /* STATUSBAR_HIDDEN */);
    }
    this.workbenchGrid.setViewVisible(this.statusBarPartView, !hidden);
  }
  createWorkbenchLayout() {
    const titleBar = this.getPart("workbench.parts.titlebar" /* TITLEBAR_PART */);
    const bannerPart = this.getPart("workbench.parts.banner" /* BANNER_PART */);
    const editorPart = this.getPart("workbench.parts.editor" /* EDITOR_PART */);
    const activityBar = this.getPart("workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
    const panelPart = this.getPart("workbench.parts.panel" /* PANEL_PART */);
    const auxiliaryBarPart = this.getPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    const sideBar = this.getPart("workbench.parts.sidebar" /* SIDEBAR_PART */);
    const statusBar = this.getPart("workbench.parts.statusbar" /* STATUSBAR_PART */);
    this.titleBarPartView = titleBar;
    this.bannerPartView = bannerPart;
    this.sideBarPartView = sideBar;
    this.activityBarPartView = activityBar;
    this.editorPartView = editorPart;
    this.panelPartView = panelPart;
    this.auxiliaryBarPartView = auxiliaryBarPart;
    this.statusBarPartView = statusBar;
    const viewMap = {
      ["workbench.parts.activitybar" /* ACTIVITYBAR_PART */]: this.activityBarPartView,
      ["workbench.parts.banner" /* BANNER_PART */]: this.bannerPartView,
      ["workbench.parts.titlebar" /* TITLEBAR_PART */]: this.titleBarPartView,
      ["workbench.parts.editor" /* EDITOR_PART */]: this.editorPartView,
      ["workbench.parts.panel" /* PANEL_PART */]: this.panelPartView,
      ["workbench.parts.sidebar" /* SIDEBAR_PART */]: this.sideBarPartView,
      ["workbench.parts.statusbar" /* STATUSBAR_PART */]: this.statusBarPartView,
      ["workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */]: this.auxiliaryBarPartView
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
    this.workbenchGrid.edgeSnapping = this.state.runtime.mainWindowFullscreen;
    for (const part of [titleBar, editorPart, activityBar, panelPart, sideBar, statusBar, auxiliaryBarPart, bannerPart]) {
      this._register(part.onDidVisibilityChange((visible) => {
        if (!this.inMaximizedAuxiliaryBarTransition) {
          if (part === sideBar) {
            this.setSideBarHidden(!visible);
          } else if (part === panelPart && this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) === visible) {
            this.setPanelHidden(!visible, true);
          } else if (part === auxiliaryBarPart) {
            this.setAuxiliaryBarHidden(!visible, true);
          } else if (part === editorPart) {
            this.setEditorHidden(!visible);
          }
        }
        this._onDidChangePartVisibility.fire({ partId: part.getId(), visible });
        this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
      }));
    }
    this._register(this.onDidChangePartVisibility(({ partId }) => {
      if (partId === "workbench.parts.titlebar" /* TITLEBAR_PART */ || partId === "workbench.parts.banner" /* BANNER_PART */) {
        this.updateTopWindowEdgeClass();
      }
    }));
    this._register(this.storageService.onWillSaveState(() => {
      const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView) : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
      this.stateModel.setInitializationValue(LayoutStateKeys.SIDEBAR_SIZE, sideBarSize);
      const panelSize = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) ? this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) : isHorizontal(this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION)) ? this.workbenchGrid.getViewSize(this.panelPartView).height : this.workbenchGrid.getViewSize(this.panelPartView).width;
      this.stateModel.setInitializationValue(LayoutStateKeys.PANEL_SIZE, panelSize);
      const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView) : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
      this.stateModel.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE, auxiliaryBarSize);
      this.stateModel.save(true, true);
    }));
    this._register(Event2.any(this.paneCompositeService.onDidPaneCompositeOpen, this.paneCompositeService.onDidPaneCompositeClose)(() => {
      this.stateModel.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_EMPTY, this.paneCompositeService.getPaneCompositeIds(2 /* AuxiliaryBar */).length === 0);
    }));
  }
  layout() {
    if (!this.disposed) {
      this._mainContainerDimension = getClientArea(
        this.state.runtime.mainWindowFullscreen ? mainWindow.document.body : (
          // in fullscreen mode, make sure to use <body> element because
          this.parent
        ),
        // in that case the workbench will span the entire site
        this.contextService.getWorkbenchState() === 1 /* EMPTY */ ? DEFAULT_EMPTY_WINDOW_DIMENSIONS : DEFAULT_WORKSPACE_WINDOW_DIMENSIONS
        // running with fallback to ensure no error is thrown (https://github.com/microsoft/vscode/issues/240242)
      );
      this.logService.trace(`Layout#layout, height: ${this._mainContainerDimension.height}, width: ${this._mainContainerDimension.width}`);
      size(this.mainContainer, this._mainContainerDimension.width, this._mainContainerDimension.height);
      this.workbenchGrid.layout(this._mainContainerDimension.width, this._mainContainerDimension.height);
      this.initialized = true;
      this.handleContainerDidLayout(this.mainContainer, this._mainContainerDimension);
    }
  }
  isMainEditorLayoutCentered() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED);
  }
  centerMainEditorLayout(active, skipLayout) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED, active);
    const mainVisibleEditors = coalesce(this.editorGroupService.mainPart.groups.map((group2) => group2.activeEditor));
    const isEditorComplex = mainVisibleEditors.some((editor) => {
      if (editor instanceof DiffEditorInput) {
        return this.configurationService.getValue("diffEditor.renderSideBySide");
      }
      if (editor?.hasCapability(256 /* MultipleEditors */)) {
        return true;
      }
      return false;
    });
    const layout2 = this.editorGroupService.getLayout();
    let hasMoreThanOneColumn = false;
    if (layout2.orientation === 0 /* HORIZONTAL */) {
      hasMoreThanOneColumn = layout2.groups.length > 1;
    } else {
      hasMoreThanOneColumn = layout2.groups.some((group2) => group2.groups && group2.groups.length > 1);
    }
    const isCenteredLayoutAutoResizing = this.configurationService.getValue("workbench.editor.centeredLayoutAutoResize");
    if (isCenteredLayoutAutoResizing && (hasMoreThanOneColumn && !this.editorGroupService.mainPart.hasMaximizedGroup() || isEditorComplex)) {
      active = false;
    }
    if (this.editorGroupService.mainPart.isLayoutCentered() !== active) {
      this.editorGroupService.mainPart.centerLayout(active);
      if (!skipLayout) {
        this.layout();
      }
    }
    this._onDidChangeMainEditorCenteredLayout.fire(this.stateModel.getRuntimeValue(LayoutStateKeys.MAIN_EDITOR_CENTERED));
  }
  getSize(part) {
    return this.workbenchGrid.getViewSize(this.getPart(part));
  }
  setSize(part, size3) {
    this.workbenchGrid.resizeView(this.getPart(part), size3);
  }
  resizePart(part, sizeChangeWidth, sizeChangeHeight) {
    const sizeChangePxWidth = Math.sign(sizeChangeWidth) * computeScreenAwareSize(getActiveWindow(), Math.abs(sizeChangeWidth));
    const sizeChangePxHeight = Math.sign(sizeChangeHeight) * computeScreenAwareSize(getActiveWindow(), Math.abs(sizeChangeHeight));
    let viewSize;
    switch (part) {
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        viewSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
        this.workbenchGrid.resizeView(this.sideBarPartView, {
          width: viewSize.width + sizeChangePxWidth,
          height: viewSize.height
        });
        break;
      case "workbench.parts.panel" /* PANEL_PART */:
        viewSize = this.workbenchGrid.getViewSize(this.panelPartView);
        this.workbenchGrid.resizeView(this.panelPartView, {
          width: viewSize.width + (isHorizontal(this.getPanelPosition()) ? 0 : sizeChangePxWidth),
          height: viewSize.height + (isHorizontal(this.getPanelPosition()) ? sizeChangePxHeight : 0)
        });
        break;
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        viewSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
        this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
          width: viewSize.width + sizeChangePxWidth,
          height: viewSize.height
        });
        break;
      case "workbench.parts.editor" /* EDITOR_PART */:
        viewSize = this.workbenchGrid.getViewSize(this.editorPartView);
        if (this.editorGroupService.mainPart.count === 1) {
          this.workbenchGrid.resizeView(this.editorPartView, {
            width: viewSize.width + sizeChangePxWidth,
            height: viewSize.height + sizeChangePxHeight
          });
        } else {
          const activeGroup = this.editorGroupService.mainPart.activeGroup;
          const { width: width2, height } = this.editorGroupService.mainPart.getSize(activeGroup);
          this.editorGroupService.mainPart.setSize(activeGroup, { width: width2 + sizeChangePxWidth, height: height + sizeChangePxHeight });
          const { width: newWidth, height: newHeight } = this.editorGroupService.mainPart.getSize(activeGroup);
          if (sizeChangePxHeight && height === newHeight || sizeChangePxWidth && width2 === newWidth) {
            this.workbenchGrid.resizeView(this.editorPartView, {
              width: viewSize.width + (sizeChangePxWidth && width2 === newWidth ? sizeChangePxWidth : 0),
              height: viewSize.height + (sizeChangePxHeight && height === newHeight ? sizeChangePxHeight : 0)
            });
          }
        }
        break;
      default:
        return;
    }
  }
  setActivityBarHidden(hidden) {
    this.stateModel.setRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN, hidden);
    this.mainContainer.classList.toggle("noactivitybar" /* ACTIVITYBAR_HIDDEN */, hidden);
    this.workbenchGrid.setViewVisible(this.activityBarPartView, !hidden);
  }
  setBannerHidden(hidden) {
    this.workbenchGrid.setViewVisible(this.bannerPartView, !hidden);
  }
  setEditorHidden(hidden) {
    if (!hidden && this.setAuxiliaryBarMaximized(false) && this.isVisible("workbench.parts.editor" /* EDITOR_PART */)) {
      return;
    }
    this.stateModel.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add("nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */);
    }
    this.workbenchGrid.setViewVisible(this.editorPartView, !hidden);
    if (hidden && !this.isVisible("workbench.parts.panel" /* PANEL_PART */) && !this.isAuxiliaryBarMaximized()) {
      this.setPanelHidden(false, true);
    }
  }
  getLayoutClasses() {
    return coalesce([
      !this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) ? "nosidebar" /* SIDEBAR_HIDDEN */ : void 0,
      !this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) ? "nomaineditorarea" /* MAIN_EDITOR_AREA_HIDDEN */ : void 0,
      !this.isVisible("workbench.parts.panel" /* PANEL_PART */) ? "nopanel" /* PANEL_HIDDEN */ : void 0,
      !this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? "noauxiliarybar" /* AUXILIARYBAR_HIDDEN */ : void 0,
      !this.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */) ? "noactivitybar" /* ACTIVITYBAR_HIDDEN */ : void 0,
      !this.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */) ? "nostatusbar" /* STATUSBAR_HIDDEN */ : void 0,
      isFloatingTopEdgeExposed(this, mainWindow) ? "top-window-edge" /* TOP_WINDOW_EDGE */ : void 0,
      this.state.runtime.mainWindowFullscreen ? "fullscreen" /* FULLSCREEN */ : void 0,
      this.isShadowsDisabled() ? "no-shadows" /* NO_SHADOWS */ : void 0,
      this.isFloatingPanelsEnabled() ? "floating-panels" /* FLOATING_PANELS */ : void 0,
      // Also seed the modern-ui class here (see `LayoutClasses.MODERN_UI`).
      this.isFloatingPanelsEnabled() ? "modern-ui" /* MODERN_UI */ : void 0,
      this.isModernUICompact() ? "modern-ui-compact" /* MODERN_UI_COMPACT */ : void 0,
      this.isFloatingPanelsEnabled() ? "modern-ui-tabs" /* MODERN_UI_TABS */ : void 0,
      `panel-position-${positionToString(this.getPanelPosition())}`,
      `panel-alignment-${this.getPanelAlignment()}`
    ]);
  }
  setSideBarHidden(hidden) {
    if (!hidden && this.setAuxiliaryBarMaximized(false) && this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      return;
    }
    this.stateModel.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add("nosidebar" /* SIDEBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nosidebar" /* SIDEBAR_HIDDEN */);
    }
    this.workbenchGrid.setViewVisible(this.sideBarPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)) {
      this.paneCompositeService.hideActivePaneComposite(0 /* Sidebar */);
      if (!this.isAuxiliaryBarMaximized()) {
        this.focusPanelOrEditor();
      }
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(0 /* Sidebar */)) {
      const viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(0 /* Sidebar */);
      if (viewletToOpen) {
        this.openViewContainer(0 /* Sidebar */, viewletToOpen);
      }
    }
  }
  hasViews(id2) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerById(id2);
    if (!viewContainer5) {
      return false;
    }
    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer5);
    if (!viewContainerModel) {
      return false;
    }
    return viewContainerModel.activeViewDescriptors.length >= 1;
  }
  adjustPartPositions(sideBarPosition, panelAlignment, panelPosition) {
    const isPanelVertical = !isHorizontal(panelPosition);
    const sideBarSiblingToEditor = isPanelVertical || !(panelAlignment === "center" || sideBarPosition === 0 /* LEFT */ && panelAlignment === "right" || sideBarPosition === 1 /* RIGHT */ && panelAlignment === "left");
    const auxiliaryBarSiblingToEditor = isPanelVertical || !(panelAlignment === "center" || sideBarPosition === 1 /* RIGHT */ && panelAlignment === "right" || sideBarPosition === 0 /* LEFT */ && panelAlignment === "left");
    const preMovePanelWidth = !this.isVisible("workbench.parts.panel" /* PANEL_PART */) ? Sizing2.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.panelPartView).width;
    const preMovePanelHeight = !this.isVisible("workbench.parts.panel" /* PANEL_PART */) ? Sizing2.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.panelPartView) ?? this.panelPartView.minimumHeight) : this.workbenchGrid.getViewSize(this.panelPartView).height;
    const preMoveSideBarSize = !this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */) ? Sizing2.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.sideBarPartView) ?? this.sideBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.sideBarPartView).width;
    const preMoveAuxiliaryBarSize = !this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) ? Sizing2.Invisible(this.workbenchGrid.getViewCachedVisibleSize(this.auxiliaryBarPartView) ?? this.auxiliaryBarPartView.minimumWidth) : this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
    const focusedPart = ["workbench.parts.panel" /* PANEL_PART */, "workbench.parts.sidebar" /* SIDEBAR_PART */, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */].find((part) => this.hasFocus(part));
    if (sideBarPosition === 0 /* LEFT */) {
      this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, 0]);
      this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 2 /* Left */ : 3 /* Right */);
      if (auxiliaryBarSiblingToEditor) {
        this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 3 /* Right */);
      } else {
        this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, -1]);
      }
    } else {
      this.workbenchGrid.moveViewTo(this.activityBarPartView, [2, -1]);
      this.workbenchGrid.moveView(this.sideBarPartView, preMoveSideBarSize, sideBarSiblingToEditor ? this.editorPartView : this.activityBarPartView, sideBarSiblingToEditor ? 3 /* Right */ : 2 /* Left */);
      if (auxiliaryBarSiblingToEditor) {
        this.workbenchGrid.moveView(this.auxiliaryBarPartView, preMoveAuxiliaryBarSize, this.editorPartView, 2 /* Left */);
      } else {
        this.workbenchGrid.moveViewTo(this.auxiliaryBarPartView, [2, 0]);
      }
    }
    if (focusedPart) {
      this.focusPart(focusedPart);
    }
    if (isPanelVertical) {
      this.workbenchGrid.moveView(this.panelPartView, preMovePanelWidth, this.editorPartView, panelPosition === 0 /* LEFT */ ? 2 /* Left */ : 3 /* Right */);
      this.workbenchGrid.resizeView(this.panelPartView, {
        height: preMovePanelHeight,
        width: preMovePanelWidth
      });
    }
    if (this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      this.workbenchGrid.resizeView(this.sideBarPartView, {
        height: this.workbenchGrid.getViewSize(this.sideBarPartView).height,
        width: preMoveSideBarSize
      });
    }
    if (this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
        height: this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).height,
        width: preMoveAuxiliaryBarSize
      });
    }
  }
  setPanelAlignment(alignment) {
    if (!isHorizontal(this.getPanelPosition())) {
      this.setPanelPosition(2 /* BOTTOM */);
    }
    if (alignment !== "center" && this.isPanelMaximized()) {
      this.toggleMaximizedPanel();
    }
    this.setAuxiliaryBarMaximized(false);
    const oldAlignmentValue = this.getPanelAlignment();
    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT, alignment);
    this.mainContainer.classList.remove(`panel-alignment-${oldAlignmentValue}`);
    this.mainContainer.classList.add(`panel-alignment-${alignment}`);
    this.adjustPartPositions(this.getSideBarPosition(), alignment, this.getPanelPosition());
    this._onDidChangePanelAlignment.fire(alignment);
  }
  setPanelHidden(hidden, skipLayout) {
    if (!this.workbenchGrid) {
      return;
    }
    if (!hidden && this.setAuxiliaryBarMaximized(false) && this.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      return;
    }
    const wasHidden = !this.isVisible("workbench.parts.panel" /* PANEL_PART */);
    const isPanelMaximized = this.isPanelMaximized();
    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, hidden);
    const panelOpensMaximized = this.panelOpensMaximized();
    if (hidden) {
      this.mainContainer.classList.add("nopanel" /* PANEL_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("nopanel" /* PANEL_HIDDEN */);
    }
    if (hidden && isPanelMaximized) {
      this.toggleMaximizedPanel();
    }
    this.workbenchGrid.setViewVisible(this.panelPartView, !hidden);
    let focusEditor = false;
    if (hidden && this.paneCompositeService.getActivePaneComposite(1 /* Panel */)) {
      this.paneCompositeService.hideActivePaneComposite(1 /* Panel */);
      if (!isIOS && // do not auto focus on iOS (https://github.com/microsoft/vscode/issues/127832)
      !this.isAuxiliaryBarMaximized()) {
        focusEditor = true;
      }
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(1 /* Panel */)) {
      let panelToOpen = this.paneCompositeService.getLastActivePaneCompositeId(1 /* Panel */);
      if (!panelToOpen || !this.hasViews(panelToOpen)) {
        panelToOpen = this.viewDescriptorService.getViewContainersByLocation(1 /* Panel */).find((viewContainer5) => this.hasViews(viewContainer5.id))?.id;
      }
      if (panelToOpen) {
        this.openViewContainer(1 /* Panel */, panelToOpen, !skipLayout);
      }
    }
    if (wasHidden === hidden) {
      return;
    }
    if (!hidden) {
      if (!skipLayout && isPanelMaximized !== panelOpensMaximized) {
        this.toggleMaximizedPanel();
      }
    } else {
      this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, isPanelMaximized);
    }
    if (focusEditor) {
      this.editorGroupService.mainPart.activeGroup.focus();
    }
  }
  isAuxiliaryBarMaximized() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_WAS_LAST_MAXIMIZED);
  }
  toggleMaximizedAuxiliaryBar() {
    this.setAuxiliaryBarMaximized(!this.isAuxiliaryBarMaximized());
  }
  setAuxiliaryBarMaximized(maximized) {
    if (this.inMaximizedAuxiliaryBarTransition || // prevent re-entrance
    maximized === this.isAuxiliaryBarMaximized()) {
      return false;
    }
    if (maximized) {
      const state = {
        sideBarVisible: this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */),
        editorVisible: this.isVisible("workbench.parts.editor" /* EDITOR_PART */),
        panelVisible: this.isVisible("workbench.parts.panel" /* PANEL_PART */),
        auxiliaryBarVisible: this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)
      };
      this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_WAS_LAST_MAXIMIZED, true);
      this.inMaximizedAuxiliaryBarTransition = true;
      try {
        if (!state.auxiliaryBarVisible) {
          this.setAuxiliaryBarHidden(false);
        }
        const size3 = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView).width;
        this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE, size3);
        if (state.sideBarVisible) {
          this.setSideBarHidden(true);
        }
        if (state.panelVisible) {
          this.setPanelHidden(true);
        }
        if (state.editorVisible) {
          this.setEditorHidden(true);
        }
        this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY, state);
      } finally {
        this.inMaximizedAuxiliaryBarTransition = false;
      }
    } else {
      const state = assertReturnsDefined(this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY));
      this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_WAS_LAST_MAXIMIZED, false);
      this.inMaximizedAuxiliaryBarTransition = true;
      try {
        this.setEditorHidden(!state?.editorVisible);
        this.setPanelHidden(!state?.panelVisible);
        this.setSideBarHidden(!state?.sideBarVisible);
        const size3 = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
        this.workbenchGrid.resizeView(this.auxiliaryBarPartView, {
          width: this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE),
          height: size3.height
        });
      } finally {
        this.inMaximizedAuxiliaryBarTransition = false;
      }
    }
    this.focusPart("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    this._onDidChangeAuxiliaryBarMaximized.fire();
    return true;
  }
  isPanelMaximized() {
    return (this.getPanelAlignment() === "center" || // the workbench grid currently prevents us from supporting panel
    !isHorizontal(this.getPanelPosition())) && !this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow) && !this.isAuxiliaryBarMaximized();
  }
  toggleMaximizedPanel() {
    const size3 = this.workbenchGrid.getViewSize(this.panelPartView);
    const panelPosition = this.getPanelPosition();
    const maximize = !this.isPanelMaximized();
    if (maximize) {
      if (this.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
        if (isHorizontal(panelPosition)) {
          this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size3.height);
        } else {
          this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size3.width);
        }
      }
      this.setEditorHidden(true);
    } else {
      this.setEditorHidden(false);
      this.workbenchGrid.resizeView(this.panelPartView, {
        width: isHorizontal(panelPosition) ? size3.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH),
        height: isHorizontal(panelPosition) ? this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT) : size3.height
      });
    }
    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED, maximize);
  }
  panelOpensMaximized() {
    if (this.getPanelAlignment() !== "center" && isHorizontal(this.getPanelPosition())) {
      return false;
    }
    const panelOpensMaximized = partOpensMaximizedFromString(this.configurationService.getValue("workbench.panel.opensMaximized" /* PANEL_OPENS_MAXIMIZED */));
    const panelLastIsMaximized = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_WAS_LAST_MAXIMIZED);
    return panelOpensMaximized === 0 /* ALWAYS */ || panelOpensMaximized === 2 /* REMEMBER_LAST */ && panelLastIsMaximized;
  }
  setAuxiliaryBarHidden(hidden, skipLayout) {
    if (hidden && this.setAuxiliaryBarMaximized(false) && !this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return;
    }
    this.stateModel.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, hidden);
    if (hidden) {
      this.mainContainer.classList.add("noauxiliarybar" /* AUXILIARYBAR_HIDDEN */);
    } else {
      this.mainContainer.classList.remove("noauxiliarybar" /* AUXILIARYBAR_HIDDEN */);
    }
    this.workbenchGrid.setViewVisible(this.auxiliaryBarPartView, !hidden);
    if (hidden && this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)) {
      this.paneCompositeService.hideActivePaneComposite(2 /* AuxiliaryBar */);
      this.focusPanelOrEditor();
    } else if (!hidden && !this.paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */)) {
      let viewletToOpen = this.paneCompositeService.getLastActivePaneCompositeId(2 /* AuxiliaryBar */);
      if (!viewletToOpen || !this.hasViews(viewletToOpen)) {
        viewletToOpen = this.viewDescriptorService.getViewContainersByLocation(2 /* AuxiliaryBar */).find((viewContainer5) => this.hasViews(viewContainer5.id))?.id;
      }
      if (viewletToOpen) {
        this.openViewContainer(2 /* AuxiliaryBar */, viewletToOpen, !skipLayout);
      }
    }
  }
  setPartHidden(hidden, part) {
    switch (part) {
      case "workbench.parts.activitybar" /* ACTIVITYBAR_PART */:
        return this.setActivityBarHidden(hidden);
      case "workbench.parts.sidebar" /* SIDEBAR_PART */:
        return this.setSideBarHidden(hidden);
      case "workbench.parts.editor" /* EDITOR_PART */:
        return this.setEditorHidden(hidden);
      case "workbench.parts.banner" /* BANNER_PART */:
        return this.setBannerHidden(hidden);
      case "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */:
        return this.setAuxiliaryBarHidden(hidden);
      case "workbench.parts.panel" /* PANEL_PART */:
        return this.setPanelHidden(hidden);
    }
  }
  toggleSecondarySideBar() {
    const visible = !this.isSecondarySideBarVisible();
    this.setPartHidden(!visible, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    alert(visible ? localize(6200, null) : localize(6199, null));
  }
  isSecondarySideBarVisible() {
    return this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
  }
  hasMainWindowBorder() {
    return this.state.runtime.mainWindowBorder;
  }
  getMainWindowBorderRadius() {
    return this.state.runtime.mainWindowBorder && isMacintosh ? "10px" : void 0;
  }
  getSideBarPosition() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
  }
  getPanelAlignment() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
  }
  updateMenubarVisibility(skipLayout) {
    const shouldShowTitleBar = shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled);
    if (!skipLayout && this.workbenchGrid && shouldShowTitleBar !== this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
      this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowTitleBar);
    }
  }
  updateCustomTitleBarVisibility() {
    const shouldShowTitleBar = shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled);
    const titlebarVisible = this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */);
    if (shouldShowTitleBar !== titlebarVisible) {
      this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowTitleBar);
    }
  }
  updateTopWindowEdgeClass() {
    this.mainContainer.classList.toggle("top-window-edge" /* TOP_WINDOW_EDGE */, isFloatingTopEdgeExposed(this, mainWindow));
  }
  toggleMenuBar() {
    let currentVisibilityValue = getMenuBarVisibility(this.configurationService);
    if (typeof currentVisibilityValue !== "string") {
      currentVisibilityValue = "classic";
    }
    let newVisibilityValue;
    if (currentVisibilityValue === "visible" || currentVisibilityValue === "classic") {
      newVisibilityValue = hasNativeMenu(this.configurationService) ? "toggle" : "compact";
    } else {
      newVisibilityValue = "classic";
    }
    this.configurationService.updateValue("window.menuBarVisibility" /* MenuBarVisibility */, newVisibilityValue);
  }
  getPanelPosition() {
    return this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
  }
  setPanelPosition(position2) {
    if (!this.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      this.setPanelHidden(false);
    }
    const panelPart = this.getPart("workbench.parts.panel" /* PANEL_PART */);
    const oldPositionValue = positionToString(this.getPanelPosition());
    const newPositionValue = positionToString(position2);
    const panelContainer = assertReturnsDefined(panelPart.getContainer());
    panelContainer.classList.remove(oldPositionValue);
    panelContainer.classList.add(newPositionValue);
    this.mainContainer.classList.remove(`panel-position-${oldPositionValue}`);
    this.mainContainer.classList.add(`panel-position-${newPositionValue}`);
    panelPart.updateStyles();
    const size3 = this.workbenchGrid.getViewSize(this.panelPartView);
    const sideBarSize = this.workbenchGrid.getViewSize(this.sideBarPartView);
    const auxiliaryBarSize = this.workbenchGrid.getViewSize(this.auxiliaryBarPartView);
    let editorHidden = !this.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
    if (newPositionValue !== oldPositionValue && !editorHidden) {
      if (isHorizontal(position2)) {
        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH, size3.width);
      } else if (isHorizontal(positionFromString(oldPositionValue))) {
        this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT, size3.height);
      }
    }
    if (isHorizontal(position2) && this.getPanelAlignment() !== "center" && editorHidden) {
      this.toggleMaximizedPanel();
      editorHidden = false;
    }
    this.stateModel.setRuntimeValue(LayoutStateKeys.PANEL_POSITION, position2);
    const sideBarVisible = this.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
    const auxiliaryBarVisible = this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    const hadFocus = this.hasFocus("workbench.parts.panel" /* PANEL_PART */);
    if (position2 === 2 /* BOTTOM */) {
      this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size3.height : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT), this.editorPartView, 1 /* Down */);
    } else if (position2 === 3 /* TOP */) {
      this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size3.height : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_HEIGHT), this.editorPartView, 0 /* Up */);
    } else if (position2 === 1 /* RIGHT */) {
      this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size3.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 3 /* Right */);
    } else {
      this.workbenchGrid.moveView(this.panelPartView, editorHidden ? size3.width : this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_LAST_NON_MAXIMIZED_WIDTH), this.editorPartView, 2 /* Left */);
    }
    if (hadFocus) {
      this.focusPart("workbench.parts.panel" /* PANEL_PART */);
    }
    this.workbenchGrid.resizeView(this.sideBarPartView, sideBarSize);
    if (!sideBarVisible) {
      this.setSideBarHidden(true);
    }
    this.workbenchGrid.resizeView(this.auxiliaryBarPartView, auxiliaryBarSize);
    if (!auxiliaryBarVisible) {
      this.setAuxiliaryBarHidden(true);
    }
    if (isHorizontal(position2)) {
      this.adjustPartPositions(this.getSideBarPosition(), this.getPanelAlignment(), position2);
    }
    this._onDidChangePanelPosition.fire(newPositionValue);
  }
  isWindowMaximized(targetWindow) {
    return this.state.runtime.maximized.has(getWindowId(targetWindow));
  }
  updateWindowMaximizedState(targetWindow, maximized) {
    this.mainContainer.classList.toggle("maximized" /* MAXIMIZED */, maximized);
    const targetWindowId = getWindowId(targetWindow);
    if (maximized === this.state.runtime.maximized.has(targetWindowId)) {
      return;
    }
    if (maximized) {
      this.state.runtime.maximized.add(targetWindowId);
    } else {
      this.state.runtime.maximized.delete(targetWindowId);
    }
    this.updateWindowBorder();
    this._onDidChangeWindowMaximized.fire({ windowId: targetWindowId, maximized });
  }
  getVisibleNeighborPart(part, direction) {
    if (!this.workbenchGrid) {
      return void 0;
    }
    if (!this.isVisible(part, mainWindow)) {
      return void 0;
    }
    const neighborViews = this.workbenchGrid.getNeighborViews(this.getPart(part), direction, false);
    if (!neighborViews) {
      return void 0;
    }
    for (const neighborView of neighborViews) {
      const neighborPart = ["workbench.parts.activitybar" /* ACTIVITYBAR_PART */, "workbench.parts.editor" /* EDITOR_PART */, "workbench.parts.panel" /* PANEL_PART */, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, "workbench.parts.sidebar" /* SIDEBAR_PART */, "workbench.parts.statusbar" /* STATUSBAR_PART */, "workbench.parts.titlebar" /* TITLEBAR_PART */].find((partId) => this.getPart(partId) === neighborView && this.isVisible(partId, mainWindow));
      if (neighborPart !== void 0) {
        return neighborPart;
      }
    }
    return void 0;
  }
  onDidChangeWCO() {
    const bannerFirst = this.workbenchGrid.getNeighborViews(this.titleBarPartView, 0 /* Up */, false).length > 0;
    const shouldBannerBeFirst = this.shouldShowBannerFirst();
    if (bannerFirst !== shouldBannerBeFirst) {
      this.workbenchGrid.moveView(this.bannerPartView, Sizing2.Distribute, this.titleBarPartView, shouldBannerBeFirst ? 0 /* Up */ : 1 /* Down */);
    }
    this.workbenchGrid.setViewVisible(this.titleBarPartView, shouldShowCustomTitleBar(this.configurationService, mainWindow, this.state.runtime.menuBar.toggled));
  }
  arrangeEditorNodes(nodes, availableHeight, availableWidth) {
    if (!nodes.sideBar && !nodes.auxiliaryBar) {
      nodes.editor.size = availableHeight;
      return nodes.editor;
    }
    const result = [nodes.editor];
    nodes.editor.size = availableWidth;
    if (nodes.sideBar) {
      if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 0 /* LEFT */) {
        result.splice(0, 0, nodes.sideBar);
      } else {
        result.push(nodes.sideBar);
      }
      nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
    }
    if (nodes.auxiliaryBar) {
      if (this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON) === 1 /* RIGHT */) {
        result.splice(0, 0, nodes.auxiliaryBar);
      } else {
        result.push(nodes.auxiliaryBar);
      }
      nodes.editor.size -= this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
    }
    return {
      type: "branch",
      data: result,
      size: availableHeight,
      visible: result.some((node) => node.visible)
    };
  }
  arrangeMiddleSectionNodes(nodes, availableWidth, availableHeight) {
    const activityBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN) ? 0 : nodes.activityBar.size;
    const sideBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN) ? 0 : nodes.sideBar.size;
    const auxiliaryBarSize = this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN) ? 0 : nodes.auxiliaryBar.size;
    const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE) ? 0 : nodes.panel.size;
    const panelPostion = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION);
    const sideBarPosition = this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON);
    const result = [];
    if (!isHorizontal(panelPostion)) {
      result.push(nodes.editor);
      nodes.editor.size = availableWidth - activityBarSize - sideBarSize - panelSize - auxiliaryBarSize;
      if (panelPostion === 1 /* RIGHT */) {
        result.push(nodes.panel);
      } else {
        result.splice(0, 0, nodes.panel);
      }
      if (sideBarPosition === 0 /* LEFT */) {
        result.push(nodes.auxiliaryBar);
        result.splice(0, 0, nodes.sideBar);
        result.splice(0, 0, nodes.activityBar);
      } else {
        result.splice(0, 0, nodes.auxiliaryBar);
        result.push(nodes.sideBar);
        result.push(nodes.activityBar);
      }
    } else {
      const panelAlignment = this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_ALIGNMENT);
      const sideBarNextToEditor = !(panelAlignment === "center" || sideBarPosition === 0 /* LEFT */ && panelAlignment === "right" || sideBarPosition === 1 /* RIGHT */ && panelAlignment === "left");
      const auxiliaryBarNextToEditor = !(panelAlignment === "center" || sideBarPosition === 1 /* RIGHT */ && panelAlignment === "right" || sideBarPosition === 0 /* LEFT */ && panelAlignment === "left");
      const editorSectionWidth = availableWidth - activityBarSize - (sideBarNextToEditor ? 0 : sideBarSize) - (auxiliaryBarNextToEditor ? 0 : auxiliaryBarSize);
      const editorNodes = this.arrangeEditorNodes({
        editor: nodes.editor,
        sideBar: sideBarNextToEditor ? nodes.sideBar : void 0,
        auxiliaryBar: auxiliaryBarNextToEditor ? nodes.auxiliaryBar : void 0
      }, availableHeight - panelSize, editorSectionWidth);
      const data = panelPostion === 2 /* BOTTOM */ ? [editorNodes, nodes.panel] : [nodes.panel, editorNodes];
      result.push({
        type: "branch",
        data,
        size: editorSectionWidth,
        visible: data.some((node) => node.visible)
      });
      if (!sideBarNextToEditor) {
        if (sideBarPosition === 0 /* LEFT */) {
          result.splice(0, 0, nodes.sideBar);
        } else {
          result.push(nodes.sideBar);
        }
      }
      if (!auxiliaryBarNextToEditor) {
        if (sideBarPosition === 1 /* RIGHT */) {
          result.splice(0, 0, nodes.auxiliaryBar);
        } else {
          result.push(nodes.auxiliaryBar);
        }
      }
      if (sideBarPosition === 0 /* LEFT */) {
        result.splice(0, 0, nodes.activityBar);
      } else {
        result.push(nodes.activityBar);
      }
    }
    return result;
  }
  createGridDescriptor() {
    const { width: width2, height } = this._mainContainerDimension;
    const sideBarSize = this.stateModel.getInitializationValue(LayoutStateKeys.SIDEBAR_SIZE);
    const auxiliaryBarSize = this.stateModel.getInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE);
    const panelSize = this.stateModel.getInitializationValue(LayoutStateKeys.PANEL_SIZE);
    const titleBarHeight = this.titleBarPartView.minimumHeight;
    const bannerHeight = this.bannerPartView.minimumHeight;
    const statusBarHeight = this.statusBarPartView.minimumHeight;
    const activityBarWidth = this.activityBarPartView.minimumWidth;
    const middleSectionHeight = height - titleBarHeight - statusBarHeight;
    const titleAndBanner = [
      {
        type: "leaf",
        data: { type: "workbench.parts.titlebar" /* TITLEBAR_PART */ },
        size: titleBarHeight,
        visible: this.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)
      },
      {
        type: "leaf",
        data: { type: "workbench.parts.banner" /* BANNER_PART */ },
        size: bannerHeight,
        visible: false
      }
    ];
    const activityBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.activitybar" /* ACTIVITYBAR_PART */ },
      size: activityBarWidth,
      visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN)
    };
    const sideBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.sidebar" /* SIDEBAR_PART */ },
      size: sideBarSize,
      visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN)
    };
    const auxiliaryBarNode = {
      type: "leaf",
      data: { type: "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ },
      size: auxiliaryBarSize,
      visible: this.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)
    };
    const editorNode = {
      type: "leaf",
      data: { type: "workbench.parts.editor" /* EDITOR_PART */ },
      size: 0,
      // Update based on sibling sizes
      visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN)
    };
    const panelNode = {
      type: "leaf",
      data: { type: "workbench.parts.panel" /* PANEL_PART */ },
      size: panelSize,
      visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN)
    };
    const middleSection = this.arrangeMiddleSectionNodes({
      activityBar: activityBarNode,
      auxiliaryBar: auxiliaryBarNode,
      editor: editorNode,
      panel: panelNode,
      sideBar: sideBarNode
    }, width2, middleSectionHeight);
    const result = {
      root: {
        type: "branch",
        size: width2,
        data: [
          ...this.shouldShowBannerFirst() ? titleAndBanner.reverse() : titleAndBanner,
          {
            type: "branch",
            data: middleSection,
            size: middleSectionHeight
          },
          {
            type: "leaf",
            data: { type: "workbench.parts.statusbar" /* STATUSBAR_PART */ },
            size: statusBarHeight,
            visible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN)
          }
        ]
      },
      orientation: 0 /* VERTICAL */,
      width: width2,
      height
    };
    const layoutDescriptor = {
      activityBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.ACTIVITYBAR_HIDDEN),
      sideBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN),
      auxiliaryBarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN),
      panelVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN),
      statusbarVisible: !this.stateModel.getRuntimeValue(LayoutStateKeys.STATUSBAR_HIDDEN),
      sideBarPosition: positionToString(this.stateModel.getRuntimeValue(LayoutStateKeys.SIDEBAR_POSITON)),
      panelPosition: positionToString(this.stateModel.getRuntimeValue(LayoutStateKeys.PANEL_POSITION))
    };
    this.telemetryService.publicLog2("startupLayout", layoutDescriptor);
    return result;
  }
  dispose() {
    super.dispose();
    this.disposed = true;
  }
};

function getZenModeConfiguration(configurationService) {
  return configurationService.getValue("zenMode" /* ZEN_MODE_CONFIG */);
}

var WorkbenchLayoutStateKey = class {
  constructor(name, scope, target, defaultValue) {
    this.name = name;
    this.scope = scope;
    this.target = target;
    this.defaultValue = defaultValue;
  }
};

var RuntimeStateKey = class extends WorkbenchLayoutStateKey {
  constructor(name, scope, target, defaultValue, zenModeIgnore) {
    super(name, scope, target, defaultValue);
    this.zenModeIgnore = zenModeIgnore;
    this.runtime = true;
  }
};

var InitializationStateKey = class extends WorkbenchLayoutStateKey {
  constructor() {
    super(...arguments);
    this.runtime = false;
  }
};

var LayoutStateKeys = {
  // Editor
  MAIN_EDITOR_CENTERED: new RuntimeStateKey("editor.centered", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  // Zen Mode
  ZEN_MODE_ACTIVE: new RuntimeStateKey("zenMode.active", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  ZEN_MODE_EXIT_INFO: new RuntimeStateKey("zenMode.exitInfo", 1 /* WORKSPACE */, 1 /* MACHINE */, {
    transitionedToCenteredEditorLayout: false,
    transitionedToFullScreen: false,
    handleNotificationsDoNotDisturbMode: false,
    wasVisible: {
      auxiliaryBar: false,
      panel: false,
      sideBar: false
    }
  }),
  // Part Sizing
  SIDEBAR_SIZE: new InitializationStateKey("sideBar.size", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  AUXILIARYBAR_SIZE: new InitializationStateKey("auxiliaryBar.size", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  PANEL_SIZE: new InitializationStateKey("panel.size", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  // Part State
  PANEL_LAST_NON_MAXIMIZED_HEIGHT: new RuntimeStateKey("panel.lastNonMaximizedHeight", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  PANEL_LAST_NON_MAXIMIZED_WIDTH: new RuntimeStateKey("panel.lastNonMaximizedWidth", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  PANEL_WAS_LAST_MAXIMIZED: new RuntimeStateKey("panel.wasLastMaximized", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  AUXILIARYBAR_WAS_LAST_MAXIMIZED: new RuntimeStateKey("auxiliaryBar.wasLastMaximized", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE: new RuntimeStateKey("auxiliaryBar.lastNonMaximizedSize", 0 /* PROFILE */, 1 /* MACHINE */, 300),
  AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY: new RuntimeStateKey("auxiliaryBar.lastNonMaximizedVisibility", 1 /* WORKSPACE */, 1 /* MACHINE */, {
    sideBarVisible: false,
    editorVisible: false,
    panelVisible: false,
    auxiliaryBarVisible: false
  }),
  AUXILIARYBAR_EMPTY: new InitializationStateKey("auxiliaryBar.empty", 0 /* PROFILE */, 1 /* MACHINE */, false),
  // Part Positions
  SIDEBAR_POSITON: new RuntimeStateKey("sideBar.position", 1 /* WORKSPACE */, 1 /* MACHINE */, 0 /* LEFT */),
  PANEL_POSITION: new RuntimeStateKey("panel.position", 1 /* WORKSPACE */, 1 /* MACHINE */, 2 /* BOTTOM */),
  PANEL_ALIGNMENT: new RuntimeStateKey("panel.alignment", 0 /* PROFILE */, 0 /* USER */, "center"),
  // Part Visibility
  ACTIVITYBAR_HIDDEN: new RuntimeStateKey("activityBar.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, false, true),
  SIDEBAR_HIDDEN: new RuntimeStateKey("sideBar.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  EDITOR_HIDDEN: new RuntimeStateKey("editor.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, false),
  PANEL_HIDDEN: new RuntimeStateKey("panel.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, true),
  AUXILIARYBAR_HIDDEN: new RuntimeStateKey("auxiliaryBar.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, true),
  STATUSBAR_HIDDEN: new RuntimeStateKey("statusBar.hidden", 1 /* WORKSPACE */, 1 /* MACHINE */, false, true)
};

var LayoutStateModel = class _LayoutStateModel extends Disposable {
  constructor(storageService, configurationService, contextService, environmentService) {
    super();
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.environmentService = environmentService;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this.stateCache = /* @__PURE__ */ new Map();
    this.isNew = {
      [1 /* WORKSPACE */]: this.storageService.isNew(1 /* WORKSPACE */),
      [0 /* PROFILE */]: this.storageService.isNew(0 /* PROFILE */),
      [-1 /* APPLICATION */]: this.storageService.isNew(-1 /* APPLICATION */),
      [-2 /* APPLICATION_SHARED */]: this.storageService.isNew(-2 /* APPLICATION_SHARED */)
    };
    this._register(this.configurationService.onDidChangeConfiguration((configurationChange) => this.updateStateFromLegacySettings(configurationChange)));
  }
  static {
    this.STORAGE_PREFIX = "workbench.";
  }
  updateStateFromLegacySettings(configurationChangeEvent) {
    if (configurationChangeEvent.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */)) {
      this.setRuntimeValueAndFire(LayoutStateKeys.ACTIVITYBAR_HIDDEN, this.isActivityBarHidden());
    }
    if (configurationChangeEvent.affectsConfiguration("workbench.statusBar.visible" /* STATUSBAR_VISIBLE */)) {
      this.setRuntimeValueAndFire(LayoutStateKeys.STATUSBAR_HIDDEN, !this.configurationService.getValue("workbench.statusBar.visible" /* STATUSBAR_VISIBLE */));
    }
    if (configurationChangeEvent.affectsConfiguration("workbench.sideBar.location" /* SIDEBAR_POSITION */)) {
      this.setRuntimeValueAndFire(LayoutStateKeys.SIDEBAR_POSITON, positionFromString(this.configurationService.getValue("workbench.sideBar.location" /* SIDEBAR_POSITION */) ?? "left"));
    }
  }
  updateLegacySettingsFromState(key3, value2) {
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    if (key3.zenModeIgnore && isZenMode) {
      return;
    }
    if (key3 === LayoutStateKeys.ACTIVITYBAR_HIDDEN) {
      this.configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, value2 ? "hidden" /* HIDDEN */ : void 0);
    } else if (key3 === LayoutStateKeys.STATUSBAR_HIDDEN) {
      this.configurationService.updateValue("workbench.statusBar.visible" /* STATUSBAR_VISIBLE */, !value2);
    } else if (key3 === LayoutStateKeys.SIDEBAR_POSITON) {
      this.configurationService.updateValue("workbench.sideBar.location" /* SIDEBAR_POSITION */, positionToString(value2));
    }
  }
  load(configuration2) {
    let key3;
    if (!configuration2.resetLayout) {
      for (key3 in LayoutStateKeys) {
        const stateKey = LayoutStateKeys[key3];
        const value2 = this.loadKeyFromStorage(stateKey);
        if (value2 !== void 0) {
          this.stateCache.set(stateKey.name, value2);
        }
      }
    }
    this.stateCache.set(LayoutStateKeys.ACTIVITYBAR_HIDDEN.name, this.isActivityBarHidden());
    this.stateCache.set(LayoutStateKeys.STATUSBAR_HIDDEN.name, !this.configurationService.getValue("workbench.statusBar.visible" /* STATUSBAR_VISIBLE */));
    this.stateCache.set(LayoutStateKeys.SIDEBAR_POSITON.name, positionFromString(this.configurationService.getValue("workbench.sideBar.location" /* SIDEBAR_POSITION */) ?? "left"));
    const auxiliaryBarForceMaximized = this.configurationService.getValue("workbench.secondarySideBar.forceMaximized" /* AUXILIARYBAR_FORCE_MAXIMIZED */);
    const workbenchState = this.contextService.getWorkbenchState();
    const mainContainerDimension = configuration2.mainContainerDimension;
    LayoutStateKeys.SIDEBAR_SIZE.defaultValue = Math.min(300, mainContainerDimension.width / 4);
    LayoutStateKeys.SIDEBAR_HIDDEN.defaultValue = workbenchState === 1 /* EMPTY */ || auxiliaryBarForceMaximized === true;
    LayoutStateKeys.AUXILIARYBAR_SIZE.defaultValue = auxiliaryBarForceMaximized ? Math.max(300, mainContainerDimension.width / 2) : Math.min(300, mainContainerDimension.width / 4);
    LayoutStateKeys.AUXILIARYBAR_HIDDEN.defaultValue = (() => {
      if (isWeb && !this.environmentService.remoteAuthority) {
        return true;
      }
      if (auxiliaryBarForceMaximized === true) {
        return false;
      }
      const configuration3 = this.configurationService.inspect("workbench.secondarySideBar.defaultVisibility" /* AUXILIARYBAR_DEFAULT_VISIBILITY */);
      if (configuration3.defaultValue !== "hidden" && !isConfigured(configuration3) && this.stateCache.get(LayoutStateKeys.AUXILIARYBAR_EMPTY.name)) {
        return true;
      }
      if (this.isNew[-1 /* APPLICATION */] && configuration3.value !== "hidden" && !this.configurationService.getValue(ChatAIDisabledSettingId)) {
        return false;
      }
      switch (configuration3.value) {
        case "hidden":
          return true;
        case "visibleInWorkspace":
        case "maximizedInWorkspace":
          return workbenchState === 1 /* EMPTY */;
        default:
          return false;
      }
    })();
    LayoutStateKeys.PANEL_SIZE.defaultValue = this.stateCache.get(LayoutStateKeys.PANEL_POSITION.name) ?? isHorizontal(LayoutStateKeys.PANEL_POSITION.defaultValue) ? mainContainerDimension.height / 3 : mainContainerDimension.width / 4;
    LayoutStateKeys.PANEL_POSITION.defaultValue = positionFromString(this.configurationService.getValue("workbench.panel.defaultLocation" /* PANEL_POSITION */) ?? "bottom");
    for (key3 in LayoutStateKeys) {
      const stateKey = LayoutStateKeys[key3];
      if (this.stateCache.get(stateKey.name) === void 0) {
        this.stateCache.set(stateKey.name, stateKey.defaultValue);
      }
    }
    this.applyOverrides(configuration2);
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._store)((storageChangeEvent) => {
      let key4;
      for (key4 in LayoutStateKeys) {
        const stateKey = LayoutStateKeys[key4];
        if (stateKey instanceof RuntimeStateKey && stateKey.scope === 0 /* PROFILE */ && stateKey.target === 0 /* USER */) {
          if (`${_LayoutStateModel.STORAGE_PREFIX}${stateKey.name}` === storageChangeEvent.key) {
            const value2 = this.loadKeyFromStorage(stateKey) ?? stateKey.defaultValue;
            if (this.stateCache.get(stateKey.name) !== value2) {
              this.stateCache.set(stateKey.name, value2);
              this._onDidChangeState.fire({ key: stateKey, value: value2 });
            }
          }
        }
      }
    }));
  }
  applyOverrides(configuration2) {
    if (this.isNew[1 /* WORKSPACE */]) {
      const defaultAuxiliaryBarVisibility = this.configurationService.getValue("workbench.secondarySideBar.defaultVisibility" /* AUXILIARYBAR_DEFAULT_VISIBILITY */);
      const startupEditor = this.configurationService.getValue("workbench.startupEditor");
      if (startupEditor === "agentSessionsWelcomePage") {
        this.applyAuxiliaryBarHiddenOverride(true);
      } else if (defaultAuxiliaryBarVisibility === "maximized" || defaultAuxiliaryBarVisibility === "maximizedInWorkspace" && this.contextService.getWorkbenchState() !== 1 /* EMPTY */) {
        this.applyAuxiliaryBarMaximizedOverride();
      }
    }
    if (this.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN) && this.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN) && !this.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_WAS_LAST_MAXIMIZED)) {
      this.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, false);
    }
    if (this.isNew[1 /* WORKSPACE */] && configuration2.mainContainerDimension.width <= DEFAULT_WORKSPACE_WINDOW_DIMENSIONS.width) {
      this.setInitializationValue(LayoutStateKeys.SIDEBAR_SIZE, Math.min(300, configuration2.mainContainerDimension.width / 4));
      this.setInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE, Math.min(300, configuration2.mainContainerDimension.width / 4));
    }
  }
  applyAuxiliaryBarMaximizedOverride() {
    this.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY, {
      sideBarVisible: !this.getRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN),
      panelVisible: !this.getRuntimeValue(LayoutStateKeys.PANEL_HIDDEN),
      editorVisible: !this.getRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN),
      auxiliaryBarVisible: !this.getRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN)
    });
    this.setRuntimeValue(LayoutStateKeys.SIDEBAR_HIDDEN, true);
    this.setRuntimeValue(LayoutStateKeys.PANEL_HIDDEN, true);
    this.setRuntimeValue(LayoutStateKeys.EDITOR_HIDDEN, true);
    this.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, false);
    this.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE, this.getInitializationValue(LayoutStateKeys.AUXILIARYBAR_SIZE));
    this.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_WAS_LAST_MAXIMIZED, true);
  }
  applyAuxiliaryBarHiddenOverride(value2) {
    this.setRuntimeValue(LayoutStateKeys.AUXILIARYBAR_HIDDEN, value2);
  }
  save(workspace, global) {
    let key3;
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    for (key3 in LayoutStateKeys) {
      const stateKey = LayoutStateKeys[key3];
      if (workspace && stateKey.scope === 1 /* WORKSPACE */ || global && stateKey.scope === 0 /* PROFILE */) {
        if (isZenMode && stateKey instanceof RuntimeStateKey && stateKey.zenModeIgnore) {
          continue;
        }
        this.saveKeyToStorage(stateKey);
      }
    }
  }
  getInitializationValue(key3) {
    return this.stateCache.get(key3.name);
  }
  setInitializationValue(key3, value2) {
    this.stateCache.set(key3.name, value2);
  }
  getRuntimeValue(key3, fallbackToSetting) {
    if (fallbackToSetting) {
      switch (key3) {
        case LayoutStateKeys.ACTIVITYBAR_HIDDEN:
          this.stateCache.set(key3.name, this.isActivityBarHidden());
          break;
        case LayoutStateKeys.STATUSBAR_HIDDEN:
          this.stateCache.set(key3.name, !this.configurationService.getValue("workbench.statusBar.visible" /* STATUSBAR_VISIBLE */));
          break;
        case LayoutStateKeys.SIDEBAR_POSITON:
          this.stateCache.set(key3.name, this.configurationService.getValue("workbench.sideBar.location" /* SIDEBAR_POSITION */) ?? "left");
          break;
      }
    }
    return this.stateCache.get(key3.name);
  }
  setRuntimeValue(key3, value2) {
    this.stateCache.set(key3.name, value2);
    const isZenMode = this.getRuntimeValue(LayoutStateKeys.ZEN_MODE_ACTIVE);
    if (key3.scope === 0 /* PROFILE */) {
      if (!isZenMode || !key3.zenModeIgnore) {
        this.saveKeyToStorage(key3);
        this.updateLegacySettingsFromState(key3, value2);
      }
    }
  }
  isActivityBarHidden() {
    const oldValue = this.configurationService.getValue("workbench.activityBar.visible" /* ACTIVITY_BAR_VISIBLE */);
    if (oldValue !== void 0) {
      return !oldValue;
    }
    return this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) !== "default" /* DEFAULT */;
  }
  setRuntimeValueAndFire(key3, value2) {
    const previousValue = this.stateCache.get(key3.name);
    if (previousValue === value2) {
      return;
    }
    this.setRuntimeValue(key3, value2);
    this._onDidChangeState.fire({ key: key3, value: value2 });
  }
  saveKeyToStorage(key3) {
    const value2 = this.stateCache.get(key3.name);
    this.storageService.store(`${_LayoutStateModel.STORAGE_PREFIX}${key3.name}`, typeof value2 === "object" ? JSON.stringify(value2) : value2, key3.scope, key3.target);
  }
  loadKeyFromStorage(key3) {
    const value2 = this.storageService.get(`${_LayoutStateModel.STORAGE_PREFIX}${key3.name}`, key3.scope);
    if (value2 !== void 0) {
      this.isNew[key3.scope] = false;
      switch (typeof key3.defaultValue) {
        case "boolean":
          return value2 === "true";
        case "number":
          return parseInt(value2);
        case "object":
          return JSON.parse(value2);
      }
    }
    return value2;
  }
};
export { getZenModeConfiguration, COMMAND_CENTER_SETTINGS, TITLE_BAR_SETTINGS, DEFAULT_EMPTY_WINDOW_DIMENSIONS, DEFAULT_WORKSPACE_WINDOW_DIMENSIONS, Layout, WorkbenchLayoutStateKey, RuntimeStateKey, InitializationStateKey, LayoutStateKeys, LayoutStateModel };
