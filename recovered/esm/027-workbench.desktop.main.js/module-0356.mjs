// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/textArea/textAreaEditContext.ts
import { Position } from "./module-0079.mjs";
import { isAndroid2, isChrome2, isFirefox2, isSafari2 } from "./module-0018.mjs";
import { AbstractEditContext } from "./module-0353.mjs";
import { Selection } from "./module-0107.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { PartFingerprints } from "./module-0239.mjs";
import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from "./module-0299.mjs";
import { SimplePagedScreenReaderStrategy, ariaLabelForScreenReaderContent, newlinecount } from "./module-0354.mjs";
import { localize } from "./module-0001.mjs";
import { OS, isMacintosh } from "./module-0014.mjs";
import { TextAreaState, _debugComposition } from "./module-0276.mjs";
import { Range2 } from "./module-0106.mjs";
import { TextAreaInput, TextAreaWrapper } from "./module-0277.mjs";
import { IME } from "./module-0351.mjs";
import { TextAreaEditContextRegistry } from "./module-0355.mjs";
import { getMapForWordSeparators } from "./module-0122.mjs";
import { isHighSurrogate } from "./module-0030.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { Color } from "./module-0197.mjs";
import { Margin } from "./module-0304.mjs";
import { LineNumbersOverlay } from "./module-0298.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { $ } from "./module-0075.mjs";


// src/vs/editor/browser/controller/editContext/textArea/textAreaEditContext.ts
var VisibleTextAreaData = class {
  constructor(_context, modelLineNumber, distanceToModelLineStart, widthOfHiddenLineTextBefore, distanceToModelLineEnd) {
    this._context = _context;
    this.modelLineNumber = modelLineNumber;
    this.distanceToModelLineStart = distanceToModelLineStart;
    this.widthOfHiddenLineTextBefore = widthOfHiddenLineTextBefore;
    this.distanceToModelLineEnd = distanceToModelLineEnd;
    this._visibleTextAreaBrand = void 0;
    this.startPosition = null;
    this.endPosition = null;
    this.visibleTextareaStart = null;
    this.visibleTextareaEnd = null;
    /**
     * When doing composition, the currently composed text might be split up into
     * multiple tokens, then merged again into a single token, etc. Here we attempt
     * to keep the presentation of the <textarea> stable by using the previous used
     * style if multiple tokens come into play. This avoids flickering.
     */
    this._previousPresentation = null;
  }
  prepareRender(visibleRangeProvider) {
    const startModelPosition = new Position(this.modelLineNumber, this.distanceToModelLineStart + 1);
    const endModelPosition = new Position(this.modelLineNumber, this._context.viewModel.model.getLineMaxColumn(this.modelLineNumber) - this.distanceToModelLineEnd);
    this.startPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(startModelPosition);
    this.endPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(endModelPosition);
    if (this.startPosition.lineNumber === this.endPosition.lineNumber) {
      this.visibleTextareaStart = visibleRangeProvider.visibleRangeForPosition(this.startPosition);
      this.visibleTextareaEnd = visibleRangeProvider.visibleRangeForPosition(this.endPosition);
    } else {
      this.visibleTextareaStart = null;
      this.visibleTextareaEnd = null;
    }
  }
  definePresentation(tokenPresentation) {
    if (!this._previousPresentation) {
      if (tokenPresentation) {
        this._previousPresentation = tokenPresentation;
      } else {
        this._previousPresentation = {
          foreground: 1 /* DefaultForeground */,
          italic: false,
          bold: false,
          underline: false,
          strikethrough: false
        };
      }
    }
    return this._previousPresentation;
  }
};

var canUseZeroSizeTextarea = isFirefox2;

