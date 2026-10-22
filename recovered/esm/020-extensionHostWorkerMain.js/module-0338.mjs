// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostChatAgents2.ts
import { StopWatch } from "./module-0018.mjs";
import { MarkdownString2 } from "./module-0225.mjs";
import { ChatAgentCompletionItem, ChatAgentRequest, ChatAgentResult, ChatAgentUserActionEvent, ChatFollowup, ChatLanguageModelToolReference, ChatLocation2, ChatPromptReference, ChatRequestModeInstructions, ChatResponseAnchorPart2, ChatResponseAutoModeResolutionPart2, ChatResponseCodeCitationPart2, ChatResponseCodeblockUriPart2, ChatResponseCommandButtonPart2, ChatResponseConfirmationPart2, ChatResponseFilesPart, ChatResponseHookPart2, ChatResponseInfoPart2, ChatResponseMarkdownPart2, ChatResponseMarkdownWithVulnerabilitiesPart2, ChatResponseNotebookEditPart2, ChatResponsePart, ChatResponseProgressPart3, ChatResponseQuestionCarouselPart2, ChatResponseReferencePart2, ChatResponseTextEditPart2, ChatResponseThinkingProgressPart2, ChatResponseVoiceProgressPart2, ChatResponseWarningPart2, ChatResponseWorkspaceEditPart2, ChatSessionCustomizationType2, ChatTask, ChatTaskResult, MarkdownString3, Range3, Selection2 } from "./module-0239.mjs";
import { ChatRequestEditorData, ChatRequestNotebookData, ChatRequestTurn, ChatResponseAnchorPart, ChatResponseAutoModeResolutionPart, ChatResponseCodeCitationPart, ChatResponseCodeblockUriPart, ChatResponseCommandButtonPart, ChatResponseConfirmationPart, ChatResponseExtensionsPart, ChatResponseExternalEditPart, ChatResponseFileTreePart, ChatResponseHookPart, ChatResponseInfoPart, ChatResponseMarkdownPart, ChatResponseMarkdownWithVulnerabilitiesPart, ChatResponseMovePart, ChatResponseNotebookEditPart, ChatResponseProgressPart2, ChatResponsePullRequestPart, ChatResponseQuestionCarouselPart, ChatResponseReferencePart, ChatResponseTextEditPart, ChatResponseThinkingProgressPart, ChatResponseTurn, ChatResponseVoiceProgressPart, ChatResponseWarningPart, ChatResponseWorkspaceEditPart, LanguageModelError, ThemeIcon2 } from "./module-0238.mjs";
import { checkProposedApiEnabled, isProposedApiEnabled } from "./module-0167.mjs";
import { generateUuid } from "./module-0062.mjs";
import { DeferredPromise, raceCancellation, raceCancellationError, timeout } from "./module-0034.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0026.mjs";
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { isChatViewTitleActionContext } from "./module-0337.mjs";
import { URI } from "./module-0023.mjs";
import { revive } from "./module-0074.mjs";
import { packErrorForTelemetry } from "./module-0336.mjs";
import { toErrorMessage } from "./module-0041.mjs";
import { coalesce } from "./module-0004.mjs";
import { LocalChatSessionUri } from "./module-0095.mjs";
import { Iterable } from "./module-0010.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { assertType } from "./module-0009.mjs";


