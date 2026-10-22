// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/titlebar/titlebarPart.ts
import { MultiWindowParts, Part } from "./module-1566.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IsCompactTitleBarContext, TitleBarVisibleContext } from "./module-0949.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, append, getActiveDocument, getWindow, getWindowId, isAncestor, isHTMLElement, prepend, reset } from "./module-0075.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IEditorService } from "./module-0934.mjs";
import { mainWindow } from "./module-0002.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getMenuBarVisibility, getTitleBarStyle, getWindowControlsStyle, hasCustomTitlebar, hasNativeMenu, hasNativeTitlebar } from "./module-0515.mjs";
import { WindowTitle } from "./module-1495.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { isLinux, isMacintosh, isNative, isWeb, isWindows, platformLocale } from "./module-0014.mjs";
import { getWCOTitlebarAreaRect, getZoomFactor, isWCOEnabled } from "./module-0018.mjs";
import { CustomMenubarControl } from "./module-1609.mjs";
import { MenuWorkbenchToolBar, WorkbenchToolBar } from "./module-0519.mjs";
import { createActionViewItem, fillInActionBarActions } from "./module-0516.mjs";
import { safeIntl } from "./module-0120.mjs";
import { CommandCenterControl } from "./module-3802.mjs";
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from "./module-1610.mjs";
import { AccountsActivityActionViewItem, SimpleAccountActivityActionViewItem, SimpleGlobalActivityActionViewItem, isAccountsActionVisible } from "./module-1618.mjs";
import { EditorPane } from "./module-1089.mjs";
import { EDITOR_CORE_NAVIGATION_COMMANDS } from "./module-1538.mjs";
import { WORKBENCH_MENU_MOTION_CLASS, workbenchMenuCloseAnimation } from "./module-1612.mjs";
import { ACCOUNTS_ACTIVITY_TILE_ACTION, GLOBAL_ACTIVITY_TITLE_ACTION, TitleBarLeadingActionsGroup } from "./module-2579.mjs";
import { ActionRunner, Separator } from "./module-0082.mjs";
import { prepareActions } from "./module-0477.mjs";
import { EditorCommandsContextActionRunner } from "./module-1570.mjs";
import { TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_BORDER, TITLE_BAR_INACTIVE_BACKGROUND, TITLE_BAR_INACTIVE_FOREGROUND, WORKBENCH_BACKGROUND } from "./module-0912.mjs";
import { Color } from "./module-0197.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHostService } from "./module-1117.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";


// src/vs/workbench/browser/parts/titlebar/titlebarPart.ts
var BrowserTitleService = class extends MultiWindowParts {
  constructor(instantiationService, storageService, themeService) {
    super("workbench.titleService", themeService, storageService);
    this.instantiationService = instantiationService;
    this.properties = void 0;
    this.variables = /* @__PURE__ */ new Map();
    this.mainPart = this._register(this.createMainTitlebarPart());
    this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
    this._register(this.registerPart(this.mainPart));
    this.registerActions();
    this.registerAPICommands();
  }
  createMainTitlebarPart() {
    return this.instantiationService.createInstance(MainBrowserTitlebarPart);
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class FocusTitleBar extends Action2 {
      constructor() {
        super({
          id: `workbench.action.focusTitleBar`,
          title: localize2(6959, "Focus Title Bar"),
          category: Categories.View,
          f1: true,
          precondition: TitleBarVisibleContext
        });
      }
      run() {
        that.getPartByDocument(getActiveDocument())?.focus();
      }
    }));
  }
  registerAPICommands() {
    this._register(CommandsRegistry.registerCommand({
      id: "registerWindowTitleVariable",
      handler: (accessor, name, contextKey) => {
        this.registerVariables([{ name, contextKey }]);
      },
      metadata: {
        description: "Registers a new title variable",
        args: [
          { name: "name", schema: { type: "string" }, description: "The name of the variable to register" },
          { name: "contextKey", schema: { type: "string" }, description: "The context key to use for the value of the variable" }
        ]
      }
    }));
  }
  //#region Auxiliary Titlebar Parts
  createAuxiliaryTitlebarPart(container3, editorGroupsContainer, instantiationService) {
    const titlebarPartContainer = $(".part.titlebar", { role: "none" });
    titlebarPartContainer.style.position = "relative";
    container3.insertBefore(titlebarPartContainer, container3.firstChild);
    const disposables = new DisposableStore();
    const titlebarPart = this.doCreateAuxiliaryTitlebarPart(titlebarPartContainer, editorGroupsContainer, instantiationService);
    disposables.add(this.registerPart(titlebarPart));
    disposables.add(Event2.runAndSubscribe(titlebarPart.onDidChange, () => titlebarPartContainer.style.height = `${titlebarPart.height}px`));
    titlebarPart.create(titlebarPartContainer);
    if (this.properties) {
      titlebarPart.updateProperties(this.properties);
    }
    if (this.variables.size) {
      titlebarPart.registerVariables(Array.from(this.variables.values()));
    }
    Event2.once(titlebarPart.onWillDispose)(() => disposables.dispose());
    return titlebarPart;
  }
  doCreateAuxiliaryTitlebarPart(container3, editorGroupsContainer, instantiationService) {
    return instantiationService.createInstance(AuxiliaryBrowserTitlebarPart, container3, editorGroupsContainer, this.mainPart);
  }
  updateProperties(properties) {
    this.properties = properties;
    for (const part of this.parts) {
      part.updateProperties(properties);
    }
  }
  registerVariables(variables) {
    const newVariables = [];
    for (const variable of variables) {
      if (!this.variables.has(variable.name)) {
        this.variables.set(variable.name, variable);
        newVariables.push(variable);
      }
    }
    for (const part of this.parts) {
      part.registerVariables(newVariables);
    }
  }
  get windowTitle() {
    return this.mainPart.windowTitle;
  }
  //#endregion
};

