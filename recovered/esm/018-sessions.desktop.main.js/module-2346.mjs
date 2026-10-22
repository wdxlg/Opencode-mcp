// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatHookContentPart.ts
import { HOOK_METADATA } from "./module-1011.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { $ } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatHookContentPart.ts
function getHookTypeLabel(hookType) {
  return HOOK_METADATA[hookType]?.label ?? hookType;
}

var ChatHookContentPart = class extends ChatCollapsibleContentPart {
  constructor(hookPart, context2, hoverService, configurationService) {
    const hookTypeLabel = getHookTypeLabel(hookPart.hookType);
    const isStopped = !!hookPart.stopReason;
    const isWarning = !!hookPart.systemMessage;
    const toolName = hookPart.toolDisplayName;
    const title = isStopped ? toolName ? localize(11912, null, toolName, hookTypeLabel) : localize(11911, null, hookTypeLabel) : toolName ? localize(11914, null, toolName, hookTypeLabel) : localize(11913, null, hookTypeLabel);
    super(title, context2, void 0, hoverService, configurationService);
    this.hookPart = hookPart;
    this.icon = isStopped ? Codicon.error : isWarning ? Codicon.warning : Codicon.check;
    if (isStopped) {
      this.domNode.classList.add("chat-hook-outcome-blocked");
    } else if (isWarning) {
      this.domNode.classList.add("chat-hook-outcome-warning");
    }
    this.setExpanded(false);
  }
  initContent() {
    const content = $(".chat-hook-details.chat-used-context-list");
    if (this.hookPart.stopReason) {
      const reasonElement = $(".chat-hook-reason", void 0, this.hookPart.stopReason);
      content.appendChild(reasonElement);
    }
    const isToolHook = this.hookPart.hookType === "PreToolUse" /* PreToolUse */ || this.hookPart.hookType === "PostToolUse" /* PostToolUse */;
    if (this.hookPart.systemMessage && (isToolHook || !this.hookPart.stopReason)) {
      const messageElement = $(".chat-hook-message", void 0, this.hookPart.systemMessage);
      content.appendChild(messageElement);
    }
    return content;
  }
  hasSameContent(other, _followingContent, _element) {
    if (other.kind !== "hook") {
      return false;
    }
    return other.hookType === this.hookPart.hookType && other.stopReason === this.hookPart.stopReason && other.systemMessage === this.hookPart.systemMessage && other.toolDisplayName === this.hookPart.toolDisplayName;
  }
};

ChatHookContentPart = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IConfigurationService)
], ChatHookContentPart);
export { getHookTypeLabel, ChatHookContentPart };
