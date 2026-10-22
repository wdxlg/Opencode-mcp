// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupContributions.ts
import { product_default } from "./module-0139.mjs";
import { Disposable, DisposableStore, MutableDisposable, markAsSingleton } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { ChatSetupController } from "./module-2754.mjs";
import { AICodeActionsHelper, AINewSymbolNamesProvider, ChatCodeActionsProvider, SetupAgent } from "./module-2757.mjs";
import { chatViewsWelcomeRegistry } from "./module-2357.mjs";
import { Event2 } from "./module-0017.mjs";
import { GrowthSessionController, registerGrowthSession } from "./module-2755.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY, CHAT_SETUP_ACTION_ID, CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID } from "./module-1475.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ChatViewContainerId, IChatWidgetService } from "./module-0982.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IDialogService } from "./module-0267.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { ChatSetup } from "./module-2756.mjs";
import { severity_default } from "./module-0266.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ChatEntitlementContextKeys, IChatEntitlementService, isProUser } from "./module-0954.mjs";
import { CONTEXT_DEFAULT_ACCOUNT_STATE } from "./module-1803.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { UpdateTitleBarEditorVisibleContext } from "./module-2752.mjs";
import { InEditorZenModeContext } from "./module-0950.mjs";
import { ToggleTitleBarConfigAction } from "./module-2553.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHostService } from "./module-1118.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { IProductService } from "./module-0875.mjs";
import { buildUpgradeUrlWithRedirect, refreshTokens } from "./module-2753.mjs";
import { URI } from "./module-0032.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ExtensionUrlHandlerOverrideRegistry } from "./module-1286.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { equalsIgnoreCase } from "./module-0030.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { $, append } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupContributions.ts
var defaultChat6 = {
  chatExtensionId: product_default.defaultChatAgent?.chatExtensionId ?? ""
};

var SIGN_IN_TITLE_BAR_ACTION_ID = "workbench.action.chat.signInIndicator";

