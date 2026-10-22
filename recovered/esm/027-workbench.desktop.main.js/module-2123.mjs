// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostActiveClientService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { DeferredPromise, Delayer } from "./module-0036.mjs";
import { SyncedCustomizationBundler } from "./module-2122.mjs";
import { resolveCustomizationRefs, resolveLocalCustomAgents } from "./module-2115.mjs";
import { transaction } from "./module-0045.mjs";
import { equals4 } from "./module-0098.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { derived } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IMcpService } from "./module-1206.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { CLIENT_SEMANTIC_SEARCH_REFERENCE_NAME, CLIENT_SEMANTIC_SEARCH_TOOL_ID, CopilotSemanticSearchEnabledSettingId, SEMANTIC_SEARCH_TOOL_NAME } from "./module-2110.mjs";
import { isRemoteAgentHostSessionType } from "./module-0958.mjs";
import { IAgentHostToolSetEnablementService, isCopilotCliSessionType, isToolEnabledInSet } from "./module-2113.mjs";
import { AgentHostMcpServerSupportScope } from "./module-2117.mjs";
import { AgentCustomizationSyncProvider } from "./module-2111.mjs";
import { Iterable } from "./module-0011.mjs";
import { coalesce } from "./module-0007.mjs";
import { toolDataToDefinition } from "./module-2116.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { hash } from "./module-0039.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostActiveClientService.ts
var IAgentHostActiveClientService = createDecorator("agentHostActiveClientService");

var AgentCustomizationScope = class extends Disposable {
  constructor(_sessionType, _roots, scopeKey, _syncProvider, _options, _getClientTools, _onDispose, _fileService, _promptsService, _agentPluginService, instantiationService, _mcpService, _configurationResolverService) {
    super();
    this._sessionType = _sessionType;
    this._roots = _roots;
    this._syncProvider = _syncProvider;
    this._options = _options;
    this._getClientTools = _getClientTools;
    this._onDispose = _onDispose;
    this._fileService = _fileService;
    this._promptsService = _promptsService;
    this._agentPluginService = _agentPluginService;
    this._mcpService = _mcpService;
    this._configurationResolverService = _configurationResolverService;
    this._customizations = observableValue("agentCustomizations", []);
    this._customAgents = observableValue("agentCustomAgents", []);
    this._isResolved = observableValue("agentCustomizationsResolved", false);
    this._initialResolution = new DeferredPromise();
    this._activeClients = /* @__PURE__ */ new Map();
    this._refCount = 0;
    this._updateSeq = 0;
    this._isDisposed = false;
    this._bundler = this._register(instantiationService.createInstance(SyncedCustomizationBundler, createScopeAuthority(_sessionType, scopeKey)));
    this._updateDelayer = this._register(new Delayer(CUSTOMIZATION_UPDATE_DEBOUNCE_DELAY));
    const updateCustomizations = async () => {
      const seq = ++this._updateSeq;
      let completedInitialResolution = false;
      try {
        const [refs, agents] = await Promise.all([
          resolveCustomizationRefs(
            this._fileService,
            this._promptsService,
            this._syncProvider,
            this._agentPluginService,
            this._mcpService,
            this._configurationResolverService,
            this._bundler,
            this._sessionType,
            this._options,
            this._roots
          ),
          resolveLocalCustomAgents(this._fileService, this._promptsService, this._syncProvider, this._agentPluginService, this._sessionType, this._options)
        ]);
        if (seq !== this._updateSeq) {
          return;
        }
        transaction((tx) => {
          if (!equals4(this._customizations.get(), refs)) {
            this._customizations.set(refs, tx);
          }
          if (!equals4(this._customAgents.get(), agents)) {
            this._customAgents.set(agents, tx);
          }
          this._isResolved.set(true, tx);
        });
        completedInitialResolution = true;
      } catch (err) {
        onUnexpectedError(err);
        if (seq === this._updateSeq) {
          transaction((tx) => this._isResolved.set(true, tx));
          completedInitialResolution = true;
        }
      } finally {
        if (completedInitialResolution && !this._initialResolution.isSettled) {
          this._initialResolution.complete();
        }
      }
    };
    const scheduleUpdate = () => {
      this._updateDelayer.trigger(() => updateCustomizations()).catch(() => {
      });
    };
    this._register(this._syncProvider.onDidChange(() => scheduleUpdate()));
    this._register(Event2.any(
      this._promptsService.onDidChangeCustomAgents,
      this._promptsService.onDidChangeSlashCommands,
      this._promptsService.onDidChangeSkills,
      this._promptsService.onDidChangeInstructions
    )(() => scheduleUpdate()));
    this._register(autorun((reader) => {
      for (const plugin of this._agentPluginService.plugins.read(reader)) {
        plugin.enablement.read(reader);
        plugin.hooks.read(reader);
        plugin.commands.read(reader);
        plugin.skills.read(reader);
        plugin.agents.read(reader);
        plugin.instructions.read(reader);
        plugin.mcpServerDefinitions.read(reader);
      }
      scheduleUpdate();
    }));
    this._register(autorun((reader) => {
      for (const server of this._mcpService.servers.read(reader)) {
        server.enablement.read(reader);
        server.readDefinitions().read(reader);
      }
      scheduleUpdate();
    }));
  }
  get customizations() {
    return this._customizations;
  }
  get customAgents() {
    return this._customAgents;
  }
  get tools() {
    return this._getClientTools(this._sessionType);
  }
  get isResolved() {
    return this._isResolved;
  }
  acquire() {
    this._refCount++;
    let released = false;
    return {
      customizations: this.customizations,
      customAgents: this.customAgents,
      tools: this.tools,
      isResolved: this.isResolved,
      whenResolved: () => this._initialResolution.p,
      activeClient: (clientId) => this.activeClient(clientId),
      dispose: () => {
        if (!released) {
          released = true;
          this._release();
        }
      }
    };
  }
  getOrigin(syncedUri) {
    return this._bundler.getOrigin(syncedUri);
  }
  isBundledMcpServer(pluginUri, serverName) {
    return this._bundler.isBundledMcpServer(pluginUri, serverName);
  }
  activeClient(clientId) {
    let activeClient = this._activeClients.get(clientId);
    if (!activeClient) {
      activeClient = derived((reader) => {
        this._customAgents.read(reader);
        return {
          clientId,
          tools: [...this.tools.read(reader)],
          customizations: [...this._customizations.read(reader)]
        };
      });
      this._activeClients.set(clientId, activeClient);
    }
    return activeClient;
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._updateSeq++;
    if (!this._initialResolution.isSettled) {
      this._initialResolution.complete();
    }
    super.dispose();
    this._onDispose();
  }
  _release() {
    if (--this._refCount === 0) {
      this.dispose();
    }
  }
};

