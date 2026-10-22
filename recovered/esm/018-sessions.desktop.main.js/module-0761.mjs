// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/ranges/rangeSingleLine.ts
import { ColumnRange } from "./module-0760.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/core/ranges/rangeSingleLine.ts
var RangeSingleLine = class _RangeSingleLine {
  constructor(lineNumber, columnRange) {
    this.lineNumber = lineNumber;
    this.columnRange = columnRange;
  }
  static fromRange(range2) {
    if (range2.endLineNumber !== range2.startLineNumber) {
      return void 0;
    }
    return new _RangeSingleLine(range2.startLineNumber, new ColumnRange(range2.startColumn, range2.endColumn));
  }
  toRange() {
    return new Range2(this.lineNumber, this.columnRange.startColumn, this.lineNumber, this.columnRange.endColumnExclusive);
  }
};
export { RangeSingleLine };
