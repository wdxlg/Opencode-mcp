// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/common/textFileEditorModel.ts
import { BaseTextEditorModel } from "./module-1099.mjs";
import { Emitter } from "./module-0017.mjs";
import { NO_TYPE_ID } from "./module-1123.mjs";
import { TaskSequentializer, timeout } from "./module-0036.mjs";
import { basename } from "./module-0026.mjs";
import { extUri } from "./module-0034.mjs";
import { SaveSourceRegistry } from "./module-0926.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { UTF16be, UTF16le, UTF8, UTF8_with_bom } from "./module-1124.mjs";
import { mark } from "./module-0506.mjs";
import { ETAG_DISABLED, IFileService, NotModifiedSinceFileOperationError } from "./module-0269.mjs";
import { createTextBufferFactoryFromStream } from "./module-0423.mjs";
import { EditSources } from "./module-0377.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILanguageDetectionService } from "./module-1098.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IPathService } from "./module-0939.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/services/textfile/common/textFileEditorModel.ts
var TextFileEditorModel = class extends BaseTextEditorModel {
  constructor(resource, preferredEncoding, preferredLanguageId, languageService, modelService, fileService, textFileService, workingCopyBackupService, logService, workingCopyService, filesConfigurationService, labelService, languageDetectionService, accessibilityService, pathService, extensionService, progressService) {
    super(modelService, languageService, languageDetectionService, accessibilityService);
    this.resource = resource;
    this.preferredEncoding = preferredEncoding;
    this.preferredLanguageId = preferredLanguageId;
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.logService = logService;
    this.workingCopyService = workingCopyService;
    this.filesConfigurationService = filesConfigurationService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.extensionService = extensionService;
    this.progressService = progressService;
    //#region Events
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidResolve = this._register(new Emitter());
    this.onDidResolve = this._onDidResolve.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidSaveError = this._register(new Emitter());
    this.onDidSaveError = this._onDidSaveError.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidRevert = this._register(new Emitter());
    this.onDidRevert = this._onDidRevert.event;
    this._onDidChangeEncoding = this._register(new Emitter());
    this.onDidChangeEncoding = this._onDidChangeEncoding.event;
    this._onDidChangeOrphaned = this._register(new Emitter());
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this._onDidChangeReadonly = this._register(new Emitter());
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    //#endregion
    this.typeId = NO_TYPE_ID;
    // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
    this.capabilities = 0 /* None */;
    // encoding as reported from disk
    this.versionId = 0;
    this.ignoreDirtyOnModelContentChange = false;
    this.ignoreSaveFromSaveParticipants = false;
    this.lastModelContentChangeFromUndoRedo = void 0;
    // !!! DO NOT MARK PRIVATE! USED IN TESTS !!!
    this.saveSequentializer = new TaskSequentializer();
    this.dirty = false;
    this.inConflictMode = false;
    this.inOrphanMode = false;
    this.inErrorMode = false;
    this.hasEncodingSetExplicitly = false;
    this.name = basename(this.labelService.getUriLabel(this.resource));
    this.resourceHasExtension = !!extUri.extname(this.resource);
    this._register(this.workingCopyService.registerWorkingCopy(this));
    this.registerListeners();
  }
  static {
    this.TEXTFILE_SAVE_ENCODING_SOURCE = SaveSourceRegistry.registerSource("textFileEncoding.source", localize(23382, null));
  }
  static {
    this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500;
  }
  registerListeners() {
    this._register(this.fileService.onDidFilesChange((e4) => this.onDidFilesChange(e4)));
    this._register(this.filesConfigurationService.onDidChangeFilesAssociation(() => this.onDidChangeFilesAssociation()));
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
  }
  async onDidFilesChange(e4) {
    let fileEventImpactsModel = false;
    let newInOrphanModeGuess;
    if (this.inOrphanMode) {
      const modelFileAdded = e4.contains(this.resource, 1 /* ADDED */);
      if (modelFileAdded) {
        newInOrphanModeGuess = false;
        fileEventImpactsModel = true;
      }
    } else {
      const modelFileDeleted = e4.contains(this.resource, 2 /* DELETED */);
      if (modelFileDeleted) {
        newInOrphanModeGuess = true;
        fileEventImpactsModel = true;
      }
    }
    if (fileEventImpactsModel && this.inOrphanMode !== newInOrphanModeGuess) {
      let newInOrphanModeValidated = false;
      if (newInOrphanModeGuess) {
        await timeout(100, CancellationToken.None);
        if (this.isDisposed()) {
          newInOrphanModeValidated = true;
        } else {
          const exists = await this.fileService.exists(this.resource);
          newInOrphanModeValidated = !exists;
        }
      }
      if (this.inOrphanMode !== newInOrphanModeValidated && !this.isDisposed()) {
        this.setOrphaned(newInOrphanModeValidated);
      }
    }
  }
  setOrphaned(orphaned) {
    if (this.inOrphanMode !== orphaned) {
      this.inOrphanMode = orphaned;
      this._onDidChangeOrphaned.fire();
    }
  }
  onDidChangeFilesAssociation() {
    if (!this.isResolved()) {
      return;
    }
    const firstLineText = this.getFirstLineText(this.textEditorModel);
    const languageSelection = this.getOrCreateLanguage(this.resource, this.languageService, this.preferredLanguageId, firstLineText);
    this.textEditorModel.setLanguage(languageSelection);
  }
  setLanguageId(languageId, source) {
    super.setLanguageId(languageId, source);
    this.preferredLanguageId = languageId;
  }
  //#region Backup
  async backup(token) {
    let meta = void 0;
    if (this.lastResolvedFileStat) {
      meta = {
        mtime: this.lastResolvedFileStat.mtime,
        ctime: this.lastResolvedFileStat.ctime,
        size: this.lastResolvedFileStat.size,
        etag: this.lastResolvedFileStat.etag,
        orphaned: this.inOrphanMode
      };
    }
    const content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? void 0, { encoding: UTF8 });
    return { meta, content };
  }
  //#endregion
  //#region Revert
  async revert(options3) {
    if (!this.isResolved()) {
      return;
    }
    const wasDirty = this.dirty;
    const undo = this.doSetDirty(false);
    const softUndo = options3?.soft;
    if (!softUndo) {
      try {
        await this.forceResolveFromFile();
      } catch (error) {
        if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
          undo();
          throw error;
        }
      }
    }
    this._onDidRevert.fire();
    if (wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  //#endregion
  //#region Resolve
  async resolve(options3) {
    this.trace("resolve() - enter");
    mark("code/willResolveTextFileEditorModel");
    if (this.isDisposed()) {
      this.trace("resolve() - exit - without resolving because model is disposed");
      return;
    }
    if (!options3?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
      this.trace("resolve() - exit - without resolving because model is dirty or being saved");
      return;
    }
    await this.doResolve(options3);
    mark("code/didResolveTextFileEditorModel");
  }
  async doResolve(options3) {
    if (options3?.contents) {
      return this.resolveFromBuffer(options3.contents, options3);
    }
    const isNewModel = !this.isResolved();
    if (isNewModel) {
      const resolvedFromBackup = await this.resolveFromBackup(options3);
      if (resolvedFromBackup) {
        return;
      }
    }
    return this.resolveFromFile(options3);
  }
  async resolveFromBuffer(buffer, options3) {
    this.trace("resolveFromBuffer()");
    let mtime;
    let ctime;
    let size3;
    let etag2;
    try {
      const metadata = await this.fileService.stat(this.resource);
      mtime = metadata.mtime;
      ctime = metadata.ctime;
      size3 = metadata.size;
      etag2 = metadata.etag;
      this.setOrphaned(false);
    } catch (error) {
      mtime = Date.now();
      ctime = Date.now();
      size3 = 0;
      etag2 = ETAG_DISABLED;
      this.setOrphaned(error.fileOperationResult === 1 /* FILE_NOT_FOUND */);
    }
    const preferredEncoding = await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding);
    this.resolveFromContent({
      resource: this.resource,
      name: this.name,
      mtime,
      ctime,
      size: size3,
      etag: etag2,
      value: buffer,
      encoding: preferredEncoding.encoding,
      readonly: false,
      locked: false,
      executable: false
    }, true, options3);
  }
  async resolveFromBackup(options3) {
    const backup = await this.workingCopyBackupService.resolve(this);
    let encoding = UTF8;
    if (backup) {
      encoding = (await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding)).encoding;
    }
    const isNewModel = !this.isResolved();
    if (!isNewModel) {
      this.trace("resolveFromBackup() - exit - without resolving because previously new model got created meanwhile");
      return true;
    }
    if (backup) {
      await this.doResolveFromBackup(backup, encoding, options3);
      return true;
    }
    return false;
  }
  async doResolveFromBackup(backup, encoding, options3) {
    this.trace("doResolveFromBackup()");
    this.resolveFromContent({
      resource: this.resource,
      name: this.name,
      mtime: backup.meta ? backup.meta.mtime : Date.now(),
      ctime: backup.meta ? backup.meta.ctime : Date.now(),
      size: backup.meta ? backup.meta.size : 0,
      etag: backup.meta ? backup.meta.etag : ETAG_DISABLED,
      // etag disabled if unknown!
      value: await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, backup.value, { encoding: UTF8 })),
      encoding,
      readonly: false,
      locked: false,
      executable: false
    }, true, options3);
    if (backup.meta?.orphaned) {
      this.setOrphaned(true);
    }
  }
  async resolveFromFile(options3) {
    this.trace("resolveFromFile()");
    const forceReadFromFile = options3?.forceReadFromFile;
    const allowBinary = this.isResolved() || options3?.allowBinary;
    let etag2;
    if (forceReadFromFile) {
      etag2 = ETAG_DISABLED;
    } else if (this.lastResolvedFileStat) {
      etag2 = this.lastResolvedFileStat.etag;
    }
    const currentVersionId = this.versionId;
    try {
      const content = await this.textFileService.readStream(this.resource, {
        acceptTextOnly: !allowBinary,
        etag: etag2,
        encoding: this.preferredEncoding,
        limits: options3?.limits
      });
      this.setOrphaned(false);
      if (currentVersionId !== this.versionId) {
        this.trace("resolveFromFile() - exit - without resolving because model content changed");
        return;
      }
      return this.resolveFromContent(content, false, options3);
    } catch (error) {
      const result = error.fileOperationResult;
      this.setOrphaned(result === 1 /* FILE_NOT_FOUND */);
      if (this.isResolved() && result === 2 /* FILE_NOT_MODIFIED_SINCE */) {
        if (error instanceof NotModifiedSinceFileOperationError) {
          this.updateLastResolvedFileStat(error.stat);
        }
        return;
      }
      if (this.isResolved() && result === 1 /* FILE_NOT_FOUND */ && !forceReadFromFile) {
        return;
      }
      throw error;
    }
  }
  resolveFromContent(content, dirty, options3) {
    this.trace("resolveFromContent() - enter");
    if (this.isDisposed()) {
      this.trace("resolveFromContent() - exit - because model is disposed");
      return;
    }
    this.updateLastResolvedFileStat({
      resource: this.resource,
      name: content.name,
      mtime: content.mtime,
      ctime: content.ctime,
      size: content.size,
      etag: content.etag,
      readonly: content.readonly,
      locked: content.locked,
      executable: false,
      isFile: true,
      isDirectory: false,
      isSymbolicLink: false,
      children: void 0
    });
    const oldEncoding = this.contentEncoding;
    this.contentEncoding = content.encoding;
    if (this.preferredEncoding) {
      this.updatePreferredEncoding(this.contentEncoding);
    } else if (oldEncoding !== this.contentEncoding) {
      this._onDidChangeEncoding.fire();
    }
    if (this.textEditorModel) {
      this.doUpdateTextModel(content.value, EditSources.reloadFromDisk());
    } else {
      this.doCreateTextModel(content.resource, content.value);
    }
    this.setDirty(!!dirty);
    this._onDidResolve.fire(options3?.reason ?? 3 /* OTHER */);
  }
  doCreateTextModel(resource, value2) {
    this.trace("doCreateTextModel()");
    const textModel = this.createTextEditorModel(value2, resource, this.preferredLanguageId);
    this.installModelListeners(textModel);
    this.autoDetectLanguage();
  }
  doUpdateTextModel(value2, reason) {
    this.trace("doUpdateTextModel()");
    this.ignoreDirtyOnModelContentChange = true;
    try {
      this.updateTextEditorModel(value2, this.preferredLanguageId, reason);
    } finally {
      this.ignoreDirtyOnModelContentChange = false;
    }
  }
  installModelListeners(model) {
    this._register(model.onDidChangeContent((e4) => this.onModelContentChanged(model, e4.isUndoing || e4.isRedoing)));
    this._register(model.onDidChangeLanguage(() => this.onMaybeShouldChangeEncoding()));
    super.installModelListeners(model);
  }
  onModelContentChanged(model, isUndoingOrRedoing) {
    this.trace(`onModelContentChanged() - enter`);
    this.versionId++;
    this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
    if (isUndoingOrRedoing) {
      this.lastModelContentChangeFromUndoRedo = Date.now();
    }
    if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
      if (model.getAlternativeVersionId() === this.bufferSavedVersionId) {
        this.trace("onModelContentChanged() - model content changed back to last saved version");
        const wasDirty = this.dirty;
        this.setDirty(false);
        if (wasDirty) {
          this._onDidRevert.fire();
        }
      } else {
        this.trace("onModelContentChanged() - model content changed and marked as dirty");
        this.setDirty(true);
      }
    }
    this._onDidChangeContent.fire();
    this.autoDetectLanguage();
  }
  async autoDetectLanguage() {
    await this.extensionService?.whenInstalledExtensionsRegistered();
    const languageId = this.getLanguageId();
    if (this.resource.scheme === this.pathService.defaultUriScheme && // make sure to not detect language for non-user visible documents
    (!languageId || languageId === PLAINTEXT_LANGUAGE_ID) && // only run on files with plaintext language set or no language set at all
    !this.resourceHasExtension) {
      return super.autoDetectLanguage();
    }
  }
  async forceResolveFromFile() {
    if (this.isDisposed()) {
      return;
    }
    await this.textFileService.files.resolve(this.resource, {
      reload: { async: false },
      forceReadFromFile: true
    });
  }
  //#endregion
  //#region Dirty
  isDirty() {
    return this.dirty;
  }
  isModified() {
    return this.isDirty();
  }
  setDirty(dirty) {
    if (!this.isResolved()) {
      return;
    }
    const wasDirty = this.dirty;
    this.doSetDirty(dirty);
    if (dirty !== wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  doSetDirty(dirty) {
    const wasDirty = this.dirty;
    const wasInConflictMode = this.inConflictMode;
    const wasInErrorMode = this.inErrorMode;
    const oldBufferSavedVersionId = this.bufferSavedVersionId;
    if (!dirty) {
      this.dirty = false;
      this.inConflictMode = false;
      this.inErrorMode = false;
      this.updateSavedVersionId();
    } else {
      this.dirty = true;
    }
    return () => {
      this.dirty = wasDirty;
      this.inConflictMode = wasInConflictMode;
      this.inErrorMode = wasInErrorMode;
      this.bufferSavedVersionId = oldBufferSavedVersionId;
    };
  }
  //#endregion
  //#region Save
  async save(options3 = /* @__PURE__ */ Object.create(null)) {
    if (!this.isResolved()) {
      return false;
    }
    if (this.isReadonly()) {
      this.trace("save() - ignoring request for readonly resource");
      return false;
    }
    if ((this.hasState(3 /* CONFLICT */) || this.hasState(5 /* ERROR */)) && (options3.reason === 2 /* AUTO */ || options3.reason === 3 /* FOCUS_CHANGE */ || options3.reason === 4 /* WINDOW_CHANGE */)) {
      this.trace("save() - ignoring auto save request for model that is in conflict or error");
      return false;
    }
    this.trace("save() - enter");
    await this.doSave(options3);
    this.trace("save() - exit");
    return this.hasState(0 /* SAVED */);
  }
  async doSave(options3) {
    if (typeof options3.reason !== "number") {
      options3.reason = 1 /* EXPLICIT */;
    }
    const versionId = this.versionId;
    this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
    if (this.ignoreSaveFromSaveParticipants) {
      this.trace(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
      return;
    }
    if (this.saveSequentializer.isRunning(versionId)) {
      this.trace(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
      return this.saveSequentializer.running;
    }
    if (!options3.force && !this.dirty) {
      this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
      return;
    }
    if (this.saveSequentializer.isRunning()) {
      this.trace(`doSave(${versionId}) - exit - because busy saving`);
      this.saveSequentializer.cancelRunning();
      return this.saveSequentializer.queue(() => this.doSave(options3));
    }
    if (this.isResolved()) {
      this.textEditorModel.pushStackElement();
    }
    const saveCancellation = new CancellationTokenSource();
    return this.progressService.withProgress({
      title: localize(23380, null, this.name),
      location: 10 /* Window */,
      cancellable: true,
      delay: this.isDirty() ? 3e3 : 5e3
    }, (progress) => {
      return this.doSaveSequential(versionId, options3, progress, saveCancellation);
    }, () => {
      saveCancellation.cancel();
    }).finally(() => {
      saveCancellation.dispose();
    });
  }
  doSaveSequential(versionId, options3, progress, saveCancellation) {
    return this.saveSequentializer.run(versionId, (async () => {
      if (this.isResolved() && !options3.skipSaveParticipants) {
        try {
          if (options3.reason === 2 /* AUTO */ && typeof this.lastModelContentChangeFromUndoRedo === "number") {
            const timeFromUndoRedoToSave = Date.now() - this.lastModelContentChangeFromUndoRedo;
            if (timeFromUndoRedoToSave < TextFileEditorModel.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
              await timeout(TextFileEditorModel.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
            }
          }
          if (!saveCancellation.token.isCancellationRequested) {
            this.ignoreSaveFromSaveParticipants = true;
            try {
              await this.textFileService.files.runSaveParticipants(this, { reason: options3.reason ?? 1 /* EXPLICIT */, savedFrom: options3.from }, progress, saveCancellation.token);
            } catch (err) {
              if (isCancellationError(err) && !saveCancellation.token.isCancellationRequested) {
                saveCancellation.cancel();
              }
            } finally {
              this.ignoreSaveFromSaveParticipants = false;
            }
          }
        } catch (error) {
          this.logService.error(`[text file model] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString());
        }
      }
      if (saveCancellation.token.isCancellationRequested) {
        return;
      } else {
        saveCancellation.dispose();
      }
      if (this.isDisposed()) {
        return;
      }
      if (!this.isResolved()) {
        return;
      }
      versionId = this.versionId;
      this.inErrorMode = false;
      progress.report({ message: localize(23381, null) });
      this.trace(`doSave(${versionId}) - before write()`);
      const lastResolvedFileStat = assertReturnsDefined(this.lastResolvedFileStat);
      const resolvedTextFileEditorModel = this;
      return this.saveSequentializer.run(versionId, (async () => {
        try {
          const stat = await this.textFileService.write(lastResolvedFileStat.resource, resolvedTextFileEditorModel.createSnapshot(), {
            mtime: lastResolvedFileStat.mtime,
            encoding: this.getEncoding(),
            etag: options3.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource, resolvedTextFileEditorModel.getLanguageId()) ? ETAG_DISABLED : lastResolvedFileStat.etag,
            unlock: options3.writeUnlock,
            writeElevated: options3.writeElevated
          });
          this.handleSaveSuccess(stat, versionId, options3);
        } catch (error) {
          this.handleSaveError(error, versionId, options3);
        }
      })());
    })(), () => saveCancellation.cancel());
  }
  handleSaveSuccess(stat, versionId, options3) {
    this.updateLastResolvedFileStat(stat);
    if (versionId === this.versionId) {
      this.trace(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
      this.setDirty(false);
    } else {
      this.trace(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
    }
    this.setOrphaned(false);
    this._onDidSave.fire({ reason: options3.reason, stat, source: options3.source });
  }
  handleSaveError(error, versionId, options3) {
    (options3.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[text file model] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString()]);
    if (options3.ignoreErrorHandler) {
      throw error;
    }
    this.setDirty(true);
    this.inErrorMode = true;
    if (error.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
      this.inConflictMode = true;
    }
    this.textFileService.files.saveErrorHandler.onSaveError(error, this, options3);
    this._onDidSaveError.fire();
  }
  updateSavedVersionId() {
    if (this.isResolved()) {
      this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
    }
  }
  updateLastResolvedFileStat(newFileStat) {
    const oldReadonly = this.isReadonly();
    if (!this.lastResolvedFileStat) {
      this.lastResolvedFileStat = newFileStat;
    } else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
      this.lastResolvedFileStat = newFileStat;
    } else {
      this.lastResolvedFileStat = { ...this.lastResolvedFileStat, readonly: newFileStat.readonly, locked: newFileStat.locked };
    }
    if (this.isReadonly() !== oldReadonly) {
      this._onDidChangeReadonly.fire();
    }
  }
  //#endregion
  hasState(state) {
    switch (state) {
      case 3 /* CONFLICT */:
        return this.inConflictMode;
      case 1 /* DIRTY */:
        return this.dirty;
      case 5 /* ERROR */:
        return this.inErrorMode;
      case 4 /* ORPHAN */:
        return this.inOrphanMode;
      case 2 /* PENDING_SAVE */:
        return this.saveSequentializer.isRunning();
      case 0 /* SAVED */:
        return !this.dirty;
    }
  }
  async joinState(state) {
    return this.saveSequentializer.running;
  }
  getLanguageId() {
    if (this.textEditorModel) {
      return this.textEditorModel.getLanguageId();
    }
    return this.preferredLanguageId;
  }
  //#region Encoding
  async onMaybeShouldChangeEncoding() {
    if (this.hasEncodingSetExplicitly) {
      this.trace("onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly");
      return;
    }
    if (this.contentEncoding === UTF8_with_bom || this.contentEncoding === UTF16be || this.contentEncoding === UTF16le) {
      this.trace("onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM");
      return;
    }
    const { encoding } = await this.textFileService.encoding.getPreferredReadEncoding(this.resource);
    if (typeof encoding !== "string" || !this.isNewEncoding(encoding)) {
      this.trace(`onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${encoding} is not new`);
      return;
    }
    if (this.isDirty()) {
      this.trace("onMaybeShouldChangeEncoding() - ignoring because model is dirty");
      return;
    }
    this.logService.info(`Adjusting encoding based on configured language override to '${encoding}' for ${this.resource.toString(true)}.`);
    return this.forceResolveFromFile();
  }
  setEncoding(encoding, mode) {
    this.hasEncodingSetExplicitly = true;
    return this.setEncodingInternal(encoding, mode);
  }
  async setEncodingInternal(encoding, mode) {
    if (mode === 0 /* Encode */) {
      this.updatePreferredEncoding(encoding);
      if (!this.isDirty()) {
        this.versionId++;
        this.setDirty(true);
      }
      if (!this.inConflictMode) {
        await this.save({ source: TextFileEditorModel.TEXTFILE_SAVE_ENCODING_SOURCE });
      }
    } else {
      if (!this.isNewEncoding(encoding)) {
        return;
      }
      if (this.isDirty()) {
        throw new Error("Cannot re-open a dirty text document with different encoding. Save it first.");
      }
      this.updatePreferredEncoding(encoding);
      await this.forceResolveFromFile();
    }
  }
  updatePreferredEncoding(encoding) {
    if (!this.isNewEncoding(encoding)) {
      return;
    }
    this.preferredEncoding = encoding;
    this._onDidChangeEncoding.fire();
  }
  isNewEncoding(encoding) {
    if (this.preferredEncoding === encoding) {
      return false;
    }
    if (!this.preferredEncoding && this.contentEncoding === encoding) {
      return false;
    }
    return true;
  }
  getEncoding() {
    return this.preferredEncoding || this.contentEncoding;
  }
  //#endregion
  trace(msg) {
    this.logService.trace(`[text file model] ${msg}`, this.resource.toString());
  }
  isResolved() {
    return !!this.textEditorModel;
  }
  isReadonly() {
    return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
  }
  dispose() {
    this.trace("dispose()");
    this.inConflictMode = false;
    this.inOrphanMode = false;
    this.inErrorMode = false;
    super.dispose();
  }
};

TextFileEditorModel = __decorateClass([
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IModelService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IWorkingCopyBackupService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IWorkingCopyService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, ILanguageDetectionService),
  __decorateParam(13, IAccessibilityService),
  __decorateParam(14, IPathService),
  __decorateParam(15, IExtensionService),
  __decorateParam(16, IProgressService)
], TextFileEditorModel);
export { TextFileEditorModel };
