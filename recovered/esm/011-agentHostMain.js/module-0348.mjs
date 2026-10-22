// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/claudeSessionCustomizationDiscovery.ts
import { URI } from "./module-0023.mjs";
import { customizationId } from "./module-0047.mjs";
import { findMostSpecificClaudeWorkspaceRoot } from "./module-0345.mjs";
import { isEqualOrParent2 } from "./module-0025.mjs";
import { distinctClaudeWorkingDirectories } from "./module-0347.mjs";
import { makeMcpServerCustomization, parseAgentFile, toParsedAgent } from "./module-0126.mjs";
import { CLAUDE_BUILTIN_AGENTS, buildClaudeBuiltinSkillsContainer, buildSdkBuiltinSkillsContainer } from "./module-0343.mjs";
import { deriveMcpState } from "./module-0341.mjs";
import { isHostInjectedMcpServerName } from "./module-0340.mjs";
import { Disposable } from "./module-0010.mjs";
import { claudeMemoryFiles } from "./module-0342.mjs";
import { Event } from "./module-0016.mjs";


// src/vs/platform/agentHost/node/claude/customizations/claudeSessionCustomizationDiscovery.ts
var CLAUDE_SDK_DEFAULT_AGENT_NAME = "general-purpose";

var CLAUDE_INTERNAL_SCHEME = "claude-internal";

function makeDirectory(base, sub, contents, children) {
  const uri = URI.joinPath(base, ".claude", sub).toString();
  return {
    type: "directory" /* Directory */,
    id: customizationId(uri),
    uri,
    name: sub,
    enabled: true,
    contents,
    writable: true,
    load: { kind: "loaded" /* Loaded */ },
    children: [...children]
  };
}

function makePlugin(plugin) {
  const uri = plugin.root.toString();
  const children = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (child) => {
    if (!seen.has(child.id)) {
      seen.add(child.id);
      children.push(child);
    }
  };
  for (const agent of plugin.parsed.agents) {
    push(agent.customization);
  }
  for (const skill of plugin.parsed.skills) {
    push(skill.customization);
  }
  for (const rule of plugin.parsed.instructions) {
    push(rule.customization);
  }
  for (const hook of plugin.parsed.hooks) {
    push(hook.customization);
  }
  for (const mcp of plugin.parsed.mcpServers) {
    push(mcp.customization);
  }
  return {
    type: "plugin" /* Plugin */,
    id: customizationId(uri),
    uri,
    name: plugin.id,
    load: { kind: "loaded" /* Loaded */ },
    children
  };
}

function createBucket(base) {
  return { base, agents: [], skills: [], rules: [], hooks: [] };
}

function findCustomizationBucket(uri, workspaceBuckets, userBucket) {
  const root = findMostSpecificClaudeWorkspaceRoot(uri, workspaceBuckets.map((bucket) => bucket.base));
  if (workspaceBuckets.length > 1 && uri.scheme === userBucket.base.scheme && isEqualOrParent2(uri, userBucket.base) && (!root || userBucket.base.path.length > root.path.length)) {
    return userBucket;
  }
  return workspaceBuckets.find((bucket) => bucket.base === root) ?? userBucket;
}

function mapDiscoveredCustomizations(discovered, mcpServers, hooks, nativePlugins, workingDirectories, userHome) {
  const roots = distinctClaudeWorkingDirectories(Array.isArray(workingDirectories) ? workingDirectories : workingDirectories ? [workingDirectories] : []);
  const workspaceBuckets = roots.map(createBucket);
  const userBucket = createBucket(userHome);
  for (const d of discovered) {
    const bucket = findCustomizationBucket(d.uri, workspaceBuckets, userBucket);
    if (d.customization.type === "agent" /* Agent */) {
      bucket.agents.push(d.customization);
    } else if (d.customization.type === "skill" /* Skill */) {
      bucket.skills.push(d.customization);
    } else {
      bucket.rules.push(d.customization);
    }
  }
  for (const hook of hooks) {
    findCustomizationBucket(URI.parse(hook.uri), workspaceBuckets, userBucket).hooks.push(hook);
  }
  const result = [];
  for (const bucket of [...workspaceBuckets, userBucket]) {
    if (bucket.agents.length > 0) {
      result.push(makeDirectory(bucket.base, "agents", "agent" /* Agent */, bucket.agents));
    }
    if (bucket.skills.length > 0) {
      result.push(makeDirectory(bucket.base, "skills", "skill" /* Skill */, bucket.skills));
    }
    if (bucket.rules.length > 0) {
      result.push(makeDirectory(bucket.base, "rules", "rule" /* Rule */, bucket.rules));
    }
    if (bucket.hooks.length > 0) {
      result.push(makeDirectory(bucket.base, "hooks", "hook" /* Hook */, bucket.hooks));
    }
  }
  for (const plugin of nativePlugins) {
    result.push(makePlugin(plugin));
  }
  result.push(...mcpServers);
  return result;
}

