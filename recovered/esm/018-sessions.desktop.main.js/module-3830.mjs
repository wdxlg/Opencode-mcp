// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Barrier, timeout } from "./module-0036.mjs";
import { ipcUtilityProcessWorkerChannelName } from "./module-3829.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { generateUuid } from "./module-0190.mjs";
import { acquirePort } from "./module-3828.mjs";
import { Client2 } from "./module-3827.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMainProcessService } from "./module-3825.mjs";


// src/vs/workbench/services/utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.ts
var IUtilityProcessWorkerWorkbenchService = createDecorator("utilityProcessWorkerWorkbenchService");

var UtilityProcessWorkerWorkbenchService = class extends Disposable {
  constructor(windowId, logService, mainProcessService) {
    super();
    this.windowId = windowId;
    this.logService = logService;
    this.mainProcessService = mainProcessService;
    this._utilityProcessWorkerService = void 0;
    this.restoredBarrier = new Barrier();
  }
  get utilityProcessWorkerService() {
    if (!this._utilityProcessWorkerService) {
      const channel = this.mainProcessService.getChannel(ipcUtilityProcessWorkerChannelName);
      this._utilityProcessWorkerService = ProxyChannel.toService(channel);
    }
    return this._utilityProcessWorkerService;
  }
  async createWorker(process3) {
    this.logService.trace("Renderer->UtilityProcess#createWorker");
    await Promise.race([this.restoredBarrier.wait(), timeout(2e3)]);
    const nonce = generateUuid();
    const responseChannel = "vscode:createUtilityProcessWorkerMessageChannelResult";
    const portPromise = acquirePort(void 0, responseChannel, nonce);
    const onDidTerminate = this.utilityProcessWorkerService.createWorker({
      process: process3,
      reply: { windowId: this.windowId, channel: responseChannel, nonce }
    });
    const disposables = new DisposableStore();
    disposables.add(toDisposable(() => {
      this.logService.trace("Renderer->UtilityProcess#disposeWorker", process3);
      this.utilityProcessWorkerService.disposeWorker({
        process: process3,
        reply: { windowId: this.windowId }
      });
    }));
    const port = await portPromise;
    const client = disposables.add(new Client2(port, `window:${this.windowId},module:${process3.moduleId}`));
    this.logService.trace("Renderer->UtilityProcess#createWorkerChannel: connection established");
    onDidTerminate.then(({ reason }) => {
      if (reason?.code === 0) {
        this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
      } else {
        this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason?.code}, signal: ${reason?.signal}`);
      }
    });
    return { client, onDidTerminate, dispose: () => disposables.dispose() };
  }
  notifyRestored() {
    if (!this.restoredBarrier.isOpen()) {
      this.restoredBarrier.open();
    }
  }
};

UtilityProcessWorkerWorkbenchService = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IMainProcessService)
], UtilityProcessWorkerWorkbenchService);
export { IUtilityProcessWorkerWorkbenchService, UtilityProcessWorkerWorkbenchService };
