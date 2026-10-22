// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/folderPickerDecision.ts
import { CancellationToken } from "./module-0017.mjs";


// src/vs/platform/agentHost/node/shared/folderPickerDecision.ts
async function computeFolderPickerDecisionForRoots(workingDirectories, hasSelectionCriteria, token = CancellationToken.None) {
  if (workingDirectories.length <= 1) {
    return void 0;
  }
  const results = await Promise.all(workingDirectories.map((directory) => hasSelectionCriteria(directory, token)));
  const qualifying = workingDirectories.filter((_, index) => results[index]);
  if (qualifying.length >= 2) {
    return { hidden: false };
  }
  if (qualifying.length === 1) {
    return { hidden: true, primary: qualifying[0].toString() };
  }
  return { hidden: true };
}
export { computeFolderPickerDecisionForRoots };
