// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionTransport.ts



// src/vs/platform/agentHost/common/state/sessionTransport.ts
var NonReconnectableTransportError = class extends Error {
};

function isClientTransport(transport) {
  return typeof transport.connect === "function";
}
export { isClientTransport, NonReconnectableTransportError };
