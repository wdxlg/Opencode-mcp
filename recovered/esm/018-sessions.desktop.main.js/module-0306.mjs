// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/misc/rgba.ts



// src/vs/editor/common/core/misc/rgba.ts
var RGBA8 = class _RGBA8 {
  constructor(r2, g, b, a) {
    this._rgba8Brand = void 0;
    this.r = _RGBA8._clamp(r2);
    this.g = _RGBA8._clamp(g);
    this.b = _RGBA8._clamp(b);
    this.a = _RGBA8._clamp(a);
  }
  static {
    this.Empty = new _RGBA8(0, 0, 0, 0);
  }
  equals(other) {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }
  static _clamp(c) {
    if (c < 0) {
      return 0;
    }
    if (c > 255) {
      return 255;
    }
    return c | 0;
  }
};
export { RGBA8 };