var TextAreaEditContext = class extends AbstractEditContext {
  constructor(ownerID, context2, overflowGuardContainer, viewController, visibleRangeProvider, _keybindingService, _instantiationService) {
    super(context2);
    this._keybindingService = _keybindingService;
    this._instantiationService = _instantiationService;
    this._primaryCursorPosition = new Position(1, 1);
    this._primaryCursorVisibleRange = null;
    this._viewController = viewController;
    this._visibleRangeProvider = visibleRangeProvider;
    this._scrollLeft = 0;
    this._scrollTop = 0;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._setAccessibilityOptions(options3);
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._contentHeight = layoutInfo.height;
    this._fontInfo = options3.get(59 /* fontInfo */);
    this._emptySelectionClipboard = options3.get(45 /* emptySelectionClipboard */);
    this._visibleTextArea = null;
    this._selections = [new Selection(1, 1, 1, 1)];
    this._modelSelections = [new Selection(1, 1, 1, 1)];
    this._lastRenderPosition = null;
    this.textArea = createFastDomNode(document.createElement("textarea"));
    PartFingerprints.write(this.textArea, 7 /* TextArea */);
    this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
    this.textArea.setAttribute("wrap", this._textAreaWrapping && !this._visibleTextArea ? "on" : "off");
    const { tabSize } = this._context.viewModel.model.getOptions();
    this.textArea.domNode.style.tabSize = `${tabSize * this._fontInfo.spaceWidth}px`;
    this.textArea.setAttribute("autocorrect", "off");
    this.textArea.setAttribute("autocapitalize", "off");
    this.textArea.setAttribute("autocomplete", "off");
    this.textArea.setAttribute("spellcheck", "false");
    this.textArea.setAttribute("aria-label", ariaLabelForScreenReaderContent(options3, this._keybindingService));
    this.textArea.setAttribute("aria-required", options3.get(9 /* ariaRequired */) ? "true" : "false");
    this.textArea.setAttribute("tabindex", String(options3.get(140 /* tabIndex */)));
    this.textArea.setAttribute("role", "textbox");
    this.textArea.setAttribute("aria-roledescription", localize(180, null));
    this.textArea.setAttribute("aria-multiline", "true");
    this.textArea.setAttribute("aria-autocomplete", options3.get(104 /* readOnly */) ? "none" : "both");
    this._ensureReadOnlyAttribute();
    this.textAreaCover = createFastDomNode(document.createElement("div"));
    this.textAreaCover.setPosition("absolute");
    overflowGuardContainer.appendChild(this.textArea);
    overflowGuardContainer.appendChild(this.textAreaCover);
    const simplePagedScreenReaderStrategy = new SimplePagedScreenReaderStrategy();
    const textAreaInputHost = {
      context: this._context,
      getScreenReaderContent: () => {
        if (this._accessibilitySupport === 1 /* Disabled */) {
          const selection = this._selections[0];
          if (isMacintosh && selection.isEmpty()) {
            const position2 = selection.getStartPosition();
            let textBefore = this._getWordBeforePosition(position2);
            if (textBefore.length === 0) {
              textBefore = this._getCharacterBeforePosition(position2);
            }
            if (textBefore.length > 0) {
              return new TextAreaState(textBefore, textBefore.length, textBefore.length, Range2.fromPositions(position2), 0);
            }
          }
          const LIMIT_CHARS = 500;
          if (isMacintosh && !selection.isEmpty() && this._context.viewModel.getValueLengthInRange(selection, 0 /* TextDefined */) < LIMIT_CHARS) {
            const text2 = this._context.viewModel.getValueInRange(selection, 0 /* TextDefined */);
            return new TextAreaState(text2, 0, text2.length, selection, 0);
          }
          if (isSafari2 && !selection.isEmpty()) {
            const placeholderText = "vscode-placeholder";
            return new TextAreaState(placeholderText, 0, placeholderText.length, null, void 0);
          }
          return TextAreaState.EMPTY;
        }
        if (isAndroid2) {
          const selection = this._selections[0];
          if (selection.isEmpty()) {
            const position2 = selection.getStartPosition();
            const [wordAtPosition, positionOffsetInWord] = this._getAndroidWordAtPosition(position2);
            if (wordAtPosition.length > 0) {
              return new TextAreaState(wordAtPosition, positionOffsetInWord, positionOffsetInWord, Range2.fromPositions(position2), 0);
            }
          }
          return TextAreaState.EMPTY;
        }
        const screenReaderContentState = simplePagedScreenReaderStrategy.fromEditorSelection(this._context.viewModel, this._selections[0], this._accessibilityPageSize, this._accessibilitySupport === 0 /* Unknown */);
        return TextAreaState.fromScreenReaderContentState(screenReaderContentState);
      },
      deduceModelPosition: (viewAnchorPosition, deltaOffset, lineFeedCnt) => {
        return this._context.viewModel.deduceModelPositionRelativeToViewPosition(viewAnchorPosition, deltaOffset, lineFeedCnt);
      }
    };
    const textAreaWrapper = this._register(new TextAreaWrapper(this.textArea.domNode));
    this._textAreaInput = this._register(this._instantiationService.createInstance(TextAreaInput, textAreaInputHost, textAreaWrapper, OS, {
      isAndroid: isAndroid2,
      isChrome: isChrome2,
      isFirefox: isFirefox2,
      isSafari: isSafari2
    }));
    this._register(this._textAreaInput.onWillCopy((e) => this._onWillCopy.fire(e)));
    this._register(this._textAreaInput.onWillCut((e) => this._onWillCut.fire(e)));
    this._register(this._textAreaInput.onWillPaste((e) => this._onWillPaste.fire(e)));
    this._register(this._textAreaInput.onKeyDown((e) => {
      this._viewController.emitKeyDown(e);
    }));
    this._register(this._textAreaInput.onKeyUp((e) => {
      this._viewController.emitKeyUp(e);
    }));
    this._register(this._textAreaInput.onPaste((e) => {
      let pasteOnNewLine = false;
      let multicursorText = null;
      let mode = null;
      if (e.metadata) {
        pasteOnNewLine = this._emptySelectionClipboard && !!e.metadata.isFromEmptySelection;
        multicursorText = typeof e.metadata.multicursorText !== "undefined" ? e.metadata.multicursorText : null;
        mode = e.metadata.mode;
      }
      this._viewController.paste(e.text, pasteOnNewLine, multicursorText, mode);
    }));
    this._register(this._textAreaInput.onCut(() => {
      this._viewController.cut();
    }));
    this._register(this._textAreaInput.onType((e) => {
      if (e.replacePrevCharCnt || e.replaceNextCharCnt || e.positionDelta) {
        if (_debugComposition) {
          console.log(` => compositionType: <<${e.text}>>, ${e.replacePrevCharCnt}, ${e.replaceNextCharCnt}, ${e.positionDelta}`);
        }
        this._viewController.compositionType(e.text, e.replacePrevCharCnt, e.replaceNextCharCnt, e.positionDelta);
      } else {
        if (_debugComposition) {
          console.log(` => type: <<${e.text}>>`);
        }
        this._viewController.type(e.text);
      }
    }));
    this._register(this._textAreaInput.onSelectionChangeRequest((modelSelection) => {
      this._viewController.setSelection(modelSelection);
    }));
    this._register(this._textAreaInput.onCompositionStart((e) => {
      const ta = this.textArea.domNode;
      const modelSelection = this._modelSelections[0];
      const { distanceToModelLineStart, widthOfHiddenTextBefore } = (() => {
        const textBeforeSelection = ta.value.substring(0, Math.min(ta.selectionStart, ta.selectionEnd));
        const lineFeedOffset1 = textBeforeSelection.lastIndexOf("\n");
        const lineTextBeforeSelection = textBeforeSelection.substring(lineFeedOffset1 + 1);
        const tabOffset1 = lineTextBeforeSelection.lastIndexOf("	");
        const desiredVisibleBeforeCharCount = lineTextBeforeSelection.length - tabOffset1 - 1;
        const startModelPosition = modelSelection.getStartPosition();
        const visibleBeforeCharCount = Math.min(startModelPosition.column - 1, desiredVisibleBeforeCharCount);
        const distanceToModelLineStart2 = startModelPosition.column - 1 - visibleBeforeCharCount;
        const hiddenLineTextBefore = lineTextBeforeSelection.substring(0, lineTextBeforeSelection.length - visibleBeforeCharCount);
        const { tabSize: tabSize2 } = this._context.viewModel.model.getOptions();
        const widthOfHiddenTextBefore2 = measureText(this.textArea.domNode.ownerDocument, hiddenLineTextBefore, this._fontInfo, tabSize2);
        return { distanceToModelLineStart: distanceToModelLineStart2, widthOfHiddenTextBefore: widthOfHiddenTextBefore2 };
      })();
      const { distanceToModelLineEnd } = (() => {
        const textAfterSelection = ta.value.substring(Math.max(ta.selectionStart, ta.selectionEnd));
        const lineFeedOffset2 = textAfterSelection.indexOf("\n");
        const lineTextAfterSelection = lineFeedOffset2 === -1 ? textAfterSelection : textAfterSelection.substring(0, lineFeedOffset2);
        const tabOffset2 = lineTextAfterSelection.indexOf("	");
        const desiredVisibleAfterCharCount = tabOffset2 === -1 ? lineTextAfterSelection.length : lineTextAfterSelection.length - tabOffset2 - 1;
        const endModelPosition = modelSelection.getEndPosition();
        const visibleAfterCharCount = Math.min(this._context.viewModel.model.getLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column, desiredVisibleAfterCharCount);
        const distanceToModelLineEnd2 = this._context.viewModel.model.getLineMaxColumn(endModelPosition.lineNumber) - endModelPosition.column - visibleAfterCharCount;
        return { distanceToModelLineEnd: distanceToModelLineEnd2 };
      })();
      this._context.viewModel.revealRange(
        "keyboard",
        true,
        Range2.fromPositions(this._selections[0].getStartPosition()),
        0 /* Simple */,
        1 /* Immediate */
      );
      this._visibleTextArea = new VisibleTextAreaData(
        this._context,
        modelSelection.startLineNumber,
        distanceToModelLineStart,
        widthOfHiddenTextBefore,
        distanceToModelLineEnd
      );
      this.textArea.setAttribute("wrap", this._textAreaWrapping && !this._visibleTextArea ? "on" : "off");
      this._visibleTextArea.prepareRender(this._visibleRangeProvider);
      this._render();
      this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME} ime-input`);
      this._viewController.compositionStart();
      this._context.viewModel.onCompositionStart();
    }));
    this._register(this._textAreaInput.onCompositionUpdate((e) => {
      if (!this._visibleTextArea) {
        return;
      }
      this._visibleTextArea.prepareRender(this._visibleRangeProvider);
      this._render();
    }));
    this._register(this._textAreaInput.onCompositionEnd(() => {
      this._visibleTextArea = null;
      this.textArea.setAttribute("wrap", this._textAreaWrapping && !this._visibleTextArea ? "on" : "off");
      this._render();
      this.textArea.setClassName(`inputarea ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
      this._viewController.compositionEnd();
      this._context.viewModel.onCompositionEnd();
    }));
    this._register(this._textAreaInput.onFocus(() => {
      this._context.viewModel.setHasFocus(true);
    }));
    this._register(this._textAreaInput.onBlur(() => {
      this._context.viewModel.setHasFocus(false);
    }));
    this._register(IME.onDidChange(() => {
      this._ensureReadOnlyAttribute();
    }));
    this._register(TextAreaEditContextRegistry.register(ownerID, this));
  }
  get domNode() {
    return this.textArea;
  }
  writeScreenReaderContent(reason) {
    this._textAreaInput.writeNativeTextAreaContent(reason);
  }
  getTextAreaDomNode() {
    return this.textArea.domNode;
  }
  dispose() {
    super.dispose();
    this.textArea.domNode.remove();
    this.textAreaCover.domNode.remove();
  }
  _getAndroidWordAtPosition(position2) {
    if (position2.lineNumber > this._context.viewModel.getLineCount()) {
      return ["", 0];
    }
    const ANDROID_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:",.<>/?';
    const lineContent = this._context.viewModel.getLineContent(position2.lineNumber);
    const wordSeparators2 = getMapForWordSeparators(ANDROID_WORD_SEPARATORS, []);
    let goingLeft = true;
    let startColumn = position2.column;
    let goingRight = true;
    let endColumn = position2.column;
    let distance = 0;
    while (distance < 50 && (goingLeft || goingRight)) {
      if (goingLeft && startColumn <= 1) {
        goingLeft = false;
      }
      if (goingLeft) {
        const charCode = lineContent.charCodeAt(startColumn - 2);
        const charClass = wordSeparators2.get(charCode);
        if (charClass !== 0 /* Regular */) {
          goingLeft = false;
        } else {
          startColumn--;
        }
      }
      if (goingRight && endColumn > lineContent.length) {
        goingRight = false;
      }
      if (goingRight) {
        const charCode = lineContent.charCodeAt(endColumn - 1);
        const charClass = wordSeparators2.get(charCode);
        if (charClass !== 0 /* Regular */) {
          goingRight = false;
        } else {
          endColumn++;
        }
      }
      distance++;
    }
    return [lineContent.substring(startColumn - 1, endColumn - 1), position2.column - startColumn];
  }
  _getWordBeforePosition(position2) {
    if (position2.lineNumber > this._context.viewModel.getLineCount()) {
      return "";
    }
    const lineContent = this._context.viewModel.getLineContent(position2.lineNumber);
    const wordSeparators2 = getMapForWordSeparators(this._context.configuration.options.get(148 /* wordSeparators */), []);
    let column = position2.column;
    let distance = 0;
    while (column > 1) {
      const charCode = lineContent.charCodeAt(column - 2);
      const charClass = wordSeparators2.get(charCode);
      if (charClass !== 0 /* Regular */ || distance > 50) {
        return lineContent.substring(column - 1, position2.column - 1);
      }
      distance++;
      column--;
    }
    return lineContent.substring(0, position2.column - 1);
  }
  _getCharacterBeforePosition(position2) {
    if (position2.column > 1) {
      if (position2.lineNumber > this._context.viewModel.getLineCount()) {
        return "";
      }
      const lineContent = this._context.viewModel.getLineContent(position2.lineNumber);
      const charBefore = lineContent.charAt(position2.column - 2);
      if (!isHighSurrogate(charBefore.charCodeAt(0))) {
        return charBefore;
      }
    }
    return "";
  }
  _setAccessibilityOptions(options3) {
    this._accessibilitySupport = options3.get(2 /* accessibilitySupport */);
    const accessibilityPageSize = options3.get(3 /* accessibilityPageSize */);
    if (this._accessibilitySupport === 2 /* Enabled */ && accessibilityPageSize === EditorOptions.accessibilityPageSize.defaultValue) {
      this._accessibilityPageSize = 500;
    } else {
      this._accessibilityPageSize = accessibilityPageSize;
    }
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const wrappingColumn = layoutInfo.wrappingColumn;
    if (wrappingColumn !== -1 && this._accessibilitySupport !== 1 /* Disabled */) {
      const fontInfo = options3.get(59 /* fontInfo */);
      this._textAreaWrapping = true;
      this._textAreaWidth = Math.round(wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
    } else {
      this._textAreaWrapping = false;
      this._textAreaWidth = canUseZeroSizeTextarea ? 0 : 1;
    }
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._setAccessibilityOptions(options3);
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._contentHeight = layoutInfo.height;
    this._fontInfo = options3.get(59 /* fontInfo */);
    this._emptySelectionClipboard = options3.get(45 /* emptySelectionClipboard */);
    this.textArea.setAttribute("wrap", this._textAreaWrapping && !this._visibleTextArea ? "on" : "off");
    const { tabSize } = this._context.viewModel.model.getOptions();
    this.textArea.domNode.style.tabSize = `${tabSize * this._fontInfo.spaceWidth}px`;
    this.textArea.setAttribute("aria-label", ariaLabelForScreenReaderContent(options3, this._keybindingService));
    this.textArea.setAttribute("aria-required", options3.get(9 /* ariaRequired */) ? "true" : "false");
    this.textArea.setAttribute("tabindex", String(options3.get(140 /* tabIndex */)));
    if (e.hasChanged(41 /* domReadOnly */) || e.hasChanged(104 /* readOnly */)) {
      this._ensureReadOnlyAttribute();
    }
    if (e.hasChanged(2 /* accessibilitySupport */)) {
      this._textAreaInput.writeNativeTextAreaContent("strategy changed");
    }
    return true;
  }
  onCursorStateChanged(e) {
    this._selections = e.selections.slice(0);
    this._modelSelections = e.modelSelections.slice(0);
    this._textAreaInput.writeNativeTextAreaContent("selection changed");
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    this._scrollLeft = e.scrollLeft;
    this._scrollTop = e.scrollTop;
    return true;
  }
  onZonesChanged(e) {
    return true;
  }
  // --- end event handlers
  // --- begin view API
  isFocused() {
    return this._textAreaInput.isFocused();
  }
  focus() {
    this._textAreaInput.focusTextArea();
  }
  refreshFocusState() {
    this._textAreaInput.refreshFocusState();
  }
  getLastRenderData() {
    return this._lastRenderPosition;
  }
  setAriaOptions(options3) {
    if (options3.activeDescendant) {
      this.textArea.setAttribute("aria-haspopup", "true");
      this.textArea.setAttribute("aria-autocomplete", "list");
      this.textArea.setAttribute("aria-activedescendant", options3.activeDescendant);
    } else {
      this.textArea.setAttribute("aria-haspopup", "false");
      this.textArea.setAttribute("aria-autocomplete", "both");
      this.textArea.removeAttribute("aria-activedescendant");
    }
    if (options3.role) {
      this.textArea.setAttribute("role", options3.role);
    }
  }
  // --- end view API
  _ensureReadOnlyAttribute() {
    const options3 = this._context.configuration.options;
    const useReadOnly = !IME.enabled || options3.get(41 /* domReadOnly */) && options3.get(104 /* readOnly */);
    if (useReadOnly) {
      this.textArea.setAttribute("readonly", "true");
    } else {
      this.textArea.removeAttribute("readonly");
    }
  }
  prepareRender(ctx) {
    this._primaryCursorPosition = new Position(this._selections[0].positionLineNumber, this._selections[0].positionColumn);
    this._primaryCursorVisibleRange = ctx.visibleRangeForPosition(this._primaryCursorPosition);
    this._visibleTextArea?.prepareRender(ctx);
  }
  render(ctx) {
    this._textAreaInput.writeNativeTextAreaContent("render");
    this._render();
  }
  _render() {
    if (this._visibleTextArea) {
      const visibleStart = this._visibleTextArea.visibleTextareaStart;
      const visibleEnd = this._visibleTextArea.visibleTextareaEnd;
      const startPosition = this._visibleTextArea.startPosition;
      const endPosition = this._visibleTextArea.endPosition;
      if (startPosition && endPosition && visibleStart && visibleEnd && visibleEnd.left >= this._scrollLeft && visibleStart.left <= this._scrollLeft + this._contentWidth) {
        const top3 = this._context.viewLayout.getVerticalOffsetForLineNumber(this._primaryCursorPosition.lineNumber) - this._scrollTop;
        const lineCount = newlinecount(this.textArea.domNode.value.substr(0, this.textArea.domNode.selectionStart));
        let scrollLeft = this._visibleTextArea.widthOfHiddenLineTextBefore;
        let left2 = this._contentLeft + visibleStart.left - this._scrollLeft;
        let width2 = visibleEnd.left - visibleStart.left + 1;
        if (left2 < this._contentLeft) {
          const delta2 = this._contentLeft - left2;
          left2 += delta2;
          scrollLeft += delta2;
          width2 -= delta2;
        }
        if (width2 > this._contentWidth) {
          width2 = this._contentWidth;
        }
        const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(startPosition.lineNumber);
        const fontSize = this._context.viewModel.getFontSizeAtPosition(this._primaryCursorPosition);
        const viewLineData = this._context.viewModel.getViewLineData(startPosition.lineNumber);
        const startTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(startPosition.column - 1);
        const endTokenIndex = viewLineData.tokens.findTokenIndexAtOffset(endPosition.column - 1);
        const textareaSpansSingleToken = startTokenIndex === endTokenIndex;
        const presentation2 = this._visibleTextArea.definePresentation(
          textareaSpansSingleToken ? viewLineData.tokens.getPresentation(startTokenIndex) : null
        );
        this.textArea.domNode.scrollTop = lineCount * lineHeight;
        this.textArea.domNode.scrollLeft = scrollLeft;
        this._doRender({
          lastRenderPosition: null,
          top: top3,
          left: left2,
          width: width2,
          height: lineHeight,
          useCover: false,
          color: (TokenizationRegistry2.getColorMap() || [])[presentation2.foreground],
          italic: presentation2.italic,
          bold: presentation2.bold,
          underline: presentation2.underline,
          strikethrough: presentation2.strikethrough,
          fontSize
        });
      }
      return;
    }
    if (!this._primaryCursorVisibleRange) {
      this._renderAtTopLeft();
      return;
    }
    const left = this._contentLeft + this._primaryCursorVisibleRange.left - this._scrollLeft;
    if (left < this._contentLeft || left > this._contentLeft + this._contentWidth) {
      this._renderAtTopLeft();
      return;
    }
    const top2 = this._context.viewLayout.getVerticalOffsetForLineNumber(this._selections[0].positionLineNumber) - this._scrollTop;
    if (top2 < 0 || top2 > this._contentHeight) {
      this._renderAtTopLeft();
      return;
    }
    if (isMacintosh || this._accessibilitySupport === 2 /* Enabled */) {
      const lineNumber = this._primaryCursorPosition.lineNumber;
      const lineHeight = this._context.viewLayout.getLineHeightForLineNumber(lineNumber);
      this._doRender({
        lastRenderPosition: this._primaryCursorPosition,
        top: top2,
        left: this._textAreaWrapping ? this._contentLeft : left,
        width: this._textAreaWidth,
        height: lineHeight,
        useCover: false
      });
      this.textArea.domNode.scrollLeft = this._primaryCursorVisibleRange.left;
      const lineCount = this._textAreaInput.textAreaState.newlineCountBeforeSelection ?? newlinecount(this.textArea.domNode.value.substring(0, this.textArea.domNode.selectionStart));
      this.textArea.domNode.scrollTop = lineCount * lineHeight;
      return;
    }
    this._doRender({
      lastRenderPosition: this._primaryCursorPosition,
      top: top2,
      left: this._textAreaWrapping ? this._contentLeft : left,
      width: this._textAreaWidth,
      height: canUseZeroSizeTextarea ? 0 : 1,
      useCover: false
    });
  }
  _renderAtTopLeft() {
    this._doRender({
      lastRenderPosition: null,
      top: 0,
      left: 0,
      width: this._textAreaWidth,
      height: canUseZeroSizeTextarea ? 0 : 1,
      useCover: true
    });
  }
  _doRender(renderData) {
    this._lastRenderPosition = renderData.lastRenderPosition;
    const ta = this.textArea;
    const tac = this.textAreaCover;
    applyFontInfo(ta, this._fontInfo);
    ta.setTop(renderData.top);
    ta.setLeft(renderData.left);
    ta.setWidth(renderData.width);
    ta.setHeight(renderData.height);
    ta.setLineHeight(renderData.height);
    ta.setFontSize(renderData.fontSize ?? this._fontInfo.fontSize);
    ta.setColor(renderData.color ? Color.Format.CSS.formatHex(renderData.color) : "");
    ta.setFontStyle(renderData.italic ? "italic" : "");
    if (renderData.bold) {
      ta.setFontWeight("bold");
    }
    ta.setTextDecoration(`${renderData.underline ? " underline" : ""}${renderData.strikethrough ? " line-through" : ""}`);
    tac.setTop(renderData.useCover ? renderData.top : 0);
    tac.setLeft(renderData.useCover ? renderData.left : 0);
    tac.setWidth(renderData.useCover ? renderData.width : 0);
    tac.setHeight(renderData.useCover ? renderData.height : 0);
    const options3 = this._context.configuration.options;
    if (options3.get(66 /* glyphMargin */)) {
      tac.setClassName("monaco-editor-background textAreaCover " + Margin.OUTER_CLASS_NAME);
    } else {
      if (options3.get(76 /* lineNumbers */).renderType !== 0 /* Off */) {
        tac.setClassName("monaco-editor-background textAreaCover " + LineNumbersOverlay.CLASS_NAME);
      } else {
        tac.setClassName("monaco-editor-background textAreaCover");
      }
    }
  }
};

TextAreaEditContext = __decorateClass([
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IInstantiationService)
], TextAreaEditContext);

function measureText(targetDocument, text2, fontInfo, tabSize) {
  if (text2.length === 0) {
    return 0;
  }
  const container3 = $("div");
  container3.style.position = "absolute";
  container3.style.top = "-50000px";
  container3.style.width = "50000px";
  const regularDomNode = $("span");
  applyFontInfo(regularDomNode, fontInfo);
  regularDomNode.style.whiteSpace = "pre";
  regularDomNode.style.tabSize = `${tabSize * fontInfo.spaceWidth}px`;
  regularDomNode.append(text2);
  container3.appendChild(regularDomNode);
  targetDocument.body.appendChild(container3);
  const res = regularDomNode.offsetWidth;
  container3.remove();
  return res;
}
export { measureText, VisibleTextAreaData, canUseZeroSizeTextarea, TextAreaEditContext };
