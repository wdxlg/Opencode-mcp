// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileVisualViewport.ts
import { Dimension, addDisposableListener, getWindow } from "./module-0075.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { KeyboardVisibleContext } from "./module-1770.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/browser/parts/mobile/mobileVisualViewport.ts
var KEYBOARD_VISIBLE_THRESHOLD_PX = 50;

function getMobileViewportDimension(layoutViewport, visualViewport) {
  if (!visualViewport) {
    return layoutViewport;
  }
  return new Dimension(layoutViewport.width, Math.min(layoutViewport.height, visualViewport.height));
}

var KEYBOARD_HEIGHT_CSS_VAR = "--vscode-keyboard-height";

var IMobileVisualViewport = createDecorator("mobileVisualViewport");

var MobileVisualViewport = class extends Disposable {
  constructor(contextKeyService, layoutService) {
    super();
    this._keyboardHeight = observableValue(this, 0);
    this.keyboardHeight = this._keyboardHeight;
    this.isKeyboardVisible = derived(
      this,
      (reader) => this._keyboardHeight.read(reader) > KEYBOARD_VISIBLE_THRESHOLD_PX
    );
    this.mainContainer = layoutService.mainContainer;
    this._keyboardVisibleCtx = KeyboardVisibleContext.bindTo(contextKeyService);
    const targetWindow = getWindow(this.mainContainer);
    const visualViewport = targetWindow.visualViewport;
    if (!visualViewport) {
      return;
    }
    const update = () => {
      const height = Math.max(0, targetWindow.innerHeight - visualViewport.height);
      if (this._keyboardHeight.get() !== height) {
        this._keyboardHeight.set(height, void 0);
      }
      this.mainContainer.style.setProperty(KEYBOARD_HEIGHT_CSS_VAR, `${height}px`);
      this._keyboardVisibleCtx.set(height > KEYBOARD_VISIBLE_THRESHOLD_PX);
    };
    this._register(addDisposableListener(visualViewport, "resize", update));
    this._register(addDisposableListener(visualViewport, "scroll", update));
    update();
  }
  dispose() {
    this.mainContainer.style.removeProperty(KEYBOARD_HEIGHT_CSS_VAR);
    this._keyboardVisibleCtx.reset();
    super.dispose();
  }
};

MobileVisualViewport = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ILayoutService)
], MobileVisualViewport);

registerSingleton(IMobileVisualViewport, MobileVisualViewport, 0 /* Eager */);
export { getMobileViewportDimension, KEYBOARD_VISIBLE_THRESHOLD_PX, KEYBOARD_HEIGHT_CSS_VAR, IMobileVisualViewport, MobileVisualViewport };
