// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/css/decorationStyleCache.ts
import { NKeyMap } from "./module-0008.mjs";


// src/vs/editor/browser/gpu/css/decorationStyleCache.ts
var DecorationStyleCache = class {
  constructor() {
    this._nextId = 1;
    this._cacheById = /* @__PURE__ */ new Map();
    this._cacheByStyle = new NKeyMap();
  }
  getOrCreateEntry(color2, bold, opacity, strikethrough, strikethroughThickness, strikethroughColor) {
    if (color2 === void 0 && bold === void 0 && opacity === void 0 && strikethrough === void 0 && strikethroughThickness === void 0 && strikethroughColor === void 0) {
      return 0;
    }
    const result = this._cacheByStyle.get(
      color2 ?? 0,
      bold ? 1 : 0,
      opacity === void 0 ? "" : opacity.toFixed(2),
      strikethrough ? 1 : 0,
      strikethroughThickness === void 0 ? "" : strikethroughThickness.toFixed(2),
      strikethroughColor ?? 0
    );
    if (result) {
      return result.id;
    }
    const id2 = this._nextId++;
    const entry = {
      id: id2,
      color: color2,
      bold,
      opacity,
      strikethrough,
      strikethroughThickness,
      strikethroughColor
    };
    this._cacheById.set(id2, entry);
    this._cacheByStyle.set(
      entry,
      color2 ?? 0,
      bold ? 1 : 0,
      opacity === void 0 ? "" : opacity.toFixed(2),
      strikethrough ? 1 : 0,
      strikethroughThickness === void 0 ? "" : strikethroughThickness.toFixed(2),
      strikethroughColor ?? 0
    );
    return id2;
  }
  getStyleSet(id2) {
    if (id2 === 0) {
      return void 0;
    }
    return this._cacheById.get(id2);
  }
};
export { DecorationStyleCache };
