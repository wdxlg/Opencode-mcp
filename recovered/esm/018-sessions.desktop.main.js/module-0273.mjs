// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/dnd/browser/dnd.ts
import { parse2 } from "./module-0265.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { URI } from "./module-0032.mjs";
import { Registry } from "./module-0090.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { isNative, isWeb } from "./module-0014.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { extractSelection } from "./module-0272.mjs";
import { WebFileSystemAccess } from "./module-0270.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ByteSize, IFileService } from "./module-0269.mjs";
import { Schemas } from "./module-0033.mjs";
import { HTMLFileSystemProvider } from "./module-0271.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";
import { IDialogService } from "./module-0267.mjs";
import { localize } from "./module-0001.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/platform/dnd/browser/dnd.ts
var CodeDataTransfers = {
  EDITORS: "CodeEditors",
  FILES: "CodeFiles",
  SYMBOLS: "application/vnd.code.symbols",
  MARKERS: "application/vnd.code.diagnostics",
  NOTEBOOK_CELL_OUTPUT: "notebook-cell-output",
  SCM_HISTORY_ITEM: "scm-history-item",
  CHAT_REFERENCE: "application/vnd.code.chat-reference"
};

function extractEditorsDropData(e4) {
  const editors = [];
  if (e4.dataTransfer && e4.dataTransfer.types.length > 0) {
    const rawEditorsData = e4.dataTransfer.getData(CodeDataTransfers.EDITORS);
    if (rawEditorsData) {
      try {
        editors.push(...parse2(rawEditorsData));
      } catch (error) {
      }
    } else {
      try {
        const rawResourcesData = e4.dataTransfer.getData(DataTransfers.RESOURCES);
        editors.push(...createDraggedEditorInputFromRawResourcesData(rawResourcesData));
      } catch (error) {
      }
    }
    if (e4.dataTransfer?.files) {
      for (let i2 = 0; i2 < e4.dataTransfer.files.length; i2++) {
        const file = e4.dataTransfer.files[i2];
        if (file && getPathForFile(file)) {
          try {
            editors.push({ resource: URI.file(getPathForFile(file)), isExternal: true, allowWorkspaceOpen: true });
          } catch (error) {
          }
        }
      }
    }
    const rawCodeFiles = e4.dataTransfer.getData(CodeDataTransfers.FILES);
    if (rawCodeFiles) {
      try {
        const codeFiles = JSON.parse(rawCodeFiles);
        for (const codeFile of codeFiles) {
          editors.push({ resource: URI.file(codeFile), isExternal: true, allowWorkspaceOpen: true });
        }
      } catch (error) {
      }
    }
    const contributions = Registry.as(Extensions7.DragAndDropContribution).getAll();
    for (const contribution of contributions) {
      const data = e4.dataTransfer.getData(contribution.dataFormatKey);
      if (data) {
        try {
          editors.push(...contribution.getEditorInputs(data));
        } catch (error) {
        }
      }
    }
  }
  const coalescedEditors = [];
  const seen = new ResourceMap();
  for (const editor of editors) {
    if (!editor.resource) {
      coalescedEditors.push(editor);
    } else if (!seen.has(editor.resource)) {
      coalescedEditors.push(editor);
      seen.set(editor.resource, true);
    }
  }
  return coalescedEditors;
}

async function extractEditorsAndFilesDropData(accessor, e4) {
  const editors = extractEditorsDropData(e4);
  if (e4.dataTransfer && isWeb && containsDragType(e4, DataTransfers.FILES)) {
    const files = e4.dataTransfer.items;
    if (files) {
      const instantiationService = accessor.get(IInstantiationService);
      const filesData = await instantiationService.invokeFunction((accessor2) => extractFilesDropData(accessor2, e4));
      for (const fileData of filesData) {
        editors.push({ resource: fileData.resource, contents: fileData.contents?.toString(), isExternal: true, allowWorkspaceOpen: fileData.isDirectory });
      }
    }
  }
  return editors;
}

