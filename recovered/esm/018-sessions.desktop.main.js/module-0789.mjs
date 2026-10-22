// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/inlineEditsLongDistanceHint.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { derived, derivedDisposable } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { LineRange } from "./module-0174.mjs";
import { getContentSizeOfLines, rectToProps } from "./module-0772.mjs";
import { WidgetPlacementContext, splitIntoContinuousLineRanges } from "./module-0788.mjs";
import { debouncedObservable2 } from "./module-0059.mjs";
import { Point } from "./module-0492.mjs";
import { debugLogRects, debugView } from "./module-0783.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { Rect } from "./module-0765.mjs";
import { distributeFlexBoxLayout } from "./module-0784.mjs";
import { n } from "./module-0075.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { editorWidgetBackground, editorWidgetBorder } from "./module-0229.mjs";
import { descriptionForeground } from "./module-0227.mjs";
import { basename2 } from "./module-0034.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { jumpToNextInlineEditId } from "./module-0580.mjs";
import { HideUnchangedRegionsFeature } from "./module-0525.mjs";
import { getEditorBackgroundColor, getEditorBlendedColor, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorSuccessfulBackground, observeColor } from "./module-0771.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { LongDistancePreviewEditor } from "./module-0786.mjs";
import { constObservable } from "./module-0061.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/longDistanceHint/inlineEditsLongDistanceHint.ts
var BORDER_RADIUS3 = 6;

var MAX_WIDGET_WIDTH = { EMPTY_SPACE: 425, OVERLAY: 375 };

var MIN_WIDGET_WIDTH = 250;

var DEFAULT_WIDGET_LAYOUT_CONSTANTS = {
  previewEditorMargin: 2,
  widgetPadding: 2,
  widgetBorder: 1,
  lowerBarHeight: 20,
  minWidgetWidth: MIN_WIDGET_WIDTH
};

