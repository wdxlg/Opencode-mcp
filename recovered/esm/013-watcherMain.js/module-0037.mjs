// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/files/node/watcher/watcherMain.js
// Original module marker: src/vs/base/parts/ipc/node/ipc.mp.ts
import { Emitter, Event } from "./module-0016.mjs";
import { VSBuffer } from "./module-0028.mjs";
import { IPCServer } from "./module-0031.mjs";
import { assertType } from "./module-0008.mjs";
import { isUtilityProcess } from "./module-0036.mjs";


// src/vs/base/parts/ipc/node/ipc.mp.ts
var Protocol = class {
  constructor(port) {
    this.port = port;
    this.onMessage = Event.fromNodeEventEmitter(this.port, "message", (e) => {
      if (e.data) {
        return VSBuffer.wrap(e.data);
      }
      return VSBuffer.alloc(0);
    });
    port.start();
  }
  send(message) {
    this.port.postMessage(message.buffer);
  }
  disconnect() {
    this.port.close();
  }
};

var Server2 = class _Server extends IPCServer {
  static getOnDidClientConnect(filter) {
    assertType(isUtilityProcess(process), "Electron Utility Process");
    const onCreateMessageChannel = new Emitter();
    process.parentPort.on("message", (e) => {
      if (filter?.handledClientConnection(e)) {
        return;
      }
      const port = e.ports.at(0);
      if (port) {
        onCreateMessageChannel.fire(port);
      }
    });
    return Event.map(onCreateMessageChannel.event, (port) => {
      const protocol = new Protocol(port);
      const result = {
        protocol,
        // Not part of the standard spec, but in Electron we get a `close` event
        // when the other side closes. We can use this to detect disconnects
        // (https://github.com/electron/electron/blob/11-x-y/docs/api/message-port-main.md#event-close)
        onDidClientDisconnect: Event.fromNodeEventEmitter(port, "close")
      };
      return result;
    });
  }
  constructor(filter) {
    super(_Server.getOnDidClientConnect(filter));
  }
};
export { Protocol, Server2 };
