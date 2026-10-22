// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAttachmentsContentPart.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, addDisposableListener, clearNode } from "./module-0075.mjs";
import { ResourceLabels } from "./module-1322.mjs";
import { getImageAttachmentLimit, isAgentHostCompletionVariableEntry, isBrowserViewVariableEntry, isElementVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemChangeRangeVariableEntry, isSCMHistoryItemChangeVariableEntry, isSCMHistoryItemVariableEntry, isTerminalVariableEntry, isWorkspaceVariableEntry } from "./module-0980.mjs";
import { ILanguageModelsService, isAutoLanguageModel } from "./module-0968.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { basename } from "./module-0026.mjs";
import { BrowserViewAttachmentWidget, DefaultChatAttachmentWidget, ElementChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, NotebookCellOutputChatAttachmentWidget, PasteAttachmentWidget, PromptFileAttachmentWidget, PromptTextAttachmentWidget, SCMHistoryItemAttachmentWidget, SCMHistoryItemChangeAttachmentWidget, SCMHistoryItemChangeRangeAttachmentWidget, TerminalCommandAttachmentWidget, ToolSetOrToolItemAttachmentWidget } from "./module-2027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatAttachmentWidgetRegistry } from "./module-2028.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAttachmentsContentPart.ts
var ChatAttachmentsContentPart = class extends Disposable {
  constructor(options3, instantiationService, languageModelsService, chatAttachmentWidgetRegistry) {
    super();
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.chatAttachmentWidgetRegistry = chatAttachmentWidgetRegistry;
    this.attachedContextDisposables = this._register(new DisposableStore());
    this._onDidChangeVisibility = this._register(new Emitter());
    this._showingAll = false;
    this._variables = options3.variables;
    this.contentReferences = options3.contentReferences ?? [];
    this.modelId = options3.modelId;
    this.resolvedModelId = options3.resolvedModelId;
    this.limit = options3.limit;
    this.showImageInHover = options3.showImageInHover ?? true;
    this.domNode = options3.domNode ?? $(".chat-attached-context");
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this.initAttachedContext(this.domNode);
    if (!this.domNode.childElementCount) {
      this.domNode = void 0;
    }
  }
  /**
   * Update the variables and re-render the attachments in place.
   */
  updateVariables(variables) {
    this._variables = variables;
    if (this.domNode) {
      this.initAttachedContext(this.domNode);
    }
  }
  initAttachedContext(container2) {
    clearNode(container2);
    this.attachedContextDisposables.clear();
    const renderableAttachments = this.getRenderableAttachments();
    const visibleAttachments = this.getVisibleAttachments(renderableAttachments);
    const remainingCount = renderableAttachments.length - visibleAttachments.length;
    const hasMoreAttachments = remainingCount > 0 && !this._showingAll;
    this.markImageLimitExceeded(this._variables);
    for (const attachment of visibleAttachments) {
      this.renderAttachment(attachment, container2);
    }
    if (hasMoreAttachments) {
      this.renderShowMoreButton(container2, remainingCount);
    }
  }
  getRenderableAttachments() {
    return this._variables.filter((attachment) => !isAgentHostCompletionVariableEntry(attachment));
  }
  getVisibleAttachments(visibleAttachments) {
    if (!this.limit || this._showingAll) {
      return visibleAttachments;
    }
    return visibleAttachments.slice(0, this.limit);
  }
  currentModelDoesNotSupportImages() {
    const model = this.getCurrentLanguageModel();
    return !!model && !isAutoLanguageModel(model) && model.metadata.capabilities?.vision === false;
  }
  /**
   * When the total number of image attachments exceeds the model-specific
   * per-request limit, mark the oldest images (those dropped by the backend)
   * with {@link OmittedState.ImageLimitExceeded}.
   */
  markImageLimitExceeded(attachments) {
    const imageAttachments = attachments.filter(isImageVariableEntry);
    const maxImagesPerRequest = this.getImageLimitForCurrentModel();
    if (maxImagesPerRequest === void 0) {
      return;
    }
    if (imageAttachments.length <= maxImagesPerRequest) {
      for (const attachment of imageAttachments) {
        if (attachment.omittedState === 3 /* ImageLimitExceeded */) {
          attachment.omittedState = 0 /* NotOmitted */;
        }
      }
      return;
    }
    const excessCount = imageAttachments.length - maxImagesPerRequest;
    for (let i2 = 0; i2 < excessCount; i2++) {
      if (imageAttachments[i2].omittedState === 0 /* NotOmitted */ || imageAttachments[i2].omittedState === 3 /* ImageLimitExceeded */) {
        imageAttachments[i2].omittedState = 3 /* ImageLimitExceeded */;
      }
    }
    for (let i2 = excessCount; i2 < imageAttachments.length; i2++) {
      if (imageAttachments[i2].omittedState === 3 /* ImageLimitExceeded */) {
        imageAttachments[i2].omittedState = 0 /* NotOmitted */;
      }
    }
  }
  getImageLimitForCurrentModel() {
    return getImageAttachmentLimit(this.getCurrentLanguageModel()?.metadata);
  }
  getCurrentLanguageModel() {
    const selectedMetadata = this.modelId ? this.languageModelsService.lookupLanguageModel(this.modelId) : void 0;
    if (!this.resolvedModelId) {
      return this.modelId && selectedMetadata ? { identifier: this.modelId, metadata: selectedMetadata } : void 0;
    }
    const directMetadata = this.languageModelsService.lookupLanguageModel(this.resolvedModelId);
    if (directMetadata) {
      return { identifier: this.resolvedModelId, metadata: directMetadata };
    }
    for (const identifier2 of this.languageModelsService.getLanguageModelIds()) {
      const metadata = this.languageModelsService.lookupLanguageModel(identifier2);
      if (metadata?.id === this.resolvedModelId && (!selectedMetadata || metadata.vendor === selectedMetadata.vendor)) {
        return { identifier: identifier2, metadata };
      }
    }
    return void 0;
  }
  renderShowMoreButton(container2, remainingCount) {
    const showMoreButton = $("div.chat-attached-context-attachment.chat-attachments-show-more-button");
    showMoreButton.setAttribute("role", "button");
    showMoreButton.setAttribute("tabindex", "0");
    showMoreButton.style.cursor = "pointer";
    const pillIcon = $("div.chat-attached-context-pill", {}, $("span.codicon.codicon-ellipsis"));
    const textLabel = $("span.chat-attached-context-custom-text");
    textLabel.textContent = `${remainingCount} more`;
    showMoreButton.appendChild(pillIcon);
    showMoreButton.appendChild(textLabel);
    const clickHandler = () => {
      this._showingAll = true;
      this.initAttachedContext(container2);
    };
    this.attachedContextDisposables.add(addDisposableListener(showMoreButton, "click", clickHandler));
    this.attachedContextDisposables.add(addDisposableListener(showMoreButton, "keydown", (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        clickHandler();
      }
    }));
    container2.appendChild(showMoreButton);
    this.attachedContextDisposables.add({ dispose: () => showMoreButton.remove() });
  }
  renderAttachment(attachment, container2) {
    const resource = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
    const range2 = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range2.isIRange(attachment.value.range) ? attachment.value.range : void 0;
    const correspondingContentReference = this.contentReferences.find((ref) => typeof ref.reference === "object" && "variableName" in ref.reference && ref.reference.variableName === attachment.name || URI.isUri(ref.reference) && basename(ref.reference.path) === attachment.name);
    const isAttachmentOmitted = correspondingContentReference?.options?.status?.kind === 3 /* Omitted */;
    const isAttachmentPartialOrOmitted = isAttachmentOmitted || correspondingContentReference?.options?.status?.kind === 2 /* Partial */;
    let widget;
    if (attachment.kind === "tool" || attachment.kind === "toolset") {
      widget = this.instantiationService.createInstance(ToolSetOrToolItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isElementVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(ElementChatAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isImageVariableEntry(attachment)) {
      const renderedAttachment = isAttachmentPartialOrOmitted || this.currentModelDoesNotSupportImages() ? { ...attachment, omittedState: 2 /* Full */ } : attachment;
      widget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, renderedAttachment, this.getCurrentLanguageModel(), { shouldFocusClearButton: false, supportsDeletion: false, showImageInHover: this.showImageInHover }, container2, this._contextResourceLabels);
    } else if (isPromptFileVariableEntry(attachment)) {
      if (attachment.automaticallyAdded) {
        return;
      }
      widget = this.instantiationService.createInstance(PromptFileAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isPromptTextVariableEntry(attachment)) {
      if (attachment.automaticallyAdded) {
        return;
      }
      widget = this.instantiationService.createInstance(PromptTextAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
      widget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range2, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isTerminalVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(TerminalCommandAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isPasteVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (resource && isNotebookOutputVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(NotebookCellOutputChatAttachmentWidget, resource, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isSCMHistoryItemVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isSCMHistoryItemChangeVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemChangeAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isSCMHistoryItemChangeRangeVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(SCMHistoryItemChangeRangeAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isBrowserViewVariableEntry(attachment)) {
      widget = this.instantiationService.createInstance(BrowserViewAttachmentWidget, attachment, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    } else if (isWorkspaceVariableEntry(attachment)) {
      return;
    } else {
      widget = this.chatAttachmentWidgetRegistry.createWidget(attachment, { shouldFocusClearButton: false, supportsDeletion: false }, container2) ?? this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range2, attachment, correspondingContentReference, void 0, { shouldFocusClearButton: false, supportsDeletion: false }, container2, this._contextResourceLabels);
    }
    let ariaLabel = null;
    if (isAttachmentPartialOrOmitted) {
      widget.element.classList.add("warning");
    }
    const description = correspondingContentReference?.options?.status?.description;
    if (isAttachmentPartialOrOmitted) {
      ariaLabel = `${ariaLabel}${description ? ` ${description}` : ""}`;
      for (const selector of [".monaco-icon-suffix-container", ".monaco-icon-name-container"]) {
        const element = widget.label?.element.querySelector(selector);
        if (element) {
          element.classList.add("warning");
        }
      }
    }
    this._register(addDisposableListener(widget.element, "contextmenu", (e4) => this.contextMenuHandler?.(attachment, e4)));
    if (this.attachedContextDisposables.isDisposed) {
      widget.dispose();
      return;
    }
    if (ariaLabel) {
      widget.element.ariaLabel = ariaLabel;
    }
    this.attachedContextDisposables.add(widget);
  }
};

ChatAttachmentsContentPart = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, IChatAttachmentWidgetRegistry)
], ChatAttachmentsContentPart);
export { ChatAttachmentsContentPart };
