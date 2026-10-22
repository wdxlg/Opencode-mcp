// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/mouseTarget.ts
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { Lazy } from "./module-0028.mjs";
import { PartFingerprints } from "./module-0239.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { getShadowRoot, getWindow } from "./module-0075.mjs";
import { PageCoordinates } from "./module-0237.mjs";
import { ViewLine } from "./module-0248.mjs";
import { AtomicTabMoveOperations } from "./module-0116.mjs";


// src/vs/editor/browser/controller/mouseTarget.ts
var UnknownHitTestResult = class {
  constructor(hitTarget = null) {
    this.hitTarget = hitTarget;
    this.type = 0 /* Unknown */;
  }
};

var ContentHitTestResult = class {
  constructor(position2, spanNode, injectedText) {
    this.position = position2;
    this.spanNode = spanNode;
    this.injectedText = injectedText;
    this.type = 1 /* Content */;
  }
  get hitTarget() {
    return this.spanNode;
  }
};

var HitTestResult;

((HitTestResult2) => {
  function createFromDOMInfo(ctx, spanNode, offset) {
    const position2 = ctx.getPositionFromDOMInfo(spanNode, offset);
    if (position2) {
      return new ContentHitTestResult(position2, spanNode, null);
    }
    return new UnknownHitTestResult(spanNode);
  }
  HitTestResult2.createFromDOMInfo = createFromDOMInfo;
})(HitTestResult || (HitTestResult = {}));

var PointerHandlerLastRenderData = class {
  constructor(lastViewCursorsRenderData, lastTextareaPosition) {
    this.lastViewCursorsRenderData = lastViewCursorsRenderData;
    this.lastTextareaPosition = lastTextareaPosition;
  }
};

var MouseTarget = class {
  static _deduceRage(position2, range2 = null) {
    if (!range2 && position2) {
      return new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column);
    }
    return range2 ?? null;
  }
  static createUnknown(element, mouseColumn, position2) {
    return { type: 0 /* UNKNOWN */, element, mouseColumn, position: position2, range: this._deduceRage(position2) };
  }
  static createTextarea(element, mouseColumn) {
    return { type: 1 /* TEXTAREA */, element, mouseColumn, position: null, range: null };
  }
  static createMargin(type, element, mouseColumn, position2, range2, detail2) {
    return { type, element, mouseColumn, position: position2, range: range2, detail: detail2 };
  }
  static createViewZone(type, element, mouseColumn, position2, detail2) {
    return { type, element, mouseColumn, position: position2, range: this._deduceRage(position2), detail: detail2 };
  }
  static createContentText(element, mouseColumn, position2, range2, detail2) {
    return { type: 6 /* CONTENT_TEXT */, element, mouseColumn, position: position2, range: this._deduceRage(position2, range2), detail: detail2 };
  }
  static createContentEmpty(element, mouseColumn, position2, detail2) {
    return { type: 7 /* CONTENT_EMPTY */, element, mouseColumn, position: position2, range: this._deduceRage(position2), detail: detail2 };
  }
  static createContentWidget(element, mouseColumn, detail2) {
    return { type: 9 /* CONTENT_WIDGET */, element, mouseColumn, position: null, range: null, detail: detail2 };
  }
  static createScrollbar(element, mouseColumn, position2) {
    return { type: 11 /* SCROLLBAR */, element, mouseColumn, position: position2, range: this._deduceRage(position2) };
  }
  static createOverlayWidget(element, mouseColumn, detail2) {
    return { type: 12 /* OVERLAY_WIDGET */, element, mouseColumn, position: null, range: null, detail: detail2 };
  }
  static createOutsideEditor(mouseColumn, position2, outsidePosition, outsideDistance) {
    return { type: 13 /* OUTSIDE_EDITOR */, element: null, mouseColumn, position: position2, range: this._deduceRage(position2), outsidePosition, outsideDistance };
  }
  static _typeToString(type) {
    if (type === 1 /* TEXTAREA */) {
      return "TEXTAREA";
    }
    if (type === 2 /* GUTTER_GLYPH_MARGIN */) {
      return "GUTTER_GLYPH_MARGIN";
    }
    if (type === 3 /* GUTTER_LINE_NUMBERS */) {
      return "GUTTER_LINE_NUMBERS";
    }
    if (type === 4 /* GUTTER_LINE_DECORATIONS */) {
      return "GUTTER_LINE_DECORATIONS";
    }
    if (type === 5 /* GUTTER_VIEW_ZONE */) {
      return "GUTTER_VIEW_ZONE";
    }
    if (type === 6 /* CONTENT_TEXT */) {
      return "CONTENT_TEXT";
    }
    if (type === 7 /* CONTENT_EMPTY */) {
      return "CONTENT_EMPTY";
    }
    if (type === 8 /* CONTENT_VIEW_ZONE */) {
      return "CONTENT_VIEW_ZONE";
    }
    if (type === 9 /* CONTENT_WIDGET */) {
      return "CONTENT_WIDGET";
    }
    if (type === 10 /* OVERVIEW_RULER */) {
      return "OVERVIEW_RULER";
    }
    if (type === 11 /* SCROLLBAR */) {
      return "SCROLLBAR";
    }
    if (type === 12 /* OVERLAY_WIDGET */) {
      return "OVERLAY_WIDGET";
    }
    return "UNKNOWN";
  }
  static toString(target) {
    return this._typeToString(target.type) + ": " + target.position + " - " + target.range + " - " + JSON.stringify(target.detail);
  }
};

