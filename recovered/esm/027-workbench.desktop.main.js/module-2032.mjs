// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentWidgets.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { getImageAttachmentLimit, isPastedTextArtifact, isStringVariableEntry, resolveChatContextIcon } from "./module-0979.mjs";
import { Button } from "./module-0546.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { Codicon } from "./module-0085.mjs";
import { registerOpenEditorListeners } from "./module-2016.mjs";
import { revealInSideBarCommand } from "./module-2027.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { ILanguageModelsService, isAutoLanguageModel } from "./module-0967.mjs";
import { basename, dirname } from "./module-0026.mjs";
import { FolderThemeIcon, IThemeService } from "./module-0287.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { INotificationService } from "./module-0336.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { coerceImageBuffer } from "./module-1194.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IChatImageCarouselService } from "./module-2031.mjs";
import { CHAT_IMAGE_HOVER_THUMBNAIL_MAX_SIZE, getOrCreateImageThumbnail } from "./module-0944.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { IChatResponseResourceFileSystemProvider } from "./module-2030.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { IChatContextService } from "./module-1454.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { isDark } from "./module-0247.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { getCleanPromptName } from "./module-0996.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { Iterable } from "./module-0011.mjs";
import { ILanguageModelToolsService, isToolSet } from "./module-0990.mjs";
import { buildOpenSessionLinkForChatResource } from "./module-2029.mjs";
import { CellUri } from "./module-0909.mjs";
import { INotebookService } from "./module-0926.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { toHistoryItemHoverContent } from "./module-1260.mjs";
import { getHistoryItemEditorTitle } from "./module-2028.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { fillInSymbolsDragData } from "./module-0273.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { StaticResourceContextKey } from "./module-0949.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatAttachmentWidgets.ts
var commonHoverOptions = {
  style: 1 /* Pointer */,
  position: {
    hoverPosition: 2 /* BELOW */
  },
  trapFocus: true
};

var commonHoverLifecycleOptions = {
  groupId: "chat-attachments"
};

var KEY_ELEMENT_HOVER_COMPUTED_STYLE_PROPERTIES = [
  "display",
  "position",
  "margin",
  "padding",
  "font-size",
  "font-family",
  "color",
  "background-color"
];

var AbstractChatAttachmentWidget = class extends Disposable {
  constructor(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService, terminalService) {
    super();
    this.attachment = attachment;
    this.options = options3;
    this.currentLanguageModel = currentLanguageModel;
    this.commandService = commandService;
    this.openerService = openerService;
    this.configurationService = configurationService;
    this.terminalService = terminalService;
    this._onDidDelete = this._register(new Emitter());
    this._onDidOpen = this._register(new Emitter());
    this._hasClearButton = false;
    this.element = append(container3, $(".chat-attached-context-attachment.show-file-icons"));
    this.attachClearButton();
    this.label = contextResourceLabels.create(this.element, { supportIcons: true, hoverTargetOverride: this.element });
    this._register(this.label);
    this.element.tabIndex = 0;
    this.element.role = "button";
    this._register(addDisposableListener(this.element, EventType.AUXCLICK, (e) => {
      if (e.button === 1 && this.options.supportsDeletion && !this.attachment.range) {
        e.preventDefault();
        e.stopPropagation();
        this._onDidDelete.fire(e);
      }
    }));
  }
  get onDidDelete() {
    return this._onDidDelete.event;
  }
  get onDidOpen() {
    return this._onDidOpen.event;
  }
  modelSupportsVision() {
    return modelSupportsVision(this.currentLanguageModel);
  }
  appendDeletionHint(ariaLabel) {
    if (!this._hasClearButton) {
      return ariaLabel;
    }
    return localize(9864, null, ariaLabel);
  }
  attachClearButton() {
    if (this.attachment.range && !isPastedTextArtifact(this.attachment) || !this.options.supportsDeletion) {
      return;
    }
    this._hasClearButton = true;
    const clearButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: createInstantHoverDelegate(),
      title: localize(9857, null)
    });
    clearButton.element.tabIndex = -1;
    clearButton.icon = Codicon.closeCompact;
    this._register(clearButton);
    this._register(Event2.once(clearButton.onDidClick)((e) => {
      this._onDidDelete.fire(e);
    }));
    this._register(addStandardDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
      if (e.keyCode === 1 /* Backspace */ || e.keyCode === 20 /* Delete */) {
        e.preventDefault();
        e.stopPropagation();
        this._onDidDelete.fire(e.browserEvent);
      }
    }));
  }
  addResourceOpenHandlers(resource, range2) {
    this.element.style.cursor = "pointer";
    this._register(registerOpenEditorListeners(this.element, async (options3) => {
      if (this.attachment.kind === "directory") {
        await this.openResource(resource, options3, true);
      } else {
        await this.openResource(resource, options3, false, range2);
      }
    }));
  }
  async openResource(resource, openOptions, isDirectory, range2) {
    if (isDirectory) {
      this.commandService.executeCommand(revealInSideBarCommand.id, resource);
      return;
    }
    if (resource.scheme === Schemas.vscodeTerminal) {
      this.terminalService?.openResource(resource);
      return;
    }
    const openTextEditorOptions = range2 ? { selection: range2 } : void 0;
    const options3 = {
      fromUserGesture: true,
      openToSide: openOptions.openToSide,
      editorOptions: {
        ...openTextEditorOptions,
        ...openOptions.editorOptions
      }
    };
    await this.openerService.open(resource, options3);
    this._onDidOpen.fire();
    this.element.focus();
  }
};

AbstractChatAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ITerminalService)
], AbstractChatAttachmentWidget);

function modelSupportsVision(currentLanguageModel) {
  return isAutoLanguageModel(currentLanguageModel) || (currentLanguageModel?.metadata.capabilities?.vision ?? false);
}

function getEffectiveImageOmittedState(omittedState, currentLanguageModel, isCurrentInput) {
  return isAutoLanguageModel(currentLanguageModel) && isCurrentInput && omittedState === 2 /* Full */ ? 0 /* NotOmitted */ : omittedState;
}

var FileAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, range2, attachment, correspondingContentReference, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, themeService, hoverService, languageModelsService, instantiationService, fileDialogService, fileService, notificationService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.themeService = themeService;
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.instantiationService = instantiationService;
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    const fileBasename = basename(resource.path);
    const fileDirname = dirname(resource.path);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    let ariaLabel = range2 ? localize(9886, null, friendlyName, range2.startLineNumber, range2.endLineNumber) : localize(9884, null, friendlyName);
    if (attachment.omittedState === 2 /* Full */) {
      ariaLabel = localize(9896, null, attachment.name);
      this.renderOmittedWarning(friendlyName, ariaLabel);
    } else {
      const fileOptions = { hidePath: true, title: correspondingContentReference?.options?.status?.description };
      this.label.setFile(resource, attachment.kind === "file" ? {
        ...fileOptions,
        fileKind: 0 /* FILE */,
        range: range2
      } : {
        ...fileOptions,
        fileKind: 1 /* FOLDER */,
        icon: !this.themeService.getFileIconTheme().hasFolderIcons ? FolderThemeIcon : void 0
      });
      if (attachment.kind === "directory" && typeof attachment.imageCount === "number") {
        const maxImagesPerRequest = getImageAttachmentLimit(currentLanguageModel?.metadata);
        if (maxImagesPerRequest !== void 0 && attachment.imageCount > maxImagesPerRequest) {
          this.renderFolderImageLimitWarning(attachment.imageCount, maxImagesPerRequest);
        }
      }
    }
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
    if (attachment.kind === "file") {
      this.attachSaveButton(resource, fileBasename, options3.supportsDeletion);
    }
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
    });
    this.addResourceOpenHandlers(resource, range2);
  }
  attachSaveButton(resource, name, supportsDeletion) {
    if (supportsDeletion) {
      return;
    }
    const saveButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: createInstantHoverDelegate(),
      title: localize(9858, null)
    });
    saveButton.element.classList.add("chat-attached-context-download-button");
    saveButton.element.tabIndex = -1;
    saveButton.icon = Codicon.cloudDownload;
    this.element.insertBefore(saveButton.element, this.label.element);
    this._register(saveButton);
    this._register(saveButton.onDidClick(async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const defaultUri = joinPath(await this.fileDialogService.defaultFilePath(), name);
      const target = await this.fileDialogService.showSaveDialog({ defaultUri });
      if (!target) {
        return;
      }
      try {
        await this.fileService.copy(resource, target, true);
      } catch (error) {
        this.notificationService.error(localize(9859, null, error));
      }
    }));
  }
  renderOmittedWarning(friendlyName, ariaLabel) {
    const pillIcon = $("div.chat-attached-context-pill", {}, $("span.codicon.codicon-warning-compact"));
    const textLabel = $("span.chat-attached-context-custom-text", {}, friendlyName);
    this.element.appendChild(pillIcon);
    this.element.appendChild(textLabel);
    const hoverElement = $("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    this.element.classList.add("warning");
    hoverElement.textContent = localize(9885, null, this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name : this.currentLanguageModel ?? "This model");
    this._register(this.hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: hoverElement
    }, commonHoverLifecycleOptions));
  }
  renderFolderImageLimitWarning(imageCount, limit) {
    this.element.classList.add("warning");
    const hoverElement = $("div.chat-attached-context-hover");
    hoverElement.textContent = localize(
      9887,
      null,
      imageCount,
      limit
    );
    this._register(this.hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: hoverElement
    }, commonHoverLifecycleOptions));
  }
};

FileAttachmentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IThemeService),
  __decorateParam(12, IHoverService),
  __decorateParam(13, ILanguageModelsService),
  __decorateParam(14, IInstantiationService),
  __decorateParam(15, IFileDialogService),
  __decorateParam(16, IFileService),
  __decorateParam(17, INotificationService)
], FileAttachmentWidget);

var TerminalCommandAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService, terminalService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService, terminalService);
    this.hoverService = hoverService;
    this.terminalService = terminalService;
    const ariaLabel = localize(9903, null, attachment.command);
    const clickHandler = () => this.openResource(attachment.resource, { editorOptions: { preserveFocus: true } }, false, void 0);
    this._register(createTerminalCommandElements(this.element, attachment, ariaLabel, this.hoverService, clickHandler));
    this._register(addDisposableListener(this.element, EventType.KEY_DOWN, async (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        await clickHandler();
      }
    }));
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
  }
};

TerminalCommandAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, ITerminalService)
], TerminalCommandAttachmentWidget);

function createTerminalCommandElements(element, attachment, ariaLabel, hoverService, clickHandler) {
  const disposable = new DisposableStore();
  element.ariaLabel = ariaLabel;
  element.style.cursor = "pointer";
  const terminalIconSpan = $("span");
  terminalIconSpan.classList.add(...ThemeIcon.asClassNameArray(Codicon.terminal));
  const pillIcon = $("div.chat-attached-context-pill", {}, terminalIconSpan);
  const textLabel = $("span.chat-attached-context-custom-text", {}, attachment.command);
  element.appendChild(pillIcon);
  element.appendChild(textLabel);
  disposable.add(addDisposableListener(element, EventType.CLICK, (e) => {
    e.preventDefault();
    e.stopPropagation();
    clickHandler();
  }));
  disposable.add(hoverService.setupDelayedHover(element, () => getHoverContent(ariaLabel, attachment), commonHoverLifecycleOptions));
  return disposable;
}

function getHoverContent(ariaLabel, attachment) {
  {
    const hoverElement = $("div.chat-attached-context-hover");
    hoverElement.setAttribute("aria-label", ariaLabel);
    const commandTitle = $("div", {}, typeof attachment.exitCode === "number" ? localize(9905, null, attachment.command, attachment.exitCode) : localize(9904, null));
    commandTitle.classList.add("attachment-additional-info");
    const commandBlock = $("pre.chat-terminal-command-block");
    hoverElement.append(commandTitle, commandBlock);
    if (attachment.output && attachment.output.trim().length > 0) {
      const outputTitle = $("div", {}, localize(9906, null));
      outputTitle.classList.add("attachment-additional-info");
      const outputBlock = $("pre.chat-terminal-command-output");
      const fullOutputLines = attachment.output.split("\n");
      const hoverOutputLines = [];
      for (const line of fullOutputLines) {
        if (hoverOutputLines.length >= 5 /* MaxAttachmentOutputLineCount */) {
          hoverOutputLines.push("...");
          break;
        }
        const trimmed = line.trim();
        if (trimmed.length === 0) {
          continue;
        }
        if (trimmed.length > 80 /* MaxAttachmentOutputLineLength */) {
          hoverOutputLines.push(`${trimmed.slice(0, 80 /* MaxAttachmentOutputLineLength */)}...`);
        } else {
          hoverOutputLines.push(trimmed);
        }
      }
      outputBlock.textContent = hoverOutputLines.join("\n");
      hoverElement.append(outputTitle, outputBlock);
    }
    return {
      ...commonHoverOptions,
      content: hoverElement
    };
  }
}

var ImageAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService, languageModelsService, instantiationService, labelService, chatImageCarouselService, fileDialogService, fileService, notificationService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.labelService = labelService;
    this.chatImageCarouselService = chatImageCarouselService;
    this.fileDialogService = fileDialogService;
    this.fileService = fileService;
    this.notificationService = notificationService;
    this.element.classList.add("image-attachment");
    const isAutoModel2 = isAutoLanguageModel(currentLanguageModel);
    const modelName = currentLanguageModel?.metadata.name;
    const omittedState = getEffectiveImageOmittedState(attachment.omittedState, currentLanguageModel, options3.isCurrentInput);
    this.element.classList.toggle("auto-image-warning", isAutoModel2);
    let ariaLabel;
    if (omittedState === 2 /* Full */ && modelName && !modelSupportsVision(currentLanguageModel)) {
      ariaLabel = localize(9907, null, modelName, attachment.name);
    } else if (omittedState === 2 /* Full */) {
      ariaLabel = localize(9897, null, attachment.name);
    } else if (omittedState === 1 /* Partial */) {
      ariaLabel = localize(9900, null, attachment.name);
    } else if (omittedState === 3 /* ImageLimitExceeded */) {
      ariaLabel = localize(9891, null, attachment.name);
    } else if (isAutoModel2) {
      ariaLabel = localize(9865, null, attachment.name);
    } else {
      ariaLabel = localize(9888, null, attachment.name);
    }
    const ref = attachment.references?.[0]?.reference;
    resource = ref && URI.isUri(ref) ? ref : void 0;
    const imageData = coerceImageBuffer(attachment.value);
    const clickHandler = async () => {
      if ((resource || imageData) && configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */)) {
        await this.openInCarousel(attachment.id, attachment.name, imageData, resource, options3.isCurrentInput);
      } else if (resource) {
        await this.openResource(resource, { editorOptions: { preserveFocus: true } }, false, void 0);
      }
    };
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : "Current model";
    const fullName = resource ? this.labelService.getUriLabel(resource) : attachment.fullName || attachment.name;
    const imageElements = this._register(new MutableDisposable());
    const renderImageElements = (buffer) => {
      imageElements.value = createImageElements(resource, attachment.name, fullName, this.element, buffer, attachment.id, this.hoverService, ariaLabel, currentLanguageModelName, clickHandler, this.currentLanguageModel, omittedState, options3.isCurrentInput === true, options3.showImageInHover ?? true);
      this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
    };
    renderImageElements(imageData ?? new Uint8Array());
    if (!imageData && resource && omittedState !== 2 /* Full */ && omittedState !== 3 /* ImageLimitExceeded */) {
      void this.loadImageBytes(resource, renderImageElements);
    }
    this.attachSaveButton(resource, imageData, attachment.name, options3.supportsDeletion);
    const canOpenCarousel = !!imageData && configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */);
    if (canOpenCarousel || resource) {
      this.element.style.cursor = "pointer";
      this._register(registerOpenEditorListeners(this.element, async () => {
        await clickHandler();
      }));
    }
    if (resource) {
      instantiationService.invokeFunction((accessor) => {
        this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
      });
    }
  }
  async loadImageBytes(resource, render) {
    let content2;
    try {
      content2 = (await this.fileService.readFile(resource)).value;
    } catch {
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    render(content2.buffer);
  }
  async openInCarousel(id2, name, data, referenceUri, preferCurrentInput) {
    const resource = referenceUri ?? URI.from({ scheme: "data", path: `${id2}/${encodeURIComponent(name)}` });
    await this.chatImageCarouselService.openCarouselAtResource(resource, data, { preferCurrentInput });
  }
  attachSaveButton(resource, imageData, name, supportsDeletion) {
    if (supportsDeletion || !resource && !imageData) {
      return;
    }
    const saveButton = new Button(this.element, {
      supportIcons: true,
      hoverDelegate: createInstantHoverDelegate(),
      title: localize(9860, null)
    });
    saveButton.element.classList.add("chat-attached-context-download-button");
    saveButton.element.tabIndex = -1;
    saveButton.icon = Codicon.cloudDownload;
    this._register(saveButton);
    this._register(saveButton.onDidClick(async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const defaultUri = joinPath(await this.fileDialogService.defaultFilePath(), name);
      const target = await this.fileDialogService.showSaveDialog({ defaultUri });
      if (!target) {
        return;
      }
      try {
        if (resource) {
          await this.fileService.copy(resource, target, true);
        } else if (imageData) {
          await this.fileService.writeFile(target, VSBuffer.wrap(imageData));
        }
      } catch (error) {
        this.notificationService.error(localize(9861, null, error));
      }
    }));
  }
};

