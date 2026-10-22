// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Promises } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";


// src/vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager.ts
var BaseFileWorkingCopyManager = class extends Disposable {
  constructor(fileService, logService, workingCopyBackupService) {
    super();
    this.fileService = fileService;
    this.logService = logService;
    this.workingCopyBackupService = workingCopyBackupService;
    this._onDidCreate = this._register(new Emitter());
    this.onDidCreate = this._onDidCreate.event;
    this.mapResourceToWorkingCopy = new ResourceMap();
    this.mapResourceToDisposeListener = new ResourceMap();
  }
  has(resource) {
    return this.mapResourceToWorkingCopy.has(resource);
  }
  add(resource, workingCopy) {
    const knownWorkingCopy = this.get(resource);
    if (knownWorkingCopy === workingCopy) {
      return;
    }
    this.mapResourceToWorkingCopy.set(resource, workingCopy);
    this.mapResourceToDisposeListener.get(resource)?.dispose();
    this.mapResourceToDisposeListener.set(resource, workingCopy.onWillDispose(() => this.remove(resource)));
    this._onDidCreate.fire(workingCopy);
  }
  remove(resource) {
    const disposeListener = this.mapResourceToDisposeListener.get(resource);
    if (disposeListener) {
      dispose(disposeListener);
      this.mapResourceToDisposeListener.delete(resource);
    }
    return this.mapResourceToWorkingCopy.delete(resource);
  }
  //#region Get / Get all
  get workingCopies() {
    return [...this.mapResourceToWorkingCopy.values()];
  }
  get(resource) {
    return this.mapResourceToWorkingCopy.get(resource);
  }
  //#endregion
  //#region Lifecycle
  dispose() {
    super.dispose();
    this.mapResourceToWorkingCopy.clear();
    dispose(this.mapResourceToDisposeListener.values());
    this.mapResourceToDisposeListener.clear();
  }
  async destroy() {
    try {
      await Promises.settled(this.workingCopies.map(async (workingCopy) => {
        if (workingCopy.isDirty()) {
          await this.saveWithFallback(workingCopy);
        }
      }));
    } catch (error) {
      this.logService.error(error);
    }
    dispose(this.mapResourceToWorkingCopy.values());
    this.dispose();
  }
  async saveWithFallback(workingCopy) {
    let saveSuccess = false;
    try {
      saveSuccess = await workingCopy.save();
    } catch (error) {
    }
    if (!saveSuccess || workingCopy.isDirty()) {
      const backup = await this.workingCopyBackupService.resolve(workingCopy);
      if (backup) {
        await this.fileService.writeFile(workingCopy.resource, backup.value, { unlock: true });
      }
    }
  }
  //#endregion
};

BaseFileWorkingCopyManager = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IWorkingCopyBackupService)
], BaseFileWorkingCopyManager);
export { BaseFileWorkingCopyManager };
