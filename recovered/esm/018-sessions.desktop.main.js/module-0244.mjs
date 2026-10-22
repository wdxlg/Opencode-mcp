// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/linePart.ts



// src/vs/editor/common/viewLayout/linePart.ts
var LinePart = class {
  constructor(endIndex, type, metadata, containsRTL2) {
    this.endIndex = endIndex;
    this.type = type;
    this.metadata = metadata;
    this.containsRTL = containsRTL2;
    this._linePartBrand = void 0;
  }
  isWhitespace() {
    return this.metadata & 1 /* IS_WHITESPACE_MASK */ ? true : false;
  }
  isPseudoAfter() {
    return this.metadata & 4 /* PSEUDO_AFTER_MASK */ ? true : false;
  }
};
export { LinePart };
