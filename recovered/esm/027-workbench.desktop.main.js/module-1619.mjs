// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/activitybar/activitybarPart.ts
import { Part } from "./module-1566.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { FLOATING_PANEL_INNER_MARGIN, FLOATING_PANEL_MARGIN, IWorkbenchLayoutService, getFloatingPanelMargin, getFloatingPanelOuterMargin, isFloatingTopEdgeExposed } from "./module-1118.mjs";
import { $, EventType, addDisposableListener, append, clearNode, isAncestor } from "./module-0075.mjs";
import { ACTIVITY_BAR_ACTIVE_BACKGROUND, ACTIVITY_BAR_ACTIVE_BORDER, ACTIVITY_BAR_ACTIVE_FOCUS_BORDER, ACTIVITY_BAR_BACKGROUND, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_BORDER, ACTIVITY_BAR_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_INACTIVE_FOREGROUND, MODERN_ACTIVITY_BAR_BACKGROUND, MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND } from "./module-0912.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { activeContrastBorder, contrastBorder, focusBorder } from "./module-0227.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1117.mjs";
import { PaneCompositeBar } from "./module-1601.mjs";
import { GlobalCompositeBar } from "./module-1618.mjs";
import { getMenuBarVisibility } from "./module-0515.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CustomMenubarControl } from "./module-1609.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { ToggleSidebarPositionAction, ToggleSidebarVisibilityAction } from "./module-1502.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IViewDescriptorService, ViewContainerLocationToString } from "./module-1093.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Categories } from "./module-0847.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { SwitchCompositeViewAction } from "./module-1497.mjs";


