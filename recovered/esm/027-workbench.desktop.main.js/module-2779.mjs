// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupController.ts
import { product_default } from "./module-0139.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { StopWatch } from "./module-0016.mjs";
import { localize } from "./module-0001.mjs";
import { ChatViewContainerId, ChatViewId } from "./module-0981.mjs";
import { IActivityService, ProgressBadge } from "./module-1449.mjs";
import { CHAT_OPEN_ACTION_ID } from "./module-1476.mjs";
import { ChatSetupError, maybeEnableAuthExtension, refreshTokens } from "./module-2778.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { severity_default } from "./module-0266.mjs";
import { isProUser } from "./module-0953.mjs";
import { isObject, isUndefined } from "./module-0010.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupController.ts
var defaultChat3 = {
  chatExtensionId: product_default.defaultChatAgent?.chatExtensionId ?? "",
  provider: product_default.defaultChatAgent?.provider ?? { default: { id: "", name: "" }, enterprise: { id: "", name: "" }, apple: { id: "", name: "" }, google: { id: "", name: "" }, microsoft: { id: "", name: "" } },
  providerUriSetting: product_default.defaultChatAgent?.providerUriSetting ?? "",
  completionsAdvancedSetting: product_default.defaultChatAgent?.completionsAdvancedSetting ?? ""
};

