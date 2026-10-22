// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/accounts/browser/defaultAccount.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Barrier, RunOnceScheduler, ThrottledDelayer, timeout } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED, isManagedSettingsFreshnessBlocking, isManagedSettingsFreshnessSatisfiedFor } from "./module-0740.mjs";
import { equals4 } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { isWeb } from "./module-0014.mjs";
import { IFileManagedSettingsService, INativeManagedSettingsService, resolveForceRemoteSettingsRefresh } from "./module-0956.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson, asText, isClientError, isSuccess, readHeader, retryAfterFromHeaders } from "./module-0947.mjs";
import { isString, isUndefined } from "./module-0010.mjs";
import { adaptManagedSettings, appendManagedSettingsClientIdentity, parseManagedSettingsCompatibilityError } from "./module-1502.mjs";
import { IDefaultAccountService, MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE } from "./module-0741.mjs";
import { distinct } from "./module-0007.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAuthenticationExtensionsService, IAuthenticationService } from "./module-0952.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHostService } from "./module-1118.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/services/accounts/browser/defaultAccount.ts
var DEFAULT_ACCOUNT_SIGN_IN_COMMAND = "workbench.actions.accounts.signIn";

var CONTEXT_DEFAULT_ACCOUNT_STATE = new RawContextKey("defaultAccountStatus", "uninitialized" /* Uninitialized */);

var CACHED_POLICY_DATA_KEY = "defaultAccount.cachedPolicyData";

var ACCOUNT_DATA_POLL_INTERVAL_MS = 60 * 60 * 1e3;

var MANAGED_SETTINGS_REQUEST_TIMEOUT_MS = 5e3;

function toDefaultAccountConfig(defaultChatAgent2) {
  return {
    preferredExtensions: [
      defaultChatAgent2.chatExtensionId,
      defaultChatAgent2.extensionId
    ],
    authenticationProvider: {
      default: {
        id: defaultChatAgent2.provider.default.id,
        name: defaultChatAgent2.provider.default.name
      },
      enterprise: {
        id: defaultChatAgent2.provider.enterprise.id,
        name: defaultChatAgent2.provider.enterprise.name
      },
      enterpriseProviderConfig: `${defaultChatAgent2.completionsAdvancedSetting}.authProvider`,
      enterpriseProviderUriSetting: defaultChatAgent2.providerUriSetting,
      scopes: defaultChatAgent2.providerScopes
    },
    entitlementUrl: defaultChatAgent2.entitlementUrl,
    tokenEntitlementUrl: defaultChatAgent2.tokenEntitlementUrl,
    mcpRegistryDataUrl: defaultChatAgent2.mcpRegistryDataUrl,
    managedSettingsUrl: defaultChatAgent2.managedSettingsUrl
  };
}

var DefaultAccountService = class extends Disposable {
  constructor(productService) {
    super();
    this.defaultAccount = null;
    this.initBarrier = new Barrier();
    this._onDidChangeDefaultAccount = this._register(new Emitter());
    this.onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
    this._onDidChangePolicyData = this._register(new Emitter());
    this.onDidChangePolicyData = this._onDidChangePolicyData.event;
    this._onDidChangeCopilotTokenInfo = this._register(new Emitter());
    this.onDidChangeCopilotTokenInfo = this._onDidChangeCopilotTokenInfo.event;
    this._onDidChangeManagedSettingsCompatibilityError = this._register(new Emitter());
    this.onDidChangeManagedSettingsCompatibilityError = this._onDidChangeManagedSettingsCompatibilityError.event;
    this._onDidChangeManagedSettingsFreshness = this._register(new Emitter());
    this.onDidChangeManagedSettingsFreshness = this._onDidChangeManagedSettingsFreshness.event;
    this.defaultAccountProvider = null;
    this.defaultAccountConfig = productService.defaultChatAgent ? toDefaultAccountConfig(productService.defaultChatAgent) : void 0;
    if (!this.defaultAccountConfig) {
      this.initBarrier.open();
    }
  }
  get currentDefaultAccount() {
    return this.defaultAccount;
  }
  get policyData() {
    return this.defaultAccountProvider?.policyData ?? null;
  }
  get copilotTokenInfo() {
    return this.defaultAccountProvider?.copilotTokenInfo ?? null;
  }
  get managedSettingsFetchStatus() {
    return this.defaultAccountProvider?.managedSettingsFetchStatus ?? null;
  }
  get managedSettingsFetchedAt() {
    return this.defaultAccountProvider?.managedSettingsFetchedAt ?? null;
  }
  get managedSettingsRawResponse() {
    return this.defaultAccountProvider?.managedSettingsRawResponse ?? null;
  }
  get managedSettingsCompatibilityError() {
    return this.defaultAccountProvider?.managedSettingsCompatibilityError ?? null;
  }
  get managedSettingsFreshness() {
    return this.defaultAccountProvider?.managedSettingsFreshness ?? MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED;
  }
  async getDefaultAccount() {
    await this.initBarrier.wait();
    return this.defaultAccount;
  }
  getDefaultAccountAuthenticationProvider() {
    if (this.defaultAccountProvider) {
      return this.defaultAccountProvider.getDefaultAccountAuthenticationProvider();
    }
    if (!this.defaultAccountConfig) {
      return { id: "default", name: "Default", enterprise: false };
    }
    return {
      ...this.defaultAccountConfig.authenticationProvider.default,
      enterprise: false
    };
  }
  setDefaultAccountProvider(provider) {
    if (this.defaultAccountProvider) {
      throw new Error("Default account provider is already set");
    }
    this.defaultAccountProvider = provider;
    this._register(provider.onDidChangeManagedSettingsCompatibilityError((error) => this._onDidChangeManagedSettingsCompatibilityError.fire(error)));
    this._register(provider.onDidChangeManagedSettingsFreshness((freshness) => this._onDidChangeManagedSettingsFreshness.fire(freshness)));
    if (this.defaultAccountProvider.policyData) {
      this._onDidChangePolicyData.fire(this.defaultAccountProvider.policyData);
    }
    if (this.defaultAccountProvider.managedSettingsCompatibilityError) {
      this._onDidChangeManagedSettingsCompatibilityError.fire(this.defaultAccountProvider.managedSettingsCompatibilityError);
    }
    if (this.defaultAccountProvider.managedSettingsFreshness.state !== "notRequired" /* NotRequired */) {
      this._onDidChangeManagedSettingsFreshness.fire(this.defaultAccountProvider.managedSettingsFreshness);
    }
    provider.refresh().then((account) => {
      this.defaultAccount = account;
    }).finally(() => {
      this.initBarrier.open();
      this._register(provider.onDidChangeDefaultAccount((account) => this.setDefaultAccount(account)));
      this._register(provider.onDidChangePolicyData((policyData) => this._onDidChangePolicyData.fire(policyData)));
      this._register(provider.onDidChangeCopilotTokenInfo((tokenInfo) => this._onDidChangeCopilotTokenInfo.fire(tokenInfo)));
    });
  }
  async refresh(options3) {
    await this.initBarrier.wait();
    const account = await this.defaultAccountProvider?.refresh(options3);
    this.setDefaultAccount(account ?? null);
    return this.defaultAccount;
  }
  async signIn(options3) {
    await this.initBarrier.wait();
    if (!this.defaultAccountConfig) {
      return null;
    }
    return this.defaultAccountProvider?.signIn(options3) ?? null;
  }
  async signOut() {
    await this.initBarrier.wait();
    await this.defaultAccountProvider?.signOut();
  }
  resolveGitHubUrl(path) {
    if (this.defaultAccountProvider) {
      return this.defaultAccountProvider.resolveGitHubUrl(path);
    }
    return `https://github.com/${path}`;
  }
  setDefaultAccount(account) {
    if (equals4(this.defaultAccount, account)) {
      return;
    }
    this.defaultAccount = account;
    this._onDidChangeDefaultAccount.fire(this.defaultAccount);
  }
};

