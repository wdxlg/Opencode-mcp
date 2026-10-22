// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/customViewGridParts.ts
import { Disposable } from "./module-0012.mjs";
import { getClientArea } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { MobileCustomViewGridPart } from "./module-3509.mjs";
import { CustomViewGridPart } from "./module-3508.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ICustomViewGridPartService } from "./module-3473.mjs";


// src/vs/sessions/browser/parts/customViewGridParts.ts
var CustomViewGridParts = class extends Disposable {
  constructor(instantiationService) {
    super();
    const { width: width2 } = getClientArea(mainWindow.document.body);
    const isPhoneLayout2 = width2 < 640;
    this._mainPart = this._register(instantiationService.createInstance(isPhoneLayout2 ? MobileCustomViewGridPart : CustomViewGridPart));
  }
  setView(descriptor) {
    this._mainPart.setView(descriptor);
  }
  focusActiveView() {
    this._mainPart.focus();
  }
};

CustomViewGridParts = __decorateClass([
  __decorateParam(0, IInstantiationService)
], CustomViewGridParts);

registerSingleton(ICustomViewGridPartService, CustomViewGridParts, 0 /* Eager */);
export { CustomViewGridParts };
