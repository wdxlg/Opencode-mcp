// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/accessibility/common/accessibility.ts
import { createDecorator } from "./module-0038.mjs";
import { RawContextKey } from "./module-0044.mjs";


// src/vs/platform/accessibility/common/accessibility.ts
var IAccessibilityService = createDecorator("accessibilityService");

var CONTEXT_ACCESSIBILITY_MODE_ENABLED = new RawContextKey("accessibilityModeEnabled", false);
export { IAccessibilityService, CONTEXT_ACCESSIBILITY_MODE_ENABLED };
