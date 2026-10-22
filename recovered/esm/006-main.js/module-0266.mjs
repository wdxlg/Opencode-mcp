// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/node/telemetryUtils.ts
import { devDeviceIdKey, init_telemetry, machineIdKey, sqmIdKey } from "./module-0104.mjs";
import { init_platform, isMacintosh } from "./module-0006.mjs";
import { getDevDeviceId, getMachineId, getSqmMachineId, init_id } from "./module-0148.mjs";
import { init_strings, stripUTF8BOM } from "./module-0027.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/telemetry/node/telemetryUtils.ts
async function resolveMachineId(stateService, logService) {
  let machineId2 = stateService.getItem(machineIdKey);
  if (typeof machineId2 !== "string" || isMacintosh && machineId2 === "6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead") {
    machineId2 = await getMachineId(logService.error.bind(logService));
  }
  return machineId2;
}

async function resolveSqmId(stateService, logService) {
  let sqmId = stateService.getItem(sqmIdKey);
  if (typeof sqmId !== "string") {
    sqmId = await getSqmMachineId(logService.error.bind(logService));
  }
  return sqmId;
}

async function resolveDevDeviceId(stateService, logService) {
  let devDeviceId = stateService.getItem(devDeviceIdKey);
  if (typeof devDeviceId !== "string") {
    devDeviceId = await getDevDeviceId(logService.error.bind(logService));
  }
  return stripUTF8BOM(devDeviceId);
}

var init_telemetryUtils2 = __esm({
  "src/vs/platform/telemetry/node/telemetryUtils.ts"() {
    init_platform();
    init_strings();
    init_id();
    init_telemetry();
  }
});
export { resolveMachineId, resolveSqmId, resolveDevDeviceId, init_telemetryUtils2 };
