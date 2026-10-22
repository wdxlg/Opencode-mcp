// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/windowsVersion.ts
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/windowsVersion.ts
import * as os from "os";

async function initWindowsVersionInfo() {
  if (versionInfo) {
    return;
  }
  if (!isWindows2) {
    versionInfo = { release: os.release(), buildNumber: 0 };
    return;
  }
  let buildNumber;
  let release12;
  try {
    const Registry2 = await import("@vscode/windows-registry");
    const versionKey = "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion";
    const build = Registry2.GetStringRegKey("HKEY_LOCAL_MACHINE", versionKey, "CurrentBuild");
    if (build !== void 0) {
      buildNumber = parseInt(build, 10);
      if (isNaN(buildNumber)) {
        buildNumber = void 0;
      }
    }
    const major2 = Registry2.GetDWORDRegKey("HKEY_LOCAL_MACHINE", versionKey, "CurrentMajorVersionNumber");
    const minor2 = Registry2.GetDWORDRegKey("HKEY_LOCAL_MACHINE", versionKey, "CurrentMinorVersionNumber");
    if (major2 !== void 0 && minor2 !== void 0 && build !== void 0) {
      release12 = `${major2}.${minor2}.${build}`;
    }
  } catch {
  } finally {
    versionInfo = {
      release: release12 || os.release(),
      buildNumber: buildNumber || getWindowsBuildNumberFromOsRelease()
    };
  }
}

async function getWindowsRelease() {
  if (!versionInfo) {
    await initWindowsVersionInfo();
  }
  return versionInfo.release;
}

async function getWindowsBuildNumberAsync() {
  if (!versionInfo) {
    await initWindowsVersionInfo();
  }
  return versionInfo.buildNumber;
}

function getWindowsReleaseSync() {
  return versionInfo?.release ?? os.release();
}

function getWindowsBuildNumberFromOsRelease() {
  const osVersion = /(\d+)\.(\d+)\.(\d+)/g.exec(os.release());
  if (osVersion && osVersion.length === 4) {
    return parseInt(osVersion[3], 10);
  }
  return 0;
}

var versionInfo;

var init_windowsVersion = __esm({
  "src/vs/base/node/windowsVersion.ts"() {
    init_platform();
  }
});
export { initWindowsVersionInfo, getWindowsRelease, getWindowsBuildNumberAsync, getWindowsReleaseSync, getWindowsBuildNumberFromOsRelease, os, versionInfo, init_windowsVersion };
