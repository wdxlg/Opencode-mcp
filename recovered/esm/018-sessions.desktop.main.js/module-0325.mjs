// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/whitespace/whitespace.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { editorWhitespaces } from "./module-0288.mjs";
import { firstNonWhitespaceIndex, lastNonWhitespaceIndex } from "./module-0030.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/browser/viewParts/whitespace/whitespace.ts
var WhitespaceOverlay = class extends DynamicViewOverlay {
  constructor(context2) {
    super();
    this._context = context2;
    this._options = new WhitespaceOptions(this._context.configuration);
    this._selection = [];
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
    const newOptions = new WhitespaceOptions(this._context.configuration);
    if (this._options.equals(newOptions)) {
      return e4.hasChanged(165 /* layoutInfo */);
    }
    this._options = newOptions;
    return true;
  }
  onCursorStateChanged(e4) {
    this._selection = e4.selections;
    if (this._options.renderWhitespace === "selection") {
      return true;
    }
    return false;
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
  prepareRender(ctx) {
    if (this._options.renderWhitespace === "none") {
      this._renderResult = null;
      return;
    }
    this._renderResult = [];
    for (let lineNumber = ctx.viewportData.startLineNumber; lineNumber <= ctx.viewportData.endLineNumber; lineNumber++) {
      const lineIndex = lineNumber - ctx.viewportData.startLineNumber;
      const lineData = this._context.viewModel.getViewLineRenderingData(lineNumber);
      let selectionsOnLine = null;
      if (this._options.renderWhitespace === "selection") {
        const selections = this._selection;
        for (const selection of selections) {
          if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
            continue;
          }
          const startColumn = selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn;
          const endColumn = selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn;
          if (startColumn < endColumn) {
            if (!selectionsOnLine) {
              selectionsOnLine = [];
            }
            selectionsOnLine.push(new OffsetRange(startColumn - 1, endColumn - 1));
          }
        }
      }
      this._renderResult[lineIndex] = this._applyRenderWhitespace(ctx, lineNumber, selectionsOnLine, lineData);
    }
  }
  _applyRenderWhitespace(ctx, lineNumber, selections, lineData) {
    if (this._options.renderWhitespace === "selection" && !selections) {
      return "";
    }
    if (this._options.renderWhitespace === "trailing" && lineData.continuesWithWrappedLine) {
      return "";
    }
    const color2 = this._context.theme.getColor(editorWhitespaces);
    const USE_SVG = this._options.renderWithSVG;
    const lineContent = lineData.content;
    const len = this._options.stopRenderingLineAfter === -1 ? lineContent.length : Math.min(this._options.stopRenderingLineAfter, lineContent.length);
    const continuesWithWrappedLine = lineData.continuesWithWrappedLine;
    const fauxIndentLength = lineData.minColumn - 1;
    const onlyBoundary = this._options.renderWhitespace === "boundary";
    const onlyTrailing = this._options.renderWhitespace === "trailing";
    const lineHeight = ctx.getLineHeightForLineNumber(lineNumber);
    const middotWidth = this._options.middotWidth;
    const wsmiddotWidth = this._options.wsmiddotWidth;
    const spaceWidth = this._options.spaceWidth;
    const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
    const middotDiff = Math.abs(middotWidth - spaceWidth);
    const renderSpaceCharCode = wsmiddotDiff < middotDiff ? 11825 : 183;
    const canUseHalfwidthRightwardsArrow = this._options.canUseHalfwidthRightwardsArrow;
    let result = "";
    let lineIsEmptyOrWhitespace = false;
    let firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineContent);
    let lastNonWhitespaceIndex2;
    if (firstNonWhitespaceIndex2 === -1) {
      lineIsEmptyOrWhitespace = true;
      firstNonWhitespaceIndex2 = len;
      lastNonWhitespaceIndex2 = len;
    } else {
      lastNonWhitespaceIndex2 = lastNonWhitespaceIndex(lineContent);
    }
    let currentSelectionIndex = 0;
    let currentSelection = selections && selections[currentSelectionIndex];
    let maxLeft = 0;
    for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
      const chCode = lineContent.charCodeAt(charIndex);
      if (currentSelection && currentSelection.endExclusive <= charIndex) {
        currentSelectionIndex++;
        currentSelection = selections && selections[currentSelectionIndex];
      }
      if (chCode !== 9 /* Tab */ && chCode !== 32 /* Space */) {
        continue;
      }
      if (onlyTrailing && !lineIsEmptyOrWhitespace && charIndex <= lastNonWhitespaceIndex2) {
        continue;
      }
      if (onlyBoundary && charIndex >= firstNonWhitespaceIndex2 && charIndex <= lastNonWhitespaceIndex2 && chCode === 32 /* Space */) {
        const prevChCode = charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : 0 /* Null */;
        const nextChCode = charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* Null */;
        if (prevChCode !== 32 /* Space */ && nextChCode !== 32 /* Space */) {
          continue;
        }
      }
      if (onlyBoundary && continuesWithWrappedLine && charIndex === len - 1) {
        const prevCharCode = charIndex - 1 >= 0 ? lineContent.charCodeAt(charIndex - 1) : 0 /* Null */;
        const isSingleTrailingSpace = chCode === 32 /* Space */ && (prevCharCode !== 32 /* Space */ && prevCharCode !== 9 /* Tab */);
        if (isSingleTrailingSpace) {
          continue;
        }
      }
      if (selections && !(currentSelection && currentSelection.start <= charIndex && charIndex < currentSelection.endExclusive)) {
        continue;
      }
      const visibleRange = ctx.visibleRangeForPosition(new Position(lineNumber, charIndex + 1));
      if (!visibleRange) {
        continue;
      }
      if (USE_SVG) {
        maxLeft = Math.max(maxLeft, visibleRange.left);
        if (chCode === 9 /* Tab */) {
          result += this._renderArrow(lineHeight, spaceWidth, visibleRange.left);
        } else {
          result += `<circle cx="${(visibleRange.left + spaceWidth / 2).toFixed(2)}" cy="${(lineHeight / 2).toFixed(2)}" r="${(spaceWidth / 7).toFixed(2)}" />`;
        }
      } else {
        if (chCode === 9 /* Tab */) {
          result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${canUseHalfwidthRightwardsArrow ? String.fromCharCode(65515) : String.fromCharCode(8594)}</div>`;
        } else {
          result += `<div class="mwh" style="left:${visibleRange.left}px;height:${lineHeight}px;">${String.fromCharCode(renderSpaceCharCode)}</div>`;
        }
      }
    }
    if (USE_SVG) {
      maxLeft = Math.round(maxLeft + spaceWidth);
      return `<svg style="bottom:0;position:absolute;width:${maxLeft}px;height:${lineHeight}px" viewBox="0 0 ${maxLeft} ${lineHeight}" xmlns="http://www.w3.org/2000/svg" fill="${color2}">` + result + `</svg>`;
    }
    return result;
  }
  _renderArrow(lineHeight, spaceWidth, left) {
    const strokeWidth = spaceWidth / 7;
    const width2 = spaceWidth;
    const dy = lineHeight / 2;
    const dx = left;
    const p1 = { x: 0, y: strokeWidth / 2 };
    const p2 = { x: 100 / 125 * width2, y: p1.y };
    const p3 = { x: p2.x - 0.2 * p2.x, y: p2.y + 0.2 * p2.x };
    const p4 = { x: p3.x + 0.1 * p2.x, y: p3.y + 0.1 * p2.x };
    const p5 = { x: p4.x + 0.35 * p2.x, y: p4.y - 0.35 * p2.x };
    const p6 = { x: p5.x, y: -p5.y };
    const p7 = { x: p4.x, y: -p4.y };
    const p8 = { x: p3.x, y: -p3.y };
    const p9 = { x: p2.x, y: -p2.y };
    const p10 = { x: p1.x, y: -p1.y };
    const p = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
    const parts = p.map((p11) => `${(dx + p11.x).toFixed(2)} ${(dy + p11.y).toFixed(2)}`).join(" L ");
    return `<path d="M ${parts}" />`;
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

var WhitespaceOptions = class {
  constructor(config) {
    const options3 = config.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    const experimentalWhitespaceRendering = options3.get(47 /* experimentalWhitespaceRendering */);
    if (experimentalWhitespaceRendering === "off") {
      this.renderWhitespace = "none";
      this.renderWithSVG = false;
    } else if (experimentalWhitespaceRendering === "svg") {
      this.renderWhitespace = options3.get(113 /* renderWhitespace */);
      this.renderWithSVG = true;
    } else {
      this.renderWhitespace = options3.get(113 /* renderWhitespace */);
      this.renderWithSVG = false;
    }
    this.spaceWidth = fontInfo.spaceWidth;
    this.middotWidth = fontInfo.middotWidth;
    this.wsmiddotWidth = fontInfo.wsmiddotWidth;
    this.canUseHalfwidthRightwardsArrow = fontInfo.canUseHalfwidthRightwardsArrow;
    this.lineHeight = options3.get(75 /* lineHeight */);
    this.stopRenderingLineAfter = options3.get(133 /* stopRenderingLineAfter */);
  }
  equals(other) {
    return this.renderWhitespace === other.renderWhitespace && this.renderWithSVG === other.renderWithSVG && this.spaceWidth === other.spaceWidth && this.middotWidth === other.middotWidth && this.wsmiddotWidth === other.wsmiddotWidth && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineHeight === other.lineHeight && this.stopRenderingLineAfter === other.stopRenderingLineAfter;
  }
};
export { WhitespaceOverlay, WhitespaceOptions };
