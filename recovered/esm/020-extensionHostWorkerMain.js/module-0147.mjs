// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/policy/common/managedSettingsFreshness.ts



// src/vs/platform/policy/common/managedSettingsFreshness.ts
function isManagedSettingsFreshnessBlocking(freshness) {
  return freshness.state === "pending" /* Pending */ || freshness.state === "blocked" /* Blocked */;
}
export { isManagedSettingsFreshnessBlocking };