function createDraggedEditorInputFromRawResourcesData(rawResourcesData) {
  const editors = [];
  if (rawResourcesData) {
    const resourcesRaw = JSON.parse(rawResourcesData);
    for (const resourceRaw of resourcesRaw) {
      if (resourceRaw.indexOf(":") > 0) {
        const { selection, uri: uri4 } = extractSelection(URI.parse(resourceRaw));
        editors.push({ resource: uri4, options: { selection } });
      }
    }
  }
  return editors;
}

async function extractFilesDropData(accessor, event) {
  if (WebFileSystemAccess.supported(mainWindow)) {
    const items = event.dataTransfer?.items;
    if (items) {
      return extractFileTransferData(accessor, items);
    }
  }
  const files = event.dataTransfer?.files;
  if (!files) {
    return [];
  }
  return extractFileListData(accessor, files);
}

async function extractFileTransferData(accessor, items) {
  const fileSystemProvider = accessor.get(IFileService).getProvider(Schemas.file);
  if (!(fileSystemProvider instanceof HTMLFileSystemProvider)) {
    return [];
  }
  const results = [];
  for (let i2 = 0; i2 < items.length; i2++) {
    const file = items[i2];
    if (file) {
      const result = new DeferredPromise();
      results.push(result);
      (async () => {
        try {
          const handle2 = await file.getAsFileSystemHandle();
          if (!handle2) {
            result.complete(void 0);
            return;
          }
          if (WebFileSystemAccess.isFileSystemFileHandle(handle2)) {
            result.complete({
              resource: await fileSystemProvider.registerFileHandle(handle2),
              isDirectory: false
            });
          } else if (WebFileSystemAccess.isFileSystemDirectoryHandle(handle2)) {
            result.complete({
              resource: await fileSystemProvider.registerDirectoryHandle(handle2),
              isDirectory: true
            });
          } else {
            result.complete(void 0);
          }
        } catch (error) {
          result.complete(void 0);
        }
      })();
    }
  }
  return coalesce(await Promise.all(results.map((result) => result.p)));
}

async function extractFileListData(accessor, files) {
  const dialogService = accessor.get(IDialogService);
  const results = [];
  for (let i2 = 0; i2 < files.length; i2++) {
    const file = files.item(i2);
    if (file) {
      if (file.size > 100 * ByteSize.MB) {
        dialogService.warn(localize(2833, null));
        continue;
      }
      const result = new DeferredPromise();
      results.push(result);
      const reader = new FileReader();
      reader.onerror = () => result.complete(void 0);
      reader.onabort = () => result.complete(void 0);
      reader.onload = async (event) => {
        const name = file.name;
        const loadResult = event.target?.result ?? void 0;
        if (typeof name !== "string" || typeof loadResult === "undefined") {
          result.complete(void 0);
          return;
        }
        result.complete({
          resource: URI.from({ scheme: Schemas.untitled, path: name }),
          contents: typeof loadResult === "string" ? VSBuffer.fromString(loadResult) : VSBuffer.wrap(new Uint8Array(loadResult))
        });
      };
      reader.readAsArrayBuffer(file);
    }
  }
  return coalesce(await Promise.all(results.map((result) => result.p)));
}

function containsDragType(event, ...dragTypesToFind) {
  if (!event.dataTransfer) {
    return false;
  }
  const dragTypes = event.dataTransfer.types;
  const lowercaseDragTypes = [];
  for (let i2 = 0; i2 < dragTypes.length; i2++) {
    lowercaseDragTypes.push(dragTypes[i2].toLowerCase());
  }
  for (const dragType of dragTypesToFind) {
    if (lowercaseDragTypes.indexOf(dragType.toLowerCase()) >= 0) {
      return true;
    }
  }
  return false;
}

