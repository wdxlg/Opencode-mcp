// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/meteredConnection/electron-main/meteredConnectionChannel.ts
import { __esm } from "./module-0000.mjs";
import { init_meteredConnectionIpc } from "./module-0207.mjs";


// src/vs/platform/meteredConnection/electron-main/meteredConnectionChannel.ts
var MeteredConnectionChannel;

var init_meteredConnectionChannel = __esm({
  "src/vs/platform/meteredConnection/electron-main/meteredConnectionChannel.ts"() {
    init_meteredConnectionIpc();
    MeteredConnectionChannel = class {
      constructor(service) {
        this.service = service;
      }
      listen(_, event) {
        switch (event) {
          case "OnDidChangeIsConnectionMetered" /* OnDidChangeIsConnectionMetered */:
            return this.service.onDidChangeIsConnectionMetered;
          default:
            throw new Error(`Event not found: ${event}`);
        }
      }
      async call(_, command, arg) {
        switch (command) {
          case "IsConnectionMetered" /* IsConnectionMetered */:
            return this.service.isConnectionMetered;
          case "SetIsBrowserConnectionMetered" /* SetIsBrowserConnectionMetered */:
            this.service.setIsBrowserConnectionMetered(arg);
            break;
          default:
            throw new Error(`Call not found: ${command}`);
        }
      }
    };
  }
});
export { MeteredConnectionChannel, init_meteredConnectionChannel };
