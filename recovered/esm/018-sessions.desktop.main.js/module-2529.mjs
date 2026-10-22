// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyPromptContribution.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatModelFeedbackSurveyService } from "./module-2192.mjs";


// src/vs/workbench/contrib/chat/browser/feedbackSurvey/chatModelFeedbackSurveyPromptContribution.ts
var ChatModelFeedbackSurveyPromptContribution = class extends Disposable {
  constructor(chatWidgetService, surveyService) {
    super();
    this.chatWidgetService = chatWidgetService;
    this.surveyService = surveyService;
    this.widgetListeners = this._register(new DisposableMap());
    for (const widget of this.chatWidgetService.getAllWidgets()) {
      this.trackWidget(widget);
    }
    this._register(this.chatWidgetService.onDidAddWidget((widget) => this.trackWidget(widget)));
    this._register(this.chatWidgetService.onDidRemoveWidget((widget) => this.widgetListeners.deleteAndDispose(widget)));
  }
  static {
    this.ID = "chat.modelFeedbackSurveyPrompt";
  }
  trackWidget(widget) {
    const listeners = new DisposableStore();
    const viewModelChanged = observableSignalFromEvent("chatFeedbackSurveyViewModel", widget.onDidChangeViewModel);
    let previous;
    listeners.add(autorun((reader) => {
      viewModelChanged.read(reader);
      const modelId = widget.input.selectedLanguageModel.read(reader)?.identifier;
      const sessionResource = widget.viewModel?.sessionResource;
      const session = sessionResource?.toString();
      const last = previous;
      previous = modelId && session ? { modelId, session } : void 0;
      if (last && last.session !== session) {
        previous = void 0;
        return;
      }
      if (!last || !modelId || !sessionResource || last.modelId === modelId) {
        return;
      }
      this.surveyService.notifyModelSwitchedAway(sessionResource, last.modelId, modelId);
    }));
    this.widgetListeners.set(widget, listeners);
  }
};

ChatModelFeedbackSurveyPromptContribution = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IChatModelFeedbackSurveyService)
], ChatModelFeedbackSurveyPromptContribution);
export { ChatModelFeedbackSurveyPromptContribution };
