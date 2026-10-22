// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/node/userDataPath.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/environment/node/userDataPath.ts
import { homedir } from "os";

import { resolve, isAbsolute, join as join3 } from "path";

function getUserDataPath(cliArgs, productName) {
  const userDataPath2 = doGetUserDataPath(cliArgs, productName);
  const pathsToResolve = [userDataPath2];
  if (!isAbsolute(userDataPath2)) {
    pathsToResolve.unshift(cwd);
  }
  return resolve(...pathsToResolve);
}

function doGetUserDataPath(cliArgs, productName) {

  if (process.env["VSCODE_DEV"]) {
    productName = "code-oss-dev";
  }
  const portablePath = process.env["VSCODE_PORTABLE"];
  if (portablePath) {
    return join3(portablePath, "user-data");
  }
  const appDataPath = process.env["VSCODE_APPDATA"];
  if (appDataPath) {
    return join3(appDataPath, productName);
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
        appDataPath = join3(userProfile, "AppData", "Roaming");
      }
      break;
    case "darwin":
      appDataPath = join3(homedir(), "Library", "Application Support");
      break;
    case "linux":
      appDataPath = process.env["XDG_CONFIG_HOME"] || join3(homedir(), ".config");
      break;
    default:
      throw new Error("Platform not supported");
  }
  return join3(appDataPath, productName);
}

var cwd;

var init_userDataPath = __esm({
  "src/vs/platform/environment/node/userDataPath.ts"() {
    cwd = process.env["VSCODE_CWD"] || process.cwd();
  }
});
export { getUserDataPath, doGetUserDataPath, getDefaultUserDataPath, homedir, resolve, isAbsolute, join3, cwd, init_userDataPath };
