// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupRunner.ts
import { product_default } from "./module-0139.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ChatSetupDialogVisibleContext, ChatSetupError } from "./module-2753.mjs";
import { Dialog } from "./module-1579.mjs";
import { createWorkbenchDialogOptions } from "./module-1580.mjs";
import { $ } from "./module-0075.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IHostService } from "./module-1118.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatMicrosoftAuthenticationEnabledSettingId } from "./module-0951.mjs";
import { localize } from "./module-0001.mjs";
import { IChatEntitlementService, isProUser } from "./module-0954.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { Codicon } from "./module-0085.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupRunner.ts
var fallbackProviders = {
  default: { id: "", name: "" },
  enterprise: { id: "", name: "" },
  apple: { id: "", name: "" },
  google: { id: "", name: "" },
  microsoft: { id: "", name: "" }
};

var configuredProviders = product_default.defaultChatAgent?.provider;

var defaultChat4 = {
  chatExtensionId: product_default.defaultChatAgent?.chatExtensionId ?? "",
  publicCodeMatchesUrl: product_default.defaultChatAgent?.publicCodeMatchesUrl ?? "",
  provider: {
    default: configuredProviders?.default ?? fallbackProviders.default,
    enterprise: configuredProviders?.enterprise ?? fallbackProviders.enterprise,
    apple: configuredProviders?.apple ?? fallbackProviders.apple,
    google: configuredProviders?.google ?? fallbackProviders.google,
    microsoft: configuredProviders?.microsoft ?? fallbackProviders.microsoft
  },
  chatRefreshTokenCommand: product_default.defaultChatAgent?.chatRefreshTokenCommand ?? "",
  termsStatementUrl: product_default.defaultChatAgent?.termsStatementUrl ?? "",
  privacyStatementUrl: product_default.defaultChatAgent?.privacyStatementUrl ?? ""
};

var ChatSetupDialog = class extends Disposable {
  constructor(container2, options3, keybindingService, layoutService, hostService, markdownRendererService, contextKeyService) {
    super();
    this.options = options3;
    const dialogVisible = ChatSetupDialogVisibleContext.bindTo(contextKeyService);
    dialogVisible.set(true);
    this._register(toDisposable(() => dialogVisible.reset()));
    this.dialog = this._register(new Dialog(
      container2,
      options3.title,
      options3.buttons.map((button) => button.label),
      createWorkbenchDialogOptions({
        type: "none",
        extraClasses: ["chat-setup-dialog", ...options3.extraClasses ?? []],
        detail: " ",
        icon: options3.icon,
        alignment: 1 /* Vertical */,
        cancelId: options3.buttons.length,
        disableCloseButton: options3.disableCloseButton,
        renderFooter: (footer) => {
          const element = footer.appendChild($(".chat-setup-dialog-footer"));
          const renderedFooter = this._register(markdownRendererService.render(new MarkdownString(options3.footer, { isTrusted: true })));
          element.appendChild($("p", void 0, renderedFooter.element));
          const customFooter = options3.renderFooter?.(element);
          if (customFooter) {
            this._register(customFooter);
          }
        },
        buttonOptions: options3.buttons.map((button) => {
          const classes2 = button.classes;
          return classes2 ? { styleButton: (control) => control.element.classList.add(...classes2) } : void 0;
        })
      }, keybindingService, layoutService, hostService)
    ));
  }
  async show() {
    const { button } = await this.dialog.show();
    return this.options.buttons[button]?.strategy ?? 0 /* Canceled */;
  }
};

ChatSetupDialog = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IHostService),
  __decorateParam(5, IMarkdownRendererService),
  __decorateParam(6, IContextKeyService)
], ChatSetupDialog);

