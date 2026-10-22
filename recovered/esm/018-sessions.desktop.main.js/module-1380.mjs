// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/dnd.ts
import { Mimes } from "./module-0136.mjs";
import { UriList } from "./module-0264.mjs";
import { CodeDataTransfers, Extensions7, LocalSelectionTransfer, createDraggedEditorInputFromRawResourcesData, extractEditorsAndFilesDropData } from "./module-0273.mjs";
import { Registry } from "./module-0090.mjs";
import { coalesce } from "./module-0007.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { IWorkspaceContextService, hasWorkspaceFileExtension, isTemporaryWorkspace } from "./module-0509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspacesService } from "./module-1378.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkspaceEditingService } from "./module-1313.mjs";
import { IHostService } from "./module-1118.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ILabelService } from "./module-0641.mjs";
import { URI } from "./module-0032.mjs";
import { EditorResourceAccessor, isEditorIdentifier, isResourceDiffEditorInput, isResourceMergeEditorInput, isResourceSideBySideEditorInput } from "./module-0926.mjs";
import { extractSelection, withSelection } from "./module-0272.mjs";
import { isWindows } from "./module-0014.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { stringify } from "./module-0265.mjs";
import { Disposable, DisposableStore, markAsSingleton } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DragAndDropObserver, EventType, addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { BroadcastDataChannel } from "./module-1379.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/browser/dnd.ts
var DraggedEditorIdentifier = class {
  constructor(identifier2) {
    this.identifier = identifier2;
  }
};

var DraggedEditorGroupIdentifier = class {
  constructor(identifier2) {
    this.identifier = identifier2;
  }
};

async function extractTreeDropData(dataTransfer) {
  const editors = [];
  const resourcesKey = Mimes.uriList.toLowerCase();
  if (dataTransfer.has(resourcesKey)) {
    try {
      const asString3 = await dataTransfer.get(resourcesKey)?.asString();
      const rawResourcesData = JSON.stringify(UriList.parse(asString3 ?? ""));
      editors.push(...createDraggedEditorInputFromRawResourcesData(rawResourcesData));
    } catch (error) {
    }
  }
  return editors;
}

var ResourcesDropHandler = class {
  constructor(options3, fileService, workspacesService, editorService, workspaceEditingService, hostService, contextService, instantiationService) {
    this.options = options3;
    this.fileService = fileService;
    this.workspacesService = workspacesService;
    this.editorService = editorService;
    this.workspaceEditingService = workspaceEditingService;
    this.hostService = hostService;
    this.contextService = contextService;
    this.instantiationService = instantiationService;
  }
  async handleDrop(event, targetWindow, resolveTargetGroup, afterDrop, options3) {
    const editors = await this.instantiationService.invokeFunction((accessor) => extractEditorsAndFilesDropData(accessor, event));
    if (!editors.length) {
      return;
    }
    await this.hostService.focus(targetWindow);
    const dndRegistry = Registry.as(Extensions7.DragAndDropContribution);
    for (const { resource } of editors) {
      if (resource) {
        const handled = await this.instantiationService.invokeFunction((accessor) => dndRegistry.handleResourceDrop(resource, accessor));
        if (handled) {
          return;
        }
      }
    }
    if (this.options.allowWorkspaceOpen) {
      const localFilesAllowedToOpenAsWorkspace = coalesce(editors.filter((editor) => editor.allowWorkspaceOpen && editor.resource?.scheme === Schemas.file).map((editor) => editor.resource));
      if (localFilesAllowedToOpenAsWorkspace.length > 0) {
        const isWorkspaceOpening = await this.handleWorkspaceDrop(localFilesAllowedToOpenAsWorkspace);
        if (isWorkspaceOpening) {
          return;
        }
      }
    }
    const externalLocalFiles = coalesce(editors.filter((editor) => editor.isExternal && editor.resource?.scheme === Schemas.file).map((editor) => editor.resource));
    if (externalLocalFiles.length) {
      this.workspacesService.addRecentlyOpened(externalLocalFiles.map((resource) => ({ fileUri: resource })));
    }
    const targetGroup = resolveTargetGroup?.();
    await this.editorService.openEditors(editors.map((editor) => ({
      ...editor,
      resource: editor.resource,
      options: {
        ...editor.options,
        ...options3,
        pinned: true
      }
    })), targetGroup, { validateTrust: true });
    afterDrop?.(targetGroup);
  }
  async handleWorkspaceDrop(resources) {
    const toOpen = [];
    const folderURIs = [];
    await Promise.all(resources.map(async (resource) => {
      if (hasWorkspaceFileExtension(resource)) {
        toOpen.push({ workspaceUri: resource });
        return;
      }
      try {
        const stat = await this.fileService.stat(resource);
        if (stat.isDirectory) {
          toOpen.push({ folderUri: stat.resource });
          folderURIs.push({ uri: stat.resource });
        }
      } catch (error) {
      }
    }));
    if (toOpen.length === 0) {
      return false;
    }
    if (toOpen.length > folderURIs.length || folderURIs.length === 1) {
      await this.hostService.openWindow(toOpen);
    } else if (isTemporaryWorkspace(this.contextService.getWorkspace())) {
      await this.workspaceEditingService.addFolders(folderURIs);
    } else {
      await this.workspaceEditingService.createAndEnterWorkspace(folderURIs);
    }
    return true;
  }
};

