// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/workspacelessScratchDir.ts
import { joinPath } from "./module-0034.mjs";


// src/vs/platform/agentHost/common/workspacelessScratchDir.ts
function workspacelessScratchDir(userHome, sessionId) {
  return joinPath(userHome, ".copilot", "chats", sessionId);
}
export { workspacelessScratchDir };
