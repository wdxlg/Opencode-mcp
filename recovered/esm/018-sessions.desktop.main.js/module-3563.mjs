// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/common/newChatContextIds.ts



// src/vs/sessions/contrib/chat/common/newChatContextIds.ts
var ADDITIONAL_FOLDER_CONTEXT_ID_PREFIX = "sessions-additional-folder:";

var ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX = "sessions-additional-repository:";

function getAdditionalFolderContextId(uri4) {
  return `${ADDITIONAL_FOLDER_CONTEXT_ID_PREFIX}${uri4.toString()}`;
}

function getAdditionalRepositoryContextId(uri4) {
  return `${ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX}${uri4.toString()}`;
}
export { getAdditionalFolderContextId, getAdditionalRepositoryContextId, ADDITIONAL_FOLDER_CONTEXT_ID_PREFIX, ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX };
