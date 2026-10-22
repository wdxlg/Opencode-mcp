// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsSymbol.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsSymbol.ts
registerAction2(class ShowAllSymbolsAction extends Action2 {
  static {
    this.ID = "workbench.action.showAllSymbols";
  }
  static {
    this.LABEL = localize(19131, null);
  }
  static {
    this.ALL_SYMBOLS_PREFIX = "#";
  }
  constructor() {
    super({
      id: "workbench.action.showAllSymbols" /* ShowAllSymbolsActionId */,
      title: {
        ...localize2(19132, "Go to Symbol in Workspace..."),
        mnemonicTitle: localize(19130, null)
      },
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 50 /* KeyT */
      },
      menu: {
        id: MenuId.MenubarGoMenu,
        group: "3_global_nav",
        order: 2
      }
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
  }
});
export {};