var ChatSetupController = class extends Disposable {
  constructor(context2, requests, telemetryService, extensionsWorkbenchService, logService, progressService, activityService, commandService, dialogService, configurationService, lifecycleService, quickInputService, defaultAccountService, productService) {
    super();
    this.context = context2;
    this.requests = requests;
    this.telemetryService = telemetryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.logService = logService;
    this.progressService = progressService;
    this.activityService = activityService;
    this.commandService = commandService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.lifecycleService = lifecycleService;
    this.quickInputService = quickInputService;
    this.defaultAccountService = defaultAccountService;
    this.productService = productService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._step = 1 /* Initial */;
    this.registerListeners();
  }
  get step() {
    return this._step;
  }
  registerListeners() {
    this._register(this.context.onDidChange(() => this._onDidChange.fire()));
  }
  setStep(step) {
    if (this._step === step) {
      return;
    }
    this._step = step;
    this._onDidChange.fire();
  }
  async setup(options3 = {}) {
    const watch2 = new StopWatch(false);
    const title = localize(11152, null);
    const badge = this.activityService.showViewContainerActivity(ChatViewContainerId, {
      badge: new ProgressBadge(() => title)
    });
    try {
      return await this.progressService.withProgress({
        location: 10 /* Window */,
        command: CHAT_OPEN_ACTION_ID,
        title
      }, () => this.doSetup(options3, watch2));
    } finally {
      badge.dispose();
    }
  }
  async doSetup(options3, watch2) {
    if (options3.cancellationToken?.isCancellationRequested) {
      return void 0;
    }
    this.context.suspend();
    let success = false;
    try {
      let entitlement;
      let signIn;
      if (options3.forceSignIn) {
        signIn = true;
      } else if (this.context.state.entitlement === 1 /* Unknown */) {
        if (options3.forceAnonymous) {
          signIn = false;
        } else {
          signIn = true;
        }
      } else {
        signIn = false;
      }
      if (signIn) {
        this.setStep(2 /* SigningIn */);
        const result = await this.signIn(options3);
        if (!result) {
          return void 0;
        }
        if (!result.defaultAccount) {
          const provider = options3.useSocialProvider ?? (options3.useEnterpriseProvider ? defaultChat3.provider.enterprise.id : defaultChat3.provider.default.id);
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNotSignedIn", installDuration: watch2.elapsed(), signUpErrorCode: void 0, provider });
          return void 0;
        }
        entitlement = result.entitlement;
      }
      if (options3.cancellationToken?.isCancellationRequested) {
        return void 0;
      }
      this.setStep(3 /* Installing */);
      success = await this.install(entitlement ?? this.context.state.entitlement, watch2, options3);
    } finally {
      this.setStep(1 /* Initial */);
      this.context.resume();
    }
    return success;
  }
  async signIn(options3) {
    const authExtensionReEnabled = await maybeEnableAuthExtension(this.extensionsWorkbenchService, this.logService);
    if (authExtensionReEnabled) {
      refreshTokens(this.commandService);
    }
    if (options3.cancellationToken?.isCancellationRequested) {
      return void 0;
    }
    let entitlements;
    let defaultAccount;
    let signInError;
    try {
      const result = await raceCancellation(this.requests.signIn(options3), options3.cancellationToken ?? CancellationToken.None);
      if (!result) {
        return void 0;
      }
      ({ defaultAccount, entitlements } = result);
    } catch (e) {
      this.logService.error(`[chat setup] signIn: error ${e}`);
      signInError = e instanceof Error ? e : new Error(String(e));
    }
    if (options3.cancellationToken?.isCancellationRequested) {
      return void 0;
    }
    if (!defaultAccount && !this.lifecycleService.willShutdown) {
      const { confirmed } = await this.dialogService.confirm({
        type: severity_default.Error,
        message: localize(11154, null, this.defaultAccountService.getDefaultAccountAuthenticationProvider().name),
        detail: localize(11155, null),
        primaryButton: localize(11151, null)
      });
      if (confirmed) {
        return this.signIn(options3);
      }
    }
    if (signInError) {
      throw new ChatSetupError(signInError, true);
    }
    return { defaultAccount, entitlement: entitlements?.entitlement };
  }
  async install(entitlement, watch2, options3) {
    const wasRunning = this.context.state.completed && !this.context.state.disabled;
    let signUpResult = void 0;
    let provider;
    if (options3.forceAnonymous && entitlement === 1 /* Unknown */) {
      provider = "anonymous";
    } else {
      provider = options3.useSocialProvider ?? (options3.useEnterpriseProvider ? defaultChat3.provider.enterprise.id : defaultChat3.provider.default.id);
    }
    try {
      if (!options3.forceAnonymous && // User is not asking for anonymous access
      entitlement !== 5 /* Free */ && // User is not signed up to Copilot Free
      !isProUser(entitlement) && // User is not signed up for a Copilot subscription
      entitlement !== 4 /* Unavailable */) {
        signUpResult = await this.requests.signUpFree();
        if (isUndefined(signUpResult)) {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedNoSession", installDuration: watch2.elapsed(), signUpErrorCode: void 0, provider });
          return false;
        }
        if (typeof signUpResult !== "boolean") {
          this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedSignUp", installDuration: watch2.elapsed(), signUpErrorCode: signUpResult.errorCode, provider });
        }
      }
      await this.doInstallWithRetry();
    } catch (error) {
      this.logService.error(`[chat setup] install: error ${error}`);
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: isCancellationError(error) ? "cancelled" : "failedInstall", installDuration: watch2.elapsed(), signUpErrorCode: void 0, provider });
      return false;
    }
    if (typeof signUpResult === "boolean" || typeof signUpResult === "undefined") {
      this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: wasRunning && !signUpResult ? "alreadyInstalled" : "installed", installDuration: watch2.elapsed(), signUpErrorCode: void 0, provider });
    }
    if (wasRunning) {
      refreshTokens(this.commandService);
    }
    return true;
  }
  async doInstallWithRetry() {
    let error;
    try {
      await this.doInstall();
    } catch (e) {
      this.logService.error(`[chat setup] install: error ${error}`);
      error = e;
    }
    if (error) {
      if (!this.lifecycleService.willShutdown) {
        const { confirmed } = await this.dialogService.confirm({
          type: severity_default.Error,
          message: localize(11153, null),
          detail: error && !isCancellationError(error) ? toErrorMessage(error) : void 0,
          primaryButton: localize(11151, null)
        });
        if (confirmed) {
          return this.doInstallWithRetry();
        }
      }
      throw error;
    }
  }
  async doInstall() {
    await this.extensionsWorkbenchService.install(defaultChat3.chatExtensionId, {
      enable: true,
      isApplicationScoped: true,
      // install into all profiles
      isMachineScoped: false,
      // do not ask to sync
      installEverywhere: true,
      // install in local and remote
      installPreReleaseVersion: this.productService.quality !== "stable"
    }, ChatViewId);
  }
  async setupWithProvider(options3) {
    if (options3.cancellationToken?.isCancellationRequested) {
      return void 0;
    }
    const registry4 = Registry.as(Extensions4.Configuration);
    registry4.registerConfiguration({
      "id": "copilot.setup",
      "type": "object",
      "properties": {
        [defaultChat3.completionsAdvancedSetting]: {
          "type": "object",
          "properties": {
            "authProvider": {
              "type": "string"
            }
          }
        },
        [defaultChat3.providerUriSetting]: {
          "type": "string"
        }
      }
    });
    if (options3.useEnterpriseProvider) {
      const success = await this.handleEnterpriseInstance();
      if (!success) {
        this.telemetryService.publicLog2("commandCenter.chatInstall", { installResult: "failedEnterpriseSetup", installDuration: 0, signUpErrorCode: void 0, provider: void 0 });
        return success;
      }
    }
    if (options3.cancellationToken?.isCancellationRequested) {
      return void 0;
    }
    let existingAdvancedSetting = this.configurationService.inspect(defaultChat3.completionsAdvancedSetting).user?.value;
    if (!isObject(existingAdvancedSetting)) {
      existingAdvancedSetting = {};
    }
    if (options3.useEnterpriseProvider) {
      await this.configurationService.updateValue(`${defaultChat3.completionsAdvancedSetting}`, {
        ...existingAdvancedSetting,
        "authProvider": defaultChat3.provider.enterprise.id
      }, 2 /* USER */);
    } else {
      await this.configurationService.updateValue(`${defaultChat3.completionsAdvancedSetting}`, Object.keys(existingAdvancedSetting).length > 0 ? {
        ...existingAdvancedSetting,
        "authProvider": void 0
      } : void 0, 2 /* USER */);
    }
    return this.setup({ ...options3, forceSignIn: true });
  }
  async handleEnterpriseInstance() {
    const domainRegEx = /^[a-zA-Z\-_]+$/;
    const fullUriRegEx = /^(https:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.ghe\.com\/?$/;
    const uri5 = this.configurationService.getValue(defaultChat3.providerUriSetting);
    if (typeof uri5 === "string" && fullUriRegEx.test(uri5)) {
      return true;
    }
    let isSingleWord = false;
    const result = await this.quickInputService.input({
      prompt: localize(11148, null, defaultChat3.provider.enterprise.name),
      placeHolder: localize(11149, null),
      ignoreFocusLost: true,
      value: uri5,
      validateInput: async (value2) => {
        isSingleWord = false;
        if (!value2) {
          return void 0;
        }
        if (domainRegEx.test(value2)) {
          isSingleWord = true;
          return {
            content: localize(11156, null, `https://${value2}.ghe.com`),
            severity: severity_default.Info
          };
        }
        if (!fullUriRegEx.test(value2)) {
          return {
            content: localize(11150, null, defaultChat3.provider.enterprise.name),
            severity: severity_default.Error
          };
        }
        return void 0;
      }
    });
    if (!result) {
      return void 0;
    }
    let resolvedUri = result;
    if (isSingleWord) {
      resolvedUri = `https://${resolvedUri}.ghe.com`;
    } else {
      const normalizedUri = result.toLowerCase();
      const hasHttps = normalizedUri.startsWith("https://");
      if (!hasHttps) {
        resolvedUri = `https://${result}`;
      }
    }
    await this.configurationService.updateValue(defaultChat3.providerUriSetting, resolvedUri, 2 /* USER */);
    return true;
  }
};

ChatSetupController = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IExtensionsWorkbenchService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IProgressService),
  __decorateParam(6, IActivityService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, ILifecycleService),
  __decorateParam(11, IQuickInputService),
  __decorateParam(12, IDefaultAccountService),
  __decorateParam(13, IProductService)
], ChatSetupController);
export { defaultChat3, ChatSetupController };
