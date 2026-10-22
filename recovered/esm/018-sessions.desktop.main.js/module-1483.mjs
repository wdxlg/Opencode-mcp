// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadMeteredConnection.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IMeteredConnectionService } from "./module-1022.mjs";


// src/vs/workbench/api/browser/mainThreadMeteredConnection.ts
var MainThreadMeteredConnection = class extends Disposable {
  constructor(extHostContext, meteredConnectionService) {
    super();
    this.meteredConnectionService = meteredConnectionService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostMeteredConnection);
    this._proxy.$initializeIsConnectionMetered(this.meteredConnectionService.isConnectionMetered);
    this._register(this.meteredConnectionService.onDidChangeIsConnectionMetered((isMetered) => {
      this._proxy.$onDidChangeIsConnectionMetered(isMetered);
    }));
  }
};

MainThreadMeteredConnection = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadMeteredConnection),
  __decorateParam(1, IMeteredConnectionService)
], MainThreadMeteredConnection);
export { MainThreadMeteredConnection };
