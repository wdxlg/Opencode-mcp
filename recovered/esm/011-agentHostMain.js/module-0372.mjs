// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexCustomizations.ts
import { URI } from "./module-0023.mjs";
import { basename2, extUriBiasedIgnorePathCase } from "./module-0025.mjs";
import { readAgentComponents, toParsedAgent } from "./module-0126.mjs";
import { customizationId } from "./module-0047.mjs";
import { Schemas } from "./module-0024.mjs";
import { isAbsolute, normalize } from "./module-0018.mjs";


// src/vs/platform/agentHost/node/codex/codexCustomizations.ts
import { createHash as createHash2 } from "crypto";

var CODEX_SKILLS_SCHEME = "codex-skills";

var CODEX_HOOKS_SCHEME = "codex-hooks";

async function discoverCodexWorkspaceAgents(workingDirectories, fileService) {
  const agents = [];
  const containers = [];
  const seenDirectories = /* @__PURE__ */ new Set();
  const seenNames = /* @__PURE__ */ new Set();
  for (const workingDirectory of workingDirectories) {
    const directory = URI.joinPath(workingDirectory, ".github", "agents");
    const directoryKey = extUriBiasedIgnorePathCase.getComparisonKey(directory);
    if (seenDirectories.has(directoryKey)) {
      continue;
    }
    seenDirectories.add(directoryKey);
    let candidateFiles;
    try {
      const stat3 = await fileService.resolve(directory);
      candidateFiles = stat3.children?.filter((child) => {
        const filename = basename2(child.resource);
        return child.isFile && filename.endsWith(".md") && filename !== "README.md";
      }).map((child) => child.resource) ?? [];
    } catch {
      continue;
    }
    const children = [];
    for (const resource of await readAgentComponents(candidateFiles, fileService)) {
      if (seenNames.has(resource.name)) {
        continue;
      }
      seenNames.add(resource.name);
      const agent = toParsedAgent(resource);
      agents.push(agent);
      children.push(agent);
    }
    if (children.length === 0) {
      continue;
    }
    const uri = directory.toString();
    containers.push({
      type: "directory" /* Directory */,
      id: customizationId(uri),
      uri,
      name: ".github",
      enabled: true,
      contents: "agent" /* Agent */,
      writable: true,
      load: { kind: "loaded" /* Loaded */ },
      children: children.map((agent) => agent.customization)
    });
  }
  return { agents, containers };
}

async function discoverCodexWorkspaceInstructions(workingDirectories, fileService) {
  const containers = [];
  const seenDirectories = /* @__PURE__ */ new Set();
  for (const workingDirectory of workingDirectories) {
    const directoryKey = extUriBiasedIgnorePathCase.getComparisonKey(workingDirectory);
    if (seenDirectories.has(directoryKey)) {
      continue;
    }
    seenDirectories.add(directoryKey);
    const resource = URI.joinPath(workingDirectory, "AGENTS.md");
    try {
      if (!(await fileService.stat(resource)).isFile) {
        continue;
      }
    } catch {
      continue;
    }
    const ruleUri = resource.toString();
    const rule = {
      type: "rule" /* Rule */,
      id: customizationId(ruleUri),
      uri: ruleUri,
      name: "AGENTS.md",
      alwaysApply: true
    };
    const directoryUri = workingDirectory.toString();
    containers.push({
      type: "directory" /* Directory */,
      id: customizationId(directoryUri),
      uri: directoryUri,
      name: basename2(workingDirectory),
      enabled: true,
      contents: "rule" /* Rule */,
      writable: false,
      load: { kind: "loaded" /* Loaded */ },
      children: [rule]
    });
  }
  return containers;
}

function localFileComparisonKey(resource) {
  if (resource.scheme !== Schemas.file || !resource.path.startsWith("/") || !isAbsolute(resource.fsPath)) {
    return void 0;
  }
  const normalized = extUriBiasedIgnorePathCase.removeTrailingPathSeparator(URI.file(normalize(resource.fsPath)));
  return {
    key: extUriBiasedIgnorePathCase.getComparisonKey(normalized),
    resource: normalized
  };
}

function capabilityRootId(comparisonKey) {
  const digest = createHash2("sha256").update("codex-selected-capability-root-v1\0").update(comparisonKey).digest("hex");
  return `codex-selected-capability-root-v1-${digest}`;
}

