// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalToolAutoApprove.ts
import { isAutoApproveLevel } from "./module-0964.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/terminalToolAutoApprove.ts
function isSessionAutoApproveLevel(chatSessionResource, configurationService, chatWidgetService, chatService) {
  const inspected = configurationService.inspect("chat.tools.global.autoApprove" /* GlobalAutoApprove */);
  if (inspected.policyValue === false) {
    return false;
  }
  const widget = chatWidgetService.getWidgetBySessionResource(chatSessionResource) ?? chatWidgetService.lastFocusedWidget;
  if (widget && isAutoApproveLevel(widget.input.currentModeInfo.permissionLevel)) {
    return true;
  }
  const model = chatService.getSession(chatSessionResource);
  const request2 = model?.getRequests().at(-1);
  return isAutoApproveLevel(request2?.modeInfo?.permissionLevel);
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
