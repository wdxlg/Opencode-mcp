// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsSideBySideView.ts
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getEditorBlendedColor, getModifiedBorderColor, getOriginalBorderColor, modifiedBackgroundColor, originalBackgroundColor } from "./module-0771.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { derived } from "./module-0054.mjs";
import { $, getWindow, n } from "./module-0075.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { Range2 } from "./module-0106.mjs";
import { PathBuilder, getContentRenderWidth, getOffsetForPos, mapOutFalsy, maxContentWidthInRange, observeEditorBoundingClientRect } from "./module-0772.mjs";
import { Position } from "./module-0079.mjs";
import { constObservable } from "./module-0061.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { Rect } from "./module-0765.mjs";
import { StickyScrollController2 } from "./module-0770.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Color } from "./module-0197.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IUserInteractionService } from "./module-0366.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsSideBySideView.ts
var HORIZONTAL_PADDING2 = 0;

var VERTICAL_PADDING2 = 0;

var ENABLE_OVERFLOW = false;

var BORDER_WIDTH3 = 1;

var WIDGET_SEPARATOR_WIDTH3 = 1;

var WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH3 = 3;

var BORDER_RADIUS4 = INLINE_EDITS_BORDER_RADIUS;

var ORIGINAL_END_PADDING = 20;

var MODIFIED_END_PADDING = 12;

