// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimeline.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { PROMPT_TIMELINE_DISPLAY_SETTING, PROMPT_TIMELINE_RAIL_STYLES, PROMPT_TIMELINE_STICKY_SCROLL_SETTING } from "./module-2180.mjs";
import { localize } from "./module-0001.mjs";
import { ChatWidget } from "./module-2369.mjs";
import { PromptTimelineWidgetContrib } from "./module-2504.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimeline.contribution.ts
var configurationRegistry12 = Registry.as(Extensions4.Configuration);

configurationRegistry12.registerConfiguration({
  id: "chat",
  properties: {
    [PROMPT_TIMELINE_STICKY_SCROLL_SETTING]: {
      type: "boolean",
      default: true,
      description: localize(11572, null),
      experiment: { mode: "startup" }
    }
  }
});

configurationRegistry12.registerConfiguration({
  id: "sessions",
  properties: {
    [PROMPT_TIMELINE_DISPLAY_SETTING]: {
      type: "string",
      enum: [...PROMPT_TIMELINE_RAIL_STYLES],
      enumDescriptions: [
        localize(11575, null),
        localize(11576, null),
        localize(11574, null)
      ],
      default: "gutter",
      description: localize(11573, null),
      tags: ["experimental"],
      experiment: { mode: "startup" }
    }
  }
});

ChatWidget.CONTRIBS.push(PromptTimelineWidgetContrib);
export { configurationRegistry12 };
