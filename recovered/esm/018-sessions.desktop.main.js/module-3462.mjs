// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/titlebarPart.ts
import { IsNewChatSessionContext } from "./module-1770.mjs";
import { MultiWindowParts, Part } from "./module-1563.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getTitleBarStyle, getWindowControlsStyle, hasCustomTitlebar, hasNativeTitlebar } from "./module-0515.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, getWindow, getWindowId, prepend } from "./module-0075.mjs";
import { isMacintosh, isNative, isWeb, platformLocale } from "./module-0014.mjs";
import { getWCOTitlebarAreaRect, getZoomFactor, isFullscreen, isWCOEnabled, onDidChangeFullscreen } from "./module-0018.mjs";
import { safeIntl } from "./module-0120.mjs";
import { mainWindow } from "./module-0002.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { MenuWorkbenchButtonBar } from "./module-1988.mjs";
import { agentsBackground, agentsPanelForeground } from "./module-1496.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1118.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { WindowTitle } from "./module-1494.mjs";


// src/vs/sessions/browser/parts/titlebarPart.ts
var commandCenterContextKeys = /* @__PURE__ */ new Set([IsNewChatSessionContext.key]);

var TitlebarPart = class extends Part {
  constructor(id2, targetWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    super(id2, { hasTitle: false }, themeService, storageService, layoutService);
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.hostService = hostService;
    //#region IView
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    //#endregion
    //#region Events
    this._onMenubarVisibilityChange = this._register(new Emitter());
    this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.overflowManagedToolBarElements = [];
    this.leftSpacerWidth = 0;
    this.isInactive = false;
    this.titleBarStyle = getTitleBarStyle(this.configurationService);
    this.registerListeners(getWindowId(targetWindow));
  }
  get minimumHeight() {
    const wcoEnabled = isWeb && isWCOEnabled();
    let value2 = DEFAULT_CUSTOM_TITLEBAR_HEIGHT;
    if (wcoEnabled) {
      value2 = Math.max(value2, getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0);
    }
    return value2 / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  get leftContainer() {
    return this.leftContent;
  }
  get rightContainer() {
    return this.rightContent;
  }
  get rightWindowControlsContainer() {
    return this.windowControlsContainer;
  }
  registerListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFocus((focused) => focused ? this.onFocus() : this.onBlur()));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  updateProperties(_properties) {
  }
  registerVariables(_variables) {
  }
  updateOptions(_options) {
  }
  createContentArea(parent) {
    this.element = parent;
    this.rootContainer = append(parent, $(".titlebar-container.sessions-titlebar-container.has-center"));
    prepend(this.rootContainer, $("div.titlebar-drag-region"));
    this.leftContent = append(this.rootContainer, $(".titlebar-left"));
    this.centerContent = append(this.rootContainer, $(".titlebar-center"));
    this.rightContent = append(this.rootContainer, $(".titlebar-right"));
    if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      let primaryWindowControlsLocation = isMacintosh ? "left" : "right";
      if (isMacintosh && isNative) {
        const localeInfo = safeIntl.Locale(platformLocale).value;
        const textInfo = localeInfo.textInfo;
        if (textInfo?.direction === "rtl") {
          primaryWindowControlsLocation = "right";
        }
      }
      if (isMacintosh && isNative && primaryWindowControlsLocation === "left") {
        const spacer = append(this.leftContent, $("div.window-controls-container"));
        const updateSpacerVisibility = () => {
          const fullscreen = isFullscreen(mainWindow);
          spacer.style.display = fullscreen ? "none" : "";
          this.leftSpacerWidth = fullscreen ? 0 : 70;
        };
        updateSpacerVisibility();
        spacer.style.width = `${this.leftSpacerWidth}px`;
        spacer.style.flexShrink = "0";
        this._register(onDidChangeFullscreen((windowId) => {
          if (windowId === getWindowId(mainWindow)) {
            updateSpacerVisibility();
          }
        }));
      } else if (getWindowControlsStyle(this.configurationService) === "hidden" /* HIDDEN */) {
      } else {
        this.windowControlsContainer = append(primaryWindowControlsLocation === "left" ? this.leftContent : this.rightContent, $("div.window-controls-container"));
        if (isWeb) {
          append(primaryWindowControlsLocation === "left" ? this.rightContent : this.leftContent, $("div.window-controls-container"));
        }
        if (isWCOEnabled()) {
          this.windowControlsContainer.classList.add("wco-enabled");
        }
      }
    }
    this.leftToolbarContainer = append(this.leftContent, $("div.left-toolbar-container"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, this.leftToolbarContainer, Menus.TitleBarLeftLayout, {
      contextMenu: Menus.TitleBarContext,
      telemetrySource: "titlePart.left",
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true }
    }));
    const centerNavContainer = append(this.centerContent, $("div.titlebar-actions-container.titlebar-center-nav-container"));
    const centerNavToolBar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, centerNavContainer, Menus.TitleBarCenterLeft, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "titlePart.centerLeft",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const windowTitle = append(this.centerContent, $("div.window-title"));
    const centerToolbarContainer = append(windowTitle, $("div.command-center"));
    const centerToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, centerToolbarContainer, Menus.CommandCenter, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "commandCenter",
      toolbarOptions: { primaryGroup: () => true }
    }));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(commandCenterContextKeys)) {
        centerToolbar.refresh();
      }
    }));
    const centerActionsContainer = append(this.centerContent, $("div.titlebar-actions-container.titlebar-center-actions-container"));
    const centerActionsToolBar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, centerActionsContainer, Menus.TitleBarCenterRight, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "titlePart.centerRight",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const rightToolbarContainer = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-right-layout-container"));
    const rightToolBar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, rightToolbarContainer, Menus.TitleBarRightLayout, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "titlePart.right",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const sessionActionsContainer = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-session-actions-container"));
    const sessionActionsToolBar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, sessionActionsContainer, Menus.TitleBarSessionMenu, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "titlePart.sessionActions",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const updateToolBarElement = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-update-container"));
    const updateToolBar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, updateToolBarElement, Menus.TitleBarUpdate, {
      contextMenu: Menus.TitleBarContext,
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "titlePart.update",
      toolbarOptions: { primaryGroup: () => true }
    }));
    const screenReaderToolBarElement = prepend(this.rightContent, $("div.titlebar-actions-container.titlebar-screen-reader-container"));
    const screenReaderButtonBar = this._register(this.instantiationService.createInstance(MenuWorkbenchButtonBar, screenReaderToolBarElement, Menus.TitleBarAccessibility, {
      telemetrySource: "titlePart.accessibility",
      renderSecondaryActions: false,
      buttonConfigProvider: () => ({ showIcon: false, showLabel: true, isSecondary: false })
    }));
    const updateScreenReaderButtonBar = () => {
      screenReaderToolBarElement.classList.toggle("has-no-actions", screenReaderButtonBar.buttons.length === 0);
      this.updateTitleBarToolBarOverflow();
    };
    this._register(screenReaderButtonBar.onDidChange(updateScreenReaderButtonBar));
    updateScreenReaderButtonBar();
    this.overflowManagedToolBarElements.push(screenReaderToolBarElement);
    this.registerOverflowManagedToolBar(centerActionsContainer, centerActionsToolBar);
    this.registerOverflowManagedToolBar(centerNavContainer, centerNavToolBar);
    this.registerOverflowManagedToolBar(rightToolbarContainer, rightToolBar);
    this.registerOverflowManagedToolBar(sessionActionsContainer, sessionActionsToolBar);
    this.registerOverflowManagedToolBar(updateToolBarElement, updateToolBar);
    this._register(addDisposableListener(this.rootContainer, EventType.CONTEXT_MENU, (e4) => {
      EventHelper.stop(e4);
      this.onContextMenu(e4);
    }));
    this.updateStyles();
    return this.element;
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      this.element.classList.toggle("inactive", this.isInactive);
      const titleBarBackground = this.getColor(agentsBackground);
      this.element.style.backgroundColor = titleBarBackground || "";
      const titleForeground = this.getColor(agentsPanelForeground);
      this.element.style.color = titleForeground || "";
    }
  }
  onContextMenu(e4) {
    const event = new StandardMouseEvent(getWindow(this.element), e4);
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      menuId: Menus.TitleBarContext,
      contextKeyService: this.contextKeyService,
      domForShadowRoot: isMacintosh && isNative ? event.target : void 0
    });
  }
  get hasZoomableElements() {
    return true;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
  }
  layout(width2, height) {
    this.updateLayout();
    super.layoutContents(width2, height);
    this.updateTitleBarToolBarOverflow();
  }
  registerOverflowManagedToolBar(element, toolBar) {
    this.overflowManagedToolBarElements.push(element);
    this._register(toolBar.onDidChangeMenuItems(() => this.updateTitleBarToolBarOverflow()));
  }
  updateTitleBarToolBarOverflow() {
    for (const element of this.overflowManagedToolBarElements) {
      element.classList.remove("overflowing");
    }
    if (this.rootContainer.clientWidth === 0) {
      return;
    }
    for (const element of this.overflowManagedToolBarElements) {
      if (!this.isTitleBarOverflowing()) {
        return;
      }
      if (!element.classList.contains("has-no-actions")) {
        element.classList.add("overflowing");
      }
    }
  }
  isTitleBarOverflowing() {
    return [this.rootContainer, this.leftContent, this.centerContent, this.rightContent].some((element) => element.scrollWidth > element.clientWidth);
  }
  updateLayout() {
    if (!hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      return;
    }
    const zoomFactor = getZoomFactor(getWindow(this.element));
    this.element.style.setProperty("--zoom-factor", zoomFactor.toString());
    this.rootContainer.classList.toggle("counter-zoom", this.preventZoom);
  }
  focus() {
    this.element.querySelector('[tabindex]:not([tabindex="-1"])')?.focus();
  }
  toJSON() {
    return { type: "workbench.parts.titlebar" /* TITLEBAR_PART */ };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};

