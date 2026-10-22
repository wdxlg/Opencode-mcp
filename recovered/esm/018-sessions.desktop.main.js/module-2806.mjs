// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/AISearch/aiSearchModelBase.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/search/browser/AISearch/aiSearchModelBase.ts
function isSearchTreeAIFileMatch(obj) {
  return obj && obj.getFullRange && obj.getFullRange() instanceof Range2;
}
export { isSearchTreeAIFileMatch };
