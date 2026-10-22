// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellFocus.ts
import { CellContentPart } from "./module-1896.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellFocus.ts
var CellFocusPart = class extends CellContentPart {
  constructor(containerElement, focusSinkElement, notebookEditor) {
    super();
    this._register(addDisposableListener(containerElement, EventType.FOCUS, () => {
      if (this.currentCell) {
        notebookEditor.focusElement(this.currentCell);
      }
    }, true));
    if (focusSinkElement) {
      this._register(addDisposableListener(focusSinkElement, EventType.FOCUS, () => {
        if (this.currentCell && this.currentCell.outputsViewModels.length) {
          notebookEditor.focusNotebookCell(this.currentCell, "output");
        }
      }));
    }
  }
};
export { CellFocusPart };
