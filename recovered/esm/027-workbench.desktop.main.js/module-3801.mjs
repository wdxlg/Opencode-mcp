// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/lifecycle/electron-browser/lifecycleService.ts
import { AbstractLifecycleService } from "./module-3800.mjs";
import { ipcRenderer } from "./module-3724.mjs";
import { Promises, disposableTimeout, raceCancellation } from "./module-0036.mjs";
import { handleVetos } from "./module-3799.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ILifecycleService } from "./module-0868.mjs";


// src/vs/workbench/services/lifecycle/electron-browser/lifecycleService.ts
var NativeLifecycleService = class extends AbstractLifecycleService {
  constructor(nativeHostService, storageService, logService) {
    super(logService, storageService);
    this.nativeHostService = nativeHostService;
    this.registerListeners();
  }
  static {
    this.BEFORE_SHUTDOWN_WARNING_DELAY = 5e3;
  }
  static {
    this.WILL_SHUTDOWN_WARNING_DELAY = 800;
  }
  registerListeners() {
    const windowId = this.nativeHostService.windowId;
    ipcRenderer.on("vscode:onBeforeUnload", async (event, ...args2) => {
      const reply = args2[0];
      this.logService.trace(`[lifecycle] onBeforeUnload (reason: ${reply.reason})`);
      const veto = await this.handleBeforeShutdown(reply.reason);
      if (veto) {
        this.logService.trace("[lifecycle] onBeforeUnload prevented via veto");
        this._onShutdownVeto.fire();
        ipcRenderer.send(reply.cancelChannel, windowId);
      } else {
        this.logService.trace("[lifecycle] onBeforeUnload continues without veto");
        this.shutdownReason = reply.reason;
        ipcRenderer.send(reply.okChannel, windowId);
      }
    });
    ipcRenderer.on("vscode:onWillUnload", async (event, ...args2) => {
      const reply = args2[0];
      this.logService.trace(`[lifecycle] onWillUnload (reason: ${reply.reason})`);
      await this.handleWillShutdown(reply.reason);
      this._onDidShutdown.fire();
      ipcRenderer.send(reply.replyChannel, windowId);
    });
  }
  async handleBeforeShutdown(reason) {
    const logService = this.logService;
    const vetos = [];
    const pendingVetos = /* @__PURE__ */ new Set();
    let finalVeto = void 0;
    let finalVetoId = void 0;
    this._onBeforeShutdown.fire({
      reason,
      veto(value2, id2) {
        vetos.push(value2);
        if (value2 === true) {
          logService.info(`[lifecycle]: Shutdown was prevented (id: ${id2})`);
        } else if (value2 instanceof Promise) {
          pendingVetos.add(id2);
          value2.then((veto) => {
            if (veto === true) {
              logService.info(`[lifecycle]: Shutdown was prevented (id: ${id2})`);
            }
          }).finally(() => pendingVetos.delete(id2));
        }
      },
      finalVeto(value2, id2) {
        if (!finalVeto) {
          finalVeto = value2;
          finalVetoId = id2;
        } else {
          throw new Error(`[lifecycle]: Final veto is already defined (id: ${id2})`);
        }
      }
    });
    const longRunningBeforeShutdownWarning = disposableTimeout(() => {
      logService.warn(`[lifecycle] onBeforeShutdown is taking a long time, pending operations: ${Array.from(pendingVetos).join(", ")}`);
    }, NativeLifecycleService.BEFORE_SHUTDOWN_WARNING_DELAY);
    try {
      let veto = await handleVetos(vetos, (error) => this.handleBeforeShutdownError(error, reason));
      if (veto) {
        return veto;
      }
      if (finalVeto) {
        try {
          pendingVetos.add(finalVetoId);
          veto = await finalVeto();
          if (veto) {
            logService.info(`[lifecycle]: Shutdown was prevented by final veto (id: ${finalVetoId})`);
          }
        } catch (error) {
          veto = true;
          this.handleBeforeShutdownError(error, reason);
        }
      }
      return veto;
    } finally {
      longRunningBeforeShutdownWarning.dispose();
    }
  }
  handleBeforeShutdownError(error, reason) {
    this.logService.error(`[lifecycle]: Error during before-shutdown phase (error: ${toErrorMessage(error)})`);
    this._onBeforeShutdownError.fire({ reason, error });
  }
  async handleWillShutdown(reason) {
    this._willShutdown = true;
    const joiners = [];
    const lastJoiners = [];
    const pendingJoiners = /* @__PURE__ */ new Set();
    const cts = new CancellationTokenSource();
    this._onWillShutdown.fire({
      reason,
      token: cts.token,
      joiners: () => Array.from(pendingJoiners.values()),
      join(promiseOrPromiseFn, joiner) {
        pendingJoiners.add(joiner);
        if (joiner.order === 2 /* Last */) {
          const promiseFn = typeof promiseOrPromiseFn === "function" ? promiseOrPromiseFn : () => promiseOrPromiseFn;
          lastJoiners.push(() => promiseFn().finally(() => pendingJoiners.delete(joiner)));
        } else {
          const promise = typeof promiseOrPromiseFn === "function" ? promiseOrPromiseFn() : promiseOrPromiseFn;
          promise.finally(() => pendingJoiners.delete(joiner));
          joiners.push(promise);
        }
      },
      force: () => {
        cts.dispose(true);
      }
    });
    const longRunningWillShutdownWarning = disposableTimeout(() => {
      this.logService.warn(`[lifecycle] onWillShutdown is taking a long time, pending operations: ${Array.from(pendingJoiners).map((joiner) => joiner.id).join(", ")}`);
    }, NativeLifecycleService.WILL_SHUTDOWN_WARNING_DELAY);
    try {
      await raceCancellation(Promises.settled(joiners), cts.token);
    } catch (error) {
      this.logService.error(`[lifecycle]: Error during will-shutdown phase in default joiners (error: ${toErrorMessage(error)})`);
    }
    try {
      await raceCancellation(Promises.settled(lastJoiners.map((lastJoiner) => lastJoiner())), cts.token);
    } catch (error) {
      this.logService.error(`[lifecycle]: Error during will-shutdown phase in last joiners (error: ${toErrorMessage(error)})`);
    }
    longRunningWillShutdownWarning.dispose();
  }
  shutdown() {
    return this.nativeHostService.closeWindow();
  }
};

NativeLifecycleService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILogService)
], NativeLifecycleService);

registerSingleton(ILifecycleService, NativeLifecycleService, 0 /* Eager */);
export { NativeLifecycleService };
