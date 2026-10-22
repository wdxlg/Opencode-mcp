// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatSessions.ts
import { MarkdownString, markdownStringEqual } from "./module-0462.mjs";
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { ChatSessionOptionsMap, IChatSessionsService } from "./module-0961.mjs";
import { revive } from "./module-0265.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { getInProgressSessionDescription } from "./module-1464.mjs";
import { getSessionStatusForModel } from "./module-1477.mjs";
import { hasValidDiff } from "./module-1462.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { equals4 } from "./module-0098.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { ChatEditorInput } from "./module-1112.mjs";
import { IChatWidgetService, isIChatViewViewContext } from "./module-0982.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IChatTodoListService } from "./module-1480.mjs";
import { IChatArtifactsService } from "./module-1479.mjs";
import { IChatDebugService } from "./module-1455.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/api/browser/mainThreadChatSessions.ts
function stringOrMarkdownEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (typeof a === "string" || typeof b === "string") {
    return false;
  }
  return markdownStringEqual(a, b);
}

var ObservableChatSession = class extends Disposable {
  constructor(resource, providerHandle, proxy, logService, dialogService) {
    super();
    this._progressObservable = observableValue(this, []);
    this._isCompleteObservable = observableValue(this, false);
    this._onWillDispose = new Emitter();
    this.onWillDispose = this._onWillDispose.event;
    this._pendingProgressChunks = /* @__PURE__ */ new Map();
    this._isInitialized = false;
    this._interruptionWasCanceled = false;
    this._disposalPending = false;
    /**
     * Number of currently in-flight `requestHandler` invocations. Used to
     * defer `$disposeChatSessionContent` when the workbench wants to release
     * this session while a request is mid-flight on a `requestHandler`-style
     * session (e.g. Copilot CLI). Without this guard, the proxy dispose
     * synchronously cancels the ext-host `disposeCts` and tears down the
     * underlying SDK session (which calls `sdkSession.abort()`), so the
     * in-flight request is lost. The `activeResponseCallback`-style sessions
     * have their own deferral via {@link interruptActiveResponseCallback};
     * this counter is the equivalent for `requestHandler`-style sessions.
     */
    this._inFlightRequestCount = 0;
    this.sessionResource = resource;
    this.providerHandle = providerHandle;
    this.history = [];
    this._proxy = proxy;
    this._providerHandle = providerHandle;
    this._logService = logService;
    this._dialogService = dialogService;
  }
  get options() {
    return this._options ? new Map(this._options) : void 0;
  }
  get progressObs() {
    return this._progressObservable;
  }
  get isCompleteObs() {
    return this._isCompleteObservable;
  }
  initialize(token, context2) {
    if (!this._initializationPromise) {
      this._initializationPromise = this._doInitializeContent(token, context2);
    }
    return this._initializationPromise;
  }
  async _doInitializeContent(token, context2) {
    try {
      const sessionContent = await raceCancellationError(
        this._proxy.$provideChatSessionContent(this._providerHandle, this.sessionResource, context2, token),
        token
      );
      this._options = sessionContent.options ? ChatSessionOptionsMap.fromRecord(sessionContent.options) : void 0;
      this.title = sessionContent.title;
      this.history.length = 0;
      this.history.push(...sessionContent.history.map((turn) => {
        if (turn.type === "request") {
          const variables = turn.variableData?.variables.map((v2) => {
            const entry = {
              ...v2,
              value: revive(v2.value)
            };
            return entry;
          });
          return {
            type: "request",
            prompt: turn.prompt,
            participant: turn.participant,
            command: turn.command,
            variableData: variables ? { variables } : void 0,
            id: turn.id,
            modelId: turn.modelId,
            modeInstructions: turn.modeInstructions ? revive(turn.modeInstructions) : void 0
          };
        }
        return {
          type: "response",
          parts: turn.parts.map((part) => revive(part)),
          participant: turn.participant,
          details: turn.details
        };
      }));
      if (sessionContent.hasActiveResponseCallback && !this.interruptActiveResponseCallback) {
        this.interruptActiveResponseCallback = async () => {
          const confirmInterrupt = () => {
            if (this._disposalPending) {
              this._proxy.$disposeChatSessionContent(this._providerHandle, this.sessionResource);
              this._disposalPending = false;
            }
            this._proxy.$interruptChatSessionActiveResponse(this._providerHandle, this.sessionResource, "ongoing");
            return true;
          };
          if (sessionContent.supportsInterruption) {
            return confirmInterrupt();
          }
          return this._dialogService.confirm({
            message: localize(5671, null)
          }).then((confirmed) => {
            if (confirmed.confirmed) {
              return confirmInterrupt();
            } else {
              this._addProgress([{
                kind: "progressMessage",
                content: { value: "", isTrusted: false }
              }]);
              this._interruptionWasCanceled = true;
              if (this._disposalPending) {
                this._logService.info(`Canceling deferred disposal for session ${this.sessionResource} (user canceled interruption)`);
                this._disposalPending = false;
              }
              return false;
            }
          });
        };
      }
      if (sessionContent.hasRequestHandler && !this.requestHandler) {
        this.requestHandler = async (request2, progress, history, token2) => {
          this._inFlightRequestCount++;
          this._progressObservable.set([], void 0);
          this._isCompleteObservable.set(false, void 0);
          let lastProgressLength = 0;
          const progressDisposable = autorun((reader) => {
            const progressArray = this._progressObservable.read(reader);
            const isComplete = this._isCompleteObservable.read(reader);
            if (progressArray.length > lastProgressLength) {
              const newProgress = progressArray.slice(lastProgressLength);
              progress(newProgress);
              lastProgressLength = progressArray.length;
            }
            if (isComplete) {
              progressDisposable.dispose();
            }
          });
          try {
            await this._proxy.$invokeChatSessionRequestHandler(this._providerHandle, this.sessionResource, request2, history, token2);
            if (!this._isCompleteObservable.get() && !this.interruptActiveResponseCallback) {
              this._markComplete();
            }
          } catch (error) {
            const errorProgress = {
              kind: "progressMessage",
              content: { value: `Error: ${error instanceof Error ? error.message : String(error)}`, isTrusted: false }
            };
            this._addProgress([errorProgress]);
            this._markComplete();
            throw error;
          } finally {
            progressDisposable.dispose();
            this._inFlightRequestCount--;
            if (this._disposalPending && this._inFlightRequestCount === 0 && !this.interruptActiveResponseCallback) {
              this._disposalPending = false;
              this._proxy.$disposeChatSessionContent(this._providerHandle, this.sessionResource);
            }
          }
        };
      }
      if (sessionContent.hasForkHandler && !this.forkSession) {
        this.forkSession = async (request2, token2) => {
          const result = await this._proxy.$forkChatSession(this._providerHandle, this.sessionResource, request2 ? this.toRequestDto(request2) : void 0, token2);
          return revive(result);
        };
      }
      this._isInitialized = true;
      const hasActiveResponse = sessionContent.hasActiveResponseCallback;
      const hasRequestHandler = sessionContent.hasRequestHandler;
      const hasAnyCapability = hasActiveResponse || hasRequestHandler;
      for (const [requestId, chunks] of this._pendingProgressChunks) {
        this._logService.debug(`Processing ${chunks.length} pending progress chunks for session ${this.sessionResource}, requestId ${requestId}`);
        this._addProgress(chunks);
      }
      this._pendingProgressChunks.clear();
      if (!hasAnyCapability) {
        this._isCompleteObservable.set(true, void 0);
      }
    } catch (error) {
      this._logService.error(`Failed to initialize chat session ${this.sessionResource}:`, error);
      throw error;
    }
  }
  /**
   * Handle progress chunks coming from the extension host.
   * If the session is not initialized yet, the chunks will be queued.
   */
  handleProgressChunk(requestId, progress) {
    if (!this._isInitialized) {
      const existing = this._pendingProgressChunks.get(requestId) || [];
      this._pendingProgressChunks.set(requestId, [...existing, ...progress]);
      this._logService.debug(`Queuing ${progress.length} progress chunks for session ${this.sessionResource}, requestId ${requestId} (session not initialized)`);
      return;
    }
    this._addProgress(progress);
  }
  /**
   * Handle progress completion from the extension host.
   */
  handleProgressComplete(requestId) {
    this._pendingProgressChunks.delete(requestId);
    if (this._isInitialized) {
      if (!this._interruptionWasCanceled) {
        this._markComplete();
      } else {
        this._interruptionWasCanceled = false;
      }
    }
  }
  _addProgress(progress) {
    const currentProgress = this._progressObservable.get();
    this._progressObservable.set([...currentProgress, ...progress], void 0);
  }
  _markComplete() {
    if (!this._isCompleteObservable.get()) {
      this._isCompleteObservable.set(true, void 0);
    }
  }
  toRequestDto(request2) {
    return {
      type: "request",
      id: request2.id,
      prompt: request2.prompt,
      participant: request2.participant,
      command: request2.command,
      variableData: void 0,
      modelId: request2.modelId,
      modeInstructions: request2.modeInstructions
    };
  }
  dispose() {
    this._onWillDispose.fire();
    this._onWillDispose.dispose();
    this._pendingProgressChunks.clear();
    if (this.interruptActiveResponseCallback && !this._interruptionWasCanceled) {
      this._disposalPending = true;
    } else if (this._inFlightRequestCount > 0) {
      this._disposalPending = true;
    } else {
      this._proxy.$disposeChatSessionContent(this._providerHandle, this.sessionResource);
    }
    super.dispose();
  }
};

