// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/node/extensionLifecycle.ts
import { Disposable } from "./module-0011.mjs";
import { Limiter } from "./module-0028.mjs";
import { Promises2 } from "./module-0093.mjs";
import { Schemas } from "./module-0025.mjs";
import { join } from "./module-0019.mjs";
import { toErrorMessage } from "./module-0029.mjs";
import { Event } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfilesService } from "./module-0080.mjs";
import { ILogService } from "./module-0049.mjs";


// src/vs/platform/extensionManagement/node/extensionLifecycle.ts
import { fork } from "child_process";

var ExtensionsLifecycle = class extends Disposable {
  // Run max 5 processes in parallel
  constructor(userDataProfilesService, logService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.logService = logService;
    this.processesLimiter = new Limiter(5);
  }
  async postUninstall(extension) {
    const script = this.parseScript(extension, "uninstall");
    if (script) {
      this.logService.info(extension.identifier.id, extension.manifest.version, `Running post uninstall script`);
      await this.processesLimiter.queue(async () => {
        try {
          await this.runLifecycleHook(script.script, "uninstall", script.args, true, extension);
          this.logService.info(`Finished running post uninstall script`, extension.identifier.id, extension.manifest.version);
        } catch (error) {
          this.logService.error("Failed to run post uninstall script", extension.identifier.id, extension.manifest.version);
          this.logService.error(error);
        }
      });
    }
    try {
      await Promises2.rm(this.getExtensionStoragePath(extension));
    } catch (error) {
      this.logService.error("Error while removing extension storage path", extension.identifier.id);
      this.logService.error(error);
    }
  }
  parseScript(extension, type) {
    const scriptKey = `vscode:${type}`;
    if (extension.location.scheme === Schemas.file && extension.manifest && extension.manifest["scripts"] && typeof extension.manifest["scripts"][scriptKey] === "string") {
      const script = extension.manifest["scripts"][scriptKey].split(" ");
      if (script.length < 2 || script[0] !== "node" || !script[1]) {
        this.logService.warn(extension.identifier.id, extension.manifest.version, `${scriptKey} should be a node script`);
        return null;
      }
      return { script: join(extension.location.fsPath, script[1]), args: script.slice(2) || [] };
    }
    return null;
  }
  runLifecycleHook(lifecycleHook, lifecycleType, args, timeout2, extension) {
    return new Promise((c, e) => {
      const extensionLifecycleProcess = this.start(lifecycleHook, lifecycleType, args, extension);
      let timeoutHandler;
      const onexit = (error) => {
        if (timeoutHandler) {
          clearTimeout(timeoutHandler);
          timeoutHandler = null;
        }
        if (error) {
          e(error);
        } else {
          c(void 0);
        }
      };
      extensionLifecycleProcess.on("error", (err) => {
        onexit(toErrorMessage(err) || "Unknown");
      });
      extensionLifecycleProcess.on("exit", (code, signal) => {
        onexit(code ? `post-${lifecycleType} process exited with code ${code}` : void 0);
      });
      if (timeout2) {
        timeoutHandler = setTimeout(() => {
          timeoutHandler = null;
          extensionLifecycleProcess.kill();
          e("timed out");
        }, 5e3);
      }
    });
  }
  start(uninstallHook, lifecycleType, args, extension) {
    const opts = {
      silent: true,
      execArgv: void 0
    };
    const extensionUninstallProcess = fork(uninstallHook, [`--type=extension-post-${lifecycleType}`, ...args], opts);
    extensionUninstallProcess.stdout.setEncoding("utf8");
    extensionUninstallProcess.stderr.setEncoding("utf8");
    const onStdout = Event.fromNodeEventEmitter(extensionUninstallProcess.stdout, "data");
    const onStderr = Event.fromNodeEventEmitter(extensionUninstallProcess.stderr, "data");
    this._register(onStdout((data) => this.logService.info(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data)));
    this._register(onStderr((data) => this.logService.error(extension.identifier.id, extension.manifest.version, `post-${lifecycleType}`, data)));
    const onOutput = Event.any(
      Event.map(onStdout, (o) => ({ data: `%c${o}`, format: [""] }), this._store),
      Event.map(onStderr, (o) => ({ data: `%c${o}`, format: ["color: red"] }), this._store)
    );
    const onDebouncedOutput = Event.debounce(onOutput, (r, o) => {
      return r ? { data: r.data + o.data, format: [...r.format, ...o.format] } : { data: o.data, format: o.format };
    }, 100, void 0, void 0, void 0, this._store);
    onDebouncedOutput((data) => {
      console.group(extension.identifier.id);
      console.log(data.data, ...data.format);
      console.groupEnd();
    });
    return extensionUninstallProcess;
  }
  getExtensionStoragePath(extension) {
    return join(this.userDataProfilesService.defaultProfile.globalStorageHome.fsPath, extension.identifier.id.toLowerCase());
  }
};

ExtensionsLifecycle = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, ILogService)
], ExtensionsLifecycle);
export { fork, ExtensionsLifecycle };
