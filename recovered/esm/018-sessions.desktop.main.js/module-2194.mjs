// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, isEditableElement } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { CHAT_CARD_HEADER_CLASS, CHAT_CARD_LARGE_CLASS, CHAT_CARD_TITLE_CLASS, createChatCardIconButton } from "./module-2109.mjs";
import { localize } from "./module-0001.mjs";
import { status } from "./module-0076.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatCardListbox } from "./module-2119.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { Button } from "./module-0546.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatModelFeedbackSurveyService } from "./module-2192.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyWidget.ts
var KEYS_HANDLED_BY_LIST = /* @__PURE__ */ new Set([
  16 /* UpArrow */,
  18 /* DownArrow */,
  15 /* LeftArrow */,
  17 /* RightArrow */,
  11 /* PageUp */,
  12 /* PageDown */,
  3 /* Enter */,
  10 /* Space */,
  9 /* Escape */,
  14 /* Home */,
  13 /* End */
]);

var TEXT_INPUT_MAX_HEIGHT = 96;

var ACKNOWLEDGEMENT_STEP_KEY = "acknowledged";

var ChatModelFeedbackSurveyWidget = class extends Disposable {
  constructor(container2, restoreFocus, surveyService, hoverService, contextKeyService) {
    super();
    this.container = container2;
    this.restoreFocus = restoreFocus;
    this.surveyService = surveyService;
    this.hoverService = hoverService;
    this.renderDisposables = this._register(new DisposableStore());
    this.isPanelOpen = false;
    /** Guards against `render` being re-entered when reading state changes that state. */
    this.isRendering = false;
    this.hasSurveyContextKey = ChatContextKeys.responseHasFeedbackSurvey.bindTo(contextKeyService);
    this.surveyOpenContextKey = ChatContextKeys.responseFeedbackSurveyOpen.bindTo(contextKeyService);
    this._register(this.surveyService.onDidChangeSurveyState((e4) => {
      if (this.response && e4.requestId === this.response.requestId && e4.sessionResource.toString() === this.response.sessionResource.toString()) {
        this.render(this.response);
      }
    }));
    this._register(this.surveyService.onDidChangeConfiguration(() => this.render(this.response)));
    this._register(addDisposableListener(this.container, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 9 /* Escape */) {
        event.stopPropagation();
        event.preventDefault();
        this.dismiss();
      }
    }, true));
    this._register(addDisposableListener(this.container, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (KEYS_HANDLED_BY_LIST.has(event.keyCode) && !isEditableElement(e4.target)) {
        event.stopPropagation();
      }
    }));
  }
  /** Renders the survey for `response`, or clears the panel when there is nothing to show. */
  render(response) {
    if (this.isRendering) {
      return;
    }
    this.isRendering = true;
    try {
      this.doRender(response);
    } finally {
      this.isRendering = false;
    }
  }
  doRender(response) {
    this.response = response;
    this.renderDisposables.clear();
    clearNode(this.container);
    const state = response && this.surveyService.getSurvey(response);
    this.hasSurveyContextKey.set(!!state);
    const isOpen = !!state && state.status === "open" /* Open */;
    const wasOpen = this.isPanelOpen;
    this.isPanelOpen = isOpen;
    this.surveyOpenContextKey.set(isOpen);
    this.container.classList.toggle("hidden", !isOpen);
    if (!response || !state || !isOpen) {
      this.lastFocusedStep = void 0;
      if (wasOpen) {
        this.restoreFocus();
      }
      return;
    }
    this.renderPanel(response, state);
  }
  renderPanel(response, state) {
    const step = state.config.steps[state.stepIndex];
    if (!step) {
      return;
    }
    const panel = append(this.container, $(`.chat-feedback-survey-container.${CHAT_CARD_LARGE_CLASS}`));
    const header2 = append(panel, $(`.chat-feedback-survey-header.${CHAT_CARD_HEADER_CLASS}`));
    const title = append(header2, $(`.chat-feedback-survey-title.${CHAT_CARD_TITLE_CLASS}`));
    title.textContent = state.isSubmitted ? localize(11336, null) : step.title;
    const closeButton = this.renderCloseButton(header2);
    if (state.isSubmitted) {
      if (this.lastFocusedStep !== ACKNOWLEDGEMENT_STEP_KEY) {
        this.lastFocusedStep = ACKNOWLEDGEMENT_STEP_KEY;
        status(localize(11341, null));
        closeButton.focus();
      }
      return;
    }
    const body = append(panel, $(".chat-feedback-survey-body"));
    const firstControl = step.kind === "choice" /* Choice */ ? this.renderChoiceStep(response, body, state.instanceId, step.id, step.options, step.title) : this.renderTextStep(response, state, body, step);
    if (state.config.steps.length > 1) {
      const progress = append(panel, $(".chat-feedback-survey-progress"));
      progress.textContent = localize(11338, null, state.stepIndex + 1, state.config.steps.length);
    }
    const stepKey = `${state.instanceId}:${state.stepIndex}`;
    if (this.lastFocusedStep !== stepKey) {
      this.lastFocusedStep = stepKey;
      status(localize(11339, null, step.title, state.stepIndex + 1, state.config.steps.length));
      if (state.openTrigger === "manual" || state.stepIndex > 0) {
        firstControl?.focus();
      }
    }
  }
  renderCloseButton(header2) {
    const label3 = localize(11337, null);
    const close2 = createChatCardIconButton(this.renderDisposables, header2, this.hoverService, {
      icon: Codicon.closeSmall,
      ariaLabel: label3,
      hoverContent: label3
    });
    this.renderDisposables.add(close2.onDidClick(() => this.dismiss()));
    return close2;
  }
  /** Renders the options as a single select list, matching the ask question tool. */
  renderChoiceStep(response, body, instanceId, stepId, options3, title) {
    const listbox = new ChatCardListbox(append(body, $(".chat-feedback-survey-list")), title, "active");
    options3.forEach((option2, index2) => {
      const item = append(listbox.domNode, $(".chat-feedback-survey-list-item"));
      listbox.addOption(item, `chat-feedback-survey-${instanceId}-${stepId}`);
      const label3 = append(item, $(".chat-feedback-survey-list-label"));
      label3.textContent = option2.label;
      this.renderDisposables.add(addDisposableListener(item, EventType.CLICK, (e4) => {
        EventHelper.stop(e4, true);
        this.surveyService.answerChoice(response, stepId, option2.id);
      }));
    });
    listbox.setActive(0);
    this.renderDisposables.add(addDisposableListener(listbox.domNode, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 18 /* DownArrow */) {
        event.preventDefault();
        listbox.setActive(listbox.wrappedIndex(listbox.activeIndex + 1));
      } else if (event.keyCode === 16 /* UpArrow */) {
        event.preventDefault();
        listbox.setActive(listbox.wrappedIndex(listbox.activeIndex - 1));
      } else if (event.keyCode === 14 /* Home */) {
        event.preventDefault();
        listbox.setActive(0);
      } else if (event.keyCode === 13 /* End */) {
        event.preventDefault();
        listbox.setActive(listbox.length - 1);
      } else if (event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) {
        event.preventDefault();
        this.surveyService.answerChoice(response, stepId, options3[listbox.activeIndex].id);
      }
    }));
    return listbox.domNode;
  }
  renderTextStep(response, state, body, step) {
    const inputBox = this.renderDisposables.add(new InputBox(body, void 0, {
      placeholder: step.placeholder,
      ariaLabel: step.title,
      inputBoxStyles: defaultInputBoxStyles,
      flexibleHeight: true,
      flexibleMaxHeight: TEXT_INPUT_MAX_HEIGHT
    }));
    inputBox.value = state.commentDraft || state.answers.get(step.id) || "";
    inputBox.inputElement.maxLength = step.maxLength;
    this.renderDisposables.add(inputBox.onDidChange((value2) => this.surveyService.setCommentDraft(response, value2)));
    const actions = append(body, $(".chat-feedback-survey-actions"));
    const submit = this.renderDisposables.add(new Button(actions, { ...defaultButtonStyles }));
    submit.label = localize(11340, null);
    this.renderDisposables.add(submit.onDidClick(() => this.surveyService.submit(response, inputBox.value)));
    return inputBox.inputElement;
  }
  dismiss() {
    if (!this.response || !this.isPanelOpen) {
      return;
    }
    this.surveyService.dismiss(this.response);
  }
};

ChatModelFeedbackSurveyWidget = __decorateClass([
  __decorateParam(2, IChatModelFeedbackSurveyService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IContextKeyService)
], ChatModelFeedbackSurveyWidget);
export { KEYS_HANDLED_BY_LIST, TEXT_INPUT_MAX_HEIGHT, ACKNOWLEDGEMENT_STEP_KEY, ChatModelFeedbackSurveyWidget };
