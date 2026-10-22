// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostEnablementService.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/platform/agentHost/common/agentHostEnablementService.ts
var AGENT_HOST_ENABLED_CONTEXT_KEY = new RawContextKey("agentHostEnabled", false, { type: "boolean", description: localize(1885, null) });

var IAgentHostEnablementService = createDecorator("agentHostEnablementService");

var configurationRegistry4 = Registry.as(Extensions4.Configuration);

configurationRegistry4.registerConfiguration({
  id: "chatAgentHost",
  title: localize(1890, null),
  type: "object",
  properties: {
    "chat.editor.preferCopilotHarness": {
      type: "boolean",
      description: localize(1888, null),
      default: false,
      tags: ["experimental"],
      experiment: { mode: "startup" },
      policy: {
        name: "ChatEditorPreferCopilotHarness",
        category: "InteractiveSession" /* InteractiveSession */,
        minimumVersion: "1.134",
        localization: {
          description: {
            key: "chat.editor.preferCopilotHarness.policy",
            value: localize(1889, null)
          }
        }
      }
    },
    "chat.defaultToCopilotHarness": {
      type: "boolean",
      description: localize(1886, null),
      default: false,
      tags: ["experimental"],
      experiment: { mode: "startup" }
    },
    "chat.editor.localAgent.enabled": {
      type: "boolean",
      description: localize(1887, null),
      default: true,
      tags: ["experimental"],
      experiment: { mode: "startup" }
    }
  }
});
export { AGENT_HOST_ENABLED_CONTEXT_KEY, IAgentHostEnablementService, configurationRegistry4 };
