// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/2d/point.ts



// src/vs/editor/common/core/2d/point.ts
var Point = class _Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  static equals(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  add(other) {
    return new _Point(this.x + other.x, this.y + other.y);
  }
  deltaX(delta2) {
    return new _Point(this.x + delta2, this.y);
  }
  deltaY(delta2) {
    return new _Point(this.x, this.y + delta2);
  }
  toString() {
    return `(${this.x},${this.y})`;
  }
  subtract(other) {
    return new _Point(this.x - other.x, this.y - other.y);
  }
  scale(factor2) {
    return new _Point(this.x * factor2, this.y * factor2);
  }
  mapComponents(map) {
    return new _Point(map(this.x), map(this.y));
  }
  isZero() {
    return this.x === 0 && this.y === 0;
  }
  withThreshold(threshold) {
    return this.mapComponents((axisVal) => {
      if (axisVal > threshold) {
        return axisVal - threshold;
      } else if (axisVal < -threshold) {
        return axisVal + threshold;
      }
      return 0;
    });
  }
};
export { Point };
