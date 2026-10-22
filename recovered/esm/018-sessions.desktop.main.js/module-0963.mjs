// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatSessionTypePreference.ts



// src/vs/workbench/contrib/chat/common/chatSessionTypePreference.ts
var CHAT_USER_SELECTED_SESSION_TYPE_STORAGE_KEY = "chat.userSelectedSessionType";

function getRememberedSessionType(storageService) {
  return storageService.get(CHAT_USER_SELECTED_SESSION_TYPE_STORAGE_KEY, 0 /* PROFILE */);
}

function storeUserSelectedSessionType(storageService, sessionType) {
  storageService.store(CHAT_USER_SELECTED_SESSION_TYPE_STORAGE_KEY, sessionType, 0 /* PROFILE */, 1 /* MACHINE */);
}

function clearUserSelectedSessionType(storageService) {
  storageService.remove(CHAT_USER_SELECTED_SESSION_TYPE_STORAGE_KEY, 0 /* PROFILE */);
}
export { getRememberedSessionType, storeUserSelectedSessionType, clearUserSelectedSessionType, CHAT_USER_SELECTED_SESSION_TYPE_STORAGE_KEY };
