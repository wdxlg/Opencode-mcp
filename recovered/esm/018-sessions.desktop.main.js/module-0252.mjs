// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/widget.ts
import { Disposable } from "./module-0012.mjs";
import { EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Gesture } from "./module-0251.mjs";


// src/vs/base/browser/ui/widget.ts
var Widget = class extends Disposable {
  onclick(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.CLICK, (e4) => listener(new StandardMouseEvent(getWindow(domNode), e4))));
  }
  onmousedown(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.MOUSE_DOWN, (e4) => listener(new StandardMouseEvent(getWindow(domNode), e4))));
  }
  onmouseover(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.MOUSE_OVER, (e4) => listener(new StandardMouseEvent(getWindow(domNode), e4))));
  }
  onmouseleave(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.MOUSE_LEAVE, (e4) => listener(new StandardMouseEvent(getWindow(domNode), e4))));
  }
  onkeydown(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.KEY_DOWN, (e4) => listener(new StandardKeyboardEvent(e4))));
  }
  onkeyup(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.KEY_UP, (e4) => listener(new StandardKeyboardEvent(e4))));
  }
  oninput(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.INPUT, listener));
  }
  onblur(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.BLUR, listener));
  }
  onfocus(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.FOCUS, listener));
  }
  onchange(domNode, listener) {
    this._register(addDisposableListener(domNode, EventType.CHANGE, listener));
  }
  ignoreGesture(domNode) {
    return Gesture.ignoreTarget(domNode);
  }
};
export { Widget };
