// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookModifiedCellDecorator.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { overviewRulerModifiedForeground } from "./module-1079.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookModifiedCellDecorator.ts
var NotebookModifiedCellDecorator = class extends Disposable {
  constructor(notebookEditor) {
    super();
    this.notebookEditor = notebookEditor;
    this.decorators = this._register(new DisposableStore());
  }
  apply(diffInfo) {
    const model = this.notebookEditor.textModel;
    if (!model) {
      return;
    }
    const modifiedCells = [];
    for (const diff4 of diffInfo) {
      if (diff4.type === "modified") {
        const cell = model.cells[diff4.modifiedCellIndex];
        modifiedCells.push(cell);
      }
    }
    const ids = this.notebookEditor.deltaCellDecorations([], modifiedCells.map((cell) => ({
      handle: cell.handle,
      options: {
        overviewRuler: {
          color: overviewRulerModifiedForeground,
          modelRanges: [],
          includeOutput: true,
          position: 7 /* Full */
        }
      }
    })));
    this.clear();
    this.decorators.add(toDisposable(() => {
      if (!this.notebookEditor.isDisposed) {
        this.notebookEditor.deltaCellDecorations(ids, []);
      }
    }));
  }
  clear() {
    this.decorators.clear();
  }
};
export { NotebookModifiedCellDecorator };
