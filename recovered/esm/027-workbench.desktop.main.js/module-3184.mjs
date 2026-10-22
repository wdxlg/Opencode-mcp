// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/configurationResolver/common/configurationResolverUtils.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/configurationResolver/common/configurationResolverUtils.ts
function applyDeprecatedVariableMessage(schema10) {
  schema10.pattern = schema10.pattern || "^(?!.*\\$\\{(env|config|command)\\.)";
  schema10.patternErrorMessage = schema10.patternErrorMessage || localize(22836, null);
}
export { applyDeprecatedVariableMessage };