// src/vs/workbench/api/common/extHostChatAgents2.ts
var ChatAgentResponseStream = class {
  constructor(_extension, _request, _proxy, _commandsConverter, _sessionDisposables, _pendingCarouselResolvers, _token) {
    this._extension = _extension;
    this._request = _request;
    this._proxy = _proxy;
    this._commandsConverter = _commandsConverter;
    this._sessionDisposables = _sessionDisposables;
    this._pendingCarouselResolvers = _pendingCarouselResolvers;
    this._token = _token;
    this._stopWatch = StopWatch.create(false);
    this._isClosed = false;
  }
  close() {
    this._isClosed = true;
  }
  get timings() {
    return {
      firstProgress: this._firstProgress,
      totalElapsed: this._stopWatch.elapsed()
    };
  }
  get apiObject() {
    if (!this._apiObject) {
      let throwIfDone = function(source) {
        if (that._isClosed) {
          const err = new Error("Response stream has been closed");
          Error.captureStackTrace(err, source);
          throw err;
        }
      }, send = function(chunk, handle) {
        const newLen = sendQueue.push(handle !== void 0 ? [chunk, handle] : chunk);
        if (newLen === 1) {
          queueMicrotask(() => {
            const toNotify = notify;
            notify = [];
            that._proxy.$handleProgressChunk(that._request.requestId, sendQueue).finally(() => {
              toNotify.forEach((f) => f());
            });
            sendQueue.length = 0;
          });
        }
        if (handle !== void 0) {
          return new Promise((resolve2) => {
            notify.push(resolve2);
          });
        }
        return;
      };
      const that = this;
      this._stopWatch.reset();
      let taskHandlePool = 0;
      const sendQueue = [];
      let notify = [];
      const _report = (progress, task) => {
        if (typeof this._firstProgress === "undefined" && (progress.kind === "markdownContent" || progress.kind === "markdownVuln" || progress.kind === "beginToolInvocation")) {
          this._firstProgress = this._stopWatch.elapsed();
        }
        if (task) {
          const myHandle = taskHandlePool++;
          const progressReporterPromise = send(progress, myHandle);
          const progressReporter = {
            report: (p) => {
              progressReporterPromise.then(() => {
                if (MarkdownString2.isMarkdownString(p.value)) {
                  send(ChatResponseWarningPart2.from(p), myHandle);
                } else {
                  send(ChatResponseReferencePart2.from(p), myHandle);
                }
              });
            }
          };
          Promise.all([progressReporterPromise, task(progressReporter)]).then(([_void, res]) => {
            send(ChatTaskResult.from(res), myHandle);
          });
        } else {
          send(progress);
        }
      };
      this._apiObject = Object.freeze({
        clearToPreviousToolInvocation(reason) {
          throwIfDone(this.markdown);
          send({ kind: "clearToPreviousToolInvocation", reason });
          return this;
        },
        markdown(value) {
          throwIfDone(this.markdown);
          const part = new ChatResponseMarkdownPart(value);
          const dto = ChatResponseMarkdownPart2.from(part);
          _report(dto);
          return this;
        },
        markdownWithVulnerabilities(value, vulnerabilities) {
          throwIfDone(this.markdown);
          if (vulnerabilities) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          const part = new ChatResponseMarkdownWithVulnerabilitiesPart(value, vulnerabilities);
          const dto = ChatResponseMarkdownWithVulnerabilitiesPart2.from(part);
          _report(dto);
          return this;
        },
        codeblockUri(value, isEdit) {
          throwIfDone(this.codeblockUri);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseCodeblockUriPart(value, isEdit);
          const dto = ChatResponseCodeblockUriPart2.from(part);
          _report(dto);
          return this;
        },
        filetree(value, baseUri) {
          throwIfDone(this.filetree);
          const part = new ChatResponseFileTreePart(value, baseUri);
          const dto = ChatResponseFilesPart.from(part);
          _report(dto);
          return this;
        },
        anchor(value, title) {
          const part = new ChatResponseAnchorPart(value, title);
          return this.push(part);
        },
        button(value) {
          throwIfDone(this.anchor);
          const part = new ChatResponseCommandButtonPart(value);
          const dto = ChatResponseCommandButtonPart2.from(part, that._commandsConverter, that._sessionDisposables);
          _report(dto);
          return this;
        },
        progress(value, task) {
          throwIfDone(this.progress);
          const part = new ChatResponseProgressPart2(value, task);
          const dto = task ? ChatTask.from(part) : ChatResponseProgressPart3.from(part);
          _report(dto, task);
          return this;
        },
        thinkingProgress(thinkingDelta) {
          throwIfDone(this.thinkingProgress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseThinkingProgressPart(thinkingDelta.text ?? "", thinkingDelta.id, thinkingDelta.metadata);
          const dto = ChatResponseThinkingProgressPart2.from(part);
          _report(dto);
          return this;
        },
        hookProgress(hookType, stopReason, systemMessage) {
          throwIfDone(this.hookProgress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseHookPart(hookType, stopReason, systemMessage);
          const dto = ChatResponseHookPart2.from(part);
          _report(dto);
          return this;
        },
        voiceProgress(id2, value) {
          throwIfDone(this.voiceProgress);
          checkProposedApiEnabled(that._extension, "chatParticipantPrivate");
          const part = new ChatResponseVoiceProgressPart(id2, value);
          _report(ChatResponseVoiceProgressPart2.from(part));
          return this;
        },
        warning(value) {
          throwIfDone(this.progress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseWarningPart(value);
          const dto = ChatResponseWarningPart2.from(part);
          _report(dto);
          return this;
        },
        info(value) {
          throwIfDone(this.progress);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseInfoPart(value);
          const dto = ChatResponseInfoPart2.from(part);
          _report(dto);
          return this;
        },
        reference(value, iconPath) {
          return this.reference2(value, iconPath);
        },
        reference2(value, iconPath, options2) {
          throwIfDone(this.reference);
          if (typeof value === "object" && "variableName" in value) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          if (typeof value === "object" && "variableName" in value && !value.value) {
            const matchingVarData = that._request.variables.variables.find((v) => v.name === value.variableName);
            if (matchingVarData) {
              let references;
              if (matchingVarData.references?.length) {
                references = matchingVarData.references.map((r2) => ({
                  kind: "reference",
                  reference: { variableName: value.variableName, value: r2.reference }
                }));
              } else {
                const part = new ChatResponseReferencePart(value, iconPath, options2);
                const dto = ChatResponseReferencePart2.from(part);
                references = [dto];
              }
              references.forEach((r2) => _report(r2));
              return this;
            } else {
            }
          } else {
            const part = new ChatResponseReferencePart(value, iconPath, options2);
            const dto = ChatResponseReferencePart2.from(part);
            _report(dto);
          }
          return this;
        },
        codeCitation(value, license, snippet) {
          throwIfDone(this.codeCitation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseCodeCitationPart(value, license, snippet);
          const dto = ChatResponseCodeCitationPart2.from(part);
          _report(dto);
        },
        textEdit(target, edits) {
          throwIfDone(this.textEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseTextEditPart(target, edits);
          part.isDone = edits === true ? true : void 0;
          const dto = ChatResponseTextEditPart2.from(part);
          _report(dto);
          return this;
        },
        notebookEdit(target, edits) {
          throwIfDone(this.notebookEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseNotebookEditPart(target, edits);
          const dto = ChatResponseNotebookEditPart2.from(part);
          _report(dto);
          return this;
        },
        workspaceEdit(edits) {
          throwIfDone(this.workspaceEdit);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseWorkspaceEditPart(edits);
          const dto = ChatResponseWorkspaceEditPart2.from(part);
          _report(dto);
          return this;
        },
        async externalEdit(target, callback) {
          throwIfDone(this.externalEdit);
          const resources = Array.isArray(target) ? target : [target];
          const operationId = taskHandlePool++;
          const undoStopId = generateUuid();
          await send({ kind: "externalEdits", start: true, resources, undoStopId }, operationId);
          try {
            await callback();
            return undoStopId;
          } finally {
            await send({ kind: "externalEdits", start: false, resources, undoStopId }, operationId);
          }
        },
        confirmation(title, message, data2, buttons) {
          throwIfDone(this.confirmation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const part = new ChatResponseConfirmationPart(title, message, data2, buttons);
          const dto = ChatResponseConfirmationPart2.from(part);
          _report(dto);
          return this;
        },
        async questionCarousel(questions, allowSkip = true) {
          throwIfDone(this.questionCarousel);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const resolveId = generateUuid();
          const part = new ChatResponseQuestionCarouselPart(questions, allowSkip);
          const dto = ChatResponseQuestionCarouselPart2.from(part);
          dto.resolveId = resolveId;
          const deferred = new DeferredPromise();
          if (!that._pendingCarouselResolvers.has(that._request.requestId)) {
            that._pendingCarouselResolvers.set(that._request.requestId, /* @__PURE__ */ new Map());
          }
          that._pendingCarouselResolvers.get(that._request.requestId).set(resolveId, deferred);
          _report(dto);
          return raceCancellation(deferred.p, that._token);
        },
        beginToolInvocation(toolCallId, toolName, streamData) {
          throwIfDone(this.beginToolInvocation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "beginToolInvocation",
            toolCallId,
            toolName,
            streamData: streamData ? {
              partialInput: streamData.partialInput
            } : void 0,
            subagentInvocationId: streamData?.subagentInvocationId
          };
          _report(dto);
          return this;
        },
        updateToolInvocation(toolCallId, streamData) {
          throwIfDone(this.updateToolInvocation);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "updateToolInvocation",
            toolCallId,
            streamData: {
              partialInput: streamData.partialInput
            }
          };
          _report(dto);
          return this;
        },
        push(part) {
          throwIfDone(this.push);
          if (part instanceof ChatResponseTextEditPart || part instanceof ChatResponseNotebookEditPart || part instanceof ChatResponseMarkdownWithVulnerabilitiesPart || part instanceof ChatResponseWarningPart || part instanceof ChatResponseConfirmationPart || part instanceof ChatResponseQuestionCarouselPart || part instanceof ChatResponseCodeCitationPart || part instanceof ChatResponseMovePart || part instanceof ChatResponseExtensionsPart || part instanceof ChatResponseExternalEditPart || part instanceof ChatResponseThinkingProgressPart || part instanceof ChatResponsePullRequestPart || part instanceof ChatResponseAutoModeResolutionPart || part instanceof ChatResponseProgressPart2) {
            checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          }
          if (part instanceof ChatResponseReferencePart) {
            this.reference2(part.value, part.iconPath, part.options);
          } else if (part instanceof ChatResponseProgressPart2) {
            const dto = part.task ? ChatTask.from(part) : ChatResponseProgressPart3.from(part);
            _report(dto, part.task);
          } else if (part instanceof ChatResponseThinkingProgressPart) {
            const dto = ChatResponseThinkingProgressPart2.from(part);
            _report(dto);
          } else if (part instanceof ChatResponseAutoModeResolutionPart) {
            const dto = ChatResponseAutoModeResolutionPart2.from(part);
            _report(dto);
          } else if (part instanceof ChatResponseAnchorPart) {
            const dto = ChatResponseAnchorPart2.from(part);
            if (part.resolve) {
              checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
              dto.resolveId = generateUuid();
            }
            _report(dto);
            if (part.resolve) {
              const cts = new CancellationTokenSource();
              part.resolve(cts.token).then(() => {
                const resolvedDto = ChatResponseAnchorPart2.from(part);
                that._proxy.$handleAnchorResolve(that._request.requestId, dto.resolveId, resolvedDto);
              }).then(() => cts.dispose(), () => cts.dispose());
              that._sessionDisposables.add(toDisposable(() => cts.dispose(true)));
            }
          } else if (part instanceof ChatResponseExternalEditPart) {
            const p = this.externalEdit(part.uris, part.callback);
            p.then((value) => part.didGetApplied(value));
            return this;
          } else {
            const dto = ChatResponsePart.from(part, that._commandsConverter, that._sessionDisposables);
            _report(dto);
          }
          return this;
        },
        usage(usage) {
          throwIfDone(this.usage);
          checkProposedApiEnabled(that._extension, "chatParticipantAdditions");
          const dto = {
            kind: "usage",
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            outputBuffer: usage.outputBuffer,
            copilotCredits: usage.copilotCredits,
            promptTokenDetails: usage.promptTokenDetails
          };
          _report(dto);
          return this;
        }
      });
    }
    return this._apiObject;
  }
};

var ExtHostChatAgents2 = class _ExtHostChatAgents2 extends Disposable {
  constructor(mainContext, _logService, _commands, _documents, _editorsAndDocuments, _languageModels, _diagnostics, _tools, _chatSessions) {
    super();
    this._logService = _logService;
    this._commands = _commands;
    this._documents = _documents;
    this._editorsAndDocuments = _editorsAndDocuments;
    this._languageModels = _languageModels;
    this._diagnostics = _diagnostics;
    this._tools = _tools;
    this._chatSessions = _chatSessions;
    this._agents = /* @__PURE__ */ new Map();
    this._participantDetectionProviders = /* @__PURE__ */ new Map();
    this._promptFileProviders = /* @__PURE__ */ new Map();
    this._customizationProviders = /* @__PURE__ */ new Map();
    this._sessionDisposables = this._register(new DisposableResourceMap());
    this._completionDisposables = this._register(new DisposableMap());
    this._inFlightRequests = /* @__PURE__ */ new Set();
    // Map of requestId -> resolveId -> deferred promise for question carousel answers
    this._pendingCarouselResolvers = /* @__PURE__ */ new Map();
    this._onDidChangeChatRequestTools = this._register(new Emitter());
    this.onDidChangeChatRequestTools = this._onDidChangeChatRequestTools.event;
    this._onDidDisposeChatSession = this._register(new Emitter());
    this.onDidDisposeChatSession = this._onDidDisposeChatSession.event;
    this._onDidChangeCustomAgents = this._register(new Emitter());
    this.onDidChangeCustomAgents = this._onDidChangeCustomAgents.event;
    this._onDidChangeInstructions = this._register(new Emitter());
    this.onDidChangeInstructions = this._onDidChangeInstructions.event;
    this._onDidChangeSkills = this._register(new Emitter());
    this.onDidChangeSkills = this._onDidChangeSkills.event;
    this._onDidChangeSlashCommands = this._register(new Emitter());
    this.onDidChangeSlashCommands = this._onDidChangeSlashCommands.event;
    this._onDidChangeHooks = this._register(new Emitter());
    this.onDidChangeHooks = this._onDidChangeHooks.event;
    this._onDidChangePlugins = this._register(new Emitter());
    this.onDidChangePlugins = this._onDidChangePlugins.event;
    this._customAgents = new CachedPromise(() => this._proxy.$provideCustomAgents(CancellationToken.None).then((agents) => agents.map((agent) => this.toCustomAgent(agent))));
    this._instructions = new CachedPromise(() => this._proxy.$provideInstructions(CancellationToken.None).then((instructions) => instructions.map((instruction) => this.toInstruction(instruction))));
    this._skills = new CachedPromise(() => this._proxy.$provideSkills(CancellationToken.None).then((skills) => skills.map((skill) => this.toSkill(skill))));
    this._slashCommands = new CachedPromise(() => this._proxy.$provideSlashCommands(CancellationToken.None).then((slashCommands) => slashCommands.map((slashCommand) => this.toSlashCommand(slashCommand))));
    this._hooks = new CachedPromise(() => this._proxy.$provideHooks(CancellationToken.None).then((hooks) => hooks.map((hook) => this.toHook(hook))));
    this._plugins = new CachedPromise(() => this._proxy.$providePlugins(CancellationToken.None).then((plugins) => plugins.map((plugin) => this.toPlugin(plugin))));
    this._onDidChangeActiveChatPanelSessionResource = this._register(new Emitter());
    this.onDidChangeActiveChatPanelSessionResource = this._onDidChangeActiveChatPanelSessionResource.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatAgents2);
    _commands.registerArgumentProcessor({
      processArgument: (arg) => {
        if (isChatViewTitleActionContext(arg)) {
          return null;
        }
        return arg;
      }
    });
  }
  static {
    this._idPool = 0;
  }
  static {
    this._participantDetectionProviderIdPool = 0;
  }
  static {
    this._contributionsProviderIdPool = 0;
  }
  static {
    this._customizationProviderIdPool = 0;
  }
  get activeChatPanelSessionResource() {
    return this._activeChatPanelSessionResource;
  }
  toCustomAgent(dto) {
    return Object.freeze({
      uri: URI.revive(dto.uri),
      name: dto.name,
      description: dto.description,
      source: dto.source,
      extensionId: dto.extensionId,
      pluginUri: dto.pluginUri ? URI.revive(dto.pluginUri) : void 0,
      sessionTypes: dto.sessionTypes,
      argumentHint: dto.argumentHint,
      tools: dto.tools,
      model: dto.model,
      userInvocable: dto.userInvocable,
      disableModelInvocation: dto.disableModelInvocation,
      enabled: dto.enabled
    });
  }
  toInstruction(dto) {
    return Object.freeze({
      uri: URI.revive(dto.uri),
      name: dto.name,
      description: dto.description,
      source: dto.source,
      extensionId: dto.extensionId,
      pluginUri: dto.pluginUri ? URI.revive(dto.pluginUri) : void 0,
      sessionTypes: dto.sessionTypes,
      pattern: dto.pattern
    });
  }
  toSkill(dto) {
    return Object.freeze({
      uri: URI.revive(dto.uri),
      name: dto.name,
      description: dto.description,
      source: dto.source,
      extensionId: dto.extensionId,
      pluginUri: dto.pluginUri ? URI.revive(dto.pluginUri) : void 0,
      sessionTypes: dto.sessionTypes,
      userInvocable: dto.userInvocable,
      disableModelInvocation: dto.disableModelInvocation
    });
  }
  toSlashCommand(dto) {
    return Object.freeze({
      uri: URI.revive(dto.uri),
      name: dto.name,
      description: dto.description,
      source: dto.source,
      extensionId: dto.extensionId,
      pluginUri: dto.pluginUri ? URI.revive(dto.pluginUri) : void 0,
      sessionTypes: dto.sessionTypes,
      argumentHint: dto.argumentHint,
      userInvocable: dto.userInvocable
    });
  }
  toHook(dto) {
    return Object.freeze({
      uri: URI.revive(dto.uri),
      sessionTypes: dto.sessionTypes,
      source: dto.source,
      extensionId: dto.extensionId,
      pluginUri: dto.pluginUri ? URI.revive(dto.pluginUri) : void 0
    });
  }
  toPlugin(dto) {
    return Object.freeze({ uri: URI.revive(dto.uri) });
  }
  provideCustomAgents(token) {
    return this._customAgents.get(token);
  }
  provideInstructions(token) {
    return this._instructions.get(token);
  }
  provideSkills(token) {
    return this._skills.get(token);
  }
  provideSlashCommands(token) {
    return this._slashCommands.get(token);
  }
  provideHooks(token) {
    return this._hooks.get(token);
  }
  providePlugins(token) {
    return this._plugins.get(token);
  }
  $onDidChangeCustomAgents() {
    this._customAgents.clear();
    this._onDidChangeCustomAgents.fire();
  }
  $onDidChangeInstructions() {
    this._instructions.clear();
    this._onDidChangeInstructions.fire();
  }
  $onDidChangeSkills() {
    this._skills.clear();
    this._onDidChangeSkills.fire();
  }
  $onDidChangeSlashCommands() {
    this._slashCommands.clear();
    this._onDidChangeSlashCommands.fire();
  }
  $onDidChangeHooks() {
    this._hooks.clear();
    this._onDidChangeHooks.fire();
  }
  $onDidChangePlugins() {
    this._plugins.clear();
    this._onDidChangePlugins.fire();
  }
  async transferActiveChat(newWorkspace) {
    await this._proxy.$transferActiveChatSession(newWorkspace);
  }
  createChatAgent(extension, id2, handler) {
    const handle = _ExtHostChatAgents2._idPool++;
    const agent = new ExtHostChatAgent(extension, id2, this._proxy, handle, handler);
    this._agents.set(handle, agent);
    this._proxy.$registerAgent(handle, extension.identifier, id2, {}, void 0);
    return agent.apiAgent;
  }
  createDynamicChatAgent(extension, id2, dynamicProps, handler) {
    const handle = _ExtHostChatAgents2._idPool++;
    const agent = new ExtHostChatAgent(extension, id2, this._proxy, handle, handler);
    this._agents.set(handle, agent);
    this._proxy.$registerAgent(handle, extension.identifier, id2, { isSticky: true }, dynamicProps);
    return agent.apiAgent;
  }
  registerChatParticipantDetectionProvider(extension, provider) {
    const handle = _ExtHostChatAgents2._participantDetectionProviderIdPool++;
    this._participantDetectionProviders.set(handle, new ExtHostParticipantDetector(extension, provider));
    this._proxy.$registerChatParticipantDetectionProvider(handle);
    return toDisposable(() => {
      this._participantDetectionProviders.delete(handle);
      this._proxy.$unregisterChatParticipantDetectionProvider(handle);
    });
  }
  /**
   * Internal method that handles all prompt file provider types.
   * Routes custom agents, instructions, prompt files, and skills to the unified internal implementation.
   */
  registerPromptFileProvider(extension, type, provider) {
    const handle = _ExtHostChatAgents2._contributionsProviderIdPool++;
    this._promptFileProviders.set(handle, { extension, provider });
    this._proxy.$registerPromptFileProvider(handle, type, extension.identifier);
    const disposables = new DisposableStore();
    let changeEvent;
    switch (type) {
      case "agent" /* agent */:
        changeEvent = provider.onDidChangeCustomAgents;
        break;
      case "instructions" /* instructions */:
        changeEvent = provider.onDidChangeInstructions;
        break;
      case "prompt" /* prompt */:
        changeEvent = provider.onDidChangePromptFiles;
        break;
      case "skill" /* skill */:
        changeEvent = provider.onDidChangeSkills;
        break;
      case "hook" /* hook */:
        changeEvent = provider.onDidChangeHooks;
        break;
    }
    if (changeEvent) {
      disposables.add(changeEvent(() => {
        this._proxy.$onDidChangePromptFiles(handle);
      }));
    }
    disposables.add(toDisposable(() => {
      this._promptFileProviders.delete(handle);
      this._proxy.$unregisterPromptFileProvider(handle);
    }));
    return disposables;
  }
  async $providePromptFiles(handle, type, context, token) {
    const providerData = this._promptFileProviders.get(handle);
    if (!providerData) {
      return void 0;
    }
    const provider = providerData.provider;
    let resources;
    switch (type) {
      case "agent" /* agent */:
        resources = await provider.provideCustomAgents(context, token) ?? void 0;
        break;
      case "instructions" /* instructions */:
        resources = await provider.provideInstructions(context, token) ?? void 0;
        break;
      case "prompt" /* prompt */:
        resources = await provider.providePromptFiles(context, token) ?? void 0;
        break;
      case "skill" /* skill */:
        resources = await provider.provideSkills(context, token) ?? void 0;
        break;
      case "hook" /* hook */:
        resources = await provider.provideHooks(context, token) ?? void 0;
        break;
    }
    return resources;
  }
  registerChatSessionCustomizationProvider(extension, chatSessionType, metadata, provider) {
    const handle = _ExtHostChatAgents2._customizationProviderIdPool++;
    this._customizationProviders.set(handle, { extension, provider });
    const metadataDto = {
      label: metadata.label,
      iconId: metadata.iconId,
      supportedTypes: metadata.supportedTypes?.map((t) => ChatSessionCustomizationType2.from(t))
    };
    this._proxy.$registerChatSessionCustomizationProvider(handle, chatSessionType, metadataDto, extension.identifier);
    const disposables = new DisposableStore();
    if (provider.onDidChange) {
      disposables.add(provider.onDidChange(() => {
        this._proxy.$onDidChangeCustomizations(handle);
      }));
    }
    disposables.add(toDisposable(() => {
      this._customizationProviders.delete(handle);
      this._proxy.$unregisterChatSessionCustomizationProvider(handle);
    }));
    return disposables;
  }
  async $provideChatSessionCustomizations(handle, sessionResource, token) {
    const providerData = this._customizationProviders.get(handle);
    if (!providerData) {
      return void 0;
    }
    if (!sessionResource) {
      return void 0;
    }
    try {
      const items = await providerData.provider.provideChatSessionCustomizations(URI.revive(sessionResource), token);
      if (!items) {
        return void 0;
      }
      return items.map((item) => ({
        uri: item.uri,
        type: ChatSessionCustomizationType2.from(item.type),
        name: item.name,
        description: item.description,
        source: item.source,
        groupKey: item.groupKey,
        badge: item.badge,
        badgeTooltip: item.badgeTooltip,
        extensionId: item.extensionId,
        pluginUri: item.pluginUri,
        pluginLabel: item.pluginLabel,
        userInvocable: item.userInvocable
      }));
    } catch (err) {
      return void 0;
    }
  }
  async $provideSourceFolders(handle, sessionResource, type, token) {
    const providerData = this._customizationProviders.get(handle);
    if (!providerData?.provider.provideSourceFolders) {
      return void 0;
    }
    try {
      const folders = await providerData.provider.provideSourceFolders(URI.revive(sessionResource), ChatSessionCustomizationType2.to(type), token);
      if (!folders) {
        return void 0;
      }
      return folders.map((folder) => ({
        uri: folder.uri,
        label: folder.label,
        source: folder.source
      }));
    } catch (err) {
      return void 0;
    }
  }
  async $detectChatParticipant(handle, requestDto, context, options2, token) {
    const detector = this._participantDetectionProviders.get(handle);
    if (!detector) {
      return void 0;
    }
    const { request, location: location2, history } = await this._createRequest(requestDto, context, detector.extension);
    const model = await this.getModelForRequest(request, detector.extension);
    const tools = await this.getToolsForRequest(detector.extension, request.userSelectedTools, model.id, token);
    const extRequest = ChatAgentRequest.to(
      request,
      location2,
      model,
      request.modelConfiguration,
      this.getDiagnosticsWhenEnabled(detector.extension),
      tools,
      detector.extension,
      this._logService
    );
    return detector.provider.provideParticipantDetection(
      extRequest,
      { history, yieldRequested: false },
      { participants: options2.participants, location: ChatLocation2.to(options2.location) },
      token
    );
  }
  async _createRequest(requestDto, context, extension) {
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(extension, request.agentId, context);
    let location2;
    if (request.locationData?.type === "editor" /* EditorInline */) {
      const document2 = this._documents.getDocument(request.locationData.document);
      const editor = this._editorsAndDocuments.getEditor(request.locationData.id);
      location2 = new ChatRequestEditorData(editor.value, document2, Selection2.to(request.locationData.selection), Range3.to(request.locationData.wholeRange));
    } else if (request.locationData?.type === "notebook" /* Notebook */) {
      const cell = this._documents.getDocument(request.locationData.sessionInputUri);
      location2 = new ChatRequestNotebookData(cell);
    } else if (request.locationData?.type === "terminal" /* Terminal */) {
    }
    return { request, location: location2, history: convertedHistory };
  }
  async getModelForRequest(request, extension) {
    let model;
    if (request.userSelectedModelId) {
      model = await this._languageModels.getLanguageModelByIdentifier(extension, request.userSelectedModelId);
    }
    if (!model) {
      model = await this._languageModels.getDefaultLanguageModel(extension);
      if (!model) {
        throw new Error("Language model unavailable");
      }
    }
    return model;
  }
  async $setRequestTools(requestId, tools) {
    const request = [...this._inFlightRequests].find((r2) => r2.requestId === requestId);
    if (!request) {
      return;
    }
    request.extRequest.tools.clear();
    const toolsMap = await this.getToolsForRequest(request.extension, tools, request.extRequest.model.id, CancellationToken.None);
    for (const [k, v] of toolsMap) {
      request.extRequest.tools.set(k, v);
    }
    this._onDidChangeChatRequestTools.fire(request.extRequest);
  }
  $setYieldRequested(requestId, value) {
    const request = [...this._inFlightRequests].find((r2) => r2.requestId === requestId);
    if (request) {
      request.yieldRequested = value;
    }
  }
  async $invokeAgent(handle, requestDto, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      throw new Error(`[CHAT](${handle}) CANNOT invoke agent because the agent is not registered`);
    }
    let stream;
    let inFlightRequest;
    try {
      const { request, location: location2, history } = await this._createRequest(requestDto, context, agent.extension);
      let sessionDisposables = this._sessionDisposables.get(request.sessionResource);
      if (!sessionDisposables) {
        sessionDisposables = new DisposableStore();
        this._sessionDisposables.set(request.sessionResource, sessionDisposables);
      }
      stream = new ChatAgentResponseStream(agent.extension, request, this._proxy, this._commands.converter, sessionDisposables, this._pendingCarouselResolvers, token);
      const model = await this.getModelForRequest(request, agent.extension);
      const tools = await this.getToolsForRequest(agent.extension, request.userSelectedTools, model.id, token);
      const extRequest = ChatAgentRequest.to(
        request,
        location2,
        model,
        request.modelConfiguration,
        this.getDiagnosticsWhenEnabled(agent.extension),
        tools,
        agent.extension,
        this._logService
      );
      inFlightRequest = { requestId: requestDto.requestId, extRequest, extension: agent.extension, hooks: request.hooks, yieldRequested: false };
      this._inFlightRequests.add(inFlightRequest);
      let chatSessionContext;
      if (context.chatSessionContext) {
        const sessionResource = URI.revive(context.chatSessionContext.chatSessionResource);
        const inputState = await this._chatSessions.getInputStateForSession(
          sessionResource,
          context.chatSessionContext.initialSessionOptions,
          token
        );
        chatSessionContext = {
          chatSessionItem: {
            resource: sessionResource,
            label: context.chatSessionContext.isUntitled ? "Untitled Session" : "Session"
          },
          isUntitled: context.chatSessionContext.isUntitled,
          initialSessionOptions: context.chatSessionContext.initialSessionOptions,
          inputState
        };
      }
      const chatContext = {
        history,
        chatSessionContext,
        get yieldRequested() {
          return inFlightRequest?.yieldRequested ?? false;
        }
      };
      const task = agent.invoke(
        extRequest,
        chatContext,
        stream.apiObject,
        token
      );
      return await raceCancellationWithTimeout(1e3, Promise.resolve(task).then((result) => {
        if (result?.metadata) {
          try {
            JSON.stringify(result.metadata);
          } catch (err) {
            const msg = `result.metadata MUST be JSON.stringify-able. Got error: ${err.message}`;
            this._logService.error(`[${agent.extension.identifier.value}] [@${agent.id}] ${msg}`, agent.extension);
            return { errorDetails: { message: msg }, timings: stream?.timings, nextQuestion: result.nextQuestion };
          }
        }
        let errorDetails;
        if (result?.errorDetails) {
          errorDetails = {
            ...result.errorDetails,
            responseIsIncomplete: true
          };
        }
        if (errorDetails?.responseIsRedacted || errorDetails?.isQuotaExceeded || errorDetails?.isRateLimited || errorDetails?.isExpectedError || errorDetails?.confirmationButtons || errorDetails?.code) {
          checkProposedApiEnabled(agent.extension, "chatParticipantPrivate");
        }
        return { errorDetails, timings: stream?.timings, metadata: result?.metadata, nextQuestion: result?.nextQuestion, details: result?.details };
      }), token);
    } catch (e) {
      this._logService.error(e, agent.extension);
      if (e instanceof LanguageModelError && e.cause) {
        e = e.cause;
      }
      const isQuotaExceeded = e instanceof Error && e.name === "ChatQuotaExceeded";
      const isRateLimited = e instanceof Error && e.name === "ChatRateLimited";
      const isExpectedError = e instanceof Error && e.name === "ChatExpectedError";
      const { callstack: errorCallstack } = packErrorForTelemetry(e);
      const errorName = e instanceof Error ? e.name : void 0;
      return { errorDetails: { message: toErrorMessage(e), responseIsIncomplete: true, isQuotaExceeded, isRateLimited, isExpectedError }, errorCallstack, errorName };
    } finally {
      if (inFlightRequest) {
        this._inFlightRequests.delete(inFlightRequest);
      }
      const pendingResolvers = this._pendingCarouselResolvers.get(requestDto.requestId);
      if (pendingResolvers) {
        for (const deferred of pendingResolvers.values()) {
          deferred.complete(void 0);
        }
        this._pendingCarouselResolvers.delete(requestDto.requestId);
      }
      stream?.close();
    }
  }
  getDiagnosticsWhenEnabled(extension) {
    if (!isProposedApiEnabled(extension, "chatReferenceDiagnostic")) {
      return [];
    }
    return this._diagnostics.getDiagnostics();
  }
  async getToolsForRequest(extension, tools, modelId, token) {
    if (!tools) {
      return /* @__PURE__ */ new Map();
    }
    const result = /* @__PURE__ */ new Map();
    for (const tool of this._tools.getTools(extension)) {
      if (typeof tools[tool.name] === "boolean") {
        result.set(tool, tools[tool.name]);
      }
    }
    return result;
  }
  async prepareHistoryTurns(extension, agentId, context) {
    const res = [];
    for (const h of context.history) {
      const ehResult = ChatAgentResult.to(h.result);
      const result = agentId === h.request.agentId || isBuiltinParticipant(h.request.agentId) && isBuiltinParticipant(agentId) ? ehResult : { ...ehResult, metadata: void 0 };
      const varsWithoutTools = [];
      const toolReferences = [];
      for (const v of h.request.variables.variables) {
        if (v.kind === "tool") {
          toolReferences.push(ChatLanguageModelToolReference.to(v));
        } else if (v.kind === "toolset") {
          toolReferences.push(...v.value.map(ChatLanguageModelToolReference.to));
        } else {
          varsWithoutTools.push(...ChatPromptReference.toReferences(v, this.getDiagnosticsWhenEnabled(extension), this._logService));
        }
      }
      const editedFileEvents = isProposedApiEnabled(extension, "chatParticipantPrivate") ? h.request.editedFileEvents : void 0;
      const modeInstructions2 = isProposedApiEnabled(extension, "chatParticipantPrivate") && h.request.modeInstructions ? ChatRequestModeInstructions.to(h.request.modeInstructions) : void 0;
      const turn = new ChatRequestTurn(h.request.message, h.request.command, varsWithoutTools, h.request.agentId, toolReferences, editedFileEvents, h.request.requestId, void 0, modeInstructions2, h.request.openCodeBranchIntent);
      res.push(turn);
      const parts = coalesce(h.response.map((r2) => ChatResponsePart.toContent(r2, this._commands.converter)));
      res.push(new ChatResponseTurn(parts, result, h.request.agentId, h.request.command));
    }
    return res;
  }
  $releaseSession(sessionResourceDto) {
    const sessionResource = URI.revive(sessionResourceDto);
    this._sessionDisposables.deleteAndDispose(sessionResource);
    const sessionId = LocalChatSessionUri.parseLocalSessionId(sessionResource);
    if (sessionId) {
      this._onDidDisposeChatSession.fire(sessionId);
    }
  }
  $acceptActiveChatSession(sessionResourceDto) {
    const sessionResource = sessionResourceDto ? URI.revive(sessionResourceDto) : void 0;
    if (this._activeChatPanelSessionResource?.toString() === sessionResource?.toString()) {
      return;
    }
    this._activeChatPanelSessionResource = sessionResource;
    this._onDidChangeActiveChatPanelSessionResource.fire(sessionResource);
  }
  async $provideFollowups(requestDto, handle, result, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return Promise.resolve([]);
    }
    const request = revive(requestDto);
    const convertedHistory = await this.prepareHistoryTurns(agent.extension, agent.id, context);
    const ehResult = ChatAgentResult.to(result);
    return (await agent.provideFollowups(ehResult, { history: convertedHistory, yieldRequested: false }, token)).filter((f) => {
      const isValid = !f.participant || Iterable.some(
        this._agents.values(),
        (a) => a.id === f.participant && ExtensionIdentifier.equals(a.extension.identifier, agent.extension.identifier)
      );
      if (!isValid) {
        this._logService.warn(`[@${agent.id}] ChatFollowup refers to an unknown participant: ${f.participant}`);
      }
      return isValid;
    }).map((f) => ChatFollowup.from(f, request));
  }
  $acceptFeedback(handle, result, voteAction) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const ehResult = ChatAgentResult.to(result);
    let kind;
    switch (voteAction.direction) {
      case 0 /* Down */:
        kind = 0 /* Unhelpful */;
        break;
      case 1 /* Up */:
        kind = 1 /* Helpful */;
        break;
    }
    const feedback = {
      result: ehResult,
      kind
    };
    agent.acceptFeedback(Object.freeze(feedback));
  }
  $handleQuestionCarouselAnswer(requestId, resolveId, answers) {
    const requestResolvers = this._pendingCarouselResolvers.get(requestId);
    if (!requestResolvers) {
      return;
    }
    const deferred = requestResolvers.get(resolveId);
    if (deferred) {
      deferred.complete(answers);
      requestResolvers.delete(resolveId);
    }
    if (requestResolvers.size === 0) {
      this._pendingCarouselResolvers.delete(requestId);
    }
  }
  $acceptAction(handle, result, event) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    if (event.action.kind === "vote") {
      return;
    }
    const ehAction = ChatAgentUserActionEvent.to(result, event, this._commands.converter);
    if (ehAction) {
      agent.acceptAction(Object.freeze(ehAction));
    }
  }
  async $invokeCompletionProvider(handle, query, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return [];
    }
    let disposables = this._completionDisposables.get(handle);
    if (disposables) {
      disposables.clear();
    } else {
      disposables = new DisposableStore();
      this._completionDisposables.set(handle, disposables);
    }
    const items = await agent.invokeCompletionProvider(query, token);
    return items.map((i) => ChatAgentCompletionItem.from(i, this._commands.converter, disposables));
  }
  async $provideChatTitle(handle, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const history = await this.prepareHistoryTurns(agent.extension, agent.id, { history: context });
    const sessionResource = context[0]?.request.sessionResource ? URI.revive(context[0].request.sessionResource) : void 0;
    return await agent.provideTitle({ history, sessionResource, yieldRequested: false }, token);
  }
  async $provideChatSummary(handle, context, token) {
    const agent = this._agents.get(handle);
    if (!agent) {
      return;
    }
    const history = await this.prepareHistoryTurns(agent.extension, agent.id, { history: context });
    const sessionResource = context[0]?.request.sessionResource ? URI.revive(context[0].request.sessionResource) : void 0;
    return await agent.provideSummary({ history, sessionResource, yieldRequested: false }, token);
  }
};

