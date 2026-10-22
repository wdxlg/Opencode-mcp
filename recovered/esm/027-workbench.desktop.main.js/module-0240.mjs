// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/view/renderingContext.ts



// src/vs/editor/browser/view/renderingContext.ts
var RestrictedRenderingContext = class {
  constructor(viewLayout, viewportData) {
    this._restrictedRenderingContextBrand = void 0;
    this._viewLayout = viewLayout;
    this.viewportData = viewportData;
    this.scrollWidth = this._viewLayout.getScrollWidth();
    this.scrollHeight = this._viewLayout.getScrollHeight();
    this.visibleRange = this.viewportData.visibleRange;
    this.bigNumbersDelta = this.viewportData.bigNumbersDelta;
    const vInfo = this._viewLayout.getCurrentViewport();
    this.scrollTop = vInfo.top;
    this.scrollLeft = vInfo.left;
    this.viewportWidth = vInfo.width;
    this.viewportHeight = vInfo.height;
  }
  getScrolledTopFromAbsoluteTop(absoluteTop) {
    return absoluteTop - this.scrollTop;
  }
  getVerticalOffsetForLineNumber(lineNumber, includeViewZones) {
    return this._viewLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
  }
  getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones) {
    return this._viewLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
  }
  getLineHeightForLineNumber(lineNumber) {
    return this._viewLayout.getLineHeightForLineNumber(lineNumber);
  }
  getDecorationsInViewport() {
    return this.viewportData.getDecorationsInViewport();
  }
};

var RenderingContext = class extends RestrictedRenderingContext {
  constructor(viewLayout, viewportData, viewLines, viewLinesGpu) {
    super(viewLayout, viewportData);
    this._renderingContextBrand = void 0;
    this._viewLines = viewLines;
    this._viewLinesGpu = viewLinesGpu;
  }
  linesVisibleRangesForRange(range2, includeNewLines) {
    const domRanges = this._viewLines.linesVisibleRangesForRange(range2, includeNewLines);
    if (!this._viewLinesGpu) {
      return domRanges;
    }
    const gpuRanges = this._viewLinesGpu.linesVisibleRangesForRange(range2, includeNewLines);
    if (!domRanges) {
      return gpuRanges;
    }
    if (!gpuRanges) {
      return domRanges;
    }
    return domRanges.concat(gpuRanges).sort((a, b) => a.lineNumber - b.lineNumber);
  }
  visibleRangeForPosition(position2) {
    return this._viewLines.visibleRangeForPosition(position2) ?? this._viewLinesGpu?.visibleRangeForPosition(position2) ?? null;
  }
};

var LineVisibleRanges = class {
  constructor(outsideRenderedLine, lineNumber, ranges, continuesOnNextLine) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.lineNumber = lineNumber;
    this.ranges = ranges;
    this.continuesOnNextLine = continuesOnNextLine;
  }
  /**
   * Returns the element with the smallest `lineNumber`.
   */
  static firstLine(ranges) {
    if (!ranges) {
      return null;
    }
    let result = null;
    for (const range2 of ranges) {
      if (!result || range2.lineNumber < result.lineNumber) {
        result = range2;
      }
    }
    return result;
  }
  /**
   * Returns the element with the largest `lineNumber`.
   */
  static lastLine(ranges) {
    if (!ranges) {
      return null;
    }
    let result = null;
    for (const range2 of ranges) {
      if (!result || range2.lineNumber > result.lineNumber) {
        result = range2;
      }
    }
    return result;
  }
};

var HorizontalRange = class _HorizontalRange {
  constructor(left, width2) {
    this._horizontalRangeBrand = void 0;
    this.left = Math.round(left);
    this.width = Math.round(width2);
  }
  static from(ranges) {
    const result = new Array(ranges.length);
    for (let i2 = 0, len = ranges.length; i2 < len; i2++) {
      const range2 = ranges[i2];
      result[i2] = new _HorizontalRange(range2.left, range2.width);
    }
    return result;
  }
  toString() {
    return `[${this.left},${this.width}]`;
  }
};

var FloatHorizontalRange = class {
  constructor(left, width2) {
    this._floatHorizontalRangeBrand = void 0;
    this.left = left;
    this.width = width2;
  }
  toString() {
    return `[${this.left},${this.width}]`;
  }
  static compare(a, b) {
    return a.left - b.left;
  }
};

var HorizontalPosition = class {
  constructor(outsideRenderedLine, left) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.originalLeft = left;
    this.left = Math.round(this.originalLeft);
  }
};

var VisibleRanges = class {
  constructor(outsideRenderedLine, ranges) {
    this.outsideRenderedLine = outsideRenderedLine;
    this.ranges = ranges;
  }
};
export { RestrictedRenderingContext, RenderingContext, LineVisibleRanges, HorizontalRange, FloatHorizontalRange, HorizontalPosition, VisibleRanges };
