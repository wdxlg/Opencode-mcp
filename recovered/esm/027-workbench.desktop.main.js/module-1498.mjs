// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { AuxiliaryBarMaximizedContext, AuxiliaryBarVisibleContext, IsAuxiliaryWindowContext, SecondarySideBarVisibleContext } from "./module-0949.mjs";
import { Categories } from "./module-0847.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { ViewContainerLocationToString } from "./module-1093.mjs";
import { SwitchCompositeViewAction } from "./module-1497.mjs";


// src/vs/workbench/browser/parts/auxiliarybar/auxiliaryBarActions.ts
var maximizeIcon = registerIcon("auxiliarybar-maximize", Codicon.screenFull, localize(6231, null));

var closeIcon = registerIcon("auxiliarybar-close", Codicon.close, localize(6223, null));

var auxiliaryBarRightIcon = registerIcon("auxiliarybar-right-layout-icon", Codicon.layoutSidebarRight, localize(6241, null));

var auxiliaryBarRightOffIcon = registerIcon("auxiliarybar-right-off-layout-icon", Codicon.layoutSidebarRightOff, localize(6242, null));

var auxiliaryBarLeftIcon = registerIcon("auxiliarybar-left-layout-icon", Codicon.layoutSidebarLeft, localize(6239, null));

var auxiliaryBarLeftOffIcon = registerIcon("auxiliarybar-left-off-layout-icon", Codicon.layoutSidebarLeftOff, localize(6240, null));

var ToggleAuxiliaryBarAction = class _ToggleAuxiliaryBarAction extends Action2 {
  static {
    this.ID = "workbench.action.toggleAuxiliaryBar";
  }
  static {
    this.LABEL = localize2(6238, "Toggle Secondary Side Bar Visibility");
  }
  constructor() {
    super({
      id: _ToggleAuxiliaryBarAction.ID,
      title: _ToggleAuxiliaryBarAction.LABEL,
      toggled: {
        condition: SecondarySideBarVisibleContext,
        title: localize(6224, null),
        icon: closeIcon,
        mnemonicTitle: localize(6232, null)
      },
      icon: closeIcon,
      category: Categories.View,
      metadata: {
        description: localize(6234, null)
      },
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 32 /* KeyB */
      },
      menu: [
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 1
        },
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 2
        }
      ]
    });
  }
  async run(accessor) {
    accessor.get(IWorkbenchLayoutService).toggleSecondarySideBar();
  }
};

registerAction2(ToggleAuxiliaryBarAction);

MenuRegistry.appendMenuItem(MenuId.AuxiliaryBarTitle, {
  command: {
    id: ToggleAuxiliaryBarAction.ID,
    title: localize(6224, null),
    icon: closeIcon
  },
  group: "navigation",
  order: 2,
  when: ContextKeyExpr.equals(`config.${"workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */}`, "default" /* DEFAULT */)
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeAuxiliaryBar",
      title: localize2(6225, "Hide Secondary Side Bar"),
      category: Categories.View,
      precondition: AuxiliaryBarVisibleContext,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
  }
});

registerAction2(class FocusAuxiliaryBarAction extends Action2 {
  static {
    this.ID = "workbench.action.focusAuxiliaryBar";
  }
  static {
    this.LABEL = localize2(6226, "Focus into Secondary Side Bar");
  }
  constructor() {
    super({
      id: FocusAuxiliaryBarAction.ID,
      title: FocusAuxiliaryBarAction.LABEL,
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    }
    const composite = paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */);
    composite?.focus();
  }
});

MenuRegistry.appendMenuItems([
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "navigation",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize(6244, null),
        toggled: { condition: AuxiliaryBarVisibleContext, icon: auxiliaryBarLeftIcon },
        icon: auxiliaryBarLeftOffIcon
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"),
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")
        ),
        ContextKeyExpr.equals("config.workbench.sideBar.location", "right")
      ),
      order: 0
    }
  },
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "navigation",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize(6244, null),
        toggled: { condition: AuxiliaryBarVisibleContext, icon: auxiliaryBarRightIcon },
        icon: auxiliaryBarRightOffIcon
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"),
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")
        ),
        ContextKeyExpr.equals("config.workbench.sideBar.location", "left")
      ),
      order: 2
    }
  },
  {
    id: MenuId.ViewContainerTitleContext,
    item: {
      group: "3_workbench_layout_move",
      command: {
        id: ToggleAuxiliaryBarAction.ID,
        title: localize2(6227, "Hide Secondary Side Bar")
      },
      when: ContextKeyExpr.and(AuxiliaryBarVisibleContext, ContextKeyExpr.equals("viewContainerLocation", ViewContainerLocationToString(2 /* AuxiliaryBar */))),
      order: 2
    }
  }
]);

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.previousAuxiliaryBarView",
      title: localize2(6235, "Previous Secondary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 2 /* AuxiliaryBar */, -1);
  }
});

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.nextAuxiliaryBarView",
      title: localize2(6233, "Next Secondary Side Bar View"),
      category: Categories.View,
      f1: true
    }, 2 /* AuxiliaryBar */, 1);
  }
});

var MaximizeAuxiliaryBar = class _MaximizeAuxiliaryBar extends Action2 {
  static {
    this.ID = "workbench.action.maximizeAuxiliaryBar";
  }
  constructor() {
    super({
      id: _MaximizeAuxiliaryBar.ID,
      title: localize2(6228, "Maximize Secondary Side Bar"),
      tooltip: localize(6229, null),
      category: Categories.View,
      f1: true,
      precondition: AuxiliaryBarMaximizedContext.negate()
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setAuxiliaryBarMaximized(true);
  }
};

registerAction2(MaximizeAuxiliaryBar);

var RestoreAuxiliaryBar = class _RestoreAuxiliaryBar extends Action2 {
  static {
    this.ID = "workbench.action.restoreAuxiliaryBar";
  }
  constructor() {
    super({
      id: _RestoreAuxiliaryBar.ID,
      title: localize2(6236, "Restore Secondary Side Bar"),
      tooltip: localize(6237, null),
      category: Categories.View,
      f1: true,
      precondition: AuxiliaryBarMaximizedContext,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
        win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] }
      }
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setAuxiliaryBarMaximized(false);
  }
};

registerAction2(RestoreAuxiliaryBar);

var ToggleMaximizedAuxiliaryBar = class _ToggleMaximizedAuxiliaryBar extends Action2 {
  static {
    this.ID = "workbench.action.toggleMaximizedAuxiliaryBar";
  }
  constructor() {
    super({
      id: _ToggleMaximizedAuxiliaryBar.ID,
      title: localize2(6243, "Toggle Maximized Secondary Side Bar"),
      tooltip: localize(6230, null),
      f1: true,
      category: Categories.View,
      icon: maximizeIcon,
      toggled: {
        condition: AuxiliaryBarMaximizedContext,
        tooltip: localize(6237, null)
      },
      menu: {
        id: MenuId.AuxiliaryBarTitle,
        group: "navigation",
        order: 1
      }
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.toggleMaximizedAuxiliaryBar();
  }
};

registerAction2(ToggleMaximizedAuxiliaryBar);
export { maximizeIcon, closeIcon, auxiliaryBarRightIcon, auxiliaryBarRightOffIcon, auxiliaryBarLeftIcon, auxiliaryBarLeftOffIcon, ToggleAuxiliaryBarAction, MaximizeAuxiliaryBar, RestoreAuxiliaryBar, ToggleMaximizedAuxiliaryBar };
