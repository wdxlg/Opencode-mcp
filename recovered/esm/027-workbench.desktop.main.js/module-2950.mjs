// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatEditReviewSession.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationError } from "./module-0004.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatEditingModifiedDocumentEntry } from "./module-2720.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { ILogService } from "./module-0095.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatEditReviewSession.ts
var InlineChatEditReviewSession = class extends Disposable {
  constructor(chatSessionResource, _targetUri, _instantiationService, _textModelService, _textFileService, _filesConfigurationService, _logService, _fileService) {
    super();
    this.chatSessionResource = chatSessionResource;
    this._targetUri = _targetUri;
    this._instantiationService = _instantiationService;
    this._textModelService = _textModelService;
    this._textFileService = _textFileService;
    this._filesConfigurationService = _filesConfigurationService;
    this._logService = _logService;
    this._fileService = _fileService;
    this.isGlobalEditingSession = false;
    this._entriesObs = observableValue(this, []);
    this.entries = this._entriesObs;
    this._entries = new ResourceMap();
    this._initialContents = new ResourceMap();
    this._readonlyLocks = new ResourceMap();
    this._externalEditListener = this._register(new MutableDisposable());
    this._externalEditEntriesInFlight = new ResourceMap();
    this._onDidDispose = this._register(new Emitter());
    this.onDidDispose = this._onDidDispose.event;
  }
  /**
   * Saves the target document, creates its review entry, and locks it read-only for the turn.
   */
  async beginTurn(response) {
    this._requestId = response.requestId;
    this._externalEditListener.clear();
    try {
      if (this._textFileService.isDirty(this._targetUri)) {
        const saved = await this._textFileService.save(this._targetUri);
        if (this._store.isDisposed) {
          return;
        }
        if (!saved) {
          throw new CancellationError();
        }
      }
      this._readonlyLocks.set(this._targetUri, true);
      await this._filesConfigurationService.updateReadonly(this._targetUri, this._getReadonlyMessage());
      if (this._store.isDisposed) {
        return;
      }
      let initialContent;
      if (!this._entries.has(this._targetUri)) {
        initialContent = await this._readCurrentContent(this._targetUri);
        if (this._store.isDisposed) {
          return;
        }
        this._initialContents.set(this._targetUri, initialContent);
      } else {
        initialContent = this._initialContents.get(this._targetUri) ?? "";
      }
      const entry = await this._getOrCreateEntry(this._targetUri, this._getTelemetryInfo(response), initialContent);
      if (this._store.isDisposed || !entry) {
        return;
      }
      for (const tracked of this._entries.values()) {
        tracked.startExternalEdit();
      }
      this._externalEditListener.value = response.onDidChange(() => {
        void this._processExternalEdits(response);
      });
      void this._processExternalEdits(response);
    } catch (error) {
      this._logService.error(`Failed to prepare inline chat review for ${this._targetUri}`, error);
      await this._resetReadonlyLocks();
      throw error;
    }
  }
  /**
   * Reverts models from disk, finalizes external edits, and unlocks the target.
   */
  async endTurn(response) {
    this._externalEditListener.clear();
    try {
      await this._processExternalEdits(response);
      if (this._store.isDisposed) {
        return;
      }
    } finally {
      if (!this._store.isDisposed) {
        for (const entry of this._entries.values()) {
          try {
            await entry.revertToDisk();
          } catch (error) {
            this._logService.error(`Failed to reload inline chat review entry from disk for ${entry.modifiedURI}`, error);
          }
        }
        for (const entry of this._entries.values()) {
          entry.stopExternalEdit();
        }
      }
      await this._resetReadonlyLocks();
    }
  }
  getEntry(uri5) {
    return this._entries.get(uri5);
  }
  readEntry(uri5, reader) {
    this._entriesObs.read(reader);
    return this._entries.get(uri5);
  }
  async accept(...uris) {
    await Promise.all(this._getEntries(uris).map((entry) => entry.accept()));
  }
  async reject(...uris) {
    await Promise.all(this._getEntries(uris).map((entry) => entry.reject()));
  }
  dispose() {
    this._externalEditListener.clear();
    this._onDidDispose.fire();
    for (const entry of this._entries.values()) {
      entry.stopExternalEdit();
    }
    void this._resetReadonlyLocks();
    super.dispose();
  }
  _getEntries(uris) {
    const entries2 = [...this._entries.values()];
    return uris.length === 0 ? entries2 : entries2.filter((entry) => uris.some((uri5) => isEqual2(entry.modifiedURI, uri5)));
  }
  async _processExternalEdits(response) {
    for (const part of response.response.value) {
      if (part.kind !== "externalEdit") {
        continue;
      }
      try {
        await this._getOrCreateExternalEditEntry(part, this._getTelemetryInfo(response));
        if (this._store.isDisposed) {
          return;
        }
      } catch (error) {
        this._logService.error(`Failed to create inline chat review entry for ${part.uri}`, error);
      }
    }
  }
  async _getOrCreateExternalEditEntry(edit3, telemetryInfo) {
    if (edit3.editKind === "delete" || edit3.editKind === "rename" || isEqual2(edit3.uri, this._targetUri)) {
      return;
    }
    if (this._entries.has(edit3.uri)) {
      const entry = await this._getOrCreateEntry(edit3.uri, telemetryInfo, this._initialContents.get(edit3.uri) ?? "");
      if (this._store.isDisposed || !entry) {
        return;
      }
      entry.startExternalEdit();
      return;
    }
    const inFlight = this._externalEditEntriesInFlight.get(edit3.uri);
    if (inFlight) {
      await inFlight;
      if (this._store.isDisposed) {
        return;
      }
      return;
    }
    const createEntry = this._createExternalEditEntry(edit3, telemetryInfo);
    this._externalEditEntriesInFlight.set(edit3.uri, createEntry);
    try {
      await createEntry;
      if (this._store.isDisposed) {
        return;
      }
    } finally {
      if (this._externalEditEntriesInFlight.get(edit3.uri) === createEntry) {
        this._externalEditEntriesInFlight.delete(edit3.uri);
      }
    }
  }
  async _createExternalEditEntry(edit3, telemetryInfo) {
    let initialContent = this._initialContents.get(edit3.uri);
    if (initialContent === void 0) {
      initialContent = await this._readBeforeContent(edit3);
      if (this._store.isDisposed) {
        return;
      }
      this._initialContents.set(edit3.uri, initialContent);
    }
    const editKind = edit3.editKind === "create" ? 0 /* Created */ : 1 /* Modified */;
    await this._getOrCreateEntry(edit3.uri, telemetryInfo, initialContent, true, editKind);
    if (this._store.isDisposed) {
      return;
    }
  }
  async _readCurrentContent(resource) {
    try {
      const ref = await this._textModelService.createModelReference(resource);
      try {
        return ref.object.textEditorModel.getValue();
      } finally {
        ref.dispose();
      }
    } catch (error) {
      this._logService.warn(`Failed to read model content for ${resource}; reading from disk instead.`, error);
      return (await this._fileService.readFile(resource)).value.toString();
    }
  }
  async _readBeforeContent(edit3) {
    if (!edit3.beforeContentUri) {
      return "";
    }
    try {
      return (await this._fileService.readFile(edit3.beforeContentUri)).value.toString();
    } catch (error) {
      this._logService.warn(`Failed to read pre-edit content for ${edit3.uri}.`, error);
      return "";
    }
  }
  async _getOrCreateEntry(resource, telemetryInfo, initialContent, startExternalEdit = false, editKind = 1 /* Modified */) {
    const existingEntry = this._entries.get(resource);
    if (existingEntry) {
      if (telemetryInfo.requestId !== existingEntry.telemetryInfo.requestId) {
        existingEntry.updateTelemetryInfo(telemetryInfo);
      }
      if (startExternalEdit) {
        existingEntry.startExternalEdit();
      }
      return existingEntry;
    }
    const ref = await this._textModelService.createModelReference(resource);
    if (this._store.isDisposed) {
      ref.dispose();
      return void 0;
    }
    const entry = this._register(this._instantiationService.createInstance(
      ChatEditingModifiedDocumentEntry,
      ref,
      { collapse: (_tx) => {
      } },
      telemetryInfo,
      editKind,
      initialContent
    ));
    if (startExternalEdit) {
      entry.startExternalEdit();
    }
    this._entries.set(resource, entry);
    this._entriesObs.set([...this._entries.values()], void 0);
    return entry;
  }
  _getTelemetryInfo(response) {
    const requestId = this._requestId ?? response.requestId;
    return new class {
      get agentId() {
        return response.agent?.id;
      }
      get modelId() {
        return response.request?.modelId;
      }
      get modeId() {
        return response.request?.modeInfo?.telemetryModeId;
      }
      get command() {
        return response.slashCommand?.name;
      }
      get sessionResource() {
        return response.session.sessionResource;
      }
      get requestId() {
        return requestId;
      }
      get result() {
        return response.result;
      }
      get applyCodeBlockSuggestionId() {
        return response.request?.modeInfo?.applyCodeBlockSuggestionId;
      }
      get feature() {
        return "inlineChat";
      }
    }();
  }
  _getReadonlyMessage() {
    return { value: localize(16160, null) };
  }
  async _resetReadonlyLocks() {
    const resources = [...this._readonlyLocks.keys()];
    this._readonlyLocks.clear();
    for (const resource of resources) {
      try {
        await this._filesConfigurationService.updateReadonly(resource, "reset");
      } catch (error) {
        this._logService.error(`Failed to release inline chat read-only lock for ${resource}`, error);
      }
    }
  }
};

InlineChatEditReviewSession = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, ITextFileService),
  __decorateParam(5, IFilesConfigurationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IFileService)
], InlineChatEditReviewSession);
export { InlineChatEditReviewSession };
