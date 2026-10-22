// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplaceCommand.ts
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplaceCommand.ts
var InPlaceReplaceCommand = class {
  constructor(editRange, originalSelection, text2) {
    this._editRange = editRange;
    this._originalSelection = originalSelection;
    this._text = text2;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._editRange, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    if (!this._originalSelection.isEmpty()) {
      return new Selection(
        srcRange.endLineNumber,
        srcRange.endColumn - this._text.length,
        srcRange.endLineNumber,
        srcRange.endColumn
      );
    }
    return new Selection(
      srcRange.endLineNumber,
      Math.min(this._originalSelection.positionColumn, srcRange.endColumn),
      srcRange.endLineNumber,
      Math.min(this._originalSelection.positionColumn, srcRange.endColumn)
    );
  }
};
export { InPlaceReplaceCommand };
