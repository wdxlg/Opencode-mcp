// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/ranges/columnRange.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { Range2 } from "./module-0106.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/common/core/ranges/columnRange.ts
var ColumnRange = class _ColumnRange {
  constructor(startColumn, endColumnExclusive) {
    this.startColumn = startColumn;
    this.endColumnExclusive = endColumnExclusive;
    if (startColumn > endColumnExclusive) {
      throw new BugIndicatingError(`startColumn ${startColumn} cannot be after endColumnExclusive ${endColumnExclusive}`);
    }
  }
  static fromOffsetRange(offsetRange) {
    return new _ColumnRange(offsetRange.start + 1, offsetRange.endExclusive + 1);
  }
  toRange(lineNumber) {
    return new Range2(lineNumber, this.startColumn, lineNumber, this.endColumnExclusive);
  }
  equals(other) {
    return this.startColumn === other.startColumn && this.endColumnExclusive === other.endColumnExclusive;
  }
  toZeroBasedOffsetRange() {
    return new OffsetRange(this.startColumn - 1, this.endColumnExclusive - 1);
  }
};
export { ColumnRange };
