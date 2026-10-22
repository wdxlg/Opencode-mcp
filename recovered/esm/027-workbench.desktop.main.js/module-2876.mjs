// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationItemProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { AgentCustomizationContentExpander } from "./module-2875.mjs";
import { autorun } from "./module-0052.mjs";
import { URI } from "./module-0032.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-2120.mjs";
import { toAgentHostUri } from "./module-1000.mjs";
import { getCustomizationDisabledReason, isCustomizationEnabled } from "./module-2112.mjs";
import { getAgentHostPluginEnablementActions } from "./module-2658.mjs";
import { readAgentCustomizationMeta } from "./module-2874.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationSources } from "./module-0995.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationItemProvider.ts
var REMOTE_HOST_GROUP = "remote-host";

var REMOTE_CLIENT_GROUP = "remote-client";

var AgentCustomizationItemProvider = class extends Disposable {
  constructor(_connectionAuthority, _getItemActions, _resolveSyncedOrigin, _fileService, _logService, _customAgentsService) {
    super();
    this._connectionAuthority = _connectionAuthority;
    this._getItemActions = _getItemActions;
    this._resolveSyncedOrigin = _resolveSyncedOrigin;
    this._fileService = _fileService;
    this._logService = _logService;
    this._customAgentsService = _customAgentsService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    /** Cache: pluginUri → last expansion (keyed by nonce and label so we re-fetch on content or display-name changes). */
    this._expansionCache = new ResourceMap();
    this._contentExpander = new AgentCustomizationContentExpander(this._fileService, this._logService);
    this._register(this._customAgentsService.onDidChangeCustomizations(() => {
      this._onDidChange.fire();
    }));
  }
  setDraftCustomAgents(customAgents) {
    this._draftCustomAgents = customAgents;
    this._register(autorun((reader) => {
      customAgents.read(reader);
      this._onDidChange.fire();
    }));
  }
  setDraftCustomizations(customizations) {
    this._draftCustomizations = customizations;
    this._register(autorun((reader) => {
      customizations.read(reader);
      this._onDidChange.fire();
    }));
  }
  toRemoteUri(customizationUri) {
    const original = URI.parse(customizationUri);
    if (original.scheme === SYNCED_CUSTOMIZATION_SCHEME) {
      return original;
    }
    return toAgentHostUri(original, this._connectionAuthority);
  }
  toBadge(customization, fromClient) {
    if (fromClient) {
      return {
        groupKey: REMOTE_CLIENT_GROUP
      };
    }
    return {
      groupKey: REMOTE_HOST_GROUP
    };
  }
  toItem(sessionResource, customization, source) {
    const clientId = customization.clientId;
    const badge = this.toBadge(customization, clientId !== void 0);
    const uri5 = this.toRemoteUri(customization.uri);
    return {
      itemKey: customizationItemKey(customization, clientId),
      uri: uri5,
      type: "plugin",
      name: customization.name,
      description: void 0,
      source,
      status: toStatusString(customization.load),
      statusMessage: toStatusMessage(customization.load),
      enabled: isCustomizationEnabled(customization),
      disabledReason: getCustomizationDisabledReason(customization),
      badge: badge.badge,
      badgeTooltip: badge.badgeTooltip,
      groupKey: badge.groupKey,
      extensionId: void 0,
      pluginUri: uri5,
      userInvocable: void 0,
      actions: [
        ...clientId === void 0 ? getAgentHostPluginEnablementActions(this._customAgentsService, void 0, sessionResource, customization, this._customAgentsService.getWorkingDirectories(sessionResource).length > 0) : [],
        ...this._getItemActions?.(customization, clientId) ?? []
      ]
    };
  }
  toDirectoryItems(customization, source, isRemote) {
    const items = [];
    for (const child of customization.children ?? []) {
      const item = this.toDirectoryChildItem(child, source, isRemote);
      if (item) {
        items.push(item);
      }
    }
    return items;
  }
  toDirectoryChildItem(child, source, isRemote) {
    const type = toPromptsType(child.type);
    if (!type) {
      return void 0;
    }
    let userInvocable = void 0;
    if (child.type === "agent" /* Agent */) {
      userInvocable = readAgentCustomizationMeta(child).userInvocable !== false;
    }
    let groupKey = isRemote ? REMOTE_CLIENT_GROUP : void 0;
    let badge = void 0;
    let badgeTooltip = void 0;
    if (!groupKey && child.type === "rule" /* Rule */) {
      const pattern = child.globs?.[0];
      if (child.globs && child.globs.length > 0) {
        groupKey = "context-instructions";
        badge = pattern === "**" ? localize(8926, null) : pattern;
        badgeTooltip = pattern === "**" ? localize(8927, null) : localize(8928, null, pattern);
      } else if (child.alwaysApply) {
        groupKey = "agent-instructions";
      } else {
        groupKey = "on-demand-instructions";
      }
    }
    return {
      itemKey: child.id,
      uri: this.toRemoteUri(child.uri),
      type,
      name: child.name,
      description: getChildDescription(child),
      source,
      groupKey,
      badge,
      badgeTooltip,
      extensionId: void 0,
      pluginUri: void 0,
      userInvocable
    };
  }
  async provideSourceFolders(sessionResource, type, _token) {
    const workingDirectories = this._customAgentsService.getWorkingDirectories(sessionResource);
    const folders = [];
    for (const customization of this._customAgentsService.getCustomizations(sessionResource)) {
      if (!isDirectoryCustomization(customization) || !customization.writable) {
        continue;
      }
      if (toPromptsType(customization.contents) !== type) {
        continue;
      }
      const source = isUnderAnyRoot(workingDirectories, customization.uri) ? AICustomizationSources.local : AICustomizationSources.user;
      folders.push({
        uri: this.toRemoteUri(customization.uri),
        label: customization.name,
        source
      });
    }
    return folders;
  }
  async provideCustomAgents(sessionResource) {
    const agents = this.getCustomAgents(sessionResource);
    const sessionTypes = [getChatSessionType(sessionResource)];
    return agents.map((agent) => ({
      id: agent.uri,
      uri: this.toRemoteUri(agent.uri),
      name: agent.name,
      description: agent.description,
      sessionTypes,
      enabled: true,
      // fill default/empty values for all other properties they will not be used by the UI
      // when making a request, all that's needed is the agent id.
      source: { storage: "local" /* local */ },
      tools: void 0,
      agents: void 0,
      argumentHint: void 0,
      handOffs: void 0,
      hooks: void 0,
      model: void 0,
      agentInstructions: { content: "", toolReferences: [] },
      visibility: {
        agentInvocable: true,
        userInvocable: readAgentCustomizationMeta(agent).userInvocable !== false
      },
      target: "undefined" /* Undefined */
    }));
  }
  async provideChatSessionCustomizations(sessionResource, token) {
    const items = /* @__PURE__ */ new Map();
    const workingDirectories = this._customAgentsService.getWorkingDirectories(sessionResource);
    const plugins = [];
    const expandPromises = [];
    const customizations = this.getCustomizations(sessionResource);
    const directoryCustomizations = [];
    for (const sessionCustomization of customizations) {
      if (isDirectoryCustomization(sessionCustomization)) {
        directoryCustomizations.push(sessionCustomization);
      } else if (sessionCustomization.type === "mcpServer" /* McpServer */) {
        continue;
      } else {
        const isBundleItem = isSyntheticBundle(sessionCustomization);
        const isClientSynced = sessionCustomization.clientId !== void 0;
        const childGroupKey = isClientSynced ? REMOTE_CLIENT_GROUP : REMOTE_HOST_GROUP;
        let item;
        if (!isBundleItem) {
          item = this.toItem(sessionResource, sessionCustomization, AICustomizationSources.plugin);
          items.set(customizationItemKey(sessionCustomization, sessionCustomization.clientId), item);
        } else {
          item = { uri: this.toRemoteUri(sessionCustomization.uri), type: "plugin", source: AICustomizationSources.plugin, name: "", groupKey: childGroupKey, extensionId: void 0, pluginUri: void 0 };
        }
        const pluginMeta = {
          item,
          nonce: sessionCustomization.nonce,
          status: toStatusString(sessionCustomization.load),
          statusMessage: toStatusMessage(sessionCustomization.load),
          enabled: isCustomizationEnabled(sessionCustomization),
          disabledReason: getCustomizationDisabledReason(sessionCustomization),
          childGroupKey,
          isBundleItem,
          pluginLabel: isBundleItem ? void 0 : item.name
        };
        plugins.push(pluginMeta);
        expandPromises.push(this._expandPluginContents(pluginMeta, token));
      }
    }
    const expansions = await Promise.all(expandPromises);
    if (token.isCancellationRequested) {
      return [];
    }
    for (let i2 = 0; i2 < plugins.length; i2++) {
      const p = plugins[i2];
      for (const child of expansions[i2]) {
        const enriched = p.isBundleItem ? this._applySyncedOrigin(child) : child;
        items.set(enriched.uri.toString(), {
          ...enriched,
          status: p.status,
          statusMessage: p.statusMessage,
          enabled: p.enabled,
          disabledReason: p.disabledReason
        });
      }
    }
    for (const sessionCustomization of directoryCustomizations) {
      const source = isUnderAnyRoot(workingDirectories, sessionCustomization.uri) ? AICustomizationSources.local : AICustomizationSources.user;
      const isRemote = sessionCustomization.clientId !== void 0;
      for (const child of this.toDirectoryItems(sessionCustomization, source, isRemote)) {
        items.set(child.itemKey ?? child.uri.toString(), {
          ...child,
          status: toStatusString(sessionCustomization.load),
          statusMessage: toStatusMessage(sessionCustomization.load),
          enabled: sessionCustomization.enabled
        });
      }
    }
    return [...items.values()];
  }
  getCustomAgents(sessionResource) {
    const sessionAgents = this._customAgentsService.getCustomAgents(sessionResource);
    return sessionAgents.length > 0 ? sessionAgents : this._draftCustomAgents?.get() ?? [];
  }
  getCustomizations(sessionResource) {
    const sessionCustomizations = this._customAgentsService.getCustomizations(sessionResource);
    const draftCustomizations = this._draftCustomizations?.get() ?? [];
    if (draftCustomizations.length === 0) {
      return sessionCustomizations;
    }
    const sessionKeys = new Set(sessionCustomizations.map((customization) => `${customization.type}:${customization.uri}`));
    return [
      ...sessionCustomizations,
      ...draftCustomizations.filter((customization) => !sessionKeys.has(`${customization.type}:${customization.uri}`))
    ];
  }
  /**
   * Rewrites a bundle child item to reflect the original source location of
   * the flattened file, when it can be recovered from the synthetic bundle's
   * reverse map. The synced (in-memory) URI is replaced with the real local
   * URI so the item points at its true origin, and the source/extension/plugin
   * metadata is restored. Returns the item unchanged when no origin is known.
   */
  _applySyncedOrigin(child) {
    const origin = this._resolveSyncedOrigin?.(child.uri);
    if (!origin) {
      return child;
    }
    return {
      ...child,
      uri: origin.uri,
      source: origin.source,
      extensionId: origin.extensionId,
      pluginUri: origin.pluginUri,
      groupKey: origin.source === AICustomizationSources.user ? child.groupKey : void 0
    };
  }
  /**
   * Reads a plugin's directory contents through the agent-host
   * filesystem provider and returns one {@link ICustomizationItem} per
   * supported file (agents/skills/instructions/prompts).
   */
  async _expandPluginContents(plugin, token) {
    const cached = this._expansionCache.get(plugin.item.uri);
    if (cached && cached.nonce === plugin.nonce && cached.pluginLabel === plugin.pluginLabel) {
      return cached.children;
    }
    const children = await this._contentExpander.expandPluginContents(plugin.item.uri, plugin.childGroupKey, plugin.isBundleItem, plugin.item.source, plugin.pluginLabel, token);
    this._expansionCache.set(plugin.item.uri, { nonce: plugin.nonce, pluginLabel: plugin.pluginLabel, children });
    return children;
  }
};

