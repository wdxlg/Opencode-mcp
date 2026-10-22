// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/codex/codexFolderPickerCriteria.ts
import { CancellationToken } from "./module-0017.mjs";
import { joinPath } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/codex/codexFolderPickerCriteria.ts
async function codexDirectoryHasHooks(fileService, workingDirectory, _token = CancellationToken.None) {
  return fileService.exists(joinPath(workingDirectory, ".codex", "hooks.json"));
}
export { codexDirectoryHasHooks };
