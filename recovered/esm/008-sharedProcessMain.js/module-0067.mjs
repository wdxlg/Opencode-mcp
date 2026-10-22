// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/ipc/common/mainProcessService.ts
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/ipc/common/mainProcessService.ts
var IMainProcessService = createDecorator("mainProcessService");

var MainProcessService = class {
  constructor(server, router) {
    this.server = server;
    this.router = router;
  }
  getChannel(channelName) {
    return this.server.getChannel(channelName, this.router);
  }
  registerChannel(channelName, channel) {
    this.server.registerChannel(channelName, channel);
  }
};
export { IMainProcessService, MainProcessService };
