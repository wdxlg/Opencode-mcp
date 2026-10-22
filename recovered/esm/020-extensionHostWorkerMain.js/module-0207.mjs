// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/remote/common/remoteAgentService.ts
import { createDecorator } from "./module-0038.mjs";
import { timeout } from "./module-0034.mjs";


// src/vs/workbench/services/remote/common/remoteAgentService.ts
var IRemoteAgentService = createDecorator("remoteAgentService");

var remoteConnectionLatencyMeasurer = new class {
  constructor() {
    this.maxSampleCount = 5;
    this.sampleDelay = 2e3;
    this.initial = [];
    this.maxInitialCount = 3;
    this.average = [];
    this.maxAverageCount = 100;
    this.highLatencyMultiple = 2;
    this.highLatencyMinThreshold = 500;
    this.highLatencyMaxThreshold = 1500;
    this.lastMeasurement = void 0;
  }
  get latency() {
    return this.lastMeasurement;
  }
  async measure(remoteAgentService) {
    let currentLatency = Infinity;
    for (let i = 0; i < this.maxSampleCount; i++) {
      const rtt = await remoteAgentService.getRoundTripTime();
      if (rtt === void 0) {
        return void 0;
      }
      currentLatency = Math.min(
        currentLatency,
        rtt / 2
        /* we want just one way, not round trip time */
      );
      await timeout(this.sampleDelay);
    }
    this.average.push(currentLatency);
    if (this.average.length > this.maxAverageCount) {
      this.average.shift();
    }
    let initialLatency = void 0;
    if (this.initial.length < this.maxInitialCount) {
      this.initial.push(currentLatency);
    } else {
      initialLatency = this.initial.reduce((sum, value) => sum + value, 0) / this.initial.length;
    }
    this.lastMeasurement = {
      initial: initialLatency,
      current: currentLatency,
      average: this.average.reduce((sum, value) => sum + value, 0) / this.average.length,
      high: (() => {
        if (typeof initialLatency === "undefined") {
          return false;
        }
        if (currentLatency > this.highLatencyMaxThreshold) {
          return true;
        }
        if (currentLatency > this.highLatencyMinThreshold && currentLatency > initialLatency * this.highLatencyMultiple) {
          return true;
        }
        return false;
      })()
    };
    return this.lastMeasurement;
  }
}();
export { IRemoteAgentService, remoteConnectionLatencyMeasurer };
