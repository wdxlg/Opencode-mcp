// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatOtherClientToolProgressPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { status } from "./module-0076.mjs";
import { ChatProgressSubPart } from "./module-2264.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatOtherClientToolProgressPart.ts
var skipHref = "#skip";

var ChatOtherClientToolProgressPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, renderer, announcedToolProgressKeys, instantiationService, configurationService) {
    super(toolInvocation);
    this.codeblocks = [];
    const invocationMessage = typeof toolInvocation.invocationMessage === "string" ? toolInvocation.invocationMessage : renderAsPlaintext(toolInvocation.invocationMessage);
    const content = localize(
      12228,
      null,
      escapeMarkdownSyntaxTokens(invocationMessage)
    );
    let cancelled = false;
    const rendered = this._register(renderer.render(new MarkdownString(content, { isTrusted: true }), {
      actionHandler: (href) => {
        if (href === skipHref && !cancelled) {
          cancelled = true;
          toolInvocation.otherClientToolCall?.cancel();
        }
      }
    }));
    const skipLink = rendered.element.querySelector(`a[data-href="${skipHref}"]`);
    if (skipLink) {
      skipLink.setAttribute("role", "button");
      skipLink.href = "";
    }
    const announcementKey = `progress:${toolInvocation.toolCallId}`;
    if (announcedToolProgressKeys && configurationService.getValue("accessibility.verboseChatProgressUpdates" /* VerboseChatProgressUpdates */) && !announcedToolProgressKeys.has(announcementKey)) {
      announcedToolProgressKeys.add(announcementKey);
      status(localize(12229, null, invocationMessage));
    }
    this.domNode = this._register(instantiationService.createInstance(
      ChatProgressSubPart,
      rendered.element,
      Codicon.check,
      void 0
    )).domNode;
  }
};

ChatOtherClientToolProgressPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IConfigurationService)
], ChatOtherClientToolProgressPart);
export { skipHref, ChatOtherClientToolProgressPart };
