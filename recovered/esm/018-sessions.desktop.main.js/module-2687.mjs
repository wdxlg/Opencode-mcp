// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingOperations.ts
import { LocalChatSessionUri } from "./module-0962.mjs";
import { StringSHA1 } from "./module-0039.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingOperations.ts
function getKeyForChatSessionResource(chatSessionResource) {
  const sessionId = LocalChatSessionUri.parseLocalSessionId(chatSessionResource);
  if (sessionId) {
    return sessionId;
  }
  const sha = new StringSHA1();
  sha.update(chatSessionResource.toString());
  return sha.digest();
}
export { getKeyForChatSessionResource };
