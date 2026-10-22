// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellExecution.ts
import { CellContentPart } from "./module-1873.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, append, clearNode, hide, show } from "./module-0075.mjs";
import { hasKey } from "./module-0010.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { CodeCellViewModel } from "./module-1877.mjs";
import { clamp } from "./module-0040.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { executingStateIcon } from "./module-1846.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellExecution.ts
var UPDATE_EXECUTION_ORDER_GRACE_PERIOD = 200;

var CellExecutionPart = class extends CellContentPart {
  constructor(_notebookEditor, _executionOrderLabel, _notebookExecutionStateService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._executionOrderLabel = _executionOrderLabel;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.kernelDisposables = this._register(new DisposableStore());
    this._executionOrderLabel.classList.add("cell-execution-order");
    this._executionOrderContent = append(this._executionOrderLabel, $("div"));
    this._register(this._notebookExecutionStateService.onDidChangeExecution((e4) => {
      if (this.currentCell && hasKey(e4, { affectsCell: true }) && e4.affectsCell(this.currentCell.uri)) {
        this._updatePosition();
      }
    }));
    this._register(this._notebookEditor.onDidChangeActiveKernel(() => {
      if (this.currentCell) {
        this.kernelDisposables.clear();
        if (this._notebookEditor.activeKernel) {
          this.kernelDisposables.add(this._notebookEditor.activeKernel.onDidChange(() => {
            if (this.currentCell) {
              this.updateExecutionOrder(this.currentCell.internalMetadata);
            }
          }));
        }
        this.updateExecutionOrder(this.currentCell.internalMetadata);
      }
    }));
    this._register(this._notebookEditor.onDidScroll(() => {
      this._updatePosition();
    }));
  }
  didRenderCell(element) {
    this.updateExecutionOrder(element.internalMetadata, true);
  }
  updateState(element, e4) {
    if (e4.internalMetadataChanged) {
      this.updateExecutionOrder(element.internalMetadata);
    }
  }
  updateExecutionOrder(internalMetadata, forceClear = false) {
    if (this._notebookEditor.activeKernel?.implementsExecutionOrder || !this._notebookEditor.activeKernel && typeof internalMetadata.executionOrder === "number") {
      if (typeof internalMetadata.executionOrder !== "number" && !forceClear && !!this._notebookExecutionStateService.getCellExecution(this.currentCell.uri)) {
        const renderingCell = this.currentCell;
        disposableTimeout(() => {
          if (this.currentCell === renderingCell) {
            this.updateExecutionOrder(this.currentCell.internalMetadata, true);
            this._updatePosition();
          }
        }, UPDATE_EXECUTION_ORDER_GRACE_PERIOD, this.cellDisposables);
        return;
      }
      const executionOrderLabel = typeof internalMetadata.executionOrder === "number" ? `[${internalMetadata.executionOrder}]` : "[ ]";
      this._executionOrderContent.innerText = executionOrderLabel;
      this._updatePosition();
    } else {
      this._executionOrderContent.innerText = "";
    }
  }
  updateInternalLayoutNow(element) {
    this._updatePosition();
  }
  _updatePosition() {
    if (!this.currentCell) {
      return;
    }
    if (this.currentCell.isInputCollapsed) {
      hide(this._executionOrderLabel);
      return;
    }
    const cellIsRunning = !!this._notebookExecutionStateService.getCellExecution(this.currentCell.uri);
    const wasSticky = this._executionOrderLabel.classList.contains("sticky");
    if (!cellIsRunning) {
      this._executionOrderLabel.classList.remove("sticky");
      if (wasSticky) {
        const executionOrder = this.currentCell.internalMetadata.executionOrder;
        const executionOrderLabel = typeof executionOrder === "number" ? `[${executionOrder}]` : "[ ]";
        this._executionOrderContent.innerText = executionOrderLabel;
      }
    }
    show(this._executionOrderLabel);
    let top2 = this.currentCell.layoutInfo.editorHeight - 22 + this.currentCell.layoutInfo.statusBarHeight;
    if (this.currentCell instanceof CodeCellViewModel) {
      const elementTop = this._notebookEditor.getAbsoluteTopOfElement(this.currentCell);
      const editorBottom = elementTop + this.currentCell.layoutInfo.outputContainerOffset;
      const scrollBottom = this._notebookEditor.scrollBottom;
      const lineHeight = 22;
      const statusBarVisible = this.currentCell.layoutInfo.statusBarHeight > 0;
      const offset = editorBottom - scrollBottom;
      top2 -= offset;
      top2 = clamp(
        top2,
        lineHeight + 12,
        // line height + padding for single line
        this.currentCell.layoutInfo.editorHeight - lineHeight + this.currentCell.layoutInfo.statusBarHeight
      );
      if (scrollBottom <= editorBottom && cellIsRunning) {
        const isAlreadyIcon = this._executionOrderContent.classList.contains("sticky-spinner");
        if (!isAlreadyIcon) {
          this._executionOrderLabel.classList.add("sticky-spinner");
          clearNode(this._executionOrderContent);
          const icon2 = ThemeIcon.modify(executingStateIcon, "spin");
          append(this._executionOrderContent, ...renderLabelWithIcons(`$(${icon2.id})`));
        }
      } else if (!statusBarVisible && cellIsRunning) {
        const wasStickyHere = this._executionOrderLabel.classList.contains("sticky");
        this._executionOrderLabel.classList.remove("sticky");
        top2 = this.currentCell.layoutInfo.editorHeight - lineHeight;
        const iconIsPresent = this._executionOrderContent.querySelector(".codicon") !== null;
        if (wasStickyHere || iconIsPresent) {
          const executionOrder = this.currentCell.internalMetadata.executionOrder;
          const executionOrderLabel = typeof executionOrder === "number" ? `[${executionOrder}]` : "[ ]";
          this._executionOrderContent.innerText = executionOrderLabel;
        }
      } else {
        const currentlySticky = this._executionOrderLabel.classList.contains("sticky");
        this._executionOrderLabel.classList.remove("sticky");
        if (currentlySticky) {
          const executionOrder = this.currentCell.internalMetadata.executionOrder;
          const executionOrderLabel = typeof executionOrder === "number" ? `[${executionOrder}]` : "[ ]";
          this._executionOrderContent.innerText = executionOrderLabel;
        }
      }
    }
    this._executionOrderLabel.style.top = `${top2}px`;
  }
};

CellExecutionPart = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService)
], CellExecutionPart);
export { UPDATE_EXECUTION_ORDER_GRACE_PERIOD, CellExecutionPart };
