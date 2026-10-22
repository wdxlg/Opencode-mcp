// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexClientCustomizations.ts
import { isCustomizationEnabled } from "./module-0157.mjs";
import { readClientPluginMcpDefaultCwd } from "./module-0311.mjs";
import { toCodexMcpServerJson } from "./module-0371.mjs";
import { dirname } from "./module-0018.mjs";
import { parseFrontMatter } from "./module-0123.mjs";
import { parseRuleFile, resolveAgentDisableModelInvocation } from "./module-0126.mjs";
import { basename2, extUri, joinPath, relativePath } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-0304.mjs";


// src/vs/platform/agentHost/node/codex/codexClientCustomizations.ts
var CodexClientCustomizationStore = class {
  constructor() {
    this._byClient = /* @__PURE__ */ new Map();
    this._enablement = /* @__PURE__ */ new Map();
  }
  /** Replace one client's synced+parsed plugin set. */
  setClient(clientId, plugins) {
    this._byClient.set(clientId, plugins);
  }
  /** Drop a client's contribution. Returns whether anything was removed. */
  removeClient(clientId) {
    return this._byClient.delete(clientId);
  }
  setEnabled(id2, enabled) {
    const current = this._enablement.get(id2) !== false;
    if (current === enabled) {
      return false;
    }
    this._enablement.set(id2, enabled);
    return true;
  }
  /** Whether a client-pushed customization with this id exists in the store. */
  has(id2) {
    return this._merged().some((p) => p.synced.customization.id === id2);
  }
  /** Whether the store holds any client-pushed customizations. */
  isEmpty() {
    return this._merged().length === 0;
  }
  /** Merge of every client's plugins, deduplicated by customization id (first client wins). */
  _merged() {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const plugins of this._byClient.values()) {
      for (const plugin of plugins) {
        const id2 = plugin.synced.customization.id;
        if (seen.has(id2)) {
          continue;
        }
        seen.add(id2);
        out.push(plugin);
      }
    }
    return out;
  }
  _isEnabled(plugin) {
    return this._enablement.get(plugin.synced.customization.id) ?? isCustomizationEnabled(plugin.customization ?? plugin.synced.customization);
  }
  /** Every client plugin, deduplicated by customization id. */
  plugins() {
    return this._merged();
  }
  isEnabled(plugin) {
    return this._isEnabled(plugin);
  }
  /** The merged plugins that are currently enabled and successfully parsed. */
  enabledPlugins() {
    return this._merged().filter((p) => p.parsed !== void 0 && this._isEnabled(p));
  }
  /**
   * Projects the store onto the AHP {@link PluginCustomization} surface, with
   * the enablement overlay applied and each plugin's parsed children folded
   * in (skills, MCP servers, agents, instructions, hooks).
   */
  toCustomizations() {
    return this._merged().map((plugin) => {
      const base = plugin.customization ?? plugin.synced.customization;
      const children = base.children ?? (plugin.parsed ? parsedPluginChildren(plugin.parsed) : void 0);
      return {
        ...base,
        ...this._enablement.has(base.id) ? { enablement: [{ kind: "session" /* Session */, enabled: this._enablement.get(base.id) }] } : {},
        ...children ? { children } : {}
      };
    });
  }
};

function parsedPluginChildren(parsed) {
  const byId = /* @__PURE__ */ new Map();
  const add = (c) => {
    if (!byId.has(c.id)) {
      byId.set(c.id, c);
    }
  };
  for (const a of parsed.agents) {
    add(a.customization);
  }
  for (const s of parsed.skills) {
    add(s.customization);
  }
  for (const r of parsed.instructions) {
    add(r.customization);
  }
  for (const h of parsed.hooks) {
    add(h.customization);
  }
  for (const m of parsed.mcpServers) {
    add(m.customization);
  }
  return [...byId.values()];
}

function codexMcpServersFromPlugins(plugins, primaryCwd) {
  const out = {};
  for (const plugin of plugins) {
    for (const def of plugin.parsed?.mcpServers ?? emptyMcpDefs) {
      const child = plugin.customization?.children?.find((candidate) => candidate.type === "mcpServer" /* McpServer */ && candidate.name === def.name);
      if (child && !isCustomizationEnabled(child)) {
        continue;
      }
      if (!Object.prototype.hasOwnProperty.call(out, def.name)) {
        const defaultCwd = readClientPluginMcpDefaultCwd(plugin.synced.customization, def.name, primaryCwd) ?? def.defaultCwd;
        out[def.name] = toCodexMcpServerJson(def.configuration, defaultCwd);
      }
    }
  }
  return out;
}

function codexPluginMcpServerSources(plugins) {
  const sources = /* @__PURE__ */ new Map();
  for (const plugin of plugins) {
    for (const server of plugin.parsed?.mcpServers ?? emptyMcpDefs) {
      if (!sources.has(server.name)) {
        sources.set(server.name, plugin.synced.customization.uri);
      }
    }
  }
  return sources;
}

var emptyMcpDefs = [];

function codexMcpServersFromDefinitions(definitions2) {
  const out = {};
  for (const definition of definitions2) {
    if (!Object.hasOwn(out, definition.name)) {
      out[definition.name] = toCodexMcpServerJson(definition.configuration, definition.defaultCwd);
    }
  }
  return out;
}

