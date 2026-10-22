// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingServiceImpl.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { LinkedList } from "./module-0013.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { derived } from "./module-0054.mjs";
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from "./module-2257.mjs";
import { Schemas } from "./module-0033.mjs";
import { CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, chatEditingAgentSupportsReadonlyReferencesContextKey, chatEditingResourceContextKey, inChatEditingSessionContextKey, parseChatMultiDiffUri } from "./module-1081.mjs";
import { localize } from "./module-0001.mjs";
import { Iterable } from "./module-0011.mjs";
import { AbstractChatEditingModifiedFileEntry } from "./module-2711.mjs";
import { assertType } from "./module-0010.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { ChatEditingSession } from "./module-2731.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { CellUri } from "./module-0909.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isCellTextEditOperationArray } from "./module-1193.mjs";
import { groupBy } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from "./module-1147.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatService } from "./module-0972.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IDecorationsService } from "./module-1067.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IProductService } from "./module-0873.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { runOnChange } from "./module-0064.mjs";
import { compareBy, delta } from "./module-0007.mjs";
import { compare } from "./module-0030.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ValueWithChangeEventFromObservable } from "./module-0063.mjs";
import { TextEdit } from "./module-0164.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingServiceImpl.ts
var ChatEditingService = class extends Disposable {
  constructor(_instantiationService, multiDiffSourceResolverService, textModelService, contextKeyService, _chatService, _editorService, decorationsService, _fileService, lifecycleService, storageService, logService, extensionService, productService, notebookService, _configurationService) {
    super();
    this._instantiationService = _instantiationService;
    this._chatService = _chatService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this.lifecycleService = lifecycleService;
    this.notebookService = notebookService;
    this._configurationService = _configurationService;
    this._providers = /* @__PURE__ */ new Map();
    this._sessionsObs = observableValueOpts({ equalsFn: (a, b) => false }, new LinkedList());
    this._editingSessions = new ResourceMap();
    this.editingSessionsObs = derived((r2) => {
      const result = Array.from(this._sessionsObs.read(r2));
      return result;
    });
    this._register(decorationsService.registerDecorationsProvider(_instantiationService.createInstance(ChatDecorationsProvider, this.editingSessionsObs)));
    this._register(multiDiffSourceResolverService.registerResolver(_instantiationService.createInstance(ChatEditingMultiDiffSourceResolver, this.editingSessionsObs, (resource) => this.getEditingSession(resource))));
    this._register(textModelService.registerTextModelContentProvider(ChatEditingTextModelContentProvider.scheme, _instantiationService.createInstance(ChatEditingTextModelContentProvider, this)));
    this._register(textModelService.registerTextModelContentProvider(Schemas.chatEditingSnapshotScheme, _instantiationService.createInstance(ChatEditingSnapshotTextModelContentProvider, this)));
    this._register(this._chatService.onDidDisposeSession((e) => {
      if (e.reason === "cleared") {
        for (const resource of e.sessionResources) {
          this.getEditingSession(resource)?.stop();
        }
      }
    }));
    const readonlyEnabledContextKey = chatEditingAgentSupportsReadonlyReferencesContextKey.bindTo(contextKeyService);
    const setReadonlyFilesEnabled = () => {
      const enabled = productService.quality !== "stable" && extensionService.extensions.some((e) => e.enabledApiProposals?.includes("chatReadonlyPromptReference"));
      readonlyEnabledContextKey.set(enabled);
    };
    setReadonlyFilesEnabled();
    this._register(extensionService.onDidRegisterExtensions(setReadonlyFilesEnabled));
    this._register(extensionService.onDidChangeExtensions(setReadonlyFilesEnabled));
    let storageTask;
    this._register(storageService.onWillSaveState(() => {
      const tasks2 = [];
      for (const session of this._editingSessions.values()) {
        if (!session.isGlobalEditingSession) {
          continue;
        }
        tasks2.push(session.storeState());
      }
      storageTask = Promise.resolve(storageTask).then(() => Promise.all(tasks2)).finally(() => storageTask = void 0);
    }));
    this._register(this.lifecycleService.onWillShutdown((e) => {
      if (!storageTask) {
        return;
      }
      e.join(storageTask, {
        id: "join.chatEditingSession",
        label: localize(10883, null)
      });
    }));
  }
  dispose() {
    dispose(this._editingSessions.values());
    super.dispose();
  }
  startOrContinueGlobalEditingSession(chatModel) {
    return this.getEditingSession(chatModel.sessionResource) || this.createEditingSession(chatModel, true);
  }
  _lookupEntry(uri5) {
    for (const item of Iterable.concat(this.editingSessionsObs.get())) {
      const candidate = item.getEntry(uri5);
      if (candidate instanceof AbstractChatEditingModifiedFileEntry) {
        return candidate.acquire();
      }
    }
    return void 0;
  }
  getEditingSession(chatSessionResource) {
    return this._editingSessions.get(chatSessionResource);
  }
  createEditingSession(chatModel, global = false) {
    return this._createEditingSession(chatModel, global, void 0);
  }
  transferEditingSession(chatModel, session) {
    return this._createEditingSession(chatModel, session.isGlobalEditingSession, session);
  }
  _createEditingSession(chatModel, global, initFrom) {
    assertType(this.getEditingSession(chatModel.sessionResource) === void 0, "CANNOT have more than one editing session per chat session");
    const provider = this._providers.get(getChatSessionType(chatModel.sessionResource));
    const session = provider ? provider.createEditingSession(chatModel.sessionResource) : this._instantiationService.createInstance(ChatEditingSession, chatModel.sessionResource, global, this._lookupEntry.bind(this), initFrom);
    const list2 = this._sessionsObs.get();
    const removeSession = list2.unshift(session);
    this._editingSessions.set(session.chatSessionResource, session);
    const store = new DisposableStore();
    this._store.add(store);
    if (!provider && session instanceof ChatEditingSession) {
      store.add(this.installAutoApplyObserver(session, chatModel));
    }
    store.add(session.onDidDispose((e) => {
      removeSession();
      if (this._editingSessions.get(session.chatSessionResource) === session) {
        this._editingSessions.delete(session.chatSessionResource);
      }
      this._sessionsObs.set(list2, void 0);
      this._store.delete(store);
    }));
    this._sessionsObs.set(list2, void 0);
    return session;
  }
  registerEditReviewSession(session) {
    const list2 = this._sessionsObs.get();
    const removeSession = list2.unshift(session);
    this._sessionsObs.set(list2, void 0);
    return toDisposable(() => {
      removeSession();
      this._sessionsObs.set(list2, void 0);
    });
  }
  registerEditingSessionProvider(scheme, provider) {
    this._providers.set(scheme, provider);
    return toDisposable(() => {
      if (this._providers.get(scheme) === provider) {
        this._providers.delete(scheme);
      }
    });
  }
  installAutoApplyObserver(session, chatModel) {
    if (!chatModel) {
      throw new ErrorNoTelemetry(`Edit session was created for a non-existing chat session: ${session.chatSessionResource}`);
    }
    const observerDisposables = new DisposableStore();
    observerDisposables.add(chatModel.onDidChange(async (e) => {
      if (e.kind !== "addRequest") {
        return;
      }
      session.createSnapshot(e.request.id, void 0);
      const responseModel = e.request.response;
      if (responseModel) {
        this.observerEditsInResponse(e.request.id, responseModel, session, observerDisposables);
      }
    }));
    observerDisposables.add(chatModel.onDidDispose(() => observerDisposables.dispose()));
    return observerDisposables;
  }
  observerEditsInResponse(requestId, responseModel, session, observerDisposables) {
    let K;
    ((K2) => {
      K2[K2["Stream"] = 0] = "Stream";
      K2[K2["Workspace"] = 1] = "Workspace";
    })(K || (K = {}));
    const editsSeen = [];
    const initialActiveEditor = this._editorService.activeEditorPane?.input;
    const editorOpenPromises = new ResourceMap();
    const openChatEditedFiles = this._configurationService.getValue("accessibility.openChatEditedFiles");
    const ensureEditorOpen = (partUri) => {
      const uri5 = CellUri.parse(partUri)?.notebook ?? partUri;
      if (editorOpenPromises.has(uri5)) {
        return;
      }
      editorOpenPromises.set(uri5, (async () => {
        if (this.notebookService.getNotebookTextModel(uri5) || uri5.scheme === Schemas.untitled || await this._fileService.exists(uri5).catch(() => false)) {
          const activeUri = this._editorService.activeEditorPane?.input.resource;
          const currentActiveEditor = this._editorService.activeEditorPane?.input;
          const editorDidChange = initialActiveEditor && currentActiveEditor ? !initialActiveEditor.matches(currentActiveEditor) : initialActiveEditor !== currentActiveEditor;
          const inactive = editorDidChange || this._editorService.activeEditorPane?.input instanceof ChatEditorInput && isEqual2(this._editorService.activeEditorPane.input.sessionResource, session.chatSessionResource) || Boolean(activeUri && session.entries.get().find((entry) => isEqual2(activeUri, entry.modifiedURI)));
          this._editorService.openEditor({ resource: uri5, options: { inactive, preserveFocus: true, pinned: true, isExplicit: false } });
        }
      })());
    };
    const onResponseComplete = () => {
      for (const remaining of editsSeen) {
        if (remaining?.kind === 0 /* Stream */) {
          remaining.stream.complete();
        }
      }
      editsSeen.length = 0;
      editorOpenPromises.clear();
    };
    const handleResponseParts = async () => {
      if (responseModel.isCanceled) {
        return;
      }
      let undoStop;
      for (let i2 = 0; i2 < responseModel.response.value.length; i2++) {
        const part = responseModel.response.value[i2];
        if (part.kind === "undoStop") {
          undoStop = part.id;
          continue;
        }
        if (part.kind === "workspaceEdit") {
          if (!editsSeen[i2]) {
            editsSeen[i2] = { kind: 1 /* Workspace */ };
            session.applyWorkspaceEdit(part, responseModel, undoStop ?? responseModel.requestId);
          }
          continue;
        }
        if (part.kind !== "textEditGroup" && part.kind !== "notebookEditGroup") {
          continue;
        }
        if (part.isExternalEdit) {
          continue;
        }
        if (openChatEditedFiles) {
          ensureEditorOpen(part.uri);
        }
        let entry = editsSeen[i2];
        if (!entry) {
          entry = { kind: 0 /* Stream */, seen: 0, stream: session.startStreamingEdits(CellUri.parse(part.uri)?.notebook ?? part.uri, responseModel, undoStop) };
          editsSeen[i2] = entry;
        }
        if (entry.kind !== 0 /* Stream */) {
          continue;
        }
        const isFirst = entry.seen === 0;
        const newEdits = part.edits.slice(entry.seen);
        entry.seen = part.edits.length;
        if (newEdits.length > 0 || isFirst) {
          for (let i3 = 0; i3 < newEdits.length; i3++) {
            const edit3 = newEdits[i3];
            const done = part.done ? i3 === newEdits.length - 1 : false;
            if (isTextEditOperationArray(edit3)) {
              entry.stream.pushText(edit3, done);
            } else if (isCellTextEditOperationArray(edit3)) {
              for (const edits of Object.values(groupBy(edit3, (e) => e.uri.toString()))) {
                if (edits) {
                  entry.stream.pushNotebookCellText(edits[0].uri, edits.map((e) => e.edit), done);
                }
              }
            } else {
              entry.stream.pushNotebook(edit3, done);
            }
          }
        }
        if (part.done) {
          entry.stream.complete();
        }
      }
    };
    if (responseModel.isComplete) {
      handleResponseParts().then(() => {
        onResponseComplete();
      });
    } else {
      const disposable = observerDisposables.add(responseModel.onDidChange((e2) => {
        if (e2.reason === "undoStop") {
          session.createSnapshot(requestId, e2.id);
        } else {
          handleResponseParts().then(() => {
            if (responseModel.isComplete) {
              onResponseComplete();
              observerDisposables.delete(disposable);
            }
          });
        }
      }));
    }
  }
};

