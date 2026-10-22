// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatAgents2.ts
import { DeferredPromise } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { autorun } from "./module-0052.mjs";
import { AgentSessionProviders, getAgentSessionProvider } from "./module-0982.mjs";
import { URI } from "./module-0032.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { ChatSessionOptionsMap, IChatSessionsService } from "./module-0960.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { revive } from "./module-0265.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Schemas } from "./module-0033.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { ChatRequestParser } from "./module-0991.mjs";
import { getDynamicVariablesForWidget, getSelectedToolAndToolSetsForWidget } from "./module-0992.mjs";
import { ChatRequestAgentPart } from "./module-0987.mjs";
import { Range2 } from "./module-0106.mjs";
import { AddDynamicVariableAction } from "./module-0984.mjs";
import { isValidPromptType } from "./module-0985.mjs";
import { AICustomizationManagementSection } from "./module-0995.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IChatService } from "./module-0972.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { NotebookDto } from "./module-0994.mjs";


// src/vs/workbench/api/browser/mainThreadChatAgents2.ts
var MainThreadChatTask = class {
  constructor(content2) {
    this.content = content2;
    this.kind = "progressTask";
    this.deferred = new DeferredPromise();
    this._onDidAddProgress = new Emitter();
    this.progress = [];
  }
  get onDidAddProgress() {
    return this._onDidAddProgress.event;
  }
  task() {
    return this.deferred.p;
  }
  isSettled() {
    return this.deferred.isSettled;
  }
  complete(v2) {
    this.deferred.complete(v2);
  }
  add(progress) {
    this.progress.push(progress);
    this._onDidAddProgress.fire(progress);
  }
  toJSON() {
    return {
      kind: "progressTaskSerialized",
      content: this.content,
      progress: this.progress
    };
  }
};

