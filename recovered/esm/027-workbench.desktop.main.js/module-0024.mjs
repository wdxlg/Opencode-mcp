// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/mouseEvent.ts
import { IframeUtils } from "./module-0023.mjs";
import { isChrome2, isFirefox2, isSafari2 } from "./module-0018.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";


// src/vs/base/browser/mouseEvent.ts
var StandardMouseEvent = class {
  constructor(targetWindow, e) {
    this.timestamp = Date.now();
    this.browserEvent = e;
    this.leftButton = e.button === 0;
    this.middleButton = e.button === 1;
    this.rightButton = e.button === 2;
    this.buttons = e.buttons;
    this.defaultPrevented = e.defaultPrevented;
    this.target = e.target;
    this.detail = e.detail || 1;
    if (e.type === "dblclick") {
      this.detail = 2;
    }
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.posx = e.pageX;
    this.posy = e.pageY;
    const iframeOffsets = IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(targetWindow, e.view);
    this.posx -= iframeOffsets.left;
    this.posy -= iframeOffsets.top;
  }
  preventDefault() {
    this.browserEvent.preventDefault();
  }
  stopPropagation() {
    this.browserEvent.stopPropagation();
  }
};

var StandardWheelEvent = class {
  constructor(e, deltaX = 0, deltaY = 0) {
    this.browserEvent = e || null;
    this.target = e ? e.target || e.targetNode || e.srcElement : null;
    this.deltaY = deltaY;
    this.deltaX = deltaX;
    let shouldFactorDPR = false;
    if (isChrome2) {
      const chromeVersionMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
      const chromeMajorVersion = chromeVersionMatch ? parseInt(chromeVersionMatch[1]) : 123;
      shouldFactorDPR = chromeMajorVersion <= 122;
    }
    if (e) {
      const e1 = e;
      const e2 = e;
      const devicePixelRatio = e.view?.devicePixelRatio || 1;
      if (typeof e1.wheelDeltaY !== "undefined") {
        if (shouldFactorDPR) {
          this.deltaY = e1.wheelDeltaY / (120 * devicePixelRatio);
        } else {
          this.deltaY = e1.wheelDeltaY / 120;
        }
      } else if (typeof e2.VERTICAL_AXIS !== "undefined" && e2.axis === e2.VERTICAL_AXIS) {
        this.deltaY = -e2.detail / 3;
      } else if (e.type === "wheel") {
        const ev = e;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (isFirefox2 && !isMacintosh) {
            this.deltaY = -e.deltaY / 3;
          } else {
            this.deltaY = -e.deltaY;
          }
        } else {
          this.deltaY = -e.deltaY / 40;
        }
      }
      if (typeof e1.wheelDeltaX !== "undefined") {
        if (isSafari2 && isWindows) {
          this.deltaX = -(e1.wheelDeltaX / 120);
        } else if (shouldFactorDPR) {
          this.deltaX = e1.wheelDeltaX / (120 * devicePixelRatio);
        } else {
          this.deltaX = e1.wheelDeltaX / 120;
        }
      } else if (typeof e2.HORIZONTAL_AXIS !== "undefined" && e2.axis === e2.HORIZONTAL_AXIS) {
        this.deltaX = -e.detail / 3;
      } else if (e.type === "wheel") {
        const ev = e;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (isFirefox2 && !isMacintosh) {
            this.deltaX = -e.deltaX / 3;
          } else {
            this.deltaX = -e.deltaX;
          }
        } else {
          this.deltaX = -e.deltaX / 40;
        }
      }
      if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
        if (shouldFactorDPR) {
          this.deltaY = e.wheelDelta / (120 * devicePixelRatio);
        } else {
          this.deltaY = e.wheelDelta / 120;
        }
      }
    }
  }
  preventDefault() {
    this.browserEvent?.preventDefault();
  }
  stopPropagation() {
    this.browserEvent?.stopPropagation();
  }
};
export { StandardMouseEvent, StandardWheelEvent };
