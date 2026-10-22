// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensions/electron-main/extensionHostStarter.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Promises, init_async } from "./module-0034.mjs";
import { canceled, init_errors } from "./module-0010.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { extensionHostGraceTimeMs, init_extensionHostStarter } from "./module-0169.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { WindowUtilityProcess, init_utilityProcess } from "./module-0132.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";


// src/vs/platform/extensions/electron-main/extensionHostStarter.ts
var ExtensionHostStarter;

var init_extensionHostStarter2 = __esm({
  "src/vs/platform/extensions/electron-main/extensionHostStarter.ts"() {
    init_async();
    init_errors();
    init_event();
    init_lifecycle();
    init_extensionHostStarter();
    init_lifecycleMainService();
    init_log();
    init_telemetry();
    init_utilityProcess();
    init_windows();
    init_configuration();
    ExtensionHostStarter = class extends Disposable {
      constructor(_logService, _lifecycleMainService, _windowsMainService, _telemetryService, _configurationService) {
        super();
        this._logService = _logService;
        this._lifecycleMainService = _lifecycleMainService;
        this._windowsMainService = _windowsMainService;
        this._telemetryService = _telemetryService;
        this._configurationService = _configurationService;
        this._extHosts = /* @__PURE__ */ new Map();
        this._shutdown = false;
        this._register(this._lifecycleMainService.onWillShutdown((e) => {
          this._shutdown = true;
          e.join("extHostStarter", this._waitForAllExit(6e3));
        }));
      }
      static {
        this._lastId = 0;
      }
      dispose() {
        super.dispose();
      }
      _getExtHost(id2) {
        const extHostProcess = this._extHosts.get(id2);
        if (!extHostProcess) {
          throw new Error(`Unknown extension host!`);
        }
        return extHostProcess;
      }
      onDynamicStdout(id2) {
        return this._getExtHost(id2).onStdout;
      }
      onDynamicStderr(id2) {
        return this._getExtHost(id2).onStderr;
      }
      onDynamicMessage(id2) {
        return this._getExtHost(id2).onMessage;
      }
      onDynamicExit(id2) {
        return this._getExtHost(id2).onExit;
      }
      async createExtensionHost() {
        if (this._shutdown) {
          throw canceled();
        }
        const id2 = String(++ExtensionHostStarter._lastId);
        const extHost = new WindowUtilityProcess(this._logService, this._windowsMainService, this._telemetryService, this._lifecycleMainService);
        this._extHosts.set(id2, extHost);
        const disposable = extHost.onExit(({ pid, code: code2, signal }) => {
          disposable.dispose();
          this._logService.info(`Extension host with pid ${pid} exited with code: ${code2}, signal: ${signal}.`);
          setTimeout(() => {
            extHost.dispose();
            this._extHosts.delete(id2);
          });
          setTimeout(() => {
            try {
              process.kill(pid, 0);
              this._logService.error(`Extension host with pid ${pid} still exists, forcefully killing it...`);
              process.kill(pid);
            } catch (er) {
            }
          }, 1e3);
        });
        return { id: id2 };
      }
      async start(id2, opts) {
        if (this._shutdown) {
          throw canceled();
        }
        const extHost = this._getExtHost(id2);
        const args2 = ["--skipWorkspaceStorageLock"];
        if (this._configurationService.getValue("extensions.supportNodeGlobalNavigator")) {
          args2.push("--supportGlobalNavigator");
        }
        extHost.start({
          ...opts,
          type: "extensionHost",
          name: "extension-host",
          entryPoint: "vs/workbench/api/node/extensionHostProcess",
          args: args2,
          execArgv: opts.execArgv,
          allowLoadingUnsignedLibraries: true,
          respondToAuthRequestsFromMainProcess: true,
          windowLifecycleBound: true,
          windowLifecycleGraceTime: extensionHostGraceTimeMs,
          correlationId: id2
        });
        const pid = await Event.toPromise(extHost.onSpawn);
        return { pid };
      }
      async enableInspectPort(id2) {
        if (this._shutdown) {
          throw canceled();
        }
        const extHostProcess = this._extHosts.get(id2);
        if (!extHostProcess) {
          return false;
        }
        return extHostProcess.enableInspectPort();
      }
      async kill(id2) {
        if (this._shutdown) {
          throw canceled();
        }
        const extHostProcess = this._extHosts.get(id2);
        if (!extHostProcess) {
          return;
        }
        extHostProcess.kill();
      }
      async waitForExit(id2, maxWaitTimeMs) {
        if (this._shutdown) {
          throw canceled();
        }
        const extHostProcess = this._extHosts.get(id2);
        if (!extHostProcess) {
          return;
        }
        await extHostProcess.waitForExit(maxWaitTimeMs);
      }
      async _killAllNow() {
        for (const [, extHost] of this._extHosts) {
          extHost.kill();
        }
      }
      async _waitForAllExit(maxWaitTimeMs) {
        const exitPromises = [];
        for (const [, extHost] of this._extHosts) {
          exitPromises.push(extHost.waitForExit(maxWaitTimeMs));
        }
        return Promises.settled(exitPromises).then(() => {
        });
      }
    };
    ExtensionHostStarter = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, ILifecycleMainService),
      __decorateParam(2, IWindowsMainService),
      __decorateParam(3, ITelemetryService),
      __decorateParam(4, IConfigurationService)
    ], ExtensionHostStarter);
  }
});
export { ExtensionHostStarter, init_extensionHostStarter2 };
