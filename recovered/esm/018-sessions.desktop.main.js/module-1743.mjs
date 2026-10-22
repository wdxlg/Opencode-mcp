// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/customAgents.ts
import { isCustomizationEnabled } from "./module-1742.mjs";


// src/vs/platform/agentHost/common/customAgents.ts
function getEffectiveAgents(sessionCustomizations) {
  const seen = /* @__PURE__ */ new Map();
  if (sessionCustomizations) {
    for (const container2 of sessionCustomizations) {
      if (container2.type === "mcpServer" /* McpServer */) {
        continue;
      }
      if (container2.type === "plugin" /* Plugin */ && !isCustomizationEnabled(container2) || container2.type === "directory" /* Directory */ && !container2.enabled || !container2.children) {
        continue;
      }
      for (const child of container2.children) {
        if (child.type !== "agent" /* Agent */) {
          continue;
        }
        const key3 = child.uri.toString();
        if (!seen.has(key3)) {
          seen.set(key3, child);
        }
      }
    }
  }
  const result = [...seen.values()];
  result.sort((a, b) => a.name.localeCompare(b.name) || a.uri.toString().localeCompare(b.uri.toString()));
  return result;
}

function agentHostAgentPickerStorageKey(resourceScheme) {
  return `workbench.agentsession.agentHostAgentPicker.${resourceScheme}.selectedAgentUri`;
}

function resolveAgentHostAgent(agents, sessionAgentUri, storedAgentUri) {
  if (sessionAgentUri !== void 0) {
    const sessionStr = typeof sessionAgentUri === "string" ? sessionAgentUri : sessionAgentUri.toString();
    const match2 = agents.find((a) => a.uri === sessionStr);
    if (match2) {
      return match2;
    }
  }
  return storedAgentUri ? agents.find((a) => a.uri === storedAgentUri) : void 0;
}
export { getEffectiveAgents, agentHostAgentPickerStorageKey, resolveAgentHostAgent };