// src/vs/workbench/browser/parts/activitybar/activitybarPart.ts
var ActivitybarPart = class extends Part {
  constructor(location2, paneCompositePart, instantiationService, layoutService, themeService, storageService, configurationService, hostService) {
    super("workbench.parts.activitybar" /* ACTIVITYBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
    this.location = location2;
    this.paneCompositePart = paneCompositePart;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.hostService = hostService;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.compositeBar = this._register(new MutableDisposable());
    this._isCompact = this.configurationService.getValue("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */) ?? false;
    this.isInactive = !this.hostService.hasFocus;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */)) {
        this._isCompact = this.configurationService.getValue("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */) ?? false;
        this.updateCompactStyle();
        this.recreateCompositeBar();
        this._onDidChange.fire(void 0);
      }
      if (e.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */) || e.affectsConfiguration("window.density.layout" /* MODERN_UI_DENSITY */)) {
        this.updateCompactStyle();
        this.recreateCompositeBar();
        this._onDidChange.fire(void 0);
        if (this.element) {
          this.updateStyles();
        }
      }
    }));
    this._register(this.hostService.onDidChangeFocus((focused) => this.setInactive(!focused)));
    this._register(this.hostService.onDidChangeActiveWindow((windowId) => this.setInactive(windowId !== mainWindow.vscodeWindowId)));
    this._register(this.layoutService.onDidChangePartVisibility((e) => {
      if (e.partId === "workbench.parts.sidebar" /* SIDEBAR_PART */ && this.layoutService.isFloatingPanelsEnabled()) {
        this._onDidChange.fire(void 0);
      }
    }));
  }
  static {
    this.ACTION_HEIGHT = 48;
  }
  static {
    this.COMPACT_ACTION_HEIGHT = 28;
  }
  static {
    this.ACTIVITYBAR_WIDTH = 48;
  }
  static {
    this.COMPACT_ACTIVITYBAR_WIDTH = 36;
  }
  static {
    /** Narrower dimensions used when the floating panels (Modern UI) experiment is enabled. */
    this.FLOATING_ACTION_HEIGHT = 36;
  }
  static {
    this.FLOATING_ACTIVITYBAR_WIDTH = 36;
  }
  static {
    this.FLOATING_COMPACT_ACTIVITYBAR_WIDTH = 28;
  }
  static {
    /**
     * Vertical gap between activity bar items at the default size under the floating
     * panels experiment. Published to CSS as `--activity-bar-action-gap` so that the
     * stylesheet and the overflow computation cannot drift apart.
     */
    this.FLOATING_ACTION_GAP = 8;
  }
  static {
    /**
     * The compact Modern UI density tightens that gap to match its denser rhythm.
     */
    this.FLOATING_COMPACT_ACTION_GAP = 4;
  }
  static {
    this.ICON_SIZE = 24;
  }
  static {
    this.COMPACT_ICON_SIZE = 16;
  }
  static {
    /**
     * Base gutter reserved around the activity bar under the floating panels
     * experiment. Must match the margins applied in `floatingPanels.css`.
     */
    this.FLOATING_MARGIN = FLOATING_PANEL_MARGIN;
  }
  static {
    /**
     * The rail's own horizontal padding, doubled: the space inside the card beside the icon
     * column. Independent of the cluster perimeter so the icons keep their inset whatever the
     * gutter is. Must match `--modern-ui-activitybar-lane` in `floatingPanels.css`.
     */
    this.FLOATING_LANE = 8;
  }
  static {
    this.FLOATING_COMPACT_LANE = 4;
  }
  static {
    /**
     * The card border the activity bar draws on each edge under the floating panels
     * experiment. Must match the border width applied in `floatingPanels.css`.
     */
    this.FLOATING_BORDER = 1;
  }
  static {
    this.pinnedViewContainersKey = "workbench.activity.pinnedViewlets2";
  }
  static {
    this.placeholderViewContainersKey = "workbench.activity.placeholderViewlets";
  }
  static {
    this.viewContainersWorkspaceStateKey = "workbench.activity.viewletsWorkspaceState";
  }
  //#region IView
  get minimumWidth() {
    return this.baseWidth + this.floatingHorizontalGutter;
  }
  get maximumWidth() {
    return this.baseWidth + this.floatingHorizontalGutter;
  }
  //#endregion
  /** The intrinsic activity bar width (excludes any floating gutter). */
  get baseWidth() {
    if (this.layoutService.isFloatingPanelsEnabled()) {
      if (this._isCompact) {
        return ActivitybarPart.FLOATING_COMPACT_ACTIVITYBAR_WIDTH;
      }
      return ActivitybarPart.FLOATING_ACTIVITYBAR_WIDTH;
    }
    return this._isCompact ? ActivitybarPart.COMPACT_ACTIVITYBAR_WIDTH : ActivitybarPart.ACTIVITYBAR_WIDTH;
  }
  /** The action (item) height that drives visible item sizing. */
  get actionHeight() {
    if (this._isCompact) {
      return ActivitybarPart.COMPACT_ACTION_HEIGHT;
    }
    if (this.layoutService.isFloatingPanelsEnabled()) {
      return ActivitybarPart.FLOATING_ACTION_HEIGHT;
    }
    return ActivitybarPart.ACTION_HEIGHT;
  }
  /**
   * Vertical gap rendered between two adjacent items. Only the floating panels
   * experiment separates items, and only at the default activity bar size; the compact
   * Modern UI density tightens it to match its denser rhythm.
   */
  get actionGap() {
    if (!this.layoutService.isFloatingPanelsEnabled() || this._isCompact) {
      return 0;
    }
    return this.layoutService.isModernUICompact() ? ActivitybarPart.FLOATING_COMPACT_ACTION_GAP : ActivitybarPart.FLOATING_ACTION_GAP;
  }
  /**
   * The vertical space a single item occupies in the bar (its height plus the gap that
   * separates it from the next one). This drives the overflow computation, so it has to
   * track the current activity bar size, otherwise items collapse into the overflow menu
   * prematurely.
   */
  get compositeSize() {
    return this.actionHeight + this.actionGap;
  }
  get floatingHorizontalGutter() {
    if (!this.layoutService.isFloatingPanelsEnabled()) {
      return 0;
    }
    const lane = this.layoutService.isModernUICompact() ? ActivitybarPart.FLOATING_COMPACT_LANE : ActivitybarPart.FLOATING_LANE;
    return getFloatingPanelOuterMargin(this.layoutService) + lane + (this.needsFloatingLeadingGap ? getFloatingPanelMargin(this.layoutService) : 0);
  }
  /**
   * Whether the rail has to supply the gap to the card before it. Under this system's
   * leading-margin convention each card owns the gap on its leading edge, so a rail that
   * follows the editor — on the right, with no side bar to connect to — reserves one more
   * margin than it does when it leads. Compact density keeps its cards joined, so it never
   * needs the gap. Mirrors `.nosidebar .part.activitybar.right` in `floatingPanels.css`.
   */
  get needsFloatingLeadingGap() {
    return !this.layoutService.isModernUICompact() && this.layoutService.getSideBarPosition() === 1 /* RIGHT */ && !this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
  }
  setInactive(inactive) {
    if (this.isInactive === inactive) {
      return;
    }
    this.isInactive = inactive;
    if (this.element) {
      this.updateStyles();
    }
  }
  updateCompactStyle() {
    if (this.element) {
      this.element.classList.toggle("compact", this._isCompact);
      this.layoutService.mainContainer.classList.toggle("activitybar-compact", this._isCompact);
      this.element.style.setProperty("--activity-bar-width", `${this.baseWidth}px`);
      this.element.style.setProperty("--activity-bar-action-height", `${this.actionHeight}px`);
      this.element.style.setProperty("--activity-bar-action-gap", `${this.actionGap}px`);
      this.element.style.setProperty("--activity-bar-icon-size", `${this._isCompact ? ActivitybarPart.COMPACT_ICON_SIZE : ActivitybarPart.ICON_SIZE}px`);
    }
  }
  recreateCompositeBar() {
    if (!this.content || !this.compositeBar.value) {
      return;
    }
    this.compositeBar.clear();
    clearNode(this.content);
    this.compositeBar.value = this.createCompositeBar();
    this.compositeBar.value.create(this.content);
    if (this.dimension) {
      this.layout(this.dimension.width, this.dimension.height);
    }
  }
  createCompositeBar() {
    const compositeSize = this.compositeSize;
    const iconSize = this._isCompact ? ActivitybarPart.COMPACT_ICON_SIZE : ActivitybarPart.ICON_SIZE;
    return this.instantiationService.createInstance(ActivityBarCompositeBar, this.location, {
      partContainerClass: "activitybar",
      pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
      placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
      orientation: 1 /* VERTICAL */,
      icon: true,
      iconSize,
      activityHoverOptions: {
        position: () => this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */
      },
      preventLoopNavigation: true,
      recomputeSizes: false,
      fillExtraContextMenuActions: (actions, e) => {
      },
      compositeSize,
      colors: (theme) => ({
        activeForegroundColor: theme.getColor(ACTIVITY_BAR_FOREGROUND),
        inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_INACTIVE_FOREGROUND),
        activeBorderColor: theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER),
        activeBackground: theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND),
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(ACTIVITY_BAR_DRAG_AND_DROP_BORDER),
        activeBackgroundColor: void 0,
        inactiveBackgroundColor: void 0,
        activeBorderBottomColor: void 0
      }),
      overflowActionSize: compositeSize
    }, "workbench.parts.activitybar" /* ACTIVITYBAR_PART */, this.paneCompositePart, true);
  }
  createContentArea(parent) {
    this.element = parent;
    this.content = append(this.element, $(".content"));
    this.updateCompactStyle();
    if (this.layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */)) {
      this.show();
    }
    return this.content;
  }
  getPinnedPaneCompositeIds() {
    return this.compositeBar.value?.getPinnedPaneCompositeIds() ?? [];
  }
  getVisiblePaneCompositeIds() {
    return this.compositeBar.value?.getVisiblePaneCompositeIds() ?? [];
  }
  getPaneCompositeIds() {
    return this.compositeBar.value?.getPaneCompositeIds() ?? [];
  }
  focus() {
    this.compositeBar.value?.focus();
  }
  updateStyles() {
    super.updateStyles();
    const container3 = assertReturnsDefined(this.getContainer());
    let backgroundColor = ACTIVITY_BAR_BACKGROUND;
    if (this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true) {
      backgroundColor = this.isInactive ? MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND : MODERN_ACTIVITY_BAR_BACKGROUND;
    }
    const background = this.getColor(backgroundColor) || "";
    container3.style.backgroundColor = background;
    const borderColor = this.layoutService.isFloatingPanelsEnabled() ? "" : this.getColor(ACTIVITY_BAR_BORDER) || this.getColor(contrastBorder) || "";
    container3.classList.toggle("bordered", !!borderColor);
    container3.style.borderColor = borderColor;
  }
  show(focus) {
    if (!this.content) {
      return;
    }
    if (!this.compositeBar.value) {
      this.compositeBar.value = this.createCompositeBar();
      this.compositeBar.value.create(this.content);
      if (this.dimension) {
        this.layout(this.dimension.width, this.dimension.height);
      }
    }
    if (focus) {
      this.focus();
    }
  }
  hide() {
    if (!this.compositeBar.value) {
      return;
    }
    this.compositeBar.clear();
    if (this.content) {
      clearNode(this.content);
    }
  }
  layout(width2, height) {
    super.layout(width2, height, 0, 0);
    if (!this.content) {
      return;
    }
    const { top: top2, bottom } = this.getFloatingGutters();
    const contentWidth = Math.max(0, width2 - this.floatingHorizontalGutter);
    const contentHeight = Math.max(0, height - top2 - bottom);
    const contentAreaSize = super.layoutContents(contentWidth, contentHeight).contentSize;
    this.compositeBar.value?.layout(contentWidth, contentAreaSize.height + this.actionGap);
  }
  /**
   * Vertical gutters (in pixels) mirroring the margins in `floatingPanels.css`, plus the
   * card's 1px border on each edge (drawn inside the box, as `.monaco-workbench .part` is
   * `box-sizing: border-box`). The top is flush with title/banner chrome and doubles only at
   * an exposed window edge.
   */
  getFloatingGutters() {
    if (!this.layoutService.isFloatingPanelsEnabled()) {
      return { top: 0, bottom: 0 };
    }
    const margin = getFloatingPanelMargin(this.layoutService);
    const outerMargin = getFloatingPanelOuterMargin(this.layoutService);
    const border = ActivitybarPart.FLOATING_BORDER;
    return {
      top: border + (isFloatingTopEdgeExposed(this.layoutService, mainWindow) ? outerMargin : FLOATING_PANEL_INNER_MARGIN),
      bottom: border + (this.layoutService.isModernUICompact() ? outerMargin : this.layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, mainWindow) ? margin : outerMargin)
    };
  }
  toJSON() {
    return {
      type: "workbench.parts.activitybar" /* ACTIVITYBAR_PART */
    };
  }
};

ActivitybarPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IHostService)
], ActivitybarPart);

var ActivityBarCompositeBar = class extends PaneCompositeBar {
  constructor(location2, options3, part, paneCompositePart, showGlobalActivities, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, configurationService, menuService, layoutService) {
    super(
      location2,
      {
        ...options3,
        fillExtraContextMenuActions: (actions, e) => {
          options3.fillExtraContextMenuActions(actions, e);
          this.fillContextMenuActions(actions, e);
        }
      },
      part,
      paneCompositePart,
      instantiationService,
      storageService,
      extensionService,
      viewDescriptorService,
      viewService,
      contextKeyService,
      environmentService,
      layoutService
    );
    this.configurationService = configurationService;
    this.menuService = menuService;
    this.menuBar = this._register(new MutableDisposable());
    this.keyboardNavigationDisposables = this._register(new DisposableStore());
    if (showGlobalActivities) {
      this.globalCompositeBar = this._register(instantiationService.createInstance(GlobalCompositeBar, () => this.getContextMenuActions(), (theme) => this.options.colors(theme), this.options.activityHoverOptions));
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("window.menuBarVisibility" /* MenuBarVisibility */)) {
        if (getMenuBarVisibility(this.configurationService) === "compact") {
          this.installMenubar();
        } else {
          this.uninstallMenubar();
        }
      }
    }));
  }
  fillContextMenuActions(actions, e) {
    const menuBarVisibility = getMenuBarVisibility(this.configurationService);
    if (menuBarVisibility === "compact" || menuBarVisibility === "hidden" || menuBarVisibility === "toggle") {
      actions.unshift(...[toAction({ id: "toggleMenuVisibility", label: localize(6211, null), checked: menuBarVisibility === "compact", run: () => this.configurationService.updateValue("window.menuBarVisibility" /* MenuBarVisibility */, menuBarVisibility === "compact" ? "toggle" : "compact") }), new Separator()]);
    }
    if (menuBarVisibility === "compact" && this.menuBarContainer && e?.target) {
      if (isAncestor(e.target, this.menuBarContainer)) {
        actions.unshift(...[toAction({ id: "hideCompactMenu", label: localize(6210, null), run: () => this.configurationService.updateValue("window.menuBarVisibility" /* MenuBarVisibility */, "toggle") }), new Separator()]);
      }
    }
    if (this.globalCompositeBar) {
      actions.push(new Separator());
      actions.push(...this.globalCompositeBar.getContextMenuActions());
    }
    actions.push(new Separator());
    actions.push(...this.getActivityBarContextMenuActions());
  }
  uninstallMenubar() {
    if (this.menuBar.value) {
      this.menuBar.value = void 0;
    }
    if (this.menuBarContainer) {
      this.menuBarContainer.remove();
      this.menuBarContainer = void 0;
    }
  }
  installMenubar() {
    if (this.menuBar.value) {
      return;
    }
    this.menuBarContainer = $(".menubar");
    const content2 = assertReturnsDefined(this.element);
    content2.prepend(this.menuBarContainer);
    this.menuBar.value = this.instantiationService.createInstance(CustomMenubarControl);
    this.menuBar.value.create(this.menuBarContainer);
  }
  registerKeyboardNavigationListeners() {
    this.keyboardNavigationDisposables.clear();
    if (this.menuBarContainer) {
      this.keyboardNavigationDisposables.add(addDisposableListener(this.menuBarContainer, EventType.KEY_DOWN, (e) => {
        const kbEvent = new StandardKeyboardEvent(e);
        if (kbEvent.equals(18 /* DownArrow */) || kbEvent.equals(17 /* RightArrow */)) {
          this.focus();
        }
      }));
    }
    if (this.compositeBarContainer) {
      this.keyboardNavigationDisposables.add(addDisposableListener(this.compositeBarContainer, EventType.KEY_DOWN, (e) => {
        const kbEvent = new StandardKeyboardEvent(e);
        if (kbEvent.equals(18 /* DownArrow */) || kbEvent.equals(17 /* RightArrow */)) {
          this.globalCompositeBar?.focus();
        } else if (kbEvent.equals(16 /* UpArrow */) || kbEvent.equals(15 /* LeftArrow */)) {
          this.menuBar.value?.toggleFocus();
        }
      }));
    }
    if (this.globalCompositeBar) {
      this.keyboardNavigationDisposables.add(addDisposableListener(this.globalCompositeBar.element, EventType.KEY_DOWN, (e) => {
        const kbEvent = new StandardKeyboardEvent(e);
        if (kbEvent.equals(16 /* UpArrow */) || kbEvent.equals(15 /* LeftArrow */)) {
          this.focus(this.getVisiblePaneCompositeIds().length - 1);
        }
      }));
    }
  }
  create(parent) {
    this.element = parent;
    if (getMenuBarVisibility(this.configurationService) === "compact") {
      this.installMenubar();
    }
    this.compositeBarContainer = super.create(this.element);
    if (this.globalCompositeBar) {
      this.globalCompositeBar.create(this.element);
    }
    this.registerKeyboardNavigationListeners();
    return this.compositeBarContainer;
  }
  layout(width2, height) {
    if (this.menuBarContainer) {
      if (this.options.orientation === 1 /* VERTICAL */) {
        height -= this.menuBarContainer.clientHeight;
      } else {
        width2 -= this.menuBarContainer.clientWidth;
      }
    }
    if (this.globalCompositeBar) {
      if (this.options.orientation === 1 /* VERTICAL */) {
        height -= this.globalCompositeBar.element.clientHeight;
      } else {
        width2 -= this.globalCompositeBar.element.clientWidth;
      }
    }
    super.layout(width2, height);
  }
  getActivityBarContextMenuActions() {
    const activityBarPositionMenu = this.menuService.getMenuActions(MenuId.ActivityBarPositionMenu, this.contextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
    const positionActions = getContextMenuActions(activityBarPositionMenu).secondary;
    const actions = [
      new SubmenuAction("workbench.action.activityBar.position", localize(6201, null), positionActions)
    ];
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    if (activityBarPosition === "default" /* DEFAULT */) {
      const isCompact = this.configurationService.getValue("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */) ?? false;
      const sizeActions = [
        toAction({ id: "workbench.action.activityBar.size.default", label: localize(6204, null), checked: !isCompact, run: () => this.configurationService.updateValue("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */, false) }),
        toAction({ id: "workbench.action.activityBar.size.compact", label: localize(6203, null), checked: isCompact, run: () => this.configurationService.updateValue("workbench.activityBar.compact" /* ACTIVITY_BAR_COMPACT */, true) })
      ];
      actions.push(new SubmenuAction("workbench.action.activityBar.size", localize(6202, null), sizeActions));
    }
    actions.push(toAction({ id: ToggleSidebarPositionAction.ID, label: ToggleSidebarPositionAction.getLabel(this.layoutService), run: () => this.instantiationService.invokeFunction((accessor) => new ToggleSidebarPositionAction().run(accessor)) }));
    if (this.part === "workbench.parts.sidebar" /* SIDEBAR_PART */) {
      actions.push(toAction({ id: ToggleSidebarVisibilityAction.ID, label: ToggleSidebarVisibilityAction.LABEL, run: () => this.instantiationService.invokeFunction((accessor) => new ToggleSidebarVisibilityAction().run(accessor)) }));
    }
    return actions;
  }
};

ActivityBarCompositeBar = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IViewsService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IMenuService),
  __decorateParam(14, IWorkbenchLayoutService)
], ActivityBarCompositeBar);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.activityBarLocation.default",
      title: {
        ...localize2(6219, "Move Activity Bar to Side"),
        mnemonicTitle: localize(6213, null)
      },
      shortTitle: localize(6206, null),
      category: Categories.View,
      toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "default" /* DEFAULT */),
      menu: [{
        id: MenuId.ActivityBarPositionMenu,
        order: 1
      }, {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "default" /* DEFAULT */), IsSessionsWindowContext.negate())
      }]
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, "default" /* DEFAULT */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.activityBarLocation.top",
      title: {
        ...localize2(6220, "Move Activity Bar to Top"),
        mnemonicTitle: localize(6215, null)
      },
      shortTitle: localize(6222, null),
      category: Categories.View,
      toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "top" /* TOP */),
      menu: [{
        id: MenuId.ActivityBarPositionMenu,
        order: 2
      }, {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "top" /* TOP */), IsSessionsWindowContext.negate())
      }]
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, "top" /* TOP */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.activityBarLocation.bottom",
      title: {
        ...localize2(6218, "Move Activity Bar to Bottom"),
        mnemonicTitle: localize(6212, null)
      },
      shortTitle: localize(6205, null),
      category: Categories.View,
      toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "bottom" /* BOTTOM */),
      menu: [{
        id: MenuId.ActivityBarPositionMenu,
        order: 3
      }, {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "bottom" /* BOTTOM */), IsSessionsWindowContext.negate())
      }]
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, "bottom" /* BOTTOM */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.activityBarLocation.hide",
      title: {
        ...localize2(6209, "Hide Activity Bar"),
        mnemonicTitle: localize(6214, null)
      },
      shortTitle: localize(6208, null),
      category: Categories.View,
      toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "hidden" /* HIDDEN */),
      menu: [{
        id: MenuId.ActivityBarPositionMenu,
        order: 4
      }, {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "hidden" /* HIDDEN */), IsSessionsWindowContext.negate())
      }]
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, "hidden" /* HIDDEN */);
  }
});

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.ActivityBarPositionMenu,
  title: localize(6217, null),
  group: "3_workbench_layout_move",
  order: 2,
  when: IsSessionsWindowContext.negate()
});

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitleContext, {
  submenu: MenuId.ActivityBarPositionMenu,
  title: localize(6217, null),
  when: ContextKeyExpr.or(
    ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(0 /* Sidebar */)),
    ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(2 /* AuxiliaryBar */))
  ),
  group: "3_workbench_layout_move",
  order: 1
});

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.previousSideBarView",
      title: localize2(6221, "Previous Primary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 0 /* Sidebar */, -1);
  }
});

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.nextSideBarView",
      title: localize2(6216, "Next Primary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 0 /* Sidebar */, 1);
  }
});

registerAction2(
  class FocusActivityBarAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.focusActivityBar",
        title: localize2(6207, "Focus Activity Bar"),
        category: Categories.View,
        f1: true
      });
    }
    async run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      layoutService.focusPart("workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
    }
  }
);

registerThemingParticipant((theme, collector) => {
  const activityBarActiveBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER);
  if (activityBarActiveBorderColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
  }
  const activityBarActiveFocusBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_FOCUS_BORDER);
  if (activityBarActiveFocusBorderColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
  }
  const activityBarActiveBackgroundColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND);
  if (activityBarActiveBackgroundColor) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
  }
  const outline = theme.getColor(activeContrastBorder);
  if (outline) {
    collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label::before{
				padding: 6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover .action-label::before {
				outline: 1px solid ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label::before {
				outline: 1px dashed ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}
		`);
  } else {
    const focusBorderColor = theme.getColor(focusBorder);
    if (focusBorderColor) {
      collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator::before {
						border-left-color: ${focusBorderColor};
					}
				`);
    }
  }
});
export { ActivitybarPart, ActivityBarCompositeBar };
