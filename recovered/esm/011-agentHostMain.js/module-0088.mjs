// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/common/reducer-helpers.ts



// src/vs/platform/agentHost/common/state/protocol/common/reducer-helpers.ts
function softAssertNever2(value, log4) {
  const msg = `Unhandled action type: ${JSON.stringify(value)}`;
  (log4 ?? console.warn)(msg);
}
export { softAssertNever2 };
