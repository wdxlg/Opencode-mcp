// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-preview-token.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// extensions/opencode/src/external-mcp-preview-token.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto7 = require("node:crypto");

var KEY = (0, import_node_crypto7.randomBytes)(32);

function externalMcpPreviewToken(revision, input) {
  return (0, import_node_crypto7.createHmac)("sha256", KEY).update(revision).update("\0").update(input).digest("hex");
}
export { externalMcpPreviewToken, import_node_crypto7, KEY };
