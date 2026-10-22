// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/sidebar/sidebarPart.ts
import { AbstractPaneCompositePart } from "./module-1602.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_BORDER, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_TITLE_BORDER, SIDE_BAR_TITLE_FOREGROUND } from "./module-0912.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { ActiveViewletContext, SidebarFocusContext } from "./module-0949.mjs";
import { Extensions17 } from "./module-1526.mjs";
import { Action2, IMenuService, MenuId, registerAction2 } from "./module-0092.mjs";
import { ActivityBarCompositeBar, ActivitybarPart } from "./module-1619.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { VisibleViewContainersTracker } from "./module-1603.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Separator } from "./module-0082.mjs";
import { ToggleActivityBarVisibilityActionId } from "./module-1502.mjs";
import { localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/sidebar/sidebarPart.ts
var PRIMARY_SIDE_BAR_SASH_CLASS = "primary-sidebar-sash";

var SidebarPart = class extends AbstractPaneCompositePart {
  //#endregion
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, configurationService, menuService) {
    super(
      "workbench.parts.sidebar" /* SIDEBAR_PART */,
      { hasTitle: true, trailingSeparator: false, borderWidth: () => this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder) ? 1 : 0 },
      SidebarPart.activeViewletSettingsKey,
      ActiveViewletContext.bindTo(contextKeyService),
      SidebarFocusContext.bindTo(contextKeyService),
      "sideBar",
      "viewlet",
      SIDE_BAR_TITLE_FOREGROUND,
      SIDE_BAR_TITLE_BORDER,
      0 /* Sidebar */,
      Extensions17.Viewlets,
      MenuId.SidebarTitle,
      notificationService,
      storageService,
      contextMenuService,
      layoutService,
      keybindingService,
      hoverService,
      instantiationService,
      themeService,
      viewDescriptorService,
      contextKeyService,
      extensionService,
      menuService,
      configurationService
    );
    //#region IView
    this.minimumWidth = 170;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 1 /* Low */;
    this.activityBarPart = this._register(this.instantiationService.createInstance(ActivitybarPart, this.location, this));
    this.primarySideBarSashClassDisposable = this._register(new MutableDisposable());
    this.visibleViewContainersTracker = this._register(instantiationService.createInstance(VisibleViewContainersTracker, 0 /* Sidebar */));
    this._register(this.visibleViewContainersTracker.onDidChange((e) => this.onDidChangeAutoHideViewContainers(e)));
    this.rememberActivityBarVisiblePosition();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */)) {
        this.onDidChangeActivityBarLocation();
      }
      if (e.affectsConfiguration("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */)) {
        this.onDidChangeActivityBarLocation();
      }
    }));
    this.registerActions();
  }
  static {
    this.activeViewletSettingsKey = "workbench.sidebar.activeviewletid";
  }
  get snap() {
    return true;
  }
  get preferredWidth() {
    const viewlet = this.getActivePaneComposite();
    if (!viewlet) {
      return void 0;
    }
    const width2 = viewlet.getOptimalWidth();
    if (typeof width2 !== "number") {
      return void 0;
    }
    return Math.max(width2, 300);
  }
  onDidChangeAutoHideViewContainers(e) {
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    const autoHide = this.configurationService.getValue("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */);
    if (autoHide && (activityBarPosition === "top" /* TOP */ || activityBarPosition === "bottom" /* BOTTOM */)) {
      const visibleBefore = e.before > 1;
      const visibleAfter = e.after > 1;
      if (visibleBefore !== visibleAfter) {
        this.onDidChangeActivityBarLocation();
      }
    }
  }
  onDidChangeActivityBarLocation() {
    this.activityBarPart.hide();
    this.updateCompositeBar();
    const id2 = this.getActiveComposite()?.getId();
    if (id2) {
      this.onTitleAreaUpdate(id2);
    }
    if (this.shouldShowActivityBar()) {
      this.activityBarPart.show();
    }
    this.rememberActivityBarVisiblePosition();
  }
  updateStyles() {
    super.updateStyles();
    const container3 = assertReturnsDefined(this.getContainer());
    container3.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || "";
    container3.style.color = this.getColor(SIDE_BAR_FOREGROUND) || "";
    const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
    const isPositionLeft = this.layoutService.getSideBarPosition() === 0 /* LEFT */;
    container3.style.borderRightWidth = borderColor && isPositionLeft ? "1px" : "";
    container3.style.borderRightStyle = borderColor && isPositionLeft ? "solid" : "";
    container3.style.borderRightColor = isPositionLeft ? borderColor || "" : "";
    container3.style.borderLeftWidth = borderColor && !isPositionLeft ? "1px" : "";
    container3.style.borderLeftStyle = borderColor && !isPositionLeft ? "solid" : "";
    container3.style.borderLeftColor = !isPositionLeft ? borderColor || "" : "";
    container3.style.outlineColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? "";
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      return;
    }
    super.layout(width2, height, top2, left);
  }
  setBoundarySashes(sashes) {
    super.setBoundarySashes?.(sashes);
    this.primarySideBarSashClassDisposable.clear();
    const primarySideBarSash = this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? sashes.right : sashes.left;
    this.primarySideBarSashClassDisposable.value = primarySideBarSash?.addClass(PRIMARY_SIDE_BAR_SASH_CLASS);
  }
  getTitleAreaDropDownAnchorAlignment() {
    return this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
  }
  createCompositeBar() {
    return this.instantiationService.createInstance(ActivityBarCompositeBar, 0 /* Sidebar */, this.getCompositeBarOptions(), this.partId, this, false);
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "sidebar",
      pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
      placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
      icon: true,
      orientation: 0 /* HORIZONTAL */,
      recomputeSizes: true,
      activityHoverOptions: {
        position: () => this.getCompositeBarPosition() === 2 /* BOTTOM */ ? 3 /* ABOVE */ : 2 /* BELOW */
      },
      fillExtraContextMenuActions: (actions) => {
        if (this.getCompositeBarPosition() === 1 /* TITLE */) {
          const viewsSubmenuAction = this.getViewsSubmenuAction();
          if (viewsSubmenuAction) {
            actions.push(new Separator());
            actions.push(viewsSubmenuAction);
          }
        }
      },
      compositeSize: 0,
      iconSize: 16,
      overflowActionSize: 30,
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        inactiveBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        activeBorderBottomColor: theme.getColor(ACTIVITY_BAR_TOP_ACTIVE_BORDER),
        activeForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_FOREGROUND),
        inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND),
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER)
      }),
      compact: true
    };
  }
  shouldShowCompositeBar() {
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    if (activityBarPosition !== "top" /* TOP */ && activityBarPosition !== "bottom" /* BOTTOM */) {
      return false;
    }
    const autoHide = this.configurationService.getValue("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */);
    if (autoHide) {
      const visibleCount = this.visibleViewContainersTracker.visibleCount;
      if (visibleCount <= 1) {
        return false;
      }
    }
    return true;
  }
  shouldShowActivityBar() {
    if (this.shouldShowCompositeBar()) {
      return false;
    }
    return this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) !== "hidden" /* HIDDEN */;
  }
  getCompositeBarPosition() {
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    switch (activityBarPosition) {
      case "top" /* TOP */:
        return 0 /* TOP */;
      case "bottom" /* BOTTOM */:
        return 2 /* BOTTOM */;
      case "hidden" /* HIDDEN */:
      case "default" /* DEFAULT */:
      // noop
      default:
        return 1 /* TITLE */;
    }
  }
  rememberActivityBarVisiblePosition() {
    const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    if (activityBarPosition !== "hidden" /* HIDDEN */) {
      this.storageService.store("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, activityBarPosition, 0 /* PROFILE */, 0 /* USER */);
    }
  }
  getRememberedActivityBarVisiblePosition() {
    const activityBarPosition = this.storageService.get("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, 0 /* PROFILE */);
    switch (activityBarPosition) {
      case "top" /* TOP */:
        return "top" /* TOP */;
      case "bottom" /* BOTTOM */:
        return "bottom" /* BOTTOM */;
      default:
        return "default" /* DEFAULT */;
    }
  }
  getPinnedPaneCompositeIds() {
    return this.shouldShowCompositeBar() ? super.getPinnedPaneCompositeIds() : this.activityBarPart.getPinnedPaneCompositeIds();
  }
  getVisiblePaneCompositeIds() {
    return this.shouldShowCompositeBar() ? super.getVisiblePaneCompositeIds() : this.activityBarPart.getVisiblePaneCompositeIds();
  }
  getPaneCompositeIds() {
    return this.shouldShowCompositeBar() ? super.getPaneCompositeIds() : this.activityBarPart.getPaneCompositeIds();
  }
  async focusActivityBar() {
    if (this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) === "hidden" /* HIDDEN */) {
      await this.configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, this.getRememberedActivityBarVisiblePosition());
      this.onDidChangeActivityBarLocation();
    }
    if (this.shouldShowCompositeBar()) {
      this.focusCompositeBar();
    } else {
      if (!this.layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */)) {
        this.layoutService.setPartHidden(false, "workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
      }
      this.activityBarPart.show(true);
    }
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ToggleActivityBarVisibilityActionId,
          title: localize2(6911, "Toggle Activity Bar Visibility")
        });
      }
      run() {
        const value2 = that.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) === "hidden" /* HIDDEN */ ? that.getRememberedActivityBarVisiblePosition() : "hidden" /* HIDDEN */;
        return that.configurationService.updateValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */, value2);
      }
    }));
  }
  toJSON() {
    return {
      type: "workbench.parts.sidebar" /* SIDEBAR_PART */
    };
  }
};

SidebarPart = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IViewDescriptorService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IConfigurationService),
  __decorateParam(12, IMenuService)
], SidebarPart);
export { PRIMARY_SIDE_BAR_SASH_CLASS, SidebarPart };
