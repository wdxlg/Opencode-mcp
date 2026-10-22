// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/agentServerToolHost.ts
import { parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/node/shared/agentServerToolHost.ts
var AgentServerToolHost = class {
  constructor(_stateManager, _groups) {
    this._stateManager = _stateManager;
    this._groups = _groups;
    /** Every name the host answers to — current and legacy — and its owning group. */
    this._groupByToolName = /* @__PURE__ */ new Map();
    /** Legacy names mapped to the current name that replaced them. */
    this._currentToolNames = /* @__PURE__ */ new Map();
    for (const group of this._groups) {
      for (const def of group.definitions) {
        if (this._groupByToolName.has(def.name)) {
          throw new Error(`Duplicate server tool registered: ${def.name}`);
        }
        this._groupByToolName.set(def.name, group);
      }
    }
    for (const group of this._groups) {
      for (const [legacyName, currentName] of group.legacyToolNames ?? []) {
        if (this._groupByToolName.has(legacyName)) {
          continue;
        }
        this._groupByToolName.set(legacyName, group);
        this._currentToolNames.set(legacyName, currentName);
      }
    }
  }
  /** The name a group knows a tool by, translating a legacy name if needed. */
  _currentToolName(toolName) {
    return this._currentToolNames.get(toolName) ?? toolName;
  }
  get definitions() {
    return this._groups.flatMap((group) => group.definitions.filter((definition) => group.isEnabled(definition.name)));
  }
  getDefinitionsForSession(sessionUri) {
    const materializedDefinitions = this._stateManager.getSessionState(sessionUri)?.serverTools;
    const isEphemeral = this._stateManager.isEphemeralSession(sessionUri);
    return this._groups.flatMap((group) => {
      if (materializedDefinitions && group.materializeDefinitions) {
        const currentByName = new Map(group.definitions.map((definition) => [definition.name, definition]));
        return materializedDefinitions.filter((definition) => this._groupByToolName.get(definition.name) === group).map((definition) => currentByName.get(definition.name) ?? definition);
      }
      const definitions2 = group.definitions.filter((definition) => group.isEnabled(definition.name));
      return isEphemeral ? definitions2.filter((definition) => definition.enabledForEphemeralSessions) : definitions2;
    });
  }
  get toolNames() {
    return [
      ...this.definitions.map((definition) => definition.name),
      ...this._groups.flatMap((group) => [...group.legacyToolNames ?? []].filter(([, currentName]) => group.isEnabled(currentName)).map(([legacyName]) => legacyName))
    ];
  }
  advertise(sessionUri) {
    if (!this._stateManager.getSessionState(sessionUri)) {
      return;
    }
    this._stateManager.dispatchServerAction(sessionUri, {
      type: "session/serverToolsChanged" /* SessionServerToolsChanged */,
      tools: this._toProtocolDefinitions(this.getDefinitionsForSession(sessionUri))
    });
  }
  canRequireConfirmation(toolName) {
    const group = this._groupByToolName.get(toolName);
    const name = this._currentToolName(toolName);
    return group?.isEnabled(name) === true && (group.canRequireConfirmation?.(name) ?? false);
  }
  requiresConfirmation(chatUri, toolName) {
    const group = this._groupByToolName.get(toolName);
    const name = this._currentToolName(toolName);
    if (group && !this._isEnabledForSession(group, chatUri, name, toolName)) {
      return false;
    }
    return group?.requiresConfirmation?.(this._stateManager, this._executionContext(chatUri), name) ?? group?.canRequireConfirmation?.(name) ?? false;
  }
  executeTool(chatUri, toolName, rawArgs) {
    const group = this._groupByToolName.get(toolName);
    if (!group) {
      throw new Error(`Unknown server tool: ${toolName}`);
    }
    const name = this._currentToolName(toolName);
    if (!this._isEnabledForSession(group, chatUri, name, toolName)) {
      throw new Error(`Server tool "${toolName}" is disabled.`);
    }
    return group.execute(this._stateManager, this._executionContext(chatUri), name, rawArgs);
  }
  _executionContext(chatUri) {
    return {
      sessionUri: parseRequiredSessionUriFromChatUri(chatUri),
      chatUri,
      turnId: this._stateManager.getActiveTurnId(chatUri)
    };
  }
  _toProtocolDefinitions(definitions2) {
    return definitions2.map(({ enabledForEphemeralSessions: _enabledForEphemeralSessions, ...definition }) => definition);
  }
  _isEnabledForSession(group, chatUri, toolName, requestedToolName = toolName) {
    const advertisedTools = this._stateManager.getSessionState(chatUri)?.serverTools;
    return advertisedTools ? advertisedTools.some((tool) => tool.name === toolName) || group.legacyToolNames?.has(requestedToolName) === true : group.isEnabled(toolName);
  }
};
export { AgentServerToolHost };
