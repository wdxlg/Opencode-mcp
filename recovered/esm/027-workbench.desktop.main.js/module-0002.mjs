// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/window.ts



// src/vs/base/browser/window.ts
function ensureCodeWindow(targetWindow, fallbackWindowId) {
  const codeWindow = targetWindow;
  if (typeof codeWindow.vscodeWindowId !== "number") {
    Object.defineProperty(codeWindow, "vscodeWindowId", {
      get: () => fallbackWindowId
    });
  }
}

var mainWindow = window;

function isAuxiliaryWindow(obj) {
  if (obj === mainWindow) {
    return false;
  }
  const candidate = obj;
  return typeof candidate?.vscodeWindowId === "number";
}
export { ensureCodeWindow, isAuxiliaryWindow, mainWindow };
