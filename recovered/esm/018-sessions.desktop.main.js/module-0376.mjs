// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/edits/lineEdit.ts
import { assert, checkAdjacentItems } from "./module-0009.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { compareBy, groupAdjacentBy, numberComparator } from "./module-0007.mjs";
import { StringEdit, StringReplacement } from "./module-0193.mjs";
import { LineRange } from "./module-0174.mjs";
import { splitLines } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/core/edits/lineEdit.ts
var LineEdit = class _LineEdit {
  constructor(replacements) {
    this.replacements = replacements;
    assert(checkAdjacentItems(replacements, (i1, i2) => i1.lineRange.endLineNumberExclusive <= i2.lineRange.startLineNumber));
  }
  static {
    this.empty = new _LineEdit([]);
  }
  static deserialize(data) {
    return new _LineEdit(data.map((e4) => LineReplacement.deserialize(e4)));
  }
  static fromStringEdit(edit3, initialValue) {
    const textEdit = TextEdit2.fromStringEdit(edit3, initialValue);
    return _LineEdit.fromTextEdit(textEdit, initialValue);
  }
  static fromTextEdit(edit3, initialValue) {
    const edits = edit3.replacements;
    const result = [];
    const currentEdits = [];
    for (let i2 = 0; i2 < edits.length; i2++) {
      const edit4 = edits[i2];
      const nextEditRange = i2 + 1 < edits.length ? edits[i2 + 1] : void 0;
      currentEdits.push(edit4);
      if (nextEditRange && nextEditRange.range.startLineNumber === edit4.range.endLineNumber) {
        continue;
      }
      const singleEdit = TextReplacement.joinReplacements(currentEdits, initialValue);
      currentEdits.length = 0;
      const singleLineEdit = LineReplacement.fromSingleTextEdit(singleEdit, initialValue);
      result.push(singleLineEdit);
    }
    return new _LineEdit(result);
  }
  static createFromUnsorted(edits) {
    const result = edits.slice();
    result.sort(compareBy((i2) => i2.lineRange.startLineNumber, numberComparator));
    return new _LineEdit(result);
  }
  isEmpty() {
    return this.replacements.length === 0;
  }
  toEdit(initialValue) {
    const edits = [];
    for (const edit3 of this.replacements) {
      const singleEdit = edit3.toSingleEdit(initialValue);
      edits.push(singleEdit);
    }
    return new StringEdit(edits);
  }
  toString() {
    return this.replacements.map((e4) => e4.toString()).join(",");
  }
  serialize() {
    return this.replacements.map((e4) => e4.serialize());
  }
  getNewLineRanges() {
    const ranges = [];
    let offset = 0;
    for (const e4 of this.replacements) {
      ranges.push(LineRange.ofLength(e4.lineRange.startLineNumber + offset, e4.newLines.length));
      offset += e4.newLines.length - e4.lineRange.length;
    }
    return ranges;
  }
  mapLineNumber(lineNumber) {
    let lineDelta = 0;
    for (const e4 of this.replacements) {
      if (e4.lineRange.endLineNumberExclusive > lineNumber) {
        break;
      }
      lineDelta += e4.newLines.length - e4.lineRange.length;
    }
    return lineNumber + lineDelta;
  }
  mapLineRange(lineRange) {
    return new LineRange(
      this.mapLineNumber(lineRange.startLineNumber),
      this.mapLineNumber(lineRange.endLineNumberExclusive)
    );
  }
  /** TODO improve, dont require originalLines */
  mapBackLineRange(lineRange, originalLines) {
    const i2 = this.inverse(originalLines);
    return i2.mapLineRange(lineRange);
  }
  touches(other) {
    return this.replacements.some((e1) => other.replacements.some((e22) => e1.lineRange.intersect(e22.lineRange)));
  }
  rebase(base) {
    return new _LineEdit(
      this.replacements.map((e4) => new LineReplacement(base.mapLineRange(e4.lineRange), e4.newLines))
    );
  }
  humanReadablePatch(originalLines) {
    const result = [];
    function pushLine(originalLineNumber, modifiedLineNumber, kind, content) {
      const specialChar = kind === "unmodified" ? " " : kind === "deleted" ? "-" : "+";
      if (content === void 0) {
        content = "[[[[[ WARNING: LINE DOES NOT EXIST ]]]]]";
      }
      const origLn = originalLineNumber === -1 ? "   " : originalLineNumber.toString().padStart(3, " ");
      const modLn = modifiedLineNumber === -1 ? "   " : modifiedLineNumber.toString().padStart(3, " ");
      result.push(`${specialChar} ${origLn} ${modLn} ${content}`);
    }
    function pushSeperator() {
      result.push("---");
    }
    let lineDelta = 0;
    let first2 = true;
    for (const edits of groupAdjacentBy(this.replacements, (e1, e22) => e1.lineRange.distanceToRange(e22.lineRange) <= 5)) {
      if (!first2) {
        pushSeperator();
      } else {
        first2 = false;
      }
      let lastLineNumber = edits[0].lineRange.startLineNumber - 2;
      for (const edit3 of edits) {
        for (let i2 = Math.max(1, lastLineNumber); i2 < edit3.lineRange.startLineNumber; i2++) {
          pushLine(i2, i2 + lineDelta, "unmodified", originalLines[i2 - 1]);
        }
        const range2 = edit3.lineRange;
        const newLines = edit3.newLines;
        for (const replaceLineNumber of range2.mapToLineArray((n2) => n2)) {
          const line = originalLines[replaceLineNumber - 1];
          pushLine(replaceLineNumber, -1, "deleted", line);
        }
        for (let i2 = 0; i2 < newLines.length; i2++) {
          const line = newLines[i2];
          pushLine(-1, range2.startLineNumber + lineDelta + i2, "added", line);
        }
        lastLineNumber = range2.endLineNumberExclusive;
        lineDelta += edit3.newLines.length - edit3.lineRange.length;
      }
      for (let i2 = lastLineNumber; i2 <= Math.min(lastLineNumber + 2, originalLines.length); i2++) {
        pushLine(i2, i2 + lineDelta, "unmodified", originalLines[i2 - 1]);
      }
    }
    return result.join("\n");
  }
  apply(lines) {
    const result = [];
    let currentLineIndex = 0;
    for (const edit3 of this.replacements) {
      while (currentLineIndex < edit3.lineRange.startLineNumber - 1) {
        result.push(lines[currentLineIndex]);
        currentLineIndex++;
      }
      for (const newLine of edit3.newLines) {
        result.push(newLine);
      }
      currentLineIndex = edit3.lineRange.endLineNumberExclusive - 1;
    }
    while (currentLineIndex < lines.length) {
      result.push(lines[currentLineIndex]);
      currentLineIndex++;
    }
    return result;
  }
  inverse(originalLines) {
    const newRanges = this.getNewLineRanges();
    return new _LineEdit(this.replacements.map((e4, idx) => new LineReplacement(
      newRanges[idx],
      originalLines.slice(e4.lineRange.startLineNumber - 1, e4.lineRange.endLineNumberExclusive - 1)
    )));
  }
};

