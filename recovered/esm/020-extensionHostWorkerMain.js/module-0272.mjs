// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/core/characterClassifier.ts
import { toUint8 } from "./module-0028.mjs";


// src/vs/editor/common/core/characterClassifier.ts
var CharacterClassifier = class _CharacterClassifier {
  constructor(_defaultValue) {
    const defaultValue = toUint8(_defaultValue);
    this._defaultValue = defaultValue;
    this._asciiMap = _CharacterClassifier._createAsciiMap(defaultValue);
    this._map = /* @__PURE__ */ new Map();
  }
  static _createAsciiMap(defaultValue) {
    const asciiMap = new Uint8Array(256);
    asciiMap.fill(defaultValue);
    return asciiMap;
  }
  set(charCode, _value) {
    const value = toUint8(_value);
    if (charCode >= 0 && charCode < 256) {
      this._asciiMap[charCode] = value;
    } else {
      this._map.set(charCode, value);
    }
  }
  get(charCode) {
    if (charCode >= 0 && charCode < 256) {
      return this._asciiMap[charCode];
    } else {
      return this._map.get(charCode) || this._defaultValue;
    }
  }
  clear() {
    this._asciiMap.fill(this._defaultValue);
    this._map.clear();
  }
};
export { CharacterClassifier };