function nonEditableUri(kind, name) {
  return URI.from({ scheme: CLAUDE_INTERNAL_SCHEME, path: `/${kind}/${encodeURIComponent(name)}` });
}

function createClaudeInternalMcpServerCustomization(name) {
  return makeMcpServerCustomization(nonEditableUri("mcp", name), name);
}

async function resolveClaudeAgentName(agent, fileService, logService, sessionId) {
  if (!agent) {
    return void 0;
  }
  const uri = URI.parse(agent.uri);
  if (uri.scheme === CLAUDE_INTERNAL_SCHEME) {
    const last = uri.path.split("/").pop() ?? "";
    const name2 = last ? decodeURIComponent(last) : "";
    if (!name2) {
      logService.warn(`[Claude:${sessionId}] resolveClaudeAgentName: could not extract agent name from URI '${agent.uri}'`);
      return void 0;
    }
    return name2;
  }
  try {
    const parsed = await parseAgentFile(uri, fileService);
    if (parsed.name) {
      return parsed.name;
    }
  } catch (err) {
    logService.warn(`[Claude:${sessionId}] resolveClaudeAgentName: failed to parse agent file '${agent.uri}', falling back to basename`, err);
  }
  const basename3 = uri.path.split("/").pop() ?? "";
  const name = basename3.replace(/\.md$/i, "");
  if (!name) {
    logService.warn(`[Claude:${sessionId}] resolveClaudeAgentName: could not extract agent name from URI '${agent.uri}'`);
    return void 0;
  }
  return name;
}

function buildDiscoveredCustomizations(discovered, mcpServers, hooks, nativePlugins, workingDirectories, userHome, sdk) {
  const visiblePlugins = [];
  const pluginAgentNames = /* @__PURE__ */ new Set();
  const pluginSkillNames = /* @__PURE__ */ new Set();
  const pluginMcpNames = /* @__PURE__ */ new Set();
  if (sdk) {
    for (const p of nativePlugins) {
      const sdkPlugin = sdk.plugins.find((s) => s.source === p.id || URI.file(s.path).fsPath === p.root.fsPath);
      if (!sdkPlugin) {
        continue;
      }
      visiblePlugins.push(p);
      const ns = sdkPlugin.name;
      const add = (set, name) => {
        set.add(name);
        if (ns) {
          set.add(`${ns}:${name}`);
        }
      };
      for (const a of p.parsed.agents) {
        add(pluginAgentNames, a.name);
      }
      for (const s of p.parsed.skills) {
        add(pluginSkillNames, s.name);
      }
      for (const m of p.parsed.mcpServers) {
        add(pluginMcpNames, m.name);
      }
    }
  } else {
    visiblePlugins.push(...nativePlugins);
  }
  const diskSkillNames = new Set(
    discovered.filter((d) => d.customization.type === "skill" /* Skill */).map((d) => d.name)
  );
  const builtinSkills = sdk ? buildSdkBuiltinSkillsContainer(sdk.commands.filter((c) => !pluginSkillNames.has(c.name)), diskSkillNames) : buildClaudeBuiltinSkillsContainer(diskSkillNames);
  const withBuiltinSkills = (list) => builtinSkills ? [...list, builtinSkills] : list;
  if (!sdk) {
    const diskAgentNames = new Set(
      discovered.filter((d) => d.customization.type === "agent" /* Agent */).map((d) => d.name)
    );
    const builtinAgents = CLAUDE_BUILTIN_AGENTS.filter((a) => a.name !== CLAUDE_SDK_DEFAULT_AGENT_NAME && !diskAgentNames.has(a.name)).map((a) => toParsedAgent({ uri: nonEditableUri("agent", a.name), name: a.name, description: a.description() }));
    return withBuiltinSkills(mapDiscoveredCustomizations([...discovered, ...builtinAgents], mcpServers, hooks, nativePlugins, workingDirectories, userHome));
  }
  const agentNames = new Set(sdk.agents.map((a) => a.name));
  const commandNames = new Set(sdk.commands.map((c) => c.name));
  const mcpByName = new Map(sdk.mcpServers.map((s) => [s.name, s]));
  const seenAgents = /* @__PURE__ */ new Set();
  const entries = [];
  for (const d of discovered) {
    if (d.customization.type === "agent" /* Agent */) {
      if (d.name === CLAUDE_SDK_DEFAULT_AGENT_NAME) {
        continue;
      }
      if (agentNames.has(d.name)) {
        entries.push(d);
        seenAgents.add(d.name);
      }
    } else if (d.customization.type === "skill" /* Skill */) {
      if (commandNames.has(d.name)) {
        entries.push(d);
      }
    } else {
      entries.push(d);
    }
  }
  for (const agent of sdk.agents) {
    if (agent.name === CLAUDE_SDK_DEFAULT_AGENT_NAME || seenAgents.has(agent.name) || pluginAgentNames.has(agent.name)) {
      continue;
    }
    entries.push(toParsedAgent({ uri: nonEditableUri("agent", agent.name), name: agent.name, ...agent.description ? { description: agent.description } : {} }));
  }
  const seenMcp = /* @__PURE__ */ new Set();
  const servers = [];
  for (const server of mcpServers) {
    const sdkServer = mcpByName.get(server.name);
    if (!sdkServer) {
      continue;
    }
    seenMcp.add(server.name);
    servers.push({ ...server, state: deriveMcpState(sdkServer.status) });
  }
  for (const [name, sdkServer] of mcpByName) {
    if (seenMcp.has(name) || pluginMcpNames.has(name)) {
      continue;
    }
    if (isHostInjectedMcpServerName(name)) {
      continue;
    }
    servers.push({ ...createClaudeInternalMcpServerCustomization(name), state: deriveMcpState(sdkServer.status) });
  }
  return withBuiltinSkills(mapDiscoveredCustomizations(entries, servers, hooks, visiblePlugins, workingDirectories, userHome));
}

