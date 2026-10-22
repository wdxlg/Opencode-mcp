// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/node/ripgrep.ts
import { Lazy } from "./module-0020.mjs";


// src/vs/base/node/ripgrep.ts
var _rgDiskPath = new Lazy(async () => {
  const m = await import("@vscode/ripgrep-universal");
  return m.rgPath.replace(/\bnode_modules\.asar\b/, "node_modules.asar.unpacked");
});

function rgDiskPath() {
  return _rgDiskPath.value;
}
export { rgDiskPath, _rgDiskPath };
