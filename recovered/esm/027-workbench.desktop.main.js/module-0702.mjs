// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/commands/trimTrailingWhitespaceCommand.ts
import { lastNonWhitespaceIndex } from "./module-0030.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/commands/trimTrailingWhitespaceCommand.ts
var TrimTrailingWhitespaceCommand = class {
  constructor(selection, cursors, trimInRegexesAndStrings) {
    this._selection = selection;
    this._cursors = cursors;
    this._selectionId = null;
    this._trimInRegexesAndStrings = trimInRegexesAndStrings;
  }
  getEditOperations(model, builder) {
    const ops = trimTrailingWhitespace(model, this._cursors, this._trimInRegexesAndStrings);
    for (let i2 = 0, len = ops.length; i2 < len; i2++) {
      const op = ops[i2];
      builder.addEditOperation(op.range, op.text);
    }
    this._selectionId = builder.trackSelection(this._selection);
  }
  computeCursorState(model, helper) {
    return helper.getTrackedSelection(this._selectionId);
  }
};

function trimTrailingWhitespace(model, cursors, trimInRegexesAndStrings) {
  cursors.sort((a, b) => {
    if (a.lineNumber === b.lineNumber) {
      return a.column - b.column;
    }
    return a.lineNumber - b.lineNumber;
  });
  for (let i2 = cursors.length - 2; i2 >= 0; i2--) {
    if (cursors[i2].lineNumber === cursors[i2 + 1].lineNumber) {
      cursors.splice(i2, 1);
    }
  }
  const r2 = [];
  let rLen = 0;
  let cursorIndex = 0;
  const cursorLen = cursors.length;
  for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
    const lineContent = model.getLineContent(lineNumber);
    const maxLineColumn = lineContent.length + 1;
    let minEditColumn = 0;
    if (cursorIndex < cursorLen && cursors[cursorIndex].lineNumber === lineNumber) {
      minEditColumn = cursors[cursorIndex].column;
      cursorIndex++;
      if (minEditColumn === maxLineColumn) {
        continue;
      }
    }
    if (lineContent.length === 0) {
      continue;
    }
    const lastNonWhitespaceIndex2 = lastNonWhitespaceIndex(lineContent);
    let fromColumn = 0;
    if (lastNonWhitespaceIndex2 === -1) {
      fromColumn = 1;
    } else if (lastNonWhitespaceIndex2 !== lineContent.length - 1) {
      fromColumn = lastNonWhitespaceIndex2 + 2;
    } else {
      continue;
    }
    if (!trimInRegexesAndStrings) {
      if (!model.tokenization.hasAccurateTokensForLine(lineNumber)) {
        continue;
      }
      const lineTokens = model.tokenization.getLineTokens(lineNumber);
      const fromColumnType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(fromColumn));
      if (fromColumnType === 2 /* String */ || fromColumnType === 3 /* RegEx */) {
        continue;
      }
    }
    fromColumn = Math.max(minEditColumn, fromColumn);
    r2[rLen++] = EditOperation.delete(new Range2(
      lineNumber,
      fromColumn,
      lineNumber,
      maxLineColumn
    ));
  }
  return r2;
}
export { trimTrailingWhitespace, TrimTrailingWhitespaceCommand };
