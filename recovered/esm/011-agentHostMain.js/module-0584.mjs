// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostClientFileSystemProvider.ts
import { AHPFileSystemProvider } from "./module-0303.mjs";
import { fromAgentClientUri, toAgentClientUri } from "./module-0485.mjs";


// src/vs/platform/agentHost/common/agentHostClientFileSystemProvider.ts
var AgentHostClientFileSystemProvider = class extends AHPFileSystemProvider {
  _decodeUri(resource) {
    return fromAgentClientUri(resource);
  }
  _encodeUri(resource, authority) {
    return toAgentClientUri(resource, authority);
  }
};
export { AgentHostClientFileSystemProvider };
