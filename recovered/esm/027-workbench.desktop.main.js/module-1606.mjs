// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/sidebar/sidebarActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { SideBarVisibleContext } from "./module-0949.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";


// src/vs/workbench/browser/parts/sidebar/sidebarActions.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.closeSidebar",
      title: localize2(6909, "Close Primary Side Bar"),
      category: Categories.View,
      f1: true,
      precondition: SideBarVisibleContext
    });
  }
  run(accessor) {
    accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.sidebar" /* SIDEBAR_PART */);
  }
});

var FocusSideBarAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.focusSideBar",
      title: localize2(6910, "Focus into Primary Side Bar"),
      category: Categories.View,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: null,
        primary: 2048 /* CtrlCmd */ | 21 /* Digit0 */
      }
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    if (!layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
      layoutService.setPartHidden(false, "workbench.parts.sidebar" /* SIDEBAR_PART */);
    }
    const viewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    viewlet?.focus();
  }
};

registerAction2(FocusSideBarAction);
export { FocusSideBarAction };
