// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/sharedProcess/electron-main/sharedProcess.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { Barrier, DeferredPromise, init_async } from "./module-0034.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";
import { IPolicyService, init_policy2 } from "./module-0210.mjs";
import { ILoggerMainService, init_loggerService2 } from "./module-0213.mjs";
import { UtilityProcess, init_utilityProcess } from "./module-0132.mjs";
import { NullTelemetryService, init_telemetryUtils } from "./module-0215.mjs";
import { init_environmentService2, parseSharedProcessDebugPort } from "./module-0093.mjs";
import { assertReturnsDefined, init_types } from "./module-0016.mjs";
import { SharedProcessChannelConnection, SharedProcessLifecycle, SharedProcessRawConnection, init_sharedProcess } from "./module-0216.mjs";
import { Emitter, init_event } from "./module-0021.mjs";


// src/vs/platform/sharedProcess/electron-main/sharedProcess.ts
var SharedProcess;

var init_sharedProcess2 = __esm({
  "src/vs/platform/sharedProcess/electron-main/sharedProcess.ts"() {
    init_ipcMain();
    init_async();
    init_lifecycle();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_userDataProfile();
    init_policy2();
    init_loggerService2();
    init_utilityProcess();
    init_telemetryUtils();
    init_environmentService2();
    init_types();
    init_sharedProcess();
    init_event();
    SharedProcess = class extends Disposable {
      constructor(machineId2, sqmId, devDeviceId, environmentMainService, userDataProfilesService, lifecycleMainService, logService, loggerMainService, policyService) {
        super();
        this.machineId = machineId2;
        this.sqmId = sqmId;
        this.devDeviceId = devDeviceId;
        this.environmentMainService = environmentMainService;
        this.userDataProfilesService = userDataProfilesService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.loggerMainService = loggerMainService;
        this.policyService = policyService;
        this.firstWindowConnectionBarrier = new Barrier();
        this.utilityProcess = void 0;
        this.utilityProcessLogListener = void 0;
        this._onDidCrash = this._register(new Emitter());
        this.onDidCrash = this._onDidCrash.event;
        this._whenReady = void 0;
        this._whenIpcReady = void 0;
        this.registerListeners();
      }
      registerListeners() {
        validatedIpcMain.on(SharedProcessChannelConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, SharedProcessChannelConnection.response));
        validatedIpcMain.on(SharedProcessRawConnection.request, (e, nonce) => this.onWindowConnection(e, nonce, SharedProcessRawConnection.response));
        this._register(this.lifecycleMainService.onWillShutdown(() => this.onWillShutdown()));
      }
      async onWindowConnection(e, nonce, responseChannel) {
        this.logService.trace(`[SharedProcess] onWindowConnection for: ${responseChannel}`);
        if (!this.firstWindowConnectionBarrier.isOpen()) {
          this.firstWindowConnectionBarrier.open();
        }
        await this.whenReady();
        const port = await this.connect(responseChannel);
        if (e.sender.isDestroyed()) {
          return port.close();
        }
        e.sender.postMessage(responseChannel, nonce, [port]);
      }
      onWillShutdown() {
        this.logService.trace("[SharedProcess] onWillShutdown");
        this.utilityProcess?.postMessage(SharedProcessLifecycle.exit);
        this.utilityProcess = void 0;
      }
      whenReady() {
        if (!this._whenReady) {
          this._whenReady = (async () => {
            await this.whenIpcReady;
            const whenReady = new DeferredPromise();
            this.utilityProcess?.once(SharedProcessLifecycle.initDone, () => whenReady.complete());
            await whenReady.p;
            this.utilityProcessLogListener?.dispose();
            this.logService.trace("[SharedProcess] Overall ready");
          })();
        }
        return this._whenReady;
      }
      get whenIpcReady() {
        if (!this._whenIpcReady) {
          this._whenIpcReady = (async () => {
            await this.firstWindowConnectionBarrier.wait();
            this.createUtilityProcess();
            const sharedProcessIpcReady = new DeferredPromise();
            this.utilityProcess?.once(SharedProcessLifecycle.ipcReady, () => sharedProcessIpcReady.complete());
            await sharedProcessIpcReady.p;
            this.logService.trace("[SharedProcess] IPC ready");
          })();
        }
        return this._whenIpcReady;
      }
      createUtilityProcess() {
        this.utilityProcess = this._register(new UtilityProcess(this.logService, NullTelemetryService, this.lifecycleMainService));
        this.utilityProcessLogListener = this.utilityProcess.onMessage((e) => {
          const logValue = e;
          if (typeof logValue.warning === "string") {
            this.logService.warn(logValue.warning);
          } else if (typeof logValue.error === "string") {
            this.logService.error(logValue.error);
          }
        });
        const inspectParams = parseSharedProcessDebugPort(this.environmentMainService.args, this.environmentMainService.isBuilt);
        let execArgv = void 0;
        if (inspectParams.port) {
          execArgv = ["--nolazy", "--experimental-network-inspection"];
          if (inspectParams.break) {
            execArgv.push(`--inspect-brk=${inspectParams.port}`);
          } else {
            execArgv.push(`--inspect=${inspectParams.port}`);
          }
        }
        this.utilityProcess.start({
          type: "shared-process",
          name: "shared-process",
          entryPoint: "vs/code/electron-utility/sharedProcess/sharedProcessMain",
          payload: this.createSharedProcessConfiguration(),
          respondToAuthRequestsFromMainProcess: true,
          execArgv
        });
        this._register(this.utilityProcess.onCrash(() => this._onDidCrash.fire()));
      }
      createSharedProcessConfiguration() {
        return {
          machineId: this.machineId,
          sqmId: this.sqmId,
          devDeviceId: this.devDeviceId,
          codeCachePath: this.environmentMainService.codeCachePath,
          profiles: {
            home: this.userDataProfilesService.profilesHome,
            all: this.userDataProfilesService.profiles
          },
          args: this.environmentMainService.args,
          logLevel: this.loggerMainService.getLogLevel(),
          loggers: this.loggerMainService.getGlobalLoggers(),
          policiesData: this.policyService.serialize()
        };
      }
      async connect(payload) {
        await this.whenIpcReady;
        const utilityProcess2 = assertReturnsDefined(this.utilityProcess);
        return utilityProcess2.connect(payload);
      }
    };
    SharedProcess = __decorateClass([
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, IUserDataProfilesService),
      __decorateParam(5, ILifecycleMainService),
      __decorateParam(6, ILogService),
      __decorateParam(7, ILoggerMainService),
      __decorateParam(8, IPolicyService)
    ], SharedProcess);
  }
});
export { SharedProcess, init_sharedProcess2 };
