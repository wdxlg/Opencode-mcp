// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCompletions.ts
import { IChatSessionsService, isAgentHostTarget } from "./module-0960.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestSlashPromptPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestToolSetPart, chatAgentLeader, chatSubcommandLeader, chatVariableLeader } from "./module-0987.mjs";
import { attachedContextCompletionAdditionalTriggerCharacters, computeCompletionRanges2, escapeForCharClass, getAttachedContextCompletionMatch, getAttachedContextCompletionSortText, getCompletionRangeWord, isEmptyUpToCompletionWord } from "./module-2416.mjs";
import { matchesSessionType } from "./module-0986.mjs";
import { ChatSubmitAction } from "./module-2062.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IChatSlashCommandService } from "./module-0988.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { IChatService } from "./module-0972.mjs";
import { IMcpService, McpResourceURI } from "./module-1206.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { coalesce } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { IChatAgentNameService, IChatAgentService, getFullyQualifiedId } from "./module-0974.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IFileService } from "./module-0269.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { McpPromptArgumentPick } from "./module-2827.mjs";
import { URI } from "./module-0032.mjs";
import { generateUuid } from "./module-0190.mjs";
import { basename2 } from "./module-0034.mjs";
import { getAttachableImageExtension } from "./module-1193.mjs";
import { resizeImage } from "./module-0944.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { toAttachedContextDynamicVariable } from "./module-0983.mjs";
import { getCodeEditor, isCodeEditor } from "./module-0223.mjs";
import { AgentSessionProviders, getAgentSessionProviderIcon } from "./module-0982.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { isDiffEditorInput } from "./module-0925.mjs";
import { isSupportedChatFileScheme } from "./module-0964.mjs";
import { isPatternInWord } from "./module-0453.mjs";
import { searchFilesAndFolders } from "./module-2859.mjs";
import { StopWatch } from "./module-0016.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { ChatDynamicVariableModel } from "./module-0984.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ISearchService } from "./module-0999.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { isToolSet } from "./module-0990.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCompletions.ts
var SlashCommandWord = /\/[\p{L}0-9_.:-]*/gu;

var AgentOrSlashCommandWord = /(@|\/)[\p{L}0-9_.:-]*/gu;

function isAgentHostBackedWidget(widget) {
  const sessionResource = widget.viewModel?.model.sessionResource;
  return !!sessionResource && isAgentHostTarget(getChatSessionType(sessionResource));
}

