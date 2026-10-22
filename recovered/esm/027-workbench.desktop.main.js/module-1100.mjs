// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/textDiffEditorModel.ts
import { DiffEditorModel } from "./module-1099.mjs";


// src/vs/workbench/common/editor/textDiffEditorModel.ts
var TextDiffEditorModel = class extends DiffEditorModel {
  constructor(originalModel, modifiedModel) {
    super(originalModel, modifiedModel);
    this._textDiffEditorModel = void 0;
    this._originalModel = originalModel;
    this._modifiedModel = modifiedModel;
    this.updateTextDiffEditorModel();
  }
  get originalModel() {
    return this._originalModel;
  }
  get modifiedModel() {
    return this._modifiedModel;
  }
  get textDiffEditorModel() {
    return this._textDiffEditorModel;
  }
  async resolve() {
    await super.resolve();
    this.updateTextDiffEditorModel();
  }
  updateTextDiffEditorModel() {
    if (this.originalModel?.isResolved() && this.modifiedModel?.isResolved()) {
      if (!this._textDiffEditorModel) {
        this._textDiffEditorModel = {
          original: this.originalModel.textEditorModel,
          modified: this.modifiedModel.textEditorModel
        };
      } else {
        this._textDiffEditorModel.original = this.originalModel.textEditorModel;
        this._textDiffEditorModel.modified = this.modifiedModel.textEditorModel;
      }
    }
  }
  isResolved() {
    return !!this._textDiffEditorModel;
  }
  isReadonly() {
    return !!this.modifiedModel && this.modifiedModel.isReadonly();
  }
  dispose() {
    this._textDiffEditorModel = void 0;
    super.dispose();
  }
};
export { TextDiffEditorModel };
