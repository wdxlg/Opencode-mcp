// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAgentCommandContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { chatSubcommandLeader } from "./module-0987.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatAgentCommandContentPart.ts
var ChatAgentCommandContentPart = class extends Disposable {
  constructor(cmd, onClick4, _hoverService) {
    super();
    this._hoverService = _hoverService;
    this.domNode = document.createElement("span");
    this.domNode.classList.add("chat-agent-command");
    this.domNode.setAttribute("aria-label", cmd.name);
    this.domNode.setAttribute("role", "button");
    const groupId = generateUuid();
    const commandSpan = document.createElement("span");
    this.domNode.appendChild(commandSpan);
    commandSpan.innerText = chatSubcommandLeader + cmd.name;
    this._store.add(this._hoverService.setupDelayedHover(commandSpan, {
      content: cmd.description,
      style: 1 /* Pointer */
    }, { groupId }));
    const rerun = localize(11870, null, chatSubcommandLeader, cmd.name);
    const btn = new Button(this.domNode, { ariaLabel: rerun });
    btn.icon = Codicon.closeSmall;
    this._store.add(btn.onDidClick(() => onClick4()));
    this._store.add(btn);
    this._store.add(this._hoverService.setupDelayedHover(btn.element, {
      content: rerun,
      style: 1 /* Pointer */
    }, { groupId }));
  }
  hasSameContent(other, followingContent, element) {
    return false;
  }
};

ChatAgentCommandContentPart = __decorateClass([
  __decorateParam(2, IHoverService)
], ChatAgentCommandContentPart);
export { ChatAgentCommandContentPart };
