// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/layoutActions.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { AuxiliaryBarVisibleContext, CustomMenuBarVisibleContext, FocusedViewContext, InEditorZenModeContext, IsAuxiliaryWindowContext, IsAuxiliaryWindowFocusedContext, IsMainEditorCenteredLayoutContext, IsMainWindowFullscreenContext, IsSessionsWindowContext, MainEditorAreaVisibleContext, PanelAlignmentContext, PanelPositionContext, PanelVisibleContext, SideBarVisibleContext, TitleBarStyleContext } from "./module-0950.mjs";
import { Categories } from "./module-0847.mjs";
import { IWorkbenchLayoutService, positionToString } from "./module-1119.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService, ViewContainerLocationToString } from "./module-1094.mjs";
import { alert } from "./module-0076.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { isLinux, isMacintosh, isNative, isWeb, isWindows } from "./module-0014.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ToggleAuxiliaryBarAction } from "./module-1557.mjs";
import { TogglePanelAction } from "./module-1558.mjs";
import { QuickInputAlignmentContextKey } from "./module-1560.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/browser/actions/layoutActions.ts
var menubarIcon = registerIcon("menuBar", Codicon.layoutMenubar, localize(6020, null));

var activityBarLeftIcon = registerIcon("activity-bar-left", Codicon.layoutActivitybarLeft, localize(5984, null));

var activityBarRightIcon = registerIcon("activity-bar-right", Codicon.layoutActivitybarRight, localize(5985, null));

var panelLeftIcon = registerIcon("panel-left", Codicon.layoutSidebarLeft, localize(6060, null));

var panelLeftOffIcon = registerIcon("panel-left-off", Codicon.layoutSidebarLeftOff, localize(6061, null));

var panelRightIcon = registerIcon("panel-right", Codicon.layoutSidebarRight, localize(6062, null));

var panelRightOffIcon = registerIcon("panel-right-off", Codicon.layoutSidebarRightOff, localize(6063, null));

var panelIcon2 = registerIcon("panel-bottom", Codicon.layoutPanel, localize(6054, null));

var statusBarIcon = registerIcon("statusBar", Codicon.layoutStatusbar, localize(6096, null));

var panelAlignmentLeftIcon = registerIcon("panel-align-left", Codicon.layoutPanelLeft, localize(6057, null));

var panelAlignmentRightIcon = registerIcon("panel-align-right", Codicon.layoutPanelRight, localize(6058, null));

var panelAlignmentCenterIcon = registerIcon("panel-align-center", Codicon.layoutPanelCenter, localize(6055, null));

var panelAlignmentJustifyIcon = registerIcon("panel-align-justify", Codicon.layoutPanelJustify, localize(6056, null));

var quickInputAlignmentTopIcon = registerIcon("quickInputAlignmentTop", Codicon.arrowUp, localize(6067, null));

var quickInputAlignmentCenterIcon = registerIcon("quickInputAlignmentCenter", Codicon.circle, localize(6066, null));

var fullscreenIcon = registerIcon("fullscreen", Codicon.screenFull, localize(6005, null));

var centerLayoutIcon = registerIcon("centerLayoutIcon", Codicon.layoutCentered, localize(5990, null));

var zenModeIcon = registerIcon("zenMode", Codicon.target, localize(6111, null));

var ToggleActivityBarVisibilityActionId = "workbench.action.toggleActivityBarVisibility";

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleCenteredLayout",
      title: {
        ...localize2(6098, "Toggle Centered Layout"),
        mnemonicTitle: localize(6028, null)
      },
      precondition: ContextKeyExpr.and(IsAuxiliaryWindowFocusedContext.toNegated(), IsSessionsWindowContext.negate()),
      category: Categories.View,
      f1: true,
      toggled: IsMainEditorCenteredLayoutContext,
      menu: [{
        id: MenuId.MenubarAppearanceMenu,
        group: "1_toggle_view",
        order: 3,
        when: IsSessionsWindowContext.negate()
      }]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    layoutService.centerMainEditorLayout(!layoutService.isMainEditorLayoutCentered());
    editorGroupService.activeGroup.focus();
  }
});

var sidebarPositionConfigurationKey = "workbench.sideBar.location";

var MoveSidebarPositionAction = class extends Action2 {
  constructor(id2, title, position2) {
    super({
      id: id2,
      title,
      f1: false
    });
    this.position = position2;
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const position2 = layoutService.getSideBarPosition();
    if (position2 !== this.position) {
      return configurationService.updateValue(sidebarPositionConfigurationKey, positionToString(this.position));
    }
  }
};

var MoveSidebarRightAction = class _MoveSidebarRightAction extends MoveSidebarPositionAction {
  static {
    this.ID = "workbench.action.moveSideBarRight";
  }
  constructor() {
    super(_MoveSidebarRightAction.ID, localize2(6048, "Move Primary Side Bar Right"), 1 /* RIGHT */);
  }
};

var MoveSidebarLeftAction = class _MoveSidebarLeftAction extends MoveSidebarPositionAction {
  static {
    this.ID = "workbench.action.moveSideBarLeft";
  }
  constructor() {
    super(_MoveSidebarLeftAction.ID, localize2(6046, "Move Primary Side Bar Left"), 0 /* LEFT */);
  }
};

registerAction2(MoveSidebarRightAction);

registerAction2(MoveSidebarLeftAction);

