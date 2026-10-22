// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/layoutActions.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { AuxiliaryBarVisibleContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext, IsWindowAlwaysOnTopContext, PanelVisibleContext, SideBarVisibleContext } from "./module-0950.mjs";
import { Categories } from "./module-0847.mjs";
import { Menus } from "./module-3437.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CustomViewVisibleContext, IsPhoneLayoutContext, SessionsWelcomeVisibleContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { alert } from "./module-0076.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { TogglePanelAction } from "./module-1558.mjs";


// src/vs/sessions/browser/layoutActions.ts
var panelCloseIcon = registerIcon("agent-panel-close", Codicon.close, localize(3755, null));

var sidebarToggleClosedIcon = registerIcon("agent-sidebar-toggle-closed", Codicon.layoutSidebarLeftOff, localize(3756, null));

var sidebarToggleOpenIcon = registerIcon("agent-sidebar-toggle-open", Codicon.layoutSidebarLeft, localize(3757, null));

var ToggleSidebarVisibilityAction2 = class _ToggleSidebarVisibilityAction extends Action2 {
  static {
    this.ID = "workbench.action.agentToggleSidebarVisibility";
  }
  constructor() {
    super({
      id: _ToggleSidebarVisibilityAction.ID,
      title: localize2(3768, "Toggle Side Bar"),
      icon: sidebarToggleClosedIcon,
      toggled: {
        condition: SideBarVisibleContext,
        icon: sidebarToggleOpenIcon
      },
      metadata: {
        description: localize(3762, null)
      },
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: 2048 /* CtrlCmd */ | 32 /* KeyB */
      },
      menu: [
        {
          id: Menus.TitleBarLeftLayout,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated())
        }
      ]
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const isCurrentlyVisible = layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */);
    layoutService.setPartHidden(isCurrentlyVisible, "workbench.parts.sidebar" /* SIDEBAR_PART */);
    const alertMessage = isCurrentlyVisible ? localize(3766, null) : localize(3767, null);
    alert(alertMessage);
  }
};

registerAction2(ToggleSidebarVisibilityAction2);

MenuRegistry.appendMenuItem(Menus.TitleBarAccessibility, {
  command: {
    id: "editor.action.toggleScreenReaderAccessibilityMode",
    title: localize(3763, null),
    tooltip: localize(3759, null)
  },
  group: "navigation",
  order: 0,
  when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, IsPhoneLayoutContext.negate())
});

var titleBarPanelWhen = ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), IsPhoneLayoutContext.negate());

MenuRegistry.appendMenuItem(Menus.TitleBarSessionMenu, {
  command: {
    id: TogglePanelAction.ID,
    title: localize(3764, null),
    icon: Codicon.layoutPanelOff,
    precondition: CustomViewVisibleContext.negate()
  },
  group: "navigation",
  order: 10,
  when: ContextKeyExpr.and(titleBarPanelWhen, PanelVisibleContext.toNegated())
});

MenuRegistry.appendMenuItem(Menus.TitleBarSessionMenu, {
  command: {
    id: TogglePanelAction.ID,
    title: localize(3760, null),
    icon: Codicon.layoutPanel,
    precondition: CustomViewVisibleContext.negate()
  },
  group: "navigation",
  order: 10,
  when: ContextKeyExpr.and(titleBarPanelWhen, PanelVisibleContext)
});

var editorTitleAuxiliaryBarWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  IsAuxiliaryWindowContext.toNegated(),
  CustomViewVisibleContext.negate(),
  IsTopRightEditorGroupContext
);

var isSinglePaneDetailPanelDisabled = SinglePaneLayoutEnabledContext.negate();

MenuRegistry.appendMenuItem(MenuId.EditorTitleLayout, {
  command: {
    id: "workbench.action.toggleAuxiliaryBar",
    title: localize(3761, null),
    icon: Codicon.rightPanelHide
  },
  group: "navigation",
  order: 99.5,
  when: ContextKeyExpr.and(editorTitleAuxiliaryBarWhen, AuxiliaryBarVisibleContext, isSinglePaneDetailPanelDisabled)
});

MenuRegistry.appendMenuItem(MenuId.EditorTitleLayout, {
  command: {
    id: "workbench.action.toggleAuxiliaryBar",
    title: localize(3765, null),
    icon: Codicon.rightPanelShow
  },
  group: "navigation",
  order: 99.5,
  when: ContextKeyExpr.and(editorTitleAuxiliaryBarWhen, AuxiliaryBarVisibleContext.toNegated(), isSinglePaneDetailPanelDisabled)
});

MenuRegistry.appendMenuItem(Menus.PanelTitle, {
  command: {
    id: "workbench.action.closePanel",
    title: localize(3758, null),
    icon: panelCloseIcon
  },
  group: "navigation",
  order: 2
});

MenuRegistry.appendMenuItem(Menus.TitleBarRightLayout, {
  command: {
    id: "workbench.action.toggleWindowAlwaysOnTop",
    title: localize(3769, null),
    icon: Codicon.pin,
    toggled: {
      condition: IsWindowAlwaysOnTopContext,
      icon: Codicon.pinned
    }
  },
  when: IsAuxiliaryWindowContext,
  group: "navigation",
  order: 0
});
export { panelCloseIcon, sidebarToggleClosedIcon, sidebarToggleOpenIcon, ToggleSidebarVisibilityAction2, titleBarPanelWhen, editorTitleAuxiliaryBarWhen, isSinglePaneDetailPanelDisabled };
