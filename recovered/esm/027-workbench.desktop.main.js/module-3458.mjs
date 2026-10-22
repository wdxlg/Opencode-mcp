// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsCommands.ts
import { isNotificationViewItem } from "./module-1493.mjs";
import { IListService, WorkbenchList } from "./module-0636.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { KeyChord } from "./module-0019.mjs";
import { NotificationFocusedContext, NotificationsCenterVisibleContext, NotificationsToastsVisibleContext } from "./module-0949.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsCommands.ts
var SHOW_NOTIFICATIONS_CENTER = "notifications.showList";

var HIDE_NOTIFICATIONS_CENTER = "notifications.hideList";

var TOGGLE_NOTIFICATIONS_CENTER = "notifications.toggleList";

var HIDE_NOTIFICATION_TOAST = "notifications.hideToasts";

var FOCUS_NOTIFICATION_TOAST = "notifications.focusToasts";

var FOCUS_NEXT_NOTIFICATION_TOAST = "notifications.focusNextToast";

var FOCUS_PREVIOUS_NOTIFICATION_TOAST = "notifications.focusPreviousToast";

var FOCUS_FIRST_NOTIFICATION_TOAST = "notifications.focusFirstToast";

var FOCUS_LAST_NOTIFICATION_TOAST = "notifications.focusLastToast";

var COLLAPSE_NOTIFICATION = "notification.collapse";

var EXPAND_NOTIFICATION = "notification.expand";

var ACCEPT_PRIMARY_ACTION_NOTIFICATION = "notification.acceptPrimaryAction";

var TOGGLE_NOTIFICATION = "notification.toggle";

var CLEAR_NOTIFICATION = "notification.clear";

var CLEAR_ALL_NOTIFICATIONS = "notifications.clearAll";

var TOGGLE_DO_NOT_DISTURB_MODE = "notifications.toggleDoNotDisturbMode";

var TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE = "notifications.toggleDoNotDisturbModeBySource";

function getNotificationFromContext(listService, context2) {
  if (isNotificationViewItem(context2)) {
    return context2;
  }
  const list2 = listService.lastFocusedList;
  if (list2 instanceof WorkbenchList) {
    let element = list2.getFocusedElements()[0];
    if (!isNotificationViewItem(element)) {
      if (list2.isDOMFocused()) {
        element = list2.element(0);
      }
    }
    if (isNotificationViewItem(element)) {
      return element;
    }
  }
  return void 0;
}

