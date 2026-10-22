// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureNotification.ts
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { describeBridgeStartupFailure } from "./module-2665.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Severity2 } from "./module-0336.mjs";
import { localizeBridge } from "./module-2621.mjs";
import { BRIDGE_STARTUP_FAILURE_ACTION_LABELS, BRIDGE_STARTUP_FAILURE_CHROME, bridgeStartupFailureCopy } from "./module-2662.mjs";
import { toAction } from "./module-0082.mjs";
import { BRIDGE_SHOW_LOG_COMMAND } from "./module-2666.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStartupFailureNotification.ts
var BRIDGE_GET_STATUS2 = "opencode.bridge.getStatus";

function openBridgePage(commandService) {
  return commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Bridge);
}

async function notifyBridgeAutoStartFailure(error, commandService, notificationService) {
  const status2 = await commandService.executeCommand(BRIDGE_GET_STATUS2).catch(() => void 0);
  const failure2 = describeBridgeStartupFailure(status2?.startFailure ?? toErrorMessage(error));
  notificationService.notify({
    severity: failure2.severity === "error" ? Severity2.Error : failure2.severity === "warning" ? Severity2.Warning : Severity2.Info,
    message: localizeBridge("opencodeBridge.autoStartFailed", "Bridge could not be started automatically: {0}", bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.sentence, failure2.title, failure2.cause)),
    actions: {
      primary: [
        toAction({ id: "opencode.bridge.openPage", label: bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.openBridgePage), run: () => openBridgePage(commandService) }),
        toAction({ id: BRIDGE_SHOW_LOG_COMMAND, label: bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_ACTION_LABELS["show-log"]), run: () => commandService.executeCommand(BRIDGE_SHOW_LOG_COMMAND) })
      ]
    }
  });
}
export { openBridgePage, notifyBridgeAutoStartFailure, BRIDGE_GET_STATUS2 };
