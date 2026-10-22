// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/common/ipc.mp.ts
import { __esm } from "./module-0000.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { IPCClient, init_ipc } from "./module-0054.mjs";


// src/vs/base/parts/ipc/common/ipc.mp.ts
var Protocol3, Client2;

var init_ipc_mp = __esm({
  "src/vs/base/parts/ipc/common/ipc.mp.ts"() {
    init_buffer();
    init_event();
    init_ipc();
    Protocol3 = class {
      constructor(port) {
        this.port = port;
        const onMessage = Event.fromDOMEventEmitter(this.port, "message", (e) => e.data ? VSBuffer.wrap(e.data) : VSBuffer.alloc(0));
        this.onMessage = Event.filter(onMessage, (data) => data.byteLength > 0);
        port.start();
      }
      send(message) {
        this.port.postMessage(message.buffer);
      }
      disconnect() {
        this.port.close();
      }
    };
    Client2 = class extends IPCClient {
      constructor(port, clientId) {
        const protocol4 = new Protocol3(port);
        super(protocol4, clientId);
        this.protocol = protocol4;
      }
      dispose() {
        this.protocol.disconnect();
        super.dispose();
      }
    };
  }
});
export { Protocol3, Client2, init_ipc_mp };
