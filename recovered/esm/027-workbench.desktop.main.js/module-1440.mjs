// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadProfileContentHandlers.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { revive } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IUserDataProfileImportExportService } from "./module-0997.mjs";


// src/vs/workbench/api/browser/mainThreadProfileContentHandlers.ts
var MainThreadProfileContentHandlers = class extends Disposable {
  constructor(context2, userDataProfileImportExportService) {
    super();
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.registeredHandlers = this._register(new DisposableMap());
    this.proxy = context2.getProxy(ExtHostContext.ExtHostProfileContentHandlers);
  }
  async $registerProfileContentHandler(id2, name, description, extensionId) {
    this.registeredHandlers.set(id2, this.userDataProfileImportExportService.registerProfileContentHandler(id2, {
      name,
      description,
      extensionId,
      saveProfile: async (name2, content2, token) => {
        const result = await this.proxy.$saveProfile(id2, name2, content2, token);
        return result ? revive(result) : null;
      },
      readProfile: async (uri5, token) => {
        return this.proxy.$readProfile(id2, uri5, token);
      }
    }));
  }
  async $unregisterProfileContentHandler(id2) {
    this.registeredHandlers.deleteAndDispose(id2);
  }
};

MainThreadProfileContentHandlers = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadProfileContentHandlers),
  __decorateParam(1, IUserDataProfileImportExportService)
], MainThreadProfileContentHandlers);
export { MainThreadProfileContentHandlers };
