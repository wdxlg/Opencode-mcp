// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/chat/common/chatEntitlementService.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { isWeb } from "./module-0014.mjs";
import { Lazy } from "./module-0028.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IRequestService, asText } from "./module-0947.mjs";
import { severity_default } from "./module-0266.mjs";
import { URI } from "./module-0032.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { isInternalAccount } from "./module-0953.mjs";
import { Barrier } from "./module-0036.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/chat/common/chatEntitlementService.ts
var ChatEntitlementContextKeys;

((ChatEntitlementContextKeys2) => {
  ChatEntitlementContextKeys2.Setup = {
    hidden: new RawContextKey("chatSetupHidden", false, true),
    // True when chat setup is explicitly hidden.
    installed: new RawContextKey("chatSetupInstalled", false, true),
    // True when the chat extension is installed and enabled.
    disabled: new RawContextKey("chatSetupDisabled", false, true),
    // True when the chat extension is disabled due to any other reason than workspace trust.
    disabledInWorkspace: new RawContextKey("chatSetupDisabledInWorkspace", false, true),
    // True when chat is disabled at the workspace level via settings.
    untrusted: new RawContextKey("chatSetupUntrusted", false, true),
    // True when the chat extension is disabled due to workspace trust.
    later: new RawContextKey("chatSetupLater", false, true),
    // True when the user wants to finish setup later.
    registered: new RawContextKey("chatSetupRegistered", false, true),
    // True when the user has registered as Free or Pro user.
    completed: new RawContextKey("chatSetupCompleted", false, true)
    // True when the user has completed the setup flow, regardless of the outcome.
  };
  ChatEntitlementContextKeys2.Entitlement = {
    signedOut: new RawContextKey("chatEntitlementSignedOut", false, true),
    // True when user is signed out.
    canSignUp: new RawContextKey("chatPlanCanSignUp", false, true),
    // True when user can sign up to be a chat free user.
    planFree: new RawContextKey("chatPlanFree", false, true),
    // True when user is a chat free user.
    planPro: new RawContextKey("chatPlanPro", false, true),
    // True when user is a chat pro user.
    planEdu: new RawContextKey("chatPlanEdu", false, true),
    // True when user is a chat edu user.
    planProPlus: new RawContextKey("chatPlanProPlus", false, true),
    // True when user is a chat pro plus user.
    planMax: new RawContextKey("chatPlanMax", false, true),
    // True when user is a chat max user.
    planBusiness: new RawContextKey("chatPlanBusiness", false, true),
    // True when user is a chat business user.
    planEnterprise: new RawContextKey("chatPlanEnterprise", false, true),
    // True when user is a chat enterprise user.
    organisations: new RawContextKey("chatEntitlementOrganisations", void 0, true),
    // The organizations the user belongs to.
    internal: new RawContextKey("chatEntitlementInternal", false, true),
    // True when the user is GitHub/Microsoft staff or belongs to an internal organisation.
    sku: new RawContextKey("chatEntitlementSku", void 0, true)
    // The SKU of the user.
  };
  ChatEntitlementContextKeys2.chatQuotaExceeded = new RawContextKey("chatQuotaExceeded", false, true);
  ChatEntitlementContextKeys2.completionsQuotaExceeded = new RawContextKey("completionsQuotaExceeded", false, true);
  ChatEntitlementContextKeys2.chatAnonymous = new RawContextKey("chatAnonymous", false, true);
  ChatEntitlementContextKeys2.clientByokEnabled = new RawContextKey("github.copilot.clientByokEnabled", true, true);
  ChatEntitlementContextKeys2.hasByokModels = new RawContextKey("github.copilot.hasByokModels", false, true);
})(ChatEntitlementContextKeys || (ChatEntitlementContextKeys = {}));

var IChatEntitlementService = createDecorator("chatEntitlementService");

function chatRequiresSetup(context2) {
  return !context2.completed && !context2.hasByokModels || // Setup not completed (unless BYOK models are available)
  context2.disabled || // Extension disabled: run setup to enable
  context2.untrusted || // Workspace untrusted: run setup to ask for trust
  context2.entitlement === 3 /* Available */ || // Entitlement available: run setup to sign up
  context2.entitlement === 1 /* Unknown */ && // Entitlement unknown: run setup to sign in / sign up
  !context2.anonymous && // unless anonymous access is enabled
  !context2.hasByokModels;
}

function isProUser(chatEntitlement) {
  return chatEntitlement === 10 /* EDU */ || chatEntitlement === 6 /* Pro */ || chatEntitlement === 7 /* ProPlus */ || chatEntitlement === 11 /* Max */ || chatEntitlement === 8 /* Business */ || chatEntitlement === 9 /* Enterprise */;
}

function getChatPlanName(chatEntitlement) {
  switch (chatEntitlement) {
    case 10 /* EDU */:
      return localize(22757, null);
    case 6 /* Pro */:
      return localize(22761, null);
    case 7 /* ProPlus */:
      return localize(22762, null);
    case 11 /* Max */:
      return localize(22760, null);
    case 8 /* Business */:
      return localize(22756, null);
    case 9 /* Enterprise */:
      return localize(22758, null);
    default:
      return localize(22759, null);
  }
}

var defaultChatAgent = {
  upgradePlanUrl: product_default.defaultChatAgent?.upgradePlanUrl ?? "",
  providerUriSetting: product_default.defaultChatAgent?.providerUriSetting ?? "",
  entitlementSignupLimitedUrl: product_default.defaultChatAgent?.entitlementSignupLimitedUrl ?? "",
  chatQuotaExceededContext: product_default.defaultChatAgent?.chatQuotaExceededContext ?? "",
  completionsQuotaExceededContext: product_default.defaultChatAgent?.completionsQuotaExceededContext ?? ""
};

