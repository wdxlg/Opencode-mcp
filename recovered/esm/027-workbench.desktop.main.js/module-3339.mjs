// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/sandboxedCommandLinePresenter.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalSandboxService } from "./module-3336.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLinePresenter/sandboxedCommandLinePresenter.ts
var SandboxedCommandLinePresenter = class {
  constructor(_sandboxService) {
    this._sandboxService = _sandboxService;
  }
  async present(options3) {
    if (!await this._sandboxService.isEnabled()) {
      return void 0;
    }
    return {
      commandLine: options3.commandLine.forDisplay,
      processOtherPresenters: true
    };
  }
};

SandboxedCommandLinePresenter = __decorateClass([
  __decorateParam(0, ITerminalSandboxService)
], SandboxedCommandLinePresenter);
export { SandboxedCommandLinePresenter };
