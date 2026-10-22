// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/windows/node/windowTracker.ts
import { __esm } from "./module-0000.mjs";
import { createCancelablePromise, init_async } from "./module-0034.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableStore, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/windows/node/windowTracker.ts
var ActiveWindowManager;

var init_windowTracker = __esm({
  "src/vs/platform/windows/node/windowTracker.ts"() {
    init_async();
    init_event();
    init_lifecycle();
    ActiveWindowManager = class extends Disposable {
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
  }
});
export { ActiveWindowManager, init_windowTracker };
