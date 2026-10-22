// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpServersInteractionContentPart.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Lazy } from "./module-0028.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { $ } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkdownString, createMarkdownCommandLink, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { ChatProgressContentPart } from "./module-2289.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { IMarkdownRendererService, openLinkFromMarkdown } from "./module-0541.mjs";
import { startServerAndWaitForLiveTools } from "./module-2199.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpService } from "./module-1206.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMcpServersInteractionContentPart.ts
var ChatMcpServersInteractionContentPart = class extends Disposable {
  constructor(data, context2, mcpService, instantiationService, _openerService, _markdownRendererService) {
    super();
    this.data = data;
    this.context = context2;
    this.mcpService = mcpService;
    this.instantiationService = instantiationService;
    this._openerService = _openerService;
    this._markdownRendererService = _markdownRendererService;
    this.interactionMd = this._register(new MutableDisposable());
    this.showSpecificServersScheduler = this._register(new RunOnceScheduler(() => this.updateDetailedProgress(this.data.state.get()), 2500));
    this.previousParts = new Lazy(() => {
      if (!isResponseVM(this.context.element)) {
        return [];
      }
      return this.context.element.session.getItems().filter((r2, i2) => isResponseVM(r2) && i2 < this.context.elementIndex).flatMap((i2) => i2.response.value.filter((c) => c.kind === "mcpServersStarting")).map((p) => p.state?.get());
    });
    this.domNode = $(".chat-mcp-servers-interaction");
    if (data.state) {
      this._register(autorun((reader) => {
        const state = data.state.read(reader);
        this.updateForState(state);
      }));
    }
  }
  updateForState(state) {
    if (!state.working) {
      this.workingProgressPart?.domNode.remove();
      this.workingProgressPart = void 0;
      this.showSpecificServersScheduler.cancel();
    } else if (!this.workingProgressPart) {
      if (!this.showSpecificServersScheduler.isScheduled()) {
        this.showSpecificServersScheduler.schedule();
      }
    } else if (this.workingProgressPart) {
      this.updateDetailedProgress(state);
    }
    const requiringInteraction = state.serversRequiringInteraction.filter((s) => {
      if (this.data.didStartServerIds?.includes(s.id)) {
        return false;
      }
      if (this.previousParts.value.some((p) => p?.serversRequiringInteraction.some((s2) => s.id === s2.id))) {
        return false;
      }
      return true;
    });
    if (requiringInteraction.length > 0) {
      if (!this.interactionMd.value) {
        this.renderInteractionRequired(requiringInteraction);
      } else {
        this.updateInteractionRequired(this.interactionMd.value.element, requiringInteraction);
      }
    } else if (requiringInteraction.length === 0 && this.interactionContainer) {
      this.interactionContainer.remove();
      this.interactionContainer = void 0;
    }
  }
  createServerCommandLinks(servers) {
    return servers.map((s) => createMarkdownCommandLink({
      text: "`" + escapeMarkdownSyntaxTokens(s.label) + "`",
      id: "workbench.mcp.serverOptions" /* ServerOptions */,
      arguments: [s.id],
      tooltip: localize(11943, null, s.label)
    }, false)).join(", ");
  }
  updateDetailedProgress(state) {
    const skipText = createMarkdownCommandLink({
      text: localize(11944, null),
      id: "workbench.mcp.skipAutostart" /* SkipCurrentAutostart */,
      tooltip: localize(11945, null)
    });
    let content2;
    if (state.starting.length === 0) {
      content2 = new MarkdownString(void 0, { isTrusted: true }).appendText(localize(11950, null) + " ").appendMarkdown(skipText);
    } else {
      const serverLinks = this.createServerCommandLinks(state.starting);
      content2 = new MarkdownString(void 0, { isTrusted: true }).appendMarkdown(localize(11949, null, serverLinks) + " ").appendMarkdown(skipText);
    }
    if (this.workingProgressPart) {
      this.workingProgressPart.updateMessage(content2);
    } else {
      this.workingProgressPart = this._register(this.instantiationService.createInstance(
        ChatProgressContentPart,
        { kind: "progressMessage", content: content2 },
        this._markdownRendererService,
        this.context,
        true,
        // forceShowSpinner
        true,
        // forceShowMessage
        void 0,
        // icon
        void 0,
        // toolInvocation
        false
        // no shimmer for now
      ));
      this.domNode.appendChild(this.workingProgressPart.domNode);
    }
  }
  renderInteractionRequired(serversRequiringInteraction) {
    this.interactionContainer = $(".chat-mcp-servers-interaction-hint");
    const messageContainer = $(".chat-mcp-servers-message");
    const icon2 = $(".chat-mcp-servers-icon");
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.mcp));
    const { messageMd } = this.createInteractionMessage(serversRequiringInteraction);
    messageContainer.appendChild(icon2);
    messageContainer.appendChild(messageMd.element);
    this.interactionContainer.appendChild(messageContainer);
    this.domNode.prepend(this.interactionContainer);
  }
  updateInteractionRequired(oldElement, serversRequiringInteraction) {
    const { messageMd } = this.createInteractionMessage(serversRequiringInteraction);
    oldElement.replaceWith(messageMd.element);
  }
  createInteractionMessage(serversRequiringInteraction) {
    const count2 = serversRequiringInteraction.length;
    const links = this.createServerCommandLinks(serversRequiringInteraction);
    const content2 = count2 === 1 ? localize(11947, null, links, "#start") : localize(11946, null, links, "#start");
    const str = new MarkdownString(content2, { isTrusted: true });
    const messageMd = this.interactionMd.value = this._markdownRendererService.render(str, {
      actionHandler: (content3) => {
        if (!content3.startsWith("command:")) {
          this._start(startLink);
          return Promise.resolve(true);
        }
        return openLinkFromMarkdown(this._openerService, content3, true);
      }
    });
    const startLink = [...messageMd.element.querySelectorAll("a")].find((a) => !a.getAttribute("data-href")?.startsWith("command:"));
    if (!startLink) {
      return { messageMd, startLink: void 0 };
    }
    startLink.setAttribute("role", "button");
    startLink.href = "";
    return { messageMd, startLink };
  }
  async _start(startLink) {
    startLink.style.pointerEvents = "none";
    startLink.style.opacity = "0.7";
    try {
      if (!this.data.state) {
        return;
      }
      const state = this.data.state.get();
      const serversToStart = state.serversRequiringInteraction;
      for (let i2 = 0; i2 < serversToStart.length; i2++) {
        const serverInfo = serversToStart[i2];
        startLink.textContent = localize(11948, null, serverInfo.label);
        const server = this.mcpService.servers.get().find((s) => s.definition.id === serverInfo.id);
        if (server) {
          await startServerAndWaitForLiveTools(server, { promptType: "all-untrusted" });
          this.data.didStartServerIds ??= [];
          this.data.didStartServerIds.push(serverInfo.id);
        }
      }
      if (this.interactionContainer) {
        this.interactionContainer.remove();
        this.interactionContainer = void 0;
      }
    } catch (error) {
      startLink.style.pointerEvents = "";
      startLink.style.opacity = "";
      startLink.textContent = "Start now?";
    }
  }
  hasSameContent(other) {
    return other.kind === "mcpServersStarting";
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};

ChatMcpServersInteractionContentPart = __decorateClass([
  __decorateParam(2, IMcpService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IMarkdownRendererService)
], ChatMcpServersInteractionContentPart);
export { ChatMcpServersInteractionContentPart };
