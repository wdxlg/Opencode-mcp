// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollWidget.ts
import { equals } from "./module-0007.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { Position } from "./module-0079.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { getColumnOfNodeOffset } from "./module-0248.mjs";
import { LineDecoration } from "./module-0245.mjs";
import { RenderLineInput, renderViewLine } from "./module-0246.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { foldingCollapsedIcon, foldingExpandedIcon } from "./module-0682.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollWidget.ts
var StickyScrollWidgetState = class _StickyScrollWidgetState {
  constructor(startLineNumbers, endLineNumbers, lastLineRelativePosition, showEndForLine = null) {
    this.startLineNumbers = startLineNumbers;
    this.endLineNumbers = endLineNumbers;
    this.lastLineRelativePosition = lastLineRelativePosition;
    this.showEndForLine = showEndForLine;
  }
  equals(other) {
    return !!other && this.lastLineRelativePosition === other.lastLineRelativePosition && this.showEndForLine === other.showEndForLine && equals(this.startLineNumbers, other.startLineNumbers) && equals(this.endLineNumbers, other.endLineNumbers);
  }
  static get Empty() {
    return new _StickyScrollWidgetState([], [], 0);
  }
};

var _ttPolicy = createTrustedTypesPolicy("stickyScrollViewLayer", { createHTML: (value2) => value2 });

var STICKY_INDEX_ATTR = "data-sticky-line-index";

var STICKY_IS_LINE_ATTR = "data-sticky-is-line";

var STICKY_IS_LINE_NUMBER_ATTR = "data-sticky-is-line-number";

var STICKY_IS_FOLDING_ICON_ATTR = "data-sticky-is-folding-icon";

