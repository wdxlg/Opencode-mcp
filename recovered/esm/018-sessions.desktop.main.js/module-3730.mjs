// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesEditorLabels.ts
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/sessions/contrib/changes/browser/changesEditorLabels.ts
function getChangesEditorFileStats(resource, changes) {
  const change = changes.find((change2) => {
    const resources = isIChatSessionFileChange2(change2) ? [change2.uri, change2.modifiedUri, change2.originalUri] : [change2.modifiedUri, change2.originalUri];
    return resources.some((candidate) => candidate && isEqual2(candidate, resource));
  });
  return change ? { insertions: change.insertions, deletions: change.deletions } : void 0;
}

function getChangesEditorDescription(uri4, label3, labelService) {
  const fullLabel = labelService.getUriLabel(uri4, { relative: true });
  const separator2 = labelService.getSeparator(uri4.scheme, uri4.authority);
  const lastSeparatorIndex = fullLabel.lastIndexOf(separator2);
  if (lastSeparatorIndex < 0) {
    return fullLabel === label3 ? "" : fullLabel;
  }
  return fullLabel.slice(0, lastSeparatorIndex);
}

function getChangesEditorLabels(uri4, labelService) {
  const label3 = labelService.getUriBasenameLabel(uri4);
  return {
    label: label3,
    description: getChangesEditorDescription(uri4, label3, labelService)
  };
}
export { getChangesEditorFileStats, getChangesEditorDescription, getChangesEditorLabels };
