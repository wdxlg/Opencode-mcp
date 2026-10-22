// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostFileCompletionUtils.ts
import { Schemas } from "./module-0024.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/agentHostFileCompletionUtils.ts
function resolveAgentHostFileCompletionRoots(workingDirectories) {
  const logicalRoots = [];
  const seen = /* @__PURE__ */ new Set();
  for (const workingDirectory of workingDirectories) {
    if (workingDirectory.scheme !== Schemas.file) {
      continue;
    }
    const normalized = extUriBiasedIgnorePathCase.removeTrailingPathSeparator(extUriBiasedIgnorePathCase.normalizePath(workingDirectory));
    const key = extUriBiasedIgnorePathCase.getComparisonKey(normalized);
    if (!seen.has(key)) {
      seen.add(key);
      logicalRoots.push(normalized);
    }
  }
  const enumerationRoots = logicalRoots.filter(
    (candidate, candidateIndex) => !logicalRoots.some(
      (other, otherIndex) => candidateIndex !== otherIndex && extUriBiasedIgnorePathCase.isEqualOrParent(candidate, other)
    )
  );
  return { logicalRoots, enumerationRoots };
}
export { resolveAgentHostFileCompletionRoots };
