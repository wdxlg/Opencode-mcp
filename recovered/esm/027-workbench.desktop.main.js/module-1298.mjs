// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userActivity/common/userActivityService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { RunOnceScheduler, disposableTimeout, runWhenGlobalIdle } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { userActivityRegistry } from "./module-1297.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userActivity/common/userActivityService.ts
var MARK_INACTIVE_DEBOUNCE = 1e4;

var IUserActivityService = createDecorator("IUserActivityService");

var UserActivityService = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.markInactive = this._register(new RunOnceScheduler(() => {
      this.isActive = false;
      this.changeEmitter.fire(false);
    }, MARK_INACTIVE_DEBOUNCE));
    this.changeEmitter = this._register(new Emitter());
    this.active = 0;
    /**
     * @inheritdoc
     *
     * Note: initialized to true, since the user just did something to open the
     * window. The bundled DomActivityTracker will initially assume activity
     * as well in order to unset this if the window gets abandoned.
     */
    this.isActive = true;
    /** @inheritdoc */
    this.onDidChangeIsActive = this.changeEmitter.event;
    this._register(runWhenGlobalIdle(() => userActivityRegistry.take(this, instantiationService)));
  }
  /** @inheritdoc */
  markActive(opts) {
    if (opts?.extendOnly && !this.isActive) {
      return Disposable.None;
    }
    if (opts?.whenHeldFor) {
      const store = new DisposableStore();
      store.add(disposableTimeout(() => store.add(this.markActive()), opts.whenHeldFor));
      return store;
    }
    if (++this.active === 1) {
      this.isActive = true;
      this.changeEmitter.fire(true);
      this.markInactive.cancel();
    }
    return toDisposable(() => {
      if (--this.active === 0) {
        this.markInactive.schedule();
      }
    });
  }
};

UserActivityService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], UserActivityService);

registerSingleton(IUserActivityService, UserActivityService, 1 /* Delayed */);
export { MARK_INACTIVE_DEBOUNCE, IUserActivityService, UserActivityService };
