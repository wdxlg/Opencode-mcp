// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/window/electron-browser/window.ts
import { getActiveWindow, getWindows } from "./module-0075.mjs";
import { setZoomFactor, setZoomLevel } from "./module-0018.mjs";
import { zoomLevelToZoomFactor } from "./module-0515.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ipcRenderer, webFrame } from "./module-3724.mjs";


// src/vs/platform/window/electron-browser/window.ts
var MAX_ZOOM_LEVEL = 8;

var MIN_ZOOM_LEVEL = -8;

function applyZoom(zoomLevel, target) {
  zoomLevel = Math.min(Math.max(zoomLevel, MIN_ZOOM_LEVEL), MAX_ZOOM_LEVEL);
  const targetWindows = [];
  if (target === 1 /* ACTIVE_WINDOW */) {
    targetWindows.push(getActiveWindow());
  } else if (target === 2 /* ALL_WINDOWS */) {
    targetWindows.push(...Array.from(getWindows()).map(({ window: window2 }) => window2));
  } else {
    targetWindows.push(target);
  }
  for (const targetWindow of targetWindows) {
    getGlobals(targetWindow)?.webFrame?.setZoomLevel(zoomLevel);
    setZoomFactor(zoomLevelToZoomFactor(zoomLevel), targetWindow);
    setZoomLevel(zoomLevel, targetWindow);
  }
}

function getGlobals(win) {
  if (win === mainWindow) {
    return { ipcRenderer, webFrame };
  } else {
    const auxiliaryWindow = win;
    if (auxiliaryWindow?.vscode?.ipcRenderer && auxiliaryWindow?.vscode?.webFrame) {
      return auxiliaryWindow.vscode;
    }
  }
  return void 0;
}
export { applyZoom, getGlobals, MAX_ZOOM_LEVEL, MIN_ZOOM_LEVEL };
