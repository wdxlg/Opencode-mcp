// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/commands/replaceCommand.ts
import { Selection } from "./module-0107.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/commands/replaceCommand.ts
var ReplaceCommand = class {
  constructor(range2, text2, insertsAutoWhitespace = false) {
    this._range = range2;
    this._text = text2;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
};

var ReplaceOvertypeCommand = class {
  constructor(range2, text2, insertsAutoWhitespace = false) {
    this._range = range2;
    this._text = text2;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    const initialStartPosition = this._range.getStartPosition();
    const initialEndPosition = this._range.getEndPosition();
    const initialEndLineNumber = initialEndPosition.lineNumber;
    const offsetDelta = this._text.length + (this._range.isEmpty() ? 0 : -1);
    let endPosition = addPositiveOffsetToModelPosition(model, initialEndPosition, offsetDelta);
    if (endPosition.lineNumber > initialEndLineNumber) {
      endPosition = new Position(initialEndLineNumber, model.getLineMaxColumn(initialEndLineNumber));
    }
    const replaceRange = Range2.fromPositions(initialStartPosition, endPosition);
    builder.addTrackedEditOperation(replaceRange, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
};

var ReplaceCommandThatSelectsText = class {
  constructor(range2, text2) {
    this._range = range2;
    this._text = text2;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromRange(srcRange, 0 /* LTR */);
  }
};

var ReplaceCommandWithoutChangingPosition = class {
  constructor(range2, text2, insertsAutoWhitespace = false) {
    this._range = range2;
    this._text = text2;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getStartPosition());
  }
};

var ReplaceCommandWithOffsetCursorState = class {
  constructor(range2, text2, lineNumberDeltaOffset, columnDeltaOffset, insertsAutoWhitespace = false) {
    this._range = range2;
    this._text = text2;
    this._columnDeltaOffset = columnDeltaOffset;
    this._lineNumberDeltaOffset = lineNumberDeltaOffset;
    this.insertsAutoWhitespace = insertsAutoWhitespace;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition().delta(this._lineNumberDeltaOffset, this._columnDeltaOffset));
  }
};

var ReplaceOvertypeCommandOnCompositionEnd = class {
  constructor(range2) {
    this._range = range2;
  }
  getEditOperations(model, builder) {
    const text2 = model.getValueInRange(this._range);
    const initialEndPosition = this._range.getEndPosition();
    const initialEndLineNumber = initialEndPosition.lineNumber;
    let endPosition = addPositiveOffsetToModelPosition(model, initialEndPosition, text2.length);
    if (endPosition.lineNumber > initialEndLineNumber) {
      endPosition = new Position(initialEndLineNumber, model.getLineMaxColumn(initialEndLineNumber));
    }
    const replaceRange = Range2.fromPositions(initialEndPosition, endPosition);
    builder.addTrackedEditOperation(replaceRange, "");
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const srcRange = inverseEditOperations[0].range;
    return Selection.fromPositions(srcRange.getEndPosition());
  }
};

var ReplaceCommandThatPreservesSelection = class {
  constructor(editRange, text2, initialSelection, forceMoveMarkers = false) {
    this._range = editRange;
    this._text = text2;
    this._initialSelection = initialSelection;
    this._forceMoveMarkers = forceMoveMarkers;
    this._selectionId = null;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._range, this._text, this._forceMoveMarkers);
    this._selectionId = builder.trackSelection(this._initialSelection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
};

function addPositiveOffsetToModelPosition(model, position2, offset) {
  if (offset < 0) {
    throw new Error("Unexpected negative delta");
  }
  const lineCount = model.getLineCount();
  let endPosition = new Position(lineCount, model.getLineMaxColumn(lineCount));
  for (let lineNumber = position2.lineNumber; lineNumber <= lineCount; lineNumber++) {
    if (lineNumber === position2.lineNumber) {
      const futureOffset = offset - model.getLineMaxColumn(position2.lineNumber) + position2.column;
      if (futureOffset <= 0) {
        endPosition = new Position(position2.lineNumber, position2.column + offset);
        break;
      }
      offset = futureOffset;
    } else {
      const futureOffset = offset - model.getLineMaxColumn(lineNumber);
      if (futureOffset <= 0) {
        endPosition = new Position(lineNumber, offset);
        break;
      }
      offset = futureOffset;
    }
  }
  return endPosition;
}
export { addPositiveOffsetToModelPosition, ReplaceCommand, ReplaceOvertypeCommand, ReplaceCommandThatSelectsText, ReplaceCommandWithoutChangingPosition, ReplaceCommandWithOffsetCursorState, ReplaceOvertypeCommandOnCompositionEnd, ReplaceCommandThatPreservesSelection };
