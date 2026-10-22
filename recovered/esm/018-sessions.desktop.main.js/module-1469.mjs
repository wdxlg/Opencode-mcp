// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatModes.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { LocalChatSessionUri, getChatSessionType } from "./module-0962.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { isString } from "./module-0010.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { equals4 } from "./module-0098.mjs";
import { isTarget } from "./module-1016.mjs";
import { IAgentSource, isCustomAgentVisibility } from "./module-0987.mjs";
import { observableValue } from "./module-0048.mjs";
import { constObservable } from "./module-0061.mjs";
import { transaction } from "./module-0045.mjs";
import { equals } from "./module-0007.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/workbench/contrib/chat/common/chatModes.ts
var IChatModeService = createDecorator("chatModeService");

var ChatModes = class extends Disposable {
  constructor(sessionResource, chatAgentService, contextKeyService, logService, storageService, configurationService, customizationHarnessService) {
    super();
    this.sessionResource = sessionResource;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.customizationHarnessService = customizationHarnessService;
    this._customModeInstances = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    /** Tracks the most recent refresh of custom prompt modes. */
    this._pendingRefresh = Promise.resolve();
    this._refreshThrottler = this._register(new Delayer(100));
    const sessionType = getChatSessionType(sessionResource);
    this._storageKey = ChatModes.CUSTOM_MODES_STORAGE_KEY_PREFIX + sessionType;
    this.hasCustomModes = ChatContextKeys.Modes.hasCustomChatModes.bindTo(contextKeyService);
    this.loadCachedModes();
    this._pendingRefresh = this.triggerRefresh();
    this._register(this.customizationHarnessService.onDidChangeCustomAgents((e4) => {
      if (e4.sessionType === sessionType) {
        this._pendingRefresh = this.triggerRefresh();
      }
    }));
    this._register(this.storageService.onWillSaveState(() => this.saveCachedModes()));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agent.enabled" /* AgentEnabled */)) {
        this._onDidChange.fire();
      }
    }));
    let didHaveToolsAgent = this.chatAgentService.hasToolsAgent;
    this._register(this.chatAgentService.onDidChangeAgents(() => {
      if (didHaveToolsAgent !== this.chatAgentService.hasToolsAgent) {
        didHaveToolsAgent = this.chatAgentService.hasToolsAgent;
        this._onDidChange.fire();
      }
    }));
  }
  static {
    this.CUSTOM_MODES_STORAGE_KEY_PREFIX = "chat.customModes.";
  }
  get builtin() {
    return this.getBuiltinModes();
  }
  get custom() {
    return this.getCustomModes();
  }
  findModeById(id2) {
    return this.getBuiltinModes().find((mode) => mode.id === id2) ?? this._customModeInstances.get(id2);
  }
  findModeByName(name) {
    return this.getBuiltinModes().find((mode) => mode.name.get() === name) ?? this.getCustomModes().find((mode) => mode.name.get() === name || mode.id === name);
  }
  waitForPendingUpdates() {
    return this._pendingRefresh;
  }
  loadCachedModes() {
    try {
      const cachedCustomModes = this.storageService.getObject(this._storageKey, 1 /* WORKSPACE */);
      if (cachedCustomModes) {
        this.deserializeCachedModes(cachedCustomModes);
      }
    } catch (error) {
      this.logService.error(error, "Failed to load cached custom agents");
    }
  }
  deserializeCachedModes(cachedCustomModes) {
    if (!Array.isArray(cachedCustomModes)) {
      this.logService.error("Invalid cached custom modes data: expected array");
      return;
    }
    for (const cachedMode of cachedCustomModes) {
      if (isCachedChatModeData(cachedMode) && cachedMode.uri) {
        try {
          const visibility = cachedMode.visibility ?? { userInvocable: true, agentInvocable: cachedMode.infer !== false };
          if (!visibility.userInvocable) {
            continue;
          }
          const uri4 = URI.revive(cachedMode.uri);
          const customChatMode = {
            id: cachedMode.id,
            uri: uri4,
            name: cachedMode.name,
            description: cachedMode.description,
            tools: cachedMode.customTools,
            model: isString(cachedMode.model) ? [cachedMode.model] : cachedMode.model,
            argumentHint: cachedMode.argumentHint,
            agentInstructions: cachedMode.modeInstructions ?? { content: cachedMode.body ?? "", toolReferences: [] },
            handOffs: cachedMode.handOffs,
            target: cachedMode.target ?? "undefined" /* Undefined */,
            visibility,
            agents: cachedMode.agents,
            sessionTypes: cachedMode.sessionTypes,
            source: reviveChatModeSource(cachedMode.source) ?? { storage: "local" /* local */ },
            enabled: true
          };
          const instance2 = new CustomChatMode(customChatMode);
          this._customModeInstances.set(uri4.toString(), instance2);
        } catch (error) {
          this.logService.error(error, "Failed to revive cached custom agent");
        }
      }
    }
    this.hasCustomModes.set(this._customModeInstances.size > 0);
  }
  saveCachedModes() {
    try {
      const modesToCache = Array.from(this._customModeInstances.values());
      this.storageService.store(this._storageKey, modesToCache, 1 /* WORKSPACE */, 1 /* MACHINE */);
    } catch (error) {
      this.logService.warn("Failed to save cached custom agents", error);
    }
  }
  triggerRefresh() {
    this._refreshCancellationSource?.cancel();
    this._refreshCancellationSource?.dispose();
    const refreshCancellationSource = this._refreshCancellationSource = new CancellationTokenSource();
    return this._refreshThrottler.trigger(async () => {
      try {
        await this.refreshCustomPromptModes(refreshCancellationSource.token);
      } finally {
        if (this._refreshCancellationSource === refreshCancellationSource) {
          this._refreshCancellationSource = void 0;
        }
        refreshCancellationSource.dispose();
      }
    });
  }
  dispose() {
    this._refreshCancellationSource?.cancel();
    this._refreshCancellationSource?.dispose();
    this._refreshCancellationSource = void 0;
    super.dispose();
  }
  async refreshCustomPromptModes(token) {
    let hasChanges = false;
    try {
      if (token.isCancellationRequested) {
        return;
      }
      const customModes = await this.customizationHarnessService.getCustomAgents(this.sessionResource, token);
      if (token.isCancellationRequested) {
        return;
      }
      const seenUris = /* @__PURE__ */ new Set();
      for (const customMode of customModes) {
        if (!customMode.visibility.userInvocable || !customMode.enabled) {
          continue;
        }
        const uriString = customMode.uri.toString();
        seenUris.add(uriString);
        let modeInstance = this._customModeInstances.get(uriString);
        if (modeInstance) {
          if (modeInstance.updateData(customMode)) {
            hasChanges = true;
          }
        } else {
          modeInstance = new CustomChatMode(customMode);
          this._customModeInstances.set(uriString, modeInstance);
          hasChanges = true;
        }
      }
      for (const [uriString] of this._customModeInstances.entries()) {
        if (!seenUris.has(uriString)) {
          this._customModeInstances.delete(uriString);
          hasChanges = true;
        }
      }
      this.hasCustomModes.set(this._customModeInstances.size > 0);
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      this.logService.error(error, "Failed to load custom agents");
      this._customModeInstances.clear();
      this.hasCustomModes.set(false);
      hasChanges = true;
    }
    if (hasChanges) {
      this._onDidChange.fire();
    }
  }
  getBuiltinModes() {
    const builtinModes = [
      ChatMode.Ask
    ];
    if (this.chatAgentService.hasToolsAgent || this.isAgentModeDisabledByPolicy()) {
      builtinModes.unshift(ChatMode.Agent);
    }
    builtinModes.push(ChatMode.Edit);
    return builtinModes;
  }
  getCustomModes() {
    if (!this.chatAgentService.hasToolsAgent && !this.isAgentModeDisabledByPolicy()) {
      return [];
    }
    return Array.from(this._customModeInstances.values()).sort((a, b) => a.label.get().localeCompare(b.label.get()));
  }
  isAgentModeDisabledByPolicy() {
    return this.configurationService.inspect("chat.agent.enabled" /* AgentEnabled */).policyValue === false;
  }
};

