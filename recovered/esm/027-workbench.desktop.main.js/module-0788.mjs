// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/longDistnaceWidgetPlacement.ts
import { Size2D } from "./module-0764.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { getMaxTowerHeightInAvailableArea } from "./module-0787.mjs";
import { LineRange } from "./module-0174.mjs";
import { derived } from "./module-0054.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/longDistnaceWidgetPlacement.ts
var WidgetPlacementContext = class {
  constructor(_lineRangeInfo, editorTrueContentWidth, endOfLinePadding) {
    this._lineRangeInfo = _lineRangeInfo;
    this.availableSpaceSizes = _lineRangeInfo.sizes.map((s, idx) => {
      const lineNumber = _lineRangeInfo.lineRange.startLineNumber + idx;
      const linePaddingLeft = endOfLinePadding(lineNumber);
      return new Size2D(Math.max(0, editorTrueContentWidth - s.width - linePaddingLeft), s.height);
    });
    this.availableSpaceHeightPrefixSums = getSums(this.availableSpaceSizes, (s) => s.height);
    this.availableSpaceSizesTransposed = this.availableSpaceSizes.map((s) => s.transpose());
  }
  /**
   * Computes the vertical outline for a widget placed at the given line number.
   */
  getWidgetVerticalOutline(lineNumber, previewEditorHeight, layoutConstants) {
    const sizeIdx = lineNumber - this._lineRangeInfo.lineRange.startLineNumber;
    const top2 = this._lineRangeInfo.top + this.availableSpaceHeightPrefixSums[sizeIdx];
    const editorRange = OffsetRange.ofStartAndLength(top2, previewEditorHeight);
    const { previewEditorMargin, widgetPadding, widgetBorder: widgetBorder2, lowerBarHeight } = layoutConstants;
    const verticalWidgetRange = editorRange.withMargin(previewEditorMargin + widgetPadding + widgetBorder2).withMargin(0, lowerBarHeight);
    return verticalWidgetRange;
  }
  /**
   * Tries to find a valid widget outline within this line range context.
   */
  tryFindWidgetOutline(targetLineNumber, previewEditorHeight, editorTrueContentRight, layoutConstants) {
    if (this._lineRangeInfo.lineRange.length < 3) {
      return void 0;
    }
    return findFirstMinimzeDistance(
      this._lineRangeInfo.lineRange.addMargin(-1, -1),
      targetLineNumber,
      (lineNumber) => {
        const verticalWidgetRange = this.getWidgetVerticalOutline(lineNumber, previewEditorHeight, layoutConstants);
        const maxWidth = getMaxTowerHeightInAvailableArea(
          verticalWidgetRange.delta(-this._lineRangeInfo.top),
          this.availableSpaceSizesTransposed
        );
        if (maxWidth < layoutConstants.minWidgetWidth) {
          return void 0;
        }
        const horizontalWidgetRange = OffsetRange.ofStartAndLength(editorTrueContentRight - maxWidth, maxWidth);
        return { horizontalWidgetRange, verticalWidgetRange };
      }
    );
  }
};

function splitIntoContinuousLineRanges(lineRange, sizes, top2, editorObs, reader) {
  const result = [];
  let currentRangeStart = lineRange.startLineNumber;
  let currentRangeTop = top2;
  let currentSizes = [];
  for (let i2 = 0; i2 < sizes.length; i2++) {
    const lineNumber = lineRange.startLineNumber + i2;
    const expectedTop = currentRangeTop + currentSizes.reduce((p, c) => p + c.height, 0);
    const actualTop = editorObs.editor.getTopForLineNumber(lineNumber);
    if (i2 > 0 && actualTop !== expectedTop) {
      result.push({
        lineRange: LineRange.ofLength(currentRangeStart, lineNumber - currentRangeStart),
        top: currentRangeTop,
        sizes: currentSizes
      });
      currentRangeStart = lineNumber;
      currentRangeTop = actualTop;
      currentSizes = [];
    }
    currentSizes.push(sizes[i2]);
  }
  result.push({
    lineRange: LineRange.ofLength(currentRangeStart, lineRange.endLineNumberExclusive - currentRangeStart),
    top: currentRangeTop,
    sizes: currentSizes
  });
  derived({ owner: "splitIntoContinuousLineRanges" }, (r2) => {
    return editorObs.observeTopForLineNumber(lineRange.endLineNumberExclusive - 1).read(r2);
  }).read(reader);
  return result;
}

function findFirstMinimzeDistance(range2, targetLine, predicate) {
  for (let offset = 0; ; offset++) {
    const down = targetLine + offset;
    if (down <= range2.endLineNumberExclusive) {
      const result = predicate(down);
      if (result !== void 0) {
        return result;
      }
    }
    const up = targetLine - offset;
    if (up >= range2.startLineNumber) {
      const result = predicate(up);
      if (result !== void 0) {
        return result;
      }
    }
    if (up < range2.startLineNumber && down > range2.endLineNumberExclusive) {
      return void 0;
    }
  }
}

function getSums(array3, fn) {
  const result = [0];
  let sum2 = 0;
  for (const item of array3) {
    sum2 += fn(item);
    result.push(sum2);
  }
  return result;
}
export { splitIntoContinuousLineRanges, findFirstMinimzeDistance, getSums, WidgetPlacementContext };