var InlineEditsSideBySideView = class extends Disposable {
  constructor(_editor, _edit, _previewTextModel, _uiState, _tabAction, _instantiationService, _themeService, _userInteractionService) {
    super();
    this._editor = _editor;
    this._edit = _edit;
    this._previewTextModel = _previewTextModel;
    this._uiState = _uiState;
    this._tabAction = _tabAction;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this._userInteractionService = _userInteractionService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._editorObs = observableCodeEditor(this._editor);
    this._display = derived(this, (reader) => !!this._uiState.read(reader) ? "block" : "none");
    this.previewRef = n.ref();
    const separatorWidthObs = this._uiState.map((s) => s?.editorType === "diffEditor" /* DiffEditor */ ? WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH3 : WIDGET_SEPARATOR_WIDTH3);
    this._editorContainer = n.div({
      class: ["editorContainer"],
      style: { position: "absolute", overflow: "hidden", cursor: "pointer" },
      onmousedown: (e4) => {
        e4.preventDefault();
      },
      onclick: (e4) => {
        this._onDidClick.fire(InlineEditClickEvent.create(e4));
      }
    }, [
      n.div({ class: "preview", style: { pointerEvents: "none" }, ref: this.previewRef })
    ]).keepUpdated(this._store);
    this.isHovered = this._userInteractionService.createHoverTracker(this._editorContainer.element, this._store);
    this.previewEditor = this._register(this._instantiationService.createInstance(
      EmbeddedCodeEditorWidget,
      this.previewRef.element,
      {
        glyphMargin: false,
        lineNumbers: "off",
        minimap: { enabled: false },
        guides: {
          indentation: false,
          bracketPairs: false,
          bracketPairsHorizontal: false,
          highlightActiveIndentation: false
        },
        editContext: false,
        // is a bit faster
        rulers: [],
        padding: { top: 0, bottom: 0 },
        folding: false,
        selectOnLineNumbers: false,
        selectionHighlight: false,
        columnSelection: false,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        revealHorizontalRightPadding: 0,
        bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: false },
        scrollBeyondLastLine: false,
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false
        },
        readOnly: true,
        wordWrap: "off",
        wordWrapOverride1: "off",
        wordWrapOverride2: "off"
      },
      {
        contextKeyValues: {
          [InlineCompletionContextKeys.inInlineEditsPreviewEditor.key]: true
        },
        contributions: []
      },
      this._editor
    ));
    this._previewEditorObs = observableCodeEditor(this.previewEditor);
    this._activeViewZones = [];
    this._updatePreviewEditor = derived(this, (reader) => {
      this._editorContainer.readEffect(reader);
      this._previewEditorObs.model.read(reader);
      this._display.read(reader);
      if (this._nonOverflowView) {
        this._nonOverflowView.element.style.display = this._display.read(reader);
      }
      const uiState = this._uiState.read(reader);
      const edit3 = this._edit.read(reader);
      if (!uiState || !edit3) {
        return;
      }
      const range2 = edit3.originalLineRange;
      const hiddenAreas = [];
      if (range2.startLineNumber > 1) {
        hiddenAreas.push(new Range2(1, 1, range2.startLineNumber - 1, 1));
      }
      if (range2.startLineNumber + uiState.newTextLineCount < this._previewTextModel.getLineCount() + 1) {
        hiddenAreas.push(new Range2(range2.startLineNumber + uiState.newTextLineCount, 1, this._previewTextModel.getLineCount() + 1, 1));
      }
      this.previewEditor.setHiddenAreas(hiddenAreas, void 0, true);
      const previousViewZones = [...this._activeViewZones];
      this._activeViewZones = [];
      const reducedLinesCount = range2.endLineNumberExclusive - range2.startLineNumber - uiState.newTextLineCount;
      this.previewEditor.changeViewZones((changeAccessor) => {
        previousViewZones.forEach((id2) => changeAccessor.removeZone(id2));
        if (reducedLinesCount > 0) {
          this._activeViewZones.push(changeAccessor.addZone({
            afterLineNumber: range2.startLineNumber + uiState.newTextLineCount - 1,
            heightInLines: reducedLinesCount,
            showInHiddenAreas: true,
            domNode: $("div.diagonal-fill.inline-edits-view-zone")
          }));
        }
      });
    });
    this._previewEditorWidth = derived(this, (reader) => {
      const edit3 = this._edit.read(reader);
      if (!edit3) {
        return 0;
      }
      this._updatePreviewEditor.read(reader);
      return maxContentWidthInRange(this._previewEditorObs, edit3.modifiedLineRange, reader);
    });
    this._cursorPosIfTouchesEdit = derived(this, (reader) => {
      const cursorPos = this._editorObs.cursorPosition.read(reader);
      const edit3 = this._edit.read(reader);
      if (!edit3 || !cursorPos) {
        return void 0;
      }
      return edit3.modifiedLineRange.contains(cursorPos.lineNumber) ? cursorPos : void 0;
    });
    this._originalStartPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.startLineNumber, 1) : null;
    });
    this._originalEndPosition = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      return inlineEdit ? new Position(inlineEdit.originalLineRange.endLineNumberExclusive, 1) : null;
    });
    this._originalVerticalStartPosition = this._editorObs.observePosition(this._originalStartPosition, this._store).map((p) => p?.y);
    this._originalVerticalEndPosition = this._editorObs.observePosition(this._originalEndPosition, this._store).map((p) => p?.y);
    this._originalDisplayRange = this._edit.map((e4) => e4?.displayRange);
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
    const editorDomContentRect = observeEditorBoundingClientRect(this._editor, this._store);
    this._previewEditorLayoutInfo = derived(this, (reader) => {
      const inlineEdit = this._edit.read(reader);
      if (!inlineEdit) {
        return null;
      }
      const state = this._uiState.read(reader);
      if (!state) {
        return null;
      }
      const range2 = inlineEdit.originalLineRange;
      const horizontalScrollOffset = this._editorObs.scrollLeft.read(reader);
      const editorContentMaxWidthInRange = this._editorMaxContentWidthInRange.read(reader);
      const editorLayout = this._editorObs.layoutInfo.read(reader);
      const previewContentWidth = this._previewEditorWidth.read(reader);
      const editorContentAreaWidth = editorLayout.contentWidth - editorLayout.verticalScrollbarWidth;
      const editorBoundingClientRect = editorDomContentRect.read(reader);
      const clientContentAreaRight = editorLayout.contentLeft + editorLayout.contentWidth + editorBoundingClientRect.left;
      const remainingWidthRightOfContent = getWindow(this._editor.getContainerDomNode()).innerWidth - clientContentAreaRight;
      const remainingWidthRightOfEditor = getWindow(this._editor.getContainerDomNode()).innerWidth - editorBoundingClientRect.right;
      const desiredMinimumWidth = Math.min(editorLayout.contentWidth * 0.3, previewContentWidth, 100);
      const IN_EDITOR_DISPLACEMENT = 0;
      const maximumAvailableWidth = IN_EDITOR_DISPLACEMENT + remainingWidthRightOfContent;
      const cursorPos = this._cursorPosIfTouchesEdit.read(reader);
      const maxPreviewEditorLeft = Math.max(
        // We're starting from the content area right and moving it left by IN_EDITOR_DISPLACEMENT and also by an amount to ensure some minimum desired width
        editorContentAreaWidth + horizontalScrollOffset - IN_EDITOR_DISPLACEMENT - Math.max(0, desiredMinimumWidth - maximumAvailableWidth),
        // But we don't want that the moving left ends up covering the cursor, so this will push it to the right again
        Math.min(
          cursorPos ? getOffsetForPos(this._editorObs, cursorPos, reader) + 50 : 0,
          editorContentAreaWidth + horizontalScrollOffset
        )
      );
      const previewEditorLeftInTextArea = Math.min(editorContentMaxWidthInRange + ORIGINAL_END_PADDING, maxPreviewEditorLeft);
      const maxContentWidth = editorContentMaxWidthInRange + ORIGINAL_END_PADDING + previewContentWidth + 70;
      const dist = maxPreviewEditorLeft - previewEditorLeftInTextArea;
      let desiredPreviewEditorScrollLeft;
      let codeRight;
      if (previewEditorLeftInTextArea > horizontalScrollOffset) {
        desiredPreviewEditorScrollLeft = 0;
        codeRight = editorLayout.contentLeft + previewEditorLeftInTextArea - horizontalScrollOffset;
      } else {
        desiredPreviewEditorScrollLeft = horizontalScrollOffset - previewEditorLeftInTextArea;
        codeRight = editorLayout.contentLeft;
      }
      const selectionTop = this._originalVerticalStartPosition.read(reader) ?? this._editor.getTopForLineNumber(range2.startLineNumber) - this._editorObs.scrollTop.read(reader);
      const selectionBottom = this._originalVerticalEndPosition.read(reader) ?? this._editor.getBottomForLineNumber(range2.endLineNumberExclusive - 1) - this._editorObs.scrollTop.read(reader);
      const codeLeft = editorLayout.contentLeft - horizontalScrollOffset;
      let codeRect = Rect.fromLeftTopRightBottom(codeLeft, selectionTop, codeRight, selectionBottom);
      const isInsertion2 = codeRect.height === 0;
      if (!isInsertion2) {
        codeRect = codeRect.withMargin(VERTICAL_PADDING2, HORIZONTAL_PADDING2);
      }
      const previewLineHeights = this._previewEditorObs.observeLineHeightsForLineRange(inlineEdit.modifiedLineRange).read(reader);
      const editHeight = previewLineHeights.reduce((acc, h3) => acc + h3, 0);
      const codeHeight = selectionBottom - selectionTop;
      const previewEditorHeight = Math.max(codeHeight, editHeight);
      const clipped = dist === 0;
      const codeEditDist = 0;
      const previewEditorWidth = Math.min(previewContentWidth + MODIFIED_END_PADDING, remainingWidthRightOfEditor + editorLayout.width - editorLayout.contentLeft - codeEditDist);
      let editRect = Rect.fromLeftTopWidthHeight(codeRect.right + codeEditDist, selectionTop, previewEditorWidth, previewEditorHeight);
      if (!isInsertion2) {
        editRect = editRect.withMargin(VERTICAL_PADDING2, HORIZONTAL_PADDING2).translateX(HORIZONTAL_PADDING2 + BORDER_WIDTH3);
      } else {
        editRect = editRect.withMargin(VERTICAL_PADDING2, HORIZONTAL_PADDING2).translateY(VERTICAL_PADDING2);
      }
      return {
        codeRect,
        editRect,
        codeScrollLeft: horizontalScrollOffset,
        contentLeft: editorLayout.contentLeft,
        isInsertion: isInsertion2,
        maxContentWidth,
        shouldShowShadow: clipped,
        desiredPreviewEditorScrollLeft,
        previewEditorWidth
      };
    });
    this._stickyScrollController = StickyScrollController2.get(this._editorObs.editor);
    this._stickyScrollHeight = this._stickyScrollController ? observableFromEvent(this._stickyScrollController.onDidChangeStickyScrollHeight, () => this._stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
    this._shouldOverflow = derived(this, (reader) => {
      if (!ENABLE_OVERFLOW) {
        return false;
      }
      const range2 = this._edit.read(reader)?.originalLineRange;
      if (!range2) {
        return false;
      }
      const stickyScrollHeight = this._stickyScrollHeight.read(reader);
      const top2 = this._editor.getTopForLineNumber(range2.startLineNumber) - this._editorObs.scrollTop.read(reader);
      if (top2 <= stickyScrollHeight) {
        return false;
      }
      const bottom = this._editor.getTopForLineNumber(range2.endLineNumberExclusive) - this._editorObs.scrollTop.read(reader);
      if (bottom >= this._editorObs.layoutInfo.read(reader).height) {
        return false;
      }
      return true;
    });
    this._originalBackgroundColor = observableFromEvent(this, this._themeService.onDidColorThemeChange, () => {
      return this._themeService.getColorTheme().getColor(originalBackgroundColor) ?? Color.transparent;
    });
    this._editorBackgroundColor = this._uiState.map((s) => {
      return getEditorBackgroundColor(s?.editorType ?? "textEditor" /* TextEditor */);
    });
    this._backgroundSvg = n.svg({
      transform: "translate(-0.5 -0.5)",
      style: { overflow: "visible", pointerEvents: "none", position: "absolute" }
    }, [
      n.svgElem("path", {
        class: "rightOfModifiedBackgroundCoverUp",
        d: derived(this, (reader) => {
          const layoutInfo = this._previewEditorLayoutInfo.read(reader);
          if (!layoutInfo) {
            return void 0;
          }
          const originalBackgroundColor2 = this._originalBackgroundColor.read(reader);
          if (originalBackgroundColor2.isTransparent()) {
            return void 0;
          }
          return new PathBuilder().moveTo(layoutInfo.codeRect.getRightTop()).lineTo(layoutInfo.codeRect.getRightTop().deltaX(1e3)).lineTo(layoutInfo.codeRect.getRightBottom().deltaX(1e3)).lineTo(layoutInfo.codeRect.getRightBottom()).build();
        }),
        style: {
          fill: this._editorBackgroundColor
        }
      })
    ]).keepUpdated(this._store);
    this._originalOverlay = n.div({
      style: { pointerEvents: "none", display: this._previewEditorLayoutInfo.map((layoutInfo) => layoutInfo?.isInsertion ? "none" : "block") }
    }, derived(this, (reader) => {
      const layoutInfoObs = mapOutFalsy(this._previewEditorLayoutInfo).read(reader);
      if (!layoutInfoObs) {
        return void 0;
      }
      const editorBackground2 = this._editorBackgroundColor.read(reader);
      const separatorWidth = separatorWidthObs.read(reader);
      const borderStyling = getOriginalBorderColor(this._tabAction).map((bc) => `${BORDER_WIDTH3}px solid ${asCssVariable(bc)}`);
      const borderStylingSeparator = `${BORDER_WIDTH3 + separatorWidth}px solid ${editorBackground2}`;
      const hasBorderLeft = layoutInfoObs.read(reader).codeScrollLeft !== 0;
      const isModifiedLower = layoutInfoObs.map((layoutInfo) => layoutInfo.codeRect.bottom < layoutInfo.editRect.bottom);
      const transitionRectSize = BORDER_RADIUS4 * 2 + BORDER_WIDTH3 * 2;
      const overlayHider = layoutInfoObs.map((layoutInfo) => Rect.fromLeftTopRightBottom(
        layoutInfo.contentLeft - BORDER_RADIUS4 - BORDER_WIDTH3,
        layoutInfo.codeRect.top,
        layoutInfo.contentLeft,
        layoutInfo.codeRect.bottom + transitionRectSize
      )).read(reader);
      const intersectionLine = new OffsetRange(overlayHider.left, Number.MAX_SAFE_INTEGER);
      const overlayRect = layoutInfoObs.map((layoutInfo) => layoutInfo.codeRect.intersectHorizontal(intersectionLine));
      const separatorRect = overlayRect.map((overlayRect2) => overlayRect2.withMargin(separatorWidth, 0, separatorWidth, separatorWidth).intersectHorizontal(intersectionLine));
      const transitionRect = overlayRect.map((overlayRect2) => Rect.fromLeftTopWidthHeight(overlayRect2.right - transitionRectSize + BORDER_WIDTH3, overlayRect2.bottom - BORDER_WIDTH3, transitionRectSize, transitionRectSize).intersectHorizontal(intersectionLine));
      return [
        n.div({
          class: "originalSeparatorSideBySide",
          style: {
            ...separatorRect.read(reader).toStyles(),
            boxSizing: "border-box",
            borderRadius: `${BORDER_RADIUS4}px 0 0 ${BORDER_RADIUS4}px`,
            borderTop: borderStylingSeparator,
            borderBottom: borderStylingSeparator,
            borderLeft: hasBorderLeft ? "none" : borderStylingSeparator
          }
        }),
        n.div({
          class: "originalOverlaySideBySide",
          style: {
            ...overlayRect.read(reader).toStyles(),
            boxSizing: "border-box",
            borderRadius: `${BORDER_RADIUS4}px 0 0 ${BORDER_RADIUS4}px`,
            borderTop: borderStyling,
            borderBottom: borderStyling,
            borderLeft: hasBorderLeft ? "none" : borderStyling,
            backgroundColor: asCssVariable(originalBackgroundColor)
          }
        }),
        n.div({
          class: "originalCornerCutoutSideBySide",
          style: {
            pointerEvents: "none",
            display: isModifiedLower.map((isLower2) => isLower2 ? "block" : "none"),
            ...transitionRect.read(reader).toStyles()
          }
        }, [
          n.div({
            class: "originalCornerCutoutBackground",
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "100%",
              height: "100%",
              backgroundColor: getEditorBlendedColor(originalBackgroundColor, this._themeService).map((c) => c.toString())
            }
          }),
          n.div({
            class: "originalCornerCutoutBorder",
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              borderTop: borderStyling,
              borderRight: borderStyling,
              borderRadius: `0 100% 0 0`,
              backgroundColor: editorBackground2
            }
          })
        ]),
        n.div({
          class: "originalOverlaySideBySideHider",
          style: {
            ...overlayHider.toStyles(),
            backgroundColor: editorBackground2
          }
        })
      ];
    })).keepUpdated(this._store);
    this._modifiedOverlay = n.div({
      style: { pointerEvents: "none" }
    }, derived(this, (reader) => {
      const layoutInfoObs = mapOutFalsy(this._previewEditorLayoutInfo).read(reader);
      if (!layoutInfoObs) {
        return void 0;
      }
      const isModifiedLower = layoutInfoObs.map((layoutInfo) => layoutInfo.codeRect.bottom < layoutInfo.editRect.bottom);
      const editorBackground2 = this._editorBackgroundColor.read(reader);
      const separatorWidth = separatorWidthObs.read(reader);
      const borderRadius = isModifiedLower.map((isLower2) => `0 ${BORDER_RADIUS4}px ${BORDER_RADIUS4}px ${isLower2 ? BORDER_RADIUS4 : 0}px`);
      const borderStyling = getEditorBlendedColor(getModifiedBorderColor(this._tabAction), this._themeService).map((c) => `1px solid ${c.toString()}`);
      const borderStylingSeparator = `${BORDER_WIDTH3 + separatorWidth}px solid ${editorBackground2}`;
      const overlayRect = layoutInfoObs.map((layoutInfo) => layoutInfo.editRect.withMargin(0, BORDER_WIDTH3));
      const separatorRect = overlayRect.map((overlayRect2) => overlayRect2.withMargin(separatorWidth, separatorWidth, separatorWidth, 0));
      const insertionRect = derived(this, (reader2) => {
        const overlay = overlayRect.read(reader2);
        const layoutinfo = layoutInfoObs.read(reader2);
        if (!layoutinfo.isInsertion || layoutinfo.contentLeft >= overlay.left) {
          return Rect.fromLeftTopWidthHeight(overlay.left, overlay.top, 0, 0);
        }
        return new Rect(layoutinfo.contentLeft, overlay.top, overlay.left, overlay.top + BORDER_WIDTH3 * 2);
      });
      return [
        n.div({
          class: "modifiedInsertionSideBySide",
          style: {
            ...insertionRect.read(reader).toStyles(),
            backgroundColor: getModifiedBorderColor(this._tabAction).map((c) => asCssVariable(c))
          }
        }),
        n.div({
          class: "modifiedSeparatorSideBySide",
          style: {
            ...separatorRect.read(reader).toStyles(),
            borderRadius,
            borderTop: borderStylingSeparator,
            borderBottom: borderStylingSeparator,
            borderRight: borderStylingSeparator,
            boxSizing: "border-box"
          }
        }),
        n.div({
          class: "modifiedOverlaySideBySide",
          style: {
            ...overlayRect.read(reader).toStyles(),
            borderRadius,
            border: borderStyling,
            boxSizing: "border-box",
            backgroundColor: asCssVariable(modifiedBackgroundColor)
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
      this._backgroundSvg,
      derived(this, (reader) => this._shouldOverflow.read(reader) ? [] : [this._editorContainer, this._originalOverlay, this._modifiedOverlay])
    ]).keepUpdated(this._store);
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._nonOverflowView.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: derived(this, (reader) => {
        const x = this._previewEditorLayoutInfo.read(reader)?.maxContentWidth;
        if (x === void 0) {
          return 0;
        }
        return x;
      })
    }));
    this.previewEditor.setModel(this._previewTextModel);
    this._register(autorun((reader) => {
      const layoutInfo = this._previewEditorLayoutInfo.read(reader);
      if (!layoutInfo) {
        return;
      }
      const editorRect = layoutInfo.editRect.withMargin(-VERTICAL_PADDING2, -HORIZONTAL_PADDING2);
      this.previewEditor.layout({
        height: editorRect.height,
        width: layoutInfo.previewEditorWidth + 15
        /* Make sure editor does not scroll horizontally */
      });
      this._editorContainer.element.style.top = `${editorRect.top}px`;
      this._editorContainer.element.style.left = `${editorRect.left}px`;
      this._editorContainer.element.style.width = `${layoutInfo.previewEditorWidth + HORIZONTAL_PADDING2}px`;
    }));
    this._register(autorun((reader) => {
      const layoutInfo = this._previewEditorLayoutInfo.read(reader);
      if (!layoutInfo) {
        return;
      }
      this._previewEditorObs.editor.setScrollLeft(layoutInfo.desiredPreviewEditorScrollLeft);
    }));
    this._updatePreviewEditor.recomputeInitiallyAndOnChange(this._store);
  }
  // This is an approximation and should be improved by using the real parameters used bellow
  static fitsInsideViewport(editor, textModel, edit3, reader) {
    const editorObs = observableCodeEditor(editor);
    const editorWidth = editorObs.layoutInfoWidth.read(reader);
    const editorContentLeft = editorObs.layoutInfoContentLeft.read(reader);
    const editorVerticalScrollbar = editor.getLayoutInfo().verticalScrollbarWidth;
    const minimapWidth = editorObs.layoutInfoMinimap.read(reader).minimapLeft !== 0 ? editorObs.layoutInfoMinimap.read(reader).minimapWidth : 0;
    const maxOriginalContent = maxContentWidthInRange(
      editorObs,
      edit3.displayRange,
      void 0
      /* do not reconsider on each layout info change */
    );
    const maxModifiedContent = edit3.lineEdit.newLines.reduce((max, line) => Math.max(max, getContentRenderWidth(line, editor, textModel)), 0);
    const originalPadding = ORIGINAL_END_PADDING;
    const modifiedPadding = MODIFIED_END_PADDING + 2 * BORDER_WIDTH3;
    return maxOriginalContent + maxModifiedContent + originalPadding + modifiedPadding < editorWidth - editorContentLeft - editorVerticalScrollbar - minimapWidth;
  }
};

InlineEditsSideBySideView = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IUserInteractionService)
], InlineEditsSideBySideView);
export { HORIZONTAL_PADDING2, VERTICAL_PADDING2, ENABLE_OVERFLOW, BORDER_WIDTH3, WIDGET_SEPARATOR_WIDTH3, WIDGET_SEPARATOR_DIFF_EDITOR_WIDTH3, BORDER_RADIUS4, ORIGINAL_END_PADDING, MODIFIED_END_PADDING, InlineEditsSideBySideView };
