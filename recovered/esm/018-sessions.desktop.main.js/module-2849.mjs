// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/workspaceMcpDiscoveryAdapter.ts
import { FilesystemMcpDiscovery } from "./module-2847.mjs";
import { DisposableMap } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX, McpServerTrust } from "./module-1206.mjs";
import { observableValue } from "./module-0048.mjs";
import { URI } from "./module-0032.mjs";
import { claudeConfigToServerDefinition } from "./module-2846.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/workspaceMcpDiscoveryAdapter.ts
var CursorWorkspaceMcpDiscoveryAdapter = class extends FilesystemMcpDiscovery {
  constructor(fileService, _workspaceContextService, mcpRegistry, configurationService, _remoteAgentService) {
    super(configurationService, fileService, mcpRegistry);
    this._workspaceContextService = _workspaceContextService;
    this._remoteAgentService = _remoteAgentService;
    this._collections = this._register(new DisposableMap());
  }
  start() {
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders((e4) => {
      for (const removed of e4.removed) {
        this._collections.deleteAndDispose(removed.uri.toString());
      }
      for (const added of e4.added) {
        this.watchFolder(added);
      }
    }));
    for (const folder of this._workspaceContextService.getWorkspace().folders) {
      this.watchFolder(folder);
    }
  }
  watchFolder(folder) {
    const configFile = joinPath(folder.uri, ".cursor", "mcp.json");
    const collection = {
      id: `${CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX}${folder.index}`,
      provenance: "externalConfiguration" /* ExternalConfiguration */,
      discoverySource: "cursor-workspace" /* CursorWorkspace */,
      label: `${folder.name}/.cursor/mcp.json`,
      remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority || null,
      scope: 1 /* WORKSPACE */,
      trustBehavior: McpServerTrust.Kind.TrustedOnNonce,
      serverDefinitions: observableValue(this, []),
      configTarget: 6 /* WORKSPACE_FOLDER */,
      order: 0 /* WorkspaceFolder */ + 1,
      presentation: {
        origin: configFile
      }
    };
    this._collections.set(folder.uri.toString(), this.watchFile(
      URI.joinPath(folder.uri, ".cursor", "mcp.json"),
      collection,
      "cursor-workspace" /* CursorWorkspace */,
      async (contents) => {
        const defs = await claudeConfigToServerDefinition(collection.id, contents, { defaultCwd: folder.uri });
        defs?.forEach((d) => d.roots = [folder.uri]);
        return defs;
      }
    ));
  }
};

CursorWorkspaceMcpDiscoveryAdapter = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IMcpRegistry),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IRemoteAgentService)
], CursorWorkspaceMcpDiscoveryAdapter);
export { CursorWorkspaceMcpDiscoveryAdapter };
