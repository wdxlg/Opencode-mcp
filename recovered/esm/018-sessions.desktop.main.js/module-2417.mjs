// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo.ts
import { Disposable } from "./module-0012.mjs";
import { RedoCommand, UndoCommand } from "./module-0097.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo.ts
var NotebookUndoRedoContribution = class extends Disposable {
  constructor(_editorService) {
    super();
    this._editorService = _editorService;
    const PRIORITY3 = 105;
    this._register(UndoCommand.addImplementation(PRIORITY3, "notebook-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      const viewModel = editor?.getViewModel();
      if (editor && editor.hasEditorFocus() && editor.hasModel() && viewModel) {
        return viewModel.undo().then((cellResources) => {
          if (cellResources?.length) {
            for (let i2 = 0; i2 < editor.getLength(); i2++) {
              const cell = editor.cellAt(i2);
              if (cell.cellKind === 1 /* Markup */ && cellResources.find((resource) => resource.fragment === cell.model.uri.fragment)) {
                cell.updateEditState(1 /* Editing */, "undo");
              }
            }
            editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
          }
        });
      }
      return false;
    }));
    this._register(RedoCommand.addImplementation(PRIORITY3, "notebook-undo-redo", () => {
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      const viewModel = editor?.getViewModel();
      if (editor && editor.hasEditorFocus() && editor.hasModel() && viewModel) {
        return viewModel.redo().then((cellResources) => {
          if (cellResources?.length) {
            for (let i2 = 0; i2 < editor.getLength(); i2++) {
              const cell = editor.cellAt(i2);
              if (cell.cellKind === 1 /* Markup */ && cellResources.find((resource) => resource.fragment === cell.model.uri.fragment)) {
                cell.updateEditState(1 /* Editing */, "redo");
              }
            }
            editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
          }
        });
      }
      return false;
    }));
  }
  static {
    this.ID = "workbench.contrib.notebookUndoRedo";
  }
};

NotebookUndoRedoContribution = __decorateClass([
  __decorateParam(0, IEditorService)
], NotebookUndoRedoContribution);

registerWorkbenchContribution2(NotebookUndoRedoContribution.ID, NotebookUndoRedoContribution, WorkbenchPhase.BlockRestore);
export { NotebookUndoRedoContribution };
