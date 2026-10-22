// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints.ts
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { hasKey } from "./module-0010.mjs";
import { Schemas } from "./module-0033.mjs";
import { CellUri } from "./module-0911.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookBreakpoints.ts
var NotebookBreakpoints = class extends Disposable {
  constructor(_debugService, _notebookService, _editorService) {
    super();
    this._debugService = _debugService;
    this._editorService = _editorService;
    const listeners = new ResourceMap();
    this._register(_notebookService.onWillAddNotebookDocument((model) => {
      listeners.set(model.uri, model.onWillAddRemoveCells((e4) => {
        const debugModel = this._debugService.getModel();
        if (!debugModel.getBreakpoints().length) {
          return;
        }
        if (e4.rawEvent.kind !== 1 /* ModelChange */) {
          return;
        }
        for (const change of e4.rawEvent.changes) {
          const [start, deleteCount] = change;
          if (deleteCount > 0) {
            const deleted = model.cells.slice(start, start + deleteCount);
            for (const deletedCell of deleted) {
              const cellBps = debugModel.getBreakpoints({ uri: deletedCell.uri });
              cellBps.forEach((cellBp) => this._debugService.removeBreakpoints(cellBp.getId()));
            }
          }
        }
      }));
    }));
    this._register(_notebookService.onWillRemoveNotebookDocument((model) => {
      this.updateBreakpoints(model);
      listeners.get(model.uri)?.dispose();
      listeners.delete(model.uri);
    }));
    this._register(this._debugService.getModel().onDidChangeBreakpoints((e4) => {
      const newCellBp = e4?.added?.find((bp) => hasKey(bp, { uri: true }) && bp.uri.scheme === Schemas.vscodeNotebookCell);
      if (newCellBp) {
        const parsed = CellUri.parse(newCellBp.uri);
        if (!parsed) {
          return;
        }
        const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        if (!editor || !editor.hasModel() || editor.textModel.uri.toString() !== parsed.notebook.toString()) {
          return;
        }
        const cell = editor.getCellByHandle(parsed.handle);
        if (!cell) {
          return;
        }
        editor.focusElement(cell);
      }
    }));
  }
  updateBreakpoints(model) {
    const bps = this._debugService.getModel().getBreakpoints();
    if (!bps.length || !model.cells.length) {
      return;
    }
    const idxMap = new ResourceMap();
    model.cells.forEach((cell, i2) => {
      idxMap.set(cell.uri, i2);
    });
    bps.forEach((bp) => {
      const idx = idxMap.get(bp.uri);
      if (typeof idx !== "number") {
        return;
      }
      const notebook = CellUri.parse(bp.uri)?.notebook;
      if (!notebook) {
        return;
      }
      const newUri = CellUri.generate(notebook, idx);
      if (isEqual2(newUri, bp.uri)) {
        return;
      }
      this._debugService.removeBreakpoints(bp.getId());
      this._debugService.addBreakpoints(newUri, [
        {
          column: bp.column,
          condition: bp.condition,
          enabled: bp.enabled,
          hitCondition: bp.hitCondition,
          logMessage: bp.logMessage,
          lineNumber: bp.lineNumber
        }
      ]);
    });
  }
};

NotebookBreakpoints = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IEditorService)
], NotebookBreakpoints);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NotebookBreakpoints, 3 /* Restored */);
export { NotebookBreakpoints };
