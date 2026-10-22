// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/appNodeModules.ts
import { product_default } from "./module-0053.mjs";
import { nodeModulesAsarUnpackedPath, nodeModulesPath } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/appNodeModules.ts
function hasUnpackedNodeModulesArchive() {
  return !!process.versions["electron"] && !!product_default.commit && !process.env["VSCODE_DEV"];
}

function getAppNodeModulesPath() {
  return hasUnpackedNodeModulesArchive() ? nodeModulesAsarUnpackedPath : nodeModulesPath;
}
export { hasUnpackedNodeModulesArchive, getAppNodeModulesPath };