var LineReplacement = class _LineReplacement {
  constructor(lineRange, newLines) {
    this.lineRange = lineRange;
    this.newLines = newLines;
  }
  static deserialize(e4) {
    return new _LineReplacement(
      LineRange.ofLength(e4[0], e4[1] - e4[0]),
      e4[2]
    );
  }
  static fromSingleTextEdit(edit3, initialValue) {
    const newLines = splitLines(edit3.text);
    let startLineNumber = edit3.range.startLineNumber;
    const survivingFirstLineText = initialValue.getValueOfRange(Range2.fromPositions(
      new Position(edit3.range.startLineNumber, 1),
      edit3.range.getStartPosition()
    ));
    newLines[0] = survivingFirstLineText + newLines[0];
    let endLineNumberEx = edit3.range.endLineNumber + 1;
    const editEndLineNumberMaxColumn = initialValue.getTransformer().getLineLength(edit3.range.endLineNumber) + 1;
    const survivingEndLineText = initialValue.getValueOfRange(Range2.fromPositions(
      edit3.range.getEndPosition(),
      new Position(edit3.range.endLineNumber, editEndLineNumberMaxColumn)
    ));
    newLines[newLines.length - 1] = newLines[newLines.length - 1] + survivingEndLineText;
    const startBeforeNewLine = edit3.range.startColumn === initialValue.getTransformer().getLineLength(edit3.range.startLineNumber) + 1;
    const endAfterNewLine = edit3.range.endColumn === 1;
    if (startBeforeNewLine && newLines[0].length === survivingFirstLineText.length) {
      startLineNumber++;
      newLines.shift();
    }
    if (newLines.length > 0 && startLineNumber < endLineNumberEx && endAfterNewLine && newLines[newLines.length - 1].length === survivingEndLineText.length) {
      endLineNumberEx--;
      newLines.pop();
    }
    return new _LineReplacement(new LineRange(startLineNumber, endLineNumberEx), newLines);
  }
  toSingleTextEdit(initialValue) {
    if (this.newLines.length === 0) {
      const textLen = initialValue.getTransformer().textLength;
      if (this.lineRange.endLineNumberExclusive === textLen.lineCount + 2) {
        let startPos;
        if (this.lineRange.startLineNumber > 1) {
          const startLineNumber = this.lineRange.startLineNumber - 1;
          const startColumn = initialValue.getTransformer().getLineLength(startLineNumber) + 1;
          startPos = new Position(startLineNumber, startColumn);
        } else {
          startPos = new Position(1, 1);
        }
        const lastPosition = textLen.addToPosition(new Position(1, 1));
        return new TextReplacement(Range2.fromPositions(startPos, lastPosition), "");
      } else {
        return new TextReplacement(new Range2(this.lineRange.startLineNumber, 1, this.lineRange.endLineNumberExclusive, 1), "");
      }
    } else if (this.lineRange.isEmpty) {
      let endLineNumber;
      let column;
      let text2;
      const insertionLine = this.lineRange.startLineNumber;
      if (insertionLine === initialValue.getTransformer().textLength.lineCount + 2) {
        endLineNumber = insertionLine - 1;
        column = initialValue.getTransformer().getLineLength(endLineNumber) + 1;
        text2 = this.newLines.map((l) => "\n" + l).join("");
      } else {
        endLineNumber = insertionLine;
        column = 1;
        text2 = this.newLines.map((l) => l + "\n").join("");
      }
      return new TextReplacement(Range2.fromPositions(new Position(endLineNumber, column)), text2);
    } else {
      const endLineNumber = this.lineRange.endLineNumberExclusive - 1;
      const endLineNumberMaxColumn = initialValue.getTransformer().getLineLength(endLineNumber) + 1;
      const range2 = new Range2(
        this.lineRange.startLineNumber,
        1,
        endLineNumber,
        endLineNumberMaxColumn
      );
      const text2 = this.newLines.join("\n");
      return new TextReplacement(range2, text2);
    }
  }
  toSingleEdit(initialValue) {
    const textEdit = this.toSingleTextEdit(initialValue);
    const range2 = initialValue.getTransformer().getOffsetRange(textEdit.range);
    return new StringReplacement(range2, textEdit.text);
  }
  toString() {
    return `${this.lineRange}->${JSON.stringify(this.newLines)}`;
  }
  serialize() {
    return [
      this.lineRange.startLineNumber,
      this.lineRange.endLineNumberExclusive,
      this.newLines
    ];
  }
  removeCommonSuffixPrefixLines(initialValue) {
    let startLineNumber = this.lineRange.startLineNumber;
    let endLineNumberEx = this.lineRange.endLineNumberExclusive;
    let trimStartCount = 0;
    while (startLineNumber < endLineNumberEx && trimStartCount < this.newLines.length && this.newLines[trimStartCount] === initialValue.getLineAt(startLineNumber)) {
      startLineNumber++;
      trimStartCount++;
    }
    let trimEndCount = 0;
    while (startLineNumber < endLineNumberEx && trimEndCount + trimStartCount < this.newLines.length && this.newLines[this.newLines.length - 1 - trimEndCount] === initialValue.getLineAt(endLineNumberEx - 1)) {
      endLineNumberEx--;
      trimEndCount++;
    }
    if (trimStartCount === 0 && trimEndCount === 0) {
      return this;
    }
    return new _LineReplacement(new LineRange(startLineNumber, endLineNumberEx), this.newLines.slice(trimStartCount, this.newLines.length - trimEndCount));
  }
  toLineEdit() {
    return new LineEdit([this]);
  }
};

var SerializedLineReplacement;

((SerializedLineReplacement2) => {
  function is(thing) {
    return Array.isArray(thing) && thing.length === 3 && typeof thing[0] === "number" && typeof thing[1] === "number" && Array.isArray(thing[2]) && thing[2].every((e4) => typeof e4 === "string");
  }
  SerializedLineReplacement2.is = is;
})(SerializedLineReplacement || (SerializedLineReplacement = {}));
export { LineEdit, LineReplacement, SerializedLineReplacement };
