// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/common/onboardingPresentation.ts



// src/vs/workbench/contrib/onboarding/common/onboardingPresentation.ts
var OnboardingPresentationRegistry = class {
  constructor() {
    this._presentations = /* @__PURE__ */ new Map();
  }
  register(presentation2) {
    const kind = presentation2.kind;
    if (this._presentations.has(kind)) {
      throw new Error(`An onboarding presentation with kind '${kind}' is already registered.`);
    }
    this._presentations.set(kind, presentation2);
    return {
      dispose: () => {
        if (this._presentations.get(kind) === presentation2) {
          this._presentations.delete(kind);
        }
      }
    };
  }
  get(kind) {
    return this._presentations.get(kind);
  }
};

var onboardingPresentationRegistry = new OnboardingPresentationRegistry();
export { OnboardingPresentationRegistry, onboardingPresentationRegistry };
