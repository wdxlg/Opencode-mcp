// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadShare.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IShareService } from "./module-1438.mjs";


// src/vs/workbench/api/browser/mainThreadShare.ts
var MainThreadShare = class {
  constructor(extHostContext, shareService) {
    this.shareService = shareService;
    this.providers = /* @__PURE__ */ new Map();
    this.providerDisposables = /* @__PURE__ */ new Map();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostShare);
  }
  $registerShareProvider(handle2, selector, id2, label3, priority) {
    const provider = {
      id: id2,
      label: label3,
      selector,
      priority,
      provideShare: async (item) => {
        const result = await this.proxy.$provideShare(handle2, item, CancellationToken.None);
        return typeof result === "string" ? result : URI.revive(result);
      }
    };
    this.providers.set(handle2, provider);
    const disposable = this.shareService.registerShareProvider(provider);
    this.providerDisposables.set(handle2, disposable);
  }
  $unregisterShareProvider(handle2) {
    this.providers.delete(handle2);
    this.providerDisposables.delete(handle2);
  }
  dispose() {
    this.providers.clear();
    dispose(this.providerDisposables.values());
    this.providerDisposables.clear();
  }
};

MainThreadShare = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadShare),
  __decorateParam(1, IShareService)
], MainThreadShare);
export { MainThreadShare };
