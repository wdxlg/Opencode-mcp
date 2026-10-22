// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsWindowNotifier.ts
import { Disposable, DisposableMap, DisposableResourceMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { autorunDelta } from "./module-0052.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { getChatNotificationDedupeKey } from "./module-2764.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IHostService } from "./module-1118.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsWindowNotifier.ts
var SessionsWindowNotifier = class extends Disposable {
  constructor(_sessionsManagementService, _sessionsService, _hostService, _configurationService, _chatService, _chatWidgetService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._hostService = _hostService;
    this._configurationService = _configurationService;
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._statusListeners = this._register(new DisposableMap());
    this._activeNotifications = this._register(new DisposableResourceMap());
    for (const session of this._sessionsManagementService.getSessions()) {
      this._trackSession(session);
    }
    this._register(this._sessionsManagementService.onDidChangeSessions((event) => {
      for (const session of event.removed) {
        this._statusListeners.deleteAndDispose(session.sessionId);
        this._clearNotification(session);
      }
      for (const session of event.added) {
        this._trackSession(session);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessionsWindowNotifier";
  }
  /**
   * Delay before a completed session is announced, to swallow the brief idle
   * gap between a turn ending and the next queued turn starting. A method
   * rather than a field so tests can override it before `_trackSession` runs
   * during construction.
   */
  _getCompletedNotificationDelay() {
    return 1500;
  }
  /**
   * Delay before any toast from this window, which by definition is not showing
   * the session, so that a window showing it notifies first.
   */
  _getBackgroundNotificationDelay() {
    return 250;
  }
  _trackSession(session) {
    const store = new DisposableStore();
    const completedNotificationScheduler = store.add(new RunOnceScheduler(() => void this._notify(session, 3 /* Completed */), this._getCompletedNotificationDelay()));
    store.add(autorunDelta(session.status, ({ lastValue, newValue }) => {
      if (lastValue === void 0 || lastValue === newValue) {
        return;
      }
      this._clearNotification(session);
      if (newValue === 3 /* Completed */) {
        completedNotificationScheduler.schedule();
      } else {
        completedNotificationScheduler.cancel();
      }
      if (newValue === 2 /* NeedsInput */ || newValue === 4 /* Error */) {
        void this._notify(session, newValue);
      }
    }));
    this._statusListeners.set(session.sessionId, store);
  }
  async _notify(session, status2) {
    if (session.status.get() !== status2) {
      return;
    }
    if (this._chatService.getSession(session.resource) || this._chatWidgetService.getWidgetBySessionResource(session.resource)) {
      return;
    }
    const setting = status2 === 2 /* NeedsInput */ ? "chat.notifyWindowOnConfirmation" /* NotifyWindowOnConfirmation */ : "chat.notifyWindowOnResponseReceived" /* NotifyWindowOnResponseReceived */;
    const mode = this._configurationService.getValue(setting);
    if (mode === "off" /* Off */ || mode !== "always" /* Always */ && this._hostService.hasFocus) {
      return;
    }
    const cts = new CancellationTokenSource();
    this._activeNotifications.set(session.resource, toDisposable(() => cts.dispose(true)));
    try {
      await timeout(this._getBackgroundNotificationDelay());
      if (cts.token.isCancellationRequested || session.status.get() !== status2 || this._chatService.getSession(session.resource) || this._chatWidgetService.getWidgetBySessionResource(session.resource)) {
        return;
      }
      if (!this._hostService.hasFocus) {
        await this._hostService.focus(mainWindow, { mode: 1 /* Notify */ });
      }
      if (cts.token.isCancellationRequested) {
        return;
      }
      const result = await this._hostService.showToast({
        title: this._sanitizeOSToastText(localize(5408, null, session.title.get())),
        body: this._sanitizeOSToastText(this._getNotificationBody(session, status2)),
        actions: [localize(5407, null)],
        dedupeKey: getChatNotificationDedupeKey(session.resource, status2 === 2 /* NeedsInput */ ? "needsInput" /* NeedsInput */ : "idle" /* Idle */)
      }, cts.token);
      if (result.clicked || typeof result.actionIndex === "number") {
        await this._hostService.focus(mainWindow, { mode: 2 /* Force */ });
        await this._sessionsService.openSession(session.resource, { source: "notification" });
      }
    } finally {
      if (!cts.token.isCancellationRequested) {
        this._clearNotification(session);
      }
    }
  }
  _getNotificationBody(session, status2) {
    const workspaceLabel = session.workspace.get()?.label;
    switch (status2) {
      case 2 /* NeedsInput */:
        return workspaceLabel ? localize(5406, null, workspaceLabel) : localize(5405, null);
      case 3 /* Completed */:
        return workspaceLabel ? localize(5402, null, workspaceLabel) : localize(5401, null);
      case 4 /* Error */:
        return workspaceLabel ? localize(5404, null, workspaceLabel) : localize(5403, null);
      default:
        return "";
    }
  }
  _sanitizeOSToastText(text2) {
    return text2.replace(/`/g, "'");
  }
  _clearNotification(session) {
    this._activeNotifications.deleteAndDispose(session.resource);
  }
};

SessionsWindowNotifier = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IChatWidgetService)
], SessionsWindowNotifier);
export { SessionsWindowNotifier };
