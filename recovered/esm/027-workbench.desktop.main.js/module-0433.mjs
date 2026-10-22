// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/viewLayout.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Scrollable } from "./module-0099.mjs";
import { ContentSizeChangedEvent } from "./module-0428.mjs";
import { LinesLayout } from "./module-0432.mjs";
import { Viewport } from "./module-0315.mjs";


// src/vs/editor/common/viewLayout/viewLayout.ts
var SMOOTH_SCROLLING_TIME = 125;

var EditorScrollDimensions = class {
  constructor(width2, contentWidth, height, contentHeight) {
    width2 = width2 | 0;
    contentWidth = contentWidth | 0;
    height = height | 0;
    contentHeight = contentHeight | 0;
    if (width2 < 0) {
      width2 = 0;
    }
    if (contentWidth < 0) {
      contentWidth = 0;
    }
    if (height < 0) {
      height = 0;
    }
    if (contentHeight < 0) {
      contentHeight = 0;
    }
    this.width = width2;
    this.contentWidth = contentWidth;
    this.scrollWidth = Math.max(width2, contentWidth);
    this.height = height;
    this.contentHeight = contentHeight;
    this.scrollHeight = Math.max(height, contentHeight);
  }
  equals(other) {
    return this.width === other.width && this.contentWidth === other.contentWidth && this.height === other.height && this.contentHeight === other.contentHeight;
  }
};

var EditorScrollable = class extends Disposable {
  constructor(smoothScrollDuration, scheduleAtNextAnimationFrame2) {
    super();
    this._onDidContentSizeChange = this._register(new Emitter());
    this.onDidContentSizeChange = this._onDidContentSizeChange.event;
    this._dimensions = new EditorScrollDimensions(0, 0, 0, 0);
    this._scrollable = this._register(new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration,
      scheduleAtNextAnimationFrame: scheduleAtNextAnimationFrame2
    }));
    this.onDidScroll = this._scrollable.onScroll;
  }
  getScrollable() {
    return this._scrollable;
  }
  setSmoothScrollDuration(smoothScrollDuration) {
    this._scrollable.setSmoothScrollDuration(smoothScrollDuration);
  }
  validateScrollPosition(scrollPosition) {
    return this._scrollable.validateScrollPosition(scrollPosition);
  }
  getScrollDimensions() {
    return this._dimensions;
  }
  setScrollDimensions(dimensions) {
    if (this._dimensions.equals(dimensions)) {
      return;
    }
    const oldDimensions = this._dimensions;
    this._dimensions = dimensions;
    this._scrollable.setScrollDimensions({
      width: dimensions.width,
      scrollWidth: dimensions.scrollWidth,
      height: dimensions.height,
      scrollHeight: dimensions.scrollHeight
    }, true);
    const contentWidthChanged = oldDimensions.contentWidth !== dimensions.contentWidth;
    const contentHeightChanged = oldDimensions.contentHeight !== dimensions.contentHeight;
    if (contentWidthChanged || contentHeightChanged) {
      this._onDidContentSizeChange.fire(new ContentSizeChangedEvent(
        oldDimensions.contentWidth,
        oldDimensions.contentHeight,
        dimensions.contentWidth,
        dimensions.contentHeight
      ));
    }
  }
  getFutureScrollPosition() {
    return this._scrollable.getFutureScrollPosition();
  }
  getCurrentScrollPosition() {
    return this._scrollable.getCurrentScrollPosition();
  }
  setScrollPositionNow(update) {
    this._scrollable.setScrollPositionNow(update);
  }
  setScrollPositionSmooth(update) {
    this._scrollable.setScrollPositionSmooth(update);
  }
  hasPendingScrollAnimation() {
    return this._scrollable.hasPendingScrollAnimation();
  }
};

