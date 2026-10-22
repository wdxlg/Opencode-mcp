// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/telemetry/common/telemetryIpc.ts



// src/vs/platform/telemetry/common/telemetryIpc.ts
var TelemetryAppenderChannel = class {
  constructor(appenders) {
    this.appenders = appenders;
  }
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command, { eventName, data }) {
    this.appenders.forEach((a) => a.log(eventName, data ?? {}));
    return Promise.resolve(null);
  }
};

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
export { TelemetryAppenderChannel, TelemetryAppenderClient };
