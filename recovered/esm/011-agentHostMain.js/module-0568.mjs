// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostMultiRootDiff.ts
import { URI } from "./module-0023.mjs";
import { Schemas } from "./module-0024.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/agentHostMultiRootDiff.ts
function dedupeSessionFileDiffs(orderedDiffLists) {
  const merged = [];
  const seenKeys = /* @__PURE__ */ new Set();
  for (const diffs of orderedDiffLists) {
    for (const diff of diffs) {
      const id2 = diff.after?.uri ?? diff.before?.uri;
      if (!id2) {
        continue;
      }
      const key = dedupeKeyForDiffId(id2);
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);
      merged.push(diff);
    }
  }
  return merged;
}

function dedupeKeyForDiffId(id2) {
  const resource = URI.parse(id2);
  return resource.scheme === Schemas.file ? extUriBiasedIgnorePathCase.getComparisonKey(resource) : id2;
}

function evaluateMultiRootDiffSources(orderedSources) {
  const availableSources = orderedSources.filter((source) => source !== void 0);
  let outcome;
  if (availableSources.length === 0) {
    outcome = "failed";
  } else if (availableSources.length === orderedSources.length) {
    outcome = "complete";
  } else {
    outcome = "partial";
  }
  return { outcome, availableSources };
}
export { dedupeSessionFileDiffs, dedupeKeyForDiffId, evaluateMultiRootDiffSources };
