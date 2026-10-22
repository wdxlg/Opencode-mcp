// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { RENDERER_NOT_AVAILABLE } from "./module-0911.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel.ts
var handle = 0;

var CellOutputViewModel = class extends Disposable {
  constructor(cellViewModel, _outputRawData, _notebookService) {
    super();
    this.cellViewModel = cellViewModel;
    this._outputRawData = _outputRawData;
    this._notebookService = _notebookService;
    this._onDidResetRendererEmitter = this._register(new Emitter());
    this.onDidResetRenderer = this._onDidResetRendererEmitter.event;
    this.alwaysShow = false;
    this.visible = observableValue("outputVisible", false);
    this.outputHandle = handle++;
  }
  setVisible(visible = true, force = false) {
    if (!visible && this.alwaysShow) {
      return;
    }
    if (force && visible) {
      this.alwaysShow = true;
    }
    this.visible.set(visible, void 0);
  }
  get model() {
    return this._outputRawData;
  }
  get pickedMimeType() {
    return this._pickedMimeType;
  }
  set pickedMimeType(value2) {
    this._pickedMimeType = value2;
  }
  hasMultiMimeType() {
    if (this._outputRawData.outputs.length < 2) {
      return false;
    }
    const firstMimeType = this._outputRawData.outputs[0].mime;
    return this._outputRawData.outputs.some((output) => output.mime !== firstMimeType);
  }
  resolveMimeTypes(textModel, kernelProvides) {
    const mimeTypes = this._notebookService.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
    const index2 = mimeTypes.findIndex((mimeType) => mimeType.rendererId !== RENDERER_NOT_AVAILABLE && mimeType.isTrusted);
    return [mimeTypes, Math.max(index2, 0)];
  }
  resetRenderer() {
    this._pickedMimeType = void 0;
    this.model.bumpVersion();
    this._onDidResetRendererEmitter.fire();
  }
  toRawJSON() {
    return {
      outputs: this._outputRawData.outputs
      // TODO@rebronix, no id, right?
    };
  }
};
export { handle, CellOutputViewModel };
