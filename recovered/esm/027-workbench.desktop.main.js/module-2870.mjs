// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostCustomizationConfig.ts
import { createSchema, schemaProperty } from "./module-2102.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/agentHost/common/agentHostCustomizationConfig.ts
var SESSION_CUSTOMIZATION_DISCOVERY_MODES = ["scan", "discover"];

var DEFAULT_SESSION_CUSTOMIZATION_DISCOVERY_MODE = "scan";

var agentHostCustomizationConfigSchema = createSchema({
  ["customizations" /* Customizations */]: schemaProperty({
    type: "array",
    title: localize(1877, null),
    description: localize(1873, null),
    default: [],
    items: {
      type: "object",
      title: localize(1876, null),
      properties: {
        uri: {
          type: "string",
          title: localize(1878, null)
        },
        displayName: {
          type: "string",
          title: localize(1875, null)
        },
        description: {
          type: "string",
          title: localize(1874, null)
        }
      },
      required: ["uri", "displayName"]
    }
  }),
  ["defaultShell" /* DefaultShell */]: schemaProperty({
    type: "string",
    title: localize(1880, null),
    description: localize(1879, null)
  }),
  ["allowSignedOutWhenUsable" /* AllowSignedOutWhenUsable */]: schemaProperty({
    type: "boolean",
    title: localize(1872, null),
    description: localize(1871, null),
    default: false
  }),
  ["sessionCustomizationDiscoveryMode" /* SessionCustomizationDiscoveryMode */]: schemaProperty({
    type: "string",
    enum: [...SESSION_CUSTOMIZATION_DISCOVERY_MODES],
    title: localize(1884, null),
    description: localize(1883, null),
    default: DEFAULT_SESSION_CUSTOMIZATION_DISCOVERY_MODE
  }),
  ["githubEnterpriseUri" /* GithubEnterpriseUri */]: schemaProperty({
    type: "string",
    title: localize(1882, null),
    description: localize(1881, null)
  })
});
export { SESSION_CUSTOMIZATION_DISCOVERY_MODES, DEFAULT_SESSION_CUSTOMIZATION_DISCOVERY_MODE, agentHostCustomizationConfigSchema };
