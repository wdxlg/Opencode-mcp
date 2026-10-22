// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputNotificationService.ts
import { isEqual2 } from "./module-0034.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputNotificationService.ts
function matchesModelIdentifier(identifier2) {
  return (model) => model.identifier === identifier2;
}

function evaluateChatInputNotificationPredicate(predicate, onError) {
  try {
    return predicate();
  } catch (error) {
    onError(error);
    return false;
  }
}

function resolveChatInputNotificationBody(notification, context2, onError) {
  if (!evaluateChatInputNotificationPredicate(() => notification.when?.(context2) ?? true, onError)) {
    return void 0;
  }
  if (!notification.resolveBody) {
    return notification;
  }
  try {
    return notification.resolveBody(context2);
  } catch (error) {
    onError(error);
    return notification;
  }
}

function getChatInputNotificationAnnouncementSignature(notification, body) {
  const message = typeof notification.message === "string" ? notification.message : notification.message.value;
  const description = typeof body.description === "string" ? body.description : body.description?.value ?? "";
  return `${notification.id}\0${message}\0${description}`;
}

function isChatInputNotificationApplicableToSessionType(notification, sessionType) {
  return !notification.sessionTypes?.length || !!sessionType && notification.sessionTypes.includes(sessionType);
}

function isChatInputNotificationApplicableToSession(notification, sessionType, sessionResource) {
  return isChatInputNotificationApplicableToSessionType(notification, sessionType) && (!notification.sessionResources?.length || !!sessionResource && notification.sessionResources.some((resource) => isEqual2(resource, sessionResource)));
}

var IChatInputNotificationService = createDecorator("chatInputNotificationService");

var ChatInputNotificationService = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._notifications = /* @__PURE__ */ new Map();
    this._dismissed = /* @__PURE__ */ new Set();
    /** Insertion order tracking — higher index = more recently set. */
    this._insertionOrder = /* @__PURE__ */ new Map();
    this._insertionCounter = 0;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidDismiss = this._register(new Emitter());
    this.onDidDismiss = this._onDidDismiss.event;
    this._announcedById = /* @__PURE__ */ new Map();
  }
  setNotification(notification) {
    this._notifications.set(notification.id, notification);
    this._dismissed.delete(notification.id);
    this._insertionOrder.set(notification.id, this._insertionCounter++);
    this._fireDidChange();
  }
  refresh() {
    this._fireDidChange();
  }
  deleteNotification(id2) {
    if (this._notifications.delete(id2)) {
      this._dismissed.delete(id2);
      this._insertionOrder.delete(id2);
      this._announcedById.delete(id2);
      this._fireDidChange();
    }
  }
  dismissNotification(id2) {
    if (this._notifications.has(id2) && !this._dismissed.has(id2)) {
      this._dismissed.add(id2);
      this._announcedById.delete(id2);
      this._onDidDismiss.fire(id2);
      this._fireDidChange();
    }
  }
  getActiveNotification(filter2) {
    let best;
    let bestOrder = -1;
    for (const notification of this._notifications.values()) {
      if (this._dismissed.has(notification.id)) {
        continue;
      }
      if (filter2 && !filter2(notification)) {
        continue;
      }
      const order = this._insertionOrder.get(notification.id) ?? 0;
      if (!best || notification.severity > best.severity || notification.severity === best.severity && order > bestOrder) {
        best = notification;
        bestOrder = order;
      }
    }
    return best;
  }
  handleMessageSent(context2) {
    let changed = false;
    for (const notification of this._notifications.values()) {
      if (!notification.autoDismissOnMessage || this._dismissed.has(notification.id)) {
        continue;
      }
      if (context2 && !isChatInputNotificationApplicableToSession(notification, context2.sessionType, context2.sessionResource)) {
        continue;
      }
      if (context2 && !evaluateChatInputNotificationPredicate(
        () => notification.when?.(context2) ?? true,
        (error) => this._logService.error("[ChatInputNotificationService] Failed to evaluate notification", error)
      )) {
        continue;
      }
      this._dismissed.add(notification.id);
      this._announcedById.delete(notification.id);
      changed = true;
    }
    if (changed) {
      this._fireDidChange();
    }
  }
  _fireDidChange() {
    this._onDidChange.fire();
  }
  announceRendered(notification, body) {
    if (!notification) {
      return;
    }
    const resolvedBody = body ?? notification;
    const signature = getChatInputNotificationAnnouncementSignature(notification, resolvedBody);
    if (this._announcedById.get(notification.id) === signature) {
      return;
    }
    this._announcedById.set(notification.id, signature);
    const message = renderAsPlaintext(notification.message);
    const description = resolvedBody.description ? renderAsPlaintext(resolvedBody.description) : "";
    const text2 = description ? `${message}. ${description}` : message;
    status(text2);
  }
};

ChatInputNotificationService = __decorateClass([
  __decorateParam(0, ILogService)
], ChatInputNotificationService);

registerSingleton(IChatInputNotificationService, ChatInputNotificationService, 1 /* Delayed */);

function readDismissedNotificationIds(storageService, key3) {
  const raw = storageService.get(key3, -1 /* APPLICATION */);
  try {
    const parsed = raw ? JSON.parse(raw) : void 0;
    return new Set(Array.isArray(parsed) ? parsed.filter((value2) => typeof value2 === "string") : []);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}

function addDismissedNotificationId(storageService, key3, id2) {
  const dismissed = readDismissedNotificationIds(storageService, key3);
  if (dismissed.has(id2)) {
    return;
  }
  dismissed.add(id2);
  storageService.store(key3, JSON.stringify([...dismissed]), -1 /* APPLICATION */, 0 /* USER */);
}
export { matchesModelIdentifier, evaluateChatInputNotificationPredicate, resolveChatInputNotificationBody, getChatInputNotificationAnnouncementSignature, isChatInputNotificationApplicableToSessionType, isChatInputNotificationApplicableToSession, readDismissedNotificationIds, addDismissedNotificationId, IChatInputNotificationService, ChatInputNotificationService };
