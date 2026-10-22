// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostCustomEditors.ts
import { Cache2 } from "./module-0353.mjs";
import { joinPath } from "./module-0032.mjs";
import { Disposable2 } from "./module-0238.mjs";
import { MainContext } from "./module-0025.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { shouldSerializeBuffersForPostMessage, toExtensionData } from "./module-0352.mjs";
import { isProposedApiEnabled } from "./module-0167.mjs";
import { URI } from "./module-0023.mjs";
import { ViewColumn2 } from "./module-0239.mjs";
import { CancellationToken } from "./module-0026.mjs";
import { Schemas } from "./module-0031.mjs";
import { hash } from "./module-0042.mjs";


// src/vs/workbench/api/common/extHostCustomEditors.ts
var CustomDocumentStoreEntry = class {
  constructor(document2, _storagePath) {
    this.document = document2;
    this._storagePath = _storagePath;
    this._backupCounter = 1;
    this._edits = new Cache2("custom documents");
  }
  addEdit(item) {
    return this._edits.add([item]);
  }
  async undo(editId, isDirty) {
    await this.getEdit(editId).undo();
    if (!isDirty) {
      this.disposeBackup();
    }
  }
  async redo(editId, isDirty) {
    await this.getEdit(editId).redo();
    if (!isDirty) {
      this.disposeBackup();
    }
  }
  disposeEdits(editIds) {
    for (const id2 of editIds) {
      this._edits.delete(id2);
    }
  }
  getNewBackupUri() {
    if (!this._storagePath) {
      throw new Error("Backup requires a valid storage path");
    }
    const fileName = hashPath(this.document.uri) + this._backupCounter++;
    return joinPath(this._storagePath, fileName);
  }
  updateBackup(backup) {
    this._backup?.delete();
    this._backup = backup;
  }
  disposeBackup() {
    this._backup?.delete();
    this._backup = void 0;
  }
  getEdit(editId) {
    const edit2 = this._edits.get(editId, 0);
    if (!edit2) {
      throw new Error("No edit found");
    }
    return edit2;
  }
};

var CustomDocumentStore = class {
  constructor() {
    this._documents = /* @__PURE__ */ new Map();
  }
  get(viewType, resource) {
    return this._documents.get(this.key(viewType, resource));
  }
  add(viewType, document2, storagePath) {
    const key = this.key(viewType, document2.uri);
    if (this._documents.has(key)) {
      throw new Error(`Document already exists for viewType:${viewType} resource:${document2.uri}`);
    }
    const entry = new CustomDocumentStoreEntry(document2, storagePath);
    this._documents.set(key, entry);
    return entry;
  }
  delete(viewType, resource) {
    const key = this.key(viewType, resource);
    this._documents.delete(key);
  }
  key(viewType, resource) {
    return `${viewType}@@@${resource}`;
  }
};

var EditorProviderStore = class {
  constructor() {
    this._providers = /* @__PURE__ */ new Map();
  }
  addTextProvider(viewType, extension, provider) {
    return this.add(viewType, { type: 0 /* Text */, extension, provider });
  }
  addCustomProvider(viewType, extension, provider) {
    return this.add(viewType, { type: 1 /* Custom */, extension, provider });
  }
  get(viewType) {
    return this._providers.get(viewType);
  }
  add(viewType, entry) {
    if (this._providers.has(viewType)) {
      throw new Error(`Provider for viewType:${viewType} already registered`);
    }
    this._providers.set(viewType, entry);
    return new Disposable2(() => this._providers.delete(viewType));
  }
};

