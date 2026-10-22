// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/environment/node/userDataPath.ts



// src/vs/platform/environment/node/userDataPath.ts
import { homedir } from "os";

import { resolve as resolve2, isAbsolute as isAbsolute2, join as join2 } from "path";

var cwd2 = process.env["VSCODE_CWD"] || process.cwd();

function getUserDataPath(cliArgs, productName) {
  const userDataPath = doGetUserDataPath(cliArgs, productName);
  const pathsToResolve = [userDataPath];
  if (!isAbsolute2(userDataPath)) {
    pathsToResolve.unshift(cwd2);
  }
  return resolve2(...pathsToResolve);
}

function doGetUserDataPath(cliArgs, productName) {

  if (process.env["VSCODE_DEV"]) {
    productName = "code-oss-dev";
  }
  const portablePath = process.env["VSCODE_PORTABLE"];
  if (portablePath) {
    return join2(portablePath, "user-data");
  }
  const appDataPath = process.env["VSCODE_APPDATA"];
  if (appDataPath) {
    return join2(appDataPath, productName);
  }
  const cliPath = cliArgs["user-data-dir"];
  if (cliPath) {
    return cliPath;
  }
  return getDefaultUserDataPath(productName);
}

function getDefaultUserDataPath(productName) {

  let appDataPath;
  switch (process.platform) {
    case "win32":
      appDataPath = process.env["APPDATA"];
      if (!appDataPath) {
        const userProfile = process.env["USERPROFILE"];
        if (typeof userProfile !== "string") {
          throw new Error("Windows: Unexpected undefined %USERPROFILE% environment variable");
        }
        appDataPath = join2(userProfile, "AppData", "Roaming");
      }
      break;
    case "darwin":
      appDataPath = join2(homedir(), "Library", "Application Support");
      break;
    case "linux":
      appDataPath = process.env["XDG_CONFIG_HOME"] || join2(homedir(), ".config");
      break;
    default:
      throw new Error("Platform not supported");
  }
  return join2(appDataPath, productName);
}
export { getUserDataPath, doGetUserDataPath, getDefaultUserDataPath, homedir, resolve2, isAbsolute2, join2, cwd2 };
