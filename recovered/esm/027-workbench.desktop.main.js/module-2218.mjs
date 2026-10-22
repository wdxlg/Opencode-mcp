// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatModelFeedbackSurveyActions.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { $, append } from "./module-0075.mjs";
import { Disposable, markAsSingleton } from "./module-0012.mjs";
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { IChatModelFeedbackSurveyService } from "./module-2217.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatModelFeedbackSurveyActions.ts
var ChatModelFeedbackSurveyActionId = "workbench.action.chat.openModelFeedbackSurvey";

var thumbsUpIconClasses = ThemeIcon.asClassNameArray(Codicon.thumbsup);

var thumbsDownIconClasses = ThemeIcon.asClassNameArray(Codicon.thumbsdown);

var ChatModelFeedbackSurveyActionViewItem = class extends MenuEntryActionViewItem {
  render(container3) {
    super.render(container3);
    if (!this.element || !this.label) {
      return;
    }
    this.label.classList.add("chat-feedback-survey-pill");
    this.resetLabel();
    const icons2 = append(this.label, $(".chat-feedback-survey-pill-icons"));
    icons2.setAttribute("aria-hidden", "true");
    for (const iconClasses of [thumbsUpIconClasses, thumbsDownIconClasses]) {
      const icon2 = append(icons2, $(".chat-feedback-survey-pill-icon"));
      icon2.classList.add(...iconClasses);
    }
  }
  updateClass() {
    super.updateClass();
    this.resetLabel();
  }
  /**
   * The control discloses a panel rather than holding a pressed state, so it reports
   * `aria-expanded` instead of the `aria-pressed` the base item would apply.
   */
  updateChecked() {
    super.updateChecked();
    this.label?.removeAttribute("aria-pressed");
    this.label?.setAttribute("aria-expanded", String(!!this.action.checked));
  }
  /**
   * The base item paints one icon onto the label, so that has to be cleared before drawing two.
   * The label keeps its `aria-label` and only the icons are hidden from screen readers.
   */
  resetLabel() {
    if (!this.label) {
      return;
    }
    this.label.classList.remove("icon", ...thumbsUpIconClasses, ...thumbsDownIconClasses);
    this.label.style.backgroundImage = "";
    this.label.textContent = "";
  }
};

var ChatModelFeedbackSurveyActionRendering = class extends Disposable {
  static {
    this.ID = "chat.modelFeedbackSurveyActionRendering";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    const disposable = this._register(actionViewItemService.register(MenuId.ChatMessageFooter, ChatModelFeedbackSurveyActionId, (action, options3) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatModelFeedbackSurveyActionViewItem, action, options3);
    }));
    markAsSingleton(disposable);
  }
};

ChatModelFeedbackSurveyActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService)
], ChatModelFeedbackSurveyActionRendering);

function focusChatModelFeedbackSurveyAction(toolbar) {
  for (let i2 = 0; i2 < toolbar.getItemsLength(); i2++) {
    if (toolbar.getItemAction(i2)?.id === ChatModelFeedbackSurveyActionId) {
      toolbar.focus(i2);
      return;
    }
  }
  toolbar.focus();
}

function registerChatModelFeedbackSurveyActions() {
  registerAction2(class OpenModelFeedbackSurveyAction extends Action2 {
    constructor() {
      super({
        id: ChatModelFeedbackSurveyActionId,
        title: localize2(8703, "Give Feedback"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.thumbsup,
        toggled: ChatContextKeys.responseFeedbackSurveyOpen,
        menu: [{
          id: MenuId.ChatMessageFooter,
          group: "navigation",
          order: 2,
          // The survey service checks these too, so a shown report is never sent for a
          // control that cannot render. This drops the vote actions'
          // `lockedToCodingAgent.negate()` because every agent host session is locked to
          // its agent, which would make the `harnesses` selector unreachable.
          when: ContextKeyExpr.and(
            ChatContextKeys.responseHasFeedbackSurvey,
            ChatContextKeys.isResponse,
            ChatContextKeys.responseHasError.negate(),
            ContextKeyExpr.has("config.telemetry.feedback.enabled")
          )
        }]
      });
    }
    run(accessor, ...args2) {
      const item = args2[0];
      if (!isResponseVM(item)) {
        return;
      }
      accessor.get(IChatModelFeedbackSurveyService).toggle(item);
    }
  });
}
export { focusChatModelFeedbackSurveyAction, registerChatModelFeedbackSurveyActions, ChatModelFeedbackSurveyActionId, thumbsUpIconClasses, thumbsDownIconClasses, ChatModelFeedbackSurveyActionViewItem, ChatModelFeedbackSurveyActionRendering };
