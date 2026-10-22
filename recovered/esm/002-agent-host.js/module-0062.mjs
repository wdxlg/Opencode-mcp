// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
// Original module marker: node_modules/pkce-challenge/dist/index.node.js
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/pkce-challenge/dist/index.node.js
init_define_OPENCODE_BUILD_INFO();

var crypto;

crypto = globalThis.crypto?.webcrypto ?? // Node.js [18-16] REPL
globalThis.crypto ?? // Node.js >18
import("node:crypto").then((m) => m.webcrypto);
export { crypto };
