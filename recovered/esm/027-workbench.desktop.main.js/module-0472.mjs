// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/hover/hoverDelegate2.ts
import { Disposable } from "./module-0012.mjs";


// src/vs/base/browser/ui/hover/hoverDelegate2.ts
var baseHoverDelegate = {
  showInstantHover: () => void 0,
  showDelayedHover: () => void 0,
  setupDelayedHover: () => Disposable.None,
  setupDelayedHoverAtMouse: () => Disposable.None,
  hideHover: () => void 0,
  showAndFocusLastHover: () => void 0,
  setupManagedHover: () => ({
    dispose: () => void 0,
    show: () => void 0,
    hide: () => void 0,
    update: () => void 0
  }),
  showManagedHover: () => void 0
};

function setBaseLayerHoverDelegate(hoverDelegate) {
  baseHoverDelegate = hoverDelegate;
}

function getBaseLayerHoverDelegate() {
  return baseHoverDelegate;
}
export { setBaseLayerHoverDelegate, getBaseLayerHoverDelegate, baseHoverDelegate };
