// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/browser/customEditorDiffInput.ts
import { IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput } from "./module-1121.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { IWebviewService } from "./module-1043.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { isEditorInput, isResourceDiffEditorInput, isResourceEditorInput } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICustomEditorService } from "./module-1115.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IUndoRedoService } from "./module-0374.mjs";


// src/vs/workbench/contrib/customEditor/browser/customEditorDiffInput.ts
function getCustomEditorSideBySideDiffInputResource(init) {
  return init.side === "original" ? init.originalResource : init.modifiedResource;
}

var CustomEditorDiffInput = class extends LazilyResolvedWebviewEditorInput {
  constructor(init, webview, themeService, webviewWorkbenchService, instantiationService, customEditorService, filesConfigurationService, fileDialogService, undoRedoService) {
    super({ providedId: init.viewType, viewType: init.viewType, name: init.label ?? "", iconPath: init.iconPath }, webview, themeService, webviewWorkbenchService);
    this.init = init;
    this.instantiationService = instantiationService;
    this.customEditorService = customEditorService;
    this.filesConfigurationService = filesConfigurationService;
    this.fileDialogService = fileDialogService;
    this.undoRedoService = undoRedoService;
    this._modelRef = this._register(new MutableDisposable());
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
  }
  static create(instantiationService, init, group2) {
    return instantiationService.invokeFunction((accessor) => {
      const webview = accessor.get(IWebviewService).createWebviewOverlay({
        providedViewType: init.viewType,
        title: init.label,
        options: {},
        contentOptions: {},
        extension: void 0
      });
      const input = instantiationService.createInstance(CustomEditorDiffInput, init, webview);
      if (group2) {
        input.updateGroup(group2.id);
      }
      return input;
    });
  }
  static {
    this.typeId = "workbench.editors.customDiffEditor";
  }
  get typeId() {
    return CustomEditorDiffInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = 8 /* Singleton */ | 128 /* CanDropIntoEditor */;
    if (this.isReadonly()) {
      capabilities |= 2 /* Readonly */;
    }
    return capabilities;
  }
  get resource() {
    return this.modifiedResource;
  }
  get originalResource() {
    return this.init.originalResource;
  }
  get modifiedResource() {
    return this.init.modifiedResource;
  }
  get diffResources() {
    return {
      original: this.originalResource,
      modified: this.modifiedResource
    };
  }
  getName() {
    return this.init.label ?? localize(14077, null, basename2(this.originalResource), basename2(this.modifiedResource));
  }
  getDescription(_verbosity) {
    return this.init.description ?? super.getDescription();
  }
  getTitle(verbosity) {
    const description = this.getDescription(verbosity);
    if (description) {
      return localize(14078, null, this.getName(), description);
    }
    return this.getName();
  }
  isReadonly() {
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return this.filesConfigurationService.isReadonly(this.modifiedResource);
    }
    return modelRef.object.isReadonly();
  }
  isDirty() {
    return this._modelRef.value?.object.isDirty() ?? false;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof CustomEditorDiffInput) {
      return this.viewType === otherInput.viewType && isEqual2(this.originalResource, otherInput.originalResource) && isEqual2(this.modifiedResource, otherInput.modifiedResource);
    }
    if (isEditorInput(otherInput)) {
      return false;
    }
    if (isResourceDiffEditorInput(otherInput)) {
      const override = otherInput.options?.override;
      return override === this.viewType && isEqual2(this.originalResource, otherInput.original.resource) && isEqual2(this.modifiedResource, otherInput.modified.resource);
    }
    return false;
  }
  copy() {
    return CustomEditorDiffInput.create(this.instantiationService, this.init, void 0);
  }
  async save(groupId, options3) {
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return void 0;
    }
    const target = await modelRef.object.saveCustomEditor(options3);
    if (!target) {
      return void 0;
    }
    if (!isEqual2(target, this.modifiedResource)) {
      return this.toUntypedWithModifiedResource(target);
    }
    return this;
  }
  async saveAs(groupId, options3) {
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return void 0;
    }
    const target = await this.fileDialogService.pickFileToSave(this.modifiedResource, options3?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    if (!await modelRef.object.saveCustomEditorAs(this.modifiedResource, target, options3)) {
      return void 0;
    }
    return this.toUntypedWithModifiedResource(target);
  }
  async revert(group2, options3) {
    await this._modelRef.value?.object.revert(options3);
  }
  async resolve() {
    await super.resolve();
    if (this.isDisposed()) {
      return null;
    }
    if (!this._modelRef.value) {
      const modelRef = this.customEditorService.models.tryRetain(this.modifiedResource, this.viewType);
      if (modelRef) {
        const oldCapabilities = this.capabilities;
        const retainedModelRef = await modelRef;
        if (this.isDisposed()) {
          retainedModelRef.dispose();
          return null;
        }
        this._modelRef.value = retainedModelRef;
        this._register(retainedModelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this._register(retainedModelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
        if (this.isDirty()) {
          this._onDidChangeDirty.fire();
        }
        if (this.capabilities !== oldCapabilities) {
          this._onDidChangeCapabilities.fire();
        }
      }
    }
    return null;
  }
  undo() {
    return this.undoRedoService.undo(this.modifiedResource);
  }
  redo() {
    return this.undoRedoService.redo(this.modifiedResource);
  }
  toUntyped(_options) {
    return this.toUntypedWithModifiedResource(this.modifiedResource);
  }
  toUntypedWithModifiedResource(modifiedResource) {
    return {
      original: { resource: this.originalResource },
      modified: { resource: modifiedResource },
      label: this.init.label,
      description: this.init.description,
      options: {
        override: this.viewType
      }
    };
  }
};

CustomEditorDiffInput = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IWebviewWorkbenchService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICustomEditorService),
  __decorateParam(6, IFilesConfigurationService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, IUndoRedoService)
], CustomEditorDiffInput);

