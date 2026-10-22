// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/notifications.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { NoOpNotification, Severity2, isNotificationSource } from "./module-0336.mjs";
import { mapsStrictEqualIgnoreOrder } from "./module-0008.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { isErrorWithActions, toErrorMessage } from "./module-0094.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { equals } from "./module-0007.mjs";
import { Action } from "./module-0082.mjs";


// src/vs/workbench/common/notifications.ts
var NotificationHandle = class extends Disposable {
  constructor(item, onClose) {
    super();
    this.item = item;
    this.onClose = onClose;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.item.onDidChangeVisibility((visible) => this._onDidChangeVisibility.fire(visible)));
    Event2.once(this.item.onDidClose)(() => {
      this._onDidClose.fire();
      this.dispose();
    });
  }
  get progress() {
    return this.item.progress;
  }
  updateSeverity(severity) {
    this.item.updateSeverity(severity);
  }
  updateMessage(message) {
    this.item.updateMessage(message);
  }
  updateActions(actions) {
    this.item.updateActions(actions);
  }
  close() {
    this.onClose(this.item);
    this.dispose();
  }
};

var NotificationsModel = class _NotificationsModel extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeNotification = this._register(new Emitter());
    this.onDidChangeNotification = this._onDidChangeNotification.event;
    this._onDidChangeStatusMessage = this._register(new Emitter());
    this.onDidChangeStatusMessage = this._onDidChangeStatusMessage.event;
    this._onDidChangeFilter = this._register(new Emitter());
    this.onDidChangeFilter = this._onDidChangeFilter.event;
    this._notifications = [];
    this.filter = {
      global: 0 /* OFF */,
      sources: /* @__PURE__ */ new Map()
    };
  }
  static {
    this.NO_OP_NOTIFICATION = new NoOpNotification();
  }
  get notifications() {
    return this._notifications;
  }
  get statusMessage() {
    return this._statusMessage;
  }
  setFilter(filter2) {
    let globalChanged = false;
    if (typeof filter2.global === "number") {
      globalChanged = this.filter.global !== filter2.global;
      this.filter.global = filter2.global;
    }
    let sourcesChanged = false;
    if (filter2.sources) {
      sourcesChanged = !mapsStrictEqualIgnoreOrder(this.filter.sources, filter2.sources);
      this.filter.sources = filter2.sources;
    }
    if (globalChanged || sourcesChanged) {
      this._onDidChangeFilter.fire({
        global: globalChanged ? filter2.global : void 0,
        sources: sourcesChanged ? filter2.sources : void 0
      });
    }
  }
  addNotification(notification) {
    const item = this.createViewItem(notification);
    if (!item) {
      return _NotificationsModel.NO_OP_NOTIFICATION;
    }
    const duplicate = this.findNotification(item);
    duplicate?.close();
    this._notifications.splice(0, 0, item);
    this._onDidChangeNotification.fire({ item, index: 0, kind: 0 /* ADD */ });
    return new NotificationHandle(item, (item2) => this.onClose(item2));
  }
  onClose(item) {
    const liveItem = this.findNotification(item);
    if (liveItem && liveItem !== item) {
      liveItem.close();
    } else {
      item.close();
    }
  }
  findNotification(item) {
    return this._notifications.find((notification) => notification.equals(item));
  }
  createViewItem(notification) {
    const item = NotificationViewItem.create(notification, this.filter);
    if (!item) {
      return void 0;
    }
    const fireNotificationChangeEvent = (kind, detail2) => {
      const index2 = this._notifications.indexOf(item);
      if (index2 >= 0) {
        this._onDidChangeNotification.fire({ item, index: index2, kind, detail: detail2 });
      }
    };
    const itemExpansionChangeListener = item.onDidChangeExpansion(() => fireNotificationChangeEvent(2 /* EXPAND_COLLAPSE */));
    const itemContentChangeListener = item.onDidChangeContent((e) => fireNotificationChangeEvent(1 /* CHANGE */, e.kind));
    Event2.once(item.onDidClose)(() => {
      itemExpansionChangeListener.dispose();
      itemContentChangeListener.dispose();
      const index2 = this._notifications.indexOf(item);
      if (index2 >= 0) {
        this._notifications.splice(index2, 1);
        this._onDidChangeNotification.fire({ item, index: index2, kind: 3 /* REMOVE */ });
      }
    });
    return item;
  }
  showStatusMessage(message, options3) {
    const item = StatusMessageViewItem.create(message, options3);
    if (!item) {
      return { close: () => {
      } };
    }
    this._statusMessage = item;
    this._onDidChangeStatusMessage.fire({ kind: 0 /* ADD */, item });
    return {
      close: () => {
        if (this._statusMessage === item) {
          this._statusMessage = void 0;
          this._onDidChangeStatusMessage.fire({ kind: 1 /* REMOVE */, item });
        }
      }
    };
  }
};

