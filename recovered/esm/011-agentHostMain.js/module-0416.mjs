// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostEndpointRegistry.ts
import { vEnum, vLiteral, vNumber, vObj, vOptionalProp, vString, vUnion } from "./module-0332.mjs";


// src/vs/platform/agentHost/common/agentHostEndpointRegistry.ts
var AGENT_HOST_ENDPOINT_REGISTRY_SCHEMA_VERSION = 2;

var endpointAddressValidator = vUnion(
  vObj({ type: vLiteral("socket"), path: vString() }),
  vObj({ type: vLiteral("tcp"), host: vString(), port: vNumber() })
);

var entryValidator = vObj({
  schemaVersion: vNumber(),
  type: vEnum("editor", "standalone"),
  pid: vNumber(),
  instanceId: vString(),
  protocolVersion: vString(),
  connectionToken: vString(),
  endpoint: endpointAddressValidator,
  quality: vOptionalProp(vString()),
  tunnelName: vOptionalProp(vString())
});

function getAgentHostEndpointIdentityHashInput(identity2) {
  return `${identity2.type}\0${identity2.pid}\0${identity2.instanceId}`;
}
export { getAgentHostEndpointIdentityHashInput, AGENT_HOST_ENDPOINT_REGISTRY_SCHEMA_VERSION, endpointAddressValidator, entryValidator };