var CHAT_ALLOW_ANONYMOUS_CONFIGURATION_KEY = "chat.allowAnonymousAccess";

function isAnonymous(configurationService, entitlement, sentiment) {
  if (configurationService.getValue(CHAT_ALLOW_ANONYMOUS_CONFIGURATION_KEY) !== true) {
    return false;
  }
  if (entitlement !== 1 /* Unknown */) {
    return false;
  }
  if (sentiment.hidden || sentiment.disabledInWorkspace) {
    return false;
  }
  return true;
}

function logChatEntitlements(state, configurationService, telemetryService) {
  telemetryService.publicLog2("chatEntitlements", {
    chatHidden: Boolean(state.hidden),
    chatDisabled: Boolean(state.disabled),
    chatEntitlement: state.entitlement,
    chatRegistered: Boolean(state.registered),
    chatAnonymous: isAnonymous(configurationService, state.entitlement, state)
  });
}

var ChatEntitlementService = class extends Disposable {
  constructor(instantiationService, productService, environmentService, contextKeyService, configurationService, telemetryService, logService, storageService) {
    super();
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.storageService = storageService;
    //#endregion
    //#region --- Quotas
    this._onDidChangeQuotaExceeded = this._register(new Emitter());
    this.onDidChangeQuotaExceeded = this._onDidChangeQuotaExceeded.event;
    this._onDidChangeQuotaRemaining = this._register(new Emitter());
    this.onDidChangeQuotaRemaining = this._onDidChangeQuotaRemaining.event;
    this._onDidChangeUsageBasedBilling = this._register(new Emitter());
    this.onDidChangeUsageBasedBilling = this._onDidChangeUsageBasedBilling.event;
    this.ExtensionQuotaContextKeys = {
      chatQuotaExceeded: defaultChatAgent.chatQuotaExceededContext,
      completionsQuotaExceeded: defaultChatAgent.completionsQuotaExceededContext
    };
    this._onDidChangeAnonymous = this._register(new Emitter());
    this.onDidChangeAnonymous = this._onDidChangeAnonymous.event;
    this.anonymousObs = observableFromEvent(this.onDidChangeAnonymous, () => this.anonymous);
    const cachedUBB = this.storageService.getBoolean(ChatEntitlementService.CACHED_UBB_STORAGE_KEY, 0 /* PROFILE */);
    this._quotas = cachedUBB !== void 0 ? { usageBasedBilling: cachedUBB } : {};
    this.chatQuotaExceededContextKey = ChatEntitlementContextKeys.chatQuotaExceeded.bindTo(this.contextKeyService);
    this.completionsQuotaExceededContextKey = ChatEntitlementContextKeys.completionsQuotaExceeded.bindTo(this.contextKeyService);
    this.anonymousContextKey = ChatEntitlementContextKeys.chatAnonymous.bindTo(this.contextKeyService);
    this.anonymousContextKey.set(this.anonymous);
    if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.clientByokEnabled.key) === void 0) {
      ChatEntitlementContextKeys.clientByokEnabled.bindTo(this.contextKeyService);
    }
    this.onDidChangeEntitlement = Event2.map(
      Event2.filter(
        this.contextKeyService.onDidChangeContext,
        (e4) => e4.affectsSome(/* @__PURE__ */ new Set([
          ChatEntitlementContextKeys.Entitlement.planEdu.key,
          ChatEntitlementContextKeys.Entitlement.planPro.key,
          ChatEntitlementContextKeys.Entitlement.planBusiness.key,
          ChatEntitlementContextKeys.Entitlement.planEnterprise.key,
          ChatEntitlementContextKeys.Entitlement.planProPlus.key,
          ChatEntitlementContextKeys.Entitlement.planMax.key,
          ChatEntitlementContextKeys.Entitlement.planFree.key,
          ChatEntitlementContextKeys.Entitlement.canSignUp.key,
          ChatEntitlementContextKeys.Entitlement.signedOut.key,
          ChatEntitlementContextKeys.Entitlement.organisations.key,
          ChatEntitlementContextKeys.Entitlement.internal.key,
          ChatEntitlementContextKeys.Entitlement.sku.key
        ])),
        this._store
      ),
      () => {
      },
      this._store
    );
    this.entitlementObs = observableFromEvent(this.onDidChangeEntitlement, () => this.entitlement);
    this.onDidChangeSentiment = Event2.map(
      Event2.filter(
        this.contextKeyService.onDidChangeContext,
        (e4) => e4.affectsSome(/* @__PURE__ */ new Set([
          ChatEntitlementContextKeys.Setup.completed.key,
          ChatEntitlementContextKeys.Setup.hidden.key,
          ChatEntitlementContextKeys.Setup.disabled.key,
          ChatEntitlementContextKeys.Setup.untrusted.key,
          ChatEntitlementContextKeys.Setup.installed.key,
          ChatEntitlementContextKeys.Setup.later.key,
          ChatEntitlementContextKeys.Setup.registered.key
        ])),
        this._store
      ),
      () => {
      },
      this._store
    );
    this.sentimentObs = observableFromEvent(this.onDidChangeSentiment, () => this.sentiment);
    if (isWeb && !environmentService.remoteAuthority && !environmentService.isSessionsWindow) {
      ChatEntitlementContextKeys.Setup.hidden.bindTo(this.contextKeyService).set(true);
      return;
    }
    if (!productService.defaultChatAgent) {
      return;
    }
    const context2 = this.context = new Lazy(() => this._register(instantiationService.createInstance(ChatEntitlementContext)));
    this.requests = new Lazy(() => this._register(instantiationService.createInstance(ChatEntitlementRequests, context2.value, {
      clearQuotas: () => this.clearQuotas(),
      acceptQuotas: (quotas) => this.acceptQuotas(quotas)
    })));
    this.registerListeners();
  }
  static {
    this.CACHED_UBB_STORAGE_KEY = "chat.usageBasedBilling";
  }
  get entitlement() {
    if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planEdu.key) === true) {
      return 10 /* EDU */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planPro.key) === true) {
      return 6 /* Pro */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planBusiness.key) === true) {
      return 8 /* Business */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planEnterprise.key) === true) {
      return 9 /* Enterprise */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planProPlus.key) === true) {
      return 7 /* ProPlus */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planMax.key) === true) {
      return 11 /* Max */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.planFree.key) === true) {
      return 5 /* Free */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.canSignUp.key) === true) {
      return 3 /* Available */;
    } else if (this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.signedOut.key) === true) {
      return 1 /* Unknown */;
    }
    return 2 /* Unresolved */;
  }
  get isInternal() {
    return this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.internal.key) === true;
  }
  get organisations() {
    return this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.organisations.key);
  }
  get sku() {
    return this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Entitlement.sku.key);
  }
  get copilotTrackingId() {
    return this.context?.value.state.copilotTrackingId;
  }
  get clientByokEnabled() {
    return this.contextKeyService.getContextKeyValue("github.copilot.clientByokEnabled") === true;
  }
  get hasByokModels() {
    return this.contextKeyService.getContextKeyValue("github.copilot.hasByokModels") === true;
  }
  get quotas() {
    return this._quotas;
  }
  registerListeners() {
    const quotaExceededSet = /* @__PURE__ */ new Set([this.ExtensionQuotaContextKeys.chatQuotaExceeded, this.ExtensionQuotaContextKeys.completionsQuotaExceeded]);
    const cts = this._register(new MutableDisposable());
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(quotaExceededSet)) {
        if (cts.value) {
          cts.value.cancel();
        }
        cts.value = new CancellationTokenSource();
        this.update(cts.value.token);
      }
    }));
    let anonymousUsage = this.anonymous;
    const updateAnonymousUsage = () => {
      const newAnonymousUsage = this.anonymous;
      if (newAnonymousUsage !== anonymousUsage) {
        anonymousUsage = newAnonymousUsage;
        this.anonymousContextKey.set(newAnonymousUsage);
        if (this.context?.hasValue) {
          logChatEntitlements(this.context.value.state, this.configurationService, this.telemetryService);
        }
        this._onDidChangeAnonymous.fire();
      }
    };
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(CHAT_ALLOW_ANONYMOUS_CONFIGURATION_KEY)) {
        updateAnonymousUsage();
      }
    }));
    this._register(this.onDidChangeEntitlement(() => updateAnonymousUsage()));
    this._register(this.onDidChangeSentiment(() => updateAnonymousUsage()));
  }
  acceptQuotas(incomingQuotas) {
    const oldQuota = this._quotas;
    const cachedQuota = this.quotaCopilotTrackingId === this.copilotTrackingId ? oldQuota : {};
    const quotas = {
      ...incomingQuotas,
      chat: incomingQuotas.chat ? mergeDefinedSnapshot(cachedQuota.chat, incomingQuotas.chat) : void 0,
      completions: incomingQuotas.completions ? mergeDefinedSnapshot(cachedQuota.completions, incomingQuotas.completions) : void 0,
      premiumChat: incomingQuotas.premiumChat ? mergeDefinedSnapshot(cachedQuota.premiumChat, incomingQuotas.premiumChat) : void 0,
      sessionRateLimit: incomingQuotas.sessionRateLimit ? mergeDefinedSnapshot(cachedQuota.sessionRateLimit, incomingQuotas.sessionRateLimit) : void 0,
      weeklyRateLimit: incomingQuotas.weeklyRateLimit ? mergeDefinedSnapshot(cachedQuota.weeklyRateLimit, incomingQuotas.weeklyRateLimit) : void 0
    };
    this.quotaCopilotTrackingId = this.copilotTrackingId;
    this._quotas = quotas;
    this.updateContextKeys();
    if (oldQuota.usageBasedBilling !== quotas.usageBasedBilling) {
      if (quotas.usageBasedBilling !== void 0) {
        this.storageService.store(ChatEntitlementService.CACHED_UBB_STORAGE_KEY, quotas.usageBasedBilling, 0 /* PROFILE */, 1 /* MACHINE */);
      } else {
        this.storageService.remove(ChatEntitlementService.CACHED_UBB_STORAGE_KEY, 0 /* PROFILE */);
      }
    }
    if (this.logService.getLevel() === 1 /* Trace */) {
      this.logService.trace(`[chat entitlement]: acceptQuotas: ${JSON.stringify(quotas)}`);
    }
    const { changed: chatChanged } = this.compareQuotas(oldQuota.chat, quotas.chat);
    const { changed: completionsChanged } = this.compareQuotas(oldQuota.completions, quotas.completions);
    const { changed: premiumChatChanged } = this.compareQuotas(oldQuota.premiumChat, quotas.premiumChat);
    if (chatChanged.exceeded || completionsChanged.exceeded || premiumChatChanged.exceeded) {
      this._onDidChangeQuotaExceeded.fire();
    }
    const sessionRateLimitChanged = oldQuota.sessionRateLimit?.percentRemaining !== quotas.sessionRateLimit?.percentRemaining;
    const weeklyRateLimitChanged = oldQuota.weeklyRateLimit?.percentRemaining !== quotas.weeklyRateLimit?.percentRemaining;
    if (chatChanged.remaining || completionsChanged.remaining || premiumChatChanged.remaining || sessionRateLimitChanged || weeklyRateLimitChanged || oldQuota.usageBasedBilling !== quotas.usageBasedBilling) {
      this._onDidChangeQuotaRemaining.fire();
    }
    if (oldQuota.usageBasedBilling !== quotas.usageBasedBilling) {
      this._onDidChangeUsageBasedBilling.fire();
    }
    if (oldQuota.additionalUsageEnabled !== void 0 && quotas.additionalUsageEnabled !== void 0 && oldQuota.additionalUsageEnabled !== quotas.additionalUsageEnabled) {
      this.telemetryService.publicLog2("chatAdditionalSpendConfiguration", {
        enabled: quotas.additionalUsageEnabled ?? false,
        entitlement: this.entitlement
      });
    }
    if (quotas.additionalUsageEnabled && quotas.premiumChat?.percentRemaining === 0 && oldQuota.premiumChat?.percentRemaining !== void 0 && oldQuota.premiumChat.percentRemaining > 0) {
      this.telemetryService.publicLog2("chatAdditionalSpendActive", {
        entitlement: this.entitlement,
        additionalUsageCount: quotas.additionalUsageCount ?? 0
      });
    }
  }
  compareQuotas(oldQuota, newQuota) {
    return {
      changed: {
        exceeded: oldQuota?.percentRemaining === 0 !== (newQuota?.percentRemaining === 0),
        remaining: oldQuota?.percentRemaining !== newQuota?.percentRemaining || oldQuota?.usageBasedBilling !== newQuota?.usageBasedBilling || oldQuota?.creditsUsed !== newQuota?.creditsUsed
      }
    };
  }
  clearQuotas() {
    this.acceptQuotas({});
  }
  updateContextKeys() {
    const chatExhausted = this._quotas.chat?.percentRemaining === 0;
    const premiumChatExhausted = this._quotas.premiumChat?.unlimited ? this._quotas.premiumChat.hasQuota === false : this._quotas.premiumChat?.percentRemaining === 0;
    const additionalUsageEnabled = this._quotas.additionalUsageEnabled ?? false;
    const isManagedPlan = this.entitlement === 8 /* Business */ || this.entitlement === 9 /* Enterprise */;
    this.chatQuotaExceededContextKey.set(chatExhausted || premiumChatExhausted && (isManagedPlan || !additionalUsageEnabled));
    this.completionsQuotaExceededContextKey.set(this._quotas.completions?.percentRemaining === 0);
  }
  get sentiment() {
    return {
      completed: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.completed.key) === true,
      installed: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.installed.key) === true,
      hidden: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.hidden.key) === true,
      disabledInWorkspace: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.disabledInWorkspace.key) === true,
      disabled: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.disabled.key) === true,
      untrusted: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.untrusted.key) === true,
      later: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.later.key) === true,
      registered: this.contextKeyService.getContextKeyValue(ChatEntitlementContextKeys.Setup.registered.key) === true
    };
  }
  get anonymous() {
    return isAnonymous(this.configurationService, this.entitlement, this.sentiment);
  }
  //#endregion
  markAnonymousRateLimited() {
    if (!this.anonymous) {
      return;
    }
    this.chatQuotaExceededContextKey.set(true);
    this._onDidChangeQuotaExceeded.fire();
  }
  markSetupCompleted() {
    this.context?.value.update({ completed: true });
  }
  setForceHidden(hidden) {
    if (this.context) {
      this.context.value.setForceHidden(hidden);
    } else {
      ChatEntitlementContextKeys.Setup.hidden.bindTo(this.contextKeyService).set(hidden);
    }
  }
  async update(token) {
    await this.requests?.value.forceResolveEntitlement(token);
  }
};

