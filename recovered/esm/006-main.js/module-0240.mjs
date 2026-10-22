// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/externalServices/common/marketplace.ts
import { getTelemetryLevel, init_telemetryUtils, supportsTelemetry } from "./module-0215.mjs";
import { getServiceMachineId, init_serviceMachineId } from "./module-0239.mjs";
import { __esm } from "./module-0000.mjs";
import { init_telemetry } from "./module-0104.mjs";


// src/vs/platform/externalServices/common/marketplace.ts
async function resolveMarketplaceHeaders(version, productService, environmentService, configurationService, fileService, storageService, telemetryService) {
  const headers = {
    "X-Market-Client-Id": `VSCode ${version}`,
    "User-Agent": `VSCode ${version} (${productService.nameShort})`
  };
  if (supportsTelemetry(productService, environmentService) && getTelemetryLevel(configurationService) === 3 /* USAGE */) {
    const serviceMachineId = await getServiceMachineId(environmentService, fileService, storageService);
    headers["X-Market-User-Id"] = serviceMachineId;
    headers["VSCode-SessionId"] = telemetryService.machineId || serviceMachineId;
  }
  return headers;
}

var init_marketplace = __esm({
  "src/vs/platform/externalServices/common/marketplace.ts"() {
    init_serviceMachineId();
    init_telemetry();
    init_telemetryUtils();
  }
});
export { resolveMarketplaceHeaders, init_marketplace };
