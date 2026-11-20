// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatActions.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { registerWorkbenchContribution2, WorkbenchPhase } from "./module-0870.mjs";
import { CompositeDragAndDropObserver, DraggedEditorIdentifier } from "./module-1381.mjs";
import { LocalSelectionTransfer } from "./module-0273.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { EditorPane } from "./module-1089.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { Registry } from "./module-0090.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { EditorInput } from "./module-0928.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr, RawContextKey, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { ChatViewId, IChatWidgetService, isIChatViewViewContext } from "./module-0981.mjs";
import { ILanguageModelToolsService, ToolAndToolSetEnablementMap, isToolSet } from "./module-0990.mjs";
import { IHostService } from "./module-1117.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { ISCMService } from "./module-1080.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isAncestorOfActiveElement } from "./module-0075.mjs";
import { convertBufferToScreenshotVariable } from "./module-1475.mjs";
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { SCMHistoryItemChangeRangeContentProvider } from "./module-1467.mjs";
import { Event2 } from "./module-0017.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { timeout } from "./module-0036.mjs";
import { getDefaultNewChatSessionTypeAndReason } from "./module-0964.mjs";
import { getChatSessionType, getNewChatSessionResource } from "./module-0961.mjs";
import { ChatMode } from "./module-1470.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IViewDescriptorService, Extensions13, defaultViewIcon } from "./module-1093.mjs";
import { ViewPane } from "./module-1335.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { IWebviewWorkbenchService } from "./module-1120.mjs";
import { asWebviewUri } from "./module-1911.mjs";
import { getWindows as ocPreviewGetWindows, onDidRegisterWindow as ocPreviewOnDidRegisterWindow } from "./module-0075.mjs";
import { FileAccess } from "./module-0033.mjs";
import { renderMarkdownDocument, DEFAULT_MARKDOWN_STYLES } from "./module-2746.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { WebviewInput } from "./module-1116.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { ChatEditorInput, showClearEditingSessionConfirmation } from "./module-1111.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, SIDE_GROUP } from "./module-0934.mjs";
import { IChatWidgetHistoryService } from "./module-1471.mjs";
import { EditorAction2 } from "./module-0097.mjs";
import { IsLinuxContext, IsWindowsContext } from "./module-0635.mjs";
import { alert } from "./module-0076.mjs";
import { IChatInputNoticeHubService } from "./module-1469.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { EXTENSIONS_CATEGORY, IExtensionsWorkbenchService } from "./module-1022.mjs";
import { CopilotUsageExtensionFeatureId } from "./module-1473.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { safeIntl } from "./module-0120.mjs";
import { language } from "./module-0014.mjs";
import { coalesce } from "./module-0007.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ILanguageModelToolsConfirmationService } from "./module-1474.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { AICustomizationManagementCommands2 } from "./module-1472.mjs";
import { isRequestVM } from "./module-0978.mjs";
import { localChatSessionType } from "./module-0960.mjs";
import { generateUuid } from "./module-0190.mjs";
import { IEditorResolverService as OcEditorResolverService } from "./module-1113.mjs";
import { IWebviewService as OcWebviewService } from "./module-1042.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatActions.ts
var CHAT_CATEGORY = localize2(8516, "Chat");

var COPILOT_CLI_AGENT_HOST_PROVIDER_ID = "copilotcli";

var ACTION_ID_NEW_CHAT = `workbench.action.chat.newChat`;

var ACTION_ID_NEW_EDIT_SESSION = `workbench.action.chat.newEditSession`;

var ACTION_ID_OPEN_CHAT = "workbench.action.openChat";

var CHAT_OPEN_ACTION_ID = "workbench.action.chat.open";

var CHAT_SETUP_ACTION_ID = "workbench.action.chat.triggerSetup";

var CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID = "workbench.action.chat.triggerSetupSupportAnonymousAction";

var TOGGLE_CHAT_ACTION_ID = "workbench.action.chat.toggle";

var GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID = "workbench.action.chat.generateAgentInstructions";

var GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID = "workbench.action.chat.generateOnDemandInstructions";

var GENERATE_PROMPT_COMMAND_ID = "workbench.action.chat.generatePrompt";

var GENERATE_SKILL_COMMAND_ID = "workbench.action.chat.generateSkill";

var GENERATE_AGENT_COMMAND_ID = "workbench.action.chat.generateAgent";

var GENERATE_HOOK_COMMAND_ID = "workbench.action.chat.generateHook";

var INSERT_FORK_CONVERSATION_COMMAND_ID = "workbench.action.chat.insertForkConversationCommand";

var INSERT_TROUBLESHOOT_COMMAND_ID = "workbench.action.chat.insertTroubleshootCommand";

var defaultChat = {
  provider: product_default.defaultChatAgent?.provider ?? { enterprise: { id: "" } },
  completionsAdvancedSetting: product_default.defaultChatAgent?.completionsAdvancedSetting ?? "",
  completionsMenuCommand: product_default.defaultChatAgent?.completionsMenuCommand ?? ""
};

var OPEN_CHAT_QUOTA_EXCEEDED_DIALOG = "workbench.action.chat.openQuotaExceededDialog";

var OpenChatGlobalAction = class extends Action2 {
  constructor(overrides, mode) {
    super({
      ...overrides,
      icon: Codicon.chatSparkle,
      f1: true,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.Setup.hidden.negate(),
        ChatContextKeys.Setup.disabledInWorkspace.negate()
      )
    });
    this.mode = mode;
  }
  async run(accessor, opts) {
    opts = typeof opts === "string" ? { query: opts } : opts;
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const toolsService = accessor.get(ILanguageModelToolsService);
    const hostService = accessor.get(IHostService);
    const chatAgentService = accessor.get(IChatAgentService);
    const instaService = accessor.get(IInstantiationService);
    const commandService = accessor.get(ICommandService);
    const fileService = accessor.get(IFileService);
    const languageModelService = accessor.get(ILanguageModelsService);
    const scmService = accessor.get(ISCMService);
    const logService = accessor.get(ILogService);
    const configurationService = accessor.get(IConfigurationService);
    let chatWidget = widgetService.lastFocusedWidget;
    if (!this.mode || !chatWidget || !isAncestorOfActiveElement(chatWidget.domNode)) {
      chatWidget = await widgetService.revealWidget();
    }
    if (!chatWidget) {
      return;
    }
    const switchToMode = opts?.mode ? chatWidget.input.currentChatModesObs.get().findModeByName(opts.mode) : this.mode;
    if (switchToMode) {
      await this.handleSwitchToMode(switchToMode, chatWidget, instaService, commandService);
    }
    if (opts?.modelSelector) {
      const ids = await languageModelService.selectLanguageModels(opts.modelSelector);
      const id2 = ids.sort().at(0);
      if (!id2) {
        throw new Error(`No language models found matching selector: ${JSON.stringify(opts.modelSelector)}.`);
      }
      const model = languageModelService.lookupLanguageModel(id2);
      if (!model) {
        throw new Error(`Language model not loaded: ${id2}.`);
      }
      chatWidget.input.setCurrentLanguageModel({ metadata: model, identifier: id2 }, true);
    }
    if (opts?.toolsInclude || opts?.toolsExclude) {
      const model = chatWidget.input.selectedLanguageModel.get()?.metadata;
      const allTools = Array.from(toolsService.getTools(model));
      const allToolSets = Array.from(toolsService.getToolSetsForModel(model));
      const result = computeToolEnablementMap({
        allTools,
        allToolSets,
        toolsInclude: opts.toolsInclude,
        toolsExclude: opts.toolsExclude
      });
      for (const identifier2 of result.unknownIdentifiers) {
        logService.warn(`Tool filtering: Unknown identifier '${identifier2}' - no matching tool or toolset found.`);
      }
      chatWidget.input.selectedToolsModel.set(result.enablementMap, true);
    }
    if (opts?.previousRequests?.length && chatWidget.viewModel) {
      for (const { request: request2, response } of opts.previousRequests) {
        chatService.addCompleteRequest(chatWidget.viewModel.sessionResource, request2, void 0, 0, { message: response });
      }
    }
    if (opts?.attachScreenshot) {
      const screenshot = await hostService.getScreenshot();
      if (screenshot) {
        chatWidget.attachmentModel.addContext(convertBufferToScreenshotVariable(screenshot));
      }
    }
    if (opts?.attachFiles) {
      for (const file of opts.attachFiles) {
        const uri5 = file instanceof URI ? file : file.uri;
        const range2 = file instanceof URI ? void 0 : file.range;
        if (await fileService.exists(uri5)) {
          chatWidget.attachmentModel.addFile(uri5, range2);
        }
      }
    }
    if (opts?.attachHistoryItemChanges) {
      for (const historyItemChange of opts.attachHistoryItemChanges) {
        const repository = scmService.getRepository(URI.file(historyItemChange.uri.path));
        const historyProvider = repository?.provider.historyProvider.get();
        if (!historyProvider) {
          continue;
        }
        const historyItem = await historyProvider.resolveHistoryItem(historyItemChange.historyItemId);
        if (!historyItem) {
          continue;
        }
        chatWidget.attachmentModel.addContext({
          id: historyItemChange.uri.toString(),
          name: `${basename2(historyItemChange.uri)}`,
          value: historyItemChange.uri,
          historyItem,
          kind: "scmHistoryItemChange"
        });
      }
    }
    if (opts?.attachHistoryItemChangeRanges) {
      for (const historyItemChangeRange of opts.attachHistoryItemChangeRanges) {
        const repository = scmService.getRepository(URI.file(historyItemChangeRange.end.uri.path));
        const historyProvider = repository?.provider.historyProvider.get();
        if (!repository || !historyProvider) {
          continue;
        }
        const [historyItemStart, historyItemEnd] = await Promise.all([
          historyProvider.resolveHistoryItem(historyItemChangeRange.start.historyItemId),
          historyProvider.resolveHistoryItem(historyItemChangeRange.end.historyItemId)
        ]);
        if (!historyItemStart || !historyItemEnd) {
          continue;
        }
        const uri5 = historyItemChangeRange.end.uri.with({
          scheme: SCMHistoryItemChangeRangeContentProvider.scheme,
          query: JSON.stringify({
            repositoryId: repository.id,
            start: historyItemStart.id,
            end: historyItemChangeRange.end.historyItemId
          })
        });
        chatWidget.attachmentModel.addContext({
          id: uri5.toString(),
          name: `${basename2(uri5)}`,
          value: uri5,
          historyItemChangeStart: {
            uri: historyItemChangeRange.start.uri,
            historyItem: historyItemStart
          },
          historyItemChangeEnd: {
            uri: historyItemChangeRange.end.uri,
            historyItem: {
              ...historyItemEnd,
              displayId: historyItemChangeRange.end.historyItemId
            }
          },
          kind: "scmHistoryItemChangeRange"
        });
      }
    }
    let resp;
    if (opts?.query) {
      if (opts.isPartialQuery) {
        chatWidget.input.showScrollbarUntilAccept();
        chatWidget.setInput(opts.query);
      } else {
        if (!chatWidget.viewModel) {
          await Event2.toPromise(chatWidget.onDidChangeViewModel);
        }
        await waitForDefaultAgent(chatAgentService, chatWidget.input.currentModeKind);
        if (opts.preserveInput) {
          resp = chatWidget.acceptInput(opts.query, { preserveInput: true });
        } else {
          chatWidget.setInput(opts.query);
          resp = chatWidget.acceptInput();
        }
      }
    }
    if (opts?.toolIds && opts.toolIds.length > 0) {
      for (const toolId of opts.toolIds) {
        const tool = toolsService.getTool(toolId);
        if (tool) {
          chatWidget.attachmentModel.addContext({
            id: tool.id,
            name: tool.displayName,
            fullName: tool.displayName,
            value: void 0,
            icon: ThemeIcon.isThemeIcon(tool.icon) ? tool.icon : void 0,
            kind: "tool"
          });
        }
      }
    }
    chatWidget.focusInput();
    if (opts?.blockOnResponse) {
      const response = await resp;
      if (response) {
        const autoReplyEnabled = configurationService.getValue("chat.autoReply" /* AutoReply */);
        await new Promise((resolve3) => {
          const d = response.onDidChange(async () => {
            if (response.isComplete) {
              d.dispose();
              resolve3();
              return;
            }
            const pendingConfirmation = response.isPendingConfirmation.get();
            if (pendingConfirmation) {
              const hasPendingQuestionCarousel = response.response.value.some(
                (part) => part.kind === "questionCarousel" && !part.isUsed
              );
              if (autoReplyEnabled && hasPendingQuestionCarousel) {
                return;
              }
              d.dispose();
              resolve3();
            }
          });
        });
        const confirmationInfo = getPendingConfirmationInfo(response);
        if (confirmationInfo) {
          return { ...response.result, ...confirmationInfo };
        }
        return { ...response.result };
      }
    }
    return void 0;
  }
  async handleSwitchToMode(switchToMode, chatWidget, instaService, commandService) {
    const currentMode = chatWidget.input.currentModeKind;
    if (switchToMode) {
      const model = chatWidget.viewModel?.model;
      const chatModeCheck = model ? await instaService.invokeFunction(handleModeSwitch, currentMode, switchToMode.kind, model.getRequests().length, model) : { needToClearSession: false };
      if (!chatModeCheck) {
        return;
      }
      chatWidget.input.setChatMode(switchToMode.id, true, true);
      if (chatModeCheck.needToClearSession) {
        await commandService.executeCommand(ACTION_ID_NEW_CHAT);
      }
    }
  }
};

async function waitForDefaultAgent(chatAgentService, mode) {
  const defaultAgent = chatAgentService.getDefaultAgent("panel" /* Chat */, mode);
  if (defaultAgent) {
    return;
  }
  await Promise.race([
    Event2.toPromise(Event2.filter(chatAgentService.onDidChangeAgents, () => {
      const defaultAgent2 = chatAgentService.getDefaultAgent("panel" /* Chat */, mode);
      return Boolean(defaultAgent2);
    })),
    timeout(6e4).then(() => {
      throw new Error("Timed out waiting for default agent");
    })
  ]);
}

function getPendingConfirmationInfo(response) {
  for (const part of response.response.value) {
    if (part.kind === "toolInvocation") {
      const state = part.state.get();
      if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
        return {
          type: "confirmation",
          kind: "toolInvocation",
          toolId: part.toolId
        };
      }
      if (state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        return {
          type: "confirmation",
          kind: "toolPostApproval",
          toolId: part.toolId
        };
      }
    }
    if (part.kind === "confirmation" && !part.isUsed) {
      return {
        type: "confirmation",
        kind: "confirmation",
        title: part.title,
        data: part.data
      };
    }
    if (part.kind === "questionCarousel" && !part.isUsed) {
      return {
        type: "confirmation",
        kind: "questionCarousel",
        questions: part.questions
      };
    }
    if (part.kind === "elicitation2" && part.state.get() === "pending" /* Pending */) {
      const title = part.title;
      return {
        type: "confirmation",
        kind: "elicitation",
        title: typeof title === "string" ? title : title.value
      };
    }
  }
  return void 0;
}

var PrimaryOpenChatGlobalAction = class extends OpenChatGlobalAction {
  constructor() {
    super({
      id: CHAT_OPEN_ACTION_ID,
      title: localize2(8559, "Open Chat"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KeyI */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 39 /* KeyI */
        }
      },
      menu: [{
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 1
      }]
    });
  }
};

function getOpenChatActionIdForMode(mode) {
  return `workbench.action.chat.open${mode.name.get()}`;
}

var ModeOpenChatGlobalAction = class extends OpenChatGlobalAction {
  constructor(mode, keybinding) {
    super({
      id: getOpenChatActionIdForMode(mode),
      title: localize2(8563, "Open Chat ({0})", mode.label.get()),
      keybinding
    }, mode);
  }
};

