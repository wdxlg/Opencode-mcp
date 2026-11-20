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
import { INotificationService, Severity2 } from "./module-0336.mjs";


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
  constructor(_chatService, _chatWidgetService, _hostService, _configurationService, _notificationService) {
    super();
    this._notificationService = _notificationService;
    // OpenCode notify-center-step01: 已完成/失败的通知按对话记着，同一对话新通知替换旧的。
    this._ocDoneNotifications = /* @__PURE__ */ new Map();
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
  // OpenCode notify-center-step01: AI 对话的「等待确认」「已完成/失败/已停止」不再弹系统通知，
  // 统一发到右下角铃铛的通知中心。窗口在前台且正看着这个对话时，完成类通知静默进通知中心，不弹出。
  // chat.notifyWindowOnConfirmation / chat.notifyWindowOnResponseReceived 设为 off 仍可关闭。
  async _notifyIfNeeded(sessionResource, info) {
    const mode = this._configurationService.getValue("chat.notifyWindowOnConfirmation" /* NotifyWindowOnConfirmation */);
    if (mode === "off" /* Off */) {
      return;
    }
    const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
    const targetWindow = widget ? getWindow(widget.domNode) : mainWindow;
    await this._delayForBackgroundWindow(widget?.visible === true);
    const model = this._chatService.getSession(sessionResource);
    if (!model?.requestNeedsInput.get()) {
      return;
    }
    this._clearNotification(sessionResource);
    if (!targetWindow.document.hasFocus()) {
      await this._hostService.focus(targetWindow, { mode: 1 /* Notify */ });
    }
    const isQuestionCarousel = this._isQuestionCarouselPending(sessionResource);
    const title = info.title || model.title;
    const primary = [];
    if (!isQuestionCarousel && this._ocHasPendingConfirmation(sessionResource)) {
      primary.push(this._ocAction("opencode.chatNotify.allow", "\u5141\u8bb8", () => {
        if (!this._confirmAllow(sessionResource)) {
          return this._ocOpenSession(sessionResource, targetWindow);
        }
      }));
    }
    primary.push(this._ocAction("opencode.chatNotify.open", "\u6253\u5f00\u5bf9\u8bdd", () => this._ocOpenSession(sessionResource, targetWindow)));
    const handle = this._notificationService.notify({
      severity: Severity2.Warning,
      source: "AI \u4efb\u52a1",
      message: (isQuestionCarousel ? "AI \u4efb\u52a1\u5728\u7b49\u4f60\u56de\u7b54" : "AI \u4efb\u52a1\u5728\u7b49\u4f60\u786e\u8ba4") + (title ? "\uff1a" + title : "") + " \u2014 " + this._getNotificationBody(sessionResource, info, isQuestionCarousel),
      actions: { primary }
    });
    this._activeNotifications.set(sessionResource, toDisposable(() => handle.close()));
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
    this._clearNotification(model.sessionResource);
    const isFocused = targetWindow.document.hasFocus();
    if (!isFocused) {
      await this._hostService.focus(targetWindow, { mode: 1 /* Notify */ });
    }
    const response = model.lastRequest?.response;
    const errorMessage = response?.result?.errorDetails?.message;
    let severity = Severity2.Info;
    let head = "AI \u4efb\u52a1\u5df2\u5b8c\u6210";
    if (response?.isCanceled) {
      head = "AI \u4efb\u52a1\u5df2\u505c\u6b62";
    } else if (response?.result?.errorDetails) {
      severity = Severity2.Error;
      head = "AI \u4efb\u52a1\u5931\u8d25";
    }
    const quiet = isFocused && widget?.visible === true && severity !== Severity2.Error;
    const sessionResource = model.sessionResource;
    this._ocDoneNotifications.get(sessionResource.toString())?.close();
    const handle = this._notificationService.notify({
      severity,
      source: "AI \u4efb\u52a1",
      message: head + (model.title ? "\uff1a" + model.title : "") + (errorMessage ? " \u2014 " + errorMessage : ""),
      actions: { primary: [this._ocAction("opencode.chatNotify.open", "\u6253\u5f00\u5bf9\u8bdd", () => this._ocOpenSession(sessionResource, targetWindow))] },
      priority: quiet ? 2 /* SILENT */ : void 0
    });
    this._ocDoneNotifications.set(sessionResource.toString(), handle);
    const closeListener = handle.onDidClose(() => {
      closeListener.dispose();
      if (this._ocDoneNotifications.get(sessionResource.toString()) === handle) {
        this._ocDoneNotifications.delete(sessionResource.toString());
      }
    });
  }
  _ocAction(id, label, run) {
    return { id, label, tooltip: label, class: void 0, enabled: true, run: async () => {
      try {
        await run();
      } catch (error) {
        console.warn("[OpenCode] chat notify action failed", error);
      }
    } };
  }
  async _ocOpenSession(sessionResource, targetWindow) {
    await this._hostService.focus(targetWindow, { mode: 2 /* Force */ });
    const widget = await this._chatWidgetService.openSession(sessionResource);
    widget?.focusInput();
  }
  _ocHasPendingConfirmation(sessionResource) {
    const lastResponse = this._chatService.getSession(sessionResource)?.lastRequest?.response;
    if (!lastResponse) {
      return false;
    }
    return lastResponse.response.value.some((part) => {
      const state = part.kind === "toolInvocation" ? part.state.get() : void 0;
      return state?.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state?.type === IChatToolInvocation.StateKind.WaitingForPostApproval;
    });
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
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INotificationService)
], ChatWindowNotifier);
export { observeIsIdle, ChatWindowNotifier };