ChatEditingService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMultiDiffSourceResolverService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IDecorationsService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ILifecycleService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ILogService),
  __decorateParam(11, IExtensionService),
  __decorateParam(12, IProductService),
  __decorateParam(13, INotebookService),
  __decorateParam(14, IConfigurationService)
], ChatEditingService);

function observeArrayChanges(obs, compare6, store) {
  const emitter = store.add(new Emitter());
  store.add(runOnChange(obs, (newArr, oldArr) => {
    const change = delta(oldArr || [], newArr, compare6);
    const changedElements = [].concat(change.added).concat(change.removed);
    emitter.fire(changedElements);
  }));
  return emitter.event;
}

var ChatDecorationsProvider = class extends Disposable {
  constructor(_sessions) {
    super();
    this._sessions = _sessions;
    this.label = localize(10881, null);
    this._currentEntries = derived(this, (r2) => {
      const sessions = this._sessions.read(r2);
      if (!sessions) {
        return [];
      }
      const result = [];
      for (const session of sessions) {
        const entries2 = session.entries.read(r2);
        result.push(...entries2);
      }
      return result;
    });
    this._currentlyEditingUris = derived(this, (r2) => {
      const uri5 = this._currentEntries.read(r2);
      return uri5.filter((entry) => entry.isCurrentlyBeingModifiedBy.read(r2)).map((entry) => entry.modifiedURI);
    });
    this._modifiedUris = derived(this, (r2) => {
      const uri5 = this._currentEntries.read(r2);
      return uri5.filter((entry) => !entry.isCurrentlyBeingModifiedBy.read(r2) && entry.state.read(r2) === 0 /* Modified */).map((entry) => entry.modifiedURI);
    });
    this.onDidChange = Event2.any(
      observeArrayChanges(this._currentlyEditingUris, compareBy((uri5) => uri5.toString(), compare), this._store),
      observeArrayChanges(this._modifiedUris, compareBy((uri5) => uri5.toString(), compare), this._store)
    );
  }
  provideDecorations(uri5, _token) {
    const isCurrentlyBeingModified = this._currentlyEditingUris.get().some((e) => isEqual2(e, uri5));
    if (isCurrentlyBeingModified) {
      return {
        weight: 1e3,
        letter: ThemeIcon.modify(Codicon.loading, "spin"),
        bubble: false
      };
    }
    const isModified = this._modifiedUris.get().some((e) => isEqual2(e, uri5));
    if (isModified) {
      return {
        weight: 1e3,
        letter: Codicon.diffModified,
        tooltip: localize(10882, null),
        bubble: true
      };
    }
    return void 0;
  }
};

