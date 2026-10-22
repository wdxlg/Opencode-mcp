// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/ranges/lineRange.ts
import { compareBy, numberComparator } from "./module-0007.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { Range2 } from "./module-0106.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { findFirstIdxMonotonousOrArrLen, findLastIdxMonotonous, findLastMonotonous } from "./module-0006.mjs";


// src/vs/editor/common/core/ranges/lineRange.ts
var LineRange = class _LineRange {
  static ofLength(startLineNumber, length) {
    return new _LineRange(startLineNumber, startLineNumber + length);
  }
  static fromRange(range2) {
    return new _LineRange(range2.startLineNumber, range2.endLineNumber);
  }
  static fromRangeInclusive(range2) {
    return new _LineRange(range2.startLineNumber, range2.endLineNumber + 1);
  }
  static {
    this.compareByStart = compareBy((l) => l.startLineNumber, numberComparator);
  }
  static subtract(a, b) {
    if (!b) {
      return [a];
    }
    if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
      return [
        new _LineRange(a.startLineNumber, b.startLineNumber),
        new _LineRange(b.endLineNumberExclusive, a.endLineNumberExclusive)
      ];
    } else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
      return [];
    } else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
      return [new _LineRange(Math.max(b.endLineNumberExclusive, a.startLineNumber), a.endLineNumberExclusive)];
    } else {
      return [new _LineRange(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
    }
  }
  /**
   * @param lineRanges An array of arrays of of sorted line ranges.
   */
  static joinMany(lineRanges) {
    if (lineRanges.length === 0) {
      return [];
    }
    let result = new LineRangeSet(lineRanges[0].slice());
    for (let i2 = 1; i2 < lineRanges.length; i2++) {
      result = result.getUnion(new LineRangeSet(lineRanges[i2].slice()));
    }
    return result.ranges;
  }
  static join(lineRanges) {
    if (lineRanges.length === 0) {
      throw new BugIndicatingError("lineRanges cannot be empty");
    }
    let startLineNumber = lineRanges[0].startLineNumber;
    let endLineNumberExclusive = lineRanges[0].endLineNumberExclusive;
    for (let i2 = 1; i2 < lineRanges.length; i2++) {
      startLineNumber = Math.min(startLineNumber, lineRanges[i2].startLineNumber);
      endLineNumberExclusive = Math.max(endLineNumberExclusive, lineRanges[i2].endLineNumberExclusive);
    }
    return new _LineRange(startLineNumber, endLineNumberExclusive);
  }
  /**
   * @internal
   */
  static deserialize(lineRange) {
    return new _LineRange(lineRange[0], lineRange[1]);
  }
  constructor(startLineNumber, endLineNumberExclusive) {
    if (startLineNumber > endLineNumberExclusive) {
      throw new BugIndicatingError(`startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`);
    }
    this.startLineNumber = startLineNumber;
    this.endLineNumberExclusive = endLineNumberExclusive;
  }
  /**
   * Indicates if this line range contains the given line number.
   */
  contains(lineNumber) {
    return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
  }
  containsRange(range2) {
    return this.startLineNumber <= range2.startLineNumber && range2.endLineNumberExclusive <= this.endLineNumberExclusive;
  }
  /**
   * Indicates if this line range is empty.
   */
  get isEmpty() {
    return this.startLineNumber === this.endLineNumberExclusive;
  }
  /**
   * Moves this line range by the given offset of line numbers.
   */
  delta(offset) {
    return new _LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
  }
  deltaLength(offset) {
    return new _LineRange(this.startLineNumber, this.endLineNumberExclusive + offset);
  }
  /**
   * The number of lines this line range spans.
   */
  get length() {
    return this.endLineNumberExclusive - this.startLineNumber;
  }
  /**
   * Creates a line range that combines this and the given line range.
   */
  join(other) {
    return new _LineRange(
      Math.min(this.startLineNumber, other.startLineNumber),
      Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive)
    );
  }
  toString() {
    return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
  }
  /**
   * The resulting range is empty if the ranges do not intersect, but touch.
   * If the ranges don't even touch, the result is undefined.
   */
  intersect(other) {
    const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
    const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
    if (startLineNumber <= endLineNumberExclusive) {
      return new _LineRange(startLineNumber, endLineNumberExclusive);
    }
    return void 0;
  }
  intersectsStrict(other) {
    return this.startLineNumber < other.endLineNumberExclusive && other.startLineNumber < this.endLineNumberExclusive;
  }
  intersectsOrTouches(other) {
    return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
  }
  equals(b) {
    return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
  }
  toInclusiveRange() {
    if (this.isEmpty) {
      return null;
    }
    return new Range2(this.startLineNumber, 1, this.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER);
  }
  /**
   * @deprecated Using this function is discouraged because it might lead to bugs: The end position is not guaranteed to be a valid position!
  */
  toExclusiveRange() {
    return new Range2(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
  }
  mapToLineArray(f) {
    const result = [];
    for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
      result.push(f(lineNumber));
    }
    return result;
  }
  forEach(f) {
    for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
      f(lineNumber);
    }
  }
  /**
   * @internal
   */
  serialize() {
    return [this.startLineNumber, this.endLineNumberExclusive];
  }
  /**
   * Converts this 1-based line range to a 0-based offset range (subtracts 1!).
   * @internal
   */
  toOffsetRange() {
    return new OffsetRange(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
  }
  distanceToRange(other) {
    if (this.endLineNumberExclusive <= other.startLineNumber) {
      return other.startLineNumber - this.endLineNumberExclusive;
    }
    if (other.endLineNumberExclusive <= this.startLineNumber) {
      return this.startLineNumber - other.endLineNumberExclusive;
    }
    return 0;
  }
  distanceToLine(lineNumber) {
    if (this.contains(lineNumber)) {
      return 0;
    }
    if (lineNumber < this.startLineNumber) {
      return this.startLineNumber - lineNumber;
    }
    return lineNumber - this.endLineNumberExclusive;
  }
  addMargin(marginTop, marginBottom) {
    return new _LineRange(
      this.startLineNumber - marginTop,
      this.endLineNumberExclusive + marginBottom
    );
  }
};

