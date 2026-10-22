// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/telemetry/node/telemetryUtils.ts
import { devDeviceIdKey, machineIdKey, sqmIdKey } from "./module-0069.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { getDevDeviceId, getMachineId, getSqmMachineId } from "./module-0153.mjs";
import { stripUTF8BOM } from "./module-0022.mjs";


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
export { resolveMachineId, resolveSqmId, resolveDevDeviceId };
