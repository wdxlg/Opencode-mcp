// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/location.ts
import { Range2 } from "./module-0233.mjs";
import { URI } from "./module-0025.mjs";
import { Position2 } from "./module-0232.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/location.ts
var Location2 = class {
  static isLocation(thing) {
    if (thing instanceof Location2) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range2.isRange(thing.range) && URI.isUri(thing.uri);
  }
  constructor(uri2, rangeOrPosition) {
    this.uri = uri2;
    if (!rangeOrPosition) {
    } else if (Range2.isRange(rangeOrPosition)) {
      this.range = Range2.of(rangeOrPosition);
    } else if (Position2.isPosition(rangeOrPosition)) {
      this.range = new Range2(rangeOrPosition, rangeOrPosition);
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