var CLAUDE_CUSTOMIZATION_SUBPATHS = Object.freeze([
  "agents",
  "skills",
  "commands",
  "rules",
  "plugins",
  "CLAUDE.md",
  "settings.json",
  "settings.local.json"
]);

var ClaudeCustomizationWatcher = class _ClaudeCustomizationWatcher extends Disposable {
  static {
    this.DEBOUNCE_MS = 300;
  }
  constructor(workingDirectories, userHome, fileService, logService, debounceMs = _ClaudeCustomizationWatcher.DEBOUNCE_MS) {
    super();
    const roots = distinctClaudeWorkingDirectories(Array.isArray(workingDirectories) ? workingDirectories : workingDirectories ? [workingDirectories] : []);
    const triggers = [];
    const watched = /* @__PURE__ */ new Set();
    const watch2 = (uri, recursive) => {
      const key = `${recursive}:${uri.toString()}`;
      if (watched.has(key)) {
        return;
      }
      watched.add(key);
      try {
        this._register(fileService.watch(uri, { recursive, excludes: [] }));
      } catch (err) {
        logService.warn(`[ClaudeCustomizationWatcher] failed to watch '${uri.toString()}': ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    const addClaudeTriggers = (base) => {
      for (const sub of CLAUDE_CUSTOMIZATION_SUBPATHS) {
        triggers.push(URI.joinPath(base, sub));
      }
    };
    const primary = roots[0];
    if (primary) {
      const projectClaude = URI.joinPath(primary, ".claude");
      watch2(projectClaude, true);
      addClaudeTriggers(projectClaude);
      watch2(primary, false);
      triggers.push(URI.joinPath(primary, ".mcp.json"));
    }
    for (const additional of roots.slice(1)) {
      const projectClaude = URI.joinPath(additional, ".claude");
      watch2(projectClaude, true);
      triggers.push(
        URI.joinPath(projectClaude, "agents"),
        URI.joinPath(projectClaude, "skills"),
        URI.joinPath(projectClaude, "settings.json"),
        URI.joinPath(projectClaude, "settings.local.json")
      );
    }
    const userClaude = URI.joinPath(userHome, ".claude");
    watch2(userClaude, true);
    addClaudeTriggers(userClaude);
    triggers.push(...claudeMemoryFiles(primary, userHome));
    this.onDidChange = Event.signal(Event.debounce(
      Event.filter(fileService.onDidFilesChange, (e) => triggers.some((t) => e.affects(t)), this._store),
      (_last, e) => e,
      debounceMs,
      void 0,
      void 0,
      void 0,
      this._store
    ));
  }
};
export { makeDirectory, makePlugin, createBucket, findCustomizationBucket, mapDiscoveredCustomizations, nonEditableUri, createClaudeInternalMcpServerCustomization, resolveClaudeAgentName, buildDiscoveredCustomizations, CLAUDE_SDK_DEFAULT_AGENT_NAME, CLAUDE_INTERNAL_SCHEME, CLAUDE_CUSTOMIZATION_SUBPATHS, ClaudeCustomizationWatcher };
