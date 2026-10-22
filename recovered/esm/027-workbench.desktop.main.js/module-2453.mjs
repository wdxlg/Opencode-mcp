// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { throttle } from "./module-0250.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { IUserActivityService } from "./module-1298.mjs";
import { registerNotebookContribution } from "./module-1893.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/execute/executionEditorProgress.ts
var ExecutionEditorProgressController = class extends Disposable {
  constructor(_notebookEditor, _notebookExecutionStateService, _userActivity) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._userActivity = _userActivity;
    this._activityMutex = this._register(new MutableDisposable());
    this._register(_notebookEditor.onDidScroll(() => this._update()));
    this._register(_notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.notebook.toString() !== this._notebookEditor.textModel?.uri.toString()) {
        return;
      }
      this._update();
    }));
    this._register(_notebookEditor.onDidChangeModel(() => this._update()));
  }
  static {
    this.id = "workbench.notebook.executionEditorProgress";
  }
  _update() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const cellExecutions = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookEditor.textModel?.uri).filter((exe) => exe.state === 3 /* Executing */);
    const notebookExecution = this._notebookExecutionStateService.getExecution(this._notebookEditor.textModel?.uri);
    const executionIsVisible = (exe) => {
      for (const range2 of this._notebookEditor.visibleRanges) {
        for (const cell of this._notebookEditor.getCellsInRange(range2)) {
          if (cell.handle === exe.cellHandle) {
            const top2 = this._notebookEditor.getAbsoluteTopOfElement(cell);
            if (this._notebookEditor.scrollTop < top2 + 5) {
              return true;
            }
          }
        }
      }
      return false;
    };
    const hasAnyExecution = cellExecutions.length || notebookExecution;
    if (hasAnyExecution && !this._activityMutex.value) {
      this._activityMutex.value = this._userActivity.markActive();
    } else if (!hasAnyExecution && this._activityMutex.value) {
      this._activityMutex.clear();
    }
    const shouldShowEditorProgressbarForCellExecutions = cellExecutions.length && !cellExecutions.some(executionIsVisible) && !cellExecutions.some((e) => e.isPaused);
    const showEditorProgressBar = !!notebookExecution || shouldShowEditorProgressbarForCellExecutions;
    if (showEditorProgressBar) {
      this._notebookEditor.showProgress();
    } else {
      this._notebookEditor.hideProgress();
    }
  }
};

__decorateClass([
  throttle(100)
], ExecutionEditorProgressController.prototype, "_update", 1);

ExecutionEditorProgressController = __decorateClass([
  __decorateParam(1, INotebookExecutionStateService),
  __decorateParam(2, IUserActivityService)
], ExecutionEditorProgressController);

registerNotebookContribution(ExecutionEditorProgressController.id, ExecutionEditorProgressController);
export { ExecutionEditorProgressController };
