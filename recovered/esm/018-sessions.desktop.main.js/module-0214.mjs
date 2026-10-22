// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/config/elementSizeObserver.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";


// src/vs/editor/browser/config/elementSizeObserver.ts
var ElementSizeObserver = class extends Disposable {
  constructor(referenceDomElement, dimension) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._referenceDomElement = referenceDomElement;
    this._width = -1;
    this._height = -1;
    this._resizeObserver = null;
    this.measureReferenceDomElement(false, dimension);
  }
  dispose() {
    this.stopObserving();
    super.dispose();
  }
  getWidth() {
    return this._width;
  }
  getHeight() {
    return this._height;
  }
  startObserving() {
    if (!this._resizeObserver && this._referenceDomElement) {
      let observedDimension = null;
      const observeNow = () => {
        if (observedDimension) {
          this.observe({ width: observedDimension.width, height: observedDimension.height });
        } else {
          this.observe();
        }
      };
      let shouldObserve = false;
      let alreadyObservedThisAnimationFrame = false;
      const update = () => {
        if (shouldObserve && !alreadyObservedThisAnimationFrame) {
          try {
            shouldObserve = false;
            alreadyObservedThisAnimationFrame = true;
            observeNow();
          } finally {
            scheduleAtNextAnimationFrame(getWindow(this._referenceDomElement), () => {
              alreadyObservedThisAnimationFrame = false;
              update();
            });
          }
        }
      };
      this._resizeObserver = new ResizeObserver((entries2) => {
        if (entries2 && entries2[0] && entries2[0].contentRect) {
          observedDimension = { width: entries2[0].contentRect.width, height: entries2[0].contentRect.height };
        } else {
          observedDimension = null;
        }
        shouldObserve = true;
        update();
      });
      this._resizeObserver.observe(this._referenceDomElement);
    }
  }
  stopObserving() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
  observe(dimension) {
    this.measureReferenceDomElement(true, dimension);
  }
  measureReferenceDomElement(emitEvent, dimension) {
    let observedWidth = 0;
    let observedHeight = 0;
    if (dimension) {
      observedWidth = dimension.width;
      observedHeight = dimension.height;
    } else if (this._referenceDomElement) {
      observedWidth = this._referenceDomElement.clientWidth;
      observedHeight = this._referenceDomElement.clientHeight;
    }
    observedWidth = Math.max(5, observedWidth);
    observedHeight = Math.max(5, observedHeight);
    if (this._width !== observedWidth || this._height !== observedHeight) {
      this._width = observedWidth;
      this._height = observedHeight;
      if (emitEvent) {
        this._onDidChange.fire();
      }
    }
  }
};
export { ElementSizeObserver };
