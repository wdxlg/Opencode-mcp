// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/electron-main/environmentMainService.ts
import { __decorateClass, __esm } from "./module-0000.mjs";
import { init_decorators, memoize } from "./module-0052.mjs";
import { init_path, join4 } from "./module-0008.mjs";
import { init_platform, isLinux } from "./module-0006.mjs";
import { createStaticIPCHandle, init_ipc_net2 } from "./module-0058.mjs";
import { IEnvironmentService, init_environment } from "./module-0071.mjs";
import { NativeEnvironmentService, init_environmentService2 } from "./module-0093.mjs";
import { init_instantiation, refineServiceDecorator } from "./module-0039.mjs";


// src/vs/platform/environment/electron-main/environmentMainService.ts
var IEnvironmentMainService, EnvironmentMainService;

var init_environmentMainService = __esm({
  "src/vs/platform/environment/electron-main/environmentMainService.ts"() {
    init_decorators();
    init_path();
    init_platform();
    init_ipc_net2();
    init_environment();
    init_environmentService2();
    init_instantiation();
    IEnvironmentMainService = refineServiceDecorator(IEnvironmentService);
    EnvironmentMainService = class extends NativeEnvironmentService {
      constructor() {
        super(...arguments);
        this._snapEnv = {};
      }
      get backupHome() {
        return join4(this.userDataPath, "Backups");
      }
      get mainIPCHandle() {
        return createStaticIPCHandle(this.userDataPath, "main", this.productService.version);
      }
      get mainLockfile() {
        return join4(this.userDataPath, "code.lock");
      }
      get disableUpdates() {
        return !!this.args["disable-updates"];
      }
      get isPortable() {
        return !!process.env["VSCODE_PORTABLE"];
      }
      get crossOriginIsolated() {
        return !!this.args["enable-coi"];
      }
      get enableRDPDisplayTracking() {
        return !!this.args["enable-rdp-display-tracking"];
      }
      get codeCachePath() {
        return process.env["VSCODE_CODE_CACHE_PATH"] || void 0;
      }
      get useCodeCache() {
        return !!this.codeCachePath;
      }
      unsetSnapExportedVariables() {
        if (!isLinux) {
          return;
        }
        for (const key in process.env) {
          if (key.endsWith("_VSCODE_SNAP_ORIG")) {
            const originalKey = key.slice(0, -17);
            if (this._snapEnv[originalKey]) {
              continue;
            }
            if (process.env[originalKey]) {
              this._snapEnv[originalKey] = process.env[originalKey];
            }
            if (process.env[key]) {
              process.env[originalKey] = process.env[key];
            } else {
              delete process.env[originalKey];
            }
          }
        }
      }
      restoreSnapExportedVariables() {
        if (!isLinux) {
          return;
        }
        for (const key in this._snapEnv) {
          process.env[key] = this._snapEnv[key];
          delete this._snapEnv[key];
        }
      }
    };
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "backupHome", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "mainIPCHandle", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "mainLockfile", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "disableUpdates", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "isPortable", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "crossOriginIsolated", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "enableRDPDisplayTracking", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "codeCachePath", 1);
    __decorateClass([
      memoize
    ], EnvironmentMainService.prototype, "useCodeCache", 1);
  }
});
export { IEnvironmentMainService, EnvironmentMainService, init_environmentMainService };
