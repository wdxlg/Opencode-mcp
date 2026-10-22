// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsAlerts.ts
import { Disposable } from "./module-0012.mjs";
import { Severity2 } from "./module-0336.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsAlerts.ts
var NotificationsAlerts = class extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    for (const notification of model.notifications) {
      this.triggerAriaAlert(notification);
    }
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e) => this.onDidChangeNotification(e)));
  }
  onDidChangeNotification(e) {
    if (e.kind === 0 /* ADD */) {
      this.triggerAriaAlert(e.item);
      if (e.item.severity === Severity2.Error) {
        if (e.item.message.original instanceof Error) {
          console.error(e.item.message.original);
        } else {
          console.error(toErrorMessage(e.item.message.linkedText.toString(), true));
        }
      }
    }
  }
  triggerAriaAlert(notification) {
    if (notification.priority === 2 /* SILENT */) {
      return;
    }
    const listener = notification.onDidChangeContent((e) => {
      if (e.kind === 1 /* MESSAGE */) {
        this.doTriggerAriaAlert(notification);
      }
    });
    Event2.once(notification.onDidClose)(() => listener.dispose());
    this.doTriggerAriaAlert(notification);
  }
  doTriggerAriaAlert(notification) {
    let alertText;
    if (notification.severity === Severity2.Error) {
      alertText = localize(6809, null, notification.message.linkedText.toString());
    } else if (notification.severity === Severity2.Warning) {
      alertText = localize(6811, null, notification.message.linkedText.toString());
    } else {
      alertText = localize(6810, null, notification.message.linkedText.toString());
    }
    alert(alertText);
  }
};
export { NotificationsAlerts };
