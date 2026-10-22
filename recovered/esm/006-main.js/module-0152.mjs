// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/remote/node/wsl.ts
import { getWindowsBuildNumberAsync, init_windowsVersion } from "./module-0060.mjs";
import { init_path, join4 } from "./module-0008.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/remote/node/wsl.ts
import * as fs8 from "fs";

import * as cp from "child_process";

async function hasWSLFeatureInstalled(refresh = false) {
  if (hasWSLFeaturePromise === void 0 || refresh) {
    hasWSLFeaturePromise = testWSLFeatureInstalled();
  }
  return hasWSLFeaturePromise;
}

async function testWSLFeatureInstalled() {
  const windowsBuildNumber = await getWindowsBuildNumberAsync();
  if (windowsBuildNumber === 0) {
    return false;
  }
  if (windowsBuildNumber >= 22e3) {
    const wslExePath = getWSLExecutablePath();
    if (wslExePath) {
      return new Promise((s) => {
        try {
          cp.execFile(wslExePath, ["--status"], (err) => s(!err));
        } catch (e) {
          s(false);
        }
      });
    }
  } else {
    const dllPath = getLxssManagerDllPath();
    if (dllPath) {
      try {
        if ((await fs8.promises.stat(dllPath)).isFile()) {
          return true;
        }
      } catch (e) {
      }
    }
  }
  return false;
}

function getSystem32Path(subPath) {
  const systemRoot = process.env["SystemRoot"];
  if (systemRoot) {
    const is32ProcessOn64Windows = process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432");
    return join4(systemRoot, is32ProcessOn64Windows ? "Sysnative" : "System32", subPath);
  }
  return void 0;
}

function getWSLExecutablePath() {
  return getSystem32Path("wsl.exe");
}

function getLxssManagerDllPath() {
  return getSystem32Path("lxss\\LxssManager.dll");
}

var hasWSLFeaturePromise;

var init_wsl = __esm({
  "src/vs/platform/remote/node/wsl.ts"() {
    init_path();
    init_windowsVersion();
  }
});
export { hasWSLFeatureInstalled, testWSLFeatureInstalled, getSystem32Path, getWSLExecutablePath, getLxssManagerDllPath, fs8, cp, hasWSLFeaturePromise, init_wsl };
