// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/ghostText/ghostTextView.ts
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { GhostTextReplacement } from "./module-0718.mjs";
import { StringEdit, StringReplacement } from "./module-0193.mjs";
import { LineTokens } from "./module-0145.mjs";
import { TokenWithTextArray } from "./module-0762.mjs";
import { InlineCompletionViewData } from "./module-0727.mjs";
import { equals, sum } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { equalsIfDefinedC, thisEqualsC } from "./module-0042.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { addDisposableListener, getWindow, isHTMLElement, n } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { LineDecoration } from "./module-0245.mjs";
import { RangeSingleLine } from "./module-0761.mjs";
import { ColumnRange } from "./module-0760.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { containsRTL, isBasicASCII } from "./module-0030.mjs";
import { RenderLineInput, renderViewLine } from "./module-0246.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/ghostText/ghostTextView.ts
var GhostTextWidgetWarning = class _GhostTextWidgetWarning {
  constructor(icon2 = Codicon.warning) {
    this.icon = icon2;
  }
  static from(warning) {
    if (!warning) {
      return void 0;
    }
    return new _GhostTextWidgetWarning(warning.icon);
  }
};

var USE_SQUIGGLES_FOR_WARNING = true;

var GHOST_TEXT_CLASS_NAME = "ghost-text";

