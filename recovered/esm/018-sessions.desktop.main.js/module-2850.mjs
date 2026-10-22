// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/workspaceDotMcpDiscovery.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { McpServerTrust, WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX } from "./module-1206.mjs";
import { observableValue } from "./module-0048.mjs";
import { claudeConfigToServerDefinition } from "./module-2846.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/workspaceDotMcpDiscovery.ts
var WorkspaceDotMcpDiscovery = class extends Disposable {
  constructor(_fileService, _workspaceContextService, _mcpRegistry, _remoteAgentService) {
    super();
    this._fileService = _fileService;
    this._workspaceContextService = _workspaceContextService;
    this._mcpRegistry = _mcpRegistry;
    this._remoteAgentService = _remoteAgentService;
    this.fromGallery = false;
    this._collections = this._register(new DisposableMap());
  }
  start() {
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders((e4) => {
      for (const removed of e4.removed) {
        this._collections.deleteAndDispose(removed.uri.toString());
      }
      for (const added of e4.added) {
        this._watchFolder(added);
      }
    }));
    for (const folder of this._workspaceContextService.getWorkspace().folders) {
      this._watchFolder(folder);
    }
  }
  _watchFolder(folder) {
    const configFile = joinPath(folder.uri, ".mcp.json");
    const collectionId = `${WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX}${folder.index}`;
    const serverDefinitions = observableValue(this, []);
    const collection = {
      id: collectionId,
      provenance: "workspaceDotMcp" /* WorkspaceDotMcp */,
      label: `${folder.name}/.mcp.json`,
      remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority || null,
      scope: 1 /* WORKSPACE */,
      trustBehavior: McpServerTrust.Kind.TrustedOnNonce,
      serverDefinitions,
      configTarget: 6 /* WORKSPACE_FOLDER */,
      order: 0 /* WorkspaceFolder */ + 1,
      presentation: {
        origin: configFile
      }
    };
    const store = new DisposableStore();
    const collectionRegistration = store.add(new MutableDisposable());
    const updateFile = async () => {
      let definitions3 = [];
      try {
        const contents = await this._fileService.readFile(configFile);
        const defs = await claudeConfigToServerDefinition(collectionId, contents.value, { defaultCwd: folder.uri });
        if (defs) {
          for (const d of defs) {
            d.roots = [folder.uri];
          }
          definitions3 = defs;
        }
      } catch {
      }
      if (!definitions3.length) {
        collectionRegistration.clear();
      } else {
        serverDefinitions.set(definitions3, void 0);
        if (!collectionRegistration.value) {
          collectionRegistration.value = this._mcpRegistry.registerCollection(collection);
        }
      }
    };
    const throttler = store.add(new RunOnceScheduler(updateFile, 500));
    const watcher = store.add(this._fileService.createWatcher(configFile, { recursive: false, excludes: [] }));
    store.add(watcher.onDidChange(() => throttler.schedule()));
    updateFile();
    this._collections.set(folder.uri.toString(), store);
  }
};

WorkspaceDotMcpDiscovery = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IMcpRegistry),
  __decorateParam(3, IRemoteAgentService)
], WorkspaceDotMcpDiscovery);
export { WorkspaceDotMcpDiscovery };
