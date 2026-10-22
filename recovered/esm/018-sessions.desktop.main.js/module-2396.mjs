// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/controller/variablesActions.ts
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { NotebookAction } from "./module-1845.mjs";
import { localize2 } from "./module-0001.mjs";
import { variablesViewIcon } from "./module-1846.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { KERNEL_HAS_VARIABLE_PROVIDER } from "./module-1844.mjs";
import { NOTEBOOK_VARIABLE_VIEW_ENABLED } from "./module-2395.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/notebook/browser/controller/variablesActions.ts
var OPEN_VARIABLES_VIEW_COMMAND_ID = "notebook.openVariablesView";

registerAction2(class OpenVariablesViewAction extends NotebookAction {
  constructor() {
    super({
      id: OPEN_VARIABLES_VIEW_COMMAND_ID,
      title: localize2(17635, "Variables"),
      icon: variablesViewIcon,
      menu: [
        {
          id: MenuId.InteractiveToolbar,
          group: "navigation",
          when: ContextKeyExpr.and(
            KERNEL_HAS_VARIABLE_PROVIDER,
            // jupyter extension currently contributes their own goto variables button
            ContextKeyExpr.notEquals("jupyter.kernel.isjupyter", true),
            NOTEBOOK_VARIABLE_VIEW_ENABLED
          )
        },
        {
          id: MenuId.EditorTitle,
          order: -1,
          group: "navigation",
          when: ContextKeyExpr.and(
            KERNEL_HAS_VARIABLE_PROVIDER,
            // jupyter extension currently contributes their own goto variables button
            ContextKeyExpr.notEquals("jupyter.kernel.isjupyter", true),
            ContextKeyExpr.notEquals("config.notebook.globalToolbar", true),
            NOTEBOOK_VARIABLE_VIEW_ENABLED
          )
        },
        {
          id: MenuId.NotebookToolbar,
          order: -1,
          group: "navigation",
          when: ContextKeyExpr.and(
            KERNEL_HAS_VARIABLE_PROVIDER,
            // jupyter extension currently contributes their own goto variables button
            ContextKeyExpr.notEquals("jupyter.kernel.isjupyter", true),
            ContextKeyExpr.equals("config.notebook.globalToolbar", true),
            NOTEBOOK_VARIABLE_VIEW_ENABLED
          )
        }
      ]
    });
  }
  async runWithContext(accessor, context2) {
    const variableViewId = "workbench.notebook.variables";
    accessor.get(IViewsService).openView(variableViewId, true);
  }
});
export { OPEN_VARIABLES_VIEW_COMMAND_ID };
