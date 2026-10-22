// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionTour.ts
import { localize } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { EditorPartModalContext } from "./module-0950.mjs";
import { SPOTLIGHT_PRESENTATION_KIND } from "./module-3803.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionTour.ts
var NEW_SESSION_TOUR_ID = "sessions.onboarding.newSession";

var NEW_SESSION_ONBOARDING_SEEN_KEY = NEW_SESSION_TOUR_ID;

var NEW_SESSION_EXPERIMENT = {
  behaviorFlag: "onb.newSession.show",
  assignmentContextIdFlag: "onb.newSession.id"
};

var newSessionPayload = {
  steps: [
    {
      id: "workspacePicker",
      targetId: "sessions.newSession.workspacePicker",
      title: localize(4872, null),
      description: localize(4871, null),
      placement: "above"
    },
    {
      id: "isolation",
      targetId: "sessions.newSession.isolation",
      title: localize(4870, null),
      description: localize(4869, null),
      placement: "below"
    }
  ]
};

function createNewSessionTour(signal) {
  return {
    id: NEW_SESSION_TOUR_ID,
    seenKey: NEW_SESSION_ONBOARDING_SEEN_KEY,
    when: ContextKeyExpr.and(ChatContextKeys.enabled, EditorPartModalContext.toNegated()),
    trigger: { kind: "observable", signal },
    priority: 100,
    experiment: NEW_SESSION_EXPERIMENT,
    presentation: {
      kind: SPOTLIGHT_PRESENTATION_KIND,
      payload: newSessionPayload
    }
  };
}
export { createNewSessionTour, NEW_SESSION_TOUR_ID, NEW_SESSION_ONBOARDING_SEEN_KEY, NEW_SESSION_EXPERIMENT, newSessionPayload };
