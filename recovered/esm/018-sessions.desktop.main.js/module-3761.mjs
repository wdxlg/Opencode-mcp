// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/configuration/browser/configuration.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/sessions/contrib/configuration/browser/configuration.contribution.ts
Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{
  overrides: {
    "chat.customizationsMenu.userStoragePath": "~/.copilot",
    "github.copilot.chat.claudeCode.enabled": true
  },
  donotCache: true,
  preventExperimentOverride: true,
  source: "sessionsDefaults"
}]);
export {};
