// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/chat.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IPluginGitService } from "./module-2741.mjs";
import { NativePluginGitCommandService } from "./module-4120.mjs";
import { registerSharedProcessRemoteService } from "./module-3729.mjs";
import { ILocalGitService } from "./module-4099.mjs";
import { Disposable } from "./module-0012.mjs";
import { ipcRenderer } from "./module-3724.mjs";
import { URI } from "./module-0032.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0981.mjs";
import { localize } from "./module-0001.mjs";
import { resolve } from "./module-0026.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ACTION_ID_NEW_CHAT, CHAT_OPEN_ACTION_ID } from "./module-1476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { autorun } from "./module-0052.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IChatService } from "./module-0972.mjs";
import { confirmSessionShutdown, getEffectiveSessionShutdownReason, shouldWarnForInFlightSessionShutdown, shouldWarnForSessionShutdown } from "./module-4112.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED } from "./module-0964.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { AgentsHandoffInputTipContribution, OpenAgentsWindowAction, OpenChatSessionInAgentsWindowAction, OpenWorkspaceInAgentsContribution, OpenWorkspaceInAgentsWindowAction, OpenWorkspaceInAgentsWindowChatTitleAction, OpenWorkspaceInAgentsWindowTitleBarAction, ToggleOpenInAgentsWindowTitleBarAction } from "./module-4114.mjs";
import { HoldToVoiceChatInChatViewAction, InlineVoiceChatAction, KeywordActivationContribution, QuickVoiceChatAction, ReadChatResponseAloud, StartVoiceChatAction, StopListeningAction, StopListeningAndSubmitAction, StopReadAloud, StopReadChatItemAloud, VoiceChatInChatViewAction } from "./module-4113.mjs";
import { registerChatDeveloperActions2 } from "./module-4108.mjs";
import { registerChatExportZipAction } from "./module-4109.mjs";
import { registerExportAgentTracesDbAction } from "./module-4110.mjs";
import { registerInstallDictationModelAction } from "./module-4111.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { NativeBuiltinToolsContribution } from "./module-4119.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { timeout } from "./module-0036.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { openChatSession } from "./module-1478.mjs";
import { AgentSessionProviders, getAgentSessionProviderName } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/electron-browser/chat.contribution.ts
registerSingleton(IPluginGitService, NativePluginGitCommandService, 1 /* Delayed */);

registerSharedProcessRemoteService(ILocalGitService, "localGit");

var ChatCommandLineHandler = class extends Disposable {
  constructor(environmentService, commandService, workspaceTrustRequestService, logService, layoutService, contextKeyService, chatWidgetService) {
    super();
    this.environmentService = environmentService;
    this.commandService = commandService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.logService = logService;
    this.layoutService = layoutService;
    this.contextKeyService = contextKeyService;
    this.chatWidgetService = chatWidgetService;
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.chatCommandLineHandler";
  }
  registerListeners() {
    const handleChatRequest = (_, ...args2) => {
      const chatArgs = args2[0];
      this.logService.trace("vscode:handleChatRequest", chatArgs);
      this.prompt(chatArgs).catch((err) => this.logService.error("vscode:handleChatRequest failed", err));
    };
    ipcRenderer.on("vscode:handleChatRequest", handleChatRequest);
    this._register({ dispose: () => ipcRenderer.removeListener("vscode:handleChatRequest", handleChatRequest) });
    const handleOpenChatSession = (_, ...args2) => {
      const sessionUriString = args2[0];
      this.logService.trace("vscode:openChatSession", sessionUriString);
      const sessionResource = URI.parse(sessionUriString);
      Promise.resolve(this.chatWidgetService.openSession(sessionResource, ChatViewPaneTarget)).catch((err) => this.logService.error("vscode:openChatSession failed", err));
    };
    ipcRenderer.on("vscode:openChatSession", handleOpenChatSession);
    this._register({ dispose: () => ipcRenderer.removeListener("vscode:openChatSession", handleOpenChatSession) });
  }
  async prompt(args2) {
    if (!Array.isArray(args2?._)) {
      return;
    }
    const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(13598, null)
    });
    if (!trusted) {
      return;
    }
    const opts = {
      query: args2._.length > 0 ? args2._.join(" ") : "",
      mode: args2.mode ?? "agent" /* Agent */,
      attachFiles: args2["add-file"]?.map((file) => URI.file(resolve(file)))
      // use `resolve` to deal with relative paths properly
    };
    if (args2.maximize) {
      const location2 = this.contextKeyService.getContextKeyValue(ChatContextKeys.panelLocation.key);
      if (location2 === 2 /* AuxiliaryBar */) {
        this.layoutService.setAuxiliaryBarMaximized(true);
      } else if (location2 === 1 /* Panel */ && !this.layoutService.isPanelMaximized()) {
        this.layoutService.toggleMaximizedPanel();
      }
    }
    await this.commandService.executeCommand(ACTION_ID_NEW_CHAT);
    await this.commandService.executeCommand(CHAT_OPEN_ACTION_ID, opts);
  }
};

