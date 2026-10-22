// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatDisabledClaudeHooksContentPart.ts
import { Disposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { PromptsConfig } from "./module-0999.mjs";
import { IMarkdownRendererService, openLinkFromMarkdown } from "./module-0541.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatDisabledClaudeHooksContentPart.ts
var ChatDisabledClaudeHooksContentPart = class extends Disposable {
  constructor(_context, _openerService, _markdownRendererService) {
    super();
    this._openerService = _openerService;
    this._markdownRendererService = _markdownRendererService;
    this.domNode = $(".chat-disabled-claude-hooks");
    const messageContainer = $(".chat-disabled-claude-hooks-message");
    const icon2 = $(".chat-disabled-claude-hooks-icon");
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const enableLink = createMarkdownCommandLink({
      text: localize(11898, null),
      id: "workbench.action.openSettings",
      arguments: [PromptsConfig.USE_CLAUDE_HOOKS],
      tooltip: localize(11899, null)
    });
    const message = localize(11900, null, enableLink);
    const content = new MarkdownString(message, { isTrusted: true });
    const rendered = this._register(this._markdownRendererService.render(content, {
      actionHandler: (href) => openLinkFromMarkdown(this._openerService, href, true)
    }));
    messageContainer.appendChild(icon2);
    messageContainer.appendChild(rendered.element);
    this.domNode.appendChild(messageContainer);
  }
  hasSameContent(other) {
    return other.kind === "disabledClaudeHooks";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatDisabledClaudeHooksContentPart = __decorateClass([
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IMarkdownRendererService)
], ChatDisabledClaudeHooksContentPart);
export { ChatDisabledClaudeHooksContentPart };
