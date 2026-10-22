// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatPromoNotification.ts
import { Disposable } from "./module-0012.mjs";
import { IChatInputNotificationService, addDismissedNotificationId, matchesModelIdentifier, readDismissedNotificationIds } from "./module-1460.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0968.mjs";
import { localChatSessionType } from "./module-0961.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/chatPromoNotification.ts
var PROMO_NOTIFICATION_ID = "copilot.promoNotification";

var DISMISSED_PROMOS_STORAGE_KEY = "chat.dismissedPromoIds";

function isPromoVisible(context2) {
  return context2.deferredNotificationsEnabled && !context2.isTransientChat && !context2.sessionStarted;
}

var ChatPromoNotificationContribution = class extends Disposable {
  constructor(_languageModelsService, _chatInputNotificationService, _storageService) {
    super();
    this._languageModelsService = _languageModelsService;
    this._chatInputNotificationService = _chatInputNotificationService;
    this._storageService = _storageService;
    this._shownNotifications = /* @__PURE__ */ new Map();
    this._register(this._languageModelsService.onDidChangeLanguageModels(() => this._update()));
    this._register(this._chatInputNotificationService.onDidDismiss((id2) => {
      const promoId = this._shownNotifications.get(id2)?.promoId;
      if (promoId) {
        addDismissedNotificationId(this._storageService, DISMISSED_PROMOS_STORAGE_KEY, promoId);
        this._update();
      }
    }));
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, DISMISSED_PROMOS_STORAGE_KEY, this._store)(() => this._update()));
    this._update();
  }
  static {
    this.ID = "workbench.contrib.chatPromoNotification";
  }
  _update() {
    const dismissed = readDismissedNotificationIds(this._storageService, DISMISSED_PROMOS_STORAGE_KEY);
    const modelIds = this._languageModelsService.getLanguageModelIds();
    const promoByHarness = /* @__PURE__ */ new Map();
    for (const id2 of modelIds) {
      const meta = this._languageModelsService.lookupLanguageModel(id2);
      if (!meta || !ILanguageModelChatMetadata.hasPromoBanner(meta) || dismissed.has(meta.promo.id)) {
        continue;
      }
      const harness = meta.targetChatSessionType ?? localChatSessionType;
      const current = promoByHarness.get(harness);
      if (!current || !ILanguageModelChatMetadata.hasPromoDiscount(current.metadata) && ILanguageModelChatMetadata.hasPromoDiscount(meta)) {
        promoByHarness.set(harness, { identifier: id2, metadata: meta });
      }
    }
    const desired = /* @__PURE__ */ new Set();
    for (const [harness, model] of promoByHarness) {
      const promo = model.metadata.promo;
      const notificationId = `${PROMO_NOTIFICATION_ID}.${harness}`;
      desired.add(notificationId);
      const shownNotification = this._shownNotifications.get(notificationId);
      if (shownNotification?.modelIdentifier === model.identifier && shownNotification.promoId === promo.id) {
        continue;
      }
      this._shownNotifications.set(notificationId, { promoId: promo.id, modelIdentifier: model.identifier });
      const description = ILanguageModelChatMetadata.getPromoEndsAtLabel(promo.endsAt);
      const action = {
        label: localize(11051, null, model.metadata.name),
        kind: "switchToModel" /* SwitchToModel */,
        matchesModel: matchesModelIdentifier(model.identifier)
      };
      this._chatInputNotificationService.setNotification({
        id: notificationId,
        telemetryId: promo.id,
        severity: 0 /* Info */,
        message: promo.message,
        description,
        actions: [action],
        when: isPromoVisible,
        dismissible: true,
        autoDismissOnMessage: false,
        sessionTypes: [harness]
      });
    }
    for (const notificationId of [...this._shownNotifications.keys()]) {
      if (!desired.has(notificationId)) {
        this._chatInputNotificationService.deleteNotification(notificationId);
        this._shownNotifications.delete(notificationId);
      }
    }
  }
};

ChatPromoNotificationContribution = __decorateClass([
  __decorateParam(0, ILanguageModelsService),
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, IStorageService)
], ChatPromoNotificationContribution);
export { isPromoVisible, PROMO_NOTIFICATION_ID, DISMISSED_PROMOS_STORAGE_KEY, ChatPromoNotificationContribution };
