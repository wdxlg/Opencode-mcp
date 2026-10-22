// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/cellDiagnosticEditorContrib.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { Event2 } from "./module-0017.mjs";
import { CodeCellViewModel } from "./module-1900.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerNotebookContribution } from "./module-1893.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellDiagnostics/cellDiagnosticEditorContrib.ts
var CellDiagnostics = class extends Disposable {
  constructor(notebookEditor, notebookExecutionStateService, markerService, chatAgentService, configurationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.markerService = markerService;
    this.chatAgentService = chatAgentService;
    this.configurationService = configurationService;
    this.enabled = false;
    this.listening = false;
    this.diagnosticsByHandle = /* @__PURE__ */ new Map();
    this.updateEnabled();
    this._register(chatAgentService.onDidChangeAgents(() => this.updateEnabled()));
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(NotebookSetting.cellFailureDiagnostics)) {
        this.updateEnabled();
      }
    }));
  }
  static {
    this.ID = "workbench.notebook.cellDiagnostics";
  }
  hasNotebookAgent() {
    const agents = this.chatAgentService.getAgents();
    return !!agents.find((agent) => agent.locations.includes("notebook" /* Notebook */));
  }
  updateEnabled() {
    const settingEnabled = this.configurationService.getValue(NotebookSetting.cellFailureDiagnostics);
    if (this.enabled && (!settingEnabled || !this.hasNotebookAgent())) {
      this.enabled = false;
      this.clearAll();
    } else if (!this.enabled && settingEnabled && this.hasNotebookAgent()) {
      this.enabled = true;
      if (!this.listening) {
        this.listening = true;
        this._register(Event2.accumulate(
          this.notebookExecutionStateService.onDidChangeExecution,
          200
        )((e) => this.handleChangeExecutionState(e)));
      }
    }
  }
  handleChangeExecutionState(changes) {
    if (!this.enabled) {
      return;
    }
    const handled = /* @__PURE__ */ new Set();
    for (const e of changes.reverse()) {
      const notebookUri = this.notebookEditor.textModel?.uri;
      if (e.type === 0 /* cell */ && notebookUri && e.affectsNotebook(notebookUri) && !handled.has(e.cellHandle)) {
        handled.add(e.cellHandle);
        if (!!e.changed) {
          this.clear(e.cellHandle);
        } else {
          this.setDiagnostics(e.cellHandle);
        }
      }
    }
  }
  clearAll() {
    for (const handle2 of this.diagnosticsByHandle.keys()) {
      this.clear(handle2);
    }
  }
  clear(cellHandle) {
    const disposables = this.diagnosticsByHandle.get(cellHandle);
    if (disposables) {
      for (const disposable of disposables) {
        disposable.dispose();
      }
      this.diagnosticsByHandle.delete(cellHandle);
    }
  }
  setDiagnostics(cellHandle) {
    if (this.diagnosticsByHandle.has(cellHandle)) {
      return;
    }
    const cell = this.notebookEditor.getCellByHandle(cellHandle);
    if (!cell || cell.cellKind !== 2 /* Code */) {
      return;
    }
    const metadata = cell.model.internalMetadata;
    if (cell instanceof CodeCellViewModel && !metadata.lastRunSuccess && metadata?.error?.location) {
      const disposables = [];
      const errorLabel = metadata.error.name ? `${metadata.error.name}: ${metadata.error.message}` : metadata.error.message;
      const marker = this.createMarkerData(errorLabel, metadata.error.location);
      this.markerService.changeOne(CellDiagnostics.ID, cell.uri, [marker]);
      disposables.push(toDisposable(() => this.markerService.changeOne(CellDiagnostics.ID, cell.uri, [])));
      cell.executionErrorDiagnostic.set(metadata.error, void 0);
      disposables.push(toDisposable(() => cell.executionErrorDiagnostic.set(void 0, void 0)));
      disposables.push(autorun((r2) => {
        if (!cell.executionErrorDiagnostic.read(r2)) {
          this.clear(cellHandle);
        }
      }));
      disposables.push(cell.model.onDidChangeOutputs(() => {
        if (cell.model.outputs.length === 0) {
          this.clear(cellHandle);
        }
      }));
      disposables.push(cell.model.onDidChangeContent(() => {
        this.clear(cellHandle);
      }));
      this.diagnosticsByHandle.set(cellHandle, disposables);
    }
  }
  createMarkerData(message, location2) {
    return {
      severity: 8,
      message,
      startLineNumber: location2.startLineNumber + 1,
      startColumn: location2.startColumn + 1,
      endLineNumber: location2.endLineNumber + 1,
      endColumn: location2.endColumn + 1,
      source: "Cell Execution Error"
    };
  }
  dispose() {
    super.dispose();
    this.clearAll();
  }
};

CellDiagnostics = __decorateClass([
  __decorateParam(1, INotebookExecutionStateService),
  __decorateParam(2, IMarkerService),
  __decorateParam(3, IChatAgentService),
  __decorateParam(4, IConfigurationService)
], CellDiagnostics);

registerNotebookContribution(CellDiagnostics.ID, CellDiagnostics);
export { CellDiagnostics };
