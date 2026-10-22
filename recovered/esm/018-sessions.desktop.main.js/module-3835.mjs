// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/sharedProcess/electron-browser/sharedProcessService.ts
import { Disposable } from "./module-0012.mjs";
import { Barrier, timeout } from "./module-0036.mjs";
import { mark } from "./module-0506.mjs";
import { acquirePort } from "./module-3828.mjs";
import { SharedProcessChannelConnection, SharedProcessRawConnection } from "./module-3834.mjs";
import { Client2 } from "./module-3827.mjs";
import { getDelayedChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/sharedProcess/electron-browser/sharedProcessService.ts
var SharedProcessService = class extends Disposable {
  constructor(windowId, logService) {
    super();
    this.windowId = windowId;
    this.logService = logService;
    this.restoredBarrier = new Barrier();
    this.withSharedProcessConnection = this.connect();
  }
  async connect() {
    this.logService.trace("Renderer->SharedProcess#connect");
    await Promise.race([this.restoredBarrier.wait(), timeout(2e3)]);
    mark("code/willConnectSharedProcess");
    this.logService.trace("Renderer->SharedProcess#connect: before acquirePort");
    const port = await acquirePort(SharedProcessChannelConnection.request, SharedProcessChannelConnection.response);
    mark("code/didConnectSharedProcess");
    this.logService.trace("Renderer->SharedProcess#connect: connection established");
    return this._register(new Client2(port, `window:${this.windowId}`));
  }
  notifyRestored() {
    if (!this.restoredBarrier.isOpen()) {
      this.restoredBarrier.open();
    }
  }
  getChannel(channelName) {
    return getDelayedChannel(this.withSharedProcessConnection.then((connection) => connection.getChannel(channelName)));
  }
  registerChannel(channelName, channel) {
    this.withSharedProcessConnection.then((connection) => connection.registerChannel(channelName, channel));
  }
  async createRawConnection() {
    await this.withSharedProcessConnection;
    this.logService.trace("Renderer->SharedProcess#createRawConnection: before acquirePort");
    const port = await acquirePort(SharedProcessRawConnection.request, SharedProcessRawConnection.response);
    this.logService.trace("Renderer->SharedProcess#createRawConnection: connection established");
    return port;
  }
};

SharedProcessService = __decorateClass([
  __decorateParam(1, ILogService)
], SharedProcessService);
export { SharedProcessService };
