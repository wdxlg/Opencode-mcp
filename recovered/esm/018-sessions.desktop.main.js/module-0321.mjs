// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/selections/selections.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorSelectionForeground } from "./module-0229.mjs";


// src/vs/editor/browser/viewParts/selections/selections.ts
var HorizontalRangeWithStyle = class {
  constructor(other) {
    this.left = other.left;
    this.width = other.width;
    this.startStyle = null;
    this.endStyle = null;
  }
};

var LineVisibleRangesWithStyle = class {
  constructor(lineNumber, ranges) {
    this.lineNumber = lineNumber;
    this.ranges = ranges;
  }
};

function toStyledRange(item) {
  return new HorizontalRangeWithStyle(item);
}

function toStyled(item) {
  return new LineVisibleRangesWithStyle(item.lineNumber, item.ranges.map(toStyledRange));
}

var SelectionsOverlay = class _SelectionsOverlay extends DynamicViewOverlay {
  constructor(context2) {
    super();
    this._previousFrameVisibleRangesWithStyle = [];
    this._context = context2;
    const options3 = this._context.configuration.options;
    this._roundedSelection = options3.get(115 /* roundedSelection */);
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    this._selections = [];
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  static {
    this.SELECTION_CLASS_NAME = "selected-text";
  }
  static {
    this.SELECTION_TOP_LEFT = "top-left-radius";
  }
  static {
    this.SELECTION_BOTTOM_LEFT = "bottom-left-radius";
  }
  static {
    this.SELECTION_TOP_RIGHT = "top-right-radius";
  }
  static {
    this.SELECTION_BOTTOM_RIGHT = "bottom-right-radius";
  }
  static {
    this.EDITOR_BACKGROUND_CLASS_NAME = "monaco-editor-background";
  }
  static {
    this.ROUNDED_PIECE_WIDTH = 10;
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    this._roundedSelection = options3.get(115 /* roundedSelection */);
    this._typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    return true;
  }
  onCursorStateChanged(e4) {
    this._selections = e4.selections.slice(0);
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
    return e4.scrollTopChanged;
  }
  onZonesChanged(e4) {
    return true;
  }
  // --- end event handlers
  _visibleRangesHaveGaps(linesVisibleRanges) {
    for (let i2 = 0, len = linesVisibleRanges.length; i2 < len; i2++) {
      const lineVisibleRanges = linesVisibleRanges[i2];
      if (lineVisibleRanges.ranges.length > 1) {
        return true;
      }
    }
    return false;
  }
  _enrichVisibleRangesWithStyle(viewport, linesVisibleRanges, previousFrame) {
    const epsilon = this._typicalHalfwidthCharacterWidth / 4;
    let previousFrameTop = null;
    let previousFrameBottom = null;
    if (previousFrame && previousFrame.length > 0 && linesVisibleRanges.length > 0) {
      const topLineNumber = linesVisibleRanges[0].lineNumber;
      if (topLineNumber === viewport.startLineNumber) {
        for (let i2 = 0; !previousFrameTop && i2 < previousFrame.length; i2++) {
          if (previousFrame[i2].lineNumber === topLineNumber) {
            previousFrameTop = previousFrame[i2].ranges[0];
          }
        }
      }
      const bottomLineNumber = linesVisibleRanges[linesVisibleRanges.length - 1].lineNumber;
      if (bottomLineNumber === viewport.endLineNumber) {
        for (let i2 = previousFrame.length - 1; !previousFrameBottom && i2 >= 0; i2--) {
          if (previousFrame[i2].lineNumber === bottomLineNumber) {
            previousFrameBottom = previousFrame[i2].ranges[0];
          }
        }
      }
      if (previousFrameTop && !previousFrameTop.startStyle) {
        previousFrameTop = null;
      }
      if (previousFrameBottom && !previousFrameBottom.startStyle) {
        previousFrameBottom = null;
      }
    }
    for (let i2 = 0, len = linesVisibleRanges.length; i2 < len; i2++) {
      const curLineRange = linesVisibleRanges[i2].ranges[0];
      const curLeft = curLineRange.left;
      const curRight = curLineRange.left + curLineRange.width;
      const startStyle = {
        top: 0 /* EXTERN */,
        bottom: 0 /* EXTERN */
      };
      const endStyle = {
        top: 0 /* EXTERN */,
        bottom: 0 /* EXTERN */
      };
      if (i2 > 0) {
        const prevLeft = linesVisibleRanges[i2 - 1].ranges[0].left;
        const prevRight = linesVisibleRanges[i2 - 1].ranges[0].left + linesVisibleRanges[i2 - 1].ranges[0].width;
        if (abs(curLeft - prevLeft) < epsilon) {
          startStyle.top = 2 /* FLAT */;
        } else if (curLeft > prevLeft) {
          startStyle.top = 1 /* INTERN */;
        }
        if (abs(curRight - prevRight) < epsilon) {
          endStyle.top = 2 /* FLAT */;
        } else if (prevLeft < curRight && curRight < prevRight) {
          endStyle.top = 1 /* INTERN */;
        }
      } else if (previousFrameTop) {
        startStyle.top = previousFrameTop.startStyle.top;
        endStyle.top = previousFrameTop.endStyle.top;
      }
      if (i2 + 1 < len) {
        const nextLeft = linesVisibleRanges[i2 + 1].ranges[0].left;
        const nextRight = linesVisibleRanges[i2 + 1].ranges[0].left + linesVisibleRanges[i2 + 1].ranges[0].width;
        if (abs(curLeft - nextLeft) < epsilon) {
          startStyle.bottom = 2 /* FLAT */;
        } else if (nextLeft < curLeft && curLeft < nextRight) {
          startStyle.bottom = 1 /* INTERN */;
        }
        if (abs(curRight - nextRight) < epsilon) {
          endStyle.bottom = 2 /* FLAT */;
        } else if (curRight < nextRight) {
          endStyle.bottom = 1 /* INTERN */;
        }
      } else if (previousFrameBottom) {
        startStyle.bottom = previousFrameBottom.startStyle.bottom;
        endStyle.bottom = previousFrameBottom.endStyle.bottom;
      }
      curLineRange.startStyle = startStyle;
      curLineRange.endStyle = endStyle;
    }
  }
  _getVisibleRangesWithStyle(selection, ctx, previousFrame) {
    const _linesVisibleRanges = ctx.linesVisibleRangesForRange(selection, true) || [];
    const linesVisibleRanges = _linesVisibleRanges.map(toStyled);
    const visibleRangesHaveGaps = this._visibleRangesHaveGaps(linesVisibleRanges);
    if (!visibleRangesHaveGaps && this._roundedSelection) {
      this._enrichVisibleRangesWithStyle(ctx.visibleRange, linesVisibleRanges, previousFrame);
    }
    return linesVisibleRanges;
  }
  _createSelectionPiece(top2, bottom, className2, left, width2) {
    return '<div class="cslr ' + className2 + '" style="top:' + top2.toString() + "px;bottom:" + bottom.toString() + "px;left:" + left.toString() + "px;width:" + width2.toString() + 'px;"></div>';
  }
  _actualRenderOneSelection(output2, visibleStartLineNumber, hasMultipleSelections, visibleRanges) {
    if (visibleRanges.length === 0) {
      return;
    }
    const visibleRangesHaveStyle = !!visibleRanges[0].ranges[0].startStyle;
    const firstLineNumber = visibleRanges[0].lineNumber;
    const lastLineNumber = visibleRanges[visibleRanges.length - 1].lineNumber;
    for (let i2 = 0, len = visibleRanges.length; i2 < len; i2++) {
      const lineVisibleRanges = visibleRanges[i2];
      const lineNumber = lineVisibleRanges.lineNumber;
      const lineIndex = lineNumber - visibleStartLineNumber;
      const top2 = hasMultipleSelections ? lineNumber === firstLineNumber ? 1 : 0 : 0;
      const bottom = hasMultipleSelections ? lineNumber !== firstLineNumber && lineNumber === lastLineNumber ? 1 : 0 : 0;
      let innerCornerOutput = "";
      let restOfSelectionOutput = "";
      for (let j = 0, lenJ = lineVisibleRanges.ranges.length; j < lenJ; j++) {
        const visibleRange = lineVisibleRanges.ranges[j];
        if (visibleRangesHaveStyle) {
          const startStyle = visibleRange.startStyle;
          const endStyle = visibleRange.endStyle;
          if (startStyle.top === 1 /* INTERN */ || startStyle.bottom === 1 /* INTERN */) {
            innerCornerOutput += this._createSelectionPiece(top2, bottom, _SelectionsOverlay.SELECTION_CLASS_NAME, visibleRange.left - _SelectionsOverlay.ROUNDED_PIECE_WIDTH, _SelectionsOverlay.ROUNDED_PIECE_WIDTH);
            let className3 = _SelectionsOverlay.EDITOR_BACKGROUND_CLASS_NAME;
            if (startStyle.top === 1 /* INTERN */) {
              className3 += " " + _SelectionsOverlay.SELECTION_TOP_RIGHT;
            }
            if (startStyle.bottom === 1 /* INTERN */) {
              className3 += " " + _SelectionsOverlay.SELECTION_BOTTOM_RIGHT;
            }
            innerCornerOutput += this._createSelectionPiece(top2, bottom, className3, visibleRange.left - _SelectionsOverlay.ROUNDED_PIECE_WIDTH, _SelectionsOverlay.ROUNDED_PIECE_WIDTH);
          }
          if (endStyle.top === 1 /* INTERN */ || endStyle.bottom === 1 /* INTERN */) {
            innerCornerOutput += this._createSelectionPiece(top2, bottom, _SelectionsOverlay.SELECTION_CLASS_NAME, visibleRange.left + visibleRange.width, _SelectionsOverlay.ROUNDED_PIECE_WIDTH);
            let className3 = _SelectionsOverlay.EDITOR_BACKGROUND_CLASS_NAME;
            if (endStyle.top === 1 /* INTERN */) {
              className3 += " " + _SelectionsOverlay.SELECTION_TOP_LEFT;
            }
            if (endStyle.bottom === 1 /* INTERN */) {
              className3 += " " + _SelectionsOverlay.SELECTION_BOTTOM_LEFT;
            }
            innerCornerOutput += this._createSelectionPiece(top2, bottom, className3, visibleRange.left + visibleRange.width, _SelectionsOverlay.ROUNDED_PIECE_WIDTH);
          }
        }
        let className2 = _SelectionsOverlay.SELECTION_CLASS_NAME;
        if (visibleRangesHaveStyle) {
          const startStyle = visibleRange.startStyle;
          const endStyle = visibleRange.endStyle;
          if (startStyle.top === 0 /* EXTERN */) {
            className2 += " " + _SelectionsOverlay.SELECTION_TOP_LEFT;
          }
          if (startStyle.bottom === 0 /* EXTERN */) {
            className2 += " " + _SelectionsOverlay.SELECTION_BOTTOM_LEFT;
          }
          if (endStyle.top === 0 /* EXTERN */) {
            className2 += " " + _SelectionsOverlay.SELECTION_TOP_RIGHT;
          }
          if (endStyle.bottom === 0 /* EXTERN */) {
            className2 += " " + _SelectionsOverlay.SELECTION_BOTTOM_RIGHT;
          }
        }
        restOfSelectionOutput += this._createSelectionPiece(top2, bottom, className2, visibleRange.left, visibleRange.width);
      }
      output2[lineIndex][0] += innerCornerOutput;
      output2[lineIndex][1] += restOfSelectionOutput;
    }
  }
  prepareRender(ctx) {
    const output = [];
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      output[lineIndex] = ["", ""];
    }
    const thisFrameVisibleRangesWithStyle = [];
    for (let i2 = 0, len = this._selections.length; i2 < len; i2++) {
      const selection = this._selections[i2];
      if (selection.isEmpty()) {
        thisFrameVisibleRangesWithStyle[i2] = null;
        continue;
      }
      const visibleRangesWithStyle = this._getVisibleRangesWithStyle(selection, ctx, this._previousFrameVisibleRangesWithStyle[i2]);
      thisFrameVisibleRangesWithStyle[i2] = visibleRangesWithStyle;
      this._actualRenderOneSelection(output, visibleStartLineNumber, this._selections.length > 1, visibleRangesWithStyle);
    }
    this._previousFrameVisibleRangesWithStyle = thisFrameVisibleRangesWithStyle;
    this._renderResult = output.map(([internalCorners, restOfSelection]) => internalCorners + restOfSelection);
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

registerThemingParticipant((theme, collector) => {
  const editorSelectionForegroundColor = theme.getColor(editorSelectionForeground);
  if (editorSelectionForegroundColor && !editorSelectionForegroundColor.isTransparent()) {
    collector.addRule(`.monaco-editor .view-line span.inline-selected-text { color: ${editorSelectionForegroundColor}; }`);
  }
});

function abs(n2) {
  return n2 < 0 ? -n2 : n2;
}
export { toStyledRange, toStyled, abs, HorizontalRangeWithStyle, LineVisibleRangesWithStyle, SelectionsOverlay };
