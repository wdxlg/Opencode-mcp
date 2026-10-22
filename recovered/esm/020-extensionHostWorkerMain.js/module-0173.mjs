// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/participants/chatAgents.ts
import { createDecorator } from "./module-0038.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { ChatContextKeys } from "./module-0158.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0044.mjs";
import { Iterable } from "./module-0010.mjs";
import { findLast } from "./module-0003.mjs";
import { ChatPerfMark, markChat } from "./module-0172.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0124.mjs";
import { equalsIgnoreCase } from "./module-0029.mjs";
import { ILanguageModelsService } from "./module-0171.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { revive } from "./module-0074.mjs";


// src/vs/workbench/contrib/chat/common/participants/chatAgents.ts
var IChatAgentService = createDecorator("chatAgentService");

var ChatAgentService = class extends Disposable {
  constructor(contextKeyService, configurationService) {
    super();
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this._agents = /* @__PURE__ */ new Map();
    this._onDidChangeAgents = this._register(new Emitter());
    this.onDidChangeAgents = this._onDidChangeAgents.event;
    this._onWillInvokeAgent = this._register(new Emitter());
    this.onWillInvokeAgent = this._onWillInvokeAgent.event;
    this._agentsContextKeys = /* @__PURE__ */ new Set();
    this._hasToolsAgent = false;
    this._chatParticipantDetectionProviders = /* @__PURE__ */ new Map();
    this._agentCompletionProviders = /* @__PURE__ */ new Map();
    this._hasDefaultAgent = ChatContextKeys.enabled.bindTo(this.contextKeyService);
    this._extensionAgentRegistered = ChatContextKeys.extensionParticipantRegistered.bindTo(this.contextKeyService);
    this._defaultAgentRegistered = ChatContextKeys.panelParticipantRegistered.bindTo(this.contextKeyService);
    this._register(contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(this._agentsContextKeys)) {
        this._updateContextKeys();
      }
    }));
  }
  static {
    this.AGENT_LEADER = "@";
  }
  registerAgent(id2, data2) {
    const existingAgent = this.getAgent(id2);
    if (existingAgent) {
      throw new Error(`Agent already registered: ${JSON.stringify(id2)}`);
    }
    const that = this;
    const commands = data2.slashCommands;
    data2 = {
      ...data2,
      get slashCommands() {
        return commands.filter((c) => !c.when || that.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(c.when)));
      }
    };
    const entry = { data: data2 };
    this._agents.set(id2, entry);
    this._updateAgentsContextKeys();
    this._updateContextKeys();
    this._onDidChangeAgents.fire(void 0);
    return toDisposable(() => {
      this._agents.delete(id2);
      this._updateAgentsContextKeys();
      this._updateContextKeys();
      this._onDidChangeAgents.fire(void 0);
    });
  }
  _updateAgentsContextKeys() {
    this._agentsContextKeys.clear();
    for (const agent of this._agents.values()) {
      if (agent.data.when) {
        const expr = ContextKeyExpr.deserialize(agent.data.when);
        for (const key of expr?.keys() || []) {
          this._agentsContextKeys.add(key);
        }
      }
    }
  }
  _updateContextKeys() {
    let extensionAgentRegistered = false;
    let defaultAgentRegistered = false;
    let toolsAgentRegistered = false;
    for (const agent of this.getAgents()) {
      if (agent.isDefault) {
        if (!agent.isCore) {
          extensionAgentRegistered = true;
        }
        if (agent.id === "chat.setup" || agent.id === "github.copilot.editsAgent") {
          toolsAgentRegistered = true;
        } else {
          defaultAgentRegistered = true;
        }
      }
    }
    this._defaultAgentRegistered.set(defaultAgentRegistered);
    this._extensionAgentRegistered.set(extensionAgentRegistered);
    if (toolsAgentRegistered !== this._hasToolsAgent) {
      this._hasToolsAgent = toolsAgentRegistered;
      this._onDidChangeAgents.fire(this.getDefaultAgent("panel" /* Chat */, "agent" /* Agent */));
    }
  }
  registerAgentImplementation(id2, agentImpl) {
    const entry = this._agents.get(id2);
    if (!entry) {
      throw new Error(`Unknown agent: ${JSON.stringify(id2)}`);
    }
    if (entry.impl) {
      throw new Error(`Agent already has implementation: ${JSON.stringify(id2)}`);
    }
    if (entry.data.isDefault) {
      this._hasDefaultAgent.set(true);
    }
    entry.impl = agentImpl;
    this._onDidChangeAgents.fire(new MergedChatAgent(entry.data, agentImpl));
    return toDisposable(() => {
      entry.impl = void 0;
      this._onDidChangeAgents.fire(void 0);
      if (entry.data.isDefault) {
        this._hasDefaultAgent.set(Iterable.some(this._agents.values(), (agent) => agent.data.isDefault && !!agent.impl));
      }
    });
  }
  registerDynamicAgent(data2, agentImpl) {
    data2.isDynamic = true;
    const agent = { data: data2, impl: agentImpl };
    this._agents.set(data2.id, agent);
    this._onDidChangeAgents.fire(new MergedChatAgent(data2, agentImpl));
    return toDisposable(() => {
      this._agents.delete(data2.id);
      this._onDidChangeAgents.fire(void 0);
    });
  }
  registerAgentCompletionProvider(id2, provider) {
    this._agentCompletionProviders.set(id2, provider);
    return {
      dispose: () => {
        this._agentCompletionProviders.delete(id2);
      }
    };
  }
  async getAgentCompletionItems(id2, query, token) {
    return await this._agentCompletionProviders.get(id2)?.(query, token) ?? [];
  }
  updateAgent(id2, updateMetadata) {
    const agent = this._agents.get(id2);
    if (!agent?.impl) {
      throw new Error(`No activated agent with id ${JSON.stringify(id2)} registered`);
    }
    agent.data.metadata = { ...agent.data.metadata, ...updateMetadata };
    this._onDidChangeAgents.fire(new MergedChatAgent(agent.data, agent.impl));
  }
  getDefaultAgent(location2, mode = "ask" /* Ask */) {
    return this._preferExtensionAgent(this.getActivatedAgents().filter((a) => {
      if (mode && !a.modes.includes(mode)) {
        return false;
      }
      return !!a.isDefault && a.locations.includes(location2);
    }));
  }
  get hasToolsAgent() {
    return !!this.configurationService.getValue("chat.agent.enabled" /* AgentEnabled */);
  }
  getContributedDefaultAgent(location2) {
    return this._preferExtensionAgent(this.getAgents().filter((a) => !!a.isDefault && a.locations.includes(location2)));
  }
  _preferExtensionAgent(agents) {
    return findLast(agents, (agent) => !agent.isCore) ?? agents.at(-1);
  }
  getAgent(id2, includeDisabled = false) {
    if (!this._agentIsEnabled(id2) && !includeDisabled) {
      return;
    }
    return this._agents.get(id2)?.data;
  }
  _agentIsEnabled(idOrAgent) {
    const entry = typeof idOrAgent === "string" ? this._agents.get(idOrAgent) : idOrAgent;
    return !entry?.data.when || this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(entry.data.when));
  }
  getAgentByFullyQualifiedId(id2) {
    const agent = Iterable.find(this._agents.values(), (a) => getFullyQualifiedId(a.data) === id2)?.data;
    if (agent && !this._agentIsEnabled(agent.id)) {
      return;
    }
    return agent;
  }
  /**
   * Returns all agent datas that exist- static registered and dynamic ones.
   */
  getAgents() {
    return Array.from(this._agents.values()).map((entry) => entry.data).filter((a) => this._agentIsEnabled(a.id));
  }
  getActivatedAgents() {
    return Array.from(this._agents.values()).filter((a) => !!a.impl).filter((a) => this._agentIsEnabled(a.data.id)).map((a) => new MergedChatAgent(a.data, a.impl));
  }
  getAgentsByName(name2) {
    return this._preferExtensionAgents(this.getAgents().filter((a) => a.name === name2));
  }
  _preferExtensionAgents(agents) {
    const extensionAgents = agents.filter((a) => !a.isCore);
    return extensionAgents.length > 0 ? extensionAgents : agents;
  }
  agentHasDupeName(id2) {
    const agent = this.getAgent(id2);
    if (!agent) {
      return false;
    }
    return this.getAgentsByName(agent.name).filter((a) => a.extensionId.value !== agent.extensionId.value).length > 0;
  }
  async invokeAgent(id2, request, progress, history, token) {
    markChat(request.sessionResource, ChatPerfMark.AgentWillInvoke);
    const data2 = this._agents.get(id2);
    if (!data2?.impl) {
      throw new Error(`No activated agent with id "${id2}"`);
    }
    this._onWillInvokeAgent.fire({ agentId: id2, request });
    const result = await data2.impl.invoke(request, progress, history, token);
    markChat(request.sessionResource, ChatPerfMark.AgentDidInvoke);
    return result;
  }
  setRequestTools(id2, requestId, tools) {
    const data2 = this._agents.get(id2);
    if (!data2?.impl) {
      return;
    }
    data2.impl.setRequestTools?.(requestId, tools);
  }
  setYieldRequested(id2, requestId, value) {
    const data2 = this._agents.get(id2);
    if (!data2?.impl) {
      return;
    }
    data2.impl.setYieldRequested?.(requestId, value);
  }
  async getFollowups(id2, request, result, history, token) {
    const data2 = this._agents.get(id2);
    if (!data2?.impl?.provideFollowups) {
      return [];
    }
    return data2.impl.provideFollowups(request, result, history, token);
  }
  async getChatTitle(id2, history, token) {
    const data2 = this._agents.get(id2);
    if (!data2?.impl?.provideChatTitle) {
      return void 0;
    }
    return data2.impl.provideChatTitle(history, token);
  }
  async getChatSummary(id2, history, token) {
    const data2 = this._agents.get(id2);
    if (!data2?.impl?.provideChatSummary) {
      return void 0;
    }
    return data2.impl.provideChatSummary(history, token);
  }
  registerChatParticipantDetectionProvider(handle, provider) {
    this._chatParticipantDetectionProviders.set(handle, provider);
    return toDisposable(() => {
      this._chatParticipantDetectionProviders.delete(handle);
    });
  }
  hasChatParticipantDetectionProviders() {
    return this._chatParticipantDetectionProviders.size > 0;
  }
  async detectAgentOrCommand(request, history, options2, token) {
    const provider = Iterable.first(this._chatParticipantDetectionProviders.values());
    if (!provider) {
      return;
    }
    const participants = this.getAgents().reduce((acc, a) => {
      if (a.locations.includes(options2.location)) {
        acc.push({ participant: a.id, disambiguation: a.disambiguation ?? [] });
        for (const command2 of a.slashCommands) {
          acc.push({ participant: a.id, command: command2.name, disambiguation: command2.disambiguation ?? [] });
        }
      }
      return acc;
    }, []);
    const result = await provider.provideParticipantDetection(request, history, { ...options2, participants }, token);
    if (!result) {
      return;
    }
    const agent = this.getAgent(result.participant);
    if (!agent) {
      return;
    }
    if (!result.command) {
      return { agent };
    }
    const command = agent?.slashCommands.find((c) => c.name === result.command);
    if (!command) {
      return;
    }
    return { agent, command };
  }
};

