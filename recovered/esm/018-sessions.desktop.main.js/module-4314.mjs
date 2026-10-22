// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSignedOutModelsNotification.ts
import { ChatEntitlementContextKeys, IChatEntitlementService } from "./module-0954.mjs";
import { ChatSetupDialogVisibleContext } from "./module-2753.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId, IAgentHostService } from "./module-1108.mjs";
import { COPILOT_VENDOR_ID, ILanguageModelsService } from "./module-0968.mjs";
import { hasVisibleByokModelsTargetingSessionType } from "./module-2152.mjs";
import { SessionType } from "./module-0961.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { MANAGE_CHAT_COMMAND_ID } from "./module-0965.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILanguageModelsConfigurationService } from "./module-0967.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSignedOutModelsNotification.ts
var SIGNED_OUT_MODELS_NOTIFICATION_ID = "agentHost.signedOutModels.copilot";

var SIGN_IN_COMMAND_ID = "workbench.action.chat.triggerSetup";

var COPILOT_AGENT_HOST_PROVIDER_ID = "copilotcli";

var NOTIFICATION_CONTEXT_KEYS = /* @__PURE__ */ new Set([
  ChatEntitlementContextKeys.clientByokEnabled.key,
  ChatSetupDialogVisibleContext.key
]);

var NOTIFICATION_GRACE_PERIOD_MS = 5e3;

function getSignedOutModelsNotificationState(options3) {
  if (options3.setupDialogVisible || !options3.allowSignedOutWhenUsable || !options3.accountResolved || !options3.entitlementResolved || options3.signedIn || !options3.hasCopilotHarness || options3.hasModels) {
    return 0 /* Hidden */;
  }
  return options3.localModelsLoaded || options3.gracePeriodElapsed ? 2 /* Visible */ : 1 /* Waiting */;
}

function areLocalModelsLoaded(extensionsRegistered, configurationLoaded, configuredByokVendors, hasResolvedVendor) {
  return extensionsRegistered && configurationLoaded && configuredByokVendors.every(hasResolvedVendor);
}

