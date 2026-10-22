// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatContextAttachments.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { $, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { isAgentHostCompletionVariableEntry, isPastedTextArtifact } from "./module-0980.mjs";
import { URI } from "./module-0032.mjs";
import { isLocation } from "./module-0164.mjs";
import { coerceImageBuffer } from "./module-1194.mjs";
import { localize } from "./module-0001.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { createImageHoverContent, openPastedTextArtifact } from "./module-2027.mjs";
import { ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX } from "./module-3563.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { registerOpenEditorListeners } from "./module-1993.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { basename2 } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { ISearchService, getExcludes } from "./module-1000.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { resizeImage } from "./module-0945.mjs";
import { imageToHash, isImage } from "./module-2085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IFileService } from "./module-0269.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IChatImageCarouselService } from "./module-2026.mjs";


// src/vs/sessions/contrib/chat/browser/newChatContextAttachments.ts
var GITHUB_CONTEXT_ID_PREFIX = "github-context:";

var NewChatContextAttachments = class extends Disposable {
  constructor(quickInputService, textModelService, fileService, clipboardService, fileDialogService, labelService, searchService, configurationService, openerService, instantiationService, modelService, languageService, chatImageCarouselService) {
    super();
    this.quickInputService = quickInputService;
    this.textModelService = textModelService;
    this.fileService = fileService;
    this.clipboardService = clipboardService;
    this.fileDialogService = fileDialogService;
    this.labelService = labelService;
    this.searchService = searchService;
    this.configurationService = configurationService;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.chatImageCarouselService = chatImageCarouselService;
    this._attachedContext = [];
    this._renderDisposables = this._register(new DisposableStore());
    this._onDidChangeContext = this._register(new Emitter());
    this.onDidChangeContext = this._onDidChangeContext.event;
    this._resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
  }
  get attachments() {
    return this._attachedContext;
  }
  setAttachments(entries2) {
    this._attachedContext.length = 0;
    this._attachedContext.push(...entries2);
    this._updateRendering();
    this._onDidChangeContext.fire();
  }
  // --- Rendering ---
  renderAttachedContext(container2) {
    this._container = container2;
    this._updateRendering();
  }
  _updateRendering() {
    if (!this._container) {
      return;
    }
    this._renderDisposables.clear();
    this._resourceLabels.clear();
    clearNode(this._container);
    const visibleAttachments = this._attachedContext.filter((entry) => !isAgentHostCompletionVariableEntry(entry));
    if (visibleAttachments.length === 0) {
      this._container.style.display = "none";
      return;
    }
    this._container.style.display = "";
    this._container.classList.add("show-file-icons");
    for (const entry of visibleAttachments) {
      const pill = append(this._container, $(".sessions-chat-attachment-pill"));
      const resource = URI.isUri(entry.value) ? entry.value : isLocation(entry.value) ? entry.value.uri : void 0;
      const githubContextResource = entry.id.startsWith(GITHUB_CONTEXT_ID_PREFIX) ? URI.parse(entry.id.slice(GITHUB_CONTEXT_ID_PREFIX.length)) : void 0;
      const openResource = resource ?? githubContextResource;
      const imageData = entry.kind === "image" ? coerceImageBuffer(entry.value) : void 0;
      const canOpen = Boolean(imageData || openResource || isPastedTextArtifact(entry));
      let content;
      if (canOpen) {
        const openButton = append(pill, $("button.sessions-chat-attachment-open"));
        openButton.type = "button";
        openButton.setAttribute("aria-label", localize(4429, null, entry.name));
        content = openButton;
        pill.classList.add("openable");
      } else {
        content = append(pill, $("span.sessions-chat-attachment-content"));
      }
      if (entry.kind === "image") {
        const icon2 = append(content, renderIcon(Codicon.fileMedia));
        append(content, $("span.sessions-chat-attachment-name", void 0, entry.name));
        if (imageData) {
          const preview = createImageHoverContent(resource, entry.name, imageData, entry.id, void 0, void 0, (url, isThumbnail) => {
            if (isThumbnail) {
              icon2.replaceWith($("img.sessions-chat-attachment-image", { src: url, alt: "" }));
            }
          });
          this._renderDisposables.add(preview.disposable);
        }
      } else if (entry.id.startsWith(ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX)) {
        const icon2 = append(content, renderIcon(Codicon.repo));
        icon2.setAttribute("aria-hidden", "true");
        append(content, $("span.sessions-chat-attachment-name", void 0, entry.name));
      } else if (entry.icon) {
        const icon2 = append(content, renderIcon(entry.icon));
        icon2.setAttribute("aria-hidden", "true");
        if (entry.icon.color) {
          icon2.style.color = asCssVariable(entry.icon.color.id);
        }
        append(content, $("span.sessions-chat-attachment-name", void 0, entry.name));
      } else {
        const label3 = this._resourceLabels.create(content, { supportIcons: true });
        this._renderDisposables.add(label3);
        if (resource) {
          label3.setFile(resource, {
            fileKind: entry.kind === "directory" ? 1 /* FOLDER */ : 0 /* FILE */,
            hidePath: true
          });
        } else if (isPastedTextArtifact(entry)) {
          label3.setLabel(entry.fileName, void 0, { extraClasses: ["file-icon", `${entry.language}-lang-file-icon`] });
          append(content, $("span.sessions-chat-attachment-info", void 0, localize(4431, null, entry.pastedLines)));
        } else {
          label3.setLabel(entry.name);
        }
      }
      if (imageData) {
        this._renderDisposables.add(registerOpenEditorListeners(content, async () => {
          if (this.configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */)) {
            const imageResource = resource ?? URI.from({ scheme: "data", path: entry.name });
            await this.chatImageCarouselService.openCarouselAtResource(imageResource, imageData);
          } else if (resource) {
            await this.openerService.open(resource, { fromUserGesture: true });
          }
        }));
      } else if (openResource) {
        this._renderDisposables.add(registerOpenEditorListeners(content, async () => {
          await this.openerService.open(openResource, { fromUserGesture: true });
        }));
      } else if (isPastedTextArtifact(entry)) {
        this._renderDisposables.add(registerOpenEditorListeners(content, async () => {
          await this.instantiationService.invokeFunction(openPastedTextArtifact, entry);
        }));
      }
      const removeButton = append(pill, $("button.sessions-chat-attachment-remove"));
      removeButton.type = "button";
      removeButton.title = localize(4432, null);
      removeButton.setAttribute("aria-label", localize(4433, null, entry.name));
      const removeIcon3 = append(removeButton, renderIcon(Codicon.closeCompact));
      removeIcon3.setAttribute("aria-hidden", "true");
      this._renderDisposables.add(addDisposableListener(removeButton, EventType.KEY_DOWN, (e4) => e4.stopPropagation()));
      this._renderDisposables.add(addDisposableListener(removeButton, EventType.CLICK, (e4) => {
        e4.stopPropagation();
        this.removeAttachment(entry.id);
      }));
    }
  }
  // --- Picker ---
  showPicker(folderUri) {
    const picker = this.quickInputService.createQuickPick({ useSeparators: true });
    const disposables = new DisposableStore();
    picker.placeholder = localize(4426, null);
    picker.matchOnDescription = true;
    picker.sortByLabel = false;
    const staticPicks = [
      {
        label: localize(4427, null),
        iconClass: ThemeIcon.asClassName(Codicon.file),
        id: "sessions.filesAndFolders"
      },
      {
        label: localize(4428, null),
        iconClass: ThemeIcon.asClassName(Codicon.fileMedia),
        id: "sessions.imageFromClipboard"
      }
    ];
    picker.items = staticPicks;
    picker.show();
    if (folderUri) {
      let searchCts;
      let debounceTimer;
      const runSearch = (filePattern2) => {
        searchCts?.dispose(true);
        searchCts = new CancellationTokenSource();
        const token = searchCts.token;
        picker.busy = true;
        this._collectFilePicks(folderUri, filePattern2, token).then((filePicks) => {
          if (token.isCancellationRequested) {
            return;
          }
          picker.busy = false;
          if (filePicks.length > 0) {
            picker.items = [
              ...staticPicks,
              { type: "separator", label: basename2(folderUri) },
              ...filePicks
            ];
          } else {
            picker.items = staticPicks;
          }
        });
      };
      runSearch();
      disposables.add(picker.onDidChangeValue((value2) => {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => runSearch(value2 || void 0), 200);
      }));
      disposables.add({ dispose: () => {
        searchCts?.dispose(true);
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
      } });
    }
    disposables.add(picker.onDidAccept(async () => {
      const [selected] = picker.selectedItems;
      if (!selected) {
        picker.hide();
        return;
      }
      picker.hide();
      if (selected.id === "sessions.filesAndFolders") {
        await this._handleFileDialog();
      } else if (selected.id === "sessions.imageFromClipboard") {
        await this._handleClipboardImage();
      } else if (selected.id) {
        await this._attachFileUri(URI.parse(selected.id), selected.label);
      }
    }));
    disposables.add(picker.onDidHide(() => {
      picker.dispose();
      disposables.dispose();
    }));
  }
  async _collectFilePicks(rootUri, filePattern2, token) {
    const maxFiles = 200;
    if (rootUri.scheme === Schemas.file || rootUri.scheme === Schemas.vscodeRemote) {
      return this._collectFilePicksViaSearch(rootUri, maxFiles, filePattern2, token);
    }
    return this._collectFilePicksViaFileService(rootUri, maxFiles, filePattern2);
  }
  async _collectFilePicksViaSearch(rootUri, maxFiles, filePattern2, token) {
    const excludePattern = getExcludes(this.configurationService.getValue({ resource: rootUri }));
    try {
      const searchResult = await this.searchService.fileSearch({
        folderQueries: [{
          folder: rootUri,
          disregardIgnoreFiles: false
        }],
        type: 1 /* File */,
        filePattern: filePattern2 || "",
        excludePattern,
        sortByScore: true,
        maxResults: maxFiles
      }, token);
      return searchResult.results.map((result) => ({
        label: basename2(result.resource),
        description: this.labelService.getUriLabel(result.resource, { relative: true }),
        iconClasses: getIconClasses(this.modelService, this.languageService, result.resource, 0 /* FILE */),
        id: result.resource.toString()
      }));
    } catch {
      return [];
    }
  }
  async _collectFilePicksViaFileService(rootUri, maxFiles, filePattern2) {
    const picks = [];
    const patternLower = filePattern2?.toLowerCase();
    const maxDepth = 10;
    const collect2 = async (uri4, depth) => {
      if (picks.length >= maxFiles || depth > maxDepth) {
        return;
      }
      try {
        const stat = await this.fileService.resolve(uri4);
        if (!stat.children) {
          return;
        }
        const children = stat.children.slice().sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) {
            return a.isDirectory ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        for (const child of children) {
          if (picks.length >= maxFiles) {
            break;
          }
          if (child.isDirectory) {
            await collect2(child.resource, depth + 1);
          } else {
            if (patternLower && !child.name.toLowerCase().includes(patternLower)) {
              continue;
            }
            picks.push({
              label: child.name,
              description: this.labelService.getUriLabel(child.resource, { relative: true }),
              iconClasses: getIconClasses(this.modelService, this.languageService, child.resource, 0 /* FILE */),
              id: child.resource.toString()
            });
          }
        }
      } catch {
      }
    };
    await collect2(rootUri, 0);
    return picks;
  }
  async _handleFileDialog() {
    const selected = await this.fileDialogService.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: true,
      canSelectMany: true,
      title: localize(4434, null)
    });
    if (!selected) {
      return;
    }
    for (const uri4 of selected) {
      await this._attachFileUri(uri4, basename2(uri4));
    }
  }
  async _attachFileUri(uri4, name) {
    let stat;
    try {
      stat = await this.fileService.stat(uri4);
    } catch {
      return;
    }
    if (stat.isDirectory) {
      this._addAttachments({
        kind: "directory",
        id: uri4.toString(),
        value: uri4,
        name
      });
      return;
    }
    if (/\.(png|jpg|jpeg|bmp|gif|tiff)$/i.test(uri4.path)) {
      const readFile = await this.fileService.readFile(uri4);
      const resizedImage = await resizeImage(readFile.value.buffer);
      this._addAttachments({
        id: uri4.toString(),
        name,
        fullName: name,
        value: resizedImage,
        kind: "image",
        references: [{ reference: uri4, kind: "reference" }]
      });
    } else {
      let omittedState = 0 /* NotOmitted */;
      try {
        const ref = await this.textModelService.createModelReference(uri4);
        ref.dispose();
      } catch {
        omittedState = 2 /* Full */;
      }
      this._addAttachments({
        kind: "file",
        id: uri4.toString(),
        value: uri4,
        name,
        omittedState
      });
    }
  }
  async _handleClipboardImage() {
    const imageData = await this.clipboardService.readImage();
    if (!isImage(imageData)) {
      return;
    }
    const displayName = this._getUniqueImageName();
    this._addAttachments({
      id: await imageToHash(imageData),
      name: displayName,
      fullName: displayName,
      value: imageData,
      kind: "image"
    });
  }
  // --- State management ---
  _getUniqueImageName() {
    const baseName = localize(4430, null);
    let name = baseName;
    for (let i2 = 2; this._attachedContext.some((a) => a.name === name); i2++) {
      name = `${baseName} ${i2}`;
    }
    return name;
  }
  addAttachments(...entries2) {
    this._addAttachments(...entries2);
  }
  _addAttachments(...entries2) {
    for (const entry of entries2) {
      if (!this._attachedContext.some((e4) => e4.id === entry.id)) {
        this._attachedContext.push(entry);
      }
    }
    this._updateRendering();
    this._onDidChangeContext.fire();
  }
  removeAttachment(id2) {
    const index2 = this._attachedContext.findIndex((e4) => e4.id === id2);
    if (index2 >= 0) {
      this._attachedContext.splice(index2, 1);
      this._updateRendering();
      this._onDidChangeContext.fire();
    }
  }
  clear() {
    this._attachedContext.length = 0;
    this._updateRendering();
    this._onDidChangeContext.fire();
  }
};

NewChatContextAttachments = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ISearchService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, IModelService),
  __decorateParam(11, ILanguageService),
  __decorateParam(12, IChatImageCarouselService)
], NewChatContextAttachments);
export { GITHUB_CONTEXT_ID_PREFIX, NewChatContextAttachments };
