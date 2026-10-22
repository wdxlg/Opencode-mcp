// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpAuthenticationContentPart.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { $, clearNode } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpAuthenticationContentPart.ts
var ChatMcpAuthenticationContentPart = class extends Disposable {
  constructor(data, markdownRendererService, agentHostCustomizationService) {
    super();
    this.data = data;
    this.markdownRendererService = markdownRendererService;
    this.agentHostCustomizationService = agentHostCustomizationService;
    this.rendered = this._register(new MutableDisposable());
    /**
     * Whether this part was ever shown. Used to distinguish the initial empty
     * state (the part is emitted with an empty `servers` observable that is
     * populated immediately after) from the terminal state where every server
     * has been authenticated — only the latter marks the part
     * {@link IChatMcpAuthenticationRequired.isUsed used}.
     */
    this._hasBeenVisible = false;
    /**
     * The MCP server currently being authenticated, or `undefined` when idle.
     * While set, the part shows an "Authenticating …" progress message for that
     * server and stays visible regardless of the underlying auth-required state.
     */
    this._authenticating = observableValue(this, void 0);
    this.domNode = $(".chat-mcp-servers-interaction");
    this._register(autorun((reader) => {
      const servers = this.data.servers.read(reader);
      const authenticating = this._authenticating.read(reader);
      this.render(servers, authenticating);
      this.updateVisibility(servers, authenticating);
    }));
    this._register(this.agentHostCustomizationService.onDidChangeCustomizations(() => this.updateVisibility(this.data.servers.get(), this._authenticating.get())));
  }
  render(servers, authenticating) {
    clearNode(this.domNode);
    this.rendered.clear();
    if (authenticating) {
      this._renderMessage(
        ThemeIcon.modify(Codicon.loading, "spin"),
        localize(11940, null, "`" + escapeMarkdownSyntaxTokens(authenticating.name) + "`")
      );
      return;
    }
    if (!servers.length) {
      return;
    }
    const links = servers.map((server) => "`" + escapeMarkdownSyntaxTokens(server.name) + "`").join(", ");
    const content2 = servers.length === 1 ? localize(11942, null, links) : localize(11941, null, links);
    this._renderMessage(Codicon.mcp, content2, { href: "#authenticate", run: () => void this.authenticate() });
  }
  _renderMessage(icon2, content2, action) {
    const container3 = $(".chat-mcp-servers-interaction-hint");
    const messageContainer = $(".chat-mcp-servers-message");
    const iconElement = $(".chat-mcp-servers-icon");
    iconElement.classList.add(...ThemeIcon.asClassNameArray(getCompactCodicon(icon2)));
    const rendered = this.rendered.value = this.markdownRendererService.render(new MarkdownString(content2, { isTrusted: true }), action ? {
      actionHandler: (href) => {
        if (href !== action.href) {
          return Promise.resolve(false);
        }
        action.run();
        return Promise.resolve(true);
      }
    } : void 0);
    messageContainer.appendChild(iconElement);
    messageContainer.appendChild(rendered.element);
    container3.appendChild(messageContainer);
    this.domNode.appendChild(container3);
    if (action) {
      const actionLink = rendered.element.querySelector(`a[data-href="${action.href}"]`);
      if (actionLink) {
        actionLink.setAttribute("role", "button");
        actionLink.href = "";
      }
    }
  }
  async authenticate() {
    const sessionResource = URI.revive(this.data.sessionResource);
    try {
      for (const server of this.data.servers.get()) {
        this._authenticating.set(server, void 0);
        await this.agentHostCustomizationService.authenticateMcpServer(sessionResource, server.id);
      }
    } finally {
      this._authenticating.set(void 0, void 0);
    }
  }
  updateVisibility(dataServers, authenticating) {
    if (authenticating) {
      this.domNode.style.display = "";
      this._hasBeenVisible = true;
      return;
    }
    const sessionResource = URI.revive(this.data.sessionResource);
    const servers = this.agentHostCustomizationService.getMcpServers(sessionResource);
    const visible = dataServers.some((server) => servers.some((current) => current.id === server.id && current.status === "authRequired" /* AuthRequired */));
    this.domNode.style.display = visible ? "" : "none";
    if (visible) {
      this._hasBeenVisible = true;
    } else if (this._hasBeenVisible) {
      this.data.isUsed = true;
    }
  }
  hasSameContent(other, _followingContent, _element) {
    return other.kind === "mcpAuthenticationRequired";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatMcpAuthenticationContentPart = __decorateClass([
  __decorateParam(1, IMarkdownRendererService),
  __decorateParam(2, IAgentHostCustomizationService)
], ChatMcpAuthenticationContentPart);
export { ChatMcpAuthenticationContentPart };
