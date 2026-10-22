// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeOnboarding/common/onboardingTypes.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeOnboarding/common/onboardingTypes.ts
function getOnboardingStepTitle(stepId) {
  switch (stepId) {
    case "onboarding.signIn" /* SignIn */:
      return localize(22241, null);
    case "onboarding.personalize" /* Personalize */:
      return localize(22239, null);
    case "onboarding.aiPreference" /* AiPreference */:
      return localize(22237, null);
  }
}

function getOnboardingStepSubtitle(stepId) {
  switch (stepId) {
    case "onboarding.signIn" /* SignIn */:
      return localize(22242, null);
    case "onboarding.personalize" /* Personalize */:
      return localize(22240, null);
    case "onboarding.aiPreference" /* AiPreference */:
      return localize(22238, null);
  }
}

var ONBOARDING_STEPS = [
  "onboarding.signIn" /* SignIn */,
  "onboarding.personalize" /* Personalize */
];

var ONBOARDING_AI_PREFERENCE_OPTIONS = [
  {
    id: "code-first" /* CodeFirst */,
    label: localize(22235, null),
    description: localize(22236, null),
    icon: "edit"
  },
  {
    id: "balanced" /* Balanced */,
    label: localize(22233, null),
    description: localize(22234, null),
    icon: "layoutSidebarRight"
  },
  {
    id: "agent-forward" /* AgentForward */,
    label: localize(22231, null),
    description: localize(22232, null),
    icon: "copilot"
  }
];

var ONBOARDING_STORAGE_KEY = "welcomeOnboarding.state";

var GHE_DOMAIN_REGEX = /^[a-zA-Z0-9-]+$/;

var GHE_FULL_URI_REGEX = /^(https:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.ghe\.com\/?$/;

function parseGheInstanceInput(value2) {
  const trimmed = value2.trim();
  if (!trimmed) {
    return { kind: "empty" /* Empty */ };
  }
  if (GHE_DOMAIN_REGEX.test(trimmed)) {
    return { kind: "singleWord" /* SingleWord */, resolvedUri: `https://${trimmed}.ghe.com` };
  }
  if (GHE_FULL_URI_REGEX.test(trimmed)) {
    const resolvedUri = trimmed.toLowerCase().startsWith("https://") ? trimmed : `https://${trimmed}`;
    return { kind: "fullUri" /* FullUri */, resolvedUri };
  }
  return { kind: "invalid" /* Invalid */ };
}
export { getOnboardingStepTitle, getOnboardingStepSubtitle, parseGheInstanceInput, ONBOARDING_STEPS, ONBOARDING_AI_PREFERENCE_OPTIONS, ONBOARDING_STORAGE_KEY, GHE_DOMAIN_REGEX, GHE_FULL_URI_REGEX };
