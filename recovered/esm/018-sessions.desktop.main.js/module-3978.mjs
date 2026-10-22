// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/electron-browser/extensionManagementServerService.ts
import { Disposable } from "./module-0012.mjs";
import { NativeExtensionManagementService } from "./module-3977.mjs";
import { localize } from "./module-0001.mjs";
import { NativeRemoteExtensionManagementService } from "./module-3976.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IExtensionManagementServerService } from "./module-1047.mjs";


// src/vs/workbench/services/extensionManagement/electron-browser/extensionManagementServerService.ts
var ExtensionManagementServerService = class extends Disposable {
  constructor(sharedProcessService, remoteAgentService, labelService, instantiationService) {
    super();
    this.remoteExtensionManagementServer = null;
    this.webExtensionManagementServer = null;
    const localExtensionManagementService = this._register(instantiationService.createInstance(NativeExtensionManagementService, sharedProcessService.getChannel("extensions")));
    this.localExtensionManagementServer = { extensionManagementService: localExtensionManagementService, id: "local", label: localize(23005, null) };
    const remoteAgentConnection = remoteAgentService.getConnection();
    if (remoteAgentConnection) {
      const extensionManagementService = instantiationService.createInstance(NativeRemoteExtensionManagementService, remoteAgentConnection.getChannel("extensions"), this.localExtensionManagementServer);
      this.remoteExtensionManagementServer = {
        id: "remote",
        extensionManagementService,
        get label() {
          return labelService.getHostLabel(Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || localize(23006, null);
        }
      };
    }
  }
  getExtensionManagementServer(extension) {
    if (extension.location.scheme === Schemas.file) {
      return this.localExtensionManagementServer;
    }
    if (this.remoteExtensionManagementServer && extension.location.scheme === Schemas.vscodeRemote) {
      return this.remoteExtensionManagementServer;
    }
    throw new Error(`Invalid Extension ${extension.location}`);
  }
  getExtensionInstallLocation(extension) {
    const server = this.getExtensionManagementServer(extension);
    return server === this.remoteExtensionManagementServer ? 2 /* Remote */ : 1 /* Local */;
  }
};

ExtensionManagementServerService = __decorateClass([
  __decorateParam(0, ISharedProcessService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IInstantiationService)
], ExtensionManagementServerService);

registerSingleton(IExtensionManagementServerService, ExtensionManagementServerService, 1 /* Delayed */);
export { ExtensionManagementServerService };
