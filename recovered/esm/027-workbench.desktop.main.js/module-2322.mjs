// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollapsibleMarkdownContentPart.ts
import { ChatCollapsibleContentPart } from "./module-2143.mjs";
import { Codicon } from "./module-0085.mjs";
import { $ } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollapsibleMarkdownContentPart.ts
var ChatCollapsibleMarkdownContentPart = class extends ChatCollapsibleContentPart {
  constructor(title, markdownContent, context2, chatContentMarkdownRenderer, hoverService, configurationService) {
    super(title, context2, void 0, hoverService, configurationService);
    this.markdownContent = markdownContent;
    this.chatContentMarkdownRenderer = chatContentMarkdownRenderer;
    this.icon = Codicon.check;
  }
  initContent() {
    const wrapper = $(".chat-collapsible-markdown-content.chat-used-context-list");
    if (this.markdownContent) {
      this.contentElement = $(".chat-collapsible-markdown-body");
      const rendered = this._register(this.chatContentMarkdownRenderer.render(new MarkdownString(this.markdownContent)));
      this.contentElement.appendChild(rendered.element);
      wrapper.appendChild(this.contentElement);
    }
    return wrapper;
  }
  hasSameContent(other, _followingContent, _element) {
    return false;
  }
};

ChatCollapsibleMarkdownContentPart = __decorateClass([
  __decorateParam(4, IHoverService),
  __decorateParam(5, IConfigurationService)
], ChatCollapsibleMarkdownContentPart);
export { ChatCollapsibleMarkdownContentPart };
