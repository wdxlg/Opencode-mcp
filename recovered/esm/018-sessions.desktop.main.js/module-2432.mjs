// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/diagnosticCellStatusBarContrib.ts
import { Disposable } from "./module-0012.mjs";
import { NotebookStatusBarController } from "./module-2415.mjs";
import { CodeCellViewModel } from "./module-1877.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID } from "./module-2431.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IChatAgentService } from "./module-0975.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/diagnosticCellStatusBarContrib.ts
var DiagnosticCellStatusBarContrib = class extends Disposable {
  static {
    this.id = "workbench.notebook.statusBar.diagtnostic";
  }
  constructor(notebookEditor, instantiationService) {
    super();
    this._register(new NotebookStatusBarController(
      notebookEditor,
      (vm, cell) => cell instanceof CodeCellViewModel ? instantiationService.createInstance(DiagnosticCellStatusBarItem, vm, cell) : Disposable.None
    ));
  }
};

DiagnosticCellStatusBarContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], DiagnosticCellStatusBarContrib);

registerNotebookContribution(DiagnosticCellStatusBarContrib.id, DiagnosticCellStatusBarContrib);

var DiagnosticCellStatusBarItem = class extends Disposable {
  constructor(_notebookViewModel, cell, keybindingService, chatAgentService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this.cell = cell;
    this.keybindingService = keybindingService;
    this.chatAgentService = chatAgentService;
    this._currentItemIds = [];
    this._register(autorun((reader) => this.updateSparkleItem(reader.readObservable(cell.executionErrorDiagnostic))));
  }
  hasNotebookAgent() {
    const agents = this.chatAgentService.getAgents();
    return !!agents.find((agent) => agent.locations.includes("notebook" /* Notebook */));
  }
  async updateSparkleItem(error) {
    let item;
    if (error?.location && this.hasNotebookAgent()) {
      const tooltip = this.keybindingService.appendKeybinding(
        localize(17407, null),
        OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID
      );
      item = {
        text: `$(sparkle)`,
        tooltip,
        alignment: 1 /* Left */,
        command: OPEN_CELL_FAILURE_ACTIONS_COMMAND_ID,
        priority: Number.MAX_SAFE_INTEGER - 1
      };
    }
    const items = item ? [item] : [];
    this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items }]);
  }
  dispose() {
    super.dispose();
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items: [] }]);
  }
};

DiagnosticCellStatusBarItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IChatAgentService)
], DiagnosticCellStatusBarItem);
export { DiagnosticCellStatusBarContrib, DiagnosticCellStatusBarItem };
