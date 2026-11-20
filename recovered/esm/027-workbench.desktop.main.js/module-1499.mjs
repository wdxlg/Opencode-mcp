// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/panel/panelActions.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { IsAuxiliaryWindowContext, PanelAlignmentContext, PanelMaximizedContext, PanelPositionContext, PanelVisibleContext } from "./module-0949.mjs";
import { Categories } from "./module-0847.mjs";
import { IWorkbenchLayoutService, isHorizontal, positionToString } from "./module-1118.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { SwitchCompositeViewAction } from "./module-1497.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/browser/parts/panel/panelActions.ts
var maximizeIcon2 = registerIcon("panel-maximize", Codicon.screenFull, localize(6880, null));

var closeIcon2 = registerIcon("panel-close", Codicon.close, localize(6875, null));

var panelIcon = registerIcon("panel-layout-icon", Codicon.layoutPanel, localize(6901, null));

var panelOffIcon = registerIcon("panel-layout-icon-off", Codicon.layoutPanelOff, localize(6902, null));

var TogglePanelAction = class _TogglePanelAction extends Action2 {
  static {
    this.ID = "workbench.action.togglePanel";
  }
  static {
    this.LABEL = localize2(6903, "Toggle Panel Visibility");
  }
  constructor() {
    super({
      id: _TogglePanelAction.ID,
      title: _TogglePanelAction.LABEL,
      toggled: {
        condition: PanelVisibleContext,
        title: localize(6876, null),
        icon: closeIcon2,
        mnemonicTitle: localize(6883, null)
      },
      icon: closeIcon2,
      f1: true,
      category: Categories.View,
      metadata: {
        description: localize(6887, null)
      },
      keybinding: { primary: 2048 /* CtrlCmd */ | 40 /* KeyJ */, weight: 200 /* WorkbenchContrib */ },
      menu: [
        {
          id: MenuId.MenubarAppearanceMenu,
          group: "2_workbench_layout",
          order: 5
        },
        {
          id: MenuId.LayoutControlMenuSubmenu,
          group: "0_workbench_layout",
          order: 4
        }
      ]
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */), "workbench.parts.panel" /* PANEL_PART */);
  }
};

registerAction2(TogglePanelAction);

MenuRegistry.appendMenuItem(MenuId.PanelTitle, {
  command: {
    id: TogglePanelAction.ID,
    title: localize(6876, null),
    icon: closeIcon2
  },
  group: "navigation",
  order: 2
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closePanel",
      title: localize2(6877, "Hide Panel"),
      category: Categories.View,
      precondition: PanelVisibleContext,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.panel" /* PANEL_PART */);
  }
});

registerAction2(class extends Action2 {
  static {
    this.ID = "workbench.action.focusPanel";
  }
  static {
    this.LABEL = localize(6878, null);
  }
  constructor() {
    super({
      id: "workbench.action.focusPanel",
      title: localize2(6879, "Focus into Panel"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    if (!layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      layoutService.setPartHidden(false, "workbench.parts.panel" /* PANEL_PART */);
    }
    const panel = paneCompositeService.getActivePaneComposite(1 /* Panel */);
    panel?.focus();
  }
});

var PositionPanelActionId = {
  LEFT: "workbench.action.positionPanelLeft",
  RIGHT: "workbench.action.positionPanelRight",
  BOTTOM: "workbench.action.positionPanelBottom",
  TOP: "workbench.action.positionPanelTop"
};

var AlignPanelActionId = {
  LEFT: "workbench.action.alignPanelLeft",
  RIGHT: "workbench.action.alignPanelRight",
  CENTER: "workbench.action.alignPanelCenter",
  JUSTIFY: "workbench.action.alignPanelJustify"
};

function createPanelActionConfig(id2, title, shortLabel, value2, when) {
  return {
    id: id2,
    title,
    shortLabel,
    value: value2,
    when
  };
}

function createPositionPanelActionConfig(id2, title, shortLabel, position2) {
  return createPanelActionConfig(id2, title, shortLabel, position2, PanelPositionContext.notEqualsTo(positionToString(position2)));
}

function createAlignmentPanelActionConfig(id2, title, shortLabel, alignment) {
  return createPanelActionConfig(id2, title, shortLabel, alignment, PanelAlignmentContext.notEqualsTo(alignment));
}

var PositionPanelActionConfigs = [
  createPositionPanelActionConfig(PositionPanelActionId.TOP, localize2(6896, "Move Panel To Top"), localize(6897, null), 3 /* TOP */),
  createPositionPanelActionConfig(PositionPanelActionId.LEFT, localize2(6892, "Move Panel Left"), localize(6893, null), 0 /* LEFT */),
  createPositionPanelActionConfig(PositionPanelActionId.RIGHT, localize2(6894, "Move Panel Right"), localize(6895, null), 1 /* RIGHT */),
  createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, localize2(6890, "Move Panel To Bottom"), localize(6891, null), 2 /* BOTTOM */)
];

var AlignPanelActionConfigs = [
  createAlignmentPanelActionConfig(AlignPanelActionId.LEFT, localize2(6871, "Set Panel Alignment to Left"), localize(6872, null), "left"),
  createAlignmentPanelActionConfig(AlignPanelActionId.RIGHT, localize2(6873, "Set Panel Alignment to Right"), localize(6874, null), "right"),
  createAlignmentPanelActionConfig(AlignPanelActionId.CENTER, localize2(6867, "Set Panel Alignment to Center"), localize(6868, null), "center"),
  createAlignmentPanelActionConfig(AlignPanelActionId.JUSTIFY, localize2(6869, "Set Panel Alignment to Justify"), localize(6870, null), "justify")
];

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.PanelPositionMenu,
  title: localize(6889, null),
  group: "3_workbench_layout_move",
  order: 4
});

