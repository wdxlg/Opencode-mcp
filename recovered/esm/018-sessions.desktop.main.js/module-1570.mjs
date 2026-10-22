// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/actions/common/menuResetAction.ts
import { Action2, IMenuService } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/actions/common/menuResetAction.ts
var MenuHiddenStatesReset = class extends Action2 {
  constructor() {
    super({
      id: "menu.resetHiddenStates",
      title: localize2(1842, "Reset All Menus"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IMenuService).resetHiddenStates();
    accessor.get(ILogService).info("did RESET all menu hidden states");
  }
};
export { MenuHiddenStatesReset };