var ExtHostCustomEditors = class {
  constructor(mainContext, _extHostDocuments, _extensionStoragePaths, _extHostWebview, _extHostWebviewPanels) {
    this._extHostDocuments = _extHostDocuments;
    this._extensionStoragePaths = _extensionStoragePaths;
    this._extHostWebview = _extHostWebview;
    this._extHostWebviewPanels = _extHostWebviewPanels;
    this._editorProviders = new EditorProviderStore();
    this._documents = new CustomDocumentStore();
    this._proxy = mainContext.getProxy(MainContext.MainThreadCustomEditors);
  }
  registerCustomEditorProvider(extension, viewType, provider, options2) {
    const disposables = new DisposableStore();
    if (isCustomTextEditorProvider(provider)) {
      disposables.add(this._editorProviders.addTextProvider(viewType, extension, provider));
      this._proxy.$registerTextEditorProvider(toExtensionData(extension), viewType, options2.webviewOptions || {}, {
        supportsMove: !!provider.moveCustomTextEditor,
        supportsInlineDiff: isProposedApiEnabled(extension, "customEditorDiffs") && isCustomTextEditorProviderWithInlineDiffCapability(provider),
        supportsSideBySideDiff: isProposedApiEnabled(extension, "customEditorDiffs") && isCustomTextEditorProviderWithSideBySideDiffCapability(provider)
      }, shouldSerializeBuffersForPostMessage(extension));
    } else {
      disposables.add(this._editorProviders.addCustomProvider(viewType, extension, provider));
      const supportsCustomEditorDiffs = isProposedApiEnabled(extension, "customEditorDiffs");
      if (isCustomEditorProviderWithEditingCapability(provider)) {
        disposables.add(provider.onDidChangeCustomDocument((e) => {
          const entry = this.getCustomDocumentEntry(viewType, e.document.uri);
          if (isEditEvent(e)) {
            const editId = entry.addEdit(e);
            this._proxy.$onDidEdit(e.document.uri, viewType, editId, e.label);
          } else {
            this._proxy.$onContentChange(e.document.uri, viewType);
          }
        }));
      }
      this._proxy.$registerCustomEditorProvider(toExtensionData(extension), viewType, options2.webviewOptions || {}, {
        supportsInlineDiff: supportsCustomEditorDiffs && isCustomEditorProviderWithInlineDiffCapability(provider),
        supportsSideBySideDiff: supportsCustomEditorDiffs && isCustomEditorProviderWithSideBySideDiffCapability(provider)
      }, !!options2.supportsMultipleEditorsPerDocument, shouldSerializeBuffersForPostMessage(extension));
    }
    return Disposable2.from(
      disposables,
      new Disposable2(() => {
        this._proxy.$unregisterEditorProvider(viewType);
      })
    );
  }
  async $createCustomDocument(resource, viewType, backupId, untitledDocumentData, cancellation) {
    const entry = this._editorProviders.get(viewType);
    if (!entry) {
      throw new Error(`No provider found for '${viewType}'`);
    }
    if (entry.type !== 1 /* Custom */) {
      throw new Error(`Invalid provide type for '${viewType}'`);
    }
    const revivedResource = URI.revive(resource);
    const document2 = await entry.provider.openCustomDocument(revivedResource, { backupId, untitledDocumentData: untitledDocumentData?.buffer }, cancellation);
    let storageRoot;
    if (isCustomEditorProviderWithEditingCapability(entry.provider) && this._extensionStoragePaths) {
      storageRoot = this._extensionStoragePaths.workspaceValue(entry.extension) ?? this._extensionStoragePaths.globalValue(entry.extension);
    }
    this._documents.add(viewType, document2, storageRoot);
    return { editable: isCustomEditorProviderWithEditingCapability(entry.provider) };
  }
  async $disposeCustomDocument(resource, viewType) {
    const entry = this._editorProviders.get(viewType);
    if (!entry) {
      throw new Error(`No provider found for '${viewType}'`);
    }
    if (entry.type !== 1 /* Custom */) {
      throw new Error(`Invalid provider type for '${viewType}'`);
    }
    const revivedResource = URI.revive(resource);
    const { document: document2 } = this.getCustomDocumentEntry(viewType, revivedResource);
    this._documents.delete(viewType, revivedResource);
    document2.dispose();
  }
  async $resolveCustomEditor(resource, handle, viewType, initData, position, cancellation) {
    const entry = this._editorProviders.get(viewType);
    if (!entry) {
      throw new Error(`No provider found for '${viewType}'`);
    }
    const viewColumn = ViewColumn2.to(position);
    const webview = this._extHostWebview.createNewWebview(handle, initData.contentOptions, entry.extension);
    this._extHostWebview.ensureDefaultContentOptions(handle, initData.contentOptions, entry.extension);
    const panel = this._extHostWebviewPanels.createNewWebviewPanel(handle, viewType, initData.title, viewColumn, initData.options, webview, initData.active);
    const revivedResource = URI.revive(resource);
    switch (entry.type) {
      case 1 /* Custom */: {
        const { document: document2 } = this.getCustomDocumentEntry(viewType, revivedResource);
        return entry.provider.resolveCustomEditor(document2, panel, cancellation);
      }
      case 0 /* Text */: {
        const document2 = this._extHostDocuments.getDocument(revivedResource);
        return entry.provider.resolveCustomTextEditor(document2, panel, cancellation);
      }
      default: {
        throw new Error("Unknown webview provider type");
      }
    }
  }
  async $resolveCustomEditorInlineDiff(originalResource, modifiedResource, handle, viewType, initData, position, cancellation) {
    const { entry, panel } = this.createCustomEditorDiffPanel(handle, viewType, initData, position);
    const revivedOriginalResource = URI.revive(originalResource);
    const revivedModifiedResource = URI.revive(modifiedResource);
    if (entry.type === 0 /* Text */) {
      if (!isCustomTextEditorProviderWithInlineDiffCapability(entry.provider)) {
        throw new Error(`Provider for '${viewType}' does not support inline custom text editor diffs`);
      }
      const originalDocument2 = this._extHostDocuments.getDocument(revivedOriginalResource);
      const modifiedDocument2 = this._extHostDocuments.getDocument(revivedModifiedResource);
      return entry.provider.resolveCustomTextEditorInlineDiff({ original: originalDocument2, modified: modifiedDocument2 }, panel, cancellation);
    }
    if (!isCustomEditorProviderWithInlineDiffCapability(entry.provider)) {
      throw new Error(`Provider for '${viewType}' does not support inline custom editor diffs`);
    }
    const { document: originalDocument } = this.getCustomDocumentEntry(viewType, revivedOriginalResource);
    const { document: modifiedDocument } = this.getCustomDocumentEntry(viewType, revivedModifiedResource);
    return entry.provider.resolveCustomEditorInlineDiff({ original: originalDocument, modified: modifiedDocument }, panel, cancellation);
  }
  async $resolveCustomEditorSideBySideDiff(originalResource, modifiedResource, webviewHandles, viewType, initData, position, cancellation) {
    const { entry, panel: originalPanel } = this.createCustomEditorDiffPanel(webviewHandles.original, viewType, initData.original, position);
    const { panel: modifiedPanel } = this.createCustomEditorDiffPanel(webviewHandles.modified, viewType, initData.modified, position);
    const revivedOriginalResource = URI.revive(originalResource);
    const revivedModifiedResource = URI.revive(modifiedResource);
    if (entry.type === 0 /* Text */) {
      if (!isCustomTextEditorProviderWithSideBySideDiffCapability(entry.provider)) {
        throw new Error(`Provider for '${viewType}' does not support side by side custom text editor diffs`);
      }
      const originalDocument2 = this._extHostDocuments.getDocument(revivedOriginalResource);
      const modifiedDocument2 = this._extHostDocuments.getDocument(revivedModifiedResource);
      return entry.provider.resolveCustomTextEditorSideBySideDiff({ original: originalDocument2, modified: modifiedDocument2 }, { original: originalPanel, modified: modifiedPanel }, cancellation);
    }
    if (!isCustomEditorProviderWithSideBySideDiffCapability(entry.provider)) {
      throw new Error(`Provider for '${viewType}' does not support side by side custom editor diffs`);
    }
    const { document: originalDocument } = this.getCustomDocumentEntry(viewType, revivedOriginalResource);
    const { document: modifiedDocument } = this.getCustomDocumentEntry(viewType, revivedModifiedResource);
    return entry.provider.resolveCustomEditorSideBySideDiff({ original: originalDocument, modified: modifiedDocument }, { original: originalPanel, modified: modifiedPanel }, cancellation);
  }
  createCustomEditorDiffPanel(handle, viewType, initData, position) {
    const entry = this._editorProviders.get(viewType);
    if (!entry) {
      throw new Error(`No provider found for '${viewType}'`);
    }
    const viewColumn = ViewColumn2.to(position);
    const webview = this._extHostWebview.createNewWebview(handle, initData.contentOptions, entry.extension);
    this._extHostWebview.ensureDefaultContentOptions(handle, initData.contentOptions, entry.extension);
    const panel = this._extHostWebviewPanels.createNewWebviewPanel(handle, viewType, initData.title, viewColumn, initData.options, webview, initData.active);
    return { entry, panel };
  }
  $disposeEdits(resourceComponents, viewType, editIds) {
    const document2 = this.getCustomDocumentEntry(viewType, resourceComponents);
    document2.disposeEdits(editIds);
  }
  async $onMoveCustomEditor(handle, newResourceComponents, viewType) {
    const entry = this._editorProviders.get(viewType);
    if (!entry) {
      throw new Error(`No provider found for '${viewType}'`);
    }
    if (!entry.provider.moveCustomTextEditor) {
      throw new Error(`Provider does not implement move '${viewType}'`);
    }
    const webview = this._extHostWebviewPanels.getWebviewPanel(handle);
    if (!webview) {
      throw new Error(`No webview found`);
    }
    const resource = URI.revive(newResourceComponents);
    const document2 = this._extHostDocuments.getDocument(resource);
    await entry.provider.moveCustomTextEditor(document2, webview, CancellationToken.None);
  }
  async $undo(resourceComponents, viewType, editId, isDirty) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    return entry.undo(editId, isDirty);
  }
  async $redo(resourceComponents, viewType, editId, isDirty) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    return entry.redo(editId, isDirty);
  }
  async $revert(resourceComponents, viewType, cancellation) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    const provider = this.getCustomEditorProvider(viewType);
    await provider.revertCustomDocument(entry.document, cancellation);
    entry.disposeBackup();
  }
  async $onSave(resourceComponents, viewType, cancellation) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    const provider = this.getCustomEditorProvider(viewType);
    await provider.saveCustomDocument(entry.document, cancellation);
    entry.disposeBackup();
  }
  async $onSaveAs(resourceComponents, viewType, targetResource, cancellation) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    const provider = this.getCustomEditorProvider(viewType);
    return provider.saveCustomDocumentAs(entry.document, URI.revive(targetResource), cancellation);
  }
  async $backup(resourceComponents, viewType, cancellation) {
    const entry = this.getCustomDocumentEntry(viewType, resourceComponents);
    const provider = this.getCustomEditorProvider(viewType);
    const backup = await provider.backupCustomDocument(entry.document, {
      destination: entry.getNewBackupUri()
    }, cancellation);
    entry.updateBackup(backup);
    return backup.id;
  }
  getCustomDocumentEntry(viewType, resource) {
    const entry = this._documents.get(viewType, URI.revive(resource));
    if (!entry) {
      throw new Error("No custom document found");
    }
    return entry;
  }
  getCustomEditorProvider(viewType) {
    const entry = this._editorProviders.get(viewType);
    const provider = entry?.provider;
    if (!provider || !isCustomEditorProviderWithEditingCapability(provider)) {
      throw new Error("Custom document is not editable");
    }
    return provider;
  }
};

