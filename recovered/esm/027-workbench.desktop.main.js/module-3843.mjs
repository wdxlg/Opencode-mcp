// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/mcp/browser/mcpGalleryManifestService.ts
import { McpGalleryManifestService } from "./module-3842.mjs";
import { Emitter } from "./module-0017.mjs";
import { mcpGalleryServiceUrlConfig } from "./module-1196.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IRequestService } from "./module-0946.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/services/mcp/browser/mcpGalleryManifestService.ts
var WorkbenchMcpGalleryManifestService = class extends McpGalleryManifestService {
  constructor(productService, remoteAgentService, requestService, logService, configurationService) {
    super(productService, requestService, logService);
    this.configurationService = configurationService;
    this.mcpGalleryManifest = null;
    this._onDidChangeMcpGalleryManifest = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifest = this._onDidChangeMcpGalleryManifest.event;
    this.currentStatus = "unavailable" /* Unavailable */;
    this._onDidChangeMcpGalleryManifestStatus = this._register(new Emitter());
    this.onDidChangeMcpGalleryManifestStatus = this._onDidChangeMcpGalleryManifestStatus.event;
    const remoteConnection = remoteAgentService.getConnection();
    if (remoteConnection) {
      const channel = remoteConnection.getChannel("mcpGalleryManifest");
      this.getMcpGalleryManifest().then((manifest) => {
        channel.call("setMcpGalleryManifest", [manifest]);
        this._register(this.onDidChangeMcpGalleryManifest((manifest2) => channel.call("setMcpGalleryManifest", [manifest2])));
      });
    }
  }
  get mcpGalleryManifestStatus() {
    return this.currentStatus;
  }
  async getMcpGalleryManifest() {
    if (!this.initPromise) {
      this.initPromise = this.doGetMcpGalleryManifest();
    }
    await this.initPromise;
    return this.mcpGalleryManifest;
  }
  async doGetMcpGalleryManifest() {
    await this.getAndUpdateMcpGalleryManifest();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpGalleryServiceUrlConfig) || e.affectsConfiguration("chat.mcp.gallery.version")) {
        this.getAndUpdateMcpGalleryManifest();
      }
    }));
  }
  async getAndUpdateMcpGalleryManifest() {
    const mcpGalleryConfig = this.configurationService.getValue("chat.mcp.gallery");
    if (mcpGalleryConfig?.serviceUrl) {
      this.update(await this.createMcpGalleryManifest(mcpGalleryConfig.serviceUrl, mcpGalleryConfig.version));
    } else {
      this.update(await super.getMcpGalleryManifest());
    }
  }
  update(manifest) {
    if (this.mcpGalleryManifest?.url === manifest?.url && this.mcpGalleryManifest?.version === manifest?.version) {
      return;
    }
    this.mcpGalleryManifest = manifest;
    if (this.mcpGalleryManifest) {
      this.logService.trace("MCP Registry configured:", this.mcpGalleryManifest.url);
    } else {
      this.logService.trace("No MCP Registry configured");
    }
    this.currentStatus = this.mcpGalleryManifest ? "available" /* Available */ : "unavailable" /* Unavailable */;
    this._onDidChangeMcpGalleryManifest.fire(this.mcpGalleryManifest);
    this._onDidChangeMcpGalleryManifestStatus.fire(this.currentStatus);
  }
};

WorkbenchMcpGalleryManifestService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IConfigurationService)
], WorkbenchMcpGalleryManifestService);
export { WorkbenchMcpGalleryManifestService };