ImageAttachmentWidget = __decorateClass([
  __decorateParam(6, ICommandService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ILanguageModelsService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, ILabelService),
  __decorateParam(13, IChatImageCarouselService),
  __decorateParam(14, IFileDialogService),
  __decorateParam(15, IFileService),
  __decorateParam(16, INotificationService)
], ImageAttachmentWidget);

function createImageHoverContent(resource, fullName, buffer, cacheKey2, onContentsChanged, clickHandler, onImageUrl, imageAlt = "", showImageInHover = true) {
  const disposable = new DisposableStore();
  const hoverElement = $("div.chat-attached-context-hover");
  const hoverImage = $("img.chat-attached-context-image", { alt: imageAlt });
  if (showImageInHover) {
    const imageContainer = $("div.chat-attached-context-image-container", {}, hoverImage);
    hoverElement.appendChild(imageContainer);
    if (clickHandler) {
      imageContainer.classList.add("clickable");
      imageContainer.tabIndex = 0;
      imageContainer.role = "button";
      imageContainer.ariaLabel = localize(9899, null);
      disposable.add(registerOpenEditorListeners(imageContainer, async () => {
        await clickHandler();
      }));
    }
  }
  if (resource) {
    const urlContainer = clickHandler ? $("a.chat-attached-context-url", {}, fullName) : $("div.chat-attached-context-url", {}, fullName);
    const separator2 = $("div.chat-attached-context-url-separator");
    if (clickHandler) {
      disposable.add(addDisposableListener(urlContainer, "click", clickHandler));
    }
    hoverElement.append(separator2, urlContainer);
  }
  const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const previewImageUrl = disposable.add(new MutableDisposable());
  const renderPreviewImage = async () => {
    const thumbnail = await getOrCreateImageThumbnail(cacheKey2, data, CHAT_IMAGE_HOVER_THUMBNAIL_MAX_SIZE);
    if (disposable.isDisposed) {
      return;
    }
    const source = thumbnail ?? new Blob([data]);
    const url = URL.createObjectURL(source);
    previewImageUrl.value = toDisposable(() => URL.revokeObjectURL(url));
    hoverImage.onload = () => onContentsChanged?.();
    hoverImage.src = url;
    onImageUrl?.(url, !!thumbnail, hoverImage);
  };
  void renderPreviewImage();
  return { element: hoverElement, disposable };
}

function createImageElements(resource, name, fullName, element, buffer, cacheKey2, hoverService, ariaLabel, currentLanguageModelName, clickHandler, currentLanguageModel, omittedState, useCompactWarningIcon = false, showImageInHover = true) {
  const disposable = new DisposableStore();
  if (omittedState === 1 /* Partial */) {
    element.classList.add("partial-warning");
  }
  element.ariaLabel = ariaLabel;
  element.style.position = "relative";
  if (resource) {
    element.style.cursor = "pointer";
  }
  const createPillIcon = (icon2) => {
    const iconElement = $("span");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(icon2));
    return $("div.chat-attached-context-pill", {}, iconElement);
  };
  const supportsVision = modelSupportsVision(currentLanguageModel);
  const warningIcon3 = useCompactWarningIcon ? Codicon.warningCompact : Codicon.warning;
  const pillIcon = createPillIcon(supportsVision ? Codicon.fileMediaCompact : warningIcon3);
  const textLabel = $("span.chat-attached-context-custom-text", {}, name);
  element.appendChild(pillIcon);
  element.appendChild(textLabel);
  let currentPill = pillIcon;
  const replacePill = (pill) => {
    currentPill.replaceWith(pill);
    currentPill = pill;
  };
  const hoverElement = $("div.chat-attached-context-hover");
  hoverElement.setAttribute("aria-label", ariaLabel);
  if (!supportsVision && currentLanguageModel || omittedState === 2 /* Full */) {
    element.classList.add("warning");
    hoverElement.textContent = localize(9889, null, currentLanguageModelName ?? "This model");
    disposable.add(hoverService.setupDelayedHover(element, {
      content: hoverElement,
      style: 1 /* Pointer */
    }));
  } else if (omittedState === 3 /* ImageLimitExceeded */) {
    element.classList.add("warning");
    const maxImagesPerRequest = getImageAttachmentLimit(currentLanguageModel?.metadata);
    hoverElement.textContent = maxImagesPerRequest !== void 0 ? localize(9892, null, maxImagesPerRequest) : localize(9893, null);
    disposable.add(hoverService.setupDelayedHover(element, {
      content: hoverElement,
      style: 1 /* Pointer */
    }));
  } else {
    const onImageFailed = () => {
      const pillIcon2 = createPillIcon(Codicon.fileMediaCompact);
      replacePill(pillIcon2);
    };
    const hoverFullName = omittedState === 1 /* Partial */ ? localize(9890, null) : fullName;
    const hoverContent2 = createImageHoverContent(resource, hoverFullName, buffer, cacheKey2, void 0, resource ? clickHandler : void 0, (url, isThumbnail, hoverImage) => {
      if (isThumbnail) {
        const pillImg = $("img.chat-attached-context-pill-image", { src: url, alt: "" });
        const pill = $("div.chat-attached-context-pill", {}, pillImg);
        replacePill(pill);
      }
      hoverImage.onerror = onImageFailed;
    }, "", showImageInHover);
    disposable.add(hoverContent2.disposable);
    const hoverElement2 = hoverContent2.element;
    hoverElement2.setAttribute("aria-label", ariaLabel);
    disposable.add(hoverService.setupDelayedHover(element, {
      content: hoverElement2,
      style: 1 /* Pointer */
    }));
    if (isAutoLanguageModel(currentLanguageModel)) {
      hoverElement2.appendChild($("div", void 0, localize(9866, null)));
    }
  }
  disposable.add(toDisposable(() => {
    currentPill.remove();
    textLabel.remove();
  }));
  return disposable;
}

async function openPastedTextArtifact(accessor, attachment) {
  const editorService = accessor.get(IEditorService);
  const owned = accessor.get(IChatResponseResourceFileSystemProvider).associate(VSBuffer.fromString(attachment.code).buffer, { id: attachment.id, name: attachment.name });
  try {
    await editorService.openEditor({ resource: owned.resource, options: { pinned: true } });
  } catch (error) {
    owned.dispose();
    throw error;
  }
  const listener = editorService.onDidCloseEditor(() => {
    if (!editorService.editors.some((editor) => isEqual2(editor.resource, owned.resource))) {
      owned.dispose();
      listener.dispose();
    }
  });
}

var PasteAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService, instantiationService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    const ariaLabel = localize(9854, null, attachment.name);
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
    const classNames2 = ["file-icon", `${attachment.language}-lang-file-icon`];
    let resource;
    let range2;
    if (attachment.copiedFrom) {
      resource = attachment.copiedFrom.uri;
      range2 = attachment.copiedFrom.range;
      const filename = basename(resource.path);
      this.label.setLabel(filename, void 0, { extraClasses: classNames2 });
    } else {
      this.label.setLabel(attachment.fileName, void 0, { extraClasses: classNames2 });
    }
    this.element.appendChild($("span.attachment-additional-info", {}, `Pasted ${attachment.pastedLines}`));
    this.element.style.position = "relative";
    const sourceUri = attachment.copiedFrom?.uri;
    const hoverContent2 = new MarkdownString(`${sourceUri ? this.instantiationService.invokeFunction((accessor) => accessor.get(ILabelService).getUriLabel(sourceUri, { relative: true })) : attachment.fileName}

---

\`\`\`${attachment.language}

${attachment.code}
\`\`\``);
    this._register(this.hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: hoverContent2
    }, commonHoverLifecycleOptions));
    const copiedFromResource = attachment.copiedFrom?.uri;
    if (copiedFromResource) {
      this._register(this.instantiationService.invokeFunction(hookUpResourceAttachmentDragAndContextMenu, this.element, copiedFromResource));
      this.addResourceOpenHandlers(copiedFromResource, range2);
    } else if (isPastedTextArtifact(attachment)) {
      this.element.style.cursor = "pointer";
      this._register(registerOpenEditorListeners(this.element, async () => {
        await this.instantiationService.invokeFunction(openPastedTextArtifact, attachment);
      }));
    }
  }
};

PasteAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, IInstantiationService)
], PasteAttachmentWidget);

var DefaultChatAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, range2, attachment, correspondingContentReference, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, contextKeyService, instantiationService, hoverService, modelService, languageService, themeService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.themeService = themeService;
    this._tooltipHover = this._register(new MutableDisposable());
    const attachmentLabel = attachment.fullName ?? attachment.name;
    const description = correspondingContentReference?.options?.status?.description;
    const iconPath = isStringVariableEntry(attachment) || attachment.kind === "generic" ? attachment.iconPath : void 0;
    this._applyLabel(attachment, attachmentLabel, description, iconPath);
    if (iconPath && !ThemeIcon.isThemeIcon(iconPath) && !URI.isUri(iconPath)) {
      this._register(this.themeService.onDidColorThemeChange(() => this._applyLabel(attachment, attachmentLabel, description, iconPath)));
    }
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, attachment.name));
    if (attachment.kind === "diagnostic") {
      if (attachment.filterUri) {
        resource = attachment.filterUri ? URI.revive(attachment.filterUri) : void 0;
        range2 = attachment.filterRange;
      } else {
        this.element.style.cursor = "pointer";
        this._register(addDisposableListener(this.element, EventType.CLICK, () => {
          this.commandService.executeCommand("workbench.panel.markers.view.focus");
        }));
      }
    }
    if (attachment.kind === "symbol") {
      this._register(this.instantiationService.invokeFunction(hookUpSymbolAttachmentDragAndContextMenu, this.element, this.contextKeyService, { ...attachment, kind: attachment.symbolKind }, MenuId.ChatInputSymbolAttachmentContext));
    }
    if (isStringVariableEntry(attachment) && attachment.commandId) {
      this.element.style.cursor = "pointer";
      const contextItemHandle = attachment.handle;
      this._register(addDisposableListener(this.element, EventType.CLICK, async () => {
        const chatContextService = this.instantiationService.invokeFunction((accessor) => accessor.get(IChatContextService));
        await chatContextService.executeChatContextItemCommand(contextItemHandle);
      }));
    }
    if (attachment.kind === "debugEvents") {
      this.element.style.cursor = "pointer";
      this._register(addDisposableListener(this.element, EventType.CLICK, () => {
        const d = new Date(attachment.snapshotTime);
        const filter2 = `before:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
        this.commandService.executeCommand("workbench.action.chat.openAgentDebugPanelForSession", attachment.sessionResource, filter2);
      }));
    }
    if ((isStringVariableEntry(attachment) || attachment.kind === "generic") && attachment.tooltip) {
      this._setupTooltipHover(attachment.tooltip);
    }
    if (resource) {
      this.addResourceOpenHandlers(resource, range2);
    }
  }
  _applyLabel(attachment, attachmentLabel, description, iconPath) {
    if (isStringVariableEntry(attachment) && iconPath && ThemeIcon.isThemeIcon(iconPath) && (ThemeIcon.isFile(iconPath) || ThemeIcon.isFolder(iconPath)) && attachment.resourceUri) {
      const fileKind = ThemeIcon.isFolder(iconPath) ? 1 /* FOLDER */ : 0 /* FILE */;
      const iconClasses = getIconClasses(this.modelService, this.languageService, attachment.resourceUri, fileKind);
      this.label.setLabel(attachmentLabel, description, { extraClasses: iconClasses });
    } else if (iconPath) {
      const resolvedIcon = resolveChatContextIcon(iconPath, isDark(this.themeService.getColorTheme().type));
      this.label.setLabel(attachmentLabel, description, { iconPath: resolvedIcon });
    } else {
      const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
      this.label.setLabel(withIcon, description);
    }
  }
  _setupTooltipHover(tooltip) {
    this._tooltipHover.value = this.hoverService.setupDelayedHover(this.element, {
      content: tooltip,
      appearance: { showPointer: true }
    });
  }
};

DefaultChatAttachmentWidget = __decorateClass([
  __decorateParam(8, ICommandService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IInstantiationService),
  __decorateParam(13, IHoverService),
  __decorateParam(14, IModelService),
  __decorateParam(15, ILanguageService),
  __decorateParam(16, IThemeService)
], DefaultChatAttachmentWidget);

var PromptFileAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, labelService, instantiationService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.labelService = labelService;
    this.instantiationService = instantiationService;
    this.hintElement = append(this.element, $("span.prompt-type"));
    this.updateLabel(attachment);
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, attachment.value));
    });
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  updateLabel(attachment) {
    const resource = attachment.value;
    const fileBasename = basename(resource.path);
    const fileDirname = dirname(resource.path);
    const friendlyName = `${fileBasename} ${fileDirname}`;
    const isPrompt = attachment.id.startsWith("vscode.prompt.file" /* PromptFile */);
    const ariaLabel = isPrompt ? localize(9902, null, friendlyName) : localize(9894, null, friendlyName);
    const typeLabel = isPrompt ? localize(9910, null) : localize(9908, null);
    const title = this.labelService.getUriLabel(resource) + (attachment.originLabel ? `
${attachment.originLabel}` : "");
    this.element.classList.remove("warning", "error");
    const fileWithoutExtension = getCleanPromptName(resource);
    this.label.setFile(URI.file(fileWithoutExtension), {
      fileKind: 0 /* FILE */,
      hidePath: true,
      range: void 0,
      title,
      icon: ThemeIcon.fromId(Codicon.bookmark.id),
      extraClasses: []
    });
    this.hintElement.innerText = typeLabel;
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
  }
};

PromptFileAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IInstantiationService)
], PromptFileAttachmentWidget);

var PromptTextAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, preferencesService, hoverService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    if (attachment.settingId) {
      const openSettings2 = () => preferencesService.openSettings({ jsonEditor: false, query: `@id:${attachment.settingId}` });
      this.element.style.cursor = "pointer";
      this._register(addDisposableListener(this.element, EventType.CLICK, async (e) => {
        EventHelper.stop(e, true);
        openSettings2();
      }));
      this._register(addDisposableListener(this.element, EventType.KEY_DOWN, async (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
          EventHelper.stop(e, true);
          openSettings2();
        }
      }));
    }
    this.label.setLabel(localize(9909, null), void 0, void 0);
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, attachment.name));
    this._register(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: attachment.value
    }, commonHoverLifecycleOptions));
  }
};

PromptTextAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IPreferencesService),
  __decorateParam(9, IHoverService)
], PromptTextAttachmentWidget);

var ToolSetOrToolItemAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, toolsService, commandService, openerService, configurationService, hoverService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    const toolOrToolSet = Iterable.find(toolsService.getTools(currentLanguageModel?.metadata), (tool) => tool.id === attachment.id) ?? Iterable.find(toolsService.getToolSetsForModel(currentLanguageModel?.metadata), (toolSet) => toolSet.id === attachment.id);
    let name = attachment.name;
    const icon2 = attachment.icon ?? Codicon.tools;
    if (isToolSet(toolOrToolSet)) {
      name = toolOrToolSet.referenceName;
    } else if (toolOrToolSet) {
      name = toolOrToolSet.toolReferenceName ?? name;
    }
    this.label.setLabel(`$(${icon2.id})\xA0${name}`, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, name));
    let hoverContent2;
    if (isToolSet(toolOrToolSet)) {
      hoverContent2 = localize(9913, null, toolOrToolSet.description ?? toolOrToolSet.referenceName, toolOrToolSet.source.label);
    } else if (toolOrToolSet) {
      hoverContent2 = localize(9912, null, toolOrToolSet.userDescription ?? toolOrToolSet.modelDescription, toolOrToolSet.source.label);
    }
    if (hoverContent2) {
      this._register(hoverService.setupDelayedHover(this.element, {
        ...commonHoverOptions,
        content: hoverContent2
      }, commonHoverLifecycleOptions));
    }
  }
};

ToolSetOrToolItemAttachmentWidget = __decorateClass([
  __decorateParam(5, ILanguageModelToolsService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IHoverService)
], ToolSetOrToolItemAttachmentWidget);

var ChatReferenceAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    const title = attachment.name;
    const chatResource = attachment.value;
    this.label.setLabel(`$(${Codicon.commentDiscussion.id})\xA0${title}`, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = this.appendDeletionHint(localize(9855, null, title));
    this._register(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: localize(9856, null, title)
    }, commonHoverLifecycleOptions));
    this._register(addDisposableListener(this.element, EventType.CLICK, (e) => {
      EventHelper.stop(e, true);
      this._openReferencedChat(chatResource);
    }));
    this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        this._openReferencedChat(chatResource);
      }
    }));
  }
  async _openReferencedChat(chatResource) {
    const link2 = buildOpenSessionLinkForChatResource(chatResource);
    if (!link2) {
      return;
    }
    await this.openerService.open(link2);
  }
};

ChatReferenceAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IHoverService)
], ChatReferenceAttachmentWidget);

var TranscriptContextAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    const label3 = attachment.fullName ?? attachment.name;
    this.label.setLabel(attachment.icon ? `$(${attachment.icon.id})\xA0${label3}` : label3, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = this.appendDeletionHint(localize(9862, null, attachment.name));
    this._register(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: attachment.tooltip ?? localize(9863, null, attachment.name)
    }, commonHoverLifecycleOptions));
    this._register(registerOpenEditorListeners(this.element, async () => {
      await openTranscriptContextAttachment(this.openerService, attachment);
    }));
  }
};

TranscriptContextAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IHoverService)
], TranscriptContextAttachmentWidget);

function openTranscriptContextAttachment(openerService, attachment) {
  return openerService.open(attachment.uri, { openExternal: true });
}

var NotebookCellOutputChatAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(resource, attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, hoverService, languageModelsService, notebookService, instantiationService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.hoverService = hoverService;
    this.languageModelsService = languageModelsService;
    this.notebookService = notebookService;
    this.instantiationService = instantiationService;
    switch (attachment.mimeType) {
      case "application/vnd.code.notebook.error": {
        this.renderErrorOutput(resource, attachment);
        break;
      }
      case "image/png":
      case "image/jpeg":
      case "image/svg": {
        this.renderImageOutput(resource, attachment, options3.isCurrentInput === true);
        break;
      }
      default: {
        this.renderGenericOutput(resource, attachment);
      }
    }
    this.instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, resource));
    });
    this.addResourceOpenHandlers(resource, void 0);
  }
  getAriaLabel(attachment) {
    return localize(9895, null, attachment.name);
  }
  renderErrorOutput(resource, attachment) {
    const attachmentLabel = attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    const buffer = this.getOutputItem(resource, attachment)?.data.buffer ?? new Uint8Array();
    let title = void 0;
    try {
      const error = JSON.parse(new TextDecoder().decode(buffer));
      if (error.name && error.message) {
        title = `${error.name}: ${error.message}`;
      }
    } catch {
    }
    this.label.setLabel(withIcon, void 0, { title });
    this.element.ariaLabel = this.appendDeletionHint(this.getAriaLabel(attachment));
  }
  renderGenericOutput(resource, attachment) {
    this.element.ariaLabel = this.appendDeletionHint(this.getAriaLabel(attachment));
    this.label.setFile(resource, { hidePath: true, icon: ThemeIcon.fromId("output") });
  }
  renderImageOutput(resource, attachment, useCompactWarningIcon) {
    let ariaLabel;
    if (attachment.omittedState === 2 /* Full */) {
      ariaLabel = localize(9898, null, attachment.name);
    } else if (attachment.omittedState === 1 /* Partial */) {
      ariaLabel = localize(9901, null, attachment.name);
    } else {
      ariaLabel = this.getAriaLabel(attachment);
    }
    const clickHandler = async () => await this.openResource(resource, { editorOptions: { preserveFocus: true } }, false, void 0);
    const currentLanguageModelName = this.currentLanguageModel ? this.languageModelsService.lookupLanguageModel(this.currentLanguageModel.identifier)?.name ?? this.currentLanguageModel.identifier : void 0;
    const buffer = this.getOutputItem(resource, attachment)?.data.buffer ?? new Uint8Array();
    this._register(createImageElements(resource, attachment.name, attachment.name, this.element, buffer, attachment.id, this.hoverService, ariaLabel, currentLanguageModelName, clickHandler, this.currentLanguageModel, attachment.omittedState, useCompactWarningIcon));
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
  }
  getOutputItem(resource, attachment) {
    const parsedInfo = CellUri.parseCellOutputUri(resource);
    if (!parsedInfo || typeof parsedInfo.cellHandle !== "number" || typeof parsedInfo.outputIndex !== "number") {
      return void 0;
    }
    const notebook = this.notebookService.getNotebookTextModel(parsedInfo.notebook);
    if (!notebook) {
      return void 0;
    }
    const cell = notebook.cells.find((c) => c.handle === parsedInfo.cellHandle);
    if (!cell) {
      return void 0;
    }
    const output = cell.outputs.length > parsedInfo.outputIndex ? cell.outputs[parsedInfo.outputIndex] : void 0;
    return output?.outputs.find((o) => o.mime === attachment.mimeType);
  }
};

NotebookCellOutputChatAttachmentWidget = __decorateClass([
  __decorateParam(6, ICommandService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ILanguageModelsService),
  __decorateParam(11, INotebookService),
  __decorateParam(12, IInstantiationService)
], NotebookCellOutputChatAttachmentWidget);

var ElementChatAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, editorService, hoverService, fileService, logService, markdownRendererService, chatImageCarouselService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.editorService = editorService;
    this.hoverService = hoverService;
    this.fileService = fileService;
    this.logService = logService;
    this.markdownRendererService = markdownRendererService;
    this.chatImageCarouselService = chatImageCarouselService;
    const ariaLabel = localize(9874, null, attachment.name);
    this.element.ariaLabel = this.appendDeletionHint(ariaLabel);
    this.element.style.position = "relative";
    this.element.style.cursor = "pointer";
    const attachmentLabel = attachment.name;
    const withIcon = attachment.icon?.id ? `$(${attachment.icon.id})\xA0${attachmentLabel}` : attachmentLabel;
    this.label.setLabel(withIcon);
    this._register(this.hoverService.setupDelayedHover(this.element, this.getHoverContent(attachment), commonHoverLifecycleOptions));
    this._register(registerOpenEditorListeners(this.element, async () => {
      await this.openElementAttachment(attachment);
    }));
  }
  getHoverContent(attachment) {
    if (!this.shouldRenderRichElementHover(attachment)) {
      return this.getSimpleHoverContent(attachment);
    }
    const hoverElement = $("div.chat-attached-context-hover.chat-element-hover");
    const scrollableContent = $("div.chat-element-hover-content");
    const innerScrollables = [];
    if (attachment.imageData) {
      this.appendImagePreview(attachment, scrollableContent, () => scrollableElement.scanDomNode());
    }
    {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9877, null));
      section.appendChild(header2);
      const elementPre = $("pre.chat-element-hover-code");
      const elementCode = $("code");
      const tagDisplay = this.formatElementTag(attachment);
      elementCode.textContent = tagDisplay;
      elementPre.appendChild(elementCode);
      const elementScrollable = this._register(new DomScrollableElement(elementPre, {
        horizontal: 1 /* Auto */,
        vertical: 2 /* Hidden */
      }));
      innerScrollables.push(elementScrollable);
      section.appendChild(elementScrollable.getDomNode());
      scrollableContent.appendChild(section);
    }
    const computedStyleEntries = this.getComputedStyleEntriesForHover(attachment.computedStyles);
    if (computedStyleEntries.length > 0) {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9876, null));
      section.appendChild(header2);
      const table = $("div.chat-element-hover-table");
      for (const [name, value2] of computedStyleEntries) {
        const row = $("div.chat-element-hover-row");
        row.appendChild($("span.chat-element-hover-label", {}, `${name}:`));
        const valueContainer = $("span.chat-element-hover-value");
        if ((name === "color" || name === "background-color") && value2) {
          const swatch = $("span.chat-element-hover-color-swatch");
          swatch.style.backgroundColor = value2;
          valueContainer.appendChild(swatch);
        }
        valueContainer.appendChild(document.createTextNode(value2));
        row.appendChild(valueContainer);
        table.appendChild(row);
      }
      section.appendChild(table);
      const showMoreButton = $("button.chat-element-hover-show-more", { type: "button" }, localize(9883, null));
      this._register(addDisposableListener(showMoreButton, EventType.CLICK, async (e) => {
        EventHelper.stop(e, true);
        await this.openElementAttachment(attachment);
      }));
      section.appendChild(showMoreButton);
      scrollableContent.appendChild(section);
    }
    if (attachment.ancestors && attachment.ancestors.length > 1) {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9878, null));
      section.appendChild(header2);
      const lines = [];
      for (let i2 = 0; i2 < attachment.ancestors.length; i2++) {
        const ancestor = attachment.ancestors[i2];
        const indent = "  ".repeat(i2);
        const tag2 = this.formatAncestorTag(ancestor);
        lines.push(`${indent}${tag2}`);
      }
      const pathPre = $("pre.chat-element-hover-code");
      const pathCode = $("code");
      pathCode.textContent = lines.join("\n");
      pathPre.appendChild(pathCode);
      const pathScrollable = this._register(new DomScrollableElement(pathPre, {
        horizontal: 1 /* Auto */,
        vertical: 2 /* Hidden */
      }));
      innerScrollables.push(pathScrollable);
      section.appendChild(pathScrollable.getDomNode());
      scrollableContent.appendChild(section);
    }
    if (attachment.attributes && Object.keys(attachment.attributes).length > 0) {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9875, null));
      section.appendChild(header2);
      const table = $("div.chat-element-hover-table");
      for (const [name, value2] of Object.entries(attachment.attributes)) {
        const row = $("div.chat-element-hover-row");
        row.appendChild($("span.chat-element-hover-label", {}, `${name}:`));
        row.appendChild($("span.chat-element-hover-value", {}, value2));
        table.appendChild(row);
      }
      section.appendChild(table);
      scrollableContent.appendChild(section);
    }
    if (attachment.dimensions) {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9880, null));
      section.appendChild(header2);
      const table = $("div.chat-element-hover-table");
      const dims = [
        ["top:", attachment.dimensions.top],
        ["left:", attachment.dimensions.left],
        ["width:", attachment.dimensions.width],
        ["height:", attachment.dimensions.height]
      ];
      for (const [label3, val] of dims) {
        const row = $("div.chat-element-hover-row");
        row.appendChild($("span.chat-element-hover-label", {}, label3));
        row.appendChild($("span.chat-element-hover-value", {}, `${Math.round(val)}px`));
        table.appendChild(row);
      }
      section.appendChild(table);
      scrollableContent.appendChild(section);
    }
    if (attachment.innerText) {
      const section = $("div.chat-element-hover-section");
      const header2 = $("div.chat-element-hover-header", {}, localize(9879, null));
      section.appendChild(header2);
      section.appendChild($("div.chat-element-hover-text", {}, attachment.innerText));
      scrollableContent.appendChild(section);
    }
    const scrollableElement = this._register(new DomScrollableElement(scrollableContent, {
      vertical: 1 /* Auto */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    const scrollableDomNode = scrollableElement.getDomNode();
    scrollableDomNode.classList.add("chat-element-hover-scrollable");
    hoverElement.appendChild(scrollableDomNode);
    return {
      ...commonHoverOptions,
      content: hoverElement,
      additionalClasses: ["chat-element-data-hover"],
      onDidShow: () => {
        for (const s of innerScrollables) {
          s.scanDomNode();
        }
        scrollableElement.scanDomNode();
      }
    };
  }
  shouldRenderRichElementHover(attachment) {
    if (attachment.dimensions || attachment.innerText) {
      return true;
    }
    if (attachment.ancestors && attachment.ancestors.length > 0) {
      return true;
    }
    if (attachment.attributes && Object.keys(attachment.attributes).length > 0) {
      return true;
    }
    if (attachment.computedStyles && Object.keys(attachment.computedStyles).length > 0) {
      return true;
    }
    return false;
  }
  appendImagePreview(attachment, container3, onContentsChanged) {
    const section = $("div.chat-element-hover-section.chat-element-hover-screenshot");
    section.appendChild($("div.chat-element-hover-header", {}, localize(9881, null)));
    container3.appendChild(section);
    const previewDisposables = this._register(new DisposableStore());
    const appendPreview = (data) => {
      if (previewDisposables.isDisposed) {
        return;
      }
      const resource = URI.isUri(attachment.imageData) ? attachment.imageData : URI.from({ scheme: Schemas.data, path: `${attachment.id}/${encodeURIComponent(attachment.name)}` });
      const clickHandler = this.configurationService.getValue("imageCarousel.chat.enabled" /* ImageCarouselEnabled */) ? async () => this.chatImageCarouselService.openCarouselAtResource(resource, data) : void 0;
      const preview = createImageHoverContent(
        void 0,
        attachment.name,
        data,
        `${attachment.id}:screenshot`,
        onContentsChanged,
        clickHandler,
        void 0,
        localize(9882, null, attachment.name)
      );
      previewDisposables.add(preview.disposable);
      section.appendChild(preview.element);
    };
    const inlineData = coerceImageBuffer(attachment.imageData);
    if (inlineData) {
      appendPreview(inlineData);
    } else if (URI.isUri(attachment.imageData)) {
      void this.fileService.readFile(attachment.imageData).then(
        (content2) => appendPreview(content2.value.buffer),
        (error) => {
          this.logService.warn(`[ElementChatAttachmentWidget] Failed to read screenshot '${attachment.imageData}': ${toErrorMessage(error)}`);
          section.remove();
          onContentsChanged();
        }
      );
    }
  }
  getSimpleHoverContent(attachment) {
    const content2 = attachment.value?.toString() ?? "";
    const hoverContent2 = new MarkdownString();
    hoverContent2.appendText(attachment.fullName ?? attachment.name);
    if (content2.trim().length > 0) {
      hoverContent2.appendMarkdown("\n\n");
      hoverContent2.appendCodeblock("text", content2);
    }
    if (attachment.imageData) {
      const hoverElement = $("div.chat-attached-context-hover.chat-element-hover");
      const scrollableContent = $("div.chat-element-hover-content");
      this.appendImagePreview(attachment, scrollableContent, () => scrollableElement.scanDomNode());
      const markdownSection = $("div.chat-element-hover-section");
      const renderedMarkdown = this._register(this.markdownRendererService.render(hoverContent2));
      markdownSection.appendChild(renderedMarkdown.element);
      scrollableContent.appendChild(markdownSection);
      const scrollableElement = this._register(new DomScrollableElement(scrollableContent, {
        vertical: 1 /* Auto */,
        horizontal: 2 /* Hidden */,
        consumeMouseWheelIfScrollbarIsNeeded: true
      }));
      const scrollableDomNode = scrollableElement.getDomNode();
      scrollableDomNode.classList.add("chat-element-hover-scrollable");
      hoverElement.appendChild(scrollableDomNode);
      return {
        ...commonHoverOptions,
        content: hoverElement,
        additionalClasses: ["chat-element-data-hover"],
        onDidShow: () => scrollableElement.scanDomNode()
      };
    }
    return {
      ...commonHoverOptions,
      content: hoverContent2
    };
  }
  getComputedStyleEntriesForHover(computedStyles) {
    if (!computedStyles) {
      return [];
    }
    const keyEntries = [];
    for (const property of KEY_ELEMENT_HOVER_COMPUTED_STYLE_PROPERTIES) {
      if (property === "margin" || property === "padding") {
        const shorthand = this.getBoxShorthandValue(computedStyles, property);
        if (typeof shorthand === "string") {
          keyEntries.push([property, shorthand]);
          continue;
        }
      }
      const value2 = computedStyles[property];
      if (typeof value2 === "string") {
        keyEntries.push([property, value2]);
      }
    }
    if (keyEntries.length > 0) {
      return keyEntries;
    }
    return Object.entries(computedStyles).slice(0, KEY_ELEMENT_HOVER_COMPUTED_STYLE_PROPERTIES.length);
  }
  getBoxShorthandValue(computedStyles, propertyName) {
    const top2 = computedStyles[`${propertyName}-top`];
    const right = computedStyles[`${propertyName}-right`];
    const bottom = computedStyles[`${propertyName}-bottom`];
    const left = computedStyles[`${propertyName}-left`];
    if (typeof top2 === "string" && typeof right === "string" && typeof bottom === "string" && typeof left === "string") {
      return `${top2} ${right} ${bottom} ${left}`;
    }
    return computedStyles[propertyName];
  }
  async openElementAttachment(attachment) {
    const content2 = attachment.value?.toString() || "";
    await this.editorService.openEditor({
      resource: void 0,
      contents: content2,
      options: {
        pinned: true
      }
    });
  }
  formatElementTag(attachment) {
    const content2 = attachment.value?.toString() ?? "";
    const htmlMatch = content2.match(/\n\n(<[^>]+>)/);
    if (htmlMatch) {
      return htmlMatch[1];
    }
    const fallback2 = content2.match(/<([^>]+)>/);
    if (fallback2) {
      return `<${fallback2[1]}>`;
    }
    return `<${attachment.name}>`;
  }
  formatAncestorTag(ancestor) {
    const parts = [`<${ancestor.tagName}`];
    if (ancestor.classNames?.length) {
      parts.push(` class="${ancestor.classNames.join(" ")}"`);
    }
    if (ancestor.id) {
      parts.push(` id="${ancestor.id}"`);
    }
    return parts.join("") + ">";
  }
};

ElementChatAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IFileService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IMarkdownRendererService),
  __decorateParam(13, IChatImageCarouselService)
], ElementChatAttachmentWidget);

var SCMHistoryItemAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, markdownRendererService, hoverService, openerService, configurationService, themeService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.label.setLabel(attachment.name, void 0);
    this.element.style.cursor = "pointer";
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, attachment.name));
    const { content: content2, disposables } = toHistoryItemHoverContent(markdownRendererService, attachment.historyItem, false);
    this._store.add(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: content2
    }, commonHoverLifecycleOptions));
    this._store.add(disposables);
    this._store.add(addDisposableListener(this.element, EventType.CLICK, (e) => {
      EventHelper.stop(e, true);
      this._openAttachment(attachment);
    }));
    this._store.add(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        this._openAttachment(attachment);
      }
    }));
  }
  async _openAttachment(attachment) {
    await this.commandService.executeCommand("_workbench.openMultiDiffEditor", {
      title: getHistoryItemEditorTitle(attachment.historyItem),
      multiDiffSourceUri: attachment.value
    });
  }
};

SCMHistoryItemAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IMarkdownRendererService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IThemeService)
], SCMHistoryItemAttachmentWidget);

var SCMHistoryItemChangeAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, hoverService, markdownRendererService, openerService, configurationService, themeService, editorService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.editorService = editorService;
    const nameSuffix = `\xA0$(${Codicon.gitCommit.id})${attachment.historyItem.displayId ?? attachment.historyItem.id}`;
    this.label.setFile(attachment.value, { fileKind: 0 /* FILE */, hidePath: true, nameSuffix });
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, attachment.name));
    const { content: content2, disposables } = toHistoryItemHoverContent(markdownRendererService, attachment.historyItem, false);
    this._store.add(hoverService.setupDelayedHover(this.element, {
      ...commonHoverOptions,
      content: content2
    }, commonHoverLifecycleOptions));
    this._store.add(disposables);
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  async openResource(resource, options3, isDirectory, range2) {
    const attachment = this.attachment;
    const historyItem = attachment.historyItem;
    await this.editorService.openEditor({
      resource,
      label: `${basename(resource.path)} (${historyItem.displayId ?? historyItem.id})`,
      options: { ...options3.editorOptions }
    }, options3.openToSide ? SIDE_GROUP : void 0);
  }
};

SCMHistoryItemChangeAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IMarkdownRendererService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, IEditorService)
], SCMHistoryItemChangeAttachmentWidget);

var SCMHistoryItemChangeRangeAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(attachment, currentLanguageModel, options3, container3, contextResourceLabels, commandService, openerService, configurationService, editorService) {
    super(attachment, options3, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this.editorService = editorService;
    const historyItemStartId = attachment.historyItemChangeStart.historyItem.displayId ?? attachment.historyItemChangeStart.historyItem.id;
    const historyItemEndId = attachment.historyItemChangeEnd.historyItem.displayId ?? attachment.historyItemChangeEnd.historyItem.id;
    const nameSuffix = `\xA0$(${Codicon.gitCommit.id})${historyItemStartId}..${historyItemEndId}`;
    this.label.setFile(attachment.value, { fileKind: 0 /* FILE */, hidePath: true, nameSuffix });
    this.element.ariaLabel = this.appendDeletionHint(localize(9854, null, attachment.name));
    this.addResourceOpenHandlers(attachment.value, void 0);
  }
  async openResource(resource, options3, isDirectory, range2) {
    const attachment = this.attachment;
    const historyItemChangeStart = attachment.historyItemChangeStart;
    const historyItemChangeEnd = attachment.historyItemChangeEnd;
    const originalUriTitle = `${basename(historyItemChangeStart.uri.fsPath)} (${historyItemChangeStart.historyItem.displayId ?? historyItemChangeStart.historyItem.id})`;
    const modifiedUriTitle = `${basename(historyItemChangeEnd.uri.fsPath)} (${historyItemChangeEnd.historyItem.displayId ?? historyItemChangeEnd.historyItem.id})`;
    await this.editorService.openEditor({
      original: { resource: historyItemChangeStart.uri },
      modified: { resource: historyItemChangeEnd.uri },
      label: `${originalUriTitle} \u2194 ${modifiedUriTitle}`,
      options: { ...options3.editorOptions }
    }, options3.openToSide ? SIDE_GROUP : void 0);
  }
};

SCMHistoryItemChangeRangeAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IEditorService)
], SCMHistoryItemChangeRangeAttachmentWidget);

var BrowserViewAttachmentWidget = class extends AbstractChatAttachmentWidget {
  constructor(_attachment, currentLanguageModel, _options, container3, contextResourceLabels, commandService, openerService, configurationService, _browserViewService, _hoverService, _editorService, _instantiationService) {
    super(_attachment, _options, container3, contextResourceLabels, currentLanguageModel, commandService, openerService, configurationService);
    this._attachment = _attachment;
    this._options = _options;
    this._browserViewService = _browserViewService;
    this._hoverService = _hoverService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._inputListeners = this._register(new DisposableStore());
    this._resolveInput();
    this._register(this._browserViewService.onDidChangeBrowserViews(() => this._resolveInput()));
    this._register(this._browserViewService.onDidChangeSharingAvailable(() => this._updateLabel()));
    this._register(this._hoverService.setupDelayedHover(this.element, () => ({
      ...commonHoverOptions,
      content: this._input ? {
        ["shared" /* Shared */]: this._input.getTitle() ?? "",
        ["notShared" /* NotShared */]: localize(9872, null),
        ["unavailable" /* Unavailable */]: localize(9867, null)
      }[this._input.model?.sharingState ?? "shared" /* Shared */] : localize(9870, null)
    }), commonHoverLifecycleOptions));
    this._instantiationService.invokeFunction((accessor) => {
      this._register(hookUpResourceAttachmentDragAndContextMenu(accessor, this.element, _attachment.value));
    });
    this.addResourceOpenHandlers(_attachment.value, void 0);
  }
  /**
   * Look up the current BrowserEditorInput for this attachment's browser ID, bind listeners, and refresh the UI.
   */
  _resolveInput() {
    const input = this._browserViewService.getKnownBrowserViews().get(this._attachment.browserId);
    if (this._input === input) {
      return;
    }
    this._inputListeners.clear();
    this._input = input;
    if (input) {
      this._inputListeners.add(input.onWillDispose(() => {
        this._input = void 0;
        this._inputListeners.clear();
        this._updateLabel();
      }));
      if (this._options.supportsDeletion) {
        this._inputListeners.add(input.onDidChangeLabel(() => this._updateLabel()));
      }
      if (input.model) {
        this._inputListeners.add(input.model.onDidChangeSharingState(() => this._updateLabel()));
      } else {
        this._inputListeners.add(input.onDidResolveModel(() => {
          this._inputListeners.add(input.model.onDidChangeSharingState(() => this._updateLabel()));
          this._updateLabel();
        }));
      }
    }
    this._updateLabel();
  }
  _updateLabel() {
    const name = this._input?.getName() ?? this._attachment.name;
    const sharingState = this._input?.model?.sharingState ?? "shared" /* Shared */;
    const isAvailable = !!this._input && sharingState === "shared" /* Shared */;
    this.element.classList.toggle("warning", !isAvailable);
    this.label.setLabel(name, void 0, {
      iconPath: Codicon.globe,
      strikethrough: !isAvailable
    });
    this.element.ariaLabel = this.appendDeletionHint(
      this._input ? {
        ["shared" /* Shared */]: localize(9869, null, name),
        ["notShared" /* NotShared */]: localize(9873, null, name),
        ["unavailable" /* Unavailable */]: localize(9868, null, name)
      }[sharingState] : localize(9871, null, name)
    );
  }
  async openResource(_resource, options3, _isDirectory, _range) {
    if (this._input) {
      await this._editorService.openEditor(this._input, options3.editorOptions, options3.openToSide ? SIDE_GROUP : void 0);
    }
  }
};

BrowserViewAttachmentWidget = __decorateClass([
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IBrowserViewWorkbenchService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IInstantiationService)
], BrowserViewAttachmentWidget);

function hookUpResourceAttachmentDragAndContextMenu(accessor, widget, resource) {
  const contextKeyService = accessor.get(IContextKeyService);
  const instantiationService = accessor.get(IInstantiationService);
  const store = new DisposableStore();
  const scopedContextKeyService = store.add(contextKeyService.createScoped(widget));
  setResourceContext(accessor, scopedContextKeyService, resource);
  widget.draggable = true;
  store.add(addDisposableListener(widget, "dragstart", (e) => {
    instantiationService.invokeFunction((accessor2) => fillEditorsDragData(accessor2, [resource], e));
    e.dataTransfer?.setDragImage(widget, 0, 0);
  }));
  store.add(addBasicContextMenu(accessor, widget, scopedContextKeyService, MenuId.ChatInputResourceAttachmentContext, resource));
  return store;
}

function hookUpSymbolAttachmentDragAndContextMenu(accessor, widget, parentContextKeyService, attachment, contextMenuId) {
  const instantiationService = accessor.get(IInstantiationService);
  const languageFeaturesService = accessor.get(ILanguageFeaturesService);
  const textModelService = accessor.get(ITextModelService);
  const contextMenuService = accessor.get(IContextMenuService);
  const menuService = accessor.get(IMenuService);
  const store = new DisposableStore();
  widget.draggable = true;
  store.add(addDisposableListener(widget, "dragstart", (e) => {
    instantiationService.invokeFunction((accessor2) => fillEditorsDragData(accessor2, [{ resource: attachment.value.uri, selection: attachment.value.range }], e));
    fillInSymbolsDragData([{
      fsPath: attachment.value.uri.fsPath,
      range: attachment.value.range,
      name: attachment.name,
      kind: attachment.kind
    }], e);
    e.dataTransfer?.setDragImage(widget, 0, 0);
  }));
  let scopedContextKeyService;
  let providerContexts;
  const ensureContextKeyService = () => {
    if (!scopedContextKeyService) {
      scopedContextKeyService = store.add(parentContextKeyService.createScoped(widget));
      chatAttachmentResourceContextKey.bindTo(scopedContextKeyService).set(attachment.value.uri.toString());
      instantiationService.invokeFunction((accessor2) => setResourceContext(accessor2, scopedContextKeyService, attachment.value.uri));
    }
    return scopedContextKeyService;
  };
  const ensureProviderContexts = () => {
    const cks = ensureContextKeyService();
    if (!providerContexts) {
      providerContexts = [
        [EditorContextKeys.hasDefinitionProvider.bindTo(cks), languageFeaturesService.definitionProvider],
        [EditorContextKeys.hasReferenceProvider.bindTo(cks), languageFeaturesService.referenceProvider],
        [EditorContextKeys.hasImplementationProvider.bindTo(cks), languageFeaturesService.implementationProvider],
        [EditorContextKeys.hasTypeDefinitionProvider.bindTo(cks), languageFeaturesService.typeDefinitionProvider]
      ];
    }
  };
  const updateContextKeys = async () => {
    ensureProviderContexts();
    const modelRef = await textModelService.createModelReference(attachment.value.uri);
    try {
      const model = modelRef.object.textEditorModel;
      for (const [contextKey, registry4] of providerContexts) {
        contextKey.set(registry4.has(model));
      }
    } finally {
      modelRef.dispose();
    }
  };
  store.add(addDisposableListener(widget, EventType.CONTEXT_MENU, async (domEvent) => {
    const event = new StandardMouseEvent(getWindow(domEvent), domEvent);
    EventHelper.stop(domEvent, true);
    const cks = ensureContextKeyService();
    try {
      await updateContextKeys();
    } catch (e) {
      console.error(e);
    }
    contextMenuService.showContextMenu({
      contextKeyService: cks,
      getAnchor: () => event,
      getActions: () => {
        const menu = menuService.getMenuActions(contextMenuId, cks, { arg: attachment.value });
        return getFlatContextMenuActions(menu);
      }
    });
  }));
  return store;
}

function setResourceContext(accessor, scopedContextKeyService, resource) {
  const fileService = accessor.get(IFileService);
  const languageService = accessor.get(ILanguageService);
  const modelService = accessor.get(IModelService);
  const resourceContextKey = new StaticResourceContextKey(scopedContextKeyService, fileService, languageService, modelService);
  resourceContextKey.set(resource);
}

function addBasicContextMenu(accessor, widget, scopedContextKeyService, menuId, arg, updateContextKeys) {
  const contextMenuService = accessor.get(IContextMenuService);
  const menuService = accessor.get(IMenuService);
  return addDisposableListener(widget, EventType.CONTEXT_MENU, async (domEvent) => {
    const event = new StandardMouseEvent(getWindow(domEvent), domEvent);
    EventHelper.stop(domEvent, true);
    try {
      await updateContextKeys?.();
    } catch (e) {
      console.error(e);
    }
    contextMenuService.showContextMenu({
      contextKeyService: scopedContextKeyService,
      getAnchor: () => event,
      getActions: () => {
        const menu = menuService.getMenuActions(menuId, scopedContextKeyService, { arg });
        return getFlatContextMenuActions(menu);
      }
    });
  });
}

var chatAttachmentResourceContextKey = new RawContextKey("chatAttachmentResource", void 0, { type: "URI", description: localize(9911, null) });
export { modelSupportsVision, getEffectiveImageOmittedState, createTerminalCommandElements, getHoverContent, createImageHoverContent, createImageElements, openPastedTextArtifact, openTranscriptContextAttachment, hookUpResourceAttachmentDragAndContextMenu, hookUpSymbolAttachmentDragAndContextMenu, setResourceContext, addBasicContextMenu, commonHoverOptions, commonHoverLifecycleOptions, KEY_ELEMENT_HOVER_COMPUTED_STYLE_PROPERTIES, AbstractChatAttachmentWidget, FileAttachmentWidget, TerminalCommandAttachmentWidget, ImageAttachmentWidget, PasteAttachmentWidget, DefaultChatAttachmentWidget, PromptFileAttachmentWidget, PromptTextAttachmentWidget, ToolSetOrToolItemAttachmentWidget, ChatReferenceAttachmentWidget, TranscriptContextAttachmentWidget, NotebookCellOutputChatAttachmentWidget, ElementChatAttachmentWidget, SCMHistoryItemAttachmentWidget, SCMHistoryItemChangeAttachmentWidget, SCMHistoryItemChangeRangeAttachmentWidget, BrowserViewAttachmentWidget, chatAttachmentResourceContextKey };
