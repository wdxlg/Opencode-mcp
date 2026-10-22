// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/pixelRatio.ts
import { Disposable, markAsSingleton, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getWindowId, onDidUnregisterWindow } from "./module-0075.mjs";


// src/vs/base/browser/pixelRatio.ts
var DevicePixelRatioMonitor = class extends Disposable {
  constructor(targetWindow) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._listener = () => this._handleChange(targetWindow, true);
    this._mediaQueryList = null;
    this._handleChange(targetWindow, false);
    this._register(toDisposable(() => this._mediaQueryList?.removeEventListener("change", this._listener)));
  }
  _handleChange(targetWindow, fireEvent) {
    this._mediaQueryList?.removeEventListener("change", this._listener);
    this._mediaQueryList = targetWindow.matchMedia(`(resolution: ${targetWindow.devicePixelRatio}dppx)`);
    this._mediaQueryList.addEventListener("change", this._listener);
    if (fireEvent) {
      this._onDidChange.fire();
    }
  }
};

var PixelRatioMonitorImpl = class extends Disposable {
  constructor(targetWindow) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._value = this._getPixelRatio(targetWindow);
    const dprMonitor = this._register(new DevicePixelRatioMonitor(targetWindow));
    this._register(dprMonitor.onDidChange(() => {
      this._value = this._getPixelRatio(targetWindow);
      this._onDidChange.fire(this._value);
    }));
  }
  get value() {
    return this._value;
  }
  _getPixelRatio(targetWindow) {
    const ctx = document.createElement("canvas").getContext("2d");
    const dpr = targetWindow.devicePixelRatio || 1;
    const bsr = ctx?.webkitBackingStorePixelRatio || ctx?.mozBackingStorePixelRatio || ctx?.msBackingStorePixelRatio || ctx?.oBackingStorePixelRatio || ctx?.backingStorePixelRatio || 1;
    return dpr / bsr;
  }
};

var PixelRatioMonitorFacade = class {
  constructor() {
    this.mapWindowIdToPixelRatioMonitor = /* @__PURE__ */ new Map();
  }
  _getOrCreatePixelRatioMonitor(targetWindow) {
    const targetWindowId = getWindowId(targetWindow);
    let pixelRatioMonitor = this.mapWindowIdToPixelRatioMonitor.get(targetWindowId);
    if (!pixelRatioMonitor) {
      pixelRatioMonitor = markAsSingleton(new PixelRatioMonitorImpl(targetWindow));
      this.mapWindowIdToPixelRatioMonitor.set(targetWindowId, pixelRatioMonitor);
      markAsSingleton(Event2.once(onDidUnregisterWindow)(({ vscodeWindowId }) => {
        if (vscodeWindowId === targetWindowId) {
          pixelRatioMonitor?.dispose();
          this.mapWindowIdToPixelRatioMonitor.delete(targetWindowId);
        }
      }));
    }
    return pixelRatioMonitor;
  }
  getInstance(targetWindow) {
    return this._getOrCreatePixelRatioMonitor(targetWindow);
  }
};

var PixelRatio = new PixelRatioMonitorFacade();
export { DevicePixelRatioMonitor, PixelRatioMonitorImpl, PixelRatioMonitorFacade, PixelRatio };
