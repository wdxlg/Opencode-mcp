// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/sequence/runOnboardingStep.ts
import { raceCancellation } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/contrib/onboarding/browser/sequence/runOnboardingStep.ts
var RUN_ONBOARDING_STEP_KIND = "run";

var RunOnboardingStepPresentation = class {
  constructor() {
    this.kind = RUN_ONBOARDING_STEP_KIND;
    this.countsAsVisualStep = false;
    this.runOnce = true;
  }
  async runStep(step, context2) {
    if (context2.cancellationToken.isCancellationRequested) {
      return { action: "abort", shown: false };
    }
    let result = void 0;
    try {
      const payload = step.payload;
      result = await raceCancellation(Promise.resolve(payload.run(context2.cancellationToken)), context2.cancellationToken);
    } catch (error) {
      if (!context2.cancellationToken.isCancellationRequested) {
        onUnexpectedError(error);
      }
    }
    return context2.cancellationToken.isCancellationRequested ? { action: "abort", shown: false } : { action: "next", shown: result?.shown === true };
  }
};
export { RUN_ONBOARDING_STEP_KIND, RunOnboardingStepPresentation };
