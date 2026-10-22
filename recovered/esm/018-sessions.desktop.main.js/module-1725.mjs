// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userAttention/browser/userAttentionBrowser.ts
import { Disposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { TotalTrueTimeObservable, wasTrueRecently } from "./module-1723.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { Event2 } from "./module-0017.mjs";
import { addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IHostService } from "./module-1118.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IUserAttentionService } from "./module-1724.mjs";


// src/vs/workbench/services/userAttention/browser/userAttentionBrowser.ts
var USER_ATTENTION_TIMEOUT_MS = 6e4;

var UserAttentionService = class extends Disposable {
  constructor(instantiationService, _logService) {
    super();
    this._logService = _logService;
    const hostAdapter = this._register(instantiationService.createInstance(UserAttentionServiceEnv));
    this.isVsCodeFocused = hostAdapter.isVsCodeFocused;
    this.isUserActive = hostAdapter.isUserActive;
    this._isTracingEnabled = observableFromEvent(
      this,
      this._logService.onDidChangeLogLevel,
      () => this._logService.getLevel() === 1 /* Trace */
    );
    const hadRecentActivity = wasTrueRecently(this.isUserActive, USER_ATTENTION_TIMEOUT_MS, this._store);
    this.hasUserAttention = derived(this, (reader) => {
      return hadRecentActivity.read(reader);
    });
    this._timeKeeper = this._register(new TotalTrueTimeObservable(this.hasUserAttention));
    this._register(autorun((reader) => {
      if (!this._isTracingEnabled.read(reader)) {
        return;
      }
      reader.store.add(autorun((innerReader) => {
        const focused = this.isVsCodeFocused.read(innerReader);
        this._logService.trace(`[UserAttentionService] VS Code focus changed: ${focused}`);
      }));
      reader.store.add(autorun((innerReader) => {
        const hasAttention = this.hasUserAttention.read(innerReader);
        this._logService.trace(`[UserAttentionService] User attention changed: ${hasAttention}`);
      }));
    }));
  }
  fireAfterGivenFocusTimePassed(focusTimeMs, callback) {
    return this._timeKeeper.fireWhenTimeIncreasedBy(focusTimeMs, callback);
  }
  get totalFocusTimeMs() {
    return this._timeKeeper.totalTimeMs();
  }
};

UserAttentionService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILogService)
], UserAttentionService);

var UserAttentionServiceEnv = class extends Disposable {
  constructor(_hostService, _logService) {
    super();
    this._hostService = _hostService;
    this._logService = _logService;
    this._isUserActive = observableValue(this, false);
    this.isVsCodeFocused = observableFromEvent(this, this._hostService.onDidChangeFocus, () => this._hostService.hasFocus);
    this.isUserActive = this._isUserActive;
    const onActivity = () => {
      this._markUserActivity();
    };
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2.document, "keydown", onActivity, eventListenerOptions2));
      disposables.add(addDisposableListener(window2.document, "mousemove", onActivity, eventListenerOptions2));
      disposables.add(addDisposableListener(window2.document, "mousedown", onActivity, eventListenerOptions2));
      disposables.add(addDisposableListener(window2.document, "touchstart", onActivity, eventListenerOptions2));
    }, { window: mainWindow, disposables: this._store }));
    if (this._hostService.hasFocus) {
      this._markUserActivity();
    }
  }
  _markUserActivity() {
    if (this._activityDebounceTimeout !== void 0) {
      clearTimeout(this._activityDebounceTimeout);
    } else {
      this._logService.trace("[UserAttentionService] User activity detected");
      this._isUserActive.set(true, void 0);
    }
    this._activityDebounceTimeout = setTimeout(() => {
      this._isUserActive.set(false, void 0);
      this._activityDebounceTimeout = void 0;
    }, 500);
  }
  dispose() {
    clearTimeout(this._activityDebounceTimeout);
    super.dispose();
  }
};

UserAttentionServiceEnv = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, ILogService)
], UserAttentionServiceEnv);

var eventListenerOptions2 = {
  passive: true,
  capture: true
};

registerSingleton(IUserAttentionService, UserAttentionService, 1 /* Delayed */);
export { USER_ATTENTION_TIMEOUT_MS, UserAttentionService, UserAttentionServiceEnv, eventListenerOptions2 };
