// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/stickyScroll/browser/stickyScrollController.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { StickyScrollWidget2, StickyScrollWidgetState } from "./module-0766.mjs";
import { StickyLineCandidateProvider } from "./module-0769.mjs";
import { EventType, addDisposableListener, addStandardDisposableListener, getWindow, isHTMLElement, trackFocus } from "./module-0075.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Range2 } from "./module-0106.mjs";
import { ClickLinkGesture } from "./module-0619.mjs";
import { Position } from "./module-0079.mjs";
import { mainWindow } from "./module-0002.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { getDefinitionsAtPosition } from "./module-0646.mjs";
import { goToDefinitionWithLocation } from "./module-0648.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { MenuId } from "./module-0092.mjs";
import { toggleCollapseState } from "./module-0679.mjs";
import { FoldingController } from "./module-0684.mjs";
import { StickyRange } from "./module-0767.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { ILanguageFeatureDebounceService } from "./module-0572.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/editor/contrib/stickyScroll/browser/stickyScrollController.ts
var StickyScrollController2 = class extends Disposable {
  constructor(_editor, _contextMenuService, _languageFeaturesService, _instaService, _languageConfigurationService, _languageFeatureDebounceService, _contextKeyService) {
    super();
    this._editor = _editor;
    this._contextMenuService = _contextMenuService;
    this._languageFeaturesService = _languageFeaturesService;
    this._instaService = _instaService;
    this._contextKeyService = _contextKeyService;
    this._sessionStore = new DisposableStore();
    this._maxStickyLines = Number.MAX_SAFE_INTEGER;
    this._candidateDefinitionsLength = -1;
    this._focusedStickyElementIndex = -1;
    this._enabled = false;
    this._focused = false;
    this._positionRevealed = false;
    this._onMouseDown = false;
    this._endLineNumbers = [];
    this._mouseTarget = null;
    this._onDidChangeStickyScrollHeight = this._register(new Emitter());
    this.onDidChangeStickyScrollHeight = this._onDidChangeStickyScrollHeight.event;
    this._stickyScrollWidget = new StickyScrollWidget2(this._editor);
    this._stickyLineCandidateProvider = new StickyLineCandidateProvider(this._editor, _languageFeaturesService, _languageConfigurationService);
    this._register(this._stickyScrollWidget);
    this._register(this._stickyLineCandidateProvider);
    this._widgetState = StickyScrollWidgetState.Empty;
    const stickyScrollDomNode = this._stickyScrollWidget.getDomNode();
    this._register(this._editor.onDidChangeLineHeight((e) => {
      e.changes.forEach((change) => {
        const lineNumber = change.lineNumber;
        if (this._widgetState.startLineNumbers.includes(lineNumber)) {
          this._renderStickyScroll(lineNumber);
        }
      });
    }));
    this._register(this._editor.onDidChangeFont((e) => {
      e.changes.forEach((change) => {
        const lineNumber = change.lineNumber;
        if (this._widgetState.startLineNumbers.includes(lineNumber)) {
          this._renderStickyScroll(lineNumber);
        }
      });
    }));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      this._readConfigurationChange(e);
    }));
    this._register(addDisposableListener(stickyScrollDomNode, EventType.CONTEXT_MENU, async (event) => {
      this._onContextMenu(getWindow(stickyScrollDomNode), event);
    }));
    this._stickyScrollFocusedContextKey = EditorContextKeys.stickyScrollFocused.bindTo(this._contextKeyService);
    this._stickyScrollVisibleContextKey = EditorContextKeys.stickyScrollVisible.bindTo(this._contextKeyService);
    const focusTracker = this._register(trackFocus(stickyScrollDomNode));
    this._register(focusTracker.onDidBlur((_) => {
      if (this._positionRevealed === false && stickyScrollDomNode.clientHeight === 0) {
        this._focusedStickyElementIndex = -1;
        this.focus();
      } else {
        this._disposeFocusStickyScrollStore();
      }
    }));
    this._register(focusTracker.onDidFocus((_) => {
      this.focus();
    }));
    this._registerMouseListeners();
    this._register(addDisposableListener(stickyScrollDomNode, EventType.MOUSE_DOWN, (e) => {
      this._onMouseDown = true;
    }));
    this._register(this._stickyScrollWidget.onDidChangeStickyScrollHeight((e) => {
      this._onDidChangeStickyScrollHeight.fire(e);
    }));
    this._onDidResize();
    this._readConfiguration();
  }
  static {
    this.ID = "store.contrib.stickyScrollController";
  }
  get stickyScrollCandidateProvider() {
    return this._stickyLineCandidateProvider;
  }
  get stickyScrollWidgetState() {
    return this._widgetState;
  }
  get stickyScrollWidgetHeight() {
    return this._stickyScrollWidget.height;
  }
  static get(editor) {
    return editor.getContribution(StickyScrollController2.ID);
  }
  _disposeFocusStickyScrollStore() {
    this._stickyScrollFocusedContextKey.set(false);
    this._focusDisposableStore?.dispose();
    this._focused = false;
    this._positionRevealed = false;
    this._onMouseDown = false;
  }
  isFocused() {
    return this._focused;
  }
  focus() {
    if (this._onMouseDown) {
      this._onMouseDown = false;
      this._editor.focus();
      return;
    }
    const focusState = this._stickyScrollFocusedContextKey.get();
    if (focusState === true) {
      return;
    }
    this._focused = true;
    this._focusDisposableStore = new DisposableStore();
    this._stickyScrollFocusedContextKey.set(true);
    this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumbers.length - 1;
    this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
  }
  focusNext() {
    if (this._focusedStickyElementIndex < this._stickyScrollWidget.lineNumberCount - 1) {
      this._focusNav(true);
    }
  }
  focusPrevious() {
    if (this._focusedStickyElementIndex > 0) {
      this._focusNav(false);
    }
  }
  selectEditor() {
    this._editor.focus();
  }
  // True is next, false is previous
  _focusNav(direction) {
    this._focusedStickyElementIndex = direction ? this._focusedStickyElementIndex + 1 : this._focusedStickyElementIndex - 1;
    this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
  }
  goToFocused() {
    const lineNumbers = this._stickyScrollWidget.lineNumbers;
    this._disposeFocusStickyScrollStore();
    this._revealPosition({ lineNumber: lineNumbers[this._focusedStickyElementIndex], column: 1 });
  }
  _revealPosition(position2) {
    this._reveaInEditor(position2, () => this._editor.revealPosition(position2));
  }
  _revealLineInCenterIfOutsideViewport(position2) {
    this._reveaInEditor(position2, () => this._editor.revealLineInCenterIfOutsideViewport(position2.lineNumber, 0 /* Smooth */));
  }
  _reveaInEditor(position2, revealFunction) {
    if (this._focused) {
      this._disposeFocusStickyScrollStore();
    }
    this._positionRevealed = true;
    revealFunction();
    this._editor.setSelection(Range2.fromPositions(position2));
    this._editor.focus();
  }
  _registerMouseListeners() {
    const sessionStore = this._register(new DisposableStore());
    const gesture = this._register(new ClickLinkGesture(this._editor, {
      extractLineNumberFromMouseEvent: (e) => {
        const position2 = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
        return position2 ? position2.lineNumber : 0;
      }
    }));
    const getMouseEventTarget = (mouseEvent) => {
      if (!this._editor.hasModel()) {
        return null;
      }
      if (mouseEvent.target.type !== 12 /* OVERLAY_WIDGET */ || mouseEvent.target.detail !== this._stickyScrollWidget.getId()) {
        return null;
      }
      const mouseTargetElement = mouseEvent.target.element;
      if (!mouseTargetElement || mouseTargetElement.innerText !== mouseTargetElement.innerHTML) {
        return null;
      }
      const position2 = this._stickyScrollWidget.getEditorPositionFromNode(mouseTargetElement);
      if (!position2) {
        return null;
      }
      return {
        range: new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + mouseTargetElement.innerText.length),
        textElement: mouseTargetElement
      };
    };
    const stickyScrollWidgetDomNode = this._stickyScrollWidget.getDomNode();
    this._register(addStandardDisposableListener(stickyScrollWidgetDomNode, EventType.CLICK, (mouseEvent) => {
      if (mouseEvent.ctrlKey || mouseEvent.altKey || mouseEvent.metaKey) {
        return;
      }
      if (!mouseEvent.leftButton) {
        return;
      }
      if (mouseEvent.shiftKey) {
        const lineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(mouseEvent.target);
        if (lineIndex === null) {
          return;
        }
        const position3 = new Position(this._endLineNumbers[lineIndex], 1);
        this._revealLineInCenterIfOutsideViewport(position3);
        return;
      }
      const isInFoldingIconDomNode = this._stickyScrollWidget.isInFoldingIconDomNode(mouseEvent.target);
      if (isInFoldingIconDomNode) {
        const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
        this._toggleFoldingRegionForLine(lineNumber);
        return;
      }
      const isInStickyLine = this._stickyScrollWidget.isInStickyLine(mouseEvent.target);
      if (!isInStickyLine) {
        return;
      }
      let position2 = this._stickyScrollWidget.getEditorPositionFromNode(mouseEvent.target);
      if (!position2) {
        const lineNumber = this._stickyScrollWidget.getLineNumberFromChildDomNode(mouseEvent.target);
        if (lineNumber === null) {
          return;
        }
        position2 = new Position(lineNumber, 1);
      }
      this._revealPosition(position2);
    }));
    this._register(addDisposableListener(mainWindow, EventType.MOUSE_MOVE, (mouseEvent) => {
      this._mouseTarget = mouseEvent.target;
      this._onMouseMoveOrKeyDown(mouseEvent);
    }));
    this._register(addDisposableListener(mainWindow, EventType.KEY_DOWN, (mouseEvent) => {
      this._onMouseMoveOrKeyDown(mouseEvent);
    }));
    this._register(addDisposableListener(mainWindow, EventType.KEY_UP, () => {
      if (this._showEndForLine !== void 0) {
        this._showEndForLine = void 0;
        this._renderStickyScroll();
      }
    }));
    this._register(gesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, _keyboardEvent]) => {
      const mouseTarget = getMouseEventTarget(mouseEvent);
      if (!mouseTarget || !mouseEvent.hasTriggerModifier || !this._editor.hasModel()) {
        sessionStore.clear();
        return;
      }
      const { range: range2, textElement } = mouseTarget;
      if (!range2.equalsRange(this._stickyRangeProjectedOnEditor)) {
        this._stickyRangeProjectedOnEditor = range2;
        sessionStore.clear();
      } else if (textElement.style.textDecoration === "underline") {
        return;
      }
      const cancellationToken = new CancellationTokenSource();
      sessionStore.add(toDisposable(() => cancellationToken.dispose(true)));
      let currentHTMLChild;
      getDefinitionsAtPosition(this._languageFeaturesService.definitionProvider, this._editor.getModel(), new Position(range2.startLineNumber, range2.startColumn + 1), false, cancellationToken.token).then(((candidateDefinitions) => {
        if (cancellationToken.token.isCancellationRequested) {
          return;
        }
        if (candidateDefinitions.length !== 0) {
          this._candidateDefinitionsLength = candidateDefinitions.length;
          const childHTML = textElement;
          if (currentHTMLChild !== childHTML) {
            sessionStore.clear();
            currentHTMLChild = childHTML;
            currentHTMLChild.style.textDecoration = "underline";
            sessionStore.add(toDisposable(() => {
              currentHTMLChild.style.textDecoration = "none";
            }));
          } else if (!currentHTMLChild) {
            currentHTMLChild = childHTML;
            currentHTMLChild.style.textDecoration = "underline";
            sessionStore.add(toDisposable(() => {
              currentHTMLChild.style.textDecoration = "none";
            }));
          }
        } else {
          sessionStore.clear();
        }
      }));
    }));
    this._register(gesture.onCancel(() => {
      sessionStore.clear();
    }));
    this._register(gesture.onExecute(async (e) => {
      if (e.target.type !== 12 /* OVERLAY_WIDGET */ || e.target.detail !== this._stickyScrollWidget.getId()) {
        return;
      }
      const position2 = this._stickyScrollWidget.getEditorPositionFromNode(e.target.element);
      if (!position2) {
        return;
      }
      if (!this._editor.hasModel() || !this._stickyRangeProjectedOnEditor) {
        return;
      }
      if (this._candidateDefinitionsLength > 1) {
        if (this._focused) {
          this._disposeFocusStickyScrollStore();
        }
        this._revealPosition({ lineNumber: position2.lineNumber, column: 1 });
      }
      this._instaService.invokeFunction(goToDefinitionWithLocation, e, this._editor, { uri: this._editor.getModel().uri, range: this._stickyRangeProjectedOnEditor });
    }));
  }
  _onContextMenu(targetWindow, e) {
    const event = new StandardMouseEvent(targetWindow, e);
    this._contextMenuService.showContextMenu({
      menuId: MenuId.StickyScrollContext,
      getAnchor: () => event,
      menuActionOptions: { renderShortTitle: true }
    });
  }
  _onMouseMoveOrKeyDown(mouseEvent) {
    if (!mouseEvent.shiftKey) {
      return;
    }
    if (!this._mouseTarget || !isHTMLElement(this._mouseTarget)) {
      return;
    }
    const currentEndForLineIndex = this._stickyScrollWidget.getLineIndexFromChildDomNode(this._mouseTarget);
    if (currentEndForLineIndex === null || this._showEndForLine === currentEndForLineIndex) {
      return;
    }
    this._showEndForLine = currentEndForLineIndex;
    this._renderStickyScroll();
  }
  _toggleFoldingRegionForLine(line) {
    if (!this._foldingModel || line === null) {
      return;
    }
    const stickyLine = this._stickyScrollWidget.getRenderedStickyLine(line);
    const foldingIcon = stickyLine?.foldingIcon;
    if (!foldingIcon) {
      return;
    }
    toggleCollapseState(this._foldingModel, 1, [line]);
    foldingIcon.isCollapsed = !foldingIcon.isCollapsed;
    const scrollTop = (foldingIcon.isCollapsed ? this._editor.getTopForLineNumber(foldingIcon.foldingEndLine) : this._editor.getTopForLineNumber(foldingIcon.foldingStartLine)) - this._editor.getOption(75 /* lineHeight */) * stickyLine.index + 1;
    this._editor.setScrollTop(scrollTop);
    this._renderStickyScroll(line);
  }
  _readConfiguration() {
    const options3 = this._editor.getOption(131 /* stickyScroll */);
    if (options3.enabled === false) {
      this._editor.removeOverlayWidget(this._stickyScrollWidget);
      this._resetState();
      this._sessionStore.clear();
      this._enabled = false;
      return;
    } else if (options3.enabled && !this._enabled) {
      this._editor.addOverlayWidget(this._stickyScrollWidget);
      this._sessionStore.add(this._editor.onDidScrollChange((e) => {
        if (e.scrollTopChanged) {
          this._showEndForLine = void 0;
          this._renderStickyScroll();
        }
      }));
      this._sessionStore.add(this._editor.onDidLayoutChange(() => this._onDidResize()));
      this._sessionStore.add(this._editor.onDidChangeModelTokens((e) => this._onTokensChange(e)));
      this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(() => {
        this._showEndForLine = void 0;
        this._renderStickyScroll();
      }));
      this._enabled = true;
    }
    const lineNumberOption = this._editor.getOption(76 /* lineNumbers */);
    if (lineNumberOption.renderType === 2 /* Relative */) {
      if (!this._cursorPositionListener) {
        this._cursorPositionListener = this._editor.onDidChangeCursorPosition((e) => {
          if (this._positionLineNumber === e.position.lineNumber) {
            return;
          }
          this._positionLineNumber = e.position.lineNumber;
          this._showEndForLine = void 0;
          this._renderStickyScroll(0);
        });
        this._sessionStore.add(this._cursorPositionListener);
      }
    } else if (this._cursorPositionListener) {
      this._sessionStore.delete(this._cursorPositionListener);
      this._cursorPositionListener.dispose();
      this._cursorPositionListener = void 0;
    }
  }
  _readConfigurationChange(event) {
    if (event.hasChanged(131 /* stickyScroll */) || event.hasChanged(81 /* minimap */) || event.hasChanged(75 /* lineHeight */) || event.hasChanged(126 /* showFoldingControls */) || event.hasChanged(76 /* lineNumbers */)) {
      this._readConfiguration();
    }
    if (event.hasChanged(76 /* lineNumbers */) || event.hasChanged(52 /* folding */) || event.hasChanged(126 /* showFoldingControls */)) {
      this._renderStickyScroll(0);
    }
  }
  _needsUpdate(event) {
    const stickyLineNumbers = this._stickyScrollWidget.getCurrentLines();
    for (const stickyLineNumber of stickyLineNumbers) {
      for (const range2 of event.ranges) {
        if (stickyLineNumber >= range2.fromLineNumber && stickyLineNumber <= range2.toLineNumber) {
          return true;
        }
      }
    }
    return false;
  }
  _onTokensChange(event) {
    if (this._needsUpdate(event)) {
      this._renderStickyScroll(0);
    }
  }
  _onDidResize() {
    const layoutInfo = this._editor.getLayoutInfo();
    const theoreticalLines = layoutInfo.height / this._editor.getOption(75 /* lineHeight */);
    this._maxStickyLines = Math.round(theoreticalLines * 0.25);
    this._renderStickyScroll(0);
  }
  async _renderStickyScroll(rebuildFromLine) {
    const model = this._editor.getModel();
    if (!model || model.isTooLargeForTokenization()) {
      this._resetState();
      return;
    }
    const nextRebuildFromLine = this._updateAndGetMinRebuildFromLine(rebuildFromLine);
    const stickyWidgetVersion = this._stickyLineCandidateProvider.getVersionId();
    const shouldUpdateState = stickyWidgetVersion === void 0 || stickyWidgetVersion === model.getVersionId();
    if (shouldUpdateState) {
      if (!this._focused) {
        await this._updateState(nextRebuildFromLine);
      } else {
        if (this._focusedStickyElementIndex === -1) {
          await this._updateState(nextRebuildFromLine);
          this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
          if (this._focusedStickyElementIndex !== -1) {
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
          }
        } else {
          const focusedStickyElementLineNumber = this._stickyScrollWidget.lineNumbers[this._focusedStickyElementIndex];
          await this._updateState(nextRebuildFromLine);
          if (this._stickyScrollWidget.lineNumberCount === 0) {
            this._focusedStickyElementIndex = -1;
          } else {
            const previousFocusedLineNumberExists = this._stickyScrollWidget.lineNumbers.includes(focusedStickyElementLineNumber);
            if (!previousFocusedLineNumberExists) {
              this._focusedStickyElementIndex = this._stickyScrollWidget.lineNumberCount - 1;
            }
            this._stickyScrollWidget.focusLineWithIndex(this._focusedStickyElementIndex);
          }
        }
      }
    }
  }
  _updateAndGetMinRebuildFromLine(rebuildFromLine) {
    if (rebuildFromLine !== void 0) {
      const minRebuildFromLineOrInfinity = this._minRebuildFromLine !== void 0 ? this._minRebuildFromLine : Infinity;
      this._minRebuildFromLine = Math.min(rebuildFromLine, minRebuildFromLineOrInfinity);
    }
    return this._minRebuildFromLine;
  }
  async _updateState(rebuildFromLine) {
    this._minRebuildFromLine = void 0;
    this._foldingModel = await FoldingController.get(this._editor)?.getFoldingModel() ?? void 0;
    this._widgetState = this.findScrollWidgetState();
    const stickyWidgetHasLines = this._widgetState.startLineNumbers.length > 0;
    this._stickyScrollVisibleContextKey.set(stickyWidgetHasLines);
    this._stickyScrollWidget.setState(this._widgetState, this._foldingModel, rebuildFromLine);
  }
  async _resetState() {
    this._minRebuildFromLine = void 0;
    this._foldingModel = void 0;
    this._widgetState = StickyScrollWidgetState.Empty;
    this._stickyScrollVisibleContextKey.set(false);
    this._stickyScrollWidget.setState(void 0, void 0);
  }
  findScrollWidgetState() {
    const maxNumberStickyLines = Math.min(this._maxStickyLines, this._editor.getOption(131 /* stickyScroll */).maxLineCount);
    const scrollTop = this._editor.getScrollTop();
    let lastLineRelativePosition = 0;
    const startLineNumbers = [];
    const endLineNumbers = [];
    const arrayVisibleRanges = this._editor.getVisibleRanges();
    if (arrayVisibleRanges.length !== 0) {
      const fullVisibleRange = new StickyRange(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
      const candidateRanges = this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(fullVisibleRange);
      for (const range2 of candidateRanges) {
        const start = range2.startLineNumber;
        const end = range2.endLineNumber;
        const topOfElement = range2.top;
        const bottomOfElement = topOfElement + range2.height;
        const topOfBeginningLine = this._editor.getTopForLineNumber(start) - scrollTop;
        const bottomOfEndLine = this._editor.getBottomForLineNumber(end) - scrollTop;
        if (topOfElement > topOfBeginningLine && topOfElement <= bottomOfEndLine) {
          startLineNumbers.push(start);
          endLineNumbers.push(end + 1);
          if (bottomOfElement > bottomOfEndLine) {
            lastLineRelativePosition = bottomOfEndLine - bottomOfElement;
          }
        }
        if (startLineNumbers.length === maxNumberStickyLines) {
          break;
        }
      }
    }
    this._endLineNumbers = endLineNumbers;
    return new StickyScrollWidgetState(startLineNumbers, endLineNumbers, lastLineRelativePosition, this._showEndForLine);
  }
  dispose() {
    super.dispose();
    this._sessionStore.dispose();
  }
};

StickyScrollController2 = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageConfigurationService),
  __decorateParam(5, ILanguageFeatureDebounceService),
  __decorateParam(6, IContextKeyService)
], StickyScrollController2);
export { StickyScrollController2 };