var SlashCommandCompletions = class extends Disposable {
  constructor(languageFeaturesService, chatWidgetService, chatSlashCommandService, harnessService, chatService, chatSessionsService, mcpService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatSlashCommandService = chatSlashCommandService;
    this.harnessService = harnessService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "globalSlashCommands",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: async (model, position2, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range2 = computeCompletionRanges2(model, position2, SlashCommandWord);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent) {
          return;
        }
        const slashCommands = this.chatSlashCommandService.getCommands(widget.location, widget.input.currentModeKind);
        if (!slashCommands) {
          return null;
        }
        const sessionType = getChatSessionType(widget.viewModel.model.sessionResource);
        return {
          suggestions: slashCommands.filter((c) => {
            if (!c.silent && !widget.attachmentCapabilities.supportsPromptAttachments) {
              return false;
            }
            if (c.when && !widget.scopedContextKeyService.contextMatchesRules(c.when)) {
              return false;
            }
            if (!matchesSessionType(c.sessionTypes, sessionType)) {
              return false;
            }
            if (!widget.lockedAgentId) {
              return true;
            }
            if (c.modes && c.modes.length && !c.modes.includes("agent" /* Agent */)) {
              return false;
            }
            return true;
          }).map((c, i2) => {
            const withSlash = `/${c.command}`;
            return {
              label: { label: withSlash, description: c.detail },
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              documentation: c.detail,
              range: range2,
              sortText: c.sortText ?? "a".repeat(i2 + 1),
              kind: 18 /* Text */,
              // The icons are disabled here anyway,
              command: c.executeImmediately ? { id: ChatSubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : void 0
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "globalSlashCommandsAt",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: async (model, position2, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        const range2 = computeCompletionRanges2(model, position2, /@\w*/g);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const slashCommands = this.chatSlashCommandService.getCommands(widget.location, widget.input.currentModeKind);
        if (!slashCommands) {
          return null;
        }
        if (widget.lockedAgentId) {
          return null;
        }
        const currentSessionType = getChatSessionType(widget.viewModel.model.sessionResource);
        return {
          suggestions: slashCommands.filter((c) => !c.when || widget.scopedContextKeyService.contextMatchesRules(c.when)).filter((c) => matchesSessionType(c.sessionTypes, currentSessionType)).map((c, i2) => {
            const withSlash = `${chatSubcommandLeader}${c.command}`;
            return {
              label: { label: withSlash, description: c.detail },
              insertText: c.executeImmediately ? "" : `${withSlash} `,
              documentation: c.detail,
              range: range2,
              filterText: `${chatAgentLeader}${c.command}`,
              sortText: c.sortText ?? "z".repeat(i2 + 1),
              kind: 18 /* Text */,
              // The icons are disabled here anyway,
              command: c.executeImmediately ? { id: ChatSubmitAction.ID, title: withSlash, arguments: [{ widget, inputValue: `${withSlash} ` }] } : void 0
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "promptSlashCommands",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        const range2 = computeCompletionRanges2(model, position2, SlashCommandWord);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const parsedRequest = widget.parsedInput.parts;
        const usedAgent = parsedRequest.find((p) => p instanceof ChatRequestAgentPart);
        if (usedAgent) {
          return;
        }
        const currentSessionType = getChatSessionType(widget.viewModel.model.sessionResource);
        const promptCommands = await this.harnessService.getSlashCommands(widget.viewModel.model.sessionResource, token);
        if (promptCommands.length === 0) {
          return null;
        }
        if (widget.lockedAgentId && !widget.attachmentCapabilities.supportsPromptAttachments) {
          return null;
        }
        const userInvocableCommands = promptCommands.filter((c) => c.userInvocable).filter((c) => matchesSessionType(c.sessionTypes, currentSessionType));
        if (userInvocableCommands.length === 0) {
          return null;
        }
        return {
          suggestions: userInvocableCommands.map((c, i2) => {
            const colonLabel = `/${c.name}`;
            const hasSubcommand = c.name.includes(":");
            const displayLabel = hasSubcommand ? `/${c.name.replace(/:/g, " ")}` : colonLabel;
            const description = c.description;
            return {
              label: { label: displayLabel, description },
              insertText: `${displayLabel} `,
              documentation: c.description,
              range: range2,
              // Allow matching by either the space form (what the user sees) or the
              // colon form (so legacy `/chronicle:tips` typing still filters).
              filterText: hasSubcommand ? `${colonLabel} ${displayLabel}` : void 0,
              sortText: "a".repeat(i2 + 1),
              kind: 18 /* Text */
              // The icons are disabled here anyway,
            };
          })
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "mcpPromptSlashCommands",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: async (model, position2, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return null;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        const range2 = computeCompletionRanges2(model, position2, /\/[\p{L}0-9_.-]*/gu);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        if (widget.lockedAgentId) {
          return null;
        }
        return {
          suggestions: mcpService.servers.get().flatMap((server) => server.prompts.get().map((prompt) => {
            const label3 = `/mcp.${prompt.id}`;
            return {
              label: { label: label3, description: prompt.description },
              command: {
                id: StartParameterizedPromptAction.ID,
                title: prompt.name,
                arguments: [model, server, prompt, `${label3} `]
              },
              insertText: `${label3} `,
              range: range2,
              kind: 18 /* Text */
            };
          }))
        };
      }
    }));
  }
};

SlashCommandCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatSlashCommandService),
  __decorateParam(3, ICustomizationHarnessService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IChatSessionsService),
  __decorateParam(6, IMcpService)
], SlashCommandCompletions);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(SlashCommandCompletions, 4 /* Eventually */);

var AgentCompletions = class extends Disposable {
  constructor(languageFeaturesService, chatWidgetService, chatAgentService, chatAgentNameService, chatSessionsService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatAgentService = chatAgentService;
    this.chatAgentNameService = chatAgentNameService;
    this.chatSessionsService = chatSessionsService;
    const subCommandProvider = {
      _debugDisplayName: "chatAgentSubcommand",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget || !widget.viewModel) {
          return;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        const range2 = computeCompletionRanges2(model, position2, SlashCommandWord);
        if (!range2) {
          return;
        }
        const usedAgent = this.getCurrentAgentForWidget(widget);
        if (!usedAgent || usedAgent.command) {
          return;
        }
        return {
          suggestions: usedAgent.agent.slashCommands.map((c, i2) => {
            const withSlash = `/${c.name}`;
            return {
              label: withSlash,
              insertText: `${withSlash} `,
              documentation: c.description,
              range: range2,
              kind: 18 /* Text */
              // The icons are disabled here anyway
            };
          })
        };
      }
    };
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, subCommandProvider));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentAndSubcommand",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        const viewModel = widget?.viewModel;
        if (!widget || !viewModel) {
          return;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        if (widget.lockedAgentId) {
          return null;
        }
        const range2 = computeCompletionRanges2(model, position2, AgentOrSlashCommandWord);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => a.locations.includes(widget.location));
        const chatSessionContributions = this.chatSessionsService.getAllChatSessionContributions();
        const chatSessionAgentIds = new Set(chatSessionContributions.map((contribution) => contribution.type));
        const agentsForSlashCommands = agents.filter((a) => !chatSessionAgentIds.has(a.id));
        const getFilterText = (agent, command4) => {
          const dummyPrefix = agent.id === "github.copilot.terminalPanel" ? `0000` : ``;
          return `${chatAgentLeader}${dummyPrefix}${agent.name}.${command4}`;
        };
        const justAgents = agents.filter((a) => !a.isDefault).filter((a) => !chatSessionAgentIds.has(a.id)).map((agent) => {
          const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
          const detail2 = agent.description;
          return {
            label: isDupe ? { label: agentLabel, description: agent.description, detail: ` (${agent.publisherDisplayName})` } : agentLabel,
            documentation: detail2,
            filterText: `${chatAgentLeader}${agent.name}`,
            insertText: `${agentLabel} `,
            range: range2,
            kind: 18 /* Text */,
            sortText: `${chatAgentLeader}${agent.name}`,
            command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
          };
        });
        return {
          suggestions: justAgents.concat(
            coalesce(agentsForSlashCommands.flatMap((agent) => agent.slashCommands.map((c, i2) => {
              if (agent.isDefault && this.chatAgentService.getDefaultAgent(widget.location, widget.input.currentModeKind)?.id !== agent.id) {
                return;
              }
              const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
              const label3 = `${agentLabel} ${chatSubcommandLeader}${c.name}`;
              const item = {
                label: isDupe ? { label: label3, description: c.description, detail: isDupe ? ` (${agent.publisherDisplayName})` : void 0 } : label3,
                documentation: c.description,
                filterText: getFilterText(agent, c.name),
                commitCharacters: [" "],
                insertText: label3 + " ",
                range: range2,
                kind: 18 /* Text */,
                // The icons are disabled here anyway
                sortText: `x${chatAgentLeader}${agent.name}${c.name}`,
                command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
              };
              if (agent.isDefault) {
                const label4 = `${chatSubcommandLeader}${c.name}`;
                item.label = label4;
                item.insertText = `${label4} `;
                item.documentation = c.description;
              }
              return item;
            })))
          )
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatAgentAndSubcommand",
      triggerCharacters: [chatSubcommandLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        const viewModel = widget?.viewModel;
        if (!widget || !viewModel) {
          return;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        if (widget.lockedAgentId) {
          return null;
        }
        const range2 = computeCompletionRanges2(model, position2, AgentOrSlashCommandWord);
        if (!range2) {
          return null;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const agents = this.chatAgentService.getAgents().filter((a) => a.locations.includes(widget.location) && a.modes.includes(widget.input.currentModeKind)).filter((a) => !this.chatSessionsService.getChatSessionContribution(a.id));
        return {
          suggestions: coalesce(agents.flatMap((agent) => agent.slashCommands.map((c, i2) => {
            if (agent.isDefault && this.chatAgentService.getDefaultAgent(widget.location, widget.input.currentModeKind)?.id !== agent.id) {
              return;
            }
            const { label: agentLabel, isDupe } = this.getAgentCompletionDetails(agent);
            const withSlash = `${chatSubcommandLeader}${c.name}`;
            const extraSortText = agent.id === "github.copilot.terminalPanel" ? `z` : ``;
            const sortText = `${chatSubcommandLeader}${extraSortText}${agent.name}${c.name}`;
            const item = {
              label: { label: withSlash, description: agentLabel, detail: isDupe ? ` (${agent.publisherDisplayName})` : void 0 },
              commitCharacters: [" "],
              insertText: `${agentLabel} ${withSlash} `,
              documentation: `(${agentLabel}) ${c.description ?? ""}`,
              range: range2,
              kind: 18 /* Text */,
              // The icons are disabled here anyway
              sortText,
              command: { id: AssignSelectedAgentAction.ID, title: AssignSelectedAgentAction.ID, arguments: [{ agent, widget }] }
            };
            if (agent.isDefault) {
              const label3 = `${chatSubcommandLeader}${c.name}`;
              item.label = label3;
              item.insertText = `${label3} `;
              item.documentation = c.description;
            }
            return item;
          })))
        };
      }
    }));
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "installChatExtensions",
      triggerCharacters: [chatAgentLeader],
      provideCompletionItems: async (model, position2, _context, token) => {
        if (!model.getLineContent(1).startsWith(chatAgentLeader)) {
          return;
        }
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (widget?.location !== "panel" /* Chat */ || widget.input.currentModeKind !== "ask" /* Ask */) {
          return;
        }
        if (isAgentHostBackedWidget(widget)) {
          return;
        }
        if (widget.lockedAgentId) {
          return null;
        }
        const range2 = computeCompletionRanges2(model, position2, AgentOrSlashCommandWord);
        if (!range2) {
          return;
        }
        if (!isEmptyUpToCompletionWord(model, range2)) {
          return;
        }
        const label3 = localize(12524, null);
        const item = {
          label: label3,
          insertText: "",
          range: range2,
          kind: 18 /* Text */,
          // The icons are disabled here anyway
          command: { id: "workbench.extensions.search", title: "", arguments: ["@tag:chat-participant"] },
          filterText: chatAgentLeader + label3,
          sortText: "zzz"
        };
        return {
          suggestions: [item]
        };
      }
    }));
  }
  getCurrentAgentForWidget(widget) {
    if (widget.lockedAgentId) {
      const usedAgent2 = this.chatAgentService.getAgent(widget.lockedAgentId);
      return usedAgent2 && { agent: usedAgent2 };
    }
    const parsedRequest = widget.parsedInput.parts;
    const usedAgentIdx = parsedRequest.findIndex((p) => p instanceof ChatRequestAgentPart);
    if (usedAgentIdx < 0) {
      return;
    }
    const usedAgent = parsedRequest[usedAgentIdx];
    const usedOtherCommand = parsedRequest.find((p) => p instanceof ChatRequestAgentSubcommandPart || p instanceof ChatRequestSlashPromptPart);
    if (usedOtherCommand) {
      return {
        agent: usedAgent.agent,
        command: usedOtherCommand instanceof ChatRequestAgentSubcommandPart ? usedOtherCommand.command.name : void 0
      };
    }
    for (const partAfterAgent of parsedRequest.slice(usedAgentIdx + 1)) {
      if (!(partAfterAgent instanceof ChatRequestTextPart) || !partAfterAgent.text.trim().match(/^(\/[\p{L}0-9_.:-]*)?$/u)) {
        return;
      }
    }
    return { agent: usedAgent.agent };
  }
  getAgentCompletionDetails(agent) {
    const isAllowed = this.chatAgentNameService.getAgentNameRestriction(agent);
    const agentLabel = `${chatAgentLeader}${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
    const isDupe = isAllowed && this.chatAgentService.agentHasDupeName(agent.id);
    return { label: agentLabel, isDupe };
  }
};

AgentCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IChatAgentNameService),
  __decorateParam(4, IChatSessionsService)
], AgentCompletions);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(AgentCompletions, 4 /* Eventually */);

var AssignSelectedAgentAction = class _AssignSelectedAgentAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.assignSelectedAgent";
  }
  constructor() {
    super({
      id: _AssignSelectedAgentAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args2) {
    const arg = args2[0];
    if (!arg || !arg.widget || !arg.agent) {
      return;
    }
    if (!arg.agent.modes.includes(arg.widget.input.currentModeKind)) {
      arg.widget.input.setChatMode(arg.agent.modes[0]);
    }
    arg.widget.lastSelectedAgent = arg.agent;
  }
};

registerAction2(AssignSelectedAgentAction);

var StartParameterizedPromptAction = class _StartParameterizedPromptAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.startParameterizedPrompt";
  }
  constructor() {
    super({
      id: _StartParameterizedPromptAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, model, server, prompt, textToReplace) {
    if (!model || !prompt) {
      return;
    }
    const instantiationService = accessor.get(IInstantiationService);
    const notificationService = accessor.get(INotificationService);
    const widgetService = accessor.get(IChatWidgetService);
    const fileService = accessor.get(IFileService);
    const chatWidget = await widgetService.revealWidget(true);
    if (!chatWidget) {
      return;
    }
    const lastPosition = model.getFullModelRange().collapseToEnd();
    const getPromptIndex = () => model.findMatches(textToReplace, true, false, true, null, false)[0];
    const replaceTextWith = (value2) => model.applyEdits([{
      range: getPromptIndex()?.range || lastPosition,
      text: value2
    }]);
    const store = new DisposableStore();
    const cts = store.add(new CancellationTokenSource());
    store.add(chatWidget.input.startGenerating());
    store.add(model.onDidChangeContent(() => {
      if (getPromptIndex()) {
        cts.cancel();
      }
    }));
    model.changeDecorations((accessor2) => {
      const id2 = accessor2.addDecoration(lastPosition, {
        description: "mcp-prompt-spinner",
        showIfCollapsed: true,
        after: {
          content: " ",
          inlineClassNameAffectsLetterSpacing: true,
          inlineClassName: ThemeIcon.asClassName(ThemeIcon.modify(Codicon.loadingCompact, "spin")) + " chat-prompt-spinner"
        }
      });
      store.add(toDisposable(() => {
        model.changeDecorations((a) => a.removeDecoration(id2));
      }));
    });
    const pick = store.add(instantiationService.createInstance(McpPromptArgumentPick, prompt));
    try {
      await server.start();
      const args2 = await pick.createArgs();
      if (!args2) {
        replaceTextWith("");
        return;
      }
      let messages;
      try {
        messages = await prompt.resolve(args2, cts.token);
      } catch (e) {
        if (!cts.token.isCancellationRequested) {
          notificationService.error(localize(12525, null, String(e)));
        }
        replaceTextWith("");
        return;
      }
      const toAttach = [];
      const attachBlob = async (mimeType, contents, uriStr, isText = false) => {
        let validURI;
        if (uriStr) {
          for (const uri5 of [URI.parse(uriStr), McpResourceURI.fromServer(server.definition, uriStr)]) {
            try {
              validURI ||= await fileService.exists(uri5) ? uri5 : void 0;
            } catch {
            }
          }
        }
        if (isText) {
          if (validURI) {
            toAttach.push({
              id: generateUuid(),
              kind: "file",
              value: validURI,
              name: basename2(validURI)
            });
          } else {
            toAttach.push({
              id: generateUuid(),
              kind: "generic",
              value: contents,
              name: localize(12527, null)
            });
          }
        } else if (mimeType && getAttachableImageExtension(mimeType)) {
          const resized = await resizeImage(contents).catch(() => decodeBase64(contents).buffer);
          chatWidget.attachmentModel.addContext({
            id: generateUuid(),
            name: localize(12526, null),
            fullName: localize(12526, null),
            value: resized,
            kind: "image",
            references: validURI && [{ reference: validURI, kind: "reference" }]
          });
        } else if (validURI) {
          toAttach.push({
            id: generateUuid(),
            kind: "file",
            value: validURI,
            name: basename2(validURI)
          });
        } else {
        }
      };
      const hasMultipleRoles = messages.some((m) => m.role !== messages[0].role);
      let input = "";
      for (const message of messages) {
        switch (message.content.type) {
          case "text":
            if (input) {
              input += "\n\n";
            }
            if (hasMultipleRoles) {
              input += `--${message.role.toUpperCase()}
`;
            }
            input += message.content.text;
            break;
          case "resource":
            if ("text" in message.content.resource) {
              await attachBlob(message.content.resource.mimeType, message.content.resource.text, message.content.resource.uri, true);
            } else {
              await attachBlob(message.content.resource.mimeType, message.content.resource.blob, message.content.resource.uri);
            }
            break;
          case "image":
          case "audio":
            await attachBlob(message.content.mimeType, message.content.data);
            break;
        }
      }
      if (toAttach.length) {
        chatWidget.attachmentModel.addContext(...toAttach);
      }
      replaceTextWith(input);
    } finally {
      store.dispose();
    }
  }
};

registerAction2(StartParameterizedPromptAction);

var ReferenceArgument = class {
  constructor(widget, variable) {
    this.widget = widget;
    this.variable = variable;
  }
};

var BuiltinDynamicCompletions = class extends Disposable {
  // MUST be using `g`-flag
  constructor(historyService, workspaceContextService, searchService, labelService, languageFeaturesService, chatWidgetService, outlineService, editorService, configurationService, codeEditorService, chatAgentService, instantiationService, chatSessionsService) {
    super();
    this.historyService = historyService;
    this.workspaceContextService = workspaceContextService;
    this.searchService = searchService;
    this.labelService = labelService;
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.outlineService = outlineService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
    this.chatAgentService = chatAgentService;
    this.instantiationService = instantiationService;
    this.chatSessionsService = chatSessionsService;
    this.registerVariableCompletions("attachedContexts", ({ widget, range: range2 }) => {
      if (!widget.supportsFileReferences) {
        return;
      }
      const typedLeader = range2.varWord?.word?.charAt(0) === chatAgentLeader ? chatAgentLeader : chatVariableLeader;
      const typedWord = getCompletionRangeWord(range2) ?? typedLeader;
      const suggestOptions = widget.inputEditor.getOption(134 /* suggest */);
      const suggestions = coalesce(widget.attachmentModel.attachments.filter((attachment) => !attachment.range).map((attachment) => {
        const match2 = getAttachedContextCompletionMatch(typedWord, typedLeader, attachment.name, attachment.kind, suggestOptions);
        if (!match2) {
          return void 0;
        }
        const text2 = `${typedLeader}attachment:${attachment.name}`;
        const referenceRange = {
          startLineNumber: range2.replace.startLineNumber,
          startColumn: range2.replace.startColumn,
          endLineNumber: range2.replace.endLineNumber,
          endColumn: range2.replace.startColumn + text2.length
        };
        return {
          label: { label: attachment.name, description: localize(12522, null) },
          filterText: match2.filterText,
          insertText: range2.varWord?.endColumn === range2.replace.endColumn ? `${text2} ` : text2,
          range: range2,
          kind: attachment.kind === "directory" ? 23 /* Folder */ : attachment.kind === "file" || attachment.kind === "image" ? 20 /* File */ : 21 /* Reference */,
          sortText: getAttachedContextCompletionSortText(match2.score),
          command: {
            id: BuiltinDynamicCompletions.addReferenceCommand,
            title: "",
            arguments: [new ReferenceArgument(widget, toAttachedContextDynamicVariable(attachment, referenceRange))]
          }
        };
      }));
      return { suggestions, incomplete: true };
    }, BuiltinDynamicCompletions.VariableNameDef, true, attachedContextCompletionAdditionalTriggerCharacters);
    const fileWordPattern = new RegExp(`[${escapeForCharClass(chatVariableLeader)}${escapeForCharClass(chatAgentLeader)}][^\\s]*`, "g");
    this.registerVariableCompletions("fileAndFolder", async ({ widget, range: range2 }, token) => {
      if (!widget.supportsFileReferences) {
        return;
      }
      const result = { suggestions: [] };
      if (widget.lockedAgentId) {
        const agent = this.chatAgentService.getAgent(widget.lockedAgentId);
        if (agent && !agent.capabilities?.supportsFileAttachments) {
          return result;
        }
      }
      await this.addFileAndFolderEntries(widget, result, range2, token);
      return result;
    }, fileWordPattern);
    this.registerVariableCompletions("selection", ({ widget, range: range2 }, token) => {
      if (!widget.supportsFileReferences) {
        return;
      }
      if (widget.location === "editor" /* EditorInline */) {
        return;
      }
      const active = this.findActiveCodeEditor();
      if (!isCodeEditor(active)) {
        return;
      }
      const currentResource = active.getModel()?.uri;
      const currentSelection = active.getSelection();
      if (!currentSelection || !currentResource || currentSelection.isEmpty()) {
        return;
      }
      const typedLeader = range2.varWord?.word?.charAt(0) === chatAgentLeader ? chatAgentLeader : chatVariableLeader;
      const basename3 = this.labelService.getUriBasenameLabel(currentResource);
      const text2 = `${typedLeader}file:${basename3}:${currentSelection.startLineNumber}-${currentSelection.endLineNumber}`;
      const fullRangeText = `:${currentSelection.startLineNumber}:${currentSelection.startColumn}-${currentSelection.endLineNumber}:${currentSelection.endColumn}`;
      const description = this.labelService.getUriLabel(currentResource, { relative: true }) + fullRangeText;
      const result = { suggestions: [] };
      result.suggestions.push({
        label: { label: `${typedLeader}selection`, description },
        filterText: `${typedLeader}selection`,
        insertText: range2.varWord?.endColumn === range2.replace.endColumn ? `${text2} ` : text2,
        range: range2,
        kind: 18 /* Text */,
        sortText: "z",
        command: {
          id: BuiltinDynamicCompletions.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: "vscode.selection",
            isFile: true,
            range: { startLineNumber: range2.replace.startLineNumber, startColumn: range2.replace.startColumn, endLineNumber: range2.replace.endLineNumber, endColumn: range2.replace.startColumn + text2.length },
            data: { range: currentSelection, uri: currentResource }
          })]
        }
      });
      return result;
    });
    this.registerVariableCompletions("symbol", ({ widget, range: range2, position: position2, model }, token) => {
      if (!widget.supportsFileReferences) {
        return null;
      }
      const result = { suggestions: [] };
      const range22 = computeCompletionRanges2(model, position2, new RegExp(`[${escapeForCharClass(chatVariableLeader)}${escapeForCharClass(chatAgentLeader)}][^\\s]*`, "g"), true);
      if (range22) {
        this.addSymbolEntries(widget, result, range22, token);
      }
      return result;
    });
    const sessionWordPattern = new RegExp(`${chatVariableLeader}[^\\s]*`, "g");
    this.registerVariableCompletions("sessionReference", async ({ widget, range: range2 }, token) => {
      if (widget.location !== "panel" /* Chat */) {
        return;
      }
      const typedWord = range2.varWord?.word ?? "";
      const sessionPrefix = `${chatVariableLeader}session`;
      const result = { suggestions: [] };
      if (typedWord.toLowerCase().startsWith(`${sessionPrefix}:`)) {
        const allSessions = [];
        const sessionProviderFilter = [AgentSessionProviders.Local, AgentSessionProviders.Background, AgentSessionProviders.AgentHostCopilot];
        for await (const group2 of this.chatSessionsService.getChatSessionItems(sessionProviderFilter, token)) {
          if (token.isCancellationRequested) {
            return;
          }
          const providerIcon = getAgentSessionProviderIcon(group2.chatSessionType);
          for (const item of group2.items) {
            allSessions.push({
              title: item.label,
              sessionResource: item.resource,
              lastMessageDate: item.timing.lastRequestEnded ?? item.timing.created,
              icon: item.iconPath ?? providerIcon
            });
          }
        }
        const currentSessionResource = widget.viewModel?.sessionResource;
        const filteredSessions = allSessions.filter((s) => !currentSessionResource || s.sessionResource.toString() !== currentSessionResource.toString()).sort((a, b) => b.lastMessageDate - a.lastMessageDate);
        for (const session of filteredSessions) {
          const text2 = `${sessionPrefix}:${session.title}`;
          const dateStr = new Date(session.lastMessageDate).toLocaleString();
          result.suggestions.push({
            label: { label: session.title, description: dateStr },
            filterText: `${sessionPrefix}:${session.title}`,
            insertText: range2.varWord?.endColumn === range2.replace.endColumn ? `${text2} ` : text2,
            range: range2,
            kind: 18 /* Text */,
            sortText: `z${String(Number.MAX_SAFE_INTEGER - session.lastMessageDate).padStart(20, "0")}`,
            command: {
              id: BuiltinDynamicCompletions.addReferenceCommand,
              title: "",
              arguments: [new ReferenceArgument(widget, {
                id: session.sessionResource.toString(),
                icon: session.icon,
                range: { startLineNumber: range2.replace.startLineNumber, startColumn: range2.replace.startColumn, endLineNumber: range2.replace.endLineNumber, endColumn: range2.replace.startColumn + text2.length },
                data: session.sessionResource
              })]
            }
          });
        }
      } else {
        result.suggestions.push({
          label: { label: sessionPrefix, description: localize(12528, null) },
          filterText: sessionPrefix,
          insertText: `${sessionPrefix}:`,
          range: range2,
          kind: 18 /* Text */,
          sortText: "z",
          command: { id: "editor.action.triggerSuggest", title: "" }
        });
      }
      return result;
    }, sessionWordPattern);
    this._register(CommandsRegistry.registerCommand(BuiltinDynamicCompletions.addReferenceCommand, (_services, arg) => {
      assertType(arg instanceof ReferenceArgument);
      return this.cmdAddReference(arg);
    }));
  }
  static {
    this.addReferenceCommand = "_addReferenceCmd";
  }
  static {
    this.VariableNameDef = new RegExp(`[${escapeForCharClass(chatVariableLeader)}${escapeForCharClass(chatAgentLeader)}][\\w:-]*`, "g");
  }
  findActiveCodeEditor() {
    const codeEditor = this.codeEditorService.getActiveCodeEditor();
    if (codeEditor) {
      const model = codeEditor.getModel();
      if (model?.uri.scheme === Schemas.vscodeNotebookCell) {
        return void 0;
      }
      if (model) {
        return codeEditor;
      }
    }
    for (const codeOrDiffEditor of this.editorService.getVisibleTextEditorControls(0 /* MOST_RECENTLY_ACTIVE */)) {
      const codeEditor2 = getCodeEditor(codeOrDiffEditor);
      if (!codeEditor2) {
        continue;
      }
      const model = codeEditor2.getModel();
      if (model) {
        return codeEditor2;
      }
    }
    return void 0;
  }
  registerVariableCompletions(debugName, provider, wordPattern = BuiltinDynamicCompletions.VariableNameDef, includeAgentHost = false, additionalTriggerCharacters = []) {
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: `chatVarCompletions-${debugName}`,
      triggerCharacters: [chatVariableLeader, chatAgentLeader, ...additionalTriggerCharacters],
      provideCompletionItems: async (model, position2, context2, token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget) {
          return;
        }
        if (!includeAgentHost && isAgentHostBackedWidget(widget)) {
          return;
        }
        const range2 = computeCompletionRanges2(model, position2, wordPattern, true);
        if (range2) {
          return provider({ model, position: position2, widget, range: range2, context: context2 }, token);
        }
        return;
      }
    }));
  }
  async addFileAndFolderEntries(widget, result, info, token) {
    const typedLeader = info.varWord?.word?.charAt(0) === chatAgentLeader ? chatAgentLeader : chatVariableLeader;
    const makeCompletionItem = (resource, kind, description, boostPriority) => {
      const basename3 = this.labelService.getUriBasenameLabel(resource);
      const text2 = `${typedLeader}file:${basename3}`;
      const uriLabel = this.labelService.getUriLabel(resource, { relative: true });
      const labelDescription = description ? localize(12523, null, uriLabel, description) : uriLabel;
      const sortText = boostPriority ? " " : "!";
      return {
        label: { label: basename3, description: labelDescription },
        filterText: `${basename3} ${typedLeader}${basename3} ${uriLabel}`,
        insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text2} ` : text2,
        range: info,
        kind: kind === 0 /* FILE */ ? 20 /* File */ : 23 /* Folder */,
        sortText,
        command: {
          id: BuiltinDynamicCompletions.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: resource.toString(),
            isFile: kind === 0 /* FILE */,
            isDirectory: kind === 1 /* FOLDER */,
            range: { startLineNumber: info.replace.startLineNumber, startColumn: info.replace.startColumn, endLineNumber: info.replace.endLineNumber, endColumn: info.replace.startColumn + text2.length },
            data: resource
          })]
        }
      };
    };
    let pattern;
    if (info.varWord?.word && (info.varWord.word.startsWith(chatVariableLeader) || info.varWord.word.startsWith(chatAgentLeader))) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const seen = new ResourceSet();
    const len = result.suggestions.length;
    for (const [i2, item] of this.historyService.getHistory().entries()) {
      const resource = isDiffEditorInput(item) ? item.modified.resource : item.resource;
      if (!resource || seen.has(resource) || !this.instantiationService.invokeFunction((accessor) => isSupportedChatFileScheme(accessor, resource.scheme))) {
        continue;
      }
      if (pattern) {
        const uriLabel = this.labelService.getUriLabel(resource, { relative: true }).toLowerCase();
        const basename3 = this.labelService.getUriBasenameLabel(resource).toLowerCase();
        const combined = `${basename3} ${uriLabel}`;
        if (!isPatternInWord(pattern, 0, pattern.length, combined, 0, combined.length)) {
          continue;
        }
      }
      seen.add(resource);
      const newLen = result.suggestions.push(makeCompletionItem(resource, 0 /* FILE */, i2 === 0 ? localize(12521, null) : void 0, i2 === 0));
      if (newLen - len >= 5) {
        break;
      }
    }
    if (pattern) {
      const cacheKey2 = this.updateCacheKey();
      const workspaces = this.workspaceContextService.getWorkspace().folders.map((folder) => folder.uri);
      for (const workspace of workspaces) {
        const { folders, files } = await searchFilesAndFolders(workspace, pattern, true, token, cacheKey2.key, this.configurationService, this.searchService);
        for (const file of files) {
          if (!seen.has(file)) {
            result.suggestions.push(makeCompletionItem(file, 0 /* FILE */));
            seen.add(file);
          }
        }
        for (const folder of folders) {
          if (!seen.has(folder)) {
            result.suggestions.push(makeCompletionItem(folder, 1 /* FOLDER */));
            seen.add(folder);
          }
        }
      }
    }
    result.incomplete = true;
  }
  addSymbolEntries(widget, result, info, token) {
    const timeoutMs = 100;
    const stopwatch = new StopWatch();
    const typedLeader = info.varWord?.word?.charAt(0) === chatAgentLeader ? chatAgentLeader : chatVariableLeader;
    const makeSymbolCompletionItem = (symbolItem, pattern2) => {
      const text2 = `${typedLeader}sym:${symbolItem.name}`;
      const resource = symbolItem.location.uri;
      const uriLabel = this.labelService.getUriLabel(resource, { relative: true });
      const sortText = pattern2 ? "{" : "|";
      return {
        label: { label: symbolItem.name, description: uriLabel },
        filterText: `${typedLeader}${symbolItem.name}`,
        insertText: info.varWord?.endColumn === info.replace.endColumn ? `${text2} ` : text2,
        range: info,
        kind: SymbolKinds.toCompletionKind(symbolItem.kind),
        sortText,
        command: {
          id: BuiltinDynamicCompletions.addReferenceCommand,
          title: "",
          arguments: [new ReferenceArgument(widget, {
            id: `vscode.symbol/${JSON.stringify(symbolItem.location)}`,
            fullName: symbolItem.name,
            range: { startLineNumber: info.replace.startLineNumber, startColumn: info.replace.startColumn, endLineNumber: info.replace.endLineNumber, endColumn: info.replace.startColumn + text2.length },
            data: symbolItem.location,
            icon: SymbolKinds.toIcon(symbolItem.kind)
          })]
        }
      };
    };
    let pattern;
    if (info.varWord?.word && (info.varWord.word.startsWith(chatVariableLeader) || info.varWord.word.startsWith(chatAgentLeader))) {
      pattern = info.varWord.word.toLowerCase().slice(1);
    }
    const symbolsToAdd = [];
    for (const outlineModel of this.outlineService.getCachedModels()) {
      const symbols = outlineModel.asListOfDocumentSymbols();
      for (const symbol of symbols) {
        symbolsToAdd.push({ symbol, uri: outlineModel.uri });
      }
    }
    let timedOut = false;
    for (const symbol of symbolsToAdd) {
      if (stopwatch.elapsed() > timeoutMs || token.isCancellationRequested) {
        timedOut = true;
        break;
      }
      result.suggestions.push(makeSymbolCompletionItem({ ...symbol.symbol, location: { uri: symbol.uri, range: symbol.symbol.range } }, pattern ?? ""));
    }
    result.incomplete = !!pattern || timedOut;
  }
  updateCacheKey() {
    if (this.cacheKey && Date.now() - this.cacheKey.time > 6e4) {
      this.searchService.clearCache(this.cacheKey.key);
      this.cacheKey = void 0;
    }
    if (!this.cacheKey) {
      this.cacheKey = {
        key: generateUuid(),
        time: Date.now()
      };
    }
    this.cacheKey.time = Date.now();
    return this.cacheKey;
  }
  cmdAddReference(arg) {
    arg.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference(arg.variable);
  }
};

