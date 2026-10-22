// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineSandboxAnalyzer.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalSandboxService } from "./module-3125.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/commandLineSandboxAnalyzer.ts
var CommandLineSandboxAnalyzer = class extends Disposable {
  constructor(_sandboxService, _configurationService) {
    super();
    this._sandboxService = _sandboxService;
    this._configurationService = _configurationService;
  }
  _isAutoApproveEnabled() {
    return this._configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) !== false;
  }
  async analyze(_options) {
    const isAutoApproveEnabled = this._isAutoApproveEnabled();
    if (!await this._sandboxService.isEnabled()) {
      return {
        isAutoApproveAllowed: isAutoApproveEnabled
      };
    }
    return {
      isAutoApproveAllowed: isAutoApproveEnabled,
      forceAutoApproval: !_options.requiresUnsandboxConfirmation && !_options.requiresAllowNetworkConfirmation && isAutoApproveEnabled
    };
  }
};

CommandLineSandboxAnalyzer = __decorateClass([
  __decorateParam(0, ITerminalSandboxService),
  __decorateParam(1, IConfigurationService)
], CommandLineSandboxAnalyzer);
export { CommandLineSandboxAnalyzer };
