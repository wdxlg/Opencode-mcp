// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatDragAndDrop.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { CodeDataTransfers, DraggedChatReferenceIdentifier, LocalSelectionTransfer, containsDragType, extractChatReferenceDropData, extractEditorsDropData, extractMarkerDropData, extractNotebookCellOutputDropData, extractSymbolDropData } from "./module-0273.mjs";
import { toDisposable } from "./module-0012.mjs";
import { $, DragAndDropObserver } from "./module-0075.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { Mimes } from "./module-0136.mjs";
import { isAgentHostTarget } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { isCrossAgentHostChatReferenceDrop, isSelfChatReferenceDrop, resolveChatReferenceDropEntry } from "./module-2141.mjs";
import { localize } from "./module-0001.mjs";
import { getTerminalResourcesFromDragEvent } from "./module-2131.mjs";
import { coalesce } from "./module-0007.mjs";
import { TerminalContext } from "./module-2140.mjs";
import { extractSCMHistoryItemDropData } from "./module-1466.mjs";
import { UriList } from "./module-0264.mjs";
import { URI } from "./module-0032.mjs";
import { isOpenCodeChatWidget } from "./module-0982.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { convertStringToUInt8Array } from "./module-0945.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISharedWebContentExtractorService } from "./module-2039.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatAttachmentResolveService } from "./module-2086.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatDragAndDrop.ts
var IMAGE_DATA_REGEX = /^data:image\/[a-z]+;base64,/;

var URL_REGEX = /^https?:\/\/.+/;

