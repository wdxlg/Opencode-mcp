// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/untitled/common/untitledTextEditorService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableResourceMap, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { UntitledTextEditorModel } from "./module-1125.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/untitled/common/untitledTextEditorService.ts
var IUntitledTextEditorService = createDecorator("untitledTextEditorService");

var UntitledTextEditorService = class extends Disposable {
  constructor(instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeEncoding = this._register(new Emitter());
    this.onDidChangeEncoding = this._onDidChangeEncoding.event;
    this._onDidCreate = this._register(new Emitter());
    this.onDidCreate = this._onDidCreate.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    this._onDidChangeLabel = this._register(new Emitter());
    this.onDidChangeLabel = this._onDidChangeLabel.event;
    this.mapResourceToModel = this._register(new DisposableResourceMap());
  }
  static {
    this.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX = /Untitled-\d+/;
  }
  get(resource) {
    return this.mapResourceToModel.get(resource);
  }
  getValue(resource) {
    return this.get(resource)?.textEditorModel?.getValue();
  }
  async resolve(options3) {
    const model = this.doCreateOrGet(options3);
    await model.resolve();
    return model;
  }
  create(options3) {
    return this.doCreateOrGet(options3);
  }
  doCreateOrGet(options3 = /* @__PURE__ */ Object.create(null)) {
    const massagedOptions = this.massageOptions(options3);
    if (massagedOptions.untitledResource && this.mapResourceToModel.has(massagedOptions.untitledResource)) {
      return this.mapResourceToModel.get(massagedOptions.untitledResource);
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
    }
    if (options3.languageId) {
      massagedOptions.languageId = options3.languageId;
    } else if (!massagedOptions.associatedResource) {
      const configuration2 = this.configurationService.getValue();
      if (configuration2.files?.defaultLanguage) {
        massagedOptions.languageId = configuration2.files.defaultLanguage;
      }
    }
    massagedOptions.encoding = options3.encoding;
    massagedOptions.initialValue = options3.initialValue;
    return massagedOptions;
  }
  doCreate(options3) {
    let untitledResource = options3.untitledResource;
    if (!untitledResource) {
      let counter = 1;
      do {
        untitledResource = URI.from({ scheme: Schemas.untitled, path: `Untitled-${counter}` });
        counter++;
      } while (this.mapResourceToModel.has(untitledResource));
    }
    const model = this.instantiationService.createInstance(UntitledTextEditorModel, untitledResource, !!options3.associatedResource, options3.initialValue, options3.languageId, options3.encoding);
    this.registerModel(model);
    return model;
  }
  registerModel(model) {
    const modelListeners = new DisposableStore();
    modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
    modelListeners.add(model.onDidChangeName(() => this._onDidChangeLabel.fire(model)));
    modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
    modelListeners.add(model.onWillDispose(() => this._onWillDispose.fire(model)));
    Event2.once(model.onWillDispose)(() => {
      this.mapResourceToModel.deleteAndLeak(model.resource);
      modelListeners.dispose();
    });
    this.mapResourceToModel.set(model.resource, model);
    this._onDidCreate.fire(model);
    if (model.isDirty()) {
      this._onDidChangeDirty.fire(model);
    }
  }
  isUntitledWithAssociatedResource(resource) {
    return resource.scheme === Schemas.untitled && resource.path.length > 1 && !UntitledTextEditorService.UNTITLED_WITHOUT_ASSOCIATED_RESOURCE_REGEX.test(resource.path);
  }
  canDispose(model) {
    if (model.isDisposed()) {
      return true;
    }
    return this.doCanDispose(model);
  }
  async doCanDispose(model) {
    if (model.isDirty()) {
      await Event2.toPromise(model.onDidChangeDirty);
      return this.canDispose(model);
    }
    return true;
  }
  notifyDidSave(source, target) {
    this._onDidSave.fire({ source, target });
  }
};

UntitledTextEditorService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], UntitledTextEditorService);

registerSingleton(IUntitledTextEditorService, UntitledTextEditorService, 1 /* Delayed */);
export { IUntitledTextEditorService, UntitledTextEditorService };
