// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/common/timestamps.ts



// src/vs/platform/agentHost/common/state/protocol/common/timestamps.ts
function addMillisecondsToTimestamp(timestamp, duration) {
  return new Date(Date.parse(timestamp) + duration).toISOString();
}
export { addMillisecondsToTimestamp };
