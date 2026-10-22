// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/bulkCellEdits.ts
import { ResourceEdit } from "./module-0537.mjs";
import { URI } from "./module-0032.mjs";
import { isObject } from "./module-0010.mjs";
import { CellUri } from "./module-0911.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { compare } from "./module-0030.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/bulkCellEdits.ts
var ResourceNotebookCellEdit = class _ResourceNotebookCellEdit extends ResourceEdit {
  constructor(resource, cellEdit, notebookVersionId = void 0, metadata) {
    super(metadata);
    this.resource = resource;
    this.cellEdit = cellEdit;
    this.notebookVersionId = notebookVersionId;
  }
  static is(candidate) {
    if (candidate instanceof _ResourceNotebookCellEdit) {
      return true;
    }
    return URI.isUri(candidate.resource) && isObject(candidate.cellEdit);
  }
  static lift(edit3) {
    if (edit3 instanceof _ResourceNotebookCellEdit) {
      return edit3;
    }
    return new _ResourceNotebookCellEdit(edit3.resource, edit3.cellEdit, edit3.notebookVersionId, edit3.metadata);
  }
};

var BulkCellEdits = class {
  constructor(_undoRedoGroup, undoRedoSource, _progress, _token, _edits, _editorService, _notebookModelService) {
    this._undoRedoGroup = _undoRedoGroup;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._editorService = _editorService;
    this._notebookModelService = _notebookModelService;
    this._edits = this._edits.map((e4) => {
      if (e4.resource.scheme === CellUri.scheme) {
        const uri4 = CellUri.parse(e4.resource)?.notebook;
        if (!uri4) {
          throw new Error(`Invalid notebook URI: ${e4.resource}`);
        }
        return new ResourceNotebookCellEdit(uri4, e4.cellEdit, e4.notebookVersionId, e4.metadata);
      } else {
        return e4;
      }
    });
  }
  async apply() {
    const resources = [];
    const editsByNotebook = groupBy2(this._edits, (a, b) => compare(a.resource.toString(), b.resource.toString()));
    for (const group2 of editsByNotebook) {
      if (this._token.isCancellationRequested) {
        break;
      }
      const [first2] = group2;
      const ref = await this._notebookModelService.resolve(first2.resource);
      if (typeof first2.notebookVersionId === "number" && ref.object.notebook.versionId !== first2.notebookVersionId) {
        ref.dispose();
        throw new Error(`Notebook '${first2.resource}' has changed in the meantime`);
      }
      const edits = group2.map((entry) => entry.cellEdit);
      const computeUndo = !ref.object.isReadonly();
      const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
      const initialSelectionState = editor?.textModel?.uri.toString() === ref.object.notebook.uri.toString() ? {
        kind: 1 /* Index */,
        focus: editor.getFocus(),
        selections: editor.getSelections()
      } : void 0;
      ref.object.notebook.applyEdits(edits, true, initialSelectionState, () => void 0, this._undoRedoGroup, computeUndo);
      ref.dispose();
      this._progress.report(void 0);
      resources.push(first2.resource);
    }
    return resources;
  }
};

BulkCellEdits = __decorateClass([
  __decorateParam(5, IEditorService),
  __decorateParam(6, INotebookEditorModelResolverService)
], BulkCellEdits);
export { ResourceNotebookCellEdit, BulkCellEdits };
