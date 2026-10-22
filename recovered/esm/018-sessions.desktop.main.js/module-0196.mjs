// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/diff/linesDiffComputers.ts
import { LegacyLinesDiffComputer } from "./module-0180.mjs";
import { DefaultLinesDiffComputer } from "./module-0189.mjs";
import { getExternalLinesDiffComputer } from "./module-0195.mjs";


// src/vs/editor/common/diff/linesDiffComputers.ts
var linesDiffComputers = {
  getLegacy: () => new LegacyLinesDiffComputer(),
  getDefault: () => new DefaultLinesDiffComputer(),
  getAdvancedExternal: () => getExternalLinesDiffComputer(false),
  getAdvancedWasm: () => getExternalLinesDiffComputer(true)
};
export { linesDiffComputers };
