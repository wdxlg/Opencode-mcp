// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/copilotHome.ts
import { join } from "./module-0018.mjs";


// src/vs/platform/agentHost/common/copilotHome.ts
function getCopilotHomePath(userHomePath, environment) {
  return environment["COPILOT_HOME"] || join(userHomePath, ".copilot");
}
export { getCopilotHomePath };
