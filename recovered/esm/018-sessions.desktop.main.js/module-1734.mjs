// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/tunnelAgentHost.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/tunnelAgentHost.ts
var ITunnelAgentHostService = createDecorator("tunnelAgentHostService");

var TUNNEL_AGENT_HOST_CHANNEL = "tunnelAgentHost";

var TunnelAgentHostsSettingId = "chat.remoteAgentTunnels";

var TUNNEL_ADDRESS_PREFIX = "tunnel:";

var TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION = 6;

var TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME = "TunnelGatewaySelectionRejectedError";

function isTunnelGatewaySelectionRejectedError(error) {
  return error instanceof Error && error.name === TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME;
}

var TUNNEL_NOT_FOUND_ERROR_NAME = "TunnelNotFoundError";

function isTunnelNotFoundError(error) {
  return error instanceof Error && error.name === TUNNEL_NOT_FOUND_ERROR_NAME;
}

var ITunnelAgentHostMainService = createDecorator("tunnelAgentHostMainService");

var TUNNEL_HOST_CHANNEL = "tunnelHost";

var TUNNEL_HOST_LOG_ID = "tunnelHostService";

function isTunnelHosted(sharingInfo, tunnel) {
  if (!sharingInfo) {
    return false;
  }
  return sharingInfo.tunnelId !== void 0 ? sharingInfo.tunnelId === tunnel.tunnelId : sharingInfo.tunnelName === tunnel.name;
}

var ITunnelAgentHostHostingService = createDecorator("tunnelAgentHostHostingService");
export { isTunnelGatewaySelectionRejectedError, isTunnelNotFoundError, isTunnelHosted, ITunnelAgentHostService, TUNNEL_AGENT_HOST_CHANNEL, TunnelAgentHostsSettingId, TUNNEL_ADDRESS_PREFIX, TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION, TUNNEL_GATEWAY_SELECTION_REJECTED_ERROR_NAME, TUNNEL_NOT_FOUND_ERROR_NAME, ITunnelAgentHostMainService, TUNNEL_HOST_CHANNEL, TUNNEL_HOST_LOG_ID, ITunnelAgentHostHostingService };
