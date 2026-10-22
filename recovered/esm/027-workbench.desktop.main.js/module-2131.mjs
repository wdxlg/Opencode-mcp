// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostCustomizationService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableResourceMap, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { getEffectiveAgents } from "./module-2128.mjs";
import { URI } from "./module-0032.mjs";
import { getCustomizationDisabledReason, isCustomizationEnabled, withCustomizationEnablement } from "./module-2112.mjs";
import { AgentHostMcpServersConfigKey } from "./module-2102.mjs";
import { agentHostMcpServerId, resolveMcpServerAuthentication } from "./module-2130.mjs";
import { ROOT_STATE_URI, readSessionFolderPickerDecision } from "./module-1007.mjs";
import { isUntitledChatSession } from "./module-0961.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostConnectionsService } from "./module-0959.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { ILogService, ILoggerService } from "./module-0095.mjs";
import { IChatService } from "./module-0972.mjs";
import { IAgentHostActiveClientService } from "./module-2123.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { localize } from "./module-0001.mjs";
import { IOutputService } from "./module-1245.mjs";
import { StringSHA1 } from "./module-0039.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostCustomizationService.ts
var IAgentHostCustomizationService = createDecorator("agentHostCustomizationService");

var AbstractAgentHostCustomizationService = class extends Disposable {
  constructor(_instantiationService, _logService) {
    super();
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._onDidChangeCustomAgents = this._register(new Emitter());
    this._onDidChangeCustomizations = this._register(new Emitter());
    this.onDidChangeCustomAgents = this._onDidChangeCustomAgents.event;
    this.onDidChangeCustomizations = this._onDidChangeCustomizations.event;
    /**
     * Sessions whose MCP diagnostics we mirror into per-server Output channels.
     * A session is tracked once the user reveals a server's output; from then
     * on every state change is recorded via {@link onDidChangeCustomizations},
     * so subsequent failures and recoveries land in the channel history.
     */
    this._mcpDiagnosticSessions = new ResourceSet();
    this._mcpLogRegistry = this._register(this._instantiationService.createInstance(AgentHostMcpServerLogRegistry));
    this._register(this.onDidChangeCustomizations(() => this._recordMcpDiagnostics()));
  }
  getCustomAgents(sessionResource) {
    return getEffectiveAgents(this._resolveTarget(sessionResource)?.customizations);
  }
  getCustomizations(sessionResource) {
    return this._resolveTarget(sessionResource)?.customizations ?? [];
  }
  getFolderPickerDecision(sessionResource) {
    return this._resolveTarget(sessionResource)?.folderPickerDecision;
  }
  getWorkingDirectory(sessionResource) {
    return this._resolveTarget(sessionResource)?.workingDirectory;
  }
  getWorkingDirectories(sessionResource) {
    return this._resolveTarget(sessionResource)?.workingDirectories ?? [];
  }
  getMcpServers(sessionResource) {
    const target = this._resolveTarget(sessionResource);
    if (!target) {
      return [];
    }
    return getPresentableMcpServerCustomizations(target.customizations).map(({ server, plugin }) => {
      const source = URI.parse(server.uri);
      return {
        id: this._scopedMcpServerId(sessionResource, server.id),
        name: server.name,
        enabled: isCustomizationEnabled(server) && (!plugin || isCustomizationEnabled(plugin)),
        enablement: server.enablement,
        isPluginProvided: plugin !== void 0,
        isClientBundled: plugin !== void 0 && target.isBundledMcpServer(plugin.uri, server.name),
        owningPluginClientId: plugin?.clientId,
        disabledReason: getCustomizationDisabledReason(server, plugin),
        status: server.state.kind,
        state: server.state,
        sourceUri: source.scheme === "mcp-top-level" ? void 0 : target.resourceUris.fromAgentHost(source),
        sourceRange: server.range,
        logOutputChannelId: channelIdForMcpServer(sessionResource.toString(), server.id),
        setEnabled: (enabled) => target.setCustomizationEnablement(server.id, withCustomizationEnablement(server.enablement, "session" /* Session */, { kind: "session" /* Session */, enabled })),
        start: () => target.startMcpServer(server.id),
        stop: () => target.stopMcpServer(server.id)
      };
    });
  }
  showMcpServerLog(sessionResource, serverId, beforeShow) {
    const target = this._resolveTarget(sessionResource);
    if (!target) {
      return Promise.resolve();
    }
    const entry = flattenMcpServerCustomizations(target.customizations).find(({ server: server2 }) => this._scopedMcpServerId(sessionResource, server2.id) === serverId);
    if (!entry) {
      return Promise.resolve();
    }
    const { server, plugin } = entry;
    this._trackMcpDiagnostics(sessionResource, target);
    const channelId = this._mcpLogRegistry.record({ sessionResource, rawId: server.id, name: server.name, enabled: isCustomizationEnabled(server) && (!plugin || isCustomizationEnabled(plugin)), state: server.state });
    return this._mcpLogRegistry.show(channelId, beforeShow);
  }
  /**
   * Registers `sessionResource` for MCP diagnostics mirroring and records the
   * currently-observed state of each of its servers. Idempotent: registering
   * an already-tracked session simply re-records (dedup'd by state signature).
   */
  _trackMcpDiagnostics(sessionResource, target) {
    this._mcpDiagnosticSessions.add(sessionResource);
    for (const { server, plugin } of flattenMcpServerCustomizations(target.customizations)) {
      this._mcpLogRegistry.record({ sessionResource, rawId: server.id, name: server.name, enabled: isCustomizationEnabled(server) && (!plugin || isCustomizationEnabled(plugin)), state: server.state });
    }
  }
  /** Re-records every tracked session's MCP server states (on any customizations change). */
  _recordMcpDiagnostics() {
    for (const sessionResource of this._mcpDiagnosticSessions) {
      const target = this._resolveTarget(sessionResource);
      if (!target) {
        continue;
      }
      for (const { server, plugin } of flattenMcpServerCustomizations(target.customizations)) {
        this._mcpLogRegistry.record({ sessionResource, rawId: server.id, name: server.name, enabled: isCustomizationEnabled(server) && (!plugin || isCustomizationEnabled(plugin)), state: server.state });
      }
    }
  }
  /** Stops mirroring and disposes all MCP diagnostics channels for a session that is going away. */
  _disposeMcpDiagnostics(sessionResource) {
    this._mcpDiagnosticSessions.delete(sessionResource);
    this._mcpLogRegistry.disposeForSession(sessionResource);
  }
  addMcpServer(sessionResource, name, config) {
    const target = this._resolveTarget(sessionResource);
    const existingServers = target?.rootConfig?.values?.[AgentHostMcpServersConfigKey];
    if (!target || !target.rootConfig) {
      return;
    }
    const servers = existingServers && typeof existingServers === "object" && !Array.isArray(existingServers) ? existingServers : {};
    target.setRootConfigValue(AgentHostMcpServersConfigKey, {
      ...servers,
      [name]: config
    });
  }
  async authenticateMcpServer(sessionResource, serverId) {
    const target = this._resolveTarget(sessionResource);
    if (!target) {
      return false;
    }
    const server = this._findMcpServer(target.customizations, serverId);
    if (!server || server.state.kind !== "authRequired" /* AuthRequired */) {
      return false;
    }
    const scopedServerId = agentHostMcpServerId(sessionResource.authority, server.name, server.state.resource.resource);
    try {
      return await this._instantiationService.invokeFunction(resolveMcpServerAuthentication, server.state.resource, {
        allowInteraction: true,
        logPrefix: "[AgentHost]",
        mcpServerId: scopedServerId,
        mcpServerName: server.name,
        mcpServerUrl: server.state.resource.resource,
        oauthClient: server.state.oauthClient,
        scopes: server.state.requiredScopes ?? [],
        agentHost: { scheme: sessionResource.scheme, authority: sessionResource.authority },
        authenticate: (request2) => target.authenticate(request2)
      });
    } catch (err) {
      this._logService.error(`[AgentHost] Failed to authenticate MCP server '${server.name}'`, err);
      return false;
    }
  }
  setCustomizationEnablement(sessionResource, customizationId2, currentEnablement, kind, enabled) {
    const target = this._resolveTarget(sessionResource);
    if (!target) {
      this._logService.warn(`[AgentHostCustomizationService] Cannot change enablement for '${customizationId2}' because its session is unavailable.`);
      return;
    }
    const customization = this._findCustomization(target.customizations, customizationId2);
    if (!customization) {
      this._logService.warn(`[AgentHostCustomizationService] Cannot change enablement for unavailable customization '${customizationId2}'.`);
      return;
    }
    const entry = kind === "workspace" /* Workspace */ ? this._workspaceEnablementEntry(target, enabled) : { kind, enabled };
    if (!entry) {
      this._logService.warn(`[AgentHostCustomizationService] Cannot set workspace enablement for '${customizationId2}' without a working directory.`);
      return;
    }
    target.setCustomizationEnablement(customization.id, withCustomizationEnablement(currentEnablement, kind, entry));
  }
  _workspaceEnablementEntry(target, enabled) {
    const workingDirectory = target.workingDirectories?.[0] ?? target.workingDirectory;
    return workingDirectory ? { kind: "workspace" /* Workspace */, uri: workingDirectory, enabled } : void 0;
  }
  _fireCustomAgentsChanged() {
    this._onDidChangeCustomAgents.fire();
  }
  _fireCustomizationsChanged() {
    this._onDidChangeCustomizations.fire();
  }
  _findMcpServer(customizations, serverId) {
    for (const { server } of flattenMcpServerCustomizations(customizations)) {
      if (server.id === serverId || this._isScopedMcpServerIdForRawId(serverId, server.id)) {
        return server;
      }
    }
    return void 0;
  }
  _findCustomization(customizations, customizationId2) {
    for (const customization of customizations) {
      if (customization.id === customizationId2 || this._isScopedMcpServerIdForRawId(customizationId2, customization.id)) {
        return customization;
      }
      const child = (customization.type !== "mcpServer" /* McpServer */ ? customization.children : void 0)?.find((child2) => child2.id === customizationId2 || this._isScopedMcpServerIdForRawId(customizationId2, child2.id));
      if (child) {
        return child;
      }
    }
    return void 0;
  }
  _scopedMcpServerId(sessionResource, rawId) {
    return `${sessionResource.authority}/${rawId}`;
  }
  _isScopedMcpServerIdForRawId(serverId, rawId) {
    const separator2 = serverId.indexOf("/");
    return separator2 >= 0 && serverId.slice(separator2 + 1) === rawId;
  }
};

