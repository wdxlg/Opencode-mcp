// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userActivity/browser/domActivityTracker.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { WindowIntervalTimer, addDisposableListener, onDidRegisterWindow } from "./module-0075.mjs";
import { Event2 } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/services/userActivity/browser/domActivityTracker.ts
var CHECK_INTERVAL = 3e4;

var MIN_INTERVALS_WITHOUT_ACTIVITY = 2;

var eventListenerOptions = {
  passive: true,
  /** does not preventDefault() */
  capture: true
  /** should dispatch first (before anyone stopPropagation()) */
};

var DomActivityTracker = class extends Disposable {
  constructor(userActivityService) {
    super();
    let intervalsWithoutActivity = MIN_INTERVALS_WITHOUT_ACTIVITY;
    const intervalTimer = this._register(new WindowIntervalTimer());
    const activeMutex = this._register(new MutableDisposable());
    activeMutex.value = userActivityService.markActive();
    const onInterval = () => {
      if (++intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
        activeMutex.clear();
        intervalTimer.cancel();
      }
    };
    const onActivity = (targetWindow) => {
      if (intervalsWithoutActivity === MIN_INTERVALS_WITHOUT_ACTIVITY) {
        activeMutex.value = userActivityService.markActive();
        intervalTimer.cancelAndSet(onInterval, CHECK_INTERVAL, targetWindow);
      }
      intervalsWithoutActivity = 0;
    };
    this._register(Event2.runAndSubscribe(onDidRegisterWindow, ({ window: window2, disposables }) => {
      disposables.add(addDisposableListener(window2.document, "touchstart", () => onActivity(window2), eventListenerOptions));
      disposables.add(addDisposableListener(window2.document, "mousedown", () => onActivity(window2), eventListenerOptions));
      disposables.add(addDisposableListener(window2.document, "keydown", () => onActivity(window2), eventListenerOptions));
    }, { window: mainWindow, disposables: this._store }));
    onActivity(mainWindow);
  }
};
export { CHECK_INTERVAL, MIN_INTERVALS_WITHOUT_ACTIVITY, eventListenerOptions, DomActivityTracker };
