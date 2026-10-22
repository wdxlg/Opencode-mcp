// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/base/common/assert.ts



// src/vs/base/common/assert.ts
function ok(value, message) {
  if (!value) {
    throw new Error(message ? `Assertion failed (${message})` : "Assertion Failed");
  }
}
export { ok };
