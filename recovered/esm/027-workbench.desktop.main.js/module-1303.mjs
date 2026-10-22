// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/common/customTextEditorModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { basename } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/contrib/customEditor/common/customTextEditorModel.ts
var CustomTextEditorModel = class extends Disposable {
  constructor(viewType, _resource, _model, textFileService, _labelService, extensionService) {
    super();
    this.viewType = viewType;
    this._resource = _resource;
    this._model = _model;
    this.textFileService = textFileService;
    this._labelService = _labelService;
    this._onDidChangeOrphaned = this._register(new Emitter());
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this._onDidChangeReadonly = this._register(new Emitter());
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._register(_model);
    this._textFileModel = this.textFileService.files.get(_resource);
    if (this._textFileModel) {
      this._register(this._textFileModel.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
      this._register(this._textFileModel.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
    }
    this._register(this.textFileService.files.onDidChangeDirty((e) => {
      if (isEqual2(this.resource, e.resource)) {
        this._onDidChangeDirty.fire();
        this._onDidChangeContent.fire();
      }
    }));
    this._register(extensionService.onWillStop((e) => {
      e.veto(true, localize(14085, null, this.name));
    }));
  }
  static async create(instantiationService, viewType, resource) {
    return instantiationService.invokeFunction(async (accessor) => {
      const textModelResolverService = accessor.get(ITextModelService);
      const model = await textModelResolverService.createModelReference(resource);
      return instantiationService.createInstance(CustomTextEditorModel, viewType, resource, model);
    });
  }
  get resource() {
    return this._resource;
  }
  get name() {
    return basename(this._labelService.getUriLabel(this._resource));
  }
  isReadonly() {
    return this._model.object.isReadonly();
  }
  get backupId() {
    return void 0;
  }
  get canHotExit() {
    return true;
  }
  isDirty() {
    return this.textFileService.isDirty(this.resource);
  }
  isOrphaned() {
    return !!this._textFileModel?.hasState(4 /* ORPHAN */);
  }
  async revert(options3) {
    return this.textFileService.revert(this.resource, options3);
  }
  saveCustomEditor(options3) {
    return this.textFileService.save(this.resource, options3);
  }
  async saveCustomEditorAs(resource, targetResource, options3) {
    return !!await this.textFileService.saveAs(resource, targetResource, options3);
  }
};

CustomTextEditorModel = __decorateClass([
  __decorateParam(3, ITextFileService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IExtensionService)
], CustomTextEditorModel);
export { CustomTextEditorModel };
