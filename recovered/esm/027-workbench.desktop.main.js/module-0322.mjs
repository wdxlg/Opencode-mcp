// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/viewCursors/viewCursor.ts
import { createFastDomNode } from "./module-0212.mjs";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "./module-0299.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { Position } from "./module-0079.mjs";
import { getCharContainingOffset } from "./module-0030.mjs";
import { computeScreenAwareSize, getWindow } from "./module-0075.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/browser/viewParts/viewCursors/viewCursor.ts
var ViewCursorRenderData = class {
  constructor(top2, left, paddingLeft, width2, height, textContent, textContentClassName) {
    this.top = top2;
    this.left = left;
    this.paddingLeft = paddingLeft;
    this.width = width2;
    this.height = height;
    this.textContent = textContent;
    this.textContentClassName = textContentClassName;
  }
};

var ViewCursor = class {
  constructor(context2, plurality) {
    this._context = context2;
    const options3 = this._context.configuration.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    this._cursorStyle = options3.get(161 /* effectiveCursorStyle */);
    this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this._lineCursorWidth = Math.min(options3.get(37 /* cursorWidth */), this._typicalHalfwidthCharacterWidth);
    this._lineCursorHeight = options3.get(38 /* cursorHeight */);
    this._isVisible = true;
    this._domNode = createFastDomNode(document.createElement("div"));
    this._domNode.setClassName(`cursor ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
    this._domNode.setHeight(this._context.viewLayout.getLineHeightForLineNumber(1));
    this._domNode.setTop(0);
    this._domNode.setLeft(0);
    applyFontInfo(this._domNode, fontInfo);
    this._domNode.setDisplay("none");
    this._position = new Position(1, 1);
    this._pluralityClass = "";
    this.setPlurality(plurality);
    this._lastRenderedContent = "";
    this._renderData = null;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  setPlurality(plurality) {
    switch (plurality) {
      default:
      case 0 /* Single */:
        this._pluralityClass = "";
        break;
      case 1 /* MultiPrimary */:
        this._pluralityClass = "cursor-primary";
        break;
      case 2 /* MultiSecondary */:
        this._pluralityClass = "cursor-secondary";
        break;
    }
  }
  show() {
    if (!this._isVisible) {
      this._domNode.setVisibility("inherit");
      this._isVisible = true;
    }
  }
  hide() {
    if (this._isVisible) {
      this._domNode.setVisibility("hidden");
      this._isVisible = false;
    }
  }
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    this._cursorStyle = options3.get(161 /* effectiveCursorStyle */);
    this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this._lineCursorWidth = Math.min(options3.get(37 /* cursorWidth */), this._typicalHalfwidthCharacterWidth);
    this._lineCursorHeight = options3.get(38 /* cursorHeight */);
    applyFontInfo(this._domNode, fontInfo);
    return true;
  }
  onCursorPositionChanged(position2, pauseAnimation) {
    if (pauseAnimation) {
      this._domNode.domNode.style.transitionProperty = "none";
    } else {
      this._domNode.domNode.style.transitionProperty = "";
    }
    this._position = position2;
    return true;
  }
  /**
   * If `this._position` is inside a grapheme, returns the position where the grapheme starts.
   * Also returns the next grapheme.
   */
  _getGraphemeAwarePosition() {
    const { lineNumber, column } = this._position;
    const lineContent = this._context.viewModel.getLineContent(lineNumber);
    const [startOffset, endOffset] = getCharContainingOffset(lineContent, column - 1);
    return [new Position(lineNumber, startOffset + 1), lineContent.substring(startOffset, endOffset)];
  }
  _prepareRender(ctx) {
    let textContent = "";
    let textContentClassName = "";
    const [position2, nextGrapheme] = this._getGraphemeAwarePosition();
    const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(position2.lineNumber);
    const lineCursorHeight = this._lineCursorHeight === 0 ? lineHeight : Math.min(lineHeight, this._lineCursorHeight);
    const lineHeightAdjustment = (lineHeight - lineCursorHeight) / 2;
    if (this._cursorStyle === 1 /* Line */ || this._cursorStyle === 4 /* LineThin */) {
      const visibleRange = ctx.visibleRangeForPosition(position2);
      if (!visibleRange || visibleRange.outsideRenderedLine) {
        return null;
      }
      const window2 = getWindow(this._domNode.domNode);
      let width3;
      if (this._cursorStyle === 1 /* Line */) {
        width3 = computeScreenAwareSize(window2, this._lineCursorWidth > 0 ? this._lineCursorWidth : 2);
        if (width3 > 2) {
          textContent = nextGrapheme;
          textContentClassName = this._getTokenClassName(position2);
        }
      } else {
        width3 = computeScreenAwareSize(window2, 1);
      }
      let left = visibleRange.left;
      let paddingLeft = 0;
      if (width3 >= 2 && left >= 1) {
        paddingLeft = 1;
        left -= paddingLeft;
      }
      const top3 = ctx.getVerticalOffsetForLineNumber(position2.lineNumber) - ctx.bigNumbersDelta + lineHeightAdjustment;
      return new ViewCursorRenderData(top3, left, paddingLeft, width3, lineCursorHeight, textContent, textContentClassName);
    }
    const visibleRangeForCharacter = ctx.linesVisibleRangesForRange(new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + nextGrapheme.length), false);
    if (!visibleRangeForCharacter || visibleRangeForCharacter.length === 0) {
      return null;
    }
    const firstVisibleRangeForCharacter = visibleRangeForCharacter[0];
    if (firstVisibleRangeForCharacter.outsideRenderedLine || firstVisibleRangeForCharacter.ranges.length === 0) {
      return null;
    }
    const range2 = firstVisibleRangeForCharacter.ranges[0];
    const width2 = nextGrapheme === "	" ? this._typicalHalfwidthCharacterWidth : range2.width < 1 ? this._typicalHalfwidthCharacterWidth : range2.width;
    if (this._cursorStyle === 2 /* Block */) {
      textContent = nextGrapheme;
      textContentClassName = this._getTokenClassName(position2);
    }
    let top2 = ctx.getVerticalOffsetForLineNumber(position2.lineNumber) - ctx.bigNumbersDelta;
    let height = lineHeight;
    if (this._cursorStyle === 3 /* Underline */ || this._cursorStyle === 6 /* UnderlineThin */) {
      top2 += lineHeight - 2;
      height = 2;
    }
    return new ViewCursorRenderData(top2, range2.left, 0, width2, height, textContent, textContentClassName);
  }
  _getTokenClassName(position2) {
    const lineData = this._context.viewModel.getViewLineData(position2.lineNumber);
    const tokenIndex = lineData.tokens.findTokenIndexAtOffset(position2.column - 1);
    return lineData.tokens.getClassName(tokenIndex);
  }
  prepareRender(ctx) {
    this._renderData = this._prepareRender(ctx);
  }
  render(ctx) {
    if (!this._renderData) {
      this._domNode.setDisplay("none");
      return null;
    }
    if (this._lastRenderedContent !== this._renderData.textContent) {
      this._lastRenderedContent = this._renderData.textContent;
      this._domNode.domNode.textContent = this._lastRenderedContent;
    }
    this._domNode.setClassName(`cursor ${this._pluralityClass} ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ${this._renderData.textContentClassName}`);
    this._domNode.setDisplay("block");
    this._domNode.setTop(this._renderData.top);
    this._domNode.setLeft(this._renderData.left);
    this._domNode.setPaddingLeft(this._renderData.paddingLeft);
    this._domNode.setWidth(this._renderData.width);
    this._domNode.setLineHeight(this._renderData.height);
    this._domNode.setHeight(this._renderData.height);
    return {
      domNode: this._domNode.domNode,
      position: this._position,
      contentLeft: this._renderData.left,
      height: this._renderData.height,
      width: 2
    };
  }
};
export { ViewCursorRenderData, ViewCursor };
