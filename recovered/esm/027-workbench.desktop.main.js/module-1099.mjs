// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/diffEditorModel.ts
import { EditorModel } from "./module-1096.mjs";


// src/vs/workbench/common/editor/diffEditorModel.ts
var DiffEditorModel = class extends EditorModel {
  get originalModel() {
    return this._originalModel;
  }
  get modifiedModel() {
    return this._modifiedModel;
  }
  constructor(originalModel, modifiedModel) {
    super();
    this._originalModel = originalModel;
    this._modifiedModel = modifiedModel;
  }
  async resolve() {
    await Promise.all([
      this._originalModel?.resolve(),
      this._modifiedModel?.resolve()
    ]);
  }
  isResolved() {
    return !!(this._originalModel?.isResolved() && this._modifiedModel?.isResolved());
  }
  dispose() {
    super.dispose();
  }
};
export { DiffEditorModel };
