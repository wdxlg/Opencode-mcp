// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostGitHubEndpointService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { agentHostCustomizationConfigSchema } from "./module-0105.mjs";
import { deriveGitHubEndpoints, gitHubCopilotResource, gitHubRepoResource } from "./module-0160.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostGitHubEndpointService.ts
var IAgentHostGitHubEndpointService = createDecorator("agentHostGitHubEndpointService");

var AgentHostGitHubEndpointService = class extends Disposable {
  constructor(_configurationService, _logService) {
    super();
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    const resolved = this._resolve();
    this._endpoints = resolved.endpoints;
    this._enterpriseUri = resolved.enterpriseUri;
    this._register(this._configurationService.onDidRootConfigChange(() => {
      const next = this._resolve();
      if (next.endpoints.apiBaseUri === this._endpoints.apiBaseUri && next.endpoints.graphQlUri === this._endpoints.graphQlUri && next.endpoints.oauthServer === this._endpoints.oauthServer) {
        return;
      }
      this._logService.info(`[AgentHost] GitHub endpoints changed (api=${next.endpoints.apiBaseUri})`);
      this._endpoints = next.endpoints;
      this._enterpriseUri = next.enterpriseUri;
      this._onDidChange.fire();
    }));
  }
  _resolve() {
    const enterpriseUri = this._configurationService.getRootValue(agentHostCustomizationConfigSchema, "githubEnterpriseUri" /* GithubEnterpriseUri */);
    return { endpoints: deriveGitHubEndpoints(enterpriseUri), enterpriseUri: enterpriseUri || void 0 };
  }
  getApiBaseUri() {
    return this._endpoints.apiBaseUri;
  }
  getGraphQlUri() {
    return this._endpoints.graphQlUri;
  }
  getEnterpriseHost() {
    return this._endpoints.enterpriseHost;
  }
  getEnterpriseUri() {
    return this._enterpriseUri;
  }
  getCopilotResource() {
    return gitHubCopilotResource(this._endpoints);
  }
  getRepoResource() {
    return gitHubRepoResource(this._endpoints);
  }
};

AgentHostGitHubEndpointService = __decorateClass([
  __decorateParam(0, IAgentConfigurationService),
  __decorateParam(1, ILogService)
], AgentHostGitHubEndpointService);
export { IAgentHostGitHubEndpointService, AgentHostGitHubEndpointService };
