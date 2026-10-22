// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/common/onboardingSequence.ts



// src/vs/workbench/contrib/onboarding/common/onboardingSequence.ts
var ONBOARDING_SEQUENCE_PRESENTATION_KIND = "sequence";

var OnboardingSequenceStepPresentationRegistry = class {
  constructor() {
    this._presentations = /* @__PURE__ */ new Map();
  }
  register(presentation2) {
    if (this._presentations.has(presentation2.kind)) {
      throw new Error(`An onboarding sequence step presentation with kind '${presentation2.kind}' is already registered.`);
    }
    this._presentations.set(presentation2.kind, presentation2);
    return {
      dispose: () => {
        if (this._presentations.get(presentation2.kind) === presentation2) {
          this._presentations.delete(presentation2.kind);
        }
      }
    };
  }
  get(kind) {
    return this._presentations.get(kind);
  }
};

var onboardingSequenceStepPresentationRegistry = new OnboardingSequenceStepPresentationRegistry();
export { ONBOARDING_SEQUENCE_PRESENTATION_KIND, OnboardingSequenceStepPresentationRegistry, onboardingSequenceStepPresentationRegistry };
