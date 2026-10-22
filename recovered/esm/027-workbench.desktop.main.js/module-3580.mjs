// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/common/onboardingScenarioService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/onboarding/common/onboardingScenarioService.ts
var IOnboardingScenarioService = createDecorator("onboardingScenarioService");

var ONBOARDING_ENABLED_CONFIG = "onboarding.enabled";

var ONBOARDING_DEVELOPER_MODE_CONFIG = "onboarding.developerMode";

var ONBOARDING_DEVELOPER_MODE_VARIATIONS_CONFIG = "onboarding.developerModeVariations";

function isOnboardingDeveloperModeEnabled(configurationService, scenarioId) {
  const value2 = configurationService.getValue(ONBOARDING_DEVELOPER_MODE_CONFIG);
  return typeof value2 === "object" && value2 !== null && value2[scenarioId] === true;
}
export { isOnboardingDeveloperModeEnabled, IOnboardingScenarioService, ONBOARDING_ENABLED_CONFIG, ONBOARDING_DEVELOPER_MODE_CONFIG, ONBOARDING_DEVELOPER_MODE_VARIATIONS_CONFIG };
