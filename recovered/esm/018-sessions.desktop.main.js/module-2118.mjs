// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatPlanReviewPart.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatPlanReviewData } from "./module-1191.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { URI } from "./module-0032.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableListener, append, clearNode, h, hide, show } from "./module-0075.mjs";
import { CHAT_CARD_LARGE_CLASS, chatCardButtonStyles } from "./module-2109.mjs";
import { generateUuid } from "./module-0190.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { Button, ButtonWithDropdown } from "./module-0546.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { status } from "./module-0076.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getChatMarkdownRenderOptions } from "./module-2117.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { severity_default } from "./module-0266.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Action } from "./module-0082.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IPlanReviewFeedbackService } from "./module-2110.mjs";
import { IAgentEditorCommentsBridge } from "./module-0919.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IModelService } from "./module-0080.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatPlanReviewPart.ts
var MARKDOWN_EDITOR_ID = "vscode.markdown.editor";

var ChatPlanReviewPart = class extends Disposable {
  constructor(review, context2, _options, _markdownRendererService, _contextMenuService, _dialogService, _editorService, _hoverService, _planReviewFeedbackService, _agentEditorCommentsBridge, _textFileService, _modelService, _fileService) {
    super();
    this.review = review;
    this._options = _options;
    this._markdownRendererService = _markdownRendererService;
    this._contextMenuService = _contextMenuService;
    this._dialogService = _dialogService;
    this._editorService = _editorService;
    this._hoverService = _hoverService;
    this._planReviewFeedbackService = _planReviewFeedbackService;
    this._agentEditorCommentsBridge = _agentEditorCommentsBridge;
    this._textFileService = _textFileService;
    this._modelService = _modelService;
    this._fileService = _fileService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._buttonStore = this._register(new DisposableStore());
    this._renderedSubmitInlineCount = -1;
    this._messageContentDisposables = this._register(new MutableDisposable());
    this._planChangeListeners = this._register(new DisposableStore());
    this._isCollapsed = false;
    this._isSubmitted = false;
    this._isSubmitting = false;
    this._isFeedbackMode = false;
    this._planReviewRegistration = this._register(new MutableDisposable());
    this._commentRowDisposables = this._register(new DisposableStore());
    this._selectedAction = review.actions.find((a) => a.default) ?? review.actions[0];
    if (review instanceof ChatPlanReviewData && typeof review.draftCollapsed === "boolean") {
      this._isCollapsed = review.draftCollapsed;
    }
    const isResponseComplete = isResponseVM(context2.element) && context2.element.isComplete;
    this._isSubmitted = !!review.isUsed || isResponseComplete;
    if (review instanceof ChatPlanReviewData) {
      this._register(review.onDidDismiss(() => {
        if (this.updatePlanContentFromModel()) {
          this.renderMarkdown();
        }
        this._isSubmitted = true;
        void this.markUsed();
      }));
    }
    if (review.planUri && review.canProvideFeedback && !this._isSubmitted) {
      const planUri = URI.revive(review.planUri);
      const planUriString = planUri.toString();
      const registrationStore = new DisposableStore();
      registrationStore.add(this._planReviewFeedbackService.registerPlanReview(planUri, {
        sessionResource: context2.element.sessionResource,
        actions: review.actions,
        hasOverallFeedback: () => !!this._feedbackTextarea?.value.trim(),
        submitFeedback: () => this.submitFeedback(),
        submitAction: (action) => this.submitApproval(action),
        reject: () => this.submitRejection()
      }));
      registrationStore.add(this._planReviewFeedbackService.onDidChangeFeedback((uri4) => {
        if (uri4.toString() === planUriString) {
          this.onInlineFeedbackChanged();
        }
      }));
      registrationStore.add(this._agentEditorCommentsBridge.onDidChangeComments(() => this.onInlineFeedbackChanged()));
      this._planReviewRegistration.value = registrationStore;
    }
    const elements = h(".chat-confirmation-widget-container.chat-plan-review-container@container", [
      h(`.chat-confirmation-widget2.chat-plan-review.${CHAT_CARD_LARGE_CLASS}@root`, [
        h(".chat-confirmation-widget-title.chat-plan-review-title@title", [
          h(".chat-plan-review-title-content", [
            h(".chat-plan-review-title-label@titleLabel"),
            h("span.chat-plan-review-outdated@outdatedBadge")
          ]),
          h(".chat-plan-review-inline-actions@inlineActions"),
          h(".chat-plan-review-title-actions@titleActions")
        ]),
        h(".chat-confirmation-widget-message.chat-plan-review-body@message"),
        h(".chat-plan-review-feedback@feedback"),
        h(".chat-confirmation-widget-buttons.chat-plan-review-footer", [
          h(".chat-buttons@footerButtons")
        ])
      ])
    ]);
    this.domNode = elements.container;
    this.domNode.id = generateUuid();
    this.domNode.setAttribute("role", "region");
    this.domNode.setAttribute("aria-label", localize(11957, null, review.title));
    this._titleActionsEl = elements.titleActions;
    this._outdatedBadgeEl = elements.outdatedBadge;
    this._inlineActionsEl = elements.inlineActions;
    this._footerButtonsEl = elements.footerButtons;
    this._messageEl = elements.message;
    elements.titleLabel.textContent = review.title;
    this._register(this._hoverService.setupDelayedHover(elements.titleLabel, { content: review.title }));
    this._outdatedBadgeEl.textContent = localize(11978, null);
    this._outdatedBadgeEl.setAttribute("aria-label", localize(11980, null));
    if (!review.isOutdated) {
      hide(this._outdatedBadgeEl);
    }
    this.watchPlanChanges();
    if (review.planUri) {
      const fileName = basename2(URI.revive(review.planUri));
      const reviewButtonTooltip = review.canProvideFeedback ? localize(11984, null, fileName) : localize(11977, null, fileName);
      const reviewButton = this._register(new Button(this._titleActionsEl, { ...chatCardButtonStyles, secondary: true, supportIcons: true, title: reviewButtonTooltip, ariaLabel: reviewButtonTooltip }));
      reviewButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-padded", "chat-plan-review-title-button", "chat-plan-review-review-button");
      this._reviewButton = reviewButton;
      this._register(reviewButton.onDidClick(() => void this.enterReviewMode()));
    }
    this._collapseButton = this._register(new Button(this._titleActionsEl, { ...chatCardButtonStyles, secondary: true, supportIcons: true }));
    this._collapseButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-padded", "chat-plan-review-title-button", "chat-plan-review-title-icon-button");
    this._register(this._collapseButton.onDidClick(() => this.toggleCollapsed()));
    const messageParent = this._messageEl.parentElement;
    const messageNextSibling = this._messageEl.nextSibling;
    this._messageScrollable = this._register(new DomScrollableElement(this._messageEl, {
      vertical: 1 /* Auto */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this._messageScrollable.getDomNode().classList.add("chat-confirmation-widget-message-scrollable", "chat-plan-review-body-scrollable");
    messageParent.insertBefore(this._messageScrollable.getDomNode(), messageNextSibling);
    const resizeObserver = this._register(new DisposableResizeObserver("ChatPlanReviewPart.messageScrollable", () => this._messageScrollable.scanDomNode()));
    this._register(resizeObserver.observe(this._messageScrollable.getDomNode()));
    this.renderMarkdown();
    if (review.canProvideFeedback) {
      this.renderFeedback(elements.feedback);
      this._feedbackSection = elements.feedback;
      if (review.planUri) {
        hide(elements.feedback);
      } else {
        this.domNode.classList.add("chat-plan-review-textarea-mode");
      }
    } else {
      hide(elements.feedback);
    }
    this.renderActionButtons(
      this._isCollapsed ? this._inlineActionsEl : this._footerButtonsEl,
      { includeReject: !this._isCollapsed }
    );
    this.updateCollapsedPresentation();
    if (this._isSubmitted) {
      this.domNode.classList.add("chat-plan-review-used");
    }
    if (this._feedbackTextarea && review instanceof ChatPlanReviewData && review.draftFeedback) {
      this._feedbackTextarea.value = review.draftFeedback;
      this._feedbackTextarea.style.height = "auto";
      this._feedbackTextarea.style.height = `${this._feedbackTextarea.scrollHeight}px`;
    }
    if (!this._isSubmitted && this.getInlineFeedbackItems().length > 0) {
      void this.enterFeedbackMode({ focus: false });
    }
  }
  watchPlanChanges() {
    if (!this.review.planUri || this.review.isOutdated) {
      return;
    }
    const planUri = URI.revive(this.review.planUri);
    const modelListener = this._planChangeListeners.add(new MutableDisposable());
    const watchModel = (model2) => {
      if (isEqual2(model2.uri, planUri)) {
        modelListener.value = model2.onDidChangeContent(() => this.markOutdated());
      }
    };
    const model = this._modelService.getModel(planUri);
    if (model) {
      watchModel(model);
    }
    this._planChangeListeners.add(this._modelService.onModelAdded(watchModel));
    const watcher = this._planChangeListeners.add(this._fileService.createWatcher(planUri, { recursive: false, excludes: [] }));
    this._planChangeListeners.add(watcher.onDidChange((event) => {
      if (event.contains(planUri, 2 /* DELETED */) || !this._modelService.getModel(planUri) && event.contains(planUri, 1 /* ADDED */, 0 /* UPDATED */)) {
        this.markOutdated();
      }
    }));
  }
  markOutdated() {
    if (this.review.isOutdated) {
      return;
    }
    this.review.isOutdated = true;
    show(this._outdatedBadgeEl);
    this._planChangeListeners.clear();
    status(localize(11979, null));
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind !== "planReview") {
      return false;
    }
    if (!!other.isUsed !== !!this.review.isUsed) {
      return false;
    }
    if (this.review.resolveId && other.resolveId) {
      return this.review.resolveId === other.resolveId;
    }
    return other === this.review;
  }
  renderMarkdown() {
    clearNode(this._messageEl);
    const store = new DisposableStore();
    this._messageContentDisposables.value = store;
    const rendered = store.add(this._markdownRendererService.render(
      new MarkdownString(this.review.content, { supportThemeIcons: true, isTrusted: false }),
      getChatMarkdownRenderOptions({ asyncRenderCallback: () => this._messageScrollable.scanDomNode() })
    ));
    this._messageEl.append(rendered.element);
    this._messageScrollable.scanDomNode();
  }
  renderFeedback(section) {
    clearNode(section);
    const header2 = append(section, $(".chat-plan-review-feedback-header"));
    const label3 = append(header2, $(".chat-plan-review-feedback-label"));
    label3.textContent = localize(11971, null);
    const headerActions = append(header2, $(".chat-plan-review-feedback-header-actions"));
    if (this.review.planUri) {
      const clearAllLabel = localize(11962, null);
      const clearAllButton = this._register(new Button(headerActions, { ...chatCardButtonStyles, secondary: true, supportIcons: true, title: clearAllLabel, ariaLabel: clearAllLabel }));
      clearAllButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-padded", "chat-plan-review-title-button", "chat-plan-review-feedback-clear-all");
      clearAllButton.label = clearAllLabel;
      this._register(clearAllButton.onDidClick(() => this.clearAllInlineFeedback()));
      this._clearAllButtonEl = clearAllButton.element;
    }
    if (this.review.planUri) {
      const closeButtonLabel = localize(11966, null);
      const closeButton = this._register(new Button(headerActions, { ...chatCardButtonStyles, secondary: true, supportIcons: true, title: closeButtonLabel, ariaLabel: closeButtonLabel }));
      closeButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-padded", "chat-plan-review-title-button", "chat-plan-review-title-icon-button", "chat-plan-review-feedback-close");
      closeButton.label = `$(${Codicon.closeSmall.id})`;
      this._register(closeButton.onDidClick(() => this.exitFeedbackMode()));
    }
    this._commentsListEl = $(".chat-plan-review-comments-list");
    this._commentsListScrollable = this._register(new DomScrollableElement(this._commentsListEl, {
      vertical: 1 /* Auto */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this._commentsListScrollable.getDomNode().classList.add("chat-plan-review-comments-list-scrollable");
    append(section, this._commentsListScrollable.getDomNode());
    hide(this._commentsListScrollable.getDomNode());
    this.renderCommentsList();
    const textarea = append(section, $("textarea.chat-plan-review-feedback-textarea"));
    textarea.rows = 1;
    textarea.placeholder = localize(11972, null);
    this._feedbackTextarea = textarea;
    const autoResize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      this._onDidChangeHeight.fire();
    };
    this._register(addDisposableListener(textarea, EventType.INPUT, () => {
      autoResize();
      this._messageScrollable.scanDomNode();
      if (this.review instanceof ChatPlanReviewData) {
        this.review.draftFeedback = textarea.value;
      }
      if (this.review.planUri) {
        this._planReviewFeedbackService.notifyFeedbackChanged(URI.revive(this.review.planUri));
      }
      this.updateSubmitButtonState();
    }));
    if (this.review.planUri) {
      this._register(addDisposableListener(textarea, EventType.KEY_DOWN, (e4) => {
        const ev = new StandardKeyboardEvent(e4);
        if (ev.keyCode === 3 /* Enter */ && !ev.shiftKey) {
          e4.preventDefault();
          e4.stopPropagation();
          void this.submitFeedback();
        }
      }));
    }
  }
  renderCommentsList() {
    if (!this._commentsListEl) {
      return;
    }
    this._commentRowDisposables.clear();
    clearNode(this._commentsListEl);
    const items = this.getInlineFeedbackItems();
    if (this._clearAllButtonEl) {
      if (items.length > 0) {
        show(this._clearAllButtonEl);
      } else {
        hide(this._clearAllButtonEl);
      }
    }
    const scrollableNode = this._commentsListScrollable?.getDomNode();
    if (items.length === 0) {
      if (scrollableNode) {
        hide(scrollableNode);
      }
      this._commentsListScrollable?.scanDomNode();
      return;
    }
    if (scrollableNode) {
      show(scrollableNode);
    }
    for (const item of items) {
      const row = append(this._commentsListEl, $(".chat-plan-review-comment-row"));
      const rowLabel = localize(11968, null, item.line, item.text);
      const revealButton = append(row, $("button.chat-plan-review-comment-reveal"));
      revealButton.type = "button";
      revealButton.setAttribute("aria-label", rowLabel);
      const lineEl = append(revealButton, $("span.chat-plan-review-comment-line"));
      lineEl.textContent = localize(11969, null, item.line);
      const textEl = append(revealButton, $("span.chat-plan-review-comment-text"));
      textEl.textContent = item.text;
      this._commentRowDisposables.add(addDisposableListener(revealButton, EventType.CLICK, () => {
        this.revealInlineComment(item);
      }));
      const removeLabel = localize(11982, null, item.line);
      const removeButton = append(row, $("button.chat-plan-review-comment-remove"));
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", removeLabel);
      removeButton.title = removeLabel;
      removeButton.classList.add(...ThemeIcon.asClassNameArray(Codicon.closeSmall));
      this._commentRowDisposables.add(addDisposableListener(removeButton, EventType.CLICK, (e4) => {
        e4.stopPropagation();
        this.removeInlineComment(item.id);
      }));
    }
    this._commentsListScrollable?.scanDomNode();
  }
  getInlineFeedbackItems() {
    return this.review.planUri ? this._planReviewFeedbackService.getFeedback(URI.revive(this.review.planUri)) : [];
  }
  async revealInlineComment(item) {
    const planUri = this.review.planUri ? URI.revive(this.review.planUri) : void 0;
    if (!planUri) {
      return;
    }
    this._planReviewFeedbackService.setNavigationAnchor(planUri, item.id);
    await this._editorService.openEditor({
      resource: item.resource,
      options: {
        pinned: true,
        ...isEqual2(item.resource, planUri) ? { override: MARKDOWN_EDITOR_ID } : {},
        selection: { startLineNumber: item.line, startColumn: item.column }
      }
    });
  }
  removeInlineComment(itemId) {
    if (this._isSubmitted) {
      return;
    }
    if (this.review.planUri) {
      this._planReviewFeedbackService.removeFeedback(URI.revive(this.review.planUri), itemId);
    }
  }
  async clearAllInlineFeedback() {
    if (this._isSubmitted) {
      return;
    }
    const items = this.getInlineFeedbackItems();
    if (items.length === 0) {
      return;
    }
    const result = await this._dialogService.confirm({
      type: severity_default.Warning,
      message: localize(11963, null, items.length),
      detail: localize(11965, null),
      primaryButton: localize(11964, null)
    });
    if (!result.confirmed) {
      return;
    }
    if (this.review.planUri) {
      this._planReviewFeedbackService.clearFeedback(URI.revive(this.review.planUri));
    }
  }
  onInlineFeedbackChanged() {
    if (this._isSubmitted) {
      return;
    }
    const items = this.getInlineFeedbackItems();
    if (items.length > 0 && !this._isFeedbackMode) {
      void this.enterFeedbackMode({ focus: false });
      return;
    }
    this.renderCommentsList();
    if (this._isFeedbackMode) {
      this.updateSubmitButtonState();
    }
    this._messageScrollable.scanDomNode();
    this._onDidChangeHeight.fire();
  }
  /**
   * Render the action buttons into the active container (footer when
   * expanded, inline title slot when collapsed). Clears the inactive slot
   * so the same buttons can never appear in two places at once.
   */
  renderCurrentActionButtons() {
    if (this._isSubmitted) {
      return;
    }
    const target = this._isCollapsed ? this._inlineActionsEl : this._footerButtonsEl;
    const other = this._isCollapsed ? this._footerButtonsEl : this._inlineActionsEl;
    clearNode(other);
    this.renderActionButtons(target, { includeReject: !this._isCollapsed });
  }
  renderActionButtons(container2, options3) {
    const includeReject = options3?.includeReject ?? true;
    this._buttonStore.clear();
    this._submitButton = void 0;
    this._renderedSubmitInlineCount = -1;
    clearNode(container2);
    if (this._isFeedbackMode) {
      const inlineCount = this.getInlineFeedbackItems().length;
      const submitButton = new Button(container2, { ...defaultButtonStyles, supportIcons: true });
      submitButton.label = this.computeSubmitLabel(inlineCount);
      submitButton.enabled = this.canSubmitFeedback();
      this._submitButton = submitButton;
      this._renderedSubmitInlineCount = inlineCount;
      this._buttonStore.add(submitButton);
      this._buttonStore.add(submitButton.onDidClick(() => void this.submitFeedback()));
      if (includeReject) {
        const rejectButton = new Button(container2, { ...defaultButtonStyles, secondary: true });
        rejectButton.label = localize(11981, null);
        this._buttonStore.add(rejectButton);
        this._buttonStore.add(rejectButton.onDidClick(() => this.submitRejection()));
      }
      return;
    }
    const primary = this._selectedAction;
    const moreActions = this.review.actions.filter((a) => a !== primary);
    let approveButton;
    if (moreActions.length > 0) {
      approveButton = new ButtonWithDropdown(container2, {
        ...defaultButtonStyles,
        supportIcons: true,
        contextMenuProvider: this._contextMenuService,
        addPrimaryActionToDropdown: false,
        actions: moreActions.map((action) => {
          const button = new Action(
            action.label,
            action.label,
            void 0,
            true,
            () => {
              this.submitApproval(action);
              return Promise.resolve();
            }
          );
          button.tooltip = action.description || "";
          return this._buttonStore.add(button);
        })
      });
    } else {
      approveButton = new Button(container2, { ...defaultButtonStyles, supportIcons: true });
    }
    this._buttonStore.add(approveButton);
    approveButton.label = primary.label;
    if (primary.description) {
      approveButton.element.title = primary.description;
    }
    this._buttonStore.add(approveButton.onDidClick(() => this.submitApproval(primary)));
    if (includeReject) {
      const rejectButton = new Button(container2, { ...defaultButtonStyles, secondary: true });
      rejectButton.label = localize(11981, null);
      this._buttonStore.add(rejectButton);
      this._buttonStore.add(rejectButton.onDidClick(() => this.submitRejection()));
    }
  }
  canSubmitFeedback() {
    const textareaText = this._feedbackTextarea?.value.trim() ?? "";
    if (textareaText) {
      return true;
    }
    return this.getInlineFeedbackItems().length > 0;
  }
  computeSubmitLabel(inlineCount) {
    return inlineCount > 0 ? localize(11986, null, inlineCount) : localize(11985, null);
  }
  /**
   * Update the cached Submit button's enabled state and label without
   * destroying the button row. Cheap enough to run on every keystroke.
   */
  updateSubmitButtonState() {
    if (!this._submitButton || !this._isFeedbackMode) {
      return;
    }
    this._submitButton.enabled = this.canSubmitFeedback();
    const inlineCount = this.getInlineFeedbackItems().length;
    if (inlineCount !== this._renderedSubmitInlineCount) {
      this._submitButton.label = this.computeSubmitLabel(inlineCount);
      this._renderedSubmitInlineCount = inlineCount;
    }
  }
  toggleCollapsed() {
    this.domNode.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
    this._isCollapsed = !this._isCollapsed;
    if (this.review instanceof ChatPlanReviewData) {
      this.review.draftCollapsed = this._isCollapsed;
    }
    this.updateCollapsedPresentation();
    this._onDidChangeHeight.fire();
  }
  updateCollapsedPresentation() {
    this.domNode.classList.toggle("chat-plan-review-collapsed", this._isCollapsed);
    this._collapseButton.label = this._isCollapsed ? `$(${Codicon.chevronUp.id})` : `$(${Codicon.chevronDown.id})`;
    const collapseTooltip = this._isCollapsed ? localize(11970, null) : localize(11967, null);
    this._collapseButton.element.setAttribute("aria-label", collapseTooltip);
    this._collapseButton.element.setAttribute("aria-expanded", String(!this._isCollapsed));
    this._collapseButton.setTitle(collapseTooltip);
    if (this._reviewButton) {
      const isIconOnly = this._isCollapsed;
      this._reviewButton.element.classList.toggle("chat-plan-review-title-icon-button", isIconOnly);
      let label3;
      let tooltip;
      if (isIconOnly) {
        label3 = `$(${Codicon.edit.id})`;
        const fileName = this.review.planUri ? basename2(URI.revive(this.review.planUri)) : "";
        tooltip = this.review.canProvideFeedback ? localize(11984, null, fileName) : localize(11977, null, fileName);
      } else {
        const fileName = this.review.planUri ? basename2(URI.revive(this.review.planUri)) : "";
        if (this.review.canProvideFeedback) {
          label3 = localize(11983, null);
          tooltip = localize(11984, null, fileName);
        } else {
          label3 = localize(11976, null);
          tooltip = localize(11977, null, fileName);
        }
      }
      this._reviewButton.label = label3;
      this._reviewButton.element.setAttribute("aria-label", tooltip);
      this._reviewButton.setTitle(tooltip);
    }
    this.renderCurrentActionButtons();
  }
  async enterReviewMode() {
    if (!this.review.canProvideFeedback || this._isSubmitted) {
      if (this.review.planUri) {
        await this._editorService.openEditor({
          resource: URI.revive(this.review.planUri),
          options: { pinned: true, override: MARKDOWN_EDITOR_ID }
        });
      }
      return;
    }
    if (this._isCollapsed) {
      this._isCollapsed = false;
      if (this.review instanceof ChatPlanReviewData) {
        this.review.draftCollapsed = false;
      }
      this.updateCollapsedPresentation();
    }
    await this.enterFeedbackMode({ focus: true });
  }
  async submitApproval(action) {
    if (this._isSubmitted || this._isSubmitting) {
      return;
    }
    this._isSubmitting = true;
    try {
      if (this.review.planUri && !await this.savePlanFile()) {
        return;
      }
      this._isSubmitted = true;
      const ridesAlong = !this.review.planUri;
      const textareaFeedback = ridesAlong ? this._feedbackTextarea?.value.trim() : void 0;
      this._options.onSubmit({
        action: action.label,
        ...action.id ? { actionId: action.id } : {},
        rejected: false,
        ...textareaFeedback ? { feedback: textareaFeedback, feedbackOverall: textareaFeedback } : {}
      });
      void this.markUsed();
    } finally {
      if (!this._isSubmitted) {
        this._isSubmitting = false;
      }
    }
  }
  async submitRejection() {
    if (this._isSubmitted || this._isSubmitting) {
      return;
    }
    this._isSubmitting = true;
    try {
      if (this.review.planUri && !await this.savePlanFile()) {
        return;
      }
      this._isSubmitted = true;
      const ridesAlong = !this.review.planUri;
      const textareaFeedback = ridesAlong ? this._feedbackTextarea?.value.trim() : void 0;
      this._options.onSubmit({
        rejected: true,
        ...textareaFeedback ? { feedback: textareaFeedback, feedbackOverall: textareaFeedback } : {}
      });
      void this.markUsed();
    } finally {
      if (!this._isSubmitted) {
        this._isSubmitting = false;
      }
    }
  }
  async savePlanFile() {
    if (!this.review.planUri) {
      return true;
    }
    const planUri = URI.revive(this.review.planUri);
    if (this._textFileService.isDirty(planUri) && !await this._textFileService.save(planUri)) {
      return false;
    }
    if (this.review instanceof ChatPlanReviewData) {
      if (!this.updatePlanContentFromModel()) {
        this.review.content = (await this._textFileService.read(planUri)).value;
      }
      this.renderMarkdown();
    }
    return true;
  }
  updatePlanContentFromModel() {
    if (!(this.review instanceof ChatPlanReviewData) || !this.review.planUri) {
      return false;
    }
    const model = this._textFileService.files.get(URI.revive(this.review.planUri));
    if (!model?.isResolved()) {
      return false;
    }
    this.review.content = model.textEditorModel.getValue();
    return true;
  }
  async enterFeedbackMode(options3) {
    if (this._isFeedbackMode) {
      if (this.review.planUri) {
        await this._editorService.openEditor({
          resource: URI.revive(this.review.planUri),
          options: { pinned: true, override: MARKDOWN_EDITOR_ID }
        });
      } else if (options3?.focus) {
        this.focusFeedbackInput();
      }
      return;
    }
    this._isFeedbackMode = true;
    if (this._feedbackSection) {
      show(this._feedbackSection);
    }
    this.domNode.classList.add("chat-plan-review-feedback-mode");
    this.renderCommentsList();
    this.updateCollapsedPresentation();
    if (this.review.planUri) {
      await this._editorService.openEditor({
        resource: URI.revive(this.review.planUri),
        options: { pinned: true, override: MARKDOWN_EDITOR_ID }
      });
    }
    if (!this.review.planUri && options3?.focus !== false) {
      this.focusFeedbackInput();
    }
    this._messageScrollable.scanDomNode();
    this._onDidChangeHeight.fire();
  }
  async exitFeedbackMode() {
    if (!this._isFeedbackMode) {
      return;
    }
    this._isFeedbackMode = false;
    if (this._feedbackSection) {
      hide(this._feedbackSection);
    }
    this.domNode.classList.remove("chat-plan-review-feedback-mode");
    this.updateCollapsedPresentation();
    this._messageScrollable.scanDomNode();
    this._onDidChangeHeight.fire();
  }
  focusFeedbackInput() {
    this._feedbackTextarea?.focus();
  }
  async submitFeedback() {
    if (this._isSubmitted || this._isSubmitting) {
      return false;
    }
    const textareaFeedback = this._feedbackTextarea?.value.trim();
    const editorFeedbackItems = [...this.getInlineFeedbackItems()];
    if (!textareaFeedback && editorFeedbackItems.length === 0) {
      return false;
    }
    this._isSubmitting = true;
    try {
      if (!await this.savePlanFile()) {
        return false;
      }
      let feedbackInlineMarkdown;
      if (editorFeedbackItems.length > 0) {
        const itemsByResource = /* @__PURE__ */ new Map();
        for (const item of editorFeedbackItems) {
          const key3 = item.resource.toString();
          const items = itemsByResource.get(key3) ?? [];
          items.push(item);
          itemsByResource.set(key3, items);
        }
        const sections2 = [...itemsByResource.values()].flatMap((items) => [
          localize(11975, null, basename2(items[0].resource)),
          ...items.map((item) => {
            const location2 = item.column > 1 ? localize(11973, null, item.line, item.column) : localize(11974, null, item.line);
            return `- **${location2}:** ${item.text}`;
          })
        ]);
        feedbackInlineMarkdown = sections2.join("\n");
      }
      const sections = [];
      if (textareaFeedback) {
        sections.push(textareaFeedback);
      }
      if (feedbackInlineMarkdown) {
        sections.push(feedbackInlineMarkdown);
      }
      const feedback = sections.join("\n\n");
      this._isSubmitted = true;
      const planUri = this.review.planUri ? URI.revive(this.review.planUri) : void 0;
      if (planUri) {
        for (const item of editorFeedbackItems) {
          this._planReviewFeedbackService.removeFeedback(planUri, item.id);
        }
      }
      this._options.onSubmit({
        rejected: false,
        feedback,
        feedbackOverall: textareaFeedback || void 0,
        feedbackInlineMarkdown
      });
      await this.markUsed();
      return true;
    } finally {
      if (!this._isSubmitted) {
        this._isSubmitting = false;
      }
    }
  }
  async markUsed() {
    this.domNode.classList.add("chat-plan-review-used");
    this._buttonStore.clear();
    this._submitButton = void 0;
    this._renderedSubmitInlineCount = -1;
    this._planReviewRegistration.clear();
    if (this._feedbackTextarea) {
      this._feedbackTextarea.disabled = true;
    }
  }
};

ChatPlanReviewPart = __decorateClass([
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IPlanReviewFeedbackService),
  __decorateParam(9, IAgentEditorCommentsBridge),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, IModelService),
  __decorateParam(12, IFileService)
], ChatPlanReviewPart);
export { MARKDOWN_EDITOR_ID, ChatPlanReviewPart };