var StickyScrollWidget2 = class extends Disposable {
  constructor(editor) {
    super();
    this._foldingIconStore = this._register(new DisposableStore());
    this._rootDomNode = document.createElement("div");
    this._lineNumbersDomNode = document.createElement("div");
    this._linesDomNodeScrollable = document.createElement("div");
    this._linesDomNode = document.createElement("div");
    this._renderedStickyLines = [];
    this._lineNumbers = [];
    this._lastLineRelativePosition = 0;
    this._minContentWidthInPx = 0;
    this._isOnGlyphMargin = false;
    this._height = -1;
    this._onDidChangeStickyScrollHeight = this._register(new Emitter());
    this.onDidChangeStickyScrollHeight = this._onDidChangeStickyScrollHeight.event;
    this._editor = editor;
    this._lineNumbersDomNode.className = "sticky-widget-line-numbers";
    this._lineNumbersDomNode.setAttribute("role", "none");
    this._linesDomNode.className = "sticky-widget-lines";
    this._linesDomNode.setAttribute("role", "list");
    this._linesDomNodeScrollable.className = "sticky-widget-lines-scrollable";
    this._linesDomNodeScrollable.appendChild(this._linesDomNode);
    this._rootDomNode.className = "sticky-widget";
    this._rootDomNode.classList.toggle("peek", editor instanceof EmbeddedCodeEditorWidget);
    this._rootDomNode.appendChild(this._lineNumbersDomNode);
    this._rootDomNode.appendChild(this._linesDomNodeScrollable);
    this._setHeight(0);
    const updateScrollLeftPosition = () => {
      this._linesDomNode.style.left = this._editor.getOption(131 /* stickyScroll */).scrollWithEditor ? `-${this._editor.getScrollLeft()}px` : "0px";
    };
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(131 /* stickyScroll */)) {
        updateScrollLeftPosition();
      }
    }));
    this._register(this._editor.onDidScrollChange((e) => {
      if (e.scrollLeftChanged) {
        updateScrollLeftPosition();
      }
      if (e.scrollWidthChanged) {
        this._updateWidgetWidth();
      }
    }));
    this._register(this._editor.onDidChangeModel(() => {
      updateScrollLeftPosition();
      this._updateWidgetWidth();
    }));
    updateScrollLeftPosition();
    this._register(this._editor.onDidLayoutChange((e) => {
      this._updateWidgetWidth();
    }));
    this._updateWidgetWidth();
  }
  get height() {
    return this._height;
  }
  get lineNumbers() {
    return this._lineNumbers;
  }
  get lineNumberCount() {
    return this._lineNumbers.length;
  }
  getRenderedStickyLine(lineNumber) {
    return this._renderedStickyLines.find((stickyLine) => stickyLine.lineNumber === lineNumber);
  }
  getCurrentLines() {
    return this._lineNumbers;
  }
  setState(state, foldingModel, rebuildFromIndexCandidate) {
    const currentStateAndPreviousStateUndefined = !this._state && !state;
    const currentStateDefinedAndEqualsPreviousState = this._state && this._state.equals(state);
    if (rebuildFromIndexCandidate === void 0 && (currentStateAndPreviousStateUndefined || currentStateDefinedAndEqualsPreviousState)) {
      return;
    }
    const data = this._findRenderingData(state);
    const previousLineNumbers = this._lineNumbers;
    this._lineNumbers = data.lineNumbers;
    this._lastLineRelativePosition = data.lastLineRelativePosition;
    const rebuildFromIndex = this._findIndexToRebuildFrom(previousLineNumbers, this._lineNumbers, rebuildFromIndexCandidate);
    this._renderRootNode(this._lineNumbers, this._lastLineRelativePosition, foldingModel, rebuildFromIndex);
    this._state = state;
  }
  _findRenderingData(state) {
    if (!state) {
      return { lineNumbers: [], lastLineRelativePosition: 0 };
    }
    const candidateLineNumbers = [...state.startLineNumbers];
    if (state.showEndForLine !== null) {
      candidateLineNumbers[state.showEndForLine] = state.endLineNumbers[state.showEndForLine];
    }
    let totalHeight = 0;
    for (let i2 = 0; i2 < candidateLineNumbers.length; i2++) {
      const position2 = new Position(candidateLineNumbers[i2], 1);
      const viewModel = this._editor._getViewModel();
      if (viewModel && position2.lineNumber <= viewModel.getLineCount()) {
        totalHeight += this._editor.getLineHeightForPosition(new Position(candidateLineNumbers[i2], 1));
      }
    }
    if (totalHeight === 0) {
      return { lineNumbers: [], lastLineRelativePosition: 0 };
    }
    return { lineNumbers: candidateLineNumbers, lastLineRelativePosition: state.lastLineRelativePosition };
  }
  _findIndexToRebuildFrom(previousLineNumbers, newLineNumbers, rebuildFromIndexCandidate) {
    if (newLineNumbers.length === 0) {
      return 0;
    }
    if (rebuildFromIndexCandidate !== void 0) {
      return rebuildFromIndexCandidate;
    }
    const validIndex = newLineNumbers.findIndex((startLineNumber) => !previousLineNumbers.includes(startLineNumber));
    return validIndex === -1 ? 0 : validIndex;
  }
  _updateWidgetWidth() {
    const layoutInfo = this._editor.getLayoutInfo();
    const lineNumbersWidth = layoutInfo.contentLeft;
    this._lineNumbersDomNode.style.width = `${lineNumbersWidth}px`;
    this._linesDomNodeScrollable.style.setProperty("--vscode-editorStickyScroll-scrollableWidth", `${this._editor.getScrollWidth() - layoutInfo.verticalScrollbarWidth}px`);
    this._rootDomNode.style.width = `${layoutInfo.width - layoutInfo.verticalScrollbarWidth}px`;
  }
  _useFoldingOpacityTransition(requireTransitions) {
    this._lineNumbersDomNode.style.setProperty("--vscode-editorStickyScroll-foldingOpacityTransition", `opacity ${requireTransitions ? 0.5 : 0}s`);
  }
  _setFoldingIconsVisibility(allVisible) {
    for (const line of this._renderedStickyLines) {
      const foldingIcon = line.foldingIcon;
      if (!foldingIcon) {
        continue;
      }
      foldingIcon.setVisible(allVisible ? true : foldingIcon.isCollapsed);
    }
  }
  async _renderRootNode(lineNumbers, lastLineRelativePosition, foldingModel, rebuildFromIndex) {
    const viewModel = this._editor._getViewModel();
    if (!viewModel) {
      this._clearWidget();
      return;
    }
    if (lineNumbers.length === 0) {
      this._clearWidget();
      return;
    }
    const renderedStickyLines = [];
    const lastLineNumber = lineNumbers[lineNumbers.length - 1];
    let top2 = 0;
    for (let i2 = 0; i2 < this._renderedStickyLines.length; i2++) {
      if (i2 < rebuildFromIndex) {
        const renderedLine = this._renderedStickyLines[i2];
        renderedStickyLines.push(this._updatePosition(renderedLine, top2, renderedLine.lineNumber === lastLineNumber));
        top2 += renderedLine.height;
      } else {
        const renderedLine = this._renderedStickyLines[i2];
        renderedLine.lineNumberDomNode.remove();
        renderedLine.lineDomNode.remove();
      }
    }
    const layoutInfo = this._editor.getLayoutInfo();
    for (let i2 = rebuildFromIndex; i2 < lineNumbers.length; i2++) {
      const lineNumber = lineNumbers[i2];
      if (lineNumber > viewModel.getLineCount()) {
        continue;
      }
      const stickyLine = this._renderChildNode(viewModel, i2, lineNumber, top2, lastLineNumber === lineNumber, foldingModel, layoutInfo);
      top2 += stickyLine.height;
      this._linesDomNode.appendChild(stickyLine.lineDomNode);
      this._lineNumbersDomNode.appendChild(stickyLine.lineNumberDomNode);
      renderedStickyLines.push(stickyLine);
    }
    if (foldingModel) {
      this._setFoldingHoverListeners();
      this._useFoldingOpacityTransition(!this._isOnGlyphMargin);
    }
    this._minContentWidthInPx = Math.max(...this._renderedStickyLines.map((l) => l.scrollWidth)) + layoutInfo.verticalScrollbarWidth;
    this._renderedStickyLines = renderedStickyLines;
    this._setHeight(top2 + lastLineRelativePosition);
    this._editor.layoutOverlayWidget(this);
  }
  _clearWidget() {
    for (let i2 = 0; i2 < this._renderedStickyLines.length; i2++) {
      const stickyLine = this._renderedStickyLines[i2];
      stickyLine.lineNumberDomNode.remove();
      stickyLine.lineDomNode.remove();
    }
    this._setHeight(0);
  }
  _setHeight(height) {
    if (this._height === height) {
      return;
    }
    this._height = height;
    if (this._height === 0) {
      this._rootDomNode.style.display = "none";
    } else {
      this._rootDomNode.style.display = "block";
      this._lineNumbersDomNode.style.height = `${this._height}px`;
      this._linesDomNodeScrollable.style.height = `${this._height}px`;
      this._rootDomNode.style.height = `${this._height}px`;
    }
    this._onDidChangeStickyScrollHeight.fire({ height: this._height });
  }
  _setFoldingHoverListeners() {
    this._foldingIconStore.clear();
    const showFoldingControls = this._editor.getOption(126 /* showFoldingControls */);
    if (showFoldingControls !== "mouseover") {
      return;
    }
    this._foldingIconStore.clear();
    this._foldingIconStore.add(addDisposableListener(this._lineNumbersDomNode, EventType.MOUSE_ENTER, () => {
      this._isOnGlyphMargin = true;
      this._setFoldingIconsVisibility(true);
    }));
    this._foldingIconStore.add(addDisposableListener(this._lineNumbersDomNode, EventType.MOUSE_LEAVE, () => {
      this._isOnGlyphMargin = false;
      this._useFoldingOpacityTransition(true);
      this._setFoldingIconsVisibility(false);
    }));
  }
  _renderChildNode(viewModel, index2, line, top2, isLastLine, foldingModel, layoutInfo) {
    const renderedLine = new RenderedStickyLine(
      this._editor,
      viewModel,
      layoutInfo,
      foldingModel,
      this._isOnGlyphMargin,
      index2,
      line
    );
    return this._updatePosition(renderedLine, top2, isLastLine);
  }
  _updatePosition(stickyLine, top2, isLastLine) {
    const lineHTMLNode = stickyLine.lineDomNode;
    const lineNumberHTMLNode = stickyLine.lineNumberDomNode;
    if (isLastLine) {
      const zIndex = "0";
      lineHTMLNode.style.zIndex = zIndex;
      lineNumberHTMLNode.style.zIndex = zIndex;
      const updatedTop = `${top2 + this._lastLineRelativePosition + (stickyLine.foldingIcon?.isCollapsed ? 1 : 0)}px`;
      lineHTMLNode.style.top = updatedTop;
      lineNumberHTMLNode.style.top = updatedTop;
    } else {
      const zIndex = "1";
      lineHTMLNode.style.zIndex = zIndex;
      lineNumberHTMLNode.style.zIndex = zIndex;
      lineHTMLNode.style.top = `${top2}px`;
      lineNumberHTMLNode.style.top = `${top2}px`;
    }
    return stickyLine;
  }
  getId() {
    return "editor.contrib.stickyScrollWidget";
  }
  getDomNode() {
    return this._rootDomNode;
  }
  getPosition() {
    return {
      preference: 2 /* TOP_CENTER */,
      stackOrdinal: 10
    };
  }
  getMinContentWidthInPx() {
    return this._minContentWidthInPx;
  }
  focusLineWithIndex(index2) {
    if (0 <= index2 && index2 < this._renderedStickyLines.length) {
      this._renderedStickyLines[index2].lineDomNode.focus();
    }
  }
  /**
   * Given a leaf dom node, tries to find the editor position.
   */
  getEditorPositionFromNode(spanDomNode) {
    if (!spanDomNode || spanDomNode.children.length > 0) {
      return null;
    }
    const renderedStickyLine = this._getRenderedStickyLineFromChildDomNode(spanDomNode);
    if (!renderedStickyLine) {
      return null;
    }
    const column = getColumnOfNodeOffset(renderedStickyLine.characterMapping, spanDomNode, 0);
    return new Position(renderedStickyLine.lineNumber, column);
  }
  getLineNumberFromChildDomNode(domNode) {
    return this._getRenderedStickyLineFromChildDomNode(domNode)?.lineNumber ?? null;
  }
  _getRenderedStickyLineFromChildDomNode(domNode) {
    const index2 = this.getLineIndexFromChildDomNode(domNode);
    if (index2 === null || index2 < 0 || index2 >= this._renderedStickyLines.length) {
      return null;
    }
    return this._renderedStickyLines[index2];
  }
  /**
   * Given a child dom node, tries to find the line number attribute that was stored in the node.
   * @returns the attribute value or null if none is found.
   */
  getLineIndexFromChildDomNode(domNode) {
    const lineIndex = this._getAttributeValue(domNode, STICKY_INDEX_ATTR);
    return lineIndex ? parseInt(lineIndex, 10) : null;
  }
  /**
   * Given a child dom node, tries to find if it is (contained in) a sticky line.
   * @returns a boolean.
   */
  isInStickyLine(domNode) {
    const isInLine = this._getAttributeValue(domNode, STICKY_IS_LINE_ATTR);
    return isInLine !== void 0;
  }
  /**
   * Given a child dom node, tries to find if this dom node is (contained in) a sticky folding icon.
   * @returns a boolean.
   */
  isInFoldingIconDomNode(domNode) {
    const isInFoldingIcon = this._getAttributeValue(domNode, STICKY_IS_FOLDING_ICON_ATTR);
    return isInFoldingIcon !== void 0;
  }
  /**
   * Given the dom node, finds if it or its parent sequence contains the given attribute.
   * @returns the attribute value or undefined.
   */
  _getAttributeValue(domNode, attribute) {
    while (domNode && domNode !== this._rootDomNode) {
      const line = domNode.getAttribute(attribute);
      if (line !== null) {
        return line;
      }
      domNode = domNode.parentElement;
    }
    return;
  }
};

