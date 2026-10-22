// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorChatFeatures.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IEditorService } from "./module-0935.mjs";
import { BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_HAS_ERROR, CONTEXT_BROWSER_HAS_URL } from "./module-4159.mjs";
import { AccessibleContentProvider, IAccessibleViewService } from "./module-0799.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { WorkbenchHoverDelegate } from "./module-0520.mjs";
import { $ } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatPetAchievementIds, shouldUnlockChatPetIntegratedBrowserShare } from "./module-2111.mjs";
import { URI } from "./module-0032.mjs";
import { Event2 } from "./module-0017.mjs";
import { safeSetInnerHtml } from "./module-0466.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatDynamicVariableModel } from "./module-0985.mjs";
import { Range2 } from "./module-0106.mjs";
import { toAttachedContextDynamicVariable } from "./module-0984.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatService } from "./module-0973.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { Extensions14, workbenchConfigurationNodeBase } from "./module-1113.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorChatFeatures.ts
var BrowserSendElementsToChatAttachImagesSettingId = "workbench.browser.sendElementsToChat.attachImages";

function formatElementPath(ancestors) {
  if (!ancestors || ancestors.length === 0) {
    return void 0;
  }
  return ancestors.map((ancestor) => {
    const classes2 = ancestor.classNames?.length ? `.${ancestor.classNames.join(".")}` : "";
    const id2 = ancestor.id ? `#${ancestor.id}` : "";
    return `${ancestor.tagName}${id2}${classes2}`;
  }).join(" > ");
}

function createElementContextValue(elementData, displayName) {
  const sections = [];
  sections.push("Attached Element Context from Integrated Browser");
  sections.push(`Element: ${displayName}`);
  if (elementData.url) {
    sections.push(`URL: ${elementData.url}`);
  }
  const htmlPath = formatElementPath(elementData.ancestors);
  if (htmlPath) {
    sections.push(`HTML Path: ${htmlPath}`);
  }
  sections.push(`Outer HTML:
\`\`\`html
${elementData.outerHTML}
\`\`\``);
  if (elementData.dimensions) {
    const { top: top2, left, width: width2, height } = elementData.dimensions;
    sections.push(
      `Dimensions:
- top: ${Math.round(top2)}px
- left: ${Math.round(left)}px
- width: ${Math.round(width2)}px
- height: ${Math.round(height)}px`
    );
  }
  sections.push(`CSS:
\`\`\`css
${elementData.computedStyle}
\`\`\``);
  return sections.join("\n\n");
}

var BROWSER_EDITOR_ACTIVE2 = ContextKeyExpr.equals("activeEditor", BrowserEditorInput.EDITOR_ID);

var BrowserCategory = localize2(8045, "Browser");

var CONTEXT_BROWSER_ELEMENT_SELECTION_MODE = new RawContextKey("browserElementSelectionMode", void 0, localize(8037, null));

var CONTEXT_BROWSER_AREA_SELECTION_ACTIVE = new RawContextKey("browserAreaSelectionActive", false, localize(8025, null));

var BrowserElementCommentingAccessibilityHelp = class {
  constructor() {
    this.type = "help" /* Help */;
    this.priority = 110;
    this.name = "browserElementCommenting";
    this.when = CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.isEqualTo("comment" /* Comment */);
  }
  getProvider(accessor) {
    const editorPane = accessor.get(IEditorService).activeEditorPane;
    if (!(editorPane instanceof BrowserEditor)) {
      return void 0;
    }
    return new AccessibleContentProvider(
      "browserElementCommenting" /* BrowserElementCommenting */,
      { type: "help" /* Help */ },
      () => [
        localize(8030, null),
        localize(8029, null),
        localize(8027, null),
        localize(8028, null),
        localize(8031, null)
      ].join("\n"),
      () => editorPane.focus(),
      "accessibility.verbosity.browserElementCommenting" /* BrowserElementCommenting */
    );
  }
};

AccessibleViewRegistry.register(new BrowserElementCommentingAccessibilityHelp());

