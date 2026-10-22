// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/selection.ts
import { Range2, getDebugDescriptionOfRange } from "./module-0233.mjs";
import { Position2 } from "./module-0232.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/selection.ts
var Selection = class extends Range2 {
  static isSelection(thing) {
    if (thing instanceof Selection) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return Range2.isRange(thing) && Position2.isPosition(thing.anchor) && Position2.isPosition(thing.active) && typeof thing.isReversed === "boolean";
  }
  get anchor() {
    return this._anchor;
  }
  get active() {
    return this._active;
  }
  constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
    let anchor;
    let active;
    if (typeof anchorLineOrAnchor === "number" && typeof anchorColumnOrActive === "number" && typeof activeLine === "number" && typeof activeColumn === "number") {
      anchor = new Position2(anchorLineOrAnchor, anchorColumnOrActive);
      active = new Position2(activeLine, activeColumn);
    } else if (Position2.isPosition(anchorLineOrAnchor) && Position2.isPosition(anchorColumnOrActive)) {
      anchor = Position2.of(anchorLineOrAnchor);
      active = Position2.of(anchorColumnOrActive);
    }
    if (!anchor || !active) {
      throw new Error("Invalid arguments");
    }
    super(anchor, active);
    this._anchor = anchor;
    this._active = active;
  }
  get isReversed() {
    return this._anchor === this._end;
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end,
      active: this.active,
      anchor: this.anchor
    };
  }
  [/* @__PURE__ */ Symbol.for("debug.description")]() {
    return getDebugDescriptionOfSelection(this);
  }
};

Selection = __decorateClass([
  es5ClassCompat
], Selection);

function getDebugDescriptionOfSelection(selection) {
  let rangeStr = getDebugDescriptionOfRange(selection);
  if (!selection.isEmpty) {
    if (selection.active.isEqual(selection.start)) {
      rangeStr = `|${rangeStr}`;
    } else {
      rangeStr = `${rangeStr}|`;
    }
  }
  return rangeStr;
}
export { getDebugDescriptionOfSelection, Selection };
