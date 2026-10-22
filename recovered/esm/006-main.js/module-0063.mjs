// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/common/ipc.electron.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/parts/ipc/common/ipc.electron.ts
var Protocol2;

var init_ipc_electron = __esm({
  "src/vs/base/parts/ipc/common/ipc.electron.ts"() {
    Protocol2 = class {
      constructor(sender, onMessage) {
        this.sender = sender;
        this.onMessage = onMessage;
      }
      send(message) {
        try {
          this.sender.send("vscode:message", message.buffer);
        } catch (e) {
        }
      }
      disconnect() {
        this.sender.send("vscode:disconnect", null);
      }
    };
  }
});
export { Protocol2, init_ipc_electron };
