// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionProtocol.ts



// src/vs/platform/agentHost/common/state/sessionProtocol.ts
var JSON_RPC_PARSE_ERROR = -32700;

var JSON_RPC_INTERNAL_ERROR = -32603;

var AHP_SESSION_NOT_FOUND = -32001;

var AHP_PROVIDER_NOT_FOUND = -32002;

var AHP_UNSUPPORTED_PROTOCOL_VERSION = -32005;

var AHP_AUTH_REQUIRED = -32007;

function isJsonRpcRequest(msg) {
  return "method" in msg && "id" in msg;
}

function isJsonRpcNotification(msg) {
  return "method" in msg && !("id" in msg);
}

var ProtocolError = class extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
};
export { isJsonRpcRequest, isJsonRpcNotification, JSON_RPC_PARSE_ERROR, JSON_RPC_INTERNAL_ERROR, AHP_SESSION_NOT_FOUND, AHP_PROVIDER_NOT_FOUND, AHP_UNSUPPORTED_PROTOCOL_VERSION, AHP_AUTH_REQUIRED, ProtocolError };
