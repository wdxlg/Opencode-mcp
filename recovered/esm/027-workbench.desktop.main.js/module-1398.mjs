// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/storedFileWorkingCopy.ts
import { ResourceWorkingCopy } from "./module-1304.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TaskSequentializer, raceCancellation, timeout } from "./module-0036.mjs";
import { ETAG_DISABLED, IFileService, NotModifiedSinceFileOperationError } from "./module-0269.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { toAction } from "./module-0082.mjs";
import { isErrorWithActions, toErrorMessage } from "./module-0094.mjs";
import { isWindows } from "./module-0014.mjs";
import { hash } from "./module-0039.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IElevatedFileService } from "./module-1397.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/services/workingCopy/common/storedFileWorkingCopy.ts
function isStoredFileWorkingCopySaveEvent(e) {
  const candidate = e;
  return !!candidate.stat;
}

var StoredFileWorkingCopy = class extends ResourceWorkingCopy {
  //#endregion
  constructor(typeId2, resource, name, modelFactory, externalResolver, fileService, logService, workingCopyFileService, filesConfigurationService, workingCopyBackupService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, progressService) {
    super(resource, fileService);
    this.typeId = typeId2;
    this.name = name;
    this.modelFactory = modelFactory;
    this.externalResolver = externalResolver;
    this.logService = logService;
    this.workingCopyFileService = workingCopyFileService;
    this.filesConfigurationService = filesConfigurationService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.notificationService = notificationService;
    this.workingCopyEditorService = workingCopyEditorService;
    this.editorService = editorService;
    this.elevatedFileService = elevatedFileService;
    this.progressService = progressService;
    this.capabilities = 0 /* None */;
    this._model = void 0;
    //#region events
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
    this._onDidChangeReadonly = this._register(new Emitter());
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    //#region Dirty
    this.dirty = false;
    this.ignoreDirtyOnModelContentChange = false;
    //#endregion
    //#region Save
    this.versionId = 0;
    this.lastContentChangeFromUndoRedo = void 0;
    this.saveSequentializer = new TaskSequentializer();
    this.ignoreSaveFromSaveParticipants = false;
    //#endregion
    //#region State
    this.inConflictMode = false;
    this.inErrorMode = false;
    this._register(workingCopyService.registerWorkingCopy(this));
    this.registerListeners();
  }
  get model() {
    return this._model;
  }
  registerListeners() {
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
  }
  isDirty() {
    return this.dirty;
  }
  markModified() {
    this.setDirty(true);
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
    const oldSavedVersionId = this.savedVersionId;
    if (!dirty) {
      this.dirty = false;
      this.inConflictMode = false;
      this.inErrorMode = false;
      if (this.isResolved()) {
        this.savedVersionId = this.model.versionId;
      }
    } else {
      this.dirty = true;
    }
    return () => {
      this.dirty = wasDirty;
      this.inConflictMode = wasInConflictMode;
      this.inErrorMode = wasInErrorMode;
      this.savedVersionId = oldSavedVersionId;
    };
  }
  // !!! DO NOT MARK PRIVATE! USED IN TESTS !!!
  isResolved() {
    return !!this.model;
  }
  async resolve(options3) {
    this.trace("resolve() - enter");
    if (this.isDisposed()) {
      this.trace("resolve() - exit - without resolving because file working copy is disposed");
      return;
    }
    if (!options3?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
      this.trace("resolve() - exit - without resolving because file working copy is dirty or being saved");
      return;
    }
    return this.doResolve(options3);
  }
  async doResolve(options3) {
    if (options3?.contents) {
      return this.resolveFromBuffer(options3.contents);
    }
    const isNew = !this.isResolved();
    if (isNew) {
      const resolvedFromBackup = await this.resolveFromBackup();
      if (resolvedFromBackup) {
        return;
      }
    }
    return this.resolveFromFile(options3);
  }
  async resolveFromBuffer(buffer) {
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
    return this.resolveFromContent(
      {
        resource: this.resource,
        name: this.name,
        mtime,
        ctime,
        size: size3,
        etag: etag2,
        value: buffer,
        readonly: false,
        locked: false,
        executable: false
      },
      true
      /* dirty (resolved from buffer) */
    );
  }
  async resolveFromBackup() {
    const backup = await this.workingCopyBackupService.resolve(this);
    const isNew = !this.isResolved();
    if (!isNew) {
      this.trace("resolveFromBackup() - exit - withoutresolving because previously new file working copy got created meanwhile");
      return true;
    }
    if (backup) {
      await this.doResolveFromBackup(backup);
      return true;
    }
    return false;
  }
  async doResolveFromBackup(backup) {
    this.trace("doResolveFromBackup()");
    await this.resolveFromContent(
      {
        resource: this.resource,
        name: this.name,
        mtime: backup.meta ? backup.meta.mtime : Date.now(),
        ctime: backup.meta ? backup.meta.ctime : Date.now(),
        size: backup.meta ? backup.meta.size : 0,
        etag: backup.meta ? backup.meta.etag : ETAG_DISABLED,
        // etag disabled if unknown!
        value: backup.value,
        readonly: false,
        locked: false,
        executable: false
      },
      true
      /* dirty (resolved from backup) */
    );
    if (backup.meta?.orphaned) {
      this.setOrphaned(true);
    }
  }
  async resolveFromFile(options3) {
    this.trace("resolveFromFile()");
    const forceReadFromFile = options3?.forceReadFromFile;
    let etag2;
    if (forceReadFromFile) {
      etag2 = ETAG_DISABLED;
    } else if (this.lastResolvedFileStat) {
      etag2 = this.lastResolvedFileStat.etag;
    }
    const currentVersionId = this.versionId;
    try {
      const content2 = await this.fileService.readFileStream(this.resource, {
        etag: etag2,
        limits: options3?.limits
      });
      this.setOrphaned(false);
      if (currentVersionId !== this.versionId) {
        this.trace("resolveFromFile() - exit - without resolving because file working copy content changed");
        return;
      }
      await this.resolveFromContent(
        content2,
        false
        /* not dirty (resolved from file) */
      );
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
  async resolveFromContent(content2, dirty) {
    this.trace("resolveFromContent() - enter");
    if (this.isDisposed()) {
      this.trace("resolveFromContent() - exit - because working copy is disposed");
      return;
    }
    this.updateLastResolvedFileStat({
      resource: this.resource,
      name: content2.name,
      mtime: content2.mtime,
      ctime: content2.ctime,
      size: content2.size,
      etag: content2.etag,
      readonly: content2.readonly,
      locked: content2.locked,
      executable: false,
      isFile: true,
      isDirectory: false,
      isSymbolicLink: false,
      children: void 0
    });
    if (this.isResolved()) {
      await this.doUpdateModel(content2.value);
    } else {
      await this.doCreateModel(content2.value);
    }
    this.setDirty(!!dirty);
    this._onDidResolve.fire();
  }
  async doCreateModel(contents) {
    this.trace("doCreateModel()");
    this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
    this.installModelListeners(this._model);
  }
  async doUpdateModel(contents) {
    this.trace("doUpdateModel()");
    this.ignoreDirtyOnModelContentChange = true;
    try {
      await this.model?.update(contents, CancellationToken.None);
    } finally {
      this.ignoreDirtyOnModelContentChange = false;
    }
  }
  installModelListeners(model) {
    this._register(model.onDidChangeContent((e) => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
    this._register(model.onWillDispose(() => this.dispose()));
  }
  onModelContentChanged(model, isUndoingOrRedoing) {
    this.trace(`onModelContentChanged() - enter`);
    this.versionId++;
    this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
    if (isUndoingOrRedoing) {
      this.lastContentChangeFromUndoRedo = Date.now();
    }
    if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
      if (model.versionId === this.savedVersionId) {
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
  }
  async forceResolveFromFile() {
    if (this.isDisposed()) {
      return;
    }
    await this.externalResolver({
      forceReadFromFile: true
    });
  }
  //#endregion
  //#region Backup
  get backupDelay() {
    return this.model?.configuration?.backupDelay;
  }
  async backup(token) {
    let meta = void 0;
    if (this.lastResolvedFileStat) {
      meta = {
        mtime: this.lastResolvedFileStat.mtime,
        ctime: this.lastResolvedFileStat.ctime,
        size: this.lastResolvedFileStat.size,
        etag: this.lastResolvedFileStat.etag,
        orphaned: this.isOrphaned()
      };
    }
    let content2 = void 0;
    if (this.isResolved()) {
      content2 = await raceCancellation(this.model.snapshot(2 /* Backup */, token), token);
    }
    return { meta, content: content2 };
  }
  static {
    this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500;
  }
  async save(options3 = /* @__PURE__ */ Object.create(null)) {
    if (!this.isResolved()) {
      return false;
    }
    if (this.isReadonly()) {
      this.trace("save() - ignoring request for readonly resource");
      return false;
    }
    if ((this.hasState(3 /* CONFLICT */) || this.hasState(5 /* ERROR */)) && (options3.reason === 2 /* AUTO */ || options3.reason === 3 /* FOCUS_CHANGE */ || options3.reason === 4 /* WINDOW_CHANGE */)) {
      this.trace("save() - ignoring auto save request for file working copy that is in conflict or error");
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
      this.model.pushStackElement();
    }
    const saveCancellation = new CancellationTokenSource();
    return this.progressService.withProgress({
      title: localize(23754, null, this.name),
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
      if (this.isResolved() && !options3.skipSaveParticipants && this.workingCopyFileService.hasSaveParticipants) {
        try {
          if (options3.reason === 2 /* AUTO */ && typeof this.lastContentChangeFromUndoRedo === "number") {
            const timeFromUndoRedoToSave = Date.now() - this.lastContentChangeFromUndoRedo;
            if (timeFromUndoRedoToSave < StoredFileWorkingCopy.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
              await timeout(StoredFileWorkingCopy.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
            }
          }
          if (!saveCancellation.token.isCancellationRequested) {
            this.ignoreSaveFromSaveParticipants = true;
            try {
              await this.workingCopyFileService.runSaveParticipants(this, { reason: options3.reason ?? 1 /* EXPLICIT */, savedFrom: options3.from }, progress, saveCancellation.token);
            } catch (err) {
              if (isCancellationError(err) && !saveCancellation.token.isCancellationRequested) {
                saveCancellation.cancel();
              }
            } finally {
              this.ignoreSaveFromSaveParticipants = false;
            }
          }
        } catch (error) {
          this.logService.error(`[stored file working copy] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString(), this.typeId);
        }
      }
      if (saveCancellation.token.isCancellationRequested) {
        return;
      }
      if (this.isDisposed()) {
        return;
      }
      if (!this.isResolved()) {
        return;
      }
      versionId = this.versionId;
      this.inErrorMode = false;
      progress.report({ message: localize(23755, null) });
      this.trace(`doSave(${versionId}) - before write()`);
      const lastResolvedFileStat = assertReturnsDefined(this.lastResolvedFileStat);
      const resolvedFileWorkingCopy = this;
      return this.saveSequentializer.run(versionId, (async () => {
        try {
          const writeFileOptions = {
            mtime: lastResolvedFileStat.mtime,
            etag: options3.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource) ? ETAG_DISABLED : lastResolvedFileStat.etag,
            unlock: options3.writeUnlock
          };
          let stat;
          if (typeof resolvedFileWorkingCopy.model.save === "function") {
            try {
              stat = await resolvedFileWorkingCopy.model.save(writeFileOptions, saveCancellation.token);
            } catch (error) {
              if (saveCancellation.token.isCancellationRequested) {
                return void 0;
              }
              throw error;
            }
          } else {
            const snapshot = await raceCancellation(resolvedFileWorkingCopy.model.snapshot(1 /* Save */, saveCancellation.token), saveCancellation.token);
            if (saveCancellation.token.isCancellationRequested) {
              return;
            } else {
              saveCancellation.dispose();
            }
            if (options3?.writeElevated && this.elevatedFileService.isSupported(lastResolvedFileStat.resource)) {
              stat = await this.elevatedFileService.writeFileElevated(lastResolvedFileStat.resource, assertReturnsDefined(snapshot), writeFileOptions);
            } else {
              stat = await this.fileService.writeFile(lastResolvedFileStat.resource, assertReturnsDefined(snapshot), writeFileOptions);
            }
          }
          this.handleSaveSuccess(stat, versionId, options3);
        } catch (error) {
          this.handleSaveError(error, versionId, options3);
        }
      })(), () => saveCancellation.cancel());
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
    (options3.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[stored file working copy] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString(), this.typeId]);
    if (options3.ignoreErrorHandler) {
      throw error;
    }
    this.setDirty(true);
    this.inErrorMode = true;
    if (error.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
      this.inConflictMode = true;
    }
    this.doHandleSaveError(error, options3);
    this._onDidSaveError.fire();
  }
  doHandleSaveError(error, options3) {
    const fileOperationError = error;
    const primaryActions = [];
    let message;
    if (fileOperationError.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
      message = localize(23756, null, this.name);
      primaryActions.push(toAction({ id: "fileWorkingCopy.overwrite", label: localize(23741, null), run: () => this.save({ ...options3, ignoreModifiedSince: true, reason: 1 /* EXPLICIT */ }) }));
      primaryActions.push(toAction({ id: "fileWorkingCopy.revert", label: localize(23750, null), run: () => this.revert() }));
    } else {
      const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FILE_WRITE_LOCKED */;
      const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
      const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FILE_PERMISSION_DENIED */;
      const canSaveElevated = this.elevatedFileService.isSupported(this.resource);
      if (isErrorWithActions(error)) {
        primaryActions.push(...error.actions);
      }
      if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
        primaryActions.push(toAction({
          id: "fileWorkingCopy.saveElevated",
          label: triedToUnlock ? isWindows ? localize(23742, null) : localize(23743, null) : isWindows ? localize(23752, null) : localize(23753, null),
          run: () => {
            this.save({ ...options3, writeElevated: true, writeUnlock: triedToUnlock, reason: 1 /* EXPLICIT */ });
          }
        }));
      } else if (isWriteLocked) {
        primaryActions.push(toAction({ id: "fileWorkingCopy.unlock", label: localize(23741, null), run: () => this.save({ ...options3, writeUnlock: true, reason: 1 /* EXPLICIT */ }) }));
      } else {
        primaryActions.push(toAction({ id: "fileWorkingCopy.retry", label: localize(23749, null), run: () => this.save({ ...options3, reason: 1 /* EXPLICIT */ }) }));
      }
      primaryActions.push(toAction({
        id: "fileWorkingCopy.saveAs",
        label: localize(23751, null),
        run: async () => {
          const editor = this.workingCopyEditorService.findEditor(this);
          if (editor) {
            const result = await this.editorService.save(editor, { saveAs: true, reason: 1 /* EXPLICIT */ });
            if (!result.success) {
              this.doHandleSaveError(error, options3);
            }
          }
        }
      }));
      primaryActions.push(toAction({ id: "fileWorkingCopy.revert", label: localize(23750, null), run: () => this.revert() }));
      if (isWriteLocked) {
        if (triedToUnlock && canSaveElevated) {
          message = isWindows ? localize(23747, null, this.name) : localize(23748, null, this.name);
        } else {
          message = localize(23746, null, this.name);
        }
      } else if (canSaveElevated && isPermissionDenied) {
        message = isWindows ? localize(23744, null, this.name) : localize(23745, null, this.name);
      } else {
        message = localize(23740, null, this.name, toErrorMessage(error, false));
      }
    }
    const handle2 = this.notificationService.notify({ id: `${hash(this.resource.toString())}`, severity: Severity2.Error, message, actions: { primary: primaryActions } });
    const listener = this._register(Event2.once(Event2.any(this.onDidSave, this.onDidRevert))(() => handle2.close()));
    this._register(Event2.once(handle2.onDidClose)(() => listener.dispose()));
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
  //#region Revert
  async revert(options3) {
    if (!this.isResolved() || !this.dirty && !options3?.force) {
      return;
    }
    this.trace("revert()");
    const wasDirty = this.dirty;
    const undoSetDirty = this.doSetDirty(false);
    const softUndo = options3?.soft;
    if (!softUndo) {
      try {
        await this.forceResolveFromFile();
      } catch (error) {
        if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
          undoSetDirty();
          throw error;
        }
      }
    }
    this._onDidRevert.fire();
    if (wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  hasState(state) {
    switch (state) {
      case 3 /* CONFLICT */:
        return this.inConflictMode;
      case 1 /* DIRTY */:
        return this.dirty;
      case 5 /* ERROR */:
        return this.inErrorMode;
      case 4 /* ORPHAN */:
        return this.isOrphaned();
      case 2 /* PENDING_SAVE */:
        return this.saveSequentializer.isRunning();
      case 0 /* SAVED */:
        return !this.dirty;
    }
  }
  async joinState(state) {
    return this.saveSequentializer.running;
  }
  //#endregion
  //#region Utilities
  isReadonly() {
    return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
  }
  trace(msg) {
    this.logService.trace(`[stored file working copy] ${msg}`, this.resource.toString(), this.typeId);
  }
  //#endregion
  //#region Dispose
  dispose() {
    this.trace("dispose()");
    this.inConflictMode = false;
    this.inErrorMode = false;
    this._model = void 0;
    super.dispose();
  }
  //#endregion
};

StoredFileWorkingCopy = __decorateClass([
  __decorateParam(5, IFileService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IWorkingCopyFileService),
  __decorateParam(8, IFilesConfigurationService),
  __decorateParam(9, IWorkingCopyBackupService),
  __decorateParam(10, IWorkingCopyService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IWorkingCopyEditorService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IElevatedFileService),
  __decorateParam(15, IProgressService)
], StoredFileWorkingCopy);
export { isStoredFileWorkingCopySaveEvent, StoredFileWorkingCopy };
