// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/spotlight/onboardingTarget.ts



// src/vs/workbench/contrib/onboarding/browser/spotlight/onboardingTarget.ts
var ONBOARDING_TARGET_ATTR = "data-onboarding-id";

var onboardingTargetRegistrations = /* @__PURE__ */ new WeakMap();

function openOnboardingTarget(element) {
  return onboardingTargetRegistrations.get(element)?.options.open?.();
}

function findOnboardingTarget(targetWindow, id2) {
  const selector = `[${ONBOARDING_TARGET_ATTR}="${CSS.escape(id2)}"]`;
  const targets = Array.from(targetWindow.document.querySelectorAll(selector));
  return targets.find((target) => isVisibleOnboardingTarget(targetWindow, target));
}

function isVisibleOnboardingTarget(targetWindow, target) {
  if (!target.isConnected) {
    return false;
  }
  const style = targetWindow.getComputedStyle(target);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  const rect = target.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
export { openOnboardingTarget, findOnboardingTarget, isVisibleOnboardingTarget, ONBOARDING_TARGET_ATTR, onboardingTargetRegistrations };
