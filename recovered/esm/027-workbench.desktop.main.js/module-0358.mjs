// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/native/screenReaderContentRich.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Selection } from "./module-0107.mjs";
import { addDisposableListener, getActiveWindow, isHTMLElement } from "./module-0075.mjs";
import { IME } from "./module-0351.mjs";
import { LineDecoration } from "./module-0245.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";
import { RenderLineInput, renderViewLine } from "./module-0246.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { Range2 } from "./module-0106.mjs";
import { getColumnOfNodeOffset } from "./module-0248.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/editor/browser/controller/editContext/native/screenReaderContentRich.ts
var ttPolicy = createTrustedTypesPolicy("richScreenReaderContent", { createHTML: (value2) => value2 });

var LINE_NUMBER_ATTRIBUTE = "data-line-number";

var RichScreenReaderContent = class extends Disposable {
  constructor(_domNode, _context, _viewController, _accessibilityService) {
    super();
    this._domNode = _domNode;
    this._context = _context;
    this._viewController = _viewController;
    this._accessibilityService = _accessibilityService;
    this._selectionChangeListener = this._register(new MutableDisposable());
    this._accessibilityPageSize = 1;
    this._ignoreSelectionChangeTime = 0;
    this._state = RichScreenReaderState.NULL;
    this._strategy = new RichPagedScreenReaderStrategy();
    this._renderedLines = /* @__PURE__ */ new Map();
    this._renderedSelection = new Selection(1, 1, 1, 1);
    this.onConfigurationChanged(this._context.configuration.options);
  }
  updateScreenReaderContent(primarySelection) {
    const focusedElement = getActiveWindow().document.activeElement;
    if (!focusedElement || focusedElement !== this._domNode.domNode) {
      return;
    }
    const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
    if (isScreenReaderOptimized) {
      const state = this._getScreenReaderContentLineIntervals(primarySelection);
      if (!this._state.equals(state)) {
        this._state = state;
        this._renderedLines = this._renderScreenReaderContent(state);
      }
      if (!this._renderedSelection.equalsSelection(primarySelection)) {
        this._renderedSelection = primarySelection;
        this._setSelectionOnScreenReaderContent(this._context, this._renderedLines, primarySelection);
      }
    } else {
      this._state = RichScreenReaderState.NULL;
      this._setIgnoreSelectionChangeTime("setValue");
      this._domNode.domNode.textContent = "";
    }
  }
  updateScrollTop(primarySelection) {
    const intervals = this._state.intervals;
    if (!intervals.length) {
      return;
    }
    const viewLayout = this._context.viewModel.viewLayout;
    const stateStartLineNumber = intervals[0].startLine;
    const verticalOffsetOfStateStartLineNumber = viewLayout.getVerticalOffsetForLineNumber(stateStartLineNumber);
    const verticalOffsetOfPositionLineNumber = viewLayout.getVerticalOffsetForLineNumber(primarySelection.positionLineNumber);
    this._domNode.domNode.scrollTop = verticalOffsetOfPositionLineNumber - verticalOffsetOfStateStartLineNumber;
  }
  onFocusChange(newFocusValue) {
    if (newFocusValue) {
      this._selectionChangeListener.value = this._setSelectionChangeListener();
    } else {
      this._selectionChangeListener.value = void 0;
    }
  }
  onConfigurationChanged(options3) {
    this._accessibilityPageSize = options3.get(3 /* accessibilityPageSize */);
  }
  onWillCut() {
    this._setIgnoreSelectionChangeTime("onCut");
  }
  onWillPaste() {
    this._setIgnoreSelectionChangeTime("onWillPaste");
  }
  // --- private methods
  _setIgnoreSelectionChangeTime(reason) {
    this._ignoreSelectionChangeTime = Date.now();
  }
  _setSelectionChangeListener() {
    let previousSelectionChangeEventTime = 0;
    return addDisposableListener(this._domNode.domNode.ownerDocument, "selectionchange", () => {
      const activeElement = getActiveWindow().document.activeElement;
      const isFocused = activeElement === this._domNode.domNode;
      if (!isFocused) {
        return;
      }
      const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
      if (!isScreenReaderOptimized || !IME.enabled) {
        return;
      }
      const now = Date.now();
      const delta1 = now - previousSelectionChangeEventTime;
      previousSelectionChangeEventTime = now;
      if (delta1 < 5) {
        return;
      }
      const delta2 = now - this._ignoreSelectionChangeTime;
      this._ignoreSelectionChangeTime = 0;
      if (delta2 < 100) {
        return;
      }
      const selection = this._getEditorSelectionFromDomRange();
      if (!selection) {
        return;
      }
      this._viewController.setSelection(selection);
    });
  }
  _renderScreenReaderContent(state) {
    const nodes = [];
    const renderedLines = /* @__PURE__ */ new Map();
    for (const interval of state.intervals) {
      for (let lineNumber = interval.startLine; lineNumber <= interval.endLine; lineNumber++) {
        const renderedLine = this._renderLine(lineNumber);
        renderedLines.set(lineNumber, renderedLine);
        nodes.push(renderedLine.domNode);
      }
    }
    this._setIgnoreSelectionChangeTime("setValue");
    this._domNode.domNode.replaceChildren(...nodes);
    return renderedLines;
  }
  _renderLine(viewLineNumber) {
    const viewModel = this._context.viewModel;
    const positionLineData = viewModel.getViewLineRenderingData(viewLineNumber);
    const options3 = this._context.configuration.options;
    const fontInfo = options3.get(59 /* fontInfo */);
    const stopRenderingLineAfter = options3.get(133 /* stopRenderingLineAfter */);
    const renderControlCharacters = options3.get(108 /* renderControlCharacters */);
    const fontLigatures = options3.get(60 /* fontLigatures */);
    const disableMonospaceOptimizations = options3.get(40 /* disableMonospaceOptimizations */);
    const lineDecorations = LineDecoration.filter(positionLineData.inlineDecorations, viewLineNumber, positionLineData.minColumn, positionLineData.maxColumn);
    const useMonospaceOptimizations = fontInfo.isMonospace && !disableMonospaceOptimizations;
    const useFontLigatures = fontLigatures !== EditorFontLigatures.OFF;
    let renderWhitespace;
    const experimentalWhitespaceRendering = options3.get(47 /* experimentalWhitespaceRendering */);
    if (experimentalWhitespaceRendering === "off") {
      renderWhitespace = options3.get(113 /* renderWhitespace */);
    } else {
      renderWhitespace = "none";
    }
    const renderLineInput = new RenderLineInput(
      useMonospaceOptimizations,
      fontInfo.canUseHalfwidthRightwardsArrow,
      positionLineData.content,
      positionLineData.continuesWithWrappedLine,
      positionLineData.isBasicASCII,
      positionLineData.containsRTL,
      positionLineData.minColumn - 1,
      positionLineData.tokens,
      lineDecorations,
      positionLineData.tabSize,
      positionLineData.startVisibleColumn,
      fontInfo.spaceWidth,
      fontInfo.middotWidth,
      fontInfo.wsmiddotWidth,
      stopRenderingLineAfter,
      renderWhitespace,
      renderControlCharacters,
      useFontLigatures,
      null,
      null,
      0,
      true
    );
    const htmlBuilder = new StringBuilder(1e4);
    const renderOutput = renderViewLine(renderLineInput, htmlBuilder);
    const html3 = htmlBuilder.build();
    const trustedhtml = ttPolicy?.createHTML(html3) ?? html3;
    const lineHeight = viewModel.viewLayout.getLineHeightForLineNumber(viewLineNumber) + "px";
    const domNode = document.createElement("div");
    domNode.innerHTML = trustedhtml;
    domNode.style.lineHeight = lineHeight;
    domNode.style.height = lineHeight;
    domNode.setAttribute(LINE_NUMBER_ATTRIBUTE, viewLineNumber.toString());
    return new RichRenderedScreenReaderLine(domNode, renderOutput.characterMapping);
  }
  _setSelectionOnScreenReaderContent(context2, renderedLines, viewSelection) {
    const activeDocument = getActiveWindow().document;
    const activeDocumentSelection = activeDocument.getSelection();
    if (!activeDocumentSelection) {
      return;
    }
    const startLineNumber = viewSelection.startLineNumber;
    const endLineNumber = viewSelection.endLineNumber;
    const startRenderedLine = renderedLines.get(startLineNumber);
    const endRenderedLine = renderedLines.get(endLineNumber);
    if (!startRenderedLine || !endRenderedLine) {
      return;
    }
    const viewModel = context2.viewModel;
    const model = viewModel.model;
    const coordinatesConverter = viewModel.coordinatesConverter;
    const startRange = new Range2(startLineNumber, 1, startLineNumber, viewSelection.selectionStartColumn);
    const modelStartRange = coordinatesConverter.convertViewRangeToModelRange(startRange);
    const characterCountForStart = model.getCharacterCountInRange(modelStartRange);
    const endRange = new Range2(endLineNumber, 1, endLineNumber, viewSelection.positionColumn);
    const modelEndRange = coordinatesConverter.convertViewRangeToModelRange(endRange);
    const characterCountForEnd = model.getCharacterCountInRange(modelEndRange);
    const startDomPosition = startRenderedLine.characterMapping.getDomPosition(characterCountForStart);
    const endDomPosition = endRenderedLine.characterMapping.getDomPosition(characterCountForEnd);
    const startDomNode = startRenderedLine.domNode.firstChild;
    const endDomNode = endRenderedLine.domNode.firstChild;
    const startChildren = startDomNode.childNodes;
    const endChildren = endDomNode.childNodes;
    const startNode = startChildren.item(startDomPosition.partIndex);
    const endNode = endChildren.item(endDomPosition.partIndex);
    if (!startNode.firstChild || !endNode.firstChild) {
      return;
    }
    this._setIgnoreSelectionChangeTime("setRange");
    activeDocumentSelection.setBaseAndExtent(
      startNode.firstChild,
      viewSelection.startColumn === 1 ? 0 : startDomPosition.charIndex + 1,
      endNode.firstChild,
      viewSelection.endColumn === 1 ? 0 : endDomPosition.charIndex + 1
    );
  }
  _getScreenReaderContentLineIntervals(primarySelection) {
    return this._strategy.fromEditorSelection(this._context.viewModel, primarySelection, this._accessibilityPageSize);
  }
  _getEditorSelectionFromDomRange() {
    if (!this._renderedLines) {
      return;
    }
    const selection = getActiveWindow().document.getSelection();
    if (!selection) {
      return;
    }
    const rangeCount = selection.rangeCount;
    if (rangeCount === 0) {
      return;
    }
    const range2 = selection.getRangeAt(0);
    const startContainer = range2.startContainer;
    const endContainer = range2.endContainer;
    const startSpanElement = startContainer.parentElement;
    const endSpanElement = endContainer.parentElement;
    if (!startSpanElement || !isHTMLElement(startSpanElement) || !endSpanElement || !isHTMLElement(endSpanElement)) {
      return;
    }
    const startLineDomNode = startSpanElement.parentElement?.parentElement;
    const endLineDomNode = endSpanElement.parentElement?.parentElement;
    if (!startLineDomNode || !endLineDomNode) {
      return;
    }
    const startLineNumberAttribute = startLineDomNode.getAttribute(LINE_NUMBER_ATTRIBUTE);
    const endLineNumberAttribute = endLineDomNode.getAttribute(LINE_NUMBER_ATTRIBUTE);
    if (!startLineNumberAttribute || !endLineNumberAttribute) {
      return;
    }
    const startLineNumber = parseInt(startLineNumberAttribute);
    const endLineNumber = parseInt(endLineNumberAttribute);
    const startMapping = this._renderedLines.get(startLineNumber)?.characterMapping;
    const endMapping = this._renderedLines.get(endLineNumber)?.characterMapping;
    if (!startMapping || !endMapping) {
      return;
    }
    const startColumn = getColumnOfNodeOffset(startMapping, startSpanElement, range2.startOffset);
    const endColumn = getColumnOfNodeOffset(endMapping, endSpanElement, range2.endOffset);
    if (selection.direction === "forward") {
      return new Selection(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
    } else {
      return new Selection(
        endLineNumber,
        endColumn,
        startLineNumber,
        startColumn
      );
    }
  }
};

RichScreenReaderContent = __decorateClass([
  __decorateParam(3, IAccessibilityService)
], RichScreenReaderContent);

var RichRenderedScreenReaderLine = class {
  constructor(domNode, characterMapping) {
    this.domNode = domNode;
    this.characterMapping = characterMapping;
  }
};

var LineInterval = class {
  constructor(startLine, endLine) {
    this.startLine = startLine;
    this.endLine = endLine;
  }
};

var RichScreenReaderState = class _RichScreenReaderState {
  constructor(model, intervals) {
    this.intervals = intervals;
    let value2 = "";
    for (const interval of intervals) {
      for (let lineNumber = interval.startLine; lineNumber <= interval.endLine; lineNumber++) {
        value2 += model.getLineContent(lineNumber) + "\n";
      }
    }
    this.value = value2;
  }
  equals(other) {
    return this.value === other.value;
  }
  static get NULL() {
    const nullModel = {
      getLineContent: () => "",
      getLineCount: () => 1,
      getLineMaxColumn: () => 1,
      getValueInRange: () => "",
      getValueLengthInRange: () => 0,
      modifyPosition: (position2, offset) => position2
    };
    return new _RichScreenReaderState(nullModel, []);
  }
};

var RichPagedScreenReaderStrategy = class {
  constructor() {
  }
  _getPageOfLine(lineNumber, linesPerPage) {
    return Math.floor((lineNumber - 1) / linesPerPage);
  }
  _getRangeForPage(context2, page, linesPerPage) {
    const offset = page * linesPerPage;
    const startLineNumber = offset + 1;
    const endLineNumber = Math.min(offset + linesPerPage, context2.getLineCount());
    return new LineInterval(startLineNumber, endLineNumber);
  }
  fromEditorSelection(context2, viewSelection, linesPerPage) {
    const selectionStartPage = this._getPageOfLine(viewSelection.startLineNumber, linesPerPage);
    const selectionStartPageRange = this._getRangeForPage(context2, selectionStartPage, linesPerPage);
    const selectionEndPage = this._getPageOfLine(viewSelection.endLineNumber, linesPerPage);
    const selectionEndPageRange = this._getRangeForPage(context2, selectionEndPage, linesPerPage);
    const lineIntervals = [{ startLine: selectionStartPageRange.startLine, endLine: selectionStartPageRange.endLine }];
    if (selectionStartPage + 1 < selectionEndPage) {
      lineIntervals.push({ startLine: selectionEndPageRange.startLine, endLine: selectionEndPageRange.endLine });
    }
    return new RichScreenReaderState(context2, lineIntervals);
  }
};
export { ttPolicy, LINE_NUMBER_ATTRIBUTE, RichScreenReaderContent, RichRenderedScreenReaderLine, LineInterval, RichScreenReaderState, RichPagedScreenReaderStrategy };
