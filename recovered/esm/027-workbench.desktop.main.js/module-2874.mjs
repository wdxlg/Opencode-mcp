// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentCustomizationMeta.ts



// src/vs/platform/agentHost/common/meta/agentCustomizationMeta.ts
function readAgentCustomizationMeta(agent) {
  const meta = agent._meta;
  const result = {};
  if (agent.disableUserInvocation === true) {
    result.userInvocable = false;
  } else if (typeof meta?.["userInvocable"] === "boolean") {
    result.userInvocable = meta["userInvocable"];
  }
  return result;
}
export { readAgentCustomizationMeta };
