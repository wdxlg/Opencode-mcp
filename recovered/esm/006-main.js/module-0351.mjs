// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/networkFilter/common/networkFilterService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { LRUCache, init_map } from "./module-0014.mjs";
import { Schemas, init_network, matchesScheme } from "./module-0031.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { extractDomainFromUri, init_domainMatcher, isDomainAllowed } from "./module-0349.mjs";
import { init_settings2 } from "./module-0350.mjs";


// src/vs/platform/networkFilter/common/networkFilterService.ts
var IAgentNetworkFilterService, AgentNetworkFilterService;

var init_networkFilterService = __esm({
  "src/vs/platform/networkFilter/common/networkFilterService.ts"() {
    init_event();
    init_lifecycle();
    init_map();
    init_network();
    init_nls();
    init_configuration();
    init_instantiation();
    init_domainMatcher();
    init_settings2();
    IAgentNetworkFilterService = createDecorator("agentNetworkFilterService");
    AgentNetworkFilterService = class extends Disposable {
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
  }
});
export { IAgentNetworkFilterService, AgentNetworkFilterService, init_networkFilterService };