DefaultAccountService = __decorateClass([
  __decorateParam(0, IProductService)
], DefaultAccountService);

var DefaultAccountProvider = class extends Disposable {
  constructor(defaultAccountConfig, configurationService, authenticationService, authenticationExtensionsService, telemetryService, extensionService, requestService, logService, environmentService, productService, contextKeyService, storageService, hostService, commandService, nativeManagedSettingsService, fileManagedSettingsService) {
    super();
    this.defaultAccountConfig = defaultAccountConfig;
    this.configurationService = configurationService;
    this.authenticationService = authenticationService;
    this.authenticationExtensionsService = authenticationExtensionsService;
    this.telemetryService = telemetryService;
    this.extensionService = extensionService;
    this.requestService = requestService;
    this.logService = logService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.storageService = storageService;
    this.hostService = hostService;
    this.commandService = commandService;
    this.nativeManagedSettingsService = nativeManagedSettingsService;
    this.fileManagedSettingsService = fileManagedSettingsService;
    this._defaultAccount = null;
    this._policyData = null;
    this._copilotTokenInfo = null;
    this._managedSettingsFetchStatus = null;
    this._managedSettingsRawResponse = null;
    this._managedSettingsCompatibilityError = null;
    this._managedSettingsFreshness = MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED;
    this._onDidChangeDefaultAccount = this._register(new Emitter());
    this.onDidChangeDefaultAccount = this._onDidChangeDefaultAccount.event;
    this._onDidChangePolicyData = this._register(new Emitter());
    this.onDidChangePolicyData = this._onDidChangePolicyData.event;
    this._onDidChangeCopilotTokenInfo = this._register(new Emitter());
    this.onDidChangeCopilotTokenInfo = this._onDidChangeCopilotTokenInfo.event;
    this._onDidChangeManagedSettingsCompatibilityError = this._register(new Emitter());
    this.onDidChangeManagedSettingsCompatibilityError = this._onDidChangeManagedSettingsCompatibilityError.event;
    this._onDidChangeManagedSettingsFreshness = this._register(new Emitter());
    this.onDidChangeManagedSettingsFreshness = this._onDidChangeManagedSettingsFreshness.event;
    this.initialized = false;
    this.updateThrottler = this._register(new ThrottledDelayer(100));
    this.accountDataPollScheduler = this._register(new RunOnceScheduler(() => this.refetchDefaultAccount(), ACCOUNT_DATA_POLL_INTERVAL_MS));
    this.failedManagedSettingsFreshness = /* @__PURE__ */ new Map();
    this._rateLimitBackoffUntil = 0;
    this.accountStatusContext = CONTEXT_DEFAULT_ACCOUNT_STATE.bindTo(contextKeyService);
    const cachedAccountData = this.getCachedAccountData();
    this._policyData = cachedAccountData?.accountPolicyData ?? null;
    this._copilotTokenInfo = cachedAccountData?.copilotTokenInfo ?? null;
    this._managedSettingsCompatibilityError = cachedAccountData?.accountPolicyData.managedSettingsCompatibilityError ?? null;
    this.updateManagedSettingsFreshnessRequirement(
      this.nativeManagedSettingsService.managedSettings,
      this.getCachedServerManagedSettings(this.getDefaultAccountAuthenticationProvider()),
      this.fileManagedSettingsService.managedSettings
    );
    this._register(this.nativeManagedSettingsService.onDidChangeManagedSettings(() => this.onManagedSettingsSourceChanged()));
    this._register(this.fileManagedSettingsService.onDidChangeManagedSettings(() => this.onManagedSettingsSourceChanged()));
    this.initPromise = this.init().finally(() => {
      this.telemetryService.publicLog2("defaultaccount:status", { status: this.defaultAccount ? "available" : "unavailable", initial: true });
      this.initialized = true;
    });
  }
  get defaultAccount() {
    return this._defaultAccount?.defaultAccount ?? null;
  }
  get policyData() {
    return this._policyData?.policyData ?? null;
  }
  get copilotTokenInfo() {
    return this._copilotTokenInfo;
  }
  get managedSettingsFetchStatus() {
    return this._managedSettingsFetchStatus;
  }
  get managedSettingsFetchedAt() {
    return this._policyData?.managedSettingsFetchedAt ?? null;
  }
  get managedSettingsRawResponse() {
    return this._managedSettingsRawResponse;
  }
  get managedSettingsCompatibilityError() {
    return this._managedSettingsCompatibilityError;
  }
  get managedSettingsFreshness() {
    return this._managedSettingsFreshness;
  }
  getCachedAccountData() {
    const cached = this.storageService.get(CACHED_POLICY_DATA_KEY, -1 /* APPLICATION */);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const { accountId, policyData, tokenEntitlementsFetchedAt, mcpRegistryDataFetchedAt, copilotTokenInfo } = parsed;
        if (accountId && policyData) {
          this.logService.debug("[DefaultAccount] Initializing with cached policy data (migrating old format)");
          const result = { accountPolicyData: { accountId, policyData, tokenEntitlementsFetchedAt, mcpRegistryDataFetchedAt }, copilotTokenInfo };
          this.storageService.store(CACHED_POLICY_DATA_KEY, JSON.stringify(result), -1 /* APPLICATION */, 1 /* MACHINE */);
          return result;
        }
        const { accountPolicyData, copilotTokenInfo: wrappedCopilotTokenInfo } = parsed;
        if (accountPolicyData?.accountId && accountPolicyData?.policyData) {
          this.logService.debug("[DefaultAccount] Initializing with cached policy data");
          return { accountPolicyData, copilotTokenInfo: wrappedCopilotTokenInfo };
        }
      } catch (error) {
        this.logService.error("[DefaultAccount] Failed to parse cached policy data", getErrorMessage(error));
      }
    }
    return null;
  }
  async init() {
    if (isWeb && !this.environmentService.remoteAuthority && !this.environmentService.isSessionsWindow) {
      this.logService.debug("[DefaultAccount] Running in web without remote, skipping initialization");
      return;
    }
    await this.whenDefaultAccountAuthenticationProviderAvailable();
    this.logService.debug("[DefaultAccount] Starting initialization");
    await this.doUpdateDefaultAccount();
    this.logService.debug("[DefaultAccount] Initialization complete");
    this._register(this.onDidChangeDefaultAccount((account) => {
      this.telemetryService.publicLog2("defaultaccount:status", { status: account ? "available" : "unavailable", initial: false });
    }));
    this._register(this.authenticationService.onDidChangeSessions((e4) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e4.providerId !== defaultAccountProvider.id) {
        return;
      }
      if (this.defaultAccount && e4.event.removed?.some((session) => session.id === this.defaultAccount?.sessionId)) {
        this.setDefaultAccount(null);
      } else {
        this.logService.debug("[DefaultAccount] Sessions changed for default account provider, updating default account");
        this.updateDefaultAccount();
      }
    }));
    this._register(this.authenticationExtensionsService.onDidChangeAccountPreference(async (e4) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e4.providerId !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Account preference changed for default account provider, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider((e4) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e4.id !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Default account provider registered, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.authenticationService.onDidUnregisterAuthenticationProvider((e4) => {
      const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
      if (e4.id !== defaultAccountProvider.id) {
        return;
      }
      this.logService.debug("[DefaultAccount] Default account provider unregistered, updating default account");
      this.updateDefaultAccount();
    }));
    this._register(this.hostService.onDidChangeFocus((focused) => {
      if (focused) {
        this.refetchDefaultAccount();
      }
    }));
  }
  async whenDefaultAccountAuthenticationProviderAvailable() {
    const provider = this.getDefaultAccountAuthenticationProvider();
    this.logService.debug("[DefaultAccount] Waiting for default account authentication provider to be available.");
    const disposables = new DisposableStore();
    try {
      await new Promise((resolve3) => {
        if (this.isAccountProviderAvailable(provider)) {
          this.logService.debug("[DefaultAccount] Default account authentication provider is now available.");
          resolve3();
          return;
        }
        disposables.add(Event2.any(this.authenticationService.onDidChangeDeclaredProviders, this.authenticationService.onDidRegisterAuthenticationProvider)(() => {
          if (this.isAccountProviderAvailable(provider)) {
            this.logService.debug("[DefaultAccount] Default account authentication provider is now available.");
            resolve3();
          }
        }));
        if (this.environmentService.remoteAuthority) {
          void this.authenticationService.getSessions(provider.id, void 0, {}, true);
        }
        this.extensionService.whenInstalledExtensionsRegistered().then(() => {
          disposables.dispose();
          this.logService.debug("[DefaultAccount] Installed extensions registered.");
          resolve3();
        }, (error) => {
          this.logService.error("[DefaultAccount] Error while waiting for installed extensions to be registered", getErrorMessage(error));
          resolve3();
        });
      });
    } finally {
      disposables.dispose();
    }
  }
  async refresh(options3) {
    if (!this.initialized) {
      await this.initPromise;
      return this.defaultAccount;
    }
    this.logService.debug("[DefaultAccount] Refreshing default account");
    await this.updateDefaultAccount(options3);
    return this.defaultAccount;
  }
  async refetchDefaultAccount() {
    if (this.accountDataPollScheduler.isScheduled()) {
      this.accountDataPollScheduler.cancel();
    }
    if (!this.hostService.hasFocus || !this._defaultAccount) {
      this.scheduleAccountDataPoll();
      this.logService.debug("[DefaultAccount] Skipping refetching default account. Host is not focused or default account is not set");
      return;
    }
    this.logService.debug("[DefaultAccount] Refetching default account");
    await this.updateDefaultAccount();
  }
  async updateDefaultAccount(options3) {
    await this.updateThrottler.trigger(() => this.doUpdateDefaultAccount(options3));
  }
  async doUpdateDefaultAccount(options3) {
    try {
      const defaultAccount = await this.fetchDefaultAccount(options3);
      this.setDefaultAccount(defaultAccount);
      this.scheduleAccountDataPoll();
    } catch (error) {
      this.logService.error("[DefaultAccount] Error while updating default account", getErrorMessage(error));
      this.blockPendingManagedSettingsFreshness();
    }
  }
  async fetchDefaultAccount(options3) {
    const defaultAccountProvider = this.getDefaultAccountAuthenticationProvider();
    this.logService.debug("[DefaultAccount] Default account provider ID:", defaultAccountProvider.id);
    const managedSettingsSources = await this.initializeManagedSettingsSources();
    const refreshRequirement = resolveForceRemoteSettingsRefresh(
      managedSettingsSources.nativeMdm,
      this.getCachedServerManagedSettings(defaultAccountProvider),
      managedSettingsSources.file
    );
    if (!refreshRequirement.effective) {
      this.setManagedSettingsFreshness(MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED);
    }
    if (!this.isAccountProviderAvailable(defaultAccountProvider)) {
      this.logService.info(`[DefaultAccount] Authentication provider is not available.`, defaultAccountProvider);
      this.blockManagedSettingsFreshnessWithoutToken(refreshRequirement);
      return null;
    }
    return await this.getDefaultAccountForAuthenticationProvider(defaultAccountProvider, managedSettingsSources, refreshRequirement, options3);
  }
  isAccountProviderAvailable(accountProvider) {
    return this.authenticationService.declaredProviders.some((p) => p.id === accountProvider.id) || this.authenticationService.isAuthenticationProviderRegistered(accountProvider.id);
  }
  setDefaultAccount(account) {
    if (equals4(this._defaultAccount, account)) {
      return;
    }
    this.logService.trace("[DefaultAccount] Updating default account:", account);
    if (account) {
      this._defaultAccount = account;
      this.setCopilotTokenInfo(account.copilotTokenInfo);
      this.setPolicyData(account.policyData);
      this.setManagedSettingsCompatibilityError(account.policyData?.managedSettingsCompatibilityError ?? null);
      this._onDidChangeDefaultAccount.fire(this._defaultAccount.defaultAccount);
      this.accountStatusContext.set("available" /* Available */);
      this.logService.debug("[DefaultAccount] Account status set to Available");
    } else {
      this._defaultAccount = null;
      const refreshRequirement = resolveForceRemoteSettingsRefresh(
        this.nativeManagedSettingsService.managedSettings,
        this.getCachedServerManagedSettings(this.getDefaultAccountAuthenticationProvider()),
        this.fileManagedSettingsService.managedSettings
      );
      this.blockManagedSettingsFreshnessWithoutToken(refreshRequirement);
      const retainedPolicyData = this._managedSettingsFreshness.state !== "notRequired" /* NotRequired */ && isManagedSettingsFreshnessBlocking(this._managedSettingsFreshness) && this._managedSettingsFreshness.source === "server" ? this._policyData : null;
      this.setPolicyData(retainedPolicyData);
      this.setManagedSettingsCompatibilityError(null);
      this.setCopilotTokenInfo(null);
      this._onDidChangeDefaultAccount.fire(null);
      this.accountDataPollScheduler.cancel();
      this.accountStatusContext.set("unavailable" /* Unavailable */);
      this.logService.debug("[DefaultAccount] Account status set to Unavailable");
    }
  }
  setPolicyData(accountPolicyData) {
    if (equals4(this._policyData, accountPolicyData)) {
      return;
    }
    this._policyData = accountPolicyData;
    this.cachePolicyData(accountPolicyData);
    this._onDidChangePolicyData.fire(this._policyData?.policyData ?? null);
  }
  setManagedSettingsCompatibilityError(error) {
    if (equals4(this._managedSettingsCompatibilityError, error)) {
      return;
    }
    this._managedSettingsCompatibilityError = error;
    this._onDidChangeManagedSettingsCompatibilityError.fire(error);
  }
  setManagedSettingsFreshness(freshness) {
    if (equals4(this._managedSettingsFreshness, freshness)) {
      return;
    }
    this._managedSettingsFreshness = freshness;
    this._onDidChangeManagedSettingsFreshness.fire(freshness);
  }
  blockPendingManagedSettingsFreshness() {
    if (this._managedSettingsFreshness.state === "pending" /* Pending */) {
      this.setManagedSettingsFreshness({
        ...this._managedSettingsFreshness,
        state: "blocked" /* Blocked */,
        failure: "network" /* Network */
      });
    }
  }
  updateManagedSettingsFreshnessRequirement(nativeMdm, server, file) {
    const requirement = resolveForceRemoteSettingsRefresh(nativeMdm, server, file);
    this.setManagedSettingsFreshness(requirement.effective ? { state: "pending" /* Pending */, source: requirement.source } : MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED);
  }
  onManagedSettingsSourceChanged() {
    if (this.initialized) {
      void this.updateDefaultAccount();
    }
  }
  async initializeManagedSettingsSources() {
    let nativeMdm = this.nativeManagedSettingsService.managedSettings;
    try {
      nativeMdm = await this.nativeManagedSettingsService.initialize();
    } catch (error) {
      this.logService.warn("[DefaultAccount] Failed to initialize native managed settings before resolving forceRemoteSettingsRefresh; using available values", getErrorMessage(error));
    }
    let file = this.fileManagedSettingsService.managedSettings;
    try {
      file = await this.fileManagedSettingsService.initialize();
    } catch (error) {
      this.logService.warn("[DefaultAccount] Failed to initialize file managed settings before resolving forceRemoteSettingsRefresh; using available values", getErrorMessage(error));
    }
    return { nativeMdm, file };
  }
  blockManagedSettingsFreshnessWithoutToken(requirement) {
    if (requirement.effective) {
      this.setManagedSettingsFreshness({
        state: "blocked" /* Blocked */,
        source: requirement.source,
        failure: "noToken" /* NoToken */
      });
    }
  }
  getCachedServerManagedSettings(authenticationProvider) {
    return this.getScopedServerManagedSettings(this._policyData ?? void 0, authenticationProvider, this._policyData?.accountId);
  }
  getScopedServerManagedSettings(accountPolicyData, authenticationProvider, accountId) {
    if (!accountPolicyData || accountPolicyData.accountId !== accountId) {
      return void 0;
    }
    const scope = accountPolicyData.managedSettingsScope;
    const managedSettingsUrl = this.getManagedSettingsUrl();
    if (scope && (scope.accountId !== accountId || scope.authenticationProviderId !== authenticationProvider.id || (managedSettingsUrl ? scope.endpointOrigin !== this.createManagedSettingsFreshnessScope(scope.accountId, authenticationProvider.id, managedSettingsUrl).endpointOrigin : false))) {
      return void 0;
    }
    return accountPolicyData.policyData.managedSettings;
  }
  setCopilotTokenInfo(copilotTokenInfo) {
    if (equals4(this._copilotTokenInfo, copilotTokenInfo)) {
      return;
    }
    this._copilotTokenInfo = copilotTokenInfo;
    this._onDidChangeCopilotTokenInfo.fire(this._copilotTokenInfo);
  }
  cachePolicyData(accountPolicyData) {
    if (accountPolicyData) {
      this.logService.debug("[DefaultAccount] Caching policy data for account:", accountPolicyData.accountId);
      const cachedAccountData = {
        accountPolicyData,
        copilotTokenInfo: this._copilotTokenInfo ?? void 0
      };
      this.storageService.store(CACHED_POLICY_DATA_KEY, JSON.stringify(cachedAccountData), -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.logService.debug("[DefaultAccount] Removing cached policy data");
      this.storageService.remove(CACHED_POLICY_DATA_KEY, -1 /* APPLICATION */);
    }
  }
  scheduleAccountDataPoll() {
    if (!this._defaultAccount) {
      return;
    }
    this.accountDataPollScheduler.schedule(ACCOUNT_DATA_POLL_INTERVAL_MS);
  }
  extractFromToken(token) {
    const result = /* @__PURE__ */ new Map();
    const firstPart = token?.split(":")[0];
    const fields = firstPart?.split(";");
    for (const field of fields) {
      const [key3, value2] = field.split("=");
      result.set(key3, value2);
    }
    this.logService.debug(`[DefaultAccount] extractFromToken: ${JSON.stringify(Object.fromEntries(result))}`);
    return result;
  }
  async getDefaultAccountForAuthenticationProvider(authenticationProvider, managedSettingsSources, refreshRequirement, options3) {
    try {
      this.logService.debug("[DefaultAccount] Getting Default Account from authenticated sessions for provider:", authenticationProvider.id);
      const sessions = await this.findMatchingProviderSession(authenticationProvider.id, this.defaultAccountConfig.authenticationProvider.scopes);
      if (!sessions?.length) {
        this.logService.debug("[DefaultAccount] No matching session found for provider:", authenticationProvider.id);
        this.blockManagedSettingsFreshnessWithoutToken(refreshRequirement);
        return null;
      }
      return this.getDefaultAccountFromAuthenticatedSessions(authenticationProvider, sessions, options3, managedSettingsSources);
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to get default account for provider:", authenticationProvider.id, getErrorMessage(error));
      this.blockManagedSettingsFreshnessWithoutToken(refreshRequirement);
      return null;
    }
  }
  async getDefaultAccountFromAuthenticatedSessions(authenticationProvider, sessions, options3, managedSettingsSources) {
    try {
      const accountId = sessions[0].account.id;
      const accountPolicyData = this._policyData?.accountId === accountId ? this._policyData : void 0;
      const sources = managedSettingsSources ?? await this.initializeManagedSettingsSources();
      const requirement = resolveForceRemoteSettingsRefresh(
        sources.nativeMdm,
        this.getScopedServerManagedSettings(accountPolicyData, authenticationProvider, accountId),
        sources.file
      );
      const managedSettingsUrl = this.getManagedSettingsUrl();
      const scope = managedSettingsUrl ? this.createManagedSettingsFreshnessScope(accountId, authenticationProvider.id, managedSettingsUrl) : void 0;
      if (!requirement.effective) {
        this.setManagedSettingsFreshness(MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED);
      } else if ((!scope || !isManagedSettingsFreshnessSatisfiedFor(this._managedSettingsFreshness, scope) || options3?.forceRefresh) && this.canRequestManagedSettings(options3, scope)) {
        this.setManagedSettingsFreshness({
          state: "pending" /* Pending */,
          source: requirement.source,
          scope
        });
      }
      const entitlementsResult = await this.getEntitlements(sessions, accountPolicyData, options3);
      const entitlementsData = entitlementsResult?.data;
      const entitlementsFetchedAt = entitlementsResult?.fetchedAt;
      const [tokenEntitlementsResult, managedSettingsResult] = await Promise.all([
        entitlementsData?.chat_enabled ? this.getTokenEntitlements(sessions, accountPolicyData, options3) : void 0,
        entitlementsData?.chat_enabled || requirement.effective ? this.getManagedSettings(sessions, accountPolicyData, options3, authenticationProvider, sources, requirement) : void 0
      ]);
      const tokenEntitlementsFetchedAt = tokenEntitlementsResult?.fetchedAt;
      const managedSettingsFetchedAt = managedSettingsResult?.fetchedAt;
      const managedSettingsScope = managedSettingsResult?.scope ?? accountPolicyData?.managedSettingsScope;
      const managedSettingsCompatibilityError = managedSettingsResult ? managedSettingsResult.compatibilityError : this._managedSettingsCompatibilityError;
      let mcpRegistryDataFetchedAt;
      let policyData = accountPolicyData?.policyData ? { ...accountPolicyData.policyData } : void 0;
      if (entitlementsData) {
        policyData = policyData ?? {};
        policyData.cloud_session_storage_enabled = entitlementsData.cloud_session_storage_enabled;
      }
      if (tokenEntitlementsResult?.data) {
        const tokenEntitlementsData = tokenEntitlementsResult.data;
        policyData = policyData ?? {};
        policyData.chat_agent_enabled = tokenEntitlementsData.policyData.chat_agent_enabled;
        policyData.chat_preview_features_enabled = tokenEntitlementsData.policyData.chat_preview_features_enabled;
        policyData.mcp = tokenEntitlementsData.policyData.mcp;
        if (policyData.mcp) {
          const mcpRegistryResult = await this.getMcpRegistryProvider(sessions, accountPolicyData, options3);
          mcpRegistryDataFetchedAt = mcpRegistryResult?.fetchedAt;
          policyData.mcpRegistryUrl = mcpRegistryResult?.data?.url;
          policyData.mcpAccess = mcpRegistryResult?.data?.registry_access;
        } else {
          policyData.mcpRegistryUrl = void 0;
          policyData.mcpAccess = void 0;
        }
      }
      if (managedSettingsResult?.data) {
        policyData = { ...policyData ?? {}, ...managedSettingsResult.data };
      }
      const defaultAccount = {
        authenticationProvider,
        accountName: sessions[0].account.label,
        sessionId: sessions[0].id,
        enterprise: authenticationProvider.enterprise || sessions[0].account.label.includes("_"),
        entitlementsData
      };
      this.logService.debug("[DefaultAccount] Successfully created default account for provider:", authenticationProvider.id);
      const accountPolicyResult = policyData || entitlementsFetchedAt ? {
        accountId,
        policyData: policyData ?? {},
        entitlementsFetchedAt,
        tokenEntitlementsFetchedAt,
        mcpRegistryDataFetchedAt,
        managedSettingsFetchedAt,
        managedSettingsScope,
        managedSettingsCompatibilityError: managedSettingsCompatibilityError ?? void 0
      } : null;
      return {
        defaultAccount,
        accountId,
        policyData: accountPolicyResult,
        copilotTokenInfo: tokenEntitlementsResult?.data?.copilotTokenInfo ?? null
      };
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to create default account for provider:", authenticationProvider.id, getErrorMessage(error));
      this.blockPendingManagedSettingsFreshness();
      return null;
    }
  }
  async findMatchingProviderSession(authProviderId, allScopes) {
    const sessions = await this.getSessions(authProviderId);
    const matchingSessions = sessions.filter((session) => {
      this.logService.debug("[DefaultAccount] Checking session with scopes", session.scopes);
      return allScopes.some((scopes) => this.scopesMatch(session.scopes, scopes));
    });
    return matchingSessions.length > 0 ? matchingSessions : void 0;
  }
  async getSessions(authProviderId) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let preferredAccount;
        let preferredAccountName;
        for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
          preferredAccountName = this.authenticationExtensionsService.getAccountPreference(preferredExtension, authProviderId);
          if (preferredAccountName) {
            break;
          }
        }
        for (const account of await this.authenticationService.getAccounts(authProviderId)) {
          if (account.label === preferredAccountName) {
            preferredAccount = account;
            break;
          }
        }
        return await this.authenticationService.getSessions(authProviderId, void 0, { account: preferredAccount }, true);
      } catch (error) {
        this.logService.warn(`[DefaultAccount] Attempt ${attempt} to get sessions failed:`, getErrorMessage(error));
        if (attempt === 3) {
          throw error;
        }
        await timeout(500);
      }
    }
    throw new Error("Unable to get sessions after multiple attempts");
  }
  scopesMatch(scopes, expectedScopes) {
    return expectedScopes.every((scope) => scopes.includes(scope));
  }
  async getTokenEntitlements(sessions, accountPolicyData, options3) {
    if (!options3?.forceRefresh && accountPolicyData?.tokenEntitlementsFetchedAt && !this.isDataStale(accountPolicyData.tokenEntitlementsFetchedAt)) {
      this.logService.debug("[DefaultAccount] Using last fetched token entitlements data");
      return { data: { policyData: accountPolicyData.policyData, copilotTokenInfo: this._copilotTokenInfo ?? {} }, fetchedAt: accountPolicyData.tokenEntitlementsFetchedAt };
    }
    const data = await this.requestTokenEntitlements(sessions);
    return { data, fetchedAt: Date.now() };
  }
  async requestTokenEntitlements(sessions) {
    const tokenEntitlementsUrl = this.getTokenEntitlementUrl();
    if (!tokenEntitlementsUrl) {
      this.logService.debug("[DefaultAccount] No token entitlements URL found");
      return void 0;
    }
    this.logService.debug("[DefaultAccount] Fetching token entitlements from:", tokenEntitlementsUrl);
    const response = await this.request(tokenEntitlementsUrl, "GET", void 0, sessions, CancellationToken.None, "defaultAccount.tokenEntitlements");
    if (!response) {
      return void 0;
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching token entitlements`);
      return void 0;
    }
    try {
      const chatData = await asJson(response);
      if (chatData) {
        const tokenMap = this.extractFromToken(chatData.token);
        return {
          policyData: {
            // Editor preview features are disabled if the flag is present and set to 0
            chat_preview_features_enabled: tokenMap.get("editor_preview_features") !== "0",
            chat_agent_enabled: tokenMap.get("agent_mode") !== "0",
            // MCP is only enabled if the flag is explicitly present and set to 1
            mcp: tokenMap.get("mcp") === "1"
          },
          copilotTokenInfo: {
            sn: tokenMap.get("sn"),
            fcv1: tokenMap.get("fcv1")
          }
        };
      }
      this.logService.error("Failed to fetch token entitlements", "No data returned");
    } catch (error) {
      this.logService.error("Failed to fetch token entitlements", getErrorMessage(error));
    }
    return void 0;
  }
  async getEntitlements(sessions, accountPolicyData, options3) {
    const accountId = sessions[0].account.id;
    const existingData = this._defaultAccount?.accountId === accountId ? this._defaultAccount?.defaultAccount.entitlementsData : void 0;
    if (!options3?.forceRefresh && !options3?.refreshEntitlements && existingData && accountPolicyData?.entitlementsFetchedAt && !this.isDataStale(accountPolicyData.entitlementsFetchedAt)) {
      this.logService.debug("[DefaultAccount] Using last fetched entitlements data");
      return { data: existingData, fetchedAt: accountPolicyData.entitlementsFetchedAt };
    }
    const entitlementUrl = this.getEntitlementUrl();
    if (!entitlementUrl) {
      this.logService.debug("[DefaultAccount] No chat entitlements URL found");
      return { data: void 0, fetchedAt: void 0 };
    }
    this.logService.debug("[DefaultAccount] Fetching entitlements from:", entitlementUrl);
    const response = await this.request(entitlementUrl, "GET", void 0, sessions, CancellationToken.None, "defaultAccount.entitlements");
    if (!response) {
      return { data: void 0, fetchedAt: Date.now() };
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      this.logService.trace(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching entitlements`);
      const data = response.res.statusCode === 401 || // oauth token being unavailable (expired/revoked)
      response.res.statusCode === 404 ? null : void 0;
      return { data, fetchedAt: Date.now() };
    }
    try {
      const data = await asJson(response);
      if (data) {
        return { data, fetchedAt: Date.now() };
      }
      this.logService.error("[DefaultAccount] Failed to fetch entitlements", "No data returned");
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to fetch entitlements", getErrorMessage(error));
    }
    return { data: void 0, fetchedAt: Date.now() };
  }
  async getMcpRegistryProvider(sessions, accountPolicyData, options3) {
    if (!options3?.forceRefresh && accountPolicyData?.mcpRegistryDataFetchedAt && !this.isDataStale(accountPolicyData.mcpRegistryDataFetchedAt)) {
      this.logService.debug("[DefaultAccount] Using last fetched MCP registry data");
      const data2 = accountPolicyData.policyData.mcpRegistryUrl && accountPolicyData.policyData.mcpAccess ? { url: accountPolicyData.policyData.mcpRegistryUrl, registry_access: accountPolicyData.policyData.mcpAccess } : null;
      return { data: data2, fetchedAt: accountPolicyData.mcpRegistryDataFetchedAt };
    }
    const data = await this.requestMcpRegistryProvider(sessions);
    return !isUndefined(data) ? { data, fetchedAt: Date.now() } : void 0;
  }
  async requestMcpRegistryProvider(sessions) {
    const mcpRegistryDataUrl = this.getMcpRegistryDataUrl();
    if (!mcpRegistryDataUrl) {
      this.logService.debug("[DefaultAccount] No MCP registry data URL found");
      return null;
    }
    this.logService.debug("[DefaultAccount] Fetching MCP registry data from:", mcpRegistryDataUrl);
    const response = await this.request(mcpRegistryDataUrl, "GET", void 0, sessions, CancellationToken.None, "defaultAccount.mcpRegistryProvider");
    if (!response) {
      return void 0;
    }
    if (!isSuccess(response)) {
      if (isClientError(response)) {
        this.logService.debug(`[DefaultAccount] Received ${response.res.statusCode} for MCP registry data, treating as no registry available.`);
        return null;
      }
      this.logService.debug(`[DefaultAccount] unexpected status code ${response.res.statusCode} while fetching MCP registry data`);
      return void 0;
    }
    try {
      const data = await asJson(response);
      if (data) {
        this.logService.debug("Fetched MCP registry providers", data.mcp_registries);
        return data.mcp_registries[0] ?? null;
      }
      this.logService.debug("No MCP registry providers content found in response");
      return null;
    } catch (error) {
      this.logService.error("Failed to fetch MCP registry providers", getErrorMessage(error));
      return void 0;
    }
  }
  async getManagedSettings(sessions, accountPolicyData, options3, authenticationProvider = this.getDefaultAccountAuthenticationProvider(), managedSettingsSources, refreshRequirement) {
    const accountId = sessions[0].account.id;
    const sources = managedSettingsSources ?? await this.initializeManagedSettingsSources();
    const requirement = refreshRequirement ?? resolveForceRemoteSettingsRefresh(
      sources.nativeMdm,
      this.getScopedServerManagedSettings(accountPolicyData, authenticationProvider, accountId),
      sources.file
    );
    const cachedManagedSettings = accountPolicyData?.managedSettingsFetchedAt !== void 0 && !this.isDataStale(accountPolicyData.managedSettingsFetchedAt) ? {
      data: {
        managedSettings: accountPolicyData.policyData.managedSettings
      },
      fetchedAt: accountPolicyData.managedSettingsFetchedAt
    } : void 0;
    const managedSettingsUrl = this.getManagedSettingsUrl();
    if (!managedSettingsUrl) {
      this.logService.debug("[DefaultAccount] No managed settings URL configured; skipping enterprise policy fetch");
      this._managedSettingsFetchStatus = "no-url";
      if (requirement.effective) {
        this.setManagedSettingsFreshness({
          state: "blocked" /* Blocked */,
          source: requirement.source,
          failure: "noUrl" /* NoUrl */
        });
      }
      const retained = requirement.effective ? { data: { managedSettings: accountPolicyData?.policyData.managedSettings }, fetchedAt: accountPolicyData?.managedSettingsFetchedAt } : cachedManagedSettings;
      return {
        data: retained?.data,
        fetchedAt: retained?.fetchedAt,
        scope: accountPolicyData?.managedSettingsScope,
        compatibilityError: this._managedSettingsCompatibilityError
      };
    }
    const scope = this.createManagedSettingsFreshnessScope(accountId, authenticationProvider.id, managedSettingsUrl);
    const cachedScope = accountPolicyData?.managedSettingsScope;
    const cacheScopeMatches = !cachedScope || this.getManagedSettingsScopeKey(cachedScope) === this.getManagedSettingsScopeKey(scope);
    const scopedManagedSettings = cacheScopeMatches ? accountPolicyData?.policyData.managedSettings : void 0;
    const scopedManagedSettingsFetchedAt = cacheScopeMatches ? accountPolicyData?.managedSettingsFetchedAt : void 0;
    const scopedCachedManagedSettings = cacheScopeMatches ? cachedManagedSettings : void 0;
    if (requirement.effective && !this.canRequestManagedSettings(options3, scope)) {
      this.logService.debug("[DefaultAccount] Skipping automatic managed settings retry after a prior failure");
      const failedFreshness = this.failedManagedSettingsFreshness.get(this.getManagedSettingsScopeKey(scope));
      if (failedFreshness) {
        this.setManagedSettingsFreshness({ ...failedFreshness, source: requirement.source });
      }
      return {
        data: { managedSettings: scopedManagedSettings },
        fetchedAt: scopedManagedSettingsFetchedAt,
        scope,
        compatibilityError: this._managedSettingsCompatibilityError
      };
    }
    const freshnessSatisfied = requirement.effective && isManagedSettingsFreshnessSatisfiedFor(this._managedSettingsFreshness, scope);
    if (!options3?.forceRefresh && !options3?.retryManagedSettings && scopedCachedManagedSettings && (!requirement.effective || freshnessSatisfied) && !this._managedSettingsCompatibilityError) {
      this.logService.debug("[DefaultAccount] Using last fetched managed settings data");
      return { ...scopedCachedManagedSettings, scope, compatibilityError: this._managedSettingsCompatibilityError };
    }
    const lastAttemptAt = Date.now();
    if (requirement.effective) {
      this.setManagedSettingsFreshness({
        state: "pending" /* Pending */,
        source: requirement.source,
        scope,
        lastAttemptAt
      });
    }
    const sharedBackoffActive = Date.now() < this._rateLimitBackoffUntil;
    const result = await this.requestManagedSettings(requirement.effective ? [sessions[0]] : sessions, managedSettingsUrl);
    if (requirement.effective && !sharedBackoffActive) {
      this.updateFailedManagedSettingsFreshness(scope, requirement.source, result, lastAttemptAt);
    }
    switch (result.kind) {
      case "success": {
        const fetchedAt = Date.now();
        this.resolveManagedSettingsFreshnessAfterSuccess(result.data.managedSettings, scope, lastAttemptAt, fetchedAt);
        return { data: result.data, fetchedAt, scope, compatibilityError: null };
      }
      case "noSettings": {
        const fetchedAt = Date.now();
        this.resolveManagedSettingsFreshnessAfterSuccess(void 0, scope, lastAttemptAt, fetchedAt);
        return { data: { managedSettings: void 0 }, fetchedAt, scope, compatibilityError: null };
      }
      case "updateRequired":
        if (requirement.effective) {
          this.setManagedSettingsFreshness({
            state: "blocked" /* Blocked */,
            source: requirement.source,
            scope,
            lastAttemptAt,
            failure: "updateRequired" /* UpdateRequired */
          });
        }
        return {
          data: requirement.effective ? { managedSettings: scopedManagedSettings } : { managedSettings: void 0 },
          fetchedAt: requirement.effective ? scopedManagedSettingsFetchedAt : Date.now(),
          scope,
          compatibilityError: result.error
        };
      case "network":
      case "rateLimited":
      case "httpError":
      case "malformed": {
        if (requirement.effective) {
          this.setManagedSettingsFreshness(this.toBlockedManagedSettingsFreshness(requirement.source, result, lastAttemptAt, scope));
          return {
            data: { managedSettings: scopedManagedSettings },
            fetchedAt: scopedManagedSettingsFetchedAt,
            scope,
            compatibilityError: this._managedSettingsCompatibilityError
          };
        }
        const retained = this._managedSettingsCompatibilityError ? void 0 : scopedCachedManagedSettings;
        return {
          data: { managedSettings: retained?.data.managedSettings },
          fetchedAt: retained?.fetchedAt,
          scope,
          compatibilityError: this._managedSettingsCompatibilityError
        };
      }
    }
  }
  createManagedSettingsFreshnessScope(accountId, authenticationProviderId, managedSettingsUrl) {
    let endpointOrigin = managedSettingsUrl;
    try {
      endpointOrigin = new URL(managedSettingsUrl).origin;
    } catch {
    }
    return {
      accountId,
      authenticationProviderId,
      endpointOrigin
    };
  }
  resolveManagedSettingsFreshnessAfterSuccess(server, scope, lastAttemptAt, satisfiedAt) {
    const freshRequirement = resolveForceRemoteSettingsRefresh(
      this.nativeManagedSettingsService.managedSettings,
      server,
      this.fileManagedSettingsService.managedSettings
    );
    this.setManagedSettingsFreshness(freshRequirement.effective ? {
      state: "satisfied" /* Satisfied */,
      source: freshRequirement.source,
      scope,
      lastAttemptAt,
      satisfiedAt
    } : MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED);
  }
  toBlockedManagedSettingsFreshness(source, result, lastAttemptAt, scope) {
    switch (result.kind) {
      case "network":
        return { state: "blocked" /* Blocked */, source, scope, lastAttemptAt, failure: "network" /* Network */ };
      case "rateLimited":
        return { state: "blocked" /* Blocked */, source, scope, lastAttemptAt, failure: "rateLimited" /* RateLimited */ };
      case "httpError":
        return { state: "blocked" /* Blocked */, source, scope, lastAttemptAt, failure: "httpError" /* HttpError */, httpStatus: result.status };
      case "malformed":
        return { state: "blocked" /* Blocked */, source, scope, lastAttemptAt, failure: "malformed" /* Malformed */ };
    }
  }
  async requestManagedSettings(sessions, managedSettingsUrl) {
    const requestUrl = appendManagedSettingsClientIdentity(managedSettingsUrl, this.productService);
    this.logService.debug("[DefaultAccount] Fetching managed settings from:", requestUrl);
    const rateLimitBackoffActive = Date.now() < this._rateLimitBackoffUntil;
    const response = await this.request(requestUrl, "GET", void 0, sessions, CancellationToken.None, "defaultAccount.managedSettings", {
      requestTimeoutMs: MANAGED_SETTINGS_REQUEST_TIMEOUT_MS,
      retryNotFound: false
    });
    if (!response) {
      this.logService.debug("[DefaultAccount] Managed settings fetch returned no response (network error, all selected sessions rejected, or active rate-limit backoff); falling back to local-only policy");
      this.reportManagedSettingsOutcome("no-response", rateLimitBackoffActive);
      return rateLimitBackoffActive ? { kind: "rateLimited" } : { kind: "network" };
    }
    const status2 = response.res.statusCode ?? 0;
    if (status2 === 404) {
      this.reportManagedSettingsOutcome(status2, rateLimitBackoffActive);
      return { kind: "noSettings" };
    }
    if (status2 === 466) {
      const error = await this.readManagedSettingsCompatibilityError(response);
      this.setManagedSettingsCompatibilityError(error);
      this.reportManagedSettingsOutcome(status2, rateLimitBackoffActive);
      return { kind: "updateRequired", error };
    }
    if (this.isRateLimited(response)) {
      this.reportManagedSettingsOutcome(status2, rateLimitBackoffActive);
      return { kind: "rateLimited" };
    }
    if (!isSuccess(response)) {
      this.logService.warn(`[DefaultAccount] Managed settings fetch returned non-success status ${status2}; falling back to local-only policy`);
      this.reportManagedSettingsOutcome(status2, rateLimitBackoffActive);
      return { kind: "httpError", status: status2 };
    }
    try {
      const data = await asJson(response);
      this.logService.trace("[DefaultAccount] Managed settings raw response:", JSON.stringify(data ?? null));
      this._managedSettingsRawResponse = data ?? null;
      const adapted = adaptManagedSettings(data ?? {}, (msg) => this.logService.warn(msg));
      const managedSettingsCount = adapted.managedSettings ? Object.keys(adapted.managedSettings).length : 0;
      if (managedSettingsCount === 0) {
        this.logService.debug("[DefaultAccount] Managed settings fetched (empty response \u2014 no enterprise policy file present)");
      } else {
        this.logService.info("[DefaultAccount] Managed settings applied");
        this.logService.trace("[DefaultAccount] Managed settings payload:", JSON.stringify(adapted));
      }
      this.reportManagedSettingsOutcome("ok", rateLimitBackoffActive);
      return { kind: "success", data: adapted };
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to parse managed settings response", getErrorMessage(error));
      this.reportManagedSettingsOutcome("parse-error", rateLimitBackoffActive);
      return { kind: "malformed" };
    }
  }
  canRequestManagedSettings(options3, scope) {
    return options3?.retryManagedSettings === true || scope === void 0 || !this.failedManagedSettingsFreshness.has(this.getManagedSettingsScopeKey(scope));
  }
  updateFailedManagedSettingsFreshness(scope, source, result, lastAttemptAt) {
    const scopeKey = this.getManagedSettingsScopeKey(scope);
    switch (result.kind) {
      case "success":
      case "noSettings":
        this.failedManagedSettingsFreshness.delete(scopeKey);
        break;
      case "updateRequired": {
        this.failedManagedSettingsFreshness.set(scopeKey, {
          state: "blocked" /* Blocked */,
          source,
          scope,
          lastAttemptAt,
          failure: "updateRequired" /* UpdateRequired */
        });
        break;
      }
      case "network":
      case "rateLimited":
      case "httpError":
      case "malformed": {
        this.failedManagedSettingsFreshness.set(scopeKey, this.toBlockedManagedSettingsFreshness(source, result, lastAttemptAt, scope));
        break;
      }
    }
  }
  getManagedSettingsScopeKey(scope) {
    return `${scope.authenticationProviderId}
${scope.accountId}
${scope.endpointOrigin}`;
  }
  async readManagedSettingsCompatibilityError(response) {
    try {
      const text2 = await asText(response);
      const body = text2 ? JSON.parse(text2) : void 0;
      const parsed = parseManagedSettingsCompatibilityError(body);
      if (parsed) {
        return parsed;
      }
      this.logService.error("[DefaultAccount] Managed settings compatibility response did not contain the expected error code");
    } catch (error) {
      this.logService.error("[DefaultAccount] Failed to parse managed settings compatibility response", getErrorMessage(error));
    }
    return { errorCode: MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE };
  }
  reportManagedSettingsOutcome(status2, rateLimitBackoffActive) {
    this._managedSettingsFetchStatus = status2;
    this.telemetryService.publicLog2("defaultaccount:managedSettings:fetch", {
      outcome: typeof status2 === "number" ? `status:${status2}` : status2,
      rateLimitBackoffActive
    });
  }
  /**
   * Detects a rate-limited GitHub response. Mirrors the public-API check in
   * `githubRepoFetcher.ts`:
   * - Canonical `429 Too Many Requests`.
   * - Primary quota exhaustion: `403` with `X-RateLimit-Remaining: 0`.
   * - Secondary throttling: GitHub omits `X-RateLimit-Remaining` but sets
   *   `Retry-After` (on a non-2xx response). We treat any non-success status
   *   that carries `Retry-After` as a back-off signal.
   */
  isRateLimited(response) {
    const status2 = response.res.statusCode;
    if (status2 === 429) {
      return true;
    }
    if (status2 === 403 && readHeader(response.res.headers, "x-ratelimit-remaining") === "0") {
      return true;
    }
    if (!isSuccess(response) && readHeader(response.res.headers, "retry-after") !== void 0) {
      return true;
    }
    return false;
  }
  async request(url, type, body, sessions, token, callSite, options3) {
    if (Date.now() < this._rateLimitBackoffUntil) {
      const remainingSec = Math.ceil((this._rateLimitBackoffUntil - Date.now()) / 1e3);
      this.logService.debug(`[DefaultAccount] Skipping request to ${url} \u2014 rate-limit backoff active for ${remainingSec}s more`);
      return void 0;
    }
    let lastResponse;
    for (const session of sessions) {
      if (token.isCancellationRequested) {
        return lastResponse;
      }
      try {
        const response = await this.requestService.request({
          type,
          url,
          data: type === "POST" ? JSON.stringify(body) : void 0,
          disableCache: true,
          timeout: options3?.requestTimeoutMs,
          headers: {
            "Authorization": `Bearer ${session.accessToken}`
          },
          callSite
        }, token);
        const status2 = response.res.statusCode;
        if (this.isRateLimited(response)) {
          const retryAfterSec = retryAfterFromHeaders(response.res.headers) ?? 60;
          this._rateLimitBackoffUntil = Date.now() + retryAfterSec * 1e3;
          this.logService.warn(`[DefaultAccount] Rate limited by ${url} (status ${status2}); backing off for ${retryAfterSec}s`);
          return response;
        }
        if (status2 === 401 || status2 === 404 && options3?.retryNotFound !== false) {
          this.logService.debug(`[DefaultAccount] Received ${status2} for URL ${url} with session ${session.id}, likely due to expired/revoked token or insufficient permissions.`, "Trying next session if available.");
          lastResponse = response;
          continue;
        }
        return response;
      } catch (error) {
        if (!token.isCancellationRequested) {
          this.logService.error(`[DefaultAccount] request: error ${error}`, url);
        }
      }
    }
    if (!lastResponse) {
      this.logService.trace("[DefaultAccount]: No response received for request", url);
      return void 0;
    }
    return lastResponse;
  }
  isDataStale(fetchedAt) {
    return Date.now() - fetchedAt >= ACCOUNT_DATA_POLL_INTERVAL_MS;
  }
  getEntitlementUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot_internal/user`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.entitlementUrl;
  }
  getTokenEntitlementUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot_internal/v2/token`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.tokenEntitlementUrl;
  }
  getMcpRegistryDataUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot/mcp_registry`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.mcpRegistryDataUrl;
  }
  getManagedSettingsUrl() {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (!enterpriseUrl) {
          return void 0;
        }
        return `${enterpriseUrl.protocol}//api.${enterpriseUrl.hostname}${enterpriseUrl.port ? ":" + enterpriseUrl.port : ""}/copilot_internal/managed_settings`;
      } catch (error) {
        this.logService.error(error);
      }
    }
    return this.defaultAccountConfig.managedSettingsUrl;
  }
  getDefaultAccountAuthenticationProvider() {
    if (this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderConfig) === this.defaultAccountConfig.authenticationProvider.enterprise.id) {
      return {
        ...this.defaultAccountConfig.authenticationProvider.enterprise,
        enterprise: true
      };
    }
    return {
      ...this.defaultAccountConfig.authenticationProvider.default,
      enterprise: false
    };
  }
  resolveGitHubUrl(path) {
    if (this.getDefaultAccountAuthenticationProvider().enterprise) {
      try {
        const enterpriseUrl = this.getEnterpriseUrl();
        if (enterpriseUrl) {
          return `${enterpriseUrl.protocol}//${enterpriseUrl.host}/${path}`;
        }
      } catch {
      }
    }
    return `https://github.com/${path}`;
  }
  getEnterpriseUrl() {
    const value2 = this.configurationService.getValue(this.defaultAccountConfig.authenticationProvider.enterpriseProviderUriSetting);
    if (!isString(value2)) {
      return void 0;
    }
    return new URL(value2);
  }
  async signIn(options3) {
    const authProvider = this.getDefaultAccountAuthenticationProvider();
    if (!authProvider) {
      throw new Error("No default account provider configured");
    }
    const { additionalScopes, ...sessionOptions } = options3 ?? {};
    const defaultAccountScopes = this.defaultAccountConfig.authenticationProvider.scopes[0];
    const scopes = additionalScopes ? distinct([...defaultAccountScopes, ...additionalScopes]) : defaultAccountScopes;
    const session = await this.authenticationService.createSession(authProvider.id, scopes, sessionOptions);
    for (const preferredExtension of this.defaultAccountConfig.preferredExtensions) {
      this.authenticationExtensionsService.updateAccountPreference(preferredExtension, authProvider.id, session.account);
    }
    await this.updateDefaultAccount();
    return this.defaultAccount;
  }
  async signOut() {
    if (!this.defaultAccount) {
      return;
    }
    await this.commandService.executeCommand("_signOutOfAccount", { providerId: this.defaultAccount.authenticationProvider.id, accountLabel: this.defaultAccount.accountName });
  }
};

