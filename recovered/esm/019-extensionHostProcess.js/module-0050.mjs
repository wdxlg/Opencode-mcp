// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/accessibility/common/accessibility.ts
import { createDecorator2 } from "./module-0048.mjs";
import { RawContextKey } from "./module-0049.mjs";


// src/vs/platform/accessibility/common/accessibility.ts
var IAccessibilityService = createDecorator2("accessibilityService");

var CONTEXT_ACCESSIBILITY_MODE_ENABLED = new RawContextKey("accessibilityModeEnabled", false);
export { IAccessibilityService, CONTEXT_ACCESSIBILITY_MODE_ENABLED };
