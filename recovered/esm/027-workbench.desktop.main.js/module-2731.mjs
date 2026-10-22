// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingSession.ts
import { DeferredPromise, Sequencer, SequencerByKey, timeout } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { derived } from "./module-0054.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatEditingCheckpointTimelineImpl } from "./module-2714.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatEditingModifiedNotebookEntry } from "./module-2729.mjs";
import { Range2 } from "./module-0106.mjs";
import { ChatEditingSessionStorage } from "./module-2730.mjs";
import { transaction } from "./module-0045.mjs";
import { CellUri } from "./module-0909.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { chatEditingSessionIsReady, getMultiDiffSourceUri } from "./module-1081.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractChatEditingModifiedFileEntry } from "./module-2711.mjs";
import { ChatEditingTextModelContentProvider } from "./module-2257.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { ChatEditingDeletedFileEntry } from "./module-2715.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";
import { Iterable } from "./module-0011.mjs";
import { URI } from "./module-0032.mjs";
import { ChatEditingModifiedDocumentEntry } from "./module-2720.mjs";
import { hasKey } from "./module-0010.mjs";
import { getKeyForChatSessionResource } from "./module-2712.mjs";
import { isStringInSample } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotebookService } from "./module-0926.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IChatEditingExplanationModelManager } from "./module-2708.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingSession.ts
var ThrottledSequencer = class extends Sequencer {
  constructor(_minDuration, _maxOverallDelay) {
    super();
    this._minDuration = _minDuration;
    this._maxOverallDelay = _maxOverallDelay;
    this._size = 0;
  }
  queue(promiseTask) {
    this._size += 1;
    const noDelay = this._size * this._minDuration > this._maxOverallDelay;
    return super.queue(async () => {
      try {
        const p1 = promiseTask();
        const p2 = noDelay ? Promise.resolve(void 0) : timeout(this._minDuration, CancellationToken.None);
        const [result] = await Promise.all([p1, p2]);
        return result;
      } finally {
        this._size -= 1;
      }
    });
  }
};

function createOpeningEditCodeBlock(uri5, isNotebook, undoStopId) {
  return [
    {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    },
    {
      kind: "codeblockUri",
      uri: uri5,
      isEdit: true,
      undoStopId
    },
    {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    },
    isNotebook ? {
      kind: "notebookEdit",
      uri: uri5,
      edits: [],
      done: false,
      isExternalEdit: true
    } : {
      kind: "textEdit",
      uri: uri5,
      edits: [],
      done: false,
      isExternalEdit: true
    }
  ];
}

