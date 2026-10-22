// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/diffWorkerMain.js
// Original module marker: src/vs/editor/common/core/text/abstractText.ts
import { Position } from "./module-0007.mjs";
import { Range } from "./module-0008.mjs";
import { PositionOffsetTransformer } from "./module-0026.mjs";
import { splitLines } from "./module-0024.mjs";
import { assert } from "./module-0005.mjs";
import { TextLength } from "./module-0025.mjs";


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
  getValueOfOffsetRange(range) {
    return this.getValueOfRange(this.getTransformer().getRange(range));
  }
  getLineLength(lineNumber) {
    return this.getValueOfRange(new Range(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER)).length;
  }
  getTransformer() {
    if (!this._transformer) {
      this._transformer = new PositionOffsetTransformer(this.getValue());
    }
    return this._transformer;
  }
  getLineAt(lineNumber) {
    return this.getValueOfRange(new Range(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER));
  }
  getLines() {
    const value = this.getValue();
    return splitLines(value);
  }
  getLinesOfRange(range) {
    return range.mapToLineArray((lineNumber) => this.getLineAt(lineNumber));
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
  getValueOfRange(range) {
    if (range.startLineNumber === range.endLineNumber) {
      return this._getLineContent(range.startLineNumber).substring(range.startColumn - 1, range.endColumn - 1);
    }
    let result = this._getLineContent(range.startLineNumber).substring(range.startColumn - 1);
    for (let i = range.startLineNumber + 1; i < range.endLineNumber; i++) {
      result += "\n" + this._getLineContent(i);
    }
    result += "\n" + this._getLineContent(range.endLineNumber).substring(0, range.endColumn - 1);
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
  constructor(value) {
    super();
    this.value = value;
    this._t = new PositionOffsetTransformer(this.value);
  }
  getValueOfRange(range) {
    return this._t.getOffsetRange(range).substring(this.value);
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
