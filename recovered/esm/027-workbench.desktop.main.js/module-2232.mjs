// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionReducers.ts
import { readToolCallMeta } from "./module-1005.mjs";


// src/vs/platform/agentHost/common/state/sessionReducers.ts
function getToolKind(tc) {
  return readToolCallMeta(tc).toolKind;
}
export { getToolKind };
