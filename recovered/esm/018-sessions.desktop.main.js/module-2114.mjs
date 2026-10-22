// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatEditorAssociations.ts
import { globMatchesResource } from "./module-1114.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatEditorAssociations.ts
function getEditorOverrideForChatResource(resource, configurationService) {
  const associations = configurationService.getValue("chat.editorAssociations" /* EditorAssociations */) ?? {};
  const sortedPatterns = Object.keys(associations).sort((a, b) => b.length - a.length);
  for (const pattern of sortedPatterns) {
    if (globMatchesResource(pattern, resource)) {
      return associations[pattern];
    }
  }
  return void 0;
}
export { getEditorOverrideForChatResource };
