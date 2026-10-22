// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpServersStartingContentPart.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { $, clearNode } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { createPixelSpinner } from "./module-2010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpServersStartingContentPart.ts
var ChatMcpServersStartingContentPart = class extends Disposable {
  constructor(data, options3, markdownRendererService) {
    super();
    this.data = data;
    this.options = options3;
    this.markdownRendererService = markdownRendererService;
    this.rendered = this._register(new MutableDisposable());
    this.spinner = this._register(new MutableDisposable());
    this.hadStartingServers = false;
    this.didNotifyFinished = false;
    this.domNode = $(".chat-mcp-servers-interaction");
    this._register(autorun((reader) => {
      this.render(this.data.servers.read(reader));
    }));
  }
  render(servers) {
    clearNode(this.domNode);
    this.rendered.clear();
    this.spinner.clear();
    if (!servers.length) {
      this.domNode.style.display = "none";
      if (this.hadStartingServers && !this.didNotifyFinished) {
        this.didNotifyFinished = true;
        this.options?.onDidFinishStarting?.();
      }
      return;
    }
    this.hadStartingServers = true;
    this.domNode.style.display = "";
    const links = servers.map((server) => "`" + escapeMarkdownSyntaxTokens(server.name) + "`").join(", ");
    this._renderMessage(
      localize(11951, null, links)
    );
  }
  _renderMessage(content2) {
    const container3 = $(".chat-mcp-servers-interaction-hint");
    const messageContainer = $(".chat-mcp-servers-message");
    const iconElement = $(".chat-mcp-servers-icon");
    this.spinner.value = (this.options?.createSpinner ?? createPixelSpinner)(iconElement);
    const rendered = this.rendered.value = this.markdownRendererService.render(new MarkdownString(content2));
    messageContainer.appendChild(iconElement);
    messageContainer.appendChild(rendered.element);
    container3.appendChild(messageContainer);
    this.domNode.appendChild(container3);
  }
  hasSameContent(other, _followingContent, _element) {
    return other.kind === "mcpServersStartingSlow";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatMcpServersStartingContentPart = __decorateClass([
  __decorateParam(2, IMarkdownRendererService)
], ChatMcpServersStartingContentPart);
export { ChatMcpServersStartingContentPart };
