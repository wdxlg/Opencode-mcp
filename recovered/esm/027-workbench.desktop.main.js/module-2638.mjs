// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.ts
var PROGRESS_SIGNAL_LOOP_DELAY = 5e3;

var AccessibilityProgressSignalScheduler = class extends Disposable {
  constructor(msDelayTime, msLoopTime, _accessibilitySignalService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._scheduler = this._register(new RunOnceScheduler(() => {
      this._signalLoop = this._accessibilitySignalService.playSignalLoop(AccessibilitySignal.progress, msLoopTime ?? PROGRESS_SIGNAL_LOOP_DELAY);
    }, msDelayTime));
    this._scheduler.schedule();
  }
  dispose() {
    super.dispose();
    this._signalLoop?.dispose();
    this._scheduler.dispose();
  }
};

AccessibilityProgressSignalScheduler = __decorateClass([
  __decorateParam(2, IAccessibilitySignalService)
], AccessibilityProgressSignalScheduler);
export { PROGRESS_SIGNAL_LOOP_DELAY, AccessibilityProgressSignalScheduler };