var RenderedStickyLine = class {
  constructor(editor, viewModel, layoutInfo, foldingModel, isOnGlyphMargin, index2, lineNumber) {
    this.index = index2;
    this.lineNumber = lineNumber;
    const viewLineNumber = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new Position(lineNumber, 1)).lineNumber;
    const lineRenderingData = viewModel.getViewLineRenderingData(viewLineNumber);
    const lineNumberOption = editor.getOption(76 /* lineNumbers */);
    const verticalScrollbarSize = editor.getOption(117 /* scrollbar */).verticalScrollbarSize;
    let actualInlineDecorations;
    try {
      actualInlineDecorations = LineDecoration.filter(lineRenderingData.inlineDecorations, viewLineNumber, lineRenderingData.minColumn, lineRenderingData.maxColumn);
    } catch (err) {
      actualInlineDecorations = [];
    }
    const lineHeight = editor.getLineHeightForPosition(new Position(lineNumber, 1));
    const textDirection = viewModel.getTextDirection(lineNumber);
    const renderLineInput = new RenderLineInput(
      true,
      true,
      lineRenderingData.content,
      lineRenderingData.continuesWithWrappedLine,
      lineRenderingData.isBasicASCII,
      lineRenderingData.containsRTL,
      0,
      lineRenderingData.tokens,
      actualInlineDecorations,
      lineRenderingData.tabSize,
      lineRenderingData.startVisibleColumn,
      1,
      1,
      1,
      500,
      "none",
      true,
      true,
      null,
      textDirection,
      verticalScrollbarSize
    );
    const sb = new StringBuilder(2e3);
    const renderOutput = renderViewLine(renderLineInput, sb);
    this.characterMapping = renderOutput.characterMapping;
    let newLine;
    if (_ttPolicy) {
      newLine = _ttPolicy.createHTML(sb.build());
    } else {
      newLine = sb.build();
    }
    const lineHTMLNode = document.createElement("span");
    lineHTMLNode.setAttribute(STICKY_INDEX_ATTR, String(index2));
    lineHTMLNode.setAttribute(STICKY_IS_LINE_ATTR, "");
    lineHTMLNode.setAttribute("role", "listitem");
    lineHTMLNode.tabIndex = 0;
    lineHTMLNode.className = "sticky-line-content";
    lineHTMLNode.classList.add(`stickyLine${lineNumber}`);
    lineHTMLNode.style.lineHeight = `${lineHeight}px`;
    lineHTMLNode.innerHTML = newLine;
    const lineNumberHTMLNode = document.createElement("span");
    lineNumberHTMLNode.setAttribute(STICKY_INDEX_ATTR, String(index2));
    lineNumberHTMLNode.setAttribute(STICKY_IS_LINE_NUMBER_ATTR, "");
    lineNumberHTMLNode.className = "sticky-line-number";
    lineNumberHTMLNode.style.lineHeight = `${lineHeight}px`;
    const lineNumbersWidth = layoutInfo.contentLeft;
    lineNumberHTMLNode.style.width = `${lineNumbersWidth}px`;
    const innerLineNumberHTML = document.createElement("span");
    if (lineNumberOption.renderType === 1 /* On */ || lineNumberOption.renderType === 3 /* Interval */ && lineNumber % 10 === 0) {
      innerLineNumberHTML.innerText = lineNumber.toString();
    } else if (lineNumberOption.renderType === 2 /* Relative */) {
      innerLineNumberHTML.innerText = Math.abs(lineNumber - editor.getPosition().lineNumber).toString();
    }
    innerLineNumberHTML.className = "sticky-line-number-inner";
    innerLineNumberHTML.style.width = `${layoutInfo.lineNumbersWidth}px`;
    innerLineNumberHTML.style.paddingLeft = `${layoutInfo.lineNumbersLeft}px`;
    lineNumberHTMLNode.appendChild(innerLineNumberHTML);
    this.foldingIcon = this._renderFoldingIconForLine(editor, foldingModel, lineNumber, lineHeight, isOnGlyphMargin);
    if (this.foldingIcon) {
      lineNumberHTMLNode.appendChild(this.foldingIcon.domNode);
      this.foldingIcon.domNode.style.left = `${layoutInfo.lineNumbersWidth + layoutInfo.lineNumbersLeft}px`;
      this.foldingIcon.domNode.style.lineHeight = `${lineHeight}px`;
    }
    editor.applyFontInfo(lineHTMLNode);
    editor.applyFontInfo(lineNumberHTMLNode);
    lineNumberHTMLNode.style.lineHeight = `${lineHeight}px`;
    lineHTMLNode.style.lineHeight = `${lineHeight}px`;
    lineNumberHTMLNode.style.height = `${lineHeight}px`;
    lineHTMLNode.style.height = `${lineHeight}px`;
    this.scrollWidth = lineHTMLNode.scrollWidth;
    this.lineDomNode = lineHTMLNode;
    this.lineNumberDomNode = lineNumberHTMLNode;
    this.height = lineHeight;
  }
  _renderFoldingIconForLine(editor, foldingModel, line, lineHeight, isOnGlyphMargin) {
    const showFoldingControls = editor.getOption(126 /* showFoldingControls */);
    if (!foldingModel || showFoldingControls === "never") {
      return;
    }
    const foldingRegions = foldingModel.regions;
    const indexOfFoldingRegion = foldingRegions.findRange(line);
    const startLineNumber = foldingRegions.getStartLineNumber(indexOfFoldingRegion);
    const isFoldingScope = line === startLineNumber;
    if (!isFoldingScope) {
      return;
    }
    const isCollapsed = foldingRegions.isCollapsed(indexOfFoldingRegion);
    const foldingIcon = new StickyFoldingIcon(isCollapsed, startLineNumber, foldingRegions.getEndLineNumber(indexOfFoldingRegion), lineHeight);
    foldingIcon.setVisible(isOnGlyphMargin ? true : isCollapsed || showFoldingControls === "always");
    foldingIcon.domNode.setAttribute(STICKY_IS_FOLDING_ICON_ATTR, "");
    return foldingIcon;
  }
};

var StickyFoldingIcon = class {
  constructor(isCollapsed, foldingStartLine, foldingEndLine, dimension) {
    this.isCollapsed = isCollapsed;
    this.foldingStartLine = foldingStartLine;
    this.foldingEndLine = foldingEndLine;
    this.dimension = dimension;
    this.domNode = document.createElement("div");
    this.domNode.style.width = `26px`;
    this.domNode.style.height = `${dimension}px`;
    this.domNode.style.lineHeight = `${dimension}px`;
    this.domNode.className = ThemeIcon.asClassName(isCollapsed ? foldingCollapsedIcon : foldingExpandedIcon);
  }
  setVisible(visible) {
    this.domNode.style.cursor = visible ? "pointer" : "default";
    this.domNode.style.opacity = visible ? "1" : "0";
  }
};
export { StickyScrollWidgetState, _ttPolicy, STICKY_INDEX_ATTR, STICKY_IS_LINE_ATTR, STICKY_IS_LINE_NUMBER_ATTR, STICKY_IS_FOLDING_ICON_ATTR, StickyScrollWidget2, RenderedStickyLine, StickyFoldingIcon };
