// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/agentHost/common/agentHostEnablementService.ts
import { RawContextKey } from "./module-0049.mjs";
import { localize } from "./module-0013.mjs";
import { createDecorator2 } from "./module-0048.mjs";
import { Registry } from "./module-0097.mjs";
import { Extensions2 } from "./module-0141.mjs";


// src/vs/platform/agentHost/common/agentHostEnablementService.ts
var AGENT_HOST_ENABLED_CONTEXT_KEY = new RawContextKey("agentHostEnabled", false, { type: "boolean", description: localize(1885, null) });

var IAgentHostEnablementService = createDecorator2("agentHostEnablementService");

var configurationRegistry2 = Registry.as(Extensions2.Configuration);

configurationRegistry2.registerConfiguration({
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
export { AGENT_HOST_ENABLED_CONTEXT_KEY, IAgentHostEnablementService, configurationRegistry2 };
