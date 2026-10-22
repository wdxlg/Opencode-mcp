// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/copilotHome.ts
import { join } from "./module-0026.mjs";


// src/vs/platform/agentHost/common/copilotHome.ts
function getCopilotHomePath(userHomePath, environment) {
  return environment["COPILOT_HOME"] || join(userHomePath, ".copilot");
}

function getCopilotRootPaths(userHomePath, environment) {
  return [.../* @__PURE__ */ new Set([
    getCopilotHomePath(userHomePath, environment),
    join(userHomePath, ".copilot")
  ])];
}
export { getCopilotHomePath, getCopilotRootPaths };
