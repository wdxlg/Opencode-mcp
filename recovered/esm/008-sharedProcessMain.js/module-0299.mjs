// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/browserView/node/playwrightChannel.ts
import { Disposable, DisposableMap } from "./module-0013.mjs";
import { BrowserViewGroupRemoteService } from "./module-0296.mjs";
import { PlaywrightService } from "./module-0298.mjs";


// src/vs/platform/browserView/node/playwrightChannel.ts
var PlaywrightChannel = class extends Disposable {
  constructor(ipcServer, mainProcessService, logService, agentNetworkFilterService, telemetryService) {
    super();
    this.logService = logService;
    this.agentNetworkFilterService = agentNetworkFilterService;
    this.telemetryService = telemetryService;
    this._instances = this._register(new DisposableMap());
    this.browserViewGroupRemoteService = new BrowserViewGroupRemoteService(mainProcessService);
    this._register(ipcServer.onDidRemoveConnection((c) => {
      this._instances.deleteAndDispose(c.ctx);
    }));
  }
  listen(ctx, event) {
    const instance = this._instances.get(ctx);
    if (!instance) {
      throw new Error(`Window not initialized for context: ${ctx}`);
    }
    const source = instance[event];
    if (typeof source !== "function") {
      throw new Error(`Event not found: ${event}`);
    }
    return source;
  }
  call(ctx, command, arg) {
    if (command === "__initialize") {
      if (!isPlaywrightServiceInitializeOptions(arg)) {
        throw new Error("Invalid argument for __initialize: expected a window ID");
      }
      if (!this._instances.has(ctx)) {
        this._instances.set(ctx, new PlaywrightService(arg.windowId, this.browserViewGroupRemoteService, this.logService, this.agentNetworkFilterService, this.telemetryService));
      }
      return Promise.resolve(void 0);
    }
    const instance = this._instances.get(ctx);
    if (!instance) {
      throw new Error(`Window not initialized for context: ${ctx}`);
    }
    const target = instance[command];
    if (typeof target !== "function") {
      throw new Error(`Method not found: ${command}`);
    }
    const methodArgs = Array.isArray(arg) ? arg : [];
    let res = target.apply(instance, methodArgs);
    if (!(res instanceof Promise)) {
      res = Promise.resolve(res);
    }
    return res;
  }
};

function isPlaywrightServiceInitializeOptions(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value;
  return typeof candidate.windowId === "number";
}
export { isPlaywrightServiceInitializeOptions, PlaywrightChannel };
