// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/dnd/browser/dragAndDropCommand.ts
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/dnd/browser/dragAndDropCommand.ts
var DragAndDropCommand = class {
  constructor(selection, targetPosition, copy) {
    this.selection = selection;
    this.targetPosition = targetPosition;
    this.copy = copy;
    this.targetSelection = null;
  }
  getEditOperations(model, builder) {
    const text2 = model.getValueInRange(this.selection);
    if (!this.copy) {
      builder.addEditOperation(this.selection, null);
    }
    builder.addEditOperation(new Range2(this.targetPosition.lineNumber, this.targetPosition.column, this.targetPosition.lineNumber, this.targetPosition.column), text2);
    if (this.selection.containsPosition(this.targetPosition) && !(this.copy && (this.selection.getEndPosition().equals(this.targetPosition) || this.selection.getStartPosition().equals(this.targetPosition)))) {
      this.targetSelection = this.selection;
      return;
    }
    if (this.copy) {
      this.targetSelection = new Selection(
        this.targetPosition.lineNumber,
        this.targetPosition.column,
        this.selection.endLineNumber - this.selection.startLineNumber + this.targetPosition.lineNumber,
        this.selection.startLineNumber === this.selection.endLineNumber ? this.targetPosition.column + this.selection.endColumn - this.selection.startColumn : this.selection.endColumn
      );
      return;
    }
    if (this.targetPosition.lineNumber > this.selection.endLineNumber) {
      this.targetSelection = new Selection(
        this.targetPosition.lineNumber - this.selection.endLineNumber + this.selection.startLineNumber,
        this.targetPosition.column,
        this.targetPosition.lineNumber,
        this.selection.startLineNumber === this.selection.endLineNumber ? this.targetPosition.column + this.selection.endColumn - this.selection.startColumn : this.selection.endColumn
      );
      return;
    }
    if (this.targetPosition.lineNumber < this.selection.endLineNumber) {
      this.targetSelection = new Selection(
        this.targetPosition.lineNumber,
        this.targetPosition.column,
        this.targetPosition.lineNumber + this.selection.endLineNumber - this.selection.startLineNumber,
        this.selection.startLineNumber === this.selection.endLineNumber ? this.targetPosition.column + this.selection.endColumn - this.selection.startColumn : this.selection.endColumn
      );
      return;
    }
    if (this.selection.endColumn <= this.targetPosition.column) {
      this.targetSelection = new Selection(
        this.targetPosition.lineNumber - this.selection.endLineNumber + this.selection.startLineNumber,
        this.selection.startLineNumber === this.selection.endLineNumber ? this.targetPosition.column - this.selection.endColumn + this.selection.startColumn : this.targetPosition.column - this.selection.endColumn + this.selection.startColumn,
        this.targetPosition.lineNumber,
        this.selection.startLineNumber === this.selection.endLineNumber ? this.targetPosition.column : this.selection.endColumn
      );
    } else {
      this.targetSelection = new Selection(
        this.targetPosition.lineNumber - this.selection.endLineNumber + this.selection.startLineNumber,
        this.targetPosition.column,
        this.targetPosition.lineNumber,
        this.targetPosition.column + this.selection.endColumn - this.selection.startColumn
      );
    }
  }
  computeCursorState(model, helper) {
    return this.targetSelection;
  }
};
export { DragAndDropCommand };
