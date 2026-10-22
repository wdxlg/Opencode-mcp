// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/edits/edit.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { sumBy } from "./module-0007.mjs";


// src/vs/editor/common/core/edits/edit.ts
var BaseEdit = class {
  constructor(replacements) {
    this.replacements = replacements;
    let lastEndEx = -1;
    for (const replacement of replacements) {
      if (!(replacement.replaceRange.start >= lastEndEx)) {
        throw new BugIndicatingError(`Edits must be disjoint and sorted. Found ${replacement} after ${lastEndEx}`);
      }
      lastEndEx = replacement.replaceRange.endExclusive;
    }
  }
  /**
   * Returns true if and only if this edit and the given edit are structurally equal.
   * Note that this does not mean that the edits have the same effect on a given input!
   * See `.normalize()` or `.normalizeOnBase(base)` for that.
  */
  equals(other) {
    if (this.replacements.length !== other.replacements.length) {
      return false;
    }
    for (let i2 = 0; i2 < this.replacements.length; i2++) {
      if (!this.replacements[i2].equals(other.replacements[i2])) {
        return false;
      }
    }
    return true;
  }
  toString() {
    const edits = this.replacements.map((e) => e.toString()).join(", ");
    return `[${edits}]`;
  }
  /**
   * Normalizes the edit by removing empty replacements and joining touching replacements (if the replacements allow joining).
   * Two edits have an equal normalized edit if and only if they have the same effect on any input.
   *
   * ![](https://raw.githubusercontent.com/microsoft/vscode/refs/heads/main/src/vs/editor/common/core/edits/docs/BaseEdit_normalize.drawio.png)
   *
   * Invariant:
   * ```
   * (forall base: TEdit.apply(base).equals(other.apply(base))) <-> this.normalize().equals(other.normalize())
   * ```
   * and
   * ```
   * forall base: TEdit.apply(base).equals(this.normalize().apply(base))
   * ```
   *
   */
  normalize() {
    const newReplacements = [];
    let lastReplacement;
    for (const r2 of this.replacements) {
      if (r2.getNewLength() === 0 && r2.replaceRange.length === 0) {
        continue;
      }
      if (lastReplacement && lastReplacement.replaceRange.endExclusive === r2.replaceRange.start) {
        const joined = lastReplacement.tryJoinTouching(r2);
        if (joined) {
          lastReplacement = joined;
          continue;
        }
      }
      if (lastReplacement) {
        newReplacements.push(lastReplacement);
      }
      lastReplacement = r2;
    }
    if (lastReplacement) {
      newReplacements.push(lastReplacement);
    }
    return this._createNew(newReplacements);
  }
  /**
   * Combines two edits into one with the same effect.
   *
   * ![](https://raw.githubusercontent.com/microsoft/vscode/refs/heads/main/src/vs/editor/common/core/edits/docs/BaseEdit_compose.drawio.png)
   *
   * Invariant:
   * ```
   * other.apply(this.apply(s0)) = this.compose(other).apply(s0)
   * ```
   */
  compose(other) {
    const edits1 = this.normalize();
    const edits2 = other.normalize();
    if (edits1.isEmpty()) {
      return edits2;
    }
    if (edits2.isEmpty()) {
      return edits1;
    }
    const edit1Queue = [...edits1.replacements];
    const result = [];
    let edit1ToEdit2 = 0;
    for (const r2 of edits2.replacements) {
      while (true) {
        const r1 = edit1Queue[0];
        if (!r1 || r1.replaceRange.start + edit1ToEdit2 + r1.getNewLength() >= r2.replaceRange.start) {
          break;
        }
        edit1Queue.shift();
        result.push(r1);
        edit1ToEdit2 += r1.getNewLength() - r1.replaceRange.length;
      }
      const firstEdit1ToEdit2 = edit1ToEdit2;
      let firstIntersecting;
      let lastIntersecting;
      while (true) {
        const r1 = edit1Queue[0];
        if (!r1 || r1.replaceRange.start + edit1ToEdit2 > r2.replaceRange.endExclusive) {
          break;
        }
        if (!firstIntersecting) {
          firstIntersecting = r1;
        }
        lastIntersecting = r1;
        edit1Queue.shift();
        edit1ToEdit2 += r1.getNewLength() - r1.replaceRange.length;
      }
      if (!firstIntersecting) {
        result.push(r2.delta(-edit1ToEdit2));
      } else {
        const newReplaceRangeStart = Math.min(firstIntersecting.replaceRange.start, r2.replaceRange.start - firstEdit1ToEdit2);
        const prefixLength = r2.replaceRange.start - (firstIntersecting.replaceRange.start + firstEdit1ToEdit2);
        if (prefixLength > 0) {
          const prefix = firstIntersecting.slice(OffsetRange.emptyAt(newReplaceRangeStart), new OffsetRange(0, prefixLength));
          result.push(prefix);
        }
        if (!lastIntersecting) {
          throw new BugIndicatingError(`Invariant violation: lastIntersecting is undefined`);
        }
        const suffixLength = lastIntersecting.replaceRange.endExclusive + edit1ToEdit2 - r2.replaceRange.endExclusive;
        if (suffixLength > 0) {
          const e = lastIntersecting.slice(
            OffsetRange.ofStartAndLength(lastIntersecting.replaceRange.endExclusive, 0),
            new OffsetRange(lastIntersecting.getNewLength() - suffixLength, lastIntersecting.getNewLength())
          );
          edit1Queue.unshift(e);
          edit1ToEdit2 -= e.getNewLength() - e.replaceRange.length;
        }
        const newReplaceRange = new OffsetRange(
          newReplaceRangeStart,
          r2.replaceRange.endExclusive - edit1ToEdit2
        );
        const middle = r2.slice(newReplaceRange, new OffsetRange(0, r2.getNewLength()));
        result.push(middle);
      }
    }
    while (true) {
      const item = edit1Queue.shift();
      if (!item) {
        break;
      }
      result.push(item);
    }
    return this._createNew(result).normalize();
  }
  decomposeSplit(shouldBeInE1) {
    const e1 = [];
    const e2 = [];
    let e2delta = 0;
    for (const edit3 of this.replacements) {
      if (shouldBeInE1(edit3)) {
        e1.push(edit3);
        e2delta += edit3.getNewLength() - edit3.replaceRange.length;
      } else {
        e2.push(edit3.slice(edit3.replaceRange.delta(e2delta), new OffsetRange(0, edit3.getNewLength())));
      }
    }
    return { e1: this._createNew(e1), e2: this._createNew(e2) };
  }
  /**
   * Returns the range of each replacement in the applied value.
  */
  getNewRanges() {
    const ranges = [];
    let offset = 0;
    for (const e of this.replacements) {
      ranges.push(OffsetRange.ofStartAndLength(e.replaceRange.start + offset, e.getNewLength()));
      offset += e.getLengthDelta();
    }
    return ranges;
  }
  getJoinedReplaceRange() {
    if (this.replacements.length === 0) {
      return void 0;
    }
    return this.replacements[0].replaceRange.join(this.replacements.at(-1).replaceRange);
  }
  isEmpty() {
    return this.replacements.length === 0;
  }
  getLengthDelta() {
    return sumBy(this.replacements, (replacement) => replacement.getLengthDelta());
  }
  getNewDataLength(dataLength) {
    return dataLength + this.getLengthDelta();
  }
  applyToOffset(originalOffset) {
    let accumulatedDelta = 0;
    for (const r2 of this.replacements) {
      if (r2.replaceRange.start <= originalOffset) {
        if (originalOffset < r2.replaceRange.endExclusive) {
          return r2.replaceRange.start + accumulatedDelta;
        }
        accumulatedDelta += r2.getNewLength() - r2.replaceRange.length;
      } else {
        break;
      }
    }
    return originalOffset + accumulatedDelta;
  }
  applyToOffsetRange(originalRange) {
    return new OffsetRange(
      this.applyToOffset(originalRange.start),
      this.applyToOffset(originalRange.endExclusive)
    );
  }
  applyInverseToOffset(postEditsOffset) {
    let accumulatedDelta = 0;
    for (const edit3 of this.replacements) {
      const editLength = edit3.getNewLength();
      if (edit3.replaceRange.start <= postEditsOffset - accumulatedDelta) {
        if (postEditsOffset - accumulatedDelta < edit3.replaceRange.start + editLength) {
          return edit3.replaceRange.start;
        }
        accumulatedDelta += editLength - edit3.replaceRange.length;
      } else {
        break;
      }
    }
    return postEditsOffset - accumulatedDelta;
  }
  /**
   * Return undefined if the originalOffset is within an edit
   */
  applyToOffsetOrUndefined(originalOffset) {
    let accumulatedDelta = 0;
    for (const edit3 of this.replacements) {
      if (edit3.replaceRange.start <= originalOffset) {
        if (originalOffset < edit3.replaceRange.endExclusive) {
          return void 0;
        }
        accumulatedDelta += edit3.getNewLength() - edit3.replaceRange.length;
      } else {
        break;
      }
    }
    return originalOffset + accumulatedDelta;
  }
  /**
   * Return undefined if the originalRange is within an edit
   */
  applyToOffsetRangeOrUndefined(originalRange) {
    const start = this.applyToOffsetOrUndefined(originalRange.start);
    if (start === void 0) {
      return void 0;
    }
    const end = this.applyToOffsetOrUndefined(originalRange.endExclusive);
    if (end === void 0) {
      return void 0;
    }
    return new OffsetRange(start, end);
  }
};

var BaseReplacement = class {
  constructor(replaceRange) {
    this.replaceRange = replaceRange;
  }
  delta(offset) {
    return this.slice(this.replaceRange.delta(offset), new OffsetRange(0, this.getNewLength()));
  }
  getLengthDelta() {
    return this.getNewLength() - this.replaceRange.length;
  }
  toString() {
    return `{ ${this.replaceRange.toString()} -> ${this.getNewLength()} }`;
  }
  get isEmpty() {
    return this.getNewLength() === 0 && this.replaceRange.length === 0;
  }
  getRangeAfterReplace() {
    return new OffsetRange(this.replaceRange.start, this.replaceRange.start + this.getNewLength());
  }
};

var Edit = class _Edit extends BaseEdit {
  static {
    /**
     * Represents a set of edits to a string.
     * All these edits are applied at once.
    */
    this.empty = new _Edit([]);
  }
  static create(replacements) {
    return new _Edit(replacements);
  }
  static single(replacement) {
    return new _Edit([replacement]);
  }
  _createNew(replacements) {
    return new _Edit(replacements);
  }
};
export { BaseEdit, BaseReplacement, Edit };