var GhostTextView = class extends Disposable {
  constructor(_editor, _data, options3, _languageService) {
    super();
    this._editor = _editor;
    this._data = _data;
    this._languageService = _languageService;
    this._isDisposed = observableValue(this, false);
    this._warningState = derived((reader) => {
      const model = this._data.read(reader);
      const warning = model?.warning;
      if (!model || !warning) {
        return void 0;
      }
      const gt2 = model.ghostText;
      return { lineNumber: gt2.lineNumber, position: new Position(gt2.lineNumber, gt2.parts[0].column), icon: warning.icon };
    });
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._nonWhitespaceCount = derived(this, (reader) => {
      const data = this._data.read(reader);
      if (!data) {
        return void 0;
      }
      const ghostText = data.ghostText;
      const allText = ghostText.parts.map((p) => p.lines.map((l) => l.line).join("")).join("");
      return allText.replace(/\s/g, "").length;
    });
    this._extraClassNames = derived(this, (reader) => {
      const extraClasses = this._extraClasses.slice();
      if (USE_SQUIGGLES_FOR_WARNING && this._warningState.read(reader)) {
        extraClasses.push("warning");
      }
      const nonWhitespaceCount = this._nonWhitespaceCount.read(reader);
      if (this._highlightShortText && nonWhitespaceCount && nonWhitespaceCount < 3) {
        extraClasses.push("short-text");
      } else if (this._useSyntaxHighlighting.read(reader)) {
        extraClasses.push("syntax-highlighted");
      }
      const extraClassNames = extraClasses.map((c) => ` ${c}`).join("");
      return extraClassNames;
    });
    this._state = derived(this, (reader) => {
      if (this._isDisposed.read(reader)) {
        return void 0;
      }
      const props = this._data.read(reader);
      if (!props) {
        return void 0;
      }
      const textModel = this._editorObs.model.read(reader);
      if (!textModel) {
        return void 0;
      }
      const ghostText = props.ghostText;
      const replacedRange = ghostText instanceof GhostTextReplacement ? ghostText.columnRange : void 0;
      const syntaxHighlightingEnabled = this._useSyntaxHighlighting.read(reader);
      const extraClassNames = this._extraClassNames.read(reader);
      const { inlineTexts, additionalLines, hiddenRange, additionalLinesOriginalSuffix } = computeGhostTextViewData(ghostText, textModel, GHOST_TEXT_CLASS_NAME + extraClassNames);
      const currentLine = textModel.getLineContent(ghostText.lineNumber);
      const edit3 = new StringEdit(inlineTexts.map((t2) => StringReplacement.insert(t2.column - 1, t2.text)));
      const tokens = syntaxHighlightingEnabled ? textModel.tokenization.tokenizeLinesAt(ghostText.lineNumber, [edit3.apply(currentLine), ...additionalLines.map((l) => l.content)]) : void 0;
      const newRanges = edit3.getNewRanges();
      const inlineTextsWithTokens = inlineTexts.map((t2, idx) => ({ ...t2, tokens: tokens?.[0]?.getTokensInRange(newRanges[idx]) }));
      const tokenizedAdditionalLines = additionalLines.map((l, idx) => {
        let content2 = tokens?.[idx + 1] ?? LineTokens.createEmpty(l.content, this._languageService.languageIdCodec);
        if (idx === additionalLines.length - 1 && additionalLinesOriginalSuffix) {
          const t2 = TokenWithTextArray.fromLineTokens(textModel.tokenization.getLineTokens(additionalLinesOriginalSuffix.lineNumber));
          const existingContent = t2.slice(additionalLinesOriginalSuffix.columnRange.toZeroBasedOffsetRange());
          content2 = TokenWithTextArray.fromLineTokens(content2).append(existingContent).toLineTokens(content2.languageIdCodec);
        }
        return new LineData(
          content2,
          l.decorations
        );
      });
      const cursorColumn = this._editor.getSelection()?.getStartPosition().column;
      const disjointInlineTexts = inlineTextsWithTokens.filter((inline3) => inline3.text !== "");
      const hasInsertionOnCurrentLine = disjointInlineTexts.length !== 0;
      const telemetryViewData = new InlineCompletionViewData(
        (hasInsertionOnCurrentLine ? disjointInlineTexts[0].column : 1) - cursorColumn,
        hasInsertionOnCurrentLine ? 0 : additionalLines.findIndex((line) => line.content !== "") + 1,
        hasInsertionOnCurrentLine ? 1 : 0,
        additionalLines.length + (hasInsertionOnCurrentLine ? 1 : 0),
        0,
        sum(disjointInlineTexts.map((inline3) => inline3.text.length)) + sum(tokenizedAdditionalLines.map((line) => line.content.getTextLength())),
        disjointInlineTexts.length + (additionalLines.length > 0 ? 1 : 0),
        disjointInlineTexts.length > 1 && tokenizedAdditionalLines.length === 0 ? disjointInlineTexts.every((inline3) => inline3.text === disjointInlineTexts[0].text) : void 0
      );
      return {
        replacedRange,
        inlineTexts: inlineTextsWithTokens,
        additionalLines: tokenizedAdditionalLines,
        hiddenRange,
        lineNumber: ghostText.lineNumber,
        additionalReservedLineCount: this._minReservedLineCount.read(reader),
        targetTextModel: textModel,
        syntaxHighlightingEnabled,
        telemetryViewData,
        handleInlineCompletionShown: props.handleInlineCompletionShown
      };
    });
    this._decorations = derived(this, (reader) => {
      const uiState = this._state.read(reader);
      if (!uiState) {
        return [];
      }
      const decorations = [];
      const extraClassNames = this._extraClassNames.read(reader);
      if (uiState.replacedRange) {
        decorations.push({
          range: uiState.replacedRange.toRange(uiState.lineNumber),
          options: { inlineClassName: "inline-completion-text-to-replace" + extraClassNames, description: "GhostTextReplacement" }
        });
      }
      if (uiState.hiddenRange) {
        decorations.push({
          range: uiState.hiddenRange.toRange(uiState.lineNumber),
          options: { inlineClassName: "ghost-text-hidden", description: "ghost-text-hidden" }
        });
      }
      for (const p of uiState.inlineTexts) {
        let inlineExtraClassNames = "";
        if (this._highlightShortText && p.text.length < 5) {
          inlineExtraClassNames += " short-text";
        }
        decorations.push({
          range: Range2.fromPositions(new Position(uiState.lineNumber, p.column)),
          options: {
            description: "ghost-text-decoration",
            after: {
              content: p.text,
              tokens: p.tokens,
              inlineClassName: (p.preview ? "ghost-text-decoration-preview" : "ghost-text-decoration") + (this._isClickable ? " clickable" : "") + extraClassNames + inlineExtraClassNames + p.lineDecorations.map((d) => " " + d.className).join(" "),
              // TODO: take the ranges into account for line decorations
              cursorStops: 2 /* Left */,
              attachedData: new GhostTextAttachedData(this)
            },
            showIfCollapsed: true
          }
        });
      }
      return decorations;
    });
    this.isHovered = derived(this, (reader) => {
      if (this._isDisposed.read(reader)) {
        return false;
      }
      return this._isInlineTextHovered.read(reader) || this._additionalLinesWidget.isHovered.read(reader);
    });
    this.height = derived(this, (reader) => {
      const lineHeight = this._editorObs.getOption(75 /* lineHeight */).read(reader);
      return lineHeight + (this._additionalLinesWidget.viewZoneHeight.read(reader) ?? 0);
    });
    this._extraClasses = options3.extraClasses ?? [];
    this._isClickable = options3.isClickable ?? false;
    this._shouldKeepCursorStable = options3.shouldKeepCursorStable ?? false;
    this._minReservedLineCount = options3.minReservedLineCount ?? constObservable(0);
    this._useSyntaxHighlighting = options3.useSyntaxHighlighting ?? constObservable(true);
    this._highlightShortText = options3.highlightShortSuggestions ?? false;
    this._editorObs = observableCodeEditor(this._editor);
    this._additionalLinesWidget = this._register(
      new AdditionalLinesWidget(
        this._editor,
        derivedOpts({ owner: this, equalsFn: equalsIfDefinedC(thisEqualsC()) }, (reader) => {
          const uiState = this._state.read(reader);
          return uiState ? new AdditionalLinesData(
            uiState.lineNumber,
            uiState.additionalLines,
            uiState.additionalReservedLineCount
          ) : void 0;
        }),
        this._shouldKeepCursorStable,
        this._isClickable
      )
    );
    this._isInlineTextHovered = this._editorObs.isTargetHovered(
      (p) => p.target.type === 6 /* CONTENT_TEXT */ && p.target.detail.injectedText?.options.attachedData instanceof GhostTextAttachedData && p.target.detail.injectedText.options.attachedData.owner === this,
      this._store
    );
    this._register(toDisposable(() => {
      this._isDisposed.set(true, void 0);
    }));
    this._register(this._editorObs.setDecorations(this._decorations));
    if (this._isClickable) {
      this._register(this._additionalLinesWidget.onDidClick((e) => this._onDidClick.fire(e)));
      this._register(this._editor.onMouseUp((e) => {
        if (e.target.type !== 6 /* CONTENT_TEXT */) {
          return;
        }
        const a = e.target.detail.injectedText?.options.attachedData;
        if (a instanceof GhostTextAttachedData && a.owner === this) {
          this._onDidClick.fire(e.event);
        }
      }));
    }
    this._register(autorun((reader) => {
      const state = this._state.read(reader);
      state?.handleInlineCompletionShown(state.telemetryViewData);
    }));
    this._register(autorunWithStore((reader, store) => {
      if (USE_SQUIGGLES_FOR_WARNING) {
        return;
      }
      const state = this._warningState.read(reader);
      if (!state) {
        return;
      }
      const lineHeight = this._editorObs.getOption(75 /* lineHeight */);
      store.add(this._editorObs.createContentWidget({
        position: constObservable({
          position: new Position(state.lineNumber, Number.MAX_SAFE_INTEGER),
          preference: [0 /* EXACT */],
          positionAffinity: 1 /* Right */
        }),
        allowEditorOverflow: false,
        domNode: n.div({
          class: "ghost-text-view-warning-widget",
          style: {
            width: lineHeight,
            height: lineHeight,
            marginLeft: 4,
            color: "orange"
          },
          ref: (dom) => {
            dom.ghostTextViewWarningWidgetData = { range: Range2.fromPositions(state.position) };
          }
        }, [
          n.div(
            {
              class: "ghost-text-view-warning-widget-icon",
              style: {
                width: "100%",
                height: "100%",
                display: "flex",
                alignContent: "center",
                alignItems: "center"
              }
            },
            [renderIcon(state.icon)]
          )
        ]).keepUpdated(store).element
      }));
    }));
  }
  static getWarningWidgetContext(domNode) {
    const data = domNode.ghostTextViewWarningWidgetData;
    if (data) {
      return data;
    } else if (domNode.parentElement) {
      return this.getWarningWidgetContext(domNode.parentElement);
    }
    return void 0;
  }
  ownsViewZone(viewZoneId) {
    return this._additionalLinesWidget.viewZoneId === viewZoneId;
  }
};

