// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupProviders.ts
import { product_default } from "./module-0139.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { ChatMode } from "./module-1470.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { Codicon } from "./module-0085.mjs";
import { nullExtensionDescription } from "./module-0887.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1117.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0981.mjs";
import { raceTimeout, timeout } from "./module-0036.mjs";
import { IChatService } from "./module-0972.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IChatEntitlementService, chatRequiresSetup } from "./module-0953.mjs";
import { maybeEnableAuthExtension, refreshTokens } from "./module-2778.mjs";
import { ChatGlobalPerfMark, markChatGlobal } from "./module-0973.mjs";
import { chatViewsWelcomeRegistry } from "./module-2382.mjs";
import { ChatRequestAgentPart, ChatRequestToolPart } from "./module-0987.mjs";
import { CHAT_OPEN_ACTION_ID, CHAT_SETUP_ACTION_ID } from "./module-1476.mjs";
import { ChatSetup } from "./module-2781.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ChatRequestModel } from "./module-1193.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { ACTION_START } from "./module-2001.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupProviders.ts
var defaultChat5 = {
  extensionId: product_default.defaultChatAgent?.extensionId ?? "",
  chatExtensionId: product_default.defaultChatAgent?.chatExtensionId ?? "",
  provider: product_default.defaultChatAgent?.provider ?? { default: { id: "", name: "" }, enterprise: { id: "", name: "" }, apple: { id: "", name: "" }, google: { id: "", name: "" }, microsoft: { id: "", name: "" } },
  outputChannelId: product_default.defaultChatAgent?.chatExtensionOutputId ?? "",
  outputExtensionStateCommand: product_default.defaultChatAgent?.chatExtensionOutputExtensionStateCommand ?? ""
};

var ToolsAgentContextKey = ContextKeyExpr.and(
  ContextKeyExpr.equals(`config.${"chat.agent.enabled" /* AgentEnabled */}`, true),
  ContextKeyExpr.not(`previewFeaturesDisabled`)
  // Set by extension
);

