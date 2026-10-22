// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/text/abstractText.ts
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { PositionOffsetTransformer } from "./module-0176.mjs";
import { splitLines } from "./module-0030.mjs";
import { assert } from "./module-0009.mjs";
import { TextLength } from "./module-0175.mjs";


// src/vs/editor/common/core/text/abstractText.ts
var AbstractText = class {
  constructor() {
    this._transformer = void 0;
  }
  get endPositionExclusive() {
    return this.length.addToPosition(new Position(1, 1));
  }
  get lineRange() {
    return this.length.toLineRange();
  }
  getValue() {
    return this.getValueOfRange(this.length.toRange());
  }
  getValueOfOffsetRange(range2) {
    return this.getValueOfRange(this.getTransformer().getRange(range2));
  }
  getLineLength(lineNumber) {
    return this.getValueOfRange(new Range2(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER)).length;
  }
  getTransformer() {
    if (!this._transformer) {
      this._transformer = new PositionOffsetTransformer(this.getValue());
    }
    return this._transformer;
  }
  getLineAt(lineNumber) {
    return this.getValueOfRange(new Range2(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER));
  }
  getLines() {
    const value2 = this.getValue();
    return splitLines(value2);
  }
  getLinesOfRange(range2) {
    return range2.mapToLineArray((lineNumber) => this.getLineAt(lineNumber));
  }
  equals(other) {
    if (this === other) {
      return true;
    }
    return this.getValue() === other.getValue();
  }
};

var LineBasedText = class extends AbstractText {
  constructor(_getLineContent, _lineCount) {
    assert(_lineCount >= 1);
    super();
    this._getLineContent = _getLineContent;
    this._lineCount = _lineCount;
  }
  getValueOfRange(range2) {
    if (range2.startLineNumber === range2.endLineNumber) {
      return this._getLineContent(range2.startLineNumber).substring(range2.startColumn - 1, range2.endColumn - 1);
    }
    let result = this._getLineContent(range2.startLineNumber).substring(range2.startColumn - 1);
    for (let i2 = range2.startLineNumber + 1; i2 < range2.endLineNumber; i2++) {
      result += "\n" + this._getLineContent(i2);
    }
    result += "\n" + this._getLineContent(range2.endLineNumber).substring(0, range2.endColumn - 1);
    return result;
  }
  getLineLength(lineNumber) {
    return this._getLineContent(lineNumber).length;
  }
  get length() {
    const lastLine = this._getLineContent(this._lineCount);
    return new TextLength(this._lineCount - 1, lastLine.length);
  }
};

var ArrayText = class extends LineBasedText {
  constructor(lines) {
    super(
      (lineNumber) => lines[lineNumber - 1],
      lines.length
    );
  }
};

var StringText = class extends AbstractText {
  constructor(value2) {
    super();
    this.value = value2;
    this._t = new PositionOffsetTransformer(this.value);
  }
  getValueOfRange(range2) {
    return this._t.getOffsetRange(range2).substring(this.value);
  }
  get length() {
    return this._t.textLength;
  }
  // Override the getTransformer method to return the cached transformer
  getTransformer() {
    return this._t;
  }
};
export { AbstractText, LineBasedText, ArrayText, StringText };