var ViewLayout = class extends Disposable {
  constructor(configuration2, lineCount, customLineHeightData, scheduleAtNextAnimationFrame2) {
    super();
    this._configuration = configuration2;
    const options3 = this._configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const padding = options3.get(96 /* padding */);
    this._linesLayout = new LinesLayout(lineCount, options3.get(75 /* lineHeight */), padding.top, padding.bottom, customLineHeightData);
    this._maxLineWidth = 0;
    this._overlayWidgetsMinWidth = 0;
    this._scrollable = this._register(new EditorScrollable(0, scheduleAtNextAnimationFrame2));
    this._configureSmoothScrollDuration();
    this._scrollable.setScrollDimensions(new EditorScrollDimensions(
      layoutInfo.contentWidth,
      0,
      layoutInfo.height,
      0
    ));
    this.onDidScroll = this._scrollable.onDidScroll;
    this.onDidContentSizeChange = this._scrollable.onDidContentSizeChange;
    this._updateHeight();
  }
  getScrollable() {
    return this._scrollable.getScrollable();
  }
  onHeightMaybeChanged() {
    this._updateHeight();
  }
  _configureSmoothScrollDuration() {
    this._scrollable.setSmoothScrollDuration(this._configuration.options.get(130 /* smoothScrolling */) ? SMOOTH_SCROLLING_TIME : 0);
  }
  // ---- begin view event handlers
  onConfigurationChanged(e) {
    const options3 = this._configuration.options;
    if (e.hasChanged(75 /* lineHeight */)) {
      this._linesLayout.setDefaultLineHeight(options3.get(75 /* lineHeight */));
    }
    if (e.hasChanged(96 /* padding */)) {
      const padding = options3.get(96 /* padding */);
      this._linesLayout.setPadding(padding.top, padding.bottom);
    }
    if (e.hasChanged(165 /* layoutInfo */)) {
      const layoutInfo = options3.get(165 /* layoutInfo */);
      const width2 = layoutInfo.contentWidth;
      const height = layoutInfo.height;
      const scrollDimensions = this._scrollable.getScrollDimensions();
      const contentWidth = scrollDimensions.contentWidth;
      this._scrollable.setScrollDimensions(new EditorScrollDimensions(
        width2,
        scrollDimensions.contentWidth,
        height,
        this._getContentHeight(width2, height, contentWidth)
      ));
    } else {
      this._updateHeight();
    }
    if (e.hasChanged(130 /* smoothScrolling */)) {
      this._configureSmoothScrollDuration();
    }
  }
  onFlushed(lineCount, customLineHeightData) {
    this._linesLayout.onFlushed(lineCount, customLineHeightData);
  }
  onLinesDeleted(fromLineNumber, toLineNumber) {
    this._linesLayout.onLinesDeleted(fromLineNumber, toLineNumber);
  }
  onLinesInserted(fromLineNumber, toLineNumber) {
    this._linesLayout.onLinesInserted(fromLineNumber, toLineNumber);
  }
  // ---- end view event handlers
  _getHorizontalScrollbarHeight(width2, scrollWidth) {
    const options3 = this._configuration.options;
    const scrollbar = options3.get(117 /* scrollbar */);
    if (scrollbar.horizontal === 2 /* Hidden */) {
      return 0;
    }
    if (width2 >= scrollWidth) {
      return 0;
    }
    return scrollbar.horizontalScrollbarSize;
  }
  _getContentHeight(width2, height, contentWidth) {
    const options3 = this._configuration.options;
    let result = this._linesLayout.getLinesTotalHeight();
    if (options3.get(119 /* scrollBeyondLastLine */)) {
      result += Math.max(0, height - options3.get(75 /* lineHeight */) - options3.get(96 /* padding */).bottom);
    } else if (!options3.get(117 /* scrollbar */).ignoreHorizontalScrollbarInContentHeight) {
      result += this._getHorizontalScrollbarHeight(width2, contentWidth);
    }
    return result;
  }
  _updateHeight() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    const width2 = scrollDimensions.width;
    const height = scrollDimensions.height;
    const contentWidth = scrollDimensions.contentWidth;
    this._scrollable.setScrollDimensions(new EditorScrollDimensions(
      width2,
      scrollDimensions.contentWidth,
      height,
      this._getContentHeight(width2, height, contentWidth)
    ));
  }
  // ---- Layouting logic
  getCurrentViewport() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
    return new Viewport(
      currentScrollPosition.scrollTop,
      currentScrollPosition.scrollLeft,
      scrollDimensions.width,
      scrollDimensions.height
    );
  }
  getFutureViewport() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    const currentScrollPosition = this._scrollable.getFutureScrollPosition();
    return new Viewport(
      currentScrollPosition.scrollTop,
      currentScrollPosition.scrollLeft,
      scrollDimensions.width,
      scrollDimensions.height
    );
  }
  _computeContentWidth() {
    const options3 = this._configuration.options;
    const maxLineWidth = this._maxLineWidth;
    const wrappingInfo = options3.get(166 /* wrappingInfo */);
    const fontInfo = options3.get(59 /* fontInfo */);
    const layoutInfo = options3.get(165 /* layoutInfo */);
    if (wrappingInfo.isViewportWrapping) {
      const minimap = options3.get(81 /* minimap */);
      if (maxLineWidth > layoutInfo.contentWidth + fontInfo.typicalHalfwidthCharacterWidth) {
        if (minimap.enabled && minimap.side === "right") {
          return maxLineWidth + layoutInfo.verticalScrollbarWidth;
        }
      }
      return maxLineWidth;
    } else {
      const extraHorizontalSpace = options3.get(118 /* scrollBeyondLastColumn */) * fontInfo.typicalHalfwidthCharacterWidth;
      const whitespaceMinWidth = this._linesLayout.getWhitespaceMinWidth();
      return Math.max(maxLineWidth + extraHorizontalSpace + layoutInfo.verticalScrollbarWidth, whitespaceMinWidth, this._overlayWidgetsMinWidth);
    }
  }
  setMaxLineWidth(maxLineWidth) {
    this._maxLineWidth = maxLineWidth;
    this._updateContentWidth();
  }
  setOverlayWidgetsMinWidth(maxMinWidth) {
    this._overlayWidgetsMinWidth = maxMinWidth;
    this._updateContentWidth();
  }
  _updateContentWidth() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    this._scrollable.setScrollDimensions(new EditorScrollDimensions(
      scrollDimensions.width,
      this._computeContentWidth(),
      scrollDimensions.height,
      scrollDimensions.contentHeight
    ));
    this._updateHeight();
  }
  // ---- view state
  saveState() {
    const currentScrollPosition = this._scrollable.getFutureScrollPosition();
    const scrollTop = currentScrollPosition.scrollTop;
    const firstLineNumberInViewport = this._linesLayout.getLineNumberAtOrAfterVerticalOffset(scrollTop);
    const whitespaceAboveFirstLine = this._linesLayout.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
    return {
      scrollTop,
      scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
      scrollLeft: currentScrollPosition.scrollLeft
    };
  }
  // ----
  changeWhitespace(callback) {
    const hadAChange = this._linesLayout.changeWhitespace(callback);
    if (hadAChange) {
      this.onHeightMaybeChanged();
    }
    return hadAChange;
  }
  changeSpecialLineHeights(callback) {
    const hadAChange = this._linesLayout.changeLineHeights(callback);
    if (hadAChange) {
      this.onHeightMaybeChanged();
    }
    return hadAChange;
  }
  getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
    return this._linesLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
  }
  getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
    return this._linesLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
  }
  getLineHeightForLineNumber(lineNumber) {
    return this._linesLayout.getLineHeightForLineNumber(lineNumber);
  }
  isAfterLines(verticalOffset) {
    return this._linesLayout.isAfterLines(verticalOffset);
  }
  isInTopPadding(verticalOffset) {
    return this._linesLayout.isInTopPadding(verticalOffset);
  }
  isInBottomPadding(verticalOffset) {
    return this._linesLayout.isInBottomPadding(verticalOffset);
  }
  getLineNumberAtVerticalOffset(verticalOffset) {
    return this._linesLayout.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
  }
  getWhitespaceAtVerticalOffset(verticalOffset) {
    return this._linesLayout.getWhitespaceAtVerticalOffset(verticalOffset);
  }
  getLinesViewportData() {
    const visibleBox = this.getCurrentViewport();
    return this._linesLayout.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
  }
  getLinesViewportDataAtScrollTop(scrollTop) {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    if (scrollTop + scrollDimensions.height > scrollDimensions.scrollHeight) {
      scrollTop = scrollDimensions.scrollHeight - scrollDimensions.height;
    }
    if (scrollTop < 0) {
      scrollTop = 0;
    }
    return this._linesLayout.getLinesViewportData(scrollTop, scrollTop + scrollDimensions.height);
  }
  getWhitespaceViewportData() {
    const visibleBox = this.getCurrentViewport();
    return this._linesLayout.getWhitespaceViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
  }
  getWhitespaces() {
    return this._linesLayout.getWhitespaces();
  }
  // ----
  getContentWidth() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    return scrollDimensions.contentWidth;
  }
  getScrollWidth() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    return scrollDimensions.scrollWidth;
  }
  getContentHeight() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    return scrollDimensions.contentHeight;
  }
  getScrollHeight() {
    const scrollDimensions = this._scrollable.getScrollDimensions();
    return scrollDimensions.scrollHeight;
  }
  getCurrentScrollLeft() {
    const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
    return currentScrollPosition.scrollLeft;
  }
  getCurrentScrollTop() {
    const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
    return currentScrollPosition.scrollTop;
  }
  validateScrollPosition(scrollPosition) {
    return this._scrollable.validateScrollPosition(scrollPosition);
  }
  setScrollPosition(position2, type) {
    if (type === 1 /* Immediate */) {
      this._scrollable.setScrollPositionNow(position2);
    } else {
      this._scrollable.setScrollPositionSmooth(position2);
    }
  }
  hasPendingScrollAnimation() {
    return this._scrollable.hasPendingScrollAnimation();
  }
  deltaScrollNow(deltaScrollLeft, deltaScrollTop) {
    const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
    this._scrollable.setScrollPositionNow({
      scrollLeft: currentScrollPosition.scrollLeft + deltaScrollLeft,
      scrollTop: currentScrollPosition.scrollTop + deltaScrollTop
    });
  }
};
export { SMOOTH_SCROLLING_TIME, EditorScrollDimensions, EditorScrollable, ViewLayout };
