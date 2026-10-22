// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatModeTelemetry.ts
import { getModeNameForTelemetry } from "./module-1469.mjs";
import { isInClaudeAgentsFolder } from "./module-0997.mjs";


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
