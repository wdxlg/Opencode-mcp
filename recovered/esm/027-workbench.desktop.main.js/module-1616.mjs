// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionProtocol.ts



// src/vs/platform/agentHost/common/state/sessionProtocol.ts
var AHP_UNSUPPORTED_PROTOCOL_VERSION = -32005;

var AHP_AUTH_REQUIRED = -32007;

var AHP_NOT_FOUND = -32008;

function isJsonRpcRequest(msg) {
  return "method" in msg && "id" in msg;
}

function isJsonRpcNotification(msg) {
  return "method" in msg && !("id" in msg);
}

function isJsonRpcResponse(msg) {
  return "id" in msg && !("method" in msg);
}

var ProtocolError = class extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
};
export { isJsonRpcRequest, isJsonRpcNotification, isJsonRpcResponse, AHP_UNSUPPORTED_PROTOCOL_VERSION, AHP_AUTH_REQUIRED, AHP_NOT_FOUND, ProtocolError };