var ExtHostParticipantDetector = class {
  constructor(extension, provider) {
    this.extension = extension;
    this.provider = provider;
  }
};

var ExtHostChatAgent = class {
  constructor(extension, id2, _proxy, _handle, _requestHandler) {
    this.extension = extension;
    this.id = id2;
    this._proxy = _proxy;
    this._handle = _handle;
    this._requestHandler = _requestHandler;
    this._onDidReceiveFeedback = new Emitter();
    this._onDidPerformAction = new Emitter();
    this._pauseStateEmitter = new Emitter();
  }
  acceptFeedback(feedback) {
    this._onDidReceiveFeedback.fire(feedback);
  }
  acceptAction(event) {
    this._onDidPerformAction.fire(event);
  }
  setChatRequestPauseState(pauseState) {
    this._pauseStateEmitter.fire(pauseState);
  }
  async invokeCompletionProvider(query, token) {
    if (!this._agentVariableProvider) {
      return [];
    }
    return await this._agentVariableProvider.provider.provideCompletionItems(query, token) ?? [];
  }
  async provideFollowups(result, context, token) {
    if (!this._followupProvider) {
      return [];
    }
    const followups = await this._followupProvider.provideFollowups(result, context, token);
    if (!followups) {
      return [];
    }
    return followups.filter((f) => !(f && "commandId" in f)).filter((f) => !(f && "message" in f));
  }
  async provideTitle(context, token) {
    if (!this._titleProvider) {
      return;
    }
    return await this._titleProvider.provideChatTitle(context, token) ?? void 0;
  }
  async provideSummary(context, token) {
    if (!this._summarizer) {
      return;
    }
    return await this._summarizer.provideChatSummary(context, token) ?? void 0;
  }
  get apiAgent() {
    let disposed = false;
    let updateScheduled = false;
    const updateMetadataSoon = () => {
      if (disposed) {
        return;
      }
      if (updateScheduled) {
        return;
      }
      updateScheduled = true;
      queueMicrotask(() => {
        this._proxy.$updateAgent(this._handle, {
          icon: !this._iconPath ? void 0 : this._iconPath instanceof URI ? this._iconPath : "light" in this._iconPath ? this._iconPath.light : void 0,
          iconDark: !this._iconPath ? void 0 : "dark" in this._iconPath ? this._iconPath.dark : void 0,
          themeIcon: this._iconPath instanceof ThemeIcon2 ? this._iconPath : void 0,
          hasFollowups: this._followupProvider !== void 0,
          helpTextPrefix: !this._helpTextPrefix || typeof this._helpTextPrefix === "string" ? this._helpTextPrefix : MarkdownString3.from(this._helpTextPrefix),
          helpTextPostfix: !this._helpTextPostfix || typeof this._helpTextPostfix === "string" ? this._helpTextPostfix : MarkdownString3.from(this._helpTextPostfix),
          supportIssueReporting: this._supportIssueReporting,
          additionalWelcomeMessage: !this._additionalWelcomeMessage || typeof this._additionalWelcomeMessage === "string" ? this._additionalWelcomeMessage : MarkdownString3.from(this._additionalWelcomeMessage)
        });
        updateScheduled = false;
      });
    };
    const that = this;
    return {
      get id() {
        return that.id;
      },
      get iconPath() {
        return that._iconPath;
      },
      set iconPath(v) {
        that._iconPath = v;
        updateMetadataSoon();
      },
      get requestHandler() {
        return that._requestHandler;
      },
      set requestHandler(v) {
        assertType(typeof v === "function", "Invalid request handler");
        that._requestHandler = v;
      },
      get followupProvider() {
        return that._followupProvider;
      },
      set followupProvider(v) {
        that._followupProvider = v;
        updateMetadataSoon();
      },
      get helpTextPrefix() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._helpTextPrefix;
      },
      set helpTextPrefix(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._helpTextPrefix = v;
        updateMetadataSoon();
      },
      get helpTextPostfix() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._helpTextPostfix;
      },
      set helpTextPostfix(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._helpTextPostfix = v;
        updateMetadataSoon();
      },
      get supportIssueReporting() {
        checkProposedApiEnabled(that.extension, "chatParticipantPrivate");
        return that._supportIssueReporting;
      },
      set supportIssueReporting(v) {
        checkProposedApiEnabled(that.extension, "chatParticipantPrivate");
        that._supportIssueReporting = v;
        updateMetadataSoon();
      },
      get onDidReceiveFeedback() {
        return that._onDidReceiveFeedback.event;
      },
      set participantVariableProvider(v) {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        that._agentVariableProvider = v;
        if (v) {
          if (!v.triggerCharacters.length) {
            throw new Error("triggerCharacters are required");
          }
          that._proxy.$registerAgentCompletionsProvider(that._handle, that.id, v.triggerCharacters);
        } else {
          that._proxy.$unregisterAgentCompletionsProvider(that._handle, that.id);
        }
      },
      get participantVariableProvider() {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        return that._agentVariableProvider;
      },
      set additionalWelcomeMessage(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._additionalWelcomeMessage = v;
        updateMetadataSoon();
      },
      get additionalWelcomeMessage() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._additionalWelcomeMessage;
      },
      set titleProvider(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._titleProvider = v;
        updateMetadataSoon();
      },
      get titleProvider() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._titleProvider;
      },
      set summarizer(v) {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        that._summarizer = v;
      },
      get summarizer() {
        checkProposedApiEnabled(that.extension, "defaultChatParticipant");
        return that._summarizer;
      },
      get onDidChangePauseState() {
        checkProposedApiEnabled(that.extension, "chatParticipantAdditions");
        return that._pauseStateEmitter.event;
      },
      onDidPerformAction: !isProposedApiEnabled(this.extension, "chatParticipantAdditions") ? void 0 : this._onDidPerformAction.event,
      dispose() {
        disposed = true;
        that._followupProvider = void 0;
        that._onDidReceiveFeedback.dispose();
        that._onDidPerformAction.dispose();
        that._pauseStateEmitter.dispose();
        that._proxy.$unregisterAgent(that._handle);
      }
    };
  }
  invoke(request, context, response, token) {
    return this._requestHandler(request, context, response, token);
  }
};

function raceCancellationWithTimeout(cancelWait, promise, token) {
  return new Promise((resolve2, reject) => {
    const ref = token.onCancellationRequested(async () => {
      ref.dispose();
      await timeout(cancelWait);
      resolve2(void 0);
    });
    promise.then(resolve2, reject).finally(() => ref.dispose());
  });
}

var CachedPromise = class {
  constructor(computeFn) {
    this.computeFn = computeFn;
  }
  get(token) {
    if (!this.cachedPromise) {
      const promise = this.computeFn().catch((err) => {
        if (this.cachedPromise === promise) {
          this.cachedPromise = void 0;
        }
        throw err;
      });
      this.cachedPromise = promise;
    }
    return raceCancellationError(this.cachedPromise, token);
  }
  clear() {
    this.cachedPromise = void 0;
  }
};

function isBuiltinParticipant(agentId) {
  return agentId.startsWith("github.copilot");
}
export { raceCancellationWithTimeout, isBuiltinParticipant, ChatAgentResponseStream, ExtHostChatAgents2, ExtHostParticipantDetector, ExtHostChatAgent, CachedPromise };
