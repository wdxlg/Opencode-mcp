// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/accessibility/common/accessibility.ts
import { createDecorator } from "./module-0077.mjs";
import { RawContextKey } from "./module-0089.mjs";


// src/vs/platform/accessibility/common/accessibility.ts
var IAccessibilityService = createDecorator("accessibilityService");

var CONTEXT_ACCESSIBILITY_MODE_ENABLED = new RawContextKey("accessibilityModeEnabled", false);

function isAccessibilityInformation(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const candidate = obj;
  return typeof candidate.label === "string" && (typeof candidate.role === "undefined" || typeof candidate.role === "string");
}

var ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = "ACCESSIBLE_VIEW_SHOWN_";
export { isAccessibilityInformation, IAccessibilityService, CONTEXT_ACCESSIBILITY_MODE_ENABLED, ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX };
