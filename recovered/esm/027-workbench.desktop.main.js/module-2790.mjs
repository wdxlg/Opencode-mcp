// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatWindowNotifier.ts
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { Disposable, DisposableResourceMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorunDelta, autorunIterableDelta } from "./module-0052.mjs";
import { RunOnceScheduler, timeout } from "./module-0036.mjs";
import { getWindow } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { getChatNotificationDedupeKey } from "./module-2789.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IHostService } from "./module-1117.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/chatWindowNotifier.ts
function observeIsIdle(model) {
  const pendingRequestCount = observableFromEvent(model.onDidChangePendingRequests, () => model.getPendingRequests().length);
  return derived((reader) => {
    if (model.requestInProgress.read(reader) || model.requestNeedsInput.read(reader)) {
      return false;
    }
    if (pendingRequestCount.read(reader) === 0) {
      return true;
    }
    const response = model.lastRequestObs.read(reader)?.response;
    return !!response && (response.isCanceled || !!response.result?.errorDetails);
  });
}

var ChatWindowNotifier = class extends Disposable {
  constructor(_chatService, _chatWidgetService, _hostService, _configurationService) {
    super();
    this._chatService = _chatService;
    this._chatWidgetService = _chatWidgetService;
    this._hostService = _hostService;
    this._configurationService = _configurationService;
    this._activeNotifications = this._register(new DisposableResourceMap());
    const modelTrackers = this._register(new DisposableResourceMap());
    this._register(autorunIterableDelta(
      (reader) => this._chatService.chatModels.read(reader),
      ({ addedValues, removedValues }) => {
        for (const model of addedValues) {
          modelTrackers.set(model.sessionResource, this._trackModel(model));
        }
        for (const model of removedValues) {
          modelTrackers.deleteAndDispose(model.sessionResource);
        }
      }
    ));
  }
  static {
    this.ID = "workbench.contrib.chatWindowNotifier";
  }
  _trackModel(model) {
    const store = new DisposableStore();
    const isIdle = observeIsIdle(model);
    const idleScheduler = store.add(new RunOnceScheduler(() => void this._notifyIdleIfNeeded(model, isIdle), 500));
    store.add(autorunDelta(model.requestNeedsInput, ({ lastValue, newValue }) => {
      const currentNeedsInput = !!newValue;
      const previousNeedsInput = !!lastValue;
      if (!previousNeedsInput && currentNeedsInput && newValue) {
        this._notifyIfNeeded(model.sessionResource, newValue);
      } else if (previousNeedsInput && !currentNeedsInput) {
        this._clearNotification(model.sessionResource);
      }
    }));
    store.add(autorunDelta(isIdle, ({ lastValue, newValue }) => {
      if (lastValue === false && newValue === true && model.lastRequest) {
        idleScheduler.schedule();
      } else if (!newValue) {
        idleScheduler.cancel();
      }
    }));
    return store;
  }
  async _notifyIfNeeded(sessionResource, info) {
    const mode = this._configurationService.getValue("chat.notifyWindowOnConfirmation" /* NotifyWindowOnConfirmation */);
    if (mode === "off" /* Off */) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    const targetWindow = widget ? getWindow(widget.domNode) : mainWindow;
    await this._delayForBackgroundWindow(widget?.visible === true);
    if (!this._chatService.getSession(sessionResource)?.requestNeedsInput.get()) {
      return;
    }
    const isFocused = targetWindow.document.hasFocus();
    if (mode !== "always" /* Always */ && isFocused) {
      return;
    }
    this._clearNotification(sessionResource);
    if (!isFocused) {
      await this._hostService.focus(targetWindow, { mode: 1 /* Notify */ });
    }
    const notificationTitle = info.title ? localize(11312, null, info.title) : localize(11311, null);
    const cts = new CancellationTokenSource();
    this._activeNotifications.set(sessionResource, toDisposable(() => cts.dispose(true)));
    const isQuestionCarousel = this._isQuestionCarouselPending(sessionResource);
    try {
      const actionLabel = isQuestionCarousel ? localize(11314, null) : localize(11309, null);
      const result = await this._hostService.showToast({
        title: this._sanitizeOSToastText(notificationTitle),
        body: this._getNotificationBody(sessionResource, info, isQuestionCarousel),
        actions: [actionLabel],
        dedupeKey: getChatNotificationDedupeKey(sessionResource, "needsInput" /* NeedsInput */)
      }, cts.token);
      if (result.actionIndex === 0 && !isQuestionCarousel && this._confirmAllow(sessionResource)) {
        return;
      }
      if (result.clicked || typeof result.actionIndex === "number") {
        await this._hostService.focus(targetWindow, { mode: 2 /* Force */ });
        const widget2 = await this._chatWidgetService.openSession(sessionResource);
        widget2?.focusInput();
      }
    } finally {
      this._clearNotification(sessionResource);
    }
  }
  async _notifyIdleIfNeeded(model, isIdle) {
    if (!model.lastRequest || !isIdle.get() || model.requestNeedsInput.get()) {
      return;
    }
    const mode = this._configurationService.getValue("chat.notifyWindowOnResponseReceived" /* NotifyWindowOnResponseReceived */);
    if (mode === "off" /* Off */) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(model.sessionResource);
    const targetWindow = widget ? getWindow(widget.domNode) : mainWindow;
    await this._delayForBackgroundWindow(widget?.visible === true);
    if (!isIdle.get() || model.requestNeedsInput.get()) {
      return;
    }
    const isFocused = targetWindow.document.hasFocus();
    if (mode !== "always" /* Always */ && isFocused) {
      return;
    }
    this._clearNotification(model.sessionResource);
    if (!isFocused) {
      await this._hostService.focus(targetWindow, { mode: 1 /* Notify */ });
    }
    const cts = new CancellationTokenSource();
    this._activeNotifications.set(model.sessionResource, toDisposable(() => cts.dispose(true)));
    try {
      const title = model.title ? localize(11312, null, model.title) : localize(11311, null);
      const result = await this._hostService.showToast({
        title: this._sanitizeOSToastText(title),
        body: localize(11310, null),
        actions: [localize(11314, null)],
        dedupeKey: getChatNotificationDedupeKey(model.sessionResource, "idle" /* Idle */)
      }, cts.token);
      if (result.clicked || typeof result.actionIndex === "number") {
        await this._hostService.focus(targetWindow, { mode: 2 /* Force */ });
        const openedWidget = await this._chatWidgetService.openSession(model.sessionResource);
        openedWidget?.focusInput();
      }
    } finally {
      this._clearNotification(model.sessionResource);
    }
  }
  async _delayForBackgroundWindow(isWidgetVisible) {
    if (isWidgetVisible && await this._hostService.hadLastFocus()) {
      return;
    }
    await timeout(250);
  }
  _confirmAllow(sessionResource) {
    const model = this._chatService.getSession(sessionResource);
    const lastResponse = model?.lastRequest?.response;
    if (!lastResponse) {
      return false;
    }
    for (const part of lastResponse.response.value) {
      const state = part.kind === "toolInvocation" ? part.state.get() : void 0;
      if (state?.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state?.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
        state.confirm({ type: 4 /* UserAction */ });
        return true;
      }
    }
    return false;
  }
  _getNotificationBody(sessionResource, info, isQuestionCarousel) {
    if (isQuestionCarousel) {
      return localize(11315, null);
    }
    const terminalCommand = this._getPendingTerminalCommand(sessionResource);
    if (terminalCommand) {
      return this._sanitizeOSToastText(terminalCommand);
    }
    if (info.detail) {
      return this._sanitizeOSToastText(info.detail);
    }
    return localize(11313, null);
  }
  _getPendingTerminalCommand(sessionResource) {
    const model = this._chatService.getSession(sessionResource);
    const lastResponse = model?.lastRequest?.response;
    if (!lastResponse?.response?.value) {
      return void 0;
    }
    for (const part of lastResponse.response.value) {
      if (part.kind === "toolInvocation" && part.toolSpecificData?.kind === "terminal") {
        const state = part.state.get();
        if (state?.type !== IChatToolInvocation.StateKind.WaitingForConfirmation && state?.type !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
          continue;
        }
        const terminalData = migrateLegacyTerminalToolSpecificData(part.toolSpecificData);
        return terminalData.commandLine.forDisplay ?? terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
      }
    }
    return void 0;
  }
  _isQuestionCarouselPending(sessionResource) {
    const model = this._chatService.getSession(sessionResource);
    const lastResponse = model?.lastRequest?.response;
    if (!lastResponse) {
      return false;
    }
    return lastResponse.response.value.some(
      (part) => part.kind === "questionCarousel" && !part.isUsed
    );
  }
  _sanitizeOSToastText(text2) {
    return text2.replace(/`/g, "'");
  }
  _clearNotification(sessionResource) {
    this._activeNotifications.deleteAndDispose(sessionResource);
  }
};

ChatWindowNotifier = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IConfigurationService)
], ChatWindowNotifier);
export { observeIsIdle, ChatWindowNotifier };
