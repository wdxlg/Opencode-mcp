// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput.ts
import { $, EventType, addDisposableListener, append, hide } from "./module-0075.mjs";
import { CellContentPart } from "./module-1896.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EXPAND_CELL_OUTPUT_COMMAND_ID } from "./module-0941.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/collapsedCellOutput.ts
var $32 = $;

var CollapsedCellOutput = class extends CellContentPart {
  constructor(notebookEditor, cellOutputCollapseContainer, keybindingService) {
    super();
    this.notebookEditor = notebookEditor;
    const placeholder = append(cellOutputCollapseContainer, $32("span.expandOutputPlaceholder"));
    placeholder.textContent = localize(17889, null);
    const expandIcon2 = append(cellOutputCollapseContainer, $32("span.expandOutputIcon"));
    expandIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
    const keybinding = keybindingService.lookupKeybinding(EXPAND_CELL_OUTPUT_COMMAND_ID);
    if (keybinding) {
      placeholder.title = localize(17888, null, keybinding.getLabel());
      cellOutputCollapseContainer.title = localize(17887, null, keybinding.getLabel());
    }
    hide(cellOutputCollapseContainer);
    this._register(addDisposableListener(expandIcon2, EventType.CLICK, () => this.expand()));
    this._register(addDisposableListener(cellOutputCollapseContainer, EventType.DBLCLICK, () => this.expand()));
  }
  expand() {
    if (!this.currentCell) {
      return;
    }
    if (!this.currentCell) {
      return;
    }
    const textModel = this.notebookEditor.textModel;
    const index2 = textModel.cells.indexOf(this.currentCell.model);
    if (index2 < 0) {
      return;
    }
    this.currentCell.isOutputCollapsed = !this.currentCell.isOutputCollapsed;
  }
};

CollapsedCellOutput = __decorateClass([
  __decorateParam(2, IKeybindingService)
], CollapsedCellOutput);
export { $32, CollapsedCellOutput };
