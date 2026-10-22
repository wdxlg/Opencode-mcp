// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/panel/panelPart.ts
import { AbstractPaneCompositePart } from "./module-1602.mjs";
import { ActivePanelContext, PanelFocusContext } from "./module-0949.mjs";
import { PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_BACKGROUND, PANEL_BORDER, PANEL_DRAG_AND_DROP_BORDER, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_TITLE_BADGE_BACKGROUND, PANEL_TITLE_BADGE_FOREGROUND, PANEL_TITLE_BORDER } from "./module-0912.mjs";
import { Extensions17 } from "./module-1526.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { getContextMenuActions } from "./module-0516.mjs";
import { localize } from "./module-0001.mjs";
import { TogglePanelAction } from "./module-1499.mjs";
import { Dimension } from "./module-0075.mjs";
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


// src/vs/workbench/browser/parts/panel/panelPart.ts
var PanelPart = class extends AbstractPaneCompositePart {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService, configurationService) {
    super(
      "workbench.parts.panel" /* PANEL_PART */,
      { hasTitle: true, trailingSeparator: true },
      PanelPart.activePanelSettingsKey,
      ActivePanelContext.bindTo(contextKeyService),
      PanelFocusContext.bindTo(contextKeyService),
      "panel",
      "panel",
      void 0,
      PANEL_TITLE_BORDER,
      1 /* Panel */,
      Extensions17.Panels,
      MenuId.PanelTitle,
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
    //#region IView
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 77;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.panel.showLabels")) {
        this.updateCompositeBar(true);
      }
    }));
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
  static {
    //#endregion
    this.activePanelSettingsKey = "workbench.panelpart.activepanelid";
  }
  updateStyles() {
    super.updateStyles();
    const container3 = assertReturnsDefined(this.getContainer());
    container3.style.backgroundColor = this.getColor(PANEL_BACKGROUND) || "";
    const borderColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    container3.style.borderLeftColor = borderColor;
    container3.style.borderRightColor = borderColor;
    container3.style.borderBottomColor = borderColor;
    if (this.titleArea) {
      this.titleArea.style.borderTopColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || "";
    }
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "panel",
      pinnedViewContainersKey: "workbench.panel.pinnedPanels",
      placeholderViewContainersKey: "workbench.panel.placeholderPanels",
      viewContainersWorkspaceStateKey: "workbench.panel.viewContainersWorkspaceState",
      icon: this.configurationService.getValue("workbench.panel.showLabels") === false,
      orientation: 0 /* HORIZONTAL */,
      recomputeSizes: true,
      activityHoverOptions: {
        position: () => this.layoutService.getPanelPosition() === 2 /* BOTTOM */ && !this.layoutService.isPanelMaximized() ? 3 /* ABOVE */ : 2 /* BELOW */
      },
      fillExtraContextMenuActions: (actions) => this.fillExtraContextMenuActions(actions),
      compositeSize: 0,
      iconSize: 16,
      compact: true,
      // Only applies to icons, not labels
      overflowActionSize: 44,
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        inactiveBackgroundColor: theme.getColor(PANEL_BACKGROUND),
        // Background color for overflow action
        activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
        activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
        inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
        badgeBackground: theme.getColor(PANEL_TITLE_BADGE_BACKGROUND),
        badgeForeground: theme.getColor(PANEL_TITLE_BADGE_FOREGROUND),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      })
    };
  }
  fillExtraContextMenuActions(actions) {
    if (this.getCompositeBarPosition() === 1 /* TITLE */) {
      const viewsSubmenuAction = this.getViewsSubmenuAction();
      if (viewsSubmenuAction) {
        actions.push(new Separator());
        actions.push(viewsSubmenuAction);
      }
    }
    const panelPositionMenu = this.menuService.getMenuActions(MenuId.PanelPositionMenu, this.contextKeyService, { shouldForwardArgs: true });
    const panelAlignMenu = this.menuService.getMenuActions(MenuId.PanelAlignmentMenu, this.contextKeyService, { shouldForwardArgs: true });
    const positionActions = getContextMenuActions(panelPositionMenu).secondary;
    const alignActions = getContextMenuActions(panelAlignMenu).secondary;
    const panelShowLabels = this.configurationService.getValue("workbench.panel.showLabels");
    const toggleShowLabelsAction = toAction({
      id: "workbench.action.panel.toggleShowLabels",
      label: panelShowLabels ? localize(6907, null) : localize(6908, null),
      run: () => this.configurationService.updateValue("workbench.panel.showLabels", !panelShowLabels)
    });
    actions.push(...[
      new Separator(),
      new SubmenuAction("workbench.action.panel.position", localize(6906, null), positionActions),
      new SubmenuAction("workbench.action.panel.align", localize(6904, null), alignActions),
      toggleShowLabelsAction,
      toAction({ id: TogglePanelAction.ID, label: localize(6905, null), run: () => this.commandService.executeCommand(TogglePanelAction.ID) })
    ]);
  }
  layout(width2, height, top2, left) {
    let dimensions;
    switch (this.layoutService.getPanelPosition()) {
      case 1 /* RIGHT */:
        dimensions = new Dimension(width2 - 1, height);
        break;
      case 3 /* TOP */:
        dimensions = new Dimension(width2, height - 1);
        break;
      default:
        dimensions = new Dimension(width2, height);
        break;
    }
    super.layout(dimensions.width, dimensions.height, top2, left);
  }
  shouldShowCompositeBar() {
    return true;
  }
  getCompositeBarPosition() {
    return 1 /* TITLE */;
  }
  toJSON() {
    return {
      type: "workbench.parts.panel" /* PANEL_PART */
    };
  }
};

PanelPart = __decorateClass([
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
], PanelPart);
export { PanelPart };
