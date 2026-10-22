// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/electron-main/telemetryUtils.ts
import { init_telemetryUtils2, resolveDevDeviceId, resolveMachineId, resolveSqmId } from "./module-0266.mjs";
import { devDeviceIdKey, init_telemetry, machineIdKey, sqmIdKey } from "./module-0104.mjs";
import { getDevDeviceId, init_id } from "./module-0148.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/telemetry/electron-main/telemetryUtils.ts
async function resolveMachineId2(stateService, logService) {
  logService.trace("Resolving machine identifier...");
  const machineId2 = await resolveMachineId(stateService, logService);
  stateService.setItem(machineIdKey, machineId2);
  logService.trace(`Resolved machine identifier: ${machineId2}`);
  return machineId2;
}

async function resolveSqmId2(stateService, logService) {
  logService.trace("Resolving SQM identifier...");
  const sqmId = await resolveSqmId(stateService, logService);
  stateService.setItem(sqmIdKey, sqmId);
  logService.trace(`Resolved SQM identifier: ${sqmId}`);
  return sqmId;
}

async function resolveDevDeviceId2(stateService, logService) {
  logService.trace("Resolving devDevice identifier...");
  const devDeviceId = await resolveDevDeviceId(stateService, logService);
  stateService.setItem(devDeviceIdKey, devDeviceId);
  logService.trace(`Resolved devDevice identifier: ${devDeviceId}`);
  return devDeviceId;
}

async function validateDevDeviceId(stateService, logService) {
  const actualDeviceId = await getDevDeviceId(logService.error.bind(logService));
  const currentDeviceId = await resolveDevDeviceId(stateService, logService);
  if (actualDeviceId !== currentDeviceId) {
    stateService.setItem(devDeviceIdKey, actualDeviceId);
  }
}

var init_telemetryUtils3 = __esm({
  "src/vs/platform/telemetry/electron-main/telemetryUtils.ts"() {
    init_id();
    init_telemetry();
    init_telemetryUtils2();
  }
});
export { resolveMachineId2, resolveSqmId2, resolveDevDeviceId2, validateDevDeviceId, init_telemetryUtils3 };
