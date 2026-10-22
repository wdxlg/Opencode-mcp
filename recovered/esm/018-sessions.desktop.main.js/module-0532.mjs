// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/caretOperations/browser/moveCaretCommand.ts
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/caretOperations/browser/moveCaretCommand.ts
var MoveCaretCommand = class {
  constructor(selection, isMovingLeft) {
    this._selection = selection;
    this._isMovingLeft = isMovingLeft;
  }
  getEditOperations(model, builder) {
    if (this._selection.startLineNumber !== this._selection.endLineNumber || this._selection.isEmpty()) {
      return;
    }
    const lineNumber = this._selection.startLineNumber;
    const startColumn = this._selection.startColumn;
    const endColumn = this._selection.endColumn;
    if (this._isMovingLeft && startColumn === 1) {
      return;
    }
    if (!this._isMovingLeft && endColumn === model.getLineMaxColumn(lineNumber)) {
      return;
    }
    if (this._isMovingLeft) {
      const rangeBefore = new Range2(lineNumber, startColumn - 1, lineNumber, startColumn);
      const charBefore = model.getValueInRange(rangeBefore);
      builder.addEditOperation(rangeBefore, null);
      builder.addEditOperation(new Range2(lineNumber, endColumn, lineNumber, endColumn), charBefore);
    } else {
      const rangeAfter = new Range2(lineNumber, endColumn, lineNumber, endColumn + 1);
      const charAfter = model.getValueInRange(rangeAfter);
      builder.addEditOperation(rangeAfter, null);
      builder.addEditOperation(new Range2(lineNumber, startColumn, lineNumber, startColumn), charAfter);
    }
  }
  computeCursorState(model, helper) {
    if (this._isMovingLeft) {
      return new Selection(this._selection.startLineNumber, this._selection.startColumn - 1, this._selection.endLineNumber, this._selection.endColumn - 1);
    } else {
      return new Selection(this._selection.startLineNumber, this._selection.startColumn + 1, this._selection.endLineNumber, this._selection.endColumn + 1);
    }
  }
};
export { MoveCaretCommand };