var MainThreadChatAgents2 = class extends Disposable {
  constructor(extHostContext, _chatAgentService, _chatSessionService, _chatService, _languageFeaturesService, _chatWidgetService, _instantiationService, _logService, _extensionService, _uriIdentityService, _promptsService, _languageModelToolsService, _customizationHarnessService, _telemetryService, _agentPluginService, _environmentService) {
    super();
    this._chatAgentService = _chatAgentService;
    this._chatSessionService = _chatSessionService;
    this._chatService = _chatService;
    this._languageFeaturesService = _languageFeaturesService;
    this._chatWidgetService = _chatWidgetService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._extensionService = _extensionService;
    this._uriIdentityService = _uriIdentityService;
    this._promptsService = _promptsService;
    this._languageModelToolsService = _languageModelToolsService;
    this._customizationHarnessService = _customizationHarnessService;
    this._telemetryService = _telemetryService;
    this._agentPluginService = _agentPluginService;
    this._environmentService = _environmentService;
    this._agents = this._register(new DisposableMap());
    this._agentCompletionProviders = this._register(new DisposableMap());
    this._agentIdsToCompletionProviders = this._register(new DisposableMap());
    this._chatParticipantDetectionProviders = this._register(new DisposableMap());
    this._promptFileProviders = this._register(new DisposableMap());
    this._promptFileProviderEmitters = this._register(new DisposableMap());
    this._promptFileContentRegistrations = this._register(new DisposableMap());
    this._customizationProviders = this._register(new DisposableMap());
    this._customizationProviderEmitters = this._register(new DisposableMap());
    this._pendingProgress = /* @__PURE__ */ new Map();
    this._activeTasks = /* @__PURE__ */ new Map();
    this._unresolvedAnchors = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatAgents2);
    this._register(this._chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResources) {
        this._proxy.$releaseSession(resource);
      }
    }));
    this._register(this._chatService.onDidPerformUserAction((e) => {
      if (typeof e.agentId === "string") {
        for (const [handle2, agent] of this._agents) {
          if (agent.id === e.agentId) {
            if (e.action.kind === "vote") {
              this._proxy.$acceptFeedback(handle2, e.result ?? {}, e.action);
            } else {
              this._proxy.$acceptAction(handle2, e.result || {}, e);
            }
            break;
          }
        }
      }
    }));
    this._register(this._chatService.onDidReceiveQuestionCarouselAnswer((e) => {
      this._proxy.$handleQuestionCarouselAnswer(e.requestId, e.resolveId, e.answers);
    }));
    this._register(this._chatWidgetService.onDidChangeFocusedSession(() => {
      this._acceptActiveChatSession(this._chatWidgetService.lastFocusedWidget);
    }));
    this._acceptActiveChatSession(this._chatWidgetService.lastFocusedWidget);
    this._register(this._promptsService.onDidChangeCustomAgents(() => {
      this._proxy.$onDidChangeCustomAgents();
    }));
    this._register(this._promptsService.onDidChangeInstructions(() => {
      this._proxy.$onDidChangeInstructions();
    }));
    this._register(this._promptsService.onDidChangeSkills(() => {
      this._proxy.$onDidChangeSkills();
    }));
    this._register(this._promptsService.onDidChangeSlashCommands(() => {
      this._proxy.$onDidChangeSlashCommands();
    }));
    this._register(this._promptsService.onDidChangeHooks(() => {
      this._proxy.$onDidChangeHooks();
    }));
    this._register(autorun((reader) => {
      this._agentPluginService.plugins.read(reader);
      this._proxy.$onDidChangePlugins();
    }));
  }
  _acceptActiveChatSession(widget) {
    const sessionResource = widget?.viewModel?.sessionResource;
    const isLocal = sessionResource && getAgentSessionProvider(sessionResource) === AgentSessionProviders.Local;
    this._proxy.$acceptActiveChatSession(isLocal ? sessionResource : void 0);
  }
  _toChatResourceSource(storage) {
    switch (storage) {
      case "local" /* local */:
        return "local";
      case "user" /* user */:
        return "user";
      case "extension" /* extension */:
        return "extension";
      case "plugin" /* plugin */:
        return "plugin";
      case "builtin" /* builtIn */:
        return "builtin";
    }
  }
  _toCustomAgentDto(agent) {
    return {
      uri: agent.uri,
      name: agent.name,
      description: agent.description,
      source: this._toChatResourceSource(agent.source.storage),
      extensionId: agent.source.storage === "extension" /* extension */ ? agent.source.extensionId.value : void 0,
      pluginUri: agent.source.storage === "plugin" /* plugin */ ? agent.source.pluginUri : void 0,
      sessionTypes: agent.sessionTypes,
      argumentHint: agent.argumentHint,
      tools: agent.tools,
      model: agent.model,
      userInvocable: agent.visibility.userInvocable,
      disableModelInvocation: !agent.visibility.agentInvocable,
      enabled: agent.enabled
    };
  }
  _toInstructionDto(instruction) {
    return {
      uri: instruction.uri,
      name: instruction.name,
      description: instruction.description,
      source: this._toChatResourceSource(instruction.storage),
      extensionId: instruction.extension?.identifier.value,
      pluginUri: instruction.pluginUri,
      sessionTypes: instruction.sessionTypes,
      pattern: instruction.pattern
    };
  }
  _toSkillDto(skill) {
    return {
      uri: skill.uri,
      name: skill.name,
      description: skill.description,
      source: this._toChatResourceSource(skill.storage),
      extensionId: skill.extension?.identifier.value,
      pluginUri: skill.pluginUri,
      sessionTypes: skill.sessionTypes,
      userInvocable: skill.userInvocable,
      disableModelInvocation: skill.disableModelInvocation
    };
  }
  _toSlashCommandDto(slashCommand) {
    return {
      uri: slashCommand.uri,
      name: slashCommand.name,
      description: slashCommand.description,
      source: this._toChatResourceSource(slashCommand.storage),
      extensionId: slashCommand.extension?.identifier.value,
      pluginUri: slashCommand.pluginUri,
      sessionTypes: slashCommand.sessionTypes,
      argumentHint: slashCommand.argumentHint,
      userInvocable: slashCommand.userInvocable
    };
  }
  _toHookDto(hookFile) {
    return {
      uri: hookFile.uri,
      sessionTypes: hookFile.sessionTypes,
      source: this._toChatResourceSource(hookFile.storage),
      extensionId: hookFile.extension?.identifier.value,
      pluginUri: hookFile.pluginUri
    };
  }
  _toPluginDto(plugin) {
    return {
      uri: plugin.uri
    };
  }
  async $provideCustomAgents(token) {
    const customAgents = await this._promptsService.getCustomAgents(token);
    return customAgents.map((agent) => this._toCustomAgentDto(agent));
  }
  async $provideInstructions(token) {
    const instructions = await this._promptsService.getInstructionFiles(token);
    return instructions.map((instruction) => this._toInstructionDto(instruction));
  }
  async $provideSkills(token) {
    const skills = await this._promptsService.findAgentSkills(token) ?? [];
    return skills.map((skill) => this._toSkillDto(skill));
  }
  async $provideSlashCommands(token) {
    const slashCommands = await this._promptsService.getPromptSlashCommands(token);
    return slashCommands.map((slashCommand) => this._toSlashCommandDto(slashCommand));
  }
  async $provideHooks(token) {
    const hookFiles = await this._promptsService.listPromptFiles("hook" /* hook */, token);
    return hookFiles.map((hookFile) => this._toHookDto(hookFile));
  }
  async $providePlugins(_token) {
    const plugins = this._agentPluginService.plugins.get();
    return plugins.map((plugin) => this._toPluginDto(plugin));
  }
  $unregisterAgent(handle2) {
    this._agents.deleteAndDispose(handle2);
  }
  async $transferActiveChatSession(toWorkspace) {
    const widget = this._chatWidgetService.lastFocusedWidget;
    const model = widget?.viewModel?.model;
    if (!model) {
      this._logService.error(`MainThreadChat#$transferActiveChatSession: No active chat session found`);
      return;
    }
    await this._chatService.transferChatSession(model.sessionResource, URI.revive(toWorkspace));
  }
  async $registerAgent(handle2, extension, id2, metadata, dynamicProps) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const staticAgentRegistration = this._chatAgentService.getAgent(id2, true);
    const chatSessionRegistration = this._chatSessionService.getAllChatSessionContributions().find((c) => c.type === id2 || c.alternativeIds?.includes(id2));
    if (!staticAgentRegistration && !chatSessionRegistration && !dynamicProps) {
      if (this._chatAgentService.getAgentsByName(id2).length) {
        throw new Error(`chatParticipant must be declared with an ID in package.json. The "id" property may be missing! "${id2}"`);
      }
      throw new Error(`chatParticipant must be declared in package.json: ${id2}`);
    }
    const impl = {
      invoke: async (request2, progress, history, token) => {
        const chatSession = this._chatService.getSession(request2.sessionResource);
        this._pendingProgress.set(request2.requestId, { progress, chatSession, isSubagent: !!request2.subAgentInvocationId });
        try {
          const chatSessionResource = request2.sessionResource;
          const chatSessionContext = {
            chatSessionResource,
            isUntitled: isUntitledChatSession(chatSessionResource),
            initialSessionOptions: ChatSessionOptionsMap.toStrValueArray(this._chatSessionService.getSessionOptions(chatSessionResource))
          };
          const rpcResult = await this._proxy.$invokeAgent(handle2, request2, {
            history,
            chatSessionContext
          }, token);
          if (rpcResult?.errorCallstack && !rpcResult.errorDetails?.isRateLimited && !rpcResult.errorDetails?.isQuotaExceeded && !rpcResult.errorDetails?.isExpectedError) {
            this._telemetryService.publicLogError2("chatAgentError", {
              callstack: rpcResult.errorCallstack,
              msg: rpcResult.errorDetails?.message ?? "",
              errorName: rpcResult.errorName ?? "",
              agent: id2,
              agentExtensionId: extension.value
            });
          }
          if (rpcResult) {
            const { errorCallstack: _, errorName: _2, ...result } = rpcResult;
            return result;
          }
          return {};
        } finally {
          this._pendingProgress.delete(request2.requestId);
        }
      },
      setRequestTools: (requestId, tools) => {
        this._proxy.$setRequestTools(requestId, tools);
      },
      setYieldRequested: (requestId, value2) => {
        this._proxy.$setYieldRequested(requestId, value2);
      },
      provideFollowups: async (request2, result, history, token) => {
        if (!this._agents.get(handle2)?.hasFollowups) {
          return [];
        }
        return this._proxy.$provideFollowups(request2, handle2, result, { history }, token);
      },
      provideChatTitle: (history, token) => {
        return this._proxy.$provideChatTitle(handle2, history, token);
      },
      provideChatSummary: (history, token) => {
        return this._proxy.$provideChatSummary(handle2, history, token);
      }
    };
    if (chatSessionRegistration?.alternativeIds?.includes(id2)) {
      return;
    }
    let disposable;
    if (!staticAgentRegistration && dynamicProps) {
      const extensionDescription = this._extensionService.extensions.find((e) => ExtensionIdentifier.equals(e.identifier, extension));
      disposable = this._chatAgentService.registerDynamicAgent(
        {
          id: id2,
          name: dynamicProps.name,
          description: dynamicProps.description,
          extensionId: extension,
          extensionVersion: extensionDescription?.version,
          extensionDisplayName: extensionDescription?.displayName ?? extension.value,
          extensionPublisherId: extensionDescription?.publisher ?? "",
          publisherDisplayName: dynamicProps.publisherName,
          fullName: dynamicProps.fullName,
          metadata: revive(metadata),
          slashCommands: [],
          disambiguation: [],
          locations: ["panel" /* Chat */],
          modes: ["ask" /* Ask */, "agent" /* Agent */, "edit" /* Edit */]
        },
        impl
      );
    } else {
      disposable = this._chatAgentService.registerAgentImplementation(id2, impl);
    }
    this._agents.set(handle2, {
      id: id2,
      extensionId: extension,
      dispose: () => disposable.dispose(),
      hasFollowups: metadata.hasFollowups
    });
  }
  async $updateAgent(handle2, metadataUpdate) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const data = this._agents.get(handle2);
    if (!data) {
      this._logService.error(`MainThreadChatAgents2#$updateAgent: No agent with handle ${handle2} registered`);
      return;
    }
    data.hasFollowups = metadataUpdate.hasFollowups;
    this._chatAgentService.updateAgent(data.id, revive(metadataUpdate));
  }
  async $handleProgressChunk(requestId, chunks) {
    const pendingProgress = this._pendingProgress.get(requestId);
    if (!pendingProgress) {
      this._logService.warn(`MainThreadChatAgents2#$handleProgressChunk: No pending progress for requestId ${requestId}`);
      return;
    }
    const { progress, chatSession, isSubagent } = pendingProgress;
    const chatProgressParts = [];
    const response = chatSession?.getRequests().find((req) => req.id === requestId)?.response;
    for (const item of chunks) {
      const [progress2, responsePartHandle] = Array.isArray(item) ? item : [item];
      if (progress2.kind === "externalEdits") {
        if (chatSession?.editingSession && responsePartHandle !== void 0 && response) {
          const parts = progress2.start ? await chatSession.editingSession.startExternalEdits(response, responsePartHandle, revive(progress2.resources), progress2.undoStopId) : await chatSession.editingSession.stopExternalEdits(response, responsePartHandle);
          chatProgressParts.push(...parts);
        }
        continue;
      }
      if (progress2.kind === "beginToolInvocation") {
        this._languageModelToolsService.beginToolCall({
          toolCallId: progress2.toolCallId,
          toolId: progress2.toolName,
          chatRequestId: requestId,
          sessionResource: chatSession?.sessionResource,
          subagentInvocationId: progress2.subagentInvocationId
        });
        continue;
      }
      if (progress2.kind === "updateToolInvocation") {
        this._languageModelToolsService.updateToolStream(progress2.toolCallId, progress2.streamData?.partialInput, CancellationToken.None);
        continue;
      }
      if (progress2.kind === "usage") {
        if (isSubagent) {
          chatProgressParts.push({
            kind: "usage",
            promptTokens: progress2.promptTokens,
            completionTokens: progress2.completionTokens,
            outputBuffer: progress2.outputBuffer,
            copilotCredits: progress2.copilotCredits,
            promptTokenDetails: progress2.promptTokenDetails
          });
        } else if (response) {
          response.setUsage({
            kind: "usage",
            promptTokens: progress2.promptTokens,
            completionTokens: progress2.completionTokens,
            outputBuffer: progress2.outputBuffer,
            copilotCredits: progress2.copilotCredits,
            promptTokenDetails: progress2.promptTokenDetails
          });
        } else {
          this._logService.warn(`MainThreadChatAgents2#$handleProgressChunk: No response model for usage of non-subagent request ${requestId}; dropping usage.`);
        }
        continue;
      }
      const revivedProgress = progress2.kind === "notebookEdit" ? ChatNotebookEdit.fromChatEdit(progress2) : revive(progress2);
      if (revivedProgress.kind === "notebookEdit" || revivedProgress.kind === "textEdit" || revivedProgress.kind === "codeblockUri") {
        revivedProgress.uri = this._uriIdentityService.asCanonicalUri(revivedProgress.uri);
      }
      if (responsePartHandle !== void 0) {
        if (revivedProgress.kind === "progressTask") {
          const handle2 = responsePartHandle;
          const responsePartId = `${requestId}_${handle2}`;
          const task = new MainThreadChatTask(revivedProgress.content);
          this._activeTasks.set(responsePartId, task);
          chatProgressParts.push(task);
        } else if (responsePartHandle !== void 0) {
          const responsePartId = `${requestId}_${responsePartHandle}`;
          const task = this._activeTasks.get(responsePartId);
          switch (revivedProgress.kind) {
            case "progressTaskResult":
              if (task && revivedProgress.content) {
                task.complete(revivedProgress.content.value);
                this._activeTasks.delete(responsePartId);
              } else {
                task?.complete(void 0);
              }
              break;
            case "warning":
            case "reference":
              task?.add(revivedProgress);
              break;
          }
        }
        continue;
      }
      if (revivedProgress.kind === "inlineReference" && revivedProgress.resolveId && response) {
        if (!this._unresolvedAnchors.has(requestId)) {
          this._unresolvedAnchors.set(requestId, /* @__PURE__ */ new Map());
        }
        this._unresolvedAnchors.get(requestId)?.set(revivedProgress.resolveId, { response });
      }
      chatProgressParts.push(revivedProgress);
    }
    progress(chatProgressParts);
  }
  $handleAnchorResolve(requestId, handle2, resolveAnchor) {
    const unresolvedAnchorsForRequest = this._unresolvedAnchors.get(requestId);
    if (!unresolvedAnchorsForRequest) {
      return;
    }
    const unresolvedAnchor = unresolvedAnchorsForRequest.get(handle2);
    if (!unresolvedAnchor) {
      return;
    }
    unresolvedAnchorsForRequest.delete(handle2);
    if (unresolvedAnchorsForRequest.size === 0) {
      this._unresolvedAnchors.delete(requestId);
    }
    if (resolveAnchor) {
      const revivedAnchor = revive(resolveAnchor);
      unresolvedAnchor.response.resolveInlineReference(handle2, revivedAnchor);
    }
  }
  $registerAgentCompletionsProvider(handle2, id2, triggerCharacters) {
    const provide = async (query, token) => {
      const completions = await this._proxy.$invokeCompletionProvider(handle2, query, token);
      return completions.map((c) => ({ ...c, icon: c.icon ? ThemeIcon.fromId(c.icon) : void 0 }));
    };
    this._agentIdsToCompletionProviders.set(id2, this._chatAgentService.registerAgentCompletionProvider(id2, provide));
    this._agentCompletionProviders.set(handle2, this._languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentCompletions:" + handle2,
      triggerCharacters,
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this._chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return;
        }
        const triggerCharsPart = triggerCharacters.map((c) => escapeRegExpCharacters(c)).join("");
        const wordRegex = new RegExp(`[${triggerCharsPart}]\\S*`, "g");
        const query = getWordAtText(position2.column, wordRegex, model.getLineContent(position2.lineNumber), 0)?.word ?? "";
        if (query && !triggerCharacters.some((c) => query.startsWith(c))) {
          return;
        }
        const context2 = {
          sessionType: getChatSessionType(widget.viewModel.model.sessionResource)
        };
        const parsedRequest = this._instantiationService.createInstance(ChatRequestParser).parseChatRequestWithReferences(getDynamicVariablesForWidget(widget), getSelectedToolAndToolSetsForWidget(widget), model.getValue(), "panel" /* Chat */, context2).parts;
        const agentPart = parsedRequest.find((part) => part instanceof ChatRequestAgentPart);
        const thisAgentId = this._agents.get(handle2)?.id;
        if (agentPart?.agent.id !== thisAgentId) {
          return;
        }
        const range2 = computeCompletionRanges(model, position2, wordRegex);
        if (!range2) {
          return null;
        }
        const result = await provide(query, token);
        const variableItems = result.map((v2) => {
          const insertText = v2.insertText ?? (typeof v2.label === "string" ? v2.label : v2.label.label);
          const rangeAfterInsert = new Range2(range2.insert.startLineNumber, range2.insert.startColumn, range2.insert.endLineNumber, range2.insert.startColumn + insertText.length);
          return {
            label: v2.label,
            range: range2,
            insertText: insertText + " ",
            kind: 18 /* Text */,
            detail: v2.detail,
            documentation: v2.documentation,
            command: { id: AddDynamicVariableAction.ID, title: "", arguments: [{ id: v2.id, widget, range: rangeAfterInsert, variableData: revive(v2.value), command: v2.command }] }
          };
        });
        return {
          suggestions: variableItems
        };
      }
    }));
  }
  $unregisterAgentCompletionsProvider(handle2, id2) {
    this._agentCompletionProviders.deleteAndDispose(handle2);
    this._agentIdsToCompletionProviders.deleteAndDispose(id2);
  }
  $registerChatParticipantDetectionProvider(handle2) {
    this._chatParticipantDetectionProviders.set(handle2, this._chatAgentService.registerChatParticipantDetectionProvider(
      handle2,
      {
        provideParticipantDetection: async (request2, history, options3, token) => {
          return await this._proxy.$detectChatParticipant(handle2, request2, { history }, options3, token);
        }
      }
    ));
  }
  $unregisterChatParticipantDetectionProvider(handle2) {
    this._chatParticipantDetectionProviders.deleteAndDispose(handle2);
  }
  async $registerPromptFileProvider(handle2, type, extensionId) {
    const extension = await this._extensionService.getExtension(extensionId.value);
    if (!extension) {
      this._logService.error(`[MainThreadChatAgents2] Could not find extension for prompt file provider: ${extensionId.value}`);
      return;
    }
    if (!isValidPromptType(type)) {
      this._logService.error(`[MainThreadChatAgents2] Invalid contribution type: ${type}`);
      return;
    }
    const emitter = new Emitter();
    this._promptFileProviderEmitters.set(handle2, emitter);
    const contentRegistrations = new DisposableMap();
    this._promptFileContentRegistrations.set(handle2, contentRegistrations);
    const disposable = this._promptsService.registerPromptFileProvider(extension, type, {
      onDidChangePromptFiles: emitter.event,
      providePromptFiles: async (context2, token) => {
        const contributions = await this._proxy.$providePromptFiles(handle2, type, context2, token);
        if (!contributions) {
          return void 0;
        }
        return contributions.map((c) => {
          return {
            name: c.name,
            description: c.description,
            sessionTypes: c.sessionTypes,
            when: c.when,
            uri: URI.revive(c.uri)
          };
        });
      }
    });
    this._promptFileProviders.set(handle2, disposable);
  }
  $unregisterPromptFileProvider(handle2) {
    this._promptFileProviders.deleteAndDispose(handle2);
    this._promptFileProviderEmitters.deleteAndDispose(handle2);
    this._promptFileContentRegistrations.deleteAndDispose(handle2);
  }
  $onDidChangePromptFiles(handle2) {
    const emitter = this._promptFileProviderEmitters.get(handle2);
    if (emitter) {
      emitter.fire();
    }
  }
  async $registerChatSessionCustomizationProvider(handle2, chatSessionType, metadata, extensionId) {
    if (this._environmentService.isSessionsWindow && !this._chatSessionService.getContentProviderSchemes().includes(chatSessionType)) {
      return;
    }
    const extension = await this._extensionService.getExtension(extensionId.value);
    if (!extension) {
      this._logService.error(`[MainThreadChatAgents2] Could not find extension for customization provider: ${extensionId.value}`);
      return;
    }
    const emitter = new Emitter();
    this._customizationProviderEmitters.set(handle2, emitter);
    const itemProvider = {
      onDidChange: emitter.event,
      provideChatSessionCustomizations: async (sessionResource, token) => {
        const items = await this._proxy.$provideChatSessionCustomizations(handle2, sessionResource, token);
        if (!items) {
          return void 0;
        }
        return items.map((item) => ({
          uri: URI.revive(item.uri),
          type: item.type,
          name: item.name,
          source: item.source,
          description: item.description,
          groupKey: item.groupKey,
          badge: item.badge,
          badgeTooltip: item.badgeTooltip,
          extensionId: item.extensionId,
          pluginUri: item.pluginUri ? URI.revive(item.pluginUri) : void 0,
          pluginLabel: item.pluginLabel,
          userInvocable: item.userInvocable
        }));
      },
      provideSourceFolders: async (sessionResource, type, token) => {
        const folders = await this._proxy.$provideSourceFolders(handle2, sessionResource, type, token);
        if (!folders) {
          return void 0;
        }
        return folders.map((folder) => ({
          uri: URI.revive(folder.uri),
          label: folder.label,
          source: folder.source
        }));
      }
    };
    const typeToSection = {
      "agent": AICustomizationManagementSection.Agents,
      "skill": AICustomizationManagementSection.Skills,
      "instructions": AICustomizationManagementSection.Instructions,
      "prompt": AICustomizationManagementSection.Prompts,
      "hook": AICustomizationManagementSection.Hooks,
      "plugins": AICustomizationManagementSection.Plugins
    };
    let hiddenSections;
    if (metadata.supportedTypes) {
      const supportedSections = /* @__PURE__ */ new Set();
      for (const t2 of metadata.supportedTypes) {
        const section = typeToSection[t2];
        if (section) {
          supportedSections.add(section);
        }
      }
      hiddenSections = Object.values(typeToSection).filter((section) => !supportedSections.has(section));
    }
    const descriptor = {
      id: chatSessionType,
      label: metadata.label,
      icon: metadata.iconId ? ThemeIcon.fromId(metadata.iconId) : ThemeIcon.fromId(Codicon.extensions.id),
      hiddenSections,
      itemProvider
    };
    const registration = this._customizationHarnessService.registerExternalHarness(descriptor);
    this._customizationProviders.set(handle2, registration);
  }
  $unregisterChatSessionCustomizationProvider(handle2) {
    this._customizationProviders.deleteAndDispose(handle2);
    this._customizationProviderEmitters.deleteAndDispose(handle2);
  }
  $onDidChangeCustomizations(handle2) {
    const emitter = this._customizationProviderEmitters.get(handle2);
    if (emitter) {
      emitter.fire();
    }
  }
};

