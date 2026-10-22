// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/accessibility/common/accessibleViewInformationService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX } from "./module-0104.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/services/accessibility/common/accessibleViewInformationService.ts
var IAccessibleViewInformationService = createDecorator("accessibleViewInformationService");

var AccessibleViewInformationService = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
  }
  hasShownAccessibleView(viewId) {
    return this._storageService.getBoolean(`${ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX}${viewId}`, -1 /* APPLICATION */, false) === true;
  }
};

AccessibleViewInformationService = __decorateClass([
  __decorateParam(0, IStorageService)
], AccessibleViewInformationService);
export { IAccessibleViewInformationService, AccessibleViewInformationService };
