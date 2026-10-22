// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/osReleaseInfo.ts
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/osReleaseInfo.ts
import { constants as FSConstants, promises as FSPromises } from "fs";

import { createInterface as readLines } from "readline";

async function getOSReleaseInfo(errorLogger) {
  if (isMacintosh || isWindows2) {
    return;
  }
  let handle;
  for (const filePath of ["/etc/os-release", "/usr/lib/os-release", "/etc/lsb-release"]) {
    try {
      handle = await FSPromises.open(filePath, FSConstants.R_OK);
      break;
    } catch (err) {
    }
  }
  if (!handle) {
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
    for await (const line of readLines({ input: handle.createReadStream(), crlfDelay: Infinity })) {
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
    await handle.close();
  }
  return;
}

var init_osReleaseInfo = __esm({
  "src/vs/base/node/osReleaseInfo.ts"() {
    init_platform();
  }
});
export { getOSReleaseInfo, FSConstants, FSPromises, readLines, init_osReleaseInfo };
