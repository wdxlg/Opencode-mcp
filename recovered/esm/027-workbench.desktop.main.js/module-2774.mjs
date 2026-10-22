// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/expNotification/chatExpNotificationContribution.ts
import { Disposable } from "./module-0012.mjs";
import { ChatAIDisabledSettingId } from "./module-0950.mjs";
import { matchesChatExpNotification, parseChatExpNotifications } from "./module-2773.mjs";
import { IChatInputNotificationService, addDismissedNotificationId, readDismissedNotificationIds } from "./module-1461.mjs";
import { modelSelectorAliases } from "./module-2214.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/expNotification/chatExpNotificationContribution.ts
var CHAT_EXP_NOTIFICATION_TREATMENT = "chatNotifications";

var DISMISSED_STORAGE_KEY = "chat.dismissedExpNotificationIds";

var ID_PREFIX = "chat.expNotification.";

var ChatExpNotificationContribution = class extends Disposable {
  constructor(_assignmentService, _notificationService, _chatSessionsService, _configurationService, _entitlementService, _storageService, _logService) {
    super();
    this._assignmentService = _assignmentService;
    this._notificationService = _notificationService;
    this._chatSessionsService = _chatSessionsService;
    this._configurationService = _configurationService;
    this._entitlementService = _entitlementService;
    this._storageService = _storageService;
    this._logService = _logService;
    /** Registered payload ids, each mapped to the entry text that produced it. */
    this._registered = /* @__PURE__ */ new Map();
    this._notifications = [];
    /** Increments on every refresh so a slow in-flight resolution cannot overwrite a newer one. */
    this._generation = 0;
    void this._resolve();
    this._register(this._assignmentService.onDidRefetchAssignments(() => void this._resolve()));
    this._register(this._notificationService.onDidDismiss((id2) => this._handleDismissed(id2)));
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, DISMISSED_STORAGE_KEY, this._store)(() => this._update()));
    this._register(this._entitlementService.onDidChangeSentiment(() => this._notificationService.refresh()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(ChatAIDisabledSettingId)) {
        this._notificationService.refresh();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.chatExpNotification";
  }
  async _resolve() {
    const generation = ++this._generation;
    let payload;
    try {
      payload = await this._assignmentService.getTreatment(CHAT_EXP_NOTIFICATION_TREATMENT);
    } catch (err) {
      this._logService.trace(`[chatExpNotification] failed to resolve treatment: ${err}`);
      return;
    }
    if (generation !== this._generation) {
      return;
    }
    const result = payload === void 0 ? void 0 : parseChatExpNotifications(payload);
    if (result?.error) {
      this._logService.warn(`[chatExpNotification] ignoring invalid payload: ${result.error}`);
    }
    this._notifications = result?.notifications ?? [];
    this._update();
  }
  _update() {
    const dismissed = readDismissedNotificationIds(this._storageService, DISMISSED_STORAGE_KEY);
    const active = this._notifications.filter((notification) => !dismissed.has(notification.id));
    for (const id2 of [...this._registered.keys()]) {
      if (!active.some((notification) => notification.id === id2)) {
        this._notificationService.deleteNotification(ID_PREFIX + id2);
        this._registered.delete(id2);
      }
    }
    for (const { match: match2, signature, ...notification } of active) {
      if (this._registered.get(notification.id) === signature) {
        continue;
      }
      this._registered.set(notification.id, signature);
      this._notificationService.setNotification({
        ...notification,
        id: ID_PREFIX + notification.id,
        when: (context2) => this._matches(match2, context2)
      });
    }
  }
  _matches(match2, context2) {
    if (this._configurationService.getValue(ChatAIDisabledSettingId) === true || this._entitlementService.sentiment.hidden) {
      return false;
    }
    const model = context2.modelState.currentModel;
    return matchesChatExpNotification(match2, {
      sessionType: context2.sessionType,
      harness: context2.sessionType ? this._chatSessionsService.getChatSessionContribution(context2.sessionType)?.agentHostProviderId : void 0,
      selectedModelId: model?.identifier,
      selectedModelAliases: model && modelSelectorAliases(model.metadata)
    });
  }
  _handleDismissed(id2) {
    if (!id2.startsWith(ID_PREFIX)) {
      return;
    }
    addDismissedNotificationId(this._storageService, DISMISSED_STORAGE_KEY, id2.slice(ID_PREFIX.length));
    this._update();
  }
};

ChatExpNotificationContribution = __decorateClass([
  __decorateParam(0, IWorkbenchAssignmentService),
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, IChatSessionsService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IChatEntitlementService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ILogService)
], ChatExpNotificationContribution);
export { CHAT_EXP_NOTIFICATION_TREATMENT, DISMISSED_STORAGE_KEY, ID_PREFIX, ChatExpNotificationContribution };
