// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostModeIcon.ts
import { Codicon } from "./module-0085.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostModeIcon.ts
function getAgentHostModeIcon(value2) {
  switch (value2) {
    case "plan":
      return Codicon.checklist;
    case "autopilot":
      return Codicon.rocket;
    case "interactive":
      return Codicon.comment;
    default:
      return void 0;
  }
}
export { getAgentHostModeIcon };
