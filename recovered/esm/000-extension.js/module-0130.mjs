// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/bridge-task-owner.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// src/bridge-task-owner.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto17 = require("node:crypto");

var MODERN_COMMAND_OWNER_PREFIX = "modern:";

var MODERN_TASK_OWNER_PREFIX = "task-modern:";

function bridgeIdentityDigest(identity) {
  return (0, import_node_crypto17.createHash)("sha256").update(JSON.stringify(identity)).digest("hex");
}

function bridgeOwnerFromIdentity(prefix, identity) {
  return `${prefix}${bridgeIdentityDigest(identity)}`;
}
export { bridgeIdentityDigest, bridgeOwnerFromIdentity, import_node_crypto17, MODERN_COMMAND_OWNER_PREFIX, MODERN_TASK_OWNER_PREFIX };
