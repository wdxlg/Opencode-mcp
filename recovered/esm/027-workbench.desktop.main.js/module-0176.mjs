// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/text/positionToOffsetImpl.ts
import { OffsetRange } from "./module-0144.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { findLastIdxMonotonous } from "./module-0006.mjs";


// src/vs/editor/common/core/text/positionToOffsetImpl.ts
var PositionOffsetTransformerBase = class {
  getOffsetRange(range2) {
    return new OffsetRange(
      this.getOffset(range2.getStartPosition()),
      this.getOffset(range2.getEndPosition())
    );
  }
  getRange(offsetRange) {
    return Range2.fromPositions(
      this.getPosition(offsetRange.start),
      this.getPosition(offsetRange.endExclusive)
    );
  }
  getStringEdit(edit3) {
    const edits = edit3.replacements.map((e) => this.getStringReplacement(e));
    return new Deps.deps.StringEdit(edits);
  }
  getStringReplacement(edit3) {
    return new Deps.deps.StringReplacement(this.getOffsetRange(edit3.range), edit3.text);
  }
  getTextReplacement(edit3) {
    return new Deps.deps.TextReplacement(this.getRange(edit3.replaceRange), edit3.newText);
  }
  getTextEdit(edit3) {
    const edits = edit3.replacements.map((e) => this.getTextReplacement(e));
    return new Deps.deps.TextEdit(edits);
  }
};

var Deps = class {
  static {
    this._deps = void 0;
  }
  static get deps() {
    if (!this._deps) {
      throw new Error("Dependencies not set. Call _setDependencies first.");
    }
    return this._deps;
  }
};

function _setPositionOffsetTransformerDependencies(deps) {
  Deps._deps = deps;
}

var PositionOffsetTransformer = class extends PositionOffsetTransformerBase {
  constructor(text2) {
    super();
    this.text = text2;
  }
  get lineStartOffsetByLineIdx() {
    if (!this._lineStartOffsetByLineIdx) {
      this._computeLineOffsets();
    }
    return this._lineStartOffsetByLineIdx;
  }
  get lineEndOffsetByLineIdx() {
    if (!this._lineEndOffsetByLineIdx) {
      this._computeLineOffsets();
    }
    return this._lineEndOffsetByLineIdx;
  }
  _computeLineOffsets() {
    this._lineStartOffsetByLineIdx = [];
    this._lineEndOffsetByLineIdx = [];
    this._lineStartOffsetByLineIdx.push(0);
    for (let i2 = 0; i2 < this.text.length; i2++) {
      if (this.text.charAt(i2) === "\n") {
        this._lineStartOffsetByLineIdx.push(i2 + 1);
        if (i2 > 0 && this.text.charAt(i2 - 1) === "\r") {
          this._lineEndOffsetByLineIdx.push(i2 - 1);
        } else {
          this._lineEndOffsetByLineIdx.push(i2);
        }
      }
    }
    this._lineEndOffsetByLineIdx.push(this.text.length);
  }
  getOffset(position2) {
    const valPos = this._validatePosition(position2);
    return this.lineStartOffsetByLineIdx[valPos.lineNumber - 1] + valPos.column - 1;
  }
  _validatePosition(position2) {
    if (position2.lineNumber < 1) {
      return new Position(1, 1);
    }
    const lineCount = this.textLength.lineCount + 1;
    if (position2.lineNumber > lineCount) {
      const lineLength2 = this.getLineLength(lineCount);
      return new Position(lineCount, lineLength2 + 1);
    }
    if (position2.column < 1) {
      return new Position(position2.lineNumber, 1);
    }
    const lineLength = this.getLineLength(position2.lineNumber);
    if (position2.column - 1 > lineLength) {
      return new Position(position2.lineNumber, lineLength + 1);
    }
    return position2;
  }
  getPosition(offset) {
    const idx = findLastIdxMonotonous(this.lineStartOffsetByLineIdx, (i2) => i2 <= offset);
    const lineNumber = idx + 1;
    const column = offset - this.lineStartOffsetByLineIdx[idx] + 1;
    return new Position(lineNumber, column);
  }
  getTextLength(offsetRange) {
    return Deps.deps.TextLength.ofRange(this.getRange(offsetRange));
  }
  get textLength() {
    const lineIdx = this.lineStartOffsetByLineIdx.length - 1;
    return new Deps.deps.TextLength(lineIdx, this.text.length - this.lineStartOffsetByLineIdx[lineIdx]);
  }
  getLineLength(lineNumber) {
    return this.lineEndOffsetByLineIdx[lineNumber - 1] - this.lineStartOffsetByLineIdx[lineNumber - 1];
  }
};
export { _setPositionOffsetTransformerDependencies, PositionOffsetTransformerBase, Deps, PositionOffsetTransformer };