var ChatEditingSession = class extends Disposable {
  constructor(chatSessionResource, isGlobalEditingSession, _lookupExternalEntry, transferFrom, _instantiationService, _modelService, _languageService, _textModelService, _bulkEditService, _editorGroupsService, _editorService, _notebookService, _accessibilitySignalService, _logService, configurationService, _fileService, _explanationModelManager, _telemetryService) {
    super();
    this.chatSessionResource = chatSessionResource;
    this.isGlobalEditingSession = isGlobalEditingSession;
    this._lookupExternalEntry = _lookupExternalEntry;
    this._instantiationService = _instantiationService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._textModelService = _textModelService;
    this._bulkEditService = _bulkEditService;
    this._editorGroupsService = _editorGroupsService;
    this._editorService = _editorService;
    this._notebookService = _notebookService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._logService = _logService;
    this.configurationService = configurationService;
    this._fileService = _fileService;
    this._explanationModelManager = _explanationModelManager;
    this._telemetryService = _telemetryService;
    this.supportsKeepUndo = false;
    this._state = observableValue(this, 0 /* Initial */);
    /**
     * Contains the contents of a file when the AI first began doing edits to it.
     */
    this._initialFileContents = new ResourceMap();
    this._baselineCreationLocks = new SequencerByKey();
    this._streamingEditLocks = new SequencerByKey();
    /**
     * Tracks active external edit operations.
     * Key is operationId, value contains the operation state.
     */
    this._externalEditOperations = /* @__PURE__ */ new Map();
    this._entriesObs = observableValue(this, []);
    this.entries = derived((reader) => {
      const state = this._state.read(reader);
      if (state === 3 /* Disposed */ || state === 0 /* Initial */) {
        return [];
      } else {
        return this._entriesObs.read(reader);
      }
    });
    this._onDidDispose = new Emitter();
    this._timeline = this._instantiationService.createInstance(
      ChatEditingCheckpointTimelineImpl,
      chatSessionResource,
      this._getTimelineDelegate()
    );
    this.canRedo = this._timeline.canRedo.map((hasHistory, reader) => hasHistory && this._state.read(reader) === 2 /* Idle */);
    this.canUndo = this._timeline.canUndo.map((hasHistory, reader) => hasHistory && this._state.read(reader) === 2 /* Idle */);
    this._init(transferFrom);
  }
  get state() {
    return this._state;
  }
  get requestDisablement() {
    return this._timeline.requestDisablement;
  }
  get onDidDispose() {
    this._assertNotDisposed();
    return this._onDidDispose.event;
  }
  _getTimelineDelegate() {
    return {
      createFile: (uri5, content2) => {
        return this._bulkEditService.apply({
          edits: [{
            newResource: uri5,
            options: {
              overwrite: true,
              contents: content2 ? Promise.resolve(VSBuffer.fromString(content2)) : void 0
            }
          }]
        });
      },
      deleteFile: async (uri5) => {
        const removedEntry = this._entriesObs.get().find((e) => isEqual2(e.modifiedURI, uri5));
        const entries2 = this._entriesObs.get().filter((e) => !isEqual2(e.modifiedURI, uri5));
        this._entriesObs.set(entries2, void 0);
        removedEntry?.dispose();
        await this._bulkEditService.apply({ edits: [{ oldResource: uri5, options: { ignoreIfNotExists: true } }] });
      },
      renameFile: async (fromUri, toUri) => {
        const entries2 = this._entriesObs.get();
        const previousEntry = entries2.find((e) => isEqual2(e.modifiedURI, fromUri));
        if (previousEntry) {
          const newEntry = await this._getOrCreateModifiedFileEntry(toUri, 0 /* Create */, previousEntry.telemetryInfo, this._getCurrentTextOrNotebookSnapshot(previousEntry));
          previousEntry.dispose();
          this._entriesObs.set(entries2.map((e) => e === previousEntry ? newEntry : e), void 0);
        }
      },
      setContents: async (uri5, content2, telemetryInfo) => {
        const entry = await this._getOrCreateModifiedFileEntry(uri5, 0 /* Create */, telemetryInfo);
        const state = entry.state.get();
        if (entry instanceof ChatEditingModifiedNotebookEntry) {
          await entry.restoreModifiedModelFromSnapshot(content2);
        } else {
          await entry.acceptAgentEdits(uri5, [{ range: new Range2(1, 1, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), text: content2 }], true, void 0);
        }
        if (state !== 0 /* Modified */) {
          await entry.accept();
        }
      }
    };
  }
  async _init(transferFrom) {
    const storage = this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource);
    let restoredSessionState;
    if (transferFrom instanceof ChatEditingSession) {
      restoredSessionState = transferFrom._getStoredState(this.chatSessionResource);
    } else {
      restoredSessionState = await storage.restoreState().catch((err) => {
        this._logService.error(`Error restoring chat editing session state for ${this.chatSessionResource}`, err);
        return void 0;
      });
      if (this._store.isDisposed) {
        return;
      }
    }
    if (restoredSessionState) {
      for (const [uri5, content2] of restoredSessionState.initialFileContents) {
        this._initialFileContents.set(uri5, content2);
      }
      if (restoredSessionState.timeline) {
        transaction((tx) => this._timeline.restoreFromState(restoredSessionState.timeline, tx));
      }
      await this._initEntries(restoredSessionState.recentSnapshot);
    }
    this._state.set(2 /* Idle */, void 0);
  }
  _getEntry(uri5) {
    uri5 = CellUri.parse(uri5)?.notebook ?? uri5;
    return this._entriesObs.get().find((e) => isEqual2(e.modifiedURI, uri5));
  }
  getEntry(uri5) {
    return this._getEntry(uri5);
  }
  readEntry(uri5, reader) {
    uri5 = CellUri.parse(uri5)?.notebook ?? uri5;
    return this._entriesObs.read(reader).find((e) => isEqual2(e.modifiedURI, uri5));
  }
  storeState() {
    const storage = this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource);
    const storedState = this._getStoredState();
    this._reportSessionInfo("chatEditing/sessionStore", this._entriesObs.get());
    return storage.storeState(storedState);
  }
  _getStoredState(sessionResource = this.chatSessionResource) {
    const entries2 = new ResourceMap();
    for (const entry of this._entriesObs.get()) {
      entries2.set(entry.modifiedURI, entry.createSnapshot(sessionResource, void 0, void 0));
    }
    const state = {
      initialFileContents: this._initialFileContents,
      timeline: this._timeline.getStateForPersistence(),
      recentSnapshot: { entries: entries2, stopId: void 0 }
    };
    return state;
  }
  getEntryDiffBetweenStops(uri5, requestId, stopId) {
    return this._timeline.getEntryDiffBetweenStops(uri5, requestId, stopId);
  }
  getEntryDiffBetweenRequests(uri5, startRequestId, stopRequestId) {
    return this._timeline.getEntryDiffBetweenRequests(uri5, startRequestId, stopRequestId);
  }
  getDiffsForFilesInSession() {
    return this._timeline.getDiffsForFilesInSession();
  }
  getDiffForSession() {
    return this._timeline.getDiffForSession();
  }
  getDiffsForFilesInRequest(requestId) {
    return this._timeline.getDiffsForFilesInRequest(requestId);
  }
  hasEditsInRequest(requestId, reader) {
    return this._timeline.hasEditsInRequest(requestId, reader);
  }
  createSnapshot(requestId, undoStop) {
    const label3 = undoStop ? `Request ${requestId} - Stop ${undoStop}` : `Request ${requestId}`;
    this._timeline.createCheckpoint(requestId, undoStop, label3);
  }
  async getSnapshotContents(requestId, uri5, stopId) {
    const content2 = await this._timeline.getContentAtStop(requestId, uri5, stopId);
    return typeof content2 === "string" ? VSBuffer.fromString(content2) : content2;
  }
  async getSnapshotModel(requestId, undoStop, snapshotUri) {
    await this._baselineCreationLocks.peek(snapshotUri.path);
    const content2 = await this._timeline.getContentAtStop(requestId, snapshotUri, undoStop);
    if (content2 === void 0) {
      return null;
    }
    const contentStr = typeof content2 === "string" ? content2 : content2.toString();
    const model = this._modelService.createModel(contentStr, this._languageService.createByFilepathOrFirstLine(snapshotUri), snapshotUri, false);
    const store = new DisposableStore();
    store.add(model.onWillDispose(() => store.dispose()));
    store.add(this._timeline.onDidChangeContentsAtStop(requestId, snapshotUri, undoStop, (c) => model.setValue(c)));
    return model;
  }
  getSnapshotUri(requestId, uri5, stopId) {
    return this._timeline.getContentURIAtStop(requestId, uri5, stopId);
  }
  async restoreSnapshot(requestId, stopId) {
    const checkpointId = this._timeline.getCheckpointIdForRequest(requestId, stopId);
    if (checkpointId) {
      await this._timeline.navigateToCheckpoint(checkpointId);
    }
  }
  _assertNotDisposed() {
    if (this._state.get() === 3 /* Disposed */) {
      throw new BugIndicatingError(`Cannot access a disposed editing session`);
    }
  }
  async accept(...uris) {
    if (await this._operateEntry("accept", uris)) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
    }
  }
  async reject(...uris) {
    if (await this._operateEntry("reject", uris)) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
    }
  }
  async _operateEntry(action, uris) {
    this._assertNotDisposed();
    const applicableEntries = this._entriesObs.get().filter((e) => uris.length === 0 || uris.some((u) => isEqual2(u, e.modifiedURI))).filter((e) => !e.isCurrentlyBeingModifiedBy.get()).filter((e) => e.state.get() === 0 /* Modified */);
    if (applicableEntries.length === 0) {
      return 0;
    }
    const method = action === "accept" ? "acceptDeferred" : "rejectDeferred";
    const transitionCallbacks = await Promise.all(
      applicableEntries.map((entry) => entry[method]().catch((err) => {
        this._logService.error(`Error calling ${method} on entry ${entry.modifiedURI}`, err);
      }))
    );
    transaction((tx) => {
      transitionCallbacks.forEach((callback) => callback?.(tx));
    });
    return applicableEntries.length;
  }
  async show(previousChanges) {
    this._assertNotDisposed();
    if (this._editorPane) {
      if (this._editorPane.isVisible()) {
        return;
      } else if (this._editorPane.input) {
        await this._editorService.openEditor(this._editorPane.input, { pinned: true, activation: 1 /* ACTIVATE */ });
        return;
      }
    }
    const input = MultiDiffEditorInput.fromResourceMultiDiffEditorInput({
      multiDiffSource: getMultiDiffSourceUri(this, previousChanges),
      label: localize(10884, null)
    }, this._instantiationService);
    this._editorPane = await this._editorService.openEditor(input, { pinned: true, activation: 1 /* ACTIVATE */ });
  }
  async stop(clearState = false) {
    this._stopPromise ??= Promise.allSettled([this._performStop(), this.storeState()]).then(() => {
    });
    await this._stopPromise;
    if (clearState) {
      await this._instantiationService.createInstance(ChatEditingSessionStorage, this.chatSessionResource).clearState();
    }
  }
  async _performStop() {
    const schemes = [AbstractChatEditingModifiedFileEntry.scheme, ChatEditingTextModelContentProvider.scheme];
    await Promise.allSettled(this._editorGroupsService.groups.flatMap(async (g) => {
      return g.editors.map(async (e) => {
        if (e instanceof MultiDiffEditorInput && e.initialResources?.some((r2) => r2.originalUri && schemes.indexOf(r2.originalUri.scheme) !== -1) || e instanceof DiffEditorInput && e.original.resource && schemes.indexOf(e.original.resource.scheme) !== -1) {
          await g.closeEditor(e);
        }
      });
    }));
  }
  dispose() {
    this._assertNotDisposed();
    this.clearExplanations();
    dispose(this._entriesObs.get());
    super.dispose();
    this._state.set(3 /* Disposed */, void 0);
    this._onDidDispose.fire();
    this._onDidDispose.dispose();
  }
  get isDisposed() {
    return this._state.get() === 3 /* Disposed */;
  }
  startStreamingEdits(resource, responseModel, inUndoStop) {
    const completePromise = new DeferredPromise();
    const startPromise = new DeferredPromise();
    const sequencer = new ThrottledSequencer(15, 1e3);
    sequencer.queue(() => startPromise.p);
    this._baselineCreationLocks.queue(resource.path, () => startPromise.p);
    this._streamingEditLocks.queue(resource.toString(), async () => {
      await chatEditingSessionIsReady(this);
      if (!this.isDisposed) {
        await this._acceptStreamingEditsStart(responseModel, inUndoStop, resource);
      }
      startPromise.complete();
      return completePromise.p;
    });
    let didComplete = false;
    return {
      pushText: (edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, edits, isLastEdits, responseModel);
          }
        });
      },
      pushNotebookCellText: (cell, edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(cell, edits, isLastEdits, responseModel);
          }
        });
      },
      pushNotebook: (edits, isLastEdits) => {
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, edits, isLastEdits, responseModel);
          }
        });
      },
      complete: () => {
        if (didComplete) {
          return;
        }
        didComplete = true;
        sequencer.queue(async () => {
          if (!this.isDisposed) {
            await this._acceptEdits(resource, [], true, responseModel);
            await this._resolve(responseModel.requestId, inUndoStop, resource);
            completePromise.complete();
          }
        });
      }
    };
  }
  startDeletion(resource, responseModel, undoStopId) {
    this._assertNotDisposed();
    this._streamingEditLocks.queue(resource.toString(), async () => {
      if (this.isDisposed) {
        return;
      }
      await chatEditingSessionIsReady(this);
      let fileContent;
      try {
        const content2 = await this._fileService.readFile(resource);
        fileContent = content2.value.toString();
      } catch (e) {
        this._logService.warn(`Cannot delete file ${resource.toString()}: file does not exist`);
        return;
      }
      const existingEntry = this._getEntry(resource);
      if (existingEntry) {
        existingEntry.dispose();
        const entries3 = this._entriesObs.get().filter((e) => e !== existingEntry);
        this._entriesObs.set(entries3, void 0);
      }
      if (!this._initialFileContents.has(resource)) {
        this._initialFileContents.set(resource, fileContent);
      }
      await this._bulkEditService.apply({
        edits: [{ oldResource: resource, options: { ignoreIfNotExists: true } }]
      });
      this._timeline.recordFileOperation({
        type: "delete" /* Delete */,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        finalContent: fileContent
      });
      const telemetryInfo = this._getTelemetryInfoForModel(responseModel);
      const languageSelection = this._languageService.createByFilepathOrFirstLine(resource);
      const entry = this._instantiationService.createInstance(
        ChatEditingDeletedFileEntry,
        resource,
        fileContent,
        { collapse: (tx) => this._collapse(resource, tx) },
        telemetryInfo,
        languageSelection.languageId
      );
      const entries2 = [...this._entriesObs.get(), entry];
      this._entriesObs.set(entries2, void 0);
    });
  }
  applyWorkspaceEdit(edit3, responseModel, undoStopId) {
    for (const fileEdit of edit3.edits) {
      if (fileEdit.oldResource && !fileEdit.newResource) {
        this.startDeletion(fileEdit.oldResource, responseModel, undoStopId);
      }
    }
  }
  async startExternalEdits(responseModel, operationId, resources, undoStopId, contentFor) {
    const snapshots = new ResourceMap();
    const acquiredLockPromises = [];
    const releaseLockPromises = [];
    const progress = [];
    const telemetryInfo = this._getTelemetryInfoForModel(responseModel);
    await chatEditingSessionIsReady(this);
    for (let i2 = 0; i2 < resources.length; i2++) {
      const resource = resources[i2];
      const contentSource = contentFor?.[i2];
      const releaseLock = new DeferredPromise();
      releaseLockPromises.push(releaseLock);
      const acquiredLock = new DeferredPromise();
      acquiredLockPromises.push(acquiredLock);
      this._streamingEditLocks.queue(resource.toString(), async () => {
        if (this.isDisposed) {
          acquiredLock.complete();
          return;
        }
        let initialContent;
        if (contentSource) {
          try {
            const data = await this._fileService.readFile(contentSource);
            initialContent = data.value.toString();
          } catch {
            initialContent = "";
          }
        }
        const entry = await this._getOrCreateModifiedFileEntry(resource, 1 /* Abort */, telemetryInfo, initialContent);
        if (entry) {
          await this._acceptStreamingEditsStart(responseModel, undoStopId, resource);
        }
        const notebookUri = CellUri.parse(resource)?.notebook || resource;
        progress.push(...createOpeningEditCodeBlock(resource, this._notebookService.hasSupportedNotebooks(notebookUri), undoStopId));
        if (initialContent !== void 0) {
          if (entry) {
            entry.initialContent = initialContent;
            await entry.resetEditTrackerToInitialContent();
          }
          snapshots.set(resource, initialContent);
        } else {
          await entry?.save();
          snapshots.set(resource, entry && this._getCurrentTextOrNotebookSnapshot(entry));
        }
        entry?.startExternalEdit();
        acquiredLock.complete();
        return releaseLock.p;
      });
    }
    await Promise.all(acquiredLockPromises.map((p) => p.p));
    this.createSnapshot(responseModel.requestId, undoStopId);
    this._externalEditOperations.set(operationId, {
      responseModel,
      snapshots,
      undoStopId,
      releaseLocks: () => releaseLockPromises.forEach((p) => p.complete())
    });
    return progress;
  }
  async stopExternalEdits(responseModel, operationId, contentFor) {
    const operation = this._externalEditOperations.get(operationId);
    if (!operation) {
      this._logService.warn(`stopExternalEdits called for unknown operation ${operationId}`);
      return [];
    }
    this._externalEditOperations.delete(operationId);
    const progress = [];
    try {
      const contentForMap = new ResourceMap();
      if (contentFor) {
        let idx = 0;
        for (const [resource] of operation.snapshots) {
          if (idx < contentFor.length && contentFor[idx]) {
            contentForMap.set(resource, contentFor[idx]);
          }
          idx++;
        }
      }
      for (const [resource, beforeSnapshot] of operation.snapshots) {
        let entry = this._getEntry(resource);
        if (!entry && beforeSnapshot === void 0) {
          entry = await this._getOrCreateModifiedFileEntry(resource, 1 /* Abort */, this._getTelemetryInfoForModel(responseModel), "");
          if (entry) {
            entry.startExternalEdit();
            entry.acceptStreamingEditsStart(responseModel, operation.undoStopId, void 0);
          }
        }
        if (!entry) {
          continue;
        }
        let afterSnapshot;
        const contentSource = contentForMap.get(resource);
        if (contentSource) {
          try {
            const data = await this._fileService.readFile(contentSource);
            afterSnapshot = data.value.toString();
          } catch (_e) {
            afterSnapshot = "";
          }
        } else {
          await entry.revertToDisk();
          afterSnapshot = this._getCurrentTextOrNotebookSnapshot(entry) ?? "";
        }
        let edits = [];
        if (beforeSnapshot === void 0) {
          this._timeline.recordFileOperation({
            type: "create" /* Create */,
            uri: resource,
            requestId: responseModel.requestId,
            epoch: this._timeline.incrementEpoch(),
            initialContent: afterSnapshot,
            telemetryInfo: entry.telemetryInfo
          });
        } else {
          edits = await entry.computeEditsFromSnapshots(beforeSnapshot, afterSnapshot);
          this._recordEditOperations(entry, resource, edits, responseModel);
        }
        progress.push(entry instanceof ChatEditingModifiedNotebookEntry ? {
          kind: "notebookEdit",
          uri: resource,
          edits,
          done: true,
          isExternalEdit: true
        } : {
          kind: "textEdit",
          uri: resource,
          edits,
          done: true,
          isExternalEdit: true
        });
        await entry.acceptStreamingEditsEnd();
        if (getChatSessionType(this.chatSessionResource) === AgentSessionProviders.Background) {
          await entry.accept();
        }
        entry.stopExternalEdit();
      }
    } finally {
      operation.releaseLocks();
      const hasOtherTasks = Iterable.some(this._streamingEditLocks.keys(), (k) => !operation.snapshots.has(URI.parse(k)));
      if (!hasOtherTasks) {
        this._state.set(2 /* Idle */, void 0);
      }
    }
    return progress;
  }
  async undoInteraction() {
    await this._timeline.undoToLastCheckpoint();
  }
  async redoInteraction() {
    await this._timeline.redoToNextCheckpoint();
  }
  async triggerExplanationGeneration() {
    this.clearExplanations();
    const entries2 = this._entriesObs.get();
    const diffInfos = [];
    for (const entry of entries2) {
      if (entry instanceof ChatEditingModifiedDocumentEntry) {
        const diff4 = await entry.getDiffInfo();
        diffInfos.push({
          changes: diff4.changes,
          identical: diff4.identical,
          originalModel: entry.originalModel,
          modifiedModel: entry.modifiedModel
        });
      }
    }
    if (diffInfos.length > 0) {
      this._explanationHandle = this._explanationModelManager.generateExplanations(diffInfos, this.chatSessionResource, CancellationToken.None);
      await this._explanationHandle.completed;
    }
  }
  clearExplanations() {
    if (this._explanationHandle) {
      this._explanationHandle.dispose();
      this._explanationHandle = void 0;
    }
  }
  hasExplanations() {
    return this._explanationHandle !== void 0;
  }
  _recordEditOperations(entry, resource, edits, responseModel) {
    const isNotebookEdits = edits.length > 0 && hasKey(edits[0], { cells: true });
    if (isNotebookEdits) {
      const notebookEdits = edits;
      this._timeline.recordFileOperation({
        type: "notebookEdit" /* NotebookEdit */,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        cellEdits: notebookEdits
      });
    } else {
      let cellIndex;
      if (entry instanceof ChatEditingModifiedNotebookEntry) {
        const cellUri = CellUri.parse(resource);
        if (cellUri) {
          const i2 = entry.getIndexOfCellHandle(cellUri.handle);
          if (i2 !== -1) {
            cellIndex = i2;
          }
        }
      }
      const textEdits = edits;
      this._timeline.recordFileOperation({
        type: "textEdit" /* TextEdit */,
        uri: resource,
        requestId: responseModel.requestId,
        epoch: this._timeline.incrementEpoch(),
        edits: textEdits,
        cellIndex
      });
    }
  }
  _getCurrentTextOrNotebookSnapshot(entry) {
    if (entry instanceof ChatEditingModifiedNotebookEntry) {
      return entry.getCurrentSnapshot();
    } else if (entry instanceof ChatEditingModifiedDocumentEntry) {
      return entry.getCurrentContents();
    } else if (entry instanceof ChatEditingDeletedFileEntry) {
      return "";
    } else {
      throw new Error(`unknown entry type for ${entry.modifiedURI}`);
    }
  }
  async _acceptStreamingEditsStart(responseModel, undoStop, resource) {
    const entry = await this._getOrCreateModifiedFileEntry(resource, 0 /* Create */, this._getTelemetryInfoForModel(responseModel));
    if (!this._timeline.hasFileBaseline(resource, responseModel.requestId)) {
      this._timeline.recordFileBaseline({
        uri: resource,
        requestId: responseModel.requestId,
        content: this._getCurrentTextOrNotebookSnapshot(entry),
        epoch: this._timeline.incrementEpoch(),
        telemetryInfo: entry.telemetryInfo,
        notebookViewType: entry instanceof ChatEditingModifiedNotebookEntry ? entry.viewType : void 0
      });
    }
    transaction((tx) => {
      this._state.set(1 /* StreamingEdits */, tx);
      entry.acceptStreamingEditsStart(responseModel, undoStop, tx);
    });
    return entry;
  }
  async _initEntries({ entries: entries2 }) {
    for (const entry of this._entriesObs.get()) {
      const snapshotEntry = entries2.get(entry.modifiedURI);
      if (!snapshotEntry) {
        await entry.resetToInitialContent();
        entry.dispose();
      }
    }
    const entriesArr = [];
    for (const snapshotEntry of entries2.values()) {
      let entry;
      if (snapshotEntry.isDeleted) {
        entry = this._instantiationService.createInstance(
          ChatEditingDeletedFileEntry,
          snapshotEntry.resource,
          snapshotEntry.original,
          // original content before deletion
          { collapse: (tx) => this._collapse(snapshotEntry.resource, tx) },
          snapshotEntry.telemetryInfo,
          snapshotEntry.languageId
        );
        await entry.restoreFromSnapshot(snapshotEntry, false);
      } else {
        entry = await this._getOrCreateModifiedFileEntry(snapshotEntry.resource, 1 /* Abort */, snapshotEntry.telemetryInfo);
        if (entry) {
          const restoreToDisk = snapshotEntry.state === 0 /* Modified */;
          await entry.restoreFromSnapshot(snapshotEntry, restoreToDisk);
        }
      }
      if (entry) {
        entriesArr.push(entry);
      }
    }
    this._entriesObs.set(entriesArr, void 0);
    this._reportSessionInfo("chatEditing/sessionRestore", entriesArr);
  }
  async _acceptEdits(resource, textEdits, isLastEdits, responseModel) {
    const entry = await this._getOrCreateModifiedFileEntry(resource, 0 /* Create */, this._getTelemetryInfoForModel(responseModel));
    if (textEdits.length > 0) {
      this._recordEditOperations(entry, resource, textEdits, responseModel);
    }
    await entry.acceptAgentEdits(resource, textEdits, isLastEdits, responseModel);
  }
  _getTelemetryInfoForModel(responseModel) {
    return new class {
      get agentId() {
        return responseModel.agent?.id;
      }
      get modelId() {
        return responseModel.request?.modelId;
      }
      get modeId() {
        return responseModel.request?.modeInfo?.telemetryModeId;
      }
      get command() {
        return responseModel.slashCommand?.name;
      }
      get sessionResource() {
        return responseModel.session.sessionResource;
      }
      get requestId() {
        return responseModel.requestId;
      }
      get result() {
        return responseModel.result;
      }
      get applyCodeBlockSuggestionId() {
        return responseModel.request?.modeInfo?.applyCodeBlockSuggestionId;
      }
      get feature() {
        if (responseModel.session.initialLocation === "panel" /* Chat */) {
          return "sideBarChat";
        } else if (responseModel.session.initialLocation === "editor" /* EditorInline */) {
          return "inlineChat";
        }
        return void 0;
      }
    }();
  }
  _reportSessionInfo(eventName, entries2) {
    const editSessionId = getKeyForChatSessionResource(this.chatSessionResource);
    if (isStringInSample(editSessionId, 5)) {
      this._telemetryService.publicLog2(eventName, {
        editSessionId,
        ...this._countEntryStates(entries2)
      });
    }
  }
  _countEntryStates(entries2) {
    let entryCount = 0;
    let modifiedCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;
    for (const entry of entries2) {
      entryCount += 1;
      switch (entry.state.get()) {
        case 0 /* Modified */:
          modifiedCount += 1;
          break;
        case 1 /* Accepted */:
          acceptedCount += 1;
          break;
        case 2 /* Rejected */:
          rejectedCount += 1;
          break;
      }
    }
    return { entryCount, modifiedCount, acceptedCount, rejectedCount };
  }
  async _resolve(requestId, undoStop, resource) {
    const hasOtherTasks = Iterable.some(this._streamingEditLocks.keys(), (k) => k !== resource.toString());
    if (!hasOtherTasks) {
      this._state.set(2 /* Idle */, void 0);
    }
    const entry = this._getEntry(resource);
    if (!entry) {
      return;
    }
    const label3 = undoStop ? `Request ${requestId} - Stop ${undoStop}` : `Request ${requestId}`;
    this._timeline.createCheckpoint(requestId, undoStop, label3);
    return entry.acceptStreamingEditsEnd();
  }
  async _getOrCreateModifiedFileEntry(resource, ifNotExists, telemetryInfo, _initialContent) {
    resource = CellUri.parse(resource)?.notebook ?? resource;
    const existingEntry = this._entriesObs.get().find((e) => isEqual2(e.modifiedURI, resource));
    if (existingEntry) {
      if (existingEntry instanceof ChatEditingDeletedFileEntry) {
        const initialContentFromDeleted = existingEntry.state.get() === 0 /* Modified */ ? existingEntry.initialContent : void 0;
        existingEntry.dispose();
        const entries2 = this._entriesObs.get().filter((e) => e !== existingEntry);
        this._entriesObs.set(entries2, void 0);
        if (initialContentFromDeleted !== void 0) {
          _initialContent = initialContentFromDeleted;
        }
      } else {
        if (telemetryInfo.requestId !== existingEntry.telemetryInfo.requestId) {
          existingEntry.updateTelemetryInfo(telemetryInfo);
        }
        return existingEntry;
      }
    }
    let entry;
    const existingExternalEntry = this._lookupExternalEntry(resource);
    if (existingExternalEntry) {
      entry = existingExternalEntry;
      if (telemetryInfo.requestId !== entry.telemetryInfo.requestId) {
        entry.updateTelemetryInfo(telemetryInfo);
      }
    } else {
      const initialContent = _initialContent ?? this._initialFileContents.get(resource);
      const maybeEntry = await this._createModifiedFileEntry(resource, telemetryInfo, ifNotExists, initialContent);
      if (!maybeEntry) {
        return void 0;
      }
      entry = maybeEntry;
      if (initialContent === void 0) {
        this._initialFileContents.set(resource, entry.initialContent);
      }
    }
    const listener = entry.onDidDelete(() => {
      const newEntries = this._entriesObs.get().filter((e) => !isEqual2(e.modifiedURI, entry.modifiedURI));
      this._entriesObs.set(newEntries, void 0);
      this._editorService.closeEditors(this._editorService.findEditors(entry.modifiedURI));
      if (!existingExternalEntry) {
        entry.dispose();
      }
      this._store.delete(listener);
    });
    this._store.add(listener);
    const entriesArr = [...this._entriesObs.get(), entry];
    this._entriesObs.set(entriesArr, void 0);
    return entry;
  }
  async _createModifiedFileEntry(resource, telemetryInfo, ifNotExists, initialContent) {
    const multiDiffEntryDelegate = {
      collapse: (transaction2) => this._collapse(resource, transaction2),
      recordOperation: (operation) => {
        operation.epoch = this._timeline.incrementEpoch();
        this._timeline.recordFileOperation(operation);
      }
    };
    const notebookUri = CellUri.parse(resource)?.notebook || resource;
    const doCreate = async (chatKind) => {
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(notebookUri, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent, this._instantiationService);
      } else {
        const ref = await this._textModelService.createModelReference(resource);
        return this._instantiationService.createInstance(ChatEditingModifiedDocumentEntry, ref, multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent);
      }
    };
    try {
      return await doCreate(1 /* Modified */);
    } catch (err) {
      if (ifNotExists === 1 /* Abort */) {
        return void 0;
      }
      await this._bulkEditService.apply({ edits: [{ newResource: resource }] });
      if (this.configurationService.getValue("accessibility.openChatEditedFiles")) {
        this._editorService.openEditor({ resource, options: { inactive: true, preserveFocus: true, pinned: true, isExplicit: false } });
      }
      this._timeline.recordFileOperation({
        type: "create" /* Create */,
        uri: resource,
        requestId: telemetryInfo.requestId,
        epoch: this._timeline.incrementEpoch(),
        initialContent: initialContent || "",
        telemetryInfo
      });
      if (this._notebookService.hasSupportedNotebooks(notebookUri)) {
        return await ChatEditingModifiedNotebookEntry.create(resource, multiDiffEntryDelegate, telemetryInfo, 0 /* Created */, initialContent, this._instantiationService);
      } else {
        return await doCreate(0 /* Created */);
      }
    }
  }
  _collapse(resource, transaction2) {
    const multiDiffItem = this._editorPane?.findDocumentDiffItem(resource);
    if (multiDiffItem) {
      this._editorPane?.viewModel?.items.get().find((documentDiffItem) => isEqual2(documentDiffItem.originalUri, multiDiffItem.originalUri) && isEqual2(documentDiffItem.modifiedUri, multiDiffItem.modifiedUri))?.collapsed.set(true, transaction2);
    }
  }
};

ChatEditingSession = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IModelService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, ITextModelService),
  __decorateParam(8, IBulkEditService),
  __decorateParam(9, IEditorGroupsService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, INotebookService),
  __decorateParam(12, IAccessibilitySignalService),
  __decorateParam(13, ILogService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IFileService),
  __decorateParam(16, IChatEditingExplanationModelManager),
  __decorateParam(17, ITelemetryService)
], ChatEditingSession);
export { createOpeningEditCodeBlock, ThrottledSequencer, ChatEditingSession };