GhostTextView = __decorateClass([
  __decorateParam(3, ILanguageService)
], GhostTextView);

var GhostTextAttachedData = class {
  constructor(owner) {
    this.owner = owner;
  }
};

function computeGhostTextViewData(ghostText, textModel, ghostTextClassName) {
  const inlineTexts = [];
  const additionalLines = [];
  function addToAdditionalLines(ghLines, className2) {
    if (additionalLines.length > 0) {
      const lastLine = additionalLines[additionalLines.length - 1];
      if (className2) {
        lastLine.decorations.push(new LineDecoration(
          lastLine.content.length + 1,
          lastLine.content.length + 1 + ghLines[0].line.length,
          className2,
          0 /* Regular */
        ));
      }
      lastLine.content += ghLines[0].line;
      ghLines = ghLines.slice(1);
    }
    for (const ghLine of ghLines) {
      additionalLines.push({
        content: ghLine.line,
        decorations: className2 ? [new LineDecoration(
          1,
          ghLine.line.length + 1,
          className2,
          0 /* Regular */
        ), ...ghLine.lineDecorations] : [...ghLine.lineDecorations]
      });
    }
  }
  const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
  let hiddenTextStartColumn = void 0;
  let lastIdx = 0;
  for (const part of ghostText.parts) {
    let ghLines = part.lines;
    if (hiddenTextStartColumn === void 0) {
      inlineTexts.push({ column: part.column, text: ghLines[0].line, preview: part.preview, lineDecorations: ghLines[0].lineDecorations });
      ghLines = ghLines.slice(1);
    } else {
      addToAdditionalLines([{ line: textBufferLine.substring(lastIdx, part.column - 1), lineDecorations: [] }], void 0);
    }
    if (ghLines.length > 0) {
      addToAdditionalLines(ghLines, ghostTextClassName);
      if (hiddenTextStartColumn === void 0 && part.column <= textBufferLine.length) {
        hiddenTextStartColumn = part.column;
      }
    }
    lastIdx = part.column - 1;
  }
  let additionalLinesOriginalSuffix = void 0;
  if (hiddenTextStartColumn !== void 0) {
    additionalLinesOriginalSuffix = new RangeSingleLine(ghostText.lineNumber, new ColumnRange(lastIdx + 1, textBufferLine.length + 1));
  }
  const hiddenRange = hiddenTextStartColumn !== void 0 ? new ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : void 0;
  return {
    inlineTexts,
    additionalLines,
    hiddenRange,
    additionalLinesOriginalSuffix
  };
}