ResourcesDropHandler = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IWorkspacesService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IWorkspaceEditingService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IInstantiationService)
], ResourcesDropHandler);

function fillEditorsDragData(accessor, resourcesOrEditors, event, options3) {
  if (resourcesOrEditors.length === 0 || !event.dataTransfer) {
    return;
  }
  const textFileService = accessor.get(ITextFileService);
  const editorService = accessor.get(IEditorService);
  const fileService = accessor.get(IFileService);
  const labelService = accessor.get(ILabelService);
  const resources = coalesce(resourcesOrEditors.map((resourceOrEditor) => {
    if (URI.isUri(resourceOrEditor)) {
      return { resource: resourceOrEditor };
    }
    if (isEditorIdentifier(resourceOrEditor)) {
      if (URI.isUri(resourceOrEditor.editor.resource)) {
        return { resource: resourceOrEditor.editor.resource };
      }
      return void 0;
    }
    return {
      resource: resourceOrEditor.selection ? withSelection(resourceOrEditor.resource, resourceOrEditor.selection) : resourceOrEditor.resource,
      isDirectory: resourceOrEditor.isDirectory,
      selection: resourceOrEditor.selection
    };
  }));
  const fileSystemResources = resources.filter(({ resource }) => fileService.hasProvider(resource));
  if (!options3?.disableStandardTransfer) {
    const lineDelimiter2 = isWindows ? "\r\n" : "\n";
    event.dataTransfer.setData(DataTransfers.TEXT, fileSystemResources.map(({ resource }) => labelService.getUriLabel(resource, { noPrefix: true })).join(lineDelimiter2));
    const firstFile = fileSystemResources.find(({ isDirectory }) => !isDirectory);
    if (firstFile) {
      const firstFileUri = FileAccess.uriToFileUri(firstFile.resource);
      if (firstFileUri.scheme === Schemas.file) {
        event.dataTransfer.setData(DataTransfers.DOWNLOAD_URL, [Mimes.binary, basename2(firstFile.resource), firstFileUri.toString()].join(":"));
      }
    }
  }
  const files = fileSystemResources.filter(({ isDirectory }) => !isDirectory);
  if (files.length) {
    event.dataTransfer.setData(DataTransfers.RESOURCES, JSON.stringify(files.map(({ resource }) => resource.toString())));
  }
  const contributions = Registry.as(Extensions7.DragAndDropContribution).getAll();
  for (const contribution of contributions) {
    contribution.setData(resources, event);
  }
  const draggedEditors = [];
  for (const resourceOrEditor of resourcesOrEditors) {
    let editor = void 0;
    if (isEditorIdentifier(resourceOrEditor)) {
      const untypedEditor = resourceOrEditor.editor.toUntyped({ preserveViewState: resourceOrEditor.groupId });
      if (untypedEditor) {
        editor = { ...untypedEditor, resource: EditorResourceAccessor.getCanonicalUri(untypedEditor) };
      }
    } else if (URI.isUri(resourceOrEditor)) {
      const { selection, uri: uri4 } = extractSelection(resourceOrEditor);
      editor = { resource: uri4, options: selection ? { selection } : void 0 };
    } else if (!resourceOrEditor.isDirectory) {
      editor = {
        resource: resourceOrEditor.resource,
        options: {
          selection: resourceOrEditor.selection
        }
      };
    }
    if (!editor) {
      continue;
    }
    {
      const resource = editor.resource;
      if (resource) {
        const textFileModel = textFileService.files.get(resource);
        if (textFileModel) {
          if (typeof editor.languageId !== "string") {
            editor.languageId = textFileModel.getLanguageId();
          }
          if (typeof editor.encoding !== "string") {
            editor.encoding = textFileModel.getEncoding();
          }
          if (typeof editor.contents !== "string" && textFileModel.isDirty() && !textFileModel.textEditorModel.isTooLargeForHeapOperation()) {
            editor.contents = textFileModel.textEditorModel.getValue();
          }
        }
        if (!editor.options?.viewState) {
          editor.options = {
            ...editor.options,
            viewState: (() => {
              for (const visibleEditorPane of editorService.visibleEditorPanes) {
                if (isEqual2(visibleEditorPane.input.resource, resource)) {
                  const viewState = visibleEditorPane.getViewState();
                  if (viewState) {
                    return viewState;
                  }
                }
              }
              return void 0;
            })()
          };
        }
      }
    }
    draggedEditors.push(editor);
  }
  if (draggedEditors.length) {
    event.dataTransfer.setData(CodeDataTransfers.EDITORS, stringify(draggedEditors));
  }
  const draggedDirectories = fileSystemResources.filter(({ isDirectory }) => isDirectory).map(({ resource }) => resource);
  if (draggedEditors.length || draggedDirectories.length) {
    const uriListEntries = [...draggedDirectories];
    for (const editor of draggedEditors) {
      if (editor.resource) {
        uriListEntries.push(editor.options?.selection ? withSelection(editor.resource, editor.options.selection) : editor.resource);
      } else if (isResourceDiffEditorInput(editor)) {
        if (editor.modified.resource) {
          uriListEntries.push(editor.modified.resource);
        }
      } else if (isResourceSideBySideEditorInput(editor)) {
        if (editor.primary.resource) {
          uriListEntries.push(editor.primary.resource);
        }
      } else if (isResourceMergeEditorInput(editor)) {
        uriListEntries.push(editor.result.resource);
      }
    }
    if (!options3?.disableStandardTransfer) {
      event.dataTransfer.setData(Mimes.uriList, UriList.create(uriListEntries.slice(0, 1)));
    }
    event.dataTransfer.setData(DataTransfers.INTERNAL_URI_LIST, UriList.create(uriListEntries));
  }
}

