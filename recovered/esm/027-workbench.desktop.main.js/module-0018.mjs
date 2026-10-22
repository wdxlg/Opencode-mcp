// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/browser.ts
import { Emitter } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/base/browser/browser.ts
var WindowManager = class _WindowManager {
  constructor() {
    // --- Zoom Level
    this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map();
    this._onDidChangeZoomLevel = new Emitter();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
    // --- Zoom Factor
    this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map();
    // --- Fullscreen
    this._onDidChangeFullscreen = new Emitter();
    this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
    this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  }
  static {
    this.INSTANCE = new _WindowManager();
  }
  getZoomLevel(targetWindow) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
  }
  setZoomLevel(zoomLevel, targetWindow) {
    if (this.getZoomLevel(targetWindow) === zoomLevel) {
      return;
    }
    const targetWindowId = this.getWindowId(targetWindow);
    this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
    this._onDidChangeZoomLevel.fire(targetWindowId);
  }
  getZoomFactor(targetWindow) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
  }
  setZoomFactor(zoomFactor, targetWindow) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
  }
  setFullscreen(fullscreen, targetWindow) {
    if (this.isFullscreen(targetWindow) === fullscreen) {
      return;
    }
    const windowId = this.getWindowId(targetWindow);
    this.mapWindowIdToFullScreen.set(windowId, fullscreen);
    this._onDidChangeFullscreen.fire(windowId);
  }
  isFullscreen(targetWindow) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
  }
  getWindowId(targetWindow) {
    return targetWindow.vscodeWindowId;
  }
};

function addMatchMediaChangeListener(targetWindow, query, callback) {
  if (typeof query === "string") {
    query = targetWindow.matchMedia(query);
  }
  query.addEventListener("change", callback);
}

function setZoomLevel(zoomLevel, targetWindow) {
  WindowManager.INSTANCE.setZoomLevel(zoomLevel, targetWindow);
}

function getZoomLevel(targetWindow) {
  return WindowManager.INSTANCE.getZoomLevel(targetWindow);
}

var onDidChangeZoomLevel = WindowManager.INSTANCE.onDidChangeZoomLevel;

function getZoomFactor(targetWindow) {
  return WindowManager.INSTANCE.getZoomFactor(targetWindow);
}

function setZoomFactor(zoomFactor, targetWindow) {
  WindowManager.INSTANCE.setZoomFactor(zoomFactor, targetWindow);
}

function setFullscreen(fullscreen, targetWindow) {
  WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
}

function isFullscreen(targetWindow) {
  return WindowManager.INSTANCE.isFullscreen(targetWindow);
}

var onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;

var userAgent2 = navigator.userAgent;

var isFirefox2 = userAgent2.indexOf("Firefox") >= 0;

var isWebKit = userAgent2.indexOf("AppleWebKit") >= 0;

var isChrome2 = userAgent2.indexOf("Chrome") >= 0;

var isSafari2 = !isChrome2 && userAgent2.indexOf("Safari") >= 0;

var isWebkitWebView = !isChrome2 && !isSafari2 && isWebKit;

var isElectron2 = userAgent2.indexOf("Electron/") >= 0;

var isAndroid2 = userAgent2.indexOf("Android") >= 0;

var standalone = false;

if (typeof mainWindow.matchMedia === "function") {
  const standaloneMatchMedia = mainWindow.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)");
  const fullScreenMatchMedia = mainWindow.matchMedia("(display-mode: fullscreen)");
  standalone = standaloneMatchMedia.matches;
  addMatchMediaChangeListener(mainWindow, standaloneMatchMedia, ({ matches: matches2 }) => {
    if (standalone && fullScreenMatchMedia.matches) {
      return;
    }
    standalone = matches2;
  });
}

function isStandalone() {
  return standalone;
}

function isWCOEnabled() {
  return !!navigator?.windowControlsOverlay?.visible;
}

function getWCOTitlebarAreaRect(targetWindow) {
  return targetWindow.navigator?.windowControlsOverlay?.getTitlebarAreaRect();
}

function getMonacoEnvironment() {
  return globalThis.MonacoEnvironment;
}
export { addMatchMediaChangeListener, setZoomLevel, getZoomLevel, getZoomFactor, setZoomFactor, setFullscreen, isFullscreen, isStandalone, isWCOEnabled, getWCOTitlebarAreaRect, getMonacoEnvironment, WindowManager, onDidChangeZoomLevel, onDidChangeFullscreen, userAgent2, isFirefox2, isWebKit, isChrome2, isSafari2, isWebkitWebView, isElectron2, isAndroid2, standalone };
