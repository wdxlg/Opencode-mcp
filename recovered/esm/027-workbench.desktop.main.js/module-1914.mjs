// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatPart.ts
import { CellContentPart } from "./module-1896.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/chat/cellChatPart.ts
var CellChatPart = class extends CellContentPart {
  // private _controller: NotebookCellChatController | undefined;
  get activeCell() {
    return this.currentCell;
  }
  constructor(_notebookEditor, _partContainer) {
    super();
  }
  didRenderCell(element) {
    super.didRenderCell(element);
  }
  unrenderCell(element) {
    super.unrenderCell(element);
  }
  updateInternalLayoutNow(element) {
  }
  dispose() {
    super.dispose();
  }
};
export { CellChatPart };