var SetupAgent = class extends Disposable {
  constructor(context2, controller, location2, instantiationService, logService, telemetryService, environmentService, workspaceTrustManagementService, chatEntitlementService, viewsService, contextKeyService, outputService, extensionsWorkbenchService, commandService) {
    super();
    this.context = context2;
    this.controller = controller;
    this.location = location2;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.environmentService = environmentService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.chatEntitlementService = chatEntitlementService;
    this.viewsService = viewsService;
    this.contextKeyService = contextKeyService;
    this.outputService = outputService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.commandService = commandService;
    this._onUnresolvableError = this._register(new Emitter());
    this.onUnresolvableError = this._onUnresolvableError.event;
    this.pendingForwardedRequests = new ResourceMap();
    this.registerCommands();
  }
  static registerDefaultAgents(instantiationService, location2, mode, context2, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const chatAgentService = accessor.get(IChatAgentService);
      let description;
      if (mode === "ask" /* Ask */) {
        description = ChatMode.Ask.description.get();
      } else if (mode === "edit" /* Edit */) {
        description = ChatMode.Edit.description.get();
      } else {
        description = ChatMode.Agent.description.get();
      }
      let id2;
      switch (location2) {
        case "panel" /* Chat */:
          if (mode === "ask" /* Ask */) {
            id2 = "setup.chat";
          } else if (mode === "edit" /* Edit */) {
            id2 = "setup.edits";
          } else {
            id2 = "setup.agent";
          }
          break;
        case "terminal" /* Terminal */:
          id2 = "setup.terminal";
          break;
        case "editor" /* EditorInline */:
          id2 = "setup.editor";
          break;
        case "notebook" /* Notebook */:
          id2 = "setup.notebook";
          break;
      }
      return SetupAgent.doRegisterAgent(instantiationService, chatAgentService, id2, `${defaultChat5.provider.default.name} Copilot`, true, description, location2, mode, context2, controller);
    });
  }
  static registerBuiltInAgents(instantiationService, context2, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const chatAgentService = accessor.get(IChatAgentService);
      const disposables = new DisposableStore();
      const { disposable: vscodeDisposable } = SetupAgent.doRegisterAgent(instantiationService, chatAgentService, "setup.vscode", "vscode", false, localize2(11181, "Ask questions about VS Code").value, "panel" /* Chat */, "agent" /* Agent */, context2, controller);
      disposables.add(vscodeDisposable);
      const { disposable: workspaceDisposable } = SetupAgent.doRegisterAgent(instantiationService, chatAgentService, "setup.workspace", "workspace", false, localize2(11184, "Ask about your workspace").value, "panel" /* Chat */, "agent" /* Agent */, context2, controller);
      disposables.add(workspaceDisposable);
      const { disposable: terminalDisposable } = SetupAgent.doRegisterAgent(instantiationService, chatAgentService, "setup.terminal.agent", "terminal", false, localize2(11179, "Ask how to do something in the terminal").value, "panel" /* Chat */, "agent" /* Agent */, context2, controller);
      disposables.add(terminalDisposable);
      disposables.add(SetupTool.registerTool(instantiationService, {
        id: "setup_tools_createNewWorkspace",
        source: ToolDataSource.Internal,
        icon: Codicon.newFolder,
        displayName: localize(11176, null),
        modelDescription: "Scaffold a new workspace in VS Code",
        userDescription: localize(11177, null),
        canBeReferencedInPrompt: true,
        toolReferenceName: "new",
        when: ContextKeyExpr.true()
      }));
      return disposables;
    });
  }
  static doRegisterAgent(instantiationService, chatAgentService, id2, name, isDefault, description, location2, mode, context2, controller) {
    const disposables = new DisposableStore();
    disposables.add(chatAgentService.registerAgent(id2, {
      id: id2,
      name,
      isDefault,
      isCore: true,
      modes: [mode],
      when: mode === "agent" /* Agent */ ? ToolsAgentContextKey?.serialize() : void 0,
      slashCommands: [],
      disambiguation: [],
      locations: [location2],
      metadata: { helpTextPrefix: SetupAgent.SETUP_NEEDED_MESSAGE },
      description,
      extensionId: nullExtensionDescription.identifier,
      extensionVersion: void 0,
      extensionDisplayName: nullExtensionDescription.name,
      extensionPublisherId: nullExtensionDescription.publisher
    }));
    const agent = disposables.add(instantiationService.createInstance(SetupAgent, context2, controller, location2));
    disposables.add(chatAgentService.registerAgentImplementation(id2, agent));
    if (mode === "agent" /* Agent */) {
      chatAgentService.updateAgent(id2, { themeIcon: Codicon.tools });
    }
    return { agent, disposable: disposables };
  }
  static {
    this.SETUP_NEEDED_MESSAGE = new MarkdownString(localize(11174, null));
  }
  static {
    this.TRUST_NEEDED_MESSAGE = new MarkdownString(localize(11180, null));
  }
  static {
    this.CHAT_RETRY_COMMAND_ID = "workbench.action.chat.retrySetup";
  }
  static {
    this.CHAT_SHOW_OUTPUT_COMMAND_ID = "workbench.action.chat.showOutput";
  }
  registerCommands() {
    this._register(CommandsRegistry.registerCommand(SetupAgent.CHAT_RETRY_COMMAND_ID, async (accessor, sessionResource) => {
      const hostService = accessor.get(IHostService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
      await widget?.clear();
      hostService.reload();
    }));
    this._register(CommandsRegistry.registerCommand(SetupAgent.CHAT_SHOW_OUTPUT_COMMAND_ID, async (accessor) => {
      const commandService = accessor.get(ICommandService);
      if (defaultChat5.outputExtensionStateCommand) {
        raceTimeout(
          commandService.executeCommand(defaultChat5.outputExtensionStateCommand),
          5e3,
          () => this.logService.info("[chat setup] Timed out executing extension state command")
        ).then(void 0, (error) => {
          this.logService.info("[chat setup] Failed to execute extension state command", error);
        });
      }
      if (defaultChat5.outputChannelId) {
        await commandService.executeCommand(`workbench.action.output.show.${defaultChat5.outputChannelId}`);
      }
    }));
  }
  async invoke(request2, progress) {
    return this.instantiationService.invokeFunction(async (accessor) => {
      const chatService = accessor.get(IChatService);
      const languageModelsService = accessor.get(ILanguageModelsService);
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatAgentService = accessor.get(IChatAgentService);
      const languageModelToolsService = accessor.get(ILanguageModelToolsService);
      const defaultAccountService = accessor.get(IDefaultAccountService);
      return this.doInvoke(request2, (part) => progress([part]), chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService);
    });
  }
  async doInvoke(request2, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService) {
    if (chatRequiresSetup({
      completed: !!this.context.state.completed,
      disabled: !!this.context.state.disabled,
      untrusted: !!this.context.state.untrusted,
      entitlement: this.context.state.entitlement,
      anonymous: this.chatEntitlementService.anonymous,
      hasByokModels: this.chatEntitlementService.hasByokModels
    })) {
      return this.doInvokeWithSetup(request2, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService);
    }
    return this.doInvokeWithoutSetup(request2, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService);
  }
  async doInvokeWithoutSetup(request2, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService) {
    const requestModel = chatWidgetService.getWidgetBySessionResource(request2.sessionResource)?.viewModel?.model.getRequests().at(-1);
    if (!requestModel) {
      this.logService.error("[chat setup] Request model not found, cannot redispatch request.");
      return {};
    }
    progress({
      kind: "progressMessage",
      content: new MarkdownString(localize(11182, null)),
      shimmer: true
    });
    await this.forwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    return {};
  }
  async forwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    try {
      await this.doForwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    } catch (error) {
      this.logService.error("[chat setup] Failed to forward request to chat", error);
      progress({
        kind: "warning",
        content: new MarkdownString(localize(11167, null))
      });
    }
  }
  async doForwardRequestToChat(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    if (this.pendingForwardedRequests.has(requestModel.session.sessionResource)) {
      throw new Error("Request already in progress");
    }
    const forwardRequest = this.doForwardRequestToChatWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
    this.pendingForwardedRequests.set(requestModel.session.sessionResource, forwardRequest);
    try {
      await forwardRequest;
    } finally {
      this.pendingForwardedRequests.delete(requestModel.session.sessionResource);
    }
  }
  async doForwardRequestToChatWhenReady(requestModel, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService) {
    const authExtensionReEnabled = await maybeEnableAuthExtension(this.extensionsWorkbenchService, this.logService);
    if (authExtensionReEnabled) {
      refreshTokens(this.commandService);
    }
    const widget = chatWidgetService.getWidgetBySessionResource(requestModel.session.sessionResource);
    const modeInfo = widget?.input.currentModeInfo;
    let agentActivated = false;
    let agentReady = false;
    let languageModelReady = false;
    let toolsModelReady = false;
    markChatGlobal(ChatGlobalPerfMark.WillWaitForActivation);
    const whenAgentActivated = this.whenAgentActivated(chatService).then(() => agentActivated = true);
    const whenAgentReady = this.whenAgentReady(chatAgentService, modeInfo?.kind)?.then(() => agentReady = true);
    if (!whenAgentReady) {
      agentReady = true;
    }
    const whenLanguageModelReady = this.whenLanguageModelReady(languageModelsService, requestModel.modelId)?.then(() => languageModelReady = true);
    if (!whenLanguageModelReady) {
      languageModelReady = true;
    }
    const whenToolsModelReady = this.whenToolsModelReady(languageModelToolsService, requestModel)?.then(() => toolsModelReady = true);
    if (!whenToolsModelReady) {
      toolsModelReady = true;
    }
    if (whenLanguageModelReady instanceof Promise || whenAgentReady instanceof Promise || whenToolsModelReady instanceof Promise) {
      const timeoutHandle = setTimeout(() => {
        progress({
          kind: "progressMessage",
          content: new MarkdownString(localize(11183, null)),
          shimmer: true
        });
      }, 1e4);
      const disposables = new DisposableStore();
      disposables.add(toDisposable(() => clearTimeout(timeoutHandle)));
      try {
        const allReady = Promise.allSettled([
          whenAgentActivated,
          whenAgentReady,
          whenLanguageModelReady,
          whenToolsModelReady
        ]);
        const ready = await Promise.race([
          timeout(this.environmentService.remoteAuthority ? 6e4 : 2e4).then(() => "timedout"),
          this.whenPanelAgentHasGuidance(disposables).then(() => "panelGuidance"),
          allReady
        ]);
        if (ready === "panelGuidance") {
          const warningMessage = localize(11166, null);
          progress({
            kind: "markdownContent",
            content: new MarkdownString(warningMessage)
          });
          this._onUnresolvableError.fire();
          return;
        }
        if (ready === "timedout") {
          let warningMessage;
          if (this.chatEntitlementService.anonymous) {
            warningMessage = localize(11165, null, defaultChat5.chatExtensionId);
          } else {
            warningMessage = localize(11164, null, defaultChat5.provider.default.name, defaultChat5.chatExtensionId);
          }
          const diagnosticInfo = this.computeDiagnosticInfo(agentActivated, agentReady, languageModelReady, toolsModelReady, requestModel, languageModelsService, chatAgentService, modeInfo);
          this.logService.warn(`[chat setup] ${warningMessage}`, diagnosticInfo);
          this.telemetryService.publicLog2("chatSetup.timeout", diagnosticInfo);
          progress({
            kind: "warning",
            content: new MarkdownString(warningMessage)
          });
          if (defaultChat5.outputChannelId && this.outputService.getChannelDescriptor(defaultChat5.outputChannelId)) {
            progress({
              kind: "command",
              command: {
                id: SetupAgent.CHAT_SHOW_OUTPUT_COMMAND_ID,
                title: localize(11178, null)
              }
            });
          } else {
            this.logService.warn(defaultChat5.outputChannelId ? `[chat setup] No output channel found for id '${defaultChat5.outputChannelId}' to show details about chat setup timeout. Please ensure the ${defaultChat5.chatExtensionId} extension is activated.` : "[chat setup] No output channel provided via product.json to show details about chat setup timeout.");
            progress({
              kind: "command",
              command: {
                id: SetupAgent.CHAT_RETRY_COMMAND_ID,
                title: localize(11173, null),
                arguments: [requestModel.session.sessionResource]
              }
            });
          }
          await allReady;
          const recoveryDiagnosticInfo = this.computeDiagnosticInfo(agentActivated, agentReady, languageModelReady, toolsModelReady, requestModel, languageModelsService, chatAgentService, modeInfo);
          this.logService.info("[chat setup] Chat setup timeout recovered", recoveryDiagnosticInfo);
          this.telemetryService.publicLog2("chatSetup.timeoutRecovery", recoveryDiagnosticInfo);
        }
      } finally {
        disposables.dispose();
      }
    }
    markChatGlobal(ChatGlobalPerfMark.DidWaitForActivation);
    await chatService.resendRequest(requestModel, {
      ...widget?.getModeRequestOptions(),
      modeInfo,
      ...widget?.getSelectedModelRequestOptions()
    });
  }
  async whenPanelAgentHasGuidance(disposables) {
    const panelAgentHasGuidance = () => chatViewsWelcomeRegistry.get().some((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
    if (panelAgentHasGuidance()) {
      return;
    }
    return new Promise((resolve3) => {
      let descriptorKeys = /* @__PURE__ */ new Set();
      const updateDescriptorKeys = () => {
        const descriptors = chatViewsWelcomeRegistry.get();
        descriptorKeys = new Set(descriptors.flatMap((d) => d.when.keys()));
      };
      updateDescriptorKeys();
      const onDidChangeRegistry = Event2.map(chatViewsWelcomeRegistry.onDidChange, () => "registry");
      const onDidChangeRelevantContext = Event2.map(
        Event2.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(descriptorKeys)),
        () => "context"
      );
      disposables.add(Event2.any(
        onDidChangeRegistry,
        onDidChangeRelevantContext
      )((source) => {
        if (source === "registry") {
          updateDescriptorKeys();
        }
        if (panelAgentHasGuidance()) {
          resolve3();
        }
      }));
    });
  }
  whenLanguageModelReady(languageModelsService, modelId) {
    const hasModelForRequest = () => {
      if (modelId) {
        return !!languageModelsService.lookupLanguageModel(modelId);
      }
      for (const id2 of languageModelsService.getLanguageModelIds()) {
        const model = languageModelsService.lookupLanguageModel(id2);
        if (model?.isDefaultForLocation["panel" /* Chat */]) {
          return true;
        }
      }
      return false;
    };
    if (hasModelForRequest()) {
      return;
    }
    return Event2.toPromise(Event2.filter(languageModelsService.onDidChangeLanguageModels, () => hasModelForRequest()));
  }
  whenToolsModelReady(languageModelToolsService, requestModel) {
    const needsToolsModel = requestModel.message.parts.some((part) => part instanceof ChatRequestToolPart);
    if (!needsToolsModel) {
      return;
    }
    for (const tool of languageModelToolsService.getAllToolsIncludingDisabled()) {
      if (tool.id.startsWith("copilot_")) {
        return;
      }
    }
    return Event2.toPromise(Event2.filter(languageModelToolsService.onDidChangeTools, () => {
      for (const tool of languageModelToolsService.getAllToolsIncludingDisabled()) {
        if (tool.id.startsWith("copilot_")) {
          return true;
        }
      }
      return false;
    }));
  }
  whenAgentReady(chatAgentService, mode) {
    const defaultAgent = chatAgentService.getDefaultAgent(this.location, mode);
    if (defaultAgent && !defaultAgent.isCore) {
      return;
    }
    return Event2.toPromise(Event2.filter(chatAgentService.onDidChangeAgents, () => {
      const defaultAgent2 = chatAgentService.getDefaultAgent(this.location, mode);
      return Boolean(defaultAgent2 && !defaultAgent2.isCore);
    }));
  }
  async whenAgentActivated(chatService) {
    try {
      await chatService.activateDefaultAgent(this.location);
    } catch (error) {
      this.logService.error(error);
    }
  }
  computeDiagnosticInfo(agentActivated, agentReady, languageModelReady, toolsModelReady, requestModel, languageModelsService, chatAgentService, modeInfo) {
    const languageModelIds = languageModelsService.getLanguageModelIds();
    let languageModelDefaultCount = 0;
    for (const id2 of languageModelIds) {
      const model = languageModelsService.lookupLanguageModel(id2);
      if (model?.isDefaultForLocation["panel" /* Chat */]) {
        languageModelDefaultCount++;
      }
    }
    const defaultAgent = chatAgentService.getDefaultAgent(this.location, modeInfo?.kind);
    const contributedDefaultAgent = chatAgentService.getContributedDefaultAgent(this.location);
    const chatViewPane = this.viewsService.getActiveViewWithId(ChatViewId);
    const matchingWelcomeView = chatViewPane?.getMatchingWelcomeView();
    return {
      agentActivated,
      agentReady,
      agentHasDefault: !!defaultAgent,
      agentDefaultIsCore: defaultAgent?.isCore ?? false,
      agentHasContributedDefault: !!contributedDefaultAgent,
      agentContributedDefaultIsCore: contributedDefaultAgent?.isCore ?? false,
      agentActivatedCount: chatAgentService.getActivatedAgents().length,
      agentLocation: this.location,
      agentModeKind: modeInfo?.kind ?? "",
      languageModelReady,
      languageModelCount: languageModelIds.length,
      languageModelDefaultCount,
      languageModelHasRequestedModel: !!requestModel.modelId,
      toolsModelReady,
      isRemote: !!this.environmentService.remoteAuthority,
      isAnonymous: this.chatEntitlementService.anonymous,
      matchingWelcomeViewWhen: matchingWelcomeView?.when.serialize() ?? (chatViewPane ? "noWelcomeView" : "noChatViewPane")
    };
  }
  async doInvokeWithSetup(request2, progress, chatService, languageModelsService, chatWidgetService, chatAgentService, languageModelToolsService, defaultAccountService) {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "chat" });
    const widget = chatWidgetService.getWidgetBySessionResource(request2.sessionResource);
    const requestModel = widget?.viewModel?.model.getRequests().at(-1);
    const setupListener = Event2.runAndSubscribe(this.controller.value.onDidChange, (() => {
      switch (this.controller.value.step) {
        case 2 /* SigningIn */:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize(11175, null, defaultAccountService.getDefaultAccountAuthenticationProvider().name)),
            shimmer: true
          });
          break;
        case 3 /* Installing */:
          progress({
            kind: "progressMessage",
            content: new MarkdownString(localize(11171, null)),
            shimmer: true
          });
          break;
      }
    }));
    let result = void 0;
    try {
      result = await ChatSetup.getInstance(this.instantiationService, this.context, this.controller).run({
        disableChatViewReveal: true,
        // we are already in a chat context
        forceAnonymous: this.chatEntitlementService.anonymous ? 2 /* EnabledWithoutDialog */ : void 0
        // only enable anonymous selectively
      });
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
    } finally {
      setupListener.dispose();
    }
    if (typeof result?.success === "boolean") {
      if (result.success) {
        if (result.dialogSkipped) {
          await widget?.clear();
        } else if (requestModel) {
          let newRequest = this.replaceAgentInRequestModel(requestModel, chatAgentService);
          newRequest = this.replaceToolInRequestModel(newRequest);
          await this.forwardRequestToChat(newRequest, progress, chatService, languageModelsService, chatAgentService, chatWidgetService, languageModelToolsService);
        }
      } else {
        progress({
          kind: "warning",
          content: new MarkdownString(localize(11163, null))
        });
      }
    } else {
      progress({
        kind: "markdownContent",
        content: this.workspaceTrustManagementService.isWorkspaceTrusted() ? SetupAgent.SETUP_NEEDED_MESSAGE : SetupAgent.TRUST_NEEDED_MESSAGE
      });
    }
    return {};
  }
  replaceAgentInRequestModel(requestModel, chatAgentService) {
    const agentPart = requestModel.message.parts.find((r2) => r2 instanceof ChatRequestAgentPart);
    if (!agentPart) {
      return requestModel;
    }
    const agentId = agentPart.agent.id.replace(/setup\./, `${defaultChat5.extensionId}.`.toLowerCase());
    const githubAgent = chatAgentService.getAgent(agentId);
    if (!githubAgent) {
      return requestModel;
    }
    const newAgentPart = new ChatRequestAgentPart(agentPart.range, agentPart.editorRange, githubAgent);
    return new ChatRequestModel({
      session: requestModel.session,
      message: {
        parts: requestModel.message.parts.map((part) => {
          if (part instanceof ChatRequestAgentPart) {
            return newAgentPart;
          }
          return part;
        }),
        text: requestModel.message.text
      },
      variableData: requestModel.variableData,
      timestamp: Date.now(),
      attempt: requestModel.attempt,
      modeInfo: requestModel.modeInfo,
      confirmation: requestModel.confirmation,
      locationData: requestModel.locationData,
      attachedContext: requestModel.attachedContext,
      isCompleteAddedRequest: requestModel.isCompleteAddedRequest
    });
  }
  replaceToolInRequestModel(requestModel) {
    const toolPart = requestModel.message.parts.find((r2) => r2 instanceof ChatRequestToolPart);
    if (!toolPart) {
      return requestModel;
    }
    const toolId = toolPart.toolId.replace(/setup.tools\./, `copilot_`.toLowerCase());
    const newToolPart = new ChatRequestToolPart(
      toolPart.range,
      toolPart.editorRange,
      toolPart.toolName,
      toolId,
      toolPart.displayName,
      toolPart.icon
    );
    const chatRequestToolEntry = {
      id: toolId,
      name: "new",
      range: toolPart.range,
      kind: "tool",
      value: void 0
    };
    const variableData = {
      variables: [chatRequestToolEntry]
    };
    return new ChatRequestModel({
      session: requestModel.session,
      message: {
        parts: requestModel.message.parts.map((part) => {
          if (part instanceof ChatRequestToolPart) {
            return newToolPart;
          }
          return part;
        }),
        text: requestModel.message.text
      },
      variableData,
      timestamp: Date.now(),
      attempt: requestModel.attempt,
      modeInfo: requestModel.modeInfo,
      confirmation: requestModel.confirmation,
      locationData: requestModel.locationData,
      attachedContext: [chatRequestToolEntry],
      isCompleteAddedRequest: requestModel.isCompleteAddedRequest
    });
  }
};