ChatCommandLineHandler = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IWorkspaceTrustRequestService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IChatWidgetService)
], ChatCommandLineHandler);

var ChatSuspendThrottlingHandler = class extends Disposable {
  static {
    this.ID = "workbench.contrib.chatSuspendThrottlingHandler";
  }
  constructor(nativeHostService, chatService) {
    super();
    this._register(autorun((reader) => {
      const running = chatService.requestInProgressObs.read(reader);
      nativeHostService.setBackgroundThrottling(!running);
    }));
  }
};

ChatSuspendThrottlingHandler = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IChatService)
], ChatSuspendThrottlingHandler);

var ChatLifecycleHandler = class extends Disposable {
  constructor(lifecycleService, agentSessionsService, dialogService, widgetService, contextKeyService, extensionService, environmentService, chatEntitlementService, nativeHostService, chatService) {
    super();
    this.agentSessionsService = agentSessionsService;
    this.dialogService = dialogService;
    this.widgetService = widgetService;
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.chatEntitlementService = chatEntitlementService;
    this.nativeHostService = nativeHostService;
    this.chatService = chatService;
    this._register(lifecycleService.onBeforeShutdown((e) => {
      e.veto(this.shouldVetoShutdown(e.reason), "veto.chat");
    }));
    this._register(extensionService.onWillStop((e) => {
      e.veto(this.hasSessionThatWillStop(1 /* CLOSE */), localize(13597, null));
    }));
  }
  static {
    this.ID = "workbench.contrib.chatLifecycleHandler";
  }
  hasSessionThatWillStop(reason) {
    if (this.chatEntitlementService.sentiment.hidden) {
      return false;
    }
    if (shouldWarnForInFlightSessionShutdown(this.chatService.getPendingRequestSessionTypes(), reason)) {
      return true;
    }
    return this.agentSessionsService.model.sessions.some((session) => shouldWarnForSessionShutdown(session, reason));
  }
  async shouldVetoShutdown(reason) {
    if (this.environmentService.enableSmokeTestDriver) {
      return false;
    }
    const windowCount = reason === 1 /* CLOSE */ ? await this.nativeHostService.getWindowCount() : 0;
    const effectiveReason = getEffectiveSessionShutdownReason(reason, windowCount, isMacintosh);
    if (!this.hasSessionThatWillStop(effectiveReason)) {
      return false;
    }
    if (ChatContextKeys.skipChatRequestInProgressMessage.getValue(this.contextKeyService) === true) {
      return false;
    }
    this.widgetService.revealWidget();
    return !await confirmSessionShutdown(this.dialogService, effectiveReason);
  }
};

ChatLifecycleHandler = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, IAgentSessionsService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, INativeWorkbenchEnvironmentService),
  __decorateParam(7, IChatEntitlementService),
  __decorateParam(8, INativeHostService),
  __decorateParam(9, IChatService)
], ChatLifecycleHandler);

if (OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED) {
  registerAction2(OpenWorkspaceInAgentsWindowAction);
  registerAction2(OpenWorkspaceInAgentsWindowChatTitleAction);
  registerAction2(OpenWorkspaceInAgentsWindowTitleBarAction);
  registerAction2(ToggleOpenInAgentsWindowTitleBarAction);
  registerAction2(OpenAgentsWindowAction);
  registerAction2(OpenChatSessionInAgentsWindowAction);
}

