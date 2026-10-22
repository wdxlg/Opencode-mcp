// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/linesOperations/browser/sortLinesCommand.ts
import { safeIntl } from "./module-0120.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/linesOperations/browser/sortLinesCommand.ts
var SortLinesCommand = class {
  static {
    this._COLLATOR = safeIntl.Collator();
  }
  constructor(selection, descending) {
    this.selection = selection;
    this.descending = descending;
    this.selectionId = null;
  }
  getEditOperations(model, builder) {
    const op = sortLines(model, this.selection, this.descending);
    if (op) {
      builder.addEditOperation(op.range, op.text);
    }
    this.selectionId = builder.trackSelection(this.selection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this.selectionId);
  }
  static canRun(model, selection, descending) {
    if (model === null) {
      return false;
    }
    const data = getSortData(model, selection, descending);
    if (!data) {
      return false;
    }
    for (let i2 = 0, len = data.before.length; i2 < len; i2++) {
      if (data.before[i2] !== data.after[i2]) {
        return true;
      }
    }
    return false;
  }
};

function getSortData(model, selection, descending) {
  const startLineNumber = selection.startLineNumber;
  let endLineNumber = selection.endLineNumber;
  if (selection.endColumn === 1) {
    endLineNumber--;
  }
  if (startLineNumber >= endLineNumber) {
    return null;
  }
  const linesToSort = [];
  for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
    linesToSort.push(model.getLineContent(lineNumber));
  }
  let sorted = linesToSort.slice(0);
  sorted.sort(SortLinesCommand._COLLATOR.value.compare);
  if (descending === true) {
    sorted = sorted.reverse();
  }
  return {
    startLineNumber,
    endLineNumber,
    before: linesToSort,
    after: sorted
  };
}

function sortLines(model, selection, descending) {
  const data = getSortData(model, selection, descending);
  if (!data) {
    return null;
  }
  return EditOperation.replace(
    new Range2(data.startLineNumber, 1, data.endLineNumber, model.getLineMaxColumn(data.endLineNumber)),
    data.after.join("\n")
  );
}
export { getSortData, sortLines, SortLinesCommand };