SetupAgent = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IWorkspaceTrustManagementService),
  __decorateParam(8, IChatEntitlementService),
  __decorateParam(9, IViewsService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IOutputService),
  __decorateParam(12, IExtensionsWorkbenchService),
  __decorateParam(13, ICommandService)
], SetupAgent);

var SetupTool = class _SetupTool {
  static registerTool(instantiationService, toolData) {
    return instantiationService.invokeFunction((accessor) => {
      const toolService = accessor.get(ILanguageModelToolsService);
      const tool = instantiationService.createInstance(_SetupTool);
      return toolService.registerTool(toolData, tool);
    });
  }
  async invoke(invocation, countTokens, progress, token) {
    const result = {
      content: [
        {
          kind: "text",
          value: ""
        }
      ]
    };
    return result;
  }
  async prepareToolInvocation(parameters, token) {
    return void 0;
  }
};

var AINewSymbolNamesProvider = class {
  constructor(context2, controller, instantiationService, chatEntitlementService) {
    this.context = context2;
    this.controller = controller;
    this.instantiationService = instantiationService;
    this.chatEntitlementService = chatEntitlementService;
  }
  static registerProvider(instantiationService, context2, controller) {
    return instantiationService.invokeFunction((accessor) => {
      const languageFeaturesService = accessor.get(ILanguageFeaturesService);
      const provider = instantiationService.createInstance(AINewSymbolNamesProvider, context2, controller);
      return languageFeaturesService.newSymbolNamesProvider.register("*", provider);
    });
  }
  async provideNewSymbolNames(model, range2, triggerKind, token) {
    await this.instantiationService.invokeFunction((accessor) => {
      return ChatSetup.getInstance(this.instantiationService, this.context, this.controller).run({
        forceAnonymous: this.chatEntitlementService.anonymous ? 1 /* EnabledWithDialog */ : void 0
      });
    });
    return [];
  }
};

