// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLinePreventHistoryRewriter.ts
import { Disposable } from "./module-0012.mjs";
import { isBash, isZsh } from "./module-3109.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLinePreventHistoryRewriter.ts
var CommandLinePreventHistoryRewriter = class extends Disposable {
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
  }
  rewrite(options3) {
    const preventShellHistory = this._configurationService.getValue("chat.tools.terminal.preventShellHistory" /* PreventShellHistory */) === true;
    if (!preventShellHistory) {
      return void 0;
    }
    if (isBash(options3.shell, options3.os) || isZsh(options3.shell, options3.os)) {
      return {
        rewritten: ` ${options3.commandLine}`,
        reasoning: "Prepended with a space to exclude from shell history"
      };
    }
    return void 0;
  }
};

CommandLinePreventHistoryRewriter = __decorateClass([
  __decorateParam(0, IConfigurationService)
], CommandLinePreventHistoryRewriter);
export { CommandLinePreventHistoryRewriter };
