// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
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
export { TelemetryAppenderChannel };
