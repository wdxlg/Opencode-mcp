// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/ghostText.ts
import { assertFn, checkAdjacentItems } from "./module-0009.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { splitLines } from "./module-0030.mjs";
import { LineDecoration } from "./module-0245.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/ghostText.ts
var GhostText = class {
  constructor(lineNumber, parts) {
    this.lineNumber = lineNumber;
    this.parts = parts;
    assertFn(() => checkAdjacentItems(parts, (p1, p2) => p1.column <= p2.column));
  }
  equals(other) {
    return this.lineNumber === other.lineNumber && this.parts.length === other.parts.length && this.parts.every((part, index2) => part.equals(other.parts[index2]));
  }
  /**
   * Only used for testing/debugging.
  */
  render(documentText, debug = false) {
    return new TextEdit2([
      ...this.parts.map((p) => new TextReplacement(
        Range2.fromPositions(new Position(this.lineNumber, p.column)),
        debug ? `[${p.lines.map((line) => line.line).join("\n")}]` : p.lines.map((line) => line.line).join("\n")
      ))
    ]).applyToString(documentText);
  }
  renderForScreenReader(lineText) {
    if (this.parts.length === 0) {
      return "";
    }
    const lastPart = this.parts[this.parts.length - 1];
    const cappedLineText = lineText.substr(0, lastPart.column - 1);
    const text2 = new TextEdit2([
      ...this.parts.map((p) => new TextReplacement(
        Range2.fromPositions(new Position(1, p.column)),
        p.lines.map((line) => line.line).join("\n")
      ))
    ]).applyToString(cappedLineText);
    return text2.substring(this.parts[0].column - 1);
  }
  isEmpty() {
    return this.parts.every((p) => p.lines.length === 0);
  }
  get lineCount() {
    return 1 + this.parts.reduce((r2, p) => r2 + p.lines.length - 1, 0);
  }
};

var GhostTextPart = class {
  constructor(column, text2, preview, _inlineDecorations = []) {
    this.column = column;
    this.text = text2;
    this.preview = preview;
    this._inlineDecorations = _inlineDecorations;
    this.lines = splitLines(this.text).map((line, i2) => ({
      line,
      lineDecorations: LineDecoration.filter(this._inlineDecorations, i2 + 1, 1, line.length + 1)
    }));
  }
  equals(other) {
    return this.column === other.column && this.lines.length === other.lines.length && this.lines.every(
      (line, index2) => line.line === other.lines[index2].line && LineDecoration.equalsArr(line.lineDecorations, other.lines[index2].lineDecorations)
    );
  }
};

var GhostTextReplacement = class {
  constructor(lineNumber, columnRange, text2, additionalReservedLineCount = 0) {
    this.lineNumber = lineNumber;
    this.columnRange = columnRange;
    this.text = text2;
    this.additionalReservedLineCount = additionalReservedLineCount;
    this.parts = [
      new GhostTextPart(
        this.columnRange.endColumnExclusive,
        this.text,
        false
      )
    ];
    this.newLines = splitLines(this.text);
  }
  renderForScreenReader(_lineText) {
    return this.newLines.join("\n");
  }
  render(documentText, debug = false) {
    const replaceRange = this.columnRange.toRange(this.lineNumber);
    if (debug) {
      return new TextEdit2([
        new TextReplacement(Range2.fromPositions(replaceRange.getStartPosition()), "("),
        new TextReplacement(Range2.fromPositions(replaceRange.getEndPosition()), `)[${this.newLines.join("\n")}]`)
      ]).applyToString(documentText);
    } else {
      return new TextEdit2([
        new TextReplacement(replaceRange, this.newLines.join("\n"))
      ]).applyToString(documentText);
    }
  }
  get lineCount() {
    return this.newLines.length;
  }
  isEmpty() {
    return this.parts.every((p) => p.lines.length === 0);
  }
  equals(other) {
    return this.lineNumber === other.lineNumber && this.columnRange.equals(other.columnRange) && this.newLines.length === other.newLines.length && this.newLines.every((line, index2) => line === other.newLines[index2]) && this.additionalReservedLineCount === other.additionalReservedLineCount;
  }
};

function ghostTextsOrReplacementsEqual(a, b) {
  return equals(a, b, ghostTextOrReplacementEquals);
}

function ghostTextOrReplacementEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a instanceof GhostText && b instanceof GhostText) {
    return a.equals(b);
  }
  if (a instanceof GhostTextReplacement && b instanceof GhostTextReplacement) {
    return a.equals(b);
  }
  return false;
}
export { ghostTextsOrReplacementsEqual, ghostTextOrReplacementEquals, GhostText, GhostTextPart, GhostTextReplacement };