function codexSelectedCapabilityRootCandidates(workingDirectories) {
  const primaryKey = workingDirectories.length > 0 ? localFileComparisonKey(workingDirectories[0])?.key : void 0;
  const seenRoots = /* @__PURE__ */ new Set();
  const seenCandidates = /* @__PURE__ */ new Set();
  const result = [];
  for (const workingDirectory of workingDirectories.slice(1)) {
    const root = localFileComparisonKey(workingDirectory);
    if (!root || root.key === primaryKey || seenRoots.has(root.key)) {
      continue;
    }
    seenRoots.add(root.key);
    for (const segments of [[".agents", "skills"], [".codex", "skills"]]) {
      const candidate = localFileComparisonKey(URI.joinPath(root.resource, ...segments));
      if (!candidate || seenCandidates.has(candidate.key)) {
        continue;
      }
      seenCandidates.add(candidate.key);
      result.push({
        id: capabilityRootId(candidate.key),
        location: {
          type: "environment",
          environmentId: "local",
          path: candidate.resource.fsPath
        }
      });
    }
  }
  return result;
}

function skillScopeContainerName(scope) {
  switch (scope) {
    case "repo":
      return "Repository";
    case "user":
      return "User";
    case "system":
      return "Built-in";
    case "admin":
      return "Admin";
    default:
      return scope;
  }
}

var SKILL_SCOPE_ORDER = ["repo", "user", "system", "admin"];

function skillToCustomization(skill) {
  const uri = URI.file(skill.path).toString();
  return {
    type: "skill" /* Skill */,
    id: customizationId(uri),
    uri,
    name: skill.name,
    description: skill.description,
    enabled: skill.enabled
  };
}

function codexSkillsToContainers(response) {
  const byScope = /* @__PURE__ */ new Map();
  for (const entry of response?.data ?? []) {
    for (const skill of entry.skills ?? []) {
      let scoped = byScope.get(skill.scope);
      if (!scoped) {
        scoped = /* @__PURE__ */ new Map();
        byScope.set(skill.scope, scoped);
      }
      if (!scoped.has(skill.path)) {
        scoped.set(skill.path, skill);
      }
    }
  }
  const containers = [];
  for (const scope of SKILL_SCOPE_ORDER) {
    const scoped = byScope.get(scope);
    if (!scoped || scoped.size === 0) {
      continue;
    }
    const children = [...scoped.values()].sort((a, b) => a.name.localeCompare(b.name)).map(skillToCustomization);
    const containerUri = URI.from({ scheme: CODEX_SKILLS_SCHEME, path: `/${scope}` }).toString();
    containers.push({
      type: "directory" /* Directory */,
      id: customizationId(containerUri),
      uri: containerUri,
      name: skillScopeContainerName(scope),
      enabled: true,
      contents: "skill" /* Skill */,
      writable: false,
      load: { kind: "loaded" /* Loaded */ },
      children
    });
  }
  return containers;
}

function hookToCustomization(hook) {
  const uri = URI.file(hook.sourcePath).with({ fragment: hook.key }).toString();
  return {
    type: "hook" /* Hook */,
    id: customizationId(uri),
    uri,
    name: hook.eventName,
    enabled: hook.enabled
  };
}

function codexHooksToContainers(response) {
  const byKey = /* @__PURE__ */ new Map();
  for (const entry of response?.data ?? []) {
    for (const hook of entry.hooks ?? []) {
      if (!byKey.has(hook.key)) {
        byKey.set(hook.key, hook);
      }
    }
  }
  if (byKey.size === 0) {
    return [];
  }
  const children = [...byKey.values()].sort((a, b) => Number(a.displayOrder - b.displayOrder) || a.key.localeCompare(b.key)).map(hookToCustomization);
  const containerUri = URI.from({ scheme: CODEX_HOOKS_SCHEME, path: "/hooks" }).toString();
  return [{
    type: "directory" /* Directory */,
    id: customizationId(containerUri),
    uri: containerUri,
    name: "Hooks",
    enabled: true,
    contents: "hook" /* Hook */,
    writable: false,
    load: { kind: "loaded" /* Loaded */ },
    children
  }];
}
export { discoverCodexWorkspaceAgents, discoverCodexWorkspaceInstructions, localFileComparisonKey, capabilityRootId, codexSelectedCapabilityRootCandidates, skillScopeContainerName, skillToCustomization, codexSkillsToContainers, hookToCustomization, codexHooksToContainers, createHash2, CODEX_SKILLS_SCHEME, CODEX_HOOKS_SCHEME, SKILL_SCOPE_ORDER };
