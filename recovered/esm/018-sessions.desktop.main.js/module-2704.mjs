// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingModifiedNotebookEntry.ts
import { AbstractChatEditingModifiedFileEntry } from "./module-2686.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { SnapshotComparer, createSnapshot, deserializeSnapshot, getNotebookSnapshotFileURI, restoreSnapshot } from "./module-2688.mjs";
import { INotebookService } from "./module-0927.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Schemas } from "./module-0033.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { streamToBuffer } from "./module-0038.mjs";
import { DisposableStore, thenRegisterOrDispose } from "./module-0012.mjs";
import { ChatEditingNotebookFileSystemProvider } from "./module-2702.mjs";
import { countChanges, sortCellChanges } from "./module-2699.mjs";
import { computeDiff2 } from "./module-1954.mjs";
import { adjustCellDiffAndOriginalModelBasedOnCellAddDelete, adjustCellDiffAndOriginalModelBasedOnCellMovements, adjustCellDiffForKeepingAnInsertedCell, adjustCellDiffForRevertingADeletedCell, adjustCellDiffForRevertingAnInsertedCell, calculateNotebookRewriteRatio, getCorrespondingOriginalCellIndex, isTransientIPyNbExtensionEvent } from "./module-2703.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { NotebookTextDiffEditor } from "./module-1964.mjs";
import { ChatEditingNotebookDiffEditorIntegration, ChatEditingNotebookEditorIntegration } from "./module-2701.mjs";
import { assertType } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { TextEdit } from "./module-0164.mjs";
import { ChatEditingNewNotebookContentEdits } from "./module-2696.mjs";
import { transaction } from "./module-0045.mjs";
import { nullDocumentDiff } from "./module-2693.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { Range2 } from "./module-0106.mjs";
import { DetailedLineRangeMapping, RangeMapping } from "./module-0179.mjs";
import { LineRange } from "./module-0174.mjs";
import { ChatEditingNotebookCellEntry } from "./module-2697.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IChatService } from "./module-0973.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { INotebookEditorWorkerService } from "./module-1952.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { StringSHA1 } from "./module-0039.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingModifiedNotebookEntry.ts
var SnapshotLanguageId = "VSCodeChatNotebookSnapshotLanguage";

