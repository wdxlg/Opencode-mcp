// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/notification/common/notificationService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ChoiceAction, NotificationsModel } from "./module-1492.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { INotificationService, NoOpNotification, Severity2, isNotificationSource } from "./module-0336.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/notification/common/notificationService.ts
var NotificationService = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.model = this._register(new NotificationsModel());
    this._onDidChangeFilter = this._register(new Emitter());
    this.onDidChangeFilter = this._onDidChangeFilter.event;
    this.mapSourceToFilter = (() => {
      const map = /* @__PURE__ */ new Map();
      for (const sourceFilter of this.storageService.getObject(NotificationService.PER_SOURCE_FILTER_SETTINGS_KEY, -1 /* APPLICATION */, [])) {
        map.set(sourceFilter.id, sourceFilter);
      }
      return map;
    })();
    this.globalFilterEnabled = this.storageService.getBoolean(NotificationService.GLOBAL_FILTER_SETTINGS_KEY, -1 /* APPLICATION */, false);
    this.updateFilters();
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.model.onDidChangeNotification((e4) => {
      switch (e4.kind) {
        case 0 /* ADD */: {
          const source = typeof e4.item.sourceId === "string" && typeof e4.item.source === "string" ? { id: e4.item.sourceId, label: e4.item.source } : e4.item.source;
          if (isNotificationSource(source)) {
            if (!this.mapSourceToFilter.has(source.id)) {
              this.setFilter({ ...source, filter: 0 /* OFF */ });
            } else {
              this.updateSourceFilter(source);
            }
          }
          break;
        }
      }
    }));
  }
  static {
    //#region Filters
    this.GLOBAL_FILTER_SETTINGS_KEY = "notifications.doNotDisturbMode";
  }
  static {
    this.PER_SOURCE_FILTER_SETTINGS_KEY = "notifications.perSourceDoNotDisturbMode";
  }
  setFilter(filter2) {
    if (typeof filter2 === "number") {
      if (this.globalFilterEnabled === (filter2 === 1 /* ERROR */)) {
        return;
      }
      this.globalFilterEnabled = filter2 === 1 /* ERROR */;
      this.storageService.store(NotificationService.GLOBAL_FILTER_SETTINGS_KEY, this.globalFilterEnabled, -1 /* APPLICATION */, 1 /* MACHINE */);
      this.updateFilters();
      this._onDidChangeFilter.fire();
    } else {
      const existing = this.mapSourceToFilter.get(filter2.id);
      if (existing?.filter === filter2.filter && existing.label === filter2.label) {
        return;
      }
      this.mapSourceToFilter.set(filter2.id, { id: filter2.id, label: filter2.label, filter: filter2.filter });
      this.saveSourceFilters();
      this.updateFilters();
    }
  }
  getFilter(source) {
    if (source) {
      return this.mapSourceToFilter.get(source.id)?.filter ?? 0 /* OFF */;
    }
    return this.globalFilterEnabled ? 1 /* ERROR */ : 0 /* OFF */;
  }
  updateSourceFilter(source) {
    const existing = this.mapSourceToFilter.get(source.id);
    if (!existing) {
      return;
    }
    if (existing.label !== source.label) {
      this.mapSourceToFilter.set(source.id, { id: source.id, label: source.label, filter: existing.filter });
      this.saveSourceFilters();
    }
  }
  saveSourceFilters() {
    this.storageService.store(NotificationService.PER_SOURCE_FILTER_SETTINGS_KEY, JSON.stringify([...this.mapSourceToFilter.values()]), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  getFilters() {
    return [...this.mapSourceToFilter.values()];
  }
  updateFilters() {
    this.model.setFilter({
      global: this.globalFilterEnabled ? 1 /* ERROR */ : 0 /* OFF */,
      sources: new Map([...this.mapSourceToFilter.values()].map((source) => [source.id, source.filter]))
    });
  }
  removeFilter(sourceId) {
    if (this.mapSourceToFilter.delete(sourceId)) {
      this.saveSourceFilters();
      this.updateFilters();
    }
  }
  //#endregion
  info(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.info(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity2.Info, message });
  }
  warn(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.warn(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity2.Warning, message });
  }
  error(message) {
    if (Array.isArray(message)) {
      for (const messageEntry of message) {
        this.error(messageEntry);
      }
      return;
    }
    this.model.addNotification({ severity: Severity2.Error, message });
  }
  notify(notification) {
    const toDispose = new DisposableStore();
    if (notification.neverShowAgain) {
      const scope = this.toStorageScope(notification.neverShowAgain);
      const id2 = notification.neverShowAgain.id;
      if (this.storageService.getBoolean(id2, scope)) {
        return new NoOpNotification();
      }
      const neverShowAgainAction = toDispose.add(new Action(
        "workbench.notification.neverShowAgain",
        localize(23249, null),
        void 0,
        true,
        async () => {
          handle2.close();
          this.storageService.store(id2, true, scope, 0 /* USER */);
        }
      ));
      const actions = {
        primary: notification.actions?.primary || [],
        secondary: notification.actions?.secondary || []
      };
      if (!notification.neverShowAgain.isSecondary) {
        actions.primary = [neverShowAgainAction, ...actions.primary];
      } else {
        actions.secondary = [...actions.secondary, neverShowAgainAction];
      }
      notification.actions = actions;
    }
    const handle2 = this.model.addNotification(notification);
    Event2.once(handle2.onDidClose)(() => toDispose.dispose());
    return handle2;
  }
  toStorageScope(options3) {
    switch (options3.scope) {
      case 2 /* APPLICATION */:
        return -1 /* APPLICATION */;
      case 1 /* PROFILE */:
        return 0 /* PROFILE */;
      case 0 /* WORKSPACE */:
        return 1 /* WORKSPACE */;
      default:
        return -1 /* APPLICATION */;
    }
  }
  prompt(severity, message, choices, options3) {
    if (options3?.neverShowAgain) {
      const scope = this.toStorageScope(options3.neverShowAgain);
      const id2 = options3.neverShowAgain.id;
      if (this.storageService.getBoolean(id2, scope)) {
        return new NoOpNotification();
      }
      const neverShowAgainChoice = {
        label: localize(23249, null),
        run: () => this.storageService.store(id2, true, scope, 0 /* USER */),
        isSecondary: options3.neverShowAgain.isSecondary
      };
      if (!options3.neverShowAgain.isSecondary) {
        choices = [neverShowAgainChoice, ...choices];
      } else {
        choices = [...choices, neverShowAgainChoice];
      }
    }
    let choiceClicked = false;
    const toDispose = new DisposableStore();
    const primaryActions = [];
    const secondaryActions = [];
    choices.forEach((choice, index2) => {
      const action = new ChoiceAction(`workbench.dialog.choice.${index2}`, choice);
      if (!choice.isSecondary) {
        primaryActions.push(action);
      } else {
        secondaryActions.push(action);
      }
      toDispose.add(action.onDidRun(() => {
        choiceClicked = true;
        if (!choice.keepOpen) {
          handle2.close();
        }
      }));
      toDispose.add(action);
    });
    const actions = { primary: primaryActions, secondary: secondaryActions };
    const handle2 = this.notify({ severity, message, actions, sticky: options3?.sticky, priority: options3?.priority });
    Event2.once(handle2.onDidClose)(() => {
      toDispose.dispose();
      if (options3 && typeof options3.onCancel === "function" && !choiceClicked) {
        options3.onCancel();
      }
    });
    return handle2;
  }
  status(message, options3) {
    return this.model.showStatusMessage(message, options3);
  }
};

NotificationService = __decorateClass([
  __decorateParam(0, IStorageService)
], NotificationService);

registerSingleton(INotificationService, NotificationService, 1 /* Delayed */);
export { NotificationService };
