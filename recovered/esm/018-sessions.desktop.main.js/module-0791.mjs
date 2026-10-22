// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsWordReplacementView.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { StringReplacement } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { LineTokens, TokenArray } from "./module-0145.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { observableFromPromise } from "./module-0059.mjs";
import { Point } from "./module-0492.mjs";
import { localize } from "./module-0001.mjs";
import { inlineSuggestCommitAlternativeActionId } from "./module-0580.mjs";
import { Rect } from "./module-0765.mjs";
import { getEditorValidOverlayRect, mapOutFalsy, rectToProps } from "./module-0772.mjs";
import { $, n } from "./module-0075.mjs";
import { INLINE_EDITS_BORDER_RADIUS, getEditorBackgroundColor, getModifiedBorderColor, getOriginalBorderColor, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorPrimaryBorder, inlineEditIndicatorPrimaryForeground, modifiedChangedTextOverlayColor, observeColor, originalChangedTextOverlayColor } from "./module-0771.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { editorHoverForeground } from "./module-0229.mjs";
import { KeybindingLabel, unthemedKeybindingLabelOptions } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { renderIcon } from "./module-0467.mjs";
import { InlineEditClickEvent } from "./module-0727.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IUserInteractionService } from "./module-0366.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/inlineEditsWordReplacementView.ts
var WordReplacementsViewData = class {
  constructor(edit3, editorType, alternativeAction) {
    this.edit = edit3;
    this.editorType = editorType;
    this.alternativeAction = alternativeAction;
  }
  equals(other) {
    return this.edit.equals(other.edit) && this.alternativeAction === other.alternativeAction;
  }
};

var BORDER_WIDTH4 = 1;

var DOM_ID_OVERLAY = "word-replacement-view-overlay";

var DOM_ID_WIDGET = "word-replacement-view-widget";

var DOM_ID_REPLACEMENT = "word-replacement-view-replacement";

var DOM_ID_RENAME = "word-replacement-view-rename";

