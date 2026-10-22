// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/nativeManagedSettingsIpc.ts
import { __esm } from "./module-0000.mjs";
import { init_errors } from "./module-0010.mjs";
import { init_event } from "./module-0021.mjs";
import { DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { init_objects } from "./module-0121.mjs";


// src/vs/platform/policy/common/nativeManagedSettingsIpc.ts
var NativeManagedSettingsChannel;

var init_nativeManagedSettingsIpc = __esm({
  "src/vs/platform/policy/common/nativeManagedSettingsIpc.ts"() {
    init_errors();
    init_event();
    init_lifecycle();
    init_objects();
    NativeManagedSettingsChannel = class {
      constructor(service) {
        this.service = service;
        this.disposables = new DisposableStore();
      }
      listen(_, event) {
        switch (event) {
          case "onDidChangeManagedSettings":
            return this.service.onDidChangeManagedSettings;
        }
        throw new Error(`Event not found: ${event}`);
      }
      call(_, command, arg) {
        switch (command) {
          case "getManagedSettings":
            return this.service.initialize();
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
export { NativeManagedSettingsChannel, init_nativeManagedSettingsIpc };