AgentCustomizationScope = __decorateClass([
  __decorateParam(7, IFileService),
  __decorateParam(8, IPromptsService),
  __decorateParam(9, IAgentPluginService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IMcpService),
  __decorateParam(12, IConfigurationResolverService)
], AgentCustomizationScope);

var AgentHostActiveClientService = class extends Disposable {
  constructor(_toolsService, _storageService, _instantiationService, _toolSetEnablementService, _uriIdentityService, configurationService) {
    super();
    this._toolsService = _toolsService;
    this._storageService = _storageService;
    this._instantiationService = _instantiationService;
    this._toolSetEnablementService = _toolSetEnablementService;
    this._uriIdentityService = _uriIdentityService;
    this._clientToolsByType = /* @__PURE__ */ new Map();
    this._scopes = /* @__PURE__ */ new Map();
    this._mcpServerSupportScopes = /* @__PURE__ */ new Map();
    this._syncProviders = /* @__PURE__ */ new Map();
    this._isDisposed = false;
    this._allToolsObs = this._toolsService.observeTools(void 0);
    this._allToolSetsObs = this._toolsService.toolSets;
    this._semanticSearchEnabled = observableConfigValue(CopilotSemanticSearchEnabledSettingId, false, configurationService);
  }
  acquireScope(sessionType, roots) {
    const normalizedRoots = normalizeRoots(roots, this._uriIdentityService.extUri);
    const scopeKey = getScopeKey(normalizedRoots, this._uriIdentityService.extUri);
    const serviceScopeKey = getServiceScopeKey(sessionType, scopeKey);
    let scope = this._scopes.get(serviceScopeKey);
    if (!scope) {
      const options3 = isRemoteAgentHostSessionType(sessionType) ? { includeUserStorage: true } : void 0;
      const createdScope = this._instantiationService.createInstance(
        AgentCustomizationScope,
        sessionType,
        normalizedRoots,
        scopeKey,
        this.getSyncProvider(sessionType),
        options3,
        (type) => this._getClientTools(type),
        () => this._removeScope(serviceScopeKey, createdScope)
      );
      scope = createdScope;
      this._scopes.set(serviceScopeKey, scope);
    }
    return scope.acquire();
  }
  acquireMcpServerSupportScope(sessionType, roots) {
    if (!isCopilotCliSessionType(sessionType)) {
      return void 0;
    }
    const normalizedRoots = roots === void 0 ? void 0 : normalizeRoots(roots, this._uriIdentityService.extUri);
    const rootsKey = normalizedRoots === void 0 ? void 0 : getScopeKey(normalizedRoots, this._uriIdentityService.extUri);
    const serviceScopeKey = JSON.stringify([sessionType, rootsKey]);
    let scope = this._mcpServerSupportScopes.get(serviceScopeKey);
    if (!scope) {
      const createdScope = this._instantiationService.createInstance(
        AgentHostMcpServerSupportScope,
        sessionType,
        normalizedRoots,
        () => this._removeMcpServerSupportScope(serviceScopeKey, createdScope)
      );
      scope = createdScope;
      this._mcpServerSupportScopes.set(serviceScopeKey, scope);
    }
    return scope.acquire();
  }
  getSyncProvider(sessionType) {
    let syncProvider = this._syncProviders.get(sessionType);
    if (!syncProvider) {
      syncProvider = this._register(new AgentCustomizationSyncProvider(sessionType, this._storageService));
      this._syncProviders.set(sessionType, syncProvider);
    }
    return syncProvider;
  }
  getOrigin(syncedUri) {
    for (const scope of this._scopes.values()) {
      const origin = scope.getOrigin(syncedUri);
      if (origin) {
        return origin;
      }
    }
    return void 0;
  }
  areScopeRootsEqual(first2, second) {
    return areCustomizationScopeRootsEqual(first2, second, this._uriIdentityService.extUri);
  }
  isBundledMcpServer(pluginUri, serverName) {
    return Iterable.some([...this._scopes.values()], (scope) => scope.isBundledMcpServer(pluginUri, serverName));
  }
  _getClientTools(sessionType) {
    let obs = this._clientToolsByType.get(sessionType);
    if (!obs) {
      obs = derived((reader) => {
        const tools = this._allToolsObs.read(reader);
        const toolSets = this._allToolSetsObs.read(reader);
        const enablement = this._toolSetEnablementService.observe(sessionType).read(reader);
        const isCopilotSession = isCopilotCliSessionType(sessionType);
        const semanticSearchEnabled = isCopilotSession && this._semanticSearchEnabled.read(reader);
        const semanticSearchTool = isCopilotSession ? tools.find((tool) => tool.id === CLIENT_SEMANTIC_SEARCH_TOOL_ID) : void 0;
        const enabledToolIds = /* @__PURE__ */ new Set();
        for (const ts of toolSets) {
          if (ts.deprecated) {
            continue;
          }
          for (const tool of ts.getTools(reader)) {
            if (isToolEnabledInSet(enablement, ts.id, tool.id)) {
              enabledToolIds.add(tool.id);
            }
          }
        }
        return coalesce(tools.filter((tool) => enabledToolIds.has(tool.id) || semanticSearchEnabled && tool === semanticSearchTool).map((tool) => {
          if (!isCopilotSession) {
            return toolDataToDefinition(tool);
          }
          if (tool === semanticSearchTool) {
            return semanticSearchEnabled ? { ...toolDataToDefinition(tool), name: SEMANTIC_SEARCH_TOOL_NAME } : void 0;
          }
          if (tool.toolReferenceName === CLIENT_SEMANTIC_SEARCH_REFERENCE_NAME || tool.toolReferenceName === SEMANTIC_SEARCH_TOOL_NAME) {
            return void 0;
          }
          return toolDataToDefinition(tool);
        }));
      });
      this._clientToolsByType.set(sessionType, obs);
    }
    return obs;
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    const scopes = [...this._scopes.values()];
    this._scopes.clear();
    const mcpServerSupportScopes = [...this._mcpServerSupportScopes.values()];
    this._mcpServerSupportScopes.clear();
    for (const scope of scopes) {
      scope.dispose();
    }
    for (const scope of mcpServerSupportScopes) {
      scope.dispose();
    }
    super.dispose();
  }
  _removeScope(scopeKey, scope) {
    if (this._scopes.get(scopeKey) === scope) {
      this._scopes.delete(scopeKey);
    }
  }
  _removeMcpServerSupportScope(scopeKey, scope) {
    if (this._mcpServerSupportScopes.get(scopeKey) === scope) {
      this._mcpServerSupportScopes.delete(scopeKey);
    }
  }
};

