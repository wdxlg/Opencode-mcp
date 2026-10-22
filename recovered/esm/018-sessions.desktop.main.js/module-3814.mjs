// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewV3Tour.ts
import { NEW_SESSION_ONBOARDING_SEEN_KEY } from "./module-3807.mjs";
import { createNewSessionViewRecentTourWhen, createNewSessionViewWorkspaceStep } from "./module-3810.mjs";
import { ONBOARDING_SEQUENCE_PRESENTATION_KIND } from "./module-3796.mjs";
import { SPOTLIGHT_PRESENTATION_KIND } from "./module-3803.mjs";
import { RUN_ONBOARDING_STEP_KIND } from "./module-3800.mjs";


// src/vs/sessions/contrib/onboardingTours/browser/tours/newSessionViewV3Tour.ts
var NEW_SESSION_VIEW_V3_TOUR_ID = "sessions.onboarding.newSessionViewV3";

var NEW_SESSION_VIEW_V3_PROMPT_VARIATION = "prompt";

var NEW_SESSION_VIEW_V3_GITHUB_PROMPT_VARIATION = "githubPrompt";

var NEW_SESSION_VIEW_V3_OPTIONS_VARIATION = "options";

var NEW_SESSION_VIEW_V3_VARIATION_TREATMENT = "onb.newSessionViewV3.variation";

var NEW_SESSION_VIEW_V3_VARIATIONS = [NEW_SESSION_VIEW_V3_PROMPT_VARIATION, NEW_SESSION_VIEW_V3_GITHUB_PROMPT_VARIATION, NEW_SESSION_VIEW_V3_OPTIONS_VARIATION];

var NEW_SESSION_VIEW_V3_EXPERIMENT = {
  behaviorFlag: "onb.newSessionViewV3.show",
  assignmentContextIdFlag: "onb.newSessionViewV3.id"
};

function createNewSessionViewV3Tour(signal, runPromptStep) {
  return {
    id: NEW_SESSION_VIEW_V3_TOUR_ID,
    seenKey: NEW_SESSION_ONBOARDING_SEEN_KEY,
    developerModeVariations: NEW_SESSION_VIEW_V3_VARIATIONS,
    when: createNewSessionViewRecentTourWhen(),
    trigger: { kind: "observable", signal },
    priority: 120,
    experiment: NEW_SESSION_VIEW_V3_EXPERIMENT,
    presentation: {
      kind: ONBOARDING_SEQUENCE_PRESENTATION_KIND,
      payload: {
        steps: [
          {
            id: "workspacePicker",
            kind: SPOTLIGHT_PRESENTATION_KIND,
            payload: createNewSessionViewWorkspaceStep()
          },
          {
            id: "insertPrompt",
            kind: RUN_ONBOARDING_STEP_KIND,
            payload: {
              run: async (token) => ({ shown: await runPromptStep(token) })
            }
          }
        ]
      }
    }
  };
}
export { createNewSessionViewV3Tour, NEW_SESSION_VIEW_V3_TOUR_ID, NEW_SESSION_VIEW_V3_PROMPT_VARIATION, NEW_SESSION_VIEW_V3_GITHUB_PROMPT_VARIATION, NEW_SESSION_VIEW_V3_OPTIONS_VARIATION, NEW_SESSION_VIEW_V3_VARIATION_TREATMENT, NEW_SESSION_VIEW_V3_VARIATIONS, NEW_SESSION_VIEW_V3_EXPERIMENT };