var AdditionalLinesData = class {
  constructor(lineNumber, additionalLines, minReservedLineCount) {
    this.lineNumber = lineNumber;
    this.additionalLines = additionalLines;
    this.minReservedLineCount = minReservedLineCount;
  }
  equals(other) {
    if (this.lineNumber !== other.lineNumber) {
      return false;
    }
    if (this.minReservedLineCount !== other.minReservedLineCount) {
      return false;
    }
    return equals(this.additionalLines, other.additionalLines, thisEqualsC());
  }
};

var AdditionalLinesWidget = class extends Disposable {
  constructor(_editor, _lines, _shouldKeepCursorStable, _isClickable) {
    super();
    this._editor = _editor;
    this._lines = _lines;
    this._shouldKeepCursorStable = _shouldKeepCursorStable;
    this._isClickable = _isClickable;
    this._viewZoneHeight = observableValue("viewZoneHeight", void 0);
    this.editorOptionsChanged = observableSignalFromEvent("editorOptionChanged", Event2.filter(
      this._editor.onDidChangeConfiguration,
      (e) => e.hasChanged(40 /* disableMonospaceOptimizations */) || e.hasChanged(133 /* stopRenderingLineAfter */) || e.hasChanged(113 /* renderWhitespace */) || e.hasChanged(108 /* renderControlCharacters */) || e.hasChanged(60 /* fontLigatures */) || e.hasChanged(59 /* fontInfo */) || e.hasChanged(75 /* lineHeight */)
    ));
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._viewZoneListener = this._register(new MutableDisposable());
    this.isHovered = observableCodeEditor(this._editor).isTargetHovered(
      (p) => isTargetGhostText(p.target.element),
      this._store
    );
    this.hasBeenAccepted = false;
    if (this._editor instanceof CodeEditorWidget && this._shouldKeepCursorStable) {
      this._register(this._editor.onBeforeExecuteEdit((e) => this.hasBeenAccepted = e.source === "inlineSuggestion.accept"));
    }
    this._register(autorun((reader) => {
      const lines = this._lines.read(reader);
      this.editorOptionsChanged.read(reader);
      if (lines) {
        this.hasBeenAccepted = false;
        this.updateLines(lines.lineNumber, lines.additionalLines, lines.minReservedLineCount);
      } else {
        this.clear();
      }
    }));
  }
  get viewZoneId() {
    return this._viewZoneInfo?.viewZoneId;
  }
  get viewZoneHeight() {
    return this._viewZoneHeight;
  }
  dispose() {
    super.dispose();
    this.clear();
  }
  clear() {
    this._viewZoneListener.clear();
    this._editor.changeViewZones((changeAccessor) => {
      this.removeActiveViewZone(changeAccessor);
    });
  }
  updateLines(lineNumber, additionalLines, minReservedLineCount) {
    const textModel = this._editor.getModel();
    if (!textModel) {
      return;
    }
    const { tabSize } = textModel.getOptions();
    observableCodeEditor(this._editor).transaction((_) => {
      this._editor.changeViewZones((changeAccessor) => {
        const store = new DisposableStore();
        this.removeActiveViewZone(changeAccessor);
        const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
        if (heightInLines > 0) {
          const domNode = document.createElement("div");
          renderLines2(domNode, tabSize, additionalLines, this._editor.getOptions(), this._isClickable);
          if (this._isClickable) {
            store.add(addDisposableListener(domNode, "mousedown", (e) => {
              e.preventDefault();
            }));
            store.add(addDisposableListener(domNode, "click", (e) => {
              if (isTargetGhostText(e.target)) {
                this._onDidClick.fire(new StandardMouseEvent(getWindow(e), e));
              }
            }));
          }
          this.addViewZone(changeAccessor, lineNumber, heightInLines, domNode);
        }
        this._viewZoneListener.value = store;
      });
    });
  }
  addViewZone(changeAccessor, afterLineNumber, heightInLines, domNode) {
    const id2 = changeAccessor.addZone({
      afterLineNumber,
      heightInLines,
      domNode,
      afterColumnAffinity: 1 /* Right */,
      onComputedHeight: (height) => {
        this._viewZoneHeight.set(height, void 0);
      }
    });
    this.keepCursorStable(afterLineNumber, heightInLines);
    this._viewZoneInfo = { viewZoneId: id2, heightInLines, lineNumber: afterLineNumber };
  }
  removeActiveViewZone(changeAccessor) {
    if (this._viewZoneInfo) {
      changeAccessor.removeZone(this._viewZoneInfo.viewZoneId);
      if (!this.hasBeenAccepted) {
        this.keepCursorStable(this._viewZoneInfo.lineNumber, -this._viewZoneInfo.heightInLines);
      }
      this._viewZoneInfo = void 0;
      this._viewZoneHeight.set(void 0, void 0);
    }
  }
  keepCursorStable(lineNumber, heightInLines) {
    if (!this._shouldKeepCursorStable) {
      return;
    }
    const cursorLineNumber = this._editor.getSelection()?.getStartPosition()?.lineNumber;
    if (cursorLineNumber !== void 0 && lineNumber < cursorLineNumber) {
      this._editor.setScrollTop(this._editor.getScrollTop() + heightInLines * this._editor.getOption(75 /* lineHeight */));
    }
  }
};

