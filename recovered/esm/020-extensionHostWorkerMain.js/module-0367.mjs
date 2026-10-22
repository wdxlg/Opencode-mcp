// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLabelService.ts
import { MainContext } from "./module-0025.mjs";
import { toDisposable } from "./module-0011.mjs";


// src/vs/workbench/api/common/extHostLabelService.ts
var ExtHostLabelService = class {
  constructor(mainContext) {
    this._handlePool = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadLabelService);
  }
  $registerResourceLabelFormatter(formatter) {
    const handle = this._handlePool++;
    this._proxy.$registerResourceLabelFormatter(handle, formatter);
    return toDisposable(() => {
      this._proxy.$unregisterResourceLabelFormatter(handle);
    });
  }
};
export { ExtHostLabelService };
