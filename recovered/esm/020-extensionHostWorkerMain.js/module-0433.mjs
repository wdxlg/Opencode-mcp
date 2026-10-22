// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostShare.ts
import { MainContext } from "./module-0025.mjs";
import { DocumentSelector, Range3 } from "./module-0239.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/api/common/extHostShare.ts
var ExtHostShare = class _ExtHostShare {
  constructor(mainContext, uriTransformer) {
    this.uriTransformer = uriTransformer;
    this.providers = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadShare);
  }
  static {
    this.handlePool = 0;
  }
  async $provideShare(handle, shareableItem, token) {
    const provider = this.providers.get(handle);
    const result = await provider?.provideShare({ selection: Range3.to(shareableItem.selection), resourceUri: URI.revive(shareableItem.resourceUri) }, token);
    return result ?? void 0;
  }
  registerShareProvider(selector, provider) {
    const handle = _ExtHostShare.handlePool++;
    this.providers.set(handle, provider);
    this.proxy.$registerShareProvider(handle, DocumentSelector.from(selector, this.uriTransformer), provider.id, provider.label, provider.priority);
    return {
      dispose: () => {
        this.proxy.$unregisterShareProvider(handle);
        this.providers.delete(handle);
      }
    };
  }
};
export { ExtHostShare };
