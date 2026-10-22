// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { CellUri } from "./module-0911.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/debug/notebookCellPausing.ts
var NotebookCellPausing = class extends Disposable {
  constructor(_debugService, _notebookExecutionStateService) {
    super();
    this._debugService = _debugService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._pausedCells = /* @__PURE__ */ new Set();
    this._register(_debugService.getModel().onDidChangeCallStack(() => {
      this.onDidChangeCallStack(true);
      this._scheduler.schedule();
    }));
    this._scheduler = this._register(new RunOnceScheduler(() => this.onDidChangeCallStack(false), 2e3));
  }
  async onDidChangeCallStack(fallBackOnStaleCallstack) {
    const newPausedCells = /* @__PURE__ */ new Set();
    for (const session of this._debugService.getModel().getSessions()) {
      for (const thread of session.getAllThreads()) {
        let callStack = thread.getCallStack();
        if (fallBackOnStaleCallstack && !callStack.length) {
          callStack = thread.getStaleCallStack();
        }
        callStack.forEach((sf) => {
          const parsed = CellUri.parse(sf.source.uri);
          if (parsed) {
            newPausedCells.add(sf.source.uri.toString());
            this.editIsPaused(sf.source.uri, true);
          }
        });
      }
    }
    for (const uri4 of this._pausedCells) {
      if (!newPausedCells.has(uri4)) {
        this.editIsPaused(URI.parse(uri4), false);
        this._pausedCells.delete(uri4);
      }
    }
    newPausedCells.forEach((cell) => this._pausedCells.add(cell));
  }
  editIsPaused(cellUri, isPaused) {
    const parsed = CellUri.parse(cellUri);
    if (parsed) {
      const exeState = this._notebookExecutionStateService.getCellExecution(cellUri);
      if (exeState && (exeState.isPaused !== isPaused || !exeState.didPause)) {
        exeState.update([{
          editType: 3 /* ExecutionState */,
          didPause: true,
          isPaused
        }]);
      }
    }
  }
};

NotebookCellPausing = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, INotebookExecutionStateService)
], NotebookCellPausing);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NotebookCellPausing, 3 /* Restored */);
export { NotebookCellPausing };