ChatModes = __decorateClass([
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ICustomizationHarnessService)
], ChatModes);

var ChatModeService = class extends Disposable {
  constructor(instantiationService, contextKeyService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.agentModeDisabledByPolicy = ChatContextKeys.Modes.agentModeDisabledByPolicy.bindTo(contextKeyService);
    this.updateAgentModePolicyContextKey();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agent.enabled" /* AgentEnabled */)) {
        this.updateAgentModePolicyContextKey();
      }
    }));
  }
  createModes(sessionResource) {
    return this.instantiationService.createInstance(ChatModes, sessionResource);
  }
  async getLocalModes() {
    if (!this.localMode) {
      this.localMode = (async () => {
        const modes = this._register(this.createModes(LocalChatSessionUri.getNewSessionUri()));
        await modes.waitForPendingUpdates();
        return modes;
      })();
    }
    return this.localMode;
  }
  updateAgentModePolicyContextKey() {
    this.agentModeDisabledByPolicy.set(this.isAgentModeDisabledByPolicy());
  }
  isAgentModeDisabledByPolicy() {
    return this.configurationService.inspect("chat.agent.enabled" /* AgentEnabled */).policyValue === false;
  }
};

ChatModeService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService)
], ChatModeService);

var IChatModeInstructions;

((IChatModeInstructions2) => {
  function isEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.content === b.content && equals4(a.toolReferences, b.toolReferences) && equals4(a.metadata, b.metadata);
  }
  IChatModeInstructions2.isEquals = isEquals;
})(IChatModeInstructions || (IChatModeInstructions = {}));

