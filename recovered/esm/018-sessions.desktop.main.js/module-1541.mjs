// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/untitled/common/untitledTextEditorInput.ts
import { AbstractTextResourceEditorInput } from "./module-1105.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, findViewStateForEditor, isUntitledResourceEditorInput } from "./module-0926.mjs";
import { isEqual2, toLocalResource } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IPathService } from "./module-0939.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0932.mjs";


// src/vs/workbench/services/untitled/common/untitledTextEditorInput.ts
var UntitledTextEditorInput = class extends AbstractTextResourceEditorInput {
  constructor(model, textFileService, labelService, editorService, fileService, environmentService, pathService, filesConfigurationService, textModelService, textResourceConfigurationService, customEditorLabelService) {
    super(model.resource, void 0, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.model = model;
    this.environmentService = environmentService;
    this.pathService = pathService;
    this.textModelService = textModelService;
    this.modelResolve = void 0;
    this.modelDisposables = this._register(new DisposableStore());
    this.cachedUntitledTextEditorModelReference = void 0;
    this.registerModelListeners(model);
    this._register(this.textFileService.untitled.onDidCreate((model2) => this.onDidCreateUntitledModel(model2)));
  }
  static {
    this.ID = "workbench.editors.untitledEditorInput";
  }
  get typeId() {
    return UntitledTextEditorInput.ID;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  registerModelListeners(model) {
    this.modelDisposables.clear();
    this.modelDisposables.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
    this.modelDisposables.add(model.onDidChangeName(() => this._onDidChangeLabel.fire()));
    this.modelDisposables.add(model.onDidRevert(() => this.dispose()));
  }
  onDidCreateUntitledModel(model) {
    if (isEqual2(model.resource, this.model.resource) && model !== this.model) {
      this.model = model;
      this.registerModelListeners(model);
    }
  }
  getName() {
    return this.model.name;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    if (!this.model.hasAssociatedFilePath) {
      const descriptionCandidate = this.resource.path;
      if (descriptionCandidate !== this.getName()) {
        return descriptionCandidate;
      }
      return void 0;
    }
    return super.getDescription(verbosity);
  }
  getTitle(verbosity) {
    if (!this.model.hasAssociatedFilePath) {
      const name = this.getName();
      const description = this.getDescription();
      if (description && description !== name) {
        return `${name} \u2022 ${description}`;
      }
      return name;
    }
    return super.getTitle(verbosity);
  }
  isDirty() {
    return this.model.isDirty();
  }
  getEncoding() {
    return this.model.getEncoding();
  }
  setEncoding(encoding, mode) {
    return this.model.setEncoding(encoding);
  }
  get hasLanguageSetExplicitly() {
    return this.model.hasLanguageSetExplicitly;
  }
  get hasAssociatedFilePath() {
    return this.model.hasAssociatedFilePath;
  }
  setLanguageId(languageId, source) {
    this.model.setLanguageId(languageId, source);
  }
  getLanguageId() {
    return this.model.getLanguageId();
  }
  async resolve() {
    if (!this.modelResolve) {
      this.modelResolve = (async () => {
        this.cachedUntitledTextEditorModelReference = await this.textModelService.createModelReference(this.resource);
      })();
    }
    await this.modelResolve;
    if (this.isDisposed()) {
      this.disposeModelReference();
    }
    return this.model;
  }
  toUntyped(options3) {
    const untypedInput = {
      resource: this.model.hasAssociatedFilePath ? toLocalResource(this.model.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme) : this.resource,
      forceUntitled: true,
      options: {
        override: this.editorId
      }
    };
    if (typeof options3?.preserveViewState === "number") {
      untypedInput.encoding = this.getEncoding();
      untypedInput.languageId = this.getLanguageId();
      untypedInput.contents = this.model.isModified() ? this.model.textEditorModel?.getValue() : void 0;
      untypedInput.options.viewState = findViewStateForEditor(this, options3.preserveViewState, this.editorService);
      if (typeof untypedInput.contents === "string" && !this.model.hasAssociatedFilePath && !options3.preserveResource) {
        untypedInput.resource = void 0;
      }
    }
    return untypedInput;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof UntitledTextEditorInput) {
      return isEqual2(otherInput.resource, this.resource);
    }
    if (isUntitledResourceEditorInput(otherInput)) {
      return super.matches(otherInput);
    }
    return false;
  }
  dispose() {
    this.modelResolve = void 0;
    this.disposeModelReference();
    super.dispose();
  }
  disposeModelReference() {
    dispose(this.cachedUntitledTextEditorModelReference);
    this.cachedUntitledTextEditorModelReference = void 0;
  }
};

UntitledTextEditorInput = __decorateClass([
  __decorateParam(1, ITextFileService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IFileService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IPathService),
  __decorateParam(7, IFilesConfigurationService),
  __decorateParam(8, ITextModelService),
  __decorateParam(9, ITextResourceConfigurationService),
  __decorateParam(10, ICustomEditorLabelService)
], UntitledTextEditorInput);
export { UntitledTextEditorInput };
