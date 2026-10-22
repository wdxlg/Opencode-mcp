// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/networkFilter/common/networkFilterService.ts
import { createDecorator } from "./module-0042.mjs";
import { Disposable } from "./module-0013.mjs";
import { LRUCache } from "./module-0010.mjs";
import { Emitter } from "./module-0018.mjs";
import { Schemas, matchesScheme } from "./module-0025.mjs";
import { extractDomainFromUri, isDomainAllowed } from "./module-0300.mjs";
import { localize } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";


// src/vs/platform/networkFilter/common/networkFilterService.ts
var IAgentNetworkFilterService = createDecorator("agentNetworkFilterService");

var AgentNetworkFilterService = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.networkFilterEnabled = false;
    this.allowedPatterns = [];
    this.deniedPatterns = [];
    this.domainCache = new LRUCache(100);
    this.onDidChangeEmitter = this._register(new Emitter());
    this.onDidChange = this.onDidChangeEmitter.event;
    this.readConfiguration();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.agent.networkFilter" /* NetworkFilter */) || e.affectsConfiguration("chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */) || e.affectsConfiguration("chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */)) {
        this.readConfiguration();
        this.onDidChangeEmitter.fire();
      }
    }));
  }
  readConfiguration() {
    const networkFilterEnabled = this.configurationService.getValue("chat.agent.networkFilter" /* NetworkFilter */) ?? false;
    this.networkFilterEnabled = networkFilterEnabled;
    this.allowedPatterns = this.configurationService.getValue("chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */) ?? [];
    this.deniedPatterns = this.configurationService.getValue("chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */) ?? [];
    this.domainCache.clear();
  }
  isUriAllowed(uri) {
    if (!this.shouldFilter()) {
      return true;
    }
    if (matchesScheme(uri, Schemas.file) || !uri.authority) {
      return true;
    }
    const domain = extractDomainFromUri(uri);
    if (!domain) {
      return !matchesScheme(uri, Schemas.http) && !matchesScheme(uri, Schemas.https);
    }
    let result = this.domainCache.get(domain);
    if (result === void 0) {
      result = isDomainAllowed(domain, this.allowedPatterns, this.deniedPatterns);
      this.domainCache.set(domain, result);
    }
    return result;
  }
  // Determines whether network filtering should be applied for a given request
  // based on the global network filter setting.
  shouldFilter() {
    return this.networkFilterEnabled;
  }
  formatError(uri) {
    const domain = extractDomainFromUri(uri);
    return localize(
      3177,
      null,
      domain ?? uri.authority,
      "chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */,
      "chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */
    );
  }
};

AgentNetworkFilterService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], AgentNetworkFilterService);
export { IAgentNetworkFilterService, AgentNetworkFilterService };
