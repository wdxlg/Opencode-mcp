// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeFolderPickerCriteria.ts
import { CancellationToken } from "./module-0017.mjs";
import { joinPath } from "./module-0025.mjs";
import { parseHooksJson, readJsonFile } from "./module-0126.mjs";
import { createCancelablePromise, firstParallel } from "./module-0027.mjs";


// src/vs/platform/agentHost/node/claude/claudeFolderPickerCriteria.ts
async function claudeDirectoryQualifiesForPrimary(fileService, workingDirectory, userHome, token = CancellationToken.None) {
  const probes = [
    () => fileService.exists(joinPath(workingDirectory, ".mcp.json")),
    ...["settings.json", "settings.local.json"].map((fileName) => {
      const uri = joinPath(workingDirectory, ".claude", fileName);
      return async () => {
        const json = await readJsonFile(uri, fileService);
        return json !== void 0 && parseHooksJson(uri, json, workingDirectory, userHome).length > 0;
      };
    })
  ];
  const running = probes.map((probe) => createCancelablePromise(() => probe()));
  const abort = token.onCancellationRequested(() => running.forEach((probe) => probe.cancel()));
  try {
    return await firstParallel(running, (qualifies) => qualifies, false) ?? false;
  } finally {
    abort.dispose();
  }
}
export { claudeDirectoryQualifiesForPrimary };
