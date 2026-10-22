// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingModifiedDocumentEntry.ts
import { AbstractChatEditingModifiedFileEntry } from "./module-2686.mjs";
import { ChatEditingSnapshotTextModelContentProvider, ChatEditingTextModelContentProvider } from "./module-2232.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { ITextFileService, isTextFileEditorModel, stringToSnapshot } from "./module-1064.mjs";
import { ChatEditingTextModelChangeService } from "./module-2694.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { SingleModelEditStackElement } from "./module-0393.mjs";
import { transaction } from "./module-0045.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { assertType } from "./module-0010.mjs";
import { ChatEditingCodeEditorIntegration } from "./module-2692.mjs";
import { Schemas } from "./module-0033.mjs";
import { TextEdit2 } from "./module-0178.mjs";
import { StringText } from "./module-0177.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IChatService } from "./module-0973.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingModifiedDocumentEntry.ts
var ChatEditingModifiedDocumentEntry = class extends AbstractChatEditingModifiedFileEntry {
  constructor(resourceRef, _multiDiffEntryDelegate, telemetryInfo, kind, initialContent, markerService, modelService, textModelService, languageService, configService, fileConfigService, chatService, _textFileService, fileService, undoRedoService, instantiationService, aiEditTelemetryService, _editorWorkerService) {
    super(
      resourceRef.object.textEditorModel.uri,
      telemetryInfo,
      kind,
      configService,
      fileConfigService,
      chatService,
      fileService,
      undoRedoService,
      instantiationService,
      aiEditTelemetryService
    );
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this._textFileService = _textFileService;
    this._editorWorkerService = _editorWorkerService;
    this._docFileEditorModel = this._register(resourceRef).object;
    this.modifiedModel = resourceRef.object.textEditorModel;
    this.originalURI = ChatEditingTextModelContentProvider.getFileURI(telemetryInfo.sessionResource, this.entryId, this.modifiedURI.path);
    this.initialContent = initialContent ?? this.modifiedModel.getValue();
    const docSnapshot = this.originalModel = this._register(
      modelService.createModel(
        createTextBufferFactoryFromSnapshot(initialContent !== void 0 ? stringToSnapshot(initialContent) : this.modifiedModel.createSnapshot()),
        languageService.createById(this.modifiedModel.getLanguageId()),
        this.originalURI,
        false
      )
    );
    this._textModelChangeService = this._register(instantiationService.createInstance(
      ChatEditingTextModelChangeService,
      this.originalModel,
      this.modifiedModel,
      this._stateObs,
      () => this._isExternalEditInProgress
    ));
    this._register(this._textModelChangeService.onDidAcceptOrRejectAllHunks((action) => {
      this._stateObs.set(action, void 0);
      this._notifySessionAction(action === 1 /* Accepted */ ? "accepted" : "rejected");
    }));
    this._register(this._textModelChangeService.onDidAcceptOrRejectLines((action) => {
      this._notifyAction({
        kind: "chatEditingHunkAction",
        uri: this.modifiedURI,
        outcome: action.state,
        languageId: this.modifiedModel.getLanguageId(),
        ...action
      });
    }));
    (async () => {
      const reference = await textModelService.createModelReference(docSnapshot.uri);
      if (this._store.isDisposed) {
        reference.dispose();
        return;
      }
      this._register(reference);
    })();
    this._register(this._textModelChangeService.onDidUserEditModel(() => {
      this._userEditScheduler.schedule();
      const didResetToOriginalContent = this.modifiedModel.getValue() === this.initialContent;
      if (this._stateObs.get() === 0 /* Modified */ && didResetToOriginalContent) {
        this._stateObs.set(2 /* Rejected */, void 0);
      }
    }));
    const resourceFilter = this._register(new MutableDisposable());
    this._register(autorun((r2) => {
      const inProgress = this._waitsForLastEdits.read(r2);
      if (inProgress) {
        const res = this._lastModifyingResponseObs.read(r2);
        const req = res && res.session.getRequests().find((value2) => value2.id === res.requestId);
        resourceFilter.value = markerService.installResourceFilter(this.modifiedURI, req?.message.text || localize(10877, null));
      } else {
        resourceFilter.clear();
      }
    }));
  }
  get changesCount() {
    return this._textModelChangeService.diffInfo.map((diff4) => diff4.changes.length);
  }
  get diffInfo() {
    return this._textModelChangeService.diffInfo;
  }
  get linesAdded() {
    return this._textModelChangeService.diffInfo.map((diff4) => {
      let added = 0;
      for (const c of diff4.changes) {
        added += Math.max(0, c.modified.endLineNumberExclusive - c.modified.startLineNumber);
      }
      return added;
    });
  }
  get linesRemoved() {
    return this._textModelChangeService.diffInfo.map((diff4) => {
      let removed = 0;
      for (const c of diff4.changes) {
        removed += Math.max(0, c.original.endLineNumberExclusive - c.original.startLineNumber);
      }
      return removed;
    });
  }
  getDiffInfo() {
    return this._textModelChangeService.getDiffInfo();
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && isEqual2(this.modifiedURI, snapshot.resource) && this.modifiedModel.getLanguageId() === snapshot.languageId && this.originalModel.getValue() === snapshot.original && this.modifiedModel.getValue() === snapshot.current && this.state.get() === snapshot.state;
  }
  createSnapshot(chatSessionResource, requestId, undoStop) {
    return {
      resource: this.modifiedURI,
      languageId: this.modifiedModel.getLanguageId(),
      snapshotUri: ChatEditingSnapshotTextModelContentProvider.getSnapshotFileURI(chatSessionResource, requestId, undoStop, this.modifiedURI.path, this.modifiedURI.scheme, this.modifiedURI.authority),
      original: this.originalModel.getValue(),
      current: this.modifiedModel.getValue(),
      state: this.state.get(),
      telemetryInfo: this._telemetryInfo
    };
  }
  getCurrentContents() {
    return this.modifiedModel.getValue();
  }
  async restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this._stateObs.set(snapshot.state, void 0);
    await this._textModelChangeService.resetDocumentValues(snapshot.original, restoreToDisk ? snapshot.current : void 0);
  }
  async resetToInitialContent() {
    await this._textModelChangeService.resetDocumentValues(void 0, this.initialContent);
  }
  async resetEditTrackerToInitialContent() {
    await this._textModelChangeService.resetDocumentValues(this.initialContent, void 0);
  }
  async _areOriginalAndModifiedIdentical() {
    return this._textModelChangeService.areOriginalAndModifiedIdentical();
  }
  _resetEditsState(tx) {
    super._resetEditsState(tx);
    this._textModelChangeService.clearCurrentEditLineDecoration();
  }
  _createUndoRedoElement(response) {
    const request2 = response.session.getRequests().find((req) => req.id === response.requestId);
    const label3 = request2?.message.text ? localize(10875, null, request2.message.text) : localize(10876, null);
    return new SingleModelEditStackElement(label3, "chat.edit", this.modifiedModel, null);
  }
  async acceptAgentEdits(resource, textEdits, isLastEdits, responseModel) {
    const result = await this._textModelChangeService.acceptAgentEdits(resource, textEdits, isLastEdits, responseModel);
    transaction((tx) => {
      this._waitsForLastEdits.set(!isLastEdits, tx);
      this._stateObs.set(0 /* Modified */, tx);
      if (!isLastEdits) {
        this._rewriteRatioObs.set(result.rewriteRatio, tx);
      } else {
        this._resetEditsState(tx);
        this._rewriteRatioObs.set(1, tx);
      }
    });
    if (isLastEdits && this._shouldAutoSave()) {
      await this._textFileService.save(this.modifiedModel.uri, {
        reason: 2 /* AUTO */,
        skipSaveParticipants: true
      });
    }
  }
  async _doAccept() {
    this._textModelChangeService.keep();
    this._multiDiffEntryDelegate.collapse(void 0);
    const config = this._fileConfigService.getAutoSaveConfiguration(this.modifiedURI);
    if (!config.autoSave || !this._textFileService.isDirty(this.modifiedURI)) {
      try {
        await this._textFileService.save(this.modifiedURI, {
          reason: 1 /* EXPLICIT */,
          force: true,
          ignoreErrorHandler: true
        });
      } catch {
      }
    }
  }
  async _doReject() {
    if (this.createdInRequestId === this._telemetryInfo.requestId) {
      if (isTextFileEditorModel(this._docFileEditorModel)) {
        await this._docFileEditorModel.revert({ soft: true });
        await this._fileService.del(this.modifiedURI).catch((err) => {
        });
      }
      this._onDidDelete.fire();
    } else {
      this._textModelChangeService.undo();
      if (this._textModelChangeService.allEditsAreFromUs && isTextFileEditorModel(this._docFileEditorModel) && this._shouldAutoSave()) {
        await this._docFileEditorModel.save({ reason: 1 /* EXPLICIT */, skipSaveParticipants: true });
      }
      this._multiDiffEntryDelegate.collapse(void 0);
    }
  }
  _createEditorIntegration(editor) {
    const codeEditor = getCodeEditor(editor.getControl());
    assertType(codeEditor);
    const diffInfo = this._textModelChangeService.diffInfo;
    return this._instantiationService.createInstance(ChatEditingCodeEditorIntegration, this, codeEditor, diffInfo, false);
  }
  _shouldAutoSave() {
    return this.modifiedURI.scheme !== Schemas.untitled;
  }
  async computeEditsFromSnapshots(beforeSnapshot, afterSnapshot) {
    const stringEdit = await this._editorWorkerService.computeStringEditFromDiff(
      beforeSnapshot,
      afterSnapshot,
      { maxComputationTimeMs: 5e3 },
      "advanced"
    );
    const editorTextEdit = TextEdit2.fromStringEdit(stringEdit, new StringText(beforeSnapshot));
    return editorTextEdit.replacements.slice();
  }
  async save() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    if (this._textFileService.isDirty(this.modifiedModel.uri)) {
      await this._textFileService.save(this.modifiedModel.uri, {
        reason: 1 /* EXPLICIT */,
        skipSaveParticipants: true
      });
    }
  }
  async revertToDisk() {
    if (this.modifiedModel.uri.scheme === Schemas.untitled) {
      return;
    }
    const fileModel = this._textFileService.files.get(this.modifiedModel.uri);
    if (fileModel && !fileModel.isDisposed()) {
      await fileModel.revert({ soft: false });
    }
  }
};

ChatEditingModifiedDocumentEntry = __decorateClass([
  __decorateParam(5, IMarkerService),
  __decorateParam(6, IModelService),
  __decorateParam(7, ITextModelService),
  __decorateParam(8, ILanguageService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, IChatService),
  __decorateParam(12, ITextFileService),
  __decorateParam(13, IFileService),
  __decorateParam(14, IUndoRedoService),
  __decorateParam(15, IInstantiationService),
  __decorateParam(16, IAiEditTelemetryService),
  __decorateParam(17, IEditorWorkerService)
], ChatEditingModifiedDocumentEntry);
export { ChatEditingModifiedDocumentEntry };
