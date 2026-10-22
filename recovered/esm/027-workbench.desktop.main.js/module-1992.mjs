// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager.ts
import { BaseFileWorkingCopyManager } from "./module-1991.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Promises, ResourceQueue } from "./module-0036.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { joinPath } from "./module-0034.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { StoredFileWorkingCopy } from "./module-1398.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IElevatedFileService } from "./module-1397.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager.ts
var StoredFileWorkingCopyManager = class extends BaseFileWorkingCopyManager {
  constructor(workingCopyTypeId, modelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, progressService) {
    super(fileService, logService, workingCopyBackupService);
    this.workingCopyTypeId = workingCopyTypeId;
    this.modelFactory = modelFactory;
    this.lifecycleService = lifecycleService;
    this.labelService = labelService;
    this.workingCopyFileService = workingCopyFileService;
    this.uriIdentityService = uriIdentityService;
    this.filesConfigurationService = filesConfigurationService;
    this.workingCopyService = workingCopyService;
    this.notificationService = notificationService;
    this.workingCopyEditorService = workingCopyEditorService;
    this.editorService = editorService;
    this.elevatedFileService = elevatedFileService;
    this.progressService = progressService;
    //#region Events
    this._onDidResolve = this._register(new Emitter());
    this.onDidResolve = this._onDidResolve.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeReadonly = this._register(new Emitter());
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    this._onDidChangeOrphaned = this._register(new Emitter());
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this._onDidSaveError = this._register(new Emitter());
    this.onDidSaveError = this._onDidSaveError.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidRevert = this._register(new Emitter());
    this.onDidRevert = this._onDidRevert.event;
    this._onDidRemove = this._register(new Emitter());
    this.onDidRemove = this._onDidRemove.event;
    //#endregion
    this.mapResourceToWorkingCopyListeners = new ResourceMap();
    this.mapResourceToPendingWorkingCopyResolve = new ResourceMap();
    this.workingCopyResolveQueue = this._register(new ResourceQueue());
    //#endregion
    //#region Working Copy File Events
    this.mapCorrelationIdToWorkingCopiesToRestore = /* @__PURE__ */ new Map();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e) => this.onDidChangeFileSystemProviderCapabilities(e)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e) => this.onDidChangeFileSystemProviderRegistrations(e)));
    this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => this.onWillRunWorkingCopyFileOperation(e)));
    this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation((e) => this.onDidFailWorkingCopyFileOperation(e)));
    this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => this.onDidRunWorkingCopyFileOperation(e)));
    if (isWeb) {
      this._register(this.lifecycleService.onBeforeShutdown((event) => event.veto(this.onBeforeShutdownWeb(), "veto.fileWorkingCopyManager")));
    } else {
      this._register(this.lifecycleService.onWillShutdown((event) => event.join(this.onWillShutdownDesktop(), { id: "join.fileWorkingCopyManager", label: localize(23757, null) })));
    }
  }
  onBeforeShutdownWeb() {
    if (this.workingCopies.some((workingCopy) => workingCopy.hasState(2 /* PENDING_SAVE */))) {
      return true;
    }
    return false;
  }
  async onWillShutdownDesktop() {
    let pendingSavedWorkingCopies;
    while ((pendingSavedWorkingCopies = this.workingCopies.filter((workingCopy) => workingCopy.hasState(2 /* PENDING_SAVE */))).length > 0) {
      await Promises.settled(pendingSavedWorkingCopies.map((workingCopy) => workingCopy.joinState(2 /* PENDING_SAVE */)));
    }
  }
  //#region Resolve from file or file provider changes
  onDidChangeFileSystemProviderCapabilities(e) {
    this.queueWorkingCopyReloads(e.scheme);
  }
  onDidChangeFileSystemProviderRegistrations(e) {
    if (!e.added) {
      return;
    }
    this.queueWorkingCopyReloads(e.scheme);
  }
  onDidFilesChange(e) {
    this.queueWorkingCopyReloads(e);
  }
  queueWorkingCopyReloads(schemeOrEvent) {
    for (const workingCopy of this.workingCopies) {
      if (workingCopy.isDirty()) {
        continue;
      }
      let resolveWorkingCopy = false;
      if (typeof schemeOrEvent === "string") {
        resolveWorkingCopy = schemeOrEvent === workingCopy.resource.scheme;
      } else {
        resolveWorkingCopy = schemeOrEvent.contains(workingCopy.resource, 0 /* UPDATED */, 1 /* ADDED */);
      }
      if (resolveWorkingCopy) {
        this.queueWorkingCopyReload(workingCopy);
      }
    }
  }
  queueWorkingCopyReload(workingCopy) {
    const queueSize = this.workingCopyResolveQueue.queueSize(workingCopy.resource);
    if (queueSize <= 1) {
      this.workingCopyResolveQueue.queueFor(workingCopy.resource, async () => {
        try {
          await this.reload(workingCopy);
        } catch (error) {
          this.logService.error(error);
        }
      });
    }
  }
  onWillRunWorkingCopyFileOperation(e) {
    if (e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */) {
      e.waitUntil((async () => {
        const workingCopiesToRestore = [];
        for (const { source, target } of e.files) {
          if (source) {
            if (this.uriIdentityService.extUri.isEqual(source, target)) {
              continue;
            }
            const sourceWorkingCopies = [];
            for (const workingCopy of this.workingCopies) {
              if (this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, source)) {
                sourceWorkingCopies.push(workingCopy);
              }
            }
            for (const sourceWorkingCopy of sourceWorkingCopies) {
              const sourceResource = sourceWorkingCopy.resource;
              let targetResource;
              if (this.uriIdentityService.extUri.isEqual(sourceResource, source)) {
                targetResource = target;
              } else {
                targetResource = joinPath(target, sourceResource.path.substr(source.path.length + 1));
              }
              workingCopiesToRestore.push({
                source: sourceResource,
                target: targetResource,
                snapshot: sourceWorkingCopy.isDirty() ? await sourceWorkingCopy.model?.snapshot(1 /* Save */, CancellationToken.None) : void 0
              });
            }
          }
        }
        this.mapCorrelationIdToWorkingCopiesToRestore.set(e.correlationId, workingCopiesToRestore);
      })());
    }
  }
  onDidFailWorkingCopyFileOperation(e) {
    if (e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */) {
      const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
      if (workingCopiesToRestore) {
        this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
        for (const workingCopy of workingCopiesToRestore) {
          if (workingCopy.snapshot) {
            this.get(workingCopy.source)?.markModified();
          }
        }
      }
    }
  }
  onDidRunWorkingCopyFileOperation(e) {
    switch (e.operation) {
      // Create: Revert existing working copies
      case 0 /* CREATE */:
        e.waitUntil((async () => {
          for (const { target } of e.files) {
            const workingCopy = this.get(target);
            if (workingCopy && !workingCopy.isDisposed()) {
              await workingCopy.revert();
            }
          }
        })());
        break;
      // Move/Copy: restore working copies that were loaded before the operation took place
      case 2 /* MOVE */:
      case 3 /* COPY */:
        e.waitUntil((async () => {
          const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
          if (workingCopiesToRestore) {
            this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
            await Promises.settled(workingCopiesToRestore.map(async (workingCopyToRestore) => {
              const target = this.uriIdentityService.asCanonicalUri(workingCopyToRestore.target);
              await this.resolve(target, {
                reload: { async: false },
                // enforce a reload
                contents: workingCopyToRestore.snapshot
              });
            }));
          }
        })());
        break;
    }
  }
  //#endregion
  //#region Reload & Resolve
  async reload(workingCopy) {
    await this.joinPendingResolves(workingCopy.resource);
    if (workingCopy.isDirty() || workingCopy.isDisposed() || !this.has(workingCopy.resource)) {
      return;
    }
    await this.doResolve(workingCopy, { reload: { async: false } });
  }
  async resolve(resource, options3) {
    const pendingResolve = this.joinPendingResolves(resource);
    if (pendingResolve) {
      await pendingResolve;
    }
    return this.doResolve(resource, options3);
  }
  async doResolve(resourceOrWorkingCopy, options3) {
    let workingCopy;
    let resource;
    if (URI.isUri(resourceOrWorkingCopy)) {
      resource = resourceOrWorkingCopy;
      workingCopy = this.get(resource);
    } else {
      resource = resourceOrWorkingCopy.resource;
      workingCopy = resourceOrWorkingCopy;
    }
    let workingCopyResolve;
    let didCreateWorkingCopy = false;
    const resolveOptions3 = {
      contents: options3?.contents,
      forceReadFromFile: options3?.reload?.force,
      limits: options3?.limits
    };
    if (workingCopy) {
      if (options3?.contents) {
        workingCopyResolve = workingCopy.resolve(resolveOptions3);
      } else if (options3?.reload) {
        if (options3.reload.async) {
          workingCopyResolve = Promise.resolve();
          (async () => {
            try {
              await workingCopy.resolve(resolveOptions3);
            } catch (error) {
              if (!workingCopy.isDisposed()) {
                onUnexpectedError(error);
              }
            }
          })();
        } else {
          workingCopyResolve = workingCopy.resolve(resolveOptions3);
        }
      } else {
        workingCopyResolve = Promise.resolve();
      }
    } else {
      didCreateWorkingCopy = true;
      workingCopy = new StoredFileWorkingCopy(
        this.workingCopyTypeId,
        resource,
        this.labelService.getUriBasenameLabel(resource),
        this.modelFactory,
        async (options4) => {
          await this.resolve(resource, { ...options4, reload: { async: false } });
        },
        this.fileService,
        this.logService,
        this.workingCopyFileService,
        this.filesConfigurationService,
        this.workingCopyBackupService,
        this.workingCopyService,
        this.notificationService,
        this.workingCopyEditorService,
        this.editorService,
        this.elevatedFileService,
        this.progressService
      );
      workingCopyResolve = workingCopy.resolve(resolveOptions3);
      this.registerWorkingCopy(workingCopy);
    }
    this.mapResourceToPendingWorkingCopyResolve.set(resource, workingCopyResolve);
    this.add(resource, workingCopy);
    if (didCreateWorkingCopy) {
      if (workingCopy.isDirty()) {
        this._onDidChangeDirty.fire(workingCopy);
      }
    }
    try {
      await workingCopyResolve;
    } catch (error) {
      if (didCreateWorkingCopy) {
        workingCopy.dispose();
      }
      throw error;
    } finally {
      this.mapResourceToPendingWorkingCopyResolve.delete(resource);
    }
    if (didCreateWorkingCopy && workingCopy.isDirty()) {
      this._onDidChangeDirty.fire(workingCopy);
    }
    return workingCopy;
  }
  joinPendingResolves(resource) {
    const pendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
    if (!pendingWorkingCopyResolve) {
      return;
    }
    return this.doJoinPendingResolves(resource);
  }
  async doJoinPendingResolves(resource) {
    let currentWorkingCopyResolve;
    while (this.mapResourceToPendingWorkingCopyResolve.has(resource)) {
      const nextPendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
      if (nextPendingWorkingCopyResolve === currentWorkingCopyResolve) {
        return;
      }
      currentWorkingCopyResolve = nextPendingWorkingCopyResolve;
      try {
        await nextPendingWorkingCopyResolve;
      } catch (error) {
      }
    }
  }
  registerWorkingCopy(workingCopy) {
    const workingCopyListeners = new DisposableStore();
    workingCopyListeners.add(workingCopy.onDidResolve(() => this._onDidResolve.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onDidSaveError(() => this._onDidSaveError.fire(workingCopy)));
    workingCopyListeners.add(workingCopy.onDidSave((e) => this._onDidSave.fire({ workingCopy, ...e })));
    workingCopyListeners.add(workingCopy.onDidRevert(() => this._onDidRevert.fire(workingCopy)));
    this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
  }
  remove(resource) {
    const removed = super.remove(resource);
    const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
    if (workingCopyListener) {
      dispose(workingCopyListener);
      this.mapResourceToWorkingCopyListeners.delete(resource);
    }
    if (removed) {
      this._onDidRemove.fire(resource);
    }
    return removed;
  }
  //#endregion
  //#region Lifecycle
  canDispose(workingCopy) {
    if (workingCopy.isDisposed() || !this.mapResourceToPendingWorkingCopyResolve.has(workingCopy.resource) && !workingCopy.isDirty()) {
      return true;
    }
    return this.doCanDispose(workingCopy);
  }
  async doCanDispose(workingCopy) {
    const pendingResolve = this.joinPendingResolves(workingCopy.resource);
    if (pendingResolve) {
      await pendingResolve;
      return this.canDispose(workingCopy);
    }
    if (workingCopy.isDirty()) {
      await Event2.toPromise(workingCopy.onDidChangeDirty);
      return this.canDispose(workingCopy);
    }
    return true;
  }
  dispose() {
    super.dispose();
    this.mapResourceToPendingWorkingCopyResolve.clear();
    dispose(this.mapResourceToWorkingCopyListeners.values());
    this.mapResourceToWorkingCopyListeners.clear();
  }
  //#endregion
};

StoredFileWorkingCopyManager = __decorateClass([
  __decorateParam(2, IFileService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IWorkingCopyFileService),
  __decorateParam(7, IWorkingCopyBackupService),
  __decorateParam(8, IUriIdentityService),
  __decorateParam(9, IFilesConfigurationService),
  __decorateParam(10, IWorkingCopyService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IWorkingCopyEditorService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IElevatedFileService),
  __decorateParam(15, IProgressService)
], StoredFileWorkingCopyManager);
export { StoredFileWorkingCopyManager };
