// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userInteraction/browser/userInteractionServiceImpl.ts
import { ModifierKeyEmitter, getWindow, trackFocus } from "./module-0075.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { observableValue } from "./module-0048.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IUserInteractionService } from "./module-0366.mjs";


// src/vs/platform/userInteraction/browser/userInteractionServiceImpl.ts
var UserInteractionService = class {
  constructor() {
    this._modifierObservables = /* @__PURE__ */ new WeakMap();
  }
  readModifierKeyStatus(element, reader) {
    const win = element instanceof Window ? element : getWindow(element);
    let obs = this._modifierObservables.get(win);
    if (!obs) {
      const emitter = ModifierKeyEmitter.getInstance();
      obs = observableFromEvent(
        this,
        emitter.event,
        () => ({
          ctrlKey: emitter.keyStatus.ctrlKey,
          shiftKey: emitter.keyStatus.shiftKey,
          altKey: emitter.keyStatus.altKey,
          metaKey: emitter.keyStatus.metaKey
        })
      );
      this._modifierObservables.set(win, obs);
    }
    return obs.read(reader);
  }
  createFocusTracker(element, store) {
    const tracker2 = store.add(trackFocus(element));
    const hasFocusWithin = (el) => {
      if (el instanceof Window) {
        return el.document.hasFocus();
      }
      const shadowRoot = el.getRootNode() instanceof ShadowRoot ? el.getRootNode() : null;
      const activeElement = shadowRoot ? shadowRoot.activeElement : el.ownerDocument.activeElement;
      return el.contains(activeElement);
    };
    const value2 = observableValue("isFocused", hasFocusWithin(element));
    store.add(tracker2.onDidFocus(() => value2.set(true, void 0)));
    store.add(tracker2.onDidBlur(() => value2.set(false, void 0)));
    return value2;
  }
  createHoverTracker(element, store) {
    const value2 = observableValue("isHovered", false);
    const onEnter = () => value2.set(true, void 0);
    const onLeave = () => value2.set(false, void 0);
    element.addEventListener("mouseenter", onEnter);
    element.addEventListener("mouseleave", onLeave);
    store.add({
      dispose: () => {
        element.removeEventListener("mouseenter", onEnter);
        element.removeEventListener("mouseleave", onLeave);
      }
    });
    return value2;
  }
  createDomFocusTracker(element) {
    return trackFocus(element);
  }
};

registerSingleton(IUserInteractionService, UserInteractionService, 1 /* Delayed */);
export { UserInteractionService };
