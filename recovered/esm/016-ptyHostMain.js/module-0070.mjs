// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/base/node/windowsVersion.ts
import { isWindows } from "./module-0014.mjs";


// src/vs/base/node/windowsVersion.ts
import * as os2 from "os";

var versionInfo;

async function initWindowsVersionInfo() {
  if (versionInfo) {
    return;
  }
  if (!isWindows) {
    versionInfo = { release: os2.release(), buildNumber: 0 };
    return;
  }
  let buildNumber;
  let release2;
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
    const major = Registry2.GetDWORDRegKey("HKEY_LOCAL_MACHINE", versionKey, "CurrentMajorVersionNumber");
    const minor = Registry2.GetDWORDRegKey("HKEY_LOCAL_MACHINE", versionKey, "CurrentMinorVersionNumber");
    if (major !== void 0 && minor !== void 0 && build !== void 0) {
      release2 = `${major}.${minor}.${build}`;
    }
  } catch {
  } finally {
    versionInfo = {
      release: release2 || os2.release(),
      buildNumber: buildNumber || getWindowsBuildNumberFromOsRelease()
    };
  }
}

async function getWindowsBuildNumberAsync() {
  if (!versionInfo) {
    await initWindowsVersionInfo();
  }
  return versionInfo.buildNumber;
}

function getWindowsBuildNumberSync() {
  if (versionInfo) {
    return versionInfo.buildNumber;
  } else {
    return isWindows ? getWindowsBuildNumberFromOsRelease() : 0;
  }
}

function getWindowsBuildNumberFromOsRelease() {
  const osVersion = /(\d+)\.(\d+)\.(\d+)/g.exec(os2.release());
  if (osVersion && osVersion.length === 4) {
    return parseInt(osVersion[3], 10);
  }
  return 0;
}
export { initWindowsVersionInfo, getWindowsBuildNumberAsync, getWindowsBuildNumberSync, getWindowsBuildNumberFromOsRelease, os2, versionInfo };