var ChatSetupContribution = class extends Disposable {
  constructor(actionViewItemService, instantiationService, chatEntitlementService, logService, contextKeyService, extensionEnablementService, extensionsWorkbenchService, extensionService, environmentService, chatSessionsService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.extensionEnablementService = extensionEnablementService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.chatSessionsService = chatSessionsService;
    this.configurationService = configurationService;
    const context2 = chatEntitlementService.context?.value;
    const requests = chatEntitlementService.requests?.value;
    if (!context2 || !requests) {
      return;
    }
    const controller = new Lazy(() => this._register(this.instantiationService.createInstance(ChatSetupController, context2, requests)));
    this.registerSetupAgents(context2, controller);
    this.registerGrowthSession(chatEntitlementService);
    this.registerActions(context2, requests, controller);
    this.registerSignInTitleBarEntry(actionViewItemService);
    this.registerUrlLinkHandler();
    this.checkExtensionInstallation(context2);
  }
  static {
    this.ID = "workbench.contrib.chatSetup";
  }
  registerSetupAgents(context2, controller) {
    const defaultAgentDisposables = markAsSingleton(new MutableDisposable());
    const vscodeAgentDisposables = markAsSingleton(new MutableDisposable());
    const renameProviderDisposables = markAsSingleton(new MutableDisposable());
    const codeActionsProviderDisposables = markAsSingleton(new MutableDisposable());
    const updateRegistration = () => {
      {
        if (!context2.state.hidden && !context2.state.disabledInWorkspace) {
          if (!defaultAgentDisposables.value) {
            const disposables = defaultAgentDisposables.value = new DisposableStore();
            const panelAgentDisposables = disposables.add(new DisposableStore());
            for (const mode of ["ask" /* Ask */, "edit" /* Edit */, "agent" /* Agent */]) {
              const { agent, disposable } = SetupAgent.registerDefaultAgents(this.instantiationService, "panel" /* Chat */, mode, context2, controller);
              panelAgentDisposables.add(disposable);
              panelAgentDisposables.add(agent.onUnresolvableError(() => {
                const panelAgentHasGuidance = chatViewsWelcomeRegistry.get().some((descriptor) => this.contextKeyService.contextMatchesRules(descriptor.when));
                if (panelAgentHasGuidance) {
                  this.logService.error("[chat setup] Unresolvable error from Chat agent registration, clearing registration.");
                  panelAgentDisposables.dispose();
                }
              }));
            }
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, "terminal" /* Terminal */, "ask" /* Ask */, context2, controller).disposable);
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, "notebook" /* Notebook */, "ask" /* Ask */, context2, controller).disposable);
            disposables.add(SetupAgent.registerDefaultAgents(this.instantiationService, "editor" /* EditorInline */, "ask" /* Ask */, context2, controller).disposable);
          }
          if ((!context2.state.completed || context2.state.entitlement === 1 /* Unknown */ || context2.state.entitlement === 2 /* Unresolved */) && !vscodeAgentDisposables.value) {
            const disposables = vscodeAgentDisposables.value = new DisposableStore();
            disposables.add(SetupAgent.registerBuiltInAgents(this.instantiationService, context2, controller));
          }
        } else {
          defaultAgentDisposables.clear();
          vscodeAgentDisposables.clear();
        }
        if (context2.state.completed) {
          vscodeAgentDisposables.clear();
        }
      }
      {
        if (!context2.state.completed && !context2.state.hidden && !context2.state.disabledInWorkspace) {
          if (!renameProviderDisposables.value) {
            renameProviderDisposables.value = AINewSymbolNamesProvider.registerProvider(this.instantiationService, context2, controller);
          }
        } else {
          renameProviderDisposables.clear();
        }
      }
      {
        if (!context2.state.completed && !context2.state.hidden && !context2.state.disabledInWorkspace) {
          if (!codeActionsProviderDisposables.value) {
            codeActionsProviderDisposables.value = ChatCodeActionsProvider.registerProvider(this.instantiationService);
          }
        } else {
          codeActionsProviderDisposables.clear();
        }
      }
    };
    this._register(Event2.runAndSubscribe(context2.onDidChange, () => updateRegistration()));
  }
  registerGrowthSession(chatEntitlementService) {
    const growthSessionDisposables = markAsSingleton(new MutableDisposable());
    const updateGrowthSession = () => {
      const experimentEnabled = this.configurationService.getValue("chat.growthNotification.enabled" /* GrowthNotificationEnabled */) === true;
      const shouldShow = experimentEnabled && !chatEntitlementService.sentiment.completed;
      if (shouldShow && !growthSessionDisposables.value) {
        const disposables = new DisposableStore();
        const controller = disposables.add(this.instantiationService.createInstance(GrowthSessionController));
        if (!controller.isDismissed) {
          disposables.add(registerGrowthSession(this.chatSessionsService, controller));
          disposables.add(controller.onDidDismiss(() => {
            growthSessionDisposables.clear();
          }));
          growthSessionDisposables.value = disposables;
        } else {
          disposables.dispose();
        }
      } else if (!shouldShow) {
        growthSessionDisposables.clear();
      }
    };
    this._register(chatEntitlementService.onDidChangeSentiment(() => updateGrowthSession()));
    updateGrowthSession();
  }
  registerActions(context2, requests, controller) {
    class ChatSetupTriggerAction extends Action2 {
      static {
        this.CHAT_SETUP_ACTION_LABEL = localize2(11144, "Use AI Features with Copilot for free...");
      }
      constructor() {
        super({
          id: CHAT_SETUP_ACTION_ID,
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL,
          category: CHAT_CATEGORY,
          f1: true,
          precondition: ContextKeyExpr.or(
            ChatContextKeys.Setup.hidden,
            ChatContextKeys.Setup.disabledInWorkspace,
            ChatContextKeys.Setup.untrusted,
            ChatContextKeys.Setup.completed.negate(),
            ChatContextKeys.Entitlement.canSignUp
          )
        });
      }
      async run(accessor, mode, options3) {
        const widgetService = accessor.get(IChatWidgetService);
        const instantiationService = accessor.get(IInstantiationService);
        const dialogService = accessor.get(IDialogService);
        const commandService = accessor.get(ICommandService);
        const lifecycleService = accessor.get(ILifecycleService);
        const configurationService = accessor.get(IConfigurationService);
        await context2.update({ hidden: false });
        configurationService.updateValue(ChatAIDisabledSettingId, false);
        if (mode) {
          const chatWidget = await widgetService.revealWidget();
          if (chatWidget) {
            const resolvedMode = this.resolveAgentId(mode, chatWidget);
            if (resolvedMode) {
              chatWidget.input.setChatMode(resolvedMode);
            }
          }
        }
        if (options3?.inputValue) {
          const chatWidget = await widgetService.revealWidget();
          chatWidget?.input.showScrollbarUntilAccept();
          chatWidget?.setInput(options3.inputValue);
        }
        const setup2 = ChatSetup.getInstance(instantiationService, context2, controller);
        const result = await setup2.run(options3);
        if (options3?.returnResult) {
          return result;
        }
        const { success } = result;
        if (success === false && !result.errorAlreadyHandled && !lifecycleService.willShutdown) {
          const { confirmed } = await dialogService.confirm({
            type: severity_default.Error,
            message: localize(11140, null),
            primaryButton: localize(11138, null)
          });
          if (confirmed) {
            return Boolean(await commandService.executeCommand(CHAT_SETUP_ACTION_ID, mode, options3));
          }
        }
        return Boolean(success);
      }
      resolveAgentId(agentParam, chatWidget) {
        const modes = chatWidget.input.currentChatModesObs.get();
        const foundAgent = modes.findModeById(agentParam);
        if (foundAgent) {
          return foundAgent.id;
        }
        const allAgents = [...modes.builtin, ...modes.custom];
        const nameLower = agentParam.toLowerCase();
        const agentByName = allAgents.find((agent) => agent.name.get().toLowerCase() === nameLower);
        return agentByName?.id;
      }
    }
    class ChatSetupTriggerSupportAnonymousAction extends Action2 {
      constructor() {
        super({
          id: CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID,
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL
        });
      }
      async run(accessor, options3) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        const chatEntitlementService = accessor.get(IChatEntitlementService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, {
          forceAnonymous: chatEntitlementService.anonymous ? 1 /* EnabledWithDialog */ : void 0,
          ...options3
        });
      }
    }
    class ChatSetupTriggerForceSignInDialogAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupForceSignIn",
          title: localize2(11132, "Sign in to use GitHub Copilot")
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, { forceSignInDialog: true });
      }
    }
    class ChatSetupTriggerAnonymousWithoutDialogAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupAnonymousWithoutDialog",
          title: ChatSetupTriggerAction.CHAT_SETUP_ACTION_LABEL
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "api" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID, void 0, { forceAnonymous: 2 /* EnabledWithoutDialog */ });
      }
    }
    class ChatSetupFromAccountsAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.chat.triggerSetupFromAccounts",
          title: localize2(11145, "Sign in to use GitHub Copilot..."),
          menu: {
            id: MenuId.AccountsContext,
            group: "2_copilot",
            when: ContextKeyExpr.and(
              ChatContextKeys.Setup.hidden.negate(),
              ChatContextKeys.Setup.disabledInWorkspace.negate(),
              CONTEXT_DEFAULT_ACCOUNT_STATE.notEqualsTo("available" /* Available */),
              // hide only when signed in (a default GitHub account is present); still shown while signed out or before the account state resolves, incl. untrusted workspaces — no auth prompt
              ChatContextKeys.Setup.completed.negate(),
              ChatContextKeys.Entitlement.signedOut
            )
          }
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "accounts" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      }
    }
    class ChatSetupSignInTitleBarAction extends Action2 {
      static {
        this.ID = SIGN_IN_TITLE_BAR_ACTION_ID;
      }
      constructor() {
        super({
          id: ChatSetupSignInTitleBarAction.ID,
          title: localize(11141, null),
          f1: false,
          menu: [{
            id: MenuId.TitleBarAdjacentCenter,
            order: 0,
            when: ContextKeyExpr.and(
              IsWebContext.negate(),
              ChatContextKeys.Entitlement.signedOut,
              CONTEXT_DEFAULT_ACCOUNT_STATE.notEqualsTo("available" /* Available */),
              // hide only when signed in (a default GitHub account is present); still shown while signed out or before the account state resolves, incl. untrusted workspaces — no auth prompt
              ChatEntitlementContextKeys.hasByokModels.negate(),
              ChatContextKeys.Setup.hidden.negate(),
              ChatContextKeys.Setup.disabledInWorkspace.negate(),
              ContextKeyExpr.equals(`config.${"chat.titleBar.signIn.enabled" /* TitleBarSignInEnabled */}`, true),
              UpdateTitleBarEditorVisibleContext.negate(),
              InEditorZenModeContext.negate()
            )
          }]
        });
      }
      async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "titlebar" });
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      }
    }
    class ToggleSignInTitleBarAction extends ToggleTitleBarConfigAction {
      constructor() {
        super(
          "chat.titleBar.signIn.enabled" /* TitleBarSignInEnabled */,
          localize(11142, null),
          localize(11143, null),
          3,
          ContextKeyExpr.and(
            IsWebContext.negate(),
            ChatContextKeys.Entitlement.signedOut,
            ChatContextKeys.Setup.hidden.negate(),
            ChatContextKeys.Setup.disabledInWorkspace.negate()
          )
        );
      }
    }
    const windowFocusListener = this._register(new MutableDisposable());
    class UpgradePlanAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.chat.upgradePlan",
          title: localize2(11135, "Upgrade to GitHub Copilot Pro"),
          category: localize2(11129, "Chat"),
          f1: true,
          precondition: ContextKeyExpr.and(
            ChatContextKeys.Setup.hidden.negate(),
            ChatContextKeys.Setup.disabledInWorkspace.negate(),
            ContextKeyExpr.or(
              ChatContextKeys.Entitlement.canSignUp,
              ChatContextKeys.Entitlement.planFree
            )
          ),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "a_first",
            order: 1,
            when: ContextKeyExpr.and(
              ChatContextKeys.Entitlement.planFree,
              ContextKeyExpr.or(
                ChatContextKeys.chatQuotaExceeded,
                ChatContextKeys.completionsQuotaExceeded
              )
            )
          }
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        const hostService = accessor.get(IHostService);
        const commandService = accessor.get(ICommandService);
        const telemetryService = accessor.get(ITelemetryService);
        const defaultAccountService = accessor.get(IDefaultAccountService);
        const productService = accessor.get(IProductService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.action.chat.upgradePlan", from: "command" });
        const baseUrl = defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotUpgrade);
        const upgradeUrl = buildUpgradeUrlWithRedirect(baseUrl, productService.urlProtocol, productService.quality);
        openerService.open(upgradeUrl);
        const entitlement = context2.state.entitlement;
        if (!isProUser(entitlement)) {
          windowFocusListener.value = hostService.onDidChangeFocus((focus) => this.onWindowFocus(focus, commandService));
        }
      }
      async onWindowFocus(focus, commandService) {
        if (focus) {
          windowFocusListener.clear();
          const entitlements = await requests.forceResolveEntitlement();
          if (entitlements?.entitlement && isProUser(entitlements?.entitlement)) {
            refreshTokens(commandService);
          }
        }
      }
    }
    class ManageAdditionalSpendAction extends Action2 {
      constructor() {
        super({
          id: "workbench.action.chat.manageAdditionalSpend",
          title: localize2(11134, "Manage GitHub Copilot Budget"),
          category: localize2(11129, "Chat"),
          f1: true,
          precondition: ContextKeyExpr.and(
            ChatContextKeys.Setup.hidden.negate(),
            ChatContextKeys.Setup.disabledInWorkspace.negate(),
            ContextKeyExpr.or(
              ChatContextKeys.Entitlement.planPro,
              ChatContextKeys.Entitlement.planProPlus,
              ChatContextKeys.Entitlement.planMax,
              ChatContextKeys.Entitlement.planEdu
            )
          ),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "a_first",
            order: 1,
            when: ContextKeyExpr.and(
              ContextKeyExpr.or(
                ChatContextKeys.Entitlement.planPro,
                ChatContextKeys.Entitlement.planProPlus,
                ChatContextKeys.Entitlement.planMax,
                ChatContextKeys.Entitlement.planEdu
              ),
              ContextKeyExpr.or(
                ChatContextKeys.chatQuotaExceeded,
                ChatContextKeys.completionsQuotaExceeded
              )
            )
          }
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        const telemetryService = accessor.get(ITelemetryService);
        const defaultAccountService = accessor.get(IDefaultAccountService);
        telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.action.chat.manageAdditionalSpend", from: "command" });
        openerService.open(URI.parse(defaultAccountService.resolveGitHubUrl(GitHubPaths.billingBudgets)));
      }
    }
    registerAction2(ChatSetupTriggerAction);
    registerAction2(ChatSetupTriggerForceSignInDialogAction);
    registerAction2(ChatSetupFromAccountsAction);
    registerAction2(ChatSetupSignInTitleBarAction);
    registerAction2(ToggleSignInTitleBarAction);
    registerAction2(ChatSetupTriggerAnonymousWithoutDialogAction);
    registerAction2(ChatSetupTriggerSupportAnonymousAction);
    registerAction2(UpgradePlanAction);
    registerAction2(ManageAdditionalSpendAction);
    function registerGenerateCodeCommand(coreCommand, actualCommand) {
      CommandsRegistry.registerCommand(coreCommand, async (accessor, ...args2) => {
        const commandService = accessor.get(ICommandService);
        const codeEditorService = accessor.get(ICodeEditorService);
        const markerService = accessor.get(IMarkerService);
        switch (coreCommand) {
          case "chat.internal.explain":
          case "chat.internal.fix": {
            const textEditor = codeEditorService.getActiveCodeEditor();
            const uri4 = textEditor?.getModel()?.uri;
            const range2 = textEditor?.getSelection();
            if (!uri4 || !range2) {
              return;
            }
            const markers = AICodeActionsHelper.warningOrErrorMarkersAtRange(markerService, uri4, range2);
            const actualCommand2 = coreCommand === "chat.internal.explain" ? AICodeActionsHelper.explainMarkers(markers) : AICodeActionsHelper.fixMarkers(markers, range2);
            await commandService.executeCommand(actualCommand2.id, ...actualCommand2.arguments ?? []);
            break;
          }
          case "chat.internal.review": {
            const result = await commandService.executeCommand(CHAT_SETUP_SUPPORT_ANONYMOUS_ACTION_ID);
            if (result) {
              await commandService.executeCommand(actualCommand);
            }
            break;
          }
        }
      });
    }
    registerGenerateCodeCommand("chat.internal.explain", "github.copilot.chat.explain");
    registerGenerateCodeCommand("chat.internal.fix", "github.copilot.chat.fix");
    registerGenerateCodeCommand("chat.internal.review", "github.copilot.chat.review");
    const internalGenerateCodeContext = ContextKeyExpr.and(
      ChatContextKeys.Setup.hidden.negate(),
      ChatContextKeys.Setup.disabledInWorkspace.negate(),
      ChatContextKeys.Setup.completed.negate()
    );
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.explain",
        title: localize(11130, null)
      },
      group: "1_chat",
      order: 4,
      when: internalGenerateCodeContext
    });
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.fix",
        title: localize(11131, null)
      },
      group: "1_chat",
      order: 5,
      when: ContextKeyExpr.and(
        internalGenerateCodeContext,
        EditorContextKeys.readOnly.negate()
      )
    });
    MenuRegistry.appendMenuItem(MenuId.EditorContext, {
      command: {
        id: "chat.internal.review",
        title: localize(11139, null)
      },
      group: "1_chat",
      order: 6,
      when: internalGenerateCodeContext
    });
  }
  registerSignInTitleBarEntry(actionViewItemService) {
    this._register(actionViewItemService.register(
      MenuId.TitleBarAdjacentCenter,
      SIGN_IN_TITLE_BAR_ACTION_ID,
      (action, options3) => new SignInTitleBarEntry(action, options3)
    ));
  }
  registerUrlLinkHandler() {
    this._register(ExtensionUrlHandlerOverrideRegistry.registerHandler(this.instantiationService.createInstance(ChatSetupExtensionUrlHandler)));
  }
  async checkExtensionInstallation(context2) {
    if (this.environmentService.isExtensionDevelopment) {
      await this.extensionService.whenInstalledExtensionsRegistered();
      if (this.extensionService.extensions.find((ext) => ExtensionIdentifier.equals(ext.identifier, defaultChat6.chatExtensionId))) {
        context2.update({ installed: true, disabled: false, untrusted: false, disabledInWorkspace: false });
        return;
      }
    }
    await this.extensionsWorkbenchService.queryLocal();
    this._register(Event2.runAndSubscribe(this.extensionsWorkbenchService.onChange, (e4) => {
      if (e4 && !ExtensionIdentifier.equals(e4.identifier.id, defaultChat6.chatExtensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value2) => ExtensionIdentifier.equals(value2.identifier.id, defaultChat6.chatExtensionId));
      const installed = !!defaultChatExtension?.local;
      let disabled;
      let untrusted = false;
      let disabledInWorkspace = false;
      if (installed) {
        disabled = !this.extensionEnablementService.isEnabled(defaultChatExtension.local);
        if (disabled) {
          const state = this.extensionEnablementService.getEnablementState(defaultChatExtension.local);
          if (state === 0 /* DisabledByTrustRequirement */) {
            disabled = false;
            untrusted = true;
          } else if (state === 11 /* DisabledWorkspace */) {
            disabledInWorkspace = true;
          }
        }
      } else {
        disabled = false;
      }
      context2.update({ installed, disabled, untrusted, disabledInWorkspace });
    }));
  }
};

ChatSetupContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IChatEntitlementService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, IExtensionsWorkbenchService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IChatSessionsService),
  __decorateParam(10, IConfigurationService)
], ChatSetupContribution);

var ChatSetupExtensionUrlHandler = class {
  constructor(productService, commandService, telemetryService, chatEntitlementService, chatInputNotificationService) {
    this.productService = productService;
    this.commandService = commandService;
    this.telemetryService = telemetryService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatInputNotificationService = chatInputNotificationService;
  }
  static {
    this.UPGRADE_SUCCESS_NOTIFICATION_ID = "copilot.upgradeSuccess";
  }
  canHandleURL(url) {
    return url.scheme === this.productService.urlProtocol && equalsIgnoreCase(url.authority, defaultChat6.chatExtensionId);
  }
  async handleURL(url) {
    if (url.path === "/upgrade-success") {
      return this._handleUpgradeSuccess();
    }
    const params = new URLSearchParams(url.query);
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: CHAT_SETUP_ACTION_ID, from: "url", detail: params.get("referrer") ?? void 0 });
    const agentParam = params.get("agent") ?? params.get("mode");
    const inputParam = params.get("prompt");
    if (!agentParam && !inputParam) {
      return false;
    }
    await this.commandService.executeCommand(CHAT_SETUP_ACTION_ID, agentParam, inputParam ? { inputValue: inputParam } : void 0);
    return true;
  }
  async _handleUpgradeSuccess() {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: "workbench.action.chat.upgradePlan", from: "redirect" });
    await this.chatEntitlementService.update(CancellationToken.None);
    refreshTokens(this.commandService);
    this.chatInputNotificationService.setNotification({
      id: ChatSetupExtensionUrlHandler.UPGRADE_SUCCESS_NOTIFICATION_ID,
      severity: 0 /* Info */,
      message: localize(11146, null),
      description: localize(11147, null),
      actions: [],
      dismissible: true,
      autoDismissOnMessage: true
    });
    return true;
  }
};

