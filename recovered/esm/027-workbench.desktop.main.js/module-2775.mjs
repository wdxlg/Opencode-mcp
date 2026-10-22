// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatQuotaNotification.ts
import { isAutoLanguageModel } from "./module-0967.mjs";
import { isByokModel } from "./module-2045.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { safeIntl } from "./module-0120.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IChatInputNotificationService } from "./module-1461.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/chatQuotaNotification.ts
var QUOTA_NOTIFICATION_ID = "copilot.quotaStatus";

var THRESHOLDS = [50, 75, 90, 95];

var SWITCH_TO_AUTO_TREATMENT_NAME = "config.chatQuotaWarningSwitchToAuto";

function isAutoEligible(context2) {
  return !isAutoLanguageModel(context2.modelState.currentModel) && context2.modelState.models.some(isAutoLanguageModel);
}

function isQuotaNotificationVisible(context2) {
  return !context2.modelState.currentModel || !isByokModel(context2.modelState.currentModel.metadata);
}

var QUOTA_EXHAUSTED_DISMISSED_STORAGE_KEY = "chat.quotaNotification.exhaustedDismissed";

var ChatQuotaNotificationContribution = class extends Disposable {
  constructor(_chatEntitlementService, _chatInputNotificationService, _storageService, _assignmentService, _logService) {
    super();
    this._chatEntitlementService = _chatEntitlementService;
    this._chatInputNotificationService = _chatInputNotificationService;
    this._storageService = _storageService;
    this._assignmentService = _assignmentService;
    this._logService = _logService;
    /** Tracks whether the current notification is the quota-exhausted variant. */
    this._showingExhausted = false;
    this._switchToAutoAssignmentRequested = false;
    this._register(this._chatEntitlementService.onDidChangeQuotaRemaining(() => this._update()));
    this._register(this._chatEntitlementService.onDidChangeQuotaExceeded(() => this._update()));
    this._register(this._chatEntitlementService.onDidChangeEntitlement(() => this._update()));
    this._register(this._chatInputNotificationService.onDidDismiss((id2) => {
      if (id2 === QUOTA_NOTIFICATION_ID && this._showingExhausted) {
        this._setExhaustedDismissed();
      }
    }));
    this._update();
  }
  static {
    this.ID = "workbench.contrib.chatQuotaNotification";
  }
  async _resolveSwitchToAutoTreatment() {
    const treatment = await this._assignmentService.getTreatment(SWITCH_TO_AUTO_TREATMENT_NAME);
    this._switchToAutoTreatment = treatment;
    if (treatment === true) {
      const warning = this._getActiveQuotaWarning();
      if (warning) {
        this._showQuotaApproachingWarning(warning);
      }
    }
  }
  _requestSwitchToAutoTreatment() {
    if (!this._switchToAutoAssignmentRequested) {
      this._switchToAutoAssignmentRequested = true;
      void this._resolveSwitchToAutoTreatment().catch((error) => {
        this._logService.error(`Failed to resolve ${SWITCH_TO_AUTO_TREATMENT_NAME}`, error);
        this._switchToAutoAssignmentRequested = false;
      });
    }
  }
  _getRelevantSnapshot() {
    const quotas = this._chatEntitlementService.quotas;
    const entitlement = this._chatEntitlementService.entitlement;
    if (entitlement === 1 /* Unknown */ || entitlement === 5 /* Free */) {
      return quotas.chat ?? quotas.premiumChat;
    }
    return quotas.premiumChat;
  }
  _isQuotaUsedUp() {
    const snapshot = this._getRelevantSnapshot();
    if (!snapshot) {
      return false;
    }
    if (snapshot.unlimited) {
      return snapshot.hasQuota === false;
    }
    return snapshot.percentRemaining <= 0;
  }
  _isUBBEligible() {
    return this._chatEntitlementService.quotas.usageBasedBilling === true;
  }
  _update() {
    const entitlement = this._chatEntitlementService.entitlement;
    if (this._isQuotaKnownAvailable()) {
      this._clearExhaustedDismissed();
    }
    const isQuotaNotificationEligible = entitlement === 1 /* Unknown */ || this._isUBBEligible();
    this._clearInactiveQuotaWarning(isQuotaNotificationEligible);
    if (this._isManagedPlan(entitlement) && this._isManagedPlanBlocked()) {
      if (!this._isExhaustedDismissed()) {
        this._showManagedPlanBlockedNotification();
      }
      return;
    }
    if (!isQuotaNotificationEligible && this._showingExhausted) {
      this._hideNotification();
    }
    if (isQuotaNotificationEligible && this._isQuotaUsedUp()) {
      const quotas = this._chatEntitlementService.quotas;
      const additionalUsageEnabled = quotas.additionalUsageEnabled ?? false;
      const wasAdditionalUsageEnabled = this._prevAdditionalUsageEnabled;
      this._prevAdditionalUsageEnabled = additionalUsageEnabled;
      if (!this._isExhaustedDismissed()) {
        if (additionalUsageEnabled) {
          if (this._prevQuotaPercentUsed !== void 0 || wasAdditionalUsageEnabled === false) {
            this._showOverageActivationNotification();
          }
        } else {
          this._showExhaustedNotification();
        }
      }
      const exhaustedSnapshot = this._getRelevantSnapshot();
      if (exhaustedSnapshot && !exhaustedSnapshot.unlimited) {
        this._prevQuotaPercentUsed = 100 - exhaustedSnapshot.percentRemaining;
      }
      return;
    }
    if (isQuotaNotificationEligible) {
      const quotaWarning = this._computeQuotaWarning();
      if (quotaWarning) {
        this._showQuotaApproachingWarning(quotaWarning);
        return;
      }
    }
    const rateLimitWarning = this._computeRateLimitWarning();
    if (rateLimitWarning) {
      this._showRateLimitWarning(rateLimitWarning);
      return;
    }
    if (this._showingExhausted && !this._isQuotaUsedUp()) {
      this._hideNotification();
    }
  }
  // --- Threshold crossing detection ----------------------------------------
  _computeQuotaWarning() {
    const snapshot = this._getRelevantSnapshot();
    if (!snapshot || snapshot.unlimited) {
      this._prevQuotaPercentUsed = void 0;
      return void 0;
    }
    const percentUsed = 100 - snapshot.percentRemaining;
    const crossed = this._findCrossedThreshold(percentUsed, this._prevQuotaPercentUsed);
    this._prevQuotaPercentUsed = percentUsed;
    if (crossed !== void 0) {
      return { percentUsed: Math.floor(percentUsed), threshold: crossed };
    }
    return void 0;
  }
  /**
   * Returns the highest threshold that was newly crossed, or `undefined`.
   */
  _findCrossedThreshold(current, previous) {
    if (previous === void 0) {
      return void 0;
    }
    for (let i2 = THRESHOLDS.length - 1; i2 >= 0; i2--) {
      const threshold = THRESHOLDS[i2];
      if (previous < threshold && current >= threshold) {
        return threshold;
      }
    }
    return void 0;
  }
  // --- Quota exhausted ---------------------------------------------------
  _showExhaustedNotification() {
    this._showingExhausted = true;
    const entitlement = this._chatEntitlementService.entitlement;
    const quotas = this._chatEntitlementService.quotas;
    const hadOverage = (quotas.additionalUsageCount ?? 0) > 0;
    let description;
    let actions;
    if (entitlement === 1 /* Unknown */) {
      description = localize(11063, null);
      actions = [{ kind: "command" /* Command */, label: localize(11074, null), commandId: "workbench.action.chat.triggerSetup" }];
    } else if (entitlement === 5 /* Free */) {
      description = localize(11065, null);
      actions = [{ kind: "command" /* Command */, label: localize(11076, null), commandId: "workbench.action.chat.upgradePlan" }];
    } else if (this._isManagedPlan(entitlement)) {
      description = localize(11067, null);
      actions = [];
    } else if (hadOverage) {
      description = localize(11066, null);
      actions = [{ kind: "command" /* Command */, label: localize(11052, null), commandId: "workbench.action.chat.manageAdditionalSpend" }];
    } else {
      description = localize(11064, null);
      actions = [{ kind: "command" /* Command */, label: localize(11053, null), commandId: "workbench.action.chat.manageAdditionalSpend" }];
    }
    this._setNotification({
      id: QUOTA_NOTIFICATION_ID,
      telemetryId: "quotaExhausted",
      severity: 0 /* Info */,
      message: localize(11068, null),
      description,
      actions,
      dismissible: true,
      autoDismissOnMessage: true
    });
  }
  // --- Overage notification -----------------------------------------------
  _showOverageActivationNotification() {
    this._showingExhausted = true;
    this._setNotification({
      id: QUOTA_NOTIFICATION_ID,
      telemetryId: "overageActivation",
      severity: 0 /* Info */,
      message: localize(11070, null),
      description: localize(11069, null),
      actions: [],
      dismissible: true,
      autoDismissOnMessage: true
    });
  }
  // --- Quota approaching --------------------------------------------------
  _showQuotaApproachingWarning(warning) {
    this._showingExhausted = false;
    this._activeQuotaWarning = warning;
    const entitlement = this._chatEntitlementService.entitlement;
    const quotas = this._chatEntitlementService.quotas;
    let description;
    let actions;
    if (entitlement === 1 /* Unknown */ || entitlement === 5 /* Free */) {
      description = localize(11056, null);
      actions = [{ kind: "command" /* Command */, label: localize(11077, null), commandId: "workbench.action.chat.upgradePlan" }];
    } else if (this._isManagedPlan(entitlement)) {
      description = localize(11057, null);
      actions = [];
    } else if (quotas.additionalUsageEnabled) {
      description = localize(11058, null);
      actions = [];
    } else {
      description = localize(11055, null);
      const manageBudgetAction = {
        kind: "command" /* Command */,
        label: localize(11054, null),
        commandId: "workbench.action.chat.manageAdditionalSpend"
      };
      actions = [manageBudgetAction];
      const defaultBody = { description, actions };
      const autoBody = {
        description: localize(11059, null),
        actions: [{ kind: "switchToModel" /* SwitchToModel */, label: localize(11075, null), matchesModel: isAutoLanguageModel }]
      };
      const resolveBody = (context2) => {
        if (!isAutoEligible(context2)) {
          return defaultBody;
        }
        this._requestSwitchToAutoTreatment();
        return this._switchToAutoTreatment === true ? autoBody : defaultBody;
      };
      this._setQuotaApproachingNotification(warning, description, actions, resolveBody);
      return;
    }
    this._setQuotaApproachingNotification(warning, description, actions);
  }
  _setQuotaApproachingNotification(warning, description, actions, resolveBody) {
    this._setNotification({
      id: QUOTA_NOTIFICATION_ID,
      telemetryId: `quotaApproaching${warning.threshold}`,
      severity: 0 /* Info */,
      message: localize(11060, null, warning.percentUsed),
      description,
      actions,
      resolveBody,
      dismissible: true,
      autoDismissOnMessage: true
    });
  }
  // --- Rate-limit warning -------------------------------------------------
  _computeRateLimitWarning() {
    const quotas = this._chatEntitlementService.quotas;
    const sessionResult = this._checkRateLimitCrossing(quotas.sessionRateLimit, this._prevSessionPercentUsed);
    this._prevSessionPercentUsed = sessionResult.newPrev;
    const weeklyResult = this._checkRateLimitCrossing(quotas.weeklyRateLimit, this._prevWeeklyPercentUsed);
    this._prevWeeklyPercentUsed = weeklyResult.newPrev;
    if (sessionResult.warning) {
      return { ...sessionResult.warning, type: "session" };
    }
    if (weeklyResult.warning) {
      return { ...weeklyResult.warning, type: "weekly" };
    }
    return void 0;
  }
  _checkRateLimitCrossing(snapshot, prevPercentUsed) {
    if (!snapshot || snapshot.unlimited) {
      return { newPrev: void 0 };
    }
    const percentUsed = 100 - snapshot.percentRemaining;
    const crossed = this._findCrossedThreshold(percentUsed, prevPercentUsed);
    return {
      newPrev: percentUsed,
      warning: crossed !== void 0 ? { percentUsed: Math.floor(percentUsed), resetDate: snapshot.resetDate } : void 0
    };
  }
  _showRateLimitWarning(warning) {
    this._showingExhausted = false;
    const message = warning.type === "session" ? localize(11072, null, warning.percentUsed) : localize(11073, null, warning.percentUsed);
    const description = warning.resetDate ? localize(11071, null, this._formatResetDate(warning.resetDate)) : void 0;
    this._setNotification({
      id: QUOTA_NOTIFICATION_ID,
      telemetryId: warning.type === "session" ? "sessionRateLimitWarning" : "weeklyRateLimitWarning",
      severity: 0 /* Info */,
      message,
      description,
      actions: [],
      dismissible: true,
      autoDismissOnMessage: true
    });
  }
  // --- Helpers ------------------------------------------------------------
  _clearInactiveQuotaWarning(eligible) {
    const warning = this._getActiveQuotaWarning();
    const snapshot = this._getRelevantSnapshot();
    if (warning && (!eligible || snapshot && (snapshot.unlimited || 100 - snapshot.percentRemaining < warning.threshold))) {
      this._hideNotification();
    }
  }
  _getActiveQuotaWarning() {
    const warning = this._activeQuotaWarning;
    const notification = this._chatInputNotificationService.getActiveNotification((candidate) => candidate.id === QUOTA_NOTIFICATION_ID);
    return warning && notification?.telemetryId === `quotaApproaching${warning.threshold}` ? warning : void 0;
  }
  _isManagedPlan(entitlement) {
    return entitlement === 8 /* Business */ || entitlement === 9 /* Enterprise */;
  }
  _isManagedPlanBlocked() {
    const snapshot = this._chatEntitlementService.quotas.premiumChat;
    return !!snapshot && snapshot.hasQuota === false;
  }
  _showManagedPlanBlockedNotification() {
    this._showingExhausted = true;
    this._setNotification({
      id: QUOTA_NOTIFICATION_ID,
      telemetryId: "managedPlanBlocked",
      severity: 0 /* Info */,
      message: localize(11062, null),
      description: localize(11061, null),
      actions: [],
      dismissible: true,
      autoDismissOnMessage: true
    });
  }
  _formatResetDate(isoDate) {
    const resetDate = new Date(isoDate);
    const now = /* @__PURE__ */ new Date();
    const includeYear = resetDate.getFullYear() !== now.getFullYear();
    return safeIntl.DateTimeFormat(
      void 0,
      includeYear ? { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" } : { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }
    ).value.format(resetDate);
  }
  _setNotification(notification) {
    this._chatInputNotificationService.setNotification({ ...notification, when: isQuotaNotificationVisible });
  }
  _hideNotification() {
    this._showingExhausted = false;
    this._chatInputNotificationService.deleteNotification(QUOTA_NOTIFICATION_ID);
  }
  // --- Exhausted dismissal persistence ------------------------------------
  /**
   * Returns `true` only when there is an actual quota snapshot indicating that
   * credit is available (i.e. quota is not used up). Returns `false` when no
   * snapshot has loaded yet, so the transient "no data" state at startup/reload
   * is not mistaken for recovery.
   */
  _isQuotaKnownAvailable() {
    return !!this._getRelevantSnapshot() && !this._isQuotaUsedUp();
  }
  _isExhaustedDismissed() {
    return this._storageService.getBoolean(QUOTA_EXHAUSTED_DISMISSED_STORAGE_KEY, -1 /* APPLICATION */, false);
  }
  _setExhaustedDismissed() {
    this._storageService.store(QUOTA_EXHAUSTED_DISMISSED_STORAGE_KEY, true, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  _clearExhaustedDismissed() {
    this._storageService.remove(QUOTA_EXHAUSTED_DISMISSED_STORAGE_KEY, -1 /* APPLICATION */);
  }
};

ChatQuotaNotificationContribution = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IWorkbenchAssignmentService),
  __decorateParam(4, ILogService)
], ChatQuotaNotificationContribution);
export { isAutoEligible, isQuotaNotificationVisible, QUOTA_NOTIFICATION_ID, THRESHOLDS, SWITCH_TO_AUTO_TREATMENT_NAME, QUOTA_EXHAUSTED_DISMISSED_STORAGE_KEY, ChatQuotaNotificationContribution };
