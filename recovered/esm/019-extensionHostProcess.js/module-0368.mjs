// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostChatSessions.ts
import { Emitter } from "./module-0017.mjs";
import { equals3 } from "./module-0042.mjs";
import { ResourceMap, ResourceSet } from "./module-0007.mjs";
import { ChatAgentRequest, ChatRequestModeInstructions, ChatResponsePart, ChatSessionItem, Diagnostic2, Location3 } from "./module-0245.mjs";
import { ChatAgentResponseStream } from "./module-0366.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0018.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0011.mjs";
import { MainContext } from "./module-0054.mjs";
import { ChatReferenceDiagnostic, ChatRequestTurn, Disposable3 } from "./module-0244.mjs";
import { URI } from "./module-0025.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0102.mjs";
import { CancellationError } from "./module-0003.mjs";
import { isEqual2 } from "./module-0027.mjs";
import { generateUuid } from "./module-0040.mjs";
import { IDiagnosticVariableEntryFilterData, toPromptFileVariableEntry } from "./module-0103.mjs";
import { Location2 } from "./module-0236.mjs";
import { SymbolKinds } from "./module-0093.mjs";
import { coalesce } from "./module-0006.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/api/common/extHostChatSessions.ts
var ChatSessionInputStateImpl = class {
  constructor(groups, onChangedDelegate) {
    this.#onDidChangeEmitter = new Emitter();
    this.onDidChange = this.#onDidChangeEmitter.event;
    this.#onDidDisposeEmitter = new Emitter();
    this.onDidDispose = this.#onDidDisposeEmitter.event;
    this.#groups = groups;
    this.#onChangedDelegate = onChangedDelegate;
  }
  #groups;
  #onChangedDelegate;
  #onDidChangeEmitter;
  #onDidDisposeEmitter;
  #sessionResource;
  get sessionResource() {
    return this.#sessionResource;
  }
  set sessionResource(value) {
    this.#sessionResource = value;
  }
  #untitledSessionResource;
  get untitledSessionResource() {
    return this.#untitledSessionResource;
  }
  set untitledSessionResource(value) {
    this.#untitledSessionResource = value;
  }
  get groups() {
    return this.#groups;
  }
  set groups(value) {
    this.#groups = value;
    this.#onChangedDelegate?.();
  }
  _fireDidChange() {
    this.#onDidChangeEmitter.fire();
  }
  _setGroups(groups) {
    this.#groups = groups;
  }
  _dispose() {
    this.#onDidDisposeEmitter.fire();
    this.#onDidDisposeEmitter.dispose();
    this.#onDidChangeEmitter.dispose();
  }
};

