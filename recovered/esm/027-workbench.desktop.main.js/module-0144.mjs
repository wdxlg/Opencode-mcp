// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/ranges/offsetRange.ts
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/common/core/ranges/offsetRange.ts
var OffsetRange = class _OffsetRange {
  constructor(start, endExclusive) {
    this.start = start;
    this.endExclusive = endExclusive;
    if (start > endExclusive) {
      throw new BugIndicatingError(`Invalid range: ${this.toString()}`);
    }
  }
  static fromTo(start, endExclusive) {
    return new _OffsetRange(start, endExclusive);
  }
  static equals(r1, r2) {
    return r1.start === r2.start && r1.endExclusive === r2.endExclusive;
  }
  static addRange(range2, sortedRanges) {
    let i2 = 0;
    while (i2 < sortedRanges.length && sortedRanges[i2].endExclusive < range2.start) {
      i2++;
    }
    let j = i2;
    while (j < sortedRanges.length && sortedRanges[j].start <= range2.endExclusive) {
      j++;
    }
    if (i2 === j) {
      sortedRanges.splice(i2, 0, range2);
    } else {
      const start = Math.min(range2.start, sortedRanges[i2].start);
      const end = Math.max(range2.endExclusive, sortedRanges[j - 1].endExclusive);
      sortedRanges.splice(i2, j - i2, new _OffsetRange(start, end));
    }
  }
  static tryCreate(start, endExclusive) {
    if (start > endExclusive) {
      return void 0;
    }
    return new _OffsetRange(start, endExclusive);
  }
  static ofLength(length) {
    return new _OffsetRange(0, length);
  }
  static ofStartAndLength(start, length) {
    return new _OffsetRange(start, start + length);
  }
  static emptyAt(offset) {
    return new _OffsetRange(offset, offset);
  }
  get isEmpty() {
    return this.start === this.endExclusive;
  }
  delta(offset) {
    return new _OffsetRange(this.start + offset, this.endExclusive + offset);
  }
  deltaStart(offset) {
    return new _OffsetRange(this.start + offset, this.endExclusive);
  }
  deltaEnd(offset) {
    return new _OffsetRange(this.start, this.endExclusive + offset);
  }
  get length() {
    return this.endExclusive - this.start;
  }
  toString() {
    return `[${this.start}, ${this.endExclusive})`;
  }
  equals(other) {
    return this.start === other.start && this.endExclusive === other.endExclusive;
  }
  containsRange(other) {
    return this.start <= other.start && other.endExclusive <= this.endExclusive;
  }
  contains(offset) {
    return this.start <= offset && offset < this.endExclusive;
  }
  /**
   * for all numbers n: range1.contains(n) or range2.contains(n) => range1.join(range2).contains(n)
   * The joined range is the smallest range that contains both ranges.
   */
  join(other) {
    return new _OffsetRange(Math.min(this.start, other.start), Math.max(this.endExclusive, other.endExclusive));
  }
  /**
   * for all numbers n: range1.contains(n) and range2.contains(n) <=> range1.intersect(range2).contains(n)
   *
   * The resulting range is empty if the ranges do not intersect, but touch.
   * If the ranges don't even touch, the result is undefined.
   */
  intersect(other) {
    const start = Math.max(this.start, other.start);
    const end = Math.min(this.endExclusive, other.endExclusive);
    if (start <= end) {
      return new _OffsetRange(start, end);
    }
    return void 0;
  }
  intersectionLength(range2) {
    const start = Math.max(this.start, range2.start);
    const end = Math.min(this.endExclusive, range2.endExclusive);
    return Math.max(0, end - start);
  }
  /**
   * `a.intersects(b)` iff there exists a number n so that `a.contains(n)` and `b.contains(n)`.
   * Warning: If one range is empty, this method returns always false.
  */
  intersects(other) {
    const start = Math.max(this.start, other.start);
    const end = Math.min(this.endExclusive, other.endExclusive);
    return start < end;
  }
  intersectsOrTouches(other) {
    const start = Math.max(this.start, other.start);
    const end = Math.min(this.endExclusive, other.endExclusive);
    return start <= end;
  }
  isBefore(other) {
    return this.endExclusive <= other.start;
  }
  isAfter(other) {
    return this.start >= other.endExclusive;
  }
  slice(arr) {
    return arr.slice(this.start, this.endExclusive);
  }
  substring(str) {
    return str.substring(this.start, this.endExclusive);
  }
  /**
   * Returns the given value if it is contained in this instance, otherwise the closest value that is contained.
   * The range must not be empty.
   */
  clip(value2) {
    if (this.isEmpty) {
      throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
    }
    return Math.max(this.start, Math.min(this.endExclusive - 1, value2));
  }
  /**
   * Returns `r := value + k * length` such that `r` is contained in this range.
   * The range must not be empty.
   *
   * E.g. `[5, 10).clipCyclic(10) === 5`, `[5, 10).clipCyclic(11) === 6` and `[5, 10).clipCyclic(4) === 9`.
   */
  clipCyclic(value2) {
    if (this.isEmpty) {
      throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
    }
    if (value2 < this.start) {
      return this.endExclusive - (this.start - value2) % this.length;
    }
    if (value2 >= this.endExclusive) {
      return this.start + (value2 - this.start) % this.length;
    }
    return value2;
  }
  map(f) {
    const result = [];
    for (let i2 = this.start; i2 < this.endExclusive; i2++) {
      result.push(f(i2));
    }
    return result;
  }
  forEach(f) {
    for (let i2 = this.start; i2 < this.endExclusive; i2++) {
      f(i2);
    }
  }
  /**
   * this: [ 5, 10), range: [10, 15) => [5, 15)]
   * Throws if the ranges are not touching.
  */
  joinRightTouching(range2) {
    if (this.endExclusive !== range2.start) {
      throw new BugIndicatingError(`Invalid join: ${this.toString()} and ${range2.toString()}`);
    }
    return new _OffsetRange(this.start, range2.endExclusive);
  }
  withMargin(marginStart, marginEnd) {
    if (marginEnd === void 0) {
      marginEnd = marginStart;
    }
    return new _OffsetRange(this.start - marginStart, this.endExclusive + marginEnd);
  }
};