var DragAndDropContributionRegistry = class {
  constructor() {
    this._contributions = /* @__PURE__ */ new Map();
    this._dropHandlers = /* @__PURE__ */ new Set();
  }
  register(contribution) {
    if (this._contributions.has(contribution.dataFormatKey)) {
      throw new Error(`A drag and drop contributiont with key '${contribution.dataFormatKey}' was already registered.`);
    }
    this._contributions.set(contribution.dataFormatKey, contribution);
  }
  getAll() {
    return this._contributions.values();
  }
  registerDropHandler(handler) {
    this._dropHandlers.add(handler);
    return toDisposable(() => this._dropHandlers.delete(handler));
  }
  async handleResourceDrop(resource, accessor) {
    for (const handler of this._dropHandlers) {
      if (await handler.handleDrop(resource, accessor)) {
        return true;
      }
    }
    return false;
  }
};

var Extensions7 = {
  DragAndDropContribution: "workbench.contributions.dragAndDrop"
};

Registry.add(Extensions7.DragAndDropContribution, new DragAndDropContributionRegistry());

var LocalSelectionTransfer = class _LocalSelectionTransfer {
  static {
    this.INSTANCE = new _LocalSelectionTransfer();
  }
  constructor() {
  }
  static getInstance() {
    return _LocalSelectionTransfer.INSTANCE;
  }
  hasData(proto) {
    return proto && proto === this.proto;
  }
  clearData(proto) {
    if (this.hasData(proto)) {
      this.proto = void 0;
      this.data = void 0;
    }
  }
  getData(proto) {
    if (this.hasData(proto)) {
      return this.data;
    }
    return void 0;
  }
  setData(data, proto) {
    if (proto) {
      this.data = data;
      this.proto = proto;
    }
  }
};

function setDataAsJSON(e4, kind, data) {
  e4.dataTransfer?.setData(kind, JSON.stringify(data));
}

function getDataAsJSON(e4, kind, defaultValue) {
  const rawSymbolsData = e4.dataTransfer?.getData(kind);
  if (rawSymbolsData) {
    try {
      return JSON.parse(rawSymbolsData);
    } catch (error) {
    }
  }
  return defaultValue;
}

function extractSymbolDropData(e4) {
  return getDataAsJSON(e4, CodeDataTransfers.SYMBOLS, []);
}

function fillInSymbolsDragData(symbolsData, e4) {
  setDataAsJSON(e4, CodeDataTransfers.SYMBOLS, symbolsData);
}

function extractMarkerDropData(e4) {
  return getDataAsJSON(e4, CodeDataTransfers.MARKERS, void 0);
}

function extractNotebookCellOutputDropData(e4) {
  return getDataAsJSON(e4, CodeDataTransfers.NOTEBOOK_CELL_OUTPUT, void 0);
}

var DraggedChatReferenceIdentifier = class {
  constructor(chatResource, clientResource, title) {
    this.chatResource = chatResource;
    this.clientResource = clientResource;
    this.title = title;
  }
};

function extractChatReferenceDropData(e4) {
  return getDataAsJSON(e4, CodeDataTransfers.CHAT_REFERENCE, void 0);
}

function fillInChatReferenceDragData(data, e4) {
  setDataAsJSON(e4, CodeDataTransfers.CHAT_REFERENCE, data);
}

function getPathForFile(file) {
  if (isNative && typeof globalThis.vscode?.webUtils?.getPathForFile === "function") {
    return globalThis.vscode?.webUtils?.getPathForFile(file);
  }
  return void 0;
}
export { extractEditorsDropData, extractEditorsAndFilesDropData, createDraggedEditorInputFromRawResourcesData, extractFilesDropData, extractFileTransferData, extractFileListData, containsDragType, setDataAsJSON, getDataAsJSON, extractSymbolDropData, fillInSymbolsDragData, extractMarkerDropData, extractNotebookCellOutputDropData, extractChatReferenceDropData, fillInChatReferenceDragData, getPathForFile, CodeDataTransfers, DragAndDropContributionRegistry, Extensions7, LocalSelectionTransfer, DraggedChatReferenceIdentifier };