var InlineEditsWordReplacementView = class extends Disposable {
  constructor(_editor, _viewData, _tabAction, _languageService, _themeService, _keybindingService, _hoverService, _userInteractionService) {
    super();
    this._editor = _editor;
    this._viewData = _viewData;
    this._tabAction = _tabAction;
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._keybindingService = _keybindingService;
    this._hoverService = _hoverService;
    this._userInteractionService = _userInteractionService;
    this._onDidClick = this._register(new Emitter());
    this.onDidClick = this._onDidClick.event;
    this._start = this._editor.observePosition(constObservable(this._viewData.edit.range.getStartPosition()), this._store);
    this._end = this._editor.observePosition(constObservable(this._viewData.edit.range.getEndPosition()), this._store);
    this._line = document.createElement("div");
    this._primaryElement = observableValue(this, null);
    this._secondaryElement = observableValue(this, null);
    this.isHovered = derived(this, (reader) => {
      const elem = this._primaryElement.read(reader);
      if (!elem) {
        return false;
      }
      return this._userInteractionService.createHoverTracker(elem.element, reader.store).read(reader);
    });
    this._renderTextEffect = derived(this, (_reader) => {
      const tm = this._editor.model.read(void 0);
      if (!tm) {
        return;
      }
      const origLine = tm.getLineContent(this._viewData.edit.range.startLineNumber);
      const edit3 = StringReplacement.replace(new OffsetRange(this._viewData.edit.range.startColumn - 1, this._viewData.edit.range.endColumn - 1), this._viewData.edit.text);
      const lineToTokenize = edit3.replace(origLine);
      const t2 = tm.tokenization.tokenizeLinesAt(this._viewData.edit.range.startLineNumber, [lineToTokenize])?.[0];
      let tokens;
      if (t2) {
        tokens = TokenArray.fromLineTokens(t2).slice(edit3.getRangeAfterReplace()).toLineTokens(this._viewData.edit.text, this._languageService.languageIdCodec);
      } else {
        tokens = LineTokens.createEmpty(this._viewData.edit.text, this._languageService.languageIdCodec);
      }
      const res = renderLines(new LineSource([tokens]), RenderOptions.fromEditor(this._editor.editor).withSetWidth(false).withScrollBeyondLastColumn(0), [], this._line, true);
      this._line.style.width = `${res.minWidthInPx}px`;
    });
    const modifiedLineHeight = this._editor.observeLineHeightForPosition(this._viewData.edit.range.getStartPosition());
    const altCount = observableFromPromise(this._viewData.alternativeAction?.count ?? new Promise((resolve3) => resolve3(void 0))).map((c) => c.value);
    const altModifierActive = derived(this, (reader) => this._userInteractionService.readModifierKeyStatus(this._editor.editor.getDomNode(), reader).shiftKey);
    this._layout = derived(this, (reader) => {
      this._renderTextEffect.read(reader);
      const widgetStart = this._start.read(reader);
      const widgetEnd = this._end.read(reader);
      if (!widgetStart || !widgetEnd || widgetStart.x > widgetEnd.x || widgetStart.y > widgetEnd.y) {
        return void 0;
      }
      const lineHeight = modifiedLineHeight.read(reader);
      if (lineHeight <= 0) {
        return void 0;
      }
      const scrollLeft = this._editor.scrollLeft.read(reader);
      const w = this._editor.getOption(59 /* fontInfo */).read(reader).typicalHalfwidthCharacterWidth;
      const modifiedLeftOffset = 3 * w;
      const modifiedTopOffset = 4;
      const modifiedOffset = new Point(modifiedLeftOffset, modifiedTopOffset);
      let alternativeAction = void 0;
      if (this._viewData.alternativeAction) {
        const label3 = this._viewData.alternativeAction.label;
        const count2 = altCount.read(reader);
        const active = altModifierActive.read(reader);
        const occurrencesLabel = count2 !== void 0 ? count2 === 1 ? localize(1402, null, label3) : localize(1403, null, label3, count2) : label3;
        const keybindingTooltip = localize(1404, null, "[shift]");
        alternativeAction = {
          label: count2 !== void 0 ? active ? occurrencesLabel : label3 : label3,
          tooltip: occurrencesLabel ? `${occurrencesLabel}
${keybindingTooltip}` : void 0,
          icon: void 0,
          //this._viewData.alternativeAction.icon, Do not render icon fo the moment
          count: count2,
          keybinding: this._keybindingService.lookupKeybinding(inlineSuggestCommitAlternativeActionId),
          active: altModifierActive
        };
      }
      const originalLine = Rect.fromPoints(widgetStart, widgetEnd).withHeight(lineHeight).translateX(-scrollLeft);
      const codeLine = Rect.fromPointSize(originalLine.getLeftBottom().add(modifiedOffset), new Point(this._viewData.edit.text.length * w, originalLine.height));
      const modifiedLine = codeLine.withWidth(codeLine.width + (alternativeAction ? alternativeAction.label.length * w + 8 + 4 + 12 : 0));
      const lowerBackground = modifiedLine.withLeft(originalLine.left);
      return {
        alternativeAction,
        originalLine,
        codeLine,
        modifiedLine,
        lowerBackground,
        lineHeight
      };
    });
    this.minEditorScrollHeight = derived(this, (reader) => {
      const layout2 = mapOutFalsy(this._layout).read(reader);
      if (!layout2) {
        return 0;
      }
      return layout2.read(reader).modifiedLine.bottom + BORDER_WIDTH4 + this._editor.editor.getScrollTop();
    });
    this._root = n.div({
      class: "word-replacement"
    }, [
      derived(this, (reader) => {
        const layout2 = mapOutFalsy(this._layout).read(reader);
        if (!layout2) {
          return [];
        }
        const originalBorderColor = getOriginalBorderColor(this._tabAction).map((c) => asCssVariable(c)).read(reader);
        const modifiedBorderColor = getModifiedBorderColor(this._tabAction).map((c) => asCssVariable(c)).read(reader);
        this._line.style.lineHeight = `${layout2.read(reader).modifiedLine.height + 2 * BORDER_WIDTH4}px`;
        const secondaryElementHovered = constObservable(false);
        const alternativeAction = layout2.map((l) => l.alternativeAction);
        const alternativeActionActive = derived((reader2) => (alternativeAction.read(reader2)?.active.read(reader2) ?? false) || secondaryElementHovered.read(reader2));
        const isHighContrast2 = observableFromEvent(this._themeService.onDidColorThemeChange, () => {
          const theme = this._themeService.getColorTheme();
          return theme.type === "hcDark" || theme.type === "hcLight";
        }).read(reader);
        const hcBorderColor = isHighContrast2 ? observeColor(contrastBorder, this._themeService).read(reader) : null;
        const primaryActiveStyles = {
          borderColor: hcBorderColor ? hcBorderColor.toString() : modifiedBorderColor,
          backgroundColor: asCssVariable(modifiedChangedTextOverlayColor),
          color: "",
          opacity: "1"
        };
        const secondaryActiveStyles = {
          borderColor: hcBorderColor ? hcBorderColor.toString() : asCssVariable(inlineEditIndicatorPrimaryBorder),
          backgroundColor: asCssVariable(inlineEditIndicatorPrimaryBackground),
          color: asCssVariable(inlineEditIndicatorPrimaryForeground),
          opacity: "1"
        };
        const passiveStyles = {
          borderColor: hcBorderColor ? hcBorderColor.toString() : observeColor(editorHoverForeground, this._themeService).map((c) => c.transparent(0.2).toString()).read(reader),
          backgroundColor: getEditorBackgroundColor(this._viewData.editorType),
          color: "",
          opacity: "0.7"
        };
        const editorBackground2 = getEditorBackgroundColor(this._viewData.editorType);
        const primaryActionStyles = derived(this, (r2) => alternativeActionActive.read(r2) ? primaryActiveStyles : primaryActiveStyles);
        const secondaryActionStyles = derived(this, (r2) => alternativeActionActive.read(r2) ? secondaryActiveStyles : passiveStyles);
        return [
          n.div({
            id: DOM_ID_OVERLAY,
            style: {
              position: "absolute",
              ...rectToProps((r2) => getEditorValidOverlayRect(this._editor).read(r2)),
              overflow: "hidden",
              pointerEvents: "none"
            }
          }, [
            n.div({
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).lowerBackground.withMargin(BORDER_WIDTH4, 2 * BORDER_WIDTH4, BORDER_WIDTH4, 0)),
                background: editorBackground2,
                cursor: "pointer",
                pointerEvents: "auto"
              },
              onmousedown: (e4) => this._mouseDown(e4)
            }),
            n.div({
              id: DOM_ID_WIDGET,
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).modifiedLine.withMargin(BORDER_WIDTH4, 2 * BORDER_WIDTH4)),
                width: void 0,
                pointerEvents: "auto",
                boxSizing: "border-box",
                borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                background: editorBackground2,
                display: "flex",
                justifyContent: "left",
                outline: `2px solid ${editorBackground2}`
              },
              onmousedown: (e4) => this._mouseDown(e4)
            }, [
              n.div({
                id: DOM_ID_REPLACEMENT,
                style: {
                  fontFamily: this._editor.getOption(58 /* fontFamily */),
                  fontSize: this._editor.getOption(61 /* fontSize */),
                  fontWeight: this._editor.getOption(62 /* fontWeight */),
                  width: rectToProps((reader2) => layout2.read(reader2).codeLine.withMargin(BORDER_WIDTH4, 2 * BORDER_WIDTH4)).width,
                  borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                  border: primaryActionStyles.map((s) => `${BORDER_WIDTH4}px solid ${s.borderColor}`),
                  boxSizing: "border-box",
                  padding: `${BORDER_WIDTH4}px`,
                  opacity: primaryActionStyles.map((s) => s.opacity),
                  background: primaryActionStyles.map((s) => s.backgroundColor),
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  pointerEvents: "auto",
                  cursor: "pointer"
                },
                obsRef: (elem) => {
                  this._primaryElement.set(elem, void 0);
                }
              }, [this._line]),
              derived(this, (reader2) => {
                const altAction = alternativeAction.read(reader2);
                if (!altAction) {
                  return void 0;
                }
                const keybinding = document.createElement("div");
                const keybindingLabel2 = reader2.store.add(new KeybindingLabel(keybinding, OS, { ...unthemedKeybindingLabelOptions, disableTitle: true }));
                keybindingLabel2.set(altAction.keybinding);
                return n.div({
                  id: DOM_ID_RENAME,
                  style: {
                    position: "relative",
                    borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                    borderTop: `${BORDER_WIDTH4}px solid`,
                    borderRight: `${BORDER_WIDTH4}px solid`,
                    borderBottom: `${BORDER_WIDTH4}px solid`,
                    borderLeft: `${BORDER_WIDTH4}px solid`,
                    borderColor: secondaryActionStyles.map((s) => s.borderColor),
                    opacity: secondaryActionStyles.map((s) => s.opacity),
                    color: secondaryActionStyles.map((s) => s.color),
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "0 4px 0 1px",
                    marginLeft: "4px",
                    background: secondaryActionStyles.map((s) => s.backgroundColor),
                    cursor: "pointer",
                    textWrap: "nowrap"
                  },
                  class: "inline-edit-alternative-action-label",
                  obsRef: (elem) => {
                    this._secondaryElement.set(elem, void 0);
                  },
                  ref: (elem) => {
                    if (altAction.tooltip) {
                      reader2.store.add(this._hoverService.setupDelayedHoverAtMouse(elem, { content: altAction.tooltip, appearance: { compact: true } }));
                    }
                  }
                }, [
                  keybinding,
                  $("div.inline-edit-alternative-action-label-separator"),
                  altAction.icon ? renderIcon(altAction.icon) : void 0,
                  altAction.label
                ]);
              })
            ]),
            n.div({
              style: {
                position: "absolute",
                ...rectToProps((reader2) => layout2.read(reader2).originalLine.withMargin(BORDER_WIDTH4)),
                boxSizing: "border-box",
                borderRadius: `${INLINE_EDITS_BORDER_RADIUS}px`,
                border: `${BORDER_WIDTH4}px solid ${originalBorderColor}`,
                background: asCssVariable(originalChangedTextOverlayColor),
                pointerEvents: "none"
              }
            }, []),
            n.svg({
              width: 11,
              height: 14,
              viewBox: "0 0 11 14",
              fill: "none",
              style: {
                position: "absolute",
                left: layout2.map((l) => l.modifiedLine.left - 16),
                top: layout2.map((l) => l.modifiedLine.top + Math.round((l.lineHeight - 14 - 5) / 2)),
                pointerEvents: "none"
              },
              onmousedown: (e4) => this._mouseDown(e4)
            }, [
              n.svgElem("path", {
                d: "M1 0C1 2.98966 1 5.92087 1 8.49952C1 9.60409 1.89543 10.5 3 10.5H10.5",
                stroke: asCssVariable(editorHoverForeground)
              }),
              n.svgElem("path", {
                d: "M6 7.5L9.99999 10.49998L6 13.5",
                stroke: asCssVariable(editorHoverForeground)
              })
            ])
          ])
        ];
      })
    ]).keepUpdated(this._store);
    this._register(this._editor.createOverlayWidget({
      domNode: this._root.element,
      minContentWidthInPx: constObservable(0),
      position: constObservable({ preference: { top: 0, left: 0 } }),
      allowEditorOverflow: false
    }));
  }
  static {
    this.MAX_LENGTH = 100;
  }
  _mouseDown(e4) {
    const target_id = traverseParentsUntilId(e4.target, /* @__PURE__ */ new Set([DOM_ID_WIDGET, DOM_ID_REPLACEMENT, DOM_ID_RENAME, DOM_ID_OVERLAY]));
    if (!target_id) {
      return;
    }
    e4.preventDefault();
    this._onDidClick.fire(InlineEditClickEvent.create(e4, target_id === DOM_ID_RENAME));
  }
};

InlineEditsWordReplacementView = __decorateClass([
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IUserInteractionService)
], InlineEditsWordReplacementView);

function traverseParentsUntilId(element, ids) {
  let current = element;
  while (current) {
    if (ids.has(current.id)) {
      return current.id;
    }
    current = current.parentElement;
  }
  return null;
}
export { traverseParentsUntilId, WordReplacementsViewData, BORDER_WIDTH4, DOM_ID_OVERLAY, DOM_ID_WIDGET, DOM_ID_REPLACEMENT, DOM_ID_RENAME, InlineEditsWordReplacementView };