var ElementPath = class {
  static isTextArea(path) {
    return path.length === 2 && path[0] === 3 /* OverflowGuard */ && path[1] === 7 /* TextArea */;
  }
  static isChildOfViewLines(path) {
    return path.length >= 4 && path[0] === 3 /* OverflowGuard */ && path[3] === 8 /* ViewLines */;
  }
  static isStrictChildOfViewLines(path) {
    return path.length > 4 && path[0] === 3 /* OverflowGuard */ && path[3] === 8 /* ViewLines */;
  }
  static isChildOfScrollableElement(path) {
    return path.length >= 2 && path[0] === 3 /* OverflowGuard */ && path[1] === 6 /* ScrollableElement */;
  }
  static isChildOfMinimap(path) {
    return path.length >= 2 && path[0] === 3 /* OverflowGuard */ && path[1] === 9 /* Minimap */;
  }
  static isChildOfContentWidgets(path) {
    return path.length >= 4 && path[0] === 3 /* OverflowGuard */ && path[3] === 1 /* ContentWidgets */;
  }
  static isChildOfOverflowGuard(path) {
    return path.length >= 1 && path[0] === 3 /* OverflowGuard */;
  }
  static isChildOfOverflowingContentWidgets(path) {
    return path.length >= 1 && path[0] === 2 /* OverflowingContentWidgets */;
  }
  static isChildOfOverlayWidgets(path) {
    return path.length >= 2 && path[0] === 3 /* OverflowGuard */ && path[1] === 4 /* OverlayWidgets */;
  }
  static isChildOfOverflowingOverlayWidgets(path) {
    return path.length >= 1 && path[0] === 5 /* OverflowingOverlayWidgets */;
  }
};

var HitTestContext = class _HitTestContext {
  constructor(context2, viewHelper, lastRenderData) {
    this.viewModel = context2.viewModel;
    const options3 = context2.configuration.options;
    this.layoutInfo = options3.get(165 /* layoutInfo */);
    this.viewDomNode = viewHelper.viewDomNode;
    this.viewLinesGpu = viewHelper.viewLinesGpu;
    this.lineHeight = options3.get(75 /* lineHeight */);
    this.stickyTabStops = options3.get(132 /* stickyTabStops */);
    this.typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    this.lastRenderData = lastRenderData;
    this._context = context2;
    this._viewHelper = viewHelper;
  }
  getZoneAtCoord(mouseVerticalOffset) {
    return _HitTestContext.getZoneAtCoord(this._context, mouseVerticalOffset);
  }
  static getZoneAtCoord(context2, mouseVerticalOffset) {
    const viewZoneWhitespace = context2.viewLayout.getWhitespaceAtVerticalOffset(mouseVerticalOffset);
    if (viewZoneWhitespace) {
      const viewZoneMiddle = viewZoneWhitespace.verticalOffset + viewZoneWhitespace.height / 2;
      const lineCount = context2.viewModel.getLineCount();
      let positionBefore = null;
      let position2;
      let positionAfter = null;
      if (viewZoneWhitespace.afterLineNumber !== lineCount) {
        positionAfter = new Position(viewZoneWhitespace.afterLineNumber + 1, 1);
      }
      if (viewZoneWhitespace.afterLineNumber > 0) {
        positionBefore = new Position(viewZoneWhitespace.afterLineNumber, context2.viewModel.getLineMaxColumn(viewZoneWhitespace.afterLineNumber));
      }
      if (positionAfter === null) {
        position2 = positionBefore;
      } else if (positionBefore === null) {
        position2 = positionAfter;
      } else if (mouseVerticalOffset < viewZoneMiddle) {
        position2 = positionBefore;
      } else {
        position2 = positionAfter;
      }
      return {
        viewZoneId: viewZoneWhitespace.id,
        afterLineNumber: viewZoneWhitespace.afterLineNumber,
        positionBefore,
        positionAfter,
        position: position2
      };
    }
    return null;
  }
  getFullLineRangeAtCoord(mouseVerticalOffset) {
    if (this._context.viewLayout.isAfterLines(mouseVerticalOffset)) {
      const lineNumber2 = this._context.viewModel.getLineCount();
      const maxLineColumn2 = this._context.viewModel.getLineMaxColumn(lineNumber2);
      return {
        range: new Range2(lineNumber2, maxLineColumn2, lineNumber2, maxLineColumn2),
        isAfterLines: true
      };
    }
    const lineNumber = this._context.viewLayout.getLineNumberAtVerticalOffset(mouseVerticalOffset);
    const maxLineColumn = this._context.viewModel.getLineMaxColumn(lineNumber);
    return {
      range: new Range2(lineNumber, 1, lineNumber, maxLineColumn),
      isAfterLines: false
    };
  }
  getLineNumberAtVerticalOffset(mouseVerticalOffset) {
    return this._context.viewLayout.getLineNumberAtVerticalOffset(mouseVerticalOffset);
  }
  isAfterLines(mouseVerticalOffset) {
    return this._context.viewLayout.isAfterLines(mouseVerticalOffset);
  }
  isInTopPadding(mouseVerticalOffset) {
    return this._context.viewLayout.isInTopPadding(mouseVerticalOffset);
  }
  isInBottomPadding(mouseVerticalOffset) {
    return this._context.viewLayout.isInBottomPadding(mouseVerticalOffset);
  }
  getVerticalOffsetForLineNumber(lineNumber) {
    return this._context.viewLayout.getVerticalOffsetForLineNumber(lineNumber);
  }
  findAttribute(element, attr) {
    return _HitTestContext._findAttribute(element, attr, this._viewHelper.viewDomNode);
  }
  static _findAttribute(element, attr, stopAt) {
    while (element && element !== element.ownerDocument.body) {
      if (element.hasAttribute && element.hasAttribute(attr)) {
        return element.getAttribute(attr);
      }
      if (element === stopAt) {
        return null;
      }
      element = element.parentNode;
    }
    return null;
  }
  getLineWidth(lineNumber) {
    return this._viewHelper.getLineWidth(lineNumber);
  }
  isRtl(lineNumber) {
    return this.viewModel.getTextDirection(lineNumber) === 1 /* RTL */;
  }
  visibleRangeForPosition(lineNumber, column) {
    return this._viewHelper.visibleRangeForPosition(lineNumber, column);
  }
  getPositionFromDOMInfo(spanNode, offset) {
    return this._viewHelper.getPositionFromDOMInfo(spanNode, offset);
  }
  getCurrentScrollTop() {
    return this._context.viewLayout.getCurrentScrollTop();
  }
  getCurrentScrollLeft() {
    return this._context.viewLayout.getCurrentScrollLeft();
  }
};