var ChatDragAndDrop = class extends Themable {
  constructor(widgetRef, attachmentTarget, styles, themeService, instantiationService, extensionService, webContentExtractorService, logService, chatAttachmentResolveService) {
    super(themeService);
    this.widgetRef = widgetRef;
    this.attachmentTarget = attachmentTarget;
    this.styles = styles;
    this.instantiationService = instantiationService;
    this.extensionService = extensionService;
    this.webContentExtractorService = webContentExtractorService;
    this.logService = logService;
    this.chatAttachmentResolveService = chatAttachmentResolveService;
    this.overlays = /* @__PURE__ */ new Map();
    this.overlayTextBackground = "";
    this.disableOverlay = false;
    /**
     * In-process transfer for a dragged chat reference. Readable during
     * `dragover` (unlike the `dataTransfer` mime payload), so the self-reference
     * guard can suppress the overlay when a chat is dragged onto its own input.
     */
    this.chatReferenceTransfer = LocalSelectionTransfer.getInstance();
    this.currentActiveTarget = void 0;
    this.updateStyles();
    this._register(toDisposable(() => {
      this.overlays.forEach(({ overlay, disposable }) => {
        disposable.dispose();
        overlay.remove();
      });
      this.overlays.clear();
      this.currentActiveTarget = void 0;
      this.overlayText?.remove();
      this.overlayText = void 0;
    }));
  }
  addOverlay(target, overlayContainer) {
    this.removeOverlay(target);
    const { overlay, disposable } = this.createOverlay(target, overlayContainer);
    this.overlays.set(target, { overlay, disposable });
  }
  removeOverlay(target) {
    if (this.currentActiveTarget === target) {
      this.currentActiveTarget = void 0;
    }
    const existingOverlay = this.overlays.get(target);
    if (existingOverlay) {
      existingOverlay.overlay.remove();
      existingOverlay.disposable.dispose();
      this.overlays.delete(target);
    }
  }
  setDisabledOverlay(disable) {
    this.disableOverlay = disable;
  }
  createOverlay(target, overlayContainer) {
    const overlay = document.createElement("div");
    overlay.classList.add("chat-dnd-overlay");
    this.updateOverlayStyles(overlay);
    overlayContainer.appendChild(overlay);
    const disposable = new DragAndDropObserver(target, {
      onDragOver: (e4) => {
        if (this.disableOverlay) {
          return;
        }
        e4.stopPropagation();
        e4.preventDefault();
        if (target === this.currentActiveTarget) {
          return;
        }
        if (this.currentActiveTarget) {
          this.setOverlay(this.currentActiveTarget, void 0);
        }
        this.currentActiveTarget = target;
        this.onDragEnter(e4, target);
      },
      onDragLeave: (e4) => {
        if (this.disableOverlay) {
          return;
        }
        if (target === this.currentActiveTarget) {
          this.currentActiveTarget = void 0;
        }
        this.onDragLeave(e4, target);
      },
      onDrop: (e4) => {
        if (this.disableOverlay) {
          return;
        }
        e4.stopPropagation();
        e4.preventDefault();
        if (target !== this.currentActiveTarget) {
          return;
        }
        this.currentActiveTarget = void 0;
        this.onDrop(e4, target);
      }
    });
    return { overlay, disposable };
  }
  onDragEnter(e4, target) {
    const estimatedDropType = this.guessDropType(e4);
    this.updateDropFeedback(e4, target, estimatedDropType);
  }
  onDragLeave(e4, target) {
    this.updateDropFeedback(e4, target, void 0);
  }
  onDrop(e4, target) {
    this.updateDropFeedback(e4, target, void 0);
    this.drop(e4);
  }
  async drop(e4) {
    const contexts = this.filterResolvedAttachments(await this.resolveAttachmentsFromDragEvent(e4));
    if (contexts.length === 0) {
      return;
    }
    this.attachmentTarget.addAttachments(contexts);
  }
  updateDropFeedback(e4, target, dropType) {
    const showOverlay = dropType !== void 0;
    if (e4.dataTransfer) {
      e4.dataTransfer.dropEffect = showOverlay ? "copy" : "none";
    }
    this.setOverlay(target, dropType);
  }
  guessDropType(e4) {
    if (this.isOpenCodeContextOnly()) {
      if (containsDragType(e4, "Terminals" /* Terminals */)) {
        return 4 /* TERMINAL */;
      } else if (containsDragType(e4, CodeDataTransfers.EDITORS)) {
        return 1 /* FILE_INTERNAL */;
      } else if (containsDragType(e4, DataTransfers.FILES)) {
        return 2 /* FILE_EXTERNAL */;
      } else if (containsDragType(e4, CodeDataTransfers.FILES, DataTransfers.RESOURCES, DataTransfers.INTERNAL_URI_LIST)) {
        return 3 /* FOLDER */;
      }
      return void 0;
    }
    if (containsDragType(e4, CodeDataTransfers.CHAT_REFERENCE)) {
      return this.guessChatReferenceDropType(e4);
    } else if (containsDragType(e4, CodeDataTransfers.NOTEBOOK_CELL_OUTPUT)) {
      return 9 /* NOTEBOOK_CELL_OUTPUT */;
    } else if (containsDragType(e4, CodeDataTransfers.SCM_HISTORY_ITEM)) {
      return 10 /* SCM_HISTORY_ITEM */;
    } else if (containsImageDragType(e4)) {
      return this.extensionService.extensions.some((ext) => isProposedApiEnabled(ext, "chatReferenceBinaryData")) ? 5 /* IMAGE */ : void 0;
    } else if (containsDragType(e4, "text/html")) {
      return 7 /* HTML */;
    } else if (containsDragType(e4, CodeDataTransfers.SYMBOLS)) {
      return 6 /* SYMBOL */;
    } else if (containsDragType(e4, CodeDataTransfers.MARKERS)) {
      return 8 /* MARKER */;
    } else if (containsDragType(e4, DataTransfers.FILES)) {
      return 2 /* FILE_EXTERNAL */;
    } else if (containsDragType(e4, "Terminals" /* Terminals */)) {
      return 4 /* TERMINAL */;
    } else if (containsDragType(e4, CodeDataTransfers.EDITORS)) {
      return 1 /* FILE_INTERNAL */;
    } else if (containsDragType(e4, Mimes.uriList, CodeDataTransfers.FILES, DataTransfers.RESOURCES, DataTransfers.INTERNAL_URI_LIST)) {
      return 3 /* FOLDER */;
    }
    return void 0;
  }
  /**
   * Resolves the drop type for a dragged chat reference. Only agent-host-backed
   * chat inputs can reference another chat, and a chat may reference any other
   * chat of the *same agent host* — including one from a different session shown
   * side by side in the Agents window.
   *
   * Two payload-dependent guards suppress the overlay entirely (rather than
   * appearing droppable and then doing nothing):
   * - a self-reference (a chat dropped onto its *own* input), and
   * - a cross-agent-host reference, which the owning host could never resolve.
   *
   * The dragged chat's client resource is read from the in-process
   * {@link LocalSelectionTransfer} (readable during `dragover`) with the
   * `dataTransfer` mime payload as a fallback (readable on `drop`), and compared
   * against this input's own client session resource. Both are opaque client
   * URIs, so the workbench never touches an AHP chat URI.
   */
  guessChatReferenceDropType(e4) {
    const sessionResource = this.widgetRef()?.viewModel?.model.sessionResource;
    if (!sessionResource || !isAgentHostTarget(getChatSessionType(sessionResource))) {
      return void 0;
    }
    const droppedClientResource = this.getDraggedClientResource(e4);
    if (droppedClientResource !== void 0 && (isSelfChatReferenceDrop(droppedClientResource, sessionResource.toString()) || isCrossAgentHostChatReferenceDrop(droppedClientResource, sessionResource.toString()))) {
      return void 0;
    }
    return 0 /* CHAT_REFERENCE */;
  }
  /**
   * The client resource of the dragged chat reference (used only for
   * self-reference identity comparison). Prefers the in-process local transfer
   * (available during `dragover`), falling back to the `dataTransfer` mime
   * payload (only readable on `drop`). Returns `undefined` when neither source
   * carries a chat reference.
   */
  getDraggedClientResource(e4) {
    const local = this.chatReferenceTransfer.getData(DraggedChatReferenceIdentifier.prototype);
    if (local && local.length > 0) {
      return local[0].clientResource;
    }
    return extractChatReferenceDropData(e4)?.clientResource;
  }
  isDragEventSupported(e4) {
    const dropType = this.guessDropType(e4);
    return dropType !== void 0;
  }
  getDropTypeName(type) {
    switch (type) {
      case 1 /* FILE_INTERNAL */:
        return localize(12337, null);
      case 2 /* FILE_EXTERNAL */:
        return localize(12337, null);
      case 3 /* FOLDER */:
        return localize(12338, null);
      case 4 /* TERMINAL */:
        return localize(12344, null);
      case 5 /* IMAGE */:
        return localize(12339, null);
      case 6 /* SYMBOL */:
        return localize(12343, null);
      case 8 /* MARKER */:
        return localize(12341, null);
      case 7 /* HTML */:
        return localize(12345, null);
      case 9 /* NOTEBOOK_CELL_OUTPUT */:
        return localize(12340, null);
      case 10 /* SCM_HISTORY_ITEM */:
        return localize(12342, null);
      case 0 /* CHAT_REFERENCE */:
        return localize(12335, null);
    }
  }
  async resolveAttachmentsFromDragEvent(e4) {
    if (!this.isDragEventSupported(e4)) {
      return [];
    }
    const openCodeContextOnly = this.isOpenCodeContextOnly();
    if (!openCodeContextOnly && containsDragType(e4, CodeDataTransfers.CHAT_REFERENCE)) {
      return this.resolveChatReferenceAttachContext(e4);
    }
    if (containsDragType(e4, "Terminals" /* Terminals */)) {
      const widget = this.widgetRef();
      if (!widget) {
        return [];
      }
      try {
        const resources = getTerminalResourcesFromDragEvent(e4);
        if (!resources?.length) {
          return [];
        }
        return coalesce(await Promise.all(resources.map(async (resource) => {
          const terminalContext = this.instantiationService.createInstance(TerminalContext, resource);
          if (!terminalContext.isEnabled(widget)) {
            return void 0;
          }
          return terminalContext.asAttachment(widget);
        })));
      } catch (error) {
        this.logService.warn("Failed to resolve terminal drag context:", error);
        return [];
      }
    }
    if (!openCodeContextOnly && containsDragType(e4, CodeDataTransfers.NOTEBOOK_CELL_OUTPUT)) {
      const notebookOutputData = extractNotebookCellOutputDropData(e4);
      if (notebookOutputData) {
        return this.chatAttachmentResolveService.resolveNotebookOutputAttachContext(notebookOutputData);
      }
    }
    if (!openCodeContextOnly && containsDragType(e4, CodeDataTransfers.SCM_HISTORY_ITEM)) {
      const scmHistoryItemData = extractSCMHistoryItemDropData(e4);
      if (scmHistoryItemData) {
        return this.chatAttachmentResolveService.resolveSourceControlHistoryItemAttachContext(scmHistoryItemData);
      }
    }
    const markerData = openCodeContextOnly ? void 0 : extractMarkerDropData(e4);
    if (markerData?.length) {
      return this.chatAttachmentResolveService.resolveMarkerAttachContext(markerData);
    }
    if (!openCodeContextOnly && containsDragType(e4, CodeDataTransfers.SYMBOLS)) {
      const symbolsData = extractSymbolDropData(e4);
      return this.chatAttachmentResolveService.resolveSymbolsAttachContext(symbolsData);
    }
    const editorDragData = extractEditorsDropData(e4);
    if (editorDragData.length > 0) {
      return coalesce(await Promise.all(editorDragData.map((editorInput) => {
        return this.chatAttachmentResolveService.resolveEditorAttachContext(editorInput, openCodeContextOnly ? { imagesAsFiles: true } : void 0);
      })));
    }
    const internal = e4.dataTransfer?.getData(DataTransfers.INTERNAL_URI_LIST);
    if (internal) {
      const uriList = UriList.parse(internal);
      if (uriList.length) {
        return coalesce(await Promise.all(
          uriList.map((uri4) => this.chatAttachmentResolveService.resolveEditorAttachContext({ resource: URI.parse(uri4) }, openCodeContextOnly ? { imagesAsFiles: true } : void 0))
        ));
      }
    }
    if (!openCodeContextOnly && !containsDragType(e4, DataTransfers.INTERNAL_URI_LIST) && containsDragType(e4, Mimes.uriList) && (containsDragType(e4, Mimes.html) || containsDragType(e4, Mimes.text))) {
      return this.resolveHTMLAttachContext(e4);
    }
    return [];
  }
  isOpenCodeContextOnly() {
    const widget = this.widgetRef();
    return !!widget && isOpenCodeChatWidget(widget);
  }
  filterResolvedAttachments(attachments) {
    if (!this.isOpenCodeContextOnly()) {
      return attachments;
    }
    return attachments.filter((attachment) => attachment.kind === "file" || attachment.kind === "directory" || attachment.kind === "terminalCommand");
  }
  /**
   * Resolves a dropped chat reference (a chat tab from the Agents window) to a
   * plain chat-reference attachment (a pill) — the same shape every other drop
   * type produces, with no inline text, range, or editor manipulation.
   *
   * The target must be an agent-host-backed input; the actual resolution and
   * the self / cross-agent-host guards live in {@link resolveChatReferenceDropEntry}.
   * Returns `[]` when any guard rejects.
   */
  resolveChatReferenceAttachContext(e4) {
    const data = extractChatReferenceDropData(e4);
    if (!data) {
      return [];
    }
    const sessionResource = this.widgetRef()?.viewModel?.model.sessionResource;
    const ownClientResource = sessionResource && isAgentHostTarget(getChatSessionType(sessionResource)) ? sessionResource.toString() : void 0;
    const entry = resolveChatReferenceDropEntry(data, ownClientResource);
    return entry ? [entry] : [];
  }
  async downloadImageAsUint8Array(url) {
    try {
      const extractedImages = await this.webContentExtractorService.readImage(URI.parse(url), CancellationToken.None);
      if (extractedImages) {
        return extractedImages.buffer;
      }
    } catch (error) {
      this.logService.warn("Fetch failed:", error);
    }
    const widget = this.widgetRef();
    const selection = widget?.inputEditor.getSelection();
    if (selection && widget) {
      widget.inputEditor.executeEdits("chatInsertUrl", [{ range: selection, text: url }]);
    }
    this.logService.warn(`Image URLs must end in .jpg, .png, .gif, .webp, or .bmp. Failed to fetch image from this URL: ${url}`);
    return void 0;
  }
  async resolveHTMLAttachContext(e4) {
    const existingAttachmentNames = new Set(this.attachmentTarget.attachments.map((attachment) => attachment.name));
    const createDisplayName = () => {
      const baseName = localize(12336, null);
      let uniqueName = baseName;
      let baseNameInstance = 1;
      while (existingAttachmentNames.has(uniqueName)) {
        uniqueName = `${baseName} ${++baseNameInstance}`;
      }
      existingAttachmentNames.add(uniqueName);
      return uniqueName;
    };
    const getImageTransferDataFromUrl = async (url) => {
      const resource = URI.parse(url);
      if (IMAGE_DATA_REGEX.test(url)) {
        return { data: convertStringToUInt8Array(url), name: createDisplayName(), resource };
      }
      if (URL_REGEX.test(url)) {
        const data = await this.downloadImageAsUint8Array(url);
        if (data) {
          return { data, name: createDisplayName(), resource, id: url };
        }
      }
      return void 0;
    };
    const getImageTransferDataFromFile = async (file) => {
      try {
        const buffer = await file.arrayBuffer();
        return { data: new Uint8Array(buffer), name: createDisplayName() };
      } catch (error) {
        this.logService.error("Error reading file:", error);
      }
      return void 0;
    };
    const imageTransferData = [];
    const imageFiles = extractImageFilesFromDragEvent(e4);
    if (imageFiles.length) {
      const imageTransferDataFromFiles = await Promise.all(imageFiles.map((file) => getImageTransferDataFromFile(file)));
      imageTransferData.push(...imageTransferDataFromFiles.filter((data) => !!data));
    }
    const imageUrls = extractUrlsFromDragEvent(e4);
    if (imageUrls.length) {
      const imageTransferDataFromUrl = await Promise.all(imageUrls.map(getImageTransferDataFromUrl));
      imageTransferData.push(...imageTransferDataFromUrl.filter((data) => !!data));
    }
    return await this.chatAttachmentResolveService.resolveImageAttachContext(imageTransferData);
  }
  setOverlay(target, type) {
    this.overlayText?.remove();
    this.overlayText = void 0;
    const { overlay } = this.overlays.get(target);
    if (type !== void 0) {
      const iconAndtextElements = renderLabelWithIcons(`$(${Codicon.attachCompact.id}) ${this.getOverlayText(type)}`);
      const htmlElements = iconAndtextElements.map((element) => {
        if (typeof element === "string") {
          return $("span.overlay-text", void 0, element);
        }
        return element;
      });
      this.overlayText = $("span.attach-context-overlay-text", void 0, ...htmlElements);
      this.overlayText.style.backgroundColor = this.overlayTextBackground;
      overlay.appendChild(this.overlayText);
    }
    overlay.classList.toggle("visible", type !== void 0);
  }
  getOverlayText(type) {
    const typeName = this.getDropTypeName(type);
    return localize(12334, null, typeName);
  }
  updateOverlayStyles(overlay) {
    overlay.style.backgroundColor = this.getColor(this.styles.overlayBackground) || "";
    overlay.style.color = this.getColor(this.styles.listForeground) || "";
  }
  updateStyles() {
    this.overlays.forEach((overlay) => this.updateOverlayStyles(overlay.overlay));
    this.overlayTextBackground = this.getColor(this.styles.listBackground) || "";
  }
};

ChatDragAndDrop = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, ISharedWebContentExtractorService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IChatAttachmentResolveService)
], ChatDragAndDrop);

function containsImageDragType(e4) {
  if (containsDragType(e4, "image")) {
    return true;
  }
  if (containsDragType(e4, DataTransfers.FILES)) {
    const files = e4.dataTransfer?.files;
    if (files && files.length > 0) {
      return Array.from(files).some((file) => file.type.startsWith("image/"));
    }
    const items = e4.dataTransfer?.items;
    if (items && items.length > 0) {
      return Array.from(items).some((item) => item.type.startsWith("image/"));
    }
  }
  return false;
}

function extractUrlsFromDragEvent(e4, logService) {
  const textUrl = e4.dataTransfer?.getData("text/uri-list");
  if (textUrl) {
    try {
      const urls = UriList.parse(textUrl);
      if (urls.length > 0) {
        return urls;
      }
    } catch (error) {
      logService?.error("Error parsing URI list:", error);
      return [];
    }
  }
  return [];
}

function extractImageFilesFromDragEvent(e4) {
  const files = e4.dataTransfer?.files;
  if (!files) {
    return [];
  }
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
}
export { containsImageDragType, extractUrlsFromDragEvent, extractImageFilesFromDragEvent, IMAGE_DATA_REGEX, URL_REGEX, ChatDragAndDrop };
