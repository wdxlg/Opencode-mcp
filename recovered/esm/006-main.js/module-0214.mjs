// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/common/commonProperties.ts
import { PlatformToString, init_platform, isLinuxSnap, platform } from "./module-0006.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { env, init_process, platform2 } from "./module-0007.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/telemetry/common/commonProperties.ts
function getPlatformDetail(hostname3) {
  if (platform === 2 /* Linux */ && /^penguin(\.|$)/i.test(hostname3)) {
    return "chromebook";
  }
  return void 0;
}

function resolveCommonProperties(release12, hostname3, arch5, commit, version, machineId2, sqmId, devDeviceId, isInternalTelemetry2, releaseDate, product3) {
  const result = /* @__PURE__ */ Object.create(null);
  result["common.machineId"] = machineId2;
  result["common.sqmId"] = sqmId;
  result["common.devDeviceId"] = devDeviceId;
  result["sessionID"] = generateUuid() + Date.now();
  result["commitHash"] = commit;
  result["version"] = version;
  result["common.releaseDate"] = releaseDate;
  result["common.platformVersion"] = (release12 || "").replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, "$1$2$3");
  result["common.platform"] = PlatformToString(platform);
  result["common.nodePlatform"] = platform2;
  result["common.nodeArch"] = arch5;
  result["common.product"] = product3 || "desktop";
  if (isInternalTelemetry2) {
    result["common.msftInternal"] = isInternalTelemetry2;
  }
  let seq = 0;
  const startTime = Date.now();
  Object.defineProperties(result, {
    // __GDPR__COMMON__ "timestamp" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
    "timestamp": {
      get: () => /* @__PURE__ */ new Date(),
      enumerable: true
    },
    // __GDPR__COMMON__ "common.timesincesessionstart" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.timesincesessionstart": {
      get: () => Date.now() - startTime,
      enumerable: true
    },
    // __GDPR__COMMON__ "common.sequence" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
    "common.sequence": {
      get: () => seq++,
      enumerable: true
    }
  });
  if (isLinuxSnap) {
    result["common.snap"] = "true";
  }
  const platformDetail = getPlatformDetail(hostname3);
  if (platformDetail) {
    result["common.platformDetail"] = platformDetail;
  }
  return result;
}

function verifyMicrosoftInternalDomain(domainList) {
  const userDnsDomain = env["USERDNSDOMAIN"];
  if (!userDnsDomain) {
    return false;
  }
  const domain = userDnsDomain.toLowerCase();
  return domainList.some((msftDomain) => domain === msftDomain);
}

var init_commonProperties = __esm({
  "src/vs/platform/telemetry/common/commonProperties.ts"() {
    init_platform();
    init_process();
    init_uuid();
  }
});
export { getPlatformDetail, resolveCommonProperties, verifyMicrosoftInternalDomain, init_commonProperties };