function isCachedChatModeData(data) {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  const mode = data;
  return typeof mode.id === "string" && typeof mode.name === "string" && typeof mode.kind === "string" && (mode.description === void 0 || typeof mode.description === "string") && (mode.customTools === void 0 || Array.isArray(mode.customTools)) && (mode.modeInstructions === void 0 || typeof mode.modeInstructions === "object" && mode.modeInstructions !== null) && (mode.model === void 0 || typeof mode.model === "string" || Array.isArray(mode.model)) && (mode.argumentHint === void 0 || typeof mode.argumentHint === "string") && (mode.handOffs === void 0 || Array.isArray(mode.handOffs)) && (mode.uri === void 0 || typeof mode.uri === "object" && mode.uri !== null) && (mode.source === void 0 || isChatModeSourceData(mode.source)) && (mode.target === void 0 || isTarget(mode.target)) && (mode.visibility === void 0 || isCustomAgentVisibility(mode.visibility)) && (mode.agents === void 0 || Array.isArray(mode.agents)) && (mode.sessionTypes === void 0 || Array.isArray(mode.sessionTypes));
}

var CustomChatMode = class {
  constructor(customChatMode) {
    this.kind = "agent" /* Agent */;
    this.id = customChatMode.uri.toString();
    this._nameObservable = observableValue("name", customChatMode.name);
    this._descriptionObservable = observableValue("description", customChatMode.description);
    this._customToolsObservable = observableValue("customTools", customChatMode.tools);
    this._modelObservable = observableValue("model", customChatMode.model);
    this._argumentHintObservable = observableValue("argumentHint", customChatMode.argumentHint);
    this._handoffsObservable = observableValue("handOffs", customChatMode.handOffs);
    this._targetObservable = observableValue("target", customChatMode.target);
    this._visibilityObservable = observableValue("visibility", customChatMode.visibility);
    this._agentsObservable = observableValue("agents", customChatMode.agents);
    this._modeInstructions = observableValue("_modeInstructions", customChatMode.agentInstructions);
    this._uriObservable = observableValue("uri", customChatMode.uri);
    this._source = customChatMode.source;
    this._sessionTypes = customChatMode.sessionTypes;
  }
  get name() {
    return this._nameObservable;
  }
  get description() {
    return this._descriptionObservable;
  }
  get icon() {
    return constObservable(void 0);
  }
  get isBuiltin() {
    return isBuiltinChatMode(this);
  }
  get customTools() {
    return this._customToolsObservable;
  }
  get model() {
    return this._modelObservable;
  }
  get argumentHint() {
    return this._argumentHintObservable;
  }
  get modeInstructions() {
    return this._modeInstructions;
  }
  get uri() {
    return this._uriObservable;
  }
  get label() {
    return this.name;
  }
  get handOffs() {
    return this._handoffsObservable;
  }
  get source() {
    return this._source;
  }
  get target() {
    return this._targetObservable;
  }
  get visibility() {
    return this._visibilityObservable;
  }
  get agents() {
    return this._agentsObservable;
  }
  get sessionTypes() {
    return this._sessionTypes;
  }
  /**
   * Updates the underlying data and triggers observable changes
   */
  updateData(newData) {
    let hasChanges = false;
    transaction((tx) => {
      const update = (observable, newValue, equals5 = (a, b) => a === b) => {
        if (!equals5(observable.get(), newValue)) {
          observable.set(newValue, tx);
          hasChanges = true;
        }
      };
      update(this._nameObservable, newData.name);
      update(this._descriptionObservable, newData.description);
      update(this._customToolsObservable, newData.tools, equals);
      update(this._modelObservable, newData.model, equals);
      update(this._argumentHintObservable, newData.argumentHint);
      update(this._modeInstructions, newData.agentInstructions, IChatModeInstructions.isEquals);
      update(this._uriObservable, newData.uri, isEqual2);
      update(this._handoffsObservable, newData.handOffs, equals4);
      update(this._targetObservable, newData.target);
      update(this._visibilityObservable, newData.visibility, equals4);
      update(this._agentsObservable, newData.agents, equals);
      if (!IAgentSource.isEquals(this._source, newData.source)) {
        this._source = newData.source;
        hasChanges = true;
      }
      if (!equals(this._sessionTypes, newData.sessionTypes)) {
        this._sessionTypes = newData.sessionTypes;
        hasChanges = true;
      }
    });
    return hasChanges;
  }
  toJSON() {
    return {
      id: this.id,
      name: this.name.get(),
      description: this.description.get(),
      kind: this.kind,
      customTools: this.customTools.get(),
      model: this.model.get(),
      argumentHint: this.argumentHint.get(),
      modeInstructions: this.modeInstructions.get(),
      uri: this.uri.get(),
      handOffs: this.handOffs.get(),
      source: serializeChatModeSource(this._source),
      target: this.target.get(),
      visibility: this.visibility.get(),
      agents: this.agents.get(),
      sessionTypes: this.sessionTypes
    };
  }
};

