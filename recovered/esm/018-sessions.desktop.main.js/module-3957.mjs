// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/mcp/electron-browser/mcpGalleryManifestService.ts
import { WorkbenchMcpGalleryManifestService } from "./module-3956.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IRequestService } from "./module-0947.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IMcpGalleryManifestService } from "./module-1195.mjs";


// src/vs/workbench/services/mcp/electron-browser/mcpGalleryManifestService.ts
var McpGalleryManifestService2 = class extends WorkbenchMcpGalleryManifestService {
  constructor(productService, remoteAgentService, requestService, logService, sharedProcessService, configurationService) {
    super(productService, remoteAgentService, requestService, logService, configurationService);
    const channel = sharedProcessService.getChannel("mcpGalleryManifest");
    this.getMcpGalleryManifest().then((manifest) => {
      channel.call("setMcpGalleryManifest", [manifest]);
      this._register(this.onDidChangeMcpGalleryManifest((manifest2) => channel.call("setMcpGalleryManifest", [manifest2])));
    });
  }
};

McpGalleryManifestService2 = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, ILogService),
  __decorateParam(4, ISharedProcessService),
  __decorateParam(5, IConfigurationService)
], McpGalleryManifestService2);

registerSingleton(IMcpGalleryManifestService, McpGalleryManifestService2, 0 /* Eager */);
export { McpGalleryManifestService2 };
