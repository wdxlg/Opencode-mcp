// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/scan/claudeAgentSkillScan.ts
import { URI } from "./module-0023.mjs";
import { dirname2 } from "./module-0025.mjs";
import { detectPluginFormat, readAgentComponents, readSkills, toParsedAgent, toParsedSkill } from "./module-0126.mjs";


// src/vs/platform/agentHost/node/claude/customizations/scan/claudeAgentSkillScan.ts
function scopeRoots(scope) {
  const base = URI.joinPath(scope, ".claude");
  return {
    agents: URI.joinPath(base, "agents"),
    skills: URI.joinPath(base, "skills"),
    commands: URI.joinPath(base, "commands")
  };
}

function collectByName(into, items) {
  for (const item of items) {
    if (!into.has(item.name)) {
      into.set(item.name, item);
    }
  }
}

async function excludeNativePluginSkills(skills, fileService) {
  const isPluginDir = await Promise.all(skills.map(async (skill) => {
    const dir = dirname2(skill.uri);
    const format4 = await detectPluginFormat(dir, fileService);
    return fileService.exists(URI.joinPath(dir, format4.manifestPath));
  }));
  return skills.filter((_, i) => !isPluginDir[i]);
}

async function scanClaudeCustomizationScope(scope, fileService, includeCommands = true) {
  const { agents: agentsDir, skills: skillsDir, commands: commandsDir } = scopeRoots(scope);
  const [agentResources, skillResources, commandResources] = await Promise.all([
    readAgentComponents([agentsDir], fileService),
    readSkills(skillsDir, [skillsDir], fileService),
    includeCommands ? readAgentComponents([commandsDir], fileService) : []
  ]);
  const agents = /* @__PURE__ */ new Map();
  const skills = /* @__PURE__ */ new Map();
  collectByName(agents, agentResources.map(toParsedAgent));
  const standaloneSkills = await excludeNativePluginSkills(skillResources, fileService);
  collectByName(skills, standaloneSkills.map(toParsedSkill));
  collectByName(skills, commandResources.map(toParsedSkill));
  return [...agents.values(), ...skills.values()];
}

async function scanClaudeDiskCustomizations(workingDirectory, userHome, fileService) {
  const scopes = workingDirectory ? [workingDirectory, userHome] : [userHome];
  const agents = /* @__PURE__ */ new Map();
  const skills = /* @__PURE__ */ new Map();
  for (const scope of scopes) {
    const discovered = await scanClaudeCustomizationScope(scope, fileService);
    collectByName(agents, discovered.filter((item) => item.customization.type === "agent" /* Agent */));
    collectByName(skills, discovered.filter((item) => item.customization.type === "skill" /* Skill */));
  }
  return [...agents.values(), ...skills.values()];
}
export { scopeRoots, collectByName, excludeNativePluginSkills, scanClaudeCustomizationScope, scanClaudeDiskCustomizations };
