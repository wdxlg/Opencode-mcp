// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatAgentHover.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, append, h } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { verifiedPublisherIcon } from "./module-2225.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { FileAccess } from "./module-0033.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { IChatAgentNameService, IChatAgentService, getFullyQualifiedId } from "./module-0975.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { showExtensionsWithIdsCommandId } from "./module-1854.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatAgentHover.ts
var ChatAgentHover = class extends Disposable {
  constructor(chatAgentService, extensionService, chatAgentNameService) {
    super();
    this.chatAgentService = chatAgentService;
    this.extensionService = extensionService;
    this.chatAgentNameService = chatAgentNameService;
    this._onDidChangeContents = this._register(new Emitter());
    this.onDidChangeContents = this._onDidChangeContents.event;
    const hoverElement = h(
      ".chat-agent-hover@root",
      [
        h(".chat-agent-hover-header", [
          h(".chat-agent-hover-icon@icon"),
          h(".chat-agent-hover-details", [
            h(".chat-agent-hover-name@name"),
            h(".chat-agent-hover-extension", [
              h(".chat-agent-hover-extension-name@extensionName"),
              h(".chat-agent-hover-separator@separator"),
              h(".chat-agent-hover-publisher@publisher")
            ])
          ])
        ]),
        h(".chat-agent-hover-warning@warning"),
        h("span.chat-agent-hover-description@description")
      ]
    );
    this.domNode = hoverElement.root;
    this.icon = hoverElement.icon;
    this.name = hoverElement.name;
    this.extensionName = hoverElement.extensionName;
    this.description = hoverElement.description;
    hoverElement.separator.textContent = "|";
    const verifiedBadge = $("span.extension-verified-publisher", void 0, renderIcon(verifiedPublisherIcon));
    this.publisherName = $("span.chat-agent-hover-publisher-name");
    append(
      hoverElement.publisher,
      verifiedBadge,
      this.publisherName
    );
    hoverElement.warning.appendChild(renderIcon(Codicon.warning));
    hoverElement.warning.appendChild($("span", void 0, localize(11858, null)));
  }
  setAgent(id2) {
    const agent = this.chatAgentService.getAgent(id2);
    if (agent.metadata.icon instanceof URI) {
      const avatarIcon = $("img.icon");
      avatarIcon.src = FileAccess.uriToBrowserUri(agent.metadata.icon).toString(true);
      this.icon.replaceChildren($(".avatar", void 0, avatarIcon));
    } else if (agent.metadata.themeIcon) {
      const avatarIcon = $(ThemeIcon.asCSSSelector(agent.metadata.themeIcon));
      this.icon.replaceChildren($(".avatar.codicon-avatar", void 0, avatarIcon));
    }
    this.domNode.classList.toggle("noExtensionName", !!agent.isDynamic);
    const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
    this.name.textContent = isAllowed ? `@${agent.name}` : getFullyQualifiedId(agent);
    this.extensionName.textContent = agent.extensionDisplayName;
    this.publisherName.textContent = agent.publisherDisplayName ?? agent.extensionPublisherId;
    let description = agent.description ?? "";
    if (description) {
      if (!description.match(/[\.\?\!] *$/)) {
        description += ".";
      }
    }
    this.description.textContent = description;
    this.domNode.classList.toggle("allowedName", isAllowed);
    this.domNode.classList.toggle("verifiedPublisher", false);
    if (!agent.isDynamic) {
      const cancel = this._register(new CancellationTokenSource());
      this.extensionService.getExtensions([{ id: agent.extensionId.value }], cancel.token).then((extensions) => {
        cancel.dispose();
        const extension = extensions[0];
        if (extension?.publisherDomain?.verified) {
          this.domNode.classList.toggle("verifiedPublisher", true);
          this._onDidChangeContents.fire();
        }
      });
    }
  }
};

ChatAgentHover = __decorateClass([
  __decorateParam(0, IChatAgentService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IChatAgentNameService)
], ChatAgentHover);

function getChatAgentHoverOptions(getAgent, commandService) {
  const viewExtensionAction = {
    commandId: showExtensionsWithIdsCommandId,
    label: localize(11859, null),
    run: () => {
      const agent = getAgent();
      if (agent) {
        commandService.executeCommand(showExtensionsWithIdsCommandId, [agent.extensionId.value]);
      }
    }
  };
  return {
    get actions() {
      return getAgent()?.isCore ? [] : [viewExtensionAction];
    }
  };
}
export { getChatAgentHoverOptions, ChatAgentHover };
