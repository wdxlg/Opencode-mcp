// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/text/textLength.ts
import { Range2 } from "./module-0106.mjs";
import { LineRange } from "./module-0174.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/core/text/textLength.ts
var TextLength = class _TextLength {
  constructor(lineCount, columnCount) {
    this.lineCount = lineCount;
    this.columnCount = columnCount;
  }
  static {
    this.zero = new _TextLength(0, 0);
  }
  static lengthDiffNonNegative(start, end) {
    if (end.isLessThan(start)) {
      return _TextLength.zero;
    }
    if (start.lineCount === end.lineCount) {
      return new _TextLength(0, end.columnCount - start.columnCount);
    } else {
      return new _TextLength(end.lineCount - start.lineCount, end.columnCount);
    }
  }
  static betweenPositions(position1, position2) {
    if (position1.lineNumber === position2.lineNumber) {
      return new _TextLength(0, position2.column - position1.column);
    } else {
      return new _TextLength(position2.lineNumber - position1.lineNumber, position2.column - 1);
    }
  }
  static fromPosition(pos) {
    return new _TextLength(pos.lineNumber - 1, pos.column - 1);
  }
  static ofRange(range2) {
    return _TextLength.betweenPositions(range2.getStartPosition(), range2.getEndPosition());
  }
  static ofText(text2) {
    let line = 0;
    let column = 0;
    for (const c of text2) {
      if (c === "\n") {
        line++;
        column = 0;
      } else {
        column++;
      }
    }
    return new _TextLength(line, column);
  }
  static ofSubstr(str, range2) {
    return _TextLength.ofText(range2.substring(str));
  }
  static sum(fragments, getLength) {
    return fragments.reduce((acc, f) => acc.add(getLength(f)), _TextLength.zero);
  }
  isZero() {
    return this.lineCount === 0 && this.columnCount === 0;
  }
  isLessThan(other) {
    if (this.lineCount !== other.lineCount) {
      return this.lineCount < other.lineCount;
    }
    return this.columnCount < other.columnCount;
  }
  isGreaterThan(other) {
    if (this.lineCount !== other.lineCount) {
      return this.lineCount > other.lineCount;
    }
    return this.columnCount > other.columnCount;
  }
  isGreaterThanOrEqualTo(other) {
    if (this.lineCount !== other.lineCount) {
      return this.lineCount > other.lineCount;
    }
    return this.columnCount >= other.columnCount;
  }
  equals(other) {
    return this.lineCount === other.lineCount && this.columnCount === other.columnCount;
  }
  compare(other) {
    if (this.lineCount !== other.lineCount) {
      return this.lineCount - other.lineCount;
    }
    return this.columnCount - other.columnCount;
  }
  add(other) {
    if (other.lineCount === 0) {
      return new _TextLength(this.lineCount, this.columnCount + other.columnCount);
    } else {
      return new _TextLength(this.lineCount + other.lineCount, other.columnCount);
    }
  }
  createRange(startPosition) {
    if (this.lineCount === 0) {
      return new Range2(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column + this.columnCount);
    } else {
      return new Range2(startPosition.lineNumber, startPosition.column, startPosition.lineNumber + this.lineCount, this.columnCount + 1);
    }
  }
  toRange() {
    return new Range2(1, 1, this.lineCount + 1, this.columnCount + 1);
  }
  toLineRange() {
    return LineRange.ofLength(1, this.lineCount + 1);
  }
  addToPosition(position2) {
    if (this.lineCount === 0) {
      return new Position(position2.lineNumber, position2.column + this.columnCount);
    } else {
      return new Position(position2.lineNumber + this.lineCount, this.columnCount + 1);
    }
  }
  addToRange(range2) {
    return Range2.fromPositions(
      this.addToPosition(range2.getStartPosition()),
      this.addToPosition(range2.getEndPosition())
    );
  }
  toString() {
    return `${this.lineCount},${this.columnCount}`;
  }
};
export { TextLength };
