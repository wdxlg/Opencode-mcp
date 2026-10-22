// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/common/browserZoomService.ts
import { createDecorator } from "./module-0077.mjs";
import { browserZoomDefaultIndex, browserZoomFactors } from "./module-1237.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { zoomLevelToZoomFactor } from "./module-0515.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/browserView/common/browserZoomService.ts
var IBrowserZoomService = createDecorator("browserZoomService");

var BROWSER_ZOOM_PER_HOST_STORAGE_KEY = "browserView.zoomPerHost";

var MATCH_WINDOW_ZOOM_LABEL = "Match Window";

var ZOOM_LABEL_TO_INDEX = new Map(
  browserZoomFactors.map((f, i2) => [`${Math.round(f * 100)}%`, i2])
);

var BrowserZoomService = class extends Disposable {
  // default: zoom level 0 → factor 1.0
  constructor(configurationService, storageService) {
    super();
    this.configurationService = configurationService;
    this.storageService = storageService;
    this._onDidChangeZoom = this._register(new Emitter());
    this.onDidChangeZoom = this._onDidChangeZoom.event;
    /** In-memory only; dropped on restart. */
    this._ephemeralZoomMap = /* @__PURE__ */ new Map();
    this._windowZoomFactor = zoomLevelToZoomFactor(0);
    this._persistentZoomMap = this._readPersistentZoomMap();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.browser.pageZoom")) {
        this._onDidChangeZoom.fire({ host: void 0, isEphemeralChange: false });
      }
    }));
  }
  getEffectiveZoomIndex(host, isEphemeral) {
    if (host !== void 0) {
      if (isEphemeral) {
        const ephemeralIndex = this._ephemeralZoomMap.get(host);
        if (ephemeralIndex !== void 0) {
          return this._clamp(ephemeralIndex);
        }
      } else {
        const persistentIndex = this._persistentZoomMap[host];
        if (persistentIndex !== void 0) {
          return this._clamp(persistentIndex);
        }
      }
    }
    return this._getDefaultZoomIndex();
  }
  setHostZoomIndex(host, zoomIndex, isEphemeral) {
    const clamped = this._clamp(zoomIndex);
    const defaultIndex = this._getDefaultZoomIndex();
    const matchesDefault = clamped === defaultIndex;
    if (isEphemeral) {
      if (matchesDefault) {
        if (!this._ephemeralZoomMap.has(host)) {
          return;
        }
        this._ephemeralZoomMap.delete(host);
      } else {
        if (this._ephemeralZoomMap.get(host) === clamped) {
          return;
        }
        this._ephemeralZoomMap.set(host, clamped);
      }
      this._onDidChangeZoom.fire({ host, isEphemeralChange: true });
    } else {
      let persistentChanged = false;
      if (matchesDefault) {
        if (Object.prototype.hasOwnProperty.call(this._persistentZoomMap, host)) {
          delete this._persistentZoomMap[host];
          persistentChanged = true;
        }
      } else if (this._persistentZoomMap[host] !== clamped) {
        this._persistentZoomMap[host] = clamped;
        persistentChanged = true;
      }
      let ephemeralChanged = false;
      if (matchesDefault) {
        ephemeralChanged = this._ephemeralZoomMap.delete(host);
      } else if (this._ephemeralZoomMap.get(host) !== clamped) {
        this._ephemeralZoomMap.set(host, clamped);
        ephemeralChanged = true;
      }
      if (!persistentChanged && !ephemeralChanged) {
        return;
      }
      if (persistentChanged) {
        this._writePersistentZoomMap();
      }
      this._onDidChangeZoom.fire({ host, isEphemeralChange: false });
    }
  }
  notifyWindowZoomChanged(windowZoomFactor) {
    this._windowZoomFactor = windowZoomFactor;
    const label3 = this.configurationService.getValue("workbench.browser.pageZoom");
    if (label3 === MATCH_WINDOW_ZOOM_LABEL) {
      this._onDidChangeZoom.fire({ host: void 0, isEphemeralChange: false });
    }
  }
  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  _getDefaultZoomIndex() {
    const label3 = this.configurationService.getValue("workbench.browser.pageZoom");
    if (label3 === MATCH_WINDOW_ZOOM_LABEL) {
      return this._getMatchWindowZoomIndex();
    }
    return ZOOM_LABEL_TO_INDEX.get(label3) ?? browserZoomDefaultIndex;
  }
  /**
   * Finds the browser zoom index whose factor is closest to the application's current UI zoom
   * factor, measuring distance on a log scale (since window zoom levels are powers of 1.2).
   */
  _getMatchWindowZoomIndex() {
    const windowFactor = this._windowZoomFactor;
    let bestIndex = browserZoomDefaultIndex;
    let bestDist = Infinity;
    for (let i2 = 0; i2 < browserZoomFactors.length; i2++) {
      const dist = Math.abs(Math.log(browserZoomFactors[i2]) - Math.log(windowFactor));
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i2;
      }
    }
    return bestIndex;
  }
  /**
   * Reads the persistent per-host zoom map from storage.
   * The stored format is a JSON object mapping host strings to zoom indices.
   */
  _readPersistentZoomMap() {
    const raw = this.storageService.get(BROWSER_ZOOM_PER_HOST_STORAGE_KEY, 0 /* PROFILE */);
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return {};
      }
      const result = {};
      for (const [host, index2] of Object.entries(parsed)) {
        if (typeof index2 === "number" && index2 >= 0 && index2 < browserZoomFactors.length) {
          result[host] = index2;
        }
      }
      return result;
    } catch {
      return {};
    }
  }
  _writePersistentZoomMap() {
    const hasEntries = Object.keys(this._persistentZoomMap).length > 0;
    if (hasEntries) {
      this.storageService.store(BROWSER_ZOOM_PER_HOST_STORAGE_KEY, JSON.stringify(this._persistentZoomMap), 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(BROWSER_ZOOM_PER_HOST_STORAGE_KEY, 0 /* PROFILE */);
    }
  }
  _clamp(index2) {
    return Math.max(0, Math.min(Math.trunc(index2), browserZoomFactors.length - 1));
  }
};

BrowserZoomService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IStorageService)
], BrowserZoomService);
export { IBrowserZoomService, BROWSER_ZOOM_PER_HOST_STORAGE_KEY, MATCH_WINDOW_ZOOM_LABEL, ZOOM_LABEL_TO_INDEX, BrowserZoomService };
