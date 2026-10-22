// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/resourceWorkingCopy.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { timeout } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/services/workingCopy/common/resourceWorkingCopy.ts
var ResourceWorkingCopy = class extends Disposable {
  constructor(resource, fileService) {
    super();
    this.resource = resource;
    this.fileService = fileService;
    //#region Orphaned Tracking
    this._onDidChangeOrphaned = this._register(new Emitter());
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this.orphaned = false;
    //#endregion
    //#region Dispose
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._register(this.fileService.onDidFilesChange((e4) => this.onDidFilesChange(e4)));
  }
  isOrphaned() {
    return this.orphaned;
  }
  async onDidFilesChange(e4) {
    let fileEventImpactsUs = false;
    let newInOrphanModeGuess;
    if (this.orphaned) {
      const fileWorkingCopyResourceAdded = e4.contains(this.resource, 1 /* ADDED */);
      if (fileWorkingCopyResourceAdded) {
        newInOrphanModeGuess = false;
        fileEventImpactsUs = true;
      }
    } else {
      const fileWorkingCopyResourceDeleted = e4.contains(this.resource, 2 /* DELETED */);
      if (fileWorkingCopyResourceDeleted) {
        newInOrphanModeGuess = true;
        fileEventImpactsUs = true;
      }
    }
    if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
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
      if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
        this.setOrphaned(newInOrphanModeValidated);
      }
    }
  }
  setOrphaned(orphaned) {
    if (this.orphaned !== orphaned) {
      this.orphaned = orphaned;
      this._onDidChangeOrphaned.fire();
    }
  }
  isDisposed() {
    return this._store.isDisposed;
  }
  dispose() {
    this.orphaned = false;
    this._onWillDispose.fire();
    super.dispose();
  }
  //#endregion
  //#region Modified Tracking
  isModified() {
    return this.isDirty();
  }
  //#endregion
};

ResourceWorkingCopy = __decorateClass([
  __decorateParam(1, IFileService)
], ResourceWorkingCopy);
export { ResourceWorkingCopy };
