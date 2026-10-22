// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/base/node/osReleaseInfo.ts
import { isMacintosh, isWindows } from "./module-0014.mjs";


// src/vs/base/node/osReleaseInfo.ts
import { constants as FSConstants, promises as FSPromises } from "fs";

import { createInterface as readLines } from "readline";

async function getOSReleaseInfo(errorLogger) {
  if (isMacintosh || isWindows) {
    return;
  }
  let handle2;
  for (const filePath of ["/etc/os-release", "/usr/lib/os-release", "/etc/lsb-release"]) {
    try {
      handle2 = await FSPromises.open(filePath, FSConstants.R_OK);
      break;
    } catch (err) {
    }
  }
  if (!handle2) {
    errorLogger("Unable to retrieve release information from known identifier paths.");
    return;
  }
  try {
    const osReleaseKeys = /* @__PURE__ */ new Set([
      "ID",
      "DISTRIB_ID",
      "ID_LIKE",
      "VERSION_ID",
      "DISTRIB_RELEASE"
    ]);
    const releaseInfo = {
      id: "unknown"
    };
    for await (const line of readLines({ input: handle2.createReadStream(), crlfDelay: Infinity })) {
      if (!line.includes("=")) {
        continue;
      }
      const key = line.split("=")[0].toUpperCase().trim();
      if (osReleaseKeys.has(key)) {
        const value = line.split("=")[1].replace(/"/g, "").toLowerCase().trim();
        if (key === "ID" || key === "DISTRIB_ID") {
          releaseInfo.id = value;
        } else if (key === "ID_LIKE") {
          releaseInfo.id_like = value;
        } else if (key === "VERSION_ID" || key === "DISTRIB_RELEASE") {
          releaseInfo.version_id = value;
        }
      }
    }
    return releaseInfo;
  } catch (err) {
    errorLogger(err);
  } finally {
    await handle2.close();
  }
  return;
}
export { getOSReleaseInfo, FSConstants, FSPromises, readLines };