var CompositeDragAndDropData = class {
  constructor(type, id2) {
    this.type = type;
    this.id = id2;
  }
  update(dataTransfer) {
  }
  getData() {
    return { type: this.type, id: this.id };
  }
};

var DraggedCompositeIdentifier = class {
  constructor(compositeId) {
    this.compositeId = compositeId;
  }
  get id() {
    return this.compositeId;
  }
};

var DraggedViewIdentifier = class {
  constructor(viewId) {
    this.viewId = viewId;
  }
  get id() {
    return this.viewId;
  }
};

var CompositeDragAndDropObserver = class _CompositeDragAndDropObserver extends Disposable {
  constructor() {
    super();
    this.transferData = LocalSelectionTransfer.getInstance();
    this.onDragStart = this._register(new Emitter());
    this.onDragEnd = this._register(new Emitter());
    this._register(this.onDragEnd.event((e4) => {
      const id2 = e4.dragAndDropData.getData().id;
      const type = e4.dragAndDropData.getData().type;
      const data = this.readDragData(type);
      if (data?.getData().id === id2) {
        this.transferData.clearData(type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
      }
    }));
  }
  static get INSTANCE() {
    if (!_CompositeDragAndDropObserver.instance) {
      _CompositeDragAndDropObserver.instance = new _CompositeDragAndDropObserver();
      markAsSingleton(_CompositeDragAndDropObserver.instance);
    }
    return _CompositeDragAndDropObserver.instance;
  }
  readDragData(type) {
    if (this.transferData.hasData(type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype)) {
      const data = this.transferData.getData(type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
      if (data?.[0]) {
        return new CompositeDragAndDropData(type, data[0].id);
      }
    }
    return void 0;
  }
  writeDragData(id2, type) {
    this.transferData.setData([type === "view" ? new DraggedViewIdentifier(id2) : new DraggedCompositeIdentifier(id2)], type === "view" ? DraggedViewIdentifier.prototype : DraggedCompositeIdentifier.prototype);
  }
  registerTarget(element, callbacks) {
    const disposableStore = new DisposableStore();
    disposableStore.add(new DragAndDropObserver(element, {
      onDragEnter: (e4) => {
        e4.preventDefault();
        if (callbacks.onDragEnter) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (data) {
            callbacks.onDragEnter({ eventData: e4, dragAndDropData: data });
          }
        }
      },
      onDragLeave: (e4) => {
        const data = this.readDragData("composite") || this.readDragData("view");
        if (callbacks.onDragLeave && data) {
          callbacks.onDragLeave({ eventData: e4, dragAndDropData: data });
        }
      },
      onDrop: (e4) => {
        if (callbacks.onDrop) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          callbacks.onDrop({ eventData: e4, dragAndDropData: data });
          this.onDragEnd.fire({ eventData: e4, dragAndDropData: data });
        }
      },
      onDragOver: (e4) => {
        e4.preventDefault();
        if (callbacks.onDragOver) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          callbacks.onDragOver({ eventData: e4, dragAndDropData: data });
        }
      }
    }));
    if (callbacks.onDragStart) {
      this.onDragStart.event((e4) => {
        callbacks.onDragStart(e4);
      }, this, disposableStore);
    }
    if (callbacks.onDragEnd) {
      this.onDragEnd.event((e4) => {
        callbacks.onDragEnd(e4);
      }, this, disposableStore);
    }
    return this._register(disposableStore);
  }
  registerDraggable(element, draggedItemProvider, callbacks) {
    element.draggable = true;
    const disposableStore = new DisposableStore();
    disposableStore.add(new DragAndDropObserver(element, {
      onDragStart: (e4) => {
        const { id: id2, type } = draggedItemProvider();
        this.writeDragData(id2, type);
        e4.dataTransfer?.setDragImage(element, 0, 0);
        this.onDragStart.fire({ eventData: e4, dragAndDropData: this.readDragData(type) });
      },
      onDragEnd: (e4) => {
        const { type } = draggedItemProvider();
        const data = this.readDragData(type);
        if (!data) {
          return;
        }
        this.onDragEnd.fire({ eventData: e4, dragAndDropData: data });
      },
      onDragEnter: (e4) => {
        if (callbacks.onDragEnter) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          if (data) {
            callbacks.onDragEnter({ eventData: e4, dragAndDropData: data });
          }
        }
      },
      onDragLeave: (e4) => {
        const data = this.readDragData("composite") || this.readDragData("view");
        if (!data) {
          return;
        }
        callbacks.onDragLeave?.({ eventData: e4, dragAndDropData: data });
      },
      onDrop: (e4) => {
        if (callbacks.onDrop) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          callbacks.onDrop({ eventData: e4, dragAndDropData: data });
          this.onDragEnd.fire({ eventData: e4, dragAndDropData: data });
        }
      },
      onDragOver: (e4) => {
        if (callbacks.onDragOver) {
          const data = this.readDragData("composite") || this.readDragData("view");
          if (!data) {
            return;
          }
          callbacks.onDragOver({ eventData: e4, dragAndDropData: data });
        }
      }
    }));
    if (callbacks.onDragStart) {
      this.onDragStart.event((e4) => {
        callbacks.onDragStart(e4);
      }, this, disposableStore);
    }
    if (callbacks.onDragEnd) {
      this.onDragEnd.event((e4) => {
        callbacks.onDragEnd(e4);
      }, this, disposableStore);
    }
    return this._register(disposableStore);
  }
};