BuiltinDynamicCompletions = __decorateClass([
  __decorateParam(0, IHistoryService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ISearchService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IOutlineModelService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ICodeEditorService),
  __decorateParam(10, IChatAgentService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IChatSessionsService)
], BuiltinDynamicCompletions);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(BuiltinDynamicCompletions, 4 /* Eventually */);

var ToolCompletions = class extends Disposable {
  // MUST be using `g`-flag
  constructor(languageFeaturesService, chatWidgetService, chatAgentService) {
    super();
    this.languageFeaturesService = languageFeaturesService;
    this.chatWidgetService = chatWidgetService;
    this.chatAgentService = chatAgentService;
    this._register(this.languageFeaturesService.completionProvider.register({ scheme: Schemas.vscodeChatInput, hasAccessToAllModels: true }, {
      _debugDisplayName: "chatVariables",
      triggerCharacters: [chatVariableLeader, chatAgentLeader],
      provideCompletionItems: async (model, position2, _context, _token) => {
        const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
        if (!widget) {
          return null;
        }
        if (isAgentHostBackedWidget(widget)) {
          return null;
        }
        if (widget.lockedAgentId) {
          const agent = this.chatAgentService.getAgent(widget.lockedAgentId);
          if (agent && !agent.capabilities?.supportsToolAttachments) {
            return null;
          }
        }
        const range2 = computeCompletionRanges2(model, position2, ToolCompletions.VariableNameDef, true);
        if (!range2) {
          return null;
        }
        const usedNames = /* @__PURE__ */ new Set();
        for (const part of widget.parsedInput.parts) {
          if (part instanceof ChatRequestToolPart) {
            usedNames.add(part.toolName);
          } else if (part instanceof ChatRequestToolSetPart) {
            usedNames.add(part.name);
          }
        }
        const typedLeader = range2.varWord?.word?.charAt(0) === chatAgentLeader ? chatAgentLeader : chatVariableLeader;
        const pattern = range2.varWord?.word ? range2.varWord.word.toLowerCase().slice(1) : "";
        const suggestions = [];
        const iter = widget.input.selectedToolsModel.entriesMap.get();
        for (const [item, enabled] of iter) {
          if (!enabled) {
            continue;
          }
          let detail2;
          let documentation;
          let name;
          if (isToolSet(item)) {
            detail2 = item.description;
            name = item.referenceName;
          } else {
            const source = item.source;
            detail2 = localize(12529, null, source.label, item.displayName);
            name = item.toolReferenceName ?? item.displayName;
            documentation = item.userDescription ?? item.modelDescription;
          }
          if (usedNames.has(name)) {
            continue;
          }
          if (pattern) {
            const lowerName = name.toLowerCase();
            if (!isPatternInWord(pattern, 0, pattern.length, lowerName, 0, lowerName.length)) {
              continue;
            }
          }
          const withLeader = `${typedLeader}${name}`;
          suggestions.push({
            label: withLeader,
            range: range2,
            detail: detail2,
            documentation,
            filterText: `${typedLeader}${name}`,
            insertText: withLeader + " ",
            kind: 27 /* Tool */
          });
        }
        return { suggestions };
      }
    }));
  }
  static {
    this.VariableNameDef = new RegExp(`(?<=^|\\s)[${escapeForCharClass(chatVariableLeader)}${escapeForCharClass(chatAgentLeader)}]\\w*`, "g");
  }
};

ToolCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IChatAgentService)
], ToolCompletions);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(ToolCompletions, 4 /* Eventually */);
export { isAgentHostBackedWidget, SlashCommandWord, AgentOrSlashCommandWord, SlashCommandCompletions, AgentCompletions, AssignSelectedAgentAction, StartParameterizedPromptAction, ReferenceArgument, BuiltinDynamicCompletions, ToolCompletions };
