// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/mcpCustomizationController.ts
import { Disposable } from "./module-0010.mjs";
import { observableValue } from "./module-0064.mjs";
import { parseChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { AgentSession } from "./module-0048.mjs";
import { derived } from "./module-0070.mjs";
import { transaction } from "./module-0061.mjs";
import { DEFAULT_MCP_APP } from "./module-0124.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { isCustomizationEnabled } from "./module-0157.mjs";


// src/vs/platform/agentHost/node/shared/mcpCustomizationController.ts
function buildMcpTopLevelCustomizationId(providerId, sessionId, serverName) {
  return `mcp-top-level:${providerId}:${sessionId}:${serverName}`;
}

function buildMcpChannel(chatUri, serverName) {
  const providerId = getMcpChannelProviderId(chatUri);
  return `mcp://${providerId}/${encodeURIComponent(chatUri.toString())}/${encodeURIComponent(serverName)}`;
}

var McpCustomizationController = class extends Disposable {
  constructor(_options, _stateManager) {
    super();
    this._options = _options;
    this._stateManager = _stateManager;
    /** Per-server live entries, keyed by server name. */
    this._live = observableValue(this, /* @__PURE__ */ new Map());
    this._chatUri = this._options.chatUri;
    const chat = parseChatUri(this._chatUri);
    if (!chat) {
      throw new Error(`Malformed AHP chat URI: ${this._chatUri.toString()}`);
    }
    this._sessionUri = URI.parse(chat.session);
    this._providerId = AgentSession.provider(this._sessionUri) ?? "";
    this._sessionId = AgentSession.id(this._sessionUri);
    if (!this._providerId || !this._sessionId) {
      throw new Error(`Malformed Agent Host session URI: ${chat.session}`);
    }
    this.runtimeStates = derived(this, (reader) => {
      const out = /* @__PURE__ */ new Map();
      for (const entry of this._live.read(reader).values()) {
        const id2 = entry.topLevelId ?? this._resolveChildId(entry.serverName);
        if (id2 === void 0) {
          continue;
        }
        out.set(id2, { state: entry.state, channel: this._buildChannel(entry.serverName, entry.state) });
      }
      return out;
    });
  }
  /** Snapshot for inclusion in `getSessionCustomizations()` results. */
  topLevelCustomizations() {
    const out = [];
    for (const entry of this._live.get().values()) {
      if (entry.topLevelId === void 0) {
        continue;
      }
      out.push(this._buildTopLevel(entry.topLevelId, entry.serverName, entry.state, entry.enabled));
    }
    return out;
  }
  get pluginMcpServerSources() {
    return this._options.pluginMcpServerSources?.();
  }
  /**
   * Names of MCP servers currently in {@link McpServerStatus.Ready},
   * paired with their channel URI. Used by providers to drive
   * polling-based notification streams (e.g. re-fetch `tools/list`
   * after a refresh hint and fire
   * `notifications/tools/list_changed` if the result changed).
   */
  readyChannels() {
    const out = [];
    for (const entry of this._live.get().values()) {
      if (entry.state.kind !== "ready" /* Ready */) {
        continue;
      }
      const channel = this._buildChannel(entry.serverName, entry.state);
      if (channel !== void 0) {
        out.push({ serverName: entry.serverName, channel });
      }
    }
    return out;
  }
  /**
   * Returns the customization id currently associated with the MCP
   * server named `serverName`, or `undefined` when no customization
   * exists. Top-level entries return the minted top-level id; child
   * entries return the child id published in session state for that server.
   * Used by providers to tag
   * {@link ToolCallMcpContributor.customizationId | tool-call contributors}
   * so clients can correlate MCP tool calls with the originating
   * server customization.
   */
  customizationIdForServer(serverName) {
    const live = this._live.get().get(serverName);
    if (live?.topLevelId !== void 0) {
      return live.topLevelId;
    }
    const published = this._findPublishedMcpCustomization(serverName);
    return published?.topLevelId ?? published?.childId;
  }
  /** Returns the live server name associated with a customization id. */
  serverNameForCustomizationId(id2) {
    for (const entry of this._live.get().values()) {
      const entryId = entry.topLevelId ?? this._resolveChildId(entry.serverName);
      if (entryId === id2) {
        return entry.serverName;
      }
    }
    return void 0;
  }
  /** Returns the last live state recorded for the MCP server named `serverName`. */
  stateForServer(serverName) {
    return this._live.get().get(serverName)?.state;
  }
  /** Snapshot used by providers to reconcile desired and observed enablement. */
  serverEnablement() {
    const result = [];
    for (const entry of this._live.get().values()) {
      const customizationId2 = entry.topLevelId ?? this._resolveChildId(entry.serverName);
      if (customizationId2 !== void 0) {
        result.push({ serverName: entry.serverName, customizationId: customizationId2, enabled: entry.enabled });
      }
    }
    return result;
  }
  /**
   * Returns the `mcp://` AHP channel URI currently advertised for the
   * MCP server named `serverName`, or `undefined` when the server is
   * not in {@link McpServerStatus.Ready}. Used by providers to attach
   * the channel to MCP App `_meta.ui` so clients can route App
   * sub-RPCs (tools/call, resources/read, sampling/createMessage)
   * back through {@link IAgentHostService.handleMcpRequest}.
   */
  channelForServer(serverName) {
    const live = this._live.get().get(serverName);
    if (!live || live.state.kind !== "ready" /* Ready */) {
      return void 0;
    }
    return this._buildChannel(serverName, live.state);
  }
  /**
   * Replaces the live inventory with `servers`. Servers no longer
   * present are removed; new servers and changed servers are upserted.
   * Batched in a single transaction so {@link runtimeStates} observers
   * see one coalesced update.
   */
  applyAll(servers) {
    transaction((tx) => {
      const seen = /* @__PURE__ */ new Set();
      for (const server of servers) {
        seen.add(server.name);
        this._applyOne(server, tx);
      }
      for (const name of [...this._live.get().keys()]) {
        if (!seen.has(name)) {
          this._remove(name, tx);
        }
      }
    });
  }
  /** Upserts a single server. */
  applyOne(server) {
    transaction((tx) => this._applyOne(server, tx));
  }
  _applyOne(server, tx) {
    const previous = this._live.get().get(server.name);
    const state = this._stateForUpdate(previous?.state, server.state);
    const enabled = server.enabled ?? previous?.enabled ?? true;
    let topLevelId = previous?.topLevelId;
    if (topLevelId === void 0) {
      const published = this._findPublishedMcpCustomization(server.name);
      const childId = published?.childId;
      if (childId !== void 0) {
        this._setLiveEntry(server.name, { serverName: server.name, state, enabled, topLevelId: void 0 }, tx);
        this._options.emit({
          type: "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */,
          id: childId,
          state,
          channel: this._buildChannel(server.name, state)
        });
        return;
      }
      topLevelId = published?.topLevelId ?? this._mintTopLevelId(server.name);
    }
    this._setLiveEntry(server.name, { serverName: server.name, state, enabled, topLevelId }, tx);
    this._options.emit({
      type: "session/customizationUpdated" /* SessionCustomizationUpdated */,
      customization: this._buildTopLevel(topLevelId, server.name, state, enabled)
    });
  }
  /**
   * Removes a server from the live inventory. For top-level entries
   * (bare servers with no plugin-derived child) emits
   * {@link ActionType.SessionCustomizationRemoved} so the entry is
   * dropped from session state, not just from the in-memory live
   * inventory.
   *
   * For child entries we emit a final {@link ActionType.SessionMcpServerStateChanged}
   * carrying {@link McpServerStatus.Stopped} so the UI sees the
   * server settle into a terminal state; the plugin layer owns the
   * actual removal of the child container.
   */
  remove(serverName) {
    transaction((tx) => this._remove(serverName, tx));
  }
  _remove(serverName, tx) {
    const entry = this._live.get().get(serverName);
    if (!entry) {
      return;
    }
    this._deleteLiveEntry(serverName, tx);
    if (entry.topLevelId !== void 0) {
      this._options.emit({
        type: "session/customizationRemoved" /* SessionCustomizationRemoved */,
        id: entry.topLevelId
      });
      return;
    }
    const childId = this._resolveChildId(serverName);
    if (childId === void 0) {
      return;
    }
    this._options.emit({
      type: "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */,
      id: childId,
      state: { kind: "stopped" /* Stopped */ }
    });
  }
  // ---- internals ---------------------------------------------------------
  /** Immutable upsert into the {@link _live} observable. */
  _setLiveEntry(serverName, entry, tx) {
    const next = new Map(this._live.get());
    next.set(serverName, entry);
    this._live.set(next, tx);
  }
  /** Immutable delete from the {@link _live} observable. */
  _deleteLiveEntry(serverName, tx) {
    const current = this._live.get();
    if (!current.has(serverName)) {
      return;
    }
    const next = new Map(current);
    next.delete(serverName);
    this._live.set(next, tx);
  }
  _stateForUpdate(previous, next) {
    if (previous?.kind === "authRequired" /* AuthRequired */ && next.kind === "starting" /* Starting */) {
      return previous;
    }
    return next;
  }
  _mintTopLevelId(serverName) {
    return buildMcpTopLevelCustomizationId(this._providerId, this._sessionId, serverName);
  }
  _resolveChildId(serverName) {
    return this._findPublishedMcpCustomization(serverName)?.childId;
  }
  _findPublishedMcpCustomization(serverName) {
    const customizations = this._stateManager.getSessionState(this._sessionUri.toString())?.customizations ?? [];
    const topLevel = customizations.find((customization) => customization.type === "mcpServer" /* McpServer */ && customization.name === serverName);
    if (topLevel?.type === "mcpServer" /* McpServer */) {
      return { topLevelId: topLevel.id };
    }
    const childId = findMcpChildId(customizations, serverName);
    return childId === void 0 ? void 0 : { childId };
  }
  _buildChannel(serverName, state) {
    if (state.kind !== "ready" /* Ready */) {
      return void 0;
    }
    return buildMcpChannel(this._chatUri, serverName);
  }
  _buildTopLevel(id2, serverName, state, enabled) {
    const channel = this._buildChannel(serverName, state);
    const owningPluginUri = this.pluginMcpServerSources?.get(serverName);
    const mcpApp = this._options.capabilities ? { capabilities: this._options.capabilities } : DEFAULT_MCP_APP;
    const existing = getMcpServerCustomizations(this._stateManager.getSessionState(this._sessionUri.toString())?.customizations ?? []).find((customization2) => customization2.id === id2);
    const customization = {
      type: "mcpServer" /* McpServer */,
      id: id2,
      uri: this._mintTopLevelId(serverName),
      name: serverName,
      state,
      channel,
      mcpApp
    };
    const enablement = this._options.resolveEnablement?.(customization, owningPluginUri) ?? existing?.enablement;
    return enablement?.length ? { ...customization, enablement: [...enablement] } : customization;
  }
};

McpCustomizationController = __decorateClass([
  __decorateParam(1, IAgentHostStateManager)
], McpCustomizationController);

function findMcpChildId(customizations, serverName) {
  return getMcpServerCustomizations(customizations).find((server) => server.name === serverName)?.id;
}

function getMcpServerCustomizations(customizations) {
  const result = [];
  for (const top of customizations) {
    if (top.type === "mcpServer" /* McpServer */) {
      result.push(top);
    } else {
      for (const child of top.children ?? []) {
        if (child.type === "mcpServer" /* McpServer */) {
          result.push(child);
        }
      }
    }
  }
  return result;
}

function getEffectiveMcpServerCustomizations(customizations) {
  const result = [];
  for (const customization of customizations) {
    if (customization.type === "mcpServer" /* McpServer */) {
      result.push({ server: customization, enabled: isCustomizationEnabled(customization) });
      continue;
    }
    const containerEnabled = customization.type === "plugin" /* Plugin */ ? isCustomizationEnabled(customization) : customization.enabled;
    for (const child of customization.children ?? []) {
      if (child.type === "mcpServer" /* McpServer */) {
        result.push({ server: child, enabled: containerEnabled && isCustomizationEnabled(child) });
      }
    }
  }
  return result;
}

function applyMcpServerEnablement(customizations, desired) {
  const desiredById = new Map(getEffectiveMcpServerCustomizations(desired).map(({ server }) => [server.id, server.enablement]));
  return customizations.map((customization) => {
    if (customization.type === "mcpServer" /* McpServer */) {
      return applyMcpEnablement(customization, desiredById);
    }
    let changed = false;
    const children = customization.children?.map((child) => {
      const next = child.type === "mcpServer" /* McpServer */ ? applyMcpEnablement(child, desiredById) : child;
      changed ||= next !== child;
      return next;
    });
    return changed ? { ...customization, children } : customization;
  });
}

function applyMcpEnablement(customization, desiredById) {
  if (!desiredById.has(customization.id)) {
    return customization;
  }
  const enablement = desiredById.get(customization.id);
  if (enablement === void 0) {
    return customization;
  }
  if (enablement?.length) {
    return { ...customization, enablement: [...enablement] };
  }
  const { enablement: _enablement, ...withoutEnablement } = customization;
  return withoutEnablement;
}

function findMcpServerName(customizations, id2) {
  return getMcpServerCustomizations(customizations).find((server) => server.id === id2)?.name;
}

function getMcpChannelProviderId(chatUri) {
  const chat = parseChatUri(chatUri);
  if (!chat) {
    throw new Error(`Malformed AHP chat URI: ${chatUri.toString()}`);
  }
  const providerId = AgentSession.provider(chat.session);
  if (!providerId) {
    throw new Error(`Malformed Agent Host session URI: ${chat.session}`);
  }
  return providerId;
}

function parseMcpChannelUri(uri) {
  const prefix = "mcp://";
  if (!uri.startsWith(prefix)) {
    return void 0;
  }
  const rest = uri.slice(prefix.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) {
    return void 0;
  }
  const providerId = rest.slice(0, slash);
  const tail = rest.slice(slash + 1);
  const segments = tail.split("/");
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    return void 0;
  }
  let chatUri;
  let serverName;
  try {
    chatUri = URI.parse(decodeURIComponent(segments[0]));
    serverName = decodeURIComponent(segments[1]);
  } catch {
    return void 0;
  }
  if (!providerId || !serverName) {
    return void 0;
  }
  let routedProviderId;
  try {
    routedProviderId = getMcpChannelProviderId(chatUri);
  } catch {
    return void 0;
  }
  if (routedProviderId !== providerId) {
    return void 0;
  }
  return { providerId, chatUri, serverName };
}
export { buildMcpTopLevelCustomizationId, buildMcpChannel, findMcpChildId, getMcpServerCustomizations, getEffectiveMcpServerCustomizations, applyMcpServerEnablement, applyMcpEnablement, findMcpServerName, getMcpChannelProviderId, parseMcpChannelUri, McpCustomizationController };
