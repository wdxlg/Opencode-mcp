// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/sandboxOutputAnalyzer.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalSandboxService } from "./module-3125.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/sandboxOutputAnalyzer.ts
var SandboxOutputAnalyzer = class extends Disposable {
  constructor(_sandboxService, _configurationService) {
    super();
    this._sandboxService = _sandboxService;
    this._configurationService = _configurationService;
  }
  async analyze(options3) {
    if (!options3.isSandboxWrapped) {
      return void 0;
    }
    const knownFailure = options3.exitCode !== void 0 && options3.exitCode !== 0;
    const suspectedFailure = !knownFailure && options3.exitCode === void 0 && this._outputLooksSandboxBlocked(options3.exitResult);
    if (!knownFailure && !suspectedFailure) {
      return void 0;
    }
    const os = await this._sandboxService.getOS();
    let fileSystemSetting;
    switch (os) {
      case 3 /* Linux */:
        fileSystemSetting = "chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */;
        break;
      case 1 /* Windows */:
        fileSystemSetting = "chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */;
        break;
      default:
        fileSystemSetting = "chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */;
        break;
    }
    const prefix = knownFailure ? "Command failed while running in sandboxed mode. If the command failed due to sandboxing:" : "Command ran in sandboxed mode and may have been blocked by the sandbox. If the command failed due to sandboxing:";
    const retryWithAllowNetworkRequests = this._configurationService.getValue("chat.agent.sandbox.retryWithAllowNetworkRequests" /* AgentSandboxRetryWithAllowNetworkRequests */) === true;
    const networkRecovery = retryWithAllowNetworkRequests ? "- If you determine from the output that the failure was caused by blocked network access, immediately retry the command with requestAllowNetwork=true and provide requestAllowNetworkReason. This keeps the command sandboxed with unrestricted network access and automatically shows a confirmation prompt to the user.\n- If it is not a network restriction, or the command still fails after retrying with requestAllowNetwork=true, immediately retry the command with requestUnsandboxedExecution=true and provide requestUnsandboxedExecutionReason. Do NOT ask the user - setting this flag automatically shows a confirmation prompt to the user." : "- Sandboxed execution with unrestricted network access is disabled by chat.agent.sandbox.retryWithAllowNetworkRequests. Do not set requestAllowNetwork=true.\n- If the command cannot be made to work by updating sandbox rules, immediately retry it with requestUnsandboxedExecution=true and provide requestUnsandboxedExecutionReason. Do NOT ask the user - setting this flag automatically shows a confirmation prompt to the user.";
    return `${prefix}
- If it would be reasonable to extend the sandbox rules, work with the user to update allowWrite for file system access problems in ${fileSystemSetting}, or to add required domains to ${"chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */}.
- If the output contains 'No such file or directory', treat it as a sandbox access error and immediately retry the command with requestUnsandboxedExecution=true and provide requestUnsandboxedExecutionReason.
${networkRecovery}

Here is the output of the command:
`;
  }
  /**
   * Checks whether the command output contains strings that typically indicate
   * the sandbox blocked the operation. Used when exit code is unavailable.
   *
   * The output may contain newlines inserted by terminal wrapping, so we
   * strip them before testing.
   */
  _outputLooksSandboxBlocked(output) {
    return outputLooksSandboxBlocked(output);
  }
};

SandboxOutputAnalyzer = __decorateClass([
  __decorateParam(0, ITerminalSandboxService),
  __decorateParam(1, IConfigurationService)
], SandboxOutputAnalyzer);

function outputLooksSandboxBlocked(output) {
  const normalized = output.replace(/\n/g, " ");
  return /Operation not permitted|Permission denied|Read-only file system|sandbox-exec|bwrap|sandbox_violation|No such file or directory/i.test(normalized);
}

function outputLooksSandboxNetworkBlocked(output) {
  const normalized = output.replace(/\n/g, " ");
  return /Could not resolve host|Temporary failure in name resolution|Name or service not known|EAI_AGAIN|ENETUNREACH|Network is unreachable|Received HTTP code 403 from proxy after CONNECT|network (?:access )?(?:blocked|disabled)|(?:connect|socket).*(?:Operation not permitted|Permission denied)|(?:Operation not permitted|Permission denied).*(?:connect|socket)/i.test(normalized);
}
export { outputLooksSandboxBlocked, outputLooksSandboxNetworkBlocked, SandboxOutputAnalyzer };
