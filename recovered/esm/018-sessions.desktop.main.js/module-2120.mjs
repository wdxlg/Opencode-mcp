// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatQuestionCarouselPart.ts
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableListener, clearNode, getWindow, isAncestorOfActiveElement, isHTMLElement, runAtThisOrScheduleAtNextAnimationFrame, trackFocus } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getCompactCodicon } from "./module-2035.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CHAT_CARD_HEADER_CLASS, CHAT_CARD_LARGE_CLASS, CHAT_CARD_TITLE_CLASS, createChatCardIconButton } from "./module-2109.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { localize } from "./module-0001.mjs";
import { ChatQuestionCarouselData } from "./module-1192.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { Codicon } from "./module-0085.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { findQuestionValidationFailure, getDisplayedQuestionText, getOptionsWithDefaultsFirst } from "./module-2064.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { getChatMarkdownRenderOptions } from "./module-2117.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { InputBox } from "./module-0600.mjs";
import { hasKey } from "./module-0010.mjs";
import { ChatCardListbox } from "./module-2119.mjs";
import { Checkbox } from "./module-0549.mjs";
import { AgentHostAutoReplyAnswer } from "./module-1741.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalChatService } from "./module-1150.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatQuestionCarouselPart.ts
var PREVIOUS_QUESTION_ACTION_ID = "workbench.action.chat.previousQuestion";

var NEXT_QUESTION_ACTION_ID = "workbench.action.chat.nextQuestion";

var ChatQuestionAnswerCollapsiblePart = class extends ChatCollapsibleContentPart {
  constructor(title, prefix, value2, answerIcon, context2, contentFactory, onDidChangeHeight, hoverService, configurationService) {
    super(title, context2, void 0, hoverService, configurationService);
    this.prefix = prefix;
    this.value = value2;
    this.answerIcon = answerIcon;
    this.contentFactory = contentFactory;
    this.onDidChangeHeight = onDidChangeHeight;
  }
  init() {
    const element = super.init();
    element.classList.toggle("chat-question-answer-expandable", !!this.contentFactory);
    if (this._collapseButton) {
      const labelElement = this._collapseButton.labelElement;
      labelElement.textContent = "";
      const icon2 = $("span.chat-question-summary-answer-icon");
      icon2.classList.add(...ThemeIcon.asClassNameArray(getCompactCodicon(this.answerIcon)));
      icon2.setAttribute("aria-hidden", "true");
      const value2 = $("span.chat-question-summary-answer-value");
      value2.textContent = this.value;
      this._register(this.hoverService.setupDelayedHover(value2, { content: this.value }));
      labelElement.appendChild(icon2);
      if (this.prefix) {
        const prefix = $("span.chat-question-summary-prefix");
        prefix.textContent = this.prefix;
        labelElement.append(prefix, labelElement.ownerDocument.createTextNode(" "));
      }
      labelElement.appendChild(value2);
      if (!this.contentFactory) {
        this._collapseButton.element.tabIndex = -1;
        this._collapseButton.element.setAttribute("aria-disabled", "true");
        this._collapseButton.element.removeAttribute("aria-expanded");
        this._hoverChevron?.remove();
      }
    }
    return element;
  }
  initContent() {
    return this.contentFactory?.() ?? $(".chat-question-summary-empty-content");
  }
  expansionDidChange() {
    this.onDidChangeHeight();
  }
  hasSameContent(_other, _followingContent, _element) {
    return false;
  }
};

