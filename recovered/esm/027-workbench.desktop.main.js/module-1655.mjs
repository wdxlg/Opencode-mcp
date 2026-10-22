// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textmodelResolver/common/textModelResolverService.ts
import { AsyncReferenceCollection, Disposable, ReferenceCollection, toDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { TextResourceEditorModel } from "./module-1103.mjs";
import { ITextModelService, isResolvedTextEditorModel } from "./module-0081.mjs";
import { TextFileEditorModel } from "./module-1653.mjs";
import { UntitledTextEditorModel } from "./module-1124.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IFileService } from "./module-0269.mjs";
import { IModelService } from "./module-0080.mjs";
import { ModelUndoRedoParticipant } from "./module-1654.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/textmodelResolver/common/textModelResolverService.ts
var ResourceModelCollection = class extends ReferenceCollection {
  constructor(instantiationService, textFileService, fileService, modelService) {
    super();
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.modelService = modelService;
    this.providers = /* @__PURE__ */ new Map();
    this.modelsToDispose = /* @__PURE__ */ new Map();
  }
  createReferencedObject(key3) {
    return this.doCreateReferencedObject(key3);
  }
  async doCreateReferencedObject(key3, skipActivateProvider) {
    const resource = URI.parse(key3);
    const pendingModel = this.modelsToDispose.get(key3);
    this.modelsToDispose.delete(key3);
    if (resource.scheme === Schemas.untitled) {
      const model = await this.textFileService.untitled.resolve({ untitledResource: resource });
      if (this.ensureResolvedModel(model, key3)) {
        return model;
      }
    }
    if (this.fileService.hasProvider(resource)) {
      const model = await this.textFileService.files.resolve(resource, { reason: 2 /* REFERENCE */ });
      if (this.ensureResolvedModel(model, key3)) {
        return model;
      }
    }
    if (resource.scheme === Schemas.inMemory || this.providers.has(resource.scheme)) {
      await this.ensureResolvedTextModelContent(resource);
      let model = void 0;
      if (pendingModel) {
        try {
          model = await pendingModel;
        } catch {
        }
      }
      if (!model) {
        model = this.instantiationService.createInstance(TextResourceEditorModel, resource);
      }
      if (this.ensureResolvedModel(model, key3)) {
        return model;
      }
    }
    if (!skipActivateProvider) {
      await this.fileService.activateProvider(resource.scheme);
      return this.doCreateReferencedObject(key3, true);
    }
    throw new Error(`Unable to resolve resource ${key3}`);
  }
  ensureResolvedModel(model, key3) {
    if (isResolvedTextEditorModel(model)) {
      return true;
    }
    throw new Error(`Unable to resolve resource ${key3}`);
  }
  destroyReferencedObject(key3, modelPromise) {
    this.modelsToDispose.set(key3, modelPromise);
    (async () => {
      try {
        const model = await modelPromise;
        if (!this.modelsToDispose.has(key3)) {
          return;
        }
        if (model instanceof TextFileEditorModel) {
          await this.textFileService.files.canDispose(model);
        } else if (model instanceof UntitledTextEditorModel) {
          await this.textFileService.untitled.canDispose(model);
        }
        if (!this.modelsToDispose.has(key3)) {
          return;
        }
        model.dispose();
      } catch (error) {
      } finally {
        this.modelsToDispose.delete(key3);
      }
    })();
  }
  registerTextModelContentProvider(scheme, provider) {
    let providers2 = this.providers.get(scheme);
    if (!providers2) {
      providers2 = [];
      this.providers.set(scheme, providers2);
    }
    providers2.unshift(provider);
    return toDisposable(() => {
      const providersForScheme = this.providers.get(scheme);
      if (!providersForScheme) {
        return;
      }
      const index2 = providersForScheme.indexOf(provider);
      if (index2 === -1) {
        return;
      }
      providersForScheme.splice(index2, 1);
      if (providersForScheme.length === 0) {
        this.providers.delete(scheme);
      }
    });
  }
  hasTextModelContentProvider(scheme) {
    return this.providers.get(scheme) !== void 0;
  }
  async ensureResolvedTextModelContent(resource) {
    if (resource.scheme === Schemas.inMemory) {
      if (this.modelService.getModel(resource)) {
        return;
      }
    }
    const providersForScheme = this.providers.get(resource.scheme) || [];
    for (const provider of providersForScheme) {
      if (await provider.provideTextContent(resource)) {
        return;
      }
    }
    throw new Error(`Unable to resolve text model content for resource ${resource.toString()}`);
  }
};

ResourceModelCollection = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IModelService)
], ResourceModelCollection);

var TextModelResolverService = class extends Disposable {
  constructor(instantiationService, fileService, undoRedoService, modelService, uriIdentityService) {
    super();
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.undoRedoService = undoRedoService;
    this.modelService = modelService;
    this.uriIdentityService = uriIdentityService;
    this._resourceModelCollection = void 0;
    this._asyncModelCollection = void 0;
    this._register(new ModelUndoRedoParticipant(this.modelService, this, this.undoRedoService));
  }
  get resourceModelCollection() {
    if (!this._resourceModelCollection) {
      this._resourceModelCollection = this.instantiationService.createInstance(ResourceModelCollection);
    }
    return this._resourceModelCollection;
  }
  get asyncModelCollection() {
    if (!this._asyncModelCollection) {
      this._asyncModelCollection = new AsyncReferenceCollection(this.resourceModelCollection);
    }
    return this._asyncModelCollection;
  }
  async createModelReference(resource) {
    resource = this.uriIdentityService.asCanonicalUri(resource);
    return await this.asyncModelCollection.acquire(resource.toString());
  }
  registerTextModelContentProvider(scheme, provider) {
    return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider);
  }
  canHandleResource(resource) {
    if (this.fileService.hasProvider(resource) || resource.scheme === Schemas.untitled || resource.scheme === Schemas.inMemory) {
      return true;
    }
    return this.resourceModelCollection.hasTextModelContentProvider(resource.scheme);
  }
};

TextModelResolverService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUndoRedoService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IUriIdentityService)
], TextModelResolverService);

registerSingleton(ITextModelService, TextModelResolverService, 1 /* Delayed */);
export { ResourceModelCollection, TextModelResolverService };
