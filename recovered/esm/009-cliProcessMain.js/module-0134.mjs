// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/policy/node/nativePolicyService.ts
import { AbstractPolicyService } from "./module-0050.mjs";
import { Throttler } from "./module-0028.mjs";
import { MutableDisposable } from "./module-0011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0049.mjs";


// src/vs/platform/policy/node/nativePolicyService.ts
var NativePolicyService = class extends AbstractPolicyService {
  constructor(logService, productName) {
    super();
    this.logService = logService;
    this.productName = productName;
    this.throttler = this._register(new Throttler());
    this.watcher = this._register(new MutableDisposable());
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    this.logService.trace(`NativePolicyService#_updatePolicyDefinitions - Found ${Object.keys(policyDefinitions).length} policy definitions`);
    const { createWatcher } = await import("@vscode/policy-watcher");
    await this.throttler.queue(() => new Promise((c, e) => {
      try {
        this.logService.trace(`Creating watcher for productName ${this.productName}`);
        this.watcher.value = createWatcher(this.productName, policyDefinitions, (update) => {
          this._onDidPolicyChange(update);
          c();
        });
      } catch (err) {
        this.logService.error(`NativePolicyService#_updatePolicyDefinitions - Error creating watcher:`, err);
        e(err);
      }
    }));
  }
  _onDidPolicyChange(update) {
    this.logService.trace(`NativePolicyService#_onDidPolicyChange - Updated policy values: ${JSON.stringify(update)}`);
    for (const key in update) {
      const value = update[key];
      if (value === void 0) {
        this.policies.delete(key);
      } else {
        this.policies.set(key, value);
      }
    }
    this._onDidChange.fire(Object.keys(update));
  }
};

NativePolicyService = __decorateClass([
  __decorateParam(0, ILogService)
], NativePolicyService);
export { NativePolicyService };
