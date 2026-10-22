// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/ipc/electron-browser/mainProcessService.ts
import { Disposable } from "./module-0012.mjs";
import { Client3 } from "./module-3759.mjs";


// src/vs/platform/ipc/electron-browser/mainProcessService.ts
var ElectronIPCMainProcessService = class extends Disposable {
  constructor(windowId) {
    super();
    this.mainProcessConnection = this._register(new Client3(`window:${windowId}`));
  }
  getChannel(channelName) {
    return this.mainProcessConnection.getChannel(channelName);
  }
  registerChannel(channelName, channel) {
    this.mainProcessConnection.registerChannel(channelName, channel);
  }
};
export { ElectronIPCMainProcessService };