function registerNotificationCommands(center, toasts, model) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: SHOW_NOTIFICATIONS_CENTER,
    weight: 200 /* WorkbenchContrib */,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KeyN */),
    handler: () => {
      toasts.hide();
      center.show();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: HIDE_NOTIFICATIONS_CENTER,
    weight: 200 /* WorkbenchContrib */ + 50,
    when: NotificationsCenterVisibleContext,
    primary: 9 /* Escape */,
    handler: () => center.hide()
  });
  CommandsRegistry.registerCommand(TOGGLE_NOTIFICATIONS_CENTER, () => {
    if (center.isVisible) {
      center.hide();
    } else {
      toasts.hide();
      center.show();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: CLEAR_NOTIFICATION,
    weight: 200 /* WorkbenchContrib */,
    when: NotificationFocusedContext,
    primary: 20 /* Delete */,
    mac: {
      primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
    },
    handler: (accessor, args2) => {
      const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
      const notification = getNotificationFromContext(accessor.get(IListService), args2);
      if (notification && !notification.hasProgress) {
        notification.close();
        accessibilitySignalService.playSignal(AccessibilitySignal.clear);
      }
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: EXPAND_NOTIFICATION,
    weight: 200 /* WorkbenchContrib */,
    when: NotificationFocusedContext,
    primary: 17 /* RightArrow */,
    handler: (accessor, args2) => {
      const notification = getNotificationFromContext(accessor.get(IListService), args2);
      notification?.expand();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: ACCEPT_PRIMARY_ACTION_NOTIFICATION,
    weight: 200 /* WorkbenchContrib */ + 1,
    when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(NotificationFocusedContext, NotificationsToastsVisibleContext)),
    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */,
    handler: (accessor) => {
      const actionRunner = accessor.get(IInstantiationService).createInstance(NotificationActionRunner);
      const notification = getNotificationFromContext(accessor.get(IListService)) || model.notifications.at(0);
      if (!notification) {
        return;
      }
      const primaryAction = notification.actions?.primary ? notification.actions.primary.at(0) : void 0;
      if (!primaryAction) {
        return;
      }
      actionRunner.run(primaryAction, notification);
      notification.close();
      actionRunner.dispose();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: COLLAPSE_NOTIFICATION,
    weight: 200 /* WorkbenchContrib */,
    when: NotificationFocusedContext,
    primary: 15 /* LeftArrow */,
    handler: (accessor, args2) => {
      const notification = getNotificationFromContext(accessor.get(IListService), args2);
      notification?.collapse();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_NOTIFICATION,
    weight: 200 /* WorkbenchContrib */,
    when: NotificationFocusedContext,
    primary: 10 /* Space */,
    secondary: [3 /* Enter */],
    handler: (accessor) => {
      const notification = getNotificationFromContext(accessor.get(IListService));
      notification?.toggle();
    }
  });
  CommandsRegistry.registerCommand(HIDE_NOTIFICATION_TOAST, (accessor) => {
    toasts.hide();
  });
  KeybindingsRegistry.registerKeybindingRule({
    id: HIDE_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */ - 50,
    // lower when not focused (e.g. let editor suggest win over this command)
    when: NotificationsToastsVisibleContext,
    primary: 9 /* Escape */
  });
  KeybindingsRegistry.registerKeybindingRule({
    id: HIDE_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */ + 100,
    // higher when focused
    when: ContextKeyExpr.and(NotificationsToastsVisibleContext, NotificationFocusedContext),
    primary: 9 /* Escape */
  });
  CommandsRegistry.registerCommand(FOCUS_NOTIFICATION_TOAST, () => toasts.focus());
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_NEXT_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: 18 /* DownArrow */,
    handler: () => {
      toasts.focusNext();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_PREVIOUS_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: 16 /* UpArrow */,
    handler: () => {
      toasts.focusPrevious();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_FIRST_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: 11 /* PageUp */,
    secondary: [14 /* Home */],
    handler: () => {
      toasts.focusFirst();
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: FOCUS_LAST_NOTIFICATION_TOAST,
    weight: 200 /* WorkbenchContrib */,
    when: ContextKeyExpr.and(NotificationFocusedContext, NotificationsToastsVisibleContext),
    primary: 12 /* PageDown */,
    secondary: [13 /* End */],
    handler: () => {
      toasts.focusLast();
    }
  });
  CommandsRegistry.registerCommand(CLEAR_ALL_NOTIFICATIONS, () => center.clearAll());
  CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE, (accessor) => {
    const notificationService = accessor.get(INotificationService);
    notificationService.setFilter(notificationService.getFilter() === 1 /* ERROR */ ? 0 /* OFF */ : 1 /* ERROR */);
  });
  CommandsRegistry.registerCommand(TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, (accessor) => {
    const notificationService = accessor.get(INotificationService);
    const quickInputService = accessor.get(IQuickInputService);
    const sortedFilters = notificationService.getFilters().sort((a, b) => a.label.localeCompare(b.label));
    const disposables = new DisposableStore();
    const picker = disposables.add(quickInputService.createQuickPick());
    picker.items = sortedFilters.map((source) => ({
      id: source.id,
      label: source.label,
      tooltip: `${source.label} (${source.id})`,
      filter: source.filter
    }));
    picker.canSelectMany = true;
    picker.placeholder = localize(6827, null);
    picker.selectedItems = picker.items.filter((item) => item.filter === 0 /* OFF */);
    picker.show();
    disposables.add(picker.onDidAccept(async () => {
      for (const item of picker.items) {
        notificationService.setFilter({
          id: item.id,
          label: item.label,
          filter: picker.selectedItems.includes(item) ? 0 /* OFF */ : 1 /* ERROR */
        });
      }
      picker.hide();
    }));
    disposables.add(picker.onDidHide(() => disposables.dispose()));
  });
  const category11 = localize2(6823, "Notifications");
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: SHOW_NOTIFICATIONS_CENTER, title: localize2(6828, "Show Notifications"), category: category11 } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: HIDE_NOTIFICATIONS_CENTER, title: localize2(6822, "Hide Notifications"), category: category11 }, when: NotificationsCenterVisibleContext });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: CLEAR_ALL_NOTIFICATIONS, title: localize2(6820, "Clear All Notifications"), category: category11 } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: ACCEPT_PRIMARY_ACTION_NOTIFICATION, title: localize2(6819, "Accept Notification Primary Action"), category: category11 } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE, title: localize2(6829, "Toggle Do Not Disturb Mode"), category: category11 } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, title: localize2(6830, "Toggle Do Not Disturb Mode By Source..."), category: category11 } });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: { id: FOCUS_NOTIFICATION_TOAST, title: localize2(6821, "Focus Notification Toast"), category: category11 }, when: NotificationsToastsVisibleContext });
  MenuRegistry.appendMenuItem(MenuId.TitleBar, {
    command: {
      id: TOGGLE_NOTIFICATIONS_CENTER,
      title: localize(6831, null),
      icon: Codicon.bell
    },
    group: "navigation",
    order: 1e4,
    when: ContextKeyExpr.and(
      ContextKeyExpr.equals(`config.${"workbench.notifications.position" /* NOTIFICATIONS_POSITION */}`, "top-right" /* TOP_RIGHT */),
      ContextKeyExpr.equals(`config.${"workbench.notifications.showInTitleBar" /* NOTIFICATIONS_BUTTON */}`, true)
    )
  });
}