var ChatQuestionCarouselPart = class extends Disposable {
  constructor(carousel, _context, _options, _markdownRendererService, _hoverService, _accessibilityService, _contextKeyService, _keybindingService, _commandService, _configurationService, _terminalChatService) {
    super();
    this.carousel = carousel;
    this._context = _context;
    this._options = _options;
    this._markdownRendererService = _markdownRendererService;
    this._hoverService = _hoverService;
    this._accessibilityService = _accessibilityService;
    this._contextKeyService = _contextKeyService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._terminalChatService = _terminalChatService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._currentIndex = 0;
    this._answers = /* @__PURE__ */ new Map();
    this._isCollapsed = false;
    this._isSkipped = false;
    this._textInputBoxes = /* @__PURE__ */ new Map();
    this._singleSelectItems = /* @__PURE__ */ new Map();
    this._multiSelectCheckboxes = /* @__PURE__ */ new Map();
    this._freeformTextareas = /* @__PURE__ */ new Map();
    this._inputBoxes = this._register(new DisposableStore());
    this._questionRenderStore = this._register(new MutableDisposable());
    /**
     * Disposable store for interactive UI components (header, nav buttons, etc.)
     * that should be disposed when transitioning to summary view.
     */
    this._interactiveUIStore = this._register(new MutableDisposable());
    this.domNode = $(`.chat-question-carousel-container.${CHAT_CARD_LARGE_CLASS}`);
    this.domNode.classList.toggle("chat-question-carousel-conversation", carousel.answerPresentation === "conversation");
    this.domNode.id = generateUuid();
    this._inChatQuestionCarouselContextKey = ChatContextKeys.inChatQuestionCarousel.bindTo(this._contextKeyService);
    this._chatQuestionCarouselHasTerminalContextKey = ChatContextKeys.chatQuestionCarouselHasTerminal.bindTo(this._contextKeyService);
    const focusTracker = this._register(trackFocus(this.domNode));
    this._register(focusTracker.onDidFocus(() => {
      this._inChatQuestionCarouselContextKey.set(true);
      this._chatQuestionCarouselHasTerminalContextKey.set(!!this.carousel.terminalId);
    }));
    this._register(focusTracker.onDidBlur(() => {
      this._inChatQuestionCarouselContextKey.set(false);
      this._chatQuestionCarouselHasTerminalContextKey.reset();
    }));
    this._register({ dispose: () => {
      this._inChatQuestionCarouselContextKey.reset();
      this._chatQuestionCarouselHasTerminalContextKey.reset();
    } });
    this.domNode.tabIndex = 0;
    this.domNode.setAttribute("role", "region");
    this.domNode.setAttribute("aria-roledescription", localize(12016, null));
    this._updateAriaLabel();
    if (carousel instanceof ChatQuestionCarouselData) {
      if (typeof carousel.draftCurrentIndex === "number") {
        this._currentIndex = Math.max(0, Math.min(carousel.draftCurrentIndex, carousel.questions.length - 1));
      }
      if (typeof carousel.draftCollapsed === "boolean") {
        this._isCollapsed = carousel.draftCollapsed;
      }
      if (carousel.draftAnswers) {
        for (const [key3, value2] of Object.entries(carousel.draftAnswers)) {
          this._answers.set(key3, value2);
        }
      }
    }
    if (carousel.data) {
      for (const [key3, value2] of Object.entries(carousel.data)) {
        this._answers.set(key3, value2);
      }
    }
    const responseIsComplete = isResponseVM(this._context.element) && this._context.element.isComplete;
    if (carousel.isUsed || responseIsComplete) {
      this._isSkipped = true;
      this.domNode.classList.add("chat-question-carousel-used");
      this.renderSummary();
      return;
    }
    const interactiveStore = new DisposableStore();
    this._interactiveUIStore.value = interactiveStore;
    this._questionContainer = $(".chat-question-carousel-content");
    this.domNode.append(this._questionContainer);
    this._headerActionsContainer = $(".chat-question-header-actions");
    const collapseToggleTitle = localize(11993, null);
    const collapseButton = createChatCardIconButton(interactiveStore, this._headerActionsContainer, this._hoverService, {
      ariaLabel: collapseToggleTitle
    });
    collapseButton.element.classList.add("chat-question-collapse-toggle");
    this._collapseButton = collapseButton;
    if (carousel.allowSkip) {
      this._closeButtonContainer = $(".chat-question-close-container");
      const skipAllTitle = localize(12020, null);
      const skipAllButton = createChatCardIconButton(interactiveStore, this._closeButtonContainer, this._hoverService, {
        icon: Codicon.closeSmall,
        ariaLabel: skipAllTitle,
        hoverContent: skipAllTitle
      });
      skipAllButton.element.classList.add("chat-question-close");
      this._skipAllButton = skipAllButton;
    }
    if (carousel.terminalId) {
      this._focusTerminalButtonContainer = $(".chat-question-focus-terminal-container");
      const focusTerminalTitle = localize(12004, null);
      const kbLabel = this._keybindingService.lookupKeybinding("workbench.action.chat.focusQuestionCarouselTerminal")?.getLabel();
      const focusTerminalAriaLabel = kbLabel ? localize(12003, null, kbLabel) : focusTerminalTitle;
      const focusTerminalButton = createChatCardIconButton(interactiveStore, this._focusTerminalButtonContainer, this._hoverService, {
        icon: Codicon.terminal,
        ariaLabel: focusTerminalAriaLabel,
        hoverContent: focusTerminalTitle
      });
      focusTerminalButton.element.classList.add("chat-question-focus-terminal");
      interactiveStore.add(focusTerminalButton.onDidClick(() => this._focusTerminal()));
      const terminalInstance = this._terminalChatService.getTerminalInstanceByExecutionId(carousel.terminalId);
      if (terminalInstance) {
        interactiveStore.add(terminalInstance.onDidInputData(() => {
          if (!this._isSkipped) {
            if (carousel instanceof ChatQuestionCarouselData) {
              carousel.dismissedByTerminalInput = true;
            }
            this.ignore();
          }
        }));
      }
    }
    interactiveStore.add(collapseButton.onDidClick(() => this.toggleCollapsed()));
    if (this._skipAllButton) {
      interactiveStore.add(this._skipAllButton.onDidClick(() => this.ignore()));
    }
    interactiveStore.add(addDisposableListener(this.domNode, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 9 /* Escape */ && this.carousel.allowSkip) {
        e4.preventDefault();
        e4.stopPropagation();
        this.ignore();
      } else if (event.keyCode === 3 /* Enter */ && (event.metaKey || event.ctrlKey)) {
        e4.preventDefault();
        e4.stopPropagation();
        this.submit();
      } else if (event.keyCode === 3 /* Enter */ && !event.shiftKey) {
        const target = e4.target;
        const isTextInput = target.tagName === "INPUT" && target.type === "text";
        const isFreeformTextarea = target.tagName === "TEXTAREA" && target.classList.contains("chat-question-freeform-textarea");
        if (isTextInput || isFreeformTextarea) {
          e4.preventDefault();
          e4.stopPropagation();
          this.handleNextOrSubmit();
        }
      } else if ((event.ctrlKey || event.metaKey) && (event.keyCode === 1 /* Backspace */ || event.keyCode === 20 /* Delete */)) {
        e4.stopPropagation();
      }
    }));
    this.renderCurrentQuestion();
  }
  /**
   * Saves the current question's answer to the answers map.
   */
  saveCurrentAnswer() {
    const currentQuestion = this.carousel.questions[this._currentIndex];
    const answer = this.getCurrentAnswer();
    if (answer !== void 0) {
      this._answers.set(currentQuestion.id, answer);
    } else {
      this._answers.delete(currentQuestion.id);
    }
    if (currentQuestion?.validation && typeof answer === "string" && answer !== "") {
      const error = this.getValidationError(answer, currentQuestion.validation);
      if (error) {
        this.showValidationError(error);
      } else {
        this.clearValidationError();
      }
    } else {
      this.clearValidationError();
    }
    this.updateFooterState();
    this.persistDraftState();
  }
  persistDraftState() {
    if (this.carousel.isUsed || !(this.carousel instanceof ChatQuestionCarouselData)) {
      return;
    }
    this.carousel.draftAnswers = Object.fromEntries(this._answers.entries());
    this.carousel.draftCurrentIndex = this._currentIndex;
    this.carousel.draftCollapsed = this._isCollapsed;
  }
  toggleCollapsed() {
    this._isCollapsed = !this._isCollapsed;
    this.persistDraftState();
    this.updateCollapsedPresentation();
    this._onDidChangeHeight.fire();
  }
  _focusTerminal() {
    const terminalId = this.carousel.terminalId;
    if (!terminalId) {
      return;
    }
    this._commandService.executeCommand("workbench.action.terminal.chat.focusTerminalByExecutionId", terminalId);
  }
  updateCollapsedPresentation() {
    this.domNode.classList.toggle("chat-question-carousel-collapsed", this._isCollapsed);
    if (this._collapseButton) {
      const collapsed2 = this._isCollapsed;
      const buttonTitle = collapsed2 ? localize(12002, null) : localize(11993, null);
      const contentId = this.domNode.id;
      this._collapseButton.label = collapsed2 ? `$(${Codicon.chevronUp.id})` : `$(${Codicon.chevronDown.id})`;
      this._collapseButton.element.setAttribute("aria-label", buttonTitle);
      this._collapseButton.element.setAttribute("aria-expanded", String(!collapsed2));
      this._collapseButton.element.setAttribute("aria-controls", contentId);
      this._collapseButton.setTitle(buttonTitle);
    }
  }
  /**
   * Navigates the carousel by the given delta.
   * @param delta Negative for previous, positive for next
   */
  navigate(delta2) {
    const newIndex = this._currentIndex + delta2;
    if (newIndex >= 0 && newIndex < this.carousel.questions.length) {
      this.saveCurrentAnswer();
      this._currentIndex = newIndex;
      this.persistDraftState();
      this.renderCurrentQuestion(true);
      this.domNode.focus();
    }
  }
  /**
   * Handles the next/submit behavior for keyboard and option selection flows.
   * Either advances to the next question or submits when on the last question.
   */
  handleNextOrSubmit() {
    this.saveCurrentAnswer();
    if (!this.validateCurrentQuestion()) {
      return;
    }
    if (this._currentIndex < this.carousel.questions.length - 1) {
      this._currentIndex++;
      this.persistDraftState();
      this.renderCurrentQuestion(true);
    } else {
      if (!this.validateRequiredFields()) {
        return;
      }
      this._options.onSubmit(this._answers);
      this.hideAndShowSummary();
    }
  }
  /**
   * Handles explicit submit action from the dedicated submit button.
   */
  submit() {
    this.saveCurrentAnswer();
    if (!this.validateCurrentQuestion()) {
      return;
    }
    if (!this.validateRequiredFields()) {
      return;
    }
    this._options.onSubmit(this._answers);
    this.hideAndShowSummary();
  }
  /**
   * Focuses the container element and announces the question for screen reader users.
   */
  _focusContainerAndAnnounce() {
    this.domNode.focus();
    const question = this.carousel.questions[this._currentIndex];
    if (question) {
      const questionText = getDisplayedQuestionText(question);
      const messageContent = this.getQuestionText(questionText);
      const questionCount = this.carousel.questions.length;
      const alertMessage = questionCount === 1 ? messageContent : localize(12013, null, this._currentIndex + 1, questionCount, messageContent);
      this._accessibilityService.alert(alertMessage);
    }
  }
  /**
   * Hides the carousel UI and shows a summary of answers.
   */
  hideAndShowSummary() {
    if (this._store.isDisposed) {
      return;
    }
    this._isSkipped = true;
    this.domNode.classList.add("chat-question-carousel-used");
    this.clearInteractiveResources();
    clearNode(this.domNode);
    this.renderSummary();
    this._onDidChangeHeight.fire();
  }
  /**
   * Clears and disposes all interactive UI resources (header, nav buttons, input boxes, etc.)
   * and resets references to disposed elements.
   */
  clearInteractiveResources() {
    this._interactiveUIStore.clear();
    this._questionRenderStore.clear();
    this._inputBoxes.clear();
    this._textInputBoxes.clear();
    this._singleSelectItems.clear();
    this._multiSelectCheckboxes.clear();
    this._freeformTextareas.clear();
    this._prevButton = void 0;
    this._nextButton = void 0;
    this._submitButton = void 0;
    this._skipAllButton = void 0;
    this._questionContainer = void 0;
    this._headerActionsContainer = void 0;
    this._closeButtonContainer = void 0;
    this._focusTerminalButtonContainer = void 0;
    this._collapseButton = void 0;
    this._footerRow = void 0;
    this._stepIndicator = void 0;
    this._submitHint = void 0;
    this._inputScrollable = void 0;
  }
  layoutInputScrollable(inputScrollable) {
    if (!this._questionContainer) {
      return;
    }
    const scrollableNode = inputScrollable.getDomNode();
    const scrollableContent = scrollableNode.firstElementChild;
    if (!isHTMLElement(scrollableContent)) {
      return;
    }
    if (scrollableNode.style.height !== "" || scrollableNode.style.maxHeight !== "") {
      scrollableNode.style.height = "";
      scrollableNode.style.maxHeight = "";
    }
    if (scrollableContent.style.height !== "" || scrollableContent.style.maxHeight !== "") {
      scrollableContent.style.height = "";
      scrollableContent.style.maxHeight = "";
    }
    const maxContainerHeight = this._questionContainer.clientHeight;
    const computedStyle = getWindow(this._questionContainer).getComputedStyle(this._questionContainer);
    const contentVerticalPadding = Number.parseFloat(computedStyle.paddingTop || "0") + Number.parseFloat(computedStyle.paddingBottom || "0");
    const nonScrollableContentHeight = Array.from(this._questionContainer.children).filter((child) => child !== scrollableNode).reduce((sum2, child) => sum2 + child.offsetHeight, 0);
    const availableScrollableHeight = Math.floor(maxContainerHeight - contentVerticalPadding - nonScrollableContentHeight);
    const contentScrollableHeight = scrollableContent.scrollHeight;
    const constrainedScrollableHeight = Math.max(0, Math.min(availableScrollableHeight, contentScrollableHeight));
    const constrainedScrollableHeightPx = `${constrainedScrollableHeight}px`;
    if (scrollableNode.style.height !== constrainedScrollableHeightPx || scrollableNode.style.maxHeight !== constrainedScrollableHeightPx) {
      scrollableNode.style.height = constrainedScrollableHeightPx;
      scrollableNode.style.maxHeight = constrainedScrollableHeightPx;
    }
    if (scrollableContent.style.height !== constrainedScrollableHeightPx || scrollableContent.style.maxHeight !== constrainedScrollableHeightPx) {
      scrollableContent.style.height = constrainedScrollableHeightPx;
      scrollableContent.style.maxHeight = constrainedScrollableHeightPx;
    }
    inputScrollable.scanDomNode();
  }
  /**
   * Skips the carousel with default values - called when user wants to proceed quickly.
   * Returns defaults for all questions.
   *
   * `carousel.isUsed` covers resolution that did not come from this part: a
   * voice answer dismisses the carousel directly, and a later auto-skip on
   * request submit would otherwise overwrite the answer that actually landed
   * with defaults.
   */
  skip() {
    if (this._isSkipped || this.carousel.isUsed || !this.carousel.allowSkip) {
      return false;
    }
    const defaults = this.getDefaultAnswers();
    this._options.onSubmit(defaults);
    this._answers.clear();
    for (const [key3, value2] of defaults) {
      this._answers.set(key3, value2);
    }
    this.hideAndShowSummary();
    return true;
  }
  /**
   * Ignores the carousel completely - called when user wants to dismiss without data.
   * Returns undefined to signal the carousel was ignored.
   *
   * Guarded on `carousel.isUsed` for the same reason as {@link skip}.
   */
  ignore() {
    if (this._isSkipped || this.carousel.isUsed || !this.carousel.allowSkip) {
      return false;
    }
    this._isSkipped = true;
    this._options.onSubmit(void 0);
    this.clearInteractiveResources();
    this.domNode.classList.add("chat-question-carousel-used");
    clearNode(this.domNode);
    this.renderTerminalStateMessage();
    this._onDidChangeHeight.fire();
    return true;
  }
  /**
   * Collects default values for all questions in the carousel.
   */
  getDefaultAnswers() {
    const answers = /* @__PURE__ */ new Map();
    for (const question of this.carousel.questions) {
      const defaultAnswer = this.getDefaultAnswerForQuestion(question);
      if (defaultAnswer !== void 0) {
        answers.set(question.id, defaultAnswer);
      }
    }
    return answers;
  }
  /**
   * Gets the default answer for a specific question.
   */
  getDefaultAnswerForQuestion(question) {
    switch (question.type) {
      case "text":
        return typeof question.defaultValue === "string" ? question.defaultValue : void 0;
      case "singleSelect": {
        const defaultOptionId = typeof question.defaultValue === "string" ? question.defaultValue : void 0;
        const defaultOption = defaultOptionId !== void 0 ? question.options?.find((opt) => opt.id === defaultOptionId) : void 0;
        const selectedValue = defaultOption?.value;
        return selectedValue !== void 0 ? { selectedValue, freeformValue: void 0 } : void 0;
      }
      case "multiSelect": {
        const defaultIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
        const selectedValues = question.options?.filter((opt) => defaultIds.includes(opt.id)).map((opt) => opt.value).filter((v2) => v2 !== void 0) ?? [];
        return selectedValues.length > 0 ? { selectedValues, freeformValue: void 0 } : void 0;
      }
      default:
        return typeof question.defaultValue === "string" ? question.defaultValue : Array.isArray(question.defaultValue) ? { selectedValues: question.defaultValue } : void 0;
    }
  }
  /**
   * Returns whether auto-focus should be enabled.
   * Disabled when screen reader mode is active or when explicitly disabled via options.
   */
  _shouldAutoFocus() {
    if (this._options.shouldAutoFocus === false) {
      return false;
    }
    return !this._accessibilityService.isScreenReaderOptimized();
  }
  /**
   * Updates the aria-label of the carousel container based on the current question.
   */
  _updateAriaLabel() {
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      this.domNode.setAttribute("aria-label", localize(12005, null));
      return;
    }
    const questionText = getDisplayedQuestionText(question);
    const messageContent = this.getQuestionText(questionText);
    const questionCount = this.carousel.questions.length;
    let label3;
    if (questionCount === 1) {
      label3 = localize(12019, null, messageContent);
    } else {
      label3 = localize(12008, null, this._currentIndex + 1, questionCount, messageContent);
    }
    const verbose = this._configurationService.getValue("accessibility.verbosity.chatQuestionCarousel" /* ChatQuestionCarousel */);
    if (verbose && this.carousel.terminalId) {
      const kbLabel = this._keybindingService.lookupKeybinding("workbench.action.chat.focusQuestionCarouselTerminal")?.getLabel();
      if (kbLabel) {
        label3 = localize(11994, null, label3, kbLabel);
      } else {
        label3 = localize(11995, null, label3);
      }
    }
    this.domNode.setAttribute("aria-label", label3);
  }
  /**
   * Focuses the carousel container element.
   */
  focus() {
    this.domNode.focus();
  }
  /**
   * Returns whether the carousel container has focus.
   */
  hasFocus() {
    return isAncestorOfActiveElement(this.domNode);
  }
  navigateToPreviousQuestion() {
    if (this._currentIndex <= 0) {
      return false;
    }
    this.navigate(-1);
    return true;
  }
  navigateToNextQuestion() {
    if (this._currentIndex >= this.carousel.questions.length - 1) {
      return false;
    }
    this.navigate(1);
    return true;
  }
  focusTerminal() {
    if (!this.carousel.terminalId) {
      return false;
    }
    this._focusTerminal();
    return true;
  }
  renderCurrentQuestion(focusContainerForScreenReader = false) {
    if (!this._questionContainer) {
      return;
    }
    const questionRenderStore = new DisposableStore();
    this._questionRenderStore.value = questionRenderStore;
    this._inputScrollable = void 0;
    this._inputBoxes.clear();
    this._textInputBoxes.clear();
    this._singleSelectItems.clear();
    this._multiSelectCheckboxes.clear();
    this._freeformTextareas.clear();
    clearNode(this._questionContainer);
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      return;
    }
    const headerRow = $(".chat-question-header-row");
    const titleRow = $(`.chat-question-title-row.${CHAT_CARD_HEADER_CLASS}`);
    if (this.carousel.message && this._currentIndex === 0) {
      const messageMd = isMarkdownString(this.carousel.message) ? MarkdownString.lift(this.carousel.message) : new MarkdownString(this.carousel.message);
      const carouselMessage = $(".chat-question-carousel-message");
      const renderedMessage = questionRenderStore.add(this._markdownRendererService.render(messageMd, getChatMarkdownRenderOptions()));
      carouselMessage.appendChild(renderedMessage.element);
      headerRow.appendChild(carouselMessage);
    }
    const questionText = getDisplayedQuestionText(question);
    if (questionText) {
      const title = $(`.chat-question-title.${CHAT_CARD_TITLE_CLASS}`);
      const messageContent = this.getQuestionText(questionText);
      title.setAttribute("aria-label", messageContent);
      const rawValue = isMarkdownString(questionText) ? questionText.value : questionText;
      const suffixed = question.required ? `${rawValue} *` : rawValue;
      const md = isMarkdownString(questionText) ? MarkdownString.lift({ ...questionText, value: suffixed }) : new MarkdownString(suffixed);
      const rendered = questionRenderStore.add(this._markdownRendererService.render(md, getChatMarkdownRenderOptions()));
      title.appendChild(rendered.element);
      titleRow.appendChild(title);
    }
    headerRow.appendChild(titleRow);
    if (this._headerActionsContainer) {
      clearNode(this._headerActionsContainer);
      if (this._focusTerminalButtonContainer) {
        this._headerActionsContainer.appendChild(this._focusTerminalButtonContainer);
      }
      if (this._closeButtonContainer) {
        this._headerActionsContainer.appendChild(this._closeButtonContainer);
      }
      if (this._collapseButton) {
        this._headerActionsContainer.appendChild(this._collapseButton.element);
      }
      titleRow.appendChild(this._headerActionsContainer);
    }
    this._questionContainer.appendChild(headerRow);
    if (question.description) {
      const descriptionEl = $(".chat-question-description");
      descriptionEl.textContent = question.description;
      this._questionContainer.appendChild(descriptionEl);
    }
    const inputContainer = $(".chat-question-input-container");
    if (question.detailedMessage) {
      const detailedMd = isMarkdownString(question.detailedMessage) ? MarkdownString.lift(question.detailedMessage) : new MarkdownString(question.detailedMessage);
      const detailedMessageEl = $(".chat-question-detailed-message");
      const renderedDetailedMessage = questionRenderStore.add(this._markdownRendererService.render(detailedMd, getChatMarkdownRenderOptions()));
      detailedMessageEl.appendChild(renderedDetailedMessage.element);
      inputContainer.appendChild(detailedMessageEl);
    }
    this.renderInput(inputContainer, question);
    const inputScrollable = questionRenderStore.add(new DomScrollableElement(inputContainer, {
      vertical: 3 /* Visible */,
      horizontal: 2 /* Hidden */,
      consumeMouseWheelIfScrollbarIsNeeded: true
    }));
    this._inputScrollable = inputScrollable;
    const inputScrollableNode = inputScrollable.getDomNode();
    inputScrollableNode.classList.add("chat-question-input-scrollable");
    this._questionContainer.appendChild(inputScrollableNode);
    this._validationMessageElement = $(".chat-question-validation-message");
    this._validationMessageElement.style.display = "none";
    this._questionContainer.appendChild(this._validationMessageElement);
    const isSingleQuestion = this.carousel.questions.length === 1;
    if (!isSingleQuestion) {
      this.renderFooter();
    } else {
      this.renderSingleQuestionFooter();
    }
    let relayoutScheduled = false;
    const relayoutScheduler = questionRenderStore.add(new MutableDisposable());
    const scheduleLayoutInputScrollable = () => {
      if (relayoutScheduled) {
        return;
      }
      relayoutScheduled = true;
      relayoutScheduler.value = runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.domNode), () => {
        relayoutScheduled = false;
        this.layoutInputScrollable(inputScrollable);
      });
    };
    const inputResizeObserver = questionRenderStore.add(new DisposableResizeObserver("ChatQuestionCarouselPart.inputScrollable", () => scheduleLayoutInputScrollable()));
    questionRenderStore.add(inputResizeObserver.observe(inputScrollableNode));
    questionRenderStore.add(inputResizeObserver.observe(inputContainer));
    questionRenderStore.add(addDisposableListener(getWindow(this.domNode), EventType.RESIZE, () => scheduleLayoutInputScrollable()));
    scheduleLayoutInputScrollable();
    questionRenderStore.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.domNode), () => {
      inputContainer.scrollTop = 0;
      inputContainer.scrollLeft = 0;
      inputScrollable.setScrollPosition({ scrollTop: 0, scrollLeft: 0 });
      inputScrollable.scanDomNode();
    }));
    this._updateAriaLabel();
    this.updateCollapsedPresentation();
    if (focusContainerForScreenReader && this._accessibilityService.isScreenReaderOptimized()) {
      this._focusContainerAndAnnounce();
    }
    this._onDidChangeHeight.fire();
  }
  /**
   * Renders or updates the persistent footer with nav arrows, step indicator, and submit button.
   */
  renderFooter() {
    if (!this._footerRow) {
      const interactiveStore = this._interactiveUIStore.value;
      if (!interactiveStore) {
        return;
      }
      this._footerRow = $(".chat-question-footer-row");
      const leftControls = $(".chat-question-footer-left.chat-question-carousel-nav");
      leftControls.setAttribute("role", "navigation");
      leftControls.setAttribute("aria-label", localize(12009, null));
      const arrowsContainer = $(".chat-question-nav-arrows");
      const previousLabel = this.getLabelWithKeybinding(localize(12039, null), PREVIOUS_QUESTION_ACTION_ID);
      const prevButton = createChatCardIconButton(interactiveStore, arrowsContainer, this._hoverService, {
        icon: Codicon.chevronLeft,
        ariaLabel: previousLabel,
        hoverContent: previousLabel,
        variant: "strong"
      });
      prevButton.element.classList.add("chat-question-nav-arrow", "chat-question-nav-prev");
      interactiveStore.add(prevButton.onDidClick(() => this.navigate(-1)));
      this._prevButton = prevButton;
      const nextLabel = this.getLabelWithKeybinding(localize(12038, null), NEXT_QUESTION_ACTION_ID);
      const nextButton = createChatCardIconButton(interactiveStore, arrowsContainer, this._hoverService, {
        icon: Codicon.chevronRight,
        ariaLabel: nextLabel,
        hoverContent: nextLabel,
        variant: "strong"
      });
      nextButton.element.classList.add("chat-question-nav-arrow", "chat-question-nav-next");
      interactiveStore.add(nextButton.onDidClick(() => this.navigate(1)));
      this._nextButton = nextButton;
      leftControls.appendChild(arrowsContainer);
      this._stepIndicator = $(".chat-question-step-indicator");
      leftControls.appendChild(this._stepIndicator);
      this._footerRow.appendChild(leftControls);
      const rightControls = $(".chat-question-footer-right");
      const hint = $("span.chat-question-submit-hint");
      hint.textContent = isMacintosh ? localize(12024, null) : localize(12025, null);
      rightControls.appendChild(hint);
      this._submitHint = hint;
      const submitButton = interactiveStore.add(new Button(rightControls, { ...defaultButtonStyles }));
      submitButton.element.classList.add("chat-question-submit-button");
      submitButton.label = localize(12040, null);
      interactiveStore.add(submitButton.onDidClick(() => this.submit()));
      this._submitButton = submitButton;
      this._footerRow.appendChild(rightControls);
      this.domNode.append(this._footerRow);
    }
    this.updateFooterState();
  }
  /**
   * Updates the footer nav button enabled state and step indicator text.
   */
  updateFooterState() {
    if (this._prevButton) {
      this._prevButton.enabled = this._currentIndex > 0;
    }
    if (this._nextButton) {
      const canAdvance = this._currentIndex < this.carousel.questions.length - 1;
      const question = this.carousel.questions[this._currentIndex];
      const answer = this._answers.get(question?.id);
      const hasAnswer = answer !== void 0 && answer !== "";
      const hasValidationError = !!this._currentValidationError;
      this._nextButton.enabled = canAdvance && (!question?.required || hasAnswer) && !hasValidationError;
    }
    if (this._stepIndicator) {
      this._stepIndicator.textContent = localize(
        12023,
        null,
        this._currentIndex + 1,
        this.carousel.questions.length
      );
    }
    if (this._submitButton) {
      const isLastQuestion = this._currentIndex === this.carousel.questions.length - 1;
      this._submitButton.element.style.display = isLastQuestion ? "" : "none";
      if (this._submitHint) {
        this._submitHint.style.display = isLastQuestion ? "" : "none";
      }
    }
  }
  /**
   * Renders a simplified footer with just a submit button for single-question multi-select carousels.
   */
  renderSingleQuestionFooter() {
    if (!this._footerRow) {
      const interactiveStore = this._interactiveUIStore.value;
      if (!interactiveStore) {
        return;
      }
      this._footerRow = $(".chat-question-footer-row");
      const leftControls = $(".chat-question-footer-left.chat-question-carousel-nav");
      leftControls.setAttribute("role", "navigation");
      leftControls.setAttribute("aria-label", localize(12009, null));
      this._footerRow.appendChild(leftControls);
      const rightControls = $(".chat-question-footer-right");
      const hint = $("span.chat-question-submit-hint");
      hint.textContent = isMacintosh ? localize(12024, null) : localize(12025, null);
      rightControls.appendChild(hint);
      this._submitHint = hint;
      const submitButton = interactiveStore.add(new Button(rightControls, { ...defaultButtonStyles }));
      submitButton.element.classList.add("chat-question-submit-button");
      submitButton.label = localize(12040, null);
      interactiveStore.add(submitButton.onDidClick(() => this.submit()));
      this._submitButton = submitButton;
      this._footerRow.appendChild(rightControls);
      this.domNode.append(this._footerRow);
    }
  }
  getLabelWithKeybinding(label3, actionId) {
    const keybindingLabel2 = this._keybindingService.lookupKeybinding(actionId, this._contextKeyService)?.getLabel();
    return keybindingLabel2 ? localize(12006, null, label3, keybindingLabel2) : label3;
  }
  renderInput(container2, question) {
    switch (question.type) {
      case "text":
        this.renderTextInput(container2, question);
        break;
      case "singleSelect":
        this.renderSingleSelect(container2, question);
        break;
      case "multiSelect":
        this.renderMultiSelect(container2, question);
        break;
    }
  }
  /**
   * Sets up auto-resize behavior for a textarea element.
   * @returns A function that triggers the resize manually (useful for initial sizing).
   */
  setupTextareaAutoResize(textarea) {
    const autoResize = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      if (this._inputScrollable) {
        this.layoutInputScrollable(this._inputScrollable);
      }
      this._onDidChangeHeight.fire();
    };
    this._inputBoxes.add(addDisposableListener(textarea, EventType.INPUT, autoResize));
    return autoResize;
  }
  renderTextInput(container2, question) {
    const inputBox = this._inputBoxes.add(new InputBox(container2, void 0, {
      placeholder: localize(12001, null),
      inputBoxStyles: defaultInputBoxStyles,
      validationOptions: question.validation ? {
        validation: (value2) => {
          if (!value2 && !question.required) {
            return null;
          }
          const error = this.getValidationError(value2, question.validation);
          if (error) {
            return { type: 2, content: error };
          }
          return null;
        }
      } : void 0
    }));
    this._inputBoxes.add(inputBox.onDidChange(() => {
      this.saveCurrentAnswer();
    }));
    const previousAnswer = this._answers.get(question.id);
    if (previousAnswer !== void 0) {
      inputBox.value = String(previousAnswer);
    } else if (question.defaultValue !== void 0) {
      inputBox.value = String(question.defaultValue);
    }
    this._textInputBoxes.set(question.id, inputBox);
    if (this._shouldAutoFocus()) {
      this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(inputBox.element), () => inputBox.focus()));
    }
  }
  renderSingleSelect(container2, question) {
    const orderedOptions = getOptionsWithDefaultsFirst(question);
    const selectContainer = $(".chat-question-list");
    container2.appendChild(selectContainer);
    const previousAnswer = this._answers.get(question.id);
    const prevSingle = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { selectedValue: true }) ? previousAnswer : void 0;
    const previousFreeform = prevSingle?.freeformValue;
    const previousSelectedValue = prevSingle?.selectedValue;
    const defaultOptionId = typeof question.defaultValue === "string" ? question.defaultValue : void 0;
    let selectedIndex = -1;
    orderedOptions.forEach(({ option: option2 }, index2) => {
      if (previousSelectedValue !== void 0 && option2.value === previousSelectedValue) {
        selectedIndex = index2;
      } else if (selectedIndex === -1 && !previousFreeform && defaultOptionId !== void 0 && option2.id === defaultOptionId) {
        selectedIndex = index2;
      }
    });
    const listbox = new ChatCardListbox(selectContainer, question.title, "selected");
    const indicators = [];
    const paintSelection = (newIndex) => {
      listbox.setActive(newIndex);
      indicators.forEach((indicator, i2) => {
        const isSelected = i2 === newIndex;
        indicator.classList.toggle("codicon", isSelected);
        indicator.classList.toggle("codicon-check", isSelected);
      });
    };
    const updateSelection = (newIndex) => {
      paintSelection(newIndex);
      const data = this._singleSelectItems.get(question.id);
      if (data) {
        data.selectedIndex = newIndex;
      }
      this.saveCurrentAnswer();
    };
    const listItems = [];
    orderedOptions.forEach(({ option: option2 }, index2) => {
      const listItem = $(".chat-question-list-item");
      listbox.addOption(listItem, `option-${question.id}`);
      listItem.setAttribute("aria-label", localize(12011, null, index2 + 1, option2.label));
      const number = $(".chat-question-list-number");
      number.textContent = `${index2 + 1}`;
      listItem.appendChild(number);
      const indicator = $(".chat-question-list-indicator");
      indicators.push(indicator);
      const label3 = $(".chat-question-list-label");
      const separatorIndex = option2.label.indexOf(" - ");
      if (separatorIndex !== -1) {
        listItem.classList.add("has-description");
        const titleSpan = $("span.chat-question-list-label-title");
        titleSpan.textContent = option2.label.substring(0, separatorIndex);
        label3.appendChild(titleSpan);
        const descSpan = $("span.chat-question-list-label-desc");
        descSpan.textContent = option2.label.substring(separatorIndex + 3);
        label3.appendChild(descSpan);
      } else {
        label3.textContent = option2.label;
      }
      listItem.appendChild(label3);
      listItem.appendChild(indicator);
      this._inputBoxes.add(addDisposableListener(listItem, EventType.CLICK, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        updateSelection(index2);
        const freeform = this._freeformTextareas.get(question.id);
        if (freeform) {
          freeform.value = "";
        }
        this.handleNextOrSubmit();
      }));
      this._inputBoxes.add(this._hoverService.setupDelayedHover(listItem, {
        content: option2.label,
        position: { hoverPosition: 2 /* BELOW */ },
        appearance: { showPointer: true }
      }));
      selectContainer.appendChild(listItem);
      listItems.push(listItem);
    });
    this._singleSelectItems.set(question.id, { items: listItems, selectedIndex, optionIndices: orderedOptions.map((o) => o.originalIndex) });
    paintSelection(selectedIndex);
    let freeformTextarea;
    if (question.allowFreeformInput !== false) {
      const freeformContainer = $(".chat-question-freeform");
      const freeformNumber = $(".chat-question-freeform-number");
      freeformNumber.textContent = `${orderedOptions.length + 1}`;
      freeformContainer.appendChild(freeformNumber);
      freeformTextarea = $("textarea.chat-question-freeform-textarea");
      freeformTextarea.placeholder = localize(12000, null);
      freeformTextarea.rows = 1;
      if (previousFreeform !== void 0) {
        freeformTextarea.value = previousFreeform;
      }
      const autoResize = this.setupTextareaAutoResize(freeformTextarea);
      const capturedFreeform = freeformTextarea;
      this._inputBoxes.add(addDisposableListener(capturedFreeform, EventType.INPUT, () => {
        if (capturedFreeform.value.length > 0) {
          updateSelection(-1);
        } else {
          this.saveCurrentAnswer();
        }
      }));
      freeformContainer.appendChild(freeformTextarea);
      container2.appendChild(freeformContainer);
      this._freeformTextareas.set(question.id, freeformTextarea);
      if (previousFreeform !== void 0) {
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(capturedFreeform), () => autoResize()));
      }
    }
    this._inputBoxes.add(addDisposableListener(selectContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      const data = this._singleSelectItems.get(question.id);
      if (!data || !listItems.length) {
        return;
      }
      let newIndex = data.selectedIndex;
      if (event.keyCode === 18 /* DownArrow */) {
        e4.preventDefault();
        newIndex = listbox.clampedIndex(data.selectedIndex + 1);
      } else if (event.keyCode === 16 /* UpArrow */) {
        e4.preventDefault();
        newIndex = listbox.clampedIndex(data.selectedIndex - 1);
      } else if ((event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) && !event.metaKey && !event.ctrlKey) {
        e4.preventDefault();
        e4.stopPropagation();
        this.handleNextOrSubmit();
        return;
      } else if (event.keyCode >= 22 /* Digit1 */ && event.keyCode <= 30 /* Digit9 */) {
        const numberIndex = event.keyCode - 22 /* Digit1 */;
        if (numberIndex < listItems.length) {
          e4.preventDefault();
          updateSelection(numberIndex);
        } else if (freeformTextarea && numberIndex === listItems.length) {
          e4.preventDefault();
          updateSelection(-1);
          freeformTextarea.focus();
        }
        return;
      }
      if (newIndex !== data.selectedIndex && newIndex >= 0) {
        updateSelection(newIndex);
      }
    }));
    if (this._shouldAutoFocus()) {
      if (freeformTextarea && previousFreeform) {
        const capturedFreeform = freeformTextarea;
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(capturedFreeform), () => {
          capturedFreeform.focus();
        }));
      } else if (listItems.length > 0) {
        if (selectedIndex < 0) {
          updateSelection(0);
        }
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(selectContainer), () => {
          listbox.focus();
        }));
      }
    }
  }
  renderMultiSelect(container2, question) {
    const orderedOptions = getOptionsWithDefaultsFirst(question);
    const selectContainer = $(".chat-question-list");
    selectContainer.setAttribute("role", "listbox");
    selectContainer.setAttribute("aria-multiselectable", "true");
    selectContainer.setAttribute("aria-label", question.title);
    selectContainer.tabIndex = 0;
    container2.appendChild(selectContainer);
    const previousAnswer = this._answers.get(question.id);
    const prevMulti = typeof previousAnswer === "object" && previousAnswer !== null && hasKey(previousAnswer, { selectedValues: true }) ? previousAnswer : void 0;
    const previousFreeform = prevMulti?.freeformValue;
    const previousSelectedValues = prevMulti?.selectedValues ?? [];
    const defaultOptionIds = Array.isArray(question.defaultValue) ? question.defaultValue : typeof question.defaultValue === "string" ? [question.defaultValue] : [];
    const checkboxes = [];
    const listItems = [];
    let focusedIndex = 0;
    let firstCheckedIndex = -1;
    orderedOptions.forEach(({ option: option2 }, index2) => {
      let isChecked = false;
      if (previousSelectedValues && previousSelectedValues.length > 0) {
        isChecked = previousSelectedValues.includes(option2.value);
      } else if (!previousFreeform && defaultOptionIds.includes(option2.id)) {
        isChecked = true;
      }
      const listItem = $(".chat-question-list-item.multi-select");
      listItem.setAttribute("role", "option");
      listItem.setAttribute("aria-selected", String(isChecked));
      listItem.setAttribute("aria-label", localize(12011, null, index2 + 1, option2.label));
      listItem.id = `option-${question.id}-${index2}`;
      listItem.tabIndex = -1;
      const number = $(".chat-question-list-number");
      number.textContent = `${index2 + 1}`;
      listItem.appendChild(number);
      const checkbox = this._inputBoxes.add(new Checkbox(option2.label, isChecked, defaultCheckboxStyles));
      checkbox.domNode.classList.add("chat-question-list-checkbox");
      checkbox.domNode.tabIndex = -1;
      listItem.appendChild(checkbox.domNode);
      const label3 = $(".chat-question-list-label");
      const separatorIndex = option2.label.indexOf(" - ");
      if (separatorIndex !== -1) {
        listItem.classList.add("has-description");
        const titleSpan = $("span.chat-question-list-label-title");
        titleSpan.textContent = option2.label.substring(0, separatorIndex);
        label3.appendChild(titleSpan);
        const descSpan = $("span.chat-question-list-label-desc");
        descSpan.textContent = option2.label.substring(separatorIndex + 3);
        label3.appendChild(descSpan);
      } else {
        label3.textContent = option2.label;
      }
      listItem.appendChild(label3);
      if (isChecked) {
        listItem.classList.add("checked");
        if (firstCheckedIndex === -1) {
          firstCheckedIndex = index2;
        }
      }
      this._inputBoxes.add(checkbox.onChange(() => {
        listItem.classList.toggle("checked", checkbox.checked);
        listItem.setAttribute("aria-selected", String(checkbox.checked));
        this.saveCurrentAnswer();
      }));
      this._inputBoxes.add(addDisposableListener(listItem, EventType.CLICK, (e4) => {
        focusedIndex = index2;
        if (e4.target !== checkbox.domNode && !checkbox.domNode.contains(e4.target)) {
          checkbox.domNode.click();
        }
      }));
      this._inputBoxes.add(this._hoverService.setupDelayedHover(listItem, {
        content: option2.label,
        position: { hoverPosition: 2 /* BELOW */ },
        appearance: { showPointer: true }
      }));
      selectContainer.appendChild(listItem);
      checkboxes.push(checkbox);
      listItems.push(listItem);
    });
    this._multiSelectCheckboxes.set(question.id, { checkboxes, optionIndices: orderedOptions.map((o) => o.originalIndex) });
    let freeformTextarea;
    if (question.allowFreeformInput !== false) {
      const freeformContainer = $(".chat-question-freeform");
      const freeformNumber = $(".chat-question-freeform-number");
      freeformNumber.textContent = `${orderedOptions.length + 1}`;
      freeformContainer.appendChild(freeformNumber);
      freeformTextarea = $("textarea.chat-question-freeform-textarea");
      freeformTextarea.placeholder = localize(12000, null);
      freeformTextarea.rows = 1;
      if (previousFreeform !== void 0) {
        freeformTextarea.value = previousFreeform;
      }
      const autoResize = this.setupTextareaAutoResize(freeformTextarea);
      this._inputBoxes.add(addDisposableListener(freeformTextarea, EventType.INPUT, () => this.saveCurrentAnswer()));
      freeformContainer.appendChild(freeformTextarea);
      container2.appendChild(freeformContainer);
      this._freeformTextareas.set(question.id, freeformTextarea);
      if (previousFreeform !== void 0) {
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(freeformTextarea), () => autoResize()));
      }
    }
    this._inputBoxes.add(addDisposableListener(selectContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (!listItems.length) {
        return;
      }
      if (event.keyCode === 18 /* DownArrow */) {
        e4.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, listItems.length - 1);
        listItems[focusedIndex].focus();
      } else if (event.keyCode === 16 /* UpArrow */) {
        e4.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        listItems[focusedIndex].focus();
      } else if (event.keyCode === 3 /* Enter */ && !event.metaKey && !event.ctrlKey) {
        e4.preventDefault();
        e4.stopPropagation();
        this.handleNextOrSubmit();
      } else if (event.keyCode === 10 /* Space */) {
        e4.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < checkboxes.length) {
          checkboxes[focusedIndex].domNode.click();
        }
      } else if (event.keyCode >= 22 /* Digit1 */ && event.keyCode <= 30 /* Digit9 */) {
        const numberIndex = event.keyCode - 22 /* Digit1 */;
        if (numberIndex < checkboxes.length) {
          e4.preventDefault();
          checkboxes[numberIndex].domNode.click();
        } else if (freeformTextarea && numberIndex === checkboxes.length) {
          e4.preventDefault();
          freeformTextarea.focus();
        }
      }
    }));
    if (this._shouldAutoFocus()) {
      if (freeformTextarea && previousFreeform) {
        const capturedFreeform = freeformTextarea;
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(capturedFreeform), () => {
          capturedFreeform.focus();
        }));
      } else if (listItems.length > 0) {
        const initialFocusIndex = firstCheckedIndex >= 0 ? firstCheckedIndex : 0;
        focusedIndex = initialFocusIndex;
        this._inputBoxes.add(runAtThisOrScheduleAtNextAnimationFrame(getWindow(selectContainer), () => {
          listItems[initialFocusIndex]?.focus();
        }));
      }
    }
  }
  getCurrentAnswer() {
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      return void 0;
    }
    switch (question.type) {
      case "text": {
        const inputBox = this._textInputBoxes.get(question.id);
        return inputBox?.value ?? (typeof question.defaultValue === "string" ? question.defaultValue : Array.isArray(question.defaultValue) ? { selectedValues: question.defaultValue } : void 0);
      }
      case "singleSelect": {
        const data = this._singleSelectItems.get(question.id);
        let selectedValue = void 0;
        if (data && data.selectedIndex >= 0) {
          const originalIndex = data.optionIndices[data.selectedIndex];
          selectedValue = originalIndex !== void 0 ? question.options?.[originalIndex]?.value : void 0;
        }
        if (selectedValue === void 0 && typeof question.defaultValue === "string") {
          const defaultOption = question.options?.find((opt) => opt.id === question.defaultValue);
          selectedValue = defaultOption?.value;
        }
        const freeformTextarea = this._freeformTextareas.get(question.id);
        const freeformValue = freeformTextarea?.value !== "" ? freeformTextarea?.value : void 0;
        if (freeformValue) {
          return { selectedValue: void 0, freeformValue };
        }
        if (selectedValue !== void 0) {
          return { selectedValue, freeformValue: void 0 };
        }
        return void 0;
      }
      case "multiSelect": {
        const data = this._multiSelectCheckboxes.get(question.id);
        const selectedValues = [];
        if (data) {
          data.checkboxes.forEach((checkbox, index2) => {
            if (checkbox.checked) {
              const originalIndex = data.optionIndices[index2];
              const value2 = originalIndex !== void 0 ? question.options?.[originalIndex]?.value : void 0;
              if (value2 !== void 0) {
                selectedValues.push(value2);
              }
            }
          });
        }
        const freeformTextarea = this._freeformTextareas.get(question.id);
        const freeformValue = freeformTextarea?.value !== "" ? freeformTextarea?.value : void 0;
        if (freeformValue || selectedValues.length > 0) {
          return { selectedValues, freeformValue };
        }
        return void 0;
      }
      default:
        return typeof question.defaultValue === "string" ? question.defaultValue : Array.isArray(question.defaultValue) ? { selectedValues: question.defaultValue } : void 0;
    }
  }
  /**
   * Renders a terminal-state message (Skipped/Answered) when the carousel is
   * dismissed without structured answers.
   */
  renderTerminalStateMessage() {
    const summaryContainer = $(".chat-question-carousel-summary");
    const isDismissedByTerminal = this.carousel instanceof ChatQuestionCarouselData && this.carousel.dismissedByTerminalInput;
    if (this.carousel.answeredExternally) {
      const answeredMessage = $(".chat-question-summary-answered");
      answeredMessage.textContent = localize(11988, null);
      summaryContainer.appendChild(answeredMessage);
    } else {
      const skippedMessage = $(".chat-question-summary-skipped");
      skippedMessage.textContent = isDismissedByTerminal ? localize(11999, null) : localize(12021, null);
      summaryContainer.appendChild(skippedMessage);
    }
    this.domNode.appendChild(summaryContainer);
  }
  /**
   * Renders a summary of answers when the carousel is already used.
   */
  renderSummary() {
    if (this._answers.size === 0) {
      if (this.carousel.answerPresentation === "conversation") {
        if (this.carousel.autoReply) {
          this.renderConversationSummary({
            answerFallback: localize(11989, null),
            answerIcon: Codicon.copilotCompact
          });
        } else if (this.carousel.answeredExternally) {
          this.renderTerminalStateMessage();
        } else if (this.carousel.isUsed) {
          this.renderConversationSummary({
            answerFallback: localize(12022, null),
            answerIcon: Codicon.closeCompact,
            hideAnswerPrefix: true
          });
        }
        return;
      }
      if (this.carousel.isUsed) {
        this.renderTerminalStateMessage();
      }
      return;
    }
    if (this.carousel.answerPresentation === "conversation") {
      this.renderConversationSummary();
      return;
    }
    const summaryContainer = $(".chat-question-carousel-summary");
    for (const question of this.carousel.questions) {
      const answer = this._answers.get(question.id);
      const summaryItem = $(".chat-question-summary-item");
      const questionRow = $("div.chat-question-summary-label");
      const questionText = getDisplayedQuestionText(question);
      let labelText = typeof questionText === "string" ? questionText : questionText.value;
      labelText = labelText.replace(/[:\s]+$/, "");
      questionRow.textContent = localize(12027, null, labelText);
      summaryItem.appendChild(questionRow);
      if (answer !== void 0) {
        const formattedAnswer = this.formatAnswerForSummary(question, answer);
        const answerRow = $("div.chat-question-summary-answer-title");
        answerRow.textContent = localize(12026, null, formattedAnswer);
        summaryItem.appendChild(answerRow);
      } else {
        const unanswered = $("div.chat-question-summary-unanswered");
        unanswered.textContent = localize(12010, null);
        summaryItem.appendChild(unanswered);
      }
      summaryContainer.appendChild(summaryItem);
    }
    this.domNode.appendChild(summaryContainer);
  }
  renderConversationSummary(options3) {
    const summaryStore = new DisposableStore();
    this._interactiveUIStore.value = summaryStore;
    const summaryContainer = $(".chat-question-carousel-summary.chat-question-carousel-conversation-summary");
    this.domNode.setAttribute("aria-label", localize(11990, null));
    for (const question of this.carousel.questions) {
      const answer = this._answers.get(question.id);
      const summaryItem = $(".chat-question-summary-item");
      const questionValue = $(".chat-question-summary-question");
      const questionText = getDisplayedQuestionText(question);
      const displayedQuestion = (typeof questionText === "string" ? questionText : questionText.value).replace(/[:\s]+$/, "");
      const questionPrefix = $("span.chat-question-summary-prefix");
      questionPrefix.textContent = localize(12014, null);
      const questionTextValue = $("span.chat-question-summary-question-value");
      questionTextValue.textContent = displayedQuestion;
      summaryStore.add(this._hoverService.setupDelayedHover(questionTextValue, { content: displayedQuestion }));
      questionValue.append(questionPrefix, questionValue.ownerDocument.createTextNode(" "), questionTextValue);
      summaryItem.appendChild(questionValue);
      const decision = $(".chat-question-summary-decision");
      const answerValue = answer === void 0 ? options3?.answerFallback ?? localize(11997, null) : this.formatAnswerForSummary(question, answer);
      const answerPrefix = options3?.hideAnswerPrefix ? void 0 : localize(11991, null);
      const answerTitle = answerPrefix ? localize(11996, null, answerPrefix, answerValue) : answerValue;
      const collapsibleContext = {
        ...this._context,
        content: this._context.content ?? [],
        contentIndex: this._context.contentIndex ?? 0
      };
      const answerPart = summaryStore.add(new ChatQuestionAnswerCollapsiblePart(
        answerTitle,
        answerPrefix,
        answerValue,
        options3?.answerIcon ?? (this.carousel.autoReply ? Codicon.copilotCompact : Codicon.commentCompact),
        collapsibleContext,
        question.options?.length ? () => this.renderConversationOptions(question, answer) : void 0,
        () => this._onDidChangeHeight.fire(),
        this._hoverService,
        this._configurationService
      ));
      answerPart.domNode.classList.add("chat-question-answer-collapsible");
      decision.appendChild(answerPart.domNode);
      summaryItem.appendChild(decision);
      summaryContainer.appendChild(summaryItem);
    }
    this.domNode.appendChild(summaryContainer);
  }
  renderConversationOptions(question, answer) {
    const selectedValues = /* @__PURE__ */ new Set();
    let freeformValue;
    if (typeof answer === "string") {
      selectedValues.add(answer);
    } else if (answer) {
      if (hasKey(answer, { selectedValues: true })) {
        for (const selectedValue of answer.selectedValues) {
          selectedValues.add(selectedValue);
        }
        freeformValue = answer.freeformValue;
      } else {
        const singleAnswer = answer;
        if (singleAnswer.selectedValue !== void 0) {
          selectedValues.add(singleAnswer.selectedValue);
        }
        freeformValue = singleAnswer.freeformValue;
      }
    }
    const container2 = $(".chat-question-summary-option-details.chat-used-context-list");
    const optionsTitle = $(".chat-question-summary-options-title");
    optionsTitle.textContent = localize(12012, null);
    container2.appendChild(optionsTitle);
    const optionList = $("ul.chat-question-summary-option-list");
    for (const option2 of question.options ?? []) {
      const selected = selectedValues.has(option2.value);
      const optionItem = $("li.chat-question-summary-option");
      optionItem.classList.toggle("selected", selected);
      optionItem.setAttribute("aria-label", selected ? localize(12018, null, option2.label) : option2.label);
      const optionLabel = $("span.chat-question-summary-option-label");
      optionLabel.textContent = option2.label;
      optionItem.appendChild(optionLabel);
      if (selected) {
        optionItem.appendChild(this.renderSelectedOptionState());
      }
      optionList.appendChild(optionItem);
    }
    if (freeformValue) {
      const customItem = $("li.chat-question-summary-option.selected");
      customItem.setAttribute("aria-label", localize(12017, null, freeformValue));
      const customLabel = $("span.chat-question-summary-option-label");
      customLabel.textContent = localize(11998, null, freeformValue);
      customItem.append(customLabel, this.renderSelectedOptionState());
      optionList.appendChild(customItem);
    }
    container2.appendChild(optionList);
    return container2;
  }
  renderSelectedOptionState() {
    const selectedState = $("span.chat-question-summary-option-selected");
    const selectedIcon = $("span");
    selectedIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.checkCompact));
    selectedIcon.setAttribute("aria-hidden", "true");
    selectedState.appendChild(selectedIcon);
    return selectedState;
  }
  /**
   * Formats an answer for display in the summary.
   */
  formatAnswerForSummary(question, answer) {
    if (this.carousel.autoReply && answer === AgentHostAutoReplyAnswer) {
      return localize(11992, null);
    }
    switch (question.type) {
      case "text":
        return String(answer);
      case "singleSelect": {
        if (typeof answer === "object") {
          const { selectedValue, freeformValue } = answer;
          const selectedLabel = selectedValue !== void 0 ? question.options?.find((opt) => opt.value === selectedValue)?.label : void 0;
          if (freeformValue) {
            return freeformValue;
          }
          return selectedLabel ?? String(selectedValue ?? "");
        }
        const label3 = question.options?.find((opt) => opt.value === answer)?.label;
        return label3 ?? String(answer);
      }
      case "multiSelect": {
        if (typeof answer === "object" && hasKey(answer, { selectedValues: true })) {
          const { selectedValues, freeformValue } = answer;
          const labels = selectedValues.map((v2) => question.options?.find((opt) => opt.value === v2)?.label ?? String(v2));
          if (freeformValue) {
            labels.push(freeformValue);
          }
          return labels.join(localize(12007, null));
        }
        return String(answer);
      }
      default:
        return String(answer);
    }
  }
  getQuestionText(questionText) {
    const md = typeof questionText === "string" ? new MarkdownString(questionText) : questionText;
    return renderAsPlaintext(md);
  }
  /**
   * Validates the current question's answer against its validation rules.
   * Returns true if valid, false if validation errors were shown.
   */
  validateCurrentQuestion() {
    const question = this.carousel.questions[this._currentIndex];
    if (!question) {
      return true;
    }
    const answer = this._answers.get(question.id);
    if (question.required && (answer === void 0 || answer === "")) {
      this.showValidationError(localize(12015, null));
      return false;
    }
    if (question.type === "text" && question.validation && typeof answer === "string" && answer !== "") {
      const error = this.getValidationError(answer, question.validation);
      if (error) {
        this.showValidationError(error);
        return false;
      }
    }
    this.clearValidationError();
    return true;
  }
  /**
   * Validates that all required questions have been answered.
   * Returns true if all required fields are satisfied.
   */
  validateRequiredFields() {
    for (let i2 = 0; i2 < this.carousel.questions.length; i2++) {
      const question = this.carousel.questions[i2];
      if (!question.required) {
        continue;
      }
      const answer = this._answers.get(question.id);
      if (answer === void 0 || answer === "") {
        this.saveCurrentAnswer();
        this._currentIndex = i2;
        this.persistDraftState();
        this.renderCurrentQuestion(true);
        this.showValidationError(localize(12015, null));
        return false;
      }
    }
    return true;
  }
  /**
   * Returns a validation error message for the given value, or undefined if valid.
   */
  getValidationError(value2, validation) {
    const failure2 = findQuestionValidationFailure(value2, validation);
    switch (failure2?.kind) {
      case void 0:
        return void 0;
      case "minLength":
        return localize(12035, null, failure2.limit);
      case "maxLength":
        return localize(12033, null, failure2.limit);
      case "email":
        return localize(12030, null);
      case "uri":
        return localize(12037, null);
      case "date":
        return localize(12028, null);
      case "dateTime":
        return localize(12029, null);
      case "number":
        return localize(12036, null);
      case "integer":
        return localize(12031, null);
      case "minimum":
        return localize(12034, null, failure2.limit);
      case "maximum":
        return localize(12032, null, failure2.limit);
    }
  }
  showValidationError(message) {
    this._currentValidationError = message;
    if (this._validationMessageElement) {
      this._validationMessageElement.textContent = message;
      this._validationMessageElement.style.display = "";
    }
  }
  clearValidationError() {
    this._currentValidationError = void 0;
    if (this._validationMessageElement) {
      this._validationMessageElement.textContent = "";
      this._validationMessageElement.style.display = "none";
    }
  }
  hasSameContent(other, _followingContent, element) {
    if (!this._isSkipped && !this.carousel.isUsed && isResponseVM(element) && element.isComplete) {
      return false;
    }
    return other.kind === "questionCarousel" && other === this.carousel;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
  dispose() {
    if (!this._isSkipped && !this.carousel.isUsed) {
      this.saveCurrentAnswer();
    }
    super.dispose();
  }
};

ChatQuestionCarouselPart = __decorateClass([
  __decorateParam(3, IMarkdownRendererService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IAccessibilityService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, ITerminalChatService)
], ChatQuestionCarouselPart);
export { PREVIOUS_QUESTION_ACTION_ID, NEXT_QUESTION_ACTION_ID, ChatQuestionAnswerCollapsiblePart, ChatQuestionCarouselPart };
