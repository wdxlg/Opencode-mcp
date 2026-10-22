// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/telemetryIpc.ts



// src/vs/platform/telemetry/common/telemetryIpc.ts
var TelemetryAppenderClient = class {
  constructor(channel) {
    this.channel = channel;
  }
  log(eventName, data) {
    this.channel.call("log", { eventName, data }).then(void 0, (err) => `Failed to log telemetry: ${console.warn(err)}`);
    return Promise.resolve(null);
  }
  flush() {
    return Promise.resolve();
  }
};
export { TelemetryAppenderClient };
