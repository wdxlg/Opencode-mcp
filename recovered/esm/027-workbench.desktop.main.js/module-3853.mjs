// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/telemetry/common/workbenchCommonProperties.ts
import { resolveCommonProperties } from "./module-0884.mjs";
import { firstSessionDateStorageKey, lastSessionDateStorageKey } from "./module-0093.mjs";
import { cleanRemoteAuthority } from "./module-0885.mjs";


// src/vs/workbench/services/telemetry/common/workbenchCommonProperties.ts
function resolveWorkbenchCommonProperties(storageService, productService, environmentService, release, hostname, machineId, sqmId, devDeviceId, isInternalTelemetry2, process3) {
  const { commit, version: version2, date: releaseDate } = productService ?? {};
  const result = resolveCommonProperties(release, hostname, process3.arch, commit, version2, machineId, sqmId, devDeviceId, isInternalTelemetry2, releaseDate);
  const firstSessionDate = storageService.get(firstSessionDateStorageKey, -1 /* APPLICATION */);
  const lastSessionDate = storageService.get(lastSessionDateStorageKey, -1 /* APPLICATION */);
  result["common.version.shell"] = process3.versions?.["electron"];
  result["common.version.renderer"] = process3.versions?.["chrome"];
  result["common.firstSessionDate"] = firstSessionDate;
  result["common.lastSessionDate"] = lastSessionDate || "";
  result["common.isNewSession"] = !lastSessionDate ? "1" : "0";
  result["common.remoteAuthority"] = cleanRemoteAuthority(environmentService.remoteAuthority, productService);
  result["common.cli"] = !!process3.env["VSCODE_CLI"];
  if (environmentService.isSessionsWindow) {
    result["common.isAgentsWindow"] = true;
  }
  return result;
}
export { resolveWorkbenchCommonProperties };