ChatEntitlementService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IProductService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IStorageService)
], ChatEntitlementService);

function getQuotaUsage(quota) {
  if (!quota) {
    return void 0;
  }
  if (quota.unlimited) {
    if (quota.hasQuota === false || typeof quota.creditsUsed !== "number") {
      return void 0;
    }
    return { kind: 1 /* CreditsUsed */, creditsUsed: quota.creditsUsed };
  }
  const total = quota.entitlement || void 0;
  let used;
  if (total !== void 0) {
    used = Math.max(0, quota.quotaRemaining !== void 0 ? total - quota.quotaRemaining : total * (100 - quota.percentRemaining) / 100);
  }
  return {
    kind: 0 /* Percentage */,
    usedPercentage: Math.max(0, 100 - quota.percentRemaining),
    used,
    total
  };
}

function getQuotaReset(quota, accountReset) {
  if (quota?.resetAt) {
    return { date: new Date(quota.resetAt * 1e3), hasTime: true };
  }
  if (!accountReset.resetDate) {
    return void 0;
  }
  const parsed = Date.parse(accountReset.resetDate);
  if (isNaN(parsed)) {
    return void 0;
  }
  return { date: new Date(parsed), hasTime: !!accountReset.resetDateHasTime };
}

function mergeDefinedSnapshot(previous, current) {
  const result = { ...previous, ...current };
  for (const key3 of Object.keys(current)) {
    if (current[key3] === void 0 && previous?.[key3] !== void 0) {
      result[key3] = previous[key3];
    }
  }
  return result;
}

