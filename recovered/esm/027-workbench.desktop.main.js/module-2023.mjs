// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/fileEditorInput.ts
import { AbstractTextResourceEditorInput } from "./module-1104.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { BINARY_FILE_EDITOR_ID, FILE_EDITOR_INPUT_ID, TEXT_FILE_EDITOR_ID } from "./module-1542.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, findViewStateForEditor, isResourceEditorInput } from "./module-0925.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Event2 } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { createTextBufferFactory } from "./module-0423.mjs";
import { BinaryEditorModel } from "./module-1552.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IPathService } from "./module-0938.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";


// src/vs/workbench/contrib/files/browser/editors/fileEditorInput.ts
var FileEditorInput = class extends AbstractTextResourceEditorInput {
  constructor(resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService, textFileService, textModelService, labelService, fileService, filesConfigurationService, editorService, pathService, textResourceConfigurationService, customEditorLabelService) {
    super(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.instantiationService = instantiationService;
    this.textModelService = textModelService;
    this.pathService = pathService;
    this.forceOpenAs = 0 /* None */;
    this.model = void 0;
    this.cachedTextFileModelReference = void 0;
    this.modelListeners = this._register(new DisposableStore());
    this.model = this.textFileService.files.get(resource);
    if (preferredName) {
      this.setPreferredName(preferredName);
    }
    if (preferredDescription) {
      this.setPreferredDescription(preferredDescription);
    }
    if (preferredEncoding) {
      this.setPreferredEncoding(preferredEncoding);
    }
    if (preferredLanguageId) {
      this.setPreferredLanguageId(preferredLanguageId);
    }
    if (typeof preferredContents === "string") {
      this.setPreferredContents(preferredContents);
    }
    this._register(this.textFileService.files.onDidCreate((model) => this.onDidCreateTextFileModel(model)));
    if (this.model) {
      this.registerModelListeners(this.model);
    }
  }
  get typeId() {
    return FILE_EDITOR_INPUT_ID;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  get capabilities() {
    let capabilities = 32 /* CanSplitInGroup */;
    if (this.model) {
      if (this.model.isReadonly()) {
        capabilities |= 2 /* Readonly */;
      }
    } else {
      if (this.fileService.hasProvider(this.resource)) {
        if (this.filesConfigurationService.isReadonly(this.resource)) {
          capabilities |= 2 /* Readonly */;
        }
      } else {
        capabilities |= 4 /* Untitled */;
      }
    }
    if (!(capabilities & 2 /* Readonly */)) {
      capabilities |= 128 /* CanDropIntoEditor */;
    }
    return capabilities;
  }
  onDidCreateTextFileModel(model) {
    if (isEqual2(model.resource, this.resource)) {
      this.model = model;
      this.registerModelListeners(model);
    }
  }
  registerModelListeners(model) {
    this.modelListeners.clear();
    this.modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
    this.modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
    this.modelListeners.add(model.onDidSaveError(() => this._onDidChangeDirty.fire()));
    this.modelListeners.add(Event2.once(model.onWillDispose)(() => {
      this.modelListeners.clear();
      this.model = void 0;
    }));
  }
  getName() {
    return this.preferredName || super.getName();
  }
  setPreferredName(name) {
    if (!this.allowLabelOverride()) {
      return;
    }
    if (this.preferredName !== name) {
      this.preferredName = name;
      this._onDidChangeLabel.fire();
    }
  }
  allowLabelOverride() {
    return this.resource.scheme !== this.pathService.defaultUriScheme && this.resource.scheme !== Schemas.vscodeUserData && this.resource.scheme !== Schemas.file && this.resource.scheme !== Schemas.vscodeRemote;
  }
  getPreferredName() {
    return this.preferredName;
  }
  isReadonly() {
    return this.model ? this.model.isReadonly() : this.filesConfigurationService.isReadonly(this.resource);
  }
  getDescription(verbosity) {
    return this.preferredDescription || super.getDescription(verbosity);
  }
  setPreferredDescription(description) {
    if (!this.allowLabelOverride()) {
      return;
    }
    if (this.preferredDescription !== description) {
      this.preferredDescription = description;
      this._onDidChangeLabel.fire();
    }
  }
  getPreferredDescription() {
    return this.preferredDescription;
  }
  getTitle(verbosity) {
    let title = super.getTitle(verbosity);
    const preferredTitle = this.getPreferredTitle();
    if (preferredTitle) {
      title = `${preferredTitle} (${title})`;
    }
    return title;
  }
  getPreferredTitle() {
    if (this.preferredName && this.preferredDescription) {
      return `${this.preferredName} ${this.preferredDescription}`;
    }
    if (this.preferredName || this.preferredDescription) {
      return this.preferredName ?? this.preferredDescription;
    }
    return void 0;
  }
  getEncoding() {
    if (this.model) {
      return this.model.getEncoding();
    }
    return this.preferredEncoding;
  }
  getPreferredEncoding() {
    return this.preferredEncoding;
  }
  async setEncoding(encoding, mode) {
    this.setPreferredEncoding(encoding);
    return this.model?.setEncoding(encoding, mode);
  }
  setPreferredEncoding(encoding) {
    this.preferredEncoding = encoding;
    this.setForceOpenAsText();
  }
  getLanguageId() {
    if (this.model) {
      return this.model.getLanguageId();
    }
    return this.preferredLanguageId;
  }
  getPreferredLanguageId() {
    return this.preferredLanguageId;
  }
  setLanguageId(languageId, source) {
    this.setPreferredLanguageId(languageId);
    this.model?.setLanguageId(languageId, source);
  }
  setPreferredLanguageId(languageId) {
    this.preferredLanguageId = languageId;
    this.setForceOpenAsText();
  }
  setPreferredContents(contents) {
    this.preferredContents = contents;
    this.setForceOpenAsText();
  }
  setForceOpenAsText() {
    this.forceOpenAs = 1 /* Text */;
  }
  setForceOpenAsBinary() {
    this.forceOpenAs = 2 /* Binary */;
  }
  isDirty() {
    return !!this.model?.isDirty();
  }
  isSaving() {
    if (this.model?.hasState(0 /* SAVED */) || this.model?.hasState(3 /* CONFLICT */) || this.model?.hasState(5 /* ERROR */)) {
      return false;
    }
    if (this.filesConfigurationService.hasShortAutoSaveDelay(this)) {
      return true;
    }
    return super.isSaving();
  }
  prefersEditorPane(editorPanes) {
    if (this.forceOpenAs === 2 /* Binary */) {
      return editorPanes.find((editorPane) => editorPane.typeId === BINARY_FILE_EDITOR_ID);
    }
    return editorPanes.find((editorPane) => editorPane.typeId === TEXT_FILE_EDITOR_ID);
  }
  resolve(options3) {
    if (this.forceOpenAs === 2 /* Binary */) {
      return this.doResolveAsBinary();
    }
    return this.doResolveAsText(options3);
  }
  async doResolveAsText(options3) {
    try {
      const preferredContents = this.preferredContents;
      this.preferredContents = void 0;
      await this.textFileService.files.resolve(this.resource, {
        languageId: this.preferredLanguageId,
        encoding: this.preferredEncoding,
        contents: typeof preferredContents === "string" ? createTextBufferFactory(preferredContents) : void 0,
        reload: { async: true },
        // trigger a reload of the model if it exists already but do not wait to show the model
        allowBinary: this.forceOpenAs === 1 /* Text */,
        reason: 1 /* EDITOR */,
        limits: this.ensureLimits(options3)
      });
      if (!this.cachedTextFileModelReference) {
        this.cachedTextFileModelReference = await this.textModelService.createModelReference(this.resource);
      }
      const model = this.cachedTextFileModelReference.object;
      if (this.isDisposed()) {
        this.disposeModelReference();
      }
      return model;
    } catch (error) {
      if (error.textFileOperationResult === 0 /* FILE_IS_BINARY */) {
        return this.doResolveAsBinary();
      }
      throw error;
    }
  }
  async doResolveAsBinary() {
    const model = this.instantiationService.createInstance(BinaryEditorModel, this.preferredResource, this.getName());
    await model.resolve();
    return model;
  }
  isResolved() {
    return !!this.model;
  }
  async rename(group2, target) {
    return {
      editor: {
        resource: target,
        encoding: this.getEncoding(),
        options: {
          viewState: findViewStateForEditor(this, group2, this.editorService)
        }
      }
    };
  }
  toUntyped(options3) {
    const untypedInput = {
      resource: this.preferredResource,
      forceFile: true,
      options: {
        override: this.editorId
      }
    };
    if (typeof options3?.preserveViewState === "number") {
      untypedInput.encoding = this.getEncoding();
      untypedInput.languageId = this.getLanguageId();
      untypedInput.contents = (() => {
        const model = this.textFileService.files.get(this.resource);
        if (model?.isDirty() && !model.textEditorModel.isTooLargeForHeapOperation()) {
          return model.textEditorModel.getValue();
        }
        return void 0;
      })();
      untypedInput.options = {
        ...untypedInput.options,
        viewState: findViewStateForEditor(this, options3.preserveViewState, this.editorService)
      };
    }
    return untypedInput;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof FileEditorInput) {
      return isEqual2(otherInput.resource, this.resource);
    }
    if (isResourceEditorInput(otherInput)) {
      return super.matches(otherInput);
    }
    return false;
  }
  dispose() {
    this.model = void 0;
    this.disposeModelReference();
    super.dispose();
  }
  disposeModelReference() {
    dispose(this.cachedTextFileModelReference);
    this.cachedTextFileModelReference = void 0;
  }
};

FileEditorInput = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, ITextFileService),
  __decorateParam(9, ITextModelService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IFileService),
  __decorateParam(12, IFilesConfigurationService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IPathService),
  __decorateParam(15, ITextResourceConfigurationService),
  __decorateParam(16, ICustomEditorLabelService)
], FileEditorInput);
export { FileEditorInput };