DefaultAccountProvider = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IAuthenticationExtensionsService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IRequestService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IContextKeyService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IHostService),
  __decorateParam(13, ICommandService),
  __decorateParam(14, INativeManagedSettingsService),
  __decorateParam(15, IFileManagedSettingsService)
], DefaultAccountProvider);

var DefaultAccountProviderContribution = class extends Disposable {
  static {
    this.ID = "workbench.contributions.defaultAccountProvider";
  }
  constructor(productService, instantiationService, defaultAccountService) {
    super();
    if (!productService.defaultChatAgent) {
      return;
    }
    const defaultAccountProvider = this._register(instantiationService.createInstance(DefaultAccountProvider, toDefaultAccountConfig(productService.defaultChatAgent)));
    defaultAccountService.setDefaultAccountProvider(defaultAccountProvider);
  }
};

DefaultAccountProviderContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IDefaultAccountService)
], DefaultAccountProviderContribution);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DEFAULT_ACCOUNT_SIGN_IN_COMMAND,
      title: localize2(22569, "Sign In")
    });
  }
  async run(accessor) {
    const defaultAccountService = accessor.get(IDefaultAccountService);
    await defaultAccountService.signIn();
  }
});

registerWorkbenchContribution2(DefaultAccountProviderContribution.ID, DefaultAccountProviderContribution, WorkbenchPhase.BlockStartup);
export { toDefaultAccountConfig, DEFAULT_ACCOUNT_SIGN_IN_COMMAND, CONTEXT_DEFAULT_ACCOUNT_STATE, CACHED_POLICY_DATA_KEY, ACCOUNT_DATA_POLL_INTERVAL_MS, MANAGED_SETTINGS_REQUEST_TIMEOUT_MS, DefaultAccountService, DefaultAccountProvider, DefaultAccountProviderContribution };
