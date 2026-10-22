// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/managed-command-id.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/managed-command-id.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto23 = require("node:crypto");

var MANAGED_COMMAND_ENTROPY_BYTES = 24;

var MANAGED_COMMAND_ID = /^cmd_(?:[a-f0-9]{48}|\d+_\d+)/i;

var MANAGED_COMMAND_ID_LABEL = /^command_id:[ \t]*/;

function createManagedCommandId(entropy = import_node_crypto23.randomBytes) {
  const bytes = entropy(MANAGED_COMMAND_ENTROPY_BYTES);
  if (bytes.byteLength !== MANAGED_COMMAND_ENTROPY_BYTES) {
    throw new Error(`Managed command id entropy must contain exactly ${MANAGED_COMMAND_ENTROPY_BYTES} bytes.`);
  }
  return `cmd_${Buffer.from(bytes).toString("hex")}`;
}

function normalizeManagedCommandId(value) {
  const trimmed = value.trim();
  const candidate = trimmed.replace(MANAGED_COMMAND_ID_LABEL, "");
  const match = candidate.match(MANAGED_COMMAND_ID);
  if (!match) return trimmed;
  const suffix = candidate.slice(match[0].length);
  return suffix === "" || /^(?:\s|\\n)/.test(suffix) ? match[0] : trimmed;
}
export { createManagedCommandId, normalizeManagedCommandId, import_node_crypto23, MANAGED_COMMAND_ENTROPY_BYTES, MANAGED_COMMAND_ID, MANAGED_COMMAND_ID_LABEL };
