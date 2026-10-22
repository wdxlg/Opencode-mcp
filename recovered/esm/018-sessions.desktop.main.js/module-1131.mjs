// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/lineRange.ts
import { LineRange } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/lineRange.ts
var MergeEditorLineRange = class _MergeEditorLineRange extends LineRange {
  static fromLineNumbers(startLineNumber, endExclusiveLineNumber) {
    return _MergeEditorLineRange.fromLength(startLineNumber, endExclusiveLineNumber - startLineNumber);
  }
  static fromLength(startLineNumber, length) {
    return new _MergeEditorLineRange(startLineNumber, startLineNumber + length);
  }
  join(other) {
    return _MergeEditorLineRange.fromLineNumbers(Math.min(this.startLineNumber, other.startLineNumber), Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive));
  }
  isAfter(range2) {
    return this.startLineNumber >= range2.endLineNumberExclusive;
  }
  isBefore(range2) {
    return range2.startLineNumber >= this.endLineNumberExclusive;
  }
  delta(lineDelta) {
    return _MergeEditorLineRange.fromLength(this.startLineNumber + lineDelta, this.length);
  }
  deltaEnd(delta2) {
    return _MergeEditorLineRange.fromLength(this.startLineNumber, this.length + delta2);
  }
  deltaStart(lineDelta) {
    return _MergeEditorLineRange.fromLength(this.startLineNumber + lineDelta, this.length - lineDelta);
  }
  getLines(model) {
    const result = new Array(this.length);
    for (let i2 = 0; i2 < this.length; i2++) {
      result[i2] = model.getLineContent(this.startLineNumber + i2);
    }
    return result;
  }
  toInclusiveRangeOrEmpty() {
    if (this.isEmpty) {
      return new Range2(this.startLineNumber, 1, this.startLineNumber, 1);
    }
    return new Range2(this.startLineNumber, 1, this.endLineNumberExclusive - 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
  }
};
export { MergeEditorLineRange };
