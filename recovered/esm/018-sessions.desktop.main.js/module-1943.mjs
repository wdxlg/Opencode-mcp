// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CellOutputViewModel } from "./module-1874.mjs";
import { PrefixSumComputer } from "./module-0200.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel.ts
var DiffNestedCellViewModel = class extends Disposable {
  constructor(textModel, _notebookService) {
    super();
    this.textModel = textModel;
    this._notebookService = _notebookService;
    this._onDidChangeState = this._register(new Emitter());
    this._hoveringOutput = false;
    this._focusOnOutput = false;
    this._focusInputInOutput = false;
    this._outputCollection = [];
    this._outputsTop = null;
    this._onDidChangeOutputLayout = this._register(new Emitter());
    this.onDidChangeOutputLayout = this._onDidChangeOutputLayout.event;
    this._id = generateUuid();
    this._outputViewModels = this.textModel.outputs.map((output) => new CellOutputViewModel(this, output, this._notebookService));
    this._register(this.textModel.onDidChangeOutputs((splice3) => {
      this._outputCollection.splice(splice3.start, splice3.deleteCount, ...splice3.newOutputs.map(() => 0));
      const removed = this._outputViewModels.splice(splice3.start, splice3.deleteCount, ...splice3.newOutputs.map((output) => new CellOutputViewModel(this, output, this._notebookService)));
      removed.forEach((vm) => vm.dispose());
      this._outputsTop = null;
      this._onDidChangeOutputLayout.fire();
    }));
    this._outputCollection = new Array(this.textModel.outputs.length);
  }
  get id() {
    return this._id;
  }
  get outputs() {
    return this.textModel.outputs;
  }
  get language() {
    return this.textModel.language;
  }
  get metadata() {
    return this.textModel.metadata;
  }
  get uri() {
    return this.textModel.uri;
  }
  get handle() {
    return this.textModel.handle;
  }
  get outputIsHovered() {
    return this._hoveringOutput;
  }
  set outputIsHovered(v2) {
    this._hoveringOutput = v2;
    this._onDidChangeState.fire({ outputIsHoveredChanged: true });
  }
  get outputIsFocused() {
    return this._focusOnOutput;
  }
  set outputIsFocused(v2) {
    this._focusOnOutput = v2;
    this._onDidChangeState.fire({ outputIsFocusedChanged: true });
  }
  get inputInOutputIsFocused() {
    return this._focusInputInOutput;
  }
  set inputInOutputIsFocused(v2) {
    this._focusInputInOutput = v2;
  }
  get outputsViewModels() {
    return this._outputViewModels;
  }
  _ensureOutputsTop() {
    if (!this._outputsTop) {
      const values = new Uint32Array(this._outputCollection.length);
      for (let i2 = 0; i2 < this._outputCollection.length; i2++) {
        values[i2] = this._outputCollection[i2];
      }
      this._outputsTop = new PrefixSumComputer(values);
    }
  }
  getOutputOffset(index2) {
    this._ensureOutputsTop();
    if (index2 >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    return this._outputsTop.getPrefixSum(index2 - 1);
  }
  updateOutputHeight(index2, height) {
    if (index2 >= this._outputCollection.length) {
      throw new Error("Output index out of range!");
    }
    this._ensureOutputsTop();
    this._outputCollection[index2] = height;
    if (this._outputsTop.setValue(index2, height)) {
      this._onDidChangeOutputLayout.fire();
    }
  }
  getOutputTotalHeight() {
    this._ensureOutputsTop();
    return this._outputsTop?.getTotalSum() ?? 0;
  }
  dispose() {
    super.dispose();
    this._outputViewModels.forEach((output) => {
      output.dispose();
    });
  }
};

DiffNestedCellViewModel = __decorateClass([
  __decorateParam(1, INotebookService)
], DiffNestedCellViewModel);
export { DiffNestedCellViewModel };
