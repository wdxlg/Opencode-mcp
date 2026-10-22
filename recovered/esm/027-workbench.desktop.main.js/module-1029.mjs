// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/agentPluginEnablement.ts
import { CollisionEnablementModel } from "./module-1018.mjs";


// src/vs/workbench/contrib/chat/common/plugins/agentPluginEnablement.ts
var COPILOT_CLI_INSTALL_PATH_FRAGMENT = "/.copilot/installed-plugins/";

var AgentPluginCollisionEnablementModel = class extends CollisionEnablementModel {
  constructor(base, collisionGroups) {
    super(base, collisionGroups);
  }
};

function getSortedAgentPlugins(discoveries) {
  return getUniqueAgentPluginCandidates(discoveries).map((candidate) => candidate.plugin).sort((a, b) => a.uri.toString().localeCompare(b.uri.toString()));
}

function getCanonicalAgentPluginCollisionGroups(discoveries, isBlocked) {
  const candidates = getUniqueAgentPluginCandidates(discoveries);
  const byCanonicalKey = /* @__PURE__ */ new Map();
  for (const candidate of candidates) {
    if (isBlocked?.(candidate.plugin)) {
      continue;
    }
    let group2 = byCanonicalKey.get(candidate.canonicalKey);
    if (!group2) {
      group2 = [];
      byCanonicalKey.set(candidate.canonicalKey, group2);
    }
    group2.push(candidate.plugin.uri.toString());
  }
  const groups = /* @__PURE__ */ new Map();
  for (const group2 of byCanonicalKey.values()) {
    if (group2.length < 2) {
      continue;
    }
    for (const key3 of group2) {
      groups.set(key3, group2);
    }
  }
  return groups;
}

function isAgentPluginBlockedByPolicy(plugin, enabledPluginsPolicy) {
  const pluginId = getAgentPluginPolicyId(plugin);
  return pluginId !== void 0 && enabledPluginsPolicy?.[pluginId] === false;
}

function isAgentPluginForceEnabledByPolicy(plugin, enabledPluginsPolicy) {
  const pluginId = getAgentPluginPolicyId(plugin);
  return pluginId !== void 0 && enabledPluginsPolicy?.[pluginId] === true;
}

function getAgentPluginPolicyId(plugin) {
  const identity2 = getPolicyIdentity(plugin);
  return identity2 ? `${identity2.name}@${identity2.marketplace}` : void 0;
}

function getAgentPluginCandidates(discoveries) {
  const candidates = [];
  for (const discovery of discoveries) {
    for (let pluginOrder = 0; pluginOrder < discovery.plugins.length; pluginOrder++) {
      const plugin = discovery.plugins[pluginOrder];
      candidates.push({
        plugin,
        priority: discovery.priority,
        order: discovery.order,
        pluginOrder,
        canonicalKey: getCanonicalPluginIdentity(plugin)
      });
    }
  }
  return candidates.sort(
    (a, b) => a.priority - b.priority || a.order - b.order || a.pluginOrder - b.pluginOrder || a.plugin.uri.toString().localeCompare(b.plugin.uri.toString())
  );
}

function getUniqueAgentPluginCandidates(discoveries) {
  const unique2 = [];
  const seen = /* @__PURE__ */ new Set();
  for (const candidate of getAgentPluginCandidates(discoveries)) {
    const key3 = candidate.plugin.uri.toString();
    if (seen.has(key3)) {
      continue;
    }
    seen.add(key3);
    unique2.push(candidate);
  }
  return unique2;
}

function getCanonicalPluginIdentity(plugin) {
  return getMarketplaceCanonicalIdentity(plugin.fromMarketplace) ?? getCopilotCliInstallCanonicalIdentity(plugin) ?? `uri:${plugin.uri.toString()}`;
}

function getMarketplaceCanonicalIdentity(plugin) {
  if (!plugin) {
    return void 0;
  }
  const normalizedName = normalizePluginIdentitySegment(plugin.name);
  const source = plugin.sourceDescriptor;
  switch (source.kind) {
    case "relativePath" /* RelativePath */: {
      if (plugin.marketplaceReference.githubRepo) {
        return `github:${plugin.marketplaceReference.githubRepo.toLowerCase()}|${normalizedName}`;
      }
      return `marketplace:${plugin.marketplaceReference.canonicalId}|${normalizedName}`;
    }
    case "github" /* GitHub */: {
      const github = source;
      return `github:${github.repo.toLowerCase()}|${normalizedName}`;
    }
    case "url" /* GitUrl */: {
      const git = source;
      return `git:${git.url.toLowerCase()}|${normalizedName}`;
    }
    case "npm" /* Npm */: {
      const npm = source;
      return `npm:${npm.package.toLowerCase()}|${normalizedName}`;
    }
    case "pip" /* Pip */: {
      const pip = source;
      return `pip:${pip.package.toLowerCase()}|${normalizedName}`;
    }
  }
}

function getCopilotCliInstallCanonicalIdentity(plugin) {
  if (plugin.uri.scheme !== "file") {
    return void 0;
  }
  const idx = plugin.uri.path.indexOf(COPILOT_CLI_INSTALL_PATH_FRAGMENT);
  if (idx === -1) {
    return void 0;
  }
  const segments = plugin.uri.path.slice(idx + COPILOT_CLI_INSTALL_PATH_FRAGMENT.length).split("/").filter((s) => s.length > 0);
  if (segments.length !== 2) {
    return void 0;
  }
  const [bucket, installName] = segments;
  const normalizedName = normalizePluginIdentitySegment(plugin.label || installName);
  if (bucket !== "_direct") {
    return `copilot-cli-marketplace:${normalizePluginIdentitySegment(bucket)}|${normalizedName}`;
  }
  const match2 = /^(?<owner>.+)--(?<repo>.+)--(?<plugin>.+)$/.exec(installName);
  const groups = match2?.groups;
  if (!groups) {
    return void 0;
  }
  return `github:${groups.owner.toLowerCase()}/${groups.repo.toLowerCase()}|${normalizePluginIdentitySegment(groups.plugin)}`;
}

function normalizePluginIdentitySegment(value2) {
  return value2.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_.:-]/g, "-").replace(/-+/g, "-").replace(/^[-:.]+|[-:.]+$/g, "");
}

function getPolicyIdentity(plugin) {
  const m = plugin.fromMarketplace;
  if (m) {
    return { name: m.name, marketplace: m.marketplace, marketplaceReference: m.marketplaceReference };
  }
  if (plugin.uri.scheme !== "file") {
    return void 0;
  }
  const idx = plugin.uri.path.indexOf(COPILOT_CLI_INSTALL_PATH_FRAGMENT);
  if (idx === -1) {
    return void 0;
  }
  const segments = plugin.uri.path.slice(idx + COPILOT_CLI_INSTALL_PATH_FRAGMENT.length).split("/").filter((s) => s.length > 0);
  if (segments.length !== 2) {
    return void 0;
  }
  const [marketplace, name] = segments;
  if (marketplace === "_direct") {
    return void 0;
  }
  return { name, marketplace };
}
export { getSortedAgentPlugins, getCanonicalAgentPluginCollisionGroups, isAgentPluginBlockedByPolicy, isAgentPluginForceEnabledByPolicy, getAgentPluginPolicyId, getAgentPluginCandidates, getUniqueAgentPluginCandidates, getCanonicalPluginIdentity, getMarketplaceCanonicalIdentity, getCopilotCliInstallCanonicalIdentity, normalizePluginIdentitySegment, getPolicyIdentity, COPILOT_CLI_INSTALL_PATH_FRAGMENT, AgentPluginCollisionEnablementModel };
