// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remoteTunnel/common/tunnelMachineStatus.ts
import { removeAnsiEscapeCodes } from "./module-0022.mjs";


// src/vs/platform/remoteTunnel/common/tunnelMachineStatus.ts
var TUNNEL_MACHINE_STATUS_PREFIX = "__VSCODE_CLI_STATUS__";

function parseTunnelMachineStatus(message) {
  const cleanedMessage = removeAnsiEscapeCodes(message);
  if (!cleanedMessage.startsWith(TUNNEL_MACHINE_STATUS_PREFIX)) {
    return void 0;
  }
  let value;
  try {
    value = JSON.parse(cleanedMessage.slice(TUNNEL_MACHINE_STATUS_PREFIX.length));
  } catch {
    return void 0;
  }
  if (!isRecord(value) || !isString2(value.type)) {
    return void 0;
  }
  if (value.type === "connected") {
    if (!isString2(value.tunnelName) || typeof value.isAttached !== "boolean" || value.tunnelId !== void 0 && !isString2(value.tunnelId) || value.link !== void 0 && !isString2(value.link) || value.domain !== void 0 && !isString2(value.domain) || value.link === void 0 !== (value.domain === void 0)) {
      return void 0;
    }
    return {
      type: "connected",
      tunnelName: value.tunnelName,
      ...value.tunnelId === void 0 ? {} : { tunnelId: value.tunnelId },
      isAttached: value.isAttached,
      ...value.link === void 0 ? {} : { link: value.link, domain: value.domain }
    };
  }
  if (value.type === "tokenError" && isString2(value.message)) {
    return { type: "tokenError", message: value.message };
  }
  return void 0;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString2(value) {
  return typeof value === "string";
}
export { parseTunnelMachineStatus, isRecord, isString2, TUNNEL_MACHINE_STATUS_PREFIX };
