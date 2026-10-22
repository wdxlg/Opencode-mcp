// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/policy/common/policyIpc.ts
import { AbstractPolicyService } from "./module-0076.mjs";


// src/vs/platform/policy/common/policyIpc.ts
var PolicyChannelClient = class extends AbstractPolicyService {
  constructor(policiesData, channel) {
    super();
    this.channel = channel;
    for (const name in policiesData) {
      const { definition, value } = policiesData[name];
      this.policyDefinitions[name] = definition;
      if (value !== void 0) {
        this.policies.set(name, value);
      }
    }
    this.channel.listen("onDidChange")((policies) => {
      for (const name in policies) {
        const value = policies[name];
        if (value === null) {
          this.policies.delete(name);
        } else {
          this.policies.set(name, value);
        }
      }
      this._onDidChange.fire(Object.keys(policies));
    });
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    const result = await this.channel.call("updatePolicyDefinitions", policyDefinitions);
    for (const name in result) {
      this.policies.set(name, result[name]);
    }
  }
};
export { PolicyChannelClient };
