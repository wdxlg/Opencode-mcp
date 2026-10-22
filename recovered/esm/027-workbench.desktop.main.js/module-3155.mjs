// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariableCommands.ts
import { localize } from "./module-0001.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { URI } from "./module-0032.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { INotebookService } from "./module-0926.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariableCommands.ts
var COPY_NOTEBOOK_VARIABLE_VALUE_ID = "workbench.debug.viewlet.action.copyWorkspaceVariableValue";

var COPY_NOTEBOOK_VARIABLE_VALUE_LABEL = localize(17483, null);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: COPY_NOTEBOOK_VARIABLE_VALUE_ID,
      title: COPY_NOTEBOOK_VARIABLE_VALUE_LABEL,
      f1: false
    });
  }
  run(accessor, context2) {
    const clipboardService = accessor.get(IClipboardService);
    if (context2.value) {
      clipboardService.writeText(context2.value);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "_executeNotebookVariableProvider",
      title: localize(17484, null),
      f1: false
    });
  }
  async run(accessor, resource) {
    if (!resource) {
      return [];
    }
    const uri5 = URI.revive(resource);
    const notebookKernelService = accessor.get(INotebookKernelService);
    const notebookService = accessor.get(INotebookService);
    const notebookTextModel = notebookService.getNotebookTextModel(uri5);
    if (!notebookTextModel) {
      return [];
    }
    const selectedKernel = notebookKernelService.getMatchingKernel(notebookTextModel).selected;
    if (selectedKernel && selectedKernel.hasVariableProvider) {
      const variableIterable = selectedKernel.provideVariables(notebookTextModel.uri, void 0, "named", 0, CancellationToken.None);
      const collected = [];
      for await (const variable of variableIterable) {
        collected.push(variable);
      }
      return collected;
    }
    return [];
  }
});
export { COPY_NOTEBOOK_VARIABLE_VALUE_ID, COPY_NOTEBOOK_VARIABLE_VALUE_LABEL };
