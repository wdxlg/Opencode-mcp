// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/globalPointerMoveMonitor.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { EventType, addDisposableListener, getWindow } from "./module-0075.mjs";


// src/vs/base/browser/globalPointerMoveMonitor.ts
var GlobalPointerMoveMonitor = class {
  constructor() {
    this._hooks = new DisposableStore();
    this._pointerMoveCallback = null;
    this._onStopCallback = null;
  }
  dispose() {
    this.stopMonitoring(false);
    this._hooks.dispose();
  }
  stopMonitoring(invokeStopCallback, browserEvent) {
    if (!this.isMonitoring()) {
      return;
    }
    this._hooks.clear();
    this._pointerMoveCallback = null;
    const onStopCallback = this._onStopCallback;
    this._onStopCallback = null;
    if (invokeStopCallback && onStopCallback) {
      onStopCallback(browserEvent);
    }
  }
  isMonitoring() {
    return !!this._pointerMoveCallback;
  }
  startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
    if (this.isMonitoring()) {
      this.stopMonitoring(false);
    }
    this._pointerMoveCallback = pointerMoveCallback;
    this._onStopCallback = onStopCallback;
    let eventSource = initialElement;
    try {
      initialElement.setPointerCapture(pointerId);
      this._hooks.add(toDisposable(() => {
        try {
          initialElement.releasePointerCapture(pointerId);
        } catch (err) {
        }
      }));
    } catch (err) {
      eventSource = getWindow(initialElement);
    }
    this._hooks.add(addDisposableListener(
      eventSource,
      EventType.POINTER_MOVE,
      (e4) => {
        if (e4.buttons !== initialButtons) {
          this.stopMonitoring(true);
          return;
        }
        e4.preventDefault();
        this._pointerMoveCallback(e4);
      }
    ));
    this._hooks.add(addDisposableListener(
      eventSource,
      EventType.POINTER_UP,
      (e4) => this.stopMonitoring(true)
    ));
  }
};
export { GlobalPointerMoveMonitor };
