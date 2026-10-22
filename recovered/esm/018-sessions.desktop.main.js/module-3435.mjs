// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/editTelemetry.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { EditTelemetryContribution } from "./module-3433.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { EDIT_TELEMETRY_SETTING_ID } from "./module-3427.mjs";
import { AgentHostEditTelemetryEnabledConfigKey } from "./module-1741.mjs";
import { AI_STATS_SETTING_ID } from "./module-3428.mjs";
import { EDIT_TELEMETRY_DETAILS_SETTING_ID, EDIT_TELEMETRY_SHOW_DECORATIONS, EDIT_TELEMETRY_SHOW_STATUS_BAR } from "./module-3423.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAiEditTelemetryService } from "./module-1218.mjs";
import { AiEditTelemetryServiceImpl } from "./module-3434.mjs";
import { IRandomService, RandomService } from "./module-3416.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/editTelemetry.contribution.ts
registerWorkbenchContribution2("EditTelemetryContribution", EditTelemetryContribution, WorkbenchPhase.AfterRestored);

var configurationRegistry19 = Registry.as(Extensions4.Configuration);

configurationRegistry19.registerConfiguration({
  id: "task",
  order: 100,
  title: localize(14969, null),
  type: "object",
  properties: {
    [EDIT_TELEMETRY_SETTING_ID]: {
      markdownDescription: localize(14971, null),
      type: "boolean",
      default: true,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      },
      agentHost: { key: AgentHostEditTelemetryEnabledConfigKey }
    },
    [AI_STATS_SETTING_ID]: {
      markdownDescription: localize(14968, null),
      type: "boolean",
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    [EDIT_TELEMETRY_DETAILS_SETTING_ID]: {
      markdownDescription: localize(14970, null),
      type: "boolean",
      default: false,
      tags: ["experimental"],
      experiment: {
        mode: "auto"
      }
    },
    [EDIT_TELEMETRY_SHOW_STATUS_BAR]: {
      markdownDescription: localize(14973, null),
      type: "boolean",
      default: false,
      tags: ["experimental"]
    },
    [EDIT_TELEMETRY_SHOW_DECORATIONS]: {
      markdownDescription: localize(14972, null),
      type: "boolean",
      default: false,
      tags: ["experimental"]
    }
  }
});

registerSingleton(IAiEditTelemetryService, AiEditTelemetryServiceImpl, 1 /* Delayed */);

registerSingleton(IRandomService, RandomService, 1 /* Delayed */);
export { configurationRegistry19 };