function flattenMcpServerCustomizations(customizations) {
  return customizations.flatMap((customization) => customization.type === "mcpServer" /* McpServer */ ? [{ server: customization, isTopLevel: true }] : customization.children?.filter((child) => child.type === "mcpServer" /* McpServer */).map((server) => ({
    server,
    plugin: customization.type === "plugin" /* Plugin */ ? customization : void 0,
    isTopLevel: false
  })) ?? []);
}

function getPresentableMcpServerCustomizations(customizations) {
  const entries2 = flattenMcpServerCustomizations(customizations);
  const topLevelNames = /* @__PURE__ */ new Set();
  for (const entry of entries2) {
    if (entry.isTopLevel) {
      topLevelNames.add(entry.server.name);
    }
  }
  if (topLevelNames.size === 0) {
    return entries2;
  }
  return entries2.filter((entry) => entry.isTopLevel || !topLevelNames.has(entry.server.name));
}

var WorkbenchAgentHostCustomizationService = class extends AbstractAgentHostCustomizationService {
  constructor(_connectionsService, _provisionalSessionService, instantiationService, logService, _chatService, _activeClientService) {
    super(instantiationService, logService);
    this._connectionsService = _connectionsService;
    this._provisionalSessionService = _provisionalSessionService;
    this._chatService = _chatService;
    this._activeClientService = _activeClientService;
    this._sessionStateSubscriptions = this._register(new DisposableResourceMap());
    this._register(this._connectionsService.ambientConnection.onDidAction((envelope) => {
      switch (envelope.action.type) {
        case "session/customizationsChanged" /* SessionCustomizationsChanged */:
        case "session/customizationUpdated" /* SessionCustomizationUpdated */:
        case "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */:
          this._fireCustomizationsChanged();
          this._fireCustomAgentsChanged();
          break;
      }
    }));
    this._register(this._provisionalSessionService.onDidChange((sessionResource) => {
      const existing = this._sessionStateSubscriptions.get(sessionResource);
      const currentBackend = this._provisionalSessionService.get(sessionResource);
      if (existing && existing.backendSession.toString() !== currentBackend?.toString()) {
        this._disposeMcpDiagnostics(sessionResource);
      }
      this._sessionStateSubscriptions.deleteAndDispose(sessionResource);
      this._fireCustomizationsChanged();
      this._fireCustomAgentsChanged();
    }));
    this._register(this._chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResources) {
        this._sessionStateSubscriptions.deleteAndDispose(sessionResource);
        this._disposeMcpDiagnostics(sessionResource);
      }
      this._fireCustomizationsChanged();
      this._fireCustomAgentsChanged();
    }));
  }
  _resolveTarget(sessionResource) {
    const target = this._resolveSessionTarget(sessionResource);
    if (!target) {
      return void 0;
    }
    const sessionState = this._readSessionState(sessionResource);
    const rootState = target.connection.rootState.value;
    const channel = target.backendSession.toString();
    return {
      customizations: sessionState?.customizations ?? [],
      resourceUris: target.connection.resourceUris,
      folderPickerDecision: readSessionFolderPickerDecision(sessionState?._meta),
      workingDirectory: sessionState?.workingDirectories?.[0],
      workingDirectories: sessionState?.workingDirectories,
      rootConfig: rootState && !(rootState instanceof Error) ? rootState.config : void 0,
      isBundledMcpServer: (pluginUri, serverName) => this._activeClientService.isBundledMcpServer(pluginUri, serverName),
      authenticate: (request2) => target.connection.authenticate(request2),
      setCustomizationEnablement: (rawId, enablement) => {
        target.connection.dispatch(channel, {
          type: "session/customizationToggled" /* SessionCustomizationToggled */,
          id: rawId,
          enablement: [...enablement]
        });
      },
      startMcpServer: (rawId) => {
        target.connection.dispatch(channel, {
          type: "session/mcpServerStartRequested" /* SessionMcpServerStartRequested */,
          id: rawId
        });
        return Promise.resolve();
      },
      stopMcpServer: (rawId) => {
        target.connection.dispatch(channel, {
          type: "session/mcpServerStopRequested" /* SessionMcpServerStopRequested */,
          id: rawId
        });
        return Promise.resolve();
      },
      setRootConfigValue: (property, value2) => {
        target.connection.dispatch(ROOT_STATE_URI, {
          type: "root/configChanged" /* RootConfigChanged */,
          config: { [property]: value2 }
        });
      }
    };
  }
  _readSessionState(sessionResource) {
    const target = this._resolveSessionTarget(sessionResource);
    const value2 = target ? this._ensureSessionStateSubscription(sessionResource, target)?.sub.value : void 0;
    return value2 && !(value2 instanceof Error) ? value2 : void 0;
  }
  _ensureSessionStateSubscription(sessionResource, target) {
    const existing = this._sessionStateSubscriptions.get(sessionResource);
    if (existing?.backendSession.toString() === target.backendSession.toString() && existing.connection === target.connection) {
      return existing;
    }
    const ref = target.connection.getSubscription(1 /* Session */, target.backendSession, "AgentHostCustomizationService");
    const sub = ref.object;
    const listener = sub.onDidChange(() => {
      this._fireCustomizationsChanged();
      this._fireCustomAgentsChanged();
    });
    const entry = {
      connection: target.connection,
      backendSession: target.backendSession,
      sub,
      dispose: () => {
        listener.dispose();
        ref.dispose();
      }
    };
    this._sessionStateSubscriptions.set(sessionResource, entry);
    return entry;
  }
  /**
   * Resolves a chat session resource to the backend agent-session URI plus
   * the {@link IAgentConnection} (local or remote) that owns it. Returns
   * `undefined` for sessions not backed by an agent host.
   */
  _resolveSessionTarget(sessionResource) {
    const provisionalSession = this._provisionalSessionService.get(sessionResource);
    if (provisionalSession) {
      return { connection: this._connectionsService.ambientConnection, backendSession: provisionalSession };
    }
    if (isUntitledChatSession(sessionResource)) {
      return void 0;
    }
    return this._connectionsService.resolveSessionResource(sessionResource);
  }
};

