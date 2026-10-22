// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/environment/node/argvHelper.ts



// src/vs/platform/environment/node/argvHelper.ts
import assert2 from "assert";


// src/vs/platform/environment/node/argvHelper.ts
function isLaunchedFromCli(env2) {
  return env2["VSCODE_CLI"] === "1";
}
export { isLaunchedFromCli, assert2 };