function isChatModeSourceData(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const data = value2;
  if (data.storage === "extension" /* extension */) {
    return typeof data.extensionId === "string";
  }
  if (data.storage === "plugin" /* plugin */) {
    return isUriComponents(data.pluginUri);
  }
  return data.storage === "local" /* local */ || data.storage === "user" /* user */ || data.storage === "builtin" /* builtIn */;
}

function serializeChatModeSource(source) {
  if (!source) {
    return void 0;
  }
  if (source.storage === "extension" /* extension */) {
    return { storage: "extension" /* extension */, extensionId: source.extensionId.value };
  }
  if (source.storage === "plugin" /* plugin */) {
    return { storage: "plugin" /* plugin */, pluginUri: source.pluginUri };
  }
  return { storage: source.storage };
}

function reviveChatModeSource(data) {
  if (!data) {
    return void 0;
  }
  if (data.storage === "extension" /* extension */) {
    return { storage: "extension" /* extension */, extensionId: new ExtensionIdentifier(data.extensionId) };
  }
  if (data.storage === "plugin" /* plugin */) {
    return { storage: "plugin" /* plugin */, pluginUri: URI.revive(data.pluginUri) };
  }
  return { storage: data.storage };
}

var BuiltinChatMode = class {
  constructor(kind, label3, description, icon2) {
    this.kind = kind;
    this.name = constObservable(kind);
    this.label = constObservable(label3);
    this.description = observableValue("description", description);
    this.icon = constObservable(icon2);
    this.target = constObservable("undefined" /* Undefined */);
  }
  get isBuiltin() {
    return isBuiltinChatMode(this);
  }
  get id() {
    return this.kind;
  }
  /**
   * Getters are not json-stringified
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name.get(),
      description: this.description.get(),
      kind: this.kind
    };
  }
};

var ChatMode;

((ChatMode2) => {
  ChatMode2.Ask = new BuiltinChatMode("ask" /* Ask */, "Ask", localize(12915, null), Codicon.question);
  ChatMode2.Edit = new BuiltinChatMode("edit" /* Edit */, "Edit", localize(12916, null), Codicon.edit);
  ChatMode2.Agent = new BuiltinChatMode("agent" /* Agent */, "Agent", localize(12914, null), Codicon.agent);
})(ChatMode || (ChatMode = {}));

function isBuiltinChatMode(mode) {
  return mode.id === ChatMode.Ask.id || mode.id === ChatMode.Edit.id || mode.id === ChatMode.Agent.id;
}

function getModeNameForTelemetry(mode) {
  const modeStorage = mode.source?.storage;
  if (modeStorage === "local" /* local */ || modeStorage === "user" /* user */) {
    return String(hash(mode.name.get()));
  }
  return mode.name.get();
}

function getHandoffId(handoff) {
  const slug = handoff.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${handoff.agent}:${slug}`;
}

function buildCustomAgentHandoffsInfo(modes) {
  return modes.map((mode) => {
    const handoffs = mode.handOffs?.get() ?? [];
    const visibility = mode.visibility?.get();
    return {
      id: mode.id,
      name: mode.name.get(),
      isBuiltin: mode.isBuiltin,
      visibility: {
        userInvocable: visibility?.userInvocable ?? true,
        agentInvocable: visibility?.agentInvocable ?? true
      },
      handoffs: handoffs.map((h3) => ({
        id: getHandoffId(h3),
        label: h3.label,
        agent: h3.agent,
        prompt: h3.prompt,
        ...h3.send !== void 0 ? { send: h3.send } : {},
        ...h3.showContinueOn !== void 0 ? { showContinueOn: h3.showContinueOn } : {},
        ...h3.model !== void 0 ? { model: h3.model } : {}
      }))
    };
  });
}
export { isCachedChatModeData, isChatModeSourceData, serializeChatModeSource, reviveChatModeSource, isBuiltinChatMode, getModeNameForTelemetry, getHandoffId, buildCustomAgentHandoffsInfo, IChatModeService, ChatModes, ChatModeService, IChatModeInstructions, CustomChatMode, BuiltinChatMode, ChatMode };
