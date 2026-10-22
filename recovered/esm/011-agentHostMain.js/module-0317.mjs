// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/claudeSessionConfigKeys.ts



// src/vs/platform/agentHost/common/claudeSessionConfigKeys.ts
function narrowClaudePermissionMode(raw) {
  switch (raw) {
    case "default":
    case "acceptEdits":
    case "bypassPermissions":
    case "plan":
    case "auto":
      return raw;
    default:
      return void 0;
  }
}
export { narrowClaudePermissionMode };
