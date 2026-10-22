// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/hover/hoverDelegateFactory.ts
import { Lazy } from "./module-0028.mjs";


// src/vs/base/browser/ui/hover/hoverDelegateFactory.ts
var nullHoverDelegateFactory = () => ({
  get delay() {
    return -1;
  },
  dispose: () => {
  },
  showHover: () => {
    return void 0;
  }
});

var hoverDelegateFactory = nullHoverDelegateFactory;

var defaultHoverDelegateMouse = new Lazy(() => hoverDelegateFactory("mouse", false));

var defaultHoverDelegateElement = new Lazy(() => hoverDelegateFactory("element", false));

function setHoverDelegateFactory(hoverDelegateProvider) {
  hoverDelegateFactory = hoverDelegateProvider;
}

function getDefaultHoverDelegate(placement) {
  if (placement === "element") {
    return defaultHoverDelegateElement.value;
  }
  return defaultHoverDelegateMouse.value;
}

function createInstantHoverDelegate() {
  return hoverDelegateFactory("element", true);
}
export { setHoverDelegateFactory, getDefaultHoverDelegate, createInstantHoverDelegate, nullHoverDelegateFactory, hoverDelegateFactory, defaultHoverDelegateMouse, defaultHoverDelegateElement };
