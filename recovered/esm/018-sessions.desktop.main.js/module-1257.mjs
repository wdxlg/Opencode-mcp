// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadEditSessionIdentityParticipant.ts
import { ExtHostContext } from "./module-0922.mjs";
import { localize } from "./module-0001.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0920.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditSessionIdentityService } from "./module-1256.mjs";


// src/vs/workbench/api/browser/mainThreadEditSessionIdentityParticipant.ts
var ExtHostEditSessionIdentityCreateParticipant = class {
  constructor(extHostContext) {
    this.timeout = 2e4;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostWorkspace);
  }
  async participate(workspaceFolder, token) {
    const p = new Promise((resolve3, reject) => {
      setTimeout(
        () => reject(new Error(localize(5680, null))),
        this.timeout
      );
      this._proxy.$onWillCreateEditSessionIdentity(workspaceFolder.uri, token, this.timeout).then(resolve3, reject);
    });
    return raceCancellationError(p, token);
  }
};

var EditSessionIdentityCreateParticipant = class {
  constructor(extHostContext, instantiationService, _editSessionIdentityService) {
    this._editSessionIdentityService = _editSessionIdentityService;
    this._saveParticipantDisposable = this._editSessionIdentityService.addEditSessionIdentityCreateParticipant(instantiationService.createInstance(ExtHostEditSessionIdentityCreateParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};

EditSessionIdentityCreateParticipant = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IEditSessionIdentityService)
], EditSessionIdentityCreateParticipant);
export { ExtHostEditSessionIdentityCreateParticipant, EditSessionIdentityCreateParticipant };
