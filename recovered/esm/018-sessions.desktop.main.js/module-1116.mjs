// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webviewWindowDragMonitor.ts
import { Disposable } from "./module-0012.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";


// src/vs/workbench/contrib/webview/browser/webviewWindowDragMonitor.ts
var WebviewWindowDragMonitor = class extends Disposable {
  constructor(targetWindow, getWebview) {
    super();
    const onDragStart = () => {
      getWebview()?.windowDidDragStart();
    };
    const onDragEnd = () => {
      getWebview()?.windowDidDragEnd();
    };
    this._register(addDisposableListener(targetWindow, EventType.DRAG_START, () => {
      onDragStart();
    }));
    this._register(addDisposableListener(targetWindow, EventType.DRAG_END, onDragEnd));
    this._register(addDisposableListener(targetWindow, EventType.MOUSE_MOVE, (currentEvent) => {
      if (currentEvent.buttons === 0) {
        onDragEnd();
      }
    }));
    this._register(addDisposableListener(targetWindow, EventType.DRAG, (event) => {
      if (event.shiftKey) {
        onDragEnd();
      } else {
        onDragStart();
      }
    }));
    this._register(addDisposableListener(targetWindow, EventType.DRAG_OVER, (event) => {
      if (event.shiftKey) {
        onDragEnd();
      } else {
        onDragStart();
      }
    }));
  }
};
export { WebviewWindowDragMonitor };
