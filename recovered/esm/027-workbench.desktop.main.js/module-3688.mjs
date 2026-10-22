// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/common/arcTracker.ts
import { EditArcTracker } from "./module-3687.mjs";


// src/vs/workbench/contrib/editTelemetry/common/arcTracker.ts
var ArcTracker = class {
  constructor(valueBeforeTrackedEdit, trackedEdit) {
    this._tracker = new EditArcTracker(valueBeforeTrackedEdit.getValue(), toArcTextEdit(trackedEdit));
  }
  getOriginalCharacterCount() {
    return this._tracker.getOriginalCharacterCount();
  }
  /**
   * edit must apply to _updatedTrackedEdit.apply(_valueBeforeTrackedEdit)
  */
  handleEdits(edit3) {
    this._tracker.handleEdits(toArcTextEdit(edit3));
  }
  getAcceptedRestrainedCharactersCount() {
    return this._tracker.getAcceptedRestrainedCharactersCount();
  }
  getLineCountInfo() {
    return this._tracker.getLineCountInfo();
  }
  getValues() {
    return this._tracker.getValues();
  }
};

function toArcTextEdit(edit3) {
  return {
    replacements: edit3.replacements.map((replacement) => ({
      start: replacement.replaceRange.start,
      endExclusive: replacement.replaceRange.endExclusive,
      text: replacement.newText
    }))
  };
}
export { toArcTextEdit, ArcTracker };
