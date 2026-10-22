// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatFollowups.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { formatChatQuestion } from "./module-0988.mjs";
import { Button } from "./module-0546.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { compactCodiconsIn } from "./module-2035.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatAgentService } from "./module-0975.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatFollowups.ts
var $37 = $;

var ChatFollowups = class extends Disposable {
  constructor(container2, followups, location2, options3, clickHandler, chatAgentService) {
    super();
    this.location = location2;
    this.options = options3;
    this.clickHandler = clickHandler;
    this.chatAgentService = chatAgentService;
    const followupsContainer = append(container2, $37(".interactive-session-followups"));
    followups.forEach((followup) => this.renderFollowup(followupsContainer, followup));
  }
  renderFollowup(container2, followup) {
    if (!this.chatAgentService.getDefaultAgent(this.location)) {
      return;
    }
    const tooltipPrefix = formatChatQuestion(this.chatAgentService, this.location, "", followup.agentId, followup.subCommand);
    if (tooltipPrefix === void 0) {
      return;
    }
    const baseTitle = followup.kind === "reply" ? followup.title || followup.message : followup.title;
    const message = followup.kind === "reply" ? followup.message : followup.title;
    const tooltip = (tooltipPrefix + (followup.tooltip || message)).trim();
    const button = this._register(new Button(container2, { ...this.options, title: tooltip }));
    if (followup.kind === "reply") {
      button.element.classList.add("interactive-followup-reply");
    } else if (followup.kind === "command") {
      button.element.classList.add("interactive-followup-command");
    }
    button.element.ariaLabel = localize(12482, null, baseTitle);
    button.label = new MarkdownString(baseTitle);
    compactCodiconsIn(button.element);
    this._register(button.onDidClick(() => this.clickHandler(followup)));
  }
};

ChatFollowups = __decorateClass([
  __decorateParam(5, IChatAgentService)
], ChatFollowups);
export { $37, ChatFollowups };
