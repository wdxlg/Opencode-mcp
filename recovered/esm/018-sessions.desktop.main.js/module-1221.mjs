// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/telemetry/common/workbenchTelemetryUtils.ts
import { getTelemetryLevel } from "./module-0887.mjs";


// src/vs/workbench/services/telemetry/common/workbenchTelemetryUtils.ts
function experimentsEnabled(configurationService, productService, environmentService) {
  return getTelemetryLevel(configurationService) === 3 /* USAGE */ && !!productService.tasConfig && !environmentService.disableExperiments && !environmentService.extensionTestsLocationURI && !environmentService.enableSmokeTestDriver && configurationService.getValue("workbench.enableExperiments") === true;
}
export { experimentsEnabled };
