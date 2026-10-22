// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/replaceAllCommand.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/find/browser/replaceAllCommand.ts
var ReplaceAllCommand = class {
  constructor(editorSelection, ranges, replaceStrings) {
    this._editorSelection = editorSelection;
    this._ranges = ranges;
    this._replaceStrings = replaceStrings;
    this._trackedEditorSelectionId = null;
  }
  getEditOperations(model, builder) {
    if (this._ranges.length > 0) {
      const ops = [];
      for (let i2 = 0; i2 < this._ranges.length; i2++) {
        ops.push({
          range: this._ranges[i2],
          text: this._replaceStrings[i2]
        });
      }
      ops.sort((o1, o2) => {
        return Range2.compareRangesUsingStarts(o1.range, o2.range);
      });
      const resultOps = [];
      let previousOp = ops[0];
      for (let i2 = 1; i2 < ops.length; i2++) {
        if (previousOp.range.endLineNumber === ops[i2].range.startLineNumber && previousOp.range.endColumn === ops[i2].range.startColumn) {
          previousOp.range = previousOp.range.plusRange(ops[i2].range);
          previousOp.text = previousOp.text + ops[i2].text;
        } else {
          resultOps.push(previousOp);
          previousOp = ops[i2];
        }
      }
      resultOps.push(previousOp);
      for (const op of resultOps) {
        builder.addEditOperation(op.range, op.text);
      }
    }
    this._trackedEditorSelectionId = builder.trackSelection(this._editorSelection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._trackedEditorSelectionId);
  }
};
export { ReplaceAllCommand };
