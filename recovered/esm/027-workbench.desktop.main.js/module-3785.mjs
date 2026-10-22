// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/common/textFileEditorModelManager.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Promises, ResourceQueue } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { TextFileSaveParticipant } from "./module-3784.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { extname2, joinPath } from "./module-0034.mjs";
import { createTextBufferFactoryFromSnapshot } from "./module-0423.mjs";
import { PLAINTEXT_EXTENSION, PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { URI } from "./module-0032.mjs";
import { TextFileEditorModel } from "./module-1653.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/services/textfile/common/textFileEditorModelManager.ts
var TextFileEditorModelManager = class extends Disposable {
  constructor(instantiationService, fileService, notificationService, workingCopyFileService, uriIdentityService) {
    super();
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.workingCopyFileService = workingCopyFileService;
    this.uriIdentityService = uriIdentityService;
    this._onDidCreate = this._register(new Emitter({
      leakWarningThreshold: 500,
      leakWarningName: "TextFileEditorModelManager._onDidCreate"
      /* increased for users with hundreds of inputs opened */
    }));
    this.onDidCreate = this._onDidCreate.event;
    this._onDidResolve = this._register(new Emitter());
    this.onDidResolve = this._onDidResolve.event;
    this._onDidRemove = this._register(new Emitter());
    this.onDidRemove = this._onDidRemove.event;
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
    this._onDidChangeEncoding = this._register(new Emitter());
    this.onDidChangeEncoding = this._onDidChangeEncoding.event;
    this.mapResourceToModel = new ResourceMap();
    this.mapResourceToModelListeners = new ResourceMap();
    this.mapResourceToDisposeListener = new ResourceMap();
    this.mapResourceToPendingModelResolvers = new ResourceMap();
    this.modelResolveQueue = this._register(new ResourceQueue());
    this.saveErrorHandler = (() => {
      const notificationService = this.notificationService;
      return {
        onSaveError(error, model) {
          notificationService.error(localize(23383, null, model.name, toErrorMessage(error, false)));
        }
      };
    })();
    this.mapCorrelationIdToModelsToRestore = /* @__PURE__ */ new Map();
    this.saveParticipants = this._register(this.instantiationService.createInstance(TextFileSaveParticipant));
    this.registerListeners();
  }
  get models() {
    return [...this.mapResourceToModel.values()];
  }
  registerListeners() {
    this._register(this.fileService.onDidFilesChange((e) => this.onDidFilesChange(e)));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e) => this.onDidChangeFileSystemProviderCapabilities(e)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e) => this.onDidChangeFileSystemProviderRegistrations(e)));
    this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation((e) => this.onWillRunWorkingCopyFileOperation(e)));
    this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation((e) => this.onDidFailWorkingCopyFileOperation(e)));
    this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation((e) => this.onDidRunWorkingCopyFileOperation(e)));
  }
  onDidFilesChange(e) {
    for (const model of this.models) {
      if (model.isDirty()) {
        continue;
      }
      if (e.contains(model.resource, 0 /* UPDATED */, 1 /* ADDED */)) {
        this.queueModelReload(model);
      }
    }
  }
  onDidChangeFileSystemProviderCapabilities(e) {
    this.queueModelReloads(e.scheme);
  }
  onDidChangeFileSystemProviderRegistrations(e) {
    if (!e.added) {
      return;
    }
    this.queueModelReloads(e.scheme);
  }
  queueModelReloads(scheme) {
    for (const model of this.models) {
      if (model.isDirty()) {
        continue;
      }
      if (scheme === model.resource.scheme) {
        this.queueModelReload(model);
      }
    }
  }
  queueModelReload(model) {
    const queueSize = this.modelResolveQueue.queueSize(model.resource);
    if (queueSize <= 1) {
      this.modelResolveQueue.queueFor(model.resource, async () => {
        try {
          await this.reload(model);
        } catch (error) {
          onUnexpectedError(error);
        }
      });
    }
  }
  onWillRunWorkingCopyFileOperation(e) {
    if (e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */) {
      const modelsToRestore = [];
      for (const { source, target } of e.files) {
        if (source) {
          if (this.uriIdentityService.extUri.isEqual(source, target)) {
            continue;
          }
          const sourceModels = [];
          for (const model of this.models) {
            if (this.uriIdentityService.extUri.isEqualOrParent(model.resource, source)) {
              sourceModels.push(model);
            }
          }
          for (const sourceModel of sourceModels) {
            const sourceModelResource = sourceModel.resource;
            let targetModelResource;
            if (this.uriIdentityService.extUri.isEqual(sourceModelResource, source)) {
              targetModelResource = target;
            } else {
              targetModelResource = joinPath(target, sourceModelResource.path.substr(source.path.length + 1));
            }
            const languageId = sourceModel.getLanguageId();
            modelsToRestore.push({
              source: sourceModelResource,
              target: targetModelResource,
              language: languageId ? {
                id: languageId,
                explicit: sourceModel.languageChangeSource === "user"
              } : void 0,
              encoding: sourceModel.getEncoding(),
              snapshot: sourceModel.isDirty() ? sourceModel.createSnapshot() : void 0
            });
          }
        }
      }
      this.mapCorrelationIdToModelsToRestore.set(e.correlationId, modelsToRestore);
    }
  }
  onDidFailWorkingCopyFileOperation(e) {
    if (e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */) {
      const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
      if (modelsToRestore) {
        this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
        modelsToRestore.forEach((model) => {
          if (model.snapshot) {
            this.get(model.source)?.setDirty(true);
          }
        });
      }
    }
  }
  onDidRunWorkingCopyFileOperation(e) {
    switch (e.operation) {
      // Create: Revert existing models
      case 0 /* CREATE */:
        e.waitUntil((async () => {
          for (const { target } of e.files) {
            const model = this.get(target);
            if (model && !model.isDisposed()) {
              await model.revert();
            }
          }
        })());
        break;
      // Move/Copy: restore models that were resolved before the operation took place
      case 2 /* MOVE */:
      case 3 /* COPY */:
        e.waitUntil((async () => {
          const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
          if (modelsToRestore) {
            this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
            await Promises.settled(modelsToRestore.map(async (modelToRestore) => {
              const target = this.uriIdentityService.asCanonicalUri(modelToRestore.target);
              const restoredModel = await this.resolve(target, {
                reload: { async: false },
                // enforce a reload
                contents: modelToRestore.snapshot ? createTextBufferFactoryFromSnapshot(modelToRestore.snapshot) : void 0,
                encoding: modelToRestore.encoding
              });
              if (modelToRestore.language?.id && modelToRestore.language.id !== PLAINTEXT_LANGUAGE_ID) {
                if (modelToRestore.language.explicit) {
                  restoredModel.setLanguageId(modelToRestore.language.id);
                } else if (restoredModel.getLanguageId() === PLAINTEXT_LANGUAGE_ID && extname2(target) !== PLAINTEXT_EXTENSION) {
                  restoredModel.updateTextEditorModel(void 0, modelToRestore.language.id);
                }
              }
            }));
          }
        })());
        break;
    }
  }
  get(resource) {
    return this.mapResourceToModel.get(resource);
  }
  has(resource) {
    return this.mapResourceToModel.has(resource);
  }
  async reload(model) {
    await this.joinPendingResolves(model.resource);
    if (model.isDirty() || model.isDisposed() || !this.has(model.resource)) {
      return;
    }
    await this.doResolve(model, { reload: { async: false } });
  }
  async resolve(resource, options3) {
    const pendingResolve = this.joinPendingResolves(resource);
    if (pendingResolve) {
      await pendingResolve;
    }
    return this.doResolve(resource, options3);
  }
  async doResolve(resourceOrModel, options3) {
    let model;
    let resource;
    if (URI.isUri(resourceOrModel)) {
      resource = resourceOrModel;
      model = this.get(resource);
    } else {
      resource = resourceOrModel.resource;
      model = resourceOrModel;
    }
    let modelResolve;
    let didCreateModel = false;
    if (model) {
      if (options3?.contents) {
        modelResolve = model.resolve(options3);
      } else if (options3?.reload) {
        if (options3.reload.async) {
          modelResolve = Promise.resolve();
          (async () => {
            try {
              await model.resolve(options3);
            } catch (error) {
              if (!model.isDisposed()) {
                onUnexpectedError(error);
              }
            }
          })();
        } else {
          modelResolve = model.resolve(options3);
        }
      } else {
        modelResolve = Promise.resolve();
      }
    } else {
      didCreateModel = true;
      const newModel = model = this.instantiationService.createInstance(TextFileEditorModel, resource, options3 ? options3.encoding : void 0, options3 ? options3.languageId : void 0);
      modelResolve = model.resolve(options3);
      this.registerModel(newModel);
    }
    this.mapResourceToPendingModelResolvers.set(resource, modelResolve);
    this.add(resource, model);
    if (didCreateModel) {
      this._onDidCreate.fire(model);
      if (model.isDirty()) {
        this._onDidChangeDirty.fire(model);
      }
    }
    try {
      await modelResolve;
    } catch (error) {
      if (didCreateModel) {
        model.dispose();
      }
      throw error;
    } finally {
      this.mapResourceToPendingModelResolvers.delete(resource);
    }
    if (options3?.languageId) {
      model.setLanguageId(options3.languageId);
    }
    if (didCreateModel && model.isDirty()) {
      this._onDidChangeDirty.fire(model);
    }
    return model;
  }
  joinPendingResolves(resource) {
    const pendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
    if (!pendingModelResolve) {
      return;
    }
    return this.doJoinPendingResolves(resource);
  }
  async doJoinPendingResolves(resource) {
    let currentModelCopyResolve;
    while (this.mapResourceToPendingModelResolvers.has(resource)) {
      const nextPendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
      if (nextPendingModelResolve === currentModelCopyResolve) {
        return;
      }
      currentModelCopyResolve = nextPendingModelResolve;
      try {
        await nextPendingModelResolve;
      } catch (error) {
      }
    }
  }
  registerModel(model) {
    const modelListeners = new DisposableStore();
    modelListeners.add(model.onDidResolve((reason) => this._onDidResolve.fire({ model, reason })));
    modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
    modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(model)));
    modelListeners.add(model.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(model)));
    modelListeners.add(model.onDidSaveError(() => this._onDidSaveError.fire(model)));
    modelListeners.add(model.onDidSave((e) => this._onDidSave.fire({ model, ...e })));
    modelListeners.add(model.onDidRevert(() => this._onDidRevert.fire(model)));
    modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
    this.mapResourceToModelListeners.set(model.resource, modelListeners);
  }
  add(resource, model) {
    const knownModel = this.mapResourceToModel.get(resource);
    if (knownModel === model) {
      return;
    }
    const disposeListener = this.mapResourceToDisposeListener.get(resource);
    disposeListener?.dispose();
    this.mapResourceToModel.set(resource, model);
    this.mapResourceToDisposeListener.set(resource, model.onWillDispose(() => this.remove(resource)));
  }
  remove(resource) {
    const removed = this.mapResourceToModel.delete(resource);
    const disposeListener = this.mapResourceToDisposeListener.get(resource);
    if (disposeListener) {
      dispose(disposeListener);
      this.mapResourceToDisposeListener.delete(resource);
    }
    const modelListener = this.mapResourceToModelListeners.get(resource);
    if (modelListener) {
      dispose(modelListener);
      this.mapResourceToModelListeners.delete(resource);
    }
    if (removed) {
      this._onDidRemove.fire(resource);
    }
  }
  addSaveParticipant(participant) {
    return this.saveParticipants.addSaveParticipant(participant);
  }
  runSaveParticipants(model, context2, progress, token) {
    return this.saveParticipants.participate(model, context2, progress, token);
  }
  //#endregion
  canDispose(model) {
    if (model.isDisposed() || !this.mapResourceToPendingModelResolvers.has(model.resource) && !model.isDirty()) {
      return true;
    }
    return this.doCanDispose(model);
  }
  async doCanDispose(model) {
    const pendingResolve = this.joinPendingResolves(model.resource);
    if (pendingResolve) {
      await pendingResolve;
      return this.canDispose(model);
    }
    if (model.isDirty()) {
      await Event2.toPromise(model.onDidChangeDirty);
      return this.canDispose(model);
    }
    return true;
  }
  dispose() {
    super.dispose();
    this.mapResourceToModel.clear();
    this.mapResourceToPendingModelResolvers.clear();
    dispose(this.mapResourceToDisposeListener.values());
    this.mapResourceToDisposeListener.clear();
    dispose(this.mapResourceToModelListeners.values());
    this.mapResourceToModelListeners.clear();
  }
};

TextFileEditorModelManager = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IWorkingCopyFileService),
  __decorateParam(4, IUriIdentityService)
], TextFileEditorModelManager);
export { TextFileEditorModelManager };
