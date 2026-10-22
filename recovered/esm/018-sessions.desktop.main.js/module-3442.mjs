// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/panelPart.ts
import { AbstractPaneCompositePart } from "./module-3441.mjs";
import { ActivePanelContext, PanelFocusContext } from "./module-0950.mjs";
import { PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_DRAG_AND_DROP_BORDER, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_TITLE_BORDER } from "./module-0868.mjs";
import { Extensions17 } from "./module-1518.mjs";
import { Menus } from "./module-3437.mjs";
import { AGENTS_FLOATING_PANEL_GAP } from "./module-1498.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { agentsBadgeBackground, agentsBadgeForeground, agentsBottomPanelBorder, agentsPanelBackground, agentsPanelForeground } from "./module-1496.mjs";
import { Part } from "./module-1563.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/browser/parts/panelPart.ts
var PanelPart = class extends AbstractPaneCompositePart {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService, configurationService) {
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
      Menus.PanelTitle,
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
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 77;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.panel.showLabels")) {
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
    this.activePanelSettingsKey = "workbench.agentsession.panelpart.activepanelid";
  }
  static {
    /** Visual margin values for the card-like appearance */
    this.MARGIN_TOP = AGENTS_FLOATING_PANEL_GAP;
  }
  updateStyles() {
    super.updateStyles();
    const container2 = assertReturnsDefined(this.getContainer());
    container2.style.setProperty("--part-background", this.getColor(agentsPanelBackground) || "");
    container2.style.setProperty("--part-border-color", this.getColor(agentsBottomPanelBorder) || "transparent");
    container2.style.setProperty("--part-foreground", this.getColor(agentsPanelForeground) || "");
    container2.style.backgroundColor = this.getColor(agentsPanelBackground) || "";
    container2.style.borderTopColor = "";
    container2.style.borderTopStyle = "";
    container2.style.borderTopWidth = "";
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "panel",
      pinnedViewContainersKey: "workbench.agentsession.panel.pinnedPanels",
      placeholderViewContainersKey: "workbench.agentsession.panel.placeholderPanels",
      viewContainersWorkspaceStateKey: "workbench.agentsession.panel.viewContainersWorkspaceState",
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
      overflowActionSize: 44,
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(agentsPanelBackground),
        inactiveBackgroundColor: theme.getColor(agentsPanelBackground),
        activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
        activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
        inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
        badgeBackground: theme.getColor(agentsBadgeBackground),
        badgeForeground: theme.getColor(agentsBadgeForeground),
        dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
      })
    };
  }
  fillExtraContextMenuActions(_actions) {
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      return;
    }
    const borderTotal = 2;
    super.layout(
      width2 - borderTotal,
      height - PanelPart.MARGIN_TOP - borderTotal,
      top2,
      left
    );
    Part.prototype.layout.call(this, width2, height, top2, left);
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
  __decorateParam(11, IMenuService),
  __decorateParam(12, IConfigurationService)
], PanelPart);
export { PanelPart };
