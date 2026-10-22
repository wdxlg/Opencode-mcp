// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsDeletionView.ts
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getOriginalBorderColor, originalBackgroundColor } from "./module-0771.mjs";
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { constObservable } from "./module-0061.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { getPrefixTrim, mapOutFalsy, maxContentWidthInRange } from "./module-0772.mjs";
import { Rect } from "./module-0765.mjs";
import { n } from "./module-0075.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsDeletionView.ts
var HORIZONTAL_PADDING = 0;

var VERTICAL_PADDING = 0;

var BORDER_WIDTH = 1;

var WIDGET_SEPARATOR_WIDTH = 1;

var WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH = 3;

var BORDER_RADIUS = INLINE_EDITS_BORDER_RADIUS;

var InlineEditsDeletionView = class extends Disposable {
  constructor(_editor, _edit, _uiState, _tabAction) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._uiState = _uiState;
    this._tabAction = _tabAction;
    this.onDidClick = Event2.None;
    this._display = derived(this, (reader) => !!this._uiState.read(reader) ? "block" : "none");
    this._editorMaxContentWidthInRange = derived(this, (reader) => {
      const originalDisplayRange = this._originalDisplayRange.read(reader);
      if (!originalDisplayRange) {
        return constObservable(0);
      }
      this._editorObs.versionId.read(reader);
      return derivedObservableWithCache(this, (reader2, lastValue) => {
        const maxWidth = maxContentWidthInRange(this._editorObs, originalDisplayRange, reader2);
        return Math.max(maxWidth, lastValue ?? 0);
      });
    }).map((v2, r2) => v2.read(r2));
    this._maxPrefixTrim = derived(this, (reader) => {
      const state = this._uiState.read(reader);
      if (!state) {
        return { prefixTrim: 0, prefixLeftOffset: 0 };
      }
      return getPrefixTrim(state.deletions, state.originalRange, [], this._editor);
    });
    this._editorLayoutInfo = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      if (!inlineEdit) {
        return null;
      }
      const state = this._uiState.read(reader);
      if (!state) {
        return null;
      }
      const editorLayout = this._editorObs.layoutInfo.read(reader);
      const horizontalScrollOffset = this._editorObs.scrollLeft.read(reader);
      const w = this._editorObs.getOption(59 /* fontInfo */).map((f) => f.typicalHalfwidthCharacterWidth).read(reader);
      const right = editorLayout.contentLeft + Math.max(this._editorMaxContentWidthInRange.read(reader), w) - horizontalScrollOffset;
      const range2 = inlineEdit.originalLineRange;
      const selectionTop = this._originalVerticalStartPosition.read(reader) ?? this._editor.getTopForLineNumber(range2.startLineNumber) - this._editorObs.scrollTop.read(reader);
      const selectionBottom = this._originalVerticalEndPosition.read(reader) ?? this._editor.getTopForLineNumber(range2.endLineNumberExclusive) - this._editorObs.scrollTop.read(reader);
      const left = editorLayout.contentLeft + this._maxPrefixTrim.read(reader).prefixLeftOffset - horizontalScrollOffset;
      if (right <= left) {
        return null;
      }
      const codeRect = Rect.fromLeftTopRightBottom(left, selectionTop, right, selectionBottom).withMargin(VERTICAL_PADDING, HORIZONTAL_PADDING);
      return {
        codeRect,
        contentLeft: editorLayout.contentLeft
      };
    }).recomputeInitiallyAndOnChange(this._store);
    this._originalOverlay = n.div({
      style: { pointerEvents: "none" }
    }, derived(this, (reader) => {
      const layoutInfoObs = mapOutFalsy(this._editorLayoutInfo).read(reader);
      if (!layoutInfoObs) {
        return void 0;
      }
      const overlayhider = layoutInfoObs.map((layoutInfo) => Rect.fromLeftTopRightBottom(
        layoutInfo.contentLeft - BORDER_RADIUS - BORDER_WIDTH,
        layoutInfo.codeRect.top,
        layoutInfo.contentLeft,
        layoutInfo.codeRect.bottom
      ));
      const overlayRect = derived(this, (reader2) => {
        const rect = layoutInfoObs.read(reader2).codeRect;
        const overlayHider = overlayhider.read(reader2);
        return rect.intersectHorizontal(new OffsetRange(overlayHider.left, Number.MAX_SAFE_INTEGER));
      });
      const separatorWidth = this._uiState.map((s) => s?.editorType === "diffEditor" /* DiffEditor */ ? WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH : WIDGET_SEPARATOR_WIDTH).read(reader);
      const separatorRect = overlayRect.map((rect) => rect.withMargin(separatorWidth, separatorWidth));
      const editorBackground2 = getEditorBackgroundColor(this._uiState.map((s) => s?.editorType ?? "textEditor" /* TextEditor */).read(reader));
      return [
        n.div({
          class: "originalSeparatorDeletion",
          style: {
            ...separatorRect.read(reader).toStyles(),
            borderRadius: `${BORDER_RADIUS}px`,
            border: `${BORDER_WIDTH + separatorWidth}px solid ${editorBackground2}`,
            boxSizing: "border-box"
          }
        }),
        n.div({
          class: "originalOverlayDeletion",
          style: {
            ...overlayRect.read(reader).toStyles(),
            borderRadius: `${BORDER_RADIUS}px`,
            border: getOriginalBorderColor(this._tabAction).map((bc) => `${BORDER_WIDTH}px solid ${asCssVariable(bc)}`),
            boxSizing: "border-box",
            backgroundColor: asCssVariable(originalBackgroundColor)
          }
        }),
        n.div({
          class: "originalOverlayHiderDeletion",
          style: {
            ...overlayhider.read(reader).toStyles(),
            backgroundColor: editorBackground2
          }
        })
      ];
    })).keepUpdated(this._store);
    this._nonOverflowView = n.div({
      class: "inline-edits-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: this._display
      }
    }, [
      [this._originalOverlay]
    ]).keepUpdated(this._store);
    this.isHovered = constObservable(false);
    this._editorObs = observableCodeEditor(this._editor);
    const originalStartPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.startLineNumber, 1) : null;
    });
    const originalEndPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.endLineNumberExclusive, 1) : null;
    });
    this._originalDisplayRange = this._uiState.map((s) => s?.originalRange);
    this._originalVerticalStartPosition = this._editorObs.observePosition(originalStartPosition, this._store).map((p) => p?.y);
    this._originalVerticalEndPosition = this._editorObs.observePosition(originalEndPosition, this._store).map((p) => p?.y);
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._nonOverflowView.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: derived(this, (reader) => {
        const info = this._editorLayoutInfo.read(reader);
        if (info === null) {
          return 0;
        }
        return info.codeRect.width;
      })
    }));
  }
};
export { HORIZONTAL_PADDING, VERTICAL_PADDING, BORDER_WIDTH, WIDGET_SEPARATOR_WIDTH, WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH, BORDER_RADIUS, InlineEditsDeletionView };