registerAction2(StartVoiceChatAction);

registerAction2(VoiceChatInChatViewAction);

registerAction2(HoldToVoiceChatInChatViewAction);

registerAction2(QuickVoiceChatAction);

registerAction2(InlineVoiceChatAction);

registerAction2(StopListeningAction);

registerAction2(StopListeningAndSubmitAction);

registerAction2(ReadChatResponseAloud);

registerAction2(StopReadChatItemAloud);

registerAction2(StopReadAloud);

registerChatDeveloperActions2();

registerChatExportZipAction();

registerExportAgentTracesDbAction();

registerInstallDictationModelAction();

registerWorkbenchContribution2(KeywordActivationContribution.ID, KeywordActivationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(NativeBuiltinToolsContribution.ID, NativeBuiltinToolsContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatCommandLineHandler.ID, ChatCommandLineHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChatSuspendThrottlingHandler.ID, ChatSuspendThrottlingHandler, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ChatLifecycleHandler.ID, ChatLifecycleHandler, WorkbenchPhase.AfterRestored);

if (OPENCODE_NATIVE_AGENTS_WINDOW_ENABLED) {
  registerWorkbenchContribution2(OpenWorkspaceInAgentsContribution.ID, OpenWorkspaceInAgentsContribution, WorkbenchPhase.BlockRestore);
  registerWorkbenchContribution2(AgentsHandoffInputTipContribution.ID, AgentsHandoffInputTipContribution, WorkbenchPhase.Eventually);
}

var AGENT_HOST_REGISTRATION_TIMEOUT_MS = 3e4;

function getCopilotAgentInfo(rootState) {
  if (!rootState || rootState instanceof Error) {
    return void 0;
  }
  return rootState.agents.find((a) => a.provider === "copilotcli");
}

async function resolveAgentHostSessionType(agentHostService) {
  const agent = getCopilotAgentInfo(agentHostService.rootState.value);
  if (agent) {
    return `agent-host-${agent.provider}`;
  }
  const cts = new CancellationTokenSource();
  const waitForAgent = new Promise((res) => {
    const sub = agentHostService.rootState.onDidChange((state) => {
      const found = getCopilotAgentInfo(state);
      if (found) {
        sub.dispose();
        res(found);
      }
    });
    cts.token.onCancellationRequested(() => {
      sub.dispose();
      res(void 0);
    });
  });
  const resolved = await Promise.race([
    waitForAgent,
    timeout(AGENT_HOST_REGISTRATION_TIMEOUT_MS).then(() => {
      cts.cancel();
      cts.dispose();
      return void 0;
    })
  ]);
  if (!resolved) {
    throw new Error("Agent host did not register a copilotcli agent within the timeout period. Ensure the agent host is enabled and running.");
  }
  return `agent-host-${resolved.provider}`;
}

async function openNewAgentHostSession(accessor, position2) {
  const agentHostService = accessor.get(IAgentHostService);
  const instantiationService = accessor.get(IInstantiationService);
  const sessionType = await resolveAgentHostSessionType(agentHostService);
  return instantiationService.invokeFunction((innerAccessor) => openChatSession(innerAccessor, {
    type: sessionType,
    displayName: getAgentSessionProviderName(sessionType),
    position: position2
  }));
}

CommandsRegistry.registerCommand(
  `workbench.action.chat.openNewSessionSidebar.${AgentSessionProviders.AgentHostCopilot}`,
  (accessor) => openNewAgentHostSession(accessor, "sidebar" /* Sidebar */)
);

CommandsRegistry.registerCommand(
  `workbench.action.chat.openNewSessionEditor.${AgentSessionProviders.AgentHostCopilot}`,
  (accessor) => openNewAgentHostSession(accessor, "editor" /* Editor */)
);
export { getCopilotAgentInfo, resolveAgentHostSessionType, openNewAgentHostSession, ChatCommandLineHandler, ChatSuspendThrottlingHandler, ChatLifecycleHandler, AGENT_HOST_REGISTRATION_TIMEOUT_MS };
