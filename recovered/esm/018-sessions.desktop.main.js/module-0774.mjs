// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorView.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { INLINE_EDITS_BORDER_RADIUS, getEditorBlendedColor, inlineEditIndicatorBackground, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorPrimaryBorder, inlineEditIndicatorPrimaryForeground, inlineEditIndicatorSecondaryBackground, inlineEditIndicatorSecondaryBorder, inlineEditIndicatorSecondaryForeground, inlineEditIndicatorSuccessfulBackground, inlineEditIndicatorSuccessfulBorder, inlineEditIndicatorSuccessfulForeground } from "./module-0771.mjs";
import { assertNever } from "./module-0009.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { Rect } from "./module-0765.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { constObservable } from "./module-0061.mjs";
import { Codicon } from "./module-0085.mjs";
import { n } from "./module-0075.mjs";
import { observableValue } from "./module-0048.mjs";
import { debouncedObservable } from "./module-0059.mjs";
import { mapOutFalsy, rectToProps } from "./module-0772.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { renderIcon } from "./module-0467.mjs";
import { StickyScrollController2 } from "./module-0770.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { runOnChange } from "./module-0064.mjs";
import { autorun } from "./module-0052.mjs";
import { GutterIndicatorMenuContent } from "./module-0773.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IUserInteractionService } from "./module-0366.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/components/gutterIndicatorView.ts
var InlineEditsGutterIndicatorData = class {
  constructor(gutterMenuData, originalRange, model, altAction, customization) {
    this.gutterMenuData = gutterMenuData;
    this.originalRange = originalRange;
    this.model = model;
    this.altAction = altAction;
    this.customization = customization;
  }
};

var InlineSuggestionGutterMenuData = class _InlineSuggestionGutterMenuData {
  constructor(action, displayName, extensionCommands, alternativeAction, modelInfo, setModelId, extensionCommandsOnly = false) {
    this.action = action;
    this.displayName = displayName;
    this.extensionCommands = extensionCommands;
    this.alternativeAction = alternativeAction;
    this.modelInfo = modelInfo;
    this.setModelId = setModelId;
    this.extensionCommandsOnly = extensionCommandsOnly;
  }
  static fromInlineSuggestion(suggestion) {
    const alternativeAction = suggestion.action?.kind === "edit" ? suggestion.action.alternativeAction : void 0;
    const commands = suggestion.source.inlineSuggestions.commands ?? [];
    return new _InlineSuggestionGutterMenuData(
      suggestion.gutterMenuLinkAction,
      suggestion.source.provider.displayName ?? localize(1401, null),
      commands.length > 0 ? [commands] : [],
      alternativeAction,
      suggestion.source.provider.modelInfo,
      suggestion.source.provider.setModelId?.bind(suggestion.source.provider)
    );
  }
};

var SimpleInlineSuggestModel = class _SimpleInlineSuggestModel {
  constructor(accept, jump) {
    this.accept = accept;
    this.jump = jump;
  }
  static fromInlineCompletionModel(model) {
    return new _SimpleInlineSuggestModel(
      () => model.accept(),
      () => model.jump()
    );
  }
};

var CODICON_SIZE_PX = 16;

var CODICON_PADDING_PX = 2;

