// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/multiplexPolicyService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { AbstractPolicyService, init_policy2 } from "./module-0210.mjs";


// src/vs/platform/policy/common/multiplexPolicyService.ts
var MultiplexPolicyService;

var init_multiplexPolicyService = __esm({
  "src/vs/platform/policy/common/multiplexPolicyService.ts"() {
    init_event();
    init_log();
    init_policy2();
    MultiplexPolicyService = class extends AbstractPolicyService {
      constructor(policyServices, logService) {
        super();
        this.policyServices = policyServices;
        this.logService = logService;
        this.updatePolicies();
        this._register(Event.any(...this.policyServices.map((service) => service.onDidChange))((names) => {
          this.updatePolicies();
          this._onDidChange.fire(names);
        }));
      }
      async updatePolicyDefinitions(policyDefinitions) {
        await this._updatePolicyDefinitions(policyDefinitions);
        return this.getPolicyValues();
      }
      async _updatePolicyDefinitions(policyDefinitions) {
        await Promise.all(this.policyServices.map((service) => service.updatePolicyDefinitions(policyDefinitions)));
        this.updatePolicies();
      }
      updatePolicies() {
        this.clearPolicyValues();
        const updated = [];
        for (const service of this.policyServices) {
          const definitions = service.policyDefinitions;
          for (const name in definitions) {
            const value = service.getPolicyValue(name);
            this.policyDefinitions[name] = definitions[name];
            if (value !== void 0) {
              updated.push(name);
              this.updatePolicyValue(name, value, service.getPolicyValueSource(name));
            }
          }
        }
        const changed = /* @__PURE__ */ new Set();
        for (const key of updated) {
          if (changed.has(key)) {
            this.logService.warn(`MultiplexPolicyService#_updatePolicyDefinitions - Found overlapping keys in policy services: ${key}`);
          }
          changed.add(key);
        }
      }
    };
    MultiplexPolicyService = __decorateClass([
      __decorateParam(1, ILogService)
    ], MultiplexPolicyService);
  }
});
export { MultiplexPolicyService, init_multiplexPolicyService };
