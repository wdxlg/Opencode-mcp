// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostAiRelatedInformation.ts
import { MainContext } from "./module-0054.mjs";
import { Disposable3 } from "./module-0244.mjs";


// src/vs/workbench/api/common/extHostAiRelatedInformation.ts
var ExtHostRelatedInformation = class {
  constructor(mainContext) {
    this._relatedInformationProviders = /* @__PURE__ */ new Map();
    this._nextHandle = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadAiRelatedInformation);
  }
  async $provideAiRelatedInformation(handle, query, token) {
    if (this._relatedInformationProviders.size === 0) {
      throw new Error("No related information providers registered");
    }
    const provider = this._relatedInformationProviders.get(handle);
    if (!provider) {
      throw new Error("related information provider not found");
    }
    const result = await provider.provideRelatedInformation(query, token) ?? [];
    return result;
  }
  getRelatedInformation(extension, query, types) {
    return this._proxy.$getAiRelatedInformation(query, types);
  }
  registerRelatedInformationProvider(extension, type, provider) {
    const handle = this._nextHandle;
    this._nextHandle++;
    this._relatedInformationProviders.set(handle, provider);
    this._proxy.$registerAiRelatedInformationProvider(handle, type);
    return new Disposable3(() => {
      this._proxy.$unregisterAiRelatedInformationProvider(handle);
      this._relatedInformationProviders.delete(handle);
    });
  }
};
export { ExtHostRelatedInformation };