var ChatEditingMultiDiffSourceResolver = class {
  constructor(_editingSessionsObs, _getEditingSession, _instantiationService) {
    this._editingSessionsObs = _editingSessionsObs;
    this._getEditingSession = _getEditingSession;
    this._instantiationService = _instantiationService;
  }
  canHandleUri(uri5) {
    return uri5.scheme === CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME;
  }
  async resolveDiffSource(uri5) {
    const parsed = parseChatMultiDiffUri(uri5);
    const thisSession = derived(this, (r2) => {
      this._editingSessionsObs.read(r2);
      return this._getEditingSession(parsed.chatSessionResource);
    });
    return this._instantiationService.createInstance(ChatEditingMultiDiffSource, thisSession, parsed.showPreviousChanges);
  }
};

ChatEditingMultiDiffSourceResolver = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChatEditingMultiDiffSourceResolver);

var ChatEditingMultiDiffSource = class {
  constructor(_currentSession, _showPreviousChanges) {
    this._currentSession = _currentSession;
    this._showPreviousChanges = _showPreviousChanges;
    this._resources = derived(this, (reader) => {
      const currentSession = this._currentSession.read(reader);
      if (!currentSession) {
        return [];
      }
      const entries2 = currentSession.entries.read(reader);
      return entries2.map((entry) => {
        if (this._showPreviousChanges) {
          const entryDiffObs = currentSession.getEntryDiffBetweenStops(entry.modifiedURI, void 0, void 0);
          const entryDiff = entryDiffObs?.read(reader);
          if (entryDiff) {
            return new MultiDiffEditorItem(
              entryDiff.originalURI,
              entryDiff.modifiedURI,
              void 0,
              void 0,
              {
                [chatEditingResourceContextKey.key]: entry.entryId
              }
            );
          }
        }
        return new MultiDiffEditorItem(
          entry.originalURI,
          entry.modifiedURI,
          void 0,
          void 0,
          {
            [chatEditingResourceContextKey.key]: entry.entryId
            // [inChatEditingSessionContextKey.key]: true
          }
        );
      });
    });
    this.resources = new ValueWithChangeEventFromObservable(this._resources);
    this.contextKeys = {
      [inChatEditingSessionContextKey.key]: true
    };
  }
};

function isTextEditOperationArray(value2) {
  return value2.some((e) => TextEdit.isTextEdit(e));
}
export { observeArrayChanges, isTextEditOperationArray, ChatEditingService, ChatDecorationsProvider, ChatEditingMultiDiffSourceResolver, ChatEditingMultiDiffSource };