var ToggleSidebarPositionAction = class _ToggleSidebarPositionAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleSidebarPosition";
  }
  static {
    this.LABEL = localize(6105, null);
  }
  static getLabel(layoutService) {
    return layoutService.getSideBarPosition() === 0 /* LEFT */ ? localize(6049, null) : localize(6047, null);
  }
  constructor() {
    super({
      id: _ToggleSidebarPositionAction.ID,
      title: localize2(6106, "Toggle Primary Side Bar Position"),
      category: Categories.View,
      f1: true,
      precondition: IsSessionsWindowContext.negate()
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const position2 = layoutService.getSideBarPosition();
    const newPositionValue = position2 === 0 /* LEFT */ ? "right" : "left";
    return configurationService.updateValue(sidebarPositionConfigurationKey, newPositionValue);
  }
};

registerAction2(ToggleSidebarPositionAction);

var configureLayoutIcon = registerIcon("configure-layout-icon", Codicon.layout, localize(5993, null));

MenuRegistry.appendMenuItem(MenuId.LayoutControlMenu, {
  submenu: MenuId.LayoutControlMenuSubmenu,
  title: localize(5996, null),
  icon: configureLayoutIcon,
  group: "1_workbench_layout",
  when: ContextKeyExpr.and(
    IsAuxiliaryWindowContext.negate(),
    ContextKeyExpr.equals("config.workbench.layoutControl.type", "menu")
  )
});

MenuRegistry.appendMenuItems([{
  id: MenuId.ViewContainerTitleContext,
  item: {
    group: "3_workbench_layout_move",
    command: {
      id: ToggleSidebarPositionAction.ID,
      title: localize(6031, null)
    },
    when: ContextKeyExpr.and(ContextKeyExpr.notEquals("config.workbench.sideBar.location", "right"), ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(0 /* Sidebar */))),
    order: 1
  }
}, {
  id: MenuId.ViewContainerTitleContext,
  item: {
    group: "3_workbench_layout_move",
    command: {
      id: ToggleSidebarPositionAction.ID,
      title: localize(6032, null)
    },
    when: ContextKeyExpr.and(ContextKeyExpr.equals("config.workbench.sideBar.location", "right"), ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(0 /* Sidebar */))),
    order: 1
  }
}, {
  id: MenuId.ViewContainerTitleContext,
  item: {
    group: "3_workbench_layout_move",
    command: {
      id: ToggleSidebarPositionAction.ID,
      title: localize(6029, null)
    },
    when: ContextKeyExpr.and(ContextKeyExpr.notEquals("config.workbench.sideBar.location", "right"), ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(2 /* AuxiliaryBar */))),
    order: 1
  }
}, {
  id: MenuId.ViewContainerTitleContext,
  item: {
    group: "3_workbench_layout_move",
    command: {
      id: ToggleSidebarPositionAction.ID,
      title: localize(6030, null)
    },
    when: ContextKeyExpr.and(ContextKeyExpr.equals("config.workbench.sideBar.location", "right"), ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(2 /* AuxiliaryBar */))),
    order: 1
  }
}]);

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  group: "3_workbench_layout_move",
  command: {
    id: ToggleSidebarPositionAction.ID,
    title: localize(6025, null)
  },
  when: ContextKeyExpr.and(ContextKeyExpr.notEquals("config.workbench.sideBar.location", "right"), IsSessionsWindowContext.negate()),
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  group: "3_workbench_layout_move",
  command: {
    id: ToggleSidebarPositionAction.ID,
    title: localize(6024, null)
  },
  when: ContextKeyExpr.and(ContextKeyExpr.equals("config.workbench.sideBar.location", "right"), IsSessionsWindowContext.negate()),
  order: 2
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleEditorVisibility",
      title: {
        ...localize2(6099, "Toggle Editor Area Visibility"),
        mnemonicTitle: localize(6026, null)
      },
      category: Categories.View,
      f1: true,
      toggled: MainEditorAreaVisibleContext,
      // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
      precondition: ContextKeyExpr.and(IsAuxiliaryWindowFocusedContext.toNegated(), ContextKeyExpr.or(PanelAlignmentContext.isEqualTo("center"), PanelPositionContext.notEqualsTo("bottom")))
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).toggleMaximizedPanel();
  }
});

MenuRegistry.appendMenuItem(MenuId.MenubarViewMenu, {
  group: "2_appearance",
  title: localize(6021, null),
  submenu: MenuId.MenubarAppearanceMenu,
  when: IsSessionsWindowContext.negate(),
  order: 1
});

var ToggleSidebarVisibilityAction = class _ToggleSidebarVisibilityAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleSidebarVisibility";
  }
  static {
    this.LABEL = localize(5994, null);
  }
  constructor() {
    super({
      id: _ToggleSidebarVisibilityAction.ID,
      title: localize2(6103, "Toggle Primary Side Bar Visibility"),
      toggled: {
        condition: SideBarVisibleContext,
        title: localize(6064, null),
        mnemonicTitle: localize(6065, null)
      },
      metadata: {
        description: localize(6051, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 32 /* KeyB */
      },
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 0
        },
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 1
        }
      ]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const isCurrentlyVisible = layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
    layoutService.setPartHidden(isCurrentlyVisible, "workbench.parts.sidebar" /* SIDEBAR_PART */);
    const alertMessage = isCurrentlyVisible ? localize(6092, null) : localize(6094, null);
    alert(alertMessage);
  }
};

registerAction2(ToggleSidebarVisibilityAction);

MenuRegistry.appendMenuItems([
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize(5994, null)
      },
      when: ContextKeyExpr.and(SideBarVisibleContext, ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(0 /* Sidebar */))),
      order: 2
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "navigation",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize(6104, null),
        icon: panelLeftOffIcon,
        toggled: { condition: SideBarVisibleContext, icon: panelLeftIcon }
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"),
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")
        ),
        ContextKeyExpr.equals("config.workbench.sideBar.location", "left")
      ),
      order: 0
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "navigation",
      command: {
        id: ToggleSidebarVisibilityAction.ID,
        title: localize(6104, null),
        icon: panelRightOffIcon,
        toggled: { condition: SideBarVisibleContext, icon: panelRightIcon }
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"),
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")
        ),
        ContextKeyExpr.equals("config.workbench.sideBar.location", "right")
      ),
      order: 2
    }
  }
]);

