// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/native/nativeEditContextUtils.ts
import { Disposable } from "./module-0012.mjs";
import { addDisposableListener, getShadowRoot } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/editor/browser/controller/editContext/native/nativeEditContextUtils.ts
var FocusTracker2 = class extends Disposable {
  constructor(_logService, _domNode, _onFocusChange) {
    super();
    this._domNode = _domNode;
    this._onFocusChange = _onFocusChange;
    this._isFocused = false;
    this._isPaused = false;
    this._register(addDisposableListener(this._domNode, "focus", () => {
      _logService.trace("NativeEditContext.focus");
      if (this._isPaused) {
        return;
      }
      this.refreshFocusState();
    }));
    this._register(addDisposableListener(this._domNode, "blur", () => {
      _logService.trace("NativeEditContext.blur");
      if (this._isPaused) {
        return;
      }
      this._handleFocusedChanged(false);
    }));
  }
  pause() {
    this._isPaused = true;
  }
  resume() {
    this._isPaused = false;
    this.refreshFocusState();
  }
  _handleFocusedChanged(focused) {
    if (this._isFocused === focused) {
      return;
    }
    this._isFocused = focused;
    this._onFocusChange(this._isFocused);
  }
  focus() {
    this._domNode.focus();
    this.refreshFocusState();
  }
  refreshFocusState() {
    const shadowRoot = getShadowRoot(this._domNode);
    const activeElement = shadowRoot ? shadowRoot.activeElement : this._domNode.ownerDocument.activeElement;
    const focused = this._domNode === activeElement;
    this._handleFocusedChanged(focused);
  }
  get isFocused() {
    return this._isFocused;
  }
};

FocusTracker2 = __decorateClass([
  __decorateParam(0, ILogService)
], FocusTracker2);

function editContextAddDisposableListener(target, type, listener, options3) {
  target.addEventListener(type, listener, options3);
  return {
    dispose() {
      target.removeEventListener(type, listener);
    }
  };
}
export { editContextAddDisposableListener, FocusTracker2 };
