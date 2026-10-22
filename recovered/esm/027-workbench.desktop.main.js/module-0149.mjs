// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/commands/surroundSelectionCommand.ts
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/common/commands/surroundSelectionCommand.ts
var SurroundSelectionCommand = class {
  constructor(range2, charBeforeSelection, charAfterSelection) {
    this._range = range2;
    this._charBeforeSelection = charBeforeSelection;
    this._charAfterSelection = charAfterSelection;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(new Range2(
      this._range.startLineNumber,
      this._range.startColumn,
      this._range.startLineNumber,
      this._range.startColumn
    ), this._charBeforeSelection);
    builder.addTrackedEditOperation(new Range2(
      this._range.endLineNumber,
      this._range.endColumn,
      this._range.endLineNumber,
      this._range.endColumn
    ), this._charAfterSelection || null);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const firstOperationRange = inverseEditOperations[0].range;
    const secondOperationRange = inverseEditOperations[1].range;
    return new Selection(
      firstOperationRange.endLineNumber,
      firstOperationRange.endColumn,
      secondOperationRange.endLineNumber,
      secondOperationRange.endColumn - this._charAfterSelection.length
    );
  }
};

var CompositionSurroundSelectionCommand = class {
  constructor(_position, _text, _charAfter) {
    this._position = _position;
    this._text = _text;
    this._charAfter = _charAfter;
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(new Range2(
      this._position.lineNumber,
      this._position.column,
      this._position.lineNumber,
      this._position.column
    ), this._text + this._charAfter);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const opRange = inverseEditOperations[0].range;
    return new Selection(
      opRange.endLineNumber,
      opRange.startColumn,
      opRange.endLineNumber,
      opRange.endColumn - this._charAfter.length
    );
  }
};
export { SurroundSelectionCommand, CompositionSurroundSelectionCommand };
