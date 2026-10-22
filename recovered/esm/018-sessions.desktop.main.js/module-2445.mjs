// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl.ts
import { localize } from "./module-0001.mjs";
import { KernelPickerMRUStrategy } from "./module-1847.mjs";
import { toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotebookKernelHistoryService, INotebookKernelService } from "./module-1387.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookExecutionServiceImpl.ts
var NotebookExecutionService = class {
  constructor(_commandService, _notebookKernelService, _notebookKernelHistoryService, _workspaceTrustRequestService, _logService, _notebookExecutionStateService) {
    this._commandService = _commandService;
    this._notebookKernelService = _notebookKernelService;
    this._notebookKernelHistoryService = _notebookKernelHistoryService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._logService = _logService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.cellExecutionParticipants = /* @__PURE__ */ new Set();
  }
  async executeNotebookCells(notebook, cells, contextKeyService) {
    const cellsArr = Array.from(cells).filter((c) => c.cellKind === 2 /* Code */);
    if (!cellsArr.length) {
      return;
    }
    this._logService.debug(`Execution`, `${JSON.stringify(cellsArr.map((c) => c.handle))}`);
    const message = localize(17860, null);
    const trust = await this._workspaceTrustRequestService.requestWorkspaceTrust({ message });
    if (!trust) {
      return;
    }
    const cellExecutions = [];
    for (const cell of cellsArr) {
      const cellExe = this._notebookExecutionStateService.getCellExecution(cell.uri);
      if (!!cellExe) {
        continue;
      }
      cellExecutions.push([cell, this._notebookExecutionStateService.createCellExecution(notebook.uri, cell.handle)]);
    }
    const kernel = await KernelPickerMRUStrategy.resolveKernel(notebook, this._notebookKernelService, this._notebookKernelHistoryService, this._commandService);
    if (!kernel) {
      cellExecutions.forEach((cellExe) => cellExe[1].complete({}));
      return;
    }
    this._notebookKernelHistoryService.addMostRecentKernel(kernel);
    const validCellExecutions = [];
    for (const [cell, cellExecution] of cellExecutions) {
      if (!kernel.supportedLanguages.includes(cell.language)) {
        cellExecution.complete({});
      } else {
        validCellExecutions.push(cellExecution);
      }
    }
    if (validCellExecutions.length > 0) {
      await this.runExecutionParticipants(validCellExecutions);
      this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
      await kernel.executeNotebookCellsRequest(notebook.uri, validCellExecutions.map((c) => c.cellHandle));
      const unconfirmed = validCellExecutions.filter((exe) => exe.state === 1 /* Unconfirmed */);
      if (unconfirmed.length) {
        this._logService.debug(`Execution`, `Completing unconfirmed executions ${JSON.stringify(unconfirmed.map((exe) => exe.cellHandle))}`);
        unconfirmed.forEach((exe) => exe.complete({}));
      }
      this._logService.debug(`Execution`, `Completed executions ${JSON.stringify(validCellExecutions.map((exe) => exe.cellHandle))}`);
    }
  }
  async cancelNotebookCellHandles(notebook, cells) {
    const cellsArr = Array.from(cells);
    this._logService.debug(`Execution`, `CancelNotebookCellHandles ${JSON.stringify(cellsArr)}`);
    const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
    if (kernel) {
      await kernel.cancelNotebookCellExecution(notebook.uri, cellsArr);
    }
  }
  async cancelNotebookCells(notebook, cells) {
    this.cancelNotebookCellHandles(notebook, Array.from(cells, (cell) => cell.handle));
  }
  registerExecutionParticipant(participant) {
    this.cellExecutionParticipants.add(participant);
    return toDisposable(() => this.cellExecutionParticipants.delete(participant));
  }
  async runExecutionParticipants(executions) {
    for (const participant of this.cellExecutionParticipants) {
      await participant.onWillExecuteCell(executions);
    }
    return;
  }
  dispose() {
    this._activeProxyKernelExecutionToken?.dispose(true);
  }
};

NotebookExecutionService = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, INotebookKernelService),
  __decorateParam(2, INotebookKernelHistoryService),
  __decorateParam(3, IWorkspaceTrustRequestService),
  __decorateParam(4, INotebookLoggingService),
  __decorateParam(5, INotebookExecutionStateService)
], NotebookExecutionService);
export { NotebookExecutionService };
