// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/policy/common/multiplexPolicyService.ts
import { AbstractPolicyService } from "./module-0957.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/policy/common/multiplexPolicyService.ts
var MultiplexPolicyService = class extends AbstractPolicyService {
  constructor(policyServices, logService) {
    super();
    this.policyServices = policyServices;
    this.logService = logService;
    this.updatePolicies();
    this._register(Event2.any(...this.policyServices.map((service) => service.onDidChange))((names) => {
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
      const definitions3 = service.policyDefinitions;
      for (const name in definitions3) {
        const value2 = service.getPolicyValue(name);
        this.policyDefinitions[name] = definitions3[name];
        if (value2 !== void 0) {
          updated.push(name);
          this.updatePolicyValue(name, value2, service.getPolicyValueSource(name));
        }
      }
    }
    const changed = /* @__PURE__ */ new Set();
    for (const key3 of updated) {
      if (changed.has(key3)) {
        this.logService.warn(`MultiplexPolicyService#_updatePolicyDefinitions - Found overlapping keys in policy services: ${key3}`);
      }
      changed.add(key3);
    }
  }
};

MultiplexPolicyService = __decorateClass([
  __decorateParam(1, ILogService)
], MultiplexPolicyService);
export { MultiplexPolicyService };
