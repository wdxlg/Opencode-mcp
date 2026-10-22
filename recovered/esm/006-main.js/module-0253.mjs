// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/policyIpc.ts
import { __esm } from "./module-0000.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { init_policy2 } from "./module-0210.mjs";


// src/vs/platform/policy/common/policyIpc.ts
var PolicyChannel;

var init_policyIpc = __esm({
  "src/vs/platform/policy/common/policyIpc.ts"() {
    init_event();
    init_lifecycle();
    init_policy2();
    PolicyChannel = class {
      constructor(service) {
        this.service = service;
        this.disposables = new DisposableStore();
        this.onDidChangeEvent = Event.map(
          this.service.onDidChange,
          (names) => names.reduce((r, name) => ({ ...r, [name]: this.service.getPolicyValue(name) ?? null }), {}),
          this.disposables
        );
      }
      listen(_, event) {
        switch (event) {
          case "onDidChange":
            return this.onDidChangeEvent;
        }
        throw new Error(`Event not found: ${event}`);
      }
      call(_, command, arg) {
        switch (command) {
          case "updatePolicyDefinitions":
            return this.service.updatePolicyDefinitions(arg);
        }
        throw new Error(`Call not found: ${command}`);
      }
      dispose() {
        this.disposables.dispose();
      }
    };
  }
});
export { PolicyChannel, init_policyIpc };
