// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeOnboarding/browser/welcomeOnboarding.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { IOnboardingService } from "./module-3552.mjs";
import { OnboardingVariationA } from "./module-3575.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/contrib/welcomeOnboarding/browser/welcomeOnboarding.contribution.ts
registerSingleton(IOnboardingService, OnboardingVariationA, 1 /* Delayed */);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.welcomeOnboarding2026",
      title: localize2(22230, "Welcome Onboarding 2026"),
      category: Categories.Developer,
      f1: true
    });
  }
  run(accessor) {
    const onboardingService = accessor.get(IOnboardingService);
    onboardingService.show();
  }
});
export {};
