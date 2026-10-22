// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadCustomEditors.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtensionKeyedWebviewOriginStore } from "./module-1043.mjs";
import { ExtHostContext } from "./module-0922.mjs";
import { isEqual2, isEqualOrParent2, toLocalResource } from "./module-0034.mjs";
import { CustomEditorInput } from "./module-1127.mjs";
import { CustomEditorDiffInput, CustomEditorSideBySideDiffInput } from "./module-1301.mjs";
import { reviveWebviewExtension } from "./module-1041.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { editorGroupToColumn } from "./module-1079.mjs";
import { DeferredPromise, createCancelablePromise } from "./module-0036.mjs";
import { CustomTextEditorModel } from "./module-1302.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { ICustomEditorService } from "./module-1115.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWebviewWorkbenchService } from "./module-1121.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IUntitledTextEditorService } from "./module-1126.mjs";
import { ResourceWorkingCopy } from "./module-1303.mjs";
import { NO_TYPE_ID } from "./module-1123.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { multibyteAwareBtoa } from "./module-0030.mjs";
import { basename } from "./module-0026.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/workbench/api/browser/mainThreadCustomEditors.ts
var MainThreadCustomEditors = class extends Disposable {
  constructor(context2, mainThreadWebview, mainThreadWebviewPanels, extensionService, storageService, workingCopyService, workingCopyFileService, _customEditorService, _editorGroupService, _editorService, _instantiationService, _webviewWorkbenchService, _uriIdentityService, _untitledTextEditorService) {
    super();
    this.mainThreadWebview = mainThreadWebview;
    this.mainThreadWebviewPanels = mainThreadWebviewPanels;
    this._customEditorService = _customEditorService;
    this._editorGroupService = _editorGroupService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._webviewWorkbenchService = _webviewWorkbenchService;
    this._uriIdentityService = _uriIdentityService;
    this._untitledTextEditorService = _untitledTextEditorService;
    this._editorProviders = this._register(new DisposableMap());
    this._editorRenameBackups = /* @__PURE__ */ new Map();
    this._pendingSideBySideDiffResolutions = /* @__PURE__ */ new Map();
    this._webviewOriginStore = new ExtensionKeyedWebviewOriginStore("mainThreadCustomEditors.origins", storageService);
    this._proxyCustomEditors = context2.getProxy(ExtHostContext.ExtHostCustomEditors);
    this._register(workingCopyFileService.registerWorkingCopyProvider((editorResource) => {
      const matchedWorkingCopies = [];
      for (const workingCopy of workingCopyService.workingCopies) {
        if (workingCopy instanceof MainThreadCustomEditorModel) {
          if (isEqualOrParent2(editorResource, workingCopy.editorResource)) {
            matchedWorkingCopies.push(workingCopy);
          }
        }
      }
      return matchedWorkingCopies;
    }));
    this._register(_webviewWorkbenchService.registerResolver({
      canResolve: (webview) => {
        if (webview instanceof CustomEditorInput || webview instanceof CustomEditorDiffInput || webview instanceof CustomEditorSideBySideDiffInput) {
          extensionService.activateByEvent(`onCustomEditor:${webview.viewType}`);
        }
        return false;
      },
      resolveWebview: () => {
        throw new Error("not implemented");
      }
    }));
    this._register(workingCopyFileService.onWillRunWorkingCopyFileOperation(async (e4) => this.onWillRunWorkingCopyFileOperation(e4)));
  }
  $registerTextEditorProvider(extensionData, viewType, options3, capabilities, serializeBuffersForPostMessage) {
    this.registerEditorProvider(
      1 /* Text */,
      reviveWebviewExtension(extensionData),
      viewType,
      options3,
      capabilities,
      true,
      serializeBuffersForPostMessage
    );
  }
  $registerCustomEditorProvider(extensionData, viewType, options3, capabilities, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
    this.registerEditorProvider(
      0 /* Custom */,
      reviveWebviewExtension(extensionData),
      viewType,
      options3,
      capabilities,
      supportsMultipleEditorsPerDocument,
      serializeBuffersForPostMessage
    );
  }
  registerEditorProvider(modelType, extension, viewType, options3, capabilities, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
    if (this._editorProviders.has(viewType)) {
      throw new Error(`Provider for ${viewType} already registered`);
    }
    const disposables = new DisposableStore();
    disposables.add(this._customEditorService.registerCustomEditorCapabilities(viewType, {
      supportsMultipleEditorsPerDocument,
      isTextEditor: modelType === 1 /* Text */,
      supportsInlineDiff: capabilities.supportsInlineDiff,
      supportsSideBySideDiff: capabilities.supportsSideBySideDiff
    }));
    disposables.add(this._webviewWorkbenchService.registerResolver({
      canResolve: (webviewInput) => {
        return (webviewInput instanceof CustomEditorInput || webviewInput instanceof CustomEditorDiffInput || webviewInput instanceof CustomEditorSideBySideDiffInput) && webviewInput.viewType === viewType;
      },
      resolveWebview: async (webviewInput, cancellation) => {
        if (!(webviewInput instanceof CustomEditorInput || webviewInput instanceof CustomEditorDiffInput || webviewInput instanceof CustomEditorSideBySideDiffInput)) {
          return;
        }
        const handle2 = generateUuid();
        webviewInput.webview.origin = this._webviewOriginStore.getOrigin(viewType, extension.id);
        this.mainThreadWebviewPanels.addWebviewInput(handle2, webviewInput, { serializeBuffersForPostMessage });
        webviewInput.webview.options = options3;
        webviewInput.webview.extension = extension;
        const resource = webviewInput instanceof CustomEditorDiffInput ? webviewInput.modifiedResource : webviewInput.resource;
        let backupId;
        if (webviewInput instanceof CustomEditorInput) {
          backupId = webviewInput.backupId;
          if (webviewInput.oldResource && !webviewInput.backupId) {
            const backup = this._editorRenameBackups.get(webviewInput.oldResource.toString());
            backupId = backup?.backupId;
            this._editorRenameBackups.delete(webviewInput.oldResource.toString());
          }
        }
        let modelRef;
        const additionalModelRefs = new DisposableStore();
        try {
          modelRef = await this.getOrCreateCustomEditorModel(modelType, resource, viewType, { backupId }, cancellation);
          if (webviewInput instanceof CustomEditorDiffInput && !isEqual2(webviewInput.originalResource, resource)) {
            additionalModelRefs.add(await this.getOrCreateCustomEditorModel(modelType, webviewInput.originalResource, viewType, {}, cancellation));
          } else if (modelType === 1 /* Text */ && webviewInput instanceof CustomEditorSideBySideDiffInput) {
            const otherResource = webviewInput.side === "original" ? webviewInput.modifiedResource : webviewInput.originalResource;
            if (!isEqual2(otherResource, resource)) {
              additionalModelRefs.add(await this.getOrCreateCustomEditorModel(modelType, otherResource, viewType, {}, cancellation));
            }
          }
        } catch (error) {
          onUnexpectedError(error);
          webviewInput.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(viewType));
          additionalModelRefs.dispose();
          modelRef?.dispose();
          return;
        }
        if (!modelRef) {
          additionalModelRefs.dispose();
          return;
        }
        let resolvedModelRef = modelRef;
        if (cancellation.isCancellationRequested) {
          additionalModelRefs.dispose();
          resolvedModelRef.dispose();
          return;
        }
        const disposeModelRefs = () => {
          additionalModelRefs.dispose();
          if (resolvedModelRef.object.isDirty()) {
            const sub = resolvedModelRef.object.onDidChangeDirty(() => {
              if (!resolvedModelRef.object.isDirty()) {
                sub.dispose();
                resolvedModelRef.dispose();
              }
            });
            return;
          }
          resolvedModelRef.dispose();
        };
        const disposeSub = webviewInput.webview.onDidDispose(() => {
          disposeSub.dispose();
          inputDisposeSub.dispose();
          disposeModelRefs();
        });
        const inputDisposeSub = webviewInput.onWillDispose(() => {
          inputDisposeSub.dispose();
          disposeSub.dispose();
          disposeModelRefs();
        });
        if (webviewInput instanceof CustomEditorInput && capabilities.supportsMove) {
          webviewInput.onMove(async (newResource) => {
            const oldModel = resolvedModelRef;
            resolvedModelRef = await this.getOrCreateCustomEditorModel(modelType, newResource, viewType, {}, CancellationToken.None);
            this._proxyCustomEditors.$onMoveCustomEditor(handle2, newResource, viewType);
            oldModel.dispose();
          });
        }
        try {
          const initData = {
            title: webviewInput.getTitle(),
            contentOptions: webviewInput.webview.contentOptions,
            options: webviewInput.webview.options,
            active: webviewInput === this._editorService.activeEditor
          };
          const position2 = editorGroupToColumn(this._editorGroupService, webviewInput.group || 0);
          if (webviewInput instanceof CustomEditorDiffInput) {
            const originalResource = modelType === 1 /* Text */ ? this._uriIdentityService.asCanonicalUri(webviewInput.originalResource) : webviewInput.originalResource;
            const modifiedResource = modelType === 1 /* Text */ ? this._uriIdentityService.asCanonicalUri(webviewInput.modifiedResource) : webviewInput.modifiedResource;
            await this._proxyCustomEditors.$resolveCustomEditorInlineDiff(
              originalResource,
              modifiedResource,
              handle2,
              viewType,
              initData,
              position2,
              cancellation
            );
          } else if (webviewInput instanceof CustomEditorSideBySideDiffInput) {
            await this.resolveCustomEditorSideBySideDiff(modelType, webviewInput, handle2, viewType, initData, position2, cancellation);
          } else {
            const actualResource = modelType === 1 /* Text */ ? this._uriIdentityService.asCanonicalUri(resource) : resource;
            await this._proxyCustomEditors.$resolveCustomEditor(actualResource, handle2, viewType, initData, position2, cancellation);
          }
        } catch (error) {
          onUnexpectedError(error);
          webviewInput.webview.setHtml(this.mainThreadWebview.getWebviewResolvedFailedContent(viewType));
          additionalModelRefs.dispose();
          resolvedModelRef.dispose();
          return;
        }
      }
    }));
    this._editorProviders.set(viewType, disposables);
  }
  resolveCustomEditorSideBySideDiff(modelType, webviewInput, handle2, viewType, initData, position2, cancellation) {
    let pending = this._pendingSideBySideDiffResolutions.get(webviewInput.diffId);
    if (!pending) {
      pending = {
        promise: new DeferredPromise(),
        cancellation: new CancellationTokenSource(),
        disposables: new DisposableStore()
      };
      this._pendingSideBySideDiffResolutions.set(webviewInput.diffId, pending);
    }
    const cleanup = () => {
      this._pendingSideBySideDiffResolutions.delete(webviewInput.diffId);
      pending.disposables.dispose();
      pending.cancellation.dispose();
    };
    pending.disposables.add(cancellation.onCancellationRequested(() => {
      pending.cancellation.cancel();
      if (!pending.started) {
        pending.promise.cancel();
        cleanup();
      }
    }));
    pending[webviewInput.side] = { handle: handle2, initData };
    if (pending.original && pending.modified && !pending.started) {
      pending.started = true;
      pending.promise.settleWith((async () => {
        try {
          const originalResource = modelType === 1 /* Text */ ? this._uriIdentityService.asCanonicalUri(webviewInput.originalResource) : webviewInput.originalResource;
          const modifiedResource = modelType === 1 /* Text */ ? this._uriIdentityService.asCanonicalUri(webviewInput.modifiedResource) : webviewInput.modifiedResource;
          await this._proxyCustomEditors.$resolveCustomEditorSideBySideDiff(
            originalResource,
            modifiedResource,
            {
              original: pending.original.handle,
              modified: pending.modified.handle
            },
            viewType,
            {
              original: pending.original.initData,
              modified: pending.modified.initData
            },
            position2,
            pending.cancellation.token
          );
        } finally {
          cleanup();
        }
      })());
    }
    return pending.promise.p;
  }
  $unregisterEditorProvider(viewType) {
    if (!this._editorProviders.has(viewType)) {
      throw new Error(`No provider for ${viewType} registered`);
    }
    this._editorProviders.deleteAndDispose(viewType);
    this._customEditorService.models.disposeAllModelsForView(viewType);
  }
  async getOrCreateCustomEditorModel(modelType, resource, viewType, options3, cancellation) {
    const existingModel = this._customEditorService.models.tryRetain(resource, viewType);
    if (existingModel) {
      return existingModel;
    }
    switch (modelType) {
      case 1 /* Text */: {
        const model = CustomTextEditorModel.create(this._instantiationService, viewType, resource);
        return this._customEditorService.models.add(resource, viewType, model);
      }
      case 0 /* Custom */: {
        const model = MainThreadCustomEditorModel.create(this._instantiationService, this._proxyCustomEditors, viewType, resource, options3, this._untitledTextEditorService, () => {
          return Array.from(this.mainThreadWebviewPanels.webviewInputs).filter((editor) => editor instanceof CustomEditorInput && isEqual2(editor.resource, resource) || editor instanceof CustomEditorDiffInput && (isEqual2(editor.originalResource, resource) || isEqual2(editor.modifiedResource, resource)) || editor instanceof CustomEditorSideBySideDiffInput && isEqual2(editor.resource, resource));
        }, cancellation);
        return this._customEditorService.models.add(resource, viewType, model);
      }
    }
  }
  async $onDidEdit(resourceComponents, viewType, editId, label3) {
    const model = await this.getCustomEditorModel(resourceComponents, viewType);
    model.pushEdit(editId, label3);
  }
  async $onContentChange(resourceComponents, viewType) {
    const model = await this.getCustomEditorModel(resourceComponents, viewType);
    model.changeContent();
  }
  async getCustomEditorModel(resourceComponents, viewType) {
    const resource = URI.revive(resourceComponents);
    const model = await this._customEditorService.models.get(resource, viewType);
    if (!model || !(model instanceof MainThreadCustomEditorModel)) {
      throw new Error("Could not find model for webview editor");
    }
    return model;
  }
  //#region Working Copy
  async onWillRunWorkingCopyFileOperation(e4) {
    if (e4.operation !== 2 /* MOVE */) {
      return;
    }
    e4.waitUntil((async () => {
      const models = [];
      for (const file of e4.files) {
        if (file.source) {
          models.push(...await this._customEditorService.models.getAllModels(file.source));
        }
      }
      for (const model of models) {
        if (model instanceof MainThreadCustomEditorModel && model.isDirty()) {
          const workingCopy = await model.backup(CancellationToken.None);
          if (workingCopy.meta) {
            this._editorRenameBackups.set(model.editorResource.toString(), workingCopy.meta);
          }
        }
      }
    })());
  }
  //#endregion
};