WorkbenchAgentHostCustomizationService = __decorateClass([
  __decorateParam(0, IAgentHostConnectionsService),
  __decorateParam(1, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IAgentHostActiveClientService)
], WorkbenchAgentHostCustomizationService);

registerSingleton(IAgentHostCustomizationService, WorkbenchAgentHostCustomizationService, 1 /* Delayed */);

var AgentHostMcpServerLogRegistry = class extends Disposable {
  constructor(_loggerService, _outputService) {
    super();
    this._loggerService = _loggerService;
    this._outputService = _outputService;
    this._entries = /* @__PURE__ */ new Map();
    /** Channel ids grouped by owning session key, so a session teardown can dispose them all. */
    this._bySession = /* @__PURE__ */ new Map();
    this._register(toDisposable(() => {
      for (const key3 of [...this._bySession.keys()]) {
        this._disposeSessionKey(key3);
      }
    }));
  }
  /**
   * Ensures a hidden diagnostics channel exists for the MCP server identified
   * by `(sessionResource, rawId)` and records a line whenever its state
   * changes (including the first observed state). Returns the stable channel
   * id for the service to reveal via {@link show} -- the id is internal.
   */
  record(server) {
    const sessionKey = server.sessionResource.toString();
    const channelId = channelIdForMcpServer(sessionKey, server.rawId);
    let entry = this._entries.get(channelId);
    if (!entry) {
      const logger = this._loggerService.createLogger(channelId, {
        hidden: true,
        name: localize(8961, null, server.name)
      });
      const dispose2 = () => {
        logger.dispose();
        this._loggerService.deregisterLogger(channelId);
      };
      entry = { logger, dispose: dispose2, lastSignature: void 0 };
      this._entries.set(channelId, entry);
      let group2 = this._bySession.get(sessionKey);
      if (!group2) {
        group2 = /* @__PURE__ */ new Set();
        this._bySession.set(sessionKey, group2);
      }
      group2.add(channelId);
    }
    const { signature, message, isError } = describeMcpServerState(server.name, server.enabled, server.state);
    if (entry.lastSignature !== signature) {
      entry.lastSignature = signature;
      if (isError) {
        entry.logger.error(message);
      } else {
        entry.logger.info(message);
      }
    }
    return channelId;
  }
  /** Reveals the diagnostics channel `channelId`, making its hidden logger visible. */
  async show(channelId, beforeShow) {
    if (!this._entries.has(channelId)) {
      return;
    }
    this._loggerService.setVisibility(channelId, true);
    await beforeShow?.();
    await this._outputService.showChannel(channelId);
  }
  /** Disposes every channel/logger owned by `sessionResource` (session teardown). */
  disposeForSession(sessionResource) {
    this._disposeSessionKey(sessionResource.toString());
  }
  _disposeSessionKey(sessionKey) {
    const group2 = this._bySession.get(sessionKey);
    if (!group2) {
      return;
    }
    this._bySession.delete(sessionKey);
    for (const channelId of group2) {
      this._entries.get(channelId)?.dispose();
      this._entries.delete(channelId);
    }
  }
};

