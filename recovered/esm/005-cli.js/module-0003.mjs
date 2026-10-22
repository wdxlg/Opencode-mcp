// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/process.ts
import { __esm } from "./module-0000.mjs";
import { init_platform, isMacintosh, isWindows2 } from "./module-0002.mjs";


// src/vs/base/common/process.ts
var safeProcess, vscodeGlobal, cwd, env, platform, arch;

var init_process = __esm({
  "src/vs/base/common/process.ts"() {
    init_platform();
    vscodeGlobal = globalThis.vscode;
    if (typeof vscodeGlobal !== "undefined" && typeof vscodeGlobal.process !== "undefined") {
      const sandboxProcess = vscodeGlobal.process;
      safeProcess = {
        get platform() {
          return sandboxProcess.platform;
        },
        get arch() {
          return sandboxProcess.arch;
        },
        get env() {
          return sandboxProcess.env;
        },
        cwd() {
          return sandboxProcess.cwd();
        }
      };
    } else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
      safeProcess = {
        get platform() {
          return process.platform;
        },
        get arch() {
          return process.arch;
        },
        get env() {
          return process.env;
        },
        cwd() {
          return process.env["VSCODE_CWD"] || process.cwd();
        }
      };
    } else {
      safeProcess = {
        // Supported
        get platform() {
          return isWindows2 ? "win32" : isMacintosh ? "darwin" : "linux";
        },
        get arch() {
          return void 0;
        },
        // Unsupported
        get env() {
          return {};
        },
        cwd() {
          return "/";
        }
      };
    }
    cwd = safeProcess.cwd;
    env = safeProcess.env;
    platform = safeProcess.platform;
    arch = safeProcess.arch;
  }
});
export { safeProcess, vscodeGlobal, cwd, env, platform, arch, init_process };