PositionPanelActionConfigs.forEach((positionPanelAction, index2) => {
  const { id: id2, title, shortLabel, value: value2, when } = positionPanelAction;
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: id2,
        title,
        category: Categories.View,
        f1: true
      });
    }
    run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      layoutService.setPanelPosition(value2 === void 0 ? 2 /* BOTTOM */ : value2);
    }
  });
  MenuRegistry.appendMenuItem(MenuId.PanelPositionMenu, {
    command: {
      id: id2,
      title: shortLabel,
      toggled: when.negate()
    },
    order: 5 + index2
  });
});

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
  submenu: MenuId.PanelAlignmentMenu,
  title: localize(6866, null),
  group: "3_workbench_layout_move",
  order: 5
});

AlignPanelActionConfigs.forEach((alignPanelAction) => {
  const { id: id2, title, shortLabel, value: value2, when } = alignPanelAction;
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: id2,
        title,
        category: Categories.View,
        toggled: when.negate(),
        f1: true
      });
    }
    run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      layoutService.setPanelAlignment(value2 === void 0 ? "center" : value2);
    }
  });
  MenuRegistry.appendMenuItem(MenuId.PanelAlignmentMenu, {
    command: {
      id: id2,
      title: shortLabel,
      toggled: when.negate()
    },
    order: 5
  });
});

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.previousPanelView",
      title: localize2(6898, "Previous Panel View"),
      category: Categories.View,
      f1: true
    }, 1 /* Panel */, -1);
  }
});

registerAction2(class extends SwitchCompositeViewAction {
  constructor() {
    super({
      id: "workbench.action.nextPanelView",
      title: localize2(6886, "Next Panel View"),
      category: Categories.View,
      f1: true
    }, 1 /* Panel */, 1);
  }
});

var panelMaximizationSupportedWhen = ContextKeyExpr.or(PanelAlignmentContext.isEqualTo("center"), ContextKeyExpr.and(PanelPositionContext.notEqualsTo("bottom"), PanelPositionContext.notEqualsTo("top")));

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.toggleMaximizedPanel",
      title: localize2(6899, "Toggle Maximized Panel"),
      tooltip: localize(6881, null),
      category: Categories.View,
      f1: true,
      icon: maximizeIcon2,
      precondition: panelMaximizationSupportedWhen,
      toggled: {
        condition: PanelMaximizedContext,
        tooltip: localize(6882, null)
      },
      // OpenCode ae-dock-step17: 去掉底部面板标题上的最大化按钮，改为 AE 式按 ` 键切换最大化
      menu: []
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const notificationService = accessor.get(INotificationService);
    if (layoutService.getPanelAlignment() !== "center" && isHorizontal(layoutService.getPanelPosition())) {
      notificationService.warn(localize(6888, null));
      return;
    }
    if (!layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      layoutService.setPartHidden(false, "workbench.parts.panel" /* PANEL_PART */);
      if (!layoutService.isPanelMaximized()) {
        layoutService.toggleMaximizedPanel();
      }
    } else {
      layoutService.toggleMaximizedPanel();
    }
  }
});