BrowserTitleService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IThemeService)
], BrowserTitleService);

var BrowserTitlebarPart = class extends Part {
  constructor(id2, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService, actionViewItemService) {
    super(id2, { hasTitle: false }, themeService, storageService, layoutService);
    this.editorGroupsContainer = editorGroupsContainer;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.contextKeyService = contextKeyService;
    this.hostService = hostService;
    this.menuService = menuService;
    this.keybindingService = keybindingService;
    this.actionViewItemService = actionViewItemService;
    //#region IView
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    //#endregion
    //#region Events
    this._onMenubarVisibilityChange = this._register(new Emitter());
    this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.customMenubar = this._register(new MutableDisposable());
    this.customMenubarDisposables = this._register(new DisposableStore());
    this.actionToolBarDisposable = this._register(new DisposableStore());
    this.editorActionsChangeDisposable = this._register(new DisposableStore());
    this.centerAdjacentToolBarDisposable = this._register(new DisposableStore());
    this.updateToolBarDisposable = this._register(new DisposableStore());
    this.globalToolbarMenuDisposables = this._register(new DisposableStore());
    this.editorToolbarMenuDisposables = this._register(new DisposableStore());
    this.layoutToolbarMenuDisposables = this._register(new DisposableStore());
    this.activityToolbarDisposables = this._register(new DisposableStore());
    this.titleDisposables = this._register(new DisposableStore());
    this.isInactive = false;
    this.isCompact = false;
    const scopedEditorService = editorService.createScoped(editorGroupsContainer, this._store);
    this.instantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IEditorService, scopedEditorService]
    )));
    this.isAuxiliary = targetWindow.vscodeWindowId !== mainWindow.vscodeWindowId;
    this.isCompactContextKey = IsCompactTitleBarContext.bindTo(this.contextKeyService);
    this.titleBarStyle = getTitleBarStyle(this.configurationService);
    this.windowTitle = this._register(this.instantiationService.createInstance(WindowTitle, targetWindow));
    this.hoverDelegate = this._register(createInstantHoverDelegate());
    this.registerListeners(getWindowId(targetWindow));
  }
  get minimumHeight() {
    const wcoEnabled = isWeb && isWCOEnabled();
    let value2 = this.isCommandCenterVisible || wcoEnabled ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : 30;
    if (wcoEnabled) {
      value2 = Math.max(value2, getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0);
    }
    return value2 / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
  }
  get maximumHeight() {
    return this.minimumHeight;
  }
  registerListeners(targetWindowId) {
    this._register(this.hostService.onDidChangeFocus((focused) => focused ? this.onFocus() : this.onBlur()));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationChanged(e)));
    this._register(this.editorGroupsContainer.onDidChangeEditorPartOptions((e) => this.onEditorPartConfigurationChange(e)));
  }
  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }
  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }
  onEditorPartConfigurationChange({ oldPartOptions, newPartOptions }) {
    if (oldPartOptions.editorActionsLocation !== newPartOptions.editorActionsLocation || oldPartOptions.showTabs !== newPartOptions.showTabs) {
      if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
        this.createActionToolBar();
        this.createActionToolBarMenus({ editorActions: true });
        this._onDidChange.fire(void 0);
      }
    }
  }
  onConfigurationChanged(event) {
    if (event.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */)) {
      this.updateStyles();
    }
    if (!this.isAuxiliary && !hasNativeMenu(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb)) {
      if (event.affectsConfiguration("window.menuBarVisibility" /* MenuBarVisibility */)) {
        if (this.currentMenubarVisibility === "compact") {
          this.uninstallMenubar();
        } else {
          this.installMenubar();
        }
      }
    }
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
      const affectsLayoutControl = event.affectsConfiguration("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */);
      const affectsActivityControl = event.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
      if (affectsLayoutControl || affectsActivityControl) {
        this.createActionToolBarMenus({ layoutActions: affectsLayoutControl, activityActions: affectsActivityControl });
        this._onDidChange.fire(void 0);
      }
    }
    if (event.affectsConfiguration("window.commandCenter" /* COMMAND_CENTER */)) {
      this.recreateTitle();
    }
  }
  recreateTitle() {
    this.createTitle();
    this._onDidChange.fire(void 0);
  }
  updateOptions(options3) {
    const oldIsCompact = this.isCompact;
    this.isCompact = options3.compact;
    this.isCompactContextKey.set(this.isCompact);
    if (oldIsCompact !== this.isCompact) {
      this.recreateTitle();
      this.createActionToolBarMenus(true);
    }
  }
  installMenubar() {
    if (this.menubar) {
      return;
    }
    const customMenubar = this.instantiationService.createInstance(CustomMenubarControl);
    this.customMenubar.value = customMenubar;
    this.menubar = append(this.leftContent, $("div.menubar"));
    this.menubar.setAttribute("role", "menubar");
    this.customMenubarDisposables.add(customMenubar.onVisibilityChange((e) => this.onMenubarVisibilityChanged(e)));
    customMenubar.create(this.menubar);
  }
  uninstallMenubar() {
    this.customMenubarDisposables.clear();
    this.customMenubar.clear();
    this.menubar?.remove();
    this.menubar = void 0;
    this.onMenubarVisibilityChanged(false);
  }
  onMenubarVisibilityChanged(visible) {
    if (isWeb || isWindows || isLinux) {
      if (this.lastLayoutDimensions) {
        this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
      }
      this._onMenubarVisibilityChange.fire(visible);
    }
  }
  updateProperties(properties) {
    this.windowTitle.updateProperties(properties);
  }
  registerVariables(variables) {
    this.windowTitle.registerVariables(variables);
  }
  createContentArea(parent) {
    this.element = parent;
    this.rootContainer = append(parent, $(".titlebar-container"));
    this.leftContent = append(this.rootContainer, $(".titlebar-left"));
    this.centerContent = append(this.rootContainer, $(".titlebar-center"));
    this.rightContent = append(this.rootContainer, $(".titlebar-right"));
    if ((isWindows || isLinux) && !hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      this.appIcon = prepend(this.leftContent, $("a.window-appicon"));
    }
    this.dragRegion = prepend(this.rootContainer, $("div.titlebar-drag-region"));
    if (!this.isAuxiliary && !hasNativeMenu(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb) && this.currentMenubarVisibility !== "compact") {
      this.installMenubar();
    }
    this.title = append(this.centerContent, $("div.window-title"));
    this.createTitle();
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      const centerAdjacentToolBarElement = append(this.rightContent, $("div.center-adjacent-toolbar-container"));
      this.centerAdjacentToolBarElement = centerAdjacentToolBarElement;
      const centerAdjacentToolBar = this.centerAdjacentToolBarDisposable.add(this.instantiationService.createInstance(MenuWorkbenchToolBar, centerAdjacentToolBarElement, MenuId.TitleBarAdjacentCenter, {
        contextMenu: MenuId.TitleBarContext,
        hiddenItemStrategy: -1 /* NoHide */,
        toolbarOptions: {
          primaryGroup: () => true
        },
        actionViewItemProvider: (action, options3) => createActionViewItem(this.instantiationService, action, options3),
        hoverDelegate: this.hoverDelegate
      }));
      this.centerAdjacentToolBarDisposable.add(centerAdjacentToolBar.onDidChangeMenuItems(() => this.updateTitleBarToolBarOverflow()));
    }
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      const updateToolBarElement = append(this.rightContent, $("div.update-toolbar-container"));
      this.updateToolBarElement = updateToolBarElement;
      const updateToolBar = this.updateToolBarDisposable.add(this.instantiationService.createInstance(MenuWorkbenchToolBar, updateToolBarElement, MenuId.TitleBarUpdate, {
        contextMenu: MenuId.TitleBarContext,
        hiddenItemStrategy: -1 /* NoHide */,
        toolbarOptions: {
          primaryGroup: () => true
        },
        actionViewItemProvider: (action, options3) => createActionViewItem(this.instantiationService, action, options3),
        hoverDelegate: this.hoverDelegate
      }));
      this.updateToolBarDisposable.add(updateToolBar.onDidChangeMenuItems(() => this.updateTitleBarToolBarOverflow()));
    }
    if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      this.actionToolBarElement = append(this.rightContent, $("div.action-toolbar-container"));
      this.createActionToolBar();
      this.createActionToolBarMenus();
    }
    if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
      let primaryWindowControlsLocation = isMacintosh ? "left" : "right";
      if (isMacintosh && isNative) {
        const localeInfo = safeIntl.Locale(platformLocale).value;
        const textInfo = localeInfo.textInfo;
        if (textInfo && typeof textInfo === "object" && "direction" in textInfo && textInfo.direction === "rtl") {
          primaryWindowControlsLocation = "right";
        }
      }
      if (isMacintosh && isNative && primaryWindowControlsLocation === "left") {
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
    {
      this._register(addDisposableListener(this.rootContainer, EventType.CONTEXT_MENU, (e) => {
        EventHelper.stop(e);
        let targetMenu;
        if (isMacintosh && isHTMLElement(e.target) && isAncestor(e.target, this.title)) {
          targetMenu = MenuId.TitleBarTitleContext;
        } else {
          targetMenu = MenuId.TitleBarContext;
        }
        this.onContextMenu(e, targetMenu);
      }));
      if (isMacintosh) {
        this._register(addDisposableListener(
          this.title,
          EventType.MOUSE_DOWN,
          (e) => {
            if (e.metaKey) {
              EventHelper.stop(
                e,
                true
                /* stop bubbling to prevent command center from opening */
              );
              this.onContextMenu(e, MenuId.TitleBarTitleContext);
            }
          },
          true
          /* capture phase to prevent command center from opening */
        ));
      }
    }
    this.updateStyles();
    return this.element;
  }
  createTitle() {
    this.titleDisposables.clear();
    const isShowingTitleInNativeTitlebar = hasNativeTitlebar(this.configurationService, this.titleBarStyle);
    if (!this.isCommandCenterVisible) {
      if (!isShowingTitleInNativeTitlebar) {
        this.title.textContent = this.windowTitle.value;
        this.titleDisposables.add(this.windowTitle.onDidChange(() => {
          this.title.textContent = this.windowTitle.value;
          if (this.lastLayoutDimensions) {
            this.updateLayout(this.lastLayoutDimensions);
          }
        }));
      } else {
        reset(this.title);
      }
    } else {
      const commandCenter = this.instantiationService.createInstance(CommandCenterControl, this.windowTitle, this.hoverDelegate);
      reset(this.title, commandCenter.element);
      this.titleDisposables.add(commandCenter);
    }
  }
  actionViewItemProvider(action, options3) {
    for (const menuId of [MenuId.TitleBar, MenuId.LayoutControlMenu]) {
      const customViewItem = this.actionViewItemService.lookUp(menuId, action.id);
      if (customViewItem) {
        const result = customViewItem(action, options3, this.instantiationService, getWindowId(this.element ? getWindow(this.element) : mainWindow));
        if (result) {
          return result;
        }
      }
    }
    if (!this.isAuxiliary) {
      if (action.id === GLOBAL_ACTIVITY_ID) {
        return this.instantiationService.createInstance(SimpleGlobalActivityActionViewItem, { position: () => 2 /* BELOW */ }, options3);
      }
      if (action.id === ACCOUNTS_ACTIVITY_ID) {
        return this.instantiationService.createInstance(SimpleAccountActivityActionViewItem, { position: () => 2 /* BELOW */ }, options3);
      }
    }
    const activeEditorPane = this.editorGroupsContainer.activeGroup?.activeEditorPane;
    if (activeEditorPane && activeEditorPane instanceof EditorPane) {
      const result = activeEditorPane.getActionViewItem(action, options3);
      if (result) {
        return result;
      }
    }
    return createActionViewItem(this.instantiationService, action, { ...options3, menuAsChild: false });
  }
  getKeybinding(action) {
    const editorPaneAwareContextKeyService = this.editorGroupsContainer.activeGroup?.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
    return this.keybindingService.lookupKeybinding(action.id, editorPaneAwareContextKeyService);
  }
  createActionToolBar() {
    this.actionToolBarDisposable.clear();
    this.actionToolBar = this.actionToolBarDisposable.add(this.instantiationService.createInstance(WorkbenchToolBar, this.actionToolBarElement, {
      contextMenu: MenuId.TitleBarContext,
      orientation: 0 /* HORIZONTAL */,
      ariaLabel: localize(6958, null),
      getKeyBinding: (action) => this.getKeybinding(action),
      overflowBehavior: { maxItems: 12, exempted: [ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID, ...EDITOR_CORE_NAVIGATION_COMMANDS] },
      anchorAlignmentProvider: () => 1 /* RIGHT */,
      dropdownMenuClassName: WORKBENCH_MENU_MOTION_CLASS,
      dropdownMenuCloseAnimation: workbenchMenuCloseAnimation,
      telemetrySource: "titlePart",
      highlightToggledItems: this.isAuxiliary,
      // Only show toggled state for auxiliary title bars
      actionViewItemProvider: (action, options3) => this.actionViewItemProvider(action, options3),
      hoverDelegate: this.hoverDelegate
    }));
    if (this.editorActionsEnabled) {
      this.actionToolBarDisposable.add(this.editorGroupsContainer.onDidChangeActiveGroup(() => this.createActionToolBarMenus({ editorActions: true })));
    }
  }
  createActionToolBarMenus(update = true) {
    if (update === true) {
      update = { editorActions: true, layoutActions: true, globalActions: true, activityActions: true };
    }
    const updateToolBarActions = () => {
      const actions = { primary: [], secondary: [] };
      if (this.globalToolbarMenu) {
        const leading = { primary: [], secondary: [] };
        fillInActionBarActions(
          this.globalToolbarMenu.getActions(),
          leading,
          (actionGroup) => actionGroup === TitleBarLeadingActionsGroup
        );
        actions.primary.push(...leading.primary);
        actions.primary.push(new Separator());
      }
      if (this.editorActionsEnabled) {
        this.editorActionsChangeDisposable.clear();
        const activeGroup = this.editorGroupsContainer.activeGroup;
        if (activeGroup) {
          const editorActions = activeGroup.createEditorActions(this.editorActionsChangeDisposable, this.isAuxiliary && this.isCompact ? MenuId.CompactWindowEditorTitle : MenuId.EditorTitle);
          actions.primary.push(...editorActions.actions.primary);
          actions.secondary.push(...editorActions.actions.secondary);
          actions.primary.push(new Separator());
          this.editorActionsChangeDisposable.add(editorActions.onDidChange(() => updateToolBarActions()));
        }
      }
      if (this.layoutToolbarMenu) {
        fillInActionBarActions(
          this.layoutToolbarMenu.getActions(),
          actions,
          (group2) => group2 === "navigation"
        );
      }
      if (this.globalToolbarMenu) {
        const trailingGroups = this.globalToolbarMenu.getActions().filter(([group2]) => group2 !== TitleBarLeadingActionsGroup);
        fillInActionBarActions(
          trailingGroups,
          actions
        );
      }
      if (this.activityActionsEnabled) {
        if (isAccountsActionVisible(this.storageService)) {
          actions.primary.push(ACCOUNTS_ACTIVITY_TILE_ACTION);
        }
        actions.primary.push(GLOBAL_ACTIVITY_TITLE_ACTION);
      }
      this.actionToolBar.setActions(prepareActions(actions.primary), prepareActions(actions.secondary));
    };
    if (update.editorActions) {
      this.editorToolbarMenuDisposables.clear();
      if (this.editorActionsEnabled && this.editorGroupsContainer.activeGroup?.activeEditor) {
        const context2 = { groupId: this.editorGroupsContainer.activeGroup.id };
        this.actionToolBar.actionRunner = this.editorToolbarMenuDisposables.add(new EditorCommandsContextActionRunner(context2));
        this.actionToolBar.context = context2;
      } else {
        this.actionToolBar.actionRunner = this.editorToolbarMenuDisposables.add(new ActionRunner());
        this.actionToolBar.context = void 0;
      }
    }
    if (update.layoutActions) {
      this.layoutToolbarMenuDisposables.clear();
      if (this.layoutControlEnabled) {
        this.layoutToolbarMenu = this.menuService.createMenu(MenuId.LayoutControlMenu, this.contextKeyService);
        this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu);
        this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu.onDidChange(() => updateToolBarActions()));
      } else {
        this.layoutToolbarMenu = void 0;
      }
    }
    if (update.globalActions) {
      this.globalToolbarMenuDisposables.clear();
      if (this.globalActionsEnabled) {
        this.globalToolbarMenu = this.menuService.createMenu(MenuId.TitleBar, this.contextKeyService);
        this.globalToolbarMenuDisposables.add(this.globalToolbarMenu);
        this.globalToolbarMenuDisposables.add(this.globalToolbarMenu.onDidChange(() => updateToolBarActions()));
      } else {
        this.globalToolbarMenu = void 0;
      }
    }
    if (update.activityActions) {
      this.activityToolbarDisposables.clear();
      if (this.activityActionsEnabled) {
        this.activityToolbarDisposables.add(this.storageService.onDidChangeValue(0 /* PROFILE */, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => updateToolBarActions()));
      }
    }
    updateToolBarActions();
  }
  updateStyles() {
    super.updateStyles();
    if (this.element) {
      if (this.isInactive) {
        this.element.classList.add("inactive");
      } else {
        this.element.classList.remove("inactive");
      }
      const titleBackground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_BACKGROUND : TITLE_BAR_ACTIVE_BACKGROUND, (color2, theme) => {
        return color2.isOpaque() ? color2 : color2.makeOpaque(WORKBENCH_BACKGROUND(theme));
      }) || "";
      this.element.style.backgroundColor = titleBackground;
      this.layoutService.getContainer(getWindow(this.element)).style.setProperty("--modern-ui-shell-background", titleBackground);
      if (this.appIconBadge) {
        this.appIconBadge.style.backgroundColor = titleBackground;
      }
      if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
        this.element.classList.add("light");
      } else {
        this.element.classList.remove("light");
      }
      const titleForeground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_FOREGROUND : TITLE_BAR_ACTIVE_FOREGROUND);
      this.element.style.color = titleForeground || "";
      const titleBorder = !this.isAuxiliary && this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true ? void 0 : this.getColor(TITLE_BAR_BORDER);
      this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : "";
    }
  }
  onContextMenu(e, menuId) {
    const event = new StandardMouseEvent(getWindow(this.element), e);
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      menuId,
      contextKeyService: this.contextKeyService,
      domForShadowRoot: isMacintosh && isNative ? event.target : void 0
    });
  }
  get currentMenubarVisibility() {
    if (this.isAuxiliary) {
      return "hidden";
    }
    return getMenuBarVisibility(this.configurationService);
  }
  get layoutControlEnabled() {
    return this.configurationService.getValue("workbench.layoutControl.enabled" /* LAYOUT_ACTIONS */) !== false;
  }
  get isCommandCenterVisible() {
    return !this.isCompact && this.configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */) !== false;
  }
  get editorActionsEnabled() {
    return this.editorGroupsContainer.partOptions.editorActionsLocation === "titleBar" /* TITLEBAR */ || this.editorGroupsContainer.partOptions.editorActionsLocation === "default" /* DEFAULT */ && this.editorGroupsContainer.partOptions.showTabs === "none" /* NONE */;
  }
  get activityActionsEnabled() {
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    return !this.isCompact && !this.isAuxiliary && (activityBarPosition === "top" /* TOP */ || activityBarPosition === "bottom" /* BOTTOM */);
  }
  get globalActionsEnabled() {
    return !this.isCompact;
  }
  get hasZoomableElements() {
    const hasMenubar = !(this.currentMenubarVisibility === "hidden" || this.currentMenubarVisibility === "compact" || !isWeb && isMacintosh);
    const hasCommandCenter = this.isCommandCenterVisible;
    const hasToolBarActions = this.globalActionsEnabled || this.layoutControlEnabled || this.editorActionsEnabled || this.activityActionsEnabled;
    return hasMenubar || hasCommandCenter || hasToolBarActions;
  }
  get preventZoom() {
    return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
  }
  layout(width2, height) {
    this.updateLayout(new Dimension(width2, height));
    super.layoutContents(width2, height);
    this.updateTitleBarToolBarOverflow();
  }
  /**
   * Hides optional title bar toolbars when showing them would push the trailing window controls off-screen (#303222).
   */
  updateTitleBarToolBarOverflow() {
    const centerAdjacentToolBarElement = this.centerAdjacentToolBarElement?.classList.contains("has-no-actions") ? void 0 : this.centerAdjacentToolBarElement;
    const updateToolBarElement = this.updateToolBarElement?.classList.contains("has-no-actions") ? void 0 : this.updateToolBarElement;
    this.centerAdjacentToolBarElement?.classList.remove("overflowing");
    this.updateToolBarElement?.classList.remove("overflowing");
    if (this.rootContainer.scrollWidth <= this.rootContainer.clientWidth) {
      return;
    }
    centerAdjacentToolBarElement?.classList.add("overflowing");
    if (this.rootContainer.scrollWidth > this.rootContainer.clientWidth) {
      updateToolBarElement?.classList.add("overflowing");
    }
  }
  updateLayout(dimension) {
    this.lastLayoutDimensions = dimension;
    if (!hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
      return;
    }
    const zoomFactor = getZoomFactor(getWindow(this.element));
    this.element.style.setProperty("--zoom-factor", zoomFactor.toString());
    this.rootContainer.classList.toggle("counter-zoom", this.preventZoom);
    if (this.customMenubar.value) {
      const menubarDimension = new Dimension(0, dimension.height);
      this.customMenubar.value.layout(menubarDimension);
    }
    const hasCenter = this.isCommandCenterVisible || this.title.textContent !== "";
    this.rootContainer.classList.toggle("has-center", hasCenter);
  }
  focus() {
    if (this.customMenubar.value) {
      this.customMenubar.value.toggleFocus();
    } else {
      this.element.querySelector('[tabindex]:not([tabindex="-1"])')?.focus();
    }
  }
  toJSON() {
    return {
      type: "workbench.parts.titlebar" /* TITLEBAR_PART */
    };
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};

BrowserTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IEditorService),
  __decorateParam(13, IMenuService),
  __decorateParam(14, IKeybindingService),
  __decorateParam(15, IActionViewItemService)
], BrowserTitlebarPart);

var MainBrowserTitlebarPart = class extends BrowserTitlebarPart {
  constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService) {
    super("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow, editorGroupService.mainPart, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService, actionViewItemService);
  }
};

MainBrowserTitlebarPart = __decorateClass([
  __decorateParam(0, IContextMenuService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IBrowserWorkbenchEnvironmentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IMenuService),
  __decorateParam(12, IKeybindingService),
  __decorateParam(13, IActionViewItemService)
], MainBrowserTitlebarPart);

var AuxiliaryBrowserTitlebarPart = class extends BrowserTitlebarPart {
  constructor(container3, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService, actionViewItemService) {
    const id2 = AuxiliaryBrowserTitlebarPart.COUNTER++;
    super(`workbench.parts.auxiliaryTitle.${id2}`, getWindow(container3), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorService, menuService, keybindingService, actionViewItemService);
    this.container = container3;
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

AuxiliaryBrowserTitlebarPart = __decorateClass([
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IBrowserWorkbenchEnvironmentService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IEditorGroupsService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IMenuService),
  __decorateParam(15, IKeybindingService),
  __decorateParam(16, IActionViewItemService)
], AuxiliaryBrowserTitlebarPart);
export { BrowserTitleService, BrowserTitlebarPart, MainBrowserTitlebarPart, AuxiliaryBrowserTitlebarPart };