AgentHostActiveClientService = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAgentHostToolSetEnablementService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IConfigurationService)
], AgentHostActiveClientService);

function normalizeRoots(roots, extUri2) {
  const rootsByUri = new ResourceMap((root) => extUri2.getComparisonKey(root));
  for (const root of roots) {
    rootsByUri.set(root, root);
  }
  return [...rootsByUri.values()].sort((a, b) => {
    const left = extUri2.getComparisonKey(a);
    const right = extUri2.getComparisonKey(b);
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

function areCustomizationScopeRootsEqual(first2, second, extUri2) {
  const toComparisonKey = (root) => extUri2.getComparisonKey(root);
  const firstRoots = new ResourceSet(first2 ?? [], toComparisonKey);
  const secondRoots = new ResourceSet(second, toComparisonKey);
  return firstRoots.size === secondRoots.size && [...firstRoots].every((root) => secondRoots.has(root));
}

function getScopeKey(roots, extUri2) {
  return roots.map((root) => extUri2.getComparisonKey(root)).join("\n");
}

function getServiceScopeKey(sessionType, scopeKey) {
  return JSON.stringify([sessionType, scopeKey]);
}

function createScopeAuthority(sessionType, scopeKey) {
  return `${sessionType}-${hash(scopeKey)}`;
}

var CUSTOMIZATION_UPDATE_DEBOUNCE_DELAY = 50;

registerSingleton(IAgentHostActiveClientService, AgentHostActiveClientService, 1 /* Delayed */);
export { normalizeRoots, areCustomizationScopeRootsEqual, getScopeKey, getServiceScopeKey, createScopeAuthority, IAgentHostActiveClientService, AgentCustomizationScope, AgentHostActiveClientService, CUSTOMIZATION_UPDATE_DEBOUNCE_DELAY };
