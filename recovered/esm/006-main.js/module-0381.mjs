// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/node/nativePolicyService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { AbstractPolicyService, init_policy2 } from "./module-0210.mjs";
import { Throttler, init_async } from "./module-0034.mjs";
import { MutableDisposable, init_lifecycle } from "./module-0018.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/policy/node/nativePolicyService.ts
var NativePolicyService;

var init_nativePolicyService = __esm({
  "src/vs/platform/policy/node/nativePolicyService.ts"() {
    init_policy2();
    init_async();
    init_lifecycle();
    init_log();
    NativePolicyService = class extends AbstractPolicyService {
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
  }
});
export { NativePolicyService, init_nativePolicyService };
