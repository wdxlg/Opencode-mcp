// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/lifecycle/node/sharedProcessLifecycleService.ts
import { createDecorator } from "./module-0042.mjs";
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/lifecycle/node/sharedProcessLifecycleService.ts
var ISharedProcessLifecycleService = createDecorator("sharedProcessLifecycleService");

var SharedProcessLifecycleService = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
  }
  fireOnWillShutdown() {
    this.logService.trace("Lifecycle#onWillShutdown.fire()");
    this._onWillShutdown.fire();
  }
};

SharedProcessLifecycleService = __decorateClass([
  __decorateParam(0, ILogService)
], SharedProcessLifecycleService);
export { ISharedProcessLifecycleService, SharedProcessLifecycleService };
