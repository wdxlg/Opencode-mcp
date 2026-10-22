// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostDiffs.ts
import { normalizeFileEdit } from "./module-2217.mjs";
import { readChangesetFileMeta } from "./module-3665.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostDiffs.ts
function mapProtocolStatus(protocol) {
  if ((protocol & 24 /* InputNeeded */) === 24 /* InputNeeded */) {
    return 2 /* NeedsInput */;
  }
  if (protocol & 8 /* InProgress */) {
    return 1 /* InProgress */;
  }
  if (protocol & 2 /* Error */) {
    return 4 /* Error */;
  }
  return 3 /* Completed */;
}

function diffToChange(file, mapUri) {
  const normalized = normalizeFileEdit(file.edit);
  if (!normalized) {
    return void 0;
  }
  const map = (uri5) => mapUri ? mapUri(uri5) : uri5;
  const uri4 = map(normalized.resource);
  const modifiedUri = normalized.afterUri ? map(normalized.afterUri) : void 0;
  const originalUri = normalized.beforeContentUri ? mapUri ? mapUri(normalized.beforeContentUri, { contentRef: true }) : normalized.beforeContentUri : void 0;
  const meta = readChangesetFileMeta(file);
  return {
    uri: uri4,
    modifiedUri,
    originalUri,
    insertions: file.edit?.diff?.added ?? 0,
    deletions: file.edit?.diff?.removed ?? 0,
    reviewed: file.reviewed ?? meta?.reviewed
  };
}

function changesetFileToChange(file, mapUri) {
  return diffToChange(file, mapUri);
}
export { mapProtocolStatus, diffToChange, changesetFileToChange };
