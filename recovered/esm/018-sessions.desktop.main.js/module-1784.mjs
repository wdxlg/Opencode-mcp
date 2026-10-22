// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/agentHost/browser/agentHostCustomizationService.ts
import { AbstractAgentHostCustomizationService, IAgentHostCustomizationService } from "./module-1763.mjs";
import { DisposableMap, combinedDisposable } from "./module-0012.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { identityAgentHostResourceUriMapper } from "./module-1001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAgentHostActiveClientService } from "./module-1759.mjs";
import { URI } from "./module-0032.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/agentHost/browser/agentHostCustomizationService.ts
var AgentHostCustomizationService = class extends AbstractAgentHostCustomizationService {
  constructor(_sessionsManagementService, _sessionsService, _sessionsProvidersService, instantiationService, logService, _activeClientService) {
    super(instantiationService, logService);
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._activeClientService = _activeClientService;
    this._providerListeners = this._register(new DisposableMap());
    this._register(this._sessionsManagementService.onDidChangeSessions((e4) => {
      for (const session of e4.removed) {
        this._disposeMcpDiagnostics(session.resource);
      }
      this._fireCustomAgentsChanged();
      this._fireCustomizationsChanged();
    }));
  }
  _getSession(sessionResource) {
    const activeSession = this._sessionsService.activeSession.get();
    if (activeSession && isEqual2(activeSession.resource, sessionResource)) {
      return activeSession;
    }
    return this._sessionsManagementService.getSession(sessionResource);
  }
  _getAHSProvider(session) {
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (provider && isAgentHostProvider(provider)) {
      this._ensureProviderListener(provider);
      return provider;
    }
    return void 0;
  }
  _resolveTarget(sessionResource) {
    const session = this._getSession(sessionResource);
    if (!session) {
      return void 0;
    }
    const provider = this._getAHSProvider(session);
    if (!provider) {
      return void 0;
    }
    return {
      customizations: provider.getCustomizations(session.sessionId),
      resourceUris: provider.getFeedbackAnnotationsChannel?.(session.sessionId)?.connection.resourceUris ?? identityAgentHostResourceUriMapper,
      workingDirectory: provider.getWorkingDirectory(session.sessionId),
      workingDirectories: provider.getWorkingDirectories(session.sessionId),
      rootConfig: provider.getRootConfig(),
      isBundledMcpServer: (pluginUri, serverName) => this._activeClientService.isBundledMcpServer(pluginUri, serverName),
      authenticate: (request2) => provider.authenticate(request2),
      setCustomizationEnablement: (rawId, enablement) => {
        provider.setCustomizationEnablement(session.sessionId, rawId, enablement);
      },
      startMcpServer: (rawId) => {
        return provider.getMcpServers(session.sessionId).find((server) => this._serverIdMatchesRawId(server.id, rawId))?.start() ?? Promise.resolve();
      },
      stopMcpServer: (rawId) => {
        return provider.getMcpServers(session.sessionId).find((server) => this._serverIdMatchesRawId(server.id, rawId))?.stop() ?? Promise.resolve();
      },
      setRootConfigValue: (property, value2) => {
        void provider.setRootConfigValue(property, value2);
      }
    };
  }
  getCustomAgents(sessionResource) {
    const session = this._getSession(sessionResource);
    if (session) {
      const provider = this._getAHSProvider(session);
      if (provider) {
        const agents = provider.getCustomAgents(session.sessionId);
        const activeMode = session.mode.get()?.id;
        return agents.length === 0 && activeMode ? [this._agentFromMode(activeMode)] : agents;
      }
    }
    return [];
  }
  _ensureProviderListener(provider) {
    if (this._providerListeners.has(provider)) {
      return;
    }
    this._providerListeners.set(provider, combinedDisposable(
      provider.onDidChangeCustomAgents(() => {
        this._fireCustomAgentsChanged();
      }),
      provider.onDidChangeCustomizations(() => {
        this._fireCustomizationsChanged();
      })
    ));
  }
  _serverIdMatchesRawId(serverId, rawId) {
    const separator2 = serverId.indexOf("/");
    return serverId === rawId || separator2 >= 0 && serverId.slice(separator2 + 1) === rawId;
  }
  _agentFromMode(uri4) {
    return {
      id: uri4,
      uri: uri4,
      name: agentNameFromUri(uri4),
      type: "agent" /* Agent */
    };
  }
};

AgentHostCustomizationService = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IAgentHostActiveClientService)
], AgentHostCustomizationService);

function agentNameFromUri(uri4) {
  try {
    let name = basename2(URI.parse(uri4));
    for (const suffix of [".agent.md", ".md"]) {
      if (name.endsWith(suffix)) {
        name = name.substring(0, name.length - suffix.length);
        break;
      }
    }
    return name || uri4;
  } catch {
    return uri4;
  }
}

registerSingleton(IAgentHostCustomizationService, AgentHostCustomizationService, 1 /* Delayed */);
export { agentNameFromUri, AgentHostCustomizationService };
