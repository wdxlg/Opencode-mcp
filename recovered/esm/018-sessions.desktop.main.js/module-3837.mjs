// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/common/remoteAgentEnvironmentChannel.ts
import { URI } from "./module-0032.mjs";
import { revive } from "./module-0265.mjs";


// src/vs/workbench/services/remote/common/remoteAgentEnvironmentChannel.ts
var RemoteExtensionEnvironmentChannelClient = class {
  static async getEnvironmentData(channel, remoteAuthority, profile) {
    const args2 = {
      remoteAuthority,
      profile
    };
    const data = await channel.call("getEnvironmentData", args2);
    const reconnectionGraceTime = typeof data.reconnectionGraceTime === "number" && data.reconnectionGraceTime >= 0 ? data.reconnectionGraceTime : 108e5 /* ReconnectionGraceTime */;
    return {
      pid: data.pid,
      connectionToken: data.connectionToken,
      appRoot: URI.revive(data.appRoot),
      execPath: data.execPath,
      tmpDir: URI.revive(data.tmpDir),
      settingsPath: URI.revive(data.settingsPath),
      mcpResource: URI.revive(data.mcpResource),
      logsPath: URI.revive(data.logsPath),
      extensionHostLogsPath: URI.revive(data.extensionHostLogsPath),
      globalStorageHome: URI.revive(data.globalStorageHome),
      workspaceStorageHome: URI.revive(data.workspaceStorageHome),
      localHistoryHome: URI.revive(data.localHistoryHome),
      userHome: URI.revive(data.userHome),
      os: data.os,
      arch: data.arch,
      marks: data.marks,
      useHostProxy: data.useHostProxy,
      profiles: revive(data.profiles),
      isUnsupportedGlibc: data.isUnsupportedGlibc,
      reconnectionGraceTime
    };
  }
  static async getExtensionHostExitInfo(channel, remoteAuthority, reconnectionToken) {
    const args2 = {
      remoteAuthority,
      reconnectionToken
    };
    return channel.call("getExtensionHostExitInfo", args2);
  }
  static getDiagnosticInfo(channel, options3) {
    return channel.call("getDiagnosticInfo", options3);
  }
  static updateTelemetryLevel(channel, telemetryLevel) {
    return channel.call("updateTelemetryLevel", { telemetryLevel });
  }
  static logTelemetry(channel, eventName, data) {
    return channel.call("logTelemetry", { eventName, data });
  }
  static flushTelemetry(channel) {
    return channel.call("flushTelemetry");
  }
  static async ping(channel) {
    await channel.call("ping");
  }
};
export { RemoteExtensionEnvironmentChannelClient };
