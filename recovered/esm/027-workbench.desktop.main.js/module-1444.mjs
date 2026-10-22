// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadAiEmbeddingVector.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IAiEmbeddingVectorService } from "./module-1443.mjs";


// src/vs/workbench/api/browser/mainThreadAiEmbeddingVector.ts
var MainThreadAiEmbeddingVector = class extends Disposable {
  constructor(context2, _AiEmbeddingVectorService) {
    super();
    this._AiEmbeddingVectorService = _AiEmbeddingVectorService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context2.getProxy(ExtHostContext.ExtHostAiEmbeddingVector);
  }
  $registerAiEmbeddingVectorProvider(model, handle2) {
    const provider = {
      provideAiEmbeddingVector: (strings, token) => {
        return this._proxy.$provideAiEmbeddingVector(
          handle2,
          strings,
          token
        );
      }
    };
    this._registrations.set(handle2, this._AiEmbeddingVectorService.registerAiEmbeddingVectorProvider(model, provider));
  }
  $unregisterAiEmbeddingVectorProvider(handle2) {
    this._registrations.deleteAndDispose(handle2);
  }
};

MainThreadAiEmbeddingVector = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAiEmbeddingVector),
  __decorateParam(1, IAiEmbeddingVectorService)
], MainThreadAiEmbeddingVector);
export { MainThreadAiEmbeddingVector };