MainThreadChatAgents2 = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatAgents2),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IChatService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IPromptsService),
  __decorateParam(11, ILanguageModelToolsService),
  __decorateParam(12, ICustomizationHarnessService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, IAgentPluginService),
  __decorateParam(15, IWorkbenchEnvironmentService)
], MainThreadChatAgents2);

function computeCompletionRanges(model, position2, reg3) {
  const varWord = getWordAtText(position2.column, reg3, model.getLineContent(position2.lineNumber), 0);
  if (!varWord && model.getWordUntilPosition(position2).word) {
    return;
  }
  let insert2;
  let replace;
  if (!varWord) {
    insert2 = replace = Range2.fromPositions(position2);
  } else {
    insert2 = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, position2.column);
    replace = new Range2(position2.lineNumber, varWord.startColumn, position2.lineNumber, varWord.endColumn);
  }
  return { insert: insert2, replace };
}

var ChatNotebookEdit;

((ChatNotebookEdit2) => {
  function fromChatEdit(part) {
    return {
      kind: "notebookEdit",
      uri: URI.revive(part.uri),
      done: part.done,
      edits: part.edits.map(NotebookDto.fromCellEditOperationDto)
    };
  }
  ChatNotebookEdit2.fromChatEdit = fromChatEdit;
})(ChatNotebookEdit || (ChatNotebookEdit = {}));
export { computeCompletionRanges, MainThreadChatTask, MainThreadChatAgents2, ChatNotebookEdit };
