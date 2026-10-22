// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/auxiliaryBarPart.ts
import { AbstractPaneCompositePart } from "./module-3441.mjs";
import { ActiveAuxiliaryContext, AuxiliaryBarFocusContext } from "./module-0950.mjs";
import { ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_DRAG_AND_DROP_BORDER, PANEL_INACTIVE_TITLE_FOREGROUND, SIDE_BAR_TITLE_BORDER } from "./module-0868.mjs";
import { Extensions17 } from "./module-1518.mjs";
import { Menus } from "./module-3437.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { IMenuService, MenuId, MenuItemAction } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { agentsBadgeBackground, agentsBadgeForeground, agentsPanelBackground, agentsPanelBorder, agentsPanelForeground } from "./module-1496.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1909.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { mainWindow } from "./module-0002.mjs";
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
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/sessions/browser/parts/auxiliaryBarPart.ts
var AuxiliaryBarPart = class extends AbstractPaneCompositePart {
  constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService, configurationService) {
    super(
      "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */,
      {
        hasTitle: true,
        trailingSeparator: false,
        borderWidth: () => 0
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
      Menus.AuxiliaryBarTitle,
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
    // Run script dropdown management
    this._runScriptDropdown = this._register(new MutableDisposable());
    this._runScriptMenu = this._register(new MutableDisposable());
    this._runScriptMenuListener = this._register(new MutableDisposable());
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this.priority = 1 /* Low */;
    this._register(this.layoutService.onDidChangePartVisibility((e4) => {
      if (e4.partId === "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */ || e4.partId === "workbench.parts.editor" /* EDITOR_PART */) {
        this._onDidChange.fire(void 0);
      }
      if (e4.partId === "workbench.parts.editor" /* EDITOR_PART */ && this.dimension && this.contentPosition) {
        this.layout(this.dimension.width, this.dimension.height, this.contentPosition.top, this.contentPosition.left);
      }
    }));
  }
  static {
    this.activeViewSettingsKey = "workbench.agentsession.auxiliarybar.activepanelid";
  }
  static {
    this.pinnedViewsKey = "workbench.agentsession.auxiliarybar.pinnedPanels";
  }
  static {
    this.placeholderViewContainersKey = "workbench.agentsession.auxiliarybar.placeholderPanels";
  }
  static {
    this.viewContainersWorkspaceStateKey = "workbench.agentsession.auxiliarybar.viewContainersWorkspaceState";
  }
  static {
    /** Visual margin values for the card-like appearance (non-docked layout). */
    this.MARGIN_TOP = 0;
  }
  static {
    this.MARGIN_BOTTOM = 0;
  }
  static {
    this.CONTENT_PADDING_LEFT = 5;
  }
  static {
    // Action ID for run script - defined here to avoid layering issues
    this.RUN_SCRIPT_ACTION_ID = "workbench.action.agentSessions.runScript";
  }
  static {
    this.RUN_SCRIPT_DROPDOWN_MENU_ID = MenuId.for("AgentSessionsRunScriptDropdown");
  }
  static {
    this.DEFAULT_MINIMUM_WIDTH = 270;
  }
  // Sessions-specific auxiliary bar dimensions (intentionally not tied to the sessions SidebarPart values)
  get minimumWidth() {
    return AuxiliaryBarPart.DEFAULT_MINIMUM_WIDTH;
  }
  get snap() {
    return this.hasAttachedEditorRequiringSidebarSpace() ? false : super.snap;
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
  create(parent) {
    super.create(parent);
    parent.setAttribute("role", "complementary");
    parent.setAttribute("aria-label", localize(3770, null));
  }
  updateStyles() {
    super.updateStyles();
    const container2 = assertReturnsDefined(this.getContainer());
    const backgroundColor = this.getPartBackgroundColor();
    container2.style.setProperty("--part-background", backgroundColor);
    container2.style.setProperty("--part-border-color", this.getColor(agentsPanelBorder) || "transparent");
    container2.style.setProperty("--part-foreground", this.getColor(agentsPanelForeground) || "");
    container2.style.backgroundColor = backgroundColor;
    container2.style.borderLeftColor = "";
    container2.style.borderRightColor = "";
    container2.style.borderLeftStyle = "";
    container2.style.borderRightStyle = "";
    container2.style.borderLeftWidth = "";
    container2.style.borderRightWidth = "";
  }
  /** The part background color. Overridden by the single-pane variant to match the editor. */
  getPartBackgroundColor() {
    return this.getColor(agentsPanelBackground) || "";
  }
  getCompositeBarOptions() {
    const $this = this;
    return {
      partContainerClass: "auxiliarybar",
      pinnedViewContainersKey: AuxiliaryBarPart.pinnedViewsKey,
      placeholderViewContainersKey: AuxiliaryBarPart.placeholderViewContainersKey,
      viewContainersWorkspaceStateKey: AuxiliaryBarPart.viewContainersWorkspaceStateKey,
      icon: false,
      orientation: 0 /* HORIZONTAL */,
      recomputeSizes: true,
      activityHoverOptions: {
        position: () => this.getCompositeBarPosition() === 2 /* BOTTOM */ ? 3 /* ABOVE */ : 2 /* BELOW */
      },
      fillExtraContextMenuActions: (actions) => this.fillExtraContextMenuActions(actions),
      compositeSize: 0,
      iconSize: 16,
      get overflowActionSize() {
        return $this.getCompositeBarPosition() === 1 /* TITLE */ ? 40 : 30;
      },
      colors: (theme) => ({
        activeBackgroundColor: theme.getColor(agentsPanelBackground),
        inactiveBackgroundColor: theme.getColor(agentsPanelBackground),
        get activeBorderBottomColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_ACTIVE_TITLE_BORDER) : theme.getColor(ACTIVITY_BAR_TOP_ACTIVE_BORDER);
        },
        get activeForegroundColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND) : theme.getColor(ACTIVITY_BAR_TOP_FOREGROUND);
        },
        get inactiveForegroundColor() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND) : theme.getColor(ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND);
        },
        badgeBackground: theme.getColor(agentsBadgeBackground),
        badgeForeground: theme.getColor(agentsBadgeForeground),
        get dragAndDropBorder() {
          return $this.getCompositeBarPosition() === 1 /* TITLE */ ? theme.getColor(PANEL_DRAG_AND_DROP_BORDER) : theme.getColor(ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER);
        }
      }),
      compact: true
    };
  }
  actionViewItemProvider(action, options3) {
    if (action.id === AuxiliaryBarPart.RUN_SCRIPT_ACTION_ID && action instanceof MenuItemAction) {
      if (!this._runScriptMenu.value) {
        this._runScriptMenu.value = this.menuService.createMenu(AuxiliaryBarPart.RUN_SCRIPT_DROPDOWN_MENU_ID, this.contextKeyService);
        this._runScriptMenuListener.value = this._runScriptMenu.value.onDidChange(() => this._updateRunScriptDropdown());
      }
      const dropdownActions = this._getRunScriptDropdownActions();
      const dropdownAction = {
        id: "runScriptDropdown",
        label: "",
        tooltip: "",
        class: void 0,
        enabled: true,
        run: () => {
        }
      };
      this._runScriptDropdown.value = this.instantiationService.createInstance(
        DropdownWithPrimaryActionViewItem,
        action,
        dropdownAction,
        dropdownActions,
        "",
        {
          hoverDelegate: options3.hoverDelegate,
          getKeyBinding: (action2) => this.keybindingService.lookupKeybinding(action2.id, this.contextKeyService)
        }
      );
      return this._runScriptDropdown.value;
    }
    return super.actionViewItemProvider(action, options3);
  }
  _getRunScriptDropdownActions() {
    if (!this._runScriptMenu.value) {
      return [];
    }
    return getFlatContextMenuActions(this._runScriptMenu.value.getActions({ shouldForwardArgs: true }));
  }
  _updateRunScriptDropdown() {
    if (this._runScriptDropdown.value) {
      const dropdownActions = this._getRunScriptDropdownActions();
      const dropdownAction = {
        id: "runScriptDropdown",
        label: "",
        tooltip: "",
        class: void 0,
        enabled: true,
        run: () => {
        }
      };
      this._runScriptDropdown.value.update(dropdownAction, dropdownActions);
    }
  }
  hasAttachedEditorRequiringSidebarSpace() {
    return this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */) && this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
  }
  fillExtraContextMenuActions(_actions) {
  }
  shouldShowCompositeBar() {
    return true;
  }
  getCompositeBarPosition() {
    return 1 /* TITLE */;
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return;
    }
    const borderTotal = 2;
    const editorVisible = this.layoutService.isVisible("workbench.parts.editor" /* EDITOR_PART */, mainWindow);
    const paddingLeft = editorVisible ? AuxiliaryBarPart.CONTENT_PADDING_LEFT : 0;
    const marginBottom = AuxiliaryBarPart.MARGIN_BOTTOM;
    super.layout(
      width2 - borderTotal - paddingLeft,
      height - AuxiliaryBarPart.MARGIN_TOP - marginBottom - borderTotal,
      top2,
      left
    );
    Part.prototype.layout.call(this, width2, height, top2, left);
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
  __decorateParam(11, IMenuService),
  __decorateParam(12, IConfigurationService)
], AuxiliaryBarPart);
export { AuxiliaryBarPart };