var MainThreadChatSessionItemController = class extends Disposable {
  constructor(proxy, chatSessionType, handle2, supportsResolve, _chatService) {
    super();
    this._chatService = _chatService;
    this._onDidChangeChatSessionItems = this._register(new Emitter());
    this.onDidChangeChatSessionItems = this._onDidChangeChatSessionItems.event;
    this._modelListeners = this._register(new DisposableResourceMap());
    this._resolveCache = new ResourceMap();
    this._resolving = new ResourceMap();
    this._isDisposed = false;
    this._items = new ResourceMap();
    this._proxy = proxy;
    this._handle = handle2;
    this._supportsResolve = supportsResolve;
    const addModelListeners = async (model) => {
      if (getChatSessionType(model.sessionResource) !== chatSessionType) {
        return;
      }
      await this.refresh(CancellationToken.None);
      if (this._isDisposed) {
        return;
      }
      this.tryUpdateItemForModel(model);
      const requestChangeListener = model.lastRequestObs.map((last) => last?.response && observableSignalFromEvent("chatSessions.modelRequestChangeListener", last.response.onDidChange));
      const modelChangeListener = observableSignalFromEvent("chatSessions.modelChangeListener", model.onDidChange);
      this._modelListeners.set(model.sessionResource, autorun((reader) => {
        requestChangeListener.read(reader)?.read(reader);
        modelChangeListener.read(reader);
        this.tryUpdateItemForModel(model);
      }));
    };
    this._register(_chatService.onDidCreateModel((model) => addModelListeners(model)));
    for (const model of _chatService.chatModels.get()) {
      addModelListeners(model);
    }
    this._register(_chatService.onDidDisposeSession((e4) => {
      for (const sessionResource of e4.sessionResources) {
        this._modelListeners.deleteAndDispose(sessionResource);
      }
    }));
  }
  dispose() {
    this._isDisposed = true;
    this._resolveCache.clear();
    super.dispose();
  }
  get items() {
    return Array.from(this._items.values());
  }
  refresh(token) {
    return this._proxy.$refreshChatSessionItems(this._handle, token);
  }
  async newChatSessionItem(request2, token) {
    const dto = await raceCancellationError(this._proxy.$newChatSessionItem(this._handle, {
      prompt: request2.prompt,
      command: request2.command,
      initialSessionOptions: request2.initialSessionOptions ? ChatSessionOptionsMap.toStrValueArray(request2.initialSessionOptions) : void 0
    }, token), token);
    if (!dto) {
      return void 0;
    }
    const item = this.addOrUpdateItem(dto);
    return item;
  }
  async acceptChange(change) {
    const addedOrUpdatedItems = [];
    for (const item of change.addedOrUpdated) {
      const resource = URI.revive(item.resource);
      if (!this._resolving.has(resource)) {
        this._resolveCache.delete(resource);
      }
      addedOrUpdatedItems.push(await this.addOrUpdateItem(item));
    }
    for (const uri4 of change.removed) {
      this._resolveCache.delete(uri4);
      this._items.delete(uri4);
    }
    this._onDidChangeChatSessionItems.fire({
      addedOrUpdated: addedOrUpdatedItems,
      removed: change.removed
    });
  }
  async addOrUpdateItem(dto) {
    const resource = URI.revive(dto.resource);
    const existing = this._items.get(resource);
    const updated = new MainThreadChatSessionItem(dto, this._chatService.getSession(resource), await this._chatService.getMetadataForSession(resource));
    if (existing?.isEqual(updated)) {
      return existing;
    }
    if (existing && existing.label !== updated.label && this._chatService.getSession(resource)) {
      this._chatService.setSessionTitle(resource, updated.label);
    }
    this._items.set(resource, updated);
    this._onDidChangeChatSessionItems.fire({
      addedOrUpdated: [updated]
    });
    return updated;
  }
  async tryUpdateItemForModel(model) {
    const resource = model.sessionResource;
    const existing = this._items.get(resource);
    if (existing) {
      this.addOrUpdateItem(existing);
    }
  }
  async getNewChatSessionInputState(sessionResource, token) {
    const optionGroups = await this._proxy.$provideChatSessionInputState(this._handle, sessionResource, token);
    if (!optionGroups?.length) {
      return void 0;
    }
    return optionGroups;
  }
  async resolveChatSessionItem(resource, token) {
    if (!this._supportsResolve) {
      return void 0;
    }
    const cached = this._resolveCache.get(resource);
    if (cached) {
      return cached;
    }
    const promise = this._doResolveItem(resource, token).catch(
      (err) => {
        this._resolveCache.delete(resource);
        throw err;
      }
    );
    this._resolveCache.set(resource, promise);
    return promise;
  }
  async _doResolveItem(resource, token) {
    const expectedItem = this._items.get(resource);
    this._resolving.set(resource, true);
    let dto;
    try {
      dto = await raceCancellationError(this._proxy.$resolveChatSessionItem(this._handle, resource, token), token);
    } finally {
      this._resolving.delete(resource);
    }
    if (!dto) {
      return void 0;
    }
    if (this._items.get(resource) !== expectedItem) {
      return this._items.get(resource);
    }
    const updated = new MainThreadChatSessionItem(
      dto,
      this._chatService.getSession(resource),
      await this._chatService.getMetadataForSession(resource)
    );
    if (this._items.get(resource) !== expectedItem) {
      return this._items.get(resource);
    }
    if (expectedItem?.isEqual(updated)) {
      return expectedItem;
    }
    this._items.set(resource, updated);
    this._onDidChangeChatSessionItems.fire({
      addedOrUpdated: [updated]
    });
    return updated;
  }
  setSupportsResolve(supportsResolve) {
    if (this._supportsResolve === supportsResolve) {
      return;
    }
    this._supportsResolve = supportsResolve;
    if (supportsResolve) {
      this._resolveCache.clear();
    }
  }
};

