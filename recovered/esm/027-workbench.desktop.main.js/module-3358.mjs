// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineSandboxRewriter.ts
import { Disposable } from "./module-0012.mjs";
import { isPowerShell } from "./module-3320.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalSandboxService } from "./module-3336.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineRewriter/commandLineSandboxRewriter.ts
var CommandLineSandboxRewriter = class extends Disposable {
  constructor(_treeSitterCommandParser, _sandboxService) {
    super();
    this._treeSitterCommandParser = _treeSitterCommandParser;
    this._sandboxService = _sandboxService;
  }
  async rewrite(options3) {
    const sandboxPrereqs = await this._sandboxService.checkForSandboxingPrereqs(false);
    if (!sandboxPrereqs.enabled || sandboxPrereqs.failedCheck === "config" /* Config */) {
      return void 0;
    }
    const commandDetails = await this._parseCommandDetails(options3);
    const wrappedCommand = await this._sandboxService.wrapCommand(options3.commandLine, options3.requestUnsandboxedExecution, options3.shell, options3.cwd, commandDetails, options3.requestAllowNetwork);
    return {
      rewritten: wrappedCommand.command,
      reasoning: wrappedCommand.requiresAllowNetworkConfirmation ? "Wrapped command for sandbox execution with unrestricted network access" : wrappedCommand.requiresUnsandboxConfirmation ? "Switched command to unsandboxed execution because the command includes a domain that is not in the sandbox allowlist" : "Wrapped command for sandbox execution",
      forDisplay: options3.commandLine,
      // show the command that is passed as input (after prior rewrites like cd prefix stripping)
      isSandboxWrapped: wrappedCommand.isSandboxWrapped,
      requiresUnsandboxConfirmation: wrappedCommand.requiresUnsandboxConfirmation,
      requiresAllowNetworkConfirmation: wrappedCommand.requiresAllowNetworkConfirmation,
      blockedDomains: wrappedCommand.blockedDomains,
      deniedDomains: wrappedCommand.deniedDomains
    };
  }
  /**
   * Parses the command line into sandbox command details. If parsing fails,
   * wrapping continues with the base sandbox config rather than blocking the command.
   */
  async _parseCommandDetails(options3) {
    try {
      if (options3.requestUnsandboxedExecution === true) {
        return [];
      }
      const languageId = isPowerShell(options3.shell, options3.os) ? "powershell" /* PowerShell */ : "bash" /* Bash */;
      return await this._treeSitterCommandParser.extractCommands(languageId, options3.commandLine);
    } catch {
      return [];
    }
  }
};

CommandLineSandboxRewriter = __decorateClass([
  __decorateParam(1, ITerminalSandboxService)
], CommandLineSandboxRewriter);
export { CommandLineSandboxRewriter };
