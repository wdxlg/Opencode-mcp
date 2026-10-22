// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/ipc/electron-browser/ipc.electron.ts
import { IPCClient } from "./module-1230.mjs";
import { Event2 } from "./module-0017.mjs";
import { ipcRenderer } from "./module-3724.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { Protocol3 } from "./module-3758.mjs";


// src/vs/base/parts/ipc/electron-browser/ipc.electron.ts
var Client3 = class _Client extends IPCClient {
  static createProtocol() {
    const onMessage = Event2.fromNodeEventEmitter(ipcRenderer, "vscode:message", (_, message) => VSBuffer.wrap(message));
    ipcRenderer.send("vscode:hello");
    return new Protocol3(ipcRenderer, onMessage);
  }
  constructor(id2) {
    const protocol = _Client.createProtocol();
    super(protocol, id2);
    this.protocol = protocol;
  }
  dispose() {
    this.protocol.disconnect();
    super.dispose();
  }
};
export { Client3 };
