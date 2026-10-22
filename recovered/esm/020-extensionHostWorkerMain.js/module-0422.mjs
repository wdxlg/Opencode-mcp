// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookEditors.ts
import { Emitter } from "./module-0019.mjs";
import { NotebookRange2, ViewColumn2 } from "./module-0239.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0045.mjs";


// src/vs/workbench/api/common/extHostNotebookEditors.ts
var ExtHostNotebookEditors = class {
  constructor(_logService, _notebooksAndEditors) {
    this._logService = _logService;
    this._notebooksAndEditors = _notebooksAndEditors;
    this._onDidChangeNotebookEditorSelection = new Emitter();
    this._onDidChangeNotebookEditorVisibleRanges = new Emitter();
    this.onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
    this.onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
  }
  $acceptEditorPropertiesChanged(id2, data2) {
    this._logService.debug("ExtHostNotebook#$acceptEditorPropertiesChanged", id2, data2);
    const editor = this._notebooksAndEditors.getEditorById(id2);
    if (data2.visibleRanges) {
      editor._acceptVisibleRanges(data2.visibleRanges.ranges.map(NotebookRange2.to));
    }
    if (data2.selections) {
      editor._acceptSelections(data2.selections.selections.map(NotebookRange2.to));
    }
    if (data2.visibleRanges) {
      this._onDidChangeNotebookEditorVisibleRanges.fire({
        notebookEditor: editor.apiEditor,
        visibleRanges: editor.apiEditor.visibleRanges
      });
    }
    if (data2.selections) {
      this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
        notebookEditor: editor.apiEditor,
        selections: editor.apiEditor.selections
      }));
    }
  }
  $acceptEditorViewColumns(data2) {
    for (const id2 in data2) {
      const editor = this._notebooksAndEditors.getEditorById(id2);
      editor._acceptViewColumn(ViewColumn2.to(data2[id2]));
    }
  }
};

ExtHostNotebookEditors = __decorateClass([
  __decorateParam(0, ILogService)
], ExtHostNotebookEditors);
export { ExtHostNotebookEditors };
