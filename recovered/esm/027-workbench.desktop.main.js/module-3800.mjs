// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/lifecycle/common/lifecycleService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { mark } from "./module-0506.mjs";
import { LifecyclePhaseToString } from "./module-0868.mjs";
import { Barrier } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/services/lifecycle/common/lifecycleService.ts
var AbstractLifecycleService = class extends Disposable {
  constructor(logService, storageService) {
    super();
    this.logService = logService;
    this.storageService = storageService;
    this._onBeforeShutdown = this._register(new Emitter());
    this.onBeforeShutdown = this._onBeforeShutdown.event;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onDidShutdown = this._register(new Emitter());
    this.onDidShutdown = this._onDidShutdown.event;
    this._onBeforeShutdownError = this._register(new Emitter());
    this.onBeforeShutdownError = this._onBeforeShutdownError.event;
    this._onShutdownVeto = this._register(new Emitter());
    this.onShutdownVeto = this._onShutdownVeto.event;
    this._phase = 1 /* Starting */;
    this._willShutdown = false;
    this.phaseWhen = /* @__PURE__ */ new Map();
    this._startupKind = this.resolveStartupKind();
    this._register(this.storageService.onWillSaveState((e) => {
      if (e.reason === 1 /* SHUTDOWN */) {
        this.storageService.store(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* WORKSPACE */, 1 /* MACHINE */);
      }
    }));
  }
  static {
    this.LAST_SHUTDOWN_REASON_KEY = "lifecyle.lastShutdownReason";
  }
  get startupKind() {
    return this._startupKind;
  }
  get phase() {
    return this._phase;
  }
  get willShutdown() {
    return this._willShutdown;
  }
  resolveStartupKind() {
    const startupKind = this.doResolveStartupKind() ?? 1 /* NewWindow */;
    this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
    return startupKind;
  }
  doResolveStartupKind() {
    const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* WORKSPACE */);
    this.storageService.remove(AbstractLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* WORKSPACE */);
    let startupKind = void 0;
    switch (lastShutdownReason) {
      case 3 /* RELOAD */:
        startupKind = 3 /* ReloadedWindow */;
        break;
      case 4 /* LOAD */:
        startupKind = 4 /* ReopenedWindow */;
        break;
    }
    return startupKind;
  }
  set phase(value2) {
    if (value2 < this.phase) {
      throw new Error("Lifecycle cannot go backwards");
    }
    if (this._phase === value2) {
      return;
    }
    this.logService.trace(`lifecycle: phase changed (value: ${value2})`);
    this._phase = value2;
    mark(`code/LifecyclePhase/${LifecyclePhaseToString(value2)}`);
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
};

AbstractLifecycleService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IStorageService)
], AbstractLifecycleService);
export { AbstractLifecycleService };
