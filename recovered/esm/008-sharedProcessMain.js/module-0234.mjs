// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/common/tunnelAgentHost.ts
import { createDecorator } from "./module-0042.mjs";


// src/vs/platform/agentHost/common/tunnelAgentHost.ts
var ITunnelAgentHostService = createDecorator("tunnelAgentHostService");

var TUNNEL_AGENT_HOST_CHANNEL = "tunnelAgentHost";

var TUNNEL_MIN_PROTOCOL_VERSION = 5;

var TUNNEL_AGENT_HOST_PORT = 31546;

var TUNNEL_LAUNCHER_LABEL = "vscode-server-launcher";

var TUNNEL_ADDRESS_PREFIX = "tunnel:";

var TUNNEL_GATEWAY_SELECT_PATH = "/agent-host/select";

var TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION = 6;

var PROTOCOL_VERSION_TAG_PREFIX = "protocolv";

var TunnelTags = class {
  constructor(value) {
    this.value = value;
    this.protocolVersion = 2;
    if (value) {
      let protocolVersion;
      let name;
      for (const tag of value) {
        if (tag.startsWith(PROTOCOL_VERSION_TAG_PREFIX)) {
          const parsed = Number(tag.slice(PROTOCOL_VERSION_TAG_PREFIX.length));
          if (!isNaN(parsed)) {
            protocolVersion = parsed;
          }
        } else if (!tag.startsWith("_") && tag !== TUNNEL_LAUNCHER_LABEL && !name) {
          name = tag;
        }
      }
      if (protocolVersion !== void 0) {
        this.protocolVersion = protocolVersion;
      }
      if (name !== void 0) {
        this.name = name;
      }
    }
  }
};

var TunnelGatewayProtocolError = class extends Error {
};

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTunnelGatewayEndpoint(value, index) {
  if (!isPlainObject(value)) {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} is not an object`);
  }
  const { type: type2, pid, instanceId, quality, tunnelName, endpointKind, endpointLabel } = value;
  if (type2 !== "editor" && type2 !== "standalone") {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "type"`);
  }
  if (typeof pid !== "number") {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "pid"`);
  }
  if (typeof instanceId !== "string" || !instanceId) {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "instanceId"`);
  }
  if (quality !== void 0 && typeof quality !== "string") {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "quality"`);
  }
  if (tunnelName !== void 0 && typeof tunnelName !== "string") {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "tunnelName"`);
  }
  if (endpointKind !== "tcp" && endpointKind !== "socket") {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "endpointKind"`);
  }
  if (typeof endpointLabel !== "string" || !endpointLabel) {
    throw new TunnelGatewayProtocolError(`Gateway inventory endpoint at index ${index} has an invalid "endpointLabel"`);
  }
  return { type: type2, pid, instanceId, quality, tunnelName, endpointKind, endpointLabel };
}

function parseTunnelGatewayInventory(json) {
  const parsed = JSON.parse(json);
  if (!isPlainObject(parsed)) {
    throw new TunnelGatewayProtocolError("Gateway inventory message is not an object");
  }
  const { userDataPath, endpoints, delegatedInstanceId } = parsed;
  if (typeof userDataPath !== "string" || !userDataPath) {
    throw new TunnelGatewayProtocolError('Gateway inventory message has an invalid "userDataPath"');
  }
  if (!Array.isArray(endpoints)) {
    throw new TunnelGatewayProtocolError('Gateway inventory message has an invalid "endpoints"');
  }
  if (delegatedInstanceId !== void 0 && (typeof delegatedInstanceId !== "string" || !delegatedInstanceId)) {
    throw new TunnelGatewayProtocolError('Gateway inventory message has an invalid "delegatedInstanceId"');
  }
  const parsedEndpoints = endpoints.map((e, i) => parseTunnelGatewayEndpoint(e, i));
  if (delegatedInstanceId === void 0) {
    return { userDataPath, endpoints: parsedEndpoints };
  }
  return { userDataPath, endpoints: parsedEndpoints, delegatedInstanceId };
}

function parseTunnelGatewaySelectionResponse(json) {
  const parsed = JSON.parse(json);
  if (!isPlainObject(parsed) || typeof parsed.ok !== "boolean") {
    throw new TunnelGatewayProtocolError("Gateway selection acknowledgement is not a valid response");
  }
  if (!parsed.ok) {
    const error = typeof parsed.error === "string" ? parsed.error : "Gateway selection failed";
    return { ok: false, error };
  }
  const selected = parsed.selected;
  if (!isPlainObject(selected) || selected.type !== "editor" && selected.type !== "standalone" || typeof selected.instanceId !== "string" || !selected.instanceId || selected.role !== "primary" || selected.lifecycle !== "external" && selected.lifecycle !== "managed") {
    throw new TunnelGatewayProtocolError('Gateway selection acknowledgement has an invalid "selected" payload');
  }
  return {
    ok: true,
    selected: {
      serverType: selected.type,
      instanceId: selected.instanceId,
      role: "primary",
      lifecycle: selected.lifecycle
    }
  };
}

var TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME = "TunnelGatewaySelectionRejectedError";

function createTunnelGatewaySelectionRejectedError(message) {
  const error = new Error(message);
  error.name = TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME;
  return error;
}

var TUNNEL_NOT_FOUND_ERROR_NAME = "TunnelNotFoundError";

var TunnelNotFoundError = class extends Error {
  constructor(tunnelId) {
    super(`[TunnelAgentHost] Tunnel ${tunnelId} not found`);
    this.name = TUNNEL_NOT_FOUND_ERROR_NAME;
  }
};

var ITunnelAgentHostMainService = createDecorator("tunnelAgentHostMainService");

var TUNNEL_HOST_CHANNEL = "tunnelHost";

var TUNNEL_HOST_LOG_ID = "tunnelHostService";

var ITunnelAgentHostHostingService = createDecorator("tunnelAgentHostHostingService");
export { isPlainObject, parseTunnelGatewayEndpoint, parseTunnelGatewayInventory, parseTunnelGatewaySelectionResponse, createTunnelGatewaySelectionRejectedError, ITunnelAgentHostService, TUNNEL_AGENT_HOST_CHANNEL, TUNNEL_MIN_PROTOCOL_VERSION, TUNNEL_AGENT_HOST_PORT, TUNNEL_LAUNCHER_LABEL, TUNNEL_ADDRESS_PREFIX, TUNNEL_GATEWAY_SELECT_PATH, TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION, PROTOCOL_VERSION_TAG_PREFIX, TunnelTags, TunnelGatewayProtocolError, TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME, TUNNEL_NOT_FOUND_ERROR_NAME, TunnelNotFoundError, ITunnelAgentHostMainService, TUNNEL_HOST_CHANNEL, TUNNEL_HOST_LOG_ID, ITunnelAgentHostHostingService };