async function showChatSetupDialogWithCancellation(dialog, cancellationToken, onDidDismissDialog) {
  let canceled2 = false;
  const cancellationListener = cancellationToken?.onCancellationRequested(() => {
    canceled2 = true;
    dialog.dispose();
  });
  try {
    if (cancellationToken?.isCancellationRequested) {
      canceled2 = true;
      dialog.dispose();
    }
    const strategy = canceled2 ? 0 /* Canceled */ : await dialog.show();
    if (!canceled2 && strategy === 0 /* Canceled */) {
      onDidDismissDialog?.();
    }
    return strategy;
  } finally {
    cancellationListener?.dispose();
    dialog.dispose();
  }
}

function shouldShowMicrosoftProvider(configurationService) {
  return configurationService.getValue(ChatMicrosoftAuthenticationEnabledSettingId) === true;
}

function getChatSetupDialogButtons(entitlement, options3, enterpriseAuthentication, showMicrosoftProvider, providers2 = defaultChat4.provider) {
  const button = (label3, strategy, ...classes2) => ({ label: label3, strategy, classes: classes2 });
  if (!options3?.forceAnonymous && (entitlement === 1 /* Unknown */ || options3?.forceSignInDialog)) {
    const defaultProviderButton = button(localize(11186, null, providers2.default.name), 2 /* SetupWithoutEnterpriseProvider */, "continue-button", "default");
    const defaultProviderLink = button(defaultProviderButton.label, defaultProviderButton.strategy, "link-button");
    const enterpriseProviderButton = button(localize(11186, null, providers2.enterprise.name), 3 /* SetupWithEnterpriseProvider */, "continue-button", "default");
    const enterpriseProviderLink = button(enterpriseProviderButton.label, enterpriseProviderButton.strategy, "link-button");
    const googleProviderButton = button(localize(11186, null, providers2.google.name), 4 /* SetupWithGoogleProvider */, "continue-button", "google");
    const appleProviderButton = button(localize(11186, null, providers2.apple.name), 5 /* SetupWithAppleProvider */, "continue-button", "apple");
    const microsoftProviderButton = button(localize(11186, null, providers2.microsoft.name), 6 /* SetupWithMicrosoftProvider */, "continue-button", "microsoft");
    const socialProviderButtons = [googleProviderButton, appleProviderButton, ...showMicrosoftProvider ? [microsoftProviderButton] : []];
    const providerButtons = enterpriseAuthentication ? [enterpriseProviderButton, ...socialProviderButtons, defaultProviderLink] : [defaultProviderButton, ...socialProviderButtons, enterpriseProviderLink];
    return options3?.allowContinueWithoutSignIn ? [...providerButtons, button(localize(11187, null), 0 /* Canceled */, "link-button")] : providerButtons;
  }
  return [button(localize(11191, null), 1 /* DefaultSetup */)];
}

function getChatSetupDialogFooter(forceAnonymous, telemetryLevel, settingsUrl, content = {
  providerName: defaultChat4.provider.default.name,
  termsStatementUrl: defaultChat4.termsStatementUrl,
  privacyStatementUrl: defaultChat4.privacyStatementUrl,
  publicCodeMatchesUrl: defaultChat4.publicCodeMatchesUrl
}) {
  if (forceAnonymous || telemetryLevel === 0 /* NONE */) {
    return localize(11190, null, content.providerName, content.termsStatementUrl, content.privacyStatementUrl);
  }
  return localize(11189, null, content.providerName, content.termsStatementUrl, content.privacyStatementUrl, content.providerName, content.publicCodeMatchesUrl, settingsUrl);
}