var CustomEditorSideBySideDiffInput = class extends LazilyResolvedWebviewEditorInput {
  constructor(init, webview, themeService, webviewWorkbenchService, instantiationService, customEditorService, filesConfigurationService, fileDialogService, undoRedoService) {
    super({ providedId: init.viewType, viewType: init.viewType, name: basename2(getCustomEditorSideBySideDiffInputResource(init)), iconPath: init.iconPath }, webview, themeService, webviewWorkbenchService);
    this.init = init;
    this.instantiationService = instantiationService;
    this.customEditorService = customEditorService;
    this.filesConfigurationService = filesConfigurationService;
    this.fileDialogService = fileDialogService;
    this.undoRedoService = undoRedoService;
    this._modelRef = this._register(new MutableDisposable());
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
  }
  static create(instantiationService, init, group2) {
    return instantiationService.invokeFunction((accessor) => {
      const webview = accessor.get(IWebviewService).createWebviewOverlay({
        providedViewType: init.viewType,
        title: basename2(getCustomEditorSideBySideDiffInputResource(init)),
        options: {},
        contentOptions: {},
        extension: void 0
      });
      const input = instantiationService.createInstance(CustomEditorSideBySideDiffInput, init, webview);
      if (group2) {
        input.updateGroup(group2.id);
      }
      return input;
    });
  }
  static {
    this.typeId = "workbench.editors.customSideBySideDiffEditor";
  }
  get typeId() {
    return CustomEditorSideBySideDiffInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = 8 /* Singleton */ | 128 /* CanDropIntoEditor */;
    if (this.isReadonly()) {
      capabilities |= 2 /* Readonly */;
    }
    return capabilities;
  }
  get resource() {
    return this.side === "original" ? this.originalResource : this.modifiedResource;
  }
  get originalResource() {
    return this.init.originalResource;
  }
  get modifiedResource() {
    return this.init.modifiedResource;
  }
  get side() {
    return this.init.side;
  }
  get diffId() {
    return this.init.diffId;
  }
  getName() {
    return basename2(this.resource);
  }
  getDescription(_verbosity) {
    return this.init.description ?? super.getDescription();
  }
  getTitle(verbosity) {
    const description = this.getDescription(verbosity);
    if (description) {
      return localize(14079, null, this.getName(), description);
    }
    return this.getName();
  }
  isReadonly() {
    if (this.side === "original") {
      return true;
    }
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return this.filesConfigurationService.isReadonly(this.modifiedResource);
    }
    return modelRef.object.isReadonly();
  }
  isDirty() {
    return this.side === "modified" ? this._modelRef.value?.object.isDirty() ?? false : false;
  }
  matches(otherInput) {
    if (this === otherInput) {
      return true;
    }
    if (otherInput instanceof CustomEditorSideBySideDiffInput) {
      return this.editorId === otherInput.editorId && this.side === otherInput.side && isEqual2(this.originalResource, otherInput.originalResource) && isEqual2(this.modifiedResource, otherInput.modifiedResource);
    }
    if (isEditorInput(otherInput)) {
      return false;
    }
    if (isResourceEditorInput(otherInput)) {
      return isEqual2(this.resource, otherInput.resource);
    }
    return false;
  }
  copy() {
    return CustomEditorSideBySideDiffInput.create(this.instantiationService, this.init, void 0);
  }
  async save(groupId, options3) {
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return void 0;
    }
    const target = await modelRef.object.saveCustomEditor(options3);
    if (!target) {
      return void 0;
    }
    if (!isEqual2(target, this.modifiedResource)) {
      return { resource: target };
    }
    return this;
  }
  async saveAs(groupId, options3) {
    const modelRef = this._modelRef.value;
    if (!modelRef) {
      return void 0;
    }
    const target = await this.fileDialogService.pickFileToSave(this.modifiedResource, options3?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    if (!await modelRef.object.saveCustomEditorAs(this.modifiedResource, target, options3)) {
      return void 0;
    }
    return { resource: target };
  }
  async revert(group2, options3) {
    await this._modelRef.value?.object.revert(options3);
  }
  async resolve() {
    await super.resolve();
    if (this.isDisposed()) {
      return null;
    }
    if (this.side === "modified" && !this._modelRef.value) {
      const modelRef = this.customEditorService.models.tryRetain(this.modifiedResource, this.viewType);
      if (modelRef) {
        const oldCapabilities = this.capabilities;
        const retainedModelRef = await modelRef;
        if (this.isDisposed()) {
          retainedModelRef.dispose();
          return null;
        }
        this._modelRef.value = retainedModelRef;
        this._register(retainedModelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this._register(retainedModelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
        if (this.isDirty()) {
          this._onDidChangeDirty.fire();
        }
        if (this.capabilities !== oldCapabilities) {
          this._onDidChangeCapabilities.fire();
        }
      }
    }
    return null;
  }
  undo() {
    return this.undoRedoService.undo(this.modifiedResource);
  }
  redo() {
    return this.undoRedoService.redo(this.modifiedResource);
  }
  toUntyped(_options) {
    return { resource: this.resource };
  }
};

CustomEditorSideBySideDiffInput = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IWebviewWorkbenchService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICustomEditorService),
  __decorateParam(6, IFilesConfigurationService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, IUndoRedoService)
], CustomEditorSideBySideDiffInput);
export { getCustomEditorSideBySideDiffInputResource, CustomEditorDiffInput, CustomEditorSideBySideDiffInput };
