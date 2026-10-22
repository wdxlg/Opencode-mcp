// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/base/common/policy.ts
import { localize } from "./module-0013.mjs";


// src/vs/base/common/policy.ts
var LINUX_SYSTEM_POLICY_FILE_PATH = "/etc/vscode/policy.json";

var PolicyCategoryData = {
  ["Extensions" /* Extensions */]: {
    name: {
      key: "extensionsConfigurationTitle",
      value: localize(138, null)
    }
  },
  ["IntegratedTerminal" /* IntegratedTerminal */]: {
    name: {
      key: "terminalIntegratedConfigurationTitle",
      value: localize(141, null)
    }
  },
  ["InteractiveSession" /* InteractiveSession */]: {
    name: {
      key: "interactiveSessionConfigurationTitle",
      value: localize(139, null)
    }
  },
  ["Telemetry" /* Telemetry */]: {
    name: {
      key: "telemetryConfigurationTitle",
      value: localize(140, null)
    }
  },
  ["Update" /* Update */]: {
    name: {
      key: "updateConfigurationTitle",
      value: localize(142, null)
    }
  }
};
export { LINUX_SYSTEM_POLICY_FILE_PATH, PolicyCategoryData };