registerAction2(class SetNotificationsPositionBottomRight extends Action2 {
  constructor() {
    super({
      id: "workbench.action.setNotificationsPosition.bottomRight",
      title: localize2(6825, "Bottom Right"),
      toggled: ContextKeyExpr.equals(`config.${"workbench.notifications.position" /* NOTIFICATIONS_POSITION */}`, "bottom-right" /* BOTTOM_RIGHT */),
      menu: {
        id: MenuId.NotificationsCenterPositionMenu,
        order: 1
      }
    });
  }
  run(accessor) {
    accessor.get(IConfigurationService).updateValue("workbench.notifications.position" /* NOTIFICATIONS_POSITION */, "bottom-right" /* BOTTOM_RIGHT */);
  }
});

registerAction2(class SetNotificationsPositionBottomLeft extends Action2 {
  constructor() {
    super({
      id: "workbench.action.setNotificationsPosition.bottomLeft",
      title: localize2(6824, "Bottom Left"),
      toggled: ContextKeyExpr.equals(`config.${"workbench.notifications.position" /* NOTIFICATIONS_POSITION */}`, "bottom-left" /* BOTTOM_LEFT */),
      menu: {
        id: MenuId.NotificationsCenterPositionMenu,
        order: 2
      }
    });
  }
  run(accessor) {
    accessor.get(IConfigurationService).updateValue("workbench.notifications.position" /* NOTIFICATIONS_POSITION */, "bottom-left" /* BOTTOM_LEFT */);
  }
});

registerAction2(class SetNotificationsPositionTopRight extends Action2 {
  constructor() {
    super({
      id: "workbench.action.setNotificationsPosition.topRight",
      title: localize2(6826, "Top Right"),
      toggled: ContextKeyExpr.equals(`config.${"workbench.notifications.position" /* NOTIFICATIONS_POSITION */}`, "top-right" /* TOP_RIGHT */),
      menu: {
        id: MenuId.NotificationsCenterPositionMenu,
        order: 3
      }
    });
  }
  run(accessor) {
    accessor.get(IConfigurationService).updateValue("workbench.notifications.position" /* NOTIFICATIONS_POSITION */, "top-right" /* TOP_RIGHT */);
  }
});

var NotificationActionRunner = class extends ActionRunner {
  constructor(telemetryService, notificationService) {
    super();
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
  }
  async runAction(action, context2) {
    this.telemetryService.publicLog2("workbenchActionExecuted", { id: action.id, from: "message" });
    try {
      await super.runAction(action, context2);
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};

NotificationActionRunner = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService)
], NotificationActionRunner);
export { getNotificationFromContext, registerNotificationCommands, SHOW_NOTIFICATIONS_CENTER, HIDE_NOTIFICATIONS_CENTER, TOGGLE_NOTIFICATIONS_CENTER, HIDE_NOTIFICATION_TOAST, FOCUS_NOTIFICATION_TOAST, FOCUS_NEXT_NOTIFICATION_TOAST, FOCUS_PREVIOUS_NOTIFICATION_TOAST, FOCUS_FIRST_NOTIFICATION_TOAST, FOCUS_LAST_NOTIFICATION_TOAST, COLLAPSE_NOTIFICATION, EXPAND_NOTIFICATION, ACCEPT_PRIMARY_ACTION_NOTIFICATION, TOGGLE_NOTIFICATION, CLEAR_NOTIFICATION, CLEAR_ALL_NOTIFICATIONS, TOGGLE_DO_NOT_DISTURB_MODE, TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE, NotificationActionRunner };
