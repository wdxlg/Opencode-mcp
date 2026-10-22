// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatModeTelemetry.ts
import { getModeNameForTelemetry } from "./module-1470.mjs";
import { isInClaudeAgentsFolder } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/common/chatModeTelemetry.ts
function reportChatModeChange(telemetryService, currentMode, targetMode, requestCount) {
  if (currentMode.id === targetMode.id) {
    return;
  }
  const storage = targetMode.source?.storage ?? "builtin";
  const extensionId = targetMode.source?.storage === "extension" ? targetMode.source.extensionId.value : void 0;
  const modeUri = targetMode.uri?.get();
  telemetryService.publicLog2("chat.modeChange", {
    fromMode: getModeNameForTelemetry(currentMode),
    mode: getModeNameForTelemetry(targetMode),
    requestCount,
    storage,
    extensionId,
    toolsCount: targetMode.customTools?.get()?.length ?? 0,
    handoffsCount: targetMode.handOffs?.get()?.length ?? 0,
    isClaudeAgent: modeUri ? isInClaudeAgentsFolder(modeUri) : void 0
  });
}
export { reportChatModeChange };
