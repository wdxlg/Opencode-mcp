// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatAutoModeExplainability.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/chatAutoModeExplainability.ts
var HIDE_AUTO_EXPLAINABILITY_TREATMENT = "copilotchat.hideAutoExplainability";

function autoModeRoutingTitle(part) {
  return part.resolved ? localize(12847, null, part.resolved.name) : localize(12848, null);
}
export { autoModeRoutingTitle, HIDE_AUTO_EXPLAINABILITY_TREATMENT };