AgentHostMcpServerLogRegistry = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IOutputService)
], AgentHostMcpServerLogRegistry);

function channelIdForMcpServer(sessionKey, rawId) {
  const sha = new StringSHA1();
  sha.update(sessionKey);
  sha.update("\0");
  sha.update(rawId);
  return `agentHostMcpServer.${sha.digest()}`;
}

function describeMcpServerState(name, enabled, state) {
  if (!enabled) {
    return { signature: "disabled", message: localize(8959, null, name), isError: false };
  }
  switch (state.kind) {
    case "ready" /* Ready */:
      return { signature: "ready", message: localize(8962, null, name), isError: false };
    case "starting" /* Starting */:
      return { signature: "starting", message: localize(8963, null, name), isError: false };
    case "authRequired" /* AuthRequired */:
      return { signature: `authRequired:${state.resource.resource}`, message: localize(8958, null, name, state.resource.resource), isError: false };
    case "error" /* Error */:
      return { signature: `error:${state.error.errorType}:${state.error.message}`, message: localize(8960, null, name, state.error.message), isError: true };
    case "stopped" /* Stopped */:
    default:
      return { signature: "stopped", message: localize(8964, null, name), isError: false };
  }
}
export { flattenMcpServerCustomizations, getPresentableMcpServerCustomizations, channelIdForMcpServer, describeMcpServerState, IAgentHostCustomizationService, AbstractAgentHostCustomizationService, WorkbenchAgentHostCustomizationService, AgentHostMcpServerLogRegistry };
