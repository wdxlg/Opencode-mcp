// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalToolAutoApprove.ts
import { isOpenCodeAutoApproveMode } from "./module-0964.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalToolAutoApprove.ts
// OpenCode: 旧的会话审批级别（自动批准 / Autopilot）已删除；「整个会话自动允许」改由对话「权限」按钮的模式决定（自动允许 / 全自动）
function isSessionAutoApproveLevel(chatSessionResource, configurationService) {
  return !!chatSessionResource && isOpenCodeAutoApproveMode(configurationService);
}

function isToolEligibleForTerminalAutoApproval(toolReferenceName, configurationService, legacyToolReferenceFullNames) {
  const config = configurationService.getValue("chat.tools.eligibleForAutoApproval" /* EligibleForAutoApproval */);
  if (config && typeof config === "object") {
    if (Object.prototype.hasOwnProperty.call(config, toolReferenceName)) {
      return config[toolReferenceName];
    }
    if (legacyToolReferenceFullNames) {
      for (const legacyName of legacyToolReferenceFullNames) {
        if (Object.prototype.hasOwnProperty.call(config, legacyName)) {
          return config[legacyName];
        }
      }
    }
  }
  return true;
}

function isTerminalAutoApproveAllowed(toolReferenceName, configurationService, storageService, legacyToolReferenceFullNames) {
  const isEligible = isToolEligibleForTerminalAutoApproval(toolReferenceName, configurationService, legacyToolReferenceFullNames);
  const isAutoApproveEnabled = configurationService.getValue("chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */) === true;
  const isAutoApproveWarningAccepted = storageService.getBoolean("chat.tools.terminal.autoApprove.warningAccepted" /* TerminalAutoApproveWarningAccepted */, -1 /* APPLICATION */, false);
  return isEligible && isAutoApproveEnabled && isAutoApproveWarningAccepted;
}
export { isSessionAutoApproveLevel, isToolEligibleForTerminalAutoApproval, isTerminalAutoApproveAllowed };