var InlineEditsGutterIndicator = class extends Disposable {
  constructor(_editorObs, _data, _tabAction, _verticalOffset, _isHoveringOverInlineEdit, _focusIsInMenu, _hoverService, _instantiationService, _accessibilityService, _themeService, _userInteractionService) {
    super();
    this._editorObs = _editorObs;
    this._data = _data;
    this._tabAction = _tabAction;
    this._verticalOffset = _verticalOffset;
    this._isHoveringOverInlineEdit = _isHoveringOverInlineEdit;
    this._focusIsInMenu = _focusIsInMenu;
    this._hoverService = _hoverService;
    this._instantiationService = _instantiationService;
    this._accessibilityService = _accessibilityService;
    this._themeService = _themeService;
    this._userInteractionService = _userInteractionService;
    this._onDidCloseWithCommand = this._register(new Emitter());
    this.onDidCloseWithCommand = this._onDidCloseWithCommand.event;
    this._modifierPressed = derived(
      this,
      (reader) => this._userInteractionService.readModifierKeyStatus(this._editorObs.editor.getDomNode(), reader).shiftKey
    );
    this._gutterIndicatorStyles = derived(this, (reader) => {
      let v2 = this._tabAction.read(reader);
      const altAction = this._data.read(reader)?.altAction;
      const modifiedPressed = this._modifierPressed.read(reader);
      if (altAction && modifiedPressed) {
        v2 = "inactive" /* Inactive */;
      }
      switch (v2) {
        case "inactive" /* Inactive */:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorSecondaryBackground, this._themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorSecondaryForeground, this._themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorSecondaryBorder, this._themeService).read(reader).toString()
          };
        case "jump" /* Jump */:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorPrimaryBackground, this._themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorPrimaryForeground, this._themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorPrimaryBorder, this._themeService).read(reader).toString()
          };
        case "accept" /* Accept */:
          return {
            background: getEditorBlendedColor(inlineEditIndicatorSuccessfulBackground, this._themeService).read(reader).toString(),
            foreground: getEditorBlendedColor(inlineEditIndicatorSuccessfulForeground, this._themeService).read(reader).toString(),
            border: getEditorBlendedColor(inlineEditIndicatorSuccessfulBorder, this._themeService).read(reader).toString()
          };
        default:
          assertNever(v2);
      }
    });
    this._state = derived(this, (reader) => {
      const range2 = this._originalRangeObs.read(reader);
      if (!range2) {
        return void 0;
      }
      return {
        range: range2,
        lineOffsetRange: this._editorObs.observeLineOffsetRange(range2, reader.store)
      };
    });
    this._lineNumberToRender = derived(this, (reader) => {
      if (this._verticalOffset.read(reader) !== 0) {
        return "";
      }
      const lineNumber = this._data.read(reader)?.originalRange.startLineNumber;
      const lineNumberOptions = this._editorObs.getOption(76 /* lineNumbers */).read(reader);
      if (lineNumber === void 0 || lineNumberOptions.renderType === 0 /* Off */) {
        return "";
      }
      if (lineNumberOptions.renderType === 3 /* Interval */) {
        const cursorPosition = this._editorObs.cursorPosition.read(reader);
        if (lineNumber % 10 === 0 || cursorPosition && cursorPosition.lineNumber === lineNumber) {
          return lineNumber.toString();
        }
        return "";
      }
      if (lineNumberOptions.renderType === 2 /* Relative */) {
        const cursorPosition = this._editorObs.cursorPosition.read(reader);
        if (!cursorPosition) {
          return "";
        }
        const relativeLineNumber = Math.abs(lineNumber - cursorPosition.lineNumber);
        if (relativeLineNumber === 0) {
          return lineNumber.toString();
        }
        return relativeLineNumber.toString();
      }
      if (lineNumberOptions.renderType === 4 /* Custom */) {
        if (lineNumberOptions.renderFn) {
          return lineNumberOptions.renderFn(lineNumber);
        }
        return "";
      }
      return lineNumber.toString();
    });
    this._availableWidthForIcon = derived(this, (reader) => {
      const textModel = this._editorObs.editor.getModel();
      const editor = this._editorObs.editor;
      const layout2 = this._editorObs.layoutInfo.read(reader);
      const gutterWidth = layout2.decorationsLeft + layout2.decorationsWidth - layout2.glyphMarginLeft;
      if (!textModel || gutterWidth <= 0) {
        return () => 0;
      }
      if (layout2.lineNumbersLeft === 0) {
        return () => gutterWidth;
      }
      const lineNumberOptions = this._editorObs.getOption(76 /* lineNumbers */).read(reader);
      if (lineNumberOptions.renderType === 2 /* Relative */ || /* likely to flicker */
      lineNumberOptions.renderType === 0 /* Off */) {
        return () => gutterWidth;
      }
      const w = editor.getOption(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
      const rightOfLineNumber = layout2.lineNumbersLeft + layout2.lineNumbersWidth;
      const totalLines = textModel.getLineCount();
      const totalLinesDigits = (totalLines + 1).toString().length;
      const offsetDigits = [];
      for (let digits = 1; digits <= totalLinesDigits; digits++) {
        const firstLineNumberWithDigitCount = 10 ** (digits - 1);
        const topOfLineNumber = editor.getTopForLineNumber(firstLineNumberWithDigitCount);
        const digitsWidth = digits * w;
        const usableWidthLeftOfLineNumber = Math.min(gutterWidth, Math.max(0, rightOfLineNumber - digitsWidth - layout2.glyphMarginLeft));
        offsetDigits.push({ firstLineNumberWithDigitCount, topOfLineNumber, usableWidthLeftOfLineNumber });
      }
      return (topOffset) => {
        for (let i2 = offsetDigits.length - 1; i2 >= 0; i2--) {
          if (topOffset >= offsetDigits[i2].topOfLineNumber) {
            return offsetDigits[i2].usableWidthLeftOfLineNumber;
          }
        }
        throw new BugIndicatingError("Could not find avilable width for icon");
      };
    });
    this._layout = derived(this, (reader) => {
      const s = this._state.read(reader);
      if (!s) {
        return void 0;
      }
      const layout2 = this._editorObs.layoutInfo.read(reader);
      const lineHeight = this._editorObs.observeLineHeightForLine(s.range.map((r2) => r2.startLineNumber)).read(reader);
      const gutterViewPortPaddingLeft = 1;
      const gutterViewPortPaddingTop = 2;
      const gutterWidthWithoutPadding = layout2.decorationsLeft + layout2.decorationsWidth - layout2.glyphMarginLeft - 2 * gutterViewPortPaddingLeft;
      const gutterHeightWithoutPadding = layout2.height - 2 * gutterViewPortPaddingTop;
      const gutterViewPortWithStickyScroll = Rect.fromLeftTopWidthHeight(gutterViewPortPaddingLeft, gutterViewPortPaddingTop, gutterWidthWithoutPadding, gutterHeightWithoutPadding);
      const gutterViewPortWithoutStickyScrollWithoutPaddingTop = gutterViewPortWithStickyScroll.withTop(this._stickyScrollHeight.read(reader));
      const gutterViewPortWithoutStickyScroll = gutterViewPortWithStickyScroll.withTop(gutterViewPortWithoutStickyScrollWithoutPaddingTop.top + gutterViewPortPaddingTop);
      const verticalEditRange = s.lineOffsetRange.read(reader);
      const gutterEditArea = Rect.fromRanges(OffsetRange.fromTo(gutterViewPortWithoutStickyScroll.left, gutterViewPortWithoutStickyScroll.right), verticalEditRange);
      const pillHeight = lineHeight;
      const pillOffset = this._verticalOffset.read(reader);
      const pillFullyDockedRect = gutterEditArea.withHeight(pillHeight).translateY(pillOffset);
      const pillIsFullyDocked = gutterViewPortWithoutStickyScrollWithoutPaddingTop.containsRect(pillFullyDockedRect);
      const customIcon = this._data.read(reader)?.customization?.icon;
      const iconNoneDocked = customIcon ? constObservable(customIcon) : this._tabAction.map((action) => action === "accept" /* Accept */ ? Codicon.keyboardTab : Codicon.arrowRight);
      const iconDocked = customIcon ? constObservable(customIcon) : derived(this, (reader2) => {
        if (this._isHoveredOverIconDebounced.read(reader2) || this._isHoveredOverInlineEditDebounced.read(reader2)) {
          return Codicon.check;
        }
        if (this._tabAction.read(reader2) === "accept" /* Accept */) {
          return Codicon.keyboardTab;
        }
        const cursorLineNumber = this._editorObs.cursorLineNumber.read(reader2) ?? 0;
        const editStartLineNumber = s.range.read(reader2).startLineNumber;
        return cursorLineNumber <= editStartLineNumber ? Codicon.keyboardTabAbove : Codicon.keyboardTabBelow;
      });
      const idealIconAreaWidth = 22;
      const iconWidth = (pillRect2) => {
        const availableIconAreaWidth = this._availableWidthForIcon.read(void 0)(pillRect2.bottom + this._editorObs.editor.getScrollTop()) - gutterViewPortPaddingLeft;
        return Math.max(Math.min(availableIconAreaWidth, idealIconAreaWidth), CODICON_SIZE_PX);
      };
      if (pillIsFullyDocked) {
        const pillRect2 = pillFullyDockedRect;
        let widthUntilLineNumberEnd;
        if (layout2.lineNumbersWidth === 0) {
          widthUntilLineNumberEnd = Math.max(0, Math.min(Math.max(layout2.lineNumbersLeft - gutterViewPortWithStickyScroll.left, 0), pillRect2.width - idealIconAreaWidth));
        } else {
          widthUntilLineNumberEnd = Math.max(layout2.lineNumbersLeft + layout2.lineNumbersWidth - gutterViewPortWithStickyScroll.left, 0);
        }
        const lineNumberRect = pillRect2.withWidth(widthUntilLineNumberEnd);
        const minimalIconWidthWithPadding = CODICON_SIZE_PX + CODICON_PADDING_PX;
        const iconWidth2 = Math.min(pillRect2.width - widthUntilLineNumberEnd, idealIconAreaWidth);
        const iconRect2 = pillRect2.withWidth(Math.max(iconWidth2, minimalIconWidthWithPadding)).translateX(widthUntilLineNumberEnd);
        const iconVisible = iconWidth2 >= minimalIconWidthWithPadding;
        return {
          gutterEditArea,
          icon: iconDocked,
          iconDirection: "right",
          iconRect: iconRect2,
          iconVisible,
          pillRect: pillRect2,
          lineNumberRect
        };
      }
      const pillPartiallyDockedPossibleArea = gutterViewPortWithStickyScroll.intersect(gutterEditArea);
      const pillIsPartiallyDocked = pillPartiallyDockedPossibleArea && pillPartiallyDockedPossibleArea.height >= pillHeight;
      if (pillIsPartiallyDocked) {
        const pillRectMoved2 = pillFullyDockedRect.moveToBeContainedIn(gutterViewPortWithoutStickyScroll).moveToBeContainedIn(pillPartiallyDockedPossibleArea);
        const pillRect2 = pillRectMoved2.withWidth(iconWidth(pillRectMoved2));
        const iconRect2 = pillRect2;
        return {
          gutterEditArea,
          icon: iconDocked,
          iconDirection: "right",
          iconRect: iconRect2,
          pillRect: pillRect2,
          iconVisible: true
        };
      }
      const pillRectMoved = pillFullyDockedRect.moveToBeContainedIn(gutterViewPortWithStickyScroll);
      const pillRect = pillRectMoved.withWidth(iconWidth(pillRectMoved));
      const iconRect = pillRect;
      const iconDirection = pillRect.top < pillFullyDockedRect.top ? "top" : "bottom";
      return {
        gutterEditArea,
        icon: iconNoneDocked,
        iconDirection,
        iconRect,
        pillRect,
        iconVisible: true
      };
    });
    this._iconRef = n.ref();
    this.isVisible = this._layout.map((l) => !!l);
    this._hoverVisible = observableValue(this, false);
    this.isHoverVisible = this._hoverVisible;
    this._isHoveredOverIcon = observableValue(this, false);
    this._isHoveredOverIconDebounced = debouncedObservable(this._isHoveredOverIcon, 100);
    this.isHoveredOverIcon = this._isHoveredOverIconDebounced;
    this._indicator = n.div({
      class: "inline-edits-view-gutter-indicator",
      style: {
        position: "absolute",
        overflow: "visible"
      }
    }, mapOutFalsy(this._layout).map((layout2) => !layout2 ? [] : [
      n.div({
        style: {
          position: "absolute",
          background: asCssVariable(inlineEditIndicatorBackground),
          borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
          ...rectToProps((reader) => layout2.read(reader).gutterEditArea)
        }
      }),
      n.div({
        class: "icon",
        ref: this._iconRef,
        tabIndex: 0,
        onclick: () => {
          const layout3 = this._layout.get();
          const acceptOnClick = layout3?.icon.get() === Codicon.check;
          const data = this._data.get();
          if (!data) {
            throw new BugIndicatingError("Gutter indicator data not available");
          }
          this._editorObs.editor.focus();
          if (acceptOnClick) {
            data.model.accept();
          } else {
            data.model.jump();
          }
        },
        onmouseenter: () => {
          this._isHoveredOverIcon.set(true, void 0);
          this._showHover();
        },
        onmouseleave: () => this._isHoveredOverIcon.set(false, void 0),
        style: {
          cursor: "pointer",
          zIndex: "20",
          position: "absolute",
          backgroundColor: this._gutterIndicatorStyles.map((v2) => v2.background),
          // eslint-disable-next-line local/code-no-any-casts
          ["--vscodeIconForeground"]: this._gutterIndicatorStyles.map((v2) => v2.foreground),
          border: this._gutterIndicatorStyles.map((v2) => `1px solid ${v2.border}`),
          boxSizing: "border-box",
          borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
          display: "flex",
          justifyContent: layout2.map((l) => l.iconDirection === "bottom" ? "flex-start" : "flex-end"),
          transition: this._modifierPressed.map((m) => m ? "" : "background-color 0.2s ease-in-out, width 0.2s ease-in-out"),
          ...rectToProps((reader) => layout2.read(reader).pillRect)
        }
      }, [
        n.div(
          {
            className: "line-number",
            style: {
              lineHeight: layout2.map((l) => l.lineNumberRect ? l.lineNumberRect.height : 0),
              display: layout2.map((l) => l.lineNumberRect ? "flex" : "none"),
              alignItems: "center",
              justifyContent: "flex-end",
              width: layout2.map((l) => l.lineNumberRect ? l.lineNumberRect.width : 0),
              height: "100%",
              color: this._gutterIndicatorStyles.map((v2) => v2.foreground)
            }
          },
          this._lineNumberToRender
        ),
        n.div({
          style: {
            transform: layout2.map((l) => `rotate(${getRotationFromDirection(l.iconDirection)}deg)`),
            transition: "rotate 0.2s ease-in-out, opacity 0.2s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            opacity: layout2.map((l) => l.iconVisible ? "1" : "0"),
            marginRight: layout2.map((l) => l.pillRect.width - l.iconRect.width - (l.lineNumberRect?.width ?? 0)),
            width: layout2.map((l) => l.iconRect.width),
            position: "relative",
            right: layout2.map((l) => l.iconDirection === "top" ? "1px" : "0"),
            color: this._data.map((d) => d?.customization?.icon?.color ? asCssVariable(d.customization.icon.color.id) : void 0)
          }
        }, [
          layout2.map((l, reader) => withStyles(renderIcon(l.icon.read(reader)), { fontSize: toPx(Math.min(l.iconRect.width - CODICON_PADDING_PX, CODICON_SIZE_PX)) }))
        ])
      ])
    ]));
    this._originalRangeObs = mapOutFalsy(this._data.map((d) => d?.originalRange));
    this._stickyScrollController = StickyScrollController2.get(this._editorObs.editor);
    this._stickyScrollHeight = this._stickyScrollController ? observableFromEvent(this._stickyScrollController.onDidChangeStickyScrollHeight, () => this._stickyScrollController.stickyScrollWidgetHeight) : constObservable(0);
    this._isHoveredOverInlineEditDebounced = debouncedObservable(this._isHoveringOverInlineEdit, 100);
    const indicator = this._indicator.keepUpdated(this._store);
    this._register(this._editorObs.createOverlayWidget({
      domNode: indicator.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._register(this._editorObs.editor.onDidScrollChange(() => {
      this._isHoveredOverIcon.set(false, void 0);
    }));
    this._register(runOnChange(this._isHoveredOverInlineEditDebounced, (isHovering) => {
      if (isHovering) {
        this.triggerAnimation();
      }
    }));
    this._register(autorun((reader) => {
      indicator.readEffect(reader);
      if (indicator.element) {
        this._editorObs.editor.applyFontInfo(indicator.element);
      }
    }));
  }
  triggerAnimation() {
    if (this._accessibilityService.isMotionReduced()) {
      return new Animation(null, null).finished;
    }
    const animation = this._iconRef.element.animate([
      {
        outline: `2px solid ${this._gutterIndicatorStyles.map((v2) => v2.border).get()}`,
        outlineOffset: "-1px",
        offset: 0
      },
      {
        outline: `2px solid transparent`,
        outlineOffset: "10px",
        offset: 1
      }
    ], { duration: 500 });
    return animation.finished;
  }
  _showHover() {
    if (this._hoverVisible.get()) {
      return;
    }
    const data = this._data.get();
    if (!data) {
      throw new BugIndicatingError("Gutter indicator data not available");
    }
    const disposableStore = new DisposableStore();
    const content = disposableStore.add(this._instantiationService.createInstance(
      GutterIndicatorMenuContent,
      this._editorObs,
      data.gutterMenuData,
      (focusEditor, commandId) => {
        if (focusEditor) {
          this._editorObs.editor.focus();
        }
        if (commandId) {
          this._onDidCloseWithCommand.fire(commandId);
        }
        h3?.dispose();
      }
    ).toDisposableLiveElement());
    const isFocused = this._userInteractionService.createFocusTracker(content.element, disposableStore);
    disposableStore.add(autorun((reader) => {
      this._focusIsInMenu.set(isFocused.read(reader), void 0);
    }));
    disposableStore.add(toDisposable(() => this._focusIsInMenu.set(false, void 0)));
    const h3 = this._hoverService.showInstantHover({
      target: this._iconRef.element,
      content: content.element
    });
    if (h3) {
      this._hoverVisible.set(true, void 0);
      disposableStore.add(this._editorObs.editor.onDidScrollChange(() => h3.dispose()));
      disposableStore.add(h3.onDispose(() => {
        this._hoverVisible.set(false, void 0);
        disposableStore.dispose();
      }));
    } else {
      disposableStore.dispose();
    }
  }
};

InlineEditsGutterIndicator = __decorateClass([
  __decorateParam(6, IHoverService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IAccessibilityService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, IUserInteractionService)
], InlineEditsGutterIndicator);

function getRotationFromDirection(direction) {
  switch (direction) {
    case "top":
      return 90;
    case "bottom":
      return -90;
    case "right":
      return 0;
  }
}

function withStyles(element, styles) {
  for (const key3 in styles) {
    element.style[key3] = styles[key3];
  }
  return element;
}

function toPx(n2) {
  return `${n2}px`;
}
export { getRotationFromDirection, withStyles, toPx, InlineEditsGutterIndicatorData, InlineSuggestionGutterMenuData, SimpleInlineSuggestModel, CODICON_SIZE_PX, CODICON_PADDING_PX, InlineEditsGutterIndicator };
