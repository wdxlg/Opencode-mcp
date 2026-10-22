// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostWorkingDirectories.ts
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/common/agentHostWorkingDirectories.ts
function isMultiRootSession(workingDirectories) {
  return (workingDirectories?.length ?? 0) > 1;
}

function findDeepestContainingWorkingDirectory(resource, workingDirectories) {
  let deepestMatch;
  for (const workingDirectory of workingDirectories) {
    if (extUriBiasedIgnorePathCase.isEqualOrParent(resource, workingDirectory) && (!deepestMatch || workingDirectory.path.length > deepestMatch.path.length)) {
      deepestMatch = workingDirectory;
    }
  }
  return deepestMatch;
}
export { isMultiRootSession, findDeepestContainingWorkingDirectory };