var ToggleStatusbarVisibilityAction = class _ToggleStatusbarVisibilityAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleStatusbarVisibility";
  }
  static {
    this.statusbarVisibleKey = "workbench.statusBar.visible";
  }
  constructor() {
    super({
      id: _ToggleStatusbarVisibilityAction.ID,
      title: {
        ...localize2(6107, "Toggle Status Bar Visibility"),
        mnemonicTitle: localize(6027, null)
      },
      category: Categories.View,
      f1: true,
      precondition: IsSessionsWindowContext.negate(),
      toggled: ContextKeyExpr.equals("config.workbench.statusBar.visible", true),
      menu: [{
        id: MenuId.MenubarAppearanceMenu,
        group: "2_workbench_layout",
        order: 3,
        when: IsSessionsWindowContext.negate()
      }]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const visibility = layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, mainWindow);
    const newVisibilityValue = !visibility;
    return configurationService.updateValue(_ToggleStatusbarVisibilityAction.statusbarVisibleKey, newVisibilityValue);
  }
};

registerAction2(ToggleStatusbarVisibilityAction);

var AbstractSetShowTabsAction = class extends Action2 {
  constructor(settingName, value2, title, id2, precondition2, description) {
    super({
      id: id2,
      title,
      category: Categories.View,
      precondition: ContextKeyExpr.and(precondition2, IsSessionsWindowContext.negate()),
      metadata: description ? { description } : void 0,
      f1: true
    });
    this.settingName = settingName;
    this.value = value2;
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue(this.settingName, this.value);
  }
};

var HideEditorTabsAction = class _HideEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.hideEditorTabs";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "none" /* NONE */).negate(), InEditorZenModeContext.negate());
    const title = localize2(6008, "Hide Editor Tabs");
    super("workbench.editor.showTabs" /* EDITOR_TABS_MODE */, "none" /* NONE */, title, _HideEditorTabsAction.ID, precondition2, localize2(6009, "Hide Tab Bar"));
  }
};

var ZenHideEditorTabsAction = class _ZenHideEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.zenHideEditorTabs";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* SHOW_TABS */}`, "none" /* NONE */).negate(), InEditorZenModeContext);
    const title = localize2(6010, "Hide Editor Tabs in Zen Mode");
    super("zenMode.showTabs" /* SHOW_TABS */, "none" /* NONE */, title, _ZenHideEditorTabsAction.ID, precondition2, localize2(6011, "Hide Tab Bar in Zen Mode"));
  }
};

var ShowMultipleEditorTabsAction = class _ShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.showMultipleEditorTabs";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "multiple" /* MULTIPLE */).negate(), InEditorZenModeContext.negate());
    const title = localize2(6081, "Show Multiple Editor Tabs");
    super("workbench.editor.showTabs" /* EDITOR_TABS_MODE */, "multiple" /* MULTIPLE */, title, _ShowMultipleEditorTabsAction.ID, precondition2, localize2(6082, "Show Tab Bar with multiple tabs"));
  }
};

var ZenShowMultipleEditorTabsAction = class _ZenShowMultipleEditorTabsAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.zenShowMultipleEditorTabs";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* SHOW_TABS */}`, "multiple" /* MULTIPLE */).negate(), InEditorZenModeContext);
    const title = localize2(6083, "Show Multiple Editor Tabs in Zen Mode");
    super("zenMode.showTabs" /* SHOW_TABS */, "multiple" /* MULTIPLE */, title, _ZenShowMultipleEditorTabsAction.ID, precondition2, localize2(6084, "Show Tab Bar in Zen Mode"));
  }
};

var ShowSingleEditorTabAction = class _ShowSingleEditorTabAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.showEditorTab";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "single" /* SINGLE */).negate(), InEditorZenModeContext.negate());
    const title = localize2(6085, "Show Single Editor Tab");
    super("workbench.editor.showTabs" /* EDITOR_TABS_MODE */, "single" /* SINGLE */, title, _ShowSingleEditorTabAction.ID, precondition2, localize2(6086, "Show Tab Bar with one Tab"));
  }
};

registerAction2(HideEditorTabsAction);

registerAction2(ShowMultipleEditorTabsAction);

registerAction2(ShowSingleEditorTabAction);

