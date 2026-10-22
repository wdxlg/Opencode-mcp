// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadAiRelatedInformation.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IAiRelatedInformationService } from "./module-1441.mjs";


// src/vs/workbench/api/browser/mainThreadAiRelatedInformation.ts
var MainThreadAiRelatedInformation = class extends Disposable {
  constructor(context2, _aiRelatedInformationService) {
    super();
    this._aiRelatedInformationService = _aiRelatedInformationService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context2.getProxy(ExtHostContext.ExtHostAiRelatedInformation);
  }
  $getAiRelatedInformation(query, types) {
    return this._aiRelatedInformationService.getRelatedInformation(query, types, CancellationToken.None);
  }
  $registerAiRelatedInformationProvider(handle2, type) {
    const provider = {
      provideAiRelatedInformation: (query, token) => {
        return this._proxy.$provideAiRelatedInformation(handle2, query, token);
      }
    };
    this._registrations.set(handle2, this._aiRelatedInformationService.registerAiRelatedInformationProvider(type, provider));
  }
  $unregisterAiRelatedInformationProvider(handle2) {
    this._registrations.deleteAndDispose(handle2);
  }
};

MainThreadAiRelatedInformation = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAiRelatedInformation),
  __decorateParam(1, IAiRelatedInformationService)
], MainThreadAiRelatedInformation);
export { MainThreadAiRelatedInformation };
