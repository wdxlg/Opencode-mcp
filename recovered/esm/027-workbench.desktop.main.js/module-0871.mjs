// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/policy.ts
import { localize } from "./module-0001.mjs";


// src/vs/base/common/policy.ts
var PolicyCategory = /* @__PURE__ */ ((PolicyCategory2) => {
  PolicyCategory2["Extensions"] = "Extensions";
  PolicyCategory2["IntegratedTerminal"] = "IntegratedTerminal";
  PolicyCategory2["InteractiveSession"] = "InteractiveSession";
  PolicyCategory2["Telemetry"] = "Telemetry";
  PolicyCategory2["Update"] = "Update";
  return PolicyCategory2;
})(PolicyCategory || {});

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
export { PolicyCategory, PolicyCategoryData };