var ZenShowSingleEditorTabAction = class _ZenShowSingleEditorTabAction extends AbstractSetShowTabsAction {
  static {
    this.ID = "workbench.action.zenShowEditorTab";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"zenMode.showTabs" /* SHOW_TABS */}`, "single" /* SINGLE */).negate(), InEditorZenModeContext);
    const title = localize2(6087, "Show Single Editor Tab in Zen Mode");
    super("zenMode.showTabs" /* SHOW_TABS */, "single" /* SINGLE */, title, _ZenShowSingleEditorTabAction.ID, precondition2, localize2(6088, "Show Tab Bar in Zen Mode with one Tab"));
  }
};

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorTabsBarShowTabsSubmenu,
  title: localize(6097, null),
  group: "3_workbench_layout_move",
  order: 10,
  when: ContextKeyExpr.and(InEditorZenModeContext.negate(), IsSessionsWindowContext.negate())
});

var EditorActionsTitleBarAction = class _EditorActionsTitleBarAction extends Action2 {
  static {
    this.ID = "workbench.action.editorActionsTitleBar";
  }
  constructor() {
    super({
      id: _EditorActionsTitleBarAction.ID,
      title: localize2(6035, "Move Editor Actions to Title Bar"),
      category: Categories.View,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "titleBar" /* TITLEBAR */).negate(), IsSessionsWindowContext.negate()),
      metadata: { description: localize2(6036, "Move Editor Actions from the tab bar to the title bar") },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */, "titleBar" /* TITLEBAR */);
  }
};

registerAction2(EditorActionsTitleBarAction);

var EditorActionsDefaultAction = class _EditorActionsDefaultAction extends Action2 {
  static {
    this.ID = "workbench.action.editorActionsDefault";
  }
  constructor() {
    super({
      id: _EditorActionsDefaultAction.ID,
      title: localize2(6033, "Move Editor Actions to Tab Bar"),
      category: Categories.View,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "default" /* DEFAULT */).negate(),
        ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "none" /* NONE */).negate(),
        IsSessionsWindowContext.negate()
      ),
      metadata: { description: localize2(6034, "Move Editor Actions from the title bar to the tab bar") },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */, "default" /* DEFAULT */);
  }
};

registerAction2(EditorActionsDefaultAction);

var HideEditorActionsAction = class _HideEditorActionsAction extends Action2 {
  static {
    this.ID = "workbench.action.hideEditorActions";
  }
  constructor() {
    super({
      id: _HideEditorActionsAction.ID,
      title: localize2(6006, "Hide Editor Actions"),
      category: Categories.View,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "hidden" /* HIDDEN */).negate(), IsSessionsWindowContext.negate()),
      metadata: { description: localize2(6007, "Hide Editor Actions in the tab and title bar") },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */, "hidden" /* HIDDEN */);
  }
};

registerAction2(HideEditorActionsAction);

var ShowEditorActionsAction = class _ShowEditorActionsAction extends Action2 {
  static {
    this.ID = "workbench.action.showEditorActions";
  }
  constructor() {
    super({
      id: _ShowEditorActionsAction.ID,
      title: localize2(6079, "Show Editor Actions"),
      category: Categories.View,
      precondition: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "hidden" /* HIDDEN */), IsSessionsWindowContext.negate()),
      metadata: { description: localize2(6080, "Make Editor Actions visible.") },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    return configurationService.updateValue("workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */, "default" /* DEFAULT */);
  }
};

registerAction2(ShowEditorActionsAction);

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.EditorActionsPositionSubmenu,
  title: localize(6003, null),
  group: "3_workbench_layout_move",
  order: 11,
  when: IsSessionsWindowContext.negate()
});

var ConfigureEditorTabsAction = class _ConfigureEditorTabsAction extends Action2 {
  static {
    this.ID = "workbench.action.configureEditorTabs";
  }
  constructor() {
    super({
      id: _ConfigureEditorTabsAction.ID,
      title: localize2(5997, "Configure Tabs"),
      category: Categories.View
    });
  }
  run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    preferencesService.openSettings({ jsonEditor: false, query: "workbench.editor tab" });
  }
};

registerAction2(ConfigureEditorTabsAction);

var ConfigureEditorAction = class _ConfigureEditorAction extends Action2 {
  static {
    this.ID = "workbench.action.configureEditor";
  }
  constructor() {
    super({
      id: _ConfigureEditorAction.ID,
      title: localize2(5995, "Configure Editors"),
      category: Categories.View
    });
  }
  run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    preferencesService.openSettings({ jsonEditor: false, query: "workbench.editor" });
  }
};

registerAction2(ConfigureEditorAction);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleSeparatePinnedEditorTabs",
      title: localize2(6101, "Separate Pinned Editor Tabs"),
      category: Categories.View,
      precondition: ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "multiple" /* MULTIPLE */),
      metadata: { description: localize2(6102, "Toggle whether pinned editor tabs are shown on a separate row above unpinned tabs.") },
      f1: true
    });
  }
  run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const oldettingValue = configurationService.getValue("workbench.editor.pinnedTabsOnSeparateRow");
    const newSettingValue = !oldettingValue;
    return configurationService.updateValue("workbench.editor.pinnedTabsOnSeparateRow", newSettingValue);
  }
});

if (isWindows || isLinux || isWeb) {
  registerAction2(class ToggleMenubarAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.toggleMenuBar",
        title: {
          ...localize2(6100, "Toggle Menu Bar"),
          mnemonicTitle: localize(6022, null)
        },
        category: Categories.View,
        f1: true,
        precondition: IsSessionsWindowContext.negate(),
        toggled: CustomMenuBarVisibleContext,
        menu: [{
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 0,
          when: IsSessionsWindowContext.negate()
        }]
      });
    }
    run(accessor) {
      return accessor.get(IWorkbenchLayoutService).toggleMenuBar();
    }
  });
  for (const menuId of [MenuId.TitleBarContext, MenuId.TitleBarTitleContext]) {
    MenuRegistry.appendMenuItem(menuId, {
      command: {
        id: "workbench.action.toggleMenuBar",
        title: localize(6023, null),
        toggled: CustomMenuBarVisibleContext
      },
      when: ContextKeyExpr.and(IsAuxiliaryWindowFocusedContext.toNegated(), ContextKeyExpr.notEquals(TitleBarStyleContext.key, "native" /* NATIVE */), IsMainWindowFullscreenContext.negate()),
      group: "2_config",
      order: 0
    });
  }
}

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.resetViewLocations",
      title: localize2(6071, "Reset View Locations"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    return accessor.get(IViewDescriptorService).reset();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.moveView",
      title: localize2(6050, "Move View"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const instantiationService = accessor.get(IInstantiationService);
    const quickInputService = accessor.get(IQuickInputService);
    const contextKeyService = accessor.get(IContextKeyService);
    const paneCompositePartService = accessor.get(IPaneCompositePartService);
    const focusedViewId = FocusedViewContext.getValue(contextKeyService);
    let viewId;
    if (focusedViewId && viewDescriptorService.getViewDescriptorById(focusedViewId)?.canMoveView) {
      viewId = focusedViewId;
    }
    try {
      viewId = await this.getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId);
      if (!viewId) {
        return;
      }
      const moveFocusedViewAction = new MoveFocusedViewAction();
      instantiationService.invokeFunction((accessor2) => moveFocusedViewAction.run(accessor2, viewId));
    } catch {
    }
  }
  getViewItems(viewDescriptorService, paneCompositePartService) {
    const results = [];
    const viewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* Sidebar */);
    viewlets.forEach((viewletId) => {
      const container2 = viewDescriptorService.getViewContainerById(viewletId);
      const containerModel = viewDescriptorService.getViewContainerModel(container2);
      let hasAddedView = false;
      containerModel.visibleViewDescriptors.forEach((viewDescriptor3) => {
        if (viewDescriptor3.canMoveView) {
          if (!hasAddedView) {
            results.push({
              type: "separator",
              label: localize(6091, null, containerModel.title)
            });
            hasAddedView = true;
          }
          results.push({
            id: viewDescriptor3.id,
            label: viewDescriptor3.name.value
          });
        }
      });
    });
    const panels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* Panel */);
    panels.forEach((panel) => {
      const container2 = viewDescriptorService.getViewContainerById(panel);
      const containerModel = viewDescriptorService.getViewContainerModel(container2);
      let hasAddedView = false;
      containerModel.visibleViewDescriptors.forEach((viewDescriptor3) => {
        if (viewDescriptor3.canMoveView) {
          if (!hasAddedView) {
            results.push({
              type: "separator",
              label: localize(6059, null, containerModel.title)
            });
            hasAddedView = true;
          }
          results.push({
            id: viewDescriptor3.id,
            label: viewDescriptor3.name.value
          });
        }
      });
    });
    const sidePanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* AuxiliaryBar */);
    sidePanels.forEach((panel) => {
      const container2 = viewDescriptorService.getViewContainerById(panel);
      const containerModel = viewDescriptorService.getViewContainerModel(container2);
      let hasAddedView = false;
      containerModel.visibleViewDescriptors.forEach((viewDescriptor3) => {
        if (viewDescriptor3.canMoveView) {
          if (!hasAddedView) {
            results.push({
              type: "separator",
              label: localize(6076, null, containerModel.title)
            });
            hasAddedView = true;
          }
          results.push({
            id: viewDescriptor3.id,
            label: viewDescriptor3.name.value
          });
        }
      });
    });
    return results;
  }
  async getView(quickInputService, viewDescriptorService, paneCompositePartService, viewId) {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.placeholder = localize(6044, null);
    quickPick.items = this.getViewItems(viewDescriptorService, paneCompositePartService);
    quickPick.selectedItems = quickPick.items.filter((item) => item.id === viewId);
    return new Promise((resolve3, reject) => {
      disposables.add(quickPick.onDidAccept(() => {
        const viewId2 = quickPick.selectedItems[0];
        if (viewId2.id) {
          resolve3(viewId2.id);
        } else {
          reject();
        }
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        reject();
      }));
      quickPick.show();
    });
  }
});

var MoveFocusedViewAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.moveFocusedView",
      title: localize2(6037, "Move Focused View"),
      category: Categories.View,
      precondition: FocusedViewContext.notEqualsTo(""),
      f1: true
    });
  }
  run(accessor, viewId) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const viewsService = accessor.get(IViewsService);
    const quickInputService = accessor.get(IQuickInputService);
    const contextKeyService = accessor.get(IContextKeyService);
    const dialogService = accessor.get(IDialogService);
    const paneCompositePartService = accessor.get(IPaneCompositePartService);
    const focusedViewId = viewId || FocusedViewContext.getValue(contextKeyService);
    if (focusedViewId === void 0 || focusedViewId.trim() === "") {
      dialogService.error(localize(6038, null));
      return;
    }
    const viewDescriptor3 = viewDescriptorService.getViewDescriptorById(focusedViewId);
    if (!viewDescriptor3?.canMoveView) {
      dialogService.error(localize(6039, null));
      return;
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.placeholder = localize(6043, null);
    quickPick.title = localize(6045, null, viewDescriptor3.name.value);
    const items = [];
    const currentContainer = viewDescriptorService.getViewContainerByViewId(focusedViewId);
    const currentLocation = viewDescriptorService.getViewLocationById(focusedViewId);
    const isViewSolo = viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
    if (!(isViewSolo && currentLocation === 1 /* Panel */)) {
      items.push({
        id: "_.panel.newcontainer",
        label: localize(6040, null)
      });
    }
    if (!(isViewSolo && currentLocation === 0 /* Sidebar */)) {
      items.push({
        id: "_.sidebar.newcontainer",
        label: localize(6041, null)
      });
    }
    if (!(isViewSolo && currentLocation === 2 /* AuxiliaryBar */)) {
      items.push({
        id: "_.auxiliarybar.newcontainer",
        label: localize(6042, null)
      });
    }
    items.push({
      type: "separator",
      label: localize(6089, null)
    });
    const pinnedViewlets = paneCompositePartService.getVisiblePaneCompositeIds(0 /* Sidebar */);
    items.push(...pinnedViewlets.filter((viewletId) => {
      if (viewletId === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
        return false;
      }
      return !viewDescriptorService.getViewContainerById(viewletId).rejectAddedViews;
    }).map((viewletId) => {
      return {
        id: viewletId,
        label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(viewletId)).title
      };
    }));
    items.push({
      type: "separator",
      label: localize(6052, null)
    });
    const pinnedPanels = paneCompositePartService.getPinnedPaneCompositeIds(1 /* Panel */);
    items.push(...pinnedPanels.filter((panel) => {
      if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
        return false;
      }
      return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
    }).map((panel) => {
      return {
        id: panel,
        label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
      };
    }));
    items.push({
      type: "separator",
      label: localize(6075, null)
    });
    const pinnedAuxPanels = paneCompositePartService.getPinnedPaneCompositeIds(2 /* AuxiliaryBar */);
    items.push(...pinnedAuxPanels.filter((panel) => {
      if (panel === viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
        return false;
      }
      return !viewDescriptorService.getViewContainerById(panel).rejectAddedViews;
    }).map((panel) => {
      return {
        id: panel,
        label: viewDescriptorService.getViewContainerModel(viewDescriptorService.getViewContainerById(panel)).title
      };
    }));
    quickPick.items = items;
    disposables.add(quickPick.onDidAccept(() => {
      const destination = quickPick.selectedItems[0];
      if (destination.id === "_.panel.newcontainer") {
        viewDescriptorService.moveViewToLocation(viewDescriptor3, 1 /* Panel */, this.desc.id);
        viewsService.openView(focusedViewId, true);
      } else if (destination.id === "_.sidebar.newcontainer") {
        viewDescriptorService.moveViewToLocation(viewDescriptor3, 0 /* Sidebar */, this.desc.id);
        viewsService.openView(focusedViewId, true);
      } else if (destination.id === "_.auxiliarybar.newcontainer") {
        viewDescriptorService.moveViewToLocation(viewDescriptor3, 2 /* AuxiliaryBar */, this.desc.id);
        viewsService.openView(focusedViewId, true);
      } else if (destination.id) {
        viewDescriptorService.moveViewsToContainer([viewDescriptor3], viewDescriptorService.getViewContainerById(destination.id), void 0, this.desc.id);
        viewsService.openView(focusedViewId, true);
      }
      quickPick.hide();
    }));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
};

registerAction2(MoveFocusedViewAction);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.resetFocusedViewLocation",
      title: localize2(6070, "Reset Focused View Location"),
      category: Categories.View,
      f1: true,
      precondition: FocusedViewContext.notEqualsTo("")
    });
  }
  run(accessor) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const contextKeyService = accessor.get(IContextKeyService);
    const dialogService = accessor.get(IDialogService);
    const viewsService = accessor.get(IViewsService);
    const focusedViewId = FocusedViewContext.getValue(contextKeyService);
    let viewDescriptor3 = null;
    if (focusedViewId !== void 0 && focusedViewId.trim() !== "") {
      viewDescriptor3 = viewDescriptorService.getViewDescriptorById(focusedViewId);
    }
    if (!viewDescriptor3) {
      dialogService.error(localize(6069, null));
      return;
    }
    const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor3.id);
    if (!defaultContainer || defaultContainer === viewDescriptorService.getViewContainerByViewId(viewDescriptor3.id)) {
      return;
    }
    viewDescriptorService.moveViewsToContainer([viewDescriptor3], defaultContainer, void 0, this.desc.id);
    viewsService.openView(viewDescriptor3.id, true);
  }
});

var BaseResizeViewAction = class extends Action2 {
  static {
    this.RESIZE_INCREMENT = 60;
  }
  // This is a css pixel size
  resizePart(widthChange, heightChange, layoutService, partToResize) {
    if (layoutService.activeContainer !== layoutService.mainContainer) {
      return;
    }
    let part;
    if (partToResize === void 0) {
      const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */);
      const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* SIDEBAR_PART */);
      const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */);
      const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      if (isSidebarFocus) {
        part = "workbench.parts.sidebar" /* SIDEBAR_PART */;
      } else if (isPanelFocus) {
        part = "workbench.parts.panel" /* PANEL_PART */;
      } else if (isEditorFocus) {
        part = "workbench.parts.editor" /* EDITOR_PART */;
      } else if (isAuxiliaryBarFocus) {
        part = "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
      }
    } else {
      part = partToResize;
    }
    if (part) {
      layoutService.resizePart(part, widthChange, heightChange);
    }
  }
};

var IncreaseViewSizeAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.increaseViewSize",
      title: localize2(6014, "Increase Current View Size"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(IWorkbenchLayoutService));
  }
};

var IncreaseViewWidthAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.increaseViewWidth",
      title: localize2(6013, "Increase Editor Width"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
  }
};

var IncreaseViewHeightAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.increaseViewHeight",
      title: localize2(6012, "Increase Editor Height"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(0, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
  }
};

var DecreaseViewSizeAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.decreaseViewSize",
      title: localize2(6002, "Decrease Current View Size"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(IWorkbenchLayoutService));
  }
};

var DecreaseViewWidthAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.decreaseViewWidth",
      title: localize2(6001, "Decrease Editor Width"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
  }
};

var DecreaseViewHeightAction = class extends BaseResizeViewAction {
  constructor() {
    super({
      id: "workbench.action.decreaseViewHeight",
      title: localize2(6000, "Decrease Editor Height"),
      f1: true,
      precondition: IsAuxiliaryWindowFocusedContext.toNegated()
    });
  }
  run(accessor) {
    this.resizePart(0, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
  }
};

registerAction2(IncreaseViewSizeAction);

registerAction2(IncreaseViewWidthAction);

registerAction2(IncreaseViewHeightAction);

registerAction2(DecreaseViewSizeAction);

registerAction2(DecreaseViewWidthAction);

registerAction2(DecreaseViewHeightAction);

registerAction2(class AlignQuickInputTopAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.alignQuickInputTop",
      title: localize2(5987, "Align Quick Input Top"),
      f1: false
    });
  }
  run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.setAlignment("top");
  }
});

registerAction2(class AlignQuickInputCenterAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.alignQuickInputCenter",
      title: localize2(5986, "Align Quick Input Center"),
      f1: false
    });
  }
  run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.setAlignment("center");
  }
});

function isContextualLayoutVisualIcon(icon2) {
  return icon2.iconA !== void 0;
}

var CreateToggleLayoutItem = (id2, active, label3, visualIcon) => {
  return {
    id: id2,
    active,
    label: label3,
    visualIcon,
    activeIcon: Codicon.eye,
    inactiveIcon: Codicon.eyeClosed,
    activeAriaLabel: localize(6077, null),
    inactiveAriaLabel: localize(6078, null),
    useButtons: true
  };
};

var CreateOptionLayoutItem = (id2, active, label3, visualIcon) => {
  return {
    id: id2,
    active,
    label: label3,
    visualIcon,
    activeIcon: Codicon.check,
    activeAriaLabel: localize(5982, null),
    useButtons: false
  };
};

var ToggleVisibilityActions = [];

if (!isMacintosh || !isNative) {
  ToggleVisibilityActions.push(CreateToggleLayoutItem("workbench.action.toggleMenuBar", CustomMenuBarVisibleContext, localize(6019, null), menubarIcon));
}

ToggleVisibilityActions.push(...[
  CreateToggleLayoutItem(ToggleActivityBarVisibilityActionId, ContextKeyExpr.notEquals("config.workbench.activityBar.location", "hidden"), localize(5983, null), { whenA: ContextKeyExpr.equals("config.workbench.sideBar.location", "left"), iconA: activityBarLeftIcon, iconB: activityBarRightIcon }),
  CreateToggleLayoutItem(ToggleSidebarVisibilityAction.ID, SideBarVisibleContext, localize(6090, null), { whenA: ContextKeyExpr.equals("config.workbench.sideBar.location", "left"), iconA: panelLeftIcon, iconB: panelRightIcon }),
  CreateToggleLayoutItem(ToggleAuxiliaryBarAction.ID, AuxiliaryBarVisibleContext, localize(6075, null), { whenA: ContextKeyExpr.equals("config.workbench.sideBar.location", "left"), iconA: panelRightIcon, iconB: panelLeftIcon }),
  CreateToggleLayoutItem(TogglePanelAction.ID, PanelVisibleContext, localize(6052, null), panelIcon2),
  CreateToggleLayoutItem(ToggleStatusbarVisibilityAction.ID, ContextKeyExpr.equals("config.workbench.statusBar.visible", true), localize(6095, null), statusBarIcon)
]);

var MoveSideBarActions = [
  CreateOptionLayoutItem(MoveSidebarLeftAction.ID, ContextKeyExpr.equals("config.workbench.sideBar.location", "left"), localize(6018, null), panelLeftIcon),
  CreateOptionLayoutItem(MoveSidebarRightAction.ID, ContextKeyExpr.equals("config.workbench.sideBar.location", "right"), localize(6074, null), panelRightIcon)
];

var AlignPanelActions = [
  CreateOptionLayoutItem("workbench.action.alignPanelLeft", PanelAlignmentContext.isEqualTo("left"), localize(6017, null), panelAlignmentLeftIcon),
  CreateOptionLayoutItem("workbench.action.alignPanelRight", PanelAlignmentContext.isEqualTo("right"), localize(6073, null), panelAlignmentRightIcon),
  CreateOptionLayoutItem("workbench.action.alignPanelCenter", PanelAlignmentContext.isEqualTo("center"), localize(5991, null), panelAlignmentCenterIcon),
  CreateOptionLayoutItem("workbench.action.alignPanelJustify", PanelAlignmentContext.isEqualTo("justify"), localize(6015, null), panelAlignmentJustifyIcon)
];

var QuickInputActions = [
  CreateOptionLayoutItem("workbench.action.alignQuickInputTop", QuickInputAlignmentContextKey.isEqualTo("top"), localize(6109, null), quickInputAlignmentTopIcon),
  CreateOptionLayoutItem("workbench.action.alignQuickInputCenter", QuickInputAlignmentContextKey.isEqualTo("center"), localize(5988, null), quickInputAlignmentCenterIcon)
];

var MiscLayoutOptions = [
  CreateOptionLayoutItem("workbench.action.toggleFullScreen", IsMainWindowFullscreenContext, localize(6004, null), fullscreenIcon),
  CreateOptionLayoutItem("workbench.action.toggleZenMode", InEditorZenModeContext, localize(6110, null), zenModeIcon),
  CreateOptionLayoutItem("workbench.action.toggleCenteredLayout", IsMainEditorCenteredLayoutContext, localize(5989, null), centerLayoutIcon)
];

var LayoutContextKeySet = /* @__PURE__ */ new Set();

for (const { active } of [...ToggleVisibilityActions, ...MoveSideBarActions, ...AlignPanelActions, ...QuickInputActions, ...MiscLayoutOptions]) {
  for (const key3 of active.keys()) {
    LayoutContextKeySet.add(key3);
  }
}

var EditorActionsInTitleBar = ContextKeyExpr.or(
  ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "titleBar" /* TITLEBAR */),
  ContextKeyExpr.and(
    ContextKeyExpr.equals(`config.${"workbench.editor.editorActionsLocation" /* EDITOR_ACTIONS_LOCATION */}`, "default" /* DEFAULT */),
    ContextKeyExpr.equals(`config.${"workbench.editor.showTabs" /* EDITOR_TABS_MODE */}`, "none" /* NONE */)
  )
);

registerAction2(class CustomizeLayoutAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.customizeLayout",
      title: localize2(5998, "Customize Layout..."),
      f1: true,
      icon: configureLayoutIcon,
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "z_end"
        },
        {
          id: MenuId.LayoutControlMenu,
          when: ContextKeyExpr.and(
            IsAuxiliaryWindowContext.toNegated(),
            ContextKeyExpr.equals("config.workbench.layoutControl.type", "both"),
            EditorActionsInTitleBar.negate()
          ),
          group: "navigation"
        },
        {
          id: MenuId.LayoutControlMenu,
          when: ContextKeyExpr.and(
            IsAuxiliaryWindowContext.toNegated(),
            ContextKeyExpr.equals("config.workbench.layoutControl.type", "both"),
            EditorActionsInTitleBar
          ),
          group: "1_layout"
        }
      ]
    });
  }
  getItems(contextKeyService, keybindingService) {
    const toQuickPickItem2 = (item) => {
      const toggled = item.active.evaluate(contextKeyService.getContext(null));
      let label3 = item.useButtons ? item.label : item.label + (toggled && item.activeIcon ? ` $(${item.activeIcon.id})` : !toggled && item.inactiveIcon ? ` $(${item.inactiveIcon.id})` : "");
      const ariaLabel = item.label + (toggled && item.activeAriaLabel ? ` (${item.activeAriaLabel})` : !toggled && item.inactiveAriaLabel ? ` (${item.inactiveAriaLabel})` : "");
      if (item.visualIcon) {
        let icon3 = item.visualIcon;
        if (isContextualLayoutVisualIcon(icon3)) {
          const useIconA = icon3.whenA.evaluate(contextKeyService.getContext(null));
          icon3 = useIconA ? icon3.iconA : icon3.iconB;
        }
        label3 = `$(${icon3.id}) ${label3}`;
      }
      const icon2 = toggled ? item.activeIcon : item.inactiveIcon;
      return {
        type: "item",
        id: item.id,
        label: label3,
        ariaLabel,
        keybinding: keybindingService.lookupKeybinding(item.id, contextKeyService),
        buttons: !item.useButtons ? void 0 : [
          {
            alwaysVisible: false,
            tooltip: ariaLabel,
            iconClass: icon2 ? ThemeIcon.asClassName(icon2) : void 0
          }
        ]
      };
    };
    return [
      {
        type: "separator",
        label: localize(6108, null)
      },
      ...ToggleVisibilityActions.map(toQuickPickItem2),
      {
        type: "separator",
        label: localize(6093, null)
      },
      ...MoveSideBarActions.map(toQuickPickItem2),
      {
        type: "separator",
        label: localize(6053, null)
      },
      ...AlignPanelActions.map(toQuickPickItem2),
      {
        type: "separator",
        label: localize(6068, null)
      },
      ...QuickInputActions.map(toQuickPickItem2),
      {
        type: "separator",
        label: localize(6016, null)
      },
      ...MiscLayoutOptions.map(toQuickPickItem2)
    ];
  }
  run(accessor) {
    if (this._currentQuickPick) {
      this._currentQuickPick.hide();
      return;
    }
    const configurationService = accessor.get(IConfigurationService);
    const contextKeyService = accessor.get(IContextKeyService);
    const commandService = accessor.get(ICommandService);
    const quickInputService = accessor.get(IQuickInputService);
    const keybindingService = accessor.get(IKeybindingService);
    const disposables = new DisposableStore();
    const quickPick = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
    this._currentQuickPick = quickPick;
    quickPick.items = this.getItems(contextKeyService, keybindingService);
    quickPick.ignoreFocusOut = true;
    quickPick.hideInput = true;
    quickPick.title = localize(5999, null);
    const closeButton = {
      alwaysVisible: true,
      iconClass: ThemeIcon.asClassName(Codicon.close),
      tooltip: localize(5992, null)
    };
    const resetButton = {
      alwaysVisible: true,
      iconClass: ThemeIcon.asClassName(Codicon.discard),
      tooltip: localize(6072, null)
    };
    quickPick.buttons = [
      resetButton,
      closeButton
    ];
    let selectedItem = void 0;
    disposables.add(contextKeyService.onDidChangeContext((changeEvent) => {
      if (changeEvent.affectsSome(LayoutContextKeySet)) {
        quickPick.items = this.getItems(contextKeyService, keybindingService);
        if (selectedItem) {
          quickPick.activeItems = quickPick.items.filter((item) => item.id === selectedItem?.id);
        }
        setTimeout(() => quickInputService.focus(), 0);
      }
    }));
    disposables.add(quickPick.onDidAccept((event) => {
      if (quickPick.selectedItems.length) {
        selectedItem = quickPick.selectedItems[0];
        commandService.executeCommand(selectedItem.id);
      }
    }));
    disposables.add(quickPick.onDidTriggerItemButton((event) => {
      if (event.item) {
        selectedItem = event.item;
        commandService.executeCommand(selectedItem.id);
      }
    }));
    disposables.add(quickPick.onDidTriggerButton((button) => {
      if (button === closeButton) {
        quickPick.hide();
      } else if (button === resetButton) {
        const resetSetting = (id2) => {
          const config = configurationService.inspect(id2);
          configurationService.updateValue(id2, config.defaultValue);
        };
        resetSetting("workbench.activityBar.location");
        resetSetting("workbench.sideBar.location");
        resetSetting("workbench.statusBar.visible");
        resetSetting("workbench.panel.defaultLocation");
        if (!isMacintosh || !isNative) {
          resetSetting("window.menuBarVisibility");
        }
        commandService.executeCommand("workbench.action.alignPanelCenter");
        commandService.executeCommand("workbench.action.alignQuickInputTop");
      }
    }));
    disposables.add(quickPick.onDidHide(() => {
      quickPick.dispose();
    }));
    disposables.add(quickPick.onDispose(() => {
      this._currentQuickPick = void 0;
      disposables.dispose();
    }));
    quickPick.show();
  }
});
export { isContextualLayoutVisualIcon, menubarIcon, activityBarLeftIcon, activityBarRightIcon, panelLeftIcon, panelLeftOffIcon, panelRightIcon, panelRightOffIcon, panelIcon2, statusBarIcon, panelAlignmentLeftIcon, panelAlignmentRightIcon, panelAlignmentCenterIcon, panelAlignmentJustifyIcon, quickInputAlignmentTopIcon, quickInputAlignmentCenterIcon, fullscreenIcon, centerLayoutIcon, zenModeIcon, ToggleActivityBarVisibilityActionId, sidebarPositionConfigurationKey, MoveSidebarPositionAction, MoveSidebarRightAction, MoveSidebarLeftAction, ToggleSidebarPositionAction, configureLayoutIcon, ToggleSidebarVisibilityAction, ToggleStatusbarVisibilityAction, AbstractSetShowTabsAction, HideEditorTabsAction, ZenHideEditorTabsAction, ShowMultipleEditorTabsAction, ZenShowMultipleEditorTabsAction, ShowSingleEditorTabAction, ZenShowSingleEditorTabAction, EditorActionsTitleBarAction, EditorActionsDefaultAction, HideEditorActionsAction, ShowEditorActionsAction, ConfigureEditorTabsAction, ConfigureEditorAction, MoveFocusedViewAction, BaseResizeViewAction, IncreaseViewSizeAction, IncreaseViewWidthAction, IncreaseViewHeightAction, DecreaseViewSizeAction, DecreaseViewWidthAction, DecreaseViewHeightAction, CreateToggleLayoutItem, CreateOptionLayoutItem, ToggleVisibilityActions, MoveSideBarActions, AlignPanelActions, QuickInputActions, MiscLayoutOptions, LayoutContextKeySet, EditorActionsInTitleBar };
