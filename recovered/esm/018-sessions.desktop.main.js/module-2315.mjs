// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatAutomationConfiguredResultSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { $ } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ButtonWithIcon } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatAutomationConfiguredResultSubPart.ts
var ChatAutomationConfiguredResultSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, data, _context, _renderer, commandService) {
    super(toolInvocation);
    this.commandService = commandService;
    this.codeblocks = [];
    this.domNode = $(".chat-open-session-result");
    const label3 = data.operation === "created" ? localize(12209, null, data.automationName) : localize(12211, null, data.automationName);
    const button = this._register(new ButtonWithIcon(this.domNode, {
      ...defaultButtonStyles,
      secondary: true,
      title: localize(12210, null, data.automationName)
    }));
    button.element.classList.add("chat-open-session-button");
    button.label = label3;
    button.icon = Codicon.calendar;
    this._register(button.onDidClick(() => this.commandService.executeCommand(
      "sessionsView.manageAutomations"
    )));
  }
};

ChatAutomationConfiguredResultSubPart = __decorateClass([
  __decorateParam(4, ICommandService)
], ChatAutomationConfiguredResultSubPart);
export { ChatAutomationConfiguredResultSubPart };
