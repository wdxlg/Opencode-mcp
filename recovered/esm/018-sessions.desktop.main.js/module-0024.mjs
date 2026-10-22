// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/mouseEvent.ts
import { IframeUtils } from "./module-0023.mjs";
import { isChrome2, isFirefox2, isSafari2 } from "./module-0018.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";


// src/vs/base/browser/mouseEvent.ts
var StandardMouseEvent = class {
  constructor(targetWindow, e4) {
    this.timestamp = Date.now();
    this.browserEvent = e4;
    this.leftButton = e4.button === 0;
    this.middleButton = e4.button === 1;
    this.rightButton = e4.button === 2;
    this.buttons = e4.buttons;
    this.defaultPrevented = e4.defaultPrevented;
    this.target = e4.target;
    this.detail = e4.detail || 1;
    if (e4.type === "dblclick") {
      this.detail = 2;
    }
    this.ctrlKey = e4.ctrlKey;
    this.shiftKey = e4.shiftKey;
    this.altKey = e4.altKey;
    this.metaKey = e4.metaKey;
    this.posx = e4.pageX;
    this.posy = e4.pageY;
    const iframeOffsets = IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(targetWindow, e4.view);
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
  constructor(e4, deltaX = 0, deltaY = 0) {
    this.browserEvent = e4 || null;
    this.target = e4 ? e4.target || e4.targetNode || e4.srcElement : null;
    this.deltaY = deltaY;
    this.deltaX = deltaX;
    let shouldFactorDPR = false;
    if (isChrome2) {
      const chromeVersionMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
      const chromeMajorVersion = chromeVersionMatch ? parseInt(chromeVersionMatch[1]) : 123;
      shouldFactorDPR = chromeMajorVersion <= 122;
    }
    if (e4) {
      const e1 = e4;
      const e22 = e4;
      const devicePixelRatio = e4.view?.devicePixelRatio || 1;
      if (typeof e1.wheelDeltaY !== "undefined") {
        if (shouldFactorDPR) {
          this.deltaY = e1.wheelDeltaY / (120 * devicePixelRatio);
        } else {
          this.deltaY = e1.wheelDeltaY / 120;
        }
      } else if (typeof e22.VERTICAL_AXIS !== "undefined" && e22.axis === e22.VERTICAL_AXIS) {
        this.deltaY = -e22.detail / 3;
      } else if (e4.type === "wheel") {
        const ev = e4;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (isFirefox2 && !isMacintosh) {
            this.deltaY = -e4.deltaY / 3;
          } else {
            this.deltaY = -e4.deltaY;
          }
        } else {
          this.deltaY = -e4.deltaY / 40;
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
      } else if (typeof e22.HORIZONTAL_AXIS !== "undefined" && e22.axis === e22.HORIZONTAL_AXIS) {
        this.deltaX = -e4.detail / 3;
      } else if (e4.type === "wheel") {
        const ev = e4;
        if (ev.deltaMode === ev.DOM_DELTA_LINE) {
          if (isFirefox2 && !isMacintosh) {
            this.deltaX = -e4.deltaX / 3;
          } else {
            this.deltaX = -e4.deltaX;
          }
        } else {
          this.deltaX = -e4.deltaX / 40;
        }
      }
      if (this.deltaY === 0 && this.deltaX === 0 && e4.wheelDelta) {
        if (shouldFactorDPR) {
          this.deltaY = e4.wheelDelta / (120 * devicePixelRatio);
        } else {
          this.deltaY = e4.wheelDelta / 120;
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
