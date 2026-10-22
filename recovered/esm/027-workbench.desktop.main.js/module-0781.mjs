// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsInsertionView.ts
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getModifiedBorderColor, modifiedBackgroundColor } from "./module-0771.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { LineRange } from "./module-0174.mjs";
import { getPrefixTrim, mapOutFalsy } from "./module-0772.mjs";
import { InlineDecoration } from "./module-0243.mjs";
import { Range2 } from "./module-0106.mjs";
import { GhostText, GhostTextPart } from "./module-0718.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { LineTokens, TokenArray } from "./module-0145.mjs";
import { $, n } from "./module-0075.mjs";
import { observableValue } from "./module-0048.mjs";
import { Rect } from "./module-0765.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { GhostTextView } from "./module-0763.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { constObservable } from "./module-0061.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsInsertionView.ts
var BORDER_WIDTH2 = 1;

var WIDGET_SEPARATOR_WIDTH2 = 1;

var WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH2 = 3;

var BORDER_RADIUS2 = INLINE_EDITS_BORDER_RADIUS;

var InlineEditsInsertionView = class extends Disposable {
  constructor(_editor, _input, _tabAction, instantiationService, _languageService) {
    super();
    this._editor = _editor;
    this._input = _input;
    this._tabAction = _tabAction;
    this._languageService = _languageService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._state = derived(this, (reader) => {
      const state = this._input.read(reader);
      if (!state) {
        return void 0;
      }
      const textModel = this._editor.getModel();
      const eol = textModel.getEOL();
      if (state.startColumn === 1 && state.lineNumber > 1 && textModel.getLineLength(state.lineNumber) !== 0 && state.text.endsWith(eol) && !state.text.startsWith(eol)) {
        const endOfLineColumn = textModel.getLineLength(state.lineNumber - 1) + 1;
        return { lineNumber: state.lineNumber - 1, column: endOfLineColumn, text: eol + state.text.slice(0, -eol.length) };
      }
      return { lineNumber: state.lineNumber, column: state.startColumn, text: state.text };
    });
    this._trimVertically = derived(this, (reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return { topOffset: 0, contentHeight: 0, linesTop: 0, linesBottom: 0 };
      }
      const text2 = state.text;
      const lineHeight = this._editor.getLineHeightForPosition(new Position(state.lineNumber, 1));
      const eol = this._editor.getModel().getEOL();
      const lineCount = text2.split(eol).length;
      let linesTop = 0;
      let linesBottom = 0;
      if (text2.trim() !== "") {
        let i2 = 0;
        for (; i2 < text2.length && text2.startsWith(eol, i2); i2 += eol.length) {
          linesTop += 1;
        }
        for (let j = text2.length; j > i2 && text2.endsWith(eol, j); j -= eol.length) {
          linesBottom += 1;
        }
      }
      return {
        topOffset: linesTop * lineHeight,
        contentHeight: (lineCount - linesTop - linesBottom) * lineHeight,
        linesTop,
        linesBottom
      };
    });
    this._maxPrefixTrim = derived(this, (reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return { prefixLeftOffset: 0, prefixTrim: 0 };
      }
      const textModel = this._editor.getModel();
      const eol = textModel.getEOL();
      const trimVertically = this._trimVertically.read(reader);
      const lines = state.text.split(eol);
      const modifiedLines = lines.slice(trimVertically.linesTop, lines.length - trimVertically.linesBottom);
      if (trimVertically.linesTop === 0) {
        modifiedLines[0] = textModel.getLineContent(state.lineNumber) + modifiedLines[0];
      }
      const originalRange = new LineRange(state.lineNumber, state.lineNumber + (trimVertically.linesTop > 0 ? 0 : 1));
      return getPrefixTrim([], originalRange, modifiedLines, this._editor);
    });
    this._ghostText = derived((reader) => {
      const state = this._state.read(reader);
      const prefixTrim = this._maxPrefixTrim.read(reader);
      if (!state) {
        return void 0;
      }
      const textModel = this._editor.getModel();
      const eol = textModel.getEOL();
      const modifiedLines = state.text.split(eol);
      const inlineDecorations = modifiedLines.map((line, i2) => new InlineDecoration(
        new Range2(i2 + 1, i2 === 0 ? 1 : prefixTrim.prefixTrim + 1, i2 + 1, line.length + 1),
        "modified-background",
        0 /* Regular */
      ));
      return new GhostText(state.lineNumber, [new GhostTextPart(state.column, state.text, false, inlineDecorations)]);
    });
    this._display = derived(this, (reader) => !!this._state.read(reader) ? "block" : "none");
    this._editorMaxContentWidthInRange = derived(this, (reader) => {
      const state = this._state.read(reader);
      if (!state) {
        return 0;
      }
      this._editorObs.versionId.read(reader);
      const textModel = this._editor.getModel();
      const eol = textModel.getEOL();
      const textBeforeInsertion = state.text.startsWith(eol) ? "" : textModel.getValueInRange(new Range2(state.lineNumber, 1, state.lineNumber, state.column));
      const textAfterInsertion = textModel.getValueInRange(new Range2(state.lineNumber, state.column, state.lineNumber, textModel.getLineLength(state.lineNumber) + 1));
      const text2 = textBeforeInsertion + state.text + textAfterInsertion;
      const lines = text2.split(eol);
      const renderOptions = RenderOptions.fromEditor(this._editor).withSetWidth(false).withScrollBeyondLastColumn(0);
      const lineWidths = lines.map((line) => {
        const t2 = textModel.tokenization.tokenizeLinesAt(state.lineNumber, [line])?.[0];
        let tokens;
        if (t2) {
          tokens = TokenArray.fromLineTokens(t2).toLineTokens(line, this._languageService.languageIdCodec);
        } else {
          tokens = LineTokens.createEmpty(line, this._languageService.languageIdCodec);
        }
        return renderLines(new LineSource([tokens]), renderOptions, [], $("div"), true).minWidthInPx;
      });
      return Math.max(...lineWidths);
    });
    this.startLineOffset = this._trimVertically.map((v2) => v2.topOffset);
    this.originalLines = this._state.map(
      (s) => s ? new LineRange(
        s.lineNumber,
        Math.min(s.lineNumber + 2, this._editor.getModel().getLineCount() + 1)
      ) : void 0
    );
    this._overlayLayout = derived(this, (reader) => {
      this._ghostText.read(reader);
      const state = this._state.read(reader);
      if (!state) {
        return null;
      }
      this._editorObs.observePosition(observableValue(this, new Position(state.lineNumber, state.column)), reader.store).read(reader);
      const editorLayout = this._editorObs.layoutInfo.read(reader);
      const horizontalScrollOffset = this._editorObs.scrollLeft.read(reader);
      const verticalScrollbarWidth = this._editorObs.layoutInfoVerticalScrollbarWidth.read(reader);
      const right = editorLayout.contentLeft + this._editorMaxContentWidthInRange.read(reader) - horizontalScrollOffset;
      const prefixLeftOffset = this._maxPrefixTrim.read(reader).prefixLeftOffset ?? 0;
      const left = editorLayout.contentLeft + prefixLeftOffset - horizontalScrollOffset;
      if (right <= left) {
        return null;
      }
      const { topOffset: topTrim, contentHeight: height } = this._trimVertically.read(reader);
      const scrollTop = this._editorObs.scrollTop.read(reader);
      const top2 = this._editor.getTopForLineNumber(state.lineNumber) - scrollTop + topTrim;
      const bottom = top2 + height;
      const overlay = new Rect(left, top2, right, bottom);
      return {
        overlay,
        startsAtContentLeft: prefixLeftOffset === 0,
        contentLeft: editorLayout.contentLeft,
        minContentWidthRequired: prefixLeftOffset + overlay.width + verticalScrollbarWidth
      };
    }).recomputeInitiallyAndOnChange(this._store);
    this._modifiedOverlay = n.div({
      style: { pointerEvents: "none" }
    }, derived(this, (reader) => {
      const overlayLayoutObs = mapOutFalsy(this._overlayLayout).read(reader);
      if (!overlayLayoutObs) {
        return void 0;
      }
      const overlayHider = overlayLayoutObs.map((layoutInfo) => Rect.fromLeftTopRightBottom(
        layoutInfo.contentLeft - BORDER_RADIUS2 - BORDER_WIDTH2,
        layoutInfo.overlay.top,
        layoutInfo.contentLeft,
        layoutInfo.overlay.bottom
      )).read(reader);
      const separatorWidth = this._input.map((i2) => i2?.editorType === "diffEditor" /* DiffEditor */ ? WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH2 : WIDGET_SEPARATOR_WIDTH2).read(reader);
      const overlayRect = overlayLayoutObs.map((l) => l.overlay.withMargin(0, BORDER_WIDTH2, BORDER_WIDTH2, l.startsAtContentLeft ? 0 : BORDER_WIDTH2).intersectHorizontal(new OffsetRange(overlayHider.left, Number.MAX_SAFE_INTEGER)));
      const underlayRect = overlayRect.map((rect) => rect.withMargin(separatorWidth, separatorWidth));
      const editorBackground2 = getEditorBackgroundColor(this._input.read(void 0)?.editorType ?? "textEditor" /* TextEditor */);
      return [
        n.div({
          class: "originalUnderlayInsertion",
          style: {
            ...underlayRect.read(reader).toStyles(),
            borderRadius: BORDER_RADIUS2,
            border: `${BORDER_WIDTH2 + separatorWidth}px solid ${editorBackground2}`,
            boxSizing: "border-box"
          }
        }),
        n.div({
          class: "originalOverlayInsertion",
          style: {
            ...overlayRect.read(reader).toStyles(),
            borderRadius: BORDER_RADIUS2,
            border: getModifiedBorderColor(this._tabAction).map((bc) => `${BORDER_WIDTH2}px solid ${asCssVariable(bc)}`),
            boxSizing: "border-box",
            backgroundColor: asCssVariable(modifiedBackgroundColor)
          }
        }),
        n.div({
          class: "originalOverlayHiderInsertion",
          style: {
            ...overlayHider.toStyles(),
            backgroundColor: editorBackground2
          }
        })
      ];
    })).keepUpdated(this._store);
    this._view = n.div({
      class: "inline-edits-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: this._display
      }
    }, [
      [this._modifiedOverlay]
    ]).keepUpdated(this._store);
    this._editorObs = observableCodeEditor(this._editor);
    this._ghostTextView = this._register(instantiationService.createInstance(
      GhostTextView,
      this._editor,
      derived((reader) => {
        const ghostText = this._ghostText.read(reader);
        if (!ghostText) {
          return void 0;
        }
        return {
          ghostText,
          handleInlineCompletionShown: (data) => {
          },
          warning: void 0
        };
      }),
      {
        extraClasses: ["inline-edit"],
        isClickable: true,
        shouldKeepCursorStable: true
      }
    ));
    this.isHovered = this._ghostTextView.isHovered;
    this._register(this._ghostTextView.onDidClick((e) => {
      this._onDidClick.fire(new InlineEditClickEvent(e));
    }));
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._view.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: derived(this, (reader) => {
        const info = this._overlayLayout.read(reader);
        if (info === null) {
          return 0;
        }
        return info.minContentWidthRequired;
      })
    }));
  }
};

InlineEditsInsertionView = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageService)
], InlineEditsInsertionView);
export { BORDER_WIDTH2, WIDGET_SEPARATOR_WIDTH2, WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH2, BORDER_RADIUS2, InlineEditsInsertionView };
