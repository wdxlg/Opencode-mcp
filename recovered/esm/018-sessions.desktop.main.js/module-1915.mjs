// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint.ts
import { CellContentPart } from "./module-1873.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, hide, reset, show } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { FoldingController2 } from "./module-1914.mjs";
import { executingStateIcon } from "./module-1846.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/foldedCellHint.ts
var FoldedCellHint = class extends CellContentPart {
  constructor(_notebookEditor, _container, _notebookExecutionStateService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._container = _container;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._runButtonListener = this._register(new MutableDisposable());
    this._cellExecutionListener = this._register(new MutableDisposable());
  }
  didRenderCell(element) {
    this.update(element);
  }
  update(element) {
    if (!this._notebookEditor.hasModel()) {
      this._cellExecutionListener.clear();
      this._runButtonListener.clear();
      return;
    }
    if (element.isInputCollapsed || element.getEditState() === 1 /* Editing */) {
      this._cellExecutionListener.clear();
      this._runButtonListener.clear();
      hide(this._container);
    } else if (element.foldingState === 2 /* Collapsed */) {
      const idx = this._notebookEditor.getViewModel().getCellIndex(element);
      const length = this._notebookEditor.getViewModel().getFoldedLength(idx);
      const runSectionButton = this.getRunFoldedSectionButton({ start: idx, end: idx + length + 1 });
      if (!runSectionButton) {
        reset(this._container, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
      } else {
        reset(this._container, runSectionButton, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
      }
      show(this._container);
      const foldHintTop = element.layoutInfo.previewHeight;
      this._container.style.top = `${foldHintTop}px`;
    } else {
      this._cellExecutionListener.clear();
      this._runButtonListener.clear();
      hide(this._container);
    }
  }
  getHiddenCellsLabel(num) {
    const label3 = num === 1 ? localize(17890, null) : localize(17891, null, num);
    return $("span.notebook-folded-hint-label", void 0, label3);
  }
  getHiddenCellHintButton(element) {
    const expandIcon2 = $("span.cell-expand-part-button");
    expandIcon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
    this._register(addDisposableListener(expandIcon2, EventType.CLICK, () => {
      const controller = this._notebookEditor.getContribution(FoldingController2.id);
      const idx = this._notebookEditor.getCellIndex(element);
      if (typeof idx === "number") {
        controller.setFoldingStateDown(idx, 1 /* Expanded */, 1);
      }
    }));
    return expandIcon2;
  }
  getRunFoldedSectionButton(range2) {
    const runAllContainer = $("span.folded-cell-run-section-button");
    const cells = this._notebookEditor.getCellsInRange(range2);
    const hasCodeCells = cells.some((cell) => cell.cellKind === 2 /* Code */);
    if (!hasCodeCells) {
      return void 0;
    }
    const isRunning = cells.some((cell) => {
      const cellExecution = this._notebookExecutionStateService.getCellExecution(cell.uri);
      return cellExecution && cellExecution.state === 3 /* Executing */;
    });
    const runAllIcon = isRunning ? ThemeIcon.modify(executingStateIcon, "spin") : Codicon.play;
    runAllContainer.classList.add(...ThemeIcon.asClassNameArray(runAllIcon));
    this._runButtonListener.value = addDisposableListener(runAllContainer, EventType.CLICK, () => {
      this._notebookEditor.executeNotebookCells(cells);
    });
    this._cellExecutionListener.value = this._notebookExecutionStateService.onDidChangeExecution(() => {
      const isRunning2 = cells.some((cell) => {
        const cellExecution = this._notebookExecutionStateService.getCellExecution(cell.uri);
        return cellExecution && cellExecution.state === 3 /* Executing */;
      });
      const runAllIcon2 = isRunning2 ? ThemeIcon.modify(executingStateIcon, "spin") : Codicon.play;
      runAllContainer.className = "";
      runAllContainer.classList.add("folded-cell-run-section-button", ...ThemeIcon.asClassNameArray(runAllIcon2));
    });
    return runAllContainer;
  }
  updateInternalLayoutNow(element) {
    this.update(element);
  }
};

FoldedCellHint = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService)
], FoldedCellHint);
export { FoldedCellHint };
