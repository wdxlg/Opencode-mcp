// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugToolBar.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { DisposableStore, MutableDisposable, markAsSingleton } from "./module-0012.mjs";
import { $, addDisposableGenericMouseDownListener, addDisposableGenericMouseMoveListener, addDisposableGenericMouseUpListener, append, getWindow, hide, show } from "./module-0075.mjs";
import { getTitleBarStyle } from "./module-0515.mjs";
import { platform } from "./module-0014.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { debugContinue, debugDisconnect, debugGripper, debugPause, debugRestart, debugReverseContinue, debugStepBack, debugStepInto, debugStepOut, debugStepOver, debugStop } from "./module-1891.mjs";
import { IMenuService, MenuId, MenuRegistry } from "./module-0092.mjs";
import { ActionBar } from "./module-0477.mjs";
import { CONTINUE_ID, CONTINUE_LABEL, DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, PAUSE_ID, PAUSE_LABEL, RESTART_LABEL, RESTART_SESSION_ID, REVERSE_CONTINUE_ID, STEP_BACK_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL } from "./module-2406.mjs";
import { FocusSessionActionViewItem } from "./module-3016.mjs";
import { createActionViewItem, getFlatActionBarActions } from "./module-0516.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { equals } from "./module-0007.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { debugToolBarBackground, debugToolBarBorder } from "./module-1892.mjs";
import { widgetBorder } from "./module-0229.mjs";
import { mainWindow } from "./module-0002.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { CONTEXT_DEBUG_STATE, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_IN_DEBUG_MODE, CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED, IDebugService, VIEWLET_ID3 } from "./module-1057.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1932.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/debug/browser/debugToolBar.ts
var DEBUG_TOOLBAR_POSITION_KEY = "debug.actionswidgetposition";

var DEBUG_TOOLBAR_Y_KEY = "debug.actionswidgety";

