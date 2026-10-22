// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostCustomizationEnablementService.ts
import { createDecorator } from "./module-0044.mjs";
import { URI } from "./module-0023.mjs";
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { isAhpChatChannel, parseRequiredSessionUriFromChatUri, readSessionWorkspaceless } from "./module-0047.mjs";
import { AgentSession } from "./module-0048.mjs";
import { getEffectiveWorkingDirectories } from "./module-0104.mjs";
import { DEFAULT_CUSTOMIZATION_ENABLED, isCustomizationEnabled, sortCustomizationEnablement, withCustomizationEnablement } from "./module-0157.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStorageService } from "./module-0164.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostWorktreeIsolation } from "./module-0165.mjs";


// src/vs/platform/agentHost/node/agentHostCustomizationEnablementService.ts
var STORAGE_KEY = "customizationEnablement";

var LRU_STORAGE_KEY = "customizationEnablementLru";

var SESSION_METADATA_KEY = "customizationEnablement";

var MAX_PERSISTED_DECISIONS = 512;

var IAgentHostCustomizationEnablementService = createDecorator("agentHostCustomizationEnablementService");

function getCustomizationEnablementKey(target, kind) {
  if (kind === "session" /* Session */) {
    return target.id;
  }
  switch (target.type) {
    case "plugin" /* Plugin */:
      return target.source.toString();
    case "mcpServer" /* McpServer */:
      return target.owningPluginSource ? `${target.owningPluginSource.toString()}#mcp=${target.name}` : `mcpServers#${target.name}`;
    default:
      throw new Error(`Enablement is only supported for plugins and MCP servers, not ${target.type}`);
  }
}

function targetForUnownedMcpServer(name) {
  return {
    id: `mcpServers#${name}`,
    type: "mcpServer" /* McpServer */,
    name,
    source: URI.parse(`mcpServers#${name}`)
  };
}

