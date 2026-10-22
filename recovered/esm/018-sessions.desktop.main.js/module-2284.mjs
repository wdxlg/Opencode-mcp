// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatErrorConfirmationPart.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { assertIsResponseVM } from "./module-0979.mjs";
import { ChatErrorWidget } from "./module-2283.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Button } from "./module-0546.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatAccessibilityService, IChatWidgetService } from "./module-0982.mjs";
import { IChatService } from "./module-0973.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatErrorConfirmationPart.ts
var $49 = $;

var ChatErrorConfirmationContentPart = class extends Disposable {
  constructor(kind, content, errorDetails, confirmationButtons, renderer, context2, instantiationService, chatWidgetService, chatService, chatAccessibilityService) {
    super();
    this.errorDetails = errorDetails;
    this.chatAccessibilityService = chatAccessibilityService;
    const element = context2.element;
    assertIsResponseVM(element);
    this.domNode = $49(".chat-error-confirmation");
    this.domNode.append(this._register(new ChatErrorWidget(kind, content, renderer)).domNode);
    const buttonOptions = { ...defaultButtonStyles };
    const buttonContainer = append(this.domNode, $49(".chat-buttons-container"));
    const buttons = [];
    let isRunning = false;
    confirmationButtons.forEach((buttonData) => {
      const button = this._register(new Button(buttonContainer, buttonOptions));
      buttons.push(button);
      button.label = buttonData.label;
      this._register(button.onDidClick(async () => {
        if (isRunning) {
          return;
        }
        isRunning = true;
        buttons.forEach((button2) => button2.enabled = false);
        const prompt = buttonData.label;
        const options3 = buttonData.isSecondary ? { rejectedConfirmationData: [buttonData.data] } : { acceptedConfirmationData: [buttonData.data] };
        try {
          options3.agentId = element.agent?.id;
          options3.slashCommand = element.slashCommand?.name;
          if (!buttonData.resend) {
            options3.confirmation = buttonData.label;
          }
          const widget = chatWidgetService.getWidgetBySessionResource(element.sessionResource);
          Object.assign(options3, widget?.getSelectedModelRequestOptions());
          Object.assign(options3, widget?.getModeRequestOptions());
          this.chatAccessibilityService.acceptRequest(element.sessionResource);
          if (buttonData.resend) {
            const request2 = chatService.getSession(element.sessionResource)?.getRequests().find((request3) => request3.id === element.requestId);
            if (!request2) {
              throw new Error(`Cannot resend missing chat request: ${element.requestId}`);
            }
            await chatService.resendRequest(request2, options3, buttonData.preserveRequestId);
          } else {
            await chatService.sendRequest(element.sessionResource, prompt, options3);
          }
        } catch (error) {
          isRunning = false;
          buttons.forEach((button2) => button2.enabled = true);
          throw error;
        }
      }));
    });
  }
  hasSameContent(other) {
    return other.kind === this.errorDetails.kind && other.isLast === this.errorDetails.isLast;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatErrorConfirmationContentPart = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IChatWidgetService),
  __decorateParam(8, IChatService),
  __decorateParam(9, IChatAccessibilityService)
], ChatErrorConfirmationContentPart);
export { $49, ChatErrorConfirmationContentPart };
