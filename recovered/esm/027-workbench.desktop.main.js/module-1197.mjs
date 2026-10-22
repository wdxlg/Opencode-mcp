// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/mcp/common/mcpResourceScannerService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { parse5 } from "./module-0883.mjs";
import { getParseErrorMessage } from "./module-0888.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { assertNever } from "./module-0009.mjs";
import { ConfigurationTargetToString } from "./module-0132.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { Queue } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/mcp/common/mcpResourceScannerService.ts
var IMcpResourceScannerService = createDecorator("IMcpResourceScannerService");

var McpResourceScannerService = class extends Disposable {
  constructor(fileService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.resourcesAccessQueueMap = new ResourceMap();
  }
  async scanMcpServers(mcpResource, target) {
    return this.withProfileMcpServers(mcpResource, target);
  }
  async addMcpServers(servers, mcpResource, target) {
    await this.withProfileMcpServers(mcpResource, target, (scannedMcpServers) => {
      let updatedInputs = scannedMcpServers.inputs ?? [];
      const existingServers = scannedMcpServers.servers ?? {};
      for (const { name, config, inputs } of servers) {
        existingServers[name] = config;
        if (inputs) {
          const existingInputIds = new Set(updatedInputs.map((input) => input.id));
          const newInputs = inputs.filter((input) => !existingInputIds.has(input.id));
          updatedInputs = [...updatedInputs, ...newInputs];
        }
      }
      return { servers: existingServers, inputs: updatedInputs, sandbox: scannedMcpServers.sandbox };
    });
  }
  async updateSandboxConfig(updateFn, mcpResource, target) {
    await this.withProfileMcpServers(mcpResource, target, updateFn);
  }
  async removeMcpServers(serverNames, mcpResource, target) {
    await this.withProfileMcpServers(mcpResource, target, (scannedMcpServers) => {
      for (const serverName of serverNames) {
        if (scannedMcpServers.servers?.[serverName]) {
          delete scannedMcpServers.servers[serverName];
        }
      }
      return scannedMcpServers;
    });
  }
  async withProfileMcpServers(mcpResource, target, updateFn) {
    return this.getResourceAccessQueue(mcpResource).queue(async () => {
      target = target ?? 2 /* USER */;
      let scannedMcpServers = {};
      try {
        const content2 = await this.fileService.readFile(mcpResource);
        const errors = [];
        const result = parse5(content2.value.toString(), errors, { allowTrailingComma: true, allowEmptyContent: true }) || {};
        if (errors.length > 0) {
          throw new Error("Failed to parse scanned MCP servers: " + errors.map((e) => `[${e.offset}, ${e.length}] ${getParseErrorMessage(e.error)}`).join(", "));
        }
        if (target === 2 /* USER */) {
          scannedMcpServers = this.fromUserMcpServers(result);
        } else if (target === 6 /* WORKSPACE_FOLDER */) {
          scannedMcpServers = this.fromWorkspaceFolderMcpServers(result);
        } else if (target === 5 /* WORKSPACE */) {
          const workspaceScannedMcpServers = result;
          if (workspaceScannedMcpServers.settings?.mcp) {
            scannedMcpServers = this.fromWorkspaceFolderMcpServers(workspaceScannedMcpServers.settings?.mcp);
          }
        }
      } catch (error) {
        if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
          throw error;
        }
      }
      if (updateFn) {
        scannedMcpServers = updateFn(scannedMcpServers ?? {});
        if (target === 2 /* USER */) {
          await this.writeScannedMcpServers(mcpResource, scannedMcpServers);
        } else if (target === 6 /* WORKSPACE_FOLDER */) {
          await this.writeScannedMcpServersToWorkspaceFolder(mcpResource, scannedMcpServers);
        } else if (target === 5 /* WORKSPACE */) {
          await this.writeScannedMcpServersToWorkspace(mcpResource, scannedMcpServers);
        } else {
          assertNever(target, `Invalid Target: ${ConfigurationTargetToString(target)}`);
        }
      }
      return scannedMcpServers;
    });
  }
  async writeScannedMcpServers(mcpResource, scannedMcpServers) {
    if (scannedMcpServers.servers && Object.keys(scannedMcpServers.servers).length > 0 || scannedMcpServers.inputs && scannedMcpServers.inputs.length > 0 || scannedMcpServers.sandbox !== void 0) {
      await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedMcpServers, null, "	")));
    } else {
      await this.fileService.del(mcpResource);
    }
  }
  async writeScannedMcpServersToWorkspaceFolder(mcpResource, scannedMcpServers) {
    await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedMcpServers, null, "	")));
  }
  async writeScannedMcpServersToWorkspace(mcpResource, scannedMcpServers) {
    let scannedWorkspaceMcpServers;
    try {
      const content2 = await this.fileService.readFile(mcpResource);
      const errors = [];
      scannedWorkspaceMcpServers = parse5(content2.value.toString(), errors, { allowTrailingComma: true, allowEmptyContent: true });
      if (errors.length > 0) {
        throw new Error("Failed to parse scanned MCP servers: " + errors.map((e) => `[${e.offset}, ${e.length}] ${getParseErrorMessage(e.error)}`).join(", "));
      }
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        throw error;
      }
      scannedWorkspaceMcpServers = { settings: {} };
    }
    if (!scannedWorkspaceMcpServers.settings) {
      scannedWorkspaceMcpServers.settings = {};
    }
    scannedWorkspaceMcpServers.settings.mcp = scannedMcpServers;
    await this.fileService.writeFile(mcpResource, VSBuffer.fromString(JSON.stringify(scannedWorkspaceMcpServers, null, "	")));
  }
  fromUserMcpServers(scannedMcpServers) {
    const userMcpServers = {
      inputs: scannedMcpServers.inputs,
      sandbox: scannedMcpServers.sandbox
    };
    const servers = Object.entries(scannedMcpServers.servers ?? {});
    if (servers.length > 0) {
      userMcpServers.servers = {};
      for (const [serverName, server] of servers) {
        userMcpServers.servers[serverName] = this.sanitizeServer(server);
      }
    }
    return userMcpServers;
  }
  fromWorkspaceFolderMcpServers(scannedWorkspaceFolderMcpServers) {
    const scannedMcpServers = {
      inputs: scannedWorkspaceFolderMcpServers.inputs,
      sandbox: scannedWorkspaceFolderMcpServers.sandbox
    };
    const servers = Object.entries(scannedWorkspaceFolderMcpServers.servers ?? {});
    if (servers.length > 0) {
      scannedMcpServers.servers = {};
      for (const [serverName, config] of servers) {
        const serverConfig = this.sanitizeServer(config);
        scannedMcpServers.servers[serverName] = serverConfig;
      }
    }
    return scannedMcpServers;
  }
  sanitizeServer(serverOrConfig) {
    let server;
    if (serverOrConfig.config) {
      const oldScannedMcpServer = serverOrConfig;
      server = {
        ...oldScannedMcpServer.config,
        version: oldScannedMcpServer.version,
        gallery: oldScannedMcpServer.gallery
      };
    } else {
      server = serverOrConfig;
    }
    if (server.type === void 0 || server.type !== "http" /* REMOTE */ && server.type !== "stdio" /* LOCAL */) {
      server.type = server.command ? "stdio" /* LOCAL */ : "http" /* REMOTE */;
    }
    return server;
  }
  getResourceAccessQueue(file) {
    let resourceQueue = this.resourcesAccessQueueMap.get(file);
    if (!resourceQueue) {
      resourceQueue = new Queue();
      this.resourcesAccessQueueMap.set(file, resourceQueue);
    }
    return resourceQueue;
  }
};

McpResourceScannerService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUriIdentityService)
], McpResourceScannerService);

registerSingleton(IMcpResourceScannerService, McpResourceScannerService, 1 /* Delayed */);
export { IMcpResourceScannerService, McpResourceScannerService };