var BareHitTestRequest = class {
  constructor(ctx, editorPos, pos, relativePos) {
    this.editorPos = editorPos;
    this.pos = pos;
    this.relativePos = relativePos;
    this.mouseVerticalOffset = Math.max(0, ctx.getCurrentScrollTop() + this.relativePos.y);
    this.mouseContentHorizontalOffset = ctx.getCurrentScrollLeft() + this.relativePos.x - ctx.layoutInfo.contentLeft;
    this.isInMarginArea = this.relativePos.x < ctx.layoutInfo.contentLeft && this.relativePos.x >= ctx.layoutInfo.glyphMarginLeft;
    this.isInContentArea = !this.isInMarginArea;
    this.mouseColumn = Math.max(0, MouseTargetFactory._getMouseColumn(this.mouseContentHorizontalOffset, ctx.typicalHalfwidthCharacterWidth));
  }
};

var HitTestRequest = class extends BareHitTestRequest {
  constructor(ctx, editorPos, pos, relativePos, eventTarget) {
    super(ctx, editorPos, pos, relativePos);
    this.hitTestResult = new Lazy(() => MouseTargetFactory.doHitTest(this._ctx, this));
    this._targetPathCacheElement = null;
    this._targetPathCacheValue = new Uint8Array(0);
    this._ctx = ctx;
    this._eventTarget = eventTarget;
    const hasEventTarget = Boolean(this._eventTarget);
    this._useHitTestTarget = !hasEventTarget;
  }
  get target() {
    if (this._useHitTestTarget) {
      return this.hitTestResult.value.hitTarget;
    }
    return this._eventTarget;
  }
  get targetPath() {
    if (this._targetPathCacheElement !== this.target) {
      this._targetPathCacheElement = this.target;
      this._targetPathCacheValue = PartFingerprints.collect(this.target, this._ctx.viewDomNode);
    }
    return this._targetPathCacheValue;
  }
  toString() {
    return `pos(${this.pos.x},${this.pos.y}), editorPos(${this.editorPos.x},${this.editorPos.y}), relativePos(${this.relativePos.x},${this.relativePos.y}), mouseVerticalOffset: ${this.mouseVerticalOffset}, mouseContentHorizontalOffset: ${this.mouseContentHorizontalOffset}
	target: ${this.target ? this.target.outerHTML : null}`;
  }
  get wouldBenefitFromHitTestTargetSwitch() {
    return !this._useHitTestTarget && this.hitTestResult.value.hitTarget !== null && this.target !== this.hitTestResult.value.hitTarget;
  }
  switchToHitTestTarget() {
    this._useHitTestTarget = true;
  }
  _getMouseColumn(position2 = null) {
    if (position2 && position2.column < this._ctx.viewModel.getLineMaxColumn(position2.lineNumber)) {
      return CursorColumns.visibleColumnFromColumn(this._ctx.viewModel.getLineContent(position2.lineNumber), position2.column, this._ctx.viewModel.model.getOptions().tabSize) + 1;
    }
    return this.mouseColumn;
  }
  fulfillUnknown(position2 = null) {
    return MouseTarget.createUnknown(this.target, this._getMouseColumn(position2), position2);
  }
  fulfillTextarea() {
    return MouseTarget.createTextarea(this.target, this._getMouseColumn());
  }
  fulfillMargin(type, position2, range2, detail2) {
    return MouseTarget.createMargin(type, this.target, this._getMouseColumn(position2), position2, range2, detail2);
  }
  fulfillViewZone(type, position2, detail2) {
    return MouseTarget.createViewZone(type, this.target, this._getMouseColumn(), position2, detail2);
  }
  fulfillContentText(position2, range2, detail2) {
    return MouseTarget.createContentText(this.target, this._getMouseColumn(position2), position2, range2, detail2);
  }
  fulfillContentEmpty(position2, detail2) {
    return MouseTarget.createContentEmpty(this.target, this._getMouseColumn(position2), position2, detail2);
  }
  fulfillContentWidget(detail2) {
    return MouseTarget.createContentWidget(this.target, this._getMouseColumn(), detail2);
  }
  fulfillScrollbar(position2) {
    return MouseTarget.createScrollbar(this.target, this._getMouseColumn(position2), position2);
  }
  fulfillOverlayWidget(detail2) {
    return MouseTarget.createOverlayWidget(this.target, this._getMouseColumn(), detail2);
  }
};

