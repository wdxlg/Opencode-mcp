// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/externalServices/common/marketplace.ts
import { getTelemetryLevel, supportsTelemetry } from "./module-0887.mjs";
import { getServiceMachineId } from "./module-0891.mjs";


// src/vs/platform/externalServices/common/marketplace.ts
async function resolveMarketplaceHeaders(version2, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
  const headers = {
    "X-Market-Client-Id": `VSCode ${version2}`,
    "User-Agent": `VSCode ${version2} (${productService.nameShort})`
  };
  if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === 3 /* USAGE */) {
    const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
    headers["X-Market-User-Id"] = serviceMachineId;
    headers["VSCode-SessionId"] = telemetryService.machineId || serviceMachineId;
  }
  return headers;
}
export { resolveMarketplaceHeaders };
