// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/2d/rect.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { Point } from "./module-0492.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { Size2D } from "./module-0764.mjs";


// src/vs/editor/common/core/2d/rect.ts
var Rect = class _Rect {
  constructor(left, top2, right, bottom) {
    this.left = left;
    this.top = top2;
    this.right = right;
    this.bottom = bottom;
    if (left > right) {
      throw new BugIndicatingError("Invalid arguments: Horizontally offset by " + (left - right));
    }
    if (top2 > bottom) {
      throw new BugIndicatingError("Invalid arguments: Vertically offset by " + (top2 - bottom));
    }
  }
  static fromPoint(point) {
    return new _Rect(point.x, point.y, point.x, point.y);
  }
  static fromPoints(topLeft, bottomRight) {
    return new _Rect(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);
  }
  static fromPointSize(point, size3) {
    return new _Rect(point.x, point.y, point.x + size3.x, point.y + size3.y);
  }
  static fromLeftTopRightBottom(left, top2, right, bottom) {
    return new _Rect(left, top2, right, bottom);
  }
  static fromLeftTopWidthHeight(left, top2, width2, height) {
    return new _Rect(left, top2, left + width2, top2 + height);
  }
  static fromRanges(leftRight, topBottom) {
    return new _Rect(leftRight.start, topBottom.start, leftRight.endExclusive, topBottom.endExclusive);
  }
  static hull(rects) {
    let left = Number.MAX_SAFE_INTEGER;
    let top2 = Number.MAX_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let bottom = Number.MIN_SAFE_INTEGER;
    for (const rect of rects) {
      left = Math.min(left, rect.left);
      top2 = Math.min(top2, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    return new _Rect(left, top2, right, bottom);
  }
  get width() {
    return this.right - this.left;
  }
  get height() {
    return this.bottom - this.top;
  }
  withMargin(marginOrVerticalOrTop, rightOrHorizontal, bottom, left) {
    let marginLeft, marginRight, marginTop, marginBottom;
    if (rightOrHorizontal === void 0 && bottom === void 0 && left === void 0) {
      marginLeft = marginRight = marginTop = marginBottom = marginOrVerticalOrTop;
    } else if (bottom === void 0 && left === void 0) {
      marginLeft = marginRight = rightOrHorizontal;
      marginTop = marginBottom = marginOrVerticalOrTop;
    } else {
      marginLeft = left;
      marginRight = rightOrHorizontal;
      marginTop = marginOrVerticalOrTop;
      marginBottom = bottom;
    }
    return new _Rect(
      this.left - marginLeft,
      this.top - marginTop,
      this.right + marginRight,
      this.bottom + marginBottom
    );
  }
  intersectVertical(range2) {
    const newTop = Math.max(this.top, range2.start);
    const newBottom = Math.min(this.bottom, range2.endExclusive);
    return new _Rect(
      this.left,
      newTop,
      this.right,
      Math.max(newTop, newBottom)
    );
  }
  intersectHorizontal(range2) {
    const newLeft = Math.max(this.left, range2.start);
    const newRight = Math.min(this.right, range2.endExclusive);
    return new _Rect(
      newLeft,
      this.top,
      Math.max(newLeft, newRight),
      this.bottom
    );
  }
  toString() {
    return `Rect{(${this.left},${this.top}), (${this.right},${this.bottom})}`;
  }
  intersect(parent) {
    const left = Math.max(this.left, parent.left);
    const right = Math.min(this.right, parent.right);
    const top2 = Math.max(this.top, parent.top);
    const bottom = Math.min(this.bottom, parent.bottom);
    if (left > right || top2 > bottom) {
      return void 0;
    }
    return new _Rect(left, top2, right, bottom);
  }
  union(other) {
    return new _Rect(
      Math.min(this.left, other.left),
      Math.min(this.top, other.top),
      Math.max(this.right, other.right),
      Math.max(this.bottom, other.bottom)
    );
  }
  containsRect(other) {
    return this.left <= other.left && this.top <= other.top && this.right >= other.right && this.bottom >= other.bottom;
  }
  containsPoint(point) {
    return this.left <= point.x && this.top <= point.y && this.right >= point.x && this.bottom >= point.y;
  }
  moveToBeContainedIn(parent) {
    const width2 = this.width;
    const height = this.height;
    let left = this.left;
    let top2 = this.top;
    if (left < parent.left) {
      left = parent.left;
    } else if (left + width2 > parent.right) {
      left = parent.right - width2;
    }
    if (top2 < parent.top) {
      top2 = parent.top;
    } else if (top2 + height > parent.bottom) {
      top2 = parent.bottom - height;
    }
    return new _Rect(left, top2, left + width2, top2 + height);
  }
  withWidth(width2) {
    return new _Rect(this.left, this.top, this.left + width2, this.bottom);
  }
  withHeight(height) {
    return new _Rect(this.left, this.top, this.right, this.top + height);
  }
  withTop(top2) {
    return new _Rect(this.left, top2, this.right, this.bottom);
  }
  withLeft(left) {
    return new _Rect(left, this.top, this.right, this.bottom);
  }
  translateX(delta2) {
    return new _Rect(this.left + delta2, this.top, this.right + delta2, this.bottom);
  }
  translateY(delta2) {
    return new _Rect(this.left, this.top + delta2, this.right, this.bottom + delta2);
  }
  translate(point) {
    return new _Rect(this.left + point.x, this.top + point.y, this.right + point.x, this.bottom + point.y);
  }
  deltaRight(delta2) {
    return new _Rect(this.left, this.top, this.right + delta2, this.bottom);
  }
  deltaTop(delta2) {
    return new _Rect(this.left, this.top + delta2, this.right, this.bottom);
  }
  deltaLeft(delta2) {
    return new _Rect(this.left + delta2, this.top, this.right, this.bottom);
  }
  deltaBottom(delta2) {
    return new _Rect(this.left, this.top, this.right, this.bottom + delta2);
  }
  getLeftBottom() {
    return new Point(this.left, this.bottom);
  }
  getRightBottom() {
    return new Point(this.right, this.bottom);
  }
  getLeftTop() {
    return new Point(this.left, this.top);
  }
  getRightTop() {
    return new Point(this.right, this.top);
  }
  toStyles() {
    return {
      position: "absolute",
      left: `${this.left}px`,
      top: `${this.top}px`,
      width: `${this.width}px`,
      height: `${this.height}px`
    };
  }
  getHorizontalRange() {
    return new OffsetRange(this.left, this.right);
  }
  getVerticalRange() {
    return new OffsetRange(this.top, this.bottom);
  }
  withHorizontalRange(range2) {
    return new _Rect(range2.start, this.top, range2.endExclusive, this.bottom);
  }
  withVerticalRange(range2) {
    return new _Rect(this.left, range2.start, this.right, range2.endExclusive);
  }
  getSize() {
    return new Size2D(this.width, this.height);
  }
};
export { Rect };
