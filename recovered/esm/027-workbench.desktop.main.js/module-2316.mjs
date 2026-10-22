// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatQuotaExceededPart.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { assertType } from "./module-0010.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatQuotaExceededPart.ts
var $52 = $;

var ChatQuotaExceededPart = class extends Disposable {
  constructor(element, content2, renderer, commandService, telemetryService, chatEntitlementService) {
    super();
    this.content = content2;
    const errorDetails = element.errorDetails;
    assertType(!!errorDetails, "errorDetails");
    this.domNode = $52(".chat-quota-error-widget");
    const icon2 = append(this.domNode, $52("span"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
    const messageContainer = append(this.domNode, $52(".chat-quota-error-message"));
    const markdownContent = this._register(renderer.render(new MarkdownString(errorDetails.message)));
    append(messageContainer, markdownContent.element);
    let primaryButtonLabel;
    switch (chatEntitlementService.entitlement) {
      case 10 /* EDU */:
      case 6 /* Pro */:
      case 7 /* ProPlus */:
      case 11 /* Max */:
        primaryButtonLabel = localize(12041, null);
        break;
      case 5 /* Free */:
        primaryButtonLabel = localize(12042, null);
        break;
    }
    if (primaryButtonLabel) {
      const primaryButton = this._register(new Button(messageContainer, { ...defaultButtonStyles, supportIcons: true }));
      primaryButton.label = primaryButtonLabel;
      primaryButton.element.classList.add("chat-quota-error-button");
      this._register(primaryButton.onDidClick(async () => {
        const commandId = chatEntitlementService.entitlement === 5 /* Free */ ? "workbench.action.chat.upgradePlan" : "workbench.action.chat.manageAdditionalSpend";
        telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-response" });
        await commandService.executeCommand(commandId);
      }));
    }
  }
  hasSameContent(other) {
    return other.kind === this.content.kind && !!other.errorDetails.isQuotaExceeded;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatQuotaExceededPart = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IChatEntitlementService)
], ChatQuotaExceededPart);
export { $52, ChatQuotaExceededPart };
