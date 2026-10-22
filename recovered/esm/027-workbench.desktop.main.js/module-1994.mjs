// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager.ts
import { BaseFileWorkingCopyManager } from "./module-1991.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { UntitledFileWorkingCopy } from "./module-1993.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";


// src/vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager.ts
var UntitledFileWorkingCopyManager = class extends BaseFileWorkingCopyManager {
  constructor(workingCopyTypeId, modelFactory, saveDelegate, fileService, labelService, logService, workingCopyBackupService, workingCopyService) {
    super(fileService, logService, workingCopyBackupService);
    this.workingCopyTypeId = workingCopyTypeId;
    this.modelFactory = modelFactory;
    this.saveDelegate = saveDelegate;
    this.labelService = labelService;
    this.workingCopyService = workingCopyService;
    //#region Events
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    //#endregion
    this.mapResourceToWorkingCopyListeners = new ResourceMap();
  }
  async resolve(options3) {
    const workingCopy = this.doCreateOrGet(options3);
    await workingCopy.resolve();
    return workingCopy;
  }
  doCreateOrGet(options3 = /* @__PURE__ */ Object.create(null)) {
    const massagedOptions = this.massageOptions(options3);
    if (massagedOptions.untitledResource) {
      const existingWorkingCopy = this.get(massagedOptions.untitledResource);
      if (existingWorkingCopy) {
        return existingWorkingCopy;
      }
    }
    return this.doCreate(massagedOptions);
  }
  massageOptions(options3) {
    const massagedOptions = /* @__PURE__ */ Object.create(null);
    if (options3.associatedResource) {
      massagedOptions.untitledResource = URI.from({
        scheme: Schemas.untitled,
        authority: options3.associatedResource.authority,
        fragment: options3.associatedResource.fragment,
        path: options3.associatedResource.path,
        query: options3.associatedResource.query
      });
      massagedOptions.associatedResource = options3.associatedResource;
    } else {
      if (options3.untitledResource?.scheme === Schemas.untitled) {
        massagedOptions.untitledResource = options3.untitledResource;
      }
      massagedOptions.isScratchpad = options3.isScratchpad;
    }
    massagedOptions.contents = options3.contents;
    return massagedOptions;
  }
  doCreate(options3) {
    let untitledResource = options3.untitledResource;
    if (!untitledResource) {
      let counter = 1;
      do {
        untitledResource = URI.from({
          scheme: Schemas.untitled,
          path: options3.isScratchpad ? `Scratchpad-${counter}` : `Untitled-${counter}`,
          query: this.workingCopyTypeId ? `typeId=${this.workingCopyTypeId}` : (
            // distinguish untitled resources among others by encoding the `typeId` as query param
            void 0
          )
          // keep untitled resources for text files as they are (when `typeId === ''`)
        });
        counter++;
      } while (this.has(untitledResource));
    }
    const workingCopy = new UntitledFileWorkingCopy(
      this.workingCopyTypeId,
      untitledResource,
      this.labelService.getUriBasenameLabel(untitledResource),
      !!options3.associatedResource,
      !!options3.isScratchpad,
      options3.contents,
      this.modelFactory,
      this.saveDelegate,
      this.workingCopyService,
      this.workingCopyBackupService,
      this.logService
    );
    this.registerWorkingCopy(workingCopy);
    return workingCopy;
  }
  registerWorkingCopy(workingCopy) {
    const workingCopyListeners = new DisposableStore();
    workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onWillDispose(() => this._onWillDispose.fire(workingCopy)));
    this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
    this.add(workingCopy.resource, workingCopy);
    if (workingCopy.isDirty()) {
      this._onDidChangeDirty.fire(workingCopy);
    }
  }
  remove(resource) {
    const removed = super.remove(resource);
    const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
    if (workingCopyListener) {
      dispose(workingCopyListener);
      this.mapResourceToWorkingCopyListeners.delete(resource);
    }
    return removed;
  }
  //#endregion
  //#region Lifecycle
  dispose() {
    super.dispose();
    dispose(this.mapResourceToWorkingCopyListeners.values());
    this.mapResourceToWorkingCopyListeners.clear();
  }
  //#endregion
  notifyDidSave(source, target) {
    this._onDidSave.fire({ source, target });
  }
};

UntitledFileWorkingCopyManager = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IWorkingCopyBackupService),
  __decorateParam(7, IWorkingCopyService)
], UntitledFileWorkingCopyManager);
export { UntitledFileWorkingCopyManager };
