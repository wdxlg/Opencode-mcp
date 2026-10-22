// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/accessibility/chatAccessibilityService.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { AccessibilityProgressSignalScheduler } from "./module-2638.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { alert, status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/accessibility/chatAccessibilityService.ts
var CHAT_RESPONSE_PENDING_ALLOWANCE_MS = 4e3;

var ChatAccessibilityService = class extends Disposable {
  constructor(_accessibilitySignalService, _instantiationService, _configurationService, _widgetService, _chatService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._widgetService = _widgetService;
    this._chatService = _chatService;
    this._pendingSignalMap = this._register(new DisposableMap());
    this._register(this._widgetService.onDidBackgroundSession((e) => {
      const session = this._chatService.getSession(e);
      if (!session) {
        return;
      }
      const requestInProgress = session.requestInProgress.get();
      if (!requestInProgress) {
        return;
      }
      this.disposeRequest(e);
    }));
  }
  acceptRequest(uri5, skipRequestSignal) {
    if (!skipRequestSignal) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.chatRequestSent, { allowManyInParallel: true });
    }
    this._pendingSignalMap.set(uri5, this._instantiationService.createInstance(AccessibilityProgressSignalScheduler, CHAT_RESPONSE_PENDING_ALLOWANCE_MS, void 0));
  }
  disposeRequest(requestId) {
    this._pendingSignalMap.deleteAndDispose(requestId);
  }
  acceptResponse(response, requestId, isVoiceInput) {
    this._pendingSignalMap.deleteAndDispose(requestId);
    const isPanelChat = typeof response !== "string";
    const responseContent = typeof response === "string" ? response : response?.response.toString();
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatResponseReceived, { allowManyInParallel: true });
    if (!response || !responseContent) {
      return;
    }
    const plainTextResponse = renderAsPlaintext(new MarkdownString(responseContent));
    const errorDetails = isPanelChat && response.errorDetails ? ` ${response.errorDetails.message}` : "";
    if (!isVoiceInput || this._configurationService.getValue("accessibility.voice.autoSynthesize" /* AutoSynthesize */) !== "on") {
      status(plainTextResponse + errorDetails);
    }
  }
  acceptElicitation(elicitation) {
    if (elicitation.state.get() !== "pending" /* Pending */) {
      return;
    }
    const title = typeof elicitation.title === "string" ? elicitation.title : elicitation.title.value;
    const message = typeof elicitation.message === "string" ? elicitation.message : elicitation.message.value;
    alert(title + " " + message);
    this._accessibilitySignalService.playSignal(AccessibilitySignal.chatUserActionRequired, { allowManyInParallel: true });
  }
};

ChatAccessibilityService = __decorateClass([
  __decorateParam(0, IAccessibilitySignalService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IChatService)
], ChatAccessibilityService);
export { CHAT_RESPONSE_PENDING_ALLOWANCE_MS, ChatAccessibilityService };