var LineRangeSet = class _LineRangeSet {
  constructor(_normalizedRanges = []) {
    this._normalizedRanges = _normalizedRanges;
  }
  get ranges() {
    return this._normalizedRanges;
  }
  addRange(range2) {
    if (range2.length === 0) {
      return;
    }
    const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(this._normalizedRanges, (r2) => r2.endLineNumberExclusive >= range2.startLineNumber);
    const joinRangeEndIdxExclusive = findLastIdxMonotonous(this._normalizedRanges, (r2) => r2.startLineNumber <= range2.endLineNumberExclusive) + 1;
    if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
      this._normalizedRanges.splice(joinRangeStartIdx, 0, range2);
    } else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
      const joinRange = this._normalizedRanges[joinRangeStartIdx];
      this._normalizedRanges[joinRangeStartIdx] = joinRange.join(range2);
    } else {
      const joinRange = this._normalizedRanges[joinRangeStartIdx].join(this._normalizedRanges[joinRangeEndIdxExclusive - 1]).join(range2);
      this._normalizedRanges.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
    }
  }
  contains(lineNumber) {
    const rangeThatStartsBeforeEnd = findLastMonotonous(this._normalizedRanges, (r2) => r2.startLineNumber <= lineNumber);
    return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
  }
  intersects(range2) {
    const rangeThatStartsBeforeEnd = findLastMonotonous(this._normalizedRanges, (r2) => r2.startLineNumber < range2.endLineNumberExclusive);
    return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range2.startLineNumber;
  }
  getUnion(other) {
    if (this._normalizedRanges.length === 0) {
      return other;
    }
    if (other._normalizedRanges.length === 0) {
      return this;
    }
    const result = [];
    let i1 = 0;
    let i2 = 0;
    let current = null;
    while (i1 < this._normalizedRanges.length || i2 < other._normalizedRanges.length) {
      let next = null;
      if (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
        const lineRange1 = this._normalizedRanges[i1];
        const lineRange2 = other._normalizedRanges[i2];
        if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
          next = lineRange1;
          i1++;
        } else {
          next = lineRange2;
          i2++;
        }
      } else if (i1 < this._normalizedRanges.length) {
        next = this._normalizedRanges[i1];
        i1++;
      } else {
        next = other._normalizedRanges[i2];
        i2++;
      }
      if (current === null) {
        current = next;
      } else {
        if (current.endLineNumberExclusive >= next.startLineNumber) {
          current = new LineRange(current.startLineNumber, Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive));
        } else {
          result.push(current);
          current = next;
        }
      }
    }
    if (current !== null) {
      result.push(current);
    }
    return new _LineRangeSet(result);
  }
  /**
   * Subtracts all ranges in this set from `range` and returns the result.
   */
  subtractFrom(range2) {
    const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(this._normalizedRanges, (r2) => r2.endLineNumberExclusive >= range2.startLineNumber);
    const joinRangeEndIdxExclusive = findLastIdxMonotonous(this._normalizedRanges, (r2) => r2.startLineNumber <= range2.endLineNumberExclusive) + 1;
    if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
      return new _LineRangeSet([range2]);
    }
    const result = [];
    let startLineNumber = range2.startLineNumber;
    for (let i2 = joinRangeStartIdx; i2 < joinRangeEndIdxExclusive; i2++) {
      const r2 = this._normalizedRanges[i2];
      if (r2.startLineNumber > startLineNumber) {
        result.push(new LineRange(startLineNumber, r2.startLineNumber));
      }
      startLineNumber = r2.endLineNumberExclusive;
    }
    if (startLineNumber < range2.endLineNumberExclusive) {
      result.push(new LineRange(startLineNumber, range2.endLineNumberExclusive));
    }
    return new _LineRangeSet(result);
  }
  toString() {
    return this._normalizedRanges.map((r2) => r2.toString()).join(", ");
  }
  getIntersection(other) {
    const result = [];
    let i1 = 0;
    let i2 = 0;
    while (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
      const r1 = this._normalizedRanges[i1];
      const r2 = other._normalizedRanges[i2];
      const i3 = r1.intersect(r2);
      if (i3 && !i3.isEmpty) {
        result.push(i3);
      }
      if (r1.endLineNumberExclusive < r2.endLineNumberExclusive) {
        i1++;
      } else {
        i2++;
      }
    }
    return new _LineRangeSet(result);
  }
  getWithDelta(value2) {
    return new _LineRangeSet(this._normalizedRanges.map((r2) => r2.delta(value2)));
  }
};
export { LineRange, LineRangeSet };
