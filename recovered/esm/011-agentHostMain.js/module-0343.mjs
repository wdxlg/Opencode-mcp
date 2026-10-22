// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/claudeBuiltinCommands.ts
import { localize } from "./module-0012.mjs";
import { URI } from "./module-0023.mjs";
import { customizationId } from "./module-0047.mjs";


// src/vs/platform/agentHost/node/claude/customizations/claudeBuiltinCommands.ts
var AGENT_BUILTIN_SCHEME = "agent-builtin";

var CLAUDE_BUILTIN_COMMANDS = [
  { name: "init", description: () => localize(2379, null) },
  { name: "review", description: () => localize(2382, null) },
  { name: "security-review", description: () => localize(2384, null) },
  { name: "code-review", description: () => localize(2377, null) },
  { name: "simplify", description: () => localize(2385, null) },
  { name: "verify", description: () => localize(2387, null) },
  { name: "run", description: () => localize(2383, null) },
  { name: "loop", description: () => localize(2381, null) },
  { name: "claude-api", description: () => localize(2376, null) },
  { name: "fewer-permission-prompts", description: () => localize(2378, null) },
  { name: "update-config", description: () => localize(2386, null) },
  { name: "keybindings-help", description: () => localize(2380, null) },
  { name: "write-a-skill", description: () => localize(2388, null) }
];

var CLAUDE_BUILTIN_AGENTS = [
  { name: "claude", description: () => localize(2389, null) },
  { name: "claude-code-guide", description: () => localize(2390, null) },
  { name: "Explore", description: () => localize(2391, null) },
  { name: "general-purpose", description: () => localize(2392, null) },
  { name: "Plan", description: () => localize(2393, null) }
];

function buildBuiltinSkillsContainer(entries) {
  if (entries.length === 0) {
    return void 0;
  }
  const children = entries.map((entry) => {
    const uri = URI.from({ scheme: AGENT_BUILTIN_SCHEME, path: `/skill/${encodeURIComponent(entry.name)}` }).toString();
    return {
      type: "skill" /* Skill */,
      id: customizationId(uri),
      uri,
      name: entry.name,
      description: entry.description
    };
  });
  const containerUri = URI.from({ scheme: AGENT_BUILTIN_SCHEME, path: "/skills" }).toString();
  return {
    type: "directory" /* Directory */,
    id: customizationId(containerUri),
    uri: containerUri,
    name: "builtin",
    enabled: true,
    contents: "skill" /* Skill */,
    writable: false,
    load: { kind: "loaded" /* Loaded */ },
    children
  };
}

function buildClaudeBuiltinSkillsContainer(diskSkillNames) {
  return buildBuiltinSkillsContainer(
    CLAUDE_BUILTIN_COMMANDS.filter((cmd) => !diskSkillNames.has(cmd.name)).map((cmd) => ({ name: cmd.name, description: cmd.description() }))
  );
}

function buildSdkBuiltinSkillsContainer(commands, diskSkillNames) {
  const seen = /* @__PURE__ */ new Set();
  const entries = [];
  for (const command of commands) {
    if (diskSkillNames.has(command.name) || seen.has(command.name)) {
      continue;
    }
    seen.add(command.name);
    entries.push({ name: command.name, description: command.description });
  }
  return buildBuiltinSkillsContainer(entries);
}
export { buildBuiltinSkillsContainer, buildClaudeBuiltinSkillsContainer, buildSdkBuiltinSkillsContainer, AGENT_BUILTIN_SCHEME, CLAUDE_BUILTIN_COMMANDS, CLAUDE_BUILTIN_AGENTS };
