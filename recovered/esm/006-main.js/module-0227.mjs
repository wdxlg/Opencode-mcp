// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/updateService.snap.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_async, timeout } from "./module-0034.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { basename, dirname3, init_path } from "./module-0008.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { State, init_update } from "./module-0201.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";


// src/vs/platform/update/electron-main/updateService.snap.ts
import { spawn as spawn4 } from "child_process";

import { realpath as realpath3, watch as watch2 } from "fs";

var AbstractUpdateService2, SnapUpdateService;

var init_updateService_snap = __esm({
  "src/vs/platform/update/electron-main/updateService.snap.ts"() {
    init_async();
    init_event();
    init_path();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_update();
    init_meteredConnection();
    AbstractUpdateService2 = class {
      constructor(lifecycleMainService, environmentMainService, logService, meteredConnectionService) {
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.meteredConnectionService = meteredConnectionService;
        this._state = State.Uninitialized;
        this._onStateChange = new Emitter();
        this.onStateChange = this._onStateChange.event;
        if (environmentMainService.disableUpdates) {
          this.logService.info("update#ctor - updates are disabled");
          return;
        }
        this.setState(State.Idle(this.getUpdateType()));
        this.scheduleCheckForUpdates(30 * 1e3).then(void 0, (err) => this.logService.error(err));
      }
      get state() {
        return this._state;
      }
      setState(state) {
        this.logService.info("update#setState", state.type);
        this._state = state;
        this._onStateChange.fire(state);
        if (state.type === "idle" /* Idle */ && (state.error || state.notAvailable)) {
          this._state = State.Idle(state.updateType);
        }
      }
      scheduleCheckForUpdates(delay = 60 * 60 * 1e3) {
        return timeout(delay).then(() => this.checkForUpdates(false)).then(() => {
          return this.scheduleCheckForUpdates(60 * 60 * 1e3);
        });
      }
      async checkForUpdates(explicit) {
        this.logService.trace("update#checkForUpdates, state = ", this.state.type);
        if (this.state.type !== "idle" /* Idle */) {
          return;
        }
        this.doCheckForUpdates(explicit);
      }
      async downloadUpdate(explicit) {
        this.logService.trace("update#downloadUpdate, state = ", this.state.type);
        if (this.state.type !== "available for download" /* AvailableForDownload */) {
          return;
        }
        if (!explicit && this.meteredConnectionService.isConnectionMetered) {
          this.logService.info("update#downloadUpdate - skipping download because connection is metered");
          return;
        }
        await this.doDownloadUpdate(this.state);
      }
      doDownloadUpdate(state) {
        return Promise.resolve(void 0);
      }
      async applyUpdate() {
        this.logService.trace("update#applyUpdate, state = ", this.state.type);
        if (this.state.type !== "downloaded" /* Downloaded */) {
          return;
        }
        await this.doApplyUpdate();
      }
      doApplyUpdate() {
        return Promise.resolve(void 0);
      }
      quitAndInstall() {
        this.logService.trace("update#quitAndInstall, state = ", this.state.type);
        if (this.state.type !== "ready" /* Ready */) {
          return Promise.resolve(void 0);
        }
        const readyState = this.state;
        this.setState(State.Restarting(this.state.update));
        this.logService.trace("update#quitAndInstall(): before lifecycle quit()");
        this.lifecycleMainService.quit(
          true
          /* will restart */
        ).then((vetod) => {
          this.logService.trace(`update#quitAndInstall(): after lifecycle quit() with veto: ${vetod}`);
          if (vetod) {
            this.logService.info("update#quitAndInstall(): quit was vetoed, restoring Ready state");
            this.setState(readyState);
            return;
          }
          this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
          this.doQuitAndInstall();
        });
        return Promise.resolve(void 0);
      }
      getUpdateType() {
        return 2 /* Snap */;
      }
      doQuitAndInstall() {
      }
      async setInternalOrg(_internalOrg) {
      }
      async _applySpecificUpdate(packagePath) {
      }
    };
    AbstractUpdateService2 = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IEnvironmentMainService),
      __decorateParam(2, ILogService),
      __decorateParam(3, IMeteredConnectionService)
    ], AbstractUpdateService2);
    SnapUpdateService = class extends AbstractUpdateService2 {
      constructor(snap, snapRevision, lifecycleMainService, environmentMainService, logService, meteredConnectionService) {
        super(lifecycleMainService, environmentMainService, logService, meteredConnectionService);
        this.snap = snap;
        this.snapRevision = snapRevision;
        const watcher = watch2(dirname3(this.snap));
        const onChange = Event.fromNodeEventEmitter(watcher, "change", (_, fileName) => fileName);
        const onCurrentChange = Event.filter(onChange, (n) => n === "current");
        const onDebouncedCurrentChange = Event.debounce(onCurrentChange, (_, e) => e, 2e3);
        const listener = onDebouncedCurrentChange(() => this.checkForUpdates(false));
        Event.once(lifecycleMainService.onWillShutdown)(() => {
          listener.dispose();
          watcher.close();
        });
      }
      doCheckForUpdates() {
        this.setState(State.CheckingForUpdates(false));
        this.isUpdateAvailable().then((result) => {
          if (result) {
            this.setState(State.Ready({ version: "something" }, false, false));
          } else {
            this.setState(State.Idle(2 /* Snap */, void 0, void 0));
          }
        }, (err) => {
          this.logService.error(err);
          this.setState(State.Idle(2 /* Snap */, err.message || err));
        });
      }
      doQuitAndInstall() {
        this.logService.trace("update#quitAndInstall(): running raw#quitAndInstall()");
        spawn4("sleep 3 && " + basename(process.argv[0]), {
          shell: true,
          detached: true,
          stdio: "ignore"
        });
      }
      async isUpdateAvailable() {
        const resolvedCurrentSnapPath = await new Promise((c, e) => realpath3(`${dirname3(this.snap)}/current`, (err, r) => err ? e(err) : c(r)));
        const currentRevision = basename(resolvedCurrentSnapPath);
        return this.snapRevision !== currentRevision;
      }
      isLatestVersion() {
        return this.isUpdateAvailable().then(void 0, (err) => {
          this.logService.error("update#checkForSnapUpdate(): Could not get realpath of application.");
          return void 0;
        });
      }
    };
    SnapUpdateService = __decorateClass([
      __decorateParam(2, ILifecycleMainService),
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, ILogService),
      __decorateParam(5, IMeteredConnectionService)
    ], SnapUpdateService);
  }
});
export { spawn4, realpath3, watch2, AbstractUpdateService2, SnapUpdateService, init_updateService_snap };
