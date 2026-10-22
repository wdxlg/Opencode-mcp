// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, DisposableMap, init_lifecycle } from "./module-0018.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { WindowUtilityProcess, init_utilityProcess } from "./module-0132.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { DeferredPromise, init_async } from "./module-0034.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";


// src/vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService.ts
var IUtilityProcessWorkerMainService, UtilityProcessWorkerMainService, UtilityProcessWorker;

var init_utilityProcessWorkerMainService = __esm({
  "src/vs/platform/utilityProcess/electron-main/utilityProcessWorkerMainService.ts"() {
    init_lifecycle();
    init_instantiation();
    init_log();
    init_windows();
    init_utilityProcess();
    init_telemetry();
    init_hash();
    init_event();
    init_async();
    init_lifecycleMainService();
    IUtilityProcessWorkerMainService = createDecorator("utilityProcessWorker");
    UtilityProcessWorkerMainService = class extends Disposable {
      constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
        super();
        this.logService = logService;
        this.windowsMainService = windowsMainService;
        this.telemetryService = telemetryService;
        this.lifecycleMainService = lifecycleMainService;
        this.workers = this._register(new DisposableMap());
      }
      async createWorker(configuration) {
        const workerLogId = `window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId}`;
        this.logService.trace(`[UtilityProcessWorker]: createWorker(${workerLogId})`);
        const workerId = this.hash(configuration);
        if (this.workers.has(workerId)) {
          this.logService.warn(`[UtilityProcessWorker]: createWorker() found an existing worker that will be terminated (${workerLogId})`);
          this.disposeWorker(configuration);
        }
        const worker = new UtilityProcessWorker(this.logService, this.windowsMainService, this.telemetryService, this.lifecycleMainService, configuration);
        if (!worker.spawn()) {
          return { reason: { code: 1, signal: "EINVALID" } };
        }
        this.workers.set(workerId, worker);
        const onDidTerminate = new DeferredPromise();
        Event.once(worker.onDidTerminate)((reason) => {
          if (reason.code === 0) {
            this.logService.trace(`[UtilityProcessWorker]: terminated normally with code ${reason.code}, signal: ${reason.signal}`);
          } else {
            this.logService.error(`[UtilityProcessWorker]: terminated unexpectedly with code ${reason.code}, signal: ${reason.signal}`);
          }
          onDidTerminate.complete({ reason });
          if (this.workers.get(workerId) === worker) {
            this.workers.deleteAndLeak(workerId);
          }
          worker.dispose();
        });
        return onDidTerminate.p;
      }
      hash(configuration) {
        return hash({
          moduleId: configuration.process.moduleId,
          windowId: configuration.reply.windowId
        });
      }
      async disposeWorker(configuration) {
        const workerId = this.hash(configuration);
        const worker = this.workers.get(workerId);
        if (!worker) {
          return;
        }
        this.logService.trace(`[UtilityProcessWorker]: disposeWorker(window: ${configuration.reply.windowId}, moduleId: ${configuration.process.moduleId})`);
        worker.kill();
      }
    };
    UtilityProcessWorkerMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, ITelemetryService),
      __decorateParam(3, ILifecycleMainService)
    ], UtilityProcessWorkerMainService);
    UtilityProcessWorker = class extends Disposable {
      constructor(logService, windowsMainService, telemetryService, lifecycleMainService, configuration) {
        super();
        this.windowsMainService = windowsMainService;
        this.configuration = configuration;
        this._onDidTerminate = this._register(new Emitter());
        this.onDidTerminate = this._onDidTerminate.event;
        this.utilityProcess = this._register(new WindowUtilityProcess(logService, windowsMainService, telemetryService, lifecycleMainService));
        this.registerListeners();
      }
      registerListeners() {
        this._register(this.utilityProcess.onExit((e) => this._onDidTerminate.fire({ code: e.code, signal: e.signal })));
        this._register(this.utilityProcess.onCrash((e) => this._onDidTerminate.fire({ code: e.code, signal: "ECRASH" })));
      }
      spawn() {
        const window2 = this.windowsMainService.getWindowById(this.configuration.reply.windowId);
        const windowPid = window2?.win?.webContents.getOSProcessId();
        return this.utilityProcess.start({
          type: this.configuration.process.type,
          name: this.configuration.process.name,
          entryPoint: this.configuration.process.moduleId,
          allowLoadingUnsignedLibraries: this.configuration.process.allowLoadingUnsignedLibraries,
          parentLifecycleBound: windowPid,
          windowLifecycleBound: true,
          correlationId: `${this.configuration.reply.windowId}`,
          responseWindowId: this.configuration.reply.windowId,
          responseChannel: this.configuration.reply.channel,
          responseNonce: this.configuration.reply.nonce
        });
      }
      kill() {
        this.utilityProcess.kill();
      }
    };
    UtilityProcessWorker = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, ITelemetryService),
      __decorateParam(3, ILifecycleMainService)
    ], UtilityProcessWorker);
  }
});
export { IUtilityProcessWorkerMainService, UtilityProcessWorkerMainService, UtilityProcessWorker, init_utilityProcessWorkerMainService };