ChatAgentService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IConfigurationService)
], ChatAgentService);

var MergedChatAgent = class {
  constructor(data2, impl) {
    this.data = data2;
    this.impl = impl;
  }
  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name ?? "";
  }
  get fullName() {
    return this.data.fullName ?? "";
  }
  get description() {
    return this.data.description ?? "";
  }
  get extensionId() {
    return this.data.extensionId;
  }
  get extensionVersion() {
    return this.data.extensionVersion;
  }
  get extensionPublisherId() {
    return this.data.extensionPublisherId;
  }
  get extensionPublisherDisplayName() {
    return this.data.publisherDisplayName;
  }
  get extensionDisplayName() {
    return this.data.extensionDisplayName;
  }
  get isDefault() {
    return this.data.isDefault;
  }
  get isCore() {
    return this.data.isCore;
  }
  get metadata() {
    return this.data.metadata;
  }
  get slashCommands() {
    return this.data.slashCommands;
  }
  get locations() {
    return this.data.locations;
  }
  get modes() {
    return this.data.modes;
  }
  get disambiguation() {
    return this.data.disambiguation;
  }
  async invoke(request, progress, history, token) {
    return this.impl.invoke(request, progress, history, token);
  }
  setRequestTools(requestId, tools) {
    this.impl.setRequestTools?.(requestId, tools);
  }
  setYieldRequested(requestId, value) {
    this.impl.setYieldRequested?.(requestId, value);
  }
  async provideFollowups(request, result, history, token) {
    if (this.impl.provideFollowups) {
      return this.impl.provideFollowups(request, result, history, token);
    }
    return [];
  }
  toJSON() {
    return this.data;
  }
};

