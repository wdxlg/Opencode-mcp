// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/meteredConnection/common/meteredConnection.config.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/meteredConnection/common/meteredConnection.config.contribution.ts
var configurationRegistry24 = Registry.as(Extensions4.Configuration);

configurationRegistry24.registerConfiguration({
  id: "network",
  order: 14,
  title: localize(3162, null),
  type: "object",
  properties: {
    "network.meteredConnection": {
      type: "string",
      enum: ["auto", "on", "off"],
      enumDescriptions: [
        localize(3159, null),
        localize(3161, null),
        localize(3160, null)
      ],
      default: "auto",
      scope: 1 /* APPLICATION */,
      description: localize(3158, null),
      tags: ["usesOnlineServices"]
    }
  }
});
export { configurationRegistry24 };