function isCustomEditorProviderWithEditingCapability(provider) {
  return !!provider.onDidChangeCustomDocument;
}

function isCustomTextEditorProvider(provider) {
  return typeof provider.resolveCustomTextEditor === "function";
}

function isCustomTextEditorProviderWithInlineDiffCapability(provider) {
  return typeof provider.resolveCustomTextEditorInlineDiff === "function";
}

function isCustomTextEditorProviderWithSideBySideDiffCapability(provider) {
  return typeof provider.resolveCustomTextEditorSideBySideDiff === "function";
}

function isCustomEditorProviderWithInlineDiffCapability(provider) {
  return typeof provider.resolveCustomEditorInlineDiff === "function";
}

function isCustomEditorProviderWithSideBySideDiffCapability(provider) {
  return typeof provider.resolveCustomEditorSideBySideDiff === "function";
}

function isEditEvent(e) {
  return typeof e.undo === "function" && typeof e.redo === "function";
}

function hashPath(resource) {
  const str = resource.scheme === Schemas.file || resource.scheme === Schemas.untitled ? resource.fsPath : resource.toString();
  return hash(str) + "";
}
export { isCustomEditorProviderWithEditingCapability, isCustomTextEditorProvider, isCustomTextEditorProviderWithInlineDiffCapability, isCustomTextEditorProviderWithSideBySideDiffCapability, isCustomEditorProviderWithInlineDiffCapability, isCustomEditorProviderWithSideBySideDiffCapability, isEditEvent, hashPath, CustomDocumentStoreEntry, CustomDocumentStore, EditorProviderStore, ExtHostCustomEditors };