function registerChatActions() {
  function getNewChatEditorInput(accessor) {
    const resolved = getDefaultNewChatSessionTypeAndReason(accessor);
    return {
      resource: getNewChatSessionResource(resolved.sessionType),
      options: { pinned: true, sessionTypeSelectionReason: resolved.selectionReason }
    };
  }
  registerAction2(PrimaryOpenChatGlobalAction);
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Ask);
    }
  });
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Agent, {
        when: ContextKeyExpr.has(`config.${"chat.agent.enabled" /* AgentEnabled */}`),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */,
        linux: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 39 /* KeyI */
        }
      });
    }
  });
  registerAction2(class extends ModeOpenChatGlobalAction {
    constructor() {
      super(ChatMode.Edit);
    }
  });
  registerAction2(class ToggleChatAction extends Action2 {
    constructor() {
      super({
        id: TOGGLE_CHAT_ACTION_ID,
        title: localize2(8573, "Toggle Chat"),
        category: CHAT_CATEGORY
      });
    }
    async run(accessor) {
      const layoutService = accessor.get(IWorkbenchLayoutService);
      const viewsService = accessor.get(IViewsService);
      const viewDescriptorService = accessor.get(IViewDescriptorService);
      const widgetService = accessor.get(IChatWidgetService);
      const chatLocation = viewDescriptorService.getViewLocationById(ChatViewId);
      const chatVisible = viewsService.isViewVisible(ChatViewId);
      if (chatVisible) {
        this.updatePartVisibility(layoutService, chatLocation, false);
      } else {
        this.updatePartVisibility(layoutService, chatLocation, true);
        (await widgetService.revealWidget())?.focusInput();
      }
    }
    updatePartVisibility(layoutService, location2, visible) {
      let part;
      switch (location2) {
        case 1 /* Panel */:
          part = "workbench.parts.panel" /* PANEL_PART */;
          break;
        case 0 /* Sidebar */:
          part = "workbench.parts.sidebar" /* SIDEBAR_PART */;
          break;
        case 2 /* AuxiliaryBar */:
          part = "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */;
          break;
      }
      if (part) {
        layoutService.setPartHidden(!visible, part);
      }
    }
  });
  registerAction2(class NewChatEditorAction extends Action2 {
    constructor() {
      super({
        id: ACTION_ID_OPEN_CHAT,
        title: localize2(8554, "New Chat Editor"),
        icon: Codicon.plus,
        f1: true,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        keybinding: {
          weight: 200 /* WorkbenchContrib */,
          primary: 2048 /* CtrlCmd */ | 44 /* KeyN */,
          when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatEditor)
        },
        menu: [{
          id: MenuId.ChatTitleBarMenu,
          group: "b_new",
          order: 0
        }, {
          id: MenuId.ChatNewMenu,
          group: "2_new",
          order: 2
        }, {
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID), ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("copilot"), ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("new-session"), ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("comment")),
          order: 1
        }]
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, ACTIVE_GROUP, input.options);
    }
  });
  registerAction2(class NewChatEditorCopilotIconAction extends Action2 {
    constructor() {
      super({
        id: ACTION_ID_OPEN_CHAT + ".copilotIcon",
        title: localize2(8554, "New Chat Editor"),
        icon: Codicon.copilot,
        f1: false,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID), ChatContextKeys.newChatButtonExperimentIcon.isEqualTo("copilot")),
          order: 1
        }]
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, ACTIVE_GROUP, input.options);
    }
  });
  registerAction2(class NewChatEditorNewSessionIconAction extends Action2 {
    constructor() {
      super({
        id: ACTION_ID_OPEN_CHAT + ".newSessionIcon",
        title: localize2(8554, "New Chat Editor"),
        icon: Codicon.newSession,
        f1: false,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID), ChatContextKeys.newChatButtonExperimentIcon.isEqualTo("new-session")),
          order: 1
        }]
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, ACTIVE_GROUP, input.options);
    }
  });
  registerAction2(class NewChatEditorCommentIconAction extends Action2 {
    constructor() {
      super({
        id: ACTION_ID_OPEN_CHAT + ".commentIcon",
        title: localize2(8554, "New Chat Editor"),
        icon: Codicon.comment,
        f1: false,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.EditorTitle,
          group: "navigation",
          when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID), ChatContextKeys.newChatButtonExperimentIcon.isEqualTo("comment")),
          order: 1
        }]
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, ACTIVE_GROUP, input.options);
    }
  });
  registerAction2(class NewChatEditorToSideAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.openChatToSide",
        title: localize2(8555, "New Chat Editor to the Side"),
        f1: true,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, SIDE_GROUP, input.options);
    }
  });
  registerAction2(class NewChatWindowAction extends Action2 {
    constructor() {
      super({
        id: `workbench.action.newChatWindow`,
        title: localize2(8552, "New Chat Window"),
        f1: true,
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: [{
          id: MenuId.ChatTitleBarMenu,
          group: "b_new",
          order: 1
        }, {
          id: MenuId.ChatNewMenu,
          group: "2_new",
          order: 3
        }]
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const input = getNewChatEditorInput(accessor);
      await widgetService.openSession(input.resource, AUX_WINDOW_GROUP, { ...input.options, auxiliary: { compact: true, bounds: { width: 640, height: 640 } } });
    }
  });
  registerAction2(class ClearChatInputHistoryAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.clearInputHistory",
        title: localize2(8545, "Clear Input History"),
        precondition: ChatContextKeys.enabled,
        category: CHAT_CATEGORY,
        f1: true
      });
    }
    async run(accessor, ...args2) {
      const historyService = accessor.get(IChatWidgetHistoryService);
      historyService.clearHistory();
    }
  });
  registerAction2(class FocusChatAction extends EditorAction2 {
    constructor() {
      super({
        id: "chat.action.focus",
        title: localize2(8511, "Focus Chat List"),
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatInput),
        category: CHAT_CATEGORY,
        keybinding: [
          // On mac, require that the cursor is at the top of the input, to avoid stealing cmd+up to move the cursor to the top
          {
            when: ContextKeyExpr.and(ChatContextKeys.inputCursorAtTop, ChatContextKeys.inQuickChat.negate()),
            primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
            weight: 100 /* EditorContrib */
          },
          // On win/linux, ctrl+up can always focus the chat list
          {
            when: ContextKeyExpr.and(ContextKeyExpr.or(IsWindowsContext, IsLinuxContext), ChatContextKeys.inQuickChat.negate()),
            primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
            weight: 100 /* EditorContrib */
          },
          {
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inQuickChat),
            primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
            weight: 200 /* WorkbenchContrib */
          }
        ]
      });
    }
    runEditorCommand(accessor, editor) {
      const editorUri = editor.getModel()?.uri;
      if (editorUri) {
        const widgetService = accessor.get(IChatWidgetService);
        widgetService.getWidgetByInputUri(editorUri)?.focusResponseItem();
      }
    }
  });
  registerAction2(class FocusMostRecentlyFocusedChatAction extends EditorAction2 {
    constructor() {
      super({
        id: "workbench.chat.action.focusLastFocused",
        title: localize2(8512, "Focus Last Focused Chat List Item"),
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatInput),
        category: CHAT_CATEGORY,
        keybinding: [
          // On mac, require that the cursor is at the top of the input, to avoid stealing cmd+up to move the cursor to the top
          {
            when: ContextKeyExpr.and(ChatContextKeys.inputCursorAtTop, ChatContextKeys.inQuickChat.negate()),
            primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ | 1024 /* Shift */,
            weight: 100 /* EditorContrib */ + 1
          },
          // On win/linux, ctrl+up can always focus the chat list
          {
            when: ContextKeyExpr.and(ContextKeyExpr.or(IsWindowsContext, IsLinuxContext), ChatContextKeys.inQuickChat.negate()),
            primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ | 1024 /* Shift */,
            weight: 100 /* EditorContrib */ + 1
          },
          {
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inQuickChat),
            primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ | 1024 /* Shift */,
            weight: 200 /* WorkbenchContrib */ + 1
          }
        ]
      });
    }
    runEditorCommand(accessor, editor) {
      const editorUri = editor.getModel()?.uri;
      if (editorUri) {
        const widgetService = accessor.get(IChatWidgetService);
        widgetService.getWidgetByInputUri(editorUri)?.focusResponseItem(true);
      }
    }
  });
  registerAction2(class FocusChatInputAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.focusInput",
        title: localize2(8547, "Focus Chat Input"),
        f1: false,
        keybinding: [
          {
            primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
            weight: 200 /* WorkbenchContrib */,
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat.negate())
          },
          {
            when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatInput.negate(), ChatContextKeys.inQuickChat),
            primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
            weight: 200 /* WorkbenchContrib */
          }
        ]
      });
    }
    run(accessor, ...args2) {
      const widgetService = accessor.get(IChatWidgetService);
      widgetService.lastFocusedWidget?.focusInput();
    }
  });
  registerAction2(class FocusTodosViewAction extends Action2 {
    static {
      this.ID = "workbench.action.chat.focusTodosView";
    }
    constructor() {
      super({
        id: FocusTodosViewAction.ID,
        title: localize2(8551, "Toggle Focus Between TODOs and Input"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
        keybinding: [{
          weight: 200 /* WorkbenchContrib */ + 1,
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KeyT */,
          when: ContextKeyExpr.or(
            ContextKeyExpr.and(ChatContextKeys.inChatInput, ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */)),
            ContextKeyExpr.and(ChatContextKeys.inChatTodoList, ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */))
          )
        }]
      });
    }
    run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const widget = widgetService.lastFocusedWidget;
      if (!widget || !widget.toggleTodosViewFocus()) {
        alert(localize(8522, null));
      }
    }
  });
  registerAction2(class FocusQuestionCarouselAction extends Action2 {
    static {
      this.ID = "workbench.action.chat.focusQuestionCarousel";
    }
    constructor() {
      super({
        id: FocusQuestionCarouselAction.ID,
        title: localize2(8549, "Chat: Toggle Focus Between Question and Input"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.inChatSession,
        keybinding: [{
          weight: 200 /* WorkbenchContrib */,
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */,
          when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasQuestionCarousel)
        }]
      });
    }
    run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const widget = widgetService.lastFocusedWidget;
      if (!widget || !widget.toggleQuestionCarouselFocus()) {
        alert(localize(8520, null));
      }
    }
  });
  registerAction2(class PreviousQuestionCarouselQuestionAction extends Action2 {
    static {
      this.ID = "workbench.action.chat.previousQuestion";
    }
    constructor() {
      super({
        id: PreviousQuestionCarouselQuestionAction.ID,
        title: localize2(8556, "Chat: Previous Question"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasQuestionCarousel),
        keybinding: [{
          weight: 200 /* WorkbenchContrib */,
          primary: 512 /* Alt */ | 46 /* KeyP */,
          when: ContextKeyExpr.and(ChatContextKeys.inChatQuestionCarousel, ChatContextKeys.Editing.hasQuestionCarousel)
        }]
      });
    }
    run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      widgetService.lastFocusedWidget?.navigateToPreviousQuestion();
    }
  });
  registerAction2(class NextQuestionCarouselQuestionAction extends Action2 {
    static {
      this.ID = "workbench.action.chat.nextQuestion";
    }
    constructor() {
      super({
        id: NextQuestionCarouselQuestionAction.ID,
        title: localize2(8553, "Chat: Next Question"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasQuestionCarousel),
        keybinding: [{
          weight: 200 /* WorkbenchContrib */,
          primary: 512 /* Alt */ | 44 /* KeyN */,
          when: ContextKeyExpr.and(ChatContextKeys.inChatQuestionCarousel, ChatContextKeys.Editing.hasQuestionCarousel)
        }]
      });
    }
    run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      widgetService.lastFocusedWidget?.navigateToNextQuestion();
    }
  });
  registerAction2(class FocusQuestionCarouselTerminalAction extends Action2 {
    static {
      this.ID = "workbench.action.chat.focusQuestionCarouselTerminal";
    }
    constructor() {
      super({
        id: FocusQuestionCarouselTerminalAction.ID,
        title: localize2(8550, "Chat: Focus Terminal from Question Carousel"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasQuestionCarousel, ChatContextKeys.chatQuestionCarouselHasTerminal),
        keybinding: [{
          weight: 200 /* WorkbenchContrib */,
          primary: 512 /* Alt */ | 50 /* KeyT */,
          when: ContextKeyExpr.and(ChatContextKeys.inChatQuestionCarousel, ChatContextKeys.Editing.hasQuestionCarousel, ChatContextKeys.chatQuestionCarouselHasTerminal)
        }]
      });
    }
    run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      widgetService.lastFocusedWidget?.focusQuestionCarouselTerminal();
    }
  });
  registerAction2(class FocusNoticeAction extends Action2 {
    static {
      // Kept as `focusTip` so existing keybindings and user settings continue to work.
      this.ID = "workbench.action.chat.focusTip";
    }
    constructor() {
      super({
        id: FocusNoticeAction.ID,
        title: localize2(8548, "Chat: Toggle Focus Between Notice and Input"),
        category: CHAT_CATEGORY,
        f1: true,
        // The Agents composer is not a chat widget, so it never sets
        // `inChatSession`; it reports its own focus instead.
        precondition: ContextKeyExpr.or(ChatContextKeys.inChatSession, ChatContextKeys.inChatComposer),
        keybinding: [{
          weight: 200 /* WorkbenchContrib */,
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 90 /* Slash */,
          when: ContextKeyExpr.or(
            ChatContextKeys.inChatSession,
            ChatContextKeys.inChatTip,
            ChatContextKeys.inChatComposer
          )
        }]
      });
    }
    run(accessor) {
      if (!accessor.get(IChatInputNoticeHubService).toggleNoticeFocus()) {
        alert(localize(8519, null));
      }
    }
  });
  registerAction2(class ShowContextUsageAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.showContextUsage",
        title: localize2(8557, "Show Context Window Usage"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const widgetService = accessor.get(IChatWidgetService);
      const widget = widgetService.lastFocusedWidget ?? await widgetService.revealWidget();
      widget?.input.showContextUsageDetails();
    }
  });
  registerAction2(class CompactAgentHostConversationAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.compactAgentHostConversation",
        title: localize2(8546, "Compact Conversation"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        menu: {
          id: MenuId.ChatContextUsageActions,
          group: "navigation",
          when: ContextKeyExpr.and(
            ChatContextKeys.chatIsAgentHostSession,
            ChatContextKeys.chatAgentHostProviderId.isEqualTo(COPILOT_CLI_AGENT_HOST_PROVIDER_ID)
          )
        }
      });
    }
    async run(_accessor, widget) {
      await widget?.acceptInput("/compact", { preserveInput: true });
    }
  });
  registerAction2(class ToggleShowContextUsageAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.toggleShowContextUsage",
        title: localize2(8521, "Show Context Usage"),
        category: CHAT_CATEGORY,
        toggled: ContextKeyExpr.equals(`config.${"chat.contextUsage.enabled" /* ChatContextUsageEnabled */}`, true),
        menu: {
          id: MenuId.ChatWelcomeContext,
          group: "1_display",
          order: 1,
          when: ChatContextKeys.inChatEditor.negate()
        }
      });
    }
    async run(accessor) {
      const configurationService = accessor.get(IConfigurationService);
      const currentValue = configurationService.getValue("chat.contextUsage.enabled" /* ChatContextUsageEnabled */);
      await configurationService.updateValue("chat.contextUsage.enabled" /* ChatContextUsageEnabled */, !currentValue);
    }
  });
  const nonEnterpriseCopilotUsers = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.notEquals(`config.${defaultChat.completionsAdvancedSetting}.authProvider`, defaultChat.provider.enterprise.id));
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.manageSettings",
        title: localize2(8558, "Manage Copilot Settings"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(
          ContextKeyExpr.or(
            ChatContextKeys.Entitlement.planFree,
            ChatContextKeys.Entitlement.planEdu,
            ChatContextKeys.Entitlement.planPro,
            ChatContextKeys.Entitlement.planProPlus,
            ChatContextKeys.Entitlement.planMax
          ),
          nonEnterpriseCopilotUsers
        ),
        menu: {
          id: MenuId.ChatTitleBarMenu,
          group: "y_manage",
          order: 1,
          when: nonEnterpriseCopilotUsers
        }
      });
    }
    async run(accessor) {
      const openerService = accessor.get(IOpenerService);
      const defaultAccountService = accessor.get(IDefaultAccountService);
      openerService.open(URI.parse(defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotSettings)));
    }
  });
  registerAction2(class ShowExtensionsUsingCopilot extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.showExtensionsUsingCopilot",
        title: localize2(8571, "Show Extensions using Copilot"),
        f1: true,
        category: EXTENSIONS_CATEGORY,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
      extensionsWorkbenchService.openSearch(`@contribute:${CopilotUsageExtensionFeatureId}`);
    }
  });
  registerAction2(class ConfigureCopilotCompletions extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.configureCodeCompletions",
        title: localize2(8527, "Configure Inline Suggestions..."),
        precondition: ContextKeyExpr.and(
          ChatContextKeys.Setup.installed,
          ChatContextKeys.Setup.disabled.negate(),
          ChatContextKeys.Setup.untrusted.negate()
        ),
        menu: {
          id: MenuId.ChatTitleBarMenu,
          group: "f_completions",
          order: 10
        }
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      commandService.executeCommand(defaultChat.completionsMenuCommand);
    }
  });
  registerAction2(class ShowQuotaExceededDialogAction extends Action2 {
    constructor() {
      super({
        id: OPEN_CHAT_QUOTA_EXCEEDED_DIALOG,
        title: localize(8574, null)
      });
    }
    async run(accessor) {
      const chatEntitlementService = accessor.get(IChatEntitlementService);
      const commandService = accessor.get(ICommandService);
      const dialogService = accessor.get(IDialogService);
      const telemetryService = accessor.get(ITelemetryService);
      let message;
      const chatQuotaExceeded = chatEntitlementService.quotas.chat?.percentRemaining === 0;
      const completionsQuotaExceeded = chatEntitlementService.quotas.completions?.percentRemaining === 0;
      if (chatQuotaExceeded && !completionsQuotaExceeded) {
        message = localize(8525, null);
      } else if (completionsQuotaExceeded && !chatQuotaExceeded) {
        message = localize(8526, null);
      } else {
        message = localize(8524, null);
      }
      if (chatEntitlementService.quotas.resetDate) {
        const dateFormatter2 = chatEntitlementService.quotas.resetDateHasTime ? safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }) : safeIntl.DateTimeFormat(language, { year: "numeric", month: "long", day: "numeric" });
        const quotaResetDate = new Date(chatEntitlementService.quotas.resetDate);
        message = [message, localize(8566, null, dateFormatter2.value.format(quotaResetDate))].join(" ");
      }
      const free = chatEntitlementService.entitlement === 5 /* Free */;
      const upgradeToPro = free ? localize(8577, null) : void 0;
      await dialogService.prompt({
        type: "none",
        message: localize(8528, null),
        cancelButton: {
          label: localize(8529, null),
          run: () => {
          }
        },
        buttons: [
          {
            label: free ? localize(8576, null) : localize(8575, null),
            run: () => {
              const commandId = "workbench.action.chat.upgradePlan";
              telemetryService.publicLog2("workbenchActionExecuted", { id: commandId, from: "chat-dialog" });
              commandService.executeCommand(commandId);
            }
          }
        ],
        custom: {
          icon: Codicon.copilotWarningLarge,
          markdownDetails: coalesce([
            { markdown: new MarkdownString(message, true) },
            upgradeToPro ? { markdown: new MarkdownString(upgradeToPro, true) } : void 0
          ])
        }
      });
    }
  });
  registerAction2(class ResetTrustedToolsAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.resetTrustedTools",
        title: localize2(8567, "Reset Tool Confirmations"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    run(accessor) {
      accessor.get(ILanguageModelToolsConfirmationService).resetToolAutoConfirmation();
      accessor.get(INotificationService).info(localize(8568, null));
    }
  });
  registerAction2(class GenerateInstructionsAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID,
        title: localize2(8535, "Generate Agent Instructions"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/init",
        isPartialQuery: false
      });
    }
  });
  registerAction2(class GenerateInstructionAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID,
        title: localize2(8536, "Generate On-Demand Instructions"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/create-instructions ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class GeneratePromptAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_PROMPT_COMMAND_ID,
        title: localize2(8537, "Generate Prompt File"),
        shortTitle: localize2(8538, "Generate Prompt"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/create-prompt ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class GenerateSkillAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_SKILL_COMMAND_ID,
        title: localize2(8539, "Generate Skill"),
        shortTitle: localize2(8540, "Generate Skill"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/create-skill ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class GenerateAgentAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_AGENT_COMMAND_ID,
        title: localize2(8530, "Generate Custom Agent"),
        shortTitle: localize2(8531, "Generate Agent"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/create-agent ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class GenerateHookAction extends Action2 {
    constructor() {
      super({
        id: GENERATE_HOOK_COMMAND_ID,
        title: localize2(8533, "Generate Hook"),
        shortTitle: localize2(8534, "Generate Hook"),
        category: CHAT_CATEGORY,
        icon: Codicon.sparkle,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        mode: "agent",
        query: "/create-hook ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class InsertForkConversationSlashCommandAction extends Action2 {
    constructor() {
      super({
        id: INSERT_FORK_CONVERSATION_COMMAND_ID,
        title: localize2(8541, "Insert Fork Command"),
        shortTitle: localize2(8542, "Insert /fork"),
        category: CHAT_CATEGORY,
        icon: Codicon.repoForked,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        query: "/fork ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class InsertTroubleshootSlashCommandAction extends Action2 {
    constructor() {
      super({
        id: INSERT_TROUBLESHOOT_COMMAND_ID,
        title: localize2(8543, "Insert Troubleshoot Command"),
        shortTitle: localize2(8544, "Insert /troubleshoot"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      await commandService.executeCommand("workbench.action.chat.open", {
        query: "/troubleshoot ",
        isPartialQuery: true
      });
    }
  });
  registerAction2(class OpenChatFeatureSettingsAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openFeatureSettings",
        title: localize2(8561, "Chat Settings"),
        shortTitle: localize(8562, null),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ChatContextKeys.enabled,
        menu: [
          {
            id: MenuId.ChatWelcomeContext,
            group: "2_settings",
            order: 1
          },
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)),
            order: 15,
            group: "3_configure"
          }
        ]
      });
    }
    async run(accessor) {
      const preferencesService = accessor.get(IPreferencesService);
      preferencesService.openSettings({ query: "@feature:chat " });
    }
  });
  registerAction2(class EnterOpenCodeBridgeModeAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openOpenCodeBridgeSession",
        title: localize2(8564, "Switch to Bridge"),
        shortTitle: localize(8565, null),
        category: CHAT_CATEGORY,
        icon: Codicon.radioTower,
        f1: true
        // OpenCode: 视图标题栏不再单独显示 Chat/Bridge 切换按钮，改为点击左侧标题切换
      });
    }
    async run(accessor) {
      await accessor.get(ICommandService).executeCommand("opencode.bridge.openSession");
    }
  });
  registerAction2(class ReturnToOpenCodeChatModeAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.returnFromOpenCodeBridgeSession",
        title: localize2(8569, "Switch to Chat"),
        shortTitle: localize(8570, null),
        category: CHAT_CATEGORY,
        icon: Codicon.commentDiscussion,
        f1: true
        // OpenCode: 视图标题栏不再单独显示 Chat/Bridge 切换按钮，改为点击左侧标题切换
      });
    }
    async run(accessor) {
      await accessor.get(ICommandService).executeCommand("_opencode.bridge.showChat");
    }
  });
  MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
    command: {
      id: AICustomizationManagementCommands2.OpenEditor,
      // OpenCode: 对话视图右上角齿轮按钮直接叫「MCP」（打开 Bridge / MCP 设置页）
      title: { value: "MCP", original: "MCP" },
      category: CHAT_CATEGORY,
      // OpenCode p19: MCP 按钮用 codicon「mcp」图标，不再用齿轮
      icon: Codicon.mcp ?? Codicon.server
    },
    group: "navigation",
    when: ContextKeyExpr.and(
      ChatContextKeys.enabled,
      ContextKeyExpr.equals("view", ChatViewId)
    ),
    order: 6
  });
  // OpenCode: 标题栏「任务」面板开关（状态存 localStorage，按钮按下=面板显示）。
  registerAction2(class OpenCodeToggleTaskShelfAction extends Action2 {
    constructor() {
      super({
        id: OC_TOGGLE_TASK_SHELF_COMMAND,
        title: { value: "\u663E\u793A/\u9690\u85CF\u4EFB\u52A1\u9762\u677F", original: "Toggle Tasks Panel" },
        category: CHAT_CATEGORY,
        icon: Codicon.checklist,
        f1: true,
        toggled: { condition: OC_TASK_SHELF_HIDDEN_CONTEXT.negate(), title: "\u9690\u85CF\u4EFB\u52A1\u9762\u677F" },
        menu: [{ id: MenuId.ViewTitle, group: "navigation", order: 7, when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId)) }]
      });
    }
    run(accessor) {
      const next = !ocReadTaskShelfHidden();
      try { globalThis.localStorage?.setItem(OC_TASK_SHELF_HIDDEN_STORAGE_KEY, next ? "1" : "0"); } catch {}
      OC_TASK_SHELF_HIDDEN_CONTEXT.bindTo(accessor.get(IContextKeyService)).set(next);
      try { globalThis.dispatchEvent(new CustomEvent("opencode-task-shelf-visibility", { detail: { hidden: next } })); } catch {}
    }
  });
  registerAction2(class OpenCodeSyncTaskShelfContextAction extends Action2 {
    constructor() {
      super({ id: "opencode.chat.syncTaskShelfContext", title: { value: "Sync Tasks Panel State", original: "Sync Tasks Panel State" }, f1: false });
    }
    run(accessor) {
      OC_TASK_SHELF_HIDDEN_CONTEXT.bindTo(accessor.get(IContextKeyService)).set(ocReadTaskShelfHidden());
    }
  });
  // OpenCode p38: 命令面板入口「浮出侧栏」，把当前侧栏/右侧栏的视图容器浮成窗内浮窗（也供 UI 回归测试用）
  registerAction2(class OpenCodeFloatSideBarAction extends Action2 {
    constructor() {
      super({ id: "opencode.layout.floatSideBar", title: { value: "\u6D6E\u51FA\u4FA7\u680F\uFF08\u7A97\u5185\u6D6E\u7A97\uFF09", original: "Float Side Bar In Window" }, f1: true });
    }
    async run(accessor, location) {
      const g = OC_PAGE_DOCK_GUIDE;
      if (!g) return false;
      const locs = typeof location === "number" ? [location] : [0, 2];
      for (const loc of locs) {
        const c = g.viewsService?.getVisibleViewContainer?.(loc);
        if (c?.id) return ocAeFloatContainer(g, c.id);
      }
      g.notificationService?.info?.("\u6CA1\u6709\u53EF\u6D6E\u51FA\u7684\u4FA7\u680F\u89C6\u56FE");
      return false;
    }
  });
}

var OC_TOGGLE_TASK_SHELF_COMMAND = "opencode.chat.toggleTaskShelf";
var OC_TASK_SHELF_HIDDEN_STORAGE_KEY = "opencode.chat.taskShelfHidden";
var OC_TASK_SHELF_HIDDEN_CONTEXT = new RawContextKey("opencodeTaskShelfHidden", false);
function ocReadTaskShelfHidden() {
  try { return globalThis.localStorage?.getItem(OC_TASK_SHELF_HIDDEN_STORAGE_KEY) === "1"; } catch { return false; }
}
function stringifyItem(item, includeName = true) {
  if (isRequestVM(item)) {
    return (includeName ? `${item.username}: ` : "") + item.messageText;
  } else {
    return (includeName ? `${item.username}: ` : "") + item.response.toString();
  }
}

function computeToolEnablementMap(options3) {
  const { allTools, allToolSets, toolsInclude, toolsExclude } = options3;
  const enablementMap = /* @__PURE__ */ new Map();
  const matchedIdentifiers = /* @__PURE__ */ new Set();
  const toolMatches = (tool, identifiers2) => {
    if (identifiers2.has(tool.id)) {
      matchedIdentifiers.add(tool.id);
      return true;
    }
    if (tool.toolReferenceName && identifiers2.has(tool.toolReferenceName)) {
      matchedIdentifiers.add(tool.toolReferenceName);
      return true;
    }
    return false;
  };
  const toolSetMatches = (toolSet, identifiers2) => {
    if (identifiers2.has(toolSet.id)) {
      matchedIdentifiers.add(toolSet.id);
      return true;
    }
    if (identifiers2.has(toolSet.referenceName)) {
      matchedIdentifiers.add(toolSet.referenceName);
      return true;
    }
    return false;
  };
  const explicitlyIncludedTools = /* @__PURE__ */ new Set();
  if (toolsInclude) {
    const includeSet = new Set(toolsInclude);
    for (const toolSet of allToolSets) {
      if (toolSetMatches(toolSet, includeSet)) {
        for (const tool of toolSet.getTools()) {
          enablementMap.set(tool, true);
        }
      }
    }
    for (const tool of allTools) {
      if (toolMatches(tool, includeSet)) {
        enablementMap.set(tool, true);
        explicitlyIncludedTools.add(tool);
      } else if (!enablementMap.has(tool)) {
        enablementMap.set(tool, false);
      }
    }
    for (const toolSet of allToolSets) {
      for (const tool of toolSet.getTools()) {
        if (toolMatches(tool, includeSet)) {
          enablementMap.set(tool, true);
          explicitlyIncludedTools.add(tool);
        } else if (!enablementMap.has(tool)) {
          enablementMap.set(tool, false);
        }
      }
    }
  } else {
    for (const tool of allTools) {
      enablementMap.set(tool, true);
    }
    for (const toolSet of allToolSets) {
      for (const tool of toolSet.getTools()) {
        enablementMap.set(tool, true);
      }
    }
  }
  if (toolsExclude) {
    const excludeSet = new Set(toolsExclude);
    for (const toolSet of allToolSets) {
      if (toolSetMatches(toolSet, excludeSet)) {
        for (const tool of toolSet.getTools()) {
          if (!explicitlyIncludedTools.has(tool)) {
            enablementMap.set(tool, false);
          }
        }
      }
    }
    for (const tool of allTools) {
      if (toolMatches(tool, excludeSet)) {
        enablementMap.set(tool, false);
      }
    }
    for (const toolSet of allToolSets) {
      for (const tool of toolSet.getTools()) {
        if (toolMatches(tool, excludeSet)) {
          enablementMap.set(tool, false);
        }
      }
    }
  }
  const allIdentifiers = /* @__PURE__ */ new Set([...toolsInclude ?? [], ...toolsExclude ?? []]);
  const unknownIdentifiers = [];
  for (const identifier2 of allIdentifiers) {
    if (!matchedIdentifiers.has(identifier2)) {
      unknownIdentifiers.push(identifier2);
    }
  }
  const enabledToolCount = Array.from(enablementMap.entries()).filter(([item, enabled]) => enabled && !isToolSet(item)).length;
  if (enabledToolCount === 0) {
    throw new Error("Tool filtering resulted in zero enabled tools. At least one tool must be enabled.");
  }
  for (const toolSet of allToolSets) {
    const toolSetTools = Array.from(toolSet.getTools());
    const allToolsEnabled = toolSetTools.length > 0 && toolSetTools.every((t2) => enablementMap.get(t2) === true);
    enablementMap.set(toolSet, allToolsEnabled);
  }
  return { enablementMap: ToolAndToolSetEnablementMap.fromMap(enablementMap), unknownIdentifiers };
}

async function handleCurrentEditingSession(model, phrase, dialogService) {
  return showClearEditingSessionConfirmation(model, dialogService, { messageOverride: phrase });
}

async function handleModeSwitch(accessor, fromMode, toMode, requestCount, model) {
  if (!model?.editingSession || fromMode === toMode) {
    return { needToClearSession: false };
  }
  const dialogService = accessor.get(IDialogService);
  const needToClearEdits = (fromMode === "edit" /* Edit */ || toMode === "edit" /* Edit */) && requestCount > 0;
  if (needToClearEdits) {
    const phrase = localize(8572, null);
    const currentEdits = model.editingSession.entries.get();
    const undecidedEdits = currentEdits.filter((edit3) => edit3.state.get() === 0 /* Modified */);
    if (undecidedEdits.length > 0) {
      if (!await handleCurrentEditingSession(model, phrase, dialogService)) {
        return false;
      }
      return { needToClearSession: true };
    } else {
      const confirmation = await dialogService.confirm({
        title: localize(8513, null),
        message: localize(8515, null),
        primaryButton: localize(8514, null),
        type: "info"
      });
      if (!confirmation.confirmed) {
        return false;
      }
      return { needToClearSession: true };
    }
  }
  return { needToClearSession: false };
}

async function clearChatSessionPreservingType(accessor, widget, sessionType) {
  const viewsService = accessor.get(IViewsService);
  const currentResource = widget.viewModel?.model.sessionResource;
  const currentSessionType = currentResource ? getChatSessionType(currentResource) : void 0;
  const resolvedSessionType = getDefaultNewChatSessionTypeAndReason(accessor, { explicitOverride: sessionType, currentSessionType });
  const newSessionType = resolvedSessionType.sessionType;
  if (isIChatViewViewContext(widget.viewContext)) {
    const view = await viewsService.openView(ChatViewId);
    if (newSessionType !== localChatSessionType) {
      await view.loadSession(URI.from({ scheme: newSessionType, path: `/untitled-${generateUuid()}` }), resolvedSessionType.selectionReason);
    } else {
      await view.startNewLocalSession(resolvedSessionType.selectionReason);
    }
  } else {
    await widget.clear(resolvedSessionType);
  }
}

MenuRegistry.appendMenuItem(MenuId.EditorContext, {
  submenu: MenuId.ChatTextEditorMenu,
  group: "1_chat",
  order: 5,
  title: localize(8532, null),
  when: ContextKeyExpr.and(
    ChatContextKeys.Setup.hidden.negate(),
    ChatContextKeys.Setup.disabledInWorkspace.negate()
  )
});

registerAction2(class ToggleDefaultVisibilityAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.toggleDefaultVisibility",
      title: localize2(8523, "Show View by Default"),
      toggled: ContextKeyExpr.equals("config.workbench.secondarySideBar.defaultVisibility", "hidden").negate(),
      f1: false,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", ChatViewId),
          ChatContextKeys.panelLocation.isEqualTo(2 /* AuxiliaryBar */)
        ),
        order: 0,
        group: "5_configure"
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const currentValue = configurationService.getValue("workbench.secondarySideBar.defaultVisibility");
    configurationService.updateValue("workbench.secondarySideBar.defaultVisibility", currentValue !== "hidden" ? "hidden" : "visible");
  }
});