var IChatAgentNameService = createDecorator("chatAgentNameService");

var ChatAgentNameService = class {
  constructor(languageModelsService) {
    this.languageModelsService = languageModelsService;
  }
  /**
   * Returns true if the agent is allowed to use this name
   */
  getAgentNameRestriction(chatAgentData) {
    if (chatAgentData.isCore) {
      return true;
    }
    const nameAllowed = this.checkAgentNameRestriction(chatAgentData.name, chatAgentData).get();
    const fullNameAllowed = !chatAgentData.fullName || this.checkAgentNameRestriction(chatAgentData.fullName.replace(/\s/g, ""), chatAgentData).get();
    return nameAllowed && fullNameAllowed;
  }
  checkAgentNameRestriction(name2, chatAgentData) {
    const allowList = this.languageModelsService.restrictedChatParticipants.map((registry) => registry[name2.toLowerCase()]);
    return allowList.map((allowList2) => {
      if (!allowList2) {
        return true;
      }
      return allowList2.some((id2) => equalsIgnoreCase(id2, id2.includes(".") ? chatAgentData.extensionId.value : chatAgentData.extensionPublisherId));
    });
  }
};

ChatAgentNameService = __decorateClass([
  __decorateParam(0, ILanguageModelsService)
], ChatAgentNameService);

function getFullyQualifiedId(chatAgentData) {
  return `${chatAgentData.extensionId.value}.${chatAgentData.id}`;
}

function isSerializableChatAgentData(obj) {
  return obj.name !== void 0;
}

function reviveSerializedAgent(raw) {
  const normalized = isSerializableChatAgentData(raw) ? raw : {
    ...raw,
    name: raw.id
  };
  if (!normalized.extensionPublisherId) {
    normalized.extensionPublisherId = raw.extensionPublisher ?? "";
  }
  if (!normalized.extensionDisplayName) {
    normalized.extensionDisplayName = "";
  }
  if (!normalized.extensionId) {
    normalized.extensionId = new ExtensionIdentifier("");
  }
  return revive(normalized);
}
export { getFullyQualifiedId, isSerializableChatAgentData, reviveSerializedAgent, IChatAgentService, ChatAgentService, MergedChatAgent, IChatAgentNameService, ChatAgentNameService };
