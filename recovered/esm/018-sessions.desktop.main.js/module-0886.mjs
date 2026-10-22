// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/commonProperties.ts
import { PlatformToString, isLinuxSnap, platform } from "./module-0014.mjs";
import { generateUuid } from "./module-0190.mjs";
import { env, platform2 } from "./module-0015.mjs";


// src/vs/platform/telemetry/common/commonProperties.ts
function getPlatformDetail(hostname) {
  if (platform === 2 /* Linux */ && /^penguin(\.|$)/i.test(hostname)) {
    return "chromebook";
  }
  return void 0;
}

function resolveCommonProperties(release, hostname, arch2, commit, version2, machineId, sqmId, devDeviceId, isInternalTelemetry2, releaseDate, product2) {
  const result = /* @__PURE__ */ Object.create(null);
  result["common.machineId"] = machineId;
  result["common.sqmId"] = sqmId;
  result["common.devDeviceId"] = devDeviceId;
  result["sessionID"] = generateUuid() + Date.now();
  result["commitHash"] = commit;
  result["version"] = version2;
  result["common.releaseDate"] = releaseDate;
  result["common.platformVersion"] = (release || "").replace(/^(\d+)(\.\d+)?(\.\d+)?(.*)/, "$1$2$3");
  result["common.platform"] = PlatformToString(platform);
  result["common.nodePlatform"] = platform2;
  result["common.nodeArch"] = arch2;
  result["common.product"] = product2 || "desktop";
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
  const platformDetail = getPlatformDetail(hostname);
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
export { getPlatformDetail, resolveCommonProperties, verifyMicrosoftInternalDomain };
