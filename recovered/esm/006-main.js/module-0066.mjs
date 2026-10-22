// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/electron-main/ipc.mp.ts
import { __esm } from "./module-0000.mjs";
import { init_ipcMain } from "./module-0059.mjs";
import { init_event } from "./module-0021.mjs";
import { init_uuid } from "./module-0055.mjs";
import { Client2, init_ipc_mp } from "./module-0065.mjs";


// src/vs/base/parts/ipc/electron-main/ipc.mp.ts
var Client3;

var init_ipc_mp2 = __esm({
  "src/vs/base/parts/ipc/electron-main/ipc.mp.ts"() {
    init_ipcMain();
    init_event();
    init_uuid();
    init_ipc_mp();
    Client3 = class extends Client2 {
      /**
       * @param clientId a way to uniquely identify this client among
       * other clients. this is important for routing because every
       * client can also be a server
       */
      constructor(port, clientId) {
        super({
          addEventListener: (type3, listener) => port.addListener(type3, listener),
          removeEventListener: (type3, listener) => port.removeListener(type3, listener),
          postMessage: (message) => port.postMessage(message),
          start: () => port.start(),
          close: () => port.close()
        }, clientId);
      }
    };
  }
});
export { Client3, init_ipc_mp2 };
