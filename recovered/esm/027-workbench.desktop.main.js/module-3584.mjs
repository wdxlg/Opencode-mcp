// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/sequence/sequencePresentation.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ONBOARDING_SEQUENCE_PRESENTATION_KIND, onboardingSequenceStepPresentationRegistry } from "./module-3579.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/contrib/onboarding/browser/sequence/sequencePresentation.ts
var OnboardingSequencePresentation = class extends Disposable {
  constructor() {
    super(...arguments);
    this.kind = ONBOARDING_SEQUENCE_PRESENTATION_KIND;
  }
  async run(scenario, context2) {
    const steps = scenario.presentation.payload?.steps ?? [];
    if (steps.length === 0) {
      return { outcome: "completed" /* Completed */, shown: false, dismissReason: "completed" /* Completed */, lastStepIndex: 0, stepCount: 0 };
    }
    const store = new DisposableStore();
    try {
      const cancellation = store.add(new CancellationTokenSource());
      store.add(context2.onAbort(() => cancellation.cancel()));
      const skippedVisualSteps = /* @__PURE__ */ new Set();
      const shownVisualSteps = /* @__PURE__ */ new Set();
      const executedRunOnceSteps = /* @__PURE__ */ new Set();
      const visualStepCount = steps.reduce((count2, step) => count2 + (this._presentation(step)?.countsAsVisualStep ? 1 : 0), 0);
      let index2 = 0;
      let direction = 1;
      let shown = false;
      let lastStepIndex = 0;
      let dismissReason = "completed" /* Completed */;
      while (index2 >= 0 && index2 < steps.length && !cancellation.token.isCancellationRequested) {
        const step = steps[index2];
        const presentation2 = this._presentation(step);
        if (!presentation2) {
          onUnexpectedError(new Error(`No onboarding sequence step presentation registered for '${step.kind}'.`));
          return { outcome: "aborted" /* Aborted */, shown, dismissReason: "aborted" /* Aborted */, lastStepIndex, stepCount: steps.length };
        }
        if (!presentation2.countsAsVisualStep && direction === -1) {
          index2--;
          continue;
        }
        if (presentation2.runOnce && executedRunOnceSteps.has(index2)) {
          index2 += direction;
          continue;
        }
        if (presentation2.runOnce) {
          executedRunOnceSteps.add(index2);
        }
        if (presentation2.countsAsVisualStep) {
          skippedVisualSteps.delete(index2);
        }
        const visualStepIndex = this._visualStepIndex(steps, index2, skippedVisualSteps);
        const currentVisualStepCount = visualStepCount - skippedVisualSteps.size;
        if (!presentation2.countsAsVisualStep) {
          lastStepIndex = Math.max(lastStepIndex, index2);
        }
        const result = await presentation2.runStep(step, {
          ...context2,
          cancellationToken: cancellation.token,
          stepIndex: index2,
          visualStepIndex,
          visualStepCount: currentVisualStepCount,
          canGoBack: Array.from(shownVisualSteps).some((stepIndex) => stepIndex < index2),
          isLastVisualStep: visualStepIndex === currentVisualStepCount - 1
        });
        if (cancellation.token.isCancellationRequested || result.action === "abort") {
          return { outcome: "aborted" /* Aborted */, shown, dismissReason: "aborted" /* Aborted */, lastStepIndex, stepCount: steps.length };
        }
        if (result.shown) {
          shown = true;
          lastStepIndex = Math.max(lastStepIndex, index2);
          if (presentation2.countsAsVisualStep) {
            shownVisualSteps.add(index2);
          }
        }
        switch (result.action) {
          case "next":
            dismissReason = result.dismissReason ?? dismissReason;
            direction = 1;
            index2++;
            break;
          case "back":
            direction = -1;
            index2--;
            break;
          case "skipStep":
            if (presentation2.countsAsVisualStep) {
              skippedVisualSteps.add(index2);
            }
            index2 += direction;
            break;
          case "skipSequence":
            return {
              outcome: "skipped" /* Skipped */,
              shown,
              dismissReason: result.dismissReason ?? "skipButton" /* SkipButton */,
              lastStepIndex,
              stepCount: steps.length
            };
        }
      }
      return cancellation.token.isCancellationRequested ? { outcome: "aborted" /* Aborted */, shown, dismissReason: "aborted" /* Aborted */, lastStepIndex, stepCount: steps.length } : { outcome: "completed" /* Completed */, shown, dismissReason, lastStepIndex, stepCount: steps.length };
    } finally {
      store.dispose();
    }
  }
  _presentation(step) {
    return onboardingSequenceStepPresentationRegistry.get(step.kind);
  }
  _visualStepIndex(steps, index2, skippedVisualSteps) {
    let visualStepIndex = 0;
    for (let stepIndex = 0; stepIndex < index2; stepIndex++) {
      if (this._presentation(steps[stepIndex])?.countsAsVisualStep && !skippedVisualSteps.has(stepIndex)) {
        visualStepIndex++;
      }
    }
    return visualStepIndex;
  }
};
export { OnboardingSequencePresentation };
