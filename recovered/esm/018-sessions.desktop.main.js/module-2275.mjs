// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatConfirmationContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { SimpleChatConfirmationWidget } from "./module-2274.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { ChatSendResult, IChatService } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatConfirmationContentPart.ts
var ChatConfirmationContentPart = class extends Disposable {
  constructor(confirmation, context2, instantiationService, chatService, chatWidgetService) {
    super();
    this.instantiationService = instantiationService;
    this.chatService = chatService;
    const element = context2.element;
    const buttons = confirmation.buttons ? confirmation.buttons.map((button) => ({
      label: button,
      data: confirmation.data,
      isSecondary: button !== confirmation.buttons?.[0]
    })) : [
      { label: localize(11894, null), data: confirmation.data },
      { label: localize(11895, null), data: confirmation.data, isSecondary: true }
    ];
    const confirmationWidget = this._register(this.instantiationService.createInstance(SimpleChatConfirmationWidget, context2, { title: confirmation.title, buttons, message: confirmation.message }));
    confirmationWidget.setShowButtons(!confirmation.isUsed);
    this._register(confirmationWidget.onDidClick(async ({ button: e4 }) => {
      if (isResponseVM(element)) {
        const prompt = `${e4.label}: "${confirmation.title}"`;
        const options3 = e4.isSecondary ? { rejectedConfirmationData: [e4.data] } : { acceptedConfirmationData: [e4.data] };
        options3.agentId = element.agent?.id;
        options3.slashCommand = element.slashCommand?.name;
        options3.confirmation = e4.label;
        const widget = chatWidgetService.getWidgetBySessionResource(element.sessionResource);
        Object.assign(options3, widget?.getSelectedModelRequestOptions());
        options3.modeInfo = widget?.input.currentModeInfo;
        options3.location = widget?.location;
        Object.assign(options3, widget?.getModeRequestOptions());
        const result = await this.chatService.sendRequest(element.sessionResource, prompt, options3);
        if (ChatSendResult.isSent(result)) {
          confirmation.isUsed = true;
          confirmationWidget.setShowButtons(false);
        }
      }
    }));
    this.domNode = confirmationWidget.domNode;
  }
  hasSameContent(other) {
    return other.kind === "confirmation";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatConfirmationContentPart = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatWidgetService)
], ChatConfirmationContentPart);
export { ChatConfirmationContentPart };