var ChatEditingModifiedNotebookEntry = class extends AbstractChatEditingModifiedFileEntry {
  constructor(modifiedResourceRef, originalResourceRef, _multiDiffEntryDelegate, transientOptions, telemetryInfo, kind, initialContent, configurationService, fileConfigService, chatService, fileService, instantiationService, textModelService, modelService, undoRedoService, notebookEditorWorkerService, loggingService, notebookResolver, aiEditTelemetryService) {
    super(modifiedResourceRef.object.notebook.uri, telemetryInfo, kind, configurationService, fileConfigService, chatService, fileService, undoRedoService, instantiationService, aiEditTelemetryService);
    this.modifiedResourceRef = modifiedResourceRef;
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this.transientOptions = transientOptions;
    this.configurationService = configurationService;
    this.textModelService = textModelService;
    this.modelService = modelService;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.loggingService = loggingService;
    this.notebookResolver = notebookResolver;
    /**
     * Whether we're still generating diffs from a response.
     */
    this._isProcessingResponse = observableValue("isProcessingResponse", false);
    this._isEditFromUs = false;
    /**
     * Whether all edits are from us, e.g. is possible a user has made edits, then this will be false.
     */
    this._allEditsAreFromUs = true;
    this._changesCount = observableValue(this, 0);
    this.changesCount = this._changesCount;
    this.cellEntryMap = new ResourceMap();
    this.modifiedToOriginalCell = new ResourceMap();
    this._cellsDiffInfo = observableValue("diffInfo", []);
    /**
     * List of Cell URIs that are edited,
     * Will be cleared once all edits have been accepted.
     * I.e. this will only contain URIS while acceptAgentEdits is being called & before `isLastEdit` is sent.
     * I.e. this is populated only when edits are being streamed.
     */
    this.editedCells = new ResourceSet();
    this.computeRequestId = 0;
    this.cellTextModelMap = new ResourceMap();
    this.initialContentComparer = new SnapshotComparer(initialContent);
    this.modifiedModel = this._register(modifiedResourceRef).object.notebook;
    this.originalModel = this._register(originalResourceRef).object.notebook;
    this.originalURI = this.originalModel.uri;
    this.initialContent = initialContent;
    this.initializeModelsFromDiff();
    this._register(this.modifiedModel.onDidChangeContent(this.mirrorNotebookEdits, this));
  }
  static {
    this.NewModelCounter = 0;
  }
  get isProcessingResponse() {
    return this._isProcessingResponse;
  }
  get cellsDiffInfo() {
    return this._cellsDiffInfo;
  }
  get viewType() {
    return this.modifiedModel.viewType;
  }
  static async create(uri4, _multiDiffEntryDelegate, telemetryInfo, chatKind, initialContent, instantiationService) {
    return instantiationService.invokeFunction(async (accessor) => {
      const notebookService = accessor.get(INotebookService);
      const resolver = accessor.get(INotebookEditorModelResolverService);
      const configurationServie = accessor.get(IConfigurationService);
      const resourceRef = await resolver.resolve(uri4);
      const notebook = resourceRef.object.notebook;
      const originalUri = getNotebookSnapshotFileURI(telemetryInfo.sessionResource, telemetryInfo.requestId, generateUuid(), notebook.uri.scheme === Schemas.untitled ? `/${notebook.uri.path}` : notebook.uri.path, notebook.viewType);
      const [options3, buffer] = await Promise.all([
        notebookService.withNotebookDataProvider(resourceRef.object.notebook.notebookType),
        notebookService.createNotebookTextDocumentSnapshot(notebook.uri, 2 /* Backup */, CancellationToken.None).then((s) => streamToBuffer(s))
      ]);
      const disposables = new DisposableStore();
      disposables.add(ChatEditingNotebookFileSystemProvider.registerFile(originalUri, buffer));
      const originalRef = await resolver.resolve(originalUri, notebook.viewType);
      if (initialContent !== void 0) {
        try {
          restoreSnapshot(originalRef.object.notebook, initialContent);
        } catch (ex) {
          console.error(`Error restoring snapshot: ${initialContent}`, ex);
          initialContent = createSnapshot(notebook, options3.serializer.options, configurationServie);
        }
      } else {
        initialContent = createSnapshot(notebook, options3.serializer.options, configurationServie);
        restoreSnapshot(originalRef.object.notebook, initialContent);
        const edits = [];
        notebook.cells.forEach((cell, index2) => {
          const internalId = generateCellHash(cell.uri);
          edits.push({ editType: 9 /* PartialInternalMetadata */, index: index2, internalMetadata: { internalId } });
        });
        resourceRef.object.notebook.applyEdits(edits, true, void 0, () => void 0, void 0, false);
        originalRef.object.notebook.applyEdits(edits, true, void 0, () => void 0, void 0, false);
      }
      const instance2 = instantiationService.createInstance(ChatEditingModifiedNotebookEntry, resourceRef, originalRef, _multiDiffEntryDelegate, options3.serializer.options, telemetryInfo, chatKind, initialContent);
      instance2._register(disposables);
      return instance2;
    });
  }
  static canHandleSnapshotContent(initialContent) {
    if (!initialContent) {
      return false;
    }
    try {
      deserializeSnapshot(initialContent);
      return true;
    } catch (ex) {
      return false;
    }
  }
  static canHandleSnapshot(snapshot) {
    if (snapshot.languageId === SnapshotLanguageId && ChatEditingModifiedNotebookEntry.canHandleSnapshotContent(snapshot.current)) {
      return true;
    }
    return false;
  }
  initializeModelsFromDiffImpl(cellsDiffInfo) {
    this.cellEntryMap.forEach((entry) => entry.dispose());
    this.cellEntryMap.clear();
    const diffs = cellsDiffInfo.map((cellDiff, i2) => {
      switch (cellDiff.type) {
        case "delete":
          return this.createDeleteCellDiffInfo(cellDiff.originalCellIndex);
        case "insert":
          return this.createInsertedCellDiffInfo(cellDiff.modifiedCellIndex);
        default:
          return this.createModifiedCellDiffInfo(cellDiff.modifiedCellIndex, cellDiff.originalCellIndex);
      }
    });
    this._cellsDiffInfo.set(diffs, void 0);
    this._changesCount.set(countChanges(diffs), void 0);
  }
  getIndexOfCellHandle(handle2) {
    return this.modifiedModel.cells.findIndex((c) => c.handle === handle2);
  }
  async initializeModelsFromDiff() {
    const id2 = ++this.computeRequestId;
    if (this._areOriginalAndModifiedIdenticalImpl()) {
      const cellsDiffInfo2 = this.modifiedModel.cells.map((_, index2) => {
        return { type: "unchanged", originalCellIndex: index2, modifiedCellIndex: index2 };
      });
      this.initializeModelsFromDiffImpl(cellsDiffInfo2);
      return;
    }
    const cellsDiffInfo = [];
    try {
      this._isProcessingResponse.set(true, void 0);
      const notebookDiff = await this.notebookEditorWorkerService.computeDiff(this.originalURI, this.modifiedURI);
      if (id2 !== this.computeRequestId || this._store.isDisposed) {
        return;
      }
      const result = computeDiff2(this.originalModel, this.modifiedModel, notebookDiff);
      if (result.cellDiffInfo.length) {
        cellsDiffInfo.push(...result.cellDiffInfo);
      }
    } catch (ex) {
      this.loggingService.error("Notebook Chat", "Error computing diff:\n" + ex);
    } finally {
      this._isProcessingResponse.set(false, void 0);
    }
    this.initializeModelsFromDiffImpl(cellsDiffInfo);
  }
  updateCellDiffInfo(cellsDiffInfo, transcation) {
    this._cellsDiffInfo.set(sortCellChanges(cellsDiffInfo), transcation);
    this._changesCount.set(countChanges(cellsDiffInfo), transcation);
  }
  mirrorNotebookEdits(e4) {
    if (this._isEditFromUs || this._isExternalEditInProgress || Array.from(this.cellEntryMap.values()).some((entry) => entry.isEditFromUs)) {
      return;
    }
    let didResetToOriginalContent = this.initialContentComparer.isEqual(this.modifiedModel);
    const currentState = this._stateObs.get();
    if (currentState === 0 /* Modified */ && didResetToOriginalContent) {
      this._stateObs.set(2 /* Rejected */, void 0);
      this.updateCellDiffInfo([], void 0);
      this.initializeModelsFromDiff();
      this._notifySessionAction("rejected");
      return;
    }
    if (!e4.rawEvents.length) {
      return;
    }
    if (currentState === 2 /* Rejected */) {
      return;
    }
    if (isTransientIPyNbExtensionEvent(this.modifiedModel.notebookType, e4)) {
      return;
    }
    this._allEditsAreFromUs = false;
    this._userEditScheduler.schedule();
    for (const event of e4.rawEvents.filter((event2) => event2.kind !== 10 /* ChangeCellContent */)) {
      switch (event.kind) {
        case 11 /* ChangeDocumentMetadata */: {
          const edit3 = {
            editType: 5 /* DocumentMetadata */,
            metadata: this.modifiedModel.metadata
          };
          this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
          break;
        }
        case 1 /* ModelChange */: {
          let cellDiffs = sortCellChanges(this._cellsDiffInfo.get());
          this._applyEditsSync(() => {
            event.changes.forEach((change) => {
              change[2].forEach((cell, i2) => {
                if (cell.internalMetadata.internalId) {
                  return;
                }
                const index2 = change[0] + i2;
                const internalId = generateCellHash(cell.uri);
                const edits = [{ editType: 9 /* PartialInternalMetadata */, index: index2, internalMetadata: { internalId } }];
                this.modifiedModel.applyEdits(edits, true, void 0, () => void 0, void 0, false);
                cell.internalMetadata ??= {};
                cell.internalMetadata.internalId = internalId;
              });
            });
          });
          event.changes.forEach((change) => {
            cellDiffs = adjustCellDiffAndOriginalModelBasedOnCellAddDelete(
              change,
              cellDiffs,
              this.modifiedModel.cells.length,
              this.originalModel.cells.length,
              this.originalModel.applyEdits.bind(this.originalModel),
              this.createModifiedCellDiffInfo.bind(this)
            );
          });
          this.updateCellDiffInfo(cellDiffs, void 0);
          this.disposeDeletedCellEntries();
          break;
        }
        case 5 /* ChangeCellLanguage */: {
          const index2 = getCorrespondingOriginalCellIndex(event.index, this._cellsDiffInfo.get());
          if (typeof index2 === "number") {
            const edit3 = {
              editType: 4 /* CellLanguage */,
              index: index2,
              language: event.language
            };
            this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
          }
          break;
        }
        case 7 /* ChangeCellMetadata */: {
          const index2 = getCorrespondingOriginalCellIndex(event.index, this._cellsDiffInfo.get());
          if (typeof index2 === "number") {
            const edit3 = {
              editType: 3 /* Metadata */,
              index: index2,
              metadata: event.metadata
            };
            this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
          }
          break;
        }
        case 13 /* ChangeCellMime */:
          break;
        case 12 /* ChangeCellInternalMetadata */: {
          const index2 = getCorrespondingOriginalCellIndex(event.index, this._cellsDiffInfo.get());
          if (typeof index2 === "number") {
            const edit3 = {
              editType: 9 /* PartialInternalMetadata */,
              index: index2,
              internalMetadata: event.internalMetadata
            };
            this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
          }
          break;
        }
        case 8 /* Output */: {
          const index2 = getCorrespondingOriginalCellIndex(event.index, this._cellsDiffInfo.get());
          if (typeof index2 === "number") {
            const edit3 = {
              editType: 2 /* Output */,
              index: index2,
              append: event.append,
              outputs: event.outputs
            };
            this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
          }
          break;
        }
        case 9 /* OutputItem */: {
          break;
        }
        case 2 /* Move */: {
          const result = adjustCellDiffAndOriginalModelBasedOnCellMovements(event, this._cellsDiffInfo.get().slice());
          if (result) {
            this.originalModel.applyEdits(result[1], true, void 0, () => void 0, void 0, false);
            this._cellsDiffInfo.set(result[0], void 0);
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    didResetToOriginalContent = this.initialContentComparer.isEqual(this.modifiedModel);
    if (currentState === 0 /* Modified */ && didResetToOriginalContent) {
      this._stateObs.set(2 /* Rejected */, void 0);
      this.updateCellDiffInfo([], void 0);
      this.initializeModelsFromDiff();
      return;
    }
  }
  async _doAccept() {
    this.updateCellDiffInfo([], void 0);
    const snapshot = createSnapshot(this.modifiedModel, this.transientOptions, this.configurationService);
    restoreSnapshot(this.originalModel, snapshot);
    this.initializeModelsFromDiff();
    await this._collapse(void 0);
    const config = this._fileConfigService.getAutoSaveConfiguration(this.modifiedURI);
    if (this.modifiedModel.uri.scheme !== Schemas.untitled && (!config.autoSave || !this.notebookResolver.isDirty(this.modifiedURI))) {
      await this._applyEdits(async () => {
        try {
          await this.modifiedResourceRef.object.save({
            reason: 1 /* EXPLICIT */,
            force: true
          });
        } catch {
        }
      });
    }
  }
  async _doReject() {
    this.updateCellDiffInfo([], void 0);
    if (this.createdInRequestId === this._telemetryInfo.requestId) {
      await this._applyEdits(async () => {
        await this.modifiedResourceRef.object.revert({ soft: true });
        await this._fileService.del(this.modifiedURI);
      });
      this._onDidDelete.fire();
    } else {
      await this._applyEdits(async () => {
        const snapshot = createSnapshot(this.originalModel, this.transientOptions, this.configurationService);
        this.restoreSnapshotInModifiedModel(snapshot);
        if (this._allEditsAreFromUs && Array.from(this.cellEntryMap.values()).every((entry) => entry.allEditsAreFromUs)) {
          await this.modifiedResourceRef.object.save({ reason: 1 /* EXPLICIT */, skipSaveParticipants: true });
        }
      });
      this.initializeModelsFromDiff();
      await this._collapse(void 0);
    }
  }
  async _collapse(transaction2) {
    this._multiDiffEntryDelegate.collapse(transaction2);
  }
  _createEditorIntegration(editor) {
    const notebookEditor = getNotebookEditorFromEditorPane(editor);
    if (!notebookEditor && editor.getId() === NotebookTextDiffEditor.ID) {
      const diffEditor = editor.getControl();
      return this._instantiationService.createInstance(ChatEditingNotebookDiffEditorIntegration, diffEditor, this._cellsDiffInfo);
    }
    assertType(notebookEditor);
    return this._instantiationService.createInstance(ChatEditingNotebookEditorIntegration, this, editor, this.modifiedModel, this.originalModel, this._cellsDiffInfo);
  }
  _resetEditsState(tx) {
    super._resetEditsState(tx);
    this.cellEntryMap.forEach((entry) => !entry.isDisposed && entry.clearCurrentEditLineDecoration());
  }
  _createUndoRedoElement(response) {
    const request2 = response.session.getRequests().find((req) => req.id === response.requestId);
    const label3 = request2?.message.text ? localize(10879, null, request2.message.text) : localize(10880, null);
    const transientOptions = this.transientOptions;
    const outputSizeLimit = this.configurationService.getValue(NotebookSetting.outputBackupSizeLimit) * 1024;
    let initial = createSnapshot(this.modifiedModel, transientOptions, outputSizeLimit);
    let last = "";
    let redoState = 2 /* Rejected */;
    return {
      type: 0 /* Resource */,
      resource: this.modifiedURI,
      label: label3,
      code: "chat.edit",
      confirmBeforeUndo: false,
      undo: async () => {
        last = createSnapshot(this.modifiedModel, transientOptions, outputSizeLimit);
        this._isEditFromUs = true;
        try {
          restoreSnapshot(this.modifiedModel, initial);
          restoreSnapshot(this.originalModel, initial);
        } finally {
          this._isEditFromUs = false;
        }
        redoState = this._stateObs.get() === 1 /* Accepted */ ? 1 /* Accepted */ : 2 /* Rejected */;
        this._stateObs.set(2 /* Rejected */, void 0);
        this.updateCellDiffInfo([], void 0);
        this.initializeModelsFromDiff();
        this._notifySessionAction("userModified");
      },
      redo: async () => {
        initial = createSnapshot(this.modifiedModel, transientOptions, outputSizeLimit);
        this._isEditFromUs = true;
        try {
          restoreSnapshot(this.modifiedModel, last);
          restoreSnapshot(this.originalModel, last);
        } finally {
          this._isEditFromUs = false;
        }
        this._stateObs.set(redoState, void 0);
        this.updateCellDiffInfo([], void 0);
        this.initializeModelsFromDiff();
        this._notifySessionAction("userModified");
      }
    };
  }
  async _areOriginalAndModifiedIdentical() {
    return this._areOriginalAndModifiedIdenticalImpl();
  }
  _areOriginalAndModifiedIdenticalImpl() {
    const snapshot = createSnapshot(this.originalModel, this.transientOptions, this.configurationService);
    return new SnapshotComparer(snapshot).isEqual(this.modifiedModel);
  }
  async acceptAgentEdits(resource, edits, isLastEdits, responseModel) {
    const isCellUri = resource.scheme === Schemas.vscodeNotebookCell;
    const cell = isCellUri && this.modifiedModel.cells.find((cell2) => isEqual2(cell2.uri, resource));
    let cellEntry;
    if (cell) {
      const index2 = this.modifiedModel.cells.indexOf(cell);
      const entry = this._cellsDiffInfo.get().slice().find((entry2) => entry2.modifiedCellIndex === index2);
      if (!entry) {
        console.error("Original cell model not found");
        return;
      }
      cellEntry = this.getOrCreateModifiedTextFileEntryForCell(cell, await entry.modifiedModel.promise, await entry.originalModel.promise);
    }
    const finishPreviousCells = async () => {
      await Promise.all(Array.from(this.editedCells).map(async (uri4) => {
        const cell2 = this.modifiedModel.cells.find((cell3) => isEqual2(cell3.uri, uri4));
        const cellEntry2 = cell2 && this.cellEntryMap.get(cell2.uri);
        await cellEntry2?.acceptAgentEdits([], true, responseModel);
      }));
      this.editedCells.clear();
    };
    await this._applyEdits(async () => {
      await Promise.all(edits.map(async (edit3, idx) => {
        const last = isLastEdits && idx === edits.length - 1;
        if (TextEdit.isTextEdit(edit3)) {
          if (isEqual2(resource, this.modifiedModel.uri)) {
            this.newNotebookEditGenerator ??= this._instantiationService.createInstance(ChatEditingNewNotebookContentEdits, this.modifiedModel);
            this.newNotebookEditGenerator.acceptTextEdits([edit3]);
          } else {
            this.newNotebookEditGenerator = void 0;
            if (!this.editedCells.has(resource)) {
              await finishPreviousCells();
              this.editedCells.add(resource);
            }
            await cellEntry?.acceptAgentEdits([edit3], last, responseModel);
          }
        } else {
          this.newNotebookEditGenerator = void 0;
          this.acceptNotebookEdit(edit3);
        }
      }));
    });
    if (isLastEdits) {
      await finishPreviousCells();
    }
    isLastEdits = !isCellUri && isLastEdits;
    if (isLastEdits && this.newNotebookEditGenerator) {
      const notebookEdits = await this.newNotebookEditGenerator.generateEdits();
      this.newNotebookEditGenerator = void 0;
      notebookEdits.forEach((edit3) => this.acceptNotebookEdit(edit3));
    }
    transaction((tx) => {
      this._waitsForLastEdits.set(!isLastEdits, tx);
      this._stateObs.set(0 /* Modified */, tx);
      if (!isLastEdits) {
        const newRewriteRation = Math.max(this._rewriteRatioObs.get(), calculateNotebookRewriteRatio(this._cellsDiffInfo.get(), this.originalModel, this.modifiedModel));
        this._rewriteRatioObs.set(Math.min(1, newRewriteRation), tx);
      } else {
        this.editedCells.clear();
        this._resetEditsState(tx);
        this._rewriteRatioObs.set(1, tx);
      }
    });
    if (isLastEdits && this._shouldAutoSave()) {
      await this.modifiedResourceRef.object.save({
        reason: 2 /* AUTO */,
        skipSaveParticipants: true
      });
    }
  }
  disposeDeletedCellEntries() {
    const cellsUris = new ResourceSet(this.modifiedModel.cells.map((cell) => cell.uri));
    Array.from(this.cellEntryMap.keys()).forEach((uri4) => {
      if (cellsUris.has(uri4)) {
        return;
      }
      this.cellEntryMap.get(uri4)?.dispose();
      this.cellEntryMap.delete(uri4);
    });
  }
  acceptNotebookEdit(edit3) {
    this.modifiedModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
    this.disposeDeletedCellEntries();
    if (edit3.editType !== 1 /* Replace */) {
      return;
    }
    edit3.cells.forEach((_, i2) => {
      const index2 = edit3.index + i2;
      const cell = this.modifiedModel.cells[index2];
      if (cell.internalMetadata.internalId) {
        return;
      }
      const internalId = generateCellHash(cell.uri);
      const edits = [{ editType: 9 /* PartialInternalMetadata */, index: index2, internalMetadata: { internalId } }];
      this.modifiedModel.applyEdits(edits, true, void 0, () => void 0, void 0, false);
    });
    let diff4 = [];
    if (edit3.count === 0) {
      diff4 = sortCellChanges(this._cellsDiffInfo.get());
      diff4.forEach((d) => {
        if (d.type !== "delete" && d.modifiedCellIndex >= edit3.index) {
          d.modifiedCellIndex += edit3.cells.length;
        }
      });
      const diffInsert = edit3.cells.map((_, i2) => this.createInsertedCellDiffInfo(edit3.index + i2));
      diff4.splice(edit3.index, 0, ...diffInsert);
    } else {
      diff4 = sortCellChanges(this._cellsDiffInfo.get()).map((d) => {
        if (d.type === "unchanged" && d.modifiedCellIndex >= edit3.index && d.modifiedCellIndex <= edit3.index + edit3.count - 1) {
          return this.createDeleteCellDiffInfo(d.originalCellIndex);
        }
        if (d.type !== "delete" && d.modifiedCellIndex >= edit3.index + edit3.count) {
          d.modifiedCellIndex -= edit3.count;
          return d;
        }
        return d;
      });
    }
    this.updateCellDiffInfo(diff4, void 0);
  }
  computeStateAfterAcceptingRejectingChanges(accepted) {
    const currentSnapshot = createSnapshot(this.modifiedModel, this.transientOptions, this.configurationService);
    if (new SnapshotComparer(currentSnapshot).isEqual(this.originalModel)) {
      const state = accepted ? 1 /* Accepted */ : 2 /* Rejected */;
      this._stateObs.set(state, void 0);
      this._notifySessionAction(accepted ? "accepted" : "rejected");
    }
  }
  createModifiedCellDiffInfo(modifiedCellIndex, originalCellIndex) {
    const modifiedCell = this.modifiedModel.cells[modifiedCellIndex];
    const originalCell = this.originalModel.cells[originalCellIndex];
    this.modifiedToOriginalCell.set(modifiedCell.uri, originalCell.uri);
    const modifiedCellModelPromise = this.resolveCellModel(modifiedCell.uri);
    const originalCellModelPromise = this.resolveCellModel(originalCell.uri);
    Promise.all([modifiedCellModelPromise, originalCellModelPromise]).then(([modifiedCellModel, originalCellModel]) => {
      this.getOrCreateModifiedTextFileEntryForCell(modifiedCell, modifiedCellModel, originalCellModel);
    });
    const diff4 = observableValue("diff", nullDocumentDiff);
    const unchangedCell = {
      type: "unchanged",
      modifiedCellIndex,
      originalCellIndex,
      keep: async (changes) => {
        const [modifiedCellModel, originalCellModel] = await Promise.all([modifiedCellModelPromise, originalCellModelPromise]);
        const entry = this.getOrCreateModifiedTextFileEntryForCell(modifiedCell, modifiedCellModel, originalCellModel);
        return entry ? entry.keep(changes) : false;
      },
      undo: async (changes) => {
        const [modifiedCellModel, originalCellModel] = await Promise.all([modifiedCellModelPromise, originalCellModelPromise]);
        const entry = this.getOrCreateModifiedTextFileEntryForCell(modifiedCell, modifiedCellModel, originalCellModel);
        return entry ? entry.undo(changes) : false;
      },
      modifiedModel: new ObservablePromise(modifiedCellModelPromise),
      originalModel: new ObservablePromise(originalCellModelPromise),
      diff: diff4
    };
    return unchangedCell;
  }
  createInsertedCellDiffInfo(modifiedCellIndex) {
    const cell = this.modifiedModel.cells[modifiedCellIndex];
    const lines = cell.getValue().split(/\r?\n/);
    const originalRange = new Range2(1, 0, 1, 0);
    const modifiedRange = new Range2(1, 0, lines.length, lines[lines.length - 1].length);
    const innerChanges = new RangeMapping(originalRange, modifiedRange);
    const changes = [new DetailedLineRangeMapping(new LineRange(1, 1), new LineRange(1, lines.length), [innerChanges])];
    const originalModelUri = this.modifiedModel.uri.with({ query: (ChatEditingModifiedNotebookEntry.NewModelCounter++).toString(), scheme: "emptyCell" });
    const originalModel = this.modelService.getModel(originalModelUri) || this._register(this.modelService.createModel("", null, originalModelUri));
    this.modifiedToOriginalCell.set(cell.uri, originalModelUri);
    const keep = async () => {
      this._applyEditsSync(() => this.keepPreviouslyInsertedCell(cell));
      this.computeStateAfterAcceptingRejectingChanges(true);
      return true;
    };
    const undo = async () => {
      this._applyEditsSync(() => this.undoPreviouslyInsertedCell(cell));
      this.computeStateAfterAcceptingRejectingChanges(false);
      return true;
    };
    this.resolveCellModel(cell.uri).then((modifiedModel) => {
      if (this._store.isDisposed) {
        return;
      }
      this.getOrCreateModifiedTextFileEntryForCell(cell, modifiedModel, originalModel);
    });
    return {
      type: "insert",
      originalCellIndex: void 0,
      modifiedCellIndex,
      keep,
      undo,
      modifiedModel: new ObservablePromise(this.resolveCellModel(cell.uri)),
      originalModel: new ObservablePromise(Promise.resolve(originalModel)),
      diff: observableValue("deletedCellDiff", {
        changes,
        identical: false,
        moves: [],
        quitEarly: false
      })
    };
  }
  createDeleteCellDiffInfo(originalCellIndex) {
    const originalCell = this.originalModel.cells[originalCellIndex];
    const lines = new Array(originalCell.textBuffer.getLineCount()).fill(0).map((_, i2) => originalCell.textBuffer.getLineContent(i2 + 1));
    const originalRange = new Range2(1, 0, lines.length, lines[lines.length - 1].length);
    const modifiedRange = new Range2(1, 0, 1, 0);
    const innerChanges = new RangeMapping(modifiedRange, originalRange);
    const changes = [new DetailedLineRangeMapping(new LineRange(1, lines.length), new LineRange(1, 1), [innerChanges])];
    const modifiedModelUri = this.modifiedModel.uri.with({ query: (ChatEditingModifiedNotebookEntry.NewModelCounter++).toString(), scheme: "emptyCell" });
    const modifiedModel = this.modelService.getModel(modifiedModelUri) || this._register(this.modelService.createModel("", null, modifiedModelUri));
    const keep = async () => {
      this._applyEditsSync(() => this.keepPreviouslyDeletedCell(this.originalModel.cells.indexOf(originalCell)));
      this.computeStateAfterAcceptingRejectingChanges(true);
      return true;
    };
    const undo = async () => {
      this._applyEditsSync(() => this.undoPreviouslyDeletedCell(this.originalModel.cells.indexOf(originalCell), originalCell));
      this.computeStateAfterAcceptingRejectingChanges(false);
      return true;
    };
    return {
      type: "delete",
      modifiedCellIndex: void 0,
      originalCellIndex,
      originalModel: new ObservablePromise(this.resolveCellModel(originalCell.uri)),
      modifiedModel: new ObservablePromise(Promise.resolve(modifiedModel)),
      keep,
      undo,
      diff: observableValue("cellDiff", {
        changes,
        identical: false,
        moves: [],
        quitEarly: false
      })
    };
  }
  undoPreviouslyInsertedCell(cell) {
    let diffs = [];
    this._applyEditsSync(() => {
      const index2 = this.modifiedModel.cells.indexOf(cell);
      diffs = adjustCellDiffForRevertingAnInsertedCell(
        index2,
        this._cellsDiffInfo.get(),
        this.modifiedModel.applyEdits.bind(this.modifiedModel)
      );
    });
    this.disposeDeletedCellEntries();
    this.updateCellDiffInfo(diffs, void 0);
  }
  keepPreviouslyInsertedCell(cell) {
    const modifiedCellIndex = this.modifiedModel.cells.indexOf(cell);
    if (modifiedCellIndex === -1) {
      return;
    }
    const cellToInsert = {
      cellKind: cell.cellKind,
      language: cell.language,
      metadata: cell.metadata,
      outputs: cell.outputs,
      source: cell.getValue(),
      mime: cell.mime,
      internalMetadata: {
        internalId: cell.internalMetadata.internalId
      }
    };
    this.cellEntryMap.get(cell.uri)?.dispose();
    this.cellEntryMap.delete(cell.uri);
    const cellDiffs = adjustCellDiffForKeepingAnInsertedCell(
      modifiedCellIndex,
      this._cellsDiffInfo.get().slice(),
      cellToInsert,
      this.originalModel.applyEdits.bind(this.originalModel),
      this.createModifiedCellDiffInfo.bind(this)
    );
    this.updateCellDiffInfo(cellDiffs, void 0);
  }
  undoPreviouslyDeletedCell(deletedOriginalIndex, originalCell) {
    const cellToInsert = {
      cellKind: originalCell.cellKind,
      language: originalCell.language,
      metadata: originalCell.metadata,
      outputs: originalCell.outputs,
      source: originalCell.getValue(),
      mime: originalCell.mime,
      internalMetadata: {
        internalId: originalCell.internalMetadata.internalId
      }
    };
    let cellDiffs = [];
    this._applyEditsSync(() => {
      cellDiffs = adjustCellDiffForRevertingADeletedCell(
        deletedOriginalIndex,
        this._cellsDiffInfo.get(),
        cellToInsert,
        this.modifiedModel.applyEdits.bind(this.modifiedModel),
        this.createModifiedCellDiffInfo.bind(this)
      );
    });
    this.updateCellDiffInfo(cellDiffs, void 0);
  }
  keepPreviouslyDeletedCell(deletedOriginalIndex) {
    const edit3 = { cells: [], count: 1, editType: 1 /* Replace */, index: deletedOriginalIndex };
    this.originalModel.applyEdits([edit3], true, void 0, () => void 0, void 0, false);
    const diffs = sortCellChanges(this._cellsDiffInfo.get()).filter((d) => !(d.type === "delete" && d.originalCellIndex === deletedOriginalIndex)).map((diff4) => {
      if (diff4.type !== "insert" && diff4.originalCellIndex > deletedOriginalIndex) {
        return {
          ...diff4,
          originalCellIndex: diff4.originalCellIndex - 1
        };
      }
      return diff4;
    });
    this.updateCellDiffInfo(diffs, void 0);
  }
  async _applyEdits(operation) {
    this._isEditFromUs = true;
    try {
      await operation();
    } finally {
      this._isEditFromUs = false;
    }
  }
  _applyEditsSync(operation) {
    this._isEditFromUs = true;
    try {
      operation();
    } finally {
      this._isEditFromUs = false;
    }
  }
  _safeCreateSnapshot(model) {
    try {
      return createSnapshot(model, this.transientOptions, this.configurationService);
    } catch (e4) {
      this.loggingService.error("Notebook Chat", `Error creating snapshot: ${e4 instanceof Error ? e4.message : e4}`);
      return this.initialContent;
    }
  }
  getCurrentSnapshot() {
    return this._safeCreateSnapshot(this.modifiedModel);
  }
  createSnapshot(chatSessionResource, requestId, undoStop) {
    const original = this._safeCreateSnapshot(this.originalModel);
    const current = this.getCurrentSnapshot();
    return {
      resource: this.modifiedURI,
      languageId: SnapshotLanguageId,
      snapshotUri: getNotebookSnapshotFileURI(chatSessionResource, requestId, undoStop, this.modifiedURI.path, this.modifiedModel.viewType),
      original,
      current,
      state: this.state.get(),
      telemetryInfo: this.telemetryInfo
    };
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && isEqual2(this.modifiedURI, snapshot.resource) && this.state.get() === snapshot.state && new SnapshotComparer(snapshot.original).isEqual(this.originalModel) && new SnapshotComparer(snapshot.current).isEqual(this.modifiedModel);
  }
  async restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this.updateCellDiffInfo([], void 0);
    this._stateObs.set(snapshot.state, void 0);
    restoreSnapshot(this.originalModel, snapshot.original);
    if (restoreToDisk) {
      this.restoreSnapshotInModifiedModel(snapshot.current);
    }
    this.initializeModelsFromDiff();
  }
  async resetEditTrackerToInitialContent() {
    if (this.initialContent) {
      restoreSnapshot(this.originalModel, this.initialContent);
    }
    this.updateCellDiffInfo([], void 0);
    this.initializeModelsFromDiff();
  }
  async resetToInitialContent() {
    this.updateCellDiffInfo([], void 0);
    this.restoreSnapshotInModifiedModel(this.initialContent);
    this.initializeModelsFromDiff();
  }
  restoreModifiedModelFromSnapshot(snapshot) {
    this.restoreSnapshotInModifiedModel(snapshot);
    return this.initializeModelsFromDiff();
  }
  restoreSnapshotInModifiedModel(snapshot) {
    if (snapshot === createSnapshot(this.modifiedModel, this.transientOptions, this.configurationService)) {
      return;
    }
    this._applyEditsSync(() => {
      this.modifiedModel.pushStackElement();
      restoreSnapshot(this.modifiedModel, snapshot);
      this.modifiedModel.pushStackElement();
    });
  }
  async resolveCellModel(cellURI) {
    const cell = this.originalModel.cells.concat(this.modifiedModel.cells).find((cell2) => isEqual2(cell2.uri, cellURI));
    if (!cell) {
      throw new Error("Cell not found");
    }
    const model = this.cellTextModelMap.get(cell.uri);
    if (model) {
      this.cellTextModelMap.set(cell.uri, model);
      return model;
    } else {
      const textEditorModel = await thenRegisterOrDispose(this.textModelService.createModelReference(cell.uri), this._store);
      const model2 = textEditorModel.object.textEditorModel;
      this.cellTextModelMap.set(cell.uri, model2);
      return model2;
    }
  }
  getOrCreateModifiedTextFileEntryForCell(cell, modifiedCellModel, originalCellModel) {
    let cellEntry = this.cellEntryMap.get(cell.uri);
    if (cellEntry) {
      return cellEntry;
    }
    if (this._store.isDisposed) {
      return;
    }
    const disposables = new DisposableStore();
    cellEntry = this._register(this._instantiationService.createInstance(ChatEditingNotebookCellEntry, this.modifiedResourceRef.object.resource, cell, modifiedCellModel, originalCellModel, () => this._isExternalEditInProgress, disposables));
    this.cellEntryMap.set(cell.uri, cellEntry);
    disposables.add(autorun((r2) => {
      if (this.modifiedModel.cells.indexOf(cell) === -1) {
        return;
      }
      const diffs = this.cellsDiffInfo.read(void 0).slice();
      const index2 = this.modifiedModel.cells.indexOf(cell);
      let entry = diffs.find((entry2) => entry2.modifiedCellIndex === index2);
      if (!entry) {
        return;
      }
      const entryIndex = diffs.indexOf(entry);
      entry.diff.set(cellEntry.diffInfo.read(r2), void 0);
      if (cellEntry.diffInfo.read(void 0).identical && entry.type === "modified") {
        entry = {
          ...entry,
          type: "unchanged"
        };
      }
      if (!cellEntry.diffInfo.read(void 0).identical && entry.type === "unchanged") {
        entry = {
          ...entry,
          type: "modified"
        };
      }
      diffs.splice(entryIndex, 1, { ...entry });
      transaction((tx) => {
        this.updateCellDiffInfo(diffs, tx);
      });
    }));
    disposables.add(autorun((r2) => {
      if (this.modifiedModel.cells.indexOf(cell) === -1) {
        return;
      }
      const cellState = cellEntry.state.read(r2);
      if (cellState === 1 /* Accepted */) {
        this.computeStateAfterAcceptingRejectingChanges(true);
      } else if (cellState === 2 /* Rejected */) {
        this.computeStateAfterAcceptingRejectingChanges(false);
      }
    }));
    return cellEntry;
  }
  async computeEditsFromSnapshots(beforeSnapshot, afterSnapshot) {
    const beforeData = deserializeSnapshot(beforeSnapshot);
    const afterData = deserializeSnapshot(afterSnapshot);
    const edits = [];
    if (beforeData.data.cells.length > 0) {
      edits.push({
        editType: 1 /* Replace */,
        index: 0,
        count: beforeData.data.cells.length,
        cells: afterData.data.cells
      });
    } else if (afterData.data.cells.length > 0) {
      edits.push({
        editType: 1 /* Replace */,
        index: 0,
        count: 0,
        cells: afterData.data.cells
      });
    }
    return edits;
  }
  _shouldAutoSave() {
    return this.modifiedURI.scheme !== Schemas.untitled;
  }
  async save() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    if (this.notebookResolver.isDirty(this.modifiedModel.uri)) {
      await this.modifiedResourceRef.object.save({
        reason: 1 /* EXPLICIT */,
        skipSaveParticipants: true
      });
    }
  }
  async revertToDisk() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    await this.modifiedResourceRef.object.revert({ soft: false });
  }
};

ChatEditingModifiedNotebookEntry = __decorateClass([
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IFilesConfigurationService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, ITextModelService),
  __decorateParam(13, IModelService),
  __decorateParam(14, IUndoRedoService),
  __decorateParam(15, INotebookEditorWorkerService),
  __decorateParam(16, INotebookLoggingService),
  __decorateParam(17, INotebookEditorModelResolverService),
  __decorateParam(18, IAiEditTelemetryService)
], ChatEditingModifiedNotebookEntry);

function generateCellHash(cellUri) {
  const hash2 = new StringSHA1();
  hash2.update(cellUri.toString());
  return hash2.digest().substring(0, 8);
}
export { generateCellHash, SnapshotLanguageId, ChatEditingModifiedNotebookEntry };
