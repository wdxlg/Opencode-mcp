// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostChatQuota.ts
import { Disposable } from "./module-0011.mjs";
import { MainContext } from "./module-0025.mjs";


// src/vs/workbench/api/common/extHostChatQuota.ts
var ExtHostChatQuota = class extends Disposable {
  constructor(mainContext) {
    super();
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatQuota);
  }
  updateQuotas(quotas) {
    this._proxy.$updateQuotas(quotas);
  }
};
export { ExtHostChatQuota };
