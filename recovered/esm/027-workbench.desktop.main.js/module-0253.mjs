// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/scrollbar/scrollbarArrow.ts
import { Widget } from "./module-0252.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { EventType, WindowIntervalTimer, addStandardDisposableListener, getWindow } from "./module-0075.mjs";
import { TimeoutTimer } from "./module-0036.mjs";


// src/vs/base/browser/ui/scrollbar/scrollbarArrow.ts
var ARROW_IMG_SIZE = 11;

var ScrollbarArrow = class extends Widget {
  constructor(opts) {
    super();
    this._onActivate = opts.onActivate;
    this.bgDomNode = document.createElement("div");
    this.bgDomNode.className = "arrow-background";
    this.bgDomNode.style.position = "absolute";
    this.bgDomNode.style.width = opts.bgWidth + "px";
    this.bgDomNode.style.height = opts.bgHeight + "px";
    if (typeof opts.top !== "undefined") {
      this.bgDomNode.style.top = "0px";
    }
    if (typeof opts.left !== "undefined") {
      this.bgDomNode.style.left = "0px";
    }
    if (typeof opts.bottom !== "undefined") {
      this.bgDomNode.style.bottom = "0px";
    }
    if (typeof opts.right !== "undefined") {
      this.bgDomNode.style.right = "0px";
    }
    this.domNode = document.createElement("div");
    this.domNode.className = opts.className;
    this.domNode.classList.add(...ThemeIcon.asClassNameArray(opts.icon));
    this.domNode.style.position = "absolute";
    this.domNode.style.width = ARROW_IMG_SIZE + "px";
    this.domNode.style.height = ARROW_IMG_SIZE + "px";
    if (typeof opts.top !== "undefined") {
      this.domNode.style.top = opts.top + "px";
    }
    if (typeof opts.left !== "undefined") {
      this.domNode.style.left = opts.left + "px";
    }
    if (typeof opts.bottom !== "undefined") {
      this.domNode.style.bottom = opts.bottom + "px";
    }
    if (typeof opts.right !== "undefined") {
      this.domNode.style.right = opts.right + "px";
    }
    this._pointerMoveMonitor = this._register(new GlobalPointerMoveMonitor());
    this._register(addStandardDisposableListener(this.bgDomNode, EventType.POINTER_DOWN, (e) => this._arrowPointerDown(e)));
    this._register(addStandardDisposableListener(this.domNode, EventType.POINTER_DOWN, (e) => this._arrowPointerDown(e)));
    this._pointerdownRepeatTimer = this._register(new WindowIntervalTimer());
    this._pointerdownScheduleRepeatTimer = this._register(new TimeoutTimer());
  }
  _arrowPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) {
      return;
    }
    const scheduleRepeater = () => {
      this._pointerdownRepeatTimer.cancelAndSet(() => this._onActivate(), 1e3 / 24, getWindow(e));
    };
    this._onActivate();
    this._pointerdownRepeatTimer.cancel();
    this._pointerdownScheduleRepeatTimer.cancelAndSet(scheduleRepeater, 200);
    this._pointerMoveMonitor.startMonitoring(
      e.target,
      e.pointerId,
      e.buttons,
      (pointerMoveData) => {
      },
      () => {
        this._pointerdownRepeatTimer.cancel();
        this._pointerdownScheduleRepeatTimer.cancel();
      }
    );
    e.preventDefault();
  }
};
export { ARROW_IMG_SIZE, ScrollbarArrow };
