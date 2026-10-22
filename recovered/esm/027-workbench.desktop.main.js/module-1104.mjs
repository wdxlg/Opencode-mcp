// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/textResourceEditorInput.ts
import { AbstractResourceEditorInput } from "./module-0932.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, isResourceEditorInput } from "./module-0925.mjs";
import { TextResourceEditorModel } from "./module-1103.mjs";
import { createTextBufferFactory } from "./module-0423.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/common/editor/textResourceEditorInput.ts
var AbstractTextResourceEditorInput = class extends AbstractResourceEditorInput {
  constructor(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super(resource, preferredResource, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.editorService = editorService;
    this.textFileService = textFileService;
  }
  save(group2, options3) {
    if (this.resource.scheme !== Schemas.untitled && !this.fileService.hasProvider(this.resource)) {
      return this.saveAs(group2, options3);
    }
    return this.doSave(options3, false, group2);
  }
  saveAs(group2, options3) {
    return this.doSave(options3, true, group2);
  }
  async doSave(options3, saveAs, group2) {
    let target;
    if (saveAs) {
      target = await this.textFileService.saveAs(this.resource, void 0, { ...options3, suggestedTarget: this.preferredResource });
    } else {
      target = await this.textFileService.save(this.resource, options3);
    }
    if (!target) {
      return void 0;
    }
    return { resource: target };
  }
  async revert(group2, options3) {
    await this.textFileService.revert(this.resource, options3);
  }
};

AbstractTextResourceEditorInput = __decorateClass([
  __decorateParam(2, IEditorService),
  __decorateParam(3, ITextFileService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IFilesConfigurationService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, ICustomEditorLabelService)
], AbstractTextResourceEditorInput);

var TextResourceEditorInput = class extends AbstractTextResourceEditorInput {
  constructor(resource, name, description, preferredLanguageId, preferredContents, textModelService, textFileService, editorService, fileService, labelService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService) {
    super(resource, void 0, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.name = name;
    this.description = description;
    this.preferredLanguageId = preferredLanguageId;
    this.preferredContents = preferredContents;
    this.textModelService = textModelService;
    this.cachedModel = void 0;
    this.modelReference = void 0;
  }
  static {
    this.ID = "workbench.editors.resourceEditorInput";
  }
  get typeId() {
    return TextResourceEditorInput.ID;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  getName() {
    return this.name || super.getName();
  }
  setName(name) {
    if (this.name !== name) {
      this.name = name;
      this._onDidChangeLabel.fire();
    }
  }
  getDescription() {
    return this.description;
  }
  setDescription(description) {
    if (this.description !== description) {
      this.description = description;
      this._onDidChangeLabel.fire();
    }
  }
  setLanguageId(languageId, source) {
    this.setPreferredLanguageId(languageId);
    this.cachedModel?.setLanguageId(languageId, source);
  }
  setPreferredLanguageId(languageId) {
    this.preferredLanguageId = languageId;
  }
  setPreferredContents(contents) {
    this.preferredContents = contents;
  }
  async resolve() {
    const preferredContents = this.preferredContents;
    const preferredLanguageId = this.preferredLanguageId;
    this.preferredContents = void 0;
    this.preferredLanguageId = void 0;
    if (!this.modelReference) {
      this.modelReference = this.textModelService.createModelReference(this.resource);
    }
    const ref = await this.modelReference;
    const model = ref.object;
    if (!(model instanceof TextResourceEditorModel)) {
      ref.dispose();
      this.modelReference = void 0;
      throw new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);
    }
    this.cachedModel = model;
    if (typeof preferredContents === "string" || typeof preferredLanguageId === "string") {
      model.updateTextEditorModel(typeof preferredContents === "string" ? createTextBufferFactory(preferredContents) : void 0, preferredLanguageId);
    }
    return model;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof TextResourceEditorInput) {
      return isEqual2(otherInput.resource, this.resource);
    }
    if (isResourceEditorInput(otherInput)) {
      return super.matches(otherInput);
    }
    return false;
  }
  dispose() {
    if (this.modelReference) {
      this.modelReference.then((ref) => ref.dispose());
      this.modelReference = void 0;
    }
    this.cachedModel = void 0;
    super.dispose();
  }
};

TextResourceEditorInput = __decorateClass([
  __decorateParam(5, ITextModelService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IFileService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, ITextResourceConfigurationService),
  __decorateParam(12, ICustomEditorLabelService)
], TextResourceEditorInput);
export { AbstractTextResourceEditorInput, TextResourceEditorInput };
