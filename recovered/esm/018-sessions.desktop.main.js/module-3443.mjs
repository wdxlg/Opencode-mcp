// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sidebarPart.ts
import { isMacintosh, isNative, isWeb } from "./module-0014.mjs";
import { AbstractPaneCompositePart } from "./module-3441.mjs";
import { ActiveViewletContext, SidebarFocusContext } from "./module-0950.mjs";
import { ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_TITLE_BORDER, SIDE_BAR_TITLE_FOREGROUND } from "./module-0868.mjs";
import { Extensions17 } from "./module-1518.mjs";
import { Menus } from "./module-3437.mjs";
import { $, append, getWindowId, prepend } from "./module-0075.mjs";
import { getTitleBarStyle, hasNativeTitlebar } from "./module-0515.mjs";
import { isFullscreen, onDidChangeFullscreen } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { agentsPanelForeground } from "./module-1496.mjs";
import { Part } from "./module-1563.mjs";
import { Separator } from "./module-0082.mjs";
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


// src/vs/sessions/browser/parts/sidebarPart.ts
var SESSIONS_LIST_MINIMUM_WIDTH = isWeb ? 270 : 170;

var SidebarPart = class extends AbstractPaneCompositePart {
  //#endregion
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService, configurationService) {
    super(
      "workbench.parts.sidebar" /* SIDEBAR_PART */,
      { hasTitle: false, trailingSeparator: false, borderWidth: () => 0 },
      SidebarPart.activeViewletSettingsKey,
      ActiveViewletContext.bindTo(contextKeyService),
      SidebarFocusContext.bindTo(contextKeyService),
      "sideBar",
      "viewlet",
      SIDE_BAR_TITLE_FOREGROUND,
      SIDE_BAR_TITLE_BORDER,
      0 /* Sidebar */,
      Extensions17.Viewlets,
      Menus.SidebarTitle,
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
    this.minimumWidth = SESSIONS_LIST_MINIMUM_WIDTH;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 1 /* Low */;
  }
  static {
    this.activeViewletSettingsKey = "workbench.agentsession.sidebar.activeviewletid";
  }
  static {
    this.pinnedViewContainersKey = "workbench.agentsession.pinnedViewlets2";
  }
  static {
    this.placeholderViewContainersKey = "workbench.agentsession.placeholderViewlets";
  }
  static {
    this.viewContainersWorkspaceStateKey = "workbench.agentsession.viewletsWorkspaceState";
  }
  static {
    /** Visual margin values - sidebar is flush (no card appearance) */
    this.MARGIN_TOP = 0;
  }
  static {
    this.MARGIN_BOTTOM = 0;
  }
  static {
    this.MARGIN_LEFT = 0;
  }
  static {
    this.FOOTER_ITEM_HEIGHT = 26;
  }
  static {
    this.FOOTER_ITEM_GAP = 4;
  }
  static {
    this.FOOTER_VERTICAL_PADDING = 6;
  }
  static {
    this.FOOTER_BOTTOM_MARGIN = 2;
  }
  static {
    this.FOOTER_BORDER_TOP = 1;
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
  create(parent) {
    super.create(parent);
    this.createFooter(parent);
  }
  createTitleArea(parent) {
    const titleArea = super.createTitleArea(parent);
    this.sideBarTitleArea = titleArea;
    if (titleArea) {
      prepend(titleArea, $("div.titlebar-drag-region"));
    }
    if (titleArea && isMacintosh && isNative && !hasNativeTitlebar(this.configurationService, getTitleBarStyle(this.configurationService))) {
      const spacer = $("div.window-controls-container");
      spacer.style.width = "70px";
      spacer.style.height = "100%";
      spacer.style.flexShrink = "0";
      spacer.style.order = "-1";
      prepend(titleArea, spacer);
      const updateSpacerVisibility = () => {
        spacer.style.display = isFullscreen(mainWindow) ? "none" : "";
      };
      updateSpacerVisibility();
      this._register(onDidChangeFullscreen((windowId) => {
        if (windowId === getWindowId(mainWindow)) {
          updateSpacerVisibility();
        }
      }));
    }
    return titleArea;
  }
  createFooter(parent) {
    const footer = append(parent, $(".sidebar-footer.sidebar-action-list"));
    this.footerContainer = footer;
    this.footerToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, footer, Menus.SidebarFooter, {
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true },
      telemetrySource: "sidebarFooter"
    }));
    this._register(this.footerToolbar.onDidChangeMenuItems(() => {
      if (this.previousLayoutDimensions) {
        const { width: width2, height, top: top2, left } = this.previousLayoutDimensions;
        this.layout(width2, height, top2, left);
      }
    }));
  }
  getFooterHeight() {
    const actionCount = this.footerToolbar?.getItemsLength() ?? 0;
    if (actionCount === 0) {
      return 0;
    }
    return SidebarPart.FOOTER_VERTICAL_PADDING * 2 + actionCount * SidebarPart.FOOTER_ITEM_HEIGHT + (actionCount - 1) * SidebarPart.FOOTER_ITEM_GAP + SidebarPart.FOOTER_BOTTOM_MARGIN + SidebarPart.FOOTER_BORDER_TOP;
  }
  updateFooterVisibility() {
    const footer = this.footerContainer;
    if (!footer) {
      return;
    }
    footer.style.display = this.getFooterHeight() > 0 ? "" : "none";
  }
  updateStyles() {
    super.updateStyles();
    const container2 = assertReturnsDefined(this.getContainer());
    container2.style.backgroundColor = "transparent";
    container2.style.color = this.getColor(SIDE_BAR_FOREGROUND) || "";
    container2.style.outlineColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? "";
    container2.style.borderRightWidth = "";
    container2.style.borderRightStyle = "";
    container2.style.borderRightColor = "";
    if (this.sideBarTitleArea) {
      this.sideBarTitleArea.style.backgroundColor = "transparent";
      this.sideBarTitleArea.style.color = this.getColor(agentsPanelForeground) || "";
    }
  }
  layout(width2, height, top2, left) {
    this.previousLayoutDimensions = { width: width2, height, top: top2, left };
    if (!this.layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      return;
    }
    this.updateFooterVisibility();
    const footerHeight = Math.min(height, this.getFooterHeight());
    super.layout(
      width2,
      height - footerHeight,
      top2,
      left
    );
    Part.prototype.layout.call(this, width2, height, top2, left);
  }
  getTitleAreaDropDownAnchorAlignment() {
    return this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
  }
  createTitleLabel(_parent) {
    return {
      updateTitle: () => {
      },
      updateStyles: () => {
      }
    };
  }
  getCompositeBarOptions() {
    return {
      partContainerClass: "sidebar",
      pinnedViewContainersKey: SidebarPart.pinnedViewContainersKey,
      placeholderViewContainersKey: SidebarPart.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: SidebarPart.viewContainersWorkspaceStateKey,
      icon: false,
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
        activeBackgroundColor: void 0,
        inactiveBackgroundColor: void 0,
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
    return false;
  }
  getCompositeBarPosition() {
    return 1 /* TITLE */;
  }
  async focusActivityBar() {
    if (this.shouldShowCompositeBar()) {
      this.focusCompositeBar();
    }
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
  __decorateParam(11, IMenuService),
  __decorateParam(12, IConfigurationService)
], SidebarPart);
export { SESSIONS_LIST_MINIMUM_WIDTH, SidebarPart };
