// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellProgressBar.ts
import { CellContentPart } from "./module-1873.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellProgressBar.ts
var CellProgressBar = class extends CellContentPart {
  constructor(editorContainer, collapsedInputContainer, _notebookExecutionStateService) {
    super();
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._progressBar = this._register(new ProgressBar(editorContainer, defaultProgressBarStyles));
    this._progressBar.hide();
    this._collapsedProgressBar = this._register(new ProgressBar(collapsedInputContainer, defaultProgressBarStyles));
    this._collapsedProgressBar.hide();
  }
  didRenderCell(element) {
    this._updateForExecutionState(element);
  }
  updateForExecutionState(element, e4) {
    this._updateForExecutionState(element, e4);
  }
  updateState(element, e4) {
    if (e4.metadataChanged || e4.internalMetadataChanged) {
      this._updateForExecutionState(element);
    }
    if (e4.inputCollapsedChanged) {
      const exeState = this._notebookExecutionStateService.getCellExecution(element.uri);
      if (element.isInputCollapsed) {
        this._progressBar.hide();
        if (exeState?.state === 3 /* Executing */) {
          this._updateForExecutionState(element);
        }
      } else {
        this._collapsedProgressBar.hide();
        if (exeState?.state === 3 /* Executing */) {
          this._updateForExecutionState(element);
        }
      }
    }
  }
  _updateForExecutionState(element, e4) {
    const exeState = e4?.changed ?? this._notebookExecutionStateService.getCellExecution(element.uri);
    const progressBar = element.isInputCollapsed ? this._collapsedProgressBar : this._progressBar;
    if (exeState?.state === 3 /* Executing */ && (!exeState.didPause || element.isInputCollapsed)) {
      showProgressBar(progressBar);
    } else {
      progressBar.hide();
    }
  }
};

CellProgressBar = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService)
], CellProgressBar);

function showProgressBar(progressBar) {
  progressBar.infinite().show(500);
}
export { showProgressBar, CellProgressBar };