MainThreadChatSessionItemController = __decorateClass([
  __decorateParam(4, IChatService)
], MainThreadChatSessionItemController);

var MainThreadChatSessionItem = class {
  constructor(dto, model, detailOverrides) {
    this.resource = URI.revive(dto.resource);
    this.label = dto.label;
    this.timing = dto.timing;
    this.iconPath = dto.iconPath;
    this.badge = reviveMarkdownString(dto.badge);
    this.tooltip = reviveMarkdownString(dto.tooltip);
    this.archived = dto.archived;
    this.metadata = dto.metadata;
    this.legacyResource = dto.legacyResource ? URI.revive(dto.legacyResource) : void 0;
    this.description = (model && getInProgressSessionDescription(model)) ?? reviveMarkdownString(dto.description);
    this.status = (model && getSessionStatusForModel(model)) ?? dto.status;
    this.changes = revive(dto.changes);
    if (detailOverrides && !this.changes) {
      const diffs = {
        files: detailOverrides.stats?.fileCount || 0,
        insertions: detailOverrides.stats?.added || 0,
        deletions: detailOverrides.stats?.removed || 0
      };
      if (hasValidDiff(diffs)) {
        this.changes = diffs;
      }
    }
  }
  isEqual(other) {
    return isEqual2(this.resource, other.resource) && this.label === other.label && this.description === other.description && this.status === other.status && this.timing.created === other.timing.created && this.timing.lastRequestStarted === other.timing.lastRequestStarted && this.timing.lastRequestEnded === other.timing.lastRequestEnded && equals4(this.changes, other.changes) && equals4(this.iconPath, other.iconPath) && stringOrMarkdownEqual(this.badge, other.badge) && stringOrMarkdownEqual(this.tooltip, other.tooltip) && this.archived === other.archived && equals4(this.metadata, other.metadata) && isEqual2(this.legacyResource, other.legacyResource);
  }
};

