// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxService.ts
import { __esm } from "./module-0000.mjs";
import { OS, init_platform } from "./module-0006.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/sandbox/common/terminalSandboxService.ts
var ITerminalSandboxService, NullTerminalSandboxService;

var init_terminalSandboxService = __esm({
  "src/vs/platform/sandbox/common/terminalSandboxService.ts"() {
    init_platform();
    init_instantiation();
    ITerminalSandboxService = createDecorator("terminalSandboxService");
    NullTerminalSandboxService = class {
      async isEnabled() {
        return false;
      }
      async isSandboxAllowNetworkEnabled() {
        return false;
      }
      async getOS() {
        return OS;
      }
      async checkForSandboxingPrereqs() {
        return { enabled: false, sandboxConfigPath: void 0, failedCheck: void 0 };
      }
      async wrapCommand(command) {
        return { command, isSandboxWrapped: false };
      }
      async checkFileAccess() {
        return { allowed: true, denied: [] };
      }
      async getSandboxConfigPath() {
        return void 0;
      }
      getTempDir() {
        return void 0;
      }
      setNeedsForceUpdateConfigFile() {
      }
      getResolvedNetworkDomains() {
        return { allowedDomains: [], deniedDomains: [] };
      }
      async getMissingSandboxDependencies() {
        return [];
      }
      async installMissingSandboxDependencies() {
        return { exitCode: void 0 };
      }
      async runSandboxRemediation() {
        return { exitCode: void 0 };
      }
    };
  }
});
export { ITerminalSandboxService, NullTerminalSandboxService, init_terminalSandboxService };