var InlineEditsLongDistanceHint = class extends Disposable {
  constructor(_editor, _viewState, _previewTextModel, _tabAction, _instantiationService, _themeService, _keybindingService, _modelService, _languageService) {
    super();
    this._editor = _editor;
    this._viewState = _viewState;
    this._previewTextModel = _previewTextModel;
    this._tabAction = _tabAction;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this._keybindingService = _keybindingService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this.onDidClick = Event2.None;
    this._viewWithElement = void 0;
    this._hintTextPosition = derived(this, (reader) => {
      const viewState = this._viewState.read(reader);
      return viewState ? new Position(viewState.hint.lineNumber, Number.MAX_SAFE_INTEGER) : null;
    });
    this._lineSizesAroundHintPosition = derived(this, (reader) => {
      const viewState = this._viewState.read(reader);
      const p = this._hintTextPosition.read(reader);
      if (!viewState || !p) {
        return [];
      }
      const model = this._editorObs.model.read(reader);
      if (!model) {
        return [];
      }
      const range2 = LineRange.ofLength(p.lineNumber, 1).addMargin(5, 5).intersect(LineRange.ofLength(1, model.getLineCount()));
      if (!range2) {
        return [];
      }
      const sizes = getContentSizeOfLines(this._editorObs, range2, reader);
      const top2 = this._editorObs.observeTopForLineNumber(range2.startLineNumber).read(reader);
      return splitIntoContinuousLineRanges(range2, sizes, top2, this._editorObs, reader);
    });
    this._isVisibleDelayed = debouncedObservable2(
      derived(this, (reader) => this._viewState.read(reader)?.hint.isVisible),
      (lastValue, newValue) => lastValue === true && newValue === false ? 200 : 0
    );
    this._previewEditorLayoutInfo = derived(this, (reader) => {
      const viewState = this._viewState.read(reader);
      if (!viewState || !this._isVisibleDelayed.read(reader)) {
        return void 0;
      }
      const continousLineRanges = this._lineSizesAroundHintPosition.read(reader);
      if (continousLineRanges.length === 0) {
        return void 0;
      }
      const editorScrollTop = this._editorObs.scrollTop.read(reader);
      const editorScrollLeft = this._editorObs.scrollLeft.read(reader);
      const editorLayout = this._editorObs.layoutInfo.read(reader);
      const previewContentHeight = this._previewEditor.contentHeight.read(reader);
      const previewEditorContentLayout = this._previewEditor.horizontalContentRangeInPreviewEditorToShow.read(reader);
      if (!previewContentHeight || !previewEditorContentLayout) {
        return void 0;
      }
      const editorTrueContentWidth = editorLayout.contentWidth - editorLayout.verticalScrollbarWidth;
      const editorTrueContentRight = editorLayout.contentLeft + editorTrueContentWidth;
      const c = this._editorObs.cursorLineNumber.read(reader);
      if (!c) {
        return void 0;
      }
      const layoutConstants = DEFAULT_WIDGET_LAYOUT_CONSTANTS;
      const extraGutterMarginToAvoidScrollBar = 2;
      const previewEditorHeight = previewContentHeight + extraGutterMarginToAvoidScrollBar;
      let possibleWidgetOutline;
      let lastPlacementContext;
      const endOfLinePadding = (lineNumber) => lineNumber === viewState.hint.lineNumber ? 40 : 20;
      for (const continousLineRange of continousLineRanges) {
        const placementContext = new WidgetPlacementContext(
          continousLineRange,
          editorTrueContentWidth,
          endOfLinePadding
        );
        lastPlacementContext = placementContext;
        const showRects = false;
        if (showRects) {
          const rects2 = stackSizesDown(
            new Point(editorTrueContentRight, continousLineRange.top - editorScrollTop),
            placementContext.availableSpaceSizes,
            "right"
          );
          debugView(debugLogRects({ ...rects2 }, this._editor.getDomNode()), reader);
        }
        possibleWidgetOutline = placementContext.tryFindWidgetOutline(
          viewState.hint.lineNumber,
          previewEditorHeight,
          editorTrueContentRight,
          layoutConstants
        );
        if (possibleWidgetOutline) {
          break;
        }
      }
      let position2 = "empty-space";
      if (!possibleWidgetOutline) {
        position2 = "overlay";
        const maxAvailableWidth = Math.min(editorLayout.width - editorLayout.contentLeft, MAX_WIDGET_WIDTH.OVERLAY);
        const fallbackPlacementContext = lastPlacementContext ?? new WidgetPlacementContext(
          continousLineRanges[0],
          editorTrueContentWidth,
          endOfLinePadding
        );
        possibleWidgetOutline = {
          horizontalWidgetRange: OffsetRange.ofStartAndLength(editorTrueContentRight - maxAvailableWidth, maxAvailableWidth),
          verticalWidgetRange: fallbackPlacementContext.getWidgetVerticalOutline(
            viewState.hint.lineNumber + 2,
            previewEditorHeight,
            layoutConstants
          ).delta(10)
        };
      }
      if (!possibleWidgetOutline) {
        return void 0;
      }
      const rectAvailableSpace = Rect.fromRanges(
        possibleWidgetOutline.horizontalWidgetRange,
        possibleWidgetOutline.verticalWidgetRange
      ).translateX(-editorScrollLeft).translateY(-editorScrollTop);
      const showAvailableSpace = false;
      if (showAvailableSpace) {
        debugView(debugLogRects({ rectAvailableSpace }, this._editor.getDomNode()), reader);
      }
      const { previewEditorMargin, widgetPadding, widgetBorder: widgetBorder2, lowerBarHeight } = layoutConstants;
      const maxWidgetWidthUpperBound = position2 === "overlay" ? MAX_WIDGET_WIDTH.OVERLAY : MAX_WIDGET_WIDTH.EMPTY_SPACE;
      const contentBasedWidgetWidth = previewEditorContentLayout.maxEditorWidth + previewEditorMargin + widgetPadding;
      const maxWidgetWidth = Math.min(maxWidgetWidthUpperBound, Math.max(contentBasedWidgetWidth, layoutConstants.minWidgetWidth));
      const layout2 = distributeFlexBoxLayout(rectAvailableSpace.width, {
        spaceBefore: { min: 0, max: 10, priority: 1 },
        content: { min: 50, rules: [{ max: 150, priority: 2 }, { max: maxWidgetWidth, priority: 1 }] },
        spaceAfter: { min: 10 }
      });
      if (!layout2) {
        return null;
      }
      const ranges = lengthsToOffsetRanges([layout2.spaceBefore, layout2.content, layout2.spaceAfter], rectAvailableSpace.left);
      const spaceBeforeRect = rectAvailableSpace.withHorizontalRange(ranges[0]);
      const widgetRect = rectAvailableSpace.withHorizontalRange(ranges[1]);
      const spaceAfterRect = rectAvailableSpace.withHorizontalRange(ranges[2]);
      const showRects2 = false;
      if (showRects2) {
        debugView(debugLogRects({ spaceBeforeRect, widgetRect, spaceAfterRect }, this._editor.getDomNode()), reader);
      }
      const previewEditorRect = widgetRect.withMargin(-widgetPadding - widgetBorder2 - previewEditorMargin).withMargin(0, 0, -lowerBarHeight, 0);
      const showEditorRect = false;
      if (showEditorRect) {
        debugView(debugLogRects({ previewEditorRect }, this._editor.getDomNode()), reader);
      }
      const previewEditorContentWidth = previewEditorRect.width - previewEditorContentLayout.nonContentWidth;
      const maxPrefferedRangeLength = previewEditorContentWidth * 0.8;
      const preferredRangeToReveal = previewEditorContentLayout.preferredRangeToReveal.intersect(OffsetRange.ofStartAndLength(
        previewEditorContentLayout.preferredRangeToReveal.start,
        maxPrefferedRangeLength
      )) ?? previewEditorContentLayout.preferredRangeToReveal;
      const desiredPreviewEditorScrollLeft = scrollToReveal(previewEditorContentLayout.indentationEnd, previewEditorContentWidth, preferredRangeToReveal);
      return {
        codeEditorSize: previewEditorRect.getSize(),
        codeScrollLeft: editorScrollLeft,
        contentLeft: editorLayout.contentLeft,
        widgetRect,
        previewEditorMargin,
        widgetPadding,
        widgetBorder: widgetBorder2,
        lowerBarHeight,
        desiredPreviewEditorScrollLeft: desiredPreviewEditorScrollLeft.newScrollPosition
      };
    });
    this._view = n.div({
      class: "inline-edits-view",
      style: {
        position: "absolute",
        overflow: "visible",
        top: "0px",
        left: "0px",
        display: derived(this, (reader) => !!this._previewEditorLayoutInfo.read(reader) ? "block" : "none")
      }
    }, [
      derived(this, (_reader) => [this._widgetContent])
    ]);
    this._widgetContent = derived(
      this,
      (reader) => (
        // TODO@hediet: remove when n.div lazily creates previewEditor.element node
        n.div({
          class: ["inline-edits-long-distance-hint-widget", "show-file-icons"],
          style: {
            position: "absolute",
            overflow: "hidden",
            cursor: "pointer",
            background: asCssVariable(editorWidgetBackground),
            padding: this._previewEditorLayoutInfo.map((i2) => i2?.widgetPadding),
            boxSizing: "border-box",
            borderRadius: BORDER_RADIUS3,
            border: derived((reader2) => `${this._previewEditorLayoutInfo.read(reader2)?.widgetBorder}px solid ${this._styles.read(reader2).border}`),
            display: "flex",
            flexDirection: "column",
            opacity: derived((reader2) => this._viewState.read(reader2)?.hint.isVisible ? "1" : "0"),
            transition: "opacity 200ms ease-in-out",
            ...rectToProps((reader2) => this._previewEditorLayoutInfo.read(reader2)?.widgetRect)
          },
          onmousedown: (e4) => {
            e4.preventDefault();
          },
          onclick: () => {
            this._viewState.read(void 0)?.model.jump();
          }
        }, [
          n.div({
            class: ["editorContainer"],
            style: {
              overflow: "hidden",
              padding: this._previewEditorLayoutInfo.map((i2) => i2?.previewEditorMargin),
              background: this._styles.map((s) => s.background),
              pointerEvents: "none"
            }
          }, [
            derived(this, (r2) => this._previewEditor.element)
            // --
          ]),
          n.div({ class: "bar", style: { color: asCssVariable(descriptionForeground), pointerEvents: "none", margin: "0 4px", height: this._previewEditorLayoutInfo.map((i2) => i2?.lowerBarHeight), display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
            derived(this, (reader2) => {
              const children = [];
              const viewState = this._viewState.read(reader2);
              if (!viewState) {
                return children;
              }
              const currentModel = this._editorObs.model.read(reader2);
              const targetUri = viewState.target.uri;
              const isCrossFileEdit = !currentModel || !viewState.target.targets(currentModel);
              if (isCrossFileEdit) {
                const fileName = basename2(targetUri);
                const iconClasses = getIconClasses(this._modelService, this._languageService, targetUri, 0 /* FILE */);
                children.push(n.div({
                  class: "target-file",
                  style: { display: "flex", alignItems: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                }, [
                  n.elem("span", { class: iconClasses, style: { flexShrink: "0", marginRight: "4px" } }),
                  fileName
                ]));
              } else {
                const source = this._originalOutlineSource.read(reader2);
                const originalTargetLineNumber2 = this._originalTargetLineNumber.read(reader2);
                const outlineItems = source?.getAt(originalTargetLineNumber2, reader2).slice(0, 1) ?? [];
                const outlineElements = [];
                if (outlineItems.length > 0) {
                  for (let i2 = 0; i2 < outlineItems.length; i2++) {
                    const item = outlineItems[i2];
                    const icon2 = SymbolKinds.toIcon(item.kind);
                    outlineElements.push(n.div({
                      class: "breadcrumb-item",
                      style: { display: "flex", alignItems: "center", flex: "1 1 auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }
                    }, [
                      renderIcon(icon2),
                      "\xA0",
                      item.name,
                      ...i2 === outlineItems.length - 1 ? [] : [renderIcon(Codicon.chevronRight)]
                    ]));
                  }
                }
                children.push(n.div({ class: "outline-elements", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, outlineElements));
              }
              const originalTargetLineNumber = this._originalTargetLineNumber.read(reader2);
              const arrowIcon = isCrossFileEdit ? Codicon.arrowRight : viewState.hint.lineNumber < originalTargetLineNumber ? Codicon.arrowDown : Codicon.arrowUp;
              const keybinding = this._keybindingService.lookupKeybinding(jumpToNextInlineEditId);
              let label3 = isCrossFileEdit ? "Go to file" : "Go to suggestion";
              if (keybinding && keybinding.getLabel() === "Tab") {
                label3 = isCrossFileEdit ? "Tab to open" : "Tab to jump";
              }
              children.push(n.div({
                class: "go-to-label",
                style: { position: "relative", display: "flex", alignItems: "center", flex: "0 0 auto", paddingLeft: "6px" }
              }, [
                label3,
                "\xA0",
                renderIcon(arrowIcon)
              ]));
              return children;
            })
          ])
        ])
      )
    );
    // Drives breadcrumbs and symbol icon
    this._originalTargetLineNumber = derived(this, (reader) => {
      const viewState = this._viewState.read(reader);
      if (!viewState) {
        return -1;
      }
      if (viewState.edit.action?.kind === "jumpTo") {
        return viewState.edit.action.position.lineNumber;
      }
      return viewState.diff[0]?.original.startLineNumber ?? -1;
    });
    this._originalOutlineSource = derivedDisposable(this, (reader) => {
      const m = this._editorObs.model.read(reader);
      const factory = HideUnchangedRegionsFeature._breadcrumbsSourceFactory.read(reader);
      return !m || !factory ? void 0 : factory(m, this._instantiationService);
    });
    this._styles = derived((reader) => {
      const v2 = this._tabAction.read(reader);
      const widgetBorderColor = observeColor(editorWidgetBorder, this._themeService).read(reader);
      const isHighContrast2 = observableFromEvent(this._themeService.onDidColorThemeChange, () => {
        const theme = this._themeService.getColorTheme();
        return theme.type === "hcDark" || theme.type === "hcLight";
      }).read(reader);
      let borderColor;
      if (isHighContrast2) {
        borderColor = widgetBorderColor;
      } else {
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
        borderColor = getEditorBlendedColor(border, this._themeService).read(reader);
      }
      return {
        border: borderColor.toString(),
        background: getEditorBackgroundColor(this._viewState.map((s) => s?.editorType ?? "textEditor" /* TextEditor */).read(reader))
      };
    });
    this._editorObs = observableCodeEditor(this._editor);
    this._previewEditor = this._register(
      this._instantiationService.createInstance(
        LongDistancePreviewEditor,
        this._previewTextModel,
        derived((reader) => {
          const viewState = this._viewState.read(reader);
          if (!viewState) {
            return void 0;
          }
          return {
            diff: viewState.diff,
            model: viewState.model,
            inlineSuggestInfo: viewState.inlineSuggestInfo,
            nextCursorPosition: viewState.nextCursorPosition,
            target: viewState.target
          };
        }),
        this._editor,
        this._tabAction
      )
    );
    this._viewWithElement = this._view.keepUpdated(this._store);
    this._register(this._editorObs.createOverlayWidget({
      domNode: this._viewWithElement.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._widgetContent.get().keepUpdated(this._store);
    this._register(autorun((reader) => {
      const layoutInfo = this._previewEditorLayoutInfo.read(reader);
      if (!layoutInfo) {
        return;
      }
      this._previewEditor.layout(layoutInfo.codeEditorSize.toDimension(), layoutInfo.desiredPreviewEditorScrollLeft);
    }));
    this._isVisibleDelayed.recomputeInitiallyAndOnChange(this._store);
  }
  get isHovered() {
    return this._widgetContent.get().didMouseMoveDuringHover;
  }
};

InlineEditsLongDistanceHint = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IModelService),
  __decorateParam(8, ILanguageService)
], InlineEditsLongDistanceHint);

function lengthsToOffsetRanges(lengths, initialOffset = 0) {
  const result = [];
  let offset = initialOffset;
  for (const length of lengths) {
    result.push(new OffsetRange(offset, offset + length));
    offset += length;
  }
  return result;
}

function stackSizesDown(at, sizes, alignment = "left") {
  const rects = [];
  let offset = 0;
  for (const s of sizes) {
    rects.push(
      Rect.fromLeftTopWidthHeight(
        at.x + (alignment === "left" ? 0 : -s.width),
        at.y + offset,
        s.width,
        s.height
      )
    );
    offset += s.height;
  }
  return rects;
}

function scrollToReveal(currentScrollPosition, windowWidth, contentRangeToReveal) {
  const visibleRange = new OffsetRange(currentScrollPosition, currentScrollPosition + windowWidth);
  if (visibleRange.containsRange(contentRangeToReveal)) {
    return { newScrollPosition: currentScrollPosition };
  }
  if (contentRangeToReveal.length > windowWidth) {
    return { newScrollPosition: contentRangeToReveal.start };
  }
  if (contentRangeToReveal.endExclusive > visibleRange.endExclusive) {
    return { newScrollPosition: contentRangeToReveal.endExclusive - windowWidth };
  }
  if (contentRangeToReveal.start < visibleRange.start) {
    return { newScrollPosition: contentRangeToReveal.start };
  }
  return { newScrollPosition: currentScrollPosition };
}
export { lengthsToOffsetRanges, stackSizesDown, scrollToReveal, BORDER_RADIUS3, MAX_WIDGET_WIDTH, MIN_WIDGET_WIDTH, DEFAULT_WIDGET_LAYOUT_CONSTANTS, InlineEditsLongDistanceHint };
