// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/policy/common/policyIpc.ts
import { AbstractPolicyService } from "./module-0957.mjs";


// src/vs/platform/policy/common/policyIpc.ts
var PolicyChannelClient = class extends AbstractPolicyService {
  constructor(policiesData, channel) {
    super();
    this.channel = channel;
    for (const name in policiesData) {
      const { definition, value: value2 } = policiesData[name];
      this.policyDefinitions[name] = definition;
      if (value2 !== void 0) {
        this.policies.set(name, value2);
      }
    }
    this.channel.listen("onDidChange")((policies) => {
      for (const name in policies) {
        const value2 = policies[name];
        if (value2 === null) {
          this.policies.delete(name);
        } else {
          this.policies.set(name, value2);
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
