// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/range.ts
import { Position2 } from "./module-0226.mjs";
import { illegalArgument } from "./module-0002.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0224.mjs";


// src/vs/workbench/api/common/extHostTypes/range.ts
var Range2 = class {
  static isRange(thing) {
    if (thing instanceof Range2) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return Position2.isPosition(thing.start) && Position2.isPosition(thing.end);
  }
  static of(obj) {
    if (obj instanceof Range2) {
      return obj;
    }
    if (this.isRange(obj)) {
      return new Range2(obj.start, obj.end);
    }
    throw new Error("Invalid argument, is NOT a range-like object");
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
    let start;
    let end;
    if (typeof startLineOrStart === "number" && typeof startColumnOrEnd === "number" && typeof endLine === "number" && typeof endColumn === "number") {
      start = new Position2(startLineOrStart, startColumnOrEnd);
      end = new Position2(endLine, endColumn);
    } else if (Position2.isPosition(startLineOrStart) && Position2.isPosition(startColumnOrEnd)) {
      start = Position2.of(startLineOrStart);
      end = Position2.of(startColumnOrEnd);
    }
    if (!start || !end) {
      throw new Error("Invalid arguments");
    }
    if (start.isBefore(end)) {
      this._start = start;
      this._end = end;
    } else {
      this._start = end;
      this._end = start;
    }
  }
  contains(positionOrRange) {
    if (Range2.isRange(positionOrRange)) {
      return this.contains(positionOrRange.start) && this.contains(positionOrRange.end);
    } else if (Position2.isPosition(positionOrRange)) {
      if (Position2.of(positionOrRange).isBefore(this._start)) {
        return false;
      }
      if (this._end.isBefore(positionOrRange)) {
        return false;
      }
      return true;
    }
    return false;
  }
  isEqual(other) {
    return this._start.isEqual(other._start) && this._end.isEqual(other._end);
  }
  intersection(other) {
    const start = Position2.Max(other.start, this._start);
    const end = Position2.Min(other.end, this._end);
    if (start.isAfter(end)) {
      return void 0;
    }
    return new Range2(start, end);
  }
  union(other) {
    if (this.contains(other)) {
      return this;
    } else if (other.contains(this)) {
      return other;
    }
    const start = Position2.Min(other.start, this._start);
    const end = Position2.Max(other.end, this.end);
    return new Range2(start, end);
  }
  get isEmpty() {
    return this._start.isEqual(this._end);
  }
  get isSingleLine() {
    return this._start.line === this._end.line;
  }
  with(startOrChange, end = this.end) {
    if (startOrChange === null || end === null) {
      throw illegalArgument();
    }
    let start;
    if (!startOrChange) {
      start = this.start;
    } else if (Position2.isPosition(startOrChange)) {
      start = startOrChange;
    } else {
      start = startOrChange.start || this.start;
      end = startOrChange.end || this.end;
    }
    if (start.isEqual(this._start) && end.isEqual(this.end)) {
      return this;
    }
    return new Range2(start, end);
  }
  toJSON() {
    return [this.start, this.end];
  }
  [/* @__PURE__ */ Symbol.for("debug.description")]() {
    return getDebugDescriptionOfRange(this);
  }
};

Range2 = __decorateClass([
  es5ClassCompat
], Range2);

function getDebugDescriptionOfRange(range) {
  return range.isEmpty ? `[${range.start.line}:${range.start.character})` : `[${range.start.line}:${range.start.character} -> ${range.end.line}:${range.end.character})`;
}
export { getDebugDescriptionOfRange, Range2 };