function parseQuotas(entitlementsData) {
  const quotas = {
    resetDate: entitlementsData.quota_reset_date_utc ?? entitlementsData.quota_reset_date ?? entitlementsData.limited_user_reset_date,
    resetDateHasTime: typeof entitlementsData.quota_reset_date_utc === "string",
    usageBasedBilling: entitlementsData.token_based_billing,
    canUpgradePlan: entitlementsData.can_upgrade_plan
  };
  if (entitlementsData.monthly_quotas?.chat && typeof entitlementsData.limited_user_quotas?.chat === "number") {
    quotas.chat = {
      percentRemaining: Math.min(100, Math.max(0, entitlementsData.limited_user_quotas.chat / entitlementsData.monthly_quotas.chat * 100)),
      unlimited: false
    };
  }
  if (entitlementsData.monthly_quotas?.completions && typeof entitlementsData.limited_user_quotas?.completions === "number") {
    quotas.completions = {
      percentRemaining: Math.min(100, Math.max(0, entitlementsData.limited_user_quotas.completions / entitlementsData.monthly_quotas.completions * 100)),
      unlimited: false
    };
  }
  if (entitlementsData.quota_snapshots) {
    for (const quotaType of ["chat", "completions", "premium_interactions"]) {
      const rawQuotaSnapshot = entitlementsData.quota_snapshots[quotaType];
      if (!rawQuotaSnapshot) {
        continue;
      }
      const parsedEntitlement = rawQuotaSnapshot.entitlement !== void 0 ? Number(rawQuotaSnapshot.entitlement) : void 0;
      const parsedCreditsUsed = rawQuotaSnapshot.credits_used !== void 0 ? Number(rawQuotaSnapshot.credits_used) : void 0;
      if (!rawQuotaSnapshot.unlimited && parsedEntitlement === 0) {
        continue;
      }
      const parsedQuotaRemaining = rawQuotaSnapshot.quota_remaining !== void 0 ? Number(rawQuotaSnapshot.quota_remaining) : void 0;
      const quotaSnapshot = {
        percentRemaining: Math.min(100, Math.max(0, rawQuotaSnapshot.percent_remaining)),
        unlimited: rawQuotaSnapshot.unlimited,
        hasQuota: rawQuotaSnapshot.has_quota,
        usageBasedBilling: entitlementsData.token_based_billing,
        resetAt: rawQuotaSnapshot.quota_reset_at || void 0,
        entitlement: parsedEntitlement !== void 0 && Number.isFinite(parsedEntitlement) && parsedEntitlement >= 0 ? parsedEntitlement : void 0,
        quotaRemaining: parsedQuotaRemaining !== void 0 && Number.isFinite(parsedQuotaRemaining) && parsedQuotaRemaining >= 0 ? parsedQuotaRemaining : void 0,
        creditsUsed: parsedCreditsUsed !== void 0 && Number.isFinite(parsedCreditsUsed) && parsedCreditsUsed >= 0 ? parsedCreditsUsed : void 0
      };
      switch (quotaType) {
        case "chat":
          quotas.chat = quotaSnapshot;
          break;
        case "completions":
          quotas.completions = quotaSnapshot;
          break;
        case "premium_interactions":
          quotas.premiumChat = quotaSnapshot;
          break;
      }
    }
    const overageSource = entitlementsData.quota_snapshots["premium_interactions"];
    quotas.additionalUsageEnabled = overageSource?.overage_permitted ?? false;
    quotas.additionalUsageCount = overageSource?.overage_count ?? 0;
    quotas.additionalUsageEntitlement = overageSource?.overage_entitlement ?? 0;
  }
  return quotas;
}

