// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookAccessibilityProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getAllOutputsText } from "./module-1912.mjs";
import { alert } from "./module-0076.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookAccessibilityProvider.ts
var NotebookAccessibilityProvider = class extends Disposable {
  constructor(viewModel, isReplHistory, notebookExecutionStateService, keybindingService, configurationService, accessibilityService) {
    super();
    this.viewModel = viewModel;
    this.isReplHistory = isReplHistory;
    this.notebookExecutionStateService = notebookExecutionStateService;
    this.keybindingService = keybindingService;
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this._onDidAriaLabelChange = this._register(new Emitter());
    this.onDidAriaLabelChange = this._onDidAriaLabelChange.event;
    this._register(Event2.debounce(
      this.notebookExecutionStateService.onDidChangeExecution,
      (last, e) => this.mergeEvents(last, e),
      100
    )((updates) => {
      if (!updates.length) {
        return;
      }
      const viewModel2 = this.viewModel();
      if (viewModel2) {
        for (const update of updates) {
          const cellModel = viewModel2.getCellByHandle(update.cellHandle);
          if (cellModel) {
            this._onDidAriaLabelChange.fire(cellModel);
          }
        }
        const lastUpdate = updates[updates.length - 1];
        if (this.shouldReadCellOutputs(lastUpdate.state)) {
          const cell = viewModel2.getCellByHandle(lastUpdate.cellHandle);
          if (cell && cell.outputsViewModels.length) {
            const text2 = getAllOutputsText(viewModel2.notebookDocument, cell, true);
            alert(text2);
          }
        }
      }
    }, this));
  }
  shouldReadCellOutputs(state) {
    return state === void 0 && this.isReplHistory && this.accessibilityService.isScreenReaderOptimized() && this.configurationService.getValue("accessibility.replEditor.readLastExecutionOutput");
  }
  get verbositySettingId() {
    return this.isReplHistory ? "accessibility.verbosity.replEditor" /* ReplEditor */ : "accessibility.verbosity.notebook" /* Notebook */;
  }
  getAriaLabel(element) {
    const event = Event2.filter(this.onDidAriaLabelChange, (e) => e === element);
    return observableFromEvent(this, event, () => {
      const viewModel = this.viewModel();
      if (!viewModel) {
        return "";
      }
      const index2 = viewModel.getCellIndex(element);
      if (index2 >= 0) {
        return this.getLabel(element);
      }
      return "";
    });
  }
  createItemLabel(executionLabel, cellKind) {
    return this.isReplHistory ? `cell${executionLabel}` : `${cellKind === 1 /* Markup */ ? "markdown" : "code"} cell${executionLabel}`;
  }
  getLabel(element) {
    const executionState = this.notebookExecutionStateService.getCellExecution(element.uri)?.state;
    const executionLabel = executionState === 3 /* Executing */ ? ", executing" : executionState === 2 /* Pending */ ? ", pending" : "";
    return this.createItemLabel(executionLabel, element.cellKind);
  }
  get widgetAriaLabelName() {
    return this.isReplHistory ? localize(17758, null) : localize(17755, null);
  }
  getWidgetAriaLabel() {
    const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
    if (this.configurationService.getValue(this.verbositySettingId)) {
      return keybinding ? localize(17756, null, this.widgetAriaLabelName, keybinding) : localize(17757, null, this.widgetAriaLabelName);
    }
    return this.widgetAriaLabelName;
  }
  mergeEvents(last, e) {
    const viewModel = this.viewModel();
    const result = last || [];
    if (viewModel && e.type === 0 /* cell */ && e.affectsNotebook(viewModel.uri)) {
      const index2 = result.findIndex((update) => update.cellHandle === e.cellHandle);
      if (index2 >= 0) {
        result.splice(index2, 1);
      }
      result.push({ cellHandle: e.cellHandle, state: e.changed?.state });
    }
    return result;
  }
};

NotebookAccessibilityProvider = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IAccessibilityService)
], NotebookAccessibilityProvider);
export { NotebookAccessibilityProvider };
