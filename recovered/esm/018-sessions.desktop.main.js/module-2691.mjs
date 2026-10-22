// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditing.ts
import { findDiffEditorContainingCodeEditor } from "./module-0528.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditing.ts
function isTextDiffEditorForEntry(accessor, entry, editor) {
  const diffEditor = findDiffEditorContainingCodeEditor(accessor, editor);
  if (!diffEditor) {
    return false;
  }
  const originalModel = diffEditor.getOriginalEditor().getModel();
  const modifiedModel = diffEditor.getModifiedEditor().getModel();
  return isEqual2(originalModel?.uri, entry.originalURI) && isEqual2(modifiedModel?.uri, entry.modifiedURI);
}
export { isTextDiffEditorForEntry };