registerAction2(class EditToolApproval extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.editToolApproval",
      title: localize2(8518, "Manage Tool Approval"),
      metadata: {
        description: localize2(8517, "Edit/manage the tool approval and confirmation preferences for AI chat agents.")
      },
      precondition: ChatContextKeys.enabled,
      f1: true,
      category: CHAT_CATEGORY
    });
  }
  async run(accessor, scope) {
    const confirmationService = accessor.get(ILanguageModelToolsConfirmationService);
    const toolsService = accessor.get(ILanguageModelToolsService);
    confirmationService.manageConfirmationPreferences([...toolsService.getAllToolsIncludingDisabled()], scope ? { defaultScope: scope } : void 0);
  }
});

// OpenCode ae-dock-step01: AE 式停靠引导——拖动任意视图/面板标题（或活动栏图标）时，窗口中央出现上/下/左/右停靠罗盘，
// 悬停预览目标区域，松手即把该视图（或整个视图容器）移到对应位置。原有拖放目标保持不变。
var OC_DOCK_STYLE_ID = "oc-ae-dock-style";
var OC_DOCK_CSS = `
.oc-ae-dock{position:absolute;inset:0;z-index:2600;pointer-events:none;display:none}
.oc-ae-dock.visible{display:block}
.oc-ae-dock.visible.oc-ae-native{display:none}
.oc-ae-dock-preview{position:absolute;background:color-mix(in srgb,var(--vscode-focusBorder,#0078d4) 18%,transparent);border:2px solid var(--vscode-focusBorder,#0078d4);border-radius:6px;box-sizing:border-box;opacity:0;transition:opacity .08s,left .08s,top .08s,width .08s,height .08s;pointer-events:none}
.oc-ae-dock-preview.visible{opacity:1}
.oc-ae-dock-compass{position:absolute;left:50%;top:50%;width:156px;height:156px;transform:translate(-50%,-50%);pointer-events:none}
.oc-ae-dock-tile{position:absolute;width:48px;height:48px;border-radius:8px;box-sizing:border-box;pointer-events:auto;display:flex;align-items:center;justify-content:center;background:var(--vscode-editorWidget-background,#252526);border:1px solid var(--vscode-widget-border,rgba(128,128,128,.4));box-shadow:0 4px 16px rgba(0,0,0,.35);color:var(--vscode-foreground);font-size:11px;transition:background .08s,border-color .08s}
.oc-ae-dock-tile .oc-ae-dock-glyph{position:relative;width:26px;height:26px;border:1.5px solid currentColor;border-radius:3px;opacity:.75;box-sizing:border-box}
.oc-ae-dock-tile .oc-ae-dock-glyph::after{content:"";position:absolute;background:currentColor;opacity:.85}
.oc-ae-dock-tile[data-zone=left] .oc-ae-dock-glyph::after{left:0;top:0;bottom:0;width:9px}
.oc-ae-dock-tile[data-zone=right] .oc-ae-dock-glyph::after{right:0;top:0;bottom:0;width:9px}
.oc-ae-dock-tile[data-zone=top] .oc-ae-dock-glyph::after{left:0;right:0;top:0;height:9px}
.oc-ae-dock-tile[data-zone=bottom] .oc-ae-dock-glyph::after{left:0;right:0;bottom:0;height:9px}
.oc-ae-dock-tile[data-zone=left]{left:0;top:54px}
.oc-ae-dock-tile[data-zone=right]{right:0;top:54px}
.oc-ae-dock-tile[data-zone=top]{left:54px;top:0}
.oc-ae-dock-tile[data-zone=bottom]{left:54px;bottom:0}
.oc-ae-dock-tile[data-zone=page]{left:54px;top:54px}
.oc-ae-dock-tile[data-zone=page] .oc-ae-dock-glyph::after{left:3px;right:3px;top:3px;bottom:3px;border-radius:1px;opacity:.55}
.oc-ae-dock-tile[data-zone=float]{right:-6px;bottom:-6px;width:40px;height:40px;border-radius:50%}
.oc-ae-dock-tile[data-zone=float] .oc-ae-dock-glyph{width:22px;height:22px}
.oc-ae-dock-tile[data-zone=float] .oc-ae-dock-glyph::after{left:6px;top:6px;width:12px;height:10px;border-radius:2px}
.oc-ae-dock-center{position:absolute;left:54px;top:54px;width:48px;height:48px;border-radius:50%;background:color-mix(in srgb,var(--vscode-editorWidget-background,#252526) 70%,transparent);border:1px dashed var(--vscode-widget-border,rgba(128,128,128,.4));box-sizing:border-box}
.oc-ae-dock-tile.active{background:var(--vscode-button-background,#0e639c);border-color:var(--vscode-focusBorder,#0078d4);color:var(--vscode-button-foreground,#fff)}
.oc-ae-dock-tile.active .oc-ae-dock-glyph{opacity:1}
.oc-ae-dock-label{position:absolute;left:50%;top:calc(50% + 92px);transform:translateX(-50%);padding:3px 10px;border-radius:4px;background:var(--vscode-editorWidget-background,#252526);border:1px solid var(--vscode-widget-border,rgba(128,128,128,.4));font-size:12px;color:var(--vscode-foreground);white-space:nowrap;opacity:0;transition:opacity .08s}
.oc-ae-dock-label.visible{opacity:1}
`;
// ae-dock-step02: 中央圆形格子 = 弹出为独立悬浮窗口（目前支持聊天、终端）
var OC_DOCK_LABELS = { float: "\u5F39\u51FA\u4E3A\u72EC\u7ACB\u7A97\u53E3", left: "\u505C\u9760\u5230\u5DE6\u4FA7", right: "\u505C\u9760\u5230\u53F3\u4FA7", top: "\u505C\u9760\u5230\u9876\u90E8", bottom: "\u505C\u9760\u5230\u5E95\u90E8" };
Object.assign(OC_DOCK_LABELS, { "dock-left": "\u505C\u9760\u8FDB\u5DE6\u4FA7\u680F", "dock-right": "\u505C\u9760\u8FDB\u53F3\u4FA7\u680F", "dock-bottom": "\u505C\u9760\u8FDB\u5E95\u90E8\u9762\u677F" });
var OC_DOCK_EDGE_CSS = `
.oc-ae-dock-edge{display:none}
.oc-ae-dock.editor-drag .oc-ae-dock-edge{display:flex}
.oc-ae-dock-edge{border-style:dashed;border-color:var(--vscode-focusBorder,#0078d4)}
.oc-ae-dock-tile[data-zone=dock-left]{left:16px;top:50%;transform:translateY(-50%)}
.oc-ae-dock-tile[data-zone=dock-right]{right:16px;top:50%;transform:translateY(-50%)}
.oc-ae-dock-tile[data-zone=dock-bottom]{bottom:16px;left:50%;transform:translateX(-50%)}
.oc-ae-dock-tile[data-zone=dock-left] .oc-ae-dock-glyph::after{left:0;top:0;bottom:0;width:9px}
.oc-ae-dock-tile[data-zone=dock-right] .oc-ae-dock-glyph::after{right:0;top:0;bottom:0;width:9px}
.oc-ae-dock-tile[data-zone=dock-bottom] .oc-ae-dock-glyph::after{left:0;right:0;bottom:0;height:9px}
`;
OC_DOCK_CSS += OC_DOCK_EDGE_CSS;
// ae-dock-step06: 中心=作为页面放进编辑区；右下圆钮=弹出窗口；上/下=在编辑区上/下方拆出页面（不再整体翻转底部面板）
Object.assign(OC_DOCK_LABELS, { page: "\u4F5C\u4E3A\u9875\u9762\u653E\u8FDB\u7F16\u8F91\u533A", top: "\u5728\u7F16\u8F91\u533A\u4E0A\u65B9\u6253\u5F00", bottom: "\u5728\u7F16\u8F91\u533A\u4E0B\u65B9\u6253\u5F00" });
var OC_PART_IDS = ["workbench.parts.sidebar", "workbench.parts.panel", "workbench.parts.auxiliarybar"];
var OpenCodeAeDockGuide = class extends Disposable {
  // OpenCode ae-dock-step08: 去掉罗盘按钮，改成 AE 式——拖到哪个区域（编辑区分组、侧栏、右侧栏、底部面板），
  // 哪里就自动出现蓝色预览框；靠近分组边缘=在那一侧拆分，中间=放进去；拖出窗口=独立窗口。所有可拖的东西同一套规则。
  static {
    this.ID = "workbench.contrib.opencodeAeDockGuide";
  }
  constructor(viewDescriptorService, layoutService, logService, commandService, notificationService, editorGroupsService, editorService, viewsService) {
    super();
    this.viewsService = viewsService;
    OC_PAGE_DOCK_GUIDE = this;
    this.editorGroupsService = editorGroupsService;
    this.editorService = editorService;
    try {
      for (const id of ocReadViewPageHidden()) ocSetViewVisibleInContainer(viewDescriptorService, id, true);
      ocWriteViewPageHidden([]);
    } catch {
    }
    this.commandService = commandService;
    this.notificationService = notificationService;
    this.viewDescriptorService = viewDescriptorService;
    this.layoutService = layoutService;
    this.logService = logService;
    this.dragKind = void 0;
    this.dragId = void 0;
    this.target = void 0;
    this.dropped = false;
    try {
      this.install();
    } catch (error) {
      this.logService?.warn?.("[OpenCode] AE dock guide failed to install", error);
    }
    try {
      this.ocInstallAutoHide();
    } catch {
    }
    try {
      this.ocWatchEmptyParts();
    } catch {
    }
    try {
      this.ocInstallTildeMaximize();
    } catch {
    }
    try {
      this.ocRelaxPartSizes();
    } catch {
    }
    try {
      this.ocInstallWatermarkGate();
    } catch {
    }
  }
  // OpenCode free-size: 侧栏/右侧栏 170px、底部面板 300px 的最小宽度改为 80px（仍可抓住），最大值本来就不限
  ocRelaxPartSizes() {
    const ls = this.layoutService;
    const MIN = 80;
    const list = [[ls.sideBarPartView, ["minimumWidth"]], [ls.auxiliaryBarPartView, ["minimumWidth"]], [ls.panelPartView, ["minimumWidth", "minimumHeight"]]];
    let changed = false;
    for (const [v, keys] of list) {
      if (!v) continue;
      for (const k of keys) {
        try {
          if (typeof v[k] === "number" && v[k] > MIN) {
            v[k] = MIN;
            changed = true;
          }
        } catch {
        }
      }
    }
    if (changed) {
      try {
        ls.layout?.();
      } catch {
      }
    }
  }
  // OpenCode watermark-gate: 空编辑区的大 logo + 快捷键提示，只在所有区域都隐藏时显示
  // （没有打开的编辑器/页面、侧栏、底部面板、右侧栏都收起、也没有浮窗）
  ocInstallWatermarkGate() {
    const doc = this.doc ?? document;
    const win = doc.defaultView ?? globalThis;
    if (!doc.getElementById("oc-wm-gate-style")) {
      const st = doc.createElement("style");
      st.id = "oc-wm-gate-style";
      st.textContent = "html:not(.oc-wm-allow) .monaco-workbench .part.editor .editor-group-watermark{display:none!important}";
      doc.head.appendChild(st);
    }
    const ls = this.layoutService, egs = this.editorGroupsService;
    const compute = () => {
      try {
        if (OC_PART_PAGES.size) return false;
        for (const g of egs.getGroups(1)) if (!g.isEmpty) return false;
        for (const p of ["workbench.parts.sidebar", "workbench.parts.panel", "workbench.parts.auxiliarybar"]) if (ls.isVisible(p)) return false;
        for (const s of globalThis.__ocAeFloats?.values?.() ?? []) if (s?.frame?.isConnected && s.frame.style.display !== "none") return false;
        return true;
      } catch {
        return false;
      }
    };
    let t = 0;
    const refresh = () => {
      if (t) return;
      t = win.setTimeout(() => {
        t = 0;
        doc.documentElement.classList.toggle("oc-wm-allow", compute());
      }, 30);
    };
    globalThis.__ocWmRefresh = refresh;
    for (const ev of [ls.onDidChangePartVisibility, egs.onDidAddGroup, egs.onDidRemoveGroup, egs.onDidChangeActiveGroup, this.editorService?.onDidEditorsChange, this.editorService?.onDidVisibleEditorsChange]) {
      try {
        if (typeof ev === "function") this._register(ev(refresh));
      } catch {
      }
    }
    // 兜底（浮窗开关等没有事件的情况）
    const iv = win.setInterval(refresh, 1500);
    this._register({ dispose: () => win.clearInterval(iv) });
    refresh();
  }
  // ae-dock-step17: 像 AE 一样按 `（波浪号键）把鼠标所在的区域最大化，再按一次还原。
  // 正在输入（光标在同一区域的编辑器/输入框/终端里）时不拦截，照常打出 ` 字符。
  ocInstallTildeMaximize() {
    const doc = this.doc ?? document;
    const win = doc.defaultView ?? globalThis;
    let mx = -1, my = -1;
    doc.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
    }, true);
    const isEditable = (el) => !!el && (el.matches?.("input, textarea, select, [contenteditable=''], [contenteditable='true']") || !!el.closest?.(".monaco-editor, .xterm"));
    const onKey = (e) => {
      if (e.key !== "`" || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.isComposing) return;
      if (mx < 0) return;
      const hit = doc.elementFromPoint(mx, my);
      if (!hit || hit.closest(".oc-ae-dock, .quick-input-widget, .monaco-dialog-box, .context-view")) return;
      const region = hit.closest(".editor-group-container, .part.panel, .part.auxiliarybar, .part.sidebar");
      const restoring = !!this.ocMaxState;
      if (!region && !restoring) return;
      const active = doc.activeElement;
      if (isEditable(active) && (region ? region.contains(active) : true)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat) return;
      try {
        this.ocToggleMaximize(region);
      } catch (error) {
        this.logService?.warn?.("[OpenCode] tilde maximize failed", error);
      }
    };
    doc.addEventListener("keydown", onKey, true);
    this._register({ dispose: () => doc.removeEventListener("keydown", onKey, true) });
    void win;
  }
  ocToggleMaximize(region) {
    const ls = this.layoutService;
    const SIDE = "workbench.parts.sidebar", PANEL = "workbench.parts.panel", AUX = "workbench.parts.auxiliarybar", EDITOR = "workbench.parts.editor";
    const st = this.ocMaxState;
    if (st) {
      this.ocMaxState = void 0;
      try {
        if (st.kind === "panel" && ls.isPanelMaximized?.()) ls.toggleMaximizedPanel();
        if (st.kind === "aux" && ls.isAuxiliaryBarMaximized?.()) ls.toggleMaximizedAuxiliaryBar();
        if (st.kind === "group" && st.groupMax) this.commandService.executeCommand("workbench.action.toggleMaximizeEditorGroup").catch(() => void 0);
      } catch {
      }
      for (const part of st.hidden) {
        try {
          ls.setPartHidden(false, part);
        } catch {
        }
      }
      return;
    }
    const hideVisible = (parts) => {
      const hidden = [];
      for (const part of parts) {
        try {
          if (ls.isVisible(part)) {
            ls.setPartHidden(true, part);
            hidden.push(part);
          }
        } catch {
        }
      }
      return hidden;
    };
    if (region.classList.contains("editor-group-container")) {
      const groups = this.editorGroupsService.getGroups(1);
      const group2 = groups.find((g) => g.element === region || g.element?.contains?.(region));
      if (group2) this.editorGroupsService.activateGroup(group2);
      const hidden = hideVisible([SIDE, PANEL, AUX]);
      let groupMax = false;
      if (groups.filter((g) => g.windowId === group2?.windowId).length > 1) {
        groupMax = true;
        this.commandService.executeCommand("workbench.action.toggleMaximizeEditorGroup").catch(() => void 0);
      }
      this.ocMaxState = { kind: "group", hidden, groupMax };
      return;
    }
    if (region.classList.contains("panel")) {
      const hidden = hideVisible([SIDE, AUX]);
      if (!ls.isPanelMaximized?.()) {
        try {
          ls.toggleMaximizedPanel();
        } catch {
        }
      }
      this.ocMaxState = { kind: "panel", hidden };
      return;
    }
    if (region.classList.contains("auxiliarybar")) {
      if (!ls.isAuxiliaryBarMaximized?.()) ls.toggleMaximizedAuxiliaryBar();
      this.ocMaxState = { kind: "aux", hidden: [] };
      return;
    }
    if (region.classList.contains("sidebar")) {
      const hidden = hideVisible([PANEL, AUX, EDITOR]);
      this.ocMaxState = { kind: "side", hidden };
    }
  }
  // ae-dock-step13: 侧栏/面板一旦变成空白（显示「将视图拖动到此处显示」），立刻收起；拖动中只保留鼠标正悬停的那一个
  ocWatchEmptyParts() {
    const doc = this.doc ?? document;
    const sels = [".part.sidebar", ".part.panel", ".part.auxiliarybar"];
    let pending = false;
    const check = () => {
      pending = false;
      for (let loc = 0; loc < 3; loc++) {
        const el = this.partElement(loc);
        if (!el || !el.classList.contains("empty")) continue;
        if (this.dragKind && this.ocHoveredLoc === loc) continue;
        const part = OC_PART_IDS[loc];
        try {
          this.layoutService.setPartHidden(true, part);
          if (this.dragKind && this.ocTempHidden && !this.ocTempHidden.includes(part)) this.ocTempHidden.push(part);
        } catch {
        }
      }
    };
    const schedule = () => {
      if (pending) return;
      pending = true;
      setTimeout(check, 60);
    };
    this.ocCheckEmptyDom = schedule;
    const mo = new MutationObserver(schedule);
    const attach = () => {
      let n = 0;
      for (const s of sels) {
        const el = doc.querySelector(".monaco-workbench " + s);
        if (el) {
          mo.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
          n++;
        }
      }
      return n;
    };
    if (attach() < 3) setTimeout(attach, 1500);
    this._register({ dispose: () => mo.disconnect() });
    schedule();
  }
  install() {
    const container = this.layoutService.mainContainer ?? document.body;
    const doc = container.ownerDocument ?? document;
    this.doc = doc;
    if (!doc.getElementById(OC_DOCK_STYLE_ID)) {
      const style = doc.createElement("style");
      style.id = OC_DOCK_STYLE_ID;
      style.textContent = OC_DOCK_CSS + ".oc-ae-dock{position:fixed}.oc-ae-dock-preview{transition:none}.oc-ae-dock-label{top:auto;left:0;transform:none}";
      doc.head.appendChild(style);
    }
    const root = doc.createElement("div");
    root.className = "oc-ae-dock";
    this.preview = doc.createElement("div");
    this.preview.className = "oc-ae-dock-preview";
    root.appendChild(this.preview);
    this.label = doc.createElement("div");
    this.label.className = "oc-ae-dock-label";
    root.appendChild(this.label);
    // OpenCode ae-dock-step12: 恢复上下左右中 + 弹出 的浮动方块，跟随鼠标所在区域；悬停区域边缘的蓝框也保留
    const compass = doc.createElement("div");
    compass.className = "oc-ae-dock-compass";
    for (const zone of ["left", "right", "top", "bottom", "page", "float"]) {
      const tile = doc.createElement("div");
      tile.className = "oc-ae-dock-tile";
      tile.dataset.zone = zone;
      const glyph = doc.createElement("div");
      glyph.className = "oc-ae-dock-glyph";
      tile.appendChild(glyph);
      compass.appendChild(tile);
    }
    compass.style.display = "none";
    root.appendChild(compass);
    this.compass = compass;
    ocAeMotionStyle(doc);
    if (!doc.getElementById("oc-ae-dock-drag-style")) {
      const s2 = doc.createElement("style");
      s2.id = "oc-ae-dock-drag-style";
      // 拖动时让网页类页面（MCP、Bridge 等 iframe/webview）不吞掉拖拽事件，才能停靠到它们上面
      s2.textContent = ".oc-ae-dock-label{z-index:10}.oc-ae-dock-compass{z-index:5}.oc-ae-dock-preview{z-index:1}.oc-ae-dragging .drop-block-overlay{display:none!important}.oc-ae-dragging iframe,.oc-ae-dragging webview,.oc-ae-dragging .webview{pointer-events:none!important}.oc-ae-dock-compass{transform:translate(-50%,-50%)}.oc-ae-dock-compass[data-nofloat] .oc-ae-dock-tile[data-zone=float]{display:none}";
      doc.head.appendChild(s2);
    }
    container.appendChild(root);
    this.root = root;
    this._register({ dispose: () => root.remove() });
    const observer = CompositeDragAndDropObserver.INSTANCE;
    this._register(observer.onDragStart.event((e) => {
      const data = e?.dragAndDropData?.getData?.();
      if (data && (data.type === "view" || data.type === "composite")) {
        this.show(data.type, data.id);
        // OpenCode bar-item-drag: 拖的是图标栏里的单个图标（资源管理器、搜索…）时只搬这一个容器；拖标题/空白处仍搬整块区域
        try {
          const src0 = e?.eventData?.target;
          this.ocBarItemDrag = data.type === "composite" && !!src0?.closest?.(".composite-bar .action-item, .activitybar .action-item");
        } catch {
          this.ocBarItemDrag = false;
        }
      }
    }));
    // OpenCode empty-slot-reclaim: 网格每次重排后检查搬进编辑区的区域是否又被显示成空槽位（右侧大块暗色空白），是就收回
    try {
      const ls0 = this.layoutService;
      for (const ev of [ls0.onDidLayoutMainContainer, ls0.onDidChangePartVisibility]) {
        if (typeof ev === "function") this._register(ev.call(ls0, () => this.ocReclaimEmptySlots()));
      }
    } catch {
    }
    const onDragStart = () => {
      if (globalThis.__ocDomDockDrag) {
        this.show("dom", globalThis.__ocDomDockDrag.id);
        return;
      }
      try {
        if (LocalSelectionTransfer.getInstance().hasData(DraggedEditorIdentifier.prototype)) this.show("editor");
      } catch {
      }
    };
    const onOver = (e) => {
      // OpenCode ae-dock-p20: 记录最近一次拖拽事件时间，供“卡住罗盘”检测判断拖动是否真的已结束
      this.ocLastDragEvt = Date.now();
      if (!this.dragKind && globalThis.__ocDomDockDrag && e.type === "dragenter") this.show("dom", globalThis.__ocDomDockDrag.id);
      if (!this.dragKind) return;
      // OpenCode shift-native-drop: 按住 Shift 时让出给编辑区自带的分屏放置，不显示也不接管蓝框
      // 只有编辑器标签能用自带分屏放置；视图/面板（聊天等）原生编辑区不接收，Shift 下仍用蓝框
      const ocNative = !!e.shiftKey && this.dragKind === "editor";
      this.root?.classList.toggle("oc-ae-native", ocNative);
      if (ocNative) {
        this.setTarget(void 0);
        return;
      }
      this.ocCollapseSourceParts(e);
      const target = this.computeTarget(e);
      this.setTarget(target);
      if (!target) {
        if (e.target?.closest?.(".oc-ae-dock-tile")) {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    };
    const onDrop = (e) => {
      if (!this.dragKind) return;
      const target = e.shiftKey && this.dragKind === "editor" ? void 0 : this.computeTarget(e);
      if (!target) {
        // 原生区域（标签栏、活动栏等）自己处理放下
        this.dropped = true;
        this.setTarget(void 0);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      this.dropped = true;
      this.logService?.info?.("[OpenCode] ae drop " + this.dragKind + " -> " + target.type + (target.zone ? "/" + target.zone : "") + (target.location !== void 0 ? " loc" + target.location : "") + (target.side ? " " + target.side : ""));
      try {
        this.apply(target);
      } catch (error) {
        this.logService?.warn?.("[OpenCode] AE dock failed", error);
      }
      this.hide();
    };
    const onEnd = (e) => {
      if (this.dragKind && !this.dropped && this.dragKind !== "editor" && this.isOutsideWindow(e)) {
        try {
          this.apply({ type: "float" });
          this.dropped = true;
        } catch (error) {
          this.logService?.warn?.("[OpenCode] AE float failed", error);
        }
      }
      // 拖拽被取消（Esc 或松手在无效位置）：把拖动时临时收起的侧栏放回来
      const tempHidden = this.ocTempHidden ?? [];
      this.ocTempHidden = [];
      if (!this.dropped) {
        for (const part of tempHidden) {
          try {
            this.layoutService.setPartHidden(false, part);
          } catch {
          }
        }
      }
      this.hide();
      globalThis.__ocDomDockDrag = void 0;
      this.ocCheckEmptyParts?.();
    };
    doc.addEventListener("dragstart", onDragStart, false);
    doc.addEventListener("dragenter", onOver, true);
    doc.addEventListener("dragover", onOver, true);
    doc.addEventListener("drop", onDrop, true);
    doc.addEventListener("dragend", onEnd, true);
    // OpenCode ae-float-p17: 拖动源在放下时被移走（任务放回聊天等）收不到 dragend，罗盘会卡住：松手后鼠标一动就收起
    const onStale = (e) => {
      // ae-dock-p20: Windows 上拖动刚开始时会冒出一个 buttons=0 的 mousemove，旧逻辑会把正在进行的拖动当成结束，
      // 导致罗盘方块和停靠区失效。只有拖动开始超过 400ms、且 300ms 内没有任何 dragover 时才认定拖动已卡住。
      if (!this.dragKind || e.buttons) return;
      const now = Date.now();
      if (now - (this.ocShowAt ?? 0) < 400 || now - (this.ocLastDragEvt ?? 0) < 300) return;
      this.logService?.info?.("[OpenCode] ae stale drag reset " + this.dragKind);
      onEnd(e);
    };
    doc.addEventListener("mousemove", onStale, true);
    this._register({ dispose: () => doc.removeEventListener("mousemove", onStale, true) });
    this._register({ dispose: () => {
      doc.removeEventListener("dragstart", onDragStart, false);
      doc.removeEventListener("dragenter", onOver, true);
      doc.removeEventListener("dragover", onOver, true);
      doc.removeEventListener("drop", onDrop, true);
      doc.removeEventListener("dragend", onEnd, true);
    } });
  }
  show(kind, id) {
    this.ocShowAt = Date.now();
    this.ocLastDragEvt = Date.now();
    this.dragKind = kind;
    this.dragId = id;
    this.dropped = false;
    this.ocTempHidden = [];
    this.setTarget(void 0);
    this.root.classList.add("visible");
    this.compassRegion = void 0;
    if (this.compass) this.compass.style.display = "none";
    this.doc.body.classList.add("oc-ae-dragging");
    ocInstallDropOverlayWatchdog(this.doc);
    this.ocHoveredLoc = void 0;
    this.ocShowWindowCompass();
  }
  hide() {
    this.dragKind = void 0;
    this.dragId = void 0;
    this.ocBarItemDrag = false;
    this.setTarget(void 0);
    this.root?.classList.remove("visible");
    this.root?.classList.remove("oc-ae-native");
    this.compassRegion = void 0;
    if (this.compass) this.compass.style.display = "none";
    this.doc?.body?.classList.remove("oc-ae-dragging");
    ocClearStaleDropOverlays(this.doc);
  }
  isOutsideWindow(e) {
    const win = this.doc.defaultView ?? globalThis;
    if (e.dataTransfer && e.dataTransfer.dropEffect !== "none") return false;
    const x = e.screenX, y = e.screenY;
    if (!x && !y) return false;
    return x < win.screenX || y < win.screenY || x > win.screenX + win.outerWidth || y > win.screenY + win.outerHeight;
  }
  partLocation(el) {
    if (!el) return void 0;
    const cl = el.classList;
    return cl.contains("sidebar") ? 0 : cl.contains("panel") ? 1 : cl.contains("auxiliarybar") ? 2 : void 0;
  }
  partElement(location) {
    const sel = location === 0 ? ".part.sidebar" : location === 1 ? ".part.panel" : ".part.auxiliarybar";
    const el = this.doc.querySelector(`.monaco-workbench ${sel}`);
    // OpenCode empty-slot-drop: 区域被搬进编辑区当页面时，它在原位置其实是空的；不能再当成「原位置有区域」，否则窗口右边缘停靠失效
    if (el && OC_PART_PAGES.has(OC_PART_IDS[location]) && el.closest(".part.editor")) return void 0;
    return el && el.offsetWidth > 0 && el.offsetHeight > 0 ? el : void 0;
  }
  draggedEditor() {
    try {
      const transfer = LocalSelectionTransfer.getInstance();
      if (!transfer.hasData(DraggedEditorIdentifier.prototype)) return void 0;
      const identifier = transfer.getData(DraggedEditorIdentifier.prototype)?.[0]?.identifier;
      const source = identifier && this.editorGroupsService.getGroup(identifier.groupId);
      return source && identifier.editor ? { source, editor: identifier.editor } : void 0;
    } catch {
      return void 0;
    }
  }
  draggedViewLocation() {
    try {
      if (this.dragKind === "view") return this.viewDescriptorService.getViewLocationById(this.dragId);
      if (this.dragKind === "composite") {
        const c = this.viewDescriptorService.getViewContainerById(this.dragId);
        return c ? this.viewDescriptorService.getViewContainerLocation(c) : void 0;
      }
    } catch {
    }
    return void 0;
  }
  computeTarget(e) {
    const x = e.clientX, y = e.clientY;
    // ae-dock-step16: 编辑区上有一层 VS Code 自带的拖动遮罩（.drop-block-overlay），会挡住区域判定，还会在靠边时把隐藏的终端/右侧栏弹出来；
    // 这里跳过遮罩和我们自己的蓝框，取真正的区域元素
    const top0 = this.doc.elementFromPoint(x, y);
    let hit = top0;
    if (!top0?.closest?.(".oc-ae-dock-tile")) {
      try {
        hit = this.doc.elementsFromPoint(x, y).find((el) => !this.root.contains(el) && !el.classList?.contains("drop-block-overlay")) ?? top0;
      } catch {
      }
    }
    const tileEl = hit?.closest?.(".oc-ae-dock-tile");
    if (tileEl && this.compassRegion) {
      // ae-dock-step14: 方块命中时高亮方块本身，并记日志便于排查
      let t;
      try {
        t = this.ocTileTarget(tileEl.dataset.zone);
      } catch (error) {
        this.logService?.warn?.("[OpenCode] ae tile target failed", error);
      }
      if (t) t.zone = tileEl.dataset.zone;
      const key = tileEl.dataset.zone + "|" + this.dragKind + "|" + (t ? t.type : "none");
      if (this.ocLastTileLog !== key) {
        this.ocLastTileLog = key;
        this.logService?.info?.("[OpenCode] ae tile hover " + key);
      }
      return t;
    }
    if (!hit || this.root.contains(hit)) return void 0;
    const t0 = this.ocComputeHoverTarget(e, hit);
    return t0;
  }
  // ae-dock-step13: 方块固定在窗口正中间（整窗含义：左=侧栏 右=右侧栏 下=底部面板 上=编辑区上方 中=作为页面 圆=弹出），不再跟随悬停区域
  ocPlaceCompass(_region) {
    if (this.compassRegion?.kind === "window" && this.compass?.style.display === "block") return;
    this.ocShowWindowCompass();
  }
  ocShowWindowCompass() {
    const c = this.compass;
    if (!c) return;
    const wb = this.doc.querySelector(".monaco-workbench");
    if (!wb) return;
    const r = wb.getBoundingClientRect();
    this.compassRegion = { kind: "window", el: wb };
    c.style.display = "block";
    c.style.left = r.left + r.width / 2 + "px";
    c.style.top = r.top + r.height / 2 + "px";
    delete c.dataset.nofloat;
  }
  ocGroupTarget(group2, groupEl, side) {
    if (this.dragKind === "editor") {
      const d = this.draggedEditor();
      if (!d) return void 0;
      if (d.source.id === group2.id && (side === "center" || d.source.count <= 1)) return void 0;
    }
    const r = groupEl.getBoundingClientRect();
    const rect = side === "left" ? [r.left, r.top, r.width / 2, r.height] : side === "right" ? [r.left + r.width / 2, r.top, r.width / 2, r.height] : side === "top" ? [r.left, r.top, r.width, r.height / 2] : side === "bottom" ? [r.left, r.top + r.height / 2, r.width, r.height / 2] : [r.left, r.top, r.width, r.height];
    const label = side === "center" ? "\u653E\u8FDB\u8FD9\u4E2A\u533A\u57DF" : { left: "\u5728\u5DE6\u4FA7\u62C6\u5206", right: "\u5728\u53F3\u4FA7\u62C6\u5206", top: "\u5728\u4E0A\u65B9\u62C6\u5206", bottom: "\u5728\u4E0B\u65B9\u62C6\u5206" }[side];
    return { type: "group", group: group2, side, rect, label };
  }
  ocLocationRect(location) {
    const el = this.partElement(location);
    if (el) {
      const r = el.getBoundingClientRect();
      return { rect: [r.left, r.top, r.width, r.height], el };
    }
    const wb = this.doc.querySelector(".monaco-workbench");
    const wr = wb.getBoundingClientRect();
    const rect = location === 0 ? [wr.left, wr.top, wr.width * 0.22, wr.height] : location === 2 ? [wr.right - wr.width * 0.22, wr.top, wr.width * 0.22, wr.height] : [wr.left, wr.bottom - wr.height * 0.28, wr.width, wr.height * 0.28];
    return { rect, el: void 0 };
  }
  ocTileTarget(zone) {
    const reg = this.compassRegion;
    if (!reg) return void 0;
    if (zone === "float") {
      const cr = this.compass.getBoundingClientRect();
      return { type: "float", rect: [cr.left - 40, cr.top - 40, cr.width + 80, cr.height + 80], label: "\u5F39\u51FA\u4E3A\u72EC\u7ACB\u7A97\u53E3" };
    }
    if (reg.kind === "window") {
      if (zone === "page" || zone === "top") {
        const g = this.editorGroupsService.activeGroup;
        const gEl = g?.element;
        return g && gEl ? this.ocGroupTarget(g, gEl, zone === "page" ? "center" : "top") : void 0;
      }
      const wloc = zone === "left" ? 0 : zone === "right" ? 2 : 1;
      const winfo = this.ocLocationRect(wloc);
      const pt = this.makePartTarget(wloc, winfo.rect, winfo.el);
      if (pt || this.dragKind !== "editor") return pt;
      // 普通编辑器页面（代码文件、MCP 设置页等）进不了侧栏：左/右/下改为在编辑区那一侧拆分
      const g2 = this.editorGroupsService.activeGroup;
      return g2?.element ? this.ocGroupTarget(g2, g2.element, zone) : void 0;
    }
    if (reg.kind === "group") {
      if (!reg.group.element?.isConnected) return void 0;
      return this.ocGroupTarget(reg.group, reg.el, zone === "page" ? "center" : zone);
    }
    if (zone === "page") {
      const r = reg.el.getBoundingClientRect();
      return this.makePartTarget(reg.location, [r.left, r.top, r.width, r.height], reg.el);
    }
    if (zone === "top") {
      const g = this.editorGroupsService.activeGroup;
      const gEl = g?.element;
      return g && gEl ? this.ocGroupTarget(g, gEl, "top") : void 0;
    }
    const loc = zone === "left" ? 0 : zone === "right" ? 2 : 1;
    const info = this.ocLocationRect(loc);
    return this.makePartTarget(loc, info.rect, info.el);
  }
  ocComputeHoverTarget(e, hit) {
    const x = e.clientX, y = e.clientY;
    const kind = this.dragKind;
    // 原生排序区：编辑器标签栏（拖标签）、活动栏/面板标签栏/视图标题（拖视图）照常交给原有逻辑
    if (kind === "editor" && hit.closest(".tabs-and-actions-container, .title.tabs, .editor-group-watermark-letterpress")) {
      this.ocPlaceCompass(void 0);
      return void 0;
    }
    if ((kind === "view" || kind === "composite") && hit.closest(".composite-bar, .activitybar, .pane-header")) {
      this.ocPlaceCompass(void 0);
      return void 0;
    }
    const wb = hit.closest(".monaco-workbench");
    if (!wb) return void 0;
    const wr = wb.getBoundingClientRect();
    // 窗口边缘 18px：对应位置的侧栏/面板被隐藏时，也能停靠过去
    const edge = 18;
    const edgeZone = x - wr.left < edge ? "left" : wr.right - x < edge ? "right" : wr.bottom - y < edge + 22 && wr.bottom - y > 22 ? "bottom" : void 0;
    if (edgeZone && kind !== "editor") {
      const location = this.zoneLocation(edgeZone);
      if (!this.partElement(location)) {
        const rect = edgeZone === "left" ? [wr.left, wr.top, wr.width * 0.22, wr.height] : edgeZone === "right" ? [wr.right - wr.width * 0.22, wr.top, wr.width * 0.22, wr.height] : [wr.left, wr.bottom - wr.height * 0.28, wr.width, wr.height * 0.28];
        return this.makePartTarget(location, rect);
      }
    }
    const groupEl = hit.closest(".editor-group-container");
    if (groupEl) {
      const group2 = this.editorGroupsService.getGroups(1).find((g) => g.element === groupEl || g.element?.contains?.(groupEl));
      if (!group2) return void 0;
      this.ocPlaceCompass({ kind: "group", group: group2, el: groupEl });
      const r = groupEl.getBoundingClientRect();
      const fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
      const m = Math.min(fx, 1 - fx, fy, 1 - fy);
      let side = "center";
      if (m < 0.25) side = m === fx ? "left" : m === 1 - fx ? "right" : m === fy ? "top" : "bottom";
      if (kind === "editor") {
        const d = this.draggedEditor();
        if (!d) return void 0;
        if (d.source.id === group2.id && (side === "center" || d.source.count <= 1)) return void 0;
      }
      const rect = side === "left" ? [r.left, r.top, r.width / 2, r.height] : side === "right" ? [r.left + r.width / 2, r.top, r.width / 2, r.height] : side === "top" ? [r.left, r.top, r.width, r.height / 2] : side === "bottom" ? [r.left, r.top + r.height / 2, r.width, r.height / 2] : [r.left, r.top, r.width, r.height];
      const label = side === "center" ? "\u653E\u8FDB\u8FD9\u4E2A\u533A\u57DF" : { left: "\u5728\u5DE6\u4FA7\u62C6\u5206", right: "\u5728\u53F3\u4FA7\u62C6\u5206", top: "\u5728\u4E0A\u65B9\u62C6\u5206", bottom: "\u5728\u4E0B\u65B9\u62C6\u5206" }[side];
      return { type: "group", group: group2, side, rect, label };
    }
    const partEl = hit.closest(".part.sidebar, .part.panel, .part.auxiliarybar");
    if (partEl) {
      const location = this.partLocation(partEl);
      if (location === void 0) return void 0;
      this.ocPlaceCompass({ kind: "part", location, el: partEl });
      const r = partEl.getBoundingClientRect();
      const pt = this.makePartTarget(location, [r.left, r.top, r.width, r.height], partEl);
      if (pt || kind !== "editor") return pt;
      // 普通编辑器页面拖到侧栏/面板区域：和方块一致，改为在编辑区靠这一侧拆分
      const ag = this.editorGroupsService.activeGroup;
      const side0 = location === 1 ? "bottom" : this.zoneLocation("left") === location ? "left" : "right";
      return ag?.element ? this.ocGroupTarget(ag, ag.element, side0) : void 0;
    }
    return this.ocEmptySlotTarget(x, y, hit, wb);
  }
  makePartTarget(location, rect, partEl) {
    const kind = this.dragKind;
    const name = location === 0 ? "\u505C\u9760\u5230\u4FA7\u680F" : location === 1 ? "\u505C\u9760\u5230\u5E95\u90E8\u9762\u677F" : "\u505C\u9760\u5230\u53F3\u4FA7\u680F";
    if (kind === "editor") {
      const d = this.draggedEditor();
      if (!d || !(d.editor instanceof OpenCodeViewEditorInput || d.editor instanceof WebviewInput)) return void 0;
    }
    if (kind === "view" || kind === "composite") {
      const domEntry = ocDomDockEntryFor(this.dragId);
      if (domEntry && partEl && partEl.contains(domEntry.home)) {
        const pane = domEntry.home.closest(".pane") ?? partEl;
        const pr = pane.getBoundingClientRect();
        return { type: "home", entry: domEntry, rect: [pr.left, pr.top, pr.width, pr.height], label: "\u653E\u56DE\u804A\u5929" };
      }
      if (this.draggedViewLocation() === location) {
        // 原来的位置已在拖动中临时收起：靠回原边缘就显示「放回原位」
        if (!partEl && (this.ocTempHidden ?? []).includes(OC_PART_IDS[location])) return { type: "part", location, rect, label: "\u653E\u56DE\u539F\u4F4D", restoreOnly: true };
        return void 0;
      }
    }
    if (kind === "dom" && partEl) {
      const info = globalThis.__ocDomDockDrag;
      if (info?.home && partEl.contains(info.home)) {
        if (!info.element?.dataset?.ocDocked) return void 0;
        const pane = info.home.closest(".pane") ?? partEl;
        const pr = pane.getBoundingClientRect();
        return { type: "home", entry: info, rect: [pr.left, pr.top, pr.width, pr.height], label: "\u653E\u56DE\u804A\u5929" };
      }
    }
    return { type: "part", location, rect, label: name };
  }
  setTarget(target) {
    this.target = target;
    try {
      for (const tile of this.compass?.children ?? []) tile.classList.toggle("active", !!target && target.zone === tile.dataset.zone);
    } catch {
    }
    if (!target || !target.rect) {
      this.preview.classList.remove("visible");
      this.label.classList.remove("visible");
      return;
    }
    const [l, t, w, h] = target.rect;
    Object.assign(this.preview.style, { left: l + 3 + "px", top: t + 3 + "px", width: Math.max(0, w - 6) + "px", height: Math.max(0, h - 6) + "px" });
    this.preview.classList.add("visible");
    this.label.textContent = target.label ?? "";
    if (target.zone && this.compass?.style.display === "block") {
      // 方块命中时提示文字放到方块下方，不被方块挡住
      const cr = this.compass.getBoundingClientRect();
      Object.assign(this.label.style, { left: cr.left + cr.width / 2 + "px", top: cr.bottom + 14 + "px", transform: "translateX(-50%)" });
    } else {
      Object.assign(this.label.style, { left: l + w / 2 + "px", top: t + h / 2 - 12 + "px", transform: "translateX(-50%)" });
    }
    this.label.classList.add("visible");
  }
  groupFor(target) {
    if (target.side === "center") return target.group;
    return this.editorGroupsService.addGroup(target.group, { top: 0, bottom: 1, left: 2, right: 3 }[target.side]);
  }
  apply(target) {
    const kind = this.dragKind;
    if (target.type === "home") {
      const viewId = target.entry.viewId ?? ocDomDockViewId(target.entry.id);
      ocDomUndock(this, viewId, true);
      return;
    }
    if (kind === "dom") {
      const info = globalThis.__ocDomDockDrag;
      globalThis.__ocDomDockDrag = void 0;
      if (!info) return;
      const place = target.type === "float" ? { float: true } : target.type === "part" ? { location: target.location } : { group: this.groupFor(target) };
      ocDomDock(this, info, place).catch((error) => this.logService?.warn?.("[OpenCode] dom dock failed", error));
      return;
    }
    if (kind === "editor") {
      const d = this.draggedEditor();
      if (!d) return;
      const { source, editor } = d;
      if (target.type === "float") {
        if (editor instanceof OpenCodeViewEditorInput) {
          // OpenCode p26: 视图页拖到浮窗时也用窗内浮动面板，不再弹独立窗口；拿不到容器时才退回独立窗口
          const ocCid = editor.containerId ?? (editor.viewId && !String(editor.viewId).startsWith("part:") ? this.viewDescriptorService.getViewContainerByViewId(editor.viewId)?.id : void 0);
          if (ocCid && typeof ocAeFloatContainer === "function") {
            Promise.resolve(source.closeEditor(editor)).then(() => ocAeFloatContainer(this, ocCid)).then((ok) => ok || ocReopenViewPage(this, editor, AUX_WINDOW_GROUP)).catch((error) => {
              this.logService?.warn?.("[OpenCode] page in-window float failed", error);
              ocReopenViewPage(this, editor, AUX_WINDOW_GROUP);
            });
          } else {
            ocReopenViewPage(this, editor, AUX_WINDOW_GROUP);
          }
        } else {
          Promise.resolve(source.openEditor(editor)).then(() => this.commandService.executeCommand("workbench.action.moveEditorToNewWindow")).catch((error) => this.logService?.warn?.("[OpenCode] page float failed", error));
        }
        return;
      }
      if (target.type === "group" && editor instanceof OpenCodeViewEditorInput && target.group.id !== source.id) {
        const dest0 = this.groupFor(target);
        if (dest0.windowId === source.windowId) {
          source.moveEditor(editor, dest0);
          this.editorGroupsService.activateGroup(dest0);
        } else {
          ocReopenViewPage(this, editor, dest0);
        }
        return;
      }
      if (target.type === "group") {
        const dest = this.groupFor(target);
        if (dest.id !== source.id) source.moveEditor(editor, dest);
        this.editorGroupsService.activateGroup(dest);
        return;
      }
      if (target.type === "part") {
        if (editor instanceof OpenCodeViewEditorInput) {
          const viewId = editor.viewId, containerId = editor.containerId;
          Promise.resolve(source.closeEditor(editor)).then(() => containerId ? this.moveContainerToLocationAndOpen(containerId, target.location) : this.moveViewToLocationAndOpen(viewId, target.location)).catch((error) => this.logService?.warn?.("[OpenCode] view page re-dock failed", error));
        } else {
          ocDockPageToLocation(this, source, editor, target.location).catch((error) => this.logService?.warn?.("[OpenCode] page dock failed", error));
        }
      }
      return;
    }
    const id = this.dragId;
    if (!id) return;
    const pageViewId = ocPageDockViewIdFrom(id);
    const isWebPage = pageViewId && OC_PAGE_DOCK.has(pageViewId);
    if (target.type === "float") {
      if (isWebPage) {
        // OpenCode ae-float-p16: 网页类页面也浮成窗内面板
        const pc = this.viewDescriptorService.getViewContainerByViewId(pageViewId)?.id;
        (pc ? ocAeFloatContainer(this, pc) : Promise.resolve(false)).then((ok) => ok || ocUndockPage(this, pageViewId, AUX_WINDOW_GROUP)).catch(() => ocUndockPage(this, pageViewId, AUX_WINDOW_GROUP).catch(() => void 0));
      }
      else this.floatOut(id, kind);
      return;
    }
    if (target.type === "group") {
      const dest = this.groupFor(target);
      if (isWebPage) {
        ocUndockPage(this, pageViewId, dest).catch((error) => this.logService?.warn?.("[OpenCode] page undock failed", error));
      } else if (!this.openViewAsPage(id, kind, dest)) {
        if (dest !== target.group && dest.isEmpty) this.editorGroupsService.removeGroup(dest);
        this.notificationService?.info?.("\u8FD9\u4E2A\u9762\u677F\u5305\u542B\u591A\u4E2A\u89C6\u56FE\uFF0C\u8BF7\u62D6\u52A8\u5176\u4E2D\u5355\u4E2A\u89C6\u56FE\u7684\u6807\u9898\u3002");
      }
      return;
    }
    if (target.type === "part" && target.restoreOnly) {
      const part = OC_PART_IDS[target.location];
      this.ocTempHidden = (this.ocTempHidden ?? []).filter((p2) => p2 !== part);
      this.layoutService.setPartHidden(false, part);
      return;
    }
    if (target.type === "part" && OC_PART_PAGES.has(OC_PART_IDS[target.location])) {
      ocClosePartPage(this, OC_PART_IDS[target.location]);
    }
    if (target.type === "part") {
      if (kind === "view") {
        this.moveViewToLocationAndOpen(id, target.location);
      } else {
        const viewContainer = this.viewDescriptorService.getViewContainerById(id);
        if (!viewContainer) return;
        ocSetContainerPaged(viewContainer.id, false);
        if (this.viewDescriptorService.getViewContainerLocation(viewContainer) !== target.location) {
          this.viewDescriptorService.moveViewContainerToLocation(viewContainer, target.location, void 0, "dnd");
        }
        this.viewsService.openViewContainer(viewContainer.id, true).catch(() => void 0);
      }
    }
  }
  moveContainerToLocationAndOpen(containerId, location) {
    const vc = this.viewDescriptorService.getViewContainerById(containerId);
    if (!vc) return;
    ocSetContainerPaged(containerId, false);
    if (this.viewDescriptorService.getViewContainerLocation(vc) !== location) this.viewDescriptorService.moveViewContainerToLocation(vc, location, void 0, "dnd");
    this.viewsService.openViewContainer(vc.id, true).catch(() => void 0);
  }
  moveViewToLocationAndOpen(viewId, location) {
    const descriptor = this.viewDescriptorService.getViewDescriptorById(viewId);
    if (!descriptor) return;
    const ownC = this.viewDescriptorService.getViewContainerByViewId(viewId);
    if (ownC) ocSetContainerPaged(ownC.id, false);
    if (this.viewDescriptorService.getViewLocationById(viewId) !== location && descriptor.canMoveView === false && ownC) {
      // 这个视图不能单独移动（比如「运行和调试」）：整组一起移过去
      this.moveContainerToLocationAndOpen(ownC.id, location);
      return;
    }
    if (this.viewDescriptorService.getViewLocationById(viewId) !== location && descriptor.canMoveView !== false) {
      this.viewDescriptorService.moveViewToLocation(descriptor, location, "dnd");
    }
    ocSetViewVisibleInContainer(this.viewDescriptorService, viewId, true);
    this.viewsService.openView(viewId, true).catch(() => void 0);
  }
  // OpenCode ae-dock-step11: 拖动视图离开它所在的侧栏/面板时，如果那里只剩它自己，立刻临时收起（AE 式），
  // 需要放回时靠近原来的窗口边缘才出现蓝框；取消拖动则恢复。
  ocCollapseSourceParts(e) {
    // ae-dock-p20: 拖动中不再临时收起来源侧栏/面板。收起会把拖动源（标签/图标）从页面移走，
    // 浏览器随之丢失 dragend、罗盘失效，原位置也拖不回去；空出来的区域改由放下后的 hideEmptyParts 收掉。
    return;
    if (this.dragKind !== "view" && this.dragKind !== "composite") return;
    const now = Date.now();
    if (this.ocCollapseAt && now - this.ocCollapseAt < 80) return;
    this.ocCollapseAt = now;
    const hit = this.doc.elementFromPoint(e.clientX, e.clientY);
    const hoveredLoc = this.partLocation(hit?.closest?.(".part.sidebar, .part.panel, .part.auxiliarybar"));
    this.ocHoveredLoc = hoveredLoc;
    const vds = this.viewDescriptorService;
    for (const loc of [0, 1, 2]) {
      if (loc === hoveredLoc) continue;
      const part = OC_PART_IDS[loc];
      try {
        if (!this.layoutService.isVisible(part)) continue;
        const domEmpty = !!this.partElement(loc)?.classList.contains("empty");
        const others = !domEmpty && vds.getViewContainersByLocation(loc).some((c) => c.id !== this.dragId && vds.getViewContainerModel(c).visibleViewDescriptors.some((d) => d.id !== this.dragId));
        if (others) continue;
        this.layoutService.setPartHidden(true, part);
        this.ocTempHidden.push(part);
      } catch {
      }
    }
  }
  // OpenCode ae-dock-step09: 侧栏/右侧栏/底部面板里没有任何视图了就自动收起，不留空白
  ocInstallAutoHide() {
    const check = () => {
      if (this.ocAutoHideTimer) clearTimeout(this.ocAutoHideTimer);
      this.ocAutoHideTimer = setTimeout(() => {
        this.ocAutoHideTimer = 0;
        this.hideEmptyParts();
        // OpenCode ae-dock-step10: 布局动画/延迟注册结束后再查一次，空出来的位置立刻收掉
        setTimeout(() => this.hideEmptyParts(), 600);
      }, 120);
    };
    const vds = this.viewDescriptorService;
    for (const ev of [vds.onDidChangeContainerLocation, vds.onDidChangeLocation, vds.onDidChangeViewContainers]) {
      if (typeof ev === "function") this._register(ev(check));
    }
    this._register(CompositeDragAndDropObserver.INSTANCE.onDragEnd.event(check));
    this.ocCheckEmptyParts = check;
  }
  hideEmptyParts() {
    try {
      this.ocReclaimEmptySlots();
    } catch {
    }
    const parts = ["workbench.parts.sidebar", "workbench.parts.panel", "workbench.parts.auxiliarybar"];
    for (const loc of [0, 1, 2]) {
      const part = parts[loc];
      try {
        if (!this.layoutService.isVisible(part)) continue;
        const vds = this.viewDescriptorService;
        const has = vds.getViewContainersByLocation(loc).some((c) => vds.getViewContainerModel(c).visibleViewDescriptors.length > 0);
        if (!has) this.layoutService.setPartHidden(true, part);
      } catch {
      }
    }
    // 编辑区里拖拽拆分后留下的空分组也一起收掉（至少保留一个）
    try {
      if (this.dragKind) return;
      const svc = this.editorGroupsService;
      const groups = svc.mainPart?.getGroups?.(1) ?? svc.getGroups(1);
      let count = groups.length;
      for (const g of groups) {
        if (count <= 1) break;
        if (g.isEmpty && !g.isLocked) {
          svc.removeGroup(g);
          count--;
        }
      }
    } catch {
    }
  }
  floatOut(id, kind) {
    // OpenCode ae-float-p14: AE 式浮动面板——视图整组搬进一个只带标签头的小浮窗（同一窗口内），不再转成编辑器窗口
    if (!id) return;
    const vcId = kind === "view" ? this.viewDescriptorService.getViewContainerByViewId(id)?.id : id;
    if (vcId) {
      ocAeFloatContainer(this, vcId).then((ok) => {
        if (!ok) this.ocLegacyFloatOut(id, kind);
      }, (error) => {
        this.logService?.warn?.("[OpenCode] ae float panel failed", error);
        this.ocLegacyFloatOut(id, kind);
      });
      return;
    }
    this.ocLegacyFloatOut(id, kind);
  }
  ocLegacyFloatOut(id, kind) {
    if (!id) return;
    let command;
    if (id.startsWith("workbench.panel.chat")) command = "workbench.action.chat.openInNewWindow";
    else if (id === "terminal" || id.startsWith("workbench.panel.terminal")) command = "workbench.action.terminal.moveIntoNewWindow";
    if (!command) {
      this.openViewAsPage(id, kind);
      return;
    }
    this.commandService.executeCommand(command).catch((error) => this.logService?.warn?.("[OpenCode] AE float failed", error));
  }
  openViewAsPage(id, kind, group2 = AUX_WINDOW_GROUP) {
    const vds = this.viewDescriptorService;
    if (kind === "composite" && this.ocBarItemDrag) {
      this.ocBarItemDrag = false;
      try {
        const done = this.ocOpenBarItemPage(id, group2);
        if (done !== void 0) return done;
      } catch (error) {
        this.logService?.warn?.("[OpenCode] bar item page failed", error);
      }
    }
    // OpenCode viewpage-dup-fix: 聊天、终端在原位置的实例无法隐藏，再建一份会重复注册（「页面加载失败…Cannot register…」+ 空白标签）。
    // 改用它们自带的「移到编辑器 / 新窗口」，会话和终端进程原样跟过去。
    // 拖过几次后聊天会被放进自动生成的容器（id 不再是 workbench.panel.chat），所以也按容器里唯一的视图判断
    let nativeId = id;
    try {
      if (kind === "composite") {
        const c0 = vds.getViewContainerById(id);
        const vis0 = c0 ? vds.getViewContainerModel(c0).visibleViewDescriptors : [];
        if (vis0.length === 1) nativeId = vis0[0].id;
      }
    } catch {
    }
    // OpenCode part-page: 侧栏/右侧栏/底部面板和编辑区是同级的。把其中的容器（或聊天、终端这类只能有一份的视图）拖进编辑区，
    // 就把整块区域原样搬过去：上面一排图标、聊天、Bridge 等全部功能都在，原位置同时消失；关掉这个页面就回到原处。
    try {
      const vd0 = vds.getViewDescriptorById(nativeId);
      const loc0 = kind === "composite" ? vds.getViewContainerLocation(vds.getViewContainerById(id)) : vds.getViewLocationById(id);
      const partId0 = OC_PART_IDS[loc0];
      if (partId0 && (kind === "composite" || ocNativePageCommand(nativeId, false) || vd0?.canToggleVisibility === false)) {
        const input0 = OpenCodeViewEditorInput.getOrCreate("part:" + partId0, OC_PART_PAGE_TITLES[partId0]);
        input0.partId = partId0;
        ocPartPageTitle(input0, kind === "composite" ? vds.getViewContainerById(id) : vds.getViewContainerByViewId(nativeId));
        const reveal = kind === "composite" ? this.viewsService.openViewContainer(id, false) : this.viewsService.openView(nativeId, false);
        Promise.resolve(reveal).catch(() => void 0).finally(() => ocReopenViewPage(this, input0, group2));
        return true;
      }
    } catch (error) {
      this.logService?.warn?.("[OpenCode] part page failed", error);
    }
    const native = ocNativePageCommand(nativeId, group2 === AUX_WINDOW_GROUP) ?? ocNativePageCommand(id, group2 === AUX_WINDOW_GROUP);
    if (native) {
      try {
        if (group2 && typeof group2 === "object") this.editorGroupsService.activateGroup(group2);
      } catch {
      }
      this.commandService.executeCommand(native).catch((error) => {
        this.logService?.warn?.("[OpenCode] native move to editor failed", error);
        this.notificationService?.error?.(`\u9875\u9762\u6253\u5F00\u5931\u8D25\uFF1A${error?.message ?? error}`);
      });
      return true;
    }
    let descriptor = kind === "view" ? vds.getViewDescriptorById(id) : void 0;
    if (!descriptor && kind === "composite") {
      const container = vds.getViewContainerById(id);
      const visible = container ? vds.getViewContainerModel(container).visibleViewDescriptors : [];
      if (visible.length === 1) descriptor = visible[0];
    }
    let input;
    if (descriptor && descriptor.ctorDescriptor) {
      input = OpenCodeViewEditorInput.getOrCreate(descriptor.id, descriptor.name?.value);
    } else if (kind === "composite") {
      // ae-dock-step15: 多视图的容器（资源管理器、源代码管理、运行和调试…）整组作为一个页面
      const vc = vds.getViewContainerById(id);
      if (!vc || !vc.ctorDescriptor) return false;
      const t = typeof vc.title === "string" ? vc.title : vc.title?.value;
      input = OpenCodeViewEditorInput.getOrCreate("container:" + vc.id, t, vc.id);
    }
    if (!input) return false;
    ocReopenViewPage(this, input, group2);
    return true;
  }
  // OpenCode bar-item-drag: 只把这一个容器做成页面，同一排的其他图标留在原处。
  // 返回 undefined 表示照旧（这一排只有它自己时，整块搬过去和只搬它是一样的）。
  ocOpenBarItemPage(id, group2) {
    const vds = this.viewDescriptorService;
    const vc = vds.getViewContainerById(id);
    if (!vc) return void 0;
    const loc = vds.getViewContainerLocation(vc);
    if (loc !== 0 && loc !== 1 && loc !== 2) return void 0;
    const paged = globalThis.__ocPagedContainers ?? /* @__PURE__ */ new Set();
    const hasViews = (c) => {
      try {
        return vds.getViewContainerModel(c).visibleViewDescriptors.length > 0;
      } catch {
        return false;
      }
    };
    const siblings = vds.getViewContainersByLocation(loc).filter((c) => c.id !== id && !paged.has(c.id) && hasViews(c));
    if (!siblings.length) return void 0;
    const keepOthers = () => {
      // 原位置换成显示同排的另一个图标，其余图标原样留着
      try {
        if (this.viewsService.getVisibleViewContainer?.(loc)?.id === id) this.viewsService.openViewContainer(siblings[0].id, false).catch(() => void 0);
      } catch {
      }
    };
    const vis = vds.getViewContainerModel(vc).visibleViewDescriptors;
    const singleton = !vc.ctorDescriptor || vis.some((d) => ocNativePageCommand(d.id, false) || d.canToggleVisibility === false);
    this.logService?.info?.("[OpenCode] bar item page " + id + (singleton ? " (singleton)" : ""));
    if (!singleton) {
      const t = typeof vc.title === "string" ? vc.title : vc.title?.value;
      const input = OpenCodeViewEditorInput.getOrCreate("container:" + vc.id, t, vc.id);
      keepOthers();
      ocReopenViewPage(this, input, group2);
      return true;
    }
    // 聊天、终端这类只能有一份的视图：先把这一个容器单独挪到一块空着的区域，再把那块区域整块做成页面（实例不复制，功能都在）
    for (const L of [2, 1, 0]) {
      if (L === loc || OC_PART_PAGES.has(OC_PART_IDS[L])) continue;
      if (vds.getViewContainersByLocation(L).some((c) => c.id !== id && hasViews(c))) continue;
      keepOthers();
      ocSetContainerPaged(vc.id, false);
      vds.moveViewContainerToLocation(vc, L, void 0, "dnd");
      setTimeout(() => {
        try {
          this.openViewAsPage(id, "composite", group2);
        } catch (error) {
          this.logService?.warn?.("[OpenCode] bar item page (isolated) failed", error);
        }
      }, 0);
      return true;
    }
    const native = vis.length === 1 ? ocNativePageCommand(vis[0].id, group2 === AUX_WINDOW_GROUP) : void 0;
    if (native) {
      try {
        if (group2 && typeof group2 === "object") this.editorGroupsService.activateGroup(group2);
      } catch {
      }
      this.commandService.executeCommand(native).catch((error) => this.logService?.warn?.("[OpenCode] native move to editor failed", error));
      return true;
    }
    return void 0;
  }
  // OpenCode empty-slot-drop: 鼠标在窗口里、却不在任何编辑器分组或侧栏/面板上（例如右边原来右侧栏留下的空白），
  // 按它在编辑区的哪一侧决定：停靠到那一侧的侧栏/面板，普通编辑器标签则在编辑区那一侧拆分。蓝框画在这块空白上。
  ocEmptySlotTarget(x, y, hit, wb) {
    if (!hit || !wb) return void 0;
    if (hit.closest(".part.titlebar, .part.statusbar, .part.activitybar, .part.banner, .monaco-sash, .oc-ae-float")) return void 0;
    const editorEl = wb.querySelector(".part.editor");
    if (!editorEl) return void 0;
    const er = editorEl.getBoundingClientRect(), wr = wb.getBoundingClientRect();
    let side;
    if (x >= er.right) side = "right";
    else if (x <= er.left) side = "left";
    else if (y >= er.bottom) side = "bottom";
    else return void 0;
    let rect;
    const slot = hit.closest(".split-view-view");
    if (slot && !slot.contains(editorEl) && !slot.querySelector(".part")) {
      const sr = slot.getBoundingClientRect();
      if (sr.width > 8 && sr.height > 8) rect = [sr.left, sr.top, sr.width, sr.height];
    }
    if (!rect) {
      rect = side === "right" ? [er.right, er.top, wr.right - er.right, er.height] : side === "left" ? [wr.left, er.top, er.left - wr.left, er.height] : [er.left, er.bottom, er.width, wr.bottom - er.bottom];
      if (rect[2] < 8 || rect[3] < 8) return void 0;
    }
    const location = side === "bottom" ? 1 : this.zoneLocation(side);
    const pt = this.makePartTarget(location, rect, void 0);
    if (pt) return pt;
    if (this.dragKind !== "editor") return void 0;
    // 普通编辑器标签：取离这块空白最近的分组，在它那一侧拆分
    let best, bd = Infinity;
    for (const g of this.editorGroupsService.getGroups(1)) {
      const el = g.element;
      if (!el?.isConnected || !wb.contains(el)) continue;
      const r = el.getBoundingClientRect();
      const d = side === "right" ? x - r.right : side === "left" ? r.left - x : y - r.bottom;
      const ov = side === "bottom" ? x < r.left || x > r.right : y < r.top || y > r.bottom;
      const score = d + (ov ? 1e5 : 0);
      if (d >= -2 && score < bd) {
        bd = score;
        best = g;
      }
    }
    if (!best) return void 0;
    const gt = this.ocGroupTarget(best, best.element, side);
    if (gt) gt.rect = rect;
    return gt;
  }
  // OpenCode empty-slot-reclaim: 页面打开期间它原来的网格槽位被重新显示出来（边缘吸附拖出、恢复布局等）就立即收回给编辑区
  ocReclaimEmptySlots() {
    if (this.dragKind) return;
    for (const rec of OC_PART_PAGES.values()) {
      try {
        if (rec.ls?.workbenchGrid?.isViewVisible?.(rec.view)) ocReclaimPartSlot(rec);
      } catch {
      }
    }
  }
  moveViewIdTo(viewId, zone) {
    this.moveViewToLocationAndOpen(viewId, this.zoneLocation(zone));
  }
  zoneLocation(zone) {
    const sideBarLeft = (this.layoutService.getSideBarPosition?.() ?? 0) === 0;
    return zone === "left" ? (sideBarLeft ? 0 : 2) : zone === "right" ? (sideBarLeft ? 2 : 0) : 1;
  }
};
OpenCodeAeDockGuide = __decorateClass([
  __decorateParam(0, IViewDescriptorService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IViewsService)
], OpenCodeAeDockGuide);
registerWorkbenchContribution2(OpenCodeAeDockGuide.ID, OpenCodeAeDockGuide, WorkbenchPhase.AfterRestored);

// OpenCode ae-dock-step05: 网页类页面（任务、MCP、模型提供商等扩展页面）可停靠进侧栏、右侧栏或底部面板。
var OC_PAGE_DOCK = /* @__PURE__ */ new Map();
var OC_PAGE_DOCK_VIEW_CLASS;
function ocPageDockViewClass() {
  if (OC_PAGE_DOCK_VIEW_CLASS) return OC_PAGE_DOCK_VIEW_CLASS;
  OC_PAGE_DOCK_VIEW_CLASS = class OpenCodePageDockView extends ViewPane {
    renderBody(container) {
      super.renderBody(container);
      const anchor = container.ownerDocument.createElement("div");
      anchor.className = "oc-page-dock-anchor";
      anchor.style.cssText = "width:100%;height:100%;";
      container.appendChild(anchor);
      this.ocAnchor = anchor;
      this._register(this.onDidChangeBodyVisibility((visible) => visible ? this.ocClaim() : this.ocRelease()));
      this.ocClaim();
    }
    ocEntry() {
      return OC_PAGE_DOCK.get(this.id);
    }
    ocClaim() {
      const entry = this.ocEntry();
      if (!entry || !this.ocAnchor || !this.ocAnchor.isConnected || !this.isBodyVisible()) return;
      try {
        const win = this.ocAnchor.ownerDocument.defaultView;
        entry.input.claim(this, win, this.scopedContextKeyService);
        entry.input.webview.setAnchorElement(this.ocAnchor, this.ocAnchor.closest(".part") ?? void 0);
        entry.owner = this;
      } catch {
      }
    }
    ocRelease() {
      const entry = this.ocEntry();
      try {
        entry?.input.webview?.release(this);
      } catch {
      }
    }
    layoutBody(height, width2) {
      super.layoutBody(height, width2);
      if (this.ocAnchor) this.ocAnchor.style.height = height + "px";
      if (this.ocAnchor && !this.ocAnchor.isConnected) return;
      this.ocClaim();
    }
    focus() {
      super.focus();
      try {
        this.ocEntry()?.input.webview?.focus();
      } catch {
      }
    }
    dispose() {
      this.ocRelease();
      super.dispose();
    }
  };
  return OC_PAGE_DOCK_VIEW_CLASS;
}
async function ocDockPageToLocation(guide, source, editor, location) {
  if (!(editor instanceof WebviewInput) || !editor.webview) {
    guide.notificationService?.info?.("\u76EE\u524D\u53EA\u6709\u7F51\u9875\u7C7B\u9875\u9762\uFF08\u4EFB\u52A1\u3001MCP\u3001\u6A21\u578B\u63D0\u4F9B\u5546\u7B49\uFF09\u80FD\u505C\u9760\u5230\u4FA7\u680F\u6216\u9762\u677F\uFF1B\u4EE3\u7801\u6587\u4EF6\u8BF7\u7528\u7F57\u76D8\u4E2D\u5FC3\u56DB\u8FB9\u62C6\u5206\u3002");
    return;
  }
  const n = Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const viewId = `opencode.pageDock.${n}`;
  const containerId = `opencode.pageDockC.${n}`;
  const name = editor.getName() || "\u9875\u9762";
  // 关闭编辑器标签但保住网页本体（扩展那边的面板不会被销毁）
  editor.dispose = () => {
  };
  try {
    await source.closeEditor(editor, { preserveFocus: true });
  } finally {
    delete editor.dispose;
  }
  if (editor.isDisposed()) return;
  OC_PAGE_DOCK.set(viewId, { input: editor, containerId });
  const title = { value: name, original: name };
  const containers = Registry.as(Extensions13.ViewContainersRegistry);
  const container = containers.registerViewContainer({
    id: containerId,
    title,
    icon: defaultViewIcon,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [containerId, { mergeViewWithContainerWhenSingleView: true }]),
    storageId: containerId,
    hideIfEmpty: true,
    order: 1e3
  }, location);
  Registry.as(Extensions13.ViewsRegistry).registerViews([{
    id: viewId,
    name: title,
    containerIcon: defaultViewIcon,
    ctorDescriptor: new SyncDescriptor(ocPageDockViewClass()),
    canToggleVisibility: false,
    canMoveView: true,
    weight: 100,
    order: 1
  }], container);
  await guide.viewsService.openView(viewId, true);
}
async function ocUndockPage(guide, viewId, group2) {
  const entry = OC_PAGE_DOCK.get(viewId);
  if (!entry) return false;
  OC_PAGE_DOCK.delete(viewId);
  try {
    entry.input.webview?.release(entry.owner);
  } catch {
  }
  const containers = Registry.as(Extensions13.ViewContainersRegistry);
  const container = containers.get(entry.containerId);
  const descriptor = guide.viewDescriptorService.getViewDescriptorById(viewId);
  try {
    if (descriptor && container) Registry.as(Extensions13.ViewsRegistry).deregisterViews([descriptor], container);
    if (container) containers.deregisterViewContainer(container);
  } catch (error) {
    guide.logService?.warn?.("[OpenCode] page undock cleanup failed", error);
  }
  await guide.editorService.openEditor(entry.input, { pinned: true }, group2);
  return true;
}
function ocPageDockViewIdFrom(id) {
  if (!id) return void 0;
  if (id.startsWith("opencode.pageDock.")) return id;
  if (id.startsWith("opencode.pageDockC.")) return "opencode.pageDock." + id.slice("opencode.pageDockC.".length);
  for (const viewId of OC_PAGE_DOCK.keys()) {
    try {
      const c = OC_PAGE_DOCK_GUIDE?.viewDescriptorService.getViewContainerByViewId(viewId);
      if (c?.id === id) return viewId;
    } catch {
    }
  }
  return void 0;
}
var OC_PAGE_DOCK_GUIDE;

// OpenCode ae-dock-step04: 侧栏/面板视图可变成「页面」——放进编辑区、拆分停靠或弹出为独立窗口；
// 页面化的视图再拖到罗盘四边即可还原为侧栏/面板视图。
var OC_VIEW_PAGE_HIDDEN_KEY = "opencode.viewPage.hiddenViews";
function ocNativePageCommand(id, toWindow) {
  if (!id) return void 0;
  if (id.startsWith("workbench.panel.chat")) return toWindow ? "workbench.action.chat.openInNewWindow" : "workbench.action.chat.openInEditor";
  if (id === "terminal" || id.startsWith("workbench.panel.terminal")) return toWindow ? "workbench.action.terminal.moveIntoNewWindow" : "workbench.action.terminal.moveToEditor";
  return void 0;
}
function ocReadViewPageHidden() {
  try {
    const v = JSON.parse(globalThis.localStorage?.getItem(OC_VIEW_PAGE_HIDDEN_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function ocWriteViewPageHidden(ids) {
  try {
    globalThis.localStorage?.setItem(OC_VIEW_PAGE_HIDDEN_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
  }
}
function ocSetViewVisibleInContainer(viewDescriptorService, viewId, visible) {
  const container = viewDescriptorService.getViewContainerByViewId(viewId);
  if (!container) return false;
  const model = viewDescriptorService.getViewContainerModel(container);
  try {
    model.setVisible(viewId, visible);
    return true;
  } catch {
    return false;
  }
}
var OpenCodeViewEditorInput = class _OpenCodeViewEditorInput extends EditorInput {
  static {
    this.ID = "workbench.input.opencodeViewPage";
  }
  static {
    this.instances = /* @__PURE__ */ new Map();
  }
  static getOrCreate(viewId, name, containerId) {
    let input = _OpenCodeViewEditorInput.instances.get(viewId);
    if (!input || input.isDisposed()) {
      input = new _OpenCodeViewEditorInput(viewId, name);
      input.containerId = containerId;
      _OpenCodeViewEditorInput.instances.set(viewId, input);
    }
    return input;
  }
  constructor(viewId, name) {
    super();
    this.viewId = viewId;
    this.viewName = name || viewId;
    this.resource = void 0;
  }
  get typeId() {
    return _OpenCodeViewEditorInput.ID;
  }
  get capabilities() {
    return super.capabilities | 8 /* Singleton */;
  }
  getName() {
    return this.viewName;
  }
  matches(other) {
    return other instanceof _OpenCodeViewEditorInput && other.viewId === this.viewId;
  }
};
// OpenCode p44b: 单个视图做成页面时的窗格标题样式（等同侧栏里的 22px 小标题；页面里不能折叠，隐藏折叠箭头与容器图标）。
var OC_VIEW_PAGE_CSS = `
.oc-view-page-host>.pane.oc-view-page-pane{display:flex;flex-direction:column;overflow:hidden}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-header{flex:none;display:flex;align-items:center;height:22px;min-height:22px;box-sizing:border-box;padding:0 8px 0 12px;overflow:hidden;font-size:11px;font-weight:700;cursor:default;color:var(--vscode-sideBarSectionHeader-foreground,var(--vscode-foreground));background:var(--vscode-sideBarSectionHeader-background,transparent);border-top:1px solid var(--vscode-sideBarSectionHeader-border,transparent)}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-header.hidden{display:none!important}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-header>.twisty-container,.oc-view-page-host>.pane.oc-view-page-pane>.pane-header>.icon{display:none!important}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-header h3.title{flex:0 1 auto;min-width:0;margin:0;font-size:11px;font-weight:700;line-height:22px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-header>.actions{margin-left:auto;display:flex;align-items:center}
.oc-view-page-host>.pane.oc-view-page-pane>.pane-body{flex:1 1 auto;min-height:0;overflow:hidden}
`;
function ocViewPageStyle(doc) {
  if (!doc || doc.getElementById("oc-view-page-style")) return;
  const style = doc.createElement("style");
  style.id = "oc-view-page-style";
  style.textContent = OC_VIEW_PAGE_CSS;
  doc.head.appendChild(style);
}
var OpenCodeViewEditorPane = class _OpenCodeViewEditorPane extends EditorPane {
  static {
    this.ID = "workbench.editor.opencodeViewPage";
  }
  constructor(group2, telemetryService, themeService, storageService, instantiationService, viewDescriptorService, logService, viewsService, notificationService) {
    super(_OpenCodeViewEditorPane.ID, group2, telemetryService, themeService, storageService);
    this.viewsService = viewsService;
    this.notificationService = notificationService;
    this.instantiationService = instantiationService;
    this.viewDescriptorService = viewDescriptorService;
    this.logService = logService;
    this.viewPane = void 0;
    this.viewId = void 0;
  }
  createEditor(parent) {
    this.host = parent.ownerDocument.createElement("div");
    this.host.className = "oc-view-page-host";
    ocViewPageStyle(parent.ownerDocument);
    this.host.style.cssText = "width:100%;height:100%;overflow:hidden;display:flex;flex-direction:column";
    parent.appendChild(this.host);
    // OpenCode part-page-relayout: 页面区域大小一变（拖分隔条、侧栏收起、窗口缩放）就按真实宽高重排搬进来的区域，避免空白/挤在左边/右侧留空
    try {
      const win = parent.ownerDocument.defaultView ?? globalThis;
      this.ocHostRO = new win.ResizeObserver(() => {
        if (this.partRec) ocLayoutPartRec(this.partRec, void 0, false);
      });
      this.ocHostRO.observe(this.host);
    } catch {
    }
  }
  // OpenCode free-size: 页面类编辑器（含搬进来的侧栏/聊天）不再要求 220px 最小宽度，只保留能抓住的 80px
  get minimumWidth() {
    return 80;
  }
  get minimumHeight() {
    return 80;
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (this.viewId === input.viewId && (this.viewPane || this.containerPane || this.partRec)) return;
    this.disposeViewPane(true);
    if (input.partId) {
      this.renderPart(input);
      return;
    }
    if (input.containerId) {
      this.renderContainer(input);
      return;
    }
    const descriptor = this.viewDescriptorService.getViewDescriptorById(input.viewId);
    if (!descriptor) return;
    const nativeCmd = ocNativePageCommand(descriptor.id, false);
    if (nativeCmd) {
      // 兜底：无论从哪条路进来，聊天/终端都不再复制一份，改走自带的「移到编辑器」
      this.ocAbandonPage(input, void 0);
      OC_PAGE_DOCK_GUIDE?.commandService?.executeCommand(nativeCmd)?.catch?.((error) => this.logService?.warn?.("[OpenCode] native move to editor failed", error));
      return;
    }
    const hidden = ocSetViewVisibleInContainer(this.viewDescriptorService, descriptor.id, false);
    if (!hidden && descriptor.canToggleVisibility === false && this.viewsService.getViewWithId?.(descriptor.id)) {
      // 原位置的实例藏不掉：不再造第二份，直接回原处打开，并关掉这个空页面
      this.ocAbandonPage(input, descriptor.id);
      return;
    }
    try {
      const ownC = this.viewDescriptorService.getViewContainerByViewId(descriptor.id);
      if (ownC && !this.viewDescriptorService.getViewContainerModel(ownC).visibleViewDescriptors.length) {
        this.pagedContainer = ownC.id;
        ocSetContainerPaged(ownC.id, true, this.viewsService);
      }
    } catch {
    }
    ocWriteViewPageHidden([...ocReadViewPageHidden(), descriptor.id]);
    try {
      const pane = this.instantiationService.createInstance(descriptor.ctorDescriptor.ctor, ...descriptor.ctorDescriptor.staticArguments || [], {
        id: descriptor.id,
        title: descriptor.name.value,
        fromExtensionId: descriptor.extensionId,
        expanded: true,
        singleViewPaneContainerTitle: descriptor.singleViewPaneContainerTitle
      });
      pane.render();
      pane.element.style.height = "100%";
      // OpenCode p44b: 页面里的视图不在 PaneView 中，VS Code 的窗格标题样式不生效（折叠箭头/图标挤在左上角、标题成了大号 h3）。
      // 页签已显示名称：停靠出来的 DOM 面板（如「任务」）没有视图按钮，直接隐藏窗格标题；其他视图保留紧凑标题以便使用其按钮。
      if (String(descriptor.id).startsWith("opencode.domDock.")) {
        try {
          pane.headerVisible = false;
        } catch {
        }
      }
      pane.element.classList.add("oc-view-page-pane");
      this.host.appendChild(pane.element);
      pane.setExpanded(true);
      pane.setVisible(true);
      this.viewPane = pane;
      this.viewId = descriptor.id;
      if (this.dimension) this.layout(this.dimension);
    } catch (error) {
      this.logService?.error?.(`[OpenCode] view page render failed: ${descriptor.id}`, error);
      this.notificationService?.error?.(`\u9875\u9762\u52A0\u8F7D\u5931\u8D25\uFF08${descriptor.id}\uFF09\uFF1A${error?.message ?? error}`);
      ocSetViewVisibleInContainer(this.viewDescriptorService, descriptor.id, true);
      ocWriteViewPageHidden(ocReadViewPageHidden().filter((v) => v !== descriptor.id));
      this.ocAbandonPage(input, descriptor.id);
    }
  }
  // 页面建不起来时：关掉空白标签，视图回到原来的位置
  ocAbandonPage(input, viewId) {
    if (this.pagedContainer) {
      ocSetContainerPaged(this.pagedContainer, false);
      this.pagedContainer = void 0;
    }
    try {
      const group2 = this.group;
      setTimeout(() => {
        try {
          group2?.closeEditor?.(input, { preserveFocus: true });
        } catch {
        }
        if (viewId) this.viewsService.openView(viewId, true).catch(() => void 0);
      }, 0);
    } catch {
    }
  }
  renderPart(input) {
    const ls = OC_PAGE_DOCK_GUIDE?.layoutService;
    const partId = input.partId;
    const view = ocPartGridView(ls, partId);
    const el = view?.getContainer?.() ?? view?.element;
    if (!ls || !view || !el || !ls.workbenchGrid) {
      this.notificationService?.error?.("\u9875\u9762\u52A0\u8F7D\u5931\u8D25\uFF1A\u627E\u4E0D\u5230\u8FD9\u4E2A\u533A\u57DF");
      this.ocAbandonPage(input, void 0);
      return;
    }
    if (!ls.__ocPartPageHook) {
      // 页面里的区域被「切换侧栏/面板」按钮收起或打开时，跟着关掉页面或把页面切到前台，而不是在原处留一块空位
      ls.__ocPartPageHook = true;
      const orig = ls.setPartHidden.bind(ls);
      ls.setPartHidden = (hidden, part, ...rest) => {
        const r0 = OC_PART_PAGES.get(part);
        if (!r0) return orig(hidden, part, ...rest);
        if (hidden) {
          if (OC_PAGE_DOCK_GUIDE) ocClosePartPage(OC_PAGE_DOCK_GUIDE, part);
          return orig(hidden, part, ...rest);
        }
        const res = orig(hidden, part, ...rest);
        try {
          const sv = r0.view.setVisible;
          r0.view.setVisible = () => void 0;
          try {
            ls.workbenchGrid.setViewVisible(r0.view, false);
          } finally {
            r0.view.setVisible = sv;
          }
          const inp = OpenCodeViewEditorInput.instances.get("part:" + part);
          const g = r0.pane?.group ?? r0.group;
          if (inp && g) g.openEditor(inp, { preserveFocus: true });
        } catch {
        }
        return res;
      };
    }
    let rec = OC_PART_PAGES.get(partId);
    try {
      if (!rec) {
        rec = { el, parent: el.parentNode, next: el.nextSibling, css: el.style.cssText, view, ls, partId, input };
        // 只收起它在网格里的位置，不改「可见」状态，所以里面的视图、上面一排图标照常工作
        ocPartGridVisible(rec, false);
        el.style.cssText = rec.css + ";position:relative;width:100%;height:100%;";
        OC_PART_PAGES.set(partId, rec);
        ocHookPartRecLayout(rec);
        try {
          globalThis.__ocWmRefresh?.();
        } catch {
        }
        // 页面真正关掉（标签被关闭）时才回到原位；只是切到别的标签不算
        rec.disposeListener = input.onWillDispose?.(() => ocRestorePartRec(rec));
        // 标签名跟着当前选中的那个按钮走（Chat、Bridge…）
        const location = OC_PART_IDS.indexOf(partId);
        rec.visListener = this.viewsService.onDidChangeViewContainerVisibility?.((e) => {
          if (e?.visible && e.location === location) ocPartPageTitle(input, this.viewDescriptorService.getViewContainerById(e.id));
        });
        ocPartPageTitle(input, this.viewsService.getVisibleViewContainer?.(location));
      } else if (rec.pane && rec.pane !== this) {
        rec.pane.partRec = void 0;
      }
      rec.pane = this;
      rec.group = this.group;
      if (el.parentNode !== this.host) this.host.appendChild(el);
      this.partRec = rec;
      this.viewId = input.viewId;
      if (this.dimension) this.layout(this.dimension);
      else ocLayoutPartRec(rec, void 0, true);
      this.logService?.info?.("[OpenCode] part page open " + partId);
    } catch (error) {
      this.logService?.error?.(`[OpenCode] part page failed: ${partId}`, error);
      if (rec) ocRestorePartRec(rec);
      this.partRec = void 0;
      this.notificationService?.error?.(`\u9875\u9762\u52A0\u8F7D\u5931\u8D25\uFF1A${error?.message ?? error}`);
      this.ocAbandonPage(input, void 0);
    }
  }
  // 切到别的标签：区域留在页面里（跟着标签一起隐藏），原位置不再冒出来
  detachPart(removeDom) {
    const rec = this.partRec;
    this.partRec = void 0;
    if (!rec) return;
    if (rec.input?.isDisposed?.()) {
      ocRestorePartRec(rec);
      return;
    }
    if (rec.pane === this) rec.pane = void 0;
    // 同一个编辑器窗格要换去显示别的页面时才把区域拿出来；只是被切到后台就原样留着，避免里面的网页视图重新加载
    if (removeDom && rec.el.parentNode === this.host) rec.el.remove();
  }
  restorePart() {
    const rec = this.partRec;
    this.partRec = void 0;
    if (rec) ocRestorePartRec(rec);
  }
  renderContainer(input) {
    const vc = this.viewDescriptorService.getViewContainerById(input.containerId);
    if (!vc || !vc.ctorDescriptor) return;
    try {
      // 先把侧栏里打开着的同一个容器关掉，避免同一批视图出现两份
      const loc = this.viewDescriptorService.getViewContainerLocation(vc);
      if (this.viewsService.isViewContainerVisible?.(vc.id)) this.viewsService.closeViewContainer?.(vc.id);
      void loc;
    } catch {
    }
    this.pagedContainer = vc.id;
    ocSetContainerPaged(vc.id, true, this.viewsService);
    try {
      const pane = this.instantiationService.createInstance(vc.ctorDescriptor.ctor, ...vc.ctorDescriptor.staticArguments || []);
      const wrap = this.host.ownerDocument.createElement("div");
      wrap.className = "oc-view-page-container";
      wrap.style.cssText = "width:100%;height:100%;overflow:hidden";
      this.host.appendChild(wrap);
      pane.create(wrap);
      pane.setVisible(true);
      this.containerPane = pane;
      this.containerWrap = wrap;
      this.viewId = input.viewId;
      if (this.dimension) this.layout(this.dimension);
    } catch (error) {
      this.logService?.error?.(`[OpenCode] container page render failed: ${vc.id}`, error);
      this.notificationService?.error?.(`\u9875\u9762\u52A0\u8F7D\u5931\u8D25\uFF08${vc.id}\uFF09\uFF1A${error?.message ?? error}`);
      ocSetContainerPaged(vc.id, false);
      this.pagedContainer = void 0;
      try {
        this.containerWrap?.remove();
      } catch {
      }
      this.containerWrap = void 0;
      this.ocAbandonPage(input, void 0);
      this.viewsService.openViewContainer?.(vc.id, true)?.catch?.(() => void 0);
    }
  }
  disposeViewPane(removeDom) {
    this.detachPart(removeDom);
    if (this.containerPane) {
      try {
        this.containerPane.setVisible(false);
        this.containerPane.dispose();
      } catch {
      }
      this.containerWrap?.remove();
      this.containerPane = void 0;
      this.containerWrap = void 0;
    }
    if (this.pagedContainer) {
      ocSetContainerPaged(this.pagedContainer, false);
      this.pagedContainer = void 0;
    }
    const id = this.viewId;
    if (this.viewPane) {
      try {
        this.viewPane.setVisible(false);
        this.viewPane.element.remove();
        this.viewPane.dispose();
      } catch {
      }
    }
    this.viewPane = void 0;
    this.viewId = void 0;
    if (id) {
      ocWriteViewPageHidden(ocReadViewPageHidden().filter((v) => v !== id));
      ocSetViewVisibleInContainer(this.viewDescriptorService, id, true);
    }
  }
  clearInput() {
    this.disposeViewPane();
    super.clearInput();
  }
  layout(dimension) {
    this.dimension = dimension;
    if (this.partRec) {
      ocLayoutPartRec(this.partRec, dimension, true);
    }
    if (this.containerPane) {
      try {
        this.containerPane.layout({ width: dimension.width, height: dimension.height });
      } catch {
      }
    }
    if (this.viewPane) {
      this.viewPane.orthogonalSize = dimension.width;
      this.viewPane.layout(dimension.height);
    }
  }
  focus() {
    super.focus();
    this.viewPane?.focus();
    try {
      this.containerPane?.focus();
    } catch {
    }
  }
  dispose() {
    try {
      this.ocHostRO?.disconnect();
    } catch {
    }
    this.ocHostRO = void 0;
    this.disposeViewPane();
    super.dispose();
  }
};
OpenCodeViewEditorPane = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IViewsService),
  __decorateParam(8, INotificationService)
], OpenCodeViewEditorPane);
// ae-dock-step15: 页面重开到别处前先关掉旧的，避免同一视图在两个窗口里各有一份（弹出窗口报错的原因之一）
var OC_PART_PAGES = globalThis.__ocPartPages ??= /* @__PURE__ */ new Map();
var OC_PART_PAGE_TITLES = { "workbench.parts.sidebar": "\u4E3B\u4FA7\u680F", "workbench.parts.panel": "\u9762\u677F", "workbench.parts.auxiliarybar": "\u8F85\u52A9\u4FA7\u680F" };
function ocPartGridView(ls, partId) {
  if (!ls) return void 0;
  return partId === "workbench.parts.sidebar" ? ls.sideBarPartView : partId === "workbench.parts.panel" ? ls.panelPartView : partId === "workbench.parts.auxiliarybar" ? ls.auxiliaryBarPartView : void 0;
}
function ocPartGridVisible(rec, visible) {
  const sv = rec.view.setVisible;
  rec.view.setVisible = () => void 0;
  try {
    rec.ls.workbenchGrid.setViewVisible(rec.view, visible);
  } finally {
    rec.view.setVisible = sv;
  }
}
function ocPartPageTitle(input, vc) {
  if (!input || !vc) return;
  const t = typeof vc.title === "string" ? vc.title : vc.title?.value;
  if (!t || t === input.viewName) return;
  input.viewName = t;
  try {
    input._onDidChangeLabel?.fire();
  } catch {
  }
}
// OpenCode part-page-relayout: 区域搬进编辑区后，它在外层网格里只是被收起（宽 0）。
// 原因 1：网格每次重排（拖右侧分隔条）都会用 0 或旧尺寸调它的 layout，覆盖掉页面给的尺寸 → 聊天变空白 / 挤成 ~200px / 右侧留空。
// 原因 2：网格开着 edgeSnapping，从窗口右边缘能把这一栏「拖出来」→ 网格重新显示空槽位（右边一大块暗色空白）；
//        再拖到最右吸附隐藏 → 布局服务直接 setAuxiliaryBarHidden(true)（绕过 setPartHidden 钩子）→ 整个区域连同页面内容被关掉。
// 处理：页面打开期间，网格对这一栏的 layout 一律改为按页面实际大小重排；网格的显示/隐藏不再传给布局服务，
//       显示出来的空槽位在拖动结束后立刻收回。
function ocHookPartRecLayout(rec) {
  if (rec.ocHooked) return;
  const view = rec.view;
  rec.ocHooked = true;
  rec.ocHadOwnLayout = Object.prototype.hasOwnProperty.call(view, "layout");
  rec.ocHadOwnSetVisible = Object.prototype.hasOwnProperty.call(view, "setVisible");
  const origLayout = view.layout;
  const origSetVisible = view.setVisible;
  rec.ocOrigLayout = origLayout;
  rec.ocOrigSetVisible = origSetVisible;
  rec.layoutDirect = (w, h) => origLayout.call(view, w, h, 0, 0);
  view.layout = function(w, h, t, l) {
    if (OC_PART_PAGES.get(rec.partId) !== rec) return origLayout.call(this, w, h, t, l);
    ocLayoutPartRec(rec, void 0, false);
  };
  view.setVisible = function(visible, ...rest) {
    if (OC_PART_PAGES.get(rec.partId) !== rec) return origSetVisible?.call(this, visible, ...rest);
    if (visible) ocReclaimPartSlot(rec);
  };
}
function ocUnhookPartRecLayout(rec) {
  if (!rec.ocHooked) return;
  rec.ocHooked = false;
  const view = rec.view;
  try {
    if (rec.ocHadOwnLayout) view.layout = rec.ocOrigLayout;
    else delete view.layout;
    if (rec.ocHadOwnSetVisible) view.setVisible = rec.ocOrigSetVisible;
    else delete view.setVisible;
  } catch {
  }
  rec.layoutDirect = void 0;
}
function ocLayoutPartRec(rec, dimension, force) {
  if (!rec?.layoutDirect) {
    try {
      if (dimension) rec?.view?.layout(dimension.width, dimension.height, 0, 0);
    } catch {
    }
    return;
  }
  let w = dimension?.width, h = dimension?.height;
  const host = rec.el?.parentNode;
  if (!(w > 0 && h > 0) && host) {
    w = host.clientWidth;
    h = host.clientHeight;
  }
  // 标签切到后台（display:none）时宽高是 0：保持上次尺寸，回到前台再重排
  if (!(w > 0 && h > 0)) return;
  w = Math.round(w);
  h = Math.round(h);
  if (!force && rec.ocLastW === w && rec.ocLastH === h) return;
  rec.ocLastW = w;
  rec.ocLastH = h;
  try {
    rec.layoutDirect(w, h);
  } catch (error) {
    OC_PAGE_DOCK_GUIDE?.logService?.warn?.("[OpenCode] part page relayout failed", error);
  }
}
function ocReclaimPartSlot(rec) {
  if (rec.ocReclaimPending) return;
  rec.ocReclaimPending = true;
  const doc = rec.el?.ownerDocument ?? globalThis.document;
  const run = () => {
    if (OC_PART_PAGES.get(rec.partId) !== rec) {
      rec.ocReclaimPending = false;
      return;
    }
    // 分隔条还按着就等松手，免得和正在进行的拖动打架
    if (doc?.querySelector?.(".monaco-sash.active")) {
      setTimeout(run, 120);
      return;
    }
    rec.ocReclaimPending = false;
    try {
      ocPartGridVisible(rec, false);
      rec.ls.layout?.();
    } catch {
    }
    ocLayoutPartRec(rec, void 0, true);
  };
  setTimeout(run, 0);
}
function ocRestorePartRec(rec) {
  if (OC_PART_PAGES.get(rec.partId) !== rec) return;
  OC_PART_PAGES.delete(rec.partId);
  ocUnhookPartRecLayout(rec);
  try {
    globalThis.__ocWmRefresh?.();
  } catch {
  }
  if (rec.pane) rec.pane.partRec = void 0;
  rec.pane = void 0;
  try {
    rec.disposeListener?.dispose?.();
    rec.visListener?.dispose?.();
  } catch {
  }
  try {
    rec.el.style.cssText = rec.css;
    if (rec.parent) rec.parent.insertBefore(rec.el, rec.next && rec.next.parentNode === rec.parent ? rec.next : null);
    ocPartGridVisible(rec, true);
    rec.ls.layout?.();
  } catch (error) {
    OC_PAGE_DOCK_GUIDE?.logService?.error?.("[OpenCode] part page restore failed", error);
  }
}
function ocClosePartPage(guide, partId) {
  const rec = OC_PART_PAGES.get(partId);
  if (!rec) return;
  ocRestorePartRec(rec);
  const input = OpenCodeViewEditorInput.instances.get("part:" + partId);
  try {
    for (const g of guide.editorGroupsService.getGroups(1)) if (input && g.contains?.(input)) g.closeEditor(input, { preserveFocus: true });
  } catch {
  }
}
// OpenCode stale-drop-overlay: 拖放被我们的蓝框接管后，编辑区自带的灰色放置遮罩收不到 drop/dragleave，会一直盖着（鼠标移上去才消失）。
// 拖动结束时给残留的遮罩发一个 mouseover，让它按自己的逻辑销毁。
function ocClearStaleDropOverlays(doc) {
  const run = () => {
    for (const d of new Set([doc, globalThis.document].filter(Boolean))) {
      try {
        for (const el of d.querySelectorAll("#monaco-workbench-editor-drop-overlay, .editor-group-overlay, .monaco-workbench .pane-composite-part .drop-overlay")) {
          el.dispatchEvent(new (d.defaultView ?? globalThis).MouseEvent("mouseover", { bubbles: true }));
        }
      } catch {
      }
    }
  };
  setTimeout(run, 0);
  setTimeout(run, 300);
}
// 兜底：拖到内置浏览器（原生视图）上松手时，编辑区收不到 dragleave/drop/dragend，灰色遮罩会残留。
// 只要遮罩还在、却已经 400ms 没有 dragover，就认定拖动已结束，把它清掉。
function ocInstallDropOverlayWatchdog(doc) {
  if (!doc || doc.__ocDropWatchdog) return;
  const win = doc.defaultView ?? globalThis;
  doc.__ocDropWatchdog = true;
  let last = 0;
  const bump = () => { last = Date.now(); };
  try {
    win.addEventListener("dragover", bump, true);
    win.addEventListener("dragenter", bump, true);
    win.setInterval(() => {
      if (Date.now() - last < 400) return;
      const els = doc.querySelectorAll("#monaco-workbench-editor-drop-overlay, .editor-group-overlay");
      if (!els.length) return;
      for (const el of els) {
        try {
          el.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
        } catch {
        }
      }
    }, 250);
  } catch {
  }
}
try {
  ocInstallDropOverlayWatchdog(globalThis.document);
} catch {
}
function ocReopenViewPage(guide, input, dest) {
  const open = () => guide.editorService.openEditor(input, { pinned: true }, dest).catch((error) => {
    guide.logService?.warn?.("[OpenCode] view page open failed", error);
    guide.notificationService?.error?.(`\u9875\u9762\u6253\u5F00\u5931\u8D25\uFF1A${error?.message ?? error}`);
  });
  const closing = [];
  try {
    for (const g of guide.editorGroupsService.getGroups(1)) {
      if (dest && typeof dest === "object" && g.id === dest.id) continue;
      if (g.contains?.(input)) closing.push(Promise.resolve(g.closeEditor(input, { preserveFocus: true })));
    }
  } catch {
  }
  Promise.all(closing).then(open, open);
}
function ocSetContainerPaged(containerId, paged, _viewsService) {
  const set = globalThis.__ocPagedContainers ??= /* @__PURE__ */ new Set();
  if (paged === set.has(containerId)) return;
  if (paged) set.add(containerId);
  else set.delete(containerId);
  for (const bar of globalThis.__ocPaneCompositeBars ?? []) {
    try {
      const vc = bar.getViewContainer?.(containerId);
      if (vc) bar.showOrHideViewContainer(vc);
    } catch {
    }
  }
}
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(OpenCodeViewEditorPane, OpenCodeViewEditorPane.ID, "\u89C6\u56FE\u9875\u9762"),
  [new SyncDescriptor(OpenCodeViewEditorInput)]
);
export { waitForDefaultAgent, getPendingConfirmationInfo, getOpenChatActionIdForMode, registerChatActions, stringifyItem, computeToolEnablementMap, handleCurrentEditingSession, handleModeSwitch, clearChatSessionPreservingType, CHAT_CATEGORY, COPILOT_CLI_AGENT_HOST_PROVIDER_ID, ACTION_ID_NEW_CHAT, ACTION_ID_NEW_EDIT_SESSION, ACTION_ID_OPEN_CHAT, CHAT_OPEN_ACTION_ID, CHAT_SETUP_ACTION_ID, CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID, TOGGLE_CHAT_ACTION_ID, GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID, GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID, GENERATE_AGENT_COMMAND_ID, GENERATE_HOOK_COMMAND_ID, INSERT_FORK_CONVERSATION_COMMAND_ID, INSERT_TROUBLESHOOT_COMMAND_ID, defaultChat, OPEN_CHAT_QUOTA_EXCEEDED_DIALOG, OpenChatGlobalAction, PrimaryOpenChatGlobalAction, ModeOpenChatGlobalAction };

// OpenCode ae-dock-step08: 聊天里的「任务」区和其他面板同一套拖放规则：拖到侧栏/面板/编辑区/窗口外即可；拖回聊天即还原。
var OC_DOM_DOCK = /* @__PURE__ */ new Map();
var OC_DOM_DOCK_VIEW_CLASS;
var OC_DOM_DOCK_CSS = `
.oc-dom-dock-host{display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden}
.oc-dom-dock-host [data-oc-docked="1"],.oc-dom-dock-host [data-oc-docked="1"][hidden]{display:flex !important;flex-direction:column;flex:1 1 auto;min-height:0;height:auto !important;max-height:none !important;margin:0 !important;border:none !important;border-radius:0 !important;box-shadow:none !important}
.oc-dom-dock-host [data-oc-docked="1"] > .opencode-bridge-task-shelf-heading{display:none !important}
.oc-dom-dock-host [data-oc-docked="1"] .opencode-bridge-task-shelf-body{display:block !important;flex:1 1 auto;min-height:0;max-height:none !important;overflow:auto}
.oc-dom-dock-host [data-oc-docked="1"] .opencode-bridge-task-shelf-resize{display:none !important}
`;
function ocDomDockViewId(id) {
  return `opencode.domDock.${id}`;
}
function ocDomDockEntryFor(id) {
  if (!id) return void 0;
  const viewId = id.startsWith("opencode.domDockC.") ? "opencode.domDock." + id.slice("opencode.domDockC.".length) : id;
  const entry = OC_DOM_DOCK.get(viewId);
  return entry ? { ...entry, viewId } : void 0;
}
function ocDomDockViewClass() {
  if (OC_DOM_DOCK_VIEW_CLASS) return OC_DOM_DOCK_VIEW_CLASS;
  OC_DOM_DOCK_VIEW_CLASS = class OpenCodeDomDockView extends ViewPane {
    renderBody(container) {
      super.renderBody(container);
      const doc = container.ownerDocument;
      if (!doc.getElementById("oc-dom-dock-style")) {
        const style = doc.createElement("style");
        style.id = "oc-dom-dock-style";
        style.textContent = OC_DOM_DOCK_CSS;
        doc.head.appendChild(style);
      }
      const host = doc.createElement("div");
      host.className = "oc-dom-dock-host";
      container.appendChild(host);
      this.ocHost = host;
      const entry = OC_DOM_DOCK.get(this.id);
      if (entry?.element) {
        entry.element.dataset.ocDocked = "1";
        host.appendChild(entry.element);
        try {
          entry.onChange?.();
        } catch {
        }
      }
    }
    layoutBody(height, width2) {
      super.layoutBody(height, width2);
      if (this.ocHost) this.ocHost.style.height = height + "px";
    }
  };
  return OC_DOM_DOCK_VIEW_CLASS;
}
function ocDomUndock(guide, viewId, restoreHome) {
  const entry = OC_DOM_DOCK.get(viewId);
  if (!entry) return;
  OC_DOM_DOCK.delete(viewId);
  try {
    globalThis.__ocAeFloats?.get(entry.containerId)?.close?.();
  } catch {
  }
  const containers = Registry.as(Extensions13.ViewContainersRegistry);
  const container = containers.get(entry.containerId);
  const descriptor = guide.viewDescriptorService.getViewDescriptorById(viewId);
  if (restoreHome && entry.home?.isConnected) {
    delete entry.element.dataset.ocDocked;
    entry.home.insertBefore(entry.element, entry.home.firstChild);
  }
  try {
    const page = OpenCodeViewEditorInput.instances?.get?.(viewId);
    if (page && !page.isDisposed()) {
      for (const group2 of guide.editorGroupsService.getGroups(1)) if (group2.contains(page)) group2.closeEditor(page);
    }
  } catch {
  }
  try {
    if (descriptor && container) Registry.as(Extensions13.ViewsRegistry).deregisterViews([descriptor], container);
    if (container) containers.deregisterViewContainer(container);
  } catch (error) {
    guide.logService?.warn?.("[OpenCode] dom undock cleanup failed", error);
  }
  if (restoreHome) {
    try {
      entry.onChange?.();
    } catch {
    }
  }
}
async function ocDomDock(guide, info, place) {
  const viewId = ocDomDockViewId(info.id);
  const containerId = `opencode.domDockC.${info.id}`;
  if (OC_DOM_DOCK.has(viewId)) ocDomUndock(guide, viewId, false);
  OC_DOM_DOCK.set(viewId, { ...info, containerId });
  const location = place.location ?? 1;
  const title = { value: info.title, original: info.title };
  const containers = Registry.as(Extensions13.ViewContainersRegistry);
  const container = containers.registerViewContainer({
    id: containerId,
    title,
    icon: defaultViewIcon,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [containerId, { mergeViewWithContainerWhenSingleView: true }]),
    storageId: containerId,
    hideIfEmpty: true,
    order: 1e3
  }, location);
  Registry.as(Extensions13.ViewsRegistry).registerViews([{
    id: viewId,
    name: title,
    containerIcon: defaultViewIcon,
    ctorDescriptor: new SyncDescriptor(ocDomDockViewClass()),
    canToggleVisibility: true,
    canMoveView: true,
    weight: 100,
    order: 1
  }], container);
  if (place.float) {
    // OpenCode ae-float-p16: 任务这类 DOM 面板浮出 = 窗内浮窗，不再开独立窗口
    try {
      await guide.viewsService.openView(viewId, false);
      if (await ocAeFloatContainer(guide, containerId)) return;
    } catch (error) {
      guide.logService?.warn?.("[OpenCode] dom float failed", error);
    }
    guide.openViewAsPage(viewId, "view", AUX_WINDOW_GROUP);
    return;
  }
  if (place.group) {
    guide.openViewAsPage(viewId, "view", place.group);
    return;
  }
  await guide.viewsService.openView(viewId, true);
}
// OpenCode bridge-switch-step09: Chat/Bridge 切换做成视图自己的标题按钮，不管 Chat 停在哪里都是同一个按钮
MenuRegistry.appendMenuItem(MenuId.ViewTitle, { command: { id: "opencode.bridge.openSession", title: "\u5207\u6362\u5230 Bridge", icon: { id: "radio-tower" } }, when: ContextKeyExpr.and(ContextKeyExpr.equals("view", ChatViewId), ContextKeyExpr.not("opencodeBridgeMode")), group: "navigation", order: -1000 });
MenuRegistry.appendMenuItem(MenuId.ViewTitle, { command: { id: "_opencode.bridge.showChat", title: "\u5207\u6362\u5230 Chat", icon: { id: "comment-discussion" } }, when: ContextKeyExpr.and(ContextKeyExpr.equals("view", ChatViewId), ContextKeyExpr.has("opencodeBridgeMode")), group: "navigation", order: -1000 });

// OpenCode ae-float-p14: AE 式浮动面板实现
var OC_AE_FLOAT_PART_CLASS = { 0: "sidebar", 1: "panel", 2: "auxiliarybar" };
function ocAeFloatStyle(doc) {
  if (doc.getElementById("oc-ae-float-style")) return;
  const st = doc.createElement("style");
  st.id = "oc-ae-float-style";
  st.textContent = `
.oc-ae-float{position:fixed;z-index:35;display:flex;flex-direction:column;min-width:80px;min-height:80px;
 background:var(--vscode-sideBar-background,var(--vscode-editor-background));border:1px solid var(--vscode-widget-border,var(--vscode-panel-border,rgba(128,128,128,.35)));border-radius:8px;
 box-shadow:0 12px 32px rgba(0,0,0,.38),0 2px 6px rgba(0,0,0,.22);
 transition:opacity .16s ease,transform .18s cubic-bezier(.2,.8,.2,1),box-shadow .18s ease,border-color .12s ease}
.oc-ae-float.oc-enter{opacity:0;transform:scale(.96) translateY(6px)}
.oc-ae-float.oc-leave{opacity:0;transform:scale(.97);pointer-events:none}
.oc-ae-float.oc-fly{transition:left .22s cubic-bezier(.2,.8,.2,1),top .22s cubic-bezier(.2,.8,.2,1),width .22s cubic-bezier(.2,.8,.2,1),height .22s cubic-bezier(.2,.8,.2,1),opacity .16s ease}
.oc-ae-float.oc-moving{box-shadow:0 20px 48px rgba(0,0,0,.46),0 4px 12px rgba(0,0,0,.26)}
.oc-ae-float.oc-moving .oc-ae-float-body,.oc-ae-float.oc-resizing .oc-ae-float-body{pointer-events:none}
.oc-ae-float.oc-focused{border-color:var(--vscode-focusBorder)}
.oc-ae-float-head{flex:0 0 30px;display:flex;align-items:center;gap:2px;padding:0 4px 0 6px;user-select:none;cursor:grab;border-radius:8px 8px 0 0;
 background:var(--vscode-sideBarSectionHeader-background,var(--vscode-editorGroupHeader-tabsBackground));border-bottom:1px solid var(--vscode-sideBarSectionHeader-border,var(--vscode-panel-border,transparent))}
.oc-ae-float.oc-moving .oc-ae-float-head{cursor:grabbing}
.oc-ae-float-tab{position:relative;display:flex;align-items:center;height:22px;padding:0 10px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;border-radius:4px;
 color:var(--vscode-sideBarTitle-foreground,var(--vscode-foreground));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%;cursor:grab;transition:background-color .12s ease}
.oc-ae-float-tab:hover{background:var(--vscode-toolbar-hoverBackground)}
.oc-ae-float-tab::after{content:"";position:absolute;left:10px;right:10px;bottom:0;height:2px;border-radius:1px;background:var(--vscode-focusBorder);opacity:0;transition:opacity .12s ease}
.oc-ae-float.oc-focused .oc-ae-float-tab::after{opacity:1}
.oc-ae-float-fill{flex:1;align-self:stretch}
.oc-ae-float-btn{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;cursor:pointer;color:var(--vscode-icon-foreground,var(--vscode-foreground));opacity:.75;transition:opacity .12s ease,background-color .12s ease}
.oc-ae-float-btn:hover{opacity:1;background:var(--vscode-toolbar-hoverBackground)}
.oc-ae-float-body{flex:1;position:relative;overflow:hidden;border-radius:0 0 8px 8px}
.oc-ae-float-body>*{height:100%}
.oc-ae-float-rz{position:absolute;z-index:2}
.oc-ae-float-rz-n,.oc-ae-float-rz-s{left:10px;right:10px;height:6px;cursor:ns-resize}
.oc-ae-float-rz-n{top:-3px}.oc-ae-float-rz-s{bottom:-3px}
.oc-ae-float-rz-e,.oc-ae-float-rz-w{top:10px;bottom:10px;width:6px;cursor:ew-resize}
.oc-ae-float-rz-e{right:-3px}.oc-ae-float-rz-w{left:-3px}
.oc-ae-float-rz-ne,.oc-ae-float-rz-nw,.oc-ae-float-rz-se,.oc-ae-float-rz-sw{width:12px;height:12px}
.oc-ae-float-rz-ne{top:-3px;right:-3px;cursor:nesw-resize}.oc-ae-float-rz-sw{bottom:-3px;left:-3px;cursor:nesw-resize}
.oc-ae-float-rz-nw{top:-3px;left:-3px;cursor:nwse-resize}.oc-ae-float-rz-se{bottom:-3px;right:-3px;cursor:nwse-resize}
.oc-ae-float-dock{display:none!important}
@media (prefers-reduced-motion:reduce){.oc-ae-float,.oc-ae-float.oc-fly{transition:none}}
`;
  doc.head.appendChild(st);
}
async function ocAeFloatContainer(guide, cid) {
  const F = globalThis.__ocAeFloats ??= /* @__PURE__ */ new Map();
  const old = F.get(cid);
  if (old) {
    old.frame.style.display = "";
    return true;
  }
  const vds = guide.viewDescriptorService, vs = guide.viewsService, ls = guide.layoutService;
  const vc = vds.getViewContainerById(cid);
  if (!vc) return false;
  const loc = vds.getViewContainerLocation(vc);
  if (loc !== 0 && loc !== 1 && loc !== 2) return false;
  const comp = await vs.openViewContainer(cid, false);
  const host = comp?.getContainer?.();
  const inner = host?.firstElementChild;
  if (!inner) return false;
  const doc = host.ownerDocument;
  const win = doc.defaultView;
  ocAeFloatStyle(doc);
  const title = (typeof vc.title === "string" ? vc.title : vc.title?.value) || cid;
  const r0 = host.getBoundingClientRect();
  // OpenCode free-size: 浮窗沿用原来的大小（只限制在窗口内），不再卡 320~520 × 260~560
  const w = Math.round(Math.max(80, Math.min(r0.width >= 80 ? r0.width : 360, win.innerWidth - 16)));
  const h = Math.round(Math.max(80, Math.min(r0.height >= 80 ? r0.height : 420, win.innerHeight - 16)));
  const frame = doc.createElement("div");
  frame.className = "oc-ae-float";
  // OpenCode ae-float-p18: 新外形 + 动效（从原位置飞出、淡入、拖动阴影、边角缩放、关闭淡出）
  const goal = { width: w + "px", height: h + "px", left: Math.round((win.innerWidth - w) / 2) + "px", top: Math.round((win.innerHeight - h) / 3) + "px" };
  const canFly = r0.width > 40 && r0.height > 40;
  Object.assign(frame.style, canFly ? { width: r0.width + "px", height: r0.height + "px", left: r0.left + "px", top: r0.top + "px" } : goal);
  const head = doc.createElement("div");
  head.className = "oc-ae-float-head";
  const tab = doc.createElement("div");
  tab.className = "oc-ae-float-tab";
  tab.textContent = title;
  const fill = doc.createElement("div");
  fill.className = "oc-ae-float-fill";
  const dockBtn = doc.createElement("div");
  dockBtn.className = "oc-ae-float-btn codicon codicon-pinned";
  dockBtn.title = "\u505C\u9760\u56DE\u539F\u5904";
  const closeBtn = doc.createElement("div");
  closeBtn.className = "oc-ae-float-btn codicon codicon-close";
  closeBtn.title = "\u5173\u95ED\uFF08\u56DE\u5230\u539F\u5904\uFF09";
  head.append(tab, fill, dockBtn, closeBtn);
  const body = doc.createElement("div");
  body.className = "oc-ae-float-body";
  frame.append(head, body);
  const dockHint = doc.createElement("div");
  dockHint.className = "oc-ae-float-dock";
  (ls.mainContainer ?? doc.body).append(frame, dockHint);
  for (const d of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
    const rz = doc.createElement("div");
    rz.className = "oc-ae-float-rz oc-ae-float-rz-" + d;
    rz.dataset.ocRz = d;
    frame.appendChild(rz);
  }
  frame.addEventListener("pointerdown", (e) => {
    const d = e.target?.dataset?.ocRz;
    if (!d || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.target, sx = e.clientX, sy = e.clientY;
    const r = { l: frame.offsetLeft, t: frame.offsetTop, w: frame.offsetWidth, h: frame.offsetHeight };
    el.setPointerCapture?.(e.pointerId);
    frame.classList.add("oc-resizing");
    let raf = 0;
    const mv = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let l = r.l, t = r.t, w2 = r.w, h2 = r.h;
      if (d.includes("e")) w2 = r.w + dx;
      if (d.includes("s")) h2 = r.h + dy;
      if (d.includes("w")) { w2 = r.w - dx; l = r.l + dx; }
      if (d.includes("n")) { h2 = r.h - dy; t = r.t + dy; }
      if (w2 < 80) { if (d.includes("w")) l -= 80 - w2; w2 = 80; }
      if (h2 < 80) { if (d.includes("n")) t -= 80 - h2; h2 = 80; }
      if (t < 0) { h2 += t; t = 0; }
      Object.assign(frame.style, { left: l + "px", top: t + "px", width: w2 + "px", height: h2 + "px" });
      if (!raf) raf = win.requestAnimationFrame(() => {
        raf = 0;
        relayout();
      });
    };
    const up = () => {
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      frame.classList.remove("oc-resizing");
      relayout();
    };
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }, true);
  if (canFly) {
    frame.classList.add("oc-fly");
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
      Object.assign(frame.style, goal);
      setTimeout(() => {
        frame.classList.remove("oc-fly");
        try {
          relayout();
        } catch {
        }
      }, 240);
    }));
  } else {
    frame.classList.add("oc-enter");
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => frame.classList.remove("oc-enter")));
  }
  body.appendChild(inner);
  const state = { frame, inner, host, comp, loc, restoring: false, disposed: false };
  F.set(cid, state);
  // 原位置：同一区域还有别的视图就切过去，否则收起这一栏
  const others = vds.getViewContainersByLocation(loc).filter((c) => c.id !== cid && vds.getViewContainerModel(c).activeViewDescriptors.length > 0);
  try {
    if (others.length) await vs.openViewContainer(others[0].id, false);
    else ls.setPartHidden(true, OC_PART_IDS[loc]);
  } catch {
  }
  try {
    comp.setVisible?.(true);
  } catch {
  }
  const relayout = () => {
    if (state.disposed) return;
    try {
      comp.layout?.({ width: body.clientWidth, height: body.clientHeight });
    } catch {
    }
  };
  const ro = new win.ResizeObserver(relayout);
  ro.observe(body);
  relayout();
  const putBack = () => {
    if (state.disposed) return;
    state.disposed = true;
    ro.disconnect();
    visL?.dispose?.();
    try {
      state.cleanup?.();
    } catch {
    }
    host.appendChild(inner);
    ocAeFloatLeave(frame);
    dockHint.remove();
    F.delete(cid);
  };
  const dockTo = (location) => {
    state.restoring = true;
    putBack();
    guide.moveContainerToLocationAndOpen(cid, location);
    try {
      ls.setPartHidden(false, OC_PART_IDS[location]);
    } catch {
    }
    setTimeout(() => {
      try {
        ls.layout?.();
      } catch {
      }
    }, 0);
  };
  // 有人从活动栏/命令重新打开这个视图组：自动停靠回去
  // OpenCode ae-float-p16: 浮窗期间原位置不保留副本：活动栏图标隐藏；点开只把浮窗提到最前
  const reShow = async () => {
    try {
      const curLoc = vds.getViewContainerLocation(vc);
      const others2 = vds.getViewContainersByLocation(curLoc).filter((c) => c.id !== cid && vds.getViewContainerModel(c).activeViewDescriptors.length > 0);
      if (others2.length) await vs.openViewContainer(others2[0].id, false);
      else ls.setPartHidden(true, OC_PART_IDS[curLoc]);
    } catch {
    }
    try {
      comp.setVisible?.(true);
    } catch {
    }
    relayout();
  };
  // OpenCode ae-float-p17: 视图组被注销（比如任务放回聊天）就把浮窗一起关掉
  state.close = () => {
    if (state.disposed) return;
    state.disposed = true;
    try {
      ro.disconnect();
      visL?.dispose?.();
      state.cleanup?.();
    } catch {
    }
    ocAeFloatLeave(frame);
    dockHint.remove();
    F.delete(cid);
  };
  const hideIcons = () => {
    if (!state.disposed && !vds.getViewContainerById(cid)) {
      state.close();
      return;
    }
    ocAeFloatHideIcons(doc, title, !state.disposed);
  };
  const iconTimer = win.setInterval(hideIcons, 1200);
  hideIcons();
  const locL = vds.onDidChangeContainerLocation?.((e) => {
    if (e?.viewContainer?.id === cid && !state.disposed) {
      state.restoring = true;
      putBack();
    }
  });
  state.cleanup = () => {
    win.clearInterval(iconTimer);
    locL?.dispose?.();
    state.dnd?.dispose?.();
    ocAeFloatHideIcons(doc, title, false);
  };
  const visL = vs.onDidChangeViewContainerVisibility?.((e) => {
    if (e.id === cid && e.visible && !state.restoring && !state.disposed && !(state.dragUntil > Date.now())) {
      for (const s2 of F.values()) s2.frame.style.zIndex = "35";
      frame.style.zIndex = "36";
      frame.style.display = "";
      setTimeout(reShow, 0);
      return;
    }
    if (e.id === cid && e.visible && !state.restoring && !state.disposed) {
      putBack();
      setTimeout(() => {
        try {
          ls.layout?.();
        } catch {
        }
      }, 0);
    }
  });
  dockBtn.addEventListener("click", () => dockTo(loc));
  closeBtn.addEventListener("click", () => dockTo(loc));
  frame.addEventListener("focusin", () => frame.classList.add("oc-focused"));
  frame.addEventListener("focusout", () => frame.classList.remove("oc-focused"));
  frame.addEventListener("pointerdown", () => {
    for (const s2 of F.values()) s2.frame.style.zIndex = "35";
    frame.style.zIndex = "36";
  }, true);
  // 拖动标签头 = 移动浮窗；松手在侧栏/右侧栏/底部面板上（或窗口左/右/下边缘）= 停靠到那里
  const dockTarget = (x, y) => {
    const root = ls.mainContainer ?? doc.body;
    const rr = root.getBoundingClientRect();
    const edge = 28;
    const sideLeft = (ls.getSideBarPosition?.() ?? 0) === 0;
    const leftLoc = sideLeft ? 0 : 2, rightLoc = sideLeft ? 2 : 0;
    if (x - rr.left < edge) return { loc: leftLoc, rect: [rr.left, rr.top, 240, rr.height] };
    if (rr.right - x < edge) return { loc: rightLoc, rect: [rr.right - 240, rr.top, 240, rr.height] };
    if (rr.bottom - y < edge) return { loc: 1, rect: [rr.left, rr.bottom - 200, rr.width, 200] };
    for (const l of [0, 2, 1]) {
      const el = root.querySelector(".part." + OC_AE_FLOAT_PART_CLASS[l]);
      if (!el || el.offsetParent === null) continue;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return { loc: l, rect: [r.left, r.top, r.width, r.height] };
    }
    return void 0;
  };
  head.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target === dockBtn || e.target === closeBtn || tab.contains(e.target)) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const fl = frame.offsetLeft, ft = frame.offsetTop;
    let raf = 0;
    head.setPointerCapture?.(e.pointerId);
    frame.classList.add("oc-moving");
    const move = (ev) => {
      // 可以自由拖到任何位置，甚至部分移出窗口；只保证标题栏留 60px 在窗口里，免得再也抓不回来
      const fw = frame.offsetWidth;
      frame.style.left = Math.round(Math.min(win.innerWidth - 60, Math.max(60 - fw, fl + ev.clientX - sx))) + "px";
      frame.style.top = Math.round(Math.min(win.innerHeight - 30, Math.max(0, ft + ev.clientY - sy))) + "px";
      if (!raf) raf = win.requestAnimationFrame(() => {
        raf = 0;
        relayout();
      });
    };
    const up = () => {
      frame.classList.remove("oc-moving");
      head.removeEventListener("pointermove", move);
      head.removeEventListener("pointerup", up);
      head.removeEventListener("pointercancel", up);
      relayout();
    };
    head.addEventListener("pointermove", move);
    head.addEventListener("pointerup", up);
    head.addEventListener("pointercancel", up);
  });
  tab.style.cursor = "grab";
  tab.title = "\u62D6\u52A8\u6807\u7B7E\u505C\u9760\uFF1B\u62D6\u6807\u9898\u680F\u7A7A\u767D\u5904\u79FB\u52A8\u6D6E\u7A97";
  try {
    state.dnd = CompositeDragAndDropObserver.INSTANCE.registerDraggable(tab, () => ({ type: "composite", id: cid }), {});
  } catch (error) {
    guide.logService?.warn?.("[OpenCode] float tab drag failed", error);
  }
  tab.addEventListener("dragstart", () => {
    state.dragUntil = Infinity;
    setTimeout(() => {
      frame.style.pointerEvents = "none";
      frame.style.opacity = "0.5";
    }, 0);
  });
  tab.addEventListener("dragend", () => {
    state.dragUntil = Date.now() + 1500;
    frame.style.pointerEvents = "";
    frame.style.opacity = "";
  });
  head.addEventListener("dblclick", (e) => {
    if (e.target === dockBtn || e.target === closeBtn) return;
    dockTo(loc);
  });
  return true;
}