AgentCustomizationItemProvider = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IAgentHostCustomizationService)
], AgentCustomizationItemProvider);

function isParentOrEqual(folderURI, childURI) {
  try {
    return extUriBiasedIgnorePathCase.isEqualOrParent(URI.parse(childURI), URI.parse(folderURI));
  } catch {
    return childURI === folderURI || childURI.startsWith(folderURI + "/");
  }
}

function isUnderAnyRoot(roots, childURI) {
  return roots.some((root) => isParentOrEqual(root, childURI));
}

function toStatusString(load) {
  return load?.kind;
}

function toStatusMessage(load) {
  if (load?.kind === "degraded" /* Degraded */ || load?.kind === "error" /* Error */) {
    return load.message;
  }
  return void 0;
}

function customizationKey(customization) {
  return customization.id;
}

function customizationItemKey(customization, clientId) {
  return clientId !== void 0 ? `${customizationKey(customization)}::${clientId}` : customizationKey(customization);
}

function isDirectoryCustomization(customization) {
  return customization.type === "directory" /* Directory */;
}

function toPromptsType(type) {
  switch (type) {
    case "agent" /* Agent */:
      return "agent" /* agent */;
    case "skill" /* Skill */:
      return "skill" /* skill */;
    case "rule" /* Rule */:
      return "instructions" /* instructions */;
    case "prompt" /* Prompt */:
      return "prompt" /* prompt */;
    case "hook" /* Hook */:
      return "hook" /* hook */;
    default:
      return void 0;
  }
}

function getChildDescription(child) {
  switch (child.type) {
    case "agent" /* Agent */:
    case "skill" /* Skill */:
    case "prompt" /* Prompt */:
    case "rule" /* Rule */:
      return child.description;
    default:
      return void 0;
  }
}

function isSyntheticBundle(customization) {
  try {
    return URI.parse(customization.uri).scheme === SYNCED_CUSTOMIZATION_SCHEME;
  } catch {
    return false;
  }
}
export { isParentOrEqual, isUnderAnyRoot, toStatusString, toStatusMessage, customizationKey, customizationItemKey, isDirectoryCustomization, toPromptsType, getChildDescription, isSyntheticBundle, REMOTE_HOST_GROUP, REMOTE_CLIENT_GROUP, AgentCustomizationItemProvider };