function toggleDropEffect(dataTransfer, dropEffect, shouldHaveIt) {
  if (!dataTransfer) {
    return;
  }
  dataTransfer.dropEffect = shouldHaveIt ? dropEffect : "none";
}

var ResourceListDnDHandler = class {
  constructor(toResource2, instantiationService) {
    this.toResource = toResource2;
    this.instantiationService = instantiationService;
  }
  getDragURI(element) {
    const resource = this.toResource(element);
    return resource ? resource.toString() : null;
  }
  getDragLabel(elements) {
    const resources = coalesce(elements.map(this.toResource));
    return resources.length === 1 ? basename2(resources[0]) : resources.length > 1 ? String(resources.length) : void 0;
  }
  onDragStart(data, originalEvent) {
    const resources = [];
    const elements = data.elements;
    for (const element of elements) {
      const resource = this.toResource(element);
      if (resource) {
        resources.push(resource);
      }
    }
    this.onWillDragElements(elements, originalEvent);
    if (resources.length) {
      this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, resources, originalEvent));
    }
  }
  onWillDragElements(elements, originalEvent) {
  }
  onDragOver(data, targetElement, targetIndex, targetSector, originalEvent) {
    return false;
  }
  drop(data, targetElement, targetIndex, targetSector, originalEvent) {
  }
  dispose() {
  }
};

