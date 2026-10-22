// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/onboarding/browser/spotlight/onboardingTarget.ts
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/onboarding/browser/spotlight/onboardingTarget.ts
var ONBOARDING_TARGET_ATTR = "data-onboarding-id";

var ONBOARDING_TARGET_PULSE_CLASS = "onboarding-target-pulse";

var onboardingTargetRegistrations = /* @__PURE__ */ new WeakMap();

function markOnboardingTarget(element, id2, options3 = {}) {
  const registration = { id: id2, options: options3 };
  element.setAttribute(ONBOARDING_TARGET_ATTR, id2);
  onboardingTargetRegistrations.set(element, registration);
  return toDisposable(() => {
    if (onboardingTargetRegistrations.get(element) === registration) {
      onboardingTargetRegistrations.delete(element);
      element.removeAttribute(ONBOARDING_TARGET_ATTR);
    }
  });
}

function openOnboardingTarget(element) {
  return onboardingTargetRegistrations.get(element)?.options.open?.();
}

function pulseOnboardingTarget(element) {
  element.classList.add(ONBOARDING_TARGET_PULSE_CLASS);
  return toDisposable(() => element.classList.remove(ONBOARDING_TARGET_PULSE_CLASS));
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
export { markOnboardingTarget, openOnboardingTarget, pulseOnboardingTarget, findOnboardingTarget, isVisibleOnboardingTarget, ONBOARDING_TARGET_ATTR, ONBOARDING_TARGET_PULSE_CLASS, onboardingTargetRegistrations };