function codexSkillRootsFromPlugins(plugins) {
  const roots = /* @__PURE__ */ new Set();
  for (const plugin of plugins) {
    for (const skill of plugin.parsed?.skills ?? []) {
      roots.add(dirname(dirname(skill.uri.fsPath)));
    }
  }
  return [...roots].sort();
}

async function codexCustomizationConfig(workspaceAgents, plugins, selectedAgent, fileService) {
  const agentRoles = /* @__PURE__ */ new Map();
  const pluginInstructions = [];
  let selectedAgentInstructions;
  let selectedAgentMatch = 0 /* None */;
  const selectedAgentUri = selectedAgent?.uri;
  const addAgent = async (agent, match2) => {
    try {
      const content = (await fileService.readFile(agent.uri)).value.toString();
      const frontmatter = parseFrontMatter(content);
      const name = frontmatter?.getStringValue("name")?.trim() || agent.name;
      const description = frontmatter?.getStringValue("description")?.trim() || agent.description || name;
      const instructions = frontmatter?.body ?? content;
      const model = frontmatter?.getStringArrayValue("model")?.map((value) => value.trim()).find(Boolean) || agent.model;
      const infer = frontmatter?.getBooleanValue("infer");
      const disableModelInvocation = resolveAgentDisableModelInvocation(infer, frontmatter?.getBooleanValue("disable-model-invocation"), agent.disableModelInvocation);
      if (!disableModelInvocation && !agentRoles.has(name)) {
        agentRoles.set(name, {
          name,
          description,
          instructions,
          ...model ? { model } : {}
        });
      }
      if (match2 > selectedAgentMatch) {
        selectedAgentInstructions = instructions;
        selectedAgentMatch = match2;
      }
    } catch {
    }
  };
  for (const agent of workspaceAgents) {
    const match2 = selectedAgentUri && extUri.isEqual(agent.uri, URI.parse(selectedAgentUri)) ? 2 /* Exact */ : 0 /* None */;
    await addAgent(agent, match2);
  }
  for (const plugin of plugins) {
    for (const agent of plugin.parsed?.agents ?? []) {
      const match2 = selectedAgentUri ? matchSelectedAgent(plugin, agent.uri, selectedAgentUri) : 0 /* None */;
      await addAgent(agent, match2);
    }
    for (const instruction of plugin.parsed?.instructions ?? []) {
      try {
        const rule = await parseRuleFile(instruction.uri, fileService);
        if (!isAlwaysOnRule(rule.globs, rule.alwaysApply)) {
          continue;
        }
        const content = (await fileService.readFile(instruction.uri)).value.toString();
        const frontmatter = parseFrontMatter(content);
        const body = frontmatter?.body ?? content;
        if (body.trim()) {
          pluginInstructions.push(body.trim());
        }
      } catch {
      }
    }
  }
  const developerInstructions = [
    ...pluginInstructions,
    ...selectedAgentInstructions ? [selectedAgentInstructions.trim()] : []
  ].filter(Boolean).join("\n\n");
  return {
    agentRoles: [...agentRoles.values()],
    ...developerInstructions ? { developerInstructions } : {}
  };
}

function isAlwaysOnRule(globs, alwaysApply) {
  if (!globs?.length) {
    return alwaysApply !== false;
  }
  return globs.some((glob) => glob.trim() === "**" || glob.trim() === "**/*");
}

function matchSelectedAgent(plugin, agentUri, selectedAgentUri) {
  const selectedUri = URI.parse(selectedAgentUri);
  if (extUri.isEqual(agentUri, selectedUri)) {
    return 2 /* Exact */;
  }
  const pluginDir = plugin.synced.pluginDir;
  if (!pluginDir) {
    return 0 /* None */;
  }
  const relativeAgentPath = relativePath(pluginDir, agentUri);
  if (relativeAgentPath === void 0) {
    return 0 /* None */;
  }
  const sourcePluginUri = URI.parse(plugin.synced.customization.uri);
  const sourceAgentUri = relativeAgentPath ? joinPath(sourcePluginUri, relativeAgentPath) : sourcePluginUri;
  if (extUri.isEqual(sourceAgentUri, selectedUri)) {
    return 2 /* Exact */;
  }
  if (sourcePluginUri.scheme === SYNCED_CUSTOMIZATION_SCHEME && relativeAgentPath.startsWith("agents/") && basename2(agentUri) === basename2(selectedUri)) {
    return 1 /* SyntheticBundleSource */;
  }
  return 0 /* None */;
}

function codexAgentRoleToml(role) {
  return [
    `name = ${JSON.stringify(role.name)}`,
    `description = ${JSON.stringify(role.description)}`,
    `developer_instructions = ${JSON.stringify(role.instructions)}`,
    ...role.model ? [`model = ${JSON.stringify(role.model)}`] : [],
    ""
  ].join("\n");
}

function codexSkillCapabilityRoots(plugins) {
  return codexSkillRootsFromPlugins(plugins).map((path) => URI.file(path));
}
export { parsedPluginChildren, codexMcpServersFromPlugins, codexPluginMcpServerSources, codexMcpServersFromDefinitions, codexSkillRootsFromPlugins, codexCustomizationConfig, isAlwaysOnRule, matchSelectedAgent, codexAgentRoleToml, codexSkillCapabilityRoots, CodexClientCustomizationStore, emptyMcpDefs };
