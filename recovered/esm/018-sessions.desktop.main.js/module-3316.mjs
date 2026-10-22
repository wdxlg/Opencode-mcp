// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/update/common/update.config.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { isWeb, isWindows } from "./module-0014.mjs";


// src/vs/platform/update/common/update.config.contribution.ts
var configurationRegistry18 = Registry.as(Extensions4.Configuration);

configurationRegistry18.registerConfiguration({
  id: "update",
  order: 15,
  title: localize(3674, null),
  type: "object",
  properties: {
    "update.mode": {
      type: "string",
      enum: ["none", "manual", "start", "default"],
      default: "default",
      scope: 1 /* APPLICATION */,
      description: localize(3675, null),
      tags: ["usesOnlineServices"],
      enumDescriptions: [
        localize(3670, null),
        localize(3669, null),
        localize(3673, null),
        localize(3665, null)
      ],
      policy: {
        name: "UpdateMode",
        category: "Update" /* Update */,
        minimumVersion: "1.67",
        localization: {
          description: { key: "updateMode", value: localize(3675, null) },
          enumDescriptions: [
            {
              key: "none",
              value: localize(3670, null)
            },
            {
              key: "manual",
              value: localize(3669, null)
            },
            {
              key: "start",
              value: localize(3673, null)
            },
            {
              key: "default",
              value: localize(3665, null)
            }
          ]
        }
      }
    },
    "update.channel": {
      type: "string",
      default: "default",
      scope: 1 /* APPLICATION */,
      description: localize(3675, null),
      deprecationMessage: localize(3666, null, "update.mode")
    },
    "update.enableWindowsBackgroundUpdates": {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      title: localize(3668, null),
      description: localize(3667, null),
      included: isWindows && !isWeb
    },
    "update.showReleaseNotes": {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      description: localize(3672, null),
      tags: ["usesOnlineServices"],
      agentsWindow: { default: false, readOnly: true }
    },
    "update.showPostInstallInfo": {
      type: "boolean",
      default: false,
      experiment: { mode: "auto" },
      scope: 1 /* APPLICATION */,
      description: localize(3671, null),
      tags: ["usesOnlineServices"]
    },
    "update.titleBar": {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      description: localize(3676, null),
      included: !isWeb
    }
  }
});
export { configurationRegistry18 };