var OffsetRangeSet = class _OffsetRangeSet {
  constructor() {
    this._sortedRanges = [];
  }
  get ranges() {
    return [...this._sortedRanges];
  }
  addRange(range2) {
    let i2 = 0;
    while (i2 < this._sortedRanges.length && this._sortedRanges[i2].endExclusive < range2.start) {
      i2++;
    }
    let j = i2;
    while (j < this._sortedRanges.length && this._sortedRanges[j].start <= range2.endExclusive) {
      j++;
    }
    if (i2 === j) {
      this._sortedRanges.splice(i2, 0, range2);
    } else {
      const start = Math.min(range2.start, this._sortedRanges[i2].start);
      const end = Math.max(range2.endExclusive, this._sortedRanges[j - 1].endExclusive);
      this._sortedRanges.splice(i2, j - i2, new OffsetRange(start, end));
    }
  }
  toString() {
    return this._sortedRanges.map((r2) => r2.toString()).join(", ");
  }
  /**
   * Returns if there is a value that is contained in this instance and the given range.
   */
  intersectsStrict(other) {
    let i2 = 0;
    while (i2 < this._sortedRanges.length && this._sortedRanges[i2].endExclusive <= other.start) {
      i2++;
    }
    return i2 < this._sortedRanges.length && this._sortedRanges[i2].start < other.endExclusive;
  }
  intersectWithRange(other) {
    const result = new _OffsetRangeSet();
    for (const range2 of this._sortedRanges) {
      const intersection2 = range2.intersect(other);
      if (intersection2) {
        result.addRange(intersection2);
      }
    }
    return result;
  }
  intersectWithRangeLength(other) {
    return this.intersectWithRange(other).length;
  }
  get length() {
    return this._sortedRanges.reduce((prev, cur) => prev + cur.length, 0);
  }
};
export { OffsetRange, OffsetRangeSet };
