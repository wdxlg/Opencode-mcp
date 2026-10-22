// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentResolveService.ts
import { createDecorator } from "./module-0077.mjs";
import { EditorInput } from "./module-0929.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { isUntitledResourceEditorInput } from "./module-0926.mjs";
import { BrowserViewUri } from "./module-1487.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { UntitledTextEditorInput } from "./module-1541.mjs";
import { basename2 } from "./module-0034.mjs";
import { CHAT_ATTACHABLE_IMAGE_MIME_TYPES, getAttachableImageExtension } from "./module-1193.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { imageToHash } from "./module-2085.mjs";
import { resizeImage } from "./module-0945.mjs";
import { URI } from "./module-0032.mjs";
import { IDiagnosticVariableEntryFilterData } from "./module-0980.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { getOutputViewModelFromId } from "./module-1905.mjs";
import { NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST, createNotebookOutputVariableEntry } from "./module-2083.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentResolveService.ts
var IChatAttachmentResolveService = createDecorator("IChatAttachmentResolveService");

var ChatAttachmentResolveService = class {
  constructor(fileService, editorService, extensionService, dialogService, browserViewService) {
    this.fileService = fileService;
    this.editorService = editorService;
    this.extensionService = extensionService;
    this.dialogService = dialogService;
    this.browserViewService = browserViewService;
  }
  // --- EDITORS ---
  async resolveEditorAttachContext(editor, options3) {
    if (!(editor instanceof EditorInput) && editor.options?.override === BrowserEditorInput.EDITOR_ID) {
      const browserEditor = [...this.browserViewService.getKnownBrowserViews().values()].find((candidate) => candidate.matches(editor));
      if (!browserEditor) {
        return void 0;
      }
      editor = browserEditor;
    }
    if (isUntitledResourceEditorInput(editor)) {
      return await this.resolveUntitledEditorAttachContext(editor);
    }
    if (!editor.resource) {
      return void 0;
    }
    const browser = BrowserViewUri.parse(editor.resource);
    if (browser) {
      return await this.resolveBrowserViewAttachContext(browser.id);
    }
    let stat;
    try {
      stat = await this.fileService.stat(editor.resource);
    } catch {
      return void 0;
    }
    if (!stat.isDirectory && !stat.isFile) {
      return void 0;
    }
    if (!options3?.imagesAsFiles) {
      const imageContext = await this.resolveImageEditorAttachContext(editor.resource);
      if (imageContext) {
        return this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData")) ? imageContext : void 0;
      }
    }
    return await this.resolveResourceAttachContext(editor.resource, stat.isDirectory);
  }
  async resolveUntitledEditorAttachContext(editor) {
    if (editor.resource) {
      return await this.resolveResourceAttachContext(editor.resource, false);
    }
    const openUntitledEditors = this.editorService.editors.filter((editor2) => editor2 instanceof UntitledTextEditorInput);
    for (const canidate of openUntitledEditors) {
      const model = await canidate.resolve();
      const contents = model.textEditorModel?.getValue();
      if (contents === editor.contents) {
        return await this.resolveResourceAttachContext(canidate.resource, false);
      }
    }
    return void 0;
  }
  async resolveResourceAttachContext(resource, isDirectory) {
    let omittedState = 0 /* NotOmitted */;
    if (!isDirectory) {
      if (/\.(svg)$/i.test(resource.path)) {
        omittedState = 2 /* Full */;
      }
    }
    return {
      kind: isDirectory ? "directory" : "file",
      value: resource,
      id: resource.toString(),
      name: basename2(resource),
      omittedState
    };
  }
  async resolveBrowserViewAttachContext(browserId) {
    const views = this.browserViewService.getKnownBrowserViews();
    const editor = views.get(browserId);
    if (!editor) {
      return void 0;
    }
    if (!editor.model) {
      await editor.resolve();
    }
    const model = editor.model;
    if (!model) {
      return void 0;
    }
    if (model.sharingState === "notShared" /* NotShared */) {
      if (!await model.setSharedWithAgent(true)) {
        return void 0;
      }
    }
    return {
      kind: "browserView",
      id: editor.resource.toString(),
      name: editor.getName(),
      value: editor.resource,
      browserId: editor.id,
      modelDescription: `Browser page: ${editor.getTitle()}. The pageId is "${editor.id}".`
    };
  }
  // --- IMAGES ---
  async resolveImageEditorAttachContext(resource, data, mimeType) {
    if (!resource) {
      return void 0;
    }
    if (mimeType) {
      if (!getAttachableImageExtension(mimeType)) {
        return void 0;
      }
    } else {
      const match2 = SUPPORTED_IMAGE_EXTENSIONS_REGEX.exec(resource.path);
      if (!match2) {
        return void 0;
      }
      mimeType = getMimeTypeFromPath(match2);
    }
    const fileName = basename2(resource);
    let dataBuffer;
    if (data) {
      dataBuffer = data;
    } else {
      let stat;
      try {
        stat = await this.fileService.stat(resource);
      } catch {
        return void 0;
      }
      const readFile = await this.fileService.readFile(resource);
      if (stat.size > 30 * 1024 * 1024) {
        this.dialogService.error(localize(9852, null), localize(9853, null, fileName));
        throw new Error("Image is too large");
      }
      dataBuffer = readFile.value;
    }
    const isPartiallyOmitted = /\.gif$/i.test(resource.path);
    const imageFileContext = await this.resolveImageAttachContext([{
      id: resource.toString(),
      name: fileName,
      data: dataBuffer.buffer,
      icon: Codicon.fileMedia,
      resource,
      mimeType,
      omittedState: isPartiallyOmitted ? 1 /* Partial */ : 0 /* NotOmitted */
    }]);
    return imageFileContext[0];
  }
  resolveImageAttachContext(images) {
    return Promise.all(images.map(async (image) => ({
      id: image.id || await imageToHash(image.data),
      name: image.name,
      fullName: image.resource ? image.resource.path : void 0,
      value: await resizeImage(image.data, image.mimeType),
      icon: image.icon,
      kind: "image",
      isFile: false,
      isDirectory: false,
      omittedState: image.omittedState || 0 /* NotOmitted */,
      references: image.resource ? [{ reference: image.resource, kind: "reference" }] : []
    })));
  }
  // --- MARKERS ---
  resolveMarkerAttachContext(markers) {
    return markers.map((marker) => {
      let filter2;
      if (!("severity" in marker)) {
        filter2 = { filterUri: URI.revive(marker.uri), filterSeverity: 4 /* Warning */ };
      } else {
        filter2 = IDiagnosticVariableEntryFilterData.fromMarker(marker);
      }
      return IDiagnosticVariableEntryFilterData.toEntry(filter2);
    });
  }
  // --- SYMBOLS ---
  resolveSymbolsAttachContext(symbols) {
    return symbols.map((symbol) => {
      const resource = URI.file(symbol.fsPath);
      return {
        kind: "symbol",
        id: symbolId(resource, symbol.range),
        value: { uri: resource, range: symbol.range },
        symbolKind: symbol.kind,
        icon: SymbolKinds.toIcon(symbol.kind),
        fullName: symbol.name,
        name: symbol.name
      };
    });
  }
  // --- NOTEBOOKS ---
  resolveNotebookOutputAttachContext(data) {
    const notebookEditor = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane);
    if (!notebookEditor) {
      return [];
    }
    const outputViewModel = getOutputViewModelFromId(data.outputId, notebookEditor);
    if (!outputViewModel) {
      return [];
    }
    const mimeType = outputViewModel.pickedMimeType?.mimeType;
    if (mimeType && NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST.includes(mimeType)) {
      const entry = createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor);
      if (!entry) {
        return [];
      }
      return [entry];
    }
    return [];
  }
  // --- DIRECTORIES ---
  async resolveDirectoryImages(directoryUri) {
    const imageEntries = [];
    await this._collectDirectoryImages(directoryUri, imageEntries);
    return imageEntries;
  }
  async _collectDirectoryImages(directoryUri, results) {
    let stat;
    try {
      stat = await this.fileService.resolve(directoryUri);
    } catch {
      return;
    }
    if (!stat.children) {
      return;
    }
    const childPromises = [];
    for (const child of stat.children) {
      if (child.isDirectory && !child.isSymbolicLink) {
        childPromises.push(this._collectDirectoryImages(child.resource, results));
      } else if (child.isFile && !child.isSymbolicLink && SUPPORTED_IMAGE_EXTENSIONS_REGEX.test(child.resource.path)) {
        childPromises.push(
          this.resolveImageEditorAttachContext(child.resource).then((entry) => {
            if (entry) {
              results.push(entry);
            }
          }).catch(() => {
          })
        );
      }
    }
    await Promise.all(childPromises);
  }
  // --- SOURCE CONTROL ---
  resolveSourceControlHistoryItemAttachContext(data) {
    return data.map((d) => ({
      id: d.historyItem.id,
      name: d.name,
      value: URI.revive(d.resource),
      historyItem: {
        ...d.historyItem,
        references: []
      },
      kind: "scmHistoryItem"
    }));
  }
};

ChatAttachmentResolveService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IBrowserViewWorkbenchService)
], ChatAttachmentResolveService);

function symbolId(resource, range2) {
  let rangePart = "";
  if (range2) {
    rangePart = `:${range2.startLineNumber}`;
    if (range2.startLineNumber !== range2.endLineNumber) {
      rangePart += `-${range2.endLineNumber}`;
    }
  }
  return resource.fsPath + rangePart;
}

var SUPPORTED_IMAGE_EXTENSIONS_REGEX = new RegExp(`\\.(${Object.keys(CHAT_ATTACHABLE_IMAGE_MIME_TYPES).join("|")})$`, "i");

function getMimeTypeFromPath(match2) {
  const ext = match2[1].toLowerCase();
  return CHAT_ATTACHABLE_IMAGE_MIME_TYPES[ext];
}
export { symbolId, getMimeTypeFromPath, IChatAttachmentResolveService, ChatAttachmentResolveService, SUPPORTED_IMAGE_EXTENSIONS_REGEX };
