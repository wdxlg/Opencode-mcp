// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAnonymousRateLimitedPart.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAnonymousRateLimitedPart.ts
var ChatAnonymousRateLimitedPart = class extends Disposable {
  constructor(content2, commandService, telemetryService, chatEntitlementService) {
    super();
    this.content = content2;
    this.domNode = $(".chat-rate-limited-widget");
    const icon2 = append(this.domNode, $("span"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const messageContainer = append(this.domNode, $(".chat-rate-limited-message"));
    const message = append(messageContainer, $("div"));
    message.textContent = localize(11884, null);
    const signInButton = this._register(new Button(messageContainer, { ...defaultButtonStyles, supportIcons: true }));
    signInButton.label = localize(11885, null);
    signInButton.element.classList.add("chat-rate-limited-button");
    this._register(signInButton.onDidClick(async () => {
      const commandId = "workbench.action.chat.triggerSetup";
      telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-response" });
      await commandService.executeCommand(commandId);
    }));
  }
  hasSameContent(other) {
    return other.kind === this.content.kind && !!other.errorDetails.isRateLimited;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatAnonymousRateLimitedPart = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IChatEntitlementService)
], ChatAnonymousRateLimitedPart);
export { ChatAnonymousRateLimitedPart };