var MainThreadChatSessions = class extends Disposable {
  constructor(_extHostContext, _agentSessionsService, _chatSessionsService, _chatService, _chatWidgetService, _chatTodoListService, _chatArtifactsService, _chatDebugService, _dialogService, _editorService, editorGroupService, _logService, _instantiationService) {
    super();
    this._extHostContext = _extHostContext;
    this._agentSessionsService = _agentSessionsService;
    this._chatSessionsService = _chatSessionsService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._chatTodoListService = _chatTodoListService;
    this._chatArtifactsService = _chatArtifactsService;
    this._chatDebugService = _chatDebugService;
    this._dialogService = _dialogService;
    this._editorService = _editorService;
    this.editorGroupService = editorGroupService;
    this._logService = _logService;
    this._instantiationService = _instantiationService;
    this._itemControllerRegistrations = this._register(new DisposableMap());
    this._contentProvidersRegistrations = this._register(new DisposableMap());
    this._sessionTypeToHandle = /* @__PURE__ */ new Map();
    this._activeSessions = new ResourceMap();
    this._sessionDisposables = new ResourceMap();
    this._proxy = this._extHostContext.getProxy(ExtHostContext.ExtHostChatSessions);
    this._register(this._chatSessionsService.onDidChangeSessionOptions(({ sessionResource, updates }) => {
      const sessionType = getChatSessionType(sessionResource);
      const handle2 = this._getHandleForSessionType(sessionType);
      this._logService.trace(`[MainThreadChatSessions] onRequestNotifyExtension received: sessionType '${sessionType}', handle ${handle2}, ${updates.size} update(s)`);
      if (handle2 !== void 0) {
        this.notifyOptionsChange(handle2, sessionResource, updates);
      } else {
        this._logService.warn(`[MainThreadChatSessions] Cannot notify option change for sessionType '${sessionType}': no provider registered. Registered types: [${Array.from(this._sessionTypeToHandle.keys()).join(", ")}]`);
      }
    }));
    this._register(this._agentSessionsService.model.onDidChangeSessionArchivedState((session) => {
      for (const [handle2, { chatSessionType }] of this._itemControllerRegistrations) {
        if (chatSessionType === session.providerType) {
          this._proxy.$onDidChangeChatSessionItemState(handle2, session.resource, session.isArchived());
        }
      }
    }));
  }
  _getHandleForSessionType(chatSessionType) {
    return this._sessionTypeToHandle.get(chatSessionType);
  }
  $registerChatSessionItemController(handle2, chatSessionType, supportsResolve) {
    const disposables = new DisposableStore();
    const controller = disposables.add(this._instantiationService.createInstance(MainThreadChatSessionItemController, this._proxy, chatSessionType, handle2, supportsResolve));
    disposables.add(this._chatSessionsService.registerChatSessionItemController(chatSessionType, controller));
    this._itemControllerRegistrations.set(handle2, {
      chatSessionType,
      controller,
      dispose: () => disposables.dispose()
    });
    this._refreshControllerInputState(handle2, chatSessionType);
  }
  $updateChatSessionItemControllerCapabilities(handle2, supportsResolve) {
    const registration = this._itemControllerRegistrations.get(handle2);
    if (!registration) {
      this._logService.warn(`No chat session item controller found for handle ${handle2}`);
      return;
    }
    registration.controller.setSupportsResolve(supportsResolve);
  }
  _refreshControllerInputState(handle2, chatSessionType) {
    this._proxy.$provideChatSessionInputState(handle2, void 0, CancellationToken.None).then((optionGroups) => {
      if (optionGroups?.length) {
        this._applyOptionGroups(handle2, chatSessionType, void 0, optionGroups);
      }
    }).catch((err) => this._logService.error("Error fetching chat session input state", err));
  }
  _applyOptionGroups(handle2, chatSessionType, sessionResourceComponents, optionGroups) {
    this._chatSessionsService.setOptionGroupsForSessionType(chatSessionType, handle2, optionGroups);
    if (sessionResourceComponents) {
      const sessionResource = URI.revive(sessionResourceComponents);
      optionGroups.forEach((group2) => {
        if (group2.selected) {
          this._chatSessionsService.setSessionOption(sessionResource, group2.id, group2.selected);
        }
      });
    }
  }
  getController(handle2) {
    const registration = this._itemControllerRegistrations.get(handle2);
    if (!registration) {
      throw new Error(`No chat session controller registered for handle ${handle2}`);
    }
    return registration.controller;
  }
  async $updateChatSessionItems(controllerHandle, change) {
    const controller = this.getController(controllerHandle);
    controller.acceptChange({
      addedOrUpdated: change.addedOrUpdated,
      removed: change.removed.map((uri4) => URI.revive(uri4))
    });
  }
  async $addOrUpdateChatSessionItem(controllerHandle, item) {
    const controller = this.getController(controllerHandle);
    controller.acceptChange({
      addedOrUpdated: [item],
      removed: []
    });
  }
  $onDidChangeChatSessionOptions(handle2, sessionResourceComponents, updates) {
    const sessionResource = URI.revive(sessionResourceComponents);
    this._chatSessionsService.updateSessionOptions(sessionResource, ChatSessionOptionsMap.fromRecord(updates));
  }
  async $onDidCommitChatSessionItem(handle2, originalComponents, modifiedCompoennts) {
    const originalResource = URI.revive(originalComponents);
    const modifiedResource = URI.revive(modifiedCompoennts);
    this._logService.trace(`$onDidCommitChatSessionItem: handle(${handle2}), original(${originalResource}), modified(${modifiedResource})`);
    const chatSessionType = this._itemControllerRegistrations.get(handle2)?.chatSessionType;
    if (!chatSessionType) {
      this._logService.error(`No chat session type found for provider handle ${handle2}`);
      return;
    }
    const originalEditor = this._editorService.editors.find((editor) => editor.resource?.toString() === originalResource.toString());
    const originalModel = this._chatService.acquireExistingSession(originalResource);
    const contribution = this._chatSessionsService.getAllChatSessionContributions().find((c) => c.type === chatSessionType);
    try {
      this._chatTodoListService.migrateTodos(originalResource, modifiedResource);
      this._chatArtifactsService.getArtifacts(originalResource).migrate(this._chatArtifactsService.getArtifacts(modifiedResource));
      if (chatSessionType === "copilotcli") {
        this._chatDebugService.invokeProviders(modifiedResource).catch(() => {
        });
      }
      const originalGroup = this.editorGroupService.groups.find((group2) => group2.editors.some((editor) => isEqual2(editor.resource, originalResource))) ?? this.editorGroupService.activeGroup;
      const options3 = {
        title: {
          preferred: originalEditor?.getName() || void 0,
          fallback: localize(5670, null, contribution?.displayName)
        }
      };
      const newSession = await this._chatSessionsService.getOrCreateChatSession(
        URI.revive(modifiedResource),
        CancellationToken.None
      );
      if (originalEditor) {
        newSession.transferredState = originalEditor instanceof ChatEditorInput ? { editingSession: originalEditor.transferOutEditingSession(), inputState: originalModel?.object?.inputModel.toJSON() } : void 0;
        await this._editorService.replaceEditors([{
          editor: originalEditor,
          replacement: {
            resource: modifiedResource,
            options: options3
          }
        }], originalGroup);
        this._resendPendingRequests(originalResource, modifiedResource);
        return;
      }
      if (originalModel) {
        newSession.transferredState = {
          editingSession: originalModel.object.editingSession,
          inputState: originalModel.object.inputModel.toJSON()
        };
      }
      const chatViewWidget = this._chatWidgetService.getWidgetBySessionResource(originalResource);
      if (chatViewWidget && isIChatViewViewContext(chatViewWidget.viewContext)) {
        await this._chatWidgetService.openSession(modifiedResource, void 0, { preserveFocus: true });
      } else if (!chatViewWidget) {
        const ref = await this._chatService.acquireOrLoadSession(modifiedResource, "panel" /* Chat */, CancellationToken.None);
        ref?.dispose();
      }
      this._resendPendingRequests(originalResource, modifiedResource);
      this._chatSessionsService.fireSessionCommitted(originalResource, modifiedResource);
    } finally {
      originalModel?.dispose();
    }
  }
  /**
   * Re-sends pending and in-flight requests from the original session on the committed session.
   */
  _resendPendingRequests(originalResource, modifiedResource) {
    this._chatService.migrateRequests(originalResource, modifiedResource);
  }
  async _provideChatSessionContent(providerHandle, sessionResource, token) {
    const t0 = Date.now();
    this._logService.trace(`[MainThreadChatSessions] _provideChatSessionContent start handle=${providerHandle} uri=${sessionResource.toString()}`);
    let session = this._activeSessions.get(sessionResource);
    if (!session) {
      session = new ObservableChatSession(
        sessionResource,
        providerHandle,
        this._proxy,
        this._logService,
        this._dialogService
      );
      this._activeSessions.set(sessionResource, session);
      const disposable = session.onWillDispose(() => {
        this._activeSessions.delete(sessionResource);
        this._sessionDisposables.get(sessionResource)?.dispose();
        this._sessionDisposables.delete(sessionResource);
      });
      this._sessionDisposables.set(sessionResource, disposable);
    }
    try {
      const initialSessionOptions = this._chatSessionsService.getSessionOptions(sessionResource);
      await session.initialize(token, {
        initialSessionOptions: initialSessionOptions ? [...initialSessionOptions].map(([optionId, value2]) => ({ optionId, value: typeof value2 === "string" ? value2 : value2?.id })) : void 0
      });
      if (session.options) {
        for (const [_, handle2] of this._sessionTypeToHandle) {
          if (handle2 === providerHandle) {
            for (const [optionId, value2] of session.options) {
              this._chatSessionsService.setSessionOption(sessionResource, optionId, value2);
            }
            break;
          }
        }
      }
      this._logService.trace(`[MainThreadChatSessions] _provideChatSessionContent done total=${Date.now() - t0}ms handle=${providerHandle} uri=${sessionResource.toString()}`);
      return session;
    } catch (error) {
      session.dispose();
      this._logService.error(`Error providing chat session content for handle ${providerHandle} and resource ${sessionResource.toString()}:`, error);
      throw error;
    }
  }
  $unregisterChatSessionItemController(handle2) {
    this._itemControllerRegistrations.deleteAndDispose(handle2);
  }
  $registerChatSessionContentProvider(handle2, chatSessionScheme) {
    const provider = {
      provideChatSessionContent: (resource, token) => this._provideChatSessionContent(handle2, resource, token)
    };
    this._sessionTypeToHandle.set(chatSessionScheme, handle2);
    this._contentProvidersRegistrations.set(handle2, this._chatSessionsService.registerChatSessionContentProvider(chatSessionScheme, provider));
    this._refreshProviderOptions(handle2, chatSessionScheme);
  }
  $unregisterChatSessionContentProvider(handle2) {
    this._contentProvidersRegistrations.deleteAndDispose(handle2);
    for (const [sessionType, h3] of this._sessionTypeToHandle) {
      if (h3 === handle2) {
        this._sessionTypeToHandle.delete(sessionType);
        break;
      }
    }
    for (const [key3, session] of this._activeSessions) {
      if (session.providerHandle === handle2) {
        session.dispose();
        this._activeSessions.delete(key3);
      }
    }
  }
  async $handleProgressChunk(handle2, sessionResource, requestId, chunks) {
    const resource = URI.revive(sessionResource);
    const observableSession = this._activeSessions.get(resource);
    if (!observableSession) {
      this._logService.warn(`No session found for progress chunks: handle ${handle2}, sessionResource ${resource}, requestId ${requestId}`);
      return;
    }
    const chatProgressParts = chunks.map((chunk2) => {
      const [progress] = Array.isArray(chunk2) ? chunk2 : [chunk2];
      return revive(progress);
    });
    observableSession.handleProgressChunk(requestId, chatProgressParts);
  }
  $handleProgressComplete(handle2, sessionResource, requestId) {
    const resource = URI.revive(sessionResource);
    const observableSession = this._activeSessions.get(resource);
    if (!observableSession) {
      this._logService.warn(`No session found for progress completion: handle ${handle2}, sessionResource ${resource}, requestId ${requestId}`);
      return;
    }
    observableSession.handleProgressComplete(requestId);
  }
  $handleAnchorResolve(handle2, sesssionResource, requestId, requestHandle, anchor) {
  }
  $onDidChangeChatSessionProviderOptions(handle2) {
    let sessionType;
    for (const [type, h3] of this._sessionTypeToHandle) {
      if (h3 === handle2) {
        sessionType = type;
        break;
      }
    }
    if (!sessionType) {
      this._logService.warn(`No session type found for chat session content provider handle ${handle2} when refreshing provider options`);
      return;
    }
    this._refreshProviderOptions(handle2, sessionType);
  }
  $updateChatSessionInputState(controllerHandle, sessionResource, optionGroups) {
    const registration = this._itemControllerRegistrations.get(controllerHandle);
    if (!registration) {
      this._logService.warn(`No controller found for handle ${controllerHandle} when updating input state`);
      return;
    }
    this._applyOptionGroups(controllerHandle, registration.chatSessionType, sessionResource, optionGroups);
  }
  _refreshProviderOptions(handle2, chatSessionScheme) {
    this._proxy.$provideChatSessionProviderOptions(handle2, CancellationToken.None).then((options3) => {
      if (options3?.optionGroups && options3.optionGroups.length) {
        this._chatSessionsService.setOptionGroupsForSessionType(chatSessionScheme, handle2, [...options3.optionGroups]);
      }
    }).catch((err) => {
      if (!isCancellationError(err)) {
        this._logService.error("Error fetching chat session options", err);
      }
    });
  }
  dispose() {
    for (const session of this._activeSessions.values()) {
      session.dispose();
    }
    this._activeSessions.clear();
    for (const disposable of this._sessionDisposables.values()) {
      disposable.dispose();
    }
    this._sessionDisposables.clear();
    super.dispose();
  }
  /**
   * Notify the extension about option changes for a session
   */
  async notifyOptionsChange(handle2, sessionResource, updates) {
    this._logService.trace(`[MainThreadChatSessions] notifyOptionsChange: starting proxy call for handle ${handle2}, sessionResource ${sessionResource}`);
    try {
      await this._proxy.$provideHandleOptionsChange(handle2, sessionResource, Object.fromEntries(updates), CancellationToken.None);
      this._logService.trace(`[MainThreadChatSessions] notifyOptionsChange: proxy call completed for handle ${handle2}, sessionResource ${sessionResource}`);
    } catch (error) {
      this._logService.error(`[MainThreadChatSessions] notifyOptionsChange: error for handle ${handle2}, sessionResource ${sessionResource}:`, error);
    }
  }
};

MainThreadChatSessions = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatSessions),
  __decorateParam(1, IAgentSessionsService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatWidgetService),
  __decorateParam(5, IChatTodoListService),
  __decorateParam(6, IChatArtifactsService),
  __decorateParam(7, IChatDebugService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IInstantiationService)
], MainThreadChatSessions);

function reviveMarkdownString(value2) {
  if (!value2) {
    return void 0;
  }
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 === "object" && "value" in value2) {
    return MarkdownString.lift(value2);
  }
  return void 0;
}
export { stringOrMarkdownEqual, reviveMarkdownString, ObservableChatSession, MainThreadChatSessionItemController, MainThreadChatSessionItem, MainThreadChatSessions };
