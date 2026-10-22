// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/decorations/decorations.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { Range2 } from "./module-0106.mjs";
import { HorizontalRange } from "./module-0240.mjs";


// src/vs/editor/browser/viewParts/decorations/decorations.ts
var DecorationsOverlay = class extends DynamicViewOverlay {
  constructor(context2) {
    super();
    this._context = context2;
    const options3 = this._context.configuration.options;
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    return true;
  }
  onDecorationsChanged(e4) {
    return true;
  }
  onFlushed(e4) {
    return true;
  }
  onLinesChanged(e4) {
    return true;
  }
  onLinesDeleted(e4) {
    return true;
  }
  onLinesInserted(e4) {
    return true;
  }
  onScrollChanged(e4) {
    return e4.scrollTopChanged || e4.scrollWidthChanged;
  }
  onZonesChanged(e4) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    const _decorations = ctx.getDecorationsInViewport();
    let decorations = [];
    let decorationsLen = 0;
    for (let i2 = 0, len = _decorations.length; i2 < len; i2++) {
      const d = _decorations[i2];
      if (d.options.className) {
        decorations[decorationsLen++] = d;
      }
    }
    decorations = decorations.sort((a, b) => {
      if (a.options.zIndex < b.options.zIndex) {
        return -1;
      }
      if (a.options.zIndex > b.options.zIndex) {
        return 1;
      }
      const aClassName = a.options.className;
      const bClassName = b.options.className;
      if (aClassName < bClassName) {
        return -1;
      }
      if (aClassName > bClassName) {
        return 1;
      }
      return Range2.compareRangesUsingStarts(a.range, b.range);
    });
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      output[lineIndex] = "";
    }
    this._renderWholeLineDecorations(ctx, decorations, output);
    this._renderNormalDecorations(ctx, decorations, output);
    this._renderResult = output;
  }
  _renderWholeLineDecorations(ctx, decorations, output) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    for (let i2 = 0, lenI = decorations.length; i2 < lenI; i2++) {
      const d = decorations[i2];
      if (!d.options.isWholeLine) {
        continue;
      }
      const decorationOutput = '<div class="cdr ' + d.options.className + '" style="left:0;width:100%;"></div>';
      const startLineNumber = Math.max(d.range.startLineNumber, visibleStartLineNumber);
      const endLineNumber = Math.min(d.range.endLineNumber, visibleEndLineNumber);
      for (let j = startLineNumber; j <= endLineNumber; j++) {
        const lineIndex = j - visibleStartLineNumber;
        output[lineIndex] += decorationOutput;
      }
    }
  }
  _renderNormalDecorations(ctx, decorations, output) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    let prevClassName = null;
    let prevShowIfCollapsed = false;
    let prevRange = null;
    let prevShouldFillLineOnLineBreak = false;
    for (let i2 = 0, lenI = decorations.length; i2 < lenI; i2++) {
      const d = decorations[i2];
      if (d.options.isWholeLine) {
        continue;
      }
      const className2 = d.options.className;
      const showIfCollapsed = Boolean(d.options.showIfCollapsed);
      let range2 = d.range;
      if (showIfCollapsed && range2.endColumn === 1 && range2.endLineNumber !== range2.startLineNumber) {
        range2 = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber - 1, this._context.viewModel.getLineMaxColumn(range2.endLineNumber - 1));
      }
      if (prevClassName === className2 && prevShowIfCollapsed === showIfCollapsed && Range2.areIntersectingOrTouching(prevRange, range2)) {
        prevRange = Range2.plusRange(prevRange, range2);
        continue;
      }
      if (prevClassName !== null) {
        this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, visibleStartLineNumber, output);
      }
      prevClassName = className2;
      prevShowIfCollapsed = showIfCollapsed;
      prevRange = range2;
      prevShouldFillLineOnLineBreak = d.options.shouldFillLineOnLineBreak ?? false;
    }
    if (prevClassName !== null) {
      this._renderNormalDecoration(ctx, prevRange, prevClassName, prevShouldFillLineOnLineBreak, prevShowIfCollapsed, visibleStartLineNumber, output);
    }
  }
  _renderNormalDecoration(ctx, range2, className2, shouldFillLineOnLineBreak, showIfCollapsed, visibleStartLineNumber, output) {
    const linesVisibleRanges = ctx.linesVisibleRangesForRange(
      range2,
      /*TODO@Alex*/
      className2 === "findMatch"
    );
    if (!linesVisibleRanges) {
      return;
    }
    for (let j = 0, lenJ = linesVisibleRanges.length; j < lenJ; j++) {
      const lineVisibleRanges = linesVisibleRanges[j];
      if (lineVisibleRanges.outsideRenderedLine) {
        continue;
      }
      const lineIndex = lineVisibleRanges.lineNumber - visibleStartLineNumber;
      if (showIfCollapsed && lineVisibleRanges.ranges.length === 1) {
        const singleVisibleRange = lineVisibleRanges.ranges[0];
        if (singleVisibleRange.width < this._typicalHalfwidthCharacterWidth) {
          const center = Math.round(singleVisibleRange.left + singleVisibleRange.width / 2);
          const left = Math.max(0, Math.round(center - this._typicalHalfwidthCharacterWidth / 2));
          lineVisibleRanges.ranges[0] = new HorizontalRange(left, this._typicalHalfwidthCharacterWidth);
        }
      }
      for (let k = 0, lenK = lineVisibleRanges.ranges.length; k < lenK; k++) {
        const expandToLeft = shouldFillLineOnLineBreak && lineVisibleRanges.continuesOnNextLine && lenK === 1;
        const visibleRange = lineVisibleRanges.ranges[k];
        const decorationOutput = '<div class="cdr ' + className2 + '" style="left:' + String(visibleRange.left) + "px;width:" + (expandToLeft ? "100%;" : String(visibleRange.width) + "px;") + '"></div>';
        output[lineIndex] += decorationOutput;
      }
    }
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    const lineIndex = lineNumber - startLineNumber;
    if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
      return "";
    }
    return this._renderResult[lineIndex];
  }
};
export { DecorationsOverlay };
