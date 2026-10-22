// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/electron-browser/userDataAutoSyncService.ts
import { Event2 } from "./module-0017.mjs";
import { IUserDataAutoSyncService, UserDataSyncError } from "./module-1696.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataSync/electron-browser/userDataAutoSyncService.ts
var UserDataAutoSyncService = class {
  get onError() {
    return Event2.map(this.channel.listen("onError"), (e) => UserDataSyncError.toUserDataSyncError(e));
  }
  constructor(sharedProcessService) {
    this.channel = sharedProcessService.getChannel("userDataAutoSync");
  }
  triggerSync(sources, options3) {
    return this.channel.call("triggerSync", [sources, options3]);
  }
  turnOn() {
    return this.channel.call("turnOn");
  }
  turnOff(everywhere) {
    return this.channel.call("turnOff", [everywhere]);
  }
};

UserDataAutoSyncService = __decorateClass([
  __decorateParam(0, ISharedProcessService)
], UserDataAutoSyncService);

registerSingleton(IUserDataAutoSyncService, UserDataAutoSyncService, 1 /* Delayed */);
export { UserDataAutoSyncService };
