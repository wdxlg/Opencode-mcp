// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInput.ts
import { AbstractTextResourceEditorInput } from "./module-1104.mjs";
import { assertFn } from "./module-0009.mjs";
import { isDefined } from "./module-0010.mjs";
import { TempFileMergeEditorModeFactory, WorkspaceMergeEditorModeFactory } from "./module-1142.mjs";
import { MergeEditorTelemetry } from "./module-1143.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, isResourceMergeEditorInput } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IFileService } from "./module-0269.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";
import { ILogService } from "./module-0095.mjs";
import { alert } from "./module-0076.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/mergeEditorInput.ts
var MergeEditorInputData = class {
  constructor(uri5, title, detail2, description) {
    this.uri = uri5;
    this.title = title;
    this.detail = detail2;
    this.description = description;
  }
};

var MergeEditorInput = class extends AbstractTextResourceEditorInput {
  constructor(base, input1, input2, result, _instaService, editorService, textFileService, labelService, fileService, configurationService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService, logService) {
    super(result, void 0, editorService, textFileService, labelService, fileService, filesConfigurationService, textResourceConfigurationService, customEditorLabelService);
    this.base = base;
    this.input1 = input1;
    this.input2 = input2;
    this.result = result;
    this._instaService = _instaService;
    this.configurationService = configurationService;
    this.logService = logService;
    this._focusedEditor = "result";
    this.closeHandler = {
      showConfirm: () => this._inputModel?.shouldConfirmClose() ?? false,
      confirm: async (editors) => {
        assertFn(() => editors.every((e) => e.editor instanceof MergeEditorInput));
        const inputModels = editors.map((e) => e.editor._inputModel).filter(isDefined);
        return await this._inputModel.confirmClose(inputModels);
      }
    };
    this.mergeEditorModeFactory = this._instaService.createInstance(
      this.useWorkingCopy ? TempFileMergeEditorModeFactory : WorkspaceMergeEditorModeFactory,
      this._instaService.createInstance(MergeEditorTelemetry)
    );
  }
  static {
    this.ID = "mergeEditor.Input";
  }
  get useWorkingCopy() {
    return this.configurationService.getValue("mergeEditor.useWorkingCopy") ?? false;
  }
  dispose() {
    super.dispose();
  }
  get typeId() {
    return MergeEditorInput.ID;
  }
  get editorId() {
    return DEFAULT_EDITOR_ASSOCIATION.id;
  }
  get capabilities() {
    let capabilities = super.capabilities | 256 /* MultipleEditors */;
    if (this.useWorkingCopy) {
      capabilities |= 4 /* Untitled */;
    }
    return capabilities;
  }
  getName() {
    return localize(17258, null, super.getName());
  }
  async resolve() {
    if (!this._inputModel) {
      const inputModel = this._register(await this.mergeEditorModeFactory.createInputModel({
        base: this.base,
        input1: this.input1,
        input2: this.input2,
        result: this.result
      }));
      this._inputModel = inputModel;
      this._register(autorun((reader) => {
        inputModel.isDirty.read(reader);
        this._onDidChangeDirty.fire();
      }));
      await this._inputModel.model.onInitialized;
    }
    return this._inputModel;
  }
  async accept() {
    await this._inputModel?.accept();
  }
  async save(group2, options3) {
    await this._inputModel?.save(options3);
    return void 0;
  }
  toUntyped() {
    return {
      input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
      input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
      base: { resource: this.base },
      result: { resource: this.result },
      options: {
        override: this.typeId
      }
    };
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof MergeEditorInput) {
      return isEqual2(this.base, otherInput.base) && isEqual2(this.input1.uri, otherInput.input1.uri) && isEqual2(this.input2.uri, otherInput.input2.uri) && isEqual2(this.result, otherInput.result);
    }
    if (isResourceMergeEditorInput(otherInput)) {
      return (this.editorId === otherInput.options?.override || otherInput.options?.override === void 0) && isEqual2(this.base, otherInput.base.resource) && isEqual2(this.input1.uri, otherInput.input1.resource) && isEqual2(this.input2.uri, otherInput.input2.resource) && isEqual2(this.result, otherInput.result.resource);
    }
    return false;
  }
  async revert(group2, options3) {
    return this._inputModel?.revert(options3);
  }
  // ---- FileEditorInput
  isDirty() {
    return this._inputModel?.isDirty.get() ?? false;
  }
  setLanguageId(languageId, source) {
    this._inputModel?.model.setLanguageId(languageId, source);
  }
  /**
   * Updates the focused editor and triggers a name change event
   */
  updateFocusedEditor(editor) {
    if (this._focusedEditor !== editor) {
      this._focusedEditor = editor;
      this.logService.trace("alertFocusedEditor", editor);
      alertFocusedEditor(editor);
    }
  }
  // implement get/set encoding
};

MergeEditorInput = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IFilesConfigurationService),
  __decorateParam(11, ITextResourceConfigurationService),
  __decorateParam(12, ICustomEditorLabelService),
  __decorateParam(13, ILogService)
], MergeEditorInput);

function alertFocusedEditor(editor) {
  switch (editor) {
    case "input1":
      alert(localize(17255, null));
      break;
    case "input2":
      alert(localize(17256, null));
      break;
    case "result":
      alert(localize(17257, null));
      break;
  }
}
export { alertFocusedEditor, MergeEditorInputData, MergeEditorInput };
