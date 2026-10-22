// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLink.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { convertBufferRangeToViewport } from "./module-3194.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLink.ts
var TerminalLink = class extends Disposable {
  constructor(_xterm, range2, text2, uri4, parsedLink, actions, _viewportY, _activateCallback, _tooltipCallback, _isHighConfidenceLink, label3, _type, _configurationService) {
    super();
    this._xterm = _xterm;
    this.range = range2;
    this.text = text2;
    this.uri = uri4;
    this.parsedLink = parsedLink;
    this.actions = actions;
    this._viewportY = _viewportY;
    this._activateCallback = _activateCallback;
    this._tooltipCallback = _tooltipCallback;
    this._isHighConfidenceLink = _isHighConfidenceLink;
    this.label = label3;
    this._type = _type;
    this._configurationService = _configurationService;
    this._tooltipScheduler = this._register(new MutableDisposable());
    this._hoverListeners = this._register(new MutableDisposable());
    this._onInvalidated = this._register(new Emitter());
    this.decorations = {
      pointerCursor: false,
      underline: this._isHighConfidenceLink
    };
  }
  get onInvalidated() {
    return this._onInvalidated.event;
  }
  get type() {
    return this._type;
  }
  activate(event, text2) {
    this._activateCallback(event, text2);
  }
  hover(event, text2) {
    const w = getWindow(event);
    const d = w.document;
    const hoverListeners = this._hoverListeners.value = new DisposableStore();
    hoverListeners.add(addDisposableListener(d, "keydown", (e4) => {
      if (!e4.repeat && this._isModifierDown(e4)) {
        this._enableDecorations();
      }
    }));
    hoverListeners.add(addDisposableListener(d, "keyup", (e4) => {
      if (!e4.repeat && !this._isModifierDown(e4)) {
        this._disableDecorations();
      }
    }));
    hoverListeners.add(this._xterm.onRender((e4) => {
      const viewportRangeY = this.range.start.y - this._viewportY;
      if (viewportRangeY >= e4.start && viewportRangeY <= e4.end) {
        this._onInvalidated.fire();
      }
    }));
    if (this._isHighConfidenceLink) {
      this._tooltipScheduler.value = new RunOnceScheduler(() => {
        this._tooltipCallback(
          this,
          convertBufferRangeToViewport(this.range, this._viewportY),
          this._isHighConfidenceLink ? () => this._enableDecorations() : void 0,
          this._isHighConfidenceLink ? () => this._disableDecorations() : void 0
        );
        this._tooltipScheduler.clear();
      }, this._configurationService.getValue("workbench.hover.delay"));
      this._tooltipScheduler.value.schedule();
    }
    const origin = { x: event.pageX, y: event.pageY };
    hoverListeners.add(addDisposableListener(d, EventType.MOUSE_MOVE, (e4) => {
      if (this._isModifierDown(e4)) {
        this._enableDecorations();
      } else {
        this._disableDecorations();
      }
      if (Math.abs(e4.pageX - origin.x) > w.devicePixelRatio * 2 || Math.abs(e4.pageY - origin.y) > w.devicePixelRatio * 2) {
        origin.x = e4.pageX;
        origin.y = e4.pageY;
        this._tooltipScheduler.value?.schedule();
      }
    }));
  }
  leave() {
    this._hoverListeners.clear();
    this._tooltipScheduler.clear();
  }
  _enableDecorations() {
    if (!this.decorations.pointerCursor) {
      this.decorations.pointerCursor = true;
    }
    if (!this.decorations.underline) {
      this.decorations.underline = true;
    }
  }
  _disableDecorations() {
    if (this.decorations.pointerCursor) {
      this.decorations.pointerCursor = false;
    }
    if (this.decorations.underline !== this._isHighConfidenceLink) {
      this.decorations.underline = this._isHighConfidenceLink;
    }
  }
  _isModifierDown(event) {
    const multiCursorModifier2 = this._configurationService.getValue("editor.multiCursorModifier");
    if (multiCursorModifier2 === "ctrlCmd") {
      return !!event.altKey;
    }
    return isMacintosh ? event.metaKey : event.ctrlKey;
  }
};

TerminalLink = __decorateClass([
  __decorateParam(12, IConfigurationService)
], TerminalLink);
export { TerminalLink };
