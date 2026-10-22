// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/autoApprove/cmdDelayedExpansion.ts



// src/vs/platform/terminal/common/autoApprove/cmdDelayedExpansion.ts
var cmdDelayedExpansionRegex = /![^!\r\n]+!/;

function containsCmdDelayedExpansion(value2) {
  return cmdDelayedExpansionRegex.test(value2);
}
export { containsCmdDelayedExpansion, cmdDelayedExpansionRegex };