MenuRegistry.appendMenuItems([
  {
    id: MenuId.LayoutControlMenu,
    item: {
      group: "navigation",
      command: {
        id: TogglePanelAction.ID,
        title: localize(6900, null),
        icon: panelOffIcon,
        toggled: { condition: PanelVisibleContext, icon: panelIcon }
      },
      when: ContextKeyExpr.and(
        IsAuxiliaryWindowContext.negate(),
        ContextKeyExpr.or(
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "toggles"),
          ContextKeyExpr.equals("config.workbench.layoutControl.type", "both")
        )
      ),
      order: 1
    }
  }
]);

var MoveViewsBetweenPanelsAction = class extends Action2 {
  constructor(source, destination, desc) {
    super(desc);
    this.source = source;
    this.destination = destination;
  }
  run(accessor, ...args2) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const viewsService = accessor.get(IViewsService);
    const srcContainers = viewDescriptorService.getViewContainersByLocation(this.source);
    const destContainers = viewDescriptorService.getViewContainersByLocation(this.destination);
    if (srcContainers.length) {
      const activeViewContainer = viewsService.getVisibleViewContainer(this.source);
      srcContainers.forEach((viewContainer5) => viewDescriptorService.moveViewContainerToLocation(viewContainer5, this.destination, void 0, this.desc.id));
      layoutService.setPartHidden(false, this.destination === 1 /* Panel */ ? "workbench.parts.panel" /* PANEL_PART */ : "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
      if (activeViewContainer && destContainers.length === 0) {
        viewsService.openViewContainer(activeViewContainer.id, true);
      }
    }
  }
};

var MovePanelToSidePanelAction = class _MovePanelToSidePanelAction extends MoveViewsBetweenPanelsAction {
  static {
    this.ID = "workbench.action.movePanelToSidePanel";
  }
  constructor() {
    super(1 /* Panel */, 2 /* AuxiliaryBar */, {
      id: _MovePanelToSidePanelAction.ID,
      title: localize2(6884, "Move Panel Views To Secondary Side Bar"),
      category: Categories.View,
      f1: false
    });
  }
};

var MovePanelToSecondarySideBarAction = class _MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
  static {
    this.ID = "workbench.action.movePanelToSecondarySideBar";
  }
  constructor() {
    super(1 /* Panel */, 2 /* AuxiliaryBar */, {
      id: _MovePanelToSecondarySideBarAction.ID,
      title: localize2(6884, "Move Panel Views To Secondary Side Bar"),
      category: Categories.View,
      f1: true
    });
  }
};

registerAction2(MovePanelToSidePanelAction);

registerAction2(MovePanelToSecondarySideBarAction);

var MoveSidePanelToPanelAction = class _MoveSidePanelToPanelAction extends MoveViewsBetweenPanelsAction {
  static {
    this.ID = "workbench.action.moveSidePanelToPanel";
  }
  constructor() {
    super(2 /* AuxiliaryBar */, 1 /* Panel */, {
      id: _MoveSidePanelToPanelAction.ID,
      title: localize2(6885, "Move Secondary Side Bar Views To Panel"),
      category: Categories.View,
      f1: false
    });
  }
};

var MoveSecondarySideBarToPanelAction = class _MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
  static {
    this.ID = "workbench.action.moveSecondarySideBarToPanel";
  }
  constructor() {
    super(2 /* AuxiliaryBar */, 1 /* Panel */, {
      id: _MoveSecondarySideBarToPanelAction.ID,
      title: localize2(6885, "Move Secondary Side Bar Views To Panel"),
      category: Categories.View,
      f1: true
    });
  }
};

registerAction2(MoveSidePanelToPanelAction);

registerAction2(MoveSecondarySideBarToPanelAction);
export { createPanelActionConfig, createPositionPanelActionConfig, createAlignmentPanelActionConfig, maximizeIcon2, closeIcon2, panelIcon, panelOffIcon, TogglePanelAction, PositionPanelActionId, AlignPanelActionId, PositionPanelActionConfigs, AlignPanelActionConfigs, panelMaximizationSupportedWhen, MoveViewsBetweenPanelsAction, MovePanelToSidePanelAction, MovePanelToSecondarySideBarAction, MoveSidePanelToPanelAction, MoveSecondarySideBarToPanelAction };
