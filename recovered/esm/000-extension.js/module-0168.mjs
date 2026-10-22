// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/managed-terminal-lifecycle.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/managed-terminal-lifecycle.ts
init_define_OPENCODE_BUILD_INFO();

var MANAGED_TERMINAL_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1e3;

function managedTerminalIdleDelay(lastUsedAt, now = Date.now()) {
  return Math.max(0, lastUsedAt + MANAGED_TERMINAL_IDLE_TIMEOUT_MS - now);
}

function isManagedTerminalIdleExpired(lastUsedAt, now = Date.now()) {
  return managedTerminalIdleDelay(lastUsedAt, now) === 0;
}
export { managedTerminalIdleDelay, isManagedTerminalIdleExpired, MANAGED_TERMINAL_IDLE_TIMEOUT_MS };
