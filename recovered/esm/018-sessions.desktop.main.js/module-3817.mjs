// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewTour.ts
import { localize } from "./module-0001.mjs";
import { IsNewChatSessionContext, SessionHarnessPickerVisibleContext, SessionIsolationPickerVisibleContext, SessionWorkspacePickerVisibleContext } from "./module-1770.mjs";
import { NEW_SESSION_ONBOARDING_SEEN_KEY } from "./module-3807.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { EditorPartModalVisibleContext } from "./module-0950.mjs";
import { SPOTLIGHT_PRESENTATION_KIND } from "./module-3803.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewTour.ts
var NEW_SESSION_VIEW_TOUR_ID = "sessions.onboarding.newSessionView";

var NEW_SESSION_VIEW_EXPERIMENT = {
  behaviorFlag: "onb.newSessionView.show",
  assignmentContextIdFlag: "onb.newSessionView.id"
};

var newSessionViewPayload = {
  steps: [
    {
      id: "workspacePicker",
      targetId: "sessions.newSession.workspacePicker",
      title: localize(4878, null),
      description: localize(4877, null),
      placement: "above",
      when: SessionWorkspacePickerVisibleContext,
      allowTargetInteraction: true
    },
    {
      id: "harnessPicker",
      targetId: "sessions.newSession.harnessPicker",
      title: localize(4874, null),
      description: localize(4873, null),
      placement: "above",
      when: SessionHarnessPickerVisibleContext,
      allowTargetInteraction: true
    },
    {
      id: "isolation",
      targetId: "sessions.newSession.isolation",
      title: localize(4876, null),
      description: localize(4875, null),
      placement: "below",
      when: SessionIsolationPickerVisibleContext,
      allowTargetInteraction: true
    }
  ]
};

function createNewSessionViewTour(signal) {
  return {
    id: NEW_SESSION_VIEW_TOUR_ID,
    seenKey: NEW_SESSION_ONBOARDING_SEEN_KEY,
    when: ContextKeyExpr.and(ChatContextKeys.enabled, IsNewChatSessionContext, EditorPartModalVisibleContext.toNegated()),
    trigger: { kind: "observable", signal },
    priority: 100,
    experiment: NEW_SESSION_VIEW_EXPERIMENT,
    presentation: {
      kind: SPOTLIGHT_PRESENTATION_KIND,
      payload: newSessionViewPayload
    }
  };
}
export { createNewSessionViewTour, NEW_SESSION_VIEW_TOUR_ID, NEW_SESSION_VIEW_EXPERIMENT, newSessionViewPayload };