var DebugToolBar = class extends Themable {
  constructor(notificationService, telemetryService, debugService, layoutService, storageService, configurationService, themeService, instantiationService, menuService, contextKeyService) {
    super(themeService);
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.debugService = debugService;
    this.layoutService = layoutService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.isVisible = false;
    this.isBuilt = false;
    this.stopActionViewItemDisposables = this._register(new DisposableStore());
    /** coordinate of the debug toolbar per aux window */
    this.auxWindowCoordinates = /* @__PURE__ */ new WeakMap();
    this.trackPixelRatioListener = this._register(new MutableDisposable());
    this.$el = $("div.debug-toolbar");
    const controlsOnTitlebar = getTitleBarStyle(this.configurationService) === "custom" /* CUSTOM */;
    const controlsOnLeft = controlsOnTitlebar && platform === 1 /* Mac */;
    const controlsOnRight = controlsOnTitlebar && (platform === 3 /* Windows */ || platform === 2 /* Linux */);
    this.$el.style.transform = `translate(
			min(
				max(${controlsOnLeft ? "60px" : "0px"}, calc(-50% + (100vw * var(--x-position)))),
				calc(100vw - 100% - ${controlsOnRight ? "100px" : "0px"})
			),
			var(--y-position)
		)`;
    this.dragArea = append(this.$el, $("div.drag-area" + ThemeIcon.asCSSSelector(debugGripper)));
    const actionBarContainer = append(this.$el, $("div.action-bar-container"));
    this.debugToolBarMenu = menuService.createMenu(MenuId.DebugToolBar, contextKeyService);
    this._register(this.debugToolBarMenu);
    this.activeActions = [];
    this.actionBar = this._register(new ActionBar(actionBarContainer, {
      orientation: 0 /* HORIZONTAL */,
      actionViewItemProvider: (action, options3) => {
        if (action.id === FOCUS_SESSION_ID) {
          return this.instantiationService.createInstance(FocusSessionActionViewItem, action, void 0);
        } else if (action.id === STOP_ID || action.id === DISCONNECT_ID) {
          this.stopActionViewItemDisposables.clear();
          const item = this.instantiationService.invokeFunction((accessor) => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor, { hoverDelegate: options3.hoverDelegate }));
          if (item) {
            return item;
          }
        }
        return createActionViewItem(this.instantiationService, action, options3);
      }
    }));
    this.updateScheduler = this._register(new RunOnceScheduler(() => {
      const state = this.debugService.state;
      const toolBarLocation = this.configurationService.getValue("debug").toolBarLocation;
      if (state === 0 /* Inactive */ || toolBarLocation !== "floating" || this.debugService.getModel().getSessions().every((s) => s.suppressDebugToolbar) || state === 1 /* Initializing */ && this.debugService.initializingOptions?.suppressDebugToolbar) {
        return this.hide();
      }
      const actions = getFlatActionBarActions(this.debugToolBarMenu.getActions({ shouldForwardArgs: true }));
      if (!equals(actions, this.activeActions, (first2, second) => first2.id === second.id && first2.enabled === second.enabled)) {
        this.actionBar.clear();
        this.actionBar.push(actions, { icon: true, label: false });
        this.activeActions = actions;
      }
      this.show();
    }, 20));
    this.updateStyles();
    this.registerListeners();
    this.hide();
  }
  registerListeners() {
    this._register(this.debugService.onDidChangeState(() => this.updateScheduler.schedule()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.toolBarLocation")) {
        this.updateScheduler.schedule();
      }
      if (e.affectsConfiguration("workbench.editor.showTabs" /* EDITOR_TABS_MODE */) || e.affectsConfiguration("window.commandCenter" /* COMMAND_CENTER */)) {
        this._yRange = void 0;
        this.setCoordinates();
      }
    }));
    this._register(this.debugToolBarMenu.onDidChange(() => this.updateScheduler.schedule()));
    this._register(this.actionBar.actionRunner.onDidRun((e) => {
      if (e.error && !isCancellationError(e.error)) {
        this.notificationService.warn(e.error);
      }
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: e.action.id, from: "debugActionsWidget" });
    }));
    this._register(addDisposableGenericMouseUpListener(this.dragArea, (event) => {
      const mouseClickEvent = new StandardMouseEvent(getWindow(this.dragArea), event);
      if (mouseClickEvent.detail === 2) {
        this.setCoordinates(0.5, this.yDefault);
        this.storePosition();
      }
    }));
    this._register(addDisposableGenericMouseDownListener(this.dragArea, (e) => {
      this.dragArea.classList.add("dragged");
      const activeWindow = getWindow(this.layoutService.activeContainer);
      const originEvent = new StandardMouseEvent(activeWindow, e);
      const originX = this.computeCurrentXPercent();
      const originY = this.getCurrentYPosition();
      const mouseMoveListener = addDisposableGenericMouseMoveListener(activeWindow, (e2) => {
        const mouseMoveEvent = new StandardMouseEvent(activeWindow, e2);
        mouseMoveEvent.preventDefault();
        this.setCoordinates(
          originX + (mouseMoveEvent.posx - originEvent.posx) / activeWindow.innerWidth,
          originY + mouseMoveEvent.posy - originEvent.posy
        );
      });
      const mouseUpListener = addDisposableGenericMouseUpListener(activeWindow, (e2) => {
        this.storePosition();
        this.dragArea.classList.remove("dragged");
        mouseMoveListener.dispose();
        mouseUpListener.dispose();
      });
    }));
    this._register(this.layoutService.onDidChangePartVisibility(() => this.setCoordinates()));
    this._register(this.layoutService.onDidChangeActiveContainer(async () => {
      this._yRange = void 0;
      await this.layoutService.whenContainerStylesLoaded(getWindow(this.layoutService.activeContainer));
      if (this.isBuilt) {
        this.doShowInActiveContainer();
        this.setCoordinates();
      }
    }));
  }
  /**
   * Computes the x percent position at which the toolbar is currently displayed.
   */
  computeCurrentXPercent() {
    const { left, width: width2 } = this.$el.getBoundingClientRect();
    return (left + width2 / 2) / getWindow(this.$el).innerWidth;
  }
  /**
   * Gets the x position set in the style of the toolbar. This may not be its
   * actual position on screen depending on toolbar locations.
   */
  getCurrentXPercent() {
    return Number(this.$el.style.getPropertyValue("--x-position"));
  }
  /** Gets the y position set in the style of the toolbar */
  getCurrentYPosition() {
    return parseInt(this.$el.style.getPropertyValue("--y-position"));
  }
  storePosition() {
    const activeWindow = getWindow(this.layoutService.activeContainer);
    const isMainWindow = this.layoutService.activeContainer === this.layoutService.mainContainer;
    const x = this.getCurrentXPercent();
    const y = this.getCurrentYPosition();
    if (isMainWindow) {
      this.storageService.store(DEBUG_TOOLBAR_POSITION_KEY, x, 0 /* PROFILE */, 1 /* MACHINE */);
      this.storageService.store(DEBUG_TOOLBAR_Y_KEY, y, 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this.auxWindowCoordinates.set(activeWindow, { x, y });
    }
  }
  updateStyles() {
    super.updateStyles();
    if (this.$el) {
      this.$el.style.backgroundColor = this.getColor(debugToolBarBackground) || "";
      const contrastBorderColor = this.getColor(widgetBorder);
      const borderColor = this.getColor(debugToolBarBorder);
      if (contrastBorderColor) {
        this.$el.style.border = `1px solid ${contrastBorderColor}`;
      } else {
        this.$el.style.border = borderColor ? `solid ${borderColor}` : "none";
        this.$el.style.border = "1px 0";
      }
    }
  }
  /** Gets the stored X position of the middle of the toolbar based on the current window width */
  getStoredXPosition() {
    const currentWindow = getWindow(this.layoutService.activeContainer);
    const isMainWindow = currentWindow === mainWindow;
    const storedPercentage = isMainWindow ? Number(this.storageService.get(DEBUG_TOOLBAR_POSITION_KEY, 0 /* PROFILE */)) : this.auxWindowCoordinates.get(currentWindow)?.x;
    return storedPercentage !== void 0 && !isNaN(storedPercentage) ? storedPercentage : 0.5;
  }
  getStoredYPosition() {
    const currentWindow = getWindow(this.layoutService.activeContainer);
    const isMainWindow = currentWindow === mainWindow;
    const storedY = isMainWindow ? this.storageService.getNumber(DEBUG_TOOLBAR_Y_KEY, 0 /* PROFILE */) : this.auxWindowCoordinates.get(currentWindow)?.y;
    return storedY ?? this.yDefault;
  }
  setCoordinates(x, y) {
    if (!this.isVisible) {
      return;
    }
    x ??= this.getStoredXPosition();
    y ??= this.getStoredYPosition();
    const [yMin, yMax] = this.yRange;
    y = Math.max(yMin, Math.min(y, yMax));
    this.$el.style.setProperty("--x-position", `${x}`);
    this.$el.style.setProperty("--y-position", `${y}px`);
  }
  get yDefault() {
    return this.layoutService.mainContainerOffset.top;
  }
  get yRange() {
    if (!this._yRange) {
      const isTitleBarVisible = this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, getWindow(this.layoutService.activeContainer));
      const yMin = isTitleBarVisible ? 0 : this.layoutService.mainContainerOffset.top;
      let yMax = 0;
      if (isTitleBarVisible) {
        if (this.configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */) === true) {
          yMax += 35;
        } else {
          yMax += 28;
        }
      }
      if (this.configurationService.getValue("workbench.editor.showTabs" /* EDITOR_TABS_MODE */) !== "none" /* NONE */) {
        yMax += 35;
      }
      this._yRange = [yMin, yMax];
    }
    return this._yRange;
  }
  show() {
    if (this.isVisible) {
      this.setCoordinates();
      return;
    }
    if (!this.isBuilt) {
      this.isBuilt = true;
      this.doShowInActiveContainer();
    }
    this.isVisible = true;
    show(this.$el);
    this.setCoordinates();
  }
  doShowInActiveContainer() {
    this.layoutService.activeContainer.appendChild(this.$el);
    this.trackPixelRatioListener.value = PixelRatio.getInstance(getWindow(this.$el)).onDidChange(
      () => this.setCoordinates()
    );
  }
  hide() {
    this.isVisible = false;
    hide(this.$el);
  }
  dispose() {
    super.dispose();
    this.$el?.remove();
  }
};

