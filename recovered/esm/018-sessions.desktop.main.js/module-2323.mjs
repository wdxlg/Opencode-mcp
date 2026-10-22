// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatAgentFeedbackReviewConfirmationSubPart.ts
import { AbstractToolConfirmationSubPart } from "./module-2320.mjs";
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ChatCustomConfirmationWidget } from "./module-2274.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { IChatToolRiskAssessmentService } from "./module-2279.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILogService } from "./module-0095.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatAgentFeedbackReviewConfirmationSubPart.ts
var ChatAgentFeedbackReviewConfirmationSubPart = class extends AbstractToolConfirmationSubPart {
  constructor(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService, commandService, logService, notificationService, hoverService) {
    super(toolInvocation, context2, instantiationService, keybindingService, contextKeyService, chatWidgetService, languageModelToolsService, riskAssessmentService);
    this.commandService = commandService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.hoverService = hoverService;
    this.codeblocks = [];
    this._rows = /* @__PURE__ */ new Map();
    this._rowStores = this._register(new DisposableMap());
    this._onDidChangeRevealButtonDisablement = this._register(new Emitter());
    const data = toolInvocation.toolSpecificData;
    if (!data || data.kind !== "agentFeedbackReviewConfirmation") {
      throw new Error("Agent feedback review confirmation data is missing");
    }
    this._resourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    const listElement = $(".chat-agent-feedback-review-list");
    void this._populate(listElement);
    const revealLabel = data.options[0] ?? localize(12207, null);
    const buttons = [
      {
        label: revealLabel,
        data: () => this._onReveal(),
        disabled: true,
        onDidChangeDisablement: this._onDidChangeRevealButtonDisablement.event
      },
      {
        label: localize(12201, null),
        isSecondary: true,
        data: () => this.confirmWith(this.toolInvocation, { type: 5 /* Skipped */ })
      }
    ];
    const confirmWidget = this._register(this.instantiationService.createInstance(
      ChatCustomConfirmationWidget,
      this.context,
      {
        title: this.getTitle(),
        icon: Codicon.commentDiscussion,
        message: listElement,
        buttons
      }
    ));
    const hasToolConfirmation = ChatContextKeys.Editing.hasToolConfirmation.bindTo(this.contextKeyService);
    hasToolConfirmation.set(true);
    this._register(confirmWidget.onDidClick(({ button, isTouchClick }) => {
      button.data();
      if (!isTouchClick) {
        this.chatWidgetService.getWidgetBySessionResource(this.context.element.sessionResource)?.focusInput();
      }
    }));
    this._register(toDisposable(() => hasToolConfirmation.reset()));
    this.domNode = confirmWidget.domNode;
  }
  get _sessionResource() {
    return this.context.element.sessionResource;
  }
  async _populate(listElement) {
    let comments = [];
    try {
      comments = await this.commandService.executeCommand(
        "_agentFeedbackReview.getComments" /* GetComments */,
        this._sessionResource
      ) ?? [];
    } catch (error) {
      this.logService.warn("[AgentFeedbackReview] Failed to fetch unreviewed comments", error);
    }
    if (this._store.isDisposed) {
      return;
    }
    clearNode(listElement);
    if (!comments.length) {
      listElement.append($(".chat-agent-feedback-review-empty", void 0, localize(12205, null)));
      return;
    }
    for (const comment of comments) {
      this._renderRow(listElement, comment);
    }
  }
  _renderRow(listElement, comment) {
    const rowStore = new DisposableStore();
    this._rowStores.set(comment.id, rowStore);
    const rowElement = append(listElement, $(".chat-agent-feedback-review-row"));
    const checkbox = rowStore.add(new Checkbox(
      localize(12208, null),
      true,
      defaultCheckboxStyles
    ));
    append(rowElement, checkbox.domNode);
    const main2 = append(rowElement, $(".chat-agent-feedback-review-main"));
    const header2 = append(main2, $(".chat-agent-feedback-review-header"));
    if (comment.kindLabel) {
      append(header2, $(".chat-agent-feedback-review-kind", void 0, comment.kindLabel));
    }
    const fileUri = URI.revive(comment.fileUri);
    const fileLabel = rowStore.add(this._resourceLabels.create(header2));
    fileLabel.element.classList.add("chat-agent-feedback-review-file");
    fileLabel.setResource(
      { resource: fileUri, name: basename2(fileUri) },
      { fileKind: 0 /* FILE */, title: fileUri.fsPath || fileUri.path }
    );
    const actionsContainer = append(rowElement, $(".chat-agent-feedback-review-actions"));
    const actionBar3 = rowStore.add(new ActionBar(actionsContainer));
    actionBar3.push(rowStore.add(new Action(
      "agentFeedbackReview.reveal",
      localize(12206, null),
      ThemeIcon.asClassName(Codicon.goToFile),
      true,
      () => this._reveal(comment.id)
    )), { icon: true, label: false });
    actionBar3.push(rowStore.add(new Action(
      "agentFeedbackReview.delete",
      localize(12203, null),
      ThemeIcon.asClassName(Codicon.closeSmall),
      true,
      () => this._delete(comment.id)
    )), { icon: true, label: false });
    this._renderCommentText(rowStore, main2, actionsContainer, comment.text);
    this._rows.set(comment.id, { comment, checkbox, element: rowElement });
    rowStore.add(checkbox.onChange(() => this._updateRevealButtonDisablement()));
    this._updateRevealButtonDisablement();
  }
  _updateRevealButtonDisablement() {
    this._onDidChangeRevealButtonDisablement.fire(![...this._rows.values()].some((row) => row.checkbox.checked));
  }
  /**
   * Renders the comment body clamped to two visual lines by default, with an
   * expand/collapse toggle below the row actions. The toggle and fade affordance
   * only appear when the text overflows two lines.
   */
  _renderCommentText(rowStore, main2, actionsContainer, text2) {
    const container2 = append(main2, $(".chat-agent-feedback-review-text-container"));
    const textElement = append(container2, $(".chat-agent-feedback-review-text"));
    textElement.textContent = text2;
    const toggle = append(actionsContainer, $("button.chat-agent-feedback-review-expand-toggle"));
    toggle.type = "button";
    toggle.tabIndex = 0;
    const toggleIcon = append(toggle, $("span.codicon"));
    toggleIcon.setAttribute("aria-hidden", "true");
    const expandLabel = localize(12204, null);
    const collapseLabel = localize(12202, null);
    let expanded2 = false;
    const renderState = () => {
      container2.classList.toggle("collapsed", !expanded2);
      container2.classList.toggle("expanded", expanded2);
      toggleIcon.classList.toggle("codicon-chevron-down", !expanded2);
      toggleIcon.classList.toggle("codicon-chevron-up", expanded2);
      toggle.setAttribute("aria-label", expanded2 ? collapseLabel : expandLabel);
      toggle.setAttribute("aria-expanded", String(expanded2));
    };
    const isOverflowing = () => {
      const wasExpanded = expanded2;
      if (wasExpanded) {
        container2.classList.add("collapsed");
        container2.classList.remove("expanded");
      }
      const overflowing = textElement.scrollHeight - textElement.clientHeight > 1;
      if (wasExpanded) {
        container2.classList.remove("collapsed");
        container2.classList.add("expanded");
      }
      return overflowing;
    };
    const updateOverflow = () => {
      const overflowing = isOverflowing();
      container2.classList.toggle("overflowing", overflowing);
      toggle.classList.toggle("visible", overflowing);
      if (!overflowing && expanded2) {
        expanded2 = false;
        renderState();
      }
    };
    rowStore.add(this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      toggle,
      () => expanded2 ? collapseLabel : expandLabel
    ));
    rowStore.add(addDisposableListener(toggle, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      container2.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
      expanded2 = !expanded2;
      renderState();
    }));
    renderState();
    const targetWindow = getWindow(container2);
    const observer = new targetWindow.ResizeObserver(() => updateOverflow());
    observer.observe(textElement);
    rowStore.add(toDisposable(() => observer.disconnect()));
  }
  async _reveal(commentId) {
    try {
      await this.commandService.executeCommand("_agentFeedbackReview.reveal" /* Reveal */, this._sessionResource, commentId);
    } catch (error) {
      this.logService.warn("[AgentFeedbackReview] Failed to reveal comment", error);
    }
  }
  async _delete(commentId) {
    const row = this._rows.get(commentId);
    try {
      await this.commandService.executeCommand("_agentFeedbackReview.delete" /* Delete */, this._sessionResource, commentId);
      row?.element.remove();
      this._rows.delete(commentId);
      this._rowStores.deleteAndDispose(commentId);
      this._updateRevealButtonDisablement();
    } catch (error) {
      this.logService.warn("[AgentFeedbackReview] Failed to delete comment", error);
    }
  }
  async _onReveal() {
    const checkedIds = [];
    for (const row of this._rows.values()) {
      if (row.checkbox.checked) {
        checkedIds.push(row.comment.id);
      }
    }
    if (!checkedIds.length) {
      return;
    }
    try {
      await this.commandService.executeCommand("_agentFeedbackReview.accept" /* Accept */, this._sessionResource, checkedIds);
    } catch (error) {
      this.logService.warn("[AgentFeedbackReview] Failed to accept comments", error);
      this.notificationService.notify({
        severity: Severity2.Error,
        message: localize(12200, null)
      });
      return;
    }
    this.confirmWith(this.toolInvocation, { type: 4 /* UserAction */ });
  }
  createContentElement() {
    return "";
  }
  getTitle() {
    const state = this.toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
      return "";
    }
    const title = state.confirmationMessages?.title;
    return typeof title === "string" ? title : title?.value ?? "";
  }
};

ChatAgentFeedbackReviewConfirmationSubPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, ILanguageModelToolsService),
  __decorateParam(7, IChatToolRiskAssessmentService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, ILogService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IHoverService)
], ChatAgentFeedbackReviewConfirmationSubPart);
export { ChatAgentFeedbackReviewConfirmationSubPart };
