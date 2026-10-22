// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadRemoteConnectionData.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0920.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";


// src/vs/workbench/api/browser/mainThreadRemoteConnectionData.ts
var MainThreadRemoteConnectionData = class extends Disposable {
  constructor(extHostContext, _environmentService, remoteAuthorityResolverService) {
    super();
    this._environmentService = _environmentService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostExtensionService);
    const remoteAuthority = this._environmentService.remoteAuthority;
    if (remoteAuthority) {
      this._register(remoteAuthorityResolverService.onDidChangeConnectionData(() => {
        const connectionData = remoteAuthorityResolverService.getConnectionData(remoteAuthority);
        if (connectionData) {
          this._proxy.$updateRemoteConnectionData(connectionData);
        }
      }));
    }
  }
};

MainThreadRemoteConnectionData = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IRemoteAuthorityResolverService)
], MainThreadRemoteConnectionData);
export { MainThreadRemoteConnectionData };
