// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/insertFinalNewLine/browser/insertFinalNewLineCommand.ts
import { EditOperation } from "./module-0162.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/contrib/insertFinalNewLine/browser/insertFinalNewLineCommand.ts
var InsertFinalNewLineCommand = class {
  constructor(selection) {
    this._selection = selection;
    this._selectionId = null;
  }
  getEditOperations(model, builder) {
    const op = insertFinalNewLine(model);
    if (op) {
      builder.addEditOperation(op.range, op.text);
    }
    this._selectionId = builder.trackSelection(this._selection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
};

function insertFinalNewLine(model) {
  const lineCount = model.getLineCount();
  return EditOperation.insert(
    new Position(lineCount, model.getLineMaxColumn(lineCount)),
    model.getEOL()
  );
}
export { insertFinalNewLine, InsertFinalNewLineCommand };
