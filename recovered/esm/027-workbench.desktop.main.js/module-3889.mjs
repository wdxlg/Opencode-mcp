// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/remoteTunnel/common/remoteTunnel.ts
import { createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/remoteTunnel/common/remoteTunnel.ts
var IRemoteTunnelService = createDecorator("IRemoteTunnelService");

var INACTIVE_TUNNEL_MODE = { active: false };

var TunnelStates;

((TunnelStates2) => {
  TunnelStates2.disconnected = (onTokenFailed) => ({ type: "disconnected", onTokenFailed });
  TunnelStates2.connected = (info, serviceInstallFailed) => ({ type: "connected", info, serviceInstallFailed });
  TunnelStates2.connecting = (progress) => ({ type: "connecting", progress });
  TunnelStates2.uninitialized = { type: "uninitialized" };
})(TunnelStates || (TunnelStates = {}));

var CONFIGURATION_KEY_PREFIX = "remote.tunnels.access";

var CONFIGURATION_KEY_HOST_NAME = CONFIGURATION_KEY_PREFIX + ".hostNameOverride";

var CONFIGURATION_KEY_PREVENT_SLEEP = CONFIGURATION_KEY_PREFIX + ".preventSleep";

var MAX_TUNNEL_NAME_LENGTH = 20;

var LOG_ID = "remoteTunnelService";

var LOGGER_NAME = localize(3219, null);
export { IRemoteTunnelService, INACTIVE_TUNNEL_MODE, TunnelStates, CONFIGURATION_KEY_PREFIX, CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREVENT_SLEEP, MAX_TUNNEL_NAME_LENGTH, LOG_ID, LOGGER_NAME };
