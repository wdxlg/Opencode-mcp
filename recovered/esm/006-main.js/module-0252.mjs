// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/policy/common/fileManagedSettingsIpc.ts
import { __esm } from "./module-0000.mjs";
import { init_event } from "./module-0021.mjs";
import { DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { init_objects } from "./module-0121.mjs";


// src/vs/platform/policy/common/fileManagedSettingsIpc.ts
var FileManagedSettingsChannel;

var init_fileManagedSettingsIpc = __esm({
  "src/vs/platform/policy/common/fileManagedSettingsIpc.ts"() {
    init_event();
    init_lifecycle();
    init_objects();
    FileManagedSettingsChannel = class {
      constructor(service) {
        this.service = service;
        this.disposables = new DisposableStore();
      }
      listen(_, event) {
        switch (event) {
          case "onDidChangeRawManagedSettings":
            return this.service.onDidChangeRawManagedSettings;
          case "onDidChangeManagedSettings":
            return this.service.onDidChangeManagedSettings;
        }
        throw new Error(`Event not found: ${event}`);
      }
      call(_, command) {
        switch (command) {
          case "getRawManagedSettings":
            return this.service.initialize().then(() => this.service.rawManagedSettings);
          case "getManagedSettings":
            return this.service.initialize().then(() => this.service.managedSettings);
        }
        throw new Error(`Call not found: ${command}`);
      }
      dispose() {
        this.disposables.dispose();
      }
    };
  }
});
export { FileManagedSettingsChannel, init_fileManagedSettingsIpc };
