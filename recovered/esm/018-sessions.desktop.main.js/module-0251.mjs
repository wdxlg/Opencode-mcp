// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/touch.ts
import { Disposable, markAsSingleton, toDisposable } from "./module-0012.mjs";
import { LinkedList } from "./module-0013.mjs";
import { Event2 } from "./module-0017.mjs";
import { addDisposableListener, onDidRegisterWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/base/browser/touch.ts
var EventType2;

((EventType3) => {
  EventType3.Tap = "-monaco-gesturetap";
  EventType3.Change = "-monaco-gesturechange";
  EventType3.Start = "-monaco-gesturestart";
  EventType3.End = "-monaco-gesturesend";
  EventType3.Contextmenu = "-monaco-gesturecontextmenu";
})(EventType2 || (EventType2 = {}));

var _Gesture = class _Gesture extends Disposable {
  // ms
  constructor() {
    super();
    this.dispatched = false;
    this.targets = new LinkedList();
    this.ignoreTargets = new LinkedList();
    this.activeTouches = {};
    this.handle = null;
    this._lastSetTapCountTime = 0;
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2.document, "touchstart", (e4) => this.onTouchStart(e4), { passive: false }));
      disposables.add(addDisposableListener(window2.document, "touchend", (e4) => this.onTouchEnd(window2, e4)));
      disposables.add(addDisposableListener(window2.document, "touchmove", (e4) => this.onTouchMove(e4), { passive: false }));
    }, { window: mainWindow, disposables: this._store }));
  }
  static {
    this.SCROLL_FRICTION = -5e-3;
  }
  static {
    this.HOLD_DELAY = 700;
  }
  static {
    this.CLEAR_TAP_COUNT_TIME = 400;
  }
  static addTarget(element) {
    if (!_Gesture.isTouchDevice()) {
      return Disposable.None;
    }
    if (!_Gesture.INSTANCE) {
      _Gesture.INSTANCE = markAsSingleton(new _Gesture());
    }
    const remove2 = _Gesture.INSTANCE.targets.push(element);
    return toDisposable(remove2);
  }
  static ignoreTarget(element) {
    if (!_Gesture.isTouchDevice()) {
      return Disposable.None;
    }
    if (!_Gesture.INSTANCE) {
      _Gesture.INSTANCE = markAsSingleton(new _Gesture());
    }
    const remove2 = _Gesture.INSTANCE.ignoreTargets.push(element);
    return toDisposable(remove2);
  }
  static isTouchDevice() {
    return "ontouchstart" in mainWindow || navigator.maxTouchPoints > 0;
  }
  static isHoverDevice() {
    return mainWindow.matchMedia("(hover: hover)").matches;
  }
  dispose() {
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }
    super.dispose();
  }
  onTouchStart(e4) {
    const timestamp = Date.now();
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }
    for (let i2 = 0, len = e4.targetTouches.length; i2 < len; i2++) {
      const touch = e4.targetTouches.item(i2);
      this.activeTouches[touch.identifier] = {
        id: touch.identifier,
        initialTarget: touch.target,
        initialTimeStamp: timestamp,
        initialPageX: touch.pageX,
        initialPageY: touch.pageY,
        rollingTimestamps: [timestamp],
        rollingPageX: [touch.pageX],
        rollingPageY: [touch.pageY]
      };
      const evt = this.newGestureEvent(EventType2.Start, touch.target);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt);
    }
    if (this.dispatched) {
      e4.preventDefault();
      e4.stopPropagation();
      this.dispatched = false;
    }
  }
  onTouchEnd(targetWindow, e4) {
    const timestamp = Date.now();
    const activeTouchCount = Object.keys(this.activeTouches).length;
    for (let i2 = 0, len = e4.changedTouches.length; i2 < len; i2++) {
      const touch = e4.changedTouches.item(i2);
      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn("move of an UNKNOWN touch", touch);
        continue;
      }
      const data = this.activeTouches[touch.identifier], holdTime = Date.now() - data.initialTimeStamp;
      if (holdTime < _Gesture.HOLD_DELAY && Math.abs(data.initialPageX - data.rollingPageX.at(-1)) < 30 && Math.abs(data.initialPageY - data.rollingPageY.at(-1)) < 30) {
        const evt = this.newGestureEvent(EventType2.Tap, data.initialTarget);
        evt.pageX = data.rollingPageX.at(-1);
        evt.pageY = data.rollingPageY.at(-1);
        this.dispatchEvent(evt);
      } else if (holdTime >= _Gesture.HOLD_DELAY && Math.abs(data.initialPageX - data.rollingPageX.at(-1)) < 30 && Math.abs(data.initialPageY - data.rollingPageY.at(-1)) < 30) {
        const evt = this.newGestureEvent(EventType2.Contextmenu, data.initialTarget);
        evt.pageX = data.rollingPageX.at(-1);
        evt.pageY = data.rollingPageY.at(-1);
        this.dispatchEvent(evt);
      } else if (activeTouchCount === 1) {
        const finalX = data.rollingPageX.at(-1);
        const finalY = data.rollingPageY.at(-1);
        const deltaT = data.rollingTimestamps.at(-1) - data.rollingTimestamps[0];
        const deltaX = finalX - data.rollingPageX[0];
        const deltaY = finalY - data.rollingPageY[0];
        const dispatchTo = [...this.targets].filter((t2) => data.initialTarget instanceof Node && t2.contains(data.initialTarget));
        this.inertia(
          targetWindow,
          dispatchTo,
          timestamp,
          // time now
          Math.abs(deltaX) / deltaT,
          // speed
          deltaX > 0 ? 1 : -1,
          // x direction
          finalX,
          // x now
          Math.abs(deltaY) / deltaT,
          // y speed
          deltaY > 0 ? 1 : -1,
          // y direction
          finalY
          // y now
        );
      }
      this.dispatchEvent(this.newGestureEvent(EventType2.End, data.initialTarget));
      delete this.activeTouches[touch.identifier];
    }
    if (this.dispatched) {
      e4.preventDefault();
      e4.stopPropagation();
      this.dispatched = false;
    }
  }
  newGestureEvent(type, initialTarget) {
    const event = document.createEvent("CustomEvent");
    event.initEvent(type, false, true);
    event.initialTarget = initialTarget;
    event.tapCount = 0;
    return event;
  }
  dispatchEvent(event) {
    if (event.type === EventType2.Tap) {
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      let setTapCount = 0;
      if (currentTime - this._lastSetTapCountTime > _Gesture.CLEAR_TAP_COUNT_TIME) {
        setTapCount = 1;
      } else {
        setTapCount = 2;
      }
      this._lastSetTapCountTime = currentTime;
      event.tapCount = setTapCount;
    } else if (event.type === EventType2.Change || event.type === EventType2.Contextmenu) {
      this._lastSetTapCountTime = 0;
    }
    if (event.initialTarget instanceof Node) {
      for (const ignoreTarget of this.ignoreTargets) {
        if (ignoreTarget.contains(event.initialTarget)) {
          return;
        }
      }
      const targets = [];
      for (const target of this.targets) {
        if (target.contains(event.initialTarget)) {
          let depth = 0;
          let now = event.initialTarget;
          while (now && now !== target) {
            depth++;
            now = now.parentElement;
          }
          targets.push([depth, target]);
        }
      }
      targets.sort((a, b) => a[0] - b[0]);
      for (const [_, target] of targets) {
        target.dispatchEvent(event);
        this.dispatched = true;
      }
    }
  }
  inertia(targetWindow, dispatchTo, t1, vX, dirX, x, vY, dirY, y) {
    this.handle = scheduleAtNextAnimationFrame(targetWindow, () => {
      const now = Date.now();
      const deltaT = now - t1;
      let delta_pos_x = 0, delta_pos_y = 0;
      let stopped = true;
      vX += _Gesture.SCROLL_FRICTION * deltaT;
      vY += _Gesture.SCROLL_FRICTION * deltaT;
      if (vX > 0) {
        stopped = false;
        delta_pos_x = dirX * vX * deltaT;
      }
      if (vY > 0) {
        stopped = false;
        delta_pos_y = dirY * vY * deltaT;
      }
      const evt = this.newGestureEvent(EventType2.Change);
      evt.translationX = delta_pos_x;
      evt.translationY = delta_pos_y;
      dispatchTo.forEach((d) => d.dispatchEvent(evt));
      if (!stopped) {
        this.inertia(targetWindow, dispatchTo, now, vX, dirX, x + delta_pos_x, vY, dirY, y + delta_pos_y);
      }
    });
  }
  onTouchMove(e4) {
    const timestamp = Date.now();
    for (let i2 = 0, len = e4.changedTouches.length; i2 < len; i2++) {
      const touch = e4.changedTouches.item(i2);
      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn("end of an UNKNOWN touch", touch);
        continue;
      }
      const data = this.activeTouches[touch.identifier];
      const evt = this.newGestureEvent(EventType2.Change, data.initialTarget);
      evt.translationX = touch.pageX - data.rollingPageX.at(-1);
      evt.translationY = touch.pageY - data.rollingPageY.at(-1);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt);
      if (data.rollingPageX.length > 3) {
        data.rollingPageX.shift();
        data.rollingPageY.shift();
        data.rollingTimestamps.shift();
      }
      data.rollingPageX.push(touch.pageX);
      data.rollingPageY.push(touch.pageY);
      data.rollingTimestamps.push(timestamp);
    }
    if (this.dispatched) {
      e4.preventDefault();
      e4.stopPropagation();
      this.dispatched = false;
    }
  }
};

__decorateClass([
  memoize
], _Gesture, "isTouchDevice", 1);

__decorateClass([
  memoize
], _Gesture, "isHoverDevice", 1);

var Gesture = _Gesture;
export { EventType2, _Gesture, Gesture };