var AgentHostSignedOutModelsNotificationContribution = class extends Disposable {
  constructor(_chatInputNotificationService, _defaultAccountService, _languageModelsService, _languageModelsConfigurationService, _agentHostService, _configurationService, _chatEntitlementService, _contextKeyService, extensionService) {
    super();
    this._chatInputNotificationService = _chatInputNotificationService;
    this._defaultAccountService = _defaultAccountService;
    this._languageModelsService = _languageModelsService;
    this._languageModelsConfigurationService = _languageModelsConfigurationService;
    this._agentHostService = _agentHostService;
    this._configurationService = _configurationService;
    this._chatEntitlementService = _chatEntitlementService;
    this._contextKeyService = _contextKeyService;
    this._notificationShown = false;
    /** Startup readiness prevents transient empty catalogs from producing false notifications. */
    this._accountResolved = false;
    this._extensionsRegistered = false;
    this._configurationLoaded = false;
    this._gracePeriodElapsed = false;
    this._gracePeriod = this._register(new MutableDisposable());
    this._register(this._defaultAccountService.onDidChangeDefaultAccount(() => {
      this._accountResolved = true;
      this._update();
    }));
    this._defaultAccountService.getDefaultAccount().then(() => {
      if (!this._store.isDisposed) {
        this._accountResolved = true;
        this._update();
      }
    });
    this._register(Event2.any(
      this._chatEntitlementService.onDidChangeEntitlement,
      this._languageModelsService.onDidChangeLanguageModels,
      this._languageModelsService.onDidChangeModelVisibility,
      this._languageModelsConfigurationService.onDidChangeLanguageModelGroups,
      Event2.filter(this._contextKeyService.onDidChangeContext, (event) => event.affectsSome(NOTIFICATION_CONTEXT_KEYS))
    )(() => this._update()));
    this._register(this._configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(AgentHostAllowSignedOutWhenUsableSettingId)) {
        this._update();
      }
    }));
    extensionService.whenInstalledExtensionsRegistered().then(() => {
      if (!this._store.isDisposed) {
        this._extensionsRegistered = true;
        this._update();
      }
    });
    this._languageModelsConfigurationService.whenReady.then(() => {
      if (!this._store.isDisposed) {
        this._configurationLoaded = true;
        this._update();
      }
    });
    const rootStateListeners = this._register(new DisposableStore());
    const bindRootState = () => {
      rootStateListeners.clear();
      rootStateListeners.add(this._agentHostService.rootState.onDidChange(() => this._update()));
      if (this._agentHostService.rootState.onDidError) {
        rootStateListeners.add(this._agentHostService.rootState.onDidError(() => this._update()));
      }
      this._update();
    };
    bindRootState();
    this._register(this._agentHostService.onAgentHostStart(bindRootState));
  }
  static {
    this.ID = "workbench.contrib.agentHostSignedOutModelsNotification";
  }
  _update() {
    const allowSignedOutWhenUsable = this._configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true;
    const entitlement = this._chatEntitlementService.entitlement;
    const entitlementResolved = entitlement !== 2 /* Unresolved */;
    const signedIn = this._defaultAccountService.currentDefaultAccount !== null || entitlementResolved && entitlement !== 1 /* Unknown */;
    const configuredByokVendors = new Set(this._languageModelsConfigurationService.getLanguageModelsProviderGroups().map((group2) => group2.vendor).filter((vendor) => vendor !== COPILOT_VENDOR_ID));
    const localModelsLoaded = areLocalModelsLoaded(
      this._extensionsRegistered,
      this._configurationLoaded,
      [...configuredByokVendors],
      (vendor) => this._languageModelsService.hasResolvedVendor(vendor)
    );
    const rootState = this._agentHostService.rootState.value;
    const hasCopilotHarness = !!rootState && !(rootState instanceof Error) && rootState.agents.some((agent) => agent.provider === COPILOT_AGENT_HOST_PROVIDER_ID);
    const hasModels = this._chatEntitlementService.clientByokEnabled && hasVisibleByokModelsTargetingSessionType(this._languageModelsService, SessionType.AgentHostCopilot);
    const state = getSignedOutModelsNotificationState({
      allowSignedOutWhenUsable,
      accountResolved: this._accountResolved,
      entitlementResolved,
      signedIn,
      hasCopilotHarness,
      hasModels,
      localModelsLoaded,
      gracePeriodElapsed: this._gracePeriodElapsed,
      setupDialogVisible: this._contextKeyService.getContextKeyValue(ChatSetupDialogVisibleContext.key) === true
    });
    this._updateGracePeriod(state);
    this._setNotification(state === 2 /* Visible */);
  }
  _updateGracePeriod(state) {
    if (state === 0 /* Hidden */) {
      this._gracePeriod.clear();
      this._gracePeriodElapsed = false;
      return;
    }
    if (state === 2 /* Visible */) {
      this._gracePeriod.clear();
      return;
    }
    if (!this._gracePeriod.value) {
      this._gracePeriod.value = disposableTimeout(() => {
        this._gracePeriodElapsed = true;
        this._update();
      }, NOTIFICATION_GRACE_PERIOD_MS);
    }
  }
  _setNotification(show3) {
    if (show3 === this._notificationShown) {
      return;
    }
    this._notificationShown = show3;
    if (!show3) {
      this._chatInputNotificationService.deleteNotification(SIGNED_OUT_MODELS_NOTIFICATION_ID);
      return;
    }
    this._chatInputNotificationService.setNotification(this._createNotification());
  }
  _createNotification() {
    return {
      id: SIGNED_OUT_MODELS_NOTIFICATION_ID,
      severity: 0 /* Info */,
      message: localize(9026, null),
      description: localize(9025, null),
      actions: [
        {
          kind: "command" /* Command */,
          label: localize(9024, null),
          commandId: MANAGE_CHAT_COMMAND_ID,
          keepOpen: true
        },
        {
          kind: "command" /* Command */,
          label: localize(9027, null),
          commandId: SIGN_IN_COMMAND_ID,
          keepOpen: true
        }
      ],
      dismissible: false,
      autoDismissOnMessage: false,
      sessionTypes: [SessionType.AgentHostCopilot]
    };
  }
};

AgentHostSignedOutModelsNotificationContribution = __decorateClass([
  __decorateParam(0, IChatInputNotificationService),
  __decorateParam(1, IDefaultAccountService),
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, ILanguageModelsConfigurationService),
  __decorateParam(4, IAgentHostService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IChatEntitlementService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IExtensionService)
], AgentHostSignedOutModelsNotificationContribution);
export { getSignedOutModelsNotificationState, areLocalModelsLoaded, SIGNED_OUT_MODELS_NOTIFICATION_ID, SIGN_IN_COMMAND_ID, COPILOT_AGENT_HOST_PROVIDER_ID, NOTIFICATION_CONTEXT_KEYS, NOTIFICATION_GRACE_PERIOD_MS, AgentHostSignedOutModelsNotificationContribution };
