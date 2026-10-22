// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionWorkingDirectories.ts
import { extUri, extUriBiasedIgnorePathCase } from "./module-0025.mjs";
import { ResourceSet } from "./module-0006.mjs";
import { URI } from "./module-0023.mjs";
import { Schemas } from "./module-0024.mjs";


// src/vs/platform/agentHost/common/state/sessionWorkingDirectories.ts
function areDirectorySetsEqual(first, second) {
  const toKey2 = (directory) => extUri.getComparisonKey(directory);
  const firstSet = new ResourceSet(first, toKey2);
  const secondSet = new ResourceSet(second, toKey2);
  return firstSet.size === secondSet.size && [...firstSet].every((directory) => secondSet.has(directory));
}

function areAdditionalWorkingDirectoriesEqual(first, second) {
  if (!first || !second) {
    return first === second;
  }
  return areDirectorySetsEqual(first, second);
}

function areSessionWorkingDirectoriesEqual(first, second, hasImmutablePrimary) {
  if (!first || !second) {
    return first === second;
  }
  if (!hasImmutablePrimary) {
    return areDirectorySetsEqual(first, second);
  }
  return extUri.isEqual(first[0], second[0]) && areDirectorySetsEqual(first.slice(1), second.slice(1));
}

function resolveSessionWorkingDirectoryAction(action, workingDirectories, capability) {
  const directory = URI.parse(action.directory, true);
  if (directory.scheme !== Schemas.file) {
    throw new Error(`Working directory must be a file URI: ${action.directory}`);
  }
  const current = workingDirectories.map((value) => URI.parse(value, true));
  const index = current.findIndex((value) => extUriBiasedIgnorePathCase.isEqual(value, directory));
  const canonicalDirectory = index >= 0 ? current[index] : directory;
  if (action.type === "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */) {
    if (index === 0 && (capability.immutablePrimary || capability.primaryReplacement)) {
      throw new Error("The primary working directory cannot be removed.");
    }
    return { ...action, directory: canonicalDirectory.toString() };
  }
  if (action.type === "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */) {
    const replacement = URI.parse(action.replacement, true);
    if (replacement.scheme !== Schemas.file) {
      throw new Error(`Working directory replacement must be a file URI: ${action.replacement}`);
    }
    if (index === 0 && capability.immutablePrimary && !capability.primaryReplacement) {
      throw new Error("The primary working directory cannot be replaced.");
    }
    const replacementIdx = current.findIndex((value) => extUriBiasedIgnorePathCase.isEqual(value, replacement));
    const canonicalReplacement = replacementIdx >= 0 ? current[replacementIdx] : replacement;
    return { ...action, directory: canonicalDirectory.toString(), replacement: canonicalReplacement.toString() };
  }
  return { ...action, directory: canonicalDirectory.toString() };
}
export { areDirectorySetsEqual, areAdditionalWorkingDirectoriesEqual, areSessionWorkingDirectoriesEqual, resolveSessionWorkingDirectoryAction };
