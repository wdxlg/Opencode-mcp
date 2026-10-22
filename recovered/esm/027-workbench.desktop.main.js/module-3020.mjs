// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/replEditorAccessibleView.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED } from "./module-1868.mjs";
import { IEditorService } from "./module-0934.mjs";
import { isReplEditorControl } from "./module-3014.mjs";
import { getAllOutputsText } from "./module-1912.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/notebook/browser/replEditorAccessibleView.ts
var ReplEditorAccessibleView = class {
  constructor() {
    this.priority = 100;
    this.name = "replEditorInput";
    this.type = "view" /* View */;
    this.when = ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED.negate());
  }
  getProvider(accessor) {
    const editorService = accessor.get(IEditorService);
    return getAccessibleOutputProvider2(editorService);
  }
};

function getAccessibleOutputProvider2(editorService) {
  const editorControl = editorService.activeEditorPane?.getControl();
  if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
    const notebookEditor = editorControl.notebookEditor;
    const viewModel = notebookEditor?.getViewModel();
    if (notebookEditor && viewModel) {
      const lastCellIndex = viewModel.length - 1;
      if (lastCellIndex >= 0) {
        const cell = viewModel.viewCells[lastCellIndex];
        const outputContent = getAllOutputsText(viewModel.notebookDocument, cell);
        if (outputContent) {
          return new AccessibleContentProvider(
            "notebook" /* Notebook */,
            { type: "view" /* View */ },
            () => {
              return outputContent;
            },
            () => {
              editorControl.activeCodeEditor?.focus();
            },
            "accessibility.verbosity.replEditor" /* ReplEditor */
          );
        }
      }
    }
  }
  return;
}
export { getAccessibleOutputProvider2, ReplEditorAccessibleView };