TitlebarPart = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IHostService)
], TitlebarPart);

var MainTitlebarPart = class extends TitlebarPart {
  constructor(contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    super("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService);
  }
};

MainTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IHostService)
], MainTitlebarPart);

var AuxiliaryTitlebarPart = class extends TitlebarPart {
  constructor(container2, mainTitlebar, contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService) {
    const id2 = AuxiliaryTitlebarPart.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id2}`, getWindow(container2), contextMenuService, configurationService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService);
    this.container = container2;
    this.mainTitlebar = mainTitlebar;
  }
  static {
    this.COUNTER = 1;
  }
  get height() {
    return this.minimumHeight;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
  }
};

AuxiliaryTitlebarPart = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IWorkbenchLayoutService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IHostService)
], AuxiliaryTitlebarPart);

var TitleService = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService) {
    super("workbench.agentSessionsTitleService", themeService, storageService);
    this.instantiationService = instantiationService;
    this.mainPart = this._register(this.createMainTitlebarPart());
    this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
    this._register(this.registerPart(this.mainPart));
  }
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainTitlebarPart);
  }
  //#region Auxiliary Titlebar Parts
  createAuxiliaryTitlebarPart(container2, editorGroupsContainer, instantiationService) {
    const titlebarPartContainer = $(".part.titlebar", { role: "none" });
    titlebarPartContainer.style.position = "relative";
    container2.insertBefore(titlebarPartContainer, container2.firstChild);
    const disposables = new DisposableStore();
    const titlebarPart = this.doCreateAuxiliaryTitlebarPart(titlebarPartContainer, editorGroupsContainer, instantiationService);
    disposables.add(this.registerPart(titlebarPart));
    disposables.add(Event2.runAndSubscribe(titlebarPart.onDidChange, () => titlebarPartContainer.style.height = `${titlebarPart.height}px`));
    titlebarPart.create(titlebarPartContainer);
    Event2.once(titlebarPart.onWillDispose)(() => disposables.dispose());
    return titlebarPart;
  }
  doCreateAuxiliaryTitlebarPart(container2, _editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryTitlebarPart, container2, this.mainPart);
  }
  updateProperties(properties) {
    for (const part of this.parts) {
      part.updateProperties(properties);
    }
  }
  registerVariables(variables) {
    for (const part of this.parts) {
      part.registerVariables(variables);
    }
  }
  get windowTitle() {
    if (!this._windowTitle) {
      this._windowTitle = this._register(this.instantiationService.createInstance(WindowTitle, mainWindow));
    }
    return this._windowTitle;
  }
  //#endregion
};

TitleService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService)
], TitleService);
export { commandCenterContextKeys, TitlebarPart, MainTitlebarPart, AuxiliaryTitlebarPart, TitleService };
