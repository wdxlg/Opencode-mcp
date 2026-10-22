// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/applyAgentHostSubmitConfig.ts
import { applyAgentHostCompletionAction } from "./module-2821.mjs";
import { applyAgentHostSessionConfigChange } from "./module-2822.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/applyAgentHostSubmitConfig.ts
async function applyAgentHostSubmitConfig(sessionResource, config, services) {
  let applied = false;
  const confirmed = await applyAgentHostCompletionAction({ applyConfig: config }, services.dialogService, services.storageService, async (config2) => {
    applied = await applyAgentHostSessionConfigChange(sessionResource, config2, services);
  });
  return confirmed && applied;
}
export { applyAgentHostSubmitConfig };
