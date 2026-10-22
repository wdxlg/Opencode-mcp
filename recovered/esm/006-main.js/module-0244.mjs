// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/node/ripgrep.ts
import { __esm } from "./module-0000.mjs";
import { Lazy, init_lazy } from "./module-0025.mjs";


// src/vs/base/node/ripgrep.ts
function rgDiskPath() {
  return _rgDiskPath.value;
}

var _rgDiskPath;

var init_ripgrep = __esm({
  "src/vs/base/node/ripgrep.ts"() {
    init_lazy();
    _rgDiskPath = new Lazy(async () => {
      const m = await import("@vscode/ripgrep-universal");
      return m.rgPath.replace(/\bnode_modules\.asar\b/, "node_modules.asar.unpacked");
    });
  }
});
export { rgDiskPath, _rgDiskPath, init_ripgrep };
