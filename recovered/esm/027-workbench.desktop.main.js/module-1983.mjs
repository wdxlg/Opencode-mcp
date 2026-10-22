// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInsertedCellDecorator.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { overviewRulerAddedForeground } from "./module-1079.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInsertedCellDecorator.ts
var NotebookInsertedCellDecorator = class extends Disposable {
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
    const cells = diffInfo.filter((diff4) => diff4.type === "insert").map((diff4) => model.cells[diff4.modifiedCellIndex]);
    const ids = this.notebookEditor.deltaCellDecorations([], cells.map((cell) => ({
      handle: cell.handle,
      options: {
        className: "nb-insertHighlight",
        outputClassName: "nb-insertHighlight",
        overviewRuler: {
          color: overviewRulerAddedForeground,
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
export { NotebookInsertedCellDecorator };
