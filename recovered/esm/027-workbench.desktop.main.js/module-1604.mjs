// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart.ts
import { AbstractPaneCompositePart } from "./module-1602.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_DRAG_AND_DROP_BORDER, PANEL_INACTIVE_TITLE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_BORDER, SIDE_BAR_FOREGROUND, SIDE_BAR_TITLE_BORDER } from "./module-0912.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { ActiveAuxiliaryContext, AuxiliaryBarFocusContext } from "./module-0949.mjs";
import { Extensions17 } from "./module-1526.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { VisibleViewContainersTracker } from "./module-1603.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { localize } from "./module-0001.mjs";
import { ToggleSidebarPositionAction } from "./module-1502.mjs";
import { ToggleAuxiliaryBarAction } from "./module-1498.mjs";
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
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarPart.ts
var AuxiliaryBarPart = class extends AbstractPaneCompositePart {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService, configurationService) {
    super(
      "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */,
      {
        hasTitle: true,
        trailingSeparator: true,
        borderWidth: () => this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder) ? 1 : 0
      },
      AuxiliaryBarPart.activeViewSettingsKey,
      ActiveAuxiliaryContext.bindTo(contextKeyService),
      AuxiliaryBarFocusContext.bindTo(contextKeyService),
      "auxiliarybar",
      "auxiliarybar",
      void 0,
      SIDE_BAR_TITLE_BORDER,
      2 /* AuxiliaryBar */,
      Extensions17.Auxiliary,
      MenuId.AuxiliaryBarTitle,
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
    this.commandService = commandService;
    // Use the side bar dimensions
    this.minimumWidth = 170;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 1 /* Low */;
    this.visibleViewContainersTracker = this._register(instantiationService.createInstance(VisibleViewContainersTracker, 2 /* AuxiliaryBar */));
    this._register(this.visibleViewContainersTracker.onDidChange((e) => this.onDidChangeAutoHideViewContainers(e)));
    this.configuration = this.resolveConfiguration();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */)) {
        this.configuration = this.resolveConfiguration();
        this.onDidChangeActivityBarLocation();
      } else if (e.affectsConfiguration("workbench.secondarySideBar.showLabels")) {
        this.configuration = this.resolveConfiguration();
        this.updateCompositeBar(true);
      } else if (e.affectsConfiguration("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */)) {
        this.onDidChangeActivityBarLocation();
      }
    }));
  }
  static {
    this.activeViewSettingsKey = "workbench.auxiliarybar.activepanelid";
  }
  static {
    this.pinnedViewsKey = "workbench.auxiliarybar.pinnedPanels";
  }
  static {
    this.placeholdeViewContainersKey = "workbench.auxiliarybar.placeholderPanels";
  }
  static {
    this.viewContainersWorkspaceStateKey = "workbench.auxiliarybar.viewContainersWorkspaceState";
  }
  get preferredHeight() {
    return this.layoutService.mainContainerDimension.height * 0.4;
  }
  get preferredWidth() {
    const activeComposite = this.getActivePaneComposite();
    if (!activeComposite) {
      return void 0;
    }
    const width2 = activeComposite.getOptimalWidth();
    if (typeof width2 !== "number") {
      return void 0;
    }
    return Math.max(width2, 300);
  }
  onDidChangeAutoHideViewContainers(e) {
    const autoHide = this.configurationService.getValue("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */);
    if (autoHide && (this.configuration.position === "top" /* TOP */ || this.configuration.position === "bottom" /* BOTTOM */)) {
      const visibleBefore = e.before > 1;
      const visibleAfter = e.after > 1;
      if (visibleBefore !== visibleAfter) {
        this.onDidChangeActivityBarLocation();
      }
    }
  }
  resolveConfiguration() {
    const position2 = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    const canShowLabels = position2 !== "top" /* TOP */ && position2 !== "bottom" /* BOTTOM */;
    const showLabels = canShowLabels && this.configurationService.getValue("workbench.secondarySideBar.showLabels") !== false;
    return { position: position2, canShowLabels, showLabels };
  }
  onDidChangeActivityBarLocation() {
    this.updateCompositeBar();
    const id2 = this.getActiveComposite()?.getId();
    if (id2) {
      this.onTitleAreaUpdate(id2);
    }
  }
  updateStyles() {
    super.updateStyles();
    const container3 = assertReturnsDefined(this.getContainer());
    container3.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || "";
    const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
    const isPositionLeft = this.layoutService.getSideBarPosition() === 1 /* RIGHT */;
    container3.style.color = this.getColor(SIDE_BAR_FOREGROUND) || "";
    container3.style.borderLeftColor = borderColor ?? "";
    container3.style.borderRightColor = borderColor ?? "";
    container3.style.borderLeftStyle = borderColor && !isPositionLeft ? "solid" : "none";
    container3.style.borderRightStyle = borderColor && isPositionLeft ? "solid" : "none";
    container3.style.borderLeftWidth = borderColor && !isPositionLeft ? "1px" : "0px";
    container3.style.borderRightWidth = borderColor && isPositionLeft ? "1px" : "0px";
  }
  getCompositeBarOptions() {
    const $this = this;
    return {
      partContainerClass: "auxiliarybar",
      pinnedViewContainersKey: AuxiliaryBarPart.pinnedViewsKey,
      placeholderViewContainersKey: AuxiliaryBarPart.placeholdeViewContainersKey,
      viewContainersWorkspaceStateKey: AuxiliaryBarPart.viewContainersWorkspaceStateKey,
      icon: !this.configuration.showLabels,
      orientation: 0 /* HORIZONTAL */,
      recomputeSizes: true,
      activityHoverOptions: {
        position: () => this.getCompositeBarPosition() === 2 /* BOTTOM */ ? 3 /* ABOVE */ : 2 /* BELOW */
      },
      fillExtraContextMenuActions: (actions) => this.fillExtraContextMenuActions(actions),
      compositeSize: 0,
      iconSize: 16,
      // Add 10px spacing if the overflow action is visible to no confuse the user with ... between the toolbars
      get overflowActionSize() {
        return $this.getCompositeBarPosition() === 1 /* TITLE */ ? 40 : 30;
      },
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        inactiveBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
        get activeBorderBottomColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_ACTIVE_TITLE_BORDER) : theme.getColor(ACTIVITY_BAR_TOP_ACTIVE_BORDER);
        },
        get activeForegroundColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND) : theme.getColor(ACTIVITY_BAR_TOP_FOREGROUND);
        },
        get inactiveForegroundColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND) : theme.getColor(ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND);
        },
        badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
        get dragAndDropBorder() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_DRAG_AND_DROP_BORDER) : theme.getColor(ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER);
        }
      }),
      compact: true
    };
  }
  fillExtraContextMenuActions(actions) {
    const currentPositionRight = this.layoutService.getSideBarPosition() === 0 /* LEFT */;
    if (this.getCompositeBarPosition() === 1 /* TITLE */) {
      const viewsSubmenuAction = this.getViewsSubmenuAction();
      if (viewsSubmenuAction) {
        actions.push(new Separator());
        actions.push(viewsSubmenuAction);
      }
    }
    const activityBarPositionMenu = this.menuService.getMenuActions(MenuId.ActivityBarPositionMenu, this.contextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
    const positionActions = getContextMenuActions(activityBarPositionMenu).secondary;
    const toggleShowLabelsAction = toAction({
      id: "workbench.action.auxiliarybar.toggleShowLabels",
      label: this.configuration.showLabels ? localize(6249, null) : localize(6250, null),
      enabled: this.configuration.canShowLabels,
      run: () => this.configurationService.updateValue("workbench.secondarySideBar.showLabels", !this.configuration.showLabels)
    });
    actions.push(...[
      new Separator(),
      new SubmenuAction("workbench.action.panel.position", localize(6245, null), positionActions),
      toAction({ id: ToggleSidebarPositionAction.ID, label: currentPositionRight ? localize(6247, null) : localize(6248, null), run: () => this.commandService.executeCommand(ToggleSidebarPositionAction.ID) }),
      toggleShowLabelsAction,
      toAction({ id: ToggleAuxiliaryBarAction.ID, label: localize(6246, null), run: () => this.commandService.executeCommand(ToggleAuxiliaryBarAction.ID) })
    ]);
  }
  shouldShowCompositeBar() {
    if (this.configuration.position === "hidden" /* HIDDEN */) {
      return false;
    }
    if (this.configuration.position === "top" /* TOP */ || this.configuration.position === "bottom" /* BOTTOM */) {
      const autoHide = this.configurationService.getValue("workbench.activityBar.autoHide" /* ACTIVITY_BAR_AUTO_HIDE */);
      if (autoHide) {
        const visibleCount = this.visibleViewContainersTracker.visibleCount;
        if (visibleCount <= 1) {
          return false;
        }
      }
    }
    return true;
  }
  getCompositeBarPosition() {
    switch (this.configuration.position) {
      case "top" /* TOP */:
        return 0 /* TOP */;
      case "bottom" /* BOTTOM */:
        return 2 /* BOTTOM */;
      case "hidden" /* HIDDEN */:
        return 1 /* TITLE */;
      case "default" /* DEFAULT */:
        return 1 /* TITLE */;
      default:
        return 1 /* TITLE */;
    }
  }
  toJSON() {
    return {
      type: "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */
    };
  }
};

AuxiliaryBarPart = __decorateClass([
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
  __decorateParam(11, ICommandService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IConfigurationService)
], AuxiliaryBarPart);
export { AuxiliaryBarPart };
