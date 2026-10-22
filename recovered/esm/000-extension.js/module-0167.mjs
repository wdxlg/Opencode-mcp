// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/managed-command-retention.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/managed-command-retention.ts
init_define_OPENCODE_BUILD_INFO();

var MANAGED_COMMAND_COMPLETED_STATE_TTL_MS = 60 * 60 * 1e3;


function managedCommandStateIdsToPrune(records, now = Date.now()) {
  // Retain completed command handles by age, never by an arbitrary per-owner count.
  return records.filter(record => record.status !== "running" &&
    (record.endedAt === undefined || now - record.endedAt >= MANAGED_COMMAND_COMPLETED_STATE_TTL_MS))
    .map(record => record.id);
}
export { managedCommandStateIdsToPrune, MANAGED_COMMAND_COMPLETED_STATE_TTL_MS };