var ChatEntitlementRequests = class extends Disposable {
  constructor(context2, chatQuotasAccessor, telemetryService, logService, requestService, dialogService, openerService, lifecycleService, defaultAccountService, authenticationService) {
    super();
    this.context = context2;
    this.chatQuotasAccessor = chatQuotasAccessor;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.requestService = requestService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.lifecycleService = lifecycleService;
    this.defaultAccountService = defaultAccountService;
    this.authenticationService = authenticationService;
    this.pendingResolveCts = new CancellationTokenSource();
    this.state = { entitlement: this.context.state.entitlement };
    this.registerListeners();
    this.resolve();
  }
  registerListeners() {
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.resolve()));
    this._register(this.context.onDidChange(() => {
      if (this.context.state.disabled || this.context.state.entitlement === 1 /* Unknown */) {
        this.state = { entitlement: this.state.entitlement, quotas: void 0 };
        this.chatQuotasAccessor.clearQuotas();
      }
    }));
  }
  async resolve() {
    this.pendingResolveCts.dispose(true);
    const cts = this.pendingResolveCts = new CancellationTokenSource();
    const defaultAccount = await this.defaultAccountService.getDefaultAccount();
    if (cts.token.isCancellationRequested) {
      return;
    }
    let state = void 0;
    if (defaultAccount) {
      if (this.state.entitlement === 1 /* Unknown */) {
        state = { entitlement: 2 /* Unresolved */ };
      }
    } else {
      state = { entitlement: 1 /* Unknown */ };
    }
    if (state) {
      this.update(state);
    }
    if (defaultAccount) {
      await this.resolveEntitlement(defaultAccount, cts.token);
    }
  }
  async resolveEntitlement(defaultAccount, token) {
    const entitlements = await this.doResolveEntitlement(defaultAccount, token);
    if (typeof entitlements?.entitlement === "number" && !token.isCancellationRequested) {
      this.update(entitlements);
    }
    return entitlements;
  }
  async doResolveEntitlement(defaultAccount, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    const entitlementsData = defaultAccount.entitlementsData;
    if (!entitlementsData) {
      this.logService.trace("[chat entitlement]: no entitlements data available on default account");
      return { entitlement: entitlementsData === null ? 1 /* Unknown */ : 2 /* Unresolved */ };
    }
    let entitlement;
    if (entitlementsData.access_type_sku === "free_limited_copilot") {
      entitlement = 5 /* Free */;
    } else if (entitlementsData.access_type_sku === "free_educational_quota") {
      entitlement = 10 /* EDU */;
    } else if (entitlementsData.can_signup_for_limited) {
      entitlement = 3 /* Available */;
    } else if (entitlementsData.copilot_plan === "individual_edu") {
      entitlement = 10 /* EDU */;
    } else if (entitlementsData.copilot_plan === "individual") {
      entitlement = 6 /* Pro */;
    } else if (entitlementsData.copilot_plan === "individual_pro") {
      entitlement = 7 /* ProPlus */;
    } else if (entitlementsData.copilot_plan === "individual_max") {
      entitlement = 11 /* Max */;
    } else if (entitlementsData.copilot_plan === "business") {
      entitlement = 8 /* Business */;
    } else if (entitlementsData.copilot_plan === "enterprise") {
      entitlement = 9 /* Enterprise */;
    } else {
      entitlement = 4 /* Unavailable */;
    }
    const entitlements = {
      entitlement,
      organisations: entitlementsData.organization_login_list,
      isStaff: entitlementsData.is_staff,
      quotas: this.toQuotas(entitlementsData),
      sku: entitlementsData.access_type_sku,
      copilotTrackingId: entitlementsData.analytics_tracking_id
    };
    this.logService.trace(`[chat entitlement]: resolved to ${entitlements.entitlement}, quotas: ${JSON.stringify(entitlements.quotas)}`);
    this.telemetryService.publicLog2("chatInstallEntitlement", {
      entitlement: entitlements.entitlement,
      tid: entitlementsData.analytics_tracking_id,
      sku: entitlements.sku,
      quotaChatUnlimited: entitlements.quotas?.chat?.unlimited,
      quotaChatHasQuota: entitlements.quotas?.chat?.hasQuota,
      quotaChatEntitlement: entitlements.quotas?.chat?.entitlement,
      quotaPremiumChat: entitlements.quotas?.premiumChat?.percentRemaining,
      quotaPremiumChatUnlimited: entitlements.quotas?.premiumChat?.unlimited,
      quotaPremiumChatHasQuota: entitlements.quotas?.premiumChat?.hasQuota,
      quotaPremiumChatEntitlement: entitlements.quotas?.premiumChat?.entitlement,
      quotaCompletions: entitlements.quotas?.completions?.percentRemaining,
      quotaCompletionsUnlimited: entitlements.quotas?.completions?.unlimited,
      quotaCompletionsHasQuota: entitlements.quotas?.completions?.hasQuota,
      quotaCompletionsEntitlement: entitlements.quotas?.completions?.entitlement,
      quotaResetDate: entitlements.quotas?.resetDate,
      usageBasedBilling: entitlements.quotas?.usageBasedBilling,
      additionalUsageEnabled: entitlements.quotas?.additionalUsageEnabled,
      additionalUsageCount: entitlements.quotas?.additionalUsageCount,
      canUpgradePlan: entitlements.quotas?.canUpgradePlan
    });
    return entitlements;
  }
  toQuotas(entitlementsData) {
    return parseQuotas(entitlementsData);
  }
  async request(url, type, body, sessions, token, callSite) {
    let lastRequest2;
    for (const session of sessions) {
      if (token.isCancellationRequested) {
        return lastRequest2;
      }
      try {
        const response = await this.requestService.request({
          type,
          url,
          data: type === "POST" ? JSON.stringify(body) : void 0,
          disableCache: true,
          headers: {
            "Authorization": `Bearer ${session.accessToken}`
          },
          callSite
        }, token);
        const status2 = response.res.statusCode;
        if (status2 && status2 !== 200) {
          lastRequest2 = response;
          continue;
        }
        return response;
      } catch (error) {
        if (!token.isCancellationRequested) {
          this.logService.error(`[chat entitlement] request: error ${error}`);
        }
      }
    }
    return lastRequest2;
  }
  update(state) {
    this.state = state;
    this.context.update({ entitlement: this.state.entitlement, organisations: this.state.organisations, isStaff: this.state.isStaff, sku: this.state.sku, copilotTrackingId: this.state.copilotTrackingId });
    if (state.quotas) {
      this.chatQuotasAccessor.acceptQuotas(state.quotas);
    }
  }
  async forceResolveEntitlement(token = CancellationToken.None) {
    const defaultAccount = await this.defaultAccountService.refresh({ refreshEntitlements: true });
    if (!defaultAccount) {
      return void 0;
    }
    return this.resolveEntitlement(defaultAccount, token);
  }
  async signUpFree() {
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      return void 0;
    }
    return this.doSignUpFree(sessions);
  }
  async doSignUpFree(sessions) {
    const body = {
      restricted_telemetry: this.telemetryService.telemetryLevel === 0 /* NONE */ ? "disabled" : "enabled",
      public_code_suggestions: "enabled"
    };
    const response = await this.request(defaultChatAgent.entitlementSignupLimitedUrl, "POST", body, sessions, CancellationToken.None, "chatEntitlementService.signUpFree");
    if (!response) {
      const retry2 = await this.onUnknownSignUpError(localize(22766, null), "[chat entitlement] sign-up: no response");
      return retry2 ? this.doSignUpFree(sessions) : { errorCode: 1 };
    }
    if (response.res.statusCode && response.res.statusCode !== 200) {
      if (response.res.statusCode === 422) {
        try {
          const responseText2 = await asText(response);
          if (responseText2) {
            const responseError = JSON.parse(responseText2);
            if (typeof responseError.message === "string" && responseError.message) {
              this.onUnprocessableSignUpError(`[chat entitlement] sign-up: unprocessable entity (${responseError.message})`, responseError.message);
              return { errorCode: response.res.statusCode };
            }
          }
        } catch (error) {
        }
      }
      const retry2 = await this.onUnknownSignUpError(localize(22767, null, response.res.statusCode), `[chat entitlement] sign-up: unexpected status code ${response.res.statusCode}`);
      return retry2 ? this.doSignUpFree(sessions) : { errorCode: response.res.statusCode };
    }
    let responseText = null;
    try {
      responseText = await asText(response);
    } catch (error) {
    }
    if (!responseText) {
      const retry2 = await this.onUnknownSignUpError(localize(22765, null), "[chat entitlement] sign-up: response has no content");
      return retry2 ? this.doSignUpFree(sessions) : { errorCode: 2 };
    }
    let parsedResult = void 0;
    try {
      parsedResult = JSON.parse(responseText);
      this.logService.trace(`[chat entitlement] sign-up: response is ${responseText}`);
    } catch (err) {
      const retry2 = await this.onUnknownSignUpError(localize(22764, null), `[chat entitlement] sign-up: error parsing response (${err})`);
      return retry2 ? this.doSignUpFree(sessions) : { errorCode: 3 };
    }
    this.update({ entitlement: 5 /* Free */ });
    return Boolean(parsedResult?.subscribed);
  }
  async getSessions() {
    const defaultAccount = await this.defaultAccountService.getDefaultAccount();
    if (defaultAccount) {
      const sessions = await this.authenticationService.getSessions(defaultAccount.authenticationProvider.id);
      const accountSessions = sessions.filter((s) => s.id === defaultAccount.sessionId);
      if (accountSessions.length) {
        return accountSessions;
      }
    }
    return [...await this.authenticationService.getSessions(this.defaultAccountService.getDefaultAccountAuthenticationProvider().id)];
  }
  async onUnknownSignUpError(detail2, logMessage) {
    this.logService.error(logMessage);
    if (!this.lifecycleService.willShutdown) {
      const { confirmed } = await this.dialogService.confirm({
        type: severity_default.Error,
        message: localize(22768, null),
        detail: detail2,
        primaryButton: localize(22763, null)
      });
      return confirmed;
    }
    return false;
  }
  onUnprocessableSignUpError(logMessage, logDetails) {
    this.logService.error(logMessage);
    if (!this.lifecycleService.willShutdown) {
      this.dialogService.prompt({
        type: severity_default.Error,
        message: localize(22769, null),
        detail: logDetails,
        buttons: [
          {
            label: localize(22755, null),
            run: () => {
            }
          },
          {
            label: localize(22754, null),
            run: () => this.openerService.open(URI.parse(defaultChatAgent.upgradePlanUrl))
          }
        ]
      });
    }
  }
  async signIn(options3) {
    const defaultAccount = await this.defaultAccountService.signIn({
      additionalScopes: options3?.additionalScopes,
      extraAuthorizeParameters: { get_started_with: "copilot-vscode" },
      provider: options3?.useSocialProvider
    });
    if (!defaultAccount) {
      return {};
    }
    const entitlements = await this.doResolveEntitlement(defaultAccount, CancellationToken.None);
    return { defaultAccount, entitlements };
  }
  dispose() {
    this.pendingResolveCts.dispose(true);
    super.dispose();
  }
};