DebugToolBar = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService)
], DebugToolBar);

function createDisconnectMenuItemAction(action, disposables, accessor, options3) {
  const menuService = accessor.get(IMenuService);
  const contextKeyService = accessor.get(IContextKeyService);
  const instantiationService = accessor.get(IInstantiationService);
  const menu = menuService.getMenuActions(MenuId.DebugToolBarStop, contextKeyService, { shouldForwardArgs: true });
  const secondary = getFlatActionBarActions(menu);
  if (!secondary.length) {
    return void 0;
  }
  const dropdownAction = disposables.add(new Action("notebook.moreRunActions", localize(14586, null), "codicon-chevron-down", true));
  const item = instantiationService.createInstance(
    DropdownWithPrimaryActionViewItem,
    action,
    dropdownAction,
    secondary,
    "debug-stop-actions",
    options3
  );
  return item;
}

var debugViewTitleItems = new DisposableStore();

var registerDebugToolBarItem = (id2, title, order, icon2, when, precondition2, alt) => {
  MenuRegistry.appendMenuItem(MenuId.DebugToolBar, {
    group: "navigation",
    when,
    order,
    command: {
      id: id2,
      title,
      icon: icon2,
      precondition: precondition2
    },
    alt
  });
  debugViewTitleItems.add(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
    group: "navigation",
    when: ContextKeyExpr.and(when, ContextKeyExpr.equals("viewContainer", VIEWLET_ID3), CONTEXT_DEBUG_STATE.notEqualsTo("inactive"), ContextKeyExpr.equals("config.debug.toolBarLocation", "docked")),
    order,
    command: {
      id: id2,
      title,
      icon: icon2,
      precondition: precondition2
    }
  }));
};

