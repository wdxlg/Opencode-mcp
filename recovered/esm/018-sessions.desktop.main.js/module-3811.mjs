// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewV2Tour.ts
import { createNewSessionViewRecentTourWhen, createNewSessionViewWorkspaceStep } from "./module-3810.mjs";
import { localize } from "./module-0001.mjs";
import { SessionHarnessPickerInteractiveContext } from "./module-1770.mjs";
import { NEW_SESSION_ONBOARDING_SEEN_KEY } from "./module-3807.mjs";
import { SPOTLIGHT_PRESENTATION_KIND } from "./module-3803.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewV2Tour.ts
var NEW_SESSION_VIEW_V2_TOUR_ID = "sessions.onboarding.newSessionViewV2";

var NEW_SESSION_VIEW_V2_EXPERIMENT = {
  behaviorFlag: "onb.newSessionViewV2.show",
  assignmentContextIdFlag: "onb.newSessionViewV2.id"
};

var WAIT_FOR_PICKER = { kind: "wait", timeoutMs: 5e3 };

var newSessionViewV2Payload = {
  steps: [
    createNewSessionViewWorkspaceStep(),
    {
      id: "harnessPicker",
      targetId: "sessions.newSession.harnessPicker",
      title: localize(4882, null),
      description: localize(4881, null),
      placement: "above",
      missingTarget: WAIT_FOR_PICKER,
      openTarget: false,
      when: SessionHarnessPickerInteractiveContext,
      allowTargetInteraction: true
    },
    {
      id: "modelPicker",
      targetId: "sessions.newSession.modelPicker",
      title: localize(4884, null),
      description: localize(4883, null),
      placement: "below",
      missingTarget: WAIT_FOR_PICKER,
      openTarget: true,
      allowTargetInteraction: true
    }
  ]
};

function createNewSessionViewV2Tour(signal) {
  return {
    id: NEW_SESSION_VIEW_V2_TOUR_ID,
    seenKey: NEW_SESSION_ONBOARDING_SEEN_KEY,
    when: createNewSessionViewRecentTourWhen(),
    trigger: { kind: "observable", signal },
    priority: 110,
    experiment: NEW_SESSION_VIEW_V2_EXPERIMENT,
    presentation: {
      kind: SPOTLIGHT_PRESENTATION_KIND,
      payload: newSessionViewV2Payload
    }
  };
}
export { createNewSessionViewV2Tour, NEW_SESSION_VIEW_V2_TOUR_ID, NEW_SESSION_VIEW_V2_EXPERIMENT, WAIT_FOR_PICKER, newSessionViewV2Payload };