var ChatSessionItemImpl = class {
  #label;
  #iconPath;
  #description;
  #badge;
  #status;
  #archived;
  #tooltip;
  #timing;
  #changes;
  #metadata;
  #onChanged;
  constructor(resource, label, onChanged) {
    this.resource = resource;
    this.#label = label;
    this.#onChanged = onChanged;
  }
  get label() {
    return this.#label;
  }
  set label(value) {
    if (this.#label !== value) {
      this.#label = value;
      this.#onChanged();
    }
  }
  get iconPath() {
    return this.#iconPath;
  }
  set iconPath(value) {
    if (this.#iconPath !== value) {
      this.#iconPath = value;
      this.#onChanged();
    }
  }
  get description() {
    return this.#description;
  }
  set description(value) {
    if (this.#description !== value) {
      this.#description = value;
      this.#onChanged();
    }
  }
  get badge() {
    return this.#badge;
  }
  set badge(value) {
    if (this.#badge !== value) {
      this.#badge = value;
      this.#onChanged();
    }
  }
  get status() {
    return this.#status;
  }
  set status(value) {
    if (this.#status !== value) {
      this.#status = value;
      this.#onChanged();
    }
  }
  get archived() {
    return this.#archived;
  }
  set archived(value) {
    if (this.#archived !== value) {
      this.#archived = value;
      this.#onChanged();
    }
  }
  get tooltip() {
    return this.#tooltip;
  }
  set tooltip(value) {
    if (this.#tooltip !== value) {
      this.#tooltip = value;
      this.#onChanged();
    }
  }
  get timing() {
    return this.#timing;
  }
  set timing(value) {
    if (this.#timing !== value) {
      this.#timing = value;
      this.#onChanged();
    }
  }
  get changes() {
    return this.#changes;
  }
  set changes(value) {
    if (this.#changes !== value) {
      this.#changes = value;
      this.#onChanged();
    }
  }
  get metadata() {
    return this.#metadata;
  }
  set metadata(value) {
    if (value !== void 0) {
      try {
        JSON.stringify(value);
      } catch {
        throw new Error("metadata must be JSON-serializable");
      }
    }
    if (!equals3(this.#metadata, value)) {
      this.#metadata = value;
      this.#onChanged();
    }
  }
};

function computeItemsDelta(oldItems, newItems) {
  const delta3 = {
    addedOrUpdated: new ResourceMap(),
    removed: new ResourceSet()
  };
  for (const [newResource, newItem] of newItems) {
    const oldItem = oldItems.get(newResource);
    if (oldItem !== newItem) {
      delta3.addedOrUpdated.set(newResource, newItem);
    }
  }
  for (const oldResource of oldItems.keys()) {
    if (!newItems.has(oldResource)) {
      delta3.removed.add(oldResource);
    }
  }
  return delta3;
}

function convertChatSessionDeltaToDto(delta3) {
  return {
    addedOrUpdated: delta3.addedOrUpdated ? Array.from(delta3.addedOrUpdated.values(), ChatSessionItem.from) : [],
    removed: delta3.removed ? Array.from(delta3.removed.keys()) : []
  };
}

var ChatSessionItemCollectionImpl = class {
  #items = new ResourceMap();
  #proxy;
  #controllerHandle;
  constructor(controllerHandle, proxy) {
    this.#proxy = proxy;
    this.#controllerHandle = controllerHandle;
  }
  get size() {
    return this.#items.size;
  }
  replace(newItems) {
    if (!newItems.length && !this.#items.size) {
      return;
    }
    const newItemsMap = new ResourceMap(newItems.map((item) => [item.resource, item]));
    const delta3 = computeItemsDelta(this.#items, newItemsMap);
    if (!delta3.addedOrUpdated?.size && !delta3.removed?.size) {
      return;
    }
    this.#items = newItemsMap;
    void this.#proxy.$updateChatSessionItems(this.#controllerHandle, convertChatSessionDeltaToDto(delta3));
  }
  forEach(callback, thisArg) {
    for (const [_, item] of this.#items) {
      callback.call(thisArg, item, this);
    }
  }
  add(item) {
    const existing = this.#items.get(item.resource);
    if (existing && existing === item) {
      return;
    }
    this.#items.set(item.resource, item);
    void this.#proxy.$addOrUpdateChatSessionItem(this.#controllerHandle, ChatSessionItem.from(item));
  }
  delete(resource) {
    if (this.#items.delete(resource)) {
      void this.#proxy.$updateChatSessionItems(this.#controllerHandle, {
        addedOrUpdated: [],
        removed: [resource]
      });
    }
  }
  get(resource) {
    return this.#items.get(resource);
  }
  [Symbol.iterator]() {
    return this.#items.entries();
  }
};

var ExtHostChatSession = class {
  constructor(session, extension, request, proxy, commandsConverter, sessionDisposables) {
    this.session = session;
    this.extension = extension;
    this.proxy = proxy;
    this.commandsConverter = commandsConverter;
    this.sessionDisposables = sessionDisposables;
    // Empty map since question carousel is designed for chat agents, not chat sessions
    this._pendingCarouselResolvers = /* @__PURE__ */ new Map();
    this._stream = new ChatAgentResponseStream(extension, request, proxy, commandsConverter, sessionDisposables, this._pendingCarouselResolvers, CancellationToken.None);
  }
  get activeResponseStream() {
    return this._stream;
  }
  getActiveRequestStream(request) {
    return new ChatAgentResponseStream(this.extension, request, this.proxy, this.commandsConverter, this.sessionDisposables, this._pendingCarouselResolvers, CancellationToken.None);
  }
};