ResourceListDnDHandler = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ResourceListDnDHandler);

var GlobalWindowDraggedOverTracker = class _GlobalWindowDraggedOverTracker extends Disposable {
  constructor() {
    super();
    this.broadcaster = this._register(new BroadcastDataChannel(_GlobalWindowDraggedOverTracker.CHANNEL_NAME));
    this.draggedOver = false;
    this.registerListeners();
  }
  static {
    this.CHANNEL_NAME = "monaco-workbench-global-dragged-over";
  }
  registerListeners() {
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2, EventType.DRAG_OVER, () => this.markDraggedOver(false), true));
      disposables.add(addDisposableListener(window2, EventType.DRAG_LEAVE, () => this.clearDraggedOver(false), true));
    }, { window: mainWindow, disposables: this._store }));
    this._register(this.broadcaster.onDidReceiveData((data) => {
      if (data === true) {
        this.markDraggedOver(true);
      } else {
        this.clearDraggedOver(true);
      }
    }));
  }
  get isDraggedOver() {
    return this.draggedOver;
  }
  markDraggedOver(fromBroadcast) {
    if (this.draggedOver === true) {
      return;
    }
    this.draggedOver = true;
    if (!fromBroadcast) {
      this.broadcaster.postData(true);
    }
  }
  clearDraggedOver(fromBroadcast) {
    if (this.draggedOver === false) {
      return;
    }
    this.draggedOver = false;
    if (!fromBroadcast) {
      this.broadcaster.postData(false);
    }
  }
};

var globalDraggedOverTracker = new GlobalWindowDraggedOverTracker();

function isWindowDraggedOver() {
  return globalDraggedOverTracker.isDraggedOver;
}
export { extractTreeDropData, fillEditorsDragData, toggleDropEffect, isWindowDraggedOver, DraggedEditorIdentifier, DraggedEditorGroupIdentifier, ResourcesDropHandler, CompositeDragAndDropData, DraggedCompositeIdentifier, DraggedViewIdentifier, CompositeDragAndDropObserver, ResourceListDnDHandler, GlobalWindowDraggedOverTracker, globalDraggedOverTracker };
