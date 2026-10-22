// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/browser/customEditorInput.ts
import { IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput } from "./module-1120.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IWebviewService } from "./module-1042.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename } from "./module-0026.mjs";
import { dirname2, isEqual2 } from "./module-0034.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { createEditorOpenError } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { toAction } from "./module-0082.mjs";
import { getWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ICustomEditorService } from "./module-1114.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IFileService } from "./module-0269.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ICustomEditorLabelService } from "./module-0931.mjs";


// src/vs/workbench/contrib/customEditor/browser/customEditorInput.ts
var CustomEditorInput = class extends LazilyResolvedWebviewEditorInput {
  constructor(init, webview, options3, themeService, webviewWorkbenchService, instantiationService, labelService, customEditorService, fileDialogService, undoRedoService, fileService, filesConfigurationService, editorGroupsService, layoutService, customEditorLabelService) {
    super({ providedId: init.viewType, viewType: init.viewType, name: init.preferredName ?? "", iconPath: init.iconPath }, webview, themeService, webviewWorkbenchService);
    this.instantiationService = instantiationService;
    this.labelService = labelService;
    this.customEditorService = customEditorService;
    this.fileDialogService = fileDialogService;
    this.undoRedoService = undoRedoService;
    this.fileService = fileService;
    this.filesConfigurationService = filesConfigurationService;
    this.editorGroupsService = editorGroupsService;
    this.layoutService = layoutService;
    this.customEditorLabelService = customEditorLabelService;
    this._editorName = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._editorResource = init.resource;
    this.oldResource = options3.oldResource;
    this._defaultDirtyState = options3.startsDirty;
    this._backupId = options3.backupId;
    this._untitledDocumentData = options3.untitledDocumentData;
    this.registerListeners();
  }
  static create(instantiationService, init, group2, options3) {
    return instantiationService.invokeFunction((accessor) => {
      const untitledTextEditorService = accessor.get(IUntitledTextEditorService);
      const untitledTextModel = untitledTextEditorService.get(init.resource);
      const untitledString = untitledTextModel?.textEditorModel?.getValue();
      const untitledDocumentData = untitledString ? VSBuffer.fromString(untitledString) : void 0;
      const webview = accessor.get(IWebviewService).createWebviewOverlay({
        providedViewType: init.viewType,
        title: init.webviewTitle,
        options: { customClasses: options3?.customClasses },
        contentOptions: {},
        extension: void 0
      });
      const input = instantiationService.createInstance(CustomEditorInput, init, webview, { untitledDocumentData, oldResource: options3?.oldResource });
      if (typeof group2 !== "undefined") {
        input.updateGroup(group2);
      }
      return input;
    });
  }
  static {
    this.typeId = "workbench.editors.webviewEditor";
  }
  get resource() {
    return this._editorResource;
  }
  registerListeners() {
    this._register(this.labelService.onDidChangeFormatters((e) => this.onLabelEvent(e.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderRegistrations((e) => this.onLabelEvent(e.scheme)));
    this._register(this.fileService.onDidChangeFileSystemProviderCapabilities((e) => this.onLabelEvent(e.scheme)));
    this._register(this.customEditorLabelService.onDidChange(() => this.updateLabel()));
    this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
  }
  onLabelEvent(scheme) {
    if (scheme === this.resource.scheme) {
      this.updateLabel();
    }
  }
  updateLabel() {
    this._editorName = void 0;
    this._shortDescription = void 0;
    this._mediumDescription = void 0;
    this._longDescription = void 0;
    this._shortTitle = void 0;
    this._mediumTitle = void 0;
    this._longTitle = void 0;
    this._onDidChangeLabel.fire();
  }
  get typeId() {
    return CustomEditorInput.typeId;
  }
  get editorId() {
    return this.viewType;
  }
  get capabilities() {
    let capabilities = 0 /* None */;
    capabilities |= 128 /* CanDropIntoEditor */;
    if (!this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
      capabilities |= 8 /* Singleton */;
    }
    if (this.isReadonly()) {
      capabilities |= 2 /* Readonly */;
    }
    if (this.resource.scheme === Schemas.untitled) {
      capabilities |= 4 /* Untitled */;
    }
    return capabilities;
  }
  getName() {
    const customTitle = this.getWebviewTitle();
    if (customTitle) {
      return customTitle;
    }
    this._editorName ??= this.customEditorLabelService.getName(this.resource) ?? basename(this.labelService.getUriLabel(this.resource));
    return this._editorName;
  }
  getDescription(verbosity = 1 /* MEDIUM */) {
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.shortDescription;
      case 2 /* LONG */:
        return this.longDescription;
      case 1 /* MEDIUM */:
      default:
        return this.mediumDescription;
    }
  }
  get shortDescription() {
    this._shortDescription ??= this.labelService.getUriBasenameLabel(dirname2(this.resource));
    return this._shortDescription;
  }
  get mediumDescription() {
    this._mediumDescription ??= this.labelService.getUriLabel(dirname2(this.resource), { relative: true });
    return this._mediumDescription;
  }
  get longDescription() {
    this._longDescription ??= this.labelService.getUriLabel(dirname2(this.resource));
    return this._longDescription;
  }
  get shortTitle() {
    this._shortTitle ??= this.getName();
    return this._shortTitle;
  }
  get mediumTitle() {
    this._mediumTitle ??= this.labelService.getUriLabel(this.resource, { relative: true });
    return this._mediumTitle;
  }
  get longTitle() {
    this._longTitle ??= this.labelService.getUriLabel(this.resource);
    return this._longTitle;
  }
  getTitle(verbosity) {
    const customTitle = this.getWebviewTitle();
    if (customTitle) {
      return customTitle;
    }
    switch (verbosity) {
      case 0 /* SHORT */:
        return this.shortTitle;
      case 2 /* LONG */:
        return this.longTitle;
      default:
      case 1 /* MEDIUM */:
        return this.mediumTitle;
    }
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return this === other || other instanceof CustomEditorInput && this.viewType === other.viewType && isEqual2(this.resource, other.resource);
  }
  copy() {
    return CustomEditorInput.create(
      this.instantiationService,
      { resource: this.resource, viewType: this.viewType, webviewTitle: this.getWebviewTitle(), preferredName: void 0, iconPath: this.iconPath },
      this.group,
      this.webview.options
    );
  }
  isReadonly() {
    if (!this._modelRef) {
      return this.filesConfigurationService.isReadonly(this.resource);
    }
    return this._modelRef.object.isReadonly();
  }
  isDirty() {
    if (!this._modelRef) {
      return !!this._defaultDirtyState;
    }
    return this._modelRef.object.isDirty();
  }
  async save(groupId, options3) {
    if (!this._modelRef) {
      return void 0;
    }
    const target = await this._modelRef.object.saveCustomEditor(options3);
    if (!target) {
      return void 0;
    }
    if (!isEqual2(target, this.resource)) {
      return { resource: target };
    }
    return this;
  }
  async saveAs(groupId, options3) {
    if (!this._modelRef) {
      return void 0;
    }
    const dialogPath = this._editorResource;
    const target = await this.fileDialogService.pickFileToSave(dialogPath, options3?.availableFileSystems);
    if (!target) {
      return void 0;
    }
    if (!await this._modelRef.object.saveCustomEditorAs(this._editorResource, target, options3)) {
      return void 0;
    }
    return (await this.rename(groupId, target))?.editor;
  }
  async revert(group2, options3) {
    if (this._modelRef) {
      return this._modelRef.object.revert(options3);
    }
    this._defaultDirtyState = false;
    this._onDidChangeDirty.fire();
  }
  async resolve() {
    await super.resolve();
    if (this.isDisposed()) {
      return null;
    }
    if (!this._modelRef) {
      const oldCapabilities = this.capabilities;
      this._modelRef = this._register(assertReturnsDefined(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
      this._register(this._modelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
      this._register(this._modelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
      if (this._untitledDocumentData) {
        this._defaultDirtyState = true;
      }
      if (this.isDirty()) {
        this._onDidChangeDirty.fire();
      }
      if (this.capabilities !== oldCapabilities) {
        this._onDidChangeCapabilities.fire();
      }
    }
    return null;
  }
  async rename(group2, newResource) {
    return { editor: { resource: newResource } };
  }
  undo() {
    assertReturnsDefined(this._modelRef);
    return this.undoRedoService.undo(this.resource);
  }
  redo() {
    assertReturnsDefined(this._modelRef);
    return this.undoRedoService.redo(this.resource);
  }
  onMove(handler) {
    this._moveHandler = handler;
  }
  transfer(other) {
    if (!super.transfer(other)) {
      return;
    }
    other._moveHandler = this._moveHandler;
    this._moveHandler = void 0;
    return other;
  }
  get backupId() {
    if (this._modelRef) {
      return this._modelRef.object.backupId;
    }
    return this._backupId;
  }
  get untitledDocumentData() {
    return this._untitledDocumentData;
  }
  toUntyped() {
    return {
      resource: this.resource,
      options: {
        override: this.viewType
      }
    };
  }
  claim(claimant, targetWindow, scopedContextKeyService) {
    if (this.doCanMove(targetWindow.vscodeWindowId) !== true) {
      throw createEditorOpenError(localize(14081, null), [
        toAction({
          id: "openInOriginalWindow",
          label: localize(14082, null),
          run: async () => {
            const originalPart = this.editorGroupsService.getPart(this.layoutService.getContainer(getWindow(this.webview.container).window));
            const currentPart = this.editorGroupsService.getPart(this.layoutService.getContainer(targetWindow.window));
            currentPart.activeGroup.moveEditor(this, originalPart.activeGroup);
          }
        })
      ], { forceMessage: true });
    }
    return super.claim(claimant, targetWindow, scopedContextKeyService);
  }
  canMove(sourceGroup, targetGroup) {
    const resolvedTargetGroup = this.editorGroupsService.getGroup(targetGroup);
    if (resolvedTargetGroup) {
      const canMove = this.doCanMove(resolvedTargetGroup.windowId);
      if (typeof canMove === "string") {
        return canMove;
      }
    }
    return super.canMove(sourceGroup, targetGroup);
  }
  doCanMove(targetWindowId) {
    if (this.isModified() && this._modelRef?.object.canHotExit === false) {
      const sourceWindowId = getWindow(this.webview.container).vscodeWindowId;
      if (sourceWindowId !== targetWindowId) {
        return localize(14080, null, this.getName());
      }
    }
    return true;
  }
};

CustomEditorInput = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IWebviewWorkbenchService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, ICustomEditorService),
  __decorateParam(8, IFileDialogService),
  __decorateParam(9, IUndoRedoService),
  __decorateParam(10, IFileService),
  __decorateParam(11, IFilesConfigurationService),
  __decorateParam(12, IEditorGroupsService),
  __decorateParam(13, IWorkbenchLayoutService),
  __decorateParam(14, ICustomEditorLabelService)
], CustomEditorInput);
export { CustomEditorInput };
