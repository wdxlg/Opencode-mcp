// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/common/telemetryIpc.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/telemetry/common/telemetryIpc.ts
var TelemetryAppenderClient;

var init_telemetryIpc = __esm({
  "src/vs/platform/telemetry/common/telemetryIpc.ts"() {
    TelemetryAppenderClient = class {
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
  }
});
export { TelemetryAppenderClient, init_telemetryIpc };
