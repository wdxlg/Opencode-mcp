// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/claudeCustomizationPolicy.ts
import { isEqualOrParent2 } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/claude/customizations/claudeCustomizationPolicy.ts
function selectFirstClaudeCustomizationByKey(groups, keyOf, onShadowed) {
  const selected = /* @__PURE__ */ new Map();
  for (const group of groups) {
    for (const item of group) {
      const key = keyOf(item);
      if (!selected.has(key)) {
        selected.set(key, item);
        continue;
      }
      const winner = selected.get(key);
      if (winner !== void 0) {
        onShadowed?.(item, winner);
      }
    }
  }
  return [...selected.values()];
}

function selectEnabledClaudePluginIds(groups) {
  const selected = /* @__PURE__ */ new Map();
  for (const group of groups) {
    for (const [id2, enabled] of group) {
      if (!selected.has(id2)) {
        selected.set(id2, enabled);
      }
    }
  }
  return [...selected].filter(([, enabled]) => enabled).map(([id2]) => id2);
}

function findMostSpecificClaudeWorkspaceRoot(resource, workingDirectories) {
  let result;
  for (const directory of workingDirectories) {
    if (resource.scheme === directory.scheme && isEqualOrParent2(resource, directory) && (!result || directory.path.length > result.path.length)) {
      result = directory;
    }
  }
  return result;
}
export { selectFirstClaudeCustomizationByKey, selectEnabledClaudePluginIds, findMostSpecificClaudeWorkspaceRoot };
