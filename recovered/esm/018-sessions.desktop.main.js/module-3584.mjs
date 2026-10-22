// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/sessionResourceMatching.ts
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/browser/sessionResourceMatching.ts
function editingEntriesContainResource(entries2, resourceUri) {
  for (const entry of entries2) {
    if (isEqual2(entry.modifiedURI, resourceUri) || isEqual2(entry.originalURI, resourceUri)) {
      return true;
    }
  }
  return false;
}
export { editingEntriesContainResource };