markAsSingleton(MenuRegistry.onDidChangeMenu((e) => {
  if (e.has(MenuId.DebugToolBar)) {
    debugViewTitleItems.clear();
    const items = MenuRegistry.getMenuItems(MenuId.DebugToolBar);
    for (const i2 of items) {
      debugViewTitleItems.add(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
        ...i2,
        when: ContextKeyExpr.and(i2.when, ContextKeyExpr.equals("viewContainer", VIEWLET_ID3), CONTEXT_DEBUG_STATE.notEqualsTo("inactive"), ContextKeyExpr.equals("config.debug.toolBarLocation", "docked"))
      }));
    }
  }
}));

var CONTEXT_TOOLBAR_COMMAND_CENTER = ContextKeyExpr.equals("config.debug.toolBarLocation", "commandCenter");

MenuRegistry.appendMenuItem(MenuId.CommandCenterCenter, {
  submenu: MenuId.DebugToolBar,
  title: "Debug",
  icon: Codicon.debug,
  order: 1,
  when: ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, CONTEXT_TOOLBAR_COMMAND_CENTER)
});

registerDebugToolBarItem(CONTINUE_ID, CONTINUE_LABEL, 10, debugContinue, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(PAUSE_ID, PAUSE_LABEL, 10, debugPause, CONTEXT_DEBUG_STATE.notEqualsTo("stopped"), ContextKeyExpr.and(CONTEXT_DEBUG_STATE.isEqualTo("running"), CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated()));

registerDebugToolBarItem(STOP_ID, STOP_LABEL, 70, debugStop, CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), void 0, { id: DISCONNECT_ID, title: DISCONNECT_LABEL, icon: debugDisconnect, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED) });

registerDebugToolBarItem(DISCONNECT_ID, DISCONNECT_LABEL, 70, debugDisconnect, CONTEXT_FOCUSED_SESSION_IS_ATTACH, void 0, { id: STOP_ID, title: STOP_LABEL, icon: debugStop, precondition: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED) });

registerDebugToolBarItem(STEP_OVER_ID, STEP_OVER_LABEL, 20, debugStepOver, void 0, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(STEP_INTO_ID, STEP_INTO_LABEL, 30, debugStepInto, void 0, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(STEP_OUT_ID, STEP_OUT_LABEL, 40, debugStepOut, void 0, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(RESTART_SESSION_ID, RESTART_LABEL, 60, debugRestart);

registerDebugToolBarItem(STEP_BACK_ID, localize(14588, null), 50, debugStepBack, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(REVERSE_CONTINUE_ID, localize(14587, null), 55, debugReverseContinue, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugToolBarItem(FOCUS_SESSION_ID, FOCUS_SESSION_LABEL, 100, Codicon.listTree, ContextKeyExpr.and(CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_TOOLBAR_COMMAND_CENTER.negate()));

MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
  group: "navigation",
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
  order: 0,
  command: {
    id: DISCONNECT_ID,
    title: DISCONNECT_LABEL,
    icon: debugDisconnect
  }
});

MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
  group: "navigation",
  when: ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
  order: 0,
  command: {
    id: STOP_ID,
    title: STOP_LABEL,
    icon: debugStop
  }
});

MenuRegistry.appendMenuItem(MenuId.DebugToolBarStop, {
  group: "navigation",
  when: ContextKeyExpr.or(
    ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED),
    ContextKeyExpr.and(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED)
  ),
  order: 0,
  command: {
    id: DISCONNECT_AND_SUSPEND_ID,
    title: DISCONNECT_AND_SUSPEND_LABEL,
    icon: debugDisconnect
  }
});
export { createDisconnectMenuItemAction, DEBUG_TOOLBAR_POSITION_KEY, DEBUG_TOOLBAR_Y_KEY, DebugToolBar, debugViewTitleItems, registerDebugToolBarItem, CONTEXT_TOOLBAR_COMMAND_CENTER };
