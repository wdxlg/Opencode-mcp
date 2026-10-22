// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon.ts
import { Disposable } from "./module-0012.mjs";
import { reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { errorStateIcon, executingStateIcon, pendingStateIcon, successStateIcon } from "./module-1846.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/codeCellExecutionIcon.ts
var CollapsedCodeCellExecutionIcon = class extends Disposable {
  constructor(_notebookEditor, _cell, _element, _executionStateService) {
    super();
    this._cell = _cell;
    this._element = _element;
    this._executionStateService = _executionStateService;
    this._visible = false;
    this._update();
    this._register(this._executionStateService.onDidChangeExecution((e4) => {
      if (e4.type === 0 /* cell */ && e4.affectsCell(this._cell.uri)) {
        this._update();
      }
    }));
    this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
  }
  setVisibility(visible) {
    this._visible = visible;
    this._update();
  }
  _update() {
    if (!this._visible) {
      return;
    }
    const runState = this._executionStateService.getCellExecution(this._cell.uri);
    const item = this._getItemForState(runState, this._cell.model.internalMetadata);
    if (item) {
      this._element.style.display = "";
      reset(this._element, ...renderLabelWithIcons(item.text));
      this._element.title = item.tooltip ?? "";
    } else {
      this._element.style.display = "none";
      reset(this._element);
    }
  }
  _getItemForState(runState, internalMetadata) {
    const state = runState?.state;
    const { lastRunSuccess } = internalMetadata;
    if (!state && lastRunSuccess) {
      return {
        text: `$(${successStateIcon.id})`,
        tooltip: localize(17885, null)
      };
    } else if (!state && lastRunSuccess === false) {
      return {
        text: `$(${errorStateIcon.id})`,
        tooltip: localize(17883, null)
      };
    } else if (state === 2 /* Pending */ || state === 1 /* Unconfirmed */) {
      return {
        text: `$(${pendingStateIcon.id})`,
        tooltip: localize(17884, null)
      };
    } else if (state === 3 /* Executing */) {
      const icon2 = ThemeIcon.modify(executingStateIcon, "spin");
      return {
        text: `$(${icon2.id})`,
        tooltip: localize(17882, null)
      };
    }
    return;
  }
};

CollapsedCodeCellExecutionIcon = __decorateClass([
  __decorateParam(3, INotebookExecutionStateService)
], CollapsedCodeCellExecutionIcon);
export { CollapsedCodeCellExecutionIcon };
