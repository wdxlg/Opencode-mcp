// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentServiceFoundation.ts
import { AgentHostStateManager, IAgentHostStateManager } from "./module-0103.mjs";
import { hostBuildInfoFromProduct } from "./module-0047.mjs";
import { AgentConfigurationService, IAgentConfigurationService } from "./module-0104.mjs";
import { AgentHostProxyConfigKey } from "./module-0057.mjs";
import { AgentHostAuthenticationService, IAgentHostAuthenticationController, IAgentHostAuthenticationService } from "./module-0201.mjs";
import { AgentHostGitHubEndpointService, IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { AgentHostProxyResolver, IAgentHostProxyResolver } from "./module-0140.mjs";
import { AgentHostRequestService } from "./module-0553.mjs";
import { IRequestService } from "./module-0146.mjs";


// src/vs/platform/agentHost/node/agentServiceFoundation.ts
var AgentServiceCallbackAdapter = class {
  constructor() {
    this.automationExecution = {
      isSessionTemplateAvailable: (template) => this.value.automationExecution.isSessionTemplateAvailable(template),
      createSession: (template, run2) => this.value.automationExecution.createSession(template, run2),
      startSession: (session, message) => this.value.automationExecution.startSession(session, message),
      cancelSession: (session) => this.value.automationExecution.cancelSession(session)
    };
    this.sessionServerToolAccessor = {
      isActiveAgentTitleGenerationEnabled: () => this.value.sessionServerToolAccessor.isActiveAgentTitleGenerationEnabled(),
      listSessions: () => this.value.sessionServerToolAccessor.listSessions(),
      getSession: (session) => this.value.sessionServerToolAccessor.getSession(session),
      createSession: (config) => this.value.sessionServerToolAccessor.createSession(config),
      getModels: () => this.value.sessionServerToolAccessor.getModels(),
      getCreationDefaults: (source) => this.value.sessionServerToolAccessor.getCreationDefaults(source),
      startPrompt: (session, chat, prompt, delegation) => this.value.sessionServerToolAccessor.startPrompt(session, chat, prompt, delegation),
      createChat: (session, chat, options) => this.value.sessionServerToolAccessor.createChat(session, chat, options),
      renameChat: (session, chat, title) => this.value.sessionServerToolAccessor.renameChat(session, chat, title),
      reportToolError: (toolName, error) => this.value.sessionServerToolAccessor.reportToolError(toolName, error),
      deleteSession: (session) => this.value.sessionServerToolAccessor.deleteSession(session),
      getChatContext: (session, chatId) => this.value.sessionServerToolAccessor.getChatContext(session, chatId),
      getSessionSpawnDepth: (session) => this.value.sessionServerToolAccessor.getSessionSpawnDepth(session),
      setSessionSpawnDepth: (session, depth) => this.value.sessionServerToolAccessor.setSessionSpawnDepth(session, depth)
    };
    this.artifactServerToolAccessor = {
      isEnabled: () => this.value.artifactServerToolAccessor.isEnabled(),
      persist: (session, artifacts) => this.value.artifactServerToolAccessor.persist(session, artifacts)
    };
  }
  bind(callbacks) {
    if (this.callbacks) {
      throw new Error("AgentService callbacks have already been bound");
    }
    this.callbacks = callbacks;
  }
  canEvictChangeset(changeset) {
    return this.callbacks?.canEvictChangeset(changeset) ?? false;
  }
  get value() {
    if (!this.callbacks) {
      throw new Error("AgentService callbacks have not been bound");
    }
    return this.callbacks;
  }
};

function createAgentServiceFoundation(options) {
  const callbackAdapter = new AgentServiceCallbackAdapter();
  const stateManager = options.owned.add(new AgentHostStateManager(options.logService, {
    hostBuildInfo: hostBuildInfoFromProduct(options.productService),
    changesetStateRetention: {
      canEvict: (changeset) => callbackAdapter.canEvictChangeset(changeset)
    }
  }));
  const configurationService = options.owned.add(new AgentConfigurationService(
    stateManager,
    options.logService,
    options.rootConfigResource,
    options.providerConfigurations ?? []
  ));
  if (options.transientProxyConfiguration) {
    configurationService.publishRootTransientValues(Object.fromEntries(
      Object.values(AgentHostProxyConfigKey).map((key) => [key, void 0])
    ));
  }
  const authenticationService = options.owned.add(new AgentHostAuthenticationService(options.logService));
  const gitHubEndpointService = options.owned.add(new AgentHostGitHubEndpointService(configurationService, options.logService));
  const proxyResolver = options.proxyResolver ?? options.owned.add(new AgentHostProxyResolver(configurationService, options.logService));
  const requestService = options.owned.add(new AgentHostRequestService(options.logService, proxyResolver));
  const fetchFn = options.fetchFn ?? proxyResolver.fetch.bind(proxyResolver);
  options.services.set(IAgentHostStateManager, stateManager);
  options.services.set(IAgentConfigurationService, configurationService);
  options.services.set(IAgentHostAuthenticationService, authenticationService);
  options.services.set(IAgentHostAuthenticationController, authenticationService);
  options.services.set(IAgentHostGitHubEndpointService, gitHubEndpointService);
  options.services.set(IAgentHostProxyResolver, proxyResolver);
  options.services.set(IRequestService, requestService);
  return {
    callbackAdapter,
    stateManager,
    configurationService,
    authenticationService,
    gitHubEndpointService,
    proxyResolver,
    requestService,
    fetchFn,
    gitHubServiceOptions: {
      endpoint: gitHubEndpointService,
      tokenProvider: {
        getToken: () => {
          const resource = gitHubEndpointService.getRepoResource();
          return authenticationService.getAuthToken({ resource: resource.resource, scopes: resource.scopes_supported });
        }
      },
      fetch: fetchFn
    }
  };
}
export { createAgentServiceFoundation, AgentServiceCallbackAdapter };
