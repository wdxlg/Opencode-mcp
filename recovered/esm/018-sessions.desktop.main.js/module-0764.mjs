// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/2d/size.ts



// src/vs/editor/common/core/2d/size.ts
var Size2D = class _Size2D {
  constructor(width2, height) {
    this.width = width2;
    this.height = height;
  }
  static equals(a, b) {
    return a.width === b.width && a.height === b.height;
  }
  add(other) {
    return new _Size2D(this.width + other.width, this.height + other.height);
  }
  deltaX(delta2) {
    return new _Size2D(this.width + delta2, this.height);
  }
  deltaY(delta2) {
    return new _Size2D(this.width, this.height + delta2);
  }
  toString() {
    return `(${this.width},${this.height})`;
  }
  subtract(other) {
    return new _Size2D(this.width - other.width, this.height - other.height);
  }
  scale(factor2) {
    return new _Size2D(this.width * factor2, this.height * factor2);
  }
  scaleWidth(factor2) {
    return new _Size2D(this.width * factor2, this.height);
  }
  mapComponents(map) {
    return new _Size2D(map(this.width), map(this.height));
  }
  isZero() {
    return this.width === 0 && this.height === 0;
  }
  transpose() {
    return new _Size2D(this.height, this.width);
  }
  toDimension() {
    return { width: this.width, height: this.height };
  }
};
export { Size2D };
