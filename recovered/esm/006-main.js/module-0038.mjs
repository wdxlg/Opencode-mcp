// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/policy.ts
import { __esm } from "./module-0000.mjs";
import { init_nls, localize } from "./module-0005.mjs";


// src/vs/base/common/policy.ts
var LINUX_SYSTEM_POLICY_FILE_PATH, PolicyCategoryData;

var init_policy = __esm({
  "src/vs/base/common/policy.ts"() {
    init_nls();
    LINUX_SYSTEM_POLICY_FILE_PATH = "/etc/vscode/policy.json";
    PolicyCategoryData = {
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
  }
});
export { LINUX_SYSTEM_POLICY_FILE_PATH, PolicyCategoryData, init_policy };
