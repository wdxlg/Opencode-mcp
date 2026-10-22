// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm.ts
import { OffsetRange } from "./module-0144.mjs";
import { forEachAdjacent } from "./module-0007.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/common/diff/defaultLinesDiffComputer/algorithms/diffAlgorithm.ts
var DiffAlgorithmResult = class _DiffAlgorithmResult {
  constructor(diffs, hitTimeout) {
    this.diffs = diffs;
    this.hitTimeout = hitTimeout;
  }
  static trivial(seq1, seq2) {
    return new _DiffAlgorithmResult([new SequenceDiff(OffsetRange.ofLength(seq1.length), OffsetRange.ofLength(seq2.length))], false);
  }
  static trivialTimedOut(seq1, seq2) {
    return new _DiffAlgorithmResult([new SequenceDiff(OffsetRange.ofLength(seq1.length), OffsetRange.ofLength(seq2.length))], true);
  }
};

var SequenceDiff = class _SequenceDiff {
  constructor(seq1Range, seq2Range) {
    this.seq1Range = seq1Range;
    this.seq2Range = seq2Range;
  }
  static invert(sequenceDiffs, doc1Length) {
    const result = [];
    forEachAdjacent(sequenceDiffs, (a, b) => {
      result.push(_SequenceDiff.fromOffsetPairs(
        a ? a.getEndExclusives() : OffsetPair.zero,
        b ? b.getStarts() : new OffsetPair(doc1Length, (a ? a.seq2Range.endExclusive - a.seq1Range.endExclusive : 0) + doc1Length)
      ));
    });
    return result;
  }
  static fromOffsetPairs(start, endExclusive) {
    return new _SequenceDiff(
      new OffsetRange(start.offset1, endExclusive.offset1),
      new OffsetRange(start.offset2, endExclusive.offset2)
    );
  }
  static assertSorted(sequenceDiffs) {
    let last = void 0;
    for (const cur of sequenceDiffs) {
      if (last) {
        if (!(last.seq1Range.endExclusive <= cur.seq1Range.start && last.seq2Range.endExclusive <= cur.seq2Range.start)) {
          throw new BugIndicatingError("Sequence diffs must be sorted");
        }
      }
      last = cur;
    }
  }
  swap() {
    return new _SequenceDiff(this.seq2Range, this.seq1Range);
  }
  toString() {
    return `${this.seq1Range} <-> ${this.seq2Range}`;
  }
  join(other) {
    return new _SequenceDiff(this.seq1Range.join(other.seq1Range), this.seq2Range.join(other.seq2Range));
  }
  delta(offset) {
    if (offset === 0) {
      return this;
    }
    return new _SequenceDiff(this.seq1Range.delta(offset), this.seq2Range.delta(offset));
  }
  deltaStart(offset) {
    if (offset === 0) {
      return this;
    }
    return new _SequenceDiff(this.seq1Range.deltaStart(offset), this.seq2Range.deltaStart(offset));
  }
  deltaEnd(offset) {
    if (offset === 0) {
      return this;
    }
    return new _SequenceDiff(this.seq1Range.deltaEnd(offset), this.seq2Range.deltaEnd(offset));
  }
  intersectsOrTouches(other) {
    return this.seq1Range.intersectsOrTouches(other.seq1Range) || this.seq2Range.intersectsOrTouches(other.seq2Range);
  }
  intersect(other) {
    const i1 = this.seq1Range.intersect(other.seq1Range);
    const i2 = this.seq2Range.intersect(other.seq2Range);
    if (!i1 || !i2) {
      return void 0;
    }
    return new _SequenceDiff(i1, i2);
  }
  getStarts() {
    return new OffsetPair(this.seq1Range.start, this.seq2Range.start);
  }
  getEndExclusives() {
    return new OffsetPair(this.seq1Range.endExclusive, this.seq2Range.endExclusive);
  }
};

var OffsetPair = class _OffsetPair {
  constructor(offset1, offset2) {
    this.offset1 = offset1;
    this.offset2 = offset2;
  }
  static {
    this.zero = new _OffsetPair(0, 0);
  }
  static {
    this.max = new _OffsetPair(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
  }
  toString() {
    return `${this.offset1} <-> ${this.offset2}`;
  }
  delta(offset) {
    if (offset === 0) {
      return this;
    }
    return new _OffsetPair(this.offset1 + offset, this.offset2 + offset);
  }
  equals(other) {
    return this.offset1 === other.offset1 && this.offset2 === other.offset2;
  }
};

var InfiniteTimeout = class _InfiniteTimeout {
  static {
    this.instance = new _InfiniteTimeout();
  }
  isValid() {
    return true;
  }
};

var DateTimeout = class {
  constructor(timeout2) {
    this.timeout = timeout2;
    this.startTime = Date.now();
    this.valid = true;
    if (timeout2 <= 0) {
      throw new BugIndicatingError("timeout must be positive");
    }
  }
  // Recommendation: Set a log-point `{this.disable()}` in the body
  isValid() {
    const valid2 = Date.now() - this.startTime < this.timeout;
    if (!valid2 && this.valid) {
      this.valid = false;
    }
    return this.valid;
  }
  disable() {
    this.timeout = Number.MAX_SAFE_INTEGER;
    this.isValid = () => true;
    this.valid = true;
  }
};
export { DiffAlgorithmResult, SequenceDiff, OffsetPair, InfiniteTimeout, DateTimeout };
