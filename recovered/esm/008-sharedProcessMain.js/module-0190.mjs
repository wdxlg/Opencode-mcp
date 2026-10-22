// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/windows/node/windowTracker.ts
import { Disposable, DisposableStore } from "./module-0013.mjs";
import { Event } from "./module-0018.mjs";
import { createCancelablePromise } from "./module-0029.mjs";


// src/vs/platform/windows/node/windowTracker.ts
var ActiveWindowManager = class extends Disposable {
  constructor({ onDidOpenMainWindow, onDidFocusMainWindow, getActiveWindowId }) {
    super();
    this.disposables = this._register(new DisposableStore());
    const onActiveWindowChange = Event.latch(Event.any(onDidOpenMainWindow, onDidFocusMainWindow));
    onActiveWindowChange(this.setActiveWindow, this, this.disposables);
    this.firstActiveWindowIdPromise = createCancelablePromise(() => getActiveWindowId());
    (async () => {
      try {
        const windowId = await this.firstActiveWindowIdPromise;
        this.activeWindowId = typeof this.activeWindowId === "number" ? this.activeWindowId : windowId;
      } catch (error) {
      } finally {
        this.firstActiveWindowIdPromise = void 0;
      }
    })();
  }
  setActiveWindow(windowId) {
    if (this.firstActiveWindowIdPromise) {
      this.firstActiveWindowIdPromise.cancel();
      this.firstActiveWindowIdPromise = void 0;
    }
    this.activeWindowId = windowId;
  }
  async getActiveClientId() {
    const id2 = this.firstActiveWindowIdPromise ? await this.firstActiveWindowIdPromise : this.activeWindowId;
    return `window:${id2}`;
  }
};
export { ActiveWindowManager };
