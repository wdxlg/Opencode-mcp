// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsStatus.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { HIDE_NOTIFICATIONS_CENTER, SHOW_NOTIFICATIONS_CENTER } from "./module-3458.mjs";
import { getNotificationsPosition } from "./module-1493.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsStatus.ts
var NotificationsStatus = class extends Disposable {
  constructor(model, statusbarService, notificationService, configurationService) {
    super();
    this.model = model;
    this.statusbarService = statusbarService;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.newNotificationsCount = 0;
    this.isNotificationsCenterVisible = false;
    this.isNotificationsToastsVisible = false;
    this.updateNotificationsCenterStatusItem();
    if (model.statusMessage) {
      this.doSetStatusMessage(model.statusMessage);
    }
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e) => this.onDidChangeNotification(e)));
    this._register(this.model.onDidChangeStatusMessage((e) => this.onDidChangeStatusMessage(e)));
    this._register(this.notificationService.onDidChangeFilter(() => this.updateNotificationsCenterStatusItem()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.notifications.position" /* NOTIFICATIONS_POSITION */)) {
        this.updateNotificationsCenterStatusItem();
      }
    }));
  }
  onDidChangeNotification(e) {
    if (!this.isNotificationsCenterVisible) {
      if (e.kind === 0 /* ADD */) {
        this.newNotificationsCount++;
      } else if (e.kind === 3 /* REMOVE */ && this.newNotificationsCount > 0) {
        this.newNotificationsCount--;
      }
    }
    this.updateNotificationsCenterStatusItem();
  }
  updateNotificationsCenterStatusItem() {
    let notificationsInProgress = 0;
    if (!this.isNotificationsCenterVisible && !this.isNotificationsToastsVisible) {
      for (const notification of this.model.notifications) {
        if (notification.hasProgress) {
          notificationsInProgress++;
        }
      }
    }
    let statusProperties = {
      name: localize(6849, null),
      text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? "$(bell-dot)" : "$(bell)"}`,
      ariaLabel: localize(6849, null),
      command: this.isNotificationsCenterVisible ? HIDE_NOTIFICATIONS_CENTER : SHOW_NOTIFICATIONS_CENTER,
      tooltip: this.getTooltip(notificationsInProgress),
      showBeak: this.isNotificationsCenterVisible
    };
    if (this.notificationService.getFilter() === 1 /* ERROR */) {
      statusProperties = {
        ...statusProperties,
        text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? "$(bell-slash-dot)" : "$(bell-slash)"}`,
        ariaLabel: localize(6846, null),
        tooltip: localize(6847, null)
      };
    }
    const position2 = getNotificationsPosition(this.configurationService);
    if (position2 === "top-right" /* TOP_RIGHT */) {
      this.notificationsCenterStatusItem?.dispose();
      this.notificationsCenterStatusItem = void 0;
      this.currentAlignment = void 0;
    } else {
      const desiredAlignment = this.getDesiredAlignment();
      if (this.currentAlignment !== desiredAlignment) {
        this.notificationsCenterStatusItem?.dispose();
        this.notificationsCenterStatusItem = void 0;
        this.currentAlignment = desiredAlignment;
      }
      if (!this.notificationsCenterStatusItem) {
        this.notificationsCenterStatusItem = this.statusbarService.addEntry(
          statusProperties,
          "status.notifications",
          this.currentAlignment,
          this.currentAlignment === 0 /* LEFT */ ? Number.MAX_SAFE_INTEGER : Number.NEGATIVE_INFINITY
          // rightmost on the right side
        );
      } else {
        this.notificationsCenterStatusItem.update(statusProperties);
      }
    }
  }
  getDesiredAlignment() {
    const position2 = getNotificationsPosition(this.configurationService);
    switch (position2) {
      case "bottom-left" /* BOTTOM_LEFT */:
        return 0 /* LEFT */;
      case "top-right" /* TOP_RIGHT */:
      case "bottom-right" /* BOTTOM_RIGHT */:
      default:
        return 1 /* RIGHT */;
    }
  }
  getTooltip(notificationsInProgress) {
    if (this.isNotificationsCenterVisible) {
      return localize(6839, null);
    }
    if (this.model.notifications.length === 0) {
      return localize(6850, null);
    }
    if (notificationsInProgress === 0) {
      if (this.newNotificationsCount === 0) {
        return localize(6840, null);
      }
      if (this.newNotificationsCount === 1) {
        return localize(6844, null);
      }
      return localize(6842, null, this.newNotificationsCount);
    }
    if (this.newNotificationsCount === 0) {
      return localize(6841, null, notificationsInProgress);
    }
    if (this.newNotificationsCount === 1) {
      return localize(6845, null, notificationsInProgress);
    }
    return localize(6843, null, this.newNotificationsCount, notificationsInProgress);
  }
  update(isCenterVisible, isToastsVisible) {
    let updateNotificationsCenterStatusItem = false;
    if (this.isNotificationsCenterVisible !== isCenterVisible) {
      this.isNotificationsCenterVisible = isCenterVisible;
      this.newNotificationsCount = 0;
      updateNotificationsCenterStatusItem = true;
    }
    if (this.isNotificationsToastsVisible !== isToastsVisible) {
      this.isNotificationsToastsVisible = isToastsVisible;
      updateNotificationsCenterStatusItem = true;
    }
    if (updateNotificationsCenterStatusItem) {
      this.updateNotificationsCenterStatusItem();
    }
  }
  onDidChangeStatusMessage(e) {
    const statusItem = e.item;
    switch (e.kind) {
      // Show status notification
      case 0 /* ADD */:
        this.doSetStatusMessage(statusItem);
        break;
      // Hide status notification (if its still the current one)
      case 1 /* REMOVE */:
        if (this.currentStatusMessage && this.currentStatusMessage[0] === statusItem) {
          dispose(this.currentStatusMessage[1]);
          this.currentStatusMessage = void 0;
        }
        break;
    }
  }
  doSetStatusMessage(item) {
    const message = item.message;
    const showAfter = item.options && typeof item.options.showAfter === "number" ? item.options.showAfter : 0;
    const hideAfter = item.options && typeof item.options.hideAfter === "number" ? item.options.hideAfter : -1;
    if (this.currentStatusMessage) {
      dispose(this.currentStatusMessage[1]);
    }
    let statusMessageEntry;
    let showHandle = setTimeout(() => {
      statusMessageEntry = this.statusbarService.addEntry(
        {
          name: localize(6848, null),
          text: message,
          ariaLabel: message
        },
        "status.message",
        0 /* LEFT */,
        Number.NEGATIVE_INFINITY
        /* last entry */
      );
      showHandle = void 0;
    }, showAfter);
    let hideHandle;
    const statusMessageDispose = {
      dispose: () => {
        if (showHandle) {
          clearTimeout(showHandle);
        }
        if (hideHandle) {
          clearTimeout(hideHandle);
        }
        statusMessageEntry?.dispose();
      }
    };
    if (hideAfter > 0) {
      hideHandle = setTimeout(() => statusMessageDispose.dispose(), hideAfter);
    }
    this.currentStatusMessage = [item, statusMessageDispose];
  }
};

NotificationsStatus = __decorateClass([
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IConfigurationService)
], NotificationsStatus);
export { NotificationsStatus };
