// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/jumpToView.ts
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { getEditorBlendedColor, inlineEditIndicatorPrimaryBackground, inlineEditIndicatorPrimaryBorder, inlineEditIndicatorPrimaryForeground } from "./module-0771.mjs";
import { constObservable } from "./module-0061.mjs";
import { Rect } from "./module-0765.mjs";
import { n } from "./module-0075.mjs";
import { rectToProps } from "./module-0772.mjs";
import { inlineSuggestCommitId } from "./module-0580.mjs";
import { Range2 } from "./module-0106.mjs";
import { DebugLocation } from "./module-0046.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { defaultKeybindingLabelStyles } from "./module-0513.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsViews/jumpToView.ts
var JumpToView = class extends Disposable {
  constructor(_editor, options3, _data, _themeService, _keybindingService, _contextKeyService) {
    super();
    this._editor = _editor;
    this._data = _data;
    this._themeService = _themeService;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this._styles = derived(this, (reader) => ({
      background: getEditorBlendedColor(inlineEditIndicatorPrimaryBackground, this._themeService).read(reader).toString(),
      foreground: getEditorBlendedColor(inlineEditIndicatorPrimaryForeground, this._themeService).read(reader).toString(),
      border: getEditorBlendedColor(inlineEditIndicatorPrimaryBorder, this._themeService).read(reader).toString()
    }));
    this._pos = derived(this, (reader) => {
      return this._editor.observePosition(derived(
        (reader2) => this._data.read(reader2)?.jumpToPosition || null
      ), reader.store);
    }).flatten();
    this._layout = derived(this, (reader) => {
      const data = this._data.read(reader);
      if (!data) {
        return void 0;
      }
      const position2 = data.jumpToPosition;
      const lineHeight = this._editor.observeLineHeightForLine(constObservable(position2.lineNumber)).read(reader);
      const scrollLeft = this._editor.scrollLeft.read(reader);
      const point = this._pos.read(reader);
      if (!point) {
        return void 0;
      }
      const layout2 = this._editor.layoutInfo.read(reader);
      const widgetRect = Rect.fromLeftTopWidthHeight(
        point.x + layout2.contentLeft + 2 - scrollLeft,
        point.y,
        100,
        lineHeight
      );
      return {
        widgetRect
      };
    });
    this._blink = animateFixedValues([
      { value: true, durationMs: 600 },
      { value: false, durationMs: 600 }
    ]);
    this._widget = n.div(
      {
        class: "inline-edit-jump-to-widget",
        style: {
          position: "absolute",
          display: this._layout.map((l) => l ? "flex" : "none"),
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          ...rectToProps((reader) => this._layout.read(reader)?.widgetRect)
        }
      },
      derived((reader) => {
        if (this._data.read(reader) === void 0) {
          return [];
        }
        return n.div({
          style: {
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 4px",
            height: "100%",
            backgroundColor: this._styles.map((s) => s.background),
            ["--vscodeIconForeground"]: this._styles.map((s) => s.foreground),
            border: this._styles.map((s) => `1px solid ${s.border}`),
            borderRadius: "3px",
            boxSizing: "border-box",
            fontSize: "11px",
            color: this._styles.map((s) => s.foreground)
          }
        }, [
          this._style === "cursor" ? n.elem("div", {
            style: {
              borderLeft: "2px solid",
              height: 14,
              opacity: this._blink.map((b) => b ? "0" : "1")
            }
          }) : [
            derived(() => n.elem("div", {}, keybindingLabel(this._keybinding))),
            n.elem(
              "div",
              { style: { lineHeight: this._layout.map((l) => l?.widgetRect.height), marginTop: "-2px" } },
              ["to jump"]
            )
          ]
        ]);
      })
    );
    this._style = options3.style;
    this._keybinding = this._getKeybinding(inlineSuggestCommitId);
    const widget = this._widget.keepUpdated(this._store);
    this._register(this._editor.createOverlayWidget({
      domNode: widget.element,
      position: constObservable(null),
      allowEditorOverflow: false,
      minContentWidthInPx: constObservable(0)
    }));
    this._register(this._editor.setDecorations(derived((reader) => {
      const data = this._data.read(reader);
      if (!data) {
        return [];
      }
      return [{
        range: Range2.fromPositions(data.jumpToPosition, data.jumpToPosition),
        options: {
          description: "inline-edit-jump-to-decoration",
          inlineClassNameAffectsLetterSpacing: true,
          showIfCollapsed: true,
          after: {
            content: this._style === "label" ? "          " : "  "
          }
        }
      }];
    })));
  }
  _getKeybinding(commandId, debugLocation = DebugLocation.ofCaller()) {
    if (!commandId) {
      return constObservable(void 0);
    }
    return observableFromEvent(this, this._contextKeyService.onDidChangeContext, () => this._keybindingService.lookupKeybinding(commandId), debugLocation);
  }
};

JumpToView = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], JumpToView);

function animateFixedValues(values, debugLocation = DebugLocation.ofCaller()) {
  let idx = 0;
  return observableFromEvent(void 0, (l) => {
    idx = 0;
    const timer = new RunOnceScheduler(() => {
      idx = (idx + 1) % values.length;
      l(null);
      timer.schedule(values[idx].durationMs);
    }, 0);
    timer.schedule(0);
    return timer;
  }, () => {
    return values[idx].value;
  }, debugLocation);
}

function keybindingLabel(keybinding) {
  return derived((_reader) => n.div({
    style: {},
    ref: (elem) => {
      const keybindingLabel2 = _reader.store.add(new KeybindingLabel(elem, OS, {
        disableTitle: true,
        ...defaultKeybindingLabelStyles,
        keybindingLabelShadow: void 0,
        keybindingLabelForeground: asCssVariable(inlineEditIndicatorPrimaryForeground),
        keybindingLabelBackground: "transparent",
        keybindingLabelBorder: asCssVariable(inlineEditIndicatorPrimaryForeground),
        keybindingLabelBottomBorder: void 0
      }));
      _reader.store.add(autorun((reader) => {
        keybindingLabel2.set(keybinding.read(reader));
      }));
    }
  }));
}
export { animateFixedValues, keybindingLabel, JumpToView };
