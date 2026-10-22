// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/progressbar/progressAccessibilitySignal.ts



// src/vs/base/browser/ui/progressbar/progressAccessibilitySignal.ts
var nullScopedAccessibilityProgressSignalFactory = () => ({
  msLoopTime: -1,
  msDelayTime: -1,
  dispose: () => {
  }
});

var progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;

function setProgressAccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
  progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}

function getProgressAccessibilitySignalScheduler(msDelayTime, msLoopTime) {
  return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}
export { setProgressAccessibilitySignalScheduler, getProgressAccessibilitySignalScheduler, nullScopedAccessibilityProgressSignalFactory, progressAccessibilitySignalSchedulerFactory };
