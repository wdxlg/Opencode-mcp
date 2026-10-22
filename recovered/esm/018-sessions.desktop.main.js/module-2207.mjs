// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionReducers.ts
import { readToolCallMeta } from "./module-1006.mjs";


// src/vs/platform/agentHost/common/state/sessionReducers.ts
function getToolKind(tc) {
  return readToolCallMeta(tc).toolKind;
}
export { getToolKind };
