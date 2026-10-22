// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeSessionPermissionMode.ts
import { narrowClaudePermissionMode } from "./module-0317.mjs";


// src/vs/platform/agentHost/node/claude/claudeSessionPermissionMode.ts
function readClaudePermissionMode(configurationService, sessionUri) {
  return narrowClaudePermissionMode(
    configurationService.getSessionConfigValues(sessionUri.toString())?.["permissionMode" /* PermissionMode */]
  );
}
export { readClaudePermissionMode };
