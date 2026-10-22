// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/autoReplies/browser/terminal.autoReplies.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { TERMINAL_CONFIG_SECTION } from "./module-1173.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/terminalContrib/autoReplies/browser/terminal.autoReplies.contribution.ts
var TerminalAutoRepliesContribution = class extends Disposable {
  constructor(_configurationService, terminalInstanceService) {
    super();
    this._configurationService = _configurationService;
    for (const backend of terminalInstanceService.getRegisteredBackends()) {
      this._installListenersOnBackend(backend);
    }
    this._register(terminalInstanceService.onDidRegisterBackend(async (e) => this._installListenersOnBackend(e)));
  }
  static {
    this.ID = "terminalAutoReplies";
  }
  _installListenersOnBackend(backend) {
    const initialConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
    for (const match2 of Object.keys(initialConfig.autoReplies)) {
      const reply = initialConfig.autoReplies[match2];
      if (reply) {
        backend.installAutoReply(match2, reply);
      }
    }
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("terminal.integrated.autoReplies" /* AutoReplies */)) {
        backend.uninstallAllAutoReplies();
        const config = this._configurationService.getValue(TERMINAL_CONFIG_SECTION);
        for (const match2 of Object.keys(config.autoReplies)) {
          const reply = config.autoReplies[match2];
          if (reply) {
            backend.installAutoReply(match2, reply);
          }
        }
      }
    }));
  }
};

TerminalAutoRepliesContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITerminalInstanceService)
], TerminalAutoRepliesContribution);

registerWorkbenchContribution2(TerminalAutoRepliesContribution.ID, TerminalAutoRepliesContribution, WorkbenchPhase.AfterRestored);
export { TerminalAutoRepliesContribution };