AINewSymbolNamesProvider = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IChatEntitlementService)
], AINewSymbolNamesProvider);

var ChatCodeActionsProvider = class {
  constructor(markerService) {
    this.markerService = markerService;
  }
  static registerProvider(instantiationService) {
    return instantiationService.invokeFunction((accessor) => {
      const languageFeaturesService = accessor.get(ILanguageFeaturesService);
      const provider = instantiationService.createInstance(ChatCodeActionsProvider);
      return languageFeaturesService.codeActionProvider.register("*", provider);
    });
  }
  async provideCodeActions(model, range2) {
    const actions = [];
    let generateOrModifyTitle;
    let generateOrModifyCommand;
    if (range2.isEmpty()) {
      const textAtLine = model.getLineContent(range2.startLineNumber);
      if (/^\s*$/.test(textAtLine)) {
        generateOrModifyTitle = localize(11170, null);
        generateOrModifyCommand = AICodeActionsHelper.generate(range2);
      }
    } else {
      const textInSelection = model.getValueInRange(range2);
      if (!/^\s*$/.test(textInSelection)) {
        generateOrModifyTitle = localize(11172, null);
        generateOrModifyCommand = AICodeActionsHelper.modify(range2);
      }
    }
    if (generateOrModifyTitle && generateOrModifyCommand) {
      actions.push({
        kind: CodeActionKind.RefactorRewrite.append("copilot").value,
        isAI: true,
        title: generateOrModifyTitle,
        command: generateOrModifyCommand
      });
    }
    const markers = AICodeActionsHelper.warningOrErrorMarkersAtRange(this.markerService, model.uri, range2);
    if (markers.length > 0) {
      actions.push({
        kind: CodeActionKind.QuickFix.append("copilot").value,
        isAI: true,
        diagnostics: markers,
        title: localize(11169, null),
        command: AICodeActionsHelper.fixMarkers(markers, range2)
      });
      actions.push({
        kind: CodeActionKind.QuickFix.append("explain").append("copilot").value,
        isAI: true,
        diagnostics: markers,
        title: localize(11168, null),
        command: AICodeActionsHelper.explainMarkers(markers)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};

ChatCodeActionsProvider = __decorateClass([
  __decorateParam(0, IMarkerService)
], ChatCodeActionsProvider);

var AICodeActionsHelper = class {
  static warningOrErrorMarkersAtRange(markerService, resource, range2) {
    return markerService.read({ resource, severities: 8 /* Error */ | 4 /* Warning */ }).filter((marker) => range2.startLineNumber <= marker.endLineNumber && range2.endLineNumber >= marker.startLineNumber);
  }
  static modify(range2) {
    return {
      id: ACTION_START,
      title: localize(11172, null),
      arguments: [
        {
          initialSelection: this.rangeToSelection(range2),
          initialRange: range2,
          position: range2.getStartPosition()
        }
      ]
    };
  }
  static generate(range2) {
    return {
      id: ACTION_START,
      title: localize(11170, null),
      arguments: [
        {
          initialSelection: this.rangeToSelection(range2),
          initialRange: range2,
          position: range2.getStartPosition()
        }
      ]
    };
  }
  static rangeToSelection(range2) {
    return new Selection(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn);
  }
  static explainMarkers(markers) {
    return {
      id: CHAT_OPEN_ACTION_ID,
      title: localize(11168, null),
      arguments: [
        {
          query: `@workspace /explain ${markers.map((marker) => marker.message).join(", ")}`,
          isPartialQuery: true
        }
      ]
    };
  }
  static fixMarkers(markers, range2) {
    return {
      id: ACTION_START,
      title: localize(11169, null),
      arguments: [
        {
          message: `/fix ${markers.map((marker) => marker.message).join(", ")}`,
          initialSelection: this.rangeToSelection(range2),
          initialRange: range2,
          position: range2.getStartPosition()
        }
      ]
    };
  }
};
export { defaultChat5, ToolsAgentContextKey, SetupAgent, SetupTool, AINewSymbolNamesProvider, ChatCodeActionsProvider, AICodeActionsHelper };
