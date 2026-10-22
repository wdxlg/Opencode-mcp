// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookAccessibleView.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { NOTEBOOK_CELL_LIST_FOCUSED } from "./module-1844.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { getAllOutputsText } from "./module-1889.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookAccessibleView.ts
var NotebookAccessibleView = class {
  constructor() {
    this.priority = 100;
    this.name = "notebook";
    this.type = "view" /* View */;
    this.when = ContextKeyExpr.and(NOTEBOOK_CELL_LIST_FOCUSED, InputFocusedContext.toNegated());
  }
  getProvider(accessor) {
    const editorService = accessor.get(IEditorService);
    return getAccessibleOutputProvider(editorService);
  }
};

function getAccessibleOutputProvider(editorService) {
  const activePane = editorService.activeEditorPane;
  const notebookEditor = getNotebookEditorFromEditorPane(activePane);
  const notebookViewModel = notebookEditor?.getViewModel();
  const selections = notebookViewModel?.getSelections();
  const notebookDocument = notebookViewModel?.notebookDocument;
  if (!selections || !notebookDocument || !notebookEditor?.textModel) {
    return;
  }
  const viewCell = notebookViewModel.viewCells[selections[0].start];
  const outputContent = getAllOutputsText(notebookDocument, viewCell);
  if (!outputContent) {
    return;
  }
  return new AccessibleContentProvider(
    "notebook" /* Notebook */,
    { type: "view" /* View */ },
    () => {
      return outputContent;
    },
    () => {
      notebookEditor?.setFocus(selections[0]);
      notebookEditor.focus();
    },
    "accessibility.verbosity.notebook" /* Notebook */
  );
}
export { getAccessibleOutputProvider, NotebookAccessibleView };
