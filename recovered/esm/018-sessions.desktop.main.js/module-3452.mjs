// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationAccessibleView.ts
import { NotificationFocusedContext } from "./module-0950.mjs";
import { AccessibleContentProvider, IAccessibleViewService } from "./module-0799.mjs";
import { IListService, WorkbenchList } from "./module-0636.mjs";
import { ICommandService } from "./module-0087.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { getNotificationFromContext } from "./module-3451.mjs";
import { withSeverityPrefix } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/browser/parts/notifications/notificationAccessibleView.ts
var NotificationAccessibleView = class {
  constructor() {
    this.priority = 90;
    this.name = "notifications";
    this.when = NotificationFocusedContext;
    this.type = "view" /* View */;
  }
  getProvider(accessor) {
    const accessibleViewService = accessor.get(IAccessibleViewService);
    const listService = accessor.get(IListService);
    const commandService = accessor.get(ICommandService);
    const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
    function getProvider() {
      const notification = getNotificationFromContext(listService);
      if (!notification) {
        return;
      }
      commandService.executeCommand("notifications.showList");
      let notificationIndex;
      const list2 = listService.lastFocusedList;
      if (list2 instanceof WorkbenchList) {
        notificationIndex = list2.indexOf(notification);
      }
      if (notificationIndex === void 0) {
        return;
      }
      function focusList() {
        commandService.executeCommand("notifications.showList");
        if (list2 && notificationIndex !== void 0) {
          list2.domFocus();
          try {
            list2.setFocus([notificationIndex]);
          } catch {
          }
        }
      }
      function getContentForNotification() {
        const notification2 = getNotificationFromContext(listService);
        const message = notification2?.message.original.toString();
        if (!notification2 || !message) {
          return;
        }
        return withSeverityPrefix(notification2.source ? localize(6786, null, message, notification2.source) : message, notification2.severity);
      }
      const content = getContentForNotification();
      if (!content) {
        return;
      }
      notification.onDidClose(() => accessibleViewService.next());
      return new AccessibleContentProvider(
        "notification" /* Notification */,
        { type: "view" /* View */ },
        () => content,
        () => focusList(),
        "accessibility.verbosity.notification",
        void 0,
        getActionsFromNotification(notification, accessibilitySignalService),
        () => {
          if (!list2) {
            return;
          }
          focusList();
          list2.focusNext();
          return getContentForNotification();
        },
        () => {
          if (!list2) {
            return;
          }
          focusList();
          list2.focusPrevious();
          return getContentForNotification();
        }
      );
    }
    return getProvider();
  }
};

function getActionsFromNotification(notification, accessibilitySignalService) {
  let actions = void 0;
  if (notification.actions) {
    actions = [];
    if (notification.actions.primary) {
      actions.push(...notification.actions.primary);
    }
    if (notification.actions.secondary) {
      actions.push(...notification.actions.secondary);
    }
  }
  if (actions) {
    for (const action of actions) {
      action.class = ThemeIcon.asClassName(Codicon.bell);
      const initialAction = action.run;
      action.run = () => {
        initialAction();
        notification.close();
      };
    }
  }
  const manageExtension = actions?.find((a) => a.label.includes("Manage Extension"));
  if (manageExtension) {
    manageExtension.class = ThemeIcon.asClassName(Codicon.gear);
  }
  if (actions) {
    actions.push({
      id: "clearNotification",
      label: localize(6785, null),
      tooltip: localize(6785, null),
      run: () => {
        notification.close();
        accessibilitySignalService.playSignal(AccessibilitySignal.clear);
      },
      enabled: true,
      class: ThemeIcon.asClassName(Codicon.clearAll)
    });
  }
  return actions;
}
export { getActionsFromNotification, NotificationAccessibleView };