MainThreadCustomEditors = __decorateClass([
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IWorkingCopyService),
  __decorateParam(6, IWorkingCopyFileService),
  __decorateParam(7, ICustomEditorService),
  __decorateParam(8, IEditorGroupsService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IWebviewWorkbenchService),
  __decorateParam(12, IUriIdentityService),
  __decorateParam(13, IUntitledTextEditorService)
], MainThreadCustomEditors);

var HotExitState;

((HotExitState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Allowed"] = 0] = "Allowed";
    Type4[Type4["NotAllowed"] = 1] = "NotAllowed";
    Type4[Type4["Pending"] = 2] = "Pending";
  })(Type3 = HotExitState2.Type || (HotExitState2.Type = {}));
  HotExitState2.Allowed = Object.freeze({ type: 0 /* Allowed */ });
  HotExitState2.NotAllowed = Object.freeze({ type: 1 /* NotAllowed */ });
  class Pending {
    constructor(operation) {
      this.operation = operation;
      this.type = 2 /* Pending */;
    }
  }
  HotExitState2.Pending = Pending;
})(HotExitState || (HotExitState = {}));

var MainThreadCustomEditorModel = class extends ResourceWorkingCopy {
  constructor(_proxy, _viewType, _editorResource, fromBackup, _editable, startDirty, _getEditors, _fileDialogService, fileService, _labelService, _undoService, _environmentService, workingCopyService, _pathService, extensionService) {
    super(MainThreadCustomEditorModel.toWorkingCopyResource(_viewType, _editorResource), fileService);
    this._proxy = _proxy;
    this._viewType = _viewType;
    this._editorResource = _editorResource;
    this._editable = _editable;
    this._getEditors = _getEditors;
    this._fileDialogService = _fileDialogService;
    this._labelService = _labelService;
    this._undoService = _undoService;
    this._environmentService = _environmentService;
    this._pathService = _pathService;
    this._fromBackup = false;
    this._hotExitState = HotExitState.Allowed;
    this._currentEditIndex = -1;
    this._savePoint = -1;
    this._edits = [];
    // TODO@mjbvz consider to enable a `typeId` that is specific for custom
    // editors. Using a distinct `typeId` allows the working copy to have
    // any resource (including file based resources) even if other working
    // copies exist with the same resource.
    //
    // IMPORTANT: changing the `typeId` has an impact on backups for this
    // working copy. Any value that is not the empty string will be used
    // as seed to the backup. Only change the `typeId` if you have implemented
    // a fallback solution to resolve any existing backups that do not have
    // this seed.
    this.typeId = NO_TYPE_ID;
    this._onDidChangeDirty = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidSave = this._register(new Emitter());
    this.onDidSave = this._onDidSave.event;
    this.onDidChangeReadonly = Event2.None;
    this._fromBackup = fromBackup;
    this._isDirtyFromContentChange = startDirty;
    if (_editable) {
      this._register(workingCopyService.registerWorkingCopy(this));
      this._register(extensionService.onWillStop((e4) => {
        e4.veto(true, localize(5675, null, this.name));
      }));
    }
  }
  static async create(instantiationService, proxy, viewType, resource, options3, untitledTextEditorService, getEditors, cancellation) {
    const editors = getEditors();
    let untitledDocumentData;
    const primaryCustomEditorInput = editors.find((editor) => editor instanceof CustomEditorInput);
    if (primaryCustomEditorInput) {
      untitledDocumentData = primaryCustomEditorInput.untitledDocumentData;
    }
    const { editable } = await proxy.$createCustomDocument(resource, viewType, options3.backupId, untitledDocumentData, cancellation);
    if (untitledDocumentData && resource.scheme === Schemas.untitled) {
      untitledTextEditorService.get(resource)?.revert();
    }
    return instantiationService.createInstance(MainThreadCustomEditorModel, proxy, viewType, resource, !!options3.backupId, editable, !!untitledDocumentData, getEditors);
  }
  get editorResource() {
    return this._editorResource;
  }
  dispose() {
    if (this._editable) {
      this._undoService.removeElements(this._editorResource);
    }
    this._proxy.$disposeCustomDocument(this._editorResource, this._viewType);
    super.dispose();
  }
  //#region IWorkingCopy
  // Make sure each custom editor has a unique resource for backup and edits
  static toWorkingCopyResource(viewType, resource) {
    const authority = viewType.replace(/[^a-z0-9\-_]/gi, "-");
    const path = `/${multibyteAwareBtoa(resource.with({ query: null, fragment: null }).toString(true))}`;
    return URI.from({
      scheme: Schemas.vscodeCustomEditor,
      authority,
      path,
      query: JSON.stringify(resource.toJSON())
    });
  }
  get name() {
    return basename(this._labelService.getUriLabel(this._editorResource));
  }
  get capabilities() {
    return this.isUntitled() ? 2 /* Untitled */ : 0 /* None */;
  }
  isDirty() {
    if (this._isDirtyFromContentChange) {
      return true;
    }
    if (this._edits.length > 0) {
      return this._savePoint !== this._currentEditIndex;
    }
    return this._fromBackup;
  }
  isUntitled() {
    return this._editorResource.scheme === Schemas.untitled;
  }
  //#endregion
  isReadonly() {
    return !this._editable;
  }
  get viewType() {
    return this._viewType;
  }
  get backupId() {
    return this._backupId;
  }
  pushEdit(editId, label3) {
    if (!this._editable) {
      throw new Error("Document is not editable");
    }
    this.change(() => {
      this.spliceEdits(editId);
      this._currentEditIndex = this._edits.length - 1;
    });
    this._undoService.pushElement({
      type: 0 /* Resource */,
      resource: this._editorResource,
      label: label3 ?? localize(5674, null),
      code: "undoredo.customEditorEdit",
      undo: () => this.undo(),
      redo: () => this.redo()
    });
  }
  changeContent() {
    this.change(() => {
      this._isDirtyFromContentChange = true;
    });
  }
  async undo() {
    if (!this._editable) {
      return;
    }
    if (this._currentEditIndex < 0) {
      return;
    }
    const undoneEdit = this._edits[this._currentEditIndex];
    this.change(() => {
      --this._currentEditIndex;
    });
    await this._proxy.$undo(this._editorResource, this.viewType, undoneEdit, this.isDirty());
  }
  async redo() {
    if (!this._editable) {
      return;
    }
    if (this._currentEditIndex >= this._edits.length - 1) {
      return;
    }
    const redoneEdit = this._edits[this._currentEditIndex + 1];
    this.change(() => {
      ++this._currentEditIndex;
    });
    await this._proxy.$redo(this._editorResource, this.viewType, redoneEdit, this.isDirty());
  }
  spliceEdits(editToInsert) {
    const start = this._currentEditIndex + 1;
    const toRemove = this._edits.length - this._currentEditIndex;
    const removedEdits = typeof editToInsert === "number" ? this._edits.splice(start, toRemove, editToInsert) : this._edits.splice(start, toRemove);
    if (removedEdits.length) {
      this._proxy.$disposeEdits(this._editorResource, this._viewType, removedEdits);
    }
  }
  change(makeEdit) {
    const wasDirty = this.isDirty();
    makeEdit();
    this._onDidChangeContent.fire();
    if (this.isDirty() !== wasDirty) {
      this._onDidChangeDirty.fire();
    }
  }
  async revert(options3) {
    if (!this._editable) {
      return;
    }
    if (this._currentEditIndex === this._savePoint && !this._isDirtyFromContentChange && !this._fromBackup) {
      return;
    }
    if (!options3?.soft) {
      this._proxy.$revert(this._editorResource, this.viewType, CancellationToken.None);
    }
    this.change(() => {
      this._isDirtyFromContentChange = false;
      this._fromBackup = false;
      this._currentEditIndex = this._savePoint;
      this.spliceEdits();
    });
  }
  async save(options3) {
    const result = !!await this.saveCustomEditor(options3);
    if (result) {
      this._onDidSave.fire({ reason: options3?.reason, source: options3?.source });
    }
    return result;
  }
  async saveCustomEditor(options3) {
    if (!this._editable) {
      return void 0;
    }
    if (this.isUntitled()) {
      const targetUri = await this.suggestUntitledSavePath(options3);
      if (!targetUri) {
        return void 0;
      }
      await this.saveCustomEditorAs(this._editorResource, targetUri, options3);
      return targetUri;
    }
    const savePromise = createCancelablePromise((token) => this._proxy.$onSave(this._editorResource, this.viewType, token));
    this._ongoingSave?.cancel();
    this._ongoingSave = savePromise;
    try {
      await savePromise;
      if (this._ongoingSave === savePromise) {
        this.change(() => {
          this._isDirtyFromContentChange = false;
          this._savePoint = this._currentEditIndex;
          this._fromBackup = false;
        });
      }
    } finally {
      if (this._ongoingSave === savePromise) {
        this._ongoingSave = void 0;
      }
    }
    return this._editorResource;
  }
  suggestUntitledSavePath(options3) {
    if (!this.isUntitled()) {
      throw new Error("Resource is not untitled");
    }
    const remoteAuthority = this._environmentService.remoteAuthority;
    const localResource = toLocalResource(this._editorResource, remoteAuthority, this._pathService.defaultUriScheme);
    return this._fileDialogService.pickFileToSave(localResource, options3?.availableFileSystems);
  }
  async saveCustomEditorAs(resource, targetResource, _options) {
    if (this._editable) {
      await createCancelablePromise((token) => this._proxy.$onSaveAs(this._editorResource, this.viewType, targetResource, token));
      this.change(() => {
        this._isDirtyFromContentChange = false;
        this._savePoint = this._currentEditIndex;
        this._fromBackup = false;
      });
      return true;
    } else {
      await this.fileService.copy(
        resource,
        targetResource,
        false
        /* overwrite */
      );
      return true;
    }
  }
  get canHotExit() {
    return typeof this._backupId === "string" && this._hotExitState.type === 0 /* Allowed */;
  }
  async backup(token) {
    const editors = this._getEditors();
    if (!editors.length) {
      throw new Error("No editors found for resource, cannot back up");
    }
    const primaryEditor = editors[0];
    const backupMeta = {
      viewType: this.viewType,
      editorResource: this._editorResource,
      customTitle: primaryEditor.getWebviewTitle(),
      iconPath: primaryEditor.iconPath,
      backupId: "",
      extension: primaryEditor.extension ? {
        id: primaryEditor.extension.id.value,
        location: primaryEditor.extension.location
      } : void 0,
      webview: {
        origin: primaryEditor.webview.origin,
        options: primaryEditor.webview.options,
        state: primaryEditor.webview.state
      }
    };
    const backupData = {
      meta: backupMeta
    };
    if (!this._editable) {
      return backupData;
    }
    if (this._hotExitState.type === 2 /* Pending */) {
      this._hotExitState.operation.cancel();
    }
    const pendingState = new HotExitState.Pending(
      createCancelablePromise((token2) => this._proxy.$backup(this._editorResource.toJSON(), this.viewType, token2))
    );
    this._hotExitState = pendingState;
    token.onCancellationRequested(() => {
      pendingState.operation.cancel();
    });
    let errorMessage = "";
    try {
      const backupId = await pendingState.operation;
      if (this._hotExitState === pendingState) {
        this._hotExitState = HotExitState.Allowed;
        backupData.meta.backupId = backupId;
        this._backupId = backupId;
      }
    } catch (e4) {
      if (isCancellationError(e4)) {
        throw e4;
      }
      if (this._hotExitState === pendingState) {
        this._hotExitState = HotExitState.NotAllowed;
      }
      if (e4.message) {
        errorMessage = e4.message;
      }
    }
    if (this._hotExitState === HotExitState.Allowed) {
      return backupData;
    }
    throw new Error(`Cannot backup in this state: ${errorMessage}`);
  }
};

MainThreadCustomEditorModel = __decorateClass([
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, IFileService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IUndoRedoService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, IWorkingCopyService),
  __decorateParam(13, IPathService),
  __decorateParam(14, IExtensionService)
], MainThreadCustomEditorModel);
export { MainThreadCustomEditors, HotExitState, MainThreadCustomEditorModel };
