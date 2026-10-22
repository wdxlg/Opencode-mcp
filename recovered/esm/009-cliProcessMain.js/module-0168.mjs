// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/mcp/node/mcpManagementService.ts
import { McpManagementService, McpUserResourceManagementService } from "./module-0167.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAllowedMcpServersService, IMcpGalleryService } from "./module-0163.mjs";
import { IFileService } from "./module-0044.mjs";
import { IUriIdentityService } from "./module-0079.mjs";
import { ILogService } from "./module-0049.mjs";
import { IMcpResourceScannerService } from "./module-0166.mjs";
import { IEnvironmentService } from "./module-0056.mjs";


// src/vs/platform/mcp/node/mcpManagementService.ts
var McpUserResourceManagementService2 = class extends McpUserResourceManagementService {
  constructor(mcpResource, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, allowedMcpServersService, environmentService) {
    super(mcpResource, mcpGalleryService, fileService, uriIdentityService, logService, mcpResourceScannerService, allowedMcpServersService, environmentService);
  }
  async installFromGallery(server, options) {
    this.logService.trace("MCP Management Service: installGallery", server.name, server.galleryUrl);
    this._onInstallMcpServer.fire({ name: server.name, mcpResource: this.mcpResource });
    try {
      const manifest = await this.updateMetadataFromGallery(server);
      const packageType = options?.packageType ?? (manifest.remotes?.length ? "remote" /* REMOTE */ : manifest.packages?.[0]?.registryType ?? "remote" /* REMOTE */);
      const { mcpServerConfiguration, notices } = this.getMcpServerConfigurationFromManifest(manifest, packageType);
      if (notices.length > 0) {
        this.logService.warn(`MCP Management Service: Warnings while installing ${server.name}`, notices);
      }
      const installable = {
        name: server.name,
        config: {
          ...mcpServerConfiguration.config,
          gallery: server.galleryUrl ?? true,
          version: server.version
        },
        inputs: mcpServerConfiguration.inputs
      };
      this.ensureServerAllowed(installable);
      await this.mcpResourceScannerService.addMcpServers([installable], this.mcpResource, this.target);
      await this.updateLocal(server);
      const local = (await this.getInstalled()).find((s) => s.name === server.name);
      if (!local) {
        throw new Error(`Failed to install MCP server: ${server.name}`);
      }
      return local;
    } catch (e) {
      this._onDidInstallMcpServers.fire([{ name: server.name, source: server, error: e, mcpResource: this.mcpResource }]);
      throw e;
    }
  }
};

McpUserResourceManagementService2 = __decorateClass([
  __decorateParam(1, IMcpGalleryService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IMcpResourceScannerService),
  __decorateParam(6, IAllowedMcpServersService),
  __decorateParam(7, IEnvironmentService)
], McpUserResourceManagementService2);

var McpManagementService2 = class extends McpManagementService {
  createMcpResourceManagementService(mcpResource) {
    return this.instantiationService.createInstance(McpUserResourceManagementService2, mcpResource);
  }
};
export { McpUserResourceManagementService2, McpManagementService2 };
