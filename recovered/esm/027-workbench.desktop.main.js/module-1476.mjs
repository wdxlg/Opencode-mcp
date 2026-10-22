// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
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
import { IViewDescriptorService } from "./module-1093.mjs";
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
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId), ChatContextKeys.openCodeBridgeMode.negate()),
          group: "navigation",
          order: 5
        }]
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
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.equals("view", ChatViewId), ChatContextKeys.openCodeBridgeMode),
          group: "navigation",
          order: 5
        }]
      });
    }
    async run(accessor) {
      await accessor.get(ICommandService).executeCommand("_opencode.bridge.showChat");
    }
  });
  MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
    command: {
      id: AICustomizationManagementCommands2.OpenEditor,
      title: localize2(8560, "Open Customizations"),
      category: CHAT_CATEGORY,
      icon: Codicon.gear
    },
    group: "navigation",
    when: ContextKeyExpr.and(
      ChatContextKeys.enabled,
      ContextKeyExpr.equals("view", ChatViewId)
    ),
    order: 6
  });
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
export { waitForDefaultAgent, getPendingConfirmationInfo, getOpenChatActionIdForMode, registerChatActions, stringifyItem, computeToolEnablementMap, handleCurrentEditingSession, handleModeSwitch, clearChatSessionPreservingType, CHAT_CATEGORY, COPILOT_CLI_AGENT_HOST_PROVIDER_ID, ACTION_ID_NEW_CHAT, ACTION_ID_NEW_EDIT_SESSION, ACTION_ID_OPEN_CHAT, CHAT_OPEN_ACTION_ID, CHAT_SETUP_ACTION_ID, CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID, TOGGLE_CHAT_ACTION_ID, GENERATE_AGENT_INSTRUCTIONS_COMMAND_ID, GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID, GENERATE_AGENT_COMMAND_ID, GENERATE_HOOK_COMMAND_ID, INSERT_FORK_CONVERSATION_COMMAND_ID, INSERT_TROUBLESHOOT_COMMAND_ID, defaultChat, OPEN_CHAT_QUOTA_EXCEEDED_DIALOG, OpenChatGlobalAction, PrimaryOpenChatGlobalAction, ModeOpenChatGlobalAction };