ChatEntitlementRequests = __decorateClass([
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IRequestService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, ILifecycleService),
  __decorateParam(8, IDefaultAccountService),
  __decorateParam(9, IAuthenticationService)
], ChatEntitlementRequests);

var ChatEntitlementContext = class extends Disposable {
  constructor(contextKeyService, storageService, logService, configurationService, telemetryService) {
    super();
    this.storageService = storageService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.suspendedState = void 0;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.updateBarrier = void 0;
    this._forceHidden = false;
    this.canSignUpContextKey = ChatEntitlementContextKeys.Entitlement.canSignUp.bindTo(contextKeyService);
    this.signedOutContextKey = ChatEntitlementContextKeys.Entitlement.signedOut.bindTo(contextKeyService);
    this.freeContextKey = ChatEntitlementContextKeys.Entitlement.planFree.bindTo(contextKeyService);
    this.eduContextKey = ChatEntitlementContextKeys.Entitlement.planEdu.bindTo(contextKeyService);
    this.proContextKey = ChatEntitlementContextKeys.Entitlement.planPro.bindTo(contextKeyService);
    this.proPlusContextKey = ChatEntitlementContextKeys.Entitlement.planProPlus.bindTo(contextKeyService);
    this.maxContextKey = ChatEntitlementContextKeys.Entitlement.planMax.bindTo(contextKeyService);
    this.businessContextKey = ChatEntitlementContextKeys.Entitlement.planBusiness.bindTo(contextKeyService);
    this.enterpriseContextKey = ChatEntitlementContextKeys.Entitlement.planEnterprise.bindTo(contextKeyService);
    this.organisationsContextKey = ChatEntitlementContextKeys.Entitlement.organisations.bindTo(contextKeyService);
    this.isInternalContextKey = ChatEntitlementContextKeys.Entitlement.internal.bindTo(contextKeyService);
    this.skuContextKey = ChatEntitlementContextKeys.Entitlement.sku.bindTo(contextKeyService);
    this.completedContext = ChatEntitlementContextKeys.Setup.completed.bindTo(contextKeyService);
    this.hiddenContext = ChatEntitlementContextKeys.Setup.hidden.bindTo(contextKeyService);
    this.disabledInWorkspaceContext = ChatEntitlementContextKeys.Setup.disabledInWorkspace.bindTo(contextKeyService);
    this.laterContext = ChatEntitlementContextKeys.Setup.later.bindTo(contextKeyService);
    this.installedContext = ChatEntitlementContextKeys.Setup.installed.bindTo(contextKeyService);
    this.disabledContext = ChatEntitlementContextKeys.Setup.disabled.bindTo(contextKeyService);
    this.untrustedContext = ChatEntitlementContextKeys.Setup.untrusted.bindTo(contextKeyService);
    this.registeredContext = ChatEntitlementContextKeys.Setup.registered.bindTo(contextKeyService);
    this._state = this.storageService.getObject(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY, 0 /* PROFILE */) ?? {
      entitlement: 1 /* Unknown */,
      organisations: void 0,
      isStaff: void 0,
      sku: void 0,
      copilotTrackingId: void 0
    };
    const migrated = this.storageService.getBoolean(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_MIGRATED_STORAGE_KEY, 0 /* PROFILE */) === true;
    if (!migrated) {
      this.storageService.store(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_MIGRATED_STORAGE_KEY, true, 0 /* PROFILE */, 1 /* MACHINE */);
      if (this._state.installed && !this._state.completed) {
        this._state.completed = true;
        this.storageService.store(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY, this._state, 0 /* PROFILE */, 1 /* MACHINE */);
      }
    }
    this.updateContextSync();
    this.registerListeners();
  }
  static {
    this.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY = "chat.setupContext";
  }
  static {
    this.CHAT_ENTITLEMENT_CONTEXT_MIGRATED_STORAGE_KEY = "chat.setupContext.migrated.v1";
  }
  get state() {
    return this.withConfiguration(this.suspendedState ?? this._state);
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(ChatAIDisabledSettingId)) {
        this.updateContext();
      }
    }));
  }
  withConfiguration(state) {
    if (this._forceHidden || this.configurationService.getValue(ChatAIDisabledSettingId) === true) {
      return {
        ...state,
        hidden: true
      };
    }
    return state;
  }
  setForceHidden(hidden) {
    if (this._forceHidden !== hidden) {
      this._forceHidden = hidden;
      this.updateContext();
    }
  }
  async update(context2) {
    this.logService.trace(`[chat entitlement context] update(): ${JSON.stringify(context2)}`);
    const oldState = JSON.stringify(this._state);
    if (typeof context2.installed === "boolean" && typeof context2.disabled === "boolean" && typeof context2.untrusted === "boolean") {
      this._state.installed = context2.installed;
      this._state.disabled = context2.disabled;
      this._state.untrusted = context2.untrusted;
      this._state.disabledInWorkspace = context2.disabledInWorkspace;
      if (context2.installed && !context2.disabled) {
        context2.hidden = false;
      }
    }
    if (typeof context2.hidden === "boolean") {
      this._state.hidden = context2.hidden;
    }
    if (typeof context2.later === "boolean") {
      this._state.later = context2.later;
    }
    if (typeof context2.completed === "boolean") {
      this._state.completed = context2.completed;
    }
    if (typeof context2.entitlement === "number") {
      this._state.entitlement = context2.entitlement;
      this._state.organisations = context2.organisations;
      this._state.isStaff = context2.isStaff;
      this._state.sku = context2.sku;
      this._state.copilotTrackingId = context2.copilotTrackingId;
      if (this._state.entitlement === 5 /* Free */ || isProUser(this._state.entitlement)) {
        this._state.registered = true;
      } else if (this._state.entitlement === 3 /* Available */) {
        this._state.registered = false;
      }
    }
    if (isAnonymous(this.configurationService, this._state.entitlement, this._state)) {
      this._state.sku = "no_auth_limited_copilot";
    }
    if (oldState === JSON.stringify(this._state)) {
      return;
    }
    this.storageService.store(ChatEntitlementContext.CHAT_ENTITLEMENT_CONTEXT_STORAGE_KEY, {
      ...this._state,
      later: void 0
      // do not persist this across restarts for now
    }, 0 /* PROFILE */, 1 /* MACHINE */);
    return this.updateContext();
  }
  async updateContext() {
    await this.updateBarrier?.wait();
    this.updateContextSync();
  }
  updateContextSync() {
    const state = this.withConfiguration(this._state);
    this.signedOutContextKey.set(state.entitlement === 1 /* Unknown */);
    this.canSignUpContextKey.set(state.entitlement === 3 /* Available */);
    this.freeContextKey.set(state.entitlement === 5 /* Free */);
    this.eduContextKey.set(state.entitlement === 10 /* EDU */);
    this.proContextKey.set(state.entitlement === 6 /* Pro */);
    this.proPlusContextKey.set(state.entitlement === 7 /* ProPlus */);
    this.maxContextKey.set(state.entitlement === 11 /* Max */);
    this.businessContextKey.set(state.entitlement === 8 /* Business */);
    this.enterpriseContextKey.set(state.entitlement === 9 /* Enterprise */);
    this.organisationsContextKey.set(state.organisations);
    this.isInternalContextKey.set(isInternalAccount(state.isStaff, state.organisations));
    this.skuContextKey.set(state.sku);
    this.completedContext.set(!!state.completed);
    this.hiddenContext.set(!!state.hidden);
    this.disabledInWorkspaceContext.set(!!state.disabledInWorkspace);
    this.laterContext.set(!!state.later);
    this.installedContext.set(!!state.installed);
    this.disabledContext.set(!!state.disabled);
    this.untrustedContext.set(!!state.untrusted);
    this.registeredContext.set(!!state.registered);
    this.logService.trace(`[chat entitlement context] updateContext(): ${JSON.stringify(state)}`);
    logChatEntitlements(state, this.configurationService, this.telemetryService);
    this._onDidChange.fire();
  }
  suspend() {
    this.suspendedState = { ...this._state };
    this.updateBarrier = new Barrier();
  }
  resume() {
    this.suspendedState = void 0;
    this.updateBarrier?.open();
    this.updateBarrier = void 0;
  }
};

ChatEntitlementContext = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITelemetryService)
], ChatEntitlementContext);

registerSingleton(
  IChatEntitlementService,
  ChatEntitlementService,
  0 /* Eager */
  /* To ensure context keys are set asap */
);
export { chatRequiresSetup, isProUser, getChatPlanName, isAnonymous, logChatEntitlements, getQuotaUsage, getQuotaReset, mergeDefinedSnapshot, parseQuotas, ChatEntitlementContextKeys, IChatEntitlementService, defaultChatAgent, CHAT_ALLOW_ANONYMOUS_CONFIGURATION_KEY, ChatEntitlementService, ChatEntitlementRequests, ChatEntitlementContext };