function isNotificationViewItem(obj) {
  return obj instanceof NotificationViewItem;
}

var NotificationViewItemProgress = class extends Disposable {
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._state = /* @__PURE__ */ Object.create(null);
  }
  get state() {
    return this._state;
  }
  infinite() {
    if (this._state.infinite) {
      return;
    }
    this._state.infinite = true;
    this._state.total = void 0;
    this._state.worked = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
  done() {
    if (this._state.done) {
      return;
    }
    this._state.done = true;
    this._state.infinite = void 0;
    this._state.total = void 0;
    this._state.worked = void 0;
    this._onDidChange.fire();
  }
  total(value2) {
    if (this._state.total === value2) {
      return;
    }
    this._state.total = value2;
    this._state.infinite = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
  worked(value2) {
    if (typeof this._state.worked === "number") {
      this._state.worked += value2;
    } else {
      this._state.worked = value2;
    }
    this._state.infinite = void 0;
    this._state.done = void 0;
    this._onDidChange.fire();
  }
};

var NotificationViewItem = class _NotificationViewItem extends Disposable {
  constructor(id2, _severity, _sticky5, _priority, _message, _source, progress, actions) {
    super();
    this.id = id2;
    this._severity = _severity;
    this._sticky = _sticky5;
    this._priority = _priority;
    this._message = _message;
    this._source = _source;
    this._visible = false;
    this._onDidChangeExpansion = this._register(new Emitter());
    this.onDidChangeExpansion = this._onDidChangeExpansion.event;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    if (progress) {
      this.setProgress(progress);
    }
    this.setActions(actions);
  }
  static {
    this.MAX_MESSAGE_LENGTH = 1e3;
  }
  static create(notification, filter2) {
    if (!notification?.message || isCancellationError(notification.message)) {
      return void 0;
    }
    let severity;
    if (typeof notification.severity === "number") {
      severity = notification.severity;
    } else {
      severity = Severity2.Info;
    }
    const message = _NotificationViewItem.parseNotificationMessage(notification.message);
    if (!message) {
      return void 0;
    }
    let actions;
    if (notification.actions) {
      actions = notification.actions;
    } else if (isErrorWithActions(notification.message)) {
      actions = { primary: notification.message.actions };
    }
    let priority = notification.priority ?? 0 /* DEFAULT */;
    if ((priority === 0 /* DEFAULT */ || priority === 1 /* OPTIONAL */) && severity !== Severity2.Error) {
      if (filter2.global === 1 /* ERROR */) {
        priority = 2 /* SILENT */;
      } else if (isNotificationSource(notification.source) && filter2.sources.get(notification.source.id) === 1 /* ERROR */) {
        priority = 2 /* SILENT */;
      }
    }
    return new _NotificationViewItem(notification.id, severity, notification.sticky, priority, message, notification.source, notification.progress, actions);
  }
  static parseNotificationMessage(input) {
    let message;
    if (input instanceof Error) {
      message = toErrorMessage(input, false);
    } else if (typeof input === "string") {
      message = input;
    }
    if (!message) {
      return void 0;
    }
    const raw = message;
    if (message.length > _NotificationViewItem.MAX_MESSAGE_LENGTH) {
      message = `${message.substr(0, _NotificationViewItem.MAX_MESSAGE_LENGTH)}...`;
    }
    message = message.replace(/(\r\n|\n|\r)/gm, " ").trim();
    const linkedText = parseLinkedText(message);
    return { raw, linkedText, original: input };
  }
  setProgress(progress) {
    if (progress.infinite) {
      this.progress.infinite();
    } else if (progress.total) {
      this.progress.total(progress.total);
      if (progress.worked) {
        this.progress.worked(progress.worked);
      }
    }
  }
  setActions(actions = { primary: [], secondary: [] }) {
    this._actions = {
      primary: Array.isArray(actions.primary) ? actions.primary : [],
      secondary: Array.isArray(actions.secondary) ? actions.secondary : []
    };
    this._expanded = actions.primary && actions.primary.length > 0;
  }
  get canCollapse() {
    return !this.hasActions;
  }
  get expanded() {
    return !!this._expanded;
  }
  get severity() {
    return this._severity;
  }
  get sticky() {
    if (this._sticky) {
      return true;
    }
    const hasActions = this.hasActions;
    if (hasActions && this._severity === Severity2.Error || // notification errors with actions are sticky
    !hasActions && this._expanded || // notifications that got expanded are sticky
    this._progress && !this._progress.state.done) {
      return true;
    }
    return false;
  }
  get priority() {
    return this._priority;
  }
  get hasActions() {
    if (!this._actions) {
      return false;
    }
    if (!this._actions.primary) {
      return false;
    }
    return this._actions.primary.length > 0;
  }
  get hasProgress() {
    return !!this._progress;
  }
  get progress() {
    if (!this._progress) {
      this._progress = this._register(new NotificationViewItemProgress());
      this._register(this._progress.onDidChange(() => this._onDidChangeContent.fire({ kind: 3 /* PROGRESS */ })));
    }
    return this._progress;
  }
  get message() {
    return this._message;
  }
  get source() {
    return typeof this._source === "string" ? this._source : this._source ? this._source.label : void 0;
  }
  get sourceId() {
    return this._source && typeof this._source !== "string" && "id" in this._source ? this._source.id : void 0;
  }
  get actions() {
    return this._actions;
  }
  get visible() {
    return this._visible;
  }
  updateSeverity(severity) {
    if (severity === this._severity) {
      return;
    }
    this._severity = severity;
    this._onDidChangeContent.fire({ kind: 0 /* SEVERITY */ });
  }
  updateMessage(input) {
    const message = _NotificationViewItem.parseNotificationMessage(input);
    if (!message || message.raw === this._message.raw) {
      return;
    }
    this._message = message;
    this._onDidChangeContent.fire({ kind: 1 /* MESSAGE */ });
  }
  updateActions(actions) {
    this.setActions(actions);
    this._onDidChangeContent.fire({ kind: 2 /* ACTIONS */ });
  }
  updateVisibility(visible) {
    if (this._visible !== visible) {
      this._visible = visible;
      this._onDidChangeVisibility.fire(visible);
    }
  }
  expand() {
    if (this._expanded || !this.canCollapse) {
      return;
    }
    this._expanded = true;
    this._onDidChangeExpansion.fire();
  }
  collapse(skipEvents) {
    if (!this._expanded || !this.canCollapse) {
      return;
    }
    this._expanded = false;
    if (!skipEvents) {
      this._onDidChangeExpansion.fire();
    }
  }
  toggle() {
    if (this._expanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }
  close() {
    this._onDidClose.fire();
    this.dispose();
  }
  equals(other) {
    if (this.hasProgress || other.hasProgress) {
      return false;
    }
    if (typeof this.id === "string" || typeof other.id === "string") {
      return this.id === other.id;
    }
    if (typeof this._source === "object") {
      if (this._source.label !== other.source || this._source.id !== other.sourceId) {
        return false;
      }
    } else if (this._source !== other.source) {
      return false;
    }
    if (this._message.raw !== other.message.raw) {
      return false;
    }
    const primaryActions = this._actions?.primary || [];
    const otherPrimaryActions = other.actions?.primary || [];
    return equals(primaryActions, otherPrimaryActions, (action, otherAction) => action.id + action.label === otherAction.id + otherAction.label);
  }
};

var ChoiceAction = class _ChoiceAction extends Action {
  constructor(id2, choice) {
    super(id2, choice.label, void 0, true, async () => {
      choice.run();
      this._onDidRun.fire();
    });
    this._onDidRun = this._register(new Emitter());
    this.onDidRun = this._onDidRun.event;
    this._keepOpen = !!choice.keepOpen;
    this._menu = !choice.isSecondary && choice.menu ? choice.menu.map((c, index2) => new _ChoiceAction(`${id2}.${index2}`, c)) : void 0;
  }
  get menu() {
    return this._menu;
  }
  get keepOpen() {
    return this._keepOpen;
  }
};

var StatusMessageViewItem = class {
  static create(notification, options3) {
    if (!notification || isCancellationError(notification)) {
      return void 0;
    }
    let message;
    if (notification instanceof Error) {
      message = toErrorMessage(notification, false);
    } else if (typeof notification === "string") {
      message = notification;
    }
    if (!message) {
      return void 0;
    }
    return { message, options: options3 };
  }
};

function getNotificationsPosition(configurationService) {
  const position2 = configurationService.getValue("workbench.notifications.position" /* NOTIFICATIONS_POSITION */);
  if (position2 === "bottom-left" /* BOTTOM_LEFT */ || position2 === "top-right" /* TOP_RIGHT */) {
    return position2;
  }
  return "bottom-right" /* BOTTOM_RIGHT */;
}
export { isNotificationViewItem, getNotificationsPosition, NotificationHandle, NotificationsModel, NotificationViewItemProgress, NotificationViewItem, ChoiceAction, StatusMessageViewItem };
