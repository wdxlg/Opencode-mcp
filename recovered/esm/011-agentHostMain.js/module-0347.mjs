// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/claudeMultiRootCustomizationDiscovery.ts
import { ResourceSet } from "./module-0006.mjs";
import { scanClaudeCustomizationScope, scanClaudeDiskCustomizations } from "./module-0344.mjs";
import { scanClaudeNativePlugins, scanClaudeNativePluginsForRoots } from "./module-0346.mjs";
import { selectFirstClaudeCustomizationByKey } from "./module-0345.mjs";


// src/vs/platform/agentHost/node/claude/customizations/claudeMultiRootCustomizationDiscovery.ts
function distinctClaudeWorkingDirectories(workingDirectories) {
  const seen = new ResourceSet();
  const result = [];
  for (const directory of workingDirectories ?? []) {
    if (!seen.has(directory)) {
      seen.add(directory);
      result.push(directory);
    }
  }
  return result;
}

function isParsedAgent(item) {
  return item.customization.type === "agent" /* Agent */;
}

function isParsedSkill(item) {
  return item.customization.type === "skill" /* Skill */;
}

async function discoverClaudeMultiRootCustomizations(workingDirectories, userHome, fileService, logService) {
  const roots = distinctClaudeWorkingDirectories(workingDirectories);
  if (roots.length <= 1) {
    const [discovered2, nativePlugins2] = await Promise.all([
      scanClaudeDiskCustomizations(roots[0], userHome, fileService),
      scanClaudeNativePlugins(roots[0], userHome, fileService, logService)
    ]);
    return { workingDirectories: roots, discovered: discovered2, nativePlugins: nativePlugins2 };
  }
  const [rootScopes, userScope, nativePlugins] = await Promise.all([
    Promise.all(roots.map((root, index) => scanClaudeCustomizationScope(root, fileService, index === 0))),
    scanClaudeCustomizationScope(userHome, fileService),
    scanClaudeNativePluginsForRoots(roots, userHome, fileService, logService)
  ]);
  const scopes = [...rootScopes, userScope];
  const userScopeItems = new Set(userScope);
  const logShadowedAcrossRoots = (kind) => (shadowed, winner) => {
    if (userScopeItems.has(shadowed)) {
      return;
    }
    logService.warn(`[claudeMultiRootCustomizationDiscovery] ${kind} '${shadowed.name}' at '${shadowed.uri.toString()}' is shadowed by '${winner.uri.toString()}' from another workspace folder and is unreachable by name`);
  };
  const discovered = [
    ...selectFirstClaudeCustomizationByKey(scopes.map((items) => items.filter(isParsedAgent)), (item) => item.name, logShadowedAcrossRoots("agent")),
    ...selectFirstClaudeCustomizationByKey(scopes.map((items) => items.filter(isParsedSkill)), (item) => item.name, logShadowedAcrossRoots("skill"))
  ];
  return {
    workingDirectories: roots,
    discovered,
    nativePlugins
  };
}
export { distinctClaudeWorkingDirectories, isParsedAgent, isParsedSkill, discoverClaudeMultiRootCustomizations };
