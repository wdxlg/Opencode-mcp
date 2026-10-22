// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadChatInputNotification.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";


// src/vs/workbench/api/browser/mainThreadChatInputNotification.ts
var MainThreadChatInputNotification = class extends Disposable {
  constructor(_extHostContext, _chatInputNotificationService) {
    super();
    this._chatInputNotificationService = _chatInputNotificationService;
  }
  $setNotification(notification) {
    this._chatInputNotificationService.setNotification({
      id: notification.id,
      severity: notification.severity,
      message: notification.message,
      description: notification.description,
      actions: notification.actions.map((action) => ({ ...action, kind: "command" /* Command */ })),
      dismissible: notification.dismissible,
      autoDismissOnMessage: notification.autoDismissOnMessage,
      sessionTypes: notification.sessionTypes
    });
  }
  $disposeNotification(id2) {
    this._chatInputNotificationService.deleteNotification(id2);
  }
};

MainThreadChatInputNotification = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadChatInputNotification),
  __decorateParam(1, IChatInputNotificationService)
], MainThreadChatInputNotification);
export { MainThreadChatInputNotification };
