// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLabelService.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/api/browser/mainThreadLabelService.ts
var MainThreadLabelService = class extends Disposable {
  constructor(_, _labelService) {
    super();
    this._labelService = _labelService;
    this._resourceLabelFormatters = this._register(new DisposableMap());
  }
  $registerResourceLabelFormatter(handle2, formatter) {
    formatter.priority = true;
    const disposable = this._labelService.registerCachedFormatter(formatter);
    this._resourceLabelFormatters.set(handle2, disposable);
  }
  $unregisterResourceLabelFormatter(handle2) {
    this._resourceLabelFormatters.deleteAndDispose(handle2);
  }
};

MainThreadLabelService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLabelService),
  __decorateParam(1, ILabelService)
], MainThreadLabelService);
export { MainThreadLabelService };
