// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionWorkingDirectories.ts
import { extUri } from "./module-0034.mjs";
import { ResourceSet } from "./module-0008.mjs";


// src/vs/platform/agentHost/common/state/sessionWorkingDirectories.ts
function areDirectorySetsEqual(first2, second) {
  const toKey3 = (directory) => extUri.getComparisonKey(directory);
  const firstSet = new ResourceSet(first2, toKey3);
  const secondSet = new ResourceSet(second, toKey3);
  return firstSet.size === secondSet.size && [...firstSet].every((directory) => secondSet.has(directory));
}

function areSessionWorkingDirectoriesEqual(first2, second, hasImmutablePrimary) {
  if (!first2 || !second) {
    return first2 === second;
  }
  if (!hasImmutablePrimary) {
    return areDirectorySetsEqual(first2, second);
  }
  return extUri.isEqual(first2[0], second[0]) && areDirectorySetsEqual(first2.slice(1), second.slice(1));
}
export { areDirectorySetsEqual, areSessionWorkingDirectoriesEqual };
