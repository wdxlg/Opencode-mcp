// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/serverToolGroups.ts
import { feedbackServerToolGroup } from "./module-0228.mjs";
import { createSessionServerToolGroup } from "./module-0231.mjs";
import { createAgentMergeServerToolGroup } from "./module-0232.mjs";
import { createArtifactServerToolGroup } from "./module-0235.mjs";


// src/vs/platform/agentHost/node/shared/serverToolGroups.ts
function buildServerToolGroups(sessionAccessor, agentMergeAccessor, artifactAccessor) {
  return [
    feedbackServerToolGroup,
    createSessionServerToolGroup(sessionAccessor),
    createAgentMergeServerToolGroup(agentMergeAccessor),
    createArtifactServerToolGroup(artifactAccessor)
  ];
}

var serverToolGroupsForDisplay = buildServerToolGroups();

function matchesServerToolName(toolName, bareName) {
  return toolName === bareName || toolName.endsWith(`__${bareName}`);
}

function getServerToolDisplay(toolName, args, result) {
  for (const group of serverToolGroupsForDisplay) {
    if (!group.getDisplay) {
      continue;
    }
    for (const def of group.definitions) {
      if (matchesServerToolName(toolName, def.name)) {
        return group.getDisplay(def.name, args, result);
      }
    }
  }
  for (const group of serverToolGroupsForDisplay) {
    if (!group.getDisplay) {
      continue;
    }
    for (const [legacyName, currentName] of group.legacyToolNames ?? []) {
      if (matchesServerToolName(toolName, legacyName)) {
        return group.getDisplay(currentName, args, result);
      }
    }
  }
  return void 0;
}
export { buildServerToolGroups, matchesServerToolName, getServerToolDisplay, serverToolGroupsForDisplay };
