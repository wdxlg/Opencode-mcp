// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/common/editorGroupsService.ts
import { createDecorator } from "./module-0077.mjs";
import { isEditorInput } from "./module-0926.mjs";


// src/vs/workbench/services/editor/common/editorGroupsService.ts
var IEditorGroupsService = createDecorator("editorGroupsService");

function isEditorReplacement(replacement) {
  const candidate = replacement;
  return isEditorInput(candidate?.editor) && isEditorInput(candidate?.replacement);
}

function isEditorGroup(obj) {
  const group2 = obj;
  return !!group2 && typeof group2.id === "number" && Array.isArray(group2.editors);
}

function preferredSideBySideGroupDirection(configurationService) {
  const openSideBySideDirection = configurationService.getValue("workbench.editor.openSideBySideDirection");
  if (openSideBySideDirection === "down") {
    return 1 /* DOWN */;
  }
  return 3 /* RIGHT */;
}
export { isEditorReplacement, isEditorGroup, preferredSideBySideGroupDirection, IEditorGroupsService };