var ExtHostChatSessions = class extends Disposable {
  constructor(commands, _languageModels, _extHostRpc, _logService) {
    super();
    this.commands = commands;
    this._languageModels = _languageModels;
    this._extHostRpc = _extHostRpc;
    this._logService = _logService;
    this._itemControllerHandlePool = 0;
    this._chatSessionItemControllers = /* @__PURE__ */ new Map();
    this._contentProviderHandlePool = 0;
    this._chatSessionContentProviders = /* @__PURE__ */ new Map();
    /**
     * Map of uri -> chat sessions infos
     */
    this._extHostChatSessions = new ResourceMap();
    /**
     * Map of proxy command id -> original command id + controller handle.
     * Used to wrap option group commands so they receive `{ inputState, sessionResource }` instead of just `sessionResource`.
     */
    this._proxyCommands = /* @__PURE__ */ new Map();
    this._proxy = this._extHostRpc.getProxy(MainContext.MainThreadChatSessions);
    commands.registerArgumentProcessor({
      processArgument: (arg) => {
        if (arg && arg.$mid === 25 /* AgentSessionContext */) {
          const resource = arg.session.resource;
          for (const { controller } of this._chatSessionItemControllers.values()) {
            const item = controller.items.get(resource);
            if (item) {
              return item;
            }
          }
          this._logService.warn(`No chat session found with uri: ${resource}`);
          return arg;
        }
        return arg;
      }
    });
  }
  registerChatSessionItemProvider(extension, chatSessionType, provider) {
    const controllerHandle = this._itemControllerHandlePool++;
    const disposables = new DisposableStore();
    const onDidChangeChatSessionItemStateEmitter = disposables.add(new Emitter());
    const collection = new ChatSessionItemCollectionImpl(controllerHandle, this._proxy);
    const controller = {
      id: chatSessionType,
      items: collection,
      createChatSessionItem: (_resource, _label) => {
        throw new Error("Not implemented for providers");
      },
      createChatSessionInputState: (_options) => {
        return new ChatSessionInputStateImpl([]);
      },
      onDidChangeChatSessionItemState: onDidChangeChatSessionItemStateEmitter.event,
      newChatSessionItemHandler: void 0,
      // Bridge the deprecated `ChatSessionItemProvider.resolveChatSessionItem` hook through the
      // new controller surface so both code paths share the same `$resolveChatSessionItem` impl.
      // The legacy provider returns a new item; the bridge adds it to the collection so the
      // controller contract (update via collection, return void) is satisfied.
      resolveChatSessionItem: provider.resolveChatSessionItem ? async (item, token) => {
        const resolved = await provider.resolveChatSessionItem(item, token);
        if (resolved) {
          collection.add(resolved);
        }
      } : void 0,
      dispose: () => {
        disposables.dispose();
      },
      refreshHandler: async (token) => {
        const items = await provider.provideChatSessionItems(token) ?? [];
        collection.replace(items);
      }
    };
    this._chatSessionItemControllers.set(controllerHandle, { chatSessionType, controller, extension, disposable: disposables, onDidChangeChatSessionItemStateEmitter, inputStates: /* @__PURE__ */ new Set() });
    this._proxy.$registerChatSessionItemController(controllerHandle, chatSessionType, !!provider.resolveChatSessionItem);
    if (provider.onDidChangeChatSessionItems) {
      disposables.add(provider.onDidChangeChatSessionItems(() => {
        this._logService.trace(`ExtHostChatSessions. Provider items changed for ${chatSessionType}`);
        controller.refreshHandler(CancellationToken.None);
      }));
    }
    if (provider.onDidCommitChatSessionItem) {
      disposables.add(provider.onDidCommitChatSessionItem((e) => {
        const { original, modified } = e;
        this._proxy.$onDidCommitChatSessionItem(controllerHandle, original.resource, modified.resource);
      }));
    }
    const disposable = {
      dispose: () => {
        this._chatSessionItemControllers.delete(controllerHandle);
        disposables.dispose();
        this._proxy.$unregisterChatSessionItemController(controllerHandle);
      }
    };
    return Object.assign(disposable, {
      onDidChangeChatSessionItemState: onDidChangeChatSessionItemStateEmitter.event
    });
  }
  createChatSessionItemController(extension, id2, refreshHandler) {
    const controllerHandle = this._itemControllerHandlePool++;
    const disposables = new DisposableStore();
    let isDisposed = false;
    let newChatSessionItemHandler;
    let forkHandler;
    let resolveChatSessionItemHandler;
    let provideChatSessionInputStateHandler;
    const onDidChangeChatSessionItemStateEmitter = disposables.add(new Emitter());
    const inputStates = /* @__PURE__ */ new Set();
    const collection = new ChatSessionItemCollectionImpl(controllerHandle, this._proxy);
    const proxy = this._proxy;
    const controller = Object.freeze({
      id: id2,
      refreshHandler: async (refreshToken) => {
        if (isDisposed) {
          throw new Error("ChatSessionItemController has been disposed");
        }
        this._logService.trace(`ExtHostChatSessions. Controller(${id2}).refresh()`);
        await refreshHandler(refreshToken);
      },
      items: collection,
      onDidChangeChatSessionItemState: onDidChangeChatSessionItemStateEmitter.event,
      createChatSessionItem: (resource, label) => {
        if (isDisposed) {
          throw new Error("ChatSessionItemController has been disposed");
        }
        const item = new ChatSessionItemImpl(resource, label, () => {
          if (collection.get(resource) === item) {
            void this._proxy.$addOrUpdateChatSessionItem(controllerHandle, ChatSessionItem.from(item));
          }
        });
        return item;
      },
      get newChatSessionItemHandler() {
        return newChatSessionItemHandler;
      },
      set newChatSessionItemHandler(handler) {
        newChatSessionItemHandler = handler;
      },
      get forkHandler() {
        return forkHandler;
      },
      set forkHandler(handler) {
        forkHandler = handler;
      },
      get resolveChatSessionItem() {
        return resolveChatSessionItemHandler;
      },
      set resolveChatSessionItem(handler) {
        const hadHandler = !!resolveChatSessionItemHandler;
        resolveChatSessionItemHandler = handler;
        const hasHandler = !!handler;
        if (hadHandler !== hasHandler && !isDisposed) {
          proxy.$updateChatSessionItemControllerCapabilities(controllerHandle, hasHandler);
        }
      },
      get getChatSessionInputState() {
        return provideChatSessionInputStateHandler;
      },
      set getChatSessionInputState(handler) {
        provideChatSessionInputStateHandler = handler;
      },
      createChatSessionInputState: (groups) => {
        if (isDisposed) {
          throw new Error("ChatSessionItemController has been disposed");
        }
        const inputState = new ChatSessionInputStateImpl(groups, () => {
          const entry = this._chatSessionItemControllers.get(controllerHandle);
          if (entry) {
            entry.optionGroups = inputState.groups;
          }
          const wrappedGroups = this._wrapOptionGroupCommands(controllerHandle, inputState.groups);
          const serializableGroups = wrappedGroups.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            items: g.items,
            selected: g.selected,
            when: g.when,
            icon: g.icon,
            commands: g.commands,
            kind: g.kind
          }));
          const resource = inputState.sessionResource ?? inputState.untitledSessionResource;
          if (resource) {
            void this._proxy.$updateChatSessionInputState(controllerHandle, resource, serializableGroups);
          }
        });
        inputStates.add(inputState);
        return inputState;
      },
      dispose: () => {
        isDisposed = true;
        for (const inputState of inputStates) {
          inputState._dispose();
        }
        inputStates.clear();
        disposables.dispose();
      }
    });
    this._chatSessionItemControllers.set(controllerHandle, { controller, extension, disposable: disposables, chatSessionType: id2, onDidChangeChatSessionItemStateEmitter, inputStates });
    this._proxy.$registerChatSessionItemController(controllerHandle, id2, !!resolveChatSessionItemHandler);
    disposables.add(toDisposable(() => {
      this._chatSessionItemControllers.delete(controllerHandle);
      this._proxy.$unregisterChatSessionItemController(controllerHandle);
    }));
    return controller;
  }
  registerChatSessionContentProvider(extension, chatSessionScheme, chatParticipant, provider, capabilities) {
    const handle = this._contentProviderHandlePool++;
    const disposables = new DisposableStore();
    this._chatSessionContentProviders.set(handle, { chatSessionScheme, provider, extension, capabilities, disposable: disposables });
    this._proxy.$registerChatSessionContentProvider(handle, chatSessionScheme);
    if (provider.onDidChangeChatSessionOptions) {
      disposables.add(provider.onDidChangeChatSessionOptions((evt) => {
        const updates = /* @__PURE__ */ Object.create(null);
        for (const update of evt.updates) {
          updates[update.optionId] = update.value;
        }
        this._proxy.$onDidChangeChatSessionOptions(handle, evt.resource, updates);
      }));
    }
    if (provider.onDidChangeChatSessionProviderOptions) {
      disposables.add(provider.onDidChangeChatSessionProviderOptions(() => {
        this._proxy.$onDidChangeChatSessionProviderOptions(handle);
      }));
    }
    return new Disposable3(() => {
      this._chatSessionContentProviders.delete(handle);
      disposables.dispose();
      this._proxy.$unregisterChatSessionContentProvider(handle);
    });
  }
  async $provideChatSessionContent(handle, sessionResourceComponents, context, token) {
    const provider = this._chatSessionContentProviders.get(handle);
    if (!provider) {
      throw new Error(`No provider for handle ${handle}`);
    }
    const sessionResource = URI.revive(sessionResourceComponents);
    const controllerData = this.getChatSessionItemController(getChatSessionType(sessionResource));
    let inputState;
    if (controllerData?.controller.getChatSessionInputState) {
      const result = await controllerData.controller.getChatSessionInputState(isUntitledChatSession(sessionResource) ? void 0 : sessionResource, {
        previousInputState: this._createInputStateFromOptions(controllerData.optionGroups ?? [], context.initialSessionOptions)
      }, token);
      if (result) {
        inputState = result;
      }
    }
    inputState ??= this._createInputStateFromOptions(
      controllerData?.optionGroups ?? [],
      context.initialSessionOptions
    );
    if (inputState instanceof ChatSessionInputStateImpl) {
      if (controllerData) {
        this._disposeInputStatesForResource(controllerData.inputStates, sessionResource);
      }
      if (isUntitledChatSession(sessionResource)) {
        inputState.untitledSessionResource = sessionResource;
      } else {
        inputState.sessionResource = sessionResource;
      }
    }
    const session = await provider.provider.provideChatSessionContent(sessionResource, token, {
      inputState
    });
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    const sessionDisposables = new DisposableStore();
    const id2 = sessionResource.toString();
    const chatSession = new ExtHostChatSession(session, provider.extension, {
      sessionResource,
      requestId: "ongoing",
      agentId: id2,
      message: "",
      variables: { variables: [] },
      location: "panel" /* Chat */
    }, {
      $handleProgressChunk: (requestId, chunks) => {
        return this._proxy.$handleProgressChunk(handle, sessionResource, requestId, chunks);
      },
      $handleAnchorResolve: (requestId, requestHandle, anchor) => {
        this._proxy.$handleAnchorResolve(handle, sessionResource, requestId, requestHandle, anchor);
      }
    }, this.commands.converter, sessionDisposables);
    const disposeCts = sessionDisposables.add(new CancellationTokenSource());
    this._extHostChatSessions.set(sessionResource, { sessionObj: chatSession, disposeCts });
    if (session.activeResponseCallback) {
      Promise.resolve(session.activeResponseCallback(chatSession.activeResponseStream.apiObject, disposeCts.token)).finally(() => {
        this._proxy.$handleProgressComplete(handle, sessionResource, "ongoing");
      });
    }
    const { capabilities } = provider;
    return {
      resource: URI.revive(sessionResource),
      title: session.title,
      hasActiveResponseCallback: !!session.activeResponseCallback,
      hasRequestHandler: !!session.requestHandler,
      hasForkHandler: !!controllerData?.controller.forkHandler || !!session.forkHandler,
      supportsInterruption: !!capabilities?.supportsInterruptions,
      options: session.options,
      history: session.history.map((turn) => {
        if (turn instanceof ChatRequestTurn) {
          return this.convertRequestTurn(turn);
        } else {
          return this.convertResponseTurn(turn, sessionDisposables);
        }
      })
    };
  }
  async $provideHandleOptionsChange(handle, sessionResourceComponents, updates, token) {
    const sessionResource = URI.revive(sessionResourceComponents);
    const provider = this._chatSessionContentProviders.get(handle);
    if (!provider) {
      this._logService.warn(`No provider for handle ${handle}`);
      return;
    }
    if (provider.provider.provideHandleOptionsChange) {
      try {
        const updatesToSend = Object.entries(updates).map(([optionId, value]) => ({
          optionId,
          value: value === void 0 ? void 0 : typeof value === "string" ? value : value.id
        }));
        provider.provider.provideHandleOptionsChange(sessionResource, updatesToSend, token);
      } catch (error) {
        this._logService.error(`Error calling provideHandleOptionsChange for handle ${handle}, sessionResource ${sessionResource}:`, error);
      }
      return;
    }
    const sessionType = getChatSessionType(sessionResource);
    const controllerData = this.getChatSessionItemController(sessionType);
    if (!controllerData || !controllerData.controller.getChatSessionInputState) {
      this._logService.warn(`No valid controller found for session type ${sessionType}`);
      return;
    }
    for (const inputState of controllerData?.inputStates ?? []) {
      const updatedGroups = inputState.groups.map((group) => {
        const update = updates[group.id];
        if (!update) {
          return group;
        }
        const selectedId = typeof update === "string" ? update : update.id;
        const selectedItem = group.items.find((item) => item.id === selectedId);
        if (!selectedItem) {
          return group;
        }
        return { ...group, selected: selectedItem };
      });
      inputState._setGroups(updatedGroups);
      inputState._fireDidChange();
    }
  }
  async $provideChatSessionProviderOptions(handle, token) {
    const entry = this._chatSessionContentProviders.get(handle);
    if (!entry) {
      this._logService.warn(`No provider for handle ${handle} when requesting chat session options`);
      return;
    }
    const provider = entry.provider;
    if (!provider.provideChatSessionProviderOptions) {
      return;
    }
    try {
      const result = await provider.provideChatSessionProviderOptions(token);
      if (!result) {
        return;
      }
      const { optionGroups, newSessionOptions } = result;
      if (optionGroups) {
        const controllerData = this.getChatSessionItemController(entry.chatSessionScheme);
        if (controllerData) {
          controllerData.optionGroups = optionGroups;
        }
      }
      return {
        optionGroups,
        newSessionOptions
      };
    } catch (error) {
      this._logService.error(`Error calling provideChatSessionProviderOptions for handle ${handle}:`, error);
      return;
    }
  }
  async $interruptChatSessionActiveResponse(providerHandle, sessionResource, requestId) {
    const entry = this._extHostChatSessions.get(URI.revive(sessionResource));
    entry?.disposeCts.cancel();
  }
  async $disposeChatSessionContent(providerHandle, sessionResource) {
    const resource = URI.revive(sessionResource);
    const entry = this._extHostChatSessions.get(resource);
    if (!entry) {
      this._logService.warn(`No chat session found for resource: ${sessionResource}`);
      return;
    }
    const controllerData = this.getChatSessionItemController(resource.scheme);
    if (controllerData) {
      this._disposeInputStatesForResource(controllerData.inputStates, resource);
    }
    entry.disposeCts.cancel();
    entry.sessionObj.sessionDisposables.dispose();
    this._extHostChatSessions.delete(resource);
  }
  async $invokeChatSessionRequestHandler(handle, sessionResource, request, history, token) {
    const entry = this._extHostChatSessions.get(URI.revive(sessionResource));
    if (!entry || !entry.sessionObj.session.requestHandler) {
      return {};
    }
    const chatRequest = ChatAgentRequest.to(request, void 0, await this.getModelForRequest(request, entry.sessionObj.extension), request.modelConfiguration, [], /* @__PURE__ */ new Map(), entry.sessionObj.extension, this._logService);
    const stream = entry.sessionObj.getActiveRequestStream(request);
    await entry.sessionObj.session.requestHandler(chatRequest, { history, yieldRequested: false }, stream.apiObject, token);
    return {};
  }
  async $forkChatSession(handle, sessionResourceComponents, request, token) {
    const sessionResource = URI.revive(sessionResourceComponents);
    const entry = this._extHostChatSessions.get(sessionResource);
    if (!entry) {
      throw new Error(`No chat session found for resource ${sessionResource.toString()}`);
    }
    const requestTurn = this.convertRequestDtoToRequestTurn(request);
    const controllerData = this.getChatSessionItemController(getChatSessionType(sessionResource));
    if (controllerData?.controller.forkHandler) {
      const item2 = await controllerData.controller.forkHandler(sessionResource, requestTurn, token);
      return ChatSessionItem.from(item2);
    }
    if (!entry.sessionObj.session.forkHandler) {
      throw new Error(`No fork handler for session ${sessionResource.toString()}`);
    }
    const item = await entry.sessionObj.session.forkHandler(sessionResource, requestTurn, token);
    return ChatSessionItem.from(item);
  }
  convertRequestDtoToRequestTurn(request) {
    if (!request) {
      return void 0;
    }
    return new ChatRequestTurn(
      request.prompt,
      request.command,
      [],
      request.participant,
      [],
      void 0,
      request.id,
      request.modelId,
      ChatRequestModeInstructions.to(request.modeInstructions)
    );
  }
  getChatSessionItemController(chatSessionType) {
    for (const controllerData of this._chatSessionItemControllers.values()) {
      if (controllerData.chatSessionType === chatSessionType) {
        return controllerData;
      }
    }
    return void 0;
  }
  _disposeInputStatesForResource(inputStates, resource) {
    for (const inputState of inputStates) {
      const inputResource = inputState.sessionResource ?? inputState.untitledSessionResource;
      if (inputResource && isEqual2(resource, inputResource)) {
        inputState._dispose();
        inputStates.delete(inputState);
      }
    }
  }
  _createInputStateFromOptions(groups, sessionOptions) {
    if (!sessionOptions?.length) {
      return new ChatSessionInputStateImpl(groups);
    }
    const resolvedGroups = groups.map((group) => {
      const match2 = sessionOptions.find((o) => o.optionId === group.id);
      if (!match2) {
        return group;
      }
      const selectedItem = group.items.find((item) => item.id === match2.value);
      if (!selectedItem) {
        return group;
      }
      return { ...group, selected: selectedItem };
    });
    return new ChatSessionInputStateImpl(resolvedGroups);
  }
  /**
   * Gets the input state for a session. This calls the controller's `getChatSessionInputState` handler if available,
   * otherwise falls back to creating an input state from the session options.
   */
  async getInputStateForSession(sessionResource, initialSessionOptions, token) {
    const sessionType = sessionResource ? getChatSessionType(sessionResource) : void 0;
    const controllerData = sessionType ? this.getChatSessionItemController(sessionType) : void 0;
    const resolvedResource = sessionResource && !isUntitledChatSession(sessionResource) ? sessionResource : void 0;
    if (controllerData?.controller.getChatSessionInputState) {
      const result = await controllerData.controller.getChatSessionInputState(
        resolvedResource,
        { previousInputState: this._createInputStateFromOptions(controllerData.optionGroups ?? [], initialSessionOptions) },
        token
      );
      if (result) {
        if (result instanceof ChatSessionInputStateImpl) {
          if (sessionResource && controllerData) {
            this._disposeInputStatesForResource(controllerData.inputStates, sessionResource);
          }
          if (sessionResource && isUntitledChatSession(sessionResource)) {
            result.untitledSessionResource = sessionResource;
          } else if (sessionResource) {
            result.sessionResource = resolvedResource;
          }
        }
        return result;
      }
    }
    const fallback = this._createInputStateFromOptions(controllerData?.optionGroups ?? [], initialSessionOptions);
    fallback.sessionResource = resolvedResource;
    return fallback;
  }
  /**
   * Wraps option group commands with proxy commands so that extensions using the new
   * `getChatSessionInputState` API receive `{ inputState, sessionResource }` instead of just `sessionResource`.
   *
   * For controllers that do not implement the new API, commands are returned unchanged.
   */
  _wrapOptionGroupCommands(controllerHandle, groups) {
    const controllerData = this._chatSessionItemControllers.get(controllerHandle);
    if (!controllerData?.controller.getChatSessionInputState) {
      return groups;
    }
    return groups.map((group) => {
      if (!group.commands?.length) {
        return group;
      }
      return {
        ...group,
        commands: group.commands.map((command) => {
          const proxyId = `_chatSession.proxyCommand.${generateUuid()}`;
          this._proxyCommands.set(proxyId, { originalCommandId: command.command, controllerHandle });
          this.commands.registerCommand(true, proxyId, async (...args2) => {
            const sessionResource = args2[0] instanceof URI ? args2[0] : void 0;
            const inputState = await this.getInputStateForSession(
              sessionResource,
              void 0,
              CancellationToken.None
            );
            return this.commands.executeCommand(
              command.command,
              { inputState, sessionResource },
              ...command.arguments ?? []
            );
          });
          return { ...command, command: proxyId };
        })
      };
    });
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
  convertRequestTurn(turn) {
    const variables = turn.references.map((ref) => this.convertReferenceToVariable(ref));
    return {
      type: "request",
      id: turn.id,
      prompt: turn.prompt,
      participant: turn.participant,
      command: turn.command,
      variableData: variables.length > 0 ? { variables } : void 0,
      modelId: turn.modelId,
      modeInstructions: ChatRequestModeInstructions.from(turn.modeInstructions2)
    };
  }
  convertReferenceToVariable(ref) {
    const value = ref.value && typeof ref.value === "object" && "uri" in ref.value && "range" in ref.value ? Location3.from(ref.value) : ref.value;
    const range = ref.range ? { start: ref.range[0], endExclusive: ref.range[1] } : void 0;
    if (value && value instanceof ChatReferenceDiagnostic && Array.isArray(value.diagnostics) && value.diagnostics.length && value.diagnostics[0][1].length) {
      const marker = Diagnostic2.from(value.diagnostics[0][1][0]);
      const refValue = {
        filterRange: { startLineNumber: marker.startLineNumber, startColumn: marker.startColumn, endLineNumber: marker.endLineNumber, endColumn: marker.endColumn },
        filterSeverity: marker.severity,
        filterUri: value.diagnostics[0][0],
        problemMessage: value.diagnostics[0][1][0].message
      };
      return IDiagnosticVariableEntryFilterData.toEntry(refValue);
    }
    if (Location2.isLocation(ref.value) && ref.name.startsWith(`sym:`)) {
      const loc = Location3.from(ref.value);
      return {
        id: ref.id,
        name: ref.name,
        fullName: ref.name.substring(4),
        value: { uri: ref.value.uri, range: loc.range },
        // We never send this information to extensions, so default to Property
        symbolKind: 6 /* Property */,
        // We never send this information to extensions, so default to Property
        icon: SymbolKinds.toIcon(6 /* Property */),
        kind: "symbol",
        range
      };
    }
    if (URI.isUri(value) && ref.name.startsWith(`prompt:`)) {
      if (ref.id.startsWith("vscode.instructions.file.root" /* Instruction */)) {
        return toPromptFileVariableEntry(value, "vscode.instructions.file.root" /* Instruction */);
      }
      if (ref.id.startsWith("vscode.instructions.file.reference" /* InstructionReference */)) {
        return toPromptFileVariableEntry(value, "vscode.instructions.file.reference" /* InstructionReference */);
      }
      if (ref.id.startsWith("vscode.prompt.file" /* PromptFile */)) {
        return toPromptFileVariableEntry(value, "vscode.prompt.file" /* PromptFile */);
      }
    }
    const isFile = URI.isUri(value) || value && typeof value === "object" && "uri" in value;
    const isFolder = isFile && URI.isUri(value) && value.path.endsWith("/");
    return {
      id: ref.id,
      name: ref.name,
      value,
      modelDescription: ref.modelDescription,
      range,
      kind: isFolder ? "directory" : isFile ? "file" : "generic"
    };
  }
  convertResponseTurn(turn, sessionDisposables) {
    const parts = coalesce(turn.response.map((r2) => ChatResponsePart.from(r2, this.commands.converter, sessionDisposables)));
    return {
      type: "response",
      parts,
      participant: turn.participant,
      details: turn.result?.details
    };
  }
  async $refreshChatSessionItems(handle, token) {
    const controllerData = this._chatSessionItemControllers.get(handle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${handle}`);
      return;
    }
    await controllerData.controller.refreshHandler(token);
  }
  async $newChatSessionItem(handle, request, token) {
    const controllerData = this._chatSessionItemControllers.get(handle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${handle}`);
      return void 0;
    }
    const handler = controllerData.controller.newChatSessionItemHandler;
    if (!handler) {
      return void 0;
    }
    const previousInputState = this._createInputStateFromOptions(controllerData.optionGroups ?? [], request.initialSessionOptions);
    let inputState;
    if (controllerData.controller.getChatSessionInputState) {
      inputState = await controllerData.controller.getChatSessionInputState(void 0, { previousInputState }, token);
    } else {
      inputState = previousInputState;
    }
    const item = await handler({
      request: {
        prompt: request.prompt,
        command: request.command
      },
      inputState
    }, token);
    if (!item) {
      return void 0;
    }
    controllerData.controller.items.add(item);
    return ChatSessionItem.from(item);
  }
  $onDidChangeChatSessionItemState(controllerHandle, sessionResourceComponents, archived) {
    const controllerData = this._chatSessionItemControllers.get(controllerHandle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${controllerHandle}`);
      return;
    }
    const sessionResource = URI.revive(sessionResourceComponents);
    const item = controllerData.controller.items.get(sessionResource);
    if (!item) {
      this._logService.warn(`No item found for session resource ${sessionResource.toString()}`);
      return;
    }
    item.archived = archived;
    controllerData.onDidChangeChatSessionItemStateEmitter.fire(item);
  }
  async $resolveChatSessionItem(handle, sessionResourceComponents, token) {
    const sessionResource = URI.revive(sessionResourceComponents);
    const controllerData = this._chatSessionItemControllers.get(handle);
    if (!controllerData?.controller.resolveChatSessionItem) {
      return void 0;
    }
    const item = controllerData.controller.items.get(sessionResource);
    if (!item) {
      this._logService.warn(`No item found for session resource ${sessionResource.toString()}`);
      return void 0;
    }
    await controllerData.controller.resolveChatSessionItem(item, token);
    const updatedItem = controllerData.controller.items.get(sessionResource);
    if (!updatedItem) {
      return void 0;
    }
    return ChatSessionItem.from(updatedItem);
  }
  async $provideChatSessionInputState(controllerHandle, sessionResourceComponents, token) {
    const controllerData = this._chatSessionItemControllers.get(controllerHandle);
    if (!controllerData) {
      this._logService.warn(`No controller found for handle ${controllerHandle}`);
      return void 0;
    }
    const handler = controllerData.controller.getChatSessionInputState;
    if (!handler) {
      return void 0;
    }
    const sessionResource = sessionResourceComponents ? URI.revive(sessionResourceComponents) : void 0;
    const inputState = await handler(!sessionResource || isUntitledChatSession(sessionResource) ? void 0 : sessionResource, { previousInputState: void 0 }, token);
    if (!inputState) {
      return void 0;
    }
    if (inputState instanceof ChatSessionInputStateImpl && sessionResource) {
      this._disposeInputStatesForResource(controllerData.inputStates, sessionResource);
      if (isUntitledChatSession(sessionResource)) {
        inputState.untitledSessionResource = sessionResource;
      } else {
        inputState.sessionResource = sessionResource;
      }
    }
    controllerData.optionGroups = inputState.groups;
    const wrappedGroups = this._wrapOptionGroupCommands(controllerHandle, inputState.groups);
    return wrappedGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      items: g.items,
      selected: g.selected,
      when: g.when,
      icon: g.icon,
      commands: g.commands,
      kind: g.kind
    }));
  }
};

ExtHostChatSessions = __decorateClass([
  __decorateParam(2, IExtHostRpcService),
  __decorateParam(3, ILogService)
], ExtHostChatSessions);
export { computeItemsDelta, convertChatSessionDeltaToDto, ChatSessionInputStateImpl, ChatSessionItemImpl, ChatSessionItemCollectionImpl, ExtHostChatSession, ExtHostChatSessions };
