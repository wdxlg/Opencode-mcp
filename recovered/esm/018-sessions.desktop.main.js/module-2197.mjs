// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/common/reducer-helpers.ts



// src/vs/platform/agentHost/common/state/protocol/common/reducer-helpers.ts
function softAssertNever2(value2, log4) {
  const msg = `Unhandled action type: ${JSON.stringify(value2)}`;
  (log4 ?? console.warn)(msg);
}
export { softAssertNever2 };
