// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownDecorationsRenderer.ts
import { IChatAgentNameService, IChatAgentService, getFullyQualifiedId } from "./module-0974.mjs";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, chatAgentLeader, chatSubcommandLeader } from "./module-0987.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { ChatRichLinkDecorator } from "./module-2274.mjs";
import { URI } from "./module-0032.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { contentRefUrl } from "./module-2210.mjs";
import { AGENT_HOST_SESSION_LINK_SCHEME } from "./module-2029.mjs";
import { $ } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { chatSlashCommandBackground, chatSlashCommandForeground } from "./module-2063.mjs";
import { ChatAgentHover, getChatAgentHoverOptions } from "./module-2251.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { InlineAnchorWidget } from "./module-2142.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatMarkdownAnchorService } from "./module-2140.mjs";
import { ILinkPresentationService } from "./module-0708.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISessionSummaryHoverService } from "./module-2273.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownDecorationsRenderer.ts
var decorationRefUrl = `http://_vscodedecoration_`;

var agentRefUrl = `http://_chatagent_`;

var agentSlashRefUrl = `http://_chatslash_`;

function agentToMarkdown(agent, sessionResource, isClickable, accessor) {
  const chatAgentNameService = accessor.get(IChatAgentNameService);
  const chatAgentService = accessor.get(IChatAgentService);
  const isAllowed = chatAgentNameService.getAgentNameRestriction(agent);
  let name = `${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
  const isDupe = isAllowed && chatAgentService.agentHasDupeName(agent.id);
  if (isDupe) {
    name += ` (${agent.publisherDisplayName})`;
  }
  const args2 = { agentId: agent.id, sessionResource, name, isClickable };
  return `[${agent.name}](${agentRefUrl}?${encodeURIComponent(JSON.stringify(args2))})`;
}

function agentSlashCommandToMarkdown(agent, command4, sessionResource) {
  const text2 = `${chatSubcommandLeader}${command4.name}`;
  const args2 = { agentId: agent.id, command: command4.name, sessionResource };
  return `[${text2}](${agentSlashRefUrl}?${encodeURIComponent(JSON.stringify(args2))})`;
}

var ChatMarkdownDecorationsRenderer = class extends Disposable {
  constructor(keybindingService, logService, chatAgentService, instantiationService, hoverService, chatService, chatWidgetService, commandService, labelService, toolsService, chatMarkdownAnchorService, linkPresentationService, configurationService, sessionSummaryHoverService) {
    super();
    this.keybindingService = keybindingService;
    this.logService = logService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.commandService = commandService;
    this.labelService = labelService;
    this.toolsService = toolsService;
    this.chatMarkdownAnchorService = chatMarkdownAnchorService;
    this.configurationService = configurationService;
    this.richLinkDecorator = new Lazy(() => this._register(new ChatRichLinkDecorator(linkPresentationService, hoverService, sessionSummaryHoverService)));
  }
  convertParsedRequestToMarkdown(sessionResource, parsedRequest) {
    let result = "";
    for (const part of parsedRequest.parts) {
      if (part instanceof ChatRequestTextPart) {
        result += part.text;
      } else if (part instanceof ChatRequestAgentPart) {
        result += this.instantiationService.invokeFunction((accessor) => agentToMarkdown(part.agent, sessionResource, false, accessor));
      } else {
        result += this.genericDecorationToMarkdown(part);
      }
    }
    return result;
  }
  genericDecorationToMarkdown(part) {
    const uri5 = part instanceof ChatRequestDynamicVariablePart && part.data instanceof URI ? part.data : void 0;
    const title = uri5 ? this.labelService.getUriLabel(uri5, { relative: true }) : part instanceof ChatRequestSlashCommandPart ? part.slashCommand.detail : part instanceof ChatRequestAgentSubcommandPart ? part.command.description : part instanceof ChatRequestSlashPromptPart ? part.name : part instanceof ChatRequestToolPart ? this.toolsService.getTool(part.toolId)?.userDescription : "";
    const args2 = { title };
    const text2 = part.text;
    return `[${text2}](${decorationRefUrl}?${encodeURIComponent(JSON.stringify(args2))})`;
  }
  walkTreeAndAnnotateReferenceLinks(content2, element) {
    const store = new DisposableStore();
    const richLinksEnabled = this.configurationService.getValue("chat.experimental.richLinks.enabled" /* RichLinks */);
    element.querySelectorAll("a").forEach((a) => {
      const href = a.getAttribute("data-href");
      if (href) {
        if (href.startsWith(agentRefUrl)) {
          let args2;
          try {
            args2 = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
          } catch (e) {
            this.logService.error("Invalid chat widget render data JSON", toErrorMessage(e));
          }
          if (args2) {
            a.replaceWith(this.renderAgentWidget(args2, store));
          }
        } else if (href.startsWith(agentSlashRefUrl)) {
          let args2;
          try {
            args2 = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
          } catch (e) {
            this.logService.error("Invalid chat slash command render data JSON", toErrorMessage(e));
          }
          if (args2) {
            a.replaceWith(this.renderSlashCommandWidget(a.textContent, args2, store));
          }
        } else if (href.startsWith(decorationRefUrl)) {
          let args2;
          try {
            args2 = JSON.parse(decodeURIComponent(href.slice(decorationRefUrl.length + 1)));
          } catch (e) {
          }
          a.replaceWith(this.renderResourceWidget(a.textContent, args2, store));
        } else if (href.startsWith(contentRefUrl)) {
          this.renderFileWidget(content2, href, a, store);
        } else if (href.startsWith("command:")) {
          this.injectKeybindingHint(a, href, this.keybindingService);
        } else if (richLinksEnabled || href.toLowerCase().startsWith(`${AGENT_HOST_SESSION_LINK_SCHEME}:`)) {
          this.richLinkDecorator.value.decorate(a, href, store);
        }
      }
    });
    return store;
  }
  renderAgentWidget(args2, store) {
    const nameWithLeader = `${chatAgentLeader}${args2.name}`;
    let container3;
    if (args2.isClickable) {
      container3 = $("span.chat-agent-widget");
      const button = store.add(new Button(container3, {
        buttonBackground: asCssVariable(chatSlashCommandBackground),
        buttonForeground: asCssVariable(chatSlashCommandForeground),
        buttonHoverBackground: void 0
      }));
      button.label = nameWithLeader;
      store.add(button.onDidClick(() => {
        const agent2 = this.chatAgentService.getAgent(args2.agentId);
        const widget = this.chatWidgetService.getWidgetBySessionResource(args2.sessionResource) || this.chatWidgetService.lastFocusedWidget;
        if (!widget || !agent2) {
          return;
        }
        this.chatService.sendRequest(
          widget.viewModel.sessionResource,
          agent2.metadata.sampleRequest ?? "",
          {
            location: widget.location,
            agentId: agent2.id,
            ...widget.getSelectedModelRequestOptions(),
            modeInfo: widget.input.currentModeInfo
          }
        );
      }));
    } else {
      container3 = this.renderResourceWidget(nameWithLeader, void 0, store);
    }
    const agent = this.chatAgentService.getAgent(args2.agentId);
    const hover = new Lazy(() => store.add(this.instantiationService.createInstance(ChatAgentHover)));
    store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container3, () => {
      hover.value.setAgent(args2.agentId);
      return hover.value.domNode;
    }, agent && getChatAgentHoverOptions(() => agent, this.commandService)));
    return container3;
  }
  renderSlashCommandWidget(name, args2, store) {
    const container3 = $("span.chat-agent-widget.chat-command-widget");
    const agent = this.chatAgentService.getAgent(args2.agentId);
    const button = store.add(new Button(container3, {
      buttonBackground: asCssVariable(chatSlashCommandBackground),
      buttonForeground: asCssVariable(chatSlashCommandForeground),
      buttonHoverBackground: void 0
    }));
    button.label = name;
    store.add(button.onDidClick(() => {
      const widget = this.chatWidgetService.getWidgetBySessionResource(args2.sessionResource) || this.chatWidgetService.lastFocusedWidget;
      if (!widget || !agent) {
        return;
      }
      const command4 = agent.slashCommands.find((c) => c.name === args2.command);
      this.chatService.sendRequest(widget.viewModel.sessionResource, command4?.sampleRequest ?? "", {
        location: widget.location,
        agentId: agent.id,
        slashCommand: args2.command,
        ...widget.getSelectedModelRequestOptions(),
        modeInfo: widget.input.currentModeInfo
      });
    }));
    return container3;
  }
  renderFileWidget(content2, href, a, store) {
    const fullUri = URI.parse(href);
    const data = content2.inlineReferences?.[fullUri.path.slice(1)];
    if (!data) {
      this.logService.error("Invalid chat widget render data JSON");
      return;
    }
    const inlineAnchor = store.add(this.instantiationService.createInstance(InlineAnchorWidget, a, data, void 0, void 0));
    store.add(this.chatMarkdownAnchorService.register(inlineAnchor));
  }
  renderResourceWidget(name, args2, store) {
    const container3 = $("span.chat-resource-widget");
    const alias = $("span", void 0, name);
    if (args2?.title) {
      store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container3, args2.title));
    }
    container3.appendChild(alias);
    return container3;
  }
  injectKeybindingHint(a, href, keybindingService) {
    const command4 = href.match(/command:([^\)]+)/)?.[1];
    if (command4) {
      a.textContent = keybindingService.appendKeybinding(a.textContent || "", command4);
    }
  }
};

ChatMarkdownDecorationsRenderer = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, ILanguageModelToolsService),
  __decorateParam(10, IChatMarkdownAnchorService),
  __decorateParam(11, ILinkPresentationService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ISessionSummaryHoverService)
], ChatMarkdownDecorationsRenderer);
export { agentToMarkdown, agentSlashCommandToMarkdown, decorationRefUrl, agentRefUrl, agentSlashRefUrl, ChatMarkdownDecorationsRenderer };