var BrowserEditorChatIntegration = class extends BrowserEditorContribution {
  constructor(editor, contextKeyService, instantiationService, telemetryService, logService, chatWidgetService, chatService, configurationService, dialogService, storageService, workspaceTrustManagementService, accessibilityService, accessibleViewService, chatPetService) {
    super(editor);
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.storageService = storageService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.accessibilityService = accessibilityService;
    this.accessibleViewService = accessibleViewService;
    this.chatPetService = chatPetService;
    this._commentReferences = /* @__PURE__ */ new Map();
    this._commentReferenceListeners = this._register(new DisposableMap());
    this._commentModelListeners = this._register(new DisposableMap());
    this._disposedCommentModels = /* @__PURE__ */ new WeakSet();
    this._commentSessionsWithComments = /* @__PURE__ */ new Set();
    this._elementSelectionModeContext = CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.bindTo(contextKeyService);
    this._areaSelectionActiveContext = CONTEXT_BROWSER_AREA_SELECTION_ACTIVE.bindTo(contextKeyService);
    const hoverDelegate = this._register(instantiationService.createInstance(
      WorkbenchHoverDelegate,
      "element",
      void 0,
      { position: { hoverPosition: 3 /* ABOVE */ } }
    ));
    this._shareButtonContainer = $(".browser-share-toggle-container");
    this._shareButton = this._register(new Button(this._shareButtonContainer, {
      supportIcons: true,
      title: localize(8040, null),
      small: true,
      hoverDelegate
    }));
    this._shareButton.element.classList.add("browser-share-toggle");
    this._shareButton.label = "$(share-window)";
    this._register(this._shareButton.onDidClick(() => {
      void this._toggleShareWithAgent();
    }));
    this._register(this.chatService.onDidSubmitRequest((event) => {
      if (this.editor.model?.elementSelectionState.active) {
        void this.editor.model.toggleElementSelection(false);
      }
      const submittedComments = [...this._commentReferences].filter(([, reference]) => reference.widget.viewModel && isEqual2(reference.widget.viewModel.sessionResource, event.chatSessionResource));
      if (submittedComments.length > 0) {
        const browserModels = new Set(submittedComments.map(([, reference]) => reference.browserModel));
        const widgets2 = new Set(submittedComments.map(([, reference]) => reference.widget));
        for (const [attachmentId] of submittedComments) {
          this._commentReferences.delete(attachmentId);
        }
        for (const widget of widgets2) {
          this._disposeCommentReferenceListenerIfUnused(widget);
        }
        for (const browserModel of browserModels) {
          this._syncElementComments(browserModel);
          this._disposeCommentModelListenerIfUnused(browserModel);
        }
      }
    }));
  }
  get widgets() {
    return [{ location: "postUrl" /* PostUrl */, element: this._shareButtonContainer, order: 50 }];
  }
  onModelAttached(model, store) {
    this._updateSharingState(true);
    store.add(model.onDidChangeSharingState(() => {
      this._updateSharingState(false);
    }));
    store.add(model.onDidSelectElement(async (data) => {
      const tracksComment = data.comment !== void 0 && data.elementId !== void 0;
      if (tracksComment) {
        this._ensureCommentModelListeners(model);
      }
      let attached = false;
      try {
        attached = await this._attachElementDataToChat(data, model);
      } catch (error) {
        this.logService.error("BrowserEditor.addElementToChat: Failed to attach element", error);
      }
      if (!attached && data.comment !== void 0 && data.elementId && !this._disposedCommentModels.has(model)) {
        this._syncElementComments(model, [data.elementId]);
      }
      if (tracksComment) {
        this._disposeCommentModelListenerIfUnused(model);
      }
    }));
    this._elementSelectionMode = model.elementSelectionState.active ? model.elementSelectionState.options.mode : void 0;
    this._elementSelectionModeContext.set(this._elementSelectionMode);
    store.add(model.onDidChangeElementSelectionState((state) => {
      const wasCommenting = this._elementSelectionMode === "comment" /* Comment */;
      this._elementSelectionMode = state.active ? state.options.mode : void 0;
      this._elementSelectionModeContext.set(this._elementSelectionMode);
      const isCommenting = this._elementSelectionMode === "comment" /* Comment */;
      const accessibilityHelpHint = isCommenting && state.active ? this.accessibleViewService.getOpenAriaHint("accessibility.verbosity.browserElementCommenting" /* BrowserElementCommenting */) : void 0;
      this.accessibilityService.status(isCommenting ? state.active ? accessibilityHelpHint ? localize(8034, null, accessibilityHelpHint) : localize(8033, null) : localize(8032, null) : state.active ? localize(8036, null) : localize(8035, null));
      if (isCommenting && !wasCommenting) {
        this._commentSessionsWithComments.delete(model);
      } else if (wasCommenting && !isCommenting && this._commentSessionsWithComments.delete(model)) {
        this._focusChatInputForComments(model);
      }
    }));
    this._areaSelectionActiveContext.set(model.isAreaSelectionActive);
    store.add(model.onDidChangeAreaSelectionActive((active) => {
      this._areaSelectionActiveContext.set(active);
    }));
  }
  onModelDetached() {
    if (this.editor.model) {
      this._commentSessionsWithComments.delete(this.editor.model);
    }
    this._elementSelectionModeContext.reset();
    this._elementSelectionMode = void 0;
    this._areaSelectionActiveContext.reset();
  }
  // -- Sharing -------------------------------------------------------
  async _toggleShareWithAgent() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    const shared = model.sharingState !== "shared" /* Shared */;
    let succeeded;
    try {
      succeeded = await model.setSharedWithAgent(shared);
    } catch (error) {
      this.logService.error("BrowserEditor.toggleShareWithAgent: Failed to update sharing state", error);
      return;
    }
    if (shouldUnlockChatPetIntegratedBrowserShare(shared, succeeded)) {
      this.chatPetService.unlockAchievement(ChatPetAchievementIds.IntegratedBrowserShared);
    }
  }
  _updateSharingState(isInitialState) {
    const model = this.editor.model;
    const isShared = model?.sharingState === "shared" /* Shared */;
    const isUnavailable = !model || model.sharingState === "unavailable" /* Unavailable */;
    this.editor.browserContainer.classList.toggle("animate", !isInitialState);
    this.editor.browserContainer.classList.toggle("shared", isShared);
    this._shareButtonContainer.style.display = isUnavailable ? "none" : "";
    this._shareButton.checked = isShared;
    this._shareButton.label = isShared ? localize(8041, null) + " $(share-window)" : "$(share-window)";
    const title = isShared ? localize(8043, null) : localize(8040, null);
    this._shareButton.setTitle(title);
    this._shareButton.element.setAttribute("aria-label", title);
  }
  static {
    this.SHARING_CONTENT_WARNING_DONT_ASK_KEY = "browserView.agentSharingContentWarning.dontAskAgain";
  }
  /**
   * Confirm with the user that they understand the risks of sharing content on untrusted pages.
   *
   * @returns true if the user confirms (or the page is local / trusted), false if they cancel.
   */
  async _confirmContentAttachmentRisk(url) {
    if (this.storageService.getBoolean(BrowserEditorChatIntegration.SHARING_CONTENT_WARNING_DONT_ASK_KEY, 0 /* PROFILE */)) {
      return true;
    }
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === "file:") {
        const trustInfo = await this.workspaceTrustManagementService.getUriTrustInfo(URI.file(parsedUrl.pathname));
        if (trustInfo.trusted) {
          return true;
        }
      } else if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1" || parsedUrl.hostname === "::1") {
        return true;
      }
    } catch {
    }
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localize(8023, null),
      detail: localize(8021, null),
      primaryButton: localize(8024, null),
      checkbox: { label: localize(8022, null), checked: false }
    });
    if (result.confirmed && result.checkboxChecked) {
      this.storageService.store(BrowserEditorChatIntegration.SHARING_CONTENT_WARNING_DONT_ASK_KEY, true, 0 /* PROFILE */, 0 /* USER */);
    }
    return result.confirmed;
  }
  // -- Chat widget helpers --------------------------------------------
  /**
   * Reveal the chat widget and wait for its viewModel to be bound before
   * returning. When the chat panel is opened for the first time the session
   * model loads asynchronously, and once it loads {@link ChatInputPart}'s
   * `_syncFromModel` clears any attachments that were added before the model
   * was bound. Callers must use this helper before calling
   * {@linkcode IChatWidget.attachmentModel.addContext} so the attachment is
   * not silently discarded.
   */
  async _revealChatWidgetForAttachment(preserveFocus = false) {
    const widget = await this.chatWidgetService.revealWidget(preserveFocus) ?? this.chatWidgetService.lastFocusedWidget;
    if (widget && !widget.viewModel) {
      await Event2.toPromise(widget.onDidChangeViewModel);
    }
    return widget;
  }
  /**
   * Reveal the chat widget and attach the given entries. Returns false if no widget was available.
   * Callers are responsible for running {@link _confirmContentAttachmentRisk} first.
   */
  async _attachToChat(entries2) {
    const widget = await this._revealChatWidgetForAttachment();
    if (!widget?.attachmentModel) {
      return false;
    }
    widget.attachmentModel.addContext(...entries2);
    return true;
  }
  // -- Element Selection ----------------------------------------------
  async _attachElementDataToChat(elementData, model) {
    const bounds = elementData.bounds;
    const toAttach = [];
    const container2 = document.createElement("div");
    safeSetInnerHtml(container2, elementData.outerHTML);
    const element = container2.firstElementChild;
    const innerText = container2.textContent;
    let displayNameShort = element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}` : "";
    let displayNameFull = element ? `${displayNameShort}${element.classList.length ? `.${[...element.classList].join(".")}` : ""}` : "";
    if (elementData.ancestors && elementData.ancestors.length > 0) {
      let last = elementData.ancestors[elementData.ancestors.length - 1];
      let pseudo = "";
      if (last.tagName.startsWith("::") && elementData.ancestors.length > 1) {
        pseudo = last.tagName;
        last = elementData.ancestors[elementData.ancestors.length - 2];
      }
      displayNameShort = `${last.tagName.toLowerCase()}${last.id ? `#${last.id}` : ""}${pseudo}`;
      displayNameFull = `${last.tagName.toLowerCase()}${last.id ? `#${last.id}` : ""}${last.classNames && last.classNames.length ? `.${last.classNames.join(".")}` : ""}${pseudo}`;
    }
    const value2 = createElementContextValue(elementData, displayNameFull);
    const attachImages = this.configurationService.getValue(BrowserSendElementsToChatAttachImagesSettingId);
    const screenshotBuffer = attachImages ? await model.captureScreenshot({
      quality: 90,
      pageRect: bounds,
      awaitNextPaint: true
    }) : void 0;
    const elementEntry = {
      id: "element-" + Date.now(),
      name: displayNameShort,
      fullName: displayNameFull,
      value: value2,
      modelDescription: "Structured browser element context with HTML path, outer HTML, dimensions, and computed styles.",
      kind: "element",
      icon: ThemeIcon.fromId(Codicon.layout.id),
      ancestors: elementData.ancestors,
      attributes: elementData.attributes,
      computedStyles: elementData.computedStyles,
      dimensions: elementData.dimensions,
      innerText,
      imageData: screenshotBuffer?.buffer,
      imageMimeType: screenshotBuffer ? "image/jpeg" : void 0
    };
    toAttach.push(elementEntry);
    if (!await this._confirmContentAttachmentRisk(elementData.url ?? model.url)) {
      return false;
    }
    const widget = await this._revealChatWidgetForAttachment(elementData.comment !== void 0);
    if (!widget?.attachmentModel || this._disposedCommentModels.has(model)) {
      return false;
    }
    widget.attachmentModel.addContext(...toAttach);
    if (elementData.comment !== void 0 && elementData.elementId) {
      if (!this._insertElementCommentReference(widget, model, elementEntry, toAttach.map((attachment) => attachment.id), elementData.elementId, elementData.comment)) {
        widget.attachmentModel.delete(...toAttach.map((attachment) => attachment.id));
        return false;
      }
      if (model.elementSelectionState.active) {
        this._commentSessionsWithComments.add(model);
      } else {
        widget.focusInput();
      }
    }
    this.telemetryService.publicLog2("integratedBrowser.addElementToChat.added", {
      attachImages
    });
    return true;
  }
  _insertElementCommentReference(widget, browserModel, attachment, attachmentIds, elementId, comment) {
    const inputModel = widget.inputEditor.getModel();
    const dynamicVariableModel = widget.getContrib(ChatDynamicVariableModel.ID);
    if (!inputModel || !dynamicVariableModel) {
      return false;
    }
    const insertionPosition = widget.inputEditor.getPosition() ?? inputModel.getFullModelRange().getEndPosition();
    const prefix = insertionPosition.column > 1 ? "\n" : "";
    const suffix = insertionPosition.column < inputModel.getLineMaxColumn(insertionPosition.lineNumber) ? "\n" : "";
    const reference = `@${attachment.name}`;
    const commentText = comment ? ` ${comment}` : "";
    const text2 = `${prefix}${reference}${commentText}${suffix}`;
    if (!widget.inputEditor.executeEdits("browserElementComment", [{ range: Range2.fromPositions(insertionPosition), text: text2 }])) {
      return false;
    }
    const referenceStart = prefix ? { lineNumber: insertionPosition.lineNumber + 1, column: 1 } : insertionPosition;
    const referenceRange = new Range2(referenceStart.lineNumber, referenceStart.column, referenceStart.lineNumber, referenceStart.column + reference.length);
    dynamicVariableModel.addReference(toAttachedContextDynamicVariable(attachment, referenceRange));
    widget.inputEditor.setPosition({
      lineNumber: referenceRange.endLineNumber,
      column: referenceRange.endColumn + commentText.length
    });
    this._commentReferences.set(attachment.id, { elementId, attachmentIds, widget, browserModel });
    this._ensureCommentReferenceListeners(widget, dynamicVariableModel);
    this._ensureCommentModelListeners(browserModel);
    this._syncElementComments(browserModel);
    return true;
  }
  _ensureCommentReferenceListeners(widget, dynamicVariableModel) {
    if (this._commentReferenceListeners.has(widget)) {
      return;
    }
    const store = new DisposableStore();
    store.add(dynamicVariableModel.onDidChangeReferences(() => this._syncElementCommentsForWidget(widget)));
    store.add(widget.inputEditor.onDidChangeModelContent(() => this._syncElementCommentsForWidget(widget)));
    store.add(widget.attachmentModel.onDidChange((event) => {
      for (const [attachmentId, tracked] of this._commentReferences) {
        if (tracked.widget === widget && event.deleted.includes(attachmentId)) {
          this._removeElementCommentReference(tracked.browserModel, tracked.elementId);
        }
      }
    }));
    this._commentReferenceListeners.set(widget, store);
  }
  _ensureCommentModelListeners(browserModel) {
    if (this._commentModelListeners.has(browserModel)) {
      return;
    }
    const store = new DisposableStore();
    store.add(browserModel.onDidRemoveElementComment((elementId) => this._removeElementCommentReference(browserModel, elementId)));
    store.add(browserModel.onDidNavigate(() => this._detachElementCommentReferences(browserModel)));
    store.add(browserModel.onWillDispose(() => {
      this._disposedCommentModels.add(browserModel);
      this._detachElementCommentReferences(browserModel, false);
    }));
    this._commentModelListeners.set(browserModel, store);
  }
  _syncElementCommentsForWidget(widget) {
    const browserModels = /* @__PURE__ */ new Set();
    for (const reference of this._commentReferences.values()) {
      if (reference.widget === widget) {
        browserModels.add(reference.browserModel);
      }
    }
    for (const browserModel of browserModels) {
      this._syncElementComments(browserModel);
    }
  }
  _syncElementComments(browserModel, pendingCommentIdsToDiscard) {
    const comments = [];
    for (const [attachmentId, tracked] of this._commentReferences) {
      if (tracked.browserModel !== browserModel) {
        continue;
      }
      const inputModel = tracked.widget.inputEditor.getModel();
      const dynamicVariableModel = tracked.widget.getContrib(ChatDynamicVariableModel.ID);
      if (!inputModel || !dynamicVariableModel) {
        continue;
      }
      const variable = dynamicVariableModel.variables.find((candidate) => candidate.id === attachmentId && candidate.isAttachmentReference);
      if (!variable) {
        this._deleteCommentAttachments(attachmentId, tracked);
        continue;
      }
      const line = inputModel.getLineContent(variable.range.endLineNumber);
      comments.push({
        elementId: tracked.elementId,
        body: line.slice(variable.range.endColumn - 1).trimStart()
      });
    }
    void browserModel.setElementComments({ comments, pendingCommentIdsToDiscard });
  }
  _removeElementCommentReference(browserModel, elementId) {
    for (const [attachmentId, tracked] of this._commentReferences) {
      if (tracked.browserModel !== browserModel || tracked.elementId !== elementId) {
        continue;
      }
      const dynamicVariableModel = tracked.widget.getContrib(ChatDynamicVariableModel.ID);
      const variable = dynamicVariableModel?.variables.find((candidate) => candidate.id === attachmentId && candidate.isAttachmentReference);
      const inputModel = tracked.widget.inputEditor.getModel();
      if (variable && inputModel) {
        const lineNumber = variable.range.startLineNumber;
        const lineRange = lineNumber < inputModel.getLineCount() ? new Range2(lineNumber, 1, lineNumber + 1, 1) : lineNumber > 1 ? new Range2(lineNumber - 1, inputModel.getLineMaxColumn(lineNumber - 1), lineNumber, inputModel.getLineMaxColumn(lineNumber)) : inputModel.getFullModelRange();
        tracked.widget.inputEditor.executeEdits("browserElementComment", [{
          range: lineRange,
          text: ""
        }]);
      }
      this._deleteCommentAttachments(attachmentId, tracked);
    }
  }
  _detachElementCommentReferences(browserModel, syncComments = true) {
    this._commentSessionsWithComments.delete(browserModel);
    const widgets2 = /* @__PURE__ */ new Set();
    for (const [attachmentId, reference] of this._commentReferences) {
      if (reference.browserModel === browserModel) {
        widgets2.add(reference.widget);
        this._commentReferences.delete(attachmentId);
      }
    }
    for (const widget of widgets2) {
      this._disposeCommentReferenceListenerIfUnused(widget);
    }
    this._commentModelListeners.deleteAndDispose(browserModel);
    if (syncComments) {
      void browserModel.setElementComments({ comments: [] });
    }
  }
  _focusChatInputForComments(browserModel) {
    for (const reference of this._commentReferences.values()) {
      if (reference.browserModel === browserModel) {
        reference.widget.focusInput();
        return;
      }
    }
  }
  _deleteCommentAttachments(elementAttachmentId, tracked) {
    this._commentReferences.delete(elementAttachmentId);
    tracked.widget.attachmentModel.delete(...tracked.attachmentIds);
    this._disposeCommentReferenceListenerIfUnused(tracked.widget);
    this._disposeCommentModelListenerIfUnused(tracked.browserModel);
  }
  _disposeCommentReferenceListenerIfUnused(widget) {
    for (const reference of this._commentReferences.values()) {
      if (reference.widget === widget) {
        return;
      }
    }
    this._commentReferenceListeners.deleteAndDispose(widget);
  }
  _disposeCommentModelListenerIfUnused(browserModel) {
    for (const reference of this._commentReferences.values()) {
      if (reference.browserModel === browserModel) {
        return;
      }
    }
    this._commentModelListeners.deleteAndDispose(browserModel);
  }
  // -- Console Logs ---------------------------------------------------
  /**
   * Grab the current console logs from the active console session and attach them to chat.
   */
  async addConsoleLogsToChat() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    try {
      const logs = await model.getConsoleLogs();
      if (!logs) {
        return;
      }
      if (!await this._confirmContentAttachmentRisk(model.url)) {
        return;
      }
      const toAttach = [];
      toAttach.push({
        id: "console-logs-" + Date.now(),
        name: localize(8048, null),
        fullName: localize(8048, null),
        value: logs,
        modelDescription: "Console logs captured from Integrated Browser.",
        kind: "element",
        icon: ThemeIcon.fromId(Codicon.terminal.id)
      });
      await this._attachToChat(toAttach);
    } catch (error) {
      this.logService.error("BrowserEditor.addConsoleLogsToChat: Failed to get console logs", error);
    }
  }
  // -- Screenshot ----------------------------------------------------
  /**
   * Capture a viewport screenshot of the current browser view and attach it to chat.
   */
  async addScreenshotToChat() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    try {
      const screenshotBuffer = await model.captureScreenshot({ quality: 80 });
      if (!await this._confirmContentAttachmentRisk(model.url)) {
        return;
      }
      const toAttach = [{
        id: "browser-screenshot-" + Date.now(),
        name: localize(8047, null),
        fullName: localize(8047, null),
        kind: "image",
        value: screenshotBuffer.buffer,
        mimeType: "image/jpeg"
      }];
      if (!await this._attachToChat(toAttach)) {
        return;
      }
      this.telemetryService.publicLog2("integratedBrowser.addScreenshotToChat.added", {
        screenshotType: "viewport"
      });
    } catch (error) {
      this.logService.error("BrowserEditor.addScreenshotToChat: Failed to capture screenshot", error);
    }
  }
  /**
   * Drive the area-screenshot flow: present the drag-to-select picker, capture the
   * user-drawn region, and attach the resulting image to chat.
   */
  async addAreaScreenshotToChat() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    if (model.isAreaSelectionActive) {
      void model.toggleAreaSelection(false);
      return;
    }
    this.editor.ensureBrowserFocus();
    const pickPromise = Event2.toPromise(Event2.once(model.onDidPickArea));
    void model.toggleAreaSelection(true);
    const rect = await pickPromise;
    if (!rect) {
      return;
    }
    try {
      const screenshotBuffer = await model.captureScreenshot({ quality: 80, pageRect: rect, awaitNextPaint: true });
      if (!await this._confirmContentAttachmentRisk(model.url)) {
        return;
      }
      const toAttach = [{
        id: "browser-area-screenshot-" + Date.now(),
        name: localize(8044, null),
        fullName: localize(8044, null),
        kind: "image",
        value: screenshotBuffer.buffer,
        mimeType: "image/jpeg"
      }];
      if (!await this._attachToChat(toAttach)) {
        return;
      }
      this.telemetryService.publicLog2("integratedBrowser.addScreenshotToChat.added", {
        screenshotType: "area"
      });
    } catch (error) {
      this.logService.error("BrowserEditor.addAreaScreenshotToChat: Failed to capture area screenshot", error);
    }
  }
  /**
   * Capture a full-page screenshot (including content scrolled off-screen) and attach it to chat.
   */
  async addFullPageScreenshotToChat() {
    const model = this.editor.model;
    if (!model) {
      return;
    }
    try {
      const screenshotBuffer = await model.captureScreenshot({ fullPage: true, format: "png" });
      if (!await this._confirmContentAttachmentRisk(model.url)) {
        return;
      }
      const toAttach = [{
        id: "browser-fullpage-screenshot-" + Date.now(),
        name: localize(8046, null),
        fullName: localize(8046, null),
        kind: "image",
        value: screenshotBuffer.buffer,
        mimeType: "image/png"
      }];
      if (!await this._attachToChat(toAttach)) {
        return;
      }
      this.telemetryService.publicLog2("integratedBrowser.addScreenshotToChat.added", {
        screenshotType: "fullPage"
      });
    } catch (error) {
      this.logService.error("BrowserEditor.addFullPageScreenshotToChat: Failed to capture full-page screenshot", error);
    }
  }
};

BrowserEditorChatIntegration = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IChatService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, IAccessibleViewService),
  __decorateParam(13, IChatPetService)
], BrowserEditorChatIntegration);

BrowserEditor.registerContribution(BrowserEditorChatIntegration);

var AddElementToChatAction = class _AddElementToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddElementToChat;
  }
  constructor() {
    super({
      id: _AddElementToChatAction.ID,
      title: localize2(8018, "Add Element to Chat"),
      category: BrowserCategory,
      icon: Codicon.inspect,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled),
      toggled: CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.isEqualTo("select" /* Select */),
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "1_element",
        order: 1,
        when: ChatContextKeys.enabled
      },
      keybinding: [{
        weight: 200 /* WorkbenchContrib */ + 50,
        // Priority over terminal
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KeyC */,
        args: { highlightFocusedElement: true }
      }]
    });
  }
  run(accessor, argument) {
    const browserEditor = argument instanceof BrowserEditor ? argument : accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.ensureBrowserFocus();
      const model = browserEditor.model;
      if (model) {
        const options3 = argument instanceof BrowserEditor ? void 0 : argument;
        const isActiveMode = model.elementSelectionState.active && model.elementSelectionState.options.mode !== "comment" /* Comment */;
        void model.toggleElementSelection(!isActiveMode, { ...options3, continuous: false, mode: "select" /* Select */ });
      }
    }
  }
};

var AddElementCommentToChatAction = class _AddElementCommentToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddElementCommentToChat;
  }
  constructor() {
    super({
      id: _AddElementCommentToChatAction.ID,
      title: localize2(8017, "Comment on Elements"),
      category: BrowserCategory,
      icon: Codicon.comment,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled),
      toggled: CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.isEqualTo("comment" /* Comment */),
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "1_element",
        order: 2,
        when: ChatContextKeys.enabled
      },
      keybinding: [{
        weight: 200 /* WorkbenchContrib */ + 50,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */,
        args: { continuous: true, mode: "comment" /* Comment */, highlightFocusedElement: true }
      }]
    });
  }
  run(accessor, argument) {
    const browserEditor = argument instanceof BrowserEditor ? argument : accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.ensureBrowserFocus();
      const options3 = argument instanceof BrowserEditor ? void 0 : argument;
      const model = browserEditor.model;
      if (model) {
        const isActiveMode = model.elementSelectionState.active && model.elementSelectionState.options.mode === "comment" /* Comment */;
        void model.toggleElementSelection(!isActiveMode, { ...options3, continuous: true, mode: "comment" /* Comment */ });
      }
    }
  }
};

var StopElementSelectionAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.browser.stopElementSelection",
      title: localize2(8042, "Stop Element Selection"),
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, ContextKeyExpr.has(CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.key)),
      keybinding: {
        when: ContextKeyExpr.has(CONTEXT_BROWSER_ELEMENT_SELECTION_MODE.key),
        weight: 200 /* WorkbenchContrib */,
        primary: 9 /* Escape */
      }
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      void browserEditor.model?.toggleElementSelection(false);
    }
  }
};

var AddConsoleLogsToChatAction = class _AddConsoleLogsToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddConsoleLogsToChat;
  }
  constructor() {
    super({
      id: _AddConsoleLogsToChatAction.ID,
      title: localize2(8016, "Add Console Logs to Chat"),
      category: BrowserActionCategory,
      icon: Codicon.output,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled),
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "2_logs",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorChatIntegration)?.addConsoleLogsToChat();
    }
  }
};

var AddScreenshotToChatAction = class _AddScreenshotToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddScreenshotToChat;
  }
  constructor() {
    super({
      id: _AddScreenshotToChatAction.ID,
      title: localize2(8020, "Add Screenshot to Chat"),
      category: BrowserActionCategory,
      icon: Codicon.deviceCamera,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled),
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "3_screenshots",
        order: 1,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorChatIntegration)?.addScreenshotToChat();
    }
  }
};

var AddAreaScreenshotToChatAction = class _AddAreaScreenshotToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddAreaScreenshotToChat;
  }
  constructor() {
    super({
      id: _AddAreaScreenshotToChatAction.ID,
      title: localize2(8015, "Add Area Screenshot to Chat"),
      category: BrowserActionCategory,
      icon: Codicon.screenFull,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled),
      toggled: CONTEXT_BROWSER_AREA_SELECTION_ACTIVE,
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "3_screenshots",
        order: 2,
        when: ChatContextKeys.enabled
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorChatIntegration)?.addAreaScreenshotToChat();
    }
  }
};

var AddFullPageScreenshotToChatAction = class _AddFullPageScreenshotToChatAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.AddFullPageScreenshotToChat;
  }
  constructor() {
    const enabledSetting = ContextKeyExpr.has("config.workbench.browser.experimentalUserTools.enabled");
    super({
      id: _AddFullPageScreenshotToChatAction.ID,
      title: localize2(8019, "Add Full Page Screenshot to Chat (Experimental)"),
      category: BrowserActionCategory,
      icon: Codicon.deviceCamera,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE2, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate(), ChatContextKeys.enabled, enabledSetting),
      menu: {
        id: MenuId.BrowserChatActionsMenu,
        group: "3_screenshots",
        order: 3,
        when: ContextKeyExpr.and(ChatContextKeys.enabled, enabledSetting)
      }
    });
  }
  async run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      await browserEditor.getContribution(BrowserEditorChatIntegration)?.addFullPageScreenshotToChat();
    }
  }
};

registerAction2(AddElementToChatAction);

registerAction2(AddElementCommentToChatAction);

registerAction2(StopElementSelectionAction);

registerAction2(AddConsoleLogsToChatAction);

registerAction2(AddScreenshotToChatAction);

registerAction2(AddAreaScreenshotToChatAction);

registerAction2(AddFullPageScreenshotToChatAction);

MenuRegistry.appendMenuItem(MenuId.BrowserActionsToolbar, {
  submenu: MenuId.BrowserChatActionsMenu,
  title: localize2(8026, "Add to Chat"),
  icon: Codicon.inspect,
  group: "3_tools" /* Tools */,
  order: 1,
  when: ChatContextKeys.enabled,
  isSplitButton: {
    togglePrimaryAction: true,
    primaryActionIds: [AddElementToChatAction.ID, AddElementCommentToChatAction.ID]
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.browser.enableChatTools": {
      type: "boolean",
      default: true,
      markdownDescription: localize(
        8038,
        null
      ),
      policy: {
        name: "BrowserChatTools",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.110",
        localization: {
          description: {
            key: "browser.enableChatTools",
            value: localize(8038, null)
          }
        }
      },
      agentsWindow: { default: true }
    },
    "workbench.browser.experimentalUserTools.enabled": {
      type: "boolean",
      default: false,
      experiment: { mode: "startup" },
      tags: ["experimental"],
      markdownDescription: localize(
        8039,
        null
      )
    },
    [BrowserSendElementsToChatAttachImagesSettingId]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(8049, null)
    }
  }
});

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([
  {
    key: "chat.sendElementsToChat.attachImages",
    migrateFn: (value2) => {
      const result = [
        ["chat.sendElementsToChat.attachImages", { value: void 0 }]
      ];
      if (typeof value2 === "boolean") {
        result.push([BrowserSendElementsToChatAttachImagesSettingId, { value: value2 }]);
      }
      return result;
    }
  }
]);
export { formatElementPath, createElementContextValue, BrowserSendElementsToChatAttachImagesSettingId, BROWSER_EDITOR_ACTIVE2, BrowserCategory, CONTEXT_BROWSER_ELEMENT_SELECTION_MODE, CONTEXT_BROWSER_AREA_SELECTION_ACTIVE, BrowserElementCommentingAccessibilityHelp, BrowserEditorChatIntegration, AddElementToChatAction, AddElementCommentToChatAction, StopElementSelectionAction, AddConsoleLogsToChatAction, AddScreenshotToChatAction, AddAreaScreenshotToChatAction, AddFullPageScreenshotToChatAction };
