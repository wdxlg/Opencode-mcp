// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostEmbeddingVector.ts
import { MainContext } from "./module-0054.mjs";
import { Disposable3 } from "./module-0244.mjs";


// src/vs/workbench/api/common/extHostEmbeddingVector.ts
var ExtHostAiEmbeddingVector = class {
  constructor(mainContext) {
    this._AiEmbeddingVectorProviders = /* @__PURE__ */ new Map();
    this._nextHandle = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadAiEmbeddingVector);
  }
  async $provideAiEmbeddingVector(handle, strings, token) {
    if (this._AiEmbeddingVectorProviders.size === 0) {
      throw new Error("No embedding vector providers registered");
    }
    const provider = this._AiEmbeddingVectorProviders.get(handle);
    if (!provider) {
      throw new Error("Embedding vector provider not found");
    }
    const result = await provider.provideEmbeddingVector(strings, token);
    if (!result) {
      throw new Error("Embedding vector provider returned undefined");
    }
    return result;
  }
  registerEmbeddingVectorProvider(extension, model, provider) {
    const handle = this._nextHandle;
    this._nextHandle++;
    this._AiEmbeddingVectorProviders.set(handle, provider);
    this._proxy.$registerAiEmbeddingVectorProvider(model, handle);
    return new Disposable3(() => {
      this._proxy.$unregisterAiEmbeddingVectorProvider(handle);
      this._AiEmbeddingVectorProviders.delete(handle);
    });
  }
};
export { ExtHostAiEmbeddingVector };
