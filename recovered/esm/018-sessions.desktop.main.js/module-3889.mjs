// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/mobileSessionLayoutController.ts
import { BaseLayoutController } from "./module-3887.mjs";


// src/vs/sessions/contrib/layout/browser/mobileSessionLayoutController.ts
var MobileLayoutController = class extends BaseLayoutController {
  static {
    this.ID = "workbench.contrib.sessionsMobileLayoutController";
  }
  // [M2] Intentionally does not override `_registerViewStateManagement`, so the
  // auxiliary bar is never auto-shown / hidden / captured on phone viewports.
};
export { MobileLayoutController };
