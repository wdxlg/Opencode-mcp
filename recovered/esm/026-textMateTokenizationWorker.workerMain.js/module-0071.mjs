// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/editor/common/model/textModelTokens.ts
import { OffsetRange } from "./module-0051.mjs";
import { BugIndicatingError } from "./module-0007.mjs";
import { countEOL } from "./module-0057.mjs";
import { LineRange } from "./module-0054.mjs";
import { FixedArray } from "./module-0065.mjs";


// src/vs/editor/common/model/textModelTokens.ts
var TokenizerWithStateStore = class {
  constructor(lineCount, tokenizationSupport) {
    this.tokenizationSupport = tokenizationSupport;
    this.initialState = this.tokenizationSupport.getInitialState();
    this.store = new TrackingTokenizationStateStore(lineCount);
  }
  getStartState(lineNumber) {
    return this.store.getStartState(lineNumber, this.initialState);
  }
  getFirstInvalidLine() {
    return this.store.getFirstInvalidLine(this.initialState);
  }
};

var TrackingTokenizationStateStore = class {
  constructor(lineCount) {
    this.lineCount = lineCount;
    this._tokenizationStateStore = new TokenizationStateStore();
    this._invalidEndStatesLineNumbers = new RangePriorityQueueImpl();
    this._invalidEndStatesLineNumbers.addRange(new OffsetRange(1, lineCount + 1));
  }
  getEndState(lineNumber) {
    return this._tokenizationStateStore.getEndState(lineNumber);
  }
  /**
   * @returns if the end state has changed.
   */
  setEndState(lineNumber, state) {
    if (!state) {
      throw new BugIndicatingError("Cannot set null/undefined state");
    }
    this._invalidEndStatesLineNumbers.delete(lineNumber);
    const r = this._tokenizationStateStore.setEndState(lineNumber, state);
    if (r && lineNumber < this.lineCount) {
      this._invalidEndStatesLineNumbers.addRange(new OffsetRange(lineNumber + 1, lineNumber + 2));
    }
    return r;
  }
  acceptChange(range, newLineCount) {
    this.lineCount += newLineCount - range.length;
    this._tokenizationStateStore.acceptChange(range, newLineCount);
    this._invalidEndStatesLineNumbers.addRangeAndResize(new OffsetRange(range.startLineNumber, range.endLineNumberExclusive), newLineCount);
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
    }
  }
  invalidateEndStateRange(range) {
    this._invalidEndStatesLineNumbers.addRange(new OffsetRange(range.startLineNumber, range.endLineNumberExclusive));
  }
  getFirstInvalidEndStateLineNumber() {
    return this._invalidEndStatesLineNumbers.min;
  }
  getFirstInvalidEndStateLineNumberOrMax() {
    return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
  }
  allStatesValid() {
    return this._invalidEndStatesLineNumbers.min === null;
  }
  getStartState(lineNumber, initialState) {
    if (lineNumber === 1) {
      return initialState;
    }
    return this.getEndState(lineNumber - 1);
  }
  getFirstInvalidLine(initialState) {
    const lineNumber = this.getFirstInvalidEndStateLineNumber();
    if (lineNumber === null) {
      return null;
    }
    const startState = this.getStartState(lineNumber, initialState);
    if (!startState) {
      throw new BugIndicatingError("Start state must be defined");
    }
    return { lineNumber, startState };
  }
};

var TokenizationStateStore = class {
  constructor() {
    this._lineEndStates = new FixedArray(null);
  }
  getEndState(lineNumber) {
    return this._lineEndStates.get(lineNumber);
  }
  setEndState(lineNumber, state) {
    const oldState = this._lineEndStates.get(lineNumber);
    if (oldState && oldState.equals(state)) {
      return false;
    }
    this._lineEndStates.set(lineNumber, state);
    return true;
  }
  acceptChange(range, newLineCount) {
    let length = range.length;
    if (newLineCount > 0 && length > 0) {
      length--;
      newLineCount--;
    }
    this._lineEndStates.replace(range.startLineNumber, length, newLineCount);
  }
  acceptChanges(changes) {
    for (const c of changes) {
      const [eolCount] = countEOL(c.text);
      this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
    }
  }
};

var RangePriorityQueueImpl = class {
  constructor() {
    this._ranges = [];
  }
  getRanges() {
    return this._ranges;
  }
  get min() {
    if (this._ranges.length === 0) {
      return null;
    }
    return this._ranges[0].start;
  }
  removeMin() {
    if (this._ranges.length === 0) {
      return null;
    }
    const range = this._ranges[0];
    if (range.start + 1 === range.endExclusive) {
      this._ranges.shift();
    } else {
      this._ranges[0] = new OffsetRange(range.start + 1, range.endExclusive);
    }
    return range.start;
  }
  delete(value) {
    const idx = this._ranges.findIndex((r) => r.contains(value));
    if (idx !== -1) {
      const range = this._ranges[idx];
      if (range.start === value) {
        if (range.endExclusive === value + 1) {
          this._ranges.splice(idx, 1);
        } else {
          this._ranges[idx] = new OffsetRange(value + 1, range.endExclusive);
        }
      } else {
        if (range.endExclusive === value + 1) {
          this._ranges[idx] = new OffsetRange(range.start, value);
        } else {
          this._ranges.splice(idx, 1, new OffsetRange(range.start, value), new OffsetRange(value + 1, range.endExclusive));
        }
      }
    }
  }
  addRange(range) {
    OffsetRange.addRange(range, this._ranges);
  }
  addRangeAndResize(range, newLength) {
    let idxFirstMightBeIntersecting = 0;
    while (!(idxFirstMightBeIntersecting >= this._ranges.length || range.start <= this._ranges[idxFirstMightBeIntersecting].endExclusive)) {
      idxFirstMightBeIntersecting++;
    }
    let idxFirstIsAfter = idxFirstMightBeIntersecting;
    while (!(idxFirstIsAfter >= this._ranges.length || range.endExclusive < this._ranges[idxFirstIsAfter].start)) {
      idxFirstIsAfter++;
    }
    const delta = newLength - range.length;
    for (let i = idxFirstIsAfter; i < this._ranges.length; i++) {
      this._ranges[i] = this._ranges[i].delta(delta);
    }
    if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
      const newRange = new OffsetRange(range.start, range.start + newLength);
      if (!newRange.isEmpty) {
        this._ranges.splice(idxFirstMightBeIntersecting, 0, newRange);
      }
    } else {
      const start = Math.min(range.start, this._ranges[idxFirstMightBeIntersecting].start);
      const endEx = Math.max(range.endExclusive, this._ranges[idxFirstIsAfter - 1].endExclusive);
      const newRange = new OffsetRange(start, endEx + delta);
      if (!newRange.isEmpty) {
        this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting, newRange);
      } else {
        this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting);
      }
    }
  }
  toString() {
    return this._ranges.map((r) => r.toString()).join(" + ");
  }
};
export { TokenizerWithStateStore, TrackingTokenizationStateStore, TokenizationStateStore, RangePriorityQueueImpl };
