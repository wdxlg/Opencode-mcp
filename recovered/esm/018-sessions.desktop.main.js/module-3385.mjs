// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/list/browser/list.contribution.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ListResizeColumnAction } from "./module-3384.mjs";


// src/vs/workbench/contrib/list/browser/list.contribution.ts
var ListContext = class {
  static {
    this.ID = "workbench.contrib.listContext";
  }
  constructor(contextKeyService) {
    contextKeyService.createKey("listSupportsTypeNavigation", true);
    contextKeyService.createKey("listSupportsKeyboardNavigation", true);
  }
};

ListContext = __decorateClass([
  __decorateParam(0, IContextKeyService)
], ListContext);

registerWorkbenchContribution2(ListContext.ID, ListContext, WorkbenchPhase.BlockStartup);

registerAction2(ListResizeColumnAction);
export { ListContext };
