// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsCustomView.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { n } from "./module-0075.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getEditorBlendedColor, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorSuccessfulBackground } from "./module-0771.mjs";
import { derived } from "./module-0054.mjs";
import { constObservable } from "./module-0061.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { autorun } from "./module-0052.mjs";
import { getContentRenderWidth, maxContentWidthInRange, rectToProps } from "./module-0772.mjs";
import { LineRange } from "./module-0174.mjs";
import { Rect } from "./module-0765.mjs";
import { LineTokens, TokenArray } from "./module-0145.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsCustomView.ts
var MIN_END_OF_LINE_PADDING = 14;

var PADDING_VERTICALLY = 0;

var PADDING_HORIZONTALLY = 4;

var HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW = 4;

var VERTICAL_OFFSET_WHEN_ABOVE_BELOW = 2;

var InlineEditsCustomView = class extends Disposable {
  constructor(_editor, displayLocation, tabAction, editorType, themeService, _languageService) {
    super();
    this._editor = _editor;
    this._languageService = _languageService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._isHovered = observableValue(this, false);
    this.isHovered = this._isHovered;
    this._viewRef = n.ref();
    this._editorObs = observableCodeEditor(this._editor);
    const styles = tabAction.map((v2, reader) => {
      let border;
      switch (v2) {
        case "inactive" /* Inactive */:
          border = inlineEditIndicatorSecondaryBackground;
          break;
        case "jump" /* Jump */:
          border = inlineEditIndicatorPrimaryBackground;
          break;
        case "accept" /* Accept */:
          border = inlineEditIndicatorSuccessfulBackground;
          break;
      }
      return {
        border: getEditorBlendedColor(border, themeService).read(reader).toString(),
        background: getEditorBackgroundColor(editorType.read(reader))
      };
    });
    const state = displayLocation.map((dl) => dl ? this.getState(dl) : void 0);
    const view = state.map((s) => s ? this.getRendering(s, styles) : void 0);
    this.minEditorScrollHeight = derived(this, (reader) => {
      const s = state.read(reader);
      if (!s) {
        return 0;
      }
      return s.rect.read(reader).bottom + this._editor.getScrollTop();
    });
    const overlay = n.div({
      class: "inline-edits-custom-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: "block"
      }
    }, [view]).keepUpdated(this._store);
    this._register(this._editorObs.createOverlayWidget({
      domNode: overlay.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: derivedObservableWithCache(this, (reader, prev) => {
        const s = state.read(reader);
        if (!s) {
          return prev ?? 0;
        }
        const current = s.rect.map((rect) => rect.right).read(reader) + this._editorObs.layoutInfoVerticalScrollbarWidth.read(reader) + PADDING_HORIZONTALLY - this._editorObs.layoutInfoContentLeft.read(reader);
        return Math.max(prev ?? 0, current);
      }).recomputeInitiallyAndOnChange(this._store)
    }));
    this._register(autorun((reader) => {
      const v2 = view.read(reader);
      if (!v2) {
        this._isHovered.set(false, void 0);
        return;
      }
      this._isHovered.set(overlay.isHovered.read(reader), void 0);
    }));
  }
  // TODO: this is very similar to side by side `fitsInsideViewport`, try to use the same function
  fitsInsideViewport(range2, displayLabel, reader) {
    const editorWidth = this._editorObs.layoutInfoWidth.read(reader);
    const editorContentLeft = this._editorObs.layoutInfoContentLeft.read(reader);
    const editorVerticalScrollbar = this._editor.getLayoutInfo().verticalScrollbarWidth;
    const minimapWidth = this._editorObs.layoutInfoMinimap.read(reader).minimapLeft !== 0 ? this._editorObs.layoutInfoMinimap.read(reader).minimapWidth : 0;
    const maxOriginalContent = maxContentWidthInRange(this._editorObs, range2, void 0);
    const maxModifiedContent = getContentRenderWidth(displayLabel, this._editor, this._editor.getModel());
    const padding = PADDING_HORIZONTALLY + MIN_END_OF_LINE_PADDING;
    return maxOriginalContent + maxModifiedContent + padding < editorWidth - editorContentLeft - editorVerticalScrollbar - minimapWidth;
  }
  getState(displayLocation) {
    const contentState = derived(this, (reader) => {
      const startLineNumber2 = displayLocation.range.startLineNumber;
      const endLineNumber2 = displayLocation.range.endLineNumber;
      const startColumn = displayLocation.range.startColumn;
      const endColumn = displayLocation.range.endColumn;
      const lineCount = this._editor.getModel()?.getLineCount() ?? 0;
      const lineWidth = maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber2, startLineNumber2 + 1), reader);
      const lineWidthBelow = startLineNumber2 + 1 <= lineCount ? maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber2 + 1, startLineNumber2 + 2), reader) : void 0;
      const lineWidthAbove = startLineNumber2 - 1 >= 1 ? maxContentWidthInRange(this._editorObs, new LineRange(startLineNumber2 - 1, startLineNumber2), reader) : void 0;
      const startContentLeftOffset = this._editor.getOffsetForColumn(startLineNumber2, startColumn);
      const endContentLeftOffset = this._editor.getOffsetForColumn(endLineNumber2, endColumn);
      return {
        lineWidth,
        lineWidthBelow,
        lineWidthAbove,
        startContentLeftOffset,
        endContentLeftOffset
      };
    });
    const startLineNumber = displayLocation.range.startLineNumber;
    const endLineNumber = displayLocation.range.endLineNumber;
    const fitsInsideViewport = this.fitsInsideViewport(new LineRange(startLineNumber, endLineNumber + 1), displayLocation.content, void 0);
    const rect = derived(this, (reader) => {
      const w = this._editorObs.getOption(59 /* fontInfo */).read(reader).typicalHalfwidthCharacterWidth;
      const { lineWidth, lineWidthBelow, lineWidthAbove, startContentLeftOffset, endContentLeftOffset } = contentState.read(reader);
      const contentLeft = this._editorObs.layoutInfoContentLeft.read(reader);
      const lineHeight = this._editorObs.observeLineHeightForLine(startLineNumber).recomputeInitiallyAndOnChange(reader.store).read(reader);
      const scrollTop = this._editorObs.scrollTop.read(reader);
      const scrollLeft = this._editorObs.scrollLeft.read(reader);
      let position2;
      if (startLineNumber === endLineNumber && endContentLeftOffset + 5 * w >= lineWidth && fitsInsideViewport) {
        position2 = "end";
      } else if (lineWidthBelow !== void 0 && lineWidthBelow + MIN_END_OF_LINE_PADDING - HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW - PADDING_HORIZONTALLY < startContentLeftOffset) {
        position2 = "below";
      } else if (lineWidthAbove !== void 0 && lineWidthAbove + MIN_END_OF_LINE_PADDING - HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW - PADDING_HORIZONTALLY < startContentLeftOffset) {
        position2 = "above";
      } else {
        position2 = "end";
      }
      let topOfLine;
      let contentStartOffset;
      let deltaX = 0;
      let deltaY = 0;
      switch (position2) {
        case "end": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber);
          contentStartOffset = lineWidth;
          deltaX = PADDING_HORIZONTALLY + MIN_END_OF_LINE_PADDING;
          break;
        }
        case "below": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber + 1);
          contentStartOffset = startContentLeftOffset;
          deltaX = PADDING_HORIZONTALLY + HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW;
          deltaY = PADDING_VERTICALLY + VERTICAL_OFFSET_WHEN_ABOVE_BELOW;
          break;
        }
        case "above": {
          topOfLine = this._editorObs.editor.getTopForLineNumber(startLineNumber - 1);
          contentStartOffset = startContentLeftOffset;
          deltaX = PADDING_HORIZONTALLY + HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW;
          deltaY = -PADDING_VERTICALLY + VERTICAL_OFFSET_WHEN_ABOVE_BELOW;
          break;
        }
      }
      const textRect = Rect.fromLeftTopWidthHeight(
        contentLeft + contentStartOffset - scrollLeft,
        topOfLine - scrollTop,
        w * displayLocation.content.length,
        lineHeight
      );
      return textRect.withMargin(PADDING_VERTICALLY, PADDING_HORIZONTALLY).translateX(deltaX).translateY(deltaY);
    });
    return {
      rect,
      label: displayLocation.content,
      kind: displayLocation.style
    };
  }
  getRendering(state, styles) {
    const line = document.createElement("div");
    const t2 = this._editor.getModel().tokenization.tokenizeLinesAt(1, [state.label])?.[0];
    let tokens;
    if (t2 && state.kind === 1 /* Code */) {
      tokens = TokenArray.fromLineTokens(t2).toLineTokens(state.label, this._languageService.languageIdCodec);
    } else {
      tokens = LineTokens.createEmpty(state.label, this._languageService.languageIdCodec);
    }
    const result = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor).withSetWidth(false).withScrollBeyondLastColumn(0), [], line, true);
    line.style.width = `${result.minWidthInPx}px`;
    const rect = state.rect.map((r2) => r2.withMargin(0, PADDING_HORIZONTALLY));
    return n.div({
      class: "collapsedView",
      ref: this._viewRef,
      style: {
        position: "absolute",
        ...rectToProps((reader) => rect.read(reader)),
        overflow: "hidden",
        boxSizing: "border-box",
        cursor: "pointer",
        border: styles.map((s) => `1px solid ${s.border}`),
        borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
        backgroundColor: styles.map((s) => s.background),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap"
      },
      onmousedown: (e) => {
        e.preventDefault();
      },
      onclick: (e) => {
        this._onDidClick.fire(InlineEditClickEvent.create(e));
      }
    }, [
      line
    ]);
  }
};

InlineEditsCustomView = __decorateClass([
  __decorateParam(4, IThemeService),
  __decorateParam(5, ILanguageService)
], InlineEditsCustomView);
export { MIN_END_OF_LINE_PADDING, PADDING_VERTICALLY, PADDING_HORIZONTALLY, HORIZONTAL_OFFSET_WHEN_ABOVE_BELOW, VERTICAL_OFFSET_WHEN_ABOVE_BELOW, InlineEditsCustomView };
