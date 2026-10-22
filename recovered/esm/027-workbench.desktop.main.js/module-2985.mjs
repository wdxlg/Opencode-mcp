// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpGatewayToolBrokerChannel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { McpServer } from "./module-2334.mjs";
import { startServerAndWaitForLiveTools } from "./module-2199.mjs";


// src/vs/workbench/contrib/mcp/common/mcpGatewayToolBrokerChannel.ts
var McpGatewayToolBrokerChannel = class extends Disposable {
  constructor(_mcpService, _logService, _startupGracePeriodMs = 5e3) {
    super();
    this._mcpService = _mcpService;
    this._logService = _logService;
    this._startupGracePeriodMs = _startupGracePeriodMs;
    this._onDidChangeTools = this._register(new Emitter());
    this._onDidChangeResources = this._register(new Emitter());
    this._onDidChangeServers = this._register(new Emitter());
    /**
     * Per-server promise that races server startup against the grace period timeout.
     * Once set for a server, subsequent list calls await the already-resolved promise
     * and return immediately instead of waiting again.
     *
     * The `resolved` flag tracks whether the promise has settled. If a server's
     * cacheState regresses to Unknown/Outdated after the promise resolved (e.g.
     * after a cache reset), `_waitForStartup` discards the stale entry and creates
     * a fresh race so the server gets another chance to start.
     */
    this._startupGrace = /* @__PURE__ */ new Map();
    this._logService.debug("[McpGateway][ToolBroker] Initialized");
    let toolsInitialized = false;
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.tools.read(reader);
      }
      if (toolsInitialized) {
        this._logService.debug("[McpGateway][ToolBroker] Tools changed, firing onDidChangeTools");
        this._onDidChangeTools.fire();
      } else {
        toolsInitialized = true;
      }
    }));
    let resourcesInitialized = false;
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.capabilities.read(reader);
      }
      if (resourcesInitialized) {
        this._logService.debug("[McpGateway][ToolBroker] Resources changed, firing onDidChangeResources");
        this._onDidChangeResources.fire();
      } else {
        resourcesInitialized = true;
      }
    }));
    let serversInitialized = false;
    this._register(autorun((reader) => {
      const servers = this._mcpService.servers.read(reader);
      if (serversInitialized) {
        this._logService.debug("[McpGateway][ToolBroker] Servers changed, firing onDidChangeServers");
        this._onDidChangeServers.fire(servers.map((s) => ({ id: s.definition.id, label: s.definition.label })));
      } else {
        serversInitialized = true;
      }
    }));
  }
  _getServerById(serverId) {
    for (const server of this._mcpService.servers.get()) {
      if (server.definition.id === serverId) {
        return server;
      }
    }
    return void 0;
  }
  _waitForStartup(server) {
    const id2 = server.definition.id;
    const existing = this._startupGrace.get(id2);
    if (existing?.resolved) {
      const state = server.cacheState.get();
      if (state === 0 /* Unknown */ || state === 2 /* Outdated */) {
        this._startupGrace.delete(id2);
      }
    }
    if (!this._startupGrace.has(id2)) {
      const entry = {
        promise: Promise.race([
          this._ensureServerReady(server),
          new Promise((resolve3) => setTimeout(() => resolve3(false), this._startupGracePeriodMs))
        ]),
        resolved: false
      };
      entry.promise.then(() => {
        entry.resolved = true;
      });
      this._startupGrace.set(id2, entry);
    }
    return this._startupGrace.get(id2).promise;
  }
  async _shouldUseCachedData(server) {
    const cacheState = server.cacheState.get();
    if (cacheState === 0 /* Unknown */ || cacheState === 2 /* Outdated */) {
      await this._waitForStartup(server);
      const newState = server.cacheState.get();
      return newState === 5 /* Live */ || newState === 1 /* Cached */ || newState === 4 /* RefreshingFromCached */;
    }
    return cacheState === 5 /* Live */ || cacheState === 1 /* Cached */ || cacheState === 4 /* RefreshingFromCached */;
  }
  listen(_ctx, event) {
    switch (event) {
      case "onDidChangeTools":
        return this._onDidChangeTools.event;
      case "onDidChangeResources":
        return this._onDidChangeResources.event;
      case "onDidChangeServers":
        return this._onDidChangeServers.event;
    }
    throw new Error(`Invalid listen: ${event}`);
  }
  async call(_ctx, command4, arg, cancellationToken) {
    this._logService.debug(`[McpGateway][ToolBroker] IPC call: ${command4}`);
    switch (command4) {
      case "listServers": {
        const servers = this._listServers();
        return servers;
      }
      case "listToolsForServer": {
        const { serverId } = arg;
        const tools = await this._listToolsForServer(serverId);
        return tools;
      }
      case "callToolForServer": {
        const { serverId, name, args: args2, chatSessionResource } = arg;
        const result = await this._callToolForServer(serverId, name, args2 || {}, chatSessionResource, cancellationToken);
        return result;
      }
      case "listResourcesForServer": {
        const { serverId } = arg;
        const resources = await this._listResourcesForServer(serverId);
        return resources;
      }
      case "readResourceForServer": {
        const { serverId, uri: uri5 } = arg;
        const result = await this._readResourceForServer(serverId, uri5, cancellationToken);
        return result;
      }
      case "listResourceTemplatesForServer": {
        const { serverId } = arg;
        const templates = await this._listResourceTemplatesForServer(serverId);
        return templates;
      }
    }
    throw new Error(`Invalid call: ${command4}`);
  }
  _listServers() {
    const servers = this._mcpService.servers.get();
    const result = [];
    for (const server of servers) {
      result.push({ id: server.definition.id, label: server.definition.label });
    }
    this._logService.debug(`[McpGateway][ToolBroker] listServers result: ${result.length} server(s): [${result.map((s) => s.label).join(", ")}]`);
    return result;
  }
  async _listToolsForServer(serverId) {
    const server = this._getServerById(serverId);
    if (!server) {
      this._logService.warn(`[McpGateway][ToolBroker] listToolsForServer: unknown server '${serverId}'`);
      return [];
    }
    if (!await this._shouldUseCachedData(server)) {
      this._logService.debug(`[McpGateway][ToolBroker] Server '${serverId}' not ready, skipping tool listing`);
      return [];
    }
    const tools = server.tools.get().filter((t2) => t2.visibility & 1 /* Model */).map((t2) => t2.definition);
    this._logService.debug(`[McpGateway][ToolBroker] listToolsForServer '${serverId}': ${tools.length} tool(s)`);
    return tools;
  }
  async _callToolForServer(serverId, name, args2, chatSessionResource, token = CancellationToken.None) {
    this._logService.debug(`[McpGateway][ToolBroker] callToolForServer '${serverId}' tool '${name}' with args: ${JSON.stringify(args2)}`);
    const server = this._getServerById(serverId);
    if (!server) {
      throw new Error(`Unknown server: ${serverId}`);
    }
    const tool = server.tools.get().find(
      (t2) => t2.definition.name === name && t2.visibility & 1 /* Model */
    );
    if (!tool) {
      throw new Error(`Unknown tool '${name}' on server '${serverId}'`);
    }
    const context2 = chatSessionResource ? { chatSessionResource: URI.parse(chatSessionResource) } : void 0;
    const result = await tool.call(args2, context2, token);
    this._logService.debug(`[McpGateway][ToolBroker] Tool '${name}' on '${serverId}' completed (isError=${result.isError ?? false}, content blocks=${result.content.length})`);
    return result;
  }
  async _listResourcesForServer(serverId) {
    const server = this._getServerById(serverId);
    if (!server) {
      this._logService.warn(`[McpGateway][ToolBroker] listResourcesForServer: unknown server '${serverId}'`);
      return [];
    }
    if (!await this._shouldUseCachedData(server)) {
      return [];
    }
    const capabilities = server.capabilities.get();
    if (!capabilities || !(capabilities & 16 /* Resources */)) {
      this._logService.debug(`[McpGateway][ToolBroker] Server '${serverId}' has no resource capability`);
      return [];
    }
    try {
      const resources = await McpServer.callOn(server, (h3) => h3.listResources());
      this._logService.debug(`[McpGateway][ToolBroker] Server '${serverId}' listed ${resources.length} resource(s)`);
      return resources;
    } catch (error) {
      this._logService.warn(`[McpGateway][ToolBroker] Server '${serverId}' failed to list resources`, error);
      return [];
    }
  }
  async _readResourceForServer(serverId, uri5, token = CancellationToken.None) {
    const server = this._getServerById(serverId);
    if (!server) {
      throw new Error(`Unknown server: ${serverId}`);
    }
    this._logService.debug(`[McpGateway][ToolBroker] readResourceForServer '${uri5}' from server '${serverId}'`);
    const result = await McpServer.callOn(server, (h3) => h3.readResource({ uri: uri5 }, token), token);
    this._logService.debug(`[McpGateway][ToolBroker] readResourceForServer returned ${result.contents.length} content(s)`);
    return result;
  }
  async _listResourceTemplatesForServer(serverId) {
    const server = this._getServerById(serverId);
    if (!server) {
      this._logService.warn(`[McpGateway][ToolBroker] listResourceTemplatesForServer: unknown server '${serverId}'`);
      return [];
    }
    if (!await this._shouldUseCachedData(server)) {
      return [];
    }
    const capabilities = server.capabilities.get();
    if (!capabilities || !(capabilities & 16 /* Resources */)) {
      return [];
    }
    try {
      const resourceTemplates = await McpServer.callOn(server, (h3) => h3.listResourceTemplates());
      this._logService.debug(`[McpGateway][ToolBroker] Server '${serverId}' listed ${resourceTemplates.length} resource template(s)`);
      return resourceTemplates;
    } catch (error) {
      this._logService.warn(`[McpGateway][ToolBroker] Server '${serverId}' failed to list resource templates`, error);
      return [];
    }
  }
  async _ensureServerReady(server) {
    const cacheState = server.cacheState.get();
    if (cacheState !== 0 /* Unknown */ && cacheState !== 2 /* Outdated */) {
      return true;
    }
    this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' not ready (cacheState=${cacheState}), starting...`);
    try {
      const ready = await startServerAndWaitForLiveTools(server, {
        promptType: "all-untrusted",
        errorOnUserInteraction: true
      });
      this._logService.debug(`[McpGateway][ToolBroker] Server '${server.definition.id}' ready=${ready}`);
      return ready;
    } catch (error) {
      this._logService.warn(`[McpGateway][ToolBroker] Server '${server.definition.id}' failed to start`, error);
      return false;
    }
  }
};
export { McpGatewayToolBrokerChannel };
