// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserArenaFollowLatest.ts
import { __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { RunOnceScheduler, init_async } from "./module-0034.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { browserViewIsolatedWorldId, init_browserView } from "./module-0069.mjs";
import { init_browserArenaFollowLatestPage, installArenaFollowLatest } from "./module-0142.mjs";


// src/vs/platform/browserView/electron-main/browserArenaFollowLatest.ts
var BrowserArenaFollowLatest;

var init_browserArenaFollowLatest = __esm({
  "src/vs/platform/browserView/electron-main/browserArenaFollowLatest.ts"() {
    init_lifecycle();
    init_async();
    init_event();
    init_browserView();
    init_browserArenaFollowLatestPage();
    BrowserArenaFollowLatest = class extends Disposable {
      constructor(contents) {
        super();
        this.contents = contents;
        this.enabled = true;
        this.configuredEnabled = true;
        this.stopped = false;
        this.revision = 0;
        this.queue = Promise.resolve();
        this.state = { enabled: true, generating: false };
        this.changed = this._register(new Emitter());
        this.onDidChange = this.changed.event;
        this.sampler = this._register(new RunOnceScheduler(() => {
          void this.sample();
        }, 500));
        const loaded = () => {
          this.apply();
        };
        contents.on("did-finish-load", loaded);
        this._register(toDisposable(() => contents.removeListener("did-finish-load", loaded)));
        this.apply();
      }
      get snapshot() {
        return { ...this.state };
      }
      setEnabled(enabled, currentTurn = false) {
        if (this.stopped) {
          return;
        }
        if (!currentTurn) {
          if (this.configuredEnabled === enabled) {
            return;
          }
          this.configuredEnabled = enabled;
        }
        this.enabled = enabled;
        this.apply();
      }
      available() {
        if (this.stopped || this.contents.isDestroyed() || this.contents.isLoadingMainFrame()) {
          return false;
        }
        const url = URL.parse(this.contents.getURL());
        return url?.protocol === "https:" && /^(www\.)?arena\.ai$/.test(url.hostname);
      }
      update(value) {
        if (!value || typeof value.enabled !== "boolean" || typeof value.generating !== "boolean") {
          return;
        }
        if (value.enabled !== this.state.enabled || value.generating !== this.state.generating) {
          this.state = { enabled: value.enabled, generating: value.generating };
          this.changed.fire(this.snapshot);
        }
      }
      apply() {
        this.revision++;
        this.queue = this.queue.then(async () => {
          if (!this.available()) {
            return;
          }
          const value = await this.contents.executeJavaScriptInIsolatedWorld(browserViewIsolatedWorldId, [{
            code: `(${installArenaFollowLatest.toString()})(${this.enabled}); window.__opencodeArenaFollowLatest?.snapshot();`
          }]);
          if (!this.stopped) {
            this.update(value);
            this.sampler.schedule();
          }
        }).catch(() => {
          if (!this.stopped) {
            this.sampler.schedule();
          }
        });
      }
      async sample() {
        const revision = this.revision;
        try {
          if (!this.available()) {
            return;
          }
          const state = await this.contents.executeJavaScriptInIsolatedWorld(browserViewIsolatedWorldId, [{ code: "window.__opencodeArenaFollowLatest?.snapshot();" }]);
          if (!this.stopped && revision === this.revision) {
            this.update(state);
          }
        } catch {
        } finally {
          if (!this.stopped) {
            this.sampler.schedule();
          }
        }
      }
      dispose() {
        this.stopped = true;
        this.sampler.cancel();
        if (!this.contents.isDestroyed() && !this.contents.isLoadingMainFrame()) {
          void this.contents.executeJavaScriptInIsolatedWorld(browserViewIsolatedWorldId, [{ code: "window.__opencodeArenaFollowLatest?.dispose(); delete window.__opencodeArenaFollowLatest;" }]).catch(() => {
          });
        }
        super.dispose();
      }
    };
  }
});
export { BrowserArenaFollowLatest, init_browserArenaFollowLatest };