var AgentHostCustomizationEnablementService = class extends Disposable {
  constructor(_storageService, _sessionDataService, _sessionState, _logService, worktree) {
    super();
    this._storageService = _storageService;
    this._sessionDataService = _sessionDataService;
    this._sessionState = _sessionState;
    this._logService = _logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._clientGlobalEnablement = /* @__PURE__ */ new Map();
    /**
     * Loaded once and authoritative for synchronous resolution, which runs while customizations are published.
     * An async read here could mistake an unavailable result for an absent decision.
     */
    this._sessionEnablement = /* @__PURE__ */ new Map();
    this._sessionLoads = /* @__PURE__ */ new Map();
    this._sessionsById = /* @__PURE__ */ new Map();
    this._pendingSessionWrites = /* @__PURE__ */ new Set();
    /**
     * Retains writes made before session metadata or directory registration resolves.
     * Replayed after either session load or a working-directory event, while resolution reports `pending` rather than no decision.
     */
    this._pendingReplacements = /* @__PURE__ */ new Map();
    this._worktree = worktree;
    this._persistent = this._readPersistentEnablement();
    this._lru = this._readLru();
    this._reconcileLru();
    this._register(this._sessionState.onDidEmitEnvelope((envelope) => {
      const session = isAhpChatChannel(envelope.channel) ? parseRequiredSessionUriFromChatUri(envelope.channel) : this._sessionState.getSessionSummary(envelope.channel) ? envelope.channel : void 0;
      if (session !== void 0) {
        this._sessionsById.set(AgentSession.id(session), session);
        void this.initializeSession(session);
        if (envelope.action.type === "session/workingDirectorySet" /* SessionWorkingDirectorySet */ || envelope.action.type === "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */ || envelope.action.type === "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */) {
          const affectedSessions = this._applyPendingReplacements(session);
          affectedSessions.add(session);
          this._notifyDecisionChanged(affectedSessions);
        }
      }
    }));
    this._register(this._worktree.onDidChangeWorkingDirectoryPending((sessionId) => {
      const session = this._sessionsById.get(sessionId);
      if (session === void 0) {
        return;
      }
      this._notifyDecisionChanged([session]);
    }));
  }
  async initializeSession(session) {
    const existing = this._sessionLoads.get(session);
    if (existing) {
      return existing;
    }
    this._sessionsById.set(AgentSession.id(session), session);
    const load = this._loadSessionEnablement(session);
    this._sessionLoads.set(session, load);
    return load;
  }
  getWorkingDirectoryState(session) {
    const summary = this._sessionState.getSessionSummary(session);
    if (readSessionWorkspaceless(summary?._meta)) {
      return { kind: "workspaceless" };
    }
    if (this._worktree.isWorkingDirectoryPending(AgentSession.id(session))) {
      return { kind: "pending" };
    }
    const directory = getEffectiveWorkingDirectories(this._sessionState, session)?.[0];
    if (directory === void 0) {
      return { kind: "pending" };
    }
    return { kind: "directory", uri: URI.parse(directory) };
  }
  resolve(session, target) {
    const sessionEnablement = this._sessionEnablement.get(session);
    if (sessionEnablement === void 0) {
      return { kind: "pending", reason: "session" };
    }
    const workingDirectory = this.getWorkingDirectoryState(session);
    if (workingDirectory.kind === "pending") {
      return { kind: "pending", reason: "workingDirectory" };
    }
    const persistentKey = this._persistentKey(target);
    const decisions = [];
    const sessionDecision = sessionEnablement.get(this._sessionKey(target));
    if (sessionDecision !== void 0) {
      decisions.push({ kind: "session" /* Session */, enabled: sessionDecision });
    }
    if (workingDirectory.kind === "directory") {
      const workspaceDecision = this._persistent.workingDirectories?.[workingDirectory.uri.toString()]?.[persistentKey];
      if (workspaceDecision !== void 0) {
        decisions.push({ kind: "workspace" /* Workspace */, uri: workingDirectory.uri.toString(), enabled: workspaceDecision });
      }
    }
    const globalDecision = this._persistent.global?.[persistentKey];
    if (globalDecision !== void 0) {
      decisions.push({ kind: "global" /* Global */, enabled: globalDecision });
    } else {
      const clientGlobalDecision = this._clientGlobalEnablement.get(session)?.get(persistentKey);
      if (clientGlobalDecision !== void 0) {
        decisions.push({ kind: "global" /* Global */, enabled: clientGlobalDecision });
      }
    }
    const enablement = sortCustomizationEnablement(decisions);
    return {
      kind: "resolved",
      enablement,
      enabled: isCustomizationEnabled({ enablement }),
      workingDirectory
    };
  }
  applyClientGlobalEnablement(session, target, enablement) {
    const global = enablement.find((entry) => entry.kind === "global" /* Global */);
    if (global === void 0) {
      throw new Error(`Client customization ${target.source.toString()} is missing its required global enablement entry`);
    }
    if (!target.isClientBundled) {
      return this.resolve(session, target);
    }
    this._setClientGlobal(session, target, global.enabled);
    return this.resolve(session, target);
  }
  setEnablement(session, target, kind, enabled) {
    const before = this._captureDecisionSnapshot(session, target);
    const resolution = this._replaceEnablement(session, target, { replacementKind: "scoped", scope: kind, enabled });
    this._notifyDecisionChanged(this._getAffectedSessions(session, target, before));
    return resolution;
  }
  replaceEnablement(session, target, enablement) {
    const before = this._captureDecisionSnapshot(session, target);
    const resolution = this._replaceEnablement(session, target, { replacementKind: "full", enablement });
    this._notifyDecisionChanged(this._getAffectedSessions(session, target, before));
    return resolution;
  }
  _replaceEnablement(session, target, replacement) {
    const resolution = this.resolve(session, target);
    if (resolution.kind === "pending") {
      if (replacement.replacementKind === "full") {
        this._setGlobal(session, target, this._getGlobalReplacement(replacement.enablement));
        this._queueReplacement(session, target, replacement);
      } else if (replacement.scope === "global" /* Global */) {
        this._setGlobal(session, target, replacement.enabled);
        if (this._pendingReplacements.has(`${session}\0${this._persistentKey(target)}`)) {
          this._queueReplacement(session, target, replacement);
        }
      } else {
        this._queueReplacement(session, target, replacement);
      }
      return resolution;
    }
    const enablement = this._replacementEnablement(resolution.enablement, resolution.workingDirectory, replacement);
    this._applyReplacement(session, target, enablement, resolution.workingDirectory);
    return this.resolve(session, target);
  }
  _applyPendingReplacements(session) {
    const affectedSessions = /* @__PURE__ */ new Set();
    for (const [key, replacement] of this._pendingReplacements) {
      if (!key.startsWith(`${session}\0`)) {
        continue;
      }
      const resolution = this.resolve(session, replacement.target);
      if (resolution.kind === "pending") {
        continue;
      }
      let enablement = replacement.enablement ?? resolution.enablement;
      for (const scopedReplacement of replacement.scopedReplacements) {
        enablement = this._replacementEnablement(enablement, resolution.workingDirectory, scopedReplacement);
      }
      const before = this._captureDecisionSnapshot(session, replacement.target);
      this._applyReplacement(session, replacement.target, enablement, resolution.workingDirectory);
      for (const affectedSession of this._getAffectedSessions(session, replacement.target, before)) {
        affectedSessions.add(affectedSession);
      }
      this._pendingReplacements.delete(key);
    }
    return affectedSessions;
  }
  _queueReplacement(session, target, replacement) {
    const key = `${session}\0${this._persistentKey(target)}`;
    const existing = this._pendingReplacements.get(key);
    if (replacement.replacementKind === "full") {
      this._pendingReplacements.set(key, { target, enablement: replacement.enablement, scopedReplacements: [] });
      return;
    }
    const scopedReplacements = [
      ...existing?.scopedReplacements.filter((entry) => entry.scope !== replacement.scope) ?? [],
      replacement
    ];
    this._pendingReplacements.set(key, {
      target,
      ...existing?.enablement ? { enablement: existing.enablement } : {},
      scopedReplacements
    });
  }
  _replacementEnablement(current, workingDirectory, replacement) {
    if (replacement.replacementKind === "full") {
      return [...replacement.enablement];
    }
    return withCustomizationEnablement(current, replacement.scope, this._enablementEntry(replacement, workingDirectory));
  }
  _enablementEntry(replacement, workingDirectory) {
    switch (replacement.scope) {
      case "global" /* Global */:
        return { kind: "global" /* Global */, enabled: replacement.enabled };
      case "workspace" /* Workspace */:
        if (workingDirectory.kind !== "directory") {
          throw new Error("Cannot record workspace enablement for a workspace-less session");
        }
        return { kind: "workspace" /* Workspace */, uri: workingDirectory.uri.toString(), enabled: replacement.enabled };
      case "session" /* Session */:
        return { kind: "session" /* Session */, enabled: replacement.enabled };
      default: {
        const exhaustiveKind = replacement.scope;
        throw new Error(`Unknown customization enablement kind: ${exhaustiveKind}`);
      }
    }
  }
  _applyReplacement(session, target, enablement, workingDirectory) {
    this._setGlobal(session, target, this._getGlobalReplacement(enablement));
    this._replaceNonGlobalEnablement(session, target, enablement, workingDirectory);
  }
  _getGlobalReplacement(enablement) {
    return enablement.find((entry) => entry.kind === "global" /* Global */)?.enabled;
  }
  _replaceNonGlobalEnablement(session, target, enablement, workingDirectory) {
    const byKind = new Map(enablement.map((entry) => [entry.kind, entry]));
    if (workingDirectory.kind === "directory") {
      this._setWorkspace(session, target, workingDirectory.uri, byKind.get("workspace" /* Workspace */)?.enabled);
    }
    this._setSession(session, target, workingDirectory, byKind.get("session" /* Session */)?.enabled);
  }
  async whenIdle() {
    await this._storageService.whenIdle();
    while (this._pendingSessionWrites.size > 0) {
      await Promise.allSettled([...this._pendingSessionWrites]);
    }
  }
  async _loadSessionEnablement(session) {
    const transitioned = !this._sessionEnablement.has(session);
    let reference;
    try {
      reference = this._sessionDataService.openDatabase(URI.parse(session));
      const raw = await reference.object.getMetadata(SESSION_METADATA_KEY);
      this._sessionEnablement.set(session, this._parseSessionEnablement(raw));
    } catch (err) {
      this._logService.warn(`[AgentHostCustomizationEnablementService] Failed to read session enablement for ${session}`, err);
      this._sessionEnablement.set(session, /* @__PURE__ */ new Map());
    } finally {
      reference?.dispose();
    }
    if (transitioned) {
      const affectedSessions = this._applyPendingReplacements(session);
      affectedSessions.add(session);
      this._notifyDecisionChanged(affectedSessions);
    }
  }
  _setGlobal(session, target, enabled) {
    this._setGlobalEnablement(session, target, enabled, true);
  }
  _setClientGlobal(session, target, enabled) {
    const key = this._persistentKey(target);
    let decisions = this._clientGlobalEnablement.get(session);
    if (decisions === void 0) {
      decisions = /* @__PURE__ */ new Map();
      this._clientGlobalEnablement.set(session, decisions);
    }
    decisions.set(key, enabled);
  }
  _setGlobalEnablement(session, target, enabled, removeRedundantWorkspaceDecisions) {
    const key = this._persistentKey(target);
    const global = this._persistent.global ?? {};
    this._setPersistentDecision("global", global, key, enabled, this._clientGlobalEnablement.get(session)?.get(key) ?? DEFAULT_CUSTOMIZATION_ENABLED);
    this._persistent = { ...this._persistent, global };
    if (removeRedundantWorkspaceDecisions && global[key] !== void 0) {
      this._removeRedundantWorkspaceDecisions(key);
    }
    this._persist();
  }
  /**
   * `undefined` clears a scope, and a decision matching its inherited value is cleared too.
   * This lets the UI restore inheritance without a third 'Inherit' action.
   */
  _setPersistentDecision(scope, decisions, key, enabled, inherited, workingDirectory) {
    if (enabled === void 0 || enabled === inherited) {
      delete decisions[key];
      this._removeLru(scope, key, workingDirectory);
    } else {
      decisions[key] = enabled;
      this._touchLru({ scope, key, ...workingDirectory === void 0 ? {} : { workingDirectory } });
    }
  }
  _persistentKey(target) {
    return getCustomizationEnablementKey(target, "global" /* Global */);
  }
  _sessionKey(target) {
    return getCustomizationEnablementKey(target, "session" /* Session */);
  }
  _workspaceInheritedEnablement(session, target, workingDirectory) {
    return this._persistent.workingDirectories?.[workingDirectory.toString()]?.[this._persistentKey(target)] ?? this._globalEnablement(session, target);
  }
  _globalEnablement(session, target) {
    const key = this._persistentKey(target);
    return this._persistent.global?.[key] ?? this._clientGlobalEnablement.get(session)?.get(key) ?? DEFAULT_CUSTOMIZATION_ENABLED;
  }
  _setWorkspace(session, target, workingDirectory, enabled) {
    const key = this._persistentKey(target);
    const directoryKey = workingDirectory.toString();
    const workingDirectories = this._persistent.workingDirectories ?? {};
    const workspace = workingDirectories[directoryKey] ?? {};
    this._setPersistentDecision("workspace", workspace, key, enabled, this._globalEnablement(session, target), directoryKey);
    workingDirectories[directoryKey] = workspace;
    this._persistent = { ...this._persistent, workingDirectories };
    this._persist();
  }
  /** Needs the working-directory state to calculate the lower-scope inherited value before clearing. */
  _setSession(session, target, workingDirectory, enabled) {
    const enablement = this._sessionEnablement.get(session);
    if (enablement === void 0) {
      throw new Error(`Session enablement has not been initialized: ${session}`);
    }
    const inherited = workingDirectory.kind === "directory" ? this._workspaceInheritedEnablement(session, target, workingDirectory.uri) : this._globalEnablement(session, target);
    const sessionKey = this._sessionKey(target);
    if (enabled === void 0 || enabled === inherited) {
      enablement.delete(sessionKey);
    } else {
      enablement.set(sessionKey, enabled);
    }
    this._persistSession(session, enablement);
  }
  _persistSession(session, enablement) {
    const reference = this._sessionDataService.openDatabase(URI.parse(session));
    const write2 = reference.object.setMetadata(SESSION_METADATA_KEY, JSON.stringify(Object.fromEntries(enablement))).catch((err) => {
      this._logService.error(`[AgentHostCustomizationEnablementService] Failed to write session enablement for ${session}`, err);
    }).finally(() => reference.dispose());
    this._pendingSessionWrites.add(write2);
    const untrack = () => this._pendingSessionWrites.delete(write2);
    write2.then(untrack, untrack);
  }
  /** Prunes matching workspace decisions in every stored directory, preserving only overrides that beat the new global value. */
  _removeRedundantWorkspaceDecisions(key) {
    const inherited = this._persistent.global?.[key];
    if (inherited === void 0) {
      return;
    }
    for (const [directory, values] of Object.entries(this._persistent.workingDirectories ?? {})) {
      if (values[key] === inherited) {
        delete values[key];
        this._removeLru("workspace", key, directory);
      }
    }
  }
  _persist() {
    this._evictLru();
    const global = this._persistent.global && Object.keys(this._persistent.global).length > 0 ? this._persistent.global : void 0;
    const workingDirectories = Object.fromEntries(Object.entries(this._persistent.workingDirectories ?? {}).filter(([, values]) => Object.keys(values).length > 0));
    this._persistent = {
      ...global ? { global } : {},
      ...Object.keys(workingDirectories).length > 0 ? { workingDirectories } : {}
    };
    if (Object.keys(this._persistent).length === 0) {
      this._storageService.delete(STORAGE_KEY);
    } else {
      this._storageService.set(STORAGE_KEY, this._persistent);
    }
    if (this._lru.length === 0) {
      this._storageService.delete(LRU_STORAGE_KEY);
    } else {
      this._storageService.set(LRU_STORAGE_KEY, this._lru);
    }
  }
  _touchLru(entry) {
    this._removeLru(entry.scope, entry.key, entry.workingDirectory);
    this._lru.push(entry);
  }
  _removeLru(scope, key, workingDirectory) {
    this._lru = this._lru.filter((entry) => entry.scope !== scope || entry.key !== key || entry.workingDirectory !== workingDirectory);
  }
  _evictLru() {
    while (this._lru.length > MAX_PERSISTED_DECISIONS) {
      const entry = this._lru.shift();
      if (entry.scope === "global") {
        delete this._persistent.global?.[entry.key];
      } else if (entry.workingDirectory !== void 0) {
        delete this._persistent.workingDirectories?.[entry.workingDirectory]?.[entry.key];
      }
    }
  }
  _readPersistentEnablement() {
    const value = this._storageService.get(STORAGE_KEY);
    if (!isRecord3(value)) {
      return {};
    }
    const global = readBooleanRecord(value["global"]);
    const workingDirectories = isRecord3(value["workingDirectories"]) ? Object.fromEntries(Object.entries(value["workingDirectories"]).map(([directory, decisions]) => [directory, readBooleanRecord(decisions)]).filter(([, decisions]) => Object.keys(decisions).length > 0)) : void 0;
    return {
      ...global && Object.keys(global).length > 0 ? { global } : {},
      ...workingDirectories && Object.keys(workingDirectories).length > 0 ? { workingDirectories } : {}
    };
  }
  _readLru() {
    const value = this._storageService.get(LRU_STORAGE_KEY);
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter(
      (entry) => isRecord3(entry) && (entry["scope"] === "global" || entry["scope"] === "workspace") && typeof entry["key"] === "string" && (entry["workingDirectory"] === void 0 || typeof entry["workingDirectory"] === "string")
    );
  }
  _reconcileLru() {
    const persistedEntries = [
      ...Object.keys(this._persistent.global ?? {}).sort().map((key) => ({ scope: "global", key })),
      ...Object.entries(this._persistent.workingDirectories ?? {}).flatMap(([workingDirectory, values]) => Object.keys(values).sort().map((key) => ({ scope: "workspace", key, workingDirectory })))
    ];
    const valid = this._lru.filter((entry) => persistedEntries.some((candidate) => entriesEqual(candidate, entry)));
    for (const entry of persistedEntries) {
      if (!valid.some((candidate) => entriesEqual(candidate, entry))) {
        valid.push(entry);
      }
    }
    this._lru = valid;
    this._evictLru();
  }
  _parseSessionEnablement(raw) {
    if (raw === void 0) {
      return /* @__PURE__ */ new Map();
    }
    try {
      return new Map(Object.entries(readBooleanRecord(JSON.parse(raw))));
    } catch {
      return /* @__PURE__ */ new Map();
    }
  }
  _captureDecisionSnapshot(session, target) {
    const persistentKey = this._persistentKey(target);
    const workspace = /* @__PURE__ */ new Map();
    for (const [directory, decisions] of Object.entries(this._persistent.workingDirectories ?? {})) {
      const decision = decisions[persistentKey];
      if (decision !== void 0) {
        workspace.set(directory, decision);
      }
    }
    return {
      global: this._persistent.global?.[persistentKey],
      workspace,
      session: this._sessionEnablement.get(session)?.get(this._sessionKey(target))
    };
  }
  _getAffectedSessions(session, target, before) {
    const after = this._captureDecisionSnapshot(session, target);
    const affectedSessions = /* @__PURE__ */ new Set();
    if (before.global !== after.global) {
      for (const candidate of this._sessionState.getSessionUris()) {
        affectedSessions.add(candidate);
      }
    }
    for (const directory of /* @__PURE__ */ new Set([...before.workspace.keys(), ...after.workspace.keys()])) {
      if (before.workspace.get(directory) !== after.workspace.get(directory)) {
        for (const candidate of this._sessionState.getSessionUris()) {
          const workingDirectory = this.getWorkingDirectoryState(candidate);
          if (workingDirectory.kind === "directory" && workingDirectory.uri.toString() === directory) {
            affectedSessions.add(candidate);
          }
        }
      }
    }
    if (before.session !== after.session) {
      affectedSessions.add(session);
    }
    return affectedSessions;
  }
  _notifyDecisionChanged(sessions) {
    const affectedSessions = [...new Set(sessions)];
    if (affectedSessions.length > 0) {
      this._onDidChange.fire({ sessions: affectedSessions });
    }
  }
};

AgentHostCustomizationEnablementService = __decorateClass([
  __decorateParam(0, IAgentHostStorageService),
  __decorateParam(1, ISessionDataService),
  __decorateParam(2, IAgentHostStateManager),
  __decorateParam(3, ILogService),
  __decorateParam(4, IAgentHostWorktreeIsolation)
], AgentHostCustomizationEnablementService);

function isRecord3(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readBooleanRecord(value) {
  if (!isRecord3(value)) {
    return {};
  }
  const result = {};
  for (const [key, decision] of Object.entries(value)) {
    if (typeof decision === "boolean") {
      result[key] = decision;
    }
  }
  return result;
}

function entriesEqual(a, b) {
  return a.scope === b.scope && a.key === b.key && a.workingDirectory === b.workingDirectory;
}
export { getCustomizationEnablementKey, targetForUnownedMcpServer, isRecord3, readBooleanRecord, entriesEqual, STORAGE_KEY, LRU_STORAGE_KEY, SESSION_METADATA_KEY, MAX_PERSISTED_DECISIONS, IAgentHostCustomizationEnablementService, AgentHostCustomizationEnablementService };
