// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverUtils.ts
import { getDomNodePagePosition } from "./module-0075.mjs";


// src/vs/editor/contrib/hover/browser/hoverUtils.ts
function isMousePositionWithinElement(element, posx, posy) {
  const elementRect = getDomNodePagePosition(element);
  if (posx < elementRect.left + 3 /* VALUE */ || posx > elementRect.left + elementRect.width - 3 /* VALUE */ || posy < elementRect.top + 3 /* VALUE */ || posy > elementRect.top + elementRect.height - 3 /* VALUE */) {
    return false;
  }
  return true;
}

function shouldShowHover(hoverEnabled, multiCursorModifier2, mouseEvent) {
  if (hoverEnabled === "on") {
    return true;
  }
  if (hoverEnabled === "off") {
    return false;
  }
  return isTriggerModifierPressed(multiCursorModifier2, mouseEvent.event);
}

function isTriggerModifierPressed(multiCursorModifier2, event) {
  if (multiCursorModifier2 === "altKey") {
    return event.ctrlKey || event.metaKey;
  }
  return event.altKey;
}
export { isMousePositionWithinElement, shouldShowHover, isTriggerModifierPressed };
