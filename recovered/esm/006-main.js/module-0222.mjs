// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/common/updateIpc.ts
import { __esm } from "./module-0000.mjs";
import { init_event } from "./module-0021.mjs";
import { init_lifecycle } from "./module-0018.mjs";
import { init_update } from "./module-0201.mjs";


// src/vs/platform/update/common/updateIpc.ts
var UpdateChannel;

var init_updateIpc = __esm({
  "src/vs/platform/update/common/updateIpc.ts"() {
    init_event();
    init_lifecycle();
    init_update();
    UpdateChannel = class {
      constructor(service) {
        this.service = service;
      }
      listen(_, event) {
        switch (event) {
          case "onStateChange":
            return this.service.onStateChange;
        }
        throw new Error(`Event not found: ${event}`);
      }
      call(_, command, arg) {
        switch (command) {
          case "checkForUpdates":
            return this.service.checkForUpdates(arg);
          case "downloadUpdate":
            return this.service.downloadUpdate(arg);
          case "applyUpdate":
            return this.service.applyUpdate();
          case "quitAndInstall":
            return this.service.quitAndInstall();
          case "_getInitialState":
            return Promise.resolve(this.service.state);
          case "isLatestVersion":
            return this.service.isLatestVersion();
          case "_applySpecificUpdate":
            return this.service._applySpecificUpdate(arg);
          case "setInternalOrg":
            return this.service.setInternalOrg(arg);
        }
        throw new Error(`Call not found: ${command}`);
      }
    };
  }
});
export { UpdateChannel, init_updateIpc };
