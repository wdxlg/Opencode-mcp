// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/glyphHoverController.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { isMousePositionWithinElement, isTriggerModifierPressed, shouldShowHover } from "./module-0583.mjs";
import { isModifierKey } from "./module-0019.mjs";
import { GlyphHoverWidget } from "./module-0808.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/hover/browser/glyphHoverController.ts
var _sticky4 = false;

var GlyphHoverController = class extends Disposable {
  constructor(_editor, _instantiationService) {
    super();
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
    this._listenersStore = new DisposableStore();
    this._hoverState = {
      mouseDown: false
    };
    this._reactToEditorMouseMoveRunner = this._register(
      new RunOnceScheduler(
        () => this._reactToEditorMouseMove(this._mouseMoveEvent),
        0
      )
    );
    this._hookListeners();
    this._register(this._editor.onDidChangeConfiguration((e4) => {
      if (e4.hasChanged(69 /* hover */)) {
        this._unhookListeners();
        this._hookListeners();
      }
    }));
  }
  static {
    this.ID = "editor.contrib.marginHover";
  }
  static get(editor) {
    return editor.getContribution(GlyphHoverController.ID);
  }
  _hookListeners() {
    const hoverOpts = this._editor.getOption(69 /* hover */);
    this._hoverSettings = {
      enabled: hoverOpts.enabled,
      sticky: hoverOpts.sticky,
      hidingDelay: hoverOpts.hidingDelay
    };
    if (hoverOpts.enabled !== "off") {
      this._listenersStore.add(this._editor.onMouseDown((e4) => this._onEditorMouseDown(e4)));
      this._listenersStore.add(this._editor.onMouseUp(() => this._onEditorMouseUp()));
      this._listenersStore.add(this._editor.onMouseMove((e4) => this._onEditorMouseMove(e4)));
      this._listenersStore.add(this._editor.onKeyDown((e4) => this._onKeyDown(e4)));
    } else {
      this._listenersStore.add(this._editor.onMouseMove((e4) => this._onEditorMouseMove(e4)));
      this._listenersStore.add(this._editor.onKeyDown((e4) => this._onKeyDown(e4)));
    }
    this._listenersStore.add(this._editor.onMouseLeave((e4) => this._onEditorMouseLeave(e4)));
    this._listenersStore.add(this._editor.onDidChangeModel(() => {
      this._cancelScheduler();
      this.hideGlyphHover();
    }));
    this._listenersStore.add(this._editor.onDidChangeModelContent(() => this._cancelScheduler()));
    this._listenersStore.add(this._editor.onDidScrollChange((e4) => this._onEditorScrollChanged(e4)));
  }
  _unhookListeners() {
    this._listenersStore.clear();
  }
  _cancelScheduler() {
    this._mouseMoveEvent = void 0;
    this._reactToEditorMouseMoveRunner.cancel();
  }
  _onEditorScrollChanged(e4) {
    if (e4.scrollTopChanged || e4.scrollLeftChanged) {
      this.hideGlyphHover();
    }
  }
  _onEditorMouseDown(mouseEvent) {
    this._hoverState.mouseDown = true;
    const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
    if (shouldNotHideCurrentHoverWidget) {
      return;
    }
    this.hideGlyphHover();
  }
  _isMouseOnGlyphHoverWidget(mouseEvent) {
    const glyphHoverWidgetNode = this._glyphWidget?.getDomNode();
    if (glyphHoverWidgetNode) {
      return isMousePositionWithinElement(glyphHoverWidgetNode, mouseEvent.event.posx, mouseEvent.event.posy);
    }
    return false;
  }
  _onEditorMouseUp() {
    this._hoverState.mouseDown = false;
  }
  _onEditorMouseLeave(mouseEvent) {
    if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
      return;
    }
    this._cancelScheduler();
    const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
    if (shouldNotHideCurrentHoverWidget) {
      return;
    }
    if (_sticky4) {
      return;
    }
    this.hideGlyphHover();
  }
  _shouldNotRecomputeCurrentHoverWidget(mouseEvent) {
    const isHoverSticky = this._hoverSettings.sticky;
    const isMouseOnGlyphHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
    return isHoverSticky && isMouseOnGlyphHoverWidget;
  }
  _onEditorMouseMove(mouseEvent) {
    if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
      return;
    }
    this._mouseMoveEvent = mouseEvent;
    const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
    if (shouldNotRecomputeCurrentHoverWidget) {
      this._reactToEditorMouseMoveRunner.cancel();
      return;
    }
    this._reactToEditorMouseMove(mouseEvent);
  }
  _reactToEditorMouseMove(mouseEvent) {
    if (!mouseEvent) {
      return;
    }
    if (!shouldShowHover(
      this._hoverSettings.enabled,
      this._editor.getOption(86 /* multiCursorModifier */),
      mouseEvent
    )) {
      if (_sticky4) {
        return;
      }
      this.hideGlyphHover();
      return;
    }
    const glyphWidgetShowsOrWillShow = this._tryShowHoverWidget(mouseEvent);
    if (glyphWidgetShowsOrWillShow) {
      return;
    }
    if (_sticky4) {
      return;
    }
    this.hideGlyphHover();
  }
  _tryShowHoverWidget(mouseEvent) {
    const glyphWidget = this._getOrCreateGlyphWidget();
    return glyphWidget.showsOrWillShow(mouseEvent);
  }
  _onKeyDown(e4) {
    if (!this._editor.hasModel()) {
      return;
    }
    if (this._hoverSettings.enabled === "onKeyboardModifier" && isTriggerModifierPressed(this._editor.getOption(86 /* multiCursorModifier */), e4) && this._mouseMoveEvent) {
      this._tryShowHoverWidget(this._mouseMoveEvent);
      return;
    }
    if (isModifierKey(e4.keyCode)) {
      return;
    }
    this.hideGlyphHover();
  }
  hideGlyphHover() {
    if (_sticky4) {
      return;
    }
    this._glyphWidget?.hide();
  }
  _getOrCreateGlyphWidget() {
    if (!this._glyphWidget) {
      this._glyphWidget = this._instantiationService.createInstance(GlyphHoverWidget, this._editor);
    }
    return this._glyphWidget;
  }
  dispose() {
    super.dispose();
    this._unhookListeners();
    this._listenersStore.dispose();
    this._glyphWidget?.dispose();
  }
};

GlyphHoverController = __decorateClass([
  __decorateParam(1, IInstantiationService)
], GlyphHoverController);
export { _sticky4, GlyphHoverController };