ChatSetupExtensionUrlHandler = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IChatEntitlementService),
  __decorateParam(4, IChatInputNotificationService)
], ChatSetupExtensionUrlHandler);

var ChatTeardownContribution = class extends Disposable {
  constructor(chatEntitlementService, configurationService, extensionsWorkbenchService, extensionEnablementService, viewDescriptorService, layoutService) {
    super();
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.viewDescriptorService = viewDescriptorService;
    this.layoutService = layoutService;
    const context2 = chatEntitlementService.context?.value;
    if (!context2) {
      return;
    }
    this.registerListeners();
    this.registerActions();
    this.handleChatDisabled(false);
  }
  static {
    this.ID = "workbench.contrib.chatTeardown";
  }
  handleChatDisabled(fromEvent) {
    const chatDisabled = this.configurationService.inspect(ChatAIDisabledSettingId);
    if (chatDisabled.value === true) {
      this.maybeEnableOrDisableExtension(typeof chatDisabled.workspaceValue === "boolean" ? 11 /* DisabledWorkspace */ : 10 /* DisabledGlobally */);
      if (fromEvent) {
        this.maybeHideAuxiliaryBar();
      }
    } else if (chatDisabled.value === false && fromEvent) {
      this.maybeEnableOrDisableExtension(typeof chatDisabled.workspaceValue === "boolean" ? 13 /* EnabledWorkspace */ : 12 /* EnabledGlobally */);
    }
  }
  async registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (!e4.affectsConfiguration(ChatAIDisabledSettingId)) {
        return;
      }
      this.handleChatDisabled(true);
    }));
    await this.extensionsWorkbenchService.queryLocal();
    this._register(this.extensionsWorkbenchService.onChange((e4) => {
      if (e4 && !ExtensionIdentifier.equals(e4.identifier.id, defaultChat6.chatExtensionId)) {
        return;
      }
      const defaultChatExtension = this.extensionsWorkbenchService.local.find((value2) => ExtensionIdentifier.equals(value2.identifier.id, defaultChat6.chatExtensionId));
      if (defaultChatExtension?.local && this.extensionEnablementService.isEnabled(defaultChatExtension.local)) {
        if (defaultChatExtension.enablementState === 13 /* EnabledWorkspace */) {
          if (this.configurationService.inspect(ChatAIDisabledSettingId).workspaceValue === true) {
            this.configurationService.updateValue(ChatAIDisabledSettingId, false, 5 /* WORKSPACE */);
          }
        } else {
          this.configurationService.updateValue(ChatAIDisabledSettingId, false);
        }
      }
    }));
  }
  async maybeEnableOrDisableExtension(state) {
    const defaultChatExtension = this.extensionsWorkbenchService.local.find((value2) => ExtensionIdentifier.equals(value2.identifier.id, defaultChat6.chatExtensionId));
    if (!defaultChatExtension?.local) {
      return;
    }
    const workspace = state === 13 /* EnabledWorkspace */ || state === 11 /* DisabledWorkspace */;
    const canChange = workspace ? this.extensionEnablementService.canChangeWorkspaceEnablement(defaultChatExtension.local) : this.extensionEnablementService.canChangeEnablement(defaultChatExtension.local);
    if (!canChange) {
      return;
    }
    await this.extensionsWorkbenchService.setEnablement([defaultChatExtension], state);
    await this.extensionsWorkbenchService.updateRunningExtensions(state === 12 /* EnabledGlobally */ || state === 13 /* EnabledWorkspace */ ? localize(11137, null) : localize(11136, null));
  }
  maybeHideAuxiliaryBar() {
    const activeContainers = this.viewDescriptorService.getViewContainersByLocation(2 /* AuxiliaryBar */).filter(
      (container2) => this.viewDescriptorService.getViewContainerModel(container2).activeViewDescriptors.length > 0
    );
    if (activeContainers.length === 0 || // chat view is already gone but we know it was there before
    activeContainers.length === 1 && activeContainers.at(0)?.id === ChatViewContainerId) {
      this.layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    }
  }
  registerActions() {
    class ChatSetupHideAction extends Action2 {
      static {
        this.ID = "workbench.action.chat.hideSetup";
      }
      static {
        this.TITLE = localize2(11133, "Learn How to Hide AI Features");
      }
      constructor() {
        super({
          id: ChatSetupHideAction.ID,
          title: ChatSetupHideAction.TITLE,
          f1: true,
          category: CHAT_CATEGORY,
          precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
          menu: {
            id: MenuId.ChatTitleBarMenu,
            group: "z_hide",
            order: 1,
            when: ChatContextKeys.Setup.completed.negate()
          }
        });
      }
      async run(accessor) {
        const preferencesService = accessor.get(IPreferencesService);
        preferencesService.openSettings({ jsonEditor: false, query: `@id:${ChatAIDisabledSettingId}` });
      }
    }
    registerAction2(ChatSetupHideAction);
  }
};

ChatTeardownContribution = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExtensionsWorkbenchService),
  __decorateParam(3, IWorkbenchExtensionEnablementService),
  __decorateParam(4, IViewDescriptorService),
  __decorateParam(5, IWorkbenchLayoutService)
], ChatTeardownContribution);

var SignInTitleBarEntry = class extends BaseActionViewItem {
  constructor(action, options3) {
    super(void 0, action, options3);
  }
  render(container2) {
    super.render(container2);
    container2.setAttribute("role", "button");
    container2.setAttribute("aria-label", this.action.label);
    const content = append(container2, $(".update-indicator.prominent"));
    this.label = append(content, $(".indicator-label"));
    this.label.textContent = this.action.label;
  }
  updateLabel() {
    if (this.label) {
      this.label.textContent = this.action.label;
    }
    if (this.element) {
      this.element.setAttribute("aria-label", this.action.label);
    }
  }
  updateEnabled() {
    if (this.element) {
      this.element.classList.toggle("disabled", !this.action.enabled);
    }
  }
};
export { defaultChat6, SIGN_IN_TITLE_BAR_ACTION_ID, ChatSetupContribution, ChatSetupExtensionUrlHandler, ChatTeardownContribution, SignInTitleBarEntry };