function isTargetGhostText(target) {
  return isHTMLElement(target) && target.classList.contains(GHOST_TEXT_CLASS_NAME);
}

var LineData = class {
  constructor(content2, decorations) {
    this.content = content2;
    this.decorations = decorations;
  }
  equals(other) {
    if (!this.content.equals(other.content)) {
      return false;
    }
    return LineDecoration.equalsArr(this.decorations, other.decorations);
  }
};

function renderLines2(domNode, tabSize, lines, opts, isClickable) {
  const disableMonospaceOptimizations = opts.get(40 /* disableMonospaceOptimizations */);
  const stopRenderingLineAfter = opts.get(133 /* stopRenderingLineAfter */);
  const renderWhitespace = "none";
  const renderControlCharacters = opts.get(108 /* renderControlCharacters */);
  const fontLigatures = opts.get(60 /* fontLigatures */);
  const fontInfo = opts.get(59 /* fontInfo */);
  const lineHeight = opts.get(75 /* lineHeight */);
  let classNames2 = "suggest-preview-text";
  if (isClickable) {
    classNames2 += " clickable";
  }
  const sb = new StringBuilder(1e4);
  sb.appendString(`<div class="${classNames2}">`);
  for (let i2 = 0, len = lines.length; i2 < len; i2++) {
    const lineData = lines[i2];
    const lineTokens = lineData.content;
    sb.appendString('<div class="view-line');
    sb.appendString('" style="top:');
    sb.appendString(String(i2 * lineHeight));
    sb.appendString('px;width:1000000px;">');
    const line = lineTokens.getLineContent();
    const isBasicASCII2 = isBasicASCII(line);
    const containsRTL2 = containsRTL(line);
    renderViewLine(new RenderLineInput(
      fontInfo.isMonospace && !disableMonospaceOptimizations,
      fontInfo.canUseHalfwidthRightwardsArrow,
      line,
      false,
      isBasicASCII2,
      containsRTL2,
      0,
      lineTokens,
      lineData.decorations.slice(),
      tabSize,
      0,
      fontInfo.spaceWidth,
      fontInfo.middotWidth,
      fontInfo.wsmiddotWidth,
      stopRenderingLineAfter,
      renderWhitespace,
      renderControlCharacters,
      fontLigatures !== EditorFontLigatures.OFF,
      null,
      null,
      0
    ), sb);
    sb.appendString("</div>");
  }
  sb.appendString("</div>");
  applyFontInfo(domNode, fontInfo);
  const html3 = sb.build();
  const trustedhtml = ttPolicy4 ? ttPolicy4.createHTML(html3) : html3;
  domNode.innerHTML = trustedhtml;
}

var ttPolicy4 = createTrustedTypesPolicy("editorGhostText", { createHTML: (value2) => value2 });
export { computeGhostTextViewData, isTargetGhostText, renderLines2, GhostTextWidgetWarning, USE_SQUIGGLES_FOR_WARNING, GHOST_TEXT_CLASS_NAME, GhostTextView, GhostTextAttachedData, AdditionalLinesData, AdditionalLinesWidget, LineData, ttPolicy4 };