var ChatSetup = class {
  constructor(context2, controller, telemetryService, layoutService, chatEntitlementService, logService, widgetService, workspaceTrustRequestService, defaultAccountService, extensionService, workspaceTrustManagementService, instantiationService, configurationService) {
    this.context = context2;
    this.controller = controller;
    this.telemetryService = telemetryService;
    this.layoutService = layoutService;
    this.chatEntitlementService = chatEntitlementService;
    this.logService = logService;
    this.widgetService = widgetService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.defaultAccountService = defaultAccountService;
    this.extensionService = extensionService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.pendingRun = void 0;
    this.skipDialogOnce = false;
  }
  static {
    this.instance = void 0;
  }
  static getInstance(instantiationService, context2, controller) {
    let instance2 = ChatSetup.instance;
    if (!instance2) {
      instance2 = ChatSetup.instance = instantiationService.createInstance(ChatSetup, context2, controller);
    }
    return instance2;
  }
  skipDialog() {
    this.skipDialogOnce = true;
  }
  async run(options3) {
    if (this.pendingRun) {
      return this.pendingRun;
    }
    this.pendingRun = this.doRun(options3);
    try {
      return await this.pendingRun;
    } finally {
      this.pendingRun = void 0;
    }
  }
  async doRun(options3) {
    this.context.update({ later: false });
    const dialogSkipped = this.skipDialogOnce;
    this.skipDialogOnce = false;
    if (options3?.cancellationToken?.isCancellationRequested) {
      return { dialogSkipped, success: void 0 };
    }
    const wasTrusted = this.workspaceTrustManagementService.isWorkspaceTrusted();
    const trusted = await this.workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(11185, null)
    });
    if (!trusted) {
      this.context.update({ later: true });
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotTrusted", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
      return {
        dialogSkipped,
        success: void 0
        /* canceled */
      };
    }
    if (options3?.cancellationToken?.isCancellationRequested) {
      return { dialogSkipped, success: void 0 };
    }
    if (!wasTrusted) {
      await this.whenChatExtensionActivated();
    }
    let setupStrategy;
    if (options3?.setupStrategy !== void 0) {
      setupStrategy = options3.setupStrategy;
    } else if (!options3?.forceSignInDialog && (dialogSkipped || isProUser(this.chatEntitlementService.entitlement) || this.chatEntitlementService.entitlement === 5 /* Free */)) {
      setupStrategy = 1 /* DefaultSetup */;
    } else if (options3?.forceAnonymous === 2 /* EnabledWithoutDialog */) {
      setupStrategy = 1 /* DefaultSetup */;
    } else {
      setupStrategy = await this.showDialog(options3);
    }
    if (setupStrategy === 1 /* DefaultSetup */ && this.defaultAccountService.getDefaultAccountAuthenticationProvider().enterprise) {
      setupStrategy = 3 /* SetupWithEnterpriseProvider */;
    }
    let success = void 0;
    let setupError;
    let errorAlreadyHandled = false;
    const setupCancellation = new CancellationTokenSource(options3?.cancellationToken);
    try {
      if (setupStrategy !== 0 /* Canceled */) {
        options3?.onSignInStarted?.(() => setupCancellation.cancel());
      }
      if (setupStrategy !== 0 /* Canceled */ && !options3?.disableChatViewReveal) {
        this.widgetService.revealWidget();
      }
      switch (setupStrategy) {
        case 3 /* SetupWithEnterpriseProvider */:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: true, useSocialProvider: void 0, additionalScopes: options3?.additionalScopes, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 2 /* SetupWithoutEnterpriseProvider */:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: void 0, additionalScopes: options3?.additionalScopes, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 5 /* SetupWithAppleProvider */:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: "apple", additionalScopes: options3?.additionalScopes, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 4 /* SetupWithGoogleProvider */:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: "google", additionalScopes: options3?.additionalScopes, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 6 /* SetupWithMicrosoftProvider */:
          success = await this.controller.value.setupWithProvider({ useEnterpriseProvider: false, useSocialProvider: "microsoft", additionalScopes: options3?.additionalScopes, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 1 /* DefaultSetup */:
          success = await this.controller.value.setup({ ...options3, forceAnonymous: options3?.forceAnonymous, cancellationToken: setupCancellation.token });
          break;
        case 0 /* Canceled */:
          this.context.update({ later: true });
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedMaybeLater", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
          break;
      }
    } catch (error) {
      this.logService.error(`[chat setup] Error during setup: ${toErrorMessage(error)}`);
      success = false;
      if (error instanceof ChatSetupError) {
        setupError = error.originalError;
        errorAlreadyHandled = error.userNotified;
      } else {
        setupError = error instanceof Error ? error : new Error(toErrorMessage(error));
      }
    } finally {
      setupCancellation.dispose();
    }
    if (success) {
      this.context.update({ completed: true });
    }
    return { success, dialogSkipped, error: setupError, errorAlreadyHandled };
  }
  /**
   * Whether the default chat extension has finished activating. `activationTimes`
   * is only set once activation completes, so `undefined` means "not yet active".
   */
  isChatExtensionActivated() {
    const status2 = this.extensionService.getExtensionsStatus();
    for (const id2 of Object.keys(status2)) {
      if (ExtensionIdentifier.equals(id2, defaultChat4.chatExtensionId)) {
        return status2[id2].activationTimes !== void 0;
      }
    }
    return false;
  }
  /**
   * Resolves once the default chat extension has finished activating (bounded by
   * a timeout). Detection relies only on the extension lifecycle, so it never
   * touches the user's authentication session.
   */
  async whenChatExtensionActivated(timeoutMs = 1e4) {
    if (!defaultChat4.chatExtensionId || this.isChatExtensionActivated()) {
      return;
    }
    const store = new DisposableStore();
    try {
      await raceTimeout(new Promise((resolve3) => {
        const check = () => {
          if (this.isChatExtensionActivated()) {
            resolve3();
          }
        };
        store.add(this.extensionService.onDidChangeExtensionsStatus(check));
        this.extensionService.whenInstalledExtensionsRegistered().then(check);
      }), timeoutMs);
    } finally {
      store.dispose();
    }
  }
  async showDialog(options3) {
    if (options3?.cancellationToken?.isCancellationRequested) {
      return 0 /* Canceled */;
    }
    const enterpriseAuthentication = this.defaultAccountService.getDefaultAccountAuthenticationProvider().enterprise;
    const showMicrosoftProvider = shouldShowMicrosoftProvider(this.configurationService);
    const buttons = getChatSetupDialogButtons(this.context.state.entitlement, options3, enterpriseAuthentication, showMicrosoftProvider);
    const dialog = this.instantiationService.createInstance(ChatSetupDialog, this.layoutService.activeContainer, {
      title: this.getDialogTitle(options3),
      buttons,
      icon: options3?.dialogIcon ?? Codicon.copilotLarge,
      disableCloseButton: options3?.disableCloseButton ?? false,
      footer: getChatSetupDialogFooter(options3?.forceAnonymous, this.telemetryService.telemetryLevel, this.defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotSettings)),
      extraClasses: options3?.dialogExtraClasses,
      renderFooter: options3?.renderDialogFooter
    });
    return showChatSetupDialogWithCancellation(dialog, options3?.cancellationToken, options3?.onDidDismissDialog);
  }
  getDialogTitle(options3) {
    if (options3?.dialogTitle) {
      return options3.dialogTitle;
    }
    if (this.chatEntitlementService.anonymous) {
      if (options3?.forceAnonymous) {
        return localize(11193, null);
      } else {
        return localize(11188, null);
      }
    }
    if (this.context.state.entitlement === 1 /* Unknown */ || options3?.forceSignInDialog) {
      return localize(11192, null);
    }
    return localize(11193, null);
  }
};

ChatSetup = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IChatEntitlementService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, IWorkspaceTrustRequestService),
  __decorateParam(8, IDefaultAccountService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, IInstantiationService),
  __decorateParam(12, IConfigurationService)
], ChatSetup);
export { showChatSetupDialogWithCancellation, shouldShowMicrosoftProvider, getChatSetupDialogButtons, getChatSetupDialogFooter, fallbackProviders, configuredProviders, defaultChat4, ChatSetupDialog, ChatSetup };
