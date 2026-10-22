// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/terminal/electron-main/electronPtyHostStarter.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { init_environmentService2, parsePtyHostDebugPort } from "./module-0093.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { NullTelemetryService, init_telemetryUtils } from "./module-0215.mjs";
import { init_terminal } from "./module-0272.mjs";
import { UtilityProcess, init_utilityProcess } from "./module-0132.mjs";
import { Client3, init_ipc_mp2 } from "./module-0066.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { Disposable, DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { deepClone, init_objects } from "./module-0121.mjs";
import { init_types, isNumber } from "./module-0016.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { Schemas, init_network } from "./module-0031.mjs";


// src/vs/platform/terminal/electron-main/electronPtyHostStarter.ts
var ElectronPtyHostStarter;

var init_electronPtyHostStarter = __esm({
  "src/vs/platform/terminal/electron-main/electronPtyHostStarter.ts"() {
    init_environmentMainService();
    init_environmentService2();
    init_lifecycleMainService();
    init_log();
    init_telemetryUtils();
    init_terminal();
    init_utilityProcess();
    init_ipc_mp2();
    init_ipcMain();
    init_lifecycle();
    init_event();
    init_objects();
    init_types();
    init_configuration();
    init_network();
    ElectronPtyHostStarter = class extends Disposable {
      constructor(_reconnectConstants, _configurationService, _environmentMainService, _lifecycleMainService, _logService) {
        super();
        this._reconnectConstants = _reconnectConstants;
        this._configurationService = _configurationService;
        this._environmentMainService = _environmentMainService;
        this._lifecycleMainService = _lifecycleMainService;
        this._logService = _logService;
        this.utilityProcess = void 0;
        this._onRequestConnection = this._register(new Emitter());
        this.onRequestConnection = this._onRequestConnection.event;
        this._onWillShutdown = this._register(new Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        this._register(this._lifecycleMainService.onWillShutdown(() => this._onWillShutdown.fire()));
        validatedIpcMain.on("vscode:createPtyHostMessageChannel", (e, nonce) => this._onWindowConnection(e, nonce));
        this._register(toDisposable(() => {
          validatedIpcMain.removeHandler("vscode:createPtyHostMessageChannel");
        }));
      }
      start() {
        this.utilityProcess = new UtilityProcess(this._logService, NullTelemetryService, this._lifecycleMainService);
        const inspectParams = parsePtyHostDebugPort(this._environmentMainService.args, this._environmentMainService.isBuilt);
        const execArgv = inspectParams.port ? [
          "--nolazy",
          `--inspect${inspectParams.break ? "-brk" : ""}=${inspectParams.port}`
        ] : void 0;
        this.utilityProcess.start({
          type: "ptyHost",
          name: "pty-host",
          entryPoint: "vs/platform/terminal/node/ptyHostMain",
          execArgv,
          args: ["--logsPath", this._environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath],
          env: this._createPtyHostConfiguration()
        });
        const port = this.utilityProcess.connect();
        const client = new Client3(port, "ptyHost");
        const store = new DisposableStore();
        store.add(client);
        store.add(toDisposable(() => {
          this.utilityProcess?.kill();
          this.utilityProcess?.dispose();
          this.utilityProcess = void 0;
        }));
        return {
          client,
          store,
          onDidProcessExit: this.utilityProcess.onExit
        };
      }
      _createPtyHostConfiguration() {
        this._environmentMainService.unsetSnapExportedVariables();
        const config = {
          ...deepClone(process.env),
          VSCODE_ESM_ENTRYPOINT: "vs/platform/terminal/node/ptyHostMain",
          VSCODE_PIPE_LOGGING: "true",
          VSCODE_VERBOSE_LOGGING: "true",
          // transmit console logs from server to client,
          VSCODE_RECONNECT_GRACE_TIME: String(this._reconnectConstants.graceTime),
          VSCODE_RECONNECT_SHORT_GRACE_TIME: String(this._reconnectConstants.shortGraceTime),
          VSCODE_RECONNECT_SCROLLBACK: String(this._reconnectConstants.scrollback)
        };
        const simulatedLatency = this._configurationService.getValue("terminal.integrated.developer.ptyHost.latency" /* DeveloperPtyHostLatency */);
        if (simulatedLatency && isNumber(simulatedLatency)) {
          config.VSCODE_LATENCY = String(simulatedLatency);
        }
        const startupDelay = this._configurationService.getValue("terminal.integrated.developer.ptyHost.startupDelay" /* DeveloperPtyHostStartupDelay */);
        if (startupDelay && isNumber(startupDelay)) {
          config.VSCODE_STARTUP_DELAY = String(startupDelay);
        }
        this._environmentMainService.restoreSnapExportedVariables();
        return config;
      }
      _onWindowConnection(e, nonce) {
        this._onRequestConnection.fire();
        const port = this.utilityProcess.connect();
        if (e.sender.isDestroyed()) {
          port.close();
          return;
        }
        e.sender.postMessage("vscode:createPtyHostMessageChannelResult", nonce, [port]);
      }
    };
    ElectronPtyHostStarter = __decorateClass([
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, IEnvironmentMainService),
      __decorateParam(3, ILifecycleMainService),
      __decorateParam(4, ILogService)
    ], ElectronPtyHostStarter);
  }
});
export { ElectronPtyHostStarter, init_electronPtyHostStarter };
