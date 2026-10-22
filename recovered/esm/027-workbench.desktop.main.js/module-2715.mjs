// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingDeletedFileEntry.ts
import { AbstractChatEditingModifiedFileEntry } from "./module-2711.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatEditingTextModelContentProvider } from "./module-2257.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { stringToSnapshot } from "./module-1063.mjs";
import { DetailedLineRangeMapping } from "./module-0179.mjs";
import { LineRange } from "./module-0174.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IChatService } from "./module-0972.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingDeletedFileEntry.ts
var ChatEditingDeletedFileEntry = class extends AbstractChatEditingModifiedFileEntry {
  constructor(resource, originalContent, _multiDiffEntryDelegate, telemetryInfo, _languageId, _modelService, _languageService, configService, fileConfigService, chatService, fileService, undoRedoService, instantiationService, aiEditTelemetryService) {
    super(
      resource,
      telemetryInfo,
      2 /* Deleted */,
      configService,
      fileConfigService,
      chatService,
      fileService,
      undoRedoService,
      instantiationService,
      aiEditTelemetryService
    );
    this._multiDiffEntryDelegate = _multiDiffEntryDelegate;
    this._languageId = _languageId;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this.linesAdded = constObservable(0);
    this._changesCount = observableValue(this, 1);
    this.changesCount = this._changesCount;
    this.isDeletion = true;
    this._originalContent = originalContent;
    this.initialContent = originalContent;
    this.originalURI = ChatEditingTextModelContentProvider.getFileURI(telemetryInfo.sessionResource, this.entryId, resource.path);
    this.diffInfo = constObservable(this._diffInfo());
    this.linesRemoved = constObservable(this._getOrCreateOriginalModel().getLineCount());
  }
  dispose() {
    this._originalModel?.dispose();
    this._modifiedModel?.dispose();
    super.dispose();
  }
  /**
   * Gets or creates the original model for diff display.
   */
  _getOrCreateOriginalModel() {
    if (!this._originalModel || this._originalModel.isDisposed()) {
      this._originalModel = this._modelService.createModel(
        createTextBufferFactoryFromSnapshot(stringToSnapshot(this._originalContent)),
        this._languageService.createById(this._languageId),
        this.originalURI,
        false
      );
    }
    return this._originalModel;
  }
  /**
   * Gets or creates an empty model representing the deleted state.
   */
  _getOrCreateModifiedModel() {
    if (!this._modifiedModel || this._modifiedModel.isDisposed()) {
      this._modifiedModel = this._modelService.createModel(
        "",
        this._languageService.createById(this._languageId),
        this.modifiedURI.with({ scheme: "deleted-file" }),
        false
      );
    }
    return this._modifiedModel;
  }
  _diffInfo() {
    const originalModel = this._getOrCreateOriginalModel();
    this._getOrCreateModifiedModel();
    const originalLineCount = originalModel.getLineCount();
    return {
      changes: [new DetailedLineRangeMapping(
        new LineRange(1, originalLineCount + 1),
        new LineRange(1, 1),
        void 0
      )],
      quitEarly: false,
      identical: false,
      moves: []
    };
  }
  getDiffInfo() {
    return Promise.resolve(this._diffInfo());
  }
  equalsSnapshot(snapshot) {
    return !!snapshot && isEqual2(this.modifiedURI, snapshot.resource) && this._languageId === snapshot.languageId && this._originalContent === snapshot.original && snapshot.current === "" && this.state.get() === snapshot.state;
  }
  createSnapshot(chatSessionResource, requestId, undoStop) {
    return {
      resource: this.modifiedURI,
      languageId: this._languageId,
      snapshotUri: this.originalURI,
      original: this._originalContent,
      current: "",
      // File is deleted, so current content is empty
      state: this.state.get(),
      telemetryInfo: this._telemetryInfo,
      isDeleted: true
    };
  }
  async restoreFromSnapshot(snapshot, restoreToDisk = true) {
    this._stateObs.set(snapshot.state, void 0);
    if (restoreToDisk && snapshot.current !== "") {
      await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(snapshot.current));
    }
  }
  async resetToInitialContent() {
    await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
  }
  resetEditTrackerToInitialContent() {
    return Promise.resolve();
  }
  async _areOriginalAndModifiedIdentical() {
    return this._originalContent === "";
  }
  _createUndoRedoElement(response) {
    return {
      type: 0 /* Resource */,
      resource: this.modifiedURI,
      label: "Chat File Deletion",
      code: "chat.delete",
      undo: async () => {
        await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
      },
      redo: async () => {
        await this._fileService.del(this.modifiedURI, { useTrash: false });
      }
    };
  }
  async acceptAgentEdits(_uri, _edits, isLastEdits, _responseModel) {
    transaction((tx) => {
      this._waitsForLastEdits.set(!isLastEdits, tx);
      this._stateObs.set(0 /* Modified */, tx);
      if (isLastEdits) {
        this._resetEditsState(tx);
        this._rewriteRatioObs.set(1, tx);
      }
    });
  }
  async _doAccept() {
    this._multiDiffEntryDelegate.collapse(void 0);
  }
  async _doReject() {
    await this._fileService.writeFile(this.modifiedURI, VSBuffer.fromString(this._originalContent));
    this._multiDiffEntryDelegate.collapse(void 0);
  }
  _createEditorIntegration(_editor) {
    return {
      currentIndex: observableValue(this, 0),
      reveal: () => {
      },
      next: () => false,
      previous: () => false,
      enableAccessibleDiffView: () => {
      },
      acceptNearestChange: async () => {
      },
      rejectNearestChange: async () => {
      },
      toggleDiff: async () => {
      },
      dispose: () => {
      }
    };
  }
  async computeEditsFromSnapshots(_beforeSnapshot, _afterSnapshot) {
    return [];
  }
  async save() {
  }
  async revertToDisk() {
  }
};

ChatEditingDeletedFileEntry = __decorateClass([
  __decorateParam(5, IModelService),
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IFilesConfigurationService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IUndoRedoService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IAiEditTelemetryService)
], ChatEditingDeletedFileEntry);
export { ChatEditingDeletedFileEntry };
