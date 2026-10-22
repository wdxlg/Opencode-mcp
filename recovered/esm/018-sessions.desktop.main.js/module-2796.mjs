// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentHostCompletionAction.ts
import { maybeConfirmElevatedPermissionLevel } from "./module-2100.mjs";
import { isChatPermissionLevel } from "./module-0965.mjs";
import { isAutoApprovePolicyRestricted } from "./module-2041.mjs";


// src/vs/workbench/contrib/chat/browser/agentHostCompletionAction.ts
async function applyAgentHostCompletionAction(action, dialogService, storageService, apply2) {
  const config = action.applyConfig;
  if (!config || Object.keys(config).length === 0) {
    return true;
  }
  const elevatedLevel = getElevatedAutoApproveLevel(config["autoApprove" /* AutoApprove */]);
  if (elevatedLevel !== void 0) {
    const confirmed = await maybeConfirmElevatedPermissionLevel(elevatedLevel, dialogService, storageService, {
      defaultSettingKey: "chat.defaultConfiguration" /* DefaultConfiguration */
    });
    if (!confirmed) {
      return false;
    }
  }
  await apply2(config);
  return true;
}

function getElevatedAutoApproveLevel(value2) {
  if (value2 === void 0 || value2 === "default" /* Default */) {
    return void 0;
  }
  if (!isChatPermissionLevel(value2)) {
    return void 0;
  }
  return value2 === "autoApprove" /* AutoApprove */ || value2 === "assisted" /* Assisted */ || value2 === "autopilot" /* Autopilot */ ? value2 : void 0;
}

function isPolicyBlockedCompletionAction(action, configurationService) {
  return getElevatedAutoApproveLevel(action.applyConfig?.["autoApprove" /* AutoApprove */]) !== void 0 && isAutoApprovePolicyRestricted(configurationService);
}
export { applyAgentHostCompletionAction, getElevatedAutoApproveLevel, isPolicyBlockedCompletionAction };
