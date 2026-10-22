// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl.ts
import { DisposableStore, ReferenceCollection, combinedDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { AsyncEmitter, Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { CellUri, NotebookSetting, NotebookWorkingCopyTypeIdentifier } from "./module-0909.mjs";
import { NotebookFileWorkingCopyModelFactory, SimpleNotebookEditorModel } from "./module-1399.mjs";
import { FileWorkingCopyManager } from "./module-1995.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotebookLoggingService } from "./module-1395.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { NotebookProviderInfo } from "./module-1886.mjs";
import { Schemas } from "./module-0033.mjs";
import { parse6 } from "./module-0908.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl.ts
var NotebookModelReferenceCollection = class extends ReferenceCollection {
  constructor(_instantiationService, _notebookService, _configurationService, _telemetryService, _notebookLoggingService) {
    super();
    this._instantiationService = _instantiationService;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLoggingService = _notebookLoggingService;
    this._disposables = new DisposableStore();
    this._workingCopyManagers = /* @__PURE__ */ new Map();
    this._modelListener = /* @__PURE__ */ new Map();
    this._onDidSaveNotebook = new Emitter();
    this.onDidSaveNotebook = this._onDidSaveNotebook.event;
    this._onDidChangeDirty = new Emitter();
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._dirtyStates = new ResourceMap();
    this.modelsToDispose = /* @__PURE__ */ new Set();
  }
  dispose() {
    this._disposables.dispose();
    this._onDidSaveNotebook.dispose();
    this._onDidChangeDirty.dispose();
    dispose(this._modelListener.values());
    dispose(this._workingCopyManagers.values());
  }
  isDirty(resource) {
    return this._dirtyStates.get(resource) ?? false;
  }
  isListeningToModel(uri5) {
    for (const key3 of this._modelListener.keys()) {
      if (key3.resource.toString() === uri5.toString()) {
        return true;
      }
    }
    return false;
  }
  async createReferencedObject(key3, notebookType, hasAssociatedFilePath, limits, isScratchpad, viewType) {
    this.modelsToDispose.delete(key3);
    const uri5 = URI.parse(key3);
    const workingCopyTypeId = NotebookWorkingCopyTypeIdentifier.create(notebookType, viewType);
    let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
    if (!workingCopyManager) {
      const factory = new NotebookFileWorkingCopyModelFactory(notebookType, this._notebookService, this._configurationService, this._telemetryService, this._notebookLoggingService);
      workingCopyManager = this._instantiationService.createInstance(
        FileWorkingCopyManager,
        workingCopyTypeId,
        factory,
        factory
      );
      this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
    }
    const isScratchpadView = isScratchpad || notebookType === "interactive" && this._configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
    const model = this._instantiationService.createInstance(SimpleNotebookEditorModel, uri5, hasAssociatedFilePath, notebookType, workingCopyManager, isScratchpadView);
    const result = await model.load({ limits });
    let onDirtyAutoReference;
    this._modelListener.set(result, combinedDisposable(
      result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)),
      result.onDidChangeDirty(() => {
        const isDirty = result.isDirty();
        this._dirtyStates.set(result.resource, isDirty);
        if (isDirty && !onDirtyAutoReference) {
          onDirtyAutoReference = this.acquire(key3, notebookType);
        } else if (onDirtyAutoReference) {
          onDirtyAutoReference.dispose();
          onDirtyAutoReference = void 0;
        }
        this._onDidChangeDirty.fire(result);
      }),
      toDisposable(() => onDirtyAutoReference?.dispose())
    ));
    return result;
  }
  destroyReferencedObject(key3, object2) {
    this.modelsToDispose.add(key3);
    (async () => {
      try {
        const model = await object2;
        if (!this.modelsToDispose.has(key3)) {
          return;
        }
        if (model instanceof SimpleNotebookEditorModel) {
          await model.canDispose();
        }
        if (!this.modelsToDispose.has(key3)) {
          return;
        }
        this._modelListener.get(model)?.dispose();
        this._modelListener.delete(model);
        model.dispose();
      } catch (err) {
        this._notebookLoggingService.error("NotebookModelCollection", "FAILED to destory notebook - " + err);
      } finally {
        this.modelsToDispose.delete(key3);
      }
    })();
  }
};

NotebookModelReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INotebookLoggingService)
], NotebookModelReferenceCollection);

var NotebookModelResolverServiceImpl = class {
  constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
    this._notebookService = _notebookService;
    this._extensionService = _extensionService;
    this._uriIdentService = _uriIdentService;
    this._onWillFailWithConflict = new AsyncEmitter();
    this.onWillFailWithConflict = this._onWillFailWithConflict.event;
    this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
    this.onDidSaveNotebook = this._data.onDidSaveNotebook;
    this.onDidChangeDirty = this._data.onDidChangeDirty;
  }
  dispose() {
    this._data.dispose();
  }
  isDirty(resource) {
    return this._data.isDirty(resource);
  }
  createUntitledUri(notebookType) {
    const info = this._notebookService.getContributedNotebookType(assertReturnsDefined(notebookType));
    if (!info) {
      throw new Error("UNKNOWN notebook type: " + notebookType);
    }
    const suffix = NotebookProviderInfo.possibleFileEnding(info.selectors) ?? "";
    for (let counter = 1; ; counter++) {
      const candidate = URI.from({ scheme: Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: notebookType });
      if (!this._notebookService.getNotebookTextModel(candidate) && !this._data.isListeningToModel(candidate)) {
        return candidate;
      }
    }
  }
  async validateResourceViewType(uri5, viewType) {
    if (!uri5 && !viewType) {
      throw new Error("Must provide at least one of resource or viewType");
    }
    if (uri5?.scheme === CellUri.scheme) {
      const originalUri = uri5;
      uri5 = parse6(uri5)?.notebook;
      if (!uri5) {
        throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${originalUri.toString()}`);
      }
    }
    const resource = this._uriIdentService.asCanonicalUri(uri5 ?? this.createUntitledUri(viewType));
    const existingNotebook = this._notebookService.getNotebookTextModel(resource);
    if (!viewType) {
      if (existingNotebook) {
        viewType = existingNotebook.viewType;
      } else {
        await this._extensionService.whenInstalledExtensionsRegistered();
        const providers2 = this._notebookService.getContributedNotebookTypes(resource);
        viewType = providers2.find((provider) => provider.priority === "exclusive")?.id ?? providers2.find((provider) => provider.priority === "default")?.id ?? providers2[0]?.id;
      }
    }
    if (!viewType) {
      throw new Error(`Missing viewType for '${resource}'`);
    }
    if (existingNotebook && existingNotebook.viewType !== viewType) {
      await this._onWillFailWithConflict.fireAsync({ resource, viewType }, CancellationToken.None);
      const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
      if (existingViewType2 && existingViewType2 !== viewType) {
        throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
      }
    }
    return { resource, viewType };
  }
  async createUntitledNotebookTextModel(viewType) {
    const resource = this._uriIdentService.asCanonicalUri(this.createUntitledUri(viewType));
    return await this._notebookService.createNotebookTextModel(viewType, resource);
  }
  async resolve(arg0, viewType, options3) {
    let resource;
    let hasAssociatedFilePath;
    if (URI.isUri(arg0)) {
      resource = arg0;
    } else if (arg0.untitledResource) {
      if (arg0.untitledResource.scheme === Schemas.untitled) {
        resource = arg0.untitledResource;
      } else {
        resource = arg0.untitledResource.with({ scheme: Schemas.untitled });
        hasAssociatedFilePath = true;
      }
    }
    const validated = await this.validateResourceViewType(resource, viewType);
    const reference = this._data.acquire(validated.resource.toString(), validated.viewType, hasAssociatedFilePath, options3?.limits, options3?.scratchpad, options3?.viewType);
    try {
      const model = await reference.object;
      return {
        object: model,
        dispose() {
          reference.dispose();
        }
      };
    } catch (err) {
      reference.dispose();
      throw err;
    }
  }
};

NotebookModelResolverServiceImpl = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IUriIdentityService)
], NotebookModelResolverServiceImpl);
export { NotebookModelReferenceCollection, NotebookModelResolverServiceImpl };
