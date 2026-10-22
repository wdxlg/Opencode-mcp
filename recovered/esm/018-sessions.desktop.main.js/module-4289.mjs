// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorWidget.ts
import { $, addDisposableListener, addStandardDisposableListener, clearNode, getTotalWidth, isHTMLElement } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Button } from "./module-0546.mjs";
import { createAgentFeedbackContext } from "./module-3587.mjs";
import { toSessionEditorCommentId } from "./module-3609.mjs";
import { Range2 } from "./module-0106.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerRangeHighlight } from "./module-0288.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICodeReviewService } from "./module-3608.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ICodeEditorService } from "./module-0078.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorWidget.ts
function isTextInputTarget(target) {
  return isHTMLElement(target) && target.closest("textarea, input") !== null;
}

var AgentFeedbackEditorWidget = class extends Disposable {
  constructor(_editor, _commentItems, _sessionResource, _composerDraftState, _agentFeedbackService, _codeReviewService, _markdownRendererService, _codeEditorService) {
    super();
    this._editor = _editor;
    this._commentItems = _commentItems;
    this._sessionResource = _sessionResource;
    this._composerDraftState = _composerDraftState;
    this._agentFeedbackService = _agentFeedbackService;
    this._codeReviewService = _codeReviewService;
    this._markdownRendererService = _markdownRendererService;
    this._codeEditorService = _codeEditorService;
    this._id = `agent-feedback-widget-${AgentFeedbackEditorWidget._idPool++}`;
    this._itemElements = /* @__PURE__ */ new Map();
    this._activeReplyInputs = /* @__PURE__ */ new Map();
    this._activeEditInputs = /* @__PURE__ */ new Map();
    this._actionBarElements = /* @__PURE__ */ new Map();
    this._position = null;
    this._isExpanded = false;
    this._disposed = false;
    this._startLineNumber = 1;
    this._eventStore = this._register(new DisposableStore());
    this._onDidExpand = this._register(new Emitter());
    this.onDidExpand = this._onDidExpand.event;
    this._rangeHighlightDecoration = this._editor.createDecorationsCollection();
    this._domNode = $("div.agent-feedback-widget");
    this._domNode.classList.add("collapsed");
    this._domNode.tabIndex = -1;
    this._headerNode = $("div.agent-feedback-widget-header");
    const commentIcon = renderIcon(Codicon.comment);
    commentIcon.setAttribute("aria-hidden", "true");
    this._headerNode.appendChild(commentIcon);
    this._titleNode = $("span.agent-feedback-widget-title");
    this._updateTitle();
    this._headerNode.appendChild(this._titleNode);
    this._headerNode.appendChild($("span.agent-feedback-widget-spacer"));
    this._toggleButton = $("div.agent-feedback-widget-toggle");
    this._updateToggleButton();
    this._headerNode.appendChild(this._toggleButton);
    this._domNode.appendChild(this._headerNode);
    this._bodyNode = $("div.agent-feedback-widget-body");
    this._bodyNode.classList.add("collapsed");
    this._buildFeedbackItems();
    this._domNode.appendChild(this._bodyNode);
    const arrow = $("div.agent-feedback-widget-arrow");
    this._domNode.appendChild(arrow);
    this._setupEventHandlers();
    this._domNode.classList.add("visible");
    this._editor.addOverlayWidget(this);
  }
  static {
    this._idPool = 0;
  }
  static {
    /**
     * Estimated widget width in px used while the widget DOM node has not been
     * laid out yet. Matches the `max-width` of `.agent-feedback-widget` so we
     * reserve enough scroll space up front; the real width replaces it once the
     * node is rendered.
     */
    this._estimatedWidgetWidth = 280;
  }
  _setupEventHandlers() {
    this._eventStore.add(addDisposableListener(this._toggleButton, "click", (e4) => {
      e4.stopPropagation();
      this._toggleExpanded();
    }));
    this._eventStore.add(addDisposableListener(this._headerNode, "click", () => {
      this._toggleExpanded();
    }));
    this._eventStore.add(addStandardDisposableListener(this._domNode, "keydown", (e4) => {
      if (e4.keyCode !== 9 /* Escape */ || !this._cancelActiveInputs()) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
    }));
  }
  /**
   * Closes every open edit / reply composer. Returns whether any was open.
   */
  _cancelActiveInputs() {
    const cancels = [...this._activeEditInputs.values(), ...this._activeReplyInputs.values()].map((input) => input.cancel);
    for (const cancel of cancels) {
      cancel();
    }
    return cancels.length > 0;
  }
  _setDraft(commentId, kind, text2) {
    this._composerDraftState?.drafts.set(commentId, { kind, text: text2 });
  }
  _clearDraft(commentId) {
    if (!this._composerDraftState) {
      return;
    }
    this._composerDraftState.drafts.delete(commentId);
    if (this._composerDraftState.focusedCommentId === commentId) {
      this._composerDraftState.focusedCommentId = void 0;
    }
  }
  /**
   * Whether a composer should take focus: always for an explicit user action,
   * and for a restored draft only if it had focus when the widget was rebuilt.
   */
  _shouldFocusComposer(commentId, restoredText) {
    return restoredText === void 0 || this._composerDraftState?.focusedCommentId === commentId;
  }
  _focusComposer(textarea) {
    this._composerToFocus = textarea;
    if (textarea.isConnected) {
      this.restoreComposerFocus();
    }
  }
  _toggleExpanded() {
    if (this._isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  _updateTitle() {
    const count2 = this._commentItems.length;
    if (count2 === 1) {
      this._titleNode.textContent = this._commentItems[0].text;
    } else {
      this._titleNode.textContent = localize(4077, null, count2);
    }
  }
  _updateToggleButton() {
    clearNode(this._toggleButton);
    if (this._isExpanded) {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronUp));
      this._toggleButton.title = localize(4068, null);
    } else {
      this._toggleButton.appendChild(renderIcon(Codicon.chevronDown));
      this._toggleButton.title = localize(4073, null);
    }
  }
  _buildFeedbackItems() {
    clearNode(this._bodyNode);
    this._itemElements.clear();
    this._activeReplyInputs.clear();
    this._activeEditInputs.clear();
    this._actionBarElements.clear();
    for (const comment of this._commentItems) {
      const item = $("div.agent-feedback-widget-item");
      item.classList.add(`agent-feedback-widget-item-${comment.source}`);
      if (comment.suggestion) {
        item.classList.add("agent-feedback-widget-item-suggestion");
      }
      this._itemElements.set(comment.id, item);
      const itemHeader = $("div.agent-feedback-widget-item-header");
      const itemMeta = $("div.agent-feedback-widget-item-meta");
      const lineInfo = $("span.agent-feedback-widget-line-info");
      if (comment.range.startLineNumber === comment.range.endLineNumber) {
        lineInfo.textContent = localize(4075, null, comment.range.startLineNumber);
      } else {
        lineInfo.textContent = localize(4076, null, comment.range.startLineNumber, comment.range.endLineNumber);
      }
      itemMeta.appendChild(lineInfo);
      const typeLabel = this._getTypeLabel(comment);
      if (typeLabel) {
        const typeBadge = $("span.agent-feedback-widget-item-type");
        typeBadge.textContent = typeLabel;
        itemMeta.appendChild(typeBadge);
      }
      itemHeader.appendChild(itemMeta);
      const actionBarContainer = $("div.agent-feedback-widget-item-actions");
      const actionBar3 = this._eventStore.add(new ActionBar(actionBarContainer));
      const itemActions = {};
      const showActionButtonsBar = comment.canConvertToAgentFeedback || comment.source === "agentFeedback" /* AgentFeedback */ && comment.state === "created" /* Created */;
      if (comment.state === "resolved" /* Resolved */) {
        actionBar3.push(this._eventStore.add(new Action(
          "agentFeedback.widget.hide",
          localize(4074, null),
          ThemeIcon.asClassName(Codicon.close),
          true,
          () => this._hideComment(comment)
        )), { icon: true, label: false });
      } else {
        itemActions.addReplyAction = this._eventStore.add(new Action(
          "agentFeedback.widget.addReply",
          localize(4065, null),
          ThemeIcon.asClassName(Codicon.commentDiscussion),
          true,
          () => {
            this._startAddingReply(comment, item, itemActions);
          }
        ));
        actionBar3.push(itemActions.addReplyAction, { icon: true, label: false });
        itemActions.editAction = this._eventStore.add(new Action(
          "agentFeedback.widget.edit",
          localize(4072, null),
          ThemeIcon.asClassName(Codicon.edit),
          true,
          () => {
            this._startEditing(comment, text2, itemActions);
          }
        ));
        actionBar3.push(itemActions.editAction, { icon: true, label: false });
        itemActions.removeAction = this._eventStore.add(new Action(
          "agentFeedback.widget.remove",
          localize(4079, null),
          ThemeIcon.asClassName(Codicon.close),
          true,
          () => this._removeComment(comment)
        ));
        if (!showActionButtonsBar) {
          actionBar3.push(itemActions.removeAction, { icon: true, label: false });
        }
      }
      itemHeader.appendChild(actionBarContainer);
      item.appendChild(itemHeader);
      const text2 = $("div.agent-feedback-widget-text");
      const rendered = this._markdownRendererService.render(new MarkdownString(comment.text));
      this._eventStore.add(rendered);
      text2.appendChild(rendered.element);
      item.appendChild(text2);
      if (comment.suggestion?.edits.length) {
        item.appendChild(this._renderSuggestion(comment));
      }
      if (comment.replies?.length) {
        item.appendChild(this._renderReplies(comment.replies));
      }
      if (showActionButtonsBar) {
        this._renderActionButtons(comment, item);
      }
      this._eventStore.add(addDisposableListener(item, "mouseenter", () => {
        this._highlightRange(comment);
      }));
      this._eventStore.add(addDisposableListener(item, "mouseleave", () => {
        this._rangeHighlightDecoration.clear();
      }));
      this._eventStore.add(addDisposableListener(item, "click", (e4) => {
        const target = e4.target;
        if (target?.closest(".action-bar")) {
          return;
        }
        if (target?.closest(".agent-feedback-widget-add-reply")) {
          return;
        }
        if (isTextInputTarget(target)) {
          return;
        }
        if (target?.closest(".agent-feedback-widget-text, .agent-feedback-widget-suggestion-text, .agent-feedback-widget-reply-text")) {
          const selection = this._domNode.ownerDocument.defaultView?.getSelection();
          if (selection && !selection.isCollapsed && this._domNode.contains(selection.anchorNode)) {
            return;
          }
        }
        this.focusFeedback(comment.id);
        this._agentFeedbackService.setNavigationAnchor(this._sessionResource, comment.id);
        this._revealComment(comment);
      }));
      const onSelectableMousedown = (e4) => {
        const target = e4.target;
        if (isTextInputTarget(target)) {
          return;
        }
        if (target?.closest(".agent-feedback-widget-text, .agent-feedback-widget-suggestion-text, .agent-feedback-widget-reply-text")) {
          this._domNode.focus({ preventScroll: true });
        }
      };
      this._eventStore.add(addDisposableListener(item, "mousedown", onSelectableMousedown));
      this._bodyNode.appendChild(item);
      const draft = this._composerDraftState?.drafts.get(comment.id);
      if (draft?.kind === 1 /* Reply */) {
        this._startAddingReply(comment, item, itemActions, draft.text);
      } else if (draft?.kind === 0 /* Edit */) {
        this._startEditing(comment, text2, itemActions, draft.text);
      }
    }
  }
  _getTypeLabel(comment) {
    switch (comment.kind) {
      case "prReview" /* PRReview */:
        return localize(4078, null);
      case "codeReview" /* AgentReview */:
        return localize(4067, null);
      default:
        return void 0;
    }
  }
  _renderSuggestion(comment) {
    const suggestionNode = $("div.agent-feedback-widget-suggestion");
    for (const edit3 of comment.suggestion?.edits ?? []) {
      const editNode = $("div.agent-feedback-widget-suggestion-edit");
      const header2 = $("div.agent-feedback-widget-suggestion-header");
      if (edit3.range.startLineNumber === edit3.range.endLineNumber) {
        header2.textContent = localize(4080, null, edit3.range.startLineNumber);
      } else {
        header2.textContent = localize(4081, null, edit3.range.startLineNumber, edit3.range.endLineNumber);
      }
      editNode.appendChild(header2);
      const newText = $("pre.agent-feedback-widget-suggestion-text");
      newText.textContent = edit3.newText;
      editNode.appendChild(newText);
      suggestionNode.appendChild(editNode);
    }
    return suggestionNode;
  }
  _renderReplies(replies) {
    const repliesNode = $("div.agent-feedback-widget-replies");
    for (const reply of replies) {
      const replyNode = $("div.agent-feedback-widget-reply");
      if (reply.author === "agent") {
        const author = $("div.agent-feedback-widget-reply-author");
        author.textContent = localize(4066, null);
        replyNode.appendChild(author);
      }
      const replyText = $("div.agent-feedback-widget-reply-text");
      const rendered = this._markdownRendererService.render(new MarkdownString(reply.text));
      this._eventStore.add(rendered);
      replyText.appendChild(rendered.element);
      replyNode.appendChild(replyText);
      repliesNode.appendChild(replyNode);
    }
    return repliesNode;
  }
  /**
   * Renders the Accept / Remove button bar shown at the bottom of a
   * `created` agent feedback comment or a PR review comment. Clicking either
   * button performs the action and removes the bar. For PR review comments
   * "Accept" converts the comment into agent feedback; for agent feedback it
   * marks the comment as accepted.
   */
  _renderActionButtons(comment, item) {
    const buttonBar = $("div.agent-feedback-widget-actions-bar");
    const buttonStore = new DisposableStore();
    this._eventStore.add(buttonStore);
    buttonStore.add(addDisposableListener(buttonBar, "click", (e4) => e4.stopPropagation()));
    const dismiss = () => {
      buttonStore.dispose();
      buttonBar.remove();
      this._actionBarElements.delete(comment.id);
      this._domNode.focus({ preventScroll: true });
      this._editor.layoutOverlayWidget(this);
    };
    const isPRComment = comment.source === "prReview" /* PRReview */;
    const acceptTooltip = isPRComment ? localize(4063, null) : localize(4061, null);
    const deleteTooltip = isPRComment ? localize(4071, null) : localize(4069, null);
    const acceptButton = buttonStore.add(new Button(buttonBar, {
      title: acceptTooltip,
      buttonBackground: "var(--vscode-charts-purple)",
      buttonHoverBackground: "color-mix(in srgb, var(--vscode-charts-purple) 85%, var(--vscode-foreground))",
      buttonForeground: "var(--vscode-button-foreground)",
      buttonBorder: "var(--vscode-charts-purple)"
    }));
    acceptButton.label = localize(4062, null);
    buttonStore.add(acceptButton.onDidClick(() => {
      if (comment.canConvertToAgentFeedback) {
        this._convertToAgentFeedback(comment);
      } else {
        this._acceptFeedback(comment);
      }
      dismiss();
    }));
    const deleteButton2 = buttonStore.add(new Button(buttonBar, {
      title: deleteTooltip,
      secondary: true,
      buttonSecondaryBackground: "var(--vscode-button-secondaryBackground)",
      buttonSecondaryHoverBackground: "var(--vscode-button-secondaryHoverBackground)",
      buttonSecondaryForeground: "var(--vscode-button-secondaryForeground)",
      buttonSecondaryBorder: "var(--vscode-button-secondaryBorder)"
    }));
    deleteButton2.label = localize(4070, null);
    buttonStore.add(deleteButton2.onDidClick(() => {
      this._removeComment(comment);
      dismiss();
    }));
    item.appendChild(buttonBar);
    this._actionBarElements.set(comment.id, buttonBar);
  }
  _removeComment(comment) {
    if (comment.source === "prReview" /* PRReview */) {
      this._codeReviewService.resolvePRReviewThread(this._sessionResource, comment.sourceId);
      return;
    }
    this._agentFeedbackService.removeFeedback(this._sessionResource, comment.sourceId);
  }
  _hideComment(comment) {
    this._agentFeedbackService.hideFeedbackInEditor(this._sessionResource, comment.sourceId);
  }
  _startEditing(comment, textContainer, actions, restoredText) {
    const existing = this._activeEditInputs.get(comment.id);
    if (existing) {
      existing.textarea.focus();
      return;
    }
    this._setItemActionsEnabled(actions, false);
    const editStore = new DisposableStore();
    this._eventStore.add(editStore);
    clearNode(textContainer);
    textContainer.classList.add("editing");
    const textarea = $("textarea.agent-feedback-widget-edit-textarea");
    textarea.value = restoredText ?? comment.text;
    textarea.rows = 1;
    textContainer.appendChild(textarea);
    this._activeEditInputs.set(comment.id, {
      textarea,
      cancel: () => this._stopEditing(comment, textContainer, editStore, actions)
    });
    this._setDraft(comment.id, 0 /* Edit */, textarea.value);
    const autoSize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      this._editor.layoutOverlayWidget(this);
    };
    autoSize();
    editStore.add(addDisposableListener(textarea, "input", () => {
      this._setDraft(comment.id, 0 /* Edit */, textarea.value);
      autoSize();
    }));
    editStore.add(addStandardDisposableListener(textarea, "keydown", (e4) => {
      if (e4.keyCode === 3 /* Enter */ && !e4.shiftKey) {
        e4.preventDefault();
        e4.stopPropagation();
        const newText = textarea.value.trim();
        if (newText) {
          this._clearDraft(comment.id);
          this._saveEdit(comment, newText);
        } else {
          this._stopEditing(comment, textContainer, editStore, actions);
        }
      } else if (e4.keyCode === 9 /* Escape */) {
        e4.preventDefault();
        e4.stopPropagation();
        this._stopEditing(comment, textContainer, editStore, actions);
      }
    }));
    if (this._shouldFocusComposer(comment.id, restoredText)) {
      this._focusComposer(textarea);
    }
  }
  _startAddingReply(comment, itemNode, actions, restoredText) {
    const existing = this._activeReplyInputs.get(comment.id);
    if (existing) {
      existing.textarea.focus();
      return;
    }
    this._setItemActionsEnabled(actions, false);
    const replyStore = new DisposableStore();
    this._eventStore.add(replyStore);
    const replyContainer = $("div.agent-feedback-widget-add-reply");
    const textarea = $("textarea.agent-feedback-widget-edit-textarea");
    textarea.placeholder = localize(4064, null);
    textarea.rows = 1;
    if (restoredText !== void 0) {
      textarea.value = restoredText;
    }
    replyContainer.appendChild(textarea);
    const actionsBar = this._actionBarElements.get(comment.id);
    if (actionsBar) {
      itemNode.insertBefore(replyContainer, actionsBar);
    } else {
      itemNode.appendChild(replyContainer);
    }
    this._activeReplyInputs.set(comment.id, { textarea, cancel: () => cleanup() });
    this._setDraft(comment.id, 1 /* Reply */, textarea.value);
    const autoSize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      this._editor.layoutOverlayWidget(this);
    };
    autoSize();
    replyStore.add(addDisposableListener(textarea, "input", () => {
      this._setDraft(comment.id, 1 /* Reply */, textarea.value);
      autoSize();
    }));
    const cleanup = () => {
      replyStore.dispose();
      this._setItemActionsEnabled(actions, true);
      this._activeReplyInputs.delete(comment.id);
      replyContainer.remove();
      this._clearDraft(comment.id);
      this._editor.layoutOverlayWidget(this);
    };
    replyStore.add(addStandardDisposableListener(textarea, "keydown", (e4) => {
      if (e4.keyCode === 3 /* Enter */ && !e4.shiftKey) {
        e4.preventDefault();
        e4.stopPropagation();
        const newReply = textarea.value.trim();
        if (newReply) {
          this._clearDraft(comment.id);
          this._saveReply(comment, newReply);
        } else {
          cleanup();
        }
      } else if (e4.keyCode === 9 /* Escape */) {
        e4.preventDefault();
        e4.stopPropagation();
        cleanup();
      }
    }));
    if (this._shouldFocusComposer(comment.id, restoredText)) {
      this._focusComposer(textarea);
    }
  }
  /**
   * Focuses the composer restored from a draft, if any. Must be called once the
   * widget is in the DOM — focusing a detached element has no effect.
   */
  restoreComposerFocus() {
    const textarea = this._composerToFocus;
    this._composerToFocus = void 0;
    if (!textarea) {
      return;
    }
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }
  _saveReply(comment, replyText) {
    if (comment.source === "agentFeedback" /* AgentFeedback */) {
      this._agentFeedbackService.addReply(this._sessionResource, comment.sourceId, replyText);
      return;
    }
    if (!comment.canConvertToAgentFeedback) {
      return;
    }
    const feedback = this._agentFeedbackService.addFeedback(
      this._sessionResource,
      comment.resourceUri,
      comment.range,
      comment.text,
      comment.suggestion,
      createAgentFeedbackContext(this._editor, this._codeEditorService, comment.resourceUri, comment.range),
      comment.sourceId,
      "prReview" /* PRReview */,
      void 0,
      comment.sourcePullRequest
    );
    this._agentFeedbackService.addReply(this._sessionResource, feedback.id, replyText);
    this._agentFeedbackService.setNavigationAnchor(this._sessionResource, toSessionEditorCommentId("agentFeedback" /* AgentFeedback */, feedback.id));
    this._codeReviewService.markPRReviewCommentConverted(this._sessionResource, comment.sourceId);
  }
  _saveEdit(comment, newText) {
    if (comment.source === "agentFeedback" /* AgentFeedback */) {
      this._agentFeedbackService.updateFeedback(this._sessionResource, comment.sourceId, newText);
    } else {
      this._convertToAgentFeedbackWithText(comment, newText);
    }
  }
  _stopEditing(comment, textContainer, editStore, actions) {
    editStore.dispose();
    this._activeEditInputs.delete(comment.id);
    this._clearDraft(comment.id);
    this._setItemActionsEnabled(actions, true);
    textContainer.classList.remove("editing");
    clearNode(textContainer);
    const rendered = this._markdownRendererService.render(new MarkdownString(comment.text));
    this._eventStore.add(rendered);
    textContainer.appendChild(rendered.element);
    this._editor.layoutOverlayWidget(this);
  }
  _setItemActionsEnabled(actions, enabled) {
    for (const action of [actions.editAction, actions.removeAction, actions.addReplyAction]) {
      if (action) {
        action.enabled = enabled;
      }
    }
  }
  _convertToAgentFeedback(comment) {
    this._convertToAgentFeedbackWithText(comment, comment.text);
  }
  /**
   * Accept a Created agent feedback item so it becomes submittable.
   */
  _acceptFeedback(comment) {
    if (comment.source !== "agentFeedback" /* AgentFeedback */) {
      return;
    }
    this._agentFeedbackService.acceptFeedback(this._sessionResource, comment.sourceId);
    this._agentFeedbackService.setNavigationAnchor(this._sessionResource, comment.id);
  }
  /**
   * Converts a non-agent-feedback comment into an agent feedback item, optionally with edited text.
   */
  _convertToAgentFeedbackWithText(comment, text2) {
    if (!comment.canConvertToAgentFeedback) {
      return;
    }
    const feedback = this._agentFeedbackService.addFeedback(
      this._sessionResource,
      comment.resourceUri,
      comment.range,
      text2,
      comment.suggestion,
      createAgentFeedbackContext(this._editor, this._codeEditorService, comment.resourceUri, comment.range),
      comment.sourceId,
      "prReview" /* PRReview */,
      void 0,
      comment.sourcePullRequest
    );
    this._agentFeedbackService.setNavigationAnchor(this._sessionResource, toSessionEditorCommentId("agentFeedback" /* AgentFeedback */, feedback.id));
    this._codeReviewService.markPRReviewCommentConverted(this._sessionResource, comment.sourceId);
  }
  /**
   * Expand the widget body.
   */
  expand() {
    const wasExpanded = this._isExpanded;
    this._isExpanded = true;
    this._domNode.classList.remove("collapsed");
    this._bodyNode.classList.remove("collapsed");
    this._updateToggleButton();
    this._editor.layoutOverlayWidget(this);
    if (!wasExpanded) {
      this._onDidExpand.fire();
    }
  }
  get isExpanded() {
    return this._isExpanded;
  }
  /**
   * Collapse the widget body.
   */
  collapse() {
    this._isExpanded = false;
    this._domNode.classList.add("collapsed");
    this._bodyNode.classList.add("collapsed");
    this._updateToggleButton();
    this.clearFocus();
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Focus a specific feedback item within this widget.
   * Highlights its range in the editor and marks it as focused.
   */
  focusFeedback(feedbackId) {
    for (const el of this._itemElements.values()) {
      el.classList.remove("focused");
    }
    const feedback = this._commentItems.find((f) => f.id === feedbackId);
    if (!feedback) {
      return;
    }
    const itemEl = this._itemElements.get(feedbackId);
    itemEl?.classList.add("focused");
    this._highlightRange(feedback);
  }
  /**
   * Clear focus state and range highlighting.
   */
  clearFocus() {
    for (const el of this._itemElements.values()) {
      el.classList.remove("focused");
    }
    this._rangeHighlightDecoration.clear();
  }
  _highlightRange(feedback) {
    const endLineNumber = feedback.range.endLineNumber;
    const range2 = new Range2(
      feedback.range.startLineNumber,
      1,
      endLineNumber,
      this._editor.getModel()?.getLineMaxColumn(endLineNumber) ?? 1
    );
    this._rangeHighlightDecoration.set([
      {
        range: range2,
        options: {
          description: "agent-feedback-range-highlight",
          className: "rangeHighlight",
          isWholeLine: true,
          linesDecorationsClassName: "agent-feedback-widget-range-glyph"
        }
      },
      {
        range: range2,
        options: {
          description: "agent-feedback-range-highlight-overview",
          overviewRuler: {
            color: themeColorFromId2(overviewRulerRangeHighlight),
            position: 7 /* Full */
          }
        }
      }
    ]);
  }
  /**
   * Returns true if this widget contains the given feedback item (by id).
   */
  containsFeedback(feedbackId) {
    return this._commentItems.some((f) => f.id === feedbackId);
  }
  /**
   * Returns the comment id whose open composer is the given element, or
   * `undefined` if none. Lets the contribution restore focus after a rebuild.
   */
  findComposerCommentIdForElement(element) {
    for (const [commentId, { textarea }] of [...this._activeEditInputs, ...this._activeReplyInputs]) {
      if (textarea === element) {
        return commentId;
      }
    }
    return void 0;
  }
  /**
   * Ids of the comments rendered by this widget. Used by the contribution
   * to prune draft state for comments that no longer exist.
   */
  getCommentIds() {
    return this._commentItems.map((comment) => comment.id);
  }
  /**
   * Updates the widget position and layout.
   */
  layout(startLineNumber) {
    if (this._disposed) {
      return;
    }
    if (startLineNumber !== this._startLineNumber) {
      this._cachedMinContentWidth = void 0;
    }
    this._startLineNumber = startLineNumber;
    const lineHeight = this._editor.getOption(75 /* lineHeight */);
    const { contentLeft, contentWidth, verticalScrollbarWidth } = this._editor.getLayoutInfo();
    const scrollTop = this._editor.getScrollTop();
    const widgetWidth = getTotalWidth(this._domNode) || 280;
    const widgetHeight = this._domNode.offsetHeight || 0;
    const headerHeight = this._headerNode.offsetHeight || lineHeight;
    const contentRelativeTop = this._editor.getTopForLineNumber(startLineNumber) + (lineHeight - headerHeight) / 2;
    const scrollHeight = this._editor.getScrollHeight();
    const clampedContentTop = Math.min(Math.max(0, contentRelativeTop), Math.max(0, scrollHeight - widgetHeight));
    this._position = {
      stackOrdinal: 2,
      preference: {
        top: clampedContentTop - scrollTop,
        left: contentLeft + contentWidth - (2 * verticalScrollbarWidth + widgetWidth)
      }
    };
    this._editor.layoutOverlayWidget(this);
  }
  /**
   * Shows or hides the widget.
   */
  toggle(show3) {
    this._domNode.classList.toggle("visible", show3);
    if (show3 && this._commentItems.length > 0) {
      this.layout(this._commentItems[0].range.startLineNumber);
    }
  }
  /**
   * Relayouts the widget at its current line number.
   */
  relayout() {
    if (this._startLineNumber) {
      this.layout(this._startLineNumber);
    }
  }
  // IOverlayWidget implementation
  getId() {
    return this._id;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return this._position;
  }
  /**
   * Reserve enough horizontal scroll width so the user can always scroll the
   * editor content out from underneath the widget. The widget is anchored to
   * the right edge of the editor content area, so without this reservation any
   * line that extends under the widget cannot be revealed because the editor
   * cannot scroll past its longest line.
   *
   * The reserved width is the widget width plus the widest content among the
   * anchored line and the lines immediately above and below it. The result is
   * computed once using the real rendered widget width and cached afterwards.
   * Until the widget DOM node has a real width we fall back to an estimate and
   * skip caching so the value is recomputed once it is actually rendered. The
   * cache is also invalidated by `layout` whenever the anchor line changes.
   */
  getMinContentWidthInPx() {
    if (this._disposed) {
      return 0;
    }
    if (this._cachedMinContentWidth !== void 0) {
      return this._cachedMinContentWidth;
    }
    const model = this._editor.getModel();
    if (!model) {
      return 0;
    }
    const renderedWidth = getTotalWidth(this._domNode);
    const hasRenderedWidth = renderedWidth > 0;
    const widgetWidth = hasRenderedWidth ? renderedWidth : AgentFeedbackEditorWidget._estimatedWidgetWidth;
    const lineCount = model.getLineCount();
    let maxLineWidth = 0;
    let measuredAnyLine = false;
    for (let lineNumber = this._startLineNumber - 1; lineNumber <= this._startLineNumber + 1; lineNumber++) {
      if (lineNumber < 1 || lineNumber > lineCount) {
        continue;
      }
      const lineWidth = this._editor.getWidthOfLine(lineNumber);
      if (lineWidth < 0) {
        continue;
      }
      measuredAnyLine = true;
      if (lineWidth > maxLineWidth) {
        maxLineWidth = lineWidth;
      }
    }
    const { verticalScrollbarWidth } = this._editor.getLayoutInfo();
    const result = maxLineWidth + widgetWidth + 2 * verticalScrollbarWidth;
    if (hasRenderedWidth && measuredAnyLine) {
      this._cachedMinContentWidth = result;
    }
    return result;
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._rangeHighlightDecoration.clear();
    this._editor.removeOverlayWidget(this);
    super.dispose();
  }
  _revealComment(comment) {
    const range2 = new Range2(
      comment.range.startLineNumber,
      1,
      comment.range.endLineNumber,
      this._editor.getModel()?.getLineMaxColumn(comment.range.endLineNumber) ?? 1
    );
    this._editor.revealRangeInCenterIfOutsideViewport(range2, 0 /* Smooth */);
  }
};

AgentFeedbackEditorWidget = __decorateClass([
  __decorateParam(4, IAgentFeedbackService),
  __decorateParam(5, ICodeReviewService),
  __decorateParam(6, IMarkdownRendererService),
  __decorateParam(7, ICodeEditorService)
], AgentFeedbackEditorWidget);
export { isTextInputTarget, AgentFeedbackEditorWidget };
