// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCommandContentPart.ts
import { $ } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCommandContentPart.ts
var $43 = $;

var ChatCommandButtonContentPart = class extends Disposable {
  constructor(commandButton, context2, commandService) {
    super();
    this.commandService = commandService;
    this.domNode = $43(".chat-command-button");
    const enabled = !isResponseVM(context2.element) || !context2.element.isStale;
    this.renderButton(this.domNode, commandButton.command, enabled);
    if (commandButton.additionalCommands) {
      for (const command4 of commandButton.additionalCommands) {
        this.renderButton(this.domNode, command4, enabled, true);
      }
    }
  }
  renderButton(container2, command4, enabled, secondary) {
    const tooltip = enabled ? command4.tooltip : localize(11893, null);
    const button = this._register(new Button(container2, { ...defaultButtonStyles, supportIcons: true, title: tooltip, secondary }));
    button.label = command4.title;
    button.enabled = enabled;
    this._register(button.onDidClick(() => this.commandService.executeCommand(command4.id, ...command4.arguments ?? [])));
  }
  hasSameContent(other) {
    return other.kind === "command";
  }
};

ChatCommandButtonContentPart = __decorateClass([
  __decorateParam(2, ICommandService)
], ChatCommandButtonContentPart);
export { $43, ChatCommandButtonContentPart };
