// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/untitledFileWorkingCopy.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { emptyStream } from "./module-0037.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/workingCopy/common/untitledFileWorkingCopy.ts
var UntitledFileWorkingCopy = class extends Disposable {
  //#endregion
  constructor(typeId2, resource, name, hasAssociatedFilePath, isScratchpad, initialContents, modelFactory, saveDelegate, workingCopyService, workingCopyBackupService, logService) {
    super();
    this.typeId = typeId2;
    this.resource = resource;
    this.name = name;
    this.hasAssociatedFilePath = hasAssociatedFilePath;
    this.isScratchpad = isScratchpad;
    this.initialContents = initialContents;
    this.modelFactory = modelFactory;
    this.saveDelegate = saveDelegate;
    this.workingCopyBackupService = workingCopyBackupService;
    this.logService = logService;
    this._model = void 0;
    //#region Events
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidRevert = this._register(new Emitter());
    this.onDidRevert = this._onDidRevert.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this.capabilities = this.isScratchpad ? 2 /* Untitled */ | 4 /* Scratchpad */ : 2 /* Untitled */;
    this.modified = this.hasAssociatedFilePath || Boolean(this.initialContents && this.initialContents.markModified !== false);
    this._register(workingCopyService.registerWorkingCopy(this));
  }
  get model() {
    return this._model;
  }
  isDirty() {
    return this.modified && !this.isScratchpad;
  }
  isModified() {
    return this.modified;
  }
  setModified(modified) {
    if (this.modified === modified) {
      return;
    }
    this.modified = modified;
    if (!this.isScratchpad) {
      this._onDidChangeDirty.fire();
    }
  }
  //#endregion
  //#region Resolve
  async resolve() {
    this.trace("resolve()");
    if (this.isResolved()) {
      this.trace("resolve() - exit (already resolved)");
      return;
    }
    let untitledContents;
    const backup = await this.workingCopyBackupService.resolve(this);
    if (backup) {
      this.trace("resolve() - with backup");
      untitledContents = backup.value;
    } else if (this.initialContents?.value) {
      this.trace("resolve() - with initial contents");
      untitledContents = this.initialContents.value;
    } else {
      this.trace("resolve() - empty");
      untitledContents = emptyStream();
    }
    await this.doCreateModel(untitledContents);
    this.setModified(this.hasAssociatedFilePath || !!backup || Boolean(this.initialContents && this.initialContents.markModified !== false));
    if (!!backup || this.initialContents) {
      this._onDidChangeContent.fire();
    }
  }
  async doCreateModel(contents) {
    this.trace("doCreateModel()");
    this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
    this.installModelListeners(this._model);
  }
  installModelListeners(model) {
    this._register(model.onDidChangeContent((e) => this.onModelContentChanged(e)));
    this._register(model.onWillDispose(() => this.dispose()));
  }
  onModelContentChanged(e) {
    if (!this.hasAssociatedFilePath && e.isInitial) {
      this.setModified(false);
    } else {
      this.setModified(true);
    }
    this._onDidChangeContent.fire();
  }
  isResolved() {
    return !!this.model;
  }
  //#endregion
  //#region Backup
  get backupDelay() {
    return this.model?.configuration?.backupDelay;
  }
  async backup(token) {
    let content2 = void 0;
    if (this.isResolved()) {
      content2 = await raceCancellation(this.model.snapshot(2 /* Backup */, token), token);
    } else if (this.initialContents) {
      content2 = this.initialContents.value;
    }
    return { content: content2 };
  }
  //#endregion
  //#region Save
  async save(options3) {
    this.trace("save()");
    const result = await this.saveDelegate(this, options3);
    if (result) {
      this._onDidSave.fire({ reason: options3?.reason, source: options3?.source });
    }
    return result;
  }
  //#endregion
  //#region Revert
  async revert() {
    this.trace("revert()");
    this.setModified(false);
    this._onDidRevert.fire();
    this.dispose();
  }
  //#endregion
  dispose() {
    this.trace("dispose()");
    this._onWillDispose.fire();
    super.dispose();
  }
  trace(msg) {
    this.logService.trace(`[untitled file working copy] ${msg}`, this.resource.toString(), this.typeId);
  }
};

UntitledFileWorkingCopy = __decorateClass([
  __decorateParam(8, IWorkingCopyService),
  __decorateParam(9, IWorkingCopyBackupService),
  __decorateParam(10, ILogService)
], UntitledFileWorkingCopy);
export { UntitledFileWorkingCopy };
