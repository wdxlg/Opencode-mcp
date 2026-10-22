// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/utilityProcess/electron-main/utilityProcess.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { init_async, timeout } from "./module-0034.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { init_severity, severity_default } from "./module-0130.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { init_processes, removeDangerousEnvVariables } from "./module-0131.mjs";
import { deepClone, init_objects } from "./module-0121.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { getUNCHostAllowlist, init_unc, isUNCAccessRestrictionsDisabled } from "./module-0037.mjs";


// src/vs/platform/utilityProcess/electron-main/utilityProcess.ts
import { MessageChannelMain, app as app2, utilityProcess } from "electron";

import { StringDecoder } from "string_decoder";

function isWindowUtilityProcessConfiguration(config) {
  const candidate = config;
  return typeof candidate.responseWindowId === "number";
}

var UtilityProcess, WindowUtilityProcess;

var init_utilityProcess = __esm({
  "src/vs/platform/utilityProcess/electron-main/utilityProcess.ts"() {
    init_lifecycle();
    init_event();
    init_log();
    init_async();
    init_network();
    init_windows();
    init_severity();
    init_telemetry();
    init_lifecycleMainService();
    init_processes();
    init_objects();
    init_platform();
    init_unc();
    UtilityProcess = class extends Disposable {
      constructor(logService, telemetryService, lifecycleMainService) {
        super();
        this.logService = logService;
        this.telemetryService = telemetryService;
        this.lifecycleMainService = lifecycleMainService;
        this.id = String(++UtilityProcess.ID_COUNTER);
        this._onStdout = this._register(new Emitter());
        this.onStdout = this._onStdout.event;
        this._onStderr = this._register(new Emitter());
        this.onStderr = this._onStderr.event;
        this._onMessage = this._register(new Emitter());
        this.onMessage = this._onMessage.event;
        this._onSpawn = this._register(new Emitter());
        this.onSpawn = this._onSpawn.event;
        this._onExit = this._register(new Emitter());
        this.onExit = this._onExit.event;
        this._onCrash = this._register(new Emitter());
        this.onCrash = this._onCrash.event;
        this.process = void 0;
        this.processPid = void 0;
        this.configuration = void 0;
      }
      static {
        this.ID_COUNTER = 0;
      }
      static {
        this.all = /* @__PURE__ */ new Map();
      }
      static getAll() {
        return Array.from(UtilityProcess.all.values());
      }
      log(msg, severity) {
        let logMsg;
        if (this.configuration?.correlationId) {
          logMsg = `[UtilityProcess id: ${this.configuration?.correlationId}, type: ${this.configuration?.type}, pid: ${this.processPid ?? "<none>"}]: ${msg}`;
        } else {
          logMsg = `[UtilityProcess type: ${this.configuration?.type}, pid: ${this.processPid ?? "<none>"}]: ${msg}`;
        }
        switch (severity) {
          case severity_default.Error:
            this.logService.error(logMsg);
            break;
          case severity_default.Warning:
            this.logService.warn(logMsg);
            break;
          case severity_default.Info:
            this.logService.trace(logMsg);
            break;
        }
      }
      validateCanStart() {
        if (this.process) {
          this.log("Cannot start utility process because it is already running...", severity_default.Error);
          return false;
        }
        return true;
      }
      start(configuration) {
        const started = this.doStart(configuration);
        if (started && configuration.payload) {
          const posted = this.postMessage(configuration.payload);
          if (posted) {
            this.log("payload sent via postMessage()", severity_default.Info);
          }
        }
        return started;
      }
      doStart(configuration) {
        if (!this.validateCanStart()) {
          return false;
        }
        this.configuration = configuration;
        const serviceName = `${this.configuration.type}-${this.id}`;
        const modulePath = FileAccess.asFileUri("bootstrap-fork.js").fsPath;
        const args2 = this.configuration.args ?? [];
        const execArgv = [...this.configuration.execArgv ?? []];
        const allowLoadingUnsignedLibraries = this.configuration.allowLoadingUnsignedLibraries;
        const jsFlags = app2.commandLine.getSwitchValue("js-flags");
        if (jsFlags) {
          execArgv.push(`--js-flags=${jsFlags}`);
        }
        const respondToAuthRequestsFromMainProcess = this.configuration.respondToAuthRequestsFromMainProcess;
        const stdio = "pipe";
        const env2 = this.createEnv(configuration);
        this.log("creating new...", severity_default.Info);
        this.process = utilityProcess.fork(modulePath, args2, {
          serviceName,
          env: env2,
          execArgv,
          // !!! Add `--trace-warnings` for node.js tracing !!!
          allowLoadingUnsignedLibraries,
          respondToAuthRequestsFromMainProcess,
          stdio
        });
        this.registerListeners(this.process, this.configuration, serviceName);
        return true;
      }
      createEnv(configuration) {
        const env2 = configuration.env ? { ...configuration.env } : { ...deepClone(process.env) };
        env2["VSCODE_ESM_ENTRYPOINT"] = configuration.entryPoint;
        if (typeof configuration.parentLifecycleBound === "number") {
          env2["VSCODE_PARENT_PID"] = String(configuration.parentLifecycleBound);
        }
        env2["VSCODE_CRASH_REPORTER_PROCESS_TYPE"] = configuration.type;
        if (isWindows2) {
          if (isUNCAccessRestrictionsDisabled()) {
            env2["NODE_DISABLE_UNC_ACCESS_CHECKS"] = "1";
          } else {
            env2["NODE_UNC_HOST_ALLOWLIST"] = getUNCHostAllowlist().join("\\");
          }
        }
        removeDangerousEnvVariables(env2);
        for (const key of Object.keys(env2)) {
          env2[key] = String(env2[key]);
        }
        return env2;
      }
      registerListeners(process2, configuration, serviceName) {
        if (process2.stdout) {
          const stdoutDecoder = new StringDecoder("utf-8");
          this._register(Event.fromNodeEventEmitter(process2.stdout, "data")((chunk) => this._onStdout.fire(typeof chunk === "string" ? chunk : stdoutDecoder.write(chunk))));
        }
        if (process2.stderr) {
          const stderrDecoder = new StringDecoder("utf-8");
          this._register(Event.fromNodeEventEmitter(process2.stderr, "data")((chunk) => this._onStderr.fire(typeof chunk === "string" ? chunk : stderrDecoder.write(chunk))));
        }
        this._register(Event.fromNodeEventEmitter(process2, "message")((msg) => this._onMessage.fire(msg)));
        this._register(Event.fromNodeEventEmitter(process2, "spawn")(() => {
          this.processPid = process2.pid;
          if (typeof process2.pid === "number") {
            UtilityProcess.all.set(process2.pid, { pid: process2.pid, name: isWindowUtilityProcessConfiguration(configuration) ? `${configuration.name} [${configuration.responseWindowId}]` : configuration.name });
          }
          this.log("successfully created", severity_default.Info);
          this._onSpawn.fire(process2.pid);
        }));
        this._register(Event.fromNodeEventEmitter(process2, "exit")((code2) => {
          this.log(`received exit event with code ${code2}`, severity_default.Info);
          this._onExit.fire({ pid: this.processPid, code: code2, signal: "unknown" });
          this.onDidExitOrCrashOrKill();
        }));
        this._register(Event.fromNodeEventEmitter(app2, "child-process-gone", (event, details) => ({ event, details }))(({ details }) => {
          if (details.type === "Utility" && details.name === serviceName) {
            this.log(`crashed with code ${details.exitCode} and reason '${details.reason}'`, severity_default.Error);
            this.telemetryService.publicLog2("utilityprocesscrash", {
              type: configuration.type,
              reason: details.reason,
              code: details.exitCode
            });
            this._onCrash.fire({ pid: this.processPid, code: details.exitCode, reason: details.reason });
            this.onDidExitOrCrashOrKill();
          }
        }));
      }
      once(message, callback) {
        const disposable = this._register(this._onMessage.event((msg) => {
          if (msg === message) {
            disposable.dispose();
            callback();
          }
        }));
      }
      postMessage(message, transfer) {
        if (!this.process) {
          return false;
        }
        this.process.postMessage(message, transfer);
        return true;
      }
      connect(payload) {
        const { port1: outPort, port2: utilityProcessPort } = new MessageChannelMain();
        this.postMessage(payload, [utilityProcessPort]);
        return outPort;
      }
      enableInspectPort() {
        if (!this.process || typeof this.processPid !== "number") {
          return false;
        }
        this.log("enabling inspect port", severity_default.Info);
        const processExt = process;
        if (typeof processExt._debugProcess === "function") {
          processExt._debugProcess(this.processPid);
          return true;
        }
        return false;
      }
      kill() {
        if (!this.process) {
          return;
        }
        this.log("attempting to kill the process...", severity_default.Info);
        const killed = this.process.kill();
        if (killed) {
          this.log("successfully killed the process", severity_default.Info);
          this.onDidExitOrCrashOrKill();
        } else {
          this.log("unable to kill the process", severity_default.Warning);
        }
      }
      onDidExitOrCrashOrKill() {
        if (typeof this.processPid === "number") {
          UtilityProcess.all.delete(this.processPid);
        }
        this.process = void 0;
      }
      async waitForExit(maxWaitTimeMs) {
        if (!this.process) {
          return;
        }
        this.log("waiting to exit...", severity_default.Info);
        await Promise.race([Event.toPromise(this.onExit), timeout(maxWaitTimeMs)]);
        if (this.process) {
          this.log(`did not exit within ${maxWaitTimeMs}ms, will kill it now...`, severity_default.Info);
          this.kill();
        }
      }
    };
    UtilityProcess = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, ITelemetryService),
      __decorateParam(2, ILifecycleMainService)
    ], UtilityProcess);
    WindowUtilityProcess = class extends UtilityProcess {
      constructor(logService, windowsMainService, telemetryService, lifecycleMainService) {
        super(logService, telemetryService, lifecycleMainService);
        this.windowsMainService = windowsMainService;
      }
      start(configuration) {
        const responseWindow = this.windowsMainService.getWindowById(configuration.responseWindowId);
        if (!responseWindow?.win || responseWindow.win.isDestroyed() || responseWindow.win.webContents.isDestroyed()) {
          this.log("Refusing to start utility process because requesting window cannot be found or is destroyed...", severity_default.Error);
          return true;
        }
        const started = super.doStart(configuration);
        if (!started) {
          return false;
        }
        this.registerWindowListeners(responseWindow.win, configuration);
        const windowPort = this.connect(configuration.payload);
        responseWindow.win.webContents.postMessage(configuration.responseChannel, configuration.responseNonce, [windowPort]);
        return true;
      }
      registerWindowListeners(window2, configuration) {
        if (configuration.windowLifecycleBound) {
          const graceTime = configuration.windowLifecycleGraceTime;
          const terminate = graceTime && graceTime > 0 ? () => this.waitForExit(graceTime) : () => this.kill();
          this._register(Event.filter(this.lifecycleMainService.onWillLoadWindow, (e) => e.window.win === window2)(terminate));
          this._register(Event.fromNodeEventEmitter(window2, "closed")(terminate));
        }
      }
    };
    WindowUtilityProcess = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, ITelemetryService),
      __decorateParam(3, ILifecycleMainService)
    ], WindowUtilityProcess);
  }
});
export { isWindowUtilityProcessConfiguration, MessageChannelMain, app2, utilityProcess, StringDecoder, UtilityProcess, WindowUtilityProcess, init_utilityProcess };
