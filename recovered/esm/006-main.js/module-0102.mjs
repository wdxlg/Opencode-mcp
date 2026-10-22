// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/lifecycle/electron-main/lifecycleMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { Barrier, Promises, init_async, timeout } from "./module-0034.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { cwd2, init_process } from "./module-0007.mjs";
import { assertReturnsDefined, init_types } from "./module-0016.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { init_window2 } from "./module-0097.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { getAllWindowsExcludingOffscreen, init_windows } from "./module-0101.mjs";


// src/vs/platform/lifecycle/electron-main/lifecycleMainService.ts
import electron4 from "electron";

var ILifecycleMainService, LifecycleMainService;

var init_lifecycleMainService = __esm({
  "src/vs/platform/lifecycle/electron-main/lifecycleMainService.ts"() {
    init_ipcMain();
    init_async();
    init_event();
    init_lifecycle();
    init_platform();
    init_process();
    init_types();
    init_instantiation();
    init_log();
    init_state();
    init_window2();
    init_environmentMainService();
    init_windows();
    ILifecycleMainService = createDecorator("lifecycleMainService");
    LifecycleMainService = class extends Disposable {
      constructor(logService, stateService, environmentMainService) {
        super();
        this.logService = logService;
        this.stateService = stateService;
        this.environmentMainService = environmentMainService;
        this._onBeforeShutdown = this._register(new Emitter());
        this.onBeforeShutdown = this._onBeforeShutdown.event;
        this._onWillShutdown = this._register(new Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        this._onWillLoadWindow = this._register(new Emitter());
        this.onWillLoadWindow = this._onWillLoadWindow.event;
        this._onBeforeCloseWindow = this._register(new Emitter());
        this.onBeforeCloseWindow = this._onBeforeCloseWindow.event;
        this._quitRequested = false;
        this._wasRestarted = false;
        this._phase = 1 /* Starting */;
        this.windowToCloseRequest = /* @__PURE__ */ new Set();
        this.oneTimeListenerTokenGenerator = 0;
        this.windowCounter = 0;
        this.pendingQuitPromise = void 0;
        this.pendingQuitPromiseResolve = void 0;
        this.pendingWillShutdownPromise = void 0;
        this.mapWindowIdToPendingUnload = /* @__PURE__ */ new Map();
        this.phaseWhen = /* @__PURE__ */ new Map();
        this.relaunchHandler = void 0;
        this.resolveRestarted();
        this.when(2 /* Ready */).then(() => this.registerListeners());
      }
      static {
        this.QUIT_AND_RESTART_KEY = "lifecycle.quitAndRestart";
      }
      get quitRequested() {
        return this._quitRequested;
      }
      get wasRestarted() {
        return this._wasRestarted;
      }
      get phase() {
        return this._phase;
      }
      resolveRestarted() {
        this._wasRestarted = !!this.stateService.getItem(LifecycleMainService.QUIT_AND_RESTART_KEY);
        if (this._wasRestarted) {
          this.stateService.removeItem(LifecycleMainService.QUIT_AND_RESTART_KEY);
        }
      }
      registerListeners() {
        const beforeQuitListener = () => {
          if (this._quitRequested) {
            return;
          }
          this.trace("Lifecycle#app.on(before-quit)");
          this._quitRequested = true;
          this.trace("Lifecycle#onBeforeShutdown.fire()");
          this._onBeforeShutdown.fire();
          if (isMacintosh && this.windowCounter === 0) {
            this.fireOnWillShutdown(1 /* QUIT */);
          }
        };
        electron4.app.addListener("before-quit", beforeQuitListener);
        const windowAllClosedListener = () => {
          this.trace("Lifecycle#app.on(window-all-closed)");
          if (this._quitRequested || !isMacintosh) {
            electron4.app.quit();
          }
        };
        electron4.app.addListener("window-all-closed", windowAllClosedListener);
        electron4.app.once("will-quit", (e) => {
          this.trace("Lifecycle#app.on(will-quit) - begin");
          e.preventDefault();
          const shutdownPromise = this.fireOnWillShutdown(1 /* QUIT */);
          shutdownPromise.finally(() => {
            this.trace("Lifecycle#app.on(will-quit) - after fireOnWillShutdown");
            this.resolvePendingQuitPromise(
              false
              /* no veto */
            );
            electron4.app.removeListener("before-quit", beforeQuitListener);
            electron4.app.removeListener("window-all-closed", windowAllClosedListener);
            this.trace("Lifecycle#app.on(will-quit) - calling app.quit()");
            electron4.app.quit();
          });
        });
      }
      fireOnWillShutdown(reason) {
        if (this.pendingWillShutdownPromise) {
          return this.pendingWillShutdownPromise;
        }
        const logService = this.logService;
        this.trace("Lifecycle#onWillShutdown.fire()");
        const joiners = [];
        this._onWillShutdown.fire({
          reason,
          join(id2, promise) {
            logService.trace(`Lifecycle#onWillShutdown - begin '${id2}'`);
            joiners.push(promise.finally(() => {
              logService.trace(`Lifecycle#onWillShutdown - end '${id2}'`);
            }));
          }
        });
        this.pendingWillShutdownPromise = (async () => {
          try {
            await Promises.settled(joiners);
          } catch (error) {
            this.logService.error(error);
          }
          try {
            await this.stateService.close();
          } catch (error) {
            this.logService.error(error);
          }
        })();
        return this.pendingWillShutdownPromise;
      }
      set phase(value) {
        if (value < this.phase) {
          throw new Error("Lifecycle cannot go backwards");
        }
        if (this._phase === value) {
          return;
        }
        this.trace(`lifecycle (main): phase changed (value: ${value})`);
        this._phase = value;
        const barrier = this.phaseWhen.get(this._phase);
        if (barrier) {
          barrier.open();
          this.phaseWhen.delete(this._phase);
        }
      }
      async when(phase) {
        if (phase <= this._phase) {
          return;
        }
        let barrier = this.phaseWhen.get(phase);
        if (!barrier) {
          barrier = new Barrier();
          this.phaseWhen.set(phase, barrier);
        }
        await barrier.wait();
      }
      registerWindow(window2) {
        const windowListeners = new DisposableStore();
        this.windowCounter++;
        windowListeners.add(window2.onWillLoad((e) => this._onWillLoadWindow.fire({ window: window2, workspace: e.workspace, reason: e.reason })));
        const win = assertReturnsDefined(window2.win);
        windowListeners.add(Event.fromNodeEventEmitter(win, "close")((e) => {
          const windowId = window2.id;
          if (this.windowToCloseRequest.delete(windowId)) {
            return;
          }
          this.trace(`Lifecycle#window.on('close') - window ID ${window2.id}`);
          e.preventDefault();
          this.unload(window2, 1 /* CLOSE */).then((veto) => {
            if (veto) {
              this.windowToCloseRequest.delete(windowId);
              return;
            }
            this.windowToCloseRequest.add(windowId);
            this.trace(`Lifecycle#onBeforeCloseWindow.fire() - window ID ${windowId}`);
            this._onBeforeCloseWindow.fire(window2);
            window2.close();
          });
        }));
        windowListeners.add(Event.fromNodeEventEmitter(win, "closed")(() => {
          this.trace(`Lifecycle#window.on('closed') - window ID ${window2.id}`);
          this.windowCounter--;
          windowListeners.dispose();
          if (this.windowCounter === 0 && (!isMacintosh || this._quitRequested)) {
            this.fireOnWillShutdown(1 /* QUIT */);
          }
        }));
      }
      registerAuxWindow(auxWindow) {
        const win = assertReturnsDefined(auxWindow.win);
        const windowListeners = new DisposableStore();
        windowListeners.add(Event.fromNodeEventEmitter(win, "close")((e) => {
          this.trace(`Lifecycle#auxWindow.on('close') - window ID ${auxWindow.id}`);
          if (this._quitRequested) {
            this.trace(`Lifecycle#auxWindow.on('close') - preventDefault() because quit requested`);
            e.preventDefault();
          }
        }));
        windowListeners.add(Event.fromNodeEventEmitter(win, "closed")(() => {
          this.trace(`Lifecycle#auxWindow.on('closed') - window ID ${auxWindow.id}`);
          windowListeners.dispose();
        }));
      }
      async reload(window2, cli) {
        const veto = await this.unload(window2, 3 /* RELOAD */);
        if (!veto) {
          window2.reload(cli);
        }
      }
      unload(window2, reason) {
        const pendingUnloadPromise = this.mapWindowIdToPendingUnload.get(window2.id);
        if (pendingUnloadPromise) {
          return pendingUnloadPromise;
        }
        const unloadPromise = this.doUnload(window2, reason).finally(() => {
          this.mapWindowIdToPendingUnload.delete(window2.id);
        });
        this.mapWindowIdToPendingUnload.set(window2.id, unloadPromise);
        return unloadPromise;
      }
      async doUnload(window2, reason) {
        if (!window2.isReady) {
          return false;
        }
        this.trace(`Lifecycle#unload() - window ID ${window2.id}`);
        const windowUnloadReason = this._quitRequested ? 2 /* QUIT */ : reason;
        const veto = await this.onBeforeUnloadWindowInRenderer(window2, windowUnloadReason);
        if (veto) {
          this.trace(`Lifecycle#unload() - veto in renderer (window ID ${window2.id})`);
          return this.handleWindowUnloadVeto(veto);
        }
        await this.onWillUnloadWindowInRenderer(window2, windowUnloadReason);
        return false;
      }
      handleWindowUnloadVeto(veto) {
        if (!veto) {
          return false;
        }
        this.resolvePendingQuitPromise(
          true
          /* veto */
        );
        this._quitRequested = false;
        return true;
      }
      resolvePendingQuitPromise(veto) {
        if (this.pendingQuitPromiseResolve) {
          this.pendingQuitPromiseResolve(veto);
          this.pendingQuitPromiseResolve = void 0;
          this.pendingQuitPromise = void 0;
        }
      }
      onBeforeUnloadWindowInRenderer(window2, reason) {
        return new Promise((resolve3) => {
          const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
          const okChannel = `vscode:ok${oneTimeEventToken}`;
          const cancelChannel = `vscode:cancel${oneTimeEventToken}`;
          const cleanup = (value) => {
            validatedIpcMain.removeListener(okChannel, okListener);
            validatedIpcMain.removeListener(cancelChannel, cancelListener);
            resolve3(value);
          };
          const okListener = () => {
            cleanup(false);
          };
          const cancelListener = () => {
            cleanup(true);
          };
          validatedIpcMain.on(okChannel, okListener);
          validatedIpcMain.on(cancelChannel, cancelListener);
          window2.send("vscode:onBeforeUnload", { okChannel, cancelChannel, reason });
        });
      }
      onWillUnloadWindowInRenderer(window2, reason) {
        return new Promise((resolve3) => {
          const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
          const replyChannel = `vscode:reply${oneTimeEventToken}`;
          validatedIpcMain.once(replyChannel, () => resolve3());
          window2.send("vscode:onWillUnload", { replyChannel, reason });
        });
      }
      quit(willRestart) {
        return this.doQuit(willRestart).then((veto) => {
          if (!veto && willRestart) {
            try {
              if (isWindows2) {
                const currentWorkingDir = cwd2();
                if (currentWorkingDir !== process.cwd()) {
                  process.chdir(currentWorkingDir);
                }
              }
            } catch (err) {
              this.logService.error(err);
            }
          }
          return veto;
        });
      }
      doQuit(willRestart) {
        this.trace(`Lifecycle#quit() - begin (willRestart: ${willRestart})`);
        if (this.pendingQuitPromise) {
          this.trace("Lifecycle#quit() - returning pending quit promise");
          return this.pendingQuitPromise;
        }
        if (willRestart) {
          this.stateService.setItem(LifecycleMainService.QUIT_AND_RESTART_KEY, true);
        }
        this.pendingQuitPromise = new Promise((resolve3) => {
          this.pendingQuitPromiseResolve = resolve3;
          this.trace("Lifecycle#quit() - calling app.quit()");
          electron4.app.quit();
        });
        return this.pendingQuitPromise;
      }
      trace(msg) {
        if (this.environmentMainService.args["enable-smoke-test-driver"]) {
          this.logService.info(msg);
        } else {
          this.logService.trace(msg);
        }
      }
      setRelaunchHandler(handler) {
        this.relaunchHandler = handler;
      }
      async relaunch(options) {
        this.trace("Lifecycle#relaunch()");
        const args2 = process.argv.slice(1);
        if (options?.addArgs) {
          args2.push(...options.addArgs);
        }
        if (options?.removeArgs) {
          for (const a of options.removeArgs) {
            const idx = args2.indexOf(a);
            if (idx >= 0) {
              args2.splice(idx, 1);
            }
          }
        }
        const quitListener = () => {
          if (!this.relaunchHandler?.handleRelaunch(options)) {
            this.trace("Lifecycle#relaunch() - calling app.relaunch()");
            electron4.app.relaunch({ args: args2 });
          }
        };
        electron4.app.once("quit", quitListener);
        const veto = await this.quit(
          true
          /* will restart */
        );
        if (veto) {
          electron4.app.removeListener("quit", quitListener);
        }
      }
      async kill(code2) {
        this.trace("Lifecycle#kill()");
        await this.fireOnWillShutdown(2 /* KILL */);
        await Promise.race([
          // Still do not block more than 1s
          timeout(1e3),
          // Destroy any opened window: we do not unload windows here because
          // there is a chance that the unload is veto'd or long running due
          // to a participant within the window. this is not wanted when we
          // are asked to kill the application.
          (async () => {
            for (const window2 of getAllWindowsExcludingOffscreen()) {
              if (window2 && !window2.isDestroyed()) {
                let whenWindowClosed;
                if (window2.webContents && !window2.webContents.isDestroyed()) {
                  whenWindowClosed = new Promise((resolve3) => window2.once("closed", resolve3));
                } else {
                  whenWindowClosed = Promise.resolve();
                }
                window2.destroy();
                await whenWindowClosed;
              }
            }
          })()
        ]);
        electron4.app.exit(code2);
      }
    };
    LifecycleMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IStateService),
      __decorateParam(2, IEnvironmentMainService)
    ], LifecycleMainService);
  }
});
export { electron4, ILifecycleMainService, LifecycleMainService, init_lifecycleMainService };
