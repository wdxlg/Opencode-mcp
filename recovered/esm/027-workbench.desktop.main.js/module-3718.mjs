// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/notifications/notificationsToasts.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { IntervalCounter } from "./module-0036.mjs";
import { NotificationsToastsVisibleContext } from "./module-0949.mjs";
import { PendingNotificationToasts } from "./module-3717.mjs";
import { $, Dimension, EventType, addDisposableListener, getActiveElement, getClientArea, getDomNodePagePosition, getWindow, isAncestorOfActiveElement, isEditableElement, isHTMLElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { dispose, toDisposable } from "./module-0012.mjs";
import { onDidChangeNotificationRowHeight } from "./module-3460.mjs";
import { Severity2, withSeverityPrefix } from "./module-0336.mjs";
import { getNotificationsPosition } from "./module-1493.mjs";
import { mainWindow } from "./module-0002.mjs";
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT } from "./module-0515.mjs";
import { NotificationsList } from "./module-3713.mjs";
import { localize } from "./module-0001.mjs";
import { NOTIFICATIONS_BACKGROUND, NOTIFICATIONS_TOAST_BORDER } from "./module-0912.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/notifications/notificationsToasts.ts
var NotificationsToasts = class extends Themable {
  constructor(container3, model, instantiationService, layoutService, themeService, editorGroupService, contextKeyService, lifecycleService, hostService, environmentService, configurationService) {
    super(themeService);
    this.container = container3;
    this.model = model;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.editorGroupService = editorGroupService;
    this.lifecycleService = lifecycleService;
    this.hostService = hostService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._isVisible = false;
    this.mapNotificationToToast = /* @__PURE__ */ new Map();
    this.mapNotificationToDisposable = /* @__PURE__ */ new Map();
    this.addedToastsIntervalCounter = new IntervalCounter(NotificationsToasts.SPAM_PROTECTION.interval);
    this.notificationsToastsVisibleContextKey = NotificationsToastsVisibleContext.bindTo(contextKeyService);
    this.pendingToasts = this._register(new PendingNotificationToasts(
      (item) => this.model.notifications.includes(item),
      (item, other) => item.equals(other),
      (callback) => scheduleAtNextAnimationFrame(getWindow(this.container), callback)
    ));
    this._register(toDisposable(() => this.removeToasts()));
    this._register(onDidChangeNotificationRowHeight(() => this.updateNotificationHeights()));
    this.registerListeners();
  }
  static {
    this.MAX_WIDTH = 450;
  }
  static {
    this.MAX_NOTIFICATIONS = 3;
  }
  static {
    this.PURGE_TIMEOUT = {
      [Severity2.Info]: 1e4,
      [Severity2.Warning]: 12e3,
      [Severity2.Error]: 15e3
    };
  }
  static {
    this.SPAM_PROTECTION = {
      // Count for the number of notifications over 800ms...
      interval: 800,
      // ...and ensure we are not showing more than MAX_NOTIFICATIONS
      limit: this.MAX_NOTIFICATIONS
    };
  }
  get isVisible() {
    return !!this._isVisible;
  }
  updateNotificationHeights() {
    this.mapNotificationToToast.forEach(({ list: list2 }) => list2.updateNotificationHeights());
    const maxDimensions = this.computeMaxDimensions();
    if (maxDimensions.height) {
      this.layoutContainer(maxDimensions.height);
    }
  }
  registerListeners() {
    this._register(this.layoutService.onDidLayoutMainContainer((dimension) => this.layout(Dimension.lift(dimension))));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.notifications.position" /* NOTIFICATIONS_POSITION */)) {
        this.updateNotificationPosition();
      }
    }));
    this.lifecycleService.when(3 /* Restored */).then(() => {
      this.model.notifications.forEach((notification) => this.addToast(notification));
      this._register(this.model.onDidChangeNotification((e) => this.onDidChangeNotification(e)));
    });
    this._register(this.model.onDidChangeFilter(({ global, sources }) => {
      if (global === 1 /* ERROR */) {
        this.hide();
      } else if (sources) {
        for (const [notification] of this.mapNotificationToToast) {
          if (typeof notification.sourceId === "string" && sources.get(notification.sourceId) === 1 /* ERROR */ && notification.severity !== Severity2.Error && notification.priority !== 3 /* URGENT */) {
            this.removeToast(notification);
          }
        }
      }
    }));
  }
  updateNotificationPosition() {
    if (!this.notificationsToastsContainer) {
      return;
    }
    const position2 = getNotificationsPosition(this.configurationService);
    this.notificationsToastsContainer.classList.remove("bottom-right", "bottom-left", "top-right");
    this.notificationsToastsContainer.classList.add(position2);
    this.updateTopOffset();
  }
  updateTopOffset() {
    if (!this.notificationsToastsContainer) {
      return;
    }
    const position2 = getNotificationsPosition(this.configurationService);
    if (position2 === "top-right" /* TOP_RIGHT */) {
      let topOffset = 3;
      if (this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
        topOffset += DEFAULT_CUSTOM_TITLEBAR_HEIGHT;
      }
      this.notificationsToastsContainer.style.top = `${topOffset}px`;
    } else {
      this.notificationsToastsContainer.style.top = "";
    }
  }
  onDidChangeNotification(e) {
    switch (e.kind) {
      case 0 /* ADD */:
        return this.addToast(e.item);
      case 3 /* REMOVE */:
        return this.removeToast(e.item);
    }
  }
  addToast(item) {
    if (this.isNotificationsCenterVisible) {
      return;
    }
    if (this.environmentService.enableSmokeTestDriver) {
      return;
    }
    if (item.priority === 2 /* SILENT */) {
      return;
    }
    if (item.priority === 1 /* OPTIONAL */) {
      const activeElement = getActiveElement();
      if (isHTMLElement(activeElement) && isEditableElement(activeElement) && this.isElementInNotificationQuarter(activeElement)) {
        return;
      }
    }
    if (this.pendingToasts.tryReplace(item)) {
      return;
    }
    if (this.addedToastsIntervalCounter.increment() > NotificationsToasts.SPAM_PROTECTION.limit) {
      return;
    }
    this.pendingToasts.add(item, (pendingItem, itemDisposables) => {
      this.mapNotificationToDisposable.set(pendingItem, itemDisposables);
      this.doAddToast(pendingItem, itemDisposables);
    });
  }
  isElementInNotificationQuarter(element) {
    const position2 = getNotificationsPosition(this.configurationService);
    const domPosition = getDomNodePagePosition(element);
    const clientArea = getClientArea(this.layoutService.mainContainer);
    switch (position2) {
      case "bottom-left" /* BOTTOM_LEFT */:
        return domPosition.left < clientArea.width / 2 && domPosition.top > clientArea.height / 2;
      case "top-right" /* TOP_RIGHT */:
        return domPosition.left > clientArea.width / 2 && domPosition.top < clientArea.height / 2;
      case "bottom-right" /* BOTTOM_RIGHT */:
      default:
        return domPosition.left > clientArea.width / 2 && domPosition.top > clientArea.height / 2;
    }
  }
  doAddToast(item, itemDisposables) {
    let notificationsToastsContainer = this.notificationsToastsContainer;
    if (!notificationsToastsContainer) {
      notificationsToastsContainer = this.notificationsToastsContainer = $(".notifications-toasts");
      this.container.appendChild(notificationsToastsContainer);
    }
    this.updateNotificationPosition();
    notificationsToastsContainer.classList.add("visible");
    const notificationToastContainer = $(".notification-toast-container");
    const firstToast = notificationsToastsContainer.firstChild;
    if (firstToast) {
      notificationsToastsContainer.insertBefore(notificationToastContainer, firstToast);
    } else {
      notificationsToastsContainer.appendChild(notificationToastContainer);
    }
    const notificationToast = $(".notification-toast");
    notificationToastContainer.appendChild(notificationToast);
    const notificationList = this.instantiationService.createInstance(NotificationsList, notificationToast, {
      verticalScrollMode: 2 /* Hidden */,
      widgetAriaLabel: (() => {
        if (!item.source) {
          return withSeverityPrefix(localize(6851, null, item.message.raw), item.severity);
        }
        return withSeverityPrefix(localize(6852, null, item.message.raw, item.source), item.severity);
      })()
    });
    itemDisposables.add(notificationList);
    const toast = { item, list: notificationList, container: notificationToastContainer, toast: notificationToast };
    this.mapNotificationToToast.set(item, toast);
    itemDisposables.add(toDisposable(() => this.updateToastVisibility(toast, false)));
    notificationList.show();
    const maxDimensions = this.computeMaxDimensions();
    this.layoutLists(maxDimensions.width);
    notificationList.updateNotificationsList(0, 0, [item]);
    this.layoutContainer(maxDimensions.height);
    itemDisposables.add(item.onDidChangeExpansion(() => {
      notificationList.updateNotificationsList(0, 1, [item]);
    }));
    itemDisposables.add(item.onDidChangeContent((e) => {
      switch (e.kind) {
        case 2 /* ACTIONS */:
          notificationList.updateNotificationsList(0, 1, [item]);
          break;
        case 1 /* MESSAGE */:
          if (item.expanded) {
            notificationList.updateNotificationHeight(item);
          }
          break;
      }
    }));
    Event2.once(item.onDidClose)(() => {
      this.removeToast(item);
    });
    this.purgeNotification(item, notificationToastContainer, notificationList, itemDisposables);
    this.updateStyles();
    this.notificationsToastsVisibleContextKey.set(true);
    notificationToast.classList.add("notification-fade-in");
    itemDisposables.add(addDisposableListener(notificationToast, "transitionend", () => {
      notificationToast.classList.remove("notification-fade-in");
      notificationToast.classList.add("notification-fade-in-done");
    }));
    item.updateVisibility(true);
    if (!this._isVisible) {
      this._isVisible = true;
      this._onDidChangeVisibility.fire();
    }
  }
  purgeNotification(item, notificationToastContainer, notificationList, disposables) {
    let isMouseOverToast = false;
    disposables.add(addDisposableListener(notificationToastContainer, EventType.MOUSE_OVER, () => isMouseOverToast = true));
    disposables.add(addDisposableListener(notificationToastContainer, EventType.MOUSE_OUT, () => isMouseOverToast = false));
    let purgeTimeoutHandle;
    let listener;
    const hideAfterTimeout = () => {
      purgeTimeoutHandle = setTimeout(() => {
        if (!this.hostService.hasFocus) {
          if (!listener) {
            listener = this.hostService.onDidChangeFocus((focus) => {
              if (focus) {
                hideAfterTimeout();
              }
            });
            disposables.add(listener);
          }
        } else if (item.sticky || // never hide sticky notifications
        notificationList.hasFocus() || // never hide notifications with focus
        isMouseOverToast) {
          hideAfterTimeout();
        } else {
          this.removeToast(item);
        }
      }, NotificationsToasts.PURGE_TIMEOUT[item.severity]);
    };
    hideAfterTimeout();
    disposables.add(toDisposable(() => clearTimeout(purgeTimeoutHandle)));
  }
  removeToast(item) {
    let focusEditor = false;
    this.pendingToasts.remove(item);
    const notificationToast = this.mapNotificationToToast.get(item);
    if (notificationToast) {
      const toastHasDOMFocus = isAncestorOfActiveElement(notificationToast.container);
      if (toastHasDOMFocus) {
        focusEditor = !(this.focusNext() || this.focusPrevious());
      }
      this.mapNotificationToToast.delete(item);
    }
    const notificationDisposables = this.mapNotificationToDisposable.get(item);
    if (notificationDisposables) {
      dispose(notificationDisposables);
      this.mapNotificationToDisposable.delete(item);
    }
    if (this.mapNotificationToToast.size > 0) {
      this.layout(this.workbenchDimensions);
    } else {
      this.doHide();
      if (focusEditor) {
        this.editorGroupService.activeGroup.focus();
      }
    }
  }
  removeToasts() {
    this.pendingToasts.clear();
    this.mapNotificationToToast.clear();
    this.mapNotificationToDisposable.forEach((disposable) => dispose(disposable));
    this.mapNotificationToDisposable.clear();
    this.doHide();
  }
  doHide() {
    this.notificationsToastsContainer?.classList.remove("visible");
    this.notificationsToastsVisibleContextKey.set(false);
    if (this._isVisible) {
      this._isVisible = false;
      this._onDidChangeVisibility.fire();
    }
  }
  hide() {
    const focusEditor = this.notificationsToastsContainer ? isAncestorOfActiveElement(this.notificationsToastsContainer) : false;
    this.removeToasts();
    if (focusEditor) {
      this.editorGroupService.activeGroup.focus();
    }
  }
  focus() {
    const toasts = this.getToasts(2 /* VISIBLE */);
    if (toasts.length > 0) {
      toasts[0].list.focusFirst();
      return true;
    }
    return false;
  }
  focusNext() {
    const toasts = this.getToasts(2 /* VISIBLE */);
    for (let i2 = 0; i2 < toasts.length; i2++) {
      const toast = toasts[i2];
      if (toast.list.hasFocus()) {
        const nextToast = toasts[i2 + 1];
        if (nextToast) {
          nextToast.list.focusFirst();
          return true;
        }
        break;
      }
    }
    return false;
  }
  focusPrevious() {
    const toasts = this.getToasts(2 /* VISIBLE */);
    for (let i2 = 0; i2 < toasts.length; i2++) {
      const toast = toasts[i2];
      if (toast.list.hasFocus()) {
        const previousToast = toasts[i2 - 1];
        if (previousToast) {
          previousToast.list.focusFirst();
          return true;
        }
        break;
      }
    }
    return false;
  }
  focusFirst() {
    const toast = this.getToasts(2 /* VISIBLE */)[0];
    if (toast) {
      toast.list.focusFirst();
      return true;
    }
    return false;
  }
  focusLast() {
    const toasts = this.getToasts(2 /* VISIBLE */);
    if (toasts.length > 0) {
      toasts[toasts.length - 1].list.focusFirst();
      return true;
    }
    return false;
  }
  update(isCenterVisible) {
    if (this.isNotificationsCenterVisible !== isCenterVisible) {
      this.isNotificationsCenterVisible = isCenterVisible;
      if (this.isNotificationsCenterVisible) {
        this.removeToasts();
      }
    }
  }
  updateStyles() {
    this.mapNotificationToToast.forEach(({ toast }) => {
      const backgroundColor = this.getColor(NOTIFICATIONS_BACKGROUND);
      toast.style.background = backgroundColor ? backgroundColor : "";
      const borderColor = this.getColor(NOTIFICATIONS_TOAST_BORDER);
      toast.style.border = borderColor ? `1px solid ${borderColor}` : "";
    });
  }
  getToasts(state) {
    const notificationToasts = [];
    this.mapNotificationToToast.forEach((toast) => {
      switch (state) {
        case 0 /* HIDDEN_OR_VISIBLE */:
          notificationToasts.push(toast);
          break;
        case 1 /* HIDDEN */:
          if (!this.isToastInDOM(toast)) {
            notificationToasts.push(toast);
          }
          break;
        case 2 /* VISIBLE */:
          if (this.isToastInDOM(toast)) {
            notificationToasts.push(toast);
          }
          break;
      }
    });
    return notificationToasts.reverse();
  }
  layout(dimension) {
    this.workbenchDimensions = dimension;
    const maxDimensions = this.computeMaxDimensions();
    this.updateTopOffset();
    if (maxDimensions.height) {
      this.layoutContainer(maxDimensions.height);
    }
    this.layoutLists(maxDimensions.width);
  }
  computeMaxDimensions() {
    const maxWidth = NotificationsToasts.MAX_WIDTH;
    let availableWidth = maxWidth;
    let availableHeight;
    if (this.workbenchDimensions) {
      availableWidth = this.workbenchDimensions.width;
      availableWidth -= 2 * 8;
      availableHeight = this.workbenchDimensions.height;
      if (this.layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */, mainWindow)) {
        availableHeight -= 22;
      }
      if (this.layoutService.isVisible("workbench.parts.titlebar" /* TITLEBAR_PART */, mainWindow)) {
        availableHeight -= 22;
      }
      availableHeight -= 2 * 12;
    }
    return new Dimension(Math.min(maxWidth, availableWidth), availableHeight ?? 0);
  }
  layoutLists(width2) {
    this.mapNotificationToToast.forEach(({ list: list2 }) => list2.layout(width2));
  }
  layoutContainer(heightToGive) {
    let singleToastHeightToGive = heightToGive;
    let multipleToastsHeightToGive = Math.round(heightToGive * 0.618);
    const toasts = this.getToasts(0 /* HIDDEN_OR_VISIBLE */);
    for (const toast of toasts) {
      toast.container.style.opacity = "0";
      this.updateToastVisibility(toast, true);
    }
    const toastHeights = toasts.map((toast) => toast.container.offsetHeight);
    let visibleToasts = 0;
    for (let i2 = 0; i2 < toasts.length; i2++) {
      const toast = toasts[i2];
      const toastHeight = toastHeights[i2];
      singleToastHeightToGive -= toastHeight;
      multipleToastsHeightToGive -= toastHeight;
      let makeVisible = false;
      if (visibleToasts === NotificationsToasts.MAX_NOTIFICATIONS) {
        makeVisible = false;
      } else if (visibleToasts === 0 && singleToastHeightToGive >= 0 || visibleToasts > 0 && multipleToastsHeightToGive >= 0) {
        makeVisible = true;
      }
      this.updateToastVisibility(toast, makeVisible);
      toast.container.style.opacity = "";
      if (makeVisible) {
        visibleToasts++;
      }
    }
  }
  updateToastVisibility(toast, visible) {
    if (this.isToastInDOM(toast) === visible) {
      return;
    }
    const notificationsToastsContainer = assertReturnsDefined(this.notificationsToastsContainer);
    if (visible) {
      notificationsToastsContainer.appendChild(toast.container);
    } else {
      toast.container.remove();
    }
    toast.item.updateVisibility(visible);
  }
  isToastInDOM(toast) {
    return !!toast.container.parentElement;
  }
};

NotificationsToasts = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IEditorGroupsService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ILifecycleService),
  __decorateParam(8, IHostService),
  __decorateParam(9, IWorkbenchEnvironmentService),
  __decorateParam(10, IConfigurationService)
], NotificationsToasts);
export { NotificationsToasts };
