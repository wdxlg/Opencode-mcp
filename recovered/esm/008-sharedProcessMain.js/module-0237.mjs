// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remoteTunnel/common/remoteTunnel.ts
import { createDecorator } from "./module-0042.mjs";
import { localize } from "./module-0007.mjs";


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

var TUNNEL_NAME_PLACEHOLDER = "remote-machine";

function tunnelNameFromHostname(hostname3) {
  let cleaned = "";
  for (const char of Array.from(hostname3).slice(0, 60)) {
    if (char === "-" || char === "_" || char === " ") {
      cleaned += "-";
    } else if (/[0-9a-zA-Z]/.test(char)) {
      cleaned += char;
    }
  }
  const trimmed = cleaned.replace(/^-+|-+$/g, "");
  const name = trimmed.length < 2 ? TUNNEL_NAME_PLACEHOLDER : trimmed;
  return name.toLowerCase().substring(0, MAX_TUNNEL_NAME_LENGTH);
}

function normalizeTunnelName(name) {
  return name.replace(/^-+/g, "").replace(/[^\w-]/g, "").substring(0, MAX_TUNNEL_NAME_LENGTH).toLowerCase();
}

var LOG_ID = "remoteTunnelService";

var LOGGER_NAME = localize(3219, null);
export { tunnelNameFromHostname, normalizeTunnelName, IRemoteTunnelService, INACTIVE_TUNNEL_MODE, TunnelStates, CONFIGURATION_KEY_PREFIX, CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREVENT_SLEEP, MAX_TUNNEL_NAME_LENGTH, TUNNEL_NAME_PLACEHOLDER, LOG_ID, LOGGER_NAME };
