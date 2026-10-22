// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/menuMotion.ts
import { CONTEXT_VIEW_MENU_MOTION_CLASS, contextViewMenuCloseAnimation } from "./module-0471.mjs";


// src/vs/workbench/browser/actions/menuMotion.ts
var WORKBENCH_MENU_MOTION_CLASS = CONTEXT_VIEW_MENU_MOTION_CLASS;

var workbenchMenuCloseAnimation = contextViewMenuCloseAnimation;

function getWorkbenchMenuMotionContextMenuOptions(anchor) {
  return {
    getAnchor: () => anchor,
    getMenuClassName: () => WORKBENCH_MENU_MOTION_CLASS,
    closeAnimation: workbenchMenuCloseAnimation
  };
}
export { getWorkbenchMenuMotionContextMenuOptions, WORKBENCH_MENU_MOTION_CLASS, workbenchMenuCloseAnimation };