var EMPTY_CONTENT_AFTER_LINES = { isAfterLines: true };

function createEmptyContentDataInLines(horizontalDistanceToText) {
  return {
    isAfterLines: false,
    horizontalDistanceToText
  };
}

var MouseTargetFactory = class _MouseTargetFactory {
  constructor(context2, viewHelper) {
    this._context = context2;
    this._viewHelper = viewHelper;
  }
  mouseTargetIsWidget(e) {
    const t2 = e.target;
    const path = PartFingerprints.collect(t2, this._viewHelper.viewDomNode);
    if (ElementPath.isChildOfContentWidgets(path) || ElementPath.isChildOfOverflowingContentWidgets(path)) {
      return true;
    }
    if (ElementPath.isChildOfOverlayWidgets(path) || ElementPath.isChildOfOverflowingOverlayWidgets(path)) {
      return true;
    }
    return false;
  }
  createMouseTarget(lastRenderData, editorPos, pos, relativePos, target) {
    const ctx = new HitTestContext(this._context, this._viewHelper, lastRenderData);
    const request2 = new HitTestRequest(ctx, editorPos, pos, relativePos, target);
    try {
      const r2 = _MouseTargetFactory._createMouseTarget(ctx, request2);
      if (r2.type === 6 /* CONTENT_TEXT */) {
        if (ctx.stickyTabStops && r2.position !== null) {
          const position2 = _MouseTargetFactory._snapToSoftTabBoundary(r2.position, ctx.viewModel);
          const range2 = Range2.fromPositions(position2, position2).plusRange(r2.range);
          return request2.fulfillContentText(position2, range2, r2.detail);
        }
      }
      return r2;
    } catch (err) {
      return request2.fulfillUnknown();
    }
  }
  static _createMouseTarget(ctx, request2) {
    if (request2.target === null) {
      return request2.fulfillUnknown();
    }
    const resolvedRequest = request2;
    let result = null;
    if (!ElementPath.isChildOfOverflowGuard(request2.targetPath) && !ElementPath.isChildOfOverflowingContentWidgets(request2.targetPath) && !ElementPath.isChildOfOverflowingOverlayWidgets(request2.targetPath)) {
      result = result || request2.fulfillUnknown();
    }
    result = result || _MouseTargetFactory._hitTestContentWidget(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestOverlayWidget(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestMinimap(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestScrollbarSlider(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestViewZone(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestMargin(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestViewCursor(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestTextArea(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestViewLines(ctx, resolvedRequest);
    result = result || _MouseTargetFactory._hitTestScrollbar(ctx, resolvedRequest);
    return result || request2.fulfillUnknown();
  }
  static _hitTestContentWidget(ctx, request2) {
    if (ElementPath.isChildOfContentWidgets(request2.targetPath) || ElementPath.isChildOfOverflowingContentWidgets(request2.targetPath)) {
      const widgetId = ctx.findAttribute(request2.target, "widgetId");
      if (widgetId) {
        return request2.fulfillContentWidget(widgetId);
      } else {
        return request2.fulfillUnknown();
      }
    }
    return null;
  }
  static _hitTestOverlayWidget(ctx, request2) {
    if (ElementPath.isChildOfOverlayWidgets(request2.targetPath) || ElementPath.isChildOfOverflowingOverlayWidgets(request2.targetPath)) {
      const widgetId = ctx.findAttribute(request2.target, "widgetId");
      if (widgetId) {
        return request2.fulfillOverlayWidget(widgetId);
      } else {
        return request2.fulfillUnknown();
      }
    }
    return null;
  }
  static _hitTestViewCursor(ctx, request2) {
    if (request2.target) {
      const lastViewCursorsRenderData = ctx.lastRenderData.lastViewCursorsRenderData;
      for (const d of lastViewCursorsRenderData) {
        if (request2.target === d.domNode) {
          return request2.fulfillContentText(d.position, null, { mightBeForeignElement: false, injectedText: null });
        }
      }
    }
    if (request2.isInContentArea) {
      const lastViewCursorsRenderData = ctx.lastRenderData.lastViewCursorsRenderData;
      const mouseContentHorizontalOffset = request2.mouseContentHorizontalOffset;
      const mouseVerticalOffset = request2.mouseVerticalOffset;
      for (const d of lastViewCursorsRenderData) {
        if (mouseContentHorizontalOffset < d.contentLeft) {
          continue;
        }
        if (mouseContentHorizontalOffset > d.contentLeft + d.width) {
          continue;
        }
        const cursorVerticalOffset = ctx.getVerticalOffsetForLineNumber(d.position.lineNumber);
        if (cursorVerticalOffset <= mouseVerticalOffset && mouseVerticalOffset <= cursorVerticalOffset + d.height) {
          return request2.fulfillContentText(d.position, null, { mightBeForeignElement: false, injectedText: null });
        }
      }
    }
    return null;
  }
  static _hitTestViewZone(ctx, request2) {
    const viewZoneData = ctx.getZoneAtCoord(request2.mouseVerticalOffset);
    if (viewZoneData) {
      const mouseTargetType = request2.isInContentArea ? 8 /* CONTENT_VIEW_ZONE */ : 5 /* GUTTER_VIEW_ZONE */;
      return request2.fulfillViewZone(mouseTargetType, viewZoneData.position, viewZoneData);
    }
    return null;
  }
  static _hitTestTextArea(ctx, request2) {
    if (ElementPath.isTextArea(request2.targetPath)) {
      if (ctx.lastRenderData.lastTextareaPosition) {
        return request2.fulfillContentText(ctx.lastRenderData.lastTextareaPosition, null, { mightBeForeignElement: false, injectedText: null });
      }
      return request2.fulfillTextarea();
    }
    return null;
  }
  static _hitTestMargin(ctx, request2) {
    if (request2.isInMarginArea) {
      const res = ctx.getFullLineRangeAtCoord(request2.mouseVerticalOffset);
      const pos = res.range.getStartPosition();
      let offset = Math.abs(request2.relativePos.x);
      const detail2 = {
        isAfterLines: res.isAfterLines,
        glyphMarginLeft: ctx.layoutInfo.glyphMarginLeft,
        glyphMarginWidth: ctx.layoutInfo.glyphMarginWidth,
        lineNumbersWidth: ctx.layoutInfo.lineNumbersWidth,
        offsetX: offset
      };
      offset -= ctx.layoutInfo.glyphMarginLeft;
      if (offset <= ctx.layoutInfo.glyphMarginWidth) {
        const modelCoordinate = ctx.viewModel.coordinatesConverter.convertViewPositionToModelPosition(res.range.getStartPosition());
        const lanes = ctx.viewModel.glyphLanes.getLanesAtLine(modelCoordinate.lineNumber);
        detail2.glyphMarginLane = lanes[Math.floor(offset / ctx.lineHeight)];
        return request2.fulfillMargin(2 /* GUTTER_GLYPH_MARGIN */, pos, res.range, detail2);
      }
      offset -= ctx.layoutInfo.glyphMarginWidth;
      if (offset <= ctx.layoutInfo.lineNumbersWidth) {
        return request2.fulfillMargin(3 /* GUTTER_LINE_NUMBERS */, pos, res.range, detail2);
      }
      offset -= ctx.layoutInfo.lineNumbersWidth;
      return request2.fulfillMargin(4 /* GUTTER_LINE_DECORATIONS */, pos, res.range, detail2);
    }
    return null;
  }
  static _hitTestViewLines(ctx, request2) {
    if (!ElementPath.isChildOfViewLines(request2.targetPath)) {
      return null;
    }
    if (ctx.isInTopPadding(request2.mouseVerticalOffset)) {
      return request2.fulfillContentEmpty(new Position(1, 1), EMPTY_CONTENT_AFTER_LINES);
    }
    if (ctx.isAfterLines(request2.mouseVerticalOffset) || ctx.isInBottomPadding(request2.mouseVerticalOffset)) {
      const lineCount = ctx.viewModel.getLineCount();
      const maxLineColumn = ctx.viewModel.getLineMaxColumn(lineCount);
      return request2.fulfillContentEmpty(new Position(lineCount, maxLineColumn), EMPTY_CONTENT_AFTER_LINES);
    }
    if (ElementPath.isStrictChildOfViewLines(request2.targetPath)) {
      const lineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
      const lineLength = ctx.viewModel.getLineLength(lineNumber);
      const lineWidth = ctx.getLineWidth(lineNumber);
      if (lineLength === 0) {
        const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
        return request2.fulfillContentEmpty(new Position(lineNumber, 1), detail2);
      }
      const isRtl = ctx.isRtl(lineNumber);
      if (isRtl) {
        if (request2.mouseContentHorizontalOffset + lineWidth <= ctx.layoutInfo.contentWidth - ctx.layoutInfo.verticalScrollbarWidth) {
          const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
          const pos = new Position(lineNumber, ctx.viewModel.getLineMaxColumn(lineNumber));
          return request2.fulfillContentEmpty(pos, detail2);
        }
      } else if (request2.mouseContentHorizontalOffset >= lineWidth) {
        const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
        const pos = new Position(lineNumber, ctx.viewModel.getLineMaxColumn(lineNumber));
        return request2.fulfillContentEmpty(pos, detail2);
      }
    } else {
      if (ctx.viewLinesGpu) {
        const lineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
        if (ctx.viewModel.getLineLength(lineNumber) === 0) {
          const lineWidth2 = ctx.getLineWidth(lineNumber);
          const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth2);
          return request2.fulfillContentEmpty(new Position(lineNumber, 1), detail2);
        }
        const lineWidth = ctx.getLineWidth(lineNumber);
        const isRtl = ctx.isRtl(lineNumber);
        if (isRtl) {
          if (request2.mouseContentHorizontalOffset + lineWidth <= ctx.layoutInfo.contentWidth - ctx.layoutInfo.verticalScrollbarWidth) {
            const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
            const pos = new Position(lineNumber, ctx.viewModel.getLineMaxColumn(lineNumber));
            return request2.fulfillContentEmpty(pos, detail2);
          }
        } else if (request2.mouseContentHorizontalOffset >= lineWidth) {
          const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
          const pos = new Position(lineNumber, ctx.viewModel.getLineMaxColumn(lineNumber));
          return request2.fulfillContentEmpty(pos, detail2);
        }
        const position2 = ctx.viewLinesGpu.getPositionAtCoordinate(lineNumber, request2.mouseContentHorizontalOffset);
        if (position2) {
          const detail2 = {
            injectedText: null,
            mightBeForeignElement: false
          };
          return request2.fulfillContentText(position2, Range2.fromPositions(position2, position2), detail2);
        }
      }
    }
    const hitTestResult = request2.hitTestResult.value;
    if (hitTestResult.type === 1 /* Content */) {
      return _MouseTargetFactory.createMouseTargetFromHitTestPosition(ctx, request2, hitTestResult.spanNode, hitTestResult.position, hitTestResult.injectedText);
    }
    if (request2.wouldBenefitFromHitTestTargetSwitch) {
      request2.switchToHitTestTarget();
      return this._createMouseTarget(ctx, request2);
    }
    return request2.fulfillUnknown();
  }
  static _hitTestMinimap(ctx, request2) {
    if (ElementPath.isChildOfMinimap(request2.targetPath)) {
      const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
      const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
      return request2.fulfillScrollbar(new Position(possibleLineNumber, maxColumn));
    }
    return null;
  }
  static _hitTestScrollbarSlider(ctx, request2) {
    if (ElementPath.isChildOfScrollableElement(request2.targetPath)) {
      if (request2.target && request2.target.nodeType === 1) {
        const className2 = request2.target.className;
        if (className2 && /\b(slider|scrollbar)\b/.test(className2)) {
          const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
          const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
          return request2.fulfillScrollbar(new Position(possibleLineNumber, maxColumn));
        }
      }
    }
    return null;
  }
  static _hitTestScrollbar(ctx, request2) {
    if (ElementPath.isChildOfScrollableElement(request2.targetPath)) {
      const possibleLineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
      const maxColumn = ctx.viewModel.getLineMaxColumn(possibleLineNumber);
      return request2.fulfillScrollbar(new Position(possibleLineNumber, maxColumn));
    }
    return null;
  }
  getMouseColumn(relativePos) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const mouseContentHorizontalOffset = this._context.viewLayout.getCurrentScrollLeft() + relativePos.x - layoutInfo.contentLeft;
    return _MouseTargetFactory._getMouseColumn(mouseContentHorizontalOffset, options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth);
  }
  static _getMouseColumn(mouseContentHorizontalOffset, typicalHalfwidthCharacterWidth) {
    if (mouseContentHorizontalOffset < 0) {
      return 1;
    }
    const chars = Math.round(mouseContentHorizontalOffset / typicalHalfwidthCharacterWidth);
    return chars + 1;
  }
  static createMouseTargetFromHitTestPosition(ctx, request2, spanNode, pos, injectedText) {
    const lineNumber = pos.lineNumber;
    const column = pos.column;
    const lineWidth = ctx.getLineWidth(lineNumber);
    if (request2.mouseContentHorizontalOffset > lineWidth) {
      const detail2 = createEmptyContentDataInLines(request2.mouseContentHorizontalOffset - lineWidth);
      return request2.fulfillContentEmpty(pos, detail2);
    }
    const visibleRange = ctx.visibleRangeForPosition(lineNumber, column);
    if (!visibleRange) {
      return request2.fulfillUnknown(pos);
    }
    const columnHorizontalOffset = visibleRange.left;
    if (Math.abs(request2.mouseContentHorizontalOffset - columnHorizontalOffset) < 1) {
      return request2.fulfillContentText(pos, null, { mightBeForeignElement: !!injectedText, injectedText });
    }
    const points = [];
    points.push({ offset: visibleRange.left, column });
    if (column > 1) {
      const visibleRange2 = ctx.visibleRangeForPosition(lineNumber, column - 1);
      if (visibleRange2) {
        points.push({ offset: visibleRange2.left, column: column - 1 });
      }
    }
    const lineMaxColumn = ctx.viewModel.getLineMaxColumn(lineNumber);
    if (column < lineMaxColumn) {
      const visibleRange2 = ctx.visibleRangeForPosition(lineNumber, column + 1);
      if (visibleRange2) {
        points.push({ offset: visibleRange2.left, column: column + 1 });
      }
    }
    points.sort((a, b) => a.offset - b.offset);
    const mouseCoordinates = request2.pos.toClientCoordinates(getWindow(ctx.viewDomNode));
    const spanNodeClientRect = spanNode.getBoundingClientRect();
    const mouseIsOverSpanNode = spanNodeClientRect.left <= mouseCoordinates.clientX && mouseCoordinates.clientX <= spanNodeClientRect.right;
    let rng = null;
    for (let i2 = 1; i2 < points.length; i2++) {
      const prev = points[i2 - 1];
      const curr = points[i2];
      if (prev.offset <= request2.mouseContentHorizontalOffset && request2.mouseContentHorizontalOffset <= curr.offset) {
        rng = new Range2(lineNumber, prev.column, lineNumber, curr.column);
        const prevDelta = Math.abs(prev.offset - request2.mouseContentHorizontalOffset);
        const nextDelta = Math.abs(curr.offset - request2.mouseContentHorizontalOffset);
        pos = prevDelta < nextDelta ? new Position(lineNumber, prev.column) : new Position(lineNumber, curr.column);
        break;
      }
    }
    return request2.fulfillContentText(pos, rng, { mightBeForeignElement: !mouseIsOverSpanNode || !!injectedText, injectedText });
  }
  /**
   * Most probably WebKit browsers and Edge
   */
  static _doHitTestWithCaretRangeFromPoint(ctx, request2) {
    const lineNumber = ctx.getLineNumberAtVerticalOffset(request2.mouseVerticalOffset);
    const lineStartVerticalOffset = ctx.getVerticalOffsetForLineNumber(lineNumber);
    const lineEndVerticalOffset = lineStartVerticalOffset + ctx.lineHeight;
    const isBelowLastLine = lineNumber === ctx.viewModel.getLineCount() && request2.mouseVerticalOffset > lineEndVerticalOffset;
    if (!isBelowLastLine) {
      const lineCenteredVerticalOffset = Math.floor((lineStartVerticalOffset + lineEndVerticalOffset) / 2);
      let adjustedPageY = request2.pos.y + (lineCenteredVerticalOffset - request2.mouseVerticalOffset);
      if (adjustedPageY <= request2.editorPos.y) {
        adjustedPageY = request2.editorPos.y + 1;
      }
      if (adjustedPageY >= request2.editorPos.y + request2.editorPos.height) {
        adjustedPageY = request2.editorPos.y + request2.editorPos.height - 1;
      }
      const adjustedPage = new PageCoordinates(request2.pos.x, adjustedPageY);
      const r2 = this._actualDoHitTestWithCaretRangeFromPoint(ctx, adjustedPage.toClientCoordinates(getWindow(ctx.viewDomNode)));
      if (r2.type === 1 /* Content */) {
        return r2;
      }
    }
    return this._actualDoHitTestWithCaretRangeFromPoint(ctx, request2.pos.toClientCoordinates(getWindow(ctx.viewDomNode)));
  }
  static _actualDoHitTestWithCaretRangeFromPoint(ctx, coords) {
    const shadowRoot = getShadowRoot(ctx.viewDomNode);
    let range2;
    if (shadowRoot) {
      if (typeof shadowRoot.caretRangeFromPoint === "undefined") {
        range2 = shadowCaretRangeFromPoint(shadowRoot, coords.clientX, coords.clientY);
      } else {
        range2 = shadowRoot.caretRangeFromPoint(coords.clientX, coords.clientY);
      }
    } else {
      range2 = ctx.viewDomNode.ownerDocument.caretRangeFromPoint(coords.clientX, coords.clientY);
    }
    if (!range2 || !range2.startContainer) {
      return new UnknownHitTestResult();
    }
    const startContainer = range2.startContainer;
    if (startContainer.nodeType === startContainer.TEXT_NODE) {
      const parent1 = startContainer.parentNode;
      const parent2 = parent1 ? parent1.parentNode : null;
      const parent3 = parent2 ? parent2.parentNode : null;
      const parent3ClassName = parent3 && parent3.nodeType === parent3.ELEMENT_NODE ? parent3.className : null;
      if (parent3ClassName === ViewLine.CLASS_NAME) {
        return HitTestResult.createFromDOMInfo(ctx, parent1, range2.startOffset);
      } else {
        return new UnknownHitTestResult(startContainer.parentNode);
      }
    } else if (startContainer.nodeType === startContainer.ELEMENT_NODE) {
      const parent1 = startContainer.parentNode;
      const parent2 = parent1 ? parent1.parentNode : null;
      const parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : null;
      if (parent2ClassName === ViewLine.CLASS_NAME) {
        return HitTestResult.createFromDOMInfo(ctx, startContainer, startContainer.textContent.length);
      } else {
        return new UnknownHitTestResult(startContainer);
      }
    }
    return new UnknownHitTestResult();
  }
  /**
   * Most probably Gecko
   */
  static _doHitTestWithCaretPositionFromPoint(ctx, coords) {
    const hitResult = ctx.viewDomNode.ownerDocument.caretPositionFromPoint(coords.clientX, coords.clientY);
    if (hitResult.offsetNode.nodeType === hitResult.offsetNode.TEXT_NODE) {
      const parent1 = hitResult.offsetNode.parentNode;
      const parent2 = parent1 ? parent1.parentNode : null;
      const parent3 = parent2 ? parent2.parentNode : null;
      const parent3ClassName = parent3 && parent3.nodeType === parent3.ELEMENT_NODE ? parent3.className : null;
      if (parent3ClassName === ViewLine.CLASS_NAME) {
        return HitTestResult.createFromDOMInfo(ctx, hitResult.offsetNode.parentNode, hitResult.offset);
      } else {
        return new UnknownHitTestResult(hitResult.offsetNode.parentNode);
      }
    }
    if (hitResult.offsetNode.nodeType === hitResult.offsetNode.ELEMENT_NODE) {
      const parent1 = hitResult.offsetNode.parentNode;
      const parent1ClassName = parent1 && parent1.nodeType === parent1.ELEMENT_NODE ? parent1.className : null;
      const parent2 = parent1 ? parent1.parentNode : null;
      const parent2ClassName = parent2 && parent2.nodeType === parent2.ELEMENT_NODE ? parent2.className : null;
      if (parent1ClassName === ViewLine.CLASS_NAME) {
        const tokenSpan = hitResult.offsetNode.childNodes[Math.min(hitResult.offset, hitResult.offsetNode.childNodes.length - 1)];
        if (tokenSpan) {
          return HitTestResult.createFromDOMInfo(ctx, tokenSpan, 0);
        }
      } else if (parent2ClassName === ViewLine.CLASS_NAME) {
        return HitTestResult.createFromDOMInfo(ctx, hitResult.offsetNode, 0);
      }
    }
    return new UnknownHitTestResult(hitResult.offsetNode);
  }
  static _snapToSoftTabBoundary(position2, viewModel) {
    const lineContent = viewModel.getLineContent(position2.lineNumber);
    const { tabSize } = viewModel.model.getOptions();
    const newPosition = AtomicTabMoveOperations.atomicPosition(lineContent, position2.column - 1, tabSize, 2 /* Nearest */);
    if (newPosition !== -1) {
      return new Position(position2.lineNumber, newPosition + 1);
    }
    return position2;
  }
  static doHitTest(ctx, request2) {
    let result = new UnknownHitTestResult();
    if (typeof ctx.viewDomNode.ownerDocument.caretRangeFromPoint === "function") {
      result = this._doHitTestWithCaretRangeFromPoint(ctx, request2);
    } else if (ctx.viewDomNode.ownerDocument.caretPositionFromPoint) {
      result = this._doHitTestWithCaretPositionFromPoint(ctx, request2.pos.toClientCoordinates(getWindow(ctx.viewDomNode)));
    }
    if (result.type === 1 /* Content */) {
      const injectedText = ctx.viewModel.getInjectedTextAt(result.position);
      const normalizedPosition = ctx.viewModel.normalizePosition(result.position, 2 /* None */);
      if (injectedText || !normalizedPosition.equals(result.position)) {
        result = new ContentHitTestResult(normalizedPosition, result.spanNode, injectedText);
      }
    }
    return result;
  }
};

function shadowCaretRangeFromPoint(shadowRoot, x, y) {
  const range2 = document.createRange();
  let el = shadowRoot.elementFromPoint(x, y);
  if (el?.hasChildNodes()) {
    while (el && el.firstChild && el.firstChild.nodeType !== el.firstChild.TEXT_NODE && el.lastChild && el.lastChild.firstChild) {
      el = el.lastChild;
    }
    const rect = el.getBoundingClientRect();
    const elWindow = getWindow(el);
    const computedStyle = elWindow.getComputedStyle(el, null);
    const fontStyle = computedStyle.getPropertyValue("font-style");
    const fontVariant = computedStyle.getPropertyValue("font-variant");
    const fontWeight = computedStyle.getPropertyValue("font-weight");
    const fontSize = computedStyle.getPropertyValue("font-size");
    const lineHeight = computedStyle.getPropertyValue("line-height");
    const fontFamily = computedStyle.getPropertyValue("font-family");
    const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;
    const text2 = el.innerText;
    let pixelCursor = rect.left;
    let offset = 0;
    let step;
    if (x > rect.left + rect.width) {
      offset = text2.length;
    } else {
      const charWidthReader = CharWidthReader.getInstance();
      for (let i2 = 0; i2 < text2.length + 1; i2++) {
        step = charWidthReader.getCharWidth(text2.charAt(i2), font) / 2;
        pixelCursor += step;
        if (x < pixelCursor) {
          offset = i2;
          break;
        }
        pixelCursor += step;
      }
    }
    range2.setStart(el.firstChild, offset);
    range2.setEnd(el.firstChild, offset);
  }
  return range2;
}

var CharWidthReader = class _CharWidthReader {
  static {
    this._INSTANCE = null;
  }
  static getInstance() {
    if (!_CharWidthReader._INSTANCE) {
      _CharWidthReader._INSTANCE = new _CharWidthReader();
    }
    return _CharWidthReader._INSTANCE;
  }
  constructor() {
    this._cache = {};
    this._canvas = document.createElement("canvas");
  }
  getCharWidth(char, font) {
    const cacheKey2 = char + font;
    if (this._cache[cacheKey2]) {
      return this._cache[cacheKey2];
    }
    const context2 = this._canvas.getContext("2d");
    context2.font = font;
    const metrics = context2.measureText(char);
    const width2 = metrics.width;
    this._cache[cacheKey2] = width2;
    return width2;
  }
};
export { createEmptyContentDataInLines, shadowCaretRangeFromPoint, UnknownHitTestResult, ContentHitTestResult, HitTestResult, PointerHandlerLastRenderData, MouseTarget, ElementPath, HitTestContext, BareHitTestRequest, HitTestRequest, EMPTY_CONTENT_AFTER_LINES, MouseTargetFactory, CharWidthReader };
