// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/sshHostKeyTrust.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/sshHostKeyTrust.ts
function computeHostKeyStoreKey(host, port) {
  return `${host.toLowerCase()}:${port}`;
}

var ISSHHostKeyTrustService = createDecorator("sshHostKeyTrustService");
export { computeHostKeyStoreKey, ISSHHostKeyTrustService };
