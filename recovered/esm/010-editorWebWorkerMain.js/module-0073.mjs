// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/diff/linesDiffComputers.ts
import { LegacyLinesDiffComputer } from "./module-0056.mjs";
import { DefaultLinesDiffComputer } from "./module-0065.mjs";
import { getExternalLinesDiffComputer } from "./module-0072.mjs";


// src/vs/editor/common/diff/linesDiffComputers.ts
var linesDiffComputers = {
  getLegacy: () => new LegacyLinesDiffComputer(),
  getDefault: () => new DefaultLinesDiffComputer(),
  getAdvancedExternal: () => getExternalLinesDiffComputer(false),
  getAdvancedWasm: () => getExternalLinesDiffComputer(true)
};
export { linesDiffComputers };
