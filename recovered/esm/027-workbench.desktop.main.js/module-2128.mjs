// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/customAgents.ts
import { isCustomizationEnabled } from "./module-2112.mjs";


// src/vs/platform/agentHost/common/customAgents.ts
function getEffectiveAgents(sessionCustomizations) {
  const seen = /* @__PURE__ */ new Map();
  if (sessionCustomizations) {
    for (const container3 of sessionCustomizations) {
      if (container3.type === "mcpServer" /* McpServer */) {
        continue;
      }
      if (container3.type === "plugin" /* Plugin */ && !isCustomizationEnabled(container3) || container3.type === "directory" /* Directory */ && !container3.enabled || !container3.children) {
        continue;
      }
      for (const child of container3.children) {
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
export { getEffectiveAgents, agentHostAgentPickerStorageKey };
