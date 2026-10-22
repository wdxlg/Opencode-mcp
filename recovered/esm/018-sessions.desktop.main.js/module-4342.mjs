// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/electron-browser/sessions.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { SESSIONS_APPLICATION_BADGE_SETTING, SessionsApplicationBadge } from "./module-4341.mjs";
import { localize } from "./module-0001.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/sessions/electron-browser/sessions.contribution.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [SESSIONS_APPLICATION_BADGE_SETTING]: {
      type: "boolean",
      tags: ["preview"],
      description: localize(5618, null),
      default: false,
      experiment: { mode: "auto" }
    }
  }
});

registerWorkbenchContribution2(SessionsApplicationBadge.ID, SessionsApplicationBadge, WorkbenchPhase.AfterRestored);
export {};
