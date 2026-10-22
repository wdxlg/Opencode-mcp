// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookEditors.ts
import { Emitter } from "./module-0017.mjs";
import { NotebookRange2, ViewColumn2 } from "./module-0245.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0062.mjs";


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
  $acceptEditorPropertiesChanged(id2, data) {
    this._logService.debug("ExtHostNotebook#$acceptEditorPropertiesChanged", id2, data);
    const editor = this._notebooksAndEditors.getEditorById(id2);
    if (data.visibleRanges) {
      editor._acceptVisibleRanges(data.visibleRanges.ranges.map(NotebookRange2.to));
    }
    if (data.selections) {
      editor._acceptSelections(data.selections.selections.map(NotebookRange2.to));
    }
    if (data.visibleRanges) {
      this._onDidChangeNotebookEditorVisibleRanges.fire({
        notebookEditor: editor.apiEditor,
        visibleRanges: editor.apiEditor.visibleRanges
      });
    }
    if (data.selections) {
      this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
        notebookEditor: editor.apiEditor,
        selections: editor.apiEditor.selections
      }));
    }
  }
  $acceptEditorViewColumns(data) {
    for (const id2 in data) {
      const editor = this._notebooksAndEditors.getEditorById(id2);
      editor._acceptViewColumn(ViewColumn2.to(data[id2]));
    }
  }
};

ExtHostNotebookEditors = __decorateClass([
  __decorateParam(0, ILogService)
], ExtHostNotebookEditors);
export { ExtHostNotebookEditors };
