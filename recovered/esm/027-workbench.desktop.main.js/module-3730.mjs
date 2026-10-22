// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/ipc/common/ipc.mp.ts
import { Event2 } from "./module-0017.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IPCClient } from "./module-1230.mjs";


// src/vs/base/parts/ipc/common/ipc.mp.ts
var Protocol2 = class {
  constructor(port) {
    this.port = port;
    const onMessage = Event2.fromDOMEventEmitter(this.port, "message", (e) => e.data ? VSBuffer.wrap(e.data) : VSBuffer.alloc(0));
    this.onMessage = Event2.filter(onMessage, (data) => data.byteLength > 0);
    port.start();
  }
  send(message) {
    this.port.postMessage(message.buffer);
  }
  disconnect() {
    this.port.close();
  }
};

var Client2 = class extends IPCClient {
  constructor(port, clientId) {
    const protocol = new Protocol2(port);
    super(protocol, clientId);
    this.protocol = protocol;
  }
  dispose() {
    this.protocol.disconnect();
    super.dispose();
  }
};
export { Protocol2, Client2 };
