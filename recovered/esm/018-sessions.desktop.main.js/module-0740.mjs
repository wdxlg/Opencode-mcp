// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/policy/common/managedSettingsFreshness.ts



// src/vs/platform/policy/common/managedSettingsFreshness.ts
var MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED = { state: "notRequired" /* NotRequired */ };

function isManagedSettingsFreshnessBlocking(freshness) {
  return freshness.state === "pending" /* Pending */ || freshness.state === "blocked" /* Blocked */;
}

function isSameScope(a, b) {
  return a.accountId === b.accountId && a.authenticationProviderId === b.authenticationProviderId && a.endpointOrigin === b.endpointOrigin;
}

function isManagedSettingsFreshnessSatisfiedFor(freshness, scope) {
  return freshness.state === "satisfied" /* Satisfied */ && isSameScope(freshness.scope, scope);
}
export { isManagedSettingsFreshnessBlocking, isSameScope, isManagedSettingsFreshnessSatisfiedFor, MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED };
