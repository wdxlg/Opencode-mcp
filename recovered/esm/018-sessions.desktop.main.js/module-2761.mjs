// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatStatus/chatStatus.ts



// src/vs/workbench/contrib/chat/browser/chatStatus/chatStatus.ts
function isNewUser(chatEntitlementService) {
  return !chatEntitlementService.sentiment.completed || // setup not completed
  chatEntitlementService.entitlement === 3 /* Available */;
}
export { isNewUser };