// OpenCode ae-float-p16: 浮出的视图组不在活动栏/面板标签上留图标
function ocAeFloatHideIcons(doc, title, on) {
  for (const el of doc.querySelectorAll(".composite-bar .action-item, .activitybar .action-item")) {
    const lab = el.querySelector(".action-label");
    const t = (lab?.getAttribute("aria-label") || lab?.textContent || el.getAttribute("aria-label") || "").trim();
    const hit = t === title || t.startsWith(title + " ") || t.startsWith(title + "(") || t.startsWith(title + "\uFF08");
    if (!hit) continue;
    if (on) el.classList.add("oc-ae-floated-hidden");
    else el.classList.remove("oc-ae-floated-hidden");
  }
  if (!doc.getElementById("oc-ae-floated-hidden-style")) {
    const st = doc.createElement("style");
    st.id = "oc-ae-floated-hidden-style";
    st.textContent = ".oc-ae-floated-hidden{display:none!important}";
    doc.head.appendChild(st);
  }
}

// OpenCode ae-float-p18: 浮窗关闭淡出；停靠罗盘、预览框、方块的过渡动效
function ocAeFloatLeave(frame) {
  frame.classList.add("oc-leave");
  setTimeout(() => frame.remove(), 170);
}
function ocAeMotionStyle(doc) {
  if (doc.getElementById("oc-ae-motion-style")) return;
  const st = doc.createElement("style");
  st.id = "oc-ae-motion-style";
  st.textContent = `
@keyframes ocAeCompassIn{from{opacity:0}to{opacity:1}}
.oc-ae-dock-compass{animation:ocAeCompassIn .16s cubic-bezier(.2,.8,.2,1)}
.oc-ae-dock-tile{transition:transform .12s cubic-bezier(.2,.8,.2,1),background-color .12s ease,box-shadow .12s ease,border-color .12s ease}
.oc-ae-dock-tile:hover,.oc-ae-dock-tile.active{transform:scale(1.08)}
.oc-ae-dock-preview{border-radius:6px;transition:left .14s cubic-bezier(.2,.8,.2,1),top .14s cubic-bezier(.2,.8,.2,1),width .14s cubic-bezier(.2,.8,.2,1),height .14s cubic-bezier(.2,.8,.2,1),opacity .12s ease}
.oc-ae-dock-label{transition:opacity .12s ease}
@media (prefers-reduced-motion:reduce){.oc-ae-dock-compass{animation:none}.oc-ae-dock-tile,.oc-ae-dock-preview,.oc-ae-dock-label{transition:none}}
`;
  doc.head.appendChild(st);
}
// OpenCode chat-preview-step08: 对话里点开的资源都在中间编辑区预览；编辑区本身不能预览的（HTML 运行、PDF、字体）用预览页，Markdown 用内置预览，本地网页用内置浏览器。
var OC_PREVIEW_PAGE_KINDS = new Set(["html", "pdf", "font", "markdown", "web"]);
var OC_PREVIEW_EXT = {
  image: { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", jfif: "image/jpeg", gif: "image/gif", webp: "image/webp", bmp: "image/bmp", ico: "image/x-icon", svg: "image/svg+xml", avif: "image/avif", apng: "image/apng" },
  audio: { mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", flac: "audio/flac", m4a: "audio/mp4", aac: "audio/aac", opus: "audio/ogg", weba: "audio/webm" },
  video: { mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", m4v: "video/mp4", ogv: "video/ogg" },
  html: { html: "text/html", htm: "text/html", xhtml: "application/xhtml+xml" },
  pdf: { pdf: "application/pdf" },
  markdown: { md: "text/markdown", markdown: "text/markdown", mdown: "text/markdown", mkd: "text/markdown" },
  table: { csv: "text/csv", tsv: "text/tab-separated-values" },
  json: { json: "application/json", jsonc: "application/json", json5: "application/json", geojson: "application/geo+json", jsonl: "application/jsonl", ndjson: "application/jsonl" },
  text: { txt: "text/plain", log: "text/plain", text: "text/plain" },
  font: { ttf: "font/ttf", otf: "font/otf", woff: "font/woff", woff2: "font/woff2" }
};
var OC_PREVIEW_STATE = { bypass: 0, lastChatInput: 0 };
var OC_PREVIEW_CHAT_SELECTOR = ".interactive-session, .chat-widget, .interactive-item-container, [class*='opencode-bridge'], [class*='opencode-chat']";
function ocPreviewExt(uri) {
  const p = (uri?.path || "").toLowerCase();
  const slash = p.lastIndexOf("/");
  const dot = p.lastIndexOf(".");
  return dot > slash ? p.slice(dot + 1) : "";
}
function ocPreviewKindOf(uri) {
  const ext = ocPreviewExt(uri);
  for (const kind of Object.keys(OC_PREVIEW_EXT)) {
    if (OC_PREVIEW_EXT[kind][ext]) return { kind, mime: OC_PREVIEW_EXT[kind][ext] };
  }
  return void 0;
}
function ocPreviewIsLocalWeb(uri) {
  if (!uri || uri.scheme !== "http" && uri.scheme !== "https") return false;
  const host = (uri.authority || "").replace(/^.*@/, "").replace(/:\d+$/, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "[::1]" || host.endsWith(".localhost");
}
function ocPreviewName(uri, fallback) {
  let name = (uri?.path || "").split("/").pop() || fallback || "\u9884\u89C8";
  try {
    name = decodeURIComponent(name);
  } catch {
  }
  return uri && (uri.scheme === "http" || uri.scheme === "https") ? uri.authority + (uri.path && uri.path !== "/" ? uri.path : "") : name;
}
function ocPreviewItemFor(uri) {
  if (!uri || typeof uri !== "object") return void 0;
  if (ocPreviewIsLocalWeb(uri)) return { kind: "web", uri, name: ocPreviewName(uri) };
  if (uri.scheme === "http" || uri.scheme === "https" || uri.scheme === "command" || uri.scheme === "mailto") return void 0;
  const k = ocPreviewKindOf(uri);
  if (!k) return void 0;
  try {
    if (OC_PREVIEW_STATE.fileService && !OC_PREVIEW_STATE.fileService.hasProvider(uri)) return void 0;
  } catch {
  }
  return { kind: k.kind, mime: k.mime, uri: uri.with({ fragment: "" }), name: ocPreviewName(uri) };
}
function ocPreviewPageItem(uri) {
  const item = ocPreviewItemFor(uri);
  if (!item) return void 0;
  if (item.kind === "image" && ocPreviewExt(uri) === "svg") return { ...item, kind: "html" };
  return OC_PREVIEW_PAGE_KINDS.has(item.kind) ? item : void 0;
}
function ocPreviewFromChat() {
  if (Date.now() - OC_PREVIEW_STATE.lastChatInput < 2500) return true;
  try {
    for (const { window: win } of ocPreviewGetWindows()) {
      const active = win.document.activeElement;
      if (active?.closest?.(OC_PREVIEW_CHAT_SELECTOR)) return true;
    }
  } catch {
  }
  return false;
}
function ocPreviewTrackWindow(win) {
  if (!win || win.__ocPreviewTracked) return;
  win.__ocPreviewTracked = true;
  const mark = (e) => {
    try {
      if (e.target?.closest?.(OC_PREVIEW_CHAT_SELECTOR)) OC_PREVIEW_STATE.lastChatInput = Date.now();
      else if (e.type === "pointerdown") OC_PREVIEW_STATE.lastChatInput = 0;
    } catch {
    }
  };
  win.addEventListener("pointerdown", mark, true);
  win.addEventListener("keydown", mark, true);
}
function ocPreviewEscape(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function ocPreviewWebHtml(url) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe src="${ocPreviewEscape(url)}" allow="autoplay; clipboard-read; clipboard-write; fullscreen; microphone; camera"></iframe></body></html>`;
}
function ocPreviewHtmlDoc(text, baseHref) {
  const browserDefaults = `<style id="oc-preview-browser-defaults">html{background:#fff;color:#000;color-scheme:light}body{margin:8px;padding:0;color:#000;background:transparent;font-family:initial;font-size:initial;font-weight:initial}a{color:-webkit-link}code{color:inherit;font-family:monospace;font-size:inherit}</style>`;
  const baseTag = (/<base\s/i.test(text) ? "" : `<base href="${ocPreviewEscape(baseHref)}">`) + browserDefaults;
  if (/<head[^>]*>/i.test(text)) return text.replace(/<head[^>]*>/i, (m) => m + baseTag);
  if (/<html[^>]*>/i.test(text)) return text.replace(/<html[^>]*>/i, (m) => m + "<head>" + baseTag + "</head>");
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${baseTag}</head><body>${text}</body></html>`;
}
var OC_PREVIEW_DOC_STYLE = `html,body{margin:0;background:transparent;color:var(--vscode-foreground);font-family:var(--vscode-font-family);font-size:13px}
body{padding:12px 16px;box-sizing:border-box}
pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:var(--vscode-editor-font-family);font-size:var(--vscode-editor-font-size,12px);line-height:1.5}
table{border-collapse:collapse;font-size:12px}
th,td{border:1px solid var(--vscode-panel-border,#8884);padding:3px 8px;text-align:left;white-space:nowrap;max-width:420px;overflow:hidden;text-overflow:ellipsis}
th{position:sticky;top:0;background:var(--vscode-editor-background);font-weight:600}
tr:nth-child(even) td{background:#80808012}
.oc-note{opacity:.7;margin:8px 0;font-size:12px}
.oc-err{color:var(--vscode-errorForeground);white-space:pre-wrap}`;
function ocPreviewTextDoc(inner, extraHead) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">${extraHead || ""}<style>${OC_PREVIEW_DOC_STYLE}</style></head><body>${inner}</body></html>`;
}
function ocPreviewFontHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${OC_PREVIEW_DOC_STYLE}
.s{font-family:ocPreviewFont,sans-serif;margin:6px 0;line-height:1.3;word-break:break-all}
.g{font-family:ocPreviewFont,sans-serif;font-size:28px;letter-spacing:6px;line-height:1.6;word-break:break-all;margin-top:12px}</style></head><body>
<div id="info" class="oc-note">\u52A0\u8F7D\u5B57\u4F53\u2026</div><div id="out"></div>
<script>
window.addEventListener("message",async function(e){var d=e.data;if(!d||d.type!=="ocPreviewLoad")return;
try{var f=new FontFace("ocPreviewFont",d.data);await f.load();document.fonts.add(f);
document.getElementById("info").textContent=(f.family||"")+"  "+(f.style||"")+" "+(f.weight||"");
var t="The quick brown fox jumps over the lazy dog 0123456789 \u6C38\u548C\u4E5D\u5E74\uFF0C\u5C81\u5728\u7678\u4E11";
var h="";[12,16,20,28,40,64].forEach(function(z){h+='<div class="s" style="font-size:'+z+'px">'+z+'px  '+t+'</div>';});
h+='<div class="g">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^&amp;*()[]{}&lt;&gt;?/\\\\|;:\\'",.~ \u4F60\u597D\u4E16\u754C</div>';
document.getElementById("out").innerHTML=h;}catch(err){document.getElementById("info").className="oc-err";document.getElementById("info").textContent="\u5B57\u4F53\u52A0\u8F7D\u5931\u8D25\uFF1A"+err;}});
</script></body></html>`;
}
function ocPreviewPdfHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${OC_PREVIEW_DOC_STYLE}
body{padding:8px}#pages{display:flex;flex-direction:column;align-items:center;gap:10px}
canvas{box-shadow:0 1px 4px #0006;background:#fff;max-width:100%}
#bar{position:sticky;top:0;z-index:2;display:flex;gap:6px;align-items:center;justify-content:center;padding:4px;background:var(--vscode-editor-background);font-size:12px}
#bar button{border:0;background:transparent;color:var(--vscode-foreground);cursor:pointer;padding:1px 8px;border-radius:4px;font-size:13px}
#bar button:hover{background:var(--vscode-toolbar-hoverBackground)}</style></head><body>
<div id="bar"><button id="zo">\u2212</button><span id="info">\u52A0\u8F7D PDF\u2026</span><button id="zi">+</button></div><div id="pages"></div>
<script>
var pdfDoc=null,zoom=1,renderSeq=0;
async function renderAll(){var seq=++renderSeq;var host=document.getElementById("pages");host.innerHTML="";
for(var i=1;i<=pdfDoc.numPages;i++){if(seq!==renderSeq)return;var page=await pdfDoc.getPage(i);var v0=page.getViewport({scale:1});
var fit=Math.max(0.2,(document.body.clientWidth-24)/v0.width)*zoom;var dpr=window.devicePixelRatio||1;var vp=page.getViewport({scale:fit*dpr});
var c=document.createElement("canvas");c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);c.style.width=Math.floor(vp.width/dpr)+"px";host.appendChild(c);
await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;}}
document.getElementById("zi").onclick=function(){zoom=Math.min(4,zoom*1.25);if(pdfDoc)renderAll();};
document.getElementById("zo").onclick=function(){zoom=Math.max(0.25,zoom/1.25);if(pdfDoc)renderAll();};
window.addEventListener("message",async function(e){var d=e.data;if(!d||d.type!=="ocPdf")return;
try{var lib=await import(URL.createObjectURL(new Blob([d.lib],{type:"text/javascript"})));
lib.GlobalWorkerOptions.workerPort=new Worker(URL.createObjectURL(new Blob([d.worker],{type:"text/javascript"})),{type:"module"});
pdfDoc=await lib.getDocument({data:new Uint8Array(d.data),isEvalSupported:false}).promise;
document.getElementById("info").textContent=pdfDoc.numPages+" \u9875";await renderAll();}
catch(err){var i=document.getElementById("info");i.className="oc-err";i.textContent="PDF \u52A0\u8F7D\u5931\u8D25\uFF1A"+err;}});
</script></body></html>`;
}
async function ocPreviewPdfLib(fileService) {
  if (OC_PREVIEW_STATE.pdfjs) return OC_PREVIEW_STATE.pdfjs;
  const base = URI.joinPath(FileAccess.asFileUri(""), "..", "extensions", "opencode", "media", "pdfjs");
  const dec = new TextDecoder("utf-8");
  const [lib, worker] = await Promise.all([
    fileService.readFile(URI.joinPath(base, "pdf.lib.txt")),
    fileService.readFile(URI.joinPath(base, "pdf.worker.txt"))
  ]);
  OC_PREVIEW_STATE.pdfjs = { lib: dec.decode(lib.value.buffer), worker: dec.decode(worker.value.buffer) };
  return OC_PREVIEW_STATE.pdfjs;
}
// 在中间编辑区用「预览页」打开：HTML（可运行）、PDF、字体，以及 Markdown/本地网页的兜底。
var OC_PREVIEW_PAGES = new Map();
var OC_PREVIEW_PAGE_URIS = new WeakMap();
async function ocPreviewRenderPage(wv, item, instantiationService) {
  const fileService = OC_PREVIEW_STATE.fileService;
  const p = item.uri.path;
  const dir = item.uri.with({ path: p.slice(0, p.lastIndexOf("/") + 1), query: "", fragment: "" });
  if (item.kind === "web") {
    wv.contentOptions = { allowScripts: true, localResourceRoots: [] };
    wv.setHtml(ocPreviewWebHtml(item.uri.toString(true)));
  } else if (item.kind === "html") {
    const raw = await fileService.readFile(item.uri);
    const text = new TextDecoder("utf-8").decode(raw.value.buffer);
    wv.contentOptions = { allowScripts: true, allowForms: true, localResourceRoots: [dir] };
    wv.setHtml(ocPreviewHtmlDoc(text, asWebviewUri(dir).toString()));
  } else if (item.kind === "pdf") {
    const [lib, raw] = await Promise.all([ocPreviewPdfLib(fileService), fileService.readFile(item.uri)]);
    wv.contentOptions = { allowScripts: true, localResourceRoots: [] };
    wv.setHtml(ocPreviewPdfHtml());
    const copy = new Uint8Array(raw.value.buffer).slice().buffer;
    wv.postMessage({ type: "ocPdf", lib: lib.lib, worker: lib.worker, data: copy }, [copy]);
  } else if (item.kind === "font") {
    const raw = await fileService.readFile(item.uri);
    wv.contentOptions = { allowScripts: true, localResourceRoots: [] };
    wv.setHtml(ocPreviewFontHtml());
    const copy = new Uint8Array(raw.value.buffer).slice().buffer;
    wv.postMessage({ type: "ocPreviewLoad", data: copy, mime: item.mime || "application/octet-stream" }, [copy]);
  } else if (item.kind === "markdown") {
    const raw = await fileService.readFile(item.uri);
    const text = new TextDecoder("utf-8").decode(raw.value.buffer);
    const body = await instantiationService.invokeFunction((a) => renderMarkdownDocument(text, a.get(IExtensionService), a.get(ILanguageService), {}));
    wv.contentOptions = { allowScripts: false, localResourceRoots: [dir] };
    wv.setHtml(ocPreviewTextDoc(`<div class="markdown-body">${body}</div>`, `<base href="${ocPreviewEscape(asWebviewUri(dir).toString())}"><style>${DEFAULT_MARKDOWN_STYLES}</style>`));
  }
}
// 只创建（或复用）预览页标签，不打开；供编辑器解析器直接替换使用，避免先显示源码再闪一下。
function ocPreviewGetPageInput(item, instantiationService) {
  const key = item.uri.toString();
  let input = OC_PREVIEW_PAGES.get(key);
  if (input && !input.isDisposed()) return input;
  const title = item.name || "";
  input = instantiationService.invokeFunction((a) => {
    const webview = a.get(OcWebviewService).createWebviewOverlay({
      providedViewType: "opencode.preview",
      title,
      options: { retainContextWhenHidden: true, enableFindWidget: true },
      contentOptions: { allowScripts: true, localResourceRoots: [] },
      extension: void 0
    });
    return a.get(IInstantiationService).createInstance(WebviewInput, { viewType: "opencode.preview", name: title, providedId: "opencode.preview", iconPath: void 0 }, webview);
  });
  OC_PREVIEW_PAGES.set(key, input);
  OC_PREVIEW_PAGE_URIS.set(input, item.uri);
  const sub = input.onWillDispose(() => {
    if (OC_PREVIEW_PAGES.get(key) === input) OC_PREVIEW_PAGES.delete(key);
    sub.dispose();
  });
  ocPreviewRenderPage(input.webview, item, instantiationService).catch(() => {});
  return input;
}
async function ocPreviewOpenPage(item, instantiationService, group) {
  const input = ocPreviewGetPageInput(item, instantiationService);
  await instantiationService.invokeFunction((a) => a.get(IEditorService).openEditor(input, { pinned: true }, group ?? ACTIVE_GROUP));
  return input;
}
var OpenCodeChatPreview = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openCodeChatPreview";
  }
  constructor(openerService, fileService, commandService, instantiationService, logService) {
    super();
    OC_PREVIEW_STATE.fileService = fileService;
    try {
      for (const { window: win } of ocPreviewGetWindows()) ocPreviewTrackWindow(win);
      this._register(ocPreviewOnDidRegisterWindow(({ window: win }) => ocPreviewTrackWindow(win)));
    } catch {
    }
    const open = async (item) => {
      try {
        if (item.kind === "web") {
          try {
            await commandService.executeCommand("simpleBrowser.show", item.uri.toString(true));
            return;
          } catch {
          }
        }
        await ocPreviewOpenPage(item, instantiationService);
      } catch (error) {
        logService?.warn?.("[OpenCode] preview failed", error);
      }
    };
    // 对话里点开的链接：图片/音视频/文本类交给默认编辑器（中间区本身就能预览）；
    // HTML、PDF、字体、Markdown、本地网页在中间区用预览页打开。
    this._register(openerService.registerOpener({
      open: async (target, options3) => {
        if (OC_PREVIEW_STATE.bypass > 0 || options3?.openExternal || options3?.openToSide) return false;
        if (!ocPreviewFromChat()) return false;
        let uri;
        try {
          uri = typeof target === "string" ? URI.parse(target) : target;
        } catch {
          return false;
        }
        const item = ocPreviewPageItem(uri);
        if (!item) return false;
        // 文件走正常打开，由编辑器解析器按默认模式直接打开成预览或源码；这里只接管本地网页链接。
        if (item.kind !== "web") return false;
        open(item);
        return true;
      }
    }));
  }
};
OpenCodeChatPreview = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService)
], OpenCodeChatPreview);
registerWorkbenchContribution2(OpenCodeChatPreview.ID, OpenCodeChatPreview, WorkbenchPhase.BlockRestore);

// 编辑器标题栏右上角只有一个「预览/源码」切换按钮（HTML、SVG、Markdown、PDF、字体），固定在最右侧。
// 点一下切换的是默认模式：所有这类标签一起切，之后打开的也按这个模式打开（记住选择）。
// 预览：本地 HTML 用内置浏览器（Integrated Browser），其余用预览页；源码：普通文本编辑器。
// 打开时由编辑器解析器直接选对编辑器，切换时原位替换标签，不会先显示另一种再闪一下。
var OC_PREVIEW_EXTS = ["html", "htm", "xhtml", "svg", "md", "markdown", "mdown", "mkd", "pdf", "ttf", "otf", "woff", "woff2"];
var OC_PREVIEW_EXT_RE = /^\.(html?|xhtml|svg|md|markdown|mdown|mkd|pdf|ttf|otf|woff2?)$/i;
var OC_PREVIEW_ACTIVE = ContextKeyExpr.equals("activeWebviewPanelId", "opencode.preview");
var OC_PREVIEW_EDITOR_ID = "opencode.preview";
var OC_BROWSER_EDITOR_ID = "workbench.editor.browser";
var OC_BROWSER_INPUT_TYPE = "workbench.editorinputs.browser";
var OC_PREVIEW_MODE_KEY = new RawContextKey("opencode.previewMode", true);
var OC_PREVIEW_MODE_STORAGE = "opencode.preview.mode";
OC_PREVIEW_STATE.mode = true;
globalThis.__ocPreviewMode = true;
function ocPreviewMatches(uri) {
  return !!(uri && OC_PREVIEW_EXT_RE.test("." + ocPreviewExt(uri)) && ocPreviewPageItem(uri));
}
function ocPreviewUsesBrowser(uri) {
  return uri.scheme === "file" && /^(html?)$/.test(ocPreviewExt(uri));
}
function ocPreviewSetMode(mode) {
  OC_PREVIEW_STATE.mode = mode;
  globalThis.__ocPreviewMode = mode;
  OC_PREVIEW_STATE.modeKey?.set(mode);
}
// 返回 { uri, state: "preview" | "source" }；不是这类文件返回 undefined。
function ocPreviewStateOf(input) {
  if (!input) return void 0;
  const page = OC_PREVIEW_PAGE_URIS.get(input);
  if (page) return { uri: page, state: "preview" };
  if (input.typeId === OC_BROWSER_INPUT_TYPE) {
    const assoc = input.associatedResource;
    return assoc && ocPreviewMatches(assoc) ? { uri: assoc, state: "preview" } : void 0;
  }
  const uri = input.resource;
  if (!uri || uri.scheme === "vscode-browser" || uri.scheme === "webview-panel") return void 0;
  return ocPreviewMatches(uri) ? { uri, state: "source" } : void 0;
}
async function ocPreviewApplyMode(accessor) {
  const editorService = accessor.get(IEditorService);
  const groupsService = accessor.get(IEditorGroupsService);
  const want = OC_PREVIEW_STATE.mode ? "preview" : "source";
  for (const group of groupsService.groups) {
    const replacements = [];
    for (const input of group.editors) {
      const info = ocPreviewStateOf(input);
      if (!info || info.state === want || input.isDirty()) continue;
      const override = want === "source" ? "default" : ocPreviewUsesBrowser(info.uri) ? OC_BROWSER_EDITOR_ID : OC_PREVIEW_EDITOR_ID;
      replacements.push({ editor: input, replacement: { resource: info.uri, options: { override, pinned: true } } });
    }
    if (replacements.length) {
      try {
        await editorService.replaceEditors(replacements, group);
      } catch {
      }
    }
  }
}
var OpenCodePreviewMode = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openCodePreviewMode";
  }
  constructor(storageService, contextKeyService, editorResolverService, instantiationService, fileService) {
    super();
    OC_PREVIEW_STATE.fileService = OC_PREVIEW_STATE.fileService || fileService;
    OC_PREVIEW_STATE.storage = storageService;
    OC_PREVIEW_STATE.modeKey = OC_PREVIEW_MODE_KEY.bindTo(contextKeyService);
    ocPreviewSetMode(storageService.getBoolean(OC_PREVIEW_MODE_STORAGE, -1, true));
    // 预览模式下这类文件默认用预览页打开（本地 HTML 的默认打开方式在内置浏览器那边按同一个模式切换）。
    for (const ext of OC_PREVIEW_EXTS) {
      this._register(editorResolverService.registerEditor(
        `**/*.${ext}`,
        { id: OC_PREVIEW_EDITOR_ID, label: "\u9884\u89C8", priority: "default" },
        {
          canSupportResource: (resource) => OC_PREVIEW_STATE.mode && !ocPreviewUsesBrowser(resource) && !!ocPreviewPageItem(resource),
          singlePerResource: true
        },
        {
          createEditorInput: ({ resource, options: options3 }) => {
            const item = ocPreviewPageItem(resource);
            return { editor: ocPreviewGetPageInput(item, instantiationService), options: { pinned: true, ...options3 } };
          }
        }
      ));
    }
  }
};
OpenCodePreviewMode = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, OcEditorResolverService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IFileService)
], OpenCodePreviewMode);
registerWorkbenchContribution2(OpenCodePreviewMode.ID, OpenCodePreviewMode, WorkbenchPhase.BlockStartup);
registerAction2(class OpenCodeTogglePreviewAction extends Action2 {
  constructor() {
    super({
      id: "opencode.preview.toggle",
      title: { value: "\u9884\u89C8 / \u6E90\u7801", original: "Toggle Preview / Source" },
      icon: Codicon.openPreview,
      toggled: { condition: OC_PREVIEW_MODE_KEY, icon: Codicon.code, title: "\u5207\u6362\u5230\u6E90\u7801" },
      f1: true,
      menu: [{
        id: MenuId.EditorTitle,
        group: "navigation",
        order: 1e7,
        when: ContextKeyExpr.or(ContextKeyExpr.regex("resourceExtname", OC_PREVIEW_EXT_RE), OC_PREVIEW_ACTIVE, ContextKeyExpr.equals("activeEditor", OC_BROWSER_EDITOR_ID))
      }]
    });
  }
  async run(accessor) {
    OC_PREVIEW_STATE.fileService = OC_PREVIEW_STATE.fileService || accessor.get(IFileService);
    const info = ocPreviewStateOf(accessor.get(IEditorService).activeEditor);
    // 以当前标签的状态为准：正在预览就切到源码，正在看源码就切到预览。
    ocPreviewSetMode(info ? info.state !== "preview" : !OC_PREVIEW_STATE.mode);
    try { OC_PREVIEW_STATE.storage?.store(OC_PREVIEW_MODE_STORAGE, OC_PREVIEW_STATE.mode, -1, 0); } catch {}
    await ocPreviewApplyMode(accessor);
  }
});

