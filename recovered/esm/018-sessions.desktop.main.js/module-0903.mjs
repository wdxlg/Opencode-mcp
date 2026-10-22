// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/location.ts
import { Range4 } from "./module-0900.mjs";
import { URI } from "./module-0032.mjs";
import { Position2 } from "./module-0899.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";


// src/vs/workbench/api/common/extHostTypes/location.ts
var Location2 = class {
  static isLocation(thing) {
    if (thing instanceof Location2) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range4.isRange(thing.range) && URI.isUri(thing.uri);
  }
  constructor(uri4, rangeOrPosition) {
    this.uri = uri4;
    if (!rangeOrPosition) {
    } else if (Range4.isRange(rangeOrPosition)) {
      this.range = Range4.of(rangeOrPosition);
    } else if (Position2.isPosition(rangeOrPosition)) {
      this.range = new Range4(rangeOrPosition, rangeOrPosition);
    } else {
      throw new Error("Illegal argument");
    }
  }
  toJSON() {
    return {
      uri: this.uri,
      range: this.range
    };
  }
};

Location2 = __decorateClass([
  es5ClassCompat
], Location2);
export { Location2 };
