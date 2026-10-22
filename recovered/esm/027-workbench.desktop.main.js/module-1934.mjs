// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellInput.ts
import { CellContentPart } from "./module-1896.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellInput.ts
var CollapsedCellInput = class extends CellContentPart {
  constructor(notebookEditor, cellInputCollapsedContainer) {
    super();
    this.notebookEditor = notebookEditor;
    this._register(addDisposableListener(cellInputCollapsedContainer, EventType.DBLCLICK, (e) => {
      if (!this.currentCell || !this.notebookEditor.hasModel()) {
        return;
      }
      if (this.currentCell.isInputCollapsed) {
        this.currentCell.isInputCollapsed = false;
      } else {
        this.currentCell.isOutputCollapsed = false;
      }
    }));
    this._register(addDisposableListener(cellInputCollapsedContainer, EventType.CLICK, (e) => {
      if (!this.currentCell || !this.notebookEditor.hasModel()) {
        return;
      }
      const element = e.target;
      if (element && element.classList && element.classList.contains("expandInputIcon")) {
        this.currentCell.isInputCollapsed = false;
      }
    }));
  }
};
export { CollapsedCellInput };
