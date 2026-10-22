// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/canIUse.ts
import { isNative } from "./module-0014.mjs";
import { isSafari2, isStandalone } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/base/browser/canIUse.ts
var BrowserFeatures = {
  clipboard: {
    writeText: isNative || document.queryCommandSupported && document.queryCommandSupported("copy") || !!(navigator && navigator.clipboard && navigator.clipboard.writeText),
    readText: isNative || !!(navigator && navigator.clipboard && navigator.clipboard.readText)
  },
  keyboard: (() => {
    if (isNative || isStandalone()) {
      return 0 /* Always */;
    }
    if (navigator.keyboard || isSafari2) {
      return 1 /* FullScreen */;
    }
    return 2 /* None */;
  })(),
  // 'ontouchstart' in window always evaluates to true with typescript's modern typings. This causes `window` to be
  // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
  touch: "ontouchstart" in mainWindow || navigator.maxTouchPoints > 0,
  pointerEvents: mainWindow.PointerEvent && ("ontouchstart" in mainWindow || navigator.maxTouchPoints > 0)
};
export { BrowserFeatures };
