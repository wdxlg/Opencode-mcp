// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/terminal/common/autoApprove/cmdDelayedExpansion.ts



// src/vs/platform/terminal/common/autoApprove/cmdDelayedExpansion.ts
var cmdDelayedExpansionRegex = /![^!\r\n]+!/;

function containsCmdDelayedExpansion(value) {
  return cmdDelayedExpansionRegex.test(value);
}
export { containsCmdDelayedExpansion, cmdDelayedExpansionRegex };
