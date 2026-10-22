// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/linesOperations/browser/copyLinesCommand.ts
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/linesOperations/browser/copyLinesCommand.ts
var CopyLinesCommand = class {
  constructor(selection, isCopyingDown, noop) {
    this._selection = selection;
    this._isCopyingDown = isCopyingDown;
    this._noop = noop || false;
    this._selectionDirection = 0 /* LTR */;
    this._selectionId = null;
    this._startLineNumberDelta = 0;
    this._endLineNumberDelta = 0;
  }
  getEditOperations(model, builder) {
    let s = this._selection;
    this._startLineNumberDelta = 0;
    this._endLineNumberDelta = 0;
    if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
      this._endLineNumberDelta = 1;
      s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
    }
    const sourceLines = [];
    for (let i2 = s.startLineNumber; i2 <= s.endLineNumber; i2++) {
      sourceLines.push(model.getLineContent(i2));
    }
    const sourceText = sourceLines.join("\n");
    if (sourceText === "") {
      if (this._isCopyingDown) {
        this._startLineNumberDelta++;
        this._endLineNumberDelta++;
      }
    }
    if (this._noop) {
      builder.addEditOperation(new Range2(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber + 1, 1), s.endLineNumber === model.getLineCount() ? "" : "\n");
    } else {
      if (!this._isCopyingDown) {
        builder.addEditOperation(new Range2(s.endLineNumber, model.getLineMaxColumn(s.endLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), "\n" + sourceText);
      } else {
        builder.addEditOperation(new Range2(s.startLineNumber, 1, s.startLineNumber, 1), sourceText + "\n");
      }
    }
    this._selectionId = builder.trackSelection(s);
    this._selectionDirection = this._selection.getDirection();
  }
  computeCursorState(model, helper) {
    let result = helper.getTrackedSelection(this._selectionId);
    if (this._startLineNumberDelta !== 0 || this._endLineNumberDelta !== 0) {
      let startLineNumber = result.startLineNumber;
      let startColumn = result.startColumn;
      let endLineNumber = result.endLineNumber;
      let endColumn = result.endColumn;
      if (this._startLineNumberDelta !== 0) {
        startLineNumber = startLineNumber + this._startLineNumberDelta;
        startColumn = 1;
      }
      if (this._endLineNumberDelta !== 0) {
        endLineNumber = endLineNumber + this._endLineNumberDelta;
        endColumn = 1;
      }
      result = Selection.createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, this._selectionDirection);
    }
    return result;
  }
};
export { CopyLinesCommand };
