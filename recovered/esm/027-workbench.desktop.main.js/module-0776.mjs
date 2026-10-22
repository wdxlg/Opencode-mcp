// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditWithChanges.ts
import { LineReplacement } from "./module-0376.mjs";
import { LineRange } from "./module-0174.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditWithChanges.ts
var InlineEditWithChanges = class {
  constructor(originalText, action, edit3, cursorPosition, multiCursorPositions, commands, inlineCompletion) {
    this.originalText = originalText;
    this.action = action;
    this.edit = edit3;
    this.cursorPosition = cursorPosition;
    this.multiCursorPositions = multiCursorPositions;
    this.commands = commands;
    this.inlineCompletion = inlineCompletion;
  }
  // TODO@hediet: Move the next 3 fields into the action
  get lineEdit() {
    if (this.action?.kind === "jumpTo") {
      return new LineReplacement(LineRange.ofLength(this.action.position.lineNumber, 0), []);
    } else if (this.action?.kind === "edit") {
      return LineReplacement.fromSingleTextEdit(this.edit.toReplacement(this.originalText), this.originalText);
    }
    return new LineReplacement(new LineRange(1, 1), []);
  }
  get originalLineRange() {
    return this.lineEdit.lineRange;
  }
  get modifiedLineRange() {
    return this.lineEdit.toLineEdit().getNewLineRanges()[0];
  }
  get displayRange() {
    return this.originalText.lineRange.intersect(
      this.originalLineRange.join(
        LineRange.ofLength(this.originalLineRange.startLineNumber, this.lineEdit.newLines.length)
      )
    );
  }
};
export { InlineEditWithChanges };
