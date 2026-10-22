// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsLineReplacementView.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getEditorValidOverlayRect, getPrefixTrim, mapOutFalsy, rectToProps } from "./module-0772.mjs";
import { derived } from "./module-0054.mjs";
import { Range2 } from "./module-0106.mjs";
import { LineTokens, TokenArray } from "./module-0145.mjs";
import { InlineDecoration } from "./module-0243.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { Rect } from "./module-0765.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { $, n } from "./module-0075.mjs";
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getEditorBlendedColor, getModifiedBorderColor, getOriginalBorderColor, modifiedChangedLineBackgroundColor, originalBackgroundColor } from "./module-0771.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { scrollbarShadow } from "./module-0228.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { autorunDelta } from "./module-0052.mjs";
import { constObservable } from "./module-0061.mjs";
import { EditorMouseEvent } from "./module-0237.mjs";
import { Point } from "./module-0492.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsLineReplacementView.ts
var InlineEditsLineReplacementView = class extends Disposable {
  constructor(_editor, _edit, _editorType, _tabAction, _languageService, _themeService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._editorType = _editorType;
    this._tabAction = _tabAction;
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._maxPrefixTrim = this._edit.map((e4, reader) => e4 ? getPrefixTrim(e4.replacements.flatMap((r2) => [r2.originalRange, r2.modifiedRange]), e4.originalRange, e4.modifiedLines, this._editor.editor, reader) : void 0);
    this._modifiedLineElements = derived(this, (reader) => {
      const lines = [];
      let requiredWidth = 0;
      const prefixTrim = this._maxPrefixTrim.read(reader);
      const edit3 = this._edit.read(reader);
      if (!edit3 || !prefixTrim) {
        return void 0;
      }
      const maxPrefixTrim = prefixTrim.prefixTrim;
      const modifiedBubbles = rangesToBubbleRanges(edit3.replacements.map((r2) => r2.modifiedRange)).map((r2) => new Range2(r2.startLineNumber, r2.startColumn - maxPrefixTrim, r2.endLineNumber, r2.endColumn - maxPrefixTrim));
      const textModel = this._editor.model.get();
      const startLineNumber = edit3.modifiedRange.startLineNumber;
      for (let i2 = 0; i2 < edit3.modifiedRange.length; i2++) {
        const line = document.createElement("div");
        const lineNumber = startLineNumber + i2;
        const modLine = edit3.modifiedLines[i2].slice(maxPrefixTrim);
        const t2 = textModel.tokenization.tokenizeLinesAt(lineNumber, [modLine])?.[0];
        let tokens;
        if (t2) {
          tokens = TokenArray.fromLineTokens(t2).toLineTokens(modLine, this._languageService.languageIdCodec);
        } else {
          tokens = LineTokens.createEmpty(modLine, this._languageService.languageIdCodec);
        }
        const decorations = [];
        for (const modified of modifiedBubbles.filter((b) => b.startLineNumber === lineNumber)) {
          const validatedEndColumn = Math.min(modified.endColumn, modLine.length + 1);
          decorations.push(new InlineDecoration(new Range2(1, modified.startColumn, 1, validatedEndColumn), "inlineCompletions-modified-bubble", 0 /* Regular */));
        }
        const result = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor.editor).withSetWidth(false).withScrollBeyondLastColumn(0), decorations, line, true);
        this._editor.getOption(59 /* fontInfo */).read(reader);
        requiredWidth = Math.max(requiredWidth, result.minWidthInPx);
        lines.push(line);
      }
      return { lines, requiredWidth };
    });
    this._layout = derived(this, (reader) => {
      const modifiedLines = this._modifiedLineElements.read(reader);
      const maxPrefixTrim = this._maxPrefixTrim.read(reader);
      const edit3 = this._edit.read(reader);
      if (!modifiedLines || !maxPrefixTrim || !edit3) {
        return void 0;
      }
      const { prefixLeftOffset } = maxPrefixTrim;
      const { requiredWidth } = modifiedLines;
      const originalLineHeights = this._editor.observeLineHeightsForLineRange(edit3.originalRange).read(reader);
      const modifiedLineHeights = (() => {
        const lineHeights = originalLineHeights.slice(0, edit3.modifiedRange.length);
        while (lineHeights.length < edit3.modifiedRange.length) {
          lineHeights.push(originalLineHeights[originalLineHeights.length - 1]);
        }
        return lineHeights;
      })();
      const contentLeft = this._editor.layoutInfoContentLeft.read(reader);
      const verticalScrollbarWidth = this._editor.layoutInfoVerticalScrollbarWidth.read(reader);
      const scrollLeft = this._editor.scrollLeft.read(reader);
      const scrollTop = this._editor.scrollTop.read(reader);
      const editorLeftOffset = contentLeft - scrollLeft;
      const textModel = this._editor.editor.getModel();
      const originalLineWidths = edit3.originalRange.mapToLineArray((line) => this._editor.editor.getOffsetForColumn(line, textModel.getLineMaxColumn(line)) - prefixLeftOffset);
      const maxLineWidth = Math.max(...originalLineWidths, requiredWidth);
      const startLineNumber = edit3.originalRange.startLineNumber;
      const endLineNumber = edit3.originalRange.endLineNumberExclusive - 1;
      const topOfOriginalLines = this._editor.editor.getTopForLineNumber(startLineNumber) - scrollTop;
      const bottomOfOriginalLines = this._editor.editor.getBottomForLineNumber(endLineNumber) - scrollTop;
      const originalLinesOverlay = Rect.fromLeftTopWidthHeight(
        editorLeftOffset + prefixLeftOffset,
        topOfOriginalLines,
        maxLineWidth,
        bottomOfOriginalLines - topOfOriginalLines
      );
      const modifiedLinesOverlay = Rect.fromLeftTopWidthHeight(
        originalLinesOverlay.left,
        originalLinesOverlay.bottom,
        originalLinesOverlay.width,
        modifiedLineHeights.reduce((sum2, h3) => sum2 + h3, 0)
      );
      const background = Rect.hull([originalLinesOverlay, modifiedLinesOverlay]);
      const lowerBackground = background.intersectVertical(new OffsetRange(originalLinesOverlay.bottom, Number.MAX_SAFE_INTEGER));
      const lowerText = new Rect(lowerBackground.left, lowerBackground.top, lowerBackground.right, lowerBackground.bottom);
      return {
        originalLinesOverlay,
        modifiedLinesOverlay,
        background,
        lowerBackground,
        lowerText,
        modifiedLineHeights,
        minContentWidthRequired: prefixLeftOffset + maxLineWidth + verticalScrollbarWidth
      };
    });
    this._viewZoneInfo = derived((reader) => {
      const shouldShowViewZone = this._editor.getOption(71 /* inlineSuggest */).map((o) => o.edits.allowCodeShifting === "always").read(reader);
      if (!shouldShowViewZone) {
        return void 0;
      }
      const layout2 = this._layout.read(reader);
      const edit3 = this._edit.read(reader);
      if (!layout2 || !edit3) {
        return void 0;
      }
      const viewZoneHeight = layout2.lowerBackground.height;
      const viewZoneLineNumber = edit3.originalRange.endLineNumberExclusive;
      return { height: viewZoneHeight, lineNumber: viewZoneLineNumber };
    });
    this.minEditorScrollHeight = derived(this, (reader) => {
      const layout2 = mapOutFalsy(this._layout).read(reader);
      if (!layout2 || this._viewZoneInfo.read(reader) !== void 0) {
        return 0;
      }
      return layout2.read(reader).lowerText.bottom + this._editor.editor.getScrollTop();
    });
    this._div = n.div({
      class: "line-replacement"
    }, [
      derived(this, (reader) => {
        const layout2 = mapOutFalsy(this._layout).read(reader);
        const modifiedLineElements = this._modifiedLineElements.read(reader);
        if (!layout2 || !modifiedLineElements) {
          return [];
        }
        const layoutProps = layout2.read(reader);
        const contentLeft = this._editor.layoutInfoContentLeft.read(reader);
        const separatorWidth = this._editorType.read(reader) === "diffEditor" /* DiffEditor */ ? 3 : 1;
        modifiedLineElements.lines.forEach((l, i2) => {
          l.style.width = `${layoutProps.lowerText.width}px`;
          l.style.height = `${layoutProps.modifiedLineHeights[i2]}px`;
          l.style.position = "relative";
        });
        const modifiedBorderColor = getModifiedBorderColor(this._tabAction).read(reader);
        const originalBorderColor = getOriginalBorderColor(this._tabAction).read(reader);
        const editorBackground2 = getEditorBackgroundColor(this._editorType.read(reader));
        return [
          n.div({
            style: {
              position: "absolute",
              ...rectToProps((r2) => getEditorValidOverlayRect(this._editor).read(r2)),
              overflow: "hidden",
              pointerEvents: "none"
            }
          }, [
            n.div({
              class: "borderAroundLineReplacement",
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).background.translateX(-contentLeft).withMargin(separatorWidth)),
                borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                border: `${separatorWidth + 1}px solid ${editorBackground2}`,
                boxSizing: "border-box",
                pointerEvents: "none"
              }
            }),
            n.div({
              class: "originalOverlayLineReplacement",
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).background.translateX(-contentLeft)),
                borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                border: getEditorBlendedColor(originalBorderColor, this._themeService).map((c) => `1px solid ${c.toString()}`),
                pointerEvents: "none",
                boxSizing: "border-box",
                background: asCssVariable(originalBackgroundColor)
              }
            }),
            n.div({
              class: "modifiedOverlayLineReplacement",
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).lowerBackground.translateX(-contentLeft)),
                borderRadius: `0 0 ${INLINE_EDITS_BORDER_RADIUS}px ${INLINE_EDITS_BORDER_RADIUS}px`,
                background: editorBackground2,
                boxShadow: `${asCssVariable(scrollbarShadow)} 0 6px 6px -6px`,
                border: `1px solid ${asCssVariable(modifiedBorderColor)}`,
                boxSizing: "border-box",
                overflow: "hidden",
                cursor: "pointer",
                pointerEvents: "auto"
              },
              onmousedown: (e4) => {
                e4.preventDefault();
              },
              onclick: (e4) => this._onDidClick.fire(InlineEditClickEvent.create(e4))
            }, [
              n.div({
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: asCssVariable(modifiedChangedLineBackgroundColor)
                }
              })
            ]),
            n.div({
              class: "modifiedLinesLineReplacement",
              style: {
                position: "absolute",
                boxSizing: "border-box",
                ...rectToProps((reader2) => layout2.read(reader2).lowerText.translateX(-contentLeft)),
                fontFamily: this._editor.getOption(58 /* fontFamily */),
                fontSize: this._editor.getOption(61 /* fontSize */),
                fontWeight: this._editor.getOption(62 /* fontWeight */),
                pointerEvents: "none",
                whiteSpace: "nowrap",
                borderRadius: `0 0 ${INLINE_EDITS_BORDER_RADIUS}px ${INLINE_EDITS_BORDER_RADIUS}px`,
                overflow: "hidden"
              }
            }, [...modifiedLineElements.lines])
          ])
        ];
      })
    ]).keepUpdated(this._store);
    this.isHovered = this._editor.isTargetHovered((e4) => this._isMouseOverWidget(e4), this._store);
    this._previousViewZoneInfo = void 0;
    this._register(toDisposable(() => this._editor.editor.changeViewZones((accessor) => this.removePreviousViewZone(accessor))));
    this._register(autorunDelta(this._viewZoneInfo, ({ lastValue, newValue }) => {
      if (lastValue === newValue || lastValue?.height === newValue?.height && lastValue?.lineNumber === newValue?.lineNumber) {
        return;
      }
      this._editor.editor.changeViewZones((changeAccessor) => {
        this.removePreviousViewZone(changeAccessor);
        if (!newValue) {
          return;
        }
        this.addViewZone(newValue, changeAccessor);
      });
    }));
    this._register(this._editor.createOverlayWidget({
      domNode: this._div.element,
      minContentWidthInPx: derived(this, (reader) => {
        return this._layout.read(reader)?.minContentWidthRequired ?? 0;
      }),
      position: constObservable({ preference: { top: 0, left: 0 } }),
      allowEditorOverflow: false
    }));
  }
  _isMouseOverWidget(e4) {
    const layout2 = this._layout.get();
    if (!layout2 || !(e4.event instanceof EditorMouseEvent)) {
      return false;
    }
    return layout2.lowerBackground.containsPoint(new Point(e4.event.relativePos.x, e4.event.relativePos.y));
  }
  removePreviousViewZone(changeAccessor) {
    if (!this._previousViewZoneInfo) {
      return;
    }
    changeAccessor.removeZone(this._previousViewZoneInfo.id);
    const cursorLineNumber = this._editor.cursorLineNumber.get();
    if (cursorLineNumber !== null && cursorLineNumber >= this._previousViewZoneInfo.lineNumber) {
      this._editor.editor.setScrollTop(this._editor.scrollTop.get() - this._previousViewZoneInfo.height);
    }
    this._previousViewZoneInfo = void 0;
  }
  addViewZone(viewZoneInfo, changeAccessor) {
    const activeViewZone = changeAccessor.addZone({
      afterLineNumber: viewZoneInfo.lineNumber - 1,
      heightInPx: viewZoneInfo.height,
      // move computation to layout?
      domNode: $("div")
    });
    this._previousViewZoneInfo = { height: viewZoneInfo.height, lineNumber: viewZoneInfo.lineNumber, id: activeViewZone };
    const cursorLineNumber = this._editor.cursorLineNumber.get();
    if (cursorLineNumber !== null && cursorLineNumber >= viewZoneInfo.lineNumber) {
      this._editor.editor.setScrollTop(this._editor.scrollTop.get() + viewZoneInfo.height);
    }
  }
};

InlineEditsLineReplacementView = __decorateClass([
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IThemeService)
], InlineEditsLineReplacementView);

function rangesToBubbleRanges(ranges) {
  const result = [];
  while (ranges.length) {
    let range2 = ranges.shift();
    if (range2.startLineNumber !== range2.endLineNumber) {
      ranges.push(new Range2(range2.startLineNumber + 1, 1, range2.endLineNumber, range2.endColumn));
      range2 = new Range2(range2.startLineNumber, range2.startColumn, range2.startLineNumber, Number.MAX_SAFE_INTEGER);
    }
    result.push(range2);
  }
  return result;
}
export { rangesToBubbleRanges, InlineEditsLineReplacementView };
