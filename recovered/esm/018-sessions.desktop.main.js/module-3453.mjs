// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsActions.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { CLEAR_ALL_NOTIFICATIONS, CLEAR_NOTIFICATION, COLLAPSE_NOTIFICATION, EXPAND_NOTIFICATION, HIDE_NOTIFICATIONS_CENTER, TOGGLE_DO_NOT_DISTURB_MODE, TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE } from "./module-3451.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsActions.ts
var clearIcon2 = registerIcon("notifications-clear", Codicon.close, localize(6788, null));

var clearAllIcon = registerIcon("notifications-clear-all", Codicon.clearAll, localize(6787, null));

var hideIcon = registerIcon("notifications-hide", Codicon.chevronDown, localize(6803, null));

var hideUpIcon = registerIcon("notifications-hide-up", Codicon.chevronUp, localize(6805, null));

var expandIcon = registerIcon("notifications-expand", Codicon.chevronUp, localize(6801, null));

var expandDownIcon = registerIcon("notifications-expand-down", Codicon.chevronDown, localize(6800, null));

var collapseIcon2 = registerIcon("notifications-collapse", Codicon.chevronDown, localize(6791, null));

var collapseUpIcon = registerIcon("notifications-collapse-up", Codicon.chevronUp, localize(6793, null));

var configureIcon = registerIcon("notifications-configure", Codicon.gear, localize(6795, null));

var doNotDisturbIcon = registerIcon("notifications-do-not-disturb", Codicon.bellSlash, localize(6799, null));

var positionIcon = registerIcon("notifications-position", Codicon.arrowSwap, localize(6806, null));

function getNotificationExpandIcon(position2) {
  return position2 === "top-right" /* TOP_RIGHT */ ? expandDownIcon : expandIcon;
}

function getNotificationCollapseIcon(position2) {
  return position2 === "top-right" /* TOP_RIGHT */ ? collapseUpIcon : collapseIcon2;
}

var ClearNotificationAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(clearIcon2));
    this.commandService = commandService;
  }
  static {
    this.ID = CLEAR_NOTIFICATION;
  }
  static {
    this.LABEL = localize(6789, null);
  }
  async run(notification) {
    this.commandService.executeCommand(CLEAR_NOTIFICATION, notification);
  }
};

ClearNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ClearNotificationAction);

var ClearAllNotificationsAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(clearAllIcon));
    this.commandService = commandService;
  }
  static {
    this.ID = CLEAR_ALL_NOTIFICATIONS;
  }
  static {
    this.LABEL = localize(6790, null);
  }
  async run() {
    this.commandService.executeCommand(CLEAR_ALL_NOTIFICATIONS);
  }
};

ClearAllNotificationsAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ClearAllNotificationsAction);

var ToggleDoNotDisturbAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(doNotDisturbIcon));
    this.commandService = commandService;
  }
  static {
    this.ID = TOGGLE_DO_NOT_DISTURB_MODE;
  }
  static {
    this.LABEL = localize(6807, null);
  }
  async run() {
    this.commandService.executeCommand(TOGGLE_DO_NOT_DISTURB_MODE);
  }
};

ToggleDoNotDisturbAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ToggleDoNotDisturbAction);

var ToggleDoNotDisturbBySourceAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3);
    this.commandService = commandService;
  }
  static {
    this.ID = TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE;
  }
  static {
    this.LABEL = localize(6808, null);
  }
  async run() {
    this.commandService.executeCommand(TOGGLE_DO_NOT_DISTURB_MODE_BY_SOURCE);
  }
};

ToggleDoNotDisturbBySourceAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ToggleDoNotDisturbBySourceAction);

var ConfigureDoNotDisturbAction = class extends Action {
  static {
    this.ID = "workbench.action.configureDoNotDisturbMode";
  }
  static {
    this.LABEL = localize(6794, null);
  }
  constructor(id2, label3) {
    super(id2, label3, ThemeIcon.asClassName(doNotDisturbIcon));
  }
};

var ConfigureNotificationsPositionAction = class extends Action {
  static {
    this.ID = "workbench.action.configureNotificationsPosition";
  }
  static {
    this.LABEL = localize(6797, null);
  }
  constructor(id2, label3) {
    super(id2, label3, ThemeIcon.asClassName(positionIcon));
  }
};

var HideNotificationsCenterAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(hideIcon));
    this.commandService = commandService;
  }
  static {
    this.ID = HIDE_NOTIFICATIONS_CENTER;
  }
  static {
    this.LABEL = localize(6804, null);
  }
  async run() {
    this.commandService.executeCommand(HIDE_NOTIFICATIONS_CENTER);
  }
};

HideNotificationsCenterAction = __decorateClass([
  __decorateParam(2, ICommandService)
], HideNotificationsCenterAction);

var ExpandNotificationAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(expandIcon));
    this.commandService = commandService;
  }
  static {
    this.ID = EXPAND_NOTIFICATION;
  }
  static {
    this.LABEL = localize(6802, null);
  }
  async run(notification) {
    this.commandService.executeCommand(EXPAND_NOTIFICATION, notification);
  }
};

ExpandNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], ExpandNotificationAction);

var CollapseNotificationAction = class extends Action {
  constructor(id2, label3, commandService) {
    super(id2, label3, ThemeIcon.asClassName(collapseIcon2));
    this.commandService = commandService;
  }
  static {
    this.ID = COLLAPSE_NOTIFICATION;
  }
  static {
    this.LABEL = localize(6792, null);
  }
  async run(notification) {
    this.commandService.executeCommand(COLLAPSE_NOTIFICATION, notification);
  }
};

CollapseNotificationAction = __decorateClass([
  __decorateParam(2, ICommandService)
], CollapseNotificationAction);

var ConfigureNotificationAction = class extends Action {
  constructor(id2, label3, notification) {
    super(id2, label3, ThemeIcon.asClassName(configureIcon));
    this.notification = notification;
  }
  static {
    this.ID = "workbench.action.configureNotification";
  }
  static {
    this.LABEL = localize(6796, null);
  }
};

var CopyNotificationMessageAction = class extends Action {
  constructor(id2, label3, clipboardService) {
    super(id2, label3);
    this.clipboardService = clipboardService;
  }
  static {
    this.ID = "workbench.action.copyNotificationMessage";
  }
  static {
    this.LABEL = localize(6798, null);
  }
  run(notification) {
    return this.clipboardService.writeText(notification.message.raw);
  }
};

CopyNotificationMessageAction = __decorateClass([
  __decorateParam(2, IClipboardService)
], CopyNotificationMessageAction);
export { getNotificationExpandIcon, getNotificationCollapseIcon, clearIcon2, clearAllIcon, hideIcon, hideUpIcon, expandIcon, expandDownIcon, collapseIcon2, collapseUpIcon, configureIcon, doNotDisturbIcon, positionIcon, ClearNotificationAction, ClearAllNotificationsAction, ToggleDoNotDisturbAction, ToggleDoNotDisturbBySourceAction, ConfigureDoNotDisturbAction, ConfigureNotificationsPositionAction, HideNotificationsCenterAction, ExpandNotificationAction, CollapseNotificationAction, ConfigureNotificationAction, CopyNotificationMessageAction };
